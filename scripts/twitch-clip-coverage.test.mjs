import test from "node:test";
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
const { walkTwitchClips } = await import("../src/lib/remote/twitch-clips.ts");
const { normalizeFollowCheckpoints } = await import("../src/lib/videos/follow-checkpoints.ts");
const { clipCoverageSummary, clipWindowStop, clipCoverageAction } =
  await import("../src/lib/videos/twitch-clip-coverage.ts");
const page = (ids, next) => ({
  edges: ids.map((slug) => ({ node: { slug } })),
  pageInfo: { hasNextPage: !!next, endCursor: next },
});
const base = {
  limit: 6,
  maxPages: 8,
  variety: true,
  recentOnly: true,
  gap: async () => {},
  now: () => 1000,
};
test("sparse shelves record requested versus returned counts and real public exhaustion", async () => {
  const r = await walkTwitchClips({ ...base, read: async (p) => page([String(p)]) });
  assert.equal(r.diagnostics.requested, 6);
  assert.equal(r.diagnostics.accepted, 3);
  assert.equal(r.diagnostics.stopReason, "exhausted");
  assert.equal(r.diagnostics.maxPages, 8);
  assert(r.diagnostics.windows.every((w) => w.stop === "exhausted" && w.requested > 0));
  assert.match(clipCoverageSummary(r.diagnostics).detail, /does not prove/);
});
test("duplicate-heavy continuations consume the fixed page allowance without false exhaustion", async () => {
  let reads = 0;
  const r = await walkTwitchClips({
    ...base,
    limit: 500,
    read: async () => page(["same"], "next-" + ++reads),
  });
  assert.equal(reads, 8);
  assert.equal(r.diagnostics.accepted, 1);
  assert.equal(r.diagnostics.duplicates, 7);
  assert.equal(r.diagnostics.stopReason, "page-budget");
  assert.match(clipCoverageSummary(r.diagnostics).detail, /Overlapping/);
  assert.equal(r.diagnostics.windows.length, 3);
  const unvisited = await walkTwitchClips({ ...base, maxPages: 1, read: async () => page([]) });
  assert.equal(unvisited.diagnostics.stopReason, "page-budget");
});
test("filled per-window quotas differ from page limits and preserve older continuation", async () => {
  let seq = 0;
  const r = await walkTwitchClips({
    ...base,
    read: async (_p, n) =>
      page(
        Array.from({ length: n }, () => String(seq++)),
        "next-" + seq,
      ),
  });
  assert.equal(r.diagnostics.stopReason, "quota");
  assert(r.diagnostics.windows.every((w) => w.stop === "quota"));
  assert.equal(r.diagnostics.accepted, 6);
  assert.equal(
    r.diagnostics.windows.reduce((sum, w) => sum + w.requested, 0),
    6,
  );
  const older = await walkTwitchClips({
    ...base,
    variety: false,
    limit: 2,
    read: async () => page(["a", "b"], "keep"),
  });
  assert.equal(JSON.parse(older.cursor).after, "keep");
  assert.equal(older.diagnostics.stopReason, "quota");
});
test("partial window failures and provider holds produce different bounded explanations", async () => {
  let calls = [];
  const partial = await walkTwitchClips({
    ...base,
    read: async (p) => {
      calls.push(p);
      if (p === "LAST_WEEK") throw Error("Temporary weekly service error");
      return page([String(p)]);
    },
  });
  assert.equal(calls.length, 3);
  assert.equal(partial.diagnostics.stopReason, "partial-error");
  assert.equal(partial.clips.length, 2);
  assert.match(clipCoverageSummary(partial.diagnostics).detail, /healthy windows continued/);
  calls = [];
  const held = await walkTwitchClips({
    ...base,
    read: async (p) => {
      calls.push(p);
      throw Error("Twitch HTTP 429");
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(held.diagnostics.stopReason, "provider-hold");
  assert.match(clipCoverageSummary(held.diagnostics).label, /wait/);
});
test("legacy snapshots retain uncertainty while new evidence survives reload without unbounded fields", async () => {
  const r = await walkTwitchClips({
    ...base,
    read: async () => {
      throw Error("x".repeat(1000));
    },
  });
  const raw = {
    ...r.diagnostics,
    cacheHit: true,
    servedAt: 2000,
    secret: "discard",
    windows: r.diagnostics.windows.map((w) => ({ ...w, secret: "discard" })),
  };
  const normalized = normalizeFollowCheckpoints({
    twitchClipDiagnostics: JSON.parse(JSON.stringify(raw)),
  }).twitchClipDiagnostics;
  assert.equal(normalized.requested, 6);
  assert.equal(normalized.stopReason, "partial-error");
  assert.equal(normalized.cacheHit, true);
  assert.equal(normalized.servedAt, 2000);
  assert(!("secret" in normalized));
  assert(!("secret" in normalized.windows[0]));
  assert.equal(normalized.windows[0].error.length, 240);
  const legacy = {
    at: 1000,
    mode: "recent",
    pages: 1,
    received: 1,
    accepted: 1,
    duplicates: 0,
    windows: [
      { period: "CURRENT", pages: 1, received: 1, accepted: 1, duplicates: 0, stop: "budget" },
    ],
  };
  const saved = normalizeFollowCheckpoints({ twitchClipDiagnostics: legacy }).twitchClipDiagnostics;
  assert.equal(saved.requested, undefined);
  assert.equal(saved.stopReason, undefined);
  assert.match(clipCoverageSummary(saved).label, /unrecorded/);
  assert.match(clipWindowStop(saved.windows[0].stop), /legacy/);
  assert.equal(
    normalizeFollowCheckpoints({
      twitchClipDiagnostics: { ...raw, windows: [...raw.windows, ...raw.windows] },
    }).twitchClipDiagnostics,
    undefined,
  );
  assert.equal(
    normalizeFollowCheckpoints({ twitchClipDiagnostics: { ...raw, at: 1e100 } })
      .twitchClipDiagnostics,
    undefined,
  );
});
test("focused recovery honors separate recent/older waits and completed positions", () => {
  const c = {
    kind: "twitch",
    id: "tw:a",
    handle: "a",
    title: "A",
    twitchClipRecentRetry: { retryAt: 2000, attempts: 1 },
  };
  const before = structuredClone(c);
  assert.equal(clipCoverageAction(c, "recent", 1000).allowed, false);
  assert.equal(clipCoverageAction(c, "archive", 1000).allowed, true);
  assert.equal(clipCoverageAction(c, "recent", 2000).allowed, true);
  assert.equal(
    clipCoverageAction({ ...c, twitchClipExhaustedAt: 1 }, "archive", 3000).allowed,
    false,
  );
  assert.deepEqual(c, before);
});
test("actual clip API labels a warm cache without advancing the original provider observation", async () => {
  const { runFollowRemote } = await import("../src/lib/remote/api.ts");
  const original = globalThis.fetch;
  let reads = 0;
  try {
    globalThis.fetch = async (_u, init) => {
      reads++;
      const p = JSON.parse(init.body);
      return Response.json({
        data: {
          user: p.query.includes("clips(")
            ? { clips: page(["cache-" + String(p.query.match(/period:(\w+)/)?.[1] ?? "current")]) }
            : { id: "cache-user", displayName: "Cache creator" },
        },
      });
    };
    const data = {
      query: "coverage_cache_fixture",
      kind: "twitch",
      twitchClipMode: "recent",
      clipLimit: 6,
    };
    const first = await runFollowRemote(data),
      readCount = reads;
    assert.equal(first.channel.twitchClipDiagnostics.cacheHit, false);
    await new Promise((r) => setTimeout(r, 5));
    const second = await runFollowRemote(data);
    assert.equal(reads, readCount);
    assert.equal(second.channel.twitchClipDiagnostics.cacheHit, true);
    assert.equal(second.channel.twitchClipDiagnostics.at, first.channel.twitchClipDiagnostics.at);
    assert.equal(second.channel.twitchClipRecentCheckedAt, first.channel.twitchClipRecentCheckedAt);
    assert(
      second.channel.twitchClipDiagnostics.servedAt >= first.channel.twitchClipDiagnostics.servedAt,
    );
    assert.equal(first.channel.twitchClipDiagnostics.cacheHit, false);
  } finally {
    globalThis.fetch = original;
  }
});
