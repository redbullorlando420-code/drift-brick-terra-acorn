import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeActivityRecords, encodeActivityRecords, mergeResumeRecords, patchActivityRecord, recentActivityRecord, recoverActivityCounts, recoverResumeRecords } from './activity-records.ts';

test('watch updates and bounded fallback mirrors never enumerate existing ledgers', () => {
  const baseline = new Proxy({ current: 2, old: 3 }, { ownKeys() { throw Error('large activity ledger enumerated'); } });
  let latest = patchActivityRecord(baseline, [['current', 4]]);
  assert.equal(baseline.current, 2); assert.equal(latest.old, 3);
  for (let i = 0; i < 1000; i++) latest = patchActivityRecord(latest, [[String(i), i + 1]]);
  const mirror = recentActivityRecord(latest);
  assert.equal(Object.keys(mirror).length, 200); assert.equal(mirror['999'], 1000);
  assert.equal(mirror['799'], undefined); assert.equal(latest.current, 4);
  assert.equal(patchActivityRecord(latest, [['999', 1000]]), latest);
  assert.doesNotThrow(() => encodeActivityRecords({ viewCounts: latest }));
});

test('all sparse activity fields survive structured clone and JSON exports without mutating earlier snapshots', () => {
  const mark = { t: 10, d: 100, at: 1 }, next = { t: 20, d: 100, at: 2 };
  const baseline = Object.fromEntries(Array.from({ length: 60_000 }, (_, i) => [`id:${i}`, mark]));
  const progress = patchActivityRecord(baseline, [['id:5', next]]);
  const value = { progress, resumeProgress: patchActivityRecord({}, [['url', next]]),
    viewCounts: patchActivityRecord({ old: 7 }, [['played', 1]]), cameCounts: patchActivityRecord({}, [['marked', 3]]), savedAt: 2 };
  const restored = decodeActivityRecords(structuredClone(encodeActivityRecords(value)));
  assert.equal(Object.keys(restored.progress).length, 60_000);
  assert.deepEqual(restored.progress['id:5'], next); assert.deepEqual(restored.progress['id:59999'], mark);
  assert.deepEqual(restored.resumeProgress.url, next); assert.equal(restored.viewCounts.old, 7);
  assert.equal(restored.viewCounts.played, 1); assert.equal(restored.cameCounts.marked, 3);
  assert.deepEqual(baseline['id:5'], mark);
  assert.deepEqual(JSON.parse(JSON.stringify(restored)).progress['id:5'], next);
});

test('legacy plain records remain readable and mirrors use recent touches rather than old insertion order', () => {
  const legacy = { progress: { watched: { t: 2, d: 100, at: 1 } }, viewCounts: { watched: 4 } };
  assert.deepEqual(decodeActivityRecords(legacy), legacy);
  let counts = patchActivityRecord(legacy.viewCounts, [['watched', 5]]);
  for (let i = 0; i < 200; i++) counts = patchActivityRecord(counts, [[`new:${i}`, 1]]);
  counts = patchActivityRecord(counts, [['watched', 6]]);
  assert.equal(recentActivityRecord(counts).watched, 6);
  assert.equal(Object.keys(recentActivityRecord(counts)).length, 200);
});

test('resume recovery selects newer timestamps even for backward seeks or completed videos', () => {
  const old = { t: 80, d: 100, at: 1 };
  const base = { sought: old, completed: old, newerOnDisk: { ...old, at: 3 } };
  const recovered = mergeResumeRecords(base, { sought: { t: 10, d: 100, at: 2 }, completed: { t: 100, d: 100, at: 2 }, newerOnDisk: { ...old, at: 2 } });
  assert.equal(recovered.sought.t, 10); assert.equal(recovered.completed.t, 100); assert.equal(recovered.newerOnDisk.at, 3);
  assert.equal(base.sought.t, 80);
});

test('old preferences cannot overwrite newer durable watch positions and counts during startup', () => {
  const prefs = { watched: { t: 80, d: 100, at: 1 } }, live = { duringLoad: { t: 15, d: 100, at: 4 } };
  const disk = { watched: { t: 20, d: 100, at: 3 } };
  for (const order of [[prefs, disk, live], [live, disk, prefs], [disk, prefs, live]]) {
    const restored = recoverResumeRecords(...order);
    assert.equal(restored.watched.t, 20); assert.equal(restored.duringLoad.at, 4);
  }
  assert.deepEqual(recoverActivityCounts({ watched: 2 }, { watched: 5, older: 3 }, { watched: 1, duringLoad: 1 }), { watched: 5, older: 3, duringLoad: 1 });
  assert.equal(prefs.watched.t, 80);
});
