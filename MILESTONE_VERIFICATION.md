# Twitch content type milestone — 25 October 2026

Revision 32 completes **next-039 — Twitch content type precision**. The default plan is **209/306 complete**: seven next-level milestones are verified, 93 next-level briefs remain planned, and four older external verification milestones remain open. Revision-31 plans promote only next-039; unrelated manual/custom states and later reopens remain preserved.

Twitch archive pages now retain the queried ARCHIVE, HIGHLIGHT or UPLOAD shelf alongside the canonical video ID and original observation time. Clip reads retain CLIPS evidence. Classification validates that compact evidence against the saved identity; short broadcasts and long clips are no longer guessed from duration or titles. Explicit legacy clip markers remain supported, including older clips with VOD-style IDs. Uncertain legacy videos display Unknown video subtype, and offline channel placeholders remain channel bookmarks.

Matching subtype evidence survives sparse responses and durable catalog reloads. Older observations cannot replace newer matching evidence; a new exact subtype observation can update an unknown item without losing favorites, history, likes or manual tags. Admission and comparison use the existing catalog paths, with no bulk reclassification, extra provider requests or storage migration.

The Full Twitch catalog adds past broadcast, highlight, upload, clip, live and unknown filters composed with existing saved/topic selection. Archive search supports the same exact types. Cards and previews show the type; previews explain the source shelf and observation time. An explicit cooperative CSV report exports the selected rows with canonical identity, type, source, observation time and watch link, with spreadsheet formula escaping. Opening/filtering adds no polling or storage writes; provider page and concurrency limits are unchanged.

## Verification for revision 32

- Final production build and type checks passed.
- Complete regression suite: **1,370 passed, 0 failures** — 771 script tests with two workers plus all 599 TypeScript tests from the package test command. The existing large-library regressions remain included. Three legacy clip compatibility failures found during verification were corrected in runtime identity handling, without weakening their existing tests.
- Seven new adapter/merge/report cases cover the three archive shelves, explicit clip evidence, short broadcasts, long clips, malformed and mismatched evidence, immutable provider edges, bounded page walks, sparse/newer observation rules, filter composition, archive search, ranking and CSV output. A real-store case verifies proof upgrades and persistence while preserving personal signals.
- Development and final production browser acceptance passed on isolated desktop and 390px mobile Chrome profiles. Actual creator action, provider adapter, UI, store and IndexedDB exercised shelf classification, all type filters, favorites intersection, preview evidence, selected-row CSV download, archive search and reload persistence. No extra provider reads during inspection, console errors or horizontal overflow occurred; screenshots inspected.
- Production milestone migration/copy/export/filter/reload checks passed with seven verified defaults and preserved custom/manual states. Desktop/mobile Home smoke passed with a non-diverging production baseline.

Evidence: screenshots/twitch-types-{dev,built}-ui.json, screenshots/twitch-types-plan.json and screenshots/twitch-types-{dev,built}.json. Controlled public Twitch payloads and isolated browser storage were used; the real user’s library was not seeded or reset. Real-provider scale/soak and physical-device playback remain open, and no external integration is newly claimed connected.

Changed entry points: src/lib/videos/twitch-content.ts, types.ts, twitch-clips.ts, remote-merge.ts, twitch-saved-catalog.ts, twitch-archive-search.ts, src/lib/remote/twitch-archive-walk.ts, api.ts, src/components/library/twitch-content-controls.tsx, use-twitch-saved-catalog.ts, twitch-archive-search.tsx, library-app.tsx, video-card.tsx, pre-video.tsx, and the versioned mission defaults/tests/export.

---
# Twitch clip freshness milestone — 24 October 2026

Revision 31 completes **next-032 — Clip observation freshness audit**. The default plan is **208/306 complete**: six next-level milestones are verified, 94 next-level briefs remain planned, and four older external verification milestones remain open. Revision-30 plans promote only next-032; unrelated manual/custom states and later reopens remain preserved.

**Twitch → Inspect clip coverage** now shows separate recent/older last-attempt and last-successful-check clocks. Attempts record the local action start. Successful clocks and clip metadata retain the original bounded provider read time, including warm deliveries; partial errors do not claim a successful full check. Legacy missing clocks remain explicitly unrecorded. Existing reload/backup checkpoint fields preserve both clocks without a second telemetry ledger.

