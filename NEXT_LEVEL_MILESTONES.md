# Realhub — 100 next-level milestones

---

Status lines reflect verified defaults or the supplied in-app snapshot. Existing completion decisions are retained. P0 denotes foundational correctness/reliability risk; P1 denotes core workflow quality; P2 denotes capability and polish. Dependencies take precedence over priority.

---

This file is generated from verified defaults. Use the current in-app status when executing; later manual status decisions remain local.

---

# next-001 — Crash-safe catalog mutations
Status: complete
Track: Data durability
Priority: P0

## Problem and intended outcome
Catalog rows and preference ledgers can commit separately during interruption.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/catalog-mutations.ts
- src/lib/videos/store.ts
- src/lib/videos/persist.ts

## Implementation
1. Trace a pull, cleanup and tag edit across persistence boundaries; document the partial-write states.
2. Add a versioned operation journal with idempotent replay and a commit marker; reuse existing stores rather than duplicating media graphs.
3. Recover interrupted operations before admitting conflicting writes; expose a bounded recovery outcome.

## Acceptance checks
- [ ] Inject failure before and after each transaction boundary; reload retains accepted rows and manual metadata exactly once.
- [ ] Recovery scans only pending operations and leaves a 100k-row catalog interactive.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-002 — Storage pressure recovery
Status: complete
Track: Data durability
Priority: P0

## Problem and intended outcome
Quota errors need a safe workflow that distinguishes disposable cache from personal state.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-001 — Crash-safe catalog mutations [complete]

## Start in
- src/lib/videos/storage-recovery.ts
- src/components/library/storage-recovery-panel.tsx
- src/lib/videos/persist.ts
- src/components/library/settings-section.tsx

## Implementation
1. Inventory browser stores by reclaimability and estimated size; label unavailable measurements.
2. Offer a preview of disposable artwork/detail cleanup with protected ratings, history, follows and drafts.
3. Handle quota failure with bounded cleanup and explicit retry; never silently delete media or personal records.

## Acceptance checks
- [ ] Force QuotaExceededError during writes and verify the prior saved state remains readable.
- [ ] A preview and cancellation remove nothing; confirmed cleanup reports reclaimed estimates without claiming exact disk bytes.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-003 — Backup preflight report
Status: complete
Track: Data durability
Priority: P1

## Problem and intended outcome
A large backup should be inspected before it can change current data.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/pack-preflight.ts
- src/components/library/library-pack-transfer.tsx

## Implementation
1. Trace current library-pack parsing and add a read-only preflight summary of versions, sources, counts and conflicts.
2. Validate record shapes, sizes and duplicate identities incrementally with actionable rejected-record locations.
3. Show merge/replace consequences before applying the existing import path.

## Acceptance checks
- [ ] Malformed, truncated and future-version packs produce a report with no storage mutation.
- [ ] A 100k-record pack preflight yields to input and reports which personal records would change.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-004 — Atomic restore with recovery slot
Status: planned
Track: Data durability
Priority: P0

## Problem and intended outcome
An interrupted restore must not leave half of a new library installed.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-001 — Crash-safe catalog mutations [complete]
- next-003 — Backup preflight report [complete]

## Start in
- src/lib/videos/persist.ts
- src/lib/videos/store.ts

## Implementation
1. Build on backup preflight and stage incoming data under a temporary restore generation.
2. Switch the active generation only after verification; retain one bounded recovery manifest of the previous generation.
3. Resume or discard an interrupted staging operation and provide explicit rollback before old data is reclaimed.

## Acceptance checks
- [ ] Crash at staging and activation boundaries; reload selects one complete generation.
- [ ] Rollback restores follows, tags, ratings and resume marks together without reopening remote providers.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-005 — Streaming library-pack export
Status: complete
Track: Data durability
Priority: P1

## Problem and intended outcome
Large exports should avoid building multiple full-library JSON strings in memory.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-003 — Backup preflight report [complete]

## Start in
- src/lib/videos/library-pack-stream.ts
- src/lib/videos/pack-stream.ts
- src/components/library/library-pack-transfer.tsx

## Implementation
1. Measure allocations of the existing exporter and define a versioned chunk format compatible with preflight.
2. Read catalog pages into a bounded stream with record counts and a final integrity manifest.
3. Support cancellation and the browser download capabilities already available; keep credentials and temporary media bytes out.

## Acceptance checks
- [ ] Export and restore 100k records with exact IDs and manual signals retained.
- [ ] Cancel halfway and verify scratch buffers release and the incomplete file is rejected as incomplete.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-006 — Cross-tab catalog writer lease
Status: complete
Track: Data durability
Priority: P0

## Problem and intended outcome
Two open tabs can race while pulling, cleaning or importing the same catalog.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-001 — Crash-safe catalog mutations [complete]

## Start in
- src/lib/writer-lease.ts
- src/lib/videos/store.ts
- src/lib/videos/persist.ts
- src/lib/videos/catalog-mutations.ts
- src/components/library/catalog-writer-status.tsx

## Implementation
1. Map shared mutations and introduce a same-origin writer lease with owner generation and expiry.
2. Broadcast compact invalidations after committed writes; rebase readers without shipping whole catalogs.
3. Recover stale leases after a tab crash and surface ownership when a second tab requests mutation.

## Acceptance checks
- [ ] Two isolated tabs cannot apply conflicting cleanup/import transactions simultaneously.
- [ ] Closing the owner releases work after expiry; a delayed old owner cannot commit against a newer lease.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-007 — Deletion and undo tombstones
Status: planned
Track: Data durability
Priority: P1

## Problem and intended outcome
Late provider responses can revive intentionally removed media across sessions.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-001 — Crash-safe catalog mutations [complete]
- next-006 — Cross-tab catalog writer lease [complete]

## Start in
- src/lib/videos/store.ts
- src/lib/videos/persist.ts

## Implementation
1. Audit every remote admission path against removal and existing cleanup suppression.
2. Persist bounded deletion tombstones by canonical identity with reason and explicit restore action.
3. Apply tombstones during pull, backup merge and recovery; distinguish cleanup retirement from deliberate removal.

## Acceptance checks
- [ ] Remove a title while its provider response is held; no late response or reload revives it.
- [ ] Explicit restore clears only the chosen tombstone and retains unrelated saved feedback.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-008 — Backup conflict review
Status: planned
Track: Data durability
Priority: P1

## Problem and intended outcome
Import merging needs explainable choices when two backups disagree about personal metadata.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-003 — Backup preflight report [complete]
- next-004 — Atomic restore with recovery slot [planned]

## Start in
- src/lib/videos/persist.ts
- src/lib/videos/types.ts

## Implementation
1. Define field-level conflict policy for ratings, tags, locks, categories and resume timestamps.
2. Show a bounded review queue with keep-current, use-imported and merge-safe choices; preserve provenance.
3. Journal choices and apply them through the restore transaction path.

## Acceptance checks
- [ ] Opposing manual tags or ratings are never silently overwritten.
- [ ] Interrupted review resumes with identical decisions and deterministic merged output.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-009 — File identity migration ledger
Status: planned
Track: Data durability
Priority: P1

## Problem and intended outcome
Renamed or moved local files need verified identity continuity without guessing by filename.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-001 — Crash-safe catalog mutations [complete]
- next-007 — Deletion and undo tombstones [planned]

## Start in
- src/lib/videos/types.ts
- src/lib/videos/store.ts
- companion/reelcase-companion.mjs

## Implementation
1. Map current path/fingerprint matching and define confidence tiers using approved-root metadata.
2. Present ambiguous matches for review; record approved alias migrations without copying source media.
3. Move personal signals through a journaled identity update and retain reversible alias history.

## Acceptance checks
- [ ] Two files with the same name but different fingerprints never merge automatically.
- [ ] An approved move preserves rating, history and resume across reload; undo restores the prior mapping.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-010 — Portable profile boundaries
Status: planned
Track: Data durability
Priority: P1

## Problem and intended outcome
Optional multiple local profiles require explicit isolation of personal and private state.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-004 — Atomic restore with recovery slot [planned]
- next-006 — Cross-tab catalog writer lease [complete]

## Start in
- src/lib/videos/store.ts
- src/lib/videos/persist.ts

## Implementation
1. Inventory all localStorage and IndexedDB keys and document which may be shared as disposable cache.
2. Implement an opt-in local profile namespace and migration preview for the current profile.
3. Switch profiles only after flushing writers and releasing active detail/provider state; preserve a default profile.

## Acceptance checks
- [ ] Profile A history, private tags and drafts do not appear in Profile B or its exports.
- [ ] Switch during a pending read and confirm no late result writes into the other profile.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-011 — Eight-hour lifecycle soak harness
Status: planned
Track: Performance at scale
Priority: P0

## Problem and intended outcome
Short browser checks cannot reveal slow retention across a full day of use.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- scripts/browser-smoke.mjs

## Implementation
1. Locate the lifecycle owner and existing memory harness; script repeated browse, search, preview, playback and room cycles.
2. Sample heap where supported, DOM nodes, object URLs and active jobs without continuous production instrumentation.
3. Compare warm-cycle plateaus with declared tolerances and save a reproducible report and failure artifacts.

## Acceptance checks
- [ ] An accelerated CI run detects an intentionally leaked listener or object URL.
- [ ] Run the eight-hour variant on an available desktop browser; report missing heap APIs and physical-phone coverage honestly.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-012 — Provider payload allocation budget
Status: complete
Track: Performance at scale
Priority: P0

## Problem and intended outcome
Bounded HTTP bodies can still expand into large parsed and normalized object graphs.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/provider-budgets.ts
- src/lib/remote/provider-json.ts
- src/lib/remote/provider-projection.ts
- src/lib/remote/api.ts
- scripts/provider-allocation-benchmark.mjs

## Implementation
1. Measure raw, parsed and admitted payload sizes for representative YouTube/Twitch pages.
2. Discard unused provider fields before retaining cache entries and avoid duplicate normalization buffers.
3. Add a regression budget for peak intermediate allocations with a documented baseline.

