import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error;
  }
} });
const persist = await import('../src/lib/videos/persist.ts');

test('tiny saved edits survive failures, acknowledge only committed values and compact behind complete snapshots', async () => {
  const descriptors = Object.fromEntries(['indexedDB', 'IDBKeyRange', 'window', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const disk = new Map(), local = new Map(); let failDisk = false, failMirror = false;
  const matches = (key, range) => !range || (key > range.lower || key === range.lower && !range.lowerOpen)
    && (key < range.upper || key === range.upper && !range.upperOpen);
  const db = { close() {}, transaction(name, mode) {
    assert.equal(name, 'activity'); const tx = {}; let pending = 0, aborted = false, scheduled = false;
    const writes = [];
    const complete = () => {
      if (scheduled) return; scheduled = true;
      setImmediate(() => {
        scheduled = false; if (pending || aborted) return;
        for (const write of writes) write(); tx.oncomplete?.();
      });
    };
    const request = value => {
      pending++; const req = { readyState: 'pending' };
      setImmediate(() => { req.result = value(); req.readyState = 'done'; req.onsuccess?.(); pending--; complete(); }); return req;
    };
    const store = { put(value, key) {
      if (failDisk) { aborted = true; throw Error('Disk unavailable'); }
      const clone = structuredClone(value); writes.push(() => disk.set(key, clone));
    }, delete(key) { assert.equal(mode, 'readwrite'); writes.push(() => disk.delete(key)); },
      get: key => request(() => structuredClone(disk.get(key))),
      getAll: (range, count) => request(() => [...disk.keys()].sort().filter(key => matches(key, range)).slice(0, count).map(key => structuredClone(disk.get(key)))),
      getAllKeys: (range, count) => request(() => [...disk.keys()].sort().filter(key => matches(key, range)).slice(0, count)),
    };
    tx.objectStore = () => store; complete(); return tx;
  } };
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: { open() {
    const req = {}; setImmediate(() => { req.result = db; req.onsuccess(); }); return req;
  } } });
  Object.defineProperty(globalThis, 'IDBKeyRange', { configurable: true, value: { bound: (lower, upper, lowerOpen, upperOpen) => ({ lower, upper, lowerOpen, upperOpen }) } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => local.get(key) ?? null, removeItem: key => local.delete(key),
    setItem: (key, value) => { if (failMirror) throw Error('Quota exceeded'); local.set(key, value); },
  } });
  const wait = async predicate => {
    for (let i = 0; i < 1000; i++) { if (predicate()) return; await new Promise(resolve => setTimeout(resolve, 2)); }
    assert.fail('Persistence did not settle');
  };
  try {
    const favorites = Array.from({ length: 100_000 }, (_, i) => `saved:${i}`);
    disk.set('shelves', { favorites, likes: ['like-remove'], savedAt: 1 });
    failDisk = true;
    persist.saveSavedShelfEdit('saved:5', 'favorites', false);
    persist.saveSavedShelfEdit('added', 'favorites', true);
    persist.saveSavedShelfEdit('like-remove', 'likes', false);
    persist.saveSavedShelfEdit('flipped', 'likes', true);
    persist.saveSavedShelfEdit('flipped', 'likes', false);
    assert.ok(local.get('reelcase.saved-edits.v1').length < 1000, 'click mirror contains edits, not 100k saved IDs');
    await new Promise(resolve => setTimeout(resolve, 20));
    let recovered = await persist.restoreDurableShelves();
    assert.equal(recovered.favorites.length, 100_000); assert.ok(!recovered.favorites.includes('saved:5'));
    assert.ok(recovered.favorites.includes('added')); assert.deepEqual(recovered.likes, []);
    // Retry mirrored failures. A late earlier acknowledgement cannot erase the final flip.
    failDisk = false;
    await persist.restoreDurableShelves();
    await wait(() => !local.has('reelcase.saved-edits.v1'));
    recovered = await persist.restoreDurableShelves(); assert.deepEqual(recovered.likes, []);
    assert.equal(disk.get('saved-edit:likes:flipped').saved, false);
    // LocalStorage failure still preserves the tiny independent disk record.
    failMirror = true; persist.saveSavedShelfEdit('disk-only', 'likes', true);
    await wait(() => disk.has('saved-edit:likes:disk-only'));
    assert.deepEqual((await persist.restoreDurableShelves()).likes, ['disk-only']); failMirror = false;
    // A new checkpoint absorbs old edits while a newer edit survives pruning.
    persist.saveDurableShelves(recovered.favorites, ['disk-only']);
    persist.saveSavedShelfEdit('newer', 'favorites', true);
    await wait(() => disk.has('saved-edit:favorites:newer') && !disk.has('saved-edit:favorites:added'));
    assert.ok((await persist.restoreDurableShelves()).favorites.includes('newer'));
    assert.ok(disk.get('shelves').favorites.includes('added'));
    // Replay more than one 256-row page without losing complete saved lists.
    const at = disk.get('shelves').savedAt + 10000;
    for (let i = 0; i < 600; i++) disk.set(`saved-edit:likes:paged:${i}`, { id: `paged:${i}`, shelf: 'likes', saved: true, at });
    assert.equal((await persist.restoreDurableShelves()).likes.length, 601);
    disk.set('saved-edit:likes:bad', { shelf: 'likes', id: 'bad', saved: 'true', at: 1 });
    assert.ok(!(await persist.restoreDurableShelves()).likes.includes('bad'));
    await new Promise(resolve => setTimeout(resolve, 10));
    // Older installations may have only a preference backup, with no dedicated shelf blob.
    disk.clear(); local.clear();
    local.set('reelcase.prefs.v4', JSON.stringify({ favorites: ['legacy-keep', 'legacy-remove'], likes: ['legacy-like'] }));
    failDisk = true;
    persist.saveSavedShelfEdit('legacy-remove', 'favorites', false);
    persist.saveSavedShelfEdit('legacy-added', 'favorites', true);
    assert.deepEqual(await persist.restoreDurableShelves(), { favorites: ['legacy-keep', 'legacy-added'], likes: ['legacy-like'], authoritative: true });
    failDisk = false; await persist.restoreDurableShelves();
    await wait(() => !local.has('reelcase.saved-edits.v1'));
  } finally {
    for (const [key, descriptor] of Object.entries(descriptors)) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  }
});
