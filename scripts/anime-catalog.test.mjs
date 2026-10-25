import assert from 'node:assert/strict';
import test from 'node:test';
import { performance } from 'node:perf_hooks';
import { prepareAnimeCatalog, prepareAnimeContinue, selectAnimeTitles, findAnimeTagTitles } from '../src/lib/videos/anime-catalog.ts';
import { topicsForVideo } from '../src/lib/videos/topics.ts';

const video = (id, patch = {}) => ({ id: String(id), name: `Anime series ${id}`, folderId: 'public', path: String(id), mime: 'video/mp4', extension: 'mp4', size: 0, addedAt: Number(id) || 0, ...patch });
const input = (videos, patch = {}) => ({ videos, folders: [], tags: {}, unavailable: {}, hiddenVideos: {}, hideDemo: false, ...patch });
const turn = async () => {};
const ids = rows => rows.map(row => row.id);

test('Anime catalog preserves evidence, stable date/format order and original finder order', async () => {
  const videos = [video(1), video(2, { name: 'Title without cues' }), video(3, { name: 'ANIME movie 3', addedAt: 5 }),
    video(4, { name: 'Manga OVA 4', addedAt: 5, remote: { kind: 'youtube' } }),
    video(5, { name: 'Ordinary film' }), video(6, { name: 'Unrelated', remote: { kind: 'youtube' }, description: 'An anime discussion' })];
  const source = input(videos, { tags: { 2: ['#anime'], 5: ['anime', 'film'] } });
  const catalog = await prepareAnimeCatalog(source, turn);
  const expected = videos.filter(row => row.id!=='6'&&topicsForVideo(row, source.tags[row.id]).includes('anime')).sort((a, b) => b.addedAt - a.addedAt);
  assert.deepEqual(catalog.anime, expected);
  assert.equal(catalog.localCount, 4);
  assert.equal(catalog.filmCount, 2);
  assert.equal(catalog.specialCount, 1);
  assert.deepEqual(ids(await selectAnimeTitles(catalog, [], 'films', '', source.tags, turn)), ['3', '5']);
  assert.deepEqual(ids(await selectAnimeTitles(catalog, [], 'series', '', source.tags, turn)), ['2', '1']);
  assert.deepEqual(ids(await selectAnimeTitles(catalog, [], 'all', 'ANIME DISCUSSION', source.tags, turn)), []);
  assert.equal(await selectAnimeTitles(catalog, [], 'all', '  ', source.tags, turn), catalog.anime);
  assert.deepEqual(ids(await findAnimeTagTitles(catalog.catalog, 'anime', source.tags, turn)), ['1', '2', '3', '5', '6']);
  assert.deepEqual(ids(videos), ['1', '2', '3', '4', '5', '6'], 'input catalog order is immutable');
});

test('private providers/folders, unavailable, hidden and disabled samples stay out of both searches', async () => {
  const videos = [video(1), video(2, { folderId: 'private' }), video(3, { folderId: 'redgifs:discover' }),
    video(4, { remote: { kind: 'reddit' } }), video(5), video(6), video(7, { isSample: true })];
  const source = input(videos, { folders: [{ id: 'private', adult: true }], unavailable: { 5: true }, hiddenVideos: { 6: true }, hideDemo: true });
  const index = await prepareAnimeCatalog(source, turn);
  assert.deepEqual(ids(index.catalog), ['1']);
  assert.deepEqual(ids(index.anime), ['1']);
  assert.deepEqual(ids(await findAnimeTagTitles(index.catalog, 'anime', {}, turn)), ['1']);
});

test('Continue resolves once per title and preserves resume floors, completion boundary and stable ties', async () => {
  const videos = [video(5), video(4), video(3), video(2), video(1)];
  const marks = { 5: { t: 2, d: 100, at: 10 }, 4: { t: 50, d: 100, at: 20 }, 3: { t: 2, d: 100, at: 20 },
    2: { t: 1.99, d: 100, at: 100 }, 1: { t: 99.2, d: 100, at: 200 } };
  let reads = 0;
  const continuing = await prepareAnimeContinue(videos, row => { reads++; return marks[row.id]; }, turn);
  assert.equal(reads, videos.length);
  assert.deepEqual(ids(continuing), ['4', '3', '5']);
  const catalog = await prepareAnimeCatalog(input(videos), turn);
  assert.equal(await selectAnimeTitles(catalog, continuing, 'continue', '', {}, turn), continuing);
  assert.deepEqual(ids(await selectAnimeTitles(catalog, continuing, 'continue', 'series 3', {}, turn)), ['3']);
});

test('large catalog stages yield and obsolete preparation, sorts and rare searches can be cancelled', async t => {
  const videos = Array.from({ length: 80_000 }, (_, index) => video(index));
  let turns = 0;
  const start = performance.now();
  const catalog = await prepareAnimeCatalog(input(videos), async () => { turns++; });
  assert.equal(catalog.anime.length, videos.length);
  assert.ok(turns > 150);
  t.diagnostic(`80,000 titles prepared in ${Math.round(performance.now() - start)} ms across ${turns} task boundaries (in-process fixture)`);
  for (const stage of [
    next => prepareAnimeCatalog(input(videos), next),
    next => prepareAnimeContinue(catalog.anime, () => ({ t: 10, d: 100, at: 1 }), next),
    next => selectAnimeTitles(catalog, [], 'series', 'does-not-exist', {}, next),
    next => findAnimeTagTitles(catalog.catalog, 'does-not-exist', {}, next),
  ]) {
    let calls = 0;
    await assert.rejects(stage(async () => { if (++calls === 3) throw new Error('superseded'); }), /superseded/);
    assert.equal(calls, 3);
  }
  let reads = 0;
  const tags = new Proxy({}, { get() { reads++; return []; } });
  assert.equal((await findAnimeTagTitles(catalog.catalog, 'anime', tags, turn)).length, 8);
  assert.equal(reads, 8, 'common finder search stops as soon as the eight visible results exist');
  const tail = await findAnimeTagTitles(catalog.catalog, 'series 79999', {}, turn);
  assert.deepEqual(ids(tail), ['79999'], 'rare search can still reach the full catalog tail');
});
