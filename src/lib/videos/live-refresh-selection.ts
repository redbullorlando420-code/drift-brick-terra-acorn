import type { FollowedChannel } from './types.ts';

/** Re-evaluated at each network batch, so discovery cannot hold up a creator
 * whose next live check became due during a slow response. Reserve discovery
 * slots even when live deadlines are overdue. Successful timestamps persist
 * the rotation; a turn's attempted set prevents retrying a failed prefix. */
export function selectDueLiveRefreshChannels(channels: readonly FollowedChannel[], kind: 'youtube' | 'twitch', limit: number, knownLiveMs: number, discoveryMs: number, now = Date.now()) {
  const due = selectLiveRefreshChannels(channels, kind, channels.length, now).filter(channel =>
    !channel.liveCheckedAt || now - channel.liveCheckedAt >= (channel.live ? knownLiveMs : discoveryMs));
  const live = due.filter(channel => channel.live), discovery = due.filter(channel => !channel.live);
  const count = Math.max(0, Math.floor(limit));
  const urgent = live.some(channel => now - (channel.liveCheckedAt ?? 0) >= knownLiveMs * 1.5);
  // A large discovery debt must shrink even when known-live checks are late.
  // Otherwise a small urgent prefix consumes 75% of every turn indefinitely.
  const discoveryBacklog = discovery.length >= count * 4;
  const liveSlots = Math.min(live.length, Math.ceil(count * (discoveryBacklog ? .25 : urgent ? .75 : .5)));
  return [...live.slice(0, liveSlots), ...discovery.slice(0, count - liveSlots),
    ...live.slice(liveSlots, liveSlots + Math.max(0, count - liveSlots - discovery.length))];
}

/** Live checks have their own health and least-recently-checked order. Archive
 * failures/cursors must neither starve new broadcasts nor retire known ones. */
export function selectLiveRefreshChannels(channels: readonly FollowedChannel[], kind?: 'youtube' | 'twitch', limit = channels.length, now = Date.now()) {
  const eligible = channels.filter(channel => (!kind || channel.kind === kind)
    && (channel.kind === 'twitch'
      ? (channel.twitchLiveRetry?.retryAt ?? 0) <= now
      : !channel.importNeedsReview && !channel.id.startsWith('ytpl:')
        && Boolean(channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id))
        && ((channel.lastLiveFailure?.at === undefined || channel.lastLiveFailure.at >= (channel.liveCheckedAt ?? 0)) ? channel.lastLiveFailure?.retryAt ?? 0 : 0) <= now))
    .sort((a,b) => (a.liveCheckedAt ?? 0) - (b.liveCheckedAt ?? 0) || a.id.localeCompare(b.id));
  const count = Math.max(0, Math.floor(limit)), active = eligible.filter(channel => channel.live), discovery = eligible.filter(channel => !channel.live);
  const activeSlots = Math.min(active.length, Math.ceil(count / 2));
  const result = [...active.slice(0,activeSlots), ...discovery.slice(0,count-activeSlots)];
  if(result.length<count)result.push(...active.slice(activeSlots,activeSlots+count-result.length));
  return result;
}
