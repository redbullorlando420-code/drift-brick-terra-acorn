import { yieldCatalogTask } from './catalog-work.ts';
import { getInteractionPriorityDelay } from './interaction-budget.ts';

/** A hidden destination pauses its one preparation task without timer polling.
 * Navigation/unmount cancellation releases the visibility waiter immediately. */
export async function yieldNavigationTask(signal: AbortSignal, yieldTask = yieldCatalogTask) {
  signal.throwIfAborted();
  await yieldTask();
  signal.throwIfAborted();
  // Yielding once is not enough during a burst of clicks or typing. Keep
  // subsequent catalog slices behind the short foreground input lease.
  while (getInteractionPriorityDelay() > 0) {
    await new Promise<void>((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(signal.reason); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, getInteractionPriorityDelay());
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) { signal.removeEventListener('abort', abort); abort(); }
    });
    signal.throwIfAborted();
  }
  if (typeof document === 'undefined' || document.visibilityState !== 'hidden') return;
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => { document.removeEventListener('visibilitychange', visible); signal.removeEventListener('abort', abort); };
    const visible = () => { if (document.visibilityState !== 'hidden') { cleanup(); resolve(); } };
    const abort = () => { cleanup(); reject(signal.reason); };
    document.addEventListener('visibilitychange', visible);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort(); else visible();
  });
  signal.throwIfAborted();
}

/** Destination controls get a painted frame before catalog selectors run.
 * A second frame crosses the paint boundary; a task after it keeps the work
 * outside the animation callback. There is no arbitrary navigation cooldown. */
export function scheduleNavigationWork(work: () => void) {
  if (typeof window === 'undefined') return () => {};
  let cancelled = false;
  let frame: number | undefined;
  let timer: number | undefined;
  const clear = () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    if (timer !== undefined) window.clearTimeout(timer);
    frame = timer = undefined;
  };
  const start = () => {
    clear();
    if (cancelled || document.visibilityState === 'hidden') return;
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        timer = window.setTimeout(() => {
          timer = undefined;
          if (!cancelled && document.visibilityState !== 'hidden') {
            document.removeEventListener('visibilitychange', visibility);
            work();
          }
        }, 0);
      });
    });
  };
  const visibility = () => {
    if (document.visibilityState === 'hidden') clear();
    else start();
  };
  document.addEventListener('visibilitychange', visibility);
  start();
  return () => {
    cancelled = true;
    clear();
    document.removeEventListener('visibilitychange', visibility);
  };
}
