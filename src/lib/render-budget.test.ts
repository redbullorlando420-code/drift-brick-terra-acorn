import { test } from "node:test";
import assert from "node:assert/strict";
import { getRenderBudgetSnapshot, registerMountedCard, setRenderBudgetMonitoring } from "./render-budget.ts";

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

test('frame window is bounded and hidden time is excluded; cleanup stops scheduled work', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const pending = new Map<number, (time: number) => void>(); let id = 0;
  const visibility = new EventTarget() as EventTarget & { hidden: boolean }; visibility.hidden = false;
  Object.defineProperty(globalThis, 'document', { configurable: true, value: visibility });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { requestAnimationFrame: (cb: (n: number) => void) => { pending.set(++id, cb); return id; }, cancelAnimationFrame: (key: number) => pending.delete(key) } });
  const frame = (at: number) => { const [key, cb] = pending.entries().next().value!; pending.delete(key); cb(at); };
  const release = registerMountedCard();
  try {
    setRenderBudgetMonitoring(true);
    for (let n = 0; n < 300; n++) frame(n * 16);
    assert.equal(getRenderBudgetSnapshot().sampledFrames, 240);
    const before = getRenderBudgetSnapshot().longFrames;
    visibility.hidden = true; visibility.dispatchEvent(new Event('visibilitychange')); assert.equal(pending.size, 0);
    visibility.hidden = false; visibility.dispatchEvent(new Event('visibilitychange'));
    frame(100_000); frame(100_016);
    assert.equal(getRenderBudgetSnapshot().longFrames, before);
    release(); release(); assert.equal(pending.size, 0); assert.equal(getRenderBudgetSnapshot().mountedCards, 0);
    setRenderBudgetMonitoring(false);
  } finally {
    release(); setRenderBudgetMonitoring(false);
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else Reflect.deleteProperty(globalThis, 'document');
  }
});
