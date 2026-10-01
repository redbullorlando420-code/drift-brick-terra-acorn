import type { LibraryVideo } from "./types";
import { activityCandidates } from './activity-lookup.ts';

type ShelfSnapshot = { favorites?: string[]; likes?: string[]; savedAt?: number };
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
