import { forEachCatalogEntry, forEachCatalogSlice, sortCatalogRows, yieldCatalogTask } from '../catalog-work.ts';
import { sparseRecordOrderedParts } from '../sparse-record.ts';
import type { HistoryEntry, ResumeMark } from './types.ts';

export type SavedVideoLink = {
  id: string; url: string; title?: string; poster?: string; kind?: string;
  savedAt: number; source: 'history' | 'bookmark' | 'continue';
};
export type RecoveryLinkInput = { links: readonly SavedVideoLink[] }
  | { history: readonly HistoryEntry[]; resumeProgress: Record<string, ResumeMark> };

/** Keep the first URL's metadata/order, matching the durable legacy format.
 * Preparation, de-duplication and sparse resume traversal all yield; no second
 * full intermediate link array or Object.entries export is needed. */
export async function prepareRecoveryLinks(input: RecoveryLinkInput, turn = yieldCatalogTask) {
  const links: SavedVideoLink[] = [], seen = new Set<string>();
  const accept = (row: SavedVideoLink) => {
    if (!row || typeof row !== 'object') return;
    const url = typeof row.url === 'string' ? row.url.trim() : '';
    const id = typeof row.id === 'string' ? row.id.trim() : url;
    if (!url || !id || seen.has(url.toLowerCase())) return;
    seen.add(url.toLowerCase());
    links.push({ id, url, savedAt: typeof row.savedAt === 'number' && Number.isFinite(row.savedAt) ? row.savedAt : Date.now(),
      source: row.source === 'bookmark' || row.source === 'continue' || row.source === 'history' ? row.source : 'history',
      ...(typeof row.title === 'string' ? { title: row.title } : {}),
      ...(typeof row.poster === 'string' ? { poster: row.poster } : {}),
      ...(typeof row.kind === 'string' ? { kind: row.kind } : {}) });
  };
  if ('links' in input) await forEachCatalogSlice(input.links, accept, turn);
  else {
    await forEachCatalogSlice(input.history, entry => {
      if (entry.url && /^https?:\/\//i.test(entry.url)) accept({ id: entry.id, url: entry.url, savedAt: entry.at, source: 'history',
        ...(entry.title ? { title: entry.title } : {}), ...(entry.poster ? { poster: entry.poster } : {}) });
    }, turn);
    const parts = sparseRecordOrderedParts(input.resumeProgress), appended: Array<[string, ResumeMark, number]> = [];
    await forEachCatalogEntry(parts.existing, row => {
      if (row && row[0].startsWith('http')) accept({ id: row[0], url: row[0], savedAt: row[1].at, source: 'continue' });
    }, turn);
    await forEachCatalogEntry(parts.appended, row => { if (row && row[0].startsWith('http')) appended.push(row); }, turn);
    const ordered = await sortCatalogRows(appended, (a,b)=>a[2]-b[2], turn);
    await forEachCatalogSlice(ordered, ([key, mark]) => { accept({ id: key, url: key, savedAt: mark.at, source: 'continue' }); }, turn);
  }
  return links;
}

/** One active preparation/write and one latest immutable input. New work
 * cancels obsolete preparation at its next task; disk writes stay ordered. */
export function createRecoveryLinkWriter(save: (links: SavedVideoLink[]) => Promise<void>, turn = yieldCatalogTask) {
  let latest: RecoveryLinkInput | undefined, running: Promise<void> | undefined;
  let revision = 0, preparing = false, writing = false;
  const replaced = Symbol('Recovery links replaced');
  return {
    write(input: RecoveryLinkInput) {
      latest = input; revision++;
      running ??= Promise.resolve().then(async () => {
        let failed = false, failure: unknown;
        try {
          while (latest) {
            const input = latest, expected = revision; latest = undefined;
            const nextTurn = async () => { await turn(); if (expected !== revision) throw replaced; };
            try {
              preparing = true;
              const links = await prepareRecoveryLinks(input, nextTurn);
              await nextTurn();
              preparing = false; writing = true;
              await save(links);
            } catch (error) { if (error !== replaced && !failed) { failed = true; failure = error; } }
            finally { preparing = false; writing = false; }
          }
          if (failed) throw failure;
        } finally { running = undefined; }
      });
      return running;
    },
    idle() { return running ?? Promise.resolve(); },
    diagnostics() { return { pending: latest ? 1 : 0, preparing, writing }; },
  };
}
