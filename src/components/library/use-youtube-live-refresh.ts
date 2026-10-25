import { useEffect } from 'react';
import { useLibrary } from '@/lib/videos/store';
import { getPullSettings } from '@/lib/pull-settings';
import { catalogPullAvailable, subscribePullAvailability } from '@/lib/pull-control';
import { registerPeriodicTask } from '@/lib/periodic-work';
import { YOUTUBE_QUICK_LIVE, selectYoutubeQuickLiveChannels } from '@/lib/videos/youtube-quick-live';

let lastAttempt = 0;
/** A live owner never waits for the archive owner to finish. Durable per-
 * creator timestamps rotate discovery across reloads; no separate list writes. */
export function useYoutubeLiveRefresh() {
  const hydrated = useLibrary(s => s.hydrated), source = useLibrary(s => s.sourceId);
  useEffect(() => {
    if (!hydrated) return;
    const demand = ['live', 'youtube'].includes(source);
    let stopped = false, busy = false;
    const tick = async () => {
      if (stopped || busy || Date.now() - lastAttempt < YOUTUBE_QUICK_LIVE.tickMs || !getPullSettings().automaticPulls || !catalogPullAvailable(false, demand) || !navigator.onLine) return;
      const state = useLibrary.getState();
      if (!selectYoutubeQuickLiveChannels(state.follows, 1, true).length) return;
      busy = true;
      try {
        const result = await state.refreshFollows('youtube', { youtubeLiveOnly: true, scheduled: true, liveDemand: demand, liveSweep: ['youtube', 'live', 'assistant', 'landing'].includes(source) });
        if (result.pull) lastAttempt = Date.now();
      } finally { busy = false; }
    };
    const task = registerPeriodicTask({ name: 'YouTube quick live discovery', everyMs: YOUTUBE_QUICK_LIVE.tickMs, firstMs: 1500, mode: demand ? 'visible' : 'active',
      enabled: () => getPullSettings().automaticPulls && catalogPullAvailable(true, demand) && navigator.onLine, work: tick });
    const off = subscribePullAvailability(task.wake);
    return () => { stopped = true; task.cancel(); off(); };
  }, [hydrated, source]);
}
