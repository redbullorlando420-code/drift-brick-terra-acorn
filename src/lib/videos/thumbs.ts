import { create } from "zustand";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import type { LibraryVideo } from "./types";
import { resolvePlayUrl } from "./sources";
import { bitmapFromVideo } from "./hw";
import { loadThumbCache, saveThumbCache } from "./persist";
import { companionGetThumb } from "@/lib/companion";
import { boundedRecord } from "../bounded-record.ts";
import { allowAutomaticRefresh } from "../session-activity.ts";
export { companionCacheThumbUrl as mirrorRemotePosterToCompanion } from "@/lib/companion";

type ThumbState = {
  byId: Record<string, string>;
  failed: Record<string, true>;
  durations: Record<string, number>;
  diagnostics: Record<string, { attempts: number; lastError: string; at: number }>;
  request: (video: LibraryVideo) => void;
  retry: (video: LibraryVideo) => void;
  hydrate: () => Promise<void>;
  recallCompanion: (id: string) => Promise<void>;
  trimMemory: () => void;
};

const inflight = new Set<string>();
const controllers = new Map<string, AbortController>();
const recalling = new Set<string>();
let active = 0;
const waiting: Array<() => void> = [];
const MAX_MEMORY_THUMBS = LIBRARY_LIMITS.memoryThumbEntries;
const MAX_ARTWORK_ATTEMPTS = 3;
const MAX_THUMB_QUEUE = 96;
const MAX_THUMB_BYTES = 8 * 1024 * 1024;
let artworkHits = 0;
let artworkMisses = 0;
let artworkEvictions = 0;

function inputOrBackgroundWork() {
  const nav = typeof navigator !== "undefined" ? navigator as Navigator & { scheduling?: { isInputPending?: () => boolean } } : undefined;
  return Boolean(nav?.scheduling?.isInputPending?.()) || (typeof document !== "undefined" && document.visibilityState !== "visible");
}

function maxThumbnailWorkers() {
  const nav = typeof navigator !== "undefined" ? navigator as Navigator & { deviceMemory?: number; scheduling?: { isInputPending?: () => boolean } } : undefined;
  const cores = nav?.hardwareConcurrency ?? 4;
  const memory = nav?.deviceMemory ?? 4;
  // Do not compete with scroll/touch work or decode several frames at once on
  // entry-level devices. The explicit setting remains an upper-bound override.
  const interacting = Boolean(nav?.scheduling?.isInputPending?.()) || (typeof document !== "undefined" && document.visibilityState !== "visible");
  const adaptive = interacting || memory <= 2 ? 1 : Math.min(4, Math.max(2, Math.floor(cores / (memory <= 4 ? 3 : 2))));
  try {
    const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0");
    return [1, 2, 3, 4].includes(saved) ? Math.min(saved, adaptive + 1) : adaptive;
  } catch { return adaptive; }
}

async function acquire(signal: AbortSignal) {
  // Do not start a decode in the same slice as typing, scrolling, or a hidden
  // tab. The bounded queue remains intact and wakes quickly when input ends.
  while (inputOrBackgroundWork() || active >= maxThumbnailWorkers()) {
    if (signal.aborted) return false;
    if (inputOrBackgroundWork()) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 80));
    } else {
      await new Promise<void>((resolve) => {
        const wake = () => { signal.removeEventListener("abort", cancel); resolve(); };
        const cancel = () => { const index = waiting.indexOf(wake); if (index >= 0) waiting.splice(index, 1); wake(); };
        waiting.push(wake);
        signal.addEventListener("abort", cancel, { once: true });
      });
    }
  }
  if (signal.aborted) return false;
  active += 1;
  return true;
}

/** Local-only artwork queue/cache numbers for the opt-in diagnostics panel. */
export function getThumbDiagnostics() {
  const s = useThumbs.getState();
  return { active, queued: waiting.length, inflight: inflight.size, recalling: recalling.size, entries: Object.keys(s.byId).length,
    bytes: Object.values(s.byId).reduce((sum, value) => sum + value.length * 2, 0),
    failures: Object.keys(s.failed).length, hits: artworkHits, misses: artworkMisses, evictions: artworkEvictions };
}

function release() {
  active = Math.max(0, active - 1);
  const next = waiting.shift();
  if (next) next();
}

function capture(src: string, signal: AbortSignal): Promise<{ thumb: string | null; duration?: number }> {
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
      signal.removeEventListener("abort", abort);
      video.onloadedmetadata = video.onseeked = video.onerror = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
      resolve({ thumb, duration });
    };
    const timer = window.setTimeout(() => finish(null), 6000);
    const abort = () => finish(null);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) { finish(null); return; }
    video.onloadedmetadata = () => {
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
    };
    video.onseeked = () => {
      video.onseeked = null;
      void (async () => {
        try {
          const width = video.videoWidth;
          const height = video.videoHeight;
          if (!width || !height) {
            finish(null, Number.isFinite(video.duration) ? video.duration : undefined);
            return;
          }
          const w = 360;
          const h = Math.min(720, Math.round((height / width) * w) || 360);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) {
            finish(null);
            return;
          }
          const bitmap = await bitmapFromVideo(video);
          try {
            if (settled || signal.aborted) return;
            if (bitmap) ctx.drawImage(bitmap, 0, 0, w, h);
            else ctx.drawImage(video, 0, 0, w, h);
            finish(canvas.toDataURL("image/jpeg", 0.74), Number.isFinite(video.duration) ? video.duration : undefined);
          } finally {
            bitmap?.close();
            canvas.width = canvas.height = 0;
          }
        } catch {
          finish(null);
        }
      })();
    };
    video.onerror = () => finish(null);
    video.src = src;
  });
}

