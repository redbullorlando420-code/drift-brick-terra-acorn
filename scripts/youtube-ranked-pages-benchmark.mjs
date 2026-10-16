import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createCreatorRankedPages } from '../src/lib/remote/creator-ranked-pages.ts';

// A standalone bounded-heap check for the paging engine, not browser/network QA.
// Run with --max-old-space-size=384 --expose-gc --experimental-strip-types.
const count = 1_000_000;
const rows = Array.from({ length: count }, (_, index) => ({ video: { id: String(index) },
  creator: index < 800_000 ? 'dominant' : `rare-${index % 200}`, score: index % 5, publishedAt: index }));
const page = createCreatorRankedPages(rows);
global.gc?.();
const memoryBefore = process.memoryUsage();
let hashReads = 0;
const shuffle = id => { hashReads++; return Math.imul(Number(id), 0x45d9f3b) >>> 0; };
const started = performance.now(), first = page(shuffle, 0, 96), initialMs = performance.now() - started;
assert.equal(hashReads, count);
const nextStarted = performance.now(), next = page(shuffle, 96, 96), nextPageMs = performance.now() - nextStarted;
assert.equal(hashReads, count); assert.equal(new Set([...first, ...next]).size, 192);
assert.ok(new Set(first.map(video => rows[Number(video.id)].creator)).size >= 90);
const prefix = page(shuffle, 0, 4096);
assert.deepEqual(prefix.slice(0, 192), [...first, ...next]);
global.gc?.();
const memoryFirst = process.memoryUsage();
for (let seed = 1; seed <= 12; seed++) {
  const shuffled = page(id => Math.imul(Number(id) ^ seed, 0x45d9f3b) >>> 0, 0, 96);
  assert.equal(shuffled.length, 96);
}
global.gc?.();
const memoryAfter = process.memoryUsage();
assert.ok(memoryAfter.arrayBuffers - memoryBefore.arrayBuffers <= count * 8 + 1_000_000,
  'repeated mixes retained more than one compact shuffle vector');
const report = { ok: true, entries: count, initialMs: Math.round(initialMs), nextPageMs: +nextPageMs.toFixed(3),
  hashReadsForFirstTwoPages: hashReads, memoryBefore, memoryFirst, memoryAfter,
  limitation: 'Pure compact paging fixture; excludes browser hydration, metadata, feedback compilation and real playback.' };
writeFileSync('screenshots/youtube-ranked-pages-million.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
