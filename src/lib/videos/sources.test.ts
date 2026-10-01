import { test } from "node:test";
import assert from "node:assert/strict";
import { rememberFile, resolvePlayUrl, trimObjectUrls, getSourceMemorySnapshot, forgetFolder } from "./sources.ts";

test("idle cleanup revokes temporary blobs while keeping the current player and file access", async () => {
  rememberFile("playing", new File(["playing"], "playing.mp4"));
  rememberFile("old", new File(["old"], "old.mp4"));
  const playing = await resolvePlayUrl({ id: "playing" });
  const old = await resolvePlayUrl({ id: "old" });
  trimObjectUrls(["playing"]);
  assert.equal(getSourceMemorySnapshot().objectUrls, 1);
  assert.equal(await resolvePlayUrl({ id: "playing" }), playing);
  await assert.rejects(fetch(old));
  assert.notEqual(await resolvePlayUrl({ id: "old" }), old);
  forgetFolder("test", ["playing", "old"]);
});
