import type { LibraryVideo } from "./types";
import { forEachCatalogSlice, yieldCatalogTask } from "../catalog-work.ts";
export type TwitchContentKind = "past-broadcast" | "highlight" | "upload" | "clip";
export type TwitchContentSource = "ARCHIVE" | "HIGHLIGHT" | "UPLOAD" | "CLIPS";
export type TwitchContentEvidence = {
  kind: TwitchContentKind;
  source: TwitchContentSource;
  videoId: string;
  at: number;
};
export type TwitchContentFilter = "all" | TwitchContentKind | "live" | "unknown";
const sourceKind = {
  ARCHIVE: "past-broadcast",
  HIGHLIGHT: "highlight",
  UPLOAD: "upload",
  CLIPS: "clip",
} as const;
export const TWITCH_CONTENT_OPTIONS = [
  ["all", "All content types"],
  ["past-broadcast", "Past broadcasts"],
  ["highlight", "Highlights"],
  ["upload", "Uploads"],
  ["clip", "Clips"],
  ["live", "Live streams"],
  ["unknown", "Unknown subtype"],
] as const;
export function twitchContentEvidence(
  source: string,
  videoId: string,
  at: number,
): TwitchContentEvidence | undefined {
  if (
    typeof source !== "string" ||
    typeof videoId !== "string" ||
    !Object.hasOwn(sourceKind, source) ||
    !/^[-_a-zA-Z0-9]{1,128}$/.test(videoId) ||
    !Number.isFinite(at) ||
    at <= 0 ||
    at > 8_640_000_000_000_000
  )
    return;
  return {
    kind: sourceKind[source as TwitchContentSource],
    source: source as TwitchContentSource,
    videoId,
    at,
  };
}
function identity(video: LibraryVideo): "clip" | "video" | undefined {
  // Explicit saved clip markers predate canonical tw:c IDs in older libraries.
  if (video.extension === "clip" || video.id.startsWith("tw:c:")) return "clip";
  if (video.extension === "vod" || video.id.startsWith("tw:v:")) return "video";
  for (const raw of [video.remote?.watchUrl, video.remote?.embedUrl]) {
    if (!raw) continue;
    try {
      const u = new URL(raw);
      if (u.protocol !== "https:" && u.protocol !== "http:") continue;
      if (
        (u.hostname === "clips.twitch.tv" && u.pathname !== "/") ||
        (/^(?:www\.|player\.)?twitch\.tv$/.test(u.hostname) &&
          (/^\/[^/]+\/clip\/[^/]+/.test(u.pathname) || u.searchParams.has("clip")))
      )
        return "clip";
      if (
        /^(?:www\.|player\.)?twitch\.tv$/.test(u.hostname) &&
        (/^\/videos\/\d+/.test(u.pathname) || u.searchParams.has("video"))
      )
        return "video";
    } catch {
      /* No type evidence from an invalid URL. */
    }
  }
}
export function knownTwitchContent(video: LibraryVideo): TwitchContentEvidence | undefined {
  if (video.remote?.kind !== "twitch") return;
  const raw = video.remote.twitchContent;
  if (!raw || typeof raw !== "object") return;
  const valid =
    typeof raw.source === "string" &&
    Object.hasOwn(sourceKind, raw.source) &&
    typeof raw.videoId === "string" &&
    /^[-_a-zA-Z0-9]{1,128}$/.test(raw.videoId) &&
    Number.isFinite(raw.at) &&
    raw.at > 0 &&
    raw.at <= 8_640_000_000_000_000;
  const videoId =
    video.remote.videoId ?? (/^tw:[vc]:/.test(video.id) ? video.id.slice(5) : undefined);
  if (!valid || sourceKind[raw.source] !== raw.kind || raw.videoId !== videoId) return;
  if (
    (video.id.startsWith("tw:c:") && video.id.slice(5) !== raw.videoId) ||
    (video.id.startsWith("tw:v:") && video.id.slice(5) !== raw.videoId)
  )
    return;
  const family = identity(video);
  if ((family === "clip" && raw.kind !== "clip") || (family === "video" && raw.kind === "clip"))
    return;
  return raw;
}
export function twitchContentKind(video: LibraryVideo): TwitchContentKind | "live" | "unknown" {
  if (video.remote?.kind !== "twitch") return "unknown";
  if (video.remote.live) return "live";
  const evidence = knownTwitchContent(video);
  if (evidence) return evidence.kind;
  return identity(video) === "clip" ? "clip" : "unknown";
}
export function twitchContentLabel(video: LibraryVideo) {
  if (
    video.remote?.kind === "twitch" &&
    !video.remote.live &&
    (video.extension === "live" || /:(?:live|channel)$/.test(video.id))
  )
    return "Channel bookmark";
  return {
    "past-broadcast": "Past broadcast",
    highlight: "Highlight",
    upload: "Upload",
    clip: "Clip",
    live: "Live stream",
    unknown: "Unknown video subtype",
  }[twitchContentKind(video)];
}
export function matchesTwitchContent(video: LibraryVideo, filter: TwitchContentFilter) {
  if (filter === "all") return true;
  if (video.remote?.kind !== "twitch") return false;
  if (
    filter !== "live" &&
    !video.remote.live &&
    (video.extension === "live" || /:(?:live|channel)$/.test(video.id))
  )
    return false;
  return twitchContentKind(video) === filter;
}
/** Carry matching evidence through sparse refreshes; no guesses or bulk migration. */
export function retainTwitchContent(
  previous: LibraryVideo | undefined,
  incoming: LibraryVideo,
): LibraryVideo {
  if (incoming.remote?.kind !== "twitch") return incoming;
  const current = knownTwitchContent(incoming),
    prior = previous && knownTwitchContent(previous);
  const candidate =
    prior &&
    prior.videoId ===
      (incoming.remote.videoId ??
        (/^tw:[vc]:/.test(incoming.id) ? incoming.id.slice(5) : undefined)) &&
    (!current || prior.at > current.at)
      ? prior
      : current;
  const keep =
    candidate && candidate !== current
      ? knownTwitchContent({
          ...incoming,
          remote: { ...incoming.remote, twitchContent: candidate },
        })
      : current;
  if (keep === incoming.remote.twitchContent) return incoming;
  const { twitchContent: _invalid, ...remote } = incoming.remote;
  return { ...incoming, remote: { ...remote, ...(keep ? { twitchContent: keep } : {}) } };
}
/** Explicit export walks the current selection cooperatively, without cloning
 * a catalog or logging local paths/account data. */
export async function twitchContentReport(videos: LibraryVideo[], turn = yieldCatalogTask) {
  const parts: string[] = [
    "id,title,video_id,type,evidence_source,evidence_observed_at,watch_url\r\n",
  ];
  let chunk: string[] = [];
  const cell = (v: unknown) => {
    const text = String(v ?? "");
    return '"' + (/^[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"';
  };
  await forEachCatalogSlice(
    videos,
    (video) => {
      if (video.remote?.kind !== "twitch") return;
      const e = knownTwitchContent(video);
      chunk.push(
        [
          video.id,
          video.name,
          video.remote.videoId,
          twitchContentKind(video),
          e?.source ?? (twitchContentKind(video) === "clip" ? "saved-clip-identity" : "unrecorded"),
          e ? new Date(e.at).toISOString() : "",
          video.remote.watchUrl,
        ]
          .map(cell)
          .join(",") + "\r\n",
      );
      if (chunk.length >= 256) {
        parts.push(chunk.join(""));
        chunk = [];
      }
    },
    turn,
    256,
  );
  if (chunk.length) parts.push(chunk.join(""));
  return new Blob(parts, { type: "text/csv;charset=utf-8" });
}
