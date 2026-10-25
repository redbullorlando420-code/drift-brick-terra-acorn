import type { RefreshResult } from '../remote/api';

/** Coalesce responses already received, without waiting for a slower batch.
 * This bounds catalog reconciliation and follow notifications to 24 creators. */
export function mergeYoutubeLiveResults(left: RefreshResult, right: RefreshResult): RefreshResult {
  const providerRetryAt = Math.max(left.providerRetryAt ?? 0, right.providerRetryAt ?? 0) || undefined;
  const providerCooldownScope = left.providerCooldownScope === 'all' || right.providerCooldownScope === 'all' ? 'all'
    : (right.providerRetryAt ?? 0) > (left.providerRetryAt ?? 0) ? right.providerCooldownScope : left.providerCooldownScope;
  return {
    channels: [...left.channels, ...right.channels], videos: [...left.videos, ...right.videos],
    refreshedIds: [...left.refreshedIds, ...right.refreshedIds],
    liveCheckedIds: [...left.liveCheckedIds ?? left.refreshedIds, ...right.liveCheckedIds ?? right.refreshedIds],
    retryAt: { ...left.retryAt, ...right.retryAt }, providerRetryAt, providerCooldownScope,
  };
}
