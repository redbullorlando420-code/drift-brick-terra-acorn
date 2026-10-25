import { test } from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { createPullControl, runPausablePull, setPullsPaused, setPullViewerOpen, subscribePullAvailability, catalogPullAvailable, setActivePullPage, automaticPullAvailable } from "./pull-control.ts";
import { createPeriodicScheduler } from './periodic-scheduler.ts';
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

test('a sleeping periodic pull wakes when the final viewer gate opens', () => {
  let timer: (() => void) | null = null, calls = 0;
  const scheduler = createPeriodicScheduler({ now: () => 1_000, phase: () => 'active', inputDelay: () => 0,
    setTimer: work => { timer = work; return 1; }, clearTimer: () => { timer = null; } });
  setPullsPaused(false); setPullViewerOpen(true);
  const task = scheduler.register({ name: 'pull', everyMs: 10, firstMs: 0,
    enabled: () => catalogPullAvailable(true), work: () => calls++ });
  const stopAvailability = subscribePullAvailability(task.wake);
  try {
    assert.equal(timer, null);
    // The UI store may publish close before the overlay updates this gate.
    scheduler.wake(); assert.equal(timer, null);
    setPullViewerOpen(false); assert.ok(timer); (timer as () => void)();
    assert.equal(calls, 1);
    setPullsPaused(true); assert.equal(timer, null);
    setPullsPaused(false); assert.ok(timer);
  } finally { task.cancel(); stopAvailability(); setPullViewerOpen(false); setPullsPaused(false); }
  assert.equal(timer, null);
});

test('Live holds automatic archives, explicit requests pass, and navigating wakes the matching provider', async () => {
  const { updatePullSettings } = await import('./pull-settings.ts');
  updatePullSettings({ requestGapMs: 0 });
  setPullsPaused(false); setActivePullPage('live');
  try {
    assert.equal(automaticPullAvailable('youtube'), false);
    let started = false;
    await assert.rejects(runPausablePull(async () => { started = true; return 'archive'; }, { automatic: true, provider: 'youtube' }), /deferred to the active page/);
    assert.equal(await runPausablePull(async () => 'manual'), 'manual'); assert.equal(started, false);
    assert.equal(await runPausablePull(async () => 'live', { live: true, provider: 'twitch' }), 'live');
    setActivePullPage('twitch'); assert.equal(started, false);
    setActivePullPage('youtube'); assert.equal(await runPausablePull(async () => 'archive', { automatic: true, provider: 'youtube' }), 'archive');
    assert.equal(automaticPullAvailable('twitch'), false);
  } finally { setActivePullPage(''); }
});
