type Feedback = { ratings: Record<string, number>; notes: Record<string, string>; creatorRatings: Record<string, number>; creatorLikes: Record<string, true>; tagLikes: Record<string, true> };
const KEY = "reelcase.media-feedback.v1";
let cached: Feedback | null = null;

function read(): Feedback {
  if (cached) return cached;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Feedback>;
    cached = { ratings: saved.ratings ?? {}, notes: saved.notes ?? {}, creatorRatings: saved.creatorRatings ?? {}, creatorLikes: saved.creatorLikes ?? {}, tagLikes: saved.tagLikes ?? {} };
  } catch { cached = { ratings: {}, notes: {}, creatorRatings: {}, creatorLikes: {}, tagLikes: {} }; }
  return cached;
}
function write(next: Feedback) { cached = next; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* legacy per-item values remain available */ } }
export function getRating(id: string): number { const value = read().ratings[id]; if (Number.isFinite(value)) return value; try { return Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0); } catch { return 0; } }
export function setRating(id: string, rating: number) {
  const next = read();
  next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
  write(next);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:rating-change"));
}
function creatorKey(name: string) { return name.trim().toLowerCase(); }
export function getCreatorRating(name: string): number { return read().creatorRatings[creatorKey(name)] ?? 0; }
export function setCreatorRating(name: string, rating: number) { const next = read(); next.creatorRatings[creatorKey(name)] = Math.max(0, Math.min(5, Math.round(rating))); write(next); if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:rating-change")); }
export function creatorIsLiked(name: string): boolean { return Boolean(read().creatorLikes[creatorKey(name)]); }
export function toggleCreatorLike(name: string) { const next = read(); const key = creatorKey(name); if (next.creatorLikes[key]) delete next.creatorLikes[key]; else next.creatorLikes[key] = true; write(next); if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:rating-change")); }
function tagKey(tag: string) { return tag.trim().toLowerCase(); }
export function tagIsLiked(tag: string): boolean { return Boolean(read().tagLikes[tagKey(tag)]); }
export function toggleTagLike(tag: string) { const next = read(); const key = tagKey(tag); if (next.tagLikes[key]) delete next.tagLikes[key]; else next.tagLikes[key] = true; write(next); if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:rating-change")); }
/** Versioned rating/note payload used by the full library backup. */
export function exportFeedback() { return { version: 3, ...read() }; }
export function getNote(id: string): string { const value = read().notes[id]; if (typeof value === "string") return value; try { return localStorage.getItem(`reelcase.note.${id}`) ?? ""; } catch { return ""; } }
export function setNote(id: string, note: string) { const next = read(); if (note.trim()) next.notes[id] = note.trim(); else delete next.notes[id]; write(next); }
