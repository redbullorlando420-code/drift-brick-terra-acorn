import test from "node:test";
import assert from "node:assert/strict";
import { searchText, searchTokens } from "./search-text.ts";
import { VideoSearchIndex, searchCatalog } from "./search-index.ts";
import { matchesSearchConstraints } from "./search-constraints.ts";
import { emptySearchQuery } from "./search-query.ts";
import type { LibraryVideo } from "./types";
const video = (id: string, name: string): LibraryVideo => ({
  id,
  name,
  path: id,
  folderId: "public",
  extension: "mp4",
  mime: "video/mp4",
  size: 0,
  addedAt: 1,
});
const rows = [
  video("composed", "Café soirée"),
  video("decomposed", "Cafe\u0301 soire\u0301e"),
  video("plain", "Cafe soiree"),
  video("ru", "Привет мир"),
  video("jp", "日本語の映画"),
  video("ar", "مرحبا بالعالم"),
  video("ko", "한국어 영화"),
  video("astral", "𐐀𐐁𐐂 film"),
];
test("canonical keys preserve accents, distinct scripts, digits and compound tags", () => {
  assert.equal(searchText("CAFE\u0301"), searchText("Café"));
  assert.notEqual(searchText("café"), searchText("cafe"));
  assert.notEqual(searchText("а"), searchText("a"));
  assert.deepEqual(searchTokens("genre-Café_日本語 — Привет! １２٣"), [
    "genre-café_日本語",
    "genre",
    "café",
    "日本語",
    "привет",
    "１２٣",
  ]);
  assert.deepEqual(searchTokens("𐐀𐐁"), ["𐐨𐐩"]);
});
test("legacy index and cooperative fallback agree on mixed-script equivalent and distinct names", async () => {
  const videos = structuredClone(rows),
    before = JSON.stringify(videos),
    index = new VideoSearchIndex();
  index.sync(videos, {}, {});
  for (const [query, ids] of [
    ["CAFÉ", ["composed", "decomposed"]],
    ["cafe\u0301", ["composed", "decomposed"]],
    ["cafe", ["plain"]],
    ["Привет", ["ru"]],
    ["日本語", ["jp"]],
    ["مرحبا", ["ar"]],
    ["한국어", ["ko"]],
    ["𐐀𐐁", ["astral"]],
  ] as const) {
    assert.deepEqual([...index.search(query)!], ids);
    assert.deepEqual([...(await searchCatalog(videos, {}, {}, query))], ids);
  }
  assert.equal(JSON.stringify(videos), before);
});
test("Unicode exact tags and categories compare canonically without rewriting owner values", () => {
  const row = video("one", "Other"),
    tags = { one: ["Cafe\u0301"] },
    categories = { one: "Soire\u0301e" },
    before = JSON.stringify({ row, tags, categories });
  assert(
    matchesSearchConstraints(
      row,
      tags,
      categories,
      { ...emptySearchQuery(), tags: ["café"], category: "soirée" },
      true,
    ),
  );
  assert(
    !matchesSearchConstraints(
      row,
      tags,
      categories,
      { ...emptySearchQuery(), tags: ["cafe"] },
      true,
    ),
  );
  assert.equal(JSON.stringify({ row, tags, categories }), before);
});
