import test from "node:test";
import assert from "node:assert/strict";
import {
  emptySearchQuery,
  encodeSearchQuery,
  parseSearchQuery,
  queryChips,
  removeQueryChip,
  validateSearchQuery,
} from "./search-query.ts";
import { structuredSearch } from "./structured-search.ts";
import type { LibraryVideo } from "./types";
const video = (id: string, extra: Partial<LibraryVideo> = {}): LibraryVideo => ({
  id,
  name: "Racing evening",
  folderId: "public",
  path: id,
  addedAt: 1,
  extension: "mp4",
  mime: "video/mp4",
  size: 0,
  ...extra,
});
test("structured model round-trips text, quoted values, source and exact duration boundaries", () => {
  for (const text of [
    "racing evening",
    "title: literal text",
    'quoted "value"',
    "E:\\movie.mp4",
    "https://youtube.com/watch?v=one",
    "",
  ]) {
    const q = {
      ...emptySearchQuery(),
      text,
      source: "youtube" as const,
      tags: ["racing", "space opera"],
      category: 'Long "Film"',
      minSeconds: 600,
      maxSeconds: 3600,
    };
    assert.deepEqual(parseSearchQuery(encodeSearchQuery(q)).query, q);
  }
});

test('the largest supported model still round-trips escaped field values',()=>{
 const q={...emptySearchQuery(),text:'"'.repeat(300),tags:Array.from({length:8},(_,i)=>String(i)+'"'.repeat(79)),category:'"'.repeat(80),minSeconds:0,maxSeconds:604800};
 assert.deepEqual(parseSearchQuery(encodeSearchQuery(q)).query,q);
});
test("each chip removes only its constraint and preserves plain words", () => {
  const q = {
    ...emptySearchQuery(),
    text: "racing",
    source: "youtube" as const,
    tags: ["racing", "night"],
    category: "film",
    minSeconds: 600,
  };
  assert.equal(queryChips(q).length, 5);
  assert.deepEqual(removeQueryChip(q, "tag-0"), { ...q, tags: ["night"] });
  assert.deepEqual(removeQueryChip(q, "duration"), { ...q, minSeconds: null, maxSeconds: null });
  assert.equal(removeQueryChip(q, "source").text, "racing");
});
test("unsupported operators, future schemas, excessive fields and malformed quotes fail closed", async () => {
  for (const raw of [
    "viewers:100",
    "source:unknown",
    "source:youtube source:twitch",
    "duration:800..600",
    "duration:..",
    'tag:"unfinished',
    "x".repeat(1501),
    "tag:a ".repeat(9),
  ])
    assert(parseSearchQuery(raw).error, raw);
  for (const q of [
    { ...emptySearchQuery(), version: 2 },
    { ...emptySearchQuery(), unexpected: "x" },
    { ...emptySearchQuery(), minSeconds: -1 },
    { ...emptySearchQuery(), maxSeconds: Infinity },
  ])
    assert.throws(() => validateSearchQuery(q));
  let reads = 0,
    calls = 0;
  const catalog = new Proxy([video("one")], {
    get(t, k, r) {
      if (/^\d+$/.test(String(k))) reads++;
      return Reflect.get(t, k, r);
    },
  });
  const found = await structuredSearch(
    catalog,
    {},
    {},
    "unknown:bad",
    new AbortController().signal,
    true,
    async () => {
      calls++;
      return null;
    },
  );
  assert.equal(reads, 0);
  assert.equal(calls, 0);
  assert.deepEqual(found.ids, []);
});
test("sparse worker candidates apply constraints without reading the full catalog", async () => {
  const rows = Array.from({ length: 100000 }, (_, i) =>
    video(String(i), {
      duration: i === 99999 ? undefined : i === 90000 ? 599 : 600,
      remote: { kind: i === 99998 ? "twitch" : "youtube" },
    }),
  );
  let reads = 0;
  const catalog = new Proxy(rows, {
    get(t, k, r) {
      if (/^\d+$/.test(String(k))) reads++;
      return Reflect.get(t, k, r);
    },
  });
  const result = await structuredSearch(
    catalog,
    { "90001": ["racing"] },
    { "90001": "Film" },
    "evening source:youtube tag:racing category:film duration:600..600",
    new AbortController().signal,
    true,
    async (text) => {
      assert.equal(text, "evening");
      return {
        videos: catalog,
        ids: ["90000", "90001", "99998", "99999"],
        positions: new Uint32Array([90000, 90001, 99998, 99999]),
      };
    },
    async () => {},
  );
  assert.deepEqual(result.ids, ["90001"]);
  assert.deepEqual([...result.positions!], [90001]);
  assert.equal(reads, 4);
});
test("filter-only search needs no worker, excludes unknown durations and honors local files", async () => {
  const rows = [
    video("known", { duration: 600 }),
    video("unknown"),
    video("remote", { duration: 900, remote: { kind: "youtube" } }),
  ];
  const result = await structuredSearch(
    rows,
    {},
    {},
    "source:local duration:600..900",
    new AbortController().signal,
    true,
    async () => {
      throw Error("No text means no worker");
    },
    async () => {},
  );
  assert.deepEqual(result.ids, ["known"]);
});
test("worker failure uses existing word matcher; stale catalog offsets are rejected", async () => {
  const rows = [video("one"), video("two", { name: "Other" })];
  const found = await structuredSearch(
    rows,
    {},
    {},
    "racing source:local",
    new AbortController().signal,
    true,
    async () => null,
    async () => {},
  );
  assert.deepEqual(found.ids, ["one"]);
  const stale = await structuredSearch(
    rows,
    {},
    {},
    "racing source:local",
    new AbortController().signal,
    true,
    async () => ({ ids: ["old"], positions: new Uint32Array([0]), videos: [video("old")] }),
    async () => {},
  );
  assert.deepEqual(stale.ids, ["one"]);
});
test("cancellation stops filter-only scans and ignores late worker responses", async () => {
  const rows = Array.from({ length: 100000 }, (_, i) => video(String(i)));
  const controller = new AbortController();
  let turns = 0;
  await assert.rejects(
    structuredSearch(
      rows,
      {},
      {},
      "source:local",
      controller.signal,
      true,
      async () => null,
      async () => {
        if (++turns === 2) controller.abort();
      },
    ),
    { name: "AbortError" },
  );
  assert.equal(turns, 2);
  const late = new AbortController();
  await assert.rejects(
    structuredSearch(rows, {}, {}, "racing", late.signal, true, async () => {
      late.abort();
      return { videos: rows, ids: ["one"] };
    }),
    { name: "AbortError" },
  );
});
