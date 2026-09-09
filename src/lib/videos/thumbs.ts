import { create } from "zustand";
import type { LibraryVideo } from "./types";
import { resolvePlayUrl } from "./sources";
import { bitmapFromVideo } from "./hw";
import { loadThumbCache, saveThumbCache } from "./persist";

type ThumbState = {
  byId: Record<string, string>;
  failed: Record<string, true>;
  durations: Record<string, number>;
  request: (video: LibraryVideo) => void;
  retry: (video: LibraryVideo) => void;
  hydrate: () => Promise<void>;
};

const inflight = new Set<string>();
let active = 0;
const waiting: Array<() => void> = [];
const MAX_MEMORY_THUMBS = 360;

function maxThumbnailWorkers() {
  const adaptive = Math.min(4, Math.max(2, Math.floor(((typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 4) || 4) / 2)));
  try {
    const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0");
    return [2, 3, 4].includes(saved) ? saved : adaptive;
  } catch { return adaptive; }
}

async function acquire() {
  if (active < maxThumbnailWorkers()) {
    active += 1;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
  active += 1;
}

function release() {
  active = Math.max(0, active - 1);
  const next = waiting.shift();
  if (next) next();
}

function capture(src: string): Promise<{ thumb: string | null; duration?: number }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    video.className = "hw-video";
    let settled = false;
    const finish = (thumb: string | null, duration?: number) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      resolve({ thumb, duration });
    };
    const timer = window.setTimeout(() => finish(null), 6000);
    video.addEventListener("loadedmetadata", () => {
      const duration = Number.isFinite(video.duration) ? video.duration : undefined;
      const t =
        duration && duration > 0
          ? Math.min(Math.max(duration * 0.15, 0.35), 6)
          : 0.35;
      try {
        video.currentTime = t;
      } catch {
        finish(null, duration);
      }
    });
    video.addEventListener("seeked", () => {
      void (async () => {
        try {
          const width = video.videoWidth;
          const height = video.videoHeight;
          if (!width || !height) {
            finish(null, Number.isFinite(video.duration) ? video.duration : undefined);
            return;
          }
          const w = 360;
          const h = Math.round((height / width) * w) || 360;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) {
            finish(null);
            return;
          }
          const bitmap = await bitmapFromVideo(video);
          if (bitmap) {
            ctx.drawImage(bitmap, 0, 0, w, h);
            bitmap.close();
          } else {
            ctx.drawImage(video, 0, 0, w, h);
          }
          finish(
            canvas.toDataURL("image/jpeg", 0.74),
            Number.isFinite(video.duration) ? video.duration : undefined,
          );
        } catch {
          finish(null);
        }
      })();
    });
    video.addEventListener("error", () => finish(null));
    video.src = src;
  });
}

export const useThumbs = create<ThumbState>((set, get) => ({
  byId: {},
  failed: {},
  durations: {},
  request: (video) => {
    const { byId, failed } = get();
    if (byId[video.id] || failed[video.id] || inflight.has(video.id)) return;
    if (video.remote) {
      const youtubeId = video.remote.kind === "youtube" ? video.remote.videoId ?? video.remote.embedUrl?.match(/(?:embed\/|v=)([A-Za-z0-9_-]{11})/)?.[1] : undefined;
      const providerArtwork = video.poster || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined) || video.remote.previewUrl;
      if (providerArtwork) set((s) => ({ byId: { ...s.byId, [video.id]: providerArtwork } }));
      // Cross-origin embeds cannot be frame-captured. Leave cards on provider
      // artwork rather than placing them in the local thumbnail failure queue.
      return;
    }
    inflight.add(video.id);
    void (async () => {
      await acquire();
      try {
        const src = await resolvePlayUrl(video);
        const { thumb, duration } = await capture(src);
        inflight.delete(video.id);
        if (thumb) {
          set((s) => {
            const nextThumbs = { ...s.byId, [video.id]: thumb };
            const ids = Object.keys(nextThumbs);
            if (ids.length > MAX_MEMORY_THUMBS) delete nextThumbs[ids[0]];
            return {
            byId: nextThumbs,
            durations:
              duration && duration > 0
                ? { ...s.durations, [video.id]: duration }
                : s.durations,
          }; });
          void saveThumbCache({ id: video.id, thumb, at: Date.now() }).catch(() => undefined);
        } else {
          set((s) => ({
            failed: { ...s.failed, [video.id]: true },
            durations:
              duration && duration > 0
                ? { ...s.durations, [video.id]: duration }
                : s.durations,
          }));
        }
      } catch {
        inflight.delete(video.id);
        set((s) => ({ failed: { ...s.failed, [video.id]: true } }));
      } finally {
        release();
      }
    })();
  },
  retry: (video) => {
    set((s) => {
      const failed = { ...s.failed };
      delete failed[video.id];
      return { failed };
    });
    get().request(video);
  },
  hydrate: async () => {
    try {
      const rows = await loadThumbCache(MAX_MEMORY_THUMBS);
      set((s) => ({ byId: { ...Object.fromEntries(rows.map((row) => [row.id, row.thumb])), ...s.byId } }));
    } catch { /* Thumbnail cache is an optional speed-up. */ }
  },
}));
