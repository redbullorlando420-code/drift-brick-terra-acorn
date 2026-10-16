import assert from 'node:assert/strict';
import { test } from 'node:test';
import { youtubeRankingDemand } from './youtube-ranking-demand.ts';

test('returning from a viewer reuses completed shelves and deep pages without retaining a worker', () => {
  const inputs = {}, shelf = { inputs, seed: 1 }, page = { ...shelf, videos: Array(192), total: 60_000 };
  assert.equal(youtubeRankingDemand(inputs, 1, false, shelf, undefined).build, false);
  assert.equal(youtubeRankingDemand(inputs, 1, true, shelf, page).build, false);
  assert.deepEqual(youtubeRankingDemand(inputs, 1, true, undefined, undefined), { build: true, pageOffset: 0 });
});

test('an explicit next page rebuilds the released worker and resumes exactly after the painted prefix', () => {
  const inputs = {}, shelf = { inputs, seed: 7 }, page = { ...shelf, videos: Array(192), total: 60_000 };
  assert.deepEqual(youtubeRankingDemand(inputs, 7, true, shelf, page, { ...shelf, offset: 192 }), { build: true, pageOffset: 192 });
  assert.equal(youtubeRankingDemand(inputs, 7, true, shelf, page, { ...shelf, offset: 96 }).build, false);
  assert.equal(youtubeRankingDemand(inputs, 7, true, shelf, { ...page, total: 192 }, { ...shelf, offset: 192 }).build, false);
});

test('new taste, filter, catalog or mix inputs cannot reuse old results or apply an old pending offset', () => {
  const inputs = {}, changed = {}, shelf = { inputs, seed: 3 }, page = { ...shelf, videos: Array(96), total: 1000 }, demand = { ...shelf, offset: 96 };
  assert.deepEqual(youtubeRankingDemand(changed, 3, true, shelf, page, demand), { build: true, pageOffset: 0 });
  assert.deepEqual(youtubeRankingDemand(inputs, 4, true, shelf, page, demand), { build: true, pageOffset: 0 });
  assert.deepEqual(youtubeRankingDemand(changed, 3, false, shelf, page, demand), { build: true, pageOffset: undefined });
});

test('revealing deep discovery prepares its first page while collapsing it discards a pending deep request', () => {
  const inputs = {}, shelf = { inputs, seed: 1 }, page = { ...shelf, videos: Array(96), total: 1000 };
  assert.deepEqual(youtubeRankingDemand(inputs, 1, true, shelf, undefined), { build: true, pageOffset: 0 });
  assert.equal(youtubeRankingDemand(inputs, 1, false, shelf, page, { ...shelf, offset: 96 }).build, false);
});
