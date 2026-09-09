type Feedback = { ratings: Record<string, number>; notes: Record<string, string>; creatorRatings: Record<string, number>; creatorLikes: Record<string, true>; tagLikes: Record<string, true> };
const KEY = "reelcase.media-feedback.v1";
let cached: Feedback | null = null;
let changeTimer: number | undefined;
let persistTimer: number | undefined;

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
  try { if (cached) localStorage.setItem(KEY, JSON.stringify(cached)); } catch { /* legacy per-item values remain available */ }
}
// Ratings are used on dense rails. Coalesce the JSON write so a star press
// paints immediately instead of serializing the entire feedback archive on the
// input frame. The in-memory version remains authoritative for this session.
function write(next: Feedback) {
  cached = next;
  if (typeof window === "undefined") return;
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
export function getRating(id: string): number { const value = read().ratings[id]; if (Number.isFinite(value)) return value; try { return Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0); } catch { return 0; } }
export function setRating(id: string, rating: number) {
  const next = read();
  next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
  write(next);
  notifyChange();
}
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
