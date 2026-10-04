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
  markYoutubePreparationReady,
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

test('cooperative preparation timing belongs only to the current navigation', () => {
  beginYoutubeFirstClick(false, 500);
  markYoutubePreparationReady(499, 150, 20);
  assert.equal(getYoutubeFirstClickTrace()?.preparationMs, undefined);
  markYoutubePreparationReady(500, 125.4, 38);
  assert.equal(getYoutubeFirstClickTrace()?.preparationMs, 125);
  assert.equal(getYoutubeFirstClickTrace()?.preparationYields, 38);
  markYoutubePreparationReady(500, 900, 100);
  assert.equal(getYoutubeFirstClickTrace()?.preparationMs, 125);
  beginYoutubeFirstClick(false, 700);
  assert.equal(getYoutubeFirstClickTrace()?.preparationMs, undefined);
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

test('an empty startup selection cannot freeze the trace before the saved catalog arrives', () => {
  beginYoutubeFirstClick(false, 100);
  markYoutubeSelectorReady(0, 0, 105);
  assert.equal(getYoutubeFirstClickTrace()?.selectorReadyMs, undefined);
  markYoutubeSelectorReady(99_999, 12, 400);
  assert.equal(getYoutubeFirstClickTrace()?.catalogRows, 99_999);
  assert.equal(getYoutubeFirstClickTrace()?.selectorReadyMs, 300);
  markYoutubeSelectorReady(100_000, 20, 500);
  assert.equal(getYoutubeFirstClickTrace()?.catalogRows, 99_999);
});
