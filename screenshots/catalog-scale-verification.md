# Catalog scale, pulling and memory verification — September 30, 2026

## Delivered behavior

- Preview ranking samples at most 4,096 candidates and sends small worker batches. Opening a card seeds the lookup cache; playback uses a stable window of at most 512 neighbors rather than copying the complete catalog into a playlist.
- Provider descriptions and transcripts remain in IndexedDB and load for the selected viewer. Listing records retain playback references and short taglines. Full detail reuse is bounded to 12 small records; giant transcripts are excluded. Viewer closure releases in-memory comments, and hidden tabs release the reusable detail cache and idle preview worker.
- Catalog restore reads 512 records at a time and yields between pages. Legacy snapshot migration preserves newer normalized rows. Incremental writes retain complete descriptions and comments even when a refreshed listing is sparse.
- Playback history/progress no longer writes the complete tag/provenance preference blob on every viewing update. History lookup and Settings repair results are bounded to the IDs actually needed.
- Settings → Pull management controls request spacing, catalog concurrency, YouTube batch targets and sweep source counts, automatic intervals, total Adult entries per request, and an Adult catalog target up to 1,000,000. Automatic work, viewing holds, Pause, Resume and Cancel are connected to the scheduler. Existing entries are preserved when targets are reduced. YouTube targets finish whole provider pages and can round up by one page.
- Adult pulls no longer stop at the former 6,000-record ceiling, rewrite the entire archive, or restart because of a warm client fingerprint. Each provider has an independent page and partial-page offset; failures retain its resume point with a cooldown. One automatic scheduler rotates providers. An accepted batch is saved before its resume cursor advances.
- Paused or disabled automatic work also prevents startup folder rescans. Photo-only sources with saved health no longer need a video record to qualify for cache-first startup.
- Built-in Adult sources remain private when a legacy folder lacks its private flag. Cancelling or completing a pull does not navigate away from Settings.

## Real-browser checks

Used the user's existing localhost library, not a synthetic empty profile:

- Final Settings count: **129,329 entries**. YouTube showed **60,202 distinct non-live uploads, zero duplicate cached rows**, plus four live records; **748 of 762** saved sources had upload coverage.
- Opened cached YouTube previews and full playback. The selected video began playing with captions visible in its embedded player. On the final build, `I Tested 1-Star Restaurants` → Next (`N`) → `I Made Chocolate From Scratch` → Previous (`P`) returned to the original video.
- Two capped Eporner requests each returned **20 entries**, adding **40 new entries** overall. The existing Adult archive grew from **8,541 to 8,581** without the old 6,000-entry truncation. After a reload, the cursor resumed at **page 2 + offset 20**, then advanced to **page 2 + offset 40**. Other provider cursor positions remained intact.
- Pausing held a manual request: **0 active / 1 queued**. Cancel settled the queue to **0 active / 0 queued**, preserved accepted entries and offsets, and stayed in Settings after the completion-callback repair.
- Checked Settings at a mobile viewport of **390×844**. Controls accepted a **1,000,000** target. DOM width/scroll width matched; no horizontal overflow. Values were restored afterwards.
- Final live-tab app console: **no errors or warnings**. Some earlier mouse automation calls timed out while startup disk scans were running; the final startup gating removes those automatic scans while work is held. Keyboard and mouse interactions both completed on the final code. This is not a measured latency or soak guarantee.
- Restored the original paused-pulls state, automatic pulls enabled, Adult batch 160, target 100,000, request gap 1,500 ms, concurrency 1, YouTube batch target 100, sources per sweep 32, intervals 300/120 seconds, and viewing holds enabled. Restored collapsed Adult discovery. Closed the disposable verification tab and reset its mobile viewport.

Screenshots: `catalog-scale-settings-desktop.png`, `catalog-scale-settings-mobile.png`.

## Build and tests

- `npm run build`: passed. `npm run typecheck`: passed.
- Dev and built-output browser smoke checks: desktop/mobile rendered, clean console, no overflow, no brand/auth warnings; production did not diverge from the dev baseline. Both viewport screenshots were inspected.
- TypeScript test stage: **167 passed, zero failures** (`catalog-scale-unit-tests.txt`).
- Focused performance, storage, cursor, sampling, playlist and scheduler checks: **25 passed, zero failures** (`catalog-scale-focused-tests.txt`).
- Full `npm test` still fails in the script stage: **216 passed / seven failures** (`catalog-scale-tests.txt`). Remaining failures are existing Windows symlink-permission tests (two), Windows command paths with spaces (three), the legacy browser-smoke source-contract assertion (one), and the existing migration-layout assertion (one). These are not reported as a passing full suite.

## One-million-entry benchmark and limits

`catalog-scale-benchmark.json` uses **1,000,000 actual lightweight metadata objects** with individual IDs and provider references. It excludes transcripts, tag/provenance ledgers, IndexedDB, artwork and browser UI:

- Resident fixture allocation: **367 MiB**.
- Bounded candidate sampling: **1.78 ms median**, **4.3 ms worst**, across 20 samples.
- Retained allocation after sampling and GC: **0 MiB** at whole-MiB reporting precision.

This validates the bounded sampling path. It does **not** certify a complete million-entry browser library, disk quota availability, all-query performance, or long-session stability. Those require a browser capacity and sustained soak test with representative metadata and artwork. The current browser still holds lightweight catalog metadata and tag ledgers in memory.

No commit, push or deployment was requested or performed. The development app remains running.
