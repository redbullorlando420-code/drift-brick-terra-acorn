/**
 * Adult source + tag matching. Source chips must filter by provider kind
 * (reddit / redtube / eporner / …), not only by a source-* tag that may
 * be missing on older cached cards.
 */

import type { LibraryVideo } from "./types";
import type { AdultPullProvider } from "./adult-sites";
import { ADULT_PULL_PROVIDERS } from "./adult-sites";
import { adultTaxonomyTags } from "./adult-taxonomy";

export const ADULT_SOURCE_FILTERS: { id: AdultPullProvider | "all"; label: string }[] = [
  { id: "all", label: "All sources" },
  { id: "reddit", label: "Reddit" },
  { id: "redtube", label: "RedTube" },
  { id: "eporner", label: "Eporner" },
  { id: "chaturbate", label: "Chaturbate" },
  { id: "myfreecams", label: "MyFreeCams" },
  { id: "booru", label: "Booru" },
  { id: "redgifs", label: "Redgifs" },
];

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

export function videoMatchesAdultSource(video: LibraryVideo, source: string): boolean {
  if (!source || source === "all" || source === "All") return true;
  const kinds = adultProviderKinds(video);
  const needle = source.replace(/^source-/, "").toLowerCase();
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
  const itemTags = tags[video.id] ?? [];
  if (itemTags.includes(tag)) return true;
  // Taxonomy rows are derived from provider tags for older cached titles too.
  if (itemTags.some((item) => adultTaxonomyTags(item).includes(tag))) return true;
  if (tag.startsWith("creator-")) {
    const slug = tag.slice("creator-".length);
    const name = (video.remote?.channelName ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return Boolean(slug) && name === slug;
  }
  return false;
}

export function countAdultBySource(videos: LibraryVideo[]): Record<string, number> {
  const counts: Record<string, number> = { all: videos.length };
  for (const provider of ADULT_PULL_PROVIDERS) counts[provider] = 0;
  for (const video of videos) {
    for (const kind of adultProviderKinds(video)) counts[kind] = (counts[kind] ?? 0) + 1;
  }
  return counts;
}
