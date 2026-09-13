/**
 * Adult Stats snapshot + CSV/JSON export (local-only counts).
 */

import type { Folder, LibraryVideo } from "./types";
import { ADULT_SOURCE_FILTERS, adultProviderKind, adultProviderKinds, countAdultBySource } from "./adult-filter";
import { isAdultInterestTag, isAdultMetaTag, rankAdultMetaTags, rankAdultTags, type AdultRankContext } from "./adult-rank";
import { adultTaxonomyLabel, adultTaxonomyTags, isAdultGenreTag } from "./adult-taxonomy";
import { ADULT_PULL_PROVIDERS, adultRemoteLabel, type AdultPullProvider } from "./adult-sites";

type Coverage = { ready: number; missing: number; share: number };

export type AdultProviderMixRow = {
  provider: AdultPullProvider;
  label: string;
  /** Primary catalog cards. These shares add up cleanly across providers. */
  titles: number;
  share: number;
  status: "active" | "empty";
  /** Cards discovered elsewhere but verified as this provider's media. */
  linkedTitles: number;
  previewCoverage: Coverage;
  backupPreviewCoverage: Coverage;
  creatorCoverage: Coverage;
  usefulTagCoverage: Coverage;
  duplicateCandidates: number;
};

export type AdultStatsSnapshot = {
  at: number;
  titles: number;
  /** Source relationships, including verified dual-source cards. */
  sources: Record<string, number>;
  /** One count per card's primary source. */
  primarySources: Record<string, number>;
  providerMix: AdultProviderMixRow[];
  genres: Array<{ tag: string; label: string; count: number; score: number }>;
  topTags: Array<{ tag: string; count: number; score: number }>;
  metaTags: Array<{ tag: string; count: number; score: number }>;
  fetishTags: Array<{ tag: string; count: number; score: number }>;
  redditTags: Array<{ tag: string; count: number; score: number }>;
  adultTagCoverage: { tagged: number; missing: number; share: number };
  /** Provider-declared artwork, not a claim that a CDN request decoded. */
  previewCoverage: Coverage & {
    backed: number;
    backedShare: number;
    embeddable: number;
    redgifs: Coverage & { backed: number; backedShare: number };
  };
  creatorCoverage: Coverage & {
    canonicalTagged: number;
    ambiguous: number;
    uniqueCreators: number;
  };
  tagQuality: {
    usefulTagged: number;
    metadataTagged: number;
    multiInterestTagged: number;
    noUsefulInterest: number;
    averageUsefulTags: number;
    sourceTagged: number;
  };
  dedupe: {
    candidateGroups: number;
    affectedTitles: number;
    extraTitles: number;
    share: number;
    bySignal: Array<{ signal: "provider-id" | "media-link"; groups: number; affectedTitles: number; extraTitles: number }>;
  };
  tagConnections: Array<{ left: string; right: string; count: number; providerCount: number; lift: number }>;
  noisyTagAssignments: number;
  markedTitles: number;
  totalMarks: number;
};

function coverage(ready: number, total: number): Coverage {
  // An empty provider has no observed coverage yet. Reporting 100% here makes
  // a cold catalog look healthy, which hides the exact gap this panel exists
  // to surface.
  return { ready, missing: Math.max(0, total - ready), share: total ? ready / total : 0 };
}

