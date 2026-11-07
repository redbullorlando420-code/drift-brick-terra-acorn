import test from "node:test";
import assert from "node:assert/strict";
import { prepareGuide, answerGuideQuery } from "../src/lib/videos/guide-picks.ts";
import { previewDeskTaste, DESK_PREVIEW_LIMIT } from "../src/lib/videos/desk-taste-preview.ts";
import { resolveDeskTaste } from "../src/lib/videos/desk-taste.ts";
import {exposureKey} from '../src/lib/videos/recommendation-exposure.ts';
import {
  createNoveltyEvidence,
  NOVELTY_CREATOR_LIMIT,
} from "../src/lib/videos/recommendation-novelty.ts";
const now = 1793653200000,
  turn = async () => {},
  weights = { favorite: 3, like: 2, topic: 1 };
const video = (id, creator = "known", kind = "twitch") => ({
  id,
  name: "Racing " + id,
  folderId: "public",
  path: id,
  extension: "mp4",
  mime: "video/mp4",
  size: 0,
  duration: 1800,
  addedAt: 1,
  remote: { kind, videoId: id, channelName: creator },
});
const rows = [
  video("recorded"),
  ...Array.from({ length: 30 }, (_, i) => video("known-" + i)),
  ...Array.from({ length: 30 }, (_, i) => video("new-" + i, "new-" + i)),
];
const input = {
  videos: rows,
  folders: [{ id: "public" }],
  tags: {},
  favorites: {},
  likes: {},
  history: [{ id: "recorded" }],
};
test('exposure uses actual eligible observations and reports shown rather than completed',async()=>{
 const shown=video('shown'),privateRow={...video('private-exposure'),privateRetention:true},exposure={version:1,updatedAt:now,entries:[{key:exposureKey(shown),count:3,at:now},{key:exposureKey(privateRow),count:8,at:now}]};
 const result=await prepareGuide({...input,videos:[shown,privateRow],history:[],recommendationExposure:exposure,novelty:2},42,now,turn);
 assert.equal(result.novelty.exposed,1);assert.equal(result.novelty.meanFamiliarity,1);assert.equal(result.historyCount,0);assert.equal(result.picks.length,1);assert.match(result.explanations.shown.notices.at(-1),/shown recommendation.*not a completed watch/);
});
test("fixed dense corpus changes familiarity while neutral exactly preserves baseline", async () => {
  const ordinary = await prepareGuide(input, 42, now, turn),
    neutral = await prepareGuide({ ...input, novelty: 0 }, 42, now, turn),
    familiar = await prepareGuide({ ...input, novelty: -2 }, 42, now, turn),
    fresh = await prepareGuide({ ...input, novelty: 2 }, 42, now, turn);
  assert.deepEqual(neutral.picks, ordinary.picks);
  assert.equal(familiar.novelty.meanFamiliarity, 1);
  assert.equal(fresh.novelty.meanFamiliarity, 0);
  assert.equal(familiar.picks.length, 12);
  assert.equal(fresh.picks.length, 12);
  for (const level of [-2, -1, 0, 1, 2]) {
    const model = createNoveltyEvidence(undefined, now);
    model.observe(rows[0], true);
    for (const row of rows) assert(Math.abs(model.inspect(row, level).adjustment) <= 1);
  }
});
test("sparse corpus stays neutral and private/hidden/other-provider history cannot supply creator evidence", async () => {
  const sparse = await prepareGuide({ ...input, history: [], novelty: 2 }, 42, now, turn);
  assert.equal(sparse.novelty.available, false);
  assert.equal(sparse.novelty.meanFamiliarity, null);
  assert(Object.values(sparse.explanations).every((row) => row.notices.at(-1).includes("neutral")));
  for (const recorded of [
    { ...rows[0], privateRetention: true },
    { ...rows[0], remote: { ...rows[0].remote, kind: "youtube" } },
    { ...rows[0], id: "hidden" },
  ]) {
    const actual = await prepareGuide(
      {
        ...input,
        videos: [recorded, ...rows.slice(1)],
        history: [{ id: recorded.id }],
        hidden: { hidden: true },
        provider: "twitch",
        novelty: 2,
      },
      42,
      now,
      turn,
    );
    assert.equal(actual.novelty.available, false);
  }
});
test("source balance, query relevance and strong favorite preference survive novelty adjustment", async () => {
  const catalog = [
    ...rows,
    ...Array.from({ length: 20 }, (_, i) => video("yt-" + i, "yt-" + i, "youtube")),
    ...Array.from({ length: 20 }, (_, i) => ({ ...video("local-" + i), remote: undefined })),
  ];
  const result = await prepareGuide(
    {
      ...input,
      videos: catalog,
      novelty: 2,
      session: { sources: "balanced", length: "any", familiarity: "balanced" },
    },
    42,
    now,
    turn,
  );
  assert.deepEqual(
    new Set(result.picks.map((row) => row.remote?.kind ?? "local")),
    new Set(["twitch", "youtube", "local"]),
  );
  const favorite = rows[1],
    ranked = await prepareGuide(
      { ...input, novelty: 2, favorites: { [favorite.id]: true } },
      42,
      now,
      turn,
    );
  assert.equal(ranked.picks[0].id, favorite.id);
  const answer = await answerGuideQuery({ ...input, novelty: 2 }, "Racing new-22", 42, now, turn);
  assert(answer.picks.every((row) => row.name.includes("22")));
});
test('resolved Twitch weights change real ranking while Movies results and baseline feedback stay intact',async()=>{
 const scope={...input,favorites:{'known-0':true},likes:Object.fromEntries(rows.filter(row=>row.id.startsWith('new-')).map(row=>[row.id,true]))},before=JSON.stringify(scope),base=resolveDeskTaste({version:1,desks:{}},{},'twitch',weights),ledger={version:1,desks:{twitch:{weights:{favorite:0,like:8,topic:0},novelty:0}}};
 const ordinary=await prepareGuide({...scope,...base},42,now,turn),twitch=await prepareGuide({...scope,...resolveDeskTaste(ledger,{},'twitch',weights)},42,now,turn),movies=await prepareGuide({...scope,...resolveDeskTaste(ledger,{},'movies',weights)},42,now,turn);
 assert.equal(ordinary.picks[0].id,'known-0');assert(twitch.picks.every(row=>row.id.startsWith('new-')));assert.deepEqual(movies.picks,ordinary.picks);assert.equal(JSON.stringify(scope),before);
});
test("Twitch overlay does not affect Movies or shared defaults; preview has a strict projection cap and cancels", async () => {
  const saved = {
      version: 1,
      desks: { twitch: { weights: { favorite: 8, like: 0, topic: 0 }, novelty: 2 } },
    },
    get = (desk) => resolveDeskTaste(saved, {}, desk, weights);
  assert.deepEqual(get("movies").weights, weights);
  assert.equal(get("movies").novelty, 0);
  const base = { weights, novelty: 0 },
    many = { ...input, videos: Array.from({ length: 1200 }, (_, i) => video("v-" + i)) };
  const result = await previewDeskTaste(many, base, get("twitch"), 42, now, turn);
  assert.equal(result.sampled, DESK_PREVIEW_LIMIT);
  assert.equal(result.eligible, 1200);
  assert.equal(result.proposed.picks.length, 12);
  assert.equal(result.limited, true);
  await assert.rejects(
    previewDeskTaste(input, base, base, 42, now, async () => {
      throw Error("cancel");
    }),
    /cancel/,
  );
});
test("creator cap and long query histories leave absence unknown; exposed is never completed", async () => {
  const model = createNoveltyEvidence(undefined, now);
  for (let i = 0; i <= NOVELTY_CREATOR_LIMIT; i++)
    model.observe(video("v" + i, "creator" + i), true);
  assert.equal(model.summary().creators, NOVELTY_CREATOR_LIMIT);
  assert.equal(model.inspect(video("other", "absent"), 2).familiarity, undefined);
  const answer = await answerGuideQuery(
    {
      ...input,
      history: Array.from({ length: 9000 }, (_, i) => ({
        id: i === 0 ? "recorded" : "missing" + i,
      })),
      novelty: 2,
    },
    "Racing new",
    42,
    now,
    turn,
  );
  assert(Object.values(answer.explanations).every((row) => row.notices.at(-1).includes("neutral")));
});
