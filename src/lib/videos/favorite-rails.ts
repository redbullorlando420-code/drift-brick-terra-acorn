import type { LibraryVideo, ResumeMark } from './types';
import { forEachCatalogSlice } from '../catalog-work.ts';
import { takeBestMapped } from './bounded-picks.ts';
import { forEachCatalogEntry } from '../catalog-work.ts';
import { savedRecordScan } from './saved-library.ts';
export const FAVORITE_RAIL_LIMIT = 48;
export const emptyFavoriteRails = () => ({ continued: [] as LibraryVideo[], movies: [] as LibraryVideo[], youtube: [] as LibraryVideo[], twitch: [] as LibraryVideo[], recent: [] as LibraryVideo[], localCount: 0, savedCount: 0, heartsCount: 0, likesCount: 0 });

/** The complete favorites catalog stays intact. Preview shelves retain only
 * their visible candidates instead of multiple copies of a million-row list. */
export async function buildFavoriteRails(videos: readonly LibraryVideo[], progress: Record<string, ResumeMark>, turn: () => Promise<void>, favorites: Record<string, true> = {}, likes: Record<string, true> = {}) {
  const result = emptyFavoriteRails();
  const saved = new Set<string>();
  await forEachCatalogEntry(savedRecordScan(favorites), id => { if (id !== undefined) saved.add(id); }, turn);
  await forEachCatalogEntry(savedRecordScan(likes), id => { if (id !== undefined) saved.add(id); }, turn);
  result.savedCount = saved.size;
  saved.clear();
  const append = (rows: LibraryVideo[], video: LibraryVideo) => { if (rows.length < FAVORITE_RAIL_LIMIT) rows.push(video); };
  let batch: LibraryVideo[] = [];
  const compare = (a: LibraryVideo, b: LibraryVideo) => (progress[b.id]?.at ?? b.addedAt) - (progress[a.id]?.at ?? a.addedAt);
  const flush = () => {
    result.recent = takeBestMapped([...result.recent, ...batch], FAVORITE_RAIL_LIMIT, video => video, compare);
    batch = [];
  };
  await forEachCatalogSlice(videos, video => {
    if (favorites[video.id]) result.heartsCount++;
    if (likes[video.id]) result.likesCount++;
    const mark = progress[video.id];
    if (mark && mark.t > 0 && mark.t < mark.d) append(result.continued, video);
    if (!video.remote) { result.localCount++; if (!video.isSample) append(result.movies, video); }
    if (video.remote?.kind === 'youtube') append(result.youtube, video);
    if (video.remote?.kind === 'twitch') append(result.twitch, video);
    batch.push(video);
    if (batch.length === 256) flush();
  }, turn, 256);
  flush();
  return result;
}
