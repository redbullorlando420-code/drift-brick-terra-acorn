import { describeRoomMedia, resolveRoomMedia, roomMediaKey, type RoomMediaDescriptor } from './room-media.ts';
import { readRoomSearchEvidence, type RoomSearchEvidence } from "./room-search-evidence.ts";
export const ROOM_SUGGESTION_LIMIT = 24;
export const ROOM_SUGGESTION_PEER_LIMIT = 8;
export type RoomSuggestion = { id: string; media: RoomMediaDescriptor; peer: string; name: string; evidence?: RoomSearchEvidence; catalogRevision?: number };
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
    const evidence = readRoomSearchEvidence(entry.evidence);
    if (!resolved?.video || !resolved.video.remote && (evidence?.source !== "host" || !/^room-file:[a-z0-9]+:[a-z0-9]+$/.test(resolved.video.id))) return [];
    const id = roomMediaKey(resolved.video);
    if (seen.has(id)) return []; seen.add(id);
    const { poster: _poster, ...publicMedia } = describeRoomMedia(resolved.video)!;
    const media = resolved.video.remote ? publicMedia : {id:resolved.video.id, name:resolved.video.name.split(/[\\/]/).at(-1)!, kind:"local" as const, duration:resolved.video.duration};
    const catalogRevision = Number.isSafeInteger(entry.catalogRevision) && entry.catalogRevision >= 0 ? entry.catalogRevision as number : undefined;
    return [{ id, media, peer: entry.peer, name: (typeof entry.name === 'string' ? entry.name : 'Guest').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 64) || 'Guest',
      ...(evidence ? {evidence} : {}), ...(catalogRevision !== undefined ? {catalogRevision} : {}) }];
  });
}
/** Review never mutates the live queue. Canonical identity, not device IDs,
 * deduplicates pending requests and titles already playing or queued. */
export function addRoomSuggestions(current: readonly RoomSuggestion[], values: readonly unknown[], peer: string, name: string, excludedKeys: readonly string[],
  evidenceAt?: (index: number) => Pick<RoomSuggestion, "evidence" | "catalogRevision">) {
  const items = readRoomSuggestions(current), seen = new Set([...excludedKeys, ...items.map(item => item.id)]);
  const result = { items, added: 0, duplicates: 0, invalid: 0, limited: 0 };
  let owned = items.filter(item => item.peer === peer).length;
  for (const [index, value] of values.slice(0, 48).entries()) {
    const entry = readRoomSuggestions([{ media: value, peer, name, ...evidenceAt?.(index) }])[0];
    if (!entry) { result.invalid++; continue; }
    if (seen.has(entry.id)) { result.duplicates++; continue; }
    if (items.length >= ROOM_SUGGESTION_LIMIT || owned >= ROOM_SUGGESTION_PEER_LIMIT) { result.limited++; continue; }
    seen.add(entry.id); items.push(entry); owned++; result.added++;
  }
  return result;
}
