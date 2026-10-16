import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareTwitchCoverage, prepareTwitchCreatorScores, prepareTwitchCreatorShelves, prepareTwitchDeskIndex } from './twitch-desk-catalog.ts';
import { isTwitchClip, sampleTwitchClips, sampleTwitchClipsAsync } from './twitch-clips.ts';
import type { FollowedChannel, LibraryVideo } from './types';

const turn = async () => {};
const video = (i: number, creator = `Creator ${i % 32}`): LibraryVideo => ({
  id: `tw:v:${i}`, name: `Video ${i}`, folderId: creator, path: `vod/${i}`, extension: 'vod',
  mime: 'video/twitch', size: 0, addedAt: i, remote: { kind: 'twitch', channelName: creator },
});
const follow = (name: string): FollowedChannel => ({ id: `tw:${name}`, handle: name, title: name, kind: 'twitch' });
const clip = (i: number, creator?: string) => ({ ...video(i, creator), extension: 'clip' });

test('catalog-only coverage includes all VODs and clips, excludes offline/non-Twitch cards, and preserves follow health', async () => {
  const rows = [video(4, 'One'), video(9, 'One'), clip(11, 'One'), clip(12, 'Only clips'),
    { ...video(13, 'Offline'), extension: 'live' },
    { ...video(14, 'Live'), remote: { kind: 'twitch' as const, channelName: 'Live', live: true, viewers: 20 } },
    { ...video(15, 'YouTube'), remote: { kind: 'youtube' as const } }];
  const index = await prepareTwitchDeskIndex(rows, turn);
  assert.equal(index.total, 2);
  assert.deepEqual([...index.clips], [2, 3]);
  assert.equal(index.clips.byteLength, 8);
  assert.strictEqual(index.live[0], rows[5]);
  assert.deepEqual(index.coverage.get('One'), { count: 2, clips: 1, oldest: 4, newest: 9 });
  const follows = [follow('One'), follow('Empty'), follow('Only clips')];
  follows[0]!.lastProviderFailure = { message: 'Try later', recovery: 'Retry', at: 5 } as FollowedChannel['lastProviderFailure'];
  const coverage = await prepareTwitchCoverage(index, follows, turn);
  assert.equal(coverage.total, 2); assert.equal(coverage.sparse, 3);
  assert.equal(coverage.channels.find(row => row.name === 'Empty')?.oldest, 0);
  assert.strictEqual(coverage.channels.find(row => row.name === 'One')?.lastProviderFailure, follows[0]!.lastProviderFailure);
  assert.equal(coverage.channels.find(row => row.name === 'Only clips')?.count, 0);
});

test('indexed clip sampling matches the original exact seeded window and reads only clip offsets', async () => {
  const rows = Array.from({ length: 30_000 }, (_, i) => i % 7 === 0 ? clip(i) : video(i));
  const index = await prepareTwitchDeskIndex(rows, turn);
  for (const seed of [1, 47, 1000]) for (const creator of ['all', 'Creator 0', 'Missing']) {
    const guarded = new Proxy(rows, { get(target, key, receiver) {
      if (typeof key === 'string' && /^\d+$/.test(key) && !isTwitchClip(target[Number(key)]!)) throw Error('Sampler read a VOD');
      return Reflect.get(target, key, receiver);
    } });
    let turns = 0;
    const result = await sampleTwitchClipsAsync(guarded, index.clips, seed, creator, async () => { turns++; });
    assert.deepEqual(result, sampleTwitchClips(rows, seed, creator));
    assert.ok(turns > 8);
    assert.ok(result.length <= 48);
    if (creator === 'all') assert.equal(new Set(result.map(row => row.remote?.channelName)).size, 32);
  }
});

test('creator shelves preserve average taste ranking and complete per-creator order without retaining undisplayed rails', async () => {
  const rows = Array.from({ length: 100_000 }, (_, i) => video(i));
  const score = (row: LibraryVideo) => row.remote!.channelName === 'Creator 31' ? 100 : Number(row.id.split(':').at(-1)) % 3;
  let scored = 0, yields = 0;
  const scores = await prepareTwitchCreatorScores(rows, row => { scored++; return score(row); }, async () => { yields++; });
  assert.equal(scored, rows.length); assert.ok(yields > 100);
  assert.ok(scores.every(row => !('vods' in row)));
  const liveRows = Array.from({ length: 15 }, (_, i) => ({ ...video(100_000 + i, `creator ${i}`),
    remote: { kind: 'twitch' as const, channelName: `creator ${i}`, live: true } }));
  const ordered = [liveRows[0]!, { ...liveRows[0]!, id: 'duplicate-live' }, ...liveRows.slice(1), ...rows];
  const first = await prepareTwitchCreatorShelves(rows, scores, ordered, 42, turn);
  assert.equal(first.channels.length, 12); assert.equal(first.live.length, 8);
  assert.equal(first.channels[0]!.creator, 'Creator 31');
  for (const channel of first.channels) {
    assert.deepEqual(channel.vods, rows.filter(row => row.remote?.channelName === channel.creator));
    assert.equal(channel.vods.length, channel.count);
  }
  assert.deepEqual(first.live[0]!.vods, rows.filter(row => row.remote?.channelName === 'Creator 0'));
  assert.ok(first.channels.reduce((sum, row) => sum + row.vods.length, 0) < rows.length / 2);
  const originalScores = scores.slice();
  await prepareTwitchCreatorShelves(rows, scores, ordered, 43, turn);
  assert.equal(scored, rows.length, 'reshuffling never rescored the catalog');
  assert.deepEqual(scores, originalScores, 'reusable score snapshot was not sorted in place');
});

test('clip sampling retains the exact first window with more creators than displayed slots', async () => {
  const rows = Array.from({ length: 100_000 }, (_, i) => clip(i, `Creator ${i % 10_000}`));
  const index = await prepareTwitchDeskIndex(rows, turn);
  for (const seed of [0, 1, 47, 1000]) {
    assert.deepEqual(await sampleTwitchClipsAsync(rows, index.clips, seed, 'all', turn), sampleTwitchClips(rows, seed));
  }
});

test('every catalog phase cancels at its supplied boundary instead of publishing partial results', async () => {
  const rows = Array.from({ length: 10_000 }, (_, i) => i % 2 ? clip(i) : video(i));
  const vods = rows.filter(row => !isTwitchClip(row));
  const index = await prepareTwitchDeskIndex(rows, turn);
  const scores = await prepareTwitchCreatorScores(vods, () => 1, turn);
  const fail = async () => { throw new Error('Superseded job'); };
  for (const work of [() => prepareTwitchDeskIndex(rows, fail),
    () => prepareTwitchCoverage(index, [follow('Creator 0')], fail),
    () => prepareTwitchCreatorScores(vods, () => 1, fail),
    () => prepareTwitchCreatorShelves(vods, scores, rows, 1, fail),
    () => sampleTwitchClipsAsync(rows, index.clips, 1, 'all', fail)]) await assert.rejects(work, /Superseded job/);
  let turns = 0;
  await assert.rejects(prepareTwitchDeskIndex(rows, async () => { if (++turns === 4) throw Error('Late cancellation'); }), /Late cancellation/);
  assert.equal(turns, 4);
});
