import assert from "node:assert/strict";
import test from "node:test";
import { nextLikelyHub, shouldWarmHubRoute } from "./warm-route-cache.ts";

test("warm route cache selects only the next adjacent Hub destination", () => {
  assert.equal(nextLikelyHub("home"), "anime");
  assert.equal(nextLikelyHub("photos"), "spotify");
  assert.equal(nextLikelyHub("settings"), "stats");
  assert.equal(nextLikelyHub("unmanaged-folder"), null);
});

test("warm route cache yields to hidden, constrained, or active contexts", () => {
  const base = { visible: true };
  assert.equal(shouldWarmHubRoute(base), true);
  assert.equal(shouldWarmHubRoute({ ...base, saveData: true }), false);
  assert.equal(shouldWarmHubRoute({ ...base, effectiveType: "3g" }), false);
  assert.equal(shouldWarmHubRoute({ ...base, effectiveType: "2g" }), false);
  assert.equal(shouldWarmHubRoute({ ...base, deviceMemory: 2 }), false);
  assert.equal(shouldWarmHubRoute({ ...base, inputPending: true }), false);
  assert.equal(shouldWarmHubRoute({ ...base, visible: false }), false);
});
