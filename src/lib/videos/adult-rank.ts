/**
 * Adult shelf / tag ranking. Reddit metadata, extreme tags, marks, and
 * recency all contribute — tube keyword volume alone must not dominate.
 */

import type { LibraryVideo } from "./types";
import { adultTagRankBoost } from "./adult-fetishes";
import { adultProviderKind } from "./adult-filter";
import { expandedAdultTags, isAdultGenreTag, isAdultMetaTaxonomyTag } from "./adult-taxonomy";

/** Stable personal-interest tags for the main Adults browser. Sources and
 * creators already have dedicated filters; raw API keyword dumps stay
 * searchable without flooding the browse chips. */
export function isAdultInterestTag(tag: string): boolean {
  const clean = tag.trim().toLowerCase();
  // Parser and transport fragments remain searchable on individual cards, but
  // are never meaningful preferences or ranked Adult discovery topics.
  if (/^(?:fetish-)?(?:https?|www|com|watch|comments|reddit|redgifs|eporner|redtube)(?:-|$)/.test(clean) || /(?:https?|www|\.com)/.test(clean)) return false;
  return clean.startsWith("fetish-") || isAdultGenreTag(clean);
}

export type AdultRankContext = {
  tags: Record<string, string[]>;
  favorites: Record<string, boolean | number>;
  likes: Record<string, boolean | number>;
  cameCounts: Record<string, number>;
  viewCounts?: Record<string, number>;
  ratingOf: (id: string) => number;
  tagIsHearted?: (tag: string) => boolean;
  tagHasHeartHistory?: (tag: string) => boolean;
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
 * A single highly-rated title must not turn its incidental keyword into a
 * leading discovery rail. Tags remain searchable on the title, but the ranked
 * browser waits for independent support before promoting a tag.
 */
export const ADULT_RANKED_TAG_MIN_COUNT = 2;
export const ADULT_TOP_TAG_RAIL_MIN_COUNT = 4;

function stabilizedTagScore(
  engagement: number,
  count: number,
  recency: number,
  boost: number,
  providerCoverage = 1,
): number {
  // Shrink sparse-tag engagement toward the neutral pull signal. The support
  // curve reaches half strength at four titles and keeps count meaningful even
  // when a one-off has a strong personal rating.
  const support = count / (count + 4);
  const stableEngagement = 1 + (engagement - 1) * support;
  return (
    stableEngagement * 12
    + Math.log2(count + 1) * 2.4
    + recency * 4 * support
    + boost * support
    + Math.min(4, providerCoverage) * 1.25 * support
  );
}

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
    && !/^(?:adult|video|photo|live|cam|image|explicit|https?|www|com|eporner|redtube|reddit|chaturbate|myfreecams|booru|redgifs)$/.test(tag)
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
    for (const tag of expandedAdultTags(itemTags)) {
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
        score: stabilizedTagScore(engagement, row.count, recency, adultTagRankBoost(tag)) + (ctx.tagIsHearted?.(tag) ? 48 : 0) + (ctx.tagHasHeartHistory?.(tag) ? 6 : 0),
      };
    })
    .filter((row) => row.count >= ADULT_RANKED_TAG_MIN_COUNT)
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
  const offsets = new Map<string, number>();
  while (providers.length) {
    for (let index = providers.length - 1; index >= 0; index -= 1) {
      const provider = providers[index]!;
      const bucket = byProvider.get(provider)!;
      const offset = offsets.get(provider) ?? 0;
      const next = bucket[offset];
      if (next) ordered.push(next.video);
      offsets.set(provider, offset + 1);
      if (offset + 1 >= bucket.length) providers.splice(index, 1);
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
    for (const tag of expandedAdultTags(itemTags)) {
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
      return {
        tag,
        count: row.count,
        score: stabilizedTagScore(engagement, row.count, recency, 0, row.providers.size) + (ctx.tagIsHearted?.(tag) ? 48 : 0) + (ctx.tagHasHeartHistory?.(tag) ? 6 : 0),
      };
    })
    .filter((row) => row.count >= ADULT_RANKED_TAG_MIN_COUNT)
    .sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}
