# Catalog writer leases and Stream Signal revisions

## Catalog write contract

The existing reelcase IndexedDB v8 stores are retained. remote-cache holds one version-1 lease record per scope with owner, monotonically increasing generation, revision, expiry and a dirty receipt. Catalog writes use the catalog scope. Stream Signal uses a separate owner-specific scope. These are concurrency receipts, not credentials or authorization tokens.

A writer acquires a 15-second lease and renews every five seconds only while work is active. Updated tabs in the same realm share an active lease until all nested/overlapping work settles. A second tab receives a busy outcome before admission; there is no forced takeover or spinning retry. Explicit retry is available. Closed renderer processes stop renewal; a new owner can claim the next generation after expiry. An old owner cannot renew, commit a fenced transaction or release a newer owner's generation.

Every protected write transaction includes remote-cache and checks owner, scope, generation and expiry inside that same transaction. Late or unsupported writers abort their whole transaction. Accepted journal operations retain their existing idempotent recovery behavior. A dirty receipt is stored atomically with data/accepted intent. Closing a tab after commit but before its release notice leaves evidence for expiry/recovery; the next owner advances the shared revision. Successful release clears dirty and expires the held generation. Unknown/future/corrupt lease records fail closed and are retained.

Protected entry points:

- Journal stage/apply, manual tag/provenance/category edits, paired media/enrichment operations and cleanup, through catalog-mutations.ts.
- Remote snapshot writes, local append/import chunks, atomic folder replacement/clear, directory handle insertion/removal, remote row removal and creator coverage repair, through persist.ts.
- Existing read-only persistence APIs remain read-only. A paged reader rebase holds a non-mutating lease while taking a consistent read, recovers accepted operations first and never opens a provider.

This does not make an entire interrupted multi-chunk import an atomic library-generation switch. Whole-library restore/rollback remains next-004. Broad preference, follows, activity/feedback and other tool documents retain their existing independent durability paths; this lease does not claim global atomic reconciliation of all personal state. Manual catalog metadata uses its paired journal records. Browser artwork cleanup and unrelated tools do not own catalog rows.

## Reader updates and responsiveness

Committed writers send only bounded scope/owner/generation/revision notices through BroadcastChannel. No media catalog, drafts, account tokens or model bytes are broadcast. Duplicate/older revisions are ignored; readers coalesce notifications, fetch bounded disk pages and yield through the existing catalog helpers. No idle polling or renewal timer runs. Focus/visibility does a single lease-record check and does not reread an unchanged catalog. An expired dirty generation can trigger recovery even if its final notice was lost. Without BroadcastChannel, focus/visibility and explicit refresh provide catch-up.

Catalog writer status surfaces a second tab's ownership/error and offers Refresh shared catalog. Ordinary local writes do not add a flashing status panel. Reader refresh does not rewrite preferences, follows or personal feedback. Current manual metadata remains governed by existing field clocks. Rebase waits for the current local import; it does not replace an in-progress scan with an older disk snapshot.

New local file rows are deferred until reload can restore their saved source privacy and permissions. They are never inferred public from a directory name or newly observed handle. Existing local rows and removals can rebase, and remote privacy uses existing provider/source boundaries. This deliberately avoids admitting unseen local sources into an already-open public shelf. A visible note explains when reload is needed. Updated application code is required in every tab; an older running build cannot enforce a new protocol it never implemented.

## Announcement revision contract

Saved packs retain their stable ID and immutable original channel/profile snapshot. Packs have a monotonic revision and separate platform revision counters. Only changed text or explicit manual sharing marks advance a platform revision. A save checks its expected pack/profile revision in the same fenced transaction as the document write. No-op saves do not rewrite the document or create edit history. Existing unversioned packs/profile values migrate additively when saved; future or malformed versioned records are retained and rejected.

A stale editor retains its local text and presents a comparison with the current saved version. Keep current saved version explicitly discards that pending document. Restore my changes as a new revision rebases only fields changed from the editor's base, preserving other platforms' newer text and checklist marks. If another tab saves again while a choice is being applied, the revision check rejects it again. A legacy recovery copy without a base is labeled as a full snapshot restoration and requires review of all differing fields.

Twelve compact prior platform states are retained per pack (up to 6,000 characters each), rather than duplicating a whole archive. Restoring an entry creates a new revision of that platform's text and manual checklist state, leaving other drafts intact. Copy, platform links, composer links, export and recovery never claim publication. Both stream URLs remain in the pack profile and text export; the existing missing-link restore control remains available for editable post text.

Pending edits use a per-editor local mirror and a per-tab recovery pointer. Up to eight small documents / one million serialized characters are mirrored; the eight-pack archive stays paged. Reload replay uses the same expected-revision checks. A mirror is acknowledged only if its exact captured contents are unchanged, so another tab's later edit is not deleted. Legacy mirrors are retained on parse/schema errors. Quota/storage errors keep local pending edits and enable explicit retry/export. Unmount flushes acknowledge newer in-visit edits correctly and close the scoped channel when it is no longer used.

## Evidence

- scripts/writer-signal-revisions.test.mjs: version/shape guards, additive migration, per-platform revisions, bounded history, manual undo/restore and field-wise rebase.
- scripts/writer-signal-revisions-browser-check.mjs: real same-origin desktop/touch-mobile tabs; busy ownership; expiry; an old owner attempting a late commit/release; renderer close after data commit; compact notices; actual import versus cleanup admission; mounted reader rebasing; conflict comparison, both choices, reload recovery and history/manual checklist restoration. --scale adds a synthetic 100,001-row reader drill, <=512-row disk pages and navigation/timer measurements. No real provider or native service is contacted.
- scripts/stream-signal-check.mjs retains the existing generation, edit, clipboard, intercepted platform/composer handoff, text/1080x1920 PNG export, navigation/reload, quota recovery, user isolation and simulator controls coverage.

No new external integration, auto-publication, social login, GPU job, remote desktop session or native file permission is enabled by these changes.
