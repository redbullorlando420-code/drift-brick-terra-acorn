import { memo, useMemo } from 'react';
import { History, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveRoomMedia, roomMediaKey, type RoomMediaDescriptor } from '@/lib/multiplayer/room-media';
import type { LibraryVideo } from '@/lib/videos/types';

export const RoomRecentPanel = memo(function RoomRecentPanel({ media, currentKey, queuedKeys, writable, guest, pending, full, onPlay, onQueue }: {
  media: RoomMediaDescriptor[]; currentKey?: string; queuedKeys: string[]; writable: boolean;
  guest: boolean; pending: number; full: boolean;
  onPlay: (video: LibraryVideo) => void; onQueue: (video: LibraryVideo) => void;
}) {
  const videos = useMemo(() => media.flatMap(value => {
    const video = resolveRoomMedia(value)?.video;
    return video ? [video] : [];
  }), [media]);
  const rows = videos.filter(video => roomMediaKey(video) !== currentKey);
  return <section aria-label="Recently played in this room" className="rounded-lg border border-border bg-elevated p-4 shadow-border">
    <h3 className="flex items-center gap-2 text-sm font-medium text-fg"><History className="size-4 text-accent" />Recently played</h3>
    <p className="mt-2 text-xs leading-5 text-muted">Return to a skipped video or add it back without changing what’s playing. Up to 12 public videos from this room session; local files are excluded.</p>
    <ol className="mt-3 max-h-72 space-y-2 overflow-y-auto">
      {rows.map(video => <li key={roomMediaKey(video)} className="rounded-md bg-bg/45 p-3">
        <p className="break-words text-sm text-fg">{video.name}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <Button size="sm" variant="secondary" className="min-h-11" disabled={!writable || guest && pending > 0} onClick={() => onPlay(video)} aria-label={`${guest ? 'Request replay of' : 'Replay'} ${video.name}`}><Play className="size-3" />{guest ? 'Request replay' : 'Replay'}</Button>
          <Button size="sm" variant="ghost" className="min-h-11" disabled={!writable || full || queuedKeys.includes(roomMediaKey(video)) || guest && pending > 0} onClick={() => onQueue(video)} aria-label={`Requeue ${video.name}`}><Plus className="size-3" />{queuedKeys.includes(roomMediaKey(video)) ? 'Already queued' : 'Queue again'}</Button>
        </div>
      </li>)}
    </ol>
    {!rows.length && <p className="mt-3 text-xs text-muted">Public videos appear here when the host switches to another title.</p>}
  </section>;
});
