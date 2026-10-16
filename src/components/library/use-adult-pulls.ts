import { useEffect } from 'react';
import { useLibrary } from '@/lib/videos/store';
import { ADULT_REDDIT_SUBS } from '@/lib/videos/adult-sites';
import { ADULT_PULL_PROVIDERS } from '@/lib/videos/adult-providers';
import { loadAdultArchiveCursors } from '@/lib/videos/adult-archive-cursors';
import { adultRedditPullSources, planAdultPull } from '@/lib/videos/adult-pull-plan';
import { getPullSettings } from '@/lib/pull-settings';
import { catalogPullAvailable, subscribePullAvailability } from '@/lib/pull-control';
import { allowAutomaticRefresh } from '@/lib/session-activity';
import { registerPeriodicTask } from '@/lib/periodic-work';

import { remoteEntryCounts } from '@/lib/videos/entry-limits';
import { adultAdmissionPolicy, replacementRequestBudget } from '@/lib/videos/youtube-cleanup';
const LAST_ATTEMPT_KEY = 'reelcase.adult-sweep-at.v1';
let lastAttempt = 0;
/** The only automatic Adult pull owner. Thin caches and archive continuation
 * share pacing, settings, saved source scope, retries, and cancellation. */
export function useAdultPulls() {
  const hydrated = useLibrary(state => state.hydrated);
  const sourceId = useLibrary(state => state.sourceId);
  const unlocked = useLibrary(state => state.adultsUnlocked);
  useEffect(() => {
    if (!hydrated || !unlocked || sourceId !== 'adults') return;
    let stopped = false, busy = false;
    try { const saved = Number(localStorage.getItem(LAST_ATTEMPT_KEY)); if (Number.isFinite(saved) && saved <= Date.now()) lastAttempt = Math.max(lastAttempt, saved); } catch { /* Session pacing remains. */ }
    const tick = async () => {
      const policy = getPullSettings(), now = Date.now();
      if (stopped || busy || !policy.automaticPulls || !catalogPullAvailable() || !allowAutomaticRefresh() || !navigator.onLine || now - lastAttempt < policy.adultIntervalSeconds * 1000) return;
      const state = useLibrary.getState();
      if (state.remoteBusy || state.refreshing || !state.adultsUnlocked || state.sourceId !== 'adults') return;
      // Folder totals are updated at ingest/restore, avoiding a million-row
      // traversal on every timer tick just to decide whether to request work.
      const count = state.folders.reduce((sum, folder) => sum + ((ADULT_PULL_PROVIDERS as readonly string[]).includes(folder.kind) ? folder.videoCount : 0), 0);
      const remaining = Math.min(policy.adultCatalogTarget - count, policy.adultMaxEntries - count, policy.remoteMaxEntries);
      if (remaining <= 0 && (!policy.adultAutoCleanup || policy.adultMaxEntries <= 0 || policy.remoteMaxEntries <= 0)) return;
      const providers = planAdultPull(loadAdultArchiveCursors('all', 'top-weekly'), now);
      if (!providers.length) return;
      busy = true;
      try {
        const counts = await remoteEntryCounts(useLibrary.getState().videos);
        const currentPolicy = adultAdmissionPolicy(getPullSettings(), true);
        const capacity = replacementRequestBudget(counts, currentPolicy, 'adult');
        if (!currentPolicy.automaticPulls || !capacity || stopped || !catalogPullAvailable() || !allowAutomaticRefresh()) return;
        lastAttempt = Date.now();
        try { localStorage.setItem(LAST_ATTEMPT_KEY, String(lastAttempt)); } catch { /* Session pacing remains. */ }
        await state.searchAdultFeed('all', 'top-weekly', { append: true, providers, automatic: true,
          maxVideos: Math.min(capacity, currentPolicy.adultBatchVideos), redditSources: adultRedditPullSources(ADULT_REDDIT_SUBS) });
      } catch { /* Pull ledger/cooldowns explain provider failures. */ }
      finally { busy = false; }
    };
    const task = registerPeriodicTask({ name: 'Adult pulls', everyMs: 15_000, firstMs: 8_000,
      enabled: () => getPullSettings().automaticPulls && catalogPullAvailable(true) && navigator.onLine, work: tick });
    const stopAvailability = subscribePullAvailability(task.wake);
    return () => { stopped = true; task.cancel(); stopAvailability(); };
  }, [hydrated, sourceId, unlocked]);
}
