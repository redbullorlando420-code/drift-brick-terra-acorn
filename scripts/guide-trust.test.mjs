import test from "node:test";
import assert from "node:assert/strict";
import { prepareGuide, answerGuideQuery } from "../src/lib/videos/guide-picks.ts";
import {
  createGuideDiversity,
  DEFAULT_GUIDE_DIVERSITY,
  publicationAge,
} from "../src/lib/videos/guide-diversity.ts";
import { matchedTagProvenance } from "../src/lib/videos/guide-provenance.ts";
import { distributionExport } from "../src/lib/videos/recommendation-report.ts";
import { createGuideDiversitySession } from "../src/lib/guide-diversity-session.ts";
const now = 1793653200000,
  turn = async () => {},
  config = { creatorPercent: 50, minSources: 2, olderSlots: 2 };
const video = (id, creator = "Dominant", kind = "twitch", old = false) => ({
  id,
  name: "Racing title " + id,
  folderId: "public",
  path: id,
  extension: "mp4",
  mime: "video/mp4",
  size: 1,
  duration: 1800,
  addedAt: old ? Date.UTC(2020, 0, 1) : now - 86400000,
  remote: {
    kind,
    videoId: id,
    channelName: creator,
    publishedSource: "provider",
    publishedPrecision: "day",
    publishedDate: old ? "2020-01-01" : "2026-11-01",
  },
});
const dominant = Array.from({ length: 30 }, (_, i) => video("dominant-" + i)),
  alternatives = Array.from({ length: 12 }, (_, i) =>
    video("alt-" + i, "Creator " + i, "youtube", i < 6),
  );
