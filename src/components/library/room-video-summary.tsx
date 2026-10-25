import { memo, useState } from 'react';
import { Film } from 'lucide-react';
import type { LibraryVideo } from '@/lib/videos/types';

export function roomVideoDuration(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return '';
  const total = Math.floor(seconds), hours = Math.floor(total / 3600);
  return `${hours ? `${hours}:` : ''}${String(Math.floor(total / 60) % 60).padStart(hours ? 2 : 1, '0')}:${String(total % 60).padStart(2, '0')}`;
}
export const RoomVideoSummary = memo(function RoomVideoSummary({video, children, description = false}: {video: LibraryVideo; children?: React.ReactNode; description?: boolean}) {
  const poster = video.poster || (video.remote?.kind === 'youtube' && video.remote.videoId ? `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg` : undefined);
  const [failed, setFailed] = useState<string>();
  const date = video.remote?.publishedDate?.slice(0,10) || video.remote?.publishedLabel;
  const provider = video.remote?.kind === 'youtube' ? 'YouTube' : video.remote?.kind === 'twitch' ? 'Twitch' : 'Local video';
  return <div className="flex min-w-0 items-start gap-3">
    <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-surface sm:w-28">
      {poster && failed !== poster ? <img src={poster} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setFailed(poster)}/> : <div className="flex h-full items-center justify-center text-muted"><Film className="size-6"/></div>}
      {(video.remote?.live || video.duration) && <span className="absolute bottom-1 right-1 rounded-sm bg-bg px-1 text-xs text-fg">{video.remote?.live ? 'LIVE' : roomVideoDuration(video.duration)}</span>}
    </div>
    <div className="min-w-0 flex-1">
      {children ?? <p className="line-clamp-2 break-words text-sm font-medium text-fg" title={video.name}>{video.name}</p>}
      <p className="mt-1 break-words text-xs text-muted">{provider}{video.remote?.channelName ? ` · ${video.remote.channelName}` : ''}</p>
      {(date || video.remote?.views !== undefined) && <p className="mt-1 text-xs text-subtle">{[date, video.remote?.views !== undefined ? `${new Intl.NumberFormat(undefined,{notation:'compact'}).format(video.remote.views)} views` : ''].filter(Boolean).join(' · ')}</p>}
      {description && video.description && <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-muted">{video.description}</p>}
    </div>
  </div>;
});
