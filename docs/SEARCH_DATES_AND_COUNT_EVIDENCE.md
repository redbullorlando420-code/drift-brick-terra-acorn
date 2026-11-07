# Search dates and count evidence

Revision 92 · 2026-11-03 · next-126 and next-127

Open the bookmark beside Search and expand **Date filters**. Enable a filter, select evidenced publication date or local-file added time, and choose an inclusive calendar range. Save it as a workspace or open it directly. Date chips remove the date constraint while preserving text and other filters.

Publication filtering requires stored `rss`, `provider` or `watch` provenance and usable precision. It never borrows a scan/download timestamp from an unproven provider card. Unknown dates can be excluded, included alongside a range, or selected on their own. Explicit year/month observations can match by period overlap or be excluded; they are not converted into exact publication instants. Relative labels, upcoming/live times and invalid observations remain unknown.

All range boundaries use **UTC calendar days**. A day-only observation keeps the provider's stated day. An instant with an offset is compared using its actual UTC day, even when a card displays local time. Year/month cards show their limited precision. Older exact ISO observations without a precision flag are recognized consistently by filters and YouTube publication labels. Stronger existing month evidence survives a weaker year or unknown refresh; an exact date can replace it.

**Added to library · local files** uses the existing local-file `addedAt` import clock. Provider cards do not have a separate reliable historical import/download clock in this schema, so that field is unavailable for them. Existing YouTube `addedAt` values represent evidenced publication time, and are never presented as provider import times. Local movie filename/release years do not become publication evidence.

## Query and persistence contract

The version 1 saved-query envelope remains compatible. Its optional `date` field contains `field`, `from`, `to`, `unknown` and `partial`. Both dates may be open; values must be real calendar dates between years 1900 and 9999, and an end cannot precede a start. Unknown and future properties fail closed. Existing saved queries without dates keep their previous behavior, with no automatic storage migration or autosave.

Readable operators round-trip through the same model:

```text
feature published:2020-01-01..2020-12-31 unknown:exclude partial:overlap
published:.. unknown:only partial:exclude
feature added:2026-11-03..2026-11-03 unknown:exclude partial:overlap
```

`published` and `added` cannot be combined in one query. `unknown` accepts `exclude`, `include` or `only`; `partial` accepts `overlap` or `exclude`. Unknown-only mode ignores the otherwise valid range. Removing the date chip removes all of these date choices together. Spelling corrections preserve the date object and use the same eligibility predicate when building their vocabulary.

Filters are read-only: existing metadata and native files are not rewritten by a query. `search-dates.ts` owns the evidence and interval rules, while the shared structured predicate handles sparse worker candidates or cooperative filter-only scans. Existing visibility, privacy, ranking and cancellation ownership still apply.

## Count evidence

`search-count-evidence.ts` defines a small versioned projection containing only count, scope and evidence kind. It never stores media arrays, queries or titles.

- **Pending:** matching/ranking or a worker build is unfinished; no complete result total is claimed.
- **Completed snapshot:** exact matches in the loaded, visibility-filtered saved catalog. This is not the provider's entire catalog, an unimported archive or the number of mounted cards.
- **Provisional snapshot:** explicitly incomplete matching evidence, labelled provisional rather than complete.
- **Loaded page:** only the received room/host/provider page. A continuation means more results are available, not a verified grand total; absence of a continuation does not establish one either.
- **Provider estimate:** optional validated numeric `estimatedResults` evidence is labelled approximate, separately from the page count. Missing, malformed or contradictory estimates remain unavailable.

Counts are independent sibling projections, not grid keys, cursor identities or new query owners. They introduce no storage writes, extra provider fetches or polling. Root worker status subscribes only while a search is pending. Room search keeps its existing queue/search behavior and now distinguishes loaded page size from any supplied public YouTube estimate.

## Verification

Build and typecheck pass. **224 automated tests** pass in `screenshots/search-evidence-tests.txt`, including date/model round trips, invalid inputs, download/publication separation, unknown/partial evidence, UTC boundaries, legacy ISO compatibility, precision retention, sparse matching, count evidence, provider estimate parsing, existing search/ranking/storage behavior and revision 92 migration.

```text
node scripts/search-evidence-browser-check.mjs http://127.0.0.1:8080/ screenshots/search-evidence-dev.json
node scripts/search-evidence-browser-check.mjs http://127.0.0.1:8083/ screenshots/search-evidence-production.json
```

The browser check drives the real app on desktop and mobile in America/Los_Angeles and Pacific/Kiritimati. It holds the actual worker's final batch to verify pending-count honesty, then releases it without moving focus. It exercises precise/partial/unknown date choices, local added time, persistence, invalid-range preservation and chip removal. An isolated fixture uses the actual count component and room video-summary component to verify an estimate-only update preserves the focused result DOM. The fixtures use disposable profiles and saved metadata; companion/provider responses are stubbed.

Default roadmap totals are **313/406 complete**, **111/200 next-level** and **15/100 new batch**. Revision 92 promotes only next-126 and next-127 once, preserving prior reopens and custom notes. Feature, mission, page audit and Home render reports use `screenshots/search-evidence-*`.

Final development and production feature checks pass on desktop and mobile. The prior saved-workspace regression, revision 92 mission checks and historical mission migration check pass. Navigation audits pass 66 page reports per build; Home has clean consoles/layout, no brand/auth warnings and no production baseline divergence. Desktop/mobile editor, results and Home screenshots were visually inspected.

Limits: no new publication observations or provider import clocks are fetched or invented. Year/month support is used only when explicitly recorded with provenance; it does not infer dates from titles or relative labels. Live provider estimate availability and physical-phone timing are not established by these fixtures.
