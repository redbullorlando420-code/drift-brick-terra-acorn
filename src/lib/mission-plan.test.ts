import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeMissionPlan, type Mission } from "./mission-plan.ts";

const defaults: Mission[] = [
  { id: "earlier-complete", title: "Earlier completion", detail: "Updated detail", done: true },
  { id: "recent-saved-library-hydration", title: "Saved-library hydration integrity", detail: "Verified", done: true },
  { id: "still-planned", title: "Still planned", detail: "Not verified", done: false },
  { id: "youtube-upgrade-03", title: "First-click trace", detail: "Verified", done: true },
  { id: "youtube-upgrade-05", title: "Artwork priority", detail: "Verified", done: true },
];

test("revision 2 promotes only the newly verified hydration milestone", () => {
  const saved: Mission[] = [
    { ...defaults[0], detail: "Old detail", done: false, status: "planned" },
    { ...defaults[1], done: false, status: "planned" },
    { id: "my-idea", title: "My idea", detail: "Keep this", done: false },
  ];
  const merged = mergeMissionPlan(saved, defaults, 2);
  assert.equal(merged[0].done, false);
  assert.equal(merged[0].detail, "Updated detail");
  assert.equal(merged[1].done, true);
  assert.equal(merged[1].status, "complete");
  assert.equal(merged[2].title, "My idea");
  assert.equal(merged[3].id, "still-planned");
  assert.equal(merged[4].id, "youtube-upgrade-03");
});

test("a later manual restore to planned remains saved", () => {
  const saved: Mission[] = [{ ...defaults[1], done: false, status: "planned" }];
  assert.equal(mergeMissionPlan(saved, defaults, 3)[0].done, false);
});

test("revision 3 promotes the YouTube trace without undoing manual restores", () => {
  const saved: Mission[] = [
    { ...defaults[0], done: false, status: "planned" },
    { ...defaults[3], done: false, status: "planned" },
  ];
  const merged = mergeMissionPlan(saved, defaults, 3);
  assert.equal(merged[0].done, false);
  assert.equal(merged[1].done, true);
  assert.equal(mergeMissionPlan([{ ...defaults[3], done: false }], defaults, 4)[0].done, false);
});

test("revision 4 promotes artwork priority while respecting older manual restores", () => {
  const saved: Mission[] = [
    { ...defaults[0], done: false, status: "planned" },
    { ...defaults[3], done: false, status: "planned" },
    { ...defaults[4], done: false, status: "in-progress" },
  ];
  const merged = mergeMissionPlan(saved, defaults, 4);
  assert.equal(merged[0].done, false);
  assert.equal(merged[1].done, false);
  assert.equal(merged[2].done, true);
  assert.equal(merged[2].status, "complete");
  assert.equal(mergeMissionPlan([{ ...defaults[4], done: false }], defaults, 5)[0].done, false);
});

test("pre-revision plans receive the original verified completions", () => {
  const saved: Mission[] = [{ ...defaults[0], done: false, status: "in-progress" }];
  assert.equal(mergeMissionPlan(saved, defaults, 0)[0].done, true);
});
test('revision 5 promotes only verified viewer milestones and preserves later manual choices', () => {
  const added: Mission[] = [
    { id: 'viewer-detail-isolation', title: 'Isolated details', detail: 'Verified', done: true },
    { id: 'viewer-detail-memory-budget', title: 'Bounded details', detail: 'Verified', done: true },
    { id: 'speed-03', title: 'Broader render audit', detail: 'Remaining work', done: false },
  ];
  const saved = added.map(row => ({ ...row, done: false, status: 'planned' as const }));
  const merged = mergeMissionPlan(saved, added, 5);
  assert.deepEqual(merged.map(row => row.done), [true, true, false]);
  assert.equal(mergeMissionPlan(saved, added, 6)[0].done, false);
});

