import type { LibraryVideo } from "./types";

// Only cache requested cards, rather than allocating a full catalog map on the
// frame that opens a player. Old immutable snapshots are garbage collectable.
const snapshots = new WeakMap<LibraryVideo[], Map<string, LibraryVideo | undefined>>();
const MAX_REQUESTED = 128;
// Provider merges usually preserve positions. Keep only bounded numeric hints;
// validate every hint against the current array before trusting it.
const positions = new Map<string, number>();
function rememberPosition(id: string, position: number) {
  positions.delete(id); positions.set(id, position);
  while (positions.size > MAX_REQUESTED) positions.delete(positions.keys().next().value!);
}
export function rememberVideo(videos: LibraryVideo[], video: LibraryVideo) {
  let cache = snapshots.get(videos);
  if (!cache) { cache = new Map(); snapshots.set(videos, cache); }
  cache.set(video.id, video);
  while (cache.size > MAX_REQUESTED) cache.delete(cache.keys().next().value!);
}

export function lookupVideos(videos: LibraryVideo[], ids: readonly string[]) {
  let cache = snapshots.get(videos);
  if (!cache) { cache = new Map(); snapshots.set(videos, cache); }
  let missing = new Set(ids.filter(id => !cache.has(id)));
  if (missing.size) {
    if (cache.size + missing.size > MAX_REQUESTED) { cache.clear(); missing = new Set(ids); }
    for (const id of missing) {
      const position = positions.get(id);
      if (position === undefined) continue;
      const video = videos[position];
      if (video?.id === id) { cache.set(id, video); missing.delete(id); }
    }
    for (let position = 0; missing.size && position < videos.length; position++) {
      const video = videos[position]!;
      if (!missing.delete(video.id)) continue;
      cache.set(video.id, video);
      rememberPosition(video.id, position);
    }
    for (const id of missing) cache.set(id, undefined);
  }
  const found = ids.map(id => cache.get(id));
  while (cache.size > MAX_REQUESTED) cache.delete(cache.keys().next().value!);
  return found;
}

export function lookupVideo(videos: LibraryVideo[], id: string | null) {
  if (!id) return undefined;
  const cache = snapshots.get(videos);
  return cache?.has(id) ? cache.get(id) : lookupVideos(videos, [id])[0];
}
