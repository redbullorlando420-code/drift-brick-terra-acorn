import test from "node:test";
import assert from "node:assert/strict";
import { prepareGuide, answerGuideQuery } from "../src/lib/videos/guide-picks.ts";
import {
  parseFeedbackTimeline,
  appendFeedbackOperation,
  undoFeedbackOperation,
  manualFeedbackFingerprint,
} from "../src/lib/videos/feedback-timeline.ts";
import { parseRecommendationTuning } from "../src/lib/recommendation-tuning.ts";
import { mergeFeedbackWatch } from "../src/lib/videos/feedback-timeline.ts";
import { mergeMissionPlan } from "../src/lib/mission-plan.ts";
import { ALL_NEXT_LEVEL_MISSIONS } from "../src/lib/mission-roadmap.ts";
const now = Date.UTC(2026, 10, 6, 12),
  turn = async () => {},
  channel = "UCabcdefghijklmnopqrstuv";
const row = (id, channelId = channel) => ({
  id,
  name: "Racing " + id,
  folderId: "youtube",
  path: id,
  extension: "mp4",
  mime: "video/mp4",
  size: 1,
  duration: 1200,
  addedAt: now - 86400000,
  remote: {
    kind: "youtube",
    videoId: id,
    channelId,
    channelName: channelId,
    publishedSource: "provider",
    publishedPrecision: "instant",
    publishedDate: new Date(now - 86400000).toISOString(),
  },
});
const base = (videos) => ({
  videos,
  tags: {},
  favorites: {},
  likes: {},
  history: [],
  follows: [
    {
      id: "yt:" + channel,
      kind: "youtube",
      channelId: channel,
      title: "New creator",
      handle: "new",
    },
  ],
  continuity: { version: 1, explorationSlots: 1, cooldownHours: 24 },
});
test("cold follows have at most two explained exploration slots while established picks remain", async () => {
  const established = Array.from({ length: 20 }, (_, i) =>
      row("old" + i, "UCzzzzzzzzzzzzzzzzzzzzzz"),
    ),
    fresh = Array.from({ length: 5 }, (_, i) => row("fresh" + i)),
    input = {
      ...base([...established, ...fresh]),
      likes: Object.fromEntries(established.slice(0, 8).map((v) => [v.id, true])),
    };
  const result = await prepareGuide(input, 1, now, turn);
  assert(result.continuity.explored <= 1);
  assert(result.picks.some((v) => v.id.startsWith("old")));
  assert.equal(result.continuity.explored, 1);
  const selected = result.picks.find((v) =>
    result.explanations[v.id].reasons.some((r) => r.id === "follow-exploration"),
  );
  assert(selected);
  assert.equal(result.explanations[selected.id].basis, "discovery");
});
test("unfollow, ambiguous identity, stale/unknown publication, watch history or explicit feedback retires exploration", async () => {
  const v = row("new");
  for (const input of [
    { ...base([v]), follows: [] },
    { ...base([v]), follows: [{ ...base([]).follows[0], channelId: undefined }] },
    { ...base([v]), history: [{ id: v.id }] },
    { ...base([v]), ratingOf: () => 1 },
    { ...base([v]), creatorHasFeedback: () => true },
    {
      ...base([
        { ...v, remote: { ...v.remote, publishedPrecision: "unknown", publishedDate: undefined } },
      ]),
    },
    {
      ...base([
        {
          ...v,
          addedAt: Date.UTC(2020, 0, 1),
          remote: { ...v.remote, publishedDate: "2020-01-01T00:00:00Z" },
        },
      ]),
    },
    {
      ...base([v]),
      recommendationRejections: {
        version: 1,
        updatedAt: now,
        entries: [{ scope: "creator", target: "youtube:" + channel, label: "Creator", at: now }],
      },
    },
  ]) {
    const r = await prepareGuide(input, 1, now, turn);
    assert.equal(r.continuity.explored, 0);
  }
});
test("cooldown persists from supplied saved exposure, protects saved titles and explicit searches, and never changes history", async () => {
  const videos = [row("repeat"), row("favorite"), row("liked"), row("rated"), row("other")],
    input = {
      ...base(videos),
      favorites: { favorite: true },
      likes: { liked: true },
      ratingOf: (id) => (id === "rated" ? 4 : 0),
      recommendationExposure: {
        version: 1,
        updatedAt: now,
        entries: videos
          .slice(0, 4)
          .map((v) => ({ key: "youtube:" + v.id, count: 2, at: now - 60000 })),
      },
    };
  const original = JSON.stringify(input);
  const a = await prepareGuide(input, 1, now, turn);
  assert.equal(a.continuity.suppressed, 1);
  assert(!a.picks.some((v) => v.id === "repeat"));
  for (const id of ["favorite", "liked", "rated"]) assert(a.picks.some((v) => v.id === id));
  const review = await prepareGuide({ ...input, showSuppressed: true }, 1, now, turn);
  assert.deepEqual(
    review.picks.map((v) => v.id),
    ["repeat"],
  );
  assert(review.explanations.repeat.notices.some((s) => s.includes("temporary cooldown")));
  const query = await answerGuideQuery(input, "repeat", 1, now, turn);
  assert(query.picks.some((v) => v.id === "repeat"));
  assert.equal(JSON.stringify(input), original);
  const later = await prepareGuide(input, 1, now + 25 * 3600000, turn);
  assert(later.picks.some((v) => v.id === "repeat"));
  const cleared = await prepareGuide(
    { ...input, recommendationExposure: { version: 1, updatedAt: now, entries: [] } },
    1,
    now,
    turn,
  );
  assert(cleared.picks.some((v) => v.id === "repeat"));
});
const fields = () => ({
  ratings: { a: 5 },
  ratingHistory: { a: { rating: 5, updatedAt: 1 } },
  creatorRatings: {},
  creatorLikes: {},
  creatorFavorites: {},
  tagLikes: {},
  recommendationRejections: { version: 1, updatedAt: 0, entries: [] },
});
test("selected feedback undo respects newer same-target edits, preserves unrelated fields, and survives serialization", () => {
  let f = fields();
  const op = { id: "op1", kind: "rating", target: "a", label: "A", before: 2, after: 5, at: 2 };
  f.manualTimeline = appendFeedbackOperation(f, op);
  f.manualTimeline = appendFeedbackOperation(f, {
    id: "op2",
    kind: "tagLike",
    target: "racing",
    label: "racing",
    before: false,
    after: true,
    at: 3,
  });
  f.tagLikes.racing = true;
  const restored = JSON.parse(JSON.stringify(f));
  const result = undoFeedbackOperation(restored, "op1", 4);
  assert.equal(result.ratings.a, 2);
  assert.equal(result.tagLikes.racing, true);
  assert.equal(result.manualTimeline.entries[1].undoneAt, 4);
  assert.equal(restored.ratings.a, 5);
  const newer = { ...f, manualTimeline: appendFeedbackOperation(f, { ...op, id: "newer", at: 5 }) };
  assert.throws(() => undoFeedbackOperation(newer, "op1"), /newer/);
  assert.throws(() => undoFeedbackOperation({ ...f, ratings: { a: 1 } }, "op1"), /newer/);
  assert.throws(() => undoFeedbackOperation(result, "op1"), /newer/);
  assert.notEqual(manualFeedbackFingerprint(f), manualFeedbackFingerprint(newer));
});
test("rejection undo retains later rating and other rejection decisions; history is bounded and future schemas fail closed", () => {
  let f = fields();
  const entry = { scope: "title", target: "youtube:a", label: "A", at: 2 };
  f.recommendationRejections = { version: 1, updatedAt: 2, entries: [entry] };
  f.manualTimeline = appendFeedbackOperation(f, {
    id: "r1",
    kind: "rejection",
    target: "title:youtube:a",
    label: "A",
    before: null,
    after: entry,
    at: 2,
  });
  const next = undoFeedbackOperation(f, "r1", 3);
  assert.equal(next.ratings.a, 5);
  assert.deepEqual(next.recommendationRejections.entries, []);
  for (let i = 0; i < 70; i++)
    f.manualTimeline = appendFeedbackOperation(f, {
      id: "x" + i,
      kind: "tagLike",
      target: "t" + i,
      label: "Tag",
      before: false,
      after: true,
      at: i + 3,
    });
  assert.equal(f.manualTimeline.entries.length, 40);
  assert.throws(() => parseFeedbackTimeline({ version: 2, entries: [] }));
  assert.throws(() =>
    parseRecommendationTuning({ version: 1, explorationSlots: 100, cooldownHours: 24 }),
  );
});
test("tag-heart undo removes only history created by that edit; watch observations merge without inflating sums", () => {
  const f = { ...fields(), tagLikes: { racing: true }, tagHeartHistory: { racing: 20 } };
  f.manualTimeline = appendFeedbackOperation(f, {
    id: "heart",
    kind: "tagLike",
    target: "racing",
    label: "racing",
    before: false,
    after: true,
    at: 20,
    heartBefore: null,
    heartAfter: 20,
  });
  const next = undoFeedbackOperation(f, "heart", 30);
  assert.equal(next.tagLikes.racing, undefined);
  assert.equal(next.tagHeartHistory.racing, undefined);
  assert.equal(f.tagHeartHistory.racing, 20);
  assert.throws(
    () => undoFeedbackOperation({ ...f, tagHeartHistory: { racing: 21 } }, "heart", 30),
    /newer/,
  );
  assert.deepEqual(
    mergeFeedbackWatch(
      { a: { preview: 30, fullscreen: 5 } },
      { a: { preview: 20, fullscreen: 10 }, b: { preview: 2, fullscreen: 0 } },
    ),
    { a: { preview: 30, fullscreen: 10 }, b: { preview: 2, fullscreen: 0 } },
  );
});
test("revision 100 promotes only the recommendation trio once and preserves earlier reopens", () => {
  const ids = ["next-132", "next-133", "next-139"],
    saved = ALL_NEXT_LEVEL_MISSIONS.map((m) =>
      [...ids, "next-138"].includes(m.id) ? { ...m, done: false, status: "blocked" } : m,
    ),
    next = mergeMissionPlan(saved, ALL_NEXT_LEVEL_MISSIONS, 99);
  for (const id of ids) assert.equal(next.find((m) => m.id === id).done, true);
  assert.equal(next.find((m) => m.id === "next-138").status, "blocked");
  next.find((m) => m.id === "next-132").done = false;
  next.find((m) => m.id === "next-132").status = "in-progress";
  assert.equal(
    mergeMissionPlan(next, ALL_NEXT_LEVEL_MISSIONS, 100).find((m) => m.id === "next-132").status,
    "in-progress",
  );
});
