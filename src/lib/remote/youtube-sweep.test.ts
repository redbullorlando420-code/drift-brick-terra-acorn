import { test } from "node:test";
import assert from "node:assert/strict";
import { LIBRARY_LIMITS } from "../library-limits.ts";
import { selectYoutubeCoverageRecovery, selectYoutubeFeedChannels, selectYoutubeLiveChannels, selectYoutubeSweepChannels, youtubeSweepDue } from "./youtube-sweep.ts";

test('RSS rotation skips unresolved and failing sources but continues during a catalog-only cooldown', () => {
  const now = 1_000_000;
  const channels = [
    { id: 'yt:unknown', kind: 'youtube', lastCheckedAt: 0 },
    { id: 'yt:cooling', kind: 'youtube', channelId: 'UCknown', lastCheckedAt: 1, lastProviderFailure: { kind: 'rate-limited', at: now, retryAt: now + 100_000, cooldownScope: 'catalog' } },
    { id: 'yt:feed-blocked', kind: 'youtube', channelId: 'UCknown', lastCheckedAt: 0, lastProviderFailure: { kind: 'rate-limited', at: now, retryAt: now + 100_000, cooldownScope: 'feed' } },
    { id: 'yt:missing', kind: 'youtube', channelId: 'UCknown', lastCheckedAt: 0, lastProviderFailure: { kind: 'unavailable', at: now } },
    { id: 'yt:healthy', kind: 'youtube', channelId: 'UCknown', lastCheckedAt: 10 },
  ];
  assert.deepEqual(selectYoutubeFeedChannels(channels, new Map(), now, 4).map(row => row.id), ['yt:cooling', 'yt:healthy']);
  channels[1].lastCheckedAt = now;
  assert.equal(selectYoutubeFeedChannels(channels, new Map(), now, 1)[0].id, 'yt:healthy', 'failed checks and healthy checks both consume a durable turn');
});

test("automatic YouTube history stays bounded while manual pulls retain depth", () => {
  assert.equal(LIBRARY_LIMITS.youtubeCatalogSweepIntervalMs, 60 * 60_000);
  assert.equal(LIBRARY_LIMITS.youtubeScheduledRefreshChannels, 4);
  assert.equal(LIBRARY_LIMITS.youtubeScheduledVideosPerChannel, 100);
  assert.equal(LIBRARY_LIMITS.youtubeRecentRefreshChannels, 4);
  assert.equal(LIBRARY_LIMITS.youtubeLiveRefreshIntervalMs, 60_000);
  assert.equal(LIBRARY_LIMITS.youtubeLiveRefreshChannels, 12);
  assert.equal(LIBRARY_LIMITS.youtubeManualRefreshVideosPerChannel, 100);
  assert.equal(LIBRARY_LIMITS.youtubeBulkImportVideosPerChannel, 100);
  assert.equal(LIBRARY_LIMITS.youtubeCatalogSourcesPerRequest, 1);
});

