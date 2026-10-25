import { describeRoomMedia, resolveRoomMedia, roomMediaKey, type RoomMediaDescriptor } from './room-media.ts';
import { ROOM_QUEUE_LIMIT } from './room-queue.ts';

export const ROOM_QUEUE_DRAFT_KEY = 'reelcase.watch-room.queue.v1';
export type RoomQueueDraft = { version: 1; savedAt: number; media: RoomMediaDescriptor[] };
export const ROOM_RECENT_LIMIT = 12;
/** Session-only history reuses public descriptor validation. Never retain
 * local media names, handles or stream details as room history. */
export function roomRecentMedia(values: readonly unknown[]): RoomMediaDescriptor[] {
  return roomQueueDraft(values).media.slice(0, ROOM_RECENT_LIMIT);
}
/** Recovery contains public provider links only, never local names, paths,
 * fingerprints, file bytes, peer identities or transient stream addresses. */
export function roomQueueDraft(values: readonly unknown[], savedAt = Date.now()): RoomQueueDraft {
  const media: RoomMediaDescriptor[] = [], seen = new Set<string>();
  for (const value of values.slice(0, ROOM_QUEUE_LIMIT)) {
    const resolved = resolveRoomMedia(value);
    if (!resolved?.video?.remote) continue;
    const key = roomMediaKey(resolved.video);
    if (seen.has(key)) continue;
    seen.add(key);
    const clean = describeRoomMedia(resolved.video)!;
    // Posters are optional decorations, not needed to recover playback.
    const { poster: _poster, ...entry } = clean;
    media.push(entry);
  }
  return { version: 1, savedAt, media };
}
export function readRoomQueueDraft(value: string | null): RoomQueueDraft | undefined {
  if (!value || value.length > 128_000) return;
  try {
    const data = JSON.parse(value);
    if (data?.version !== 1 || !Array.isArray(data.media) || typeof data.savedAt !== 'number' || !Number.isFinite(data.savedAt) || data.savedAt <= 0) return;
    const draft = roomQueueDraft(data.media, data.savedAt);
    return draft.media.length ? draft : undefined;
  } catch { return; }
}

/** One canonical link per line can be pasted straight back into Add links.
 * Local filenames, room codes and provider tracking parameters stay private. */
export function roomQueueLinks(values: readonly unknown[]) {
  return roomQueueDraft(values).media.map(media => media.watchUrl).filter((url): url is string => Boolean(url)).join('\n');
}

/** Selection revision prevents a late old-title event from undoing a newer
 * choice even when both packets have the same millisecond timestamp. */
export function acceptsRoomSelection(currentRevision: number, value: unknown, currentId: string, incomingId: unknown) {
  const revision = value === undefined ? 0 : value;
  if (typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision < currentRevision) return false;
  return !(revision > 0 && revision === currentRevision && currentId && typeof incomingId === 'string' && incomingId !== currentId);
}

export function nextPlayableRoomTitle(ids: readonly string[], playable: (id: string) => boolean) {
  for (const [index, id] of ids.slice(0, ROOM_QUEUE_LIMIT).entries()) if (playable(id)) return { id, skipped: index };
  return { id: undefined, skipped: Math.min(ids.length, ROOM_QUEUE_LIMIT) };
}
