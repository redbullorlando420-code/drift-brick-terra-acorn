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
const identity = await import("../src/lib/videos/twitch-channel-identity.ts");
const { dedupeFollows, mergeResolvedFollow } = await import("../src/lib/videos/follow-identity.ts");
const { normalizeFollowCheckpoints } = await import("../src/lib/videos/follow-checkpoints.ts");
const { reviewPackConflicts, resolvePackConflicts } =
  await import("../src/lib/videos/pack-conflicts.ts");
const { readPackReview } = await import("../src/lib/videos/pack-review-repository.ts");
const { readAliasJournal } = await import("../src/lib/videos/twitch-alias-repository.ts");
const { inspectPreparedPack } = await import("../src/lib/videos/pack-preflight.ts");
const { runCheckTwitchAlias, runRefreshRemotes } = await import("../src/lib/remote/api.ts");

test("server identity lookup uses a single fixed-host user-ID query; live refresh rejects recycled IDs", async () => {
  const original = globalThis.fetch;
  let calls = 0,
    mode = "alias";
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(String(url), "https://gql.twitch.tv/gql");
    assert(init.signal);
    const request = JSON.parse(init.body);
    if (mode === "alias") {
      assert.deepEqual(request.variables, { id: "123" });
      assert(request.query.includes("user(id:$id)"));
      return new Response(JSON.stringify({ data: { user: { id: "123", login: "renamed" } } }));
    }
    return new Response(
      JSON.stringify({
        data: {
          user: {
            id: "456",
            displayName: "Recycled user",
            stream: { title: "Live", viewersCount: 25 },
          },
        },
      }),
    );
  };
  try {
    assert.equal((await runCheckTwitchAlias({ userId: "123", from: "old" })).alias.to, "renamed");
    await assert.rejects(runCheckTwitchAlias({ userId: "bad", from: "old" }));
    assert.equal(calls, 1);
    mode = "live";
    const result = await runRefreshRemotes({ channels: [channel], twitchLiveOnly: true });
    assert.equal(result.videos.length, 0);
    assert.equal(result.refreshedIds.length, 0);
    assert.equal(result.channels[0].channelId, "123");
    assert.match(result.channels[0].lastLiveFailure.message, /identity changed/);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
  }
});
const channel = {
  id: "tw:old",
  kind: "twitch",
  handle: "old",
  title: "Old creator",
  channelId: "123",
  twitchPullPolicy: { version: 1, vods: false, clips: true, priority: "high" },
};
const alias = () => ({
  version: 1,
  userId: "123",
  from: "old",
  to: "renamed",
  checkedAt: Date.now(),
});
test("a verified rename retains canonical identity, policy, old aliases and creator signals", () => {
  const next = identity.applyTwitchAlias(channel, alias());
  assert.equal(next.id, channel.id);
  assert.equal(next.channelId, "123");
  assert.equal(next.twitchPullPolicy, channel.twitchPullPolicy);
  assert.deepEqual(next.twitchAliases, ["old"]);
  assert.equal(next.twitchCreatorKey, "old creator");
  assert.equal(next.twitchAliasRevision, 1);
  const vod = {
    id: "tw:v:55",
    folderId: "tw:renamed",
    extension: "vod",
    remote: { kind: "twitch", videoId: "55", channelId: "123" },
  };
  const bound = identity.bindTwitchSource(vod, next);
  assert.equal(bound.id, vod.id);
  assert.equal(bound.folderId, channel.id);
  assert.equal(bound.remote.twitchCreatorKey, "old creator");
  assert.deepEqual(bound.remote.sourceIds, ["tw:old"]);
  assert.equal(
    identity.bindTwitchSource(
      { ...vod, id: "tw:renamed:live", extension: "live", remote: { ...vod.remote, live: true } },
      next,
    ).id,
    "tw:old:live",
  );
  const refreshed=mergeResolvedFollow([next],{...next,id:'tw:renamed',twitchAliases:undefined,twitchPullPolicy:undefined});assert.equal(refreshed[0].id,'tw:old');assert.deepEqual(refreshed[0].twitchAliases,['old']);assert.equal(refreshed[0].twitchPullPolicy,channel.twitchPullPolicy);
  assert.deepEqual(normalizeFollowCheckpoints(next).twitchAliases, ["old"]);
  assert.equal(normalizeFollowCheckpoints(next).twitchAliasRevision, 1);
});
test("recycled logins stay separate, receive no pull policy or creator signal key from their old owner", () => {
  const incoming = {
    ...channel,
    channelId: "456",
    title: "Old creator",
    twitchPullPolicy: undefined,
  };
  const safe = identity.separateTwitchIdentity([channel], incoming);
  assert.equal(safe.id, "tw:user:456");
  assert.equal(safe.twitchCreatorKey, "twitch-user:456");
  assert.equal(safe.twitchPullPolicy, undefined);
  const rows = mergeResolvedFollow([channel], incoming);
  assert.equal(rows.length, 2);
  assert.equal(rows[1], channel);
  assert.equal(rows[0].twitchPullPolicy, undefined);
  assert.equal(dedupeFollows(rows).length, 2);
  assert.throws(() => identity.assertTwitchContinuity(channel, incoming), /identity changed/);
  assert.equal(identity.twitchObservationCurrent(channel, incoming), false);
  const moved = identity.applyTwitchAlias(channel, alias());
  assert.equal(identity.twitchObservationCurrent(moved, channel), false);
});
test("a login-only import cannot silently rename an existing stable user", () => {
  assert.deepEqual(
    mergeResolvedFollow([channel], { ...channel, id: "tw:renamed", handle: "renamed" }),
    [channel],
  );
});
test("identity evidence rejects errors, null, mismatched IDs, malformed logins, expiry and full journals", () => {
  assert.equal(
    identity.parseTwitchAliasResponse(
      { data: { user: { id: "123", login: "old" } } },
      "123",
      "old",
    ),
    undefined,
  );
  assert.equal(
    identity.parseTwitchAliasResponse(
      { data: { user: { id: "123", login: "renamed" } } },
      "123",
      "old",
    ).to,
    "renamed",
  );
  for (const raw of [
    { errors: [{}], data: { user: null } },
    { data: {} },
    { data: { user: null } },
    { data: { user: { id: "456", login: "renamed" } } },
    { data: { user: { id: "123", login: "bad/name" } } },
  ])
    assert.throws(() => identity.parseTwitchAliasResponse(raw, "123", "old"));
  assert.throws(() =>
    identity.applyTwitchAlias(channel, { ...alias(), checkedAt: Date.now() - 301000 }),
  );
  assert.throws(() => identity.applyTwitchAlias(channel, { ...alias(), userId: "999" }));
  assert.throws(() => readAliasJournal({ version: 2 }));
  assert.throws(() => readAliasJournal({ version: 1, revision: 0, entries: Array(129).fill({}) }));
});
const current = () =>
  new Map([
    [
      "marks/ratings.json",
      {
        ratings: { v: 5 },
        ratingHistory: { v: { rating: 5, updatedAt: 200 } },
        notes: { v: "Keep my note" },
        watchTime: { v: { preview: 90, fullscreen: 10 } },
      },
    ],
    [
      "resume/resume.json",
      {
        progress: { v: { t: 20, d: 100, at: 200 } },
        resumeProgress: { "id:v": { t: 20, d: 100, at: 200 } },
      },
    ],
    [
      "marks/metadata.json",
      {
        tags: { v: ["racing"] },
        categories: { v: "Sports" },
        metadataProvenance: {
          v: { tags: { racing: "manual" }, lockedFields: ["tags"], manualTagsAt: 200 },
        },
      },
    ],
  ]);
