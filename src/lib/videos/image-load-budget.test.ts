import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acquireImageSlot,
  clearLowPriorityImageQueue,
  getImageLoadBudgetSnapshot,
  setArtworkSuppressed,
} from "./image-load-budget.ts";

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
