import { takeBestMapped } from './bounded-picks.ts';
/** Share the bounded heap used by other shelves; sort only the visible window. */
export function bestRanked<T>(rows: Iterable<T>, limit: number, compare: (left: T, right: T) => number): T[] {
  if (!Number.isFinite(limit) || limit < 1) return [];
  return takeBestMapped(rows, Math.floor(limit), row => row, compare);
}
