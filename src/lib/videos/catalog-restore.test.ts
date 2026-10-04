import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCatalogRestore, reconcileRestoredResume, sameRestoreInputs, type CatalogRestoreState } from './catalog-restore.ts';
import type { LibraryVideo, ProgressMark } from './types';

const card = (id: string, folderId = 'yt:test'): LibraryVideo => ({ id, folderId, name: id, path: id, extension: 'yt', mime: 'video/youtube', size: 0, addedAt: 1,
  detailsOnDisk: true, remote: { kind: 'youtube', videoId: id, channelName: 'Test', watchUrl: `https://youtube.com/watch?v=${id}` } });
const state = (): CatalogRestoreState => ({ videos: [], follows: [{ id: 'yt:test', kind: 'youtube', title: 'Test', handle: '@test' }],
  favorites: {}, likes: {}, progress: {}, resumeProgress: {} });
const newestResume = (...marks: Array<ProgressMark | undefined>) => marks.filter((mark): mark is ProgressMark => Boolean(mark)).sort((a, b) => b.at - a.at)[0];

test('large restore yields before reading rows, keeps compact cards and joins resume aliases without changing inputs', async () => {
  const base = state(); base.resumeProgress['https://youtube.com/watch?v=511'] = { t: 12, d: 80, at: 5 };
  let visits = 0, turns = 0, largest = 0, sinceTurn = 0;
  const rows = Array.from({ length: 100_000 }, (_, i) => { const video = card(String(i));
    return { ...video, get folderId() { visits++; sinceTurn++; return 'yt:test'; } }; });
  const work = prepareCatalogRestore(base, rows, { newestResume, remoteOnly: true,
    turn: async () => { largest = Math.max(largest, sinceTurn); sinceTurn = 0; turns++; } });
  assert.equal(visits, 0, 'no catalog scan on the initiating stack');
  const result = await work;
  assert.equal(result.videos.length, 100_000); assert.ok(turns >= 390); assert.ok(largest <= 1024, `bounded row reads: ${largest}`);
  assert.deepEqual(result.progress['511'], { t: 12, d: 80, at: 5 }); assert.deepEqual(base.progress, {});
  assert.equal(result.counts.get('yt:test'), 100_000);
  assert.equal(result.videos[0]?.detailsOnDisk, true);
});

test('restored duplicates keep foreground edits, shared memberships and missing durable metadata', async () => {
  const base = state(), fresh = { ...card('shared'), name: 'Newer edit', duration: 50 };
  base.videos = [fresh]; base.favorites.keep = true;
  const old = { ...card('shared'), name: 'Stale disk title', remote: { ...card('shared').remote!, sourceIds: ['yt:test', 'ytpl:list'], views: 99 } };
  const result = await prepareCatalogRestore(base, [old, old, { ...old, id: 'legacy-wrapper', folderId: 'ytpl:list' }, card('keep', 'yt:removed'), card('removed', 'yt:removed')], { remoteOnly: true, newestResume });
  assert.deepEqual(result.videos.map(video => video.id), ['shared', 'keep']);
  assert.equal(result.videos[0]?.name, 'Newer edit'); assert.equal(result.videos[0]?.duration, 50);
  assert.equal(result.videos[0]?.remote?.views, 99); assert.ok(result.videos[0]?.remote?.sourceIds?.includes('ytpl:list'));
  assert.equal(result.counts.get('yt:test'), 1); assert.equal(result.counts.get('yt:removed'), 1);
  assert.equal(base.videos[0], fresh);
});

test('resume preparation reuses unchanged records and restoration ignores unrelated navigation', async () => {
  const base = state(); base.videos = [card('watched')]; base.progress.watched = { t: 12, d: 80, at: 10 };
  base.resumeProgress['id:watched'] = { t: 2, d: 80, at: 1 };
  assert.equal(await reconcileRestoredResume(base.videos, base.progress, base.resumeProgress, newestResume), base.progress);
  assert.equal(sameRestoreInputs(base, { ...base, sourceId: 'home' } as CatalogRestoreState), true);
  for (const field of ['videos', 'follows', 'favorites', 'likes', 'progress', 'resumeProgress'] as const) {
    assert.equal(sameRestoreInputs(base, { ...base, [field]: Array.isArray(base[field]) ? [...base[field]] : { ...base[field] } }), false, field);
  }
});

test('unchanged resume recovery does not copy or read every saved progress entry', async () => {
  let reads = 0;
  const mark = { t: 12, d: 80, at: 10 };
  const stored = Object.fromEntries(Array.from({ length: 100_000 }, (_, i) => [String(i), mark]));
  const progress = new Proxy(stored, { get(target, key, receiver) { if (typeof key === 'string' && /^\d+$/.test(key)) reads++; return Reflect.get(target, key, receiver); } });
  assert.equal(await reconcileRestoredResume([card('511')], progress, { 'id:511': mark }, newestResume, async () => {}), progress);
  assert.equal(reads, 1, 'only watched candidates are read; the no-change ledger is not cloned');
});
