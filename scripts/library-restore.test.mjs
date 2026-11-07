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
const { planLibraryRestore } = await import("../src/lib/videos/library-restore-plan.ts"),
  { verifyRestoreSnapshot, RESTORE_MIRRORS } =
    await import("../src/lib/videos/restore-snapshot.ts"),
  { readRestoreControl } = await import("../src/lib/restore-epoch.ts");
const current = () =>
  new Map([
    [
      "follows/twitch.json",
      {
        channels: [
          {
            id: "tw:old",
            kind: "twitch",
            handle: "old",
            title: "Creator",
            channelId: "123",
            twitchPullPolicy: { version: 1, clips: false, vods: true, priority: "high" },
          },
        ],
      },
    ],
    ["history/history.json", { entries: [{ id: "v", at: 100, eventId: "a" }] }],
    ["links/links.json", { links: [] }],
    ["marks/shelves.json", { favorites: ["v"], likes: [] }],
    ["marks/view-counts.json", { v: 5 }],
    ["marks/came-counts.json", {}],
    [
      "resume/resume.json",
      {
        progress: { v: { t: 20, d: 100, at: 200 } },
        resumeProgress: { "id:v": { t: 20, d: 100, at: 200 } },
      },
    ],
    [
      "marks/ratings.json",
      {
        ratings: { v: 5, unrelated: 4 },
        ratingHistory: { v: { rating: 5, updatedAt: 200 } },
        notes: { v: "Original" },
        creatorRatings: { creator: 4 },
        watchTime: {},
      },
    ],
    ["marks/tag-hearts.json", { tagLikes: { racing: true }, tagHeartHistory: {} }],
    [
      "marks/metadata.json",
      {
        tags: { v: ["racing"] },
        metadataProvenance: {
          v: { tags: { racing: "manual" }, lockedFields: ["tags"], updatedAt: 100 },
        },
        categories: { v: "Sports" },
      },
    ],
    ["photos/sources.json", { sources: [] }],
    [
      "photos/likes.json",
      { meta: { photo: { favorite: true, tags: ["family"] } }, likes: ["photo"] },
    ],
    ["follows/collections.json", { collections: [] }],
  ]);
const base = () => ({
  version: 1,
  rows: [
    {
      store: "activity",
      key: "preferences",
      value: {
        sourceId: "settings",
        privateFolderIds: ["private-source"],
        adultPinHash: "keep-pin",
        tags: {},
        categories: {},
      },
    },
    { store: "activity", key: "catalog-metadata:v", value: { id: "v" } },
    { store: "activity-journal", key: "a", value: { key: "a", entry: { id: "v", at: 100 } } },
  ],
  mirrors: Object.fromEntries(RESTORE_MIRRORS.map((k) => [k, null])),
});
test("a pure restore plan checkpoints every personal field together and preserves unrelated preferences", async () => {
  const original = current(),
    before = base(),
    incoming = new Map([
      [
        "marks/ratings.json",
        {
          ratings: { v: 1 },
          ratingHistory: { v: { rating: 1, updatedAt: 50 } },
          notes: { v: "Imported" },
        },
      ],
      [
        "marks/metadata.json",
        {
          tags: { v: ["cars"] },
          metadataProvenance: {
            v: { tags: { cars: "provider:twitch" }, lockedFields: ["category"] },
          },
          categories: { v: "Sports" },
        },
      ],
      [
        "resume/resume.json",
        {
          progress: { v: { t: 60, d: 100, at: 50 } },
          resumeProgress: { "id:v": { t: 60, d: 100, at: 50 } },
        },
      ],
    ]);
  before.rows.push({store:"activity",key:"feedback",value:{ratings:{unrelated:4},manualTimeline:{version:1,entries:[{id:"old-inverse",kind:"rating",target:"unrelated",label:"Unrelated",before:1,after:4,at:100}]}}});
  const after = await planLibraryRestore(before, original, incoming, "merge", 1000),
    docs = new Map(after.rows.map((r) => [r.key, r.value]));
  assert.deepEqual(docs.get("feedback").manualTimeline,{version:1,entries:[],updatedAt:1000});
  assert.equal(docs.get("feedback").ratings.v, 1);
  assert.equal(docs.get("feedback").ratings.unrelated, 4);
  assert.equal(docs.get("feedback").notes.v, "Imported");
  assert.equal(docs.get("resume").resumeProgress["id:v"].t, 60);
  assert.equal(docs.get("primary").resumeProgress["id:v"].t, 60);
  assert.equal(docs.get("preferences").resumeProgress["id:v"].t, 60);
  assert.deepEqual(docs.get("preferences").tags.v, ["cars"]);
  assert.deepEqual(
    new Set(docs.get("preferences").metadataProvenance.v.lockedFields),
    new Set(["tags", "category"]),
  );
  assert.equal(docs.get("preferences").adultPinHash, "keep-pin");
  assert.deepEqual(docs.get("preferences").privateFolderIds, ["private-source"]);
  assert.equal(docs.get("photos").meta.photo.favorite, true);
  assert(
    !after.rows.some(
      (r) => r.key.startsWith("catalog-metadata:") || r.store === "activity-journal",
    ),
  );
  assert.equal(original.get("marks/ratings.json").ratings.v, 5);
  assert.equal(before.rows.length, 4);
  assert.equal(before.rows.find(r=>r.key==='feedback').value.manualTimeline.entries[0].id,'old-inverse');
  assert.equal(after.mirrors["reelcase.media-feedback.v1"], null);
  assert.equal(after.mirrors["reelcase.catalog-edits.v1"], null);
  await verifyRestoreSnapshot(after);
});
test("empty follow replacement and history merging are explicit and provider-free", async () => {
  const result = await planLibraryRestore(
    base(),
    current(),
    new Map([
      ["follows/twitch.json", { channels: [] }],
      [
        "history/history.json",
        {
          entries: [
            { id: "v", at: 100, eventId: "a" },
            { id: "x", at: 200, eventId: "b" },
          ],
        },
      ],
    ]),
    "replace-follows",
  );
  const docs = new Map(result.rows.map((r) => [r.key, r.value]));
  assert.deepEqual(docs.get("follows").channels, []);
  assert.equal(docs.get("history").entries.length, 2);
  assert.equal(docs.get("feedback").ratings.v, 5);
});
test("snapshot verification rejects tampering, unsupported stores, duplicates and cancellation", async () => {
  const a = base(),
    proof = await verifyRestoreSnapshot(a);
  a.rows[0].value.adultPinHash = "changed";
  assert.notEqual((await verifyRestoreSnapshot(a)).hash, proof.hash);
  await assert.rejects(
    verifyRestoreSnapshot({ ...base(), rows: [...base().rows, base().rows[0]] }),
    /duplicate/,
  );
  await assert.rejects(
    verifyRestoreSnapshot({ ...base(), rows: [{ store: "videos", key: "v", value: {} }] }),
    /Invalid/,
  );
  const c = new AbortController();
  c.abort();
  await assert.rejects(verifyRestoreSnapshot(base(), c.signal));
  await assert.rejects(planLibraryRestore(base(), current(), new Map(), "merge", 100, c.signal));
});
test("future control records fail closed instead of discarding an existing generation", () => {
  assert.equal(readRestoreControl(undefined).epoch, 0);
  for (const raw of [
    { version: 2 },
    { version: 1, epoch: 1, phase: "ready", at: 10 },
    { version: 1, epoch: -1, phase: "idle", at: 0 },
  ])
    assert.throws(() => readRestoreControl(raw));
});

