import test from "node:test";
import assert from "node:assert/strict";
import type { LibraryVideo } from "@/lib/videos/types";
import { createYoutubeRecommendationRanker, rankYoutubeRecommendations } from "./youtube-recommendations.ts";

function video(id: string, creator: string, tag: string, published: number): LibraryVideo {
  return { id, folderId: `yt:${creator}`, name: id, path: id, extension: "mp4", mime: "video/mp4", size: 0, addedAt: published, remote: { kind: "youtube", channelName: creator } };
}

const base = {
  tags: {} as Record<string, string[]>, history: [] as Array<{ id: string; at: number }>, viewCounts: {} as Record<string, number>,
  favorites: {}, likes: {}, ratingOf: () => 0, tagIsLiked: () => false, tagHasHeartHistory: () => false,
  ratingPreference: (rating: number) => rating, watchScore: () => 0, creatorIsLiked: () => false,
  creatorRating: () => 0, now: 1_800_000_000_000,
};

test("recent creator viewing raises unseen older uploads from that creator", () => {
  const recent = video("viewed", "maker", "science", 1_799_000_000_000);
  const old = video("older", "maker", "science", 1_700_000_000_000);
  const other = video("other", "other", "music", 1_799_100_000_000);
  const ranked = rankYoutubeRecommendations([other, old, recent], { ...base, history: [{ id: "viewed", at: base.now - 60_000 }], limit: 3 });
  assert.equal(ranked[0].id, "older");
});

test("liked tags and explicit creator favorites influence ranking", () => {
  const liked = video("liked", "favored", "documentary", 1_790_000_000_000);
  const neutral = video("neutral", "new", "sports", 1_799_000_000_000);
  const ranked = rankYoutubeRecommendations([neutral, liked], { ...base, tags: { liked: ["documentary"] }, tagIsLiked: (tag) => tag === "documentary", creatorIsLiked: (name) => name === "favored" });
  assert.equal(ranked[0].id, "liked");
});

test("a deliberately unliked tag is a negative recommendation signal", () => {
  const avoided = video("avoided", "a", "topic-no", 1_799_000_000_000);
  const neutral = video("neutral", "b", "", 1_799_000_000_000);
  const ranked = rankYoutubeRecommendations([avoided, neutral], { ...base, tags: { avoided: ["topic-no"] }, tagHasHeartHistory: (tag) => tag === "topic-no" });
  assert.equal(ranked[0].id, "neutral");
});

test("recommendations interleave creators and de-prioritize already watched videos", () => {
  const list = [video("a1", "a", "x", 9), video("a2", "a", "x", 8), video("b1", "b", "x", 7)];
  const ranked = rankYoutubeRecommendations(list, { ...base, history: [{ id: "a1", at: base.now - 10 }], limit: 3 });
  assert.notEqual(ranked[0].id, "a1");
  assert.notEqual(ranked[0].remote?.channelName, ranked[1].remote?.channelName);
});

test("a single prolific archive can still fill the requested shelf with its best-ranked uploads", () => {
  const archive = Array.from({ length: 250 }, (_, index) => video(`archive-${index}`, "maker", "science", base.now - index * 1_000));
  const ranked = rankYoutubeRecommendations(archive, { ...base, limit: 12 });
  assert.equal(ranked.length, 12);
  assert.deepEqual(ranked.map((item) => item.id), archive.slice(0, 12).map((item) => item.id));
});

test("feedback lookups scale with unique creators and tags, and exclude other providers", () => {
 const archive = Array.from({length:1000},(_,i)=>video(`item-${i}`,"maker","science",base.now-i));
 const other = {...video("other","other","science",base.now),remote:{kind:"twitch" as const,channelName:"other"}};
 let ratings=0, creators=0, tags=0;
 const ranked=rankYoutubeRecommendations([...archive,other],{...base,limit:12,
   tags:Object.fromEntries(archive.map(v=>[v.id,["science"," SCIENCE "]])),
   ratingOf:()=>{ratings++;return 0;},creatorRating:()=>{creators++;return 0;},tagIsLiked:()=>{tags++;return true;}});
 assert.equal(ratings,1000);assert.equal(creators,1);assert.equal(tags,1);assert.equal(ranked.length,12);
});