test('expired provider cooldowns release creators without adding a one-hour missing-source delay', () => {
  const now = 1_000_000;
  const source = { id: 'yt:confirmed', kind: 'youtube', channelId: 'UC1234567890123456789012', lastProviderFailure: { kind: 'rate-limited', at: now - 900_000, retryAt: now } };
  assert.deepEqual(selectYoutubeSweepChannels([source], now - 1, 4, 7 * 86_400_000), []);
  assert.deepEqual(selectYoutubeSweepChannels([source], now, 4, 7 * 86_400_000), [source]);
  assert.deepEqual(selectYoutubeCoverageRecovery([source], new Map(), now, 2), [source]);
  assert.deepEqual(selectYoutubeSweepChannels([{ ...source, lastProviderFailure: { kind: 'rate-limited', at: now - 300_000 } }], now, 4, 7 * 86_400_000).map(row => row.id), [source.id]);
  assert.deepEqual(selectYoutubeSweepChannels([{ ...source, lastProviderFailure: { kind: 'unavailable', at: now - 900_000 } }], now, 4, 7 * 86_400_000), []);
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

test("YouTube live checks keep confirmed live creators fresh while discovering others", () => {
  const channels = [
    { id: "yt:active-old", kind: "youtube", live: true, liveCheckedAt: 100 },
    { id: "yt:active-new", kind: "youtube", live: true, liveCheckedAt: 900 },
    ...Array.from({ length: 12 }, (_, index) => ({ id: `yt:discover-${index}`, kind: "youtube", liveCheckedAt: index + 1 })),
    { id: "ytpl:list", kind: "youtube", live: true },
  ];
  assert.deepEqual(selectYoutubeLiveChannels(channels, 4).map(channel => channel.id), [
    "yt:active-old", "yt:active-new", "yt:discover-0", "yt:discover-1",
  ]);
  const allActive = channels.filter(channel => channel.id.startsWith("yt:active"));
  assert.deepEqual(selectYoutubeLiveChannels(allActive, 4).map(channel => channel.id), ["yt:active-old", "yt:active-new"]);
});

test("empty creators precede deep archives", () => {
 const channels = [{id:"deep",kind:"youtube"},{id:"empty",kind:"youtube",channelId:'UCconfirmed',catalogCheckedAt:900}];
 assert.deepEqual(selectYoutubeSweepChannels(channels,1000,2,2000,{videoCounts:new Map([["deep",10000]])}).map(c=>c.id),["empty","deep"]);
});

test("a recently failed empty creator cannot monopolize scheduled pulls", () => {
 const channels = [{id:"empty",kind:"youtube",lastProviderFailure:{at:999}},{id:"thin",kind:"youtube",catalogCheckedAt:100}];
 assert.deepEqual(selectYoutubeSweepChannels(channels,1000,1,2000,{videoCounts:new Map([["thin",12]])}).map(c=>c.id),["thin"]);
 assert.equal(selectYoutubeSweepChannels(channels,1000,2,2000,{includeExhausted:true}).length,2);
});
test("thin creators rotate by last attempt rather than exact volume", () => {
 const channels = [{id:"empty",kind:"youtube",catalogCheckedAt:900},{id:"thin",kind:"youtube",catalogCheckedAt:100}];
 assert.deepEqual(selectYoutubeSweepChannels(channels,1000,1,2000,{videoCounts:new Map([["thin",12]])}).map(c=>c.id),["thin"]);
});

test("empty retries cannot starve archives older than the coverage head start", () => {
 const day = 24 * 60 * 60_000;
 const channels = [{id:"empty",kind:"youtube",catalogCheckedAt:day * 3},{id:"deep",kind:"youtube",catalogCheckedAt:day}];
 assert.equal(selectYoutubeSweepChannels(channels,day * 3,1,day * 7,{videoCounts:new Map([["deep",10000]])})[0].id,"deep");
});

test("recent checks reserve bounded slots for empty creators and rotate failures out", () => {
  const now = 2 * 60 * 60_000;
  const channels = [{id:"a",kind:"youtube",lastCheckedAt:100}, {id:"b",kind:"youtube",lastCheckedAt:50}, {id:"c",kind:"youtube",lastCheckedAt:1,lastProviderFailure:{at:now-100}}, {id:"full",kind:"youtube"}];
  assert.deepEqual(selectYoutubeCoverageRecovery(channels, new Map([["full",100]]), now, 2).map(row=>row.id), ["b","a"]);
  assert.equal(selectYoutubeCoverageRecovery(channels, new Map([["full",100]]), now, 1).length, 1);
});
test('confirmed creators receive archive turns while unresolved imports recover in a bounded lane', () => {
  const channels: Array<{id:string;kind:string;channelId?:string;importNeedsReview?:boolean}> = [...Array.from({length:100},(_,i)=>({id:`yt:stub${i}`,kind:'youtube'})),...Array.from({length:100},(_,i)=>({id:`yt:real${i}`,kind:'youtube',channelId:`UC${i}`})),{id:'yt:fragment',kind:'youtube',importNeedsReview:true}];
  const chosen = selectYoutubeSweepChannels(channels,1000,100,2000,{includeExhausted:true,videoCounts:new Map()});
  assert.equal(chosen.filter(row=>row.channelId).length,87);
  assert.equal(chosen.length,100);assert(!chosen.some(row=>row.importNeedsReview));
  assert.equal(selectYoutubeSweepChannels(channels,1000,1,2000,{videoCounts:new Map()})[0].channelId,'UC0');
});

test('background live discovery does not spend its request budget resolving imported display names', () => {
  const channels = [{ id: 'yt:unresolved', kind: 'youtube', title: 'Display Name' }, { id: 'yt:confirmed', kind: 'youtube', channelId: 'UCconfirmed' }];
  assert.deepEqual(selectYoutubeLiveChannels(channels, 12, true).map(row => row.id), ['yt:confirmed']);
});
