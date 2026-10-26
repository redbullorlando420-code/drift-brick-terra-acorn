import { getTopicAliases } from '@/lib/videos/topic-aliases';
import { getRecommendationExposure,getExposureRevision } from '@/lib/recommendation-exposure-store';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { youtubePublicationTime } from '@/lib/videos/youtube-metadata';
import { rankingFeedbackSnapshot } from '@/lib/media-feedback';
import { scheduleBackgroundWork } from '@/lib/interaction-budget';
import { forEachCatalogSlice } from '@/lib/catalog-work';
import { yieldNavigationTask } from '@/lib/navigation-work';
import { holdMetadataEnrichment } from '@/lib/idle-work';
import { useLibrary } from '@/lib/videos/store';
import { rememberVideo } from '@/lib/videos/video-lookup';
import type { LibraryVideo } from '@/lib/videos/types';
import type { YoutubeRankingMessage, YoutubeRankingRow, YoutubeRankingResult } from '@/lib/remote/youtube-ranking-protocol';
import { youtubeRankingDemand, type YoutubePageDemand } from '@/lib/remote/youtube-ranking-demand';

export type YoutubeRankingInputs = { videos: LibraryVideo[]; candidates: LibraryVideo[]; tags: Record<string, string[]>;
  favorites: Record<string, true>; likes: Record<string, true>; cameCounts: Record<string, number>; viewCounts: Record<string, number>;
  history: Array<{ id: string; at: number }>; revision: number };
const EMPTY: LibraryVideo[] = [];
const EMPTY_TAGS: string[] = [];
/** Discovery scoring owns a disposable worker. Packing yields; results contain
 * only the recommendation shelf or requested page, and opening a player
 * immediately releases the worker catalog. Deep discovery reuses its scores. */