function boundedThumbState(s: Pick<ThumbState, "byId" | "failed" | "durations" | "diagnostics">, count: number = MAX_MEMORY_THUMBS, bytes = MAX_THUMB_BYTES) {
  // Disk hydration and companion recalls can finish after idle cleanup. Keep
  // their late results inside the resting budget instead of refilling it.
  if (!allowAutomaticRefresh()) { count = Math.min(count, 32); bytes = Math.min(bytes, 1024 * 1024); }
  const byId = boundedRecord(s.byId, count, bytes, value => value.length * 2);
  for (const [id, url] of Object.entries(s.byId)) if (!byId[id]) {
    artworkEvictions++;
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  }
  return { byId, failed: boundedRecord(s.failed, MAX_MEMORY_THUMBS * 2), durations: boundedRecord(s.durations, MAX_MEMORY_THUMBS * 2), diagnostics: boundedRecord(s.diagnostics, MAX_MEMORY_THUMBS * 2) };
}

export const useThumbs = create<ThumbState>((set, get) => ({
  byId: {},
  failed: {},
  durations: {},
  diagnostics: {},
  request: (video) => {
    if (!allowAutomaticRefresh()) return;
    const { byId, failed, diagnostics } = get();
    if (byId[video.id]) { artworkHits += 1; return; }
    if (failed[video.id] || inflight.has(video.id)) return;
    if ((diagnostics[video.id]?.attempts ?? 0) >= MAX_ARTWORK_ATTEMPTS) return;
    if (inflight.size >= MAX_THUMB_QUEUE) return;
    artworkMisses += 1;
    if (video.remote) {
      // Cross-origin embeds cannot be frame-captured. Leave cards on provider
      // artwork rather than duplicating provider URLs for every browsed remote
      // card in the in-memory thumbnail cache. VideoCard reads those URLs
      // directly, so this cache entry was redundant.
      return;
    }
    inflight.add(video.id);
    const controller = new AbortController();
    controllers.set(video.id, controller);
    void (async () => {
      const acquired = await acquire(controller.signal);
      try {
        if (!acquired || controller.signal.aborted) return;
        const src = await resolvePlayUrl(video);
        if (controller.signal.aborted) return;
        const { thumb, duration } = await capture(src, controller.signal);
        if (controller.signal.aborted) return;
        set(s => boundedThumbState({
          ...s,
          byId: thumb ? { ...s.byId, [video.id]: thumb } : s.byId,
          failed: thumb ? s.failed : { ...s.failed, [video.id]: true },
          diagnostics: thumb ? s.diagnostics : { ...s.diagnostics, [video.id]: { attempts: (s.diagnostics[video.id]?.attempts ?? 0) + 1, lastError: "No decodable frame", at: Date.now() } },
          durations: duration && duration > 0 ? { ...s.durations, [video.id]: duration } : s.durations,
        }));
        if (thumb) void saveThumbCache({ id: video.id, thumb, at: Date.now() }).catch(() => undefined);
      } catch {
        if (!controller.signal.aborted) set(s => boundedThumbState({ ...s,
          failed: { ...s.failed, [video.id]: true },
          diagnostics: { ...s.diagnostics, [video.id]: { attempts: (s.diagnostics[video.id]?.attempts ?? 0) + 1, lastError: "Source could not be reopened", at: Date.now() } },
        }));
      } finally {
        inflight.delete(video.id);
        controllers.delete(video.id);
        if (acquired) release();
      }
    })();
  },
  retry: (video) => {
    set((s) => {
      if ((s.diagnostics[video.id]?.attempts ?? 0) >= MAX_ARTWORK_ATTEMPTS) return s;
      const failed = { ...s.failed };
      delete failed[video.id];
      return { failed };
    });
    get().request(video);
  },
  hydrate: async () => {
    try {
      const rows = await loadThumbCache(MAX_MEMORY_THUMBS);
      // Keep insertion order oldest-first so idle/LRU trimming retains the
      // newest disk artwork, followed by frames captured in this session.
      set((s) => boundedThumbState({ ...s, byId: { ...Object.fromEntries(rows.reverse().map((row) => [row.id, row.thumb])), ...s.byId } }));
    } catch { /* Thumbnail cache is an optional speed-up. */ }
  },
  /** Recall a companion-disk thumb when browser IndexedDB was pruned. */
  recallCompanion: async (id) => {
    if (!allowAutomaticRefresh()) return;
    if (!id || get().byId[id] || recalling.has(id) || recalling.size >= 8) return;
    recalling.add(id);
    try {
      const dataUrl = await companionGetThumb(id);
      if (!dataUrl) return;
      set(s => boundedThumbState({ ...s, byId: { ...s.byId, [id]: dataUrl } }));
      void saveThumbCache({ id, thumb: dataUrl, at: Date.now() }).catch(() => undefined);
    } finally { recalling.delete(id); }
  },
  trimMemory: () => {
    for (const controller of controllers.values()) controller.abort();
    set(s => boundedThumbState(s, 32, 1024 * 1024));
  },
}));
