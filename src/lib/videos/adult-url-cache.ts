/**
 * Durable Adult preview/poster URL cache.
 * localStorage for instant recall; IndexedDB thumb-cache for the same URLs
 * so a later refresh can keep a known-good image when the API ships a blank.
 */

import type { LibraryVideo } from "./types";
import { isUsableAdultThumb } from "./adult-thumbs";
import { saveThumbCache } from "./persist";
import { scheduleBackgroundWork } from "@/lib/interaction-budget";
import { createPreviewUrlCache } from "./preview-url-cache.ts";

const LS_KEY = "reelcase.adult-preview-urls.v1";
const MAX_LS = 2_400;

type UrlRow = { poster?: string; previewUrl?: string; at: number };

const cache = createPreviewUrlCache(MAX_LS);
let loaded = false, dirty = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let cancelFlush = () => {};
function load() {
  if (loaded || typeof localStorage === 'undefined') return;
  loaded = true;
  try { cache.hydrate(JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')); } catch { /* Empty cache remains usable. */ }
}
function flush() {
  cancelFlush(); clearTimeout(timer); timer = undefined;
  if (!dirty || typeof localStorage === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(cache.serialize())); dirty = false; } catch { /* Disk thumbnails remain the fallback. */ }
}
function scheduleFlush() {
  if (timer !== undefined) return;
  timer = setTimeout(() => {
    cancelFlush = scheduleBackgroundWork(() => { flush(); });
  }, 750);
}
function remember(id: string, poster?: string, previewUrl?: string) {
  load();
  const goodPoster = poster && isUsableAdultThumb(poster) ? poster : undefined;
  const goodPreview = previewUrl && isUsableAdultThumb(previewUrl) ? previewUrl : goodPoster;
  if (!goodPoster && !goodPreview) return;
  if (!cache.remember(id, { poster: goodPoster, previewUrl: goodPreview, at: Date.now() })) return;
  dirty = true; scheduleFlush();
  void saveThumbCache({ id, thumb: goodPoster ?? goodPreview ?? '', at: Date.now() }).catch(() => undefined);
}
export const rememberAdultPreviewUrl = remember;
export function recallAdultPreviewUrl(id: string): UrlRow | undefined { load(); return cache.get(id); }
if (typeof window !== 'undefined') {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LS_KEY || dirty) return;
    loaded = false; cache.clear();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener('pagehide', flush);
  import.meta.hot?.dispose(() => { flush(); window.removeEventListener('storage', onStorage); window.removeEventListener('pagehide', flush); cache.clear(); });
}

/** Fill missing/broken incoming artwork from the durable URL cache. */
export function applyCachedAdultUrls(videos: LibraryVideo[]): LibraryVideo[] {
  load();
  return videos.map((video) => {
    const cached = cache.get(video.id);
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
  for (const video of videos) remember(video.id, video.poster, video.remote?.previewUrl);
}