function isHttpUrl(value?: string): value is string {
  return Boolean(value && /^https?:\/\//i.test(value.trim()));
}

function previewCandidates(video: LibraryVideo): string[] {
  const raw = [video.poster, video.remote?.previewUrl, ...(video.remote?.thumbFallbacks ?? [])];
  const seen = new Set<string>();
  return raw.filter(isHttpUrl).map((url) => url.trim()).filter((url) => {
    const key = url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Legacy transport/parser fragments should stay searchable on a card but
 * must not be exported as a personal preference or a tag connection. */
export function isAdultStatsNoiseTag(raw: string): boolean {
  const tag = raw.trim().toLowerCase();
  if (!tag) return true;
  if (/(?:https?:|\bwww\b|\.com\b|\/watch\b|\/comments?\b)/.test(tag)) return true;
  const plain = tag.replace(/^fetish-/, "");
  return /^(?:https?|www|com|watch|comments?|reddit|redgifs|eporner|redtube|chaturbate|camsoda|myfreecams|booru)(?:-|$)/.test(plain);
}

function usefulInterestTags(video: LibraryVideo, tags: Record<string, string[]>): string[] {
  const raw = tags[video.id] ?? [];
  return [...new Set([...raw, ...raw.flatMap(adultTaxonomyTags)])]
    .filter((tag) => isAdultInterestTag(tag) && !isAdultStatsNoiseTag(tag));
}

function usefulMetaTags(video: LibraryVideo, tags: Record<string, string[]>): string[] {
  const raw = tags[video.id] ?? [];
  return [...new Set([...raw, ...raw.flatMap(adultTaxonomyTags)])]
    .filter((tag) => isAdultMetaTag(tag) && !isAdultStatsNoiseTag(tag));
}

function meaningfulCreatorKeys(video: LibraryVideo, itemTags: string[]): string[] {
  const creatorTags = itemTags
    .filter((tag) => tag.startsWith("creator-"))
    .map((tag) => tag.slice("creator-".length).trim().toLowerCase())
    .filter((tag) => tag.length >= 2 && !isAdultStatsNoiseTag(tag));
  if (creatorTags.length) return [...new Set(creatorTags.map((tag) => `tag:${tag}`))];

  const name = video.remote?.channelName?.trim();
  if (!name) return [];
  const normalized = name.toLowerCase().replace(/^@/, "").replace(/\s+/g, " ");
  const kind = adultProviderKind(video);
  const providerNames = new Set([kind, adultRemoteLabel(kind).toLowerCase(), "adult", "video", "live", "cam"]);
  // A subreddit is useful source context, but it is not creator credit.
  if (!normalized || providerNames.has(normalized) || normalized.startsWith("r/")) return [];
  return [`remote:${normalized}`];
}

function hasAmbiguousCreator(video: LibraryVideo, itemTags: string[]): boolean {
  return Boolean(video.remote?.channelName?.trim()) && meaningfulCreatorKeys(video, itemTags).length === 0;
}

type DuplicateSignal = "provider-id" | "media-link";

function redgifsSlug(raw: string): string | undefined {
  return raw.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1]
    ?? raw.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1]
    ?? raw.match(/https?:\/\/(?:i|media)\.redgifs\.com\/([a-z0-9_-]+)(?:[._-]|$)/i)?.[1];
}

function canonicalMediaLink(raw: string): string | undefined {
  const redgifs = redgifsSlug(raw);
  if (redgifs) return `redgifs:${redgifs.toLowerCase()}`;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.replace(/\/+$/, "").toLowerCase();
    const hash = url.hash && url.hash !== "#" ? url.hash.toLowerCase() : "";
    if (host && path && path !== "/") return `url:${host}${path}${hash}`;
    return host && hash ? `url:${host}${hash}` : undefined;
  } catch {
    return undefined;
  }
}

function duplicateSignalsFor(video: LibraryVideo): Array<{ signal: DuplicateSignal; key: string }> {
  const rows: Array<{ signal: DuplicateSignal; key: string }> = [];
  const kind = adultProviderKind(video);
  const id = video.remote?.videoId?.trim();
  if (kind && id) rows.push({ signal: "provider-id", key: `provider:${kind}:${id.toLowerCase()}` });
  for (const url of [video.remote?.embedUrl, video.remote?.watchUrl, video.src, video.poster, video.remote?.previewUrl].filter(isHttpUrl)) {
    const key = canonicalMediaLink(url);
    if (key) rows.push({ signal: "media-link", key });
  }
  const seen = new Set<string>();
  return rows.filter((row) => {
    const identity = `${row.signal}\u0000${row.key}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function duplicateStats(videos: LibraryVideo[]): AdultStatsSnapshot["dedupe"] {
  const bySignal = new Map<DuplicateSignal, Map<string, Set<string>>>([
    ["provider-id", new Map()],
    ["media-link", new Map()],
  ]);
  for (const video of videos) {
    for (const row of duplicateSignalsFor(video)) {
      const groups = bySignal.get(row.signal)!;
      const group = groups.get(row.key) ?? new Set<string>();
      group.add(video.id);
      groups.set(row.key, group);
    }
  }

  const parent = new Map(videos.map((video) => [video.id, video.id]));
  const find = (id: string): string => {
    const root = parent.get(id) ?? id;
    if (root === id) return id;
    const canonical = find(root);
    parent.set(id, canonical);
    return canonical;
  };
  const join = (left: string, right: string) => {
    const a = find(left);
    const b = find(right);
    if (a !== b) parent.set(b, a);
  };
  for (const groups of bySignal.values()) for (const ids of groups.values()) {
    const [first, ...rest] = ids;
    if (!first || ids.size < 2) continue;
    for (const id of rest) join(first, id);
  }
  const components = new Map<string, string[]>();
  for (const video of videos) {
    const root = find(video.id);
    const group = components.get(root) ?? [];
    group.push(video.id);
    components.set(root, group);
  }
  const duplicateComponents = [...components.values()].filter((ids) => ids.length > 1);
  const bySignalRows = (["provider-id", "media-link"] as const).map((signal) => {
    const groups = [...bySignal.get(signal)!.values()].filter((ids) => ids.size > 1);
    return {
      signal,
      groups: groups.length,
      affectedTitles: groups.reduce((sum, ids) => sum + ids.size, 0),
      extraTitles: groups.reduce((sum, ids) => sum + ids.size - 1, 0),
    };
  });
  const affectedTitles = duplicateComponents.reduce((sum, ids) => sum + ids.length, 0);
  const extraTitles = duplicateComponents.reduce((sum, ids) => sum + ids.length - 1, 0);
  return {
    candidateGroups: duplicateComponents.length,
    affectedTitles,
    extraTitles,
    share: videos.length ? affectedTitles / videos.length : 0,
    bySignal: bySignalRows,
  };
}

function countSubredditTags(videos: LibraryVideo[], tags: Record<string, string[]>): AdultStatsSnapshot["redditTags"] {
  const counts = new Map<string, number>();
  for (const video of videos) if (adultProviderKinds(video).includes("reddit")) {
    for (const tag of new Set((tags[video.id] ?? []).filter((tag) => tag.startsWith("sub-") && !isAdultStatsNoiseTag(tag)))) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count, score: Math.log2(count + 1) * 10 }))
    .sort((a, b) => b.count - a.count || b.score - a.score || a.tag.localeCompare(b.tag))
    .slice(0, 40);
}

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
  const ranked = rankAdultTags(adultVideos, rankCtx, 160).filter((row) => !isAdultStatsNoiseTag(row.tag));
  const metaRanked = rankAdultMetaTags(adultVideos, rankCtx, 160).filter((row) => !isAdultStatsNoiseTag(row.tag));
  const sources = countAdultBySource(adultVideos);
  const primarySources: Record<string, number> = { all: adultVideos.length };
  for (const provider of ADULT_PULL_PROVIDERS) primarySources[provider] = 0;
  for (const video of adultVideos) {
    const provider = adultProviderKind(video);
    if (provider) primarySources[provider] = (primarySources[provider] ?? 0) + 1;
  }

  const dedupe = duplicateStats(adultVideos);
  const duplicateVideoIds = new Set<string>();
  // Mark every title in a collision group. This is a conservative signal for
  // provider diagnostics, not a request to automatically remove anything.
  for (const signal of ["provider-id", "media-link"] as const) {
    const seen = new Map<string, string>();
    for (const video of adultVideos) for (const row of duplicateSignalsFor(video)) if (row.signal === signal) {
      const previous = seen.get(row.key);
      if (previous) {
        duplicateVideoIds.add(previous);
        duplicateVideoIds.add(video.id);
      } else seen.set(row.key, video.id);
    }
  }

  const connections = new Map<string, { count: number; providers: Set<string> }>();
  const interestCounts = new Map<string, number>();
  let noisyTagAssignments = 0;
  let adultTagged = 0;
  let declaredPreviews = 0;
  let backedPreviews = 0;
  let embeddable = 0;
  let redgifsTitles = 0;
  let redgifsPreviews = 0;
  let redgifsBackedPreviews = 0;
  let creatorCredited = 0;
  let creatorTagged = 0;
  let ambiguousCreators = 0;
  let usefulTagged = 0;
  let metadataTagged = 0;
  let multiInterestTagged = 0;
  let sourceTagged = 0;
  let usefulTagAssignments = 0;
  const creators = new Set<string>();

  for (const video of adultVideos) {
    const itemTags = tags[video.id] ?? [];
    const kind = adultProviderKind(video);
    const providerKinds = adultProviderKinds(video);
    const previews = previewCandidates(video);
    const interests = usefulInterestTags(video, tags);
    const metadata = usefulMetaTags(video, tags);
    const creatorKeys = meaningfulCreatorKeys(video, itemTags);
    if (itemTags.includes("adult")) adultTagged += 1;
    if (previews.length) declaredPreviews += 1;
    if (previews.length >= 2) backedPreviews += 1;
    if (video.remote?.embedUrl) embeddable += 1;
    if (providerKinds.includes("redgifs")) {
      redgifsTitles += 1;
      if (previews.length) redgifsPreviews += 1;
      if (previews.length >= 2) redgifsBackedPreviews += 1;
    }
    if (creatorKeys.length) {
      creatorCredited += 1;
      for (const creator of creatorKeys) creators.add(creator);
    }
    if (itemTags.some((tag) => tag.startsWith("creator-"))) creatorTagged += 1;
    if (hasAmbiguousCreator(video, itemTags)) ambiguousCreators += 1;
    if (interests.length) usefulTagged += 1;
    if (metadata.length) metadataTagged += 1;
    if (interests.length >= 2) multiInterestTagged += 1;
    if (providerKinds.length || itemTags.some((tag) => tag.startsWith("source-"))) sourceTagged += 1;
    usefulTagAssignments += interests.length;
    for (const tag of itemTags) if (isAdultStatsNoiseTag(tag)) noisyTagAssignments += 1;

    const useful = interests.slice(0, 8).sort();
    for (const tag of useful) interestCounts.set(tag, (interestCounts.get(tag) ?? 0) + 1);
    for (let left = 0; left < useful.length; left += 1) for (let right = left + 1; right < useful.length; right += 1) {
      const key = `${useful[left]}\u0000${useful[right]}`;
      const row = connections.get(key) ?? { count: 0, providers: new Set<string>() };
      row.count += 1;
      row.providers.add(kind || "local");
      connections.set(key, row);
    }
  }

  const providerMix = ADULT_PULL_PROVIDERS.map((provider) => {
    const providerVideos = adultVideos.filter((video) => adultProviderKind(video) === provider);
    const linkedTitles = adultVideos.filter((video) => adultProviderKind(video) !== provider && adultProviderKinds(video).includes(provider)).length;
    const primaryTitles = providerVideos.length;
    const previewed = providerVideos.filter((video) => previewCandidates(video).length > 0).length;
    const backed = providerVideos.filter((video) => previewCandidates(video).length >= 2).length;
    const credited = providerVideos.filter((video) => meaningfulCreatorKeys(video, tags[video.id] ?? []).length > 0).length;
    const tagged = providerVideos.filter((video) => usefulInterestTags(video, tags).length > 0).length;
    return {
      provider,
      label: adultRemoteLabel(provider),
      titles: primaryTitles,
      share: adultVideos.length ? primaryTitles / adultVideos.length : 0,
      status: (primaryTitles || linkedTitles) ? "active" as const : "empty" as const,
      linkedTitles,
      previewCoverage: coverage(previewed, primaryTitles),
      backupPreviewCoverage: coverage(backed, primaryTitles),
      creatorCoverage: coverage(credited, primaryTitles),
      usefulTagCoverage: coverage(tagged, primaryTitles),
      duplicateCandidates: providerVideos.filter((video) => duplicateVideoIds.has(video.id)).length,
    };
  }).sort((a, b) => b.titles - a.titles || b.linkedTitles - a.linkedTitles || a.label.localeCompare(b.label));

  const tagConnections = [...connections.entries()]
    .map(([key, row]) => {
      const [left, right] = key.split("\u0000");
      const expected = ((interestCounts.get(left!) ?? 0) * (interestCounts.get(right!) ?? 0)) / Math.max(adultVideos.length, 1);
      return {
        left: left!,
        right: right!,
        count: row.count,
        providerCount: row.providers.size,
        lift: Math.round((row.count / Math.max(expected, 0.01)) * 100) / 100,
      };
    })
    .filter((row) => row.count >= 2)
    .sort((a, b) => (b.count * Math.min(b.lift, 3)) - (a.count * Math.min(a.lift, 3)) || b.count - a.count || b.providerCount - a.providerCount || a.left.localeCompare(b.left) || a.right.localeCompare(b.right))
    .slice(0, 40);

  return {
    at: Date.now(),
    titles: adultVideos.length,
    sources,
    primarySources,
    providerMix,
    genres: ranked.filter((row) => isAdultGenreTag(row.tag)).slice(0, 40).map((row) => ({ ...row, label: adultTaxonomyLabel(row.tag) })),
    topTags: ranked.slice(0, 60),
    metaTags: metaRanked.slice(0, 60),
    fetishTags: ranked.filter((row) => row.tag.startsWith("fetish-")).slice(0, 40),
    redditTags: countSubredditTags(adultVideos, tags),
    adultTagCoverage: { tagged: adultTagged, missing: adultVideos.length - adultTagged, share: adultVideos.length ? adultTagged / adultVideos.length : 0 },
    previewCoverage: {
      ...coverage(declaredPreviews, adultVideos.length),
      backed: backedPreviews,
      backedShare: adultVideos.length ? backedPreviews / adultVideos.length : 0,
      embeddable,
      redgifs: {
        ...coverage(redgifsPreviews, redgifsTitles),
        backed: redgifsBackedPreviews,
        backedShare: redgifsTitles ? redgifsBackedPreviews / redgifsTitles : 0,
      },
    },
    creatorCoverage: {
      ...coverage(creatorCredited, adultVideos.length),
      canonicalTagged: creatorTagged,
      ambiguous: ambiguousCreators,
      uniqueCreators: creators.size,
    },
    tagQuality: {
      usefulTagged,
      metadataTagged,
      multiInterestTagged,
      noUsefulInterest: adultVideos.length - usefulTagged,
      averageUsefulTags: adultVideos.length ? usefulTagAssignments / adultVideos.length : 0,
      sourceTagged,
    },
    dedupe,
    tagConnections,
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
    ["preview_declared", "all", snapshot.previewCoverage.ready, `${Math.round(snapshot.previewCoverage.share * 100)}%`],
    ["preview_backup", "all", snapshot.previewCoverage.backed, `${Math.round(snapshot.previewCoverage.backedShare * 100)}%`],
    ["preview_missing", "all", snapshot.previewCoverage.missing, ""],
    ["redgifs_preview_declared", "linked-or-primary", snapshot.previewCoverage.redgifs.ready, `${Math.round(snapshot.previewCoverage.redgifs.share * 100)}%`],
    ["redgifs_preview_backup", "linked-or-primary", snapshot.previewCoverage.redgifs.backed, `${Math.round(snapshot.previewCoverage.redgifs.backedShare * 100)}%`],
    ["creator_credited", "all", snapshot.creatorCoverage.ready, `${Math.round(snapshot.creatorCoverage.share * 100)}%`],
    ["creator_canonical_tag", "creator-*", snapshot.creatorCoverage.canonicalTagged, ""],
    ["creator_ambiguous", "provider-label-only", snapshot.creatorCoverage.ambiguous, ""],
    ["unique_creators", "normalized", snapshot.creatorCoverage.uniqueCreators, ""],
    ["useful_interest_tagged", "all", snapshot.tagQuality.usefulTagged, `${Math.round(snapshot.tagQuality.usefulTagged / Math.max(snapshot.titles, 1) * 100)}%`],
    ["metadata_tagged", "all", snapshot.tagQuality.metadataTagged, `${Math.round(snapshot.tagQuality.metadataTagged / Math.max(snapshot.titles, 1) * 100)}%`],
    ["multi_interest_tagged", "two-or-more", snapshot.tagQuality.multiInterestTagged, ""],
    ["no_useful_interest", "all", snapshot.tagQuality.noUsefulInterest, ""],
    ["average_useful_tags", "per-title", snapshot.tagQuality.averageUsefulTags.toFixed(2), ""],
    ["duplicate_candidate_groups", "stable-provider-or-media", snapshot.dedupe.candidateGroups, ""],
    ["duplicate_candidate_titles", "affected", snapshot.dedupe.affectedTitles, `${Math.round(snapshot.dedupe.share * 100)}%`],
    ["duplicate_extra_titles", "after-one-per-group", snapshot.dedupe.extraTitles, ""],
    ["noisy_tag_assignments", "transport-or-parser", snapshot.noisyTagAssignments, ""],
    ["marked_titles", "i-cummed", snapshot.markedTitles, ""],
    ["total_marks", "i-cummed", snapshot.totalMarks, ""],
  ];
  for (const [key, count] of Object.entries(snapshot.sources)) rows.push(["source_link", key, count, ""]);
  for (const [key, count] of Object.entries(snapshot.primarySources)) rows.push(["primary_source", key, count, ""]);
  for (const row of snapshot.providerMix) {
    rows.push(["provider_mix", `${row.provider}:${row.status}:${Math.round(row.share * 100)}%`, row.titles, ""]);
    rows.push(["provider_linked", row.provider, row.linkedTitles, ""]);
    rows.push(["provider_preview", row.provider, row.previewCoverage.ready, `${Math.round(row.previewCoverage.share * 100)}%`]);
    rows.push(["provider_preview_backup", row.provider, row.backupPreviewCoverage.ready, `${Math.round(row.backupPreviewCoverage.share * 100)}%`]);
    rows.push(["provider_creator", row.provider, row.creatorCoverage.ready, `${Math.round(row.creatorCoverage.share * 100)}%`]);
    rows.push(["provider_useful_tag", row.provider, row.usefulTagCoverage.ready, `${Math.round(row.usefulTagCoverage.share * 100)}%`]);
    rows.push(["provider_duplicate_candidate", row.provider, row.duplicateCandidates, ""]);
  }
  for (const row of snapshot.dedupe.bySignal) rows.push(["duplicate_signal", row.signal, row.extraTitles, `${row.groups} groups / ${row.affectedTitles} titles`]);
  for (const row of snapshot.genres) rows.push(["genre", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.topTags) rows.push(["tag", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.metaTags) rows.push(["meta_tag", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.redditTags) rows.push(["reddit_tag", row.tag, row.count, row.score.toFixed(2)]);
  for (const row of snapshot.tagConnections) rows.push(["tag_connection", `${row.left} + ${row.right}`, row.count, `lift ${row.lift.toFixed(2)} / ${row.providerCount} sources`]);
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
