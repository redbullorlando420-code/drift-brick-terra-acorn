import { test } from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { createPullControl, runPausablePull, setPullsPaused } from "./pull-control.ts";
test("paused requests and their responses wait without polling until resumed", async () => {
  setPullsPaused(true);
  let requests = 0, applied = false;
  let complete!: (value: number) => void;
  const job = runPausablePull(() => { requests++; return new Promise<number>(resolve => { complete = resolve; }); }).then(value => { applied = true; return value; });
  await Promise.resolve(); assert.equal(requests, 0);
  setPullsPaused(false); await setImmediate();
  assert.equal(requests, 1);
  setPullsPaused(true); complete(42);
  await setImmediate(); assert.equal(applied, false);
  setPullsPaused(false); assert.equal(await job, 42);
});
test("repausing before resumed jobs continue still holds them", async () => {
  const control = createPullControl(true);
  let done = false, notifications = 0;
  const unsubscribe = control.subscribe(() => notifications++);
  const job = control.wait().then(() => { done = true; });
  control.set(false); control.set(true);
  await Promise.resolve(); await Promise.resolve(); assert.equal(done, false);
  control.set(false); await job;
  unsubscribe(); control.set(true);
  assert.equal(notifications, 3);
});
