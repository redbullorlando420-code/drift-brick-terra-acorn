import type { FollowedChannel } from './types';

export const YOUTUBE_LIVE_HOLD_MS = 10 * 60_000;

/** A single missing broadcast must not end a stream. Failed checks do not
 * advance this timer; a fresh positive observation clears it. */
export function retainYoutubeLiveFollow(previous: FollowedChannel | undefined, incoming: FollowedChannel, checked: boolean) {
  if (incoming.kind !== 'youtube' || incoming.lastLiveFailure) return incoming;
  if (incoming.live) return incoming.liveOfflineSince === undefined ? incoming : { ...incoming, liveOfflineSince: undefined };
  if (!checked || incoming.youtubeLiveEvidence && !incoming.youtubeLiveEvidence.complete) return {...incoming,live:previous?.live ?? incoming.live,liveOfflineSince:previous?.liveOfflineSince};
  if (!previous?.live) return incoming;
  const at = incoming.liveCheckedAt ?? 0;
  if (!at || at < (previous.liveCheckedAt ?? 0)) return incoming;
  const since = previous.liveOfflineSince && previous.liveOfflineSince <= at ? previous.liveOfflineSince : at;
  return { ...incoming, live: at - since < YOUTUBE_LIVE_HOLD_MS, liveOfflineSince: since };
}
