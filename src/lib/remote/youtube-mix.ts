import type { LibraryVideo } from "../videos/types";
import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { youtubeContentKind, youtubePublicationTime } from '../videos/youtube-metadata.ts';

function rank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let i = 0; i < id.length; i++) value = Math.imul(value ^ id.charCodeAt(i), 16777619) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return (value ^ (value >>> 16)) >>> 0;
}

export function youtubeCreatorKey(video: LibraryVideo) {
  return video.remote?.channelId || video.remote?.channelName?.trim().toLowerCase() || video.folderId;
}

type CreatorGroup = { rows: LibraryVideo[]; latest: LibraryVideo; trending: LibraryVideo;
  latestUnique: boolean; trendingUnique: boolean; finiteViews: boolean };
type CreatorIndex = { groups: Map<string, CreatorGroup>; unknownDates: Set<LibraryVideo> };
const indexes = new WeakMap<LibraryVideo[], CreatorIndex>();
const createIndex = (): CreatorIndex => ({ groups: new Map(), unknownDates: new Set() });
const minimumDate = Date.UTC(2000, 0, 1);
// Canonical unknown dates are already zero. Only malformed imported records
// need an exception reference; normal catalogs retain no per-video date map.
// Prepared shelves never re-read remote metadata on every heap comparison.
const publicationTime = (index: CreatorIndex, video: LibraryVideo) => index.unknownDates.has(video) || !Number.isFinite(video.addedAt) || video.addedAt <= minimumDate ? 0 : video.addedAt;

function appendCreator(index: CreatorIndex, seen: Set<string>, video: LibraryVideo) {
  if (video.remote?.kind !== "youtube" || youtubeContentKind(video) === 'live' || youtubeContentKind(video) === 'upcoming' || video.isSample || seen.has(video.id)) return;
  seen.add(video.id);
  if (!youtubePublicationTime(video) && video.addedAt > minimumDate) index.unknownDates.add(video);
  const groups = index.groups;
  const key = youtubeCreatorKey(video), group = groups.get(key);
  if (!group) groups.set(key, { rows: [video], latest: video, trending: video,
    latestUnique: true, trendingUnique: true, finiteViews: Number.isFinite(video.remote.views ?? 0) });
  else {
    group.rows.push(video);
    const published = publicationTime(index, video), latestDate = publicationTime(index, group.latest);
    if (published > latestDate) { group.latest = video; group.latestUnique = true; }
    else if (published === latestDate) group.latestUnique = false;
    group.finiteViews &&= Number.isFinite(video.remote.views ?? 0);
    const views = video.remote.views ?? 0, bestViews = group.trending.remote?.views ?? 0, bestDate = publicationTime(index, group.trending);
    if (views > bestViews || views === bestViews && published > bestDate) { group.trending = video; group.trendingUnique = true; }
    else if (views === bestViews && published === bestDate) group.trendingUnique = false;
  }
}

function creatorIndex(videos: LibraryVideo[]) {
  const cached = indexes.get(videos);
  if (cached) return cached;
  const index = createIndex();
  const seen = new Set<string>();
  for (const video of videos) appendCreator(index, seen, video);
  indexes.set(videos, index);
  return index;
}

export async function prepareYoutubeCreatorIndex(videos: LibraryVideo[], signal?: AbortSignal, yieldTask = yieldCatalogTask) {
  if (indexes.has(videos)) return;
  const index = createIndex(), seen = new Set<string>();
  const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
  await forEachCatalogSlice(videos, video => appendCreator(index, seen, video), turn, 4096);
  signal?.throwIfAborted();
  indexes.set(videos, index);
}

/** Reuse the archive index; only scan the selected creators on each shuffle. */
export function sampleYoutubeCreatorShelves(videos: LibraryVideo[], seed: number, count = 16, perCreator = 24) {
  const { groups } = creatorIndex(videos);
  const selected = new Map(mixYoutubeCreators(videos, seed, count).map(video => [youtubeCreatorKey(video), video]));
  return [...selected.values()].map(video => {
    const key = youtubeCreatorKey(video);
    return { key, creator: video.remote?.channelName ?? "Creator", videos: mixYoutubeCreators(groups.get(key)!.rows, seed, perCreator) };
  });
}

/** Immutable catalog arrays share a creator index across shelf modes and
 * reshuffles. Only creators selected for this shelf are sampled again. */
export function mixYoutubeCreators(videos: LibraryVideo[], seed: number, limit = 48, mode: "mix" | "latest" | "trending" = "mix") {
  if (!Number.isFinite(limit)) return [];
  limit = Math.max(0, Math.floor(limit));
  if (!limit) return [];
  const walk = sampleCreators(creatorIndex(videos), seed, limit, mode);
  let step = walk.next();
  while (!step.done) step = walk.next();
  return step.value;
}

