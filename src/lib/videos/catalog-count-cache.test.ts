import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogCounter } from './catalog-count-cache.ts';
import { adultFolderIds } from './adult-providers.ts';
import { emptyCatalogCounts, addCountBatch, catalogCountFlags } from './catalog-counts.ts';
import type { LibraryVideo } from './types.ts';
const video = (id: string, overrides: Partial<LibraryVideo> = {}): LibraryVideo => ({ id, folderId: 'creator', name: id, path: id, addedAt: 0, mime: 'video/youtube', extension: 'yt', size: 0, remote: { kind: 'youtube' }, ...overrides });
const turn = async () => {};
const expected = (videos: LibraryVideo[], adultIds: Set<string>, hidden: Record<string, true>, hideDemo: boolean) => addCountBatch(emptyCatalogCounts(), videos.map(video => [catalogCountFlags(video, adultIds, hidden, hideDemo), 0]));

test('count snapshots preserve hidden provider totals, adult privacy, live and demo visibility', async () => {
  const counter = createCatalogCounter(), adultIds = adultFolderIds([{ id: 'private', adult: true }]), hidden: Record<string, true> = { hidden: true };
  const rows = [video('youtube'), video('hidden'), video('live', { remote: { kind: 'twitch', live: true } }), video('adult', { folderId: 'private' }), video('demo', { isSample: true }), video('reddit', { folderId: 'reddit:discover', remote: { kind: 'reddit' } })];
  const counts = await counter.count({ videos: rows, adultIds, hidden, hideDemo: true }, turn);
  assert.deepEqual(counts, { publicCount: 2, ytCount: 3, twitchCount: 1, liveCount: 1, adultCount: 2, favCount: 0, historyCount: 0 });
  assert.deepEqual(counts, expected(rows, adultIds, hidden, true));
});
test('health-only source edits reuse completed counts without inspecting 100k card fields', async () => {
  let reads = 0, turns = 0;
  const rows = Array.from({ length: 100_000 }, (_, i) => {
    const card = video(String(i)); Object.defineProperty(card, 'folderId', { get: () => { reads++; return 'creator'; } }); return card;
  });
  const counter = createCatalogCounter(), hidden = {};
  const folders = [{ id: 'creator', adult: false, lastCheckedAt: 0 }];
  const first = await counter.count({ videos: rows, adultIds: adultFolderIds(folders), hidden, hideDemo: true }, turn);
  const coldReads = reads;
  for (let i = 0; i < 100; i++) {
    const updatedFolders = [{ ...folders[0], lastCheckedAt: i }];
    assert.equal(await counter.count({ videos: rows, adultIds: adultFolderIds(updatedFolders), hidden, hideDemo: true }, async () => { turns++; }), first);
  }
  assert.equal(reads, coldReads); assert.equal(turns, 0); assert.equal(first.ytCount, 100_000);
});
test('small merges read changed metadata only and keep exact counts across replacements and removals', async () => {
  let reads = 0;
  const rows = Array.from({ length: 100_000 }, (_, i) => {
    const card = video(String(i)); Object.defineProperty(card, 'folderId', { get: () => { reads++; return 'creator'; } }); return card;
  });
  const counter = createCatalogCounter(), adultIds = new Set<string>(), hidden = {}, input = { videos: rows, adultIds, hidden, hideDemo: true };
  const first = await counter.count(input, turn); const before = reads;
  const next = [...rows]; next[50_000] = video('50000', { remote: { kind: 'twitch', live: true } }); next.push(video('appended'));
  const updated = await counter.count({ ...input, videos: next }, turn);
  assert.deepEqual(updated, expected(next, adultIds, hidden, true));
  // The expected() reference pass above reads every field; subtract it.
  assert.equal(reads - before - 99_999, 1);
  assert.equal(first.ytCount, 100_000, 'previous completed counts are immutable');
  assert.equal(updated.ytCount, 100_000); assert.equal(updated.twitchCount, 1);
  const shortened = next.slice(99995);
  assert.deepEqual(await counter.count({ ...input, videos: shortened }, turn), expected(shortened, adultIds, hidden, true));
  assert.deepEqual(await counter.count({ ...input, videos: shortened, adultIds: new Set(['creator']) }, turn), expected(shortened, new Set(['creator']), hidden, true));
});
test('concurrent readers share work and replaced passes never publish partial results', async () => {
  const counter = createCatalogCounter(), inputs = { videos: Array.from({ length: 5000 }, (_, i) => video(String(i))), adultIds: new Set<string>(), hidden: {}, hideDemo: true };
  let release!: () => void;
  const pending = counter.count(inputs, () => new Promise<void>(resolve => { release = resolve; }));
  assert.equal(counter.count(inputs), pending);
  const rejection = assert.rejects(pending, /replaced/);
  const next = counter.count({ ...inputs, videos: [video('fresh', { remote: { kind: 'twitch' } })] }, turn);
  release(); await rejection;
  assert.equal((await next).twitchCount, 1);
  assert.equal((await counter.count(inputs, turn)).ytCount, 5000, 'cancelled data was never cached as a successful count');
});
