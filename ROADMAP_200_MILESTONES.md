# Realhub — 200 next-level milestones

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
Status: complete
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
- src/lib/videos/library-restore-repository.ts
- src/lib/videos/library-restore-plan.ts
- src/lib/videos/restore-snapshot.ts
- src/lib/restore-epoch.ts
- src/components/library/restore-boundary.tsx

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
Status: complete
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
- src/lib/videos/deletion-tombstones.ts
- src/lib/videos/store.ts
- src/lib/videos/persist.ts
- src/components/library/removed-titles-panel.tsx

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
Status: complete
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
- next-004 — Atomic restore with recovery slot [complete]

## Start in
- src/lib/videos/pack-conflicts.ts
- src/lib/videos/pack-review-repository.ts
- src/components/library/library-pack-transfer.tsx
- src/lib/videos/library-restore-repository.ts

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
Status: complete
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
- next-007 — Deletion and undo tombstones [complete]

## Start in
- src/lib/videos/local-identity.ts
- src/lib/videos/identity-repository.ts
- src/lib/videos/file-fingerprint.worker.ts
- src/components/library/file-identity-panel.tsx
- src/lib/videos/scan.ts
- src/lib/videos/store.ts

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
Status: complete
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
- next-004 — Atomic restore with recovery slot [complete]
- next-006 — Cross-tab catalog writer lease [complete]

## Start in
- src/lib/local-profile-storage.ts
- src/lib/local-profiles.ts
- src/components/library/local-profiles-panel.tsx
- src/components/library/profile-boundary.tsx
- src/lib/videos/store.ts
- src/lib/videos/persist.ts
- scripts/local-profiles-browser-check.mjs
- scripts/profile-switch-store.test.mjs

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
Status: complete
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
- next-010 — Portable profile boundaries [complete]

## Start in
- src/lib/videos/catalog-page-reader.ts
- src/lib/videos/persist.ts
- src/lib/videos/store.ts
- src/lib/navigation-work.ts

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
- next-014 — IndexedDB cursor backpressure [complete]
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
Status: complete
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
- next-009 — File identity migration ledger [complete]

## Start in
- src/lib/videos/twitch-channel-identity.ts
- src/lib/videos/twitch-alias-repository.ts
- src/lib/remote/api.ts
- src/lib/videos/store.ts
- src/components/library/twitch-alias-review.tsx

## Implementation
1. Compare resolved stable user IDs before treating a new login as an existing creator.
2. Offer a reviewable alias update through a fenced identity journal; retain canonical source IDs and bind future live/VOD/clip results to them.
3. Retain old bookmarks as aliases while detecting a recycled login belonging to another user.

## Acceptance checks
- [ ] A renamed stable user retains VODs, clips, ratings and live policy.
- [ ] A reused login with a different user ID remains separate and cannot inherit personal signals silently.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-035 — Expired Twitch media recovery
Status: complete
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
- next-007 — Deletion and undo tombstones [complete]

## Start in
- src/lib/remote/twitch-media-health.ts
- src/lib/videos/media-health.ts
- src/lib/videos/media-health-repository.ts
- src/components/library/media-recovery-panel.tsx
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
- next-009 — File identity migration ledger [complete]
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
Status: complete
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
- next-009 — File identity migration ledger [complete]
- next-073 — Approved-root change audit [complete]

## Start in
- src/lib/videos/local-media-health.ts
- src/lib/videos/media-recovery-groups.ts
- src/components/library/media-recovery-panel.tsx
- src/lib/videos/store.ts
- src/lib/videos/sources.ts

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
Status: complete
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
- next-004 — Atomic restore with recovery slot [complete]
- next-007 — Deletion and undo tombstones [complete]

## Start in
- src/components/library/consequence-action.tsx
- src/lib/videos/source-visibility.ts
- src/components/library/hidden-sources-panel.tsx
- src/lib/videos/history-reset.ts
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
- next-004 — Atomic restore with recovery slot [complete]
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

---

# next-101 — Profile rename lifecycle
Status: complete
Track: Profile lifecycle and portability
Priority: P1

## Problem and intended outcome
A profile needs a durable editable label without changing its storage identity.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Audit registry transactions and add a versioned rename operation keyed by immutable profile ID.
2. Reject reserved or duplicate labels and retain the existing label on transaction failure.
3. Refresh open profile pickers from compact notifications without reloading personal catalogs.

## Acceptance checks
- [ ] Rename in one tab and verify another tab updates its picker while histories remain isolated.
- [ ] A quota failure or concurrent rename leaves one valid label and all existing database names intact.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-102 — Reviewed profile removal
Status: planned
Track: Profile lifecycle and portability
Priority: P0

