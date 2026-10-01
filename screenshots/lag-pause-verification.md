# Lag reduction and pull pause

Verified September 30, 2026.

- Video previews/player now subscribe independently from the main browse page. Opening/closing an overlay no longer forces the entire LibraryApp tree to render.
- Visible-catalog selectors invalidate only for inputs used by the selected view. Normal YouTube browsing reuses its sorted array across progress/history updates; recent/history/continue, favorites, Adult hidden tags, and search keep their required invalidation.
- Name ordering uses one Intl.Collator. A synthetic 10,000-title comparison measured 443 ms for the old comparator versus 10 ms for the shared collator on this machine. These are sort timings, not end-to-end playback timings.
- Pause pulls / Resume pulls appears in the top bar, preview, and player and persists across reloads. New YouTube/Twitch/Adult pull requests and catalog response application wait without polling. Automatic checks skip while paused. Already dispatched provider requests may finish before their response waits. Playback and comments remain available.

Validation: production build and typecheck passed; 59 focused tests passed, including pause/resume, response holding, rapid re-pause, cache invalidation, YouTube catalog/ranking/live and image admission. The 10,000-row cache test reuses the same result for 100 irrelevant playback updates.

Interactive browser: pause state survived reload; a requested YouTube catalog pull waited while paused, resumed, and completed both followed creators without failure. Opened a preview and player and used the same pause/resume state there. Mobile player/browse layout had no horizontal overflow and no captured app errors. YouTube's embedded player still required bot-confirmation sign-in, so actual provider playback could not be verified.

Development and production smoke checks show content and no console/page errors or horizontal overflow on desktop and mobile. A cold production snapshot preceded deferred Home content; the warm retry matched the development baseline. Evidence: lag-pause-dev.json, lag-pause-built.json, four accompanying screenshots, lag-pause-tests.txt.
