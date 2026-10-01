import test from "node:test";
import assert from "node:assert/strict";
import { adultConnectionTags, adultMediaIdentity } from "./adult-stat-signals.ts";
test("generated taxonomy parents and live-room labels don't inflate connections", () => {
  assert.deepEqual(adultConnectionTags(['fetish-amateur','genre-amateur','meta-production-amateur','fetish-live','fetish-cam','fetish-public','fetish-public-room','fetish-role-play','fetish-roleplay'], true), ['fetish-amateur','fetish-roleplay']);
});
test("shared thumbnails and query-driven room endpoints are not video identity", () => {
  assert.equal(adultMediaIdentity('https://cam.example/player.php?model=alice'), undefined);
  assert.equal(adultMediaIdentity('https://cam.example/player.php?model=bob'), undefined);
  assert.equal(adultMediaIdentity('https://example.com/'), undefined);
});
test("content query IDs stay distinct while tracking links share identity", () => {
  assert.notEqual(adultMediaIdentity('https://tube.example/watch.php?viewkey=one'), adultMediaIdentity('https://tube.example/watch.php?viewkey=two'));
  assert.equal(adultMediaIdentity('https://tube.example/video/123?utm_source=feed'), adultMediaIdentity('https://tube.example/video/123?utm_source=search'));
  assert.notEqual(adultMediaIdentity('https://cdn.example/MediaA.mp4'), adultMediaIdentity('https://cdn.example/mediaa.mp4'));
});
