import { useStore } from 'zustand';
import { createNavigationStore } from '@/lib/navigation-store';
import { scheduleNavigationWork, yieldNavigationTask } from '@/lib/navigation-work';
import { HUB_SOURCES } from '@/lib/library-navigation';
import { prepareYoutubeSelection, prepareFavoritesSelection, prepareRecoveryBrowse, useLibrary, type LibraryState } from '@/lib/videos/store';
import { prepareYoutubeBrowse } from '@/lib/videos/youtube-browse';
import { getYoutubeFirstClickTrace, markYoutubePreparationReady } from '@/lib/youtube-first-click-trace';

const browse = createNavigationStore(useLibrary, {
  key: state => state.sourceId,
  defer: state => !HUB_SOURCES.has(state.sourceId) && (state.sourceId !== 'home' || Boolean(state.query.trim())),
  held: state => Boolean(state.activeId || state.previewId),
  schedule: scheduleNavigationWork,
  async prepare(state, signal) {
    if ((state.sourceId === 'continue' || state.sourceId === 'history') && !state.query.trim()) await prepareRecoveryBrowse(state, signal, () => yieldNavigationTask(signal));
    if (state.sourceId === 'favorites' && !state.query.trim()) await prepareFavoritesSelection(state, signal, () => yieldNavigationTask(signal));
    if (!state.query.trim() && (state.sourceId === 'youtube' || state.sourceId === 'landing')) {
      const started = performance.now(), trace = state.sourceId === 'youtube' ? getYoutubeFirstClickTrace() : null;
      let yields = 0;
      const turn = async () => { await yieldNavigationTask(signal); yields++; };
      const selected = await prepareYoutubeSelection(state, signal, turn);
      await prepareYoutubeBrowse(selected, signal, turn);
      signal.throwIfAborted();
      if (trace && selected.length) markYoutubePreparationReady(trace.startedAt, performance.now() - started, yields);
    }
  },
  prepared: (before, after) => before.videos === after.videos && before.folders === after.folders
    && before.hiddenVideos === after.hiddenVideos && before.unavailable === after.unavailable
    && before.hideDemo === after.hideDemo && before.query === after.query
    && (after.sourceId !== 'favorites' || Boolean(after.query.trim()) || before.favorites === after.favorites && before.likes === after.likes)
    && (!['continue', 'history'].includes(after.sourceId) || Boolean(after.query.trim()) || before.history === after.history && before.progress === after.progress && before.resumeProgress === after.resumeProgress && before.sort === after.sort),
});

/** Full-screen playback uses the live library. Its covered browse page waits
 * for the viewer to close before recomputing catalog shelves and insights.
 * Source switches publish the catalog after the live navigation has painted. */
export function useBrowseLibrary<T>(selector: (state: LibraryState) => T) {
  return useStore(browse, selector);
}

/** Cleanup follows the painted snapshot, including while another destination
 * is preparing or the viewer holds the browse page behind it. */
export const getBrowseLibrarySnapshot = browse.getState;
