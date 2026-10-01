export type PreviewUrlRow = { poster?: string; previewUrl?: string; at: number };
/** Constant-time reads and unchanged-image callbacks. Only changed URLs enter
 * the bounded cache or request a persistence write. */
export function createPreviewUrlCache(limit: number) {
  const rows = new Map<string, PreviewUrlRow>();
  const trim = () => { while (rows.size > limit) rows.delete(rows.keys().next().value!); };
  return {
    get: (id: string) => rows.get(id),
    clear: () => rows.clear(),
    size: () => rows.size,
    hydrate(raw: unknown) {
      rows.clear();
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;
      const saved = Object.entries(raw).filter((row): row is [string, PreviewUrlRow] => {
        const value = row[1];
        return Boolean(value && typeof value === 'object' && Number.isFinite(value.at)
          && (typeof value.poster === 'string' || typeof value.previewUrl === 'string'));
      }).sort((a, b) => a[1].at - b[1].at).slice(-limit);
      for (const [id, row] of saved) rows.set(id, row);
    },
    remember(id: string, row: PreviewUrlRow) {
      const old = rows.get(id);
      // A new preview observation must not erase a known-good poster.
      const next = { poster: row.poster ?? old?.poster, previewUrl: row.previewUrl ?? old?.previewUrl, at: row.at };
      if (old?.poster === next.poster && old?.previewUrl === next.previewUrl) return false;
      rows.delete(id); rows.set(id, next); trim(); return true;
    },
    serialize: () => Object.fromEntries(rows),
  };
}
