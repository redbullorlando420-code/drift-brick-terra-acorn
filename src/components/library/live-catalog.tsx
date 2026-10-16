import { memo, useEffect, useMemo, useState } from 'react';
import { useLibrary } from '@/lib/videos/store';
import type { LibraryVideo } from '@/lib/videos/types';
import { hasFreshRemoteLiveState } from '@/lib/videos/live-desk';
import { LIBRARY_LIMITS } from '@/lib/library-limits';
import { useSessionPhase } from '@/lib/use-session-phase';
import { TitleRail } from './browse';
import { LiveDesk } from './live-desk';
import { registerPeriodicTask } from '@/lib/periodic-work';

/** Expiring a live label only repaints the live surface, never the large
 * library root. Its clock stops when that surface is empty, idle or covered. */
export const LiveCatalog = memo(function LiveCatalog({ videos, rail = false, priority = false, adultLiveVideos }: {
  videos: LibraryVideo[]; rail?: boolean; priority?: boolean; adultLiveVideos?: LibraryVideo[];
}) {
  const phase = useSessionPhase();
  const viewerOpen = useLibrary(s => Boolean(s.activeId || s.previewId));
  const [clock, setClock] = useState(Date.now);
  useEffect(() => {
    if (!videos.length || viewerOpen || phase !== 'active') return;
    setClock(Date.now());
    return registerPeriodicTask({ name: 'Live expiry', everyMs: 30_000, work: () => setClock(Date.now()) }).cancel;
  }, [videos.length, viewerOpen, phase]);
  const snapshot = useMemo(() => {
    const now = Math.max(Date.now(), clock);
    const current: LibraryVideo[] = [], staleYoutube: LibraryVideo[] = [];
    let staleTwitch = 0;
    for (const video of videos) {
      if (hasFreshRemoteLiveState(video, now, LIBRARY_LIMITS.twitchLiveStateFreshnessMs, LIBRARY_LIMITS.youtubeLiveStateFreshnessMs)) current.push(video);
      else if (video.remote?.kind === 'youtube' && video.remote.live) staleYoutube.push(video);
      else if (video.remote?.kind === 'twitch') staleTwitch++;
    }
    return { current, staleYoutube, staleTwitch };
  }, [videos, clock]);
  return rail ? <TitleRail title="Live now" reason={`${snapshot.current.length.toLocaleString()} channels confirmed in a recent live check.`} videos={snapshot.current} variant="rail" priority={priority} />
    : <LiveDesk videos={snapshot.current} staleYoutubeVideos={snapshot.staleYoutube} staleTwitchCount={snapshot.staleTwitch} staleYoutubeCount={snapshot.staleYoutube.length} adultLiveVideos={adultLiveVideos} />;
});
