import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectCatalogRows, forEachCatalogSlice, copyCatalogRecord } from './catalog-work.ts';
import { createPreviewUrlCache } from './videos/preview-url-cache.ts';
import { adultProviderPullBudget, planAdultPull } from './videos/adult-pull-plan.ts';

test('catalog traversals yield and cancel before processing another slice', async () => {
  let visits = 0, turns = 0;
  await assert.rejects(forEachCatalogSlice(Array(1_000_000).fill(0), () => { visits++; }, async () => {
    if (++turns === 3) throw new Error('cancelled');
  }), /cancelled/);
  assert.ok(visits <= 1024); assert.equal(turns, 3);
});

test('paged catalog iterators yield before reading and cancel without materializing the remaining million rows', async () => {
  let visited = 0, turns = 0;
  function* rows() { for (let index = 0; index < 1_000_000; index++) { visited++; yield {index}; } }
  const work = collectCatalogRows(rows(), async () => { if (++turns === 3) throw new Error('cancelled'); });
  assert.equal(visited, 0);
  await assert.rejects(work, /cancelled/); assert.ok(visited <= 1024); assert.equal(turns, 3);
  const first = { id: 1 }, second = { id: 2 };
  const collected = await collectCatalogRows(new Set([first, second]), async () => {});
  assert.deepEqual(collected, [first, second]); assert.equal(collected[0], first);
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
test('Adult provider shares reallocate unused new-entry capacity while preserving the pull cap', () => {
  const first = adultProviderPullBudget(101, 3, 0);
  const afterFirst = 29; // only five new entries were admitted from the first 34-slot share
  const second = adultProviderPullBudget(101, 3, 1, afterFirst);
  const afterSecond = 13; // fifty new entries were admitted from the expanded 63-slot share
  const third = adultProviderPullBudget(101, 3, 2, afterSecond);
  assert.deepEqual([first, second, third], [34, 63, 46]);
  assert.equal(5 + 50 + 46, 101);
  assert.equal(adultProviderPullBudget(101, 3, 1, 10_000), 101);
});
