/**
 * Bound concurrent remote thumbnail fetches so Adults shelves do not stall
 * scroll with hundreds of parallel CDN requests / retries.
 * Visible cards use a high-priority lane; speculative/offscreen work waits.
 */

import { getInteractionPriorityDelay } from "../interaction-budget.ts";

export type ImageSlotPriority = "high" | "low";

let active = 0;
let artworkSuppressed = false;
const suppressionListeners = new Set<() => void>();
type Waiter = { resolve: (release: (() => void) | null) => void; signal?: AbortSignal; cancel: () => void };
const waitingHigh: Waiter[] = [];
const waitingLow: Waiter[] = [];
let interactionTimer: ReturnType<typeof setTimeout> | undefined;
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

function settle(waiter: Waiter, release: (() => void) | null) {
  waiter.signal?.removeEventListener("abort", waiter.cancel);
  waiter.resolve(release);
}

/** Reserve capacity synchronously before resolving promises. Refilling the
 * whole budget avoids serial loading after a viewer/visibility pause. */
function pump() {
  if (interactionTimer !== undefined) { clearTimeout(interactionTimer); interactionTimer = undefined; }
  if (artworkSuppressed || typeof document !== "undefined" && document.visibilityState === "hidden") return;
  const max = maxConcurrent();
  while (active < max) {
    let waiter = waitingHigh.shift();
    if (!waiter) {
      // Nearby cards must leave real capacity for newly visible cards.
      if (!waitingLow.length || active >= Math.max(1, max - HIGH_RESERVED)) return;
      const delay = getInteractionPriorityDelay();
      if (delay > 0) { interactionTimer = setTimeout(pump, delay); return; }
      waiter = waitingLow.shift()!;
    }
    if (waiter.signal?.aborted) { settle(waiter, null); continue; }
    active += 1;
    let released = false;
    settle(waiter, () => {
      if (released) return;
      released = true;
      active -= 1;
      pump();
    });
  }
}

/** Hold new thumbnail work while a preview/player is opening or visible. */
export function setArtworkSuppressed(value: boolean) {
  if (artworkSuppressed === value) return;
  artworkSuppressed = value;
  for (const listener of suppressionListeners) listener();
  pump();
}

export function isArtworkSuppressed() { return artworkSuppressed; }
/** Shared background schedulers can pause without subscribing every card. */
export function subscribeArtworkSuppression(listener: () => void) {
  suppressionListeners.add(listener);
  return () => { suppressionListeners.delete(listener); };
}

export function acquireImageSlot(opts?: { priority?: ImageSlotPriority; signal?: AbortSignal }): Promise<(() => void) | null> {
  const signal = opts?.signal;
  if (signal?.aborted) return Promise.resolve(null);
  ensureImageBudgetVisibilityHook();
  const priority: ImageSlotPriority = opts?.priority ?? "low";
  const queue = priority === "high" ? waitingHigh : waitingLow;
  return new Promise(resolve => {
    const waiter: Waiter = { resolve, signal, cancel: () => {
      const index = queue.indexOf(waiter);
      if (index < 0) return;
      queue.splice(index, 1);
      settle(waiter, null);
      pump();
    } };
    queue.push(waiter);
    signal?.addEventListener("abort", waiter.cancel, { once: true });
    pump();
  });
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
  for (const waiter of pending) settle(waiter, null);
  pump();
}

let visibilityHooked = false;
/** One shared visibility listener, instead of one listener per waiting card. */
export function ensureImageBudgetVisibilityHook() {
  if (visibilityHooked || typeof document === "undefined") return;
  visibilityHooked = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") clearLowPriorityImageQueue();
    else pump();
  });
}
