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
const { mergeTwitchClipObservation, retainNewerTwitchClipFollow } =
  await import("../src/lib/videos/twitch-clip-freshness.ts");
const merges = await import("../src/lib/videos/remote-merge.ts");
const { normalizeFollowCheckpoints } = await import("../src/lib/videos/follow-checkpoints.ts");
const ch = { id: "tw:freshness", kind: "twitch", handle: "freshness", title: "Freshness creator" };
const diag = (at, cacheHit = false) => ({
  at,
  mode: "recent",
  cacheHit,
  pages: 0,
  received: 0,
  accepted: 0,
  duplicates: 0,
  windows: [],
});
const card = (at, views = 100) => ({
  id: "tw:c:one",
  folderId: ch.id,
  name: "Current clip",
  path: "twitch/clip/one",
  extension: "clip",
  mime: "video/twitch",
  size: 0,
  addedAt: 100,
  duration: 30,
  poster: "new.jpg",
  remote: { kind: "twitch", videoId: "one", views, observedAt: at },
});
test("a warm retry advances only its attempt and retains original successful observation through reload", () => {
  const old = {
    ...ch,
    twitchClipRecentCheckedAt: 1000,
    twitchClipRecentAttemptedAt: 1000,
    twitchClipDiagnostics: diag(1000),
  };
  const r = mergeTwitchClipObservation(
    old,
    {
      ...ch,
      twitchClipRecentCheckedAt: 1000,
      twitchClipDiagnostics: { ...diag(1000, true), servedAt: 3000 },
    },
    "recent",
    3000,
    3000,
  );
  assert.equal(r.twitchClipRecentAttemptedAt, 3000);
  assert.equal(r.twitchClipRecentCheckedAt, 1000);
  assert.equal(r.twitchClipDiagnostics.at, 1000);
  assert.equal(r.twitchClipDiagnostics.cacheHit, true);
  const saved = normalizeFollowCheckpoints(JSON.parse(JSON.stringify(r)));
  assert.equal(saved.twitchClipRecentAttemptedAt, 3000);
  assert.equal(saved.twitchClipRecentCheckedAt, 1000);
});
test("cached and held responses cannot clear a newer failure, rewind health or move older cursors", () => {
  const latest = {
    ...ch,
    twitchClipRecentCheckedAt: 2000,
    twitchClipRecentAttemptedAt: 3000,
    twitchClipRecentRetry: { attempts: 2, retryAt: 9000 },
    lastClipFailure: { at: 3000, message: "Latest failure", kind: "network-offline", recovery: "" },
    twitchClipDiagnostics: diag(2500),
  };
  const warm = mergeTwitchClipObservation(
    latest,
    { ...ch, twitchClipRecentCheckedAt: 1000, twitchClipDiagnostics: diag(1000, true) },
    "recent",
    4000,
    4000,
  );
  assert.equal(warm.twitchClipRecentAttemptedAt, 4000);
  assert.equal(warm.twitchClipRecentCheckedAt, 2000);
  assert.equal(warm.twitchClipRecentRetry, latest.twitchClipRecentRetry);
  assert.equal(warm.lastClipFailure, latest.lastClipFailure);
  assert.equal(warm.twitchClipDiagnostics, latest.twitchClipDiagnostics);
  const held = mergeTwitchClipObservation(
    latest,
    { ...ch, twitchClipRecentCheckedAt: 3500, twitchClipDiagnostics: diag(3500) },
    "recent",
    1000,
    4000,
  );
  assert.equal(held.lastClipFailure, latest.lastClipFailure);
  assert.equal(held.twitchClipRecentAttemptedAt, 3000);
  const archive = {
    ...latest,
    twitchClipArchiveAttemptedAt: 3000,
    twitchClipCheckedAt: 2000,
    twitchClipCursor: "safe",
    twitchClipRetry: { attempts: 1, retryAt: 9000 },
  };
  const r = mergeTwitchClipObservation(
    archive,
    { ...ch, twitchClipCheckedAt: 1000, twitchClipCursor: "stale" },
    "archive",
    4000,
    4000,
  );
  assert.equal(r.twitchClipCursor, "safe");
  assert.equal(r.twitchClipRetry, archive.twitchClipRetry);
});
test("new successful observations clear only their own wait and real failures keep the prior check", () => {
  const old = {
    ...ch,
    twitchClipRecentCheckedAt: 1000,
    twitchClipRecentAttemptedAt: 2000,
    twitchClipRecentRetry: { attempts: 1, retryAt: 3000 },
    twitchClipRetry: { attempts: 2, retryAt: 9000 },
    lastClipFailure: { at: 2000, message: "Failure", kind: "network-offline", recovery: "" },
  };
  const good = mergeTwitchClipObservation(
    old,
    { ...ch, twitchClipRecentCheckedAt: 4000, twitchClipDiagnostics: diag(4000) },
    "recent",
    4000,
    4500,
  );
  assert.equal(good.twitchClipRecentRetry, undefined);
  assert.equal(good.lastClipFailure, undefined);
  assert.equal(good.twitchClipRetry, old.twitchClipRetry);
  const failed = mergeTwitchClipObservation(
    good,
    {
      ...good,
      lastClipFailure: {
        at: 5500,
        message: "Newest failure",
        kind: "network-offline",
        recovery: "",
      },
    },
    "recent",
    5000,
    5500,
  );
  assert.equal(failed.twitchClipRecentCheckedAt, 4000);
  assert.equal(failed.twitchClipRecentAttemptedAt, 5000);
  assert.equal(failed.twitchClipRecentRetry.attempts, 1);
  assert.equal(failed.lastClipFailure.message, "Newest failure");
  const legacy = { ...old, lastClipFailure: undefined };
  assert.equal(
    mergeTwitchClipObservation(
      legacy,
      { ...ch, twitchClipRecentCheckedAt: 1000, twitchClipDiagnostics: diag(1000, true) },
      "recent",
      4000,
      4000,
    ).twitchClipRecentRetry,
    legacy.twitchClipRecentRetry,
  );
});
test("unrelated copied follow responses preserve newer clip health without blocking live metadata", () => {
  const latest = {
    ...ch,
    twitchClipRecentAttemptedAt: 3000,
    twitchClipRecentCheckedAt: 2000,
    twitchClipRecentRetry: { attempts: 1, retryAt: 9000 },
    twitchClipCheckedAt: 2500,
    twitchClipArchiveAttemptedAt: 2500,
    twitchClipCursor: "safe",
    twitchClipDiagnostics: diag(2500),
    lastClipFailure: { at: 3000, message: "New failure" },
  };
  const old = {
    ...ch,
    live: true,
    liveCheckedAt: 4000,
    twitchClipRecentAttemptedAt: 1000,
    twitchClipRecentCheckedAt: 1000,
    twitchClipCheckedAt: 1000,
    twitchClipCursor: "old",
  };
  const merged = retainNewerTwitchClipFollow(latest, old);
  assert.equal(merged.liveCheckedAt, 4000);
  assert.equal(merged.twitchClipRecentRetry, latest.twitchClipRecentRetry);
  assert.equal(merged.twitchClipCursor, "safe");
  assert.equal(merged.twitchClipDiagnostics, latest.twitchClipDiagnostics);
  assert.equal(merged.lastClipFailure, latest.lastClipFailure);
  const fullPull = retainNewerTwitchClipFollow(latest, { ...ch, lastResponseCount: 500 });
  assert.equal(fullPull.lastResponseCount, 500);
  assert.equal(fullPull.twitchClipDiagnostics, latest.twitchClipDiagnostics);
});
test("every catalog admission path retains fresher clip metadata and array identity on stale-only input", async () => {
  const fresh = card(2000),
    stale = { ...card(1000, 1), name: "Old clip", addedAt: 1, duration: 5, poster: "old.jpg" },
    base = [fresh],
    turn = async () => {};
  assert.equal(await merges.mergeRemoteCatalogAsync(base, [stale], { turn }), base);
  const incoming = [];
  assert.equal(merges.mergeRemoteCatalog(base, [stale], new Map([[fresh.id, 0]]), incoming), base);
  assert.equal(incoming[0], fresh);
  const indexed = await merges.prepareIndexedRemoteCatalog(
    base,
    [stale],
    new Map([[fresh.id, 0]]),
    turn,
  );
  assert.equal(indexed.videos, base);
  assert.equal(indexed.rows[0], fresh);
  assert.equal(merges.mergeRemoteRefresh(base, [stale], [ch.id], new Set()), base);
  assert.equal(
    await merges.mergeRemoteRefreshAsync(base, [stale], [ch.id], new Set(), { turn }),
    base,
  );
  assert.equal(
    await merges.mergeRemoteCatalogAsync(
      base,
      [{ ...stale, remote: { ...stale.remote, observedAt: undefined } }],
      { turn },
    ),
    base,
  );
  const newer = card(3000, 90),
    updated = await merges.mergeRemoteCatalogAsync(base, [newer], { turn });
  assert.equal(updated[0].remote.views, 90);
  assert.equal(updated[0].remote.observedAt, 3000);
});
test("fresh clip API invalidates only its exact creator, mode, count and cursor cache entry", async () => {
  const { runFollowRemote } = await import("../src/lib/remote/api.ts");
  const original = globalThis.fetch;
  let reads = 0;
  const p = (n, slug) => ({
    edges: Array.from({ length: n }, (_, i) => ({ node: { slug: slug + i } })),
    pageInfo: { hasNextPage: false },
  });
  try {
    globalThis.fetch = async (_u, init) => {
      reads++;
      const d = JSON.parse(init.body);
      return Response.json({
        data: {
          user: d.query.includes("clips(")
            ? { clips: p(1, d.variables.login + (d.query.match(/period:(\w+)/)?.[1] ?? "current")) }
            : { id: d.variables.login, displayName: d.variables.login },
        },
      });
    };
    const a = { query: "fresh_exact_a", kind: "twitch", twitchClipMode: "recent", clipLimit: 6 },
      siblings = [
        { ...a, query: "fresh_exact_b" },
        { ...a, clipLimit: 3 },
        { ...a, twitchClipMode: "archive" },
        {
          ...a,
          twitchClipMode: "archive",
          twitchClipCursor: JSON.stringify({ v: 1, after: "another" }),
        },
      ];
    const first = await runFollowRemote(a);
    for (const d of siblings) await runFollowRemote(d);
    let before = reads;
    const warm = await runFollowRemote(a);
    assert.equal(reads, before);
    assert.equal(warm.channel.twitchClipDiagnostics.cacheHit, true);
    const fresh = await runFollowRemote({ ...a, freshTwitchClips: true });
    assert(reads > before);
    assert.equal(fresh.channel.twitchClipDiagnostics.cacheHit, false);
    assert(fresh.channel.twitchClipRecentCheckedAt > first.channel.twitchClipRecentCheckedAt);
    assert(
      fresh.videos.every((v) => v.remote.observedAt === fresh.channel.twitchClipRecentCheckedAt),
    );
    before = reads;
    for (const d of siblings)
      assert.equal((await runFollowRemote(d)).channel.twitchClipDiagnostics.cacheHit, true);
    assert.equal(reads, before);
    assert.equal(
      (await runFollowRemote(a)).channel.twitchClipDiagnostics.at,
      fresh.channel.twitchClipDiagnostics.at,
    );
    await assert.rejects(
      runFollowRemote({ query: "a", kind: "twitch", freshTwitchClips: true }),
      /requires a clip/,
    );
    await assert.rejects(runFollowRemote({ ...a, freshTwitchClips: "yes" }), /true or false/);
    await assert.rejects(runFollowRemote({ ...a, clipLimit: 0 }), /at least one clip/);
    assert.equal(reads, before);
  } finally {
    globalThis.fetch = original;
  }
});
test("a fresh clip read waits for the older same-key request, coalesces fresh callers and warms the final result", async () => {
  const { runFollowRemote } = await import("../src/lib/remote/api.ts");
  const original = globalThis.fetch;
  let release,
    entered,
    reads = 0;
  const held = new Promise((r) => (release = r)),
    started = new Promise((r) => (entered = r));
  let first = true;
  try {
    globalThis.fetch = async (_u, init) => {
      reads++;
      const d = JSON.parse(init.body);
      if (!d.query.includes("clips(")) {
        if (first) {
          first = false;
          entered();
          await held;
        }
        return Response.json({ data: { user: { id: "serial", displayName: "Serial" } } });
      }
      return Response.json({
        data: { user: { clips: { edges: [], pageInfo: { hasNextPage: false } } } },
      });
    };
    const data = {
        query: "fresh_serial_fixture",
        kind: "twitch",
        twitchClipMode: "recent",
        clipLimit: 6,
      },
      old = runFollowRemote(data);
    await started;
    const one = runFollowRemote({ ...data, freshTwitchClips: true }),
      two = runFollowRemote({ ...data, freshTwitchClips: true }),
      joined = runFollowRemote(data);
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(reads, 1);
    release();
    const [o, a, b, c] = await Promise.all([old, one, two, joined]);
    assert.equal(reads, 8);
    assert.equal(a.channel.twitchClipDiagnostics.at, b.channel.twitchClipDiagnostics.at);
    assert.equal(c.channel.twitchClipDiagnostics.at, a.channel.twitchClipDiagnostics.at);
    assert(a.channel.twitchClipDiagnostics.at > o.channel.twitchClipDiagnostics.at);
    const final = await runFollowRemote(data);
    assert.equal(final.channel.twitchClipDiagnostics.at, a.channel.twitchClipDiagnostics.at);
    assert.equal(final.channel.twitchClipDiagnostics.cacheHit, true);
  } finally {
    release?.();
    globalThis.fetch = original;
  }
});
