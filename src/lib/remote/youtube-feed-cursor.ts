/**
 * Public YouTube Atom feeds do not accept an `after` parameter.  A routine
 * check therefore reads the provider's deliberately short recent window, then
 * stops at the last upload identity that this library durably accepted.  This
 * keeps routine merges delta-shaped without pretending an unreliable date is a
 * cursor.
 */
export type YoutubeFeedEntry = { videoId?: string };

export function selectYoutubeFeedDelta<T extends YoutubeFeedEntry>(entries: T[], newestKnownVideoId?: string, fallbackLimit = 24): T[] {
  const limit = Math.max(1, Math.floor(fallbackLimit) || 1);
  if (!newestKnownVideoId) return entries.slice(0, limit);

  const cursorIndex = entries.findIndex((entry) => entry.videoId === newestKnownVideoId);
  // The provider may have aged the saved cursor out of its short feed. Keep a
  // bounded window in that case so a repaired/renamed feed still recovers.
  return cursorIndex < 0 ? entries.slice(0, limit) : entries.slice(0, cursorIndex);
}

export function newestYoutubeFeedVideoId<T extends YoutubeFeedEntry>(entries: T[]): string | undefined {
  return entries.find((entry) => typeof entry.videoId === "string" && entry.videoId.length > 0)?.videoId;
}
