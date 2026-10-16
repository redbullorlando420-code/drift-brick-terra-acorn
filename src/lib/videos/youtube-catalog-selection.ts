import { forEachCatalogSlice, sortCatalogRows, yieldCatalogTask } from '../catalog-work.ts';
import type { LibraryVideo } from './types';
import { youtubePublicationTime } from './youtube-metadata.ts';

export async function youtubeCatalogSelection(input: {
  videos: readonly LibraryVideo[]; privateFolders: ReadonlySet<string>;
  unavailable: Record<string, true>; hiddenVideos: Record<string, true>; hideDemo: boolean;
}, signal?: AbortSignal, yieldTask = yieldCatalogTask) {
  const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
  const rows: LibraryVideo[] = [];
  await forEachCatalogSlice(input.videos, video => {
    if (video.remote?.kind === 'youtube' && !input.unavailable[video.id] && !input.hiddenVideos[video.id]
      && !input.privateFolders.has(video.folderId) && !(input.hideDemo && video.isSample)) rows.push(video);
  }, turn, 4096);
  const result = await sortCatalogRows(rows, (a, b) => youtubePublicationTime(b) - youtubePublicationTime(a), turn, 16_384);
  signal?.throwIfAborted();
  return result;
}
