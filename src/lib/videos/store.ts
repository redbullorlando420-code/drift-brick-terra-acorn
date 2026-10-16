import { youtubeTextTags, refreshYoutubeTags, YOUTUBE_TEXT_TAG_VERSION } from './youtube-text-tags';
import { decodeTwitchArchiveCursor } from './twitch-archive-cursor';
import { isRemovedRedditVideo } from './reddit-removed';
import { selectSavedCards, selectSavedCardsAsync } from "./saved-library";
import { updateYoutubeShelf } from "./youtube-shelf";
import { youtubePublicationTime } from './youtube-metadata';
import { memoizeSelector, memoizeSelectorInputs } from "./selector-cache";
import { HUB_SOURCES } from '../library-navigation';
import { catalogPullAvailable, waitForPulls, setPullViewerOpen, getPullCancellationRevision, pullsPaused, waitForCatalogCommit } from "@/lib/pull-control";
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
  type AdultPullProvider,
} from "./adult-sites";
import { loadAdultArchiveCursors, saveAdultArchiveCursors, recordAdultArchiveFailure } from "./adult-archive-cursors";
import { adultFolderIds } from './adult-providers';
import { applyCachedAdultUrls, cacheAdultVideoUrls } from "./adult-url-cache";
import { redditIngestExtras } from "./adult-reddit-tags";
import {
  findFreshAdultPullFingerprint,
  rememberAdultPullFingerprint,
} from "@/lib/remote/adult-pull-cache";
import { mergeRemoteCatalog, prepareIndexedRemoteCatalog, prepareRefreshSavedIds, mergeRemoteRefreshAsync, remoteVideoIndexAsync, mergeRemoteCatalogAsync } from "./remote-merge";
import { entryGroup, admitRemoteEntries, holdEntryLimitCursors, remoteEntryCounts, remainingEntrySlots, rememberEntryCounts } from './entry-limits';
import { CLEANUP_GROUPS, adultAdmissionPolicy, cleanupBudgets, cleanupBudgetAvailable, consumeCleanupBudget, canRotateForGroup, replacementRequestBudget, cleanupLabel, cleanupPolicy, rotationAvailable, cleanupKey, cleanupSourceKeys, emptyYoutubeCleanup, planYoutubeCleanup, recordYoutubeCleanup, retiredYoutubeKeys, youtubeCleanupProtected, type CleanupBudgets, type CleanupGroup, type YoutubeCleanupJournal } from './youtube-cleanup';
import { canonicalFollowHandle, dedupeFollows, mergeResolvedFollow } from "./follow-identity";
import { importedFollowStub, repairYoutubeImport, resolvedFollowQueries, reviewYoutubeImport, bindYoutubeCorrection } from './follow-import';
import { selectTwitchRefreshBatch } from './twitch-refresh-selection';
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
  removeRemoteSnapshotVideos,
  saveRemoteSnapshot,
  saveYoutubeCleanup,
  clearFolderVideos,
  deleteDirHandle,
  loadCatalogVideos,
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
  saveTagEdit,
  restoreTagEdits,
  saveMetadataEdit,
  restoreMetadataEdits,
  saveEnrichmentRows,
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
import { scheduledYoutubeSources } from '@/lib/remote/background-refresh';
import { selectYoutubeFeedChannels } from '@/lib/remote/youtube-sweep';
import { resolveCreatorCoverage } from "./creator-coverage";
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

export type CreatorCoverageRepairResult = {
  processed: number;
  repaired: number;
  tagged: number;
  remaining: number;
};

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
  releaseVideoComments: () => void;
  autoTagLibrary: () => Promise<number>;
  /** Apply the next small cache-only metadata batch, retaining all manual locks. */
  enrichMetadataTail: () => Promise<MetadataTailResult>;
  repairCachedMetadata: () => void;
  /** Backfill a missing creator name only from an exact saved provider identifier. */
  repairCreatorCoverage: () => CreatorCoverageRepairResult;
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
  followRemoteQuery: (query: string, kind?: "auto" | "youtube" | "twitch", opts?: { clipLimit?: number; twitchVodLimit?: number; correctFollowId?: string }) => Promise<void>;
  importBatch: (
    items: { query: string; kind: "youtube" | "twitch" }[],
  ) => Promise<{ ok: number; failed: number; failedQueries: string[]; failedReasons: Record<string, string> }>;
  unfollow: (id: string) => void;
  unfollowMany: (ids: string[]) => void;
  updateFollowProfiles: (profiles: Array<{ id: string; thumb?: string; description?: string }>) => void;
  refreshFollows: (kind?: "twitch" | "youtube", options?: { catalog?: boolean; force?: boolean; scheduled?: boolean; youtubeLiveOnly?: boolean; twitchLiveOnly?: boolean; twitchRoutine?: boolean; channelIds?: string[] }) => Promise<RefreshFollowsResult>;
  pushNotice: (n: Omit<AppNotice, "id" | "at" | "read">) => void;
  markNoticesRead: () => void;
  setNotifyPush: (on: boolean) => void;
  markUnavailable: (id: string, reason: string) => void;
};

