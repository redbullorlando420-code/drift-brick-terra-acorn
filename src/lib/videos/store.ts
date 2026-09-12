import { create } from "zustand";
import {
  ADULT_FOLDER_BY_PROVIDER,
  ADULT_FOLDER_IDS,
  ADULT_PULL_PROVIDERS,
  EPORNER_FOLDER_ID,
  REDTUBE_FOLDER_ID,
  adultIngestTags,
  type AdultPullProvider,
} from "./adult-sites";
import { saveAdultArchiveCursors } from "./adult-archive-cursors";
import { applyCachedAdultUrls, cacheAdultVideoUrls } from "./adult-url-cache";
import { redditIngestExtras } from "./adult-reddit-tags";
import {
  findFreshAdultPullFingerprint,
  rememberAdultPullFingerprint,
} from "@/lib/remote/adult-pull-cache";
import { mergeRemoteRefresh } from "./remote-merge";
import { measureInteraction } from "@/lib/interaction-budget";
import {
  appendCatalogVideos,
  appendActivityJournal,
  clearActivityJournal,
  pruneActivityJournal,
  loadActivityJournal,
  loadActivitySnapshot,
  loadRemoteSnapshot,
  saveRemoteSnapshot,
  clearFolderVideos,
  deleteDirHandle,
  loadCatalogVideos,
  loadDirHandles,
  loadPrefs,
  restoreDurablePrefs,
  saveTagEdit,
  restoreTagEdits,
  loadSourceHealth,
  saveDirHandle,
  saveActivitySnapshot,
  saveFolderVideos,
  savePrefs,
  saveSourceHealth,
  type Prefs,
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
  ProgressMark,
  ResumeMark,
  SortKey,
  SourceId,
  ViewMode,
  WellKnownStart,
} from "./types";
import { librarySearchIndex } from "./search-index";
import { useSourceAssets } from "@/lib/source-assets";
import { isClassicVideo, SYSTEM_SOURCES } from "./types";
import { LIBRARY_LIMITS } from "@/lib/library-limits";

let restoring = false;
// A full provider refresh is intentionally bounded. Rotate that window instead
// of repeatedly checking the first saved channels, which left large Twitch
// libraries with stale live state forever.
let remoteRefreshCursor = 0;
let twitchRefreshCursor = 0;
let youtubeRefreshCursor = 0;
const historyRecoveryCardCache = new Map<string, { signature: string; video: LibraryVideo }>();
const REMOTE_REFRESH_BATCH_SIZE = LIBRARY_LIMITS.remoteRefreshChannelBatch;
const STARTER_FOLLOWS: FollowedChannel[] = [
  { id: "yt:starter-h3", kind: "youtube", handle: "H3Podcast", title: "H3 Podcast" },
  { id: "yt:starter-ltt", kind: "youtube", handle: "LinusTechTips", title: "Linus Tech Tips" },
  { id: "tw:starter-ironmouse", kind: "twitch", handle: "ironmouse", title: "Ironmouse" },
  { id: "tw:starter-zackrawrr", kind: "twitch", handle: "zackrawrr", title: "Zackrawrr" },
];

export type AddOpts = { adult?: boolean };

type LibraryState = {
  folders: Folder[];
  videos: LibraryVideo[];
  query: string;
  sort: SortKey;
  view: ViewMode;
  sourceId: SourceId;
  favorites: Record<string, true>;
  likes: Record<string, true>;
  tags: Record<string, string[]>;
  categories: Record<string, string>;
  progress: Record<string, ProgressMark>;
  resumeProgress: Record<string, ResumeMark>;
  history: HistoryEntry[];
  viewCounts: Record<string, number>;
  cameCounts: Record<string, number>;
  hideDemo: boolean;
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
  notifyPush: boolean;
  remoteBusy: boolean;
  remoteCheckedAt: number;
  refreshing: boolean;
  remoteRefreshStatus: { at: number; checked: number; refreshed: number; failed: number; youtube: number; twitch: number } | null;
  /** Provider retry deadlines keyed by followed-channel id. Focused refreshes bypass these. */
  remoteRetryAt: Record<string, number>;
  importProgress: { done: number; total: number; label: string } | null;
  setQuery: (q: string) => void;
  setSort: (s: SortKey) => void;
  setView: (v: ViewMode) => void;
  setSource: (id: SourceId) => void;
  toggleFavorite: (id: string) => void;
  toggleLike: (id: string) => void;
  markCame: (id: string) => void;
  setVideoTags: (id: string, tags: string[]) => void;
  autoTagLibrary: () => number;
  setVideoCategory: (id: string, category: string) => void;
  markProgress: (id: string, t: number, d: number) => void;
  recordPlay: (id: string, source?: HistoryEntry["source"]) => void;
  clearHistory: () => void;
  pruneHistory: (before: number) => void;
  getResumeRepairPreview: () => { valid: number; invalid: number; stale: number; recoverable: number };
  openVideo: (id: string) => void;
  openPreview: (id: string) => void;
  closePreview: () => void;
  closePlayer: () => void;
  removeVideo: (id: string) => void;
  playRelative: (delta: number, playlist: string[]) => void;
  setHideDemo: (hide: boolean) => void;
  setHardwareAccel: (on: boolean) => void;
  setFolderAdult: (folderId: string, adult: boolean) => void;
  searchAdultFeed: (query?: string, order?: string, opts?: { page?: number; maxVideos?: number; append?: boolean; providers?: AdultPullProvider[] | "all"; providerPages?: Partial<Record<AdultPullProvider, number>>; resumeArchive?: boolean }) => Promise<number>;
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
  followRemoteQuery: (query: string, kind?: "auto" | "youtube" | "twitch") => Promise<void>;
  importBatch: (
    items: { query: string; kind: "youtube" | "twitch" }[],
  ) => Promise<{ ok: number; failed: number; failedQueries: string[]; failedReasons: Record<string, string> }>;
  unfollow: (id: string) => void;
  refreshFollows: () => Promise<{ wentLive: FollowedChannel[]; newVideos: LibraryVideo[] }>;
  pushNotice: (n: Omit<AppNotice, "id" | "at" | "read">) => void;
  markNoticesRead: () => void;
  setNotifyPush: (on: boolean) => void;
  markUnavailable: (id: string, reason: string) => void;
};