## Acceptance checks
- [ ] Oversized valid metadata is rejected or streamed without losing earlier accepted pages.
- [ ] A 100k-library pull stays within the declared scratch budget and preserves unchanged card references.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-013 — Worker crash recovery
Status: complete
Track: Performance at scale
Priority: P1

## Problem and intended outcome
A terminated search or inference worker must not strand loading state or retain catalog copies.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/search-worker-recovery.tsx
- src/components/library/use-preview-ranking.ts
- src/components/library/use-youtube-ranking.ts
- src/components/library/use-library-stats.ts
- src/components/library/use-adult-browse.ts

## Implementation
1. Find current worker entry points and ownership; add generation-scoped error and timeout handling.
2. Restart once on explicit retry or use a bounded cooperative fallback; cancel superseded jobs.
3. Release old message buffers and show which work failed without clearing saved results.

## Acceptance checks
- [ ] Kill a worker mid-query and verify loading resolves to a clear retry state.
- [ ] Retry returns the correct latest query only and does not duplicate retained indexes.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-014 — IndexedDB cursor backpressure
Status: planned
Track: Performance at scale
Priority: P1

## Problem and intended outcome
Paged hydration should pause when UI admission is busy rather than accumulating unread pages.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [planned]

## Start in
- src/lib/videos/persist.ts
- src/lib/videos/store.ts

## Implementation
1. Trace hydration page production, queue depth and commit cost under slow-device settings.
2. Introduce consumer acknowledgements with a strict pending-page ceiling and cancellation on profile change.
3. Resume from the last committed position without repeating or dropping catalog records.

## Acceptance checks
- [ ] Artificially slow rendering holds pending pages at the configured bound.
- [ ] A 100k-record restore remains complete after pause/resume and a mid-page cancellation.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-015 — Budget expensive recommendation passes
Status: complete
Track: Performance at scale
Priority: P1

## Problem and intended outcome
Recommendation preprocessing needs a measurable CPU budget across multiple open desks.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/ranking-budget.ts
- src/components/library/use-youtube-ranking.ts
- src/components/library/use-twitch-vod-ranking.ts
- src/components/library/performance-scorecard.tsx

## Implementation
1. Measure ranking passes triggered by source, rating and progress changes and identify duplicate work.
2. Coalesce invalidations by input revision; yield between ranking slices and cancel obsolete passes.
3. Expose bounded timing samples in existing diagnostics without retaining full candidate graphs.

## Acceptance checks
- [ ] Rapidly change filters and ratings; only the final revision publishes.
- [ ] A 100k-title fixture keeps interaction latency within a declared baseline and retains ranking correctness.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-016 — Artwork decode cancellation
Status: complete
Track: Performance at scale
Priority: P1

## Problem and intended outcome
Navigation can leave decoded artwork alive after its cards leave the viewport.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/bitmap-pool.ts
- src/lib/videos/thumbs.ts
- src/lib/videos/image-load-budget.ts
- src/lib/videos/thumbnail-queue.ts
- src/components/library/photos-section.tsx

## Implementation
1. Locate image-slot and object-URL owners; distinguish network completion from decode retention.
2. Cancel or release obsolete decode jobs and apply the current low-memory profile to in-flight results.
3. Add lifecycle counters to existing diagnostics without per-image polling.

## Acceptance checks
- [ ] Navigate away while decodes are held; late completion retains no obsolete bitmap or URL.
- [ ] Repeat 100 viewport cycles and show bounded decode jobs and retained artwork entries.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-017 — Large import preview virtualization
Status: complete
Track: Performance at scale
Priority: P1

## Problem and intended outcome
Import review should stay responsive even when every source needs a decision.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/import-session.ts
- src/lib/videos/import-review.ts
- src/components/library/import-review.tsx
- src/components/library/connect-panel.tsx

## Implementation
1. Trace imported creator rows, ambiguity groups and progress rendering at 10k inputs.
2. Virtualize review rows while keeping logical selection, errors and keyboard position stable.
3. Apply decisions in bounded batches and retain pending review state after reload.

## Acceptance checks
- [ ] Review 10k mixed sources without mounting 10k DOM rows.
- [ ] Keyboard navigation, filter changes and reload preserve unresolved decisions and never auto-follow ambiguous identities.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-018 — Page-specific network priority proof
Status: complete
Track: Performance at scale
Priority: P0

## Problem and intended outcome
Foreground priorities need evidence that deferred provider work cannot monopolize the next page.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/pull-priority.ts
- src/lib/pull-control.ts
- src/lib/pull-scheduler.ts
- src/lib/pull-dispatch-trace.ts
- src/components/library/pull-dispatch-panel.tsx
- src/lib/remote/youtube-transport.ts

## Implementation
1. Create deterministic queued/held requests for Live, creator archive, clips and on-demand details.
2. Verify priority changes only affect undispatched work; accepted results must still drain safely.
3. Add a diagnostic trace of queued versus in-flight work and tune starvation limits from measured results.

## Acceptance checks
- [ ] Open Live during a deep archive; a live request starts within the declared dispatch bound.
- [ ] Repeated priority changes do not starve an oldest-due archive forever or bypass a provider cooldown.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-019 — Reduced-data transfer accounting
Status: complete
Track: Performance at scale
Priority: P1

## Problem and intended outcome
Low-bandwidth mode should expose what it actually saves instead of implying all network use stops.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/data-saver.ts
- src/lib/transfer-accounting.ts
- src/lib/videos/image-load-budget.ts
- src/components/library/data-saver-panel.tsx
- src/components/library/settings-section.tsx

## Implementation
1. Classify artwork, metadata, native embeds and Companion transfers with measured or unknown byte totals.
2. Show a bounded session summary and explicit controls for optional prefetches.
3. Keep essential room timing and user-initiated actions functional while optional transfers pause.

## Acceptance checks
- [ ] Save Data suppresses optional artwork/prefetch with no surprise model downloads.
- [ ] Unknown iframe/media bytes are labeled unmeasured; accounting adds no polling or sensitive URL log.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-020 — Performance release artifact comparison
Status: planned
Track: Performance at scale
Priority: P1

## Problem and intended outcome
Performance changes need comparable measurements across builds and data sizes.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-011 — Eight-hour lifecycle soak harness [planned]
- next-012 — Provider payload allocation budget [complete]
- next-014 — IndexedDB cursor backpressure [planned]
- next-015 — Budget expensive recommendation passes [complete]

## Start in
- PERFORMANCE_CHECKS.md
- scripts/browser-smoke.mjs
- src/lib/provider-budgets.ts

## Implementation
1. Define versioned benchmark artifacts with dataset shape, device hints, warm/cold state and measured phases.
2. Compare matching artifacts only and require explicit review for changed thresholds.
3. Add a release command that reports regressions with trace/screenshot links and exit status.

## Acceptance checks
- [ ] Inject a slow or memory-heavy implementation and verify the gate fails.
- [ ] A missing baseline or unavailable metric is reported as unmeasured rather than passed.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-021 — YouTube feed gap repair
Status: complete
Track: YouTube reliability
Priority: P1

## Problem and intended outcome
RSS windows can omit uploads when a creator posts more items than the recent feed retains.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/api.ts
- src/lib/remote/youtube-browse.ts
- src/lib/videos/youtube-feed-gap.ts
- src/lib/videos/recent-pull.ts
- src/components/library/provider-pull-panel.tsx

## Implementation
1. Detect when a previously saved feed watermark is absent without treating a missing watermark as proof of deletion.
2. Offer a bounded gap-repair action using the creator's separate upload continuation; preserve normal archive progress.
3. Show gap, repairing and unresolved states and deduplicate admitted uploads.

## Acceptance checks
- [ ] A fixture with more than 15 intervening uploads recovers the missing range without duplicate cards.
- [ ] A failed repair keeps both old feed evidence and the archive cursor; no unbounded automatic history walk starts.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-022 — YouTube response contract fixtures
Status: complete
Track: YouTube reliability
Priority: P0

## Problem and intended outcome
Public metadata shape changes need explicit detection before a successful empty result is reported.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/api.ts
- src/lib/remote/youtube-live-browse.ts

## Implementation
1. Collect small redacted fixtures of supported feed, browse, continuation and live renderer shapes.
2. Validate required identities/continuations at adapter boundaries and separate valid empty shelves from unreadable payloads.
3. Add a contract fixture runner and a concise unsupported-shape diagnostic.

## Acceptance checks
- [ ] A renamed or missing renderer field fails the adapter contract instead of marking a stream offline.
- [ ] Fixtures contain no account identifiers, cookies or provider secrets and remain small enough for CI.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-023 — YouTube live coverage progress model
Status: complete
Track: YouTube reliability
Priority: P1

## Problem and intended outcome
Large live-check backlogs need clearer throughput and freshness reporting.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/youtube-quick-live.ts
- src/components/library/youtube-live-check-status.tsx

## Implementation
1. Derive checked, due, waiting and unavailable counts from actual creator observations and attempt clocks.
2. Calculate an estimate only after enough recent successful samples; show uncertainty and provider waits separately.
3. Expose a creator-level due list with focused retry and no extra background scans.

## Acceptance checks
- [ ] A mixed 2k-creator fixture reports correct distinct counts without counting failures as successful checks.
- [ ] When throughput stops or cooldown begins, the estimate becomes waiting/unknown instead of promising a completion time.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-024 — YouTube ambiguous negative live evidence
Status: complete
Track: YouTube reliability
Priority: P0

## Problem and intended outcome
Incomplete live listings should not be interpreted as confirmed stream endings.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-022 — YouTube response contract fixtures [complete]

## Start in
- src/lib/remote/youtube-live.ts
- src/lib/videos/live-retention.ts
- src/lib/videos/youtube-live-health.ts

## Implementation
1. Audit each negative path and record its evidence source and observation time.
2. Require a complete relevant catalog observation before entering the existing offline hold; retain unknown states separately.
3. Show why a stream remains provisionally live and offer a bounded recheck.

## Acceptance checks
- [ ] Consent, malformed and partial responses never start a confirmed-offline timer.
- [ ] A genuine complete negative ages through the existing hold and recovers immediately on fresh positive evidence.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-025 — YouTube upcoming event transitions
Status: complete
Track: YouTube reliability
Priority: P1

