import { createIdleQueue } from './idle-queue.ts';
import { getInteractionPriorityDelay, prioritizeInteraction, scheduleBackgroundWork } from './interaction-budget.ts';

let viewerOpen = false, pageSuspended = false;
let wakeQueue: ((interrupt?: boolean) => void) | undefined;
function idleTurn(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { cancel(); signal.removeEventListener('abort', abort); reject(signal.reason); };
    const cancel = scheduleBackgroundWork(() => { signal.removeEventListener('abort', abort); resolve(); }, { timeoutMs: 2_000, fallbackDelayMs: 16 });
    signal.addEventListener('abort', abort, { once: true }); if (signal.aborted) abort();
  });
}
export const idleEnrichment = createIdleQueue({
  allowed: () => typeof document !== 'undefined' && !document.hidden && !viewerOpen && !pageSuspended,
  start: idleTurn,
  turn: signal => {
    signal.throwIfAborted();
    if (getInteractionPriorityDelay() > 0) return idleTurn(signal);
    const scheduler = (globalThis as unknown as { scheduler?: { postTask(work: () => void, options: { priority: string; signal: AbortSignal }): Promise<void> } }).scheduler;
    if (scheduler) return scheduler.postTask(() => {}, { priority: 'background', signal });
    return new Promise<void>((resolve, reject) => {
      const abort = () => { window.clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason); };
      const timer = window.setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, 0);
      signal.addEventListener('abort', abort, { once: true }); if (signal.aborted) abort();
    });
  },
  subscribe: wake => {
    if (typeof window === 'undefined') return () => {};
    pageSuspended = false;
    wakeQueue = wake;
    const visibility = () => wake(true);
    const input = () => { prioritizeInteraction(); wake(true); };
    const hide = () => { pageSuspended = true; wake(true); };
    const show = () => { pageSuspended = false; wake(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', hide); window.addEventListener('pageshow', show);
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    for (const event of events) window.addEventListener(event, input, { passive: true });
    return () => {
      wakeQueue = undefined;
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show);
      for (const event of events) window.removeEventListener(event, input);
    };
  },
});
export function setEnrichmentViewerOpen(open: boolean) {
  if (viewerOpen === open) return;
  viewerOpen = open; wakeQueue?.(true);
}
import.meta.hot?.dispose(() => idleEnrichment.dispose());