let preferencesRestored = false;
let savedShelfRevision = 0;
const durableSliceWriter = new SliceWriter();
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
    if (key && !positions.has(key)) positions.set(key, index);
  }
  return mergeRemoteCatalog(existing, incoming.map(catalogCard), positions, []);
}

async function cacheRemotes(get: () => LibraryState, changedVideos?: LibraryVideo[], alreadyMerged = false) {
  const s = get();
  const index = changedVideos && !alreadyMerged ? await remoteVideoIndexAsync(s.videos) : null;
  return saveRemoteSnapshot({
    // Persist the merged card, not the provider's partial row: a shallow
    // refresh must not erase previously fetched comments or repaired tags.
    videos: changedVideos ? changedVideos.flatMap(video => {
      if (alreadyMerged) return [video];
      const card = index!.get(video.id) ?? index!.get(youtubeVideoKey(video) ?? video.id);
      return card ? [alreadyMerged ? video : withCatalogDetails(card, video)] : [];
    }) : s.videos.filter(video => video.remote && !video.isSample),
    folders: s.folders.filter((f) => f.kind === "youtube" || f.kind === "twitch"),
    checkedAt: s.remoteCheckedAt,
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
  const previousSources = existing?.tags ?? {};
  const tags = Object.fromEntries(nextTags.map((tag) => [tag, previousSources[tag] ?? (inferredSet.has(tag) ? source : "legacy")] as const));
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
    await forEachCatalogSlice(admission.videos, video => {
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
  if (video.remote?.kind === 'youtube') return youtubeTextTags(video).tags;
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
  return adultIdSet(folders).has(video.folderId);
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
  releaseVideoComments: () => {
    viewerDetails.releaseComments();
  },
  setVideoTags: (id, tags) => {
    const manualTags = [...new Set(tags.map(normalizeTagValue).filter(Boolean))].slice(0, 18);
    set((s) => ({
      tags: patchSparseRecord(s.tags, [[id, manualTags]]),
      metadataProvenance: patchSparseRecord(s.metadataProvenance, [[id,
        { ...s.metadataProvenance[id], tags: Object.fromEntries(manualTags.map((tag) => [tag, "manual"] as const)), lockedFields: [...new Set([...(s.metadataProvenance[id]?.lockedFields ?? []), "tags"])] as Array<"tags" | "category">, updatedAt: Date.now() }]]),
    }));
    const state = get();
    saveTagEdit(id, state.tags[id] ?? []);
    saveMetadataEdit(id, state.metadataProvenance[id] ?? { tags: {}, lockedFields: ["tags"] });
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
    saveTagEdit(id, state.tags[id] ?? []);
    saveMetadataEdit(id, state.metadataProvenance[id] ?? { tags: {} });
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
  repairCreatorCoverage: () => {
    const state = get();
    const candidates = state.videos.flatMap((video) => {
      const resolution = resolveCreatorCoverage(video, state.follows);
      return resolution.status === "resolved" ? [{ video, channelName: resolution.channelName }] : [];
    });
    const batch = candidates.slice(0, LIBRARY_LIMITS.creatorCoverageRepairBatchSize);
    if (!batch.length) return { processed: 0, repaired: 0, tagged: 0, remaining: 0 };

    const repairs = new Map(batch.map((candidate) => [candidate.video.id, candidate.channelName]));
    const repairedById = new Map<string, LibraryVideo>();
    const videos = state.videos.map((video) => {
      const channelName = repairs.get(video.id);
      const repaired = channelName && video.remote ? { ...video, remote: { ...video.remote, channelName } } : video;
      if (channelName && repaired !== video) repairedById.set(video.id, repaired);
      return repaired;
    });
    const tags = { ...state.tags };
    const metadataProvenance = { ...state.metadataProvenance };
    let tagged = 0;
    for (const { video } of batch) {
      const repaired = repairedById.get(video.id) ?? video;
      if (tagsLocked(metadataProvenance[video.id])) continue;
      // This focused repair deliberately contributes only creator attribution.
      // Metadata-tail coverage handles descriptions and other provider tags in
      // its own separately visible batch.
      const inferred = remoteMetadataTags(repaired).filter((tag) => tag.startsWith("creator-"));
      if (!inferred.length) continue;
      const existing = tags[video.id] ?? [];
      const compact = compactIngestedTags(existing, inferred);
      const nextProvenance = mergeInferredTagProvenance(existing, compact, metadataProvenance[video.id], inferred, `provider:${repaired.remote!.kind}`);
      if (!sameTags(existing, compact)) {
        tags[video.id] = compact;
        tagged += 1;
      }
      if (JSON.stringify(nextProvenance) !== JSON.stringify(metadataProvenance[video.id])) {
        metadataProvenance[video.id] = nextProvenance;
      }
    }
    set({ videos, tags, metadataProvenance });
    // This is an explicit user action that changes remote card metadata. Save
    // it immediately so a reload cannot discard an exact-ID repair.
    cacheRemotes(get);
    persistNow(get);
    return {
      processed: batch.length,
      repaired: batch.length,
      tagged,
      remaining: Math.max(0, candidates.length - batch.length),
    };
  },
  setVideoCategory: (id, category) => {
    set((s) => ({
      categories: { ...s.categories, [id]: category.trim().slice(0, 40) },
      metadataProvenance: patchSparseRecord(s.metadataProvenance, [[id, { ...s.metadataProvenance[id], tags: s.metadataProvenance[id]?.tags ?? {}, category: "manual", lockedFields: [...new Set([...(s.metadataProvenance[id]?.lockedFields ?? []), "category"])] as Array<"tags" | "category">, updatedAt: Date.now() }]]),
    }));
    const state = get();
    saveTagEdit(id, state.tags[id] ?? []);
    saveMetadataEdit(id, state.metadataProvenance[id] ?? { tags: {}, lockedFields: ["category"] });
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
    // A microtask still runs before paint. History follows the interaction
    // lease so player/iframe mounting gets the foreground frame first.
    setPullViewerOpen(true);
    set({ activeId, previewId: null });
    if (typeof window === 'undefined') get().recordPlay(activeId);
    else openedPlays.push(activeId);
  },
  openPreview: (previewId, card) => {
    if (card?.id === previewId) rememberVideo(get().videos, card);
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
    const cursors = loadAdultArchiveCursors(query, order);
    let received = 0, added = 0, done = 0, carryBudget = 0;
    const diagnostics: AdultPullDiagnostic[] = [];
    const counts = new Map<string, number>();
    // Yield a real browser task, then respect the shared pull gate. A resolved
    // promise alone would keep all preparation in one blocking microtask chain.
    const turn = async () => {
      await yieldCatalogTask();
      await waitForCatalogCommit(cancellation);
    };
    get().beginPull({ id: pullId, provider: 'adult', action: 'Catalog pull', startedAt, targets, done, total: providerList.length, received, added, failed: 0 });
    set({ remoteBusy: true, adultPullStatus: null, importProgress: { done: 0, total: providerList.length, label: 'Starting paced Adult pull…' } });
    try {
      for (const [index, provider] of providerList.entries()) {
        if (getPullCancellationRevision() !== cancellation) break;
        const providerAddedBefore = added;
        const currentCounts = await remoteEntryCounts(get().videos), currentPolicy = policyFor(getPullSettings());
        const available = replacementRequestBudget(currentCounts, currentPolicy, 'adult', cleanupRemaining);
        if (!available) break;
        const budget = Math.min(available, adultProviderPullBudget(maxVideos, providerList.length, index, carryBudget));
        carryBudget = 0;
        if (!budget) continue;
        const saved = cursors[provider];
        const page = opts?.providerPages?.[provider] ?? (opts?.resumeArchive === false ? opts?.page ?? 1 : saved?.page ?? opts?.page ?? 1);
        const offset = opts?.resumeArchive === false || (opts?.providerPages?.[provider] !== undefined && opts.providerPages[provider] !== saved?.page) ? 0 : saved?.offset ?? 0;
        set({ importProgress: { done, total: providerList.length, label: `Pulling ${provider} · page ${page} · up to ${budget} entries…` } });
        try {
          const walked = await walkAdultPull(budget, page, offset, async (nextPage, nextOffset, limit) => {
            set({ importProgress: { done, total: providerList.length, label: `Pulling ${provider} · page ${nextPage} · target ${budget.toLocaleString()} entries…` } });
            const response = await searchAdultVideos({ data: { query, order, page: nextPage, maxVideos: limit, append: true, providers: [provider], providerPages: { [provider]: nextPage }, providerOffsets: { [provider]: nextOffset }, redditSources: opts?.redditSources } });
            return { ...response, nextPage: response.providerNextPages[provider] ?? null, nextOffset: response.providerNextOffsets[provider] ?? 0 };
          }, turn);
          if (!walked.latest) {
            carryBudget += budget;
            done++;
            get().updatePull({ done, received, added, failed: diagnostics.filter(row => row.status === 'failed').length });
            continue;
          }
          const result = { ...walked.latest, videos: walked.videos,
            providerDiagnostics: walked.latest.providerDiagnostics.map(row => ({ ...row, titles: walked.videos.length, detail: `${walked.videos.length.toLocaleString()} entries across archive pages${walked.error ? ' · stopped after a provider error; saved results are retained' : ''}` })) };
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
            if (!admission.skipped) saveAdultArchiveCursors(query, order, result.providerNextPages, result.providerNextOffsets);
            if (!admission.skipped) carryBudget += budget;
            done++;
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
            await forEachCatalogSlice(videos, video => {
              const position = positions.get(video.id);
              if (position === undefined) {
                positions.set(video.id, nextVideos.length); nextVideos.push(catalogCard(video)); batchAdded++;
                counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1);
              } else nextVideos[position] = catalogCard(video);
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
          diagnostics.push(...result.providerDiagnostics);
          for (const diagnostic of result.providerDiagnostics) if (diagnostic.status === 'failed' && (ADULT_PULL_PROVIDERS as readonly string[]).includes(diagnostic.provider)) recordAdultArchiveFailure(query, order, diagnostic.provider as AdultPullProvider);
          if (!admission.skipped) saveAdultArchiveCursors(query, order, result.providerNextPages, result.providerNextOffsets);
          if (!admission.skipped) carryBudget += Math.max(0, budget - admission.added);
        } catch (error) {
          if (getPullCancellationRevision() !== cancellation) break;
          recordAdultArchiveFailure(query, order, provider);
          diagnostics.push({ provider, status: 'failed', titles: 0, detail: error instanceof Error ? error.message : String(error) });
          carryBudget += Math.max(0, budget - (added - providerAddedBefore));
        }
        done++;
        get().updatePull({ done, received, added, failed: diagnostics.filter(row => row.status === 'failed').length });
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (received) persistSoon(get);
      const failed = diagnostics.filter(row => row.status === 'failed');
      const cancelled = getPullCancellationRevision() !== cancellation;
      set({ adultPullStatus: { note: cancelled ? 'Pull cancelled. Accepted entries and archive resume points are saved.' : `${added.toLocaleString()} new entries · ${received.toLocaleString()} received. Archive pages are saved separately for each provider.`, diagnostics } });
      get().finishPull({ id: pullId, provider: 'adult', action: 'Catalog pull', startedAt, finishedAt: Date.now(), targets, done, total: providerList.length, received, added, failed: failed.length, status: cancelled ? 'partial' : failed.length ? received ? 'partial' : 'failed' : received ? 'success' : 'partial', errors: cancelled ? ['Pull cancelled. Accepted entries and archive resume points are saved.'] : failed.map(row => `${row.provider}: ${row.detail}`).slice(0, 12) });
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
  restoreFolders: async () => {
    if (get().hydrated || restoring) return;
    restoring = true;
    beginStartupPhase('preferences');
    set({ pullHistory: loadPullHistory() });
    await restoreDurablePrefs().catch(() => undefined);
    void hydrateDurableFeedback().catch(() => undefined);
    const dedicatedFollows = await restoreDurableFollows().catch(() => loadFollows() ?? []);
    const prefsState = applyPrefs({});
    Object.assign(prefsState, await restoreEnrichmentRows({ tags: prefsState.tags ?? {}, metadataProvenance: prefsState.metadataProvenance ?? {} }).catch(() => ({ tags: prefsState.tags ?? {}, metadataProvenance: prefsState.metadataProvenance ?? {} })));
    prefsState.tags = restoreTagEdits(prefsState.tags ?? {});
    prefsState.metadataProvenance = restoreMetadataEdits(prefsState.metadataProvenance ?? {});
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
    void Promise.all([
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
      set((s) => {
        let folders = s.folders;
        for (const source of photos.sources) {
          if (folders.some((folder) => folder.id === source.id)) {
            folders = folders.map((folder) => folder.id === source.id
              ? {
                  ...folder,
                  name: source.name || folder.name,
                  kind: source.kind,
                  ...(source.photoCount != null ? { photoCount: source.photoCount } : {}),
                  ...(source.lastCheckedAt != null ? { lastCheckedAt: source.lastCheckedAt } : {}),
                }
              : folder);
          } else {
            folders = [...folders, {
              id: source.id,
              name: source.name,
              kind: source.kind,
              videoCount: 0,
              photoCount: source.photoCount ?? 0,
              lastCheckedAt: source.lastCheckedAt,
              needsPermission: true,
              health: "permission-needed" as const,
            }];
          }
        }
        return { folders };
      });
    }).catch(() => undefined);
    restoring = false;
    // A pasted import list is a durable recovery queue. Resume every missing
    // entry—not only an entirely empty shelf—so partial Twitch imports keep
    // progressing across reloads without requiring “Load saved list now”.
    if (typeof window !== "undefined") {
      const recover = (kind: "twitch" | "youtube") => {
        try {
          const saved = JSON.parse(localStorage.getItem(`reelcase.import-history.${kind}`) ?? "[]") as unknown;
          if (!Array.isArray(saved) || !saved.length) return;
          const original = saved.filter((value): value is string => typeof value === "string" && Boolean(value.trim()));
          const repaired = kind === 'youtube' ? repairYoutubeImport(original, localStorage.getItem('reelcase.import-draft.youtube') ?? '') : null;
          const handles = repaired?.queries ?? original;
          if (repaired?.fragments.size) {
            try { localStorage.setItem('reelcase.import-history.youtube', JSON.stringify(handles)); } catch { /* A full mirror must not block durable follow recovery. */ }
            set({ follows: reviewYoutubeImport(get().follows, localStorage.getItem('reelcase.import-draft.youtube') ?? '') });
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
          const failures = new Map(get().follows.filter(channel => channel.kind === kind && channel.lastProviderFailure).map(channel => [canonicalFollowHandle(kind, channel.importQuery ?? channel.handle), channel.lastProviderFailure!]));
          return pendingHandles.filter(query => {
            const failure = failures.get(canonicalFollowHandle(kind, query));
            return !failure || Date.now() >= (failure.retryAt ?? failure.at + 60 * 60_000);
          }).slice(0, kind === 'youtube' ? 4 : 80).map(query => ({ query, kind }));
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
    const startedAt = Date.now();
    const pullId = makePullId();
    get().beginPull({ id: pullId, provider, action: "Creator video pull", startedAt, targets: [query], done: 0, total: 1, received: 0, added: 0, failed: 0 });
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
      requested = true;
      const fetched = await followRemote({ data: { query, kind, ...(opts?.clipLimit !== undefined ? { clipLimit: opts.clipLimit } : {}), ...(opts?.twitchVodLimit ? { twitchVodLimit: opts.twitchVodLimit } : {}), ...(knownYoutube && knownYoutube.catalogCursor ? { catalogCursor: knownYoutube.catalogCursor } : {}), ...(knownTwitch?.twitchArchiveCursor ? { twitchArchiveCursor: knownTwitch.twitchArchiveCursor } : {}), ...(knownTwitch?.twitchClipCursor ? { twitchClipCursor: knownTwitch.twitchClipCursor } : {}) } });
      const result = correction ? bindYoutubeCorrection(fetched, correction, query) : fetched;
      const received = result.videos.length;
      result.videos = await rotateRemotePull(get, result.videos, cleanupBudgets(getPullSettings()));
      let prepared = await prepareRemotePull(get, result.videos, undefined, true);
      while (get().videos !== prepared.base.videos || get().tags !== prepared.base.tags || get().metadataProvenance !== prepared.base.metadataProvenance || getPullSettings() !== prepared.admission.settings) prepared = await prepareRemotePull(get, result.videos, undefined, true);
      result.videos = prepared.admission.videos;
      result.channel = holdEntryLimitCursors(get().follows, [result.channel], prepared.admission.skippedSources)[0];
      set((s) => {
        // Omitted clip positions mean clips were not requested. Preserve them;
        // explicit undefined archive positions still clear a completed shelf.
        const previous = s.follows.find(f => f.id === result.channel.id);
        const acceptedChannel = { ...previous, ...result.channel,
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
          remoteBusy: false,
        };
      });
      persistNow(get);
      void cacheRemotes(get, result.videos);
      const added = prepared.admission.added;
      const partialError = result.channel.lastProviderFailure?.message;
      get().finishPull({ id: pullId, provider, action: "Creator video pull", startedAt, finishedAt: Date.now(), targets: [result.channel.title || query], done: 1, total: 1, received, added, failed: 0, status: prepared.admission.skipped || partialError || !result.videos.length ? "partial" : "success", ...(prepared.admission.skipped || partialError ? { errors: [prepared.admission.skipped ? ENTRY_LIMIT_MESSAGE : partialError!] } : {}) });
      // A focused pull may add hundreds of old VODs. It updates its visible
      // creator card, not the notification center; bulk import emits one
      // completion summary after every requested channel has finished.
    } catch (err) {
      set({ remoteBusy: false });
      const cancelled = err instanceof Error && /^Pull cancelled\b/i.test(err.message);
      if (provider === 'twitch' && requested && !cancelled) {
        const message = (err instanceof Error ? err.message : String(err)).slice(0, 240);
        set(s => ({ follows: s.follows.map(channel => channel.kind === 'twitch' && canonicalFollowHandle('twitch', channel.handle) === canonicalFollowHandle('twitch', query)
          ? { ...channel, ...twitchRetryPatch(channel, 'archive', classifyTwitchFailure(err)), twitchArchiveDiagnostics: { at: Date.now(), pages: 0, received: 0, accepted: 0, duplicates: 0,
            resumed: Boolean(channel.twitchArchiveCursor), stage: decodeTwitchArchiveCursor(channel.twitchArchiveCursor).stage,
            stopReason: /integrity|challenge/i.test(message) ? 'challenge' as const : 'provider-error' as const, error: message } } : channel) }));
        saveFollows(get().follows);
      }
      get().finishPull({ id: pullId, provider, action: "Creator video pull", startedAt, finishedAt: Date.now(), targets: [query], done: cancelled ? 0 : 1, total: 1, received: 0, added: 0, failed: cancelled ? 0 : 1, status: cancelled ? "partial" : "failed", errors: [err instanceof Error ? err.message : String(err)] });
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
  refreshFollows: async (kind, options) => {
    const forceYoutube = kind === 'youtube' && options?.catalog === true && options.force === true && !options.scheduled && !options.youtubeLiveOnly && !options.twitchRoutine;
    let forceNextRequest = forceYoutube;
    let recoveredCooldown = false;
    const holdYoutube = () => !forceYoutube && (get().youtubeRefreshStatus?.retryAt ?? 0) > Date.now()
      && (get().youtubeRefreshStatus?.cooldownScope === 'all' || !get().youtubeRefreshStatus?.cooldownScope || options?.catalog === true);
    if (kind === 'youtube' && holdYoutube()) return { wentLive: [], newVideos: [], skipped: 'cooldown', retryAt: get().youtubeRefreshStatus!.retryAt };
    // A user-requested Twitch live check is a deliberate one-shot action and
    // must still work while background archive pulling is paused.
    if (!options?.twitchLiveOnly) await waitForPulls();
    if (kind === 'youtube' && holdYoutube()) return { wentLive: [], newVideos: [], skipped: 'cooldown', retryAt: get().youtubeRefreshStatus!.retryAt };
    const twitchLiveOnly = Boolean(options?.twitchLiveOnly);
    const backgroundTwitchRefresh = Boolean(options?.twitchRoutine && kind === "twitch");
    const overlappingLive = Boolean((options?.youtubeLiveOnly || twitchLiveOnly) && get().refreshing);
    if ((get().refreshing && !overlappingLive) || get().remoteBusy || (options?.youtubeLiveOnly && youtubeLiveCheckBusy) || (twitchLiveOnly && twitchLiveCheckBusy)) return { wentLive: [], newVideos: [], skipped: 'busy' };
    const allFollows = dedupeFollows(get().follows).filter(follow => (!kind || follow.kind === kind) && !(follow.kind === 'youtube' && holdYoutube())
      && !(follow.kind === 'twitch' && (follow[twitchLiveOnly ? 'twitchLiveRetry' : 'twitchArchiveRetry']?.retryAt ?? 0) > Date.now()));
    if (!allFollows.length) return { wentLive: [], newVideos: [], skipped: 'empty' };
    const rotate = (items: FollowedChannel[], limit: number, cursor: "twitch" | "youtube" | "all") => {
      if (!items.length) return [];
      if (cursor === "twitch") {
        const batch = selectTwitchRefreshBatch(items, limit, twitchRefreshCursor, twitchLiveOnly ? 'live' : 'archive');
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
    if ((get().refreshing && !overlappingLive) || get().remoteBusy) return { wentLive: [], newVideos: [], skipped: 'busy' };
    const requestedIds = options?.channelIds?.length ? new Set(options.channelIds) : null;
    const current = requestedIds
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
      : kind === "twitch" && (twitchLiveOnly || backgroundTwitchRefresh)
      ? rotate(twitch, LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, "twitch")
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
    const action = options?.youtubeLiveOnly ? "YouTube live check" : twitchLiveOnly ? "Twitch live check" : backgroundTwitchRefresh ? "Scheduled Twitch content pull" : options?.scheduled ? "Scheduled YouTube archive sweep" : options?.catalog ? "YouTube archive pull" : "Channel refresh";
    if (!overlappingLive) get().beginPull({ id: pullId, provider, action, startedAt, targets: current.map((channel) => channel.title || channel.handle), done: 0, total: current.length, received: 0, added: 0, failed: 0 });
    const beforeLiveChannels = new Set(get().follows.filter((channel) => channel.live).map((channel) => channel.id));
    const catalogQueue = kind === "youtube" && options?.catalog === true;
    let received = 0;
    let added = 0;
    let refreshed = 0;
    let checked = 0;
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
          if (key && !catalogPositions.has(key)) catalogPositions.set(key, index);
          catalogFolderCounts.set(video.folderId, (catalogFolderCounts.get(video.folderId) ?? 0) + 1);
        }, waitForCatalogTurn);
        catalogIndexedVideos = snapshot;
      }
    };
    try {
      const batchSize = catalogQueue ? LIBRARY_LIMITS.youtubeCatalogSourcesPerRequest : current.length;
      for (let offset = 0; offset < current.length; offset += batchSize) {
      if (getPullCancellationRevision() !== cancellation) break;
      if (catalogQueue) {
        const counts = await remoteEntryCounts(get().videos);
        if (!remainingEntrySlots(counts, getPullSettings(), 'youtube') && !canRotateForGroup(counts, getPullSettings(), 'youtube', cleanupRemaining)) { errors.push(ENTRY_LIMIT_MESSAGE); break; }
      }
      // An empty cache needs the first page, even if an old saved cursor or
      // feed watermark says it was already consumed before catalog recovery.
      const batch = current.slice(offset, offset + batchSize).map(channel => youtubeCoverage && !(youtubeCoverage.get(channel.id) ?? 0)
        ? { ...channel, catalogCursor: undefined, catalogExhaustedAt: undefined, newestVideoId: undefined } : channel);
      if (catalogQueue) await waitForCatalogTurn();
      if (!options?.twitchLiveOnly) await waitForPulls();
      await syncCatalogIndex();
      let result: Awaited<ReturnType<typeof refreshRemotes>>;
      try {
        const forceYoutubeRequest = forceNextRequest;
        forceNextRequest = false;
        result = await refreshRemotes({ data: { forceYoutube: forceYoutubeRequest, youtubeVideoLimit: getPullSettings().youtubeBatchVideos, channels: batch, youtubeCatalog: catalogQueue, youtubeBackground: options?.scheduled === true, youtubeLiveOnly: options?.youtubeLiveOnly === true, twitchLiveOnly: options?.twitchLiveOnly === true, twitchRoutine: options?.twitchRoutine === true } });
      } catch (error) {
        if (getPullCancellationRevision() !== cancellation) break;
        errors.push(`${batch.map((channel) => channel.title).join(", ")}: ${error instanceof Error ? error.message : String(error)}`);
        checked += batch.length;
        if (!overlappingLive) get().updatePull({ done: Math.min(current.length, offset + batch.length), received, added, failed: Math.min(current.length, offset + batch.length) - refreshed });
        continue;
      }
      if (catalogQueue) { await waitForCatalogTurn(); await waitForPulls(); }
      await syncCatalogIndex();
      if (getPullCancellationRevision() !== cancellation) break;
      const providerReceived = result.videos.length;
      checked += batch.length;
      let providerRows = result.videos;
      if (!options?.youtubeLiveOnly && !twitchLiveOnly) providerRows = await rotateRemotePull(get, providerRows, cleanupRemaining);
      let prepared: Awaited<ReturnType<typeof prepareRemotePull>>;
      let existingIndex: Map<string, LibraryVideo> | null;
      let routineMerged: LibraryVideo[] | null;
      let catalogMerged: Awaited<ReturnType<typeof prepareIndexedRemoteCatalog>> | null;
      const staleLiveIds: string[] = [];
      const endedYoutubeRows: LibraryVideo[] = [];
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
            await prepareRefreshSavedIds(prepared.base.favorites, prepared.base.likes, prepared.base.history, mergeTurn), { index: existingIndex ?? undefined, staleLiveIds, endedYoutubeRows, endedTwitchRows, turn: mergeTurn,
              liveCheckedIds: result.liveCheckedIds ?? result.refreshedIds.filter(id => options?.youtubeLiveOnly || batch.some(channel => channel.id === id && channel.kind === 'twitch')) });
          catalogMerged = catalogPositions ? await prepareIndexedRemoteCatalog(prepared.base.videos, prepared.admission.videos.map(catalogCard), catalogPositions, mergeTurn) : null;
        } catch (error) { if (error === rebase) continue; throw error; }
        if (getPullCancellationRevision() !== cancellation) break;
        if (sameInputs()) break;
      }
      if (getPullCancellationRevision() !== cancellation) break;
      result.videos = prepared.admission.videos;
      if (result.providerRetryAt) {
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
      const isNewVideo = (video: LibraryVideo) => !knownVideoIndex.has(video.id) && !knownVideoIndex.has(youtubeVideoKey(video) ?? video.id);
      const newVideoIds = new Set(result.videos.filter(isNewVideo).map((video) => video.id));
      const newCount = newVideoIds.size;
      received += providerReceived;
      added += newCount;
      refreshed += result.refreshedIds.length;
      if (!catalogQueue) newVideos.push(...result.videos.filter((video) => isNewVideo(video) && Boolean(video.remote)));
      for (const channel of result.channels) {
        const failure = twitchLiveOnly || options?.youtubeLiveOnly ? channel.lastLiveFailure : channel.lastProviderFailure;
        if (failure && errors.length < 12) errors.push(`${channel.title}: ${failure.message}`);
        if (channel.live && !beforeLiveChannels.has(channel.id)) wentLive.push(channel);
      }
      if (!overlappingLive) get().updatePull({ done: Math.min(current.length, offset + batch.length), received, added, failed: Math.min(current.length, offset + batch.length) - refreshed });
      const refreshStatus = {
          at: Date.now(),
          checked: offset + batch.length,
          refreshed,
          failed: offset + batch.length - refreshed,
          youtube: catalogQueue ? received : result.videos.filter((video) => video.remote?.kind === "youtube").length,
          twitch: result.videos.filter((video) => video.remote?.kind === "twitch" && (twitchLiveOnly ? video.remote.live : video.extension === "vod" || video.extension === "clip")).length,
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
        follows: dedupeFollows([...result.channels, ...s.follows]).map(channel => {
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
        progress: reconcileResumeForVideos(result.videos, s.progress, s.resumeProgress),
        tags: enriched.tags,
        metadataProvenance: enriched.metadataProvenance,
        ...(!overlappingLive ? { remoteRefreshStatus: refreshStatus } : {}),
        ...(kind === 'youtube' && !options?.youtubeLiveOnly ? { youtubeRefreshStatus: refreshStatus } : {}),
        ...(!overlappingLive && !options?.youtubeLiveOnly ? { remoteRetryAt: result.retryAt } : {}),
      };
      });
      if (catalogPositions) catalogIndexedVideos = get().videos;
      if (catalogQueue) {
        const changed = new Map(mergedIncoming.map(video => [video.id, video]));
        await cacheRemotes(get, result.videos.filter(video => changed.has(video.id)).map(video => ({ ...video, folderId: changed.get(video.id)!.folderId, remote: { ...video.remote!, sourceIds: changed.get(video.id)!.remote?.sourceIds } })), true);
        // Save the resumable cursor every few sources without repeatedly
        // cloning the entire tag/preference ledger during a long crawl.
        if ((offset + batch.length) % 4 === 0) saveFollows(get().follows);
        // Yield before the next creator. This lets input, scrolling and live
        // status render between large archive responses.
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
      else {
        const ended = [...endedYoutubeRows, ...endedTwitchRows];
        await cacheRemotes(get, ended.length ? [...result.videos, ...ended] : result.videos);
        const retainedStreams = new Set(ended.map(video => video.id));
        const removedLiveIds = staleLiveIds.filter(id => !retainedStreams.has(id));
        if (removedLiveIds.length) await removeRemoteSnapshotVideos(removedLiveIds).catch(() => undefined);
      }
      if (result.providerRetryAt) {
        errors.push(`YouTube is cooling down until ${new Date(result.providerRetryAt).toLocaleTimeString()}; ${current.length - checked} targets remain queued for a later sweep.`);
        break;
      }
      if (kind === 'youtube' && prepared.admission.skipped && !prepared.admission.added) break;
      }
      persistNow(get);
      const failed = checked - refreshed;
      const pull: PullRecord = { id: pullId, provider, action, startedAt, finishedAt: Date.now(), targets: current.slice(0, 12).map((channel) => channel.title || channel.handle), done: checked, total: current.length, received, added, failed, status: errors.length ? "partial" : failed ? refreshed ? "partial" : "failed" : "success", ...(errors.length ? { errors: errors.slice(0, 12) } : {}) };
      if (!overlappingLive) get().finishPull(pull);
      return { wentLive, newVideos, pull, retryAt: get().youtubeRefreshStatus?.retryAt };
    } catch (error) {
      if (!options?.youtubeLiveOnly) {
        const status = { at: Date.now(), checked, refreshed, failed: checked - refreshed, youtube: received, twitch: 0, action, error: error instanceof Error ? error.message : String(error) };
        set({ remoteRefreshStatus: status, ...(kind === 'youtube' ? { youtubeRefreshStatus: status } : {}) });
      }
      const pull: PullRecord = { id: pullId, provider, action, startedAt, finishedAt: Date.now(), targets: current.slice(0, 12).map((channel) => channel.title || channel.handle), done: checked, total: current.length, received, added, failed: checked - refreshed, status: "failed", errors: [error instanceof Error ? error.message : String(error)] };
      if (!overlappingLive) get().finishPull(pull);
      return { wentLive, newVideos, pull };
    } finally {
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
  let list = state.videos.filter((v) => !state.unavailable[v.id] && !state.hiddenVideos[v.id] && !adult.has(v.folderId) && (knownFolders.has(v.folderId) || Boolean(v.remote) || v.isSample));
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
    && adult.has(v.folderId)
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
    list = list.filter((v) => !v.remote);
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
    && adult === adultIds.has(video.folderId),
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
      if (!(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === adultIds.has(video.folderId)) return video;
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
        const isAdult = adultIds.has(live.folderId);
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
    && !privateFolders.has(video.folderId) && !(state.hideDemo && video.isSample)) : undefined;
  result = updated ?? state.videos.filter(video => video.remote?.kind === "youtube"
    && !state.unavailable[video.id] && !state.hiddenVideos[video.id]
    && !privateFolders.has(video.folderId) && !(state.hideDemo && video.isSample))
    .sort((a, b) => youtubePublicationTime(b) - youtubePublicationTime(a));
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
  const visible = (video: LibraryVideo) => !(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === privateFolders.has(video.folderId);
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
  if (state.sourceId === "movies") keys.push("likes");
  if (state.sourceId === "history" || state.sourceId === "continue") keys.push("history");
  if (state.sourceId === "continue") keys.push("progress", "resumeProgress");
  else if (state.sort === "recent" && state.sourceId !== "history") keys.push("progress");
  return keys;
});

export const selectYoutube = memoizeSelectorInputs(computeSelectYoutube, (state: LibraryState) =>
  [state.videos, adultIdSet(state.folders), state.unavailable, state.hiddenVideos, state.hideDemo]);

/** Navigation prepares the exact selector result cooperatively, before any
 * subscribed component can trigger a synchronous cold catalog filter/sort. */
export async function prepareYoutubeSelection(state: LibraryState, signal: AbortSignal, yieldTask = yieldCatalogTask) {
  const cached = selectYoutube.peek(state);
  if (cached) return cached;
  const privateFolders = adultIdSet(state.folders);
  const result = await youtubeCatalogSelection({ videos: state.videos, privateFolders,
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
