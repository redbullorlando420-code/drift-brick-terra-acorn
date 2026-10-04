# Idle enrichment milestone — October 4, 2026

`speed-06` is **in progress**. The queue, interruption controls and sparse persistence are implemented and verified. Native enumeration/allocation of very large flat metadata records still produces long tasks, so the milestone is not marked complete. The mission plan remains at 171 / 200 complete.

## Implemented behavior

- Startup provider-tag repair, the 48-title metadata-tail action and full smart-tag repair share one owner. Duplicate actions coalesce, and completed batches rotate fairly between jobs.
- The click handler queues work without scanning the catalog. A step checks at most 2,048 entries; parsing yields after 512 entries or a four-millisecond target. Metadata-tail work stops after 48 accepted changes, instead of building a candidate list for every title.
- Each batch begins behind an idle boundary. Internal slices use cancellable background-priority tasks where available, with an abortable timer fallback. They do not wait for a new idle frame for every cheap skipped row.
- Pointer, keyboard, wheel and touch input interrupt unfinished scratch work and give input a 240ms priority window. Hidden/page-suspended tabs and previews/players hold enrichment. Resuming retries the last unfinished step. Catalog cursors retain a weak reference, rather than pinning old video arrays.
- Settings exposes immediate pause/resume, recheck/retry, current progress, the latest completed job and storage errors. The panel is independent of the full Settings audit and stays available while diagnostics load.
- Immutable tag/provenance copies yield and recheck their original references. Manual edits, locks, category changes, pulls or catalog replacement invalidate stale preparation before publication.
- Sparse metadata records save in chunks of at most 64 records, using the existing IndexedDB activity store. A batch reports completion only after its records save. Replay reads at most 256 records per storage request, preserves newer/manual fields, then applies the manual edit journals last. It does not serialize the whole preference blob for each enrichment batch.
- Video/folder removal cleans up the associated sparse enrichment records. Failed optional cleanup does not prevent existing folder cleanup.

## Verification

- **295 library tests passed** in [enrichment-library-tests.txt](E:/codex/drift-brick-terra-acorn/screenshots/enrichment-library-tests.txt).
- **53 media/provider/storage/relay integration tests passed** in [enrichment-media-tests.txt](E:/codex/drift-brick-terra-acorn/screenshots/enrichment-media-tests.txt). These include real store actions and the actual persistence functions with deterministic disk/provider boundaries.
- Queue tests cover fairness, duplicate coalescing, input/visibility/viewer interruption, native scheduler and timer fallback cancellation, owner cleanup, pause/resume, late results and failed saves. Metadata tests cover million-entry candidate bounds, interrupted/replaced catalogs, manual edits during copies, partial durable recovery and category preservation.
- Production build and typecheck passed. Desktop/mobile development and production smoke checks show visible content, no console/page errors, no horizontal overflow or branding warnings, and no divergence from the development baseline.
- Interactive Chrome checks used the populated development profile: **172,070 entries**, including **99,999 YouTube**, **41,085 Twitch**, and **18,701 local files**. Pulling remained paused; the existing source caps were retained.
- Pause, queue, resume and Home/Settings navigation worked with a metadata action pending. A final action saved **48 changed titles in two batches**. An earlier interrupted run had already saved 31 titles. Local waiting coverage moved from **11,966 → 11,935 → 11,887**; **11,887 remained after reload**, confirming recovery of the sparse saved results. Favorites remained 35 and history remained 996.
- The changed controls were exercised at desktop and phone widths. The phone layout had 375px of content in a 390px viewport and no horizontal overflow. The compiled production profile was empty; its pause/resume and queued recheck controls were verified on both layouts with clean logs.

## Synthetic benchmark and remaining work

| Entries | Previous synchronous action | New queue creation | Catalog rows read by new 48-title batch | Yields | Largest observed background task |
| --- | ---: | ---: | ---: | ---: | ---: |
| 100,000 | 383.85ms | 0.26ms | 48 | 395 | 17.70ms |
| 1,000,000 | 3,404.06ms | 0.05ms | 48 | 3,914 | 281.66ms |

See [enrichment-benchmark.json](E:/codex/drift-brick-terra-acorn/screenshots/enrichment-benchmark.json). This is an isolated Node workload with shared metadata values and instrumented catalog rows. It is not browser interaction latency, a heap soak, or proof that the whole application handles a million entries.

The four-millisecond target applies to explicit traversal loops. Native key enumeration and allocation in the existing flat record representation remain substantial, especially at a million entries. Replacing full-record materialization for sparse updates is the next required part of `speed-06`. Broader render, cold-start readiness, slow-device and memory-soak milestones remain open. Interactive checks here ran after hydration; they do not establish a cold-start first-click budget.

## Screenshots

- [Populated desktop controls and saved batch](E:/codex/drift-brick-terra-acorn/screenshots/enrichment-settings-desktop.png)
- [Populated phone controls after recovery](E:/codex/drift-brick-terra-acorn/screenshots/enrichment-settings-mobile.png)
- [Production phone controls](E:/codex/drift-brick-terra-acorn/screenshots/enrichment-production-settings-mobile.png)
- [Development smoke verdict](E:/codex/drift-brick-terra-acorn/screenshots/enrichment-dev.json)
- [Production smoke verdict](E:/codex/drift-brick-terra-acorn/screenshots/enrichment-production.json)

These changes are local. No commit, push, deployment or provider limit increase was performed.
