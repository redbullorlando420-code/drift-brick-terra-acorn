import { useEffect, useState } from 'react';
import { prepareContinueSelection, selectContinue, useLibrary } from '@/lib/videos/store';
import { yieldNavigationTask } from '@/lib/navigation-work';
import { useBrowseLibrary } from './use-browse-library';

/** A sidebar badge never invokes a cold catalog selector inside render or an
 * idle callback. Reuse prepared rows; obsolete work releases at its next slice. */
export function useContinueCount() {
  const videos = useBrowseLibrary(s => s.videos), folders = useBrowseLibrary(s => s.folders);
  const history = useBrowseLibrary(s => s.history), progress = useBrowseLibrary(s => s.progress);
  const resumeProgress = useBrowseLibrary(s => s.resumeProgress), hidden = useBrowseLibrary(s => s.hiddenVideos);
  const hideDemo = useBrowseLibrary(s => s.hideDemo);
  const home = useLibrary(s => s.sourceId === 'home');
  const viewerOpen = useLibrary(s => Boolean(s.activeId || s.previewId));
  const [count, setCount] = useState<number>();
  useEffect(() => {
    if (home || viewerOpen) return;
    const state = useLibrary.getState(), cached = selectContinue.peek(state);
    if (cached) { setCount(cached.length); return; }
    const controller = new AbortController();
    void prepareContinueSelection(state, controller.signal, () => yieldNavigationTask(controller.signal))
      .then(rows => { if (!controller.signal.aborted) setCount(rows.length); }).catch(() => {});
    return () => controller.abort();
  }, [home, viewerOpen, videos, folders, history, progress, resumeProgress, hidden, hideDemo]);
  return count;
}
