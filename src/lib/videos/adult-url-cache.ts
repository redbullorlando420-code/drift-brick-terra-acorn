/**
 * Durable Adult preview/poster URL cache.
 * localStorage for instant recall; IndexedDB thumb-cache for the same URLs
 * so a later refresh can keep a known-good image when the API ships a blank.
 */

import type { LibraryVideo } from "./types";
import { isUsableAdultThumb } from "./adult-thumbs";
import { saveThumbCache } from "./persist";

const LS_KEY = "reelcase.adult-preview-urls.v1";
const MAX_LS = 2_400;

type UrlRow = { poster?: string; previewUrl?: string; at: number };

function readMap(): Record<string, UrlRow> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") as Record<string, UrlRow>;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, UrlRow>) {
  if (typeof localStorage === "undefined") return;
  const rows = Object.entries(map).sort((a, b) => (b[1].at ?? 0) - (a[1].at ?? 0)).slice(0, MAX_LS);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Object.fromEntries(rows)));
  } catch {
    /* quota */
  }
}

export function rememberAdultPreviewUrl(id: string, poster?: string, previewUrl?: string) {
  const goodPoster = poster && isUsableAdultThumb(poster) ? poster : undefined;
  const goodPreview = previewUrl && isUsableAdultThumb(previewUrl) ? previewUrl : goodPoster;
  if (!goodPoster && !goodPreview) return;
  const map = readMap();
  map[id] = { poster: goodPoster, previewUrl: goodPreview, at: Date.now() };
  writeMap(map);
  void saveThumbCache({ id, thumb: goodPoster ?? goodPreview ?? "", at: Date.now() }).catch(() => undefined);
}

export function recallAdultPreviewUrl(id: string): UrlRow | undefined {
  return readMap()[id];
}

/** Fill missing/broken incoming artwork from the durable URL cache. */
export function applyCachedAdultUrls(videos: LibraryVideo[]): LibraryVideo[] {
  const map = readMap();
  return videos.map((video) => {
    const cached = map[video.id];
    const posterOk = video.poster && isUsableAdultThumb(video.poster);
    const previewOk = video.remote?.previewUrl && isUsableAdultThumb(video.remote.previewUrl);
    if (posterOk && previewOk) return video;
    if (!cached?.poster && !cached?.previewUrl) return video;
    return {
      ...video,
      poster: posterOk ? video.poster : cached.poster ?? video.poster,
      remote: video.remote
        ? {
            ...video.remote,
            previewUrl: previewOk ? video.remote.previewUrl : cached.previewUrl ?? cached.poster ?? video.remote.previewUrl,
          }
        : video.remote,
    };
  });
}

export function cacheAdultVideoUrls(videos: LibraryVideo[]) {
  for (const video of videos) {
    rememberAdultPreviewUrl(video.id, video.poster, video.remote?.previewUrl);
  }
}
