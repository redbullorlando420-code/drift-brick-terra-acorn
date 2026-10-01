import { test } from "node:test";
import assert from "node:assert/strict";
import { youtubeLivePage } from "./youtube-live.ts";
const channel = "UCtest";
const page = (response: unknown) => `<script>var ytInitialPlayerResponse = ${JSON.stringify(response)};</script>`;
test("live detection is independent of field order and description length", () => {
  assert.deepEqual(youtubeLivePage(page({ videoDetails: { videoId: "abcdefghijk", channelId: channel, title: "live", shortDescription: 'x'.repeat(20_000), viewCount: "432" }, microformat: { playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow: true } } } }), channel), { id: "abcdefghijk", title: "live", viewers: 432 });
});
test("upcoming, recorded and unrelated broadcasts cannot become current live cards", () => {
  for (const isLiveNow of [false, undefined]) assert.equal(youtubeLivePage(page({ videoDetails: { videoId: "abcdefghijk", isLiveContent: true }, microformat: { playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow } } } }), channel), null);
  assert.equal(youtubeLivePage(page({ videoDetails: { videoId: "abcdefghijk", channelId: "different" }, microformat: { playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow: true } } } }), channel), null);
});
test("unreadable/blocked live responses report failure instead of marking a creator offline", () => {
  assert.throws(() => youtubeLivePage("consent page", channel));
  assert.throws(() => youtubeLivePage(page({ playabilityStatus: { status: "LOGIN_REQUIRED" } }), channel));
});
test("channel live badges belong to a specific current renderer", () => {
  const renderer = { videoId: "abcdefghijk", title: { runs: [{ text: "current broadcast" }] }, thumbnailOverlays: [{ thumbnailOverlayTimeStatusRenderer: { style: "LIVE" } }] };
  const html = `<script>var ytInitialData = ${JSON.stringify({ contents: { videoRenderer: renderer } })};</script>`;
  assert.equal(youtubeLivePage(html, channel)?.id, renderer.videoId);
});
test("modern channel lockups distinguish current live and scheduled thumbnails", () => {
  const live = { contentId: "abcdefghijk", metadata: { lockupMetadataViewModel: { title: { content: "on air" } } }, contentImage: { thumbnailViewModel: { overlays: [{ thumbnailBottomOverlayViewModel: { badges: [{ thumbnailBadgeViewModel: { badgeStyle: "THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE" } }] } }] } } };
  const html = `<script>var ytInitialData = ${JSON.stringify({ contents: { lockupViewModel: live } })};</script>`;
  assert.equal(youtubeLivePage(html, channel)?.title, "on air");
  assert.equal(youtubeLivePage(html.replace("THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE", "THUMBNAIL_OVERLAY_BADGE_STYLE_DEFAULT"), channel), null);
});
