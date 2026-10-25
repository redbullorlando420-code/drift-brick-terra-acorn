import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareCreatorVideos, orderCreatorVideos, prepareCreatorVideoActivity, selectCreatorVideos } from '../src/lib/videos/creator-video-catalog.ts';

const turn = async () => {};
const video = (id, patch = {}) => ({ id, folderId: 'other', name: `Title ${id}`, addedAt: 10, ...patch });
test('creator membership preserves primary sources, aliases, channel matches, playlist scope and hidden rows', async () => {
  const rows = [video('primary', { folderId: 'yt:creator' }), video('alias', { remote: { sourceIds: ['yt:creator', 'ytpl:list'] } }),
    video('channel', { remote: { channelId: 'UCcreator' } }), video('playlist', { folderId: 'ytpl:list' }),
    video('hidden', { folderId: 'yt:creator' }), video('unrelated')];
  assert.deepEqual((await prepareCreatorVideos(rows, { id: 'yt:creator', channelId: 'UCcreator' }, { hidden: true }, turn)).map(v => v.id), ['primary', 'alias', 'channel']);
  assert.deepEqual((await prepareCreatorVideos(rows, { id: 'ytpl:list', channelId: 'UCcreator' }, {}, turn)).map(v => v.id), ['alias', 'playlist']);
});

test('all four stable orders and saved filters preserve matching titles without mutating the source', async () => {
  const rows = [video('a', { name: 'Zebra', addedAt: 0, remote: { views: 5 } }), video('b', { name: 'Apple', addedAt: 30, remote: { views: 2 } }),
    video('c', { name: 'Apple', addedAt: 20, remote: { views: 5 } }), video('d', { name: 'Banana', addedAt: 20 })];
  const ids = list => list.map(v => v.id);
  assert.deepEqual(ids(await orderCreatorVideos(rows, 'newest', turn)), ['b', 'c', 'd', 'a']);
  assert.deepEqual(ids(await orderCreatorVideos(rows, 'oldest', turn)), ['a', 'c', 'd', 'b']);
  assert.deepEqual(ids(await orderCreatorVideos(rows, 'title', turn)), ['b', 'c', 'd', 'a']);
  const popular = await orderCreatorVideos(rows, 'popular', turn);
  assert.deepEqual(ids(popular), ['c', 'a', 'b', 'd']);
  assert.deepEqual(ids(rows), ['a', 'b', 'c', 'd']);
  const favorites = { a: true, c: true }, activity = await prepareCreatorVideoActivity(rows, [{ id: 'a' }, { id: 'a' }, { id: 'outside' }], favorites, turn);
  assert.equal(activity.watchedCount, 1); assert.equal(activity.favorites, 2); assert.equal(activity.newest, 30);
  assert.deepEqual(ids(await selectCreatorVideos(popular, ' APPLE ', 'favorites', favorites, activity.watched, turn)), ['c']);
  assert.deepEqual(ids(await selectCreatorVideos(popular, '', 'unwatched', favorites, activity.watched, turn)), ['c', 'b', 'd']);
  assert.equal(await selectCreatorVideos(popular, '', 'all', favorites, activity.watched, turn), popular);
});

test('80,000-row membership yields, search never rescans sources or re-sorts, and every stage cancels', async t => {
  let membershipReads = 0, comparisons = 0, turns = 0;
  const rows = Array.from({ length: 80000 }, (_, i) => Object.defineProperties(video(String(i)), {
    folderId: { get() { membershipReads++; return i < 40000 ? 'target' : 'other'; } },
    addedAt: { get() { comparisons++; return i; } } }));
  const boundary = async () => { turns++; };
  const members = await prepareCreatorVideos(rows, { id: 'target' }, {}, boundary);
  assert.equal(members.length, 40000); assert.ok(turns >= 157);
  assert.equal(membershipReads, 80000);
  const ordered = await orderCreatorVideos(members, 'newest', boundary);
  const reads = membershipReads, sorts = comparisons;
  for (const query of ['Title 39999', 'Title 2', 'missing']) await selectCreatorVideos(ordered, query, 'all', {}, new Set(), boundary);
  assert.equal(membershipReads, reads); assert.equal(comparisons, sorts);
  const cancelled = () => { let n = 0; return async () => { if (++n === 3) throw Error('superseded'); }; };
  await assert.rejects(prepareCreatorVideos(rows, { id: 'target' }, {}, cancelled()), /superseded/);
  await assert.rejects(orderCreatorVideos(members, 'title', cancelled()), /superseded/);
  await assert.rejects(prepareCreatorVideoActivity(members, rows.map(v => ({ id: v.id })), {}, cancelled()), /superseded/);
  await assert.rejects(selectCreatorVideos(ordered, 'Title', 'all', {}, new Set(), cancelled()), /superseded/);
  t.diagnostic(`${members.length} matching titles from 80,000; ${turns} cooperative checkpoints`);
});
