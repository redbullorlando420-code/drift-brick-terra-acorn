/** Small LRU/TTL metadata cache. Weights estimate retained strings/scalars;
 * they do not claim exact JavaScript heap size or include the durable library. */
export function createProviderMetadataCache<T>(options: {
  maxEntries: number; maxBytes: number; maxEntryBytes: number; ttlMs: number; now?: () => number;
}) {
  const rows = new Map<string, { value: T; bytes: number; at: number }>();
  const now = options.now ?? Date.now; let bytes = 0;
  const remove = (key: string) => { const row = rows.get(key); if (row) bytes -= row.bytes; rows.delete(key); };
  const prune = () => { const at = now(); for (const [key,row] of rows) if (at - row.at >= options.ttlMs) remove(key); };
  return {
    delete: remove,
    get: (key: string): T | undefined => {
      prune(); const row = rows.get(key); if (!row) return;
      rows.delete(key); rows.set(key, row); return row.value;
    },
    set: (key: string, value: T, weight: number): boolean => {
      prune(); remove(key);
      if (!Number.isFinite(weight) || weight < 0 || weight > options.maxEntryBytes || weight > options.maxBytes) return false;
      while (rows.size && (rows.size >= options.maxEntries || bytes + weight > options.maxBytes)) remove(rows.keys().next().value!);
      rows.set(key, { value, bytes: weight, at: now() }); bytes += weight; return true;
    },
    snapshot: () => { prune(); return { entries: rows.size, estimatedBytes: bytes, maxBytes: options.maxBytes, maxEntries: options.maxEntries }; },
  };
}
