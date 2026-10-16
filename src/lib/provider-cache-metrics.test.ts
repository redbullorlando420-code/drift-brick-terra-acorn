import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateProviderCache, estimateProviderPayload, normalizeProviderCache } from './provider-cache-metrics.ts';
import { createCacheMetrics } from './cache-metrics.ts';
test('cache counters retain only fixed numeric categories and return independent snapshots', () => {
  const metrics = createCacheMetrics(); metrics.record('thumbnail-disk', 'hit', 200, { bytes: 50, at: 100 });
  metrics.record('thumbnail-disk', 'error', 201);
  const sample = metrics.snapshot(); sample['thumbnail-disk'].hits = 400;
  assert.equal(metrics.snapshot()['thumbnail-disk'].hits, 1);
  assert.deepEqual(metrics.snapshot()['thumbnail-disk'], { hits: 1, misses: 0, errors: 1, lastAccessAt: 201, lastEntryBytes: 50, oldestObservedEntryAt: 100 });
});
test('provider samples preserve optional size metadata and omit invalid or identifying fields', () => {
  const sample = { at: 100, hits: 3, misses: 1, scope: 'catalog', entries: 20, estimatedBytes: 400, channelId: 'private' };
  assert.deepEqual(normalizeProviderCache(sample), { at: 100, hits: 3, misses: 1, scope: 'catalog', entries: 20, estimatedBytes: 400 });
  assert.equal(normalizeProviderCache({ ...sample, at: NaN }), undefined);
  assert.equal(normalizeProviderCache({ ...sample, scope: 'garbage' }), undefined);
  const aggregate = aggregateProviderCache([{ kind: 'youtube', cache: normalizeProviderCache(sample) }, { kind: 'youtube', cache: { at: 200, hits: 0, misses: 1, scope: 'uncached' } }], 300);
  assert.equal(aggregate[0].estimatedBytes, 400); assert.equal(aggregate[0].uncached, 1); assert.equal(aggregate[0].oldestAgeMs, 200);
  assert.equal(aggregate[1].oldestAgeMs, undefined);
  assert.equal(estimateProviderPayload([{ name: 'abc', size: 1, remote: { title: 'def' } }]), 20);
});
