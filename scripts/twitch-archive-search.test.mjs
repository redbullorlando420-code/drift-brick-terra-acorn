import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; } } });
const { searchTwitchArchive, twitchArchiveDate, compareTwitchArchiveKeys } = await import('../src/lib/videos/twitch-archive-search.ts');
const creator = { id: 'tw:exact', kind: 'twitch', handle: 'exact', title: 'Same name', channelId: 'exact-id' };
const card = (id, extra = {}) => ({ id, folderId: creator.id, name: 'Space voyage', path: `twitch/${id}`, extension: 'vod', mime: 'video/twitch', size: 0, duration: 3600, addedAt: new Date(2024, 3, 2, 12).getTime(), remote: { kind: 'twitch', channelName: 'Old creator name' }, ...extra });
const search = (rows, patch = {}, options = {}) => searchTwitchArchive(rows, { query: '', kind: 'all', order: 'newest', ...patch }, { signal: new AbortController().signal, turn: async () => {}, ...options });

test('historical search excludes live, offline, demonstration and non-Twitch rows', async () => {
  const rows = [card('vod'), card('tw:c:clip', { extension: 'clip', duration: 60 }), card('live', { remote: { kind: 'twitch', live: true } }), card('offline', { extension: 'live' }), card('tw:old:channel'), card('sample', { isSample: true }), card('youtube', { remote: { kind: 'youtube' } })];
  assert.equal((await search(rows)).matched, 2);
  assert.deepEqual((await search(rows, { kind: 'vod' })).videos.map(row => row.id), ['vod']);
  assert.deepEqual((await search(rows, { kind: 'clip' })).videos.map(row => row.id), ['tw:c:clip']);
});
test('creator matching uses stable identities through renames without merging same-name creators', async () => {
  const rows = [card('exact'), card('wrong', { folderId: 'tw:different', remote: { kind: 'twitch', channelName: creator.title } }), card('id-match', { folderId: 'legacy', remote: { kind: 'twitch', channelId: creator.channelId } }), card('fallback', { folderId: 'legacy', remote: { kind: 'twitch', channelName: creator.title } })];
  assert.deepEqual((await search(rows, { creator })).videos.map(row => row.id), ['exact','fallback','id-match']);
});
test('title queries normalize Unicode, match all words and do not scan descriptions', async () => {
  const rows = [card('one', { name: 'Ｓｐａｃｅ VOYAGE', description: 'secret phrase' }), card('two', { name: 'Space only' })];
  assert.equal((await search(rows, { query: 'space voyage' })).matched, 1);
  assert.equal((await search(rows, { query: 'secret phrase' })).matched, 0);
});
test('inclusive calendar ranges handle local day boundaries and reject invalid dates', async () => {
  const from = twitchArchiveDate('2024-04-02'), until = twitchArchiveDate('2024-04-02', true);
  const rows = [card('start', { addedAt: from }), card('end', { addedAt: until - 1 }), card('next-day', { addedAt: until }), card('unknown', { addedAt: 0 })];
  assert.deepEqual((await search(rows, { from, until })).videos.map(row => row.id), ['end','start']);
  assert(Number.isNaN(twitchArchiveDate('2024-02-31'))); assert(Number.isNaN(twitchArchiveDate('2024-13-01')));
  assert.equal(twitchArchiveDate(''), undefined);
  await assert.rejects(search(rows, { from: until, until: from }), /valid date/);
});
test('unknown dates stay last for both orders and keyset pages do not repeat tied dates', async () => {
  const rows = Array.from({ length: 75 }, (_, i) => card(`id-${String(i).padStart(3,'0')}`, { addedAt: i === 74 ? 0 : 1000 }));
  for (const order of ['newest','oldest']) {
    let after; const seen = [];
    do { const result = await search(rows, { order, after }); seen.push(...result.videos.map(row => row.id)); assert.equal(result.matched,75); assert(result.maxCandidates <= 25); after = result.hasNext ? result.next : undefined; } while (after);
    assert.equal(seen.length,75); assert.equal(new Set(seen).size,75); assert.equal(seen.at(-1),'id-074');
    assert(compareTwitchArchiveKeys({ date: 1, id: 'a' }, { date: 0, id: 'b' }, order) < 0);
  }
});
test('a 100k archive keeps only a page of references while yielding and supports deep keyset paging', async () => {
  const base = card('base'); const rows = Array.from({ length: 100_000 }, (_, i) => ({ ...base, id: String(i).padStart(6,'0'), addedAt: i + 1 }));
  let turns = 0;
  const result = await search(rows, { after: { date: 50_001, id: '050000' } }, { turn: async () => { turns++; } });
  assert.equal(result.visited,100_000); assert.equal(result.matched,100_000); assert.equal(result.videos[0].id,'049999'); assert(result.maxCandidates <= 25); assert(turns >= Math.ceil(rows.length / 512));
});
test('cancelled and already-obsolete jobs cannot visit the rest of a catalog or publish a result', async () => {
  const controller = new AbortController(); let reads = 0, turns = 0;
  const rows = Array.from({ length: 5000 }, (_, i) => card(String(i)));
  const observed = new Proxy(rows, { get(target, key, receiver) { if (typeof key === 'string' && /^\d+$/.test(key)) reads++; return Reflect.get(target, key, receiver); } });
  await assert.rejects(search(observed, {}, { signal: controller.signal, turn: async () => { if (++turns === 2) controller.abort(); } }), { name: 'AbortError' });
  assert(reads <= 512); const before = reads;
  await assert.rejects(search(observed, {}, { signal: controller.signal }), { name: 'AbortError' }); assert.equal(reads,before);
});
