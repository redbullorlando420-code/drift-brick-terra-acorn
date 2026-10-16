import type { LibraryVideo } from "./types";
import { activityCandidates, activityCandidatesAsync } from './activity-lookup.ts';
import { forEachCatalogEntry } from '../catalog-work.ts';
import { sparseRecordScan } from '../sparse-record.ts';

type ShelfSnapshot = { favorites?: string[]; likes?: string[]; savedAt?: number };
export type SavedShelfEdit = { id: string; shelf: 'favorites' | 'likes'; saved: boolean; at: number };
export function isSavedShelfEdit(row: unknown): row is SavedShelfEdit {
  if (!row || typeof row !== 'object') return false;
  const edit = row as SavedShelfEdit;
  return typeof edit.id === 'string' && Boolean(edit.id.trim()) && (edit.shelf === 'favorites' || edit.shelf === 'likes')
    && typeof edit.saved === 'boolean' && Number.isFinite(edit.at) && edit.at > 0;
}
export const savedShelfEditKey = (edit: Pick<SavedShelfEdit, 'id' | 'shelf'>) => `${edit.shelf}:${edit.id}`;

/** Sparse edits replay over the newest full snapshot. Explicit removals stay
 * removed, including after an older preference backup is recovered. */
export function recoverSavedShelfEdits(a: ShelfSnapshot | null | undefined, b: ShelfSnapshot | null | undefined,
  legacy: ShelfSnapshot | null | undefined, edits: readonly unknown[]) {
  const baseline = recoverSavedShelves(a, b);
  const validTime = (row?: ShelfSnapshot | null) => row && Number.isFinite(row.savedAt) && row.savedAt! > 0
    && Array.isArray(row.favorites) && Array.isArray(row.likes) ? row.savedAt! : 0;
  const cutoff = Math.max(validTime(a), validTime(b));
  const latest = new Map<string, SavedShelfEdit>();
  for (const row of edits) if (isSavedShelfEdit(row) && row.at >= cutoff) {
    const key = savedShelfEditKey(row), previous = latest.get(key);
    if (!previous || previous.at <= row.at) latest.set(key, row);
  }
  if (!latest.size) return baseline;
  const start = baseline.authoritative ? baseline : recoverSavedShelves(legacy, { favorites: baseline.favorites, likes: baseline.likes });
  const favorites = new Set(start.favorites), likes = new Set(start.likes);
  for (const edit of latest.values()) {
    const shelf = edit.shelf === 'favorites' ? favorites : likes;
    if (edit.saved) shelf.add(edit.id); else shelf.delete(edit.id);
  }
  return { favorites: [...favorites], likes: [...likes], authoritative: true };
}
export function recoverSavedShelves(a?: ShelfSnapshot | null, b?: ShelfSnapshot | null) {
  const valid = (row?: ShelfSnapshot | null) => Boolean(row && Number.isFinite(row.savedAt) && row.savedAt! > 0 && Array.isArray(row.favorites) && Array.isArray(row.likes));
  const clean = (rows?: string[]) => [...new Set((Array.isArray(rows) ? rows : []).filter(id => typeof id === "string" && id.trim()))];
  if (valid(a) || valid(b)) {
    const latest = !valid(a) ? b! : !valid(b) ? a! : a!.savedAt! > b!.savedAt! ? a! : b!;
    return { favorites: clean(latest.favorites), likes: clean(latest.likes), authoritative: true };
  }
  // Untimestamped legacy backups merge once; current snapshots retain removals.
  return { favorites: clean([...clean(a?.favorites), ...clean(b?.favorites)]), likes: clean([...clean(a?.likes), ...clean(b?.likes)]), authoritative: false };
}

export function selectSavedCards(videos: readonly LibraryVideo[], favorites: Record<string, true>, likes: Record<string, true>, adultIds: ReadonlySet<string>, adult: boolean, hidden: Record<string, true>, hideDemo: boolean) {
  if (adult && !adultIds.size) return [];
  const savedIds = new Set([...Object.keys(favorites), ...Object.keys(likes)]);
  if (!savedIds.size) return [];
  const saved: LibraryVideo[] = [];
  // Reopening a saved shelf, changing its privacy scope, or hiding a card
  // reuses the bounded activity matches instead of scanning every title.
  for (const video of activityCandidates(videos, [], savedIds)) {
    if (!savedIds.has(video.id) || hidden[video.id] || (hideDemo && video.isSample)) continue;
    if (adult === adultIds.has(video.folderId)) saved.push(video);
  }
  return saved;
}

export function* savedRecordIds(record: Record<string, true>) {
  for (const id in record) if (Object.prototype.hasOwnProperty.call(record, id)) yield id;
}
/** Include removed/overridden scan steps so background work can yield even
 * through a mostly deleted shelf, without the Proxy's full key export. */
export function* savedRecordScan(record: Record<string, true>): Generator<string | undefined> {
  for (const row of sparseRecordScan(record, false)) yield row?.[0];
}
export async function selectSavedCardsAsync(videos: readonly LibraryVideo[], favorites: Record<string, true>, likes: Record<string, true>, adultIds: ReadonlySet<string>, adult: boolean, hidden: Record<string, true>, hideDemo: boolean, turn: () => Promise<void>) {
  if (adult && !adultIds.size) return [];
  const savedIds = new Set<string>();
  await forEachCatalogEntry(savedRecordScan(favorites), id => { if (id !== undefined) savedIds.add(id); }, turn);
  await forEachCatalogEntry(savedRecordScan(likes), id => { if (id !== undefined) savedIds.add(id); }, turn);
  if (!savedIds.size) return [];
  const candidates = await activityCandidatesAsync(videos, [], savedIds, turn), saved: LibraryVideo[] = [];
  await forEachCatalogEntry(candidates, video => {
    if (savedIds.has(video.id) && !hidden[video.id] && !(hideDemo && video.isSample) && adult === adultIds.has(video.folderId)) saved.push(video);
  }, turn);
  return saved;
}
