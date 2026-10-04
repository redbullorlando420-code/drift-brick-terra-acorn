import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdleQueue, type IdleStep } from './idle-queue.ts';

function fixture() {
  let available = true, wake: ((interrupt?: boolean) => void) | undefined, owners = 0;
  const turns: Array<() => void> = [];
  const queue = createIdleQueue({ allowed: () => available,
    subscribe(listener) { owners++; wake = listener; return () => { owners--; wake = undefined; }; },
    turn: signal => new Promise<void>((resolve, reject) => {
      const run = () => { signal.removeEventListener('abort', abort); resolve(); };
      const abort = () => { const index = turns.indexOf(run); if (index >= 0) turns.splice(index, 1); reject(signal.reason); };
      turns.push(run); signal.addEventListener('abort', abort, { once: true });
    }),
  });
  const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
  return { queue, turns, flush, owners: () => owners, setAvailable(value: boolean) { available = value; wake?.(true); }, interrupt: () => wake?.(true),
    async tick() { turns.shift()?.(); await flush(); } };
}
const progress = (scanned: number) => ({ scanned, total: 3, changed: scanned, batches: scanned });
test('one shared owner coalesces duplicate jobs and interleaves completed batches fairly', async () => {
  const f = fixture(), calls: string[] = [];
  let a = 0;
  const first = f.queue.enqueue('a', 'A', async () => { calls.push('a'); a++; return a === 2 ? { done: true, result: a, progress: progress(a) } : { done: false, progress: progress(a) }; });
  assert.equal(f.queue.enqueue('a', 'duplicate', async () => { throw Error('duplicate ran'); }), first);
  const second = f.queue.enqueue('b', 'B', async () => { calls.push('b'); return { done: true, result: 1, progress: progress(1) }; });
  assert.equal(f.turns.length, 1); assert.equal(f.owners(), 1);
  await f.tick(); await f.tick(); await f.tick();
  assert.deepEqual(calls, ['a', 'b', 'a']); assert.deepEqual(await Promise.all([first, second]), [2, 1]);
  assert.equal(f.owners(), 0); assert.equal(f.turns.length, 0); assert.equal(f.queue.getSnapshot().jobs.length, 0);
});
test('hidden/viewer/input/pause interruption drops unfinished work and resumes the last saved cursor', async () => {
  const f = fixture(); let committed = 0, attempts = 0;
  const promise = f.queue.enqueue('repair', 'Repair', async (signal, turn) => {
    attempts++; await turn(); signal.throwIfAborted(); committed++;
    return { done: true, result: committed, progress: progress(committed) };
  });
  await f.tick(); f.setAvailable(false); await f.flush();
  assert.equal(committed, 0); assert.equal(f.turns.length, 0); assert.equal(f.queue.getSnapshot().state, 'waiting');
  f.setAvailable(true); await f.tick(); f.interrupt(); await f.flush(); assert.equal(committed, 0);
  f.queue.setPaused(true); await f.flush(); assert.equal(f.turns.length, 0);
  f.queue.setPaused(false); await f.tick(); await f.tick();
  assert.equal(await promise, 1); assert.equal(attempts, 3); assert.equal(f.owners(), 0);
});
test('canceling or disposing owners rejects work, releases gates, and ignores a late noncooperative result', async () => {
  const f = fixture(); let finish!: (value: IdleStep<number>) => void;
  const pending = f.queue.enqueue<number>('slow', 'Slow', async () => await new Promise<IdleStep<number>>(resolve => { finish = resolve; }));
  const rejection = assert.rejects(pending, { name: 'AbortError' });
  await f.tick(); f.queue.cancel('slow'); finish({ done: true, result: 7, progress: progress(1) }); await f.flush(); await rejection;
  assert.equal(f.queue.getSnapshot().jobs.length, 0); assert.equal(f.owners(), 0);
  const next = f.queue.enqueue('next', 'Next', async () => ({ done: true, result: 1, progress: progress(1) }));
  const rejected = assert.rejects(next, { name: 'AbortError' }); f.queue.dispose(); await f.flush(); await rejected;
  assert.equal(f.turns.length, 0); assert.equal(f.owners(), 0);
});
test('save failures report a retryable error and do not keep an active queue owner', async () => {
  const f = fixture(); const pending = f.queue.enqueue('save', 'Save', async () => { throw Error('Storage full'); });
  const rejected = assert.rejects(pending, /Storage full/); await f.tick(); await rejected;
  assert.equal(f.queue.getSnapshot().state, 'error'); assert.equal(f.owners(), 0);
  const retry = f.queue.enqueue('save', 'Save', async () => ({ done: true, result: 2, progress: progress(2) }));
  await f.tick(); assert.equal(await retry, 2); assert.equal(f.queue.getSnapshot().state, 'ready');
});
