import { test } from "node:test";
import assert from "node:assert/strict";
import { registerMountedCard, setRenderBudgetMonitoring } from "./render-budget.ts";

test("mounted cards do not run a frame loop until diagnostics are enabled", () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const pending = new Map<number, (time: number) => void>();
  let nextId = 0;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { requestAnimationFrame: (callback: (time: number) => void) => { const id = ++nextId; pending.set(id, callback); return id; } },
  });
  const flushOne = (time: number) => {
    const entry = pending.entries().next().value as [number, (time: number) => void] | undefined;
    if (!entry) return false;
    pending.delete(entry[0]);
    entry[1](time);
    return true;
  };

  const release = registerMountedCard();
  assert.equal(pending.size, 0);
  setRenderBudgetMonitoring(true);
  assert.equal(pending.size, 1);
  assert.equal(flushOne(16), true);
  assert.equal(pending.size, 1);

  // Turning diagnostics off invalidates its pending callback. Re-enabling
  // cannot let that stale callback create a second sampling loop.
  setRenderBudgetMonitoring(false);
  setRenderBudgetMonitoring(true);
  assert.equal(pending.size, 2);
  assert.equal(flushOne(32), true);
  assert.equal(pending.size, 1);
  setRenderBudgetMonitoring(false);
  assert.equal(flushOne(48), true);
  assert.equal(pending.size, 0);

  release();
  if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
  else Reflect.deleteProperty(globalThis, "window");
});
