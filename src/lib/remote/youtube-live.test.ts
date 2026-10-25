import { test } from "node:test";
import assert from "node:assert/strict";
import { youtubeLivePage, youtubeLiveData, youtubeConcurrentViewers } from "./youtube-live.ts";
const channel = "UCtest";
const page = (response: unknown) => `<script>var ytInitialPlayerResponse = ${JSON.stringify(response)};</script>`;
test("live detection is independent of field order and description length", () => {
  assert.deepEqual(youtubeLivePage(page({ videoDetails: { videoId: "abcdefghijk", channelId: channel, title: "live", shortDescription: 'x'.repeat(20_000), viewCount: "432" }, microformat: { playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow: true } } } }), channel), { id: "abcdefghijk", title: "live", viewers: undefined });
});

test('concurrent audiences parse exact and compact counts without accepting total views or waiting rooms', () => {
  for (const [text, expected] of [['1,234 watching now', 1234], ['1.2K watching', 1200], ['2M viewers', 2000000], ['0 watching', 0], ['2\u202f345 watching', 2345]]) assert.equal(youtubeConcurrentViewers(text), expected);
  for (const text of ['45,000 views', '1.2K waiting', '1.5 watching', 'viewers hidden', '-3 watching', '1K watching · starts in 3 hours']) assert.equal(youtubeConcurrentViewers(text), undefined);
});

test('classic live cards, modern lockups and primary watch info expose their own concurrent count', () => {
  const renderer = { videoId: 'abcdefghijk', title: { simpleText: 'Live' }, viewCountText: { runs: [{ text: '3,456 watching' }] } };
  assert.equal(youtubeLiveData({ contents: { videoRenderer: renderer } }, channel)[0].viewers, 3456);
  assert.deepEqual(youtubeLiveData({ contents: { videoRenderer: { ...renderer, upcomingEventData: {} } } }, channel), []);
  const lockup = { contentId: '12345678901', metadata: { lockupMetadataViewModel: { title: { content: 'Live' }, metadata: { contentMetadataViewModel: { metadataRows: [{ metadataParts: [{ text: { content: '7.5K watching' } }] }] } } } } };
  assert.equal(youtubeLiveData({ contents: { lockupViewModel: lockup } }, channel)[0].viewers, 7500);
  const player = page({ videoDetails: { videoId: 'abcdefghijk', channelId: channel, viewCount: '99999999' }, microformat: { playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow: true } } } });
  const initial = { contents: { twoColumnWatchNextResults: { results: { results: { contents: [{ videoPrimaryInfoRenderer: { viewCount: { videoViewCountRenderer: { viewCount: { simpleText: '876 watching now' } } } } }] } } }, secondaryResults: { videoRenderer: { viewCountText: { simpleText: '99999 watching' } } } } };
  assert.equal(youtubeLivePage(player + '<script>var ytInitialData = ' + JSON.stringify(initial) + ';</script>', channel)?.viewers, 876);
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
