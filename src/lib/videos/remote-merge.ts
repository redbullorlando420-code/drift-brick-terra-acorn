import type { LibraryVideo } from "./types";

/** Replace successful channels only; saved entries survive provider pagination. */
export function mergeRemoteRefresh(
  existing: LibraryVideo[], incoming: LibraryVideo[], refreshedIds: string[], savedIds: Set<string>,
): LibraryVideo[] {
  const refreshed = new Set(refreshedIds);
  const fresh = new Map(incoming.map((video) => [video.id, video]));
  const retained = existing.filter((video) => !fresh.has(video.id) &&
    (!video.remote || !refreshed.has(video.folderId) || savedIds.has(video.id)));
  return [...retained.map((video) => video.remote?.live && refreshed.has(video.folderId)
    ? { ...video, tagline: "Offline · saved channel", remote: { ...video.remote, live: false } } : video), ...fresh.values()];
}
