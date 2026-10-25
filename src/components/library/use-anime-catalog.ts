import { startTransition, useEffect, useMemo, useState } from 'react';
import { catalogTurn } from '@/lib/catalog-turn';
import { useSessionPhase } from '@/lib/use-session-phase';
import { resumeForVideo, useLibrary } from '@/lib/videos/store';
import { prepareAnimeCatalog, prepareAnimeContinue, selectAnimeTitles, findAnimeTagTitles,
  type AnimeCatalogInput, type AnimeFilter } from '@/lib/videos/anime-catalog';
import type { LibraryVideo } from '@/lib/videos/types';

const EMPTY: LibraryVideo[] = [];

/** Each stage has its own inputs: progress only recalculates Continue, while
 * queries only rescan the already-classified catalog. Obsolete work is aborted
 * at task boundaries, including before publication. Hidden tabs and viewers
 * suspend preparation without discarding a completed current snapshot. */
function useAnimeJob<S, T>(scope: S, ready: boolean, work: (scope: S, turn: () => Promise<void>) => Promise<T>) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const [packet, setPacket] = useState<{ scope: S; value: T }>();
  const [failure, setFailure] = useState<S>();
  const [attempt, retry] = useState(0);
  useEffect(() => {
    if (!ready || phase !== 'active' || viewer || packet?.scope === scope) return;
    const controller = new AbortController();
    setFailure(undefined);
    void work(scope, catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ scope, value }));
    }).catch(() => { if (!controller.signal.aborted) setFailure(scope); });
    return () => controller.abort();
    // The scope owns every input. Stable per-stage call sites only interpret it.
  }, [scope, ready, phase, viewer, attempt]);
  return { value: ready && packet?.scope === scope ? packet.value : undefined,
    failed: failure === scope && packet?.scope !== scope, retry: () => retry(value => value + 1) };
}

export function useAnimeCatalog(input: AnimeCatalogInput, filter: AnimeFilter, query: string, tagQuery: string, series = '', episodeOrder = false) {
  const progress = useLibrary(state => state.progress), resumeProgress = useLibrary(state => state.resumeProgress);
  const index = useAnimeJob(input, true, prepareAnimeCatalog);
  const continueScope = useMemo(() => ({ index: index.value, progress, resumeProgress }), [index.value, progress, resumeProgress]);
  const continuing = useAnimeJob(continueScope, !!index.value, (scope, turn) =>
    prepareAnimeContinue(scope.index!.anime, video => resumeForVideo(scope, video), turn));
  const selectionScope = useMemo(() => ({ index: index.value, continuing: filter === 'continue' ? continuing.value : EMPTY,
    tags: input.tags, filter, query, series, episodeOrder }), [index.value, filter === 'continue' ? continuing.value : EMPTY, input.tags, filter, query, series, episodeOrder]);
  const selection = useAnimeJob(selectionScope, !!index.value && (filter !== 'continue' || !!continuing.value), (scope, turn) =>
    selectAnimeTitles(scope.index!, scope.continuing!, scope.filter, scope.query, scope.tags, turn, { series: scope.series, episodeOrder: scope.episodeOrder }));
  const finderScope = useMemo(() => ({ index: index.value, tags: input.tags, tagQuery }), [index.value, input.tags, tagQuery]);
  const finder = useAnimeJob(finderScope, !!index.value && !!tagQuery.trim(), (scope, turn) =>
    findAnimeTagTitles(scope.index!.catalog, scope.tagQuery, scope.tags, turn));
  return { index: index.value, continuing: continuing.value, rows: selection.value ?? EMPTY, matches: finder.value ?? EMPTY,
    pending: !selection.value, finderPending: !!tagQuery.trim() && !finder.value,
    failed: index.failed || continuing.failed || selection.failed || finder.failed,
    retry() { index.retry(); continuing.retry(); selection.retry(); finder.retry(); } };
}
