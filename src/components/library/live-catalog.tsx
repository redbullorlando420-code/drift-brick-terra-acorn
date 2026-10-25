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
  const [showStale,setShowStale]=useState(false);
  useEffect(() => {
    if (!videos.length || viewerOpen || phase === 'hidden') return;
    setClock(Date.now());
    return registerPeriodicTask({ name: 'Live expiry', everyMs: 30_000, mode: 'visible', work: () => setClock(Date.now()) }).cancel;
  }, [videos.length, viewerOpen, phase]);
  const snapshot = useMemo(() => {
    const now = Math.max(Date.now(), clock);
    const current: LibraryVideo[] = [], staleYoutube: LibraryVideo[] = [], staleTwitch: LibraryVideo[] = [];
    for (const video of videos) {
      if (hasFreshRemoteLiveState(video, now, LIBRARY_LIMITS.twitchLiveStateFreshnessMs, LIBRARY_LIMITS.youtubeLiveStateFreshnessMs)) current.push(video.remote?.kind === 'youtube' && video.remote.liveOfflineSince ? { ...video, remote: { ...video.remote, liveUnconfirmed: true } } : video);
      else if (video.remote?.kind === 'youtube' && video.remote.live) staleYoutube.push(video);
      else if (video.remote?.kind === 'twitch') staleTwitch.push(video);
    }
    return { current, staleYoutube, staleTwitch };
  }, [videos, clock]);
  return rail ? <><TitleRail title="Live now" reason={`${snapshot.current.length.toLocaleString()} channels confirmed in a recent live check.`} videos={snapshot.current} variant="rail" priority={priority} />{snapshot.staleTwitch.length>0&&<details className="mb-5 rounded-lg border border-border p-4" onToggle={event=>setShowStale(event.currentTarget.open)}><summary className="min-h-11 cursor-pointer text-sm text-muted">{snapshot.staleTwitch.length} Twitch channels need a fresh live check</summary><p className="mb-3 text-xs text-muted">Their last live observation is old. They may still be broadcasting.</p><button className="mb-3 min-h-11 rounded-md bg-elevated px-3 text-sm text-fg" onClick={()=>void useLibrary.getState().refreshFollows('twitch',{twitchLiveOnly:true,liveSweep:true})}>Refresh stale Twitch live status</button>{showStale&&<TitleRail title="Awaiting a fresh live check" videos={snapshot.staleTwitch.slice(0,12).map(video=>({...video,remote:{...video.remote!,liveUnconfirmed:true}}))} variant="rail"/>}</details>}</>
    : <LiveDesk videos={snapshot.current} staleYoutubeVideos={snapshot.staleYoutube} staleTwitchVideos={snapshot.staleTwitch} staleTwitchCount={snapshot.staleTwitch.length} staleYoutubeCount={snapshot.staleYoutube.length} adultLiveVideos={adultLiveVideos} />;
});
