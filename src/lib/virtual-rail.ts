export type RailWindow = {
  start: number;
  end: number;
  visibleSlots: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

/** Calculate the only contiguous card window that needs to be mounted. */
export function railWindow(length: number, width: number, stride: number, requestedStart: number, overscan = 1): RailWindow {
  const visibleSlots = Math.max(3, Math.ceil(Math.max(320, width) / stride) + overscan * 2);
  const maxStart = Math.max(0, length - visibleSlots);
  const start = clamp(requestedStart, 0, maxStart);
  return { start, end: Math.min(length, start + visibleSlots), visibleSlots };
}

/** Resolve only the mounted window. A logical End jump must never copy the
 * prefix of a large catalog just to discard it immediately afterwards. */
export function railItems<T>(items: readonly T[], limit: number, width: number, stride: number, requestedStart: number, overscan = 1) {
  const loaded = Math.min(items.length, Math.max(0, limit));
  const window = railWindow(loaded, width, stride, requestedStart, overscan);
  return { ...window, loaded, items: items.slice(window.start, window.end) };
}

/** Tab entry from another surface lands inside the current window; Tab exit
 * from a card walks the adjacent unmounted title, in either direction. */
export function windowBoundaryTarget(side: 'previous' | 'next', start: number, end: number, length: number, fromCard: boolean) {
  if (start === end && length > 0) return Math.min(length - 1, Math.max(0, start));
  const target = side === 'previous' ? start - (fromCard ? 1 : 0) : end - (fromCard ? 0 : 1);
  return target >= 0 && target < length ? target : null;
}

/** Pick a valid card target for the rail's explicit keyboard controls. */
export function railKeyboardTarget(key: string, current: number, length: number): number | null {
  if (!length || current < 0 || current >= length) return null;
  if (key === "ArrowLeft") return current > 0 ? current - 1 : null;
  if (key === "ArrowRight") return current < length - 1 ? current + 1 : null;
  if (key === "Home") return current === 0 ? null : 0;
  if (key === "End") return current === length - 1 ? null : length - 1;
  return null;
}

/** Center a requested card where possible, retaining a small overscan buffer. */
export function railWindowStartForTarget(target: number, length: number, visibleSlots: number, overscan = 1): number {
  const maxStart = Math.max(0, length - visibleSlots);
  return clamp(target - Math.max(overscan, Math.floor(visibleSlots / 2)), 0, maxStart);
}

/** Expand the logical rail only as far as a requested keyboard target needs. */
export function railLimitForTarget(limit: number, target: number, length: number, pageSize = 16): number {
  if (target < limit) return limit;
  return Math.min(length, Math.max(limit + pageSize, target + 1));
}
