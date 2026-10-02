import test from 'node:test';
import assert from 'node:assert/strict';
import { createYoutubeRankingProcessor, type YoutubeRankingRow } from './youtube-ranking-protocol.ts';
const row = (id: string, creator: string): YoutubeRankingRow => ({ video: { id, folderId: creator, name: '', path: '', size: 0, addedAt: 1, extension: 'yt', mime: 'video/youtube', remote: { kind: 'youtube', channelName: creator } }, tags: ['technology'], rating: 0, favorite: false, liked: false, marks: 0, watch: 0, plays: 0 });
const reset = { type: 'reset' as const, creatorLikes: {}, creatorFavorites: {}, creatorRatings: {}, heartedTags: [], historicTags: [] };
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
