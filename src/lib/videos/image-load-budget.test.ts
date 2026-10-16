import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acquireImageSlot,
  clearLowPriorityImageQueue,
  getImageLoadBudgetSnapshot,
  setArtworkSuppressed,
  watchImageSlot,
} from "./image-load-budget.ts";
import { prioritizeInteraction } from '../interaction-budget.ts';

test("source changes cancel queued near-view artwork without consuming a slot", { timeout: 2_000 }, async () => {
  const releases: Array<() => void> = [];
  try {
    const max = getImageLoadBudgetSnapshot().max;
    for (let i = 0; i < max; i++) releases.push((await acquireImageSlot({ priority: "high" }))!);
    const obsolete = acquireImageSlot({ priority: "low" });
    assert.equal(getImageLoadBudgetSnapshot().queuedLow, 1);
    clearLowPriorityImageQueue();
    const releaseObsolete = await obsolete;
    assert.equal(releaseObsolete, null);
    assert.equal(getImageLoadBudgetSnapshot().queuedLow, 0);
    assert.equal(getImageLoadBudgetSnapshot().active, max);
  } finally {
    for (const release of releases) release();
  }
  assert.equal(getImageLoadBudgetSnapshot().active, 0);
});

test("visible artwork gets the next slot ahead of near-view artwork", { timeout: 2_000 }, async () => {
  const releases: Array<() => void> = [];
  try {
    const max = getImageLoadBudgetSnapshot().max;
    for (let i = 0; i < max; i++) releases.push((await acquireImageSlot({ priority: "high" }))!);
    const near = acquireImageSlot({ priority: "low" });
    const visible = acquireImageSlot({ priority: "high" });
    assert.equal(getImageLoadBudgetSnapshot().queuedHigh, 1);
    releases.pop()?.();
    const releaseVisible = await visible;
    assert.ok(releaseVisible);
    assert.equal(getImageLoadBudgetSnapshot().queuedLow, 1);
    releaseVisible();
    // Speculative work leaves capacity for another newly visible card.
    while (releases.length >= Math.max(1, max - 4)) releases.pop()?.();
    const releaseNear = await near;
    assert.ok(releaseNear);
    releaseNear();
  } finally {
    clearLowPriorityImageQueue();
    for (const release of releases) release();
  }
  assert.equal(getImageLoadBudgetSnapshot().active, 0);
});

test("nearby cards leave capacity for visible cards without exceeding the budget", async () => {
  const releases: Array<() => void> = [];
  const controllers = Array.from({ length: getImageLoadBudgetSnapshot().max }, () => new AbortController());
  const pending = controllers.map(controller => acquireImageSlot({ priority: "low", signal: controller.signal }).then(release => { if (release) releases.push(release); return release; }));
  try {
    await Promise.resolve();
    const max = getImageLoadBudgetSnapshot().max;
    const speculative = Math.max(1, max - 4);
    assert.equal(getImageLoadBudgetSnapshot().active, speculative);
    for (let i = speculative; i < max; i++) releases.push((await acquireImageSlot({ priority: "high" }))!);
    assert.equal(getImageLoadBudgetSnapshot().active, max);
  } finally {
    controllers.forEach(controller => controller.abort());
    await Promise.all(pending);
    releases.forEach(release => release());
  }
  assert.equal(getImageLoadBudgetSnapshot().active, 0);
});

test("hidden tabs hold visible requests and restore capacity on visibility change", async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "document");
  const surface = Object.assign(new EventTarget(), { visibilityState: "hidden" });
  const releases: Array<() => void> = [];
  Object.defineProperty(globalThis, "document", { configurable: true, value: surface });
  try {
    const pending = Array.from({ length: 3 }, () => acquireImageSlot({ priority: "high" }).then(release => { if (release) releases.push(release); return release; }));
    assert.equal(getImageLoadBudgetSnapshot().active, 0);
    assert.equal(getImageLoadBudgetSnapshot().queuedHigh, 3);
    surface.visibilityState = "visible";
    surface.dispatchEvent(new Event("visibilitychange"));
    await Promise.all(pending);
    assert.equal(getImageLoadBudgetSnapshot().active, 3);
    assert.equal(getImageLoadBudgetSnapshot().queuedHigh, 0);
  } finally {
    releases.forEach(release => release());
    if (original) Object.defineProperty(globalThis, "document", original);
    else Reflect.deleteProperty(globalThis, "document");
  }
});

test("opening a viewer pauses queued artwork without waking or rerendering every card", { timeout: 2_000 }, async () => {
  const releases: Array<() => void> = [];
  const pendingRelease: { current?: () => void } = {};
  try {
    const max = getImageLoadBudgetSnapshot().max;
    for (let i = 0; i < max; i++) releases.push((await acquireImageSlot({ priority: "high" }))!);
    setArtworkSuppressed(true);
    const pending = acquireImageSlot({ priority: "high" }).then((release) => { pendingRelease.current = release ?? undefined; return release; });
    assert.equal(getImageLoadBudgetSnapshot().queuedHigh, 1);
    releases.pop()?.();
    await Promise.resolve();
    assert.equal(pendingRelease.current, undefined, "viewer overlay keeps new card artwork queued");
    assert.equal(getImageLoadBudgetSnapshot().queuedHigh, 1);
    setArtworkSuppressed(false);
    assert.ok(await pending);
  } finally {
    setArtworkSuppressed(false);
    pendingRelease.current?.();
    for (const release of releases) release();
  }
  assert.equal(getImageLoadBudgetSnapshot().active, 0);
});

