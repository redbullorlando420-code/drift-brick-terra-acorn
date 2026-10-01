import test from 'node:test';
import assert from 'node:assert/strict';
import { createThumbnailQueue } from './thumbnail-queue.ts';

const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
function fixture(workers = 2) {
  let delay = Infinity, watching = 0, clock = 0;
  const timers = new Map<number, () => void>();
  const queue = createThumbnailQueue({ workers: () => workers, delay: () => delay,
    subscribe: () => { watching++; return () => { watching--; }; },
    setTimer: wake => { const id = ++clock; timers.set(id, wake); return id; },
    clearTimer: timer => { timers.delete(timer as number); },
  });
  return { queue, timers, watching: () => watching, gate: (next: number) => { delay = next; queue.wake(); } };
}

test('a paused thumbnail queue is bounded, holds no wake timers, and shares one input timer', () => {
  const f = fixture();
  for (let i = 0; i < 1000; i++) f.queue.enqueue(String(i), async () => {});
  assert.deepEqual(f.queue.snapshot(), { active: 0, queued: 96, jobs: 96, timers: 0 });
  assert.equal(f.watching(), 1);
  f.gate(80);
  for (let i = 0; i < 96; i++) f.queue.wake();
  assert.equal(f.timers.size, 1, 'queued cards do not each poll input availability');
  f.gate(Infinity);
  assert.equal(f.timers.size, 0, 'viewer and hidden pauses are event-driven');
  f.queue.clear();
  assert.deepEqual(f.queue.snapshot(), { active: 0, queued: 0, jobs: 0, timers: 0 });
  assert.equal(f.watching(), 0);
});

test('viewer pauses abort running decoders and resume live cards without treating the pause as failure', async () => {
  const f = fixture();
  const starts: string[] = [], committed: string[] = [];
  const finish = new Map<string, () => void>();
  const work = (id: string) => async (signal: AbortSignal) => {
    starts.push(id);
    await new Promise<void>(resolve => { finish.set(id, resolve); signal.addEventListener('abort', () => resolve(), { once: true }); });
    if (!signal.aborted) committed.push(id);
  };
  const cancelA = f.queue.enqueue('a', work('a'));
  f.queue.enqueue('b', work('b'));
  f.gate(0); await flush();
  assert.deepEqual(starts, ['a', 'b']);
  f.gate(Infinity); await flush();
  assert.deepEqual(committed, []);
  assert.deepEqual(f.queue.snapshot(), { active: 0, queued: 2, jobs: 2, timers: 0 });
  cancelA();
  f.gate(0); await flush();
  assert.deepEqual(starts, ['a', 'b', 'b'], 'only still-mounted consumers resume');
  finish.get('b')!(); await flush();
  assert.deepEqual(committed, ['b']);
  assert.equal(f.queue.snapshot().jobs, 0);
  assert.equal(f.watching(), 0);
});

test('visible cards go ahead of nearby cards and duplicate cards share the same job', async () => {
  const f = fixture();
  const starts: string[] = [], finish = new Map<string, () => void>();
  const work = (id: string) => async () => { starts.push(id); await new Promise<void>(resolve => finish.set(id, resolve)); };
  f.queue.enqueue('near', work('near'));
  const first = f.queue.enqueue('visible', work('visible'), 'high');
  const duplicate = f.queue.enqueue('visible', work('duplicate'), 'high');
  f.queue.enqueue('visible-two', work('visible-two'), 'high');
  assert.equal(f.queue.snapshot().jobs, 3);
  first();
  f.gate(0); await flush();
  assert.deepEqual(starts, ['visible', 'visible-two']);
  finish.get('visible')!(); await flush();
  assert.deepEqual(starts, ['visible', 'visible-two', 'near']);
  duplicate();
  finish.get('near')!(); finish.get('visible-two')!(); await flush();
  assert.equal(f.queue.snapshot().active, 0);
  assert.equal(f.queue.snapshot().jobs, 0);
});

test('rapid pause/resume waits for decoder cleanup before granting replacement workers', async () => {
  const f = fixture(1);
  let runs = 0;
  const finishes: Array<() => void> = [];
  f.queue.enqueue('a', async () => { runs++; await new Promise<void>(resolve => finishes.push(resolve)); });
  f.gate(0); await flush();
  f.gate(Infinity); f.gate(0); await flush();
  assert.equal(runs, 1);
  assert.equal(f.queue.snapshot().active, 1);
  finishes[0](); await flush();
  assert.equal(runs, 2);
  f.queue.clear(); finishes[1](); await flush();
  assert.deepEqual(f.queue.snapshot(), { active: 0, queued: 0, jobs: 0, timers: 0 });
});

test('a cancelled card cannot erase a fresh request with the same video ID', async () => {
  const f = fixture(1);
  let finishOld = () => {}, freshStarted = false;
  const cancel = f.queue.enqueue('same', async () => { await new Promise<void>(resolve => { finishOld = resolve; }); });
  f.gate(0); await flush();
  cancel();
  f.queue.enqueue('same', async () => { freshStarted = true; });
  finishOld(); await flush();
  assert.equal(freshStarted, true);
  assert.equal(f.queue.snapshot().jobs, 0);
  f.queue.dispose();
  f.queue.enqueue('ignored', async () => { throw new Error('disposed queue ran'); });
  assert.equal(f.queue.snapshot().jobs, 0);
});
