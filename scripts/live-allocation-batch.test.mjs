import { test } from "node:test";
import assert from "node:assert/strict";
import { setImmediate as turn } from "node:timers/promises";
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
const { allocateYoutubeLive } = await import("../src/lib/videos/youtube-live-allocation.ts");
const { createPullScheduler } = await import("../src/lib/pull-scheduler.ts");
const { createDispatchTrace, pullDispatchTrace } =
  await import("../src/lib/pull-dispatch-trace.ts");
const { createYoutubeTransport } = await import("../src/lib/remote/youtube-transport.ts");
const { runPausablePull, setPullsPaused, setActivePullPage, cancelQueuedPulls } =
  await import("../src/lib/pull-control.ts");
const { updatePullSettings } = await import("../src/lib/pull-settings.ts");
const now = 10_000_000;
const creator = (i, live = false) => ({
  id: "yt:UC" + String(i).padStart(22, "0"),
  channelId: "UC" + String(i).padStart(22, "0"),
  kind: "youtube",
  title: "Creator " + i,
  handle: "creator" + i,
  live,
  liveCheckedAt: now - 300001,
});
const allocate = (rows, count = 8, at = now) => allocateYoutubeLive(rows, count, at, 60000, 300000);
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
};

test("allocation adapts to debt, urgent live and recent discovery failures without raising the slot ceiling", () => {
  const live = Array.from({ length: 8 }, (_, i) => ({
    ...creator(i, true),
    liveCheckedAt: now - 120000,
  }));
  let result = allocate([...live, ...Array.from({ length: 40 }, (_, i) => creator(i + 8))]);
  assert.equal(result.allocation.reason, "discovery-debt");
  assert.equal(result.allocation.liveSlots, 2);
  assert.equal(result.allocation.discoverySlots, 6);
  const discovery = Array.from({ length: 8 }, (_, i) => creator(i + 8));
  result = allocate([...live, ...discovery]);
  assert.equal(result.allocation.reason, "urgent-live");
  assert.equal(result.allocation.discoverySlots, 2);
  for (const c of discovery) c.lastLiveFailure = { at: now - 1000, retryAt: now - 1 };
  result = allocate([...live, ...discovery]);
  assert.equal(result.allocation.reason, "discovery-recovery");
  assert.equal(result.allocation.discoverySlots, 6);
  assert.equal(result.allocation.discovery.failed5m, 8);
  assert.equal(result.allocation.knownLive.successful5m, 8);
  const excluded = new Set(live.map((c) => c.id));
  assert.equal(
    allocateYoutubeLive([...live, ...discovery], 8, now, 60000, 300000, excluded).allocation
      .knownLive.successful5m,
    8,
    "in-flight exclusion cannot erase population measurements",
  );
  assert.equal(result.allocation.discovery.oldestDueMs, 300001);
  for (let limit = 0; limit < 25; limit++) {
    result = allocate([...live, ...discovery], limit);
    assert(result.channels.length <= limit);
    assert.equal(new Set(result.channels.map((c) => c.id)).size, result.channels.length);
    if (limit >= 2)
      assert(
        result.allocation.discoverySlots >= Math.ceil(limit * 0.25) ||
          result.allocation.discoverySlots === discovery.length,
      );
  }
  assert.equal(allocate(live, -1).channels.length, 0);
  assert.equal(allocate(live, NaN).channels.length, 0);
});

test("2k mixed creators reach every eligible tail in 400 simulated one-second dispatches despite a permanently failing prefix", () => {
  const rows = Array.from({ length: 2000 }, (_, i) => creator(i, i < 160)),
    seen = new Set(),
    firstSeen = new Map();
  // 24 slow in-flight creators are excluded by the existing sweep attempted set.
  const held = new Set(rows.slice(160, 184).map((c) => c.id));
  for (let batch = 0; batch < 400; batch++) {
    const at = now + batch * 1000,
      result = allocate(
        rows.filter((c) => !held.has(c.id)),
        8,
        at,
      );
    assert(result.channels.length <= 8);
    if (result.allocation.knownLive.due && result.allocation.discovery.due)
      assert(result.allocation.discoverySlots >= 2);
    for (const c of result.channels) {
      seen.add(c.id);
      if (!firstSeen.has(c.id)) firstSeen.set(c.id, batch);
      if (Number(c.handle.slice(7)) < 760)
        c.lastLiveFailure = { at, retryAt: at, kind: "unavailable" };
      else {
        c.liveCheckedAt = at;
        c.lastLiveFailure = undefined;
      }
    }
  }
  assert.equal(seen.size, 1976);
  assert(firstSeen.get(rows.at(-1).id) < 400);
  assert(!seen.has(rows[160].id));
  assert.equal(rows[0].liveCheckedAt, now - 300001, "failure never advances successful freshness");
});

test("single-slot selection uses attempt age and retry waits remain absolute", () => {
  const live = creator(1, true),
    discovery = creator(2);
  let result = allocate([live, discovery], 1);
  assert.equal(result.channels[0], live);
  live.lastLiveFailure = { at: now, retryAt: now };
  result = allocate([live, discovery], 1);
  assert.equal(result.channels[0], discovery);
  discovery.lastLiveFailure = { at: now, retryAt: now + 1000 };
  assert(!allocate([live, discovery]).channels.includes(discovery));
  discovery.importNeedsReview = true;
  assert(!allocate([discovery], 8, now + 2000).channels.length);
});

