import assert from "node:assert/strict";
import test from "node:test";

import { extractRedditMedia } from "./adult-reddit-media.ts";

test("keeps a Redgifs Reddit post and supplies direct poster fallbacks", () => {
  const media = extractRedditMedia(
    "",
    '<a href="https://www.redgifs.com/watch/SunnyExample">watch</a>',
  );

  assert.equal(media.kind, "video");
  assert.equal(media.watch, "https://www.redgifs.com/watch/SunnyExample");
  assert.deepEqual(media.thumbFallbacks, [
    "https://thumbs2.redgifs.com/SunnyExample-mobile.jpg",
    "https://thumbs2.redgifs.com/SunnyExample-poster.jpg",
  ]);
});