The new **Check fresh recent clips** action skips only the exact creator/mode/count/cursor cache entry through the existing clip workflow. Other creator, count, older, VOD and live cache entries remain warm. It respects the existing retry wait and page limits. A fresh read waits for an older request on that key, concurrent fresh callers share work, ordinary callers join the pending fresh read, and the final cache contains the fresh result. Zero-clip requests cannot be counted as clip checks. No background polling or automatic cache invalidation was added.

All catalog admission paths now keep a fresher Twitch clip when a cached or held older observation arrives, preserving title, views, publication date, duration, poster and card identity. Unknown legacy observations cannot replace known newer evidence; a genuinely newer provider count can still change naturally. Follow commits preserve newer clip failures, independent retry deadlines, successful clocks and safe older positions. Unrelated copied live/archive responses retain current clip health while keeping their own response counts. Identical/stale-only focused clip responses skip the remote catalog write.

## Verification for revision 31

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,361 passed, 0 failures** — 763 script tests with two workers plus all 598 TypeScript tests from the package test command. This includes the existing 80k/215k-library cases.
- Seven new audit cases cover warm attempt/success clocks, cached/held result health, separate retry scopes, copied follow state, all five catalog admission paths, actual API cache-key isolation, input validation, pending-read ordering, fresh caller coalescing and final warm-cache contents.
- Two actual-store cases verify cached retries leave successful clocks unchanged, unchanged clip arrays avoid catalog writes, a fresh action cannot bypass a retry, accepted fresh metrics reach disk, and a held older result preserves newer metrics/health plus saved personal signals.
- Development and production desktop/mobile browser acceptance passed in isolated Chrome profiles. Actual UI, clip API, store and durable follows were exercised with controlled public Twitch payloads: inspection performs no provider read/follow write; fresh actions contact the selected creator; ordinary retries reuse the cache; separate clocks, retry waits and evidence survive reload. No console errors or horizontal overflow occurred; screenshots inspected.
- Production 25-creator batch/Stop regression passed on both viewports, preserving partial results, rotation and older cursor continuation. Production milestone migration/copy/export/filter/reload checks passed with six verified next-level defaults and preserved custom/manual work. Home smoke checks passed with a non-diverging production baseline.

Evidence: screenshots/clip-freshness-{dev,built}-ui.json, screenshots/clip-freshness-batch-regression.json, screenshots/clip-freshness-plan.json and screenshots/clip-freshness-{dev,built}.json. Browser profiles and provider payloads were isolated; the real user’s library was not seeded or reset. No real-provider scale/soak or physical-device playback is claimed complete. The local development app remains running after the temporary production QA server was stopped.

Changed entry points: src/lib/videos/twitch-clip-freshness.ts, remote-merge.ts, store.ts, src/lib/remote/api.ts, provider-metadata-cache.ts, src/components/library/twitch-clips-control.tsx, twitch-clip-coverage-panel.tsx, and the versioned mission defaults/tests/export.

---

# Twitch clip coverage milestone — 24 October 2026

Revision 30 completes **next-031 — Clip coverage evidence panel**. The default plan is **207/306 complete**: five next-level milestones are verified, 95 next-level briefs remain planned, and four older external verification milestones remain open. Revision-29 plans promote only next-031; earlier/later manual reopens, unrelated statuses and custom entries are preserved.

In **Twitch → Keep clips fresh → Inspect clip coverage**, each saved creator snapshot shows the requested unique target, accepted clips, raw listings, overlapping duplicates and page attempts. Up to four public shelves show their allocation, results, failure and stop reason. Sparse/exhausted shelves, a filled quota, page-budget stops, partial errors and provider waits are distinct. A one-page allowance with unvisited shelves cannot falsely claim exhaustion. Older snapshots retain unknown targets/reasons instead of guessing. Public highlight rankings are not presented as an exhaustive Twitch archive.

Fresh provider results and warm deliveries are labeled separately. A cache hit preserves the original provider observation and successful clip clock; its response delivery time is separate. Normalization whitelists the compact snapshot, bounds errors to 240 characters, accepts legacy data and rejects malformed/oversized shelf collections. Reload and backup paths retain the new optional evidence.

