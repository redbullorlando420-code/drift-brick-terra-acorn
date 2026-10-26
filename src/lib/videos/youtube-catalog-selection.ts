import { forEachCatalogSlice, sortCatalogRows, yieldCatalogTask } from '../catalog-work.ts';
import type { LibraryVideo } from './types';
import { youtubePublicationTime, youtubePublicationIdentityOrder } from './youtube-metadata.ts';

export async function youtubeCatalogSelection(input: {
  videos: readonly LibraryVideo[]; privateFolders: ReadonlySet<string>;
  unavailable: Record<string, true>; hiddenVideos: Record<string, true>; hideDemo: boolean;
}, signal?: AbortSignal, yieldTask = yieldCatalogTask) {
  const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
  const dated: LibraryVideo[] = [], undated: LibraryVideo[] = [];
  // Only discrepant legacy day clocks need an override; normal catalogs retain
  // the numeric comparator without a second catalog-sized projection.
  let dayOverrides: WeakMap<LibraryVideo,number> | undefined;
  await forEachCatalogSlice(input.videos, video => {
    if (video.remote?.kind === 'youtube' && !input.unavailable[video.id] && !input.hiddenVideos[video.id]
      && !input.privateFolders.has(video.folderId) && !(input.hideDemo && video.isSample)) {
      const published=youtubePublicationTime(video);
      if(published && published!==video.addedAt){dayOverrides??=new WeakMap();dayOverrides.set(video,published);}
      (published ? dated : undated).push(video);
    }
  }, turn, 4096);
  // Unknown publication dates form one stable tail. Mixing that tail into
  // the sort forced full merge passes even when every known date was already
  // ordered. Validate provenance once, then compare plain numeric dates.
  const stableUndated=await sortCatalogRows(undated,youtubePublicationIdentityOrder,turn,16_384);
  if (!dated.length) { signal?.throwIfAborted(); return stableUndated; }
  const result = await sortCatalogRows(dated, (a, b) => (dayOverrides ? (dayOverrides.get(b)??b.addedAt)-(dayOverrides.get(a)??a.addedAt) : b.addedAt-a.addedAt)||youtubePublicationIdentityOrder(a,b), turn, 16_384);
  await forEachCatalogSlice(stableUndated, video => { result.push(video); }, turn, 16_384);
  signal?.throwIfAborted();
  return result;
}
