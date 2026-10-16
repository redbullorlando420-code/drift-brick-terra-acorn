import test from 'node:test';
import assert from 'node:assert/strict';

test('browser enrichment owns one idle callback, cancels on real lifecycle/input/viewer gates, and releases all listeners', async () => {
  const saved = Object.fromEntries(['window', 'document', 'performance', 'scheduler'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let now = 0, nextId = 0;
  const idle = new Map<number, () => void>(), timers = new Map<number, () => void>(), listeners = new Set<string>();
  const page = Object.assign(new EventTarget(), { hidden: false, visibilityState: 'visible' });
  const surface = Object.assign(new EventTarget(), {
    requestIdleCallback(fn: () => void) { const id = ++nextId; idle.set(id, fn); return id; }, cancelIdleCallback(id: number) { idle.delete(id); },
    setTimeout(fn: () => void) { const id = ++nextId; timers.set(id, fn); return id; }, clearTimeout(id: number) { timers.delete(id); },
  });
  const add = surface.addEventListener.bind(surface), remove = surface.removeEventListener.bind(surface);
  surface.addEventListener = (type, listener, options) => { listeners.add(type); add(type, listener, options); };
  surface.removeEventListener = (type, listener, options) => { listeners.delete(type); remove(type, listener, options); };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: surface });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: page });
  Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => now } });
  Object.defineProperty(globalThis, 'scheduler', { configurable: true, value: undefined });
  const flush = async () => { for (let i = 0; i < 16; i++) await Promise.resolve(); };
  const fire = async (callbacks: Map<number, () => void>) => { const [id, callback] = callbacks.entries().next().value!; callbacks.delete(id); callback(); await flush(); };
  const { idleEnrichment, setEnrichmentViewerOpen, holdMetadataEnrichment } = await import('./idle-work.ts');
  try {
    let commits = 0;
    const job = () => idleEnrichment.enqueue('test', 'Test', async (signal, turn) => {
      await turn(); signal.throwIfAborted(); commits++;
      return { done: true, result: commits, progress: { scanned: 1, total: 1, changed: 1, batches: 1 } };
    });
    const pending = job(); assert.equal(idle.size, 1); assert.equal(listeners.size, 6);
    page.hidden = true; page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange')); await flush();
    assert.equal(idle.size, 0); assert.equal(timers.size, 0); assert.equal(commits, 0);
    page.hidden = false; page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange')); assert.equal(idle.size, 1);
    setEnrichmentViewerOpen(true); await flush(); assert.equal(idle.size, 0);
    setEnrichmentViewerOpen(false); assert.equal(idle.size, 1);
    setEnrichmentViewerOpen(false, true); await flush(); assert.equal(idle.size, 0, 'active search holds optional tag commits');
    setEnrichmentViewerOpen(false, false); assert.equal(idle.size, 1);
    const releaseRanking = holdMetadataEnrichment(), releaseNavigation = holdMetadataEnrichment();
    await flush(); assert.equal(idle.size, 0); assert.equal(commits, 0);
    releaseRanking(); releaseRanking(); await flush(); assert.equal(idle.size, 0);
    releaseNavigation(); assert.equal(idle.size, 1, 'only the final owner resumes queued metadata');
    await fire(idle); surface.dispatchEvent(new Event('pointerdown')); await flush();
    assert.equal(idle.size, 0); assert.equal(timers.size, 1); assert.equal(commits, 0);
    now = 250; await fire(timers); await fire(idle); await fire(timers);
    assert.equal(await pending, 1); assert.equal(listeners.size, 0); assert.equal(idle.size, 0); assert.equal(timers.size, 0);
    const resumed = job(); surface.dispatchEvent(new Event('pagehide')); await flush(); assert.equal(idle.size, 0);
    surface.dispatchEvent(new Event('pageshow')); await fire(idle); await fire(timers);
    assert.equal(await resumed, 2); assert.equal(listeners.size, 0);
    const tasks = new Map<number, () => void>();
    Object.defineProperty(globalThis, 'scheduler', { configurable: true, value: {
      postTask(_work: () => void, options: { signal: AbortSignal }) { return new Promise<void>((resolve, reject) => {
        const id = ++nextId;
        const abort = () => { tasks.delete(id); reject(options.signal.reason); };
        tasks.set(id, () => { options.signal.removeEventListener('abort', abort); resolve(); });
        options.signal.addEventListener('abort', abort, { once: true });
      }); },
    } });
    const native = job(); await fire(idle); assert.equal(tasks.size, 1); assert.equal(idle.size, 0);
    page.hidden = true; page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange')); await flush();
    assert.equal(tasks.size, 0); assert.equal(commits, 2);
    page.hidden = false; page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange')); await fire(idle); await fire(tasks);
    assert.equal(await native, 3); assert.equal(listeners.size, 0); assert.equal(tasks.size, 0);
  } finally {
    setEnrichmentViewerOpen(false); idleEnrichment.dispose();
    for (const [key, descriptor] of Object.entries(saved)) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  }
});
