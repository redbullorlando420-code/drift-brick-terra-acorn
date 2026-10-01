import { create } from "zustand";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import type { LibraryVideo } from "./types";
import { resolvePlayUrl } from "./sources";
import { bitmapFromVideo } from "./hw";
import { loadCachedThumb, loadThumbCache, saveThumbCache } from "./persist";
import { companionGetThumb } from "@/lib/companion";
import { boundedRecord } from "../bounded-record.ts";
import { allowAutomaticRefresh, subscribeSessionPhase } from "../session-activity.ts";
import { getInteractionPriorityDelay } from "../interaction-budget.ts";
import { isArtworkSuppressed, subscribeArtworkSuppression } from './image-load-budget.ts';
import { createThumbnailQueue } from './thumbnail-queue.ts';
import { artworkBytes, artworkUrl, binaryArtwork, releaseArtwork } from './binary-artwork';
export { companionCacheThumbUrl as mirrorRemotePosterToCompanion } from "@/lib/companion";

type ThumbState = {
  byId: Record<string, string>;
  failed: Record<string, true>;
  durations: Record<string, number>;
  diagnostics: Record<string, { attempts: number; lastError: string; at: number }>;
  request: (video: LibraryVideo, options?: { priority?: 'high' | 'low' }) => () => void;
  retry: (video: LibraryVideo) => void;
  hydrate: () => Promise<void>;
  recallCompanion: (id: string) => Promise<void>;
  trimMemory: () => void;
};

const recalling = new Set<string>();
const MAX_MEMORY_THUMBS = LIBRARY_LIMITS.memoryThumbEntries;
const MAX_ARTWORK_ATTEMPTS = 3;
const MAX_THUMB_QUEUE = 96;
const MAX_THUMB_BYTES = 8 * 1024 * 1024;
let artworkHits = 0;
let artworkMisses = 0;
let artworkEvictions = 0;

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

let inputPriorityUntil = 0;
const thumbnailQueue = createThumbnailQueue({
  workers: maxThumbnailWorkers,
  limit: MAX_THUMB_QUEUE,
  delay: () => {
    if (isArtworkSuppressed() || !allowAutomaticRefresh()) return Infinity;
    const nav = navigator as Navigator & { scheduling?: { isInputPending?: () => boolean } };
    return Math.max(getInteractionPriorityDelay(), inputPriorityUntil - performance.now(), nav.scheduling?.isInputPending?.() ? 80 : 0);
  },
  subscribe: wake => {
    const input = () => { inputPriorityUntil = performance.now() + 160; wake(); };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const;
    for (const event of events) window.addEventListener(event, input, { passive: true });
    document.addEventListener('visibilitychange', wake);
    const stopViewer = subscribeArtworkSuppression(wake);
    const stopSession = subscribeSessionPhase(wake);
    return () => {
      for (const event of events) window.removeEventListener(event, input);
      document.removeEventListener('visibilitychange', wake);
      stopViewer(); stopSession();
    };
  },
});
import.meta.hot?.dispose(() => {
  thumbnailQueue.dispose();
  for (const url of Object.values(useThumbs.getState().byId)) releaseArtwork(url);
});

/** Local-only artwork queue/cache numbers for the opt-in diagnostics panel. */
export function getThumbDiagnostics() {
  const s = useThumbs.getState();
  const queue = thumbnailQueue.snapshot();
  return { active: queue.active, queued: queue.queued, inflight: queue.jobs, recalling: recalling.size, entries: Object.keys(s.byId).length,
    bytes: Object.values(s.byId).reduce((sum, value) => sum + artworkBytes(value), 0),
    failures: Object.keys(s.failed).length, hits: artworkHits, misses: artworkMisses, evictions: artworkEvictions };
}

function capture(src: string, signal: AbortSignal): Promise<{ thumb: Blob | null; duration?: number }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    video.className = "hw-video";
    let settled = false;
    const finish = (thumb: Blob | null, duration?: number) => {
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
            const duration = Number.isFinite(video.duration) ? video.duration : undefined;
            const thumb = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.74));
            if (!settled && !signal.aborted) finish(thumb, duration);
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
  const byId = boundedRecord(s.byId, count, bytes, artworkBytes);
  for (const [id, url] of Object.entries(s.byId)) if (!byId[id]) {
    artworkEvictions++;
    releaseArtwork(url);
  }
  return { byId, failed: boundedRecord(s.failed, MAX_MEMORY_THUMBS * 2), durations: boundedRecord(s.durations, MAX_MEMORY_THUMBS * 2), diagnostics: boundedRecord(s.diagnostics, MAX_MEMORY_THUMBS * 2) };
}

