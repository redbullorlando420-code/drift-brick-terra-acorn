import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { mergeRemoteCatalogAsync } from '../src/lib/videos/remote-merge.ts';
import { prepareCatalogRestore } from '../src/lib/videos/catalog-restore.ts';
import { resolvePerformanceProfile } from '../src/lib/performance-profile.ts';
import { railWindow } from '../src/lib/virtual-rail.ts';
import { GridRowMetrics, gridWindow } from '../src/lib/virtual-grid.ts';

const profile = resolvePerformanceProfile('adaptive', { cores: 2, memoryGiB: 2 });
const turn = () => new Promise(resolve => setImmediate(resolve));
const results = [];
for (const entries of [100_000, 1_000_000]) {
  global.gc?.();
  const rows = Array.from({ length: entries }, (_, i) => ({ id: String(i), folderId: 'disk:test', name: 'Fixture', path: String(i), extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: 1 }));
  global.gc?.(); const residentMiB = process.memoryUsage().heapUsed / 1048576;
  let reads = 0;
  const observed = new Proxy(rows, { get(target, key, receiver) { if (typeof key === 'string' && /^\d+$/.test(key)) reads++; return Reflect.get(target, key, receiver); } });
  const start = performance.now();
  const unchanged = await mergeRemoteCatalogAsync(observed, [{ ...rows[511] }], { turn });
  const unchangedMs = performance.now() - start;
  assert.equal(unchanged, observed); assert.equal(reads, entries + 1);
  const restored = await prepareCatalogRestore({ videos: [], follows: [], favorites: {}, likes: {}, progress: {}, resumeProgress: {} }, rows, { turn, newestResume: () => undefined });
  assert.equal(restored.videos.length, entries);
  let railMax = 0, gridMax = 0;
  for (const width of [390, 1280]) for (let visit = 0; visit < 10_000; visit++) {
    const position = visit * 991 % entries;
    const rail = railWindow(entries, width, 236, position, profile.railOverscan);
    railMax = Math.max(railMax, rail.end - rail.start);
    const columns = width < 500 ? 2 : 5;
    const grid = gridWindow(entries, columns, position * 260 / columns, 844, new GridRowMetrics(260), profile.gridMountCap, 1);
    gridMax = Math.max(gridMax, grid.end - grid.start);
  }
  assert.ok(railMax <= 6); assert.ok(gridMax <= profile.gridMountCap);
  results.push({ entries, fixtureResidentMiB: +residentMiB.toFixed(1), noChangeMs: +unchangedMs.toFixed(1), noChangeReads: reads,
    unchangedArrayReused: true, fullArrayCopiesOnNoChange: 0, approximateReferenceBytesAvoided: entries * 8,
    railMax, gridMax, heapAfterRestoreMiB: +(process.memoryUsage().heapUsed / 1048576).toFixed(1) });
}
const report = { profile, nodeHeapLimitMiB: 384, results,
  limitations: 'Run with a 384 MiB Node old-space limit. Two-core/two-GiB capability hints select production budgets; this does not emulate CPU speed or establish browser/physical-device memory soak. Fixture omits artwork, transcripts, browser/IndexedDB overhead. Reference bytes are an estimate, not measured browser heap savings.' };
writeFileSync(new URL('../screenshots/low-memory-benchmark.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
