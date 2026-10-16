import test from 'node:test';
import assert from 'node:assert/strict';
import { mixYoutubeCreators, mixYoutubeCreatorsAsync } from './youtube-mix.ts';
import { prepareYoutubeTopics, youtubeTopicIndex } from './youtube-discovery.ts';
import { prepareYoutubeExploreShelves, prepareYoutubePrimaryShelves, prepareYoutubeWatchedCreators, type YoutubeShelfInputs } from './youtube-shelves.ts';
import type { LibraryVideo } from '../videos/types';

const video = (i: number, creator = 'large'): LibraryVideo => ({ id: `yt:v:${i}`, folderId: `yt:${creator}`, name: 'Science lecture', path: '', size: 0, mime: 'video/youtube', extension: 'yt', duration: 600, addedAt: Date.UTC(2026, 9, 1) + i,
  remote: { kind: 'youtube', channelId: creator, channelName: creator, views: i } });
const fixture = (videos: LibraryVideo[]): YoutubeShelfInputs => ({ catalog: videos, videos, history: [], viewCounts: {}, follows: [], seed: 123 });

test('cooperative sampling matches every established ordering and yields within a dominant archive', async () => {
  const rows = [...Array.from({ length: 10000 }, (_, i) => video(i)), video(10000, 'rare')];
  for (const mode of ['mix', 'latest', 'trending'] as const) {
    let turns = 0;
    const result = await mixYoutubeCreatorsAsync(rows, 321, 48, mode, new AbortController().signal, async () => { turns++; });
    assert.deepEqual(result, mixYoutubeCreators(rows, 321, 48, mode));
    assert.ok(turns >= 19, 'sampling must yield even after the creator index is warm');
    assert.equal(new Set(result.map(row => row.id)).size, 48);
    assert.ok(result.slice(0, 2).some(row => row.remote?.channelId === 'rare'));
  }
});

test('canceled sampling and topic preparation do not publish a partial cache', async () => {
  const rows = Array.from({ length: 3000 }, (_, i) => video(i));
  const tags = Object.fromEntries(rows.map(row => [row.id, ['science']]));
  const canceled = new AbortController(); let turns = 0;
  await assert.rejects(prepareYoutubeTopics(rows, tags, canceled.signal, async () => { if (++turns === 3) canceled.abort(); }), { name: 'AbortError' });
  const complete = await prepareYoutubeTopics(rows, tags, new AbortController().signal, async () => {});
  assert.equal(complete.get('science')?.length, 3000);
  assert.equal(complete, youtubeTopicIndex(rows, tags));
  const sampleAbort = new AbortController(); turns = 0;
  await assert.rejects(mixYoutubeCreatorsAsync(rows, 1, 48, 'mix', sampleAbort.signal, async () => { if (++turns === 4) sampleAbort.abort(); }), { name: 'AbortError' });
});

test('explore shelves preserve unseen, duration, follow identity and recent creator semantics', async () => {
  const watched = video(1, 'watched'), older = video(2, 'watched'), known = video(3, 'known'), outside = video(4, 'outside');
  known.duration = 3600;
  const input = fixture([watched, older, known, outside]);
  input.history = [{ id: watched.id, at: Date.now() }]; input.viewCounts[known.id] = 2;
  input.follows = [{ id: 'yt:known', kind: 'youtube', channelId: 'known', title: 'Renamed', handle: 'known' }];
  const result = await prepareYoutubeExploreShelves(input, new AbortController().signal, async () => {});
  assert.deepEqual(new Set(result.fresh.map(row => row.id)), new Set([older.id, outside.id]));
  assert.deepEqual(result.deeper, [older]);
  assert.ok(result.quick.every(row => row.duration! < 1200));
  assert.ok(!result.discovery.includes(known));
  assert.deepEqual(await prepareYoutubeWatchedCreators(input, new AbortController().signal, async () => {}), new Set(['watched']));
  input.history = [];
  assert.equal((await prepareYoutubeWatchedCreators(input, new AbortController().signal, async () => {})).size, 0);
});

test('playlist preparation fills six nonempty shelves and de-duplicates overlapping memberships', async () => {
  const input = fixture(Array.from({ length: 4000 }, (_, i) => ({ ...video(i, `creator-${i % 9}`), folderId: `ytpl:${i % 8}`, remote: { ...video(i).remote!, sourceIds: [`ytpl:${i % 8}`, 'ytpl:shared'] } })));
  input.follows = Array.from({ length: 12 }, (_, i) => ({ id: `ytpl:${i}`, kind: 'youtube', handle: String(i), title: String(i) }));
  const result = await prepareYoutubePrimaryShelves(input, new AbortController().signal, async () => {});
  assert.equal(result.playlistShelves.length, 6);
  for (const shelf of result.playlistShelves) {
    assert.equal(shelf.videos.length, 24);
    assert.equal(new Set(shelf.videos.map(row => row.id)).size, 24);
    assert.ok(shelf.videos.every(row => row.folderId === shelf.id));
  }
  assert.equal(result.mix.length, 48); assert.equal(result.latest.length, 48);
});
