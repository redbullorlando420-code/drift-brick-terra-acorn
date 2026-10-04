import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { prepareYoutubeCreatorIndex } from '../remote/youtube-mix.ts';
import type { LibraryVideo } from './types';

export function isExcludedDemoVideo(video: { isSample?: boolean; name: string; remote?: { channelName?: string }; tagline?: string }) {
  return Boolean(video.isSample) || /\bblender\b/i.test(`${video.name} ${video.remote?.channelName ?? ''} ${video.tagline ?? ''}`);
}
const catalogs = new WeakMap<LibraryVideo[], LibraryVideo[]>();
export function youtubeBrowseVideos(videos: LibraryVideo[]) {
  let result = catalogs.get(videos);
  if (!result) { result = videos.filter(video => !isExcludedDemoVideo(video)); catalogs.set(videos, result); }
  return result;
}
export async function prepareYoutubeBrowse(videos: LibraryVideo[], signal?: AbortSignal, yieldTask = yieldCatalogTask) {
  let result = catalogs.get(videos);
  if (!result) {
    result = [];
    const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
    await forEachCatalogSlice(videos, video => { if (!isExcludedDemoVideo(video)) result!.push(video); }, turn, 4096);
    signal?.throwIfAborted();
    catalogs.set(videos, result);
  }
  await prepareYoutubeCreatorIndex(result, signal, yieldTask);
  return result;
}
