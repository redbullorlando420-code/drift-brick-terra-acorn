import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forEachCatalogSlice, copyCatalogRecord } from './catalog-work.ts';
import { createPreviewUrlCache } from './videos/preview-url-cache.ts';
import { planAdultPull } from './videos/adult-pull-plan.ts';

test('catalog traversals yield and cancel before processing another slice', async () => {
  let visits = 0, turns = 0;
  await assert.rejects(forEachCatalogSlice(Array(1_000_000).fill(0), () => { visits++; }, async () => {
    if (++turns === 3) throw new Error('cancelled');
  }), /cancelled/);
  assert.ok(visits <= 1024); assert.equal(turns, 3);
});
test('large record copies are immutable, preserve unusual ids, and yield repeatedly', async () => {
  const source = Object.fromEntries(Array.from({ length: 100_000 }, (_, index) => [`id:${index}`, index]));
  Object.defineProperty(source, '__proto__', { value: 4, enumerable: true });
  let turns = 0;
  const copy = await copyCatalogRecord(source, async () => { turns++; });
  assert.ok(turns >= 196); assert.equal(copy['id:99999'], 99999);
  assert.ok(Object.hasOwn(copy, '__proto__')); assert.equal(Object.getPrototypeOf(copy), Object.prototype);
  copy['id:1'] = -1; assert.equal(source['id:1'], 1);
});
test('URL cache bounds long sessions and skips unchanged successful previews', () => {
  const cache = createPreviewUrlCache(2400);
  for (let i = 0; i < 100_000; i++) cache.remember(`v${i}`, { poster: `https://example.com/${i}.jpg`, at: i });
  assert.equal(cache.size(), 2400); assert.equal(cache.get('v1'), undefined);
  assert.equal(cache.remember('v99999', { poster: 'https://example.com/99999.jpg', at: 200_000 }), false);
  cache.remember('v99999', { previewUrl: 'https://example.com/preview.jpg', at: 200_000 });
  assert.equal(cache.get('v99999')?.poster, 'https://example.com/99999.jpg');
  const restored = createPreviewUrlCache(2400); restored.hydrate(cache.serialize());
  assert.equal(restored.size(), 2400); assert.deepEqual(restored.get('v99999'), cache.get('v99999'));
});
test('Adult sweep rotates untouched providers and skips cooldowns', () => {
  const cursors = { eporner: { page: 3, query: 'all', order: 'latest', updatedAt: 90 }, redtube: { page: 5, query: 'all', order: 'latest', updatedAt: 0, retryAt: 200 } };
  assert.deepEqual(planAdultPull(cursors, 100), ['chaturbate', 'myfreecams']);
  assert.equal(planAdultPull(cursors, 300, 1)[0], 'redtube');
});
