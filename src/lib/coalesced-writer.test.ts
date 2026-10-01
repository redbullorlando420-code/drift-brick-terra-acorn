import { test } from "node:test";
import assert from "node:assert/strict";
import { CoalescedWriter } from "./coalesced-writer.ts";

test("bursts retain the latest snapshot per key and persist in one active batch", async () => {
  const saved = new Map<string, number>();
  let active = 0, peak = 0, batches = 0;
  const writer = new CoalescedWriter<string, number>(async rows => {
    peak = Math.max(peak, ++active); batches++;
    await Promise.resolve();
    for (const [key, value] of rows) saved.set(key, value);
    active--;
  });
  for (let i = 0; i < 10000; i++) void writer.write(`snapshot-${i % 5}`, i);
  assert.equal(writer.snapshot().pending, 5);
  await writer.idle();
  assert.equal(peak, 1); assert.equal(batches, 1);
  assert.equal(saved.get("snapshot-4"), 9999);
  assert.equal(writer.snapshot().writing, false);
});

test("updates arriving during a write finish after the older batch", async () => {
  let unblock!: () => void;
  const block = new Promise<void>(resolve => { unblock = resolve; });
  const saved: number[] = [];
  const writer = new CoalescedWriter<string, number>(async rows => {
    if (!saved.length) await block;
    saved.push(...rows.map(([,value]) => value));
  });
  void writer.write("progress", 1);
  await Promise.resolve();
  void writer.write("progress", 2);
  void writer.write("progress", 3);
  unblock();
  await writer.idle();
  assert.deepEqual(saved, [1, 3]);
});

test("recoverable artwork queues remain within entry and byte caps under a stalled writer", async () => {
  let unblock!: () => void;
  const block = new Promise<void>(resolve => { unblock = resolve; });
  let first = true;
  const writer = new CoalescedWriter<string, string>(async () => { if (first) { first = false; await block; } },
    { maxPending: 96, maxWeight: 1024, weight: value => value.length * 2 });
  void writer.write("initial", "x");
  await Promise.resolve();
  for (let i = 0; i < 6000; i++) void writer.write(`thumb-${i}`, "x".repeat(50));
  assert.ok(writer.snapshot().pending <= 96);
  assert.ok(writer.snapshot().pendingWeight <= 1024);
  const before = writer.snapshot().pending;
  void writer.write("oversized", "x".repeat(2048));
  assert.equal(writer.snapshot().pending, before);
  unblock(); await writer.idle();
  assert.equal(writer.snapshot().pendingWeight, 0);
});

test("a failed transaction rejects callers and later writes recover", async () => {
  let fail = true;
  const writer = new CoalescedWriter<string, number>(async () => { if (fail) throw new Error("Storage unavailable"); });
  await assert.rejects(writer.write("a", 1), /Storage unavailable/);
  assert.equal(writer.snapshot().writing, false);
  fail = false;
  await writer.write("a", 2);
});

test("a failed older batch still attempts the latest queued user snapshot", async () => {
  let unblock!: () => void;
  const block = new Promise<void>(resolve => { unblock = resolve; });
  const saved: number[] = [];
  let first = true;
  const writer = new CoalescedWriter<string, number>(async rows => {
    if (first) { first = false; await block; throw new Error("Interrupted old write"); }
    saved.push(...rows.map(([, value]) => value));
  });
  const completed = writer.write("preferences", 1);
  await Promise.resolve();
  void writer.write("preferences", 2);
  unblock();
  await assert.rejects(completed, /Interrupted old write/);
  assert.deepEqual(saved, [2]);
  assert.equal(writer.snapshot().pending, 0);
});
