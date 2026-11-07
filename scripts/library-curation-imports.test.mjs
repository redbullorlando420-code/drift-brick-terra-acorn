import test from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_FILMS,
  confirmFilm,
  undoFilmReview,
  parseFilmLedger,
} from "../src/lib/videos/film-review.ts";
import {
  readMovieImportText,
  parseMovieImport,
  previewMovieImport,
  applyMovieEvidence,
} from "../src/lib/videos/movie-import.ts";
import {
  emptyMovieCollections,
  parseMovieCollections,
  applyMovieCollection,
  undoMovieCollection,
} from "../src/lib/movie-collections.ts";
import {
  emptySeriesProgress,
  parseSeriesProgress,
  changeSeriesProgress,
  undoSeriesProgress,
  summarizeSeriesProgress,
  nextTrackedAnimeEpisode,
} from "../src/lib/series-progress.ts";
import { buildAnimeEpisodeMap } from "../src/lib/videos/anime-review.ts";
import { reviewedDocument } from "../src/lib/reviewed-document.ts";
import { createProfileStorage } from "../src/lib/local-profile-storage.ts";
const turn = async () => {},
  video = (id, name = "Dune (1984)") => ({
    id,
    name,
    folderId: "public",
    path: "",
    size: 0,
    mime: "video/youtube",
    extension: "yt",
    duration: 7200,
    addedAt: 1,
    remote: { kind: "youtube", videoId: "film0000001" },
  });
const ledger = () =>
  confirmFilm(
    confirmFilm(
      EMPTY_FILMS,
      "a",
      { filmId: "film:original", title: "Dune", year: 1984, runtime: 7200, edition: "Theatrical" },
      10,
    ),
    "b",
    { filmId: "film:remake", title: "Dune", year: 2021, runtime: 7200, edition: "Theatrical" },
    11,
  );
const doc = (
  format = "realhub-film-evidence",
  rows = [
    {
      id: "one",
      title: "Dune",
      year: 1984,
      genre: "Science fiction",
      identifier: "imdb:tt0087182",
    },
  ],
) =>
  parseMovieImport({
    format,
    version: 1,
    name: "Reviewed films",
    source: "Owner metadata file",
    rows,
  });
test("movie imports validate the whole bounded file and reject future, duplicate, unsafe and malformed rows", () => {
  const valid = doc();
  assert.deepEqual(readMovieImportText(JSON.stringify(valid)), valid);
  for (const value of [
    { ...valid, rows: [{ ...valid.rows[0], id: "__proto__" }] },
    { ...valid, version: 2 },
    { ...valid, rows: [...valid.rows, valid.rows[0]] },
    { ...valid, rows: [{ id: "x", title: "Bad", year: 1600 }] },
    { ...valid, rows: [{ ...valid.rows[0], poster: "javascript:alert(1)" }] },
    { ...valid, rows: [{ ...valid.rows[0], identifier: "http://secret" }] },
    {
      ...valid,
      rows: Array.from({ length: 101 }, (_, i) => ({ id: String(i), title: "Dune", year: 1984 })),
    },
  ])
    assert.throws(() => parseMovieImport(value));
  assert.throws(() => readMovieImportText("x".repeat(128001)));
  assert.throws(() => readMovieImportText("{"));
});
test("matching distinguishes exact reviewed film IDs, remake years, ambiguous identities and unmatched evidence", async () => {
  let l = ledger();
  l = confirmFilm(
    l,
    "c",
    {
      filmId: "film:duplicate",
      title: "Dune",
      year: 1984,
      runtime: 7200,
      edition: "Separate owner identity",
    },
    12,
  );
  const d = doc("realhub-film-evidence", [
    { id: "x", title: "Dune", year: 1984 },
    { id: "y", title: "Dune", year: 2021 },
    { id: "z", title: "Unknown", year: 2000 },
    { id: "id", title: "Alternate title", year: 2000, filmId: "film:original" },
  ]);
  const p = await previewMovieImport(
    d,
    l,
    [video("a"), video("a-alias"), video("b"), video("c")],
    turn,
  );
  assert.deepEqual(
    p.map((r) => r.state),
    ["ambiguous", "exact", "unmatched", "exact"],
  );
  assert.equal(p[3].matches[0].filmId, "film:original");
});
test("one metadata transaction preserves locks, records reviewed declarations, is idempotent and undoes every field and crosswalk", async () => {
  const l = ledger(),
    d = doc(),
    p = await previewMovieImport(d, l, [video("a")], turn),
    choice = { one: { key: "film:original", fields: ["title", "year", "genre"] } };
  const changed = applyMovieEvidence(l, d, p, choice, new Set(), 20);
  assert.equal(changed.films["film:original"].title, "Dune");
  assert.equal(changed.films["film:original"].genre, "Science fiction");
  assert.equal(changed.importReceipt.rows[0].identifier, "imdb:tt0087182");
  assert.deepEqual(changed.versions, l.versions);
  assert.equal(applyMovieEvidence(changed, d, p, choice, new Set(), 21), changed);
  const spaced=doc('realhub-film-evidence',[{...d.rows[0],genre:'  Science   fiction  '}]);
  assert.equal(applyMovieEvidence(changed,spaced,await previewMovieImport(spaced,changed,[video('a')],turn),choice,new Set(),21),changed);
  const cross = await previewMovieImport(
    doc("realhub-film-evidence", [
      {
        id: "other",
        title: "Dune alternative localized title",
        year: 2000,
        identifier: "imdb:tt0087182",
      },
    ]),
    changed,
    [video("a")],
    turn,
  );
  assert.equal(cross[0].basis, "identifier-crosswalk");
  assert.equal(cross[0].state, "exact");
  const restored = undoFilmReview(parseFilmLedger(JSON.parse(JSON.stringify(changed))), 22);
  assert.deepEqual(restored.films, l.films);
  assert.equal(restored.importReceipt, undefined);
  const categoryLocked=applyMovieEvidence(l,d,p,choice,new Set(['film:original']));
  assert.deepEqual(categoryLocked.films,l.films);
  assert.deepEqual(categoryLocked.importReceipt.rows[0].fields,[]);
});
test("multi-row metadata undo restores the previous receipt and independent film fields", async () => {
  const l = ledger(),
    d = doc("realhub-film-evidence", [
      { id: "a", title: "Dune", year: 1984, genre: "Classic" },
      { id: "b", title: "Dune", year: 2021, genre: "Modern" },
    ]),
    p = await previewMovieImport(d, l, [video("a"), video("b")], turn);
  const first = applyMovieEvidence(
    l,
    d,
    p,
    {
      a: { key: "film:original", fields: ["genre"] },
      b: { key: "film:remake", fields: ["genre"] },
    },
    new Set(),
    20,
  );
  assert.equal(Object.keys(first.importUndo.films).length, 2);
  // Earlier readers ignore new optional fields; their original one-film undo contract remains valid.
  assert.deepEqual(
    parseFilmLedger({ ...first, importUndo: undefined, importReceipt: undefined }).films,
    first.films,
  );
  assert.deepEqual(undoFilmReview(first, 21).films, l.films);
  const second = applyMovieEvidence(
    first,
    { ...d, source: "Second reviewed file", rows: [{ ...d.rows[0], genre: "Changed" }] },
    [{ ...p[0], row: { ...d.rows[0], genre: "Changed" } }],
    { a: { key: "film:original", fields: ["genre"] } },
    new Set(),
    22,
  );
  assert.deepEqual(undoFilmReview(second, 23).importReceipt, first.importReceipt);
});