## Problem and intended outcome
Scheduled broadcasts need a distinct path into live, postponed or completed states.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-023 — YouTube live coverage progress model [complete]
- next-024 — YouTube ambiguous negative live evidence [complete]

## Start in
- src/lib/remote/youtube-live.ts
- src/lib/videos/youtube-events.ts
- src/components/library/youtube-upcoming.tsx

## Implementation
1. Model upcoming identity, scheduled time, last observation and uncertainty separately from live viewers.
2. Schedule bounded checks near a known start while preserving fairness for ordinary creators.
3. Handle changed start times and completed events without notification duplication.

## Acceptance checks
- [ ] A postponed event never appears live merely because its scheduled time passed.
- [ ] Upcoming → live → completed retains one canonical video and emits at most one live announcement.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-026 — Playlist membership reconciliation
Status: complete
Track: YouTube reliability
Priority: P1

## Problem and intended outcome
Playlist edits need to update membership without deleting the underlying saved video.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-022 — YouTube response contract fixtures [complete]

## Start in
- src/lib/remote/api.ts
- src/lib/videos/youtube-playlist-walk.ts
- src/lib/videos/store.ts
- src/components/library/playlist-reconciliation.tsx

## Implementation
1. Separate canonical video identity from playlist membership/order and record whether a playlist walk completed.
2. Diff membership only after a complete traversal; show partial walks as provisional.
3. Retain favorites/history and other source memberships when an item leaves one playlist.

## Acceptance checks
- [ ] A removed playlist item stays available through another source and keeps all personal feedback.
- [ ] Interrupted playlist pagination never removes unobserved tail memberships.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-027 — YouTube publication uncertainty
Status: complete
Track: YouTube reliability
Priority: P1

## Problem and intended outcome
Approximate upload dates should not be presented as exact timestamps.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/youtube-publication.ts
- src/lib/videos/youtube-metadata.ts

## Implementation
1. Audit current date sources and represent exact, approximate and unknown evidence without rewriting user locks.
2. Show precision/source in details and define stable ordering when date ranges overlap.
3. Repair dates only from a matching canonical video and preserve provenance through reload/export.

## Acceptance checks
- [ ] Relative dates and upcoming times cannot overwrite a known exact publication date.
- [ ] Unknown dates remain visibly unknown and sorting is stable across time zones and reloads.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-028 — YouTube embed failure triage
Status: complete
Track: YouTube reliability
Priority: P1

## Problem and intended outcome
An unavailable embed needs a precise recovery action without promising a bypass.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-player-recovery.ts
- src/components/library/watch-room-section.tsx

## Implementation
1. Map observed player error codes, origin/setup failures and device autoplay states to distinct explanations.
2. Provide official Watch on YouTube and device-local retry actions while keeping room playback unchanged.
3. Record bounded per-title error evidence without probing restricted content or downloading media automatically.

## Acceptance checks
- [ ] A non-embeddable title does not trigger repeated room seeks, reload loops or false permission changes.
- [ ] Two clients can continue chat/queue while one uses the official external link; no age or access restriction is bypassed.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-029 — YouTube endpoint-specific recovery guidance
Status: complete
Track: YouTube reliability
Priority: P1

## Problem and intended outcome
Feed, browse and HTML failures need targeted recovery instead of a generic channel failure.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-022 — YouTube response contract fixtures [complete]

## Start in
- src/lib/remote/youtube-transport.ts
- src/lib/videos/youtube-recovery.ts
- src/components/library/provider-pull-panel.tsx

## Implementation
1. Expose which endpoint lane failed, its last success and the effective retry deadline.
2. Offer only actions that use healthy lanes or explicitly retry the affected creator.
3. Keep provider-wide network blocks distinct from endpoint-specific failures and preserve cooldown revisions.

## Acceptance checks
- [ ] A feed-only hold leaves a healthy archive/live path available without clearing the hold.
- [ ] A global challenge blocks all affected queued requests and the UI states the actual wait.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-030 — YouTube adaptive discovery allocation
Status: complete
Track: YouTube reliability
Priority: P1

## Problem and intended outcome
Discovery allocation should respond to backlog age without repeatedly favoring known-live creators.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-023 — YouTube live coverage progress model [complete]
- next-024 — YouTube ambiguous negative live evidence [complete]

## Start in
- src/lib/videos/youtube-quick-live.ts
- src/lib/videos/youtube-live-allocation.ts
- src/components/library/youtube-live-allocation-panel.tsx
- src/lib/remote/youtube-sweep.ts

## Implementation
1. Measure oldest-due age and successful throughput for known-live and discovery classes.
2. Implement a bounded weighted policy with a minimum discovery share and no new request concurrency.
3. Expose allocation reasons in diagnostics and test policy under slow/failing prefixes.

## Acceptance checks
- [ ] A 2k-creator mixed fixture reaches every eligible tail creator within a declared simulated bound.
- [ ] Frequent live observations cannot consume all slots; provider cooldowns and manual pause still win.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-031 — Clip coverage evidence panel
Status: complete
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
Clip pulls expose totals but not why a requested clip count was not reached.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/twitch-clips.ts
- src/components/library/twitch-clips-control.tsx

## Implementation
1. Render existing per-window diagnostics with requested quota, accepted count, duplicates and stop reason.
2. Distinguish sparse/exhausted windows, page-budget stops, partial failures and warm cache hits.
3. Provide a focused next action without claiming public highlight shelves are exhaustive.

## Acceptance checks
- [ ] A sparse, duplicate-heavy and rate-limited fixture each produces a different accurate explanation.
- [ ] Opening diagnostics triggers no provider read and retains at most the current bounded snapshot.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-032 — Clip observation freshness audit
Status: complete
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
Recent clip refreshes need proof that cached observations never masquerade as new provider checks.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/api.ts
- src/lib/videos/twitch-clip-refresh.ts
- src/lib/videos/follow-checkpoints.ts

## Implementation
1. Trace recent cache hits, attempt clocks and successful observation clocks through storage and UI.
2. Expose checked-at versus attempted-at and let an explicit fresh read invalidate only its clip cache key.
3. Keep metadata merges from older observations from rewinding views or publication evidence.

## Acceptance checks
- [ ] A warm retry advances the attempt clock while retaining the original observation time.
- [ ] A held older response cannot replace fresher clip metrics or clear a newer retry deadline.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-033 — Twitch creator pull policies
Status: complete
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
A 600-follow library needs per-creator choices beyond one global refresh budget.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/twitch-refresh-selection.ts
- src/components/library/follow-manager.tsx

## Implementation
1. Add optional per-creator clip/VOD inclusion and a bounded priority tier with a documented default migration.
2. Apply policies to automatic selection while keeping manual selected-creator actions explicit.
3. Show skipped-by-policy separately from failed or not-yet-checked creators.

## Acceptance checks
- [ ] Disabling clips for one creator does not suppress its live check or VOD history.
- [ ] Low-priority creators still rotate when enabled; importing old follows preserves current behavior.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-034 — Twitch channel rename evidence
Status: planned
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
Renamed channels should keep their history only when a stable Twitch identity proves continuity.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-009 — File identity migration ledger [planned]

## Start in
- src/lib/remote/api.ts
- src/lib/videos/store.ts
- src/components/library/follow-manager.tsx

## Implementation
1. Compare resolved stable user IDs before treating a new login as an existing creator.
2. Offer a reviewable alias update and migrate source references through the identity journal.
3. Retain old bookmarks as aliases while detecting a recycled login belonging to another user.

## Acceptance checks
- [ ] A renamed stable user retains VODs, clips, ratings and live policy.
- [ ] A reused login with a different user ID remains separate and cannot inherit personal signals silently.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-035 — Expired Twitch media recovery
Status: planned
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
Expired VODs and removed clips need a non-destructive unavailable workflow.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-007 — Deletion and undo tombstones [planned]

## Start in
- src/lib/videos/store.ts
- src/components/library/pre-video.tsx

## Implementation
1. Record verified unavailability separately from temporary fetch/embed errors.
2. Provide a scoped review queue to hide, retain as a bookmark or explicitly remove unavailable media.
3. Preserve favorites, ratings and notes and avoid automatically rechecking the entire library.

## Acceptance checks
- [ ] A transient 503 never marks a saved VOD permanently expired.
- [ ] A confirmed removed clip remains recoverable with its personal signals after reload and backup.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-036 — Twitch media identity aliases
Status: complete
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
Alternate clip URLs and slug/id representations can create duplicate cards.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-001 — Crash-safe catalog mutations [complete]

## Start in
- src/lib/videos/twitch-identity.ts
- src/lib/videos/catalog-identity.ts
- src/lib/videos/remote-merge.ts
- src/lib/remote/api.ts
- src/lib/videos/types.ts
- src/lib/videos/store.ts
- src/lib/multiplayer/room-media.ts

## Implementation
1. Enumerate supported Twitch clip/VOD URL forms and derive canonical typed identities.
2. Record verified slug/id aliases and merge duplicate source memberships without losing manual metadata.
3. Apply identity normalization consistently to imports, room links and archive admissions.

## Acceptance checks
- [ ] Different official URLs for one clip yield one saved card and one room queue identity.
- [ ] Distinct clips with similar titles or recycled display names never merge.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-037 — Twitch VOD chapter context
Status: complete
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
Long VODs need useful game/chapter context without making routine pulls heavier.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/twitch-chapters.ts
- src/lib/remote/api.ts
- src/components/library/twitch-chapters.tsx
- docs/TWITCH_CHAPTERS_AND_CANARY.md

## Implementation
1. Verify a permitted public metadata source for VOD chapter/game segments before implementing an adapter.
2. Load segments only on explicit detail expansion and cache a bounded selected-VOD record.
3. Offer timestamp navigation when the player supports it and a truthful external fallback otherwise.

## Acceptance checks
- [ ] No chapter requests occur during routine live/clip pulls.
- [ ] A VOD with missing or malformed segments remains playable with no invented chapters.

