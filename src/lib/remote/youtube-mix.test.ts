import { test } from "node:test";
import assert from "node:assert/strict";
import { mixYoutubeCreators } from "./youtube-mix.ts";
import type { LibraryVideo } from "../videos/types";

const video = (id: string, channelId: string) => ({ id, folderId: channelId, remote: { kind: "youtube", channelId } }) as LibraryVideo;
test("mix reaches creators beyond a huge leading archive", () => {
  const videos = [...Array.from({ length: 10000 }, (_, i) => video(`a${i}`, "a")), video("b", "b"), video("c", "c")];
  const mixed = mixYoutubeCreators(videos, 123, 48);
  assert.equal(new Set(mixed.slice(0, 3).map(v => v.remote?.channelId)).size, 3);
  assert.deepEqual(mixed, mixYoutubeCreators(videos, 123, 48));
  assert.notDeepEqual(mixed, mixYoutubeCreators(videos, 987, 48));
  assert.equal(new Set(mixed.map(v => v.id)).size, mixed.length);
});

test("one creator fills a shelf without duplicate cards", () => {
 const rows = Array.from({length: 100}, (_,i) => video(`v${i}`, "a"));
 assert.equal(mixYoutubeCreators([...rows,...rows],123,48).length,48);
});
test("latest and trending include every creator and honor per-creator order", () => {
 const rows = Array.from({length: 13000}, (_,i) => ({...video(`a${i}`,"a"), addedAt:i, remote:{kind:"youtube" as const,channelId:"a",views:i}}));
 const rare = {...video("rare","b"),addedAt:1,remote:{kind:"youtube" as const,channelId:"b",views:2}};
 for (const mode of ["latest","trending"] as const) {
  const mixed = mixYoutubeCreators([...rows,rare],123,12,mode);
  assert.equal(mixed[0].id,"a12999");
  assert.equal(mixed[1].id,"rare");
 }
});

test("unused slots from a tiny creator are redistributed to fill the shelf", () => {
 const rows = [video("small","small"),...Array.from({length:1000},(_,i)=>video(`large${i}`,"large"))];
 for (const mode of ["mix","latest","trending"] as const) {
  const result=mixYoutubeCreators(rows,123,48,mode);
  assert.equal(result.length,48);
  assert.ok(result.slice(0,2).some(row=>row.id==="small"));
  assert.equal(new Set(result.map(row=>row.id)).size,48);
 }
});
test("catalog replacement invalidates the cached index", () => {
 const original=[video("a","a")];
 assert.equal(mixYoutubeCreators(original,1).length,1);
 assert.equal(mixYoutubeCreators([...original,video("b","b")],1).length,2);
 assert.equal(mixYoutubeCreators([],1).length,0);
 assert.equal(mixYoutubeCreators(original,1,NaN).length,0);
});
