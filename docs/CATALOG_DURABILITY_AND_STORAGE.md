# Catalog durability and storage recovery

Settings → Storage and save recovery provides a read-only artwork cleanup preview and an explicit save retry. Opening it neither scans the library nor probes an external service. Saved media, ratings, history, follows, drafts, locks, categories, approved folders and pending recovery records are protected.

## Accepted catalog operations

The existing `reelcase` IndexedDB database remains version 8. Version 1 operation records use `remote-cache` keys beginning `catalog-operation:`; one `catalog-operation-control` marker tracks their sequence and successful commits. Records contain bounded deltas rather than another complete media catalog. There are at most eight pending operations, at most 64 media rows per chunk, an estimated metadata weight limit of 8 MiB per operation and a finite traversal budget. Automatic pull sizes and polling rates are unchanged.

Preparing a record and applying it are separate transactions. A successfully prepared record is durable acceptance for recovery. Applying its media rows, available tag enrichment, pending-record deletion and commit marker is one transaction across the existing remote cache, local videos and activity stores. Transactions request strict durability where supported; older implementations fall back to their transaction API. This is not a physical power-loss or browser-eviction guarantee.

Startup recovers pending records before catalog mutations. Replay walks the pending key range only, yields between operations and upserts canonical IDs without incrementing personal counters. Folder replacement and deletion wait for pending recovery. Unknown operation/control versions are preserved and block conflicting writes. They are never reset to make an error disappear.

Provider pulls, on-demand YouTube metadata, retained live rooms and local upserts use this path. Where available, the accepted row chunk includes its tags/provenance. Remote catalog folder metadata advances after the accepted row chunks complete. Provider follow observations retain their existing independent ledger; this is not an atomic transaction over every application store. Whole-library generation restore, cross-tab writer leasing and portable profiles remain separate milestones.

## Personal metadata

Manual tags, locks, provenance and category share one per-title `catalog-metadata:` activity record. A combined synchronous `reelcase.catalog-edits.v1` mirror covers immediate tab closure. The mirror holds at most 256 pending titles, checks its document size before writing, and accepts individual manual metadata records up to 32 KiB. A bounded in-visit pending map supports IndexedDB retry when the synchronous mirror refuses writes. Successful acknowledgement clears only the matching edit nonce; a newer edit cannot be cleared by an older completion.

Independent manual field clocks survive unrelated automatic tag updates. Later manual edits stay ahead of retained field timestamps even if the wall clock moves backward. A category-only save does not freeze unlocked automatic tags. Sparse category records use the same clone-safe preference encoding as sparse tags and provenance, so a recovered library can be saved again without passing a Proxy to IndexedDB.

Cleanup remains all-or-nothing. Its bounded delete intent, metadata changes and marker share the original atomic transaction. An interrupted cleanup rolls back; it does not schedule deletion that might surprise the owner after a failed attempt. Personal metadata and feedback are not reclaimed as disposable cache.

## Storage pressure

Preview reads object-store counts and at most 256 artwork receipts in 16-row pages. It never enumerates personal values or retains a second catalog. Origin usage/quota estimates are optional; unavailable measurements are labeled unavailable. Personal byte sizes are not guessed.

Confirmation clears only previewed `thumb-cache` entries whose ID, timestamp and payload size still match. Changed or missing entries are skipped. A preview expires after five minutes and is consumed once. Cancellation removes nothing. If cleanup fails after an earlier batch committed, the result reports that partial count; original media and protected stores remain intact. Byte totals are estimates of removed artwork payload, not measured freed disk space. Native caches are outside this control. Normal browsing can refill artwork, and offline artwork can disappear until its source is available again.

Retry waits for initial library and personal recovery, then replays accepted operations and requeues the current preference slices. Visible remote cards are retried additively, without advancing remote source metadata or deleting a legacy snapshot. No provider request, model transfer or download starts. Inputs rejected before durable acceptance are not promised to survive closing the page; a local import may need repeating. If both storage paths refuse a new edit, the panel reports the failure and retains bounded pending edits for retry during the visit.

## Verification and remaining work

See revision 75 in `MILESTONE_VERIFICATION.md`. Browser checks use fresh Chrome desktop and touch-mobile profiles, actual IndexedDB, injected transaction/quota failures and synthetic 100k catalogs. They cover prepare/apply/commit/acknowledgement interruption, lost-response replay, independent field clocks, full mirrors, simultaneous storage refusal, real reload, expired/cancelled previews, unavailable estimates, partial cleanup and another save after recovery. They do not replace physical-device, real-provider, eight-hour or power-loss tests.
