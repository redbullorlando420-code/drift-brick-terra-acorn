import { test } from "node:test";
import assert from "node:assert/strict";
import { appendPreviewRows, createPreviewCatalog, rankPreview, rankPreviewCatalog, type PreviewRow } from "./preview-ranking.ts";
import { createPreviewRankingProcessor, type PreviewWorkerResult } from "./preview-ranking-protocol.ts";
const row = (id: string, creator = "creator"): PreviewRow => ({ id, creator, folderId: creator, kind: "youtube", genre: "tech", tags: ["technology"], rating: 0, creatorRating: 0, creatorLiked: false, live: false, eligible: true });
test("preview rankings preserve creator/taste evidence and bounded distinct shelves", () => {
  const rows = [row("target"), ...Array.from({length: 10_000}, (_, i) => row(String(i), i < 20 ? "creator" : "other"))];
  rows[1].rating = 5;
  rows[2].eligible = false;
  const result = rankPreview(rows, "target", 3, ["technology"]);
  assert.equal(result.related[0], "0"); assert.equal(result.related.length, 8); assert.equal(result.recommended.length, 6);
  assert.ok(!result.related.includes("1")); assert.ok(result.recommended.every(id => !result.related.includes(id)));
  assert.equal(result.tagScores.technology.count, 1);
  assert.deepEqual(rankPreview(rows, "target", 3, ["technology"]), result);
});

test("cached preview catalogs retain full taste evidence while separating adult candidates", () => {
  const rows = [row("public-target"), row("public-match"), { ...row("adult-target"), adult: true }, { ...row("adult-match"), adult: true }, { ...row("hidden-rated"), eligible: false, rating: 5 }];
  const catalog = createPreviewCatalog(["technology"]);
  appendPreviewRows(catalog, rows.slice(0, 2));
  appendPreviewRows(catalog, rows.slice(2));
  const publicResult = rankPreviewCatalog(catalog, "public-target", 7);
  assert.deepEqual(publicResult.related, ["public-match"]);
  assert.equal(publicResult.tagScores.technology.count, 1);
  assert.equal(publicResult.tagScores.technology.total, 3);
  assert.deepEqual(rankPreviewCatalog(catalog, "adult-target", 8).related, ["adult-match"]);
  assert.deepEqual(rankPreviewCatalog(catalog, "public-target", 7), publicResult);
  assert.equal(catalog.publicRows.length, 2);
  assert.equal(catalog.adultRows.length, 2);
});

test("preview worker waits for a complete catalog and serves only the latest pending target", () => {
  const packets: PreviewWorkerResult[] = [];
  const process = createPreviewRankingProcessor(packet => packets.push(packet));
  process({ type: "reset", generation: 1, hearted: [] });
  process({ type: "append", generation: 1, rows: [row("first"), row("second")] });
  process({ type: "rank", generation: 1, requestId: 1, id: "first", seed: 1 });
  process({ type: "rank", generation: 1, requestId: 2, id: "second", seed: 2 });
  assert.equal(packets.length, 0);
  process({ type: "ready", generation: 1 });
  assert.equal(packets.length, 1);
  assert.equal(packets[0].id, "second");
  assert.equal(packets[0].requestId, 2);
  process({ type: "rank", generation: 1, requestId: 3, id: "first", seed: 3 });
  assert.equal(packets.length, 2);
  assert.deepEqual(packets[1].result.related, ["second"]);
  process({ type: "reset", generation: 2, hearted: [] });
  process({ type: "append", generation: 1, rows: [row("stale")] });
  process({ type: "ready", generation: 1 });
  process({ type: "rank", generation: 1, requestId: 4, id: "stale", seed: 4 });
  process({ type: "append", generation: 2, rows: [row("fresh"), row("fresh-match")] });
  process({ type: "rank", generation: 2, requestId: 5, id: "fresh", seed: 5 });
  process({ type: "ready", generation: 2 });
  assert.equal(packets.length, 3);
  assert.deepEqual(packets[2].result.related, ["fresh-match"]);
  assert.equal(packets[2].result.tagScores.technology.count, 0);
});

test("preview packets carry only the target's displayed tag scores while retaining global evidence", () => {
  const packets: PreviewWorkerResult[] = [];
  const process = createPreviewRankingProcessor(packet => packets.push(packet));
  const target = { ...row("target", "my creator"), tags: ["keyword-technology"] };
  process({ type: "reset", generation: 1, hearted: [] });
  process({ type: "append", generation: 1, rows: [target, { ...row("rated"), tags: ["keyword-technology", "creator-my-creator", "unrelated"], rating: 5 }] });
  process({ type: "ready", generation: 1 });
  process({ type: "rank", generation: 1, requestId: 1, id: "target", seed: 2 });
  assert.deepEqual(Object.keys(packets[0].result.tagScores).sort(), ["my-creator", "technology"]);
  assert.deepEqual(packets[0].result.tagScores.technology, { total: 3, count: 1 });
  assert.deepEqual(packets[0].result.related, ["rated"]);
});

test('duplicate tag aliases count one rating and unrated catalog volume cannot dilute preference', () => {
  const rows = [row('target'), {...row('rated'),rating:5,tags:['technology','keyword-technology',' TECHNOLOGY ']}];
  const first=rankPreview(rows,'target',1,[]);
  const grown=rankPreview([...rows,...Array.from({length:1000},(_,i)=>row(`cold-${i}`))],'target',1,[]);
  assert.deepEqual(first.tagScores.technology,{total:3,count:1});
  assert.deepEqual(grown.tagScores.technology,first.tagScores.technology);
});

test('disliked titles are excluded and missing metadata is not a related match', () => {
  const plain=(id:string):PreviewRow=>({...row(id,id),folderId:id,kind:undefined,genre:undefined,tags:[]});
  const result=rankPreview([plain('target'),plain('unrelated'),{...row('disliked'),rating:1},{...row('positive'),rating:5}], 'target',1,['technology']);
  assert.ok(!result.related.includes('unrelated'));
  assert.ok(![...result.related,...result.recommended].includes('disliked'));
  assert.ok([...result.related,...result.recommended].includes('positive'));
});

test('preview taste uses saved likes, favorites, creator favorites, time and marks', () => {
  for (const extra of [{ liked: true }, { favorite: true }, { creatorFavorite: true }, { watch: 6 }, { marks: 3 }]) {
    const result = rankPreview([row('target'), row('neutral'), { ...row('personal'), ...extra }], 'target', 3, []);
    assert.equal(result.related[0], 'personal', JSON.stringify(extra));
  }
});
test('prepared preview tags are reused between target switches and new chunks invalidate taste', () => {
  const catalog = createPreviewCatalog([]);
  appendPreviewRows(catalog, [row('a'), row('b')]);
  rankPreviewCatalog(catalog, 'a', 1);
  const prepared = catalog.prepared.get('b');
  assert.equal(catalog.compiled, true);
  rankPreviewCatalog(catalog, 'b', 2);
  assert.equal(catalog.prepared.get('b'), prepared);
  appendPreviewRows(catalog, [{ ...row('liked'), liked: true }]);
  assert.equal(catalog.compiled, false);
  rankPreviewCatalog(catalog, 'a', 3);
  assert.ok(catalog.prepared.get('b')!.tastes > 0);
});
