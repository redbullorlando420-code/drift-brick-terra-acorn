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
const { youtubeLiveCoverage } = await import("../src/lib/videos/youtube-live-health.ts");
const { createYoutubeLiveThroughput, youtubeLiveEstimate } =
  await import("../src/lib/videos/youtube-live-throughput.ts");
const channel = (i) => ({
  id: "yt:UC" + String(i).padStart(22, "0"),
  channelId: "UC" + String(i).padStart(22, "0"),
  kind: "youtube",
  handle: "creator" + i,
  title: "Creator " + i,
});
const now = 1000000;
test("a mixed 2k-creator ledger reports distinct freshness, due, unavailable and retry counts without counting failures as fresh success", () => {
  const rows = Array.from({ length: 2000 }, (_, i) => ({
    ...channel(i),
    ...(i < 500
      ? { liveCheckedAt: now - 10000 }
      : i < 1000
        ? { liveCheckedAt: now - 500000 }
        : i < 1300
          ? {
              liveCheckedAt: now - 10000,
              lastLiveFailure: { at: now - 1000, retryAt: now + 30000, message: "Wait" },
            }
          : i < 1500
            ? { lastLiveFailure: { at: now - 1000, retryAt: now + 30000, message: "Not verified" } }
            : {}),
  }));
  const before = structuredClone(rows);
  rows.push(
    { ...rows[0], id: "legacy-alias-0" },
    { ...rows[1000], id: "legacy-alias-1000" },
    { id: "ytpl:playlist", kind: "youtube", handle: "playlist", title: "Playlist" },
    { ...channel(3000), importNeedsReview: true },
    { id: "tw:other", kind: "twitch", handle: "other", title: "Other" },
  );
  const coverage = youtubeLiveCoverage(rows, now);
  assert.equal(coverage.total, 2000);
  assert.equal(coverage.recent, 500);
  assert.equal(coverage.failed, 500);
  assert.equal(coverage.cooling, 500);
  assert.equal(coverage.unchecked, 700);
  assert.equal(coverage.due, 1000);
  assert.equal(new Set(coverage.dueIds).size, 1000);
  assert.equal(coverage.queue.length, 2000);
  assert.equal(coverage.queue.filter((r) => r.status === "waiting").length, 500);
  assert.equal(coverage.queue.filter((r) => r.status === "due").length, 1000);
  assert.deepEqual(rows.slice(0, 2000), before);
});
test("legacy failed timestamps remain unverified and an older retry cannot hold a later successful observation", () => {
  const c = youtubeLiveCoverage(
    [
      {
        ...channel(1),
        liveCheckedAt: now - 10000,
        lastLiveFailure: { at: now - 10000, retryAt: now + 10000, message: "Legacy" },
      },
      {
        ...channel(2),
        liveCheckedAt: now - 500000,
        lastLiveFailure: { at: now - 600000, retryAt: now + 10000, message: "Older failure" },
      },
    ],
    now,
  );
  const duplicates=youtubeLiveCoverage([{...channel(9),liveCheckedAt:now-600000},{...channel(9),id:'legacy-alias',liveCheckedAt:now-10000}],now);
  assert.equal(duplicates.queue[0].channel.id,channel(9).id,'queue actions retain the same first identity as the store deduper');
  assert.equal(duplicates.recent,1);
  assert.equal(c.recent, 0);
  assert.equal(c.unchecked, 1);
  assert.equal(c.failed, 1);
  assert.equal(c.cooling, 1);
  assert.deepEqual(c.dueIds, [channel(2).id]);
});
test("throughput is based on distinct completed creators, ignores invalid IDs, and keeps only a bounded sample window", () => {
  const ids = Array.from({ length: 2000 }, (_, i) => "creator" + i),
    track = createYoutubeLiveThroughput(ids, 1000);
  track.record(ids.slice(0, 8), ids.slice(0, 8), 1500);
  track.record(ids.slice(0, 8), ids.slice(0, 8), 1600);
  track.record(["bogus"], ["bogus"], 1700);
  assert.equal(track.snapshot().samples.at(-1).successful, 8);
  assert.equal(track.snapshot().samples.at(-1).attempted, 8);
  track.record(ids.slice(8, 16), ids.slice(8, 16), 2500);
  let e = youtubeLiveEstimate(track.snapshot(), 100, true, 0, 2500);
  assert.equal(e.state, "active");
  assert.equal(e.perMinute, 640);
  assert(e.maxSeconds >= e.minSeconds);
  for (let i = 16; i < 2000; i += 8)
    track.record(ids.slice(i, i + 8), ids.slice(i, i + 8), 2500 + i * 100);
  assert(track.snapshot().samples.length <= 33);
  assert.equal(track.snapshot().samples.at(-1).successful, 2000);
});
test("warming, stalled, stopped and provider-wait states never expose a stale ETA", () => {
  const t = createYoutubeLiveThroughput(
    Array.from({ length: 48 }, (_, i) => String(i)),
    1000,
  );
  assert.equal(youtubeLiveEstimate(t.snapshot(), 100, true, 0, 1000).state, "warming");
  t.record(
    ["0", "1", "2", "3", "4", "5", "6", "7"],
    ["0", "1", "2", "3", "4", "5", "6", "7"],
    1500,
  );
  t.record(
    ["8", "9", "10", "11", "12", "13", "14", "15"],
    ["8", "9", "10", "11", "12", "13", "14", "15"],
    2500,
  );
  assert.equal(youtubeLiveEstimate(t.snapshot(), 100, true, 0, 2500).state, "active");
  for (const e of [
    youtubeLiveEstimate(t.snapshot(), 100, true, 0, 33000),
    youtubeLiveEstimate(t.snapshot(), 100, false, 0, 2500),
    youtubeLiveEstimate(t.snapshot(), 100, true, 9000, 2500),
  ]) {
    assert.equal(e.minSeconds, undefined);
    assert.equal(e.perMinute, undefined);
    assert.notEqual(e.state, "active");
  }
  t.record(["16", "17"], [], 2600);
  t.record(["18", "19"], [], 2700);
  assert.equal(youtubeLiveEstimate(t.snapshot(), 100, true, 0, 2700).state, "stalled");
  assert.equal(youtubeLiveEstimate(t.snapshot(), 0, true, 0, 2700).state, "clear");
});
test("failures cannot inflate throughput or produce an ETA from an overwhelmingly unsuccessful stream of attempts", () => {
  const ids = Array.from({ length: 100 }, (_, i) => String(i)),
    t = createYoutubeLiveThroughput(ids, 1000);
  t.record(ids.slice(0, 50), ids.slice(0, 4), 1500);
  t.record(ids.slice(50), ids.slice(50, 54), 3000);
  assert.equal(t.snapshot().samples.at(-1).successful, 8);
  assert.equal(youtubeLiveEstimate(t.snapshot(), 500, true, 0, 3000).state, "warming");
});
