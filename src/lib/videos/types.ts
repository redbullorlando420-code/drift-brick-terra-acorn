export const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mkv",
  "mov",
  "m4v",
  "avi",
  "ogv",
  "ogg",
  "3gp",
  "wmv",
  "flv",
  "ts",
  "mts",
  "m2ts",
  "mpeg",
  "mpg",
  "mpe",
  "asf",
  "m2v",
  "vob",
]);

export const NATIVE_PLAYABLE = new Set(["mp4", "webm", "ogv", "ogg", "m4v", "mov"]);

export const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  ".cache",
  ".next",
  ".nuxt",
  "dist",
  "build",
  "__pycache__",
  "system volume information",
  "$recycle.bin",
  "windows",
  "windows.old",
  "program files",
  "program files (x86)",
  "programdata",
  "recovery",
  "perflogs",
  "boot",
  "intel",
  "amd",
  "nvidia",
  "nvidia corporation",
  "msocache",
  "config.msi",
  "$windows.~bt",
  "$windows.~ws",
  "documents and settings",
  "appdata",
  "application data",
  "local settings",
  "library",
  "system",
  "applications",
  "private",
  "usr",
  "proc",
  "sys",
  "dev",
  "run",
  "snap",
  "var",
  "cores",
  "tmp",
  "temp",
  "cache",
]);

export type FolderKind = "demo" | "directory" | "files" | "youtube" | "twitch" | "eporner" | "redtube" | "chaturbate" | "myfreecams" | "reddit" | "booru" | "redgifs";

export type Folder = {
  id: string;
  name: string;
  kind: FolderKind;
  videoCount: number;
  photoCount?: number;
  needsPermission?: boolean;
  recommended?: string;
  adult?: boolean;
  drive?: boolean;
  /** Cached source-index health, updated during restore and explicit rescans. */
  health?: "cached" | "healthy" | "permission-needed" | "unavailable";
  lastCheckedAt?: number;
};

export type LibraryVideo = {
  id: string;
  folderId: string;
  name: string;
  path: string;
  extension: string;
  mime: string;
  size: number;
  duration?: number;
  addedAt: number;
  isSample?: boolean;
  /** A locally saved/watched provider card retained after its channel was unfollowed. */
  retainedAfterUnfollow?: boolean;
  /** Lightweight browse record; the full description/comments remain on disk. */
  detailsOnDisk?: boolean;
  src?: string;
  year?: number;
  genre?: string;
  tagline?: string;
  /** Provider description retained for local search and bounded keyword extraction. */
  description?: string;
  collection?: "classics" | "shorts";
  poster?: string;
  remote?: RemoteRef;
};

export type FollowKind = "youtube" | "twitch";
export type RemoteKind = FollowKind | "eporner" | "redtube" | "chaturbate" | "myfreecams" | "reddit" | "booru" | "redgifs";

/**
 * Local-only attribution for editable catalog metadata. Tags remain a compact
 * search index, while this sidecar explains where each value originated and
 * prevents a later provider refresh from replacing a deliberate user edit.
 */
export type MetadataTagSource = "manual" | "local-name" | "companion-inspection" | "local-vision" | `provider:${RemoteKind}` | "legacy";
export type VideoMetadataProvenance = {
  youtubeTextTagVersion?: number;
  /** The latest known source for each normalized tag on the title. */
  tags: Record<string, MetadataTagSource>;
  /** A lock is set by the metadata editor and applies to the whole field. */
  lockedFields?: Array<"tags" | "category">;
  /** Categories are only user-authored today, but keep their source explicit. */
  category?: "manual" | "legacy";
  updatedAt?: number;
};

/** A local, user-facing explanation of a failed public provider refresh. */
export type ProviderFailure = {
  kind: "unavailable" | "rate-limited" | "malformed" | "network-offline" | "integrity-challenge" | "public-page-limit" | "response-budget";
  message: string;
  recovery: string;
  at: number;
  retryAt?: number;
  /** Consecutive live failures; reset by a successful live observation. */
  attempts?: number;
  cooldownScope?: 'catalog' | 'page' | 'feed' | 'live' | 'details' | 'all';
};

