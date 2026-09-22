import assert from "node:assert/strict";
import test from "node:test";
import { INTERACTION_PRIORITY_WINDOW_MS, interactionPriorityDelay } from "./interaction-budget.ts";

test("interaction priority delay protects the next paint window without extending past its lease", () => {
  const start = 1_000;
  const until = start + INTERACTION_PRIORITY_WINDOW_MS;
  assert.equal(interactionPriorityDelay(start, until), INTERACTION_PRIORITY_WINDOW_MS);
  assert.equal(interactionPriorityDelay(until - 0.1, until), 1);
  assert.equal(interactionPriorityDelay(until, until), 0);
  assert.equal(interactionPriorityDelay(until + 40, until), 0);
});
