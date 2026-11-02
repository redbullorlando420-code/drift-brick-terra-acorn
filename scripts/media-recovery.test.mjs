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
const { parseTwitchMediaCheck, mediaCheckIdentity, createTwitchMediaChecker } =
  await import("../src/lib/remote/twitch-media-health.ts");
const { emptyMediaHealth, observeMediaHealth, parseMediaHealth, mergeMediaHealth, mediaBasis } =
  await import("../src/lib/videos/media-health.ts");
const { collectRecoveryGroups } = await import("../src/lib/videos/media-recovery-groups.ts");
const { inspectLegacyFiles } = await import("../src/lib/videos/pack-preflight.ts");
const { rememberDirHandle, rememberFile } = await import("../src/lib/videos/sources.ts");
const { inspectLocalMedia } = await import("../src/lib/videos/local-media-health.ts");
const video = (id = "vod") => ({
  id,
  folderId: "tw:creator",
  name: "Kept Twitch title",
  path: "",
  mime: "video/twitch",
  extension: "vod",
  size: 0,
  addedAt: 1,
  remote: { kind: "twitch", videoId: "1234", watchUrl: "https://www.twitch.tv/videos/1234" },
});
const observation = (status = "publicly-unavailable", at = 2) => ({
  video: video(),
  basis: mediaBasis(video()),
  private: false,
  status,
  at,
  code: status === "unknown" ? "transport-or-schema" : "public-null",
});
test("only a clean typed item response proves public unavailability", () => {
  const id = { kind: "vod", value: "1234" };
  assert.equal(
    parseTwitchMediaCheck(id, { data: { video: null } }, 1).state,
    "publicly-unavailable",
  );
  for (const raw of [
    {},
    { data: {} },
    { data: { video: null }, errors: [{ message: "503" }] },
    { data: { video: null }, errors: "error" },
    { data: { video: { id: "5678" } } },
    { data: { video: [] } },
  ])
    assert.equal(parseTwitchMediaCheck(id, raw, 1).state, "unknown");
  assert.equal(
    parseTwitchMediaCheck(id, { data: { video: { id: "1234" } } }, 1).state,
    "available",
  );
  const clip = { kind: "clip", value: "SomeSlug" };
  assert.equal(
    parseTwitchMediaCheck(clip, { data: { clip: { id: "opaque", slug: "SomeSlug" } } }, 1).state,
    "available",
  );
  assert.equal(
    parseTwitchMediaCheck(clip, { data: { clip: { id: "opaque", slug: "Other" } } }, 1).state,
    "unknown",
  );
});
test("temporary errors never become expired media and selected queries do not scan a creator", async () => {
  for (const status of [503, 429, 401])
    assert.equal(
      (
        await createTwitchMediaChecker(async () => {
          throw Error("HTTP " + status);
        })("https://www.twitch.tv/videos/1234")
      ).state,
      "unknown",
    );
  let calls = 0;
  const result = await createTwitchMediaChecker(async (q, v) => {
    calls++;
    assert(q.includes("video(id:$id)"));
    assert(!q.includes("user("));
    assert.deepEqual(v, { id: "1234" });
    return { data: { video: null } };
  })("https://www.twitch.tv/videos/1234?t=2m");
  assert.equal(calls, 1);
  assert.equal(result.state, "publicly-unavailable");
  for (const raw of [
    "https://evil.test/videos/1234",
    "https://www.twitch.tv/channel",
    "file:///video",
    null,
  ])
    assert.throws(() => mediaCheckIdentity(raw));
});
test("a failed retry keeps the last verified observation, manual choice and private boundary", () => {
  let ledger = observeMediaHealth(emptyMediaHealth(), { ...observation(), private: true });
  ledger.entries.vod = { ...ledger.entries.vod, choice: "bookmark", choiceAt: 3 };
  ledger = observeMediaHealth(ledger, observation("unknown", 4));
  assert.equal(ledger.entries.vod.status, "unknown");
  assert.equal(ledger.entries.vod.lastConfirmed, "publicly-unavailable");
  assert.equal(ledger.entries.vod.confirmedAt, 2);
  assert.equal(ledger.entries.vod.choice, "bookmark");
  assert.equal(ledger.entries.vod.private, true);
  assert.equal(ledger.entries.vod.video.privateRetention, true);
  assert.equal(observeMediaHealth(ledger, observation("available", 1)), ledger);
});
test("backup merge chooses observations and visibility decisions independently", () => {
  const current = observeMediaHealth(emptyMediaHealth(), observation("unknown", 10)),
    incoming = observeMediaHealth(emptyMediaHealth(), observation("available", 5));
  current.entries.vod.choiceAt = 6;
  current.entries.vod.choice = "hidden";
  incoming.entries.vod.choiceAt = 12;
  incoming.entries.vod.choice = "bookmark";
  const merged = mergeMediaHealth(current, incoming);
  assert.equal(merged.entries.vod.status, "unknown");
  assert.equal(merged.entries.vod.choice, "bookmark");
  assert.equal(merged.entries.vod.at, 10);
  assert.equal(merged.entries.vod.lastConfirmed,'available');
  assert.equal(merged.entries.vod.confirmedAt,5);
});
test("corrupt/future/oversized records fail closed instead of erasing recovery choices", () => {
  for (const raw of [
    { version: 2, revision: 1, entries: {} },
    { version: 1, revision: NaN, entries: {} },
    { version: 1, revision: 0, entries: { bad: {} } },
  ])
    assert.throws(() => parseMediaHealth(raw));
  const full = {
    version: 1,
    revision: 0,
    entries: Object.fromEntries(Array.from({ length: 1025 }, (_, i) => [String(i), {}])),
  };
  assert.throws(() => parseMediaHealth(full));
});
test("100k disconnected entries yield and retain at most 20 candidates per source, oldest first", async () => {
  const rows = Array.from({ length: 100_000 }, (_, i) => ({
    ...video("local-" + i),
    remote: undefined,
    folderId: "local",
    path: i + ".mp4",
    name: "Local " + i,
    size: 4,
  }));
  const ledger = observeMediaHealth(emptyMediaHealth(), {
    video: rows[0],
    basis: mediaBasis(rows[0]),
    private: false,
    status: "missing-file",
    at: 5,
    code: "missing-file",
  });
  const groups = await collectRecoveryGroups(
    rows,
    [
      {
        id: "local",
        name: "Selected folder",
        kind: "directory",
        needsPermission: true,
        videoCount: 100000,
      },
    ],
    {},
    ledger,
    false,
    new AbortController().signal,
  );
  assert.equal(groups.length, 1);
  assert.equal(groups[0].count, 100000);
  assert.equal(groups[0].videos.length, 20);
  assert(!groups[0].videos.some((v) => v.id === "local-0"));
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(collectRecoveryGroups(rows, [], {}, ledger, false, abort.signal));
});
test("locked private source names cannot be searched through recovery results", async () => {
  const local = {
    ...video("private"),
    remote: undefined,
    folderId: "private",
    path: "secret.mp4",
    name: "Secret local title",
    privateRetention: true,
  };
  const ledger = observeMediaHealth(emptyMediaHealth(), {
    video: local,
    basis: mediaBasis(local),
    private: true,
    status: "permission-needed",
    at: 1,
    code: "permission",
  });
  assert.deepEqual(
    await collectRecoveryGroups(
      [local],
      [],
      {},
      ledger,
      false,
      new AbortController().signal,
      "secret",
      false,
    ),
    [],
  );
});
test("backup preflight validates the new sidecar before any import writes", async () => {
  const valid = observeMediaHealth(emptyMediaHealth(), observation());
  const ready = await inspectLegacyFiles({ "marks/media-health.json": JSON.stringify(valid) });
  assert.equal(ready.report.ok, true);
  const future = await inspectLegacyFiles({
    "marks/media-health.json": JSON.stringify({ ...valid, version: 2 }),
  });
  assert.equal(future.report.ok, false);
});
test("selected local checks distinguish permissions, missing entries, disconnected roots and changed sizes", async () => {
  const row = {
      ...video("selected-local"),
      remote: undefined,
      folderId: "selected-root",
      path: "selected.mp4",
      size: 4,
    },
    signal = new AbortController().signal;
  let walks = 0;
  rememberDirHandle(row.folderId, {
    queryPermission: async () => "denied",
    getFileHandle: async () => {
      walks++;
      throw Error("Must not open a denied root");
    },
  });
  assert.equal((await inspectLocalMedia(row, signal)).status, "permission-needed");
  assert.equal(walks, 0);
  rememberDirHandle(row.folderId, {
    queryPermission: async () => "granted",
    getFileHandle: async () => {
      walks++;
      throw new DOMException("Gone", "NotFoundError");
    },
  });
  assert.equal((await inspectLocalMedia(row, signal)).status, "missing-file");
  assert.equal(walks, 1);
  rememberDirHandle(row.folderId, {
    queryPermission: async () => {
      throw Error("Drive gone");
    },
  });
  assert.equal((await inspectLocalMedia(row, signal)).status, "source-disconnected");
  const selected = { ...row, id: "selected-file", folderId: "no-directory" };
  rememberFile(selected.id, new File(["abcd"], "selected.mp4"));
  assert.equal((await inspectLocalMedia(selected, signal)).status, "available");
  assert.equal(
    (await inspectLocalMedia({ ...selected, size: 9 }, signal)).status,
    "content-mismatch",
  );
});
