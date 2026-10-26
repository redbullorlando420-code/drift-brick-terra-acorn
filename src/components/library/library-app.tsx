import { getTopicAliasRevision } from '@/lib/videos/topic-aliases';
import { MovieRuntimeRepair } from './movie-runtime-repair';
import { TwitchLiveCheckStatus } from './twitch-live-check-status';
import { useYoutubeLiveRefresh } from './use-youtube-live-refresh';
import { YoutubeLiveCheckStatus } from './youtube-live-check-status';
import { useTwitchVodRanking } from './use-twitch-vod-ranking';
import { useTwitchCatalogOrder } from './use-twitch-catalog-order';
import { useTwitchMix } from './use-twitch-mix';
import { TwitchContentControls } from './twitch-content-controls';
import type { TwitchContentFilter } from '@/lib/videos/twitch-content';
import { useTwitchSavedCatalog, useTwitchCatalogFilter, useTwitchTopicCatalog, useCatalogSelection } from './use-twitch-saved-catalog';
import type { TwitchSavedFilter } from '@/lib/videos/twitch-saved-catalog';
import { useFavoriteRails } from './use-favorite-rails';
import { useContinueInsights } from './use-continue-insights';
import { rememberVideo } from '@/lib/videos/video-lookup';
import { getPullSettings } from '@/lib/pull-settings';
import { setRenderBudgetMonitoring } from '@/lib/render-budget';
import { registerPeriodicTask, wakePeriodicTasks } from '@/lib/periodic-work';
import { HUB_SOURCES, navigationSourceLabel } from '@/lib/library-navigation';
import { youtubeCooldownMessage } from '@/lib/remote/youtube-pull-feedback';
import { nextRemoteRefresh } from '@/lib/remote/background-refresh';
import { LandingShelves } from './landing-shelves';
import { YoutubeCleanupStatus } from './youtube-cleanup-status';
import { TwitchArchiveCreators } from './twitch-archive-creators';
import { useTwitchDeskCatalog } from './use-twitch-desk-catalog';
import { useTwitchLiveRefresh } from './use-twitch-live-refresh';
import { useMovieCatalog } from './use-movie-catalog';
import { useHistoryBrowse } from './use-history-browse';
import { usePrivateShelfIndex, usePrivateShelfOrder } from './use-private-shelves';
import { RankingGuide } from './ranking-panel';
import { catalogPullAvailable, subscribePullAvailability, setActivePullPage, automaticPullAvailable } from '@/lib/pull-control';
import { topicsForVideo } from '@/lib/videos/topics';
import { youtubeCatalogCoverage, youtubeCoverageCounts, youtubeCoverageIndexAsync, youtubeSourceNewest } from '@/lib/remote/youtube-coverage';
import { useYoutubeCoverage } from './use-youtube-coverage';
import { verifiedYoutubeSource } from '@/lib/videos/follow-import';
import { lazy, startTransition, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { hubLoaders, warmHubDesk } from './hub-loader';
import { toast, Toaster } from "sonner";
import { getBrowseLibrarySnapshot, useBrowseLibrary } from './use-browse-library';
import { AlertCircle, CheckCircle2, LoaderCircle, Lock, Shuffle, Upload, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DiscoveryDesk } from "./discovery-desk";
import { LiveCatalog } from "./live-catalog";
import { SidebarNav } from "./sidebar";
import { DesktopSidebar, desktopSidebar } from "./desktop-sidebar";
import { LightHome } from "./light-home";
import { FavoriteCollections } from "./favorite-collections";
import { SearchWorkerRecovery } from "./search-worker-recovery";
import { TopBar } from "./top-bar";
import { useDesktopLayout } from "@/lib/use-desktop-layout";
import { shortcutBlocked, shortcutEnabled } from "@/lib/keyboard-commands";
import { sidebarShortcut } from "@/lib/sidebar-state";
import { InviteStrip } from "./invite";
import { VideoGrid } from "./video-grid";
import { VideoCard } from "./video-card";
import { Billboard, PosterGrid, TitleRail } from "./browse";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import { selectYoutubeSweepChannels } from "@/lib/remote/youtube-sweep";
import { Input } from "@/components/ui/input";
import { ADULT_PULL_PROVIDERS, isAdultImageKind } from "@/lib/videos/adult-sites";
import { ADULT_SOURCE_FILTERS, countAdultBySource, videoMatchesAdultSource, videoMatchesAdultTag } from "@/lib/videos/adult-filter";
import { useAdultBrowse } from "./use-adult-browse";
import { warmVideoPreview } from "./video-overlay-loader";
import { VideoOverlays } from "./video-overlays";
import { YoutubeDownloadHost } from './youtube-download-host';
import { YoutubePublicationControl } from './youtube-publication-control';
import { getPullCancellationRevision, pullsPaused, subscribePullControl, waitForCatalogCommit } from "@/lib/pull-control";
import { buildAdultStatsSnapshot, exportAdultStats } from "@/lib/videos/adult-stats";
import { useAdultPulls } from "./use-adult-pulls";
import { ConnectPanel } from "./connect-panel";
import { ProviderPullPanel } from './provider-pull-panel';
import { TwitchClipsControl } from "./twitch-clips-control";
import { MovieDesk } from "./movie-desk";
import { YoutubeOfflineAudit } from "./youtube-offline-audit";
import { FollowManager } from "./follow-manager";
type AdultModule = typeof import("./adult-panel");
let adultModulePromise: Promise<AdultModule> | undefined;
const loadAdult = (): Promise<AdultModule> => adultModulePromise ??= import("./adult-panel").catch((error) => {
  adultModulePromise = undefined;
  throw error;
});
const AdultPanel = lazy(async () => ({ default: (await loadAdult()).AdultPanel }));
const AdultFetishExplorer = lazy(async () => ({ default: (await loadAdult()).AdultFetishExplorer }));
const AiGuide = lazy(async () => ({ default: (await import("./ai-guide")).AiGuide }));
const TwitchArchiveSearch = lazy(() => import('./twitch-archive-search'));
const AnimeSection = lazy(hubLoaders.anime);
const GamesSection = lazy(hubLoaders.games);
const FindPhoneSection = lazy(hubLoaders['find-phone']);
const GenreSection = lazy(hubLoaders.genres);
const LanConnectionSection = lazy(hubLoaders.connection);
const MissionPlanSection = lazy(hubLoaders['mission-plan']);
const PhotosSection = lazy(hubLoaders.photos);
const PrivateWebShortcuts = lazy(hubLoaders['private-web']);
const PrintsSection = lazy(hubLoaders.prints);
const SettingsSection = lazy(hubLoaders.settings);
const StatsSection = lazy(hubLoaders.stats);
const ShopSection = lazy(hubLoaders.shop);
const SocialSection = lazy(hubLoaders.social);
const SpotifySection = lazy(hubLoaders.spotify);
const StreamingSection = lazy(hubLoaders.streaming);
const StreamSignalSection = lazy(hubLoaders['stream-signal']);
const StableDiffusionSection = lazy(hubLoaders['stable-diffusion']);
const RemoteDesktopSection = lazy(hubLoaders['remote-desktop']);
const WatchRoomSection = lazy(hubLoaders['watch-room']);
import {
  trimCatalogSelectorCaches,
  selectClassics,
  selectContinue,
  selectFavorites,
  selectHistory,
  selectAdultRemote,
  selectLive,
  resumeForVideo,
  selectTwitch,
  selectVisible,
  selectYoutube,
  useLibrary,
  userFolderCount,
} from "@/lib/videos/store";
import { DEMO_FOLDER_ID } from "@/lib/videos/samples";
import type { LibraryVideo, ProviderFailure, WellKnownStart, VideoMetadataProvenance } from "@/lib/videos/types";
import { hasFreshViewerCount } from "@/lib/videos/types";
import { useThumbs } from "@/lib/videos/thumbs";
import { ensureImageBudgetVisibilityHook } from "@/lib/videos/image-load-budget";
import { hasAdultThumb, adultThumbCandidatesForVideo } from "@/lib/videos/adult-thumbs";
import { searchCatalog } from "@/lib/videos/search-index";
import { searchWorkerIndex } from "@/lib/videos/search-worker-index";
import { useSearchRanking } from "./use-search-ranking";
import { isExcludedDemoVideo } from '@/lib/videos/youtube-browse';
import { YoutubeFormatControls, useYoutubeFormats } from './youtube-format-controls';
import { forEachCatalogSlice, yieldCatalogTask } from "@/lib/catalog-work";
import { importLibraryPackZip } from "@/lib/videos/library-pack";
import { linksFromHistoryAndResume } from "@/lib/videos/persist";
import { getHeartedTagHistory, getRating, ratingPreference, tagHasHeartHistory, tagIsLiked } from "@/lib/media-feedback";
import { announceNetworkPresence } from "@/lib/network-presence";
import { nextLikelyHub, shouldWarmHubRoute } from "@/lib/warm-route-cache";
import { getPerformanceProfile } from '@/lib/performance-profile';
import { scheduleBackgroundWork } from "@/lib/interaction-budget";
import { allowAutomaticRefresh, trackSessionActivity } from "@/lib/session-activity";
import { trimObjectUrls } from "@/lib/videos/sources";
import { clearLowPriorityImageQueue } from "@/lib/videos/image-load-budget";
import type { PullProvider } from "@/lib/remote/pull-ledger";
import { useYoutubeExploreShelves, useYoutubePrimaryShelves, useYoutubeTopics, useYoutubeWatchedCreators } from './use-youtube-shelves';
import { useSettledTags } from './use-settled-tags';
import { useYoutubeRanking } from "./use-youtube-ranking";
import { YoutubeDeepDiscovery } from "./youtube-deep-discovery";
import { getYoutubeFirstClickTrace, getYoutubeTraceRevision, markYoutubeSelectorReady, subscribeYoutubeTrace } from "@/lib/youtube-first-click-trace";

const EMPTY_MOVIE_PROVENANCE: Record<string, VideoMetadataProvenance> = {};
const EMPTY_ADULT_VIDEOS: LibraryVideo[] = [];
const EMPTY_PROVIDER_VIDEOS: LibraryVideo[] = [];


const YOUTUBE_SWEEP_KEY = "reelcase.youtube-catalog-sweep.v1";
let youtubeSweepLastAttemptAt = 0;
let twitchLastAttemptAt = 0;
let youtubeRecentLastAttemptAt = 0;

const pullProviderLabel: Record<PullProvider, string> = { youtube: "YouTube", twitch: "Twitch", adult: "Adult sources", photos: "Photo sources", multi: "Multiple sources" };

// Only these small controls wake at the deadline. Avoid a ticking clock that
// re-ranks and re-renders the entire large-library page.
function useYoutubeCoolingDown(retryAt?: number) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    setNow(Date.now());
    if (!retryAt || retryAt <= Date.now()) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(2_147_483_647, retryAt - Date.now() + 20));
    return () => clearTimeout(timer);
  }, [retryAt]);
  return Boolean(retryAt && retryAt > now);
}

function YoutubeCatalogPullButton({ retryAt, busy, pulling, empty, onPull }: { retryAt?: number; busy: boolean; pulling: boolean; empty: boolean; onPull: () => void }) {
  const cooling = useYoutubeCoolingDown(retryAt);
  return <Button disabled={busy || pulling || empty} onClick={onPull}>{pulling ? "Pulling creator batch…" : busy ? "Another pull is running…" : cooling ? "Force pull now" : "Pull next creator batch"}</Button>;
}

function YoutubeProviderStatus({ retryAt, error }: { retryAt?: number; error?: string }) {
  const cooling = useYoutubeCoolingDown(retryAt);
  if (!cooling && !error) return null;
  return <div role="status" className="border-t border-border px-5 py-3 text-sm leading-6 text-accent sm:px-7">
    <p>{cooling ? youtubeCooldownMessage(retryAt!, error) : `Last provider result: ${error}`}</p>
    {retryAt && <p className="text-xs text-muted">{cooling ? "Force pull now checks YouTube again immediately. A fresh provider rejection stops that batch. Recent upload feeds keep checking when available while archive pulls wait." : "The recommended wait has ended. Pull the next batch to check whether YouTube has recovered."}</p>}
  </div>;
}

function YoutubeFirstClickStatus() {
  useSyncExternalStore(subscribeYoutubeTrace, getYoutubeTraceRevision, () => 0);
  const trace = getYoutubeFirstClickTrace();
  return <div className="border-t border-border px-5 py-3 text-xs leading-5 text-muted sm:px-7" aria-label="YouTube first-click timing">
    <p className="font-medium text-fg">First-click timing · local only</p>
    <p>{!trace ? "Open YouTube from another section to record a timing sample." : <>
      {trace.railReadyMs === undefined ? "Waiting for the first available upload" : `${trace.railReadyMs}ms to ${trace.railCards} usable cards`}
      {` · selector ${trace.selectorMs ?? "…"}ms work / ${trace.selectorReadyMs ?? "…"}ms ready · ${trace.catalogRows ?? 0} cached`}
      {trace.preparationMs !== undefined && ` · preparation ${trace.preparationMs}ms elapsed / ${trace.preparationYields} yields`}
      {` · artwork ${trace.artwork === "pending" ? "pending" : trace.artwork === "loaded" ? `${trace.artworkWaitMs ?? 0}ms later` : "deferred or unavailable"}`}
      {` · provider ${trace.provider === "idle" ? "not needed" : `${trace.providerOverlapMs}ms overlap`}`}
    </>}</p>
  </div>;
}

