import type {
  AppNotice,
  FollowedChannel,
  Folder,
  GroupBy,
  HistoryEntry,
  LibraryVideo,
  ResumeMark,
  SizeFilter,
  SortDir,
  SortKey,
} from "./types";

const DB_NAME = "reelcase";
const STORE = "dirs";
const VIDEO_STORE = "videos";
const SOURCE_HEALTH_STORE = "source-health";
const THUMB_STORE = "thumb-cache";
const ACTIVITY_STORE = "activity";
const ACTIVITY_JOURNAL_STORE = "activity-journal";
const PREFS_KEY = "reelcase.prefs.v4";
const LEGACY_KEYS = ["reelcase.prefs.v3", "reelcase.prefs.v2", "reelcase.prefs.v1"];
let durablePrefs: Prefs | null = null;
let prefsWrites: Promise<void> = Promise.resolve();

export async function restoreDurablePrefs(): Promise<void> {
  const db = await openDb();
  try {
    const saved = await new Promise<Prefs | undefined>((resolve, reject) => {
      const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get("preferences");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (saved) durablePrefs = saved;
  } finally { db.close(); }
}

export function waitForPrefsWrites() { return prefsWrites; }
const TAG_EDITS_KEY = "reelcase.tag-edits.v1";
const HISTORY_PENDING_KEY = "reelcase.history-pending.v1";
function readPending<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}
export function saveTagEdit(id: string, tags: string[]) {
  const edits = readPending<Record<string, string[]>>(TAG_EDITS_KEY, {});
  edits[id] = tags;
  try { localStorage.setItem(TAG_EDITS_KEY, JSON.stringify(edits)); } catch { /* IndexedDB still saves the full record. */ }
}
export function restoreTagEdits(tags: Record<string, string[]>) {
  return { ...tags, ...readPending<Record<string, string[]>>(TAG_EDITS_KEY, {}) };
}

export type StoredDir = {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
};

/** Small, durable source summary. This is intentionally metadata only: no raw file paths or blobs. */
export type StoredSourceHealth = Pick<Folder, "id" | "health" | "lastCheckedAt" | "videoCount">;

export type Prefs = {
  favorites: string[];
  likes: string[];
  tags: Record<string, string[]>;
  categories: Record<string, string>;
  progress: Record<string, { t: number; d: number; at: number }>;
  resumeProgress?: Record<string, ResumeMark>;
  history: HistoryEntry[];
  viewCounts?: Record<string, number>;
  cameCounts?: Record<string, number>;
  view: "grid" | "list";
  sort: SortKey;
  sortDir: SortDir;
  hideDemo: boolean;
  sourceId: string;
  hardwareAccel: boolean;
  privateFolderIds: string[];
  adultPinHash: string | null;
  extFilter: string;
  sizeFilter: SizeFilter;
  playableOnly: boolean;
  groupBy: GroupBy;
  follows: FollowedChannel[];
  notices: AppNotice[];
  notifyPush: boolean;
  unavailableVideoIds?: string[];
};

function migrateSource(id: string | undefined): string {
  if (!id || id === "all" || id === "starred") {
    if (id === "starred") return "favorites";
    return "home";
  }
  return id;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 7);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("remote-cache")) db.createObjectStore("remote-cache");
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        const videos = db.createObjectStore(VIDEO_STORE, { keyPath: "id" });
        videos.createIndex("folderId", "folderId", { unique: false });
      }
      if (!db.objectStoreNames.contains(SOURCE_HEALTH_STORE)) {
        db.createObjectStore(SOURCE_HEALTH_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(THUMB_STORE)) db.createObjectStore(THUMB_STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(ACTIVITY_STORE)) db.createObjectStore(ACTIVITY_STORE);
      if (!db.objectStoreNames.contains(ACTIVITY_JOURNAL_STORE)) db.createObjectStore(ACTIVITY_JOURNAL_STORE, { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDirHandle(entry: StoredDir): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadDirHandles(): Promise<StoredDir[]> {
  const db = await openDb();
  const rows = await new Promise<StoredDir[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as StoredDir[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows;
}

export async function deleteDirHandle(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, VIDEO_STORE, SOURCE_HEALTH_STORE], "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.objectStore(SOURCE_HEALTH_STORE).delete(id);
    const idx = tx.objectStore(VIDEO_STORE).index("folderId");
    const req = idx.openCursor(IDBKeyRange.only(id));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

const IDB_WRITE_CHUNK = 400;

async function clearFolderVideosTx(db: IDBDatabase, folderId: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(VIDEO_STORE, "readwrite");
    const idx = tx.objectStore(VIDEO_STORE).index("folderId");
    const req = idx.openCursor(IDBKeyRange.only(folderId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function putVideosChunked(db: IDBDatabase, videos: LibraryVideo[]): Promise<void> {
  for (let i = 0; i < videos.length; i += IDB_WRITE_CHUNK) {
    const slice = videos.slice(i, i + IDB_WRITE_CHUNK);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE, "readwrite");
      const store = tx.objectStore(VIDEO_STORE);
      for (const video of slice) {
        if (video.isSample) continue;
        store.put(video);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

/** Replace one folder's catalog rows in chunked IndexedDB writes. */
export async function saveFolderVideos(folderId: string, videos: LibraryVideo[]): Promise<void> {
  const db = await openDb();
  await clearFolderVideosTx(db, folderId);
  await putVideosChunked(db, videos);
  db.close();
}

/** Append/upsert catalog rows without rewriting the whole folder (batched ingest). */
export async function appendCatalogVideos(videos: LibraryVideo[]): Promise<void> {
  if (!videos.length) return;
  const db = await openDb();
  await putVideosChunked(db, videos);
  db.close();
}

export async function clearFolderVideos(folderId: string): Promise<void> {
  const db = await openDb();
  await clearFolderVideosTx(db, folderId);
  db.close();
}

export async function loadCatalogVideos(): Promise<LibraryVideo[]> {
  const db = await openDb();
  const rows = await new Promise<LibraryVideo[]>((resolve, reject) => {
    const tx = db.transaction(VIDEO_STORE, "readonly");
    const req = tx.objectStore(VIDEO_STORE).getAll();
    req.onsuccess = () => resolve((req.result as LibraryVideo[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows.filter((v) => !v.isSample);
}

export type StoredThumb = { id: string; thumb: string; at: number };
export async function loadThumbCache(limit = 120): Promise<StoredThumb[]> {
  const db = await openDb();
  try {
    const rows = await new Promise<StoredThumb[]>((resolve, reject) => {
      const req = db.transaction(THUMB_STORE, "readonly").objectStore(THUMB_STORE).getAll();
      req.onsuccess = () => resolve((req.result as StoredThumb[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    return rows.sort((a, b) => b.at - a.at).slice(0, limit);
  } finally { db.close(); }
}
export async function saveThumbCache(entry: StoredThumb): Promise<void> {
  const db = await openDb();
  try { await new Promise<void>((resolve, reject) => { const tx = db.transaction(THUMB_STORE, "readwrite"); tx.objectStore(THUMB_STORE).put(entry); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); } finally { db.close(); }
}

export type RemoteSnapshot = { videos: LibraryVideo[]; folders: Folder[]; checkedAt: number };
export async function loadRemoteSnapshot(): Promise<RemoteSnapshot | undefined> {
  const db = await openDb();
  try { return await new Promise((resolve, reject) => {
    const req = db.transaction("remote-cache").objectStore("remote-cache").get("snapshot");
    req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
  }); } finally { db.close(); }
}
export async function saveRemoteSnapshot(snapshot: RemoteSnapshot): Promise<void> {
  const db = await openDb();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("remote-cache", "readwrite");
    tx.objectStore("remote-cache").put(snapshot, "snapshot");
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  }); } finally { db.close(); }
}

export type ActivitySnapshot = Pick<Prefs, "history" | "progress" | "resumeProgress"> & { viewCounts: Record<string, number>; cameCounts?: Record<string, number>; savedAt: number };
export async function loadActivitySnapshot(): Promise<ActivitySnapshot | undefined> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction(ACTIVITY_STORE, "readonly").objectStore(ACTIVITY_STORE).get("primary");
      req.onsuccess = () => resolve(req.result as ActivitySnapshot | undefined);
      req.onerror = () => reject(req.error);
    });
  } finally { db.close(); }
}
export async function saveActivitySnapshot(snapshot: ActivitySnapshot): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ACTIVITY_STORE, "readwrite");
      tx.objectStore(ACTIVITY_STORE).put(snapshot, "primary");
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}

/** Append-only playback journal: a snapshot write can never erase an earlier event. */
export async function appendActivityJournal(entry: HistoryEntry): Promise<void> {
  const pending = readPending<HistoryEntry[]>(HISTORY_PENDING_KEY, []);
  try { localStorage.setItem(HISTORY_PENDING_KEY, JSON.stringify([entry, ...pending].slice(0, 50))); } catch { /* journal remains primary */ }
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
      // eventId survives a snapshot race and makes journal replay idempotent.
      // Old entries retain the deterministic legacy key during migration.
      tx.objectStore(ACTIVITY_JOURNAL_STORE).put({ key: entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`, entry });
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}
export async function loadActivityJournal(): Promise<HistoryEntry[]> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction(ACTIVITY_JOURNAL_STORE, "readonly").objectStore(ACTIVITY_JOURNAL_STORE).getAll();
      req.onsuccess = () => resolve([...(req.result as Array<{ entry?: HistoryEntry }>).map((row) => row.entry).filter((entry): entry is HistoryEntry => Boolean(entry)), ...readPending<HistoryEntry[]>(HISTORY_PENDING_KEY, [])]);
      req.onerror = () => reject(req.error);
    });
  } finally { db.close(); }
}
export async function clearActivityJournal(): Promise<void> {
  try { localStorage.removeItem(HISTORY_PENDING_KEY); } catch { /* optional fallback */ }
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
      tx.objectStore(ACTIVITY_JOURNAL_STORE).clear();
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export async function pruneActivityJournal(before: number): Promise<void> {
  try { localStorage.setItem(HISTORY_PENDING_KEY, JSON.stringify(readPending<HistoryEntry[]>(HISTORY_PENDING_KEY, []).filter((entry) => entry.at >= before))); } catch { /* optional fallback */ }
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
      const store = tx.objectStore(ACTIVITY_JOURNAL_STORE);
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) return;
        const entry = (cursor.value as { entry?: HistoryEntry }).entry;
        if (entry && entry.at < before) cursor.delete();
        cursor.continue();
      };
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export async function saveSourceHealth(entry: StoredSourceHealth): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SOURCE_HEALTH_STORE, "readwrite");
    tx.objectStore(SOURCE_HEALTH_STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadSourceHealth(): Promise<StoredSourceHealth[]> {
  const db = await openDb();
  const rows = await new Promise<StoredSourceHealth[]>((resolve, reject) => {
    const tx = db.transaction(SOURCE_HEALTH_STORE, "readonly");
    const req = tx.objectStore(SOURCE_HEALTH_STORE).getAll();
    req.onsuccess = () => resolve((req.result as StoredSourceHealth[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows;
}

function asCountMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) out[id] = Math.floor(value);
  }
  return out;
}

function normalize(raw: Record<string, unknown>): Prefs {
  const starred = (raw.starred as string[] | undefined) ?? [];
  const favorites = (raw.favorites as string[] | undefined) ?? starred;
  // New libraries should surface fresh media rather than beginning with an
  // alphabetical wall. Existing explicit preferences remain untouched.
  const sort = (raw.sort as SortKey | undefined) ?? "added";
  return {
    favorites,
    likes: (raw.likes as string[] | undefined) ?? [],
    tags: (raw.tags as Record<string, string[]> | undefined) ?? {},
    categories: (raw.categories as Record<string, string> | undefined) ?? {},
    progress: (raw.progress as Prefs["progress"]) ?? {},
    resumeProgress: (raw.resumeProgress as Prefs["resumeProgress"]) ?? {},
    history: (raw.history as Prefs["history"]) ?? [],
    viewCounts: asCountMap(raw.viewCounts),
    cameCounts: asCountMap(raw.cameCounts),
    view: (raw.view as Prefs["view"]) ?? "grid",
    sort,
    sortDir: (raw.sortDir as SortDir | undefined) ?? (sort === "name" ? "asc" : "desc"),
    hideDemo: Boolean(raw.hideDemo),
    sourceId: migrateSource(raw.sourceId as string | undefined),
    hardwareAccel: raw.hardwareAccel !== false,
    privateFolderIds: (raw.privateFolderIds as string[] | undefined) ?? [],
    adultPinHash: (raw.adultPinHash as string | null | undefined) ?? null,
    extFilter: typeof raw.extFilter === "string" ? raw.extFilter : "all",
    sizeFilter: (raw.sizeFilter as SizeFilter | undefined) ?? "any",
    playableOnly: Boolean(raw.playableOnly),
    groupBy: (raw.groupBy as GroupBy | undefined) ?? "none",
    follows: Array.isArray(raw.follows) ? (raw.follows as FollowedChannel[]) : [],
    notices: Array.isArray(raw.notices) ? (raw.notices as AppNotice[]) : [],
    notifyPush: Boolean(raw.notifyPush),
  };
}

export function loadPrefs(): Prefs | null {
  if (typeof window === "undefined") return null;
  if (durablePrefs) return durablePrefs;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return normalize(JSON.parse(raw) as Record<string, unknown>);
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) return normalize(JSON.parse(legacy) as Record<string, unknown>);
    }
    return null;
  } catch {
    return null;
  }
}

export function savePrefs(prefs: Prefs) {
  if (typeof window === "undefined") return;
  durablePrefs = prefs;
  // Keep large metadata out of synchronous, quota-limited localStorage.
  // Ordered transactions prevent an older edit overwriting a newer one.
  prefsWrites = prefsWrites.catch(() => undefined).then(async () => {
    const db = await openDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(ACTIVITY_STORE, "readwrite");
        tx.objectStore(ACTIVITY_STORE).put(prefs, "preferences");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally { db.close(); }
  });
  void prefsWrites.catch(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); }
    catch { window.dispatchEvent(new CustomEvent("reelcase:save-error")); }
  });
}
