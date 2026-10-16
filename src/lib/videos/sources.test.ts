import { test } from "node:test";
import assert from "node:assert/strict";
import { rememberFile, resolvePlayUrl, trimObjectUrls, pinPlayUrl, getSourceMemorySnapshot, forgetFolder } from "./sources.ts";

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

test("watch room source stays playable across idle trimming until it is released", async () => {
  rememberFile("room-playing", new File(["playing"], "room.mp4"));
  const release = pinPlayUrl("room-playing");
  const url = await resolvePlayUrl({ id: "room-playing" });
  trimObjectUrls();
  assert.equal(await (await fetch(url)).text(), "playing");
  release(); release();
  trimObjectUrls();
  await assert.rejects(fetch(url));
  forgetFolder("test", ["room-playing"]);
});
