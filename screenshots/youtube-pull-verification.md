# YouTube pull recovery verification — 2026-10-01

Cause reproduced: public YouTube metadata returned HTTP 429; feed returned HTTP 404 independently. The old fetch path swallowed the status and reported unavailable sources. The legacy whitespace importer split the retained comma-separated display-name list into individual words, which empty-source priority allowed to dominate archive batches.

Implemented: full CSV/newline names and Unicode identities; exact unique public display-name resolution; original query aliases retained; known unique creator titles avoid additional unresolved stubs; preserved legacy fragments marked for review and excluded from automatic pulls. Corrected draft recovery seeds both providers before any pause/network wait and continues when localStorage is full. No cached videos or saved reactions are deleted.

Transport: shared five-minute minimum YouTube cooldown honors longer Retry-After; catalog/feed/live paths see the same provider gate. Status now retains HTTP codes. Partial archive pages and cursors survive throttling; expired 400/404 continuation tokens recover once from the public first page. Initial grids finish before publishing the next token. Provider cooldown stops a sweep after attempted sources, without falsely failing unattempted targets. YouTube archive status is separate from Twitch refreshes.

Verified:
- Build and typecheck pass.
- 71 focused tests pass (store admission/queue behavior, import stubs, creator identities, continuation pages, ranking/performance regressions, exact name ambiguity and rate limits); two additional real persistence-boundary tests pass, including full localStorage and review/query preservation.
- Desktop/mobile dev and production smoke checks pass with no overflow, console errors or page errors. Production matches dev baseline.
- Real Chrome library: 67,703 distinct YouTube IDs, zero duplicate rows, 100,000 configured limit, 32,297 slots remaining. Desktop and 390x844 mobile controls exercised; mobile has no horizontal overflow. Console error log empty.
- Repaired saved import view contains 1,571 whole creator queries rather than 2,498 word fragments. Original unresolved fragments remain for review. Newly restored intended names increase the saved-source count; unresolved names are not claimed as verified creators.
- Real final archive retry: 1 / 100 attempted, one HTTP 429 failure, 99 targets remain queued, cache count unchanged. Current provider limit prevents verifying new catalog growth to 100,000 in this session. Pull pause was restored to running; cooldown manages requests automatically.
- No deployment, commit, million-entry soak or successful live download claim.