const input = {
  videos: [...dominant, ...alternatives],
  tags: {},
  favorites: Object.fromEntries(dominant.map((v) => [v.id, true])),
  likes: {},
  history: [],
  folders: [{ id: "public" }],
};
test("defaults exactly preserve ordering and opt-in caps the dominant creator with source and age floors", async () => {
  const baseline = await prepareGuide(input, 42, now, turn),
    neutral = await prepareGuide({ ...input, diversity: DEFAULT_GUIDE_DIVERSITY }, 42, now, turn),
    diverse = await prepareGuide({ ...input, diversity: config }, 42, now, turn);
  assert.deepEqual(neutral.picks, baseline.picks);
  assert.equal(baseline.distribution.diversity, undefined);
  assert(baseline.picks.every((v) => v.remote.channelName === "Dominant"));
  assert.equal(diverse.picks.length, 12);
  assert(diverse.picks.filter((v) => v.remote.channelName === "Dominant").length <= 6);
  assert.equal(diverse.distribution.diversity.met, true);
  assert.equal(diverse.distribution.diversity.sources, 2);
  assert(diverse.distribution.diversity.older >= 2);
  assert.equal(diverse.distribution.publicationAge.unknown, 0);
  assert.deepEqual(
    (await prepareGuide({ ...input, diversity: config }, 42, now, turn)).picks,
    diverse.picks,
  );
});
test("eligibility and negative choices precede variety, including query ranking", async () => {
  const extra = [
    { ...video("private", "private", "youtube", true), privateRetention: true },
    { ...video("hidden", "hidden", "youtube", true) },
    { ...video("unavailable", "unavailable", "youtube", true) },
    { ...video("live", "live", "youtube", true), remote: { ...video("live").remote, live: true } },
    { ...video("reject", "Rejected", "youtube", true) },
  ];
  const scoped = {
    ...input,
    videos: [...dominant, ...extra],
    hidden: { hidden: true },
    unavailable: { unavailable: true },
    recommendationRejections: {
      version: 1,
      updatedAt: now,
      entries: [{ scope: "title", target: "youtube:reject", label: "rejected", at: now }],
    },
    diversity: config,
  };
  for (const result of [
    await prepareGuide(scoped, 42, now, turn),
    await answerGuideQuery(scoped, "Racing", 42, now, turn),
  ]) {
    assert(result.picks.every((v) => v.id.startsWith("dominant-")));
    assert.equal(result.distribution.diversity.met, false);
    assert(result.distribution.diversity.notices.length > 0);
  }
  const source = await prepareGuide(
    {
      ...input,
      session: { sources: "twitch", length: "any", familiarity: "balanced" },
      diversity: config,
    },
    42,
    now,
    turn,
  );
  assert(source.picks.every((v) => v.remote.kind === "twitch"));
  assert.equal(source.distribution.diversity.met, false);
  const query = await answerGuideQuery(
    { ...input, diversity: config },
    "Racing dominant",
    42,
    now,
    turn,
  );
  assert(query.picks.every((v) => v.id.startsWith("dominant-")));
});
test("balanced quotas stay intact; absent credits, short shelves and uncertain dates never claim a floor passed", async () => {
  const local = Array.from({ length: 20 }, (_, i) => ({
      ...video("local-" + i),
      remote: undefined,
    })),
    result = await prepareGuide(
      {
        ...input,
        videos: [...input.videos, ...local],
        session: { sources: "balanced", length: "any", familiarity: "balanced" },
        diversity: config,
      },
      42,
      now,
      turn,
    );
  assert.deepEqual(
    result.distribution.sources.filter((s) => s.shown).map((s) => s.shown),
    [4, 4, 4],
  );
  assert.equal(result.distribution.diversity.met, false);
  assert.match(result.distribution.diversity.notices.join(" "), /Missing creator credits/);
  const one = await prepareGuide(
    {
      ...input,
      videos: [dominant[0]],
      diversity: { creatorPercent: 50, minSources: 1, olderSlots: 0 },
    },
    42,
    now,
    turn,
  );
  assert.equal(one.distribution.diversity.creatorCap, 0);
  assert.equal(one.distribution.diversity.met, false);
  const empty = await prepareGuide({ ...input, videos: [], diversity: config }, 42, now, turn);
  assert.equal(empty.distribution.diversity.met, false);
  assert.equal(
    publicationAge({ ...video("unknown"), remote: { kind: "youtube", videoId: "unknown" } }, now),
    "unknown",
  );
  assert.equal(
    publicationAge({ ...video("local"), remote: undefined, addedAt: 1 }, now),
    "unknown",
  );
  const partial = {
    ...video("partial"),
    remote: { ...video("partial").remote, publishedPrecision: "year", publishedDate: "2025" },
  };
  assert.equal(publicationAge(partial, now), "unknown");
});
test("100k candidates keep a bounded alternative pool, surface coverage limits and yield during repair", async () => {
  const select = createGuideDiversity(
    (a, b) => b.score - a.score || a.video.id.localeCompare(b.video.id),
    (r) => r.video,
    { sources: "all", length: "any", familiarity: "balanced" },
    config,
    now,
  );
  for (let i = 0; i < 100000; i++)
    select.add({
      video: video(
        "v" + i,
        i < 30000 ? "Dominant" : "Creator " + i,
        i < 30000 ? "twitch" : i % 5 ? "twitch" : "youtube",
        i % 7 === 0,
      ),
      score: i < 30000 ? 10 : 1,
    });
  let turns = 0;
  const picks = await select.finish(async () => {
    turns++;
  });
  assert.equal(picks.length, 12);
  assert(select.getReport().pooled <= 840);
  assert.equal(select.getReport().poolLimited, true);
  assert(turns > 0);
  assert.match(select.getReport().notices.join(" "), /64 identities/);
  const other = createGuideDiversity(
    (a, b) => b.score - a.score,
    (r) => r.video,
    { sources: "all", length: "any", familiarity: "balanced" },
    config,
    now,
  );
  for (const v of input.videos)
    other.add({ video: v, score: v.id.startsWith("dominant") ? 10 : 1 });
  await assert.rejects(
    other.finish(async () => {
      throw Error("cancelled");
    }),
    /cancelled/,
  );
});
test("only applied document-local settings affect ranking and aggregate exports contain no identities or raw provenance", async () => {
  const a = createGuideDiversitySession(),
    b = createGuideDiversitySession();
  a.apply(config);
  assert.deepEqual(b.getSnapshot(), DEFAULT_GUIDE_DIVERSITY);
  a.reset();
  assert.deepEqual(a.getSnapshot(), DEFAULT_GUIDE_DIVERSITY);
  const result = await prepareGuide({ ...input, diversity: config }, 42, now, turn),
    text = JSON.stringify(distributionExport(result.distribution));
  assert(text.includes("diversity"));
  for (const secret of [
    "Dominant",
    "Racing title",
    "alt-",
    "dominant-",
    '"public"',
    "provider:youtube",
  ])
    assert(!text.includes(secret));
});
test("manual and provider tag reasons carry exact-field provenance, stable through refreshed descriptions", async () => {
  const origin = video("origin"),
    candidate = video("candidate", "Other"),
    scope = {
      ...input,
      videos: [origin, candidate],
      favorites: { origin: true },
      tags: { origin: ["racing"], candidate: ["racing"] },
      metadataProvenance: {
        origin: { tags: { racing: "legacy" } },
        candidate: { tags: { racing: "manual" }, lockedFields: ["tags"] },
      },
    };
  for (const v of [
    candidate,
    { ...candidate, description: "Provider refreshed racing category and body" },
  ]) {
    const r = await prepareGuide({ ...scope, videos: [origin, v] }, 42, now, turn),
      reason = r.explanations.candidate.reasons.find((r) => r.kind === "shared-tag");
    assert.deepEqual(
      reason.provenance.map((p) => p.kind),
      ["owner", "imported"],
    );
  }
  const query = await answerGuideQuery(
    {
      ...scope,
      videos: [{ ...candidate, name: "Different name" }],
      metadataProvenance: { candidate: { tags: { racing: "provider:youtube" } } },
    },
    "racing",
    42,
    now,
    turn,
  );
  assert.equal(query.explanations.candidate.reasons[0].provenance[0].kind, "provider");
  assert.equal(
    matchedTagProvenance({ tags: { racing: "provider:twitch" }, lockedFields: ["tags"] }, "racing")
      .kind,
    "conflict",
  );
  assert.equal(matchedTagProvenance({ tags: { unrelated: "manual" } }, "racing").kind, "unknown");
});
test("inspection never enumerates unrelated provenance or reads private notes, and missing sources remain uncertain", async () => {
  const row = { ...video("target"), name: "Exact phrase" };
  const metadata = new Proxy(
    {
      target: {
        tags: {},
        get notes() {
          throw Error("notes read");
        },
        get youtubeReviews() {
          throw Error("reviews read");
        },
      },
    },
    {
      ownKeys() {
        throw Error("enumerated ledger");
      },
      get(target, key) {
        if (key !== "target") throw Error("unrelated row");
        return target[key];
      },
    },
  );
  const result = await answerGuideQuery(
    { ...input, videos: [row], metadataProvenance: metadata },
    "Exact",
    42,
    now,
    turn,
  );
  assert.equal(result.explanations.target.reasons[0].provenance[0].kind, "unknown");
  assert(!JSON.stringify(result.explanations).includes("provider:"));
});
