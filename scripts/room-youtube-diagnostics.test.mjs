import test from "node:test";
import assert from "node:assert/strict";
import {
  youtubeEmbedIssue,
  recordYoutubeEmbedEvidence,
  exportYoutubeEmbedEvidence,
  YOUTUBE_DIAGNOSTIC_TITLES,
  YOUTUBE_DIAGNOSTIC_EVENTS,
} from "../src/lib/multiplayer/room-youtube-diagnostics.ts";
const id = "VV8mzTZ_Hgk",
  time = 1800000000000;
const record = (rows, phase, code, at = time) =>
  recordYoutubeEmbedEvidence(rows, id, phase, code, at);
test("documented YouTube player failures have distinct causes and precise recovery without claiming a bypass", () => {
  const cases = [
    [2, "link"],
    [5, "browser"],
    [100, "unavailable"],
    [101, "embedding"],
    [150, "embedding"],
    [153, "setup"],
    [999, "unknown"],
  ];
  for (const [code, kind] of cases) {
    const issue = youtubeEmbedIssue("error", code);
    assert.equal(issue.kind, kind);
    assert(issue.title.length > 12);
    assert(issue.detail.length > 30);
    assert(issue.action.length > 30);
  }
  assert.match(youtubeEmbedIssue("error", 101).action, /cannot change/);
  assert.match(youtubeEmbedIssue("error", 153).action, /referrer/);
  assert.equal(youtubeEmbedIssue("error", NaN), undefined);
  assert.equal(youtubeEmbedIssue("ready"), undefined);
});
test("autoplay and handshake uncertainty never invent an unavailable video or provider error code", () => {
  assert.equal(youtubeEmbedIssue("blocked").kind, "autoplay");
  const timeout = youtubeEmbedIssue("timeout");
  assert.equal(timeout.kind, "setup");
  assert.match(timeout.detail, /no YouTube error code/);
  assert.match(timeout.action, /does not prove/);
  const rows = record([], "timeout");
  assert.equal(rows[0].events[0].code, undefined);
  assert(!exportYoutubeEmbedEvidence(rows, time).includes("code"));
});
test("duplicate errors and player clock heartbeats retain evidence identity and original observation time", () => {
  let rows = record([], "loading");
  rows = record(rows, "error", 101, time + 1);
  const before = rows;
  for (let i = 0; i < 10000; i++) rows = record(rows, "error", 101, time + 2 + i);
  assert.equal(rows, before);
  assert.equal(rows[0].changedAt, time + 1);
  rows = record(rows, "playing", undefined, time + 20000);
  const playing = rows;
  for (let i = 0; i < 100; i++) rows = record(rows, "playing", undefined, time + 21000 + i);
  assert.equal(rows, playing);
});
test("ready and timeout events cannot erase a known embed error or blocked autoplay; retry and actual playback recover", () => {
  const failed = record(record([], "loading"), "error", 150, time + 1);
  assert.equal(record(failed, "ready", undefined, time + 2), failed);
  assert.equal(record(failed, "timeout", undefined, time + 2), failed);
  const retry = record(failed, "loading", undefined, time + 3);
  assert.equal(retry[0].loads, 2);
  assert.equal(retry[0].events.at(-2).code, 150);
  const ready = record(retry, "ready", undefined, time + 4);
  assert.equal(ready[0].phase, "ready");
  const blocked = record(ready, "blocked", undefined, time + 5);
  assert.equal(record(blocked, "ready", undefined, time + 6), blocked);
  assert.equal(record(blocked, "playing", undefined, time + 7)[0].phase, "playing");
});
test("diagnostics bound title count and per-title transitions while preserving independent title evidence", () => {
  let rows = [];
  for (let i = 0; i < 30; i++) {
    const videoId = "triage" + String(i).padStart(5, "0");
    rows = recordYoutubeEmbedEvidence(rows, videoId, "loading", undefined, time + i * 100);
    for (let j = 0; j < 12; j++)
      rows = recordYoutubeEmbedEvidence(
        rows,
        videoId,
        j % 2 ? "blocked" : "playing",
        undefined,
        time + i * 100 + j + 1,
      );
  }
  assert.equal(rows.length, YOUTUBE_DIAGNOSTIC_TITLES);
  assert(rows.every((row) => row.events.length === YOUTUBE_DIAGNOSTIC_EVENTS));
  assert.equal(rows[0].videoId, "triage00018");
  assert.equal(rows.at(-1).videoId, "triage00029");
  assert(rows.every((row) => row.loads === 1));
  const revisited = recordYoutubeEmbedEvidence(
    rows,
    rows[0].videoId,
    "loading",
    undefined,
    time + 10000,
  );
  assert.equal(revisited.at(-1).loads, 2);
  assert.equal(revisited.length, 12);
});
test("invalid identity, phase, time and error payloads keep the prior diagnostics untouched", () => {
  const rows = record([], "ready");
  for (const [videoId, phase, code, at] of [
    ["../SECRET", "error", 101, time],
    [id, "garbage", 101, time],
    [id, "error", "private provider payload", time],
    [id, "error", Infinity, time],
    [id, "error", 101, 0],
    [id, "error", 101, NaN],
    [id, "error", 101, time - 1],
  ])
    assert.equal(recordYoutubeEmbedEvidence(rows, videoId, phase, code, at), rows);
});
test("diagnostic JSON rebuilds a strict public whitelist without room, local, account or arbitrary provider state", () => {
  const row = {
    ...record([], "error", 153)[0],
    room: "SECRET_ROOM",
    peer: "SECRET_PEER",
    path: "SECRET_PATH",
    account: "SECRET_ACCOUNT",
    title: "SECRET_TITLE",
    watchUrl: "https://evil.example/SECRET",
    events: [
      {
        phase: "error",
        at: time,
        code: 153,
        token: "SECRET_TOKEN",
        providerPayload: { cookies: "SECRET_COOKIE" },
      },
    ],
  };
  const raw = exportYoutubeEmbedEvidence([row], time),
    out = JSON.parse(raw);
  assert.doesNotMatch(raw, /SECRET|providerPayload/);
  assert.equal(out.version, 2);
  assert.equal(out.titles[0].watchUrl, undefined);
  assert.equal(out.titles[0].videoId,undefined);
  assert.equal(out.diagnostic.kind,"youtube-player");
  assert.deepEqual(out.titles[0].events, [{ phase: "error", at: time, code: 153 }]);
  assert.throws(() => exportYoutubeEmbedEvidence([row], Infinity));
});
test("late error evidence for an earlier clock cannot rewind newer recovery or alter its attempt count", () => {
  const rows = record(record([], "loading"), "playing", undefined, time + 100);
  assert.equal(record(rows, "error", 101, time + 50), rows);
  assert.equal(rows[0].loads, 1);
  const recovered = record(rows, "error", 5, time + 200);
  assert.equal(recovered[0].phase, "error");
  assert.equal(recovered[0].loads, 1);
  assert.equal(rows[0].phase, "playing");
});
