import { createSignalRevisions } from '../stream-signal-revisions.ts';
import { createWriterLease } from '../writer-lease.ts';
import { createStudioOutputs } from '../studio-outputs.ts';
import {newestProviderViewing,type ProviderViewing} from './provider-viewing.ts';
import {createCatalogMutations} from './catalog-mutations.ts';
import {createStorageRecovery} from './storage-recovery.ts';
import {newestAnimeReviews,type AnimeReviewLedger} from './anime-review.ts';
import {newestFilms,type FilmLedger} from './film-review.ts';
import {newestGuidePreset,type GuidePreset} from './guide-preset.ts';
import {newestBridges,type BridgeLedger} from './topic-bridges.ts';
import { newestTopicAliases,type TopicAliasLedger } from './topic-aliases.ts';
import { newestExposure, type ExposureLedger } from './recommendation-exposure.ts';
import { newestRejections, type RejectionLedger } from './recommendation-rejections';
import { normalizeYoutubeLiveEvidence } from '../remote/youtube-live-evidence';
import { normalizeProviderCache } from '../provider-cache-metrics.ts';
import { cleanupKey, normalizeYoutubeCleanup, retiredYoutubeKeys, type YoutubeCleanupJournal } from './youtube-cleanup.ts';
import { mergeFollowRecovery, normalizeFollowCheckpoints } from './follow-checkpoints.ts';
import { recoverSavedShelves, recoverSavedShelfEdits, isSavedShelfEdit, savedShelfEditKey, type SavedShelfEdit } from "./saved-library";
import { cacheMetrics } from '../cache-metrics.ts';
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
import { collectCatalogRows, forEachCatalogSlice, yieldCatalogTask } from '../catalog-work';
import { recoveredEnrichmentRow, type EnrichmentLedgers, type EnrichmentRow } from './enrichment-batch';
import type { CreatorCoverageRow } from './creator-coverage-repair';
import { decodeSparseRecord, encodeSparseRecord, patchSparseRecord, sparseRecordBuilder, type EncodedSparseRecord } from '../sparse-record';
import { decodeActivityRecords, encodeActivityRecords, mergeResumeRecords, recentActivityRecord, type StoredActivity } from './activity-records';
import { createRecoveryLinkWriter, type SavedVideoLink } from './recovery-links';
export type { SavedVideoLink } from './recovery-links';

export function signalRevisions(owner:string){return createSignalRevisions(openDb,owner);}
export function studioOutputs(owner:string){return createStudioOutputs(openDb,owner);}
const DB_NAME = "reelcase";
export const catalogWriter=createWriterLease(openDb,"catalog");
function catalogTransaction(db:IDBDatabase,stores:string|string[],mode:IDBTransactionMode="readwrite"){
  const token=catalogWriter.current();if(!token)throw Error('Catalog writer lease is required.');
  const tx=db.transaction([...new Set([...(typeof stores==='string'?[stores]:stores),'remote-cache'])],mode);
  catalogWriter.guard(tx,token,()=>{});return tx;
}
export function withCatalogRead<T>(work:()=>Promise<T>){if(catalogWriter.current())return Promise.reject(new Error('Wait for this tab to finish its current catalog work.'));return catalogWriter.run(work,false);}
import.meta.hot?.dispose(()=>catalogWriter.close());
const catalogMutations=createCatalogMutations(openDb,catalogWriter);
export function recoverCatalogMutations(){return catalogMutations.recover();}
export function saveCatalogMetadataEdit(row:Parameters<typeof catalogMutations.edit>[0]){return catalogMutations.edit(row);}
export function restoreCatalogMetadata(base:Parameters<typeof catalogMutations.restore>[0]){return catalogMutations.restore(base);}
const storageRecovery=createStorageRecovery(openDb);
export const previewStorageCleanup=storageRecovery.preview;
export const cancelStorageCleanup=storageRecovery.cancel;
export const confirmStorageCleanup=storageRecovery.clean;
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
const normalizedCountWrites = new WeakMap<object, Record<string, number>>();
type StoredPrefs = StoredActivity<Prefs> & { sparseMetadataRecords?: { tags?: EncodedSparseRecord<string[]>;
  metadataProvenance?: EncodedSparseRecord<VideoMetadataProvenance>; categories?: EncodedSparseRecord<string> } };