test("FIFO eligible order survives repeated page changes and pause-bypass traffic; already-started work drains", async () => {
  let available = true,
    page = "youtube";
  const gate = deferred(),
    starts = [],
    trace = createDispatchTrace();
  const scheduler = createPullScheduler(
    () => ({ concurrency: 1, gapMs: 0 }),
    (ignore) => available || ignore,
    20,
    { trace: (op) => trace.begin("catalog", op) },
  );
  const first = scheduler.run(async () => {
    starts.push("first");
    await gate.promise;
    return "accepted";
  });
  const archive = scheduler.run(
    async () => {
      starts.push("archive");
      return "archive";
    },
    { canStart: () => page === "youtube" },
  );
  const clips = scheduler.run(
    async () => {
      starts.push("clips");
      return "clips";
    },
    { operation: "clips", ignorePause: true },
  );
  const details = scheduler.run(
    async () => {
      starts.push("details");
      return "details";
    },
    { operation: "details", ignorePause: true },
  );
  for (let i = 0; i < 50; i++) {
    page = i % 2 ? "youtube" : "live";
    scheduler.wake();
  }
  page = "youtube";
  available = false;
  gate.resolve();
  await turn();
  assert(trace.snapshot().some((e) => e.phase === "held"));
  available = true;
  scheduler.wake();
  assert.deepEqual(await Promise.all([first, archive, clips, details]), [
    "accepted",
    "archive",
    "clips",
    "details",
  ]);
  assert.deepEqual(starts, ["first", "archive", "clips", "details"]);
  assert(
    trace
      .snapshot()
      .filter((e) => e.phase === "started")
      .every((e) => e.waitedMs >= 0),
  );
});

test("actual Live app lane starts within 250ms while archive transport is held, and only undispatched automatic work is deferred", async () => {
  updatePullSettings({ requestGapMs: 250, pauseWhileWatching: false });
  setPullsPaused(false);
  setActivePullPage("youtube");
  const gate = deferred(),
    starts = [];
  const archive = runPausablePull(
    async () => {
      starts.push("archive");
      await gate.promise;
      return "saved";
    },
    { provider: "youtube", automatic: true },
  );
  const queued = runPausablePull(
    async () => {
      starts.push("queued");
      return "should defer";
    },
    { provider: "youtube", automatic: true },
  );
  const rejected = assert.rejects(queued, /deferred/);
  setActivePullPage("live");
  const began = performance.now();
  const result = await runPausablePull(
    async () => {
      starts.push("live");
      return "fresh";
    },
    { provider: "youtube", live: true },
  );
  assert.equal(result, "fresh");
  assert(performance.now() - began < 250);
  assert.deepEqual(starts, ["archive", "live"]);
  gate.resolve();
  assert.equal(await archive, "saved");
  await rejected;
  const events = pullDispatchTrace.snapshot();
  assert(events.some((e) => e.lane === "catalog" && e.phase === "deferred"));
  assert(events.some((e) => e.lane === "youtube live" && e.phase === "started"));
  cancelQueuedPulls();
  setActivePullPage("");
});

test("actual upstream live reads bypass a held archive, preserve cooldowns and expose redacted queued versus started evidence", async () => {
  let at = now;
  const gate = deferred(),
    calls = [];
  const transport = createYoutubeTransport({
    now: () => at,
    gapMs: () => 0,
    liveGapMs: () => 0,
    fetch: async (url) => {
      calls.push(url);
      if (url.includes("archive")) await gate.promise;
      return new Response("ok");
    },
  });
  const archive = transport.request("https://www.youtube.com/youtubei/v1/archive");
  await turn();
  const queued = transport.request("https://www.youtube.com/youtubei/v1/archive-two");
  const live = await transport.request("https://www.youtube.com/youtubei/v1/browse", {
    scope: "live",
  });
  assert.equal(await live.text(), "ok");
  assert.equal(calls.length, 2);
  const events = transport.diagnostics();
  assert(
    events.some(
      (e) =>
        e.operation === "archive" &&
        e.phase === "queued" &&
        !events.some((s) => s.id === e.id && s.phase === "started"),
    ),
  );
  assert(!JSON.stringify(events).includes("https:"));
  assert.throws(
    () =>
      transport.accept(
        new Response("wait", { status: 429, headers: { "retry-after": "600" } }),
        at,
        "live",
      ),
    /429/,
  );
  await assert.rejects(
    transport.request("https://www.youtube.com/youtubei/v1/browse", { scope: "live" }),
    /429/,
  );
  assert.equal(calls.length, 2);
  gate.resolve();
  await Promise.all([archive, queued]);
  assert(transport.retryAt("live") > at, "archive success cannot clear live wait");
});

test("dispatch trace stays bounded through 100 cycles and adding diagnostics performs no network or storage writes", async () => {
  let clock = 100;
  const trace = createDispatchTrace(() => clock++),
    scheduler = createPullScheduler(
      () => ({ concurrency: 1, gapMs: 0 }),
      () => true,
      8,
      { trace: (op) => trace.begin("catalog", op) },
    );
  for (let i = 0; i < 100; i++) assert.equal(await scheduler.run(async () => i), i);
  assert.equal(trace.snapshot().length, 64);
  assert.equal(trace.snapshot().at(-1).phase, "complete");
  assert.deepEqual(Object.keys(trace.snapshot()[0]).sort(), [
    "at",
    "id",
    "lane",
    "operation",
    "phase",
    "waitedMs",
  ]);
});
