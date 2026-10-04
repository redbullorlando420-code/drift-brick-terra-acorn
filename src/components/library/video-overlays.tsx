import { lazy, memo, Suspense, useMemo, useEffect, useRef } from "react";
import { useLibrary, selectVisible } from "@/lib/videos/store";
import { loadVideoPlayer, loadVideoPreview } from "./video-overlay-loader";
import { setPullViewerOpen } from '@/lib/pull-control';
import { lookupVideo } from '@/lib/videos/video-lookup';
import { previewCandidates } from '@/lib/videos/preview-candidates';
import { peekYoutubeOwner } from '@/lib/remote/youtube-sources';
import { playbackWindow } from '@/lib/videos/playback-queue';
import type { LibraryVideo } from '@/lib/videos/types';
import { viewerDetails } from '@/lib/videos/viewer-details';
import { ViewerDialog, useViewerInitialFocus } from './viewer-dialog';
import { Button } from '@/components/ui/button';
const Player = lazy(async () => ({ default: (await loadVideoPlayer()).Player }));
const PreVideo = lazy(async () => ({ default: (await loadVideoPreview()).PreVideo }));
const EMPTY_VIDEOS: LibraryVideo[] = [];
const EMPTY_FLAGS: Record<string, true> = {};
function ViewerLoading() {
  const closeFocus = useViewerInitialFocus();
  return <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg/90 text-sm text-fg">
    <p role="status">Opening video…</p>
    <Button ref={closeFocus} variant="secondary" onClick={() => {
      const state = useLibrary.getState();
      state.closePlayer(); state.closePreview();
    }}>Cancel opening video</Button>
  </div>;
}
export const VideoOverlays = memo(function VideoOverlays() {
  const activeId = useLibrary(s => s.activeId);
  const previewId = useLibrary(s => s.previewId);
  const title = useLibrary(s => lookupVideo(s.videos, s.activeId ?? s.previewId)?.name ?? 'Video');
  const videos = useLibrary(s => s.activeId ? s.videos : EMPTY_VIDEOS);
  const sourceId = useLibrary(s => s.sourceId);
  const query = useLibrary(s => s.query);
  const hidden = useLibrary(s => s.activeId ? s.hiddenVideos : EMPTY_FLAGS);
  const unavailable = useLibrary(s => s.activeId ? s.unavailable : EMPTY_FLAGS);
  const queue = useRef<{ sourceId: string; query: string; ids: string[] } | undefined>(undefined);
  const playlist = useMemo(() => {
    if (!activeId) { queue.current = undefined; return []; }
    if (queue.current?.sourceId === sourceId && queue.current.query === query && queue.current.ids.includes(activeId)) {
      // The queue owns IDs, never stale cards from a previous catalog save.
      // Playback lookup reads current metadata using bounded position hints.
      return queue.current.ids.filter(id => id === activeId || !hidden[id] && !unavailable[id]);
    }
    const current = lookupVideo(videos, activeId);
    if (!current) return [];
    const visible = selectVisible.peek(useLibrary.getState());
    const owner = peekYoutubeOwner(videos, current);
    const rows = visible?.includes(current) ? playbackWindow(visible, current)
      : owner.length ? playbackWindow(owner, current)
      : previewCandidates(videos, current, [], 512).filter(video => video.id === current.id || video.folderId === current.folderId && !video.remote?.live);
    const ids = rows.filter(video => video.id === current.id || !hidden[video.id] && !unavailable[video.id]).map(video => video.id);
    // Next/Previous retain their position as playback advances; a new active
    // title must not reshuffle the queue or reset the index to zero.
    queue.current = { sourceId, query, ids };
    return ids;
  }, [videos, activeId, sourceId, query, hidden, unavailable]);
  useEffect(() => {
    setPullViewerOpen(Boolean(activeId || previewId));
    viewerDetails.releaseCommentsExcept(activeId ?? previewId);
    if (!activeId && !previewId) useLibrary.getState().releaseVideoComments();
    // Preview ↔ player switches should keep the background image gate closed;
    // the store already contains the next viewer state during effect cleanup.
    return () => {
      const next = useLibrary.getState();
      setPullViewerOpen(Boolean(next.activeId || next.previewId));
    };
  }, [activeId, previewId]);
  if (!activeId && !previewId) return null;
  return <ViewerDialog title={`${activeId ? 'Player' : 'Preview'}: ${title}`}>
    <Suspense fallback={<ViewerLoading />}>
    {activeId && <Player playlist={playlist} />}
    {previewId && <PreVideo />}
    </Suspense>
  </ViewerDialog>;
});
