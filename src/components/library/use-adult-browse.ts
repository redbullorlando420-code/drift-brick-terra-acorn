import { yieldCatalogTask } from "@/lib/catalog-work";
import { startTransition, useEffect, useRef, useState } from "react";
import { rankingFeedbackSnapshot } from "@/lib/media-feedback";
import { scheduleBackgroundWork } from "@/lib/interaction-budget";
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

export function useAdultBrowse(enabled: boolean, inputs: AdultBrowseInputs, params: AdultBrowseParams, paused = false) {
  const [packet, setPacket] = useState<Packet>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const sequence = useRef(0);
  const enqueue = useRef<((job: Job) => void) | undefined>(undefined);

  useEffect(() => {
    if (enabled) return;
    setPacket(undefined);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || paused) return;
    let worker: Worker;
    let active = true;
    let busy: Job | undefined;
    let queued: Job | undefined;
    let sent: AdultBrowseInputs | undefined;
    let sentSignalInputs: AdultBrowseInputs | undefined;
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
    const pump = async () => {
      if (!active || busy || !queued) return;
      const job = queued;
      busy = job;
      queued = undefined;
      try {
        if (!sent || sent.videos !== job.inputs.videos || sent.tags !== job.inputs.tags || sent.personalVideos !== job.inputs.personalVideos || sent.deepVideos !== job.inputs.deepVideos) {
          worker.postMessage({ type: 'catalog-start' });
          for (const list of ['videos', 'personalVideos', 'deepVideos'] as const) {
            const rows = job.inputs[list];
            for (let offset = 0; offset < rows.length; offset += 512) {
              await yieldCatalogTask();
              if (!active) return;
              const chunk = rows.slice(offset, offset + 512), tags: Record<string, string[]> = {};
              for (const video of chunk) if (job.inputs.tags[video.id]) tags[video.id] = job.inputs.tags[video.id];
              worker.postMessage({ type: 'catalog-chunk', list, videos: chunk.map(rankingVideo), tags });
            }
          }
        }
        const previousSignals = sentSignalInputs;
        const signalsChanged = !previousSignals
          || previousSignals.favorites !== job.inputs.favorites
          || previousSignals.likes !== job.inputs.likes
          || previousSignals.cameCounts !== job.inputs.cameCounts
          || previousSignals.viewCounts !== job.inputs.viewCounts
          || previousSignals.continueIds !== job.inputs.continueIds
          || previousSignals.favoriteIds !== job.inputs.favoriteIds
          || previousSignals.ratingRevision !== job.inputs.ratingRevision
          || previousSignals.tagHeartRevision !== job.inputs.tagHeartRevision;
        if (signalsChanged || !sent || sent.videos !== job.inputs.videos) {
          worker.postMessage({ type: "signals", signals: job.signals });
          sentSignalInputs = job.inputs;
        }
        sent = job.inputs;
        worker.postMessage({ type: "browse", requestId: job.id, params: job.params });
        timeout = setTimeout(fail, 30_000);
      } catch { fail(); }
    };
    enqueue.current = job => { queued = job; void pump(); };
    worker.onmessage = ({ data }: MessageEvent<{ requestId: number; result: AdultBrowseResult; error?: boolean }>) => {
      if (!active || !busy || data.requestId !== busy.id) return;
      clearTimeout(timeout);
      const completed = busy;
      busy = undefined;
      if (data.error) { fail(); return; }
      if (data.requestId === sequence.current) {
        startTransition(() => setPacket({ inputs: completed.inputs, params: completed.params, result: data.result }));
      }
      void pump();
    };
    worker.onerror = event => { event.preventDefault(); fail(); };
    worker.onmessageerror = fail;
    return () => { active = false; clearTimeout(timeout); enqueue.current = undefined; worker.terminate(); };
  }, [enabled, paused, attempt]);

  useEffect(() => {
    const id = ++sequence.current;
    if (!enabled || paused) return;
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
    const cancelSchedule = scheduleBackgroundWork(start, { timeoutMs: 500, fallbackDelayMs: 80 });
    return () => { cancelled = true; cancelSchedule(); };
  }, [enabled, paused, inputs, params, attempt]);

  // Never flash results from the previously selected source/type/tag. Ratings
  // may keep the last completed mix visible while its new order is calculated.
  const result = enabled && packet?.params.source === params.source && packet.params.tag === params.tag && packet.params.view === params.view ? packet.result : undefined;
  const facets = enabled && packet?.params.source === params.source ? packet.result : undefined;
  return { result, facets, failed, pending: enabled && (!result || packet?.inputs !== inputs), retry: () => setAttempt(value => value + 1) };
}
