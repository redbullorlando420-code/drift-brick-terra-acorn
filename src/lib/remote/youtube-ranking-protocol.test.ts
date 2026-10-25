import test from 'node:test';
import assert from 'node:assert/strict';
import { createYoutubeRankingProcessor, type YoutubeRankingRow } from './youtube-ranking-protocol.ts';
const row = (id: string, creator: string): YoutubeRankingRow => ({ video: { id, folderId: creator, name: '', path: '', size: 0, addedAt: 1, extension: 'yt', mime: 'video/youtube', remote: { kind: 'youtube', channelName: creator } }, tags: ['technology'], rating: 0, favorite: false, liked: false, marks: 0, watch: 0, plays: 0 });
const reset = { type: 'reset' as const, creatorLikes: {}, creatorFavorites: {}, creatorRatings: {}, heartedTags: [], historicTags: [] };
test('worker preserves source strength when ranking tag evidence', () => {
  const watched = { ...row('watched', 'a'), rating: 5 }, strong = row('strong', 'b'), weak = row('weak', 'c');
  for (const item of [watched, strong, weak]) item.video.remote!.youtubeTagSummary = {
    version: 3, sources: { technology: item === weak ? 'description' : 'video-tag' }, topics: [] };
  let ids: string[] = [];
  const process = createYoutubeRankingProcessor(result => { ids = result; });
  process(reset); process({ type: 'append', rows: [weak, strong, watched] });
  process({ type: 'candidates', ids: ['weak', 'strong'] }); process({ type: 'ready' });
  assert.deepEqual(ids, ['strong', 'weak']);
});
test('worker waits for all batches, preserves likes and favorites, and mixes reuse compiled scores', () => {
  const packets: string[][] = [], process = createYoutubeRankingProcessor(ids => packets.push(ids));
  process(reset);
  process({ type: 'append', rows: [row('neutral', 'a'), { ...row('liked', 'b'), liked: true }, { ...row('disliked', 'b'), rating: 1 }] });
  process({ type: 'candidates', ids: ['neutral', 'liked', 'disliked'] });
  process({ type: 'mix', seed: 7 }); assert.equal(packets.length, 0);
  process({ type: 'ready' }); assert.deepEqual(packets[0], ['liked', 'neutral']);
  process({ type: 'mix', seed: 8 }); assert.deepEqual(packets[1], packets[0]);
  process({ type: 'ready' }); assert.equal(packets.length, 2);
  process({ ...reset, creatorFavorites: { a: true } });
  process({ type: 'append', rows: [row('neutral', 'a'), row('other', 'b')] });
  process({ type: 'candidates', ids: ['other', 'neutral'] }); process({ type: 'ready' });
  assert.deepEqual(packets[2], ['neutral', 'other']);
});
test('filtered worker shelves learn from feedback outside the candidate list', () => {
  const packets: string[][] = [], process = createYoutubeRankingProcessor(ids => packets.push(ids));
  process(reset);
  process({ type: 'append', rows: [row('old', 'a'), row('other', 'b'), row('watched', 'a')] });
  process({ type: 'history', entries: [{ id: 'watched', at: Date.now() }] });
  process({ type: 'candidates', ids: ['old', 'other'] }); process({ type: 'ready' });
  assert.deepEqual(packets[0], ['old', 'other']);
});

test('worker results retain catalog offsets so the UI resolves cards without a catalog scan', () => {
  let result: { ids: string[]; offsets: number[] } | undefined;
  const process = createYoutubeRankingProcessor((ids, offsets) => { result = { ids, offsets }; });
  const title = row('located', 'a'); title.video.catalogOffset = 60000;
  process(reset); process({ type: 'append', rows: [title] }); process({ type: 'candidates', ids: ['located'] }); process({ type: 'ready' });
  assert.deepEqual(result, { ids: ['located'], offsets: [60000] });
});

test('deep pages reuse scoring, interleave a skewed catalog and retain stable, duplicate-free prefixes', () => {
  const packets: Array<{ ids: string[]; total: number; offset: number; kind: string }> = [];
  const process = createYoutubeRankingProcessor((ids, _offsets, detail) => packets.push({ ids, ...detail }));
  const rows = Array.from({ length: 1000 }, (_, index) => row(`large-${index}`, 'large'));
  rows.push({ ...row('preferred', 'favored'), favorite: true }, row('rare', 'rare'), { ...row('disliked', 'rare'), rating: 1 });
  process(reset); process({ type: 'append', rows }); process({ type: 'candidates', ids: rows.map(row => row.video.id) });
  process({ type: 'mix', seed: 42 }); process({ type: 'page', offset: 0, limit: 96 }); process({ type: 'ready' });
  const first = packets.find(packet => packet.kind === 'page')!;
  assert.equal(first.total, 1002); assert.equal(first.ids.length, 96);
  assert.equal(first.ids[0], 'preferred'); assert.ok(first.ids.slice(0, 3).includes('rare'));
  process({ type: 'page', offset: 96, limit: 96 });
  const second = packets.at(-1)!;
  assert.equal(second.offset, 96);
  assert.equal(new Set([...first.ids, ...second.ids]).size, 192);
  process({ type: 'page', offset: 0, limit: 192 });
  assert.deepEqual(packets.at(-1)!.ids, [...first.ids, ...second.ids]);
  process({ type: 'page', offset: 1000, limit: 96 }); assert.equal(packets.at(-1)!.ids.length, 2);
  assert.ok(packets.every(packet => !packet.ids.includes('disliked')));
  process({ type: 'page', offset: Infinity, limit: 96 }); assert.equal(packets.at(-1)!.ids.length, 2);
});

test('pages remain inside the chosen format/topic candidates while learning from the full catalog', () => {
  let page: string[] = [];
  const process = createYoutubeRankingProcessor((ids, _offsets, detail) => { if (detail.kind === 'page') page = ids; });
  process(reset);
  process({ type: 'append', rows: [row('watched', 'a'), row('older', 'a'), row('other', 'b')] });
  process({ type: 'history', entries: [{ id: 'watched', at: Date.now() }] });
  process({ type: 'candidates', ids: ['older', 'other'] }); process({ type: 'ready' }); process({ type: 'page', offset: 0, limit: 96 });
  assert.deepEqual(page, ['older', 'other']);
});
