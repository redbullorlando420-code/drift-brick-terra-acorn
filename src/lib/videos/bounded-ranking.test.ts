import test from 'node:test';
import assert from 'node:assert/strict';
import { bestRanked } from './bounded-ranking.ts';
test('large candidate windows preserve full-sort winners, with deterministic ties', () => {
  const rows = Array.from({ length: 60_000 }, (_, id) => ({ id, score: (Math.imul(id, 2654435761) >>> 0) % 71 }));
  const compare = (a: typeof rows[number], b: typeof rows[number]) => b.score - a.score || a.id - b.id;
  assert.deepEqual(bestRanked(rows, 96, compare), [...rows].sort(compare).slice(0, 96));
  assert.deepEqual(bestRanked(rows, 0, compare), []);
  assert.deepEqual(bestRanked(rows, Infinity, compare), []);
});