Focused recent/older actions check only the displayed creator through the existing workflow and count selector. They respect independent retry deadlines, retain safe older continuations, disable completed older shelves, and request no VOD/live metadata. Snapshot content mounts only when expanded. Inspection uses existing follows without catalog scans, storage writes, or provider requests. One deadline timeout updates retry availability while the panel is mounted; no interval polling or growing history is added. Existing provider page/concurrency budgets are unchanged.

## Verification for revision 30

- Production build and type checks passed. Whitespace checks passed on affected tracked sources.
- Complete regression suite: **1,351 passed, 0 failures** — 754 script tests with two workers plus all 597 TypeScript tests from the package test command. New cases cover sparse/duplicate-heavy shelves, quotas versus budgets, partial errors versus holds, unvisited shelves, legacy/bounded normalization, scoped retries, and the actual API warm cache clock contract.
- Development and production acceptance passed on isolated Chrome desktop and 390px mobile profiles. Actual UI, clip adapter, store and durable follow storage exercised zero-read/zero-write inspection, accurate reasons, selected-creator recovery, cursor continuation, independent retries, cache labeling, original observation clocks and reload persistence. No horizontal overflow or console errors occurred; screenshots inspected.
- Existing 25-creator batch/Stop browser regression passed on both viewports: stopping saves the active creator, later batches rotate fairly, partial failures retain clips and older discovery keeps its own position.
- Production milestone browser checks passed for five verified defaults, revision migration, preserved custom/manual states, filters, copy fallback, Markdown/CSV export and reloads. Desktop/mobile Home smoke passed with a non-diverging production baseline.

Evidence: screenshots/clip-coverage-{dev,built}-ui.json, screenshots/clip-coverage-batch-regression.json, screenshots/clip-coverage-plan.json and screenshots/clip-coverage-{dev,built}.json. UI screenshots include production snapshot tops and mobile action controls. Browser tests used isolated storage and controlled public provider responses; they did not seed or reset the real user’s library. Real-provider scale/soak, physical-device playback and unrelated external integrations are not claimed complete.

Changed entry points: src/lib/remote/twitch-clips.ts, src/lib/remote/api.ts, src/lib/videos/types.ts, twitch-clip-coverage.ts, follow-checkpoints.ts, src/components/library/twitch-clips-control.tsx, twitch-clip-coverage-panel.tsx and the versioned mission defaults/tests/export.

---

# YouTube live coverage milestone — 24 October 2026

Revision 29 completes **next-023 — YouTube live coverage progress model**. Default progress is **206/306 complete**. The remaining 96 next-level briefs and four older external verification milestones remain open. Only next-023 is newly promoted for revision-28 plans; earlier or later manual reopens and custom entries are preserved.

Coverage now groups canonical creators once, separates latest failed attempts from recent successful freshness, and derives ready/retry/never-verified states from existing observation and attempt clocks. Historical success remains visible on failed rows without inflating current success coverage. Legacy timestamp-less retry waits remain conservative; a superseded individual failure cannot hold a newer successful observation. Duplicate queue actions retain the same first identity as the store deduper.

The expandable creator queue provides search, ready/waiting/not-due/never-verified filters, last success/attempt and next eligibility, pagination at 20 rows, and single-creator checks. Opening, searching and paging do not start provider requests. Waiting creators cannot bypass retry deadlines. The queue uses existing follow data; it adds no background scan, polling or storage writes. Progress-only changes no longer recalculate coverage when the follow ledger is unchanged.

A sweep keeps at most 33 aggregate throughput samples over a rolling recent window, with each requested creator counted once. Estimates require at least eight successful creator results, two successful result batches, one second of observations and a sufficient success ratio. The ready-queue range excludes retry waits. It disappears when two result updates make no successful progress, the last success is over 30 seconds old, the sweep stops, or a provider cooldown begins. Telemetry is volatile and never copied into follows, preferences or a second catalog. Provider concurrency and request pacing are unchanged.

## Verification for revision 29

