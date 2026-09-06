import { create } from "zustand";
import type { LibraryVideo } from "./types";
import { resolvePlayUrl } from "./sources";
import { bitmapFromVideo } from "./hw";

type ThumbState = {
  byId: Record<string, string>;
  failed: Record<string, true>;
  durations: Record<string, number>;
  request: (video: LibraryVideo) => void;
};

const inflight = new Set<string>();
let active = 0;
const waiting: Array<() => void> = [];
const MAX = 2;
const MAX_MEMORY_THUMBS = 360;

async function acquire() {
  if (active < MAX) {
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
    const timer = window.setTimeout(() => finish(null), 9000);
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
    if (video.remote && video.poster) {
      set((s) => ({ byId: { ...s.byId, [video.id]: video.poster! } }));
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
}));
