export type InteractionKind = "navigation" | "search" | "rating" | "playback" | "queue";

type InteractionSample = { count: number; lastMs: number; worstMs: number; at: number };

const samples: Record<InteractionKind, InteractionSample> = {
  navigation: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
  search: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
  rating: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
  playback: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
  queue: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
};
const lastStarted: Partial<Record<InteractionKind, number>> = {};
/**
 * Keep opportunistic work out of the short interval where a click, key press,
 * or player command needs to paint. This is deliberately a lease rather than
 * a permanent "busy" flag: enrichment still catches up as soon as the user
 * pauses, without competing with a burst of visible-card actions.
 */
export const INTERACTION_PRIORITY_WINDOW_MS = 240;
let interactionPriorityUntil = 0;

/** Pure helper so the foreground lease can be verified without browser time. */
export function interactionPriorityDelay(now: number, priorityUntil: number) {
  return Math.max(0, Math.ceil(priorityUntil - now));
}

/** Remaining time before background work may resume. */
export function getInteractionPriorityDelay() {
  if (typeof performance === "undefined") return 0;
  return interactionPriorityDelay(performance.now(), interactionPriorityUntil);
}

type BackgroundWorkOptions = {
  /** Browser idle timeout; it is a liveness backstop, never a reason to preempt input. */
  timeoutMs?: number;
  /** Deterministic fallback for browsers without requestIdleCallback. */
  fallbackDelayMs?: number;
};

/**
 * Schedule discardable local work behind current interaction, first paint, and
 * hidden-tab time. Callers retain cancellation on dependency changes, so an
 * obsolete index/ranking pass never gets a chance to contend with the latest
 * visible shelf.
 */
export function scheduleBackgroundWork(work: () => void, options: BackgroundWorkOptions = {}) {
  if (typeof window === "undefined") return () => {};

  let cancelled = false;
  let idle: number | undefined;
  let timer: number | undefined;
  let waitingForVisibility = false;
  const timeoutMs = options.timeoutMs ?? 1_000;
  const fallbackDelayMs = options.fallbackDelayMs ?? 0;

  const clearPending = () => {
    if (typeof idle === "number") window.cancelIdleCallback?.(idle);
    if (typeof timer !== "undefined") window.clearTimeout(timer);
    idle = undefined;
    timer = undefined;
    if (waitingForVisibility) {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      waitingForVisibility = false;
    }
  };
  const schedule = () => {
    clearPending();
    if (cancelled) return;
    const delay = getInteractionPriorityDelay();
    if (delay > 0) {
      timer = window.setTimeout(schedule, delay);
      return;
    }
    if (document.visibilityState === "hidden") {
      waitingForVisibility = true;
      document.addEventListener("visibilitychange", onVisibilityChange);
      return;
    }
    const run = () => {
      idle = undefined;
      timer = undefined;
      if (cancelled) return;
      // An input may arrive after idle time was granted. Re-check at the
      // boundary rather than letting its timeout compete with the next paint.
      if (getInteractionPriorityDelay() > 0 || document.visibilityState === "hidden") {
        schedule();
        return;
      }
      work();
    };
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(run, { timeout: timeoutMs });
    } else {
      timer = window.setTimeout(run, fallbackDelayMs);
    }
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") schedule();
  };

  schedule();
  return () => {
    cancelled = true;
    clearPending();
  };
}

/** Records a local input-to-next-paint approximation without collecting media data. */
export function measureInteraction(kind: InteractionKind) {
  if (typeof window === "undefined" || typeof performance === "undefined") return;
  const now = performance.now();
  interactionPriorityUntil = Math.max(interactionPriorityUntil, now + INTERACTION_PRIORITY_WINDOW_MS);
  // A held key or repeated pointer event should not flood the diagnostic sample.
  if (now - (lastStarted[kind] ?? -Infinity) < 120) return;
  lastStarted[kind] = now;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    const elapsed = Math.round(performance.now() - now);
    const sample = samples[kind];
    sample.count += 1;
    sample.lastMs = elapsed;
    sample.worstMs = Math.max(sample.worstMs, elapsed);
    sample.at = Date.now();
  }));
}

export function getInteractionBudgetSnapshot() {
  return Object.fromEntries(Object.entries(samples).map(([kind, sample]) => [kind, { ...sample }])) as Record<InteractionKind, InteractionSample>;
}
