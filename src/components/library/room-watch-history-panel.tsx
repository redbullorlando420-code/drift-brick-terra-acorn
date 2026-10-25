import { memo, useMemo, useState } from 'react';
import { History, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveRoomMedia, roomMediaKey } from '@/lib/multiplayer/room-media';
import type { RoomWatchEntry } from '@/lib/multiplayer/room-watch-history';
import type { LibraryVideo } from '@/lib/videos/types';
import { RoomVideoSummary } from './room-video-summary';
export const RoomWatchHistoryPanel = memo(function RoomWatchHistoryPanel({entries, writable, full, guest, pending, queuedKeys, onPlay, onQueue, onClear, notice}: {
  entries: RoomWatchEntry[]; writable: boolean; full: boolean; guest: boolean; pending: number; queuedKeys: string[];
  onPlay:(video:LibraryVideo)=>void; onQueue:(video:LibraryVideo)=>void; onClear:()=>void; notice:string;
}) {
  const [query,setQuery]=useState(''),[limit,setLimit]=useState(12);
  const rows=useMemo(()=>entries.flatMap(entry=>{const video=resolveRoomMedia(entry.media)?.video;return video && `${video.name} ${video.remote?.channelName ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())?[{...entry,video}]:[];}),[entries,query]);
  return <section aria-label="Watch Together history" className="rounded-lg border border-border bg-elevated p-4 shadow-border">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 tabIndex={-1} className="flex items-center gap-2 font-medium text-fg"><History className="size-4 text-accent"/>Your watch history</h3><span className="text-xs text-muted">{entries.length} saved</span></div>
    <p className="mt-2 text-xs leading-5 text-muted">Your last 80 public videos watched in Watch Together, including the current video. Saved on this browser across rooms and reloads. Local files stay private and are excluded.</p>
    {!!entries.length && <Input className="mt-3" aria-label="Search watch history" placeholder="Find a watched video or creator" value={query} onChange={event=>{setQuery(event.target.value);setLimit(12);}}/>}
    <ol className="mt-3 max-h-96 space-y-3 overflow-y-auto" aria-label="Saved watched videos">{rows.slice(0,limit).map(({media,video,watchedAt})=><li key={roomMediaKey(video)} className="rounded-md bg-bg/45 p-3"><RoomVideoSummary video={video}/><p className="mt-2 text-xs text-subtle">Watched {new Date(watchedAt).toLocaleString()}</p><div className="mt-2 flex flex-wrap gap-1"><Button size="sm" variant="secondary" className="min-h-11" disabled={!writable || guest && pending>0} onClick={()=>onPlay(video)} aria-label={`Watch again ${media.name}`}><Play className="size-3"/>Watch again</Button><Button size="sm" variant="ghost" className="min-h-11" disabled={!writable || full || queuedKeys.includes(roomMediaKey(video)) || guest && pending>0} onClick={()=>onQueue(video)} aria-label={`Queue from history ${media.name}`}><Plus className="size-3"/>{queuedKeys.includes(roomMediaKey(video))?'Already queued':'Queue'}</Button></div></li>)}</ol>
    {!rows.length && <p className="mt-3 text-xs text-muted">{entries.length?'No watched videos match.':'Start a public video in the room to save it here.'}</p>}
    {rows.length>limit && <Button size="sm" variant="secondary" className="mt-3 min-h-11" onClick={()=>setLimit(value=>value+12)}>Show more history</Button>}
    {!!entries.length && <Button size="sm" variant="ghost" className="mt-3 min-h-11" onClick={onClear}>Clear my room history</Button>}
    {notice && <p role="status" className="mt-2 text-xs text-accent">{notice}</p>}
  </section>;
});
