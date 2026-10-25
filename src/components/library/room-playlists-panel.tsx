import { memo, useEffect, useState } from 'react';
import { Bookmark, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createLocalId } from '@/lib/local-id';
import { ROOM_PLAYLISTS_KEY, ROOM_PLAYLIST_LIMIT, readRoomPlaylists, writeRoomPlaylists, roomPlaylist, roomPlaylistName, type RoomPlaylist } from '@/lib/multiplayer/room-playlists';
import { roomQueueLinks } from '@/lib/multiplayer/room-queue-session';
import type { RoomMediaDescriptor } from '@/lib/multiplayer/room-media';

const readLists = () => {
  const items = readRoomPlaylists(localStorage.getItem(ROOM_PLAYLISTS_KEY));
  if (!items) throw Error('Saved lists could not be read. Existing saved data has been kept.');
  return items;
};

export const RoomPlaylistsPanel = memo(function RoomPlaylistsPanel({ media, omitted, canAdd, suggesting, pending, full, onLoad }: {
  media: RoomMediaDescriptor[]; omitted: number; canAdd: boolean; suggesting: boolean;
  pending: boolean; full: boolean; onLoad: (media: RoomMediaDescriptor[]) => boolean;
}) {
  const [initial] = useState(() => { try { return { items: readLists(), error: '' }; } catch { return { items: [], error: 'Saved lists are unavailable. Browser storage may be blocked or unreadable.' }; } });
  const [items, setItems] = useState<RoomPlaylist[]>(initial.items);
  const [notice, setNotice] = useState(initial.error);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<string>();
  const [renaming, setRenaming] = useState('');
  const [removed, setRemoved] = useState<RoomPlaylist>();
  const [previewing, setPreviewing] = useState<string>();
  useEffect(() => {
    const update = (event: StorageEvent) => {
      if (event.key !== ROOM_PLAYLISTS_KEY && event.key !== null) return;
      try { setItems(readLists()); setNotice('Saved lists updated from another tab.'); }
      catch (error) { setNotice(error instanceof Error ? error.message : 'Saved lists are unavailable.'); }
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);
  const commit = (change: (latest: RoomPlaylist[]) => RoomPlaylist[], message: string) => {
    try {
      // Read on explicit edits so an idle room tab cannot overwrite newer lists.
      const next = change(readLists());
      localStorage.setItem(ROOM_PLAYLISTS_KEY, writeRoomPlaylists(next));
      setItems(next); setNotice(message); return true;
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not save lists. Your live queue is unchanged.'); return false; }
  };
  const requireName = (value: string, latest: RoomPlaylist[], except?: string) => {
    const clean = roomPlaylistName(value);
    if (!clean) throw Error('Enter a list name.');
    if (latest.some(item => item.id !== except && item.name.toLowerCase() === clean.toLowerCase())) throw Error('That name already exists. Rename it or use Replace with queue to update it.');
    return clean;
  };
  const save = () => {
    if (!media.length) { setNotice('Queue a public YouTube or Twitch video before saving a list.'); return; }
    if (commit(latest => {
      if (latest.length >= ROOM_PLAYLIST_LIMIT) throw Error('All 12 list slots are in use. Update or remove a saved list first.');
      const item = roomPlaylist(createLocalId('list-'), requireName(name, latest), media);
      if (!item) throw Error('No public videos could be saved.');
      return [item, ...latest];
    }, 'List saved in this browser. The playing video and live queue are unchanged.')) setName('');
  };
  const changeItem = (id: string, change: (item: RoomPlaylist, latest: RoomPlaylist[]) => RoomPlaylist, message: string) => commit(latest => {
    if (!latest.some(item => item.id === id)) throw Error('This list was removed in another tab.');
    return latest.map(item => item.id === id ? change(item, latest) : item);
  }, message);
  return <details className="mt-4 border-t border-border pt-2" aria-label="Saved watch lists">
    <summary className="flex min-h-11 cursor-pointer items-center gap-2 py-3 text-sm font-medium text-fg"><Bookmark className="size-4 text-accent" />Saved watch lists · {items.length}</summary>
    <p className="text-xs leading-5 text-muted">Keep up to 12 named lists in this browser, with 48 public videos each. Add a list to the end of the queue without starting playback. Local files and the current video are excluded.</p>
    <form className="mt-3 flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); save(); }}>
      <Input value={name} maxLength={64} onChange={event => setName(event.target.value)} aria-label="New watch list name" placeholder="Friday watch night" className="min-w-0 flex-1" />
      <Button type="submit" size="sm" variant="secondary" className="min-h-11" disabled={!media.length || items.length >= ROOM_PLAYLIST_LIMIT}><Plus className="size-3" />Save queue as list</Button>
    </form>
    {omitted > 0 && <p className="mt-2 text-xs text-muted">{omitted} local or unavailable title{omitted === 1 ? '' : 's'} will be omitted.</p>}
    <p role="status" aria-live="polite" className="mt-2 break-words text-xs leading-5 text-accent">{notice}</p>
    <ul className="mt-3 max-h-96 space-y-3 overflow-y-auto">
      {items.map(item => <li key={item.id} data-room-playlist-id={item.id} className="rounded-md border border-border bg-bg/45 p-3">
        <p className="break-words text-sm font-medium text-fg">{item.name}</p>
        <p className="mt-1 text-xs text-muted">{item.media.length} public video{item.media.length === 1 ? '' : 's'}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <Button size="sm" variant="secondary" className="min-h-11" disabled={!canAdd || pending || full && !suggesting} onClick={() => { if (onLoad(item.media)) setNotice(suggesting ? 'List sent for host review. Check Guest suggestions for approval.' : 'List submitted. Check the queue status for added, duplicate or full-queue counts.'); }}>{suggesting ? 'Suggest list' : 'Add list to queue'}</Button>
          <Button size="sm" variant="ghost" className="min-h-11" onClick={() => { setEditing(item.id); setRenaming(item.name); }}>Rename list</Button>
          <Button size="sm" variant="ghost" className="min-h-11" disabled={!media.length} onClick={() => changeItem(item.id, current => roomPlaylist(current.id, current.name, media)!, 'Saved list replaced with the current public queue. Playback is unchanged.')}>Replace with queue</Button>
          <Button size="sm" variant="ghost" className="min-h-11" onClick={() => { let deleted: RoomPlaylist | undefined; if (commit(latest => { deleted = latest.find(value => value.id === item.id); return latest.filter(value => value.id !== item.id); }, 'List removed from this browser. The live queue is unchanged.')) { setRemoved(deleted); if (editing === item.id) setEditing(undefined); } }}>Remove list</Button>
        </div>
        {editing === item.id && <form className="mt-2 flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); if (changeItem(item.id, (current, latest) => ({ ...current, name: requireName(renaming, latest, item.id), updatedAt: Date.now() }), 'List renamed.')) setEditing(undefined); }}>
          <Input aria-label="Rename watch list" maxLength={64} value={renaming} onChange={event => setRenaming(event.target.value)} className="min-w-0 flex-1" />
          <Button type="submit" size="sm" className="min-h-11">Save name</Button><Button type="button" size="sm" variant="ghost" className="min-h-11" onClick={() => setEditing(undefined)}>Cancel rename</Button>
        </form>}
        <details className="mt-2" open={previewing === item.id} onToggle={event => { const open = event.currentTarget.open; setPreviewing(current => open ? item.id : current === item.id ? undefined : current); }}><summary className="min-h-11 cursor-pointer py-3 text-xs text-muted">View saved titles and links</summary>
          {previewing === item.id && <>
          <ol className="space-y-1 text-xs text-fg">{item.media.map(value => <li key={value.id} className="break-words">{value.name}</li>)}</ol>
          <textarea aria-label={`Saved links for ${item.name}`} readOnly rows={3} value={roomQueueLinks(item.media)} onFocus={event => event.target.select()} className="mt-2 w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-fg" />
          </>}
        </details>
      </li>)}
    </ul>
    {!items.length && <p className="mt-2 text-xs text-muted">Save a public queue to prepare your next watch night.</p>}
    {removed && <Button size="sm" variant="ghost" className="mt-2 min-h-11" onClick={() => { if (commit(latest => {
      if (latest.length >= ROOM_PLAYLIST_LIMIT) throw Error('Make room before restoring this list.');
      requireName(removed.name, latest);
      if (latest.some(item => item.id === removed.id)) throw Error('This list has already been restored.');
      return [removed, ...latest];
    }, 'Removed list restored.')) setRemoved(undefined); }}>Undo removed list</Button>}
    {!canAdd && items.length > 0 && <p className="mt-2 text-xs leading-5 text-muted">Adding lists waits for a connected host with guest access enabled. You can still manage your saved lists.</p>}
    {full && !suggesting && <p className="mt-2 text-xs text-muted">The queue is full. Make room before adding a list.</p>}
    {suggesting && <p className="mt-2 text-xs leading-5 text-muted">Lists follow host review and suggestion limits. Check the submission result for videos held back.</p>}
  </details>;
});
