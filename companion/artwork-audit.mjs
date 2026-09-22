import { opendir, lstat } from 'node:fs/promises';
import { join } from 'node:path';

const sources = ['twitch', 'youtube', 'chaturbate', 'myfreecams', 'eporner', 'redtube', 'reddit', 'redgifs', 'booru'];
export function artworkSource(id) {
  const prefix = String(id).toLowerCase().split(/[:_]/)[0];
  return prefix === 'tw' ? 'twitch' : prefix === 'yt' ? 'youtube' : sources.includes(prefix) ? prefix : 'local-or-unknown';
}
export function createArtworkAudit() {
  const startedAt = Date.now();
  const lookups = new Map();
  return {
    record(id, hit) {
      const source = artworkSource(id);
      const row = lookups.get(source) ?? { hits: 0, misses: 0 };
      row[hit ? 'hits' : 'misses']++;
      lookups.set(source, row);
    },
    async scan(root, { maxEntries = 10_000, maxMs = 300 } = {}) {
      const start = Date.now();
      const rows = new Map([...lookups].map(([source, reads]) => [source, { source, ...reads, files: 0, bytes: 0, oldestAt: null }]));
      let examined = 0;
      let truncated = false;
      let skipped = 0;
      // The caller supplies its approved cache directory. No recursion, image
      // reads, paths in the response, or symlink traversal are needed to audit.
      const dir = await opendir(root);
      for await (const entry of dir) {
        if (examined >= maxEntries || Date.now() - start >= maxMs) { truncated = true; break; }
        examined++;
        if (!entry.isFile() || !/\.(jpe?g|png|webp|gif)$/i.test(entry.name)) continue;
        try {
          const stat = await lstat(join(root, entry.name));
          if (!stat.isFile() || stat.isSymbolicLink()) { skipped++; continue; }
          const source = artworkSource(entry.name);
          const row = rows.get(source) ?? { source, hits: 0, misses: 0, files: 0, bytes: 0, oldestAt: null };
          row.files++;
          row.bytes += stat.size;
          row.oldestAt = row.oldestAt === null ? stat.mtimeMs : Math.min(row.oldestAt, stat.mtimeMs);
          rows.set(source, row);
        } catch { skipped++; }
      }
      return { ok: true, at: Date.now(), startedAt, examined, truncated, skipped,
        sources: [...rows.values()].sort((a, b) => a.source.localeCompare(b.source)) };
    },
  };
}