export async function restoreDurablePrefs(): Promise<void> {
  const db = await openDb();
  try {
    const saved = await new Promise<StoredPrefs | undefined>((resolve, reject) => {
      const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get("preferences");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (saved) {
      const { sparseMetadataRecords, ...prefs } = decodeActivityRecords(saved);
      durablePrefs = { ...prefs, tags: decodeSparseRecord(sparseMetadataRecords?.tags ?? saved.tags),
        metadataProvenance: decodeSparseRecord(sparseMetadataRecords?.metadataProvenance ?? saved.metadataProvenance), categories:decodeSparseRecord(sparseMetadataRecords?.categories??saved.categories) };
    }
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
    const cache = normalizeProviderCache(rec.cache);
    if (!kind || (!handle && !id)) continue;
    out.push({
      id: id || `${kind === "twitch" ? "tw" : "yt"}:${handle}`,
      kind,
      handle: handle || id.replace(/^(?:yt|tw):/i, ""),
      title: title || handle || id,
      ...(typeof rec.channelId === "string" ? { channelId: rec.channelId } : {}),
      ...(typeof rec.importQuery === 'string' && rec.importQuery.length <= 2048 ? { importQuery: rec.importQuery } : {}),
      ...(rec.importNeedsReview === true ? { importNeedsReview: true } : {}),
      ...(rec.identityReview && typeof rec.identityReview === "object" && /^v1:[a-f0-9]{1,8}:\d+$/.test(String((rec.identityReview as Record<string, unknown>).fingerprint)) && typeof (rec.identityReview as Record<string, unknown>).at === "number" && Number.isFinite((rec.identityReview as Record<string, unknown>).at) ? { identityReview: rec.identityReview as FollowedChannel["identityReview"] } : {}),
      ...(typeof rec.thumb === "string" ? { thumb: rec.thumb } : {}),
      ...(typeof rec.live === "boolean" ? { live: rec.live } : {}),
      ...(kind === "youtube" ? {
        ...(rec.youtubeLiveKnownOverflow === true ? {youtubeLiveKnownOverflow:true}:{}),
        ...(normalizeYoutubeLiveEvidence(rec.youtubeLiveEvidence) ? {youtubeLiveEvidence:normalizeYoutubeLiveEvidence(rec.youtubeLiveEvidence)}:{}),
        ...(Array.isArray(rec.youtubeLiveVideoIds) ? {youtubeLiveVideoIds:[...new Set(rec.youtubeLiveVideoIds.filter((id):id is string=>typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id)))].slice(0,64)}:{})
      }:{}),
      ...(typeof rec.liveOfflineSince === "number" && Number.isFinite(rec.liveOfflineSince) && rec.liveOfflineSince > 0 ? { liveOfflineSince: rec.liveOfflineSince } : {}),
      ...(rec.lastLiveWarning && typeof rec.lastLiveWarning === "object" && Number.isFinite((rec.lastLiveWarning as any).at) && (rec.lastLiveWarning as any).at > 0 && typeof (rec.lastLiveWarning as any).message === "string" ? {lastLiveWarning:{at:(rec.lastLiveWarning as any).at,message:(rec.lastLiveWarning as any).message.slice(0,240)}} : {}),
      ...(typeof rec.lastCheckedAt === "number" ? { lastCheckedAt: rec.lastCheckedAt } : {}),
      ...(typeof rec.liveCheckedAt === "number" && Number.isFinite(rec.liveCheckedAt) ? { liveCheckedAt: rec.liveCheckedAt } : {}),
      ...(typeof rec.newestPublishedAt === "number" ? { newestPublishedAt: rec.newestPublishedAt } : {}),
      ...(typeof rec.newestVideoId === "string" && rec.newestVideoId ? { newestVideoId: rec.newestVideoId } : {}),
      ...normalizeFollowCheckpoints(rec),
      ...(typeof rec.lastResponseCount === "number" ? { lastResponseCount: rec.lastResponseCount } : {}),
      ...(cache ? { cache } : {}),
      ...(rec.lastProviderFailure && typeof rec.lastProviderFailure === "object" ? { lastProviderFailure: rec.lastProviderFailure as FollowedChannel["lastProviderFailure"] } : {}),
      ...(rec.lastLiveFailure && typeof rec.lastLiveFailure === "object" ? { lastLiveFailure: rec.lastLiveFailure as FollowedChannel["lastLiveFailure"] } : {}),
    });
  }
  return out;
}

function readFollowsLocalPayload(): DurableFollows | null {
  try {
    const raw = JSON.parse(localStorage.getItem(FOLLOWS_LS_KEY) ?? "null") as DurableFollows | FollowedChannel[] | null;
    if (Array.isArray(raw)) return { channels: normalizeFollowChannels(raw), savedAt: 0 };
    if (raw && typeof raw === "object" && Array.isArray((raw as DurableFollows).channels)) {
      return { channels: normalizeFollowChannels((raw as DurableFollows).channels), savedAt: Number.isFinite(raw.savedAt) ? raw.savedAt : 0 };
    }
  } catch { /* ignore malformed mirror */ }
  return null;
}
function readFollowsLocal(): FollowedChannel[] | null { return readFollowsLocalPayload()?.channels ?? null; }

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
  let idbSavedAt = 0;
  try {
    const db = await openDb();
    try {
      const saved = await new Promise<DurableFollows | FollowedChannel[] | undefined>((resolve, reject) => {
        const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get(FOLLOWS_IDB_KEY);
        req.onsuccess = () => resolve(req.result as DurableFollows | FollowedChannel[] | undefined);
        req.onerror = () => reject(req.error);
      });
      if (Array.isArray(saved)) fromIdb = normalizeFollowChannels(saved);
      else if (saved && typeof saved === "object") { fromIdb = normalizeFollowChannels(saved.channels); idbSavedAt = Number.isFinite(saved.savedAt) ? saved.savedAt : 0; }
    } finally { db.close(); }
  } catch { /* fall through to localStorage / prefs migration */ }
  const fromLs = readFollowsLocalPayload() ?? { channels: [], savedAt: 0 };
  const merged = mergeFollowRecovery({ channels: fromIdb, savedAt: idbSavedAt }, fromLs);
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

export type DurableHistory = { entries: HistoryEntry[]; savedAt: number };
export type DurableResume = { progress: Prefs["progress"]; resumeProgress: NonNullable<Prefs["resumeProgress"]>; savedAt: number };
export type DurableMarks = { viewCounts: Record<string, number>; cameCounts: Record<string, number>; savedAt: number };
export type DurableShelves = { favorites: string[]; likes: string[]; savedAt: number };
export type DurableLinks = { links: SavedVideoLink[]; savedAt: number };
export type DurableFeedback = {
  recommendationRejections?: RejectionLedger;
  ratings: Record<string, number>;
  ratingHistory: Record<string, { rating: number; updatedAt: number }>;
  notes: Record<string, string>;
  creatorRatings: Record<string, number>;
  creatorLikes: Record<string, true>;
  creatorFavorites?: Record<string, true>;
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
      let changed = false;
      for (const [key, payload] of rows) if (key.startsWith(SHELF_EDIT_PREFIX) && isSavedShelfEdit(payload)) {
        const edits = pendingShelfEdits();
        const id = savedShelfEditKey(payload);
        if (edits.get(id)?.at === payload.at) { edits.delete(id); changed = true; }
      }
      if (changed) mirrorShelfEdits();
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
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; /* IndexedDB remains the durable path. */ }
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
  const slimResume = recentActivityRecord(resumeProgress);
  writeJsonLocal(DURABLE_RESUME_LS_KEY, { progress: {}, resumeProgress: slimResume, savedAt: payload.savedAt });
  void putActivityBlob(DURABLE_RESUME_IDB_KEY, encodeActivityRecords(payload)).catch(() => undefined);
}

export async function restoreDurableResume(): Promise<{ progress: Prefs["progress"]; resumeProgress: NonNullable<Prefs["resumeProgress"]> }> {
  if (typeof window === "undefined") return { progress: {}, resumeProgress: {} };
  let fromIdb: DurableResume | undefined;
  try { const saved = await getActivityBlob<StoredActivity<DurableResume>>(DURABLE_RESUME_IDB_KEY); if (saved) fromIdb = decodeActivityRecords(saved); } catch { /* ignore */ }
  const fromLs = readJsonLocal<DurableResume>(DURABLE_RESUME_LS_KEY);
  const progress = mergeResumeRecords(normalizeProgressMap(fromIdb?.progress), normalizeProgressMap(fromLs?.progress));
  const resumeProgress = mergeResumeRecords(normalizeProgressMap(fromIdb?.resumeProgress), normalizeProgressMap(fromLs?.resumeProgress));
  return { progress, resumeProgress };
}

