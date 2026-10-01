import { test } from "node:test";
import assert from "node:assert/strict";
import { sessionIsActive, SESSION_IDLE_MS, trackSessionActivity, allowAutomaticRefresh, allowCardArtwork, getSessionPhase, subscribeSessionPhase } from "./session-activity.ts";

test("automatic work pauses at the inactivity threshold and while hidden", () => {
  assert.equal(sessionIsActive(1000, 1000 + SESSION_IDLE_MS - 1), true);
  assert.equal(sessionIsActive(1000, 1000 + SESSION_IDLE_MS), false);
  assert.equal(sessionIsActive(1000, 1001, false), false);
});
test("idle cleanup happens once and real input resumes automatic work", () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const previousNow = Date.now;
  let now = 1000, tick = () => {}, cleaned = 0, resumed = 0;
  const phases: string[] = [];
  const unsubscribe = subscribeSessionPhase(() => phases.push(getSessionPhase()));
  const page = Object.assign(new EventTarget(), { hidden: false });
  const surface = Object.assign(new EventTarget(), { setInterval: (fn: () => void) => { tick = fn; return 1; }, clearInterval: () => {} });
  Object.defineProperty(globalThis, "window", { configurable: true, value: surface });
  Object.defineProperty(globalThis, "document", { configurable: true, value: page });
  Date.now = () => now;
  try {
    const stop = trackSessionActivity(() => cleaned++, () => resumed++);
    assert.equal(allowAutomaticRefresh(), true);
    now += SESSION_IDLE_MS;
    tick(); tick();
    assert.equal(cleaned, 1); assert.equal(allowAutomaticRefresh(), false);
    assert.equal(getSessionPhase(), "idle");
    surface.dispatchEvent(new Event("pointerdown"));
    assert.equal(resumed, 1); assert.equal(allowAutomaticRefresh(), true);
    page.hidden = true; page.dispatchEvent(new Event("visibilitychange"));
    assert.equal(cleaned, 2); assert.equal(allowAutomaticRefresh(), false);
    surface.dispatchEvent(new Event("keydown")); tick();
    assert.equal(cleaned, 2); assert.equal(getSessionPhase(), "hidden");
    page.hidden = false; page.dispatchEvent(new Event("visibilitychange"));
    assert.equal(resumed, 2); assert.equal(getSessionPhase(), "active");
    stop();
    surface.dispatchEvent(new Event("keydown"));
    assert.equal(resumed, 2);
    assert.deepEqual(phases, ["idle", "active", "hidden", "active"]);
  } finally {
    unsubscribe();
    Date.now = previousNow;
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow); else Reflect.deleteProperty(globalThis, "window");
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument); else Reflect.deleteProperty(globalThis, "document");
  }
});

test("card artwork releases offscreen and hidden surfaces while keeping visible idle posters", () => {
  assert.equal(allowCardArtwork("active", false, false), false);
  assert.equal(allowCardArtwork("active", true, false), true);
  assert.equal(allowCardArtwork("idle", true, false), false);
  assert.equal(allowCardArtwork("idle", true, true), true);
  assert.equal(allowCardArtwork("hidden", true, true), false);
});
