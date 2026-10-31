import { youtubeLiveInterval } from './youtube-events';
import type { FollowedChannel, ProviderFailure } from './types';
import { verifiedYoutubeSource } from './follow-import';
import { selectYoutubeQuickLiveChannels, YOUTUBE_QUICK_LIVE } from './youtube-quick-live';

/** Live failures are independent of archive health and successful observations.
 * A failing creator backs off durably without consuming each discovery turn. */
export function youtubeLiveFailure(previous: FollowedChannel, failure: ProviderFailure): ProviderFailure {
  const count = previous.lastLiveFailure?.attempts ?? 0;
  const attempts = Math.min(8, (Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0) + 1);
  const base = failure.kind === 'unavailable' ? 5 * 60_000 : 30_000;
  const retryAt = failure.cooldownScope && failure.retryAt && failure.retryAt > failure.at
    ? failure.retryAt : Math.max(failure.retryAt ?? 0, failure.at + Math.min(15 * 60_000, base * 2 ** (attempts - 1)));
  return { ...failure, attempts, retryAt, recovery: failure.cooldownScope
    ? 'Live checks wait for the provider cooldown. Your last successful status and the archive are preserved.'
    : `This creator will retry after a short backoff. Other creators keep checking; saved videos and the last successful live status are preserved.` };
}

export function uniqueYoutubeLiveCreators(channels: readonly FollowedChannel[]) {
  const unique = new Map<string, FollowedChannel>();
  for (const channel of channels) {
    if (!verifiedYoutubeSource(channel) || channel.id.startsWith('ytpl:')) continue;
    const key = channel.channelId || channel.id.slice(3), previous = unique.get(key);
    if (!previous) { unique.set(key,channel); continue; }
    const attempt = (c: FollowedChannel) => Math.max(c.liveCheckedAt ?? 0,c.lastLiveFailure?.at ?? 0,c.youtubeLiveEvidence?.at ?? 0);
    const latest = attempt(channel)>attempt(previous) ? channel : previous;
    const checked = Math.max(previous.liveCheckedAt ?? 0,channel.liveCheckedAt ?? 0) || undefined;
    const failure = (channel.lastLiveFailure?.at ?? 0) > (previous.lastLiveFailure?.at ?? 0) ? channel.lastLiveFailure : previous.lastLiveFailure;
    unique.set(key,{...latest,id:previous.id,liveCheckedAt:checked,lastLiveFailure:failure && failure.at >= (checked ?? 0) ? failure : undefined});
  }
  return [...unique.values()].map(channel=>channel.lastLiveFailure && channel.lastLiveFailure.at < (channel.liveCheckedAt ?? 0) ? {...channel,lastLiveFailure:undefined}:channel);
}
export type YoutubeLiveQueueRow = {channel:FollowedChannel; status:'due'|'waiting'|'fresh'; lastSuccessAt?:number; lastAttemptAt?:number; nextAt:number; failed:boolean; neverChecked:boolean};
export function youtubeLiveCoverage(channels: readonly FollowedChannel[], now = Date.now()) {
  let total = 0, recent = 0, failed = 0, unchecked = 0, cooling = 0;
  let nextRetryAt: number | undefined;
  const failures: FollowedChannel[] = [];
  const creators = uniqueYoutubeLiveCreators(channels), queue: YoutubeLiveQueueRow[] = [];
  for (const channel of creators) {
    if (!verifiedYoutubeSource(channel) || channel.id.startsWith('ytpl:')) continue;
    total++;
    const checked = channel.liveCheckedAt ?? 0, failure = channel.lastLiveFailure;
    // Older versions advanced liveCheckedAt on failure. Equal timestamps are
    // ambiguous, so don't call them successful observations in coverage.
    const hasSuccess = checked > 0 && (!failure || checked !== failure.at);
    if (!hasSuccess) unchecked++;
    const latestFailed = Boolean(failure && (!Number.isFinite(failure.at) || failure.at >= checked));
    if (hasSuccess && !latestFailed && now >= checked && now - checked < 5 * 60_000) recent++;
    if (latestFailed) { failed++; failures.push(channel); }
    if (latestFailed && failure?.retryAt && failure.retryAt > now) {
      cooling++; nextRetryAt = Math.min(nextRetryAt ?? Infinity, failure.retryAt);
    }
    const nextAt = Math.max(checked > 0 ? checked + youtubeLiveInterval(channel,now,YOUTUBE_QUICK_LIVE.knownLiveMs,YOUTUBE_QUICK_LIVE.discoveryMs) : 0, latestFailed ? failure?.retryAt ?? 0 : 0);
    queue.push({channel,status:latestFailed && (failure?.retryAt ?? 0)>now ? 'waiting' : nextAt<=now ? 'due' : 'fresh',lastSuccessAt:hasSuccess?checked:undefined,lastAttemptAt:Math.max(checked,failure?.at??0,channel.youtubeLiveEvidence?.at??0)||undefined,nextAt,failed:latestFailed,neverChecked:!hasSuccess});
  }
  const due = selectYoutubeQuickLiveChannels(creators, creators.length, true, now);
  const dueSet = new Set(due.map(c=>c.id));
  for(const row of queue) if(row.status!=='waiting') row.status=dueSet.has(row.channel.id)?'due':'fresh';
  failures.sort((a, b) => (b.lastLiveFailure?.at ?? 0) - (a.lastLiveFailure?.at ?? 0) || a.id.localeCompare(b.id));
  return { total, recent, failed, unchecked, due: due.length, dueIds: due.map(channel => channel.id), cooling, nextRetryAt, failures: failures.slice(0, 8), queue };
}

/** Recover the provider live deadline from the existing durable follow ledger,
 * without another storage write or trusting archive-only failures. */
export function youtubeLiveCooldown(channels: readonly FollowedChannel[], now = Date.now()) {
  let latest: ProviderFailure | undefined;
  for (const channel of channels) {
    const failure = channel.kind === 'youtube' ? channel.lastLiveFailure : undefined;
    if (failure && (failure.cooldownScope === 'live' || failure.cooldownScope === 'all')
      && (failure.retryAt ?? 0) > Math.max(now, latest?.retryAt ?? 0)) latest = failure;
  }
  return latest;
}