export function useYoutubeRanking(enabled: boolean, sourceInputs: YoutubeRankingInputs, seed: number, idle = false, deep = false) {
  const exposureScope = useRef<{ source: YoutubeRankingInputs; revision: number; value: YoutubeRankingInputs } | undefined>(undefined);
  const inputs = useMemo(() => { const revision = getExposureRevision(), previous = exposureScope.current; if (previous?.source === sourceInputs && previous.revision === revision) return previous.value; const value = { ...sourceInputs }; exposureScope.current = { source: sourceInputs, revision, value }; return value; }, [sourceInputs, seed]);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { const update = () => setHidden(document.visibilityState === "hidden"); update(); document.addEventListener("visibilitychange", update); return () => document.removeEventListener("visibilitychange", update); }, []);
  const viewerOpen = useLibrary(s => Boolean(s.activeId || s.previewId));
  const [packet, setPacket] = useState<{ inputs: YoutubeRankingInputs; seed: number; videos: LibraryVideo[] }>();
  const [pagePacket, setPagePacket] = useState<{ inputs: YoutubeRankingInputs; seed: number; videos: LibraryVideo[]; total: number }>();
  const [pagePending, setPagePending] = useState(false);
  const [workRevision, requestWork] = useState(0);
  const [error, setError] = useState('');
  const packetRef = useRef(packet), pageRef = useRef(pagePacket), deepRef = useRef(deep), inputsRef = useRef(inputs);
  const pageDemand = useRef<YoutubePageDemand<YoutubeRankingInputs> | undefined>(undefined);
  packetRef.current = packet; pageRef.current = pagePacket; deepRef.current = deep; inputsRef.current = inputs;
  const workerRef = useRef<Worker | undefined>(undefined), latestSeed = useRef(seed);
  latestSeed.current = seed;
  useEffect(() => {
    if (!enabled || viewerOpen || idle || hidden) return;
    const demand = youtubeRankingDemand(inputs, latestSeed.current, deepRef.current, packetRef.current, pageRef.current, pageDemand.current);
    if (!demand.build) { pageDemand.current = undefined; setPagePending(false); return; }
    let worker: Worker;
    try { worker = new Worker(new URL('../../lib/remote/youtube-ranking.worker.ts', import.meta.url), { type: 'module' }); }
    catch { setError('Personal ranking is unavailable. You can still browse newest-first.'); return; }
    setError('');
    workerRef.current = worker;
    const releaseEnrichment = holdMetadataEnrichment();
    const controller = new AbortController();
    let active = true;
    const send = (message: YoutubeRankingMessage) => { if (active) worker.postMessage(message); };
    worker.onmessage = ({ data }: MessageEvent<YoutubeRankingResult>) => {
      if (!active || data.seed !== latestSeed.current) return;
      releaseEnrichment();
      // The worker preserves source-array positions. Resolve each small page directly,
      // rather than scanning a million-entry array again for each result.
      const videos = data.offsets.map((offset, index) => inputs.videos[offset]).filter((video, index): video is LibraryVideo => Boolean(video && video.id === data.ids[index]));
      for (const video of videos) rememberVideo(inputs.videos, video);
      if (data.kind === 'page') {
        pageDemand.current = undefined;
        startTransition(() => setPagePacket(current => {
          const same = current?.inputs === inputs && current.seed === data.seed;
          if (data.offset && (!same || current.videos.length !== data.offset)) return current;
          // A recreated worker can resend its first page after a preview. Keep
          // already loaded pages when that same ranked prefix is unchanged.
          const keepTail = !data.offset && same && videos.every((video, i) => current.videos[i]?.id === video.id);
          return { inputs, seed: data.seed, total: data.total, videos: data.offset ? [...current!.videos, ...videos] : keepTail ? current!.videos : videos };
        }));
        setPagePending(false);
      } else startTransition(() => setPacket({ inputs, seed: data.seed, videos }));
    };
    const failed = () => { active = false; controller.abort(); releaseEnrichment(); worker.terminate(); if (workerRef.current === worker) workerRef.current = undefined; setPagePending(false); setError('Personal ranking could not finish. Newest-first browsing is available.'); };
    worker.onerror = failed;
    const cancel = scheduleBackgroundWork(() => void (async () => {
      const feedback = await rankingFeedbackSnapshot(); if (!active) return;
      send({ type: 'reset', topicAliases: getTopicAliases(), recommendationExposure: getRecommendationExposure(), now: Date.now(), recommendationRejections: feedback.recommendationRejections, creatorLikes: feedback.creatorLikes, creatorFavorites: feedback.creatorFavorites, creatorRatings: feedback.creatorRatings, heartedTags: feedback.heartedTags, historicTags: feedback.historicTags });
      let chunk: YoutubeRankingRow[] = [];
      const turn = async () => { await yieldNavigationTask(controller.signal); if (!active) throw new Error('Obsolete ranking'); };
      await forEachCatalogSlice(inputs.videos, (item, index) => {
        const video: YoutubeRankingRow['video'] = { catalogOffset: index, id: item.id, folderId: item.folderId, addedAt: youtubePublicationTime(item), name: '', path: '', size: 0, extension: 'yt', mime: 'video/youtube',
          remote: item.remote ? { videoId: item.remote.videoId, kind: item.remote.kind, live: item.remote.live, youtubeType: item.remote.youtubeType, channelId: item.remote.channelId, channelName: item.remote.channelName,
            ...(item.remote.youtubeTagSummary ? { youtubeTagSummary: { version: item.remote.youtubeTagSummary.version, sources: item.remote.youtubeTagSummary.sources, topics: [] } } : {}) } : undefined };
        chunk.push({ video, tags: inputs.tags[item.id] ?? EMPTY_TAGS, rating: feedback.ratings[item.id] ?? 0, favorite: Boolean(inputs.favorites[item.id]), liked: Boolean(inputs.likes[item.id]), marks: inputs.cameCounts[item.id] ?? 0, watch: feedback.watchScores[item.id] ?? 0, plays: inputs.viewCounts[item.id] ?? 0 });
        if (chunk.length === 512) { send({ type: 'append', rows: chunk }); chunk = []; }
      }, turn, 4096);
      if (chunk.length) send({ type: 'append', rows: chunk });
      for (let offset = 0; offset < inputs.history.length; offset += 2048) { await turn(); send({ type: 'history', entries: inputs.history.slice(offset, offset + 2048) }); }
      for (let offset = 0; offset < inputs.candidates.length; offset += 2048) { await turn(); send({ type: 'candidates', ids: inputs.candidates.slice(offset, offset + 2048).map(video => video.id) }); }
      send({ type: 'mix', seed: latestSeed.current }); send({ type: 'ready' });
      if (deepRef.current) {
        const next = youtubeRankingDemand(inputs, latestSeed.current, true, packetRef.current, pageRef.current, pageDemand.current);
        setPagePending(true); send({ type: 'page', offset: next.pageOffset ?? 0, limit: 96 });
      }
    })().catch(() => { if (active) failed(); }));
    return () => { active = false; controller.abort(); releaseEnrichment(); cancel(); worker.terminate(); if (workerRef.current === worker) workerRef.current = undefined; };
  }, [enabled, inputs, viewerOpen, idle, hidden, workRevision]);
  useEffect(() => {
    if (!deep) { pageDemand.current = undefined; setPagePending(false); }
    if (!enabled || viewerOpen || idle || hidden) return;
    const worker = workerRef.current;
    if (worker) {
      worker.postMessage({ type: 'mix', seed } satisfies YoutubeRankingMessage);
      if (deep) { setPagePending(true); worker.postMessage({ type: 'page', offset: 0, limit: 96 } satisfies YoutubeRankingMessage); }
    } else if (youtubeRankingDemand(inputsRef.current, seed, deep, packetRef.current, pageRef.current).build) requestWork(value => value + 1);
  }, [deep, enabled, seed, viewerOpen, idle, hidden]);
  const loadMore = useCallback(() => {
    const current = pageRef.current;
    if (pagePending || current?.inputs !== inputsRef.current || current.seed !== latestSeed.current || current.videos.length >= current.total) return;
    pageDemand.current = { inputs: current.inputs, seed: current.seed, offset: current.videos.length };
    setPagePending(true);
    if (workerRef.current) workerRef.current.postMessage({ type: 'page', offset: current.videos.length, limit: 96 } satisfies YoutubeRankingMessage);
    else requestWork(value => value + 1);
  }, [pagePending]);
  useEffect(() => { if (!enabled) { pageDemand.current = undefined; setPacket(undefined); setPagePacket(undefined); setPagePending(false); } }, [enabled]);
  const pageMatches = enabled && pagePacket?.inputs === inputs && pagePacket.seed === seed;
  // Keep a bounded existing shelf painted while watch/feedback scores update.
  // A format/topic/catalog change still hides incompatible results instantly.
  const pageCatalogMatches = enabled && pagePacket?.inputs.videos === inputs.videos && pagePacket.inputs.candidates === inputs.candidates && pagePacket.seed === seed;
  const recommendationMatches = enabled && packet?.inputs.videos === inputs.videos && packet.inputs.candidates === inputs.candidates && packet.seed === seed;
  return {
    recommendations: recommendationMatches ? packet.videos : EMPTY,
    discovery: pageCatalogMatches ? pagePacket.videos : EMPTY, total: pageCatalogMatches ? pagePacket.total : 0,
    pending: pagePending || Boolean(enabled && !error && (packet?.inputs !== inputs || packet.seed !== seed || deep && !pageMatches)), error, loadMore,
  };
}