export function saveDurableMarks(viewCounts: Record<string, number>, cameCounts: Record<string, number>) {
  if (typeof window === "undefined") return;
  const clean = (record: Record<string, number>) => {
    if (encodeSparseRecord(record) !== record) return record;
    let normalized = normalizedCountWrites.get(record);
    if (!normalized) { normalized = asCountMap(record); normalizedCountWrites.set(record, normalized); }
    return normalized;
  };
  const payload: DurableMarks = { viewCounts: clean(viewCounts), cameCounts: clean(cameCounts), savedAt: Date.now() };
  writeJsonLocal(DURABLE_MARKS_LS_KEY, { viewCounts: recentActivityRecord(viewCounts), cameCounts: recentActivityRecord(cameCounts), savedAt: payload.savedAt });
  void putActivityBlob(DURABLE_MARKS_IDB_KEY, encodeActivityRecords(payload)).catch(() => undefined);
}

export async function restoreDurableMarks(): Promise<{ viewCounts: Record<string, number>; cameCounts: Record<string, number> }> {
  if (typeof window === "undefined") return { viewCounts: {}, cameCounts: {} };
  let fromIdb: DurableMarks | undefined;
  try { const saved = await getActivityBlob<StoredActivity<DurableMarks>>(DURABLE_MARKS_IDB_KEY); if (saved) fromIdb = decodeActivityRecords(saved); } catch { /* ignore */ }
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
  const payload: DurableShelves = { favorites: normalizeStringList(favorites), likes: normalizeStringList(likes), savedAt: nextShelfTime() };
  writeJsonLocal(DURABLE_SHELVES_LS_KEY, payload);
  void putActivityBlob(DURABLE_SHELVES_IDB_KEY, payload).then(() => walkShelfEdits((row, key, store) => {
    if (isSavedShelfEdit(row) && row.at < payload.savedAt) store.delete(key);
  }, true)).catch(() => undefined);
}

const SHELF_EDIT_PREFIX = 'saved-edit:';
const SHELF_EDITS_LS_KEY = 'reelcase.saved-edits.v1';
let shelfTime = 0;
let shelfEdits: Map<string, SavedShelfEdit> | undefined;
function nextShelfTime() { return shelfTime = Math.max(Date.now(), shelfTime + 1); }
function pendingShelfEdits() {
  if (!shelfEdits) {
    shelfEdits = new Map();
    const rows = readJsonLocal<unknown>(SHELF_EDITS_LS_KEY);
    if (Array.isArray(rows)) for (const row of rows) if (isSavedShelfEdit(row)) {
      const key = savedShelfEditKey(row), previous = shelfEdits.get(key);
      if (!previous || previous.at <= row.at) shelfEdits.set(key, row);
      shelfTime = Math.max(shelfTime, row.at);
    }
  }
  return shelfEdits;
}
function mirrorShelfEdits() {
  const edits = pendingShelfEdits();
  if (edits.size) writeJsonLocal(SHELF_EDITS_LS_KEY, [...edits.values()]);
  else try { localStorage.removeItem(SHELF_EDITS_LS_KEY); } catch { /* old replay is idempotent */ }
}
function enqueueShelfEdit(row: SavedShelfEdit) {
  void putActivityBlob(SHELF_EDIT_PREFIX + savedShelfEditKey(row), row).catch(() => undefined);
}
/** A click writes one tiny replay record, never enumerating/serializing its full shelf. */
export function saveSavedShelfEdit(id: string, shelf: SavedShelfEdit['shelf'], saved: boolean) {
  if (typeof window === 'undefined' || !id.trim()) return;
  const edits = pendingShelfEdits(), row: SavedShelfEdit = { id, shelf, saved, at: nextShelfTime() };
  edits.set(savedShelfEditKey(row), row);
  mirrorShelfEdits();
  enqueueShelfEdit(row);
}
/** Complete disk replay/compaction in bounded transactions. Newer edits survive
 * a checkpoint racing with a queued write; old snapshots cannot resurrect removals. */
async function walkShelfEdits(visit: (row: unknown, key: IDBValidKey, store: IDBObjectStore) => void, writing = false) {
  const db = await openDb();
  let after: IDBValidKey = SHELF_EDIT_PREFIX;
  try {
    for (;;) {
      await yieldCatalogTask();
      const page = await new Promise<{ rows: unknown[]; keys: IDBValidKey[] }>((resolve, reject) => {
        const tx = db.transaction(ACTIVITY_STORE, writing ? 'readwrite' : 'readonly'), store = tx.objectStore(ACTIVITY_STORE);
        const range = IDBKeyRange.bound(after, 'saved-edit;', after !== SHELF_EDIT_PREFIX, true);
        const rows = store.getAll(range, 256), keys = store.getAllKeys(range, 256);
        let visited = false;
        const read = () => {
          if (visited || rows.readyState !== 'done' || keys.readyState !== 'done') return;
          visited = true;
          for (let i = 0; i < rows.result.length; i++) visit(rows.result[i], keys.result[i]!, store);
        };
        rows.onsuccess = read; keys.onsuccess = read;
        tx.oncomplete = () => resolve({ rows: rows.result, keys: keys.result });
        tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
      });
      if (page.keys.length < 256) break;
      after = page.keys[page.keys.length - 1]!;
    }
  } finally { db.close(); }
}

