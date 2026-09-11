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
  const existingById = new Map(existing.map((video) => [video.id, video]));
  const fresh = new Map(incoming.map((video) => {
    const previous = existingById.get(video.id);
    const incomingObservation = video.remote?.observedAt ?? 0;
    const previousObservation = previous?.remote?.observedAt ?? 0;
    // Network responses can resolve out of order. A delayed live response must
    // never flash an older stream title, category, poster, or viewer count.
    if (previous?.remote?.live && video.remote?.live && incomingObservation < previousObservation) return [video.id, previous] as const;
    // Preserve object identity for an unchanged provider card. This prevents
    // healthy artwork and scroll-position-sensitive rails from re-rendering
    // just because a routine refresh repeated the same provider row.
    if (previous && previous.name === video.name && previous.path === video.path && previous.poster === video.poster && previous.genre === video.genre && previous.tagline === video.tagline && previous.description === video.description && previous.addedAt === video.addedAt && previous.duration === video.duration && JSON.stringify(previous.remote) === JSON.stringify(video.remote)) return [video.id, previous] as const;
    return [video.id, video] as const;
  }));
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
