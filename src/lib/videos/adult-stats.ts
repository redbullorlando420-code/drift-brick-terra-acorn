/**
 * Adult Stats snapshot + CSV/JSON export (local-only counts).
 */

import type { Folder, LibraryVideo } from "./types";
import { ADULT_SOURCE_FILTERS, adultProviderKind, countAdultBySource } from "./adult-filter";
import { rankAdultTags, type AdultRankContext } from "./adult-rank";

export type AdultStatsSnapshot = {
  at: number;
  titles: number;
  sources: Record<string, number>;
  topTags: Array<{ tag: string; count: number; score: number }>;
  fetishTags: Array<{ tag: string; count: number; score: number }>;
  redditTags: Array<{ tag: string; count: number; score: number }>;
  markedTitles: number;
  totalMarks: number;
};

export function buildAdultStatsSnapshot(
  videos: LibraryVideo[],
  folders: Folder[],
  tags: Record<string, string[]>,
  ctx: Omit<AdultRankContext, "tags">,
): AdultStatsSnapshot {
  const adultIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
  const adultVideos = videos.filter(
    (video) => adultIds.has(video.folderId) || Boolean(adultProviderKind(video)),
  );
  const rankCtx: AdultRankContext = { ...ctx, tags };
  const ranked = rankAdultTags(adultVideos, rankCtx, 120);
  return {
    at: Date.now(),
    titles: adultVideos.length,
    sources: countAdultBySource(adultVideos),
    topTags: ranked.slice(0, 60),
    fetishTags: ranked.filter((row) => row.tag.startsWith("fetish-") || !row.tag.startsWith("source-")).slice(0, 40),
    redditTags: ranked.filter((row) => row.tag.includes("reddit") || row.tag.startsWith("sub-")).slice(0, 40),
    markedTitles: adultVideos.filter((video) => (ctx.cameCounts[video.id] ?? 0) > 0).length,
    totalMarks: adultVideos.reduce((sum, video) => sum + (ctx.cameCounts[video.id] ?? 0), 0),
  };
}

export function adultStatsToCsv(snapshot: AdultStatsSnapshot): string {
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows: Array<Array<string | number>> = [
    ["metric", "key", "count", "score"],
    ["titles", "all", snapshot.titles, ""],
    ["marked_titles", "i-cummed", snapshot.markedTitles, ""],
    ["total_marks", "i-cummed", snapshot.totalMarks, ""],
  ];
  for (const [key, count] of Object.entries(snapshot.sources)) {
    rows.push(["source", key, count, ""]);
  }
  for (const row of snapshot.topTags) rows.push(["tag", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.redditTags) rows.push(["reddit_tag", row.tag, row.count, row.score.toFixed(2)]);
  return rows.map((row) => row.map(quote).join(",")).join("\n");
}

export function downloadTextFile(body: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAdultStats(snapshot: AdultStatsSnapshot, format: "json" | "csv") {
  const stamp = new Date(snapshot.at).toISOString().slice(0, 10);
  if (format === "json") {
    downloadTextFile(JSON.stringify(snapshot, null, 2), `reelcase-adult-stats-${stamp}.json`, "application/json");
    return;
  }
  downloadTextFile(adultStatsToCsv(snapshot), `reelcase-adult-stats-${stamp}.csv`, "text/csv;charset=utf-8");
}

export const ADULT_SOURCE_LABELS = ADULT_SOURCE_FILTERS;
