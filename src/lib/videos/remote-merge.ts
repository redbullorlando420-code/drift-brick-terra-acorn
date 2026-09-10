import type { LibraryVideo } from "./types";

/**
 * Merge a provider refresh without letting a shallow public response erase a
 * known Twitch archive. Twitch's public archive endpoint can legitimately
 * return a partial window (or no rows while it is rate-limited), so archive
 * rows are additive per channel. Fresh rows still win by id, and stale live
 * cards are turned offline when their channel has checked successfully.
 */
export function mergeRemoteRefresh(
  existing: LibraryVideo[], incoming: LibraryVideo[], refreshedIds: string[], savedIds: Set<string>,
): LibraryVideo[] {
  const refreshed = new Set(refreshedIds);
  const fresh = new Map(incoming.map((video) => [video.id, video]));
  const retained = existing.filter((video) => {
    if (fresh.has(video.id) || !video.remote || !refreshed.has(video.folderId)) return !fresh.has(video.id);
    if (savedIds.has(video.id)) return true;
    // A Twitch VOD is a historical item, not a statement about current live
    // state. Retain it until an explicit cache cleanup removes it.
    return video.remote.kind === "twitch" && !video.remote.live;
  });
  return [...retained.map((video) => video.remote?.live && refreshed.has(video.folderId)
    ? { ...video, tagline: "Offline · saved channel", remote: { ...video.remote, live: false } } : video), ...fresh.values()];
}
