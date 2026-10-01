import { getPullSettings, subscribePullSettings } from './pull-settings.ts';
import { createPullScheduler } from './pull-scheduler.ts';
import { getInteractionPriorityDelay } from './interaction-budget.ts';
import { setArtworkSuppressed } from './videos/image-load-budget.ts';
const KEY = "reelcase.pulls-paused.v1";
export function createPullControl(initial = false) {
  let paused = initial;
  const listeners = new Set<() => void>();
  const waiters = new Set<() => void>();
  return {
    paused: () => paused,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    set: (value: boolean) => {
      if (paused === value) return;
      paused = value;
      if (!value) { for (const resolve of waiters) resolve(); waiters.clear(); }
      for (const listener of listeners) listener();
    },
    wait: async () => {
      // A second pause before this continuation runs must still hold the job.
      while (paused) await new Promise<void>(resolve => waiters.add(resolve));
    },
  };
}
const control = createPullControl();
let hydrated = false;
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try { control.set(localStorage.getItem(KEY) === "true"); } catch { /* Session control still works. */ }
}
export function pullsPaused() { hydrate(); return control.paused(); }
export const subscribePullControl = control.subscribe;
export async function waitForPulls() { hydrate(); await control.wait(); }
export function setPullsPaused(value: boolean) {
  hydrate(); control.set(value);
  try { localStorage.setItem(KEY, String(value)); } catch { /* Session control still works. */ }
}
let viewing = false;
const gateListeners = new Set<() => void>();
const gateChanged = () => { scheduler.wake(); for (const listener of gateListeners) listener(); };
export function setPullViewerOpen(value: boolean) { viewing = value; setArtworkSuppressed(value); gateChanged(); }
export function catalogPullAvailable() {
  return !pullsPaused() && !(getPullSettings().pauseWhileWatching && viewing)
    && (typeof document === 'undefined' || !document.hidden) && getInteractionPriorityDelay() === 0;
}
const scheduler = createPullScheduler(() => ({ concurrency: getPullSettings().concurrentRequests, gapMs: getPullSettings().requestGapMs }), catalogPullAvailable, 8, {
  availabilityDelay: () => !pullsPaused() && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === 'undefined' || !document.hidden) ? getInteractionPriorityDelay() : Infinity,
});
const stopControl = control.subscribe(gateChanged);
const stopSettings = subscribePullSettings(gateChanged);
if (typeof document !== 'undefined') {
  const onStorage = (event: StorageEvent) => { if (event.key === KEY) { hydrated = true; control.set(event.newValue === 'true'); } };
  window.addEventListener('storage', onStorage);
  document.addEventListener('visibilitychange', gateChanged);
  import.meta.hot?.dispose(() => {
    window.removeEventListener('storage', onStorage);
    document.removeEventListener('visibilitychange', gateChanged);
    stopControl(); stopSettings(); scheduler.cancel(); gateChanged();
  });
}
export const getPullQueueSnapshot = scheduler.snapshot;
export const subscribePullQueue = scheduler.subscribe;
export const cancelQueuedPulls = () => { scheduler.cancel(); gateChanged(); };
export const getPullCancellationRevision = scheduler.revision;
/** Yield preparation/commits behind input, watching, pause, and visibility.
 * Cancellation wakes this wait even when the tab never becomes visible. */
export function waitForCatalogCommit(revision = scheduler.revision()): Promise<void> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => { clearTimeout(timer); gateListeners.delete(check); };
    const check = () => {
      clearTimeout(timer);
      if (revision !== scheduler.revision()) { cleanup(); reject(new Error('Pull cancelled; accepted catalog entries remain saved.')); return; }
      if (catalogPullAvailable()) { cleanup(); resolve(); return; }
      const delay = getInteractionPriorityDelay();
      if (delay > 0 && !pullsPaused() && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === 'undefined' || !document.hidden)) timer = setTimeout(check, delay);
    };
    gateListeners.add(check); check();
  });
}
export async function runPausablePull<T>(request: (signal: AbortSignal) => Promise<T>): Promise<T> {
  return scheduler.run(request);
}
