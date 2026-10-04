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
  const surface = Object.assign(new EventTarget(), { setTimeout: (fn: () => void) => { tick = fn; return 1; }, clearTimeout: () => {} });
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

test('activity uses one idle deadline and sleeps completely while hidden', () => {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const savedNow = Date.now;
  let now = 1_000, tick = () => {}, delay = 0, timers = 0, cleaned = 0;
  const page = Object.assign(new EventTarget(), { hidden: false });
  const surface = Object.assign(new EventTarget(), {
    setTimeout(fn: () => void, ms: number) { tick = fn; delay = ms; timers++; return 1; },
    clearTimeout() { timers = 0; },
  });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: surface });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: page });
  Date.now = () => now;
  try {
    const stop = trackSessionActivity(() => cleaned++);
    assert.equal(delay, SESSION_IDLE_MS); assert.equal(timers, 1);
    now += 60_000;
    for (let i = 0; i < 100; i++) surface.dispatchEvent(new Event('wheel'));
    assert.equal(timers, 1, 'input bursts do not churn deadline timers');
    now = 1_000 + SESSION_IDLE_MS; tick();
    assert.equal(delay, 60_000); assert.equal(cleaned, 0);
    page.hidden = true; page.dispatchEvent(new Event('visibilitychange'));
    assert.equal(timers, 0); assert.equal(cleaned, 1);
    page.hidden = false; page.dispatchEvent(new Event('visibilitychange'));
    assert.equal(delay, SESSION_IDLE_MS); assert.equal(timers, 1);
    stop(); assert.equal(timers, 0);
  } finally {
    Date.now = savedNow;
    if (savedWindow) Object.defineProperty(globalThis, 'window', savedWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (savedDocument) Object.defineProperty(globalThis, 'document', savedDocument); else Reflect.deleteProperty(globalThis, 'document');
  }
});
