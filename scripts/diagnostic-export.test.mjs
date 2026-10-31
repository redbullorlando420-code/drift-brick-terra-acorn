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
const { diagnosticExport, diagnosticText } = await import("../src/lib/diagnostic-export.ts");
const { exportYoutubeEmbedEvidence } =
  await import("../src/lib/multiplayer/room-youtube-diagnostics.ts");
const { roomConnectionDiagnostic } =
  await import("../src/lib/multiplayer/room-connection-timeline.ts");
const canary = "SECRET_CANARY_private_owner_token",
  bad = {
    cookie: canary,
    authorization: canary,
    inviteToken: canary,
    url: "https://private.invalid/?token=" + canary,
    path: "C:\\private\\" + canary,
    title: canary,
    videoId: canary,
    notes: canary,
    unexpected: { bytes: canary },
  };
test("closed diagnostic schemas omit nested unknown data, identifiers and arbitrary text for every export kind", () => {
  for (const kind of [
    "performance",
    "room",
    "companion-update",
    "root-access",
    "youtube-player",
    "provider-quality",
  ]) {
    const input = {
      ...bad,
      version: 1,
      catalogEntries: 100000,
      artwork: { ...bad, bytes: 512, decodes: { ...bad, active: 2 } },
      current: { ...bad, roots: 1, configurationRef: "a".repeat(64) },
      titles: [
        {
          ...bad,
          phase: "error",
          loads: 1,
          events: [{ ...bad, phase: "error", code: 150, at: 1000 }],
        },
      ],
      roots: [{ ...bad, id: canary, state: "approved", enabled: true, revision: 1 }],
    };
    const text = diagnosticText(kind, input);
    for (const secret of [canary, "private.invalid", "C:\\private", "a".repeat(64)])
      assert(!text.includes(secret), kind);
    assert.equal(JSON.parse(text).diagnostic.kind, kind);
    assert(text.length < 65536);
  }
});
test("safe metrics and finite enum states remain useful while malformed and out-of-range values drop", () => {
  const data = diagnosticExport("performance", {
    version: 1,
    catalogEntries: 100000,
    sourceCount: Infinity,
    artwork: { bytes: 512, decodes: { active: 1, peak: 4 } },
    ranking: {
      samples: [{ kind: "twitch", outcome: "complete", rows: 2400, cpuMs: 5, maxSliceMs: 2 }],
    },
    providerBudgets: { responseBytes: 8388608, warmCacheRows: 250, queuedRequests: 80 },
    scorecard: { health: "unmeasured", checks: [{ id: "input", health: "watch", detail: canary }] },
  });
  assert.equal(data.catalogEntries, 100000);
  assert.equal(data.sourceCount, undefined);
  assert.equal(data.ranking.samples[0].rows, 2400);
  assert.equal(data.providerBudgets.responseBytes, 8388608);
  assert.equal(data.artwork.decodes.peak, 4);
  assert.equal(data.scorecard.checks[0].detail, undefined);
});
test("unknown objects and getters are never inspected, invoked or logged", () => {
  let invoked = 0;
  const input = { version: 1 };
  Object.defineProperty(input, "catalogEntries", {
    get() {
      invoked++;
      throw Error(canary);
    },
  });
  Object.defineProperty(input, "unexpected", {
    get() {
      invoked++;
      throw Error(canary);
    },
  });
  const text = diagnosticText("performance", input);
  assert.equal(invoked, 0);
  assert(!text.includes(canary));
  const cyclic = {};
  cyclic.unexpected = cyclic;
  assert.doesNotThrow(() => diagnosticText("performance", cyclic));
  assert.throws(() => diagnosticText("unknown", input), /Unsupported/);
});
test("array budgets prevent oversized raw provider graphs being serialized", () => {
  const roots = Array.from({ length: 100000 }, () => ({
    ...bad,
    state: "approved",
    revision: 1,
    enabled: true,
  }));
  const text = diagnosticText("root-access", { generation: 1, active: 64, roots });
  assert.equal(JSON.parse(text).roots.length, 64);
  assert(!text.includes(canary));
  assert(text.length < 65536);
});
test("player diagnostic omits selected video identity and official links while retaining observed codes", () => {
  const text = exportYoutubeEmbedEvidence(
      [
        {
          videoId: "BaW_jenozKc",
          phase: "error",
          changedAt: 1000,
          loads: 1,
          events: [{ phase: "error", at: 1000, code: 150 }],
          ...bad,
          videoId: "BaW_jenozKc",
        },
      ],
      2000,
    ),
    data = JSON.parse(text);
  assert.equal(data.version, 2);
  assert.equal(data.titles[0].events[0].code, 150);
  assert(!text.includes("BaW_jenozKc"));
  assert(!text.includes("youtube.com"));
  assert(!text.includes(canary));
});
test("room diagnostics ignore credential/event additions at the real production export boundary", () => {
  const text = JSON.stringify(
    roomConnectionDiagnostic(
      {
        ...bad,
        signaling: "online",
        peers: 1,
        ice: "connected",
        transport: true,
        handshake: true,
        guest: true,
        relay: false,
        player: "ready",
      },
      [{ ...bad, stage: "player", state: "ready", at: 1000 }],
      2,
      3,
      2000,
    ),
  );
  assert(!text.includes(canary));
  assert.equal(JSON.parse(text).queue.count, 2);
});

test("intentional private library packs retain private notes and remain inspectable and restorable", async () => {
  const { libraryPackSections, exportStreamingPack, packBlobSink } =
    await import("../src/lib/videos/library-pack-stream.ts");
  const { preflightPack } = await import("../src/lib/videos/pack-preflight.ts");
  const { applyPreparedLibraryPack } = await import("../src/lib/videos/library-pack.ts");
  const input = {
    follows: [],
    history: [{ id: "saved", at: 1000, title: canary }],
    links: [],
    favorites: ["saved"],
    likes: [],
    viewCounts: {},
    cameCounts: {},
    progress: { saved: { t: 10, d: 100, at: 1000 } },
    resumeProgress: {},
  };
  const sink = packBlobSink();
  await exportStreamingPack(
    libraryPackSections(input, { ratings: { saved: 5 }, notes: { saved: canary } }),
    sink.sink,
    { turn: async () => {} },
  );
  assert((await sink.result().text()).includes(canary));
  const ready = await preflightPack(
    new File([sink.result()], "private.reelpack"),
    {},
    { turn: async () => {} },
  );
  assert(ready.report.ok);
  assert.equal(ready.files.get("marks/ratings.json").notes.saved, canary);
  let history = [],
    favorites = [],
    progress = {};
  const empty = () => ({});
  applyPreparedLibraryPack(ready, {
    getFollows: () => [],
    setFollows() {},
    getHistory: () => history,
    setHistory: (v) => (history = v),
    getViewCounts: empty,
    getCameCounts: empty,
    setMarks() {},
    getFavorites: () => favorites,
    getLikes: () => [],
    setShelves: (f) => (favorites = f),
    getProgress: () => progress,
    getResumeProgress: empty,
    setResume: (p) => (progress = p),
    getLinks: () => [],
    setLinks() {},
  });
  assert.equal(history[0].title, canary);
  assert.deepEqual(favorites, ["saved"]);
  assert.equal(progress.saved.t, 10);
  const { exportFeedback } = await import("../src/lib/media-feedback.ts");
  assert.equal(exportFeedback().notes.saved, canary);
  assert.equal(exportFeedback().ratings.saved, 5);
});
