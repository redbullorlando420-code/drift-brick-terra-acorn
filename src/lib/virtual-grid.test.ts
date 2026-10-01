import assert from "node:assert/strict";
import { test } from "node:test";
import { GRID_MOUNT_CAP, GridRowMetrics, gridWindow } from "./virtual-grid.ts";

test("a million-title grid remains bounded scrolling forward and all the way back", () => {
  for (const columns of [1, 2, 3, 4, 5, 7]) {
    const metrics = new GridRowMetrics(200);
    for (const top of [0, 400, 40_000, 4_000_000, 28_000_000, 800, 0]) {
      const window = gridWindow(1_000_000, columns, top, 844, metrics);
      assert.ok(window.end - window.start <= GRID_MOUNT_CAP);
      assert.equal(window.start % columns, 0);
      assert.ok(window.start <= metrics.rowAt(top, Math.ceil(1_000_000 / columns)) * columns);
      assert.equal(window.lead + (metrics.offset(Math.ceil(window.end / columns)) - metrics.offset(window.start / columns)) + window.tail, metrics.offset(Math.ceil(1_000_000 / columns)));
    }
    assert.equal(gridWindow(1_000_000, columns, 0, 844, metrics).start, 0);
  }
});

test("measured tall metadata rows preserve offsets and exact row boundaries", () => {
  const metrics = new GridRowMetrics(200);
  metrics.measure(0, 240); metrics.measure(2, 320); metrics.measure(3, 180);
  assert.equal(metrics.offset(1), 240);
  assert.equal(metrics.offset(3), 760);
  assert.equal(metrics.offset(4), 940);
  assert.equal(metrics.rowAt(759, 50), 2);
  assert.equal(metrics.rowAt(760, 50), 3);
  assert.equal(metrics.rowAt(939, 50), 3);
  assert.equal(metrics.rowAt(940, 50), 4);
  assert.equal(metrics.measure(2, 320), false);
  metrics.measure(2, 220);
  assert.equal(metrics.offset(4), 840);
});

test("row measurements retain a bounded recent cache after a long session", () => {
  const metrics = new GridRowMetrics(200, 16);
  for (let row = 0; row < 10_000; row++) metrics.measure(row, 220);
  assert.equal(metrics.measuredRows, 16);
  assert.equal(metrics.offset(100), 20_000);
  assert.equal(metrics.offset(10_000), 2_000_320);
  assert.equal(metrics.rowAt(metrics.offset(9_995), 10_000), 9_995);
});

test("empty and partial rows never invent cards or negative spacer heights", () => {
  const metrics = new GridRowMetrics(150);
  assert.deepEqual(gridWindow(0, 5, 0, 844, metrics), { start: 0, end: 0, lead: 0, tail: 0 });
  const small = gridWindow(8, 5, 0, 844, metrics);
  assert.equal(small.start, 0); assert.equal(small.end, 8);
  const last = gridWindow(503, 5, 15_000, 844, metrics);
  assert.equal(last.end, 503); assert.equal(last.tail, 0);
  assert.ok(last.lead >= 0);
  assert.equal(metrics.measure(0, 0), false);
  assert.equal(metrics.measure(0, Number.NaN), false);
});
