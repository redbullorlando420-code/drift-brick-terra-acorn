import type { LibraryVideo } from './types';
import { repairLegacyYoutubeDate } from '../remote/youtube-page.ts';
/** The browse index never retains provider descriptions or comment transcripts.
 * Full records stay on disk and are fetched only for the selected video. */
export function catalogCard(video: LibraryVideo): LibraryVideo {
  video = repairLegacyYoutubeDate(video);
  if (!video.remote || video.detailsOnDisk && !video.description && !video.remote.comments
    && (video.tagline?.length ?? 0) <= 240 && (video.remote.thumbFallbacks?.length ?? 0) <= 4) return video;
  const { description: _description, tagline, remote, ...card } = video;
  const { comments: _comments, thumbFallbacks, ...reference } = remote;
  return { ...card, detailsOnDisk: true, ...(tagline ? { tagline: tagline.slice(0, 240) } : {}),
    remote: { ...reference, ...(thumbFallbacks ? { thumbFallbacks: thumbFallbacks.slice(0, 4) } : {}) } };
}
/** Listing metadata wins over stale disk metadata; heavier details survive
 * sparse provider refreshes and full-cache saves of lightweight cards. */
export function withCatalogDetails(card: LibraryVideo, saved?: LibraryVideo): LibraryVideo {
  if (!saved) return card;
  return { ...saved, ...card, detailsOnDisk: saved.detailsOnDisk && card.detailsOnDisk,
    description: card.description ?? saved.description,
    tagline: card.detailsOnDisk ? saved.tagline ?? card.tagline : card.tagline ?? saved.tagline,
    remote: card.remote ? { ...saved.remote, ...card.remote,
      comments: card.remote.comments ?? saved.remote?.comments,
      thumbFallbacks: card.detailsOnDisk ? saved.remote?.thumbFallbacks ?? card.remote.thumbFallbacks : card.remote.thumbFallbacks ?? saved.remote?.thumbFallbacks,
    } : saved.remote };
}
