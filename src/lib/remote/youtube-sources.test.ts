import test from "node:test";
import assert from "node:assert/strict";
import type { LibraryVideo } from "../videos/types.ts";
import { retainYoutubeSources, youtubeSourceCounts, youtubeSourceIndex, youtubeVideosForSource } from "./youtube-sources.ts";
import { mergeRemoteCatalog, mergeRemoteRefresh } from "../videos/remote-merge.ts";

const channelId = "UC1234567890123456789012";
const video = (id = "AbCdEf12345", folderId = `yt:${channelId}`): LibraryVideo => ({ id: `yt:${id}`, folderId, name: "Upload", path: "youtube/Upload", mime: "video/youtube", extension: "yt", size: 0, addedAt: 1, remote: { kind: "youtube", videoId: id, channelId } });
test("playlist refresh keeps one video and both source memberships", () => {
  const original = video(), incoming = video(undefined, "ytpl:saved-list");
  const positions = new Map([[original.id, 0]]), committed: LibraryVideo[] = [];
  const merged = mergeRemoteCatalog([original], [incoming, incoming], positions, committed);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].folderId, original.folderId);
  assert.deepEqual(merged[0].remote?.sourceIds, [original.folderId, incoming.folderId]);
  const counts = youtubeSourceCounts(merged, [{id: original.folderId}, {id: incoming.folderId}]);
  assert.equal(counts.get(original.folderId), 1);
  assert.equal(counts.get(incoming.folderId), 1);
});
test("channel IDs recover coverage after legacy source IDs change", () => {
  const rows = [video(undefined, "old-import-id")];
  const counts = youtubeSourceCounts(rows, [{id: "yt:new-handle", channelId}, {id: "ytpl:unrelated", channelId}]);
  assert.equal(counts.get("yt:new-handle"), 1);
  assert.equal(counts.get("ytpl:unrelated"), 0);
});
test("a channel reached through a playlist has coverage without a duplicate card", () => {
  const rows = [video(undefined, "ytpl:list")];
  assert.equal(youtubeSourceCounts(rows, [{id:`yt:${channelId}`}]).get(`yt:${channelId}`), 1);
});
test("provider identity, not shared titles or artwork, detects duplicates", () => {
  const first = video(), alias = {...first, id:"legacy:old-card"}, different = video("aBcDeF12345");
  const index = youtubeSourceIndex([first, alias, different]);
  assert.equal(index.distinctVideos, 2);
  assert.equal(index.duplicateRows, 1);
  assert.equal(index.duplicateGroups, 1);
});
test("live cards are not upload coverage and snapshots reuse their index", () => {
  const rows = [{...video(), remote:{...video().remote!, live:true}}];
  const first = youtubeSourceIndex(rows);
  assert.equal(youtubeVideosForSource(first, {id: rows[0].folderId}).length, 0);
  assert.equal(first, youtubeSourceIndex(rows));
});
test("alias incoming IDs reuse existing playback identity in routine merges", () => {
  const original = {...video(), id:"saved:legacy"};
  const merged = mergeRemoteRefresh([original], [video()], [], new Set([original.id]));
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, original.id);
});
test("repeated source memberships do not rewrite an unchanged card", () => {
  const first = retainYoutubeSources(video(), video(undefined, "ytpl:list"));
  const next = retainYoutubeSources(first, {...video(), remote:{...video().remote!, sourceIds:first.remote?.sourceIds}});
  assert.equal(next.remote?.sourceIds, first.remote?.sourceIds);
  assert.equal(next.folderId, first.folderId);
});
