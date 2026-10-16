import { startTransition, useEffect, useMemo, useState } from 'react';
import { catalogTurn } from '@/lib/catalog-turn';
import { getRating, ratingPreference } from '@/lib/media-feedback';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { sampleTwitchClipsAsync } from '@/lib/videos/twitch-clips';
import { prepareTwitchCoverage, prepareTwitchCreatorScores, prepareTwitchCreatorShelves, prepareTwitchDeskIndex } from '@/lib/videos/twitch-desk-catalog';
import type { FollowedChannel, LibraryVideo } from '@/lib/videos/types';

const EMPTY: LibraryVideo[] = [];
const EMPTY_SHELVES = { channels: [], live: [] } as Awaited<ReturnType<typeof prepareTwitchCreatorShelves>>;
const EMPTY_COVERAGE = { total: 0, sparse: 0, channels: [] } as Awaited<ReturnType<typeof prepareTwitchCoverage>>;

/** Job scopes own their dependencies and validity rules. Leaving the desk,
 * changing its catalog, opening a player or hiding the tab cancels old work. */
function useDeskJob<S, T>(active: boolean, scope: S, prepare: (scope: S, turn: () => Promise<void>) => Promise<T>,
  compatible: (previous: S, current: S) => boolean, ready = true) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const [packet, setPacket] = useState<{ scope: S; value: T }>();
  useEffect(() => {
    if (!active) { setPacket(undefined); return; }
    if (!ready || phase !== 'active' || viewer || packet?.scope === scope) return;
    const controller = new AbortController();
    void prepare(scope, catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ scope, value }));
    }).catch(() => {});
    return () => controller.abort();
    // The immutable scope contains every job input. Callbacks only interpret it.
  }, [active, scope, phase, viewer, ready]);
  return { value: active && packet && compatible(packet.scope, scope) ? packet.value : undefined,
    pending: active && (!ready || packet?.scope !== scope) };
}

export function useTwitchDeskCatalog(active: boolean, videos: LibraryVideo[], follows: FollowedChannel[],
  vods: LibraryVideo[], ordered: LibraryVideo[], seed: number, clipSeed: number, creator: string,
  favorites: Record<string, true>, likes: Record<string, true>, views: Record<string, number>, revision: number,
  orderedReady: boolean, discoveryActive: boolean, vodsReady: boolean) {
  const index = useDeskJob(active, videos, prepareTwitchDeskIndex, (a, b) => a === b);
  const coverageScope = useMemo(() => ({ index: index.value, follows }), [index.value, follows]);
  const coverage = useDeskJob(active && !!index.value, coverageScope,
    (scope, turn) => prepareTwitchCoverage(scope.index!, scope.follows, turn),
    (a, b) => a.index === b.index && a.follows === b.follows);
  const clipScope = useMemo(() => ({ videos, index: index.value, clipSeed, creator }), [videos, index.value, clipSeed, creator]);
  const clips = useDeskJob(active && discoveryActive && !!index.value, clipScope,
    (scope, turn) => sampleTwitchClipsAsync(scope.videos, scope.index!.clips, scope.clipSeed, scope.creator, turn),
    (a, b) => a.videos === b.videos && a.creator === b.creator);
  const scoreScope = useMemo(() => ({ vods, favorites, likes, views, revision }), [vods, favorites, likes, views, revision]);
  const scores = useDeskJob(active && discoveryActive, scoreScope, (scope, turn) => prepareTwitchCreatorScores(scope.vods,
    video => ratingPreference(getRating(video.id)) * 10 + (scope.favorites[video.id] ? 8 : 0)
      + (scope.likes[video.id] ? 4 : 0) + (scope.views[video.id] ?? 0), turn), (a, b) => a === b, vodsReady);
  const shelfScope = useMemo(() => ({ videos, vods, scores: scores.value, ordered, seed }), [videos, vods, scores.value, ordered, seed]);
  const shelves = useDeskJob(active && discoveryActive, shelfScope,
    (scope, turn) => prepareTwitchCreatorShelves(scope.vods, scope.scores!, scope.ordered, scope.seed, turn),
    (a, b) => a.videos === b.videos, !!scores.value && orderedReady && vodsReady);
  // Keep painted shelves during a taste refresh, but never across a real
  // catalog mutation. The job remains active while the replacement score builds.
  return { liveRows: index.value?.live ?? EMPTY, clipTotal: index.value?.clips.length ?? 0,
    clips: clips.value ?? EMPTY, clipsPending: index.pending || clips.pending,
    coverage: coverage.value ?? EMPTY_COVERAGE, coveragePending: index.pending || coverage.pending,
    shelves: shelves.value ?? EMPTY_SHELVES, shelvesPending: scores.pending || shelves.pending };
}
