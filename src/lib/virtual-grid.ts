/** Sparse row geometry: retain recent measurements, never one entry per title. */
export class GridRowMetrics {
  private heights = new Map<number, number>();
  private ordered: Array<{ row: number; delta: number }> = [];
  private dirty = false;
  estimate: number;
  private capacity: number;
  constructor(estimate: number, capacity = 512) { this.estimate = estimate; this.capacity = capacity; }

  get measuredRows() { return this.heights.size; }

  measure(row: number, height: number) {
    if (row < 0 || !Number.isFinite(height) || height <= 0) return false;
    const rounded = Math.round(height * 2) / 2;
    if (this.heights.get(row) === rounded) return false;
    this.heights.delete(row);
    this.heights.set(row, rounded);
    while (this.heights.size > this.capacity) this.heights.delete(this.heights.keys().next().value!);
    this.dirty = true;
    return true;
  }

  offset(row: number) {
    if (this.dirty) {
      let delta = 0;
      this.ordered = [...this.heights].sort(([a], [b]) => a - b).map(([index, height]) => ({ row: index, delta: delta += height - this.estimate }));
      this.dirty = false;
    }
    let lo = 0, hi = this.ordered.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.ordered[mid]!.row < row) lo = mid + 1;
      else hi = mid;
    }
    return Math.max(0, row) * this.estimate + (lo ? this.ordered[lo - 1]!.delta : 0);
  }

  rowAt(offset: number, rows: number) {
    let lo = 0, hi = Math.max(0, rows - 1);
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (this.offset(mid) <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }
}

export type GridWindow = { start: number; end: number; lead: number; tail: number };
export const GRID_MOUNT_CAP = 108;

/** Both directions use the same bounded window, including after a long scroll. */
export function gridWindow(length: number, columns: number, top: number, viewport: number, metrics: GridRowMetrics): GridWindow {
  columns = Math.max(1, Math.floor(columns));
  const rows = Math.ceil(length / columns);
  if (!rows) return { start: 0, end: 0, lead: 0, tail: 0 };
  const first = metrics.rowAt(Math.max(0, top), rows);
  const last = metrics.rowAt(Math.max(0, top + viewport), rows);
  const capacity = Math.max(1, Math.floor(GRID_MOUNT_CAP / columns));
  const startRow = Math.max(0, first - 2);
  const endRow = Math.min(rows, startRow + capacity, Math.max(first + 1, last + 3));
  return { start: startRow * columns, end: Math.min(length, endRow * columns), lead: metrics.offset(startRow), tail: metrics.offset(rows) - metrics.offset(endRow) };
}
