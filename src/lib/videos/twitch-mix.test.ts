import test from "node:test";
import assert from "node:assert/strict";
import { buildTwitchMix } from "./twitch-mix.ts";
import type { LibraryVideo } from "./types";
const video = (i: number, channel = "Huge"): LibraryVideo => ({
  id: `tw:v:${i}`,
  name: String(i),
  folderId: channel,
  path: String(i),
  extension: "vod",
  mime: "video/twitch",
  size: 0,
  addedAt: i,
  remote: { kind: "twitch", channelName: channel },
});
test("a 99,000-video creator cannot dominate the first creator rotation", async () => {
  const videos = Array.from({ length: 100_000 }, (_, i) =>
    video(i, i < 99_000 ? " Huge " : `Small ${i % 100}`),
  );
  const first = await buildTwitchMix(videos, 71, undefined, false, 96, async () => {});
  const same = await buildTwitchMix(videos, 71, undefined, false, 96, async () => {});
  const next = await buildTwitchMix(videos, 72, undefined, false, 96, async () => {});
  assert.equal(first.length, 96);
  assert.equal(new Set(first.map((row) => row.remote?.channelName?.trim().toLowerCase())).size, 96);
  assert.deepEqual(first, same);
  assert.notDeepEqual(
    first.map((row) => row.id),
    next.map((row) => row.id),
  );
});
test("ranked VODs retain taste order within each creator and exclude live rows", async () => {
  const rows = [
    video(9, "One"),
    video(1, "Two"),
    video(2, "One"),
    { ...video(3, "Three"), remote: { kind: "twitch" as const, channelName: "Three", live: true } },
  ];
  const result = await buildTwitchMix(rows, 2, undefined, true, 96, async () => {});
  assert.deepEqual(
    result.filter((row) => row.folderId === "One").map((row) => row.id),
    ["tw:v:9", "tw:v:2"],
  );
  assert.equal(result.length, 3);
});
test("superseded mixes cancel before scanning the remaining archive", async () => {
  const controller = new AbortController();
  let turns = 0;
  await assert.rejects(
    buildTwitchMix(
      Array.from({ length: 10_000 }, (_, i) => video(i)),
      2,
      controller.signal,
      false,
      96,
      async () => {
        if (++turns === 3) controller.abort();
      },
    ),
    { name: "AbortError" },
  );
  assert.equal(turns, 3);
});

test("new-to-you ranking finds unseen entries inside every creator, including huge archives", async () => {
  const rows = Array.from({ length: 5000 }, (_, i) =>
    video(i, i < 4000 ? "Huge" : `Rare ${i % 10}`),
  );
  const result = await buildTwitchMix(
    rows,
    2,
    undefined,
    false,
    96,
    async () => {},
    (row) => (row.id === "tw:v:3999" ? 0 : 5),
  );
  assert.equal(result.find((row) => row.folderId === "Huge")?.id, "tw:v:3999");
  assert.equal(new Set(result.slice(0, 11).map((row) => row.folderId)).size, 11);
});