export async function restoreDurableShelves(strict = false): Promise<{ favorites: string[]; likes: string[]; authoritative: boolean }> {
  if (typeof window === "undefined") return { favorites: [], likes: [], authoritative: false };
  let fromIdb: DurableShelves | undefined;
  try { fromIdb = await getActivityBlob<DurableShelves>(DURABLE_SHELVES_IDB_KEY); }
  catch (error) { if (strict) throw new Error('Saved likes and favorites could not be verified. Cache cleanup was stopped.', { cause: error }); }
  const fromLs = readJsonLocal<DurableShelves>(DURABLE_SHELVES_LS_KEY);
  shelfTime = Math.max(shelfTime, Number.isFinite(fromIdb?.savedAt) ? fromIdb!.savedAt : 0, Number.isFinite(fromLs?.savedAt) ? fromLs!.savedAt : 0);
  const edits: SavedShelfEdit[] = [];
  try { await walkShelfEdits(row => { if (isSavedShelfEdit(row)) { edits.push(row); shelfTime = Math.max(shelfTime, row.at); } }); }
  catch (error) { if (strict) throw new Error('Saved likes and favorites could not be verified. Cache cleanup was stopped.', { cause: error }); }
  const pending = [...pendingShelfEdits().values()];
  const result = recoverSavedShelfEdits(fromIdb, fromLs, loadPrefs(), [...edits, ...pending]);
  for (const row of pending) enqueueShelfEdit(row);
  return result;
}

const recoveryLinkWriter = createRecoveryLinkWriter(async links => {
  const payload: DurableLinks = { links, savedAt: Date.now() };
  writeJsonLocal(DURABLE_LINKS_LS_KEY, { links: payload.links.slice(0, 200), savedAt: payload.savedAt });
  await putActivityBlob(DURABLE_LINKS_IDB_KEY, payload);
});
export function saveDurableLinks(links: SavedVideoLink[]): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  return recoveryLinkWriter.write({ links }).catch(() => undefined);
}
/** Derive recovery URLs after the action paints; retain the complete disk list. */
export function saveRecoveryLinks(history: HistoryEntry[], resumeProgress: Record<string, ResumeMark>): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  return recoveryLinkWriter.write({ history, resumeProgress }).catch(() => undefined);
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
  const localSaved = writeJsonLocal(DURABLE_FEEDBACK_LS_KEY, feedback);
  return putActivityBlob(DURABLE_FEEDBACK_IDB_KEY, payload).then(() => true, () => localSaved);
}

export async function restoreDurableFeedback(strict = false): Promise<Omit<DurableFeedback, "savedAt"> | null> {
  if (typeof window === "undefined") return null;
  let fromIdb: DurableFeedback | undefined;
  try { fromIdb = await getActivityBlob<DurableFeedback>(DURABLE_FEEDBACK_IDB_KEY); }
  catch (error) { if (strict) throw new Error('Saved ratings could not be verified. Cache cleanup was stopped.', { cause: error }); }
  const fromLs = readJsonLocal<Partial<DurableFeedback>>(DURABLE_FEEDBACK_LS_KEY);
  if (!fromIdb && !fromLs) return null;
  const pick = <T extends Record<string, unknown>>(a?: T, b?: T): T => ({ ...(b ?? {}), ...(a ?? {}) }) as T;
  return {
    recommendationRejections: newestRejections(fromIdb?.recommendationRejections, fromLs?.recommendationRejections),
    ratings: pick(fromIdb?.ratings as Record<string, number> | undefined, fromLs?.ratings as Record<string, number> | undefined),
    ratingHistory: pick(fromIdb?.ratingHistory as DurableFeedback["ratingHistory"] | undefined, fromLs?.ratingHistory as DurableFeedback["ratingHistory"] | undefined),
    notes: pick(fromIdb?.notes as Record<string, string> | undefined, fromLs?.notes as Record<string, string> | undefined),
    creatorRatings: pick(fromIdb?.creatorRatings as Record<string, number> | undefined, fromLs?.creatorRatings as Record<string, number> | undefined),
    creatorFavorites: pick(fromIdb?.creatorFavorites ?? fromIdb?.creatorLikes, fromLs?.creatorFavorites ?? fromLs?.creatorLikes),
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
    if (typeof rec.hidden === "boolean") meta.hidden = rec.hidden;
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
  return patchSparseRecord(tags, Object.entries(readPending<Record<string, string[]>>(TAG_EDITS_KEY, {})));
}

/** Small synchronous mirror so a just-saved manual lock survives a tab close. */
export function saveMetadataEdit(id: string, metadata: VideoMetadataProvenance) {
  const edits = readPending<Record<string, VideoMetadataProvenance>>(TAG_PROVENANCE_EDITS_KEY, {});
  edits[id] = metadata;
  try { localStorage.setItem(TAG_PROVENANCE_EDITS_KEY, JSON.stringify(edits)); } catch { /* IndexedDB retains the full preference record. */ }
}

export function restoreMetadataEdits(metadata: Record<string, VideoMetadataProvenance>) {
  return patchSparseRecord(metadata, Object.entries(readPending<Record<string, VideoMetadataProvenance>>(TAG_PROVENANCE_EDITS_KEY, {})));
}

const ENRICHMENT_PREFIX = 'metadata-enrichment:';
/** Save one small creator repair atomically with its optional unlocked tags.
 * A foreground edit aborts the pending transaction, so obsolete preparation
 * cannot overwrite disk after an unfollow, manual edit or catalog refresh. */
export function saveCreatorCoverageRows(...args:Parameters<typeof saveCreatorCoverageRowsOwned>){if(!args[0].length)return Promise.resolve();return catalogWriter.run(()=>saveCreatorCoverageRowsOwned(...args));}
async function saveCreatorCoverageRowsOwned(rows: readonly CreatorCoverageRow[], turn: () => Promise<void>,
  valid: () => boolean, subscribe?: (changed: () => void) => () => void) {
  if (!rows.length) return;
  const db = await openDb();
  try {
    await turn();
    if (!valid()) throw new DOMException('Creator repair inputs changed', 'AbortError');
    await new Promise<void>((resolve, reject) => {
      const tx = catalogTransaction(db,['remote-cache', ACTIVITY_STORE], 'readwrite');
      let stale = false;
      const invalidate = () => { if (!valid()) { stale = true; try { tx.abort(); } catch { /* already completed */ } } };
      const stop = subscribe?.(invalidate) ?? (() => {});
      tx.oncomplete = () => { stop(); resolve(); };
      tx.onerror = tx.onabort = () => { stop(); reject(stale ? new DOMException('Creator repair inputs changed', 'AbortError') : tx.error ?? new Error('Creator repair was not saved')); };
      const remote = tx.objectStore('remote-cache'), activity = tx.objectStore(ACTIVITY_STORE);
      for (const row of rows) {
        const previous = remote.get(`video:${row.video.id}`);
        previous.onsuccess = () => {
          invalidate(); if (stale) return;
          try {
            remote.put(withCatalogDetails(row.video, previous.result as LibraryVideo | undefined), `video:${row.video.id}`);
            if (row.enrichment) activity.put(row.enrichment, ENRICHMENT_PREFIX + row.video.id);
          } catch (error) { try { tx.abort(); } finally { reject(error); } }
        };
      }
    });
  } finally { db.close(); }
}

/** Sparse durable rows avoid cloning the entire preference blob for every
 * automatic batch. A transaction completes before a batch reports success. */
export async function saveEnrichmentRows(rows: readonly EnrichmentRow[], turn = yieldCatalogTask) {
  if (!rows.length) return;
  const db = await openDb();
  try {
    for (let offset = 0; offset < rows.length; offset += 64) {
    await turn();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ACTIVITY_STORE, 'readwrite'), store = tx.objectStore(ACTIVITY_STORE);
      for (let index = offset; index < Math.min(rows.length, offset + 64); index++) {
        const row = rows[index]!; store.put(row, ENRICHMENT_PREFIX + row.id);
      }
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
    }
  } finally { db.close(); }
}

