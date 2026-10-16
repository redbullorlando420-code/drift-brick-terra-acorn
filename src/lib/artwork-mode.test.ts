import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARTWORK_MODE_KEY, getTextFirstArtwork, setTextFirstArtwork, subscribeArtworkMode } from './artwork-mode.ts';

test('artwork preference shares listeners, reacts across tabs, and survives blocked storage', () => {
  const descriptors = Object.fromEntries(['window', 'document', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const events = new Map<string, Set<EventListener>>();
  const storage = new Map([[ARTWORK_MODE_KEY, 'text']]);
  let reads = 0, denied = false;
  const dataset: Record<string, string> = {};
  const send = (key: string | null) => { for (const listener of events.get('storage') ?? []) listener({ key } as unknown as Event); };
  const releases: (() => void)[] = [];
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {
      addEventListener(name: string, listener: EventListener) { const rows = events.get(name) ?? new Set(); rows.add(listener); events.set(name, rows); },
      removeEventListener(name: string, listener: EventListener) { events.get(name)?.delete(listener); },
    } });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { documentElement: { dataset } } });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem(key: string) { reads++; if (denied) throw Error('storage blocked'); return storage.get(key) ?? null; },
      setItem(key: string, value: string) { if (denied) throw Error('storage blocked'); storage.set(key, value); },
    } });
    assert.equal(getTextFirstArtwork(), true, 'saved mode is available on first client mount');
    let notifications = 0;
    for (let i = 0; i < 108; i++) releases.push(subscribeArtworkMode(() => { notifications++; }));
    assert.equal(events.get('storage')?.size, 1);
    assert.equal(events.get('reelcase:diagnostics-settings')?.size, 1);
    const before = reads;
    for (let i = 0; i < 108; i++) assert.equal(getTextFirstArtwork(), true);
    assert.equal(reads, before, 'snapshot reads cannot hit storage per card');
    send('unrelated'); assert.equal(reads, before);
    storage.set(ARTWORK_MODE_KEY, 'images'); send(ARTWORK_MODE_KEY);
    assert.equal(notifications, 108); assert.equal(getTextFirstArtwork(), false); assert.equal(dataset.artworkMode, 'images');
    send(ARTWORK_MODE_KEY); assert.equal(notifications, 108, 'unchanged values do not fan out');
    setTextFirstArtwork(true); assert.equal(notifications, 216); assert.equal(dataset.artworkMode, 'text');
    denied = true; setTextFirstArtwork(false); assert.equal(getTextFirstArtwork(), false);
    setTextFirstArtwork(true); assert.equal(getTextFirstArtwork(), true, 'blocked persistence does not disable the session choice');
    denied = false;
    releases.forEach(stop => stop()); releases.length = 0;
    assert.equal(events.get('storage')?.size, 0); assert.equal(events.get('reelcase:diagnostics-settings')?.size, 0);
    storage.set(ARTWORK_MODE_KEY, 'images');
    releases.push(subscribeArtworkMode(() => {}));
    assert.equal(getTextFirstArtwork(), false, 'unmounted settings changes are reread');
    storage.clear(); send(null); assert.equal(getTextFirstArtwork(), false);
  } finally {
    releases.forEach(stop => stop());
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
  assert.equal(getTextFirstArtwork(), false, 'server snapshot never accesses browser storage');
});
