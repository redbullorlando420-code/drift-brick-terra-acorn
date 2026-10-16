import { forEachCatalogSlice } from '../catalog-work.ts';
import type { LibraryVideo } from './types';

/** Worker offsets belong to this exact immutable catalog. Validate IDs anyway;
 * fallback callers retain the original complete scan and stable tie order. */
export async function visitSearchCandidates(videos: readonly LibraryVideo[], ids: ReadonlySet<string>, positions: Uint32Array | undefined,
  visit: (video: LibraryVideo) => void, turn: () => Promise<void>) {
  if (positions) await forEachCatalogSlice(positions, position => { const video = videos[position]; if (video && ids.has(video.id)) visit(video); }, turn);
  else await forEachCatalogSlice(videos, video => { if (ids.has(video.id)) visit(video); }, turn);
}
