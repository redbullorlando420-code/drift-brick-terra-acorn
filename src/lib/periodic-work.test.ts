import { test } from 'node:test';
import assert from 'node:assert/strict';

test('browser lifecycle releases listeners/timers and resumes one missed turn per owner', async () => {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const page = Object.assign(new EventTarget(), { hidden: false });
  const listeners = new Set<string>();
  let timer: (() => void) | null = null, calls = 0, nextId = 0;
  const surface = Object.assign(new EventTarget(), {
    setTimeout(fn: () => void) { timer = fn; return ++nextId; },
    clearTimeout() { timer = null; },
  });
  const add = surface.addEventListener.bind(surface), remove = surface.removeEventListener.bind(surface);
  surface.addEventListener = (type, listener, options) => { listeners.add(type); add(type, listener, options); };
  surface.removeEventListener = (type, listener, options) => { listeners.delete(type); remove(type, listener, options); };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: surface });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: page });
  try {
    const { registerPeriodicTask, getPeriodicWorkSnapshot } = await import('./periodic-work.ts');
    assert.throws(() => registerPeriodicTask({ name: 'invalid', everyMs: 0, work() {} }));
    assert.equal(listeners.size, 0);
    const task = registerPeriodicTask({ name: 'page task', everyMs: 10, firstMs: 0, work: () => calls++ });
    assert.equal(listeners.size, 3); assert.equal(getPeriodicWorkSnapshot().timerCount, 1);
    page.hidden = true; page.dispatchEvent(new Event('visibilitychange'));
    assert.equal(timer, null); assert.equal(getPeriodicWorkSnapshot().paused, 1);
    page.hidden = false; page.dispatchEvent(new Event('visibilitychange'));
    assert.ok(timer); (timer as () => void)(); assert.equal(calls, 1);
    surface.dispatchEvent(new Event('pagehide')); assert.equal(timer, null);
    surface.dispatchEvent(new Event('pageshow')); assert.ok(timer);
    task.cancel(); task.cancel(); assert.equal(timer, null); assert.equal(listeners.size, 0);
    page.dispatchEvent(new Event('visibilitychange')); surface.dispatchEvent(new Event('online'));
    assert.equal(getPeriodicWorkSnapshot().tasks, 0);
    const next = registerPeriodicTask({ name: 'new owner', everyMs: 10, work() {} });
    assert.equal(listeners.size, 3); next.cancel(); assert.equal(listeners.size, 0);
  } finally {
    if (savedWindow) Object.defineProperty(globalThis, 'window', savedWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (savedDocument) Object.defineProperty(globalThis, 'document', savedDocument); else Reflect.deleteProperty(globalThis, 'document');
  }
});
