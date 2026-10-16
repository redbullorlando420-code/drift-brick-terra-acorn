export type ProviderCacheSample = { at: number; hits: number; misses: number; scope: 'feed' | 'catalog' | 'uncached'; entries?: number; estimatedBytes?: number };
const natural = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
export function normalizeProviderCache(value: unknown): ProviderCacheSample | undefined {
  if (!value || typeof value !== 'object') return;
  const row = value as Record<string, unknown>;
  if (!natural(row.at) || typeof row.hits !== 'number' || !Number.isFinite(row.hits) || typeof row.misses !== 'number' || !Number.isFinite(row.misses) || !['feed', 'catalog', 'uncached'].includes(String(row.scope))) return;
  return { at: row.at, hits: Math.max(0, Math.floor(row.hits)), misses: Math.max(0, Math.floor(row.misses)), scope: row.scope as ProviderCacheSample['scope'],
    ...(natural(row.entries) ? { entries: Math.floor(row.entries) } : {}), ...(natural(row.estimatedBytes) ? { estimatedBytes: Math.floor(row.estimatedBytes) } : {}) };
}
/** Approximate retained string/scalar payload, excluding JS object overhead.
 * Called once on cache insertion; no JSON clone or retained media graph. */
export function estimateProviderPayload(rows: readonly object[]): number {
  let bytes = 0;
  const visit = (row: object, depth: number) => {
    for (const value of Object.values(row)) {
      if (typeof value === 'string') bytes += value.length * 2;
      else if (typeof value === 'number' || typeof value === 'boolean') bytes += 8;
      else if (value && typeof value === 'object' && depth < 3) visit(value, depth + 1);
    }
  };
  for (const row of rows) visit(row, 0);
  return bytes;
}
/** Latest saved per-creator observations, never a claim of live server inventory. */
export function aggregateProviderCache(rows: readonly { kind: string; cache?: ProviderCacheSample }[], now: number) {
  return (['youtube', 'twitch'] as const).map(kind => {
    const samples = rows.filter(row => row.kind === kind && row.cache).map(row => row.cache!);
    const retained = samples.filter(row => row.scope !== 'uncached');
    return { kind, samples: samples.length, hits: samples.reduce((n, row) => n + row.hits, 0), misses: samples.reduce((n, row) => n + row.misses, 0),
      uncached: samples.length - retained.length, sizedSamples: retained.filter(row => row.estimatedBytes !== undefined).length,
      estimatedBytes: retained.reduce((n, row) => n + (row.estimatedBytes ?? 0), 0), entries: retained.reduce((n, row) => n + (row.entries ?? 0), 0),
      oldestAgeMs: samples.length ? Math.max(0, ...samples.map(row => now - row.at)) : undefined };
  });
}
