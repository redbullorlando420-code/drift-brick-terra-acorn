import type { FollowedChannel } from './types.ts';

/**
 * Rotate Twitch checks fairly while letting never-checked import stubs get
 * their first provider response before established channels take another turn.
 */
export function selectTwitchRefreshBatch(channels: FollowedChannel[], limit: number, cursor: number, scope: 'archive' | 'live' | 'recent' = 'archive', now = Date.now()) {
  if (!channels.length || limit <= 0) return { channels: [] as FollowedChannel[], nextCursor: 0 };
  const start = ((Math.floor(cursor) % channels.length) + channels.length) % channels.length;
  const count = Math.min(Math.floor(limit), channels.length);
  const rotated = Array.from({ length: channels.length }, (_, index) => channels[(start + index) % channels.length]);
  const eligible = rotated.filter(channel => (scope === 'recent' ? channel.recentPull?.retryAt ?? 0 : channel[scope === 'live' ? 'twitchLiveRetry' : 'twitchArchiveRetry']?.retryAt ?? 0) <= now);
  const pending = eligible.filter(channel => !channel.channelId && !channel.lastCheckedAt && !channel.lastProviderFailure);
  const settled = eligible.filter(channel => channel.channelId || channel.lastCheckedAt || channel.lastProviderFailure);
  // Live checks also update lastCheckedAt. Archive scheduling uses its own
  // durable timestamp so frequently live creators cannot distort rotation.
  if (scope === 'archive') settled.sort((a,b) => (a.twitchArchiveCheckedAt ?? a.twitchArchiveDiagnostics?.at ?? 0) - (b.twitchArchiveCheckedAt ?? b.twitchArchiveDiagnostics?.at ?? 0));
  if (scope === 'recent') settled.sort((a,b) => (a.recentPull?.attemptedAt ?? 0) - (b.recentPull?.attemptedAt ?? 0) || a.id.localeCompare(b.id));
  return { channels: [...pending, ...settled].slice(0, count), nextCursor: (start + count) % channels.length };
}
