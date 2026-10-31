import assert from "node:assert/strict";
import { test } from "node:test";
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
const { createRankingPass, scheduleRankingStart, rankingBudgetSnapshot, RANKING_BUDGET } =
  await import("../src/lib/ranking-budget.ts");
const { createTransferAccounting } = await import("../src/lib/transfer-accounting.ts");
const { prepareTwitchRecommendationScore } =
  await import("../src/lib/videos/twitch-recommendations.ts");
const { rankTwitchVods } = await import("../src/lib/videos/twitch-vod-ranking.ts");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
test("rapid revisions avoid worker/feedback starts and only the final revision publishes", async () => {
  const published = [],
    started = [];
  let cancel = () => {};
  for (let i = 0; i < 30; i++) {
    cancel();
    cancel = scheduleRankingStart("youtube", (pass, signal) => {
      started.push(i);
      void pass
        .visit(
          Array.from({ length: 1000 }, (_, i) => i),
          () => {},
        )
        .then(() => {
          if (!signal.aborted) {
            published.push(i);
            pass.finish();
          }
        });
    });
  }
  await wait(250);
  cancel();
  assert.deepEqual(started, [29]);
  assert.deepEqual(published, [29]);
  assert(rankingBudgetSnapshot().coalesced >= 29);
});
test("running cancellation stops reads and cannot publish an obsolete ranking", async () => {
  const controller = new AbortController(),
    pass = createRankingPass("twitch", controller.signal);
  let count = 0,
    turns = 0;
  await assert.rejects(
    pass.visit(
      new Array(100000).fill(1),
      () => count++,
      async () => {
        if (++turns === 3) controller.abort();
      },
    ),
  );
  assert(count <= 512);
  assert.equal(rankingBudgetSnapshot().samples.at(-1).outcome, "cancelled");
});
test("slices honor time and row ceilings and diagnostics retain no catalog references", async () => {
  let time = 0,
    turns = 0;
  const pass = createRankingPass("youtube", new AbortController().signal, () => time);
  await pass.visit(
    Array.from({ length: 1000 }, (_, i) => i),
    () => {
      time += 1;
    },
    async () => {
      turns++;
    },
  );
  pass.finish();
  const sample = rankingBudgetSnapshot().samples.at(-1);
  assert.equal(sample.rows, 1000);
  assert(sample.maxSliceMs <= 3);
  assert(turns >= 334);
  for (let i = 0; i < 40; i++) createRankingPass("youtube", new AbortController().signal).finish();
  assert.equal(rankingBudgetSnapshot().samples.length, 32);
  assert(!JSON.stringify(rankingBudgetSnapshot()).includes("videoId"));
});
test("100k Twitch ranking keeps exact ordering and references with cooperative preparation", async () => {
  const rows = Array.from({ length: 100000 }, (_, i) => ({
    id: "tw:v:" + i,
    folderId: "tw:fixture",
    name: "Race " + i,
    path: "",
    size: 0,
    mime: "video/twitch",
    extension: "vod",
    addedAt: 100000 - i,
    remote: { kind: "twitch", videoId: String(i), channelName: "fixture" },
  }));
  const taste = {
    tags: {},
    favorites: {},
    likes: {},
    viewCounts: {},
    rating: (id) => (id === "tw:v:7" ? 5 : 0),
    watchScore: () => 0,
    now: 100000,
  };
  const controller = new AbortController(),
    pass = createRankingPass("twitch", controller.signal),
    turn = async () => {};
  const score = await prepareTwitchRecommendationScore(rows, taste, controller.signal, turn, pass),
    ranked = await rankTwitchVods(rows, score, controller.signal, turn, pass);
  pass.finish();
  const expected = rows.slice().sort((a, b) => score(b) - score(a) || b.addedAt - a.addedAt);
  assert.equal(ranked.length, 100000);
  for (let i = 0; i < ranked.length; i++) assert.equal(ranked[i], expected[i]);
  const report = rankingBudgetSnapshot().samples.at(-1);
  assert.equal(report.rows, 300000);
  assert(report.slices >= Math.ceil(300000 / RANKING_BUDGET.sliceRows));
});
test("accounting separates measured browser transfers from hidden iframe/media and native totals", () => {
  const ledger = createTransferAccounting("http://localhost:8080"),
    record = (name, type, transferSize, encodedBodySize = transferSize) =>
      ledger.record({ name, initiatorType: type, transferSize, encodedBodySize });
  record("/_serverFn/private?token=secret", "fetch", 1200);
  record("https://cdn.test/private.jpg", "img", 0, 0);
  record("https://cdn.test/cache.jpg", "img", 0, 400);
  record("http://127.0.0.1:43123/health", "fetch", 700);
  record("https://player.twitch.tv/?channel=private", "iframe", 2000);
  record("/video.mp4", "video", 3000);
  record("/assets/script.js", "script", 500);
  record("blob:secret", "img", 100);
  record("/models/model.bin", "fetch", 1000);
  const report = ledger.snapshot(),
    by = Object.fromEntries(report.classes.map((r) => [r.kind, r]));
  assert.equal(report.observed, 6);
  assert.equal(by.metadata.transferBytes, 1200);
  assert.equal(by.artwork.unmeasuredRequests, 1);
  assert.equal(by.artwork.measuredRequests, 1);
  assert.equal(by.embed.transferBytes, 0);
  assert.equal(by.media.unmeasuredRequests, 1);
  assert.equal(by.companion.transferBytes, 700);
  assert(!JSON.stringify(report).includes("secret"));
});
test("fixed accounting storage stays bounded across 100k resource records", () => {
  const ledger = createTransferAccounting("https://app.test");
  for (let i = 0; i < 100000; i++)
    ledger.record({
      name: "https://cdn.test/" + i,
      initiatorType: "img",
      transferSize: 42,
      encodedBodySize: 20,
    });
  const report = ledger.snapshot();
  assert.equal(report.classes.length, 5);
  assert.equal(report.classes.find((r) => r.kind === "artwork").transferBytes, 4200000);
  assert(JSON.stringify(report).length < 1000);
});
test("Save Data pauses nearby artwork and code prefetch, preserves visible admission and resumes without a poll", async () => {
  const saved = new Map(),
    connection = Object.assign(new EventTarget(), { saveData: false });
  Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
  globalThis.window = Object.assign(new EventTarget(), { setTimeout, clearTimeout });
  globalThis.document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  globalThis.localStorage = {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
  };
  const data = await import("../src/lib/data-saver.ts"),
    images = await import("../src/lib/videos/image-load-budget.ts"),
    routes = await import("../src/lib/warm-route-cache.ts");
  data.setDataSaverMode("save-data");
  const overlays = await import("../src/components/library/video-overlay-loader.ts");
  overlays.warmVideoPreview();
  overlays.warmVideoPlayer();
  let near = false,
    visible = false;
  const stopNear = images.watchImageSlot({ priority: "low" }, (value) => {
      near = value;
    }),
    stopVisible = images.watchImageSlot({ priority: "high" }, (value) => {
      visible = value;
    });
  assert.equal(near, false);
  assert.equal(visible, true);
  assert.equal(routes.shouldWarmHubRoute({ visible: true }), false);
  data.setDataSaverMode("adaptive");
  assert.equal(near, true);
  assert.equal(visible, true);
  assert.equal(routes.shouldWarmHubRoute({ visible: true }), true);
  data.setDataSaverMode("save-data");
  assert.equal(near, false);
  assert.equal(visible, true);
  assert.equal(images.getImageLoadBudgetSnapshot().queuedLow, 1);
  data.setDataSaverMode("adaptive");
  connection.saveData = true;
  connection.dispatchEvent(new Event("change"));
  assert.equal(near, false);
  assert.equal(visible, true);
  connection.saveData = false;
  connection.dispatchEvent(new Event("change"));
  assert.equal(near, true);
  stopNear();
  stopVisible();
  assert.equal(images.getImageLoadBudgetSnapshot().active, 0);
  localStorage.setItem = () => {
    throw Error("denied");
  };
  data.setDataSaverMode("save-data");
  assert.equal(data.dataSaverActive(), true);
});
