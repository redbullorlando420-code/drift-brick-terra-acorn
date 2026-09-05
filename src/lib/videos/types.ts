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

export type FolderKind = "demo" | "directory" | "files" | "youtube" | "twitch";

export type Folder = {
  id: string;
  name: string;
  kind: FolderKind;
  videoCount: number;
  needsPermission?: boolean;
  recommended?: string;
  adult?: boolean;
  drive?: boolean;
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
  src?: string;
  year?: number;
  genre?: string;
  tagline?: string;
  collection?: "classics" | "shorts";
  poster?: string;
  remote?: RemoteRef;
};

export type RemoteKind = "youtube" | "twitch";

export type RemoteRef = {
  kind: RemoteKind;
  videoId?: string;
  channelId?: string;
  channelName?: string;
  live?: boolean;
  viewers?: number;
  embedUrl?: string;
  watchUrl?: string;
  previewUrl?: string;
};

export type FollowedChannel = {
  id: string;
  kind: RemoteKind;
  handle: string;
  title: string;
  channelId?: string;
  thumb?: string;
  live?: boolean;
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
  | "movies"
  | "favorites"
  | "history"
  | "adults"
  | "continue"
  | "youtube"
  | "twitch"
  | "live"
  | "prints"
  | "games"
  | "shop"
  | "streaming"
  | "social"
  | "watch-room"
  | "settings"
  | string;

export type ProgressMark = { t: number; d: number; at: number };

export type HistoryEntry = { id: string; at: number };

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
  "all",
  "movies",
  "favorites",
  "history",
  "adults",
  "continue",
  "youtube",
  "twitch",
  "live",
  "prints",
  "games",
  "shop",
  "streaming",
  "social",
  "watch-room",
  "settings",
]);