## External requirement
A usable public segment source must be verified; document unsupported provider access rather than inventing data.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-038 — Twitch live batch fault isolation
Status: complete
Track: Twitch depth and coverage
Priority: P0

## Problem and intended outcome
One bad alias or response field should not invalidate a healthy multi-channel live batch.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/twitch-live-batch.ts
- src/lib/videos/twitch-quick-live.ts

## Implementation
1. Add mixed fixtures with null users, field errors, service failures and valid live/offline siblings.
2. Map errors to the exact creator and distinguish whole-request failure from a partial response.
3. Commit healthy observations immediately and assign retries only where evidence failed.

## Acceptance checks
- [ ] A single malformed user in a 100-target batch leaves all valid sibling viewer counts current.
- [ ] A transport failure preserves previous observations for every affected creator and does not assert offline.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-039 — Twitch content type precision
Status: complete
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
Clips, highlights, uploads and past broadcasts need explicit provider-backed classification.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/api.ts
- src/lib/videos/types.ts
- src/components/library/library-app.tsx

## Implementation
1. Carry the queried broadcast shelf and canonical media type through normalization and persistence.
2. Expose filters and labels without relying on duration or title guesses.
3. Preserve type provenance during shallow refreshes and resolve old unknown rows only from exact evidence.

## Acceptance checks
- [ ] A short VOD is never classified as a clip and a long clip retains its clip identity.
- [ ] Mixed archive pages preserve the correct type after reload, export and recommendation ranking.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-040 — Twitch pull canary runner
Status: complete
Track: Twitch depth and coverage
Priority: P1

## Problem and intended outcome
Public Twitch changes need a small reproducible real-network check separate from synthetic tests.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-031 — Clip coverage evidence panel [complete]
- next-038 — Twitch live batch fault isolation [complete]
- next-039 — Twitch content type precision [complete]

## Start in
- scripts/twitch-canary.mjs
- scripts/twitch-canary-core.mjs
- src/lib/remote/api.ts
- docs/TWITCH_CHAPTERS_AND_CANARY.md

## Implementation
1. Add an explicit command accepting a small caller-supplied public creator list and a strict request ceiling.
2. Report clip/VOD/live contracts, paging stop reasons, status codes and timing without cookies or account data.
3. Keep rate-limited runs resumable and exclude this command from ordinary page startup and CI by default.

## Acceptance checks
- [ ] A controlled fake provider proves the request cap and redacted report shape.
- [ ] Run against available public creators and clearly label failed/unavailable checks; never translate an unrun canary into a pass.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-041 — Watch Room connection state timeline
Status: complete
Track: Watch Together collaboration
Priority: P1

## Problem and intended outcome
Guests need a clear distinction between signaling, transport and player readiness.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-connection-timeline.ts
- src/components/library/room-connection-panel.tsx
- src/lib/multiplayer/p2p.ts
- src/lib/multiplayer/room-delivery.ts

## Implementation
1. Derive a bounded connection timeline from actual signaling, ICE, room handshake and player events.
2. Show the last successful stage and an appropriate retry that does not reset a healthy room.
3. Export a redacted diagnostic excluding invitations, credentials, local paths and private catalog data.

## Acceptance checks
- [ ] Simulate failure at each stage and verify a distinct state and recovery action.
- [ ] A slow player cannot be reported as a disconnected peer, and retry preserves the queue.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-042 — Room transport congestion control
Status: complete
Track: Watch Together collaboration
Priority: P0

## Problem and intended outcome
Queue/search payloads can compete with timing and chat on a slow data channel.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-outbox.ts
- src/lib/multiplayer/p2p.ts
- src/components/library/room-queue-delivery-panel.tsx

## Implementation
1. Measure bufferedAmount and classify timing, chat and bulk catalog packets.
2. Bound queued bytes, coalesce obsolete timing packets and pace catalog pages behind transport backpressure.
3. Retain acknowledgements and define recovery when a bulk transfer is interrupted.

## Acceptance checks
- [ ] A throttled three-client fixture keeps chat and pause responsive during catalog paging.
- [ ] Queued bytes remain bounded and interrupted pages retry without duplicate queue mutations.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-043 — Guest catalog privacy review
Status: complete
Track: Watch Together collaboration
Priority: P0

## Problem and intended outcome
Host-library sharing needs granular visibility beyond a single broad permission.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-catalog-policy.ts
- src/components/library/room-catalog-sharing.tsx
- src/components/library/use-room-host-catalog.ts

## Implementation
1. Review every host catalog field sent to peers and define explicit shareable source/collection scopes.
2. Preview guest-visible titles before enabling a scope; exclude private/adult/local-path metadata by default.
3. Revoke scope visibility immediately and invalidate pending search pages by permission revision.

## Acceptance checks
- [ ] A guest cannot receive an excluded title via search, pagination, stale request or queue suggestion.
- [ ] Revocation during a held response prevents delivery while preserving current authorized playback.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-044 — Per-guest playback readiness
Status: complete
Track: Watch Together collaboration
Priority: P1

## Problem and intended outcome
Room readiness should distinguish a participant's vote from actual media readiness.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-participation.ts
- src/components/library/watch-room-section.tsx

## Implementation
1. Keep manual Ready separate from local player loading, autoplay block and observed playback.
2. Send only bounded capability/readiness changes, not continuous player telemetry.
3. Show host actions for waiting participants without automatically forcing every guest to play.

## Acceptance checks
- [ ] A manually ready guest with blocked autoplay is visibly distinguishable from a playing guest.
- [ ] Repeated readiness events do not grow history, trigger seeks or bypass host permissions.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-045 — Live latency guidance
Status: complete
Track: Watch Together collaboration
Priority: P1

## Problem and intended outcome
Live providers cannot promise exact synchronization when ads and DVR windows differ.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-provider-clock.ts
- src/components/library/room-live-guidance.tsx
- src/components/library/watch-room-section.tsx

## Implementation
1. Represent live independent-clock and DVR-capable modes explicitly using observed capabilities.
2. Show device-local catch-up and latency guidance without endless corrective seeks.
3. Separate ad/buffering uncertainty from confirmed shared pause state.

## Acceptance checks
- [ ] A guest in an ad or independent live feed never causes a room-wide seek loop.
- [ ] DVR seeking is offered only when supported, and current playback remains stable after reload.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-046 — Room role presets
Status: complete
Track: Watch Together collaboration
Priority: P1

## Problem and intended outcome
Host permissions need understandable presets with server/host enforcement preserved.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-playback-access.ts
- src/lib/multiplayer/room-roles.ts
- src/components/library/room-role-presets.tsx
- src/components/library/watch-room-section.tsx

## Implementation
1. Define named viewer, contributor and co-controller presets over existing independent permissions.
2. Preview changes and allow custom combinations without silently granting local-library access.
3. Enforce the effective permissions on every incoming operation and acknowledge rejected actions.

## Acceptance checks
- [ ] Switch roles while requests are in flight; stale privileges cannot authorize a later mutation.
- [ ] Keyboard and mobile controls reflect the preset while host-enforced validation remains authoritative.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-047 — Session playlist handoff file
Status: complete
Track: Watch Together collaboration
Priority: P1

## Problem and intended outcome
A room should export a useful public playback plan without exposing private room state.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-playlists.ts
- src/lib/multiplayer/room-watch-history.ts

## Implementation
1. Define a versioned public-only session file with played/current/upcoming identities and known runtimes.
2. Preview duplicates, unavailable providers and queue capacity before importing into an existing room.
3. Apply imported upcoming items as one undoable host-approved operation; never restore autoplay.

## Acceptance checks
- [ ] Export omits invitation tokens, peer names, local paths and unmatched file identities.
- [ ] Re-import retains current playback and deduplicates canonical public links.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-048 — Reconnect queue intent reconciliation
Status: complete
Track: Watch Together collaboration
Priority: P1

## Problem and intended outcome
Guests need clear receipts when disconnecting during an edit rather than guessing whether it applied.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-delivery.ts
- src/components/library/use-room-queue-delivery.ts
- src/components/library/room-queue-delivery-panel.tsx

## Implementation
1. Track bounded pending intents with stable operation IDs and the last host-confirmed revision.
2. After reconnect, query receipts before retrying a mutation; show applied, superseded or rejected outcomes.
3. Expire orphaned intents and keep local draft text separate from confirmed room state.

## Acceptance checks
- [ ] Disconnect after host apply but before receipt; retry changes the queue exactly once.
- [ ] A removed or consumed title cannot reappear through a delayed reconnect intent.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-049 — Provider-independent subtitles
Status: complete
Track: Watch Together collaboration
Priority: P1

## Problem and intended outcome
Room participants need a device-local subtitle preference where provider APIs permit it.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/multiplayer/room-device-captions.ts
- src/components/library/room-device-captions.tsx
- src/components/library/room-stream-player.tsx
- src/components/library/watch-room-section.tsx

## Implementation
1. Inventory local-video tracks and supported YouTube/Twitch caption controls without proxying media.
2. Expose per-device caption/language choices and clear unsupported-provider guidance.
3. Preserve a local preference without broadcasting personal accessibility choices to peers.

## Acceptance checks
- [ ] Changing captions on a guest never pauses or changes the host's player.
- [ ] Missing tracks and unsupported embeds show an honest fallback and preserve keyboard focus.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-050 — Room accessibility audit protocol
Status: complete
Track: Watch Together collaboration
Priority: P1

## Problem and intended outcome
Complex room changes need repeatable assistive-technology verification beyond layout screenshots.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-041 — Watch Room connection state timeline [complete]
- next-044 — Per-guest playback readiness [complete]
- next-046 — Room role presets [complete]

## Start in
- docs/ACCESSIBILITY_STATUS_AND_FOCUS.md
- src/components/library/use-room-list-focus.ts
- src/components/library/room-queue-panel.tsx
- src/components/library/room-suggestions-panel.tsx
- scripts/watch-room-roles-timeline-check.mjs

