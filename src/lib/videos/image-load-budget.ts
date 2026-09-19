/**
 * Bound concurrent remote thumbnail fetches so Adults shelves do not stall
 * scroll with hundreds of parallel CDN requests / retries.
 * Visible cards use a high-priority lane; speculative/offscreen work waits.
 */

export type ImageSlotPriority = "high" | "low";

let active = 0;
const waitingHigh: Array<() => void> = [];
const waitingLow: Array<() => void> = [];
/** Default ceiling — aggressive enough that dense Adult rails stay scrollable. */
const MAX_CONCURRENT = 12;
/** Reserve a few slots so visible cards are not starved by speculative warm. */
const HIGH_RESERVED = 4;

function maxConcurrent() {
  const nav = typeof navigator !== "undefined"
    ? (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string; downlink?: number }; deviceMemory?: number; hardwareConcurrency?: number })
    : undefined;
  if (nav?.connection?.saveData) return 3;
  if (nav?.deviceMemory && nav.deviceMemory <= 2) return 4;
  if (nav?.deviceMemory && nav.deviceMemory <= 4) return 6;
  if (nav?.hardwareConcurrency && nav.hardwareConcurrency <= 4) return 6;
  const type = nav?.connection?.effectiveType;
  if (type === "slow-2g" || type === "2g") return 3;
  if (type === "3g") return 6;
  if (typeof nav?.connection?.downlink === "number" && nav.connection.downlink > 0 && nav.connection.downlink < 1.5) return 6;
  return MAX_CONCURRENT;
}

function wakeNext() {
  const next = waitingHigh.shift() ?? waitingLow.shift();
  if (next) next();
}

function canStart(priority: ImageSlotPriority) {
  const max = maxConcurrent();
  if (active >= max) return false;
  if (priority === "high") return true;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return false;
  // Leave headroom for visible cards when the high lane has waiters.
  if (waitingHigh.length > 0 && active >= Math.max(1, max - HIGH_RESERVED)) return false;
  return true;
}

export async function acquireImageSlot(opts?: { priority?: ImageSlotPriority; signal?: AbortSignal }): Promise<() => void> {
  const signal = opts?.signal;
  if (signal?.aborted) return () => {};
  const priority: ImageSlotPriority = opts?.priority ?? "low";
  const queue = priority === "high" ? waitingHigh : waitingLow;
  while (!canStart(priority)) {
    if (priority === "low" && typeof document !== "undefined" && document.visibilityState === "hidden") {
      await new Promise<void>((resolve) => {
        const done = () => { signal?.removeEventListener("abort", done); document.removeEventListener("visibilitychange", onVis); resolve(); };
        const onVis = () => { if (document.visibilityState === "visible") done(); };
        document.addEventListener("visibilitychange", onVis);
        signal?.addEventListener("abort", done, { once: true });
      });
      if (signal?.aborted) return () => {};
      continue;
    }
    await new Promise<void>((resolve) => {
      const wake = () => { signal?.removeEventListener("abort", cancel); resolve(); };
      const cancel = () => { const index = queue.indexOf(wake); if (index >= 0) queue.splice(index, 1); wake(); };
      queue.push(wake);
      signal?.addEventListener("abort", cancel, { once: true });
    });
    if (signal?.aborted) { wakeNext(); return () => {}; }
  }
  active += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    active = Math.max(0, active - 1);
    wakeNext();
  };
}

/** Optional diagnostics for the local render budget panel. */
export function getImageLoadBudgetSnapshot() {
  return {
    active,
    queued: waitingHigh.length + waitingLow.length,
    queuedHigh: waitingHigh.length,
    queuedLow: waitingLow.length,
    max: maxConcurrent(),
  };
}

/** Drop speculative decode waiters (keeps high-priority visible cards). */
export function clearLowPriorityImageQueue() {
  const pending = waitingLow.splice(0, waitingLow.length);
  for (const wake of pending) wake();
}

let visibilityHooked = false;
/** Pause speculative image work while the tab is hidden. */
export function ensureImageBudgetVisibilityHook() {
  if (visibilityHooked || typeof document === "undefined") return;
  visibilityHooked = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") clearLowPriorityImageQueue();
  });
}
