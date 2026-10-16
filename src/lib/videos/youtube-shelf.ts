import type { LibraryVideo } from './types.ts';
import { youtubePublicationTime } from './youtube-metadata.ts';

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
