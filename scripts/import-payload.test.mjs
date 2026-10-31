import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const { parseProviderJson, providerJsonSamples } =
  await import("../src/lib/remote/provider-json.ts");
const { PROVIDER_BUDGETS, ProviderBudgetError } = await import("../src/lib/provider-budgets.ts");
const { projectYoutubeRenderer, projectTwitchArchiveUser } =
  await import("../src/lib/remote/provider-projection.ts");
const { youtubeInitialData, youtubeVideoRenderers } =
  await import("../src/lib/remote/youtube-page-data.ts");
const { pageJson } = await import("../src/lib/remote/youtube-live.ts");
const { walkTwitchArchive } = await import("../src/lib/remote/twitch-archive-walk.ts");
const { mergeRemoteRefreshAsync } = await import("../src/lib/videos/remote-merge.ts");
const {
  emptyImportReview,
  cleanImportReview,
  importReviewRow,
  reviewedImportBatch,
  importReviewWindow,
} = await import("../src/lib/videos/import-review.ts");
const { emptyImportSession, cleanImportSession, mergeImportSessions } =
  await import("../src/lib/videos/import-session.ts");
test("10k review keeps names held, saved identities skipped and each explicit batch bounded", () => {
  const queries = Array.from({ length: 10000 }, (_, i) =>
      i % 2 ? "Creator Name " + i : "@creator" + i,
    ),
    state = emptyImportReview(),
    resolved = new Set(["creator0"]);
  const rows = queries.map((query) => importReviewRow("youtube", query, state, resolved));
  assert.equal(rows.filter((row) => row.status === "held").length, 5000);
  const batch = reviewedImportBatch("youtube", queries, state, resolved);
  assert.equal(batch.length, 50);
  assert(batch.every((item) => item.query.startsWith("@") && item.query !== "@creator0"));
  state.choices["creator name 1"] = "include";
  assert(
    reviewedImportBatch("youtube", queries, state, resolved).some(
      (item) => item.query === "Creator Name 1",
    ),
  );
  for (let scroll = 0; scroll < 1120000; scroll += 10201) {
    const window = importReviewWindow(10000, scroll);
    assert(window.end - window.start <= 10);
    assert(window.end <= 10000);
  }
});
test("choices, errors, filter and logical keyboard anchor survive session cleaning and disk merge", () => {
  const review = emptyImportReview();
  Object.assign(review, {
    filter: "name",
    status: "held",
    focusKey: "creator name 7",
    choices: { "creator name 7": "skip" },
    failures: { "creator name 9": "Multiple public matches; supply an exact link." },
  });
  const session = {
    ...emptyImportSession("youtube"),
    draft: "Creator Name 7\nCreator Name 9",
    review,
    updatedAt: 20,
  };
  const cleaned = cleanImportSession(JSON.parse(JSON.stringify(session)), "youtube");
  assert.deepEqual(cleaned.review, review);
  assert.deepEqual(mergeImportSessions({ ...session, updatedAt: 1 }, cleaned).review, review);
  assert.equal(cleanImportSession(emptyImportSession("twitch"), "twitch").review, undefined);
});
test("failed rows retry only explicitly and choices do not select prototype names accidentally", () => {
  const state = emptyImportReview(),
    queries = ["@fresh", "Ambiguous Name", "@failed"];
  state.failures.failed = "Try later";
  assert.deepEqual(
    reviewedImportBatch("youtube", queries, state, new Set()).map((row) => row.query),
    ["@fresh"],
  );
  assert.deepEqual(
    reviewedImportBatch("youtube", queries, state, new Set(), true).map((row) => row.query),
    ["@failed"],
  );
  assert.equal(importReviewRow("twitch", "__proto__", state, new Set()).status, "ready");
  const excessive = {
    ...state,
    choices: Object.fromEntries(
      Array.from({ length: 10000 }, (_, i) => ["x".repeat(990) + i, "include"]),
    ),
    failures: Object.fromEntries(Array.from({ length: 1000 }, (_, i) => ["f" + i, "error"])),
  };
  const clean = cleanImportReview(excessive);
  assert(Object.keys(clean.choices).length < 1100);
  assert.equal(Object.keys(clean.failures).length, 128);
});
test("JSON preflight counts UTF-8 and quoted delimiters without changing valid metadata", () => {
  const source = { title: '温泉 café 🏎️ { [ \\"', list: [1, true, null, { count: 2 }] },
    raw = JSON.stringify(source);
  assert.deepEqual(parseProviderJson(raw, "youtube"), source);
  const sample = providerJsonSamples().at(-1);
  assert.equal(sample.rawBytes, Buffer.byteLength(raw));
  assert(sample.estimatedScratchBytes <= PROVIDER_BUDGETS.json.scratchBytes);
});
test("valid oversized token, depth and string graphs are rejected before JSON.parse allocation", () => {
  const cases = [
    JSON.stringify(new Array(PROVIDER_BUDGETS.json.tokens + 1).fill(0)),
    "[".repeat(97) + "0" + "]".repeat(97),
    JSON.stringify({ title: "x".repeat(PROVIDER_BUDGETS.json.stringUnits + 1) }),
  ];
  for (const raw of cases) {
    const original = JSON.parse;
    let parsed = false;
    JSON.parse = (...args) => {
      parsed = true;
      return original(...args);
    };
    try {
      assert.throws(
        () => parseProviderJson(raw),
        (e) => e instanceof ProviderBudgetError && e.budget === "graph",
      );
      assert.equal(parsed, false);
    } finally {
      JSON.parse = original;
    }
  }
  assert.throws(() => youtubeInitialData("var ytInitialData = " + cases[2]), ProviderBudgetError);
  assert.throws(
    () => pageJson("var ytInitialData = " + cases[2], "ytInitialData"),
    ProviderBudgetError,
  );
});
test("retained archive projections drop unused nested trees and preserve consumed format/date fields", () => {
  const junk = { tracking: new Array(1000).fill({ large: "unused" }) },
    raw = {
      videoId: "video000001",
      title: { runs: [{ text: "A title", navigationEndpoint: junk }] },
      publishedTimeText: { simpleText: "2026-10-28" },
      lengthText: { simpleText: "1:02:03" },
      thumbnail: {
        thumbnails: [{ url: "https://i.ytimg.com/vi/video000001/hqdefault.jpg", junk }],
      },
      navigationEndpoint: { reelWatchEndpoint: { videoId: "video000001", junk } },
      junk,
    };
  const projected = projectYoutubeRenderer(raw),
    actual = youtubeVideoRenderers([{ videoRenderer: raw }], 100)[0];
  assert.deepEqual(actual, projected);
  assert.equal(actual.title.simpleText, "A title");
  assert(actual.navigationEndpoint.reelWatchEndpoint);
  assert(!JSON.stringify(actual).includes("tracking"));
  const twitch = projectTwitchArchiveUser({
    id: "1",
    displayName: "Fixture",
    junk,
    videos: {
      edges: [{ cursor: "next", node: { id: "1", title: "VOD", junk } }],
      pageInfo: { hasNextPage: true, endCursor: "next", junk },
      junk,
    },
  });
  assert.equal(twitch.videos.edges[0].node.id, "1");
  assert(!JSON.stringify(twitch).includes("tracking"));
});
test("a rejected later graph retains the accepted Twitch page and its safe continuation", async () => {
  let calls = 0;
  const raw = JSON.stringify({
    id: "1",
    displayName: "Fixture",
    videos: {
      edges: [{ cursor: "next", node: { id: "one", title: "VOD" } }],
      pageInfo: { hasNextPage: true, endCursor: "next" },
    },
  });
  const result = await walkTwitchArchive({
    limit: 200,
    maxPages: 3,
    pageSize: 100,
    gap: async () => {},
    read: async () => {
      if (calls++) return parseProviderJson(JSON.stringify(new Array(120001).fill(0)));
      return projectTwitchArchiveUser(parseProviderJson(raw, "twitch"));
    },
  });
  assert.equal(result.edges.length, 1);
  assert.equal(result.edges[0].node.id, "one");
  assert(result.cursor);
  assert.equal(result.exhaustedAt, undefined);
  assert.equal(result.diagnostics.stopReason, "provider-error");
  assert.match(result.diagnostics.error, /budget/);
});
test("a metadata refresh over 100k saved rows preserves every unchanged card reference", async () => {
  const videos = Array.from({ length: 100000 }, (_, i) => ({
    id: "yt:v" + i,
    folderId: "yt:fixture",
    name: "Video " + i,
    path: "youtube/" + i,
    size: 0,
    extension: "yt",
    mime: "video/youtube",
    addedAt: 0,
    remote: { kind: "youtube", videoId: "v" + i, publishedSource: "unknown" },
  }));
  const result = await mergeRemoteRefreshAsync(
    videos,
    [{ ...videos[50000], remote: { ...videos[50000].remote } }],
    ["yt:fixture"],
    new Set(),
    { turn: async () => {} },
  );
  assert.equal(result.length, 100000);
  for (let i = 0; i < videos.length; i++) assert.equal(result[i], videos[i]);
  for (let i = 0; i < 30; i++) parseProviderJson('{"ok":true}', "twitch");
  assert.equal(providerJsonSamples().length, 16);
  assert(!JSON.stringify(providerJsonSamples()).includes("https://"));
});