let preferencesRestored = false;
function persistNow(get: () => LibraryState) {
  if (!preferencesRestored) return;
  const s = get();
  const prefs: Prefs = {
    favorites: Object.keys(s.favorites),
    likes: Object.keys(s.likes),
    tags: s.tags,
    categories: s.categories,
    progress: s.progress,
    resumeProgress: s.resumeProgress,
    history: s.history,
    viewCounts: s.viewCounts,
    cameCounts: s.cameCounts,
    view: s.view,
    sort: s.sort,
    hideDemo: s.hideDemo,
    sourceId: s.sourceId === "adults" ? "home" : s.sourceId,
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
  };
  savePrefs(prefs);
  void saveActivitySnapshot({ history: s.history, progress: s.progress, resumeProgress: s.resumeProgress, viewCounts: s.viewCounts, cameCounts: s.cameCounts, savedAt: Date.now() }).catch(() => queueResumeReplay(s.resumeProgress));
}

function persistActivity(get: () => LibraryState) {
  if (!preferencesRestored) return;
  const s = get();
  void saveActivitySnapshot({ history: s.history, progress: s.progress, resumeProgress: s.resumeProgress, viewCounts: s.viewCounts, cameCounts: s.cameCounts, savedAt: Date.now() }).catch(() => queueResumeReplay(s.resumeProgress));
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
  const next = { ...progress };
  for (const video of videos) {
    const mark = newestResume(next[video.id], ...stableResumeKeys(video).map((key) => resumeProgress[key]));
    if (mark) next[video.id] = mark;
  }
  return next;
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

function persistSoon(get: () => LibraryState) {
  if (typeof window === "undefined") {
    persistNow(get);
    return;
  }
  if (persistTimer != null) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistNow(get);
  }, 900);
}

function flushPersist(get: () => LibraryState) {
  if (persistTimer != null) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  persistNow(get);
}


function mergeVideos(existing: LibraryVideo[], incoming: LibraryVideo[]) {
  const map = new Map(existing.map((v) => [v.id, v]));
  for (const v of incoming) map.set(v.id, v);
  return Array.from(map.values());
}

function cacheRemotes(get: () => LibraryState) {
  const s = get();
  void saveRemoteSnapshot({
    videos: s.videos.filter((v) => v.remote && !v.isSample),
    folders: s.folders.filter((f) => f.kind === "youtube" || f.kind === "twitch"),
    checkedAt: s.remoteCheckedAt,
  }).catch(() => undefined);
}

// A favorite/like is an interaction, not a catalog refresh.  Saving the full
// remote snapshot while the card is animating used to serialize thousands of
// provider rows on the click path.  Coalesce it just behind the interaction;
// explicit provider refreshes still use cacheRemotes immediately.
let remoteCacheTimer: ReturnType<typeof setTimeout> | null = null;
function cacheRemotesSoon(get: () => LibraryState) {
  if (typeof window === "undefined") {
    cacheRemotes(get);
    return;
  }
  if (remoteCacheTimer != null) return;
  remoteCacheTimer = setTimeout(() => {
    remoteCacheTimer = null;
    cacheRemotes(get);
  }, 1_200);
}

