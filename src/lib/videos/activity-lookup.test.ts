import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityLookup, activityLookupAsync, activityCandidates, activityCandidatesAsync } from './activity-lookup.ts';
import { countActivityMatches, prepareActivityCounts, countActivityMatchesAsync } from './catalog-counts.ts';
import { selectSavedCards, selectSavedCardsAsync } from './saved-library.ts';
import { buildFavoriteRails } from './favorite-rails.ts';
import { buildContinueInsights } from './continue-insights.ts';
import { SliceWriter } from '../slice-writer.ts';
import type { LibraryVideo } from './types';
import { patchSparseRecord, removeSparseRecordKeys } from '../sparse-record.ts';

const card = (id: string, overrides: Partial<LibraryVideo> = {}): LibraryVideo => ({ id, folderId: 'public', name: id, path: id, extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: 0, ...overrides });

test('Continue diagnostics yield through dense marks, reject invalid marks and preserve stale and linked counts', async () => {
  const videos = Array.from({ length: 3000 }, (_, i) => card(String(i)));
  const progress = Object.fromEntries(videos.map(video => [video.id, { t: 20, d: 100, at: 1 }]));
  Object.assign(progress, { invalid: { t: NaN, d: 10, at: 1 }, overrun: { t: 20, d: 10, at: 1 }, fresh: { t: 5, d: 20, at: 200 * 86_400_000 } });
  let turns = 0;
  const counts = await buildContinueInsights(videos, progress, video => Number(video.id) % 2 ? progress[video.id] : undefined, 200 * 86_400_000, async () => { turns++; });
  assert.deepEqual(counts, { valid: 3001, stale: 3000, linked: 1500 }); assert.ok(turns >= 12);
  await assert.rejects(buildContinueInsights(videos, progress, () => undefined, 0, async () => { throw Error('replaced'); }), /replaced/);
});

test('warm activity lookups still yield while preparing many keys; cancelled preparation never writes false misses', async () => {
  const videos = Array.from({ length: 4000 }, (_, index) => card(String(index)));
  const keys = videos.map(video => video.id);
  activityLookup(videos, keys);
  let turns = 0;
  assert.equal((await activityLookupAsync(videos, keys, async () => { turns++; })).size, 4000);
  assert.ok(turns >= 8);
  let requested = 0;
  function* requests() { for (let i = 0; i < 4000; i++) { requested++; yield String(i); } }
  await assert.rejects(activityLookupAsync([...videos], requests(), async () => { throw Error('cancel keys'); }), /cancel keys/);
  assert.equal(requested, 0, 'cancel before allocating dense request maps');
  assert.equal(activityLookup(videos, ['3999']).get('3999')?.[0], videos[3999]);
});

test('cooperative candidate and favorite selection retain catalog order, collisions and privacy rules', async () => {
  const videos = [card('a', { src: 'shared' }), card('b', { src: 'shared' }), card('private', { folderId: 'adult' }), card('hidden'), card('demo', { isSample: true })];
  const turn = async () => {};
  assert.deepEqual(await activityCandidatesAsync(videos, ['shared'], ['b', 'a'], turn), activityCandidates(videos, ['shared'], ['b', 'a']));
  const favorites = { a: true, private: true, hidden: true, demo: true } as const, likes = { b: true, a: true } as const;
  for (const adult of [false, true]) assert.deepEqual(await selectSavedCardsAsync(videos, favorites, likes, new Set(['adult']), adult, { hidden: true }, true, turn), selectSavedCards(videos, favorites, likes, new Set(['adult']), adult, { hidden: true }, true));
});

test('activity preparation and final counting yield without changing repeated event or saved-ID totals', async () => {
  const videos = Array.from({ length: 2000 }, (_, index) => card(String(index)));
  const favorites = Object.fromEntries(videos.map(video => [video.id, true])) as Record<string, true>;
  const history = videos.flatMap(video => [{ id: video.id, at: 1 }, { id: video.id, at: 2 }]);
  let turns = 0;
  const turn = async () => { turns++; };
  const input = await prepareActivityCounts(favorites, { '0': true }, history, turn);
  const matches = await activityLookupAsync(videos, input.keys, turn);
  const actual = await countActivityMatchesAsync(matches, input.saved, input.events, new Set(), { '1': true }, false, turn);
  assert.deepEqual(actual, { favCount: 1999, historyCount: 3998 });
  assert.ok(turns >= 16);
});

