# Atomic personal-library restore

Settings → Library pack now uses one reviewed restore path. History and Stats recovery buttons forward the chosen file to that inspection; selecting a file never applies it.

## Use the workflow

1. Inspect a supported streaming pack or legacy backup. Resolve every differing personal field. Keep current, use imported, or explicitly merge safe values. Existing metadata locks remain protected.
2. Optionally save the review locally. Resuming revalidates the backup and affected current values; changed values invalidate earlier choices.
3. Choose **Prepare reviewed restore**. Existing personal writes finish first. Both the preceding and proposed snapshots are stored separately, read back and verified. Current personal data stays active while preparation runs.
4. At **Verified restore ready**, choose **Activate verified restore and reload**, or **Discard staged restore**. A ready restore survives closing/reopening the page. Interrupted preparation can be discarded; its active generation is unchanged.
5. After activation, **Settings → Restore recovery slot** offers one previous personal-data snapshot. Review the consequence, cancel freely, or confirm rollback. Rollback consumes the slot and discards personal changes made since the checkpoint. Export first if those newer changes must be kept.

Activating another restore replaces the previous recovery slot. The small saved review draft is separate from the recovery snapshot.

## What switches together

A single IndexedDB transaction replaces personal preferences, dedicated activity documents, metadata/edit journals, history, resume, ratings and notes, favorites, follows, photo annotations and review/recommendation ledgers. The durable epoch and mirror-recovery receipt commit in that same transaction.

Local-storage emergency mirrors cannot participate in an IndexedDB transaction. Their receipt is replayed idempotently before pages can resume writes. A mirror failure keeps the committed snapshot and a visible recovery screen with retry/rollback; startup can finish that receipt after reload. Old open tabs cannot write against a restored epoch and must reload. No periodic recovery polling was added.

Current private-source IDs and an enabled privacy PIN remain protected during activation and rollback. Restoration never grants access to a native file or remote account.

## Scope and bounds

- Personal metadata only. Catalog media rows, thumbnails, installed models, folder grants, native files, provider accounts, unrelated tool documents, mission statuses and Stream Signal drafts stay outside this restore operation.
- At most 200,000 protected storage rows and 128 MiB of verified data per snapshot. Pages contain at most 32 rows and processing yields cooperatively.
- One staged operation and one retained prior snapshot. Old generations are reclaimed only after successful activation and mirror recovery. A failed newer preparation preserves the existing recovery slot.
- Proposed emergency mirrors and choice journals each have a 2 MiB budget. Saved review drafts retain their earlier 16 MiB / 20,000-conflict bounds.
- Quota, tampered staging and unsupported versions fail closed. Staging requires enough browser quota for both snapshots and the existing recovery slot; it does not delete personal data to make room.
- Snapshots are unencrypted browser-local personal data. Keep exports private. This is not a backup of native media or an external integration connection.

## Implementation

- `src/lib/videos/library-restore-repository.ts`: paged staging, strict activation transaction, mirror receipt and previous-generation collection.
- `src/lib/videos/library-restore-plan.ts`: pure plan from reviewed values; no live hook mutation or provider work.
- `src/lib/videos/restore-snapshot.ts`: protected keys, budgets and incremental SHA-256 verification.
- `src/lib/restore-epoch.ts`, `src/lib/writer-lease.ts`: local and same-transaction durable write fencing.
- `src/components/library/restore-boundary.tsx`: startup recovery, interrupted-stage controls and Settings rollback.
- `src/components/library/library-pack-transfer.tsx`: preflight, field choices and explicit preparation.
- `src/lib/videos/backup-inspection-queue.ts`: transient File handoff from History/Stats to Settings.
- `src/lib/videos/persist.ts`: existing persistence integration, complete photo annotation preservation and coalesced writer checks.

## Verification

Build and typecheck pass. Focused runtime and roadmap tests, native IndexedDB fault injection, and isolated desktop/mobile browser interaction pass. The native fixture covers activation quota abort, staging quota failure with prior-slot preservation, mirror replay, stale epochs, all-field rollback, privacy floor, unrelated tool retention, tampering and future versions. Browser checks cover saved review, changed-value invalidation, pending-stage reload, mirror quota failure/startup repair, real ZIP export, photos, rollback/cancel and both legacy entry points.

See revision 81 in `MILESTONE_VERIFICATION.md` for commands and artifacts. Controlled Twitch responses and disposable browser databases do not establish real provider or physical-device readiness.
