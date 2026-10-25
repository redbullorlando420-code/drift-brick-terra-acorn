import assert from "node:assert/strict";
import test from "node:test";
import {
  describeRoomMedia,
  resolveRoomMedia,
  mergeRoomMedia,
  roomVideoFromUrl,
  roomMediaKey,
  parseRoomLinks,
  resolveRoomRequest,
  roomCatalogCandidates,
} from "./room-media.ts";
import { prepareRoomCandidates, searchRoomCandidates } from "./room-candidates.ts";
import type { LibraryVideo } from "../videos/types.ts";

const youtube: LibraryVideo = {
  id: "yt:video-1",
  name: "A public video",
  folderId: "youtube:creator",
  path: "video-1",
  extension: "yt",
  mime: "video/youtube",
  size: 0,
  addedAt: 1,
  poster: "https://i.ytimg.com/vi/video-1/hqdefault.jpg",
  remote: {
    kind: "youtube",
    videoId: "video-1",
    channelName: "Creator",
    embedUrl: "https://www.youtube.com/embed/video-1",
    watchUrl: "https://www.youtube.com/watch?v=video-1",
  },
};

test("room media descriptor reconstructs a provider video without guest catalog data", () => {
  const payload = describeRoomMedia(youtube);
  const resolved = resolveRoomMedia(payload);
  assert.equal(resolved?.video?.name, youtube.name);
  assert.equal(resolved?.video?.remote?.videoId, "video-1");
  assert.equal(resolved?.video?.remote?.embedUrl, youtube.remote?.embedUrl);
});
test('YouTube live URLs retain live status through normalized room descriptors', () => {
  const video = roomVideoFromUrl('https://www.youtube.com/live/liveRoute01?si=share');
  assert.ok(video);
  assert.equal(video.remote?.live, true);
  assert.equal(resolveRoomMedia(describeRoomMedia(video))?.video?.remote?.live, true);
  assert.equal(roomVideoFromUrl('https://www.youtube.com/watch?v=normalVod01')?.remote?.live, false);
  assert.equal(describeRoomMedia({...youtube,remote:{...youtube.remote!,live:true}})?.live, true);
});

test("room media descriptors reject arbitrary iframe hosts", () => {
  const resolved = resolveRoomMedia({
    ...describeRoomMedia(youtube),
    embedUrl: "https://evil.example/embed",
  });
  assert.equal(resolved, null);
});

test("local room media carries only explicit match metadata and never a file URL", () => {
  const share = { name: "movie.mp4", fingerprint: "movie.mp4::100::5", size: 100, modified: 5 };
  const payload = describeRoomMedia(undefined, share);
  const resolved = resolveRoomMedia(payload);
  assert.equal(resolved?.descriptor.kind, "local");
  assert.equal(resolved?.descriptor.local?.fingerprint, share.fingerprint);
  assert.equal(resolved?.video?.src, undefined);
  assert.equal("src" in (payload ?? {}), false);
});

test("Twitch's actual player host and thumbnails survive a guest handoff", () => {
  const video = {
    ...youtube,
    id: "twitch:1234",
    poster: "https://static-cdn.jtvnw.net/cf_vods/thumb.jpg",
    remote: {
      kind: "twitch" as const,
      videoId: "1234",
      embedUrl: "https://player.twitch.tv/?video=v1234",
      watchUrl: "https://www.twitch.tv/videos/1234",
    },
  };
  const resolved = resolveRoomMedia(describeRoomMedia(video));
  assert.equal(resolved?.video?.remote?.embedUrl, video.remote.embedUrl);
  assert.equal(resolved?.video?.poster, video.poster);
  assert.equal(resolveRoomMedia(describeRoomMedia(youtube))?.video?.poster, youtube.poster);
});

test("local catalog metadata identifies a stream without exposing a host blob URL or path", () => {
  const local = {
    ...youtube,
    id: "local-library:123",
    remote: undefined,
    src: "blob:https://host/file",
    path: "C:/private/movie.mp4",
  };
  const descriptor = { ...describeRoomMedia(local)!, streamId: "stream-123" };
  const resolved = resolveRoomMedia(descriptor);
  assert.equal(resolved?.descriptor.streamId, "stream-123");
  assert.equal(resolved?.video?.id, local.id);
  assert.equal(resolved?.video?.src, undefined);
  assert.equal(resolved?.video?.path, "");
});

test("guest room metadata remains bounded across many selections and queue snapshots", () => {
  let cache = {};
  for (let index = 0; index < 300; index++) {
    const id = `yt:${index}`;
    cache = mergeRoomMedia(cache, [{ ...describeRoomMedia(youtube), id }], [id, "yt:0"]);
    assert.ok(Object.keys(cache).length <= 2);
  }
  assert.deepEqual(Object.keys(cache), ["yt:299", "yt:0"]);
});

test("timeline heartbeats keep the room metadata snapshot stable", () => {
  const payload = describeRoomMedia(youtube);
  const first = mergeRoomMedia({}, [payload], [youtube.id]);
  assert.equal(mergeRoomMedia(first, [payload], [youtube.id]), first);
});