export type RemoteRef = {
  /** Exact Twitch media identity and the public shelf that supplied its subtype. */
  twitchContent?: import('./twitch-content').TwitchContentEvidence;
  kind: RemoteKind;
  /** A post can be discovered on one provider while its media is hosted by another. */
  sourceKinds?: RemoteKind[];
  /** Saved creator/playlist memberships for one deduplicated YouTube card. */
  sourceIds?: string[];
  videoId?: string;
  channelId?: string;
  channelName?: string;
  live?: boolean;
  /** Presentation-only: an old live observation is unconfirmed, not offline. */
  liveUnconfirmed?: boolean;
  /** First successful missing-broadcast observation; positive live evidence clears it. */
  liveOfflineSince?: number;
  /** YouTube catalog evidence; omitted by feeds that expose no format. */
  youtubeType?: import('./youtube-metadata').YoutubeContentKind;
  /** Creator-authored video keywords, fetched explicitly from the watch page. */
  youtubeKeywords?: string[];
  youtubeTagsCheckedAt?: number;
  /** Compact description evidence survives when full details move to disk. */
  youtubeTagSummary?: {
    version: number;
    sources: Record<string, 'video-tag' | 'hashtag' | 'chapter' | 'title' | 'description'>;
    topics: Array<{ topic: string; reason: string }>;
  };
  /** addedAt is the publication timestamp for YouTube; no duplicate epoch. */
  publishedSource?: import('./youtube-metadata').YoutubePublishedSource;
  /** Exact provider calendar date; avoids shifting midnight UTC to yesterday. */
  publishedDate?: string;
  /** Provider display label (for example “2 days ago”); never an inferred date. */
  publishedLabel?: string;
  /** Precision belongs to the provider observation; relative labels never create an epoch. */
  publishedPrecision?: 'instant' | 'day' | 'relative' | 'unknown';
  publishedLabelAt?: number;
  viewers?: number;
  /** Epoch time of the provider response that supplied live metadata. */
  observedAt?: number;
  /** Public provider view total when the source exposes one. */
  views?: number;
  embedUrl?: string;
  watchUrl?: string;
  previewUrl?: string;
  /** Alternate poster URLs tried when the primary CDN frame 404/410s. */
  thumbFallbacks?: string[];
  /** Real provider comments when an official public feed exposes them. */
  comments?: Array<{ id: string; author?: string; body: string; score?: number; kind?: "comment" | "chat" }>;
};

export const VIEWER_FRESHNESS_MS = 5 * 60_000;

/** Old cached viewer counts are intentionally not treated as current demand. */
export function hasFreshViewerCount(remote?: RemoteRef, now = Date.now()) {
  return Boolean(
    remote
      && typeof remote.viewers === "number"
      && Number.isFinite(remote.viewers)
      && remote.viewers >= 0
      && typeof remote.observedAt === "number"
      && now >= remote.observedAt
      && now - remote.observedAt <= VIEWER_FRESHNESS_MS,
  );
}

export type TwitchPullDiagnostics = {
  at: number; pages: number; received: number; accepted: number; duplicates: number;
  resumed: boolean; stage?: 'ARCHIVE' | 'HIGHLIGHT' | 'UPLOAD'; lastVideoId?: string;
  stopReason: 'page-budget' | 'entry-budget' | 'exhausted' | 'stalled' | 'incomplete-page' | 'challenge' | 'provider-error' | 'entry-limit';
  error?: string;
};

export type TwitchRetryState = { attempts: number; retryAt: number };
export type TwitchClipDiagnostics = {
  at: number; mode: 'recent'|'archive'; pages: number; received: number; accepted: number; duplicates: number;
  requested?: number; maxPages?: number;
  stopReason?: 'quota'|'page-budget'|'exhausted'|'partial-error'|'provider-hold';
  /** Delivery does not change the original provider observation clock. */
  cacheHit?: boolean; servedAt?: number;
  windows: Array<{period: string; pages: number; received: number; accepted: number; duplicates: number; requested?: number; stop: 'budget'|'quota'|'exhausted'|'error'; error?: string}>;
};

