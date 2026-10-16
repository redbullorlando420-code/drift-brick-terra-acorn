import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { prepareYoutubeCreatorIndex } from '../remote/youtube-mix.ts';
import type { LibraryVideo } from './types';
import { youtubeContentKind } from './youtube-metadata.ts';

export function isExcludedDemoVideo(video: { isSample?: boolean; name: string; remote?: { channelName?: string }; tagline?: string }) {
  return Boolean(video.isSample) || /\bblender\b/i.test(`${video.name} ${video.remote?.channelName ?? ''} ${video.tagline ?? ''}`);
}
export type YoutubeArchiveFormat = 'all' | 'upload' | 'short' | 'replay';
type Groups = Record<YoutubeArchiveFormat | 'live' | 'upcoming', LibraryVideo[]>;
const catalogs = new WeakMap<LibraryVideo[], Groups>();
const groups = (): Groups => ({ all: [], upload: [], short: [], replay: [], live: [], upcoming: [] });
const add = (result: Groups, video: LibraryVideo) => {
  if (isExcludedDemoVideo(video)) return;
  const kind = youtubeContentKind(video);
  result[kind].push(video);
  if (kind !== 'live' && kind !== 'upcoming') result.all.push(video);
};
const shareCompleteGroups = (result: Groups, videos: LibraryVideo[]) => {
  // Common upload-only catalogs reuse the prepared array. Groups retain card
  // references, never copies of provider metadata or another sorted graph.
  if (result.all.length === videos.length) result.all = videos;
  if (!result.short.length && !result.replay.length) result.upload = result.all;
  return result;
};
export function youtubeBrowseGroups(videos: LibraryVideo[]) {
  let result = catalogs.get(videos);
  if (!result) {
    result = groups(); for (const video of videos) add(result, video);
    catalogs.set(videos, shareCompleteGroups(result, videos));
  }
  return result;
}
export function youtubeBrowseVideos(videos: LibraryVideo[]) {
  return youtubeBrowseGroups(videos).all;
}
export async function prepareYoutubeBrowse(videos: LibraryVideo[], signal?: AbortSignal, yieldTask = yieldCatalogTask) {
  let result = catalogs.get(videos);
  if (!result) {
    result = groups();
    const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
    await forEachCatalogSlice(videos, video => add(result!, video), turn, 4096);
    signal?.throwIfAborted();
    catalogs.set(videos, shareCompleteGroups(result, videos));
  }
  await prepareYoutubeCreatorIndex(result.all, signal, yieldTask);
  return result.all;
}
