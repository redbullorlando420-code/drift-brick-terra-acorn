import test from 'node:test';
import assert from 'node:assert/strict';
import { filterHistory, historyExportBlob, prepareHistoryIndex, prepareHistoryTags } from './history-browse.ts';
import type { HistoryEntry, LibraryVideo } from './types';

const now = Date.UTC(2026, 9, 20, 12);
const video = (id: string): LibraryVideo => ({ id, name: `Title ${id}`, path: id, folderId: 'public', extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: now });
const entry = (id: string, at = now, patch: Partial<HistoryEntry> = {}): HistoryEntry => ({ id, at, ...patch });
const turn = async () => {};

test('history index retains repeats, latest played timestamps, recovery thresholds and orphan counts', async () => {
  const history = [entry('a', now, { source: 'progress', position: 20, duration: 100 }),
    entry('a', now - 10, { source: 'watch-room', position: 98.5, duration: 100 }),
    entry('b', now - 86_400_000, { position: 1, duration: 100 }), entry('missing', now - 9 * 86_400_000, { url: 'https://example.invalid/video' })];
  const videos = [video('a'), video('b')];
  const index = await prepareHistoryIndex(history, videos, now, turn);
  assert.equal(index.history, history); assert.equal(index.videos, videos);
  assert.equal(index.playedAt.a, now); assert.equal(index.lastDay, 2); assert.equal(index.orphans, 1);
  assert.deepEqual(index.recovery, { sources: { open: 2, progress: 1, watchRoom: 1 }, resumable: 1 });
});

test('source/window filters preserve event order, duplicates, inclusive cutoff and scoped card visibility', async () => {
  const history = [entry('private'), entry('a', now, { source: 'progress' }), entry('a', now - 50),
    entry('b', now - 86_400_000), entry('c', now - 604_800_000, { source: 'watch-room' })];
  const index = await prepareHistoryIndex(history, [video('a'), video('b'), video('c')], now, turn);
  const all = await filterHistory(index, 'all', 'all', now, turn);
  assert.equal(all.entries, history); assert.equal(all.videos, index.videos);
  const day = await filterHistory(index, 'all', 'day', now, turn);
  assert.equal(day.entries.length, 4); assert.deepEqual(day.videos.map(row => row.id), ['a', 'b']);
  const direct = await filterHistory(index, 'open', 'day', now, turn);
  assert.deepEqual(direct.entries.map(row => row.id), ['private', 'a', 'b']);
  const room = await filterHistory(index, 'watch-room', 'week', now, turn);
  assert.deepEqual(room.videos.map(row => row.id), ['c']);
  assert.equal((await filterHistory(index, 'progress', 'day', now, turn)).entries.length, 1);
});

test('historical tag counts retain per-event weighting, exclusions and deterministic ties', async () => {
  const tags = { a: ['science', 'year-2026', 'youtube', 'film'], b: ['art', 'film', 'https'], c: ['science'] };
  assert.deepEqual(await prepareHistoryTags([entry('a'), entry('a'), entry('b'), entry('c')], tags, turn),
    [['film', 3], ['science', 3], ['art', 1]]);
});

test('chunked history export preserves existing schema, Unicode, event identity and local date formatting', async () => {
  const history = Array.from({ length: 150 }, (_, i) => entry(String(i), now - i, { url: 'https://example.invalid/?q="🌍"',
    ...(i % 2 ? { eventId: `event-${i}`, source: 'watch-room' as const, position: 0, duration: 100 } : {}) }));
  const cards = new Map(history.slice(0, 120).map(row => [row.id, video(row.id)]));
  const text = await (await historyExportBlob(history, cards, turn)).text();
  const rows = JSON.parse(text);
  const expected = history.map(row => ({ id: row.id, eventId: row.eventId ?? `${row.id}:${row.at}:${row.source ?? 'open'}`,
    occurredAt: new Date(row.at).toISOString(), localTime: new Date(row.at).toLocaleString(), source: row.source ?? 'open',
    positionSeconds: row.position ?? null, durationSeconds: row.duration ?? null, url: row.url ?? null, title: cards.get(row.id)?.name ?? 'Recovered activity' }));
  assert.deepEqual(rows, expected);
  assert.equal(text, JSON.stringify(expected, null, 2));
  assert.equal(await (await historyExportBlob([], cards, turn)).text(), '[]');
});

test('filtering and exporting reuse the index without reading unrelated card metadata', async () => {
  let reads = 0;
  const videos = Array.from({ length: 10_000 }, (_, i) => ({ ...video(String(i)), get name() { reads++; return `Title ${i}`; } }));
  const history = videos.map(v => entry(v.id));
  const index = await prepareHistoryIndex(history, videos, now, turn);
  await filterHistory(index, 'progress', 'day', now, turn); assert.equal(reads, 0);
  await historyExportBlob(history.slice(0, 128), index.byId, turn); assert.equal(reads, 128);
});

test('index, tags, selection and export yield before row inspection and stop on cancellation', async () => {
  let reads = 0;
  const rows = Array.from({ length: 10_000 }, (_, i) => ({ ...entry(String(i)), get id() { reads++; return String(i); } }));
  const index = await prepareHistoryIndex(rows, [], now, turn);
  for (const work of [t => prepareHistoryIndex(rows, [], now, t), t => prepareHistoryTags(rows, {}, t),
    t => filterHistory(index, 'open', 'day', now, t), t => historyExportBlob(rows, index.byId, t)] as Array<(t: () => Promise<void>) => Promise<unknown>>) {
    const controller = new AbortController(); let turns = 0;
    reads = 0;
    const pending = work(async () => { if (++turns === 2) controller.abort(); controller.signal.throwIfAborted(); });
    assert.equal(reads, 0, 'no event fields are read on the initiating event stack');
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(turns, 2);
  }
});
