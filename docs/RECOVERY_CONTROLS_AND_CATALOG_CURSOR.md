# Recovery controls and bounded catalog loading

Revision 82 completes **next-094 — Destructive action recovery design**. At that revision, next-014 stayed open pending profile switching. Revision **83** now completes **next-010** and **next-014**; see [integrated profile verification](LOCAL_PROFILE_MIGRATION_REVIEW.md). The historical reader details below describe the revision-82 delivery.

## Consequences and recovery

| Action | Preview and effect | Recovery and limit |
| --- | --- | --- |
| Hide a local source | Names the title count. Changes a fenced visibility flag; catalog rows, saved directory grants and personal marks remain. Playback/preview, active scans and Watch Room pins block hiding. | Settings → Hidden sources. No expiry; at most 256 hidden-source records. Selected browser files may need reattachment. Native files are never deleted. |
| Clear watch History | Names the loaded count and the stored journal. Clears history only after a verified personal snapshot is prepared. Resume, view counts, ratings and media remain. | Settings → Restore recovery slot. Uses the one previous personal generation, replacing its earlier slot. Rollback discards personal edits made after the checkpoint and restores the complete checkpoint. |
| Remove a title | Names the one-title effect and retained saved signals. Persistent removal keeps later pulls from reviving it. | Settings → Removed titles. No automatic expiry; 1,024-record cap refuses additional removals rather than silently evicting them. |
| Reset mission plan | Names the saved statuses/custom ideas being replaced. The previous exact plan must be saved before resetting. | Undo mission reset survives reload. One browser-local slot, up to 2 MiB; a later reset replaces it. Export first to keep more versions. |
| Backup import | Existing preflight, explicit field choices, verified stage and activation review remain. | Whole personal-generation rollback as documented in ATOMIC_LIBRARY_RESTORE.md. Native files and grants are outside import scope. |
| Unfollow | Single-creator preview now states disposable catalog pruning and retained personal marks. Existing bulk review reports exact protected/pruned counts. | No whole-follow undo is promised. Re-follow and pull to rebuild disposable rows; export first to preserve custom pull settings. |
| Artwork cache cleanup | Existing read-only measurement/consequence preview and changed-record checks remain. | Disposable cache can be rebuilt; personal records are protected. No source-file deletion. |
| Ordinary filters, simulator reset and in-memory studio controls | Navigation/filter changes do not receive new confirmations. | Existing local controls apply; no whole-library recovery claim. |

Hiding replaces the prior destructive source-removal path. Hidden adult sources retain their private classification in saved preferences and public-visibility checks even without a visible folder. Private names are concealed by default in Settings; explicit reveal is separate from restoring a source.

Storage quota failures keep the old source flag and catalog. Unknown source-journal versions remain untouched. Restoring visibility commits before reload; the existing directory grant can still require browser permission renewal.

## Catalog cursor work

The shared page reader fetches at most 512 rows, then waits for consumer acknowledgement before reading again. The page producer cannot accumulate unread batches behind slow admission. A committed cursor advances only after successful acceptance; cancellation checks bracket waiting, reading and acceptance. Stalled or mismatched pages reject.

Startup uses the existing visibility/input-priority gate before each local read. Restore-generation changes abort an obsolete read. The reusable reader supports a last-acknowledged cursor and AbortSignal, and an explicit cancellation hook exists for future profile lifecycle integration. It does not add polling, parallel catalog reads, a second catalog graph or per-row UI updates.

The 100,000-record controlled test pauses, cancels a page before acceptance and resumes at the committed cursor with all IDs exactly once. This demonstrates the reader protocol, not implemented local-profile switching. next-014 therefore stays open.

## Entry points

- src/components/library/consequence-action.tsx
- src/components/library/hidden-sources-panel.tsx
- src/lib/videos/source-visibility.ts
- src/lib/videos/hidden-source-privacy.ts
- src/lib/videos/history-reset.ts
- src/lib/videos/catalog-page-reader.ts
- Existing persistence, startup, sidebar, History, player, follow manager and mission-plan controls are integrated.

See revision 82 in MILESTONE_VERIFICATION.md for commands and evidence. Tests use disposable browser profiles and controlled data. No real user library or native files were changed during verification.