## Implementation
1. Document named regions, announcement priorities and focus ownership for queue/chat/dialog changes.
2. Add automated keyboard checks for suggestion review, reconnect errors and player recovery.
3. Run available screen-reader checks and record exact browser/tool coverage and remaining physical-device requirements.

## Acceptance checks
- [ ] Queue updates announce useful summaries without repeating every timing heartbeat.
- [ ] Focus survives a consumed title, dismissed dialog and reconnect; unperformed screen-reader checks remain unverified.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-051 — Recommendation evaluation dataset
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Ranking improvements need a stable relevance benchmark instead of subjective spot checks.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/recommendations.ts
- src/lib/videos/twitch-recommendations.ts

## Implementation
1. Create a small synthetic corpus with explicit creator, topic, freshness and negative-feedback judgments.
2. Define relevance, diversity and repeat-exposure metrics with interpretable expected rankings.
3. Run current ranking as a baseline and save versioned score artifacts before changing weights.

## Acceptance checks
- [ ] The benchmark catches a ranking that boosts operational tags or repeats one creator everywhere.
- [ ] Report per-source metrics and missing judgments without presenting synthetic scores as user satisfaction.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-052 — Explicit recommendation rejection reasons
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Disliking a title, creator or topic should have different reversible effects.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]

## Start in
- src/lib/recommendations.ts
- src/components/library/pre-video.tsx

## Implementation
1. Add opt-in not-interested reasons scoped to this title, creator or topic with an undo path.
2. Persist bounded negative evidence separately from unavailable/hidden state and explain its ranking effect.
3. Apply negatives without overriding explicit favorites or leaking private preferences into room packets.

## Acceptance checks
- [ ] Rejecting one title does not silently suppress every title by the creator.
- [ ] Undo and backup restore recover the previous ranking inputs exactly.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-053 — Recommendation exposure ledger
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Unopened repeated recommendations need measured exposure decay rather than permanent exclusion.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]

## Start in
- src/lib/recommendations.ts
- src/lib/videos/persist.ts

## Implementation
1. Define exposure only for genuinely visible cards using existing viewport infrastructure.
2. Coalesce bounded exposure writes away from scrolling and separate impressions from opens/likes.
3. Add transparent decay with a reset option and no hidden tracking outside this local app.

## Acceptance checks
- [ ] Offscreen, minimized and immediately skipped cards do not accumulate exposure.
- [ ] A long browse session retains a capped ledger and fresh preferences can still promote an exposed favorite.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-054 — Topic alias review workflow
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Synonyms and misspellings need review without collapsing unrelated topics.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]

## Start in
- src/lib/videos/topics.ts
- src/lib/videos/topic-rules.ts
- src/components/library/use-topic-catalog.ts

## Implementation
1. Detect candidate aliases from current taxonomy and show supporting source/title counts.
2. Require explicit approval for ambiguous merges and retain reversible alias provenance.
3. Rebuild only affected topic postings and preserve locked/manual labels.

## Acceptance checks
- [ ] A reviewed spelling alias joins search and recommendations across reload.
- [ ] Ambiguous short names remain separate; undo restores distinct counts and manual tags.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-055 — Tag recommendation confidence
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Inferred tags need calibrated confidence and evidence rather than a flat suggestion list.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]
- next-054 — Topic alias review workflow [complete]

## Start in
- src/lib/videos/youtube-metadata.ts
- src/lib/videos/topic-rules.ts

## Implementation
1. Separate creator keywords, title phrases, chapters and description evidence using existing provenance.
2. Score confidence against a labeled fixture set and show the evidence source for each candidate.
3. Keep low-confidence suggestions review-only and preserve user locks during asynchronous acceptance.

## Acceptance checks
- [ ] Promotional or unrelated description text cannot become a high-confidence interest tag.
- [ ] Editing a tag while suggestions load preserves the manual value and records accepted evidence.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-056 — AI Guide grounded explanation
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Guide suggestions need traceable reasons and a useful no-evidence state.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]
- next-052 — Explicit recommendation rejection reasons [complete]
- next-055 — Tag recommendation confidence [complete]

## Start in
- src/lib/recommendations.ts
- src/components/library/ai-guide.tsx

## Implementation
1. Inspect current guide inputs and require saved tag/title/feedback evidence for each recommendation reason.
2. Display concise matching evidence and separate deterministic ranking from optional model wording.
3. Offer reason-specific feedback and a cold-start topic chooser when evidence is sparse.

## Acceptance checks
- [ ] A recommendation cites real matching fields and never invents watched history or creator facts.
- [ ] Empty, private-only and contradictory signal fixtures produce safe, understandable alternatives.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-057 — Recommendation session tuning
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Users need temporary discovery controls without permanently rewriting their taste profile.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]
- next-053 — Recommendation exposure ledger [complete]

## Start in
- src/lib/recommendations.ts
- src/components/library/library-app.tsx

## Implementation
1. Add device-session controls for familiar versus exploratory, length and provider mix using existing ranking stages.
2. Keep these inputs separate from saved likes/tags and show an explicit reset.
3. Recompute cooperatively with cancellation and stable visible-card focus.

## Acceptance checks
- [ ] Switching session mix changes eligible candidates without changing persistent likes or ratings.
- [ ] Reload/reset behavior is documented and a 100k corpus avoids synchronous full ranking in render.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-058 — Cross-source topic bridge audit
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
A cross-source match needs meaningful shared topics rather than coincidental creator/source labels.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]
- next-054 — Topic alias review workflow [complete]

## Start in
- src/lib/recommendations.ts
- src/lib/videos/topics.ts

## Implementation
1. Build fixtures for local, YouTube, Twitch and photo candidates with true and false topic bridges.
2. Require source-aware content evidence and exclude operational and private-only labels from public bridges.
3. Show which topic connected a candidate and allow bridge suppression without deleting tags.

## Acceptance checks
- [ ] Matching by provider name, date or filename extension never creates a taste bridge.
- [ ] A saved content topic bridges legitimate sources while respecting adult/private isolation.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-059 — Recommendation fairness report
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Creator/provider diversity needs a diagnostic of actual output distributions.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]
- next-057 — Recommendation session tuning [complete]
- next-058 — Cross-source topic bridge audit [complete]

## Start in
- src/lib/recommendations.ts
- src/components/library/stats-section.tsx

## Implementation
1. Calculate bounded output summaries for creator share, provider share, novelty and repeated titles.
2. Compare declared diversity policy with actual top shelves and expose explanation for unavoidable concentration.
3. Export aggregate metrics without private titles unless the user explicitly chooses them.

## Acceptance checks
- [ ] A single-source library is not falsely labeled unfair for lacking other providers.
- [ ] A multi-source fixture detects one creator dominating beyond configured policy without altering saved preferences.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-060 — Feedback experiment replay
Status: complete
Track: Recommendations and topics
Priority: P1

## Problem and intended outcome
Ranking changes should be replayable against the same saved evidence before rollout.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-051 — Recommendation evaluation dataset [complete]
- next-059 — Recommendation fairness report [complete]

## Start in
- src/lib/recommendations.ts
- src/components/library/stats-section.tsx

## Implementation
1. Create a read-only replay runner over a bounded anonymized signal snapshot and candidate corpus.
2. Compare current versus proposed weights with the evaluation metrics and top-change explanations.
3. Require explicit acceptance to change a local ranking preset; preserve the previous preset for rollback.

## Acceptance checks
- [ ] Previewing an experiment writes no real likes, history, exposure or tags.
- [ ] The same snapshot and preset yield deterministic metrics and a reversible accepted change.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-061 — Film identity review
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Movie membership needs a verified identity workflow for ambiguous titles and remakes.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/movie-catalog.ts
- src/lib/videos/movie-selection.ts

## Implementation
1. Add reviewable title/year/runtime identity candidates using local evidence and an optional permitted metadata source.
2. Keep confidence and origin visible; require selection when remakes or similarly named films conflict.
3. Store identity separately from display title and preserve manual corrections through refresh.

## Acceptance checks
- [ ] Two remakes with the same title stay distinct and an unverified candidate is never labeled confirmed.
- [ ] Changing identity updates film shelves without rewriting locked filenames or personal feedback.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-062 — Movie cuts and editions
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Different cuts or resolutions of one film should be grouped without discarding copies.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-009 — File identity migration ledger [planned]
- next-061 — Film identity review [complete]

## Start in
- src/lib/videos/movie-catalog.ts
- src/lib/videos/types.ts

## Implementation
1. Recognize explicit edition tokens and represent a film with multiple owned/source versions.
2. Offer preferred-version selection using verified runtime/source availability rather than file-size guesses.
3. Keep resume/progress per version and a reversible group choice.

## Acceptance checks
- [ ] Theatrical and extended cuts retain separate resume marks and file links.
- [ ] A group action never deletes a duplicate-looking source and ungroup restores the original cards.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-063 — Movie metadata provenance review
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Film posters and release data need safe correction when an external match is wrong.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-061 — Film identity review [complete]

## Start in
- src/lib/videos/movie-catalog.ts
- src/components/library/pre-video.tsx

## Implementation
1. Expose each film field's source/confidence and the current manual lock state.
2. Preview an alternate metadata match before applying selected fields only.
3. Retain prior metadata for undo and avoid automatically downloading large artwork sets.

## Acceptance checks
- [ ] Correcting a poster cannot overwrite a locked title, year or category.
- [ ] A failed metadata request leaves the previous confirmed film visible and usable.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-064 — Anime series identity review
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Release names alone cannot reliably distinguish sequels, remakes and alternate numbering.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/videos/anime-title.ts
- src/lib/videos/anime-catalog.ts

## Implementation
1. Add explicit local series identities and review ambiguous parsed series/season candidates.
2. Support aliases and absolute-versus-season numbering without requiring an external account.
3. Keep parsing evidence visible and reversible before grouping saved episodes.

## Acceptance checks
- [ ] Two remakes or sequel series with similar names remain distinct until approved.
- [ ] A reviewed identity survives filename variation, refresh and backup import without losing episode progress.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-065 — Anime episode gap map
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Series browsing should show known missing episodes without inventing a complete release schedule.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-064 — Anime series identity review [complete]

