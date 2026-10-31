# Recommendation work and Save Data

Revision 65, 2026-10-28. Implements next-015 and next-019 inside the existing library. No new service, authentication, provider polling or model download is introduced.

## Recommendation preparation

Before this change, the YouTube effect created a worker immediately for each accepted input revision, then deferred packing. Twitch began its feedback scan immediately. Both already had cancellation and cooperative work, but cancelling after allocation still discarded worker/scan starts during a burst of changes.

`src/lib/ranking-budget.ts` adds an 80 ms settling window **before** worker creation and feedback reads. Effect cleanup cancels a waiting revision immediately, or disposes its running owner and aborts its traversal. YouTube still ranks inside its disposable worker; Twitch retains its existing cooperative scoring and stable sorting. Filters/catalog changes continue to hide incompatible shelves, while feedback refreshes can keep a bounded previously painted shelf visible.

Instrumented preparation yields after 256 rows or a 3 ms target, whichever happens first. A single expensive row, structured clone, sort, garbage collection or browser suspension may exceed the target. This is a cooperative target, not a hard real-time promise. Existing Twitch sorting has its own yielding. No catalog-wide timing graph is retained.

Settings → Enable diagnostics → Performance scorecard shows active/settling passes, obsolete starts avoided, and the most recent samples. Export measurements includes at most 32 scalar samples: fixed provider kind, outcome, row/slice counts, preparation CPU, slowest slice and elapsed time. Timings exclude uninstrumented sorting/scoring; elapsed time includes waiting and worker replies. No IDs, titles, candidates or feedback are recorded in these samples. Refresh is explicit.

Evidence: a 30-revision burst starts only the final job. An interrupted 100k-row traversal stops before 512 rows in the controlled cancellation test. A separate 100k Twitch fixture compares the complete ranked output against the same score function and stable comparator, including exact original object references. The browser probe uses the actual slice implementation for a controlled 100k-row preparation workload and accepts a real click while it runs. Its declared responsiveness gate is a worst 16 ms heartbeat gap below 100 ms on the available desktop Chromium environment; it does not measure physical-phone latency or full-library heap use. Production results were 21.5 ms desktop / 18.0 ms mobile-emulation heartbeat gaps. There is no claimed percentage speedup in provider pulling.

## Save Data

Settings → Save Data and transfers offers **Follow device** and **Save Data**. The manual choice persists under `reelcase.data-saver.v1`; a failed preference write still applies for the current page session. Device Save Data also activates the policy and cannot be overridden by choosing Follow device. Shared storage/connection listeners update admission without polling.

When active:

- Nearby, low-priority artwork stays queued. Revocable low-priority DOM image leases withdraw immediately. Visible, high-priority artwork continues and can promote/resume naturally. Owners can still cancel queued work when cards leave the window.
- Nearby Companion artwork recall waits for visible demand. Already started requests may finish.
- Speculative preview/player module warming and adjacent desk module warming wait. A deliberate preview/player open still calls its normal loader.

Manual provider pulls, chosen playback, room clocks, room commands, metadata persistence and explicit native operations keep their existing paths. Save Data does not authorize or start an AI model download. It is not a network kill switch and does not promise to reduce every transfer. Disabling it resumes mounted low-priority artwork through the existing admission pump; it does not need a repeating retry timer.

## Transfer accounting and its limits

One reference-counted Resource Timing observer accumulates five fixed counters for the current page session. It neither wraps fetch nor stores timing entries, resource URLs or query strings. It observes buffered entries on its first lifetime only, disconnects when its last owner unmounts, and releases on HMR. The browser's own resource timing buffer is not enlarged.

Categories: app metadata (`/_serverFn/` browser responses), images, loopback Companion browser requests, embedded player documents and direct audio/video resources. Other scripts/assets and arbitrary model fetches are not relabeled as metadata. Exposed `transferSize` includes browser-reported headers; a zero value is accepted as measured only when an exposed encoded body size distinguishes it from hidden/ambiguous timing. Hidden cross-origin sizes and cancelled/ambiguous zero-size records are unmeasured.

Embedded-player internals, media internals, upstream provider requests made by the server, native Companion downloads and room data channels are **not measured by this observer**. They can consume bytes without an entry here. No observed entry does not mean no traffic. Cache behavior and exposed sizes differ by browser; the summary does not estimate bytes saved. It refreshes only on request and resets on full page reload. Counters are not exported with private resource names.

## Repeatable checks

Run from the project directory:

```text
node --test --test-concurrency=2 scripts/ranking-data-budget.test.mjs scripts/youtube-ranking.test.mjs scripts/ranking-feedback.test.mjs scripts/twitch-movies-upgrade.test.mjs
node --experimental-strip-types --test src/lib/videos/image-load-budget.test.ts src/lib/warm-route-cache.test.ts src/lib/remote/youtube-ranking-demand.test.ts src/lib/remote/youtube-ranking-protocol.test.ts
node .grok/room-workflow-regressions.mjs
npm run typecheck
npm run build
node scripts/ranking-data-browser-check.mjs http://127.0.0.1:8080/ screenshots/ranking-data-dev.json
node scripts/mission100-browser-check.mjs http://127.0.0.1:8080/ screenshots/ranking-data-mission-dev.json
```

The browser check uses an isolated ephemeral profile with 1,200 synthetic Twitch records and controlled metadata/artwork responses. It does not alter the real library or use account cookies. Repeat against the built-output QA server and run the existing Home smoke check with the development verdict as baseline. Browser reports contain device-emulation limits explicitly.
