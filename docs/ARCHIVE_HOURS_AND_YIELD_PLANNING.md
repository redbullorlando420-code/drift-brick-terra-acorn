# Archive hours and useful-yield planning

Milestones **next-116** and **next-117**, revision **89**. Defaults: **307/406 complete**, **105/200 next-level**, **9/100 new batch**. The revision promotes only this pair once and preserves earlier manual reopens and custom notes.

## Automatic archive hours

Settings → Pull management offers an optional daily window with explicit start, end and IANA time zone. Existing profiles default to unrestricted hours. End before start spans midnight; equal times are rejected. The device-zone shortcut fills the browser’s zone explicitly. Unchecking the window can repair a damaged draft without requiring valid hours first. Invalid saved schedules hold automatic catalog work and explain how to repair it, rather than silently permitting work.

The selected profile’s existing pull-settings key stores the configuration. A quota failure leaves the previous disk settings intact, applies the change for the current session and displays that distinction with a save-retry path. Independent saved profiles have independent schedules. Normalizing unrelated settings retains the immutable schedule identity, preserving an edited form draft.

YouTube, Twitch and Adults display the enabled schedule and a shortcut directly to these settings. Manual pulls and independent lightweight live lanes keep their existing controls. This is a browser-session work window, not an operating-system scheduler: the app must remain open, and existing visibility, idle, watching, pause, capacity and provider gates still apply.

The existing periodic scheduler gains an optional earliest-dispatch callback. Closed archive jobs use its one shared timer to sleep until an actual opening; they do not poll every 15 seconds outside the window. Settings, visibility and session changes reuse existing wake events. Only undispatched automatic work is gated. Already dispatched results can finish saving through the established transaction boundary. Subsequent Adult requests stop with the last accepted cursor and no synthetic provider failure. Scheduled YouTube/Twitch work is checked before source preparation and again at transport admission. Missed intervals never become queued catch-up tasks.

Wall-clock membership follows the chosen zone. Repeated daylight-saving hours apply twice; skipped minutes have no real instants. A bounded search for the next actual minute boundary is cached until that transition, with at most eight cached configurations. Status text refreshes only at a boundary through the shared periodic scheduler while visible. No separate polling loop is introduced.

## Useful-yield planning

Adult automatic planning retains its existing fanout, request frequency, intervals, budgets and manual provider/subreddit priorities. The oldest eligible provider always owns the first exploration slot. Only the remaining compatible-sort slots are ranked by observed useful yield. A low-volume or duplicate-heavy source therefore remains eligible for a fair turn. Exhausted sort lanes remain independent; provider-wide retry waits remain authoritative.

Each durable per-sort cursor may contain one optional bounded numeric yield sketch: schema version, capped observation count, smoothed score and recovery confidence. The final accepted-row/checkpoint transaction computes it; no separate storage write or telemetry history is added. New entries receive full credit and bounded refreshes receive 15% credit, discounted by repeated candidates. A successful observation has 25% smoothing weight after the first observation. Failure halves the score and clears productive confidence; four subsequent successful windows gradually restore that confidence. Observation and recovery counts cap at eight. First-time and legacy cursors remain valid without a sketch.

The model accepts no extra payload fields, invalid counters or future sketch versions. The same checkpoint token cannot count an observation twice; stale tokens cannot overwrite newer observations. A failed transaction rolls back the sketch with its cursor and final rows. Strict older cursor readers may hold newer sketches rather than advancing their positions; the saved catalog remains preserved.

Windows blocked by local admission/retention limits keep the prior score and sample count. A full library is not evidence of poor provider yield. That choice is carried in the bounded journal checkpoint and committed atomically with the retained position.

Adults → Archive progress provides a bounded seven-source planning preview. It explains oldest-first exploration, productive slots, waiting sources and sampled scores, using only broad archive checkpoints. Opening it starts no pull and reveals no private queries, titles or URLs. Scores are a local planning heuristic, not a promise of new videos or a measurement of a provider’s complete catalog.

## Verification

Pure and actual-owner tests cover overnight boundaries, both daylight-saving transitions, backward clocks, corrupt schedules, disabled defaults, one-timer dispatch, reopening after missed days, pause/idle transitions, closing during counting, fair exploration, provider cooldowns and gradual yield recovery. Store tests verify scheduled YouTube/Twitch preflight and an Adult response that completes at closing time: accepted rows and the exact continuation persist, the next request stops, and manual pulling remains possible.

Native IndexedDB checks exercise interrupted final transactions, prepared-operation recovery, stale tokens, quota-blocked cursor mirrors, same-token yield replay, personal tag locks and actual saved-profile selection/reload. Browser acceptance uses disposable desktop and touch-mobile profiles for the settings form, invalid inputs, disabling, quota/retry, reload, notices on all three provider pages, direct settings navigation, real transport gating, manual/live exceptions and durable source-planning updates.

Relevant commands and reports:

- `npm run typecheck` and `npm run build`; logs use `screenshots/archive-planning-*`.
- `node --experimental-strip-types --test` over `src/lib/archive-work-window.test.ts`, `src/lib/videos/archive-yield.test.ts`, `src/lib/videos/adult-archive-model.test.ts`, `src/lib/videos/adult-discovery-plan.test.ts`, `src/lib/periodic-scheduler.test.ts`, `src/lib/pull-control.test.ts`, `scripts/automatic-adult-pulls.test.mjs`, `scripts/catalog-recovery.test.mjs`, `scripts/library-restore.test.mjs` and `scripts/local-profile-storage.test.mjs`.
- Complete `scripts/pull-entry-limits.test.mjs` and mission-plan/next-wave/next-level regressions.
- `scripts/archive-planning-browser-check.mjs` and `scripts/archive-continuity-native-check.mjs`, with the app URL and a `screenshots/` JSON path.
- Existing archive coverage/100k catalog, mission migration/export, all-sidebar-page and Home baseline checks against development and built output.

Provider metadata is deterministic. These checks do not establish live provider yield, uninterrupted overnight operation, physical-phone timing or immunity to upstream rate limits. They do not modify the real user library or settings.