export async function removeEnrichmentRows(ids: readonly string[]) {
  if (!ids.length) return;
  const db = await openDb();
  try {
    for (let offset = 0; offset < ids.length; offset += 64) {
    await yieldCatalogTask();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ACTIVITY_STORE, 'readwrite'), store = tx.objectStore(ACTIVITY_STORE);
      for (let index = offset; index < Math.min(ids.length, offset + 64); index++) store.delete(ENRICHMENT_PREFIX + ids[index]);
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
    }
  } finally { db.close(); }
}

export async function restoreEnrichmentRows(base: EnrichmentLedgers): Promise<EnrichmentLedgers> {
  const db = await openDb();
  let ledgers = base, after: string | undefined;
  try {
    for (;;) {
      const rows = await new Promise<EnrichmentRow[]>((resolve, reject) => {
        const range = IDBKeyRange.bound(after ?? ENRICHMENT_PREFIX, ENRICHMENT_PREFIX + '\uffff', Boolean(after), true);
        const request = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).getAll(range, 256);
        request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
      });
      if (!rows.length) break;
      const tags = sparseRecordBuilder(ledgers.tags), provenance = sparseRecordBuilder(ledgers.metadataProvenance);
      await forEachCatalogSlice(rows, row => {
        if (row && typeof row.id === 'string' && Array.isArray(row.tags) && row.tags.every(tag => typeof tag === 'string')
          && row.provenance && row.provenance.tags && typeof row.provenance.tags === 'object') {
          const restored = recoveredEnrichmentRow(ledgers, row);
          if (restored) { tags.set(row.id, restored.tags); provenance.set(row.id, restored.provenance); }
        }
      }, yieldCatalogTask, 96);
      ledgers = { tags: tags.finish(), metadataProvenance: provenance.finish() };
      after = ENRICHMENT_PREFIX + rows[rows.length - 1]!.id;
      if (rows.length < 256) break;
    }
    return ledgers;
  } finally { db.close(); }
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

/** Small tool documents share the existing activity store. The caller supplies
 * the current-user namespace; these reads never walk the media catalog. */
export async function readWorkspaceDocument(key: string): Promise<unknown> {
  const db = await openDb();
  try { return await new Promise((resolve, reject) => {
    const request = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get(key);
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  }); } finally { db.close(); }
}
export async function listWorkspaceDocuments(prefix: string, before?: string, limit = 9): Promise<Array<{ key: string; value: unknown }>> {
  const db = await openDb();
  try { return await new Promise((resolve, reject) => {
    const result: Array<{ key: string; value: unknown }> = [];
    const range = IDBKeyRange.bound(prefix, before ?? prefix + '\uffff', false, !!before);
    const request = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).openCursor(range, 'prev');
    request.onsuccess = () => { const cursor = request.result;
      if (!cursor || result.length >= Math.max(1, Math.min(50, limit))) { resolve(result); return; }
      result.push({ key: String(cursor.key), value: cursor.value }); cursor.continue();
    }; request.onerror = () => reject(request.error);
  }); } finally { db.close(); }
}
export async function saveWorkspaceDocuments(rows: ReadonlyArray<{ key: string; value: unknown }>): Promise<void> {
  if (!rows.length) return;
  const db = await openDb();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ACTIVITY_STORE, 'readwrite');
    tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(tx.error ?? Error('Could not save tool documents.'));
    for (const row of rows) tx.objectStore(ACTIVITY_STORE).put(row.value, row.key);
  }); } finally { db.close(); }
}

export function saveDirHandle(...args:Parameters<typeof saveDirHandleOwned>){return catalogWriter.run(()=>saveDirHandleOwned(...args));}
async function saveDirHandleOwned(entry: StoredDir): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = catalogTransaction(db,STORE, "readwrite");
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

export function deleteDirHandle(...args:Parameters<typeof deleteDirHandleOwned>){return catalogWriter.run(()=>deleteDirHandleOwned(...args));}
async function deleteDirHandleOwned(id: string): Promise<void> {
  await recoverCatalogMutations();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = catalogTransaction(db,[STORE, VIDEO_STORE, SOURCE_HEALTH_STORE], "readwrite");
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
    const tx = catalogTransaction(db,VIDEO_STORE, "readwrite");
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

async function putVideosChunked(_db: IDBDatabase, videos: LibraryVideo[], metadata?:Pick<Prefs,"tags"|"metadataProvenance">): Promise<void> {
  for (let offset=0;offset<videos.length;offset+=64) {
    const rows=videos.slice(offset,offset+64),enrichment=metadata?rows.flatMap(video=>{const provenance=metadata.metadataProvenance?.[video.id];return provenance?[{id:video.id,tags:metadata.tags[video.id]??[],provenance}]:[];}):undefined;
    await catalogMutations.write({version:1,kind:"local",rows,enrichment});
    await yieldCatalogTask();
  }
}

/** Replace a folder atomically: a failed write must retain its previous catalog. */
export function saveFolderVideos(...args:Parameters<typeof saveFolderVideosOwned>){return catalogWriter.run(()=>saveFolderVideosOwned(...args));}
async function saveFolderVideosOwned(folderId: string, videos: LibraryVideo[]): Promise<void> {
  await recoverCatalogMutations();
  if (videos.some((video) => video.folderId !== folderId)) {
    throw new Error("Cannot save catalog entries belonging to another folder.");
  }
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = catalogTransaction(db,[VIDEO_STORE, 'remote-cache'], "readwrite");
      const store = tx.objectStore(VIDEO_STORE);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Catalog save was interrupted. Your previous catalog is preserved."));
      const cleanup = tx.objectStore('remote-cache').get(YOUTUBE_CLEANUP_KEY);
      cleanup.onsuccess = () => {
      const retired = retiredYoutubeKeys(normalizeYoutubeCleanup(cleanup.result));
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
            if (!video.isSample && !(video.remote && retired.has(cleanupKey(video)))) store.put(video);
          }
        } catch (error) {
          tx.abort();
          reject(error);
        }
      };
      };
    });
  } finally { db.close(); }
}