test('favorite preview shelves retain bounded candidates while counting the complete saved list', async () => {
  const videos = Array.from({ length: 10000 }, (_, index) => card(String(index), { addedAt: index, ...(index % 2 ? { remote: { kind: 'youtube', videoId: String(index) } } : {}) }));
  const progress = { '0': { t: 3, d: 10, at: 20000 } };
  let turns = 0;
  const hearts = Object.fromEntries(videos.map(video => [video.id, true])) as Record<string, true>;
  const result = await buildFavoriteRails(videos, progress, async () => { turns++; }, hearts, { '0': true, evicted: true });
  assert.equal(videos.length, 10000);
  assert.equal(result.localCount, 5000);
  assert.equal(result.savedCount, 10001);
  assert.equal(result.heartsCount, 10000);
  assert.equal(result.likesCount, 1);
  assert.equal(result.youtube.length, 48);
  assert.equal(result.movies.length, 48);
  assert.equal(result.recent.length, 48);
  assert.equal(result.recent[0].id, '0');
  assert.deepEqual(result.continued.map(video => video.id), ['0']);
  assert.equal(new Set(result.recent.map(video => video.id)).size, 48);
  assert.ok(turns >= 40);
});

test('an empty private scope never enumerates a large saved ledger', async () => {
  const ledger = new Proxy({}, { ownKeys() { throw new Error('unused saved ledger scanned'); } }) as Record<string, true>;
  assert.deepEqual(selectSavedCards([], ledger, ledger, new Set(), true, {}, false), []);
  assert.deepEqual(await selectSavedCardsAsync([], ledger, ledger, new Set(), true, {}, false, async () => {}), []);
});

test('saved background paths do not sort a dense sparse key export and retain exact shelf counts', async () => {
  const videos = Array.from({ length: 4000 }, (_, i) => card(`saved:${i}`));
  const favorites = patchSparseRecord<true>({}, videos.map(video => [video.id, true] as const));
  const removed = removeSparseRecordKeys(favorites, ['saved:1', 'saved:3']);
  const likes = patchSparseRecord<true>({}, [['saved:3', true], ['missing', true]]);
  const originalSort = Array.prototype.sort;
  Array.prototype.sort = function(compare) { if (this.length>1000) throw Error('full key export sorted'); return originalSort.call(this, compare); };
  try {
    const counts = await prepareActivityCounts(removed, likes, [], async () => {});
    assert.equal(counts.saved.size,4000); assert.ok(!counts.saved.has('saved:1')); assert.ok(counts.saved.has('missing'));
    const selected = await selectSavedCardsAsync(videos, removed, likes, new Set(), false, {}, false, async () => {});
    assert.deepEqual(selected, videos.filter(v=>v.id!=='saved:1'));
    const rails = await buildFavoriteRails(selected, {}, async () => {}, removed, likes);
    assert.equal(rails.savedCount,4000); assert.equal(rails.heartsCount,3998); assert.equal(rails.likesCount,1);
  } finally { Array.prototype.sort = originalSort; }
});

test('saved and Continue background scans yield through tombstones and cancel before catalog reads', async () => {
  const base = Object.fromEntries(Array.from({ length: 20000 }, (_, i) => [`saved:${i}`, true])) as Record<string, true>;
  const removed = removeSparseRecordKeys(base, Object.keys(base));
  for (const run of [turn => prepareActivityCounts(removed, {}, [], turn), turn => selectSavedCardsAsync([], removed, {}, new Set(), false, {}, false, turn), turn => buildFavoriteRails([], {}, turn, removed, {})] as Array<(turn: () => Promise<void>) => Promise<unknown>>) {
    let turns = 0;
    await assert.rejects(run(async () => { if (++turns===3) throw Error('cancelled'); }), /cancelled/);
    assert.equal(turns,3);
  }
  const marks = Object.fromEntries(Object.keys(base).map(id => [id, { t: 20, d: 100, at: 1 }]));
  let turns = 0;
  await assert.rejects(buildContinueInsights([], removeSparseRecordKeys(marks, Object.keys(marks)), () => undefined, 0, async () => { if (++turns===3) throw Error('cancelled'); }), /cancelled/);
  assert.equal(turns,3);
});

