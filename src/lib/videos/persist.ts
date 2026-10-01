import { recoverSavedShelves } from "./saved-library";
import type {
  AppNotice,
  FollowedChannel,
  Folder,
  GroupBy,
  HistoryEntry,
  LibraryVideo,
  VideoMetadataProvenance,
  ResumeMark,
  SizeFilter,
  SortDir,
  SortKey,
} from "./types";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import { companionGetThumb, companionPutThumb } from "@/lib/companion";
import { CoalescedWriter } from "../coalesced-writer.ts";
import { catalogCard, withCatalogDetails } from './catalog-card';
import { artworkBytes, artworkDataUrl } from './binary-artwork';

const DB_NAME = "reelcase";
const STORE = "dirs";
const VIDEO_STORE = "videos";
const SOURCE_HEALTH_STORE = "source-health";
const THUMB_STORE = "thumb-cache";
const ACTIVITY_STORE = "activity";
const ACTIVITY_JOURNAL_STORE = "activity-journal";
const PREFS_KEY = "reelcase.prefs.v4";
const TAG_PROVENANCE_EDITS_KEY = "reelcase.tag-provenance-edits.v1";
const LEGACY_KEYS = ["reelcase.prefs.v3", "reelcase.prefs.v2", "reelcase.prefs.v1"];
/** Small YouTube/Twitch follow list — never co-pruned with thumbs/history/Adult tags. */
const FOLLOWS_LS_KEY = "reelcase.follows.v1";
const FOLLOWS_IDB_KEY = "follows";
let durablePrefs: Prefs | null = null;
let durableFollows: FollowedChannel[] | null = null;
let prefsWrites: Promise<void> = Promise.resolve();
let followsWrites: Promise<void> = Promise.resolve();

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

export type DurableFollows = { channels: FollowedChannel[]; savedAt: number };

function normalizeFollowChannels(raw: unknown): FollowedChannel[] {
  if (!Array.isArray(raw)) return [];
  const out: FollowedChannel[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const kind = rec.kind === "twitch" || rec.kind === "youtube" ? rec.kind : null;
    const handle = typeof rec.handle === "string" ? rec.handle.trim() : "";
    const id = typeof rec.id === "string" ? rec.id.trim() : "";
    const title = typeof rec.title === "string" ? rec.title.trim() : handle;
    const cacheRaw = rec.cache && typeof rec.cache === "object" ? rec.cache as Record<string, unknown> : null;
    const cache = cacheRaw
      && typeof cacheRaw.at === "number" && Number.isFinite(cacheRaw.at)
      && typeof cacheRaw.hits === "number" && Number.isFinite(cacheRaw.hits)
      && typeof cacheRaw.misses === "number" && Number.isFinite(cacheRaw.misses)
      && (cacheRaw.scope === "feed" || cacheRaw.scope === "catalog" || cacheRaw.scope === "uncached")
      ? { at: cacheRaw.at, hits: Math.max(0, Math.floor(cacheRaw.hits)), misses: Math.max(0, Math.floor(cacheRaw.misses)), scope: cacheRaw.scope as NonNullable<FollowedChannel["cache"]>["scope"] }
      : undefined;
    if (!kind || (!handle && !id)) continue;
    out.push({
      id: id || `${kind === "twitch" ? "tw" : "yt"}:${handle}`,
      kind,
      handle: handle || id.replace(/^(?:yt|tw):/i, ""),
      title: title || handle || id,
      ...(typeof rec.channelId === "string" ? { channelId: rec.channelId } : {}),
      ...(typeof rec.thumb === "string" ? { thumb: rec.thumb } : {}),
      ...(typeof rec.live === "boolean" ? { live: rec.live } : {}),
      ...(typeof rec.lastCheckedAt === "number" ? { lastCheckedAt: rec.lastCheckedAt } : {}),
      ...(typeof rec.liveCheckedAt === "number" && Number.isFinite(rec.liveCheckedAt) ? { liveCheckedAt: rec.liveCheckedAt } : {}),
      ...(typeof rec.newestPublishedAt === "number" ? { newestPublishedAt: rec.newestPublishedAt } : {}),
      ...(typeof rec.newestVideoId === "string" && rec.newestVideoId ? { newestVideoId: rec.newestVideoId } : {}),
      ...(typeof rec.catalogCursor === "string" && rec.catalogCursor.length > 0 && rec.catalogCursor.length <= 16_384 ? { catalogCursor: rec.catalogCursor } : {}),
      ...(typeof rec.catalogCheckedAt === "number" && Number.isFinite(rec.catalogCheckedAt) ? { catalogCheckedAt: rec.catalogCheckedAt } : {}),
      ...(typeof rec.catalogExhaustedAt === "number" && Number.isFinite(rec.catalogExhaustedAt) ? { catalogExhaustedAt: rec.catalogExhaustedAt } : {}),
      ...(typeof rec.lastResponseCount === "number" ? { lastResponseCount: rec.lastResponseCount } : {}),
      ...(cache ? { cache } : {}),
      ...(rec.lastProviderFailure && typeof rec.lastProviderFailure === "object" ? { lastProviderFailure: rec.lastProviderFailure as FollowedChannel["lastProviderFailure"] } : {}),
    });
  }
  return out;
}

function readFollowsLocal(): FollowedChannel[] | null {
  try {
    const raw = JSON.parse(localStorage.getItem(FOLLOWS_LS_KEY) ?? "null") as DurableFollows | FollowedChannel[] | null;
    if (Array.isArray(raw)) return normalizeFollowChannels(raw);
    if (raw && typeof raw === "object" && Array.isArray((raw as DurableFollows).channels)) {
      return normalizeFollowChannels((raw as DurableFollows).channels);
    }
  } catch { /* ignore malformed mirror */ }
  return null;
}

