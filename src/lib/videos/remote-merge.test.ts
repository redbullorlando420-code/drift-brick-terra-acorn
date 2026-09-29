import test from "node:test";
import assert from "node:assert/strict";
import type { LibraryVideo } from "./types.ts";
import { mergeRemoteCatalog, mergeRemoteRefresh } from "./remote-merge.ts";

function archivedYoutubeVideo(): LibraryVideo {
  return {
    id: "yt-old-upload",
    folderId: "yt:UCcreator",
    name: "Older upload",
    path: "https://www.youtube.com/watch?v=yt-old-upload",
    extension: "mp4",
    mime: "video/mp4",
    size: 0,
    addedAt: 1,
    remote: { kind: "youtube", videoId: "yt-old-upload", channelName: "Creator", live: false },
  };
}

test("routine refreshes keep historical YouTube uploads that were not repeated by the provider", () => {
  const archived = archivedYoutubeVideo();
  const merged = mergeRemoteRefresh([archived], [], [archived.folderId], new Set());
  assert.deepEqual(merged, [archived]);
  assert.equal(merged[0], archived);
});

test("catalog sweeps reuse unchanged rows and append new uploads without dropping saved details", () => {
  const archived = archivedYoutubeVideo();
  const withComments = { ...archived, remote: { ...archived.remote!, comments: [{ id: "comment-1", author: "Viewer", body: "Saved", kind: "comment" as const }] } } as LibraryVideo;
  const positions = new Map([[withComments.id, 0]]);
  const firstRows: LibraryVideo[] = [];
  const same = mergeRemoteCatalog([withComments], [archived], positions, firstRows);
  assert.equal(same[0].remote?.comments?.length, 1);
  assert.equal(firstRows[0], same[0]);
  const nextRows: LibraryVideo[] = [];
  const newer = { ...archived, id: "yt-new-upload", name: "New upload" };
  const merged = mergeRemoteCatalog(same, [newer], positions, nextRows);
  assert.equal(merged.length, 2);
  assert.equal(merged[0], same[0]);
  assert.equal(positions.get(newer.id), 1);
  assert.equal(nextRows[0], merged[1]);
});