test("closing a viewer refills every available visible-artwork slot", { timeout: 2_000 }, async () => {
  const releases: Array<() => void> = [];
  const controllers: AbortController[] = [];
  try {
    const max = getImageLoadBudgetSnapshot().max;
    for (let i = 0; i < max; i++) releases.push((await acquireImageSlot({ priority: "high" }))!);
    setArtworkSuppressed(true);
    const pending = Array.from({ length: max }, () => {
      const controller = new AbortController(); controllers.push(controller);
      return acquireImageSlot({ priority: "high", signal: controller.signal }).then(release => { if (release) releases.push(release); return release; });
    });
    releases.splice(0).forEach(release => release());
    await Promise.resolve(); await Promise.resolve();
    assert.equal(getImageLoadBudgetSnapshot().active, 0);
    setArtworkSuppressed(false);
    await Promise.resolve(); await Promise.resolve();
    assert.equal(getImageLoadBudgetSnapshot().active, max, "resume must not serialize the entire artwork queue through one slot");
    assert.equal(getImageLoadBudgetSnapshot().queuedHigh, 0);
    await Promise.all(pending);
  } finally {
    controllers.forEach(controller => controller.abort());
    setArtworkSuppressed(false);
    releases.forEach(release => release());
  }
});

test('unfinished card leases revoke on preview open and refill together without marking loads failed', () => {
  const count = getImageLoadBudgetSnapshot().max, events: boolean[][] = [], cancel: Array<() => void> = [];
  try {
    for (let index = 0; index < count; index++) {
      events.push([]); cancel.push(watchImageSlot({ priority: 'high' }, allowed => events[index].push(allowed)));
    }
    assert.equal(getImageLoadBudgetSnapshot().active, count);
    setArtworkSuppressed(true);
    assert.equal(getImageLoadBudgetSnapshot().active, 0);
    assert.equal(getImageLoadBudgetSnapshot().queuedHigh, count);
    assert.ok(events.every(row => String(row) === 'true,false'));
    setArtworkSuppressed(false);
    assert.equal(getImageLoadBudgetSnapshot().active, count);
    assert.equal(getImageLoadBudgetSnapshot().queuedHigh, 0);
    assert.ok(events.every(row => String(row) === 'true,false,true'));
  } finally { cancel.forEach(stop => stop()); setArtworkSuppressed(false); }
  assert.equal(getImageLoadBudgetSnapshot().active, 0);
});

test('unmount, abort and completion cannot resume cancelled card leases or retain callbacks', () => {
  const controller = new AbortController(), events: boolean[] = [];
  const stop = watchImageSlot({ priority: 'high', signal: controller.signal }, allowed => events.push(allowed));
  setArtworkSuppressed(true);
  controller.abort(); stop(); stop();
  setArtworkSuppressed(false);
  assert.deepEqual(events, [true, false]);
  assert.equal(getImageLoadBudgetSnapshot().queuedHigh, 0);
  assert.equal(getImageLoadBudgetSnapshot().active, 0);
  const completed: boolean[] = [], complete = watchImageSlot({ priority: 'high' }, allowed => completed.push(allowed));
  complete(); setArtworkSuppressed(true); setArtworkSuppressed(false);
  assert.deepEqual(completed, [true, false]);
});

test('even visible images yield behind foreground input without cancelling healthy URLs', { timeout: 2_000 }, async () => {
  const events: boolean[] = [];
  prioritizeInteraction();
  const stop = watchImageSlot({ priority: 'high' }, allowed => events.push(allowed));
  try {
    assert.deepEqual(events, []);
    assert.equal(getImageLoadBudgetSnapshot().active, 0);
    await new Promise(resolve => setTimeout(resolve, 300));
    assert.deepEqual(events, [true]);
  } finally { stop(); }
});

test('hidden and page-hidden cards release active admission and resume only when both gates allow it', async () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const surface = Object.assign(new EventTarget(), { visibilityState: 'visible' }), frame = new EventTarget();
  Object.defineProperty(globalThis, 'document', { configurable: true, value: surface });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: frame });
  // A fresh module has its own browser lifecycle owner, unlike the earlier
  // legacy visibility test's intentionally short-lived document fixture.
  const budget = await import(new URL('./image-load-budget.ts?lifecycle', import.meta.url).href);
  const events: boolean[] = [], stop = budget.watchImageSlot({ priority: 'high' }, (allowed: boolean) => events.push(allowed));
  const nearby: boolean[] = [], stopNearby = budget.watchImageSlot({ priority: 'low' }, (allowed: boolean) => nearby.push(allowed));
  try {
    surface.visibilityState = 'hidden'; surface.dispatchEvent(new Event('visibilitychange'));
    assert.equal(budget.getImageLoadBudgetSnapshot().active, 0);
    frame.dispatchEvent(new Event('pagehide'));
    surface.visibilityState = 'visible'; surface.dispatchEvent(new Event('visibilitychange'));
    assert.equal(budget.getImageLoadBudgetSnapshot().active, 0);
    frame.dispatchEvent(new Event('pageshow'));
    assert.deepEqual(events, [true, false, true]);
    assert.deepEqual(nearby, [true, false, true], 'a nearby card must resume without needing a new visibility observation');
    stop(); stopNearby(); assert.equal(budget.getImageLoadBudgetSnapshot().queued, 0);
  } finally {
    stop(); stopNearby();
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument); else Reflect.deleteProperty(globalThis, 'document');
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else Reflect.deleteProperty(globalThis, 'window');
  }
});
