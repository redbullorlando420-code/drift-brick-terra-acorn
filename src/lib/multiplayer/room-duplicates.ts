import {
  describeRoomMedia,
  resolveRoomMedia,
  roomMediaKey,
  type RoomMediaDescriptor,
} from "./room-media.ts";
import type { RoomSearchEvidence } from "./room-search-evidence.ts";

export const isRoomRepeat = (id: string) => /^room-repeat-[\w-]{8,80}$/.test(id);
export type DuplicateRequest = {
  id: string;
  media: RoomMediaDescriptor;
  source: string;
  peer?: string;
  evidence?: RoomSearchEvidence;
  catalogRevision?: number;
};
export type DuplicateGroups = Record<string, DuplicateRequest[]>;
export function holdRoomDuplicate(
  groups: DuplicateGroups,
  request: DuplicateRequest,
): DuplicateGroups {
  const video = resolveRoomMedia(request.media)?.video;
  if (!video?.remote) return groups;
  const key = roomMediaKey(video),
    previous = groups[key] ?? [];
  if (
    (!previous.length && Object.keys(groups).length >= 8) ||
    previous.length >= 4 ||
    previous.some((row) => row.id === request.id)
  )
    return groups;
  const { poster: _poster, description: _description, ...media } = describeRoomMedia(video)!;
  return {
    ...groups,
    [key]: [...previous, { ...request, source: request.source.slice(0, 64), media }],
  };
}
export function groupRoomQueue<T extends { id: string; key: string }>(
  queued: readonly T[],
  held: DuplicateGroups,
) {
  const groups = new Map<string, T[]>();
  for (const row of queued) {
    const group = groups.get(row.key);
    if (group) group.push(row);
    else groups.set(row.key, [row]);
  }
  return [...new Set([...Object.keys(held), ...groups.keys()])].flatMap((key) => {
    const slots = groups.get(key) ?? [],
      requests = held[key] ?? [];
    return slots.length > 1 || requests.length ? [{ key, slots, requests }] : [];
  });
}
