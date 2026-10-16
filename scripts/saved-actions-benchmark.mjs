import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { patchSparseRecord, removeSparseRecordKeys, encodeSparseRecord } from '../src/lib/sparse-record.ts';

const results = [];
for (const entries of [10000, 100000, 1000000]) {
  const base = Object.fromEntries(Array.from({ length: entries }, (_, i) => [`saved:${i}`, true]));
  const measure = update => {
    global.gc?.(); const before = process.memoryUsage().heapUsed, at = performance.now();
    let current = base;
    for (let i = 0; i < 6; i++) current = update(current, `saved:${entries - 1}`);
    const ms = performance.now() - at;
    global.gc?.(); const extraHeapBytes = process.memoryUsage().heapUsed - before;
    if (!current[`saved:${entries - 1}`] || Object.keys(current).length !== entries) throw Error('Toggle parity failed');
    return { ms, extraHeapBytes };
  };
  const copied = measure((source, id) => { const next = { ...source }; if (next[id]) delete next[id]; else next[id] = true; return next; });
  const sparse = measure((source, id) => source[id] ? removeSparseRecordKeys(source, [id]) : patchSparseRecord(source, [[id, true]]));
  results.push({ entries, toggles: 6, copied, sparse });
}
const report = { results, limitation: 'Synthetic in-memory record updates only; excludes selectors, rendering, persistence and browser memory.' };
writeFileSync(process.argv[2] ?? 'screenshots/saved-actions-benchmark.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
