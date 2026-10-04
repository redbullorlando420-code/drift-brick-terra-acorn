import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(specifier + '.ts', context);
    throw error;
  }
} });
const stored = new Map();
Object.defineProperty(globalThis, 'window', { configurable: true, value: Object.assign(new EventTarget(), { setTimeout, clearTimeout }) });
Object.defineProperty(globalThis, 'document', { configurable: true, value: Object.assign(new EventTarget(), { visibilityState: 'visible' }) });
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { hardwareConcurrency: 16, deviceMemory: 8 } });
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) } });
const { setPerformanceMode, getPerformanceProfile, PERFORMANCE_MODE_KEY } = await import('../src/lib/performance-profile.ts');
const { useThumbs, getThumbDiagnostics } = await import('../src/lib/videos/thumbs.ts');
const { artworkUrl, binaryArtworkSnapshot } = await import('../src/lib/videos/binary-artwork.ts');
const { acquireImageSlot, getImageLoadBudgetSnapshot } = await import('../src/lib/videos/image-load-budget.ts');
const { trackSessionActivity } = await import('../src/lib/session-activity.ts');
const stopActivity = trackSessionActivity(() => {});
after(() => stopActivity());

test('lowering the profile immediately releases artwork memory while preserving saved individual settings', () => {
  localStorage.setItem('reelcase.thumbnail-workers', '4');
  localStorage.setItem('reelcase.grid-page-size', '144');
  const byId = Object.fromEntries(Array.from({ length: 280 }, (_, i) => [String(i), artworkUrl(new Blob([new Uint8Array(16_384)]))]));
  useThumbs.setState({ byId });
  assert.equal(binaryArtworkSnapshot().urls, 280);
  setPerformanceMode('low-memory');
  assert.equal(getThumbDiagnostics().entries, 72);
  assert.equal(binaryArtworkSnapshot().urls, 72);
  assert.ok(getThumbDiagnostics().bytes <= 2 * 1024 * 1024);
  assert.equal(localStorage.getItem('reelcase.thumbnail-workers'), '4');
  assert.equal(localStorage.getItem('reelcase.grid-page-size'), '144');
  setPerformanceMode('adaptive');
  assert.equal(getThumbDiagnostics().byteLimit, 8 * 1024 * 1024);
  useThumbs.getState().trimMemory();
});

test('a live budget change holds new requests until older requests finish and refills on an increase', { timeout: 2000 }, async () => {
  const releases = await Promise.all(Array.from({ length: 8 }, () => acquireImageSlot({ priority: 'high' })));
  const controller = new AbortController(); let granted = false;
  try {
    setPerformanceMode('low-memory');
    const pending = acquireImageSlot({ priority: 'high', signal: controller.signal }).then(release => { granted = !!release; if (release) releases.push(release); });
    await Promise.resolve(); assert.equal(granted, false); assert.equal(getImageLoadBudgetSnapshot().max, 4);
    while (releases.length > 4) releases.pop()();
    await Promise.resolve(); assert.equal(granted, false, 'four older requests still occupy all low-memory slots');
    setPerformanceMode('adaptive'); await pending;
    assert.equal(granted, true); assert.equal(getImageLoadBudgetSnapshot().queued, 0);
  } finally { controller.abort(); releases.forEach(release => release()); setPerformanceMode('adaptive'); }
  assert.equal(getImageLoadBudgetSnapshot().active, 0);
});

test('a cross-tab profile change uses one storage signal to trim the current cache', () => {
  const byId = Object.fromEntries(Array.from({ length: 140 }, (_, i) => [String(i), artworkUrl(new Blob([new Uint8Array(4096)]))]));
  useThumbs.setState({ byId });
  stored.set(PERFORMANCE_MODE_KEY, 'low-memory');
  const event = new Event('storage'); Object.defineProperty(event, 'key', { value: PERFORMANCE_MODE_KEY });
  window.dispatchEvent(event);
  assert.equal(getPerformanceProfile().lowMemory, true);
  assert.equal(getThumbDiagnostics().entries, 72);
  useThumbs.getState().trimMemory(); setPerformanceMode('adaptive');
});
