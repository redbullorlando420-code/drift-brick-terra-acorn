import type { LibraryVideo } from "./types";

export type TwitchClipIdentity = { version: 1; slug: string; id?: string };
export type TwitchIdentity = { kind: "clip" | "vod" | "live"; value: string };
const slug = /^[A-Za-z0-9_-]{1,160}$/;
const number = /^\d{1,40}$/;
const channel = /^[A-Za-z0-9_]{1,25}$/;
/** Public routes only. Tracking, offsets, titles and display names never establish identity. */
export function twitchUrlIdentity(raw: unknown): TwitchIdentity | undefined {
  if (typeof raw !== "string" || raw.length > 2048) return;
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port)
      return;
    const host = url.hostname.toLowerCase(),
      path = url.pathname.replace(/\/$/, "");
    let value: string | null | undefined;
    if (host === "clips.twitch.tv") {
      value = path === "/embed" ? url.searchParams.get("clip") : path.slice(1);
      if (value && slug.test(value)) return { kind: "clip", value };
    }
    if (["twitch.tv", "www.twitch.tv", "m.twitch.tv"].includes(host)) {
      value = path.match(/^\/[\w]{1,25}\/clip\/([\w-]+)$/)?.[1];
      if (value && slug.test(value)) return { kind: "clip", value };
      value = path.match(/^\/videos\/(\d+)$/)?.[1];
      if (value && number.test(value)) return { kind: "vod", value };
      value = path.match(/^\/([\w]+)$/)?.[1];
      if (
        value &&
        channel.test(value) &&
        !["directory", "downloads", "videos", "settings", "clip", "embed"].includes(
          value.toLowerCase(),
        )
      )
        return { kind: "live", value: value.toLowerCase() };
    }
    if (host === "player.twitch.tv" && !path) {
      value = url.searchParams.get("video")?.replace(/^v/, "");
      if (value && number.test(value)) return { kind: "vod", value };
      value = url.searchParams.get("channel");
      if (value && channel.test(value)) return { kind: "live", value: value.toLowerCase() };
    }
  } catch {
    /* Untrusted URLs remain unrelated entries. */
  }
}
export function twitchIdentity(
  remote: {
    watchUrl?: string;
    embedUrl?: string;
    videoId?: string;
    live?: boolean;
    channelName?: string;
    twitchClipIdentity?: TwitchClipIdentity;
  },
  extension?: string,
): TwitchIdentity | undefined {
  const routes = [remote.watchUrl, remote.embedUrl]
    .map(twitchUrlIdentity)
    .filter((v): v is TwitchIdentity => !!v);
  if (routes.length) {
    if (routes.some((row) => row.kind !== routes[0].kind || row.value !== routes[0].value)) return;
    return routes[0];
  }
  if (remote.live) {
    if (remote.channelName && channel.test(remote.channelName))
      return { kind: "live", value: remote.channelName.toLowerCase() };
    return;
  }
  const value = remote.videoId;
  const verified = remote.twitchClipIdentity;
  if (
    verified?.version === 1 &&
    slug.test(verified.slug) &&
    (!value || value === verified.id || value === verified.slug)
  )
    return { kind: "clip", value: verified.slug };
  if (value && /^v?\d{1,40}$/.test(value) && extension !== "clip")
    return { kind: "vod", value: value.replace(/^v/, "") };
  if (value && slug.test(value) && (extension === "clip" || !number.test(value)))
    return { kind: "clip", value };
}
export function twitchIdentityKeys(video: LibraryVideo): string[] {
  if (video.remote?.kind !== "twitch") return [];
  const identity = twitchIdentity(video.remote, video.extension);
  if (!identity) return [];
  const keys = [`twitch:${identity.kind}:${identity.value}`];
  const pair = video.remote.twitchClipIdentity;
  // Only a provider response may attest an opaque ID/slug pair. Never infer it from a title.
  if (
    identity.kind === "clip" &&
    pair?.version === 1 &&
    pair.slug === identity.value &&
    pair.id &&
    number.test(pair.id)
  )
    keys.push(`twitch:clip-id:${pair.id}`);
  if (
    identity.kind === "clip" &&
    number.test(identity.value) &&
    ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity)
  )
    return [`twitch:clip-id:${identity.value}`];
  return keys;
}
function normalized(video: LibraryVideo, known?: TwitchClipIdentity): LibraryVideo {
  if (video.remote?.kind !== "twitch") return video;
  let identity = twitchIdentity(video.remote, video.extension);
  const pair = video.remote.twitchClipIdentity ?? known;
  if (
    identity?.kind === "clip" &&
    pair?.version === 1 &&
    pair.id === identity.value &&
    slug.test(pair.slug) &&
    ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity)
  )
    identity = { kind: "clip", value: pair.slug };
  if (!identity || identity.kind === "live") return video;
  if (
    identity.kind === "clip" &&
    number.test(identity.value) &&
    ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity) &&
    !(pair?.version === 1 && pair.slug === identity.value)
  )
    return video;
  const watchUrl =
    identity.kind === "clip"
      ? "https://clips.twitch.tv/" + identity.value
      : "https://www.twitch.tv/videos/" + identity.value;
  const embedUrl =
    identity.kind === "clip"
      ? "https://clips.twitch.tv/embed?clip=" + identity.value
      : "https://player.twitch.tv/?video=v" + identity.value;
  if (
    video.remote.videoId === identity.value &&
    video.remote.watchUrl === watchUrl &&
    video.remote.embedUrl === embedUrl
  )
    return video;
  return {
    ...video,
    remote: {
      ...video.remote,
      videoId: identity.value,
      watchUrl,
      embedUrl,
      ...(pair ? { twitchClipIdentity: pair } : {}),
    },
  };
}
export function retainTwitchIdentity(
  previous: LibraryVideo | undefined,
  incoming: LibraryVideo,
): LibraryVideo {
  const keys = twitchIdentityKeys(incoming);
  if (!previous || !keys.length || !twitchIdentityKeys(previous).some((key) => keys.includes(key)))
    return normalized(incoming);
  incoming = normalized(incoming, previous.remote?.twitchClipIdentity);
  const sources = [
    ...new Set([
      previous.folderId,
      ...(previous.remote?.sourceIds ?? []),
      incoming.folderId,
      ...(incoming.remote?.sourceIds ?? []),
    ]),
  ];
  return {
    ...incoming,
    id: previous.id,
    folderId: previous.folderId,
    remote: {
      ...incoming.remote!,
      sourceIds: sources,
      twitchClipIdentity:
        incoming.remote?.twitchClipIdentity ?? previous.remote?.twitchClipIdentity,
    },
  };
}
