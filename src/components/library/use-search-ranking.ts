import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { rankSearchResults, type SearchRankingInput } from '@/lib/videos/search-ranking';
import { createSearchRankingSession, EMPTY_SEARCH_RANKING, matchesSearchScope } from '@/lib/videos/search-ranking-session';
import { useLibrary } from '@/lib/videos/store';

export function useSearchRanking(input: SearchRankingInput | null) {
  const session = useMemo(() => createSearchRankingSession(rankSearchResults), []);
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(() => {
    const hold = () => session.setHeld(Boolean(useLibrary.getState().activeId || useLibrary.getState().previewId));
    hold();
    const stop = useLibrary.subscribe(hold);
    return () => { stop(); session.release(); };
  }, [session]);
  useEffect(() => { session.setInput(input); }, [input, session]);
  // Reject stale eligibility on the render before the effect cancels its job.
  const matches = Boolean(input && matchesSearchScope(snapshot.scope, input));
  return { result: matches ? snapshot.result : EMPTY_SEARCH_RANKING,
    pending: Boolean(input && (!matches || snapshot.pending)), error: matches && snapshot.error,
    updated: matches && snapshot.updated, refresh: session.refresh, revision: snapshot.revision };
}