test("future existing feature data cannot be overwritten by an older normalized reader", async () => {
  const snapshot = base();
  snapshot.rows.push({
    store: "activity",
    key: "film-reviews",
    value: { version: 2, privateData: "keep" },
  });
  await assert.rejects(
    planLibraryRestore(snapshot, current(), new Map(), "merge"),
    /version|ledger|Unsupported/i,
  );
  assert.equal(snapshot.rows.at(-1).value.privateData, "keep");
});

test("rating-history-only imports require a choice and checkpoint the chosen pair coherently", async () => {
  const { reviewPackConflicts, resolvePackConflicts } =
    await import("../src/lib/videos/pack-conflicts.ts");
  const incoming = new Map([
      ["marks/ratings.json", { ratingHistory: { v: { rating: 1, updatedAt: 300 } } }],
    ]),
    review = await reviewPackConflicts(incoming, current());
  assert.equal(review.conflicts.length, 1);
  assert.equal(review.conflicts[0].field, "ratings");
  for (const choice of ["current", "imported"]) {
    const resolved = resolvePackConflicts(incoming, review, { [review.conflicts[0].id]: choice }),
      planned = await planLibraryRestore(base(), current(), resolved, "merge"),
      feedback = planned.rows.find((r) => r.key === "feedback").value;
    assert.equal(feedback.ratings.v, choice === "current" ? 5 : 1);
    assert.equal(feedback.ratingHistory.v.rating, feedback.ratings.v);
  }
});
test("follow merge retains a newer observation without changing the stable source identity", async () => {
  const packet = current(),
    old = packet.get("follows/twitch.json").channels[0];
  old.lastCheckedAt = 100;
  const planned = await planLibraryRestore(
    base(),
    packet,
    new Map([
      [
        "follows/twitch.json",
        { channels: [{ ...old, lastCheckedAt: 500, catalogCheckedAt: 500 }] },
      ],
    ]),
    "merge",
  );
  const follow = planned.rows.find((r) => r.key === "follows").value.channels[0];
  assert.equal(follow.id, "tw:old");
  assert.equal(follow.lastCheckedAt, 500);
  assert.equal(follow.channelId, "123");
});

test("personal-only restore cannot import an archive continuation without its accepted catalog", async () => {
  const { restoreActivityKey } = await import("../src/lib/videos/restore-snapshot.ts");
  assert.equal(restoreActivityKey("adult-archive-cursors:v1"), false);
  const snapshot = base();
  snapshot.rows.push({store:"activity",key:"adult-archive-cursors:v1",value:{version:1,positions:{}}});
  await assert.rejects(verifyRestoreSnapshot(snapshot), /unsupported|invalid|unknown/i);
});
