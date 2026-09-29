import { test } from "node:test";
import assert from "node:assert/strict";
import { LIBRARY_LIMITS } from "../library-limits.ts";
import { selectYoutubeLiveChannels, selectYoutubeSweepChannels, youtubeSweepDue } from "./youtube-sweep.ts";

test("automatic YouTube history stays bounded while manual pulls retain depth", () => {
  assert.equal(LIBRARY_LIMITS.youtubeCatalogSweepIntervalMs, 60 * 60_000);
  assert.equal(LIBRARY_LIMITS.youtubeScheduledRefreshChannels, 1);
  assert.equal(LIBRARY_LIMITS.youtubeScheduledVideosPerChannel, 100);
  assert.equal(LIBRARY_LIMITS.youtubeRecentRefreshChannels, 4);
  assert.equal(LIBRARY_LIMITS.youtubeLiveRefreshIntervalMs, 60_000);
  assert.equal(LIBRARY_LIMITS.youtubeLiveRefreshChannels, 12);
  assert.equal(LIBRARY_LIMITS.youtubeManualRefreshVideosPerChannel, 5_000);
  assert.equal(LIBRARY_LIMITS.youtubeBulkImportVideosPerChannel, 5_000);
  assert.equal(LIBRARY_LIMITS.youtubeCatalogSourcesPerRequest, 1);
});

test("archive sweeps remain due after reload and honor their interval", () => {
  assert.equal(youtubeSweepDue(0, 1_000, 900), true);
  assert.equal(youtubeSweepDue(1_000, 1_899, 900), false);
  assert.equal(youtubeSweepDue(1_000, 1_900, 900), true);
});

test("scheduled sweeps rotate to unfinished creators", () => {
  const now = 10_000;
  const channels = [
    { id: "yt:new", kind: "youtube" },
    { id: "yt:older", kind: "youtube", catalogCheckedAt: 500 },
    { id: "yt:done", kind: "youtube", catalogCheckedAt: 9_000, catalogExhaustedAt: 9_000 },
    { id: "ytpl:list", kind: "youtube" },
    { id: "tw:live", kind: "twitch" },
  ];
  assert.deepEqual(selectYoutubeSweepChannels(channels, now, 2, 2_000).map((channel) => channel.id), ["yt:new", "yt:older"]);
  assert.deepEqual(selectYoutubeSweepChannels(channels, now + 1_001, 5, 2_000).map((channel) => channel.id), ["yt:new", "yt:older", "yt:done"]);
});

test("full source sweep includes playlists but still leaves completed catalogs resting", () => {
  const channels = [
    { id: "yt:a", kind: "youtube", catalogCheckedAt: 100 },
    { id: "ytpl:p", kind: "youtube" },
    { id: "yt:b", kind: "youtube", catalogCheckedAt: 50, catalogExhaustedAt: 50 },
  ];
  assert.deepEqual(selectYoutubeSweepChannels(channels, 1_000, 10_000, 2_000, { includePlaylists: true }).map((row) => row.id), ["ytpl:p", "yt:a"]);
  assert.deepEqual(selectYoutubeSweepChannels(channels, 1_000, 10_000, 2_000, { includePlaylists: true, includeExhausted: true }).map((row) => row.id), ["ytpl:p", "yt:b", "yt:a"]);
});

test("manual next-creator pulls can retry completed channels when every archive is marked done", () => {
  const channels = [
    { id: "yt:older", kind: "youtube", catalogCheckedAt: 100, catalogExhaustedAt: 100 },
    { id: "yt:newer", kind: "youtube", catalogCheckedAt: 300, catalogExhaustedAt: 300 },
    { id: "ytpl:list", kind: "youtube" },
  ];
  assert.deepEqual(selectYoutubeSweepChannels(channels, 1_000, 2, 2_000).map((channel) => channel.id), []);
  assert.deepEqual(selectYoutubeSweepChannels(channels, 1_000, 1, 2_000, { recheckExhaustedWhenIdle: true }).map((channel) => channel.id), ["yt:older"]);
});

test("successive next-creator pulls advance past recently checked creators", () => {
  const now = 10_000;
  const channels = ["a", "b", "c", "d"].map((id) => ({ id: `yt:${id}`, kind: "youtube" }));
  const first = selectYoutubeSweepChannels(channels, now, 2, 2_000, { recheckExhaustedWhenIdle: true });
  const refreshed = channels.map((channel) => first.some((picked) => picked.id === channel.id) ? { ...channel, catalogCheckedAt: now } : channel);
  const second = selectYoutubeSweepChannels(refreshed, now + 1, 2, 2_000, { recheckExhaustedWhenIdle: true });
  assert.deepEqual(first.map((channel) => channel.id), ["yt:a", "yt:b"]);
  assert.deepEqual(second.map((channel) => channel.id), ["yt:c", "yt:d"]);
});

test("YouTube live checks rotate independently of archive cursors", () => {
  const channels = [
    { id: "yt:first", kind: "youtube", catalogCheckedAt: 1_000, liveCheckedAt: 500 },
    { id: "yt:second", kind: "youtube", catalogCheckedAt: 0, liveCheckedAt: 100 },
    { id: "yt:third", kind: "youtube", liveCheckedAt: 800 },
    { id: "ytpl:list", kind: "youtube" },
    { id: "tw:channel", kind: "twitch" },
  ];
  assert.deepEqual(selectYoutubeLiveChannels(channels, 2).map((channel) => channel.id), ["yt:second", "yt:first"]);
});
