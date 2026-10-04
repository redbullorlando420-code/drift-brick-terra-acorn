# Navigation transition budget — verified October 3, 2026

The saved plan now shows **171 / 200 complete**, with **29 outstanding**. Revision 10 promotes only `smooth-01` once; later manual status changes remain saved.

## Implementation

- Navigation controls use the live library immediately. Catalog subscribers share a stable browse snapshot until a destination shell has painted. Home and tools can interrupt a pending catalog immediately.
- Keep one latest destination reference rather than a queue or copied catalogs. Cancel obsolete frames and preparation on a new route, changed catalog inputs, viewer opening, or final subscriber removal.
- YouTube selection preserves privacy, hidden/unavailable filtering, full entry counts, and stable date ordering. Filter, merge sort, demo exclusion, and creator indexing yield with a four-millisecond target. Prepared immutable caches eliminate the cold filter/sort/index from the mounted page's synchronous selectors.
- Preparation pauses on hidden-tab visibility without polling. Cancellation removes its visibility listener. The existing search-ranking formula now uses the same stable cooperative sort, with its prior slice settings unchanged.
- First-click diagnostics distinguish preparation elapsed time/yields from the mounted selector lookup. Channel names and video IDs are not retained in that trace.

## Checks

- **333 relevant tests passed:** 284 library/media unit tests and 49 pull, storage, coverage, and relay integration checks. Regression coverage includes million-entry navigation, 100 rapid source changes, 10,000 pending updates, stale callback rejection, preparation cancellation/restart, viewer deferral, hidden sleep/resume, unmount cleanup, privacy boundaries, stable sorting, unchanged creator mixes, and mission migration.
- `npm run typecheck` passed.
- `npm run build` passed. The first sandboxed build encountered a generated dependency-folder permission error; the approved build outside the sandbox completed successfully.
- Development and production desktop (1280 × 800) and mobile (390 × 844) smoke checks passed: visible content, no horizontal overflow, no page/console errors, no branding/auth warnings, and no production divergence. All four rendered screenshots were inspected.
- CRLF-aware source diff check passed.

## Browser interactions

Populated development origin: **172,070 entries**, including **99,999 YouTube** and **41,085 Twitch** entries.

- Desktop and mobile YouTube navigation visibly rendered the destination loading shell first, then the correct catalog. Rapid Twitch → Landing → Settings switches ended on Settings without stale provider shelves.
- Opened a prepared YouTube card, verified its selected preview, entered the provider player, and returned to the YouTube library. Tested mobile search dismissal with Escape and immediate Home navigation while a broad search was pending.
- The final clean browser session reported no console errors and displayed the migrated 171 / 200 plan.
- Compiled production source selection, Twitch → Home interruption, and mobile menu selection/closing passed. The separate production origin had an empty catalog; it was not seeded with the populated profile. Mobile content width equaled viewport content width (375 pixels).
- The populated profile's pull pause remained enabled. No force-pull or catalog-cap changes were made.

One populated cold-load diagnostic recorded **680 ms preparation elapsed across 215 yields**, followed by a **0 ms rounded cached selector lookup**. Selector-ready elapsed was 1,760 ms. An earlier observation before cooperative preparation recorded 168 ms of synchronous selector work. These are local samples under changing runtime load, not a controlled claim of lower total page-load time.

## Scale benchmark and limits

`navigation-benchmark.json` exercises five rapid routes using production catalog selection, browse preparation, and creator mixing:

| Entries | Synchronous route burst before staging | Staged navigation event stack | Preparations published |
| --- | ---: | ---: | ---: |
| 100,000 | 1,080.21 ms | 0.10 ms | 1 instead of 5 |
| 1,000,000 | 9,342.13 ms | 0.04 ms | 1 instead of 5 |

The staged path read **zero catalog metadata before the simulated paint boundary** and preserved 48 mixed picks. Preparation yielded 195 times at 100,000 entries and 2,276 times at one million. Largest observed preparation slices were 4.76 ms and 38.76 ms respectively; runtime allocation/garbage collection can exceed the cooperative target. Getter instrumentation makes this synthetic workload slower than ordinary record reads. It is not a browser input-latency or whole-application heap benchmark.

Broader render invalidation, expensive optional shelves, slow-device/browser profiling, and a real long-idle memory/provider soak remain open. This milestone does not certify the whole app for a million-entry idle session or prove external provider availability.

Artifacts: `navigation-milestone-desktop.png`, `navigation-youtube-mobile.png`, `navigation-production-youtube-mobile.png`, `navigation-dev.json`, `navigation-production.json`, `navigation-benchmark.json`, and the build/type/test logs with the same prefix.
