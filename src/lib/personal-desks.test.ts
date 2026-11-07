import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { chartTable } from "./chart-table.ts";
import { reviewedPreferences } from "./reviewed-preferences.ts";
import { readDeskLayouts, changeDeskLayout, DEFAULT_DESK_LAYOUT } from "./desk-layouts.ts";
import {
  readAnimeReleases,
  releaseInstant,
  releaseObservation,
  type AnimeRelease,
} from "./anime-releases.ts";
import { createProfileStorage } from "./local-profile-storage.ts";
const memory = () => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => {
      m.set(k, v);
    },
    removeItem: (k: string) => {
      m.delete(k);
    },
    get length() {
      return m.size;
    },
    key: (i: number) => [...m.keys()][i] ?? null,
    clear: () => m.clear(),
  };
};
const row: AnimeRelease = {
  id: "release-1",
  seriesId: "anime:test",
  numbering: "season",
  season: 1,
  episode: 2,
  expected: "2026-11-01T01:30:00-04:00",
  zone: "America/New_York",
  postponed: false,
  remind: true,
  acknowledged: false,
  source: "Owner observation",
};
test("layout save, desk-only reset and undo round-trip without changing other desks", () => {
  let s = readDeskLayouts({
    version: 1,
    desks: { movies: { view: "list", explore: false, catalog: false } },
  });
  s = changeDeskLayout(s, "youtube", { view: "grid", explore: true, catalog: true });
  const before = s.desks.youtube;
  s = changeDeskLayout(s, "youtube");
  assert.equal(s.desks.youtube, undefined);
  assert.equal(s.desks.movies?.view, "list");
  s = readDeskLayouts(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(s.undo?.previous, before);
  s = changeDeskLayout(s, "youtube", s.undo?.previous);
  assert.deepEqual(s.desks.youtube, before);
  assert.equal(s.desks.movies?.view, "list");
});
test("future layout schemas, unknown options and invalid values reject writes", () => {
  for (const raw of [
    { version: 2, desks: {} },
    { version: 1, desks: { adults: DEFAULT_DESK_LAYOUT } },
    { version: 1, desks: { youtube: { ...DEFAULT_DESK_LAYOUT, query: "private" } } },
    { version: 1, desks: { youtube: { ...DEFAULT_DESK_LAYOUT, view: "tiny" } } },
  ])
    assert.throws(() => readDeskLayouts(raw));
});
test("storage conflict, quota and unsupported formats retain exact prior bytes and active snapshot", () => {
  const disk = memory(),
    store = reviewedPreferences(
      "layout",
      () => ({ version: 1 as const, desks: {} }),
      readDeskLayouts,
      disk,
    );
  store.read();
  store.write({ version: 1, desks: { youtube: DEFAULT_DESK_LAYOUT } });
  const old = store.get(),
    bytes = disk.getItem("layout"),
    set = disk.setItem;
  disk.setItem = () => {
    throw Error("quota");
  };
  assert.throws(() => store.write(changeDeskLayout(old, "youtube")), /quota/);
  assert.equal(store.get(), old);
  assert.equal(disk.getItem("layout"), bytes);
  disk.setItem = set;
  disk.setItem("layout", '{"version":2,"desks":{}}');
  assert.throws(() => store.write(old), /another tab/);
  store.read();
  assert.throws(() => store.write(old));
  assert.equal(disk.getItem("layout"), '{"version":2,"desks":{}}');
});
test("layout and watchlist storage use the existing isolated profile adapter", () => {
  const disk = memory(),
    a = createProfileStorage(() => disk, "default"),
    b = createProfileStorage(() => disk, "p-11111111-1111-1111-1111-111111111111");
  a.setItem("reelcase.desk-layouts.v1", "Alpha");
  a.setItem("reelcase.anime-releases.v1", "Alpha");
  assert.equal(b.getItem("reelcase.desk-layouts.v1"), null);
  assert.equal(b.getItem("reelcase.anime-releases.v1"), null);
});
test("explicit DST offsets distinguish repeated local hours; display zones never change the instant", () => {
  assert.equal(releaseInstant(row.expected) + 3600000, releaseInstant("2026-11-01T01:30:00-05:00"));
  for (const s of ["2026-11-01T01:30", "2026-02-30T20:00Z", "not a date", "2026-11-01T25:00:00Z"])
    assert.throws(() => releaseInstant(s));
  assert.equal(
    readAnimeReleases({ version: 1, entries: [{ ...row, zone: "Asia/Tokyo" }] }).entries[0]
      ?.expected,
    row.expected,
  );
});
test("expected, postponed, acknowledged and actually observed episode states stay distinct", () => {
  const reviews: any = {
      version: 1,
      updatedAt: 0,
      series: {},
      episodes: {
        v: { seriesId: "anime:test", numbering: "season", season: 1, episode: 2, kind: "episode" },
        other: {
          seriesId: "anime:other",
          numbering: "season",
          season: 1,
          episode: 2,
          kind: "episode",
        },
      },
    },
    now = Date.parse("2026-11-02T00:00:00Z");
  assert.equal(releaseObservation(row, reviews, new Set(), now).due, true);
  assert.equal(releaseObservation({ ...row, postponed: true }, reviews, new Set(), now).due, false);
  assert.equal(
    releaseObservation({ ...row, acknowledged: true }, reviews, new Set(), now).due,
    false,
  );
  assert.equal(releaseObservation(row, reviews, new Set(["other"]), now).available, false);
  const actual = releaseObservation(row, reviews, new Set(["v"]), now);
  assert.equal(actual.available, true);
  assert.equal(actual.due, false);
  assert.deepEqual(actual.ids, ["v"]);
});
test("watchlist edits preserve identity and reject duplicate slots, invalid zones and excess rows", () => {
  const ledger = readAnimeReleases({ version: 1, entries: [row] }),
    edit = readAnimeReleases({
      version: 1,
      entries: [{ ...ledger.entries[0], expected: "2026-12-01T20:00:00Z" }],
    });
  assert.equal(edit.entries[0]?.id, row.id);
  assert.throws(() =>
    readAnimeReleases({ version: 1, entries: [row, { ...row, id: "different" }] }),
  );
  assert.throws(() =>
    readAnimeReleases({ version: 1, entries: [{ ...row, zone: "invalid/time" }] }),
  );
  assert.throws(() => readAnimeReleases({ version: 2, entries: [] }));
  assert.throws(() =>
    readAnimeReleases({
      version: 1,
      entries: Array.from({ length: 33 }, (_, i) => ({ ...row, id: "r" + i, episode: i + 1 })),
    }),
  );
});
test("chart tables borrow exactly the plotted snapshot, expose percentage units and exclude unplotted data", () => {
  const data = [{ name: "YouTube", titles: 20, privateNote: "exclude", score: 99 }],
    chart = createElement(
      "chart",
      { data },
      createElement("bar", { dataKey: "titles", name: "Titles" }),
    );
  const p = chartTable(chart);
  assert.equal(p.rows, data);
  assert.deepEqual(p.columns, [
    { key: "name", name: "Category" },
    { key: "titles", name: "Titles" },
  ]);
  const pie = chartTable(
    createElement("piechart", {}, createElement("pie", { data, dataKey: "titles" })),
  );
  assert.equal(pie.rows, data);
  const percent = chartTable(
    createElement(
      "chart",
      { data: [{ name: "X", ready: 80 }] },
      createElement("bar", { dataKey: "ready", name: "Artwork URLs supplied %" }),
    ),
  );
  assert.equal(percent.columns[1]?.name, "Artwork URLs supplied %");
});