/** Same deterministic mix, with cancellation and input/paint boundaries even
 * when almost every entry belongs to a single creator. */
export async function mixYoutubeCreatorsAsync(videos: LibraryVideo[], seed: number, limit = 48, mode: "mix" | "latest" | "trending" = "mix", signal?: AbortSignal, yieldTask = yieldCatalogTask) {
  if (!Number.isFinite(limit) || limit < 1) return [];
  const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
  await prepareYoutubeCreatorIndex(videos, signal, turn);
  await turn();
  const walk = sampleCreators(creatorIndex(videos), seed, Math.floor(limit), mode);
  let step = walk.next();
  while (!step.done) { await turn(); step = walk.next(); }
  signal?.throwIfAborted();
  return step.value;
}

function* sampleCreators(index: CreatorIndex, seed: number, limit: number, mode: "mix" | "latest" | "trending"): Generator<void, LibraryVideo[]> {
  const { groups } = index;
  // Ranking is consulted repeatedly by sort and heap comparisons. Hash each
  // candidate once per shelf build instead of rescanning its id every time.
  const rankCache = new Map<string, number>();
  const videoRank = (video: LibraryVideo) => {
    let value = rankCache.get(video.id);
    if (value === undefined) {
      value = rank(video.id, seed);
      rankCache.set(video.id, value);
    }
    return value;
  };
  const compare = (a: LibraryVideo, b: LibraryVideo) =>
    (mode === "trending" ? (b.remote?.views ?? 0) - (a.remote?.views ?? 0) : 0)
    || (mode !== "mix" ? publicationTime(index, b) - publicationTime(index, a) : 0) || videoRank(a) - videoRank(b);
  const creators = [...groups.keys()].sort((a, b) => mode === "mix"
    ? (rank(a, seed) - rank(b, seed))
    : compare(groups.get(a)![mode === "latest" ? "latest" : "trending"], groups.get(b)![mode === "latest" ? "latest" : "trending"])).slice(0, limit);
  // Allocate the entire shelf fairly, redistributing unused seats when a
  // creator only has one or two uploads instead of leaving the shelf short.
  const quotas = new Map(creators.map(key => [key, 0]));
  let allocated = 0;
  while (allocated < limit) {
    let changed = false;
    for (const key of creators) {
      const count = quotas.get(key)!;
      if (count >= groups.get(key)!.rows.length) continue;
      quotas.set(key, count + 1);
      allocated++;
      changed = true;
      if (allocated === limit) break;
    }
    if (!changed) break;
  }
  // Cache only retained heap rows. A deep single-channel scan used to keep a
  // hash-map entry for every visited video just to select a 48-card shelf.
  rankCache.clear();
  const samples = new Map<string, LibraryVideo[]>();
  let visited = 0, started = performance.now();
  for (const key of creators) {
    const quota = quotas.get(key)!;
    const group = groups.get(key)!;
    // Creator-diverse shelves often need just one card from each archive.
    // A unique cached winner needs no historical scan. Ties still use the
    // seeded heap so unknown dates/equal views retain exactly the same mix.
    if (quota === 1 && (group.rows.length === 1 || mode === 'latest' && group.latestUnique
      || mode === 'trending' && group.trendingUnique && group.finiteViews)) {
      samples.set(key, [mode === 'trending' ? group.trending : group.latest]);
      continue;
    }
    const best: LibraryVideo[] = [];
    // Small bounded worst-first heap: O(rows * log(quota)), never a full
    // historical archive sort and no ranked object allocated per video.
    for (const video of group.rows) {
      if (++visited >= 512 || (visited % 64 === 0 && performance.now() - started >= 4)) {
        yield; visited = 0; started = performance.now();
      }
      let retained = false;
      if (best.length < quota) {
        retained = true;
        best.push(video);
        let child = best.length - 1;
        while (child > 0) {
          const parent = (child - 1) >>> 1;
          if (compare(best[parent], best[child]) >= 0) break;
          [best[parent], best[child]] = [best[child], best[parent]];
          child = parent;
        }
      } else if (compare(video, best[0]) < 0) {
        rankCache.delete(best[0].id);
        retained = true;
        best[0] = video;
        let parent = 0;
        while (parent * 2 + 1 < best.length) {
          const left = parent * 2 + 1;
          const right = left + 1;
          const child = right < best.length && compare(best[left], best[right]) < 0 ? right : left;
          if (compare(best[parent], best[child]) >= 0) break;
          [best[parent], best[child]] = [best[child], best[parent]];
          parent = child;
        }
      }
      if (!retained) rankCache.delete(video.id);
    }
    samples.set(key, best.sort(compare));
    rankCache.clear();
  }
  const result: LibraryVideo[] = [];
  for (let round = 0; result.length < allocated; round++) {
    for (const key of creators) {
      const video = samples.get(key)?.[round];
      if (video) result.push(video);
    }
  }
  return result;
}
