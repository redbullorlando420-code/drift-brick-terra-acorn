import test from "node:test";
import assert from "node:assert/strict";
import {
  companionSnapshot,
  readUpdateSnapshot,
  compareCompanionUpdate,
  updateSnapshotKey,
} from "../src/lib/companion-update.ts";
import { downloadFailure } from "../companion/download-auth.mjs";
const health = {
  ok: true,
  service: "reelcase-companion",
  version: 13,
  protocol: { major: 1, minor: 0 },
  roots: 2,
  capabilities: ["youtube-downloads", "task-receipts", "prints-bridge"],
  inspection: {
    schema: 1,
    configurationRef: "a".repeat(64),
    tools: { ytDlp: "2026.10.28", youtubeDl: "2021.12.17" },
    destinations: { downloads: true, artwork: true, prints: true, libraryPack: true },
  },
};
test("update report allowlist strips paths, identities, URLs and arbitrary nested data", () => {
  const snapshot = companionSnapshot(
    {
      ...health,
      downloadRoot: "C:/secret-user/session",
      cookies: "secret-cookie",
      inspection: { ...health.inspection, authorization: "secret-token" },
    },
    {
      ok: true,
      jobs: [
        {
          id: "private-id",
          title: "private-title",
          url: "https://example.test/?token=secret",
          status: "running",
          cookie: "secret-cookie",
        },
      ],
    },
    123,
  );
  const text = JSON.stringify(snapshot);
  for (const secret of ["secret", "private", "session", "example", "authorization", "downloadRoot"])
    assert(!text.includes(secret), secret);
  assert.equal(snapshot.jobs.running, 1);
  assert.equal(snapshot.tools.ytDlp, "2026.10.28");
  assert.deepEqual(readUpdateSnapshot({ ...snapshot, unknown: "secret" }), snapshot);
  assert.notEqual(updateSnapshotKey("first"), updateSnapshotKey("second"));
});
test("baseline parser bounds future/corrupt job state and never trusts arbitrary version text", () => {
  const snapshot = companionSnapshot(health, null, 123);
  for (const bad of [
    { ...snapshot, schema: 2 },
    { ...snapshot, checkedAt: -1 },
    { ...snapshot, jobs: { running: 999999 } },
    { ...snapshot, jobs: { running: 1, secret: "token" } },
  ])
    assert.throws(() => readUpdateSnapshot(bad));
  assert.equal(
    companionSnapshot(
      { ...health, inspection: { schema: 1, tools: { ytDlp: "Cookie: secret" } } },
      null,
    ).tools.ytDlp,
    null,
  );
  assert.equal(companionSnapshot(health, { ok: true, jobs: [{ status: "future" }] }).jobs, null);
});
test("post-update differences preserve baseline and expose missing features, tools, approvals and interrupted jobs", () => {
  const before = companionSnapshot(health, { ok: true, jobs: [{ status: "done" }] }, 123),
    old = JSON.stringify(before);
  const after = companionSnapshot(
    {
      ...health,
      roots: 1,
      capabilities: ["task-receipts"],
      inspection: {
        schema: 1,
        configurationRef: "b".repeat(64),
        destinations: { downloads: false },
      },
    },
    { ok: true, jobs: [{ status: "interrupted" }] },
    456,
  );
  const notes = compareCompanionUpdate(before, after).join(" ");
  for (const word of [
    "Missing capabilities",
    "Approved-root count changed",
    "configuration reference changed",
    "ytDlp",
    "interrupted",
  ])
    assert(notes.includes(word));
  assert.equal(JSON.stringify(before), old);
  const incompatible = companionSnapshot({ ...health, protocol: { major: 9, minor: 0 } }, null);
  assert.match(compareCompanionUpdate(before, incompatible).join(" "), /incompatible/);
});
test("download failures are stable categories and never return raw credentials or cookie content", () => {
  const cases = [
    ["ERROR: Could not decrypt cookie database token=secret", "session-unreadable"],
    ["Cookies expired secret-session", "session-expired"],
    ["Sign in to confirm your age secret", "access-restricted"],
    ["Sign in required Cookie: secret", "sign-in-required"],
    ["Video unavailable Authorization: Bearer secret", "unavailable"],
    ["ENOENT C:/private/secret", "tool-missing"],
    ["unexpected token secret-jwt", "download-failed"],
  ];
  for (const [raw, code] of cases) {
    const result = downloadFailure(raw);
    assert.equal(result.code, code);
    assert(!JSON.stringify(result).includes("secret"));
    assert.equal(downloadFailure(result.message).code, code);
  }
});

test('paused download receipts survive update summaries and old baselines remain readable',()=>{const snapshot=companionSnapshot({ok:true,service:'reelcase-companion',version:16,protocol:{major:1,minor:0},capabilities:[]},{ok:true,jobs:[{status:'paused'}]});assert.equal(snapshot.jobs.paused,1);assert.equal(readUpdateSnapshot(snapshot).jobs.paused,1);assert(compareCompanionUpdate(snapshot,snapshot).some(note=>note.includes('paused')));});