test('identifier-only review enriches a locked film without changing its title/year and can be undone',async()=>{
 const l=ledger(),d=doc('realhub-film-evidence',[{id:'id-only',filmId:'film:original',title:'Dune',year:1984,identifier:'imdb:tt0087182'}]),p=await previewMovieImport(d,l,[video('a')],turn),choice={'id-only':{key:'film:original',fields:[]}};
 const next=applyMovieEvidence(l,d,p,choice,new Set(),30);
 assert.deepEqual(next.films,l.films);assert.equal(next.importReceipt.rows[0].identifier,'imdb:tt0087182');
 assert.equal(applyMovieEvidence(next,d,p,choice,new Set(),31),next);
 const old=undoFilmReview(parseFilmLedger(JSON.parse(JSON.stringify(next))),32);assert.equal(old.importReceipt,undefined);assert.deepEqual(old.films,l.films);
});
test("large matching yields, cancels promptly and keeps at most eight candidates per row", async () => {
  const d = doc("realhub-movie-collection", [{ id: "a", title: "Dune" }]),
    videos = Array.from({ length: 100000 }, (_, i) => video("v" + i, "Dune (1984)"));
  let calls = 0;
  await assert.rejects(
    previewMovieImport(d, EMPTY_FILMS, videos, async () => {
      if (++calls === 3) throw Error("cancelled");
    }),
    /cancelled/,
  );
  assert.equal(calls, 3);
  const p = await previewMovieImport(d, EMPTY_FILMS, videos, turn);
  assert.equal(p[0].matches.length, 8);
  assert(p[0].truncated);
  assert.equal(p[0].state, "ambiguous");
});
test("collection import requires explicit eligible choices, retains rejects, merges idempotently and supports reload undo", async () => {
  const d = doc("realhub-movie-collection", [
      { id: "a", title: "Dune", year: 1984 },
      { id: "b", title: "Trailer", year: 1984 },
      { id: "c", title: "Lecture", year: 1984 },
    ]),
    p = await previewMovieImport(d, ledger(), [video("a")], turn),
    empty = emptyMovieCollections();
  assert.throws(() => applyMovieCollection(empty, d, p, {}, "collection:one", "Movies"), /Select/);
  assert.throws(
    () => applyMovieCollection(empty, d, p, { b: "video:trailer" }, "collection:one", "Movies"),
    /no longer/,
  );
  const saved = applyMovieCollection(
    empty,
    d,
    p,
    { a: "film:original" },
    "collection:one",
    "Movies",
    20,
  );
  assert.deepEqual(saved.collections[0].members, ["film:original"]);
  assert.equal(saved.review.rows.filter((r) => r.decision === "rejected").length, 2);
  assert.equal(
    applyMovieCollection(saved, d, p, { a: "film:original" }, "collection:one", "Movies", 21),
    saved,
  );
  const restored = undoMovieCollection(parseMovieCollections(JSON.parse(JSON.stringify(saved))));
  assert.equal(restored.collections.length, 0);
  assert.equal(undoMovieCollection(restored).collections.length, 1);
});
const series = {
  id: "anime:moon",
  title: "Moon",
  release: "Original",
  aliases: [],
  ranges: [{ numbering: "season", season: 1, start: 1, end: 4 }],
  policy: { numbering: "season", threshold: 0.95, specials: false },
  at: 1,
};
const episode = (id, n, numbering = "season", available = true) => ({
  video: video(id),
  review: {
    seriesId: series.id,
    numbering,
    season: numbering === "season" ? 1 : 0,
    episode: n,
    kind: "episode",
    preferred: false,
    at: 1,
  },
  available,
  resume: { t: 99, d: 100, at: 10 },
});
const map = () =>
  buildAnimeEpisodeMap(series, [
    episode("one", 1),
    episode("one-alt", 1),
    { ...episode("two", 2), resume: { t: 50, d: 100, at: 11 } },
    episode("four", 4, "season", false),
    episode("absolute", 1, "absolute"),
  ]);
