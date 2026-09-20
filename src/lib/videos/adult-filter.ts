/**
 * Adult source + tag matching. Source chips must filter by provider kind
 * (reddit / redtube / eporner / …), not only by a source-* tag that may
 * be missing on older cached cards. Host chips (Rule34, e621, Gelbooru)
 * narrow Booru cards by remote.channelId.
 */

import type { LibraryVideo } from "./types";
import type { AdultPullProvider } from "./adult-sites";
import { ADULT_PULL_PROVIDERS } from "./adult-sites";
import { expandedAdultTags } from "./adult-taxonomy";

/** Pull providers plus first-class booru host filters surfaced in Adults UI. */
export type AdultSourceFilterId = AdultPullProvider | "all" | "rule34" | "e621" | "gelbooru" | "realbooru";

export const ADULT_BOORU_HOST_FILTERS = ["rule34", "e621", "gelbooru", "realbooru"] as const;
export type AdultBooruHostFilter = (typeof ADULT_BOORU_HOST_FILTERS)[number];

export const ADULT_SOURCE_FILTERS: { id: AdultSourceFilterId; label: string }[] = [
  { id: "all", label: "All sources" },
  { id: "reddit", label: "Reddit" },
  { id: "redtube", label: "RedTube" },
  { id: "eporner", label: "Eporner" },
  { id: "chaturbate", label: "Chaturbate" },
  { id: "myfreecams", label: "MyFreeCams" },
  { id: "booru", label: "Booru" },
  { id: "rule34", label: "Rule34" },
  { id: "e621", label: "e621" },
  { id: "gelbooru", label: "Gelbooru" },
  { id: "realbooru", label: "Realbooru" },
  { id: "redgifs", label: "Redgifs" },
];

function isBooruHostFilter(needle: string): needle is AdultBooruHostFilter {
  return (ADULT_BOORU_HOST_FILTERS as readonly string[]).includes(needle);
}

export function adultProviderKind(video: LibraryVideo): AdultPullProvider | "" {
  const kind = video.remote?.kind;
  if (kind && (ADULT_PULL_PROVIDERS as readonly string[]).includes(kind)) return kind as AdultPullProvider;
  const folder = video.folderId.split(":")[0] ?? "";
  if ((ADULT_PULL_PROVIDERS as readonly string[]).includes(folder)) return folder as AdultPullProvider;
  return "";
}

/** Primary provider plus any verified media host attached to the same post. */
export function adultProviderKinds(video: LibraryVideo): AdultPullProvider[] {
  const primary = adultProviderKind(video);
  const extra = video.remote?.sourceKinds ?? [];
  return [...new Set([primary, ...extra].filter((kind): kind is AdultPullProvider => Boolean(kind) && (ADULT_PULL_PROVIDERS as readonly string[]).includes(kind)))];
}

export function adultBooruHost(video: LibraryVideo): string {
  if (adultProviderKind(video) !== "booru") return "";
  return (video.remote?.channelId ?? "").trim().toLowerCase();
}

export function videoMatchesAdultSource(video: LibraryVideo, source: string): boolean {
  if (!source || source === "all" || source === "All") return true;
  const kinds = adultProviderKinds(video);
  const needle = source.replace(/^source-/, "").toLowerCase();
  if (isBooruHostFilter(needle)) {
    return kinds.includes("booru") && adultBooruHost(video) === needle;
  }
  if (kinds.some((kind) => kind === needle || needle.startsWith(`${kind}-`))) return true;
  if (needle.startsWith("reddit") && kinds.includes("reddit")) return true;
  return false;
}

export function videoMatchesAdultTag(
  video: LibraryVideo,
  tag: string,
  tags: Record<string, string[]>,
): boolean {
  if (!tag || tag === "All" || tag === "all") return true;
  if (tag.startsWith("source-")) return videoMatchesAdultSource(video, tag);
  const needle = tag.trim().toLowerCase().replace(/^#/, "");
  if (!needle) return true;
  const itemTags = tags[video.id] ?? [];
  const lowered = itemTags.map((entry) => entry.toLowerCase());
  if (lowered.includes(needle)) return true;
  // Taxonomy rows are derived from provider tags for older cached titles too.
  const expanded = expandedAdultTags(itemTags);
  if (expanded.has(needle) || [...expanded].some((entry) => entry.toLowerCase() === needle)) return true;
  if (needle.startsWith("creator-")) {
    const slug = needle.slice("creator-".length);
    const name = (video.remote?.channelName ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return Boolean(slug) && name === slug;
  }
  // Sparse / display forms: fetish-foo ↔ foo, genre-foo, meta-foo.
  const bare = needle.replace(/^(?:fetish|genre|meta|creator|sub|source)-/, "");
  if (bare && bare !== needle) {
    if (lowered.includes(bare) || lowered.includes(`fetish-${bare}`) || lowered.includes(`genre-${bare}`)) return true;
    if (expanded.has(bare) || expanded.has(`fetish-${bare}`) || expanded.has(`genre-${bare}`) || expanded.has(`meta-${bare}`)) return true;
  }
  // Card chips sometimes show the bare keyword while storage keeps fetish-*.
  if (!needle.includes("-") && lowered.some((entry) => entry === `fetish-${needle}` || entry.endsWith(`-${needle}`))) return true;
  // The Adult top bar and tag finder accept human-readable partial phrases
  // ("role play", "creator jane", "rule 34") as well as exact stored slugs.
  // Keep the match token-based so one broad substring cannot accidentally
  // turn an Adult desk query into a near-full catalog result.
  const terms = needle
    .replace(/^(?:fetish|genre|meta|creator|source|provider|sub)-/, "")
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return true;
  const searchable = [...lowered, ...expanded].map((entry) => entry.toLowerCase().replace(/^(?:fetish|genre|meta|creator|source|provider|sub)-/, "").replace(/[-_]+/g, " "));
  return searchable.some((entry) => terms.every((term) => entry.includes(term)));
}

export function countAdultBySource(videos: LibraryVideo[]): Record<string, number> {
  const counts: Record<string, number> = { all: videos.length };
  for (const provider of ADULT_PULL_PROVIDERS) counts[provider] = 0;
  for (const host of ADULT_BOORU_HOST_FILTERS) counts[host] = 0;
  for (const video of videos) {
    for (const kind of adultProviderKinds(video)) counts[kind] = (counts[kind] ?? 0) + 1;
    const host = adultBooruHost(video);
    if (host && (ADULT_BOORU_HOST_FILTERS as readonly string[]).includes(host)) {
      counts[host] = (counts[host] ?? 0) + 1;
    }
  }
  return counts;
}

/** Host mix for Stats / shelves — Rule34 first so its coverage is obvious. */
export function countAdultBooruHosts(videos: LibraryVideo[]): Array<{ host: string; count: number }> {
  const counts = new Map<string, number>();
  for (const video of videos) {
    const host = adultBooruHost(video);
    if (!host) continue;
    counts.set(host, (counts.get(host) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => {
      if (a.host === "rule34") return -1;
      if (b.host === "rule34") return 1;
      return b.count - a.count || a.host.localeCompare(b.host);
    });
}
