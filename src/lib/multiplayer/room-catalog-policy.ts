import type { Folder, LibraryVideo } from "../videos/types.ts";
import { publicVideoBoundary } from "../videos/public-visibility.ts";
import { forEachCatalogSlice } from "../catalog-work.ts";
import { roomMediaKey, describeRoomMedia, type RoomMediaDescriptor } from "./room-media.ts";
export type RoomCatalogPolicy = {
  enabled: boolean;
  localTitles: boolean;
  folders: readonly string[];
};
export const CLOSED_ROOM_CATALOG: RoomCatalogPolicy = {
  enabled: false,
  localTitles: false,
  folders: [],
};
export type RoomCatalogCollection = { id: string; name: string; source: string; count: number };
export type RoomCatalogIndex = {
  collections: RoomCatalogCollection[];
  known: Map<string, LibraryVideo>;
  blocked: Set<string>;
  publicTitle: (video: LibraryVideo) => boolean;
};
export async function buildRoomCatalogIndex(
  videos: readonly LibraryVideo[],
  folders: readonly Folder[],
  hidden: Record<string, unknown>,
  unavailable: Record<string, unknown>,
  turn: () => Promise<void>,
): Promise<RoomCatalogIndex> {
  const publicTitle = publicVideoBoundary(folders),
    blocked = new Set<string>(),
    known = new Map<string, LibraryVideo>(),
    collections = new Map<string, RoomCatalogCollection>();
  await forEachCatalogSlice(
    folders,
    (folder) => {
      if (!folder.adult)
        collections.set(folder.id, {
          id: folder.id,
          name: folder.name,
          source: folder.kind,
          count: 0,
        });
    },
    turn,
  );
  const safe = (video: LibraryVideo) =>
    publicTitle(video) &&
    !hidden[video.id] &&
    !unavailable[video.id] &&
    !video.isSample &&
    collections.has(video.folderId) &&
    (!video.remote || ["youtube", "twitch"].includes(video.remote.kind));
  await forEachCatalogSlice(
    videos,
    (video) => {
      const key = roomMediaKey(video);
      if (!known.has(key)) known.set(key, video);
      if (!video.remote) {
        const aliasKey = "local:" + roomCatalogLocalId(video);
        const previous = known.get(aliasKey);
        if (previous && previous.id !== video.id) blocked.add(aliasKey);
        else known.set(aliasKey, video);
        if (!safe(video)) blocked.add(aliasKey);
      }
      if (!safe(video)) blocked.add(key);
    },
    turn,
  );
  await forEachCatalogSlice(
    videos,
    (video) => {
      if (safe(video) && !blocked.has(roomMediaKey(video))) {
        const collection = collections.get(video.folderId)!,
          source = video.remote?.kind ?? "local";
        collection.source =
          collection.count === 0 ? source : collection.source === source ? source : "mixed";
        collection.count++;
      }
    },
    turn,
  );
  return {
    collections: [...collections.values()].filter((row) => row.count > 0),
    known,
    blocked,
    publicTitle: safe,
  };
}
export function roomCatalogAllows(index: RoomCatalogIndex | undefined, policy: RoomCatalogPolicy) {
  const selected = new Set(policy.folders);
  return (video: LibraryVideo) =>
    Boolean(
      index &&
      policy.enabled &&
      index.publicTitle(video) &&
      !index.blocked.has(roomMediaKey(video)) &&
      selected.has(video.folderId) &&
      (video.remote || policy.localTitles),
    );
}
export function roomCatalogName(video: LibraryVideo) {
  return video.remote ? video.name.slice(0, 300) : video.name.split(/[\\/]/).at(-1)!.slice(0, 300);
}
/** Search exactly the title and creator the guest is allowed to receive. */
export function roomCatalogSearchText(video: LibraryVideo) {
  return roomCatalogName(video) + " " + (video.remote?.channelName ?? "").slice(0, 200);
}
/** Discovery deliberately omits descriptions, saved tags, source IDs, local sizes,
 * fingerprints and timestamps. Playback/handoff have separate explicit consent. */
export function describeCatalogMedia(video: LibraryVideo): RoomMediaDescriptor | null {
  const media = describeRoomMedia(video);
  if (!media) return null;
  if (media.kind === "local")
    return {
      id: roomCatalogLocalId(video),
      name: roomCatalogName(video),
      kind: "local",
      duration: media.duration,
    };
  const { description: _description, ...publicMedia } = media;
  return publicMedia;
}
export function catalogRequestCurrent(revision: number, requestRevision: unknown) {
  return Number.isSafeInteger(requestRevision) && requestRevision === revision;
}

export type RoomCatalogState = {
  revision: number;
  policy: RoomCatalogPolicy;
  index?: RoomCatalogIndex;
  pending: boolean;
};
export function roomCatalogRequestAllowed(
  state: RoomCatalogState,
  video: LibraryVideo,
  requestRevision: unknown,
  activeKeys: readonly string[],
) {
  const key = roomMediaKey(video);
  if (activeKeys.includes(key)) return true;
  const { index, policy, pending, revision } = state;
  if (pending || !index || index.blocked.has(key)) return false;
  const known = index.known.get(key);
  if (known)
    return (
      catalogRequestCurrent(revision, requestRevision) && roomCatalogAllows(index, policy)(known)
    );
  return Boolean(video.remote && ["youtube", "twitch"].includes(video.remote.kind));
}

/** Opaque discovery alias; it is an identifier, never an authorization token. */
export function roomCatalogLocalId(video: LibraryVideo) {
  let a = 2166136261,
    b = 2246822507;
  for (const ch of video.id) {
    a = Math.imul(a ^ ch.codePointAt(0)!, 16777619);
    b = Math.imul(b ^ ch.codePointAt(0)!, 3266489909);
  }
  return "room-file:" + (a >>> 0).toString(36) + ":" + (b >>> 0).toString(36);
}
