/**
 * Adult shelf / tag ranking. Reddit metadata, extreme tags, marks, and
 * recency all contribute — tube keyword volume alone must not dominate.
 */

import type { LibraryVideo } from "./types";
import { adultTagRankBoost } from "./adult-fetishes";
import { adultProviderKind } from "./adult-filter";
import { adultTaxonomyTags, isAdultGenreTag, isAdultMetaTaxonomyTag } from "./adult-taxonomy";

/** Stable personal-interest tags for the main Adults browser. Sources and
 * creators already have dedicated filters; raw API keyword dumps stay
 * searchable without flooding the browse chips. */
export function isAdultInterestTag(tag: string): boolean {
  return tag.startsWith("fetish-") || isAdultGenreTag(tag);
}

export type AdultRankContext = {
  tags: Record<string, string[]>;
  favorites: Record<string, boolean | number>;
  likes: Record<string, boolean | number>;
  cameCounts: Record<string, number>;
  viewCounts?: Record<string, number>;
  ratingOf: (id: string) => number;
};

function redditSignal(tags: string[]): number {
  let score = 0;
  for (const tag of tags) {
    if (tag.startsWith("source-reddit") || tag.startsWith("sub-")) score += 2;
    if (tag === "reddit-photo" || tag === "reddit-video") score += 1.5;
    if (tag.startsWith("fetish-")) score += 0.6;
  }
  return score;
}

export function scoreAdultVideo(video: LibraryVideo, ctx: AdultRankContext): number {
  const itemTags = ctx.tags[video.id] ?? [];
  const rating = ctx.ratingOf(video.id);
  const came = Math.min(24, (ctx.cameCounts[video.id] ?? 0) * 7);
  const views = Math.min(8, (ctx.viewCounts?.[video.id] ?? 0) * 1.2);
  const boost = itemTags.reduce((sum, tag) => sum + adultTagRankBoost(tag), 0);
  const recency = Math.max(0, 1 - (Date.now() - video.addedAt) / (21 * 86_400_000)) * 8;
  const reddit = video.remote?.kind === "reddit" ? 6 + redditSignal(itemTags) : redditSignal(itemTags);
  return (
    rating * 14
    + (ctx.favorites[video.id] ? 10 : 0)
    + (ctx.likes[video.id] ? 6 : 0)
    + came
    + views
    + boost
    + recency
    + reddit
    + Math.min(6, itemTags.length) * 0.35
  );
}

export type AdultTagRankRow = { tag: string; score: number; count: number };

/**
 * Metadata stays searchable and useful to recommendations without becoming an
 * unmanageable filter list.  Provider/source, creator and mechanical ingest
 * labels remain dedicated facets; the remaining verified provider metadata is
 * scored with the same personal signals as curated interests.
 */
export function isAdultMetaTag(tag: string): boolean {
  return isAdultMetaTaxonomyTag(tag) || (Boolean(tag)
    && !isAdultInterestTag(tag)
    && !tag.startsWith("source-")
    && !tag.startsWith("creator-")
    && !tag.startsWith("auto-")
    && !tag.startsWith("sub-")
    && !tag.startsWith("provider-")
    && !tag.startsWith("format-")
    && !/^(?:adult|video|photo|live|cam|image|explicit|https?|www|com|eporner|redtube|reddit|chaturbate|camsoda|myfreecams|booru|redgifs)$/.test(tag)
    && tag.length >= 3
    && !/(?:https?|\bwww\b|redgifs|eporner|redtube)/.test(tag));
}

