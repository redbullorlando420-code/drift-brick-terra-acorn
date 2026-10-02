import type { FollowedChannel, LibraryVideo } from '../videos/types';
import type { PullRecord } from './pull-ledger';

export type YoutubeCooldown = { retryAt: number; error?: string; cooldownScope?: 'catalog' | 'all' };
export type RefreshFollowsResult = {
  wentLive: FollowedChannel[];
  newVideos: LibraryVideo[];
  pull?: PullRecord;
  skipped?: 'cooldown' | 'busy' | 'empty';
  retryAt?: number;
};
// v1 inferred a provider-wide block from any live/RSS failure. Do not restore
// that ambiguous checkpoint after upgrading to endpoint-specific cooldowns.
const KEY = 'reelcase.youtube-cooldown.v2';

export function youtubeCooldownMessage(retryAt: number, error?: string) {
  const code = error?.match(/HTTP (\d{3})/)?.[1] ?? '429';
  const reason = /unusual traffic/i.test(error ?? '') ? `Google reported unusual traffic from this network (HTTP ${code})` : `YouTube returned HTTP ${code}`;
  return `${reason}. We recommend waiting until ${new Date(retryAt).toLocaleTimeString()}, but you can force a pull now. Cached videos and archive positions are preserved.`;
}

export function clearYoutubeCooldown() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch { /* Durable follows also clear recovered deadlines. */ }
}

/** Small independent checkpoint; the durable follow ledger also retains this
 * deadline when localStorage is full. Never store the video catalog here. */
export function saveYoutubeCooldown(cooldown: YoutubeCooldown) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(cooldown)); } catch { /* Follow ledger is the fallback. */ }
}
export function restoreYoutubeCooldown(follows: readonly FollowedChannel[], now = Date.now()): YoutubeCooldown | null {
  let latest: YoutubeCooldown | null = null;
  const accept = (value: YoutubeCooldown | null | undefined) => {
    if (value && (value.cooldownScope === 'catalog' || value.cooldownScope === 'all') && Number.isFinite(value.retryAt) && value.retryAt > now && value.retryAt > (latest?.retryAt ?? 0)) latest = value;
  };
  if (typeof window !== 'undefined') {
    try { accept(JSON.parse(window.localStorage.getItem(KEY) ?? 'null')); } catch { /* Invalid or unavailable storage. */ }
  }
  for (const follow of follows) {
    const failure = follow.kind === 'youtube' ? follow.lastProviderFailure : undefined;
    if (failure?.kind === 'rate-limited' && failure.retryAt && (failure.cooldownScope === 'all' || failure.cooldownScope === 'catalog')) accept({ retryAt: failure.retryAt, error: failure.message, cooldownScope: failure.cooldownScope });
  }
  return latest;
}
