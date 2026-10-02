import { startTransition, useEffect, useState } from "react";
import { rankingFeedbackSnapshot } from "@/lib/media-feedback";
import { scheduleBackgroundWork } from "@/lib/interaction-budget";
import { isAdultPullKind } from "@/lib/videos/adult-sites";
import type { LibraryVideo } from "@/lib/videos/types";
import type { PreviewRanking, PreviewRow } from "@/lib/videos/preview-ranking";
import type { PreviewWorkerRequest, PreviewWorkerResult } from "@/lib/videos/preview-ranking-protocol";
import { previewCandidates } from '@/lib/videos/preview-candidates';
import { peekYoutubeOwner } from '@/lib/remote/youtube-sources';
import { useLibrary } from '@/lib/videos/store';
import { isRemovedRedditVideo } from '@/lib/videos/reddit-removed';
import { rememberVideo } from '@/lib/videos/video-lookup';

const EMPTY: PreviewRanking = { related: [], recommended: [], tagScores: {} };
const EMPTY_TAGS: string[] = [];
const SAMPLE_TITLE = /\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i;
type Inputs = {
  target: LibraryVideo;
  videos: LibraryVideo[]; tags: Record<string, string[]>; adultFolders: Set<string>;
  favorites: Record<string, true>; likes: Record<string, true>; cameCounts: Record<string, number>; viewCounts: Record<string, number>;
  unavailable: Record<string, unknown>; hidden: Record<string, unknown>; feedbackRevision: number;
};
type Session = {
  worker: Worker; generation: number; requestId: number; inputs?: Inputs;
  cancelBuild?: () => void; listener?: (packet: PreviewWorkerResult) => void; disposeTimer?: number;
  candidates?: Map<string, LibraryVideo>;
};
let shared: Session | undefined;
let feedbackRevision = 0;
let latestRequest: { session: Session; message: Extract<PreviewWorkerRequest, { type: "rank" }> } | undefined;
function dispose(session: Session) {
  session.cancelBuild?.();
  window.clearTimeout(session.disposeTimer);
  session.worker.terminate();
  session.inputs = undefined;
  session.cancelBuild = undefined;
  session.listener = undefined;
  session.candidates = undefined;
  if (latestRequest?.session === session) latestRequest = undefined;
  if (shared === session) shared = undefined;
}
const onRatingChange = () => { feedbackRevision++; };
const onPageHide = () => { if (shared) dispose(shared); };
const onVisibilityChange = () => {
  if (document.visibilityState === "hidden" && shared && !shared.listener) dispose(shared);
};
if (typeof window !== "undefined") {
  window.addEventListener("reelcase:rating-change", onRatingChange);
  window.addEventListener("pagehide", onPageHide);
  document.addEventListener("visibilitychange", onVisibilityChange);
  // Development updates must release the old worker and its catalog too.
  // Anonymous page listeners otherwise retain every replaced module session.
  import.meta.hot?.dispose(() => {
    window.removeEventListener("reelcase:rating-change", onRatingChange);
    window.removeEventListener("pagehide", onPageHide);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (shared) dispose(shared);
  });
}
function sessionForPreview() {
  if (shared) { window.clearTimeout(shared.disposeTimer); return shared; }
  const session: Session = { worker: new Worker(new URL("../../lib/videos/preview-ranking.worker.ts", import.meta.url), { type: "module" }), generation: 0, requestId: 0 };
  session.worker.onmessage = ({ data }: MessageEvent<PreviewWorkerResult>) => {
    if (data.generation === session.generation && data.requestId === session.requestId) {
      for (const id of [...data.result.related, ...data.result.recommended]) {
        const card = session.candidates?.get(id);
        if (card && session.inputs) rememberVideo(session.inputs.videos, card);
      }
      session.listener?.(data);
    }
  };
  session.worker.onerror = () => dispose(session);
  shared = session;
  return session;
}
function sameInputs(left: Inputs | undefined, right: Inputs) {
  return left && left.target.id === right.target.id && left.videos === right.videos && left.tags === right.tags && left.unavailable === right.unavailable
    && left.favorites === right.favorites && left.likes === right.likes && left.cameCounts === right.cameCounts && left.viewCounts === right.viewCounts
    && left.hidden === right.hidden && left.feedbackRevision === right.feedbackRevision
    && left.adultFolders.size === right.adultFolders.size && [...right.adultFolders].every(id => left.adultFolders.has(id));
}
function send(session: Session, message: PreviewWorkerRequest) { session.worker.postMessage(message); }

/** Keep one short-lived worker catalog across preview switches. Building never
 * holds a second full row array or sends a catalog-sized structured clone. */
