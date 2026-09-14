import { startTransition, useEffect, useRef, useState } from "react";
import { rankingFeedbackSnapshot } from "@/lib/media-feedback";
import type { LibraryVideo } from "@/lib/videos/types";
import type { AdultBrowseParams, AdultBrowseResult, AdultBrowseSignals } from "@/lib/videos/adult-browse-model";

export type AdultBrowseInputs = {
  videos: LibraryVideo[]; personalVideos: LibraryVideo[]; deepVideos: LibraryVideo[]; tags: Record<string, string[]>;
  favorites: AdultBrowseSignals["favorites"]; likes: AdultBrowseSignals["likes"];
  cameCounts: AdultBrowseSignals["cameCounts"]; viewCounts: AdultBrowseSignals["viewCounts"];
  continueIds: string[]; favoriteIds: string[];
  ratingRevision: number; tagHeartRevision: number;
};
type Job = { id: number; inputs: AdultBrowseInputs; params: AdultBrowseParams; signals: AdultBrowseSignals };
type Packet = { inputs: AdultBrowseInputs; params: AdultBrowseParams; result: AdultBrowseResult };

// Send only ranking fields. Posters, descriptions, source handles, and media
// payloads stay in the UI store; the worker returns IDs, never duplicate cards.
function rankingVideo(video: LibraryVideo): LibraryVideo {
  return {
    id: video.id, folderId: video.folderId, name: "", path: "", size: 0,
    addedAt: video.addedAt, extension: video.extension, mime: video.mime,
    poster: video.poster ? "available" : undefined,
    remote: video.remote ? {
      kind: video.remote.kind, live: video.remote.live,
      channelName: video.remote.channelName, sourceKinds: video.remote.sourceKinds,
      previewUrl: video.remote.previewUrl ? "available" : undefined,
    } : undefined,
  };
}

export function useAdultBrowse(enabled: boolean, inputs: AdultBrowseInputs, params: AdultBrowseParams) {
  const [packet, setPacket] = useState<Packet>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const sequence = useRef(0);
  const enqueue = useRef<((job: Job) => void) | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    let worker: Worker;
    let active = true;
    let busy: Job | undefined;
    let queued: Job | undefined;
    let sent: AdultBrowseInputs | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const fail = () => {
      if (!active) return;
      active = false;
      clearTimeout(timeout);
      worker?.terminate();
      enqueue.current = undefined;
      setFailed(true);
    };
    try { worker = new Worker(new URL("../../lib/videos/adult-browse.worker.ts", import.meta.url), { type: "module" }); }
    catch { fail(); return; }
    setFailed(false);
    const pump = () => {
      if (!active || busy || !queued) return;
      const job = queued;
      busy = job;
      queued = undefined;
      try {
        if (!sent || sent.videos !== job.inputs.videos || sent.tags !== job.inputs.tags || sent.personalVideos !== job.inputs.personalVideos || sent.deepVideos !== job.inputs.deepVideos) {
          const scopedTags: Record<string, string[]> = {};
          for (const list of [job.inputs.videos, job.inputs.personalVideos, job.inputs.deepVideos]) {
            for (const video of list) if (job.inputs.tags[video.id]) scopedTags[video.id] = job.inputs.tags[video.id];
          }
          worker.postMessage({ type: "catalog", videos: job.inputs.videos.map(rankingVideo), personalVideos: job.inputs.personalVideos.map(rankingVideo), deepVideos: job.inputs.deepVideos.map(rankingVideo), tags: scopedTags });
        }
        if (sent !== job.inputs) worker.postMessage({ type: "signals", signals: job.signals });
        sent = job.inputs;
        worker.postMessage({ type: "browse", requestId: job.id, params: job.params });
        timeout = setTimeout(fail, 30_000);
      } catch { fail(); }
    };
    enqueue.current = job => { queued = job; pump(); };
    worker.onmessage = ({ data }: MessageEvent<{ requestId: number; result: AdultBrowseResult; error?: boolean }>) => {
      if (!active || !busy || data.requestId !== busy.id) return;
      clearTimeout(timeout);
      const completed = busy;
      busy = undefined;
      if (data.error) { fail(); return; }
      if (data.requestId === sequence.current) {
        startTransition(() => setPacket({ inputs: completed.inputs, params: completed.params, result: data.result }));
      }
      pump();
    };
    worker.onerror = event => { event.preventDefault(); fail(); };
    worker.onmessageerror = fail;
    return () => { active = false; clearTimeout(timeout); enqueue.current = undefined; worker.terminate(); };
  }, [enabled, attempt]);

  useEffect(() => {
    const id = ++sequence.current;
    if (!enabled) return;
    let cancelled = false;
    // Packing a large catalog for structured clone is intentionally deferred
    // until the Adult controls have painted. This keeps filter taps and the
    // first Adult frame responsive while the worker prepares its next mix.
    const start = () => {
      void rankingFeedbackSnapshot().then(feedback => {
        if (cancelled) return;
        enqueue.current?.({ id, inputs, params, signals: { ...feedback, favorites: inputs.favorites, likes: inputs.likes, cameCounts: inputs.cameCounts, viewCounts: inputs.viewCounts, continueIds: inputs.continueIds, favoriteIds: inputs.favoriteIds } });
      }).catch(() => { if (!cancelled) setFailed(true); });
    };
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(start, { timeout: 500 });
      return () => { cancelled = true; window.cancelIdleCallback(idle); };
    }
    const timer = window.setTimeout(start, 80);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [enabled, inputs, params, attempt]);

  // Never flash results from the previously selected source/type/tag. Ratings
  // may keep the last completed mix visible while its new order is calculated.
  const result = enabled && packet?.params === params && packet.inputs.videos === inputs.videos && packet.inputs.tags === inputs.tags ? packet.result : undefined;
  const facets = enabled && packet?.params.source === params.source && packet.inputs.videos === inputs.videos && packet.inputs.tags === inputs.tags ? packet.result : undefined;
  return { result, facets, failed, pending: enabled && (!result || packet?.inputs !== inputs), retry: () => setAttempt(value => value + 1) };
}
