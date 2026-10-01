# Adult pull depth, image quality, and large-library performance

Verified October 1, 2026. Changes are local and uncommitted; no deployment or push.

## Changes

- Adult pulls default to 2,000 entries, with a settings ceiling of 10,000 and explicit presets. The saved browser setting was raised from 160 to 2,000.
- The client walks provider archive cursors through requests capped at 400 entries. Pages are deduplicated across the walk, partial-page offsets survive, unchanged cursors stop, failures retain accepted windows, and cancellation gates each request. Each provider commits once, avoiding a catalog-wide rebuild for every page. The server's bounded response and deadline limits remain.
- Catalog reference copies yield in short slices, alongside the existing cooperative tag/provenance preparation. A million-entry reference-copy test verifies yielding, order, and immutable inputs; this is not a million-entry browser certification.
- Completed sidebar counts are reused across foregrounding and sidebar remounts. Cache keys are weak catalog references and retain at most two privacy configurations per snapshot.
- Request spacing uses monotonic actual transport-start time, before subscriber notification.
- Booru cards prefer available larger samples. Both image preview and player share bounded original-URL caching and on-demand recovery for allowlisted booru hosts, including post API recovery when HTML is unavailable. Download in the player uses the resolved original. No decoded images are retained in this URL cache. Removed per-pull TBIB detail prefetches.
- Original-image parsing supports nested download/original links, file attributes, and full-size image elements without treating known thumbnail/sample paths as originals.

## Real saved profile checks

- Started with 129,730 indexed entries and 8,977 adult entries.
- Eporner-only Continue archive completed: 2,000 returned, 1,657 new, 0 failures. The durable indexed total became 131,387 and adult sidebar total became 10,634. Resume cursor advanced from page 1 + offset 23 to page 3 + offset 24. Existing entries were deduplicated.
- The TBIB image tested displayed at natural dimensions 3,496 × 4,961 in preview and player, including mobile. It was a saved full-size file; the UI correctly reported saved-image fallback when original recovery was unavailable. This does not prove live original recovery for every booru host. Rule34 image requests were unavailable during QA.
- Mobile player and settings: document width 375 == viewport client width 375 under a 390 × 844 override (scrollbar accounts for the difference). Returned to browsing successfully.
- Automatic pulls were temporarily disabled for the controlled live pull, then restored enabled. Pulls were paused again, matching their original state. Request gap remains 1,500 ms, concurrency 1, and catalog target 100,000. Filter/view and expanded Adult controls restored after QA. No favorites or existing videos deleted. Playback QA naturally records history/resume activity.

## Validation

- Final build and typecheck passed.
- TypeScript test stage: 191 passed, 0 failed. Includes 10,000-entry archive walk, partial offsets, deduplication, cancellation/error/stalled cursor behavior, million-entry cooperative copy, original URL cache, and booru parser checks.
- Adult performance/recommendation script checks: 10 passed, 0 failed.
- Full npm test script stage: 216 passed, 7 existing failures (Windows symlink/wrapper checks and legacy source assertions). TypeScript stage run separately because the script stage exits first.
- Final desktop/mobile dev and production smoke: visible content, no console/page errors or overflow, no brand/auth warnings, no baseline divergence. Screenshots visually inspected.

## Limits

Brief stalls still occurred during some adult filter transitions in the large saved profile. Those actions completed, but this pass does not eliminate all lag. No multi-hour memory soak completed. Provider availability and archive duplicates can reduce new-entry counts below a requested pull target.

Dev server left running; the owned production QA server stopped after verification. Generated build output cleaned without reverting source changes.