- Final production build and type checks passed.
- Complete regression suite: **1,343 passed, 0 failures** (747 script tests with two workers plus all 596 TypeScript tests from the package test command). The focused coverage/migration tests were also rerun after final identity alignment.
- A mixed 2,000-creator fixture, including duplicate aliases and excluded sources, verified exact distinct freshness, due, unavailable, retry and never-verified counts. Bounded throughput fixtures cover warming, active range, stalls, stopped sweeps, low success ratios and provider waits. The real store test confirms only accepted observations count, the catalog retains its identity, no catalog write occurs for empty live checks, and telemetry is absent from saved follows.
- Development and final production acceptance passed in isolated Chrome desktop and 390px mobile profiles. The real API/store/persistence paths exercised queue paging/search/filtering without requests, one-creator checks, disabled retry controls, reload persistence, held-response throughput, stalled estimate removal using the existing visible-page timer, and a real adapter 429 response replacing the estimate with a wait. Console errors and horizontal overflow were absent; screenshots inspected.
- Production milestone browser checks passed for revision migration, four verified next-level defaults, preserved unrelated/custom/manual states, filtering, copying, Markdown/CSV export and reloads. Development/production Home smoke checks passed with a non-diverging baseline.

Evidence: `screenshots/live-coverage-{dev,built}-ui.json`, `screenshots/live-coverage-{dev,built}.json`, and `screenshots/live-coverage-plan.json`. Browser cases use controlled provider responses and isolated storage, with an adjusted clock for stall detection. They do not measure real-provider throughput, a long provider soak, or physical-device playback. The actual user's saved library was not seeded or reset.

Changed entry points: `src/lib/videos/youtube-live-health.ts`, `youtube-live-throughput.ts`, `youtube-quick-live.ts`, `live-refresh-selection.ts`, `store.ts`, `src/lib/remote/api.ts`, `src/components/library/live-check-status.tsx`, `youtube-live-coverage-panel.tsx`, and the versioned mission defaults/tests/export.

---

# YouTube negative-evidence milestone — 24 October 2026

Revision 28 completes **next-024 — YouTube ambiguous negative live evidence**. Default progress is now **205/306 complete**. The remaining 97 next-level briefs and four older external verification milestones stay open. Only this new completion is promoted for revision-27 plans; previous and later manual reopens, custom entries, and unrelated statuses are preserved.

The live adapter now records the observation source, time, state, and completeness. Readable Home shelves and Streams pages with unread continuations cannot establish an ending. HTML recovery applies the same rules. Positive observations remain usable, while missing broadcasts stay provisional. Consent, malformed, wrong-owner, login and transport failures preserve the prior success clock and cannot start the offline hold.

An incomplete listing may check at most two missing known broadcasts directly, in the existing live transport lane. Only playable metadata for the exact video and creator with an explicit not-live/end signal supplies negative evidence. Older saved cards join the bounded identity ledger; an exact proof cannot end another saved broadcast it omitted. Source aliases are covered, and a 64-ID overflow disables supplemental negative checks. A complete Streams listing can still establish absence. No archive pagination or extra polling was added.

The existing ten-minute hold begins only with complete relevant evidence. Unknown checks cannot expire it; fresh positive observations clear it immediately. The interface explains provisional status, evidence source/time and retry deadlines, with a focused single-creator recheck. Metadata survives reload through the existing persistence path.

## Verification for revision 28

- Final build and type checks passed.
- Final full regression suite: **1,336 passed, 0 failures** (741 script tests with two workers + all 595 TypeScript tests from the package test command). The existing catalog-cancellation assertion was sensitive to concurrent build/browser load; its isolated rerun and this complete reduced-concurrency run passed.
- Focused tests cover Home/Streams/HTML boundaries, consent/malformed replies, exact known-broadcast checks, request ceilings, identity mismatches, offline hold/recovery, durable normalization, overflow, and the real store's legacy/source-alias recovery path.
- Development and final production desktop/mobile acceptance passed with controlled public-response fixtures and an accelerated clock: provisional explanations, disabled retry before deadline, focused rechecks, reload persistence, complete absence through the hold, intervening unknown replies and immediate positive recovery. Console errors and horizontal overflow were absent; screenshots inspected.
- Production milestone migration/export browser checks passed: three verified next-level completions, unrelated/custom/manual status preservation, filtering, copy fallback, Markdown/CSV and reloads. Home smoke checks passed on desktop and mobile with a non-diverging production baseline.
- A read-only public canary returned **23 live YouTube broadcasts** with a partial Streams catalog labeled incomplete; no complete negative check was claimed. This is one snapshot, not a long provider soak or physical-device test.

