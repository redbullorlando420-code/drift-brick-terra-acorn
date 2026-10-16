import { shallow } from 'zustand/vanilla/shallow';
import { memoizeFields } from '../src/lib/field-selector.ts';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkedOutputPath } from './browser-guard.mjs';

if (!global.gc) throw Error('Run with node --expose-gc --experimental-strip-types');
const output = checkedOutputPath(process.argv[2] ?? 'screenshots/card-subscriptions.json', [resolve('screenshots')], 'card subscription benchmark');
const action = () => {};
const state = { byId: {}, failed: {}, durations: {}, diagnostics: {}, request: action, retry: action, recallCompanion: action };
const keys = Array.from({ length: 108 }, (_, i) => `card:${i}`);
const previous = id => {
  let snapshot;
  return s => {
    const next = { thumb: s.byId[id], failed: s.failed[id], capturedDur: s.durations[id], request: s.request, retry: s.retry, recallCompanion: s.recallCompanion, artworkDiagnostic: s.diagnostics[id] };
    if (!snapshot || !shallow(snapshot, next)) snapshot = next;
    return snapshot;
  };
};
const improved = id => memoizeFields()({ thumb: s => s.byId[id], failed: s => s.failed[id], capturedDur: s => s.durations[id], request: s => s.request, retry: s => s.retry, recallCompanion: s => s.recallCompanion, artworkDiagnostic: s => s.diagnostics[id] });
const measure = (create, updates) => {
  const selectors = keys.map(create), snapshots = selectors.map(select => select(state));
  global.gc();
  const start = performance.now(); let changed = 0;
  for (const next of updates) for (let i = 0; i < selectors.length; i++) {
    const selected = selectors[i](next);
    if (selected !== snapshots[i]) { snapshots[i] = selected; changed++; }
  }
  return { ms: performance.now() - start, publishedSnapshots: changed };
};
const statusUpdates = Array.from({ length: 2000 }, (_, i) => ({ ...state, status: i }));
const artworkUpdates = Array.from({ length: 2000 }, (_, i) => ({ ...state, byId: { [keys[i % keys.length]]: `art:${i}` } }));
const results = [];
for (const [action, updates] of [['unrelated status writes', statusUpdates], ['changing artwork rows', artworkUpdates]]) {
  // Warm both implementations before the measured run.
  measure(previous, updates.slice(0, 100)); measure(improved, updates.slice(0, 100));
  results.push({ action, cards: keys.length, updates: updates.length, oldShallow: measure(previous, updates), stableFields: measure(improved, updates) });
}
const report = { limitation: 'Synthetic seven-field thumbnail subscriptions at 108 mounted cards; timings cover selector evaluation only, not React rendering, whole-app memory or provider throughput.', results };
writeFileSync(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
