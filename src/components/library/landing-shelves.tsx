import { startTransition, useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { catalogTurn } from '@/lib/catalog-turn';
import { forEachCatalogSlice } from '@/lib/catalog-work';
import { measureInteraction } from '@/lib/interaction-budget';
import { useSessionPhase } from '@/lib/use-session-phase';
import { getRating, getWatchTime, watchTimeScore } from '@/lib/media-feedback';
import { useLibrary, prepareFavoritesSelection, prepareHistorySelection, prepareContinueSelection, type LibraryState } from '@/lib/videos/store';
import { prepareLandingOverview, prepareLandingExpanded, emptyLandingOverview, emptyLandingExpanded } from '@/lib/videos/landing-shelves';
import type { Folder, FollowedChannel, LibraryVideo } from '@/lib/videos/types';
import { getBrowseLibrarySnapshot, useBrowseLibrary } from './use-browse-library';
import { TitleRail } from './browse';
import { RatingStreakCard } from './discovery-desk';
import { RankingGuide } from './ranking-panel';
import { LiveCatalog } from './live-catalog';

const EMPTY_OVERVIEW = emptyLandingOverview(), EMPTY_EXPANDED = emptyLandingExpanded();
const EMPTY_ROWS: LibraryVideo[] = [];
const EMPTY_SAVED = { favorites: EMPTY_ROWS, history: EMPTY_ROWS, continued: EMPTY_ROWS, playedAt: {} as Record<string, number> };
type OverviewScope = Omit<Parameters<typeof prepareLandingOverview>[0], 'now' | 'rating' | 'watchScore'> & { revision: number };
type ExpandedScope = { videos: LibraryVideo[]; youtube: LibraryVideo[]; twitch: LibraryVideo[]; folders: Folder[] };
const overviewWork = (scope: OverviewScope, _signal: AbortSignal, turn: () => Promise<void>) => prepareLandingOverview({ ...scope, now: Date.now(), rating: getRating, watchScore: id => watchTimeScore(getWatchTime(id)) }, turn);
const expandedWork = (scope: ExpandedScope, _signal: AbortSignal, turn: () => Promise<void>) => prepareLandingExpanded(scope.videos, scope.youtube, scope.twitch, scope.folders, turn);
const savedWork = async (scope: LibraryState, signal: AbortSignal, turn: () => Promise<void>) => {
  const favorites = await prepareFavoritesSelection(scope, signal, turn);
  const history = await prepareHistorySelection(scope, signal, turn);
  const continued = await prepareContinueSelection(scope, signal, turn);
  const playedAt: Record<string, number> = Object.create(null);
  await forEachCatalogSlice(scope.history, entry => { if (!Object.hasOwn(playedAt, entry.id)) playedAt[entry.id] = entry.at; }, turn);
  return { favorites, history, continued, playedAt };
};
const sameCatalog = (a: OverviewScope | ExpandedScope, b: OverviewScope | ExpandedScope) => a.videos === b.videos && a.youtube === b.youtube && a.twitch === b.twitch;
const sameExpanded = (a: ExpandedScope, b: ExpandedScope) => sameCatalog(a, b) && a.folders === b.folders;
const sameSavedVisibility = (a: LibraryState, b: LibraryState) => a.videos === b.videos && a.folders === b.folders && a.hiddenVideos === b.hiddenVideos && a.hideDemo === b.hideDemo;

/** Each job belongs to this mounted desk. Hold already-painted rows during
 * feedback refreshes; replaced visibility inputs withdraw obsolete results. */
function useLandingPreparation<S, T>(enabled: boolean, scope: S, work: (scope: S, signal: AbortSignal, turn: () => Promise<void>) => Promise<T>, compatible: (a: S, b: S) => boolean) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const [packet, setPacket] = useState<{ scope: S; data: T }>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) { setPacket(undefined); return; }
    if (phase !== 'active' || viewer || packet?.scope === scope) return;
    const controller = new AbortController();
    setFailed(false);
    void work(scope, controller.signal, catalogTurn(controller.signal)).then(data => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ scope, data }));
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [enabled, scope, work, phase, viewer]);
  return { data: enabled && packet && compatible(packet.scope, scope) ? packet.data : undefined,
    pending: enabled && !failed && packet?.scope !== scope, failed };
}

