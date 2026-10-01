import test from 'node:test';
import assert from 'node:assert/strict';
import { walkAdultPull } from './adult-pull-walk.ts';
import { normalizePullSettings, DEFAULT_PULL_SETTINGS } from '../pull-settings.ts';
import { copyCatalogArray } from '../catalog-work.ts';
import { cachedBooruOriginal } from './booru-original-cache.ts';

test('a 10,000-entry pull walks 100-entry pages with bounded requests', async () => {
  let requests = 0, turns = 0;
  const result = await walkAdultPull(10_000, 1, 0, async (page, offset, limit) => {
    requests++; assert.ok(limit <= 400); assert.equal(offset, 0);
    return { videos: Array.from({ length: Math.min(100, limit) }, (_, i) => ({ id: `${(page - 1) * 100 + i}` })), nextPage: page + 1, nextOffset: 0 };
  }, async () => { turns++; });
  assert.equal(result.videos.length, 10_000); assert.equal(requests, 100); assert.equal(turns, 100); assert.equal(result.latest?.nextPage, 101);
  assert.equal(DEFAULT_PULL_SETTINGS.adultBatchVideos, 2000);
  assert.equal(normalizePullSettings({ adultBatchVideos: 1_000_000 }).adultBatchVideos, 10000);
  assert.equal(normalizePullSettings({ adultBatchVideos: 100 }).adultBatchVideos, 100);
});
test('partial pages retain offsets, dedupe ids and stop at exhaustion', async () => {
  const cursors: number[][] = [];
  const result = await walkAdultPull(5, 3, 7, async (page, offset, limit) => {
    cursors.push([page, offset, limit]);
    return offset === 7 ? { videos: [{ id: 'a' }, { id: 'b' }], nextPage: 3, nextOffset: 9 } : { videos: [{ id: 'b' }, { id: 'c' }], nextPage: null, nextOffset: 0 };
  }, async () => {});
  assert.deepEqual(cursors, [[3, 7, 5], [3, 9, 3]]); assert.deepEqual(result.videos.map(v => v.id), ['a', 'b', 'c']);
});
test('errors retain accepted windows, cancellation prevents later requests, stuck cursors stop', async () => {
  const partial = await walkAdultPull(1000, 1, 0, async page => {
    if (page === 2) throw new Error('provider offline');
    return { videos: [{ id: 'a' }], nextPage: 2, nextOffset: 0 };
  }, async () => {});
  assert.equal(partial.videos.length, 1); assert.equal(partial.latest?.nextPage, 2); assert.ok(partial.error);
  let turns = 0, requests = 0;
  await assert.rejects(walkAdultPull(1000, 1, 0, async page => { requests++; return { videos: [{ id: 'a' }], nextPage: page + 1, nextOffset: 0 }; }, async () => { if (++turns === 2) throw new Error('cancelled'); }), /cancelled/);
  assert.equal(requests, 1);
  const stuck = await walkAdultPull(1000, 1, 0, async page => { requests++; return { videos: [{ id: 'a' }], nextPage: page, nextOffset: 0 }; }, async () => {});
  assert.equal(stuck.videos.length, 1); assert.equal(requests, 2);
});
test('million-entry reference copies yield and preserve immutable order', async () => {
  const source = Array.from({ length: 1_000_000 }, (_, id) => ({ id }));
  let turns = 0;
  const copy = await copyCatalogArray(source, async () => { turns++; });
  assert.ok(turns >= 1954); assert.notEqual(copy, source); assert.equal(copy[999999], source[999999]);
  copy[0] = { id: -1 }; assert.equal(source[0]?.id, 0);
});
test('original image cache shares requests and retries missing originals', async () => {
  let calls = 0;
  const resolve = async () => { calls++; return 'https://cdn.test/original.png'; };
  assert.equal(await cachedBooruOriginal('test', '1', resolve), await cachedBooruOriginal('test', '1', resolve)); assert.equal(calls, 1);
  await cachedBooruOriginal('test', '2', async () => null);
  assert.equal(await cachedBooruOriginal('test', '2', resolve), 'https://cdn.test/original.png'); assert.equal(calls, 2);
});
