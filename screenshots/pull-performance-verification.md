# Pull and app performance verification — 2026-10-01

Changes
- Workspace hubs no longer sort the public video catalog; compact Adult discovery skips the private-folder catalog until deep shelves open.
- Settings coverage, creator checks, local vision totals, and Companion candidate selection run in one disposable background pass, in 512-row / 4 ms slices.
- Adult image-presence checks avoid building/ranking every fallback URL for every catalog row. Worker catalog packets contain at most 512 ranking cards and their scoped tags.
- Adult provider preparation, targeted ID lookup, tag inference, and immutable metadata copying yield between tasks. Edits arriving during preparation trigger a rebase before publication.
- One automatic Adult owner rotates two eligible providers, respects saved cursors/cooldowns and the configured cap/target/interval, uses saved Reddit source preferences, and wakes on unpause/visibility/online/settings/session activity.
- Pull queue pause waits use gate events rather than 250 ms polling. Cancel aborts client transport, releases active or held slots, and prevents later batch application. A 90-second transport deadline releases stalled slots. Already-sent provider server work may finish.
- URL mirrors use bounded, hydrated memory lookup and batched idle writes; unchanged URLs do not produce another write.

Verification
- npm run typecheck: PASS.
- npm run build: PASS.
- TypeScript tests: 179 PASS, 0 FAIL. Includes cancellation, timeout, concurrency/gap, queue bounds, 1-million-row cooperative cancellation, 100,000-key immutable copies, cache bounds, and Adult provider rotation.
- Full npm test script stage: 216 PASS, 7 existing FAIL (Windows symlink permission, wrapper paths with spaces, legacy smoke source assertion, auth migration layout assertion). The TypeScript stage was run separately because the first stage stops the && chain.
- Dev and built-output smoke: desktop 1280x800 and mobile 390x844, visible content, no console/page errors, no horizontal overflow, production baseline does not diverge. Screenshots visually inspected.
- Real Chrome profile: 129,582 entries before checks, 129,622 after two bounded Eporner continuation pulls. Each returned 20, added 20, failed 0; saved cursor p2+40 -> p2+60 -> p2+80. No repeat of the first accepted batch.
- Pause queued a manual request (0 active / 1 queued) while Settings navigation remained usable. Resume completed the first pull. Cancel of another paused request left 0 active / 0 queued and the accepted archive data intact; the result explicitly says cancelled.
- Adult worker completed recommendations and 48 ranked tags after chunked catalog transfer.
- Settings navigation during a pull recorded 84 ms input-to-next-paint; an earlier session sample was 501 ms. These are observations, not a controlled benchmark; worst samples from earlier loading remain in the session ledger.
- Mobile Settings had equal document client/scroll width (375); layout and controls visually inspected.
- Temporary test limits restored: Adult batch 160, automatic pulls enabled, original pause state retained (paused).

Limits
- No multi-hour idle/memory soak or full million-entry browser session was completed. Pure scale tests verify bounded helpers, not whole-app certification.
- Actual provider pulls were exercised in development against the saved profile. Production browser verification covers rendering and Settings interaction, with an empty separate-origin catalog.