test('playback updates reuse sparse aliases without rereading a large catalog', () => {
  let reads = 0;
  const videos = Array.from({ length: 100_000 }, (_, index) => {
    const video = card(String(index));
    Object.defineProperty(video, 'id', { get: () => { reads++; return String(index); } });
    return video;
  });
  const wanted = ['90000', 'id:99999', 'missing'];
  const initial = activityLookup(videos, wanted);
  assert.equal(initial.get('90000')?.[0], videos[90000]);
  assert.equal(initial.get('id:99999')?.[0], videos[99999]);
  const coldReads = reads;
  for (let i = 0; i < 100; i++) assert.deepEqual(activityLookup(videos, wanted), initial);
  assert.equal(reads, coldReads, '100 progress ticks must not rescan 100k unwatched cards');
  assert.equal(initial.size, 3);
});

test('resume aliases keep collisions; history can retain the last matching URL', () => {
  const videos = [card('old', { src: 'same-url', path: 'same-url' }), card('new', { src: 'same-url' })];
  assert.deepEqual(activityCandidates(videos, ['same-url', 'id:old']), videos);
  assert.deepEqual(activityCandidates(videos, ['new', 'old']), videos, 'equal-time resume ties retain catalog order');
  assert.equal(activityLookup(videos, ['same-url']).get('same-url')?.at(-1)?.id, 'new');
  const replacement = [card('old', { src: 'replacement-url' })];
  assert.deepEqual(activityCandidates(replacement, ['same-url']), []);
  assert.deepEqual(activityCandidates(replacement, ['old']), replacement);
});

test('Continue resolves direct IDs separately while retaining URL aliases and catalog order', () => {
  const videos = [card('first', { src: 'shared-url' }), card('second', { src: 'shared-url' }), card('third')];
  assert.deepEqual(activityCandidates(videos, ['shared-url'], ['third', 'first']), videos);
  assert.deepEqual(activityCandidates(videos, [], ['second']), [videos[1]]);
});

test('cancelled sliced lookups publish neither incomplete matches nor false misses', async () => {
  const videos = Array.from({ length: 10_000 }, (_, index) => card(String(index)));
  let turns = 0;
  await assert.rejects(activityLookupAsync(videos, ['9999'], async () => { if (++turns === 3) throw Error('cancel'); }), /cancel/);
  assert.equal(activityLookup(videos, ['9999']).get('9999')?.[0], videos[9999]);
  let coldTurns = 0;
  const result = await activityLookupAsync([...videos], ['0', '9999'], async () => { coldTurns++; });
  assert.ok(coldTurns >= 20);
  assert.equal(result.get('9999')?.[0], videos[9999]);
});

test('sidebar activity counts preserve privacy, hidden/demo rules and repeated plays', () => {
  const videos = [card('saved'), card('private', { folderId: 'adult' }), card('hidden'), card('demo', { isSample: true })];
  const saved = new Set(['saved', 'private', 'hidden', 'demo', 'evicted']);
  const events = new Map([['saved', 4], ['private', 20], ['hidden', 9], ['demo', 3], ['evicted', 10]]);
  const matches = activityLookup(videos, saved);
  assert.deepEqual(countActivityMatches(matches, saved, events, new Set(['adult']), { hidden: true }, true), { favCount: 1, historyCount: 4 });
  assert.deepEqual(countActivityMatches(matches, saved, events, new Set(['adult']), {}, false), { favCount: 3, historyCount: 16 });
});

test('independent durable slices ignore unrelated progress ticks and retry failed enqueues', () => {
  const writer = new SliceWriter(), history: unknown[] = [], follows: unknown[] = [];
  let histories = 0, subscriptions = 0, snapshots = 0;
  for (let tick = 0; tick < 100; tick++) {
    writer.write('history', [history], () => { histories++; });
    writer.write('follows', [follows], () => { subscriptions++; });
    writer.write('resume', [{ tick }], () => { snapshots++; });
  }
  assert.equal(histories, 1); assert.equal(subscriptions, 1); assert.equal(snapshots, 100);
  assert.throws(() => writer.write('failure', [history], () => { throw Error('storage'); }), /storage/);
  assert.equal(writer.write('failure', [history], () => {}), true);
  assert.equal(writer.write('failure', [history], () => {}), false);
});