## Start in
- src/lib/videos/anime-catalog.ts
- src/lib/videos/anime-title.ts

## Implementation
1. Compute gaps only within observed or explicitly entered season ranges.
2. Show duplicate versions, specials and unresolved episode numbers separately from confirmed missing slots.
3. Link each slot to owned playable versions while keeping natural episode order.

## Acceptance checks
- [ ] Episodes 1, 2 and 4 show a bounded gap at 3 without inventing episodes after 4.
- [ ] Specials and absolute numbering cannot create hundreds of false gaps; ambiguous data remains unverified.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-066 — Anime next-episode policy
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Continue watching needs a user-controlled next-episode choice across specials and multiple versions.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-064 — Anime series identity review [complete]
- next-065 — Anime episode gap map [complete]

## Start in
- src/lib/videos/anime-catalog.ts
- src/lib/videos/store.ts

## Implementation
1. Resolve the next confirmed episode from series identity, season order and completion threshold.
2. Preview skips over missing episodes and keep specials/OVAs opt-in.
3. Launch only on an explicit action or existing permitted autoplay preference; preserve version-specific resume.

## Acceptance checks
- [ ] Completing episode 2 recommends 3 when present and explains a skip when absent.
- [ ] A special or alternate version cannot unexpectedly autoplay as the next numbered episode.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-067 — Adult provider capability registry
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Adult sources need explicit supported media/search/live capabilities and honest unsupported states.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/remote/api.ts
- src/lib/remote/live-rooms.ts

## Implementation
1. Inventory existing permitted adapters and define capabilities for video, photos, tags, paging and live embeds.
2. Drive source controls from declared capabilities rather than offering nonfunctional generic actions.
3. Keep 18+ isolation and official external fallback for providers without permitted in-app players.

## Acceptance checks
- [ ] Unsupported search/embed options are absent or clearly explained for the affected provider.
- [ ] Changing a capability does not expose private saved cards or enable new scraping behavior.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-068 — Adult pull quality fixtures
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Provider-specific metadata regressions need source-by-source quality evidence.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-067 — Adult provider capability registry [complete]

## Start in
- src/lib/remote/api.ts
- src/lib/videos/topic-rules.ts

## Implementation
1. Create redacted fixtures for each existing permitted adapter, covering IDs, titles, dates, thumbnails and cursors.
2. Measure missing-field and duplicate rates without fetching private accounts or bypassing access restrictions.
3. Add targeted adapter diagnostics and preserve the last healthy result on malformed pages.

## Acceptance checks
- [ ] A malformed provider payload cannot be interpreted as an empty exhausted catalog.
- [ ] Unknown publication dates remain unknown and failures affect only the relevant source.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-069 — Private recommendation isolation audit
Status: complete
Track: Film, anime and private media
Priority: P0

## Problem and intended outcome
Private labels and viewing signals need proof they cannot influence public sharing surfaces.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-043 — Guest catalog privacy review [complete]
- next-058 — Cross-source topic bridge audit [complete]
- next-067 — Adult provider capability registry [complete]

## Start in
- src/lib/videos/public-visibility.ts
- src/lib/videos/guide-picks.ts
- src/lib/videos/topic-postings.ts
- src/lib/multiplayer/room-catalog-policy.ts

## Implementation
1. Map private/adult signals through Home, topics, guide reasons, exports and room discovery.
2. Define an explicit boundary for local private recommendations versus public descriptors.
3. Add adversarial mixed-catalog fixtures and redacted diagnostic assertions.

## Acceptance checks
- [ ] A public room, ordinary export preview and public recommendation reason reveal no private title or label.
- [ ] Unlocking the private section changes only explicitly private surfaces and does not relax guest visibility.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-070 — Saved provider login guidance
Status: complete
Track: Film, anime and private media
Priority: P2

## Problem and intended outcome
Embedded-site login failures need consistent first-party recovery without credential handling.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-067 — Adult provider capability registry [complete]

## Start in
- src/lib/videos/official-room.ts
- src/components/library/official-room-player.tsx

## Implementation
1. Audit official provider panels and centralize first-party login guidance and remembered external/embedded choices.
2. Explain browser cookie/session boundaries and provide safe top-level links and selectable URL fallback.
3. Never read/export credentials or cookies, weaken browser protections or claim external login authenticates an iframe.

## Acceptance checks
- [ ] A login-loop recovery unloads the affected embed and retains the chosen official URL after reload.
- [ ] Restricted embeds remain unsupported and the app does not proxy authentication or clear unrelated site data.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-071 — Companion protocol negotiation
Status: complete
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
Browser and Companion version drift needs actionable capability negotiation.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/companion-protocol.ts
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- companion/reelcase-companion.mjs

## Implementation
1. Define a versioned capability response for file, download, artwork, print and launch operations.
2. Gate each browser control by negotiated capability while retaining older supported Companion versions.
3. Show minimum-version guidance for missing features without disabling unrelated working features.

## Acceptance checks
- [ ] An older Companion can still serve supported file operations while newer controls remain unavailable.
- [ ] Unknown capability fields are ignored safely and incompatible major versions fail with a clear reason.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-072 — Companion task queue recovery
Status: complete
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
Long local jobs need durable outcomes when the browser or Companion restarts.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]

## Start in
- companion/download-manager.mjs
- src/components/library/companion-recovery-panel.tsx
- src/components/library/youtube-download-dialog.tsx
- docs/COMPANION_PROTOCOL_AND_RECOVERY.md

## Implementation
1. Inventory existing job persistence and introduce bounded idempotent task receipts where absent.
2. Recover queued/running/interrupted states without re-launching completed external actions.
3. Expose resume/cancel for supported job types and a read-only history with clear retention.

## Acceptance checks
- [ ] Restart during a download or scan; completed files are not downloaded again without user intent.
- [ ] Cancelled/interrupted jobs cannot be reported complete and receipts contain no secret headers.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-073 — Approved-root change audit
Status: complete
Track: Desktop and local workflows
Priority: P0

## Problem and intended outcome
Root permission changes need immediate enforcement for queued and active Companion operations.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]

## Start in
- companion/root-authority.mjs
- companion/download-manager.mjs
- companion/reelcase-companion.mjs
- src/components/library/root-access-panel.tsx

## Implementation
1. Trace approved-root checks at enqueue, traversal, file-open and final write boundaries.
2. Revalidate canonical paths and root generation after symlink/junction or permission changes.
3. Stop affected queued work and report denied paths without broad disk enumeration.

## Acceptance checks
- [ ] Revoke a root during a held operation; no later read/write escapes the remaining approved roots.
- [ ] Traversal, junction and renamed-root fixtures are denied while normal approved files remain usable.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-074 — Local media health remediation
Status: planned
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
Disconnected files need grouped repair actions with verified matching and no destructive guesses.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-009 — File identity migration ledger [planned]
- next-073 — Approved-root change audit [complete]

## Start in
- src/lib/videos/local-runtime.ts
- src/lib/videos/store.ts
- companion/reelcase-companion.mjs

## Implementation
1. Group unavailable local entries by approved source and distinguish missing permission from missing files.
2. Offer reconnect, rescan selected folder and reviewed identity match using the migration ledger.
3. Update only verified matches and preserve bookmarks for unresolved entries.

## Acceptance checks
- [ ] A disconnected drive is never treated as proof that all its files were deleted.
- [ ] A reviewed reconnect restores playback and progress without a whole-disk scan.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-075 — Downloader authentication state
Status: complete
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
Browser-cookie authentication needs clear consent, scope and failure reporting.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]
- next-072 — Companion task queue recovery [complete]

## Start in
- src/components/library/youtube-download-dialog.tsx
- companion/download-auth.mjs
- companion/download-manager.mjs
- docs/COMPANION_UPDATE_AND_AUTH.md

## Implementation
1. Audit the existing yt-dlp authentication path and show selected browser/profile without exposing cookie contents.
2. Require an explicit user action to use eligible local session credentials and keep extraction on the Companion.
3. Distinguish expired session, unsupported access and downloader failure; provide provider-approved external fallback.

## Acceptance checks
- [ ] Cookies/tokens never enter browser storage, exports, logs or app server payloads.
- [ ] Denied/restricted content is not promised playable; failed auth retains the queued URL and a safe retry action.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-076 — Download disk-budget preflight
Status: complete
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
Large download batches need disk-space and destination checks before work begins.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-072 — Companion task queue recovery [complete]
- next-073 — Approved-root change audit [complete]

## Start in
- companion/download-preflight.mjs
- companion/download-manager.mjs
- src/lib/youtube-download.ts
- src/components/library/youtube-download-dialog.tsx
- docs/DOWNLOAD_BUDGET_AND_GAME_RECEIPTS.md

## Implementation
1. Check approved destination, existing partial files and available-space estimates before each queued job.
2. Show unknown-size estimates honestly and reserve a configurable bounded safety margin.
3. Pause safely on insufficient space and resume the verified partial file when supported.

## Acceptance checks
- [ ] A low-space fixture prevents a new write and preserves the existing partial file.
- [ ] Changing destination or root approval revalidates the path and cannot overwrite an unrelated file.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-077 — Game launch receipt and recovery
Status: complete
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
One-click launches need evidence of what happened without repeatedly starting the same executable.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]
- next-073 — Approved-root change audit [complete]

## Start in
- companion/launch-manager.mjs
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/games-section.tsx
- docs/DOWNLOAD_BUDGET_AND_GAME_RECEIPTS.md

## Implementation
1. Return a bounded launch receipt with approved shortcut identity, time and observed start outcome.
2. Separate accepted launch from verified process readiness and show retry only when appropriate.
3. Prevent double-click duplicate launches within a short idempotency window without globally blocking other games.

## Acceptance checks
- [ ] Repeated identical launch intents produce one process request and a reusable receipt.
- [ ] A missing shortcut or permission revocation produces a clear error without shell-command interpolation.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-078 — Print model save transaction
Status: complete
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
Print edits need a safe save-as workflow that preserves originals and editor state.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-072 — Companion task queue recovery [complete]
- next-073 — Approved-root change audit [complete]