Evidence: `screenshots/negative-evidence-{dev,built}-ui.json`, `screenshots/negative-evidence-{dev,built}.json`, `screenshots/negative-evidence-plan.json`, and `screenshots/negative-evidence-public.json`. Boundary notes and commands: `fixtures/provider-contracts/README.md`. Browser QA used isolated profiles and did not seed or reset the real user's saved library.

---

# Provider milestone completion — 24 October 2026

Revision 27 completes **next-022 — YouTube response contract fixtures** and **next-038 — Twitch live batch fault isolation**. The verified default plan is now **204/306 complete**. The remaining 98 next-level briefs stay planned; the four older external verification milestones remain open. Existing custom entries, older manual states, and later manual reopens are preserved.

| Completed milestone | Delivered behavior |
| --- | --- |
| next-022 | Explicit feed/catalog/live response boundaries distinguish genuine empty results from malformed or changed responses. RSS owner/identity checks, supported classic and modern renderers, continuation validation, and 23 redacted synthetic fixtures protect saved observations and archive positions. Invalid service/sign-in messages cannot establish an empty catalog. Valid empty recent RSS avoids unnecessary HTML/Shorts fallback requests. |
| next-038 | Twitch validates each creator independently, preserving healthy aliases when another fails. Optional title/game/artwork errors remain visible warnings while stream state and viewers stay usable. Identity/stream/viewer failures retain the previous successful clock and saved state. Two concurrent requests return up to 12 creators each and publish in completion order, so a slow first chunk cannot delay healthy later results. Full follow-list rotation and bounded storage checkpoints remain. |

## Verification for revision 27

- Final build and TypeScript checks passed.
- Full regression result: **1,326 passed, 0 failures** (732 script tests + 594 TypeScript tests). The focused provider contract suite also passed all eight checks, including the actual 100-target API with six malformed creators and 94 healthy results.
- The held-first-response regression publishes later Twitch viewer counts before the first chunk resolves. A 2,000-follow / 80,000-record test retains the existing catalog identity and bounds live requests to 12 creators.
- Development and final production browser checks passed on desktop and 390px mobile: actual adapter/store failure isolation, optional warnings, valid empty feed behavior, prior live state preservation, and reload persistence. Consoles were clean and pages had no horizontal overflow. Home smoke screenshots were inspected on both builds; production matched the development baseline.
- Production mission-plan browser checks verified revision migration from saved planned entries, exactly two newly completed defaults, preserved custom/manual statuses, filters, copy fallback, full Markdown/CSV export, and reload persistence. These used isolated profiles; the real user's library and browser-local states were not seeded or rewritten by QA.
- Read-only public metadata probes succeeded: 15 YouTube recent uploads, 23 YouTube live observations with viewer metadata, and two valid Twitch offline observations. These are snapshots, not a large-follow/provider soak or native playback certification.

Evidence: `screenshots/provider-milestones-{dev,built}-ui.json`, `screenshots/provider-milestones-{dev,built}.json`, `screenshots/provider-milestones-plan.json`, and `screenshots/provider-milestones-public.json`. Contract fixtures and runner guidance are in `fixtures/provider-contracts/README.md`.

---

# Milestone completion — 22 October 2026

The default plan now has **202 of 206 milestones complete** (previously 198).
Revision 25 promotes only the four verified entries below. Custom ideas,
older manual reopens and later status choices are preserved. The real app’s
Mission plan page was opened, reloaded and checked: 202/206 remained saved.

| Completed milestone | Delivered behavior |
| --- | --- |
| youtube-upgrade-06 — Creator ambiguity review | Review contradictory exact links and aliases/names shared by distinct channel IDs. Explicit keep-separate choice persists, reopens after changed identity evidence, and retains saved media. Legacy exact IDs in source keys remain distinct. Ambiguous pending aliases survive automatic resolution. |
| youtube-upgrade-17 — Offline cache audit | On-demand channel/card coverage, actual local artwork bytes, poster-reference count, oldest saved observations/artwork, catalog save time and recovery links. Small cancellable reads; no provider requests or success-state writes. Browser HTTP/Companion caches are explicitly unmeasured. |
| youtube-upgrade-18 — Mobile rail gesture | Native horizontal touch swipes, visible keyboard focus and explicit 44px Save/Like/Together controls for public touch cards; invisible hover controls no longer intercept touch swipes. |
| twitch-upgrade-19 — Twitch device regression | Chrome and Edge desktop/touch-phone matrix for live-card Watch Room handoff, VOD seeking, blocked playback, reload, clip restrictions and official parent/URL parameters. Provider fixtures are distinguished from native playback. |

