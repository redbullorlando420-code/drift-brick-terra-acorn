import type { LibraryVideo } from "../videos/types";

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

type CreatorGroup = { rows: LibraryVideo[]; latest: LibraryVideo; trending: LibraryVideo };
const indexes = new WeakMap<LibraryVideo[], Map<string, CreatorGroup>>();

function creatorIndex(videos: LibraryVideo[]) {
  const cached = indexes.get(videos);
  if (cached) return cached;
  const groups = new Map<string, CreatorGroup>();
  const seen = new Set<string>();
  for (const video of videos) {
    if (video.remote?.kind !== "youtube" || video.remote.live || video.isSample || seen.has(video.id)) continue;
    seen.add(video.id);
    const key = youtubeCreatorKey(video);
    const group = groups.get(key);
    if (!group) groups.set(key, { rows: [video], latest: video, trending: video });
    else {
      group.rows.push(video);
      if (video.addedAt > group.latest.addedAt) group.latest = video;
      if ((video.remote.views ?? 0) > (group.trending.remote?.views ?? 0)
        || (video.remote.views ?? 0) === (group.trending.remote?.views ?? 0) && video.addedAt > group.trending.addedAt) group.trending = video;
    }
  }
  indexes.set(videos, groups);
  return groups;
}

/** Reuse the archive index; only scan the selected creators on each shuffle. */
export function sampleYoutubeCreatorShelves(videos: LibraryVideo[], seed: number, count = 16, perCreator = 24) {
  const groups = creatorIndex(videos);
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
  const groups = creatorIndex(videos);
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
    || (mode !== "mix" ? b.addedAt - a.addedAt : 0) || videoRank(a) - videoRank(b);
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
  const samples = new Map<string, LibraryVideo[]>();
  for (const key of creators) {
    const quota = quotas.get(key)!;
    const best: LibraryVideo[] = [];
    // Small bounded worst-first heap: O(rows * log(quota)), never a full
    // historical archive sort and no ranked object allocated per video.
    for (const video of groups.get(key)!.rows) {
      if (best.length < quota) {
        best.push(video);
        let child = best.length - 1;
        while (child > 0) {
          const parent = (child - 1) >>> 1;
          if (compare(best[parent], best[child]) >= 0) break;
          [best[parent], best[child]] = [best[child], best[parent]];
          child = parent;
        }
      } else if (compare(video, best[0]) < 0) {
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
    }
    samples.set(key, best.sort(compare));
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
