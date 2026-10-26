import { startTransition, useEffect, useMemo, useState } from 'react';
import { catalogTurn } from '@/lib/catalog-turn';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { prepareMovieCatalog, shuffleMovieCatalog, type MovieCatalog, type MovieCatalogScope } from '@/lib/videos/movie-catalog';
import {useFilmReviews} from './use-film-reviews';

const EMPTY: MovieCatalog = { videos: [], classics: [], classicSet: new Set(), genres: [], types: [], candidates: [], awaitingRuntime: 0, features: [], shorts: [], documentaries: [] };
const EMPTY_ORDER = { videos: [], modern: [] } as Awaited<ReturnType<typeof shuffleMovieCatalog>>;

/** Only the current visibility snapshot may paint. A shuffle can keep its
 * previous order visible, but hide/remove/private changes invalidate it at once. */
export function useMovieCatalog(active: boolean, scope: MovieCatalogScope, seed: number) {
  const review=useFilmReviews(active);
  const input = useMemo(() => ({...scope,filmLedger:review.ledger}), [scope.videos, scope.folders, scope.hidden, scope.unavailable,scope.tags,scope.progress,scope.metadataProvenance,review.ledger]);
  const phase = useSessionPhase();
  const viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const [index, setIndex] = useState<{ scope: MovieCatalogScope; value: MovieCatalog }>();
  const [order, setOrder] = useState<{ catalog: MovieCatalog; seed: number; value: typeof EMPTY_ORDER }>();
  const catalog = active && review.ready && index?.scope === input ? index.value : undefined;
  useEffect(() => {
    if (!active) { setIndex(undefined); return; }
    if (!review.ready || phase !== 'active' || viewer || index?.scope === input) return;
    const controller = new AbortController();
    void prepareMovieCatalog(input, catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => setIndex({ scope: input, value }));
    }).catch(() => {});
    return () => controller.abort();
  }, [active, input, phase, viewer,review.ready]);
  useEffect(() => {
    if (!active || !catalog) { setOrder(undefined); return; }
    if (phase !== 'active' || viewer || order?.catalog === catalog && order.seed === seed) return;
    const controller = new AbortController();
    void shuffleMovieCatalog(catalog, seed, catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => setOrder({ catalog, seed, value }));
    }).catch(() => {});
    return () => controller.abort();
  }, [active, catalog, seed, phase, viewer]);
  return { catalog: catalog ?? EMPTY, ordered: active && catalog && order?.catalog === catalog ? order.value : EMPTY_ORDER,
    pending: active && (!catalog || order?.catalog !== catalog || order.seed !== seed) };
}
