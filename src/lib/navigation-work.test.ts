import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleNavigationWork, yieldNavigationTask } from './navigation-work.ts';

test('route work crosses a painted frame, runs outside RAF, sleeps hidden and cancels cleanly', () => {
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  let serial = 0, visibilityState = 'visible', calls = 0;
  const frames = new Map<number, () => void>(), timers = new Map<number, () => void>(), listeners = new Set<() => void>();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    requestAnimationFrame(fn: () => void) { const id = ++serial; frames.set(id, fn); return id; },
    cancelAnimationFrame(id: number) { frames.delete(id); },
    setTimeout(fn: () => void) { const id = ++serial; timers.set(id, fn); return id; },
    clearTimeout(id: number) { timers.delete(id); },
  } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    get visibilityState() { return visibilityState; },
    addEventListener(_: string, fn: () => void) { listeners.add(fn); },
    removeEventListener(_: string, fn: () => void) { listeners.delete(fn); },
  } });
  const turn = (queue: Map<number, () => void>) => { const copy = [...queue.values()]; queue.clear(); for (const fn of copy) fn(); };
  const visibility = (value: string) => { visibilityState = value; for (const fn of listeners) fn(); };
  try {
    const cancel = scheduleNavigationWork(() => calls++);
    turn(frames); assert.equal(calls, 0); assert.equal(timers.size, 0);
    // The destination shell has a frame to paint here.
    turn(frames); assert.equal(calls, 0); assert.equal(timers.size, 1);
    turn(timers); assert.equal(calls, 1); assert.equal(listeners.size, 0); cancel();
    const cancelHidden = scheduleNavigationWork(() => calls++);
    turn(frames); visibility('hidden');
    assert.equal(frames.size, 0); assert.equal(timers.size, 0); assert.equal(calls, 1);
    visibility('visible'); turn(frames); turn(frames); turn(timers);
    assert.equal(calls, 2); cancelHidden();
    visibility('hidden');
    const cancelBeforeVisible = scheduleNavigationWork(() => calls++);
    assert.equal(frames.size, 0); cancelBeforeVisible(); visibility('visible');
    assert.equal(frames.size, 0); assert.equal(listeners.size, 0);
    const cancelAfterFrames = scheduleNavigationWork(() => calls++);
    turn(frames); turn(frames); cancelAfterFrames(); turn(timers);
    assert.equal(calls, 2); assert.equal(timers.size, 0); assert.equal(listeners.size, 0);
  } finally {
    if (savedWindow) Object.defineProperty(globalThis, 'window', savedWindow); else delete (globalThis as { window?: unknown }).window;
    if (savedDocument) Object.defineProperty(globalThis, 'document', savedDocument); else delete (globalThis as { document?: unknown }).document;
  }
});

test('running preparation sleeps hidden without polling and releases visibility listeners on cancel/resume', async () => {
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  let visibilityState = 'hidden', yielded = 0, completed = false;
  const listeners = new Set<() => void>();
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    get visibilityState() { return visibilityState; },
    addEventListener(_: string, fn: () => void) { listeners.add(fn); },
    removeEventListener(_: string, fn: () => void) { listeners.delete(fn); },
  } });
  try {
    const controller = new AbortController();
    const waiting = yieldNavigationTask(controller.signal, async () => { yielded++; }).then(() => { completed = true; });
    await Promise.resolve(); assert.equal(completed, false); assert.equal(yielded, 1); assert.equal(listeners.size, 1);
    visibilityState = 'visible'; for (const fn of listeners) fn(); await waiting;
    assert.equal(completed, true); assert.equal(listeners.size, 0);
    visibilityState = 'hidden';
    const cancelled = new AbortController(), promise = yieldNavigationTask(cancelled.signal, async () => {});
    await Promise.resolve(); cancelled.abort(); await assert.rejects(promise, { name: 'AbortError' });
    assert.equal(listeners.size, 0);
  } finally {
    if (savedDocument) Object.defineProperty(globalThis, 'document', savedDocument); else delete (globalThis as { document?: unknown }).document;
  }
});
