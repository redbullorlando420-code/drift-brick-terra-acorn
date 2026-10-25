import test from 'node:test';
import assert from 'node:assert/strict';
import { preparePrivateShelves, orderPrivateShelves, filterPrivateShelves, type PrivateSort } from './private-shelves.ts';
import type { LibraryVideo } from './types';
import { restorePhotoFolders, folderIsPrivate } from './folder-privacy.ts';
const row = (i: number): LibraryVideo => ({ id: String(i), name: `Title ${i % 17}`, folderId: `private:${i % 24}`, path: `${i}`, extension: 'mp4', mime: 'video/mp4', size: i, addedAt: i % 101 });
const turn = async () => {};
// Bound assertion output even for a deliberately failing 80k-row ordering.
const sameRows = (actual: LibraryVideo[], expected: LibraryVideo[], label?: string) => { assert.equal(actual.length, expected.length, label); assert.ok(actual.every((v, i) => v === expected[i]), label ?? "row identity/order mismatch"); };

test('private shelves group full scoped lists once and preserve stable organization and newest-24 ties', async () => {
  const videos = Array.from({ length: 80000 }, (_, i) => row(i)), tags: Record<string, string[]> = {};
  videos.forEach((v, i) => { if (i % 4 === 0) tags[v.id] = i % 8 === 0 ? ['collection', 'organization'] : ['collection']; });
  const before = [...videos], index = await preparePrivateShelves(videos, tags, turn);
  assert.equal(index.videos, videos);
  sameRows(index.tagged, videos.filter(v => tags[v.id]).sort((a, b) => tags[b.id]!.length - tags[a.id]!.length), "organized order");
  sameRows(index.untagged, videos.filter(v => !tags[v.id]));
  sameRows(index.recent, [...videos].sort((a, b) => b.addedAt - a.addedAt).slice(0, 24));
  for (let i = 0; i < 24; i++) sameRows(index.folders.get(`private:${i}`)!, videos.filter(v => v.folderId === `private:${i}`));
  assert.equal(index.byId.get('79999'), videos[79999]);
  sameRows(videos, before);
});

test('all private sort modes exactly match existing native stable ordering without mutating membership', async () => {
  const videos = Array.from({ length: 10000 }, (_, i) => row(i)), tags: Record<string, string[]> = {}, favorites: Record<string, true> = {}, progress: Record<string, { at: number }> = {};
  videos.forEach((v, i) => { if (i % 3 === 0) tags[v.id] = ['collection']; if (i % 7 === 0) favorites[v.id] = true; if (i % 11 === 0) progress[v.id] = { at: i % 123 }; });
  const index = await preparePrivateShelves(videos, tags, turn), before = [...videos];
  const compare = (sort: PrivateSort, a: LibraryVideo, b: LibraryVideo) => sort === 'name' ? a.name.localeCompare(b.name)
    : sort === 'favorites' ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt
    : sort === 'tagged' ? (tags[b.id] ?? []).length - (tags[a.id] ?? []).length || b.addedAt - a.addedAt
    : sort === 'played' ? (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0) || b.addedAt - a.addedAt : b.addedAt - a.addedAt;
  for (const sort of ['name', 'recent', 'favorites', 'tagged', 'played'] as const) {
    const ordered = await orderPrivateShelves(index, sort, favorites, progress, undefined, turn);
    sameRows(ordered, [...videos].sort((a, b) => compare(sort, a, b)), sort);
    sameRows(await filterPrivateShelves(ordered, tags, 'collection', turn), ordered.filter(v => tags[v.id]?.includes('collection')));
    assert.equal(await filterPrivateShelves(ordered, tags, 'All', turn), ordered);
  }
  sameRows(videos, before);
});

test('rank resolution reuses the index and cannot introduce missing or out-of-scope rows', async () => {
  const videos = [row(1), row(2), row(3)], index = await preparePrivateShelves(videos, {}, turn);
  assert.equal(await orderPrivateShelves(index, 'ranked', {}, {}, [], turn), videos);
  assert.deepEqual(await orderPrivateShelves(index, 'ranked', {}, {}, ['3', 'public', '1', '2'], turn), [videos[2], videos[0], videos[1]]);
  assert.deepEqual(await filterPrivateShelves(videos, {}, 'missing', turn), []);
});

test('indexing, sorting, rank resolution and tag filtering yield before metadata reads and accept cancellation', async () => {
  let reads = 0, yields = 0;
  const video = row(0), videos = [video, row(1)];
  Object.defineProperty(video, 'folderId', { get() { reads++; return 'private'; } });
  const preparing = preparePrivateShelves(videos, {}, async () => { yields++; });
  assert.equal(reads, 0); await preparing; assert.ok(reads > 0 && yields > 0);
  const index = await preparePrivateShelves(videos, {}, turn), failure = new Error('cancelled');
  for (const work of [() => preparePrivateShelves(videos, {}, async () => { throw failure; }),
    () => orderPrivateShelves(index, 'name', {}, {}, undefined, async () => { throw failure; }),
    () => orderPrivateShelves(index, 'ranked', {}, {}, ['0'], async () => { throw failure; }),
    () => filterPrivateShelves(videos, {}, 'collection', async () => { throw failure; })]) await assert.rejects(work, failure);
});

test('photo sources restoring before video folders retain saved private classification', () => {
  const sources = [{ id: 'private', name: 'Private photos', kind: 'files' as const, photoCount: 4 },
    { id: 'public', name: 'Public photos', kind: 'directory' as const }];
  const folders = restorePhotoFolders([], sources, new Set(['private']));
  assert.equal(folderIsPrivate(folders, 'private'), true);
  assert.equal(folderIsPrivate(folders, 'public'), false);
  assert.equal(folders[0]!.photoCount, 4);
  assert.equal(folders[0]!.needsPermission, true);
  assert.deepEqual(sources.map(source => source.id), ['private', 'public']);
});

test('photo metadata arriving after video restore preserves current privacy and folder order', () => {
  const current = [{ id: 'private', name: 'Current', kind: 'files' as const, videoCount: 10, adult: true },
    { id: 'changed', name: 'Changed', kind: 'files' as const, videoCount: 2, adult: false }];
  const restored = restorePhotoFolders(current, [{ id: 'changed', name: '', kind: 'files', photoCount: 3 },
    { id: 'private', name: 'Photos', kind: 'directory', lastCheckedAt: 123 }], new Set(['changed']));
  assert.deepEqual(restored.map(folder => folder.id), ['private', 'changed']);
  assert.equal(restored[0]!.adult, true); assert.equal(restored[1]!.adult, false);
  assert.equal(restored[0]!.videoCount, 10); assert.equal(restored[1]!.name, 'Changed');
  assert.equal(restored[0]!.lastCheckedAt, 123); assert.equal(current[0]!.name, 'Current');
});