/** Append/upsert catalog rows without rewriting the whole folder (batched ingest). */
export function appendCatalogVideos(...args:Parameters<typeof appendCatalogVideosOwned>){if(!args[0].length)return Promise.resolve();return catalogWriter.run(()=>appendCatalogVideosOwned(...args));}
async function appendCatalogVideosOwned(videos: LibraryVideo[], metadata?:Pick<Prefs,"tags"|"metadataProvenance">): Promise<void> {
  if (!videos.length) return;
  const db = await openDb();
  try { await putVideosChunked(db, videos, metadata); }
  finally { db.close(); }
}

export function clearFolderVideos(...args:Parameters<typeof clearFolderVideosOwned>){return catalogWriter.run(()=>clearFolderVideosOwned(...args));}
async function clearFolderVideosOwned(folderId: string): Promise<void> {
  await recoverCatalogMutations();
  const db = await openDb();
  await clearFolderVideosTx(db, folderId);
  db.close();
}

export async function loadCatalogVideos(): Promise<LibraryVideo[]> {
  const db = await openDb();
  try {
    const rows: LibraryVideo[] = [];
    const journal = await new Promise<YoutubeCleanupJournal>((resolve, reject) => {
      const req = db.transaction('remote-cache', 'readonly').objectStore('remote-cache').get(YOUTUBE_CLEANUP_KEY);
      req.onsuccess = () => resolve(normalizeYoutubeCleanup(req.result)); req.onerror = () => reject(req.error);
    });
    const retired = retiredYoutubeKeys(journal);
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
      for (const video of page.rows) if (!video.isSample && !(video.remote && retired.has(cleanupKey(video)))) rows.push(catalogCard(video));
      if (page.keys.length < 512) break;
      after = page.keys.at(-1);
      await yieldCatalogTask();
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
  const db = await openDb().catch(error => { cacheMetrics.record('thumbnail-disk', 'error'); throw error; });
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(THUMB_STORE, 'readonly').objectStore(THUMB_STORE).get(id);
      request.onsuccess = () => {
        const row = request.result as StoredThumb | undefined;
        cacheMetrics.record('thumbnail-disk', row?.thumb ? 'hit' : 'miss', Date.now(), row?.thumb ? { bytes: artworkBytes(row.thumb), at: row.at } : undefined);
        resolve(row);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) { cacheMetrics.record('thumbnail-disk', 'error'); throw error;
  } finally { db.close(); }
}
export async function loadThumbCache(limit = 120, maxBytes = 8 * 1024 * 1024): Promise<StoredThumb[]> {
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
        if (size <= maxBytes - bytes) { rows.push(row); bytes += size; }
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

const YOUTUBE_CLEANUP_KEY = 'youtube-cleanup';
export type RemoteSnapshot = { videos: LibraryVideo[]; folders: Folder[]; checkedAt: number; youtubeCleanup?: YoutubeCleanupJournal; metadata?: Pick<Prefs,"tags"|"metadataProvenance"> };
export async function loadRemoteSnapshot(): Promise<RemoteSnapshot | undefined> {
  const db = await openDb();
  try {
    const legacy = await new Promise<{ current?: RemoteSnapshot; meta?: Pick<RemoteSnapshot, "folders" | "checkedAt">; youtubeCleanup: YoutubeCleanupJournal }>((resolve, reject) => {
      const tx = db.transaction("remote-cache", "readonly");
      const store = tx.objectStore("remote-cache");
      const currentReq = store.get("snapshot");
      const metaReq = store.get("meta");
      const cleanupReq = store.get(YOUTUBE_CLEANUP_KEY);
      tx.oncomplete = () => resolve({ current: currentReq.result as RemoteSnapshot | undefined, meta: metaReq.result as Pick<RemoteSnapshot, "folders" | "checkedAt"> | undefined, youtubeCleanup: normalizeYoutubeCleanup(cleanupReq.result) });
      tx.onerror = () => reject(tx.error);
    });
    const videos = new Map<string, LibraryVideo>();
    const retired = retiredYoutubeKeys(legacy.youtubeCleanup);
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
      for (const video of page.rows) if (video?.id && !(video.remote && retired.has(cleanupKey(video)))) videos.set(video.id, catalogCard(video));
      if (page.keys.length < 512) break;
      afterKey = page.keys[page.keys.length - 1];
      await yieldCatalogTask();
    }
    // Migrate the old giant snapshot once so on-demand detail reads can use
    // individual records too. Never mark a legacy detail as disk-addressable
    // before its normalized record has actually been saved.
    if (legacy.current?.videos.length) {
      const missing: LibraryVideo[] = [];
      await forEachCatalogSlice(legacy.current.videos, video => { if (!videos.has(video.id) && !(video.remote && retired.has(cleanupKey(video)))) missing.push(video); }, yieldCatalogTask);
      let migrated = false;
      try { await saveRemoteSnapshot({ ...legacy.current, videos: missing }, true); migrated = true; } catch { /* Retain full legacy details in this session. */ }
      await forEachCatalogSlice(missing, video => { videos.set(video.id, migrated ? catalogCard(video) : video); }, yieldCatalogTask);
    }
    const meta = legacy.meta ?? legacy.current ?? (legacy.youtubeCleanup.removedCount || legacy.youtubeCleanup.recentKeys.length ? { folders: [], checkedAt: 0 } : undefined);
    return meta ? { videos: await collectCatalogRows(videos.values()), folders: meta.folders, checkedAt: meta.checkedAt, youtubeCleanup: legacy.youtubeCleanup } : undefined;
  } finally { db.close(); }
}
export function saveRemoteSnapshot(...args:Parameters<typeof saveRemoteSnapshotOwned>){return catalogWriter.run(()=>saveRemoteSnapshotOwned(...args));}
async function saveRemoteSnapshotOwned(snapshot: RemoteSnapshot, complete = false, rowsOnly = false): Promise<void> {
  for(let offset=0;offset<snapshot.videos.length;offset+=64){
    const rows=snapshot.videos.slice(offset,offset+64);
    const enrichment=snapshot.metadata?rows.flatMap(video=>{const provenance=snapshot.metadata!.metadataProvenance?.[video.id];return provenance?[{id:video.id,tags:snapshot.metadata!.tags[video.id]??[],provenance}]:[];}):undefined;
    await catalogMutations.write({version:1,kind:"remote",rows,enrichment});
    await yieldCatalogTask();
  }
  if(rowsOnly)return;
  // Remote catalog metadata advances only after its accepted row chunks commit.
  await catalogMutations.write({version:1,kind:"remote",rows:[],meta:{folders:snapshot.folders,checkedAt:snapshot.checkedAt},complete});
}

/** One bounded transaction retires cards and automatic metadata together.
 * Watch history, favorites, likes, ratings and follow cursors are untouched. */
export async function saveYoutubeCleanup(removed: readonly LibraryVideo[], journal: YoutubeCleanupJournal): Promise<void> {
  await catalogMutations.write({version:1,kind:"cleanup",removed:removed.map(video=>video.id),cleanup:journal});
}

export function removeRemoteSnapshotVideos(...args:Parameters<typeof removeRemoteSnapshotVideosOwned>){if(!args[0].length)return Promise.resolve();return catalogWriter.run(()=>removeRemoteSnapshotVideosOwned(...args));}
async function removeRemoteSnapshotVideosOwned(ids: string[]): Promise<void> {
  await recoverCatalogMutations();
  if (!ids.length) return;
  const db = await openDb();
  try {
    for (let i = 0; i < ids.length; i += IDB_WRITE_CHUNK) {
      await new Promise<void>((resolve, reject) => {
        const tx = catalogTransaction(db,"remote-cache", "readwrite");
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
      req.onsuccess = () => resolve(req.result ? decodeActivityRecords(req.result as StoredActivity<ActivitySnapshot>) : undefined);
      req.onerror = () => reject(req.error);
    });
  } finally { db.close(); }
}
export async function saveActivitySnapshot(snapshot: ActivitySnapshot): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ACTIVITY_STORE, "readwrite");
      tx.objectStore(ACTIVITY_STORE).put(encodeActivityRecords(snapshot), "primary");
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
  raw = decodeActivityRecords(raw as StoredActivity<Prefs>) as unknown as Record<string, unknown>;
  const starred = (raw.starred as string[] | undefined) ?? [];
  const favorites = (raw.favorites as string[] | undefined) ?? starred;
  // New libraries should surface fresh media rather than beginning with an
  // alphabetical wall. Existing explicit preferences remain untouched.
  const sort = (raw.sort as SortKey | undefined) ?? "added";
  const sparse = raw.sparseMetadataRecords as StoredPrefs['sparseMetadataRecords'];
  return {
    favorites,
    likes: (raw.likes as string[] | undefined) ?? [],
    tags: decodeSparseRecord<string[]>(sparse?.tags ?? raw.tags),
    metadataProvenance: decodeSparseRecord<VideoMetadataProvenance>(sparse?.metadataProvenance ?? raw.metadataProvenance),
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
    unavailableVideoIds: Array.isArray(raw.unavailableVideoIds) ? raw.unavailableVideoIds.filter((id): id is string => typeof id === 'string') : [],
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
  const encodedTags = encodeSparseRecord(prefs.tags), encodedProvenance = prefs.metadataProvenance && encodeSparseRecord(prefs.metadataProvenance), encodedCategories=encodeSparseRecord(prefs.categories);
  const tags = encodedTags !== prefs.tags ? encodedTags as EncodedSparseRecord<string[]> : undefined;
  const metadataProvenance = encodedProvenance !== prefs.metadataProvenance ? encodedProvenance as EncodedSparseRecord<VideoMetadataProvenance> : undefined;
  const categories=encodedCategories!==prefs.categories?encodedCategories as EncodedSparseRecord<string>:undefined;
  // Keep legacy fields as plain dictionaries. Old readers retain the baseline;
  // new readers use this sidecar. Structured clone shares each baseline once.
  const pending = putActivityBlob("preferences", encodeActivityRecords({ ...prefs, tags: tags?.snapshot.base ?? prefs.tags,
    metadataProvenance: metadataProvenance?.snapshot.base ?? prefs.metadataProvenance, categories:categories?.snapshot.base??prefs.categories,
    sparseMetadataRecords: tags || metadataProvenance || categories ? { tags, metadataProvenance, categories } : undefined }));
  if (prefsWrites !== pending) {
    prefsWrites = pending;
    void pending.catch(() => {
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(durablePrefs)); }
      catch { window.dispatchEvent(new CustomEvent("reelcase:save-error")); }
    });
  }
}