## Verification

- npm run build and npm run typecheck passed.
- npm test: **1,269 passed**, 0 failures (676 script tests + 593 TypeScript tests).
- Development and production desktop/mobile render checks passed with clean
  consoles and no horizontal page overflow. Screenshots inspected.
- Development and production milestone acceptance checks passed in Chrome
  and Edge, desktop and native touch-phone viewports: audit storage failure
  and retry, no provider reads from the audit, identity choice across reload,
  filtering, swipes, 44px actions, visible focus, migration and CSV contents.
- Development and production Twitch matrices passed in all four configurations.
- Host-library browser check passed with two real WebRTC clients and an empty
  guest library: host search/page, permission revocation, queue priority/removal,
  catalog title playback, reconnect and no host path/follow disclosure.
- Production Edge host/phone check passed all seven synchronization scenarios:
  delayed readiness, device-local autoplay unlock, 90s clock skew, drift recovery,
  buffering, shared pause/resume, live reload/independent clocks, VOD return and
  Twitch startup. Provider players are deterministic fixtures.
- An earlier development Edge run was interrupted by the 19:41:28 source hot
  reload; its host returned Home. The stable production rerun passed. It is not
  used as a successful test result.

Evidence:

- screenshots/milestones-confirmed-app.png
- screenshots/milestone-completion-dev.json
- screenshots/milestone-completion-built.json
- screenshots/twitch-device-matrix-dev.json
- screenshots/twitch-device-matrix-built.json
- screenshots/milestones-host-catalog.json
- screenshots/milestones-watch-phone-edge-built.json
- screenshots/milestones-smoke-dev.json
- screenshots/milestones-smoke-built.json
- .grok/milestones-tests.log, milestones-typecheck.log, milestones-build.log

Repeatable browser gates:

    node scripts/milestone-completion-browser-check.mjs <app-url> screenshots/milestone-check.json
    node scripts/twitch-device-matrix-check.mjs <app-url> screenshots/twitch-matrix.json
    node scripts/watch-room-phone-check.mjs <app-url> screenshots/phone-check.json msedge
    node scripts/watch-room-host-catalog-check.mjs <app-url> screenshots/host-catalog.json

## Still open — requirements retained

| Milestone | Evidence still needed |
| --- | --- |
| watch — Watch room reliability | Physical-device drift and recovery under actual phone media/network policy. Host-library guest playback is now verified in the isolated browser matrix. |
| sprint-19 — Watch room device matrix | Real home-network iOS/Android devices. Chrome and Edge isolated desktop/phone browser checks pass; viewport/touch automation cannot establish physical-device behavior. |
| watch-room-cross-device — Watch Room cross-device relay | A configured real TURN service plus two devices on separate networks, with relay-only selected-candidate proof. |
| recent-provider-soak — Real-provider archive soak | Sustained large real YouTube/Twitch follow lists, fair rotations/retries, catalog growth, memory and live latency under existing automatic budgets. Synthetic throughput tests and short public reads do not establish this. |

No automatic pull budgets were increased. Existing saved libraries and media
feedback were preserved. QA uses isolated browser profiles. The app stays up;
the separate production QA server is stopped after verification, and the
pre-existing tracked build-output tree is restored byte-for-byte.


## YouTube and Twitch recent-pull upgrade — 24 October 2026

Delivered:
- Durable per-creator recent-upload attempts, successful observations, retries and
  feed watermarks. Recent rotation no longer depends on archive/live timestamps.
- Recent checks preserve deep archive cursors, diagnostics and failures. Late
  live responses preserve newer recent health and archive positions.
- Two bounded client requests, at most two creators each, publish completed
  batches without waiting for a stalled first batch. Independent RSS body slots
  keep recent feeds moving beside archive transfers; shared request pacing,
  global cooldown revisions, body limits and cancellation remain enforced.
