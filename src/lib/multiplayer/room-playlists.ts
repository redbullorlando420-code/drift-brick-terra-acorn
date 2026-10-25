import { roomQueueDraft } from './room-queue-session.ts';
import { resolveRoomMedia, roomMediaKey, type RoomMediaDescriptor } from './room-media.ts';

export const ROOM_PLAYLISTS_KEY = 'reelcase.watch-room.playlists.v1';
export const ROOM_PLAYLIST_LIMIT = 12;
export type RoomPlaylist = { id: string; name: string; updatedAt: number; media: RoomMediaDescriptor[] };
const MAX_BYTES = 1_600_000;
export const roomPlaylistName = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 64);

/** Named lists are personal browser data. Persist public identities, never
 * another participant's catalog IDs, local files or transient room details. */
export function roomPlaylist(id: string, name: string, values: readonly unknown[], updatedAt = Date.now()): RoomPlaylist | undefined {
  if (!/^[\w-]{1,96}$/.test(id) || !Number.isSafeInteger(updatedAt) || updatedAt <= 0) return;
  name = roomPlaylistName(name);
  const media = roomQueueDraft(values).media.flatMap(value => {
    const video = resolveRoomMedia(value)?.video;
    return video ? [{ ...value, id: `room:${roomMediaKey(video)}` }] : [];
  });
  return name && media.length ? { id, name, updatedAt, media } : undefined;
}

/** Reject unreadable storage rather than silently replacing someone's lists. */
export function readRoomPlaylists(raw: string | null): RoomPlaylist[] | undefined {
  if (raw === null) return [];
  if (raw.length > MAX_BYTES) return;
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Array.isArray(data.items) || data.items.length > ROOM_PLAYLIST_LIMIT) return;
    const items: RoomPlaylist[] = [], ids = new Set<string>(), names = new Set<string>();
    for (const value of data.items) {
      if (!value || typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.updatedAt !== 'number' || !Array.isArray(value.media)) return;
      const item = roomPlaylist(value.id, value.name, value.media, value.updatedAt);
      if (!item || ids.has(item.id) || names.has(item.name.toLowerCase())) return;
      ids.add(item.id); names.add(item.name.toLowerCase()); items.push(item);
    }
    return items;
  } catch { return; }
}

export function writeRoomPlaylists(items: readonly RoomPlaylist[]) {
  const raw = JSON.stringify({ version: 1, items });
  const clean = readRoomPlaylists(raw);
  if (!clean) throw Error('Saved lists contain invalid or excessive data.');
  return JSON.stringify({ version: 1, items: clean });
}