/** Read artwork in small pages, retaining only actual stored image byte counts.
 * A remote URL in this store is a reference, not proof of offline availability. */
export async function readOfflineAuditStorage(signal: AbortSignal): Promise<import('./offline-cache-audit').OfflineStorage> {
  signal.throwIfAborted();
  const db = await openDb();
  const artwork = new Map<string, { at: number; bytes: number }>();
  try {
    let after: IDBValidKey | undefined;
    while (true) {
      signal.throwIfAborted();
      const rows = await new Promise<StoredThumb[]>((resolve, reject) => {
        const tx = db.transaction(THUMB_STORE, 'readonly');
        const request = tx.objectStore(THUMB_STORE).getAll(after === undefined ? undefined : IDBKeyRange.lowerBound(after, true), 32);
        tx.oncomplete = () => resolve(request.result); tx.onerror = tx.onabort = () => reject(tx.error ?? new Error('Artwork audit could not read storage.'));
      });
      for (const row of rows) if (row.thumb instanceof Blob || typeof row.thumb === 'string' && row.thumb.startsWith('data:image/')) artwork.set(row.id, { at: row.at, bytes: artworkBytes(row.thumb) });
      if (rows.length < 32) break;
      after = rows[rows.length - 1].id;
      await yieldCatalogTask();
    }
    signal.throwIfAborted();
    const saved = await new Promise<{ meta?: { checkedAt?: number }; links?: DurableLinks }>((resolve, reject) => {
      const tx = db.transaction(['remote-cache', ACTIVITY_STORE], 'readonly');
      const meta = tx.objectStore('remote-cache').get('meta'), links = tx.objectStore(ACTIVITY_STORE).get(DURABLE_LINKS_IDB_KEY);
      tx.oncomplete = () => resolve({ meta: meta.result, links: links.result }); tx.onerror = tx.onabort = () => reject(tx.error ?? new Error('Recovery audit could not read storage.'));
    });
    signal.throwIfAborted();
    // The disk ledger is authoritative; the bounded local mirror recovers an
    // interrupted write. De-duplication happens cooperatively in the audit.
    const mirror = readJsonLocal<DurableLinks>(DURABLE_LINKS_LS_KEY);
    const links: SavedVideoLink[] = [];
    for (const source of [saved.links?.links, mirror?.links]) if (Array.isArray(source)) await forEachCatalogSlice(source, row => {
      if (row && typeof row.url === 'string' && typeof row.id === 'string') links.push(row);
    }, async () => { signal.throwIfAborted(); await yieldCatalogTask(); });
    return { artwork, links, savedAt: saved.meta?.checkedAt };
  } finally { db.close(); }
}

