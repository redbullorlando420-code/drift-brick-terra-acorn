import type { LiveThroughput } from './youtube-live-throughput';
import type { FollowedChannel } from './types.ts';
import { selectLiveRefreshChannels, selectDueLiveRefreshChannels } from './live-refresh-selection.ts';

export const YOUTUBE_QUICK_LIVE = {
  requestChannels: 24,
  firstRequestChannels: 8,
  scheduledRequestChannels: 24,
  pipelineChannels: 8,
  pipelineRequests: 3,
  activeSweep: 192,
  quietSweep: 24,
  tickMs: 2_000,
  knownLiveMs: 60_000,
  discoveryMs: 5 * 60_000,
} as const;

/** Known-live deadlines and oldest-first discovery share each batch. */
export function selectYoutubeQuickLiveChannels(channels: readonly FollowedChannel[], limit: number, scheduled = false, now = Date.now()) {
  if (!scheduled) return selectLiveRefreshChannels(channels, 'youtube', channels.length, now).slice(0, Math.max(0, limit));
  return selectDueLiveRefreshChannels(channels, 'youtube', limit, YOUTUBE_QUICK_LIVE.knownLiveMs, YOUTUBE_QUICK_LIVE.discoveryMs, now);
}

export type YoutubeLiveProgress = {
  startedAt: number; at: number; checked: number; total: number; refreshed: number; failed: number; broadcasts: number;
  status: 'running' | 'complete' | 'partial';
  retryAt?: number; error?: string;
  automatic?: boolean;
  throughput?: LiveThroughput;
};
