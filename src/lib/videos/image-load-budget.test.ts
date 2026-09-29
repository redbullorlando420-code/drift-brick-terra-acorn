import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acquireImageSlot,
  clearLowPriorityImageQueue,
  getImageLoadBudgetSnapshot,
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
    const releaseNear = await near;
    assert.ok(releaseNear);
    releaseNear();
  } finally {
    clearLowPriorityImageQueue();
    for (const release of releases) release();
  }
  assert.equal(getImageLoadBudgetSnapshot().active, 0);
});
