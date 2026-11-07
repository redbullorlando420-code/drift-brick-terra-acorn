import { reviewedDocument } from "./reviewed-document.ts";
import { MOVIE_REGIONS, moviePoster, type YoutubeMovie } from "./remote/youtube-movies.ts";
export type SavedMovie = YoutubeMovie & { savedAt: number; watchedAt?: number };
export type MovieWatchlist = { version: 1; movies: SavedMovie[]; undo?: SavedMovie[] };
export const emptyMovieWatchlist = (): MovieWatchlist => ({ version: 1, movies: [] });
const text = (v: unknown, max: number) =>
  typeof v === "string" && v.length <= max && !/[\x00-\x1f]/.test(v);
export function parseMovieWatchlist(raw: unknown): MovieWatchlist {
  const r = raw as MovieWatchlist;
  if (
    !r ||
    r.version !== 1 ||
    Object.keys(r).some((k) => !["version", "movies", "undo"].includes(k))
  )
    throw Error("Unsupported saved movie shelf. Existing data was kept.");
  const rows = (items: SavedMovie[]) => {
    if (!Array.isArray(items) || items.length > 64)
      throw Error("Keep at most 64 saved YouTube movies.");
    const ids = new Set<string>();
    return items.map((m) => {
      if (
        !m ||
        typeof m.id !== "string" ||
        !/^[\w-]{11}$/.test(m.id) ||
        ids.has(m.id) ||
        !text(m.title, 240) ||
        !m.title.trim() ||
        !text(m.description, 360) ||
        !text(m.metadata, 240) ||
        !text(m.offer, 80) ||
        !text(m.rating, 24) ||
        !MOVIE_REGIONS.includes(m.region) ||
        (m.poster !== "" && moviePoster(m.poster) !== m.poster) ||
        (m.seconds !== null &&
          (!Number.isSafeInteger(m.seconds) || m.seconds <= 600 || m.seconds > 360000)) ||
        (m.year !== null && (!Number.isInteger(m.year) || m.year < 1800 || m.year > 2099)) ||
        !Number.isSafeInteger(m.observedAt) ||
        m.observedAt < 0 ||
        !Number.isSafeInteger(m.savedAt) ||
        m.savedAt < 0 ||
        (m.watchedAt !== undefined && (!Number.isSafeInteger(m.watchedAt) || m.watchedAt < 0))
      )
        throw Error("Invalid saved movie metadata. Existing data was kept.");
      ids.add(m.id);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        metadata: m.metadata,
        offer: m.offer,
        rating: m.rating,
        region: m.region,
        poster: m.poster,
        seconds: m.seconds,
        year: m.year,
        observedAt: m.observedAt,
        savedAt: m.savedAt,
        ...(m.watchedAt !== undefined ? { watchedAt: m.watchedAt } : {}),
      };
    });
  };
  return {
    version: 1,
    movies: rows(r.movies),
    ...(r.undo !== undefined ? { undo: rows(r.undo) } : {}),
  };
}
export function updateMovieWatchlist(
  current: MovieWatchlist,
  movie: YoutubeMovie,
  action: "save" | "remove" | "watched",
  now = Date.now(),
): MovieWatchlist {
  const found = current.movies.find((m) => m.id === movie.id);
  let movies = current.movies;
  if (action === "save") {
    if (found) return current;
    movies = [{ ...movie, savedAt: now }, ...movies];
  } else if (action === "remove") movies = movies.filter((m) => m.id !== movie.id);
  else {
    if (!found) throw Error("Save this movie before marking it watched.");
    movies = movies.map((m) =>
      m.id === movie.id ? { ...m, watchedAt: m.watchedAt === undefined ? now : undefined } : m,
    );
  }
  return parseMovieWatchlist({ version: 1, movies, undo: current.movies });
}
export const movieWatchlist = reviewedDocument(
  "reelcase.youtube-movies.v1",
  emptyMovieWatchlist,
  parseMovieWatchlist,
);
