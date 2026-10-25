import type { LibraryVideo } from '../videos/types.ts';
import { yieldCatalogTask } from '../catalog-work.ts';

const normalize = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const ROOM_SEARCH_PAGE_SIZE = 24;
/** Search every playable title, yielding between slices and retaining only one
 * visible page. Terms can match across title, creator, description and tags. */
export async function roomSearchPage(videos: readonly LibraryVideo[], query: string, offset = 0, turn = yieldCatalogTask, eligible?: (video: LibraryVideo) => boolean) {
  const terms = normalize(query.trim().slice(0, 160)).split(/\s+/).filter(Boolean).slice(0, 12);
  const start = Math.max(0, Math.min(videos.length, Math.floor(offset) || 0));
  if (!terms.length && !eligible) return { videos: videos.slice(start, start + ROOM_SEARCH_PAGE_SIZE), hasMore: videos.length > start + ROOM_SEARCH_PAGE_SIZE };
  const found: LibraryVideo[] = []; let matched = 0;
  for (let index = 0; index < videos.length;) {
    await turn(); const end = Math.min(videos.length, index + 512), began = performance.now();
    for (; index < end; index++) {
      const video = videos[index]!;
      if(eligible && !eligible(video))continue;
      const text = normalize(`${video.name} ${video.remote?.channelName ?? ''} ${video.genre ?? ''} ${video.tagline ?? ''} ${(video.description ?? '').slice(0, 2500)} ${(video.remote?.youtubeKeywords ?? []).slice(0, 32).join(' ')} ${Object.keys(video.remote?.youtubeTagSummary?.sources ?? {}).slice(0,48).join(' ')}`);
      if (terms.every(term => text.includes(term))) {
        if (matched++ >= start) found.push(video);
        if (found.length > ROOM_SEARCH_PAGE_SIZE) return { videos: found.slice(0, ROOM_SEARCH_PAGE_SIZE), hasMore: true };
      }
      if (performance.now() - began >= 4) { index++; break; }
    }
  }
  return { videos: found, hasMore: false };
}
