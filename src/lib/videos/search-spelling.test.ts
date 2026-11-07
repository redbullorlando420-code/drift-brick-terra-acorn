import test from "node:test";
import assert from "node:assert/strict";
import { oneSearchEdit, suggestSearchSpelling, type SpellingInput } from "./search-spelling.ts";
import { parseSearchQuery } from "./search-query.ts";
import type { LibraryVideo } from "./types";
const row = (id: string, name: string, extra: Partial<LibraryVideo> = {}): LibraryVideo => ({
  id,
  name,
  path: id,
  folderId: "public",
  extension: "mp4",
  mime: "video/mp4",
  size: 0,
  addedAt: 1,
  ...extra,
});
const input = (videos: LibraryVideo[], query = "racign"): SpellingInput => ({
  videos,
  query,
  tags: {},
  categories: {},
  folders: [],
  hidden: {},
  unavailable: {},
  sourceId: "home",
  adultsUnlocked: false,
});
const run = (value: SpellingInput, turn = async () => {}) =>
  suggestSearchSpelling(value, new AbortController().signal, turn);
test("one code-point edit is bounded and supports insertion, deletion, substitution and transposition", () => {
  for (const [a, b] of [
    ["racign", "racing"],
    ["racin", "racing"],
    ["raacing", "racing"],
    ["racing", "pacing"],
    ["cafe", "café"],
    ["𐐨𐐩𐐪𐐫", "𐐨𐐩𐐪𐐬"],
  ])
    assert(oneSearchEdit(a!, b!), a + " " + b);
  for (const [a, b] of [
    ["racing", "racing"],
    ["rcng", "racing"],
    ["abcde", "abxyz"],
    ["abcd", "badc"],
  ])
    assert(!oneSearchEdit(a!, b!));
});
test("corrections need repeated visible evidence, never rewrite the original query, and preserve all filters", async () => {
  const videos = [row("a", "Racing racing"), row("b", "Racing"), row("c", "Racking")],
    base = input(videos, 'racign tag:"sport" category:"Film" duration:600..3600');
  const scoped = {
    ...base,
    tags: { a: ["sport"], b: ["sport"] },
    categories: { a: "Film", b: "Film" },
    videos: videos.map((v) => ({ ...v, duration: 1800 })),
  };
  const before = JSON.stringify(scoped),
    report = await run(scoped);
  assert.equal(report.suggestions[0]?.word, "racing");
  assert.equal(report.suggestions[0]?.titles, 2);
  assert.deepEqual(parseSearchQuery(report.suggestions[0]!.query).query, {
    ...parseSearchQuery(base.query).query,
    text: "racing",
  });
  assert.equal(JSON.stringify(scoped), before);
  assert.equal((await run(input([row("one", "Racing racing racing")]))).suggestions.length, 0);
});
test("hidden, unavailable, sample, private provider, recovered private and private-folder vocabulary stays out of public/guest scopes", async () => {
  const videos = [
    row("hidden", "Racing"),
    row("unavailable", "Racing"),
    row("sample", "Racing", { isSample: true }),
    row("private-provider", "Racing", { remote: { kind: "eporner" } }),
    row("retained", "Racing", { privateRetention: true }),
    row("folder", "Racing", { folderId: "secret" }),
  ];
  const value = {
    ...input(videos),
    hidden: { hidden: true as const },
    unavailable: { unavailable: true as const },
    folders: [{ id: "secret", name: "Secret", kind: "files" as const, videoCount: 1, adult: true }],
  };
  assert.equal((await run(value)).suggestions.length, 0);
  assert.equal((await run({ ...value, sourceId: "watch-room" })).suggestions.length, 0);
  assert.equal((await run({ ...value, sourceId: "adults", adultsUnlocked: false })).visible, 0);
  const privateReport = await run({ ...value, sourceId: "adults", adultsUnlocked: true });
  assert.equal(privateReport.suggestions[0]?.titles, 3);
});
test("source and field constraints restrict vocabulary, Unicode corrections stay distinct, and ordinary prefixes get no guesses", async () => {
  const videos = [
    row("a", "Soirée", { remote: { kind: "youtube" } }),
    row("b", "Soire\u0301e", { remote: { kind: "youtube" } }),
    row("c", "Racing", { remote: { kind: "twitch" } }),
    row("d", "Racing", { remote: { kind: "twitch" } }),
  ];
  assert.equal(
    (await run({ ...input(videos, "racign"), sourceId: "youtube" })).suggestions.length,
    0,
  );
  assert.equal(
    (await run({ ...input(videos, "racign source:twitch"), sourceId: "youtube" })).suggestions[0]
      ?.word,
    "racing",
  );
  assert.equal((await run(input(videos, "soiree"))).suggestions[0]?.word, "soirée");
  assert.equal((await run(input(videos, "soi"))).suggestions.length, 0);
  assert.equal((await run(input(videos, "raci"))).suggestions.length, 0);
});
test("a correction must co-occur with the other query words in at least two visible titles", async () => {
  const one = [row("a", "Racing evening"), row("b", "Racing morning")];
  assert.equal((await run(input(one, "racign evening"))).suggestions.length, 0);
  const two = [...one, row("c", "Racing evening")];
  const found = await run(input(two, "racign evening"));
  assert.equal(found.suggestions[0]?.titles, 2);
  assert.equal(parseSearchQuery(found.suggestions[0]!.query).query.text, "racing evening");
});
test("the 100k vocabulary scan yields, keeps at most 8192 terms and three deterministic candidates, and never reads notes or paths", async () => {
  const videos = Array.from({ length: 100000 }, (_, i) =>
    Object.defineProperties(row(String(i), i % 2 ? "Racing pacing facing tracing" : "Racing"), {
      path: {
        get() {
          throw Error("Do not read paths");
        },
      },
      description: {
        get() {
          throw Error("Do not read descriptions");
        },
      },
    }),
  );
  let turns = 0;
  const report = await run(input(videos, "racingz"), async () => {
    turns++;
  });
  assert(turns >= Math.ceil(videos.length / 128));
  assert(report.terms <= 8192);
  assert(report.suggestions.length <= 3);
  const many = Array.from({ length: 10000 }, (_, i) =>
    row(String(i), "word" + String.fromCodePoint(0x4e00 + i)),
  );
  const bounded = await run(input(many, "missing"));
  assert.equal(bounded.terms, 8192);
  assert(bounded.capped);
});
test("cancellation and invalid/oversized inputs do no discarded catalog work", async () => {
  const controller = new AbortController();
  let turns = 0;
  await assert.rejects(
    suggestSearchSpelling(
      input(Array.from({ length: 10000 }, (_, i) => row(String(i), "Racing"))),
      controller.signal,
      async () => {
        if (++turns === 2) controller.abort();
      },
    ),
    { name: "AbortError" },
  );
  assert.equal(turns, 2);
  const guarded = new Proxy([] as LibraryVideo[], {
    get() {
      throw Error("No scan for unsupported queries");
    },
  });
  for (const query of ["unknown:operator", "a b c d e", "source:youtube", "a".repeat(301), "abc"])
    assert.equal((await run(input(guarded, query))).terms, 0);
});
