import type { SearchRankingInput, SearchRankingResult } from './search-ranking';

type Scope = Pick<SearchRankingInput, 'videos' | 'ids' | 'query' | 'sourceId' | 'folders' | 'hidden' | 'unavailable' | 'tags'>;
export const EMPTY_SEARCH_RANKING: SearchRankingResult = { ranked: [], tags: [] };
type Snapshot = { scope: Scope | null; result: SearchRankingResult; pending: boolean; updated: boolean; error: boolean; revision: number };

function scopeOf(input: SearchRankingInput): Scope {
  const { videos, ids, query, sourceId, folders, hidden, unavailable, tags } = input;
  return { videos, ids, query, sourceId, folders, hidden, unavailable, tags };
}
/** Eligibility must match exactly. Reactions may change without replacing the
 * published order; hiding a title, changing privacy or editing tags may not. */
export function matchesSearchScope(scope: Scope | null, input: SearchRankingInput): boolean {
  return Boolean(scope && scope.videos === input.videos && scope.ids === input.ids && scope.query === input.query
    && scope.sourceId === input.sourceId && scope.folders === input.folders && scope.hidden === input.hidden
    && scope.unavailable === input.unavailable && scope.tags === input.tags);
}

/** One published result and at most one cancelable job, with no query history.
 * Feedback is applied on explicit refresh so watching cannot reshuffle a paged
 * result desk or take keyboard focus away from its current card. */
export function createSearchRankingSession(rank: (input: SearchRankingInput, signal: AbortSignal) => Promise<SearchRankingResult>) {
  const listeners = new Set<() => void>();
  let current: SearchRankingInput | null = null;
  let job: AbortController | undefined;
  let held = false;
  let snapshot: Snapshot = { scope: null, result: EMPTY_SEARCH_RANKING, pending: false, updated: false, error: false, revision: 0 };
  const publish = (next: Snapshot) => { snapshot = next; listeners.forEach(listener => listener()); };
  const cancel = () => { job?.abort(); job = undefined; };
  const start = () => {
    if (held || job || !current || !snapshot.pending) return;
    const controller = new AbortController(); job = controller;
    void rank(current, controller.signal).then(result => {
      if (controller.signal.aborted || job !== controller) return;
      job = undefined;
      publish({ ...snapshot, result, pending: false, error: false });
    }).catch(() => {
      if (controller.signal.aborted || job !== controller) return;
      job = undefined;
      publish({ ...snapshot, result: EMPTY_SEARCH_RANKING, pending: false, error: true });
    });
  };
  const setInput = (input: SearchRankingInput | null) => {
    if (input === current) return;
    current = input;
    if (input && matchesSearchScope(snapshot.scope, input) && !snapshot.pending && !snapshot.error) {
      if (!snapshot.updated) publish({ ...snapshot, updated: true });
      return;
    }
    cancel();
    publish({ scope: input ? scopeOf(input) : null, result: EMPTY_SEARCH_RANKING,
      pending: Boolean(input), updated: false, error: false, revision: snapshot.revision });
    start();
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    setInput,
    setHeld(value: boolean) { if (held === value) return; held = value; if (held) cancel(); else start(); },
    refresh() {
      if (!current) return;
      cancel();
      publish({ scope: scopeOf(current), result: EMPTY_SEARCH_RANKING, pending: true, updated: false, error: false, revision: snapshot.revision + 1 });
      start();
    },
    release() { setInput(null); cancel(); },
  };
}
