# Slow-device profile verification — 2026-10-04

Mission plan revision 15 completes `smooth-10` only: 176 / 200 complete, 24 remaining. Later manual mission status choices remain authoritative.

## Delivered

- Settings now has Adaptive and Low memory profiles. Limited core/memory capability hints or Save Data select low budgets automatically. Unknown capabilities retain standard defaults; capability hints do not measure free memory.
- Low memory retains 72 artwork entries within 2 MiB of encoded/blob backing data, starts one thumbnail decoder, allows four remote image requests, starts new photo scans with at most two workers, uses 24-title grid pages / a 36-card mount ceiling, and removes rail overscan. Browser-decoded image/GPU surfaces and the catalog itself are separate memory costs.
- Selecting the profile releases evicted blob URLs immediately. Existing requests finish with their previous ceiling; subsequent work uses the new limit. Increasing the limit refills waiting image slots. Shared storage events synchronize open tabs. Saved per-feature settings and durable media are preserved.
- Disk artwork hydration respects the profile byte ceiling. Late capture/recall results also pass through current cache limits. Low memory suppresses optional route warming.
- Unchanged archive pages and routine refreshes retain the original catalog array without copying every reference. Sparse changed batches are staged only until materialization; large changed imports do not build a second catalog-sized replacement Map. Canonical YouTube IDs, memberships, foreground edits and newer live observations remain intact.
- Unchanged resume reconciliation avoids copying the full progress record. Iterator writes and materialization remain cooperative.
- Contended metadata scans now reject patches derived before a manual tag/lock edit. Their checkpoint does not advance until a fresh preparation and durable write succeed.

## Repeatable checks

`npm run benchmark:low-memory` uses Node old-space capped at 384 MiB, actual 100,000 and 1,000,000 lightweight metadata records, cooperative turns, and production profile resolution with two-core / two-GiB hints. It checks immutable no-change merging, restoration completeness and 20,000 phone/desktop window visits per catalog size. This is a metadata benchmark, not browser memory or CPU-speed emulation.

Latest million-entry result: 135 MiB fixture resident heap; 378.6 ms for an unchanged page; 1,000,001 indexed reads and zero full array copies; 257.9 MiB heap after restore. Maximum rail references 6, grid references 35. An avoided million-reference array is approximately 8 MB in this estimate; engine layouts and browser heap differ. See `low-memory-benchmark.json`.

Regression coverage includes unchanged million-entry catalog/progress identity, sequential duplicate updates, canonical playlist memberships, stale live observations, all-row changes/removals, cancellation, concurrent startup pull/unfollow/favorite/progress changes, artwork URL release, cross-tab profile changes, live image-slot changes, sparse enrichment lock races and mission migration.

Build and typecheck pass. TypeScript library tests and relevant real-store/persistence/artwork scripts pass; the unrelated template/Windows script suite was not treated as the product gate.

## Browser verification

Chrome saved development profile: 172,070 entries, including 99,999 YouTube videos, 41,085 Twitch videos and 12,284 private-provider entries. Pulls were already paused and remained paused.

- Desktop 1280 × 800: profile toggles between 8 and 2 MiB limits; original feature settings stay selected. YouTube creator mix mounts four cards in Low memory; End reaches positions 44–47 of its 48 titles. Preview opens and returns to the same rail. Favorites grid expands from 24 to all 35 public titles; End reaches position 34 with 28 mounted cards. Grid preview dismissal restores focus to position 34. All final console observations are clean.
- Phone 390 × 844: explicit Low memory survives a reload and Settings reports it selected. Search for Minecraft returns 515 matches; Show more moves the loaded window from 24 to 48 with 12 cards mounted. Preview opens and dismisses successfully. Content width is 375 pixels and does not overflow. Settings proof is visually checked.
- Development and built-output desktop/phone smoke screenshots show visible Home content, no console/page errors, no horizontal overflow and no production divergence. Production profile selection survives phone reload, with the same effective limits and clean console.
- Original Adaptive selection was restored in both test origins. Test search was cleared. QA tabs are closed and temporary viewport overrides reset after verification.

## Remaining limits

This does not establish long-session browser/physical-device heap stability, a real-provider archive soak or one million complete provider payloads with transcripts/artwork. The Windows Companion photo scan requires approved sources for live I/O verification. Broader render invalidation remains open: search pagination rebuilds after preview/watch ranking changes, while stable Favorites grid focus/anchor recovery passes. A constrained phone viewport is not a physical low-memory phone test. Those unverified milestones stay open.
