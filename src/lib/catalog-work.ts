/** Run catalog work in small tasks. Callers provide their visibility/input/
 * cancellation gate; the generic helper holds no catalog-wide lookup cache. */
export async function forEachCatalogSlice<T>(rows: readonly T[], visit: (row: T, index: number) => void,
  turn: () => Promise<void>) {
  for (let offset = 0; offset < rows.length;) {
    await turn();
    const started = performance.now(), end = Math.min(rows.length, offset + 512);
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
  let visited = 0, started = performance.now();
  await turn();
  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    Object.defineProperty(copy, key, { value: source[key], writable: true, enumerable: true, configurable: true });
    if (++visited >= 512 || performance.now() - started >= 4) {
      await turn(); visited = 0; started = performance.now();
    }
  }
  return copy;
}
/** Copy references without one catalog-sized synchronous slice on ingest. */
export async function copyCatalogArray<T>(source: readonly T[], turn: () => Promise<void>): Promise<T[]> {
  const copy = new Array<T>(source.length);
  await forEachCatalogSlice(source, (row, index) => { copy[index] = row; }, turn);
  return copy;
}
/** Native background tasks avoid the nested setTimeout clamp while still
 * allowing rendering and input between slices. Older browsers use a timer. */
export function yieldCatalogTask(): Promise<void> {
  const scheduler = (globalThis as unknown as { scheduler?: { postTask: (work: () => void, options: { priority: string }) => Promise<void> } }).scheduler;
  return scheduler ? scheduler.postTask(() => {}, { priority: 'background' }) : new Promise(resolve => setTimeout(resolve, 0));
}

