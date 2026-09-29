import assert from "node:assert/strict";
import { test } from "node:test";
import {
  beginYoutubeFirstClick,
  getYoutubeFirstClickTrace,
  markYoutubeArtworkReady,
  markYoutubeProviderFinish,
  markYoutubeProviderStart,
  markYoutubeRailReady,
  markYoutubeSelectorReady,
} from "./youtube-first-click-trace.ts";

test("cached first click records selector, text-first rail and later artwork separately", () => {
  beginYoutubeFirstClick(false, 100);
  markYoutubeSelectorReady(107, 8, 134);
  assert.equal(markYoutubeRailReady(4, 160), true);
  markYoutubeArtworkReady(true, 245);
  assert.deepEqual(getYoutubeFirstClickTrace(), {
    startedAt: 100, selectorMs: 8, selectorReadyMs: 34, catalogRows: 107,
    railReadyMs: 60, railCards: 4, artworkWaitMs: 85,
    artwork: "loaded", provider: "idle", providerOverlapMs: 0,
  });
});

test("provider work is reported only for the part overlapping the route open", () => {
  beginYoutubeFirstClick(false, 100);
  markYoutubeProviderStart(115);
  markYoutubeRailReady(3, 150);
  markYoutubeProviderFinish(260);
  assert.equal(getYoutubeFirstClickTrace()?.providerOverlapMs, 35);
  assert.equal(getYoutubeFirstClickTrace()?.provider, "finished");
});

test("empty rails stay pending and a new click resets the trace", () => {
  beginYoutubeFirstClick(true, 100);
  markYoutubeSelectorReady(0, 2, 108);
  assert.equal(markYoutubeRailReady(0, 110), false);
  markYoutubeProviderFinish(125);
  assert.equal(getYoutubeFirstClickTrace()?.railReadyMs, undefined);
  beginYoutubeFirstClick(false, 200);
  assert.equal(getYoutubeFirstClickTrace()?.catalogRows, undefined);
});
