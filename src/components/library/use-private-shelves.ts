import { startTransition, useEffect, useMemo, useState } from 'react';
import { catalogTurn } from '@/lib/catalog-turn';
import { useSessionPhase } from '@/lib/use-session-phase';
import { preparePrivateSelection, useLibrary } from '@/lib/videos/store';
import { preparePrivateShelves, orderPrivateShelves, filterPrivateShelves, type PrivateShelfIndex, type PrivateSort } from '@/lib/videos/private-shelves';
import type { LibraryVideo } from '@/lib/videos/types';
import { getBrowseLibrarySnapshot, useBrowseLibrary } from './use-browse-library';

const EMPTY: LibraryVideo[] = [], EMPTY_SIGNALS = {};
const EMPTY_INDEX: PrivateShelfIndex = { videos: EMPTY, tags: {}, folders: new Map(), byId: new Map(), tagged: EMPTY, untagged: EMPTY, recent: EMPTY };

export function usePrivateShelfIndex(active: boolean) {
  // Subscribe to raw catalog identity only while this optional desk is open.
  const videos = useBrowseLibrary(state => active ? state.videos : EMPTY);
  const state = getBrowseLibrarySnapshot(), phase = useSessionPhase();
  const viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const recentProgress = state.sort === 'recent' ? state.progress : EMPTY_SIGNALS;
  const scope = useMemo(() => state, [videos, state.folders, state.hiddenVideos, state.unavailable, state.tags, state.showHiddenAdult, state.sort, recentProgress, state.sourceId, state.query]);
  const [packet, setPacket] = useState<{ scope: typeof scope; value: PrivateShelfIndex }>();
  const [failure, setFailure] = useState<{ scope: typeof scope; message: string }>();
  const [attempt, setAttempt] = useState(0);
  const index = active && packet?.scope === scope ? packet.value : undefined;
  useEffect(() => {
    if (!active) { setPacket(undefined); return; }
    if (phase !== 'active' || viewer || index) return;
    const controller = new AbortController(), turn = catalogTurn(controller.signal);
    void preparePrivateSelection(scope, controller.signal, turn)
      .then(videos => preparePrivateShelves(videos, scope.tags, turn)).then(value => {
        if (!controller.signal.aborted) startTransition(() => { setPacket({ scope, value }); setFailure(undefined); });
      }).catch(error => { if (!controller.signal.aborted) setFailure({ scope, message: String(error) }); });
    return () => controller.abort();
  }, [active, scope, phase, viewer, attempt]);
  return { index: index ?? EMPTY_INDEX, pending: active && !index,
    error: active && failure?.scope === scope ? failure.message : '', retry: () => setAttempt(value => value + 1) };
}

export function usePrivateShelfOrder(active: boolean, index: PrivateShelfIndex, sort: PrivateSort, tag: string,
  favorites: Record<string, true>, progress: Record<string, { at: number }>, ranked: string[] | undefined) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  // Ratings and unrelated controls cannot restart a name/recent/tagged sort.
  const favoriteInput = sort === 'favorites' ? favorites : EMPTY_SIGNALS;
  const progressInput = sort === 'played' ? progress : EMPTY_SIGNALS;
  const rankedInput = sort === 'ranked' ? ranked : undefined;
  const orderScope = useMemo(() => ({ index, sort, favorites: favoriteInput, progress: progressInput, ranked: rankedInput }), [index, sort, favoriteInput, progressInput, rankedInput]);
  const [order, setOrder] = useState<{ scope: typeof orderScope; rows: LibraryVideo[] }>();
  const rows = active && order?.scope === orderScope ? order.rows : undefined;
  const [selection, setSelection] = useState<{ rows: LibraryVideo[]; tag: string; value: LibraryVideo[] }>();
  const [failure, setFailure] = useState<{ scope: typeof orderScope; tag: string; message: string }>();
  const [attempt, setAttempt] = useState(0);
  const selected = rows && (tag === 'All' ? rows : selection?.rows === rows && selection.tag === tag ? selection.value : undefined);
  useEffect(() => {
    if (!active) { setOrder(undefined); return; }
    if (phase !== 'active' || viewer || rows) return;
    const controller = new AbortController();
    void orderPrivateShelves(index, sort, favoriteInput, progressInput, rankedInput, catalogTurn(controller.signal)).then(rows => {
      if (!controller.signal.aborted) startTransition(() => { setOrder({ scope: orderScope, rows }); setFailure(undefined); });
    }).catch(error => { if (!controller.signal.aborted) setFailure({ scope: orderScope, tag, message: String(error) }); });
    return () => controller.abort();
  }, [active, orderScope, phase, viewer, attempt]);
  useEffect(() => {
    if (!active || !rows || tag === 'All') { setSelection(undefined); return; }
    if (phase !== 'active' || viewer || selected) return;
    const controller = new AbortController();
    void filterPrivateShelves(rows, index.tags, tag, catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => { setSelection({ rows, tag, value }); setFailure(undefined); });
    }).catch(error => { if (!controller.signal.aborted) setFailure({ scope: orderScope, tag, message: String(error) }); });
    return () => controller.abort();
  }, [active, rows, tag, index.tags, phase, viewer, attempt]);
  return { rows: selected ?? EMPTY, pending: active && !selected,
    error: active && failure?.scope === orderScope && failure.tag === tag ? failure.message : '', retry: () => setAttempt(value => value + 1) };
}
