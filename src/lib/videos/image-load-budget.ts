/**
 * Bound concurrent remote thumbnail fetches so Adults shelves do not stall
 * scroll with hundreds of parallel CDN requests / retries.
 */

let active = 0;
const waiting: Array<() => void> = [];
const MAX_CONCURRENT = 8;

function maxConcurrent() {
  const nav = typeof navigator !== "undefined"
    ? (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number })
    : undefined;
  if (nav?.connection?.saveData) return 3;
  if (nav?.deviceMemory && nav.deviceMemory <= 2) return 4;
  const type = nav?.connection?.effectiveType;
  if (type === "slow-2g" || type === "2g") return 3;
  if (type === "3g") return 5;
  return MAX_CONCURRENT;
}

export async function acquireImageSlot(): Promise<() => void> {
  while (active >= maxConcurrent()) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  active += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    active = Math.max(0, active - 1);
    const next = waiting.shift();
    if (next) next();
  };
}

/** Optional diagnostics for the local render budget panel. */
export function getImageLoadBudgetSnapshot() {
  return { active, queued: waiting.length, max: maxConcurrent() };
}
