import { create } from "zustand";
import { DEMO_FOLDER, FEATURED_YOUTUBE, SAMPLE_VIDEOS, YT_FOLDER } from "./samples";
import {
  appendCatalogVideos,
  clearFolderVideos,
  deleteDirHandle,
  loadCatalogVideos,
  loadDirHandles,
  loadPrefs,
  saveDirHandle,
  saveFolderVideos,
  savePrefs,
  type Prefs,
} from "./persist";
import { hashPin, isPinShape } from "./pin";
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
  SortKey,
  SourceId,
  ViewMode,
  WellKnownStart,
} from "./types";
import { librarySearchIndex } from "./search-index";
import { isClassicVideo, SYSTEM_SOURCES } from "./types";

const HISTORY_CAP = 80;
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
  history: HistoryEntry[];
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
  notifyPush: boolean;
  remoteBusy: boolean;
  importProgress: { done: number; total: number; label: string } | null;
  setQuery: (q: string) => void;
  setSort: (s: SortKey) => void;
  setView: (v: ViewMode) => void;
  setSource: (id: SourceId) => void;
  toggleFavorite: (id: string) => void;
  toggleLike: (id: string) => void;
  setVideoTags: (id: string, tags: string[]) => void;
  setVideoCategory: (id: string, category: string) => void;
  markProgress: (id: string, t: number, d: number) => void;
  recordPlay: (id: string) => void;
  clearHistory: () => void;
  openVideo: (id: string) => void;
  openPreview: (id: string) => void;
  closePreview: () => void;
  closePlayer: () => void;
  removeVideo: (id: string) => void;
  playRelative: (delta: number, playlist: string[]) => void;
  setHideDemo: (hide: boolean) => void;
  setHardwareAccel: (on: boolean) => void;
  setFolderAdult: (folderId: string, adult: boolean) => void;
  setAdultPin: (pin: string) => Promise<boolean>;
  unlockAdults: (pin: string) => Promise<boolean>;
  lockAdults: () => void;
  resetAdultPin: () => void;
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
  removeFolder: (folderId: string) => Promise<void>;
  followRemoteQuery: (query: string, kind?: "auto" | "youtube" | "twitch") => Promise<void>;
  importBatch: (
    items: { query: string; kind: "youtube" | "twitch" }[],
  ) => Promise<{ ok: number; failed: number; failedQueries: string[] }>;
  unfollow: (id: string) => void;
  refreshFollows: () => Promise<{ wentLive: FollowedChannel[]; newVideos: LibraryVideo[] }>;
  pushNotice: (n: Omit<AppNotice, "id" | "at" | "read">) => void;
  markNoticesRead: () => void;
  setNotifyPush: (on: boolean) => void;
};

function persistNow(get: () => LibraryState) {
  const s = get();
  const prefs: Prefs = {
    favorites: Object.keys(s.favorites),
    likes: Object.keys(s.likes),
    tags: s.tags,
    categories: s.categories,
    progress: s.progress,
    history: s.history,
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
  };
  savePrefs(prefs);
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
    progress: prefs.progress ?? {},
    history: prefs.history ?? [],
    view: prefs.view ?? "grid",
    sort: prefs.sort ?? "name",
    hideDemo: prefs.hideDemo ?? false,
    sourceId: prefs.sourceId === "adults" ? "home" : (prefs.sourceId ?? "home"),
    hardwareAccel: prefs.hardwareAccel ?? true,
    adultPinHash: prefs.adultPinHash ?? null,
    follows: prefs.follows?.length ? prefs.follows : STARTER_FOLLOWS,
    notices: prefs.notices ?? [],
    notifyPush: prefs.notifyPush ?? false,
  };
}

function adultIdSet(folders: Folder[]) {
  return new Set(folders.filter((f) => f.adult).map((f) => f.id));
}

export function isAdultVideo(video: LibraryVideo, folders: Folder[]) {
  return adultIdSet(folders).has(video.folderId);
}

