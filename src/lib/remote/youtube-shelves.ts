import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { mixYoutubeCreatorsAsync, youtubeCreatorKey } from './youtube-mix.ts';
import { youtubeOutsideFollowPredicate } from './youtube-discovery.ts';
import type { FollowedChannel, LibraryVideo } from '../videos/types';

export type YoutubeShelfInputs = {
  catalog: LibraryVideo[]; videos: LibraryVideo[]; follows: FollowedChannel[]; seed: number;
  history: Array<{ id: string; at: number }>; viewCounts: Record<string, number>;
};
const watchedCreators = new WeakMap<LibraryVideo[], { history: YoutubeShelfInputs['history']; expires: number; creators: Set<string> }>();
export async function prepareYoutubeWatchedCreators(input: Pick<YoutubeShelfInputs, 'catalog' | 'history'>, signal: AbortSignal, yieldTask = yieldCatalogTask) {
  const cached = watchedCreators.get(input.catalog);
  if (cached?.history === input.history && cached.expires > Date.now()) return cached.creators;
  const recent = new Set(input.history.filter(row => row.at > Date.now() - 180 * 86_400_000).map(row => row.id));
  const creators = new Set<string>();
  const turn = async () => { signal.throwIfAborted(); await yieldTask(); signal.throwIfAborted(); };
  if (recent.size) await forEachCatalogSlice(input.catalog, video => { if (recent.has(video.id)) creators.add(youtubeCreatorKey(video)); }, turn, 4096);
  signal.throwIfAborted();
  watchedCreators.set(input.catalog, { history: input.history, expires: Date.now() + 60_000, creators });
  return creators;
}
export async function prepareYoutubePrimaryShelves(input: YoutubeShelfInputs, signal: AbortSignal, yieldTask = yieldCatalogTask) {
  const turn = async () => { signal.throwIfAborted(); await yieldTask(); signal.throwIfAborted(); };
  const sample = (rows: LibraryVideo[], seed = input.seed, limit = 48, mode: 'mix' | 'latest' | 'trending' = 'mix') => mixYoutubeCreatorsAsync(rows, seed, limit, mode, signal, turn);
  const mix = await sample(input.videos), latest = await sample(input.videos, 0, 48, 'latest');
  // Only six visible playlists need pools; no per-video membership Set and
  // no full catalog-sized pools for hundreds of offscreen playlists.
  const playlists = input.follows.filter(follow => follow.kind === 'youtube' && follow.id.startsWith('ytpl:'));
  const hash = (id: string) => { let h = input.seed >>> 0; for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 0x45d9f3b) >>> 0; return h; };
  const nonempty = new Set<string>();
  if (playlists.length) {
    const wanted = new Set(playlists.map(follow => follow.id));
    await forEachCatalogSlice(input.videos, video => {
      if (wanted.has(video.folderId)) nonempty.add(video.folderId);
      for (const id of video.remote?.sourceIds ?? []) if (wanted.has(id)) nonempty.add(id);
    }, turn, 4096);
  }
  const selected = playlists.filter(row => nonempty.has(row.id)).sort((a, b) => hash(a.id) - hash(b.id)).slice(0, 6);
  const pools = new Map<string, LibraryVideo[]>();
  if (selected.length) {
    const wanted = new Set(selected.map(follow => follow.id));
    await forEachCatalogSlice(input.videos, video => {
      if (wanted.has(video.folderId)) {
        const rows = pools.get(video.folderId) ?? []; rows.push(video); pools.set(video.folderId, rows);
      }
      for (const id of video.remote?.sourceIds ?? []) {
        if (id === video.folderId || !wanted.has(id)) continue;
        const rows = pools.get(id) ?? []; rows.push(video); pools.set(id, rows);
      }
    }, turn, 4096);
  }
  const playlistShelves: Array<{ id: string; title: string; videos: LibraryVideo[] }> = [];
  // Match the established seeded playlist order without building indexes for
  // shelves that will never be mounted.
  for (const playlist of selected) {
    playlistShelves.push({ id: playlist.id, title: playlist.title, videos: await sample(pools.get(playlist.id)!, input.seed, 24) });
  }
  return { mix, latest, playlistShelves };
}

export async function prepareYoutubeExploreShelves(input: YoutubeShelfInputs, signal: AbortSignal, yieldTask = yieldCatalogTask) {
  const turn = async () => { signal.throwIfAborted(); await yieldTask(); signal.throwIfAborted(); };
  const watched = new Set(input.history.map(row => row.id));
  const creators = await prepareYoutubeWatchedCreators(input, signal, turn);
  const unseen: LibraryVideo[] = [], quick: LibraryVideo[] = [], deeper: LibraryVideo[] = [], outside: LibraryVideo[] = [];
  const isOutside = youtubeOutsideFollowPredicate(input.follows);
  await forEachCatalogSlice(input.videos, video => {
    if (!watched.has(video.id) && !input.viewCounts[video.id]) {
      unseen.push(video);
      if (creators.has(youtubeCreatorKey(video))) deeper.push(video);
    }
    if ((video.duration ?? 0) > 0 && (video.duration ?? 0) < 1200) quick.push(video);
    if (isOutside(video)) outside.push(video);
  }, turn, 4096);
  const sample = (rows: LibraryVideo[], seed: number, mode: 'mix' | 'trending' = 'mix') => mixYoutubeCreatorsAsync(rows, seed, 48, mode, signal, turn);
  return {
    fresh: await sample(unseen, input.seed ^ 0x5f3759df), quick: await sample(quick, input.seed),
    deeper: await sample(deeper, input.seed ^ 0x13579bdf), discovery: await sample(outside, input.seed ^ 0x2468ace0),
    trending: await sample(input.videos, input.seed, 'trending'),
  };
}
