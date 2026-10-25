import type { LibraryVideo } from "./types";
import { hasFreshViewerCount } from './types.ts';
import { YOUTUBE_LIVE_HOLD_MS } from './live-retention.ts';

export const LIVE_SOURCES = [
  { id: "twitch", label: "Twitch" },
  { id: "youtube", label: "YouTube" },
  { id: "chaturbate", label: "Chaturbate" },
  { id: "myfreecams", label: "MyFreeCams" },
] as const;
export type LiveSource = typeof LIVE_SOURCES[number]["id"];

export function liveResultPage<T>(rows: readonly T[], requested: number, size = 24) {
  const pageSize = Math.max(1, Math.min(48, Math.floor(size) || 24));
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.max(0, Math.min(pages - 1, Math.floor(requested) || 0));
  return { rows: rows.slice(page * pageSize, (page + 1) * pageSize), page, pages, total: rows.length, pageSize };
}

/** Compare against the current clock at ingestion/render, not the last timer tick. */
export function hasFreshTwitchLiveState(video: LibraryVideo, now: number, maxAge: number) {
  if (video.remote?.kind !== "twitch" || !video.remote.live) return true;
  const observedAt = video.remote.observedAt ?? 0;
  // Permit small client/server clock skew without accepting corrupt future dates.
  return observedAt > 0 && observedAt <= now + 5_000 && now - observedAt <= maxAge;
}

export function hasFreshRemoteLiveState(video: LibraryVideo, now: number, twitchMaxAge: number, youtubeMaxAge: number) {
  if (!video.remote?.live) return true;
  if (video.remote.kind === "twitch") return hasFreshTwitchLiveState(video, now, twitchMaxAge);
  if (video.remote.kind !== "youtube") return true;
  if (video.remote.liveOfflineSince && video.remote.liveOfflineSince <= now && now - video.remote.liveOfflineSince < YOUTUBE_LIVE_HOLD_MS) return true;
  const observedAt = video.remote.observedAt ?? 0;
  return observedAt > 0 && observedAt <= now + 5_000 && now - observedAt <= youtubeMaxAge;
}

export function liveDeskRows(videos: LibraryVideo[], adultVideos: LibraryVideo[]) {
  const unique = new Map<string, LibraryVideo>();
  for (const video of [...videos, ...adultVideos]) {
    if (video.remote?.live && LIVE_SOURCES.some(source => source.id === video.remote?.kind)) unique.set(video.id, video);
  }
  return [...unique.values()];
}

export function filterLiveRows(videos: LibraryVideo[], options: {
  source: string; filter: string; search: string; sort: string;
  favorites: Record<string, unknown>; likes: Record<string, unknown>;
}) {
  const needle = options.search.trim().toLowerCase();
  const now = Date.now();
  const currentAudience = (video: LibraryVideo) => !video.remote?.liveUnconfirmed && !video.remote?.liveOfflineSince && hasFreshViewerCount(video.remote, now);
  return videos.filter(video =>
    (options.source === "all" || video.remote?.kind === options.source) &&
    (options.filter === "all" || Boolean((options.filter === "favorites" ? options.favorites : options.likes)[video.id])) &&
    `${video.name} ${video.remote?.channelName ?? ""}`.toLowerCase().includes(needle)
  ).sort((a, b) => {
    const name = (a.remote?.channelName || a.name).localeCompare(b.remote?.channelName || b.name);
    if (options.sort === "name") return name;
    return (options.sort === "favorites" ? Number(Boolean(options.favorites[b.id])) - Number(Boolean(options.favorites[a.id])) : 0)
      || Number(currentAudience(b)) - Number(currentAudience(a))
      || (currentAudience(b) ? b.remote!.viewers! : 0) - (currentAudience(a) ? a.remote!.viewers! : 0) || name;
  });
}
