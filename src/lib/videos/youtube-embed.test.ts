import { test } from "node:test";
import assert from "node:assert/strict";
import { youtubeEmbedUrl } from "./youtube-embed.ts";
const id = "abcdefghijk";
test("watch, short and live URLs become playable embeds", () => {
  for (const source of [`https://youtube.com/watch?v=${id}`, `https://youtu.be/${id}`, `https://youtube.com/shorts/${id}`, `https://youtube.com/live/${id}`]) {
    assert.equal(new URL(youtubeEmbedUrl(source)!).pathname, `/embed/${id}`);
  }
});
test("damaged metadata falls back to a valid saved ID without crashing", () => {
  assert.ok(youtubeEmbedUrl("https://[", id));
  assert.equal(youtubeEmbedUrl("https://["), null);
  assert.equal(youtubeEmbedUrl(`https://example.com/watch?v=${id}`), null);
  assert.equal(youtubeEmbedUrl(""), null);
});
test("start time and inline controls are preserved", () => {
  const url = new URL(youtubeEmbedUrl(`https://youtube.com/embed/${id}?start=42`, undefined, "https://example.com")!);
  assert.equal(url.searchParams.get("start"), "42");
  assert.equal(url.searchParams.get("playsinline"), "1");
  assert.equal(url.searchParams.get("origin"), "https://example.com");
});
