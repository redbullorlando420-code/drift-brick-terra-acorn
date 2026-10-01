import test from 'node:test';
import assert from 'node:assert/strict';
import { collectSearchSuggestions } from './search-suggestions.ts';
import type { LibraryVideo } from './types';

const video = (id: string, addedAt: number): LibraryVideo => ({ id, addedAt, folderId: 'public', name: 'Search example',
  path: id, mime: 'video/mp4', extension: 'mp4', size: 0 });
const base = { folders: [], tags: {}, categories: {}, hidden: {}, hideDemo: true, sourceId: 'home' as const,
  adultsUnlocked: false, query: 'search', ids: null };

test('100,000 matched titles yield between slices and keep only the six newest suggestions', async () => {
  const videos = Array.from({ length: 100_000 }, (_, index) => video(String(index), index));
  let turns = 0, folderReads = 0;
  const folders = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), name: String(index), kind: 'files' as const,
    videoCount: 0, get adult() { folderReads++; return false; } }));
  const hits = await collectSearchSuggestions({ ...base, videos, folders, ids: videos.map(v => v.id) }, async () => { turns++; });
  assert.deepEqual(hits.map(v => v.id), ['99999', '99998', '99997', '99996', '99995', '99994']);
  assert.ok(turns >= 392, 'both matching IDs and catalog resolution yield in bounded batches');
  assert.equal(folderReads, 1000, 'privacy flags are checked once, not once per matching title');
});

test('suggestions preserve source scopes, privacy, hidden titles, and sample visibility', async () => {
  const videos: LibraryVideo[] = [
    { ...video('public', 1), remote: { kind: 'youtube' } },
    { ...video('twitch', 2), remote: { kind: 'twitch' } },
    { ...video('private-provider', 100), remote: { kind: 'redtube' } },
    { ...video('private-folder', 101), folderId: 'private' },
    { ...video('hidden', 200), remote: { kind: 'youtube' } },
    { ...video('sample', 300), remote: { kind: 'youtube' }, isSample: true },
  ];
  const input = { ...base, videos, folders: [{ id: 'private', name: 'Private', kind: 'files' as const, videoCount: 1, adult: true }],
    hidden: { hidden: true as const }, ids: videos.map(v => v.id) };
  assert.deepEqual((await collectSearchSuggestions({ ...input, sourceId: 'youtube' }, async () => {})).map(v => v.id), ['public']);
  assert.deepEqual((await collectSearchSuggestions({ ...input, sourceId: 'twitch' }, async () => {})).map(v => v.id), ['twitch']);
  const privateHits = await collectSearchSuggestions({ ...input, sourceId: 'adults', adultsUnlocked: true }, async () => {});
  assert.deepEqual(privateHits.map(v => v.id), ['private-folder', 'private-provider', 'twitch', 'public']);
  assert.equal((await collectSearchSuggestions({ ...input, hideDemo: false }, async () => {}))[0]!.id, 'sample');
});

test('fallback lookup matches metadata and retains stable ordering for equal dates', async () => {
  const videos = [video('a', 2), { ...video('b', 2), name: 'Other' }, { ...video('c', 3), name: 'Different' }];
  const hits = await collectSearchSuggestions({ ...base, videos, tags: { b: ['search'] }, categories: { c: 'search category' } }, async () => {});
  assert.deepEqual(hits.map(v => v.id), ['c', 'a', 'b']);
  assert.deepEqual(await collectSearchSuggestions({ ...base, videos, ids: [] }, async () => {}), []);
});

test('cancelled suggestion scans stop before traversing the rest of the catalog', async () => {
  let turns = 0;
  const videos = Array.from({ length: 2000 }, (_, index) => video(String(index), index));
  await assert.rejects(collectSearchSuggestions({ ...base, videos }, async () => {
    if (++turns === 2) throw new Error('New input replaced this query');
  }), /replaced/);
  assert.equal(turns, 2);
});
