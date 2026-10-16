import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context);
    throw error;
  }
} });
const { prepareTwitchSaved, filterTwitchCatalog, prepareTwitchTopics } = await import('../src/lib/videos/twitch-saved-catalog.ts');
const { topicEvidence, topicEvidenceForScan } = await import('../src/lib/videos/topics.ts');
const row = (id, addedAt = 1) => ({ id, addedAt, name: `Physics ${id}`, folderId: 'twitch', path: id,
  extension: 'tw', mime: 'video/twitch', size: 0, remote: { kind: 'twitch' } });
const turn = async () => {};

test('shared saved filters preserve mixed-provider membership and order without touching irrelevant topic data', async () => {
  const rows = [row('twitch'), { ...row('youtube'), remote: { kind: 'youtube' } }, { ...row('local'), remote: undefined }, row('missing')];
  const tags = new Proxy({}, { get() { throw Error('Unnecessary topic scan'); } });
  assert.deepEqual(await filterTwitchCatalog(rows, { twitch: true, local: true }, 'all', tags, turn), [rows[0], rows[2]]);
  assert.deepEqual(await filterTwitchCatalog(rows, { youtube: true }, 'all', tags, turn), [rows[1]]);
  assert.deepEqual(await filterTwitchCatalog(rows, {}, 'all', tags, turn), []);
});

test('unfiltered Twitch returns exact array without reading any video or tag', async () => {
  const rows = new Proxy([row('one')], { get(target, key) { if (/^\d+$/.test(String(key))) throw Error('Unnecessary scan'); return target[key]; } });
  const tags = new Proxy({}, { get() { throw Error('Unnecessary tags'); } });
  assert.equal(await filterTwitchCatalog(rows, undefined, 'all', tags, turn), rows);
});

test('saved counts include offline cards; shelves exclude them and keep rating/view/date ordering', async () => {
  const videos = [row('favorite-old', 1), row('favorite-new', 2), row('favorite-watched'), row('overlap'),
    row('liked-high'), row('liked-unseen'), row('liked-seen'), { ...row('offline'), extension: 'live' }, row('other')];
  const favorites = { 'favorite-old': true, 'favorite-new': true, 'favorite-watched': true, overlap: true, offline: true };
  const likes = { overlap: true, 'liked-high': true, 'liked-unseen': true, 'liked-seen': true, offline: true };
  const result = await prepareTwitchSaved({ videos, favorites, likes,
    viewCounts: { 'favorite-watched': 5, 'liked-seen': 3 }, rating: id => id === 'liked-high' ? 5 : 0 }, turn);
  assert.equal(result.favoriteCount, 5); assert.equal(result.likedCount, 5);
  assert.deepEqual(result.favoriteRows.map(v => v.id), ['favorite-watched', 'favorite-new', 'favorite-old', 'overlap']);
  assert.deepEqual(result.likedRows.map(v => v.id), ['liked-high', 'liked-unseen', 'liked-seen']);
  assert.equal(result.favoriteRows[0], videos[2]);
  // The Liked filter includes overlap, unlike its discovery shelf.
  assert.deepEqual(await filterTwitchCatalog(videos, likes, 'all', {}, turn), videos.filter(v => likes[v.id]));
});

test('saved/topic combinations preserve full order and scan without replacing card evidence', async () => {
  const videos = [row('one'), { ...row('two'), name: 'Cooking with friends' }, row('three')];
  const old = ['music'], fresh = ['technology'];
  const cached = topicEvidence(videos[0], old);
  assert.deepEqual(await filterTwitchCatalog(videos, { one: true, two: true }, 'science', { one: fresh }, turn), [videos[0]]);
  assert.deepEqual(await filterTwitchCatalog(videos, undefined, 'food', {}, turn), [videos[1]]);
  assert.equal(topicEvidenceForScan(videos[0], old), cached);
});

test('large saved/filter jobs yield throughout and retain every result without copies', async () => {
  const videos = Array.from({ length: 20_000 }, (_, i) => row(String(i), i));
  const favorites = Object.fromEntries(videos.map(v => [v.id, true]));
  let turns = 0;
  const tick = async () => { turns++; };
  const result = await prepareTwitchSaved({ videos, favorites, likes: {}, viewCounts: {}, rating: () => 0 }, tick);
  assert.equal(result.favoriteRows.length, videos.length); assert.equal(result.favoriteRows[0], videos.at(-1));
  assert.equal(result.favoriteCount, 20_000); assert.ok(turns > 100);
  turns = 0;
  const filtered = await filterTwitchCatalog(videos, favorites, 'science', {}, tick);
  assert.equal(filtered.length, videos.length); assert.equal(filtered.at(-1), videos.at(-1)); assert.ok(turns > 70);
});

test('replacement/hidden/viewer cancellation stops scans and sorts before publication', async () => {
  const videos = Array.from({ length: 4096 }, (_, i) => row(String(i), i));
  let ticks = 0;
  const stop = async () => { if (++ticks === 3) throw Error('Canceled'); };
  await assert.rejects(filterTwitchCatalog(videos, { '1': true }, 'all', {}, stop), /Canceled/);
  const favorites = Object.fromEntries(videos.map(v => [v.id, true]));
  ticks = 0;
  await assert.rejects(prepareTwitchSaved({ videos, favorites, likes: {}, viewCounts: {}, rating: () => 0 },
    async () => { if (++ticks === 10) throw Error('Sort canceled'); }), /Sort canceled/);
});

test('topic shelves rank exact totals and retain bounded round-robin creator samples', async () => {
  const videos = Array.from({ length: 20_000 }, (_, i) => ({ ...row(String(i)),
    remote: { kind: 'twitch', channelName: i < 19000 ? 'Dominant' : `Creator ${i % 100}` } }));
  const tags = { '1': ['technology'], '2': ['food'] };
  const result = await prepareTwitchTopics(videos, tags, { rating: id => id === '1' ? 5 : 0,
    liked: topic => topic === 'food', score: (_id, rating) => rating * 2 }, turn);
  const shelf = result.shelves.find(row => row.tag === 'science');
  assert.equal(shelf.count, 20_000); assert.equal(shelf.videos.length, 48);
  assert.equal(new Set(shelf.videos.map(v => v.remote.channelName)).size, 48);
  assert.equal(shelf.videos[0], videos[0]); assert.equal(shelf.videos[1], videos[19000]);
  assert.deepEqual([...result.preferred], ['technology', 'science', 'food']);
  assert.ok(!result.shelves.some(shelf => shelf.tag === 'technology'), 'one-title topics do not create a shelf');
  // One creator still fills all 48 slots, without retaining the entire archive.
  const single = await prepareTwitchTopics(videos.slice(0, 19000), {}, { rating: () => 0, liked: () => false, score: () => 0 }, turn);
  assert.deepEqual(single.shelves[0].videos, videos.slice(0, 48));
});

test('topic shelf totals/taste order and samples preserve the existing grouping rules', async () => {
  const videos = [row('one'), row('two'), { ...row('three'), remote: { kind: 'twitch', channelName: 'Second' } }, row('four')];
  const result = await prepareTwitchTopics(videos, { one: ['music'], three: ['music'] },
    { rating: () => 0, liked: () => false, score: id => id === 'three' ? 10 : 0 }, turn);
  assert.equal(result.shelves[0].tag, 'science');
  assert.deepEqual(result.shelves[0].videos.map(v => v.id), ['one', 'three', 'two', 'four']);
  assert.equal(result.shelves[1].tag, 'music'); assert.equal(result.shelves[1].count, 2);
  assert.ok(result.preferred.size === 0);
});
