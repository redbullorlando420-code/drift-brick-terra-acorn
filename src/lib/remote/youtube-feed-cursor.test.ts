import assert from "node:assert/strict";
import test from "node:test";
import { newestYoutubeFeedVideoId, selectYoutubeFeedDelta } from "./youtube-feed-cursor.ts";

const feed = [
  { videoId: "newest" },
  { videoId: "newer" },
  { videoId: "cursor" },
  { videoId: "older" },
];

test("returns only uploads ahead of a saved YouTube cursor", () => {
  assert.deepEqual(selectYoutubeFeedDelta(feed, "cursor"), feed.slice(0, 2));
});

test("uses a bounded recent window when the cursor is absent or aged out", () => {
  assert.deepEqual(selectYoutubeFeedDelta(feed, undefined, 2), feed.slice(0, 2));
  assert.deepEqual(selectYoutubeFeedDelta(feed, "missing", 2), feed.slice(0, 2));
});

test("takes the newest provider identity only from the feed head", () => {
  assert.equal(newestYoutubeFeedVideoId(feed), "newest");
  assert.equal(newestYoutubeFeedVideoId([{ videoId: "" }, {}]), undefined);
});
