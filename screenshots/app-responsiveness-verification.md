# App responsiveness verification — 2026-10-01

## Changes in this pass

- Sidebar catalog counting no longer restarts its catalog worker when favorites, likes, or history change. Activity counts resolve only requested titles in disposable background slices. Pending counts do not flash false zeros.
- Continue reuses requested activity aliases instead of traversing every unwatched entry on every progress tick. History resolves missing/out-of-scope IDs together rather than scanning the library separately for each evicted entry.
- Requested alias caches retain at most 8,192 keys per immutable catalog snapshot. Catalog positions live with those bounded entries; no additional ever-growing position index is retained. Alias collisions, catalog-order ties, hidden/demo filters, and private/public scope are preserved.
- Independent durable activity, subscription, saved-shelf, and photo slices skip unchanged writes. Changes to remote-source folders do not rewrite unchanged local photo data. Larger activity saves wait behind input and flush on page hide or app switch; history events still use the existing journal.
- Feedback saves serialize their synchronous mirror once rather than twice. Idle scheduling and cleanup keep deferred writes/listeners from accumulating.
- Long Continue recovery titles now fit mobile screens instead of widening the whole document.

## Checks

- Final `npm run typecheck`: passed.
- Final `npm run build`: passed; see `app-responsiveness-build.txt`.
- TypeScript test stage: **184 passed, 0 failed**; see `app-responsiveness-unit-tests.txt`.
- Existing Adult performance test file: **8 passed, 0 failed**.
- Continue recovery check: passed for local, YouTube, Twitch and Watch Room history recovery. Its outdated fixture was updated to include the required empty hidden-video map.
- Regression tests cover 100,000-entry cold/warm lookups, repeated warm lookups with no catalog rereads, aliases shared by several titles, cancellation without partial cache publication, privacy/count rules, and independent durable-slice writes.
- Full npm script suite still has the same **7 existing failures** seen in the previous pass: two Windows symlink permission failures, three wrapper/path failures, a legacy smoke-source assertion, and an auth-schema layout assertion. The remaining 216 script tests pass; the TypeScript stage was run separately because the script failure stops npm's chained command.
- Final development and production smoke checks: desktop 1280×800 and mobile 390×844 render visible content, clean consoles, no page errors, no horizontal overflow, and no production baseline divergence. All four final screenshots were inspected.

## Interactive browser verification

- Used an agent-created tab with the existing saved profile: **129,730 indexed entries**, roughly 60,000 YouTube videos. Pulling stayed paused; pull policies were not changed.
- Exercised Home → Continue → YouTube, cached preview opening, Watch now, return to library, and resume from Continue.
- Verified an available YouTube video actually played in its official iframe on desktop and mobile. Another cached video reported removal by YouTube; this was a provider availability result, and an available title was used to finish playback verification.
- Mobile Continue and player now have `scrollWidth === clientWidth === 375` (390px viewport with scrollbar). Before the layout fix the document scroll width was 1,193px.
- Sidebar saved/history counts completed correctly; playback marks remained available after a development reload. No favorites or existing library entries were deleted. QA playback naturally adds watch history/resume marks for the exercised titles.
- Temporary mobile viewport was reset. Agent-created QA tab and owned production QA server were closed; development server left running. Starting Home view restored.

## Limits

This is not a controlled before/after latency benchmark, multi-hour memory soak, or full million-entry browser certification. Broad preference snapshots and initial cold catalog passes still exist. The changes reduce recurring catalog work and redundant writes; they do not promise removal of every lag source or provider/network delay.

No commit, push, or deployment was performed.