test("incomplete provider cards reconstruct a playable route from IDs and watch URLs", () => {
  for (const remote of [
    { kind: "youtube" as const, videoId: "dQw4w9WgXcQ" },
    { kind: "youtube" as const, watchUrl: "https://youtu.be/dQw4w9WgXcQ?t=12" },
    { kind: "twitch" as const, videoId: "v1234" },
    { kind: "twitch" as const, watchUrl: "https://www.twitch.tv/videos/1234" },
    { kind: "twitch" as const, live: true, watchUrl: "https://www.twitch.tv/host_creator" },
    { kind: "twitch" as const, videoId: "PublicClipSlug" },
  ]) {
    const resolved = resolveRoomMedia(describeRoomMedia({ ...youtube, remote }));
    assert.ok(resolved?.video?.remote?.embedUrl);
    assert.match(
      resolved.video.remote.embedUrl,
      /^https:\/\/(?:www.youtube.com\/embed\/|player.twitch.tv\/\?|clips.twitch.tv\/embed\?)/,
    );
    if (remote.kind === "twitch" && remote.live) assert.equal(resolved.video.remote.live, true);
  }
  assert.equal(resolveRoomMedia({ id: "broken", name: "No identity", kind: "youtube" }), null);
});

test("watch pages become embed routes and the receiving device supplies its own parent/origin", () => {
  const resolved = resolveRoomMedia({
    id: "tw:1",
    name: "Old cached VOD",
    kind: "twitch",
    embedUrl: "https://www.twitch.tv/videos/1234?parent=host.example",
  });
  assert.equal(resolved?.video?.remote?.embedUrl, "https://player.twitch.tv/?video=v1234");
  assert.equal(
    resolveRoomMedia({
      id: "bad",
      name: "Untrusted",
      kind: "youtube",
      videoId: "dQw4w9WgXcQ",
      embedUrl: "https://evil.example/embed",
    }),
    null,
  );
});

test("an empty guest can propose a public link with bounded provider metadata", () => {
  const youtube = roomVideoFromUrl("youtu.be/dQw4w9WgXcQ");
  assert.equal(youtube?.remote?.videoId, "dQw4w9WgXcQ");
  assert.equal(roomVideoFromUrl('http://m.youtube.com/watch?v=dQw4w9WgXcQ')?.remote?.videoId,'dQw4w9WgXcQ');
  assert.equal(roomVideoFromUrl("https://twitch.tv/videos/1234")?.remote?.videoId, "1234");
  assert.equal(
    roomVideoFromUrl("https://clips.twitch.tv/ExampleSlug")?.remote?.embedUrl,
    "https://clips.twitch.tv/embed?clip=ExampleSlug",
  );
  for (const url of [
    "https://evil.example/embed",
    "https://youtube.com/playlist?list=abc",
    "blob:https://host/file",
    "javascript:alert(1)",
  ])
    assert.equal(roomVideoFromUrl(url), null);
});

test("provider identity ignores device catalog IDs and distinguishes Twitch live, clips and VODs", () => {
  const alternate = roomVideoFromUrl("https://m.youtube.com/watch?v=video-1&t=12")!;
  assert.notEqual(alternate.id, youtube.id);
  assert.equal(roomMediaKey(alternate), roomMediaKey(youtube));
  assert.equal(roomMediaKey(roomVideoFromUrl("https://twitch.tv/SomeChannel")!), roomMediaKey(roomVideoFromUrl("https://twitch.tv/somechannel")!));
  assert.notEqual(roomMediaKey(roomVideoFromUrl("https://clips.twitch.tv/1234")!), roomMediaKey(roomVideoFromUrl("https://twitch.tv/videos/1234")!));
  assert.notEqual(roomMediaKey({...youtube,id:"a",remote:undefined}),roomMediaKey({...youtube,id:"b",remote:undefined}));
});

test("multi-link pastes preserve order, deduplicate aliases and bound invalid or oversized input", () => {
  const result=parseRoomLinks("https://youtu.be/video-1\r\nhttps://youtube.com/watch?v=video-1\nhttps://twitch.tv/videos/1234\nhttps://evil.example/file\n\n");
  assert.deepEqual(result.videos.map(video=>roomMediaKey(video)),["youtube:video-1","twitch:vod:1234"]);
  assert.equal(result.invalid,1);assert.equal(result.duplicates,1);assert.equal(result.truncated,false);
  const huge=parseRoomLinks(Array.from({length:2000},(_,i)=>`https://twitch.tv/videos/${i+1}`).join("\n"));
  assert.equal(huge.videos.length,48);assert.equal(huge.truncated,true);
  assert.equal(parseRoomLinks("javascript:alert(1)\nblob:https://host/file").invalid,2);
});

