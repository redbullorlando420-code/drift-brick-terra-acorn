import type { LibraryVideo } from './types.ts';
import { youtubePublicationTime } from './youtube-metadata.ts';
import { forEachCatalogSlice, sortCatalogRows, yieldCatalogTask } from '../catalog-work.ts';

/** A bounded refresh keeps catalog positions stable and appends new rows.
 * Cooperatively compare references, then replace only changed shelf cards.
 * Reorders, date corrections and large imports use the full stable rebuild. */
export async function updateYoutubeShelfAsync(previous: LibraryVideo[], next: LibraryVideo[], ordered: LibraryVideo[],
  visible: (video: LibraryVideo) => boolean, signal?: AbortSignal, yieldTask = yieldCatalogTask): Promise<LibraryVideo[] | undefined> {
  const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
  signal?.throwIfAborted();
  if (next === previous) return ordered;
  if (next.length < previous.length) return;
  const removed = new Set<LibraryVideo>(), replacements = new Map<LibraryVideo, LibraryVideo>();
  let added: LibraryVideo[] = [], changes = 0, rebuild = false;
  await forEachCatalogSlice(next, (after, index) => {
    if (rebuild) return;
    const before = previous[index];
    if (before === after || before?.remote?.kind !== 'youtube' && after.remote?.kind !== 'youtube') return;
    if (++changes > 4096 || before && before.id !== after.id) { rebuild = true; return; }
    const wasVisible = before?.remote?.kind === 'youtube' && visible(before);
    const isVisible = after.remote?.kind === 'youtube' && visible(after);
    if (wasVisible && isVisible && youtubePublicationTime(before) === youtubePublicationTime(after)) replacements.set(before, after);
    else {
      // Tail additions can follow equal-date existing rows. A corrected date
      // or newly visible interior row needs the original catalog's tie order.
      if (isVisible && before) { rebuild = true; return; }
      if (wasVisible) removed.add(before);
      if (isVisible) added.push(after);
    }
  }, turn, 16_384);
  if (rebuild) return;
  if (!removed.size && !replacements.size && !added.length) return ordered;
  if (added.length > 1) added = await sortCatalogRows(added, (a, b) => youtubePublicationTime(b) - youtubePublicationTime(a), turn);
  const result: LibraryVideo[] = [];
  let incoming = 0;
  await forEachCatalogSlice(ordered, video => {
    if (removed.has(video)) return;
    while (incoming < added.length && youtubePublicationTime(added[incoming]!) > youtubePublicationTime(video)) result.push(added[incoming++]!);
    result.push(replacements.get(video) ?? video);
  }, turn, 16_384);
  for (; incoming < added.length; incoming++) result.push(added[incoming]!);
  signal?.throwIfAborted();
  return result;
}

/** Provider refreshes replace a few cards in a large immutable catalog. Sort
 * only those changed cards and merge them into the already ordered shelf. */
export function updateYoutubeShelf(previous: LibraryVideo[], next: LibraryVideo[], ordered: LibraryVideo[], visible: (video: LibraryVideo) => boolean): LibraryVideo[] | undefined {
  if (next.length < previous.length) return undefined;
  const removed = new Set<LibraryVideo>(), replacements = new Map<LibraryVideo, LibraryVideo>(), added: LibraryVideo[] = [];
  let changes = 0;
  for (let i = 0; i < next.length; i++) {
    const before = previous[i], after = next[i]!;
    if (before === after) continue;
    if (before?.remote?.kind !== 'youtube' && after.remote?.kind !== 'youtube') continue;
    // A wholesale restore/reorder should use the normal rebuild, rather than
    // holding another catalog-sized set of changed objects in memory.
    if (++changes > 4096) return undefined;
    const wasVisible = before?.remote?.kind === 'youtube' && visible(before);
    const isVisible = after.remote?.kind === 'youtube' && visible(after);
    if (wasVisible && isVisible && youtubePublicationTime(before) === youtubePublicationTime(after)) replacements.set(before, after);
    else {
      if (before?.remote?.kind === 'youtube') removed.add(before);
      if (isVisible) added.push(after);
    }
  }
  if (!removed.size && !replacements.size && !added.length) return ordered;
  added.sort((a, b) => youtubePublicationTime(b) - youtubePublicationTime(a));
  const result: LibraryVideo[] = [];
  let incoming = 0;
  for (const video of ordered) {
    if (removed.has(video)) continue;
    while (incoming < added.length && youtubePublicationTime(added[incoming]!) > youtubePublicationTime(video)) result.push(added[incoming++]!);
    result.push(replacements.get(video) ?? video);
  }
  for (; incoming < added.length; incoming++) result.push(added[incoming]!);
  return result;
}
