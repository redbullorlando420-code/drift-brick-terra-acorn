import {profileLocalStorage as localStorage} from "./local-profile-storage.ts";
import {createLocalId} from './local-id.ts';
import {appendFeedbackOperation,parseFeedbackTimeline,manualTimelineClock,mergeFeedbackWatch,manualFeedbackFingerprint,undoFeedbackOperation,type ManualKind,type FeedbackTimeline,type FeedbackOperation} from './videos/feedback-timeline.ts';
import {commitFeedbackUndo,waitForDurableWrites} from './videos/persist';
import { getTopicAliasRevision } from './videos/topic-aliases';
import { canonicalTopic } from './videos/topics';
import { recordRatingForStreak } from "./rating-streaks";
import { restoreDurableFeedback, saveDurableFeedback } from "./videos/persist";
import { copyCatalogRecord, yieldCatalogTask } from './catalog-work';
import { scheduleBackgroundWork } from './interaction-budget';
import { createKeyedSignal } from './keyed-signal';

import { changeRejection, newestRejections, normalizeRejections, isRejectionLedger, EMPTY_REJECTIONS, type RecommendationRejection, type RejectionLedger } from './videos/recommendation-rejections';

export type RatingLedgerEntry = { rating: number; updatedAt: number };
export type WatchTime = { preview: number; fullscreen: number; previewEstimated?: number; fullscreenEstimated?: number };
const EMPTY_WATCH_TIME: WatchTime = { preview: 0, fullscreen: 0 };
export type Feedback = { manualTimeline?: FeedbackTimeline; recommendationRejections?: RejectionLedger; ratings: Record<string, number>; ratingHistory: Record<string, RatingLedgerEntry>; notes: Record<string, string>; creatorRatings: Record<string, number>; creatorLikes: Record<string, true>; creatorFavorites?: Record<string, true>; tagLikes: Record<string, true>; tagHeartHistory: Record<string, number>; watchTime: Record<string, WatchTime> };
/** Explicit dislike, neutral, then progressively stronger positive signals. */
export { ratingPreference } from './videos/ranking-core';
export function watchTimeScore(time: WatchTime): number { return Math.min(12, Math.floor(time.preview / 30) + Math.floor(time.fullscreen / 90) * 2 + Math.floor((time.previewEstimated ?? 0) / 90) + Math.floor((time.fullscreenEstimated ?? 0) / 180)); }
const KEY = "reelcase.media-feedback.v1";
let cached: Feedback | null = null;
let signalVersion = 0;
/** Includes ratings, hearts, durable imports and elapsed watch-time changes. */
export function getFeedbackRevision() { read(); return signalVersion; }
type RankingSnapshot = { recommendationRejections: RejectionLedger; ratings: Record<string, number>; heartedTags: string[]; historicTags: string[];
  creatorLikes: Record<string, true>; creatorFavorites: Record<string, true>; creatorRatings: Record<string, number>; watchScores: Record<string, number> };
let snapshot: { version: number; pending: Promise<RankingSnapshot> } | undefined;
let changeTimer: number | undefined;
let persistTimer: number | undefined;
let cancelPersist: (() => void) | undefined;
let lastRatingQueueMs = 0;
let lastPersistMs = 0;
let pendingWrites = 0;
let feedbackSaveState: "saved" | "pending" | "failed" = "saved";
let saveAttempt = 0;
function savedState(state: typeof feedbackSaveState) { if (feedbackSaveState === state) return; feedbackSaveState = state; if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:feedback-save")); }
export function getFeedbackSaveState() { return feedbackSaveState; }
export function flushFeedbackForRestore(){flush();}
export function retryFeedbackSave() { pendingWrites = 1; flush(); }
const ratingSignal = createKeyedSignal();
export const subscribeRating = ratingSignal.subscribe;
// Missing ratings are common in large libraries. Remember the legacy lookup
// too, so recommendation passes never repeat synchronous storage reads.
const legacyRatings = new Map<string, number>();
let legacyRatingKeys: Set<string> | null = null;
let legacyScan: Promise<void> | undefined;

function legacyKeys() {
  if (legacyRatingKeys) return legacyRatingKeys;
  const keys = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith("reelcase.rating.")) keys.add(key.slice("reelcase.rating.".length));
      }
    } catch { /* Current feedback remains available without legacy storage. */ }
  }
  legacyRatingKeys = keys;
  return keys;
}

