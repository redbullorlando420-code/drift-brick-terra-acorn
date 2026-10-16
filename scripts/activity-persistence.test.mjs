import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(specifier + '.ts', context); throw error;
  }
} });
const persist = await import('../src/lib/videos/persist.ts');
const { patchActivityRecord } = await import('../src/lib/videos/activity-records.ts');

test('real activity, preferences and dedicated stores clone sparse updates and recover old plus recent records', async () => {
  const saved = Object.fromEntries(['indexedDB', 'window', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const disk = new Map(), local = new Map();
  let fail = false;
  const db = { close() {}, transaction(store) {
    assert.equal(store, 'activity'); const tx = {};
    tx.objectStore = () => ({ put(value, key) {
      if (fail) throw Error('storage unavailable'); disk.set(key, structuredClone(value));
    }, get(key) { const req = {}; setImmediate(() => { req.result = structuredClone(disk.get(key)); req.onsuccess(); }); return req; } });
    setImmediate(() => tx.oncomplete?.()); return tx;
  } };
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: { open() {
    const req = {}; setImmediate(() => { req.result = db; req.onsuccess(); }); return req;
  } } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => local.get(key) ?? null, setItem: (key, value) => local.set(key, value), removeItem: key => local.delete(key),
  } });
  try {
    const mark = { t: 10, d: 100, at: 1 }, newest = { t: 30, d: 100, at: 2 };
    const baseline = Object.fromEntries(Array.from({ length: 20_000 }, (_, i) => [`id:${i}`, mark]));
    const snapshot = { history: [{ id: 'id:5', at: 2, source: 'open' }], savedAt: 2,
      progress: patchActivityRecord(baseline, [['id:5', newest]]), resumeProgress: patchActivityRecord({ older: mark }, [['url', newest]]),
      viewCounts: patchActivityRecord({ older: 7 }, [['id:5', 2]]), cameCounts: patchActivityRecord({ older: 3 }, [['id:5', 1]]) };
    persist.saveDurableResume(snapshot.progress, snapshot.resumeProgress);
    persist.saveDurableMarks(snapshot.viewCounts, snapshot.cameCounts);
    await persist.saveActivitySnapshot(snapshot);
    persist.savePrefs({ ...snapshot, tags: {}, metadataProvenance: {}, favorites: ['kept'], likes: [], categories: {}, view: 'grid', sort: 'added', sourceId: 'youtube' });
    await persist.waitForPrefsWrites();
    assert.ok(disk.get('primary').sparseActivityRecords.progress);
    const [activity, resume, counts] = await Promise.all([persist.loadActivitySnapshot(), persist.restoreDurableResume(), persist.restoreDurableMarks()]);
    for (const restored of [activity, resume]) {
      assert.equal(Object.keys(restored.progress).length, 20_000);
      assert.deepEqual(restored.progress['id:5'], newest); assert.deepEqual(restored.progress['id:19999'], mark);
      assert.deepEqual(restored.resumeProgress.url, newest); assert.deepEqual(restored.resumeProgress.older, mark);
    }
    assert.equal(counts.viewCounts.older, 7); assert.equal(counts.viewCounts['id:5'], 2);
    assert.equal(counts.cameCounts.older, 3); assert.equal(counts.cameCounts['id:5'], 1);
    await persist.restoreDurablePrefs(); const prefs = persist.loadPrefs();
    assert.deepEqual(prefs.progress['id:5'], newest); assert.equal(prefs.viewCounts['id:5'], 2); assert.deepEqual(prefs.favorites, ['kept']);
    // Old installations have ordinary dictionaries and no sidecar.
    disk.set('primary', { progress: { legacy: mark }, resumeProgress: {}, history: [], viewCounts: { legacy: 4 }, savedAt: 1 });
    assert.equal((await persist.loadActivitySnapshot()).viewCounts.legacy, 4);
    // A failed write leaves old IDB data beside a newer emergency mirror.
    disk.set('resume', { progress: {}, resumeProgress: { url: mark, older: mark }, savedAt: 1 });
    fail = true;
    persist.saveDurableResume(snapshot.progress, snapshot.resumeProgress);
    persist.saveDurableMarks(snapshot.viewCounts, snapshot.cameCounts);
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.deepEqual((await persist.restoreDurableResume()).resumeProgress.url, newest);
    disk.clear();
    const fallback = await persist.restoreDurableResume(), fallbackMarks = await persist.restoreDurableMarks();
    assert.deepEqual(fallback.resumeProgress.url, newest); assert.equal(fallbackMarks.viewCounts['id:5'], 2);
  } finally {
    for (const [key, descriptor] of Object.entries(saved)) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  }
});
