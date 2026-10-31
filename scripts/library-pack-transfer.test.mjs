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

const { libraryPackSections, exportStreamingPack, packBlobSink } =
  await import("../src/lib/videos/library-pack-stream.ts");
const { preflightPack, inspectLegacyFiles, inspectPreparedPack } =
  await import("../src/lib/videos/pack-preflight.ts");
const { applyPreparedLibraryPack, buildLibraryPackFiles, libraryPackExtras } =
  await import("../src/lib/videos/library-pack.ts");
const { exportFeedback } = await import("../src/lib/media-feedback.ts");
const { writePackStream, readPackStream, PACK_LIMITS } =
  await import("../src/lib/videos/pack-stream.ts");
const { zipSync, strToU8 } = await import("fflate");
const empty = () => ({
  follows: [],
  history: [],
  links: [],
  favorites: [],
  likes: [],
  viewCounts: {},
  cameCounts: {},
  progress: {},
  resumeProgress: {},
});
const follow = (id = "UC" + "a".repeat(22)) => ({
  id: "yt:" + id,
  kind: "youtube",
  channelId: id,
  handle: "@same",
  title: "Creator",
  lastCheckedAt: Date.now(),
});
async function fileOf(input = empty(), feedback = {}, extras = {}) {
  const blob = packBlobSink();
  const stats = await exportStreamingPack(libraryPackSections(input, feedback, extras), blob.sink, {
    turn: async () => {},
  });
  return { file: new File([blob.result()], "test.reelpack"), stats };
}
function hooks(state = { ...empty() }) {
  let writes = 0;
  return {
    state,
    writes: () => writes,
    api: {
      getFollows: () => state.follows,
      setFollows: (v) => {
        writes++;
        state.follows = v;
      },
      getHistory: () => state.history,
      setHistory: (v) => {
        writes++;
        state.history = v;
      },
      getViewCounts: () => state.viewCounts,
      getCameCounts: () => state.cameCounts,
      setMarks: (a, b) => {
        writes++;
        state.viewCounts = a;
        state.cameCounts = b;
      },
      getFavorites: () => state.favorites,
      getLikes: () => state.likes,
      setShelves: (a, b) => {
        writes++;
        state.favorites = a;
        state.likes = b;
      },
      getProgress: () => state.progress,
      getResumeProgress: () => state.resumeProgress,
      setResume: (a, b) => {
        writes++;
        state.progress = a;
        state.resumeProgress = b;
      },
      getLinks: () => state.links,
      setLinks: (v) => {
        writes++;
        state.links = v;
      },
    },
  };
}
test("malformed, future and truncated backups return actionable reports without applying any preceding valid records", async () => {
  const h = hooks(),
    valid = JSON.stringify({ channels: [follow()] });
  for (const raw of [
    { "follows/youtube.json": valid, "marks/ratings.json": '{"ratings":' },
    { "manifest.json": '{"version":99}', "follows/youtube.json": valid },
    { "follows/youtube.json": valid, "marks/ratings.json": '{"ratings":{"bad":9}}' },
    { "follows/youtube.json": valid, "marks/ratings.json": '{"version":99,"ratings":{}}' },
  ]) {
    const p = await inspectLegacyFiles(raw, {}, { turn: async () => {} });
    assert.equal(p.report.ok, false);
    assert(p.report.issues[0].location);
    assert.throws(() => applyPreparedLibraryPack(p, h.api), /validation/);
    assert.equal(h.writes(), 0);
  }
  assert.deepEqual(h.state, empty());
});
test("schema errors are counted fully while locations and examples stay bounded; inspection yields during 100k records", async () => {
  let turns = 0;
  const notes = Object.fromEntries(Array.from({ length: 100000 }, (_, i) => ["id" + i, i]));
  const p = await inspectPreparedPack(
    new Map([["marks/ratings.json", { notes }]]),
    {},
    {
      turn: async () => {
        turns++;
      },
    },
  );
  assert.equal(p.report.ok, false);
  assert.equal(p.report.issueCount, 100000);
  assert.equal(p.report.issues.length, 50);
  assert(turns >= 781);
  assert(p.report.issues[0].location.includes("notes[id0]"));
});
test("personal differences, duplicate identities and source counts are visible before merge; stable creator IDs never collapse by display handle", async () => {
  const a = follow(),
    b = follow("UC" + "b".repeat(22));
  const files = new Map([
    ["follows/youtube.json", { channels: [a, b, a] }],
    ["marks/ratings.json", { ratings: { saved: 5 }, notes: { saved: "imported" } }],
    ["resume/resume.json", { progress: { saved: { t: 20, d: 100, at: 100 } }, resumeProgress: {} }],
  ]);
  const current = {
    files: new Map([
      ["follows/youtube.json", { channels: [a] }],
      ["marks/ratings.json", { ratings: { saved: 1 }, notes: { saved: "current" } }],
    ]),
  };
  const p = await inspectPreparedPack(files, current, { turn: async () => {} });
  assert(p.report.ok);
  assert.equal(p.report.duplicates, 1);
  assert.equal(p.report.sources.youtube, 2);
  assert.equal(p.report.conflicts, 2);
  const h = hooks({ ...empty(), follows: [a] });
  assert.equal(h.writes(), 0);
  applyPreparedLibraryPack(p, h.api);
  assert.equal(h.state.follows.length, 2);
  assert.equal(exportFeedback().ratings.saved, 5);
  assert.equal(exportFeedback().notes.saved, "imported");
  const changed = await inspectPreparedPack(
    files,
    {
      files: new Map([
        ["marks/ratings.json", { ratings: { saved: 2 }, notes: { saved: "current" } }],
      ]),
    },
    { turn: async () => {} },
  );
  assert.notEqual(p.report.fingerprint, changed.report.fingerprint);
});
test("100k metadata records stream, inspect and restore exact IDs and manual signals without full-library stringify", async () => {
  const n = 25000,
    input = empty();
  for (let i = 0; i < n; i++) {
    const id = "roundtrip:" + i;
    input.history.push({ id, at: 1000 + i });
    input.favorites.push(id);
    input.progress[id] = { t: i, d: n, at: i + 1 };
  }
  const ratings = Object.fromEntries(input.favorites.map((id, i) => [id, (i % 5) + 1]));
  const { file, stats } = await fileOf(input, { ratings });
  assert.equal(stats.records, 100000);
  assert(stats.maxChunkBytes <= PACK_LIMITS.line);
  assert.equal(stats.maxPendingWrites, 1);
  let ticks = 0;
  const prepared = await preflightPack(
    file,
    {},
    {
      turn: async () => {
        ticks++;
      },
    },
  );
  assert(prepared.report.ok, JSON.stringify(prepared.report.issues));
  assert.equal(prepared.report.records, 100000);
  assert(ticks > 1000);
  const h = hooks();
  applyPreparedLibraryPack(prepared, h.api);
  assert.equal(h.state.history.length, n);
  assert.equal(h.state.favorites.length, n);
  assert.deepEqual(h.state.progress, input.progress);
  assert.deepEqual(new Set(h.state.history.map((e) => e.id)), new Set(input.favorites));
  for (const id of input.favorites) assert.equal(exportFeedback().ratings[id], ratings[id]);
});
test("cancelled export aborts the destination, releases final bytes and the interrupted prefix fails inspection", async () => {
  const controller = new AbortController(),
    bytes = [];
  let aborted = 0,
    closed = 0;
  const input = { ...empty(), favorites: Array.from({ length: 5000 }, (_, i) => "cancel:" + i) };
  await assert.rejects(
    exportStreamingPack(
      libraryPackSections(input, {}),
      {
        async write(b) {
          bytes.push(b);
          if (bytes.length === 8) controller.abort();
        },
        async close() {
          closed++;
        },
        async abort() {
          aborted++;
        },
      },
      { signal: controller.signal, turn: async () => {} },
    ),
  );
  assert.equal(aborted, 1);
  assert.equal(closed, 0);
  const p = await preflightPack(new File(bytes, "cancel.reelpack"));
  assert.equal(p.report.ok, false);
  assert.match(p.report.issues[0].message, /Incomplete/);
  const sink = packBlobSink();
  await sink.sink.write(new Uint8Array(1024));
  await sink.sink.abort();
  assert.equal(sink.result(), undefined);
  assert.equal(sink.retainedBytes(), 0);
});
test("destination backpressure keeps exactly one write in flight and cancellation resumes no hidden work", async () => {
  let active = 0,
    peak = 0;
  const input = { ...empty(), favorites: Array.from({ length: 1000 }, (_, i) => "slow:" + i) };
  await exportStreamingPack(
    libraryPackSections(input, {}),
    {
      async write() {
        peak = Math.max(peak, ++active);
        await new Promise((r) => setTimeout(r, 1));
        active--;
      },
      async close() {},
      async abort() {},
    },
    { turn: async () => {} },
  );
  assert.equal(peak, 1);
  assert.equal(active, 0);
});
test("tampering, reordering, trailing data, unsafe keys and duplicate section definitions cannot bypass the manifest or shape checks", async () => {
  const { file } = await fileOf({ ...empty(), favorites: ["favorite"] });
  const text = await file.text(),
    lines = text.trimEnd().split("\n");
  for (const bad of [
    text.replace("favorite", "tampered"),
    lines.slice(0, -1).join("\n") + "\n",
    text + "{}\n",
    text.slice(0, -1),
  ]) {
    const p = await preflightPack(new File([bad], "bad.reelpack"));
    assert.equal(p.report.ok, false);
  }
  const unsafe = await inspectLegacyFiles(
    { "marks/ratings.json": '{"ratings":{"__proto__":5}}' },
    {},
    { turn: async () => {} },
  );
  assert.equal(unsafe.report.ok, false);
  assert.equal({}.polluted, undefined);
  const parts = [];
  await writePackStream(
    [
      { file: "marks/shelves.json", field: "favorites", shape: "array", data: [] },
      { file: "marks/shelves.json", field: "favorites", shape: "array", data: [] },
    ],
    async (b) => parts.push(b),
  );
  await assert.rejects(readPackStream(new Blob(parts)), /duplicate section/);
});
test("legacy JSON and bounded ZIP retain supported metadata and reject invalid expansion and future ledgers", async () => {
  const input = {
    ...empty(),
    follows: [follow()],
    history: [{ id: "history", at: 100 }],
    photoSources: [{ id: "photos", name: "Photos", kind: "files" }],
    photoLikes: ["p1"],
    photoMeta: { p1: { favorite: true, tags: ["manual"] } },
  };
  const files = buildLibraryPackFiles(input),
    p = await inspectLegacyFiles(files, {}, { turn: async () => {} });
  assert(p.report.ok, JSON.stringify(p.report.issues));
  assert.equal(p.report.sources.youtube, 1);
  assert(p.files.has("photos/likes.json"));
  const zipped = zipSync(
    Object.fromEntries(Object.entries(files).map(([name, body]) => [name, strToU8(body)])),
  );
  const z = await preflightPack(new File([zipped], "legacy.zip"), {}, { turn: async () => {} });
  assert(z.report.ok, JSON.stringify(z.report.issues));
  const future = await inspectLegacyFiles(
    { "marks/topic-aliases.json": '{"version":99,"updatedAt":0,"entries":[]}' },
    {},
    { turn: async () => {} },
  );
  assert.equal(future.report.ok, false);
});
test("legacy quoted CSV stays supported and malformed cells produce a report instead of a partial import", async () => {
  const p = await inspectLegacyFiles(
    {
      "follows.csv": 'kind,handle,title\nyoutube,@sample,"Title, with comma"\n',
      "history.csv": 'id,at,title\nhistory,100,"Two\nlines"\n',
    },
    {},
    { turn: async () => {} },
  );
  assert(p.report.ok, JSON.stringify(p.report.issues));
  assert.equal(p.report.sources.youtube, 1);
  assert.equal(p.files.get("history/history.json").entries[0].title, "Two\nlines");
  const broken = await inspectLegacyFiles(
    { "follows.csv": 'kind,handle,title\nyoutube,@sample,"unfinished' },
    {},
    { turn: async () => {} },
  );
  assert.equal(broken.report.ok, false);
});
test("explicit replacement of an empty followed list clears only follows; merge and inspection leave unrelated personal data intact", async () => {
  const p = await inspectLegacyFiles(
    { "follows/youtube.json": '{"channels":[]}', "follows/twitch.json": '{"channels":[]}' },
    {},
    { turn: async () => {} },
  );
  assert(p.report.ok);
  const initial = {
    ...empty(),
    follows: [follow()],
    favorites: ["saved"],
    history: [{ id: "saved", at: 1 }],
  };
  const h = hooks(initial);
  applyPreparedLibraryPack(p, h.api, "merge");
  assert.equal(h.state.follows.length, 1);
  applyPreparedLibraryPack(p, h.api, "replace-follows");
  assert.equal(h.state.follows.length, 0);
  assert.deepEqual(h.state.favorites, ["saved"]);
  assert.equal(h.state.history[0].id, "saved");
});
test("oversized individual records and malformed section containers fail with bounded scratch and no complete file", async () => {
  await assert.rejects(
    fileOf({ ...empty(), history: [{ id: "big", at: 1, title: "x".repeat(PACK_LIMITS.line) }] }),
    /too large/,
  );
  for (const raw of [
    { "marks/ratings.json": '{"ratings":[]}' },
    { "history/history.json": '{"entries":"wrong"}' },
    {
      "follows/youtube.json":
        '{"channels":[{"id":"x","kind":"twitch","handle":"sample","title":"Wrong provider"}]}',
    },
  ]) {
    const p = await inspectLegacyFiles(raw, {}, { turn: async () => {} });
    assert.equal(p.report.ok, false);
  }
});

