import { copyCatalogArray, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import type { LibraryVideo } from './types';

export type PrivateSort = 'recent' | 'name' | 'favorites' | 'tagged' | 'played' | 'ranked';
export type PrivateShelfIndex = Awaited<ReturnType<typeof preparePrivateShelves>>;

/** Input is already visibility-scoped and ordered by the library selector.
 * Group once, retaining full lists and stable tie order for every shelf. */
export async function preparePrivateShelves(videos: LibraryVideo[], tags: Record<string, string[]>, turn: () => Promise<void>) {
  const folders = new Map<string, LibraryVideo[]>(), byId = new Map<string, LibraryVideo>();
  const tagged: LibraryVideo[] = [], untagged: LibraryVideo[] = [], recent: LibraryVideo[] = [];
  await forEachCatalogSlice(videos, video => {
    byId.set(video.id, video);
    let group = folders.get(video.folderId);
    if (!group) { group = []; folders.set(video.folderId, group); }
    group.push(video);
    ((tags[video.id] ?? []).length ? tagged : untagged).push(video);
    const position = recent.findIndex(other => other.addedAt < video.addedAt);
    if (position >= 0) recent.splice(position, 0, video);
    else if (recent.length < 24) recent.push(video);
    if (recent.length > 24) recent.pop();
  }, turn, 4096);
  const organized = await sortCatalogRows(tagged, (a, b) => tags[b.id]!.length - tags[a.id]!.length, turn, 16384);
  return { videos, tags, folders, byId, tagged: organized, untagged, recent };
}

export async function orderPrivateShelves(index: PrivateShelfIndex, sort: PrivateSort,
  favorites: Record<string, true>, progress: Record<string, { at: number }>, ranked: string[] | undefined, turn: () => Promise<void>) {
  if (sort === 'ranked') {
    if (!ranked?.length) return index.videos;
    const rows: LibraryVideo[] = [];
    await forEachCatalogSlice(ranked, id => { const video = index.byId.get(id); if (video) rows.push(video); }, turn, 4096);
    return rows;
  }
  const rows = await copyCatalogArray(index.videos, turn);
  return sortCatalogRows(rows, (a, b) => sort === 'name' ? a.name.localeCompare(b.name)
    : sort === 'favorites' ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt
    : sort === 'tagged' ? (index.tags[b.id] ?? []).length - (index.tags[a.id] ?? []).length || b.addedAt - a.addedAt
    : sort === 'played' ? (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0) || b.addedAt - a.addedAt
    : b.addedAt - a.addedAt, turn, 16384);
}

export async function filterPrivateShelves(rows: LibraryVideo[], tags: Record<string, string[]>, tag: string, turn: () => Promise<void>) {
  if (tag === 'All') return rows;
  const selected: LibraryVideo[] = [];
  await forEachCatalogSlice(rows, video => { if ((tags[video.id] ?? []).includes(tag)) selected.push(video); }, turn, 4096);
  return selected;
}