## Start in
- src/components/library/print-model-viewer.tsx
- src/components/library/print-save-panel.tsx
- src/lib/print-save.ts
- companion/print-transactions.mjs
- docs/PRINT_SAVE_AND_PLATFORM_CONTRACT.md

## Implementation
1. Trace model transforms/material edits and define which formats can faithfully store them.
2. Preview format limitations and save to an approved new path using an atomic temporary file.
3. Retain the original and recover interrupted saves without marking unsaved edits as persisted.

## Acceptance checks
- [ ] A write failure leaves the original model unchanged and the editor marked unsaved.
- [ ] Reopening a supported saved format reproduces verified transforms; unsupported material loss is clearly disclosed.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-079 — Companion update health checklist
Status: complete
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
Upgrading the local service should not silently break browser integration.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]
- next-072 — Companion task queue recovery [complete]

## Start in
- src/lib/companion-update.ts
- src/components/library/companion-update-panel.tsx
- companion/reelcase-companion.mjs
- docs/COMPANION_UPDATE_AND_AUTH.md

## Implementation
1. Create an explicit pre/post-update health check for capabilities, roots, queued jobs and configured tool versions.
2. Export a redacted diagnostic and retain a rollback reference for the previous service configuration.
3. Keep updating/manual installation separate from ordinary browser health checks.

## Acceptance checks
- [ ] A simulated incompatible update surfaces missing capabilities and leaves saved catalog data intact.
- [ ] Health checks do not install packages, change firewall rules or restart unrelated processes.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-080 — Cross-platform local integration contract
Status: complete
Track: Desktop and local workflows
Priority: P2

## Problem and intended outcome
Platform-specific Companion behavior needs explicit capability fallbacks rather than Windows assumptions.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]
- next-073 — Approved-root change audit [complete]
- next-079 — Companion update health checklist [complete]

## Start in
- companion/platform-contract.mjs
- companion/platform-capabilities.mjs
- src/lib/companion-protocol.ts
- src/components/library/use-companion-support.ts
- companion/README.md
- docs/PRINT_SAVE_AND_PLATFORM_CONTRACT.md

## Implementation
1. Inventory Windows-only shortcut, tray, startup and file inspection paths.
2. Define a platform-neutral core contract and honest unsupported states for other platforms.
3. Add filesystem/path and capability fixtures for supported environments without claiming unavailable native tests.

## Acceptance checks
- [ ] Unsupported platform actions do not appear enabled or execute Windows shell commands.
- [ ] Document which native OS checks ran; browser-only operation remains usable with no Companion.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-081 — Image model compatibility preflight
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
A Hugging Face download is not necessarily compatible with the configured image engine.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/components/library/studio-model-library.tsx
- src/components/library/stable-diffusion-section.tsx
- src/lib/studio-model-notes.ts
- companion/studio-model-preflight.mjs

## Implementation
1. Inventory supported engine/model families and validate downloaded metadata, format and required companion components.
2. Show a compatibility checklist before selecting a checkpoint, including architecture and estimated hardware needs.
3. Keep incompatible or incomplete models visible with exact missing requirements instead of enabling generation.

## Acceptance checks
- [ ] An unsupported Qwen-family artifact cannot be mislabeled as an AUTOMATIC1111-compatible checkpoint.
- [ ] Valid compatible models remain selectable after reload and failure leaves the previous working model selected.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-082 — Resumable model download integrity
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
Large model downloads need explicit resumable verification without retaining entire files in browser memory.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-072 — Companion task queue recovery [complete]
- next-073 — Approved-root change audit [complete]
- next-081 — Image model compatibility preflight [complete]

## Start in
- companion/model-transfers.mjs
- companion/studio-models.mjs
- src/components/library/model-transfer-recovery.tsx
- src/components/library/studio-model-library.tsx

## Implementation
1. Use approved local storage for chunked downloads with verified HTTPS source and optional publisher checksum.
2. Resume only when remote identity/ETag matches the partial file; otherwise preview a restart.
3. Publish a model as installed only after complete size/checksum validation and cancellation cleanup.

## Acceptance checks
- [ ] Interrupt and resume a large fixture without duplicating bytes or loading the complete model into JS memory.
- [ ] A changed remote file or checksum failure cannot replace the active verified model.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-083 — Model card requirements notes
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
Users need executable setup guidance for the exact model rather than generic download advice.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-081 — Image model compatibility preflight [complete]

## Start in
- src/components/library/studio-model-library.tsx
- src/lib/studio-recipes.ts

## Implementation
1. Store a local note with canonical model URL/revision, license, model family and required engine components.
2. Provide a reviewable import form for model-card requirements; treat remote text as data, never executable instructions.
3. Generate a setup checklist and verified/unverified labels tied to compatibility preflight.

## Acceptance checks
- [ ] A note distinguishes checkpoint, LoRA, VAE, text encoder and diffusion pipeline roles.
- [ ] Unsupported or ambiguous versions remain unverified and no remote model card can trigger a command or download automatically.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-084 — Generation job lifecycle
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
Generation needs reliable queued, running, cancelled and failed states across reconnects.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-081 — Image model compatibility preflight [complete]

## Start in
- src/lib/studio-session.ts
- src/lib/studio-jobs.ts
- src/lib/studio-documents.ts
- src/components/library/stable-diffusion-section.tsx

## Implementation
1. Map engine job identifiers and define a bounded local session record for parameters and outcomes.
2. Reconnect by verified job identity where supported; otherwise show an interrupted state without resubmission.
3. Cancel explicitly and keep completed output references separate from transient progress.

## Acceptance checks
- [ ] Reload while an engine request is held; the app cannot launch a duplicate generation silently.
- [ ] Engine disconnect and cancellation preserve the previous completed images and input prompt.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-085 — Reproducible generation recipes
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
A saved image needs enough provenance to reproduce its settings with an honest compatibility warning.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-081 — Image model compatibility preflight [complete]
- next-083 — Model card requirements notes [complete]
- next-084 — Generation job lifecycle [complete]

## Start in
- src/lib/studio-recipes.ts
- src/components/library/studio-recipes.tsx
- src/lib/studio-session.ts

## Implementation
1. Record model revision/hash when available, sampler, seed, dimensions and supported engine parameters.
2. Preview a recipe before loading it and map only fields supported by the current engine.
3. Export a portable recipe excluding local paths, tokens and private server configuration.

## Acceptance checks
- [ ] Loading a recipe with a missing model prompts for a compatible choice rather than silently substituting.
- [ ] Replaying a deterministic supported fixture reproduces settings; pixel identity is not claimed across different engines.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-086 — Image output storage policy
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
Generated images and previews need bounded local retention without losing deliberately saved work.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-002 — Storage pressure recovery [complete]
- next-084 — Generation job lifecycle [complete]

## Start in
- src/lib/studio-outputs.ts
- src/lib/studio-session.ts
- src/components/library/studio-output-library.tsx
- src/components/library/stable-diffusion-section.tsx

## Implementation
1. Separate temporary previews, completed unsaved results and explicitly saved outputs.
2. Show retention/storage controls and preview cleanup of disposable previews only.
3. Release image URLs and buffers after navigation, engine failure and cleanup.

## Acceptance checks
- [ ] A long generation fixture retains only the declared preview budget.
- [ ] Saved outputs and recipes survive cleanup/reload; missing local files remain identifiable rather than silently deleted.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-087 — Stream Signal pack revisions
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
Announcement edits need revision-aware recovery across tabs without accidental publication state.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-006 — Cross-tab catalog writer lease [complete]

## Start in
- src/lib/stream-signal-revisions.ts
- src/lib/stream-signal.ts
- src/components/library/use-stream-signal.ts
- src/components/library/stream-signal-section.tsx

## Implementation
1. Assign stable pack/draft revisions and detect conflicting edits using the cross-tab writer protocol.
2. Offer keep-current or restore-prior text with a compact edit history and explicit manual sharing receipts.
3. Keep Copy/Open actions separate from Mark shared and preserve both channel links.

## Acceptance checks
- [ ] Two tabs editing one draft cannot silently erase the newer text.
- [ ] Reload/undo restores text and manual checklist state without claiming any external platform published it.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-088 — Announcement card accessibility
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
Story cards need readable exports and a text alternative at mobile sharing sizes.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/stream-signal-card.ts
- src/components/library/signal-story-export.tsx
- src/components/library/stream-signal-section.tsx

## Implementation
1. Measure card text fit for long creator names, titles and messages at 1080×1920.
2. Add bounded wrapping/overflow warnings and a plain-text alt/caption export.
3. Verify contrast and safe placement while explaining that link stickers are added inside the platform.

## Acceptance checks
- [ ] Long Unicode titles fit or trigger an explicit warning before export.
- [ ] The downloaded PNG has exact dimensions and the text export contains both verified stream links.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-089 — Chat Plays deterministic replay
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
The simulator needs reproducible event replay before it can inform a future local controller.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/lib/stream-signal-lab.ts
- src/lib/stream-signal-replay.ts
- src/components/library/stream-signal-lab.tsx
- src/components/library/stream-signal-replay.tsx

## Implementation
1. Record a bounded seed/configuration and normalized simulated ballot/event log.
2. Replay voting windows, duplicate rejection, sequence votes and resource checks deterministically.
3. Show divergence details and ensure emergency stop clears votes and pending moves during replay.

## Acceptance checks
- [ ] Replaying the same event set produces identical ballots, tie-breaks and execution order.
- [ ] Malformed or late events are rejected and no simulated input is labeled connected to real chat or a game.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-090 — Local racing adapter contract
Status: complete
Track: AI studio and creator tools
Priority: P2

## Problem and intended outcome
The AI Blueprint needs an implementation-ready boundary for a future authenticated local game adapter.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-089 — Chat Plays deterministic replay [complete]

## Start in
- src/lib/racing-adapter-contract.ts
- src/components/library/racing-contract-lab.tsx
- src/components/library/stream-signal-section.tsx
- companion/README.md
- docs/LOCAL_RACING_ADAPTER_CONTRACT.md

