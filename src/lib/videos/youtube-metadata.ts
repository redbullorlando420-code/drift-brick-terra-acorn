import type { LibraryVideo, RemoteRef } from './types.ts';

export type YoutubeContentKind = 'upload' | 'short' | 'replay' | 'live' | 'upcoming';
export type YoutubePublishedSource = 'rss' | 'provider' | 'watch' | 'unknown' | 'legacy';
const minimumDate = Date.UTC(2000, 0, 1);
export function youtubePublicationTime(video: LibraryVideo) {
  const remote = video.remote;
  if (remote?.kind === 'youtube' && remote.publishedSource !== 'rss' && remote.publishedSource !== 'provider' && remote.publishedSource !== 'watch') return 0;
  return remote?.publishedSource === 'unknown' || !Number.isFinite(video.addedAt) || video.addedAt <= minimumDate ? 0 : video.addedAt;
}
export function youtubeContentKind(video: LibraryVideo): YoutubeContentKind {
  if (video.remote?.live) return 'live';
  const type = video.remote?.youtubeType;
  return type === 'short' || type === 'replay' || type === 'live' || type === 'upcoming' ? type : 'upload';
}
export function youtubeDateSource(video: LibraryVideo): YoutubePublishedSource {
  if (!youtubePublicationTime(video)) return 'unknown';
  const source = video.remote?.publishedSource;
  return source === 'rss' || source === 'provider' || source === 'watch' ? source : 'legacy';
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
const priority: Record<YoutubePublishedSource, number> = { unknown: 0, legacy: 1, provider: 2, rss: 3, watch: 4 };
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
  const keepTags = !next.youtubeTagsCheckedAt && Boolean(old.youtubeTagsCheckedAt);
  const keepDuration = !(Number.isFinite(incoming.duration) && incoming.duration! > 0) && Number.isFinite(previous.duration) && previous.duration! > 0;
  if (!keepDate && !keepKind && !keepLive && !keepTags && !keepDuration) return incoming;
  return { ...incoming, ...(keepDuration ? { duration: previous.duration } : {}), ...(keepDate ? { addedAt: previous.addedAt } : {}), remote: { ...next,
    ...(keepDate ? { publishedSource: oldSource } : {}),
    ...(keepDate && old.publishedDate ? { publishedDate: old.publishedDate } : {}),
    ...(keepKind ? { youtubeType: old.youtubeType } : {}),
    ...(keepLive ? { live: old.live, observedAt: old.observedAt, viewers: old.viewers } : {}),
    ...(keepTags ? { youtubeKeywords: old.youtubeKeywords, youtubeTagsCheckedAt: old.youtubeTagsCheckedAt, youtubeTagSummary: old.youtubeTagSummary } : {}),
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
export function youtubeRuntime(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 && value <= 31_536_000 ? value : undefined;
  if (typeof value !== 'string' || !/^\d{1,4}:\d{2}(?::\d{2})?$/.test(value.trim())) return;
  const parts = value.trim().split(':').map(Number);
  if (parts.slice(1).some(part => part > 59)) return;
  return youtubeRuntime(parts.reduce((total, part) => total * 60 + part, 0));
}
export function youtubeRendererMetadata(renderer: {
  youtubeType?: YoutubeContentKind; publishedAt?: string; publishDate?: string; uploadDate?: string;
  publishedTimeText?: Text; upcomingEventData?: unknown; isLive?: boolean; isLiveContent?: boolean;
  lengthText?: Text;
  thumbnailOverlays?: Array<{ thumbnailOverlayTimeStatusRenderer?: { style?: string; text?: Text } }>;
  badges?: Array<{ metadataBadgeRenderer?: { style?: string } }>;
  navigationEndpoint?: { reelWatchEndpoint?: unknown; commandMetadata?: { webCommandMetadata?: { url?: string } } };
}): Pick<RemoteRef, 'youtubeType'> & { published?: string; duration?: number } {
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
  const duration = type === 'live' || type === 'upcoming' ? undefined : youtubeRuntime(text(renderer.lengthText))
    ?? renderer.thumbnailOverlays?.map(row => youtubeRuntime(text(row.thumbnailOverlayTimeStatusRenderer?.text))).find(Boolean);
  return { ...(type ? { youtubeType: type } : {}), ...(published ? { published } : {}), ...(duration ? { duration } : {}) };
}
