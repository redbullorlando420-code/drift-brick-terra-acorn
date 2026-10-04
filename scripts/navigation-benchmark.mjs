import { registerHooks } from 'node:module';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
registerHooks({ resolve(s, c, next) { try { return next(s, c); } catch (error) { if (s.startsWith('.') && !/\.[a-z]+$/i.test(s)) return next(s + '.ts', c); throw error; } } });
const { createNavigationStore } = await import('../src/lib/navigation-store.ts');
const { mixYoutubeCreators } = await import('../src/lib/remote/youtube-mix.ts');
const { prepareYoutubeBrowse } = await import('../src/lib/videos/youtube-browse.ts');
const { youtubeCatalogSelection } = await import('../src/lib/videos/youtube-catalog-selection.ts');

async function measure(entries, staged) {
  let reads = 0, selectorRuns = 0, selected = [], publish, preparedRows;
  let slices = 0, maxWorkSliceMs = 0, sliceStarted = performance.now(), finish;
  const completed = new Promise(resolve => { finish = resolve; });
  const turn = async () => {
    maxWorkSliceMs = Math.max(maxWorkSliceMs, performance.now() - sliceStarted); slices++;
    await new Promise(resolve => setImmediate(resolve)); sliceStarted = performance.now();
  };
  const catalog = Array.from({ length: entries }, (_, i) => ({ id: String(i), name: `Upload ${i}`, path: String(i),
    folderId: `creator:${i % 2100}`, addedAt: entries - i, size: 0, extension: 'yt', mime: 'video/youtube',
    get remote() { reads++; return remote[i % 2100]; } }));
  const remote = Array.from({ length: 2100 }, (_, i) => ({ kind: 'youtube', channelId: `creator:${i}`, channelName: `Creator ${i}` }));
  let state = { source: 'home', catalog };
  const sourceListeners = new Set();
  const source = { getState: () => state, getInitialState: () => state,
    subscribe(fn) { sourceListeners.add(fn); return () => sourceListeners.delete(fn); } };
  const browse = staged ? createNavigationStore(source, { key: s => s.source, defer: s => s.source !== 'home',
    prepared: (a, b) => a.catalog === b.catalog,
    async prepare(s, signal) {
      sliceStarted = performance.now();
      preparedRows = await prepareYoutubeBrowse(await youtubeCatalogSelection({ videos: s.catalog, privateFolders: new Set(),
        unavailable: {}, hiddenVideos: {}, hideDemo: true }, signal, turn), signal, turn);
      maxWorkSliceMs = Math.max(maxWorkSliceMs, performance.now() - sliceStarted);
    },
    schedule(fn) { publish = fn; return () => { if (publish === fn) publish = undefined; }; } }) : source;
  const off = browse.subscribe(s => {
    selectorRuns++;
    if (s.source === 'home') { selected = []; return; }
    const candidates = staged ? preparedRows : s.catalog.filter(video => video.remote.kind === 'youtube').sort((a, b) => b.addedAt - a.addedAt);
    selected = mixYoutubeCreators(candidates, 7);
    finish();
  });
  const started = performance.now();
  for (const destination of ['youtube', 'landing', 'youtube', 'landing', 'youtube']) {
    const previous = state; state = { source: destination, catalog };
    for (const notify of sourceListeners) notify(state, previous);
  }
  const inputStackMs = performance.now() - started, beforePaintReads = reads, beforePaintSelectors = selectorRuns;
  // The browser adapter invokes this after a painted destination shell.
  const afterPaintStart = performance.now(); publish?.();
  await completed;
  const afterPaintWorkMs = performance.now() - afterPaintStart;
  assert.equal(selected.length, 48); assert.equal(browse.getState().catalog, catalog);
  if (staged) { assert.equal(beforePaintReads, 0); assert.equal(beforePaintSelectors, 0); assert.equal(selectorRuns, 1); }
  off(); assert.equal(sourceListeners.size, 0);
  return { inputStackMs: +inputStackMs.toFixed(2), beforePaintReads, beforePaintSelectors, afterPaintElapsedMs: +afterPaintWorkMs.toFixed(2),
    cooperativeYields: slices, maxObservedPreparationSliceMs: +maxWorkSliceMs.toFixed(2), totalSelectorRuns: selectorRuns, selected: selected.length };
}
const runs = [];
for (const entries of [100_000, 1_000_000]) runs.push({ entries, immediate: await measure(entries, false), staged: await measure(entries, true) });
console.log(JSON.stringify({ runs,
  note: 'Synthetic five-route burst using production catalog selection, browse preparation and creator mix. Getter instrumentation counts metadata reads. This measures event-stack work and discarded computations, not browser paint latency or total application memory; slices can include runtime garbage collection.' }, null, 2));