/** Read old per-title ratings once, in small batches, rather than doing a
 * synchronous storage lookup for every unscored title during recommendation. */
export async function warmLegacyRatings(): Promise<void> {
  if (typeof window !== "undefined") {
    legacyScan ??= (async () => {
      try {
        for (let index = 0; index < localStorage.length; index++) {
          const key = localStorage.key(index);
          if (key?.startsWith("reelcase.rating.")) {
            const id = key.slice("reelcase.rating.".length);
            legacyRatingKeys?.add(id);
            if (!legacyRatings.has(id)) {
              const value = Number(localStorage.getItem(key));
              legacyRatings.set(id, Number.isFinite(value) ? value : 0);
            }
          }
          if (index % 100 === 99) await new Promise(resolve => window.setTimeout(resolve, 0));
        }
      } catch { /* Current feedback still works when legacy storage is unavailable. */ }
    })();
    await legacyScan;
  }
}

export async function rankingFeedbackSnapshot(): Promise<RankingSnapshot> {
  await warmLegacyRatings();
  if (snapshot?.version === signalVersion) {
    const current = snapshot, result = await current.pending;
    return current.version === signalVersion ? result : rankingFeedbackSnapshot();
  }
  const version = signalVersion, feedback = read();
  const pending = (async (): Promise<RankingSnapshot> => {
    const ratings = await copyCatalogRecord(feedback.ratings, yieldCatalogTask);
    let count = 0;
    for (const [id, rating] of legacyRatings) {
      if (!(id in ratings)) ratings[id] = rating;
      if (++count % 512 === 0) await yieldCatalogTask();
    }
    const watchScores: Record<string, number> = Object.create(null);
    count = 0;
    for (const id in feedback.watchTime) {
      watchScores[id] = watchTimeScore(feedback.watchTime[id]);
      if (++count % 512 === 0) await yieldCatalogTask();
    }
    return { recommendationRejections: normalizeRejections(feedback.recommendationRejections), ratings, heartedTags: Object.keys(feedback.tagLikes), historicTags: Object.keys(feedback.tagHeartHistory),
      creatorLikes: await copyCatalogRecord(feedback.creatorLikes, yieldCatalogTask), creatorFavorites: await copyCatalogRecord(feedback.creatorFavorites ?? {}, yieldCatalogTask),
      creatorRatings: await copyCatalogRecord(feedback.creatorRatings, yieldCatalogTask), watchScores };
  })();
  snapshot = { version, pending };
  const result = await pending;
  // Feedback can change while batches yield. Never send mixed old/new taste to a worker.
  return version === signalVersion ? result : rankingFeedbackSnapshot();
}

let feedbackHydrated = false;
let cleanupFeedback: Promise<void> | undefined;
/** Cache cleanup verifies the backup even if startup's best-effort restore
 * is still pending or could not read storage. Failed reads can be retried. */