export const useLibrary = create<LibraryState>((set, get) => ({
  folders: [DEMO_FOLDER, YT_FOLDER],
  videos: [...SAMPLE_VIDEOS, ...FEATURED_YOUTUBE],
  query: "",
  sort: "name",
  view: "grid",
  sourceId: "home",
  favorites: {},
  likes: {},
  tags: {},
  categories: {},
  progress: {},
  history: [],
  hideDemo: false,
  hardwareAccel: true,
  adultPinHash: null,
  adultsUnlocked: false,
  activeId: null,
  previewId: null,
  scanning: null,
  hydrated: false,
  follows: STARTER_FOLLOWS,
  notices: [],
  notifyPush: false,
  remoteBusy: false,
  importProgress: null,
  setQuery: (query) => set({ query }),
  setSort: (sort) => {
    set({ sort });
    persistNow(get);
  },
  setView: (view) => {
    set({ view });
    persistNow(get);
  },
  setSource: (sourceId) => {
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
    persistNow(get);
  },
  toggleLike: (id) => {
    set((s) => {
      const likes = { ...s.likes };
      if (likes[id]) delete likes[id];
      else likes[id] = true;
      return { likes };
    });
    persistNow(get);
  },
  setVideoTags: (id, tags) => {
    set((s) => ({
      tags: {
        ...s.tags,
        [id]: [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(
          0,
          12,
        ),
      },
    }));
    persistNow(get);
  },
  setVideoCategory: (id, category) => {
    set((s) => ({ categories: { ...s.categories, [id]: category.trim().slice(0, 40) } }));
    persistNow(get);
  },
  markProgress: (id, t, d) => {
    set((s) => ({
      progress: { ...s.progress, [id]: { t, d, at: Date.now() } },
    }));
    persistSoon(get);
  },
  recordPlay: (id) => {
    set((s) => {
      const next = [{ id, at: Date.now() }, ...s.history.filter((h) => h.id !== id)];
      return { history: next.slice(0, HISTORY_CAP) };
    });
    persistNow(get);
  },
  clearHistory: () => {
    set({ history: [] });
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
      delete favorites[id];
      delete likes[id];
      delete tags[id];
      delete categories[id];
      delete progress[id];
      return {
        videos: s.videos.filter((video) => video.id !== id),
        activeId: s.activeId === id ? null : s.activeId,
        previewId: s.previewId === id ? null : s.previewId,
        favorites,
        likes,
        tags,
        categories,
        progress,
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
  setAdultPin: async (pin) => {
    if (!isPinShape(pin)) return false;
    const adultPinHash = await hashPin(pin);
    set({ adultPinHash, adultsUnlocked: true });
    persistNow(get);
    return true;
  },
  unlockAdults: async (pin) => {
    const { adultPinHash } = get();
    if (!adultPinHash || !isPinShape(pin)) return false;
    const hashed = await hashPin(pin);
    if (hashed !== adultPinHash) return false;
    set({ adultsUnlocked: true, sourceId: "adults" });
    return true;
  },
  lockAdults: () => {
    set((s) => {
      const current = s.videos.find((v) => v.id === s.activeId);
      const hidePlayer = current ? isAdultVideo(current, s.folders) : false;
      return {
        adultsUnlocked: false,
        sourceId: s.sourceId === "adults" ? "home" : s.sourceId,
        activeId: hidePlayer ? null : s.activeId,
      };
    });
  },
  resetAdultPin: () => {
    set({ adultPinHash: null, adultsUnlocked: false });
    persistNow(get);
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
      sourceId: adult ? "adults" : folderId,
    }));
    let writeChain: Promise<void> = clearFolderVideos(folderId).catch(() => undefined);
    try {
      const videos = await ingestDirectoryHandle(handle, folderId, {
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
        sourceId: adult ? "adults" : videos.length ? folderId : s.sourceId,
      }));
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
      sourceId: adult ? "adults" : folderId,
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
      sourceId: adult ? "adults" : videos.length ? folderId : s.sourceId,
    }));
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
      sourceId: adult ? "adults" : videos.length ? folderId : s.sourceId,
    }));
    flushPersist(get);
    if (videos.length) await saveFolderVideos(folderId, videos).catch(() => undefined);
  },
  restoreFolders: async () => {
    const prefsState = applyPrefs({});
    const adultIds = new Set(loadPrefs()?.privateFolderIds ?? []);
    set({ ...prefsState, hydrated: true });
    try {
      const catalog = await loadCatalogVideos();
      if (catalog.length) {
        const counts = new Map<string, number>();
        for (const v of catalog) counts.set(v.folderId, (counts.get(v.folderId) ?? 0) + 1);
        set((s) => ({
          videos: mergeVideos(s.videos, catalog),
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
            counts.has(f.id) ? { ...f, videoCount: counts.get(f.id) ?? f.videoCount } : f,
          ),
        }));
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
                ? { ...f, videoCount: videos.length, needsPermission: false }
                : f,
            ),
            scanning: null,
          }));
          if (videos.length) await saveFolderVideos(row.id, videos).catch(() => undefined);
        } catch {
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
                adult,
              },
            ],
          }));
        }
      } else {
        set((s) => ({
          folders: [
            ...s.folders.filter((f) => f.id !== row.id),
            {
              id: row.id,
              name: row.name,
              kind: "directory",
              videoCount: s.folders.find((f) => f.id === row.id)?.videoCount ?? 0,
              needsPermission: true,
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
    set((s) => ({
      scanning: { found: 0, looked: 0, folderName: name },
      videos: s.videos.filter((v) => v.folderId !== folderId),
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
        f.id === folderId ? { ...f, videoCount: videos.length, needsPermission: false } : f,
      ),
      scanning: null,
      sourceId: folder?.adult ? "adults" : folderId,
    }));
    if (videos.length) await saveFolderVideos(folderId, videos).catch(() => undefined);
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
            s.videos.filter((v) => v.folderId !== result.channel.id),
            result.videos,
          ),
          sourceId: result.channel.kind,
          remoteBusy: false,
        };
      });
      persistNow(get);
      get().pushNotice({
        title: `Following ${result.channel.title}`,
        body:
          result.channel.kind === "twitch"
            ? result.channel.live
              ? "Live right now."
              : "You'll be notified when they go live."
            : `${result.videos.length} latest video${result.videos.length === 1 ? "" : "s"} pulled in.`,
        kind: result.channel.kind,
      });
    } catch (err) {
      set({ remoteBusy: false });
      throw err;
    }
  },
  importBatch: async (items) => {
    const unique = items
      .map((i) => ({ query: i.query.trim(), kind: i.kind }))
      .filter((i) => i.query);
    if (!unique.length) return { ok: 0, failed: 0, failedQueries: [] };
    const existing = new Set(get().follows.map((f) => f.id));
    set({
      remoteBusy: true,
      importProgress: { done: 0, total: unique.length, label: "Importing" },
    });
    let ok = 0;
    let failed = 0;
    const failedQueries: string[] = [];
    const chunk = 6;
    try {
      const { importChannels } = await import("@/lib/remote/api");
      for (let i = 0; i < unique.length; i += chunk) {
        const slice = unique.slice(i, i + chunk);
        const result = await importChannels({ data: { items: slice } });
        ok += result.ok.length;
        failed += result.failed;
        if (result.failedQueries?.length) failedQueries.push(...result.failedQueries);
        set((s) => {
          let follows = s.follows;
          let folders = s.folders;
          let videos = s.videos;
          for (const row of result.ok) {
            follows = [row.channel, ...follows.filter((f) => f.id !== row.channel.id)];
            const folder: Folder = {
              id: row.channel.id,
              name: row.channel.title,
              kind: row.channel.kind,
              videoCount: row.videos.length,
            };
            folders = [...folders.filter((f) => f.id !== folder.id), folder];
            videos = mergeVideos(
              videos.filter((v) => v.folderId !== row.channel.id),
              row.videos,
            );
          }
          return {
            follows,
            folders,
            videos,
            importProgress: {
              done: Math.min(i + slice.length, unique.length),
              total: unique.length,
              label: "Importing",
            },
          };
        });
      }
      persistNow(get);
      const added = get().follows.filter((f) => !existing.has(f.id)).length;
      get().pushNotice({
        title: `Imported ${added || ok} channel${(added || ok) === 1 ? "" : "s"}`,
        body: failed ? `${failed} could not be reached.` : "Latest uploads are on the shelves.",
        kind: unique[0]?.kind === "twitch" ? "twitch" : "youtube",
      });
      set({
        remoteBusy: false,
        importProgress: null,
        sourceId: unique[0]?.kind === "twitch" ? "twitch" : "youtube",
      });
      persistNow(get);
      return { ok, failed, failedQueries };
    } catch (err) {
      set({ remoteBusy: false, importProgress: null });
      throw err;
    }
  },
  unfollow: (id) => {
    set((s) => ({
      follows: s.follows.filter((f) => f.id !== id),
      folders: s.folders.filter((f) => f.id !== id),
      videos: s.videos.filter((v) => v.folderId !== id),
      sourceId: s.sourceId === id ? "home" : s.sourceId,
    }));
    persistNow(get);
  },
  refreshFollows: async () => {
    const current = get().follows;
    if (!current.length) return { wentLive: [], newVideos: [] };
    const beforeLive = new Set(
      get()
        .videos.filter((v) => v.remote?.live)
        .map((v) => v.id),
    );
    const beforeIds = new Set(get().videos.map((v) => v.id));
    try {
      const { refreshRemotes } = await import("@/lib/remote/api");
      const result = await refreshRemotes({ data: { channels: current } });
      const followIds = new Set(result.channels.map((c) => c.id));
      set((s) => ({
        follows: result.channels,
        folders: [
          ...s.folders.filter((f) => f.kind !== "youtube" && f.kind !== "twitch"),
          YT_FOLDER,
          ...result.channels.map((c) => ({
            id: c.id,
            name: c.title,
            kind: c.kind as Folder["kind"],
            videoCount: result.videos.filter((v) => v.folderId === c.id).length,
          })),
        ],
        videos: [
          ...s.videos.filter(
            (v) => !v.remote || v.folderId === "youtube:featured" || !followIds.has(v.folderId),
          ),
          ...result.videos,
        ],
      }));
      persistNow(get);
      const wentLive = result.channels.filter(
        (c) =>
          c.live &&
          !beforeLive.has(`tw:${c.handle}:live`) &&
          !beforeLive.has(`tw:${c.handle.toLowerCase()}:live`),
      );
      const newVideos = result.videos.filter(
        (v) => !beforeIds.has(v.id) && v.remote?.kind === "youtube",
      );
      return { wentLive, newVideos };
    } catch {
      return { wentLive: [], newVideos: [] };
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
}));

