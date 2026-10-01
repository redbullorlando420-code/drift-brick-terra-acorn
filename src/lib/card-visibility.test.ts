import test from 'node:test';
import assert from 'node:assert/strict';
import { createCardVisibilityTracker } from './card-visibility.ts';

function fixture() {
  const observers: Array<{ notify: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;
    elements: Set<Element>; disconnected: boolean; margin?: string }> = [];
  const tracker = createCardVisibilityTracker((notify, options) => {
    const row = { notify, elements: new Set<Element>(), disconnected: false, margin: options?.rootMargin };
    observers.push(row);
    return { observe: element => { row.elements.add(element); }, unobserve: element => { row.elements.delete(element); },
      disconnect: () => { row.disconnected = true; row.elements.clear(); } };
  });
  return { tracker, observers };
}

test('1,000 cards share two observers and release every DOM reference after unmount', () => {
  const { tracker, observers } = fixture();
  const elements = Array.from({ length: 1000 }, () => ({} as Element));
  const off = elements.map(element => tracker.observe(element, () => {}));
  assert.deepEqual(tracker.snapshot(), { cards: 1000, observers: 2 });
  assert.equal(observers.length, 2);
  assert.equal(observers[0].margin, '320px');
  off.forEach(stop => stop());
  assert.deepEqual(tracker.snapshot(), { cards: 0, observers: 0 });
  assert.ok(observers.every(observer => observer.disconnected && !observer.elements.size));
});

test('visibility changes publish only to affected cards and stale callbacks cannot revive unmounted ones', () => {
  const { tracker, observers } = fixture();
  const a = {} as Element, b = {} as Element;
  const seen: unknown[] = [], other: unknown[] = [];
  const off = tracker.observe(a, value => seen.push(value));
  const offOther = tracker.observe(b, value => other.push(value));
  assert.deepEqual(seen, [{ near: false, visible: false }]);
  seen.length = other.length = 0;
  observers[0].notify([{ target: a, isIntersecting: true }]);
  observers[1].notify([{ target: a, isIntersecting: true }]);
  observers[1].notify([{ target: a, isIntersecting: true }]);
  assert.deepEqual(seen, [{ near: true, visible: false }, { near: true, visible: true }]);
  assert.equal(other.length, 0);
  off();
  observers[0].notify([{ target: a, isIntersecting: false }]);
  assert.equal(seen.length, 2);
  offOther();
});

test('remount cleanup and development disposal do not keep old observers alive', () => {
  const { tracker, observers } = fixture();
  const element = {} as Element;
  const old = tracker.observe(element, () => {});
  const current = tracker.observe(element, () => {});
  old();
  assert.equal(tracker.snapshot().cards, 1);
  tracker.dispose();
  current();
  const seen: unknown[] = [];
  const next = tracker.observe(element, value => seen.push(value));
  assert.equal(observers.length, 4);
  seen.length = 0;
  observers[0].notify([{ target: element, isIntersecting: true }]);
  assert.equal(seen.length, 0, 'old queued observer callbacks cannot reach a new mount');
  observers[2].notify([{ target: element, isIntersecting: true }]);
  assert.equal(seen.length, 1);
  next();
  assert.equal(tracker.snapshot().observers, 0);
});