export function rankAdultTags(
  videos: LibraryVideo[],
  ctx: AdultRankContext,
  limit = 64,
): AdultTagRankRow[] {
  const rows = new Map<string, { total: number; count: number; recent: number }>();
  for (const video of videos) {
    const rating = ctx.ratingOf(video.id);
    const signal = Math.max(
      rating,
      ctx.favorites[video.id] ? 4 : 0,
      ctx.likes[video.id] ? 3 : 0,
      Math.min(5, ctx.cameCounts[video.id] ?? 0),
      1,
    );
    const kind = adultProviderKind(video);
    const itemTags = ctx.tags[video.id] ?? [];
    for (const tag of new Set([...itemTags, ...itemTags.flatMap(adultTaxonomyTags)])) {
      if (!isAdultInterestTag(tag)) continue;
      const row = rows.get(tag) ?? { total: 0, count: 0, recent: 0 };
      const redditBoost = kind === "reddit" && (tag.startsWith("source-reddit") || tag.startsWith("sub-") || tag.startsWith("fetish-")) ? 2 : 0;
      row.total += signal + adultTagRankBoost(tag) + redditBoost;
      row.count += 1;
      row.recent = Math.max(row.recent, video.addedAt);
      rows.set(tag, row);
    }
  }
  const now = Date.now();
  return [...rows.entries()]
    .map(([tag, row]) => {
      const engagement = (row.total + 9) / (row.count + 3);
      const recency = Math.max(0, 1 - (now - row.recent) / (30 * 86_400_000));
      return {
        tag,
        count: row.count,
        score: engagement * 12 + row.count * 0.35 + recency * 4 + adultTagRankBoost(tag),
      };
    })
    .sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

export function sortAdultVideos<T extends LibraryVideo>(videos: T[], ctx: AdultRankContext): T[] {
  // Score once per title — comparator-time scoring was O(n log n) re-walks over tags.
  const scored = videos
    .map((video) => ({ video, score: scoreAdultVideo(video, ctx) }))
    .sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt);
  // A broad catalog should not feel like one provider's keyword page. Keep
  // the score order inside each provider, then round-robin the providers for
  // the shared rails. Personal engagement still determines each provider's
  // next title.
  const byProvider = new Map<string, typeof scored>();
  for (const item of scored) {
    const provider = adultProviderKind(item.video) || "other";
    const bucket = byProvider.get(provider) ?? [];
    bucket.push(item);
    byProvider.set(provider, bucket);
  }
  const providers = [...byProvider.entries()]
    .sort(([, a], [, b]) => (b[0]?.score ?? 0) - (a[0]?.score ?? 0))
    .map(([provider]) => provider);
  const ordered: T[] = [];
  while (providers.length) {
    for (let index = providers.length - 1; index >= 0; index -= 1) {
      const provider = providers[index]!;
      const next = byProvider.get(provider)?.shift();
      if (next) ordered.push(next.video);
      if (!byProvider.get(provider)?.length) providers.splice(index, 1);
    }
  }
  return ordered;
}

export function rankAdultMetaTags(
  videos: LibraryVideo[],
  ctx: AdultRankContext,
  limit = 64,
): AdultTagRankRow[] {
  const rows = new Map<string, { total: number; count: number; recent: number; providers: Set<string> }>();
  for (const video of videos) {
    const engagement = Math.max(
      ctx.ratingOf(video.id),
      ctx.favorites[video.id] ? 4 : 0,
      ctx.likes[video.id] ? 3 : 0,
      Math.min(5, ctx.cameCounts[video.id] ?? 0),
      1,
    );
    const provider = adultProviderKind(video) || "other";
    const itemTags = ctx.tags[video.id] ?? [];
    for (const tag of new Set([...itemTags, ...itemTags.flatMap(adultTaxonomyTags)])) {
      if (!isAdultMetaTag(tag)) continue;
      const row = rows.get(tag) ?? { total: 0, count: 0, recent: 0, providers: new Set<string>() };
      row.total += engagement;
      row.count += 1;
      row.recent = Math.max(row.recent, video.addedAt);
      row.providers.add(provider);
      rows.set(tag, row);
    }
  }
  const now = Date.now();
  return [...rows.entries()]
    .map(([tag, row]) => {
      const engagement = (row.total + 6) / (row.count + 2);
      const recency = Math.max(0, 1 - (now - row.recent) / (30 * 86_400_000));
      // A tag that appears across providers is a stronger recommendation seed
      // than an API-specific keyword dump.
      return { tag, count: row.count, score: engagement * 10 + row.count * 0.25 + recency * 3 + Math.min(4, row.providers.size) * 1.5 };
    })
    .sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}
