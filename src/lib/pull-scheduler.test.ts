import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { createPullScheduler } from './pull-scheduler.ts';

test('cancel aborts active transport and frees its slot even if transport never settles', async () => {
  const scheduler = createPullScheduler(() => ({ concurrency: 1, gapMs: 0 }), () => true);
  let signal!: AbortSignal;
  const first = scheduler.run(input => { signal = input; return new Promise<number>(() => {}); });
  const rejected = assert.rejects(first, /cancelled/);
  await setImmediate(); scheduler.cancel(); await rejected;
  assert.equal(signal.aborted, true);
  await setImmediate(); assert.equal(scheduler.snapshot().active, 0);
  assert.equal(await scheduler.run(async () => 7), 7);
});

test('paused queue and held responses use gate wakeups and remain bounded', async () => {
  let available = false, calls = 0;
  const scheduler = createPullScheduler(() => ({ concurrency: 1, gapMs: 0 }), () => available, 2);
  const first = scheduler.run(async () => { calls++; available = false; return 42; });
  const second = scheduler.run(async () => { calls++; return 24; });
  await assert.rejects(scheduler.run(async () => 0), /queue is full/);
  assert.equal(calls, 0);
  available = true; scheduler.wake(); await setImmediate();
  assert.equal(calls, 1); assert.equal(scheduler.snapshot().held, true);
  available = true; scheduler.wake(); assert.equal(await first, 42); assert.equal(await second, 24);
});

test('cancel releases a completed response held behind pause', async () => {
  let available = true;
  const scheduler = createPullScheduler(() => ({ concurrency: 1, gapMs: 0 }), () => available);
  const job = scheduler.run(async () => { available = false; return new Uint8Array(1024); });
  const rejected = assert.rejects(job, /cancelled/);
  await setImmediate(); scheduler.cancel(); await rejected;
  await setImmediate(); assert.equal(scheduler.snapshot().active, 0);
});

test('request deadline releases stalled slot and permits a retry', async () => {
  const scheduler = createPullScheduler(() => ({ concurrency: 1, gapMs: 0 }), () => true, 8, { requestTimeoutMs: 15 });
  await assert.rejects(scheduler.run(() => new Promise(() => {})), /timed out/);
  assert.equal(await scheduler.run(async () => 1), 1);
});

test('concurrency and request gap apply across independent providers', async () => {
  const starts: number[] = [];
  let active = 0, peak = 0;
  const scheduler = createPullScheduler(() => ({ concurrency: 2, gapMs: 20 }), () => true);
  await Promise.all(Array.from({ length: 4 }, () => scheduler.run(async () => {
    starts.push(Date.now()); peak = Math.max(peak, ++active);
    await new Promise(resolve => setTimeout(resolve, 45)); active--; return 1;
  })));
  assert.ok(peak <= 2); for (let i = 1; i < starts.length; i++) assert.ok(starts[i] - starts[i - 1] >= 19);
});
