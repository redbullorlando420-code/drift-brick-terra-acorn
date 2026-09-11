import { recordRatingForStreak } from "./rating-streaks";

type Feedback = { ratings: Record<string, number>; notes: Record<string, string>; creatorRatings: Record<string, number>; creatorLikes: Record<string, true>; tagLikes: Record<string, true> };
const KEY = "reelcase.media-feedback.v1";
let cached: Feedback | null = null;
let changeTimer: number | undefined;
let persistTimer: number | undefined;
let lastRatingQueueMs = 0;
let lastPersistMs = 0;
let pendingWrites = 0;
// Missing ratings are common in large libraries. Remember the legacy lookup
// too, so recommendation passes never repeat synchronous storage reads.
const legacyRatings = new Map<string, number>();

function read(): Feedback {
  if (cached) return cached;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Feedback>;
    cached = { ratings: saved.ratings ?? {}, notes: saved.notes ?? {}, creatorRatings: saved.creatorRatings ?? {}, creatorLikes: saved.creatorLikes ?? {}, tagLikes: saved.tagLikes ?? {} };
  } catch { cached = { ratings: {}, notes: {}, creatorRatings: {}, creatorLikes: {}, tagLikes: {} }; }
  return cached;
}
function persist() {
  persistTimer = undefined;
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();
  try { if (cached) localStorage.setItem(KEY, JSON.stringify(cached)); } catch { /* legacy per-item values remain available */ }
  finally {
    lastPersistMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
    pendingWrites = 0;
  }
}

/** Finish a queued rating write before a reload, tab close, or mobile app switch. */
function flush() {
  if (persistTimer !== undefined) window.clearTimeout(persistTimer);
  persist();
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}
// Ratings are used on dense rails. Coalesce the JSON write so a star press
// paints immediately instead of serializing the entire feedback archive on the
// input frame. The in-memory version remains authoritative for this session.
function write(next: Feedback) {
  cached = next;
  if (typeof window === "undefined") return;
  pendingWrites = 1;
  if (persistTimer) window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(persist, 90);
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
  let legacy = 0;
  try { legacy = Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0); } catch { /* session only */ }
  const rating = Number.isFinite(legacy) ? legacy : 0;
  legacyRatings.set(id, rating);
  return rating;
}
export function setRating(id: string, rating: number) {
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();
  const next = read();
  next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
  legacyRatings.set(id, next.ratings[id]);
  recordRatingForStreak(id, next.ratings[id]);
  write(next);
  notifyChange();
  lastRatingQueueMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
}
/** Local timing only. This never transmits library feedback or usage data. */
export function getFeedbackDiagnostics() { return { lastRatingQueueMs, lastPersistMs, pendingWrites }; }
function creatorKey(name: string) { return name.trim().toLowerCase(); }
export function getCreatorRating(name: string): number { return read().creatorRatings[creatorKey(name)] ?? 0; }
export function setCreatorRating(name: string, rating: number) { const next = read(); next.creatorRatings[creatorKey(name)] = Math.max(0, Math.min(5, Math.round(rating))); write(next); notifyChange(); }
export function creatorIsLiked(name: string): boolean { return Boolean(read().creatorLikes[creatorKey(name)]); }
export function toggleCreatorLike(name: string) { const next = read(); const key = creatorKey(name); if (next.creatorLikes[key]) delete next.creatorLikes[key]; else next.creatorLikes[key] = true; write(next); notifyChange(); }
function tagKey(tag: string) { return tag.trim().toLowerCase(); }
export function tagIsLiked(tag: string): boolean { return Boolean(read().tagLikes[tagKey(tag)]); }
export function toggleTagLike(tag: string) { const next = read(); const key = tagKey(tag); if (next.tagLikes[key]) delete next.tagLikes[key]; else next.tagLikes[key] = true; write(next); notifyChange(); }
/** Versioned rating/note payload used by the full library backup. */
export function exportFeedback() { return { version: 3, ...read() }; }
export function getNote(id: string): string { const value = read().notes[id]; if (typeof value === "string") return value; try { return localStorage.getItem(`reelcase.note.${id}`) ?? ""; } catch { return ""; } }
export function setNote(id: string, note: string) { const next = read(); if (note.trim()) next.notes[id] = note.trim(); else delete next.notes[id]; write(next); }
