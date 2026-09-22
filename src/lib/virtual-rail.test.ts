import assert from "node:assert/strict";
import test from "node:test";
import { railKeyboardTarget, railLimitForTarget, railWindow, railWindowStartForTarget } from "./virtual-rail.ts";

test("virtual rail bounds its mounted card window", () => {
  assert.deepEqual(railWindow(80, 700, 140, 20), { start: 20, end: 27, visibleSlots: 7 });
  assert.deepEqual(railWindow(5, 700, 140, 20), { start: 0, end: 5, visibleSlots: 7 });
});

test("virtual rail keyboard targets stay inside the catalog", () => {
  assert.equal(railKeyboardTarget("ArrowLeft", 0, 12), null);
  assert.equal(railKeyboardTarget("ArrowRight", 0, 12), 1);
  assert.equal(railKeyboardTarget("Home", 7, 12), 0);
  assert.equal(railKeyboardTarget("End", 7, 12), 11);
  assert.equal(railKeyboardTarget("ArrowRight", 11, 12), null);
});

test("virtual rail expands and centers only the requested keyboard card", () => {
  assert.equal(railLimitForTarget(8, 8, 100), 24);
  assert.equal(railLimitForTarget(24, 99, 100), 100);
  assert.equal(railWindowStartForTarget(20, 100, 7), 17);
  assert.equal(railWindowStartForTarget(99, 100, 7), 93);
});
