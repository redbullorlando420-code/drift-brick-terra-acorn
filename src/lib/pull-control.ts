import { getPullSettings, subscribePullSettings } from './pull-settings.ts';
import { createPullScheduler } from './pull-scheduler.ts';
import { getInteractionPriorityDelay } from './interaction-budget.ts';
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
export function setPullViewerOpen(value: boolean) { viewing = value; scheduler.wake(); }
export function catalogPullAvailable() {
  return !pullsPaused() && !(getPullSettings().pauseWhileWatching && viewing)
    && (typeof document === 'undefined' || !document.hidden) && getInteractionPriorityDelay() === 0;
}
const scheduler = createPullScheduler(() => ({ concurrency: getPullSettings().concurrentRequests, gapMs: getPullSettings().requestGapMs }), catalogPullAvailable);
const stopControl = control.subscribe(scheduler.wake);
const stopSettings = subscribePullSettings(scheduler.wake);
if (typeof document !== 'undefined') {
  const onStorage = (event: StorageEvent) => { if (event.key === KEY) { hydrated = true; control.set(event.newValue === 'true'); } };
  window.addEventListener('storage', onStorage);
  document.addEventListener('visibilitychange', scheduler.wake);
  import.meta.hot?.dispose(() => {
    window.removeEventListener('storage', onStorage);
    document.removeEventListener('visibilitychange', scheduler.wake);
    stopControl(); stopSettings(); scheduler.cancel();
  });
}
export const getPullQueueSnapshot = scheduler.snapshot;
export const subscribePullQueue = scheduler.subscribe;
export const cancelQueuedPulls = scheduler.cancel;
export const getPullCancellationRevision = scheduler.revision;
export async function runPausablePull<T>(request: () => Promise<T>): Promise<T> {
  return scheduler.run(request);
}
