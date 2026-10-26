import type { CompactPostings } from "./compact-postings";

/** Reuse common words as compact postings, with one fixed memory budget.
 * Sparse intersections visit only candidate ordinals, never another full
 * document bitmap. Index mutations explicitly invalidate these expansions. */
export function createSearchTokenQuery(
  postings: CompactPostings,
  documentCount: () => number,
  maxBytes = 2 * 1024 * 1024,
  maxTerms = 24,
  extraMatches?: (token: string, visit: (id: number) => void) => void,
) {
  const cache = new Map<string, Uint32Array>();
  let bytes = 0,
    dictionaryScans = 0,
    hits = 0;
  const expand = (token: string) => {
    const known = cache.get(token);
    if (known) {
      cache.delete(token);
      cache.set(token, known);
      hits++;
      return known;
    }
    const marked = new Uint8Array(documentCount());
    postings.forEach(token, (id) => {
      marked[id] = 1;
    });
    dictionaryScans++;
    for (const key of postings.keys())
      if (key !== token && (key.startsWith(token) || (token.length >= 4 && key.includes(token))))
        postings.forEach(key, (id) => {
          marked[id] = 1;
        });
    extraMatches?.(token, id => { if (id >= 0 && id < marked.length) marked[id] = 1; });
    let count = 0;
    for (let id = 0; id < marked.length; id++) if (marked[id]) count++;
    const rows = new Uint32Array(count);
    for (let id = 0, out = 0; id < marked.length; id++) if (marked[id]) rows[out++] = id;
    if (rows.byteLength <= maxBytes && maxTerms > 0) {
      while (cache.size && (bytes + rows.byteLength > maxBytes || cache.size >= maxTerms)) {
        const key = cache.keys().next().value!;
        bytes -= cache.get(key)!.byteLength;
        cache.delete(key);
      }
      cache.set(token, rows);
      bytes += rows.byteLength;
    }
    return rows;
  };
  return {
    search(tokens: readonly string[]) {
      const lists: Uint32Array[] = [];
      for (const token of new Set(tokens)) {
        const rows = expand(token);
        if (!rows.length) return new Uint32Array();
        lists.push(rows);
      }
      if (!lists.length) return new Uint32Array();
      lists.sort((a, b) => a.length - b.length);
      let found = lists[0]!;
      for (let index = 1; index < lists.length && found.length; index++) {
        const other = lists[index]!,
          result = new Uint32Array(found.length);
        let left = 0,
          right = 0,
          out = 0;
        while (left < found.length && right < other.length) {
          const a = found[left]!,
            b = other[right]!;
          if (a === b) {
            result[out++] = a;
            left++;
            right++;
          } else if (a < b) left++;
          else right++;
        }
        found = result.subarray(0, out);
      }
      // Callers can transfer this buffer without detaching a retained posting.
      return found.slice();
    },
    clear() {
      cache.clear();
      bytes = 0;
    },
    diagnostics() {
      return { cachedBytes: bytes, cachedTerms: cache.size, dictionaryScans, hits };
    },
  };
}
