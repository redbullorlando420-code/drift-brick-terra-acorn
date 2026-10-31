import test from "node:test";
import assert from "node:assert/strict";
import {
  runTwitchCanary,
  canaryResume,
  canaryCreators,
  summarizeCanaryTask,
} from "./twitch-canary-core.mjs";
const empty = {
  channel: {
    kind: "twitch",
    channelId: "1",
    live: false,
    liveCheckedAt: 1,
    twitchArchiveDiagnostics: { pages: 1, stopReason: "exhausted" },
    twitchClipDiagnostics: { pages: 1, windows: [{ stop: "exhausted" }] },
  },
  videos: [],
};
const init = { method: "POST", headers: { "client-id": "public-fixture" } };
test("concurrent underlying requests cannot race past the strict ceiling", async () => {
  let calls=0;
  const report=await runTwitchCanary({creators:['a'],maxRequests:3,gapMs:0,fetcher:async()=>{calls++;return Response.json({});},runTask:async(_task,fetch)=>{await Promise.allSettled(Array.from({length:30},async()=>{const r=await fetch('https://gql.twitch.tv/gql',init);await r.json();}));return empty;}});
  assert.equal(calls,3);assert.equal(report.requests.length,3);assert.equal(report.tasks[0].state,'request-limit');
  assert.deepEqual(summarizeCanaryTask('clips',{...empty,channel:{...empty.channel,twitchClipDiagnostics:{pages:1,stopReason:'quota',windows:[{stop:'quota'}]}}}).stops,['quota','quota']);
});
test("request cap applies even when production catches its error; resume skips completed contracts", async () => {
  let calls = 0;
  const fetcher = async () => {
    calls++;
    return Response.json({});
  };
  const runTask = async (_task, fetch) => {
    for (let i = 0; i < 2; i++) await (await fetch("https://gql.twitch.tv/gql", init)).json();
    return empty;
  };
  const report = await runTwitchCanary({
    creators: ["PublicCreator"],
    maxRequests: 3,
    fetcher,
    runTask,
    gapMs: 0,
  });
  assert.equal(calls, 3);
  assert.equal(report.requests.length, 3);
  assert.deepEqual(
    report.tasks.map((t) => t.state),
    ["empty", "request-limit", "not-run"],
  );
  assert.equal(report.ok, false);
  const resumed = await runTwitchCanary({
    resume: report,
    maxRequests: 4,
    fetcher,
    runTask,
    gapMs: 0,
  });
  assert.equal(calls, 7);
  assert.equal(resumed.ok, true);
  assert.equal(resumed.tasks[0].checkedAt, report.tasks[0].checkedAt);
});
test("rate-limited runs stop without additional requests and resume honors saved provider cooldown", async () => {
  let calls = 0;
  const fetcher = async () => {
    calls++;
    return Response.json({}, { status: 429, headers: { "retry-after": "120" } });
  };
  const runTask = async (t, fetch) => {
    await (await fetch("https://gql.twitch.tv/gql", init)).json();
    return empty;
  };
  const report = await runTwitchCanary({
    creators: ["a", "b"],
    fetcher,
    runTask,
    now: () => 1000,
    gapMs: 0,
  });
  assert.equal(calls, 1);
  assert.equal(report.tasks[0].state, "rate-limited");
  assert.equal(report.retryAt, 121000);
  assert(!report.ok);
  await runTwitchCanary({ resume: report, fetcher, runTask, now: () => 2000, gapMs: 0 });
  assert.equal(calls, 1);
});
test("reports reject unsafe targets, future resume schemas and arbitrary fields without exposing error bodies", async () => {
  for (const invalid of [[], ["https://twitch.tv/a"], ["--cookie"], ["a", "b", "c", "d"]])
    assert.throws(() => canaryCreators(invalid));
  assert.throws(() => canaryResume({ schema: 9 }));
  const report = await runTwitchCanary({
    creators: ["a"],
    maxRequests: 1,
    fetcher: async () => Response.json({}),
    runTask: async (t, fetch) => {
      await fetch("https://gql.twitch.tv/gql", init);
      throw Error("Cookie: SECRET_CANARY");
    },
    gapMs: 0,
  });
  assert(!JSON.stringify(report).includes("SECRET_CANARY"));
  const safe = canaryResume({
    ...report,
    authorization: "SECRET_CANARY",
    tasks: report.tasks.map((t) => ({ ...t, raw: "SECRET_CANARY" })),
  });
  assert(!JSON.stringify(safe).includes("SECRET_CANARY"));
  const blocked = await runTwitchCanary({
    creators: ["a"],
    runTask: async (t, fetch) =>
      fetch("https://gql.twitch.tv/gql", { ...init, headers: { cookie: "SECRET_COOKIE" } }),
    fetcher: () => {
      throw Error("must not dispatch");
    },
    gapMs: 0,
  });
  assert.equal(blocked.requests.length, 0);
  assert(!blocked.ok);
});
test("unreadable live/identity/subtype results cannot be passed or confused with a healthy empty shelf", () => {
  assert.equal(summarizeCanaryTask("clips", empty).state, "empty");
  assert.equal(
    summarizeCanaryTask("live", {
      ...empty,
      videos: [{ remote: { kind: "twitch", live: true, viewers: 2 } }],
    }).state,
    "passed",
  );
  assert.throws(() =>
    summarizeCanaryTask("live", { ...empty, channel: { kind: "twitch", channelId: "1" } }),
  );
  assert.throws(() =>
    summarizeCanaryTask("vods", {
      ...empty,
      videos: [{ extension: "vod", remote: { kind: "twitch", videoId: "42" } }],
    }),
  );
  assert.throws(() =>
    summarizeCanaryTask("clips", {
      ...empty,
      channel: { ...empty.channel, lastClipFailure: { message: "broken" } },
    }),
  );
});
