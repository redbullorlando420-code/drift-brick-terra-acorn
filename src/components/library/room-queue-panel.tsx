import { useRoomListFocus } from './use-room-list-focus';
import { RoomSessionFilePanel } from './room-session-file-panel';
import type { RoomSessionFile } from '@/lib/multiplayer/room-session-file';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Play, Shuffle, Undo2, X, ListChecks, Copy, Download } from "lucide-react";
import { memo, useMemo, useRef, useState } from "react";
import type { LibraryVideo } from "@/lib/videos/types";
import type { RoomQueueAction, RoomQueueEdit } from "@/lib/multiplayer/room-queue";
import { ROOM_QUEUE_LIMIT } from "@/lib/multiplayer/room-queue";
import { describeRoomMedia, parseRoomLinks, roomMediaKey } from "@/lib/multiplayer/room-media";
import { roomQueueLinks } from "@/lib/multiplayer/room-queue-session";
import { RoomPlaylistsPanel } from './room-playlists-panel';
import type { RoomMediaDescriptor } from '@/lib/multiplayer/room-media';
import { RoomVideoSummary } from './room-video-summary';
import { RoomVideoSearch } from './room-video-search';
import type { RoomHostCatalog } from '@/lib/multiplayer/room-host-catalog';
export const RoomQueuePanel = memo(function RoomQueuePanel({
  candidates,
  queue,
  currentId,
  currentMediaKey,
  guest,
  notice,
  pending = 0,
  autoAdvance,
  onAutoAdvance,
  onSelect,
  onAdd,
  onChange,
  onEdit,
  onClear,
  onNext,
  onShuffle,
  onLink,
  catalogPending = false,
  writable = true,
  suggesting = false,
  reviewMode = false,
  onReviewMode,
  guestEditing = true,
  onGuestEditing,
  onUndo,
  canUndo = false,
  onRestore,
  savedCount = 0,
  currentTitle,
  onLoadList,
  hostCatalog,
  preferHost,
  currentMedia, playedMedia, onImportSession,
}: {
  candidates: LibraryVideo[];
  queue: Array<{ id: string; video?: LibraryVideo }>;
  currentId: string;
  currentMediaKey?: string;
  guest: boolean;
  notice: string;
  pending?: number;
  autoAdvance: boolean;
  onAutoAdvance: (value: boolean) => void;
  onSelect: (video: LibraryVideo) => void;
  onAdd: (video: LibraryVideo) => void;
  onChange: (action: RoomQueueAction) => void;
  onEdit: (edit: RoomQueueEdit) => boolean;
  onClear: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onLink: (value: string) => boolean;
  catalogPending?: boolean;
  writable?: boolean;
  suggesting?: boolean;
  reviewMode?: boolean;
  onReviewMode?: (value: boolean) => void;
  guestEditing?: boolean;
  onGuestEditing?: (value: boolean) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onRestore?: () => void;
  savedCount?: number;
  currentTitle?: string;
  onLoadList: (media: RoomMediaDescriptor[]) => boolean;
  hostCatalog?:RoomHostCatalog;
  preferHost?:boolean;
  currentMedia?:RoomMediaDescriptor|null;
  playedMedia?:RoomMediaDescriptor[];
  onImportSession:(file:RoomSessionFile)=>boolean;
}) {
  const focusRoot = useRef<HTMLElement>(null);
  useRoomListFocus(focusRoot, 'data-room-queue-id', queue.map(row=>row.id));
  const [link, setLink] = useState("");
  const suggestMode = guest && reviewMode;
  const canAdd = writable || suggesting;
  const [queueSearch, setQueueSearch] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  const [moving, setMoving] = useState<{ id: string; before: string }>();
  const [exportNotice, setExportNotice] = useState('');
  const selected = queue.filter(row => selection.includes(row.id)).map(row => row.id);
  const matches = (video?: LibraryVideo) => !queueSearch.trim() || `${video?.name ?? ''} ${video?.remote?.channelName ?? ''}`.toLowerCase().includes(queueSearch.trim().toLowerCase());
  const visibleIds = queue.filter(row => matches(row.video)).map(row => row.id);
  const publicMedia = useMemo(() => queue.flatMap(row => {
    const media = describeRoomMedia(row.video); return media ? [media] : [];
  }).filter(media => media.kind !== 'local'), [queue]);
  const sessionMedia=useMemo(()=>queue.map(row=>describeRoomMedia(row.video)),[queue]);
  const exportedLinks = useMemo(() => roomQueueLinks(publicMedia), [publicMedia]);
  const publicCount = exportedLinks ? exportedLinks.split('\n').length : 0;
  const applySelection = (kind: RoomQueueEdit['kind']) => {
    if (selected.length && onEdit({ kind, ids: selected })) setSelection([]);
  };
  const copyLinks = async () => {
    try { await navigator.clipboard.writeText(exportedLinks); setExportNotice(`${publicCount} public links copied in queue order.`); }
    catch { setExportNotice('Copy is unavailable here. Select the links below and copy them, or download the queue.'); }
  };
  const downloadLinks = () => {
    try {
      const url = URL.createObjectURL(new Blob([exportedLinks + '\n'], { type: 'text/plain;charset=utf-8' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'watch-together-queue.txt';
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportNotice('Queue downloaded. Paste its links into Add videos to reuse it.');
    } catch { setExportNotice('The download could not start. You can select and copy the links below.'); }
  };
  const pasted = useMemo(() => link.trim() ? parseRoomLinks(link) : undefined, [link]);
  const queuedKeys = new Set(queue.flatMap(row => row.video ? [roomMediaKey(row.video)] : []));
  const knownSeconds = queue.reduce((sum, row) => sum + (row.video?.remote?.live || !Number.isFinite(row.video?.duration) ? 0 : Math.min(43_200, Math.max(0, row.video?.duration ?? 0))), 0);
  const unknownDuration = queue.filter(row => !Number.isFinite(row.video?.duration) || (row.video?.duration ?? 0) <= 0 || row.video?.remote?.live).length;
  return (
    <section ref={focusRoot} data-room-a11y
      className="rounded-lg border border-border bg-elevated p-4 shadow-border"
      aria-label="Room query and queue"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-widest text-accent uppercase">Watch queue</p>
          <h3 data-room-list-heading tabIndex={-1} className="scroll-mt-36 mt-1 font-display text-xl text-fg">Up next for everyone</h3>
        </div>
        <span className="rounded-full bg-accent/15 px-2 py-1 text-xs text-accent">
          {queue.length} / {ROOM_QUEUE_LIMIT} queued
        </span>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-room-queue-summary>{queue.length} titles queued. {currentTitle ? `On stage: ${currentTitle}.` : 'No video selected.'} {queue[0]?.video?.name ? `Up next: ${queue[0].video.name}.` : 'No upcoming title.'}</p>
      <div className="mt-3 rounded-md border border-border bg-bg/50 p-3" aria-label="Room current video"><p className="text-xs text-muted">On the stage</p><p className="mt-1 break-words text-sm font-medium text-fg">{currentTitle || 'Choose a video to start watching'}</p>{queue[0] && <p className="mt-2 break-words text-xs text-accent">Next: {queue[0].video?.name ?? 'Waiting for title details…'}</p>}</div>
      <p className="mt-2 text-xs leading-5 text-muted">{queue.length ? `${Math.ceil(knownSeconds / 60)} min of known runtime${unknownDuration ? ` · ${unknownDuration} live or unknown-length title${unknownDuration === 1 ? '' : 's'}` : ''}` : 'Your queue is ready for links or library videos.'}</p>
      {guest && !writable && <p role="status" className="mt-2 text-xs leading-5 text-accent">{suggesting ? 'Review mode: suggest public videos below. The host approves additions; live queue edits and video selection are host-controlled.' : guestEditing ? 'Waiting for the host connection. The last confirmed queue stays visible.' : 'The host has locked queue edits and video selection. Chat and playback timing still work.'}</p>}
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-fg">
            Up next · {guest ? "host confirms changes" : "shared order"}
          </p>
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="ghost" className="min-h-11" disabled={!selecting && (!writable || !queue.length)} aria-pressed={selecting} onClick={() => { setSelecting(!selecting); setSelection([]); setMoving(undefined); }}><ListChecks className="size-3" />{selecting ? 'Done selecting' : 'Select titles'}</Button>
            <Button size="sm" variant="secondary" className="min-h-11" disabled={!writable || !queue.length || guest && pending > 0} onClick={onNext}>
              <Play className="size-3" />{guest ? "Request next" : "Play next"}
            </Button>
            <Button size="sm" variant="ghost" className="min-h-11" disabled={!writable || queue.length < 2} onClick={onShuffle} aria-label={guest ? "Request queue shuffle" : "Shuffle queue"}>
              <Shuffle className="size-3" />Shuffle
            </Button>
          {!guest && queue.length > 0 && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              Clear queue
            </Button>
          )}
          {!guest && onUndo && <Button size="sm" variant="ghost" className="min-h-11" disabled={!canUndo} onClick={onUndo}><Undo2 className="size-3" />Undo queue change</Button>}
          </div>
        </div>
        {!guest && !queue.length && savedCount > 0 && !canUndo && onRestore && <div className="mt-3 rounded-md border border-border bg-bg/50 p-3"><Button size="sm" variant="secondary" className="min-h-11" onClick={onRestore}>Restore saved queue · {savedCount}</Button><p className="mt-2 text-xs leading-5 text-muted">Restores public links from this browser. Local files need to be selected again. Playback starts when you choose Play next.</p></div>}
        <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-xs text-accent">
          {pending > 0 && <span className="mb-1 block">{pending} change{pending === 1 ? "" : "s"} awaiting host confirmation · checking receipts before retry</span>}
          {notice ||
            (guest
              ? "Queue changes go to the host; everyone sees the confirmed order."
              : "Queue order is shared with every guest.")}
        </p>
        {(queue.length > 5 || !!queueSearch) && <Input className="mt-3" value={queueSearch} onChange={event => setQueueSearch(event.target.value)} aria-label="Find a queued title" placeholder="Find in this queue" />}
        {selecting && <div className="mt-3 rounded-md border border-accent/35 bg-accent/5 p-3" aria-label="Selected queue controls">
          <p role="status" className="text-sm font-medium text-fg">{selected.length} selected{selected.some(id => !visibleIds.includes(id)) ? ' · includes filtered titles' : ''}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <Button size="sm" variant="ghost" className="min-h-11" disabled={!writable || !visibleIds.length} onClick={() => setSelection([...new Set([...selected, ...visibleIds])])}>Select visible titles</Button>
            <Button size="sm" variant="ghost" className="min-h-11" disabled={!selected.length} onClick={() => setSelection([])}>Clear selection</Button>
            <Button size="sm" variant="secondary" className="min-h-11" disabled={!writable || !selected.length || guest && pending > 0} onClick={() => applySelection('next')}>Queue selected next</Button>
            <Button size="sm" variant="ghost" className="min-h-11" disabled={!writable || !selected.length || guest && pending > 0} onClick={() => applySelection('end')}>Move selected to end</Button>
            <Button size="sm" variant="ghost" className="min-h-11" disabled={!writable || !selected.length || guest && pending > 0} onClick={() => applySelection('remove')}>Remove selected</Button>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">Moves preserve the host’s latest order within your selection. Playing videos stay on stage. {guest ? 'The host confirms each batch.' : 'Undo restores the whole batch.'}</p>
        </div>}
        <ol aria-label="Shared upcoming titles" tabIndex={0} className="mt-3 max-h-128 space-y-3 overflow-y-auto overscroll-contain">
          {queue.map(({ id, video }, index) => (
            <li key={id} data-room-queue-id={id} hidden={!matches(video)} className={`rounded-md border p-3 ${index === 0 ? 'border-accent/35 bg-accent/5' : 'border-transparent bg-bg/45'}`}>
              <div className="flex min-w-0 items-center gap-2">
                {selecting && <label className="flex min-h-11 min-w-11 items-center justify-center"><input type="checkbox" aria-label={`Select ${video?.name ?? id} for queue changes`} checked={selected.includes(id)} disabled={!writable} onChange={event => setSelection(event.target.checked ? [...selected, id] : selected.filter(value => value !== id))} /></label>}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent" aria-label={`Position ${index+1}`}>{index + 1}</span>
                <div className="min-w-0 flex-1">{video ? <RoomVideoSummary video={video}/> : <p className="text-sm text-muted">Waiting for title details…</p>}</div>
              </div>
              {index===0 && <p className="mt-2 text-xs font-medium text-accent">Up next</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="min-h-11"
                  disabled={!writable || !video || guest && pending > 0}
                  data-room-focus-action="play" onClick={() => video && onSelect(video)}
                  aria-label={`${guest ? "Request playback of" : "Play"} ${video?.name ?? id}`}
                >
                  <Play className="size-3" />
                  {guest ? "Request play" : "Play"}
                </Button>
                <Button size="sm" variant="ghost" className="min-h-11" disabled={!writable || index===0} aria-label={`Queue ${video?.name??id} next`} onClick={()=>onChange({kind:"next",id})}>
                  Next
                </Button>
                <Button size="sm" variant="ghost" className="min-h-11" disabled={!writable || queue.length < 2} aria-expanded={moving?.id === id} data-room-focus-action="move" aria-label={`Change position of ${video?.name ?? id}`} onClick={() => setMoving(moving?.id === id ? undefined : { id, before: queue[index + 1]?.id ?? '' })}>Move to…</Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  disabled={!writable || index === 0}
                  aria-label={`Move ${video?.name ?? id} up`}
                  onClick={() => onChange({ kind: "up", id })}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  disabled={!writable || index === queue.length - 1}
                  aria-label={`Move ${video?.name ?? id} down`}
                  onClick={() => onChange({ kind: "down", id })}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  data-room-focus-action="remove" aria-label={`Remove ${video?.name ?? id} from queue`}
                  disabled={!writable}
                  onClick={() => onChange({ kind: "remove", id })}
                >
                  <X className="size-4" />
                </Button>
              </div>
              {moving?.id === id && <form className="mt-2 flex flex-wrap items-center gap-2" aria-label={`Move ${video?.name ?? id} to position`} onSubmit={event => { event.preventDefault(); if (writable) { onChange({ kind: 'move', id, before: moving.before || undefined }); setMoving(undefined); event.currentTarget.closest('li')?.querySelector<HTMLElement>('[data-room-focus-action="move"]')?.focus(); } }}>
                <label className="flex min-h-11 items-center gap-2 text-xs text-muted">Position
                  <select aria-label={`New position for ${video?.name ?? id}`} className="min-h-11 max-w-48 rounded-sm border border-border bg-surface px-2 text-sm text-fg" disabled={!writable} value={queue.some(row => row.id === moving.before) ? moving.before : ''} onChange={event => setMoving({ id, before: event.target.value })}>
                    {queue.filter(row => row.id !== id).map((row, target) => <option key={row.id} value={row.id}>{target + 1} · before {row.video?.name ?? 'waiting title'}</option>)}
                    <option value="">{queue.length} · end of queue</option>
                  </select>
                </label>
                <Button type="submit" size="sm" variant="secondary" className="min-h-11" disabled={!writable || guest && pending > 0}>Apply position</Button>
                <Button type="button" size="sm" variant="ghost" className="min-h-11" onClick={event => {setMoving(undefined);event.currentTarget.closest('li')?.querySelector<HTMLElement>('[data-room-focus-action="move"]')?.focus();}}>Cancel move</Button>
              </form>}
            </li>
          ))}
        </ol>
        {!!queue.length && !!queueSearch.trim() && !queue.some(row => `${row.video?.name ?? ''} ${row.video?.remote?.channelName ?? ''}`.toLowerCase().includes(queueSearch.trim().toLowerCase())) && <p className="mt-3 text-xs text-muted">No queued titles match. Clear this filter to see the full order.</p>}
        {!queue.length && (
          <p className="mt-3 text-xs text-muted">
            Add links below or search your library. YouTube and Twitch entries carry their own playback
            details.
          </p>
        )}
      </div>
        {!guest && (
          <label className="mt-3 flex min-h-11 items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(event) => onAutoAdvance(event.target.checked)}
              aria-label="Automatically play next queued title"
            />
            Automatically play next when this video ends
          </label>
        )}
        {!guest && onGuestEditing && <label className="mt-1 flex min-h-11 items-center gap-2 text-xs text-muted"><input type="checkbox" checked={guestEditing} onChange={event => onGuestEditing(event.target.checked)} aria-label="Allow guests to edit queue and select videos" />Allow guests to edit the queue and select videos</label>}
        {!guest && onReviewMode && <div className="mt-1"><label className="flex min-h-11 items-center gap-2 text-xs text-muted"><input type="checkbox" checked={reviewMode} onChange={event => onReviewMode(event.target.checked)} aria-label="Review guest additions before queuing" />Review guest additions before queuing</label><p className="text-xs leading-5 text-muted">When guest access is enabled, review mode permits public video suggestions instead of direct queue edits or video selection. Existing requests remain until approved or dismissed.</p></div>}
      <RoomSessionFilePanel current={currentMedia} played={playedMedia} queue={sessionMedia} guest={guest} writable={writable} onImport={onImportSession}/>
      <RoomPlaylistsPanel media={publicMedia} omitted={queue.length - publicCount} canAdd={canAdd} suggesting={suggestMode} pending={guest && pending > 0} full={queue.length >= ROOM_QUEUE_LIMIT} onLoad={onLoadList} />
      {!!queue.length && <details className="mt-4 border-t border-border pt-2"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-fg">Save or share queue links · {publicCount}</summary>
        <p className="text-xs leading-5 text-muted">Exports upcoming public links in their confirmed order. Paste them into Add videos in any room. {queue.length - publicCount > 0 && `${queue.length - publicCount} local or unavailable title${queue.length - publicCount === 1 ? '' : 's'} omitted.`} The current video and room invitation are separate.</p>
        <div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="secondary" className="min-h-11" disabled={!publicCount} onClick={copyLinks}><Copy className="size-3" />Copy queue links</Button><Button size="sm" variant="ghost" className="min-h-11" disabled={!publicCount} onClick={downloadLinks}><Download className="size-3" />Download queue</Button></div>
        {!!publicCount && <textarea readOnly rows={3} aria-label="Exported queue links" className="mt-2 w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-fg" value={exportedLinks} onFocus={event => event.target.select()} />}
        <p role="status" className="mt-2 text-xs text-accent">{exportNotice}</p>
      </details>}
      <details open className="mt-5 border-t border-border pt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-fg">Add videos from links or your library</summary>
      <form
        className="mt-4 space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          // Keep a guest's paste available if confirmation times out. The
          // canonical queue deduplicates resubmissions after a reconnect.
          if (onLink(link) && !guest) setLink("");
        }}
      >
        <textarea
          aria-label="Public video link"
          placeholder="Paste YouTube or Twitch links, one per line"
          rows={2}
          maxLength={32768}
          className="min-h-20 w-full resize-y rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          value={link}
          onChange={(event) => setLink(event.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          className="min-h-11"
          disabled={!canAdd || !link.trim() || !suggestMode && queue.length >= ROOM_QUEUE_LIMIT || suggestMode && pending > 0}
        >
          {suggestMode ? 'Suggest links' : 'Add link to queue'}
        </Button>
        {pasted && <p className="text-xs leading-5 text-muted">{pasted.videos.length} valid link{pasted.videos.length === 1 ? '' : 's'}{pasted.duplicates ? ` · ${pasted.duplicates} repeated` : ''}{pasted.invalid ? ` · ${pasted.invalid} invalid` : ''}{pasted.truncated ? ' · first 48 checked' : ''}</p>}
        {guest && link && <Button type="button" size="sm" variant="ghost" className="ml-2 min-h-11" onClick={() => setLink("")}>Clear pasted links</Button>}
        <p className="text-xs leading-5 text-muted">
          Paste up to 48 links in one batch, even with an empty library. Local files play from the
          host.
          {guest && " Your pasted links stay here until you clear them."}
          {suggestMode && ' Suggestions wait for host review and do not change the live queue. Up to 8 pending per guest connection.'}
        </p>
      </form>
      <RoomVideoSearch candidates={candidates} catalogPending={catalogPending} writable={writable} canAdd={canAdd} suggestMode={suggestMode} pending={pending>0} full={queue.length>=ROOM_QUEUE_LIMIT} queuedKeys={queuedKeys} currentKey={currentMediaKey} onPlay={onSelect} onAdd={onAdd} hostCatalog={hostCatalog} preferHost={preferHost}/>
      </details>
    </section>
  );
});