/** Disposable, bounded recommendation impressions use the existing activity store. */
const EXPOSURE_LS_KEY='reelcase.recommendation-exposure.v1';
export function loadRecommendationExposureSync():unknown{return readJsonLocal(EXPOSURE_LS_KEY);}
export async function restoreRecommendationExposure():Promise<ExposureLedger>{
 let durable:unknown;try{durable=await getActivityBlob('recommendation-exposure');}catch{/* The local mirror remains usable. */}
 return newestExposure(durable,loadRecommendationExposureSync());
}
export function saveRecommendationExposure(ledger:ExposureLedger):Promise<boolean>{
 const local=writeJsonLocal(EXPOSURE_LS_KEY,ledger);
 return putActivityBlob('recommendation-exposure',ledger).then(()=>true,()=>local);
}

const TOPIC_ALIASES_LS_KEY='reelcase.topic-aliases.v1';
export function loadTopicAliasesSync():unknown{return readJsonLocal(TOPIC_ALIASES_LS_KEY);}
export async function restoreTopicAliases():Promise<TopicAliasLedger>{let durable:unknown;try{durable=await getActivityBlob('topic-aliases');}catch{/* Keep the local mirror. */}return newestTopicAliases(durable,loadTopicAliasesSync());}
export function saveTopicAliases(ledger:TopicAliasLedger):Promise<boolean>{const local=writeJsonLocal(TOPIC_ALIASES_LS_KEY,ledger);return putActivityBlob('topic-aliases',ledger).then(()=>true,()=>local);}

const BRIDGES_LS_KEY='reelcase.topic-bridges.v1';
export function loadTopicBridgesSync():unknown{return readJsonLocal(BRIDGES_LS_KEY);}
export async function restoreTopicBridges():Promise<BridgeLedger>{let saved:unknown;try{saved=await getActivityBlob('topic-bridges');}catch{/* The local mirror remains available. */}return newestBridges(saved,loadTopicBridgesSync());}
export function saveTopicBridges(ledger:BridgeLedger):Promise<boolean>{const local=writeJsonLocal(BRIDGES_LS_KEY,ledger);return putActivityBlob('topic-bridges',ledger).then(()=>true,()=>local);}

const GUIDE_PRESET_LS_KEY='reelcase.guide-preset.v1';
export function loadGuidePresetSync():unknown{return readJsonLocal(GUIDE_PRESET_LS_KEY);}
export async function restoreGuidePreset():Promise<GuidePreset>{let saved:unknown;try{saved=await getActivityBlob('guide-preset');}catch{/* Keep the local mirror. */}return newestGuidePreset(saved,loadGuidePresetSync());}
export function saveGuidePreset(ledger:GuidePreset):Promise<boolean>{const local=writeJsonLocal(GUIDE_PRESET_LS_KEY,ledger);return putActivityBlob('guide-preset',ledger).then(()=>true,()=>local);}

const FILMS_LS_KEY='reelcase.film-reviews.v1';
export function loadFilmReviewsSync():unknown{return readJsonLocal(FILMS_LS_KEY);}
export async function restoreFilmReviews():Promise<FilmLedger>{let saved:unknown;try{saved=await getActivityBlob('film-reviews');}catch{/* Keep the local mirror. */}return newestFilms(saved,loadFilmReviewsSync());}
export function saveFilmReviews(ledger:FilmLedger):Promise<boolean>{const local=writeJsonLocal(FILMS_LS_KEY,ledger);return putActivityBlob('film-reviews',ledger).then(()=>true,()=>local);}

const ANIME_REVIEWS_LS_KEY='reelcase.anime-reviews.v1';
export function loadAnimeReviewsSync():unknown{return readJsonLocal(ANIME_REVIEWS_LS_KEY);}
export async function restoreAnimeReviews():Promise<AnimeReviewLedger>{let saved:unknown;try{saved=await getActivityBlob('anime-reviews');}catch{/* Keep the local mirror. */}return newestAnimeReviews(saved,loadAnimeReviewsSync());}
export function saveAnimeReviews(ledger:AnimeReviewLedger):Promise<boolean>{const local=writeJsonLocal(ANIME_REVIEWS_LS_KEY,ledger);return putActivityBlob('anime-reviews',ledger).then(()=>true,()=>local);}

const PROVIDER_VIEWING_LS_KEY='reelcase.provider-viewing.v1';
export function loadProviderViewingSync():unknown{return readJsonLocal(PROVIDER_VIEWING_LS_KEY);}
export async function restoreProviderViewing():Promise<ProviderViewing>{let saved:unknown;try{saved=await getActivityBlob('provider-viewing');}catch{/* Keep the local mirror. */}return newestProviderViewing(saved,loadProviderViewingSync());}
export function saveProviderViewing(ledger:ProviderViewing):Promise<boolean>{const local=writeJsonLocal(PROVIDER_VIEWING_LS_KEY,ledger);return putActivityBlob('provider-viewing',ledger).then(()=>true,()=>local);}
