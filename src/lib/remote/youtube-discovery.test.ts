import { test } from "node:test";
import assert from "node:assert/strict";
import type { FollowedChannel, LibraryVideo } from "../videos/types";
import { youtubeOutsideFollows, youtubeTopicIndex } from "./youtube-discovery.ts";
import { mixYoutubeCreators, sampleYoutubeCreatorShelves } from "./youtube-mix.ts";

function video(id: string, channelId: string, name = id): LibraryVideo {
  return { id, folderId: `yt:${channelId}`, name, path: id, extension: "mp4", mime: "video/mp4", size: 0, addedAt: 0,
    remote: { kind: "youtube", channelId, channelName: channelId } };
}

test("rare topics beyond a deep archive stay discoverable with complete counts", () => {
  const archive = Array.from({ length: 10000 }, (_, i) => video(`pc-${i}`, "deep", "PC build"));
  const rare = video("rare", "small", "Astronomy lecture");
  const rows = [...archive, rare, rare, { ...rare, id: "live", remote: { ...rare.remote!, live: true } }];
  const index = youtubeTopicIndex(rows, {});
  assert.equal(index.get("hardware")?.length, 10000);
  assert.deepEqual(index.get("science"), [rare]);
  assert.deepEqual(mixYoutubeCreators(index.get("science")!, 23), [rare]);
  assert.equal(sampleYoutubeCreatorShelves(index.get("science")!, 23)[0].videos[0].id, "rare");
});

test("topic cache is reused until the catalog or saved tags change", () => {
  const rows = [video("a", "maker")];
  const tags = { a: ["science"] };
  assert.equal(youtubeTopicIndex(rows, tags), youtubeTopicIndex(rows, tags));
  assert.equal(youtubeTopicIndex(rows, { a: ["music"] }).has("science"), false);
  assert.equal(youtubeTopicIndex([...rows, video("b", "other", "Astronomy")], {}).get("science")?.length, 1);
});

test("saved creators stay out of discovery after renaming and playlist imports", () => {
  const renamed = { ...video("renamed", "stable"), remote: { kind: "youtube" as const, channelId: "stable", channelName: "New name" } };
  const playlist = { ...video("playlist", "unknown"), folderId: "ytpl:list" };
  const outside = video("outside", "outside");
  const follows: FollowedChannel[] = [
    { id: "yt:stable", kind: "youtube", handle: "handle", title: "Old name", channelId: "stable" },
    { id: "ytpl:list", kind: "youtube", handle: "list", title: "Playlist" },
  ];
  assert.deepEqual(youtubeOutsideFollows([renamed, playlist, outside], follows), [outside]);
});

test("creator shelves reach older filtered uploads and remain bounded", () => {
  const rows = Array.from({ length: 1000 }, (_, i) => video(`item-${i}`, `creator-${i % 20}`));
  const shelves = sampleYoutubeCreatorShelves(rows, 12, 16, 24);
  assert.equal(shelves.length, 16);
  assert.equal(new Set(shelves.map(shelf => shelf.key)).size, 16);
  for (const shelf of shelves) assert.equal(shelf.videos.length, 24);
  assert.notDeepEqual(shelves, sampleYoutubeCreatorShelves(rows, 65, 16, 24));
});

test("different channel IDs with identical names remain distinct", () => {
  const outside = video("outside", "different");
  const follows: FollowedChannel[] = [{ id: "yt:saved", kind: "youtube", channelId: "saved", title: "different", handle: "saved" }];
  assert.deepEqual(youtubeOutsideFollows([outside], follows), [outside]);
});
