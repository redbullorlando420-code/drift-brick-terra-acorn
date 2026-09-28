import assert from "node:assert/strict";
import test from "node:test";
import { publicPlaylistEntries, publicPlaylistTitle, youtubePlaylistId } from "./youtube-playlist.ts";

test("playlist links keep their distinct IDs, including watch links", () => {
  assert.equal(youtubePlaylistId("https://www.youtube.com/playlist?list=PL1234567890abcd"), "PL1234567890abcd");
  assert.equal(youtubePlaylistId("https://www.youtube.com/watch?v=abcdef12345&list=PL1234567890abcd"), "PL1234567890abcd");
  assert.equal(youtubePlaylistId("https://example.com/playlist?list=PL1234567890abcd"), null);
});

test("public playlist renderers preserve order and remove repeated videos", () => {
  const root = { playlistHeaderRenderer: { title: { simpleText: "Road trip" } }, contents: [
    { playlistVideoRenderer: { videoId: "AAA", title: { runs: [{ text: "First" }] }, shortBylineText: { simpleText: "Alice" } } },
    { playlistVideoRenderer: { videoId: "BBB", title: { simpleText: "Second" }, shortBylineText: { simpleText: "Bob" } } },
    { playlistVideoRenderer: { videoId: "AAA", title: { simpleText: "Repeat" } } },
  ] };
  assert.equal(publicPlaylistTitle(root), "Road trip");
  assert.deepEqual(publicPlaylistEntries(root, 10).map((entry) => [entry.id, entry.title]), [["AAA", "First"], ["BBB", "Second"]]);
});

test("current YouTube playlist lockups provide titles, creators and artwork", () => {
  const root = { header: { pageHeaderRenderer: { pageTitle: "Road trip 2026" } }, contents: [
    { lockupViewModel: { contentId: "AAA", contentType: "LOCKUP_CONTENT_TYPE_VIDEO", contentImage: { thumbnailViewModel: { image: { sources: [{ url: "https://example.com/small.jpg" }, { url: "https://example.com/large.jpg" }] } } }, metadata: { lockupMetadataViewModel: { title: { content: "First track" }, metadata: { contentMetadataViewModel: { metadataRows: [{ metadataParts: [{ text: { content: "Alice" } }] }] } } } } } },
    { lockupViewModel: { contentId: "PLAYLIST", contentType: "LOCKUP_CONTENT_TYPE_PLAYLIST" } },
  ] };
  assert.equal(publicPlaylistTitle(root), "Road trip 2026");
  assert.deepEqual(publicPlaylistEntries(root, 10), [{ id: "AAA", title: "First track", channelName: "Alice", thumb: "https://example.com/large.jpg" }]);
});
