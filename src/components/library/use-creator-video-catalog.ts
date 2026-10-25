import { startTransition, useEffect, useMemo, useState } from 'react';
import { catalogTurn } from '@/lib/catalog-turn';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { prepareCreatorVideos, orderCreatorVideos, prepareCreatorVideoActivity, selectCreatorVideos,
  type CreatorVideoSort, type CreatorVideoFilter } from '@/lib/videos/creator-video-catalog';
import type { FollowedChannel, HistoryEntry, LibraryVideo } from '@/lib/videos/types';

const EMPTY: LibraryVideo[] = [];
function useCreatorJob<S, T>(scope: S, ready: boolean, work: (scope: S, turn: () => Promise<void>) => Promise<T>) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const [packet, setPacket] = useState<{ scope: S; value: T }>();
  const [failure, setFailure] = useState<S>();
  const [attempt, retry] = useState(0);
  useEffect(() => {
    // Deselecting a creator also releases its prepared arrays and history set.
    if (!ready) { setPacket(undefined); setFailure(undefined); return; }
    if (phase !== 'active' || viewer || packet?.scope === scope) return;
    const controller = new AbortController();
    setFailure(undefined);
    void work(scope, catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ scope, value }));
    }).catch(() => { if (!controller.signal.aborted) setFailure(scope); });
    return () => controller.abort();
  }, [scope, ready, phase, viewer, attempt]);
  return { value: ready && packet?.scope === scope ? packet.value : undefined,
    failed: ready && failure === scope && packet?.scope !== scope, retry: () => retry(value => value + 1) };
}

export function useCreatorVideoCatalog(videos: LibraryVideo[], selected: FollowedChannel | null,
  hidden: Record<string, unknown>, favorites: Record<string, unknown>, history: HistoryEntry[],
  sort: CreatorVideoSort, filter: CreatorVideoFilter, query: string) {
  // Profile/thumbnail refreshes do not invalidate catalog membership.
  const source = useMemo(() => selected ? { id: selected.id, channelId: selected.channelId } : null, [selected?.id, selected?.channelId]);
  const memberScope = useMemo(() => ({ videos, source, hidden }), [videos, source, hidden]);
  const members = useCreatorJob(memberScope, !!source, (scope, turn) => prepareCreatorVideos(scope.videos, scope.source!, scope.hidden, turn));
  const orderScope = useMemo(() => ({ rows: members.value, sort }), [members.value, sort]);
  const order = useCreatorJob(orderScope, !!members.value, (scope, turn) => orderCreatorVideos(scope.rows!, scope.sort, turn));
  const activityScope = useMemo(() => ({ rows: members.value, favorites, history }), [members.value, favorites, history]);
  const activity = useCreatorJob(activityScope, !!members.value, (scope, turn) => prepareCreatorVideoActivity(scope.rows!, scope.history, scope.favorites, turn));
  const selectionScope = useMemo(() => ({ rows: order.value, activity: activity.value, favorites, filter, query }), [order.value, activity.value, favorites, filter, query]);
  const selection = useCreatorJob(selectionScope, !!order.value && !!activity.value, (scope, turn) =>
    selectCreatorVideos(scope.rows!, scope.query, scope.filter, scope.favorites, scope.activity!.watched, turn));
  return { total: members.value?.length, stats: activity.value, rows: selection.value ?? EMPTY,
    pending: !!selected && !selection.value, failed: members.failed || order.failed || activity.failed || selection.failed,
    retry() { members.retry(); order.retry(); activity.retry(); selection.retry(); } };
}