test("guest catalog ID collisions preserve both provider titles and reuse the active identity", () => {
  const guest = { ...youtube, remote: { kind: "youtube" as const, videoId: "guest-video" } };
  const lookup = (id: string) => id === youtube.id ? youtube : undefined;
  const requested = resolveRoomRequest(guest.id, describeRoomMedia(guest), lookup, [youtube.id]);
  assert.equal(requested?.id, "room:youtube:guest-video");
  assert.equal(requested?.remote?.videoId, "guest-video");
  assert.equal(youtube.remote?.videoId, "video-1");
  const alias = { ...youtube, id: "other-device" };
  assert.equal(resolveRoomRequest(alias.id, describeRoomMedia(alias), lookup, [youtube.id]), youtube);
  assert.equal(resolveRoomRequest("wrong-id", describeRoomMedia(guest), lookup, []), undefined);
});

test("local requests need matching host file metadata, never only a colliding storage ID", () => {
  const local = { ...youtube, remote: undefined, name: "movie.mp4", size: 100, path: "private/host/movie.mp4", src: "blob:host" };
  const lookup = (id: string) => id === local.id ? local : undefined;
  assert.equal(resolveRoomRequest(local.id, describeRoomMedia(local), lookup, []), local);
  for (const different of [{ ...local, name: "guest.mp4" }, { ...local, size: 101 }])
    assert.equal(resolveRoomRequest(different.id, describeRoomMedia(different), lookup, []), undefined);
  assert.equal(resolveRoomRequest(local.id, null, lookup, []), undefined);
  assert.equal(resolveRoomRequest(local.id, describeRoomMedia(local), () => undefined, []), undefined);
  assert.equal(resolveRoomRequest(local.id, describeRoomMedia(local), () => youtube, []), undefined);
  const payload = describeRoomMedia(local)!;
  assert.equal(payload.size, 100);
  assert.equal(JSON.stringify(payload).includes("private/host"), false);
  assert.equal(JSON.stringify(payload).includes("blob:"), false);
});

test("room discovery preserves colliding personal titles without duplicating their shared aliases", () => {
  const personal = { ...youtube, name: "Personal title", remote: {kind:"youtube" as const,videoId:"guest-video"} };
  const alias = { ...personal, id:"room:youtube:guest-video" };
  const result=roomCatalogCandidates([personal],{[youtube.id]:youtube,[alias.id]:alias});
  assert.deepEqual(result.map(video=>video.name),["Personal title",youtube.name]);
  assert.equal(new Set(result.map(video=>video.id)).size,2);
  assert.equal(new Set(result.map(roomMediaKey)).size,2);
  assert.equal(personal.id,youtube.id);
  assert.equal(roomCatalogCandidates([youtube],{[youtube.id]:youtube}).length,1);
});

test("room candidate preparation preserves its rating, history and shuffle order while yielding", async () => {
  const rows = Array.from({ length: 2_000 }, (_, index) => ({
    ...youtube,
    id: `yt:${index}`,
    name: index === 1_234 ? "A rare title" : `Title ${index}`,
    remote: { ...youtube.remote!, videoId: `id-${index}` },
  }));
  const favorite = rows[17]!;
  const history = [{ id: rows[1]!.id }, { id: rows[18]!.id }];
  let turns = 0;
  const turn = async () => { turns++; };
  const rank = (id: string, seed: number) => {
    let value = seed >>> 0;
    for (let index = 0; index < id.length; index++) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
    return value >>> 0;
  };
  const result = await prepareRoomCandidates({
    videos: rows,
    shared: {},
    guest: false,
    favorites: { [favorite.id]: true },
    hidden: { [rows[2]!.id]: true },
    unavailable: { [rows[3]!.id]: true },
    history,
    seed: 42,
    canStage: () => true,
    rank,
  }, turn);
  const expected = rows.filter(row => row.id !== rows[2]!.id && row.id !== rows[3]!.id)
    .map(video => ({ video, score: rank(`${video.id}:42`, 42) / 0xffffffff + (video.id === favorite.id ? 0.18 : 0) - (history.some(entry => entry.id === video.id) ? 0.32 : 0) }))
    .sort((a, b) => b.score - a.score).map(row => row.video.id);
  assert.deepEqual(result.map(row => row.id), expected);
  assert.ok(turns > 10, "large candidate scans and sorting should yield between bounded slices");
  assert.deepEqual((await searchRoomCandidates(result, "rare title", 20, turn)).map(row => row.id), ["yt:1234"]);
  assert.deepEqual((await searchRoomCandidates(result, "", 3, turn)).map(row => row.id), expected.slice(0, 3));
});

test("room catalog preparation can be cancelled before publishing stale candidates", async () => {
  const rows = Array.from({ length: 10_000 }, (_, index) => ({
    ...youtube,
    id: `yt:${index}`,
    remote: { ...youtube.remote!, videoId: `id-${index}` },
  }));
  let turns = 0;
  await assert.rejects(prepareRoomCandidates({
    videos: rows,
    shared: {},
    guest: false,
    favorites: {},
    hidden: {},
    unavailable: {},
    history: [],
    seed: 1,
    canStage: () => true,
    rank: id => id.length,
  }, async () => { if (++turns === 4) throw new Error("superseded room snapshot"); }), /superseded room snapshot/);
});