function PullStatusBanner() {
  const paused = useSyncExternalStore(subscribePullControl, pullsPaused, () => false);
  const activity = useLibrary((state) => state.pullActivity);
  const latest = useLibrary((state) => state.pullHistory[0] ?? null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const id = activity?.id ?? latest?.id;
  if (!id || dismissed === id) return null;
  const running = Boolean(activity);
  const cancelled = !running && latest?.errors?.some(error => /^Pull cancelled[.;]/i.test(error));
  const item = activity ?? latest!;
  const label = pullProviderLabel[item.provider];
  const percent = running ? Math.min(100, Math.round(item.done / Math.max(1, item.total) * 100)) : 100;
  return <section className="mb-5 rounded-lg border border-border bg-elevated px-4 py-3 shadow-border" role={running ? "status" : "region"} aria-label="Latest pull status">
    <div className="flex items-start gap-3">
      {running ? <LoaderCircle aria-hidden="true" className={`mt-0.5 size-4 shrink-0 text-accent ${paused ? "" : "animate-spin"}`} /> : latest?.status === "failed" ? <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" /> : <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />}
      <div className="min-w-0 flex-1"><p className="text-sm font-medium text-fg">{running ? `Pulling ${label} · ${item.action.toLocaleLowerCase()}` : `${label} pull ${cancelled ? "cancelled" : latest?.status === "failed" ? "failed" : latest?.status === "partial" ? "finished with issues" : "complete"}`}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{running ? `${item.done.toLocaleString()} of ${item.total.toLocaleString()} targets checked · ${item.received.toLocaleString()} videos returned · ${item.added.toLocaleString()} new · ${item.failed.toLocaleString()} failed${item.targets[item.done] ? ` · Now: ${item.targets[item.done]}` : ""}` : `${latest?.done.toLocaleString() ?? 0} / ${latest?.total.toLocaleString() ?? 0} targets · ${latest?.received.toLocaleString() ?? 0} returned · ${latest?.added.toLocaleString() ?? 0} new · ${latest?.failed.toLocaleString() ?? 0} failed · ${latest ? new Date(latest.finishedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}`}</p>
        {paused && <p className="mt-2 text-xs text-accent">Automatic pulls and archive requests are paused. One-shot live checks you start manually can still run; select Resume pulls to continue queued work.</p>}
        {running && <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg"><div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${percent}%` }} /></div>}
        {!running && latest?.errors?.length ? <details className="mt-2 text-xs text-muted"><summary className="cursor-pointer">{cancelled ? "Show cancellation details" : `Show ${latest.errors.length} failure detail${latest.errors.length === 1 ? "" : "s"}`}</summary><ul className="mt-2 space-y-1">{latest.errors.map((error, index) => <li key={`${index}:${error}`}>{error}</li>)}</ul></details> : null}
      </div>
      {!running && <Button variant="ghost" size="icon-sm" onClick={() => setDismissed(id)} aria-label="Dismiss pull result"><X aria-hidden="true" className="size-4" /></Button>}
    </div>
  </section>;
}

function canonicalAdultTag(raw: string): string {
  const normalized = raw
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return !normalized || normalized === "all" ? "All" : normalized;
}

function shuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
}
/**
 * Adult catalog quality still leads, but each rail gets a time-stamped shuffle
 * inside a bounded rank window. That rotates fresh cards into view without
 * letting low-signal results displace the useful part of the catalog.
 */
function rotateAdultRail<T extends { id: string }>(items: T[], rail: string, seed: number, limit = items.length): T[] {
  // A title can move at most 28 positions: later entries cannot reach this prefix.
  return items.slice(0, limit + 28)
    .map((video, index) => ({
      video,
      rank: index + (shuffleRank(`${rail}:${video.id}`, seed) / 0xffffffff) * 28,
    }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map(({ video }) => video);
}
function diversifyCreators<T extends { id: string; remote?: { channelName?: string } }>(items: T[], limit = 48): T[] {
  const groups = new Map<string, T[]>();
  const seenIds = new Set<string>();
  for (const item of items) {
    // Provider retries can retain a card while a refreshed duplicate arrives.
    // Deduplicate before round-robin so one tag shelf never renders a title twice.
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    const key = item.remote?.channelName?.trim().toLowerCase() || "local";
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  const rows = [...groups.values()];
  const result: T[] = [];
  // Round-robin keeps a high-view creator represented without allowing one
  // channel to occupy an entire discovery/topic rail.
  for (let index = 0; result.length < limit; index += 1) {
    let added = false;
    for (const group of rows) {
      const item = group[index];
      if (!item) continue;
      result.push(item);
      added = true;
      if (result.length >= limit) break;
    }
    if (!added) break;
  }
  return result;
}

// Bundled demonstration media stays out of personal discovery and provider
// shelves. Real local and followed media must always take precedence.
function isOfflineChannelCard(video: { id?: string; path?: string; extension?: string; remote?: { kind?: string; live?: boolean }; tagline?: string }) {
  if (video.remote?.kind !== "twitch" || video.remote.live) return false;
  // Old cache versions did not all use the same display copy. The durable
  // record shape is the reliable signal: a non-live Twitch channel/live card
  // is an offline placeholder, while VODs and clips have a video id/path.
  return /^offline\b/i.test(video.tagline ?? "")
    || video.extension === "live"
    || /\/(?:live|channel)$/i.test(video.path ?? "")
    || /:(?:live|channel)$/i.test(video.id ?? "");
}

function isFreshRemoteUpload(video: { addedAt: number }) {
  // A channel can be imported for the first time with years of feed history.
  // Alert only for a genuinely recent provider-published item, not every item
  // that happened to enter our cache during this refresh.
  const age = Date.now() - video.addedAt;
  return age >= -5 * 60_000 && age <= 14 * 24 * 60 * 60_000;
}

export function LibraryApp() {
  useEffect(() => {
    const sync = () => {
      try {
        setRenderBudgetMonitoring(localStorage.getItem('reelcase.debug-panel') === 'true');
        document.documentElement.dataset.artworkMode = localStorage.getItem('reelcase.artwork-mode') === 'text' ? 'text' : 'images';
      }
      catch { setRenderBudgetMonitoring(false); }
    };
    const storage = (event: StorageEvent) => { if (event.key === 'reelcase.debug-panel' || event.key === 'reelcase.artwork-mode' || event.key === null) sync(); };
    sync(); window.addEventListener('reelcase:diagnostics-settings', sync); window.addEventListener('storage', storage);
    return () => { window.removeEventListener('reelcase:diagnostics-settings', sync); window.removeEventListener('storage', storage); setRenderBudgetMonitoring(false); };
  }, []);
  const [sessionIdle, setSessionIdle] = useState(false);
  useEffect(() => trackSessionActivity(() => {
    setSessionIdle(true);
    clearLowPriorityImageQueue();
    useThumbs.getState().trimMemory();
    const { activeId, previewId } = useLibrary.getState();
    trimObjectUrls([activeId, previewId].filter((id): id is string => Boolean(id)));
    searchWorkerIndex.release();
    trimCatalogSelectorCaches(getBrowseLibrarySnapshot());
    useLibrary.setState({ searchResult: null });
  }, () => setSessionIdle(false)), []);
  useEffect(() => {
    return registerPeriodicTask({ name: 'Network presence', everyMs: 25_000, firstMs: 0,
      work: () => announceNetworkPresence(), onError: () => {} }).cancel;
  }, []);

  useEffect(() => {
    const failed = () => toast.error("Library changes could not be saved. Browser storage is unavailable or full.");
    window.addEventListener("reelcase:save-error", failed);
    return () => window.removeEventListener("reelcase:save-error", failed);
  }, []);
  const dirInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAdult = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopLayout = useDesktopLayout();
  useEffect(() => {
    if (desktopLayout) setMenuOpen(false);
    const shortcut = (event: KeyboardEvent) => {
      const editing = event.target instanceof Element && Boolean(event.target.closest("input,textarea,select,[contenteditable]:not([contenteditable='false'])"));
      if (useLibrary.getState().activeId || useLibrary.getState().previewId) return;
      if (!shortcutBlocked(event) && shortcutEnabled("sidebar") && sidebarShortcut(event, editing)) {
        event.preventDefault();
        if (desktopLayout) desktopSidebar.toggle(); else setMenuOpen(current => !current);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [desktopLayout]);
  const [dragging, setDragging] = useState(false);
  const [movieShuffle, setMovieShuffle] = useState(() => Date.now());
  const [homePickShuffle, setHomePickShuffle] = useState(() => Date.now());
  const aliasRevision = getTopicAliasRevision();
  const [ratingRevision, setRatingRevision] = useState(0);
  const [tagHeartRevision, setTagHeartRevision] = useState(0);
  const [adultTag, setAdultTag] = useState("All");
  const [adultSource, setAdultSource] = useState("all");
  const [adultView, setAdultView] = useState<"all" | "videos" | "live" | "photos">("all");
  const [adultArtworkOnly, setAdultArtworkOnly] = useState(true);
  // Keep the first Adult paint deliberately small; each rail can expand on demand.
  const [adultRailLimit, setAdultRailLimit] = useState(24);
  const [adultTagQuery, setAdultTagQuery] = useState("");
  /** Visible ranked tag chips — starts small; Show more adds a page, never dumps hundreds. */
  const [adultTagVisibleCount, setAdultTagVisibleCount] = useState(10);
  const [adultExplorerTag, setAdultExplorerTag] = useState("");
  const [adultRailSeed, setAdultRailSeed] = useState(() => Date.now() >>> 0);
  const [adultSort, setAdultSort] = useState<"recent" | "name" | "favorites" | "tagged" | "played" | "ranked">("ranked");
  const [twitchExploreVisible, setTwitchExploreVisible] = useState(false);
  const [twitchCatalogVisible, setTwitchCatalogVisible] = useState(false);
  const [twitchCoverageVisible, setTwitchCoverageVisible] = useState(false);
  const [twitchSort, setTwitchSort] = useState<"mix" | "live" | "viewers" | "name">("mix");
  const [twitchContentFilter, setTwitchContentFilter] = useState<TwitchContentFilter>('all');
  const [twitchFilter, setTwitchFilter] = useState<TwitchSavedFilter>("all");
  const [twitchPullNotice, setTwitchPullNotice] = useState('');
  const [twitchMixSeed, setTwitchMixSeed] = useState(() => Math.floor(Math.random() * 0x7fffffff));
  const [twitchClipOrder, setTwitchClipOrder] = useState<'shuffle'|'newest'|'views'>('newest');
  const [twitchClipSeed, setTwitchClipSeed] = useState(1);
  const [twitchClipCreator, setTwitchClipCreator] = useState("all");
  const [youtubeTagFilter, setYoutubeTagFilter] = useState("all");
  const [youtubeTagsExpanded, setYoutubeTagsExpanded] = useState(false);
  const [youtubeExploreVisible, setYoutubeExploreVisible] = useState(false);
  const [youtubeDeepVisible, setYoutubeDeepVisible] = useState(false);
  const [youtubeHealthVisible, setYoutubeHealthVisible] = useState(false);
  const [youtubeHealthLimit] = useState(48);
  const [adultDeepVisible, setAdultDeepVisible] = useState(false);

  const [twitchArchiveSearchVisible, setTwitchArchiveSearchVisible] = useState(false);
  const [twitchTagFilter, setTwitchTagFilter] = useState("all");
  const [historyWindow, setHistoryWindow] = useState<"all" | "day" | "week">("all");
  const [historySource, setHistorySource] = useState<"all" | "open" | "progress" | "watch-room">("all");
  const [historyRetention, setHistoryRetention] = useState<"forever" | "week" | "month" | "year">("forever");
  const [historyImportNote, setHistoryImportNote] = useState("");

  const [homeRecommendationsReady, setHomeRecommendationsReady] = useState(false);
  // Invitation URLs are intentionally promoted after hydration. Reading the
  // browser URL during the initial render made an SSR Home shell disagree
  // with the client-side Watch Room tree on every shared theater link.
  const [invitedToTheater, setInvitedToTheater] = useState(false);
  const [remoteRefreshMs, setRemoteRefreshMs] = useState(() => {
    try { const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30"); return [15, 30, 60, 120, 300].includes(seconds) ? seconds * 1_000 : 30_000; }
    catch { return 30_000; }
  });

  const restoreFolders = useBrowseLibrary((s) => s.restoreFolders);
  const openVideo = useBrowseLibrary((s) => s.openVideo);
  const addFolder = useBrowseLibrary((s) => s.addFolder);
  const ingestFromInput = useBrowseLibrary((s) => s.ingestFromInput);
  const ingestDrop = useBrowseLibrary((s) => s.ingestDrop);
  const clearHistory = useBrowseLibrary((s) => s.clearHistory);
  const pruneHistory = useBrowseLibrary((s) => s.pruneHistory);
  const folders = useBrowseLibrary((s) => s.folders);
  // Only subscribe the whole application to catalog identity while a screen
  // needs the raw array. In common browse/player/workspace paths this prevents
  // every appended library batch from rerendering the full shell.
  const catalogVideos = useBrowseLibrary((s) =>
    (s.query.trim() && !HUB_SOURCES.has(s.sourceId)) || s.sourceId === "movies"
      ? s.videos
      : EMPTY_PROVIDER_VIDEOS,
  );
  const hiddenVideos = useBrowseLibrary((s) => s.hiddenVideos);
  const unavailable = useBrowseLibrary((s) => s.unavailable);
  const sourceId = useBrowseLibrary((s) => s.sourceId);
  useEffect(() => { if (sourceId !== "twitch") { setTwitchExploreVisible(false); setTwitchCatalogVisible(false); setTwitchCoverageVisible(false); } }, [sourceId]);
  const requestedSource = useLibrary((s) => s.sourceId);
  const navigationPending = requestedSource !== sourceId;
  useEffect(() => {
    if (sourceId !== "youtube" && sourceId !== "twitch" && sourceId !== "adults") return;
    return scheduleBackgroundWork(warmVideoPreview, { timeoutMs: 1200, fallbackDelayMs: 250 });
  }, [sourceId]);
  const setSource = useBrowseLibrary((s) => s.setSource);
  const hydrated = useBrowseLibrary((s) => s.hydrated);
  const refreshing = useBrowseLibrary((s) => s.refreshing);
  const remoteBusy = useBrowseLibrary((s) => s.remoteBusy);
  const query = useBrowseLibrary((s) => s.query);
  const searchResult = useBrowseLibrary((s) => s.searchResult);
  const searchMatchPending = useBrowseLibrary((s) => Boolean(s.query.trim()) && (!s.searchResult || s.searchResult.query !== s.query.trim().toLowerCase() || s.searchResult.videos !== s.videos || s.searchResult.tags !== s.tags || s.searchResult.categories !== s.categories));
  const setQuery = useBrowseLibrary((s) => s.setQuery);
  const showHiddenAdult = useBrowseLibrary((s) => s.showHiddenAdult);
  const setShowHiddenAdult = useBrowseLibrary((s) => s.setShowHiddenAdult);
  const applyAdultTag = useCallback((raw: string) => {
    const tag = canonicalAdultTag(raw);
    // A tag is a complete browsing intent. Reset narrowing controls that can
    // hide every valid match, so a tap always produces an immediate result.
    setAdultTag(tag);
    setAdultSource(tag.startsWith("source-") ? tag.slice("source-".length) || "all" : "all");
    setAdultView("all");
    setAdultArtworkOnly(false);
    setAdultTagVisibleCount(10);
    setQuery("");
    setSource("adults");
  }, [setQuery, setSource]);
  const scanning = useBrowseLibrary((s) => s.scanning);
  const history = useBrowseLibrary((s) => s.history);
  // Workspace hubs select their own data. Sorting the public catalog for
  // Settings/Photos/etc. made unrelated navigation stall at 100k+ entries.
  // Memoized catalog selectors return stable immutable arrays. Comparing their
  // entries again allocates full Maps in Zustand's shallow comparator.
  const videos = useBrowseLibrary(s => s.query.trim() || HUB_SOURCES.has(s.sourceId) || ((!s.query.trim()) &&
    (s.sourceId === "home" || s.sourceId === "movies" || s.sourceId === "youtube" ||
     s.sourceId === "adults" || s.sourceId === "adult-fetishes"))
    ? EMPTY_PROVIDER_VIDEOS : selectVisible(s));
  const continueVideos = useBrowseLibrary((s) =>
    !s.query.trim() && (s.sourceId === "continue")
      ? selectContinue(s, false)
      : EMPTY_PROVIDER_VIDEOS,
  );
  const favoriteVideos = useBrowseLibrary((s) =>
    !s.query.trim() && (s.sourceId === "favorites")
      ? selectFavorites(s, false)
      : EMPTY_PROVIDER_VIDEOS,
  );
  const historyVideos = useBrowseLibrary((s) =>
    !s.query.trim() && (s.sourceId === "history")
      ? selectHistory(s, false)
      : EMPTY_PROVIDER_VIDEOS,
  );
  const classics = useBrowseLibrary(s => !s.query.trim() && s.sourceId === "classics" ? selectClassics(s) : EMPTY_PROVIDER_VIDEOS);
  const youtubeSelectorWork = useRef(0);
  const youtubeSelectorDoneAt = useRef(0);
  const youtubeCatalog = useBrowseLibrary((state) => {
    if (state.query.trim() || (state.sourceId !== "landing" && state.sourceId !== "youtube")) return EMPTY_PROVIDER_VIDEOS;
    const started = typeof performance === "undefined" ? 0 : performance.now();
    const selected = selectYoutube(state);
    if (state.sourceId === "youtube" && started) {
      const finished = performance.now();
      youtubeSelectorWork.current = Math.max(youtubeSelectorWork.current, finished - started);
      youtubeSelectorDoneAt.current = finished;
    }
    return selected;
  });
  useEffect(() => {
    if (sourceId !== "youtube") { youtubeSelectorWork.current = 0; youtubeSelectorDoneAt.current = 0; return; }
    markYoutubeSelectorReady(youtubeCatalog.length, youtubeSelectorWork.current, youtubeSelectorDoneAt.current || undefined);
    youtubeSelectorWork.current = 0;
    youtubeSelectorDoneAt.current = 0;
  }, [sourceId, youtubeCatalog]);
  const youtubeFormats = useYoutubeFormats(youtubeCatalog, sourceId === 'youtube');
  const youtubeVideos = youtubeFormats.videos;
  // selectYoutube already returns date ordering. Avoid an unnecessary second
  // full-array sort whenever a rating or thumbnail state changes.
  const newestYoutube = youtubeVideos;
  const twitchVideos = useBrowseLibrary((state) => !state.query.trim() && (state.sourceId === "landing" || state.sourceId === "twitch") ? selectTwitch(state) : EMPTY_PROVIDER_VIDEOS);
  const liveVideos = useBrowseLibrary(s => !s.query.trim() && (s.sourceId === "landing" || s.sourceId === "live") ? selectLive(s) : EMPTY_PROVIDER_VIDEOS);
  const adultContinue = useBrowseLibrary((s) => !s.query.trim() && ["adults", "adult-fetishes", "continue", "history"].includes(s.sourceId) ? selectContinue(s, true) : EMPTY_PROVIDER_VIDEOS);
  const adultFavorites = useBrowseLibrary((s) => !s.query.trim() && ["adults", "adult-fetishes", "favorites"].includes(s.sourceId) ? selectFavorites(s, true) : EMPTY_PROVIDER_VIDEOS);
  const adultHistory = useBrowseLibrary((s) => !s.query.trim() && ["adults", "adult-fetishes", "continue", "history"].includes(s.sourceId) ? selectHistory(s, true) : EMPTY_PROVIDER_VIDEOS);
  const adultRemoteVideos = useBrowseLibrary(s => s.sourceId === "adults" || s.sourceId === "adult-fetishes" ? selectAdultRemote(s) : EMPTY_PROVIDER_VIDEOS);
  const cameCounts = useBrowseLibrary((s) => s.cameCounts);
  const hasUserFolders = userFolderCount(folders) > 0;
  const adultFolders = useMemo(() => folders.filter((f) => f.adult), [folders]);
  const tags = useBrowseLibrary((s) => s.tags);
  const follows = useBrowseLibrary((s) => s.follows);
  // Adult history is a private, tagged record. An old generic recovery entry
  // may still exist in durable history, but it cannot appear here unless it
  // carries the explicit #adult contract.
  const adultHistoryTagged = useMemo(
    () => adultHistory.filter((video) => (tags[video.id] ?? []).includes("adult")),
    [adultHistory, tags],
  );
  const markedAdult = useMemo(
    () =>
      [...adultRemoteVideos.filter((video) => (cameCounts[video.id] ?? 0) > 0)].sort(
        (a, b) => (cameCounts[b.id] ?? 0) - (cameCounts[a.id] ?? 0),
      ),
    [adultRemoteVideos, cameCounts],
  );
  const sourceMatchedAdult = useMemo(
    () => adultRemoteVideos.filter((video) => videoMatchesAdultSource(video, adultSource)),
    [adultRemoteVideos, adultSource],
  );
  const adultKind = (video: typeof adultRemoteVideos[number]) => video.remote?.live || ["chaturbate", "myfreecams"].includes(video.remote?.kind ?? "")
    ? "live" as const
    : isAdultImageKind(video.remote?.kind, video.mime, video.extension) ? "photos" as const
    : "videos" as const;
  const viewMatchedAdult = useMemo(
    () => adultView === "all" ? sourceMatchedAdult : sourceMatchedAdult.filter((video) => adultKind(video) === adultView),
    [adultSource, adultView, sourceMatchedAdult],
  );
  const filteredEporner = useMemo(
    () => viewMatchedAdult
      .filter((video) => videoMatchesAdultTag(video, adultTag, tags))
      .filter((video) => !adultArtworkOnly || hasAdultThumb(video)),
    [adultArtworkOnly, adultTag, tags, viewMatchedAdult],
  );
  const adultArtworkReadyCount = useMemo(
    () => viewMatchedAdult.filter((video) => hasAdultThumb(video)).length,
    [viewMatchedAdult],
  );
  const adultSourceCounts = useMemo(() => countAdultBySource(adultRemoteVideos), [adultRemoteVideos]);
  const adultKindCounts = useMemo(() => ({
    videos: adultRemoteVideos.filter((video) => adultKind(video) === "videos").length,
    live: adultRemoteVideos.filter((video) => adultKind(video) === "live").length,
    photos: adultRemoteVideos.filter((video) => adultKind(video) === "photos").length,
  }), [adultRemoteVideos]);
  const historyBrowse = useHistoryBrowse(sourceId === 'history' && !navigationPending,
    history, historyVideos, tags, historySource, historyWindow);
  const historyTopTags = historyBrowse.topTags, historyRecovery = historyBrowse.index.recovery;
  const historyLastDay = historyBrowse.index.history === history ? historyBrowse.index.lastDay : '…';
  const importHistoryRecovery = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip,.json,.csv,application/zip,application/json,text/csv";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!window.confirm("Merge this Realhub recovery pack? Existing activity is kept and duplicate entries are ignored.")) return;
      void importLibraryPackZip(file, {
        getFollows: () => useLibrary.getState().follows,
        setFollows: (follows) => useLibrary.setState({ follows }),
        getHistory: () => useLibrary.getState().history,
        setHistory: (history) => useLibrary.setState({ history }),
        getViewCounts: () => useLibrary.getState().viewCounts,
        getCameCounts: () => useLibrary.getState().cameCounts,
        setMarks: (viewCounts, cameCounts) => useLibrary.setState({ viewCounts, cameCounts }),
        getFavorites: () => Object.keys(useLibrary.getState().favorites),
        getLikes: () => Object.keys(useLibrary.getState().likes),
        setShelves: (favorites, likes) => useLibrary.setState({ favorites: Object.fromEntries(favorites.map((id) => [id, true as const])), likes: Object.fromEntries(likes.map((id) => [id, true as const])) }),
        getProgress: () => useLibrary.getState().progress,
        getResumeProgress: () => useLibrary.getState().resumeProgress,
        setResume: (progress, resumeProgress) => useLibrary.setState({ progress, resumeProgress }),
        getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
        setLinks: () => { /* Persisted by the pack importer. */ },
      }).then((result) => setHistoryImportNote(`Recovered +${result.historyMerged} activity entries · +${result.followsAdded} follows · +${result.linksMerged} saved links${result.feedbackMerged ? " · ratings and hearts merged" : ""}${result.warnings.length ? ` · ${result.warnings[0]}` : ""}.`)).catch((error) => setHistoryImportNote(error instanceof Error ? error.message : "Recovery import failed."));
    };
    input.click();
  };
  const [savedFilter, setSavedFilter] = useState<"all" | "hearts" | "likes">("all");
  // Each saved filter has different row contents. Its keyed grid discards old
  // measurements and avoids a deep comparison of entire catalog props in dev.
  const favorites = useBrowseLibrary((s) => s.favorites);
  const likes = useBrowseLibrary((s) => s.likes);
  const savedSelection = useCatalogSelection(sourceId === 'favorites' && !query.trim() && !navigationPending,
    favoriteVideos, savedFilter === 'hearts' ? 'favorites' : savedFilter, 'all', favorites, likes, tags);
  const savedVideos = savedSelection.rows;
  const viewCounts = useBrowseLibrary((s) => s.viewCounts);

  const privateShelves = usePrivateShelfIndex(sourceId === "adults" && adultDeepVisible && !query.trim() && !navigationPending);
  const adultPersonalVideos = useMemo(() => sourceId === 'adults' || sourceId === 'adult-fetishes' ? [...adultContinue, ...adultFavorites] : EMPTY_ADULT_VIDEOS, [sourceId, adultContinue, adultFavorites]);
  const adultBrowseInputs = useMemo(() => ({
    videos: adultRemoteVideos, personalVideos: adultPersonalVideos, deepVideos: privateShelves.index.videos, tags, favorites, likes, cameCounts, viewCounts,
    continueIds: sourceId === 'adults' || sourceId === 'adult-fetishes' ? adultContinue.map(video => video.id) : [], favoriteIds: sourceId === 'adults' || sourceId === 'adult-fetishes' ? adultFavorites.map(video => video.id) : [],
    ratingRevision, tagHeartRevision,
  }), [adultRemoteVideos, adultPersonalVideos, privateShelves.index.videos, tags, favorites, likes, cameCounts, viewCounts, adultContinue, adultFavorites, ratingRevision, tagHeartRevision, sourceId]);
  const adultBrowseParams = useMemo(() => ({ source: adultSource, tag: adultTag, view: adultView, limit: adultRailLimit, seed: adultRailSeed }), [adultSource, adultTag, adultView, adultRailLimit, adultRailSeed]);
  const adultBrowse = useAdultBrowse(sourceId === "adults" && !navigationPending, adultBrowseInputs, adultBrowseParams, sessionIdle);
  const adultById = useMemo(() => new Map([...adultRemoteVideos, ...adultPersonalVideos].map(video => [video.id, video])), [adultRemoteVideos, adultPersonalVideos]);
  const adultRows = useMemo(() => {
    const resolve = (ids: string[]) => ids.map(id => adultById.get(id)).filter((video): video is typeof adultRemoteVideos[number] => Boolean(video && videoMatchesAdultSource(video, adultSource) && videoMatchesAdultTag(video, adultTag, tags) && (adultView === "all" || adultKind(video) === adultView)));
    const result = adultBrowse.result;
    if (result) return {
      overview: { videos: resolve(result.overview.videos), photos: resolve(result.overview.photos), picks: resolve(result.overview.picks) },
      tagRails: result.tagRails.map(row => ({ ...row, videos: resolve(row.videos) })),
      shelves: {
        recommended: resolve(result.shelves.recommended), related: resolve(result.shelves.related),
        continueRail: resolve(result.shelves.continueRail), marked: resolve(result.shelves.marked),
        reddit: resolve(result.shelves.reddit), latest: resolve(result.shelves.latest),
        catalog: resolve(result.shelves.catalog), poster: resolve(result.shelves.poster),
      },
      live: resolve(result.live),
    };
    // A bounded ingest-order preview is immediately usable, even if workers
    // are unavailable. Full recommendations never run on the input thread.
    const empty = [] as typeof adultRemoteVideos;
    const overview = { videos: [] as typeof empty, photos: [] as typeof empty, picks: [] as typeof empty };
    const live = [] as typeof empty;
    for (const video of filteredEporner) {
      const kind = adultKind(video);
      if (kind === "live") { if (live.length < adultRailLimit) live.push(video); }
      else if (overview[kind].length < adultRailLimit) overview[kind].push(video);
      else if (overview.picks.length < adultRailLimit) overview.picks.push(video);
      if (overview.videos.length >= adultRailLimit && overview.photos.length >= adultRailLimit && overview.picks.length >= adultRailLimit && live.length >= adultRailLimit) break;
    }
    const personal = (list: typeof empty) => list.filter(video => videoMatchesAdultSource(video, adultSource) && videoMatchesAdultTag(video, adultTag, tags) && (adultView === "all" || adultKind(video) === adultView)).slice(0, 24);
    return { overview, tagRails: [], live, shelves: { recommended: filteredEporner.slice(0, adultRailLimit), related: empty, continueRail: personal(adultContinue), marked: personal(markedAdult), reddit: empty, latest: filteredEporner.slice(0, adultRailLimit), catalog: filteredEporner.slice(0, adultRailLimit * 3), poster: filteredEporner.slice(0, adultRailLimit * 6) } };
  }, [adultBrowse.result, adultById, filteredEporner, adultRailLimit, adultContinue, markedAdult, adultSource, adultTag, adultView, tags]);
  const adultOverviewRails = adultRows.overview;
  const adultTopTagRails = adultRows.tagRails;
  const adultShelfRails = adultRows.shelves;
  const adultTagRank = adultBrowse.facets?.tagRank ?? [];
  const adultMetaTagRank = adultBrowse.facets?.metaTagRank ?? [];
  const adultTagMatches = useMemo(() => {
    const needle = adultTagQuery.trim().toLowerCase();
    if (!needle) return adultTagRank;
    return adultTagRank.filter((row) => row.tag.includes(needle) || row.tag.replace(/-/g, " ").includes(needle));
  }, [adultTagQuery, adultTagRank]);
  const heartedAdultTags = useMemo(() => {
    const ranked = new Set(adultTagRank.map((row) => row.tag));
    // Keep hearted tags visible even when they only exist on one title (or were
    // temporarily missing from the ranked chip list).
    return getHeartedTagHistory().filter((tag) => ranked.has(tag) || adultRemoteVideos.some((video) => videoMatchesAdultTag(video, tag, tags)));
  }, [adultRemoteVideos, adultTagRank, tagHeartRevision, tags]);
  const visibleAdultTags = useMemo(() => {
    // Hard cap even while searching — never mount hundreds of chip buttons.
    const page = Math.min(Math.max(10, adultTagVisibleCount), 36);
    return adultTagMatches.slice(0, page);
  }, [adultTagMatches, adultTagVisibleCount]);
  const adultRecommendedRail = adultShelfRails.recommended;
  const adultRelatedRail = adultShelfRails.related;
  const adultContinueRail = adultShelfRails.continueRail;
  const adultMarkedRail = adultShelfRails.marked;
  const adultRedditRail = adultShelfRails.reddit;
  const adultLatestRail = adultShelfRails.latest;
  const adultCatalogRail = adultShelfRails.catalog;
  const adultPosterCatalog = adultShelfRails.poster;
  const adultFeatured = useMemo(
    () => [...adultRecommendedRail, ...adultLatestRail, ...adultRemoteVideos].find((video) => Boolean(video.poster || video.remote?.previewUrl)),
    [adultLatestRail, adultRecommendedRail, adultRemoteVideos],
  );
  const adultExplorerResults = useMemo(() => {
    if (sourceId !== "adult-fetishes") return [];
    const selected = adultExplorerTag.trim();
    const candidates = adultRemoteVideos
      .filter((video) => selected ? (tags[video.id] ?? []).includes(selected) : (tags[video.id] ?? []).some((tag) => tag.startsWith("fetish-")))
      .sort((a, b) => b.addedAt - a.addedAt);
    return rotateAdultRail(candidates, `explorer:${selected || "all"}`, adultRailSeed).slice(0, Math.max(48, adultRailLimit * 2));
  }, [sourceId, adultExplorerTag, adultRailLimit, adultRailSeed, adultRemoteVideos, tags]);

  useEffect(() => {
    setAdultTagVisibleCount(10);
  }, [adultTagQuery, adultSource]);

  useEffect(() => {
    const onAdultTag = (event: Event) => {
      applyAdultTag(String((event as CustomEvent<{ tag?: string }>).detail?.tag ?? ""));
    };
    window.addEventListener("reelcase:adult-tag", onAdultTag);
    return () => window.removeEventListener("reelcase:adult-tag", onAdultTag);
  }, [applyAdultTag]);

  useEffect(() => {
    const load = () => {
      const saved = Number(localStorage.getItem("reelcase.adult-rail-limit") ?? "48");
      setAdultRailLimit([16, 24, 48, 72].includes(saved) ? saved : 24);
    };
    load();
    window.addEventListener("reelcase:adult-render-settings", load);
    return () => window.removeEventListener("reelcase:adult-render-settings", load);
  }, []);

  useEffect(() => {
    if (sourceId !== "adults") return;
    const rotate = () => { if (allowAutomaticRefresh()) setAdultRailSeed(Date.now() >>> 0); };
    rotate();
    // A time-derived seed gives the same catalog a fresh start every few
    // minutes while the ranking still protects highly relevant items.
    return registerPeriodicTask({ name: 'Adult rail rotation', everyMs: 180_000,
      enabled: () => !useLibrary.getState().activeId && !useLibrary.getState().previewId, work: rotate }).cancel;
  }, [sourceId]);

  const youtubeAnalysisTags = useSettledTags(tags, sourceId === 'youtube' && youtubeExploreVisible && !sessionIdle);
  const youtubeTopicInputs = useMemo(() => ({ videos: newestYoutube, tags: youtubeAnalysisTags }), [newestYoutube, youtubeAnalysisTags]);
  const youtubeTopicPreparation = useYoutubeTopics(!navigationPending && sourceId === 'youtube' && youtubeExploreVisible && !sessionIdle, youtubeTopicInputs);
  const youtubeTopics = youtubeTopicPreparation.value;
  const filteredYoutube = useMemo(() => youtubeTagFilter === "all" ? newestYoutube : youtubeTopics?.get(youtubeTagFilter) ?? EMPTY_PROVIDER_VIDEOS, [newestYoutube, youtubeTopics, youtubeTagFilter]);
  const youtubeTagChoices = useMemo(() => [...(youtubeTopics ?? [])].map(([tag, rows]) => ({ tag, count: rows.length }))
    .sort((a, b) => Number(tagIsLiked(b.tag)) - Number(tagIsLiked(a.tag)) || b.count - a.count || a.tag.localeCompare(b.tag)), [youtubeTopics, ratingRevision]);
  const visibleYoutubeTags = useMemo(() => youtubeTagsExpanded ? youtubeTagChoices : youtubeTagChoices.filter((choice, index) => index < 12 || choice.tag === youtubeTagFilter), [youtubeTagChoices, youtubeTagsExpanded, youtubeTagFilter]);
  const youtubePrimaryInputs = useMemo(() => ({ catalog: youtubeVideos, videos: filteredYoutube, follows, seed: homePickShuffle, history: [], viewCounts: {} }), [youtubeVideos, filteredYoutube, follows, homePickShuffle]);
  const youtubeExploreInputs = useMemo(() => ({ ...youtubePrimaryInputs, history, viewCounts }), [youtubePrimaryInputs, history, viewCounts]);
  const youtubeShelvesEnabled = !navigationPending && sourceId === 'youtube' && !sessionIdle;
  const youtubeWatchedInputs = useMemo(() => ({ catalog: youtubeVideos, history }), [youtubeVideos, history]);
  const youtubeWatched = useYoutubeWatchedCreators(youtubeShelvesEnabled, youtubeWatchedInputs);
  const watchedYoutubeCreators = youtubeWatched.value ?? new Set<string>();
  const youtubePrimary = useYoutubePrimaryShelves(youtubeShelvesEnabled, youtubePrimaryInputs);
  const youtubeExplore = useYoutubeExploreShelves(youtubeShelvesEnabled && youtubeExploreVisible, youtubeExploreInputs);
  const youtubeLatest = youtubePrimary.value?.latest ?? EMPTY_PROVIDER_VIDEOS;
  const youtubeMix = youtubePrimary.value?.mix ?? EMPTY_PROVIDER_VIDEOS;
  const youtubeQuick = youtubeExplore.value?.quick ?? EMPTY_PROVIDER_VIDEOS;
  const trendingYoutube = youtubeExplore.value?.trending ?? EMPTY_PROVIDER_VIDEOS;
  const searchDeskActive = !navigationPending && Boolean(query.trim()) && !HUB_SOURCES.has(sourceId) && !sessionIdle;
  const searchRankingInput = useMemo(() => searchDeskActive && !searchMatchPending && searchResult ? ({
    videos: catalogVideos, positions: searchResult.positions, ids: searchResult.ids, query, sourceId, folders, hidden: hiddenVideos, unavailable,
    tags, favorites, likes, viewCounts, ratingOf: getRating, ratingPreference,
  }) : null, [catalogVideos, favorites, folders, hiddenVideos, likes, query, ratingRevision, searchDeskActive, searchMatchPending, searchResult, sourceId, tags, unavailable, viewCounts]);
  const { result: searchInsights, pending: searchRankingPending, error: searchRankingError,
    updated: searchRankingUpdated, refresh: refreshSearchRanking, revision: searchRankingRevision } = useSearchRanking(searchRankingInput);
  const searchPending = searchMatchPending || searchRankingPending || Boolean(query.trim() && sessionIdle);
  const categories = useBrowseLibrary((s) => s.categories);
  const progress = useBrowseLibrary((s) => s.progress);
  const resumeProgress = useBrowseLibrary((s) => s.resumeProgress);
  const favoriteRails = useFavoriteRails(sourceId === 'favorites' && !query.trim() && !navigationPending, favoriteVideos, progress, favorites, likes);
  const savedNotVisible = favoriteRails.ready ? Math.max(0, favoriteRails.savedCount - favoriteVideos.length - adultFavorites.length) : 0;
  const savedFilterCounts = { all: favoriteVideos.length, hearts: favoriteRails.heartsCount, likes: favoriteRails.likesCount };
  const { index: youtubeIdentityHealth, updating: youtubeCoverageUpdating } = useYoutubeCoverage(!navigationPending && (sourceId === 'youtube' || sourceId === 'landing'));
  const youtubeSourceCounts = useMemo(() => youtubeCoverageCounts(youtubeIdentityHealth, follows.filter(channel => channel.kind === 'youtube')), [follows, youtubeIdentityHealth]);
  const youtubeCoverage = useMemo(() => youtubeCatalogCoverage(youtubeIdentityHealth, follows), [follows, youtubeIdentityHealth]);

  const youtubePlaylistShelves = youtubePrimary.value?.playlistShelves ?? [];
  const remoteCheckedAt = useBrowseLibrary((s) => s.remoteCheckedAt);
  const remoteRetryAt = useBrowseLibrary((s) => s.remoteRetryAt);
  const youtubeLiveCheckedAt = useMemo(() => Math.max(0, ...follows.filter((channel) => channel.kind === "youtube").map((channel) => channel.liveCheckedAt ?? 0)), [follows]);
  const youtubeHealth = useMemo(() => {
    if (sourceId !== "youtube" || !youtubeHealthVisible) return [];
    return follows.filter(verifiedYoutubeSource)
      .sort((a, b) => (a.lastCheckedAt ?? 0) - (b.lastCheckedAt ?? 0) || a.title.localeCompare(b.title))
      .slice(0, youtubeHealthLimit).map(channel => ({ ...channel, cached: youtubeSourceCounts.get(channel.id) ?? 0, newest: youtubeSourceNewest(youtubeIdentityHealth, channel), retryAt: remoteRetryAt[channel.id] }));
  }, [follows, remoteRetryAt, sourceId, youtubeHealthLimit, youtubeHealthVisible, youtubeSourceCounts, youtubeIdentityHealth]);
  const continueInsights = useContinueInsights(sourceId === 'continue' && !navigationPending, continueVideos, progress, resumeProgress);
  const movieProvenance = useBrowseLibrary(s => s.sourceId === "movies" ? s.metadataProvenance : EMPTY_MOVIE_PROVENANCE);
  const movies = useMovieCatalog(sourceId === "movies" && !query.trim() && !navigationPending,
    { videos: catalogVideos, folders, hidden: hiddenVideos, unavailable, tags, progress, metadataProvenance: movieProvenance }, movieShuffle);
  const movieCatalog = movies.catalog.videos, randomSourceMovies = movies.ordered.videos;
  const movieOrderSources = useMemo(() => ({ all: () => movies.ordered.videos, modern: () => movies.ordered.modern }), [movies.ordered]);
  const movieShelfSources = useMemo(() => ({ classics: () => movies.catalog.classics,
    genres: movies.catalog.genres.map(shelf => ({ genre: shelf.genre, videos: () => shelf.videos })),
    types: movies.catalog.types.map(shelf => ({ type: shelf.type, count: shelf.videos.length, videos: () => shelf.videos })),
  }), [movies.catalog]);
  const privateOrder = usePrivateShelfOrder(sourceId === "adults" && adultDeepVisible && !query.trim() && !navigationPending && !privateShelves.pending,
    privateShelves.index, adultSort, adultTag, favorites, progress, adultBrowse.deepRankedIds);
  const privateShelfSources = useMemo(() => ({
    organized: () => privateShelves.index.tagged, untagged: () => privateShelves.index.untagged,
    recent: () => privateShelves.index.recent,
    folders: adultFolders.map(folder => ({ folder, videos: () => privateShelves.index.folders.get(folder.id) ?? EMPTY_ADULT_VIDEOS })),
  }), [privateShelves.index, adultFolders]);
  const readPrivateOrder = useCallback(() => privateOrder.rows, [privateOrder.rows]);
  const readPrivateFavorites = useCallback(() => adultFavorites, [adultFavorites]);
  const readPrivateHistory = useCallback(() => adultHistoryTagged, [adultHistoryTagged]);
  const twitchTopics = useTwitchTopicCatalog(sourceId === 'twitch' && twitchExploreVisible, twitchVideos, tags, ratingRevision);
  const freshPicks = sourceId === 'youtube' && youtubeExploreVisible ? youtubeExplore.value?.fresh ?? EMPTY_PROVIDER_VIDEOS : EMPTY_PROVIDER_VIDEOS;
  const twitchCatalog = useTwitchCatalogOrder(twitchVideos, sourceId === "twitch" && twitchCatalogVisible, twitchSort, twitchMixSeed);
  const sortedTwitch = twitchCatalog.rows;
  const twitchSaved = useTwitchSavedCatalog(sourceId === 'twitch', twitchVideos, favorites, likes, viewCounts, ratingRevision);
  const twitchSavedSelection = useTwitchCatalogFilter(sourceId === 'twitch' && twitchCatalogVisible, sortedTwitch, twitchFilter, 'all', favorites, likes, tags, twitchContentFilter);
  const twitchTopicSelection = useTwitchCatalogFilter(sourceId === 'twitch' && twitchCatalogVisible && twitchTagFilter !== 'all', sortedTwitch, twitchFilter, twitchTagFilter, favorites, likes, tags, twitchContentFilter);
  const twitchFilteredCatalog = twitchTagFilter === 'all' ? twitchSavedSelection : twitchTopicSelection;
  // The live clock receives only live rows, so expiry never re-sorts the archive.

  const twitchVodRanking = useTwitchVodRanking(sourceId === "twitch" && twitchExploreVisible, twitchVideos, tags, favorites, likes, viewCounts, ratingRevision);
  const twitchVodPicks = twitchVodRanking.rows;
  const twitchMixedRows = useTwitchMix(sourceId === "twitch" ? twitchVideos : EMPTY_PROVIDER_VIDEOS, twitchMixSeed);
  const twitchBalancedPopular = useTwitchMix(twitchVodPicks, twitchMixSeed, true);
  const twitchFreshRows = useTwitchMix(sourceId === "twitch" && twitchExploreVisible ? twitchVideos : EMPTY_PROVIDER_VIDEOS, twitchMixSeed, false, viewCounts, ratingRevision);
  const twitchDesk = useTwitchDeskCatalog(!navigationPending && sourceId === "twitch" && !query,
    twitchVideos, follows, twitchVodPicks, twitchVideos, twitchMixSeed, twitchClipSeed, twitchClipCreator,
    favorites, likes, viewCounts, ratingRevision, true, twitchExploreVisible && twitchFilter === 'all', !twitchVodRanking.pending, twitchCoverageVisible, twitchClipOrder);
  const twitchLiveRows = twitchDesk.liveRows;
  const twitchArchiveDepth = twitchDesk.coverage;
  const twitchClipTotal = twitchDesk.clipTotal;
  const twitchClips = twitchDesk.clips;
  const twitchVodChannels = twitchDesk.shelves.channels;
  const liveChannelVods = twitchDesk.shelves.live;
  const youtubeRankInputs = useMemo(() => ({ videos: youtubeVideos, candidates: filteredYoutube, tags: youtubeAnalysisTags, history, viewCounts, favorites, likes, cameCounts, revision: ratingRevision }), [youtubeVideos, filteredYoutube, youtubeAnalysisTags, history, viewCounts, favorites, likes, cameCounts, ratingRevision]);
  const youtubeRanking = useYoutubeRanking(!navigationPending && sourceId === "youtube" && youtubeExploreVisible, youtubeRankInputs, homePickShuffle, sessionIdle, youtubeDeepVisible);
  const relatedYoutube = youtubeRanking.recommendations;
  const deeperFromWatchedCreators = youtubeExplore.value?.deeper ?? EMPTY_PROVIDER_VIDEOS;
  const youtubeDiscovery = youtubeExplore.value?.discovery ?? EMPTY_PROVIDER_VIDEOS;
  const channelTagShelves = twitchTopics.shelves;

  useEffect(() => {
    void restoreFolders();
  }, [restoreFolders]);
  useEffect(() => {
    // A return to Home is a new discovery session. Rotate the local ranking
    // even if the app itself stayed mounted in the background.
    if (sourceId === "landing") setHomePickShuffle(Date.now());
  }, [sourceId]);
  useEffect(() => {
    // Leaving a heavy section tears down deferred shelves and speculative
    // decode waiters so the next route does not keep huge arrays or image work.
    ensureImageBudgetVisibilityHook();
    if (sourceId !== "youtube") {
      setYoutubeExploreVisible(false);
      setYoutubeDeepVisible(false);
      setYoutubeHealthVisible(false);
      setYoutubeTagFilter("all");
    }
    if (sourceId !== "adults" && sourceId !== "adult-fetishes") {
      setAdultDeepVisible(false);
      setAdultTagVisibleCount(10);
    }

  }, [sourceId]);
  useEffect(() => {
    if (sourceId !== "landing" || navigationPending) { setHomeRecommendationsReady(false); return; }
    let cancelled = false;
    const ready = () => { if (!cancelled) startTransition(() => setHomeRecommendationsReady(true)); };
    // requestIdleCallback can be postponed indefinitely while a large library
    // paints thumbnails. Yield one frame so the Home shell appears, then
    // continue deterministically instead of making the page look stuck.
    const frame = window.requestAnimationFrame(() => window.setTimeout(ready, 0));
    return () => { cancelled = true; window.cancelAnimationFrame(frame); };
  }, [sourceId, videos.length, navigationPending]);
  useEffect(() => {
    const target = nextLikelyHub(sourceId);
    // The opening Home recommendation pass owns the first interactive frame.
    // Speculative Hub code can wait until that work is ready.
    if (navigationPending || !hydrated || !target || (sourceId === "landing" && !homeRecommendationsReady)) return;

    let cancelled = false;
    let frame: number | undefined;
    let idle: number | undefined;
    let idleCallback = false;
    type RouteNavigator = Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      deviceMemory?: number;
      scheduling?: { isInputPending?: () => boolean };
    };

    const clearScheduled = () => {
      if (typeof frame === "number") window.cancelAnimationFrame(frame);
      if (typeof idle === "number") {
        if (idleCallback) window.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      }
      frame = undefined;
      idle = undefined;
    };
    const warm = () => {
      idle = undefined;
      if (cancelled) return;
      if (getPerformanceProfile().lowMemory) return;
      const nav = navigator as RouteNavigator;
      if (!shouldWarmHubRoute({
        visible: document.visibilityState === "visible",
        saveData: nav.connection?.saveData,
        effectiveType: nav.connection?.effectiveType,
        deviceMemory: nav.deviceMemory,
        inputPending: nav.scheduling?.isInputPending?.(),
      })) return;
      void warmHubDesk(target)?.catch(() => { /* A later navigation retries a failed import. */ });
    };
    const schedule = () => {
      clearScheduled();
      if (cancelled || document.visibilityState !== "visible") return;
      // Yield a paint frame before asking for idle time. The current desk gets
      // first paint and input handling before this low-priority code request.
      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        if (cancelled || document.visibilityState !== "visible") return;
        if (typeof window.requestIdleCallback === "function") {
          idleCallback = true;
          idle = window.requestIdleCallback(warm, { timeout: 4_000 });
        } else {
          idleCallback = false;
          idle = window.setTimeout(warm, 450);
        }
      });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") schedule();
      else clearScheduled();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    schedule();
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearScheduled();
    };
  }, [homeRecommendationsReady, hydrated, sourceId, navigationPending]);
  useEffect(() => {
    // Keep the star/like response immediate.  Ranking every large shelf is
    // useful work, but it belongs in a transition rather than on the button's
    // input frame.
    let pending = false;
    const refreshRatedShelves = () => {
      const state = useLibrary.getState();
      if (state.activeId || state.previewId) { pending = true; return; }
      pending = false;
      startTransition(() => { setRatingRevision((value) => value + 1); setTagHeartRevision((value) => value + 1); });
    };
    const unsubscribe = useLibrary.subscribe(state => {
      if (pending && !state.activeId && !state.previewId) refreshRatedShelves();
    });
    window.addEventListener("reelcase:rating-change", refreshRatedShelves);
    return () => { unsubscribe(); window.removeEventListener("reelcase:rating-change", refreshRatedShelves); };
  }, []);
  useEffect(() => { void useThumbs.getState().hydrate(); }, []);
  useEffect(() => {
    const update = () => { try { const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30"); setRemoteRefreshMs(([15, 30, 60, 120, 300].includes(seconds) ? seconds : 30) * 1_000); } catch { setRemoteRefreshMs(30_000); } };
    window.addEventListener("reelcase:refresh-settings", update);
    return () => window.removeEventListener("reelcase:refresh-settings", update);
  }, []);
  const [searchAttempt,setSearchAttempt]=useState(0);
  useEffect(() => {
    const needle = query.trim().toLowerCase();
    if (!hydrated || !searchDeskActive) { searchWorkerIndex.retire(); return; }
    const controller = new AbortController();
    searchWorkerIndex.sync(catalogVideos, tags, categories);
    void searchWorkerIndex.searchMatches(needle, controller.signal, sourceId !== "adults" && sourceId !== "adult-fetishes").then(async (result) => {
      const ids = result?.ids ?? null;
      if (controller.signal.aborted || !allowAutomaticRefresh()) return;
      const matches = ids === null ? await searchCatalog(catalogVideos, tags, categories, needle, controller.signal, sourceId !== "adults" && sourceId !== "adult-fetishes") : new Set<string>();
      if (ids) await forEachCatalogSlice(ids, id => { matches.add(id); }, async () => {
        controller.signal.throwIfAborted(); await yieldCatalogTask(); controller.signal.throwIfAborted();
      });
      if (controller.signal.aborted || !allowAutomaticRefresh()) return;
      useLibrary.setState({ searchResult: { query: needle, ids: matches, positions: result?.videos === catalogVideos ? result.positions : undefined, videos: catalogVideos, tags, categories } });
    }).catch(() => { /* Cancellation discards a superseded fallback scan. */ });
    return () => { controller.abort(); };
  }, [catalogVideos, categories, hydrated, query, searchDeskActive, tags, aliasRevision, sourceId,searchAttempt]);
  useEffect(() => {
    // Theater invitations are regular shareable links. Route them to the room
    // after saved preferences hydrate so a remembered last page cannot win.
    if (!hydrated) return;
    const room = new URLSearchParams(window.location.search).get("room")?.trim().toUpperCase() ?? "";
    const invited = /^RC[A-Z0-9]{4,12}$/.test(room);
    setInvitedToTheater(invited);
    if (invited) setSource("watch-room");
  }, [hydrated, setSource]);

  const refreshFollows = useBrowseLibrary((s) => s.refreshFollows);
  const remoteRefreshStatus = useBrowseLibrary((s) => sourceId === "youtube" ? s.youtubeRefreshStatus : s.remoteRefreshStatus);
  const followRemoteQuery = useBrowseLibrary((s) => s.followRemoteQuery);
  const pushNotice = useBrowseLibrary((s) => s.pushNotice);
  const [channelRefreshing, setChannelRefreshing] = useState("");
  const refreshYoutubeCatalog = async (emptyOnly = false) => {
    const state = useLibrary.getState();
    if (pullsPaused()) { toast.message("Pulls are paused. Select Resume pulls before starting a creator batch."); return; }
    if (state.refreshing || state.remoteBusy) {
      toast.message("Another catalog pull is still running.");
      return;
    }
    // Resolve against current saved rows at click time, rather than a shelf's
    // previous visibility snapshot or a count still being computed.
    const freshCoverage = emptyOnly ? youtubeCatalogCoverage(await youtubeCoverageIndexAsync(state.videos), useLibrary.getState().follows) : undefined;
    const missingSources = freshCoverage ? new Set(freshCoverage.missing) : null;
    const candidates = selectYoutubeSweepChannels(state.follows.filter(channel => !missingSources || missingSources.has(channel.id)), Date.now(), getPullSettings().youtubeSourcesPerSweep, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, { includeExhausted: true, includePlaylists: true });
    if (!candidates.length) {
      toast.message(emptyOnly ? "Remaining empty sources need a creator URL or @handle. Review them in creator controls." : "Add a YouTube creator or public playlist to pull an archive.");
      return;
    }
    setChannelRefreshing("youtube-refresh");
    try {
      const result = await refreshFollows("youtube", { catalog: true, force: true, ...(freshCoverage ? { channelIds: freshCoverage.missing } : {}) });
      if (result.retryAt && result.retryAt > Date.now()) {
        toast.message("YouTube rate limit", { description: `${result.pull?.added ? `${result.pull.added.toLocaleString()} new videos saved. ` : ""}${youtubeCooldownMessage(result.retryAt)}`, duration: 12_000, action: { label: "Pull health", onClick: () => setYoutubeHealthVisible(true) } });
        return;
      }
      if (!result.pull) {
        toast.message(result.skipped === 'busy' ? "Another catalog pull is still running." : "No eligible creators were checked. Review the saved sources in Manage creators.");
        return;
      }
      const { added, done: checked, failed, received, errors } = result.pull;
      if (result.pull.status === 'failed' || errors?.length && !received || checked > 0 && failed === checked) {
        toast.error("YouTube pull stopped", { description: errors?.[0] ?? "The checked creators returned no public catalog. Review their provider results in Pull health.", duration: 12_000, action: { label: "Pull health", onClick: () => setYoutubeHealthVisible(true) } });
        return;
      }
      pushNotice({
        title: "YouTube refresh complete",
        body: `${added.toLocaleString()} new videos added · ${received.toLocaleString()} returned · ${checked} creator/playlist source${checked === 1 ? "" : "s"} checked${failed ? ` · ${failed} unavailable` : ""}.`,
        kind: "youtube",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "YouTube refresh failed.");
    } finally {
      setChannelRefreshing("");
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false, running = false;
    const readTime = (key: string) => {
      try { const value = Number(localStorage.getItem(key)); return Number.isFinite(value) ? value : 0; }
      catch { return 0; }
    };
    const tick = async () => {
      if (cancelled || running || !getPullSettings().automaticPulls || !catalogPullAvailable() || !navigator.onLine) return;
      const state = useLibrary.getState();
      if (state.refreshing || state.remoteBusy) return;
      const now = Date.now(), settings = getPullSettings();
      const cooldown = state.youtubeRefreshStatus;
      const blocked = (cooldown?.retryAt ?? 0) > now;
      const allBlocked = blocked && cooldown?.cooldownScope !== 'catalog';
      let latestCatalogCheck = 0;
      for (const channel of state.follows) if (channel.kind === 'youtube') latestCatalogCheck = Math.max(latestCatalogCheck, channel.catalogCheckedAt ?? 0);
      const catalogAt = Math.max(readTime(YOUTUBE_SWEEP_KEY), youtubeSweepLastAttemptAt, latestCatalogCheck);
      const archiveReady = !blocked && selectYoutubeSweepChannels(state.follows, now, 1, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs).length > 0;
      const lane = nextRemoteRefresh([
        { lane: 'youtube-archive', lastAttemptAt: catalogAt, intervalMs: settings.youtubeIntervalSeconds * 1000, eligible: archiveReady && automaticPullAvailable('youtube'),
          recovery: Boolean(archiveReady && cooldown?.retryAt && cooldown.retryAt <= now && youtubeSweepLastAttemptAt < cooldown.retryAt) },
        { lane: 'twitch', lastAttemptAt: twitchLastAttemptAt, intervalMs: remoteRefreshMs, eligible: automaticPullAvailable('twitch') && state.follows.some(channel => channel.kind === 'twitch') },
        { lane: 'youtube-feed', lastAttemptAt: youtubeRecentLastAttemptAt, intervalMs: settings.youtubeIntervalSeconds * 1000, eligible: automaticPullAvailable('youtube') && !allBlocked && state.follows.some(channel => channel.kind === 'youtube' && !channel.importNeedsReview && !channel.id.startsWith('ytpl:')) },
      ], now, allowAutomaticRefresh());
      if (!lane) return;
      running = true;
      try {
        const result = lane === 'youtube-archive' ? await refreshFollows('youtube', { catalog: true, scheduled: true })
          : lane === 'youtube-feed' ? await refreshFollows('youtube', { scheduled: true })
          : await refreshFollows('twitch', { twitchRoutine: true, scheduled: true });
        // Busy, paused and cooldown skips keep their place in the schedule.
        if (!result.pull) return;
        const finishedAt = Date.now();
        if (lane === 'youtube-archive') {
          youtubeSweepLastAttemptAt = finishedAt;
          try { localStorage.setItem(YOUTUBE_SWEEP_KEY, String(finishedAt)); } catch { /* Session pacing remains. */ }
        } else if (lane === 'youtube-feed') youtubeRecentLastAttemptAt = finishedAt;
        else twitchLastAttemptAt = finishedAt;
        if (cancelled || lane !== 'twitch') return;
        const preferences = (() => { try { return JSON.parse(localStorage.getItem('reelcase.settings.v2') ?? '{}') as Record<string, boolean>; } catch { return {}; } })();
        if (preferences['alerts-go-live-alerts'] === true) for (const channel of result.wentLive) pushNotice({ title: `${channel.title} is live`, body: 'Tap to watch in Realhub.', kind: 'twitch', videoId: `tw:${channel.handle}:live` });
        for (const video of result.newVideos.filter(video => video.remote?.kind === 'twitch' && preferences['alerts-new-twitch-vod-alerts'] === true).slice(0, 3)) pushNotice({ title: video.name, body: video.remote?.channelName ?? 'New Twitch video', kind: 'twitch', videoId: video.id });
      } catch (error) { console.warn('Background refresh failed', error instanceof Error ? error.message : String(error)); }
      finally { running = false; }
    };
    const task = registerPeriodicTask({ name: 'Provider pulls', everyMs: 15_000, firstMs: 1_500, mode: 'visible',
      enabled: () => getPullSettings().automaticPulls && catalogPullAvailable(true) && navigator.onLine, work: tick });
    const stopAvailability = subscribePullAvailability(task.wake);
    const stopViewer = useLibrary.subscribe((next, previous) => {
      if (Boolean(next.activeId || next.previewId) !== Boolean(previous.activeId || previous.previewId)) wakePeriodicTasks();
    });
    return () => { cancelled = true; task.cancel(); stopAvailability(); stopViewer(); };
  }, [hydrated, follows.length, refreshFollows, pushNotice, remoteRefreshMs]);

  useEffect(() => { setActivePullPage(sourceId); }, [sourceId]);
  useEffect(() => () => setActivePullPage(''), []);
  useAdultPulls();
  useTwitchLiveRefresh();
  useYoutubeLiveRefresh();

  const prevScanning = useRef<typeof scanning>(null);
  useEffect(() => {
    const was = prevScanning.current;
    prevScanning.current = scanning;
    if (was && !scanning) {
      const folder = useLibrary.getState().folders.find((f) => f.name === was.folderName);
      const n = folder?.videoCount ?? 0;
      // Empty folders remain in the durable index for later rescans, but do not
      // interrupt every launch with a misleading "no photos" notification.
      if (n === 0 && folder?.photoCount) toast.success(`Found ${folder.photoCount} photo${folder.photoCount === 1 ? "" : "s"} in ${was.folderName}`);
      else if (n > 0) toast.success(`Found ${n} video${n === 1 ? "" : "s"} in ${was.folderName}`);
    }
  }, [scanning]);

  useEffect(() => {
    let depth = 0;
    const prevent = (e: DragEvent) => e.preventDefault();
    const enter = (e: DragEvent) => {
      e.preventDefault();
      // The studio owns model/link drops; media-library chrome must not
      // cover that target or remain stuck when its handler consumes the drop.
      if (useLibrary.getState().sourceId === "stable-diffusion") { depth = 0; setDragging(false); return; }
      depth += 1;
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      depth -= 1;
      if (depth <= 0) {
        depth = 0;
        setDragging(false);
      }
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      depth = 0;
      setDragging(false);
      if (!e.dataTransfer || useLibrary.getState().sourceId === "stable-diffusion") return;
      void ingestDrop(e.dataTransfer).catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not read files");
      });
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", drop);
    };
  }, [ingestDrop]);

  const heading = useMemo(() => {
    if (sourceId === "continue") return "Continue watching";
    if (sourceId === "favorites") return "Favorites";
    if (sourceId === "history") return "History";
    if (sourceId === "movies") return "Movies";
    if (sourceId === "home") return "Home";
    if (sourceId === "landing") return "Landing page";
    if (sourceId === "adults") return "Adults";
    if (sourceId === "youtube") return "YouTube";
    if (sourceId === "twitch") return "Twitch";
    if (sourceId === "live") return "Live";
    return folders.find((f) => f.id === sourceId)?.name ?? "Library";
  }, [sourceId, folders]);

  const onAddFolder = useCallback((startIn?: WellKnownStart, adult?: boolean) => {
    pendingAdult.current = Boolean(adult);
    void addFolder(dirInputRef.current, startIn, { adult }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Could not open folder";
      toast.error(/system files|system folder|not allowed/i.test(message) ? "Choose a media subfolder instead. Windows system folders cannot be cataloged; use Folder to pick Videos, Downloads, or a dedicated library folder." : message);
    });
  }, [addFolder]);
  const addSidebarFolder = useCallback((adult?: boolean) => onAddFolder(undefined, adult), [onAddFolder]);
  const addHeaderFolder = useCallback(() => onAddFolder(), [onAddFolder]);
  const openMobileMenu = useCallback(() => setMenuOpen(true), []);

  const playedAt = useMemo(() => {
    if (sourceId === 'history') return historyBrowse.index.playedAt;
    const map: Record<string, number> = {};
    if (!['adults', 'adult-fetishes', 'continue', 'history'].includes(sourceId)) return map;
    // History is newest-first. Preserve the first timestamp so repeated plays
    // show their latest visit, not the oldest one in the timeline.
    for (const h of history) if (map[h.id] == null) map[h.id] = h.at;
    return map;
  }, [sourceId, history, historyBrowse.index.playedAt]);
  const historyVisibleEntries = historyBrowse.entries, historyVideoById = historyBrowse.index.byId;
  const historyOrphans = historyBrowse.index.orphans;
  const historyRetentionCutoff = historyRetention === "week" ? Date.now() - 7 * 86_400_000 : historyRetention === "month" ? Date.now() - 30 * 86_400_000 : historyRetention === "year" ? Date.now() - 365 * 86_400_000 : 0;

  const browsing =
    !query &&
    (sourceId === "landing" ||
      sourceId === "movies" ||
      sourceId === "adults" ||
      sourceId === "adult-fetishes" ||
      sourceId === "youtube" ||
      sourceId === "twitch" ||
      sourceId === "live");
  const isHubSection = HUB_SOURCES.has(sourceId) || invitedToTheater;

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      {desktopLayout && <DesktopSidebar onAddFolder={addSidebarFolder} />}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="overflow-hidden bg-surface p-4">
          <SheetTitle className="sr-only">Library menu</SheetTitle>
          <SidebarNav
            onAddFolder={(adult) => {
              setMenuOpen(false);
              onAddFolder(undefined, adult);
            }}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar menuOpen={menuOpen} onMenu={openMobileMenu} onAddFolder={addHeaderFolder} />
        <main data-library-focus tabIndex={-1} aria-busy={navigationPending} className="w-full max-w-none flex-1 px-4 py-6 outline-none sm:px-6 xl:px-8 2xl:px-10">
          {searchDeskActive&&Boolean(query.trim())&&<SearchWorkerRecovery onRetry={()=>{searchWorkerIndex.retry(catalogVideos,tags,categories);setSearchAttempt(value=>value+1);}}/>}
          {navigationPending ? <section role="status" aria-live="polite" className="rounded-xl bg-elevated p-6 shadow-border sm:p-8">
            <h1 className="font-display text-3xl text-fg">{navigationSourceLabel(requestedSource, folders)}</h1>
            <p className="mt-3 text-sm text-muted">Preparing your library…</p>
          </section> : <>
          {sourceId !== "home" && <PullStatusBanner />}
          {sourceId === "home" && !query ? <LightHome /> : isHubSection ? (
            <Suspense fallback={<section className="rounded-xl bg-elevated p-8 text-sm text-muted shadow-border">Loading this library workspace…</section>}>
            <>
              {sourceId === "prints" && <PrintsSection />}
              {sourceId === "anime" && <AnimeSection />}
              {sourceId === "photos" && <PhotosSection />}
              {sourceId === "spotify" && <SpotifySection />}
              {sourceId === "games" && <GamesSection />}
              {sourceId === "shop" && <ShopSection />}
              {sourceId === "streaming" && <StreamingSection />}
              {sourceId === "stream-signal" && <StreamSignalSection />}
              {sourceId === 'stable-diffusion' && <StableDiffusionSection />}
              {sourceId === 'remote-desktop' && <RemoteDesktopSection />}
              {sourceId === "social" && <SocialSection />}
              {(sourceId === "watch-room" || invitedToTheater) && <WatchRoomSection />}
              {sourceId === "settings" && <SettingsSection />}
              {sourceId === "stats" && <StatsSection />}
              {sourceId === "connection" && <LanConnectionSection />}
              {sourceId === "find-phone" && <FindPhoneSection />}
              {sourceId === "genres" && <GenreSection />}
              {sourceId === "assistant" && <AiGuide />}
              {sourceId === "mission-plan" && <MissionPlanSection />}
            </>
            </Suspense>
          ) : (
            <>
              {sourceId === "landing" && !query && <DiscoveryDesk videos={videos} />}
              {!hasUserFolders && sourceId === "landing" && (
                <InviteStrip
                  onAddFolder={() => onAddFolder()}
                  onAddFiles={() => fileInputRef.current?.click()}
                  onRecommended={(id) => onAddFolder(id)}
                />
              )}
              {sourceId === "landing" && !query && !follows.length && (
                  <ConnectPanel key="home-imports" defaultKind="youtube" />
                )}


              {sourceId === "movies" && !query && randomSourceMovies[0] && (
                <Billboard video={randomSourceMovies[0]} />
              )}
              {sourceId === "adults" && adultFeatured && (
                <Billboard video={adultFeatured} />
              )}

              {sourceId === "landing" && browsing && (
                <LandingShelves videos={videos} youtube={youtubeVideos} twitch={twitchVideos} live={liveVideos} folders={folders} follows={follows} seed={homePickShuffle} onMix={() => setHomePickShuffle(Date.now())} ready={homeRecommendationsReady && !navigationPending} revision={ratingRevision} />
              )}
              {sourceId === "youtube" && browsing && (
                <>
                  <section className="mb-7 overflow-hidden rounded-xl border border-border bg-surface shadow-border">
                    <div className="grid gap-6 bg-elevated/60 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                      <div><p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">YouTube · your archive</p><h1 className="mt-2 font-display text-4xl tracking-tight text-fg sm:text-5xl">More of what you watch.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Recommendations learn from watched creators, tag likes, ratings, and watch time. Archive pulls resume across creators fairly; older public uploads stay in each creator’s catalog.</p><div className="mt-4"><YoutubePublicationControl /></div></div>
                      <div className="flex flex-wrap gap-2"><YoutubeCatalogPullButton retryAt={remoteRefreshStatus?.retryAt} busy={refreshing || remoteBusy} pulling={channelRefreshing === "youtube-refresh"} empty={!follows.some(channel => channel.kind === "youtube")} onPull={() => void refreshYoutubeCatalog()} /><Button variant="secondary" onClick={() => setYoutubeHealthVisible((value) => !value)}>{youtubeHealthVisible ? "Hide pull health" : "Pull health"}</Button></div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-y divide-border border-t border-border sm:grid-cols-4 sm:divide-y-0"><div className="p-4 sm:px-5"><p className="text-xs text-muted">Verified sources</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{youtubeCoverage.verified.toLocaleString()}</p></div><div className="p-4 sm:px-5"><p className="text-xs text-muted">Cached videos</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{youtubeCoverageUpdating ? "Updating…" : youtubeIdentityHealth.distinctVideos.toLocaleString()}</p></div><div className="p-4 sm:px-5"><p className="text-xs text-muted">Creators you watched</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{watchedYoutubeCreators.size.toLocaleString()}</p></div><div className="p-4 sm:px-5"><p className="text-xs text-muted">Last YouTube live check</p><p className="mt-1 truncate text-sm font-medium text-fg">{youtubeLiveCheckedAt ? new Date(youtubeLiveCheckedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Not checked yet"}</p></div></div>
                    <div className="border-t border-border px-5 py-3 text-xs text-muted sm:px-7">Pull jobs start at least {getPullSettings().requestGapMs.toLocaleString()}ms apart. YouTube archive requests have a separate {getPullSettings().youtubeRequestGapMs.toLocaleString()}ms gap and run one at a time. Live checks pipeline three small batches through at most eight concurrent public reads and an 80ms start gap, independent of that archive delay. Completed batches update without waiting for the slowest batch. Each archive sweep covers up to {getPullSettings().youtubeSourcesPerSweep} saved sources, targeting {getPullSettings().youtubeBatchVideos} videos per creator or playlist ({(getPullSettings().youtubeSourcesPerSweep * getPullSettings().youtubeBatchVideos).toLocaleString()} entries across the batch, before duplicates and provider availability). YouTube finishes complete pages so the next cursor never skips remaining entries. Automatic archive turns check up to four creators in small responses while this page is visible, including when idle. They wait {getPullSettings().youtubeIntervalSeconds} seconds between passes, and {getPullSettings().pauseWhileWatching ? "hold while a preview or player is open" : "can run during playback"}. Repeat pulls resume older pages without rereading the recent RSS window. Change these limits in Settings. {remoteRefreshStatus?.checked ? `Last archive/feed refresh checked ${remoteRefreshStatus.checked} sources · ${remoteRefreshStatus.refreshed} succeeded · ${remoteRefreshStatus.youtube.toLocaleString()} videos returned · ${remoteRefreshStatus.failed} failed.` : "Select specific creators below to target their archive."}</div>
                    <div className="border-t border-border px-5 py-3 text-sm text-muted sm:px-7" aria-label="YouTube catalog capacity" aria-busy={youtubeCoverageUpdating}>{youtubeCoverageUpdating ? "Updating saved entry count…" : `${youtubeIdentityHealth.distinctVideos.toLocaleString()} / ${getPullSettings().youtubeMaxEntries.toLocaleString()} YouTube entry limit · ${Math.max(0, getPullSettings().youtubeMaxEntries - youtubeIdentityHealth.distinctVideos).toLocaleString()} slots remaining.`} {youtubeCoverage.verified.toLocaleString()} verified sources · {youtubeCoverage.pending.toLocaleString()} awaiting exact channel match · {youtubeCoverage.review.toLocaleString()} legacy fragments held for review.<YoutubeCleanupStatus /></div>
                    <YoutubeProviderStatus retryAt={remoteRefreshStatus?.retryAt} error={remoteRefreshStatus?.error} />
                    <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3 text-sm sm:px-7"><span className="text-muted" aria-label="YouTube source coverage" aria-live="polite" aria-busy={youtubeCoverageUpdating}>{youtubeCoverageUpdating ? "Updating saved catalog coverage…" : `${youtubeCoverage.ready.toLocaleString()} / ${youtubeCoverage.total.toLocaleString()} verified sources have saved uploads${youtubeCoverage.missing.length ? ` · ${youtubeCoverage.missing.length.toLocaleString()} have no cached uploads` : ""}. Hidden videos still count toward coverage.`}</span>{youtubeCoverage.missing.length > 0 && <Button size="sm" variant="secondary" disabled={refreshing || remoteBusy || youtubeCoverageUpdating} onClick={() => void refreshYoutubeCatalog(true)}>Fill empty sources</Button>}<span className="text-xs text-muted" aria-label="YouTube duplicate check" aria-busy={youtubeCoverageUpdating}>{youtubeCoverageUpdating ? "Checking saved video IDs…" : `${youtubeIdentityHealth.distinctVideos.toLocaleString()} distinct video IDs · ${youtubeIdentityHealth.duplicateRows.toLocaleString()} duplicate cached rows.`} Creator and playlist memberships share one video record.</span></div>{youtubeHealthVisible && <YoutubeFirstClickStatus />}
                    {youtubeHealthVisible && <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{youtubeHealth.map((channel) => <article key={channel.id} className="rounded-sm bg-bg/45 p-3"><p className="truncate text-sm font-medium text-fg">{channel.title}</p><p className="mt-1 text-xs text-muted">{channel.cached.toLocaleString()} cached · last result {channel.lastResponseCount ?? 0} rows</p><p className="mt-1 text-xs text-muted">{channel.newest ? `Newest ${new Date(channel.newest).toLocaleDateString()}` : "No published item cached"} · {channel.lastCheckedAt ? `checked ${new Date(channel.lastCheckedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "not checked yet"}</p><p className="mt-1 text-xs text-muted">{channel.catalogCursor ? "Archive paging in progress" : channel.catalogExhaustedAt ? "Public archive reached" : "Archive sweep not started"} · {channel.lastProviderFailure ? `${channel.lastProviderFailure.message} · ${channel.lastProviderFailure.recovery}` : channel.retryAt && channel.retryAt > Date.now() ? `Retry ${new Date(channel.retryAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Provider ready"}</p><p className="mt-1 text-xs text-muted">{channel.cache ? `${channel.cache.scope === "catalog" ? "Catalog cache" : channel.cache.scope === "feed" ? "Feed cache" : "Not retained"} · ${Math.max(0, Math.floor((Date.now() - channel.cache.at) / 1_000))}s old · ${Math.round(channel.cache.hits / Math.max(1, channel.cache.hits + channel.cache.misses) * 100)}% hit rate` : "Cache telemetry appears after the first refresh"}</p>{channel.lastProviderFailure && channel.retryAt && channel.retryAt > Date.now() && <p className="mt-1 text-xs text-accent">Retry {new Date(channel.retryAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}</p>}</article>)}</div>}
                  </section>
                  <YoutubeLiveCheckStatus />
                  <YoutubeOfflineAudit />
                  <FollowManager kind="youtube" />
                  <ProviderPullPanel kind="youtube" />
                  {(youtubePrimary.pending || youtubeExplore.pending || youtubeTopicPreparation.pending) && <p className="mb-4 text-sm text-muted" role="status">Updating YouTube shelves in the background. You can keep browsing.</p>}
                  {(youtubePrimary.failed || youtubeExplore.failed || youtubeTopicPreparation.failed) && <p className="mb-4 text-sm text-muted" role="status">Some discovery shelves could not load. Your saved archive is still available below.</p>}
                  <YoutubeFormatControls selection={youtubeFormats} />
                  <LiveCatalog videos={youtubeFormats.groups.live} rail />
                  <TitleRail title="Upcoming YouTube events" reason="Scheduled events; these are not current live streams or published uploads." videos={youtubeFormats.groups.upcoming} variant="rail" />
                  <RankingGuide desk="YouTube" />
                  {youtubeExploreVisible && <><div className="mb-5 flex flex-wrap gap-2"><Button size="sm" variant={youtubeTagFilter === "all" ? "default" : "secondary"} aria-pressed={youtubeTagFilter === "all"} onClick={() => startTransition(() => setYoutubeTagFilter("all"))}>All tags</Button>{visibleYoutubeTags.map((shelf) => <Button key={shelf.tag} size="sm" variant={youtubeTagFilter === shelf.tag ? "default" : "secondary"} aria-pressed={youtubeTagFilter === shelf.tag} onClick={() => startTransition(() => setYoutubeTagFilter(shelf.tag))}>#{shelf.tag} · {shelf.count.toLocaleString()}</Button>)}{youtubeTagChoices.length > 12 && <Button size="sm" variant="ghost" aria-expanded={youtubeTagsExpanded} onClick={() => setYoutubeTagsExpanded(value => !value)}>{youtubeTagsExpanded ? "Fewer topics" : `Show all ${youtubeTagChoices.length} topics`}</Button>}</div>{youtubeTagFilter !== "all" && <p className="-mt-2 mb-5 text-xs text-accent">Filtering every YouTube shelf and the full catalog by #{youtubeTagFilter} · {filteredYoutube.length.toLocaleString()} matching videos.</p>}</>}
                  {youtubePlaylistShelves.map((playlist) => <TitleRail key={playlist.id} title={`Playlist · ${playlist.title}`} reason="Public playlist saved to your library." videos={playlist.videos} variant="rail" onTitleClick={() => setSource(playlist.id)} />)}
                  <TitleRail title="Mixed from your creators" reason="A rotating mix across your saved creators, including older uploads." videos={youtubeMix} variant="rail" priority /><Button className="mb-5" variant="secondary" onClick={() => setHomePickShuffle(Date.now())}>Mix it up</Button><TitleRail title={youtubeFormats.format === 'short' ? 'Latest saved Shorts' : youtubeFormats.format === 'replay' ? 'Latest completed streams' : youtubeFormats.format === 'upload' ? 'Latest uploads' : 'Latest saved videos'} videos={youtubeLatest} variant="rail" />
                  {youtubeExploreVisible && <TitleRail title="More from creators you watch" reason="Unwatched public uploads from recent viewing creators, including older catalog items." videos={deeperFromWatchedCreators} variant="rail" />}
                  {!youtubeExploreVisible && <section className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Fast start</p><h2 className="mt-2 font-display text-2xl text-fg">Open YouTube fast, then deepen the catalog when you want it.</h2><p className="mt-1 text-sm text-muted">Recommendations, artwork-heavy discovery shelves, tag filters, and the full grid wait until requested. Your newest uploads are ready immediately.</p><Button className="mt-4" variant="secondary" onClick={() => setYoutubeExploreVisible(true)}>Explore recommendations and full catalog</Button></section>}
                  {youtubeExploreVisible && <><TitleRail title="Trending in your tracked channels" videos={trendingYoutube} variant="rail" /><TitleRail title="New to you on YouTube" videos={freshPicks} variant="rail" /><TitleRail recommendation title="More from your rated YouTube" videos={relatedYoutube} variant="rail" /><TitleRail title="Quick picks" videos={youtubeQuick} variant="rail" /><section className="mb-6 rounded-xl border border-border bg-surface p-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Creator discovery</p><h2 className="mt-2 font-display text-2xl text-fg">Outside your known follows.</h2><p className="mt-1 text-sm text-muted">Discovery stays in its own shelf so saved channels never get mixed with suggestions. Follow adds a channel to your saved refresh list.</p><div className="mt-4"><TitleRail title="Explore new YouTube" videos={youtubeDiscovery} variant="rail" /></div><div className="mt-4 flex flex-wrap gap-2">{[["Kurzgesagt", "kurzgesagt"], ["Veritasium", "veritasium"], ["PBS Space Time", "pbsspacetime"]].filter(([, handle]) => !follows.some((channel) => channel.kind === "youtube" && channel.handle.toLowerCase() === handle)).map(([label, handle]) => <Button key={handle} size="sm" variant="secondary" disabled={channelRefreshing === handle} onClick={() => void (async () => { setChannelRefreshing(handle); try { await followRemoteQuery(handle, "youtube"); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === handle ? "Checking…" : `Follow ${label}`}</Button>)}</div></section><YoutubeDeepDiscovery archive={filteredYoutube} ranked={youtubeRanking.discovery} recommendations={relatedYoutube} fallback={youtubeMix} total={youtubeRanking.total} pending={youtubeRanking.pending} error={youtubeRanking.error} expanded={youtubeDeepVisible} onExpand={() => setYoutubeDeepVisible(true)} onMore={youtubeRanking.loadMore} onRetry={youtubeRanking.retry} /></>}
                  <ConnectPanel key="youtube-imports" defaultKind="youtube" lockedKind="youtube" />
                </>
              )}

              {sourceId === "twitch" && browsing && (
                <>
                  <section className="mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Live desk</p><h1 className="mt-2 font-display text-4xl text-fg">Twitch, live first.</h1><p className="mt-2 max-w-2xl text-sm text-muted">{follows.filter((channel) => channel.kind === "twitch").length} channel{follows.filter((channel) => channel.kind === "twitch").length === 1 ? "" : "s"} tracked locally. Live checks refresh stream state; archive pulls add VODs and clips.</p><p className="mt-2 text-xs text-accent">{remoteCheckedAt ? `Last remote refresh ${new Date(remoteCheckedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "No remote refresh yet."} · {twitchDesk.indexPending ? 'Counting cached VODs and clips…' : `${twitchDesk.vodTotal.toLocaleString()} VODs · ${twitchClipTotal.toLocaleString()} clips`}{remoteRefreshStatus ? ` · ${remoteRefreshStatus.action === "Twitch live check" ? "last live check" : remoteRefreshStatus.action === "Scheduled Twitch content pull" ? "last scheduled pull" : "last archive refresh"} returned ${remoteRefreshStatus.twitch.toLocaleString()} ${remoteRefreshStatus.action === "Twitch live check" ? "live streams" : "VODs and clips"} from ${remoteRefreshStatus.refreshed}/${remoteRefreshStatus.checked} checked channels${remoteRefreshStatus.failed ? ` (${remoteRefreshStatus.failed} unavailable)` : ""}` : ""}</p><div className="mt-4 flex flex-wrap gap-2">{(["mix", "live", "viewers", "name"] as const).map((sort) => <Button key={sort} size="sm" variant={twitchSort === sort ? "default" : "secondary"} aria-pressed={twitchSort === sort} onClick={() => { setTwitchSort(sort); setTwitchCatalogVisible(true); }}>{sort === "mix" ? "Creator mix" : sort === "live" ? "Live first" : sort === "viewers" ? "Most viewers" : "A–Z"}</Button>)}<Button size="sm" variant="secondary" onClick={() => void refreshFollows("twitch", { twitchLiveOnly: true, liveSweep: true })}>Check all Twitch live channels</Button></div></section>

                  <LiveCatalog videos={twitchLiveRows} rail priority />
                  <details className="mb-5 rounded-lg border border-border px-4"><summary className="min-h-11 cursor-pointer py-3 text-sm text-muted">Quick creator refresh</summary><p className="mb-3 text-xs text-subtle">Scheduled refreshes rotate through 12 creators. Choose a creator here for a focused archive pull.</p><div className="mb-3 flex flex-wrap gap-2">{follows.filter((channel) => channel.kind === "twitch").slice(0, 12).map((channel) => <Button key={channel.id} size="sm" variant="ghost" disabled={channelRefreshing === channel.id} onClick={() => void (async () => { setChannelRefreshing(channel.id); try { await followRemoteQuery(channel.handle, "twitch"); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === channel.id ? "Checking…" : `Refresh ${channel.title}`}</Button>)}</div></details>
                  <div className="mb-5"><Button variant="secondary" aria-expanded={twitchArchiveSearchVisible} onClick={() => setTwitchArchiveSearchVisible(value => !value)}>{twitchArchiveSearchVisible ? 'Hide saved archive search' : 'Search saved Twitch archive'}</Button></div>
                  {twitchArchiveSearchVisible && <Suspense fallback={<p role="status" className="mb-5 text-sm text-muted">Opening archive search…</p>}><TwitchArchiveSearch videos={twitchVideos} follows={follows} onClose={() => setTwitchArchiveSearchVisible(false)} /></Suspense>}
                  <section className="mb-5 rounded-lg border border-border p-4" aria-label="Twitch fast start"><p className="text-sm text-muted">Fast start keeps live streams and your creator mix ready. Open the larger shelves when you need them; closing them releases their prepared catalogs.</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" aria-expanded={twitchExploreVisible} onClick={() => setTwitchExploreVisible(value => !value)}>{twitchExploreVisible ? 'Hide Twitch recommendations' : 'Explore Twitch recommendations'}</Button><Button variant="secondary" aria-expanded={twitchCatalogVisible} onClick={() => setTwitchCatalogVisible(value => !value)}>{twitchCatalogVisible ? 'Close full Twitch catalog' : 'Open full Twitch catalog'}</Button></div></section>
                  <TwitchLiveCheckStatus action={false} />
                  <FollowManager kind="twitch" />
                  <ProviderPullPanel kind="twitch" />
                  <TwitchClipsControl />
                  <section className="mb-5 rounded-lg border border-border bg-surface p-4" aria-label="Twitch archive pulls">
                    <p className="text-sm text-muted">Recent pulls refresh the latest uploads and clips. Older pulls continue saved archive pages, up to 100 VODs per creator across 100 eligible creators. Completed archives and retry waits are skipped.</p>
                    <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" disabled={refreshing || remoteBusy} onClick={() => void (async () => {
                      try {
                        const result = await refreshFollows('twitch', { twitchRoutine: true, twitchContinueArchive: true });
                        setTwitchPullNotice(result.pull ? `Older VOD pull: ${result.pull.done} creators checked · ${result.pull.received} videos returned · ${result.pull.failed} unavailable.` : 'No archive is eligible right now. Completed archives and retry waits remain saved.');
                      } catch (error) { setTwitchPullNotice(error instanceof Error ? error.message : 'The Twitch archive pull could not start.'); }
                    })()}>Pull older Twitch VODs</Button></div>
                    {twitchPullNotice && <p role="status" className="mt-3 text-xs text-accent">{twitchPullNotice}</p>}
                  </section>
                  <RankingGuide desk="Other" />
                  <div className="mb-5 flex flex-wrap gap-2">{([["all", "All Twitch"], ["favorites", "Favorites"], ["likes", "Liked"]] as const).map(([value, label]) => <Button key={value} variant={twitchFilter === value ? "default" : "secondary"} aria-pressed={twitchFilter === value} onClick={() => { setTwitchFilter(value); if (value !== "all") setTwitchCatalogVisible(true); }}>{label}{value === "all" ? "" : twitchSaved.pending ? " · …" : " · " + (value === "favorites" ? twitchSaved.favoriteCount : twitchSaved.likedCount).toLocaleString()}</Button>)}</div>
                  <div className="mb-5 flex flex-wrap gap-2"><Button size="sm" variant={twitchTagFilter === "all" ? "default" : "secondary"} aria-pressed={twitchTagFilter === 'all'} onClick={() => setTwitchTagFilter("all")}>All tags</Button>{channelTagShelves.map((shelf) => <Button key={shelf.tag} size="sm" variant={twitchTagFilter === shelf.tag ? "default" : "secondary"} aria-pressed={twitchTagFilter === shelf.tag} onClick={() => { setTwitchTagFilter(shelf.tag); setTwitchCatalogVisible(true); }}>#{shelf.tag} · {shelf.count.toLocaleString()}</Button>)}</div>
                  {twitchFilter === "all" ? <><TitleRail title="Favorite Twitch videos" videos={twitchSaved.favoriteRows} variant="rail"/><TitleRail title="Liked on Twitch · discovery" videos={twitchSaved.likedRows} variant="rail"/></> : null}
                  {twitchFilter !== "all" && !twitchCatalog.pending && !twitchSavedSelection.pending && !twitchSavedSelection.rows.length && <p className="mb-6 rounded-lg border border-border p-6 text-muted">Nothing saved here yet. Use the heart or like action on a Twitch video to keep it here between visits.</p>}
                  {twitchFilter === "all" && <div className="mb-3 flex flex-wrap items-center gap-3"><Button size="sm" variant="secondary" onClick={() => { setTwitchMixSeed(seed => seed + 1); setTwitchSort("mix"); }}>Mix Twitch creators</Button><p className="text-xs text-muted">Creators take turns. Recommendations learn from your likes, favorites, ratings, games, titles and watch time; New to you skips opened videos. Mix again for a different rotation.</p></div>}
                  <TitleRail title={twitchFilter === "all" ? "Your Twitch mix" : twitchFilter === "favorites" ? "Your favorites" : "Your liked videos"} videos={twitchFilter === "all" ? twitchMixedRows : twitchSavedSelection.rows} variant="rail" />
                  {twitchFilter === "all" && <TitleRail title="New to you on Twitch" videos={twitchFreshRows} variant="rail" />}
                  {twitchFilter === "all" && twitchExploreVisible && <>
                  <div role="region" aria-label="Twitch creator shelves" aria-busy={twitchDesk.shelvesPending}>
                  {liveChannelVods.map(({ creator, vods }) => (
                    <TitleRail key={creator} title={`${creator} · recent VODs`} videos={vods} variant="rail" />
                  ))}
                  <TitleRail recommendation title="Recommended Twitch VODs" videos={twitchBalancedPopular} variant="rail" />
                  {twitchVodChannels.length > 0 && <section className="mb-8 rounded-xl border border-border bg-surface p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">VOD explorer</p><h2 className="mt-2 font-display text-2xl text-fg">Browse VODs by creator.</h2><p className="mt-1 text-sm text-muted">Channels rise through your plays, saves, likes, high ratings, and the tags those highly rated videos share.</p><div className="mt-5 space-y-6">{twitchVodChannels.map(({ creator, vods, count }) => <TitleRail key={`vod-explorer-${creator}`} title={`${creator} · ${count} VOD${count === 1 ? "" : "s"}`} videos={vods} variant="rail" />)}</div></section>}
                  </div>
                  <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-border"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Clip explorer</p><p className="mt-1 text-sm text-muted">Browse {twitchClipTotal.toLocaleString()} saved clips by creation date, views, or a balanced creator shuffle. Unknown creation dates stay last.</p></div><div className="flex flex-wrap items-center gap-2"><select aria-label="Clip order" className="min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg" value={twitchClipOrder} onChange={event=>setTwitchClipOrder(event.target.value as typeof twitchClipOrder)}><option value="newest">Newest clips</option><option value="views">Most viewed clips</option><option value="shuffle">Creator shuffle</option></select><select aria-label="Clip creator" className="min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg" value={twitchClipCreator} onChange={(event) => setTwitchClipCreator(event.target.value)}><option value="all">All creators</option>{follows.filter((channel) => channel.kind === "twitch").map((channel) => <option key={channel.id} value={channel.title}>{channel.title}</option>)}</select><Button size="sm" variant="secondary" onClick={() => { setTwitchClipOrder('shuffle'); setTwitchClipSeed((seed) => seed + 1); }}><Shuffle className="mr-2 size-4" />Shuffle clips</Button></div></section>
                  <div role="region" aria-label="Twitch clip discovery" aria-busy={twitchDesk.clipsPending}>
                    {twitchDesk.clipsPending && <p role="status" className="mb-3 text-xs text-muted">Preparing clip shuffle…</p>}
                    <TitleRail title={`Clips to explore · ${twitchClipTotal.toLocaleString()} cached`} videos={twitchClips} variant="rail" />
                  </div>
                  {channelTagShelves.map((shelf) => <TitleRail key={`twitch-tag-${shelf.tag}`} title={`Twitch · ${shelf.tag}`} videos={shelf.videos} variant="rail" />)}
                  </>}
                  <details data-twitch-coverage onToggle={event => setTwitchCoverageVisible(event.currentTarget.open)} aria-busy={twitchDesk.coveragePending} className="mb-5 rounded-lg border border-border bg-surface p-4 shadow-border"><summary className="cursor-pointer list-none"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Archive coverage</p><p className="mt-1 text-sm text-muted">{twitchDesk.vodTotal.toLocaleString()} cached VODs across {follows.filter(channel => channel.kind === "twitch").length} channels · expand to review and queue deep pulls.</p></div><span className="text-xs text-accent">Expand</span></div></summary><div className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Archive coverage</p><p className="mt-1 text-sm text-fg">{twitchArchiveDepth.total.toLocaleString()} cached VODs across {twitchArchiveDepth.channels.length} channels · {twitchArchiveDepth.sparse} sparse channel{twitchArchiveDepth.sparse === 1 ? "" : "s"} under 24 VODs.</p><p className="mt-1 text-xs text-muted">Scheduled pulls add up to 100 recent VODs and 24 clips sampled across recent and older time ranges. Focused pulls resume saved archive, highlight, upload, and clip positions. Choose a finite budget below; accepted pages remain saved when a provider stops responding.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={channelRefreshing === "twitch-archives"} onClick={() => void (async () => { setChannelRefreshing("twitch-archives"); try { await refreshFollows("twitch", { twitchRoutine: true }); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === "twitch-archives" ? "Pulling recent content…" : "Pull recent VODs + clips"}</Button></div></div>{twitchCoverageVisible && <TwitchArchiveCreators channels={twitchArchiveDepth.channels} />}</details>
                  {twitchCatalogVisible && <section aria-label="Full Twitch catalog" aria-busy={twitchCatalog.pending || twitchFilteredCatalog.pending} data-twitch-order={twitchSort}><TwitchContentControls value={twitchContentFilter} onChange={setTwitchContentFilter} videos={twitchFilteredCatalog.rows} pending={twitchCatalog.pending || twitchFilteredCatalog.pending} />{twitchCatalog.pending || twitchFilteredCatalog.pending ? <p role="status" className="mb-5 text-sm text-muted">Preparing Twitch catalog…</p> : <><p className="mb-3 text-xs text-muted">{twitchFilteredCatalog.rows.length.toLocaleString()} shown of {sortedTwitch.length.toLocaleString()} saved Twitch entries · {twitchSort === "mix" ? "Creators take turns throughout the complete catalog." : "Using the selected catalog order."}</p><PosterGrid videos={twitchFilteredCatalog.rows} /></>}</section>}
                  {!twitchVideos.length && (
                    <p className="text-sm text-muted">Add a channel from the follow manager below to fill this shelf.</p>
                  )}
                  <ConnectPanel key="twitch-imports" defaultKind="twitch" lockedKind="twitch" />
                </>
              )}

              {sourceId === "live" && browsing && <LiveCatalog videos={liveVideos} adultLiveVideos={adultRemoteVideos.filter((video) => adultKind(video) === "live")} />}

              {sourceId === "movies" && browsing && <MovieDesk catalog={movies.catalog} pending={movies.pending} onShuffle={() => setMovieShuffle(Date.now())} onReload={() => void restoreFolders()} />}

              {sourceId === "adult-fetishes" && browsing && (
                <>
                  <Suspense fallback={<section className="mb-6 rounded-xl bg-surface p-5 text-sm text-muted shadow-border" role="status">Opening the Adult explorer…</section>}>
                    <AdultFetishExplorer
                      onSelectedTag={(tag) => {
                        setAdultExplorerTag(tag);
                        setAdultTag(tag);
                      }}
                    />
                  </Suspense>
                  <section className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-border">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Explorer results</p>
                        <h2 className="mt-2 font-display text-2xl text-fg">{adultExplorerTag ? `#${adultExplorerTag.replace(/^fetish-/, "")}` : "Your pulled Adult interests"}</h2>
                        <p className="mt-1 text-sm text-muted">{adultExplorerTag ? "Freshly pulled and saved matching titles. Results stay tagged for the Adult catalog too." : "Pick a topic above to pull it. Existing fetish-tagged titles appear here while you choose."}</p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => setSource("adults")}>Browse all Adults</Button>
                    </div>
                    {adultExplorerResults.length ? <TitleRail title={adultExplorerTag ? "Matching titles" : "Recently pulled interests"} videos={adultExplorerResults} variant="rail" /> : <p className="mt-5 rounded-lg bg-elevated px-4 py-5 text-sm text-muted">No saved titles match this topic yet. Choose a provider and pull a topic above.</p>}
                  </section>
                </>
              )}

              {sourceId === "adults" && browsing && (
                <>
                  <RankingGuide desk="Adults" />
                  <Suspense fallback={<section className="mb-6 rounded-xl bg-surface p-5 text-sm text-muted shadow-border" role="status">Opening Adult controls…</section>}>
                    <AdultPanel
                      showMilestones={adultDeepVisible}
                      sourceFilter={adultSource}
                      tagFilter={adultTag}
                      onSourceFilter={setAdultSource}
                      onTagFilter={applyAdultTag}
                    />
                  </Suspense>
                  <section className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-border">
                    <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult media view</p>
                    <p className="mt-1 text-sm text-muted">Choose one media type or keep the combined discovery view. Provider, tag, and artwork filters apply to every Adult rail below.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {([['all', `Combined · ${adultRemoteVideos.length}`], ['videos', `Videos · ${adultKindCounts.videos}`], ['live', `Live · ${adultKindCounts.live}`], ['photos', `Photos · ${adultKindCounts.photos}`]] as const).map(([view, label]) => <Button key={view} size="sm" variant={adultView === view ? "default" : "secondary"} onClick={() => setAdultView(view)}>{label}</Button>)}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <span className="text-xs text-muted">Artwork</span>
                      <Button size="sm" variant={adultArtworkOnly ? "default" : "secondary"} onClick={() => setAdultArtworkOnly(true)}>Preview-ready · {adultArtworkReadyCount}</Button>
                      <Button size="sm" variant={!adultArtworkOnly ? "default" : "secondary"} onClick={() => setAdultArtworkOnly(false)}>All cards · {viewMatchedAdult.length}</Button>
                      <Button size="sm" variant={showHiddenAdult ? "default" : "ghost"} onClick={() => setShowHiddenAdult(!showHiddenAdult)}>{showHiddenAdult ? "Hide #hidden again" : "Show #hidden"}</Button>
                    </div>
                    <p className="mt-2 text-xs text-muted">Preview-ready keeps cards without a usable poster out of the opening rails. Use the eye-slash control on a card to add #hidden; hidden cards stay out of all Adult rails until shown here.</p>
                  </section>
                  {adultView === "all" && <section className="mb-6 space-y-5"><div className="border-b border-border pb-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Browse the full mix</p><p className="mt-1 text-sm text-muted">Videos, photos, and rotating picks each have their own full-width rail, so the opening catalog never compresses three different discovery paths into narrow columns.</p></div><TitleRail title={`Adult videos · ${adultKindCounts.videos}`} reason="Full-width video rail, ranked independently from photos and rotating picks." videos={adultOverviewRails.videos} variant="rail"/><TitleRail title={`Adult photos · ${adultKindCounts.photos}`} reason="Reddit and Booru photos with preview fallbacks, presented in a dedicated full-width rail." videos={adultOverviewRails.photos} variant="rail"/><TitleRail title="Adult picks" reason="A distinct mixed full-width rail after the video and photo cards above." videos={adultOverviewRails.picks} variant="rail"/></section>}
                  <section className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-border">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">For you right now</p>
                        <h2 className="mt-1 font-display text-2xl text-fg">Better Adult recommendations</h2>
                        <p role="status" className="mt-1 text-xs text-muted">{adultBrowse.failed ? "Recommendations are unavailable. You can still browse your catalog." : adultBrowse.pending ? "Updating your mix… Keep browsing while it finishes." : "Your mix is ready."}</p>
                        {adultBrowse.failed && <Button size="sm" variant="secondary" onClick={adultBrowse.retry}>Retry recommendations</Button>}
                        <p className="mt-1 max-w-3xl text-sm text-muted">Taste signals from ratings, saves, likes, hearted tags, watch history, and private marks lead the mix. Preview-ready cards get a small lift; creator and provider round-robin guards keep a fresh batch from taking over the shelf.</p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => setAdultRailSeed(Date.now() >>> 0)}><Shuffle className="size-4" /> Refresh mix</Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2"><div className="rounded-md bg-elevated px-3 py-2 text-xs text-muted">{adultRecommendedRail.length} fresh recommendation{adultRecommendedRail.length === 1 ? "" : "s"}</div><div className="rounded-md bg-elevated px-3 py-2 text-xs text-muted">{adultRelatedRail.length} related by current interests</div><div className="rounded-md bg-elevated px-3 py-2 text-xs text-muted">Fresh titles lead; smaller catalogs may repeat overview picks</div></div>
                  </section>
                  <TitleRail
                    title="Recommended for you"
                    reason="Tag overlap, hearted interests, ratings, private marks, creator and provider variety, thumbnail readiness, and a fresh timestamped mix."
                    videos={adultRecommendedRail}
                    variant="rail"
                  />
                  <TitleRail
                    title="More from your interests"
                    reason="Nearby titles sharing your top Adult tags, recent watches, favorites, and pulled fetish topics."
                    videos={adultRelatedRail}
                    variant="rail"
                  />
                  <TitleRail title="Continue watching" videos={adultContinueRail} variant="rail" />
                  <TitleRail title="I cummed to it" reason="Private local marks only — counts stay on this device." videos={adultMarkedRail} variant="rail" />
                  {(adultSource === "all" || adultSource === "reddit") && (
                    <TitleRail
                      title="Reddit photos & videos"
                      reason="Curated 18+ Atom feeds — photos, gifs, and v.redd.it / redgifs posters."
                      videos={adultRedditRail}
                      variant="rail"
                    />
                  )}
                  {(adultSource === "all" || adultSource === "rule34" || adultSource === "booru") && (
                    <TitleRail
                      title={`Rule34 · ${adultSourceCounts.rule34 ?? 0}`}
                      reason="First-class Rule34 filter — JSON API primary with HTML listing backup, surfaced alongside other booru hosts."
                      videos={sourceMatchedAdult.filter((video) => videoMatchesAdultSource(video, "rule34")).slice(0, Math.max(24, adultRailLimit))}
                      variant="rail"
                    />
                  )}
                  {adultTopTagRails.map((row) => (
                    <TitleRail
                      key={`adult-tag-rail-${row.tag}`}
                      title={`Top #${row.tag} · ${row.count}`}
                      reason={`Stabilized tag score ${Math.round(row.score)} from ${row.count} titles, ratings, saves, marks, recency, and taxonomy relevance. One-off tags stay out of these rails.`}
                      videos={row.videos}
                      variant="rail"
                    />
                  ))}
                  <section className="mb-5 rounded-xl border border-border bg-surface p-4 shadow-border">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Interest tags</p>
                        <p className="mt-1 text-sm text-muted">Interest tags narrow every Adult rail. Source tags select providers; creator tags identify performers; metadata tags describe format. Tap any card tag to filter Adults in place — the desk stays put.</p>
                      </div>
                      <Input
                        value={adultTagQuery}
                        onChange={(event) => setAdultTagQuery(event.target.value)}
                        placeholder="Filter tags…"
                        className="max-w-xs"
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ADULT_SOURCE_FILTERS.map((source) => (
                        <Button key={source.id} size="sm" variant={adultSource === source.id ? "default" : "secondary"} onClick={() => setAdultSource(source.id)}>
                          {source.label} · {source.id === "all" ? adultRemoteVideos.length : adultSourceCounts[source.id] ?? 0}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant={adultTag === "All" ? "default" : "secondary"} onClick={() => applyAdultTag("All")}>All adult tags</Button>
                      {heartedAdultTags.map((tag) => <Button key={`adult-hearted-${tag}`} size="sm" variant={adultTag === tag ? "default" : "secondary"} onClick={() => applyAdultTag(tag)}>♥ #{tag}</Button>)}
                      {visibleAdultTags.map((row) => (
                        <Button key={`adult-tag-${row.tag}`} size="sm" variant={adultTag === row.tag ? "default" : "secondary"} onClick={() => applyAdultTag(row.tag)}>
                          #{row.tag} · {row.count} · {Math.round(row.score)}
                        </Button>
                      ))}
                      {adultTagMatches.length > visibleAdultTags.length && visibleAdultTags.length < 36 && (
                        <Button size="sm" variant="secondary" onClick={() => setAdultTagVisibleCount((count) => Math.min(36, count + 10))}>
                          Show more · {Math.min(10, Math.min(36, adultTagMatches.length) - visibleAdultTags.length)} of {adultTagMatches.length}
                        </Button>
                      )}
                      {visibleAdultTags.length > 10 && (
                        <Button size="sm" variant="ghost" onClick={() => setAdultTagVisibleCount(10)}>
                          Show fewer
                        </Button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Showing {visibleAdultTags.length} of {adultTagMatches.length || adultTagRank.length} ranked tags
                      {adultTagQuery.trim() ? " (filtered)" : ""} · cap 36 on screen.
                      {heartedAdultTags.length ? ` · ${heartedAdultTags.length} hearted tag${heartedAdultTags.length === 1 ? "" : "s"} stay prioritized and retained in local history.` : ""}
                    </p>
                    {adultMetaTagRank.length > 0 && (
                      <div className="mt-4 border-t border-border pt-3">
                        <p className="text-xs font-medium tracking-[0.12em] text-accent uppercase">Ranked metadata</p>
                        <p className="mt-1 text-xs text-muted">Verified provider descriptors scored by ratings, saves, marks, recency, and cross-provider coverage. Use one to focus every Adult rail.</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {adultMetaTagRank.slice(0, 18).map((row) => (
                            <Button key={`adult-meta-${row.tag}`} size="sm" variant={adultTag === row.tag ? "default" : "secondary"} onClick={() => applyAdultTag(row.tag)}>
                              #{row.tag} · {row.count} · {Math.round(row.score)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {(adultTag !== "All" || adultSource !== "all") && (
                      <p className="mt-2 text-xs text-accent">
                        Showing {filteredEporner.length.toLocaleString()} {adultArtworkOnly ? "preview-ready " : ""}titles
                        {adultSource !== "all" ? ` · ${adultSource}` : ""}
                        {adultTag !== "All" ? ` · #${adultTag}` : ""}.
                      </p>
                    )}
                  </section>
                  <section className="mb-5 rounded-xl bg-elevated p-4 shadow-border">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult stats</p>
                        <p className="mt-1 text-sm text-muted">{adultRemoteVideos.length.toLocaleString()} cached titles · Reddit {adultSourceCounts.reddit ?? 0} · export tag ranks and source counts.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => exportAdultStats(buildAdultStatsSnapshot(adultRemoteVideos, folders, tags, { favorites, likes, cameCounts, viewCounts, ratingOf: getRating }), "csv")}>Export CSV</Button>
                        <Button size="sm" variant="secondary" onClick={() => exportAdultStats(buildAdultStatsSnapshot(adultRemoteVideos, folders, tags, { favorites, likes, cameCounts, viewCounts, ratingOf: getRating }), "json")}>Export JSON</Button>
                      </div>
                    </div>
                  </section>
                  <TitleRail
                    title="Latest from official adult APIs"
                    reason="Ranked catalog from official APIs and Reddit Atom — source chips actually filter these rails."
                    videos={adultLatestRail}
                    variant="rail"
                  />
                  <TitleRail title="From official adult APIs" reason="Windowed filtered catalog, ranked (first 120)." videos={adultCatalogRail} variant="rail" />
                  {adultView === "all" && <section className="mt-8 border-t border-border pt-5"><TitleRail title={`Adult live now · ${adultKindCounts.live}`} reason="Public live rooms stay together at the bottom of the combined Adult view, with their own rotating order." videos={adultRows.live} variant="rail" /></section>}
                  <PosterGrid videos={adultPosterCatalog} />
                      {!adultDeepVisible && (
                        <section className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-border">
                          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Deep discovery</p>
                          <h2 className="mt-2 font-display text-2xl text-fg">Milestones, private shelves, and history.</h2>
                          <p className="mt-1 text-sm text-muted">Link-out catalogs, private folder rails, and full adult history stay optional so opening Adults stays responsive with a large cached archive.</p>
                          <Button className="mt-4" variant="secondary" onClick={() => setAdultDeepVisible(true)}>Load milestones and private shelves</Button>
                        </section>
                      )}
                      {adultDeepVisible && (
                        <div data-private-shelves aria-busy={privateShelves.pending || privateOrder.pending}>
                          <section className="mb-6 rounded-xl bg-elevated p-5 shadow-border"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Private library</p><h1 className="mt-2 font-display text-4xl text-fg">Your shelves, your tags.</h1><p className="mt-2 text-sm text-muted">Tags, history, and organization remain private to this browser. Edit a title’s tags from its preview or player.</p></div><Button disabled={privateShelves.pending || privateOrder.pending || !privateOrder.rows.length} onClick={() => { const choices = privateOrder.rows; const pick = choices[Math.floor(Math.random() * choices.length)]; if (pick) openVideo(pick.id); }}><Shuffle className="size-4" /> Random private pick</Button></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={adultTag === "All" ? "default" : "secondary"} onClick={() => setAdultTag("All")}>All titles</Button>{visibleAdultTags.map((row) => <Button key={row.tag} size="sm" variant={adultTag === row.tag ? "default" : "secondary"} onClick={() => setAdultTag(row.tag)}>#{row.tag}</Button>)}{adultTagMatches.length > visibleAdultTags.length && visibleAdultTags.length < 36 && <Button size="sm" variant="secondary" onClick={() => setAdultTagVisibleCount((count) => Math.min(36, count + 10))}>Show more tags</Button>}</div><div className="mt-3 flex flex-wrap gap-2"><span className="self-center text-xs text-muted">Sort</span>{(["ranked", "recent", "name", "favorites", "tagged", "played"] as const).map((sort) => <Button key={sort} size="sm" variant={adultSort === sort ? "default" : "secondary"} onClick={() => setAdultSort(sort)}>{sort === "tagged" ? "Most tagged" : sort === "played" ? "Last played" : sort === "ranked" ? "Ranked" : sort}</Button>)}</div></section>
                          <div className="mb-6 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">Private favorite links</p><p className="mt-1 text-xs leading-5 text-muted">Reserved for your personally saved, consented links. Nothing is added or shared automatically.</p></div><div className="rounded-lg bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">Recommended sites</p><p className="mt-1 text-xs leading-5 text-muted">Reserved for future opt-in recommendations. Link sorting will stay separate from your private video catalog.</p></div></div>
                          <PrivateWebShortcuts />
                          {(privateShelves.error || privateOrder.error) ? <div role="alert" className="mb-5 rounded-lg bg-surface p-4 text-sm text-muted">Private shelves could not be prepared. {privateShelves.error || privateOrder.error}<Button size="sm" variant="secondary" className="ml-3" onClick={() => { privateShelves.retry(); privateOrder.retry(); }}>Retry private shelves</Button></div>
                            : (privateShelves.pending || privateOrder.pending) && <p role="status" className="mb-5 text-sm text-muted">Preparing private shelves… You can change the sort or switch pages.</p>}
                          <TitleRail title="Favorites" videos={readPrivateFavorites} variant="poster" />
                          <TitleRail title="Most organized" videos={privateShelfSources.organized} variant="rail" />
                          <TitleRail title="Needs a tag" videos={privateShelfSources.untagged} variant="rail" />
                          <TitleRail title="Recently added" videos={privateShelfSources.recent} variant="rail" />
                          <TitleRail title={adultTag === "All" ? "All private titles" : `Tagged · ${adultTag}`} videos={readPrivateOrder} variant="poster" />
                          <TitleRail title="History · #adult" videos={readPrivateHistory} variant="rail" playedAt={playedAt} />
                          {privateShelfSources.folders.map(({ folder, videos }) => (
                            <TitleRail
                              key={folder.id}
                              title={folder.name}
                              videos={videos}
                              variant="rail"
                            />
                          ))}
                          {adultFolders.length === 0 && (
                            <div className="rounded-xl bg-surface px-6 py-14 text-center shadow-border">
                              <Lock className="mx-auto size-6 text-muted" />
                              <p className="mt-3 font-display text-2xl text-fg">No private folders yet</p>
                              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                                Add a private folder, or lock an existing source. Those titles stay off
                                Home, Movies, and Favorites.
                              </p>
                              <Button className="mt-4" onClick={() => onAddFolder(undefined, true)}>
                                Add private folder
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                </>
              )}

              {sourceId === "favorites" && !query && (
                <div className="mb-6">
                  <h1 className="font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl">
                    Favorites
                  </h1>
                  <p className="mt-2 text-sm text-muted">Hearts and likes, together in one saved library. Quick shelves show up to 48 titles; your complete saved catalog is below.</p>
                  {savedNotVisible > 0 && <p className="mt-3 text-sm text-muted">{savedNotVisible} additional saved IDs are hidden or waiting for their source. Their hearts and likes are kept; check Recovery & export for details.</p>}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-md bg-elevated p-3 shadow-border"><p className="text-xs text-muted">Visible public titles</p><p className="mt-1 font-display text-2xl text-fg">{favoriteVideos.length}</p></div><div className="rounded-md bg-elevated p-3 shadow-border"><p className="text-xs text-muted">Local favorites</p><p className="mt-1 font-display text-2xl text-fg">{favoriteRails.ready ? favoriteRails.localCount : '…'}</p></div><div className="rounded-md bg-elevated p-3 shadow-border"><p className="text-xs text-muted">Provider favorites</p><p className="mt-1 font-display text-2xl text-fg">{favoriteRails.ready ? favoriteVideos.length - favoriteRails.localCount : '…'}</p></div><button type="button" onClick={() => setSource("stats")} className="rounded-md bg-elevated p-3 text-left shadow-border hover:bg-surface"><p className="text-xs text-muted">Recovery & export</p><p className="mt-1 text-sm font-medium text-accent">Open favorite diagnostics →</p></button></div>
                </div>
              )}
              {sourceId === "favorites" && !query && <FavoriteCollections />}
              {sourceId === "favorites" && !query && <div className="mb-6 rounded-lg bg-elevated p-4 shadow-border"><p className="text-sm font-medium text-fg">Photos and private favorites</p><p className="mt-1 text-xs text-muted">Photo hearts stay in the photo viewer. Private favorites stay in Adults. Creator and topic hearts appear above.</p><Button size="sm" variant="secondary" className="mt-3" onClick={() => { localStorage.setItem("reelcase.photos.favorites-only", "true"); setSource("photos"); }}>Open photo favorites</Button><Button size="sm" variant="secondary" className="mt-3 ml-2" onClick={() => { setAdultDeepVisible(true); setSource("adults"); }}>Open private favorites · {adultFavorites.length}</Button></div>}

              {sourceId === "favorites" && !query && favoriteVideos.length > 0 && (
                <>
                  <TitleRail title="Continue your favorites" videos={favoriteRails.continued} variant="rail" />
                  <TitleRail title="Favorite movies" videos={favoriteRails.movies} variant="poster" />
                  <TitleRail title="Favorite YouTube" videos={favoriteRails.youtube} variant="rail" />
                  <TitleRail title="Favorite Twitch" videos={favoriteRails.twitch} variant="rail" />
                  <TitleRail title="Most recently saved" videos={favoriteRails.recent} variant="rail" />
                  <h2 className="mb-3 font-display text-xl text-fg sm:text-2xl">Everything in My List</h2>
                </>
              )}
              {sourceId === "favorites" && !query ? (
                favoriteVideos.length ? (
                  <div className="w-full min-w-0" role="region" aria-label="Saved title catalog" aria-busy={savedSelection.pending}><div className="mb-4 flex flex-wrap gap-2" aria-label="Saved title filters">{(["all", "hearts", "likes"] as const).map(filter => <Button key={filter} variant={savedFilter === filter ? "default" : "secondary"} aria-pressed={savedFilter === filter} onClick={() => setSavedFilter(filter)}>{filter === "all" ? "All saved" : filter === "hearts" ? "Hearts" : "Likes"} · {filter === 'all' || favoriteRails.ready ? savedFilterCounts[filter].toLocaleString() : '…'}</Button>)}</div>{savedSelection.pending ? <p role="status" className="py-8 text-sm text-muted">Preparing saved titles…</p> : savedVideos.length ? <PosterGrid key={savedFilter} videos={savedVideos} /> : <p className="py-8 text-sm text-muted">No saved titles in this filter.</p>}</div>
                ) : (
                  <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-border">
                    <img src="/art/realhub-media-cards.webp" alt="" loading="lazy" className="mx-auto mb-4 h-28 w-36 object-contain" />
                    <p className="font-display text-2xl text-fg">Nothing in Favorites</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                      Heart or like a title to keep it here. Photo favorites have their own viewer above.
                    </p>
                  </div>
                )
              ) : null}

              {(sourceId === "history" ||
                sourceId === "continue" ||
                query ||
                (!browsing &&
                  sourceId !== "favorites" &&
                  sourceId !== "landing" &&
                  sourceId !== "movies" &&
                  sourceId !== "adults" &&
                  sourceId !== "adult-fetishes" &&
                  sourceId !== "genres" &&
                  sourceId !== "stats" &&
                  sourceId !== "connection" &&
                  sourceId !== "find-phone")) && (
                <>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h1 className="font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl">
                        {query ? "Search" : heading}
                      </h1>
                      <p className="mt-2 text-sm text-muted">
                        {query
                          ? searchPending ? "Searching your saved catalog…" : `${searchInsights.ranked.length.toLocaleString()} video${searchInsights.ranked.length === 1 ? "" : "s"}`
                          : sourceId === "history"
                          ? `${history.length} saved watch event${history.length === 1 ? "" : "s"} · ${historyLastDay} in the last 24 hours · no maximum · newest first`
                          : scanning
                          ? `Scanning ${scanning.folderName} · ${scanning.found} found`
                          : `${videos.length} video${videos.length === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    {sourceId === "history" && history.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant={historyWindow === "all" ? "default" : "secondary"} onClick={() => setHistoryWindow("all")}>All time</Button>
                        <Button size="sm" variant={historyWindow === "day" ? "default" : "secondary"} onClick={() => setHistoryWindow("day")}>24 hours</Button>
                        <Button size="sm" variant={historyWindow === "week" ? "default" : "secondary"} onClick={() => setHistoryWindow("week")}>7 days</Button>
                        <span data-history-export aria-busy={historyBrowse.exportState.busy} className="contents">
                          <Button size="sm" variant="secondary" disabled={!historyBrowse.ready || historyBrowse.exportState.busy} onClick={() => void historyBrowse.exportVisible()}>Export visible</Button>
                          {historyBrowse.exportState.busy && <Button size="sm" variant="secondary" onClick={historyBrowse.cancelExport}>Cancel export</Button>}
                        </span>
                        <Button variant="ghost" size="sm" onClick={clearHistory}>Clear history</Button>
                      </div>
                    )}
                  </div>
                  {query && <section className="mb-5 rounded-lg border border-border bg-surface p-4 shadow-border" aria-label="Search ranking and matching tags">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Search ranking</p>
                        <p className="mt-1 text-sm text-muted">Exact title and creator matches lead, followed by matching tags and your saved reactions. Description and path matches remain available.</p>
                      </div>
                      <span className="text-xs text-accent">{searchPending ? "Searching…" : searchInsights.ranked.length.toLocaleString() + " ranked results"}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
                      <Button size="sm" variant="secondary" disabled={searchPending} onClick={refreshSearchRanking}>Refresh ranking</Button>
                      <span role="status" aria-live="polite" data-search-ranking-updated={searchRankingUpdated} className="w-36 text-xs text-accent">{searchPending ? "Preparing order…" : searchRankingUpdated ? "New reactions ready" : "Ranking up to date"}</span>
                      <p className="w-full text-xs text-muted">Order stays fixed while you browse. Refresh to apply new ratings, likes and watch counts.</p>
                    </div>
                    {searchInsights.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
                      <span className="self-center text-xs text-muted">Top tags</span>
                      {searchInsights.tags.map(({ tag, count }) => <Button key={tag} size="sm" variant="secondary" onClick={() => {
                        if (sourceId === "adults" || sourceId === "adult-fetishes") {
                          setQuery(""); setSource("adults");
                          window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag } }));
                          return;
                        }
                        setQuery(tag);
                      }}>#{tag} · {count}</Button>)}
                    </div>}
                    {searchInsights.ranked.length > 0 && <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {searchInsights.ranked.slice(0, 3).map((video, index) => <button key={video.id} type="button" onClick={() => openVideo(video.id)} className="flex min-w-0 items-center gap-3 rounded-md bg-elevated px-3 py-3 text-left hover:bg-bg">
                        <span className="shrink-0 rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">#{index + 1}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-fg">{video.name}</span>
                          <span className="block truncate text-xs text-muted">{(video.remote?.channelName ?? topicsForVideo(video, tags[video.id]).slice(0, 2).join(" · ")) || "Library match"}</span>
                        </span>
                      </button>)}
                    </div>}
                  </section>}
                                    {(sourceId === "continue" || sourceId === "history") && !query && (adultContinue.length > 0 || adultHistoryTagged.length > 0) && (
                    <section className="mb-5 rounded-xl border border-border bg-surface p-5 shadow-border">
                      <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adults activity</p>
                      <h2 className="mt-2 font-display text-2xl text-fg">Private continue & history stay in Adults.</h2>
                      <p className="mt-1 text-sm text-muted">
                        Public Continue / History rails stay clean. Open Adults for private resume marks, fetish-tagged history, and I-cummed counters — catalog shelves on Home stay public-only.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => setSource("adults")}>Open Adults</Button>
                        <Button size="sm" variant="secondary" onClick={() => { setSource("adults"); setAdultDeepVisible(true); }}>
                          Adults history & shelves
                        </Button>
                      </div>
                      {sourceId === "continue" && adultContinue.length > 0 && (
                        <div className="mt-4"><TitleRail title="Adults · continue watching" videos={adultContinue.slice(0, 18)} variant="rail" /></div>
                      )}
                      {sourceId === "history" && adultHistoryTagged.length > 0 && (
                        <div className="mt-4"><TitleRail title="Adults · recent history · #adult" videos={adultHistoryTagged.slice(0, 18)} variant="rail" playedAt={playedAt} /></div>
                      )}
                    </section>
                  )}
{sourceId === "continue" && !query && (
                    <section className="mb-5 rounded-lg border border-border bg-surface p-4 shadow-border" aria-label="Continue recovery details">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Resume recovery</p><p className="mt-1 text-sm text-muted">Continue uses a provider URL or approved local path when a catalog card changes, then keeps the newest credible mark.</p></div>
                        <span className="text-xs text-subtle">{continueInsights.linked} ready to resume</span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-md bg-elevated px-3 py-2"><p className="text-xs text-muted">Durable marks</p><p className="mt-1 font-display text-xl text-fg">{continueInsights.valid}</p></div>
                        <div className="rounded-md bg-elevated px-3 py-2"><p className="text-xs text-muted">Stale, review-only</p><p className="mt-1 font-display text-xl text-fg">{continueInsights.stale}</p></div>
                        <div className="rounded-md bg-elevated px-3 py-2"><p className="text-xs text-muted">Resume rule</p><p className="mt-1 text-sm font-medium text-fg">Local 5 sec · providers 2 sec</p></div>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-subtle">Repair preview is non-destructive: invalid marks are rejected on recovery, while older marks remain visible for review and no file handle is reopened automatically.</p>
                      {continueVideos.length > 0 && <div className="mt-4 border-t border-border pt-3"><p className="text-xs font-medium tracking-[0.12em] text-muted uppercase">Why these are here</p><div className="mt-2 grid gap-2">{continueVideos.slice(0, 8).map((video) => { const mark = resumeForVideo({ progress, resumeProgress }, video); const percent = mark ? Math.round(mark.t / mark.d * 100) : 0; return <button key={video.id} onClick={() => openVideo(video.id)} className="flex min-h-11 min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border px-3 py-2 text-left sm:flex-nowrap"><span className="shrink-0 rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent">{video.remote ? "Provider key" : "Local path"}</span><span className="min-w-0 flex-1 truncate text-sm text-fg">{video.name}</span><span className="w-full shrink-0 text-xs text-muted sm:w-auto">{percent}% · {mark ? new Date(mark.at).toLocaleString() : "awaiting mark"}</span></button>; })}</div></div>}
                    </section>
                  )}
                  {sourceId === "history" && history.length > 0 && (
                    <section data-history-catalog aria-busy={historyBrowse.pending} className="mb-5 rounded-lg border border-border bg-surface p-4 shadow-border" aria-label="History controls">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-xs font-medium tracking-[0.12em] text-muted uppercase">Activity source</span>
                        {(["all", "open", "progress", "watch-room"] as const).map((kind) => (
                          <Button key={kind} size="sm" variant={historySource === kind ? "default" : "secondary"} aria-pressed={historySource === kind} onClick={() => setHistorySource(kind)}>
                            {kind === "all" ? "Everything" : kind === "open" ? "Direct opens" : kind === "progress" ? "Playback" : "Watch Room"}
                          </Button>
                        ))}
                      </div>
                      {historyBrowse.pending && <p role="status" className="mt-3 text-sm text-muted">Preparing your history…</p>}
                      {historyBrowse.error && <p role="alert" className="mt-3 text-sm text-danger">History could not be prepared: {historyBrowse.error}</p>}
                      {historyBrowse.exportState.busy && <p role="status" className="mt-3 text-sm text-muted">Preparing your history export…</p>}
                      {historyBrowse.exportState.error && <p role="alert" className="mt-3 text-sm text-danger">Could not export history: {historyBrowse.exportState.error}</p>}
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                        <label className="text-xs text-muted" htmlFor="history-retention">Keep activity</label>
                        <select id="history-retention" value={historyRetention} onChange={(event) => setHistoryRetention(event.target.value as typeof historyRetention)} className="min-h-9 rounded-md border border-border bg-elevated px-2 text-sm text-fg">
                          <option value="forever">Until I remove it</option><option value="week">7 days</option><option value="month">30 days</option><option value="year">1 year</option>
                        </select>
                        {historyRetention !== "forever" && <Button size="sm" variant="secondary" onClick={() => pruneHistory(historyRetentionCutoff)}>Remove older entries</Button>}
                        <span className="text-xs text-subtle">Export first if you want a copy.</span>
                      </div>
                    </section>
                  )}
                  {sourceId === "history" && (
                    <section className="mb-5 rounded-lg border border-border bg-surface p-4 shadow-border" aria-label="History recovery import">
                      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Recovery import</p><h2 className="mt-1 text-lg font-medium text-fg">Restore a saved activity pack.</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-muted">Merge a Realhub library pack to recover History, Continue marks, follows, favorites, ratings, Adult marks, and saved provider links. Duplicate activity is ignored; it never clears data already here.</p></div><Button size="sm" variant="secondary" onClick={importHistoryRecovery}><Upload className="size-4"/>Import recovery pack</Button></div>{historyImportNote && <p className="mt-3 text-xs text-accent" role="status">{historyImportNote}</p>}</section>
                  )}
                  {sourceId === "history" && historyTopTags.length > 0 && (
                    <div className="mb-5 rounded-lg bg-elevated px-4 py-3 shadow-border">
                      <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Historical interests</p>
                      <div className="mt-2 flex flex-wrap gap-2">{historyTopTags.map(([tag, count]) => <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">#{tag} · {count}</span>)}</div>
                    </div>
                  )}
                  {sourceId === "history" && history.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-muted shadow-border">
                      <span><strong className="text-fg">Viewing record</strong> · {historyRecovery.resumable} resumable activity mark{historyRecovery.resumable === 1 ? "" : "s"}</span>
                      <span>· {historyRecovery.sources.progress} playback</span>
                      <span>· {historyRecovery.sources.watchRoom} Watch Room</span>
                      <span>· {historyRecovery.sources.open} direct opens</span>
                    </div>
                  )}
                  {sourceId === "history" && history.length > 0 && (
                    <section className="mb-5 rounded-lg bg-elevated px-4 py-3 shadow-border" aria-label="History privacy and recovery">
                      <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local record</p>
                      <p className="mt-1 text-xs leading-5 text-muted">This device stores event time, source, optional playback position, and a provider URL only when available. Private and adult items remain behind the existing library gate.</p>
                      <p className="mt-1 text-xs text-subtle">{historyOrphans ? `${historyOrphans} recovered event${historyOrphans === 1 ? "" : "s"} can still use a saved provider link after its card left the catalog.` : "Saved provider links are retained so an evicted card can be recovered."}</p>
                    </section>
                  )}
                  {sourceId === "history" && history.length > 0 && (
                    <section className="mb-5 rounded-lg border border-border bg-surface p-4 shadow-border" aria-label="Recent history activity">
                      <div className="flex items-baseline justify-between gap-3"><p className="text-sm font-medium text-fg">Recent activity</p><p className="text-xs text-subtle">Times shown in your local timezone</p></div>
                      <div className="mt-3 grid min-w-0 grid-cols-1 gap-2">
                        {historyVisibleEntries.slice(0, 12).map((entry) => {
                          const video = historyVideoById.get(entry.id);
                          const label = entry.source === "watch-room" ? "Watch Room" : entry.source === "progress" ? "Playback" : "Direct open";
                          return <button key={entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`} disabled={!video} onClick={() => { if (video) { rememberVideo(useLibrary.getState().videos, video); openVideo(video.id); } }} className="flex min-h-11 min-w-0 flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2 text-left disabled:cursor-default disabled:opacity-75 sm:flex-nowrap">
                            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent">{label}</span>
                            <span className="min-w-0 flex-1 truncate text-sm text-fg">{video?.name ?? "Recovered activity — source card unavailable"}</span>
                            <time className="w-full shrink-0 text-right text-xs text-muted sm:w-auto" dateTime={new Date(entry.at).toISOString()} title={new Date(entry.at).toISOString()}>{new Date(entry.at).toLocaleString()}</time>
                          </button>;
                        })}
                      </div>
                      {!historyBrowse.pending && historyVisibleEntries.length === 0 && <p className="mt-3 text-sm text-muted">No activity matches this time and source filter. Try Everything or a longer time window; recovered cards appear when a saved provider URL is available.</p>}
                    </section>
                  )}
                  {folders.find((folder) => folder.id === sourceId)?.photoCount ? <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border"><p className="text-sm text-fg">This source also has {folders.find((folder) => folder.id === sourceId)?.photoCount} discovered photos.</p><Button size="sm" variant="secondary" onClick={() => { const folder = folders.find((item) => item.id === sourceId); if (folder) localStorage.setItem("reelcase.photos.source-filter", folder.name); setSource("photos"); }}>Browse this source’s photos</Button></div> : null}
                  {query && searchPending ? (
                    <div role="status" aria-live="polite" className="rounded-lg bg-surface px-6 py-12 text-sm text-muted">Preparing search results… You can keep typing or switch pages.</div>
                  ) : query && searchRankingError ? (
                    <div role="status" className="rounded-lg bg-surface px-6 py-12 text-sm text-muted">Search could not finish. <Button variant="secondary" size="sm" onClick={refreshSearchRanking}>Retry search</Button></div>
                  ) : sourceId === 'history' && !query && historyBrowse.pending ? (
                    <p role="status" className="py-8 text-sm text-muted">Preparing your history titles…</p>
                  ) : sourceId === "history" || sourceId === "continue" || query ? (
                    <VideoGrid
                      key={query ? `search:${searchRankingRevision}` : sourceId === 'history' ? `history:${historySource}:${historyWindow}` : sourceId}
                      videos={query ? searchInsights.ranked : sourceId === "history" ? historyBrowse.readers.videos : videos}
                      playedAt={sourceId === "history" ? historyBrowse.readers.playedAt : undefined}
                    />
                  ) : (
                    <PosterGrid videos={videos} />
                  )}
                </>
              )}

              {sourceId === DEMO_FOLDER_ID && (
                <p className="mt-8 text-center text-xs text-subtle">
                  Original shorts styled as classics. Add a folder to scan this computer.
                </p>
              )}
            </>
          )}
          </>}
        </main>
      </div>

      <VideoOverlays />
      <YoutubeDownloadHost />

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg/80">
          <div className="rounded-xl bg-surface px-8 py-6 text-center shadow-border shadow-lift">
            <p className="font-display text-2xl text-fg">Drop to add</p>
            <p className="mt-1 text-sm text-muted">Folders or video files</p>
          </div>
        </div>
      )}

      <input
        ref={dirInputRef}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        suppressHydrationWarning
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        onChange={(e) => {
          const files = e.target.files;
          const adult = pendingAdult.current;
          pendingAdult.current = false;
          if (files?.length) {
            void ingestFromInput(files, true, { adult }).catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Could not read folder");
            });
          }
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        suppressHydrationWarning
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) {
            void ingestFromInput(files, false).catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Could not read files");
            });
          }
          e.target.value = "";
        }}
      />

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-elevated text-fg shadow-border border-0",
            title: "text-fg",
            description: "text-muted",
          },
        }}
      />
    </div>
  );
}


