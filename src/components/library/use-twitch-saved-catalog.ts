import type { TwitchContentFilter } from '@/lib/videos/twitch-content';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { catalogTurn } from '@/lib/catalog-turn';
import { getRating, ratingPreference, getWatchTime, watchTimeScore, tagIsLiked } from '@/lib/media-feedback';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { filterCatalogSelection, prepareTwitchSaved, prepareTwitchTopics, type TwitchTopicCatalog, type TwitchSavedCatalog, type TwitchSavedFilter } from '@/lib/videos/twitch-saved-catalog';
import type { LibraryVideo } from '@/lib/videos/types';

const EMPTY: LibraryVideo[] = [];
const EMPTY_TAGS: Record<string, string[]> = {};
const EMPTY_SAVED: TwitchSavedCatalog = { favoriteRows: EMPTY, likedRows: EMPTY, favoriteCount: 0, likedCount: 0 };
const EMPTY_TOPICS: TwitchTopicCatalog = { preferred: new Set(), shelves: [] };
const topicTaste = { rating: getRating, liked: tagIsLiked, score: (id: string, rating: number) =>
  ratingPreference(rating) * 2 + (rating === 1 ? 0 : watchTimeScore(getWatchTime(id)) / 4) };

export function useTwitchTopicCatalog(active: boolean, videos: LibraryVideo[], tags: Record<string, string[]>, revision: number) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const scope = useMemo(() => ({ videos, tags, revision }), [videos, tags, revision]);
  const [packet, setPacket] = useState<{ scope: typeof scope; data: TwitchTopicCatalog }>();
  useEffect(() => {
    if (!active) { setPacket(undefined); return; }
    if (phase !== 'active' || viewer || packet?.scope === scope) return;
    const controller = new AbortController();
    void prepareTwitchTopics(videos, tags, topicTaste, catalogTurn(controller.signal)).then(data => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ scope, data }));
    }).catch(() => {});
    return () => controller.abort();
  }, [active, scope, phase, viewer]);
  const ready = active && packet?.scope === scope;
  // Keep the completed shelves while taste/tags refresh. A new catalog
  // reference still withdraws rows immediately after hiding/removing a title.
  return { ...(active && packet?.scope.videos === videos ? packet.data : EMPTY_TOPICS), pending: active && !ready };
}

/** Shared saved counts/shelves have no dependency on a mix seed or the current filter. */
export function useTwitchSavedCatalog(active: boolean, videos: LibraryVideo[], favorites: Record<string, true>,
  likes: Record<string, true>, viewCounts: Record<string, number>, revision: number) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const scope = useMemo(() => ({ videos, favorites, likes, viewCounts, revision }), [videos, favorites, likes, viewCounts, revision]);
  const [packet, setPacket] = useState<{ scope: typeof scope; data: TwitchSavedCatalog }>();
  useEffect(() => {
    if (!active) { setPacket(undefined); return; }
    if (phase !== 'active' || viewer || packet?.scope === scope) return;
    const controller = new AbortController();
    void prepareTwitchSaved({ ...scope, rating: getRating }, catalogTurn(controller.signal)).then(data => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ scope, data }));
    }).catch(() => {});
    return () => controller.abort();
  }, [active, scope, phase, viewer]);
  const ready = active && packet?.scope === scope;
  return { ...(active && packet?.scope.videos === videos ? packet.data : EMPTY_SAVED), pending: active && !ready };
}

/** Ignore irrelevant records so all/all, tag changes and likes cannot restart unrelated work. */
export function useCatalogSelection(active: boolean, videos: LibraryVideo[], filter: TwitchSavedFilter, topic: string,
  favorites: Record<string, true>, likes: Record<string, true>, tags: Record<string, string[]>, content:TwitchContentFilter='all') {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const saved = filter === 'favorites' ? favorites : filter === 'likes' ? likes : undefined;
  const topicTags = topic === 'all' ? EMPTY_TAGS : tags;
  const scope = useMemo(() => ({ videos, saved, topic, tags: topicTags, content }), [videos, saved, topic, topicTags, content]);
  const [packet, setPacket] = useState<{ scope: typeof scope; rows: LibraryVideo[] }>();
  const unfiltered = !saved && topic === 'all' && content === 'all';
  useEffect(() => {
    if (!active || unfiltered) { setPacket(undefined); return; }
    if (phase !== 'active' || viewer || packet?.scope === scope) return;
    const controller = new AbortController();
    void filterCatalogSelection(videos, saved, topic, topicTags, catalogTurn(controller.signal), content).then(rows => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ scope, rows }));
    }).catch(() => {});
    return () => controller.abort();
  }, [active, scope, unfiltered, phase, viewer]);
  const ready = active && (unfiltered || packet?.scope === scope);
  return { rows: ready ? unfiltered ? videos : packet!.rows : EMPTY, pending: active && !ready };
}
export const useTwitchCatalogFilter = useCatalogSelection;
