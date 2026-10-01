import { test } from "node:test";
import assert from "node:assert/strict";
import { getAdultPreviewHealth, markAdultThumbGood, markAdultThumbFailed } from "./adult-thumb-session.ts";

test("long browsing sessions retain bounded artwork observations and loaded frames stay healthy", () => {
  for (let index = 0; index < 10_000; index++) markAdultThumbGood(`https://example.com/${index}.jpg`, `video-${index}`);
  assert.equal(getAdultPreviewHealth().tested, 560);
  markAdultThumbFailed("https://example.com/broken.jpg", "video-9999");
  assert.equal(getAdultPreviewHealth().failed, 0);
  for (let index = 0; index < 10_000; index++) markAdultThumbFailed(`https://example.com/fail-${index}.jpg`, `failed-${index}`);
  assert.equal(getAdultPreviewHealth().tested, 560);
  assert.equal(getAdultPreviewHealth().failed, 560);
});
