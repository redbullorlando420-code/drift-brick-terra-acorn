import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyMovieWatchlist,
  parseMovieWatchlist,
  updateMovieWatchlist,
} from "./movie-watchlist.ts";
import { reviewedDocument } from "./reviewed-document.ts";
import { createProfileStorage } from "./local-profile-storage.ts";
import type { YoutubeMovie } from "./remote/youtube-movies.ts";
const movie: YoutubeMovie = {
  id: "abcdefghijk",
  title: "Movie",
  poster: "",
  description: "",
  metadata: "Drama",
  offer: "Offer not supplied",
  rating: "",
  region: "US",
  seconds: 7200,
  year: null,
  observedAt: 1,
};
function storage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: (k: string) => data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
}
test("save deduplicates and preserves observation; watched is explicit and reversible; removal has a durable inverse", () => {
  const initial = emptyMovieWatchlist(),
    saved = updateMovieWatchlist(initial, movie, "save", 10);
  assert.equal(saved.movies[0].watchedAt, undefined);
  assert.equal(updateMovieWatchlist(saved, movie, "save"), saved);
  const watched = updateMovieWatchlist(saved, movie, "watched", 20);
  assert.equal(watched.movies[0].watchedAt, 20);
  assert.equal(watched.movies[0].observedAt, 1);
  assert.equal(updateMovieWatchlist(watched, movie, "watched", 30).movies[0].watchedAt, undefined);
  const removed = parseMovieWatchlist(
    JSON.parse(JSON.stringify(updateMovieWatchlist(watched, movie, "remove"))),
  );
  assert.equal(removed.movies.length, 0);
  assert.equal(removed.undo?.[0].watchedAt, 20);
});
test("future schemas, duplicate IDs, unsafe artwork, impossible durations and excessive rows are rejected", () => {
  const saved = updateMovieWatchlist(emptyMovieWatchlist(), movie, "save", 1);
  for (const raw of [
    { ...saved, version: 2 },
    { ...saved, undo: null },
    { ...saved, movies: [{ ...saved.movies[0], id: 12345678901 }] },
    { ...saved, movies: [...saved.movies, ...saved.movies] },
    { ...saved, movies: [{ ...saved.movies[0], poster: "javascript:bad" }] },
    { ...saved, movies: [{ ...saved.movies[0], seconds: 12 }] },
    { ...saved, movies: Array(65).fill(saved.movies[0]) },
  ])
    assert.throws(() => parseMovieWatchlist(raw));
});
test("quota and concurrent edits never publish a mutation; reload permits recovery", () => {
  const store = storage();
  let deny = false;
  const doc = reviewedDocument("shelf", emptyMovieWatchlist, parseMovieWatchlist, {
    getItem: store.getItem,
    setItem: (k, v) => {
      if (deny) throw Error("Quota");
      store.setItem(k, v);
    },
  });
  doc.hydrate();
  const original = doc.get().data;
  deny = true;
  assert.throws(() => doc.write(updateMovieWatchlist(original, movie, "save")), /Quota/);
  assert.equal(doc.get().data, original);
  deny = false;
  store.setItem("shelf", JSON.stringify({ ...original, version: 2 }));
  assert.throws(() => doc.write(updateMovieWatchlist(original, movie, "save")), /another tab/);
  assert.equal(doc.get().data, original);
  doc.reload();
  assert(doc.get().error);
  assert.throws(() => doc.write(original), /Unsupported/);
  store.setItem("shelf", JSON.stringify(original));
  doc.reload();
  doc.write(updateMovieWatchlist(doc.get().data, movie, "save"));
  assert.equal(doc.get().data.movies.length, 1);
});
test("saved shelves and undo remain isolated between local profiles", () => {
  const native = storage(),
    a = createProfileStorage(() => native, "default"),
    b = createProfileStorage(() => native, "p-12345678-1234-1234-1234-123456789012");
  const doc = (s: Storage) =>
    reviewedDocument("reelcase.youtube-movies.v1", emptyMovieWatchlist, parseMovieWatchlist, s);
  const first = doc(a);
  first.hydrate();
  first.write(updateMovieWatchlist(first.get().data, movie, "save"));
  const second = doc(b);
  second.hydrate();
  assert.equal(second.get().data.movies.length, 0);
  second.write(emptyMovieWatchlist());
  const restored = doc(a);
  restored.hydrate();
  assert.equal(restored.get().data.movies.length, 1);
});
