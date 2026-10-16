import type { LibraryVideo } from './types';
import { forEachCatalogSlice, forEachCatalogEntry, sortCatalogRows } from '../catalog-work.ts';

const MAX_KEYS = 8192;
type Matches = { cards: LibraryVideo[]; offsets: number[] };
const snapshots = new WeakMap<readonly LibraryVideo[], Map<string, Matches>>();

/** Index only requested activity keys, never five aliases for every unwatched
 * title. Positions sharing an alias remain separate Continue candidates. */
function createRequest(videos: readonly LibraryVideo[], directKeys: ReadonlySet<string>) {
  let cache = snapshots.get(videos);
  if (!cache) { cache = new Map(); snapshots.set(videos, cache); }
  // Positions travel with the bounded requested-key cache, so opening more
  // titles never grows a second unbounded catalog index during a long session.
  const offsets = new Map<LibraryVideo, number>();
  const fresh = new Map<string, Matches>();
  const missing = new Set<string>();
  const result = new Map<string, LibraryVideo[]>();
  const acceptKey = (key: string) => {
    if (result.has(key)) return;
    const saved = cache.get(key);
    if (saved) {
      result.set(key, saved.cards);
      saved.cards.forEach((card, index) => offsets.set(card, saved.offsets[index]!));
    } else {
      missing.add(key);
      const entry: Matches = { cards: [], offsets: [] };
      fresh.set(key, entry); result.set(key, entry.cards);
    }
  };
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
  const commit = (key: string) => {
    cache.set(key, fresh.get(key)!);
    if (cache.size > MAX_KEYS) cache.delete(cache.keys().next().value!);
  };
  const finish = () => {
    for (const key of missing) commit(key);
    return result;
  };
  const finishAsync = async (turn: () => Promise<void>) => {
    // Matches are complete before any cache write. Cancellation during commit
    // can retain complete entries, never a partial scan or a false miss.
    await forEachCatalogEntry(missing, commit, turn);
    return result;
  };
  return { missing, visit, finish, finishAsync, acceptKey, offsets };
}
function request(videos: readonly LibraryVideo[], keys: Iterable<string>, directIds: Iterable<string> = []) {
  const direct = new Set(directIds), pending = createRequest(videos, direct);
  for (const key of keys) pending.acceptKey(key);
  for (const key of direct) pending.acceptKey(key);
  return pending;
}

export function activityLookup(videos: readonly LibraryVideo[], keys: Iterable<string>) {
  const pending = request(videos, keys);
  if (pending.missing.size) for (let index = 0; index < videos.length; index++) pending.visit(videos[index]!, index);
  return pending.finish();
}

/** First-time sidebar activity lookup yields as it scans. Cancelled scans
 * never leave partial matches or false misses in the shared cache. */
export async function activityLookupAsync(videos: readonly LibraryVideo[], keys: Iterable<string>, turn: () => Promise<void>) {
  const pending = createRequest(videos, new Set());
  // Dense histories can request tens of thousands of keys. Preparation and
  // cache finalization must yield too, even when catalog scanning is warm.
  await forEachCatalogEntry(keys, pending.acceptKey, turn);
  if (pending.missing.size) await forEachCatalogSlice(videos, pending.visit, turn);
  return pending.finishAsync(turn);
}

/** Continue retains every matching card, including titles sharing a stable
 * URL after a reimport; callers still apply their ID/privacy filters. */
export function activityCandidates(videos: readonly LibraryVideo[], keys: Iterable<string>, directIds: Iterable<string> = []) {
  const pending = request(videos, keys, directIds);
  if (pending.missing.size) for (let index = 0; index < videos.length; index++) pending.visit(videos[index]!, index);
  const matches = pending.finish();
  return [...new Set([...matches.values()].flat())].sort((a, b) => (pending.offsets.get(a) ?? 0) - (pending.offsets.get(b) ?? 0));
}

/** Match saved shelves without doing key allocation or sorting inside a click. */
export async function activityCandidatesAsync(videos: readonly LibraryVideo[], keys: Iterable<string | undefined>, directIds: Iterable<string | undefined>, turn: () => Promise<void>) {
  const direct = new Set<string>(), pending = createRequest(videos, direct);
  await forEachCatalogEntry(directIds, id => { if (id !== undefined) { direct.add(id); pending.acceptKey(id); } }, turn);
  await forEachCatalogEntry(keys, key => { if (key !== undefined) pending.acceptKey(key); }, turn);
  if (pending.missing.size) await forEachCatalogSlice(videos, pending.visit, turn);
  const matches = await pending.finishAsync(turn);
  const seen = new Set<LibraryVideo>(), rows: LibraryVideo[] = [];
  function* cards() { for (const values of matches.values()) yield* values; }
  await forEachCatalogEntry(cards(), video => { if (!seen.has(video)) { seen.add(video); rows.push(video); } }, turn);
  return sortCatalogRows(rows, (a, b) => (pending.offsets.get(a) ?? 0) - (pending.offsets.get(b) ?? 0), turn);
}
