import { reviewedDocument } from "./reviewed-document.ts";
import type { MovieImport, MovieImportPreview } from "./videos/movie-import.ts";
export type MovieCollection = { id: string; name: string; members: string[]; at: number };
type Review = {
  source: string;
  name: string;
  at: number;
  rows: Array<{ id: string; title: string; decision: "included" | "rejected"; member?: string }>;
};
export type MovieCollections = {
  version: 1;
  collections: MovieCollection[];
  review?: Review;
  undo?: { id: string; before: MovieCollection | null };
};
export const emptyMovieCollections = (): MovieCollections => ({ version: 1, collections: [] });
const clean = (v: unknown, max: number) =>
  typeof v === "string" &&
  v.trim().length > 0 &&
  v.length <= max &&
  !/[\u0000-\u001f\u007f]/.test(v);
function collection(r: MovieCollection) {
  if (
    !r ||
    !/^collection:[a-z0-9-]{1,80}$/.test(r.id) ||
    !clean(r.name, 100) ||
    !Array.isArray(r.members) ||
    r.members.length > 512 ||
    new Set(r.members).size !== r.members.length ||
    r.members.some(
      (m) => !clean(m, 510) || (!/^film:[a-z0-9-]{1,80}$/i.test(m) && !m.startsWith("video:")),
    ) ||
    !Number.isSafeInteger(r.at) ||
    r.at < 0
  )
    throw Error("Invalid movie collection.");
  return { id: r.id, name: r.name.trim(), members: [...r.members], at: r.at };
}
export function parseMovieCollections(raw: unknown): MovieCollections {
  const r = raw as MovieCollections;
  if (
    !r ||
    r.version !== 1 ||
    Object.keys(r).some((k) => !["version", "collections", "review", "undo"].includes(k)) ||
    !Array.isArray(r.collections) ||
    r.collections.length > 8
  )
    throw Error("Unsupported movie collection settings. Existing collections were kept.");
  const collections = r.collections.map(collection);
  if (
    new Set(collections.map((c) => c.id)).size !== collections.length ||
    collections.reduce((n, c) => n + c.members.length, 0) > 512
  )
    throw Error("Keep at most 512 movie memberships across eight collections.");
  let review: Review | undefined;
  if (r.review) {
    const p = r.review;
    if (
      !clean(p.source, 160) ||
      !clean(p.name, 100) ||
      !Number.isSafeInteger(p.at) ||
      p.at < 0 ||
      !Array.isArray(p.rows) ||
      p.rows.length > 100 ||
      p.rows.some(
        (v) =>
          !v ||
          !clean(v.id, 80) ||
          !clean(v.title, 160) ||
          !["included", "rejected"].includes(v.decision) ||
          (v.decision === "included" && !clean(v.member, 510)) ||
          (v.member !== undefined && !clean(v.member, 510)),
      )
    )
      throw Error("Invalid movie collection review receipt.");
    review = {
      source: p.source,
      name: p.name,
      at: p.at,
      rows: p.rows.map((v) => ({
        id: v.id,
        title: v.title,
        decision: v.decision,
        ...(v.member ? { member: v.member } : {}),
      })),
    };
  }
  let undo: MovieCollections["undo"];
  if (r.undo) {
    if (
      !/^collection:[a-z0-9-]{1,80}$/.test(r.undo.id) ||
      (r.undo.before !== null && r.undo.before.id !== r.undo.id)
    )
      throw Error("Invalid collection undo.");
    undo = { id: r.undo.id, before: r.undo.before === null ? null : collection(r.undo.before) };
  }
  return { version: 1, collections, ...(review ? { review } : {}), ...(undo ? { undo } : {}) };
}
export function applyMovieCollection(
  state: MovieCollections,
  doc: MovieImport,
  preview: readonly MovieImportPreview[],
  choices: Record<string, string>,
  id: string,
  name: string,
  now = Date.now(),
) {
  if (doc.format !== "realhub-movie-collection") throw Error("Choose a collection file.");
  const members = preview.flatMap((p) => {
    const key = choices[p.row.id];
    if (!key) return [];
    if (!p.matches.some((m) => m.key === key))
      throw Error("A selected movie match is no longer available. Preview again.");
    return [key];
  });
  if (!members.length)
    throw Error(
      "Select at least one confirmed movie match. Unmatched rows cannot change film classification.",
    );
  const old = state.collections.find((c) => c.id === id),
    next = collection({
      id,
      name,
      members: [...new Set([...(old?.members ?? []), ...members])],
      at: now,
    });
  if (old && old.name === next.name && old.members.join("\n") === next.members.join("\n"))
    return state;
  return parseMovieCollections({
    version: 1,
    collections: old
      ? state.collections.map((c) => (c.id === id ? next : c))
      : [...state.collections, next],
    review: {
      name: doc.name,
      source: doc.source,
      at: now,
      rows: preview.map((p) => ({
        id: p.row.id,
        title: p.row.title,
        decision: choices[p.row.id] ? "included" : "rejected",
        ...(choices[p.row.id] ? { member: choices[p.row.id] } : {}),
      })),
    },
    undo: { id, before: old ?? null },
  });
}
export function undoMovieCollection(state: MovieCollections) {
  if (!state.undo) return state;
  const previous = state.collections.find((c) => c.id === state.undo!.id) ?? null,
    others = state.collections.filter((c) => c.id !== state.undo!.id);
  return parseMovieCollections({
    version: 1,
    collections: state.undo.before ? [...others, state.undo.before] : others,
    undo: { id: state.undo.id, before: previous },
  });
}
export const movieCollections = reviewedDocument(
  "reelcase.movie-collections.v1",
  emptyMovieCollections,
  parseMovieCollections,
);