const incoming = () =>
  new Map([
    [
      "marks/ratings.json",
      {
        ratings: { v: 1, new: 4 },
        ratingHistory: { v: { rating: 1, updatedAt: 100 }, new: { rating: 4, updatedAt: 100 } },
        notes: { v: "Imported note" },
        watchTime: { v: { preview: 5, fullscreen: 30 } },
      },
    ],
    [
      "resume/resume.json",
      {
        progress: { v: { t: 80, d: 100, at: 100 } },
        resumeProgress: { "id:v": { t: 80, d: 100, at: 100 } },
      },
    ],
    [
      "marks/metadata.json",
      {
        tags: { v: ["cars"] },
        categories: { v: "Sports" },
        metadataProvenance: {
          v: { tags: { cars: "provider:youtube" }, lockedFields: ["category"] },
        },
      },
    ],
  ]);
test("opposing ratings and notes require choices; safe merge preserves newer backward seek and tag locks", async () => {
  const before = current(),
    after = incoming(),
    review = await reviewPackConflicts(after, before);
  assert.equal(review.conflicts.length, 6);
  assert.throws(() => resolvePackConflicts(after, review, {}), /every differing/);
  const rating = review.conflicts.find((c) => c.field === "ratings");
  assert.equal(rating.safe, undefined);
  assert.throws(
    () =>
      resolvePackConflicts(
        after,
        review,
        Object.fromEntries(review.conflicts.map((c) => [c.id, "safe"])),
      ),
    /no safe/,
  );
  const result = resolvePackConflicts(
    after,
    review,
    Object.fromEntries(
      review.conflicts.map((c) => [c.id, c.safe !== undefined ? "safe" : "current"]),
    ),
  );
  assert.equal(result.get("marks/ratings.json").ratings.v, 5);
  assert.equal(result.get("marks/ratings.json").ratings.new, 4);
  assert.equal(result.get("marks/ratings.json").ratingHistory.v.rating, 5);
  assert.equal(result.get("marks/ratings.json").notes.v, "Keep my note");
  assert.deepEqual(result.get("marks/ratings.json").watchTime.v, { preview: 90, fullscreen: 30 });
  assert.equal(result.get("resume/resume.json").progress.v.t, 20);
  assert.deepEqual(result.get("marks/metadata.json").tags.v, ["racing", "cars"]);
  assert.deepEqual(result.get("marks/metadata.json").metadataProvenance.v.lockedFields, [
    "tags",
    "category",
  ]);
  assert.equal(after.get("marks/ratings.json").ratings.v, 1);
  assert.deepEqual(after.get("marks/metadata.json").tags.v, ["cars"]);
});
test("imported rating and its timestamp travel together; opposing categories cannot auto-merge", async () => {
  const after = incoming();
  after.get("marks/metadata.json").categories.v = "Film";
  const review = await reviewPackConflicts(after, current());
  assert.equal(review.conflicts.find((c) => c.field === "metadata").safe, undefined);
  const result = resolvePackConflicts(
    after,
    review,
    Object.fromEntries(review.conflicts.map((c) => [c.id, "imported"])),
  );
  assert.equal(result.get("marks/ratings.json").ratings.v, 1);
  assert.equal(result.get("marks/ratings.json").ratingHistory.v.updatedAt, 100);
});
test("review identity covers affected values and ignores unrelated edits, with deterministic order and cancellation", async () => {
  const a = await reviewPackConflicts(incoming(), current()),
    b = await reviewPackConflicts(
      new Map([...incoming()].reverse()),
      new Map([...current()].reverse()),
    );
  assert.equal(a.fingerprint, b.fingerprint);
  const changed = current();
  changed.get("marks/ratings.json").notes.other = "New edit";
  assert.equal((await reviewPackConflicts(incoming(), changed)).fingerprint, a.fingerprint);
  changed.get("marks/ratings.json").notes.v = "Changed relevant note";
  assert.notEqual((await reviewPackConflicts(incoming(), changed)).fingerprint, a.fingerprint);
  const c = new AbortController();
  c.abort();
  await assert.rejects(reviewPackConflicts(incoming(), current(), c.signal));
});
test("metadata preflight accepts real provenance and rejects unsupported locks and malformed tags", async () => {
  const files = incoming();
  assert.equal((await inspectPreparedPack(files)).report.ok, true);
  files.get("marks/metadata.json").metadataProvenance.v.lockedFields = ["password"];
  assert.equal((await inspectPreparedPack(files)).report.ok, false);
  files.get("marks/metadata.json").metadataProvenance.v.lockedFields = ["tags"];
  files.get("marks/metadata.json").tags.v = [5];
  assert.equal((await inspectPreparedPack(files)).report.ok, false);
});
test("future or malformed saved reviews are retained as errors, never normalized into an empty draft", () => {
  assert.equal(readPackReview(undefined), undefined);
  for (const raw of [{ version: 2 }, { version: 1, files: [] }, null])
    assert.throws(() => readPackReview(raw));
});

