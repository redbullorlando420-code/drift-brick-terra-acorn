/**
 * Bound concurrent remote thumbnail fetches so Adults shelves do not stall
 * scroll with hundreds of parallel CDN requests / retries.
 * Visible cards use a high-priority lane; speculative/offscreen work waits.
 */

import { getInteractionPriorityDelay, prioritizeInteraction } from "../interaction-budget.ts";
import { getPerformanceProfile, subscribePerformanceProfile } from '../performance-profile.ts';

export type ImageSlotPriority = "high" | "low";

let artworkSuppressed = false;
let pageSuspended = false;
const suppressionListeners = new Set<() => void>();
type Waiter = { resolve?: (release: (() => void) | null) => void; notify?: (allowed: boolean) => void;
  priority: ImageSlotPriority; signal?: AbortSignal; cancel: () => void; ended: boolean };
const waitingHigh: Waiter[] = [];
const waitingLow: Waiter[] = [];
const activeSlots = new Set<Waiter>();
let interactionTimer: ReturnType<typeof setTimeout> | undefined;
/** Default ceiling — aggressive enough that dense Adult rails stay scrollable. */
const MAX_CONCURRENT = 12;
/** Reserve a few slots so visible cards are not starved by speculative warm. */
const HIGH_RESERVED = 4;

function maxConcurrent() {
  return Math.min(getPerformanceProfile().imageRequests, deviceConcurrent());
}
function deviceConcurrent() {
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

function end(waiter: Waiter) {
  if (waiter.ended) return;
  waiter.ended = true;
  waiter.signal?.removeEventListener('abort', waiter.cancel);
  const queue = waiter.priority === 'high' ? waitingHigh : waitingLow;
  const index = queue.indexOf(waiter);
  if (index >= 0) queue.splice(index, 1);
  const admitted = activeSlots.delete(waiter);
  if (admitted) waiter.notify?.(false);
  else waiter.resolve?.(null);
  pump();
}

function suspended() {
  return artworkSuppressed || pageSuspended || typeof document !== 'undefined' && document.visibilityState === 'hidden';
}
function suspendActiveCards() {
  // Legacy one-shot callers own their release. Card subscriptions can revoke
  // admission, removing unfinished DOM images without marking a URL failed.
  for (const waiter of [...activeSlots]) {
    if (!waiter.notify) continue;
    activeSlots.delete(waiter);
    (waiter.priority === 'high' ? waitingHigh : waitingLow).push(waiter);
    waiter.notify(false);
  }
}

/** Reserve capacity synchronously before resolving promises. Refilling the
 * whole budget avoids serial loading after a viewer/visibility pause. */
function pump() {
  if (interactionTimer !== undefined) { clearTimeout(interactionTimer); interactionTimer = undefined; }
  if (suspended()) { suspendActiveCards(); return; }
  const max = maxConcurrent();
  while (activeSlots.size < max && (waitingHigh.length || waitingLow.length)) {
    // A newly visible rail can enqueue every image on the navigation click.
    // Give its controls/player a paint before starting that network burst.
    const delay = getInteractionPriorityDelay();
    if (delay > 0) { interactionTimer = setTimeout(pump, delay); return; }
    let waiter = waitingHigh.shift();
    if (!waiter) {
      // Nearby cards must leave real capacity for newly visible cards.
      if (!waitingLow.length || activeSlots.size >= Math.max(1, max - HIGH_RESERVED)) return;
      waiter = waitingLow.shift()!;
    }
    if (waiter.ended || waiter.signal?.aborted) { end(waiter); continue; }
    activeSlots.add(waiter);
    if (waiter.notify) waiter.notify(true);
    else {
      waiter.signal?.removeEventListener('abort', waiter.cancel);
      waiter.resolve?.(() => end(waiter));
    }
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
    const waiter: Waiter = { resolve, signal, priority, ended: false, cancel: () => end(waiter) };
    queue.push(waiter);
    signal?.addEventListener("abort", waiter.cancel, { once: true });
    pump();
  });
}

/** One revocable card lease. Opening a viewer or hiding the page withdraws
 * unfinished images; the same subscribed card resumes when the gate opens.
 * Completion/unmount cancels the lease and all of its retained callbacks. */
export function watchImageSlot(opts: { priority?: ImageSlotPriority; signal?: AbortSignal }, notify: (allowed: boolean) => void) {
  if (opts.signal?.aborted) return () => {};
  ensureImageBudgetVisibilityHook();
  const priority = opts.priority ?? 'low';
  const waiter: Waiter = { signal: opts.signal, priority, ended: false, notify, cancel: () => end(waiter) };
  (priority === 'high' ? waitingHigh : waitingLow).push(waiter);
  opts.signal?.addEventListener('abort', waiter.cancel, { once: true });
  pump();
  return waiter.cancel;
}

/** Optional diagnostics for the local render budget panel. */
export function getImageLoadBudgetSnapshot() {
  return {
    active: activeSlots.size,
    queued: waitingHigh.length + waitingLow.length,
    queuedHigh: waitingHigh.length,
    queuedLow: waitingLow.length,
    max: maxConcurrent(),
  };
}

/** Drop one-shot speculative requests. Mounted card subscriptions remain
 * queued across visibility pauses so nearby cards can resume without scrolling.
 * Their owner cancels them when the card leaves the nearby window or unmounts. */
export function clearLowPriorityImageQueue() {
  const pending = waitingLow.filter(waiter => !waiter.notify);
  for (const waiter of pending) end(waiter);
  pump();
}

let visibilityHooked = false;
let stopVisibility: (() => void) | undefined;
/** One shared visibility listener, instead of one listener per waiting card. */
export function ensureImageBudgetVisibilityHook() {
  if (visibilityHooked || typeof document === "undefined") return;
  visibilityHooked = true;
  const stopProfile = subscribePerformanceProfile(pump);
  const onVisibility = () => {
    if (document.visibilityState === "hidden") { suspendActiveCards(); clearLowPriorityImageQueue(); }
    else pump();
  };
  const hide = () => { pageSuspended = true; pump(); };
  const show = () => { pageSuspended = false; pump(); };
  const input = () => { prioritizeInteraction(); pump(); };
  const inputEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'touchmove'] as const;
  document.addEventListener("visibilitychange", onVisibility);
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', hide); window.addEventListener('pageshow', show);
    for (const event of inputEvents) window.addEventListener(event, input, { passive: true });
  }
  stopVisibility = () => {
    document.removeEventListener('visibilitychange', onVisibility);
    if (typeof window !== 'undefined') {
      window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show);
      for (const event of inputEvents) window.removeEventListener(event, input);
    }
    stopProfile(); visibilityHooked = false;
  };
}
import.meta.hot?.dispose(() => {
  stopVisibility?.();
  pageSuspended = true;
  if (interactionTimer !== undefined) clearTimeout(interactionTimer);
  for (const waiter of [...waitingHigh, ...waitingLow, ...activeSlots]) end(waiter);
});
