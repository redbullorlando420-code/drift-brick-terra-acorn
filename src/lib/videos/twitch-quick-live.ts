import type { FollowedChannel } from './types.ts';
import { selectLiveRefreshChannels, selectDueLiveRefreshChannels } from './live-refresh-selection.ts';

export const TWITCH_QUICK_LIVE = {
  requestChannels: 100,
  firstRequestChannels: 100,
  activeSweep: 600,
  quietSweep: 100,
  tickMs: 2_000,
  knownLiveMs: 60_000,
  discoveryMs: 3 * 60_000,
} as const;

/** Known-live deadlines and oldest-first discovery share each batch. */
export function selectTwitchQuickLiveChannels(channels: readonly FollowedChannel[], limit: number, scheduled = false, now = Date.now()) {
  if (!scheduled) return selectLiveRefreshChannels(channels, 'twitch', channels.length, now).slice(0, Math.max(0, limit));
  return selectDueLiveRefreshChannels(channels, 'twitch', limit, TWITCH_QUICK_LIVE.knownLiveMs, TWITCH_QUICK_LIVE.discoveryMs, now);
}

