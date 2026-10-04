import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPeriodicScheduler } from './periodic-scheduler.ts';

function harness() {
  let now = 0, phase: 'active' | 'idle' | 'hidden' = 'active', leaseUntil = 0, available = true, serial = 0;
  const timers = new Map<number, { at: number; run: () => void }>();
  const scheduler = createPeriodicScheduler({ now: () => now, phase: () => phase,
    inputDelay: () => Math.max(0, leaseUntil - now), available: () => available,
    setTimer: (run, delay) => { const id = ++serial; timers.set(id, { at: now + delay, run }); assert.ok(timers.size <= 1); return id; },
    clearTimer: id => { timers.delete(id as number); } });
  return { scheduler, timers, setPhase(next: typeof phase) { phase = next; scheduler.wake(); },
    lease(ms: number) { leaseUntil = now + ms; scheduler.wake(); },
    suspend(value: boolean) { available = !value; scheduler.wake(); },
    advance(ms: number) {
      const end = now + ms;
      let turns = 0;
      while (timers.size) {
        const [id, timer] = [...timers][0]!;
        if (timer.at > end) break;
        assert.ok(++turns < 10_000, 'no busy loop');
        now = timer.at; timers.delete(id); timer.run();
      }
      now = end;
    },
  };
}

test('a hundred jobs share one timer and release every owner on cancellation', () => {
  const h = harness(); let calls = 0;
  const handles = Array.from({ length: 100 }, (_, i) => h.scheduler.register({ name: String(i), everyMs: 100 + i, work: () => calls++ }));
  assert.equal(h.timers.size, 1); h.advance(199); assert.equal(calls, 100);
  handles.forEach(handle => handle.cancel());
  assert.deepEqual(h.scheduler.snapshot(), { tasks: 0, running: 0, paused: 0, timerCount: 0, callbacks: 100 });
  assert.equal(h.timers.size, 0);
});

test('hidden/idle cosmetic jobs sleep without timers or accumulated ticks', () => {
  const h = harness(); let calls = 0;
  h.scheduler.register({ name: 'discovery', everyMs: 10, work: () => calls++ });
  h.setPhase('hidden'); assert.equal(h.timers.size, 0); h.advance(1_000_000); assert.equal(calls, 0);
  h.setPhase('active'); h.advance(0); assert.equal(calls, 1);
  h.advance(9); assert.equal(calls, 1);
  h.setPhase('idle'); assert.equal(h.timers.size, 0);
});

test('visible idle archives keep their pacing while hidden tabs hold them', () => {
  const h = harness(); let calls = 0;
  h.scheduler.register({ name: 'archive', mode: 'visible', everyMs: 10, work: () => calls++ });
  h.setPhase('idle'); h.advance(30); assert.equal(calls, 3);
  h.setPhase('hidden'); h.advance(100); assert.equal(calls, 3); assert.equal(h.timers.size, 0);
  h.setPhase('idle'); h.advance(0); assert.equal(calls, 4);
});

test('room clocks keep running while hidden and honor page teardown', () => {
  const h = harness(); let calls = 0;
  h.scheduler.register({ name: 'room', mode: 'always', background: false, everyMs: 10, work: () => calls++ });
  h.setPhase('hidden'); h.lease(1_000); h.advance(30); assert.equal(calls, 3);
  h.suspend(true); h.advance(1_000); assert.equal(calls, 3); assert.equal(h.timers.size, 0);
  h.suspend(false); h.advance(0); assert.equal(calls, 4);
});

test('input defers due work until the lease expires without a new user event', () => {
  const h = harness(); let calls = 0;
  h.scheduler.register({ name: 'pull', everyMs: 10, firstMs: 0, work: () => calls++ });
  h.lease(240); h.advance(239); assert.equal(calls, 0);
  h.advance(1); assert.equal(calls, 1);
  h.lease(240); h.advance(239); assert.equal(calls, 1);
  h.advance(1); assert.equal(calls, 2);
});

test('settings and playback gates stop timers then wake one due turn', () => {
  const h = harness(); let allowed = false, calls = 0;
  const task = h.scheduler.register({ name: 'pull', everyMs: 10, enabled: () => allowed, work: () => calls++ });
  h.advance(1_000); assert.equal(h.timers.size, 0);
  allowed = true; task.wake(); h.advance(0); assert.equal(calls, 1);
  allowed = false; h.scheduler.wake(); assert.equal(h.timers.size, 0);
  task.cancel(); allowed = true; task.wake(); h.scheduler.wake(); h.advance(1_000); assert.equal(calls, 1);
});

test('slow async requests never overlap or queue missed ticks', async () => {
  const h = harness(); let calls = 0, complete!: () => void;
  const task = h.scheduler.register({ name: 'slow pull', everyMs: 10, firstMs: 0, work: () => { calls++; return new Promise<void>(resolve => { complete = resolve; }); } });
  h.advance(1_000); task.wake(); h.advance(1_000);
  assert.equal(calls, 1); assert.equal(h.timers.size, 0); assert.equal(h.scheduler.snapshot().running, 1);
  complete(); await Promise.resolve(); h.advance(9); assert.equal(calls, 1);
  h.advance(1); assert.equal(calls, 2); task.cancel(); complete(); await Promise.resolve();
  assert.equal(h.timers.size, 0); assert.equal(h.scheduler.snapshot().tasks, 0);
});

test('cancel aborts a running owner and ignores its late rejection', async () => {
  const h = harness(); let signal!: AbortSignal, reject!: (error: Error) => void, errors = 0;
  const task = h.scheduler.register({ name: 'cancelled', everyMs: 10, firstMs: 0,
    work: current => { signal = current; return new Promise((_, fail) => { reject = fail; }); }, onError: () => errors++ });
  h.advance(0); task.cancel(); assert.equal(signal.aborted, true);
  reject(new Error('late')); await Promise.resolve();
  assert.equal(errors, 0); assert.equal(h.scheduler.snapshot().running, 0); assert.equal(h.timers.size, 0);
});

test('failed jobs release their slot so later turns and other jobs still run', async () => {
  const h = harness(); let errors = 0, healthy = 0;
  h.scheduler.register({ name: 'fail', everyMs: 10, firstMs: 0, work: () => Promise.reject(new Error('offline')), onError: () => { errors++; throw new Error('bad reporter'); } });
  h.scheduler.register({ name: 'healthy', everyMs: 10, firstMs: 0, work: () => healthy++ });
  h.advance(0); await Promise.resolve(); assert.equal(healthy, 1); assert.equal(errors, 1);
  h.advance(10); await Promise.resolve(); assert.equal(healthy, 2); assert.equal(errors, 2);
});

test('synchronous failures and self-cancellation cannot strand the timer', () => {
  const h = harness(); let calls = 0, errors = 0;
  h.scheduler.register({ name: 'throw', everyMs: 10, firstMs: 0, work: () => { throw new Error('oops'); }, onError: () => errors++ });
  const task = h.scheduler.register({ name: 'one shot', everyMs: 10, firstMs: 0, work: () => { calls++; task.cancel(); } });
  h.advance(30); assert.equal(calls, 1); assert.equal(errors, 4); assert.equal(h.scheduler.snapshot().tasks, 1);
});

test('invalid intervals fail before registering a timer', () => {
  const h = harness();
  for (const everyMs of [0, -1, NaN, Infinity]) assert.throws(() => h.scheduler.register({ name: 'invalid', everyMs, work() {} }));
  assert.equal(h.scheduler.snapshot().tasks, 0); assert.equal(h.timers.size, 0);
});
