import test from 'node:test';
import assert from 'node:assert/strict';
import { createSettledInput } from './settled-input.ts';

function runtime() {
  let now = 0, next = 0;
  const timers = new Map<number, { work: () => void; at: number }>();
  return { timers, now: () => now, setTimer(work: () => void, delay: number) {
    const id = ++next; timers.set(id, { work, at: now + delay }); return id;
  }, clearTimer(timer: unknown) { timers.delete(timer as number); }, advance(to: number) {
    now = to;
    for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.work(); }
  } };
}

test('catalog bursts keep one latest snapshot and publish after quiet time', () => {
  const clock = runtime(), published: object[] = [];
  const input = createSettledInput<object>(value => published.push(value), clock);
  const first = {}, latest = {};
  input.push(first);
  const staleCallback = [...clock.timers.values()][0].work;
  clock.advance(200); input.push(latest);
  staleCallback();
  assert.deepEqual(published, []);
  assert.equal(clock.timers.size, 1);
  clock.advance(549); assert.equal(published.length, 0);
  clock.advance(550); assert.deepEqual(published, [latest]);
  assert.equal(clock.timers.size, 0);
});

test('continuous enrichment cannot starve ranking past its maximum wait', () => {
  const clock = runtime(), published: number[] = [];
  const input = createSettledInput<number>(value => published.push(value), clock);
  input.push(0);
  for (let at = 200; at <= 1400; at += 200) { clock.advance(at); input.push(at); }
  clock.advance(1499); assert.deepEqual(published, []);
  clock.advance(1500); assert.deepEqual(published, [1400]);
  input.push(1500); clock.advance(1850);
  assert.deepEqual(published, [1400, 1500]);
});

test('leaving a page discards pending inputs even if a canceled callback fires', () => {
  const clock = runtime(), published: number[] = [];
  const input = createSettledInput<number>(value => published.push(value), clock);
  input.push(1); const staleCallback = [...clock.timers.values()][0].work;
  input.cancel(); input.cancel(); staleCallback(); clock.advance(2000);
  assert.equal(clock.timers.size, 0); assert.deepEqual(published, []);
  input.push(2); clock.advance(2350); assert.deepEqual(published, [2]);
});
