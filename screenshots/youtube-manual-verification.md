# YouTube manual pull verification — 2026-10-02

The main YouTube page now offers **Force pull now** during an app cooldown. The waiting time is a recommendation. Manual archive and empty-source pulls send an explicit override through the store, RPC, channel/playlist parsing, and HTTP queue. The override applies to previously recorded cooldowns only; a fresh archive/network rate limit stops the operation. Automatic jobs remain cooled and cannot acquire that override.

Healthy retries continue the creator batch and clear obsolete cooldown checkpoints, including old provider deadlines retained on untouched creators. Entry caps, deduplication, whole-page archive cursors, pause controls, and request pacing remain enforced.

## Verification

- 46 script tests passed, including real store and server paths with deterministic provider fixtures.
- 33 catalog, live, sweep, and scheduler tests passed.
- Type checking and production build passed.
- Development and production browser audits passed on desktop and 390 × 844 mobile: visible content, no page/console errors, no horizontal overflow, no production divergence.
- Real saved-library UI: clicked **Force pull now** before the old recommended deadline of 12:50:22 AM. The operation started at 12:48 AM and recorded a fresh Google HTTP 429 unusual-traffic response, with a new recommendation of 1:03:35 AM. One of 100 targets was checked, zero videos returned/added, and the button became available again. The existing 67,703 distinct YouTube IDs remained intact, with zero duplicate rows.
- Real YouTube page verified on mobile; force button enabled and no horizontal overflow. Browser console contained no captured errors. Desktop viewport override reset after testing.

Live archive growth remains unverified because Google rejected this fresh request. Fixture tests confirmed healthy forced channel and playlist requests return new videos and continue older public pages.

Evidence: `youtube-manual-tests.txt`, `youtube-manual-catalog-tests.txt`, `youtube-manual-typecheck.txt`, `youtube-manual-build.txt`, `youtube-manual-dev.json`, `youtube-manual-production.json`, `youtube-manual-desktop.png`, and `youtube-manual-mobile.png`.
