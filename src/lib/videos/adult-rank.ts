/**
 * Adult shelf / tag ranking. Reddit metadata, extreme tags, marks, and
 * recency all contribute — tube keyword volume alone must not dominate.
 */

import type { LibraryVideo } from "./types";
import { adultTagRankBoost } from "./adult-fetishes";
import { adultProviderKind } from "./adult-filter";

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
    for (const tag of ctx.tags[video.id] ?? []) {
      if (tag.startsWith("provider-") || tag.startsWith("format-") || tag.length < 3) continue;
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
  return videos
    .map((video) => ({ video, score: scoreAdultVideo(video, ctx) }))
    .sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt)
    .map(({ video }) => video);
}
