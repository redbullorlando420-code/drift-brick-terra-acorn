# Next roadmap wave — 100 new milestones

Added 2026-11-02 as **next-101 through next-200**, revision **84**, initially all planned. Revision **85** completes **next-101 and next-105** with [profile rename and identity evidence](PROFILE_LABELS_AND_IDENTITY.md); the remaining 98 new milestones remain planned.

The default plan now has **406 milestones**, with **300 completions**. The two next-level batches together contain **200 milestones**, with **98 completions**. Actual local counts can differ because custom ideas and manual status decisions are preserved.

| IDs | Workstream | Intended improvement |
| --- | --- | --- |
| 101–110 | Profile lifecycle and portability | Rename/removal, storage budgets, transfer previews and registry repair |
| 111–120 | Archive continuity and growth | Durable cursors, coverage, request cancellation and acceptance receipts |
| 121–130 | Search and library navigation | Saved searches, structured queries, publication evidence and match explanations |
| 131–140 | Recommendation trust and controls | Taste controls, reversible feedback, reason provenance and profile privacy |
| 141–150 | Shared viewing sessions | Guest readiness, reliable transitions, host recovery and physical-phone checks |
| 151–160 | Library curation and accessibility | Movie evidence, anime progress, photo review and undoable tagging |
| 161–170 | Companion operations | Startup receipts, safe native jobs, download reconciliation and bounded disk caches |
| 171–180 | Creative workflow continuity | Recipe migrations, model compatibility, output curation and simulator sequences |
| 181–190 | Runtime efficiency and resilience | Background work, memory partitions, worker transfers and measured mobile budgets |
| 191–200 | Quality gates and release practice | Evidence registry, upgrade dry runs, fault injection and release candidate checks |

Each brief has a concrete problem, priority, existing code entry points, prerequisite IDs, three implementation steps and two acceptance checks. Copied/exported briefs include the shared execution contract and required evidence handoff. External requirements explicitly distinguish fixtures from real engines, devices and providers. Dependencies are checked before priority; no prerequisite points forward or forms a cycle.

## In the app

Open **Mission plan**, then choose **Batch → New 100 · 101–200**. Search, workstream, priority and status filters compose together, with 20 active cards mounted per page. **Download new 100 briefs** exports only the new batch while resolving prerequisites from the entire saved plan. **Download 200 model briefs** includes both next-level batches. CSV export retains the complete plan and custom notes. Completed work remains in the delivery archive.

Revision 84 appends missing IDs once. It adds no completion promotions. A revision-83 manual reopen of next-010, old custom wording and subsequent new-batch status edits survive reload. Existing scoped profile storage is reused.

## Reproducible documents

- [New 100 executable briefs](../NEXT_100_MILESTONES.md)
- [Combined 200 executable briefs](../ROADMAP_200_MILESTONES.md)
- [Original 100 briefs](../NEXT_LEVEL_MILESTONES.md), retained as its existing batch

Regenerate the new documents with `node --experimental-strip-types scripts/export-next-wave-milestones.mjs`. In-app downloads reflect current saved statuses; checked-in documents reflect source defaults.

## Verification

- **94 focused tests pass**: mission migration history, original roadmap and new-wave contracts. Checks cover exact counts/IDs, unique titles and instructions, real entry-point paths, dependency order, source immutability, status preservation and reproducible documents.
- `npm run typecheck` and `npm run build` pass. The milestone content stays in the existing lazy Mission plan chunk; it is not added to Home’s initial render path. Existing unrelated large-chunk build notices remain.
- Desktop **1440×1000** and mobile **390×844** interactive dev and production checks pass. Real downloads contain exactly 100/200 full briefs; CSV retains custom notes. Tested filter combinations, pagination/reset, current prerequisite status, clipboard success/denial, Start/Block/Resume, reload and no duplicate additions.
- Historical milestone browser regression passes on desktop/mobile. It verifies legacy one-time promotions while keeping manual states and custom notes.
- Home desktop/mobile dev and production smoke checks pass with clean consoles, no overflow, no branding/auth warnings and no baseline divergence. Rendered screenshots inspected.

Artifacts: `screenshots/mission200-tests.txt`, `mission200-build.txt`, `mission200-typecheck.txt`, `mission200-dev.json`, `mission200-production.json`, `mission200-legacy-dev.json`, and `mission200-home-{dev,production}.json` with accompanying PNGs. Browser scripts use the established Playwright fallback in disposable contexts. No real user profile, native service or provider library was modified by these checks.