function prepare(session: Session, inputs: Inputs) {
  if (sameInputs(session.inputs, inputs)) return;
  session.cancelBuild?.();
  session.inputs = inputs;
  const owner = peekYoutubeOwner(inputs.videos, inputs.target);
  const candidates = previewCandidates(inputs.videos, inputs.target, owner);
  session.candidates = new Map(candidates.map(card => [card.id, card]));
  const generation = ++session.generation;
  let cancelled = false;
  let cancelNext = () => {};
  session.cancelBuild = () => { cancelled = true; cancelNext(); };
  cancelNext = scheduleBackgroundWork(() => void (async () => {
    const feedback = await rankingFeedbackSnapshot();
    if (cancelled) return;
    send(session, { type: "reset", generation, hearted: feedback.heartedTags });
    const creators = new Map<string, { rating: number; liked: boolean; favorite: boolean }>();
    let offset = 0;
    const next = () => {
      if (cancelled) return;
      const rows: PreviewRow[] = [];
      const started = performance.now();
      while (offset < candidates.length && rows.length < 512) {
        const item = candidates[offset++];
        const creator = item.remote?.channelName?.trim().toLowerCase() ?? "";
        let taste = creators.get(creator);
        if (!taste) { taste = { rating: feedback.creatorRatings[creator] ?? 0, liked: Boolean(feedback.creatorLikes[creator]), favorite: Boolean(feedback.creatorFavorites[creator]) }; creators.set(creator, taste); }
        rows.push({ id: item.id, folderId: item.folderId, genre: item.genre, kind: item.remote?.kind, creator,
          tags: (inputs.tags[item.id] ?? EMPTY_TAGS).slice(0, 32), rating: feedback.ratings[item.id] ?? 0, creatorRating: taste.rating, creatorLiked: taste.liked, creatorFavorite: taste.favorite, favorite: Boolean(inputs.favorites[item.id]), liked: Boolean(inputs.likes[item.id]),
          marks: inputs.cameCounts[item.id] ?? 0, plays: inputs.viewCounts[item.id] ?? 0, watch: feedback.watchScores[item.id] ?? 0,
          adult: isAdultPullKind(item.remote?.kind) || inputs.adultFolders.has(item.folderId), live: Boolean(item.remote?.live),
          eligible: !isRemovedRedditVideo(item) && !inputs.unavailable[item.id] && !inputs.hidden[item.id] && !item.isSample && !SAMPLE_TITLE.test(`${item.name} ${creator} ${item.tagline ?? ""}`) });
        if (rows.length % 32 === 0 && performance.now() - started >= 4) break;
      }
      send(session, { type: "append", generation, rows });
      if (offset < candidates.length) cancelNext = scheduleBackgroundWork(next);
      else {
        session.cancelBuild = undefined;
        send(session, { type: "ready", generation });
      }
    };
    // Targets requested while feedback was loading were not part of the old
    // worker generation. Queue only the newest one on this complete catalog.
    if (latestRequest?.session === session) send(session, latestRequest.message);
    next();
  })().catch(() => { if (!cancelled) dispose(session); }));
}

export function usePreviewRanking(video: LibraryVideo | undefined, videos: LibraryVideo[], tags: Record<string, string[]>, adultFolders: Set<string>, unavailable: Record<string, unknown>, hidden: Record<string, unknown>, seed: number, revision: string) {
  const favorites = useLibrary(s => s.favorites), likes = useLibrary(s => s.likes), cameCounts = useLibrary(s => s.cameCounts), viewCounts = useLibrary(s => s.viewCounts);
  const [packet, setPacket] = useState<{ id: string; result: PreviewRanking }>();
  useEffect(() => {
    if (!video) return;
    const session = sessionForPreview();
    const receive = (data: PreviewWorkerResult) => startTransition(() => setPacket({ id: data.id, result: data.result }));
    session.listener = receive;
    prepare(session, { target: video, videos, tags, adultFolders, unavailable, hidden, feedbackRevision, favorites, likes, cameCounts, viewCounts });
    const message = { type: "rank" as const, generation: session.generation, requestId: ++session.requestId, id: video.id, seed };
    latestRequest = { session, message };
    send(session, message);
    return () => {
      if (session.listener !== receive) return;
      session.listener = undefined;
      // Browsing back and reopening reuses the catalog; a quiet/hidden page
      // releases it completely rather than retaining workers indefinitely.
      session.disposeTimer = window.setTimeout(() => dispose(session), 1000);
    };
  }, [video?.id, videos, tags, adultFolders, unavailable, hidden, seed, revision, favorites, likes, cameCounts, viewCounts]);
  return packet && packet.id === video?.id ? packet.result : EMPTY;
}