## Implementation
1. Document versioned observation, strategic intent, acknowledgement, timeout and emergency-stop messages.
2. Define authenticated local pairing, allowed commands and stale-observation rejection; keep continuous driving control local.
3. Provide an offline contract validator and simulator example, explicitly separating it from a real installed-game integration.

## Acceptance checks
- [ ] Invalid, stale or unauthenticated intents fail the contract validator and cannot enqueue actions.
- [ ] Documentation states that no real iRacing control is complete until a separate permitted adapter is implemented and tested.

## External requirement
A separate local game adapter and supported game integration are required for real driving; this milestone delivers only the boundary and validator.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-091 — Sensitive export redaction review
Status: complete
Track: Trust, accessibility and release
Priority: P0

## Problem and intended outcome
Diagnostics and portable files need one audited boundary for secrets and private source data.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-003 — Backup preflight report [complete]
- next-043 — Guest catalog privacy review [complete]
- next-069 — Private recommendation isolation audit [complete]

## Start in
- src/lib/diagnostic-export.ts
- src/components/library/diagnostic-export-preview.tsx
- src/components/library/performance-scorecard.tsx
- src/lib/multiplayer/room-connection-timeline.ts

## Implementation
1. Enumerate all export/clipboard/download paths and classify credentials, invitation tokens, local paths and private titles.
2. Create a shared allowlist-based redactor for diagnostic exports while preserving intentional private backups under explicit choice.
3. Add a preview showing excluded classes and test nested/unexpected fields.

## Acceptance checks
- [ ] Canary secrets injected into diagnostic inputs never appear in output bytes or console logs.
- [ ] A deliberately selected full private backup remains restorable and clearly distinguished from a shareable diagnostic.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-092 — Capability consent ledger
Status: complete
Track: Trust, accessibility and release
Priority: P2

## Problem and intended outcome
Optional integrations need understandable remembered consent and revocation.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]
- next-073 — Approved-root change audit [complete]
- next-081 — Image model compatibility preflight [complete]

## Start in
- src/lib/capability-consent.ts
- companion/capability-consent.mjs
- src/components/library/capability-permissions.tsx
- src/lib/companion.ts
- src/components/library/settings-section.tsx

## Implementation
1. List local file roots, model downloads, external sharing, provider sessions and optional assistant capabilities.
2. Show what each capability permits, its current state and how to revoke it without erasing unrelated content.
3. Re-check consent generation before delayed operations start or commit.

## Acceptance checks
- [ ] Revoking a capability cancels or denies relevant pending work and leaves unrelated saved data intact.
- [ ] An unknown/unconfigured integration is never presented as connected or authorized.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-093 — Remote desktop pairing safeguards
Status: complete
Track: Trust, accessibility and release
Priority: P0

## Problem and intended outcome
Remote desktop access needs verifiable pairing and expiry rather than broad unattended access defaults.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]
- next-092 — Capability consent ledger [complete]

## Start in
- companion/creative-tools.mjs
- src/components/library/remote-desktop-section.tsx
- docs/MODEL_TRANSFER_AND_REMOTE_SAFEGUARDS.md

## Implementation
1. Audit the actual RustDesk launch/integration boundary and document which process handles authentication.
2. Add explicit pairing/session visibility, expiry guidance and stop/disconnect actions supported by the real integration.
3. Keep credentials out of URLs/exports and gate unattended access behind an explicit separate choice.

## Acceptance checks
- [ ] A simulated expired pairing cannot initiate a new session through the app.
- [ ] Document real native verification separately; a launcher button alone must not be marked as a working remote desktop session.

## External requirement
This milestone delivers application approval and launch safeguards, not a verified remote session. Native RustDesk session verification requires an installed client and an explicitly approved peer; do not start a session without that authorization.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-094 — Destructive action recovery design
Status: planned
Track: Trust, accessibility and release
Priority: P2

## Problem and intended outcome
Removal, reset and replacement actions need consistent previews and meaningful undo limits.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-001 — Crash-safe catalog mutations [complete]
- next-004 — Atomic restore with recovery slot [planned]
- next-007 — Deletion and undo tombstones [planned]

## Start in
- src/lib/videos/store.ts
- src/components/library/settings-section.tsx
- src/components/library/mission-plan-section.tsx

## Implementation
1. Inventory irreversible versus reversible mutations and distinguish hiding a card from deleting source files.
2. Apply a shared consequence preview and recoverable transaction where supported.
3. State undo scope/expiry and retain failure recovery information without adding confirmations to ordinary navigation.

## Acceptance checks
- [ ] Reset/import/delete previews accurately name affected records before mutation.
- [ ] Cancellation changes nothing and undo restores all promised fields without deleting source media.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-095 — Keyboard command coverage map
Status: complete
Track: Trust, accessibility and release
Priority: P2

## Problem and intended outcome
Keyboard access needs a discoverable map and collision tests across dialogs and players.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
None.

## Start in
- src/components/library/keyboard-help.tsx
- src/lib/keyboard-commands.ts
- src/components/library/library-app.tsx
- src/components/library/player.tsx

## Implementation
1. Inventory existing shortcuts, focus scopes and native provider key handling.
2. Add a searchable shortcut help view with context-sensitive availability and user-editable conflicts where supported.
3. Test shortcuts while typing, in nested dialogs and on virtualized card windows.

## Acceptance checks
- [ ] Text inputs and native player controls retain their expected keys.
- [ ] Every displayed command is reachable with visible focus and closing help restores the originating control.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-096 — Accessible status announcement policy
Status: complete
Track: Trust, accessibility and release
Priority: P2

## Problem and intended outcome
Progress and error updates should be useful to assistive technology without becoming noise.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-050 — Room accessibility audit protocol [complete]
- next-095 — Keyboard command coverage map [complete]

## Start in
- src/lib/status-announcement.ts
- src/components/library/batch-status-announcement.tsx
- src/components/library/live-check-status.tsx
- src/components/library/twitch-clips-control.tsx
- src/components/library/mission-plan-section.tsx
- docs/ACCESSIBILITY_STATUS_AND_FOCUS.md

## Implementation
1. Inventory live regions and define polite batch summaries versus urgent user-action errors.
2. Coalesce rapid provider/room updates and retain a readable last outcome.
3. Verify reduced-motion and high-contrast presentation alongside keyboard navigation.

## Acceptance checks
- [ ] A 100-creator batch does not announce every internal counter tick.
- [ ] Important failure and completion states are announced once with a usable recovery control.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-097 — Onboarding using existing library state
Status: complete
Track: Trust, accessibility and release
Priority: P2

## Problem and intended outcome
New and returning users need next steps that reflect actual configuration.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-071 — Companion protocol negotiation [complete]
- next-092 — Capability consent ledger [complete]

## Start in
- src/lib/setup-readiness.ts
- src/components/library/setup-checklist.tsx
- src/components/library/light-home.tsx
- src/components/library/settings-section.tsx

## Implementation
1. Derive onboarding readiness from saved sources, approved Companion capabilities and usable catalog state.
2. Offer a small contextual checklist with dismiss/resume and no fabricated sample connections.
3. Keep costly scans/provider imports explicitly initiated and show offline-first options.

## Acceptance checks
- [ ] An empty library gets useful choices while a populated returning profile avoids onboarding interruption.
- [ ] Dismissing or completing a step persists without launching downloads, scans or account connections.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-098 — Feature readiness inventory
Status: complete
Track: Trust, accessibility and release
Priority: P2

## Problem and intended outcome
The app needs one truthful distinction between implemented, configured and externally verified features.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-079 — Companion update health checklist [complete]
- next-081 — Image model compatibility preflight [complete]
- next-090 — Local racing adapter contract [complete]
- next-093 — Remote desktop pairing safeguards [complete]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/components/library/settings-section.tsx
- src/components/library/mission-plan-section.tsx
- MILESTONE_VERIFICATION.md

## Implementation
1. Define readiness dimensions using actual capability/configuration and linked verification artifacts.
2. Show unsupported, unconfigured, ready and externally unverified states with concrete next steps.
3. Keep milestone completion separate from integration connection state and avoid automatic completion promotion.

## Acceptance checks
- [ ] A built simulator is not labeled connected chat or game control, and an installed model is not proof of generation.
- [ ] Missing evidence is visibly unverified; opening the inventory performs no external setup.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-099 — Release rollback drill
Status: planned
Track: Trust, accessibility and release
Priority: P0

## Problem and intended outcome
A release needs a rehearsed recovery path for stored data and browser assets.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-004 — Atomic restore with recovery slot [planned]
- next-020 — Performance release artifact comparison [planned]
- next-091 — Sensitive export redaction review [complete]

## Start in
- src/lib/videos/persist.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Document compatible schema ranges and create a disposable profile containing realistic saved signals.
2. Exercise upgrade, interrupted migration and rollback using production outputs without touching real user data.
3. Block rollback paths that cannot read the current schema and provide an explicit safe restore procedure.

## Acceptance checks
- [ ] The drill restores the previous usable app/data combination or clearly rejects an unsafe downgrade.
- [ ] Evidence includes output revision, schema revision and preserved personal-field counts without secrets.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-100 — Model-executable release handoff
Status: planned
Track: Trust, accessibility and release
Priority: P2

## Problem and intended outcome
Future model work needs a consistent verified handoff rather than vague completion claims.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-020 — Performance release artifact comparison [planned]
- next-091 — Sensitive export redaction review [complete]
- next-098 — Feature readiness inventory [complete]
- next-099 — Release rollback drill [planned]

## Start in
- src/lib/mission-plan.ts
- src/components/library/mission-plan-section.tsx
- MILESTONE_VERIFICATION.md

## Implementation
1. Define a per-milestone handoff with changed files, baseline, validation commands, artifacts and remaining dependencies.
2. Validate dependency completion and distinguish code delivery from external verification before status changes.
3. Export a selected milestone brief plus its dependency context and acceptance checklist without private application data.

## Acceptance checks
- [ ] A blocked external check cannot be silently converted to a complete milestone.
- [ ] An exported handoff contains enough exact scope and evidence requirements for another model to resume without guessing.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.