function publicList(state: LibraryState): LibraryVideo[] {
  const adult = adultIdSet(state.folders);
  let list = state.videos.filter((v) => !adult.has(v.folderId));
  if (state.hideDemo) list = list.filter((v) => !v.isSample);
  return list;
}

function adultList(state: LibraryState): LibraryVideo[] {
  if (!state.adultsUnlocked) return [];
  const adult = adultIdSet(state.folders);
  return state.videos.filter((v) => adult.has(v.folderId));
}

export function selectVisible(state: LibraryState): LibraryVideo[] {
  const q = state.query.trim().toLowerCase();
  const inAdults = state.sourceId === "adults";
  let list = inAdults ? adultList(state) : publicList(state);
  if (state.sourceId === "favorites") {
    list = list.filter((v) => state.favorites[v.id]);
  } else if (state.sourceId === "continue") {
    list = list.filter((v) => {
      const p = state.progress[v.id];
      if (!p || p.d <= 0) return false;
      const r = p.t / p.d;
      return r > 0.04 && r < 0.96;
    });
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

export function selectContinue(state: LibraryState, adult = false): LibraryVideo[] {
  const items = scoped(state, adult).filter((v) => {
    const p = state.progress[v.id];
    if (!p || p.d <= 0) return false;
    const r = p.t / p.d;
    return r > 0.04 && r < 0.96;
  });
  items.sort((a, b) => (state.progress[b.id]?.at ?? 0) - (state.progress[a.id]?.at ?? 0));
  return items.slice(0, 12);
}

export function selectFavorites(state: LibraryState, adult = false): LibraryVideo[] {
  return scoped(state, adult).filter((v) => state.favorites[v.id]);
}

export function selectHistory(state: LibraryState, adult = false): LibraryVideo[] {
  const list = scoped(state, adult);
  const byId = new Map(list.map((v) => [v.id, v]));
  return state.history
    .map((h) => byId.get(h.id))
    .filter((v): v is LibraryVideo => v != null)
    .slice(0, 12);
}

export function selectYoutube(state: LibraryState): LibraryVideo[] {
  return publicList(state)
    .filter((v) => v.remote?.kind === "youtube")
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 18);
}

export function selectTwitch(state: LibraryState): LibraryVideo[] {
  return publicList(state)
    .filter((v) => v.remote?.kind === "twitch")
    .sort((a, b) => Number(b.remote?.live) - Number(a.remote?.live) || b.addedAt - a.addedAt)
    .slice(0, 18);
}

export function selectLive(state: LibraryState): LibraryVideo[] {
  return publicList(state).filter((v) => v.remote?.live);
}

export function selectClassics(state: LibraryState): LibraryVideo[] {
  return publicList(state).filter((v) => !v.remote && isClassicVideo(v));
}

export function selectFeatured(state: LibraryState, adult = false): LibraryVideo | undefined {
  const cont = selectContinue(state, adult);
  if (cont[0]) return cont[0];
  if (!adult) {
    const classics = selectClassics(state);
    if (classics[0]) return classics[0];
  }
  return scoped(state, adult)[0];
}

export function userFolderCount(folders: Folder[]) {
  return folders.filter((f) => f.kind !== "demo").length;
}