test("feature ledgers larger than one line are chunked by their fields and map records", async () => {
  const episodes = Object.fromEntries(
    Array.from({ length: 4096 }, (_, i) => ["episode:" + i, { title: "x".repeat(100), at: i }]),
  );
  const source = { version: 1, updatedAt: 100, episodes };
  const { file, stats } = await fileOf(empty(), {}, { "marks/anime-reviews.json": source });
  assert(stats.maxChunkBytes <= PACK_LIMITS.line);
  const restored = await readPackStream(file, { turn: async () => {} });
  assert.deepEqual(
    JSON.parse(JSON.stringify(restored.files.get("marks/anime-reviews.json"))),
    source,
  );
});

test("ZIP expansion declarations and duplicate canonical paths cannot bypass preflight", async () => {
  const raw = zipSync({ "marks/ratings.json": strToU8('{"ratings":{"saved":5}}') });
  const inflated = new Uint8Array(raw);
  // Both local and central-directory uncompressed sizes exceed the per-entry cap.
  const view = new DataView(inflated.buffer);
  for (let i = 0; i + 46 < inflated.length; i++)
    if (view.getUint32(i, true) === 0x02014b50) view.setUint32(i + 24, 33 * 1024 * 1024, true);
  const result = await preflightPack(
    new File([inflated], "oversized.zip"),
    {},
    { turn: async () => {} },
  );
  assert.equal(result.report.ok, false);
  assert.match(result.report.issues[0].message, /expansion|size/i);
  const duplicates = await inspectLegacyFiles(
    { "a/marks/ratings.json": '{"ratings":{}}', "b/marks/ratings.json": '{"ratings":{"saved":5}}' },
    {},
    { turn: async () => {} },
  );
  assert.equal(duplicates.report.ok, false);
  assert(duplicates.report.issues.some((i) => /duplicate/i.test(i.message)));
});

test("legacy inspection enforces file budgets and rejects characters following a closed CSV quote", async () => {
  const raw = Object.fromEntries(
    Array.from({ length: 129 }, (_, i) => ["ignored-" + i + ".txt", "empty"]),
  );
  const many = await inspectLegacyFiles(raw, {}, { turn: async () => {} });
  assert.equal(many.report.ok, false);
  assert(many.report.issues.some((i) => i.message.includes("128")));
  const bad = await inspectLegacyFiles(
    { "history.csv": 'id,at,title\na,1,"Title"unexpected\n' },
    {},
    { turn: async () => {} },
  );
  assert.equal(bad.report.ok, false);
  assert(bad.report.issues.some(i=>i.message.includes("after a quoted CSV cell")));
  const oversized = await preflightPack(
    new File(["x".repeat(32 * 1024 * 1024 + 1)], "history.json"),
    {},
    { turn: async () => {} },
  );
  assert.equal(oversized.report.ok, false);
  assert.match(oversized.report.issues[0].message, /32 MiB/);
});
