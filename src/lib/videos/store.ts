import { reconcilePlaylistWalks } from './youtube-playlist-walk';
import { youtubeEventNotices } from './youtube-events';
import { videoIsPrivate } from './public-visibility.ts';
import {retainAdultRefreshEvidence} from '../remote/adult-quality.ts';
import { prepareYoutubeTagReview,type YoutubeReviewBase } from './youtube-tag-review';
import { hydrateTopicAliases } from '../topic-alias-store';
import { markRecommendationOpened } from '../recommendation-exposure-store';
import { createYoutubeLiveThroughput } from './youtube-live-throughput';
import { reconcileYoutubeKnownBroadcasts } from './youtube-live-known';
import type { RefreshResult } from '@/lib/remote/api';
import { recentPullReady, recentPullFailure, recentPullSuccess } from './recent-pull';
import { TWITCH_QUICK_LIVE, selectTwitchQuickLiveChannels } from './twitch-quick-live';
import { YOUTUBE_QUICK_LIVE, selectYoutubeQuickLiveChannels, type YoutubeLiveProgress } from './youtube-quick-live';
import { createCompletionQueue } from '../completion-queue';
import { mergeYoutubeLiveResults } from './youtube-live-results';
import { loadImportSession } from './import-session-storage';
import { youtubeTextTags, automaticYoutubeTags, compactYoutubeTagEvidence, refreshYoutubeTags, YOUTUBE_TEXT_TAG_VERSION } from './youtube-text-tags';
import { decodeTwitchArchiveCursor } from './twitch-archive-cursor';
import { isRemovedRedditVideo } from './reddit-removed';
import { selectSavedCards, selectSavedCardsAsync } from "./saved-library";
import { updateYoutubeShelf, updateYoutubeShelfAsync } from "./youtube-shelf";
import { youtubePublicationTime, retainYoutubeMetadata, exactYoutubePublished, withYoutubePublication, compareYoutubePublication } from './youtube-metadata';
import type { YoutubeVideoMetadata } from '../remote/youtube-video-metadata';
import { youtubeDownloadTarget } from '../youtube-download';
import { memoizeSelector, memoizeSelectorInputs } from "./selector-cache";
import { HUB_SOURCES } from '../library-navigation';
import { catalogPullAvailable, waitForPulls, setPullViewerOpen, getPullCancellationRevision, pullsPaused, waitForCatalogCommit, automaticPullAvailable } from "@/lib/pull-control";
import { getPullSettings, type PullSettings } from '@/lib/pull-settings';
import { forEachCatalogSlice, forEachCatalogEntry, sortCatalogRows, copyCatalogArray, yieldCatalogTask } from "@/lib/catalog-work";
import { youtubeCatalogSelection } from './youtube-catalog-selection';
import { walkAdultPull } from './adult-pull-walk';
import { adultProviderPullBudget } from './adult-pull-plan';
import { catalogCard, withCatalogDetails } from './catalog-card';
import { prepareCatalogRestore, reconcileRestoredResume, sameRestoreInputs } from './catalog-restore';
import { beginStartupPhase, finishStartupPhase, markCatalogReady, beginFirstShelfRoute } from '../first-shelf-trace';
import { viewerDetails } from './viewer-details';
import { SliceWriter } from '../slice-writer';
import { create } from "zustand";
import { createShortLocalId } from "@/lib/local-id";
import {
  ADULT_FOLDER_BY_PROVIDER,
  ADULT_FOLDER_IDS,
  ADULT_PULL_PROVIDERS,
  EPORNER_FOLDER_ID,
  REDTUBE_FOLDER_ID,
  RETIRED_ADULT_SOURCE_IDS,
  adultIngestTags,
  isAdultPullKind,
  type AdultPullProvider,
} from "./adult-sites";
import { loadAdultArchiveCursors, saveAdultArchiveCursors, recordAdultArchiveFailure } from "./adult-archive-cursors";
import { adultFolderIds } from './adult-providers';
import { movieEvidence } from './content-classification';
import { restorePhotoFolders } from './folder-privacy';
import { applyCachedAdultUrls, cacheAdultVideoUrls } from "./adult-url-cache";
import { redditIngestExtras } from "./adult-reddit-tags";
import {
  findFreshAdultPullFingerprint,
  rememberAdultPullFingerprint,
} from "@/lib/remote/adult-pull-cache";
import { mergeRemoteCatalog, prepareIndexedRemoteCatalog, prepareRefreshSavedIds, mergeRemoteRefreshAsync, remoteVideoIndexAsync, mergeRemoteCatalogAsync } from "./remote-merge";
import { entryGroup, admitRemoteEntries, holdEntryLimitCursors, remoteEntryCounts, remainingEntrySlots, rememberEntryCounts } from './entry-limits';
import { CLEANUP_GROUPS, adultAdmissionPolicy, cleanupBudgets, cleanupBudgetAvailable, consumeCleanupBudget, canRotateForGroup, replacementRequestBudget, cleanupLabel, cleanupPolicy, rotationAvailable, cleanupKey, cleanupSourceKeys, emptyYoutubeCleanup, planYoutubeCleanup, recordYoutubeCleanup, retiredYoutubeKeys, youtubeCleanupProtected, type CleanupBudgets, type CleanupGroup, type YoutubeCleanupJournal } from './youtube-cleanup';
import { mergeTwitchClipObservation, retainNewerTwitchClipFollow } from "./twitch-clip-freshness";
import { canonicalFollowHandle, dedupeFollows, mergeResolvedFollow } from "./follow-identity";
import { youtubeIdentityReviews } from "./youtube-identity-review";
import { importedFollowStub, repairYoutubeImport, resolvedFollowQueries, reviewYoutubeImport, bindYoutubeCorrection } from './follow-import';
import { selectTwitchRefreshBatch, selectTwitchPolicyBatch } from './twitch-refresh-selection';
import { normalizeTwitchPullPolicy, twitchPolicyAllows, twitchPullPolicy, type TwitchPullPolicy } from './twitch-pull-policy.ts';
import { retainYoutubeLiveFollow, YOUTUBE_LIVE_HOLD_MS } from './live-retention';
import { youtubeLiveFailure, youtubeLiveCooldown } from './youtube-live-health';
import { classifyTwitchFailure, twitchRetryPatch } from './twitch-retry';
import { restoreYoutubeCooldown, saveYoutubeCooldown, clearYoutubeCooldown, youtubeCooldownMessage, type RefreshFollowsResult } from '../remote/youtube-pull-feedback';
import { lookupVideo, rememberVideo } from "./video-lookup";
import { activityLookup, activityLookupAsync, activityCandidates, activityCandidatesAsync } from './activity-lookup';
import { canonicalTopic, reconcileProviderTopicTags, topicsForVideo } from "./topics";
import type { CachedTagPatch } from "./tag-patches";
import { idleEnrichment, setEnrichmentViewerOpen } from '../idle-work';
import { patchSparseRecord, sparseRecordBuilder, removeSparseRecordKeys, sparseRecordScan } from '../sparse-record';
import { patchActivityRecord, recoverActivityCounts, recoverResumeRecords } from './activity-records';
import { createDeferredEvents } from '../deferred-events';
import { enrichmentCursor, metadataEnrichmentStep, type MetadataTailResult } from './metadata-enrichment';
import { youtubeVideoKey } from "../remote/youtube-sources";
import { catalogIdentityKeys, catalogIdentityKey, lookupCatalogIdentity } from "./catalog-identity.ts";
import { youtubeCoverageCounts, youtubeCoverageIndexAsync } from '../remote/youtube-coverage';
import { measureInteraction, scheduleBackgroundWork } from "@/lib/interaction-budget";
import { exportFeedback, hydrateDurableFeedback, getFeedbackRevision, warmLegacyRatings, verifyCleanupFeedback } from "@/lib/media-feedback";
import {
  appendCatalogVideos,
  appendActivityJournal,
  clearActivityJournal,
  pruneActivityJournal,
  loadActivityJournal,
  loadActivitySnapshot,
  loadRemoteSnapshot,
  withCatalogRead,
  removeRemoteSnapshotVideos,
  saveRemoteSnapshot,
  saveYoutubeCleanup,
  clearFolderVideos,
  deleteDirHandle,
  loadCatalogVideos,
  loadCatalogVideo,
  loadDirHandles,
  loadPrefs,
  loadFollows,
  restoreDurablePrefs,
  restoreDurableFollows,
  restoreDurableHistory,
  restoreDurableResume,
  restoreDurableMarks,
  restoreDurableShelves,
  restoreDurableLinks,
  saveRecoveryLinks,
  saveFollows,
  saveDurableHistory,
  saveDurableResume,
  saveDurableMarks,
  saveDurableShelves,
  saveSavedShelfEdit,
  saveDurableLinks,
  saveCatalogMetadataEdit,
  restoreCatalogMetadata,
  recoverCatalogMutations,
  waitForDurableWrites,
  waitForPrefsWrites,
  waitForFollowsWrites,
  restoreTagEdits,
  restoreMetadataEdits,
  saveEnrichmentRows,
  saveCreatorCoverageRows,
  removeEnrichmentRows,
  restoreEnrichmentRows,
  loadSourceHealth,
  saveDirHandle,
  saveActivitySnapshot,
  saveFolderVideos,
  savePrefs,
  saveViewPrefs,
  saveSourceHealth,
  type Prefs,
  type SavedVideoLink,
  restoreDurablePhotos,
  saveDurablePhotos,
} from "./persist";
import {
  ingestDataTransfer,
  ingestDirectoryHandle,
  ingestFileList,
  pickDirectory,
  queryDirPermission,
  requestDirPermission,
  type ScanProgress,
} from "./scan";
import { forgetFolder, rememberDirHandle, getDirHandle } from "./sources";
import type {
  AppNotice,
  Folder,
  FollowedChannel,
  HistoryEntry,
  LibraryVideo,
  MetadataTagSource,
  ProgressMark,
  ResumeMark,
  SortKey,
  SourceId,
  ViewMode,
  VideoMetadataProvenance,
  WellKnownStart,
} from "./types";
import { getRating } from "../media-feedback";

import { useSourceAssets } from "@/lib/source-assets";
import { isClassicVideo, SYSTEM_SOURCES } from "./types";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import { selectYoutubeLiveChannels, selectYoutubeSweepChannels } from "@/lib/remote/youtube-sweep";
import { selectLiveRefreshChannels } from './live-refresh-selection';
import { scheduledYoutubeSources } from '@/lib/remote/background-refresh';
import { selectYoutubeFeedChannels } from '@/lib/remote/youtube-sweep';
import { creatorCoverageRepairStep, type CreatorCoverageRepairResult } from './creator-coverage-repair';
export type { CreatorCoverageRepairResult } from './creator-coverage-repair';
import { loadPullHistory, makePullId, savePullHistory, type PullActivity, type PullRecord } from "@/lib/remote/pull-ledger";
import { beginYoutubeFirstClick, markYoutubeProviderFinish, markYoutubeProviderStart } from "@/lib/youtube-first-click-trace";
import { clearLowPriorityImageQueue } from "./image-load-budget";
import { planFollowRemoval, retainVideosAfterUnfollow } from "./follow-removal";
import type { AdultPullDiagnostic } from "@/lib/remote/api";
import {
  followRemote,
  importChannels,
  refreshRemotes,
  searchAdultVideos,
} from "@/lib/remote/functions";

let restoring = false;
let navigationChanged = false;
// A full provider refresh is intentionally bounded. Rotate that window instead
// of repeatedly checking the first saved channels, which left large Twitch
// libraries with stale live state forever.
let remoteRefreshCursor = 0;
let twitchRefreshCursor = 0;
let twitchPolicyCursor = 0;
let youtubeRefreshCursor = 0;
let youtubeLiveCheckBusy = false;
let twitchLiveCheckBusy = false;
const historyRecoveryCardCache = new Map<string, { signature: string; video: LibraryVideo }>();
const REMOTE_REFRESH_BATCH_SIZE = LIBRARY_LIMITS.remoteRefreshChannelBatch;
const STARTER_FOLLOWS: FollowedChannel[] = [
  { id: "yt:starter-h3", kind: "youtube", handle: "H3Podcast", title: "H3 Podcast" },
  { id: "yt:starter-ltt", kind: "youtube", handle: "LinusTechTips", title: "Linus Tech Tips" },
  { id: "tw:starter-ironmouse", kind: "twitch", handle: "ironmouse", title: "Ironmouse" },
  { id: "tw:starter-zackrawrr", kind: "twitch", handle: "zackrawrr", title: "Zackrawrr" },
];

export type AddOpts = { adult?: boolean };

export type { MetadataTailResult } from './metadata-enrichment';
const metadataTailCursor = enrichmentCursor();

export type LibraryState = {
  folders: Folder[];
  videos: LibraryVideo[];
  query: string;
  searchResult: { query: string; ids: Set<string>; positions?: Uint32Array; videos: LibraryVideo[]; tags: Record<string, string[]>; categories: Record<string, string> } | null;
  sort: SortKey;
  view: ViewMode;
  sourceId: SourceId;
  favorites: Record<string, true>;
  likes: Record<string, true>;
  tags: Record<string, string[]>;
  metadataProvenance: Record<string, VideoMetadataProvenance>;
  categories: Record<string, string>;
  progress: Record<string, ProgressMark>;
  resumeProgress: Record<string, ResumeMark>;
  history: HistoryEntry[];
  viewCounts: Record<string, number>;
  cameCounts: Record<string, number>;
  hideDemo: boolean;
  /** Adult cards carrying the user-managed #hidden tag stay out of every Adult rail. */
  showHiddenAdult: boolean;
  hardwareAccel: boolean;
  adultPinHash: string | null;
  adultsUnlocked: boolean;
  activeId: string | null;
  previewId: string | null;
  scanning: ScanProgress | null;
  hydrated: boolean;
  follows: FollowedChannel[];
  notices: AppNotice[];
  unavailable: Record<string, true>;
  hiddenVideos: Record<string, true>;
  notifyPush: boolean;
  remoteBusy: boolean;
  youtubeCleanup: YoutubeCleanupJournal;
  youtubeCleanupNote: string;
  cleanupNotes: Partial<Record<CleanupGroup, string>>;
  cleanupYoutubeCache: () => Promise<number>;
  cleanupRemoteCache: (group: CleanupGroup) => Promise<number>;
  remoteCheckedAt: number;
  refreshing: boolean;
  remoteRefreshStatus: { at: number; checked: number; refreshed: number; failed: number; youtube: number; twitch: number; action?: string; retryAt?: number; error?: string; cooldownScope?: 'catalog' | 'page' | 'feed' | 'live' | 'details' | 'all' } | null;
  youtubeRefreshStatus: LibraryState["remoteRefreshStatus"];
  youtubeLiveProgress: YoutubeLiveProgress | null;
  twitchLiveProgress: YoutubeLiveProgress | null;
  /** Provider retry deadlines keyed by followed-channel id. Focused refreshes bypass these. */
  remoteRetryAt: Record<string, number>;
  importProgress: { done: number; total: number; label: string } | null;
  /** Latest adult provider outcomes. Retained after partial success so callers can explain a failed source. */
  adultPullStatus: {
    note: string;
    diagnostics: Array<{ provider: string; status: "loaded" | "empty" | "failed"; titles: number; detail: string }>;
  } | null;
  pullActivity: PullActivity | null;
  pullHistory: PullRecord[];
  beginPull: (activity: Omit<PullActivity, "status">) => void;
  updatePull: (update: Partial<Pick<PullActivity, "done" | "received" | "added" | "failed" | "targets">>) => void;
  finishPull: (record: PullRecord) => void;
  setQuery: (q: string) => void;
  setSort: (s: SortKey) => void;
  setView: (v: ViewMode) => void;
  setSource: (id: SourceId) => void;
  toggleFavorite: (id: string) => void;
  toggleLike: (id: string) => void;
  markCame: (id: string) => void;
  setVideoTags: (id: string, tags: string[]) => void;
  /** Apply explicitly reviewed local enrichment without creating a manual-field lock. */
  applyReviewedTags: (id: string, tags: string[], source: "companion-inspection" | "local-vision") => number;
  /** Backward-compatible Companion-specific entry point for reviewed metadata. */
  applyCompanionTags: (id: string, tags: string[]) => number;
  setVideoComments: (id: string, comments: NonNullable<LibraryVideo["remote"]>["comments"]) => void;
  setYoutubePublication: (id: string, date: string, youtubeId: string) => Promise<boolean>;
  setYoutubeMetadata: (id: string, metadata: YoutubeVideoMetadata) => Promise<{ tags: number; locked: boolean }>;
  acceptYoutubeTagSuggestions:(id:string,selected:string[],base:YoutubeReviewBase)=>number;
  setLocalVideoDuration: (id: string, duration: number) => Promise<void>;
  releaseVideoComments: () => void;
  autoTagLibrary: () => Promise<number>;
  /** Apply the next small cache-only metadata batch, retaining all manual locks. */
  enrichMetadataTail: () => Promise<MetadataTailResult>;
  repairCachedMetadata: () => void;
  /** Backfill a missing creator name only from an exact saved provider identifier. */
  repairCreatorCoverage: () => Promise<CreatorCoverageRepairResult>;
  setVideoCategory: (id: string, category: string) => void;
  markProgress: (id: string, t: number, d: number) => void;
  recordPlay: (id: string, source?: HistoryEntry["source"]) => void;
  clearHistory: () => void;
  pruneHistory: (before: number) => void;
  getResumeRepairPreview: () => { valid: number; invalid: number; stale: number; recoverable: number };
  openVideo: (id: string) => void;
  openPreview: (id: string, card?: LibraryVideo) => void;
  closePreview: () => void;
  closePlayer: () => void;
  removeVideo: (id: string) => void;
  hideVideo: (id: string) => void;
  unhideVideo: (id: string) => void;
  playRelative: (delta: number, playlist: string[]) => void;
  setHideDemo: (hide: boolean) => void;
  setShowHiddenAdult: (show: boolean) => void;
  setHardwareAccel: (on: boolean) => void;
  setFolderAdult: (folderId: string, adult: boolean) => void;
  searchAdultFeed: (query?: string, order?: string, opts?: { page?: number; maxVideos?: number; append?: boolean; providers?: AdultPullProvider[] | "all"; providerPages?: Partial<Record<AdultPullProvider, number>>; redditSources?: Array<{ subreddit: string; priority: number }>; resumeArchive?: boolean; automatic?: boolean }) => Promise<number>;
  addFolder: (
    inputEl?: HTMLInputElement | null,
    startIn?: WellKnownStart,
    opts?: AddOpts,
  ) => Promise<void>;
  addFiles: (inputEl?: HTMLInputElement | null) => Promise<void>;
  ingestFromInput: (files: FileList, asDirectory: boolean, opts?: AddOpts) => Promise<void>;
  ingestDrop: (dt: DataTransfer) => Promise<void>;
  restoreFolders: () => Promise<void>;
  restoreOne: (folderId: string) => Promise<void>;
  repairArtworkSource: (folderId: string) => Promise<boolean>;
  refreshSourcePhotos: (folderId: string) => Promise<number>;
  removeFolder: (folderId: string) => Promise<void>;
  followRemoteQuery: (query: string, kind?: "auto" | "youtube" | "twitch", opts?: { restartPlaylist?: boolean; freshTwitchClips?: boolean; clipLimit?: number; twitchVodLimit?: number; twitchClipMode?: "recent" | "archive"; correctFollowId?: string }) => Promise<void>;
  importBatch: (
    items: { query: string; kind: "youtube" | "twitch" }[],
  ) => Promise<{ ok: number; failed: number; failedQueries: string[]; failedReasons: Record<string, string> }>;
  unfollow: (id: string) => void;
  unfollowMany: (ids: string[]) => void;
  acknowledgeYoutubeIdentity: (id: string, fingerprint: string) => void;
  setTwitchPullPolicy: (id: string, policy: TwitchPullPolicy) => void;
  updateFollowProfiles: (profiles: Array<{ id: string; thumb?: string; description?: string }>) => void;
  retainLiveRoom: (video: LibraryVideo) => Promise<boolean>;
  refreshFollows: (kind?: "twitch" | "youtube", options?: { youtubeFeedRepair?: boolean; catalog?: boolean; force?: boolean; scheduled?: boolean; youtubeLiveOnly?: boolean; twitchLiveOnly?: boolean; liveSweep?: boolean; liveDemand?: boolean; twitchRoutine?: boolean; twitchContinueArchive?: boolean; channelIds?: string[] }) => Promise<RefreshFollowsResult>;
  pushNotice: (n: Omit<AppNotice, "id" | "at" | "read">) => void;
  markNoticesRead: () => void;
  setNotifyPush: (on: boolean) => void;
  markUnavailable: (id: string, reason: string) => void;
};

let preferencesRestored = false;
let restoreCompletion:Promise<void>|undefined;
let personalRestoreCompletion:Promise<void>=Promise.resolve();
let savedShelfRevision = 0;
const durableSliceWriter = new SliceWriter();
function journalManualMetadata(id:string,field:"tags"|"category",get:()=>LibraryState,set:(patch:Partial<LibraryState>)=>void){
  const state=get(),saved=saveCatalogMetadataEdit({id,field,tags:state.tags[id]??[],provenance:state.metadataProvenance[id]??{tags:{}},category:state.categories[id]});
  if(saved?.provenance)set({metadataProvenance:patchSparseRecord(state.metadataProvenance,[[id,saved.provenance]])});
}
function persistNow(get: () => LibraryState) {
  if (!preferencesRestored) return;
  const s = get();
  const prefs: Prefs = {
    favorites: Object.keys(s.favorites),
    likes: Object.keys(s.likes),
    tags: s.tags,
    metadataProvenance: s.metadataProvenance,
    categories: s.categories,
    progress: s.progress,
    resumeProgress: s.resumeProgress,
    history: s.history,
    viewCounts: s.viewCounts,
    cameCounts: s.cameCounts,
    view: s.view,
    sort: s.sort,
    hideDemo: s.hideDemo,
    sourceId: s.sourceId === "adults" || s.sourceId === "adult-fetishes" ? "home" : s.sourceId,
    hardwareAccel: s.hardwareAccel,
    privateFolderIds: s.folders.filter((f) => f.adult).map((f) => f.id),
    adultPinHash: s.adultPinHash,
    sortDir: "asc",
    extFilter: "all",
    sizeFilter: "any",
    playableOnly: false,
    groupBy: "none",
    follows: s.follows,
    notices: s.notices.slice(0, 40),
    notifyPush: s.notifyPush,
    unavailableVideoIds: Object.keys(s.unavailable),
    hiddenVideoIds: Object.keys(s.hiddenVideos),
  };
  // Follow lists are durable on their own key/store so Adult tag bloat,
  // history caps, and thumb prune cannot erase YouTube/Twitch subscriptions.
  durableSliceWriter.write('follows', [s.follows], () => saveFollows(s.follows));
  persistActivityNow(get, true);
  durableSliceWriter.write('shelves', [s.favorites, s.likes], () => saveDurableShelves(Object.keys(s.favorites), Object.keys(s.likes)));
  const photoFolders = s.folders.filter(folder => folder.kind === 'directory' || folder.kind === 'files');
  durableSliceWriter.write('photos', photoFolders, () => {
    const photoSources = photoFolders.map(folder => ({
      id: folder.id,
      name: folder.name,
      kind: folder.kind as 'directory' | 'files',
      ...(folder.photoCount != null ? { photoCount: folder.photoCount } : {}),
      ...(folder.lastCheckedAt != null ? { lastCheckedAt: folder.lastCheckedAt } : {}),
    }));
    if (photoSources.length) saveDurablePhotos({ sources: photoSources });
  });
  durableSliceWriter.write('preferences', [s.favorites, s.likes, s.tags, s.metadataProvenance, s.categories, s.progress, s.resumeProgress, s.history, s.viewCounts, s.cameCounts, s.view, s.sort, s.hideDemo, s.sourceId, s.hardwareAccel, s.folders, s.adultPinHash, s.follows, s.notices, s.notifyPush, s.unavailable, s.hiddenVideos], () => savePrefs(prefs));
}

function persistActivityNow(get: () => LibraryState, snapshot = false) {
  if (!preferencesRestored) return;
  const s = get();
  durableSliceWriter.write('history', [s.history], () => saveDurableHistory(s.history));
  durableSliceWriter.write('resume', [s.progress, s.resumeProgress], () => saveDurableResume(s.progress, s.resumeProgress));
  durableSliceWriter.write('marks', [s.viewCounts, s.cameCounts], () => saveDurableMarks(s.viewCounts, s.cameCounts));
  // A heartbeat changes timestamps, not playback URLs. Refresh the recovery
  // links on a new history event or an explicit save instead of every tick.
  durableSliceWriter.write('links', snapshot ? [s.history, s.resumeProgress] : [s.history], () => { void saveRecoveryLinks(s.history, s.resumeProgress); });
  // Dedicated history/resume/marks already persist playback. The legacy broad
  // recovery snapshot is needed for explicit preference saves, not every tick.
  if (snapshot) durableSliceWriter.write('activity', [s.history, s.progress, s.resumeProgress, s.viewCounts, s.cameCounts], () => {
    void saveActivitySnapshot({ history: s.history, progress: s.progress, resumeProgress: s.resumeProgress, viewCounts: s.viewCounts, cameCounts: s.cameCounts, savedAt: Date.now() }).catch(() => queueResumeReplay(s.resumeProgress));
  });
}

let cancelActivitySave: (() => void) | undefined;
function persistActivity(get: () => LibraryState) {
  if (typeof window === 'undefined') { persistActivityNow(get); return; }
  // The small per-event journal is already queued by the action. Larger resume
  // snapshots wait for the foreground interaction to paint and read latest state.
  if (cancelActivitySave) return;
  cancelActivitySave = scheduleBackgroundWork(() => {
    cancelActivitySave = undefined;
    persistActivityNow(get);
  }, { timeoutMs: 1000, fallbackDelayMs: 250 });
}

