import type { FollowedChannel, LibraryVideo } from "./types";
import { forEachCatalogSlice } from '../catalog-work.ts';

export type CreatorCoverageResolution =
  | { status: "present"; channelName: string }
  | { status: "resolved"; channelName: string; evidence: "channel-id" | "source-id" }
  | { status: "ambiguous"; candidates: string[] }
  | { status: "unresolved" }
  | { status: "unsupported" };

type FollowEvidence = "channel-id" | "source-id";
type Candidate = { title: string; key: string; position: number };
type Bucket = { rows: Candidate[]; names: Set<string> };
type CoverageIndex = { channels: Map<string, Bucket>; sources: Map<string, Bucket> };
const indexes = new WeakMap<readonly FollowedChannel[], CoverageIndex>();

function addFollow(index: CoverageIndex, follow: FollowedChannel, position: number) {
  const title = follow.title.trim();
  if (!title || (follow.kind !== 'youtube' && follow.kind !== 'twitch')) return;
  const candidate = { title, key: normalizedLabel(title), position };
  for (const [map, id] of [[index.channels, stableId(follow.channelId)], [index.sources, stableId(follow.id)]] as const) {
    if (!id) continue;
    const key = `${follow.kind}:${id}`, bucket = map.get(key);
    // Thousands of playlist follows can share one creator. Keep only the
    // earliest equivalent label, preserving precedence without per-video alias scans.
    if (!bucket) map.set(key, { rows: [candidate], names: new Set([candidate.key]) });
    else if (!bucket.names.has(candidate.key)) { bucket.names.add(candidate.key); bucket.rows.push(candidate); }
  }
}

function named(video: LibraryVideo): CreatorCoverageResolution | undefined {
  const existingName = video.remote?.channelName?.trim();
  if (existingName) return { status: 'present', channelName: existingName };
  if (!video.remote || (video.remote.kind !== 'youtube' && video.remote.kind !== 'twitch')) return { status: 'unsupported' };
}

function resolveIndexed(video: LibraryVideo, index: CoverageIndex): CreatorCoverageResolution {
  const known = named(video);
  if (known) return known;
  const kind = video.remote!.kind, channelId = stableId(video.remote!.channelId), sourceId = stableId(video.folderId);
  const channels = channelId ? index.channels.get(`${kind}:${channelId}`)?.rows : undefined;
  const sources = sourceId ? index.sources.get(`${kind}:${sourceId}`)?.rows : undefined;
  const names = new Map<string, { title: string; evidence: FollowEvidence }>();
  // Merge in original follow order; channel evidence wins ties on one follow.
  let channel = 0, source = 0;
  while (channel < (channels?.length ?? 0) || source < (sources?.length ?? 0)) {
    const fromChannel = channel < (channels?.length ?? 0) && (source >= (sources?.length ?? 0)
      || channels![channel]!.position <= sources![source]!.position);
    const candidate = fromChannel ? channels![channel++]! : sources![source++]!;
    if (!names.has(candidate.key)) names.set(candidate.key, { title: candidate.title, evidence: fromChannel ? 'channel-id' : 'source-id' });
  }
  const candidates = [...names.values()].sort((left, right) => left.title.localeCompare(right.title));
  if (!candidates.length) return { status: 'unresolved' };
  if (candidates.length > 1) return { status: 'ambiguous', candidates: candidates.map(candidate => candidate.title) };
  return { status: 'resolved', channelName: candidates[0]!.title, evidence: candidates[0]!.evidence };
}

/** Batch owners prepare exact identifier indexes in cancelable tasks. Only
 * completed immutable follow snapshots are cached; no video result cache grows. */
export async function prepareCreatorCoverageResolver(follows: readonly FollowedChannel[], turn: () => Promise<void>) {
  await turn();
  let index = indexes.get(follows);
  if (!index) {
    index = { channels: new Map(), sources: new Map() };
    const prepared = index;
    await forEachCatalogSlice(follows, (follow, position) => addFollow(prepared, follow, position), turn);
    await turn();
    indexes.set(follows, index);
  }
  const prepared = index;
  return (video: LibraryVideo) => resolveIndexed(video, prepared);
}

function normalizedLabel(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function stableId(value: string | undefined) {
  return value?.trim() ?? "";
}

/**
 * Resolve a missing display name only when the card and a saved follow share
 * an exact provider-issued identifier. Titles, filenames, and loose handles
 * are intentionally excluded: a plausible creator guess is worse than a
 * visible coverage gap in a media library.
 */
export function resolveCreatorCoverage(video: LibraryVideo, follows: FollowedChannel[]): CreatorCoverageResolution {
  const known = named(video);
  if (known) return known;
  let index = indexes.get(follows);
  if (!index) {
    index = { channels: new Map(), sources: new Map() };
    follows.forEach((follow, position) => addFollow(index!, follow, position));
    indexes.set(follows, index);
  }
  return resolveIndexed(video, index);
}
