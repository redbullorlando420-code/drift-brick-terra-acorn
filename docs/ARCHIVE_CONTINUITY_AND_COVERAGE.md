# Durable archive resume and sort coverage

Milestones: **next-112** (durable archive cursor repository) and **next-113** (archive sort coverage map). Verification is recorded in `MILESTONE_VERIFICATION.md`.

## Saved-window contract

Adult discovery now hydrates a compact versioned IndexedDB ledger before choosing a continuation window. It uses the selected saved profile’s existing database, catalog writer lease, restore fence and recovery journal. Legacy browser-preference positions fill missing lanes once; a durable position always takes precedence over its best-effort preference mirror.

Each provider/query/sort position stores the last accepted window’s continuation, added/repeated/received counters, status and checkpoint token. The ledger is capped at 512 positions. It does not retain video titles, descriptions, page responses or historical arrays of IDs. The transient journal receipt contains at most 432 accepted IDs and verifies those rows on disk before advancing the position.

Catalog writes retain the existing 64-row transaction limit. Earlier slices commit first; the final slice, accepted-row verification, continuation update and journal acknowledgement share a transaction. A failure before that transaction retains the old continuation. A prepared operation replays through the existing recovery path. This may revisit an accepted prefix, which deduplication handles without discarding personal edits. Empty or duplicate-only windows can advance with an empty receipt. Admission-limit rejection keeps the requested starting page and offset.

A compare-and-set token prevents a stale tab from replacing a newer continuation. Accepted rows can remain saved when another writer supersedes the position; the caller reports that conflict and requires a fresh resume read. Malformed or future ledger versions remain untouched and stop discovery until explicit recovery. The panel offers recovery retry; opening it never launches a provider request. Another tab’s existing writer notice invalidates compact summaries without adding a scheduler.

Positions are attached to the actual accepted catalog. They are deliberately excluded from personal-only restores and portable configuration packs, which do not carry the corresponding media. Saved-profile isolation is inherited from the existing database namespace.

## Coverage controls

Adults → Archive progress contains collapsed per-provider coverage. Eporner and RedTube expose their five supported sorts. Other providers explain their actual shared ordering, rotation, image feed or live-directory semantics and retain compatible saved slots without claiming independent upstream sorts.

Each available lane shows its own next page/offset, last added and repeated counts, and status. Unchecked, ready, exhausted, failed and provider cooldown states remain distinct. Exhaustion of one lane does not disable another ready lane. Provider failures retain the last position and impose the existing provider retry delay.

Continue targets the chosen provider and sort through the normal accepted-window pipeline, bounded to the existing per-response limit of 400. Controls respect storage recovery, current work and cooldowns. Summary rows stay bounded independently of library size, do not refresh on a timer, and show only the broad archive query. Private query positions stay out of the coverage view. Page depth is explicitly not proof of complete upstream coverage.

## Verification scope

- Pure schema, legacy migration, independent coverage, scheduler and store regression tests.
- Native IndexedDB fault injection at prepare, final-row, checkpoint and acknowledgement boundaries; interrupted prefixes, replay, stale tokens, future documents and manual tag locks.
- Blocked Local Storage cursor writes followed by reload and continued durable positioning.
- Actual second saved-profile activation and reload, checking independent positions and preservation of Default.
- Desktop/mobile development and built-output browser acceptance. The desktop fixture contains 100,000 saved entries; the mobile fixture contains mixed videos, photos and room cards. Coverage selection, exact page/offset requests, cooldowns, duplicate refreshes, counts, settings and personal tags are exercised.

Provider responses are deterministic metadata fixtures. These checks do not claim real provider availability, complete upstream catalogs, rate-limit endurance or long-running multi-provider soak readiness. Real user profiles and their catalog contents are not changed by the test fixtures.

## Reproducing the checks

Run `npm run typecheck` and `npm run build`. Target the running app with these browser scripts, passing its URL as the first argument and a report path under `screenshots/` as the second:

- `scripts/archive-continuity-native-check.mjs`: ten native checkpoint/failure/profile checks; uses real IndexedDB in isolated same-origin fixture documents.
- `scripts/archive-coverage-browser-check.mjs`: desktop 100k catalog and touch-mobile acceptance against the actual rendered app, with deterministic provider metadata.
- `scripts/catalog-recovery-browser-check.mjs`: interrupted catalog operations, personal edits, bounded replay and reviewed artwork cleanup. Fault stages use a single probe owner; app interaction follows in a separate document. Resolved IndexedDB predicates are polled explicitly, and interrupted writer leases are respected.
- `scripts/mission200-browser-check.mjs` and `scripts/mission100-browser-check.mjs` (with `node --experimental-strip-types`): migration, manual reopens, exports and delivery queue controls.
- `scripts/all-pages-browser-check.mjs` and `scripts/browser-smoke.mjs`: sidebar audit and visible Home/console/layout checks. Compare production Home with the development verdict via `--baseline`.

Final reports use the `archive-continuity-*` and `archive-coverage-*` prefixes in `screenshots/`. Pure checks run with `node --experimental-strip-types --test` over `scripts/catalog-recovery.test.mjs`, `scripts/library-restore.test.mjs`, `scripts/local-profile-storage.test.mjs`, `scripts/automatic-adult-pulls.test.mjs`, and the `adult-archive-model`, `adult-archive-cursors` and `adult-discovery-plan` tests under `src/lib/videos/`. The complete `scripts/pull-entry-limits.test.mjs` regression and mission-plan/next-wave/next-level tests also pass.