export const useThumbs = create<ThumbState>((set, get) => ({
  byId: {},
  failed: {},
  durations: {},
  diagnostics: {},
  request: (video, options) => {
    const noop = () => {};
    if (!allowAutomaticRefresh()) return noop;
    const { byId, failed, diagnostics } = get();
    if (byId[video.id]) { artworkHits += 1; return noop; }
    if (failed[video.id]) return noop;
    if ((diagnostics[video.id]?.attempts ?? 0) >= MAX_ARTWORK_ATTEMPTS) return noop;
    if (video.remote) {
      // Cross-origin embeds cannot be frame-captured. Leave cards on provider
      // artwork rather than duplicating provider URLs for every browsed remote
      // card in the in-memory thumbnail cache. VideoCard reads those URLs
      // directly, so this cache entry was redundant.
      return noop;
    }
    if (!thumbnailQueue.has(video.id)) artworkMisses += 1;
    return thumbnailQueue.enqueue(video.id, async signal => {
      try {
        if (signal.aborted) return;
        // Eviction frees RAM only. Re-open the compressed disk image before
        // asking for file access or decoding the video a second time.
        const cached = await loadCachedThumb(video.id).catch(() => undefined);
        if (signal.aborted) return;
        if (cached?.thumb) {
          const thumb = await binaryArtwork(cached.thumb);
          if (signal.aborted) return;
          set(s => s.byId[video.id] ? s : boundedThumbState({ ...s, byId: { ...s.byId, [video.id]: artworkUrl(thumb) } }));
          artworkHits++;
          if (thumb !== cached.thumb) void saveThumbCache({ ...cached, thumb }).catch(() => undefined);
          return;
        }
        const src = await resolvePlayUrl(video);
        if (signal.aborted) return;
        const { thumb, duration } = await capture(src, signal);
        if (signal.aborted) return;
        set(s => boundedThumbState({
          ...s,
          byId: thumb && !s.byId[video.id] ? { ...s.byId, [video.id]: artworkUrl(thumb) } : s.byId,
          failed: thumb || s.byId[video.id] ? s.failed : { ...s.failed, [video.id]: true },
          diagnostics: thumb || s.byId[video.id] ? s.diagnostics : { ...s.diagnostics, [video.id]: { attempts: (s.diagnostics[video.id]?.attempts ?? 0) + 1, lastError: "No decodable frame", at: Date.now() } },
          durations: duration && duration > 0 ? { ...s.durations, [video.id]: duration } : s.durations,
        }));
        if (thumb) void saveThumbCache({ id: video.id, thumb, at: Date.now() }).catch(() => undefined);
      } catch {
        if (!signal.aborted) set(s => boundedThumbState({ ...s,
          failed: { ...s.failed, [video.id]: true },
          diagnostics: { ...s.diagnostics, [video.id]: { attempts: (s.diagnostics[video.id]?.attempts ?? 0) + 1, lastError: "Source could not be reopened", at: Date.now() } },
        }));
      }
    }, options?.priority);
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
      // Keep startup cheap. Other disk entries are reopened only when their
      // cards enter the existing visibility/decode queue.
      const rows = await loadThumbCache(32);
      // Keep insertion order oldest-first so idle/LRU trimming retains the
      // newest disk artwork, followed by frames captured in this session.
      const restored: Record<string, string> = {};
      for (const row of rows.reverse()) {
        if (get().byId[row.id] || restored[row.id]) continue;
        const thumb = await binaryArtwork(row.thumb);
        restored[row.id] = artworkUrl(thumb);
        if (thumb !== row.thumb) void saveThumbCache({ ...row, thumb }).catch(() => undefined);
      }
      set(s => {
        for (const [id, url] of Object.entries(restored)) if (s.byId[id]) releaseArtwork(url);
        return boundedThumbState({ ...s, byId: { ...restored, ...s.byId } });
      });
    } catch { /* Thumbnail cache is an optional speed-up. */ }
  },
  /** Recall a companion-disk thumb when browser IndexedDB was pruned. */
  recallCompanion: async (id) => {
    if (!allowAutomaticRefresh() || isArtworkSuppressed()) return;
    if (!id || get().byId[id] || recalling.has(id) || recalling.size >= 8) return;
    recalling.add(id);
    try {
      const dataUrl = await companionGetThumb(id);
      if (!dataUrl) return;
      const thumb = await binaryArtwork(dataUrl);
      if (get().byId[id]) return;
      set(s => boundedThumbState({ ...s, byId: { ...s.byId, [id]: artworkUrl(thumb) } }));
      void saveThumbCache({ id, thumb, at: Date.now() }).catch(() => undefined);
    } finally { recalling.delete(id); }
  },
  trimMemory: () => {
    thumbnailQueue.clear();
    set(s => boundedThumbState(s, 32, 1024 * 1024));
  },
}));
