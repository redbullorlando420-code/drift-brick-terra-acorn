import { createBoundedPicks } from './bounded-picks.ts';
import { forEachCatalogSlice, forEachCatalogEntry, sortCatalogRows } from '../catalog-work.ts';
import { personalRankScore } from './ranking-core';
import { isOfflineTwitchCatalogCard } from './twitch-catalog-order.ts';
import type { Folder, LibraryVideo } from './types';

export function landingShuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index++) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
}
export type LandingInput = {
  videos: readonly LibraryVideo[]; youtube: LibraryVideo[]; twitch: LibraryVideo[];
  favorites: Record<string, true>; likes: Record<string, true>; viewCounts: Record<string, number>;
  seed: number; now: number; rating: (id: string) => number; watchScore: (id: string) => number;
};
type Rated = { video: LibraryVideo; rating: number; score: number; rank: number; index: number };
const offline = (video: LibraryVideo) => video.remote?.kind === 'twitch' && isOfflineTwitchCatalogCard(video);
export const emptyLandingOverview = () => ({ recent: [] as LibraryVideo[], fresh: [] as LibraryVideo[], rated: [] as LibraryVideo[], latest: [] as LibraryVideo[], week: [] as LibraryVideo[] });
/** Scan outside render. The ranked local shelf retains at most three scored
 * candidates per folder; ordinary rails retain only their existing limits. */
export async function prepareLandingOverview(input: LandingInput, turn: () => Promise<void>) {
  const { videos, youtube, twitch, seed, now, rating, watchScore, favorites, likes, viewCounts } = input;
  const recent = createBoundedPicks<{ video: LibraryVideo; age: number; rank: number }>(48, (a, b) => a.age - b.age || a.rank - b.rank);
  const fresh = createBoundedPicks<{ video: LibraryVideo; views: number; rank: number }>(48, (a, b) => a.views - b.views || a.rank - b.rank);
  const compareRated = (a: Rated, b: Rated) => b.rating - a.rating || b.score - a.score || a.rank - b.rank || a.index - b.index;
  const folders = new Map<string, ReturnType<typeof createBoundedPicks<Rated>>>();
  const hour = Math.floor(now / 3_600_000);
  await forEachCatalogSlice(videos, (video, index) => {
    if (video.isSample) return;
    if (!video.remote?.live) fresh.add({ video, views: viewCounts[video.id] ?? 0, rank: landingShuffleRank(`${video.id}:${hour}`, hour) });
    if (video.remote) return;
    recent.add({ video, age: Math.floor(Math.max(0, now - video.addedAt) / (7 * 86_400_000)), rank: landingShuffleRank(`${video.id}:recent`, seed) });
    const stars = rating(video.id);
    if (stars < 3) return;
    let rows = folders.get(video.folderId);
    if (!rows) { rows = createBoundedPicks(3, compareRated); folders.set(video.folderId, rows); }
    rows.add({ video, rating: stars, index, rank: landingShuffleRank(video.id, seed), score: personalRankScore({ rating: stars, watch: watchScore(video.id), favorite: Boolean(favorites[video.id]), liked: Boolean(likes[video.id]) }) });
  }, turn);
  const rated: Rated[] = [];
  await forEachCatalogEntry(folders.values(), rows => { rated.push(...rows.finish()); }, turn);
  const ordered = await sortCatalogRows(rated, compareRated, turn);
  const ratedVideos: LibraryVideo[] = [];
  await forEachCatalogSlice(ordered, row => { ratedVideos.push(row.video); }, turn);
  const latest = createBoundedPicks<LibraryVideo>(48, (a, b) => b.addedAt - a.addedAt || a.id.localeCompare(b.id));
  const week = createBoundedPicks<LibraryVideo>(160, (a, b) => b.addedAt - a.addedAt || a.id.localeCompare(b.id));
  for (const provider of [youtube, twitch]) await forEachCatalogSlice(provider, video => {
    if (offline(video)) return;
    if (!video.remote?.live && !video.isSample) latest.add(video);
    const age = now - video.addedAt;
    if (video.remote && age >= -5 * 60_000 && age < 7 * 24 * 60 * 60_000) week.add(video);
  }, turn);
  return { recent: recent.finish().map(row => row.video), fresh: fresh.finish().map(row => row.video), rated: ratedVideos, latest: latest.finish(), week: week.finish() };
}

export const emptyLandingExpanded = () => ({ youtube: [] as LibraryVideo[], twitch: [] as LibraryVideo[], shorts: [] as LibraryVideo[], genres: [] as LibraryVideo[], folders: new Map<string, LibraryVideo[]>() });
export async function prepareLandingExpanded(videos: readonly LibraryVideo[], youtube: LibraryVideo[], twitch: LibraryVideo[], folders: readonly Folder[], turn: () => Promise<void>) {
  const output = emptyLandingExpanded();
  const folderIds = new Set(folders.filter(folder => folder.kind !== 'demo' && folder.kind !== 'youtube' && folder.kind !== 'twitch' && !folder.adult).slice(0, 12).map(folder => folder.id));
  const genres = createBoundedPicks<{ video: LibraryVideo; index: number }>(24, (a, b) => a.video.genre!.localeCompare(b.video.genre!) || a.index - b.index);
  await forEachCatalogSlice(videos, (video, index) => {
    if (!video.isSample && output.shorts.length < 18 && (video.collection === 'shorts' || (video.duration ?? 0) > 0 && video.duration! < 1800)) output.shorts.push(video);
    if (!video.isSample && video.genre) genres.add({ video, index });
    if (!folderIds.has(video.folderId)) return;
    let rows = output.folders.get(video.folderId);
    if (!rows) { rows = []; output.folders.set(video.folderId, rows); }
    if (rows.length < 24) rows.push(video);
  }, turn);
  await forEachCatalogSlice(youtube, video => { if (!video.isSample) output.youtube.push(video); }, turn);
  await forEachCatalogSlice(twitch, video => { if (!video.isSample && !offline(video)) output.twitch.push(video); }, turn);
  // Complete provider rails keep every eligible title. Reuse existing arrays
  // when filtering removed nothing, avoiding another retained full catalog.
  if (output.youtube.length === youtube.length) output.youtube = youtube;
  if (output.twitch.length === twitch.length) output.twitch = twitch;
  output.genres = genres.finish().map(row => row.video);
  return output;
}
