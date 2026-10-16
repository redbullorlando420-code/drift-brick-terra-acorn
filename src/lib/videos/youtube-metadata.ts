import type { LibraryVideo, RemoteRef } from './types.ts';

export type YoutubeContentKind = 'upload' | 'short' | 'replay' | 'live' | 'upcoming';
export type YoutubePublishedSource = 'rss' | 'provider' | 'unknown' | 'legacy';
const minimumDate = Date.UTC(2000, 0, 1);
export function youtubePublicationTime(video: LibraryVideo) {
  return video.remote?.publishedSource === 'unknown' || !Number.isFinite(video.addedAt) || video.addedAt <= minimumDate ? 0 : video.addedAt;
}
export function youtubeContentKind(video: LibraryVideo): YoutubeContentKind {
  if (video.remote?.live) return 'live';
  const type = video.remote?.youtubeType;
  return type === 'short' || type === 'replay' || type === 'live' || type === 'upcoming' ? type : 'upload';
}
export function youtubeDateSource(video: LibraryVideo): YoutubePublishedSource {
  if (!youtubePublicationTime(video)) return 'unknown';
  const source = video.remote?.publishedSource;
  return source === 'rss' || source === 'provider' ? source : 'legacy';
}
/** Old generated archive dates are recognized narrowly. Explicit provenance
 * prevents this compatibility repair from erasing a real RSS/provider date. */
export function repairYoutubePublication(video: LibraryVideo): LibraryVideo {
  if (video.remote?.kind !== 'youtube') return video;
  const synthetic = !video.remote.publishedSource && video.remote.channelName
    && video.description === `${video.remote.channelName} public channel catalog item.`;
  if ((!synthetic && youtubePublicationTime(video)) || video.addedAt === 0) return video;
  return { ...video, addedAt: 0, remote: { ...video.remote, publishedSource: 'unknown' } };
}
const priority: Record<YoutubePublishedSource, number> = { unknown: 0, legacy: 1, provider: 2, rss: 3 };
/** Preserve the strongest date evidence across shallow/live/playlist refreshes.
 * A feed has no live-state or format evidence and cannot erase either. */
export function retainYoutubeMetadata(previous: LibraryVideo | undefined, incoming: LibraryVideo): LibraryVideo {
  if (incoming.remote?.kind !== 'youtube') return incoming;
  incoming = repairYoutubePublication(incoming);
  if (previous?.remote?.kind !== 'youtube') return incoming;
  previous = repairYoutubePublication(previous);
  const oldSource = youtubeDateSource(previous), newSource = youtubeDateSource(incoming);
  const keepDate = priority[oldSource] > priority[newSource];
  const old = previous.remote!, next = incoming.remote!;
  const keepKind = !next.youtubeType && Boolean(old.youtubeType);
  const keepLive = next.live === undefined && old.live !== undefined;
  if (!keepDate && !keepKind && !keepLive) return incoming;
  return { ...incoming, ...(keepDate ? { addedAt: previous.addedAt } : {}), remote: { ...next,
    ...(keepDate ? { publishedSource: oldSource } : {}),
    ...(keepKind ? { youtubeType: old.youtubeType } : {}),
    ...(keepLive ? { live: old.live, observedAt: old.observedAt, viewers: old.viewers } : {}),
  } };
}
/** Exact dates only. Relative labels and scheduled start times are not upload
 * dates; never infer them from the current clock, duration, or video title. */
export function exactYoutubePublished(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return;
  const time = Date.parse(value);
  if (!Number.isFinite(time) || time <= minimumDate) return;
  // Reject calendar overflow such as February 30 rather than normalizing it.
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (new Date(Date.UTC(year!, month! - 1, day!)).toISOString().slice(0, 10) !== value.slice(0, 10)) return;
  return value;
}
type Text = { simpleText?: string; runs?: Array<{ text?: string }> };
const text = (value?: Text) => value?.simpleText ?? value?.runs?.map(row => row.text ?? '').join('') ?? '';
export function youtubeRendererMetadata(renderer: {
  youtubeType?: YoutubeContentKind; publishedAt?: string; publishDate?: string; uploadDate?: string;
  publishedTimeText?: Text; upcomingEventData?: unknown; isLive?: boolean; isLiveContent?: boolean;
  thumbnailOverlays?: Array<{ thumbnailOverlayTimeStatusRenderer?: { style?: string } }>;
  badges?: Array<{ metadataBadgeRenderer?: { style?: string } }>;
  navigationEndpoint?: { reelWatchEndpoint?: unknown; commandMetadata?: { webCommandMetadata?: { url?: string } } };
}): Pick<RemoteRef, 'youtubeType'> & { published?: string } {
  const live = renderer.isLive === true || renderer.thumbnailOverlays?.some(row => row.thumbnailOverlayTimeStatusRenderer?.style === 'LIVE')
    || renderer.badges?.some(row => row.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_LIVE_NOW');
  const label = text(renderer.publishedTimeText);
  const upcoming = renderer.upcomingEventData || renderer.thumbnailOverlays?.some(row => row.thumbnailOverlayTimeStatusRenderer?.style === 'UPCOMING')
    || renderer.badges?.some(row => row.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_UPCOMING_EVENT');
  const type = upcoming ? 'upcoming' : live ? 'live' : renderer.youtubeType
    ?? (renderer.navigationEndpoint?.reelWatchEndpoint || /\/shorts\//.test(renderer.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ?? '') ? 'short'
      : renderer.isLiveContent || /^Streamed\s/i.test(label) ? 'replay'
        : renderer.thumbnailOverlays?.some(row => row.thumbnailOverlayTimeStatusRenderer?.style === 'DEFAULT') ? 'upload' : undefined);
  const published = exactYoutubePublished(renderer.publishedAt) ?? exactYoutubePublished(renderer.publishDate)
    ?? exactYoutubePublished(renderer.uploadDate) ?? exactYoutubePublished(label);
  return { ...(type ? { youtubeType: type } : {}), ...(published ? { published } : {}) };
}
