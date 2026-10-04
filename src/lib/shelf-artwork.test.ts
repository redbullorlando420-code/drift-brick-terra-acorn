import test from 'node:test';
import assert from 'node:assert/strict';
import { watchShelfArtwork } from './shelf-artwork.ts';

test('artwork observers release image listeners on departure, window changes and success', () => {
  const previous = globalThis.MutationObserver;
  let callback: (() => void) | undefined, disconnected = 0;
  class Observer { constructor(fn: () => void) { callback = fn; } observe() {} disconnect() { disconnected++; } }
  class Image extends EventTarget {
    complete = false; naturalWidth = 0; listeners = new Set<EventListenerOrEventListenerObject>();
    override addEventListener(type: string, fn: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean) {
      if (fn) this.listeners.add(fn); super.addEventListener(type, fn, options);
    }
    override removeEventListener(type: string, fn: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean) {
      if (fn) this.listeners.delete(fn); super.removeEventListener(type, fn, options);
    }
  }
  Object.defineProperty(globalThis, 'MutationObserver', { configurable: true, writable: true, value: Observer });
  const first = new Image(), second = new Image();
  let images = [first, second], result: boolean | undefined;
  const rail = { querySelectorAll: () => images, contains: (image: Image) => images.includes(image) } as unknown as HTMLElement;
  try {
    const stop = watchShelfArtwork(rail, loaded => { result = loaded; });
    assert.equal(first.listeners.size, 1); assert.equal(second.listeners.size, 1);
    images = [second]; callback?.(); assert.equal(first.listeners.size, 0, 'detached images are released');
    stop(); assert.equal(second.listeners.size, 0); second.dispatchEvent(new Event('load')); assert.equal(result, undefined);
    watchShelfArtwork(rail, loaded => { result = loaded; });
    second.dispatchEvent(new Event('load')); assert.equal(result, true); assert.equal(second.listeners.size, 0);
    assert.equal(disconnected, 2);
  } finally {
    if (previous) globalThis.MutationObserver = previous; else Reflect.deleteProperty(globalThis, 'MutationObserver');
  }
});
