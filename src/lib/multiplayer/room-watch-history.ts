import { describeRoomMedia, resolveRoomMedia, roomMediaKey, type RoomMediaDescriptor } from './room-media.ts';
export const ROOM_HISTORY_KEY = 'reelcase.watch-room.history.v1';
export const ROOM_HISTORY_LIMIT = 80;
export type RoomWatchEntry = { media: RoomMediaDescriptor; watchedAt: number };
export function cleanRoomHistory(values: unknown): RoomWatchEntry[] {
  if (!Array.isArray(values)) return [];
  const rows: RoomWatchEntry[] = [], seen = new Set<string>();
  for (const value of values.slice(0, ROOM_HISTORY_LIMIT * 2)) {
    if (!value || typeof value !== 'object') continue;
    const { media, watchedAt } = value as Partial<RoomWatchEntry>;
    const resolved = resolveRoomMedia(media);
    if (!resolved?.video?.remote || typeof watchedAt !== 'number' || !Number.isFinite(watchedAt) || watchedAt <= 0 || watchedAt > Date.now() + 60_000) continue;
    const key = roomMediaKey(resolved.video); if (seen.has(key)) continue;
    seen.add(key); rows.push({media: describeRoomMedia(resolved.video)!, watchedAt});
    if (rows.length === ROOM_HISTORY_LIMIT) break;
  }
  return rows;
}
export function readRoomHistory(raw: string | null): RoomWatchEntry[] {
  if (!raw || raw.length > 256_000) return [];
  try { const data = JSON.parse(raw); return data.version === 1 ? cleanRoomHistory(data.entries) : []; } catch { return []; }
}
export function rememberRoomVideo(entries: RoomWatchEntry[], media: unknown, watchedAt = Date.now()) {
  return cleanRoomHistory([{media, watchedAt}, ...entries]);
}
