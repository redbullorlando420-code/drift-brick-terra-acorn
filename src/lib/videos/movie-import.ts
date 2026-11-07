import {
  applyFilmFields,
  previewFilmFields,
  commitFilmReviewBatch,
  filmNameEvidence,
  validFilmYear,
  filmPoster,
  type FilmLedger,
  type FilmField,
} from "./film-review.ts";
import type { LibraryVideo } from "./types.ts";
export const MOVIE_IMPORT_BYTES = 128_000;
export type MovieImportRow = {
  id: string;
  title: string;
  year?: number;
  filmId?: string;
  videoId?: string;
  identifier?: string;
  poster?: string;
  genre?: string;
};
export type MovieImport = {
  format: "realhub-film-evidence" | "realhub-movie-collection";
  version: 1;
  name: string;
  source: string;
  rows: MovieImportRow[];
};
const text = (v: unknown, max: number) =>
  typeof v === "string" &&
  v.trim().length > 0 &&
  v.length <= max &&
  !/[\u0000-\u001f\u007f]/.test(v);
const norm = (s: string) =>
  s
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export function parseMovieImport(raw: unknown): MovieImport {
  const r = raw as MovieImport;
  if (
    !r ||
    !["realhub-film-evidence", "realhub-movie-collection"].includes(r.format) ||
    r.version !== 1 ||
    Object.keys(r).some((k) => !["format", "version", "name", "source", "rows"].includes(k)) ||
    !text(r.name, 100) ||
    !text(r.source, 160) ||
    !Array.isArray(r.rows) ||
    !r.rows.length ||
    r.rows.length > 100
  )
    throw Error("Choose a version-1 movie import with a name, source and 1–100 rows.");
  const seen = new Set<string>();
  const rows = r.rows.map((row, i) => {
    if (
      !row ||
      Object.keys(row).some(
        (k) =>
          !["id", "title", "year", "filmId", "videoId", "identifier", "poster", "genre"].includes(
            k,
          ),
      ) ||
      !text(row.id, 80) ||
      ["__proto__", "constructor", "prototype"].includes(row.id) ||
      seen.has(row.id) ||
      !text(row.title, 160) ||
      (row.year !== undefined && !validFilmYear(row.year)) ||
      (r.format === "realhub-film-evidence" && row.year === undefined) ||
      (row.filmId !== undefined && !/^film:[a-z0-9-]{1,80}$/i.test(row.filmId)) ||
      (row.videoId !== undefined && !text(row.videoId, 500)) ||
      (row.identifier !== undefined && !/^(imdb:tt\d{7,10}|tmdb:\d{1,12})$/.test(row.identifier)) ||
      (row.poster !== undefined && !filmPoster(row.poster)) ||
      (row.genre !== undefined && !text(row.genre, 80))
    )
      throw Error("Invalid or duplicate movie import row " + (i + 1) + ". Nothing was changed.");
    seen.add(row.id);
    return {
      ...row,
      title: row.title.trim().replace(/\s+/g,' '),
      ...(row.genre?{genre:row.genre.trim().replace(/\s+/g,' ')}:{}),
      ...(row.poster ? { poster: filmPoster(row.poster) } : {}),
    };
  });
  return { format: r.format, version: 1, name: r.name.trim(), source: r.source.trim(), rows };
}
export function readMovieImportText(text: string) {
  if (new TextEncoder().encode(text).length > MOVIE_IMPORT_BYTES)
    throw Error("Movie import exceeds 128 KB.");
  return parseMovieImport(JSON.parse(text));
}
export type MovieMatch = {
  key: string;
  title: string;
  year?: number;
  filmId?: string;
  videoId?: string;
};
export type MovieImportPreview = {
  row: MovieImportRow;
  matches: MovieMatch[];
  state: "exact" | "ambiguous" | "unmatched";
  truncated: boolean;
  basis?: "film-id" | "source-id" | "identifier-crosswalk" | "title-year";
};
/** Only the current eligible Movie catalog participates. A long video is never promoted by import. */
export async function previewMovieImport(
  doc: MovieImport,
  ledger: FilmLedger,
  videos: readonly LibraryVideo[],
  turn: () => Promise<void>,
): Promise<MovieImportPreview[]> {
  const result: MovieImportPreview[] = doc.rows.map((row) => ({
    row,
    matches: [],
    state: "unmatched",
    truncated: false,
  }));
  const byFilm = new Map<string, MovieImportPreview[]>(),
    byVideo = new Map<string, MovieImportPreview[]>(),
    byTitle = new Map<string, MovieImportPreview[]>();
  for (const out of result) {
    const refs = out.row.filmId
      ? [out.row.filmId]
      : !out.row.videoId && out.row.identifier
        ? (ledger.importReceipt?.rows
            .filter((r) => r.identifier === out.row.identifier)
            .map((r) => r.filmId) ?? [])
        : [];
    out.basis = out.row.filmId
      ? "film-id"
      : out.row.videoId
        ? "source-id"
        : refs.length
          ? "identifier-crosswalk"
          : "title-year";
    if (refs.length) {
      for (const key of new Set(refs)) byFilm.set(key, [...(byFilm.get(key) ?? []), out]);
    } else {
      const index = out.row.videoId ? byVideo : byTitle,
        key = out.row.videoId ?? norm(out.row.title);
      index.set(key, [...(index.get(key) ?? []), out]);
    }
  }
  for (let i = 0; i < videos.length; i++) {
    if (i % 256 === 0) await turn();
    const video = videos[i]!,
      filmId = ledger.versions[video.id]?.filmId,
      film = filmId ? ledger.films[filmId] : undefined,
      e = filmNameEvidence(video),
      candidate: MovieMatch = {
        key: film ? film.id : "video:" + video.id,
        title: film?.title ?? e.title,
        year: film?.year ?? e.year,
        ...(film ? { filmId: film.id } : {}),
        videoId: video.id,
      };
    const applicable = [
      ...(film ? (byFilm.get(film.id) ?? []) : []),
      ...(byVideo.get(video.id) ?? []),
      ...(byTitle.get(norm(candidate.title)) ?? []),
    ];
    for (const out of applicable) {
      if (
        (doc.format === "realhub-film-evidence" && !candidate.filmId) ||
        (out.basis === "title-year" &&
          out.row.year !== undefined &&
          out.row.year !== candidate.year) ||
        out.matches.some((m) => m.key === candidate.key)
      )
        continue;
      if (out.matches.length < 8) out.matches.push(candidate);
      else out.truncated = true;
    }
  }
  return result.map((out) => ({
    ...out,
    state:
      out.matches.length === 1 && !out.truncated
        ? "exact"
        : out.matches.length
          ? "ambiguous"
          : "unmatched",
  }));
}
export function applyMovieEvidence(
  ledger: FilmLedger,
  doc: MovieImport,
  preview: readonly MovieImportPreview[],
  choices: Record<string, { key: string; fields: FilmField[] }>,
  categoryLocked: ReadonlySet<string>,
  now = Date.now(),
) {
  if (doc.format !== "realhub-film-evidence") throw Error("Choose a movie metadata evidence file.");
  const selected = preview.filter((p) => choices[p.row.id]);
  if (!selected.length || selected.length > 8)
    throw Error("Review 1–8 metadata rows per application.");
  const films: FilmLedger["films"] = {},
    rows: Array<{ filmId: string; fields: FilmField[]; identifier?: string }> = [],
    seen = new Set<string>();
  for (const p of selected) {
    const choice = choices[p.row.id]!,
      match = p.matches.find((m) => m.key === choice.key),
      id = match?.filmId;
    if (!id || seen.has(id) || !ledger.films[id])
      throw Error("Choose one distinct, currently reviewed film per selected row.");
    seen.add(id);
    const fields = previewFilmFields(
      ledger.films[id]!,
      p.row,
      choice.fields,
      categoryLocked.has(id),
    );
    if (fields.some((f) => f.state === "invalid"))
      throw Error("A selected metadata field is invalid.");
    if (!fields.some((f) => f.state === "ready")) {
      const newDeclaration=p.row.identifier&&!ledger.importReceipt?.rows.some(r=>r.filmId===id&&r.identifier===p.row.identifier);
      if(newDeclaration){films[id]=ledger.films[id]!;rows.push({filmId:id,fields:[],identifier:p.row.identifier});}
      continue;
    }
    const next = applyFilmFields(
      ledger,
      id,
      p.row,
      choice.fields,
      "saved-catalog",
      categoryLocked.has(id),
      now,
    );
    films[id] = next.films[id]!;
    rows.push({
      filmId: id,
      fields: choice.fields.filter((f) => ledger.films[id]![f] !== next.films[id]![f]),
      ...(p.row.identifier ? { identifier: p.row.identifier } : {}),
    });
  }
  return commitFilmReviewBatch(
    ledger,
    films,
    { source: doc.source, name: doc.name, at: now, rows },
    now,
  );
}
