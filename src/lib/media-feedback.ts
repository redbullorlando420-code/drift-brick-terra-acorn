type Feedback = { ratings: Record<string, number>; notes: Record<string, string> };
const KEY = "reelcase.media-feedback.v1";

function read(): Feedback {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Feedback>;
    return { ratings: saved.ratings ?? {}, notes: saved.notes ?? {} };
  } catch { return { ratings: {}, notes: {} }; }
}
function write(next: Feedback) { try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* legacy per-item values remain available */ } }
export function getRating(id: string): number { const value = read().ratings[id]; if (Number.isFinite(value)) return value; try { return Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0); } catch { return 0; } }
export function setRating(id: string, rating: number) { const next = read(); next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating))); write(next); }
export function getNote(id: string): string { const value = read().notes[id]; if (typeof value === "string") return value; try { return localStorage.getItem(`reelcase.note.${id}`) ?? ""; } catch { return ""; } }
export function setNote(id: string, note: string) { const next = read(); if (note.trim()) next.notes[id] = note.trim(); else delete next.notes[id]; write(next); }
