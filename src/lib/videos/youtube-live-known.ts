import type { FollowedChannel } from './types';
import { youtubeLiveFailure } from './youtube-live-health.ts';
/** Legacy cards may predate the compact follow-level broadcast ledger. A
 * watch-only result is complete only for the identities actually sent. */
export function reconcileYoutubeKnownBroadcasts(incoming: FollowedChannel, sent: FollowedChannel | undefined, savedIds: readonly string[], observedIds: readonly string[], checked: boolean) {
  if (incoming.kind !== 'youtube' || !incoming.youtubeLiveEvidence) return {channel:incoming,checked,success:true};
  const known = [...new Set([...(incoming.youtubeLiveVideoIds ?? []),...savedIds,...observedIds].filter(id=>/^[A-Za-z0-9_-]{11}$/.test(id)))];
  let channel:FollowedChannel = {...incoming,youtubeLiveVideoIds:known.slice(0,64),youtubeLiveKnownOverflow:known.length>64 || incoming.youtubeLiveKnownOverflow || undefined};
  if (checked && channel.youtubeLiveEvidence!.source === 'watch') {
    const covered = new Set([...(sent?.youtubeLiveVideoIds ?? []),...observedIds]);
    if (sent?.youtubeLiveKnownOverflow || savedIds.some(id=>!covered.has(id))) {
      const at = channel.youtubeLiveEvidence!.at;
      channel={...channel,live:observedIds.length>0 || sent?.live,youtubeLiveEvidence:{...channel.youtubeLiveEvidence!,complete:false,state:observedIds.length?'live':'unknown',reason:'partial-streams'},
        ...(observedIds.length?{}:{lastLiveFailure:youtubeLiveFailure(sent ?? channel,{at,kind:'unavailable',message:'Some saved broadcasts were outside this exact check. Their prior live status was kept.',recovery:''}),liveCheckedAt:sent?.liveCheckedAt})};
      return {channel,checked:false,success:observedIds.length>0};
    }
  }
  return {channel,checked,success:true};
}