export async function verifyCleanupFeedback() {
  if (typeof window === 'undefined') return;
  cleanupFeedback ??= (async () => {
    const durable = await restoreDurableFeedback(true);
    if (!durable) return;
    const current = read();
    cached = { ...current, recommendationRejections: newestRejections(durable.recommendationRejections, current.recommendationRejections), ratings: { ...durable.ratings, ...current.ratings }, notes: { ...durable.notes, ...current.notes } };
    signalVersion++; snapshot = undefined; ratingSignal.emitAll(); notifyChange();
  })();
  const pending = cleanupFeedback;
  try { await pending; }
  catch (error) { if (cleanupFeedback === pending) cleanupFeedback = undefined; throw error; }
}
function read(): Feedback {
  if (cached) return cached;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Feedback>;
    cached = { manualTimeline:saved.manualTimeline, recommendationRejections: normalizeRejections(saved.recommendationRejections), ratings: saved.ratings ?? {}, ratingHistory: saved.ratingHistory ?? {}, notes: saved.notes ?? {}, creatorRatings: saved.creatorRatings ?? {}, creatorLikes: saved.creatorLikes ?? {}, creatorFavorites: saved.creatorFavorites ?? { ...saved.creatorLikes }, tagLikes: saved.tagLikes ?? {}, tagHeartHistory: saved.tagHeartHistory ?? {}, watchTime: saved.watchTime ?? {} };
  } catch { cached = { recommendationRejections: EMPTY_REJECTIONS, ratings: {}, ratingHistory: {}, notes: {}, creatorRatings: {}, creatorLikes: {}, creatorFavorites: {}, tagLikes: {}, tagHeartHistory: {}, watchTime: {} }; }
  return cached;
}
/** Merge IndexedDB feedback backup once so QuotaExceeded on localStorage cannot erase ratings/hearts. */
export async function hydrateDurableFeedback() {
  if (typeof window === "undefined" || feedbackHydrated) return;
  feedbackHydrated = true;
  const durable = await restoreDurableFeedback().catch(() => null);
  if (!durable) return;
  const current = read();
  const manual=manualTimelineClock(durable.manualTimeline)>manualTimelineClock(current.manualTimeline)?durable:current,other=manual===durable?current:durable;
  cached = {
    manualTimeline: manual.manualTimeline,
    recommendationRejections: newestRejections(durable.recommendationRejections, manual.recommendationRejections),
    ratings: { ...other.ratings, ...manual.ratings },
    ratingHistory: manualTimelineClock(manual.manualTimeline)>0 ? (manual.ratingHistory??{}) : { ...other.ratingHistory, ...manual.ratingHistory },
    notes: { ...durable.notes, ...current.notes },
    creatorRatings: manualTimelineClock(manual.manualTimeline)>0 ? (manual.creatorRatings??{}) : { ...other.creatorRatings, ...manual.creatorRatings },
    creatorLikes: manualTimelineClock(manual.manualTimeline)>0 ? (manual.creatorLikes??{}) : { ...other.creatorLikes, ...manual.creatorLikes },
    creatorFavorites: manualTimelineClock(manual.manualTimeline)>0 ? (manual.creatorFavorites??{}) : { ...other.creatorFavorites, ...manual.creatorFavorites },
    tagLikes: manualTimelineClock(manual.manualTimeline)>0 ? (manual.tagLikes??{}) : { ...other.tagLikes, ...manual.tagLikes },
    tagHeartHistory: { ...durable.tagHeartHistory, ...current.tagHeartHistory },
    watchTime: { ...durable.watchTime, ...current.watchTime },
  };
  signalVersion++; snapshot = undefined; ratingSignal.emitAll(); notifyChange();
}
function persist() {
  persistTimer = undefined;
  cancelPersist = undefined;
  if (!pendingWrites || !cached) return;
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();
  // saveDurableFeedback owns both mirrors. Serializing here too used to write
  // the same feedback archive twice for every rating and watch-time flush.
  const attempt = ++saveAttempt;
  try {
    Promise.resolve(saveDurableFeedback(cached)).then(ok => { if (attempt === saveAttempt) savedState(ok === false ? "failed" : "saved"); }, () => { if (attempt === saveAttempt) savedState("failed"); });
  }
  catch { savedState("failed"); }
  finally {
    lastPersistMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
    pendingWrites = 0;
  }
}

/** Finish a queued rating write before a reload, tab close, or mobile app switch. */
function flush() {
  if (persistTimer !== undefined) window.clearTimeout(persistTimer);
  persistTimer = undefined;
  cancelPersist?.(); cancelPersist = undefined;
  persist();
}

