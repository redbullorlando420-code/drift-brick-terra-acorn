import type { LibraryVideo, RemoteRef } from "../videos/types.ts";
import { exactYoutubePublished } from '../videos/youtube-metadata.ts';

export type RoomLocalMedia = { name: string; fingerprint: string; size: number; modified: number };
export type RoomMediaDescriptor = {
  id: string;
  name: string;
  kind: "youtube" | "twitch" | "local";
  videoId?: string;
  channelId?: string;
  channelName?: string;
  live?: boolean;
  embedUrl?: string;
  watchUrl?: string;
  poster?: string;
  duration?: number;
  publishedDate?: string;
  publishedLabel?: string;
  views?: number;
  description?: string;
  size?: number;
  local?: RoomLocalMedia;
  streamId?: string;
};

const PROVIDER_HOSTS: Record<"youtube" | "twitch", ReadonlySet<string>> = {
  youtube: new Set([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
    "youtu.be",
  ]),
  twitch: new Set(["twitch.tv", "www.twitch.tv", "m.twitch.tv", "player.twitch.tv", "clips.twitch.tv"]),
};

function safeProviderUrl(value: unknown, kind: "youtube" | "twitch") {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && PROVIDER_HOSTS[kind].has(url.hostname.toLowerCase())
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function safePoster(value: unknown) {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      /(^|\.)(ytimg\.com|jtvnw\.net|ttvnw\.net)$/.test(url.hostname)
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

/** Older cached cards may have only a public watch URL or provider ID.
 * Rebuild provider routes so a room does not depend on another device's cache. */
function providerFields(
  kind: "youtube" | "twitch",
  item: Pick<
    Partial<RoomMediaDescriptor>,
    "embedUrl" | "watchUrl" | "videoId" | "channelName" | "live"
  >,
) {
  const urls = [safeProviderUrl(item.embedUrl, kind), safeProviderUrl(item.watchUrl, kind)]
    .filter((value): value is string => Boolean(value))
    .map((value) => new URL(value));
  const identifier =
    typeof item.videoId === "string" && /^[a-zA-Z0-9_-]{1,160}$/.test(item.videoId)
      ? item.videoId
      : undefined;
  if (kind === "youtube") {
    const videoId =
      urls
        .map(
          (url) =>
            url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ||
            (url.hostname === "youtu.be" ? url.pathname.slice(1).split("/")[0] : undefined),
        )
        .find((id) => id && /^[\w-]{1,160}$/.test(id)) ?? identifier;
    if (!videoId) return null;
    return {
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      live: Boolean(item.live) || urls.some(url => /^\/live\//.test(url.pathname)),
    };
  }
  const clip = urls
    .map(
      (url) =>
        url.searchParams.get("clip") ||
        url.pathname.match(/\/clip\/([\w-]+)/)?.[1] ||
        (url.hostname === "clips.twitch.tv" && url.pathname !== "/embed"
          ? url.pathname.slice(1)
          : undefined),
    )
    .find((id) => id && /^[\w-]{1,160}$/.test(id));
  const vod =
    urls
      .map(
        (url) =>
          url.searchParams.get("video")?.replace(/^v/, "") ||
          url.pathname.match(/^\/videos\/(\d+)/)?.[1],
      )
      .find((id) => id && /^\d+$/.test(id)) ??
    (identifier && /^v?\d+$/.test(identifier) ? identifier.replace(/^v/, "") : undefined);
  const channel =
    urls
      .map(
        (url) =>
          url.searchParams.get("channel") ||
          (/^(?:www\.|m\.)?twitch\.tv$/.test(url.hostname) &&
          !/^\/(?:videos|directory|clip)\b/.test(url.pathname)
            ? url.pathname.split("/")[1]
            : undefined),
      )
      .find((id) => id && /^[\w]{1,25}$/.test(id)) ??
    (item.live && typeof item.channelName === "string" && /^[\w]{1,25}$/.test(item.channelName)
      ? item.channelName
      : undefined);
  if ((item.live && channel) || (!clip && !vod && channel))
    return {
      live: true,
      channelName: channel,
      embedUrl: `https://player.twitch.tv/?channel=${channel}`,
      watchUrl: `https://www.twitch.tv/${channel}`,
    };
  if (clip || (identifier && !vod && !item.live)) {
    const videoId = clip ?? identifier!;
    return {
      live: false,
      videoId,
      embedUrl: `https://clips.twitch.tv/embed?clip=${videoId}`,
      watchUrl: `https://clips.twitch.tv/${videoId}`,
    };
  }
  return vod
    ? {
        live: false,
        videoId: vod,
        embedUrl: `https://player.twitch.tv/?video=v${vod}`,
        watchUrl: `https://www.twitch.tv/videos/${vod}`,
      }
    : null;
}

export function normalizeRoomVideo(video: LibraryVideo): LibraryVideo {
  if (!video.remote || !["youtube", "twitch"].includes(video.remote.kind)) return video;
  const fields = providerFields(video.remote.kind as "youtube" | "twitch", video.remote);
  return fields ? { ...video, remote: { ...video.remote, ...fields } } : video;
}

/** Catalog IDs differ between devices; provider identity describes the actual title. */
export function roomMediaKey(video: LibraryVideo): string {
  if (!video.remote) return `local:${video.id}`;
  const kind = video.remote.kind;
  if (kind !== "youtube" && kind !== "twitch") return `entry:${video.id}`;
  const fields = providerFields(kind, video.remote);
  if (!fields) return `entry:${video.id}`;
  if (kind === "youtube") return `youtube:${fields.videoId}`;
  if (fields.live) return `twitch:live:${fields.channelName?.toLowerCase()}`;
  return `${fields.embedUrl.includes("clips.twitch.tv") ? "twitch:clip" : "twitch:vod"}:${fields.videoId}`;
}

/** Keep both devices' distinct titles, but show a provider title only once. */
export function roomCatalogCandidates(videos: readonly LibraryVideo[], shared: Record<string, LibraryVideo>): LibraryVideo[] {
  const candidates = videos.map(video => {
    const session = shared[video.id];
    return session && roomMediaKey(session) !== roomMediaKey(video)
      ? { ...video, id: `room:${roomMediaKey(video)}` }
      : session ?? video;
  });
  const seenKeys = new Set<string>(), seenIds = new Set<string>();
  const result: LibraryVideo[] = [];
  for (let video of [...candidates, ...Object.values(shared)]) {
    const key = roomMediaKey(video);
    if (seenKeys.has(key)) continue;
    if (seenIds.has(video.id)) video = { ...video, id: `room:${key}:candidate-${result.length}` };
    seenKeys.add(key); seenIds.add(video.id); result.push(video);
  }
  return result;
}

export function roomVideoFromUrl(value: string): LibraryVideo | null {
  const input = value.trim();
  let publicUrl: string;
  try {const url=new URL(/^https?:\/\//i.test(input)?input:`https://${input}`);if(!['http:','https:'].includes(url.protocol))return null;url.protocol='https:';publicUrl=url.toString();}catch{return null;}
  for (const kind of ["youtube", "twitch"] as const) {
    const watchUrl = safeProviderUrl(
      publicUrl,
      kind,
    );
    if (!watchUrl) continue;
    const fields = providerFields(kind, { watchUrl });
    if (!fields) continue;
    const key = "videoId" in fields ? fields.videoId : fields.channelName;
    const id = `room:${kind}:${key}`;
    return (
      resolveRoomMedia({
        id,
        name: `${kind === "youtube" ? "YouTube" : "Twitch"} · ${key}`,
        kind,
        ...fields,
      })?.video ?? null
    );
  }
  return null;
}

/** Bounded paste parsing never reads a catalog or fetches provider data. */
export function parseRoomLinks(value: string) {
  const input = value.slice(0, 32768);
  const rows = input.split(/\r?\n/).map(row => row.trim()).filter(Boolean);
  const videos: LibraryVideo[] = [];
  const seen = new Set<string>();
  let invalid = 0, duplicates = 0;
  for (const row of rows.slice(0, 48)) {
    const video = roomVideoFromUrl(row);
    if (!video) { invalid++; continue; }
    const key = roomMediaKey(video);
    if (seen.has(key)) { duplicates++; continue; }
    seen.add(key);
    videos.push(video);
  }
  return {videos, invalid, duplicates, truncated: rows.length > 48 || input.length < value.length};
}

/** Small, provider-only metadata lets a guest play a title without its own follows/catalog. */
export function describeRoomMedia(
  video: LibraryVideo | undefined,
  local?: RoomLocalMedia | null,
): RoomMediaDescriptor | null {
  if (!video)
    return local
      ? { id: `local:${local.fingerprint}`, name: local.name.slice(0, 300), kind: "local", local }
      : null;
  if (video.id.startsWith("local:") && local?.fingerprint === video.id.slice(6))
    return { id: video.id, name: local.name.slice(0, 300), kind: "local", local };
  const remote = video.remote;
  const kind = remote?.kind;
  if (!remote || (kind !== "youtube" && kind !== "twitch")) {
    if (!remote && local)
      return {
        id: `local:${local.fingerprint}`,
        name: local.name.slice(0, 300),
        kind: "local",
        local,
      };
    return !remote
      ? { id: video.id, name: video.name.slice(0, 300), kind: "local", duration: video.duration, size: video.size }
      : null;
  }
  const fields = providerFields(kind, remote);
  if (!fields) return null;
  return {
    id: video.id.slice(0, 300),
    name: video.name.slice(0, 300),
    kind,
    videoId: typeof remote.videoId === "string" ? remote.videoId.slice(0, 160) : undefined,
    channelId: typeof remote.channelId === "string" ? remote.channelId.slice(0, 160) : undefined,
    channelName:
      typeof remote.channelName === "string" ? remote.channelName.slice(0, 200) : undefined,
    ...fields,
    poster: safePoster(video.poster),
    publishedDate: exactYoutubePublished(remote.publishedDate),
    publishedLabel: typeof remote.publishedLabel === 'string' ? remote.publishedLabel.slice(0,90) : undefined,
    views: typeof remote.views === 'number' && Number.isSafeInteger(remote.views) && remote.views >= 0 ? remote.views : undefined,
    description: typeof video.description === 'string' ? video.description.slice(0,280) : undefined,
    duration:
      typeof video.duration === "number" && Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : undefined,
  };
}

/** Validate a peer-supplied descriptor before using it as an iframe source. */
export function resolveRoomMedia(
  value: unknown,
): { descriptor: RoomMediaDescriptor; video: LibraryVideo | null } | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<RoomMediaDescriptor>;
  if (typeof item.id !== "string" || !item.id || typeof item.name !== "string" || !item.name)
    return null;
  if (item.kind === "local") {
    const local = item.local;
    if (
      item.id.length > 600 ||
      (local &&
        (typeof local.name !== "string" ||
          typeof local.fingerprint !== "string" ||
          !local.fingerprint ||
          local.fingerprint.length > 500 ||
          item.id !== `local:${local.fingerprint}` ||
          !Number.isFinite(local.size) ||
          !Number.isFinite(local.modified)))
    )
      return null;
    const descriptor: RoomMediaDescriptor = {
      id: item.id,
      name: item.name.slice(0, 300),
      kind: "local",
      size: typeof item.size === "number" && Number.isSafeInteger(item.size) && item.size >= 0 ? item.size : undefined,
      streamId:
        typeof item.streamId === "string" && item.streamId.length <= 160
          ? item.streamId
          : undefined,
      duration:
        typeof item.duration === "number" && Number.isFinite(item.duration) && item.duration > 0
          ? item.duration
          : undefined,
      local: local
        ? {
            name: local.name.slice(0, 300),
            fingerprint: local.fingerprint,
            size: Math.max(0, local.size),
            modified: Math.max(0, local.modified),
          }
        : undefined,
    };
    return {
      descriptor,
      video: {
        id: descriptor.id,
        name: descriptor.name,
        folderId: "room:local",
        path: "",
        mime: "video/mp4",
        extension: "mp4",
        size: local?.size ?? descriptor.size ?? 0,
        duration: descriptor.duration,
        addedAt: 0,
      },
    };
  }
  if (item.kind !== "youtube" && item.kind !== "twitch") return null;
  const kind = item.kind;
  if (
    (item.embedUrl && !safeProviderUrl(item.embedUrl, kind)) ||
    (item.watchUrl && !safeProviderUrl(item.watchUrl, kind))
  )
    return null;
  const fields = providerFields(kind, item);
  if (!fields) return null;
  const descriptor: RoomMediaDescriptor = {
    id: item.id.slice(0, 300),
    name: item.name.slice(0, 300),
    kind,
    videoId: typeof item.videoId === "string" ? item.videoId.slice(0, 160) : undefined,
    channelId: typeof item.channelId === "string" ? item.channelId.slice(0, 160) : undefined,
    channelName: typeof item.channelName === "string" ? item.channelName.slice(0, 200) : undefined,
    ...fields,
    poster: safePoster(item.poster),
    publishedDate: exactYoutubePublished(item.publishedDate),
    publishedLabel: typeof item.publishedLabel === 'string' ? item.publishedLabel.slice(0,90) : undefined,
    views: typeof item.views === 'number' && Number.isSafeInteger(item.views) && item.views >= 0 ? item.views : undefined,
    description: typeof item.description === 'string' ? item.description.slice(0,280) : undefined,
    duration:
      typeof item.duration === "number" && Number.isFinite(item.duration) && item.duration > 0
        ? item.duration
        : undefined,
  };
  const remote: RemoteRef = {
    kind,
    videoId: descriptor.videoId,
    channelId: descriptor.channelId,
    channelName: descriptor.channelName,
    live: descriptor.live,
    embedUrl: descriptor.embedUrl,
    watchUrl: descriptor.watchUrl,
    publishedDate: descriptor.publishedDate,
    publishedSource: descriptor.publishedDate ? 'provider' : 'unknown',
    publishedLabel: descriptor.publishedLabel,
    views: descriptor.views,
  };
  const video: LibraryVideo = {
    id: descriptor.id,
    folderId: `room:${kind}`,
    path: descriptor.id,
    name: descriptor.name,
    extension: kind === "youtube" ? "yt" : "twitch",
    mime: `video/${kind}`,
    size: 0,
    duration: descriptor.duration,
    addedAt: descriptor.publishedDate ? Date.parse(descriptor.publishedDate) : 0,
    poster: descriptor.poster,
    description: descriptor.description,
    remote,
  };
  return { descriptor, video };
}

/** A device's catalog ID is not proof of media identity. Resolve public titles
 * by provider key, and only accept local requests matching host metadata. */
export function resolveRoomRequest(
  id: string,
  value: unknown,
  lookup: (id: string) => LibraryVideo | undefined,
  activeIds: readonly string[],
): LibraryVideo | undefined {
  const resolved = resolveRoomMedia(value);
  if (!resolved?.video || resolved.descriptor.id !== id) return undefined;
  const known = lookup(id);
  if (!resolved.video.remote) {
    if (!known || known.remote || known.name.slice(0, 300) !== resolved.video.name || known.size !== resolved.video.size) return undefined;
    return known;
  }
  const key = roomMediaKey(resolved.video);
  if (known?.remote && roomMediaKey(known) === key) return known;
  for (const activeId of activeIds.slice(0, 49)) {
    const active = lookup(activeId);
    if (active?.remote && roomMediaKey(active) === key) return active;
  }
  if (!known) return resolved.video;
  const canonicalId = `room:${key}`;
  const canonical = lookup(canonicalId);
  if (canonical) return canonical.remote && roomMediaKey(canonical) === key ? canonical : undefined;
  return { ...resolved.video, id: canonicalId, path: canonicalId };
}

/** Room metadata is session-only and bounded to the current title plus its queue. */
export function mergeRoomMedia(
  current: Record<string, LibraryVideo>,
  values: unknown[],
  ids: string[],
) {
  const next = { ...current };
  for (const value of values.slice(0, 49)) {
    const resolved = resolveRoomMedia(value);
    if (
      resolved?.video &&
      JSON.stringify(current[resolved.descriptor.id]) !== JSON.stringify(resolved.video)
    )
      next[resolved.descriptor.id] = resolved.video;
  }
  const bounded = Object.fromEntries(
    [...new Set(ids)].slice(0, 49).flatMap((id) => (next[id] ? [[id, next[id]]] : [])),
  );
  return Object.keys(current).length === Object.keys(bounded).length &&
    Object.entries(bounded).every(([id, video]) => current[id] === video)
    ? current
    : bounded;
}
