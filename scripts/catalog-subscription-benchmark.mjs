import { shallow } from 'zustand/vanilla/shallow';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkedOutputPath } from './browser-guard.mjs';

if (!global.gc) throw Error('Run with node --expose-gc');
const output = checkedOutputPath(process.argv[2] ?? 'screenshots/catalog-subscriptions.json', [resolve('screenshots')], 'catalog subscription benchmark');
const measure = run => {
  global.gc();
  const before = process.memoryUsage().heapUsed, start = performance.now();
  const equal = run();
  return { equal, ms: performance.now() - start, retainedHeapBytesBeforeCollection: Math.max(0, process.memoryUsage().heapUsed - before) };
};
const results = [];
for (const size of [80_000, 1_000_000]) {
  const current = Array.from({ length: size }, (_, i) => i), replacement = current.slice();
  for (const [action, previous, next] of [['enter catalog', [], current], ['publish replacement', current, replacement], ['leave catalog', current, []]]) {
    results.push({ size, action, oldShallow: measure(() => shallow(previous, next)), referenceIdentity: measure(() => Object.is(previous, next)) });
  }
}
const report = { limitation: 'Synthetic numeric title references; heap delta is sampled before explicit collection and is not process peak memory. Replacement snapshots intentionally publish even when their references have equal contents.', results };
writeFileSync(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
