import type { FollowedChannel } from "./types";
import { twitchRetryPatch } from "./twitch-retry";
export type ClipMode = "recent" | "archive";
const keys = (mode: ClipMode) =>
  mode === "recent"
    ? ({
        attempt: "twitchClipRecentAttemptedAt",
        checked: "twitchClipRecentCheckedAt",
        retry: "twitchClipRecentRetry",
      } as const)
    : ({
        attempt: "twitchClipArchiveAttemptedAt",
        checked: "twitchClipCheckedAt",
        retry: "twitchClipRetry",
      } as const);
export function clipObservationAt(channel: Partial<FollowedChannel>, mode: ClipMode) {
  return Math.max(
    channel[keys(mode).checked] ?? 0,
    channel.twitchClipDiagnostics?.mode === mode ? channel.twitchClipDiagnostics.at : 0,
  );
}
/** Attempt time is local action start. Observation time belongs to the provider
 * read and must never be replaced by cache delivery/commit time. */
export function mergeTwitchClipObservation(
  previous: FollowedChannel | undefined,
  incoming: FollowedChannel,
  mode: ClipMode,
  attemptedAt: number,
  now = Date.now(),
): FollowedChannel {
  const k = keys(mode),
    at = Math.max(
      clipObservationAt(incoming, mode),
      incoming.lastClipFailure
        ? Math.min(attemptedAt, incoming.lastClipFailure.at ?? attemptedAt)
        : 0,
    ),
    attempt = Math.max(previous?.[k.attempt] ?? 0, attemptedAt);
  const priorFailure = previous?.[k.retry]
    ? (previous.lastClipFailure?.at ?? previous[k.attempt] ?? 0)
    : 0;
  if (
    previous &&
    ((previous[k.attempt] ?? 0) > attemptedAt ||
      at < Math.max(clipObservationAt(previous, mode), priorFailure) ||
      (incoming.twitchClipDiagnostics?.cacheHit === true &&
        previous[k.retry] &&
        (!previous.lastClipFailure?.at || priorFailure >= at)))
  )
    return { ...previous, [k.attempt]: attempt };
  const next = {
    ...previous,
    ...incoming,
    [k.attempt]: attempt,
    ...twitchRetryPatch(
      previous ?? {},
      mode === "recent" ? "clips-recent" : "clips",
      incoming.lastClipFailure,
      now,
    ),
  };
  if (previous?.lastClipFailure && previous.lastClipFailure.at > at)
    next.lastClipFailure = previous.lastClipFailure;
  return next;
}
/** Unrelated live/archive responses may carry a stale copy of a follow. Keep
 * newer clip health and positions without changing their other lanes. */
export function retainNewerTwitchClipFollow(
  previous: FollowedChannel,
  incoming: FollowedChannel,
): FollowedChannel {
  if (previous.kind !== "twitch" || incoming.kind !== "twitch") return incoming;
  let next = incoming;
  const keep = (fields: ReadonlyArray<keyof FollowedChannel>) => {
    if (next === incoming) next = { ...incoming };
    for (const key of fields) Object.assign(next, { [key]: previous[key] });
  };
  for (const mode of ["recent", "archive"] as const) {
    const k = keys(mode),
      version = (c: FollowedChannel) =>
        Math.max(
          c[k.attempt] ?? 0,
          clipObservationAt(c, mode),
          c[k.retry] ? (c.lastClipFailure?.at ?? 0) : 0,
        );
    if (version(previous) > version(incoming))
      keep([
        k.attempt,
        k.checked,
        k.retry,
        ...(mode === "archive" ? (["twitchClipCursor", "twitchClipExhaustedAt"] as const) : []),
      ]);
  }
  if ((previous.twitchClipDiagnostics?.at ?? 0) > (incoming.twitchClipDiagnostics?.at ?? 0)) {
    keep(["twitchClipDiagnostics"]);
    if (incoming.twitchClipDiagnostics) keep(["lastResponseCount"]);
  }
  if (
    (previous.lastClipFailure?.at ?? 0) >
    Math.max(
      incoming.lastClipFailure?.at ?? 0,
      clipObservationAt(incoming, "recent"),
      clipObservationAt(incoming, "archive"),
    )
  )
    keep(["lastClipFailure"]);
  return next;
}
