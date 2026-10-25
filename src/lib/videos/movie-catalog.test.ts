import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareMovieCatalog, shuffleMovieCatalog, movieShuffleRank } from './movie-catalog.ts';
import type { LibraryVideo } from './types';

const video = (id: number, patch: Partial<LibraryVideo> = {}): LibraryVideo => ({ id: String(id), folderId: 'public',
  name: `Movie ${id}`, path: `Movie ${id}`, extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: id, duration:5400,year:2001, ...patch });
const scope = (videos: LibraryVideo[]) => ({ videos, folders: [{ id: 'private', name: 'Private', kind: 'files' as const, adult: true, videoCount: 1 }],
  hidden: { '4': true } as Record<string, true>, unavailable: { '5': true } as Record<string, true> });

test('movie shelves preserve visibility, genre order, file groups and classic membership in one pass', async () => {
  const rows = [video(0, { genre: 'Action' }), video(1, { genre: 'comedy', extension: '.MKV', collection: 'classics' }),
    video(2, { folderId: 'private' }), video(3, { remote: { kind: 'youtube' } }), video(4), video(5), video(6, { isSample: true }),
    video(7, { name: 'Silent cinema', genre: 'Comedy', extension: '' }), video(8, { genre: 'Science Fiction' })];
  const catalog = await prepareMovieCatalog(scope(rows), async () => {});
  assert.deepEqual(catalog.videos.map(v => v.id), ['0', '1', '7', '8']);
  assert.deepEqual(catalog.genres.map(shelf => [shelf.genre, shelf.videos.map(v => v.id)]),
    [['Comedy', ['1', '7']], ['Action', ['0']], ['Science Fiction', ['8']]]);
  assert.deepEqual(catalog.types.map(shelf => [shelf.type, shelf.videos.length]), [['MP4', 2], ['FILE', 1], ['MKV', 1]]);
  assert.deepEqual(catalog.classics.map(v => v.id), ['1', '7']);
  assert.equal(catalog.videos[0], rows[0]);
});

test('shuffle matches the previous full native stable ordering without mutating the catalog', async () => {
  const rows = Array.from({ length: 20_000 }, (_, index) => video(index, { collection: index % 10 === 0 ? 'classics' : undefined }));
  rows.push(video(88), video(88)); // Equal hashes must preserve original row identity/order.
  const catalog = await prepareMovieCatalog({ ...scope(rows), hidden: {}, unavailable: {} }, async () => {});
  const snapshot = [...catalog.videos];
  for (const seed of [0, 12345, 0xffffffff]) {
    const expected = rows.map(video => ({ video, rank: movieShuffleRank(video.id, seed) }))
      .sort((a, b) => a.rank - b.rank).map(row => row.video);
    const sorted = await shuffleMovieCatalog(catalog, seed, async () => {});
    assert.deepEqual(sorted.videos, expected);
    assert.deepEqual(sorted.modern, expected.filter(v => v.collection !== 'classics'));
    assert.deepEqual(catalog.videos, snapshot);
  }
});

test('random picks reuse shelf membership without rescanning metadata', async () => {
  let reads = 0;
  const rows = Array.from({ length: 5000 }, (_, index) => ({ ...video(index), get genre() { reads++; return 'Comedy'; } }));
  const catalog = await prepareMovieCatalog(scope(rows), async () => {});
  reads = 0;
  await shuffleMovieCatalog(catalog, 100, async () => {});
  await shuffleMovieCatalog(catalog, 200, async () => {});
  assert.equal(reads, 0);
  assert.equal(catalog.genres[0].videos.length, 4998);
});

test('movie work yields before inspecting rows and cancellation stops filtering or ordering', async () => {
  for (const phase of ['filter', 'shuffle']) {
    let reads = 0;
    const rows = Array.from({ length: 16_384 }, (_, index) => ({ ...video(index), get remote() { reads++; return undefined; } }));
    const controller = new AbortController();
    const prepared = phase === 'shuffle' ? await prepareMovieCatalog(scope(rows), async () => {}) : undefined;
    reads = 0; let turns = 0;
    const turn = async () => { controller.signal.throwIfAborted(); if (++turns === 3) controller.abort(); controller.signal.throwIfAborted(); };
    const pending = prepared ? shuffleMovieCatalog(prepared, 200, turn) : prepareMovieCatalog(scope(rows), turn);
    assert.equal(reads, 0, 'no row reads on the initiating event stack');
    await assert.rejects(pending, { name: 'AbortError' });
    assert.ok(reads < rows.length);
  }
});

test('file shelves retain the ten largest types with alphabetical ties, including unusual imports', async () => {
  const rows = Array.from({ length: 1024 }, (_, index) => video(index, { extension: String(index % 12) }));
  const catalog = await prepareMovieCatalog({ ...scope(rows), hidden: {}, unavailable: {} }, async () => {});
  assert.equal(catalog.types.length, 10);
  assert.deepEqual(catalog.types.slice(0, 4).map(shelf => shelf.type), ['0', '1', '2', '3']);
  assert.deepEqual(catalog.types.slice(4).map(shelf => shelf.type), ['10', '11', '4', '5', '6', '7']);
});
