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