export type RecentPullState = {
  attemptedAt: number; checkedAt?: number; failures: number; retryAt?: number;
  failure?: ProviderFailure; newestVideoId?: string;
};
export type FollowedChannel = {
  /** Optional user-owned automatic content settings. Legacy follows include both at normal priority. */
  twitchPullPolicy?: import('./twitch-pull-policy').TwitchPullPolicy;
  youtubeLiveEvidence?: import('../remote/youtube-live-evidence').YoutubeLiveEvidence;
  youtubeLiveVideoIds?: string[];
  youtubeLiveKnownOverflow?: boolean;
  id: string;
  kind: FollowKind;
  liveOfflineSince?: number;
  handle: string;
  title: string;
  channelId?: string;
  thumb?: string;
  description?: string;
  /** An unresolved word created by the legacy whitespace importer. */
  importNeedsReview?: boolean;
  importQuery?: string;
  /** Explicit identity review; invalidated when conflicting evidence changes. */
  identityReview?: { fingerprint: string; at: number };
  live?: boolean;
  /** Freshness ledger for provider scheduling and a truthful last-check UI. */
  lastCheckedAt?: number;
  /** Independent YouTube live-state poll rotation; does not advance the archive cursor. */
  liveCheckedAt?: number;
  /** Recent uploads have independent rotation, success, retry and feed watermark. */
  recentPull?: RecentPullState;
  newestPublishedAt?: number;
  /** Stable Atom upload identity used to trim routine YouTube refreshes. */
  newestVideoId?: string;
  /** Saved Innertube Videos-grid position for bounded archive sweeps. */
  catalogCursor?: string;
  catalogCheckedAt?: number;
  catalogExhaustedAt?: number;
  /** Independent Twitch broadcast-shelf continuation for focused archive pulls. */
  twitchArchiveCursor?: string;
  twitchArchiveCheckedAt?: number;
  twitchArchiveExhaustedAt?: number;
  twitchArchiveLastVideoId?: string;
  twitchArchiveDiagnostics?: TwitchPullDiagnostics;
  twitchArchiveRetry?: TwitchRetryState;
  twitchLiveRetry?: TwitchRetryState;
  lastLiveWarning?: {at:number;message:string};
  /** All-time clip shelf continuation used by repeated focused clip pulls. */
  twitchClipCursor?: string;
  twitchClipExhaustedAt?: number;
  twitchClipCheckedAt?: number;
  twitchClipRecentCheckedAt?: number;
  twitchClipRetry?: TwitchRetryState;
  twitchClipRecentRetry?: TwitchRetryState;
  twitchClipRecentAttemptedAt?: number;
  twitchClipArchiveAttemptedAt?: number;
  twitchClipDiagnostics?: TwitchClipDiagnostics;
  lastClipFailure?: ProviderFailure;
  lastResponseCount?: number;
  /** Server-session cache telemetry; this is diagnostic metadata, not a claim
   * that the provider was contacted during this refresh. */
  cache?: {
    at: number;
    hits: number;
    misses: number;
    scope: "feed" | "catalog" | "uncached";
    entries?: number;
    estimatedBytes?: number;
  };
  /** Last failed public refresh. Successful checks explicitly clear this. */
  lastProviderFailure?: ProviderFailure;
  /** Live checks have separate failures from upload/feed catalog checks. */
  lastLiveFailure?: ProviderFailure;
};

export type AppNotice = {
  id: string;
  at: number;
  title: string;
  body: string;
  kind: "youtube" | "twitch" | "scan" | "system";
  videoId?: string;
  read: boolean;
};

export type SortKey =
  "name" | "added" | "size" | "duration" | "recent" | "type" | "folder" | "path";

export type SortDir = "asc" | "desc";

export type SizeFilter = "any" | "small" | "medium" | "large" | "huge";

export type GroupBy = "none" | "folder" | "letter" | "type";

export type SourceId =
  | "home"
  | "landing"
  | "movies"
  | "anime"
  | "favorites"
  | "history"
  | "adults"
  | "continue"
  | "youtube"
  | "twitch"
  | "live"
  | "prints"
  | "photos"
  | "spotify"
  | "games"
  | "shop"
  | "streaming"
  | "stream-signal"
  | "social"
  | "watch-room"
  | "settings"
  | "assistant"
  | string;

export type ProgressMark = { t: number; d: number; at: number };

/** A recovery-safe resume point retained under stable provider or local identities. */
export type ResumeMark = ProgressMark;

