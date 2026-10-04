import test from 'node:test';
import assert from 'node:assert/strict';
import { createKeyedSignal } from './keyed-signal.ts';

test('a rating updates all mounted copies of its title and no unrelated titles', () => {
  const signal = createKeyedSignal(); const calls = [0, 0, 0];
  const stops = [signal.subscribe('same', () => calls[0]++), signal.subscribe('same', () => calls[1]++), signal.subscribe('other', () => calls[2]++)];
  signal.emit('same'); assert.deepEqual(calls, [1, 1, 0]);
  stops[0](); signal.emit('same'); assert.deepEqual(calls, [1, 2, 0]);
  signal.emitAll(); assert.deepEqual(calls, [1, 3, 1]); stops.forEach(stop => stop()); assert.equal(signal.size(), 0);
});
test('10,000 recycled virtual cards and ratings to unmounted IDs leave no subscription history', () => {
  const signal = createKeyedSignal();
  for (let i = 0; i < 10_000; i++) { const stop = signal.subscribe(String(i), () => {}); signal.emit(String(i)); stop(); signal.emit(String(i)); }
  assert.equal(signal.size(), 0);
});
test('an old cleanup cannot remove a newly mounted subscriber for the same ID', () => {
  const signal = createKeyedSignal(); const old = signal.subscribe('same', () => {}); old();
  let calls = 0; const next = signal.subscribe('same', () => calls++); old(); signal.emit('same'); assert.equal(calls, 1); next();
});
