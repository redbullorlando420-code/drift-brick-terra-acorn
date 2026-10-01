import { test } from "node:test";
import assert from "node:assert/strict";
import { uniqueYoutubePage, youtubePublishedTime, repairLegacyYoutubeDate } from "./youtube-page.ts";

test("a page is fully consumed even when most rows repeat earlier feed rows", () => {
  const seen = new Set(["a", "b"]);
  const rows = uniqueYoutubePage([{ videoId: "a" }, { videoId: "b" }, { videoId: "c" }, { videoId: "c" }, { videoId: "tail" }], seen);
  assert.deepEqual(rows.map(row => row.videoId), ["c", "tail"]);
  assert.equal(uniqueYoutubePage(rows, seen).length, 0);
});
test("unknown and epoch dates never become today's uploads", () => {
  assert.equal(youtubePublishedTime("1970-01-01T00:00:00.000Z"), 0);
  assert.equal(youtubePublishedTime("bad"), 0);
  assert.equal(youtubePublishedTime("2026-09-29T12:00:00Z"), Date.parse("2026-09-29T12:00:00Z"));
});

test("legacy synthetic archive dates are repaired without guessing feed dates", () => {
 const row = {id:"a",addedAt:1800000000000,description:"Creator public channel catalog item.",remote:{kind:"youtube",channelName:"Creator"}};
 assert.equal(repairLegacyYoutubeDate(row as any).addedAt,0);
 const feed = {...row,description:"A real feed description"};
 assert.equal(repairLegacyYoutubeDate(feed as any),feed);
});
