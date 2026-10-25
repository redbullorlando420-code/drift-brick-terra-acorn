import type { FollowedChannel } from "./types";
/** Separate clip clocks keep popular live channels from monopolizing updates.
 * Sorting is small follow-list work; no media catalog scan is needed. */
export function selectClipRefreshCreators(
  follows: readonly FollowedChannel[],
  mode: "recent" | "archive",
  now: number,
  limit = 8,
) {
  return follows
    .filter(
      (row) =>
        row.kind === "twitch" &&
        !row.importNeedsReview &&
        ((mode === "recent" ? row.twitchClipRecentRetry : row.twitchClipRetry)?.retryAt ?? 0) <=
          now &&
        (mode !== "archive" || !row.twitchClipExhaustedAt),
    )
    .sort(
      (a, b) =>
        (mode === "recent"
          ? (a.twitchClipRecentAttemptedAt ?? a.twitchClipRecentCheckedAt ?? 0) -
            (b.twitchClipRecentAttemptedAt ?? b.twitchClipRecentCheckedAt ?? 0)
          : (a.twitchClipArchiveAttemptedAt ?? a.twitchClipCheckedAt ?? 0) -
            (b.twitchClipArchiveAttemptedAt ?? b.twitchClipCheckedAt ?? 0)) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, Math.max(0, Math.min(100, Math.floor(limit))));
}