export function LandingShelves({ videos, youtube, twitch, live, folders, follows, seed, onMix, ready, revision }: {
  videos: LibraryVideo[]; youtube: LibraryVideo[]; twitch: LibraryVideo[]; live: LibraryVideo[];
  folders: Folder[]; follows: FollowedChannel[]; seed: number; onMix: () => void; ready: boolean; revision: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const raw = useBrowseLibrary(state => state.videos), source = useBrowseLibrary(state => state.sourceId);
  const favorites = useBrowseLibrary(state => state.favorites), likes = useBrowseLibrary(state => state.likes);
  const viewCounts = useBrowseLibrary(state => state.viewCounts), history = useBrowseLibrary(state => state.history);
  const progress = useBrowseLibrary(state => state.progress), resumeProgress = useBrowseLibrary(state => state.resumeProgress);
  const hidden = useBrowseLibrary(state => state.hiddenVideos), hideDemo = useBrowseLibrary(state => state.hideDemo);
  const overviewScope = useMemo(() => ({ videos, youtube, twitch, seed, favorites, likes, viewCounts, revision }), [videos, youtube, twitch, seed, favorites, likes, viewCounts, revision]);
  const expandedScope = useMemo(() => ({ videos, youtube, twitch, folders }), [videos, youtube, twitch, folders]);
  const savedScope = useMemo(() => getBrowseLibrarySnapshot(), [raw, source, folders, favorites, likes, history, progress, resumeProgress, hidden, hideDemo]);
  const overview = useLandingPreparation(ready, overviewScope, overviewWork, sameCatalog);
  const additional = useLandingPreparation(ready && expanded, expandedScope, expandedWork, sameExpanded);
  const saved = useLandingPreparation(ready && expanded, savedScope, savedWork, sameSavedVisibility);
  const rows = overview.data ?? EMPTY_OVERVIEW, extras = additional.data ?? EMPTY_EXPANDED, savedRows = saved.data ?? EMPTY_SAVED;
  const publicFolders = useMemo(() => folders.filter(folder => folder.kind !== 'demo' && folder.kind !== 'youtube' && folder.kind !== 'twitch' && !folder.adult).slice(0, 12), [folders]);
  return <div data-landing-overview data-landing-pending={!ready || overview.pending}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border"><p className="text-sm text-muted">Local picks rotate inside your taste matches, so the same few titles do not take over Home.</p><Button size="sm" variant="secondary" onClick={() => { measureInteraction('navigation'); onMix(); }}><Shuffle className="size-4" /> Mix local picks</Button></div>
    {(!ready || overview.pending) && <div className="mb-8 flex min-h-12 items-center gap-3 rounded-lg bg-elevated/70 px-4 py-3 text-sm text-muted shadow-border" role="status"><LoaderCircle className="size-4 animate-spin text-accent" />{overview.data ? 'Updating your shelves…' : 'Preparing recommendations after the first screen…'}</div>}
    {overview.failed && <p role="status" className="mb-4 text-sm text-muted">Recommendations could not update. Use Mix local picks to retry.</p>}
    <RatingStreakCard />
    <TitleRail title="Recently added from your folders" reason="Fresh additions from your local folders." videos={rows.recent} variant="rail" />
    <TitleRail title="Unseen & ready to discover" reason="Less-played titles, rotated so familiar picks do not take over." videos={rows.fresh} variant="rail" />
    <RankingGuide desk="Landing" />
    <TitleRail title="Top-rated local picks" reason="Rated 3–5 only. Stars lead, then capped personal evidence; up to three per folder. Shuffle breaks ties." videos={rows.rated} variant="rail" />
    <LiveCatalog videos={live} rail />
    <TitleRail title="New this week" reason="Recently published or added from your saved sources." videos={rows.week} variant="rail" />
    <TitleRail title={follows.length ? 'Latest from your channels' : 'Fresh from YouTube'} reason="The newest uploads from creators you follow." videos={rows.latest} variant="rail" />
    <Button className="mb-8" variant="secondary" aria-expanded={expanded} onClick={() => { measureInteraction('navigation'); setExpanded(value => !value); }}>{expanded ? 'Show fewer home shelves' : 'Show more home shelves'}</Button>
    {expanded && <div data-landing-expanded data-landing-pending={additional.pending || saved.pending}>
      {(additional.pending || saved.pending) && <p role="status" className="mb-4 text-sm text-muted">{additional.data && saved.data ? 'Updating saved shelves…' : 'Preparing more shelves…'}</p>}
      {(additional.failed || saved.failed) && <p role="status" className="mb-4 text-sm text-muted">Some shelves could not update. Close and reopen more shelves to retry.</p>}
      <TitleRail title="Continue watching" reason="Items with a saved, unfinished watch position." videos={savedRows.continued} variant="rail" />
      <TitleRail title="From YouTube" reason="Your saved YouTube channel cache." videos={extras.youtube} variant="rail" />
      <TitleRail title="Twitch" reason="Live and archived videos from your followed Twitch creators." videos={extras.twitch} variant="rail" />
      <TitleRail title="Every local source" videos={rows.recent} variant="rail" />
      <TitleRail title="Favorites" reason="Titles you explicitly saved." videos={savedRows.favorites} variant="rail" />
      <TitleRail title="Short films & quick watches" videos={extras.shorts} variant="rail" />
      <TitleRail title="Browse by genre" videos={extras.genres} variant="rail" />
      <TitleRail title="History" videos={savedRows.history} variant="rail" playedAt={savedRows.playedAt} />
      {publicFolders.map(folder => <TitleRail key={folder.id} title={`${folder.name} · local source`} videos={extras.folders.get(folder.id) ?? EMPTY_ROWS} variant="rail" onTitleClick={() => useLibrary.getState().setSource(folder.id)} />)}
    </div>}
  </div>;
}