- Empty recent results preserve existing video/tag/provenance references and
  write only follow checkpoints. Transient failures receive a short bounded
  creator retry; unavailable sources and advertised provider deadlines wait longer.
- Both provider desks expose recent checks, saved older-video continuation,
  individual creator selection, health counts and failures. Mobile creator
  selection uses the full panel width. Existing clip and older-VOD tools remain.

Verification:
- npm run build and npm run typecheck passed on final source.
- Full npm test: 1,294 passed, 0 failures (701 script + 593 TypeScript).
- Final recent/store checks: six passed, including two subsequently added cases
  for a late live response and an unfollow during a pending recent response.
- Controlled 2,000-creator rotation survives JSON reloads; a held first batch
  does not prevent later batches publishing; request concurrency stays at two.
  An empty recent check preserves an 80,000-entry catalog and metadata identities
  without catalog disk writes. Held archive-body test proves RSS can finish
  independently while at most two feed bodies overlap.
- Real public read-only probes: YouTube returned 15 uploads. Twitch initially
  returned a service error; a later ordinary retry returned 17 videos/clips.
  Both retained archive checkpoints. No user's saved follows were modified.
- Isolated Chrome desktop/mobile development and final production checks passed:
  both provider tabs, two rounds covering all 16 fixture creators, selected
  archive continuation, saved state after reload, clean consoles and no overflow.
  Smoke checks render both viewports with no production baseline divergence.
- Existing production Twitch/movie browser regression also passed.

Evidence:
- screenshots/provider-pulls-dev-ui.json
- screenshots/provider-pulls-built-ui.json
- screenshots/provider-pulls-dev.json
- screenshots/provider-pulls-built.json
- screenshots/provider-pulls-twitch-regression.json
- screenshots/provider-pulls-public-probe.json
- .grok/provider-pulls-tests.log
- .grok/provider-pulls-store-recent.log
- .grok/provider-pulls-build.log
- .grok/provider-pulls-typecheck.log

Limits: controlled concurrency/rotation tests do not establish real-world speed
for thousands of creators. Provider availability, public API changes, rate limits
and archive-depth soak testing remain external constraints. No unfinished
physical-device or multi-provider soak milestone was marked complete.


## Twitch clip pulling upgrade — 24 October 2026

Delivered:
- Clip discovery uses a bounded, testable window walker. It skips repeated
  identities, advances duplicate-heavy pages, detects cursor cycles, and refills
  unused weekly/monthly quotas from healthy earlier continuations.
- At most eight clip-page requests per creator across all windows; API page
  sizes remain at most 100. Provider rate/integrity holds stop further windows.
  Other window failures retain accepted clips and allow healthy windows to run.
- All-time discovery saves the last complete continuation after a partial
  failure. Incomplete pages retain valid clips without advancing past the
  malformed page or declaring false exhaustion.
- Clip metadata includes game/category and validated view counts, while unknown
  creation dates remain unknown. Recent clip cache freshness is 45 seconds;
  archive cache behavior remains separate.
- Recent and older clip retries/attempt clocks are independent and persist
  through reload/backup normalization. Attempts rotate fairly even after errors.
- Explicit creator batches: 8, 25, 50 or 100, one creator at a time, with 25–500
  requested clips per creator, progress, Stop after this creator, and per-creator
  page/duplicate/failure results. Switching away or global cancellation stops
  later creators. Each completed creator is saved before continuing.
- Empty clip checks update only follow state, preserving video/tag/provenance
  references without catalog writes. Existing VOD/live observations and saved
  older clip positions remain intact during recent updates.

Verification:
- Final build and typecheck passed. The initial restricted build encountered a
  Windows native-dependency directory permission error; the permitted build passed.
- Full npm test: 1,309 passed, zero failures (716 script + 593 TypeScript tests).
- Final focused clip suite: 24 passed, including the subsequently added unused
  quota backfill case. Store checks cover 80,000-entry empty clip updates,
  partial-result persistence and independent retry lanes.