test('revision 6 completes the verified search budget without completing broader audits', () => {
  const current: Mission[] = [
    { id: 'recent-search-result-budget', title: 'Search budget', detail: 'Verified', done: true },
    { id: 'speed-03', title: 'Render audit', detail: 'More measurements needed', done: false },
    { id: 'recent-provider-soak', title: 'Provider soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 6).map(row => row.done), [true, false, false]);
  assert.equal(mergeMissionPlan(saved, current, 7)[0].done, false);
});

test('revision 7 starts the timer audit without completing it or changing other manual choices', () => {
  const current: Mission[] = [
    { id: 'smooth-09', title: 'Timer consolidation', detail: 'Partial isolation verified', done: false, status: 'in-progress' },
    { id: 'speed-03', title: 'Render audit', detail: 'Still in progress', done: false },
  ];
  const saved = current.map(row => ({ ...row, status: 'planned' as const }));
  const updated = mergeMissionPlan(saved, current, 7);
  assert.deepEqual(updated.map(row => row.status), ['in-progress', 'planned']);
  assert.deepEqual(updated.map(row => row.done), [false, false]);
  assert.equal(mergeMissionPlan(saved, current, 8)[0].status, 'planned');
  assert.equal(mergeMissionPlan([{ ...saved[0], status: 'blocked' }], current, 7)[0].status, 'blocked');
});

test('revision 8 completes verified timer consolidation and preserves unrelated/later manual statuses', () => {
  const current: Mission[] = [
    { id: 'smooth-09', title: 'Timer consolidation', detail: 'Shared scheduler verified', done: true },
    { id: 'speed-06', title: 'Idle enrichment queue', detail: 'More work needed', done: false },
    { id: 'recent-provider-soak', title: 'Provider soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  const merged = mergeMissionPlan(saved, current, 8);
  assert.deepEqual(merged.map(row => row.done), [true, false, false]);
  assert.deepEqual(merged.map(row => row.status), ['complete', 'in-progress', 'in-progress']);
  assert.equal(mergeMissionPlan([{ ...saved[0], status: 'planned' }], current, 9)[0].status, 'planned');
});

test('revision 9 promotes only verified navigation and preserves later manual restores', () => {
  const current: Mission[] = [
    { id: 'smooth-01', title: 'Navigation transition budget', detail: 'Verified', done: true },
    { id: 'speed-03', title: 'Render audit', detail: 'Card invalidation remains', done: false },
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 9).map(row => row.done), [true, false, false]);
  assert.equal(mergeMissionPlan(saved, current, 10)[0].done, false);
});

test('revision 10 starts enrichment work honestly without completing it or overriding blocked/later choices', () => {
  const current: Mission[] = [
    { id: 'speed-06', title: 'Idle enrichment queue', detail: 'Queue shipped; large ledger materialization remains', done: false, status: 'in-progress' },
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, status: 'planned' as const }));
  const updated = mergeMissionPlan(saved, current, 10);
  assert.deepEqual(updated.map(row => row.done), [false, false]);
  assert.deepEqual(updated.map(row => row.status), ['in-progress', 'planned']);
  assert.equal(mergeMissionPlan(saved, current, 11)[0].status, 'planned');
  assert.equal(mergeMissionPlan([{ ...saved[0], status: 'blocked' }], current, 10)[0].status, 'blocked');
});

test('revision 11 completes only verified enrichment and respects later manual restores', () => {
  const current: Mission[] = [
    { id: 'speed-06', title: 'Idle enrichment queue', detail: 'Sparse updates verified', done: true },
    { id: 'speed-03', title: 'Render invalidation audit', detail: 'Still open', done: false },
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  const merged = mergeMissionPlan(saved, current, 11);
  assert.deepEqual(merged.map(row => row.done), [true, false, false]);
  assert.equal(merged[0].status, 'complete');
  assert.equal(mergeMissionPlan([{ ...saved[0], status: 'planned' }], current, 12)[0].status, 'planned');
});

test('revision 12 completes verified virtualization without changing other or later manual choices', () => {
  const current: Mission[] = [
    { id: 'smooth-02', title: 'Long-list virtualization proof', detail: 'Verified', done: true },
    { id: 'speed-03', title: 'Render invalidation audit', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 12).map(row => row.done), [true, false]);
  assert.equal(mergeMissionPlan(saved, current, 13)[0].status, 'planned');
});

test('revision 13 completes only verified startup milestones and preserves later manual choices', () => {
  const current: Mission[] = [
    { id: 'speed-01', title: 'First interaction budget', detail: 'Verified', done: true },
    { id: 'recent-cold-home-readiness', title: 'Cold Home readiness proof', detail: 'Verified', done: true },
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Still open', done: false },
    { id: 'recent-memory-soak', title: 'Memory soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 13).map(row => row.done), [true, true, false, false]);
  assert.deepEqual(mergeMissionPlan(saved, current, 14).map(row => row.status), ['in-progress', 'in-progress', 'in-progress', 'in-progress']);
});

test('revision 14 completes the verified slow-device profile without resetting other or later choices', () => {
  const current: Mission[] = [
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Verified budgets', done: true },
    { id: 'speed-09', title: 'Mobile memory budget', detail: 'Broader audit remains', done: false },
    { id: 'recent-provider-soak', title: 'Provider soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 14).map(row => row.done), [true, false, false]);
  assert.equal(mergeMissionPlan(saved, current, 15)[0].status, 'in-progress');
});