## Problem and intended outcome
Removing an unused local profile requires an exact consequence preview and a recoverable failure path.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-101 — Profile rename lifecycle [complete]
- next-004 — Atomic restore with recovery slot [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Inventory the selected profile databases and preferences without reading private values into the preview.
2. Require switching away from the target and offer a metadata backup before explicit removal.
3. Journal deletion progress so interruption cannot remove another profile or silently forget unfinished stores.

## Acceptance checks
- [ ] Cancel the preview and verify no keys, blobs, registry entries or active views change.
- [ ] Interrupt removal between stores; retry touches only the selected ID and reports every remaining step.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-103 — Per-profile storage budget dashboard
Status: planned
Track: Profile lifecycle and portability
Priority: P1

## Problem and intended outcome
Storage pressure should identify the responsible profile and distinguish protected data from disposable bytes.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-002 — Storage pressure recovery [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Measure available database and cache estimates per profile without opening missing stores for creation.
2. Separate personal metadata, print bytes, artwork and shared device caches with honest unknown measurements.
3. Offer scoped existing cleanup actions and retain the selected profile when a measurement fails.

## Acceptance checks
- [ ] Two synthetic profiles show separate usage categories without exposing each other’s titles or notes.
- [ ] A browser lacking storage estimates shows an explicit unavailable metric and never a fabricated zero.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-104 — Pending-edit inventory before profile switch
Status: planned
Track: Profile lifecycle and portability
Priority: P0

## Problem and intended outcome
Profile switching should account for tool drafts and pending jobs as well as library checkpoints.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-078 — Print model save transaction [complete]
- next-087 — Stream Signal pack revisions [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Trace pending edits in announcements, studio recipes, print editors and library mutation owners.
2. Define a small participant contract that can flush, refuse or explain a pending profile switch.
3. Show unresolved participants and release old detail resources only after each accepted checkpoint completes.

## Acceptance checks
- [ ] Hold a print save and announcement edit; switching waits or names the unresolved work without losing drafts.
- [ ] A rejected participant keeps the original profile active and a later retry does not run a checkpoint twice.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-105 — Profile identity in application chrome
Status: complete
Track: Profile lifecycle and portability
Priority: P1

## Problem and intended outcome
Multiple tabs need a clear indication of which local profile receives the next edit.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-101 — Profile rename lifecycle [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Audit desktop header, mobile menu and recovery screens for space to show the active profile label.
2. Expose one compact read-only identity indicator backed by the validated profile registry.
3. Make the indicator open existing profile controls and handle renamed or missing labels consistently.

## Acceptance checks
- [ ] Default and a second profile remain distinguishable on every desktop and mobile editing screen.
- [ ] Renaming updates the label without switching namespaces or exposing another profile’s private counts.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-106 — Profile-labelled backup manifests
Status: complete
Track: Profile lifecycle and portability
Priority: P1

## Problem and intended outcome
A backup should explain its source profile without silently choosing a restore destination.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-003 — Backup preflight report [complete]
- next-005 — Streaming library-pack export [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Inspect streaming and legacy pack manifests and add optional versioned source-profile metadata.
2. Show source and current destination labels during preflight while keeping destination choice explicit.
3. Treat old packs without labels as legacy and preserve their existing validation and import behavior.

## Acceptance checks
- [ ] A backup from Alpha previews correctly in Beta and cannot activate before the destination is reviewed.
- [ ] Legacy packs still inspect and restore; unsupported label metadata cannot overwrite active preferences.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-107 — Origin-to-origin library transfer assistant
Status: planned
Track: Profile lifecycle and portability
Priority: P1

## Problem and intended outcome
Localhost aliases and other origins have separate browser storage and need an explicit transfer workflow.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-106 — Profile-labelled backup manifests [complete]
- next-005 — Streaming library-pack export [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Document current pack coverage and distinguish metadata transfer from native files, grants and sign-ins.
2. Build an export-and-import checklist that names the actual source and destination origins.
3. Validate a destination receipt against the selected pack and retain the source until verification succeeds.

## Acceptance checks
- [ ] Transfer between two disposable origins and verify tags, follows, history and drafts within supported pack scope.
- [ ] An unreachable destination or missing source permission remains pending without claiming data was copied.

## External requirement
Verify with two reachable user-authorized origins; a same-origin fixture alone does not prove device transfer.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-108 — Portable profile configuration packs
Status: complete
Track: Profile lifecycle and portability
Priority: P1

## Problem and intended outcome
A reusable setup should copy selected preferences into an empty profile without copying private activity by accident.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-106 — Profile-labelled backup manifests [complete]
- next-101 — Profile rename lifecycle [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Define a versioned allowlist of transferable layout, pacing and optional tool configuration fields.
2. Preview excluded credentials, directory grants, watch history, private tags and device-specific paths.
3. Create an empty destination first and apply only reviewed fields through existing persistence contracts.

## Acceptance checks
- [ ] A configuration pack creates the chosen setup while the new profile has no foreign history or private metadata.
- [ ] Unknown fields and partial import failure preserve the empty destination and the original source profile.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-109 — Profile registry repair preview
Status: planned
Track: Profile lifecycle and portability
Priority: P0

## Problem and intended outcome
Registry damage needs a reviewable recovery path beyond a generic Return to Default action.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-101 — Profile rename lifecycle [complete]
- next-103 — Per-profile storage budget dashboard [planned]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. Inspect existing registry and database-name evidence without inferring ownership from personal contents.
2. Produce a read-only repair proposal that separates orphan databases, malformed labels and unknown schemas.
3. Apply reviewed label repairs transactionally and preserve unsupported records for later recovery.

## Acceptance checks
- [ ] A malformed registry produces a counts-only proposal and never mounts an unvalidated writable profile.
- [ ] Cancelling or failing a repair keeps the original bytes and does not delete an orphan database.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-110 — Profile permission inventory
Status: planned
Track: Profile lifecycle and portability
Priority: P1

## Problem and intended outcome
Directory handles and browser consent need a clear profile-specific inventory before grants are reused or forgotten.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-073 — Approved-root change audit [complete]
- next-092 — Capability consent ledger [complete]

## Start in
- src/lib/local-profiles.ts
- src/lib/local-profile-storage.ts
- src/components/library/local-profiles-panel.tsx

## Implementation
1. List existing approved handles and optional app consents using their current profile scope.
2. Offer explicit reauthorization or forgetting with consequences for scans, room sharing and native services.
3. Keep device Companion roots distinct from browser directory grants and avoid requesting broader access.

## Acceptance checks
- [ ] Forgetting one profile grant does not revoke another profile’s metadata or broaden Companion roots.
- [ ] A denied reauthorization leaves saved source records available with a clear permission-needed state.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-111 — Video archive growth accounting
Status: complete
Track: Archive continuity and growth
Priority: P1

## Problem and intended outcome
Catalog growth should distinguish archived videos from photos, live rooms and repeated refreshes.

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
- next-068 — Adult pull quality fixtures [complete]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Trace source counts through admission, refresh, cleanup and restored catalog projections.
2. Record bounded accepted-video, photo, live and duplicate counters without storing private payloads in diagnostics.
3. Show target progress using the appropriate media class and explain shared retention constraints.

## Acceptance checks
- [ ] A mixed 20k-entry fixture reports its true archived-video count and never counts refreshes as new videos.
- [ ] Count updates remain incremental during pulls and preserve manual tags when a title changes media evidence.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-112 — Durable archive cursor repository
Status: planned
Track: Archive continuity and growth
Priority: P0

## Problem and intended outcome
Best-effort localStorage cursors should gain a durable checkpoint path when browser preferences are full.

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
- next-111 — Video archive growth accounting [complete]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Inventory current per-provider and per-sort cursor records and define a versioned IndexedDB repository.
2. Commit accepted-row receipts and continuation checkpoints through the existing catalog writer boundary.
3. Hydrate compact cursor summaries before scheduling discovery and retain compatible legacy resume points.

## Acceptance checks
- [ ] Force localStorage quota failure, reload and continue after the last accepted archive window without skipping records.
- [ ] Crash at each checkpoint boundary; replay neither advances beyond saved rows nor duplicates accepted personal edits.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-113 — Archive sort coverage map
Status: planned
Track: Archive continuity and growth
Priority: P1

## Problem and intended outcome
Independent sort lanes need visible depth and exhaustion evidence rather than one latest-provider label.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-112 — Durable archive cursor repository [planned]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Project compact per-sort checkpoints, accepted additions, repeats and terminal reasons from durable cursors.
2. Display all active sort lanes with provider-specific semantics and a selected-lane continuation action.
3. Keep exhausted, cooling-down and not-yet-checked states distinct and avoid timer-driven table refreshes.

## Acceptance checks
- [ ] A provider with one exhausted lane still shows and resumes its other available lanes correctly.
- [ ] A 100k-title catalog renders only bounded summary rows and exposes no private query text in shared diagnostics.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-114 — Abort slow provider archive requests
Status: planned
Track: Archive continuity and growth
Priority: P0

## Problem and intended outcome
A deadline should stop unnecessary upstream work rather than merely abandon its result.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-018 — Page-specific network priority proof [complete]
- next-068 — Adult pull quality fixtures [complete]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Trace abort signals through browser calls, server handlers, metadata fetches and body readers.
2. Propagate cancellation through existing supported request paths and release response buffers on timeout.
3. Retain earlier accepted pages and name any transport boundary that cannot cancel an in-flight call.

## Acceptance checks
- [ ] Cancel while an upstream body is held and verify no later archive page is fetched or admitted.
- [ ] A completed earlier page keeps its records and exact retry cursor after a later request times out.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-115 — Catalog churn recheck windows
Status: planned
Track: Archive continuity and growth
Priority: P1

## Problem and intended outcome
Ranked provider listings can change between visits even when local paging order stays consistent.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-112 — Durable archive cursor repository [planned]
- next-113 — Archive sort coverage map [planned]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Measure duplicate and missing-identity behavior when a source inserts or removes records ahead of a saved page.
2. Add a bounded overlap recheck policy using existing identities and supported provider observations.
3. Keep immutable continuation evidence separate from estimated listing coverage and respect rate limits.

## Acceptance checks
- [ ] Insert records before a saved cursor in fixtures; overlap repair finds them without resetting the whole archive.
- [ ] A controlled public-provider run records reorder behavior honestly and never claims complete immutable coverage.

## External requirement
Capture a bounded run against an available permitted public provider; fixture ordering is not evidence of live ranking stability.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-116 — User-defined archive work windows
Status: planned
Track: Archive continuity and growth
Priority: P1

## Problem and intended outcome
Large archive tasks should honor chosen active hours without creating hidden catch-up bursts.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-018 — Page-specific network priority proof [complete]
- next-112 — Durable archive cursor repository [planned]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Audit the current periodic owner and add optional local work-window preferences with explicit timezone handling.
2. Apply windows only to automatic undispatched work while preserving manual pulls and accepted transactions.
3. Resume one current task after a window opens and explain paused-by-schedule state in existing controls.

## Acceptance checks
- [ ] Cross midnight and a daylight-saving transition with a fake clock; automatic work runs only in the selected window.
- [ ] Reopening after a missed day schedules one bounded turn rather than replaying all missed intervals.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-117 — Yield-based source planning
Status: planned
Track: Archive continuity and growth
Priority: P1

## Problem and intended outcome
Discovery should use observed new-entry yield without starving slow or recently failing sources.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-111 — Video archive growth accounting [complete]
- next-112 — Durable archive cursor repository [planned]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Measure additions, duplicate ratios and useful refreshes from existing accepted-window receipts.
2. Introduce bounded exploration slots and conservative yield weights without increasing default request frequency.
3. Explain source selection and keep manual priorities, cooldowns and oldest-due fairness authoritative.

## Acceptance checks
- [ ] A high-duplicate source loses excess slots while a low-volume source still receives its guaranteed exploration turn.
- [ ] Recovery from failure restores exploration gradually and no score can bypass a provider cooldown.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-118 — Per-source retention envelopes
Status: planned
Track: Archive continuity and growth
Priority: P1

## Problem and intended outcome
Group-wide caps need optional provider or creator reservations so one archive cannot consume every retained slot.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-111 — Video archive growth accounting [complete]
- next-002 — Storage pressure recovery [complete]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Map current shared and group entry caps, protected personal records and cleanup eligibility.
2. Preview optional source envelopes with an explicit precedence order under the existing shared hard limit.
3. Apply admission and cleanup using the same policy and preserve evidence when protected rows prevent a reservation.

## Acceptance checks
- [ ] A dominant archive cannot consume another configured source’s reservation in mixed admission fixtures.
- [ ] Lowering a limit previews protected overflow and never silently deletes saved ratings, drafts or source grants.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-119 — Pull acceptance receipts
Status: planned
Track: Archive continuity and growth
Priority: P0

## Problem and intended outcome
Users need a bounded explanation of which pages actually became durable catalog entries.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-112 — Durable archive cursor repository [planned]
- next-114 — Abort slow provider archive requests [planned]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Define a compact receipt schema linking provider window, cursor before/after and accepted record counts.
2. Write receipts at the existing durable admission boundary and cap retained history by count and bytes.
3. Expose a selected receipt with partial, cancelled and failed outcomes without private title or URL dumps.

## Acceptance checks
- [ ] A cancelled pull reports only committed windows and its receipt agrees with disk counts after reload.
- [ ] Tampered or future receipts fail closed while existing catalog records and resume positions remain readable.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-120 — Cross-provider contention board
Status: planned
Track: Archive continuity and growth
Priority: P2

## Problem and intended outcome
YouTube, Twitch and Adult archive work need one view of competing queued and active demand.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-018 — Page-specific network priority proof [complete]
- next-119 — Pull acceptance receipts [planned]

## Start in
- src/lib/videos/store.ts
- src/lib/remote/api.ts
- src/lib/videos/adult-archive-cursors.ts
- src/components/library/adult-archive-progress.tsx

## Implementation
1. Observe existing queue owners and classify undispatched, active, cooldown and accepted-commit work.
2. Build a bounded diagnostic projection that shows why a foreground desk is waiting.
3. Add only reviewed cancellation or reprioritization actions that preserve accepted results and provider budgets.

## Acceptance checks
- [ ] Opening Live during a held archive explains the wait and reprioritizes eligible undispatched work within a measured bound.
- [ ] The board retains a fixed number of events and does not introduce a second scheduler or polling loop.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-121 — Saved search workspaces
Status: planned
Track: Search and library navigation
Priority: P1

## Problem and intended outcome
Frequently reused library queries need named reusable scopes rather than repeated typing.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-013 — Worker crash recovery [complete]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Audit current search state and define a versioned saved query containing supported filters and source scope.
2. Add create, rename, reorder and remove controls without storing private queries in public surfaces.
3. Restore a chosen query through existing search ownership and cancel the previous worker request.

## Acceptance checks
- [ ] A saved query reopens after reload with identical filters and result identities in its own profile.
- [ ] Deleting a saved query keeps catalog metadata intact and stale worker output cannot replace a newer selection.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-122 — Structured search query chips
Status: planned
Track: Search and library navigation
Priority: P1

## Problem and intended outcome
Complex searches should expose editable field constraints without requiring undocumented syntax.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-121 — Saved search workspaces [planned]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Inventory supported text, source, tag, duration and category filters in the actual query parser.
2. Build accessible chips that round-trip through a versioned structured query model.
3. Reject unsupported operators with a helpful explanation and keep plain text entry fast.

## Acceptance checks
- [ ] Mouse and keyboard editing produce the same results as the corresponding supported filter controls.
- [ ] Removing one chip preserves other constraints and a malformed imported query does not start an unbounded scan.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-123 — Multilingual title normalization index
Status: planned
Track: Search and library navigation
Priority: P1

## Problem and intended outcome
International creator and title text needs predictable matching without corrupting original spelling.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-013 — Worker crash recovery [complete]
- next-122 — Structured search query chips [planned]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Collect redacted Unicode fixtures covering accents, combining marks, non-Latin scripts and mixed punctuation.
2. Define normalized search tokens while retaining original display strings and stable media IDs.
3. Migrate only disposable search indexes in bounded chunks and preserve query cancellation.

## Acceptance checks
- [ ] Equivalent composed and decomposed spellings find the same saved titles while distinct names remain distinct.
- [ ] A 100k mixed-script index rebuild yields to input and cannot rewrite titles or private metadata.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-124 — Local vocabulary typo suggestions
Status: planned
Track: Search and library navigation
Priority: P2

## Problem and intended outcome
Misspelled searches should offer bounded corrections grounded in the user’s own visible catalog.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-123 — Multilingual title normalization index [planned]
- next-069 — Private recommendation isolation audit [complete]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Build a compact visible-scope vocabulary with frequency thresholds and strict candidate limits.
2. Offer explicit spelling suggestions with match rationale instead of silently rewriting a query.
3. Keep private vocabulary out of public or guest scopes and cancel obsolete suggestion work.

## Acceptance checks
- [ ] A one-character typo offers the expected supported correction without changing the current result set automatically.
- [ ] Locked private tags never appear in suggestions and rapid input publishes only the latest bounded candidate list.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-125 — Browse task back-and-forward history
Status: planned
Track: Search and library navigation
Priority: P1

## Problem and intended outcome
Users need to return from a detail or desk change to the exact prior browsing task.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-121 — Saved search workspaces [planned]
- next-010 — Portable profile boundaries [complete]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Inventory route, filter, selected shelf, logical item anchor and scroll restoration state.
2. Introduce a bounded per-profile task history using stable identities rather than retained card arrays.
3. Restore only compatible snapshots and explain unavailable sources without losing the remaining task state.

## Acceptance checks
- [ ] Navigate through three desks and use back/forward on desktop and mobile; each task restores its filter and visible anchor.
- [ ] Removing a source invalidates only its unavailable anchor and does not leak private task labels into another profile.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-126 — Search result count evidence
Status: planned
Track: Search and library navigation
Priority: P1

## Problem and intended outcome
A displayed count should distinguish full-index matches, loaded pages and provisional provider estimates.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-122 — Structured search query chips [planned]
- next-013 — Worker crash recovery [complete]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Trace every search count from local worker, provider response and paged result projection.
2. Add a compact count-evidence contract and use precise labels for exact, loaded and estimated totals.
3. Keep count updates independent from mounting result cards and preserve current paging anchors.

## Acceptance checks
- [ ] A partially indexed or paged fixture cannot present its loaded-card count as a verified complete total.
- [ ] Updating an estimate does not remount the grid or move keyboard focus from the current result.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-127 — Publication-evidence date filters
Status: planned
Track: Search and library navigation
Priority: P1

## Problem and intended outcome
Date filtering should use evidenced publication values and make unknown dates discoverable.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-027 — YouTube publication uncertainty [complete]
- next-122 — Structured search query chips [planned]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Reuse existing publication precision/provenance fields and define explicit unknown-date filter behavior.
2. Add bounded date-range filters that respect timezone boundaries and partial year/day precision.
3. Keep import/download time as a separate selectable field rather than a publication fallback.

## Acceptance checks
- [ ] A video downloaded today but published years ago appears only in the correct publication range.
- [ ] Unknown and partial dates remain selectable without fabricated timestamps or off-by-one timezone shifts.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-128 — Stable result bookmarks
Status: planned
Track: Search and library navigation
Priority: P2

## Problem and intended outcome
A saved place in search should survive reordering and restore the intended logical media item.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-125 — Browse task back-and-forward history [planned]
- next-009 — File identity migration ledger [complete]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Define a bookmark containing query identity, media identity and a bounded neighborhood fallback.
2. Resolve bookmarks against current catalog aliases and visibility before restoring focus.
3. Show a clear stale-bookmark outcome and allow explicit removal without deleting saved media.

## Acceptance checks
- [ ] Reorder results and rename an aliased source; opening the bookmark still focuses the same verified media identity.
- [ ] A deleted or newly private item is not revealed through its old title and the remaining query still opens.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-129 — Opt-in transcript search slices
Status: planned
Track: Search and library navigation
Priority: P1

## Problem and intended outcome
On-demand comments and captions need an explicit bounded path into local text search.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-049 — Provider-independent subtitles [complete]
- next-123 — Multilingual title normalization index [planned]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Inventory existing caption/comment storage and distinguish transcript evidence from discussion text.
2. Add user-initiated indexing with per-source byte limits, cancellation and visible storage coverage.
3. Return timestamped local matches while keeping provider fetching and private scopes explicit.

## Acceptance checks
- [ ] A known caption phrase returns its supported timestamp and source; discussion text is labelled separately.
- [ ] Disabling transcript indexing releases disposable indexes without deleting saved captions or exposing private text to guests.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-130 — Search match explanation badges
Status: planned
Track: Search and library navigation
Priority: P2

## Problem and intended outcome
Search results should show which supported fields caused a match without dumping hidden text.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-126 — Search result count evidence [planned]
- next-129 — Opt-in transcript search slices [planned]

## Start in
- src/lib/videos/search-worker-index.ts
- src/components/library/global-search.tsx
- src/lib/videos/store.ts

## Implementation
1. Carry bounded matched-field evidence from the existing search scorer into result projections.
2. Show concise title, tag, creator or transcript reasons with safe highlighted excerpts.
3. Validate explanations against the active scope and avoid retaining a second full description graph.

## Acceptance checks
- [ ] Fixtures with identical titles but different tags display the correct field-level reason for each match.
- [ ] Private excerpts never appear in public results and rapid query changes cannot leave stale highlight text.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-131 — Desk-specific taste controls
Status: planned
Track: Recommendation trust and controls
Priority: P1

## Problem and intended outcome
Recommendation tuning should distinguish a temporary session from persistent preferences for one desk.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-057 — Recommendation session tuning [complete]
- next-051 — Recommendation evaluation dataset [complete]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Audit session tuning and define optional per-desk preference overlays with a visible precedence order.
2. Preview the effect of a change on a bounded candidate sample before saving the overlay.
3. Offer reset of one overlay while retaining baseline ratings, notes and other desk preferences.

## Acceptance checks
- [ ] A Twitch-only overlay changes Twitch recommendations without changing Movies or private Adult preferences.
- [ ] Reset and reload preserve baseline feedback and show which active overlay explains the current ranking.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-132 — Recommendation feedback undo timeline
Status: planned
Track: Recommendation trust and controls
Priority: P1

## Problem and intended outcome
Mistaken likes or rejection reasons need a bounded reversible history rather than destructive global resets.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-052 — Explicit recommendation rejection reasons [complete]
- next-060 — Feedback experiment replay [complete]
- next-001 — Crash-safe catalog mutations [complete]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Inventory feedback operations and identify reversible rating, rejection and preference edits.
2. Add a versioned bounded operation history with explicit conflict checks before undoing a selected edit.
3. Keep automatic observations separate from manual choices and preserve current export semantics.

## Acceptance checks
- [ ] Undoing an earlier rejection cannot overwrite a newer manual rating or another tab’s decision.
- [ ] History survives reload within its declared bound and quota failure preserves the active feedback ledger.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-133 — Followed-creator cold-start tuning
Status: planned
Track: Recommendation trust and controls
Priority: P1

## Problem and intended outcome
Newly followed creators need measured exploration without drowning out established preferences.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-053 — Recommendation exposure ledger [complete]
- next-059 — Recommendation fairness report [complete]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Measure current candidate admission for new follows with no watch or rating history.
2. Add a small configurable exploration allowance tied to verified follow identity and fresh available content.
3. Explain exploration reasons and retire the allowance once sufficient explicit feedback exists.

## Acceptance checks
- [ ] A newly followed creator receives bounded exposure while older high-quality candidates remain represented.
- [ ] Unfollow or explicit rejection removes exploration eligibility without deleting saved watched titles.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-134 — Novelty and familiarity balance
Status: planned
Track: Recommendation trust and controls
Priority: P2

## Problem and intended outcome
Users need an explicit choice between recent familiar interests and unexplored material.

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
- next-131 — Desk-specific taste controls [planned]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Define novelty features using existing exposure and history evidence rather than inferred personal labels.
2. Add a bounded preference control with a transparent neutral setting and reproducible score effects.
3. Evaluate the control across sparse and dense histories and retain diversity constraints.

## Acceptance checks
- [ ] Changing the control produces measurable novelty movement on the fixed evaluation set without breaking relevance bounds.
- [ ] A profile with no history receives a labelled default rather than a fabricated familiarity score.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-135 — Cross-profile recommendation leak proof
Status: planned
Track: Recommendation trust and controls
Priority: P0

## Problem and intended outcome
New profile boundaries need end-to-end evidence that private feedback cannot influence another profile’s shelves.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-069 — Private recommendation isolation audit [complete]
- next-131 — Desk-specific taste controls [planned]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Seed adversarial profiles with distinct private tags, ratings, rejections, exposure and guide settings.
2. Exercise Home, topics, AI Guide, room search and exported recommendation reports across switches.
3. Fix any shared mutable cache keys and record safe aggregate evidence without private fixture text.

## Acceptance checks
- [ ] Changing all private taste signals in Alpha leaves Beta’s public candidates and explanations unchanged.
- [ ] Switch during held ranking work; late results cannot publish into the new profile or its diagnostic export.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-136 — Watch-completion recommendation evidence
Status: planned
Track: Recommendation trust and controls
Priority: P1

## Problem and intended outcome
Watch duration should distinguish actual completion evidence from previews, estimates and abandoned sessions.

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
- next-060 — Feedback experiment replay [complete]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Trace current preview/fullscreen watch observations and define bounded completion-confidence features.
2. Use only supported duration and observed playback intervals when deriving completion evidence.
3. Expose estimated or unavailable evidence in explanations and allow exclusion from taste scoring.

## Acceptance checks
- [ ] A short preview never counts as completing a feature-length video or an unknown-duration live stream.
- [ ] Clock jumps and repeated resume events cannot inflate completion beyond the verified watched interval.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-137 — Recommendation reason provenance
Status: planned
Track: Recommendation trust and controls
Priority: P1

## Problem and intended outcome
Grounded explanations should reveal whether a decisive field came from the owner, provider or imported metadata.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-055 — Tag recommendation confidence [complete]
- next-056 — AI Guide grounded explanation [complete]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Join existing field provenance with the small set of features used in each recommendation explanation.
2. Add concise provenance badges and an inspect action limited to the selected candidate.
3. Treat missing or conflicting provenance as uncertainty rather than inventing a provider observation.

## Acceptance checks
- [ ] A manually corrected game tag is attributed to the owner even after a provider refresh changes its description.
- [ ] Explanation inspection does not traverse unrelated private notes or retain full candidate descriptions.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-138 — Configurable shelf diversity floors
Status: planned
Track: Recommendation trust and controls
Priority: P1

## Problem and intended outcome
A fairness report should support optional measurable diversity constraints in the final visible shelf.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-059 — Recommendation fairness report [complete]
- next-134 — Novelty and familiarity balance [planned]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Use the existing fairness report to baseline creator, source and age concentration for visible shelves.
2. Add conservative opt-in floors with explicit infeasibility reasons when candidates are insufficient.
3. Apply constraints after eligibility checks and before final bounded shelf admission.

## Acceptance checks
- [ ] A dominant creator cannot occupy every slot when enough eligible alternatives satisfy the selected floor.
- [ ] An impossible floor degrades visibly without admitting hidden, rejected or unsupported candidates.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-139 — Cross-session repeat suppression
Status: planned
Track: Recommendation trust and controls
Priority: P1

## Problem and intended outcome
Repeatedly exposed unwatched titles need a controllable cooldown that still allows explicit rediscovery.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-053 — Recommendation exposure ledger [complete]
- next-132 — Recommendation feedback undo timeline [planned]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Reuse the exposure ledger to define bounded repeat windows per shelf and profile.
2. Add an owner-visible cooldown control with exemptions for pinned or explicitly saved titles.
3. Provide a temporary show-suppressed view and avoid treating suppression as negative content feedback.

## Acceptance checks
- [ ] Reloading or opening a second tab does not immediately repeat a suppressed candidate before its cooldown ends.
- [ ] A saved favorite remains reachable and clearing repeat history does not erase ratings or watch progress.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-140 — Portable preference summaries
Status: planned
Track: Recommendation trust and controls
Priority: P2

## Problem and intended outcome
Users need a readable portable summary of their chosen taste settings without exporting hidden activity by default.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-108 — Portable profile configuration packs [complete]
- next-131 — Desk-specific taste controls [planned]
- next-135 — Cross-profile recommendation leak proof [planned]

## Start in
- src/lib/videos/guide-picks.ts
- src/lib/media-feedback.ts
- src/lib/videos/guide-preset.ts

## Implementation
1. Define an allowlisted summary of explicit desk preferences, exclusions and selected feedback counts.
2. Preview private categories and require their inclusion choice separately from public configuration.
3. Import reviewed settings into an empty profile without guessing missing ratings or watch history.

## Acceptance checks
- [ ] The default summary excludes private tags, titles, URLs and raw exposure history from its shareable text.
- [ ] Importing a summary changes only reviewed settings and preserves existing personal feedback on conflict.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-141 — Guest arrival readiness checklist
Status: planned
Track: Shared viewing sessions
Priority: P1

## Problem and intended outcome
A phone guest should understand the exact next action needed before synchronized playback can begin.

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
- next-028 — YouTube embed failure triage [complete]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Map invitation, transport, role, media availability and provider gesture states into a compact guest checklist.
2. Offer only the relevant join, tap-to-start, permission or external-playback action for the selected media.
3. Keep simulated or unverified connectivity separate from real player readiness.

## Acceptance checks
- [ ] A new phone-sized guest reaches the required gesture without toggling host pause/play to guess readiness.
- [ ] An unavailable embed explains its supported fallback while other ready guests remain synchronized.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-142 — Room item transition contract
Status: planned
Track: Shared viewing sessions
Priority: P0

## Problem and intended outcome
Queue changes need one authoritative transition boundary across loading, playback and reconnect messages.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-044 — Per-guest playback readiness [complete]
- next-048 — Reconnect queue intent reconciliation [complete]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Trace current item identity, queue revision and provider-player lifecycle during a next-item transition.
2. Define a versioned transition intent that invalidates stale readiness and clock messages.
3. Preserve guest-local gestures while rebuilding only the player resources required by the new media.

## Acceptance checks
- [ ] Delay messages from the previous item; they cannot pause, seek or mark the new item ready.
- [ ] Rapid skip/back actions settle on the final authoritative item without duplicate queue advancement.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-143 — Guest-local queue drafts
Status: planned
Track: Shared viewing sessions
Priority: P1

## Problem and intended outcome
Guests should be able to collect candidate videos before sending a deliberate bounded suggestion batch.

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
- next-048 — Reconnect queue intent reconciliation [complete]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Add a per-profile room draft list distinct from authoritative queue entries and host receipts.
2. Support reorder, remove and preview with stable source identities and existing shareability rules.
3. Submit explicit bounded batches and retain unsent drafts across transient disconnects.

## Acceptance checks
- [ ] Editing an offline draft never mutates the host queue or marks a suggestion accepted.
- [ ] Reconnect submits each chosen suggestion once and private or revoked sources remain excluded.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-144 — Expiring room host delegation
Status: planned
Track: Shared viewing sessions
Priority: P0

## Problem and intended outcome
Temporary moderation needs bounded authority that ends predictably on expiry or host revocation.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-046 — Room role presets [complete]
- next-048 — Reconnect queue intent reconciliation [complete]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Extend existing role capabilities with explicit delegated scope, issuer and expiry evidence.
2. Validate authority at the host for every mutation and reject stale delegation after reconnect.
3. Show remaining authority clearly and preserve the host’s ability to revoke immediately.

## Acceptance checks
- [ ] A delegated guest can perform only the reviewed actions before expiry and none after revocation.
- [ ] Delayed or replayed packets cannot extend delegation or grant permissions to another peer.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-145 — Queue duplicate review groups
Status: planned
Track: Shared viewing sessions
Priority: P1

## Problem and intended outcome
Equivalent provider links should be reviewable as a group without silently removing intentional repeats.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-036 — Twitch media identity aliases [complete]
- next-048 — Reconnect queue intent reconciliation [complete]
- next-143 — Guest-local queue drafts [planned]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Reuse verified media aliases to identify probable equivalent queued items and retain original requests.
2. Present duplicate groups with provenance and an explicit keep-both or consolidate choice.
3. Apply a chosen queue edit through existing revisioned host authority and preserve guest receipts.

## Acceptance checks
- [ ] Two aliases of the same verified video form one review group while similar titles with different IDs remain separate.
- [ ] Keeping intentional repeats survives reconnect and consolidation never changes the currently playing item unexpectedly.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-146 — Room search result provenance
Status: planned
Track: Shared viewing sessions
Priority: P1

## Problem and intended outcome
Guest search results should explain whether a result is host-shared, locally saved or publicly searched.

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
- next-141 — Guest arrival readiness checklist [planned]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Carry bounded source-origin evidence through current room catalog and public search results.
2. Show media availability and host-sharing requirements before a guest sends a suggestion.
3. Validate provenance against the latest permission revision instead of trusting guest-supplied labels.

## Acceptance checks
- [ ] A guest with an empty library can identify and suggest a host-shared item without seeing its local path.
- [ ] Revoking host sharing removes stale result actions before a delayed suggestion can reach the queue.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-147 — Live-edge drift measurement
Status: planned
Track: Shared viewing sessions
Priority: P1

## Problem and intended outcome
Live rooms need bounded evidence of drift and uncertainty across different provider player capabilities.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-045 — Live latency guidance [complete]
- next-142 — Room item transition contract [planned]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Measure supported live-edge, player-position and observation-age values per ready guest.
2. Expose a compact drift range and distinguish unavailable provider clocks from verified offsets.
3. Use the existing recovery path with hysteresis so measurement noise cannot create seek loops.

## Acceptance checks
- [ ] A changing live-edge estimate does not repeatedly stop/start a healthy guest player.
- [ ] Controlled jitter and missing clock APIs produce honest uncertainty while bounded telemetry remains stable.

## External requirement
Verify at least one permitted live provider session on two devices; simulated clocks alone do not establish mobile playback behavior.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-148 — Host-tab recovery handoff
Status: planned
Track: Shared viewing sessions
Priority: P1

## Problem and intended outcome
A room should offer a deliberate recovery path when its host browser tab disappears.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-047 — Session playlist handoff file [complete]
- next-144 — Expiring room host delegation [planned]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Inspect existing session handoff files and define a bounded local recovery receipt with queue revision.
2. Require explicit host recovery or reviewed transfer rather than automatic authority election from untrusted peers.
3. Invalidate obsolete invitations and reconcile pending guest intents after the new host is confirmed.

## Acceptance checks
- [ ] Closing the original host preserves a recoverable queue snapshot without granting host rights to an arbitrary guest.
- [ ] Recovery restores one authoritative revision and delayed old-host packets cannot alter the resumed room.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-149 — Playlist chapters and intermissions
Status: planned
Track: Shared viewing sessions
Priority: P2

## Problem and intended outcome
Long shared sessions need optional structure without embedding implementation controls into ordinary playback.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-047 — Session playlist handoff file [complete]
- next-142 — Room item transition contract [planned]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Add metadata-only chapter and intermission entries with explicit duration and host ownership.
2. Integrate their advance behavior with the existing queue transition contract and guest accessibility status.
3. Keep saved session exports compatible and require an explicit choice before skipping real media.

## Acceptance checks
- [ ] A planned intermission cannot seek or replace the active video before the host-confirmed transition.
- [ ] Export/import preserves chapter order and guests can understand the next scheduled item on a phone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-150 — Two-phone room release matrix
Status: planned
Track: Shared viewing sessions
Priority: P1

## Problem and intended outcome
Browser viewport emulation cannot validate real mobile autoplay, backgrounding and network handoff behavior.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-141 — Guest arrival readiness checklist [planned]
- next-147 — Live-edge drift measurement [planned]
- next-148 — Host-tab recovery handoff [planned]

## Start in
- src/components/library/watch-room-section.tsx
- src/lib/multiplayer/room-queue.ts
- src/lib/multiplayer/room-roles.ts

## Implementation
1. Create an executable checklist for host/guest roles across local files, permitted VODs and live playback.
2. Record device/browser versions, gesture requirements, Wi-Fi changes and foreground/background transitions.
3. Attach measured drift and recovery artifacts while leaving unsupported provider embeds explicitly unverified.

## Acceptance checks
- [ ] Complete the matrix on two physical phones with no required host pause/play workaround for supported cases.
- [ ] Every failed or unavailable case names the device/provider limitation and remains open instead of being marked passed.

## External requirement
Requires two physical phones and authorized playable media; desktop mobile emulation cannot satisfy this milestone.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-151 — Movie evidence import crosswalk
Status: planned
Track: Library curation and accessibility
Priority: P1

## Problem and intended outcome
Reviewed movie metadata files should enrich matching library items without overwriting personal classification decisions.

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
- next-063 — Movie metadata provenance review [complete]
- next-003 — Backup preflight report [complete]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Define a versioned import format carrying film IDs, titles, years and evidence provenance.
2. Preview exact and ambiguous matches against current film reviews before applying any metadata.
3. Commit accepted matches through the existing mutation path and retain owner overrides plus an import receipt.

## Acceptance checks
- [ ] A mixed import exposes unmatched and ambiguous titles without assigning a film identity automatically.
- [ ] Importing twice is idempotent and undo restores previous evidence without removing personal tags.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-152 — Edition-aware subtitle association
Status: planned
Track: Library curation and accessibility
Priority: P1

## Problem and intended outcome
Different movie cuts need deliberate subtitle associations so a valid subtitle track is not attached to the wrong edition.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-049 — Provider-independent subtitles [complete]
- next-062 — Movie cuts and editions [complete]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Connect existing subtitle attachments to reviewed film edition identities and optional timing offsets.
2. Present language, source filename and edition evidence before the owner confirms an association.
3. Preserve legacy attachments and provide an explicit reassignment workflow with reversible offsets.

## Acceptance checks
- [ ] Two editions of one film retain separate subtitle choices and timing offsets after a reload.
- [ ] An ambiguous edition requires review and a rejected association cannot change the active player track.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-153 — Anime release watchlist
Status: planned
Track: Library curation and accessibility
Priority: P2

## Problem and intended outcome
Expected anime release dates need source and timezone context instead of appearing as confirmed library arrivals.

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
- next-026 — Playlist membership reconciliation [complete]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Add an opt-in watchlist using owner-entered or verified release observations with provenance.
2. Separate expected dates, postponed dates and items actually present in the library.
3. Render timezone-aware reminders locally and cancel obsolete reminders when evidence changes.

## Acceptance checks
- [ ] An expected episode cannot appear as available until a matching library observation exists.
- [ ] Date changes and daylight-saving boundaries update the watchlist without duplicate reminders.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-154 — Series progress aggregation and reset recovery
Status: planned
Track: Library curation and accessibility
Priority: P1

## Problem and intended outcome
Series progress should reconcile local history and explicit owner decisions without silently marking missing episodes watched.

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
- next-066 — Anime next-episode policy [complete]
- next-094 — Destructive action recovery design [complete]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Aggregate verified episode identities and playback completion evidence into bounded series summaries.
2. Offer reviewed reset and correction actions with a compact recoverable previous state.
3. Keep unknown episode order and unavailable files visible rather than guessing completion.

## Acceptance checks
- [ ] Alternate episode numbering and missing entries do not inflate the completed-episode count.
- [ ] A series reset can be undone after reload without affecting another profile’s watch history.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-155 — Local movie collection import previews
Status: planned
Track: Library curation and accessibility
Priority: P1

## Problem and intended outcome
Owners need to bring existing collection lists into Movies without turning every long video into a confirmed film.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-151 — Movie evidence import crosswalk [planned]
- next-061 — Film identity review [complete]
- next-063 — Movie metadata provenance review [complete]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Support a bounded title/year/identifier collection file and validate it before indexing matches.
2. Show probable matches separately from confirmed film evidence and preserve rejected candidates.
3. Save selected collection membership without changing movie eligibility or remote source records.

## Acceptance checks
- [ ] A list containing films, trailers and lectures adds only reviewed members to the intended collection.
- [ ] Malformed rows and cancelled previews leave film classification, original files and saved collections unchanged.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-156 — Photo duplicate review with confidence
Status: planned
Track: Library curation and accessibility
Priority: P2

## Problem and intended outcome
Similar photos need an owner-reviewed duplicate workflow that does not confuse edited versions with expendable files.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-009 — File identity migration ledger [complete]
- next-094 — Destructive action recovery design [complete]
- next-103 — Per-profile storage budget dashboard [planned]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Group exact identities separately from optional perceptual similarity using bounded background work.
2. Expose size, source and confidence evidence while keeping original files and favorites visible.
3. Apply explicit hide or grouping decisions with undo and never delete source files automatically.

## Acceptance checks
- [ ] Resized variants form a review group while unrelated similar colors cannot trigger automatic removal.
- [ ] Cancelling or undoing a review preserves originals, saved likes and profile-specific photo sources.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-157 — Focus return across profile switches
Status: planned
Track: Library curation and accessibility
Priority: P1

## Problem and intended outcome
A profile switch should restore understandable keyboard focus without reusing a private element from the prior profile.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-095 — Keyboard command coverage map [complete]
- next-104 — Pending-edit inventory before profile switch [planned]
- next-105 — Profile identity in application chrome [complete]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Capture a safe route-level focus target before the existing reload-based profile transition.
2. Restore focus to a valid destination heading or control after the new profile is ready.
3. Discard stale item IDs and announce the active profile without reading private previous-profile content.

## Acceptance checks
- [ ] Keyboard-only switching lands on an understandable visible control on desktop and mobile layouts.
- [ ] A deleted destination item falls back safely and no prior-profile title appears in the announcement.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-158 — Accessible alternatives for Stats visualizations
Status: planned
Track: Library curation and accessibility
Priority: P1

## Problem and intended outcome
Charts should provide the same information to screen-reader and reduced-motion users through clear bounded summaries.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-096 — Accessible status announcement policy [complete]
- next-095 — Keyboard command coverage map [complete]
- next-013 — Worker crash recovery [complete]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Inventory current statistics visuals and define meaningful table or text equivalents for each.
2. Expose selected ranges, units and unavailable evidence without requiring hover or animation.
3. Keep large tables paged and derive their totals from the same snapshot as the displayed chart.

## Acceptance checks
- [ ] A keyboard and screen-reader pass can obtain every displayed statistic without using the pointer.
- [ ] Changing the date range updates chart and alternative together without mounting an unbounded table.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-159 — Undoable bulk tag editing
Status: planned
Track: Library curation and accessibility
Priority: P1

## Problem and intended outcome
Large libraries need a reviewable bulk tag workflow that preserves per-item overrides and survives partial failures.

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
- next-054 — Topic alias review workflow [complete]
- next-055 — Tag recommendation confidence [complete]
- next-094 — Destructive action recovery design [complete]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Preview the exact target set and changes before applying bounded tag mutation batches.
2. Record compact inverse operations with profile identity and collection revision evidence.
3. Provide progress, cancel and undo controls that reconcile successfully committed batches only.

## Acceptance checks
- [ ] Cancelling halfway leaves accurate committed counts and undo restores only the edits from that operation.
- [ ] Mixed local and remote items retain unrelated tags after retries, reloads and a quota failure.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-160 — Saved layouts per desk
Status: planned
Track: Library curation and accessibility
Priority: P2

## Problem and intended outcome
Owners should be able to keep useful display preferences for each media desk without carrying stale result or player state.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-121 — Saved search workspaces [planned]
- next-125 — Browse task back-and-forward history [planned]
- next-131 — Desk-specific taste controls [planned]

## Start in
- src/lib/videos/film-review.ts
- src/lib/videos/anime-review.ts
- src/components/library/photos-section.tsx
- src/lib/videos/store.ts

## Implementation
1. Define a small versioned layout preference schema covering supported density and shelf options.
2. Apply validated per-profile preferences at route entry without delaying the first useful render.
3. Offer a reversible desk-only reset and ignore obsolete values after application upgrades.

## Acceptance checks
- [ ] YouTube and Movies can retain different layouts across reload without altering each other’s preferences.
- [ ] Invalid saved values recover to a usable mobile layout while content, filters and playback history stay intact.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-161 — Companion startup readiness receipts
Status: planned
Track: Companion operations
Priority: P1

## Problem and intended outcome
A running process should not be presented as ready until the requested Companion capabilities are actually available.

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
- next-079 — Companion update health checklist [complete]
- next-091 — Sensitive export redaction review [complete]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Record bounded startup stages for configuration, approved roots and advertised capabilities.
2. Expose a redacted readiness receipt through the existing authenticated/origin-checked health path.
3. Link actionable failures to existing recovery controls without repeatedly restarting a healthy process.

## Acceptance checks
- [ ] A Companion with an invalid approved root reports the affected capability honestly while healthy features remain usable.
- [ ] Repeated readiness checks reuse a bounded receipt and never expose full private paths in support exports.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-162 — Companion log rotation and support bundle
Status: planned
Track: Companion operations
Priority: P1

## Problem and intended outcome
Long-running Companion diagnostics need bounded disk usage and a reviewed redacted export path.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-091 — Sensitive export redaction review [complete]
- next-073 — Approved-root change audit [complete]
- next-161 — Companion startup readiness receipts [planned]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Introduce size and age limits for application-owned logs with atomic rotation and failure handling.
2. Create an explicit support preview showing included files, redaction results and total bytes.
3. Export only reviewed diagnostic entries and retain a visible omission summary for unavailable logs.

## Acceptance checks
- [ ] Repeated failures cannot grow logs beyond the configured envelope or delete files outside the owned log directory.
- [ ] A support bundle omits credentials and rooted private filenames while preserving useful error categories.

## External requirement
Verify rotation with the local Companion and a disposable approved diagnostic directory; do not collect arbitrary system logs.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-163 — Rooted-file job previews
Status: planned
Track: Companion operations
Priority: P0

## Problem and intended outcome
Native file jobs should explain their approved source and intended effects before the owner starts a large operation.

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
- next-076 — Download disk-budget preflight [complete]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Build bounded dry-run receipts from existing root-gated file operations and capability checks.
2. Show counts, estimated bytes and rejected paths before enqueueing an owner-approved job.
3. Bind job execution to the reviewed root identity and reject changed or escaped paths at execution time.

## Acceptance checks
- [ ] A symlink or relocated path outside the approved root cannot be executed from an earlier successful preview.
- [ ] Cancelling a preview creates no job and a confirmed small fixture affects only the reviewed files.

## External requirement
Native file verification requires an explicitly approved disposable root; the roadmap does not grant access to other directories.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-164 — Companion path relocation map
Status: planned
Track: Companion operations
Priority: P1

## Problem and intended outcome
Moving an approved library folder should have an explicit identity-preserving reconciliation path.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-009 — File identity migration ledger [complete]
- next-073 — Approved-root change audit [complete]
- next-163 — Rooted-file job previews [planned]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Preview old-to-new approved root mappings using durable file identities and relative paths.
2. Separate exact matches, missing files and ambiguous collisions before applying a relocation.
3. Commit reviewed references transactionally and keep a reversible mapping receipt without moving files.

## Acceptance checks
- [ ] A relocated fixture retains watch history and collection membership for exact identity matches.
- [ ] Ambiguous names remain unresolved and a failed commit leaves the previous references recoverable.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-165 — Offline Companion update preparation
Status: planned
Track: Companion operations
Priority: P2

## Problem and intended outcome
Owners need a verifiable update checklist when the Companion computer cannot reach release services.

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
- next-080 — Cross-platform local integration contract [complete]
- next-161 — Companion startup readiness receipts [planned]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Extend the existing manual update flow with a versioned offline manifest and capability requirements.
2. Verify an owner-selected package checksum and display provenance plus compatibility before handoff.
3. Keep installation a separate explicit native action and preserve the last known working configuration.

## Acceptance checks
- [ ] A mismatched package or incompatible protocol is rejected before any installation step becomes available.
- [ ] A valid offline preparation receipt explains remaining installation and rollback checks without claiming the binary was updated.

## External requirement
Actual package installation or service replacement requires the owner’s explicit authorization and a trusted local artifact.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-166 — Download metadata reconciliation transaction
Status: planned
Track: Companion operations
Priority: P1

## Problem and intended outcome
Finished downloads should link local files to provider publication evidence without replacing it with download time.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-027 — YouTube publication uncertainty [complete]
- next-072 — Companion task queue recovery [complete]
- next-001 — Crash-safe catalog mutations [complete]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Stage completed-file metadata alongside verified provider identity and publication provenance.
2. Reconcile the local catalog in one recoverable transaction and retain the download receipt separately.
3. Handle duplicate completion callbacks and unavailable provider metadata without inventing publication dates.

## Acceptance checks
- [ ] A downloaded old video retains its verified original publication date and a distinct download timestamp.
- [ ] A crash between file completion and catalog update can resume without duplicate items or lost metadata.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-167 — Download retry idempotency by media identity
Status: planned
Track: Companion operations
Priority: P1

## Problem and intended outcome
Retrying a failed download should not create duplicate native jobs for alternate links to the same media.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-036 — Twitch media identity aliases [complete]
- next-072 — Companion task queue recovery [complete]
- next-166 — Download metadata reconciliation transaction [planned]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Derive job identity from verified provider aliases plus selected output format and approved destination.
2. Reuse active or completed receipts only when their destination and file evidence still match.
3. Provide explicit retry or new-output choices when parameters differ or an earlier file is missing.

## Acceptance checks
- [ ] Two equivalent video links share one active job while distinct formats remain deliberate separate requests.
- [ ] A missing output can be retried safely and a late callback cannot overwrite another job’s receipt.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-168 — Cancellable thumbnail extraction batches
Status: planned
Track: Companion operations
Priority: P1

## Problem and intended outcome
Large local thumbnail jobs need bounded CPU work and prompt cancellation when the owner leaves or pauses them.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-016 — Artwork decode cancellation [complete]
- next-072 — Companion task queue recovery [complete]
- next-074 — Local media health remediation [complete]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Introduce a capability-scoped extraction queue with bounded native worker count and result bytes.
2. Check cancellation and file identity between extraction stages and release subprocess resources.
3. Persist compact resumable progress only at meaningful checkpoints rather than on every frame.

## Acceptance checks
- [ ] Cancelling a large fixture stops new extraction promptly and leaves no orphaned media subprocesses.
- [ ] Resuming skips verified completed items and a changed source file receives a fresh thumbnail instead of stale output.

## External requirement
Exercise the local extraction tool using approved sample files; browser-only mocks cannot establish subprocess cleanup.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-169 — Companion disk cache eviction budget
Status: planned
Track: Companion operations
Priority: P1

## Problem and intended outcome
Native thumbnail and poster caches need an owner-visible disk budget that cannot evict original media.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-073 — Approved-root change audit [complete]
- next-076 — Download disk-budget preflight [complete]
- next-168 — Cancellable thumbnail extraction batches [planned]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Inventory only application-owned cache entries and track size plus recent verified use.
2. Evict eligible generated entries in bounded batches while protecting active writes and current playback assets.
3. Expose reclaimed bytes, failures and rebuild behavior without walking unrelated disk locations.

## Acceptance checks
- [ ] A small cache budget reclaims generated fixtures while source media and active writes remain untouched.
- [ ] Permission failures keep an accurate pending total and the browser can regenerate an evicted thumbnail on demand.

## External requirement
Validate with a disposable application cache root and configured local Companion; do not use original library folders as eviction fixtures.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-170 — Companion service restart controls in Settings
Status: planned
Track: Companion operations
Priority: P1

## Problem and intended outcome
Existing desktop start/stop scripts need an understandable in-app status and deliberate local restart flow.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-161 — Companion startup readiness receipts [planned]
- next-072 — Companion task queue recovery [complete]
- next-079 — Companion update health checklist [complete]

## Start in
- companion/reelcase-companion.mjs
- src/lib/companion.ts
- src/components/library/companion-recovery-panel.tsx
- src/lib/companion-update.ts

## Implementation
1. Inspect supported launcher/service controls and advertise restart capability only when implemented safely.
2. Show current readiness and require a reviewed action that warns about active native jobs.
3. Wait for bounded readiness recovery and offer the existing desktop launch instructions if reconnection fails.

## Acceptance checks
- [ ] An unsupported Companion shows guidance instead of a restart button that cannot work.
- [ ] A supported restart preserves queued receipts, blocks duplicate restart requests and reports recovery or timeout honestly.

## External requirement
A real native restart requires explicit owner initiation; do not kill unrelated processes or infer authority from a milestone status.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-171 — Image recipe parameter migration
Status: planned
Track: Creative workflow continuity
Priority: P1

## Problem and intended outcome
Saved generation recipes need explicit parameter migration when engine schemas change.

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
- next-085 — Reproducible generation recipes [complete]
- next-087 — Stream Signal pack revisions [complete]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Version recipe parameter schemas and compare saved values against the connected engine’s advertised contract.
2. Preview migrated, dropped and unsupported settings before creating a new runnable recipe revision.
3. Retain the original recipe and distinguish a successful conversion from a completed generation job.

## Acceptance checks
- [ ] An old recipe with removed parameters produces a reviewable conversion and remains available unchanged.
- [ ] Rejected migrations cannot submit a job and converted recipes preserve prompt, seed and supported model references.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-172 — Engine-specific model compatibility cards
Status: planned
Track: Creative workflow continuity
Priority: P1

## Problem and intended outcome
A model’s name alone cannot tell owners whether it runs in their selected image engine.

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
- next-171 — Image recipe parameter migration [planned]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Map inspected artifact metadata to engine architecture, component and precision requirements.
2. Show evidence-backed compatibility, missing components and uncertainty beside the existing model notes.
3. Validate current official engine/model documentation during implementation and keep downloads owner-initiated.

## Acceptance checks
- [ ] Unsupported language-model artifacts are not offered as runnable diffusion checkpoints based only on a matching name.
- [ ] A supported fixture identifies required components and an unknown artifact remains unverified rather than ready.

## External requirement
Verify real compatibility with an owner-selected installed model and configured engine; do not download large models automatically.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-173 — Image generation batch review queue
Status: planned
Track: Creative workflow continuity
Priority: P1

## Problem and intended outcome
Multiple planned image jobs need a review step that makes resource use and engine readiness clear.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-076 — Download disk-budget preflight [complete]
- next-084 — Generation job lifecycle [complete]
- next-171 — Image recipe parameter migration [planned]
- next-172 — Engine-specific model compatibility cards [planned]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Stage bounded job drafts with explicit model, dimensions, count and per-job parameters.
2. Preview estimated output footprint and unsupported settings before the owner confirms submission.
3. Execute through existing job lifecycle controls with cancellation, partial completion and resumable receipts.

## Acceptance checks
- [ ] Reviewing or editing a batch cannot start inference and a rejected job does not block unrelated valid drafts.
- [ ] Cancelling a submitted fixture preserves completed outputs and accurately labels pending versus acknowledged cancellation.

## External requirement
Real inference requires the configured local engine and explicit submission; estimates do not guarantee GPU memory availability.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-174 — Curated studio output import into library
Status: planned
Track: Creative workflow continuity
Priority: P2

## Problem and intended outcome
Generated outputs need an explicit reviewed path into Photos without duplicating files or losing recipe provenance.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-086 — Image output storage policy [complete]
- next-009 — File identity migration ledger [complete]
- next-156 — Photo duplicate review with confidence [planned]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Select generated outputs from the existing retention catalog and preview library import identities.
2. Carry safe recipe provenance and owner tags without copying private engine paths into exports.
3. Commit selected references through the existing photo store and retain a reversible import receipt.

## Acceptance checks
- [ ] Importing the same selected outputs twice produces one library entry per verified identity.
- [ ] Removing an imported reference does not delete the original output or erase unrelated photo likes.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-175 — Per-model prompt draft history
Status: planned
Track: Creative workflow continuity
Priority: P2

## Problem and intended outcome
Prompt experiments should retain compact revision history without leaking drafts between profiles or models.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-085 — Reproducible generation recipes [complete]
- next-087 — Stream Signal pack revisions [complete]
- next-103 — Per-profile storage budget dashboard [planned]
- next-172 — Engine-specific model compatibility cards [planned]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Store bounded prompt revisions by profile and verified model identity with explicit save points.
2. Provide compare and restore controls that preserve the current draft before replacing its text.
3. Exclude prompt history from routine diagnostics and reconcile renamed model references using reviewed aliases.

## Acceptance checks
- [ ] Restoring a prompt changes only the selected model’s draft and can be reversed after reload.
- [ ] Revision limits and quota errors keep the last durable draft intact without silently discarding newer text.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-176 — Print edit comparison and revert
Status: planned
Track: Creative workflow continuity
Priority: P1

## Problem and intended outcome
Print editing needs a clear comparison against saved state before a large transform or workspace change is accepted.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-078 — Print model save transaction [complete]
- next-094 — Destructive action recovery design [complete]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Capture bounded baseline transform and material state using existing print edit persistence.
2. Offer visual and numeric comparison plus a reviewed revert that retains the current working revision.
3. Keep file-save state separate from workspace-only changes and preserve unsupported original geometry.

## Acceptance checks
- [ ] Reverting a transform restores the selected baseline without rewriting the source model file.
- [ ] A failed native save cannot label an unsaved workspace as durable and the previous edit remains recoverable.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-177 — Print workspace resource disposal audit
Status: planned
Track: Creative workflow continuity
Priority: P1

## Problem and intended outcome
Repeated model changes should release GPU and worker resources rather than slowly exhausting the app.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-016 — Artwork decode cancellation [complete]
- next-176 — Print edit comparison and revert [planned]
- next-012 — Provider payload allocation budget [complete]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Instrument application-owned geometries, materials, object URLs and worker lifetimes across model switches.
2. Dispose replaced resources after active consumers release them and cancel obsolete decode work.
3. Add a repeatable bounded fixture comparing steady-state allocations before and after repeated viewer entry.

## Acceptance checks
- [ ] Repeated open/close cycles plateau within a documented resource envelope and leave no growing worker count.
- [ ] A cancelled decode cannot attach a disposed model and the next valid model still renders correctly.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-178 — Announcement platform draft limit matrix
Status: planned
Track: Creative workflow continuity
Priority: P1

## Problem and intended outcome
Editable announcement packs need source-backed platform guidance without treating copied text as publication.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-087 — Stream Signal pack revisions [complete]
- next-088 — Announcement card accessibility [complete]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Verify current official composer constraints and document their date plus platform/account applicability.
2. Apply advisory per-platform draft validation while preserving both stream links and owner edits.
3. Keep Copy, Open and manual Mark shared independent and offer clear Story/profile link placement guidance.

## Acceptance checks
- [ ] A long X draft receives actionable validation without truncating the saved original or marking it shared.
- [ ] Opening any composer preserves publication state and platform guidance identifies unverified or changed constraints.

## External requirement
Check current official platform documentation during implementation; personal Facebook/Instagram accounts remain manual sharing integrations.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-179 — Stream Signal schedule reminders
Status: planned
Track: Creative workflow continuity
Priority: P2

## Problem and intended outcome
Planned streams need optional reminders that prepare an announcement workflow without silently posting it.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-026 — Playlist membership reconciliation [complete]
- next-087 — Stream Signal pack revisions [complete]
- next-178 — Announcement platform draft limit matrix [planned]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Add timezone-aware local schedule drafts with explicit reminder opt-in and duplicate event identity.
2. Use an existing suitable scheduler only when configured and show unconfigured or missed reminders honestly.
3. Open the associated editable pack on reminder activation while retaining manual publication checklist semantics.

## Acceptance checks
- [ ] Editing a scheduled stream replaces its reminder rather than creating duplicates across reloads.
- [ ] A missed or unavailable scheduler never claims delivery and triggering a reminder cannot mark any post published.

## External requirement
Background reminders need an existing authorized scheduler or supported notification permission; the website cannot guarantee delivery while closed.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-180 — Chat Plays conditional sequence editor
Status: planned
Track: Creative workflow continuity
Priority: P1

## Problem and intended outcome
The batching simulator needs a reviewable way to express conditional moves without implying control of a real game.

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
- next-090 — Local racing adapter contract [complete]

## Start in
- src/lib/studio-recipes.ts
- src/lib/studio-jobs.ts
- src/lib/studio-model-notes.ts
- src/lib/print-edit-state.ts
- src/lib/stream-signal.ts
- src/lib/stream-signal-lab.ts

## Implementation
1. Define a bounded simulator-only sequence schema with state conditions, freshness limits and interruption rules.
2. Preview valid transitions and reject impossible or unbounded plans before accepting a ballot.
3. Execute using the existing deterministic queue and log every skip, timeout and emergency-stop cancellation.

## Acceptance checks
- [ ] A sequence whose precondition becomes false is stopped or skipped according to its explicit policy.
- [ ] Emergency stop clears votes and pending moves and the interface continues to label all generated chat as simulated.

## External requirement
Real iRacing control still requires a separate authenticated local game adapter; simulator acceptance does not establish installed-game control.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-181 — Background-tab suspension evidence
Status: planned
Track: Runtime efficiency and resilience
Priority: P1

## Problem and intended outcome
Hidden tabs need measurable reductions in work without breaking active room or native-job responsibilities.

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
- next-018 — Page-specific network priority proof [complete]
- next-019 — Reduced-data transfer accounting [complete]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Inventory timers and subscriptions by visibility, active playback and room-host responsibility.
2. Suspend eligible discovery and rendering work while preserving explicitly necessary session duties.
3. Record bounded counters for hidden/visible transitions and reconcile one refresh on return.

## Acceptance checks
- [ ] A hidden idle tab stops optional provider work and does not accumulate refreshes to replay on focus.
- [ ] An active host or download receipt remains correct through backgrounding with documented necessary work only.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-182 — Catalog hot and cold memory partition
Status: planned
Track: Runtime efficiency and resilience
Priority: P1

## Problem and intended outcome
Large catalogs should keep active working sets responsive without retaining every rich media record in memory.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-012 — Provider payload allocation budget [complete]
- next-013 — Worker crash recovery [complete]
- next-002 — Storage pressure recovery [complete]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Measure retained metadata across route, player and search consumers before proposing a partition.
2. Keep compact identities and active records hot while reading cold details through existing bounded storage paths.
3. Evict inactive detail references with observable hit/miss counters and safe recovery for missing records.

## Acceptance checks
- [ ] A large fixture shows bounded retained detail records after repeated desk switching without losing search coverage.
- [ ] Cold-detail read failures produce recoverable placeholders while active playback and owner edits remain intact.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-183 — Sparse metadata compaction budget
Status: planned
Track: Runtime efficiency and resilience
Priority: P1

## Problem and intended outcome
Long-lived sparse records need bounded compaction that does not block input or erase meaningful false values.

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
- next-002 — Storage pressure recovery [complete]
- next-014 — IndexedDB cursor backpressure [complete]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Audit sparse field semantics and identify reclaimable obsolete entries using current schema rules.
2. Compact in cancellable idle slices with byte and mutation budgets plus recoverable checkpoints.
3. Preserve explicit false, zero and empty-owner overrides and expose measured work in diagnostics.

## Acceptance checks
- [ ] Compaction of a large fixture stays within the documented interaction budget and resumes safely after interruption.
- [ ] Round-trip assertions preserve meaningful sparse values and failure leaves the preceding durable snapshot readable.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-184 — Transferable worker-result contracts
Status: planned
Track: Runtime efficiency and resilience
Priority: P1

## Problem and intended outcome
Search and ranking workers need explicit ownership rules so large result transfers do not multiply memory.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-013 — Worker crash recovery [complete]
- next-015 — Budget expensive recommendation passes [complete]
- next-182 — Catalog hot and cold memory partition [planned]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Inventory worker payload sizes and identify safe typed-array transfer opportunities with versioned contracts.
2. Validate ownership, length and cancellation generation on both sides before consuming a result.
3. Release obsolete results promptly and retain a bounded fallback for environments lacking supported transfer behavior.

## Acceptance checks
- [ ] A large result fixture avoids duplicate retained buffers and stale generations cannot replace current search results.
- [ ] Worker restart and malformed payloads recover without blanking valid prior results or leaking detached buffers.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-185 — Provider cache lifetime traces
Status: planned
Track: Runtime efficiency and resilience
Priority: P2

## Problem and intended outcome
Cache growth needs explainable ownership and expiry evidence so old entries cannot survive indefinitely by accident.

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
- next-091 — Sensitive export redaction review [complete]
- next-181 — Background-tab suspension evidence [planned]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Attach compact creation, use, expiry and ownership metadata to application-managed provider cache families.
2. Expose a bounded diagnostic summary rather than logging each cache hit or private request URL.
3. Exercise expiry, profile switch and eviction with deterministic clocks and production-size fixtures.

## Acceptance checks
- [ ] Expired fixture entries are reclaimed without removing a valid active request result or crossing profile boundaries.
- [ ] Diagnostic export shows bounded cache counts and age bands while excluding private search text and cookies.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-186 — Route-prefetch pressure audit
Status: planned
Track: Runtime efficiency and resilience
Priority: P1

## Problem and intended outcome
Prefetching should improve likely navigation without competing with video entry or large active pulls.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-018 — Page-specific network priority proof [complete]
- next-019 — Reduced-data transfer accounting [complete]
- next-181 — Background-tab suspension evidence [planned]
- next-185 — Provider cache lifetime traces [planned]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Measure existing route warming against network priority and low-memory mode before changing policy.
2. Bound concurrent prefetches by interaction intent, connection budget and page visibility.
3. Cancel obsolete warming and record whether prefetched work was used before its expiry.

## Acceptance checks
- [ ] Opening a provider video under a pull backlog retains first-click priority and cancels unnecessary warming.
- [ ] Touch navigation and reduced-data mode avoid speculative downloads beyond the documented budget.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-187 — Storage notification storm coalescing
Status: planned
Track: Runtime efficiency and resilience
Priority: P1

## Problem and intended outcome
Large batch writes should notify interested views once per meaningful checkpoint rather than once per item.

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
- next-014 — IndexedDB cursor backpressure [complete]
- next-159 — Undoable bulk tag editing [planned]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Trace storage and custom-event fanout for imports, tag edits and provider acceptance batches.
2. Coalesce compatible notifications by profile and collection revision while preserving required ordering.
3. Ensure subscribed selectors receive the latest durable snapshot after errors and cancelled batches.

## Acceptance checks
- [ ] A thousand-item fixture produces bounded notification and render counts while its final visible state is correct.
- [ ] Profile switches and partial failures cannot merge unrelated events or suppress the final committed update.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-188 — Nonblocking profile validation measurement
Status: planned
Track: Runtime efficiency and resilience
Priority: P0

## Problem and intended outcome
Profile validation must protect saved data while keeping the first useful screen and switch feedback responsive.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-104 — Pending-edit inventory before profile switch [planned]
- next-109 — Profile registry repair preview [planned]
- next-135 — Cross-profile recommendation leak proof [planned]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Measure registry parsing, storage checks and destination initialization on realistically large profiles.
2. Move eligible validation into bounded phases while gating access to data that has not been verified.
3. Expose readable progress and recoverable failures without weakening namespace or checkpoint guarantees.

## Acceptance checks
- [ ] A large profile fixture reaches a useful progress screen within the recorded interaction budget.
- [ ] Invalid registry data fails closed for the affected profile and cannot expose another profile’s catalog during recovery.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-189 — Reproducible mobile CPU-throttle checks
Status: planned
Track: Runtime efficiency and resilience
Priority: P1

## Problem and intended outcome
Desktop success needs a repeatable low-power browser check for typing, scrolling and first video entry.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-012 — Provider payload allocation budget [complete]
- next-020 — Performance release artifact comparison [planned]
- next-186 — Route-prefetch pressure audit [planned]
- next-188 — Nonblocking profile validation measurement [planned]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Define controlled device emulation, CPU throttling and seeded library fixtures with recorded environment metadata.
2. Measure bounded user journeys across search, Live and Watch together without uncontrolled provider traffic.
3. Store baselines and variance so regressions fail on meaningful thresholds rather than one noisy sample.

## Acceptance checks
- [ ] The checked journeys retain usable input and no horizontal overflow at the recorded mobile viewport.
- [ ] A deliberately injected blocking task is detected and unavailable physical-device cases remain labelled unverified.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-190 — Memory regression bisection snapshots
Status: planned
Track: Runtime efficiency and resilience
Priority: P1

## Problem and intended outcome
Memory regressions need comparable lifecycle snapshots that identify retained resources without collecting private content.

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
- next-020 — Performance release artifact comparison [planned]
- next-091 — Sensitive export redaction review [complete]
- next-177 — Print workspace resource disposal audit [planned]
- next-182 — Catalog hot and cold memory partition [planned]

## Start in
- src/lib/periodic-scheduler.ts
- src/components/library/library-app.tsx
- src/lib/videos/store.ts
- src/lib/sparse-record.ts
- src/lib/warm-route-cache.ts
- src/lib/provider-cache-metrics.ts

## Implementation
1. Define redacted counters and reproducible route/player cycles using seeded local fixtures.
2. Capture comparable snapshots before and after controlled idle/cleanup boundaries with environment metadata.
3. Provide a local comparison report separating expected caches, retained consumers and unresolved native/browser allocations.

## Acceptance checks
- [ ] A deliberately leaked fixture produces a growing retained-resource delta across repeated cycles.
- [ ] A stable build yields a documented plateau and exports contain counters instead of titles, media bytes or credentials.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-191 — Evidence links in feature readiness registry
Status: planned
Track: Quality gates and release practice
Priority: P1

## Problem and intended outcome
Readiness labels should link to concrete validation and disclose which checks still need a real integration.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-098 — Feature readiness inventory [complete]
- next-100 — Model-executable release handoff [planned]
- next-091 — Sensitive export redaction review [complete]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Extend readiness entries with bounded local evidence references, verification date and artifact type.
2. Validate referenced artifacts during release checks and distinguish fixture, browser and external results.
3. Render concise evidence summaries without exposing private paths or claiming old evidence validates new source changes.

## Acceptance checks
- [ ] A readiness entry with missing or stale evidence cannot display a fully verified release state.
- [ ] Users can distinguish a mocked adapter check from a successful real-device session in the rendered panel.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-192 — Provider fixture freshness registry
Status: planned
Track: Quality gates and release practice
Priority: P1

## Problem and intended outcome
Provider parser fixtures need provenance and refresh criteria so stale examples do not create false confidence.

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
- next-040 — Twitch pull canary runner [complete]
- next-068 — Adult pull quality fixtures [complete]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Inventory fixtures by provider endpoint shape, capture date and sanitized provenance without storing session secrets.
2. Define refresh triggers for schema changes, empty catalogs and parser fallbacks with an explicit review owner.
3. Make coverage reports separate deterministic parser success from current live-provider availability.

## Acceptance checks
- [ ] An intentionally obsolete fixture is flagged by the registry while its historical parser test remains reproducible.
- [ ] A release report identifies providers lacking a recent authorized canary instead of claiming live compatibility.

## External requirement
Fresh provider captures require permitted public or owner-authorized requests; do not harvest private pages or authentication material.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-193 — Schema compatibility release window
Status: planned
Track: Quality gates and release practice
Priority: P0

## Problem and intended outcome
App and Companion versions need a documented compatibility window before durable schema changes are released.

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
- next-071 — Companion protocol negotiation [complete]
- next-080 — Cross-platform local integration contract [complete]
- next-099 — Release rollback drill [planned]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Inventory persisted schemas and wire protocols affected by a candidate release using explicit version markers.
2. Specify supported reader/writer combinations and gate incompatible operations with actionable recovery guidance.
3. Add old/new fixture pairs that prove supported upgrades and reject unsupported downgrade writes.

## Acceptance checks
- [ ] An older supported client can read the documented compatible fixture without losing newer fields.
- [ ] An incompatible writer is blocked before mutation and points to the precise migration or restore requirement.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-194 — App self-check without provider traffic
Status: planned
Track: Quality gates and release practice
Priority: P1

## Problem and intended outcome
A local readiness check should diagnose app health without triggering expensive media pulls or exposing private data.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-091 — Sensitive export redaction review [complete]
- next-098 — Feature readiness inventory [complete]
- next-191 — Evidence links in feature readiness registry [planned]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Compose bounded checks for storage access, worker startup, configured capability state and current route assets.
2. Run only on explicit user action and offer cancellation plus a redacted downloadable result.
3. Separate missing optional services from broken core behavior and link failures to existing recovery controls.

## Acceptance checks
- [ ] Running self-check in an offline fixture makes no external provider requests and completes within its timeout.
- [ ] Unavailable optional engines remain unconfigured while storage corruption is surfaced as an actionable failure.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-195 — Upgrade dry run over persisted profiles
Status: planned
Track: Quality gates and release practice
Priority: P0

## Problem and intended outcome
Release candidates should validate representative saved profiles before the owner’s real state is migrated.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-010 — Portable profile boundaries [complete]
- next-099 — Release rollback drill [planned]
- next-109 — Profile registry repair preview [planned]
- next-193 — Schema compatibility release window [planned]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Create disposable profile snapshots covering legacy keys, large catalogs, manual milestone states and recovery slots.
2. Run candidate migrations against copies and compare identity, counts, overrides and rollback readability.
3. Generate a reviewable discrepancy report without writing to the owner’s live profile or authentication state.

## Acceptance checks
- [ ] A deliberately destructive migration fails the dry run with the affected schema and missing records identified.
- [ ] A valid candidate preserves every seeded custom decision and leaves the original fixture bytes unchanged.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-196 — Long-session completion rubric
Status: planned
Track: Quality gates and release practice
Priority: P1

## Problem and intended outcome
The open long-session work needs an explicit completion rubric that cannot be satisfied by a short smoke test.

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
- next-020 — Performance release artifact comparison [planned]
- next-181 — Background-tab suspension evidence [planned]
- next-190 — Memory regression bisection snapshots [planned]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Define the full-duration journey, provider substitutions, background phases and memory/latency limits before running it.
2. Record checkpoints, interruptions and environment details with a reproducible artifact manifest.
3. Keep incomplete or interrupted runs open and link the final evidence to the corresponding original milestones.

## Acceptance checks
- [ ] A shortened run is reported as partial and cannot mark the eight-hour milestone complete.
- [ ] A full qualifying run includes all required checkpoints and documents unresolved provider or native memory limits.

## External requirement
Requires a complete measured long-duration run on the intended environment; simulated clocks and quick fixtures do not satisfy elapsed-time evidence.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-197 — Fault-injection release suite
Status: planned
Track: Quality gates and release practice
Priority: P0

## Problem and intended outcome
A release should demonstrate graceful recovery from common failures rather than only passing healthy-path tests.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-014 — IndexedDB cursor backpressure [complete]
- next-038 — Twitch live batch fault isolation [complete]
- next-094 — Destructive action recovery design [complete]
- next-195 — Upgrade dry run over persisted profiles [planned]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Build deterministic injected failures for quota, aborted requests, stale worker results and Companion disconnects.
2. Assert preserved durable state plus clear recovery actions for each affected workflow.
3. Keep fault hooks test-only and produce bounded release artifacts that identify which paths were exercised.

## Acceptance checks
- [ ] Each injected failure leaves a readable previous state and its documented retry or undo action succeeds.
- [ ] The production build exposes no public fault toggle and unrelated profile data remains unchanged during the suite.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-198 — Executable workflow handoff fixtures
Status: planned
Track: Quality gates and release practice
Priority: P1

## Problem and intended outcome
Models implementing future milestones need compact end-to-end fixtures showing the real workflow and failure boundary.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-100 — Model-executable release handoff [planned]
- next-191 — Evidence links in feature readiness registry [planned]
- next-192 — Provider fixture freshness registry [planned]
- next-197 — Fault-injection release suite [planned]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Define seeded journeys for import, search, watch-room queue, archive continuation and manual announcement sharing.
2. Attach expected durable changes, bounded resource limits and explicit integration prerequisites to each fixture.
3. Keep examples versioned beside the owning tests and validate links from milestone execution briefs.

## Acceptance checks
- [ ] A model can run each fixture without private credentials and obtain a machine-readable pass or actionable skip.
- [ ] Fixtures fail when their expected durable change is removed and never substitute a skip for real integration verification.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-199 — User-visible changelog with migration notes
Status: planned
Track: Quality gates and release practice
Priority: P2

## Problem and intended outcome
Owners need a concise record of useful changes and any migration or reconnection work required after an update.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-105 — Profile identity in application chrome [complete]
- next-191 — Evidence links in feature readiness registry [planned]
- next-193 — Schema compatibility release window [planned]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Generate a versioned changelog from reviewed delivered changes with feature and migration categories.
2. Link required recovery actions to existing Settings controls without exposing internal implementation trivia.
3. Preserve a bounded local read marker and show newly relevant notes once per profile.

## Acceptance checks
- [ ] A release with a required profile migration displays its action before hiding the note as read.
- [ ] Revisiting older notes works offline and updating the app does not reset another profile’s read state.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.

---

# next-200 — Release candidate evidence bundle
Status: planned
Track: Quality gates and release practice
Priority: P1

## Problem and intended outcome
The next roadmap wave needs a final reviewable release packet that ties implementation claims to reproducible evidence.

## Execution contract
1. Read AGENTS.md and applicable project instructions, inspect the listed entry points and existing tests, and reproduce the gap before editing. These are follow-up goals, not claims that every listed defect is already proven.
2. Work inside the existing app and current framework, styling, authentication and persistence. Reuse delivered behavior; do not rebuild a completed feature just to satisfy the title. If the gap is already solved, demonstrate the exact acceptance criteria and record evidence.
3. Check dependencies by milestone ID before dependent implementation. Preserve manual statuses, private/adult boundaries, saved media, ratings, tags, locks, history and drafts. Use additive versioned migrations and never reset real user data for a test.
4. Keep requests, queues, memory, DOM and storage writes bounded. Do not raise automatic provider budgets or add polling without measured justification. Keep credentials server-side or in the approved local integration; do not weaken provider restrictions.
5. Implement the complete normal, failure and recovery path. Add focused behavioral tests, exercise interactive changes in isolated desktop and mobile browsers, and run the relevant build/type checks. Distinguish deterministic fixtures from real providers and physical devices.
6. Record changed files, baseline, commands/results, evidence artifacts and external dependencies. Mark complete only when every acceptance check is evidenced; otherwise keep the appropriate planned/in-progress/blocked state with a concrete remaining requirement.
7. Downloads, publishing, external messages, paid services, real remote desktop sessions and game control require their own applicable user authorization. A roadmap item does not grant blanket authorization for external actions.

## Dependencies
- next-191 — Evidence links in feature readiness registry [planned]
- next-193 — Schema compatibility release window [planned]
- next-195 — Upgrade dry run over persisted profiles [planned]
- next-196 — Long-session completion rubric [planned]
- next-197 — Fault-injection release suite [planned]
- next-198 — Executable workflow handoff fixtures [planned]
- next-199 — User-visible changelog with migration notes [planned]

## Start in
- src/lib/feature-readiness.ts
- src/components/library/feature-readiness-panel.tsx
- src/lib/diagnostic-export.ts
- scripts/browser-smoke.mjs
- MILESTONE_VERIFICATION.md

## Implementation
1. Collect candidate revision, schema versions, focused tests, build/type checks and desktop/mobile production artifacts.
2. Include outstanding external checks, long-session results, rollback instructions and explicitly deferred milestones.
3. Validate artifact links and publish only an owner-reviewed local bundle with redacted diagnostics and preserved source provenance.

## Acceptance checks
- [ ] A missing required production or migration artifact keeps the release candidate unverified with a concrete reason.
- [ ] The bundle distinguishes delivered work from planned rows and allows another model to reproduce checks without private data.

## External requirement
External publishing, deployment and native installation remain separate owner-authorized actions; assembling this local bundle does not authorize them.
Do not claim this external requirement passed from fixtures alone.

## Required handoff
Changed files; baseline/reproduction; validation commands and results; artifact paths; remaining external checks; resulting milestone status.