- Deterministic 100-creator batches cover all 600 creators through JSON reloads.
- Isolated desktop/mobile Chrome acceptance passed on development and production:
  stop after a held first creator, 25-creator rotation, partial failures with
  continued healthy creators, requested clip budget, duplicate/page results,
  older cursor old → next → last, independent retry, reload persistence,
  preserved live/VOD state, clean console and no horizontal overflow.
- Desktop/mobile development and production smoke checks passed with no baseline
  divergence. Both sets of screenshots were visually inspected.
- Read-only public provider probe: notyoda returned 12 clips (11 with a game);
  Twitch returned 25 (21 with a game), skipping five repeated listings.
  Both completed without errors and made no VOD/live requests or private
  library changes.

Evidence:
- screenshots/clip-upgrade-dev-ui.json
- screenshots/clip-upgrade-built-ui.json
- screenshots/clip-upgrade-dev.json
- screenshots/clip-upgrade-built.json
- screenshots/clip-upgrade-public-probe.json
- .grok/clip-upgrade-tests.log
- .grok/clip-upgrade-focused.log
- .grok/clip-upgrade-store.log
- .grok/clip-upgrade-build.log
- .grok/clip-upgrade-typecheck.log

Limitations: public Twitch clip windows rank highlights rather than guaranteeing
an exhaustive chronological feed. Requested counts are ceilings; unavailable
clips, provider errors, sparse shelves and rate limits can reduce the result.
A 600-creator real-network soak remains unverified. No such milestone was
marked complete from deterministic fixtures.


## 100 model-executable milestones — 24 October 2026

The default mission baseline now contains **306 milestones: 202 complete and
104 still active**, comprising the prior four open items plus 100 new planned
items. Existing manual reopens, completion decisions and custom ideas are kept;
actual user totals can differ from this default baseline. Revision 26 adds the
briefs without promoting any new work to complete.

The 100 additions cover ten workstreams with ten items each: data durability,
performance at scale, YouTube reliability, Twitch depth/coverage, Watch Together
collaboration, recommendations/topics, film/anime/private media, desktop/local
workflows, AI studio/creator tools, and trust/accessibility/release quality.
Each has a stable ID, outcome, priority, verified code entry points, three
implementation steps, two acceptance checks and explicit prerequisites where
needed. External device/service/native checks are labeled. The shared execution
contract requires validating the gap first and reusing work already delivered,
preserving user data and privacy, bounded work, relevant validation and an
evidence-based handoff before completion.

Mission plan adds search, workstream/priority/status filters and 20-card paging.
Each item has a copyable model brief; clipboard denial leaves selectable text.
The Markdown download includes all 100 full briefs with current saved statuses
and dependency context. CSV adds IDs, entry points, dependencies, implementation,
acceptance and external requirements. NEXT_LEVEL_MILESTONES.md is generated
reproducibly from src/lib/mission-next-level.ts by
scripts/export-next-level-milestones.mjs.

Verification:
- npm run build and npm run typecheck passed.
- 38 relevant automated checks passed: 13 plan/creator/audit script cases and
  25 prior mission migration cases. New checks prove exact count, ten tracks,
  unique IDs/titles, valid code references, acyclic prerequisites, substantive
  briefs, status/custom-idea preservation, idempotent revision-26 migration,
  current contract refresh, clipboard/export content and document reproducibility.
- Isolated desktop/mobile development and production Chrome acceptance passed:
  307-row migration fixture with custom/manual decisions, exactly 100 new planned
  rows, 20 mounted active cards, paging, workstream/priority/search filters,
  implementation expansion, copy success/denial, full Markdown/CSV downloads,
  start/block/resume and reload without duplicate additions.
- Existing production milestone/creator/offline-audit regression passed in Chrome
  and Edge on desktop and touch-phone layouts, retaining prior manual choices.
- Development and production desktop/mobile smoke checks hydrated with clean
  consoles, no horizontal overflow and no production baseline divergence.
  Screenshots were visually inspected.
- No real user library/status fixture was overwritten and no future milestone
  implementation is claimed complete.

Evidence:
- screenshots/mission100-dev-ui.json
- screenshots/mission100-built-ui.json
- screenshots/mission100-existing-regression.json
- screenshots/mission100-dev.json
- screenshots/mission100-built.json
- .grok/mission100-tests.log
- .grok/mission100-migration.log
- .grok/mission100-build.log
- .grok/mission100-typecheck.log
