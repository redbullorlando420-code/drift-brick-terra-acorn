import { test } from 'node:test';
import assert from 'node:assert/strict';
import { discoveryPicks, DISCOVERY_SAMPLE_LIMIT } from './discovery-picks.ts';
import type { LibraryVideo } from './types';

const video = (id: number): LibraryVideo => ({ id: String(id), folderId: 'local', name: `Title ${id}`, path: '', extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: 1_000 });

test('million-entry discovery reads only the bounded sample across the entire range', () => {
  const touched: number[] = [];
  const catalog = new Proxy({ length: 1_000_000 }, { get(target, key) {
    if (key === 'length') return target.length;
    assert.match(String(key), /^\d+$/);
    const index = Number(key); touched.push(index); return video(index);
  } }) as unknown as LibraryVideo[];
  const picks = discoveryPicks(catalog, 777, 1_000);
  assert.equal(touched.length, DISCOVERY_SAMPLE_LIMIT);
  assert.ok(Math.min(...touched) < 1_000); assert.ok(Math.max(...touched) > 999_000);
  assert.equal(picks.length, 12); assert.equal(new Set(picks.map(row => row.id)).size, 12);
});

test('small catalogs retain all eligible titles, excluding samples/live and duplicate ids', () => {
  const rows = [video(1), video(1), { ...video(2), isSample: true }, { ...video(3), remote: { kind: 'youtube' as const, live: true, videoId: 'live' } }, video(4)];
  assert.deepEqual(discoveryPicks(rows, 0, 1_000).map(row => row.id).sort(), ['1', '4']);
  assert.deepEqual(discoveryPicks([], 0), []);
});

test('same seed is deterministic and different seeds change both sampled titles and picks', () => {
  const rows = Array.from({ length: 100_000 }, (_, i) => video(i));
  const first = discoveryPicks(rows, 1, 1_000).map(row => row.id);
  assert.deepEqual(discoveryPicks(rows, 1, 1_000).map(row => row.id), first);
  assert.notDeepEqual(discoveryPicks(rows, 2, 1_000).map(row => row.id), first);
});
