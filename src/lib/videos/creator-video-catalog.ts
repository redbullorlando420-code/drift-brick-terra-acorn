import { copyCatalogArray, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import type { HistoryEntry, LibraryVideo } from './types.ts';

export type CreatorVideoSort = 'newest' | 'oldest' | 'title' | 'popular' | 'playlist';
export type CreatorVideoFilter = 'all' | 'unwatched' | 'favorites';
export type CreatorVideoSource = { id: string; channelId?: string };
export type CreatorVideoActivity = { watched: Set<string>; favorites: number; watchedCount: number; newest: number };

/** Membership is independent of query, ordering, artwork and watch progress. */
export async function prepareCreatorVideos(videos: LibraryVideo[], source: CreatorVideoSource,
  hidden: Record<string, unknown>, turn: () => Promise<void>) {
  const rows: LibraryVideo[] = [];
  await forEachCatalogSlice(videos, video => {
    if (!hidden[video.id] && (video.folderId === source.id || video.remote?.sourceIds?.includes(source.id)
      || !source.id.startsWith('ytpl:') && source.channelId && video.remote?.channelId === source.channelId)) rows.push(video);
  }, turn);
  await turn();
  return rows;
}

export async function orderCreatorVideos(rows: LibraryVideo[], sort: CreatorVideoSort, turn: () => Promise<void>, sourceId?:string) {
  const copy = await copyCatalogArray(rows, turn);
  return sortCatalogRows(copy, (a, b) => sort === 'playlist' ? (a.remote?.playlistMemberships?.[sourceId??'']?.order??Infinity)-(b.remote?.playlistMemberships?.[sourceId??'']?.order??Infinity)||a.id.localeCompare(b.id) : sort === 'title' ? a.name.localeCompare(b.name)
    : sort === 'oldest' ? a.addedAt - b.addedAt
    : sort === 'popular' ? (b.remote?.views ?? 0) - (a.remote?.views ?? 0) || b.addedAt - a.addedAt
    : b.addedAt - a.addedAt, turn);
}

export async function prepareCreatorVideoActivity(rows: LibraryVideo[], history: HistoryEntry[],
  favorites: Record<string, unknown>, turn: () => Promise<void>): Promise<CreatorVideoActivity> {
  const watched = new Set<string>();
  await forEachCatalogSlice(history, entry => { watched.add(entry.id); }, turn);
  const result = { watched, favorites: 0, watchedCount: 0, newest: 0 };
  await forEachCatalogSlice(rows, video => {
    result.favorites += Number(Boolean(favorites[video.id]));
    result.watchedCount += Number(watched.has(video.id));
    result.newest = Math.max(result.newest, video.addedAt || 0);
  }, turn);
  await turn();
  return result;
}

/** Search never re-sorts or scans unrelated creators. Stable ordering survives
 * filtering, and cancellation is checked before the result is published. */
export async function selectCreatorVideos(rows: LibraryVideo[], query: string, filter: CreatorVideoFilter,
  favorites: Record<string, unknown>, watched: Set<string>, turn: () => Promise<void>) {
  await turn();
  const needle = query.trim().toLocaleLowerCase();
  if (!needle && filter === 'all') return rows;
  const result: LibraryVideo[] = [];
  await forEachCatalogSlice(rows, video => {
    if (filter === 'favorites' && !favorites[video.id] || filter === 'unwatched' && watched.has(video.id)) return;
    if (!needle || video.name.toLocaleLowerCase().includes(needle)) result.push(video);
  }, turn);
  await turn();
  return result;
}
