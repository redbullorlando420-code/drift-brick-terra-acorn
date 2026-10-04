# Timer consolidation — October 3, 2026

Completed `smooth-09`. The populated Mission plan now shows **170 / 200 complete**, with 30 remaining. Revision 9 promotes this verified milestone once and preserves later manual choices. Other audits and soak milestones remain open.

## Delivered

- Recurring provider pulls, network presence, clocks, discovery, diagnostics, photo status/slideshows, preview/player records, room discovery, initial room synchronization, playback clocks, and transport health share one periodic scheduler per page.
- Cosmetic jobs sleep when hidden or idle. YouTube archives/recent feeds keep their existing visible-idle policy; active room synchronization keeps its background policy. Page teardown stops all shared work.
- One callback runs per task turn. Async jobs cannot overlap themselves, missed ticks never accumulate, and canceled owners release their registrations/listeners and abort supported status requests.
- Pull availability changes include the final viewer gate transition. Automatic pulls resume after a viewer closes without waiting for unrelated polling. Manual pulls, saved pause settings, request pacing, entry caps, and fair provider selection remain in force.
- Adult automatic pulling clears its busy state when entry-count preparation fails and rechecks activity before starting a prepared pull.
- One activity deadline replaces a 30-second interval. Input bursts do not recreate timers; hidden and idle sessions have no activity polling.
- Landing discovery reads at most 2,400 records across the full catalog, retains at most 12 picks, changes sampling offsets with each shuffle, and stops rotation/queued computation while covered or inactive. It no longer allocates a filtered catalog-sized array.
- Watch Room discovery rotation runs only in an active, paused room. Setup screens and playback do not periodically rerank candidate/queue rails.
- Opt-in Settings diagnostics show task ownership, running/paused jobs, and the shared timer count. Transport retry deadlines, network timeouts, input debounces, and persistence deadlines stay with their owners and are not included in that count.

## Verification

- **312 relevant tests pass:** 263 library tests, 31 media/pull integration tests, and 18 provider/relay tests. This includes the real automatic Adult hook recovering a failed entry count and a pull gate test reproducing viewer-close ordering.
- Production build and TypeScript check pass. Logs: `timer-build.txt`, `timer-typecheck.txt`, `timer-library-tests.txt`, `timer-media-tests.txt`, `timer-provider-tests.txt`.
- Development and production browser smoke passes cover 1280×800 desktop and 390×844 mobile: visible content, no uncaught console/page errors, no horizontal overflow, no brand/auth warnings, and no production baseline divergence.
- All four smoke screenshots were visually inspected. Verdicts: `timer-dev.json` and `timer-production.json`.
- Populated Chrome check used **172,070 saved entries**, including **99,999 YouTube** and **41,085 Twitch** entries. Desktop Landing retained 12 picks; manual shuffle visibly changed titles. Mobile Landing rendered usable controls/cards without horizontal overflow. The user's saved pull pause was retained.
- Settings showed three recurring tasks on the populated desktop page sharing one timer, including a paused provider task. The first render can precede registration of the diagnostics task; the next update shows current ownership.
- Mission plan showed 170/200 complete and a 30-item active queue. Screenshot: `timer-milestone-desktop.png`. Mobile discovery: `timer-landing-mobile.png`.
- A private production room in the separate, empty QA origin registered successfully. Its controlled guest received host play, +15-second seek, pause, and initial state; a regular-tab mobile guest requested resync and received the host-confirmed 0:15 timeline. Host and guest leave controls returned to setup, with clean error logs. Screenshot: `timer-room-mobile.png`.

## Discovery CPU benchmark

`node --experimental-strip-types scripts/discovery-benchmark.mjs` compares the prior full-filter/stride computation with bounded sampling, excluding rendering and network work. Warm medians in `timer-discovery-benchmark.json`:

| Catalog | Prior computation | Bounded computation | Records read by bounded computation |
| --- | ---: | ---: | ---: |
| 100,000 | 5.69 ms | 2.10 ms | 2,400 |
| 1,000,000 | 54.36 ms | 4.22 ms | 2,400 |

These are local CPU measurements for one discovery operation, not whole-app latency guarantees.

## Limits and remaining work

- No long-idle browser heap/OOM soak or slow-device memory test was completed. Those milestones remain open.
- The controlled room verified the same-origin local-tab relay. WebRTC peer status remained connecting, so this is not proof of a direct or TURN connection between physical devices, nor a real media drift measurement.
- Live provider archive soak was not performed and no pulls were forced on the user's populated library. Provider policy and entry limits were verified with deterministic integration boundaries.
- Large-library navigation transitions, broader render invalidation, idle enrichment, and release performance budgets remain in the active plan.