test("cached catalog follows immutable replacements and rejects invalid limits", () => {
 const first=[video("first","maker","",1)];
 assert.equal(rankYoutubeRecommendations(first,{...base,limit:1})[0].id,"first");
 assert.equal(rankYoutubeRecommendations([video("replacement","maker","",2)],{...base,limit:1})[0].id,"replacement");
 assert.deepEqual(rankYoutubeRecommendations(first,{...base,limit:NaN}),[]);
});

test("filtered recommendations still learn from watched videos outside the filter", () => {
 const watched=video("watched","maker","",1);
 const older=video("older","maker","",0);
 const other=video("other","other","",2);
 const ranked=rankYoutubeRecommendations([other,older,watched],{...base,history:[{id:"watched",at:base.now-1000}],limit:2},[other,older]);
 assert.deepEqual(ranked.map(row=>row.id),["older","other"]);
});

test("reshuffling reuses scored evidence instead of reading feedback again", () => {
 const rows=Array.from({length:1000},(_,i)=>video(`v-${i}`,`maker-${i%20}`,"",1));
 let reads=0;
 const ranker=createYoutubeRecommendationRanker(rows,{...base,limit:12,ratingOf:()=>{reads++;return 0;}});
 const first=ranker(id=>Number(id.slice(2)));
 const second=ranker(id=>1000-Number(id.slice(2)));
 assert.equal(reads,1000);
 assert.notDeepEqual(first,second);
 assert.equal(new Set(second.map(row=>row.remote?.channelName)).size,12);
});

test('ratings improve candidate order even when watched discovery evidence is negative', () => {
  const rows=[video('neutral','maker','',1),video('excellent','maker','',1),video('good','maker','',1),video('disliked','maker','',1)];
  const ratings:Record<string,number>={neutral:2,excellent:5,good:3,disliked:1};
  const ranked=rankYoutubeRecommendations(rows,{...base,history:rows.map(v=>({id:v.id,at:base.now-1000})),ratingOf:id=>ratings[id],creatorIsLiked:()=>true});
  assert.deepEqual(ranked.map(v=>v.id),['excellent','good','neutral']);
});

test('repeating tags or adding many hearted tags cannot create unlimited ranking bonuses', () => {
  const rows=[video('spam','maker','',1),video('excellent','maker','',1)];
  const ranked=rankYoutubeRecommendations(rows,{...base,tags:{spam:Array.from({length:100},(_,i)=>`tag-${i}`),excellent:['tag-0','tag-1']},tagIsLiked:()=>true,ratingOf:id=>id==='excellent'?5:0});
  assert.equal(ranked[0].id,'excellent');
  const duplicate=rankYoutubeRecommendations(rows,{...base,tags:{spam:Array(100).fill('same-tag'),excellent:['same-tag']},tagIsLiked:()=>true,ratingOf:id=>id==='excellent'?5:0});
  assert.equal(duplicate[0].id,'excellent');
});

test('video likes, favorites, creator favorites, time and private marks each improve discovery priority', () => {
  const a = video('a', 'alpha', '', 1), b = video('b', 'beta', '', 1);
  for (const extra of [{ likes: { b: true as const } }, { favorites: { b: true as const } }, { creatorIsFavorited: (name: string) => name === 'beta' }, { watchScore: (id: string) => id === 'b' ? 6 : 0 }, { marksOf: (id: string) => id === 'b' ? 3 : 0 }]) {
    assert.equal(rankYoutubeRecommendations([a, b], { ...base, ...extra, limit: 2 })[0].id, 'b');
  }
});
test('60k-title scoring reads per-title signals once and reuses them across mixes', () => {
  const rows = Array.from({ length: 60_000 }, (_, i) => video(`big-${i}`, `creator-${i % 100}`, '', 1));
  let watchReads = 0, markReads = 0, creatorReads = 0;
  const rank = createYoutubeRecommendationRanker(rows, { ...base, limit: 48,
    watchScore: () => { watchReads++; return 0; }, marksOf: () => { markReads++; return 0; },
    creatorIsFavorited: () => { creatorReads++; return false; } });
  assert.equal(rank().length, 48); assert.equal(rank(() => 1).length, 48);
  assert.equal(watchReads, 60_000); assert.equal(markReads, 60_000); assert.equal(creatorReads, 100);
});
