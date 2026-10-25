import { memo } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROOM_SUGGESTION_LIMIT, type RoomSuggestion } from '@/lib/multiplayer/room-suggestions';
export const RoomSuggestionsPanel = memo(function RoomSuggestionsPanel({ items, guest, enabled, full, notice, onDecide }: {
  items: RoomSuggestion[]; guest: boolean; enabled: boolean; full: boolean; notice: string;
  onDecide: (id: string, action: 'end' | 'next' | 'dismiss') => void;
}) {
  return <section aria-label="Guest video suggestions" className="rounded-lg border border-border bg-elevated p-4 shadow-border">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 tabIndex={-1} className="flex items-center gap-2 text-sm font-medium text-fg"><ClipboardList className="size-4 text-accent" />Guest suggestions</h3><span className="text-xs text-accent">{items.length} / {ROOM_SUGGESTION_LIMIT} awaiting review</span></div>
    <p className="mt-2 text-xs leading-5 text-muted">{guest ? 'Suggestions are separate from the live queue. The host decides what plays next.' : 'Approve a public video to the end or next position without interrupting playback. Undo restores the queue; resolved requests stay resolved.'} Up to 8 pending per guest connection. Requests last for this host session.</p>
    {!enabled && <p className="mt-2 text-xs text-muted">New suggestions are closed. Existing requests stay here for the host to resolve.</p>}
    {full && !guest && <p role="status" className="mt-2 text-xs text-accent">The live queue is full. Remove a queued title before approving another video.</p>}
    {notice && <p role="status" className="mt-2 text-xs text-accent">{notice}</p>}
    <ol className="mt-3 max-h-96 space-y-2 overflow-y-auto">
      {items.map(item => <li key={item.id} data-room-suggestion-id={item.id} className="rounded-md bg-bg/45 p-3">
        <p className="break-words text-sm font-medium text-fg">{item.media.name}</p><p className="mt-1 break-words text-xs text-muted">Suggested by {item.name} · {item.media.kind === 'youtube' ? 'YouTube' : 'Twitch'}</p>
        <a href={item.media.watchUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center text-xs text-accent underline">Open public video</a>
        {!guest && <div className="mt-2 flex flex-wrap gap-1"><Button size="sm" variant="secondary" className="min-h-11" disabled={full} onClick={() => onDecide(item.id, 'end')}>Approve to end</Button><Button size="sm" variant="ghost" className="min-h-11" disabled={full} onClick={() => onDecide(item.id, 'next')}>Approve next</Button><Button size="sm" variant="ghost" className="min-h-11" onClick={() => onDecide(item.id, 'dismiss')}>Dismiss</Button></div>}
      </li>)}
    </ol>
    {!items.length && <p className="mt-3 text-xs text-muted">No suggestions waiting. Guests can paste public links or suggest a public library video when review mode is enabled.</p>}
  </section>;
});