/** Sync mirror + IndexedDB. Intentionally tiny so QuotaExceeded on the prefs blob cannot erase follows. */
export function saveFollows(channels: FollowedChannel[]) {
  if (typeof window === "undefined") return;
  durableFollows = channels;
  const payload: DurableFollows = { channels, savedAt: Date.now() };
  try { localStorage.setItem(FOLLOWS_LS_KEY, JSON.stringify(payload)); }
  catch { /* IndexedDB remains the durable path when localStorage is full. */ }
  const pending = putActivityBlob(FOLLOWS_IDB_KEY, payload);
  if (followsWrites !== pending) {
    followsWrites = pending;
    void pending.catch(() => undefined);
  }
}

export function loadFollows(): FollowedChannel[] | null {
  if (typeof window === "undefined") return null;
  if (durableFollows) return durableFollows;
  return readFollowsLocal();
}

export async function restoreDurableFollows(): Promise<FollowedChannel[]> {
  if (typeof window === "undefined") return [];
  let fromIdb: FollowedChannel[] = [];
  try {
    const db = await openDb();
    try {
      const saved = await new Promise<DurableFollows | FollowedChannel[] | undefined>((resolve, reject) => {
        const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get(FOLLOWS_IDB_KEY);
        req.onsuccess = () => resolve(req.result as DurableFollows | FollowedChannel[] | undefined);
        req.onerror = () => reject(req.error);
      });
      if (Array.isArray(saved)) fromIdb = normalizeFollowChannels(saved);
      else if (saved && typeof saved === "object") fromIdb = normalizeFollowChannels(saved.channels);
    } finally { db.close(); }
  } catch { /* fall through to localStorage / prefs migration */ }
  const fromLs = readFollowsLocal() ?? [];
  // Prefer the longer non-empty list when both exist (partial write / mid-import).
  const primary = fromIdb.length >= fromLs.length ? fromIdb : fromLs;
  const secondary = primary === fromIdb ? fromLs : fromIdb;
  const seen = new Set(primary.map((row) => `${row.kind}:${row.handle.toLowerCase()}`));
  const merged = [...primary];
  for (const row of secondary) {
    const key = `${row.kind}:${row.handle.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  durableFollows = merged;
  return merged;
}

export function waitForFollowsWrites() { return followsWrites; }

/** ----- Broader durable activity blobs (same pattern as follows) -----
 * Thumb prune, Adult catalog caps, and prefs QuotaExceeded must not wipe these.
 * Each key lives under ACTIVITY_STORE with a tiny localStorage mirror when helpful.
 */
const DURABLE_HISTORY_IDB_KEY = "history";
const DURABLE_HISTORY_LS_KEY = "reelcase.history.v1";
const DURABLE_RESUME_IDB_KEY = "resume";
const DURABLE_RESUME_LS_KEY = "reelcase.resume.v1";
const DURABLE_MARKS_IDB_KEY = "marks";
const DURABLE_MARKS_LS_KEY = "reelcase.marks.v1";
const DURABLE_SHELVES_IDB_KEY = "shelves";
const DURABLE_SHELVES_LS_KEY = "reelcase.shelves.v1";
const DURABLE_LINKS_IDB_KEY = "links";
const DURABLE_LINKS_LS_KEY = "reelcase.links.v1";
const DURABLE_FEEDBACK_IDB_KEY = "feedback";
const DURABLE_FEEDBACK_LS_KEY = "reelcase.media-feedback.v1";
const DURABLE_PHOTOS_IDB_KEY = "photos";
const DURABLE_PHOTOS_LS_KEY = "reelcase.photos.v1";
/** Legacy Photos metadata key — migrated into the durable photos blob. */
export const PHOTO_META_LS_KEY = "reelcase.photo-meta.v1";

export type SavedVideoLink = {
  id: string;
  url: string;
  title?: string;
  poster?: string;
  kind?: string;
  savedAt: number;
  source: "history" | "bookmark" | "continue";
};

export type DurableHistory = { entries: HistoryEntry[]; savedAt: number };
export type DurableResume = { progress: Prefs["progress"]; resumeProgress: NonNullable<Prefs["resumeProgress"]>; savedAt: number };
export type DurableMarks = { viewCounts: Record<string, number>; cameCounts: Record<string, number>; savedAt: number };
export type DurableShelves = { favorites: string[]; likes: string[]; savedAt: number };
export type DurableLinks = { links: SavedVideoLink[]; savedAt: number };
export type DurableFeedback = {
  ratings: Record<string, number>;
  ratingHistory: Record<string, { rating: number; updatedAt: number }>;
  notes: Record<string, string>;
  creatorRatings: Record<string, number>;
  creatorLikes: Record<string, true>;
  tagLikes: Record<string, true>;
  tagHeartHistory: Record<string, number>;
  watchTime: Record<string, { preview: number; fullscreen: number; previewEstimated?: number; fullscreenEstimated?: number }>;
  savedAt: number;
};

/** Local photo source stubs + likes/favorites metadata. Never co-pruned with thumbs/Adult. */
export type DurablePhotoSource = {
  id: string;
  name: string;
  kind: "directory" | "files";
  photoCount?: number;
  lastCheckedAt?: number;
};

export type DurablePhotoMeta = {
  path?: string;
  people?: string[];
  tags?: string[];
  album?: string;
  favorite?: boolean;
  hidden?: boolean;
  rating?: number;
  width?: number;
  height?: number;
  vision?: Array<{ label: string; score: number }>;
  visionModel?: string;
};

export type DurablePhotos = {
  sources: DurablePhotoSource[];
  /** Per-photo ratings, favorites, tags, people — keyed by photo id. */
  meta: Record<string, DurablePhotoMeta>;
  /** Explicit favorite/like ids (derived from meta.favorite === true). */
  likes: string[];
  savedAt: number;
};

const activityWriter = new CoalescedWriter<string, unknown>(async rows => {
    const db = await openDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(ACTIVITY_STORE, "readwrite");
        const store = tx.objectStore(ACTIVITY_STORE);
        for (const [key, payload] of rows) store.put(payload, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally { db.close(); }
});

function putActivityBlob(key: string, payload: unknown): Promise<void> {
  return activityWriter.write(key, payload);
}

async function getActivityBlob<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } finally { db.close(); }
}

function readJsonLocal<T>(key: string): T | null {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null");
    return raw as T;
  } catch { return null; }
}

function writeJsonLocal(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* IndexedDB remains the durable path. */ }
}

function normalizeHistoryEntries(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryEntry[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const id = typeof rec.id === "string" ? rec.id.trim() : "";
    const at = typeof rec.at === "number" && Number.isFinite(rec.at) ? rec.at : NaN;
    if (!id || !Number.isFinite(at)) continue;
    out.push({
      id,
      at,
      ...(typeof rec.eventId === "string" ? { eventId: rec.eventId } : {}),
      ...(typeof rec.url === "string" ? { url: rec.url } : {}),
      ...(typeof rec.position === "number" ? { position: rec.position } : {}),
      ...(typeof rec.duration === "number" ? { duration: rec.duration } : {}),
      ...(rec.source === "open" || rec.source === "progress" || rec.source === "watch-room" ? { source: rec.source } : {}),
      ...(typeof rec.title === "string" ? { title: rec.title } : {}),
      ...(typeof rec.poster === "string" ? { poster: rec.poster } : {}),
      ...(typeof rec.rating === "number" ? { rating: rec.rating } : {}),
    });
  }
  return out;
}

function normalizeProgressMap(raw: unknown): Record<string, { t: number; d: number; at: number }> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, { t: number; d: number; at: number }> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const rec = value as Record<string, unknown>;
    const t = Number(rec.t); const d = Number(rec.d); const at = Number(rec.at);
    if (!Number.isFinite(t) || !Number.isFinite(d) || !Number.isFinite(at) || d <= 0) continue;
    out[id] = { t, d, at };
  }
  return out;
}

function normalizeStringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()))];
}

function normalizeLinks(raw: unknown): SavedVideoLink[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedVideoLink[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const url = typeof rec.url === "string" ? rec.url.trim() : "";
    const id = typeof rec.id === "string" ? rec.id.trim() : url;
    if (!url || !id) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const source = rec.source === "bookmark" || rec.source === "continue" || rec.source === "history" ? rec.source : "history";
    out.push({
      id,
      url,
      savedAt: typeof rec.savedAt === "number" && Number.isFinite(rec.savedAt) ? rec.savedAt : Date.now(),
      source,
      ...(typeof rec.title === "string" ? { title: rec.title } : {}),
      ...(typeof rec.poster === "string" ? { poster: rec.poster } : {}),
      ...(typeof rec.kind === "string" ? { kind: rec.kind } : {}),
    });
  }
  return out;
}

/** Derive sticky video links from history + resume so Continue/recovery URLs survive catalog prune. */
export function linksFromHistoryAndResume(
  history: HistoryEntry[],
  resumeProgress: Record<string, ResumeMark>,
): SavedVideoLink[] {
  const links: SavedVideoLink[] = [];
  for (const entry of history) {
    if (!entry.url || !/^https?:\/\//i.test(entry.url)) continue;
    links.push({
      id: entry.id,
      url: entry.url,
      savedAt: entry.at,
      source: "history",
      ...(entry.title ? { title: entry.title } : {}),
      ...(entry.poster ? { poster: entry.poster } : {}),
    });
  }
  for (const [key, mark] of Object.entries(resumeProgress)) {
    if (!key.startsWith("http")) continue;
    links.push({
      id: key,
      url: key,
      savedAt: mark.at,
      source: "continue",
    });
  }
  return normalizeLinks(links);
}

export function saveDurableHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  const payload: DurableHistory = { entries, savedAt: Date.now() };
  // Mirror only a recent slice so QuotaExceeded on localStorage cannot block IDB.
  writeJsonLocal(DURABLE_HISTORY_LS_KEY, { entries: entries.slice(0, 120), savedAt: payload.savedAt });
  void putActivityBlob(DURABLE_HISTORY_IDB_KEY, payload).catch(() => undefined);
}

export async function restoreDurableHistory(): Promise<HistoryEntry[]> {
  if (typeof window === "undefined") return [];
  let fromIdb: HistoryEntry[] = [];
  try {
    const saved = await getActivityBlob<DurableHistory | HistoryEntry[]>(DURABLE_HISTORY_IDB_KEY);
    if (Array.isArray(saved)) fromIdb = normalizeHistoryEntries(saved);
    else if (saved && typeof saved === "object") fromIdb = normalizeHistoryEntries(saved.entries);
  } catch { /* fall through */ }
  const lsRaw = readJsonLocal<DurableHistory | HistoryEntry[]>(DURABLE_HISTORY_LS_KEY);
  const fromLs = Array.isArray(lsRaw)
    ? normalizeHistoryEntries(lsRaw)
    : normalizeHistoryEntries(lsRaw && typeof lsRaw === "object" ? (lsRaw as DurableHistory).entries : []);
  return fromIdb.length >= fromLs.length ? fromIdb : fromLs;
}

export function saveDurableResume(progress: Prefs["progress"], resumeProgress: NonNullable<Prefs["resumeProgress"]>) {
  if (typeof window === "undefined") return;
  const payload: DurableResume = { progress, resumeProgress, savedAt: Date.now() };
  const resumeKeys = Object.keys(resumeProgress);
  const slimResume: Record<string, { t: number; d: number; at: number }> = {};
  for (const key of resumeKeys.slice(-200)) slimResume[key] = resumeProgress[key]!;
  writeJsonLocal(DURABLE_RESUME_LS_KEY, { progress: {}, resumeProgress: slimResume, savedAt: payload.savedAt });
  void putActivityBlob(DURABLE_RESUME_IDB_KEY, payload).catch(() => undefined);
}

export async function restoreDurableResume(): Promise<{ progress: Prefs["progress"]; resumeProgress: NonNullable<Prefs["resumeProgress"]> }> {
  if (typeof window === "undefined") return { progress: {}, resumeProgress: {} };
  let fromIdb: DurableResume | undefined;
  try { fromIdb = await getActivityBlob<DurableResume>(DURABLE_RESUME_IDB_KEY); } catch { /* ignore */ }
  const fromLs = readJsonLocal<DurableResume>(DURABLE_RESUME_LS_KEY);
  const progress = { ...normalizeProgressMap(fromLs?.progress), ...normalizeProgressMap(fromIdb?.progress) };
  const resumeProgress = { ...normalizeProgressMap(fromLs?.resumeProgress), ...normalizeProgressMap(fromIdb?.resumeProgress) };
  return { progress, resumeProgress };
}

export function saveDurableMarks(viewCounts: Record<string, number>, cameCounts: Record<string, number>) {
  if (typeof window === "undefined") return;
  const payload: DurableMarks = { viewCounts: asCountMap(viewCounts), cameCounts: asCountMap(cameCounts), savedAt: Date.now() };
  writeJsonLocal(DURABLE_MARKS_LS_KEY, payload);
  void putActivityBlob(DURABLE_MARKS_IDB_KEY, payload).catch(() => undefined);
}

export async function restoreDurableMarks(): Promise<{ viewCounts: Record<string, number>; cameCounts: Record<string, number> }> {
  if (typeof window === "undefined") return { viewCounts: {}, cameCounts: {} };
  let fromIdb: DurableMarks | undefined;
  try { fromIdb = await getActivityBlob<DurableMarks>(DURABLE_MARKS_IDB_KEY); } catch { /* ignore */ }
  const fromLs = readJsonLocal<DurableMarks>(DURABLE_MARKS_LS_KEY);
  const mergeCounts = (a: Record<string, number> = {}, b: Record<string, number> = {}) => {
    const out = { ...a };
    for (const [id, value] of Object.entries(b)) out[id] = Math.max(out[id] ?? 0, value);
    return out;
  };
  return {
    viewCounts: mergeCounts(asCountMap(fromLs?.viewCounts), asCountMap(fromIdb?.viewCounts)),
    cameCounts: mergeCounts(asCountMap(fromLs?.cameCounts), asCountMap(fromIdb?.cameCounts)),
  };
}

export function saveDurableShelves(favorites: string[], likes: string[]) {
  if (typeof window === "undefined") return;
  const payload: DurableShelves = { favorites: normalizeStringList(favorites), likes: normalizeStringList(likes), savedAt: Date.now() };
  writeJsonLocal(DURABLE_SHELVES_LS_KEY, payload);
  void putActivityBlob(DURABLE_SHELVES_IDB_KEY, payload).catch(() => undefined);
}

export async function restoreDurableShelves(): Promise<{ favorites: string[]; likes: string[]; authoritative: boolean }> {
  if (typeof window === "undefined") return { favorites: [], likes: [], authoritative: false };
  let fromIdb: DurableShelves | undefined;
  try { fromIdb = await getActivityBlob<DurableShelves>(DURABLE_SHELVES_IDB_KEY); } catch { /* ignore */ }
  const fromLs = readJsonLocal<DurableShelves>(DURABLE_SHELVES_LS_KEY);
  return recoverSavedShelves(fromIdb, fromLs);
}

export function saveDurableLinks(links: SavedVideoLink[]) {
  if (typeof window === "undefined") return;
  const payload: DurableLinks = { links: normalizeLinks(links), savedAt: Date.now() };
  writeJsonLocal(DURABLE_LINKS_LS_KEY, { links: payload.links.slice(0, 200), savedAt: payload.savedAt });
  void putActivityBlob(DURABLE_LINKS_IDB_KEY, payload).catch(() => undefined);
}

export async function restoreDurableLinks(): Promise<SavedVideoLink[]> {
  if (typeof window === "undefined") return [];
  let fromIdb: SavedVideoLink[] = [];
  try {
    const saved = await getActivityBlob<DurableLinks>(DURABLE_LINKS_IDB_KEY);
    fromIdb = normalizeLinks(saved?.links);
  } catch { /* ignore */ }
  const fromLs = normalizeLinks(readJsonLocal<DurableLinks>(DURABLE_LINKS_LS_KEY)?.links);
  return normalizeLinks([...fromIdb, ...fromLs]);
}

export function saveDurableFeedback(feedback: Omit<DurableFeedback, "savedAt">) {
  if (typeof window === "undefined") return;
  const payload: DurableFeedback = { ...feedback, savedAt: Date.now() };
  // Keep the existing media-feedback LS key as the sync mirror; IDB is the durable backup.
  writeJsonLocal(DURABLE_FEEDBACK_LS_KEY, feedback);
  void putActivityBlob(DURABLE_FEEDBACK_IDB_KEY, payload).catch(() => undefined);
}

export async function restoreDurableFeedback(): Promise<Omit<DurableFeedback, "savedAt"> | null> {
  if (typeof window === "undefined") return null;
  let fromIdb: DurableFeedback | undefined;
  try { fromIdb = await getActivityBlob<DurableFeedback>(DURABLE_FEEDBACK_IDB_KEY); } catch { /* ignore */ }
  const fromLs = readJsonLocal<Partial<DurableFeedback>>(DURABLE_FEEDBACK_LS_KEY);
  if (!fromIdb && !fromLs) return null;
  const pick = <T extends Record<string, unknown>>(a?: T, b?: T): T => ({ ...(b ?? {}), ...(a ?? {}) }) as T;
  return {
    ratings: pick(fromIdb?.ratings as Record<string, number> | undefined, fromLs?.ratings as Record<string, number> | undefined),
    ratingHistory: pick(fromIdb?.ratingHistory as DurableFeedback["ratingHistory"] | undefined, fromLs?.ratingHistory as DurableFeedback["ratingHistory"] | undefined),
    notes: pick(fromIdb?.notes as Record<string, string> | undefined, fromLs?.notes as Record<string, string> | undefined),
    creatorRatings: pick(fromIdb?.creatorRatings as Record<string, number> | undefined, fromLs?.creatorRatings as Record<string, number> | undefined),
    creatorLikes: pick(fromIdb?.creatorLikes as Record<string, true> | undefined, fromLs?.creatorLikes as Record<string, true> | undefined),
    tagLikes: pick(fromIdb?.tagLikes as Record<string, true> | undefined, fromLs?.tagLikes as Record<string, true> | undefined),
    tagHeartHistory: pick(fromIdb?.tagHeartHistory as Record<string, number> | undefined, fromLs?.tagHeartHistory as Record<string, number> | undefined),
    watchTime: pick(fromIdb?.watchTime as DurableFeedback["watchTime"] | undefined, fromLs?.watchTime as DurableFeedback["watchTime"] | undefined),
  };
}


function normalizePhotoSources(raw: unknown): DurablePhotoSource[] {
  if (!Array.isArray(raw)) return [];
  const out: DurablePhotoSource[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const id = typeof rec.id === "string" ? rec.id.trim() : "";
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    const kind = rec.kind === "files" ? "files" : rec.kind === "directory" ? "directory" : null;
    if (!id || !name || !kind || seen.has(id)) continue;
    seen.add(id);
    const photoCount = typeof rec.photoCount === "number" && Number.isFinite(rec.photoCount) ? Math.max(0, Math.floor(rec.photoCount)) : undefined;
    const lastCheckedAt = typeof rec.lastCheckedAt === "number" && Number.isFinite(rec.lastCheckedAt) ? rec.lastCheckedAt : undefined;
    out.push({ id, name, kind, ...(photoCount != null ? { photoCount } : {}), ...(lastCheckedAt != null ? { lastCheckedAt } : {}) });
  }
  return out;
}

function normalizePhotoMeta(raw: unknown): Record<string, DurablePhotoMeta> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, DurablePhotoMeta> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!id || !value || typeof value !== "object") continue;
    const rec = value as Record<string, unknown>;
    const meta: DurablePhotoMeta = {};
    if (typeof rec.path === "string") meta.path = rec.path;
    if (Array.isArray(rec.people)) meta.people = rec.people.filter((p): p is string => typeof p === "string");
    if (Array.isArray(rec.tags)) meta.tags = rec.tags.filter((t): t is string => typeof t === "string");
    if (typeof rec.album === "string") meta.album = rec.album;
    if (typeof rec.favorite === "boolean") meta.favorite = rec.favorite;
    if (typeof rec.rating === "number" && Number.isFinite(rec.rating)) meta.rating = Math.max(0, Math.min(5, Math.floor(rec.rating)));
    if (typeof rec.width === "number" && Number.isFinite(rec.width)) meta.width = Math.floor(rec.width);
    if (typeof rec.height === "number" && Number.isFinite(rec.height)) meta.height = Math.floor(rec.height);
    if (typeof rec.visionModel === "string") meta.visionModel = rec.visionModel;
    if (Array.isArray(rec.vision)) {
      meta.vision = rec.vision.flatMap((row) => {
        if (!row || typeof row !== "object") return [];
        const label = typeof (row as { label?: unknown }).label === "string" ? (row as { label: string }).label : "";
        const score = typeof (row as { score?: unknown }).score === "number" ? (row as { score: number }).score : 0;
        return label ? [{ label, score }] : [];
      });
    }
    out[id] = meta;
  }
  return out;
}

function likesFromPhotoMeta(meta: Record<string, DurablePhotoMeta>, explicit?: string[]) {
  const liked = new Set(normalizeStringList(explicit));
  for (const [id, row] of Object.entries(meta)) {
    if (row.favorite) liked.add(id);
  }
  return [...liked];
}

/** Persist photo source stubs + likes/meta. Thumb prune and prefs QuotaExceeded never clear this key. */
export function saveDurablePhotos(input: { sources?: DurablePhotoSource[]; meta?: Record<string, DurablePhotoMeta>; likes?: string[] }) {
  if (typeof window === "undefined") return;
  const meta = normalizePhotoMeta(input.meta ?? {});
  const likes = likesFromPhotoMeta(meta, input.likes);
  for (const id of likes) {
    meta[id] = { ...(meta[id] ?? {}), favorite: true };
  }
  const payload: DurablePhotos = {
    sources: normalizePhotoSources(input.sources ?? []),
    meta,
    likes,
    savedAt: Date.now(),
  };
  // Keep the legacy meta key as a sync mirror for older Photos code paths.
  writeJsonLocal(PHOTO_META_LS_KEY, payload.meta);
  writeJsonLocal(DURABLE_PHOTOS_LS_KEY, {
    sources: payload.sources,
    likes: payload.likes.slice(0, 2_000),
    meta: Object.fromEntries(Object.entries(payload.meta).slice(0, 2_000)),
    savedAt: payload.savedAt,
  });
  void putActivityBlob(DURABLE_PHOTOS_IDB_KEY, payload).catch(() => undefined);
}

export async function restoreDurablePhotos(): Promise<DurablePhotos> {
  if (typeof window === "undefined") return { sources: [], meta: {}, likes: [], savedAt: 0 };
  let fromIdb: DurablePhotos | undefined;
  try { fromIdb = await getActivityBlob<DurablePhotos>(DURABLE_PHOTOS_IDB_KEY); } catch { /* ignore */ }
  const fromLs = readJsonLocal<DurablePhotos>(DURABLE_PHOTOS_LS_KEY);
  const legacyMeta = normalizePhotoMeta(readJsonLocal<Record<string, DurablePhotoMeta>>(PHOTO_META_LS_KEY));
  const meta = {
    ...legacyMeta,
    ...normalizePhotoMeta(fromLs?.meta),
    ...normalizePhotoMeta(fromIdb?.meta),
  };
  const sources = normalizePhotoSources([
    ...(fromLs?.sources ?? []),
    ...(fromIdb?.sources ?? []),
  ]);
  // Later sources win on id.
  const byId = new Map(sources.map((row) => [row.id, row]));
  const likes = likesFromPhotoMeta(meta, [...(fromLs?.likes ?? []), ...(fromIdb?.likes ?? [])]);
  const merged: DurablePhotos = {
    sources: [...byId.values()],
    meta,
    likes,
    savedAt: Math.max(fromIdb?.savedAt ?? 0, fromLs?.savedAt ?? 0, Date.now()),
  };
  // Re-seat into dedicated store so a later prefs/LS wipe cannot drop likes again.
  if (merged.sources.length || Object.keys(merged.meta).length || merged.likes.length) {
    saveDurablePhotos(merged);
  }
  return merged;
}

export function loadDurablePhotosSync(): DurablePhotos | null {
  if (typeof window === "undefined") return null;
  const fromLs = readJsonLocal<DurablePhotos>(DURABLE_PHOTOS_LS_KEY);
  const legacyMeta = normalizePhotoMeta(readJsonLocal<Record<string, DurablePhotoMeta>>(PHOTO_META_LS_KEY));
  if (!fromLs && !Object.keys(legacyMeta).length) return null;
  const meta = { ...legacyMeta, ...normalizePhotoMeta(fromLs?.meta) };
  return {
    sources: normalizePhotoSources(fromLs?.sources),
    meta,
    likes: likesFromPhotoMeta(meta, fromLs?.likes),
    savedAt: fromLs?.savedAt ?? Date.now(),
  };
}

export function waitForDurableWrites() { return activityWriter.idle(); }


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

/** Small synchronous mirror so a just-saved manual lock survives a tab close. */
export function saveMetadataEdit(id: string, metadata: VideoMetadataProvenance) {
  const edits = readPending<Record<string, VideoMetadataProvenance>>(TAG_PROVENANCE_EDITS_KEY, {});
  edits[id] = metadata;
  try { localStorage.setItem(TAG_PROVENANCE_EDITS_KEY, JSON.stringify(edits)); } catch { /* IndexedDB retains the full preference record. */ }
}

export function restoreMetadataEdits(metadata: Record<string, VideoMetadataProvenance>) {
  return { ...metadata, ...readPending<Record<string, VideoMetadataProvenance>>(TAG_PROVENANCE_EDITS_KEY, {}) };
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
  /** Optional v5 sidecar; old preference snapshots are treated as legacy metadata. */
  metadataProvenance?: Record<string, VideoMetadataProvenance>;
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
  hiddenVideoIds?: string[];
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
    const req = indexedDB.open(DB_NAME, 8);
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
      const thumbs = req.transaction!.objectStore(THUMB_STORE);
      if (!thumbs.indexNames.contains("at")) thumbs.createIndex("at", "at");
      if (!db.objectStoreNames.contains(ACTIVITY_STORE)) db.createObjectStore(ACTIVITY_STORE);
      if (!db.objectStoreNames.contains(ACTIVITY_JOURNAL_STORE)) db.createObjectStore(ACTIVITY_JOURNAL_STORE, { keyPath: "key" });
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
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
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Catalog save was interrupted. Please retry."));
      try {
        for (const video of slice) {
          if (video.isSample) continue;
          const previous = store.get(video.id);
          previous.onsuccess = () => {
            try { store.put(withCatalogDetails(video, previous.result as LibraryVideo | undefined)); }
            catch (error) { tx.abort(); reject(error); }
          };
        }
      } catch (error) {
        tx.abort();
        reject(error);
      }
    });
  }
}

/** Replace a folder atomically: a failed write must retain its previous catalog. */
export async function saveFolderVideos(folderId: string, videos: LibraryVideo[]): Promise<void> {
  if (videos.some((video) => video.folderId !== folderId)) {
    throw new Error("Cannot save catalog entries belonging to another folder.");
  }
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE, "readwrite");
      const store = tx.objectStore(VIDEO_STORE);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Catalog save was interrupted. Your previous catalog is preserved."));
      const request = store.index("folderId").openCursor(IDBKeyRange.only(folderId));
      request.onsuccess = () => {
        try {
          const cursor = request.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
            return;
          }
          for (const video of videos) {
            if (!video.isSample) store.put(video);
          }
        } catch (error) {
          tx.abort();
          reject(error);
        }
      };
    });
  } finally { db.close(); }
}

/** Append/upsert catalog rows without rewriting the whole folder (batched ingest). */
export async function appendCatalogVideos(videos: LibraryVideo[]): Promise<void> {
  if (!videos.length) return;
  const db = await openDb();
  try { await putVideosChunked(db, videos); }
  finally { db.close(); }
}

export async function clearFolderVideos(folderId: string): Promise<void> {
  const db = await openDb();
  await clearFolderVideosTx(db, folderId);
  db.close();
}

export async function loadCatalogVideos(): Promise<LibraryVideo[]> {
  const db = await openDb();
  try {
    const rows: LibraryVideo[] = [];
    let after: IDBValidKey | undefined;
    while (true) {
      const page = await new Promise<{ keys: IDBValidKey[]; rows: LibraryVideo[] }>((resolve, reject) => {
        const tx = db.transaction(VIDEO_STORE, 'readonly');
        const store = tx.objectStore(VIDEO_STORE);
        const range = after === undefined ? undefined : IDBKeyRange.lowerBound(after, true);
        const keys = store.getAllKeys(range, 512), values = store.getAll(range, 512);
        tx.oncomplete = () => resolve({ keys: keys.result, rows: values.result });
        tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
      });
      for (const video of page.rows) if (!video.isSample) rows.push(catalogCard(video));
      if (page.keys.length < 512) break;
      after = page.keys.at(-1);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return rows;
  } finally { db.close(); }
}

export async function loadCatalogVideo(id: string): Promise<LibraryVideo | undefined> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction([VIDEO_STORE, 'remote-cache'], 'readonly');
      const local = tx.objectStore(VIDEO_STORE).get(id);
      const remote = tx.objectStore('remote-cache').get(`video:${id}`);
      tx.oncomplete = () => resolve(remote.result ? withCatalogDetails(remote.result, local.result) : local.result);
      tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export type StoredThumb = { id: string; thumb: string | Blob; at: number };
export async function loadCachedThumb(id: string): Promise<StoredThumb | undefined> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(THUMB_STORE, 'readonly').objectStore(THUMB_STORE).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function loadThumbCache(limit = 120): Promise<StoredThumb[]> {
  const db = await openDb();
  try {
    return await new Promise<StoredThumb[]>((resolve, reject) => {
      const rows: StoredThumb[] = [];
      let bytes = 0;
      const tx = db.transaction(THUMB_STORE, "readonly");
      const req = tx.objectStore(THUMB_STORE).index("at").openCursor(null, "prev");
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor || rows.length >= Math.max(0, limit)) return;
        const row = cursor.value as StoredThumb;
        const size = row.thumb ? artworkBytes(row.thumb) : 0;
        if (size <= 8 * 1024 * 1024 - bytes) { rows.push(row); bytes += size; }
        cursor.continue();
      };
      tx.oncomplete = () => resolve(rows);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

const thumbMirrorWriter = new CoalescedWriter<string, StoredThumb>(async rows => {
  for (const [, entry] of rows) await companionPutThumb(entry.id, await artworkDataUrl(entry.thumb));
}, { batchSize: 2, maxPending: 16, maxWeight: 2 * 1024 * 1024, weight: row => artworkBytes(row.thumb) });
const thumbWriter = new CoalescedWriter<string, { entry: StoredThumb; maxEntries: number }>(async rows => {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(THUMB_STORE, "readwrite");
      const store = tx.objectStore(THUMB_STORE);
      for (const [, { entry }] of rows) store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    await pruneThumbCache(db, Math.min(...rows.map(([, row]) => row.maxEntries)));
  } finally { db.close(); }
  for (const [, { entry }] of rows) if (typeof entry.thumb !== 'string' || entry.thumb.startsWith("data:image")) {
    void thumbMirrorWriter.write(entry.id, entry).catch(() => undefined);
  }
}, { batchSize: 64, maxPending: LIBRARY_LIMITS.thumbCacheEntries, maxWeight: 8 * 1024 * 1024, weight: row => artworkBytes(row.entry.thumb) });

/** Artwork is a recoverable cache: coalesce bursts, cap pending bytes, and
 * prune keys once per batch without cloning every cached image repeatedly. */
export function saveThumbCache(entry: StoredThumb, maxEntries = LIBRARY_LIMITS.thumbCacheEntries): Promise<void> {
  return thumbWriter.write(entry.id, { entry, maxEntries });
}

async function pruneThumbCache(db: IDBDatabase, maxEntries: number): Promise<void> {
  if (maxEntries <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(THUMB_STORE, "readwrite");
    const store = tx.objectStore(THUMB_STORE);
    const count = store.count();
    count.onsuccess = () => {
      let remaining = count.result - maxEntries;
      if (remaining <= 0) return;
      const req = store.index("at").openKeyCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor || remaining <= 0) return;
        store.delete(cursor.primaryKey);
        remaining--;
        cursor.continue();
      };
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function getPersistenceMemorySnapshot() {
  return { activity: activityWriter.snapshot(), artwork: thumbWriter.snapshot(), artworkMirror: thumbMirrorWriter.snapshot() };
}

export type RemoteSnapshot = { videos: LibraryVideo[]; folders: Folder[]; checkedAt: number };
export async function loadRemoteSnapshot(): Promise<RemoteSnapshot | undefined> {
  const db = await openDb();
  try {
    const legacy = await new Promise<{ current?: RemoteSnapshot; meta?: Pick<RemoteSnapshot, "folders" | "checkedAt"> }>((resolve, reject) => {
      const tx = db.transaction("remote-cache", "readonly");
      const store = tx.objectStore("remote-cache");
      const currentReq = store.get("snapshot");
      const metaReq = store.get("meta");
      tx.oncomplete = () => resolve({ current: currentReq.result as RemoteSnapshot | undefined, meta: metaReq.result as Pick<RemoteSnapshot, "folders" | "checkedAt"> | undefined });
      tx.onerror = () => reject(tx.error);
    });
    const videos = new Map<string, LibraryVideo>();
    let afterKey: IDBValidKey | undefined;
    // One cursor callback per title made a 50–100k catalog spend seconds in
    // IndexedDB event dispatch. Bounded getAll pages keep clone allocations
    // small while reducing that work to a few hundred callbacks.
    while (true) {
      const page = await new Promise<{ keys: IDBValidKey[]; rows: LibraryVideo[] }>((resolve, reject) => {
        const tx = db.transaction("remote-cache", "readonly");
        const store = tx.objectStore("remote-cache");
        const range = IDBKeyRange.bound(afterKey ?? "video:", "video;", afterKey !== undefined, true);
        const keysReq = store.getAllKeys(range, 512);
        const rowsReq = store.getAll(range, 512);
        tx.oncomplete = () => resolve({ keys: keysReq.result, rows: rowsReq.result as LibraryVideo[] });
        tx.onerror = () => reject(tx.error);
      });
      for (const video of page.rows) if (video?.id) videos.set(video.id, catalogCard(video));
      if (page.keys.length < 512) break;
      afterKey = page.keys[page.keys.length - 1];
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    // Migrate the old giant snapshot once so on-demand detail reads can use
    // individual records too. Never mark a legacy detail as disk-addressable
    // before its normalized record has actually been saved.
    if (legacy.current?.videos.length) {
      const missing = legacy.current.videos.filter(video => !videos.has(video.id));
      let migrated = false;
      try { await saveRemoteSnapshot({ ...legacy.current, videos: missing }, true); migrated = true; } catch { /* Retain full legacy details in this session. */ }
      for (const video of missing) videos.set(video.id, migrated ? catalogCard(video) : video);
    }
    const meta = legacy.meta ?? legacy.current;
    return meta ? { videos: [...videos.values()], folders: meta.folders, checkedAt: meta.checkedAt } : undefined;
  } finally { db.close(); }
}
export async function saveRemoteSnapshot(snapshot: RemoteSnapshot, complete = false): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("remote-cache", "readwrite");
      tx.objectStore("remote-cache").put({ folders: snapshot.folders, checkedAt: snapshot.checkedAt }, "meta");
      tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(tx.error);
    });
    // Structured cloning a single 30–100k-video object caused large transient
    // allocations. Rows are upserted in small transactions instead.
    for (let i = 0; i < snapshot.videos.length; i += IDB_WRITE_CHUNK) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("remote-cache", "readwrite");
        const store = tx.objectStore("remote-cache");
        for (const video of snapshot.videos.slice(i, i + IDB_WRITE_CHUNK)) {
          const key = `video:${video.id}`, previous = store.get(key);
          previous.onsuccess = () => {
            try { store.put(withCatalogDetails(video, previous.result as LibraryVideo | undefined), key); }
            catch (error) { tx.abort(); reject(error); }
          };
        }
        tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(tx.error);
      });
    }
    if (complete) await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("remote-cache", "readwrite");
      tx.objectStore("remote-cache").delete("snapshot");
      tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export async function removeRemoteSnapshotVideos(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await openDb();
  try {
    for (let i = 0; i < ids.length; i += IDB_WRITE_CHUNK) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("remote-cache", "readwrite");
        const store = tx.objectStore("remote-cache");
        for (const id of ids.slice(i, i + IDB_WRITE_CHUNK)) store.delete(`video:${id}`);
        tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
      });
    }
  } finally { db.close(); }
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
    metadataProvenance: raw.metadataProvenance && typeof raw.metadataProvenance === "object"
      ? raw.metadataProvenance as Record<string, VideoMetadataProvenance>
      : {},
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
    hiddenVideoIds: Array.isArray(raw.hiddenVideoIds) ? raw.hiddenVideoIds.filter((id): id is string => typeof id === "string") : [],
  };
}

const VIEW_PREFS_KEY = "reelcase.view-prefs.v1";
type ViewPrefs = Pick<Prefs, "view" | "sort" | "sourceId">;
let viewPrefs: ViewPrefs | undefined;
export function saveViewPrefs(prefs: ViewPrefs) {
  viewPrefs = { view: prefs.view, sort: prefs.sort, sourceId: prefs.sourceId === "adults" || prefs.sourceId === "adult-fetishes" ? "home" : prefs.sourceId };
  try { localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify(viewPrefs)); }
  catch { /* Keep view preferences in memory; library data remains in IndexedDB. */ }
}

function loadFullPrefs(): Prefs | null {
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

export function loadPrefs(): Prefs | null {
  const full = loadFullPrefs();
  if (typeof window === "undefined") return full;
  if (!viewPrefs) {
    try {
      const saved = JSON.parse(localStorage.getItem(VIEW_PREFS_KEY) ?? "null");
      if (saved && ["grid", "list"].includes(saved.view) && ["name", "added", "size", "duration", "recent", "type", "folder", "path"].includes(saved.sort) && typeof saved.sourceId === "string") viewPrefs = saved;
    } catch { /* Ignore malformed display preferences. */ }
  }
  const prefs = viewPrefs ? { ...(full ?? normalize({})), ...viewPrefs } : full;
  const shelves = recoverSavedShelves(null, readJsonLocal<DurableShelves>(DURABLE_SHELVES_LS_KEY));
  return shelves.authoritative ? { ...(prefs ?? normalize({})), favorites: shelves.favorites, likes: shelves.likes } : prefs;
}

export function savePrefs(prefs: Prefs) {
  if (typeof window === "undefined") return;
  saveViewPrefs(prefs);
  durablePrefs = prefs;
  // Keep large metadata out of synchronous, quota-limited localStorage.
  // Ordered transactions prevent an older edit overwriting a newer one.
  const pending = putActivityBlob("preferences", prefs);
  if (prefsWrites !== pending) {
    prefsWrites = pending;
    void pending.catch(() => {
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(durablePrefs)); }
      catch { window.dispatchEvent(new CustomEvent("reelcase:save-error")); }
    });
  }
}
