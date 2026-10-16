export type CacheMetricKind = 'catalog-selectors' | 'thumbnail-disk';
export type CacheMetric = { hits: number; misses: number; errors: number; lastAccessAt?: number; lastEntryBytes?: number; oldestObservedEntryAt?: number };

/** Fixed categories and counters only: never retain keys, media, or store slices. */
export function createCacheMetrics() {
  const counters: Record<CacheMetricKind, CacheMetric> = {
    'catalog-selectors': { hits: 0, misses: 0, errors: 0 },
    'thumbnail-disk': { hits: 0, misses: 0, errors: 0 },
  };
  return {
    record(kind: CacheMetricKind, result: 'hit' | 'miss' | 'error', at = Date.now(), entry?: { bytes: number; at: number }) {
      const row = counters[kind];
      if (result === 'hit') row.hits++; else if (result === 'miss') row.misses++; else row.errors++;
      row.lastAccessAt = at;
      if (entry && Number.isFinite(entry.bytes) && entry.bytes >= 0) row.lastEntryBytes = entry.bytes;
      if (entry && Number.isFinite(entry.at) && entry.at > 0) row.oldestObservedEntryAt = Math.min(row.oldestObservedEntryAt ?? entry.at, entry.at);
    },
    snapshot: () => ({ 'catalog-selectors': { ...counters['catalog-selectors'] }, 'thumbnail-disk': { ...counters['thumbnail-disk'] } }),
  };
}

export const cacheMetrics = createCacheMetrics();
