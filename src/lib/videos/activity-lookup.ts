import type { LibraryVideo } from './types';
import { forEachCatalogSlice } from '../catalog-work.ts';

const MAX_KEYS = 8192;
type Matches = { cards: LibraryVideo[]; offsets: number[] };
const snapshots = new WeakMap<readonly LibraryVideo[], Map<string, Matches>>();

/** Index only requested activity keys, never five aliases for every unwatched
 * title. Positions sharing an alias remain separate Continue candidates. */
function request(videos: readonly LibraryVideo[], keys: Iterable<string>, directIds: Iterable<string> = []) {
  let cache = snapshots.get(videos);
  if (!cache) { cache = new Map(); snapshots.set(videos, cache); }
  // Positions travel with the bounded requested-key cache, so opening more
  // titles never grows a second unbounded catalog index during a long session.
  const offsets = new Map<LibraryVideo, number>();
  const fresh = new Map<string, Matches>();
  const aliasKeys = new Set(keys);
  const directKeys = new Set(directIds);
  const wanted = new Set([...aliasKeys, ...directKeys]);
  const missing = new Set<string>();
  const result = new Map<string, LibraryVideo[]>();
  for (const key of wanted) {
    const saved = cache.get(key);
    if (saved) {
      result.set(key, saved.cards);
      saved.cards.forEach((card, index) => offsets.set(card, saved.offsets[index]!));
    } else {
      missing.add(key);
      const entry: Matches = { cards: [], offsets: [] };
      fresh.set(key, entry); result.set(key, entry.cards);
    }
  }
  const visit = (video: LibraryVideo, offset: number) => {
      // Check requested aliases directly instead of allocating an aliases
      // array (and calling indexOf on it) for every catalog card. Continue
      // commonly scans 100k+ rows to resolve only a small set of watched keys.
      // Repeated aliases on this same card are adjacent here, so the last-card
      // guard de-duplicates them without allocating a per-row Set.
      const record = (key: string | undefined) => {
        if (!key || !missing.has(key)) return;
        const entry = fresh.get(key)!;
        if (entry.cards[entry.cards.length - 1] === video) return;
        entry.cards.push(video);
        entry.offsets.push(offset);
        if (!offsets.has(video)) offsets.set(video, offset);
      };
      record(video.id);
      // Continue passes known IDs separately, so the common cold path avoids
      // allocating and checking an `id:` key for each of 100k+ catalog rows.
      if (!directKeys.size) record(`id:${video.id}`);
      record(video.remote?.watchUrl);
      record(video.remote?.embedUrl);
      record(video.src);
      record(video.path);
  };
  const finish = () => {
    for (const key of missing) cache.set(key, fresh.get(key)!);
    while (cache.size > MAX_KEYS) cache.delete(cache.keys().next().value!);
    return result;
  };
  return { missing, visit, finish, offsets };
}

export function activityLookup(videos: readonly LibraryVideo[], keys: Iterable<string>) {
  const pending = request(videos, keys);
  if (pending.missing.size) for (let index = 0; index < videos.length; index++) pending.visit(videos[index]!, index);
  return pending.finish();
}

/** First-time sidebar activity lookup yields as it scans. Cancelled scans
 * never leave partial matches or false misses in the shared cache. */
export async function activityLookupAsync(videos: readonly LibraryVideo[], keys: Iterable<string>, turn: () => Promise<void>) {
  const pending = request(videos, keys);
  if (pending.missing.size) await forEachCatalogSlice(videos, pending.visit, turn);
  return pending.finish();
}

/** Continue retains every matching card, including titles sharing a stable
 * URL after a reimport; callers still apply their ID/privacy filters. */
export function activityCandidates(videos: readonly LibraryVideo[], keys: Iterable<string>, directIds: Iterable<string> = []) {
  const pending = request(videos, keys, directIds);
  if (pending.missing.size) for (let index = 0; index < videos.length; index++) pending.visit(videos[index]!, index);
  const matches = pending.finish();
  return [...new Set([...matches.values()].flat())].sort((a, b) => (pending.offsets.get(a) ?? 0) - (pending.offsets.get(b) ?? 0));
}
