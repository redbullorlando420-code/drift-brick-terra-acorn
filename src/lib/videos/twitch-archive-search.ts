import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work';
import { isTwitchClip } from './twitch-clips';
import type { FollowedChannel, LibraryVideo } from './types';

export type TwitchArchiveKey = { date: number; id: string };
export type TwitchArchiveFilter = {
  query: string; creator?: FollowedChannel; kind: 'all' | 'vod' | 'clip';
  from?: number; until?: number; order: 'newest' | 'oldest'; after?: TwitchArchiveKey;
};
export type TwitchArchivePage = { videos: LibraryVideo[]; matched: number; hasNext: boolean; next?: TwitchArchiveKey; visited: number; maxCandidates: number; elapsedMs: number };

/** Calendar bounds use local midnight and the next local day (including DST).
 * The exclusive end means every video on the selected end date is included. */
export function twitchArchiveDate(value: string, end = false): number | undefined {
  if (!value) return;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return NaN;
  const [year, month, day] = match.slice(1).map(Number);
  if (year < 1900 || year > 9999) return NaN;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return NaN;
  if (end) date.setDate(day + 1);
  return date.getTime();
}
function key(video: LibraryVideo): TwitchArchiveKey { return { date: Number.isFinite(video.addedAt) && video.addedAt > 0 ? video.addedAt : 0, id: video.id }; }
export function compareTwitchArchiveKeys(a: TwitchArchiveKey, b: TwitchArchiveKey, order: TwitchArchiveFilter['order']) {
  // Missing publication dates stay last in either direction, never posing as a
  // newly uploaded archive or a trustworthy oldest VOD.
  if (Boolean(a.date) !== Boolean(b.date)) return a.date ? -1 : 1;
  return (order === 'newest' ? b.date - a.date : a.date - b.date) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
function matchesCreator(video: LibraryVideo, creator: FollowedChannel) {
  if (video.folderId.toLowerCase() === creator.id.toLowerCase() || creator.channelId && video.remote?.channelId === creator.channelId) return true;
  if (video.folderId.startsWith('tw:')) return false;
  return video.remote?.channelName?.trim().toLowerCase() === creator.title.trim().toLowerCase();
}

/** One source-scoped, cancelable scan; no title index, sorted whole-catalog
 * copy or growing result history. Keyset pages retain at most 49 references. */
export async function searchTwitchArchive(videos: readonly LibraryVideo[], filter: TwitchArchiveFilter, options: {
  signal: AbortSignal; pageSize?: number; turn?: () => Promise<void>;
}): Promise<TwitchArchivePage> {
  const started = performance.now();
  const size = Math.min(48, Math.max(1, Math.floor(options.pageSize ?? 24)));
  const tokens = filter.query.slice(0, 256).normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0, 8);
  const candidates: Array<{ video: LibraryVideo; key: TwitchArchiveKey }> = [];
  let matched = 0, visited = 0, maxCandidates = 0;
  const compare = (a: TwitchArchiveKey, b: TwitchArchiveKey) => compareTwitchArchiveKeys(a, b, filter.order);
  const turn = async () => { options.signal.throwIfAborted(); await (options.turn ?? yieldCatalogTask)(); options.signal.throwIfAborted(); };
  if (filter.from !== undefined && !Number.isFinite(filter.from) || filter.until !== undefined && !Number.isFinite(filter.until) || filter.from !== undefined && filter.until !== undefined && filter.from >= filter.until) throw new Error('Choose a valid date range.');
  await forEachCatalogSlice(videos, video => {
    visited++;
    if (video.remote?.kind !== 'twitch' || video.remote.live || video.isSample || video.extension === 'live' || /\/(?:live|channel)$/i.test(video.path) || /:(?:live|channel)$/i.test(video.id) || /^offline\b/i.test(video.tagline ?? '')) return;
    if (filter.creator && !matchesCreator(video, filter.creator)) return;
    const clip = isTwitchClip(video);
    if (filter.kind !== 'all' && clip !== (filter.kind === 'clip')) return;
    const position = key(video);
    if (filter.from !== undefined && (!position.date || position.date < filter.from) || filter.until !== undefined && (!position.date || position.date >= filter.until)) return;
    if (tokens.length) {
      const title = video.name.slice(0, 2048).normalize('NFKC').toLowerCase();
      if (!tokens.every(token => title.includes(token))) return;
    }
    matched++;
    if (filter.after && compare(position, filter.after) <= 0) return;
    if (candidates.length === size + 1 && compare(position, candidates.at(-1)!.key) >= 0) return;
    let low = 0, high = candidates.length;
    while (low < high) { const middle = (low + high) >>> 1; if (compare(candidates[middle].key, position) <= 0) low = middle + 1; else high = middle; }
    candidates.splice(low, 0, { video, key: position });
    if (candidates.length > size + 1) candidates.pop();
    maxCandidates = Math.max(maxCandidates, candidates.length);
  }, turn);
  options.signal.throwIfAborted();
  const shown = candidates.slice(0, size);
  return { videos: shown.map(row => row.video), matched, hasNext: candidates.length > size, next: shown.at(-1)?.key, visited, maxCandidates, elapsedMs: performance.now() - started };
}
