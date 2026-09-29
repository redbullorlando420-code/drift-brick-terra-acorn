import { test } from "node:test";
import assert from "node:assert/strict";
import type { LibraryVideo } from "./types.ts";
import { isTwitchClip, sampleTwitchClips } from "./twitch-clips.ts";

const clips = Array.from({ length: 30_000 }, (_, index) => ({
  id: `tw:c:${index}`,
  extension: "clip",
  remote: { kind: "twitch", channelName: `Creator ${index % 30}`, live: false },
} as LibraryVideo));

test("clip sampler keeps a huge catalog to a small, repeatable and balanced window", () => {
  const first = sampleTwitchClips(clips, 47);
  assert.equal(first.length, 48);
  assert.deepEqual(sampleTwitchClips(clips, 47).map((video) => video.id), first.map((video) => video.id));
  assert.notDeepEqual(sampleTwitchClips(clips, 48).map((video) => video.id), first.map((video) => video.id));
  assert.equal(new Set(first.map((video) => video.remote?.channelName)).size, 30);
  assert.equal(sampleTwitchClips(clips, 47, "Creator 7").length, 48);
  assert.equal(isTwitchClip({ ...clips[0], remote: { kind: "twitch", channelName: "Creator 0", live: true } }), false);
});
