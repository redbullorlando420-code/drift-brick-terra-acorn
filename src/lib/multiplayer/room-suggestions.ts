import { describeRoomMedia, resolveRoomMedia, roomMediaKey, type RoomMediaDescriptor } from './room-media.ts';
export const ROOM_SUGGESTION_LIMIT = 24;
export const ROOM_SUGGESTION_PEER_LIMIT = 8;
export type RoomSuggestion = { id: string; media: RoomMediaDescriptor; peer: string; name: string };
export function acceptsRoomReviewRevision(current: number, value: unknown): boolean {
  const revision = value === undefined ? 0 : value;
  return typeof revision === 'number' && Number.isSafeInteger(revision) && revision >= 0 && revision >= current;
}
export function readRoomSuggestions(value: unknown): RoomSuggestion[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, ROOM_SUGGESTION_LIMIT).flatMap(entry => {
    if (!entry || typeof entry !== 'object' || typeof entry.peer !== 'string' || !entry.peer || entry.peer.length > 160) return [];
    const resolved = resolveRoomMedia(entry.media);
    if (!resolved?.video?.remote) return [];
    const id = roomMediaKey(resolved.video);
    if (seen.has(id)) return []; seen.add(id);
    const { poster: _poster, ...media } = describeRoomMedia(resolved.video)!;
    return [{ id, media, peer: entry.peer, name: (typeof entry.name === 'string' ? entry.name : 'Guest').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 64) || 'Guest' }];
  });
}
/** Review never mutates the live queue. Canonical identity, not device IDs,
 * deduplicates pending requests and titles already playing or queued. */
export function addRoomSuggestions(current: readonly RoomSuggestion[], values: readonly unknown[], peer: string, name: string, excludedKeys: readonly string[]) {
  const items = readRoomSuggestions(current), seen = new Set([...excludedKeys, ...items.map(item => item.id)]);
  const result = { items, added: 0, duplicates: 0, invalid: 0, limited: 0 };
  let owned = items.filter(item => item.peer === peer).length;
  for (const value of values.slice(0, 48)) {
    const entry = readRoomSuggestions([{ media: value, peer, name }])[0];
    if (!entry) { result.invalid++; continue; }
    if (seen.has(entry.id)) { result.duplicates++; continue; }
    if (items.length >= ROOM_SUGGESTION_LIMIT || owned >= ROOM_SUGGESTION_PEER_LIMIT) { result.limited++; continue; }
    seen.add(entry.id); items.push(entry); owned++; result.added++;
  }
  return result;
}
