import {
  describeRoomMedia,
  resolveRoomMedia,
  roomMediaKey,
  roomVideoFromUrl,
  type RoomMediaDescriptor,
} from "./room-media.ts";
import { ROOM_QUEUE_LIMIT } from "./room-queue.ts";
import { ROOM_RECENT_LIMIT } from "./room-queue-session.ts";
export const ROOM_SESSION_FILE_BYTES = 256_000;
const MAX_IMPORT_UPCOMING = 192,
  MAX_IMPORT_PLAYED = 80;
export type RoomSessionItem = {
  provider: "youtube" | "twitch";
  url: string;
  title: string;
  duration?: number;
  live?: true;
};
export type RoomSessionFile = {
  format: "realhub-watch-session";
  version: 1;
  played: RoomSessionItem[];
  current: RoomSessionItem | null;
  upcoming: RoomSessionItem[];
};
const title = (value: unknown) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 300)
    : "";
const runtime = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 31_536_000
    ? value
    : undefined;
/** Rebuild all routes from public provider identity. No catalog IDs, peer data,
 * invitations, paths, descriptions, thumbnails or stream credentials survive. */
export function publicSessionItem(raw: unknown): RoomSessionItem | undefined {
  const resolved = resolveRoomMedia(raw);
  const video = resolved?.video;
  if (!video?.remote || !["youtube", "twitch"].includes(video.remote.kind)) return;
  const media = describeRoomMedia(video)!;
  if (media.kind === "youtube" && !/^[\w-]{11}$/.test(media.videoId ?? "")) return;
  if (!media.watchUrl) return;
  return {
    provider: media.kind as "youtube" | "twitch",
    url:
      media.kind === "twitch" && media.live
        ? "https://www.twitch.tv/" + roomMediaKey(video).slice("twitch:live:".length)
        : media.watchUrl,
    title: title(media.name) || media.watchUrl,
    ...(media.live
      ? { live: true as const }
      : runtime(media.duration)
        ? { duration: runtime(media.duration) }
        : {}),
  };
}
export function sessionItemMedia(item: RoomSessionItem): RoomMediaDescriptor | undefined {
  const video = roomVideoFromUrl(item.url);
  if (!video?.remote || video.remote.kind !== item.provider) return;
  if (item.provider === "youtube" && !/^[\w-]{11}$/.test(video.remote.videoId ?? "")) return;
  video.name = title(item.title) || item.url;
  video.duration = item.live ? undefined : runtime(item.duration);
  if (item.live) video.remote = { ...video.remote, live: true };
  const media = describeRoomMedia(video);
  return media ? { ...media, id: "room:" + roomMediaKey(video) } : undefined;
}
export function buildRoomSessionFile(input: {
  played: readonly unknown[];
  current?: unknown;
  upcoming: readonly unknown[];
}) {
  let omitted = 0;
  const clean = (values: readonly unknown[], limit: number) => {
    const rows: RoomSessionItem[] = [],
      seen = new Set<string>();
    for (const raw of values.slice(0, limit)) {
      const item = publicSessionItem(raw);
      if (!item) {
        omitted++;
        continue;
      }
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      rows.push(item);
    }
    return rows;
  };
  const current = input.current ? (publicSessionItem(input.current) ?? null) : null;
  if (input.current && !current) omitted++;
  const file: RoomSessionFile = {
    format: "realhub-watch-session",
    version: 1,
    played: clean(input.played, ROOM_RECENT_LIMIT).filter((item) => item.url !== current?.url),
    current,
    upcoming: clean(input.upcoming, ROOM_QUEUE_LIMIT).filter((item) => item.url !== current?.url),
  };
  return { file, omitted };
}
export function writeRoomSessionFile(file: RoomSessionFile): string {
  // Use the same parser/whitelist even when handed an object from another caller.
  const clean = readRoomSessionFile(JSON.stringify(file)),
    raw = JSON.stringify(clean.file, null, 2);
  if (new TextEncoder().encode(raw).byteLength > ROOM_SESSION_FILE_BYTES)
    throw Error("This session file is too large (maximum 256 KB).");
  return raw;
}
export type SessionFileRead = { file: RoomSessionFile; invalid: number; unsupported: number };
export function readRoomSessionFile(raw: string): SessionFileRead {
  if (
    raw.length > ROOM_SESSION_FILE_BYTES ||
    new TextEncoder().encode(raw).byteLength > ROOM_SESSION_FILE_BYTES
  )
    throw Error("This session file is too large (maximum 256 KB).");
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    throw Error("This is not readable JSON. Choose a Realhub session file.");
  }
  if (!data || data.format !== "realhub-watch-session" || data.version !== 1)
    throw Error("Unsupported session format or version. Choose a version 1 Realhub session file.");
  if (
    !Array.isArray(data.played) ||
    !Array.isArray(data.upcoming) ||
    data.played.length > MAX_IMPORT_PLAYED ||
    data.upcoming.length > MAX_IMPORT_UPCOMING ||
    !(data.current === null || (data.current && typeof data.current === "object" && !Array.isArray(data.current)))
  )
    throw Error("The session structure or item count is invalid. The room was not changed.");
  let invalid = 0,
    unsupported = 0;
  const clean = (raw: unknown): RoomSessionItem | undefined => {
    if (!raw || typeof raw !== "object") {
      invalid++;
      return;
    }
    const r = raw as Record<string, unknown>;
    if (!["youtube", "twitch"].includes(r.provider as string)) {
      unsupported++;
      return;
    }
    if (
      typeof r.url !== "string" ||
      r.url.length > 2048 ||
      !r.url.startsWith("https://") ||
      !title(r.title)
    ) {
      invalid++;
      return;
    }
    const media = sessionItemMedia({
      provider: r.provider as RoomSessionItem["provider"],
      url: r.url,
      title: title(r.title),
      ...(r.live === true
        ? { live: true }
        : runtime(r.duration)
          ? { duration: runtime(r.duration) }
          : {}),
    });
    const item = media && publicSessionItem(media);
    if (!item) {
      invalid++;
      return;
    }
    return item;
  };
  const played = data.played.flatMap((r) => {
      const item = clean(r);
      return item ? [item] : [];
    }),
    upcoming = data.upcoming.flatMap((r) => {
      const item = clean(r);
      return item ? [item] : [];
    });
  const current = data.current === null ? null : (clean(data.current) ?? null);
  return {
    file: { format: "realhub-watch-session", version: 1, played, current, upcoming },
    invalid,
    unsupported,
  };
}
export type SessionImportPreview = {
  media: RoomMediaDescriptor[];
  duplicates: number;
  unavailable: number;
  full: number;
  slots: number;
  upcoming: number;
};
/** A preview is recomputed against the current stage and queue; only upcoming
 * items can be appended. Played/current entries are context, never playback. */
export function previewRoomSessionImport(
  file: RoomSessionFile,
  current: unknown,
  queue: readonly unknown[],
  unavailable: ReadonlySet<string> = new Set(),
): SessionImportPreview {
  const seen = new Set<string>();
  for (const raw of [current, ...queue]) {
    const item = publicSessionItem(raw);
    if (item) seen.add(item.url);
  }
  const slots = Math.max(0, ROOM_QUEUE_LIMIT - queue.length),
    result: SessionImportPreview = {
      media: [],
      duplicates: 0,
      unavailable: 0,
      full: 0,
      slots,
      upcoming: file.upcoming.length,
    };
  for (const item of file.upcoming.slice(0, MAX_IMPORT_UPCOMING)) {
    if (seen.has(item.url)) {
      result.duplicates++;
      continue;
    }
    seen.add(item.url);
    const media = sessionItemMedia(item);
    const video = media && resolveRoomMedia(media)?.video;
    if (!media || !video || unavailable.has(roomMediaKey(video))) {
      result.unavailable++;
      continue;
    }
    if (result.media.length >= slots) {
      result.full++;
      continue;
    }
    result.media.push(media);
  }
  return result;
}