export type HistoryEntry = {
  /** Monotonic, device-local event identity used to replay the append-only journal safely. */
  eventId?: string;
  id: string;
  at: number;
  /** Provider or local URL retained so a remote history entry remains useful if its card is later evicted. */
  url?: string;
  /** Last trustworthy point when the entry was created; optional for v1 data. */
  position?: number;
  duration?: number;
  source?: "open" | "progress" | "watch-room";
  /** Real card title captured at play time so recovery rows stay named. */
  title?: string;
  poster?: string;
  /** Rating captured at activity time; the current value remains in the durable feedback ledger. */
  rating?: number;
};

export type ViewMode = "grid" | "list";

export type WellKnownStart =
  "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";

export const RECOMMENDED_FOLDERS: {
  id: WellKnownStart;
  label: string;
  hint: string;
}[] = [
  { id: "videos", label: "Videos", hint: "Movies & TV" },
  { id: "downloads", label: "Downloads", hint: "Saved files" },
  { id: "desktop", label: "Desktop", hint: "On the desktop" },
  { id: "documents", label: "Documents", hint: "Docs folder" },
  { id: "pictures", label: "Pictures", hint: "Camera rolls" },
];

export const SORT_OPTIONS: { key: SortKey; label: string; hint: string }[] = [
  { key: "name", label: "Name", hint: "A–Z" },
  { key: "added", label: "Date added", hint: "Newest in the library" },
  { key: "recent", label: "Last played", hint: "Watch history" },
  { key: "size", label: "File size", hint: "Largest first" },
  { key: "duration", label: "Duration", hint: "Longest first" },
  { key: "type", label: "Format", hint: "mp4, mkv, mov…" },
  { key: "folder", label: "Folder", hint: "By source" },
  { key: "path", label: "Path", hint: "Disk location" },
];

export function defaultSortDir(key: SortKey): SortDir {
  return key === "name" || key === "folder" || key === "path" || key === "type" ? "asc" : "desc";
}

export function isVideoFile(name: string, mime?: string): boolean {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
  if (VIDEO_EXTENSIONS.has(ext)) return true;
  return Boolean(mime && mime.startsWith("video/"));
}

export function shouldSkipDir(name: string): boolean {
  if (name.startsWith(".")) return true;
  return SKIP_DIRS.has(name.toLowerCase());
}

export function isDriveName(name: string): boolean {
  const n = name.trim();
  if (/^[a-z]:?$/i.test(n)) return true;
  if (n === "/" || n === "\\") return true;
  return /^(macintosh hd|local disk|os|windows|ubuntu|fedora|linux)$/i.test(n);
}

export function mimeFromName(name: string): string {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  switch (ext) {
    case "mp4":
    case "m4v":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "ogv":
    case "ogg":
      return "video/ogg";
    case "mov":
      return "video/quicktime";
    case "mkv":
      return "video/x-matroska";
    case "avi":
      return "video/x-msvideo";
    default:
      return "video/*";
  }
}

export function isLikelyPlayable(ext: string): boolean {
  return NATIVE_PLAYABLE.has(ext.toLowerCase());
}

export function titleOf(video: LibraryVideo): string {
  return video.name.replace(/\.[^/.]+$/, "");
}

export function isClassicVideo(video: LibraryVideo): boolean {
  if (video.collection === "classics") return true;
  const blob = `${video.path} ${video.name} ${video.genre ?? ""}`.toLowerCase();
  return /\b(classic|classics|noir|silent|golden.?age)\b/.test(blob);
}

export function sizeBucket(size: number): Exclude<SizeFilter, "any"> {
  const mb = size / (1024 * 1024);
  if (mb < 100) return "small";
  if (mb < 1024) return "medium";
  if (mb < 4096) return "large";
  return "huge";
}

export function letterOf(video: LibraryVideo): string {
  const t = titleOf(video).trim();
  const ch = t.charAt(0).toUpperCase();
  return ch >= "A" && ch <= "Z" ? ch : "#";
}

export const SYSTEM_SOURCES = new Set([
  "home",
  "landing",
  "all",
  "movies",
  "favorites",
  "history",
  "adults",
  "adult-fetishes",
  "continue",
  "youtube",
  "twitch",
  "live",
  "prints",
  "photos",
  "spotify",
  "games",
  "shop",
  "streaming",
  "stream-signal",
  'stable-diffusion',
  'remote-desktop',
  "social",
  "watch-room",
  "settings",
]);
