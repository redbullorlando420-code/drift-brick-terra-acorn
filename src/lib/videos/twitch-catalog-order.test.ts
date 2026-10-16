import test from "node:test";
import assert from "node:assert/strict";
import { orderTwitchCatalog, twitchCreatorKey } from "./twitch-catalog-order.ts";
import { rankTwitchVods } from "./twitch-vod-ranking.ts";
import type { LibraryVideo } from "./types";
const video = (i: number, creator = "Huge"): LibraryVideo => ({
  id: `tw:v:${i}`,
  name: `Video ${i}`,
  folderId: creator,
  path: `vod/${i}`,
  extension: "vod",
  mime: "video/twitch",
  size: 0,
  addedAt: i,
  remote: { kind: "twitch", channelName: creator },
});
test("a complete 100,000-video grid rotates creators and retains every entry through the long tail", async () => {
  const videos = Array.from({ length: 100_000 }, (_, i) =>
    video(i, i < 99_000 ? "Huge" : `Rare ${i % 100}`),
  );
  let turns = 0;
  const first = await orderTwitchCatalog(videos, "mix", 31, undefined, async () => {
    turns++;
  });
  assert.equal(first.length, videos.length);
  assert.equal(new Set(first).size, videos.length);
  assert.equal(new Set(first.slice(0, 101).map(twitchCreatorKey)).size, 101);
  assert.ok(
    turns > 1000 && turns < 10_000,
    "single-creator tail yields by batch rather than once per video",
  );
  assert.deepEqual(await orderTwitchCatalog(videos, "mix", 31, undefined, async () => {}), first);
  assert.notDeepEqual(
    (await orderTwitchCatalog(videos, "mix", 32, undefined, async () => {})).slice(0, 30),
    first.slice(0, 30),
  );
});
test("explicit orders and offline placeholders keep their previous behavior", async () => {
  const rows = [
    video(1),
    video(2),
    { ...video(3), id: "tw:old:live", extension: "live" },
    {
      ...video(4),
      remote: {
        kind: "twitch" as const,
        channelName: "Live",
        live: true,
        viewers: 9,
        observedAt: Date.now(),
      },
    },
  ];
  assert.deepEqual(
    (await orderTwitchCatalog(rows, "live", 1, undefined, async () => {})).map((row) => row.id),
    ["tw:v:4", "tw:v:2", "tw:v:1"],
  );
  assert.deepEqual(
    (await orderTwitchCatalog(rows, "name", 1, undefined, async () => {})).map((row) => row.id),
    ["tw:v:1", "tw:v:2", "tw:v:4"],
  );
  const controller = new AbortController();
  let turns = 0;
  await assert.rejects(
    orderTwitchCatalog(
      Array.from({ length: 10_000 }, (_, i) => video(i)),
      "mix",
      1,
      controller.signal,
      async () => {
        if (++turns === 3) controller.abort();
      },
    ),
    { name: "AbortError" },
  );
});
test("VOD ranking computes each score once, yields and keeps full results without live or clips", async () => {
  const rows = Array.from({ length: 5000 }, (_, i) => video(i));
  let scores = 0,
    turns = 0;
  const result = await rankTwitchVods(
    [
      ...rows,
      { ...video(9000), remote: { kind: "twitch", live: true } },
      { ...video(9001), extension: "clip" },
      { ...video(9002), tagline: "Offline channel" },
      { ...video(9003), path: "twitch/legacy/channel" },
    ],
    (row) => {
      scores++;
      return row.addedAt;
    },
    undefined,
    async () => {
      turns++;
    },
  );
  assert.equal(result.length, 5000);
  assert.equal(scores, 5000);
  assert.equal(result[0]?.id, "tw:v:4999");
  assert.ok(turns > 20);
});
