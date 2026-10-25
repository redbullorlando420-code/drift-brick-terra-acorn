import test from 'node:test';
import assert from 'node:assert/strict';
import { rankSearchResults, type SearchRankingInput } from './search-ranking.ts';
import type { LibraryVideo } from './types';

const video = (id: string, name = 'Needle', addedAt = 1): LibraryVideo => ({ id, name, addedAt, folderId: 'public', path: id, extension: 'mp4', mime: 'video/mp4', size: 0 });
const input = (videos: LibraryVideo[]): SearchRankingInput => ({ videos, ids: new Set(videos.map(row => row.id)), query: 'needle',
  sourceId: 'home', folders: [], hidden: {}, unavailable: {}, tags: {}, favorites: {}, likes: {}, viewCounts: {},
  ratingOf: () => 0, ratingPreference: n => n === 1 ? -3 : n >= 3 ? n - 2 : 0 });

test('worker positions resolve a sparse search without rescanning 100,000 catalog rows', async () => {
  const videos = Array.from({ length: 100_000 }, (_, i) => video(String(i), 'Needle', i));
  let turns = 0, scored = 0;
  const result = await rankSearchResults({ ...input(videos), ids: new Set(['90001', '99999']), positions: new Uint32Array([90001, 99999]), ratingOf: () => { scored++; return 0; } }, undefined, async () => { turns++; });
  assert.deepEqual(result.ranked.map(row => row.id), ['99999','90001']);
  assert.equal(scored, 2); assert.ok(turns < 10);
});

test('stale worker offsets cannot resolve a different video', async () => {
  const result = await rankSearchResults({ ...input([video('new')]), ids: new Set(['old']), positions: new Uint32Array([0, 200]) }, undefined, async () => {});
  assert.deepEqual(result.ranked, []);
});

test('ranking preserves exact title, creator, tag and reaction weights; metadata-only matches survive', async () => {
  const videos = [video('metadata', 'Other'), video('title'), { ...video('creator', 'Other'), remote: { kind: 'youtube' as const, channelName: 'Needle' } }, video('tag', 'Other'), video('favorite')];
  const result = await rankSearchResults({ ...input(videos), tags: { tag: ['needle'] }, favorites: { favorite: true }, likes: { favorite: true }, viewCounts: { favorite: 99 }, ratingOf: id => id === 'favorite' ? 5 : 0 }, undefined, async () => {});
  assert.deepEqual(result.ranked.map(row => row.id), ['tag', 'favorite', 'title', 'creator', 'metadata']);
});

test('source scope, privacy, unavailable rows and hidden titles apply before scoring', async () => {
  const videos = [video('local'), { ...video('youtube'), remote: { kind: 'youtube' as const } }, { ...video('twitch'), remote: { kind: 'twitch' as const } },
    { ...video('private-provider'), remote: { kind: 'reddit' as const } }, { ...video('private-folder'), folderId: 'private' }, video('hidden'), video('unavailable'), { ...video('sample'), isSample: true }];
  const base = { ...input(videos), hidden: { hidden: true as const }, unavailable: { unavailable: true as const },
    folders: [{ id: 'private', name: 'Private', kind: 'files' as const, videoCount: 1, adult: true }] };
  assert.deepEqual((await rankSearchResults({ ...base, sourceId: 'youtube' }, undefined, async () => {})).ranked.map(row => row.id), ['youtube']);
  assert.deepEqual((await rankSearchResults({ ...base, sourceId: 'twitch' }, undefined, async () => {})).ranked.map(row => row.id), ['twitch']);
  assert.deepEqual((await rankSearchResults({ ...base, sourceId: 'adults' }, undefined, async () => {})).ranked.map(row => row.id), ['private-provider', 'private-folder']);
  assert.deepEqual((await rankSearchResults(base, undefined, async () => {})).ranked.map(row => row.id), ['local', 'youtube', 'twitch']);
});

test('top tags count each matching video once and omit transport tags', async () => {
  const videos = [video('one', 'Science lecture'), video('two', 'Science lecture')];
  const result = await rankSearchResults({ ...input(videos), query: 'science', tags: { one: ['science', 'Science', 'provider-youtube'], two: ['science'] } }, undefined, async () => {});
  assert.equal(result.tags.find(row => row.tag === 'science')?.count, 2);
  assert.ok(result.tags.every(row => !row.tag.startsWith('provider-')));
});

test('100,000 broad matches retain every row and yield throughout scoring, sorting and resolution', async () => {
  const videos = Array.from({ length: 100_000 }, (_, i) => video(String(i), 'Needle', i));
  let turns = 0, nativeSorts = 0;
  const native = Array.prototype.sort;
  Array.prototype.sort = function(compare) { nativeSorts++; assert.ok(this.length <= 256, 'sorting never hands the full search result to a blocking native sort'); return native.call(this, compare); };
  let result;
  try { result = await rankSearchResults(input(videos), undefined, async () => { turns++; }); }
  finally { Array.prototype.sort = native; }
  assert.equal(result.ranked.length, videos.length);
  assert.equal(result.ranked[0]?.id, '99999'); assert.equal(result.ranked.at(-1)?.id, '0');
  assert.ok(turns >= 2 * Math.ceil(videos.length / 512), 'scoring and resolution both yield in bounded scans');
  assert.ok(nativeSorts > 1, 'sorting uses bounded runs');
  assert.equal(new Set(result.ranked).size, videos.length);
});

test('superseding input cancels during scoring or sorting', async () => {
  const videos = Array.from({ length: 8192 }, (_, i) => video(String(i), 'Needle', i));
  for (const duringSort of [false, true]) {
    const controller = new AbortController(); let reads = 0, turns = 0;
    await assert.rejects(rankSearchResults({ ...input(videos), ratingOf: () => { reads++; return 0; } }, controller.signal, async () => {
      turns++; if (!duringSort ? reads > 0 : reads === videos.length && turns > 30) controller.abort();
    }), error => error instanceof Error && error.name === 'AbortError');
    assert.ok(duringSort ? reads === videos.length : reads < videos.length);
  }
});

test('a no-match response needs no catalog reads; equal ranked titles keep catalog order', async () => {
  let reads = 0;
  const videos = [video('a'), video('b'), video('c')];
  const empty = await rankSearchResults({ ...input(videos), ids: new Set(), ratingOf: () => { reads++; return 0; } }, undefined, async () => {});
  assert.equal(reads, 0); assert.deepEqual(empty, { ranked: [], tags: [] });
  const equal = await rankSearchResults(input(videos), undefined, async () => {});
  assert.deepEqual(equal.ranked.map(row => row.id), ['a', 'b', 'c']);
});
