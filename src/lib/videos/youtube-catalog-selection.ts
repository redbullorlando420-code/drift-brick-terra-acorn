import { forEachCatalogSlice, sortCatalogRows, yieldCatalogTask } from '../catalog-work.ts';
import type { LibraryVideo } from './types';
import { youtubePublicationTime } from './youtube-metadata.ts';

export async function youtubeCatalogSelection(input: {
  videos: readonly LibraryVideo[]; privateFolders: ReadonlySet<string>;
  unavailable: Record<string, true>; hiddenVideos: Record<string, true>; hideDemo: boolean;
}, signal?: AbortSignal, yieldTask = yieldCatalogTask) {
  const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
  const dated: LibraryVideo[] = [], undated: LibraryVideo[] = [];
  await forEachCatalogSlice(input.videos, video => {
    if (video.remote?.kind === 'youtube' && !input.unavailable[video.id] && !input.hiddenVideos[video.id]
      && !input.privateFolders.has(video.folderId) && !(input.hideDemo && video.isSample)) {
      (youtubePublicationTime(video) ? dated : undated).push(video);
    }
  }, turn, 4096);
  // Unknown publication dates form one stable tail. Mixing that tail into
  // the sort forced full merge passes even when every known date was already
  // ordered. Validate provenance once, then compare plain numeric dates.
  if (!dated.length) { signal?.throwIfAborted(); return undated; }
  const result = await sortCatalogRows(dated, (a, b) => b.addedAt - a.addedAt, turn, 16_384);
  await forEachCatalogSlice(undated, video => { result.push(video); }, turn, 16_384);
  signal?.throwIfAborted();
  return result;
}
