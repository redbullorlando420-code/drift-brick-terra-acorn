type Feedback = { ratings: Record<string, number>; notes: Record<string, string> };
const KEY = "reelcase.media-feedback.v1";
let cached: Feedback | null = null;

function read(): Feedback {
  if (cached) return cached;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Feedback>;
    cached = { ratings: saved.ratings ?? {}, notes: saved.notes ?? {} };
  } catch { cached = { ratings: {}, notes: {} }; }
  return cached;
}
function write(next: Feedback) { cached = next; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* legacy per-item values remain available */ } }
export function getRating(id: string): number { const value = read().ratings[id]; if (Number.isFinite(value)) return value; try { return Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0); } catch { return 0; } }
export function setRating(id: string, rating: number) { const next = read(); next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating))); write(next); }
/** Versioned rating/note payload used by the full library backup. */
export function exportFeedback() { return { version: 1, ...read() }; }
export function getNote(id: string): string { const value = read().notes[id]; if (typeof value === "string") return value; try { return localStorage.getItem(`reelcase.note.${id}`) ?? ""; } catch { return ""; } }
export function setNote(id: string, note: string) { const next = read(); if (note.trim()) next.notes[id] = note.trim(); else delete next.notes[id]; write(next); }
