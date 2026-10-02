# YouTube archive throughput — 2026-10-02

## Findings and changes

The recent HTTP transport applied the 1,500ms pull-job gap to every upstream YouTube page. Earlier archive paging used an 80ms gap. The client now sends a separate `youtubeRequestGapMs` preference to the server, defaulting to 80ms and configurable from 0 to 60,000ms. The global pull-job gap, entry caps, pause/playback gates, manual cooldown override, and serialized upstream transfers remain intact. Redundant sleeps inside channel and playlist continuation loops were removed so the transport applies pacing once.

Archive continuations no longer reread the same recent RSS feed or probe Shorts. First-page and routine recent-upload checks retain RSS. Resumed archive results preserve the recent upload identity and timestamp, and cannot poison the recent-feed cache with an empty feed.

The YouTube page displays both pacing values and the batch target. The saved preferences on this browser remain 100 sources × 200 entries (20,000 target entries), with a 100,000 YouTube entry cap and 32,297 remaining slots. The new YouTube page gap is 80ms; the existing job gap remains 1,500ms.

## Verification

- 49 script tests and 42 TypeScript catalog/control/entry-limit tests passed.
- Real server path with a deterministic public-provider fixture returned 3,000 distinct archive entries over six turns: responses of 510/510/510/510/510/450, 99 unique continuation tokens, one RSS read, no skipped pages, and retained recent-upload metadata.
- Real store with mocked network/disk admitted 3,000 new entries into a 70,000-entry library in six bounded creator commits, preserving all six continuation cursors. The measured test run took 5,352ms, including cooperative preparation/commit yields; this is not a live network throughput measurement.
- Deterministic transport tests cover 0ms, 80ms, and 1,500ms pacing without an additional hidden wait, serial body transfers, timeouts, manual overrides, and provider cooldowns.
- Type checking and production build passed.
- Development and production browser audits passed on desktop and 390 × 844 mobile with visible content, no page/console errors, no horizontal overflow, and no production divergence.
- Interactive saved-library Settings verification accepted 0ms without changing the 1,500ms job gap, then restored the new default of 80ms. Mobile Settings rendered without overflow. Desktop viewport reset after testing.
- Real YouTube page displayed the separate 80ms archive gap, 20,000-entry batch target, available Force pull button, 67,703 distinct IDs, and zero duplicate cached rows. Browser error log was empty.

## Live provider limitation

The previous direct HTTP request path, using the same headers and without the new transport/cooldown, still received Google's unusual-traffic HTTP 429 page for the channel Videos URL. RSS returned HTTP 404. These responses are recorded in `youtube-speed-legacy-http.txt`. Live bulk growth remains unverified; the fixture verifies the restored application path, not Google's availability.

Evidence: `youtube-speed-tests.txt`, `youtube-speed-catalog-tests.txt`, `youtube-speed-typecheck.txt`, `youtube-speed-build.txt`, `youtube-speed-dev.json`, `youtube-speed-production.json`, `youtube-speed-desktop.png`, and `youtube-speed-settings-{desktop,mobile}.png`.
