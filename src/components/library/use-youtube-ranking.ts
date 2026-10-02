import { startTransition, useEffect, useRef, useState } from 'react';
import { rankingFeedbackSnapshot } from '@/lib/media-feedback';
import { scheduleBackgroundWork } from '@/lib/interaction-budget';
import { forEachCatalogSlice, yieldCatalogTask } from '@/lib/catalog-work';
import { useLibrary } from '@/lib/videos/store';
import { rememberVideo } from '@/lib/videos/video-lookup';
import type { LibraryVideo } from '@/lib/videos/types';
import type { YoutubeRankingMessage, YoutubeRankingRow } from '@/lib/remote/youtube-ranking-protocol';

export type YoutubeRankingInputs = { videos: LibraryVideo[]; candidates: LibraryVideo[]; tags: Record<string, string[]>;
  favorites: Record<string, true>; likes: Record<string, true>; cameCounts: Record<string, number>; viewCounts: Record<string, number>;
  history: Array<{ id: string; at: number }>; revision: number };
const EMPTY: LibraryVideo[] = [];
/** Discovery scoring owns a disposable worker. Packing yields; results contain
 * only 48 IDs, and opening a player immediately releases the worker catalog. */
export function useYoutubeRanking(enabled: boolean, inputs: YoutubeRankingInputs, seed: number, idle = false) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => { const update = () => setHidden(document.visibilityState === "hidden"); update(); document.addEventListener("visibilitychange", update); return () => document.removeEventListener("visibilitychange", update); }, []);
  const viewerOpen = useLibrary(s => Boolean(s.activeId || s.previewId));
  const [packet, setPacket] = useState<{ inputs: YoutubeRankingInputs; videos: LibraryVideo[] }>();
  const workerRef = useRef<Worker | undefined>(undefined), latestSeed = useRef(seed);
  latestSeed.current = seed;
  useEffect(() => {
    if (!enabled || viewerOpen || idle || hidden) return;
    let worker: Worker;
    try { worker = new Worker(new URL('../../lib/remote/youtube-ranking.worker.ts', import.meta.url), { type: 'module' }); }
    catch { return; }
    workerRef.current = worker;
    let active = true;
    const send = (message: YoutubeRankingMessage) => { if (active) worker.postMessage(message); };
    worker.onmessage = ({ data }: MessageEvent<{ ids: string[]; offsets: number[] }>) => {
      if (!active) return;
      // The worker preserves source-array positions. Resolve 48 cards directly,
      // rather than scanning a million-entry array again for each result.
      const videos = data.offsets.map((offset, index) => inputs.videos[offset]).filter((video, index): video is LibraryVideo => Boolean(video && video.id === data.ids[index]));
      for (const video of videos) rememberVideo(inputs.videos, video);
      startTransition(() => setPacket({ inputs, videos }));
    };
    worker.onerror = () => { active = false; worker.terminate(); };
    const cancel = scheduleBackgroundWork(() => void (async () => {
      const feedback = await rankingFeedbackSnapshot(); if (!active) return;
      send({ type: 'reset', creatorLikes: feedback.creatorLikes, creatorFavorites: feedback.creatorFavorites, creatorRatings: feedback.creatorRatings, heartedTags: feedback.heartedTags, historicTags: feedback.historicTags });
      let chunk: YoutubeRankingRow[] = [];
      const turn = async () => { await yieldCatalogTask(); if (!active) throw new Error('Obsolete ranking'); };
      await forEachCatalogSlice(inputs.videos, (item, index) => {
        const video: YoutubeRankingRow['video'] = { catalogOffset: index, id: item.id, folderId: item.folderId, addedAt: item.addedAt, name: '', path: '', size: 0, extension: 'yt', mime: 'video/youtube',
          remote: item.remote ? { kind: item.remote.kind, live: item.remote.live, channelId: item.remote.channelId, channelName: item.remote.channelName } : undefined };
        chunk.push({ video, tags: inputs.tags[item.id] ?? [], rating: feedback.ratings[item.id] ?? 0, favorite: Boolean(inputs.favorites[item.id]), liked: Boolean(inputs.likes[item.id]), marks: inputs.cameCounts[item.id] ?? 0, watch: feedback.watchScores[item.id] ?? 0, plays: inputs.viewCounts[item.id] ?? 0 });
        if (chunk.length === 512) { send({ type: 'append', rows: chunk }); chunk = []; }
      }, turn);
      if (chunk.length) send({ type: 'append', rows: chunk });
      for (let offset = 0; offset < inputs.history.length; offset += 512) { await turn(); send({ type: 'history', entries: inputs.history.slice(offset, offset + 512) }); }
      for (let offset = 0; offset < inputs.candidates.length; offset += 512) { await turn(); send({ type: 'candidates', ids: inputs.candidates.slice(offset, offset + 512).map(video => video.id) }); }
      send({ type: 'mix', seed: latestSeed.current }); send({ type: 'ready' });
    })().catch(() => { if (active) { active = false; worker.terminate(); } }));
    return () => { active = false; cancel(); worker.terminate(); if (workerRef.current === worker) workerRef.current = undefined; };
  }, [enabled, inputs, viewerOpen, idle, hidden]);
  useEffect(() => { workerRef.current?.postMessage({ type: 'mix', seed } satisfies YoutubeRankingMessage); }, [seed]);
  useEffect(() => { if (!enabled) setPacket(undefined); }, [enabled]);
  return enabled && packet?.inputs.videos === inputs.videos && packet.inputs.candidates === inputs.candidates ? packet.videos : EMPTY;
}
