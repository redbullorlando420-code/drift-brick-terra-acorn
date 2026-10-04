# Idle enrichment queue — milestone verification

Verified October 4, 2026. Mission plan revision 12 completes `speed-06`; the rendered plan shows **172 of 200 complete**, with 28 remaining. This verifies the enrichment path and its remaining large-ledger copy bottleneck. It does not declare all performance milestones complete.

## Delivered behavior

Cached metadata repair, metadata-tail batches, and smart tags share the existing cancelable idle queue. Input, scrolling, hidden tabs, previews, and players interrupt unfinished work. Pause/resume controls retain queued work. Completed rows save in bounded transactions before publication and recover from disk in pages.

Tag and provenance changes now use immutable indexed sparse records. Each snapshot shares one original dictionary and a persistent hash tree of changes; it does not retain a chain of earlier snapshots. Batch construction and updates read only affected keys, without enumerating or copying the full dictionaries. Metadata enrichment, provider admission, manual tags, category locks, reviewed local tags, and journal recovery use this representation.

Manual locks, concurrent newer edits, categories, optimistic rebasing, and provider tag filtering remain enforced. No-op updates retain identity. Saved preferences encode sparse changes in a cloneable sidecar while keeping ordinary baseline dictionaries for older readers. New readers restore the sidecar; older clients see the baseline rather than all subsequent sparse edits. Existing edit journals and enrichment rows remain durable.

## Automated verification

- 346 library tests passed: sparse-record lookup/enumeration parity, collision cases, immutable snapshots, repeated batches, clone recovery, queue cancellation and rebase, manual locks, and milestone migration among the covered suites.
- 48 integration tests passed: actual store edits, YouTube admission, bounded persistence transactions, paged recovery, newer/manual metadata preservation, and no-copy guarded ledgers among the covered suites.
- **394 relevant tests passed**, with no failures. Five persistence/store cases were rechecked after the final compatibility safeguard; they are included in the total, not added again.
- Final `npm run typecheck`, `npm run build`, and `git diff --check` passed. The full repository test command was not rerun; unrelated existing Windows/template failures are outside this result.

Artifacts: [library tests](./sparse-enrichment-library-tests.txt), [integration tests](./sparse-enrichment-media-tests.txt), [typecheck](./sparse-enrichment-typecheck.txt), [build](./sparse-enrichment-build.txt).

## Browser verification

Development and compiled-production smoke runs covered 1280×800 desktop and 390×844 phone layouts. Both rendered visible content, reported no console or page errors, had no horizontal overflow, and produced no branding/auth warnings. Production did not diverge from the development baseline. Both sets of screenshots were visually inspected.

The populated browser profile contained 172,070 entries, including 99,999 YouTube records. Desktop pause → queue 48 titles → resume completed a durable batch, and reload retained its metadata results. Phone controls completed a second 48-title batch. The queue's background audit was allowed to finish before reading coverage totals. Pulls remained paused and source caps were retained. Favorites still showed 35 saved items.

The YouTube view loaded recommendations and a mixed shelf, showed zero duplicate cached video IDs, and opened a populated preview with tags and recommendation shelves. No full provider playback or fullscreen test was performed in this pass. Compiled production also exercised pause, queue, and resume on an empty profile at desktop and phone widths. Interactive browser logs were clean.

Proof: [completed milestone](./sparse-enrichment-milestone-desktop.png), [desktop queue](./sparse-enrichment-settings-desktop.png), [phone queue](./sparse-enrichment-settings-mobile.png), [production phone queue](./sparse-enrichment-production-settings-mobile.png), [development verdict](./sparse-enrichment-dev.json), [production verdict](./sparse-enrichment-production.json).

## Synthetic scale measurement and limits

The Node workload used actual 100,000/1,000,000-entry tag and provenance dictionaries with shared values and instrumented catalog rows. It enriched and saved 48 rows. This measures the algorithm, not browser click latency or a heap soak.

| Catalog entries | Previous synchronous work | New queue construction | New largest observed task | New catalog reads |
| --- | ---: | ---: | ---: | ---: |
| 100,000 | 148.68 ms | 0.20 ms | 0.65 ms | 48 |
| 1,000,000 | 2,333.22 ms | 0.06 ms | 0.39 ms | 48 |

There were no catalog reads before the first scheduled task. The million-entry run saved all 48 rows and yielded twice. [Raw benchmark](./sparse-enrichment-benchmark.json).

Full exports and broad preference snapshots still perform full-record work. The shared baseline retains its original values until retired; this is not general ledger compaction or eviction. Long-running memory soak, constrained physical-device measurements, cold-launch interaction budgets, and broader per-card render invalidation remain separate milestones.
