import assert from "node:assert/strict";
import test from "node:test";

import { extractRedditMedia, shouldKeepRedditEntry } from "./adult-reddit-media.ts";

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
    "https://thumbs2.redgifs.com/SunnyExample-thumb.jpg",
    "https://thumbs1.redgifs.com/SunnyExample-mobile.jpg",
    "https://thumbs1.redgifs.com/SunnyExample-poster.jpg",
  ]);
});

test("rebuilds a Redgifs watch page from a poster-only Atom reference", () => {
  const media = extractRedditMedia(
    "",
    '<img src="https://thumbs2.redgifs.com/PosterOnlyExample-mobile.jpg" />',
  );

  assert.equal(media.kind, "image");
  assert.equal(media.watch, "https://www.redgifs.com/watch/PosterOnlyExample");
  assert.equal(media.poster, "https://thumbs2.redgifs.com/PosterOnlyExample-mobile.jpg");
  assert.equal(media.thumbFallbacks?.at(-1), "https://thumbs1.redgifs.com/PosterOnlyExample-poster.jpg");
});

import { isRemovedRedditVideo, isRedditRemovalText } from './reddit-removed.ts';
import type { LibraryVideo } from './types';
test('removed Reddit entries are rejected even when a cached image remains', () => {
  const media = extractRedditMedia('<img src="https://i.redd.it/cached.jpg"/>', '');
  assert.equal(shouldKeepRedditEntry(media, '[ Removed by Reddit ]'), false);
  const notice = 'This post was removed because it violated Reddit Rule 8 on automated accounts.';
  assert.equal(shouldKeepRedditEntry(extractRedditMedia('<img src="https://i.redd.it/cached.jpg"/>', notice), 'Old title'), false);
  assert.equal(shouldKeepRedditEntry(extractRedditMedia('<img src="https://i.redd.it/removed.svg"/>', ''), 'Old title'), false);
  const video = { name: '[ Removed by Reddit ]', remote: { kind: 'reddit' }, src: 'https://i.redd.it/cached.jpg' } as LibraryVideo;
  assert.equal(isRemovedRedditVideo(video), true);
  assert.equal(isRemovedRedditVideo({ ...video, name: 'Ordinary title', src: 'https://i.redd.it/removed.svg' }), true);
  assert.equal(isRemovedRedditVideo({ ...video, name: 'Removed items in my collection', src: 'https://i.redd.it/normal.jpg' }), false);
  assert.equal(isRemovedRedditVideo({ ...video, remote: { kind: 'youtube' } }), false);
  assert.equal(isRedditRemovalText('A discussion about removed posts'), false);
});