test("series summaries keep duplicates, numbering alternatives, missing and unavailable evidence distinct", () => {
  const s = summarizeSeriesProgress(series, map());
  assert.deepEqual(s, {
    known: 3,
    complete: 2,
    missing: 1,
    uncertain: false,
    unavailable: 1,
    otherNumbering: 1,
    unresolved: 0,
    specials: 0,
  });
});
test("series corrections and reset have recoverable inverse state without changing history or another series", () => {
  const m = map(),
    before = JSON.stringify(m),
    known = m.numbered.map((s) => s.key);
  let state = changeSeriesProgress(
    emptySeriesProgress(),
    series.id,
    { kind: "decision", slot: "season:1:episode:2", value: true },
    known,
  );
  assert.equal(summarizeSeriesProgress(series, m, state.series[series.id]).complete, 3);
  assert.throws(
    () =>
      changeSeriesProgress(
        state,
        series.id,
        { kind: "decision", slot: "season:1:episode:3", value: true },
        known,
      ),
    /existing reviewed/,
  );
  state = changeSeriesProgress(state, "anime:another", { kind: "reset", at: 12 }, []);
  const other = state.series["anime:another"];
  const reset = changeSeriesProgress(state, series.id, { kind: "reset", at: 20 }, known);
  assert.equal(summarizeSeriesProgress(series, m, reset.series[series.id]).complete, 0);
  assert.deepEqual(reset.series["anime:another"], other);
  assert.equal(nextTrackedAnimeEpisode(series, m, reset.series[series.id]).version.video.id, "one");
  const undone = undoSeriesProgress(parseSeriesProgress(JSON.parse(JSON.stringify(reset))));
  assert.equal(summarizeSeriesProgress(series, m, undone.series[series.id]).complete, 3);
  assert.equal(JSON.stringify(m), before);
  const fresh = map();
  fresh.numbered.find((s) => s.key === "season:1:episode:1").versions[0].resume.at = 21;
  assert.equal(summarizeSeriesProgress(series, fresh, reset.series[series.id]).complete, 1);
});
test("explicit document writes roll back quota failures, detect conflicts and preserve unsupported schemas and profile boundaries", () => {
  const bytes = new Map();
  let fail = false;
  const native = {
    getItem: (k) => bytes.get(k) ?? null,
    setItem: (k, v) => {
      if (fail) throw Error("quota");
      bytes.set(k, v);
    },
  };
  const a = reviewedDocument(
      "reelcase.series-progress.v1",
      emptySeriesProgress,
      parseSeriesProgress,
      createProfileStorage(() => native, "p-11111111-1111-1111-1111-111111111111"),
    ),
    b = reviewedDocument(
      "reelcase.series-progress.v1",
      emptySeriesProgress,
      parseSeriesProgress,
      createProfileStorage(() => native, "p-22222222-2222-2222-2222-222222222222"),
    );
  a.hydrate();
  b.hydrate();
  const next = changeSeriesProgress(
    emptySeriesProgress(),
    series.id,
    { kind: "reset", at: 20 },
    [],
  );
  fail = true;
  assert.throws(() => a.write(next), /quota/);
  assert.deepEqual(a.get().data, emptySeriesProgress());
  fail = false;
  a.write(next);
  assert.deepEqual(b.get().data, emptySeriesProgress());
  const key = [...bytes.keys()][0],
    future = JSON.stringify({ version: 2, series: {} });
  bytes.set(key, future);
  assert.throws(() => a.write(next), /another tab/);
  a.reload();
  assert.match(a.get().error, /Unsupported/);
  assert.throws(() => a.write(next), /Unsupported/);
  assert.equal(bytes.get(key), future);
});