function mergeHistory(a: HistoryEntry[], b: HistoryEntry[]): HistoryEntry[] {
  const rows = new Map<string, HistoryEntry>();
  for (const entry of [...a, ...b]) {
    if (!entry?.id || !Number.isFinite(entry.at)) continue;
    const key = entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`;
    if (!rows.has(key)) rows.set(key, entry);
  }
  return [...rows.values()].sort((left, right) => right.at - left.at);
}

const historyJournalSession = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
  ? crypto.randomUUID().slice(0, 8)
  : Math.random().toString(36).slice(2, 10);
let historyEventSequence = 0;
function nextHistoryEventId(now: number) {
  historyEventSequence = (historyEventSequence + 1) % 1_000_000;
  return `h:${historyJournalSession}:${now.toString(36)}:${historyEventSequence.toString(36)}`;
}

const RESUME_QUEUE_KEY = "reelcase.resume-replay.v1";
const MAX_RESUME_DURATION = 30 * 24 * 60 * 60;
function validResumeMark(mark: ProgressMark | undefined): mark is ResumeMark {
  return Boolean(mark && Number.isFinite(mark.t) && Number.isFinite(mark.d) && Number.isFinite(mark.at) && mark.d > 0.25 && mark.d <= MAX_RESUME_DURATION && mark.t >= 0 && mark.t <= mark.d * 1.015);
}
function normalizeResumeMark(mark: ProgressMark | undefined): ResumeMark | undefined {
  if (!validResumeMark(mark)) return undefined;
  return { t: Math.min(mark.t, mark.d), d: mark.d, at: mark.at };
}
function stableResumeKeys(video: LibraryVideo): string[] {
  return [...new Set([`id:${video.id}`, video.remote?.watchUrl, video.remote?.embedUrl, video.src, video.path].filter((key): key is string => Boolean(key)))];
}
function newestResume(...marks: Array<ProgressMark | undefined>): ResumeMark | undefined {
  return marks.reduce<ResumeMark | undefined>((best, mark) => {
    const normalized = normalizeResumeMark(mark);
    return normalized && (!best || normalized.at > best.at) ? normalized : best;
  }, undefined);
}
function isResumable(video: LibraryVideo, mark: ResumeMark | undefined) {
  if (!mark) return false;
  // A percentage-only floor meant a two-hour local movie needed almost five
  // minutes of playback before it appeared in Continue. Keep a small real-time
  // floor instead, while retaining the near-finish completion rule.
  const minimumSeconds = video.remote ? 2 : 5;
  const completeAt = video.remote ? 0.992 : 0.985;
  return mark.t >= minimumSeconds && mark.t / mark.d < completeAt;
}
function reconcileResumeForVideos(videos: LibraryVideo[], progress: Record<string, ProgressMark>, resumeProgress: Record<string, ResumeMark>) {
  const updates: Array<readonly [string, ResumeMark]> = [], changed = new Map<string, ResumeMark>();
  for (const video of videos) {
    // A large catalog is mostly unwatched. Check its stable aliases directly
    // instead of allocating an array and Set for every card on each restore.
    const mark = newestResume(
      changed.get(video.id) ?? progress[video.id],
      resumeProgress[`id:${video.id}`],
      video.remote?.watchUrl ? resumeProgress[video.remote.watchUrl] : undefined,
      video.remote?.embedUrl ? resumeProgress[video.remote.embedUrl] : undefined,
      video.src ? resumeProgress[video.src] : undefined,
      video.path ? resumeProgress[video.path] : undefined,
    );
    const before = changed.get(video.id) ?? progress[video.id];
    if (mark && (before?.t !== mark.t || before.d !== mark.d || before.at !== mark.at)) { changed.set(video.id, mark); updates.push([video.id, mark]); }
  }
  // Track these touched keys just like playback ticks so the next emergency
  // mirror does not export the entire newly patched progress ledger.
  return patchActivityRecord(progress, updates);
}
function queueResumeReplay(records: Record<string, ResumeMark>) {
  try {
    const existing = JSON.parse(localStorage.getItem(RESUME_QUEUE_KEY) ?? "{}") as Record<string, ResumeMark>;
    const next = { ...existing, ...records };
    const kept = Object.entries(next).filter(([, mark]) => validResumeMark(mark)).sort((a, b) => b[1].at - a[1].at).slice(0, 600);
    localStorage.setItem(RESUME_QUEUE_KEY, JSON.stringify(Object.fromEntries(kept)));
  } catch { /* storage is unavailable too; the in-memory point remains usable */ }
}
function takeQueuedResumeReplay(): Record<string, ResumeMark> {
  try {
    const queued = JSON.parse(localStorage.getItem(RESUME_QUEUE_KEY) ?? "{}") as Record<string, ResumeMark>;
    localStorage.removeItem(RESUME_QUEUE_KEY);
    return Object.fromEntries(Object.entries(queued).filter(([, mark]) => validResumeMark(mark)));
  } catch { return {}; }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let cancelPrefsSave: (() => void) | undefined;

function persistSoon(get: () => LibraryState) {
  if (typeof window === "undefined") {
    persistNow(get);
    return;
  }
  if (persistTimer != null || cancelPrefsSave) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    cancelPrefsSave = scheduleBackgroundWork(() => { cancelPrefsSave = undefined; persistNow(get); });
  }, 900);
}

function flushPersist(get: () => LibraryState) {
  cancelPrefsSave?.(); cancelPrefsSave = undefined;
  cancelActivitySave?.(); cancelActivitySave = undefined;
  if (persistTimer != null) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  persistNow(get);
}


function mergeVideos(existing: LibraryVideo[], incoming: LibraryVideo[]) {
  const positions = new Map<string, number>();
  for (let index = 0; index < existing.length; index++) {
    const video = existing[index];
    positions.set(video.id, index);
    const key = youtubeVideoKey(video);
    for(const alias of catalogIdentityKeys(video)) if(!positions.has(alias)) positions.set(alias,index);
  }
  return mergeRemoteCatalog(existing, incoming.map(catalogCard), positions, []);
}

function youtubeGoLiveAlerts() {
  try {
    return (
      JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}")[
        "alerts-go-live-alerts"
      ] === true
    );
  } catch {
    return false;
  }
}
async function reconcilePlaylistCommit(
  get: () => LibraryState,
  set: (patch: Partial<LibraryState>) => void,
  channels: FollowedChannel[],
) {
  if (
    !channels.some(
      (c) =>
        c.playlistWalk?.completed &&
        c.playlistWalk.membership === "provisional",
    )
  )
    return;
  for (;;) {
    const snapshot = get();
    const eligible = channels.filter((c) =>
      snapshot.follows.some(
        (f) =>
          f.id === c.id &&
          f.playlistWalk?.id === c.playlistWalk?.id &&
          f.playlistWalk?.at === c.playlistWalk?.at,
      ),
    );
    const result = await reconcilePlaylistWalks(snapshot.videos, eligible);
    if (get().videos !== snapshot.videos || get().folders !== snapshot.folders)
      continue;
    const observed = new Map(result.channels.map((c) => [c.id, c]));
    const folders = snapshot.folders.map((f) =>
      result.folderDeltas?.has(f.id)
        ? {
            ...f,
            videoCount: Math.max(
              0,
              (f.videoCount ?? 0) + (result.folderDeltas.get(f.id) ?? 0),
            ),
          }
        : f,
    );
    if (
      result.folderDeltas?.has("youtube:retained") &&
      !folders.some((f) => f.id === "youtube:retained")
    )
      folders.push({
        id: "youtube:retained",
        name: "Retained YouTube videos",
        kind: "youtube",
        videoCount: result.folderDeltas.get("youtube:retained") ?? 0,
      });
    set({
      videos: result.videos,
      folders,
      follows: get().follows.map((c) => {
        const next = observed.get(c.id);
        return next &&
          next.playlistWalk?.id === c.playlistWalk?.id &&
          next.playlistWalk?.at === c.playlistWalk?.at
          ? { ...c, playlistWalk: next.playlistWalk }
          : c;
      }),
    });
    if (result.changed.length) await cacheRemotes(get, result.changed, true);
    return;
  }
}

async function cacheRemotes(get: () => LibraryState, changedVideos?: LibraryVideo[], alreadyMerged = false) {
  const s = get();
  const index = changedVideos && !alreadyMerged ? await remoteVideoIndexAsync(s.videos) : null;
  return saveRemoteSnapshot({
    // Persist the merged card, not the provider's partial row: a shallow
    // refresh must not erase previously fetched comments or repaired tags.
    videos: changedVideos ? changedVideos.flatMap(video => {
      if (alreadyMerged) return [video];
      const card = lookupCatalogIdentity(index!,video);
      return card ? [alreadyMerged ? video : withCatalogDetails(card, video)] : [];
    }) : s.videos.filter(video => video.remote && !video.isSample),
    folders: s.folders.filter((f) => f.kind === "youtube" || f.kind === "twitch"),
    checkedAt: s.remoteCheckedAt,
    metadata: {tags:s.tags,metadataProvenance:s.metadataProvenance},
  }, !changedVideos).catch(() => undefined);
}

function remoteMetadataTags(video: LibraryVideo) {
  // Keep source, creator, format, topic, and genre as distinct tag families.
  // This makes cross-service mapping explainable and prevents raw provider
  // strings from pretending to be interests.
  const creator = video.remote?.channelName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "";
  const provider = video.remote?.kind ? `provider-${video.remote.kind}` : "";
  const adult = video.remote && (ADULT_PULL_PROVIDERS as readonly string[]).includes(video.remote.kind) ? "adult" : "";
  const format = video.remote?.live ? "format-live" : video.remote ? "format-vod" : "";
  const twitchFormat = video.remote?.kind === "twitch" ? (video.remote.live ? "twitch-live" : "twitch-vod") : "";
  const genre = video.genre?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // Twitch exposes a public stream game/category even when it does not expose
  // a richer tag list. Preserve it separately so live and VOD browsing can use
  // a concrete provider category rather than only title-keyword guesses.
  const twitchGame = video.remote?.kind === "twitch" && genre ? `twitch-game-${genre}` : "";
  return [...new Set([adult, provider, creator ? `creator-${creator}` : "", format, twitchFormat, genre ? `genre-${genre}` : "", twitchGame, ...semanticTags(video), ...descriptionKeywordTags(video)].filter(Boolean))].slice(0, LIBRARY_LIMITS.remoteMetadataTagsPerTitle);
}

function sameTags(left: string[] | undefined, right: string[]) {
  return left === right || (left?.length === right.length && left.every((tag, index) => tag === right[index]));
}

/** Upgrade cached provider cards with the same safe tags created for new pulls.
 * Already compact cards are deliberately skipped: a recurring refresh should
 * not rescan their title and description just to reproduce the same tags. */
function normalizeTagValue(raw: string) {
  let tag = raw.trim().toLowerCase().replace(/^keyword-/, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (tag === "role-play") tag = "roleplay";
  if (tag === "fetish-role-play") tag = "fetish-roleplay";
  if (tag === "verified-amateur") tag = "verified-amateurs";
  if (tag === "fetish-verified-amateur") tag = "fetish-verified-amateurs";
  return tag;
}

function tagsLocked(provenance: VideoMetadataProvenance | undefined) {
  return provenance?.lockedFields?.includes("tags") ?? false;
}
function editedMetadata(provenance: VideoMetadataProvenance | undefined) {
  if (!provenance) return false;
  if (provenance.lockedFields?.length || provenance.category === 'manual') return true;
  for (const tag in provenance.tags) if (Object.hasOwn(provenance.tags, tag) && provenance.tags[tag] === 'manual') return true;
  return false;
}

function mergeInferredTagProvenance(
  previousTags: string[],
  nextTags: string[],
  existing: VideoMetadataProvenance | undefined,
  inferred: string[],
  source: MetadataTagSource,
): VideoMetadataProvenance {
  const inferredSet = new Set(inferred.map(normalizeTagValue).filter(Boolean));
  const previousSet = new Set(previousTags);
  const previousSources = existing?.tags ?? {};
  const tags = Object.fromEntries(nextTags.map((tag) => [tag, previousSources[tag] ?? (previousSet.has(tag) ? 'legacy' : inferredSet.has(tag) ? source : "legacy")] as const));
  return {
    ...existing,
    ...(source === 'provider:youtube' ? { youtubeTextTagVersion: YOUTUBE_TEXT_TAG_VERSION } : {}),
    tags,
    updatedAt: sameTags(previousTags, nextTags) && existing?.updatedAt ? existing.updatedAt : Date.now(),
  };
}

/** Apply provider tags only to titles whose user-managed tag field is unlocked. */
function enrichRemoteTags(existing: Record<string, string[]>, existingProvenance: Record<string, VideoMetadataProvenance>, videos: LibraryVideo[]) {
  let tags = existing;
  let metadataProvenance = existingProvenance;
  for (const video of videos) {
    if (!video.remote) continue;
    const current = existing[video.id] ?? [];
    const provenance = existingProvenance[video.id];
    if (tagsLocked(provenance)) continue;
    const inferred = remoteMetadataTags(video);
    const compact = video.remote.kind === 'youtube' ? refreshYoutubeTags(current, inferred, provenance, LIBRARY_LIMITS.remoteMetadataTagsPerTitle)
      : compactIngestedTags(reconcileProviderTopicTags(video, current, provenance), inferred);
    const tagsChanged = !sameTags(current, compact);
    if (tagsChanged) {
      if (tags === existing) tags = { ...existing };
      tags[video.id] = compact;
    }
    // An unchanged, fully attributed card needs no new object (or JSON
    // serialization). Most cards on a large cached restore take this path.
    const sources = provenance?.tags;
    const provenanceComplete = !tagsChanged && (video.remote.kind !== 'youtube' || provenance?.youtubeTextTagVersion === YOUTUBE_TEXT_TAG_VERSION) && provenance?.updatedAt && sources
      && Object.keys(sources).length === compact.length
      && compact.every((tag) => sources[tag] !== undefined);
    if (!provenanceComplete) {
      const nextProvenance = mergeInferredTagProvenance(current, compact, provenance, inferred, `provider:${video.remote.kind}`);
      if (metadataProvenance === existingProvenance) metadataProvenance = { ...existingProvenance };
      metadataProvenance[video.id] = nextProvenance;
    }
  }
  return { tags, metadataProvenance };
}

/** Enrich only admitted cards; immutable ledgers copy only touched branches. */
const unchangedPullPolicy = (settings: Readonly<PullSettings>) => settings;
type PullPolicySelector = typeof unchangedPullPolicy;
async function prepareRemotePull(get: () => LibraryState, incoming: LibraryVideo[], known?: ReadonlyMap<string, unknown>, merge = false, policyFor: PullPolicySelector = unchangedPullPolicy) {
  for (;;) {
    const base = get(), globalPolicy = getPullSettings(), policy = policyFor(globalPolicy);
    const retired = retiredYoutubeKeys(base.youtubeCleanup);
    const signals = { favorites: base.favorites, likes: base.likes, activeId: base.activeId, previewId: base.previewId, rating: getRating };
    const feedbackRevision = retired.size ? getFeedbackRevision() : 0;
    const filtered: LibraryVideo[] = [];
    const revived = new Set<string>();
    await forEachCatalogSlice(incoming, video => {
      if (video.remote && retired.has(cleanupKey(video))) {
        if (!youtubeCleanupProtected(video, signals)) return;
        revived.add(cleanupKey(video));
      }
      filtered.push(video);
    }, yieldCatalogTask);
    if (revived.size) {
      const journal = { ...base.youtubeCleanup, recentKeys: base.youtubeCleanup.recentKeys.filter(key => !revived.has(key)), lastAt: Date.now() };
      await saveYoutubeCleanup([], journal);
      // Revivals affect only suppression keys; cleanup counts are retained.
      useLibrary.setState({ youtubeCleanup: journal });
      known = undefined;
      continue;
    }
    const admission = await admitRemoteEntries(base.videos, filtered, policy, known);
    const tagPatch = sparseRecordBuilder(base.tags), provenancePatch = sparseRecordBuilder(base.metadataProvenance);
    const metadataIndex = admission.videos.some(video => video.remote?.kind === 'youtube') ? await remoteVideoIndexAsync(base.videos) : undefined;
    await forEachCatalogSlice(admission.videos, video => {
      // Sparse feed snippets cannot replace already-fetched full-page evidence.
      const previous = metadataIndex?.get(video.id) ?? metadataIndex?.get(youtubeVideoKey(video) ?? '');
      if (previous?.remote?.youtubeTagsCheckedAt && !video.remote?.youtubeTagsCheckedAt) video = { ...retainYoutubeMetadata(previous, video), description: undefined };
      const currentTags = base.tags[video.id], currentProvenance = base.metadataProvenance[video.id];
      const enriched = enrichRemoteTags(currentTags ? { [video.id]: currentTags } : {}, currentProvenance ? { [video.id]: currentProvenance } : {}, [video]);
      if (enriched.tags[video.id] !== currentTags && enriched.tags[video.id]) tagPatch.set(video.id, enriched.tags[video.id]);
      if (enriched.metadataProvenance[video.id] !== currentProvenance && enriched.metadataProvenance[video.id]) provenancePatch.set(video.id, enriched.metadataProvenance[video.id]);
    }, yieldCatalogTask);
    const tags = tagPatch.finish(), metadataProvenance = provenancePatch.finish();
    const folderCounts = new Map<string, number>();
    const merged = merge ? await mergeRemoteCatalogAsync(base.videos, admission.videos.map(catalogCard)) : base.videos;
    if (merge) await forEachCatalogSlice(merged, video => { folderCounts.set(video.folderId, (folderCounts.get(video.folderId) ?? 0) + 1); }, yieldCatalogTask);
    if (get().videos === base.videos && get().tags === base.tags && get().metadataProvenance === base.metadataProvenance && getPullSettings() === globalPolicy && get().youtubeCleanup === base.youtubeCleanup
      && (!retired.size || get().favorites === base.favorites && get().likes === base.likes && getFeedbackRevision() === feedbackRevision))
      return { base, admission, merged, folderCounts, enriched: { tags, metadataProvenance } };
    known = undefined;
  }
}
const ENTRY_LIMIT_MESSAGE = 'Saved entry limit reached. Eligible cleanup batches can make room on the next pull; protected entries stay. Adjust cleanup or entry limits in Settings.';
function cleanupNote(group: CleanupGroup, note: string) {
  useLibrary.setState(s => ({ youtubeCleanupNote: note, cleanupNotes: { ...s.cleanupNotes, [group]: note } }));
}
const CLEANUP_WORK_HELD = Symbol('cleanup-work-held');

/** Replace only after a provider actually returns new identities. Planning
 * yields; final protection checks and publication have no intervening await. */
async function rotateSourceCache(get: () => LibraryState, incoming?: LibraryVideo[], budget = getPullSettings().youtubeCleanupBatch, group: CleanupGroup = 'youtube', options: { target?: CleanupGroup; reserved?: number; policyFor?: PullPolicySelector } = {}) {
  const label = cleanupLabel(group);
  const target = options.target ?? group, reserved = options.reserved ?? 0, policyFor = options.policyFor ?? unchangedPullPolicy;
  if (incoming && (!budget || !cleanupPolicy(getPullSettings(), group).enabled || !incoming.some(video => entryGroup(video) === target))) return 0;
  const cancellation = getPullCancellationRevision();
  const turn = async () => {
    await yieldCatalogTask();
    if (getPullCancellationRevision() !== cancellation) throw new Error('Pull cancelled; accepted catalog entries remain saved.');
    if (incoming && !catalogPullAvailable()) throw CLEANUP_WORK_HELD;
  };
  for (;;) {
    const base = get(), globalPolicy = getPullSettings(), settings = policyFor(globalPolicy);
    const counts = await remoteEntryCounts(base.videos);
    const policy = cleanupPolicy(settings, group);
    let limit = Math.min(budget, policy.batch);
    let overage = 0;
    let replacementSources: Set<string> | undefined;
    const exclude = new Set<string>();
    if (incoming) {
      if (!rotationAvailable(counts, settings, group, limit) || !cleanupPolicy(settings, target).enabled || settings[`${target}MaxEntries`] <= 0) return 0;
      if (group !== target && !counts[group]) return 0;
      if (group !== target && (!settings.sharedCapCleanup || counts[target] >= settings[`${target}MaxEntries`])) return 0;
      const reservedCounts = { ...counts, total: counts.total + reserved };
      if (remainingEntrySlots(reservedCounts, settings, target) >= incoming.length) return 0;
      const known = await remoteVideoIndexAsync(base.videos), retired = retiredYoutubeKeys(base.youtubeCleanup), fresh = new Set<string>();
      await forEachCatalogSlice(incoming, video => {
        const key = cleanupKey(video); exclude.add(key);
        if (entryGroup(video) !== target) return;
        if (!known.has(video.id) && !known.has(key) && (!retired.has(key) || youtubeCleanupProtected(video, { favorites: base.favorites, likes: base.likes, activeId: base.activeId, previewId: base.previewId, rating: getRating }))) {
          fresh.add(key);
          if (group === target && counts[target] <= settings[`${target}MaxEntries`] && reservedCounts.total <= settings.remoteMaxEntries) {
            const sources = cleanupSourceKeys(video);
            if (!replacementSources) replacementSources = new Set(sources);
            else for (const source of replacementSources) if (!sources.includes(source)) replacementSources.delete(source);
          }
        }
      }, turn);
      if (!fresh.size) return 0;
      overage = Math.max(0, counts[target] - settings[`${target}MaxEntries`], reservedCounts.total - settings.remoteMaxEntries);
      const demand = group === target ? Math.max(0, counts[target] + fresh.size - settings[`${target}MaxEntries`], reservedCounts.total + fresh.size - settings.remoteMaxEntries)
        : Math.max(0, reservedCounts.total + Math.min(fresh.size, settings[`${target}MaxEntries`] - counts[target]) - settings.remoteMaxEntries);
      limit = Math.min(limit, demand);
    }
    if (!limit) return 0;
    await verifyCleanupFeedback();
    const savedShelves = await restoreDurableShelves(true), savedProtection = new Set<string>();
    for (const rows of [savedShelves?.favorites ?? [], savedShelves?.likes ?? []]) await forEachCatalogSlice(rows, id => { savedProtection.add(id); }, turn);
    await warmLegacyRatings(); // legacy stars load only when space is needed
    const revision = getFeedbackRevision();
    const notes = exportFeedback().notes;
    const plan = await planYoutubeCleanup(base.videos, { ...base, rating: getRating,
      managed: id => Boolean(savedProtection.has(id) || base.categories[id] || editedMetadata(base.metadataProvenance[id]) || notes[id]),
    }, { limit, minAgeDays: policy.minAgeDays, now: Date.now(), exclude, group, replacementSources }, turn);
    if (get().videos !== base.videos || get().favorites !== base.favorites || get().likes !== base.likes || get().categories !== base.categories || get().metadataProvenance !== base.metadataProvenance || get().youtubeCleanup !== base.youtubeCleanup || get().activeId !== base.activeId || get().previewId !== base.previewId || getFeedbackRevision() !== revision || getPullSettings() !== globalPolicy) continue;
    if (!plan.removed.length) {
      cleanupNote(group, `No eligible old ${label} entries can be replaced. Protected videos stay saved.`);
      return 0;
    }
    const removedByFolder = new Map<string, number>();
    for (const video of plan.removed) removedByFolder.set(video.folderId, (removedByFolder.get(video.folderId) ?? 0) + 1);
    const journal = recordYoutubeCleanup(base.youtubeCleanup, plan.removed, Date.now());
    useLibrary.setState(s => ({ videos: plan.videos, folders: s.folders.map(folder => removedByFolder.has(folder.id) ? { ...folder, videoCount: Math.max(0, (folder.videoCount ?? 0) - removedByFolder.get(folder.id)!) } : folder) }));
    rememberEntryCounts(plan.videos, { ...counts, total: counts.total - plan.removed.length, [group]: counts[group] - plan.removed.length });
    try { await saveYoutubeCleanup(plan.removed, journal); }
    catch (error) {
      // The disk transaction is atomic. Restore catalog references on failure,
      // preserving any foreground changes made while it was saving.
      for (;;) {
        const current = get().videos, restored = await mergeRemoteCatalogAsync(current, plan.removed);
        if (get().videos !== current) continue;
        useLibrary.setState(s => ({ videos: restored, folders: s.folders.map(folder => removedByFolder.has(folder.id) ? { ...folder, videoCount: (folder.videoCount ?? 0) + removedByFolder.get(folder.id)! } : folder), youtubeCleanupNote: 'Cleanup could not be saved; cached videos were restored.', cleanupNotes: { ...s.cleanupNotes, [group]: 'Cleanup could not be saved; cached videos were restored.' } }));
        break;
      }
      throw error;
    }
    const ids = plan.removed.map(video => video.id);
    useLibrary.setState(s => ({ youtubeCleanup: journal, youtubeCleanupNote: `${plan.removed.length.toLocaleString()} old, low-rated ${label} entries removed. Likes, favorites, positive ratings and watch history were kept.`,
      cleanupNotes: { ...s.cleanupNotes, [group]: `${plan.removed.length.toLocaleString()} old, low-rated ${label} entries removed. Likes, favorites, positive ratings and watch history were kept.${group !== target ? ` Making room for ${cleanupLabel(target)} under the combined cap.` : incoming && plan.removed.length <= overage ? ' Recovering a lowered cap gradually; the pending page stays queued.' : ''}` },
      tags: removeSparseRecordKeys(s.tags, ids.filter(id => s.tags[id] === base.tags[id])),
      metadataProvenance: removeSparseRecordKeys(s.metadataProvenance, ids.filter(id => s.metadataProvenance[id] === base.metadataProvenance[id])),
    }));
    persistSoon(get);
    return plan.removed.length;
  }
}

async function rotatePullSource(get: () => LibraryState, incoming: LibraryVideo[], budgets: CleanupBudgets, group: CleanupGroup, options: Parameters<typeof rotateSourceCache>[4]) {
  const cancellation = getPullCancellationRevision(), policyFor = options?.policyFor ?? unchangedPullPolicy;
  for (;;) {
    const settings = policyFor(getPullSettings()), target = options?.target ?? group;
    if (!cleanupBudgetAvailable(budgets, settings, group) || !cleanupPolicy(settings, group).enabled || !cleanupPolicy(settings, target).enabled || group !== target && !settings.sharedCapCleanup) return 0;
    await waitForCatalogCommit(cancellation);
    const available = cleanupBudgetAvailable(budgets, policyFor(getPullSettings()), group);
    if (!available) return 0;
    try { return await rotateSourceCache(get, incoming, available, group, options); }
    catch (error) {
      if (error !== CLEANUP_WORK_HELD) throw error;
      // Discard the planning scope before waiting. A preview/pause must not
      // pin a stale million-entry catalog or its candidate/index references.
    }
  }
}

/** Budgets belong to the whole operation, including shared-cap donations.
 * Reserve earlier incoming groups' slots so a mixed result cannot spend the
 * same freed combined capacity twice. Protected incoming rows are excluded. */
async function rotateRemotePull(get: () => LibraryState, incoming: LibraryVideo[], budgets: CleanupBudgets, policyFor: PullPolicySelector = unchangedPullPolicy) {
  let reserved = 0, removed = 0;
  const allocated: CleanupBudgets = { youtube: 0, twitch: 0, adult: 0 };
  const policy = policyFor(getPullSettings());
  const targets = CLEANUP_GROUPS.filter(group => incoming.some(video => entryGroup(video) === group));
  if (!targets.some(group => cleanupPolicy(policy, group).enabled && policy[`${group}MaxEntries`] > 0) || policy.remoteMaxEntries <= 0) return incoming;
  const countsBefore = await remoteEntryCounts(get().videos);
  if (targets.every(group => remainingEntrySlots(countsBefore, policy, group) >= incoming.length)) return incoming;
  const sharedPressure = policy.sharedCapCleanup && countsBefore.total >= policy.remoteMaxEntries && targets.length > 1;
  if (sharedPressure) targets.sort((a, b) => countsBefore[a] / Math.max(1, policy[`${a}MaxEntries`]) - countsBefore[b] / Math.max(1, policy[`${b}MaxEntries`]));
  for (const target of targets) {
    const own = await rotatePullSource(get, incoming, budgets, target, { reserved, policyFor });
    consumeCleanupBudget(budgets, target, own); removed += own;
    let shared = 0;
    for (const donor of CLEANUP_GROUPS) {
      if (donor === target) continue;
      const donated = await rotatePullSource(get, incoming, budgets, donor, { target, reserved, policyFor });
      consumeCleanupBudget(budgets, donor, donated); removed += donated;
      shared += donated;
    }
    const base = get(), settings = policyFor(getPullSettings()), counts = await remoteEntryCounts(base.videos);
    const known = await remoteVideoIndexAsync(base.videos), retired = retiredYoutubeKeys(base.youtubeCleanup), fresh = new Set<string>();
    const signals = { favorites: base.favorites, likes: base.likes, activeId: base.activeId, previewId: base.previewId, rating: getRating };
    await forEachCatalogSlice(incoming, video => {
      if (entryGroup(video) !== target) return;
      const key = cleanupKey(video);
      if (!known.has(video.id) && !known.has(key) && (!retired.has(key) || youtubeCleanupProtected(video, signals))) fresh.add(key);
    }, yieldCatalogTask);
    allocated[target] = Math.min(fresh.size, remainingEntrySlots({ ...counts, total: counts.total + reserved }, settings, target));
    reserved += allocated[target];
    if (shared) cleanupNote(target, `${shared.toLocaleString()} eligible entries replaced in other enabled caches to make room for ${cleanupLabel(target)} under the combined cap. All source budgets and saved-video protections were kept.`);
  }
  if (!removed || !sharedPressure) return incoming;
  // Admission uses the same priority as reservations, keeping an earlier
  // dense provider from consuming the slots donated for an empty source.
  const buckets = new Map<CleanupGroup, LibraryVideo[]>(targets.map(group => [group, []])), other: LibraryVideo[] = [];
  await forEachCatalogSlice(incoming, video => { const group = entryGroup(video); const rows = group && group !== 'other' ? buckets.get(group) : undefined; (rows ?? other).push(video); }, yieldCatalogTask);
  const ordered: LibraryVideo[] = [];
  const admissionOrder = [...targets].sort((a, b) => Number(allocated[b] > 0) - Number(allocated[a] > 0));
  for (const group of admissionOrder) await forEachCatalogSlice(buckets.get(group)!, video => { ordered.push(video); }, yieldCatalogTask);
  await forEachCatalogSlice(other, video => { ordered.push(video); }, yieldCatalogTask);
  return ordered;
}

function metadataTagsForVideo(video: LibraryVideo, folders: Folder[]) {
  return video.remote
    ? remoteMetadataTags(video)
    : [...(isAdultVideo(video, folders) ? ["adult"] : []), ...localNameTags(video)];
}

function enrichmentPatch(video: LibraryVideo, state: Pick<LibraryState, 'tags' | 'metadataProvenance' | 'folders'>,
  mode: 'cached' | 'tail' | 'smart'): CachedTagPatch | undefined {
  const beforeTags = state.tags[video.id], beforeProvenance = state.metadataProvenance[video.id];
  if (tagsLocked(beforeProvenance) || (mode === 'cached' && !video.remote) || (mode === 'tail' && beforeTags?.length)) return;
  if (mode === 'cached' && video.remote?.kind === 'youtube' && beforeProvenance?.youtubeTextTagVersion === YOUTUBE_TEXT_TAG_VERSION) return;
  const inferred = metadataTagsForVideo(video, state.folders);
  const current = beforeTags ?? [];
  const existing = mode === 'cached' ? reconcileProviderTopicTags(video, current, beforeProvenance) : current;
  const compact = video.remote?.kind === 'youtube' ? refreshYoutubeTags(current, inferred, beforeProvenance, LIBRARY_LIMITS.remoteMetadataTagsPerTitle) : compactIngestedTags(existing, inferred);
  const tagsChanged = !sameTags(current, compact);
  const sources = beforeProvenance?.tags;
  if (!tagsChanged && (video.remote?.kind !== 'youtube' || beforeProvenance?.youtubeTextTagVersion === YOUTUBE_TEXT_TAG_VERSION) && beforeProvenance?.updatedAt && sources && Object.keys(sources).length === compact.length
    && compact.every(tag => sources[tag] !== undefined)) return;
  if (!compact.length) return;
  return { beforeTags, beforeProvenance, tags: tagsChanged ? compact : current,
    provenance: mergeInferredTagProvenance(current, compact, beforeProvenance, inferred, video.remote ? `provider:${video.remote.kind}` : 'local-name') };
}

function queueMetadataRepair(get: () => LibraryState, publish: (next: Pick<LibraryState, 'tags' | 'metadataProvenance'>) => void) {
  void idleEnrichment.enqueue('cached-tags', 'Cached provider tags', metadataEnrichmentStep({ get, publish,
    save: saveEnrichmentRows, patch: (video, state) => enrichmentPatch(video, state, 'cached') })).catch(error => {
      if (error?.name !== 'AbortError' && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('reelcase:save-error'));
    });
}

/** Normalize provider enrichment once when it enters the catalog. Manual tags
 * are retained, while old keyword-/creator- wrappers and duplicate labels do
 * not keep inflating every selector and render pass. */
function compactIngestedTags(existing: string[], inferred: string[]) {
  const seen = new Set<string>();
  const compact: string[] = [];
  const structural = (tag: string) => tag.trim().toLowerCase() === "adult" || /^(?:source-|sub-|creator-|provider-|format-|fetish-|genre-|meta-)/.test(tag.trim().toLowerCase());
  // Keep filter contracts before historic keyword dumps. Earlier imports could
  // fill the cap with raw metadata and lose a newly repaired source/sub tag.
  const ordered = [
    ...inferred.filter(structural),
    ...existing,
    ...inferred.filter((tag) => !structural(tag)),
  ];
  for (const raw of ordered) {
    // Preserve source- / creator- / fetish- / provider- families for Adult filters.
    // Only strip the legacy keyword- wrapper so cards stay readable.
    const tag = normalizeTagValue(raw);
    if (!tag || tag === "http" || tag === "https" || seen.has(tag)) continue;
    seen.add(tag);
    compact.push(tag);
    if (compact.length >= LIBRARY_LIMITS.remoteMetadataTagsPerTitle) break;
  }
  return compact;
}

const IGNORED_DESCRIPTION_WORDS = new Set(["about", "after", "also", "because", "being", "between", "channel", "click", "creator", "description", "from", "have", "here", "just", "more", "next", "official", "please", "really", "subscribe", "that", "this", "through", "today", "video", "watch", "with", "youtube", "your"]);

function descriptionKeywordTags(video: LibraryVideo) {
  if (video.remote?.kind === 'youtube') return automaticYoutubeTags(video);
  // Keep a controlled text ceiling. Provider descriptions are the richest
  // public source for Twitch and YouTube connections, while the ceiling keeps
  // storage, exports, and derived shelves bounded.
  const text = `${video.remote?.channelName ?? ""} ${video.name} ${video.description ?? video.tagline ?? ""}`.slice(0, 8000).toLowerCase();
  const words = text.match(/[a-z][a-z0-9-]{3,30}/g) ?? [];
  const seen = new Set<string>();
  const tags: string[] = [];
  const publicTopics = video.remote?.kind === "twitch" ? new Set(topicsForVideo(video)) : null;
  const unsupportedTopic = (word: string) => {
    const topic = canonicalTopic(word);
    return publicTopics && topic && !publicTopics.has(topic);
  };
  for (const word of words) {
    if (IGNORED_DESCRIPTION_WORDS.has(word) || seen.has(word) || unsupportedTopic(word)) continue;
    seen.add(word);
    // These are viewer-facing words, not implementation fields. Keeping the
    // raw word also lets keyword clicks bridge local, Twitch, and YouTube
    // without exposing an internal "keyword-" prefix in every shelf.
    tags.push(word);
    if (tags.length >= LIBRARY_LIMITS.descriptionKeywordTagsPerTitle) break;
  }
  return tags;
}

/** Local, explainable semantic taxonomy. It runs over provider titles and descriptions only—never media bytes or uploads. */
const SEMANTIC_TAG_RULES: ReadonlyArray<readonly [RegExp, string]> = [
    [/\b(game|gaming|playthrough|speedrun|walkthrough|minecraft|steam|zombies|streamer games|nba 2k\d*|cozy games|\barc\b)\b/, "gaming"],
    [/\b(tech|software|coding|programming|computer|ai|gadget)\b/, "technology"],
    [/\b(news|politic|election|debate|commentary)\b/, "news-commentary"],
    [/\b(music|song|album|concert|cover|playlist)\b/, "music"],
    [/\b(movie|film|cinema|trailer|review)\b/, "film"],
    [/\b(anime|manga|japan|otaku)\b/, "anime"],
    [/\b(food|cook|recipe|restaurant|kitchen|cake|baking|cake decorating)\b/, "food"],
    [/\b(travel|trip|tour|flight|hotel|beach|bali|pool party)\b/, "travel"],
    [/\b(fitness|workout|gym|health|sport)\b/, "fitness"],
    [/\b(science|space|history|documentary|education)\b/, "learning"],
    [/\b(comedy|funny|sketch|standup|meme)\b/, "comedy"],
    [/\b(asmr|relax|sleep|ambient|meditation)\b/, "relaxing"],
    [/\b(acupuncture|wellness|self care)\b/, "wellbeing"],
    [/\b(podcast|interview|talk|discussion)\b/, "talk"],
    [/\b(react|reaction|drama|tea|opinion)\b/, "commentary"],
    [/\b(art|drawing|painting|design|animation)\b/, "creative"],
    [/\b(animal|wildlife|zoo|nature)\b/, "nature"],
    [/\b(finance|money|business|investing)\b/, "business"],
    [/\b(fashion|beauty|makeup|style)\b/, "style"],
    [/\b(car|cars|driving|racing|automotive|motorcycle|simucube|racing rig)\b/, "motors"],
    [/\b(horror|scary|creepy|ghost|true crime)\b/, "horror"],
    [/\b(diy|repair|build|woodwork|maker|restoration)\b/, "maker"],
    [/\b(soccer|football|basketball|baseball|esports|tournament)\b/, "sports"],
    [/\b(science|space|physics|biology|chemistry)\b/, "science"],
    [/\b(relationship|dating|love|couple)\b/, "relationships"],
    [/\b(mental health|therapy|psychology|mindfulness)\b/, "wellbeing"],
    [/\b(language|linguistics|learn \w+|lesson|tutorial)\b/, "skills"],
    [/\b(hardware|pc build|keyboard|phone|camera)\b/, "hardware"],
    [/\b(legal|court|law|lawsuit)\b/, "legal"],
    [/\b(documentary|docuseries)\b/, "documentary"],
    [/\b(history|historical|ancient|archaeology)\b/, "history"],
    [/\b(true crime|murder|missing person|serial killer)\b/, "true-crime"],
    [/\b(photo|photography|camera review|photographer)\b/, "photography"],
    [/\b(artwork|watercolor|illustration|digital art)\b/, "art"],
    [/\b(animation|animated|cartoon|animator)\b/, "animation"],
    [/\b(animals?|pets?|dogs?|cats?|wildlife)\b/, "animals"],
    [/\b(hiking|camping|fishing|backpacking|outdoors?)\b/, "outdoors"],
    [/\b(climate|environment|sustainability|conservation)\b/, "environment"],
    [/\b(makeup|skincare|beauty|hair tutorial)\b/, "beauty"],
    [/\b(fashion|outfit|streetwear|clothing)\b/, "fashion"],
    [/\b(home decor|home tour|interior design|organization)\b/, "home"],
];

function semanticTags(video: LibraryVideo) {
  const publicRemote = video.remote?.kind === "youtube" || video.remote?.kind === "twitch";
  const text = publicRemote ? video.name.slice(0, 500).toLowerCase()
    : `${video.name} ${video.path} ${video.tagline ?? ""} ${video.description ?? ""}`.slice(0, 8000).toLowerCase();
  const tags: string[] = publicRemote ? [...topicsForVideo(video)] : [];
  if (!publicRemote) for (const [pattern, tag] of SEMANTIC_TAG_RULES) if (pattern.test(text)) tags.push(tag);
  if (video.remote?.kind === "youtube" && ((video.duration ?? 0) > 0 && (video.duration ?? 0) < 90 || /(?:#|\b)shorts?\b/i.test(text))) tags.push("shorts", "short-form");
  if (video.remote?.kind === "twitch" && !video.remote.live && (video.extension === "clip" || video.id.startsWith("tw:c:") || ((video.duration ?? 0) > 0 && (video.duration ?? 0) < 120))) tags.push("clip");
  if ((video.duration ?? 0) >= 3600) tags.push("long-form");
  return tags;
}

function localNameTags(video: LibraryVideo) {
  const text = `${video.name} ${video.path}`.toLowerCase();
  const added = new Date(video.addedAt);
  const dateTags = Number.isFinite(added.getTime())
    ? [`year-${added.getFullYear()}`, `month-${added.toLocaleString("en-US", { month: "long" }).toLowerCase()}`]
    : [];
  const nameTags = video.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !/^(video|movie|final|copy|edit|the|with|from)$/.test(word))
    .slice(0, 4);
  const sourceName = video.path.split(/[\\/]/).find(Boolean)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const tags = [video.genre?.toLowerCase(), `type-${video.extension.replace(/^\./, "").toLowerCase()}`, sourceName ? `source-${sourceName}` : "", ...dateTags, ...semanticTags(video), ...nameTags];
  if (/\b(open source|creative commons|blender|public domain)\b/.test(text)) tags.push("open-source");
  if (/\b(trailer|teaser)\b/.test(text)) tags.push("trailer");
  if (/\b(1080p|2160p|4k|720p)\b/.test(text)) tags.push((text.match(/\b(2160p|4k|1080p|720p)\b/)?.[1]) ?? "hd");
  return tags.filter((tag): tag is string => Boolean(tag));
}

function addLocalNameTags(existing: Record<string, string[]>, existingProvenance: Record<string, VideoMetadataProvenance>, videos: LibraryVideo[]) {
  const next = sparseRecordBuilder(existing);
  const metadataProvenance = sparseRecordBuilder(existingProvenance);
  for (const video of videos) {
    if (tagsLocked(existingProvenance[video.id])) continue;
    const inferred = localNameTags(video);
    if (!inferred.length) continue;
    const current = next.get(video.id) ?? [];
    const compact = [...new Set([...current, ...inferred.map(normalizeTagValue).filter(Boolean)])].slice(0, 18);
    next.set(video.id, compact);
    metadataProvenance.set(video.id, mergeInferredTagProvenance(current, compact, existingProvenance[video.id], inferred, "local-name"));
  }
  return { tags: next.finish(), metadataProvenance: metadataProvenance.finish() };
}

function applyPrefs(partial: Partial<LibraryState>): Partial<LibraryState> {
  const prefs = loadPrefs();
  if (!prefs) return partial;
  const favorites: Record<string, true> = {};
  const likes: Record<string, true> = {};
  for (const id of prefs.favorites ?? []) favorites[id] = true;
  for (const id of prefs.likes ?? []) likes[id] = true;
  return {
    ...partial,
    favorites,
    likes,
    tags: prefs.tags ?? {},
    metadataProvenance: prefs.metadataProvenance ?? {},
    categories: prefs.categories ?? {},
    progress: Object.fromEntries(Object.entries(prefs.progress ?? {}).flatMap(([id, mark]) => {
      const normalized = normalizeResumeMark(mark);
      return normalized ? [[id, normalized]] : [];
    })),
    resumeProgress: Object.fromEntries(Object.entries(prefs.resumeProgress ?? {}).flatMap(([key, mark]) => {
      const normalized = normalizeResumeMark(mark);
      return normalized ? [[key, normalized]] : [];
    })),
    history: prefs.history ?? [],
    viewCounts: prefs.viewCounts ?? {},
    cameCounts: prefs.cameCounts ?? {},
    view: prefs.view ?? "grid",
    sort: prefs.sort ?? "name",
    hideDemo: true,
    sourceId: "home",
    hardwareAccel: prefs.hardwareAccel ?? true,
    adultPinHash: null,
    // An empty saved list is intentional. Do not repopulate it with sample follows.
    follows: dedupeFollows(prefs.follows ?? []),
    notices: prefs.notices ?? [],
    notifyPush: prefs.notifyPush ?? false,
    unavailable: Object.fromEntries((prefs.unavailableVideoIds ?? []).map((id) => [id, true])),
    hiddenVideos: Object.fromEntries((prefs.hiddenVideoIds ?? []).map((id) => [id, true])),
  };
}

function adultIdSet(folders: Folder[]) {
  return adultFolderIds(folders);
}

export function isAdultVideo(video: LibraryVideo, folders: Folder[]) {
  return videoIsPrivate(adultIdSet(folders),video);
}

/** A provider can surface the same remote media through more than one route
 * (especially a Reddit post linked to Redgifs). Keep the richer card and its
 * combined source attribution, rather than rendering or caching it twice. */
function adultMediaIdentity(video: LibraryVideo): string | undefined {
  const urls = [video.remote?.embedUrl, video.remote?.watchUrl, video.src]
    .filter((value): value is string => Boolean(value && /^https?:\/\//i.test(value)));
  for (const raw of urls) {
    const redgifs = raw.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1]
      ?? raw.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1]
      ?? raw.match(/https?:\/\/(?:i|media)\.redgifs\.com\/([a-z0-9_-]+)(?:[._-]|$)/i)?.[1];
    if (redgifs) return `redgifs:${redgifs.toLowerCase()}`;
    try {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      const path = url.pathname.replace(/\/+$/, "").toLowerCase();
      if (host && path && path !== "/") return `url:${host}${path}`;
    } catch {
      // Ignore malformed provider fields; their stable provider id still works.
    }
  }
  const kind = video.remote?.kind;
  const id = video.remote?.videoId?.trim();
  return kind && id ? `provider:${kind}:${id.toLowerCase()}` : undefined;
}

function adultCardQuality(video: LibraryVideo) {
  return Number(Boolean(video.poster || video.remote?.previewUrl)) * 4
    + Number(Boolean(video.remote?.embedUrl)) * 3
    + Number(Boolean(video.remote?.watchUrl)) * 2
    + (video.remote?.sourceKinds?.length ?? 0)
    + Number(video.remote?.kind === "reddit") * 2
    + Number(Boolean(video.description || video.tagline));
}

function mergeAdultDuplicate(first: LibraryVideo, second: LibraryVideo): LibraryVideo {
  const primary = adultCardQuality(second) > adultCardQuality(first) ? second : first;
  const secondary = primary === first ? second : first;
  const primaryRemote = primary.remote;
  const secondaryRemote = secondary.remote;
  return {
    ...primary,
    addedAt: Math.max(primary.addedAt, secondary.addedAt),
    poster: primary.poster || secondary.poster,
    src: primary.src || secondary.src,
    description: primary.description || secondary.description,
    tagline: primary.tagline || secondary.tagline,
    remote: primaryRemote && secondaryRemote ? {
      ...secondaryRemote,
      ...primaryRemote,
      videoId: primaryRemote.videoId || secondaryRemote.videoId,
      channelName: primaryRemote.channelName || secondaryRemote.channelName,
      channelId: primaryRemote.channelId || secondaryRemote.channelId,
      embedUrl: primaryRemote.embedUrl || secondaryRemote.embedUrl,
      watchUrl: primaryRemote.watchUrl || secondaryRemote.watchUrl,
      previewUrl: primaryRemote.previewUrl || secondaryRemote.previewUrl,
      sourceKinds: [...new Set([primaryRemote.kind, secondaryRemote.kind, ...(primaryRemote.sourceKinds ?? []), ...(secondaryRemote.sourceKinds ?? [])].filter(Boolean))],
    } : primaryRemote,
  };
}

function dedupeAdultVideoCards(videos: LibraryVideo[]): LibraryVideo[] {
  const result: LibraryVideo[] = [];
  const byIdentity = new Map<string, number>();
  for (const video of videos) {
    const key = adultMediaIdentity(video);
    if (!key) {
      result.push(video);
      continue;
    }
    const previousIndex = byIdentity.get(key);
    if (previousIndex == null) {
      byIdentity.set(key, result.length);
      result.push(video);
      continue;
    }
    result[previousIndex] = mergeAdultDuplicate(result[previousIndex], video);
  }
  return result;
}

export const useLibrary = create<LibraryState>((set, get) => ({
  // A new library starts empty. Demo movies once helped illustrate the UI, but
  // they should never compete with a person's own sources or provider follows.
  folders: [],
  videos: [],
  query: "",
  searchResult: null,
  sort: "added",
  view: "grid",
  sourceId: "home",
  favorites: {},
  likes: {},
  tags: {},
  metadataProvenance: {},
  categories: {},
  progress: {},
  resumeProgress: {},
  history: [],
  viewCounts: {},
  cameCounts: {},
  hideDemo: true,
  showHiddenAdult: false,
  hardwareAccel: true,
  adultPinHash: null,
  adultsUnlocked: true,
  activeId: null,
  previewId: null,
  scanning: null,
  hydrated: false,
  follows: STARTER_FOLLOWS,
  notices: [],
  unavailable: {},
  hiddenVideos: {},
  notifyPush: false,
  remoteBusy: false,
  youtubeCleanup: emptyYoutubeCleanup(),
  youtubeCleanupNote: '',
  cleanupNotes: {},
  cleanupYoutubeCache: async () => {
    return get().cleanupRemoteCache('youtube');
  },
  cleanupRemoteCache: async group => {
    if (get().remoteBusy || get().refreshing) throw new Error('Wait for the current pull to finish before cleaning the cache.');
    set({ remoteBusy: true });
    try { return await rotateSourceCache(get, undefined, cleanupPolicy(getPullSettings(), group).batch, group); }
    finally { set({ remoteBusy: false }); }
  },
  refreshing: false,
  remoteCheckedAt: 0,
  remoteRefreshStatus: null,
  youtubeRefreshStatus: null,
  youtubeLiveProgress: null,
  twitchLiveProgress: null,
  remoteRetryAt: {},
  importProgress: null,
  adultPullStatus: null,
  pullActivity: null,
  // The server has no browser storage. Keep the first client snapshot identical
  // and restore the small result ledger after mount with the other local prefs.
  pullHistory: [],
  beginPull: (activity) => {
    if (activity.provider === "youtube") markYoutubeProviderStart();
    set({ pullActivity: { ...activity, status: "running" } });
  },
  updatePull: (update) => set((state) => state.pullActivity ? { pullActivity: { ...state.pullActivity, ...update } } : {}),
  finishPull: (record) => set((state) => {
    if (record.provider === "youtube") markYoutubeProviderFinish();
    const pullHistory = [record, ...state.pullHistory.filter((item) => item.id !== record.id)].slice(0, 100);
    savePullHistory(pullHistory);
    return { pullActivity: null, pullHistory };
  }),
  setQuery: (query) => { if (get().query === query) return; measureInteraction("search"); set({ query, searchResult: null }); },
  setSort: (sort) => {
    set({ sort });
    saveViewPrefs(get());
  },
  setView: (view) => {
    set({ view });
    saveViewPrefs(get());
  },
  setSource: (sourceId) => {
    if (sourceId !== get().sourceId) beginFirstShelfRoute(['landing', 'youtube', 'twitch', 'favorites', 'continue', 'history', 'movies'].includes(sourceId) ? sourceId : 'library');
    // Invalidate old near-view artwork before the next source mounts cards.
    if (sourceId !== get().sourceId) clearLowPriorityImageQueue();
    if (sourceId === "youtube" && get().sourceId !== "youtube") {
      beginYoutubeFirstClick(get().pullActivity?.provider === "youtube");
    }
    measureInteraction("navigation");
    navigationChanged = true;
    set({ sourceId });
    saveViewPrefs(get());
  },
  toggleFavorite: (id) => {
    measureInteraction("rating");
    set((s) => {
      const favorites = s.favorites[id] ? removeSparseRecordKeys(s.favorites, [id]) : patchSparseRecord<true>(s.favorites, [[id, true]]);
      return { favorites };
    });
    savedShelfRevision++;
    saveSavedShelfEdit(id, 'favorites', Boolean(get().favorites[id]));
  },
  toggleLike: (id) => {
    measureInteraction("rating");
    set((s) => {
      const likes = s.likes[id] ? removeSparseRecordKeys(s.likes, [id]) : patchSparseRecord<true>(s.likes, [[id, true]]);
      return { likes };
    });
    savedShelfRevision++;
    saveSavedShelfEdit(id, 'likes', Boolean(get().likes[id]));
  },
  markCame: (id) => {
    set((s) => ({ cameCounts: patchActivityRecord(s.cameCounts, [[id, (s.cameCounts[id] ?? 0) + 1]]) }));
    persistActivity(get);
  },
  setVideoComments: (id, comments) => {
    const state = get();
    // A late response from a closed viewer must not retain a transcript.
    if (state.activeId !== id && state.previewId !== id) return;
    const video = lookupVideo(state.videos, id);
    if (!video?.remote) return;
    viewerDetails.setComments(id, comments);
    const updated = { ...video, remote: { ...video.remote, comments } };
    // This is already the current selected card. No full remote index or
    // immutable catalog copy is needed to save one on-demand detail record.
    void cacheRemotes(get, [updated], true).then(() => {
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('reelcase:video-details-changed', { detail: id }));
    });
  },
  setYoutubePublication: async (id, date, youtubeId) => {
    for(;;){
      const video=lookupVideo(get().videos,id);
      if(!video||youtubeDownloadTarget(video)?.videoId!==youtubeId)throw Error('Publication evidence does not match this saved video.');
      const updated=withYoutubePublication({...video,remote:{...video.remote!,videoId:youtubeId}},youtubeId,date);
      if(updated.addedAt===video.addedAt&&updated.remote?.publishedSource===video.remote?.publishedSource&&updated.remote?.publishedPrecision===video.remote?.publishedPrecision&&updated.remote?.publishedDate===video.remote?.publishedDate)return false;
      await saveRemoteSnapshot({videos:[updated],folders:get().folders.filter(folder=>folder.kind==='youtube'||folder.kind==='twitch'),checkedAt:get().remoteCheckedAt});
      const current=get().videos,index=current.indexOf(video);
      if(index<0)continue;
      const next=current.slice();next[index]=updated;set({videos:next});return true;
    }
  },
  setYoutubeMetadata: async (id, metadata) => {
    const initial = lookupVideo(get().videos, id);
    if (!initial || youtubeDownloadTarget(initial)?.videoId !== metadata.id) throw new Error('This video is no longer in the YouTube library.');
    const saved = await loadCatalogVideo(id);
    const current = lookupVideo(get().videos, id);
    if (!current || youtubeDownloadTarget(current)?.videoId !== metadata.id) throw new Error('This video was removed before its tags could be saved.');
    const full = withCatalogDetails(current, saved);
    const date = exactYoutubePublished(metadata.date);
    let updated: LibraryVideo = { ...full, detailsOnDisk: false,
      ...(Number.isFinite(metadata.duration) && metadata.duration! > 0 && metadata.duration! <= 31_536_000 ? { duration: metadata.duration } : {}),
      description: metadata.description === undefined ? full.description : metadata.description.slice(0, 16_000),
      remote: { ...full.remote!, videoId: metadata.id, youtubeKeywords: metadata.keywords === undefined ? full.remote?.youtubeKeywords : metadata.keywords.slice(0, 40),
        youtubeTagSummary: undefined, youtubeTagsCheckedAt: Date.now(),
      } };
    if(date&&!full.remote?.live&&full.remote?.youtubeType!=='upcoming')updated=withYoutubePublication(updated,metadata.id,date);
    const evidence = youtubeTextTags(updated);
    updated.remote = { ...updated.remote!, youtubeTagSummary: compactYoutubeTagEvidence(evidence) };
    const beforeSave=get(),pairedMetadata=enrichRemoteTags(beforeSave.tags,beforeSave.metadataProvenance,[updated]);
    await saveRemoteSnapshot({ videos: [updated], metadata:pairedMetadata, folders: get().folders.filter(folder => folder.kind === 'youtube' || folder.kind === 'twitch'), checkedAt: get().remoteCheckedAt });
    const state = get(), position = state.videos.findIndex(video => video.id === id);
    if (position < 0) throw new Error('The video was removed while saving its metadata.');
    // Re-evaluate against the latest manual edits after asynchronous disk work.
    const enriched = enrichRemoteTags(state.tags, state.metadataProvenance, [updated]);
    const videos = state.videos.slice(); videos[position] = catalogCard(updated);
    viewerDetails.invalidate(id);
    set({ videos, ...enriched });
    if (enriched.tags !== state.tags || enriched.metadataProvenance !== state.metadataProvenance) {
      await saveEnrichmentRows([{ id, tags: enriched.tags[id] ?? [], provenance: enriched.metadataProvenance[id] ?? { tags: {} } }]);
    }
    return { tags: evidence.tags.length, locked: tagsLocked(get().metadataProvenance[id]) };
  },
  acceptYoutubeTagSuggestions:(id,selected,base)=>{
    const current=get(),prepared=prepareYoutubeTagReview(lookupVideo(current.videos,id),current.tags[id],current.metadataProvenance[id],base,selected);
    if(!prepared.reviewed)return 0;
    set({tags:patchSparseRecord(current.tags,[[id,prepared.tags]]),metadataProvenance:patchSparseRecord(current.metadataProvenance,[[id,prepared.provenance]])});
    journalManualMetadata(id,"tags",get,set);persistSoon(get);return prepared.reviewed;
  },
  setLocalVideoDuration: async (id, duration) => {
    if (!Number.isFinite(duration) || duration <= 0 || duration > 31_536_000) throw new Error('The file did not expose a valid runtime.');
    for (;;) {
      const current = lookupVideo(get().videos, id);
      if (!current || current.remote) throw new Error('This local file is no longer in the library.');
      const updated = { ...current, duration };
      await appendCatalogVideos([updated]);
      const snapshot = get().videos, position = snapshot.indexOf(current);
      if (position < 0) continue;
      const videos = await copyCatalogArray(snapshot, yieldCatalogTask);
      if (get().videos !== snapshot) continue;
      videos[position] = updated; set({ videos }); return;
    }
  },
  releaseVideoComments: () => {
    viewerDetails.releaseComments();
  },
  setVideoTags: (id, tags) => {
    const manualTags = [...new Set(tags.map(normalizeTagValue).filter(Boolean))].slice(0, 18);
    set((s) => ({
      tags: patchSparseRecord(s.tags, [[id, manualTags]]),
      metadataProvenance: patchSparseRecord(s.metadataProvenance, [[id,
        { ...s.metadataProvenance[id], youtubeReviews:undefined, tags: Object.fromEntries(manualTags.map((tag) => [tag, "manual"] as const)), lockedFields: [...new Set([...(s.metadataProvenance[id]?.lockedFields ?? []), "tags"])] as Array<"tags" | "category">, updatedAt: Date.now() }]]),
    }));
    const state = get();
    journalManualMetadata(id,"tags",get,set);
    // Keep the small per-title journal synchronous for recovery, then defer
    // the broad preference snapshot so rapid tag edits never block input.
    persistSoon(get);
  },
  applyReviewedTags: (id, tags, source) => {
    const stateBefore = get();
    const video = lookupVideo(stateBefore.videos, id);
    const existing = stateBefore.tags[id] ?? [];
    const provenance = stateBefore.metadataProvenance[id];
    const inspected = tags.map(normalizeTagValue).filter(Boolean);
    if (!video || video.remote || tagsLocked(provenance) || !inspected.length) return 0;
    const merged = compactIngestedTags(existing, inspected);
    if (sameTags(existing, merged)) return 0;
    const added = Math.max(0, merged.filter((tag) => !existing.includes(tag)).length);
    set((s) => ({
      tags: patchSparseRecord(s.tags, [[id, merged]]),
      metadataProvenance: patchSparseRecord(s.metadataProvenance, [[id,
        mergeInferredTagProvenance(existing, merged, s.metadataProvenance[id], inspected, source)]]),
    }));
    const state = get();
    // The person explicitly confirmed this preview, so journal the accepted
    // result alongside the source attribution for crash-safe recovery.
    journalManualMetadata(id,"tags",get,set);
    persistNow(get);
    return added;
  },
  applyCompanionTags: (id, tags) => get().applyReviewedTags(id, tags, "companion-inspection"),
  autoTagLibrary: async () => {
    const result = await idleEnrichment.enqueue('smart-tags', 'Smart catalog tags', metadataEnrichmentStep({
      get, publish: set, save: saveEnrichmentRows, patch: (video, state) => enrichmentPatch(video, state, 'smart') }));
    return result.changed;
  },
  enrichMetadataTail: () => idleEnrichment.enqueue('metadata-tail', 'Metadata tail', metadataEnrichmentStep({
    get, publish: set, save: saveEnrichmentRows, cursor: metadataTailCursor, maxChanges: LIBRARY_LIMITS.metadataTailBatchSize,
    patch: (video, state) => enrichmentPatch(video, state, 'tail') })),
  repairCachedMetadata: () => queueMetadataRepair(get, set),
  repairCreatorCoverage: (): Promise<CreatorCoverageRepairResult> => idleEnrichment.enqueue('creator-coverage', 'Creator names', creatorCoverageRepairStep({
    get, publish: set, limit: LIBRARY_LIMITS.creatorCoverageRepairBatchSize,
    save: (rows, turn, valid) => saveCreatorCoverageRows(rows, turn, valid, changed => useLibrary.subscribe(changed)),
    tags: (video, state) => {
      const beforeTags = state.tags[video.id], beforeProvenance = state.metadataProvenance[video.id];
      if (tagsLocked(beforeProvenance)) return;
      const creator = video.remote?.channelName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!creator) return;
      const inferred = [`creator-${creator}`], existing = beforeTags ?? [];
      const compact = compactIngestedTags(existing, inferred);
      return { beforeTags, beforeProvenance, tags: sameTags(existing, compact) ? beforeTags ?? existing : compact,
        provenance: mergeInferredTagProvenance(existing, compact, beforeProvenance, inferred, `provider:${video.remote!.kind}`) };
    },
  })),
  setVideoCategory: (id, category) => {
    set((s) => ({
      categories: patchSparseRecord(s.categories, [[id, category.trim().slice(0, 40)]]),
      metadataProvenance: patchSparseRecord(s.metadataProvenance, [[id, { ...s.metadataProvenance[id], tags: s.metadataProvenance[id]?.tags ?? {}, category: "manual", lockedFields: [...new Set([...(s.metadataProvenance[id]?.lockedFields ?? []), "category"])] as Array<"tags" | "category">, updatedAt: Date.now() }]]),
    }));
    const state = get();
    journalManualMetadata(id,"category",get,set);
    persistNow(get);
  },
  markProgress: (id, t, d) => {
    const now = Date.now();
    const incoming = normalizeResumeMark({ t, d, at: now });
    if (!incoming) return;
    const previous = get().progress[id];
    // Frame callbacks can fire 60 times per second. A progress mark needs to
    // be durable, not frame-perfect: suppress tiny updates while still saving
    // a pause/seek or every few seconds of real playback.
    if (previous && now - previous.at < 2_500 && Math.abs(previous.t - t) < 4) return;
    set((s) => {
      const latest = s.history[0];
      const shouldRecord = incoming.t >= 2 && (!latest || latest.id !== id || now - latest.at > 60_000);
      const history = shouldRecord
        ? [{ eventId: nextHistoryEventId(now), id, at: now, position: incoming.t, duration: incoming.d, source: "progress" as const }, ...s.history].slice(0, LIBRARY_LIMITS.historyMemoryEntries)
        : s.history;
      const mark = incoming;
      const video = lookupVideo(s.videos, id);
      const entries = video ? stableResumeKeys(video).map(key => [key, newestResume(s.resumeProgress[key], mark) ?? mark] as const) : [];
      const resumeProgress = patchActivityRecord(s.resumeProgress, entries);
      return { progress: patchActivityRecord(s.progress, [[id, mark]]), resumeProgress, history };
    });
    const event = get().history[0];
    if (event?.id === id && event.at === now) void appendActivityJournal(event).catch(() => undefined);
    persistActivity(get);
  },
  recordPlay: (id, source = "open") => {
    const beforeAt = get().history[0]?.at;
    set((s) => {
      const now = Date.now();
      const latest = s.history[0];
      // Bound the in-memory history buffer, but a play button, provider event, and player
      // heartbeat for the same start should remain one activity event.
      if (latest?.id === id && now - latest.at < 20_000) return {};
      const mark = s.progress[id];
      const video = lookupVideo(s.videos, id);
      const url = video?.remote?.embedUrl ?? video?.src ?? video?.remote?.watchUrl;
      const title = video?.name?.trim();
      const poster = video?.poster ?? video?.remote?.previewUrl;
      const rating = getRating(id);
      const next = [{ eventId: nextHistoryEventId(now), id, at: now, position: mark?.t, duration: mark?.d, source, ...(url ? { url } : {}), ...(title ? { title } : {}), ...(poster ? { poster } : {}), ...(rating ? { rating } : {}) }, ...s.history];
      const bounded = next.slice(0, LIBRARY_LIMITS.historyMemoryEntries);
      return { history: bounded, viewCounts: patchActivityRecord(s.viewCounts, [[id, (s.viewCounts[id] ?? 0) + 1]]) };
    });
    const event = get().history[0];
    if (event?.id === id && event.at !== beforeAt) void appendActivityJournal(event).catch(() => undefined);
    persistActivity(get);
  },
  clearHistory: () => {
    openedPlays.clear();
    set({ history: [] });
    void clearActivityJournal().catch(() => undefined);
    persistNow(get);
  },
  openVideo: (activeId) => {
    measureInteraction("playback");
    const s = get();
    const video = lookupVideo(s.videos, activeId);
    if (video && isAdultVideo(video, s.folders) && !s.adultsUnlocked) {
      set({ sourceId: "adults" });
      persistNow(get);
      return;
    }
    if (video && !isAdultVideo(video, s.folders)) markRecommendationOpened(video);
    // A microtask still runs before paint. History follows the interaction
    // lease so player/iframe mounting gets the foreground frame first.
    setPullViewerOpen(true);
    set({ activeId, previewId: null });
    if (typeof window === 'undefined') get().recordPlay(activeId);
    else openedPlays.push(activeId);
  },
  openPreview: (previewId, card) => {
    if (card?.id === previewId) rememberVideo(get().videos, card);
    const state = get(), selected = card ?? lookupVideo(state.videos, previewId);
    if (selected && !isAdultVideo(selected, state.folders)) markRecommendationOpened(selected);
    setPullViewerOpen(true);
    measureInteraction("navigation");
    set({ previewId });
  },
  closePreview: () => { measureInteraction('navigation'); set({ previewId: null }); },
  closePlayer: () => { measureInteraction('playback'); set({ activeId: null }); },
  hideVideo: (id) => {
    set((s) => ({ hiddenVideos: { ...s.hiddenVideos, [id]: true }, activeId: s.activeId === id ? null : s.activeId, previewId: s.previewId === id ? null : s.previewId }));
    persistNow(get);
  },
  unhideVideo: (id) => {
    set((s) => { const hiddenVideos = { ...s.hiddenVideos }; delete hiddenVideos[id]; return { hiddenVideos }; });
    persistNow(get);
  },
  removeVideo: (id) => {
    set((s) => {
      const favorites = { ...s.favorites };
      const likes = { ...s.likes };
      const tags = { ...s.tags };
      const metadataProvenance = { ...s.metadataProvenance };
      const categories = { ...s.categories };
      const progress = { ...s.progress };
      const viewCounts = { ...s.viewCounts };
      delete favorites[id];
      delete likes[id];
      delete tags[id];
      delete metadataProvenance[id];
      delete categories[id];
      delete progress[id];
      delete viewCounts[id];
      return {
        videos: s.videos.filter((video) => video.id !== id),
        activeId: s.activeId === id ? null : s.activeId,
        previewId: s.previewId === id ? null : s.previewId,
        favorites,
        likes,
        tags,
        metadataProvenance,
        categories,
        progress,
        viewCounts,
        history: s.history.filter((h) => h.id !== id),
      };
    });
    void removeEnrichmentRows([id]).catch(() => undefined);
    persistNow(get);
  },
  playRelative: (delta, playlist) => {
    const { activeId } = get();
    if (!activeId || !playlist.length) return;
    const i = playlist.indexOf(activeId);
    if (i < 0) return;
    const next = playlist[i + delta];
    if (next) get().openVideo(next);
  },
  setHideDemo: (hideDemo) => {
    set((s) => ({
      hideDemo,
      sourceId: hideDemo && s.sourceId === "demo" ? "home" : s.sourceId,
    }));
    persistNow(get);
  },
  setShowHiddenAdult: (showHiddenAdult) => set({ showHiddenAdult }),
  setHardwareAccel: (hardwareAccel) => {
    set({ hardwareAccel });
    persistNow(get);
  },
  setFolderAdult: (folderId, adult) => {
    if (folderId === "demo") return;
    set((s) => ({
      folders: s.folders.map((f) => (f.id === folderId ? { ...f, adult } : f)),
      tags: adult ? Object.fromEntries(s.videos.map((video) => [video.id, video.folderId === folderId ? compactIngestedTags(s.tags[video.id] ?? [], ["adult"]) : s.tags[video.id] ?? []])) : s.tags,
      sourceId: adult ? "adults" : s.sourceId === folderId ? "home" : s.sourceId,
      activeId:
        s.activeId &&
        s.videos.some((v) => v.id === s.activeId && v.folderId === folderId) &&
        adult &&
        !s.adultsUnlocked
          ? null
          : s.activeId,
    }));
    persistNow(get);
  },
  searchAdultFeed: async (query = "all", order = "top-weekly", opts) => {
    if (get().remoteBusy || get().refreshing) throw new Error('A catalog pull is already running. Pause or finish it before starting another.');
    const policyFor: PullPolicySelector = settings => adultAdmissionPolicy(settings, opts?.automatic);
    const policy = policyFor(getPullSettings());
    const providers = opts?.providers ?? 'all';
    const providerList = providers === 'all' ? [...ADULT_PULL_PROVIDERS] : [...new Set(providers)];
    const startedAt = Date.now(), pullId = makePullId(), cancellation = getPullCancellationRevision();
    const targets = providerList.map(provider => ADULT_FOLDER_BY_PROVIDER[provider].name);
    const initialCounts = await remoteEntryCounts(get().videos);
    const cleanupRemaining = cleanupBudgets(policy);
    const requestCapacity = replacementRequestBudget(initialCounts, policy, 'adult', cleanupRemaining);
    if (!requestCapacity) throw new Error(ENTRY_LIMIT_MESSAGE);
    if (get().remoteBusy || get().refreshing) throw new Error("A catalog pull is already running.");
    const maxVideos = Math.min(requestCapacity, policy.adultBatchVideos, Math.max(1, opts?.maxVideos ?? policy.adultBatchVideos));
    const pendingProviders=[...providerList],visitedProviders=new Set<AdultPullProvider>();
    const cursors=loadAdultArchiveCursors(query,order);
    const checkpoint=(pages:Partial<Record<AdultPullProvider,number|null>>,offsets:Partial<Record<AdultPullProvider,number>>)=>{saveAdultArchiveCursors(query,order,pages,offsets);for(const provider of providerList){const page=pages[provider];if(page!=null)cursors[provider]={page,offset:offsets[provider]??0,query,order,updatedAt:Date.now()};}};
    const maxWindows=Math.max(providerList.length,Math.ceil(maxVideos/400)+providerList.length*2);
    const deadline=Date.now()+(opts?.automatic?45_000:120_000);
    let received = 0, added = 0, done = 0, carryBudget = 0;
    const diagnostics: AdultPullDiagnostic[] = [];
    const counts = new Map<string, number>();
    // Once per pull, rather than a full catalog scan on every provider page.
    const knownAdultIds = new Set<string>();
    // Yield a real browser task, then respect the shared pull gate. A resolved
    // promise alone would keep all preparation in one blocking microtask chain.
    const turn = async () => {
      await yieldCatalogTask();
      await waitForCatalogCommit(cancellation);
    };
    get().beginPull({ id: pullId, provider: 'adult', action: 'Catalog pull', startedAt, targets, done, total: providerList.length, received, added, failed: 0 });
    set({ remoteBusy: true, adultPullStatus: null, importProgress: { done: 0, total: providerList.length, label: 'Starting paced Adult pull…' } });
    try {
      await forEachCatalogSlice(get().videos, video => { if (isAdultPullKind(video.remote?.kind)) knownAdultIds.add(video.id); }, turn);
      for (let window=0;window<maxWindows&&pendingProviders.length&&added<maxVideos&&Date.now()<deadline;window++) {
        const provider=pendingProviders.shift()!;
        const firstWindow=!visitedProviders.has(provider);visitedProviders.add(provider);done=visitedProviders.size;
        let continueProvider=false;
        if (getPullCancellationRevision() !== cancellation) break;
        const providerAddedBefore = added;
        const currentCounts = await remoteEntryCounts(get().videos), currentPolicy = policyFor(getPullSettings());
        const available = replacementRequestBudget(currentCounts, currentPolicy, 'adult', cleanupRemaining);
        if (!available) break;
        const budget = Math.min(available,400,maxVideos-added,adultProviderPullBudget(maxVideos-added,pendingProviders.length+1,0,carryBudget));
        carryBudget = 0;
        if (!budget) continue;
        const saved = cursors[provider];
        const page = firstWindow ? opts?.providerPages?.[provider] ?? (opts?.resumeArchive === false ? opts?.page ?? 1 : saved?.page ?? opts?.page ?? 1) : saved?.page??1;
        const offset = firstWindow && (opts?.resumeArchive === false || (opts?.providerPages?.[provider] !== undefined && opts.providerPages[provider] !== saved?.page)) ? 0 : saved?.offset ?? 0;
        set({ importProgress: { done, total: providerList.length, label: `Pulling ${provider} · page ${page} · up to ${budget} entries…` } });
        try {
          const walked = await walkAdultPull(budget, page, offset, async (nextPage, nextOffset, limit) => {
            set({ importProgress: { done, total: providerList.length, label: `Pulling ${provider} · page ${nextPage} · target ${budget.toLocaleString()} entries…` } });
            const response = await searchAdultVideos({ data: { query, order, page: nextPage, maxVideos: limit, append: true, providers: [provider], providerPages: { [provider]: nextPage }, providerOffsets: { [provider]: nextOffset }, redditSources: opts?.redditSources } });
            return { ...response, nextPage: response.providerNextPages[provider] ?? null, nextOffset: response.providerNextOffsets[provider] ?? 0 };
          }, turn, { known: provider === 'chaturbate' || provider === 'myfreecams' ? undefined : knownAdultIds, refreshLimit: 32,
            maxRequests: opts?.automatic ? 4 : 12, maxMs: Math.min(deadline-Date.now(),opts?.automatic ? 12_000 : 20_000) });
          if (!walked.latest) {
            carryBudget += budget;

            get().updatePull({ done, received, added, failed: diagnostics.filter(row => row.status === 'failed').length });
            continue;
          }
          continueProvider=walked.latest.nextPage!=null&&!walked.error;
          const result = { ...walked.latest, videos: walked.videos,
            providerDiagnostics: walked.latest.providerDiagnostics.map(row => ({ ...row, titles: walked.videos.length, detail: row.status==='failed'?row.detail:`${walked.newCount.toLocaleString()} new candidates · ${walked.refreshedCount} saved titles refreshed · ${walked.requests} requests · ${walked.duplicates.toLocaleString()} already-saved/repeated titles skipped${walked.error ? ' · stopped after a provider error; saved results are retained' : ''}` })) };
          if (walked.error) result.providerDiagnostics.push({ provider, status: 'failed', titles: 0, detail: walked.error instanceof Error ? walked.error.message : String(walked.error) });
          await turn();
          const fetchedVideos = applyCachedAdultUrls(result.videos);
          let fetched = dedupeAdultVideoCards(fetchedVideos);
          fetched = await rotateRemotePull(get, fetched, cleanupRemaining, policyFor);
          let admission = (await prepareRemotePull(get, fetched, undefined, false, policyFor)).admission;
          let videos = admission.videos;
          if (admission.skipped) result.providerDiagnostics.push({ provider, status: 'empty', titles: 0, detail: ENTRY_LIMIT_MESSAGE });
          if (!videos.length) {
            // Empty windows still advance/cool down, without copying the entire
            // catalog and its metadata just to publish an unchanged shelf.
            diagnostics.push(...result.providerDiagnostics);
            if (!admission.skipped) checkpoint(result.providerNextPages, result.providerNextOffsets);
            if (walked.error) recordAdultArchiveFailure(query, order, provider);
            if(continueProvider&&!admission.skipped)pendingProviders.push(provider);
            if (!admission.skipped) carryBudget += budget;

            get().updatePull({ done, received, added, failed: diagnostics.filter(row => row.status === 'failed').length });
            continue;
          }
          // Enrichment is bounded by this response and runs outside the store
          // update, so unrelated UI subscribers stay available between slices.
          const inferredTags = new Map<string, string[]>();
          await forEachCatalogSlice(fetched, video => {
            const source = video.remote?.kind ?? video.folderId.split(":")[0] ?? "eporner";
            const redditExtra = source === 'reddit' ? redditIngestExtras({
              subreddit: video.remote?.channelId, title: video.name,
              extraText: `${video.description ?? ''} ${video.tagline ?? ''}`,
              mediaKind: video.extension === 'image' ? 'image' : /video/i.test(video.mime) ? 'video' : undefined,
            }) : [];
            inferredTags.set(video.id, adultIngestTags({ source,
              extraSources: [...(video.remote?.sourceKinds ?? []).filter(kind => kind !== source),
                ...(source === 'booru' && video.remote?.channelId ? [video.remote.channelId] : []),
                ...(source === 'reddit' && video.remote?.channelId ? [`reddit-${video.remote.channelId}`] : [])],
              creatorNames: [video.remote?.channelName, source === 'chaturbate' || source === 'myfreecams' ? video.remote?.videoId : undefined],
              apiKeywords: video.description ?? video.tagline ?? '', title: video.name,
              description: video.description ?? video.tagline ?? '', extraTags: redditExtra,
              extraText: source === 'reddit' ? `${video.name} ${video.tagline ?? ''}` : undefined,
              limit: LIBRARY_LIMITS.adultKeywordTagsPerTitle + 36,
            }));
          }, turn);
          // Commit only against the current immutable inputs. A tag edit, folder
          // removal, or other ingest during a yield causes a safe rebase.
          let committed = false;
          while (!committed) {
            const base = get(), entryPolicy = getPullSettings();
            admission = (await prepareRemotePull(get, fetched, undefined, false, policyFor)).admission;
            if (get().videos !== base.videos || getPullSettings() !== entryPolicy) continue;
            videos = admission.videos;
            if (!videos.length) { committed = true; break; }
            const wanted = new Set(videos.map(video => video.id));
            const positions = new Map<string, number>();
            counts.clear();
            await forEachCatalogSlice(base.videos, (video, index) => {
              if (wanted.has(video.id)) positions.set(video.id, index);
              if ((ADULT_FOLDER_IDS as readonly string[]).includes(video.folderId)) counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1);
            }, turn);
            const nextTags = sparseRecordBuilder(base.tags);
            const nextMetadata = sparseRecordBuilder(base.metadataProvenance);
            const nextVideos = await copyCatalogArray(base.videos, turn);
            let batchAdded = 0;
            await forEachCatalogSlice(videos, (video, index) => {
              const position = positions.get(video.id);
              if (position === undefined) {
                positions.set(video.id, nextVideos.length); nextVideos.push(catalogCard(video)); batchAdded++;
                counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1);
              } else {video=retainAdultRefreshEvidence(base.videos[position],video,base.metadataProvenance[video.id]);videos[index]=video;nextVideos[position] = catalogCard(video);}
              const current = base.tags[video.id] ?? [];
              if (tagsLocked(base.metadataProvenance[video.id])) return;
              const inferred = inferredTags.get(video.id) ?? [];
              const compact = compactIngestedTags(current, inferred);
              nextTags.set(video.id, compact);
              nextMetadata.set(video.id, mergeInferredTagProvenance(current, compact, base.metadataProvenance[video.id], inferred, `provider:${video.remote?.kind ?? 'eporner'}`));
            }, turn);
            await turn();
            const latest = get();
            if (latest.videos !== base.videos || latest.tags !== base.tags || latest.metadataProvenance !== base.metadataProvenance || getPullSettings() !== entryPolicy) continue;
            // Save rows before publishing their resume point. Once this write
            // starts it is accepted work, even if Cancel arrives mid-transaction.
            await appendCatalogVideos(videos);
            await waitForCatalogCommit(cancellation).catch(error => {
              if (getPullCancellationRevision() === cancellation) throw error;
            });
            const afterSave = get();
            if (afterSave.videos !== base.videos || afterSave.tags !== base.tags || afterSave.metadataProvenance !== base.metadataProvenance) {
              if (getPullCancellationRevision() !== cancellation) break;
              continue;
            }
            const folder = ADULT_FOLDER_BY_PROVIDER[provider];
            const nextFolder = { ...folder, videoCount: counts.get(folder.id) ?? 0, adult: true };
            set({ videos: nextVideos,
              folders: afterSave.folders.some(row => row.id === folder.id) ? afterSave.folders.map(row => row.id === folder.id ? nextFolder : row) : [...afterSave.folders, nextFolder],
              tags: nextTags.finish(), metadataProvenance: nextMetadata.finish(), adultsUnlocked: true });
            rememberEntryCounts(nextVideos, admission.counts);
            added += batchAdded; received += fetched.length;
            committed = true;
          }
          if (!committed) break;
          cacheAdultVideoUrls(videos);
          for (const video of videos) knownAdultIds.add(video.id);
          diagnostics.push(...result.providerDiagnostics);
          if (!admission.skipped) checkpoint(result.providerNextPages, result.providerNextOffsets);
          for (const diagnostic of result.providerDiagnostics) if (diagnostic.status === 'failed' && (ADULT_PULL_PROVIDERS as readonly string[]).includes(diagnostic.provider)) recordAdultArchiveFailure(query, order, diagnostic.provider as AdultPullProvider);
          if (!admission.skipped) carryBudget += Math.max(0, budget - admission.added);
        } catch (error) {
          continueProvider=false;
          if (getPullCancellationRevision() !== cancellation) break;
          recordAdultArchiveFailure(query, order, provider);
          diagnostics.push({ provider, status: 'failed', titles: 0, detail: error instanceof Error ? error.message : String(error) });
          carryBudget += Math.max(0, budget - (added - providerAddedBefore));
        }
        if(continueProvider&&added<maxVideos)pendingProviders.push(provider);
        get().updatePull({ done, received, added, failed: diagnostics.filter(row => row.status === 'failed').length });
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (received) persistSoon(get);
      const failed = diagnostics.filter(row => row.status === 'failed');
      const cancelled = getPullCancellationRevision() !== cancellation;
      const resumable = pendingProviders.length>0&&added<maxVideos;
      set({ adultPullStatus: { note: cancelled ? 'Pull cancelled. Accepted entries and archive resume points are saved.' : `${added.toLocaleString()} new entries · ${received.toLocaleString()} received. Archive pages are saved after each small window.${resumable?' More pages remain; use Continue archive.':''}`, diagnostics } });
      get().finishPull({ id: pullId, provider: 'adult', action: 'Catalog pull', startedAt, finishedAt: Date.now(), targets, done, total: providerList.length, received, added, failed: failed.length, status: cancelled || resumable ? 'partial' : failed.length ? received ? 'partial' : 'failed' : received ? 'success' : 'partial', errors: cancelled ? ['Pull cancelled. Accepted entries and archive resume points are saved.'] : failed.map(row => `${row.provider}: ${row.detail}`).slice(0, 12) });
      return [...counts.values()].reduce((sum, count) => sum + count, 0);
    } finally { set({ remoteBusy: false, importProgress: null }); }
  },
  addFolder: async (inputEl, startIn, opts) => {
    const result = await pickDirectory(startIn);
    if (result === "abort") return;
    if (result === "fallback") {
      inputEl?.click();
      return;
    }
    const handle = result;
    const granted = await requestDirPermission(handle);
    if (!granted) return;
    const folderId = `folder:${handle.name}:${createShortLocalId("", 8)}`;
    rememberDirHandle(folderId, handle);
    const adult = Boolean(opts?.adult);
    const folder: Folder = {
      id: folderId,
      name: handle.name,
      kind: "directory",
      videoCount: 0,
      recommended: startIn,
      adult,
    };
    set((s) => ({
      folders: [...s.folders.filter((f) => f.id !== folderId), folder],
      scanning: { found: 0, looked: 0, folderName: handle.name },
    }));
    let writeChain: Promise<void> = clearFolderVideos(folderId).catch(() => undefined);
    let discoveredPhotos = 0;
    try {
      const videos = await ingestDirectoryHandle(handle, folderId, {
        onProgress: (p) => set({ scanning: p }),
        onImage: (file, relativePath) => {
          discoveredPhotos += 1;
          useSourceAssets.getState().capturePhoto(file, `${handle.name}/${relativePath}`);
        },
        onBatch: (batch) => {
          if (!batch.length) return;
          set((s) => ({
            videos: s.videos.concat(batch),
            folders: s.folders.map((f) =>
              f.id === folderId
                ? { ...f, videoCount: (f.videoCount ?? 0) + batch.length }
                : f,
            ),
          }));
          writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => undefined);
        },
      });
      await writeChain;
      set((s) => ({
          folders: s.folders.map((f) =>
            f.id === folderId ? { ...f, videoCount: videos.length, photoCount: discoveredPhotos } : f,
          ),
          scanning: null,
      }));
      if (videos.length) set((s) => addLocalNameTags(s.tags, s.metadataProvenance, videos));
      flushPersist(get);
      await saveDirHandle({ id: folderId, name: handle.name, handle });
      // Final authoritative write in case batches were empty / partial.
      if (videos.length) await saveFolderVideos(folderId, videos).catch(() => undefined);
    } catch (err) {
      set({ scanning: null });
      throw err;
    }
  },
  addFiles: async (inputEl) => {
    inputEl?.click();
  },
  ingestFromInput: async (files, asDirectory, opts) => {
    if (!files.length) return;
    useSourceAssets.getState().capture(files);
    const first = files[0];
    const rel = first.webkitRelativePath || "";
    const folderName = asDirectory ? rel.split("/")[0] || "Folder" : "Added files";
    const folderId = asDirectory
      ? `folder:${folderName}:${createShortLocalId("", 8)}`
      : `files:${createShortLocalId("", 8)}`;
    const adult = Boolean(opts?.adult) || get().sourceId === "adults" || get().sourceId === "adult-fetishes";
    const folder: Folder = {
      id: folderId,
      name: folderName,
      kind: asDirectory ? "directory" : "files",
      videoCount: 0,
      adult,
    };
    set((s) => ({
      folders: [...s.folders, folder],
      scanning: { found: 0, looked: 0, folderName },
    }));
    let writeChain: Promise<void> = Promise.resolve();
    const videos = await ingestFileList(files, folderId, folderName, {
      onProgress: (p) => set({ scanning: p }),
      onBatch: (batch) => {
        if (!batch.length) return;
        set((s) => ({
          videos: s.videos.concat(batch),
          folders: s.folders.map((f) =>
            f.id === folderId
              ? { ...f, videoCount: (f.videoCount ?? 0) + batch.length }
              : f,
          ),
        }));
        writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => undefined);
      },
    });
    await writeChain;
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === folderId ? { ...f, videoCount: videos.length } : f,
      ),
      scanning: null,
    }));
    if (videos.length) set((s) => addLocalNameTags(s.tags, s.metadataProvenance, videos));
    flushPersist(get);
    if (videos.length) await saveFolderVideos(folderId, videos).catch(() => undefined);
  },
  ingestDrop: async (dt) => {
    const nameGuess =
      dt.files?.[0]?.webkitRelativePath?.split("/")[0] || dt.files?.[0]?.name || "Dropped files";
    const folderId = `drop:${createShortLocalId("", 8)}`;
    const adult = get().sourceId === "adults" || get().sourceId === "adult-fetishes";
    set((s) => ({
      folders: [
        ...s.folders,
        {
          id: folderId,
          name: nameGuess,
          kind: "files",
          videoCount: 0,
          adult,
        },
      ],
      scanning: { found: 0, looked: 0, folderName: nameGuess },
    }));
    let writeChain: Promise<void> = Promise.resolve();
    const videos = await ingestDataTransfer(dt, folderId, nameGuess, {
      onProgress: (p) => set({ scanning: p }),
      onBatch: (batch) => {
        if (!batch.length) return;
        set((s) => ({
          videos: s.videos.concat(batch),
          folders: s.folders.map((f) =>
            f.id === folderId
              ? { ...f, videoCount: (f.videoCount ?? 0) + batch.length }
              : f,
          ),
        }));
        writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => undefined);
      },
    });
    await writeChain;
    const folderName = videos[0]?.path.includes("/")
      ? videos[0].path.split("/")[0]
      : "Dropped files";
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              name: folderName,
              kind: videos.some((v) => v.path.includes("/")) ? "directory" : "files",
              videoCount: videos.length,
            }
          : f,
      ),
      scanning: null,
    }));
    if (videos.length) set((s) => addLocalNameTags(s.tags, s.metadataProvenance, videos));
    flushPersist(get);
    if (videos.length) await saveFolderVideos(folderId, videos).catch(() => undefined);
  },
  restoreFolders: () => {
    if(get().hydrated || restoring)return restoreCompletion??Promise.resolve();
    restoring=true;
    restoreCompletion=(async()=>{try{


    beginStartupPhase('preferences');
    set({ pullHistory: loadPullHistory() });
    await recoverCatalogMutations().catch(() => undefined);
    await restoreDurablePrefs().catch(() => undefined);
    void hydrateDurableFeedback().catch(() => undefined);
    void hydrateTopicAliases();
    const dedicatedFollows = await restoreDurableFollows().catch(() => loadFollows() ?? []);
    const prefsState = applyPrefs({});
    Object.assign(prefsState, await restoreEnrichmentRows({ tags: prefsState.tags ?? {}, metadataProvenance: prefsState.metadataProvenance ?? {} }).catch(() => ({ tags: prefsState.tags ?? {}, metadataProvenance: prefsState.metadataProvenance ?? {} })));
    prefsState.tags = restoreTagEdits(prefsState.tags ?? {});
    prefsState.metadataProvenance = restoreMetadataEdits(prefsState.metadataProvenance ?? {});
    Object.assign(prefsState,await restoreCatalogMetadata({tags:prefsState.tags??{},metadataProvenance:prefsState.metadataProvenance??{},categories:prefsState.categories??{}}).catch(()=>({})));
    // Dedicated store is source of truth; prefs.follows is a legacy mirror for older builds.
    const prefsFollows = Array.isArray(prefsState.follows) ? prefsState.follows : [];
    const migratedFollows = dedupeFollows([...dedicatedFollows, ...prefsFollows]);
    prefsState.follows = migratedFollows;
    const youtubeCooldown = restoreYoutubeCooldown(migratedFollows);
    if (youtubeCooldown) prefsState.youtubeRefreshStatus = { at: Date.now(), checked: 0, refreshed: 0, failed: 0, youtube: 0, twitch: 0, ...youtubeCooldown };
    // Persist migration immediately so a later prefs-only wipe cannot drop the list again.
    if (migratedFollows.length) saveFollows(migratedFollows);
    const adultIds = new Set(loadPrefs()?.privateFolderIds ?? []);
    let cachedFolderIds = new Set<string>();
    let savedHealth = new Map<string, Awaited<ReturnType<typeof loadSourceHealth>>[number]>();
    // Startup storage can resolve after a user has already chosen a section.
    // Restore preferences without replacing that newer navigation decision.
    preferencesRestored = true;
    set((s) => ({ ...prefsState, ...(navigationChanged ? { sourceId: s.sourceId } : {}) }));
    finishStartupPhase('preferences');
    // Keep the durable activity journal separate from broad preferences. It
    // merges after first paint, so a massive tag payload cannot wipe history
    // or block startup recovery.
    const restoringShelfRevision = savedShelfRevision;
    personalRestoreCompletion = Promise.all([
      loadActivitySnapshot(),
      loadActivityJournal(),
      restoreDurableHistory(),
      restoreDurableResume(),
      restoreDurableMarks(),
      restoreDurableShelves(),
      restoreDurableLinks(),
    ]).then(async ([activity, journal, durableHistory, durableResume, durableMarks, durableShelves, durableLinks]) => {
      const queuedResume = takeQueuedResumeReplay();
      const hasShelves = durableShelves.authoritative || durableShelves.favorites.length || durableShelves.likes.length;
      const hasAnything = activity || journal.length || durableHistory.length
        || Object.keys(durableResume.resumeProgress).length
        || Object.keys(durableMarks.viewCounts).length
        || Object.keys(durableMarks.cameCounts).length
        || hasShelves || durableLinks.length || Object.keys(queuedResume).length;
      if (!hasAnything) return;
      if (durableHistory.length || (activity?.history?.length ?? 0) || journal.length) {
        const mergedEarly = mergeHistory(mergeHistory(durableHistory, activity?.history ?? []), journal);
        if (mergedEarly.length) saveDurableHistory(mergedEarly);
      }
      if (Object.keys(durableResume.resumeProgress).length || activity?.resumeProgress) {
        saveDurableResume(
          recoverResumeRecords(activity?.progress, durableResume.progress),
          recoverResumeRecords(activity?.resumeProgress, durableResume.resumeProgress),
        );
      }
      if (Object.keys(durableMarks.viewCounts).length || Object.keys(durableMarks.cameCounts).length || activity?.viewCounts || activity?.cameCounts) {
        saveDurableMarks(
          recoverActivityCounts(activity?.viewCounts, durableMarks.viewCounts),
          recoverActivityCounts(activity?.cameCounts, durableMarks.cameCounts),
        );
      }
      if (durableLinks.length) saveDurableLinks(durableLinks);
      set((s) => {
        const resumeProgress = recoverResumeRecords(s.resumeProgress, activity?.resumeProgress, durableResume.resumeProgress, queuedResume);
        const replaceShelves = durableShelves.authoritative && savedShelfRevision === restoringShelfRevision;
        const favorites = replaceShelves ? {} as Record<string, true> : { ...s.favorites };
        const likes = replaceShelves ? {} as Record<string, true> : { ...s.likes };
        if (savedShelfRevision === restoringShelfRevision) {
          for (const id of durableShelves.favorites) favorites[id] = true;
          for (const id of durableShelves.likes) likes[id] = true;
        }
        const history = mergeHistory(mergeHistory(mergeHistory(s.history, durableHistory), activity?.history ?? []), journal);
        const linkById = new Map((durableLinks as SavedVideoLink[]).map((link) => [link.id, link]));
        const withUrls = history.map((entry) => {
          if (entry.url) return entry;
          const link = linkById.get(entry.id);
          return link ? { ...entry, url: link.url, title: entry.title ?? link.title, poster: entry.poster ?? link.poster } : entry;
        });
        return {
          history: withUrls,
          resumeProgress,
          progress: recoverResumeRecords(s.progress, activity?.progress, durableResume.progress),
          viewCounts: recoverActivityCounts(s.viewCounts, activity?.viewCounts, durableMarks.viewCounts),
          cameCounts: recoverActivityCounts(s.cameCounts, activity?.cameCounts, durableMarks.cameCounts),
          favorites,
          likes,
        };
      });
      // Activity can arrive after the catalog. Link aliases outside the store
      // update and retry if playback or another restore changed those inputs.
      for (;;) {
        const base = get();
        const progress = await reconcileRestoredResume(base.videos, base.progress, base.resumeProgress, newestResume);
        const latest = get();
        if (base.videos !== latest.videos || base.progress !== latest.progress || base.resumeProgress !== latest.resumeProgress) continue;
        if (progress !== base.progress) set({ progress });
        break;
      }
    }).catch(() => undefined);
    // Let React paint the shell and saved preferences before opening and
    // merging a potentially very large remote catalog from IndexedDB.
    set({ hydrated: true });
    await new Promise<void>((resolve) => {
      if (typeof window === "undefined") resolve();
      else window.setTimeout(resolve, 32);
    });
    beginStartupPhase('remoteRead');
    try {
      const snapshot = await loadRemoteSnapshot();
      finishStartupPhase('remoteRead', snapshot?.videos.length ?? 0);
      beginStartupPhase('remotePrepare');
      if (snapshot) {
        let base = get(), prepared = await prepareCatalogRestore(base, snapshot.videos, { remoteOnly: true, newestResume });
        while (!sameRestoreInputs(base, get())) {
          base = get(); prepared = await prepareCatalogRestore(base, snapshot.videos, { remoteOnly: true, newestResume });
        }
        const folderIds = new Set(snapshot.folders.map(folder => folder.id));
        const currentFolders = new Map(get().folders.map(folder => [folder.id, folder]));
        set((s) => {
          // Saved tags paint immediately; the idle repair below owns enrichment.
          // Parsing every remote title here stalls a large catalog's first view.
          return {
            videos: prepared.videos,
            progress: prepared.progress,
            folders: [...s.folders.filter((f) => !folderIds.has(f.id)), ...snapshot.folders.filter((f) => prepared.followIds.has(f.id)).map(folder => {
              const current = currentFolders.get(folder.id);
              return current && (current.lastCheckedAt ?? 0) > (folder.lastCheckedAt ?? snapshot.checkedAt) ? current : folder;
            })],
            remoteCheckedAt: Math.max(s.remoteCheckedAt ?? 0, snapshot.checkedAt),
            youtubeCleanup: snapshot.youtubeCleanup ?? s.youtubeCleanup,
          };
        });
      }
      finishStartupPhase('remotePrepare', get().videos.length);
    } catch {
      finishStartupPhase('remoteRead', undefined, true);
      finishStartupPhase('remotePrepare', undefined, true);
      /* The catalog remains usable when storage is unavailable. */
    }
    void restoreDurablePhotos().then((photos) => {
      if (!photos.sources.length) return;
      set(s => ({ folders: restorePhotoFolders(s.folders, photos.sources, adultIds) }));
    }).catch(() => undefined);
    restoring = false;
    // A pasted import list is a durable recovery queue. Resume every missing
    // entry—not only an entirely empty shelf—so partial Twitch imports keep
    // progressing across reloads without requiring “Load saved list now”.
    if (typeof window !== "undefined") {
      const importSessions = {twitch:await loadImportSession('twitch'),youtube:await loadImportSession('youtube')};
      const recover = (kind: "twitch" | "youtube") => {
        try {
          const saved = importSessions[kind].saved as unknown;
          if (!Array.isArray(saved) || !saved.length) return;
          const original = saved.filter((value): value is string => typeof value === "string" && Boolean(value.trim()));
          const repaired = kind === 'youtube' && !importSessions.youtube.review ? repairYoutubeImport(original, importSessions.youtube.draft) : null;
          const handles = repaired?.queries ?? original;
          if (repaired?.fragments.size) {
            try { localStorage.setItem('reelcase.import-history.youtube', JSON.stringify(handles)); } catch { /* A full mirror must not block durable follow recovery. */ }
            set({ follows: reviewYoutubeImport(get().follows, importSessions.youtube.draft) });
          }
          // Seed durable follow stubs from the import list before network pulls so a
          // refresh mid-recovery cannot leave the shelf empty again.
          const resolvedQueries = resolvedFollowQueries(get().follows, kind);
          const pendingHandles = handles.filter(query => !resolvedQueries.has(canonicalFollowHandle(kind, query)));
          const stubs = pendingHandles.map(query => importedFollowStub(query, kind)).filter(row => row.handle);
          if (stubs.length) {
            const merged = dedupeFollows([...get().follows, ...stubs]);
            set({ follows: merged });
            saveFollows(merged);
          }
          // Startup recovery must never monopolize the first screen when a user
          // has hundreds of subscriptions. The complete saved list stays intact;
          // each refresh resumes a bounded, provider-friendly batch.
          // Reviewed drafts contain held/excluded identities. Only a new explicit
          // review action may resume those batches; legacy recovery stays intact.
          if (importSessions[kind].review) return [];
          const failures = new Map(get().follows.filter(channel => channel.kind === kind && channel.lastProviderFailure).map(channel => [canonicalFollowHandle(kind, channel.importQuery ?? channel.handle), channel.lastProviderFailure!]));
          return pendingHandles.filter(query => {
            const failure = failures.get(canonicalFollowHandle(kind, query));
            return !failure || Date.now() >= (failure.retryAt ?? failure.at + 60 * 60_000);
          }).slice(0, kind === 'youtube' ? 4 : 8).map(query => ({ query, kind }));
        } catch { /* no saved import list */ }
      };
      // Seed both queues before either provider waits on pause/network work.
      const twitchRecovery = recover('twitch') ?? [];
      const youtubeRecovery = recover('youtube') ?? [];
      if (getPullSettings().automaticPulls && !pullsPaused()) void (async () => {
        if (twitchRecovery.length) await get().importBatch(twitchRecovery);
        if (youtubeRecovery.length) await get().importBatch(youtubeRecovery);
      })().catch(() => undefined);
    }
    // Saved follows hydrate synchronously from preferences. The app shell owns the
    // single background refresh, avoiding two competing refreshes and rail flicker.
    beginStartupPhase('localRead');
    try {
      const [storedCatalog, healthRows] = await Promise.all([loadCatalogVideos(), loadSourceHealth()]);
      finishStartupPhase('localRead', storedCatalog.length);
      beginStartupPhase('localPrepare');
      savedHealth = new Map(healthRows.map((entry) => [entry.id, entry]));
      if (storedCatalog.length) {
        let base = get(), prepared = await prepareCatalogRestore(base, storedCatalog, { newestResume });
        while (!sameRestoreInputs(base, get())) {
          base = get(); prepared = await prepareCatalogRestore(base, storedCatalog, { newestResume });
        }
        const counts = prepared.counts;
        cachedFolderIds = new Set(counts.keys());
        set((s) => {
          const folderIds = new Set(s.folders.map(folder => folder.id));
          return {
          videos: prepared.videos,
          progress: prepared.progress,
          folders: [
            ...s.folders,
            ...[...counts.entries()]
              .filter(([id]) => !folderIds.has(id))
              .map(([id, videoCount]) => ({
                id,
                name: id.split(":")[1] || id,
                kind: "directory" as const,
                videoCount,
                adult: adultIds.has(id) || (ADULT_FOLDER_IDS as readonly string[]).includes(id),
                needsPermission: true,
              })),
          ].map((f) => {
            const provider = Object.values(ADULT_FOLDER_BY_PROVIDER).find(folder => folder.id === f.id);
            return { ...f, ...(provider ? { name: provider.name, kind: provider.kind, adult: true, needsPermission: false } : {}), ...(counts.has(f.id) ? { videoCount: counts.get(f.id) ?? f.videoCount, ...(savedHealth.get(f.id) ?? {}) } : {}) };
          }),
        };
        });
      }
      finishStartupPhase('localPrepare', get().videos.length);
    } catch {
      finishStartupPhase('localRead', undefined, true);
      finishStartupPhase('localPrepare', undefined, true);
      // catalog optional
    }
    markCatalogReady();
    // Start after both saved catalogs are present; the idle owner handles
    // input, visibility, playback, durable batches and cancellation.
    queueMetadataRepair(get, set);
    let stored: Awaited<ReturnType<typeof loadDirHandles>> = [];
    try {
      stored = await loadDirHandles();
    } catch {
      return;
    }
    for (const row of stored) {
      rememberDirHandle(row.id, row.handle);
      let perm: PermissionState = "prompt";
      try {
        perm = await queryDirPermission(row.handle);
      } catch {
        perm = "prompt";
      }
      const adult = adultIds.has(row.id);
      const cacheFirst = localStorage.getItem("reelcase.source-cache-first") !== "false";
      // Cached catalogs are intentionally stable at startup. Re-scanning a large
      // permitted folder on every reload makes the sidebar flicker and delays the
      // first screen; explicit source reload remains available when needed.
      if ((cacheFirst && (cachedFolderIds.has(row.id) || savedHealth.has(row.id)))
        || !getPullSettings().automaticPulls || pullsPaused()) {
        const snapshot = { id: row.id, health: "cached" as const, lastCheckedAt: Date.now(), videoCount: savedHealth.get(row.id)?.videoCount ?? 0 };
        set((s) => ({ folders: s.folders.some(folder => folder.id === row.id)
          ? s.folders.map((folder) => folder.id === row.id ? { ...folder, name: row.name, needsPermission: perm !== 'granted', ...snapshot } : folder)
          : [...s.folders, { id: row.id, name: row.name, kind: 'directory', videoCount: snapshot.videoCount, adult, needsPermission: perm !== 'granted', health: 'cached' }] }));
        if (cachedFolderIds.has(row.id) || savedHealth.has(row.id)) void saveSourceHealth(snapshot).catch(() => undefined);
        continue;
      }
      if (perm === "granted") {
        set((s) => ({
          scanning: { found: 0, looked: 0, folderName: row.name },
          folders: [
            ...s.folders.filter((f) => f.id !== row.id),
            {
              id: row.id,
              name: row.name,
              kind: "directory",
              videoCount: 0,
              adult,
            },
          ],
          videos: s.videos.filter((v) => v.folderId !== row.id),
        }));
        let writeChain: Promise<void> = clearFolderVideos(row.id).catch(() => undefined);
        try {
          const videos = await ingestDirectoryHandle(row.handle, row.id, {
            onProgress: (p) => set({ scanning: p }),
            onBatch: (batch) => {
              if (!batch.length) return;
              set((s) => ({
                videos: s.videos.concat(batch),
                folders: s.folders.map((f) =>
                  f.id === row.id
                    ? { ...f, videoCount: (f.videoCount ?? 0) + batch.length }
                    : f,
                ),
              }));
              writeChain = writeChain
                .then(() => appendCatalogVideos(batch))
                .catch(() => undefined);
            },
          });
          await writeChain;
          set((s) => ({
            folders: s.folders.map((f) =>
              f.id === row.id
                ? { ...f, videoCount: videos.length, needsPermission: false, health: "healthy", lastCheckedAt: Date.now() }
                : f,
            ),
            scanning: null,
          }));
          if (videos.length) await saveFolderVideos(row.id, videos).catch(() => undefined);
          void saveSourceHealth({ id: row.id, health: "healthy", lastCheckedAt: Date.now(), videoCount: videos.length }).catch(() => undefined);
        } catch {
          void saveSourceHealth({ id: row.id, health: "unavailable", lastCheckedAt: Date.now(), videoCount: 0 }).catch(() => undefined);
          set((s) => ({
            scanning: null,
            folders: [
              ...s.folders.filter((f) => f.id !== row.id),
              {
                id: row.id,
                name: row.name,
                kind: "directory",
                videoCount: 0,
                needsPermission: true,
                health: "unavailable",
                lastCheckedAt: Date.now(),
                adult,
              },
            ],
          }));
        }
      } else {
        void saveSourceHealth({ id: row.id, health: "permission-needed", lastCheckedAt: Date.now(), videoCount: savedHealth.get(row.id)?.videoCount ?? 0 }).catch(() => undefined);
        set((s) => ({
          folders: [
            ...s.folders.filter((f) => f.id !== row.id),
            {
              id: row.id,
              name: row.name,
              kind: "directory",
              videoCount: s.folders.find((f) => f.id === row.id)?.videoCount ?? 0,
              needsPermission: true,
              health: "permission-needed",
              lastCheckedAt: Date.now(),
              adult,
            },
          ],
        }));
      }
    }

    }finally{await personalRestoreCompletion;}
    })();
    return restoreCompletion;
  },
  restoreOne: async (folderId) => {
    const handle = getDirHandle(folderId);
    if (!handle) return;
    const ok = await requestDirPermission(handle);
    if (!ok) return;
    const folder = get().folders.find((f) => f.id === folderId);
    const name = folder?.name ?? handle.name;
    const resumeByPath = new Map(get().videos.filter((video) => video.folderId === folderId).map((video) => [video.path, get().progress[video.id]]));
    const retainedRecoveryIds = new Set([
      ...get().history.map((entry) => entry.id),
      ...Object.keys(get().favorites),
      ...Object.keys(get().likes),
    ]);
    set((s) => ({
      scanning: { found: 0, looked: 0, folderName: name },
      // Keep history, favorites, and likes visible while a folder is being
      // rebuilt. A scan must never make the recovery views look empty merely
      // because their source is between batches.
      videos: s.videos.filter((v) => v.folderId !== folderId || retainedRecoveryIds.has(v.id)),
      unavailable: Object.fromEntries(Object.entries(s.unavailable).filter(([id]) => !s.videos.some((video) => video.id === id && video.folderId === folderId))),
      folders: s.folders.map((f) =>
        f.id === folderId ? { ...f, videoCount: 0, needsPermission: false } : f,
      ),
    }));
    let writeChain: Promise<void> = clearFolderVideos(folderId).catch(() => undefined);
    const videos = await ingestDirectoryHandle(handle, folderId, {
      onProgress: (p) => set({ scanning: p }),
      onBatch: (batch) => {
        if (!batch.length) return;
        set((s) => ({
          videos: s.videos.concat(batch.filter((video) => !s.videos.some((existing) => existing.id === video.id))),
          folders: s.folders.map((f) =>
            f.id === folderId
              ? { ...f, videoCount: (f.videoCount ?? 0) + batch.length }
              : f,
          ),
        }));
        writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => undefined);
      },
    });
    await writeChain;
    const recoveredProgress = videos.reduce<Record<string, ProgressMark>>((next, video) => {
      const mark = resumeByPath.get(video.path);
      if (mark) next[video.id] = mark;
      return next;
    }, {});
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === folderId ? { ...f, videoCount: videos.length, needsPermission: false } : f,
      ),
      scanning: null,
      progress: { ...s.progress, ...recoveredProgress },
    }));
    if (videos.length) await saveFolderVideos(folderId, videos).catch(() => undefined);
  },
  repairArtworkSource: async (folderId) => {
    const handle = getDirHandle(folderId);
    // Never surprise the user with a folder-permission prompt while cards are
    // rendering. A granted companion/browser handle can be safely rescanned.
    if (!handle || (await queryDirPermission(handle)) !== "granted") return false;
    await get().restoreOne(folderId);
    return true;
  },
  refreshSourcePhotos: async (folderId) => {
    const handle = getDirHandle(folderId);
    if (!handle) return 0;
    try {
      if ((await queryDirPermission(handle)) !== "granted") return 0;
      let photoCount = 0;
      await ingestDirectoryHandle(handle, folderId, {
        imagesOnly: true,
        onImage: (file, relativePath) => {
          photoCount += 1;
          useSourceAssets.getState().capturePhoto(file, `${handle.name}/${relativePath}`);
        },
      });
      set((s) => ({
        folders: s.folders.map((folder) =>
          folder.id === folderId ? { ...folder, photoCount, needsPermission: false } : folder,
        ),
      }));
      return photoCount;
    } catch {
      return 0;
    }
  },
  removeFolder: async (folderId) => {
    if (folderId === "demo") {
      get().setHideDemo(true);
      return;
    }
    const ids = get()
      .videos.filter((v) => v.folderId === folderId)
      .map((v) => v.id);
    forgetFolder(folderId, ids);
    set((s) => {
      const favorites = { ...s.favorites };
      const likes = { ...s.likes };
      const tags = { ...s.tags };
      const metadataProvenance = { ...s.metadataProvenance };
      const categories = { ...s.categories };
      const progress = { ...s.progress };
      for (const id of ids) {
        delete favorites[id];
        delete likes[id];
        delete tags[id];
        delete metadataProvenance[id];
        delete categories[id];
        delete progress[id];
      }
      return {
        folders: s.folders.filter((f) => f.id !== folderId),
        videos: s.videos.filter((v) => v.folderId !== folderId),
        favorites,
        likes,
        tags,
        metadataProvenance,
        categories,
        progress,
        history: s.history.filter((h) => !ids.includes(h.id)),
        sourceId: s.sourceId === folderId ? "home" : s.sourceId,
        activeId: s.activeId && ids.includes(s.activeId) ? null : s.activeId,
        previewId: s.previewId && ids.includes(s.previewId) ? null : s.previewId,
      };
    });
    persistNow(get);
    try {
      await removeEnrichmentRows(ids).catch(() => undefined);
      await deleteDirHandle(folderId);
    } catch {
      // ignore
    }
  },
  followRemoteQuery: async (query, kind = "auto", opts) => {
    if (get().remoteBusy || get().refreshing) throw new Error("A catalog pull is already running.");
    const provider = kind === 'twitch' || kind === 'auto' && (query.toLowerCase().includes('twitch.tv') || query.toLowerCase().startsWith('tw:')) ? 'twitch' : 'youtube';
    if (provider === 'youtube' && (get().youtubeRefreshStatus?.retryAt ?? 0) > Date.now()) throw new Error(youtubeCooldownMessage(get().youtubeRefreshStatus!.retryAt!));
    const clipsOnly = provider === "twitch" && Boolean(opts?.twitchClipMode);
    const action = clipsOnly ? opts?.twitchClipMode === "recent" ? "Twitch recent clips" : "Twitch older clips" : "Creator video pull";
    const startedAt = Date.now();
    const pullId = makePullId();
    get().beginPull({ id: pullId, provider, action, startedAt, targets: [query], done: 0, total: 1, received: 0, added: 0, failed: 0 });
    set({ remoteBusy: true });
    let requested = false;
    try {
      const counts = await remoteEntryCounts(get().videos);
      if (!remainingEntrySlots(counts, getPullSettings(), provider) && !canRotateForGroup(counts, getPullSettings(), provider)) throw new Error(ENTRY_LIMIT_MESSAGE);
      const correction = opts?.correctFollowId ? get().follows.find(channel => channel.kind === 'youtube' && channel.id === opts.correctFollowId) : undefined;
      const knownYoutube = !correction && get().follows.find((channel) => channel.kind === "youtube"
        && (channel.id === query || channel.channelId === query || canonicalFollowHandle("youtube", channel.handle) === canonicalFollowHandle("youtube", query)));
      const knownTwitch = provider === "twitch" ? get().follows.find((channel) => channel.kind === "twitch"
        && (channel.id === query || canonicalFollowHandle("twitch", channel.handle) === canonicalFollowHandle("twitch", query))) : undefined;
      if (clipsOnly && opts?.freshTwitchClips && knownTwitch) {
        const retryAt = (opts.twitchClipMode === "recent" ? knownTwitch.twitchClipRecentRetry : knownTwitch.twitchClipRetry)?.retryAt ?? 0;
        if (retryAt > Date.now()) throw new Error("Clip retry available after " + new Date(retryAt).toLocaleString());
      }
      requested = true;
      const fetched = await followRemote({ data: { query, kind, ...(opts?.freshTwitchClips ? {freshTwitchClips:true} : {}), ...(opts?.twitchClipMode ? { twitchClipMode: opts.twitchClipMode } : {}), ...(opts?.clipLimit !== undefined ? { clipLimit: opts.clipLimit } : {}), ...(opts?.twitchVodLimit ? { twitchVodLimit: opts.twitchVodLimit } : {}), ...(knownYoutube && !opts?.restartPlaylist ? { catalogCursor: knownYoutube.catalogCursor, playlistWalk: knownYoutube.playlistWalk } : {}), ...(knownTwitch?.twitchArchiveCursor ? { twitchArchiveCursor: knownTwitch.twitchArchiveCursor } : {}), ...(knownTwitch?.twitchClipCursor ? { twitchClipCursor: knownTwitch.twitchClipCursor } : {}) } });
      const result = correction ? bindYoutubeCorrection(fetched, correction, query) : fetched;
      const received = result.videos.length;
      if (clipsOnly && !received) {
        set(s => {
          const previous = s.follows.find(c=>c.id===result.channel.id);
          if (knownTwitch && !previous) return {remoteBusy:false};
          const accepted = mergeTwitchClipObservation(previous,result.channel,opts!.twitchClipMode!,startedAt);
          return {remoteBusy:false,follows:dedupeFollows([accepted,...s.follows.filter(c=>c.id!==accepted.id)])};
        });
        saveFollows(get().follows);
        const failure=result.channel.lastClipFailure?.message;
        get().finishPull({id:pullId,provider,action,startedAt,finishedAt:Date.now(),targets:[result.channel.title||query],done:1,total:1,received:0,added:0,failed:failure?1:0,status:failure?'partial':'success',...(failure?{errors:[failure]}:{})});
        return;
      }
      result.videos = await rotateRemotePull(get, result.videos, cleanupBudgets(getPullSettings()));
      let prepared = await prepareRemotePull(get, result.videos, undefined, true);
      while (get().videos !== prepared.base.videos || get().tags !== prepared.base.tags || get().metadataProvenance !== prepared.base.metadataProvenance || getPullSettings() !== prepared.admission.settings) prepared = await prepareRemotePull(get, result.videos, undefined, true);
      result.videos = prepared.admission.videos;
      result.channel = holdEntryLimitCursors(get().follows, [result.channel], prepared.admission.skippedSources)[0];
      set((s) => {
        // Omitted clip positions mean clips were not requested. Preserve them;
        // explicit undefined archive positions still clear a completed shelf.
        const previous = s.follows.find(f => f.id === result.channel.id);
        const acceptedChannel = clipsOnly ? mergeTwitchClipObservation(previous,result.channel,opts!.twitchClipMode!,startedAt) : { ...previous, ...(previous ? retainNewerTwitchClipFollow(previous,result.channel) : result.channel),
          ...(result.channel.kind === 'twitch' ? twitchRetryPatch(previous ?? {}, 'archive', result.channel.lastProviderFailure) : {}),
          twitchArchiveLastVideoId: result.channel.twitchArchiveLastVideoId ?? previous?.twitchArchiveLastVideoId };
        const follows = dedupeFollows([acceptedChannel, ...s.follows.filter((f) => f.id !== result.channel.id)]);
        const folder: Folder = {
          id: result.channel.id,
          name: result.channel.title,
          kind: result.channel.kind,
          videoCount: prepared.folderCounts.get(result.channel.id) ?? 0,
        };
        const enriched = prepared.enriched;
        const merged = prepared.merged;
        rememberEntryCounts(merged, prepared.admission.counts);
        return {
          follows,
          folders: [...s.folders.filter((f) => f.id !== folder.id), folder],
          videos: merged,
          tags: enriched.tags,
          metadataProvenance: enriched.metadataProvenance,
        };
      });
      await reconcilePlaylistCommit(get,set,[result.channel]);
      set({remoteBusy:false});
      persistNow(get);
      if (!clipsOnly || prepared.merged !== prepared.base.videos) void cacheRemotes(get, result.videos);
      const added = prepared.admission.added;
      const partialError = (clipsOnly ? result.channel.lastClipFailure : result.channel.lastProviderFailure)?.message;
      get().finishPull({ id: pullId, provider, action, startedAt, finishedAt: Date.now(), targets: [result.channel.title || query], done: 1, total: 1, received, added, failed: 0, status: prepared.admission.skipped || partialError || !result.videos.length ? "partial" : "success", ...(prepared.admission.skipped || partialError ? { errors: [prepared.admission.skipped ? ENTRY_LIMIT_MESSAGE : partialError!] } : {}) });
      // A focused pull may add hundreds of old VODs. It updates its visible
      // creator card, not the notification center; bulk import emits one
      // completion summary after every requested channel has finished.
    } catch (err) {
      set({ remoteBusy: false });
      const cancelled = err instanceof Error && /^Pull cancelled\b/i.test(err.message);
      if (provider === 'twitch' && requested && !cancelled) {
        const message = (err instanceof Error ? err.message : String(err)).slice(0, 240);
        set(s => ({ follows: s.follows.map(channel => channel.kind === 'twitch' && canonicalFollowHandle('twitch', channel.handle) === canonicalFollowHandle('twitch', query)
          ? clipsOnly ? mergeTwitchClipObservation(channel,{...channel,lastClipFailure:classifyTwitchFailure(err)},opts!.twitchClipMode!,startedAt) : { ...channel, ...twitchRetryPatch(channel, 'archive', classifyTwitchFailure(err)), twitchArchiveDiagnostics: { at: Date.now(), pages: 0, received: 0, accepted: 0, duplicates: 0,
            resumed: Boolean(channel.twitchArchiveCursor), stage: decodeTwitchArchiveCursor(channel.twitchArchiveCursor).stage,
            stopReason: /integrity|challenge/i.test(message) ? 'challenge' as const : 'provider-error' as const, error: message } } : channel) }));
        saveFollows(get().follows);
      }
      get().finishPull({ id: pullId, provider, action, startedAt, finishedAt: Date.now(), targets: [query], done: cancelled ? 0 : 1, total: 1, received: 0, added: 0, failed: cancelled ? 0 : 1, status: cancelled ? "partial" : "failed", errors: [err instanceof Error ? err.message : String(err)] });
      throw err;
    }
  },
  importBatch: async (items) => {
    if (get().remoteBusy || get().refreshing) throw new Error("A catalog pull is already running.");
    if (items.some(item => item.kind === 'youtube') && (get().youtubeRefreshStatus?.retryAt ?? 0) > Date.now()) throw new Error(youtubeCooldownMessage(get().youtubeRefreshStatus!.retryAt!));
    const savedHandles = new Set(['youtube','twitch'].flatMap(kind => [...resolvedFollowQueries(get().follows, kind as 'youtube' | 'twitch')].map(key => `${kind}:${key}`)));
    const seenQueries = new Set<string>();
    const unique = items
      .map((i) => ({ query: i.query.trim().replaceAll("\\_", "_"), kind: i.kind }))
      .filter((i) => {
        const handle = canonicalFollowHandle(i.kind, i.query);
        const key = `${i.kind}:${handle}`;
        if (!i.query || !handle || seenQueries.has(key) || savedHandles.has(key)) return false;
        seenQueries.add(key);
        return true;
      });
    if (!unique.length) return { ok: 0, failed: 0, failedQueries: [], failedReasons: {} };
    // Every submitted name is durable before the first request, including
    // ambiguous/unavailable names and entries beyond a cancelled batch.
    const queuedFollows = dedupeFollows([...get().follows, ...unique.map(item => importedFollowStub(item.query, item.kind))]);
    set({ follows: queuedFollows });
    saveFollows(queuedFollows);
    const startedAt = Date.now();
    const pullId = makePullId();
    const cancellation = getPullCancellationRevision();
    get().beginPull({ id: pullId, provider: unique.every((item) => item.kind === unique[0].kind) ? unique[0].kind : "multi", action: "Creator import", startedAt, targets: unique.map((item) => item.query), done: 0, total: unique.length, received: 0, added: 0, failed: 0 });
    const existing = new Set(get().follows.map((f) => f.id));
    set({
      remoteBusy: true,
      importProgress: { done: 0, total: unique.length, label: "Importing" },
    });
    let ok = 0;
    let failed = 0;
    const failedQueries: string[] = [];
    const failedReasons: Record<string, string> = {};
    let pulledVideos = 0;
    let addedVideos = 0;
    let importRetryAt: number | undefined;
    const cleanupRemaining = cleanupBudgets(getPullSettings());
    // Each request resolves a small concurrent pool on the server. Keeping batches
    // below the provider cap but larger than the old ten-item batches makes long
    // Twitch imports visibly faster without overwhelming public endpoints.
    // Provider requests inside each import now honor the configured gap too.
    // Size a job for its network budget instead of letting 20 display-name
    // lookups overrun the connection timeout at slow pacing settings.
    const chunk = unique.some(item => item.kind === 'youtube') ? 1 : 20;
    try {
      for (let i = 0; i < unique.length; i += chunk) {
        if (getPullCancellationRevision() !== cancellation) break;
        const counts = await remoteEntryCounts(get().videos);
        const slice = unique.slice(i, i + chunk).filter(item => {
          if (remainingEntrySlots(counts, getPullSettings(), item.kind) || canRotateForGroup(counts, getPullSettings(), item.kind, cleanupRemaining)) return true;
          failed++; failedQueries.push(item.query); failedReasons[item.query] = ENTRY_LIMIT_MESSAGE; return false;
        });
        if (!slice.length) continue;
        let result: Awaited<ReturnType<typeof importChannels>>;
        try {
          result = await importChannels({ data: { items: slice } });
        } catch (error) {
          if (getPullCancellationRevision() !== cancellation) break;
          failed += slice.length;
          failedQueries.push(...slice.map((item) => item.query));
          const reason = error instanceof Error && error.message ? error.message : "Provider request failed before public metadata could be read";
          for (const item of slice) failedReasons[item.query] = reason;
          set({ importProgress: { done: Math.min(i + slice.length, unique.length), total: unique.length, label: "Retrying next batch" } });
          continue;
        }
        if (getPullCancellationRevision() !== cancellation) break;
        ok += result.ok.length;
        failed += result.failed;
        if (result.failedQueries?.length) {
          failedQueries.push(...result.failedQueries);
          for (const query of result.failedQueries) failedReasons[query] = result.failedReasons?.[query] ?? 'Could not verify the creator.';
          const failures = new Map(slice.filter(item => result.failedFailures?.[item.query]).map(item => [`${item.kind}:${canonicalFollowHandle(item.kind, item.query)}`, result.failedFailures![item.query]]));
          set(s => ({ follows: s.follows.map(channel => {
            const failure = failures.get(`${channel.kind}:${canonicalFollowHandle(channel.kind, channel.handle)}`);
            return failure ? { ...channel, lastProviderFailure: failure, lastCheckedAt: Date.now() } : channel;
          }) }));
        }
        // A failed name lookup has no catalog to merge. Avoid scanning the
        // entire 100k+ library and rewriting its tag maps for every miss.
        if (!result.ok.length) {
          set({ importProgress: { done: Math.min(i + slice.length, unique.length), total: unique.length, label: 'Verifying creators' } });
          get().updatePull({ done: Math.min(i + slice.length, unique.length), received: pulledVideos, added: addedVideos, failed });
          persistSoon(get);
          if (result.providerRetryAt) {
            importRetryAt = result.providerRetryAt;
            const cooldown = { retryAt: importRetryAt, error: Object.values(result.failedReasons ?? {})[0] ?? youtubeCooldownMessage(importRetryAt), cooldownScope: result.providerCooldownScope === 'all' ? 'all' as const : 'catalog' as const };
            saveYoutubeCooldown(cooldown);
            set(s => ({ youtubeRefreshStatus: { ...(s.youtubeRefreshStatus ?? { at: Date.now(), checked: 0, refreshed: 0, failed: 0, youtube: 0, twitch: 0 }), ...cooldown } }));
            break;
          }
          continue;
        }
        let incoming = result.ok.flatMap(row => row.videos);
        incoming = await rotateRemotePull(get, incoming, cleanupRemaining);
        let prepared = await prepareRemotePull(get, incoming, undefined, true);
        while (get().videos !== prepared.base.videos || get().tags !== prepared.base.tags || get().metadataProvenance !== prepared.base.metadataProvenance || getPullSettings() !== prepared.admission.settings) prepared = await prepareRemotePull(get, incoming, undefined, true);
        if (getPullCancellationRevision() !== cancellation) break;
        pulledVideos += result.ok.reduce((sum, row) => sum + row.videos.length, 0);
        addedVideos += prepared.admission.added;
        const held = holdEntryLimitCursors(get().follows, result.ok.map(row => ({ ...row.channel,
          importQuery: row.channel.importQuery ?? (slice.length === 1 ? slice[0].query : undefined),
        })), prepared.admission.skippedSources);
        result.ok = result.ok.map((row, index) => ({ ...row, channel: held[index] }));
        get().updatePull({ done: Math.min(i + slice.length, unique.length), received: pulledVideos, added: addedVideos, failed });
        set((s) => {
          let follows = s.follows;
          let folders = s.folders;
          const videos = prepared.merged;
          rememberEntryCounts(videos, prepared.admission.counts);
          for (const row of result.ok) {
            follows = mergeResolvedFollow(follows, row.channel);
            const folder: Folder = {
              id: row.channel.id,
              name: row.channel.title,
              kind: row.channel.kind,
              videoCount: prepared.folderCounts.get(row.channel.id) ?? 0,
            };
            folders = [...folders.filter((f) => f.id !== folder.id), folder];
          }
          const enriched = prepared.enriched;
          return {
            follows: dedupeFollows(follows),
            folders,
            videos,
            tags: enriched.tags,
            metadataProvenance: enriched.metadataProvenance,
            importProgress: {
              done: Math.min(i + slice.length, unique.length),
              total: unique.length,
              label: "Importing",
            },
          };
        });
        // A completed batch is useful even if the next provider call is slow or
        // unavailable. Queue its metadata for local persistence immediately.
        await reconcilePlaylistCommit(get,set,result.ok.map(row=>row.channel));
        persistSoon(get);
        void cacheRemotes(get, prepared.admission.videos);
        if (result.providerRetryAt) {
          importRetryAt = result.providerRetryAt;
          const cooldown = { retryAt: importRetryAt, error: Object.values(result.failedReasons ?? {})[0] ?? youtubeCooldownMessage(importRetryAt), cooldownScope: result.providerCooldownScope === 'all' ? 'all' as const : 'catalog' as const };
          saveYoutubeCooldown(cooldown);
          set(s => ({ youtubeRefreshStatus: { ...(s.youtubeRefreshStatus ?? { at: Date.now(), checked: 0, refreshed: 0, failed: 0, youtube: 0, twitch: 0 }), ...cooldown } }));
          break;
        }
      }
      persistNow(get);
      const added = get().follows.filter((f) => !existing.has(f.id)).length;
      if (getPullCancellationRevision() === cancellation) get().pushNotice({
        title: `Imported ${added || ok} channel${(added || ok) === 1 ? "" : "s"}`,
        body: importRetryAt ? `${ok + failed} of ${unique.length} checked. ${youtubeCooldownMessage(importRetryAt)}` : failed ? `${failed} need attention. Open the importer for the saved reason list.` : "Latest uploads are on the shelves.",
        kind: unique[0]?.kind === "twitch" ? "twitch" : "youtube",
      });
      set({
        remoteBusy: false,
        importProgress: null,
      });
      get().finishPull({ id: pullId, provider: unique.every((item) => item.kind === unique[0].kind) ? unique[0].kind : "multi", action: "Creator import", startedAt, finishedAt: Date.now(), targets: unique.map((item) => item.query), done: Math.min(unique.length, ok + failed), total: unique.length, received: pulledVideos, added: addedVideos, failed, status: importRetryAt || getPullCancellationRevision() !== cancellation ? "partial" : failed ? ok ? "partial" : "failed" : "success", ...(failedQueries.length ? { errors: failedQueries.slice(0, 12).map((query) => `${query}: ${failedReasons[query] ?? "Unavailable"}`) } : {}) });
      persistNow(get);
      return { ok, failed, failedQueries, failedReasons };
    } catch (err) {
      set({ remoteBusy: false, importProgress: null });
      get().finishPull({ id: pullId, provider: unique.every((item) => item.kind === unique[0].kind) ? unique[0].kind : "multi", action: "Creator import", startedAt, finishedAt: Date.now(), targets: unique.map((item) => item.query), done: Math.min(failed + ok, unique.length), total: unique.length, received: pulledVideos, added: addedVideos, failed: Math.max(failed, unique.length - ok), status: ok ? "partial" : "failed", errors: [err instanceof Error ? err.message : String(err)] });
      throw err;
    }
  },
  unfollow: (id) => get().unfollowMany([id]),
  acknowledgeYoutubeIdentity: (id, fingerprint) => {
    const review = youtubeIdentityReviews(get().follows).get(id);
    if (!review || review.reviewed || review.fingerprint !== fingerprint) return;
    set(s => ({ follows: s.follows.map(row => row.id === id ? { ...row, identityReview: { fingerprint, at: Date.now() } } : row) }));
    saveFollows(get().follows);
    persistSoon(get);
  },
  setTwitchPullPolicy: (id, raw) => {
    const policy=normalizeTwitchPullPolicy(raw),current=get().follows.find(c=>c.id===id&&c.kind==='twitch');
    if(!policy||!current)return;
    const old=twitchPullPolicy(current);if(old.clips===policy.clips&&old.vods===policy.vods&&old.priority===policy.priority)return;
    set(s=>({follows:s.follows.map(c=>c.id===id?{...c,twitchPullPolicy:policy}:c)}));
    saveFollows(get().follows);persistSoon(get);
  },
  updateFollowProfiles: (profiles) => {
    const byId = new Map(profiles.filter((profile) => profile.thumb || profile.description).map((profile) => [profile.id, profile]));
    if (!byId.size) return;
    set((s) => ({ follows: s.follows.map((follow) => {
      const profile = byId.get(follow.id);
      return profile ? { ...follow, thumb: profile.thumb || follow.thumb, description: profile.description || follow.description } : follow;
    }) }));
    saveFollows(get().follows);
    persistSoon(get);
  },
  unfollowMany: (ids) => {
    const plan = planFollowRemoval(get(), ids, exportFeedback());
    if (!plan.followIds.size) return;
    set((s) => ({
      follows: s.follows.filter((f) => !plan.followIds.has(f.id)),
      folders: s.folders.filter((f) => !plan.followIds.has(f.id)),
      videos: retainVideosAfterUnfollow(s.videos, plan),
      sourceId: plan.followIds.has(s.sourceId) ? "home" : s.sourceId,
    }));
    persistNow(get);
    cacheRemotes(get);
  },
  retainLiveRoom: async (video) => {
    if (!get().adultsUnlocked || !['chaturbate', 'myfreecams'].includes(video.remote?.kind ?? '') || !video.remote?.live) return false;
    const index = await remoteVideoIndexAsync(get().videos);
    if (index.has(video.id)) return true;
    const prepared = await prepareRemotePull(get, [video], undefined, true);
    if (!prepared.admission.videos.length) return false;
    const folder = ADULT_FOLDER_BY_PROVIDER[video.remote.kind as 'chaturbate' | 'myfreecams'];
    set({ videos: prepared.merged, tags: prepared.enriched.tags, metadataProvenance: prepared.enriched.metadataProvenance,
      folders: [...prepared.base.folders.filter(row => row.id !== folder.id), { ...folder, videoCount: prepared.folderCounts.get(folder.id) ?? 1 }] });
    await appendCatalogVideos(prepared.admission.videos.map(catalogCard),prepared.enriched);
    persistNow(get); return true;
  },
  refreshFollows: async (kind, options) => {
    const liveOnly = Boolean(options?.youtubeLiveOnly || options?.twitchLiveOnly);
    const feedRepair = kind === 'youtube' && options?.youtubeFeedRepair === true;
    const recentQueue = !liveOnly && !options?.catalog && !options?.twitchContinueArchive && !feedRepair;
    if (!liveOnly && options?.scheduled && !automaticPullAvailable(kind)) return { wentLive: [], newVideos: [], skipped: 'busy' };
    if (liveOnly && options?.scheduled && !options.liveDemand && pullsPaused()) return { wentLive: [], newVideos: [], skipped: 'paused' };
    const liveRetryAt = kind === 'twitch' && options?.twitchLiveOnly ? get().twitchLiveProgress?.retryAt : options?.youtubeLiveOnly ? Math.max(get().youtubeLiveProgress?.retryAt ?? 0, youtubeLiveCooldown(get().follows)?.retryAt ?? 0) || undefined : undefined;
    if (liveOnly && kind && liveRetryAt && liveRetryAt > Date.now()) return { wentLive: [], newVideos: [], skipped: 'cooldown', retryAt: liveRetryAt };
    const forceYoutube = kind === 'youtube' && options?.catalog === true && options.force === true && !options.scheduled && !options.youtubeLiveOnly && !options.twitchRoutine;
    let forceNextRequest = forceYoutube;
    let recoveredCooldown = false;
    const holdYoutube = () => !forceYoutube && (get().youtubeRefreshStatus?.retryAt ?? 0) > Date.now()
      && (get().youtubeRefreshStatus?.cooldownScope === 'all' || !get().youtubeRefreshStatus?.cooldownScope || (options?.catalog === true || feedRepair));
    if (kind === 'youtube' && holdYoutube()) return { wentLive: [], newVideos: [], skipped: 'cooldown', retryAt: get().youtubeRefreshStatus!.retryAt };
    // Live owners gate new automatic turns. Finish an accepted metadata read
    // instead of holding provider ownership behind a later archive pause.
    if (!liveOnly) await waitForPulls();
    if (kind === 'youtube' && holdYoutube()) return { wentLive: [], newVideos: [], skipped: 'cooldown', retryAt: get().youtubeRefreshStatus!.retryAt };
    const twitchLiveOnly = Boolean(options?.twitchLiveOnly);
    const backgroundTwitchRefresh = Boolean(options?.twitchRoutine && kind === "twitch");
    const overlappingLive = Boolean(liveOnly && (get().refreshing || get().remoteBusy));
    if ((get().refreshing && !overlappingLive) || (!liveOnly && get().remoteBusy) || (options?.youtubeLiveOnly && youtubeLiveCheckBusy) || (twitchLiveOnly && twitchLiveCheckBusy)) return { wentLive: [], newVideos: [], skipped: 'busy' };
    const applyTwitchPolicy=options?.scheduled===true&&!liveOnly&&!options.channelIds?.length;
    const allFollows = dedupeFollows(get().follows).filter(follow => (!kind || follow.kind === kind) && !(follow.kind === 'youtube' && (holdYoutube() || Boolean(liveRetryAt && liveRetryAt > Date.now())))
      && !(applyTwitchPolicy && !twitchPolicyAllows(follow, options?.twitchContinueArchive?'archive':'recent'))
      && !(options?.twitchContinueArchive && follow.kind === 'twitch' && follow.twitchArchiveExhaustedAt)
      && !(recentQueue && !recentPullReady(follow))
      && !(follow.kind === 'twitch' && !recentQueue && (follow[twitchLiveOnly ? 'twitchLiveRetry' : 'twitchArchiveRetry']?.retryAt ?? 0) > Date.now()));
    if (!allFollows.length) return { wentLive: [], newVideos: [], skipped: 'empty' };
    const rotate = (items: FollowedChannel[], limit: number, cursor: "twitch" | "youtube" | "all") => {
      if (!items.length) return [];
      if (cursor === "twitch") {
        if(applyTwitchPolicy){const selected=selectTwitchPolicyBatch(items,limit,twitchPolicyCursor,options?.twitchContinueArchive?'archive':'recent');twitchPolicyCursor=selected.nextCursor;return selected.channels;}
        const batch = selectTwitchRefreshBatch(items, limit, twitchRefreshCursor, twitchLiveOnly ? 'live' : recentQueue ? 'recent' : 'archive');
        twitchRefreshCursor = batch.nextCursor;
        return batch.channels;
      }
      const savedCursor = cursor === "youtube" ? youtubeRefreshCursor : remoteRefreshCursor;
      const count = Math.min(limit, items.length);
      const start = savedCursor % items.length;
      const next = Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
      const updated = (start + count) % items.length;
      if (cursor === "youtube") youtubeRefreshCursor = updated;
      else remoteRefreshCursor = updated;
      return next;
    };
    const twitch = allFollows.filter((follow) => follow.kind === "twitch");
    const youtube = allFollows.filter((follow) => follow.kind === "youtube");
    // Twitch archive depth used to depend on wherever a mixed channel cursor
    // happened to land. Reserve part of every refresh for it so a large
    // YouTube list cannot starve VOD refreshes indefinitely.
    const youtubeCoverage = kind === "youtube" && !options?.youtubeLiveOnly
      ? youtubeCoverageCounts(await youtubeCoverageIndexAsync(get().videos), youtube) : undefined;
    // Counting may yield on a large catalog. Recheck job ownership before
    // starting a second sweep if another action won while the task yielded.
    if ((get().refreshing && !overlappingLive) || (!liveOnly && get().remoteBusy)) return { wentLive: [], newVideos: [], skipped: 'busy' };
    const requestedIds = options?.channelIds?.length ? new Set(options.channelIds) : null;
    const current = liveOnly && !requestedIds
      ? kind === 'youtube' && options?.youtubeLiveOnly
        ? selectYoutubeQuickLiveChannels(allFollows, options.liveSweep ? options.scheduled ? YOUTUBE_QUICK_LIVE.activeSweep : allFollows.length : options.scheduled ? YOUTUBE_QUICK_LIVE.quietSweep : LIBRARY_LIMITS.youtubeLiveRefreshChannels, options.scheduled)
        : kind === 'twitch' && options?.twitchLiveOnly ? selectTwitchQuickLiveChannels(allFollows, options.liveSweep ? options.scheduled ? TWITCH_QUICK_LIVE.activeSweep : allFollows.length : TWITCH_QUICK_LIVE.quietSweep, options.scheduled)
        : selectLiveRefreshChannels(allFollows, kind, options?.liveSweep ? options.scheduled ? Math.min(240,allFollows.length) : allFollows.length : kind === 'twitch' ? 24 : LIBRARY_LIMITS.youtubeLiveRefreshChannels)
      : requestedIds
      ? kind === "youtube" && options?.catalog
        ? selectYoutubeSweepChannels(allFollows.filter((follow) => requestedIds.has(follow.id)), Date.now(), getPullSettings().youtubeSourcesPerSweep, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, { includeExhausted: true, includePlaylists: true, videoCounts: youtubeCoverage })
        : allFollows.filter((follow) => requestedIds.has(follow.id))
      : kind === "youtube" && options?.youtubeLiveOnly
      ? selectYoutubeLiveChannels(youtube, LIBRARY_LIMITS.youtubeLiveRefreshChannels, true)
      : kind === "youtube" && options?.catalog && options.scheduled
      ? selectYoutubeSweepChannels(youtube, Date.now(), scheduledYoutubeSources(getPullSettings().youtubeSourcesPerSweep, getPullSettings().requestGapMs), LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, { includePlaylists: true, videoCounts: youtubeCoverage })
      // Least-recently checked creators go first. This remains fair across
      // reloads and does not let a large archive list favor a fixed prefix.
      : kind === "youtube" && options?.catalog
      ? selectYoutubeSweepChannels(youtube, Date.now(), getPullSettings().youtubeSourcesPerSweep, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, { includeExhausted: true, includePlaylists: true, videoCounts: youtubeCoverage })
      : kind === "youtube"
      ? selectYoutubeFeedChannels(youtube, youtubeCoverage!, Date.now(), LIBRARY_LIMITS.youtubeRecentRefreshChannels)
      : kind === "twitch"
      ? rotate(twitch, options?.scheduled ? LIBRARY_LIMITS.twitchChannelsReservedPerRefresh : LIBRARY_LIMITS.twitchArchiveChannelsPerSweep, "twitch")
      : twitch.length && youtube.length
      ? [...rotate(twitch, Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "twitch"), ...rotate(youtube, REMOTE_REFRESH_BATCH_SIZE - Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "youtube")]
      : rotate(allFollows, REMOTE_REFRESH_BATCH_SIZE, kind === "twitch" ? "twitch" : "all");
    if (!current.length) return { wentLive: [], newVideos: [], skipped: 'empty' };
    if (options?.youtubeLiveOnly) youtubeLiveCheckBusy = true;
    if (twitchLiveOnly) twitchLiveCheckBusy = true;
    if (!overlappingLive) set({ refreshing: true });
    const startedAt = Date.now();
    const pullId = makePullId();
    const provider = kind ?? (current.some((channel) => channel.kind === "youtube") && current.some((channel) => channel.kind === "twitch") ? "multi" : current[0].kind);
    const action = feedRepair ? "YouTube feed gap repair" : liveOnly && !kind ? "Twitch & YouTube live check" : options?.youtubeLiveOnly ? "YouTube live check" : twitchLiveOnly ? "Twitch live check" : backgroundTwitchRefresh ? options?.scheduled ? "Scheduled Twitch content pull" : "Twitch content pull" : options?.scheduled ? "Scheduled YouTube archive sweep" : options?.catalog ? "YouTube archive pull" : "Channel refresh";
    if (!overlappingLive) get().beginPull({ id: pullId, provider, action, startedAt, targets: current.map((channel) => channel.title || channel.handle), done: 0, total: current.length, received: 0, added: 0, failed: 0 });
    const noticesBeforeRefresh=get().notices;
    const beforeLiveChannels = new Set(get().follows.filter((channel) => channel.live).map((channel) => channel.id));
    const catalogQueue = kind === "youtube" && options?.catalog === true;
    let received = 0;
    let added = 0;
    let refreshed = 0;
    let checked = 0;
    let youtubeReceived = 0, twitchReceived = 0;
    let liveRetry: number | undefined, liveError: string | undefined;
    let youtubeChecked = 0, twitchChecked = 0, youtubeRefreshed = 0, twitchRefreshed = 0;
    let twitchRetry: number | undefined, twitchError: string | undefined;
    let lastFollowCheckpoint = 0;
    const cleanupRemaining = cleanupBudgets(getPullSettings());
    const errors: string[] = [];
    const wentLive: FollowedChannel[] = [];
    const newVideos: LibraryVideo[] = [];
    // A full-source sweep can span hundreds of small provider responses. Keep
    // identity and folder counts across the queue instead of rebuilding them
    // from the entire 50k+ library after every creator.
    let catalogIndexedVideos: LibraryVideo[] | null = null;
    const catalogPositions = catalogQueue ? new Map<string, number>() : null;
    const catalogFolderCounts = catalogQueue ? new Map<string, number>() : null;
    let liveSourceSnapshot: LibraryVideo[] | null = null;
    const liveSources = new Set<string>();
    const livePositions = new Map<string, number>();
    const liveSourceVideos = new Map<string, Set<string>>();
    const syncLiveSources = async () => {
      while (get().videos !== liveSourceSnapshot) {
        const snapshot = get().videos; liveSources.clear(); livePositions.clear(); liveSourceVideos.clear();
        await forEachCatalogSlice(snapshot, (video, index) => {
          if ((video.remote?.kind === 'youtube' || video.remote?.kind === 'twitch') && video.remote.live) {
            liveSources.add(video.folderId);
            for (const id of video.remote.sourceIds ?? []) liveSources.add(id);
            livePositions.set(video.id, index);
            for (const source of [video.folderId, ...video.remote.sourceIds ?? [], ...(video.remote.kind === 'youtube' && video.remote.channelId ? ['yt:'+video.remote.channelId] : [])]) {
              liveSources.add(source);
              const ids = liveSourceVideos.get(source) ?? new Set<string>(); ids.add(video.id); liveSourceVideos.set(source, ids);
            }
          }
        }, yieldCatalogTask);
        liveSourceSnapshot = snapshot;
      }
    };
    const mergeFollowResults = (existing: FollowedChannel[], incoming: FollowedChannel[]) => {
      const latest = new Map(existing.map(channel => [channel.id, channel]));
      if (incoming.every(channel => latest.get(channel.id) === channel)) return existing;
      return dedupeFollows([...incoming.map(channel => {
        const newer = latest.get(channel.id);
        if (newer) channel = retainNewerTwitchClipFollow(newer,channel);
        if (newer && (liveOnly || (newer.recentPull?.attemptedAt ?? 0) > (channel.recentPull?.attemptedAt ?? 0))) channel = { ...channel, recentPull: newer.recentPull };
        if (newer && liveOnly) channel = { ...channel, playlistWalk:newer.playlistWalk, catalogCursor: newer.catalogCursor, catalogCheckedAt: newer.catalogCheckedAt, catalogExhaustedAt: newer.catalogExhaustedAt, twitchArchiveCursor: newer.twitchArchiveCursor, twitchArchiveCheckedAt: newer.twitchArchiveCheckedAt, twitchArchiveExhaustedAt: newer.twitchArchiveExhaustedAt, twitchArchiveDiagnostics: newer.twitchArchiveDiagnostics, twitchArchiveRetry: newer.twitchArchiveRetry, lastProviderFailure: newer.lastProviderFailure };
        return newer && Math.max(newer.liveCheckedAt ?? 0, newer.lastLiveFailure?.at ?? 0, newer.youtubeLiveEvidence?.at ?? 0) > Math.max(channel.liveCheckedAt ?? 0, channel.lastLiveFailure?.at ?? 0, channel.youtubeLiveEvidence?.at ?? 0)
          ? { ...channel, live: newer.live, liveCheckedAt: newer.liveCheckedAt, lastLiveFailure: newer.lastLiveFailure, lastLiveWarning:newer.lastLiveWarning, youtubeLiveEvidence:newer.youtubeLiveEvidence, youtubeLiveVideoIds:newer.youtubeLiveVideoIds, youtubeLiveKnownOverflow:newer.youtubeLiveKnownOverflow, youtubeEvents:newer.youtubeEvents, liveOfflineSince: newer.liveOfflineSince, twitchLiveRetry: newer.twitchLiveRetry } : channel;
      }), ...existing]);
    };
    const youtubeThroughput = options?.youtubeLiveOnly ? createYoutubeLiveThroughput(get().follows.filter(c=>c.kind==='youtube').map(c=>c.id),startedAt) : null;
    let liveAllocation: YoutubeLiveProgress['allocation'];
    const reportLiveAllocation = (value: NonNullable<YoutubeLiveProgress['allocation']>) => { liveAllocation = value; };
    let yieldedLiveTurn = false;
    const liveProgress = (status: YoutubeLiveProgress['status'] = 'running') => {
      if (!liveOnly) return;
      const common = { startedAt, at: Date.now(), status, automatic: options?.scheduled === true };
      set({ ...(options?.youtubeLiveOnly ? { youtubeLiveProgress: { ...common, checked: youtubeChecked, total: yieldedLiveTurn ? youtubeChecked : current.filter(row => row.kind === 'youtube').length, refreshed: youtubeRefreshed, failed: youtubeChecked - youtubeRefreshed, broadcasts: youtubeReceived, throughput:youtubeThroughput?.snapshot(), allocation: liveAllocation, retryAt: liveRetry, error: liveError } } : {}),
        ...(twitchLiveOnly ? { twitchLiveProgress: { ...common, checked: twitchChecked, total: yieldedLiveTurn ? twitchChecked : current.filter(row => row.kind === 'twitch').length, refreshed: twitchRefreshed, failed: twitchChecked - twitchRefreshed, broadcasts: twitchReceived, retryAt: twitchRetry, error: twitchError } } : {}) });
    };
    const recordLiveBatch = (batch: FollowedChannel[], ids: string[] = []) => {
      if (!liveOnly) return;
      const refreshedIds = new Set(ids);
      youtubeThroughput?.record(batch.filter(c=>c.kind==='youtube').map(c=>c.id),ids,Date.now());
      for (const channel of batch) if (channel.kind === 'youtube') { youtubeChecked++; if (refreshedIds.has(channel.id)) youtubeRefreshed++; }
      else { twitchChecked++; if (refreshedIds.has(channel.id)) twitchRefreshed++; }
    };
    const checkpointFollows = () => { if (checked - lastFollowCheckpoint >= (recentQueue ? 4 : 96)) { saveFollows(get().follows); lastFollowCheckpoint = checked; } };
    liveProgress();
    const cancellation = getPullCancellationRevision();
    const waitForCatalogTurn = async () => { await yieldCatalogTask(); await waitForCatalogCommit(cancellation); };
    const syncCatalogIndex = async () => {
      if (!catalogPositions || !catalogFolderCounts) return;
      while (get().videos !== catalogIndexedVideos) {
        const snapshot = get().videos;
        catalogPositions.clear(); catalogFolderCounts.clear();
        await forEachCatalogSlice(snapshot, (video, index) => {
          catalogPositions.set(video.id, index);
          const key = youtubeVideoKey(video);
          for(const alias of catalogIdentityKeys(video)) if(!catalogPositions.has(alias)) catalogPositions.set(alias,index);
          catalogFolderCounts.set(video.folderId, (catalogFolderCounts.get(video.folderId) ?? 0) + 1);
        }, waitForCatalogTurn);
        catalogIndexedVideos = snapshot;
      }
    };
    const adaptiveLive = liveOnly && options?.scheduled && !requestedIds && Boolean(kind);
    const attemptedLive = new Set<string>();
    const selectAdaptiveLive = (count: number) => kind === 'youtube'
      ? selectYoutubeQuickLiveChannels(get().follows, count, true, Date.now(), reportLiveAllocation, attemptedLive)
      : selectTwitchQuickLiveChannels(get().follows.filter(channel => !attemptedLive.has(channel.id)), count, true);
    const liveMetadataBase = liveOnly || recentQueue ? { tags: get().tags, provenance: get().metadataProvenance } : null;
    let dispatchedLive = 0;
    const livePipeline = kind && liveOnly ? createCompletionQueue<{channels:FollowedChannel[];attemptAt:number},RefreshResult>({
      concurrency: kind === 'youtube' ? YOUTUBE_QUICK_LIVE.pipelineRequests : 2,
      take: () => {
        if (dispatchedLive >= current.length || getPullCancellationRevision() !== cancellation || liveRetry && liveRetry > Date.now() || twitchRetry && twitchRetry > Date.now()) return;
        if (adaptiveLive && dispatchedLive > 0 && (Date.now() - startedAt >= 20_000 || !options?.liveDemand && pullsPaused())) { yieldedLiveTurn = true; return; }
        const count = Math.min(kind === 'youtube' ? YOUTUBE_QUICK_LIVE.pipelineChannels : 12, current.length - dispatchedLive);
        const channels = adaptiveLive
          ? selectAdaptiveLive(count)
          : current.slice(dispatchedLive, dispatchedLive + count);
        if (!channels.length) { yieldedLiveTurn = Boolean(adaptiveLive); return; }
        for (const channel of channels) attemptedLive.add(channel.id);
        dispatchedLive += channels.length;
        return { channels, attemptAt: Date.now() };
      },
      request: async (item, signal) => {
        const response = await refreshRemotes({ data: { channels: item.channels, youtubeLiveOnly: kind === 'youtube', twitchLiveOnly: kind === 'twitch', youtubeBackground: options?.scheduled === true, liveDemand: options?.liveDemand === true }, signal });
        // A completed cooldown blocks new dispatch even if another response is
        // still being reconciled. Accepted responses are drained, never dropped.
        if (response.providerRetryAt) { liveRetry = Math.max(liveRetry ?? 0, response.providerRetryAt); liveError = response.channels.find(channel => channel.lastLiveFailure)?.lastLiveFailure?.message; }
        if (kind === 'twitch' && response.channels.length && response.channels.every(c=>c.lastLiveFailure?.kind === 'rate-limited')) {twitchRetry=Math.max(...response.channels.map(c=>c.twitchLiveRetry?.retryAt??Date.now()+60_000));twitchError=response.channels[0].lastLiveFailure?.message;}
        return response;
      },
    }) : null;
    const recentBatchSize = current.length <= 4 ? 2 : 4;
    let dispatchedRecent = 0, recentRetryAt = 0;
    const recentPipeline = recentQueue && kind ? createCompletionQueue<{ channels: FollowedChannel[]; attemptAt: number }, RefreshResult>({
      concurrency: 2,
      take: () => {
        if (dispatchedRecent >= current.length || getPullCancellationRevision() !== cancellation || recentRetryAt > Date.now()) return;
        if (options?.scheduled && (!automaticPullAvailable(kind) || Date.now() - startedAt >= 20_000)) { yieldedLiveTurn = true; return; }
        const channels = current.slice(dispatchedRecent, dispatchedRecent + recentBatchSize); dispatchedRecent += channels.length;
        return { channels, attemptAt: Date.now() };
      },
      request: async (item, signal) => {
        const response = await refreshRemotes({ data: { channels: item.channels, youtubeBackground: options?.scheduled === true, twitchRoutine: kind === 'twitch', twitchApplyPolicy: applyTwitchPolicy }, signal });
        if (response.providerRetryAt) recentRetryAt = Math.max(recentRetryAt, response.providerRetryAt);
        return response;
      },
    }) : null;
    try {
      const maxBatch = kind === 'twitch' && !liveOnly ? LIBRARY_LIMITS.twitchArchiveSourcesPerRequest : adaptiveLive && kind === 'youtube' ? YOUTUBE_QUICK_LIVE.scheduledRequestChannels : catalogQueue ? LIBRARY_LIMITS.youtubeCatalogSourcesPerRequest : options?.youtubeLiveOnly && kind === 'youtube' ? YOUTUBE_QUICK_LIVE.requestChannels : twitchLiveOnly && kind === 'twitch' ? TWITCH_QUICK_LIVE.requestChannels : liveOnly ? 12 : current.length;
      for (let offset = 0, batchSize = maxBatch; offset < current.length; offset += batchSize) {
      batchSize = offset === 0 && current.length > maxBatch ? kind === 'youtube' && options?.youtubeLiveOnly ? YOUTUBE_QUICK_LIVE.firstRequestChannels : kind === 'twitch' && twitchLiveOnly ? TWITCH_QUICK_LIVE.firstRequestChannels : maxBatch : maxBatch;
      if (getPullCancellationRevision() !== cancellation) break;
      if (!liveOnly && !recentPipeline && options?.scheduled && !automaticPullAvailable(kind)) { yieldedLiveTurn = true; break; }
      if (!livePipeline && adaptiveLive && offset > 0 && (Date.now() - startedAt >= 20_000 || !options?.liveDemand && pullsPaused())) { yieldedLiveTurn = true; break; }
      if (catalogQueue) {
        const counts = await remoteEntryCounts(get().videos);
        if (!remainingEntrySlots(counts, getPullSettings(), 'youtube') && !canRotateForGroup(counts, getPullSettings(), 'youtube', cleanupRemaining)) { errors.push(ENTRY_LIMIT_MESSAGE); break; }
      }
      // An empty cache needs the first page, even if an old saved cursor or
      // feed watermark says it was already consumed before catalog recovery.
      let completedResponse = livePipeline ? await livePipeline.next() : recentPipeline ? await recentPipeline.next() : undefined;
      if ((livePipeline || recentPipeline) && !completedResponse) break;
      if ((livePipeline || recentPipeline) && completedResponse?.ok) {
        for (;;) {
          const ready = (livePipeline ?? recentPipeline)!.takeReady(result => result.ok);
          if (!ready?.ok) break;
          completedResponse = { ok: true, item: { channels: [...completedResponse.item.channels, ...ready.item.channels], attemptAt: Math.min(completedResponse.item.attemptAt, ready.item.attemptAt) },
            value: mergeYoutubeLiveResults(completedResponse.value, ready.value) };
        }
      }
      const selectedBatch = completedResponse ? completedResponse.item.channels : adaptiveLive
        ? selectAdaptiveLive(Math.min(batchSize, current.length - offset))
        : current.slice(offset, offset + batchSize);
      if (!selectedBatch.length) { yieldedLiveTurn = Boolean(adaptiveLive); break; }
      batchSize = selectedBatch.length;
      for (const channel of selectedBatch) attemptedLive.add(channel.id);
      const batch = selectedBatch.map(channel => youtubeCoverage && !(youtubeCoverage.get(channel.id) ?? 0)
        ? { ...channel, catalogCursor: undefined, catalogExhaustedAt: undefined, newestVideoId: undefined } : channel);
      if (catalogQueue) await waitForCatalogTurn();
      if (!liveOnly) await waitForPulls();
      await syncCatalogIndex();
      let result: Awaited<ReturnType<typeof refreshRemotes>>;
      const attemptAt = completedResponse?.item.attemptAt ?? Date.now();
      try {
        const forceYoutubeRequest = forceNextRequest;
        forceNextRequest = false;
        if (completedResponse) {
          if (!completedResponse.ok) throw completedResponse.error;
          result = completedResponse.value;
        } else result = await refreshRemotes({ data: { youtubeFeedRepair: feedRepair, forceYoutube: forceYoutubeRequest, youtubeVideoLimit: getPullSettings().youtubeBatchVideos, channels: batch, youtubeCatalog: catalogQueue, youtubeBackground: options?.scheduled === true, liveDemand: options?.liveDemand === true, youtubeLiveOnly: options?.youtubeLiveOnly === true, twitchLiveOnly: options?.twitchLiveOnly === true, twitchRoutine: options?.twitchRoutine === true, twitchContinueArchive: options?.twitchContinueArchive === true, twitchApplyPolicy: applyTwitchPolicy } });
      } catch (error) {
        if (getPullCancellationRevision() !== cancellation) break;
        if (error instanceof Error && error.name === 'PullPriorityDeferredError') { yieldedLiveTurn = true; break; }
        errors.push(`${batch.map((channel) => channel.title).join(", ")}: ${error instanceof Error ? error.message : String(error)}`);
        if (recentQueue) {
          const attemptedIds = new Set(batch.map(channel => channel.id));
          set(state => ({ follows: state.follows.map(channel => attemptedIds.has(channel.id) && (channel.recentPull?.attemptedAt ?? 0) <= attemptAt
            ? { ...channel, recentPull: recentPullFailure(channel, channel.kind === 'twitch' ? classifyTwitchFailure(error) : { kind: 'network-offline', at: Date.now(), message: error instanceof Error ? error.message.slice(0, 240) : 'Recent upload check failed.', recovery: 'Retry this creator after its wait.' }) } : channel) }));
        }
        if (liveOnly) {
          const attemptedIds = new Set(batch.map(channel => channel.id));
          set(state => ({ follows: state.follows.map(channel => {
            if (!attemptedIds.has(channel.id) || (channel.liveCheckedAt ?? 0) > attemptAt) return channel;
            if (channel.kind === 'twitch') return { ...channel, ...twitchRetryPatch(channel, 'live', classifyTwitchFailure(error)) };
            return { ...channel, lastLiveFailure: youtubeLiveFailure(channel, { kind: 'network-offline', at: Date.now(),
              message: error instanceof Error ? error.message.slice(0, 240) : 'Live check failed.', recovery: '' }) };
          }) }));
        }
        checked += batch.length;
        recordLiveBatch(batch);
        liveProgress();
        if (!overlappingLive) get().updatePull({ done: Math.min(current.length, offset + batch.length), received, added, failed: Math.min(current.length, offset + batch.length) - refreshed });
        continue;
      }
      if (catalogQueue) { await waitForCatalogTurn(); await waitForPulls(); }
      await syncCatalogIndex();
      if (getPullCancellationRevision() !== cancellation) break;
      if (options?.youtubeLiveOnly && result.providerRetryAt) { liveRetry = Math.max(liveRetry ?? 0, result.providerRetryAt); liveError = result.channels.find(channel => channel.lastLiveFailure)?.lastLiveFailure?.message; }
      if (options?.youtubeLiveOnly) {
        await syncLiveSources();
        const previous = new Map(get().follows.map(channel => [channel.id, channel]));
        const checkedIds = new Set(result.liveCheckedIds ?? result.refreshedIds);
        const successfulIds = new Set(result.refreshedIds);
        result.channels = result.channels.map(channel => {
          const savedIds = [...liveSourceVideos.get(channel.id) ?? []].map(id=>get().videos[livePositions.get(id)!]?.remote?.videoId).filter((id):id is string=>Boolean(id));
          const observedIds = result.videos.filter(v=>v.folderId===channel.id && v.remote?.live).map(v=>v.remote!.videoId).filter((id):id is string=>Boolean(id));
          const reconciled = reconcileYoutubeKnownBroadcasts(channel,batch.find(c=>c.id===channel.id),savedIds,observedIds,checkedIds.has(channel.id));
          if (!reconciled.checked) checkedIds.delete(channel.id);
          if (!reconciled.success) successfulIds.delete(channel.id);
          return retainYoutubeLiveFollow(previous.get(channel.id),reconciled.channel,reconciled.checked);
        });
        result.liveCheckedIds = [...checkedIds]; result.refreshedIds = [...successfulIds];
      }
      if (recentQueue || feedRepair) {
        const previous = new Map(get().follows.map(channel => [channel.id, channel]));
        const successes = new Set(result.refreshedIds);
        result.channels = result.channels.map(channel => {
          const old = previous.get(channel.id); if (!old) return channel;
          const state = channel.recentPull && channel.recentPull.attemptedAt !== old.recentPull?.attemptedAt ? channel.recentPull
            : successes.has(channel.id) ? recentPullSuccess(old, channel) : recentPullFailure(old, channel.lastProviderFailure ?? { kind: 'network-offline', at: attemptAt, message: 'Recent upload check did not complete.', recovery: 'Retry this creator after its wait.' });
          return { ...channel, recentPull: state, catalogCursor: old.catalogCursor, catalogCheckedAt: old.catalogCheckedAt, catalogExhaustedAt: old.catalogExhaustedAt,
            twitchArchiveCursor: old.twitchArchiveCursor, twitchArchiveCheckedAt: old.twitchArchiveCheckedAt, twitchArchiveExhaustedAt: old.twitchArchiveExhaustedAt, twitchArchiveDiagnostics: old.twitchArchiveDiagnostics, twitchArchiveRetry: old.twitchArchiveRetry, lastProviderFailure: old.lastProviderFailure };
        });
      }
      const stillFollowed = new Set(get().follows.map(channel => channel.id));
      result.channels = result.channels.filter(channel => stillFollowed.has(channel.id));
      result.videos = result.videos.filter(video => stillFollowed.has(video.folderId));
      result.refreshedIds = result.refreshedIds.filter(id => stillFollowed.has(id));
      const providerReceived = result.videos.length;
      checked += batch.length;
      recordLiveBatch(batch, result.refreshedIds);
      if (options?.youtubeLiveOnly) {
        // Publish network observations before catalog reconciliation can yield
        // across a large library. A failed creator retains its previous success;
        // normalized negative observations still obey the ten-minute hold.
        youtubeReceived += result.videos.filter(video => video.remote?.kind === 'youtube').length;
        set(state => ({ follows: mergeFollowResults(state.follows, result.channels) }));
        liveProgress();
        checkpointFollows();
      }
      if (twitchLiveOnly && kind === 'twitch') {
        twitchReceived += result.videos.filter(v=>v.remote?.kind==='twitch'&&v.remote.live).length;
        set(state=>({follows:mergeFollowResults(state.follows,result.channels)}));
        liveProgress(); checkpointFollows();
      }
      if (twitchLiveOnly && kind === 'twitch' && result.channels.length && result.channels.every(channel => channel.lastLiveFailure?.kind === 'rate-limited')) { twitchRetry = Math.max(...result.channels.map(channel => channel.twitchLiveRetry?.retryAt ?? Date.now() + 60_000)); twitchError = result.channels[0].lastLiveFailure?.message; }
      // The common case for a large follow list is a confirmed offline result.
      // Index live sources once per catalog snapshot, then publish only follow
      // metadata. Avoid an 80k-video merge and preference rewrite per 24 checks.
      if ((liveOnly || recentQueue) && !result.videos.length) {
        await syncLiveSources();
        if (getPullCancellationRevision() !== cancellation) break;
        if (!batch.some(channel => liveSources.has(channel.id))) {
          refreshed += result.refreshedIds.length;
          for (const channel of result.channels) { const failure = recentQueue ? channel.recentPull?.failure : channel.lastLiveFailure; if (failure && errors.length < 12) errors.push(channel.title + ': ' + failure.message); }
          set(state => ({ follows: mergeFollowResults(state.follows, result.channels), ...(!overlappingLive ? { remoteRefreshStatus: { at: Date.now(), checked, refreshed, failed: checked - refreshed, youtube: youtubeReceived, twitch: twitchReceived, action } } : {}) }));
          liveProgress();
          if (!overlappingLive) get().updatePull({ done: checked, received, added, failed: checked - refreshed });
          checkpointFollows();
          if (twitchRetry) { errors.push(twitchError ?? 'Twitch is cooling down.'); if (!livePipeline) break; }
          if (result.providerRetryAt) {
            if (result.providerCooldownScope === 'all') {
              const cooldown = { retryAt: result.providerRetryAt, cooldownScope: 'all' as const, error: result.channels.find(channel => channel.lastLiveFailure)?.lastLiveFailure?.message };
              saveYoutubeCooldown(cooldown);
              set(state => ({ youtubeRefreshStatus: { ...(state.youtubeRefreshStatus ?? { at: Date.now(), checked: 0, refreshed: 0, failed: 0, youtube: 0, twitch: 0 }), ...cooldown } }));
            }
            if (kind === 'youtube') { errors.push(recentQueue ? 'YouTube recent checks are cooling down; unchecked creators retain their place.' : 'YouTube live checks are cooling down; unchecked creators keep their previous status.'); if (!livePipeline && !recentPipeline) break; }
          }
          continue;
        }
      }
      // A status-only positive does not change classification, membership, or
      // admission. Patch its observation directly; skip the full tag/admission
      // pipeline. New broadcasts, changed titles and missing streams still take
      // the regular reconciliation path (including YouTube's offline hold).
      if (liveOnly && result.videos.length && !result.providerRetryAt && !twitchRetry && !result.channels.some(channel => channel.lastLiveFailure)
        && result.videos.every(video => !video.remote?.comments?.length && !video.remote?.youtubeKeywords?.length)) {
        // Compare the compact listing shape used by the real catalog. Provider
        // live rows include a generated description which lives only on disk.
        const statusRows = result.videos.map(catalogCard);
        let patched: LibraryVideo[] | null = null;
        let changedRows: LibraryVideo[] = [];
        for (;;) {
          await syncLiveSources();
          const snapshot = get().videos, incomingIds = new Set(result.videos.map(video => video.id));
          const checkedIds = new Set(result.liveCheckedIds ?? result.refreshedIds);
          const stable = !batch.some(channel => checkedIds.has(channel.id) && [...liveSourceVideos.get(channel.id) ?? []].some(id => !incomingIds.has(id)))
            && statusRows.every(video => {
              const position = livePositions.get(video.id), previous = position === undefined ? undefined : snapshot[position];
              return previous?.remote?.live && video.remote?.live && previous.remote.kind === video.remote.kind
                && previous.folderId === video.folderId && previous.remote.channelId === video.remote.channelId
                && previous.remote.channelName === video.remote.channelName && previous.remote.videoId === video.remote.videoId
                && (video.remote.sourceIds ?? []).every(id => id === previous.folderId || previous.remote!.sourceIds?.includes(id))
                && previous.name === video.name && previous.genre === video.genre
                && previous.description === video.description && previous.tagline === video.tagline
                && previous.collection === video.collection
                && !video.remote.youtubeKeywords?.length && !video.remote.comments?.length;
            });
          if (!stable) break;
          const turn = async () => {
            await yieldCatalogTask();
            if (getPullCancellationRevision() !== cancellation) throw new Error('Pull cancelled; accepted catalog entries remain saved.');
          };
          const rows: LibraryVideo[] = [];
          // This is a reference copy, not metadata work. Larger slices still
          // obey the four-millisecond budget and avoid hundreds of timer waits
          // on browsers without scheduler.postTask (notably Windows).
          const next = new Array<LibraryVideo>(snapshot.length);
          await forEachCatalogSlice(snapshot, (row, index) => { next[index] = row; }, turn, 8192);
          for (const video of statusRows) {
            const position = livePositions.get(video.id)!, previous = snapshot[position];
            if ((video.remote!.observedAt ?? 0) < (previous.remote!.observedAt ?? 0)) continue;
            const updated = { ...previous, poster: video.poster || previous.poster, remote: { ...previous.remote!,
              live: true, viewers: video.remote!.viewers, observedAt: video.remote!.observedAt, youtubeEvent:video.remote!.youtubeEvent??previous.remote!.youtubeEvent, liveOfflineSince: undefined } };
            next[position] = updated; rows.push(updated);
          }
          if (get().videos !== snapshot) continue;
          patched = rows.length ? next : snapshot; changedRows = rows; break;
        }
        if (patched) {
          received += providerReceived; refreshed += result.refreshedIds.length;
          if (!options?.youtubeLiveOnly) youtubeReceived += result.videos.filter(video => video.remote?.kind === 'youtube').length;
          if (!(twitchLiveOnly && kind === 'twitch')) twitchReceived += result.videos.filter(video => video.remote?.kind === 'twitch').length;
          for (const channel of result.channels) if (channel.live && !beforeLiveChannels.has(channel.id)) wentLive.push(channel);
          set(state => ({ videos: patched!, follows: mergeFollowResults(state.follows, result.channels),
            notices:youtubeEventNotices(v=>state.videos[livePositions.get(v.id)!],result.videos,state.notices,youtubeGoLiveAlerts()),
            ...(!overlappingLive ? { remoteRefreshStatus: { at: Date.now(), checked, refreshed, failed: checked - refreshed, youtube: youtubeReceived, twitch: twitchReceived, action } } : {}) }));
          liveSourceSnapshot = patched; // positions and source memberships did not change
          liveProgress();
          if (!overlappingLive) get().updatePull({ done: checked, received, added, failed: checked - refreshed });
          if (changedRows.length) await cacheRemotes(get, changedRows, true);
          checkpointFollows(); continue;
        }
      }
      let providerRows = result.videos;
      if (!options?.youtubeLiveOnly && !twitchLiveOnly) providerRows = await rotateRemotePull(get, providerRows, cleanupRemaining);
      let prepared: Awaited<ReturnType<typeof prepareRemotePull>>;
      let existingIndex: Map<string, LibraryVideo> | null;
      let routineMerged: LibraryVideo[] | null;
      let catalogMerged: Awaited<ReturnType<typeof prepareIndexedRemoteCatalog>> | null;
      const staleLiveIds: string[] = [];
      const endedYoutubeRows: LibraryVideo[] = [];
      const pendingYoutubeRows: LibraryVideo[] = [];
      const endedTwitchRows: LibraryVideo[] = [];
      const rebase = Symbol('Refresh inputs changed');
      // Retry preparation against current inputs, without re-requesting the provider page.
      for (;;) {
        await syncCatalogIndex();
        prepared = await prepareRemotePull(get, providerRows, catalogPositions ?? undefined);
        existingIndex = catalogPositions ? null : await remoteVideoIndexAsync(prepared.base.videos);
        if (catalogPositions && catalogIndexedVideos !== prepared.base.videos) continue;
        staleLiveIds.length = 0;
        endedYoutubeRows.length = 0;
        pendingYoutubeRows.length = 0;
        endedTwitchRows.length = 0;
        const sameInputs = () => {
          const state = get(), base = prepared.base;
          return state.videos === base.videos && state.tags === base.tags && state.metadataProvenance === base.metadataProvenance
            && state.favorites === base.favorites && state.likes === base.likes && state.history === base.history
            && getPullSettings() === prepared.admission.settings;
        };
        const mergeTurn = async () => {
          if (twitchLiveOnly || options?.youtubeLiveOnly) {
            await yieldCatalogTask();
            if (getPullCancellationRevision() !== cancellation) throw new Error('Pull cancelled; accepted catalog entries remain saved.');
          } else await waitForCatalogTurn();
          if (!sameInputs()) throw rebase;
        };
        try {
          routineMerged = catalogPositions ? null : await mergeRemoteRefreshAsync(prepared.base.videos, prepared.admission.videos.map(catalogCard), result.refreshedIds,
            await prepareRefreshSavedIds(prepared.base.favorites, prepared.base.likes, prepared.base.history, mergeTurn), { index: existingIndex ?? undefined, staleLiveIds, endedYoutubeRows, pendingYoutubeRows, youtubeOfflineGraceMs: YOUTUBE_LIVE_HOLD_MS, endedTwitchRows, turn: mergeTurn,
              liveCheckedAt:Object.fromEntries(result.channels.flatMap(channel=>channel.liveCheckedAt?[[channel.id,channel.liveCheckedAt]]:[])),
              liveCheckedIds: result.liveCheckedIds ?? result.refreshedIds.filter(id => options?.youtubeLiveOnly || batch.some(channel => channel.id === id && channel.kind === 'twitch')) });
          catalogMerged = catalogPositions ? await prepareIndexedRemoteCatalog(prepared.base.videos, prepared.admission.videos.map(catalogCard), catalogPositions, mergeTurn) : null;
        } catch (error) { if (error === rebase) continue; throw error; }
        if (getPullCancellationRevision() !== cancellation) break;
        if (sameInputs()) break;
      }
      if (getPullCancellationRevision() !== cancellation) break;
      result.videos = prepared.admission.videos;
      if (result.providerRetryAt && (result.providerCooldownScope === 'all' || result.providerCooldownScope === 'catalog' || !result.providerCooldownScope)) {
        const cooldown = { retryAt: result.providerRetryAt, error: result.channels.find(channel => channel.kind === 'youtube' && channel.lastProviderFailure)?.lastProviderFailure?.message, cooldownScope: result.providerCooldownScope === 'all' ? 'all' as const : 'catalog' as const };
        saveYoutubeCooldown(cooldown);
        // Live/mixed checks share the provider deadline, without replacing the
        // last YouTube archive's counts with a different operation's result.
        set(s => ({ youtubeRefreshStatus: { ...(s.youtubeRefreshStatus ?? { at: Date.now(), checked: 0, refreshed: 0, failed: 0, youtube: 0, twitch: 0 }), ...cooldown } }));
      }
      const recovered = catalogQueue && !recoveredCooldown && !result.providerRetryAt && result.refreshedIds.length > 0;
      if (recovered) { recoveredCooldown = true; clearYoutubeCooldown(); }
      result.channels = holdEntryLimitCursors(get().follows, result.channels, prepared.admission.skippedSources);
      if (prepared.admission.skipped && errors.length < 12) errors.push(ENTRY_LIMIT_MESSAGE);
      const knownVideoIndex = catalogPositions ?? existingIndex!;
      const isNewVideo = (video: LibraryVideo) => lookupCatalogIdentity<number|LibraryVideo>(knownVideoIndex,video) === undefined;
      const newVideoIds = new Set(result.videos.filter(isNewVideo).map((video) => video.id));
      const newCount = newVideoIds.size;
      received += providerReceived;
      if (!options?.youtubeLiveOnly) youtubeReceived += result.videos.filter(video => video.remote?.kind === 'youtube').length;
      if (!(twitchLiveOnly && kind === 'twitch')) twitchReceived += result.videos.filter(video => video.remote?.kind === 'twitch' && (liveOnly ? video.remote.live : video.extension === 'vod' || video.extension === 'clip')).length;
      added += newCount;
      refreshed += result.refreshedIds.length;
      if (!catalogQueue) newVideos.push(...result.videos.filter((video) => isNewVideo(video) && Boolean(video.remote)));
      for (const channel of result.channels) {
        const failure = recentQueue ? channel.recentPull?.failure : twitchLiveOnly || options?.youtubeLiveOnly ? channel.lastLiveFailure : channel.lastProviderFailure;
        if (failure && errors.length < 12) errors.push(`${channel.title}: ${failure.message}`);
        if (channel.live && !beforeLiveChannels.has(channel.id)) wentLive.push(channel);
      }
      liveProgress();
      if (!overlappingLive) get().updatePull({ done: Math.min(current.length, offset + batch.length), received, added, failed: Math.min(current.length, offset + batch.length) - refreshed });
      const refreshStatus = {
          at: Date.now(),
          checked: offset + batch.length,
          refreshed,
          failed: offset + batch.length - refreshed,
          youtube: youtubeReceived,
          twitch: twitchReceived,
          action,
          ...(result.providerRetryAt ? { retryAt: result.providerRetryAt, cooldownScope: result.providerCooldownScope } : {}),
          ...(result.channels.find(channel => channel.lastProviderFailure)?.lastProviderFailure ? { error: result.channels.find(channel => channel.lastProviderFailure)!.lastProviderFailure!.message } : {}),
        };
      const mergedIncoming = catalogMerged?.rows ?? [];
      set((s) => {
        const mergedVideos = catalogPositions
          ? catalogMerged!.videos
          : routineMerged!;
        if (catalogPositions) for (const [key, position] of catalogMerged!.positionChanges) catalogPositions.set(key, position);
        const enriched = prepared.enriched;
        // Live reconciliation can also remove expired rows. Recount those
        // snapshots cooperatively rather than caching pre-removal totals.
        if (mergedVideos.length - s.videos.length === prepared.admission.added) rememberEntryCounts(mergedVideos, prepared.admission.counts);
        const folderCounts = catalogFolderCounts ?? new Map(s.folders.map((folder) => [folder.id, folder.videoCount ?? 0]));
        for (const video of result.videos) if (newVideoIds.has(video.id)) { folderCounts.set(video.folderId, (folderCounts.get(video.folderId) ?? 0) + 1); newVideoIds.delete(video.id); }
        return {
        follows: mergeFollowResults(s.follows, result.channels).map(channel => {
          const failure = channel.lastProviderFailure;
          // Keep the diagnosis, but do not restore an obsolete provider-wide
          // deadline on reload after a healthy catalog request.
          return recovered && channel.kind === 'youtube' && failure?.kind === 'rate-limited'
            && (failure.cooldownScope === 'all' || failure.cooldownScope === 'catalog') && failure.at <= startedAt
            ? { ...channel, lastProviderFailure: { ...failure, retryAt: undefined, cooldownScope: undefined } } : channel;
        }),
        ...(!catalogQueue && kind !== "youtube" ? { remoteCheckedAt: Date.now() } : {}),
        folders: [
          ...s.folders.filter((f) => !result.channels.some((channel) => channel.id === f.id)),
          ...result.channels.map((c) => ({
            id: c.id,
            name: c.title,
            kind: c.kind as Folder["kind"],
            videoCount: folderCounts.get(c.id) ?? 0,
            health: "healthy" as const,
            lastCheckedAt: Date.now(),
          })),
        ],
        videos: mergedVideos,
        notices:youtubeEventNotices(v=>existingIndex?.get(v.id)??existingIndex?.get(youtubeVideoKey(v)??v.id),result.videos,s.notices,youtubeGoLiveAlerts()),
        progress: reconcileResumeForVideos(result.videos, s.progress, s.resumeProgress),
        tags: enriched.tags,
        metadataProvenance: enriched.metadataProvenance,
        ...(!overlappingLive ? { remoteRefreshStatus: refreshStatus } : {}),
        ...(kind === 'youtube' && !options?.youtubeLiveOnly && !recentQueue ? { youtubeRefreshStatus: refreshStatus } : {}),
        ...(!overlappingLive && !options?.youtubeLiveOnly ? { remoteRetryAt: result.retryAt } : {}),
      };
      });
      await reconcilePlaylistCommit(get,set,result.channels);
      // A membership move changes folder counts; let the next slice rebuild its index.
      if (catalogPositions && !result.channels.some(c=>c.playlistWalk?.completed)) catalogIndexedVideos = get().videos;
      if (catalogQueue) {
        const changed = new Map(mergedIncoming.map(video => [video.id, video]));
        await cacheRemotes(get, [...changed.values()]);
        // Save the resumable cursor every few sources without repeatedly
        // cloning the entire tag/preference ledger during a long crawl.
        if ((offset + batch.length) % 4 === 0) saveFollows(get().follows);
        // Yield before the next creator. This lets input, scrolling and live
        // status render between large archive responses.
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
      else {
        const ended = [...endedYoutubeRows, ...endedTwitchRows];
        await cacheRemotes(get, ended.length || pendingYoutubeRows.length ? [...result.videos, ...ended, ...pendingYoutubeRows] : result.videos);
        const retainedStreams = new Set(ended.map(video => video.id));
        const removedLiveIds = staleLiveIds.filter(id => !retainedStreams.has(id));
        if (removedLiveIds.length) await removeRemoteSnapshotVideos(removedLiveIds).catch(() => undefined);
      }
      if (liveOnly) checkpointFollows();
      if (twitchRetry) { errors.push(twitchError ?? 'Twitch is cooling down.'); if (!livePipeline) break; }
      if (result.providerRetryAt && (!liveOnly || kind === 'youtube')) {
        errors.push(`YouTube is cooling down until ${new Date(result.providerRetryAt).toLocaleTimeString()}; ${current.length - checked} targets remain queued for a later sweep.`);
        if (!livePipeline && !recentPipeline) break;
      }
      if (!liveOnly && !recentPipeline && kind === 'youtube' && prepared.admission.skipped && !prepared.admission.added) break;
      }
      // Offline/status-only turns have their own durable follow checkpoint.
      // Do not clone the large preference/tag ledger just to update timestamps.
      if (liveMetadataBase && get().notices===noticesBeforeRefresh && get().tags === liveMetadataBase.tags && get().metadataProvenance === liveMetadataBase.provenance) saveFollows(get().follows);
      else persistNow(get);
      if (!yieldedLiveTurn && checked < current.length) errors.push('Check stopped early. Confirmed observations are saved; unchecked channels keep their previous state.');
      const failed = checked - refreshed;
      liveProgress(!yieldedLiveTurn && checked < current.length || failed > 0 ? 'partial' : 'complete');
      const pull: PullRecord = { id: pullId, provider, action, startedAt, finishedAt: Date.now(), targets: current.slice(0, 12).map((channel) => channel.title || channel.handle), done: checked, total: yieldedLiveTurn ? checked : current.length, received, added, failed, status: errors.length ? "partial" : failed ? refreshed ? "partial" : "failed" : "success", ...(errors.length ? { errors: errors.slice(0, 12) } : {}) };
      if (!overlappingLive) get().finishPull(pull);
      if (!liveOnly && yieldedLiveTurn && checked === 0) return { wentLive: [], newVideos: [], skipped: 'busy' };
      return { wentLive, newVideos, pull, retryAt: get().youtubeRefreshStatus?.retryAt };
    } catch (error) {
      liveProgress('partial');
      if (!options?.youtubeLiveOnly) {
        const status = { at: Date.now(), checked, refreshed, failed: checked - refreshed, youtube: received, twitch: 0, action, error: error instanceof Error ? error.message : String(error) };
        set({ remoteRefreshStatus: status, ...(kind === 'youtube' && !recentQueue ? { youtubeRefreshStatus: status } : {}) });
      }
      const pull: PullRecord = { id: pullId, provider, action, startedAt, finishedAt: Date.now(), targets: current.slice(0, 12).map((channel) => channel.title || channel.handle), done: checked, total: current.length, received, added, failed: checked - refreshed, status: "failed", errors: [error instanceof Error ? error.message : String(error)] };
      if (!overlappingLive) get().finishPull(pull);
      return { wentLive, newVideos, pull };
    } finally {
      livePipeline?.close();
      recentPipeline?.close();
      if (options?.youtubeLiveOnly) youtubeLiveCheckBusy = false;
      if (twitchLiveOnly) twitchLiveCheckBusy = false;
      if (!overlappingLive) set({ refreshing: false });
    }
  },
  pushNotice: (n) => {
    const notice: AppNotice = {
      id: `n:${Date.now()}:${Math.random().toString(16).slice(2, 6)}`,
      at: Date.now(),
      read: false,
      ...n,
    };
    set((s) => ({ notices: [notice, ...s.notices].slice(0, 40) }));
    persistNow(get);
    if (get().notifyPush && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(n.title, { body: n.body, silent: false });
        } catch {
          // ignore
        }
      }
    }
  },
  markNoticesRead: () => {
    set((s) => ({
      notices: s.notices.map((n) => ({ ...n, read: true })),
    }));
    persistNow(get);
  },
  setNotifyPush: (notifyPush) => {
    set({ notifyPush });
    persistNow(get);
  },
  markUnavailable: (id, reason) => {
    const video = lookupVideo(get().videos, id);
    if (!video || (video.remote && video.remote.kind !== "reddit")) return;
    if (get().unavailable[id]) return;
    set((s) => ({ unavailable: { ...s.unavailable, [id]: true } }));
    get().pushNotice({ title: "Hidden unavailable video", body: `${video.name} · ${reason}`, kind: "system" });
    persistNow(get);
  },
  pruneHistory: (before) => {
    set((s) => ({ history: s.history.filter((entry) => entry.at >= before) }));
    persistNow(get);
    void pruneActivityJournal(before).catch(() => undefined);
  },
  getResumeRepairPreview: () => {
    const state = get();
    const marks = Object.values(state.progress);
    const staleBefore = Date.now() - 180 * 24 * 60 * 60_000;
    const linkedKeys = new Set(state.videos.flatMap(stableResumeKeys));
    return {
      valid: marks.filter(validResumeMark).length,
      invalid: marks.filter((mark) => !validResumeMark(mark)).length,
      stale: marks.filter((mark) => validResumeMark(mark) && mark.at < staleBefore).length,
      recoverable: Object.entries(state.resumeProgress).filter(([key, mark]) => validResumeMark(mark) && linkedKeys.has(key)).length,
    };
  },
}));

type SelectorMemo = { public?: LibraryVideo[]; adult?: LibraryVideo[]; adultRemote?: LibraryVideo[]; youtube?: LibraryVideo[]; twitch?: LibraryVideo[]; live?: LibraryVideo[]; classics?: LibraryVideo[]; continuePublic?: LibraryVideo[]; continueAdult?: LibraryVideo[] };
const openedPlays = createDeferredEvents<string>(id => {
  const state = useLibrary.getState();
  if (state.activeId === id || lookupVideo(state.videos, id)) state.recordPlay(id);
}, work => scheduleBackgroundWork(work, { timeoutMs: 1000, fallbackDelayMs: 0 }));
let youtubeSelectorSnapshot: {
  videos: LibraryVideo[]; privateFolders: Set<string>; unavailable: Record<string, true>;
  hiddenVideos: Record<string, true>; hideDemo: boolean; result: LibraryVideo[];
} | undefined;
// Flush only pending deferred user activity/preferences on close or app switch.
// A visibility event with no edits must not write another full library snapshot.
if (typeof window !== 'undefined') {
  const flushPending = () => {
    openedPlays.flush();
    if (persistTimer != null || cancelPrefsSave) flushPersist(useLibrary.getState);
    else if (cancelActivitySave) {
      cancelActivitySave(); cancelActivitySave = undefined;
      persistActivityNow(useLibrary.getState);
    }
  };
  const onHidden = () => { if (document.hidden) flushPending(); };
  window.addEventListener('pagehide', flushPending);
  document.addEventListener('visibilitychange', onHidden);
  import.meta.hot?.dispose(() => {
    flushPending();
    window.removeEventListener('pagehide', flushPending);
    document.removeEventListener('visibilitychange', onHidden);
  });
}
let selectorMemo = new WeakMap<LibraryState, SelectorMemo>();
function memoFor(state: LibraryState) { let memo = selectorMemo.get(state); if (!memo) { memo = {}; selectorMemo.set(state, memo); } return memo; }

function computePublicList(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  if (memo.public) return memo.public;
  const adult = adultIdSet(state.folders);
  const knownFolders = new Set(state.folders.map((folder) => folder.id));
  // Cached catalog entries can outlive a removed source. Keep their metadata in storage,
  // but never promote an orphaned entry into Home or search results.
  let list = state.videos.filter((v) => !state.unavailable[v.id] && !state.hiddenVideos[v.id] && !videoIsPrivate(adult,v) && (knownFolders.has(v.folderId) || Boolean(v.remote) || v.isSample));
  if (state.hideDemo) list = list.filter((v) => !v.isSample);
  memo.public = list;
  return list;
}

function computeAdultList(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  if (memo.adult) return memo.adult;
  // Adults section is open; private shelves still stay off public rails via folder.adult.
  const adult = adultIdSet(state.folders);
  // Older durable catalogs may predate the ingest-time merge. Apply the same
  // identity merge at the boundary used by every Adult shelf, so a Reddit post
  // and its direct Redgifs record can never render (and load posters) twice.
  memo.adult = dedupeAdultVideoCards(state.videos.filter((v) =>
    !state.unavailable[v.id]
    && !isRemovedRedditVideo(v)
    && !state.hiddenVideos[v.id]
    && videoIsPrivate(adult,v)
    && !RETIRED_ADULT_SOURCE_IDS.includes((v.remote?.kind ?? v.folderId.split(":")[0]) as "camsoda")
    && (state.showHiddenAdult || !(state.tags[v.id] ?? []).includes("hidden")),
  ));
  return memo.adult;
}

const videoNameOrder = new Intl.Collator(undefined, { sensitivity: "base" });
function computeSelectVisible(state: LibraryState): LibraryVideo[] {
  const q = state.query.trim().toLowerCase();
  const inAdults = state.sourceId === "adults" || state.sourceId === "adult-fetishes";
  // Recovery pages already resolve their saved activity. Do not first filter
  // and index the entire public catalog merely to throw that work away.
  let list = state.sourceId === "history" ? selectHistory(state, false)
    : state.sourceId === "continue" ? selectContinue(state, false)
    : state.sourceId === "favorites" ? selectFavorites(state, false)
    : inAdults ? adultList(state) : publicList(state);
  if (state.sourceId === "favorites") {
    list = list.filter((v) => (state.favorites[v.id] || state.likes[v.id]));
  } else if (state.sourceId === "continue") {
    // Use the same durable recovery path as History. Provider rows can rotate
    // out of the in-memory catalog while their saved watch position remains
    // valid and should still be resumable.
    list = selectContinue(state, false);
  } else if (state.sourceId === "history") {
    // selectHistory also retains playable links evicted from the catalog.
  } else if (state.sourceId === "movies") {
    list = list.filter((v) => Boolean(movieEvidence(v,state.tags[v.id])));
  } else if (state.sourceId === "youtube") {
    list = list.filter((v) => v.remote?.kind === "youtube");
  } else if (state.sourceId === "twitch") {
    list = list.filter((v) => v.remote?.kind === "twitch");
  } else if (state.sourceId === "live") {
    list = list.filter((v) => v.remote?.live);
  } else if (state.sourceId === "home" || state.sourceId === "landing" || state.sourceId === "all") {
    // keep public list
  } else if (!SYSTEM_SOURCES.has(state.sourceId) && !inAdults) {
    list = list.filter((v) => v.folderId === state.sourceId);
  }
  if (q) {
    const result = state.searchResult;
    if (!result || result.query !== q || result.videos !== state.videos || result.tags !== state.tags || result.categories !== state.categories) return [];
    list = list.filter((v) => result.ids.has(v.id));
  }
  // The YouTube selector already returns the default addedAt order. Reuse it
  // directly instead of cloning and sorting tens of thousands of cached cards
  // again whenever the visible YouTube catalog is invalidated.
  if (state.sourceId === "youtube" && state.sort === "added") return list;
  if (state.sourceId === "history") return list;
  const sorted = [...list];
  sorted.sort(visibleVideoOrder(state));
  return sorted;
}
function visibleVideoOrder(state: LibraryState) {
  return (a: LibraryVideo, b: LibraryVideo) => {
    if (state.sourceId === "movies" && Boolean(state.likes[b.id]) !== Boolean(state.likes[a.id])) {
      return state.likes[b.id] ? 1 : -1;
    }
    switch (state.sort) {
      case "added":
        return b.addedAt - a.addedAt;
      case "size":
        return b.size - a.size;
      case "duration":
        return (b.duration ?? 0) - (a.duration ?? 0);
      case "recent": {
        const ra = state.progress[a.id]?.at ?? 0;
        const rb = state.progress[b.id]?.at ?? 0;
        return rb - ra;
      }
      default:
        return videoNameOrder.compare(a.name, b.name);
    }
  };
}

function scoped(state: LibraryState, adult: boolean): LibraryVideo[] {
  return adult ? adultList(state) : publicList(state);
}

/** Keep a small newest-first result without sorting an entire remote library. */
function newestFirst(items: LibraryVideo[], limit: number): LibraryVideo[] {
  const top: LibraryVideo[] = [];
  for (const item of items) {
    const insertAt = top.findIndex((current) => current.addedAt < item.addedAt);
    if (insertAt < 0) {
      if (top.length < limit) top.push(item);
    } else {
      top.splice(insertAt, 0, item);
      if (top.length > limit) top.pop();
    }
  }
  return top;
}

function computeSelectContinue(state: LibraryState, adult = false): LibraryVideo[] {
  const memo = memoFor(state);
  const existing = adult ? memo.continueAdult : memo.continuePublic;
  if (existing) return existing;
  const marks = new Map<string, ResumeMark>();
  const recordMark = (id: string, mark: ResumeMark | undefined) => {
    if (!mark || !Number.isFinite(mark.t) || !Number.isFinite(mark.d) || mark.t < 2 || mark.d <= 0 || mark.t / mark.d >= 0.992) return;
    const current = marks.get(id);
    if (!current || mark.at > current.at) marks.set(id, mark);
  };
  const resumeKeys = Object.keys(state.resumeProgress);
  const watchedIds = [...Object.keys(state.progress), ...resumeKeys.filter(key => key.startsWith("id:")).map(key => key.slice(3))];
  // Search URL/path aliases against the original catalog without first
  // allocating a second recovery list. IDs take the cheaper direct-match path
  // inside activityCandidates; playback aliases still resolve across reimports.
  const adultIds = adultIdSet(state.folders);
  const watched = activityCandidates(
    state.videos,
    resumeKeys.filter(key => !key.startsWith("id:")),
    watchedIds,
  ).filter(video =>
    !(state.hideDemo && video.isSample)
    && !state.hiddenVideos[video.id]
    && adult === videoIsPrivate(adultIds,video),
  );
  for (const video of watched) recordMark(video.id, resumeForVideo(state, video));
  // History keeps URL/title snapshots even after a provider refresh evicts a
  // row. Replay its saved position into Continue using the same recovery card.
  for (const entry of state.history) {
    if (state.hiddenVideos[entry.id]) continue;
    if (!entry.position || !entry.duration || entry.position < 2 || entry.position / entry.duration >= 0.992) continue;
    recordMark(entry.id, { t: entry.position, d: entry.duration, at: entry.at });
  }
  const candidates = [...watched, ...selectHistory(state, adult)];
  const seen = new Set<string>();
  const items = candidates.filter((video) => {
    if (seen.has(video.id)) return false;
    seen.add(video.id);
    return isResumable(video, marks.get(video.id) ?? resumeForVideo(state, video));
  });
  items.sort((a, b) => (marks.get(b.id)?.at ?? resumeForVideo(state, b)?.at ?? 0) - (marks.get(a.id)?.at ?? resumeForVideo(state, a)?.at ?? 0));
  // VideoGrid progressively mounts pages, so Continue itself must not silently
  // truncate a large resume list before the view gets a chance to paginate it.
  if (adult) memo.continueAdult = items;
  else memo.continuePublic = items;
  return items;
}

function computeSelectFavorites(state: LibraryState, adult = false): LibraryVideo[] {
  return selectSavedCards(state.videos, state.favorites, state.likes, adultIdSet(state.folders), adult, state.hiddenVideos, state.hideDemo);
}

export function resumeForVideo(state: Pick<LibraryState, "progress" | "resumeProgress">, video: LibraryVideo): ResumeMark | undefined {
  return newestResume(state.progress[video.id], ...stableResumeKeys(video).map((key) => state.resumeProgress[key]));
}

function* historyLookupKeys(history: readonly HistoryEntry[]) {
  for (const entry of history) { yield entry.id; if (entry.url) yield entry.url; }
}
function historyResolver(state: LibraryState, adult: boolean, byId: ReadonlyMap<string, readonly LibraryVideo[]>) {
  // Public and private History share the original catalog's sparse activity
  // lookup. Privacy/display changes filter only matches, and no full second
  // recovery array or alias cache is retained for either scope.
  const adultIds = adultIdSet(state.folders);
  const lastMatch = (key: string) => {
    const matches = byId.get(key);
    for (let index = (matches?.length ?? 0) - 1; index >= 0; index--) {
      const video = matches![index]!;
      if (!(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === videoIsPrivate(adultIds,video)) return video;
    }
  };
  const seen = new Set<string>();
  const resolvedIds = new Set<string>();
  const resolve = (h: HistoryEntry) => {
      if (state.hiddenVideos[h.id] || seen.has(h.id)) return null;
      seen.add(h.id);
      const cached = lastMatch(h.id) ?? (h.url ? lastMatch(h.url) : undefined);
      if (cached) return cached;
      const live = byId.get(h.id)?.[0];
      if (live) {
        if (state.hiddenVideos[live.id] || state.hideDemo && live.isSample) return null;
        const isAdult = videoIsPrivate(adultIds,live);
        if (adult === isAdult) return live;
        if (!adult && isAdult) return null;
      }
      // Provider cards may be evicted or a local source may be temporarily
      // disconnected. History must still be a durable timeline, not a view of
      // whichever catalog rows happen to be mounted today.
      if (!h.url && !h.title) return null;
      const historyUrl = h.url ?? "";
      const isYoutube = /youtube\.com|youtu\.be/i.test(historyUrl);
      const isTwitch = /twitch\.tv/i.test(historyUrl);
      const isEporner = /eporner\.com/i.test(historyUrl);
      const isRedtube = /redtube\.com/i.test(historyUrl);
      const isChaturbate = /chaturbate\.com/i.test(historyUrl);
      const isMfc = /myfreecams\.com|mfc\.cdn/i.test(historyUrl);
      const isReddit = /reddit\.com|redd\.it/i.test(historyUrl);
      const isBooru = /xbooru\.com|tbib\.org|hypnohub\.net/i.test(historyUrl);
      const isRedgifs = /redgifs\.com/i.test(historyUrl);
      const adultKind = isEporner ? "eporner" : isRedtube ? "redtube" : isChaturbate ? "chaturbate" : isMfc ? "myfreecams" : isReddit ? "reddit" : isBooru ? "booru" : isRedgifs ? "redgifs" : null;
      if (!adult && (isEporner || isRedtube || isChaturbate || isMfc || isReddit || isBooru || isRedgifs)) return null;
      // The Adult history shelf is deliberately strict. Unknown recovered URLs
      // belong to public history until they carry a known Adult source, so a
      // generic or stale record can never leak into the private Adult page.
      if (adult && !adultKind) return null;
      const signature = `${h.at}:${h.url}:${h.position ?? ""}:${h.duration ?? ""}:${h.title ?? ""}`;
      const cachedRecovery = historyRecoveryCardCache.get(h.id);
      if (cachedRecovery?.signature === signature) return cachedRecovery.video;
      const recovered = {
        id: h.id,
        folderId: adultKind ? `history:recovery:${adultKind}` : "history:recovery",
        name: h.title?.trim() || (isYoutube ? "Saved YouTube history" : isTwitch ? "Saved Twitch history" : adultKind ? `Saved ${adultKind} history` : "Saved playback history"),
        path: h.url ?? h.id,
        src: h.url,
        extension: isYoutube ? "yt" : isTwitch ? "vod" : adultKind ?? "history",
        mime: isYoutube ? "video/youtube" : isTwitch ? "video/twitch" : adultKind ? `video/${adultKind}` : "video/history",
        size: 0,
        duration: h.duration,
        addedAt: h.at,
        poster: h.poster,
        tagline: h.title ? "Saved from watch history." : "Original card is not cached right now. The saved link is retained for recovery.",
        remote: isYoutube || isTwitch || adultKind ? {
          kind: isYoutube ? "youtube" : isTwitch ? "twitch" : adultKind!,
          live: false,
          embedUrl: h.url,
          watchUrl: h.url,
        } : undefined,
      } as LibraryVideo;
      historyRecoveryCardCache.set(h.id, { signature, video: recovered });
      // History itself is intentionally limitless; this render-only cache is
      // bounded so an old provider link cannot keep every past card in memory.
      if (historyRecoveryCardCache.size > 1_500) historyRecoveryCardCache.delete(historyRecoveryCardCache.keys().next().value!);
      return recovered;
    };
  return (entry: HistoryEntry) => {
      const v = resolve(entry);
      if (!v || resolvedIds.has(v.id)) return null;
      resolvedIds.add(v.id);
      return v;
    };
}
function computeSelectHistory(state: LibraryState, adult = false): LibraryVideo[] {
  const resolve = historyResolver(state, adult, activityLookup(state.videos, historyLookupKeys(state.history)));
  return state.history.map(resolve).filter((v): v is LibraryVideo => Boolean(v));
}

export function selectEporner(state: LibraryState): LibraryVideo[] {
  return state.videos
    .filter((v) => v.remote?.kind === "eporner" || v.folderId === EPORNER_FOLDER_ID)
    .sort((a, b) => b.addedAt - a.addedAt);
}

export function selectRedtube(state: LibraryState): LibraryVideo[] {
  return state.videos
    .filter((v) => v.remote?.kind === "redtube" || v.folderId === REDTUBE_FOLDER_ID)
    .sort((a, b) => b.addedAt - a.addedAt);
}

/** Combined official adult pull shelves (Eporner + RedTube). */
function computeSelectAdultRemote(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  if (memo.adultRemote) return memo.adultRemote;
  const matching = state.videos
    .filter(
      (v) =>
        v.remote?.kind === "eporner" ||
        v.remote?.kind === "redtube" ||
        v.remote?.kind === "chaturbate" ||
        v.remote?.kind === "myfreecams" ||
        v.remote?.kind === "reddit" ||
        v.remote?.kind === "booru" ||
        v.remote?.kind === "redgifs" ||
        (ADULT_FOLDER_IDS as readonly string[]).includes(v.folderId),
    )
    .filter((video) => !state.unavailable[video.id] && !isRemovedRedditVideo(video) && !state.hiddenVideos[video.id] && (state.showHiddenAdult || !(state.tags[video.id] ?? []).includes("hidden")));
  memo.adultRemote = dedupeAdultVideoCards([...new Map(matching.map((video) => [video.id, video])).values()])
    .sort((a, b) => b.addedAt - a.addedAt);
  return memo.adultRemote;
}

function computeSelectYoutube(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  if (memo.youtube) return memo.youtube;
  const previous = youtubeSelectorSnapshot;
  const privateFolders = adultIdSet(state.folders);
  const sameVisibility = previous
    && previous.privateFolders === privateFolders
    && previous.unavailable === state.unavailable
    && previous.hiddenVideos === state.hiddenVideos
    && previous.hideDemo === state.hideDemo;
  let result: LibraryVideo[];
  if (sameVisibility && previous.videos === state.videos) return previous.result;
  const updated = sameVisibility ? updateYoutubeShelf(previous.videos, state.videos, previous.result, video =>
    !state.unavailable[video.id] && !state.hiddenVideos[video.id]
    && !videoIsPrivate(privateFolders,video) && !(state.hideDemo && video.isSample)) : undefined;
  result = updated ?? state.videos.filter(video => video.remote?.kind === "youtube"
    && !state.unavailable[video.id] && !state.hiddenVideos[video.id]
    && !videoIsPrivate(privateFolders,video) && !(state.hideDemo && video.isSample))
    .sort(compareYoutubePublication);
  memo.youtube = result;
  youtubeSelectorSnapshot = {
    videos: state.videos, privateFolders, unavailable: state.unavailable,
    hiddenVideos: state.hiddenVideos, hideDemo: state.hideDemo, result,
  };
  return result;
}

function computeSelectTwitch(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  if (memo.twitch) return memo.twitch;
  const twitch = publicList(state).filter((v) => v.remote?.kind === "twitch");
  const live = twitch.filter((v) => v.remote?.live);
  const vods = twitch.filter((v) => !v.remote?.live);
  memo.twitch = [...live, ...vods];
  return memo.twitch;
}

function computeSelectLive(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  return memo.live ?? (memo.live = publicList(state).filter((v) => v.remote?.live));
}

function computeSelectClassics(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  return memo.classics ?? (memo.classics = publicList(state).filter((v) => !v.remote && isClassicVideo(v)));
}

export function selectFeatured(state: LibraryState, adult = false): LibraryVideo | undefined {
  const cont = selectContinue(state, adult);
  if (cont[0]) return cont[0];
  const pool = adult ? scoped(state, true) : [...selectClassics(state), ...publicList(state).filter((video) => !video.remote && !isClassicVideo(video))];
  if (!pool.length) return undefined;
  const day = Math.floor(Date.now() / 86_400_000);
  return pool[day % pool.length];
}

export function userFolderCount(folders: Folder[]) {
  return folders.filter((f) => f.kind !== "demo").length;
}

// These dependency lists are the cache invalidation contract. Keep UI and
// playback-only fields out of catalog selectors. Store slices are immutable.
const publicList = memoizeSelector(computePublicList, ["videos", "folders", "unavailable", "hiddenVideos", "hideDemo"]);

const adultList = memoizeSelector(computeAdultList, ["videos", "folders", "unavailable", "hiddenVideos", "tags", "showHiddenAdult"]);

export const selectAdultRemote = memoizeSelector(computeSelectAdultRemote, ["unavailable", "videos", "hiddenVideos", "tags", "showHiddenAdult"]);

export const selectFavorites = memoizeSelector(computeSelectFavorites, ["videos", "folders", "hideDemo", "hiddenVideos", "favorites", "likes"]);

export async function prepareFavoritesSelection(state: LibraryState, signal: AbortSignal, yieldTask = yieldCatalogTask) {
  const cached = selectFavorites.peek(state);
  const privateCached = selectFavorites.peek(state, true);
  if (cached && privateCached) return cached;
  const turn = async () => { signal.throwIfAborted(); await yieldTask(); signal.throwIfAborted(); };
  const privateFolders = adultIdSet(state.folders);
  const result = cached ?? await selectSavedCardsAsync(state.videos, state.favorites, state.likes, privateFolders, false, state.hiddenVideos, state.hideDemo, turn);
  const privateResult = privateCached ?? await selectSavedCardsAsync(state.videos, state.favorites, state.likes, privateFolders, true, state.hiddenVideos, state.hideDemo, turn);
  signal.throwIfAborted();
  selectFavorites.prime(state, result);
  selectFavorites.prime(state, privateResult, true);
  return result;
}

export const selectHistory = memoizeSelector(computeSelectHistory, ["videos", "folders", "hideDemo", "hiddenVideos", "history"]);

export const selectContinue = memoizeSelector(computeSelectContinue, ["videos", "folders", "hideDemo", "hiddenVideos", "history", "progress", "resumeProgress"]);

/** Recovery and alias resolution share the same rules as ordinary selectors,
 * but every large phase runs outside input and yields before publishing. */
export async function prepareHistorySelection(state: LibraryState, signal: AbortSignal, yieldTask = yieldCatalogTask, adult = false) {
  const cached = selectHistory.peek(state, adult);
  if (cached) return cached;
  const turn = async () => { signal.throwIfAborted(); await yieldTask(); signal.throwIfAborted(); };
  const matches = await activityLookupAsync(state.videos, historyLookupKeys(state.history), turn);
  const resolve = historyResolver(state, adult, matches), result: LibraryVideo[] = [];
  await forEachCatalogSlice(state.history, entry => { const video = resolve(entry); if (video) result.push(video); }, turn);
  signal.throwIfAborted();
  selectHistory.prime(state, result, adult);
  return result;
}

export async function prepareContinueSelection(state: LibraryState, signal: AbortSignal, yieldTask = yieldCatalogTask, adult = false) {
  const cached = selectContinue.peek(state, adult);
  if (cached) return cached;
  const turn = async () => { signal.throwIfAborted(); await yieldTask(); signal.throwIfAborted(); };
  function* directIds() {
    for (const row of sparseRecordScan(state.progress)) yield row?.[0];
    for (const row of sparseRecordScan(state.resumeProgress)) yield row?.[0].startsWith('id:') ? row[0].slice(3) : undefined;
  }
  function* aliases() {
    for (const row of sparseRecordScan(state.resumeProgress)) yield row && !row[0].startsWith('id:') ? row[0] : undefined;
  }
  const privateFolders = adultIdSet(state.folders);
  const watched = adult && !privateFolders.size ? [] : await activityCandidatesAsync(state.videos, aliases(), directIds(), turn);
  const marks = new Map<string, ResumeMark>();
  const recordMark = (id: string, mark: ResumeMark | undefined) => {
    if (!mark || !Number.isFinite(mark.t) || !Number.isFinite(mark.d) || mark.t < 2 || mark.d <= 0 || mark.t / mark.d >= 0.992) return;
    const previous = marks.get(id);
    if (!previous || mark.at > previous.at) marks.set(id, mark);
  };
  const visible = (video: LibraryVideo) => !(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === videoIsPrivate(privateFolders,video);
  await forEachCatalogSlice(watched, video => { if (visible(video)) recordMark(video.id, resumeForVideo(state, video)); }, turn);
  await forEachCatalogSlice(state.history, entry => {
    if (!state.hiddenVideos[entry.id] && entry.position && entry.duration && entry.position >= 2 && entry.position / entry.duration < 0.992)
      recordMark(entry.id, { t: entry.position, d: entry.duration, at: entry.at });
  }, turn);
  const history = await prepareHistorySelection(state, signal, yieldTask, adult);
  const seen = new Set<string>(), times = new Map<LibraryVideo, number>(), result: LibraryVideo[] = [];
  function* candidates() { for (const video of watched) if (visible(video)) yield video; yield* history; }
  await forEachCatalogEntry(candidates(), video => {
    if (seen.has(video.id)) return;
    seen.add(video.id);
    const mark = marks.get(video.id) ?? resumeForVideo(state, video);
    if (isResumable(video, mark)) { result.push(video); times.set(video, mark?.at ?? 0); }
  }, turn);
  const sorted = await sortCatalogRows(result, (a, b) => times.get(b)! - times.get(a)!, turn);
  signal.throwIfAborted();
  selectContinue.prime(state, sorted, adult);
  return sorted;
}

export async function prepareRecoveryBrowse(state: LibraryState, signal: AbortSignal, turn = yieldCatalogTask) {
  const selected = state.sourceId === 'continue'
    ? await prepareContinueSelection(state, signal, turn)
    : await prepareHistorySelection(state, signal, turn);
  await prepareHistorySelection(state, signal, turn, true);
  await prepareContinueSelection(state, signal, turn, true);
  if (!selectVisible.peek(state)) {
    const visible = state.sourceId === 'history' ? selected
      : await sortCatalogRows(await copyCatalogArray(selected, turn), visibleVideoOrder(state), turn);
    signal.throwIfAborted();
    selectVisible.prime(state, visible);
  }
}

export const selectVisible = memoizeSelector(computeSelectVisible, state => {
  const keys: (keyof LibraryState)[] = ["videos", "folders", "hideDemo", "unavailable", "hiddenVideos", "sourceId", "query", "sort"];
  if (state.sourceId === "adults" || state.sourceId === "adult-fetishes") keys.push("tags", "showHiddenAdult");
  if (state.query.trim()) keys.push("searchResult", "tags", "categories");
  if (state.sourceId === "favorites") keys.push("favorites", "likes");
  if (state.sourceId === "movies") keys.push("likes","tags");
  if (state.sourceId === "history" || state.sourceId === "continue") keys.push("history");
  if (state.sourceId === "continue") keys.push("progress", "resumeProgress");
  else if (state.sort === "recent" && state.sourceId !== "history") keys.push("progress");
  return keys;
});

/** The optional private desk uses the exact ordinary visibility/identity rules,
 * but never filters, merges or sorts a full archive on the initiating click. */
export async function preparePrivateSelection(state: LibraryState, signal: AbortSignal, yieldTask = yieldCatalogTask) {
  if (state.sourceId !== 'adults' || state.query.trim()) throw new Error('Private shelves require the private desk without a search.');
  const cached = selectVisible.peek(state);
  if (cached) return cached;
  const turn = async () => { signal.throwIfAborted(); await yieldTask(); signal.throwIfAborted(); };
  let selected = adultList.peek(state);
  if (!selected) {
    const folders = adultIdSet(state.folders), rows: LibraryVideo[] = [], identities = new Map<string, number>();
    await forEachCatalogSlice(state.videos, video => {
      if (state.unavailable[video.id] || isRemovedRedditVideo(video) || state.hiddenVideos[video.id]
        || !videoIsPrivate(folders,video)
        || RETIRED_ADULT_SOURCE_IDS.includes((video.remote?.kind ?? video.folderId.split(':')[0]) as 'camsoda')
        || !state.showHiddenAdult && (state.tags[video.id] ?? []).includes('hidden')) return;
      const key = adultMediaIdentity(video), previous = key ? identities.get(key) : undefined;
      if (previous != null) rows[previous] = mergeAdultDuplicate(rows[previous]!, video);
      else { if (key) identities.set(key, rows.length); rows.push(video); }
    }, turn, 4096);
    signal.throwIfAborted();
    selected = rows; adultList.prime(state, rows); memoFor(state).adult = rows;
  }
  const result = await sortCatalogRows(await copyCatalogArray(selected, turn), visibleVideoOrder(state), turn, 16384);
  signal.throwIfAborted(); selectVisible.prime(state, result);
  return result;
}

export const selectYoutube = memoizeSelectorInputs(computeSelectYoutube, (state: LibraryState) =>
  [state.videos, adultIdSet(state.folders), state.unavailable, state.hiddenVideos, state.hideDemo]);

/** Navigation prepares the exact selector result cooperatively, before any
 * subscribed component can trigger a synchronous cold catalog filter/sort. */
export async function prepareYoutubeSelection(state: LibraryState, signal: AbortSignal, yieldTask = yieldCatalogTask) {
  const cached = selectYoutube.peek(state);
  if (cached) return cached;
  const privateFolders = adultIdSet(state.folders);
  const previous = youtubeSelectorSnapshot;
  const sameVisibility = previous && previous.privateFolders === privateFolders
    && previous.unavailable === state.unavailable && previous.hiddenVideos === state.hiddenVideos && previous.hideDemo === state.hideDemo;
  const updated = sameVisibility ? await updateYoutubeShelfAsync(previous.videos, state.videos, previous.result, video =>
    !state.unavailable[video.id] && !state.hiddenVideos[video.id] && !videoIsPrivate(privateFolders,video)
    && !(state.hideDemo && video.isSample), signal, yieldTask) : undefined;
  const result = updated ?? await youtubeCatalogSelection({ videos: state.videos, privateFolders,
    unavailable: state.unavailable, hiddenVideos: state.hiddenVideos, hideDemo: state.hideDemo }, signal, yieldTask);
  signal.throwIfAborted();
  selectYoutube.prime(state, result);
  memoFor(state).youtube = result;
  youtubeSelectorSnapshot = { videos: state.videos, privateFolders, unavailable: state.unavailable,
    hiddenVideos: state.hiddenVideos, hideDemo: state.hideDemo, result };
  return result;
}

export const selectTwitch = memoizeSelector(computeSelectTwitch, ["videos", "folders", "unavailable", "hiddenVideos", "hideDemo"]);

export const selectLive = memoizeSelector(computeSelectLive, ["videos", "folders", "unavailable", "hiddenVideos", "hideDemo"]);

export const selectClassics = memoizeSelector(computeSelectClassics, ["videos", "folders", "unavailable", "hiddenVideos", "hideDemo"]);

const catalogSelectors = [publicList, adultList, selectAdultRemote, selectFavorites, selectHistory,
  selectContinue, selectVisible, selectYoutube, selectTwitch, selectLive, selectClassics];
export function clearCatalogSelectorCaches() {
  for (const selector of catalogSelectors) selector.clear();
  selectorMemo = new WeakMap();
  youtubeSelectorSnapshot = undefined;
}
/** Idle cleanup releases other desks without invalidating the arrays currently
 * on screen. Clearing active selectors immediately rebuilt/sorted them in the
 * next store notification, defeating cleanup and blocking the first new click. */
export function trimCatalogSelectorCaches(state = useLibrary.getState()) {
  const keep = new Set<(typeof catalogSelectors)[number]>();
  const source = state.sourceId, privateDesk = source === 'adults' || source === 'adult-fetishes';
  const add = (...selectors: (typeof catalogSelectors)[number][]) => selectors.forEach(selector => keep.add(selector));
  if (state.query.trim() || source !== 'home' && !HUB_SOURCES.has(source)) add(selectVisible);
  if (state.query.trim()) add(privateDesk ? adultList : publicList);
  if (source === 'landing') add(...catalogSelectors.filter(selector => selector !== adultList && selector !== selectAdultRemote));
  else if (source === 'youtube') add(selectYoutube);
  else if (source === 'favorites') add(selectFavorites);
  else if (source === 'continue' || source === 'history') add(selectContinue, selectHistory);
  else if (privateDesk) add(adultList, selectAdultRemote, selectFavorites, selectContinue, selectHistory);
  else if (source !== 'home' && !HUB_SOURCES.has(source)) {
    add(publicList);
    if (source === 'twitch') add(selectTwitch);
    if (source === 'live') add(selectLive);
    if (source === 'movies' || source === 'classics') add(selectClassics);
    if (source === 'movies') add(selectContinue, selectHistory);
  }
  for (const selector of catalogSelectors) {
    if (keep.has(selector)) selector.evictStale(state);
    else selector.clear();
  }
  const activitySelectors = [selectFavorites, selectContinue, selectHistory];
  if (privateDesk) for (const selector of activitySelectors) selector.clear(false);
  else if (!['favorites', 'continue', 'history'].includes(source)) for (const selector of activitySelectors) selector.clear(true);
  selectorMemo = new WeakMap();
  if (!keep.has(selectYoutube)) youtubeSelectorSnapshot = undefined;
}
// Inactive desks must not pin old catalog/card/tag generations indefinitely.
// Invalidating checks only a handful of references; it never computes a list.
const stopSelectorEviction = useLibrary.subscribe((state, previous) => {
  if (state.videos === previous.videos && state.tags === previous.tags && state.folders === previous.folders
    && state.categories === previous.categories && state.hiddenVideos === previous.hiddenVideos) return;
  for (const selector of catalogSelectors) selector.evictStale(state);
});
import.meta.hot?.dispose(stopSelectorEviction);

const stopEnrichmentViewer = useLibrary.subscribe((state, previous) => {
  if (state.activeId !== previous.activeId || state.previewId !== previous.previewId || state.query !== previous.query)
    setEnrichmentViewerOpen(Boolean(state.activeId || state.previewId), Boolean(state.query.trim()));
});
import.meta.hot?.dispose(stopEnrichmentViewer);

/** User-initiated retry; never flush an unhydrated empty snapshot over saved state. */
export async function retryLibraryPersistence(){
  if(restoreCompletion)await restoreCompletion;
  if(!preferencesRestored || !useLibrary.getState().hydrated)throw new Error("Wait for the saved library to finish loading before retrying.");
  await recoverCatalogMutations();
  durableSliceWriter.reset();persistNow(useLibrary.getState);
  await Promise.all([waitForDurableWrites(),waitForPrefsWrites(),waitForFollowsWrites()]);
  const state=useLibrary.getState();
  await saveRemoteSnapshot({videos:state.videos.filter(video=>video.remote&&!video.isSample),metadata:{tags:state.tags,metadataProvenance:state.metadataProvenance},folders:[],checkedAt:0},false,true);
}


/** Rebase compact cross-tab invalidations through existing paged disk readers.
 * No provider opens and no preference/follow snapshot is written here. */
export async function rebaseSharedCatalog(){
 if(restoreCompletion)await restoreCompletion;
 if(!useLibrary.getState().hydrated)throw Error('Wait for library recovery before refreshing another tab’s changes.');
 if(useLibrary.getState().scanning)throw Error('Wait for this tab’s local import to finish before refreshing shared catalog changes.');
 return withCatalogRead(async()=>{
  await recoverCatalogMutations();
  for(let attempt=0;attempt<3;attempt++){
   const base=useLibrary.getState();
   const [local,snapshot,dirs]=await Promise.all([loadCatalogVideos(),loadRemoteSnapshot(),loadDirHandles()]);
   const disk=await mergeRemoteCatalogAsync(local,snapshot?.videos??[]),ids=new Set<string>(),cards:LibraryVideo[]=[],counts=new Map<string,number>(),knownIds=new Set<string>();let deferredLocal=false;
   await forEachCatalogSlice(base.videos,row=>{knownIds.add(row.id);},yieldCatalogTask);
   await forEachCatalogSlice(disk,row=>{if(!row.remote&&!knownIds.has(row.id)){deferredLocal=true;return;}ids.add(row.id);cards.push(catalogCard(row));counts.set(row.folderId,(counts.get(row.folderId)??0)+1);},yieldCatalogTask);
   const retained:LibraryVideo[]=[];await forEachCatalogSlice(base.videos,row=>{if(row.isSample||ids.has(row.id))retained.push(row);},yieldCatalogTask);
   const videos=await mergeRemoteCatalogAsync(retained,cards);
   const metadata=await restoreCatalogMetadata({tags:base.tags,metadataProvenance:base.metadataProvenance,categories:base.categories});
   const current=useLibrary.getState();if(current.videos!==base.videos||current.tags!==base.tags||current.metadataProvenance!==base.metadataProvenance||current.categories!==base.categories)continue;
   const directoryIds=new Set(dirs.map(row=>row.id));const folders=base.folders.filter(folder=>folder.kind!=="directory"||directoryIds.has(folder.id)||counts.has(folder.id)).map(folder=>folder.kind==="demo"?folder:{...folder,videoCount:counts.get(folder.id)??0});
   useLibrary.setState({...metadata,videos,youtubeCleanup:snapshot?.youtubeCleanup??base.youtubeCleanup,remoteCheckedAt:Math.max(base.remoteCheckedAt,snapshot?.checkedAt??0),
    folders:snapshot?[...folders.filter(folder=>folder.kind!=='youtube'&&folder.kind!=='twitch'),...snapshot.folders]:folders});
   return {deferredLocal};
  }
  throw Error('This tab is still changing. Retry the cross-tab refresh after current work settles.');
 });
}