test("a one-title review never enumerates unrelated large-library metadata or rating maps", async () => {
  const guarded = new Proxy(
    { v: 5 },
    {
      ownKeys() {
        throw Error("Full library enumeration is forbidden");
      },
    },
  );
  const before = new Map([
    ["marks/ratings.json", { ratings: guarded, notes: { v: "Current" } }],
    [
      "marks/metadata.json",
      new Proxy(
        {},
        {
          ownKeys() {
            throw Error("Unrelated metadata should not be read");
          },
        },
      ),
    ],
  ]);
  const review = await reviewPackConflicts(
    new Map([["marks/ratings.json", { ratings: { v: 1 } }]]),
    before,
  );
  assert.equal(review.conflicts.length, 1);
  assert.equal(review.conflicts[0].current.rating, 5);
});
test("a large review yields and enforces its conflict cap without changing either snapshot", async () => {
  const ratings = Object.fromEntries(Array.from({ length: 20001 }, (_, i) => ["v" + i, 1])),
    other = Object.fromEntries(Object.keys(ratings).map((k) => [k, 5]));
  let ran = false;
  setTimeout(() => (ran = true), 0);
  await assert.rejects(
    reviewPackConflicts(
      new Map([["marks/ratings.json", { ratings }]]),
      new Map([["marks/ratings.json", { ratings: other }]]),
    ),
    /20,000/,
  );
  assert.equal(ran, true);
  assert.equal(ratings.v0, 1);
  assert.equal(other.v0, 5);
});