function canonicalFollowHandle(kind: "youtube" | "twitch", raw: string): string {
  const value = raw.trim().replaceAll("\\_", "_").toLowerCase();
  if (kind === "twitch") {
    const match = value.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([^/?#]+)/i);
    return (match?.[1] ?? value.replace(/^tw:/, "")).replace(/^@/, "").replace(/[^a-z0-9_]/g, "");
  }
  const match = value.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:@|channel\/)?([^/?#]+)/i);
  return (match?.[1] ?? value).replace(/^@/, "").replace(/[^a-z0-9_-]/g, "");
}

function dedupeFollows(rows: FollowedChannel[]): FollowedChannel[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.kind}:${canonicalFollowHandle(row.kind, row.handle || row.id)}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function remoteMetadataTags(video: LibraryVideo) {
  // Keep source, creator, format, topic, and genre as distinct tag families.
  // This makes cross-service mapping explainable and prevents raw provider
  // strings from pretending to be interests.
  const creator = video.remote?.channelName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "";
  const provider = video.remote?.kind ? `provider-${video.remote.kind}` : "";
  const format = video.remote?.live ? "format-live" : video.remote ? "format-vod" : "";
  const twitchFormat = video.remote?.kind === "twitch" ? (video.remote.live ? "twitch-live" : "twitch-vod") : "";
  const genre = video.genre?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // Twitch exposes a public stream game/category even when it does not expose
  // a richer tag list. Preserve it separately so live and VOD browsing can use
  // a concrete provider category rather than only title-keyword guesses.
  const twitchGame = video.remote?.kind === "twitch" && genre ? `twitch-game-${genre}` : "";
  return [...new Set([provider, creator, format, twitchFormat, genre ? `genre-${genre}` : "", twitchGame, ...semanticTags(video), ...descriptionKeywordTags(video)].filter(Boolean))].slice(0, LIBRARY_LIMITS.remoteMetadataTagsPerTitle);
}

/** Upgrade cached provider cards with the same safe tags created for new pulls. */
function enrichRemoteTags(existing: Record<string, string[]>, videos: LibraryVideo[]) {
  const tags = { ...existing };
  for (const video of videos) {
    if (!video.remote) continue;
    tags[video.id] = compactIngestedTags(tags[video.id] ?? [], remoteMetadataTags(video));
  }
  return tags;
}

/** Normalize provider enrichment once when it enters the catalog. Manual tags
 * are retained, while old keyword-/creator- wrappers and duplicate labels do
 * not keep inflating every selector and render pass. */
function compactIngestedTags(existing: string[], inferred: string[]) {
  const seen = new Set<string>();
  const compact: string[] = [];
  for (const raw of [...existing, ...inferred]) {
    // Preserve source- / creator- / fetish- / provider- families for Adult filters.
    // Only strip the legacy keyword- wrapper so cards stay readable.
    let tag = raw.trim().toLowerCase().replace(/^keyword-/, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!tag || tag === "http" || tag === "https" || seen.has(tag)) continue;
    seen.add(tag);
    compact.push(tag);
    if (compact.length >= LIBRARY_LIMITS.remoteMetadataTagsPerTitle) break;
  }
  return compact;
}

function descriptionKeywordTags(video: LibraryVideo) {
  // Keep a controlled 300-word ceiling. Provider descriptions are the richest
  // public source for Twitch and YouTube connections, while the ceiling keeps
  // storage, exports, and derived shelves bounded.
  const ignored = new Set(["about", "after", "also", "because", "being", "between", "channel", "click", "creator", "description", "from", "have", "here", "just", "more", "next", "official", "please", "really", "subscribe", "that", "this", "through", "today", "video", "watch", "with", "youtube", "your"]);
  const text = `${video.remote?.channelName ?? ""} ${video.name} ${video.description ?? video.tagline ?? ""}`.toLowerCase();
  const words = text.match(/[a-z][a-z0-9-]{3,30}/g) ?? [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const word of words) {
    if (ignored.has(word) || seen.has(word)) continue;
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
function semanticTags(video: LibraryVideo) {
  const text = `${video.name} ${video.path} ${video.tagline ?? ""} ${video.description ?? ""}`.toLowerCase();
  const rules: Array<[RegExp, string]> = [
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
  const tags = rules.filter(([pattern]) => pattern.test(text)).map(([, tag]) => tag);
  if (video.remote?.kind === "youtube" && ((video.duration ?? 0) > 0 && (video.duration ?? 0) < 90 || /(?:#|\b)shorts?\b/i.test(text))) tags.push("shorts", "short-form");
  if (video.remote?.kind === "twitch" && !video.remote.live && (video.duration ?? 0) > 0 && (video.duration ?? 0) < 120) tags.push("clip");
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

function addLocalNameTags(existing: Record<string, string[]>, videos: LibraryVideo[]) {
  const next = { ...existing };
  for (const video of videos) {
    const inferred = localNameTags(video);
    if (!inferred.length) continue;
    next[video.id] = [...new Set([...(next[video.id] ?? []), ...inferred])].slice(0, 18);
  }
  return next;
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
    sourceId: prefs.sourceId ?? "home",
    hardwareAccel: prefs.hardwareAccel ?? true,
    adultPinHash: null,
    // An empty saved list is intentional. Do not repopulate it with sample follows.
    follows: dedupeFollows(prefs.follows ?? []),
    notices: prefs.notices ?? [],
    notifyPush: prefs.notifyPush ?? false,
    unavailable: Object.fromEntries((prefs.unavailableVideoIds ?? []).map((id) => [id, true])),
  };
}

function adultIdSet(folders: Folder[]) {
  return new Set(folders.filter((f) => f.adult).map((f) => f.id));
}

export function isAdultVideo(video: LibraryVideo, folders: Folder[]) {
  return adultIdSet(folders).has(video.folderId);
}

export const useLibrary = create<LibraryState>((set, get) => ({
  // A new library starts empty. Demo movies once helped illustrate the UI, but
  // they should never compete with a person's own sources or provider follows.
  folders: [],
  videos: [],
  query: "",
  sort: "added",
  view: "grid",
  sourceId: "home",
  favorites: {},
  likes: {},
  tags: {},
  categories: {},
  progress: {},
  resumeProgress: {},
  history: [],
  viewCounts: {},
  cameCounts: {},
  hideDemo: true,
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
  notifyPush: false,
  remoteBusy: false,
  refreshing: false,
  remoteCheckedAt: 0,
  remoteRefreshStatus: null,
  remoteRetryAt: {},
  importProgress: null,
  setQuery: (query) => { measureInteraction("search"); set({ query }); },
  setSort: (sort) => {
    set({ sort });
    persistNow(get);
  },
  setView: (view) => {
    set({ view });
    persistNow(get);
  },
  setSource: (sourceId) => {
    measureInteraction("navigation");
    set({ sourceId });
    persistNow(get);
  },
  toggleFavorite: (id) => {
    set((s) => {
      const favorites = { ...s.favorites };
      if (favorites[id]) delete favorites[id];
      else favorites[id] = true;
      return { favorites };
    });
    persistSoon(get);
    cacheRemotesSoon(get);
  },
  toggleLike: (id) => {
    measureInteraction("rating");
    set((s) => {
      const likes = { ...s.likes };
      if (likes[id]) delete likes[id];
      else likes[id] = true;
      return { likes };
    });
    persistSoon(get);
    cacheRemotesSoon(get);
  },
  markCame: (id) => {
    set((s) => ({ cameCounts: { ...s.cameCounts, [id]: (s.cameCounts[id] ?? 0) + 1 } }));
    persistNow(get);
  },
  setVideoTags: (id, tags) => {
    set((s) => ({
      tags: {
        ...s.tags,
        [id]: [...new Set(tags.map((tag) => tag.trim().toLowerCase().replace(/^keyword-/, "")).filter(Boolean))].slice(
          0,
          18,
        ),
      },
    }));
    const state = get();
    const video = state.videos.find((item) => item.id === id);
    if (video) librarySearchIndex.updateMetadata(video, state.videos, state.tags, state.categories);
    saveTagEdit(id, state.tags[id] ?? []);
    // Keep the small per-title journal synchronous for recovery, then defer
    // the broad preference snapshot so rapid tag edits never block input.
    persistSoon(get);
  },
  autoTagLibrary: () => {
    let changed = 0;
    set((s) => {
      const tags = { ...s.tags };
      for (const video of s.videos) {
        const inferred = video.remote ? remoteMetadataTags(video) : localNameTags(video);
        const existing = (tags[video.id] ?? []).map((tag) => tag.replace(/^keyword-/i, "").replace(/^creator-/i, ""));
        const merged = compactIngestedTags(existing, inferred);
        if (merged.length !== (tags[video.id] ?? []).length) changed += 1;
        tags[video.id] = merged;
      }
      return { tags };
    });
    const state = get();
    librarySearchIndex.sync(state.videos, state.tags, state.categories);
    persistNow(get);
    return changed;
  },
  setVideoCategory: (id, category) => {
    set((s) => ({ categories: { ...s.categories, [id]: category.trim().slice(0, 40) } }));
    const state = get();
    const video = state.videos.find((item) => item.id === id);
    if (video) librarySearchIndex.updateMetadata(video, state.videos, state.tags, state.categories);
    saveTagEdit(id, state.tags[id] ?? []);
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
        ? [{ eventId: nextHistoryEventId(now), id, at: now, position: incoming.t, duration: incoming.d, source: "progress" as const }, ...s.history]
        : s.history;
      const mark = incoming;
      const video = s.videos.find((item) => item.id === id);
      const resumeProgress = { ...s.resumeProgress };
      if (video) for (const key of stableResumeKeys(video)) resumeProgress[key] = newestResume(resumeProgress[key], mark) ?? mark;
      return { progress: { ...s.progress, [id]: mark }, resumeProgress, history };
    });
    const event = get().history[0];
    if (event?.id === id && event.at === now) void appendActivityJournal(event).catch(() => undefined);
    persistActivity(get);
    persistSoon(get);
  },
  recordPlay: (id, source = "open") => {
    const beforeAt = get().history[0]?.at;
    set((s) => {
      const now = Date.now();
      const latest = s.history[0];
      // Keep history limitless, but a play button, provider event, and player
      // heartbeat for the same start should remain one activity event.
      if (latest?.id === id && now - latest.at < 20_000) return {};
      const mark = s.progress[id];
      const video = s.videos.find((item) => item.id === id);
      const url = video?.remote?.embedUrl ?? video?.src ?? video?.remote?.watchUrl;
      const title = video?.name?.trim();
      const poster = video?.poster ?? video?.remote?.previewUrl;
      const next = [{ eventId: nextHistoryEventId(now), id, at: now, position: mark?.t, duration: mark?.d, source, ...(url ? { url } : {}), ...(title ? { title } : {}), ...(poster ? { poster } : {}) }, ...s.history];
      return { history: next, viewCounts: { ...s.viewCounts, [id]: (s.viewCounts[id] ?? 0) + 1 } };
    });
    const event = get().history[0];
    if (event?.id === id && event.at !== beforeAt) void appendActivityJournal(event).catch(() => undefined);
    persistActivity(get);
    persistSoon(get);
  },
  clearHistory: () => {
    set({ history: [] });
    void clearActivityJournal().catch(() => undefined);
    persistNow(get);
  },
  openVideo: (activeId) => {
    const s = get();
    const video = s.videos.find((v) => v.id === activeId);
    if (video && isAdultVideo(video, s.folders) && !s.adultsUnlocked) {
      set({ sourceId: "adults" });
      persistNow(get);
      return;
    }
    set({ activeId, previewId: null });
    get().recordPlay(activeId);
  },
  openPreview: (previewId) => set({ previewId }),
  closePreview: () => set({ previewId: null }),
  closePlayer: () => set({ activeId: null }),
  removeVideo: (id) => {
    set((s) => {
      const favorites = { ...s.favorites };
      const likes = { ...s.likes };
      const tags = { ...s.tags };
      const categories = { ...s.categories };
      const progress = { ...s.progress };
      const viewCounts = { ...s.viewCounts };
      delete favorites[id];
      delete likes[id];
      delete tags[id];
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
        categories,
        progress,
        viewCounts,
        history: s.history.filter((h) => h.id !== id),
      };
    });
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
  setHardwareAccel: (hardwareAccel) => {
    set({ hardwareAccel });
    persistNow(get);
  },
  setFolderAdult: (folderId, adult) => {
    if (folderId === "demo") return;
    set((s) => ({
      folders: s.folders.map((f) => (f.id === folderId ? { ...f, adult } : f)),
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
    const providers = opts?.providers ?? "all";
    const providerList = providers === "all" ? [...ADULT_PULL_PROVIDERS] : providers;
    const label =
      providerList.length === 1
        ? `Pulling ${providerList[0]} catalog…`
        : "Pulling official adult catalogs…";
    set({ remoteBusy: true, importProgress: { done: 0, total: 1, label } });
    try {
      const { searchAdultVideos } = await import("@/lib/remote/api");
      const page = opts?.page ?? 1;
      const maxVideos = opts?.maxVideos ?? LIBRARY_LIMITS.epornerVideosPerPull;
      const append = Boolean(opts?.append);
      const providerPages = opts?.providerPages;
      const providerKey = providerList.slice().sort().join("+");
      // Skip only a fat, already-balanced catalog. Thin Reddit or a small first pull must refresh.
      if (!append && !providerPages && findFreshAdultPullFingerprint(query, order, page, providerKey)) {
        const have = get().videos.filter((v) => (ADULT_FOLDER_IDS as readonly string[]).includes(v.folderId));
        const reddit = have.filter((v) => v.remote?.kind === "reddit").length;
        if (have.length >= LIBRARY_LIMITS.adultFastStartVideosPerPull && reddit >= 200) {
          set({ remoteBusy: false, importProgress: null });
          return have.length;
        }
      }
      const result = await searchAdultVideos({ data: { query, order, page, maxVideos, append, providers, providerPages } });
      if (result.providerNextPages) {
        saveAdultArchiveCursors(query, order, result.providerNextPages);
      }
      rememberAdultPullFingerprint({
        at: Date.now(),
        query: query.trim().toLowerCase() || "all",
        order,
        page,
        providers: providerKey,
        count: result.videos.length,
      });
      const videos = applyCachedAdultUrls(result.videos);
      cacheAdultVideoUrls(videos);
      const touched = new Set(videos.map((v) => v.folderId));
      set((s) => {
        let nextVideos = s.videos;
        let folders = s.folders;
        const tagPatch: Record<string, string[]> = {};

        for (const folderId of ADULT_FOLDER_IDS) {
          if (!touched.has(folderId) && append) continue;
          if (!touched.has(folderId) && !append) {
            // Full replace mode for selected providers only — leave untouched provider shelves.
            continue;
          }
          const incoming = videos.filter((v) => v.folderId === folderId);
          const existingRemote = append
            ? nextVideos.filter((v) => v.folderId === folderId)
            : [];
          const byId = new Map(existingRemote.map((v) => [v.id, v]));
          for (const video of incoming) byId.set(video.id, video);
          const merged = [...byId.values()].sort((a, b) => b.addedAt - a.addedAt);
          const provider = (Object.keys(ADULT_FOLDER_BY_PROVIDER) as AdultPullProvider[]).find(
            (key) => ADULT_FOLDER_BY_PROVIDER[key].id === folderId,
          );
          const baseFolder = provider ? ADULT_FOLDER_BY_PROVIDER[provider] : ADULT_FOLDER_BY_PROVIDER.eporner;
          const kind = baseFolder.kind;
          const hasFolder = folders.some((f) => f.id === folderId);
          folders = hasFolder
            ? folders.map((f) =>
                f.id === folderId ? { ...f, videoCount: merged.length, adult: true, kind } : f,
              )
            : [...folders, { ...baseFolder, videoCount: merged.length }];
          nextVideos = [...nextVideos.filter((v) => v.folderId !== folderId), ...merged];
        }

        for (const video of videos) {
          const source = video.remote?.kind ?? video.folderId.split(":")[0] ?? "eporner";
          const hostExtra =
            source === "booru" && video.remote?.channelId
              ? [video.remote.channelId]
              : source === "reddit" && video.remote?.channelId
                ? [`reddit-${video.remote.channelId}`]
                : [];
          const creatorNames = [
            video.remote?.channelName,
            video.remote?.videoId && (source === "chaturbate" || source === "camsoda" || source === "myfreecams")
              ? video.remote.videoId
              : undefined,
          ];
          const redditExtra = source === "reddit"
            ? redditIngestExtras({
                subreddit: video.remote?.channelId,
                title: video.name,
                extraText: `${video.description ?? ""} ${video.tagline ?? ""}`,
                mediaKind: video.extension === "image" ? "image" : /video/i.test(video.mime) ? "video" : undefined,
              })
            : [];
          tagPatch[video.id] = compactIngestedTags(s.tags[video.id] ?? [], [
            ...remoteMetadataTags(video),
            ...adultIngestTags({
              source,
              extraSources: hostExtra,
              creatorNames,
              apiKeywords: video.description ?? video.tagline ?? "",
              title: video.name,
              description: video.description ?? video.tagline ?? "",
              extraTags: redditExtra,
              extraText: source === "reddit" ? `${video.name} ${video.tagline ?? ""}` : undefined,
              limit: LIBRARY_LIMITS.adultKeywordTagsPerTitle + 36,
            }),
          ]);
        }

        return {
          folders,
          videos: nextVideos,
          tags: { ...s.tags, ...tagPatch },
          adultsUnlocked: true,
          remoteBusy: false,
          importProgress: null,
        };
      });
      persistNow(get);
      // Durable IndexedDB catalog like YouTube/Twitch folders — keep Adult shelves
      // across reloads without another full provider pull.
      let writeChain: Promise<void> = Promise.resolve();
      for (const folderId of touched) {
        if (append) {
          const incoming = videos.filter((v) => v.folderId === folderId);
          if (!incoming.length) continue;
          writeChain = writeChain.then(() => appendCatalogVideos(incoming)).catch(() => undefined);
        } else {
          const folderVideos = get().videos.filter((v) => v.folderId === folderId);
          if (!folderVideos.length) continue;
          writeChain = writeChain.then(() => saveFolderVideos(folderId, folderVideos)).catch(() => undefined);
        }
      }
      await writeChain;
      return get().videos.filter((v) => (ADULT_FOLDER_IDS as readonly string[]).includes(v.folderId)).length;
    } catch (err) {
      set({ remoteBusy: false, importProgress: null });
      throw err;
    }
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
    const folderId = `folder:${handle.name}:${crypto.randomUUID().slice(0, 8)}`;
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
      if (videos.length) set((s) => ({ tags: addLocalNameTags(s.tags, videos) }));
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
      ? `folder:${folderName}:${crypto.randomUUID().slice(0, 8)}`
      : `files:${crypto.randomUUID().slice(0, 8)}`;
    const adult = Boolean(opts?.adult) || get().sourceId === "adults";
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
    if (videos.length) set((s) => ({ tags: addLocalNameTags(s.tags, videos) }));
    flushPersist(get);
    if (videos.length) await saveFolderVideos(folderId, videos).catch(() => undefined);
  },
  ingestDrop: async (dt) => {
    const nameGuess =
      dt.files?.[0]?.webkitRelativePath?.split("/")[0] || dt.files?.[0]?.name || "Dropped files";
    const folderId = `drop:${crypto.randomUUID().slice(0, 8)}`;
    const adult = get().sourceId === "adults";
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
    if (videos.length) set((s) => ({ tags: addLocalNameTags(s.tags, videos) }));
    flushPersist(get);
    if (videos.length) await saveFolderVideos(folderId, videos).catch(() => undefined);
  },
  restoreFolders: async () => {
    if (get().hydrated || restoring) return;
    restoring = true;
    await restoreDurablePrefs().catch(() => undefined);
    preferencesRestored = true;
    const prefsState = applyPrefs({});
    prefsState.tags = restoreTagEdits(prefsState.tags ?? {});
    const adultIds = new Set(loadPrefs()?.privateFolderIds ?? []);
    let cachedFolderIds = new Set<string>();
    let savedHealth = new Map<string, Awaited<ReturnType<typeof loadSourceHealth>>[number]>();
    set({ ...prefsState });
    // Keep the durable activity journal separate from broad preferences. It
    // merges after first paint, so a massive tag payload cannot wipe history
    // or block startup recovery.
    void Promise.all([loadActivitySnapshot(), loadActivityJournal()]).then(([activity, journal]) => {
      const queuedResume = takeQueuedResumeReplay();
      if (!activity && !journal.length && !Object.keys(queuedResume).length) return;
      set((s) => {
        const resumeProgress = { ...(activity?.resumeProgress ?? {}), ...queuedResume, ...s.resumeProgress };
        return {
          history: mergeHistory(mergeHistory(s.history, activity?.history ?? []), journal),
          resumeProgress,
          progress: reconcileResumeForVideos(s.videos, { ...(activity?.progress ?? {}), ...s.progress }, resumeProgress),
          viewCounts: { ...(activity?.viewCounts ?? {}), ...s.viewCounts },
          cameCounts: { ...(activity?.cameCounts ?? {}), ...s.cameCounts },
        };
      });
    }).catch(() => undefined);
    try {
      const snapshot = await loadRemoteSnapshot();
      if (snapshot) {
        const ids = new Set(get().follows.map((channel) => channel.id));
        set((s) => {
          const videos = mergeVideos(s.videos, snapshot.videos.filter((v) => ids.has(v.folderId) || s.favorites[v.id] || s.likes[v.id]));
          return {
            videos,
            tags: enrichRemoteTags(s.tags, snapshot.videos),
            progress: reconcileResumeForVideos(videos, s.progress, s.resumeProgress),
            folders: [...s.folders.filter((f) => !snapshot.folders.some((saved) => saved.id === f.id)), ...snapshot.folders.filter((f) => ids.has(f.id))],
            remoteCheckedAt: snapshot.checkedAt,
          };
        });
      }
    } catch { /* The catalog remains usable when storage is unavailable. */ }
    set({ hydrated: true });
    restoring = false;
    // A pasted import list is a durable recovery queue. Resume every missing
    // entry—not only an entirely empty shelf—so partial Twitch imports keep
    // progressing across reloads without requiring “Load saved list now”.
    if (typeof window !== "undefined") {
      const recover = async (kind: "twitch" | "youtube") => {
        try {
          const saved = JSON.parse(localStorage.getItem(`reelcase.import-history.${kind}`) ?? "[]") as unknown;
          if (!Array.isArray(saved) || !saved.length) return;
          // Startup recovery must never monopolize the first screen when a user
          // has hundreds of subscriptions. The complete saved list stays intact;
          // each refresh resumes a bounded, provider-friendly batch.
          await get().importBatch(saved.filter((value): value is string => typeof value === "string" && Boolean(value.trim())).slice(0, 80).map((query) => ({ query, kind })));
        } catch { /* no saved import list */ }
      };
      void (async () => { await recover("twitch"); await recover("youtube"); })();
    }
    // Saved follows hydrate synchronously from preferences. The app shell owns the
    // single background refresh, avoiding two competing refreshes and rail flicker.
    try {
      const [catalog, healthRows] = await Promise.all([loadCatalogVideos(), loadSourceHealth()]);
      savedHealth = new Map(healthRows.map((entry) => [entry.id, entry]));
      cachedFolderIds = new Set(catalog.map((video) => video.folderId));
      if (catalog.length) {
        const counts = new Map<string, number>();
        for (const v of catalog) counts.set(v.folderId, (counts.get(v.folderId) ?? 0) + 1);
        set((s) => {
          const videos = mergeVideos(s.videos, catalog);
          return {
          videos,
          tags: enrichRemoteTags(s.tags, catalog),
          progress: reconcileResumeForVideos(videos, s.progress, s.resumeProgress),
          folders: [
            ...s.folders,
            ...[...counts.entries()]
              .filter(([id]) => !s.folders.some((f) => f.id === id))
              .map(([id, videoCount]) => ({
                id,
                name: id.split(":")[1] || id,
                kind: "directory" as const,
                videoCount,
                adult: adultIds.has(id),
                needsPermission: true,
              })),
          ].map((f) =>
            counts.has(f.id) ? { ...f, videoCount: counts.get(f.id) ?? f.videoCount, ...(savedHealth.get(f.id) ?? {}) } : f,
          ),
        };
        });
      }
    } catch {
      // catalog optional
    }
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
      if (cacheFirst && cachedFolderIds.has(row.id)) {
        const snapshot = { id: row.id, health: "cached" as const, lastCheckedAt: Date.now(), videoCount: savedHealth.get(row.id)?.videoCount ?? 0 };
        set((s) => ({ folders: s.folders.map((folder) => folder.id === row.id ? { ...folder, name: row.name, needsPermission: false, ...snapshot } : folder) }));
        void saveSourceHealth(snapshot).catch(() => undefined);
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
      const categories = { ...s.categories };
      const progress = { ...s.progress };
      for (const id of ids) {
        delete favorites[id];
        delete likes[id];
        delete tags[id];
        delete categories[id];
        delete progress[id];
      }
      return {
        folders: s.folders.filter((f) => f.id !== folderId),
        videos: s.videos.filter((v) => v.folderId !== folderId),
        favorites,
        likes,
        tags,
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
      await deleteDirHandle(folderId);
    } catch {
      // ignore
    }
  },
  followRemoteQuery: async (query, kind = "auto") => {
    set({ remoteBusy: true });
    try {
      const { followRemote } = await import("@/lib/remote/api");
      const result = await followRemote({ data: { query, kind } });
      set((s) => {
        const follows = [result.channel, ...s.follows.filter((f) => f.id !== result.channel.id)];
        const folder: Folder = {
          id: result.channel.id,
          name: result.channel.title,
          kind: result.channel.kind,
          videoCount: result.videos.length,
        };
        return {
          follows,
          folders: [...s.folders.filter((f) => f.id !== folder.id), folder],
          videos: mergeVideos(
            s.videos.filter((v) =>
              v.folderId !== result.channel.id
              || s.favorites[v.id]
              || s.likes[v.id]
              // Archive pages are public and may be temporarily partial. A
              // manual Twitch refresh must extend/update the archive, never
              // collapse thousands of retained VOD cards to the newest page.
              || (result.channel.kind === "twitch" && v.remote?.kind === "twitch" && !v.remote.live),
            ),
            result.videos,
          ),
          tags: { ...s.tags, ...Object.fromEntries(result.videos.map((video) => [video.id, compactIngestedTags(s.tags[video.id] ?? [], remoteMetadataTags(video))])) },
          remoteBusy: false,
        };
      });
      persistNow(get);
      cacheRemotes(get);
      // A focused pull may add hundreds of old VODs. It updates its visible
      // creator card, not the notification center; bulk import emits one
      // completion summary after every requested channel has finished.
    } catch (err) {
      set({ remoteBusy: false });
      throw err;
    }
  },
  importBatch: async (items) => {
    const savedHandles = new Set(get().follows.map((follow) => `${follow.kind}:${canonicalFollowHandle(follow.kind, follow.handle)}`));
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
    const existing = new Set(get().follows.map((f) => f.id));
    set({
      remoteBusy: true,
      importProgress: { done: 0, total: unique.length, label: "Importing" },
    });
    let ok = 0;
    let failed = 0;
    const failedQueries: string[] = [];
    const failedReasons: Record<string, string> = {};
    // Each request resolves a small concurrent pool on the server. Keeping batches
    // below the provider cap but larger than the old ten-item batches makes long
    // Twitch imports visibly faster without overwhelming public endpoints.
    const chunk = 20;
    try {
      const { importChannels } = await import("@/lib/remote/api");
      for (let i = 0; i < unique.length; i += chunk) {
        const slice = unique.slice(i, i + chunk);
        let result: Awaited<ReturnType<typeof importChannels>>;
        try {
          result = await Promise.race([
            importChannels({ data: { items: slice } }),
            new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Provider request timed out")), 20_000)),
          ]);
        } catch (error) {
          failed += slice.length;
          failedQueries.push(...slice.map((item) => item.query));
          const reason = error instanceof Error && error.message ? error.message : "Provider request failed before public metadata could be read";
          for (const item of slice) failedReasons[item.query] = reason;
          set({ importProgress: { done: Math.min(i + slice.length, unique.length), total: unique.length, label: "Retrying next batch" } });
          continue;
        }
        ok += result.ok.length;
        failed += result.failed;
        if (result.failedQueries?.length) {
          failedQueries.push(...result.failedQueries);
          for (const query of result.failedQueries) failedReasons[query] = "Channel was not found publicly, is unavailable, or provider metadata could not be read";
        }
        set((s) => {
          let follows = s.follows;
          let folders = s.folders;
          let videos = s.videos;
          for (const row of result.ok) {
            const key = canonicalFollowHandle(row.channel.kind, row.channel.handle);
            follows = [row.channel, ...follows.filter((f) => canonicalFollowHandle(f.kind, f.handle) !== key)];
            const folder: Folder = {
              id: row.channel.id,
              name: row.channel.title,
              kind: row.channel.kind,
              videoCount: row.videos.length,
            };
            folders = [...folders.filter((f) => f.id !== folder.id), folder];
            videos = mergeVideos(
              videos.filter((v) => v.folderId !== row.channel.id || s.favorites[v.id] || s.likes[v.id]),
              row.videos,
            );
          }
          return {
            follows: dedupeFollows(follows),
            folders,
            videos,
            tags: { ...s.tags, ...Object.fromEntries(result.ok.flatMap((row) => row.videos.map((video) => [video.id, compactIngestedTags(s.tags[video.id] ?? [], remoteMetadataTags(video))]))) },
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
        cacheRemotes(get);
      }
      persistNow(get);
      const added = get().follows.filter((f) => !existing.has(f.id)).length;
      get().pushNotice({
        title: `Imported ${added || ok} channel${(added || ok) === 1 ? "" : "s"}`,
        body: failed ? `${failed} need attention. Open the importer for the saved reason list.` : "Latest uploads are on the shelves.",
        kind: unique[0]?.kind === "twitch" ? "twitch" : "youtube",
      });
      set({
        remoteBusy: false,
        importProgress: null,
      });
      persistNow(get);
      return { ok, failed, failedQueries, failedReasons };
    } catch (err) {
      set({ remoteBusy: false, importProgress: null });
      throw err;
    }
  },
  unfollow: (id) => {
    set((s) => ({
      follows: s.follows.filter((f) => f.id !== id),
      folders: s.folders.filter((f) => f.id !== id),
      videos: s.videos.filter((v) => v.folderId !== id || s.favorites[v.id] || s.likes[v.id]),
      sourceId: s.sourceId === id ? "home" : s.sourceId,
    }));
    persistNow(get);
    cacheRemotes(get);
  },
  refreshFollows: async () => {
    if (get().refreshing || get().remoteBusy) return { wentLive: [], newVideos: [] };
    const allFollows = dedupeFollows(get().follows);
    if (!allFollows.length) return { wentLive: [], newVideos: [] };
    const rotate = (items: FollowedChannel[], limit: number, cursor: "twitch" | "youtube" | "all") => {
      if (!items.length) return [];
      const savedCursor = cursor === "twitch" ? twitchRefreshCursor : cursor === "youtube" ? youtubeRefreshCursor : remoteRefreshCursor;
      const count = Math.min(limit, items.length);
      const start = savedCursor % items.length;
      const next = Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
      const updated = (start + count) % items.length;
      if (cursor === "twitch") twitchRefreshCursor = updated;
      else if (cursor === "youtube") youtubeRefreshCursor = updated;
      else remoteRefreshCursor = updated;
      return next;
    };
    const twitch = allFollows.filter((follow) => follow.kind === "twitch");
    const youtube = allFollows.filter((follow) => follow.kind === "youtube");
    // Twitch archive depth used to depend on wherever a mixed channel cursor
    // happened to land. Reserve part of every refresh for it so a large
    // YouTube list cannot starve VOD refreshes indefinitely.
    const current = twitch.length && youtube.length
      ? [...rotate(twitch, Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "twitch"), ...rotate(youtube, REMOTE_REFRESH_BATCH_SIZE - Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "youtube")]
      : rotate(allFollows, REMOTE_REFRESH_BATCH_SIZE, "all");
    set({ refreshing: true });
    const beforeLive = new Set(
      get()
        .videos.filter((v) => v.remote?.live)
        .map((v) => v.id),
    );
    const beforeIds = new Set(get().videos.map((v) => v.id));
    try {
      const { refreshRemotes } = await import("@/lib/remote/api");
      const result = await refreshRemotes({ data: { channels: current } });
      const followIds = new Set(result.refreshedIds);

      set((s) => {
        const mergedVideos = mergeRemoteRefresh(s.videos, result.videos, result.refreshedIds, new Set([...Object.keys(s.favorites), ...Object.keys(s.likes), ...s.history.map((entry) => entry.id)]));
        const folderCounts = new Map<string, number>();
        for (const video of mergedVideos) folderCounts.set(video.folderId, (folderCounts.get(video.folderId) ?? 0) + 1);
        return {
        follows: dedupeFollows([...result.channels, ...s.follows]),
        remoteCheckedAt: Date.now(),
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
        progress: reconcileResumeForVideos(mergedVideos, s.progress, s.resumeProgress),
        tags: { ...s.tags, ...Object.fromEntries(result.videos.map((video) => [video.id, compactIngestedTags(s.tags[video.id] ?? [], remoteMetadataTags(video))])) },
        remoteRefreshStatus: {
          at: Date.now(),
          checked: current.length,
          refreshed: result.refreshedIds.length,
          failed: Math.max(0, current.length - result.refreshedIds.length),
          youtube: result.videos.filter((video) => video.remote?.kind === "youtube").length,
          twitch: result.videos.filter((video) => video.remote?.kind === "twitch" && !video.remote.live).length,
        },
        remoteRetryAt: result.retryAt,
      };
      });
      persistNow(get);
      cacheRemotes(get);
      const wentLive = result.channels.filter(
        (c) =>
          c.live &&
          !beforeLive.has(`tw:${c.handle}:live`) &&
          !beforeLive.has(`tw:${c.handle.toLowerCase()}:live`),
      );
      const newVideos = result.videos.filter((v) => !beforeIds.has(v.id) && Boolean(v.remote));
      return { wentLive, newVideos };
    } catch {
      set({ remoteRefreshStatus: { at: Date.now(), checked: current.length, refreshed: 0, failed: current.length, youtube: 0, twitch: 0 } });
      return { wentLive: [], newVideos: [] };
    } finally {
      set({ refreshing: false });
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
    const video = get().videos.find((item) => item.id === id);
    if (!video || video.remote) return;
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

type SelectorMemo = { public?: LibraryVideo[]; youtube?: LibraryVideo[]; twitch?: LibraryVideo[]; live?: LibraryVideo[]; classics?: LibraryVideo[]; continuePublic?: LibraryVideo[]; continueAdult?: LibraryVideo[] };
const selectorMemo = new WeakMap<LibraryState, SelectorMemo>();
function memoFor(state: LibraryState) { let memo = selectorMemo.get(state); if (!memo) { memo = {}; selectorMemo.set(state, memo); } return memo; }
const resumeLookupMemo = new WeakMap<LibraryState, Map<string, LibraryVideo>>();
function resumeLookup(state: LibraryState, list: LibraryVideo[]) {
  const cached = resumeLookupMemo.get(state);
  if (cached) return cached;
  const index = new Map<string, LibraryVideo>();
  for (const video of list) {
    // Provider watch URLs and local path/fingerprint-like identifiers survive
    // a reimport more reliably than a transient catalog row id.
    for (const key of [video.id, video.remote?.watchUrl, video.remote?.embedUrl, video.src, video.path]) if (key) index.set(key, video);
  }
  resumeLookupMemo.set(state, index);
  return index;
}

function publicList(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  if (memo.public) return memo.public;
  const adult = adultIdSet(state.folders);
  const knownFolders = new Set(state.folders.map((folder) => folder.id));
  // Cached catalog entries can outlive a removed source. Keep their metadata in storage,
  // but never promote an orphaned entry into Home or search results.
  let list = state.videos.filter((v) => !state.unavailable[v.id] && !adult.has(v.folderId) && (knownFolders.has(v.folderId) || Boolean(v.remote) || v.isSample));
  if (state.hideDemo) list = list.filter((v) => !v.isSample);
  memo.public = list;
  return list;
}

function adultList(state: LibraryState): LibraryVideo[] {
  // Adults section is open; private shelves still stay off public rails via folder.adult.
  const adult = adultIdSet(state.folders);
  return state.videos.filter((v) => !state.unavailable[v.id] && adult.has(v.folderId));
}

export function selectVisible(state: LibraryState): LibraryVideo[] {
  const q = state.query.trim().toLowerCase();
  const inAdults = state.sourceId === "adults";
  let list = inAdults ? adultList(state) : publicList(state);
  if (state.sourceId === "favorites") {
    list = list.filter((v) => state.favorites[v.id]);
  } else if (state.sourceId === "continue") {
    list = recoveryList(state, false).filter((video) => isResumable(video, resumeForVideo(state, video)));
  } else if (state.sourceId === "history") {
    const byId = new Map(list.map((v) => [v.id, v]));
    list = state.history.map((h) => byId.get(h.id)).filter((v): v is LibraryVideo => v != null);
  } else if (state.sourceId === "movies") {
    list = list.filter((v) => !v.remote);
  } else if (state.sourceId === "youtube") {
    list = list.filter((v) => v.remote?.kind === "youtube");
  } else if (state.sourceId === "twitch") {
    list = list.filter((v) => v.remote?.kind === "twitch");
  } else if (state.sourceId === "live") {
    list = list.filter((v) => v.remote?.live);
  } else if (state.sourceId === "home" || state.sourceId === "all") {
    // keep public list
  } else if (!SYSTEM_SOURCES.has(state.sourceId) && !inAdults) {
    list = list.filter((v) => v.folderId === state.sourceId);
  }
  if (q) {
    librarySearchIndex.sync(state.videos, state.tags, state.categories);
    const hits = librarySearchIndex.search(q);
    if (hits) list = list.filter((v) => hits.has(v.id));
  }
  if (state.sourceId === "history") return list;
  const sorted = [...list];
  sorted.sort((a, b) => {
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
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }
  });
  return sorted;
}

function scoped(state: LibraryState, adult: boolean): LibraryVideo[] {
  return adult ? adultList(state) : publicList(state);
}

// Favorites and history are recovery views. Unlike a browse shelf, they must
// retain a title when its folder needs reconnecting or a remote embed was
// briefly marked unavailable; the card can still explain that state.
function recoveryList(state: LibraryState, adult: boolean): LibraryVideo[] {
  const adultIds = adultIdSet(state.folders);
  return state.videos.filter((video) => {
    if (state.hideDemo && video.isSample) return false;
    return adult ? adultIds.has(video.folderId) : !adultIds.has(video.folderId);
  });
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

export function selectContinue(state: LibraryState, adult = false): LibraryVideo[] {
  const memo = memoFor(state);
  const existing = adult ? memo.continueAdult : memo.continuePublic;
  if (existing) return existing;
  const items = recoveryList(state, adult).filter((video) => isResumable(video, resumeForVideo(state, video)));
  items.sort((a, b) => (resumeForVideo(state, b)?.at ?? 0) - (resumeForVideo(state, a)?.at ?? 0));
  // VideoGrid progressively mounts pages, so Continue itself must not silently
  // truncate a large resume list before the view gets a chance to paginate it.
  if (adult) memo.continueAdult = items;
  else memo.continuePublic = items;
  return items;
}

export function selectFavorites(state: LibraryState, adult = false): LibraryVideo[] {
  return recoveryList(state, adult).filter((v) => state.favorites[v.id]);
}

export function resumeForVideo(state: Pick<LibraryState, "progress" | "resumeProgress">, video: LibraryVideo): ResumeMark | undefined {
  return newestResume(state.progress[video.id], ...stableResumeKeys(video).map((key) => state.resumeProgress[key]));
}

export function selectHistory(state: LibraryState, adult = false): LibraryVideo[] {
  const list = recoveryList(state, adult);
  const byId = resumeLookup(state, list);
  const seen = new Set<string>();
  return state.history
    .filter((h) => !seen.has(h.id) && Boolean(seen.add(h.id)))
    .map((h) => {
      const cached = byId.get(h.id) ?? (h.url ? byId.get(h.url) : undefined);
      if (cached) return cached;
      const live = state.videos.find((item) => item.id === h.id);
      if (live) {
        const isAdult = adultIdSet(state.folders).has(live.folderId);
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
      const isCamsoda = /camsoda\.com/i.test(historyUrl);
      const isMfc = /myfreecams\.com|mfc\.cdn/i.test(historyUrl);
      const isReddit = /reddit\.com|redd\.it/i.test(historyUrl);
      const isBooru = /xbooru\.com|tbib\.org|hypnohub\.net/i.test(historyUrl);
      const isRedgifs = /redgifs\.com/i.test(historyUrl);
      const adultKind = isEporner ? "eporner" : isRedtube ? "redtube" : isChaturbate ? "chaturbate" : isCamsoda ? "camsoda" : isMfc ? "myfreecams" : isReddit ? "reddit" : isBooru ? "booru" : isRedgifs ? "redgifs" : null;
      if (!adult && (isEporner || isRedtube || isChaturbate || isCamsoda || isMfc || isReddit || isBooru || isRedgifs)) return null;
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
    })
    .filter((v): v is LibraryVideo => v != null);
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
export function selectAdultRemote(state: LibraryState): LibraryVideo[] {
  return state.videos
    .filter(
      (v) =>
        v.remote?.kind === "eporner" ||
        v.remote?.kind === "redtube" ||
        v.remote?.kind === "chaturbate" ||
        v.remote?.kind === "camsoda" ||
        v.remote?.kind === "myfreecams" ||
        v.remote?.kind === "reddit" ||
        v.remote?.kind === "booru" ||
        v.remote?.kind === "redgifs" ||
        (ADULT_FOLDER_IDS as readonly string[]).includes(v.folderId),
    )
    .sort((a, b) => b.addedAt - a.addedAt);
}

export function selectYoutube(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  return memo.youtube ?? (memo.youtube = [...publicList(state).filter((v) => v.remote?.kind === "youtube")].sort((a, b) => b.addedAt - a.addedAt));
}

export function selectTwitch(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  if (memo.twitch) return memo.twitch;
  const twitch = publicList(state).filter((v) => v.remote?.kind === "twitch");
  const live = twitch.filter((v) => v.remote?.live);
  const vods = twitch.filter((v) => !v.remote?.live);
  memo.twitch = [...live, ...vods];
  return memo.twitch;
}

export function selectLive(state: LibraryState): LibraryVideo[] {
  const memo = memoFor(state);
  return memo.live ?? (memo.live = publicList(state).filter((v) => v.remote?.live));
}

export function selectClassics(state: LibraryState): LibraryVideo[] {
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