test("failed decisions remain held for explicit retry after old reason strings are evicted", () => {
  const state = emptyImportReview(),
    queries = Array.from({ length: 200 }, (_, i) => "@failed" + i);
  for (let i = 0; i < 200; i++) {
    state.choices["failed" + i] = "failed";
    state.failures["failed" + i] = "Retry required";
  }
  const clean = cleanImportReview(state);
  assert.equal(Object.keys(clean.failures).length, 128);
  assert.equal(reviewedImportBatch("youtube", queries, clean, new Set()).length, 0);
  assert.equal(reviewedImportBatch("youtube", queries, clean, new Set(), true).length, 50);
  const active = cleanImportReview(
    { ...clean, choices: { ...clean.choices, newname: "include" } },
    new Set(["newname"]),
  );
  assert.deepEqual(active.choices, { newname: "include" });
});
test("projection rejects overlong canonical identities and cursors instead of truncating them", () => {
  assert.throws(() => projectYoutubeRenderer({ videoId: "x".repeat(129) }), ProviderBudgetError);
  assert.throws(
    () =>
      projectTwitchArchiveUser({
        id: "1",
        videos: { pageInfo: { endCursor: "x".repeat(16385) }, edges: [] },
      }),
    ProviderBudgetError,
  );
  assert.equal(
    parseProviderJson(JSON.stringify({ text: "x".repeat(PROVIDER_BUDGETS.json.stringUnits) })).text
      .length,
    PROVIDER_BUDGETS.json.stringUnits,
  );
});
