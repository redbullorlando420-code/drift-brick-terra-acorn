import { sparseRecordScan } from './sparse-record.ts';

/** Run catalog work in small tasks. Callers provide their visibility/input/
 * cancellation gate; the generic helper holds no catalog-wide lookup cache. */
export async function forEachCatalogSlice<T>(rows: ArrayLike<T>, visit: (row: T, index: number) => void,
  turn: () => Promise<void>, maxRowsPerSlice = 512) {
  for (let offset = 0; offset < rows.length;) {
    await turn();
    const started = performance.now(), end = Math.min(rows.length, offset + maxRowsPerSlice);
    for (; offset < end; offset++) {
      visit(rows[offset]!, offset);
      if (performance.now() - started >= 4) { offset++; break; }
    }
  }
}

/** Immutable record copies also yield; spreading a 100k-entry tag map inside
 * a Zustand update blocks every subscriber and incoming click. */
export async function copyCatalogRecord<T>(source: Record<string, T>, turn: () => Promise<void>): Promise<Record<string, T>> {
  const copy: Record<string, T> = {};
  // Object enumeration exports/sorts an entire sparse patch tree before yielding.
  await forEachCatalogEntry(sparseRecordScan(source), row => {
    if (row) Object.defineProperty(copy, row[0], { value: row[1], writable: true, enumerable: true, configurable: true });
  }, turn);
  return copy;
}
/** Copy references without one catalog-sized synchronous slice on ingest. */
export async function copyCatalogArray<T>(source: readonly T[], turn: () => Promise<void>): Promise<T[]> {
  const copy = new Array<T>(source.length);
  await forEachCatalogSlice(source, (row, index) => { copy[index] = row; }, turn);
  return copy;
}
/** Materialize Map/Set iterators without one synchronous spread at the end
 * of a paged disk read. The result holds references, not cloned records. */
export async function collectCatalogRows<T>(source: Iterable<T>, turn = yieldCatalogTask): Promise<T[]> {
  const rows: T[] = [];
  await forEachCatalogEntry(source, row => { rows.push(row); }, turn);
  return rows;
}
/** Visit sparse changes without first spreading a large Map into an array. */
export async function forEachCatalogEntry<T>(source: Iterable<T>, visit: (row: T) => void, turn = yieldCatalogTask) {
  await turn();
  let visited = 0, started = performance.now();
  for (const row of source) {
    visit(row);
    if (++visited >= 512 || performance.now() - started >= 4) {
      await turn(); visited = 0; started = performance.now();
    }
  }
}
/** Native background tasks avoid the nested setTimeout clamp while still
 * allowing rendering and input between slices. Older browsers use a timer. */
export function yieldCatalogTask(): Promise<void> {
  const scheduler = (globalThis as unknown as { scheduler?: { postTask: (work: () => void, options: { priority: string }) => Promise<void> } }).scheduler;
  return scheduler ? scheduler.postTask(() => {}, { priority: 'background' }) : new Promise(resolve => setTimeout(resolve, 0));
}

/** Stable sorting must yield inside the final large merge as well as between
 * passes. Callers supply a cancellation-aware task boundary. */
export async function sortCatalogRows<T>(rows: T[], compare: (a: T, b: T) => number, turn: () => Promise<void>, maxRowsPerSlice = 2048) {
  let source = rows, target = new Array<T>(rows.length), visited = 0, started = performance.now();
  for (let width = 1; width < rows.length; width *= 2) {
    for (let left = 0; left < rows.length; left += width * 2) {
      const middle = Math.min(left + width, rows.length), right = Math.min(left + width * 2, rows.length);
      let a = left, b = middle;
      for (let out = left; out < right; out++) {
        target[out] = a < middle && (b >= right || compare(source[a]!, source[b]!) <= 0) ? source[a++]! : source[b++]!;
        if (++visited >= maxRowsPerSlice || (visited % 64 === 0 && performance.now() - started >= 4)) {
          await turn(); visited = 0; started = performance.now();
        }
      }
    }
    [source, target] = [target, source];
  }
  return source;
}