function queuePersist(delay: number) {
  persistTimer = window.setTimeout(() => {
    persistTimer = undefined;
    cancelPersist = scheduleBackgroundWork(persist, { timeoutMs: 1000 });
  }, delay);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flush);
  const onHidden = () => {
    if (document.visibilityState === "hidden") flush();
  };
  document.addEventListener("visibilitychange", onHidden);
  import.meta.hot?.dispose(() => {
    flush();
    if (changeTimer !== undefined) window.clearTimeout(changeTimer);
    window.removeEventListener('pagehide', flush);
    document.removeEventListener('visibilitychange', onHidden);
  });
}
// Ratings are used on dense rails. Coalesce the JSON write so a star press
// paints immediately instead of serializing the entire feedback archive on the
// input frame. The in-memory version remains authoritative for this session.
function write(next: Feedback) {
  cached = next; signalVersion++; snapshot = undefined;
  if (typeof window === "undefined") return;
  saveAttempt++; pendingWrites = 1; savedState("pending");
  if (persistTimer) window.clearTimeout(persistTimer);
  cancelPersist?.(); cancelPersist = undefined;
  queuePersist(90);
}
function writeWatchTime(next: Feedback) {
  cached = next; signalVersion++; snapshot = undefined;
  if (typeof window === "undefined") return;
  saveAttempt++; pendingWrites = 1; savedState("pending");
  // Playback updates arrive every few seconds. Keep one bounded save timer
  // instead of serializing the whole feedback archive on each video tick.
  if (persistTimer === undefined && !cancelPersist) queuePersist(15_000);
}
function notifyChange() {
  if (typeof window === "undefined" || changeTimer) return;
  changeTimer = window.setTimeout(() => {
    changeTimer = undefined;
    window.dispatchEvent(new Event("reelcase:rating-change"));
  }, 48);
}
export function getRating(id: string): number {
  const value = read().ratings[id];
  if (Number.isFinite(value)) return value;
  if (typeof window === "undefined") return 0;
  const known = legacyRatings.get(id);
  if (known !== undefined) return known;
  if (!legacyKeys().has(id)) return 0;
  let legacy = 0;
  try { legacy = Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0); } catch { /* session only */ }
  const rating = Number.isFinite(legacy) ? legacy : 0;
  legacyRatings.set(id, rating);
  return rating;
}
export function setRating(id: string, rating: number) {
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();
  const next = read(), before=getRating(id);
  next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
  // Keep a durable timestamped ledger in the system feedback payload. This
  // survives remote catalog refreshes, so YouTube, Twitch, and Adult ratings
  // remain attributable even when a provider card is later replaced.
  next.ratingHistory[id] = { rating: next.ratings[id], updatedAt: Date.now() };
  recordManual(next,'rating',id,before,next.ratings[id],id);
  legacyRatings.set(id, next.ratings[id]);
  legacyKeys().add(id);
  recordRatingForStreak(id, next.ratings[id]);
  write(next);
  ratingSignal.emit(id);
  notifyChange();
  lastRatingQueueMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
}
export function getRatingLedger(): Record<string, RatingLedgerEntry> { return { ...read().ratingHistory }; }
export function getWatchTime(id: string): WatchTime { return read().watchTime[id] ?? EMPTY_WATCH_TIME; }
export function getWatchTimeLedger(): Record<string, WatchTime> { return { ...read().watchTime }; }
/** Count real elapsed playback in small bounded increments, never seek distance. */
export function recordWatchTime(id: string, mode: keyof WatchTime, seconds: number) {
  if (!id || !Number.isFinite(seconds) || seconds <= 0) return;
  const next = read();
  const current = next.watchTime[id] ?? { preview: 0, fullscreen: 0 };
  next.watchTime[id] = { ...current, [mode]: Math.min(10_000_000, (current[mode] ?? 0) + Math.min(seconds, 5)) };
  writeWatchTime(next);
}
/** Local timing only. This never transmits library feedback or usage data. */
export function getFeedbackDiagnostics() { return { lastRatingQueueMs, lastPersistMs, pendingWrites }; }
function creatorKey(name: string) { return name.trim().toLowerCase(); }
export function getCreatorRating(name: string): number { return read().creatorRatings[creatorKey(name)] ?? 0; }
export function setCreatorRating(name:string,rating:number){const next=read(),key=creatorKey(name),before=next.creatorRatings[key]??0;next.creatorRatings[key]=Math.max(0,Math.min(5,Math.round(rating)));recordManual(next,'creatorRating',key,before,next.creatorRatings[key],name);write(next);notifyChange();}
export function creatorIsFavorited(name: string): boolean { return Boolean(read().creatorFavorites?.[creatorKey(name)]); }
export function toggleCreatorFavorite(name: string) {
  const key = creatorKey(name); if (!key) return;
  const next = read(), favorites = next.creatorFavorites ??= {};
  const before=Boolean(favorites[key]);if (favorites[key]) delete favorites[key]; else favorites[key] = true;recordManual(next,'creatorFavorite',key,before,!before,name);
  write(next); notifyChange();
}
export function creatorIsLiked(name: string): boolean { return Boolean(read().creatorLikes[creatorKey(name)]); }
export function toggleCreatorLike(name:string){const next=read(),key=creatorKey(name),before=Boolean(next.creatorLikes[key]);if(before)delete next.creatorLikes[key];else next.creatorLikes[key]=true;recordManual(next,'creatorLike',key,before,!before,name);write(next);notifyChange();}
function tagKey(tag: string) { return tag.trim().toLowerCase(); }
export function tagIsLiked(tag: string): boolean { return Boolean(read().tagLikes[tagKey(tag)]); }
export function tagHasHeartHistory(tag: string): boolean { return Boolean(read().tagHeartHistory[tagKey(tag)]); }
export function getHeartedTagHistory(): string[] { return Object.keys(read().tagHeartHistory).sort((a, b) => (read().tagHeartHistory[b] ?? 0) - (read().tagHeartHistory[a] ?? 0)); }
export function toggleTagLike(tag: string) {
  const next = read(); const key = tagKey(tag);
  const before=Boolean(next.tagLikes[key]),heartBefore=next.tagHeartHistory[key]??null;
  if (next.tagLikes[key]) delete next.tagLikes[key];
  else { next.tagLikes[key] = true; next.tagHeartHistory[key] ??= Date.now(); }
  recordManual(next,'tagLike',key,before,!before,tag,{heartBefore,heartAfter:next.tagHeartHistory[key]??null});write(next); notifyChange();
}
/** Versioned rating/note payload used by the full library backup. */
export function exportFeedback() { const {manualTimeline,...feedback}=read();return {version:5,...feedback}; }
export function getNote(id: string): string { const value = read().notes[id]; if (typeof value === "string") return value; try { return localStorage.getItem(`reelcase.note.${id}`) ?? ""; } catch { return ""; } }
export function setNote(id: string, note: string) { const next = read(); if (note.trim()) next.notes[id] = note.trim(); else delete next.notes[id]; write(next); }

