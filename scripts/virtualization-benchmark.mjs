import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import { railItems } from '../src/lib/virtual-rail.ts';
import { GridRowMetrics, GRID_MOUNT_CAP, gridWindow } from '../src/lib/virtual-grid.ts';

const reports = [];
for (const entries of [100_000, 1_000_000]) {
  const catalog = Array.from({length: entries}, (_, id) => ({id}));
  const previousAt = performance.now();
  const prefix = catalog.slice(0, entries);
  const previousMs = performance.now() - previousAt;
  if (prefix.length !== entries) throw new Error('Incomplete reference copy');
  let maxRailReferences = 0, maxGridCards = 0;
  const samples = [];
  const metrics = new GridRowMetrics(260);
  for (let visit = 0; visit < 10_000; visit++) {
    const index = visit % 2 ? (visit * 7919) % entries : entries - 1;
    const width = visit % 3 ? 1280 : 390;
    const columns = width === 390 ? 2 : 5;
    const at = performance.now();
    const rail = railItems(catalog, entries, width, 240, index);
    const grid = gridWindow(entries, columns, Math.floor(index / columns) * 260, 844, metrics);
    samples.push(performance.now() - at);
    maxRailReferences = Math.max(maxRailReferences, rail.items.length);
    maxGridCards = Math.max(maxGridCards, grid.end - grid.start);
    if (rail.items.length > 8 || grid.end - grid.start > GRID_MOUNT_CAP) throw new Error('Mount budget exceeded');
    metrics.measure(Math.floor(index / columns), 250 + visit % 50);
  }
  samples.sort((a, b) => a - b);
  reports.push({entries, visits: samples.length, previousPrefixReferences: prefix.length, previousPrefixCopyMs: +previousMs.toFixed(3),
    maxRailReferences, maxGridCards, retainedRowMeasurements: metrics.measuredRows,
    windowMedianMs: +samples[5000].toFixed(3), windowP95Ms: +samples[9500].toFixed(3), windowWorstMs: +samples.at(-1).toFixed(3)});
}
const report = {reports, note: 'Synthetic Node window/geometry benchmark with real reference arrays, not browser scroll latency, browser maximum scroll dimensions, or a heap soak.'};
writeFileSync(new URL('../screenshots/virtualization-benchmark.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
