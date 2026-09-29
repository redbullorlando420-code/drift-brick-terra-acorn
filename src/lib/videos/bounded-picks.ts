/** Return the best few rows without retaining or sorting a huge candidate list.
 * `compare(a, b) < 0` means a should appear before b. */
export function takeBestMapped<T, R>(items: Iterable<T>, limit: number, project: (item: T) => R | null, compare: (a: R, b: R) => number): R[] {
  if (limit <= 0) return [];
  const heap: R[] = [];
  for (const item of items) {
    const row = project(item);
    if (row == null) continue;
    if (heap.length < limit) {
      heap.push(row);
      let child = heap.length - 1;
      while (child > 0) {
        const parent = Math.floor((child - 1) / 2);
        if (compare(heap[parent], heap[child]) >= 0) break;
        [heap[parent], heap[child]] = [heap[child], heap[parent]];
        child = parent;
      }
      continue;
    }
    if (compare(row, heap[0]) >= 0) continue;
    heap[0] = row;
    let parent = 0;
    while (true) {
      const left = parent * 2 + 1;
      if (left >= heap.length) break;
      const right = left + 1;
      const worse = right < heap.length && compare(heap[right], heap[left]) > 0 ? right : left;
      if (compare(heap[parent], heap[worse]) >= 0) break;
      [heap[parent], heap[worse]] = [heap[worse], heap[parent]];
      parent = worse;
    }
  }
  return heap.sort(compare);
}

export function* concatIterables<T>(...sources: Iterable<T>[]): Iterable<T> {
  for (const source of sources) yield* source;
}