/** Merge an imported feedback payload without wiping unrelated keys. */
export function importFeedback(partial: Partial<Feedback> & { version?: number }) {
  const next = read();
  next.manualTimeline={version:1,entries:[],updatedAt:Date.now()};
  if (partial.recommendationRejections) {
    const imported = normalizeRejections(partial.recommendationRejections);
    if (isRejectionLedger(partial.recommendationRejections)) next.recommendationRejections = { ...imported, updatedAt: Math.max(Date.now(), (next.recommendationRejections?.updatedAt ?? 0) + 1) };
  }
  if (partial.ratings) Object.assign(next.ratings, partial.ratings);
  if (partial.ratingHistory) Object.assign(next.ratingHistory, partial.ratingHistory);
  if (partial.notes) Object.assign(next.notes, partial.notes);
  if (partial.creatorRatings) Object.assign(next.creatorRatings, partial.creatorRatings);
  if (partial.creatorLikes) Object.assign(next.creatorLikes, partial.creatorLikes);
  if (partial.creatorFavorites) Object.assign(next.creatorFavorites ??= {}, partial.creatorFavorites);
  if (partial.tagLikes) Object.assign(next.tagLikes, partial.tagLikes);
  if (partial.tagHeartHistory) Object.assign(next.tagHeartHistory, partial.tagHeartHistory);
  if (partial.watchTime) Object.assign(next.watchTime, partial.watchTime);
  write(next);
  notifyChange();
  flush();
}

