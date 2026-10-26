import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareGuide, guideAnswer } from '../src/lib/videos/guide-picks.ts';
import { hasFreshViewerCount } from '../src/lib/videos/types.ts';
import { patchSparseRecord, removeSparseRecordKeys } from '../src/lib/sparse-record.ts';

const now = Date.now();
const card = i => ({ id: `video:${i}`, name: `Title ${i}`, folderId: 'folder', extension: 'mp4', path: `${i}`, size: 0, mime: 'video/mp4', addedAt: now, genre: 'Science', ...(i % 3 === 0 ? { remote: { kind: 'twitch', live: true, channelName: `Creator ${i}`, viewers: i % 53, observedAt: now - (i % 7 ? 0 : 86400000) } } : {}) });
const rank = (id, seed) => { let value = seed >>> 0; for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 0x45d9f3b); return value >>> 0; };

test('guide preserves favorite/like/tag scores, watched exclusions, stable ties and complete fresh live ordering', async () => {
  const videos = Array.from({ length: 3000 }, (_, i) => card(i));
  videos.push({ ...card(4), id: 'emoji:🦊' }, { ...card(5), id: 'emoji:🐈' });
  const favorites = patchSparseRecord({}, [['video:1', true], ['video:5', true], ['missing', true]]);
  const likes = { 'video:7': true }, tags = Object.fromEntries(videos.map((v, i) => [v.id, i % 5 ? ['science', `tag:${i % 17}`] : ['science', 'science']]));
  tags.missing = ['orphan', 'tag'];
  const history = videos.filter((_, i) => i % 4 === 0).map(v => ({ id: v.id }));
  history.push(history[0]);
  for (const seed of [1, 124, 0xffffffff]) {
    let turns = 0;
    const actual = await prepareGuide({ videos, favorites, likes, tags, history }, seed, now, async () => { turns++; });
    const favored = new Set(['science']);
    const watched = new Set(history.map(v => v.id));
    const expected = videos.filter(v => !watched.has(v.id)&&!v.remote?.live).map(video => ({ video, score: (favorites[video.id] ? 3 : 0) + (likes[video.id] ? 2 : 0) + new Set(tags[video.id].filter(t => favored.has(t))).size, random: rank(video.id, seed) })).sort((a, b) => b.score - a.score || a.random - b.random).slice(0, 12).map(r => r.video);
    assert.deepEqual(actual.picks, expected);
    assert.deepEqual(actual.live, videos.filter(v => v.remote?.kind === 'twitch' && v.remote.live&&now-v.remote.observedAt<=120000).sort((a, b) => (hasFreshViewerCount(b.remote, now) ? b.remote.viewers : 0) - (hasFreshViewerCount(a.remote, now) ? a.remote.viewers : 0)));
    assert.equal(actual.favoriteCount, 2); assert.equal(actual.historyCount, new Set(history.map(row=>row.id)).size);
    assert.equal(actual.tagCount, videos.length); assert.ok(turns > 12);
  }
});

test('100k guide entries never enter a catalog-sized sort or export a dense sparse signal tree', async () => {
  const videos = Array.from({ length: 100000 }, (_, i) => ({ ...card(i), remote: undefined }));
  const favorites = patchSparseRecord({}, videos.slice(0, 60000).map(v => [v.id, true]));
  const tags = patchSparseRecord({}, videos.map(v => [v.id, ['science']]));
  const original = Array.prototype.sort;
  Array.prototype.sort = function(compare) { if (this.length > 12) throw Error('catalog-sized sort'); return original.call(this, compare); };
  let output;
  try { output = await prepareGuide({ videos, favorites, tags, likes: {}, history: [] }, 42, now, async () => {}); }
  finally { Array.prototype.sort = original; }
  assert.equal(output.picks.length, 12); assert.equal(output.tagCount, 100000); assert.equal(output.favoriteCount, 60000);
  assert.ok(output.picks.every(v => favorites[v.id]));
});

test('guide cancellation precedes reads even with mostly removed saved ledgers', async () => {
  let reads = 0, turns = 0;
  const video = { ...card(1), get id() { reads++; return 'video:1'; } };
  const base = Object.fromEntries(Array.from({ length: 20000 }, (_, i) => [`id:${i}`, true]));
  const favorites = removeSparseRecordKeys(base, Object.keys(base));
  const work = prepareGuide({ videos: [video], favorites, tags: {}, likes: {}, history: [] }, 1, now, async () => { if (++turns === 1) throw Error('replaced'); });
  assert.equal(reads, 0); await assert.rejects(work, /replaced/); assert.equal(reads, 0); assert.equal(turns, 1);
});

test('prepared answers use bounded existing picks, freshest live counts and handle an empty library', async () => {
  const tags = { 'video:1': ['science', 'tech', 'extra'] };
  const snapshot = await prepareGuide({ videos: [card(1), card(3), card(7)], favorites: {}, likes: {}, tags, history: [] }, 1, now, async () => {});
  assert.match(guideAnswer('Something funny', snapshot, tags), /Local recommendations/);
  assert.match(guideAnswer('Something funny', snapshot, tags), /no saved content preference matched/);
  assert.match(guideAnswer('Who is live on Twitch?', snapshot, tags), /Creator 3 · 3 viewers/);
  const empty = await prepareGuide({ videos: [], favorites: {}, likes: {}, tags: {}, history: [] }, 1, now, async () => {});
  assert.match(guideAnswer('Anything', empty, {}), /Add a few public titles/);
});
