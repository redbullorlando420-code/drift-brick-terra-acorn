import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeferredEvents } from './deferred-events.ts';

function fixture(limit = 64) {
  let next = 0;
  const tasks = new Map<number, () => void>(), consumed: string[] = [];
  const events = createDeferredEvents<string>(value => consumed.push(value), work => {
    const id = ++next; tasks.set(id, work); return () => { tasks.delete(id); };
  }, limit);
  return { tasks, consumed, events };
}
test('play events wait for the scheduler and preserve rapid player changes in order', () => {
  const { events, tasks, consumed } = fixture();
  events.push('first'); events.push('second'); events.push('third');
  assert.equal(tasks.size, 1); assert.deepEqual(consumed, []);
  [...tasks.values()][0]();
  assert.deepEqual(consumed, ['first', 'second', 'third']); assert.equal(events.size(), 0); assert.equal(tasks.size, 0);
});
test('hide/unload flushes user events exactly once and explicit clearing cannot resurrect history', () => {
  const { events, tasks, consumed } = fixture();
  events.push('before-hide'); const stale = [...tasks.values()][0];
  events.flush(); stale(); assert.deepEqual(consumed, ['before-hide']);
  events.push('before-clear'); const canceled = [...tasks.values()][0]; events.clear(); canceled();
  assert.deepEqual(consumed, ['before-hide']); assert.equal(events.size(), 0); assert.equal(tasks.size, 0);
});
test('the queue remains bounded without dropping user events', () => {
  const { events, tasks, consumed } = fixture(3);
  for (let i = 0; i < 100; i++) { events.push(String(i)); assert.ok(events.size() < 3); assert.ok(tasks.size <= 1); }
  events.flush(); assert.equal(consumed.length, 100);
  assert.deepEqual(consumed, Array.from({ length: 100 }, (_, i) => String(i)));
});
