import type { FollowedChannel } from './types.ts';

/**
 * Rotate Twitch checks fairly while letting never-checked import stubs get
 * their first provider response before established channels take another turn.
 */
export function selectTwitchRefreshBatch(channels: FollowedChannel[], limit: number, cursor: number) {
  if (!channels.length || limit <= 0) return { channels: [] as FollowedChannel[], nextCursor: 0 };
  const start = ((Math.floor(cursor) % channels.length) + channels.length) % channels.length;
  const count = Math.min(Math.floor(limit), channels.length);
  const rotated = Array.from({ length: channels.length }, (_, index) => channels[(start + index) % channels.length]);
  const pending = rotated.filter(channel => !channel.channelId && !channel.lastCheckedAt && !channel.lastProviderFailure);
  const settled = rotated.filter(channel => channel.channelId || channel.lastCheckedAt || channel.lastProviderFailure);
  return { channels: [...pending, ...settled].slice(0, count), nextCursor: (start + count) % channels.length };
}
