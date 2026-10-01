import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityLookup, activityLookupAsync, activityCandidates } from './activity-lookup.ts';
import { countActivityMatches } from './catalog-counts.ts';
import { SliceWriter } from '../slice-writer.ts';
import type { LibraryVideo } from './types';

const card = (id: string, overrides: Partial<LibraryVideo> = {}): LibraryVideo => ({ id, folderId: 'public', name: id, path: id, extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: 0, ...overrides });

test('playback updates reuse sparse aliases without rereading a large catalog', () => {
  let reads = 0;
  const videos = Array.from({ length: 100_000 }, (_, index) => {
    const video = card(String(index));
    Object.defineProperty(video, 'id', { get: () => { reads++; return String(index); } });
    return video;
  });
  const wanted = ['90000', 'id:99999', 'missing'];
  const initial = activityLookup(videos, wanted);
  assert.equal(initial.get('90000')?.[0], videos[90000]);
  assert.equal(initial.get('id:99999')?.[0], videos[99999]);
  const coldReads = reads;
  for (let i = 0; i < 100; i++) assert.deepEqual(activityLookup(videos, wanted), initial);
  assert.equal(reads, coldReads, '100 progress ticks must not rescan 100k unwatched cards');
  assert.equal(initial.size, 3);
});

test('resume aliases keep collisions; history can retain the last matching URL', () => {
  const videos = [card('old', { src: 'same-url', path: 'same-url' }), card('new', { src: 'same-url' })];
  assert.deepEqual(activityCandidates(videos, ['same-url', 'id:old']), videos);
  assert.deepEqual(activityCandidates(videos, ['new', 'old']), videos, 'equal-time resume ties retain catalog order');
  assert.equal(activityLookup(videos, ['same-url']).get('same-url')?.at(-1)?.id, 'new');
  const replacement = [card('old', { src: 'replacement-url' })];
  assert.deepEqual(activityCandidates(replacement, ['same-url']), []);
  assert.deepEqual(activityCandidates(replacement, ['old']), replacement);
});

test('Continue resolves direct IDs separately while retaining URL aliases and catalog order', () => {
  const videos = [card('first', { src: 'shared-url' }), card('second', { src: 'shared-url' }), card('third')];
  assert.deepEqual(activityCandidates(videos, ['shared-url'], ['third', 'first']), videos);
  assert.deepEqual(activityCandidates(videos, [], ['second']), [videos[1]]);
});

test('cancelled sliced lookups publish neither incomplete matches nor false misses', async () => {
  const videos = Array.from({ length: 10_000 }, (_, index) => card(String(index)));
  let turns = 0;
  await assert.rejects(activityLookupAsync(videos, ['9999'], async () => { if (++turns === 3) throw Error('cancel'); }), /cancel/);
  assert.equal(activityLookup(videos, ['9999']).get('9999')?.[0], videos[9999]);
  let coldTurns = 0;
  const result = await activityLookupAsync([...videos], ['0', '9999'], async () => { coldTurns++; });
  assert.ok(coldTurns >= 20);
  assert.equal(result.get('9999')?.[0], videos[9999]);
});

test('sidebar activity counts preserve privacy, hidden/demo rules and repeated plays', () => {
  const videos = [card('saved'), card('private', { folderId: 'adult' }), card('hidden'), card('demo', { isSample: true })];
  const saved = new Set(['saved', 'private', 'hidden', 'demo', 'evicted']);
  const events = new Map([['saved', 4], ['private', 20], ['hidden', 9], ['demo', 3], ['evicted', 10]]);
  const matches = activityLookup(videos, saved);
  assert.deepEqual(countActivityMatches(matches, saved, events, new Set(['adult']), { hidden: true }, true), { favCount: 1, historyCount: 4 });
  assert.deepEqual(countActivityMatches(matches, saved, events, new Set(['adult']), {}, false), { favCount: 3, historyCount: 16 });
});

test('independent durable slices ignore unrelated progress ticks and retry failed enqueues', () => {
  const writer = new SliceWriter(), history: unknown[] = [], follows: unknown[] = [];
  let histories = 0, subscriptions = 0, snapshots = 0;
  for (let tick = 0; tick < 100; tick++) {
    writer.write('history', [history], () => { histories++; });
    writer.write('follows', [follows], () => { subscriptions++; });
    writer.write('resume', [{ tick }], () => { snapshots++; });
  }
  assert.equal(histories, 1); assert.equal(subscriptions, 1); assert.equal(snapshots, 100);
  assert.throws(() => writer.write('failure', [history], () => { throw Error('storage'); }), /storage/);
  assert.equal(writer.write('failure', [history], () => {}), true);
  assert.equal(writer.write('failure', [history], () => {}), false);
});
