/** One compact shuffle vector and a bounded fair prefix per ranking session.
 * Catalog rows stay immutable; heaps carry numeric offsets, not copied rows. */
export const RANKED_PREFIX_LIMIT = 4096;
const PREFIX_BLOCK = 384;
export type CreatorRankedRow<T> = { video: T; score: number; creator: string; publishedAt: number };

function keepBest(heap: number[], index: number, limit: number, compare: (a: number, b: number) => number) {
  if (heap.length < limit) {
    heap.push(index);
    let child = heap.length - 1;
    while (child > 0) {
      const parent = (child - 1) >>> 1;
      if (compare(heap[parent], heap[child]) >= 0) break;
      [heap[parent], heap[child]] = [heap[child], heap[parent]];
      child = parent;
    }
  } else if (compare(index, heap[0]) < 0) {
    heap[0] = index;
    let parent = 0;
    while (parent * 2 + 1 < heap.length) {
      const left = parent * 2 + 1, right = left + 1;
      const child = right < heap.length && compare(heap[left], heap[right]) < 0 ? right : left;
      if (compare(heap[parent], heap[child]) >= 0) break;
      [heap[parent], heap[child]] = [heap[child], heap[parent]];
      parent = child;
    }
  }
}

/** Shuffle callbacks identify immutable mixes. Replace the callback for a new
 * seed; the previous vector/prefix is released rather than caching every mix. */
export function createCreatorRankedPages<T extends { id: string }>(rows: CreatorRankedRow<T>[]) {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.creator, (counts.get(row.creator) ?? 0) + 1);
  let cache: { shuffle: ((id: string) => number) | undefined; values: Float64Array; creators: string[]; prefix: T[] } | undefined;
  return (shuffle: ((id: string) => number) | undefined, offset: number, limit: number): T[] => {
    const end = Math.min(rows.length, offset + limit);
    if (!limit || offset >= rows.length) return [];
    if (!cache || cache.shuffle !== shuffle) {
      // A reshuffle overwrites one vector. Allocating a new catalog-sized
      // buffer per mix made memory depend on external-buffer GC timing.
      const values = cache?.values ?? new Float64Array(rows.length), leaders = new Map<string, number>();
      const compare = (a: number, b: number) => rows[b].score - rows[a].score || values[a] - values[b] || rows[b].publishedAt - rows[a].publishedAt;
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        values[index] = shuffle?.(row.video.id) ?? 0;
        const leader = leaders.get(row.creator);
        if (leader === undefined || compare(index, leader) < 0) leaders.set(row.creator, index);
      }
      const creators = [...leaders.keys()].sort((a, b) => compare(leaders.get(a)!, leaders.get(b)!) || a.localeCompare(b));
      cache = { shuffle, values, creators, prefix: [] };
    }
    if (end <= cache.prefix.length) return cache.prefix.slice(offset, end);
    const { values, creators } = cache;
    const compare = (a: number, b: number) => rows[b].score - rows[a].score || values[a] - values[b] || rows[b].publishedAt - rows[a].publishedAt || a - b;
    // Prepare a few upcoming pages together. Deeper explicit requests remain
    // available, but cannot grow the retained prefix beyond this fixed budget.
    const target = end <= RANKED_PREFIX_LIMIT
      ? Math.min(rows.length, RANKED_PREFIX_LIMIT, Math.ceil(end / PREFIX_BLOCK) * PREFIX_BLOCK) : end;
    const quotas = new Map<string, number>();
    let allocated = 0, active = creators;
    while (allocated < target) {
      const remaining: string[] = [];
      for (const creator of active) {
        const count = quotas.get(creator) ?? 0;
        if (count >= counts.get(creator)!) continue;
        quotas.set(creator, count + 1);
        if (count + 1 < counts.get(creator)!) remaining.push(creator);
        if (++allocated === target) break;
      }
      active = remaining;
    }
    const heaps = new Map<string, number[]>();
    for (let index = 0; index < rows.length; index++) {
      const creator = rows[index].creator, quota = quotas.get(creator) ?? 0;
      if (!quota) continue;
      let heap = heaps.get(creator);
      if (!heap) { heap = []; heaps.set(creator, heap); }
      keepBest(heap, index, quota, compare);
    }
    for (const heap of heaps.values()) heap.sort(compare);
    const prefix: T[] = [], cursors = new Map<string, number>();
    active = creators;
    while (prefix.length < target) {
      const remaining: string[] = [];
      for (const creator of active) {
        const heap = heaps.get(creator), cursor = cursors.get(creator) ?? 0;
        if (!heap || cursor >= heap.length) continue;
        prefix.push(rows[heap[cursor]].video);
        cursors.set(creator, cursor + 1);
        if (cursor + 1 < heap.length) remaining.push(creator);
        if (prefix.length === target) break;
      }
      active = remaining;
    }
    if (target <= RANKED_PREFIX_LIMIT) cache.prefix = prefix;
    return prefix.slice(offset, end);
  };
}
