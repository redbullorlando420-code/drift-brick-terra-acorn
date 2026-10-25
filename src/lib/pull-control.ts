import { getPullSettings, subscribePullSettings } from './pull-settings.ts';
import { createPullScheduler } from './pull-scheduler.ts';
import { getInteractionPriorityDelay } from './interaction-budget.ts';
import { setArtworkSuppressed } from './videos/image-load-budget.ts';
import { automaticPullMatchesPage, type PullProvider } from './pull-priority.ts';
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
let activePullPage = '';
export function setActivePullPage(page: string) {
  if (page === activePullPage) return;
  activePullPage = page; gateChanged();
}
export function automaticPullAvailable(provider?: PullProvider) { return automaticPullMatchesPage(activePullPage, provider); }
const gateChanged = () => { scheduler.wake(); for (const lane of liveSchedulers) lane.wake(); for (const listener of gateListeners) listener(); };
/** Includes the viewer gate, which changes after the store's open/close event.
 * Sleeping periodic owners must wake on that final availability transition. */
export const subscribePullAvailability = (listener: () => void) => { gateListeners.add(listener); return () => { gateListeners.delete(listener); }; };
export function setPullViewerOpen(value: boolean) { viewing = value; setArtworkSuppressed(value); gateChanged(); }
export function catalogPullAvailable(ignoreInteraction = false, ignorePause = false) {
  return (ignorePause || !pullsPaused()) && !(getPullSettings().pauseWhileWatching && viewing)
    && (typeof document === 'undefined' || !document.hidden) && (ignoreInteraction || getInteractionPriorityDelay() === 0);
}
const scheduler = createPullScheduler(() => ({ concurrency: getPullSettings().concurrentRequests, gapMs: getPullSettings().requestGapMs }), ignorePause => catalogPullAvailable(false, ignorePause), 8, {
  requestTimeoutMs: () => Math.max(90_000, getPullSettings().requestGapMs * 12 + 30_000, getPullSettings().youtubeRequestGapMs * 4 + 90_000),
  availabilityDelay: (ignorePause = false) => (ignorePause || !pullsPaused()) && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === 'undefined' || !document.hidden) ? getInteractionPriorityDelay() : Infinity,
});
// Independent, bounded provider lanes prevent a slow YouTube response from
// blocking Twitch or a requested room page. Server transfer caps still apply.
const createLiveLane = (concurrency = 1) => createPullScheduler(() => ({ concurrency, gapMs: 80 }), ignorePause => catalogPullAvailable(false, ignorePause), 4, {
  requestTimeoutMs: concurrency > 1 ? 30_000 : () => Math.max(90_000, getPullSettings().youtubeRequestGapMs * 48 + 30_000),
  availabilityDelay: (ignorePause = false) => (ignorePause || !pullsPaused()) && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === 'undefined' || !document.hidden) ? getInteractionPriorityDelay() : Infinity,
});
const liveScheduler = createLiveLane(), youtubeLiveScheduler = createLiveLane(3), twitchLiveScheduler = createLiveLane();
const liveSchedulers = [liveScheduler, youtubeLiveScheduler, twitchLiveScheduler];
let combinedSnapshot = scheduler.snapshot();
const queueListeners = new Set<() => void>();
const combineQueues = () => {
  const snapshots = [scheduler, ...liveSchedulers].map(lane => lane.snapshot());
  const next = snapshots.reduce((total, item) => ({ active: total.active + item.active, waiting: total.waiting + item.waiting, held: total.held || item.held, cancelled: total.cancelled + item.cancelled }), { active: 0, waiting: 0, held: false, cancelled: 0 });
  if (Object.keys(next).every(key => next[key as keyof typeof next] === combinedSnapshot[key as keyof typeof next])) return;
  combinedSnapshot = next;
  for (const listener of queueListeners) listener();
};
const stopQueues = [scheduler, ...liveSchedulers].map(lane => lane.subscribe(combineQueues));
const stopControl = control.subscribe(gateChanged);
const stopSettings = subscribePullSettings(gateChanged);
if (typeof document !== 'undefined') {
  const onStorage = (event: StorageEvent) => { if (event.key === KEY) { hydrated = true; control.set(event.newValue === 'true'); } };
  window.addEventListener('storage', onStorage);
  document.addEventListener('visibilitychange', gateChanged);
  import.meta.hot?.dispose(() => {
    window.removeEventListener('storage', onStorage);
    document.removeEventListener('visibilitychange', gateChanged);
    stopControl(); stopSettings(); scheduler.cancel(); for (const lane of liveSchedulers) lane.cancel(); for (const stop of stopQueues) stop(); gateChanged();
  });
}
export const getPullQueueSnapshot = () => combinedSnapshot;
export const subscribePullQueue = (listener: () => void) => { queueListeners.add(listener); return () => { queueListeners.delete(listener); }; };
export const cancelQueuedPulls = () => { scheduler.cancel(); for (const lane of liveSchedulers) lane.cancel(); gateChanged(); };
export const getPullCancellationRevision = scheduler.revision;
/** Yield preparation/commits behind input, watching, pause, and visibility.
 * Cancellation wakes this wait even when the tab never becomes visible. */
export function waitForCatalogCommit(revision = scheduler.revision(), signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => { clearTimeout(timer); gateListeners.delete(check); signal?.removeEventListener('abort', check); };
    const check = () => {
      clearTimeout(timer);
      if (signal?.aborted || revision !== scheduler.revision()) { cleanup(); reject(new Error('Pull cancelled; accepted catalog entries remain saved.')); return; }
      if (catalogPullAvailable()) { cleanup(); resolve(); return; }
      const delay = getInteractionPriorityDelay();
      if (delay > 0 && !pullsPaused() && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === 'undefined' || !document.hidden)) timer = setTimeout(check, delay);
    };
    gateListeners.add(check); signal?.addEventListener('abort', check, { once: true }); check();
  });
}
export async function runPausablePull<T>(request: (signal: AbortSignal) => Promise<T>, options?: { ignorePause?: boolean; live?: boolean; provider?: PullProvider; automatic?: boolean; signal?: AbortSignal }): Promise<T> {
  const lane = !options?.live ? scheduler : options.provider === 'youtube' ? youtubeLiveScheduler : options.provider === 'twitch' ? twitchLiveScheduler : liveScheduler;
  return lane.run(request, { ...options, canStart: options?.automatic && !options.live ? () => automaticPullAvailable(options.provider) : undefined, deferWhenBlocked: options?.automatic && !options.live });
}