/** Reuses the feedback mirror and coalesced durable save; never enters shared room state. */
export function getRecommendationRejections(): RejectionLedger { return read().recommendationRejections ?? EMPTY_REJECTIONS; }
export function setRecommendationRejection(entry: RecommendationRejection, remove = false) {
  const current = getRecommendationRejections(), changed = changeRejection(current, entry, remove);
  if (changed === current) return;
  const next={...read(),recommendationRejections:changed},target=entry.scope+':'+entry.target,before=current.entries.find(e=>e.scope+':'+e.target===target)??null;recordManual(next,'rejection',target,before,remove?null:changed.entries.find(e=>e.scope+':'+e.target===target)??null,entry.label);write(next);
  notifyChange();
}

let topicHeartRevision = -1, topicHeartAliasRevision = -1;
let topicHearts = new Set<string>();
export function recommendationTopicIsLiked(topic: string): boolean {
  read();
  if (topicHeartRevision !== signalVersion || topicHeartAliasRevision !== getTopicAliasRevision()) {
    topicHearts = new Set(Object.keys(read().tagLikes).map(canonicalTopic).filter((value): value is string => Boolean(value)));
    topicHeartRevision = signalVersion; topicHeartAliasRevision = getTopicAliasRevision();
  }
  return topicHearts.has(topic);
}

function recordManual(next:Feedback,kind:ManualKind,target:string,before:FeedbackOperation['before'],after:FeedbackOperation['after'],label:string,aux:Pick<FeedbackOperation,'heartBefore'|'heartAfter'>={}){
 if(!target||target.length>520)return;
 try{next.manualTimeline=appendFeedbackOperation(next,{id:createLocalId('feedback-'),kind,target,label:label.slice(0,160),before,after,at:Date.now(),...aux});}catch{/* Unsupported history is preserved; current feedback still works. */}
}
export function getFeedbackTimeline(){return parseFeedbackTimeline(read().manualTimeline);}
export function creatorHasExplicitFeedback(name:string){const key=creatorKey(name),f=read();return !!(f.creatorRatings[key]||f.creatorLikes[key]||f.creatorFavorites?.[key]);}
let undoRunning=false;
export async function undoManualFeedback(id:string){
 if(undoRunning)throw Error('Another feedback undo is still saving.');undoRunning=true;
 try{await hydrateDurableFeedback();flush();await waitForDurableWrites();
 const expected=read(),fingerprint=manualFeedbackFingerprint(expected),next=undoFeedbackOperation(expected,id);
 const current=()=>manualFeedbackFingerprint(read())===fingerprint;
 const committed=await commitFeedbackUndo(expected,next,current);
 cached={...read(),watchTime:mergeFeedbackWatch(committed.watchTime,read().watchTime),ratings:next.ratings,ratingHistory:next.ratingHistory,creatorRatings:next.creatorRatings,creatorLikes:next.creatorLikes,creatorFavorites:next.creatorFavorites,tagLikes:next.tagLikes,tagHeartHistory:next.tagHeartHistory,recommendationRejections:next.recommendationRejections,manualTimeline:next.manualTimeline};
 for(const [key,value]of Object.entries(next.ratings))if(legacyRatings.has(key))legacyRatings.set(key,value);
 signalVersion++;snapshot=undefined;ratingSignal.emitAll();notifyChange();savedState('saved');
 }finally{undoRunning=false;}
}
