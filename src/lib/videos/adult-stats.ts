/**
 * Adult Stats snapshot + CSV/JSON export (local-only counts).
 */

import type { Folder, LibraryVideo } from "./types";
import { ADULT_SOURCE_FILTERS, adultProviderKind, countAdultBySource } from "./adult-filter";
import { rankAdultMetaTags, rankAdultTags, type AdultRankContext } from "./adult-rank";
import { adultTaxonomyLabel, isAdultGenreTag } from "./adult-taxonomy";
import { ADULT_PULL_PROVIDERS, adultRemoteLabel } from "./adult-sites";

export type AdultStatsSnapshot = {
  at: number;
  titles: number;
  sources: Record<string, number>;
  providerMix: Array<{ provider: string; label: string; titles: number; share: number; status: "active" | "empty" }>;
  genres: Array<{ tag: string; label: string; count: number; score: number }>;
  topTags: Array<{ tag: string; count: number; score: number }>;
  metaTags: Array<{ tag: string; count: number; score: number }>;
  fetishTags: Array<{ tag: string; count: number; score: number }>;
  redditTags: Array<{ tag: string; count: number; score: number }>;
  adultTagCoverage: { tagged: number; missing: number; share: number };
  tagConnections: Array<{ left: string; right: string; count: number }>;
  noisyTagAssignments: number;
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
  const matchedAdults = videos.filter(
    (video) => adultIds.has(video.folderId) || Boolean(adultProviderKind(video)),
  );
  const adultVideos = [...new Map(matchedAdults.map((video) => [video.id, video])).values()];
  const rankCtx: AdultRankContext = { ...ctx, tags };
  const ranked = rankAdultTags(adultVideos, rankCtx, 120);
  const metaRanked = rankAdultMetaTags(adultVideos, rankCtx, 120);
  const sources = countAdultBySource(adultVideos);
  const providerMix = ADULT_PULL_PROVIDERS.map((provider) => ({
    provider,
    label: adultRemoteLabel(provider),
    titles: sources[provider] ?? 0,
    share: adultVideos.length ? (sources[provider] ?? 0) / adultVideos.length : 0,
    status: (sources[provider] ?? 0) ? "active" as const : "empty" as const,
  })).sort((a, b) => b.titles - a.titles || a.label.localeCompare(b.label));
  const connections = new Map<string, number>();
  let noisyTagAssignments = 0;
  for (const video of adultVideos) {
    const useful = [...new Set((tags[video.id] ?? []).filter((tag) => isAdultGenreTag(tag) || tag.startsWith("fetish-")).filter((tag) => !/(?:https?|www|\.com|redgifs|eporner|redtube|comments|watch)/.test(tag)))].slice(0, 8).sort();
    for (const tag of tags[video.id] ?? []) if (/(?:https?|www|\.com|redgifs|eporner|redtube|comments|watch)/.test(tag)) noisyTagAssignments += 1;
    for (let left = 0; left < useful.length; left += 1) for (let right = left + 1; right < useful.length; right += 1) {
      const key = `${useful[left]}\u0000${useful[right]}`;
      connections.set(key, (connections.get(key) ?? 0) + 1);
    }
  }
  const adultTagged = adultVideos.filter((video) => (tags[video.id] ?? []).includes("adult")).length;
  return {
    at: Date.now(),
    titles: adultVideos.length,
    sources,
    providerMix,
    genres: ranked.filter((row) => isAdultGenreTag(row.tag)).slice(0, 40).map((row) => ({ ...row, label: adultTaxonomyLabel(row.tag) })),
    topTags: ranked.slice(0, 60),
    metaTags: metaRanked.slice(0, 60),
    fetishTags: ranked.filter((row) => row.tag.startsWith("fetish-")).slice(0, 40),
    redditTags: ranked.filter((row) => row.tag.includes("reddit") || row.tag.startsWith("sub-")).slice(0, 40),
    adultTagCoverage: { tagged: adultTagged, missing: adultVideos.length - adultTagged, share: adultVideos.length ? adultTagged / adultVideos.length : 1 },
    tagConnections: [...connections.entries()].map(([key, count]) => { const [left, right] = key.split("\u0000"); return { left: left!, right: right!, count }; }).filter((row) => row.count >= 2).sort((a, b) => b.count - a.count || a.left.localeCompare(b.left) || a.right.localeCompare(b.right)).slice(0, 40),
    noisyTagAssignments,
    markedTitles: adultVideos.filter((video) => (ctx.cameCounts[video.id] ?? 0) > 0).length,
    totalMarks: adultVideos.reduce((sum, video) => sum + (ctx.cameCounts[video.id] ?? 0), 0),
  };
}

export function adultStatsToCsv(snapshot: AdultStatsSnapshot): string {
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows: Array<Array<string | number>> = [
    ["metric", "key", "count", "score"],
    ["titles", "all", snapshot.titles, ""],
    ["adult_tagged_titles", "adult", snapshot.adultTagCoverage.tagged, `${Math.round(snapshot.adultTagCoverage.share * 100)}%`],
    ["adult_tag_missing", "adult", snapshot.adultTagCoverage.missing, ""],
    ["noisy_tag_assignments", "transport-or-parser", snapshot.noisyTagAssignments, ""],
    ["marked_titles", "i-cummed", snapshot.markedTitles, ""],
    ["total_marks", "i-cummed", snapshot.totalMarks, ""],
  ];
  for (const [key, count] of Object.entries(snapshot.sources)) {
    rows.push(["source", key, count, ""]);
  }
  for (const row of snapshot.providerMix) rows.push(["provider_mix", `${row.provider}:${row.status}:${Math.round(row.share * 100)}%`, row.titles, ""]);
  for (const row of snapshot.genres) rows.push(["genre", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.topTags) rows.push(["tag", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.metaTags) rows.push(["meta_tag", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.redditTags) rows.push(["reddit_tag", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.tagConnections) rows.push(["tag_connection", `${row.left} + ${row.right}`, row.count, ""]);
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
