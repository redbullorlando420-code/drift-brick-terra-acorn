# Profile-labelled backups and portable settings — revision 86

Completes **next-106 — Profile-labelled backup manifests** and **next-108 — Portable profile configuration packs** together.

## Delivered workflow

**Settings → Library pack** exports optional version 1 source-profile metadata containing the immutable local ID and label recorded at export. Streaming packs carry a checksummed profile/source.json section; legacy ZIP and Companion-folder exports carry the same information in the root manifest. No local database is renamed or relocated.

Backup inspection shows the recorded source and the current destination before the existing reviewed-restore controls. Imported provenance cannot select, rename or switch a profile or enter the personal restore plan. The source can be absent for old exports; these retain their previous validation and restore path. Invalid, future or conflicting source metadata blocks import. A metadata-only pack cannot become a personal restore. Resumed inspection preserves and revalidates the context.

**Settings → Local profiles → Portable profile settings** reviews and downloads a small JSON pack. Version 1 supports exactly four active preferences: library layout, library sorting, the existing Adaptive/Low memory performance preset and hardware playback preference. Obsolete filter fields are excluded because the current app does not apply them. Uncheck any field to leave it out of the download or the new profile. Export requires saved preferences to finish loading and offers a clear retry message while they are loading.

An imported settings pack first displays its source, individual values and the proposed new destination name. Creation requires selected fields and an explicit review. It creates a new empty named profile and seeds only those fields through the existing profile storage adapter. Unselected fields use normal application defaults. The user switches through the existing checkpoint/reload controls; creation does not automatically switch this or other tabs. Imported preferences survive activation and reload.

Credentials, accounts, private activity/tags, follows, ratings, notes, native paths/endpoints, device services and directory grants are excluded. Unsupported fields reject the entire pack before mutation. Settings files are limited to 32 KiB before parsing. Duplicate or reserved names cannot target an existing profile. A new destination always receives its own immutable ID.

## Failure and performance boundaries

Configuration validation happens before storage mutation. At most two bounded preference keys are written in an unused namespace while the serialized registry transaction is open. The profile is published only after the selected configuration writes succeed. Storage quota failure publishes no profile; a failure on the second settings write also removes the first key; registry quota or an asynchronous abort removes its unpublished settings keys. Concurrent duplicate names serialize. Existing profiles and authentication are preserved.

Local Storage and IndexedDB do not share an atomic transaction. A process crash between the preference write and registry commit can leave up to two small unregistered settings keys. It cannot redirect a published profile or replace the source. This work does not claim cross-storage crash atomicity or add speculative cleanup of unknown profile namespaces. If rollback cleanup itself fails, the UI reports that unpublished settings remain.

The new workflow is user initiated. It adds no background polling, catalog copies or periodic persistence. Shared profile identity continues to use the existing compact registry observer. Browser-download, ZIP, checksum, snapshot and restore limits remain unchanged. Backup labels are descriptive provenance, not proof of ownership or authentication; library backups remain private, unencrypted files.

## Completion and validation

Revision 86 promotes only next-106 and next-108 once. The earlier revision-85 gate keeps its original explicit IDs, preserving later manual reopens of next-101 and next-105. Custom notes remain intact. Default totals: **302/406 complete**, **100/200 next-level**, **4/100 new-batch**; saved user totals can differ.

Evidence uses disposable browser profiles and synthetic data. No actual user library, native grants or accounts were changed. These milestones do not establish cross-device transfer, provider playback or a long-session memory soak.

Relevant commands:

~~~text
node --experimental-strip-types --test --test-timeout=20000 src/lib/profile-settings-pack.test.ts scripts/profile-source-backup.test.mjs scripts/library-pack-transfer.test.mjs scripts/library-restore.test.mjs scripts/local-profile-storage.test.mjs scripts/profile-switch-store.test.mjs src/lib/profile-registry-observer.test.ts src/lib/mission-plan.test.ts scripts/mission-next-level.test.mjs scripts/mission-next-wave.test.mjs src/lib/performance-profile.test.ts
node scripts/profile-registry-native-check.mjs
node scripts/profile-portability-browser-check.mjs
node scripts/library-restore-browser-check.mjs
node scripts/local-profiles-browser-check.mjs
node --experimental-strip-types scripts/mission200-browser-check.mjs
npm run typecheck
npm run build
~~~

Test artifacts use **screenshots/milestone86-**. Focused tests pass **142/142**; the native registry/settings fixture passes **22 checks**. Desktop/mobile acceptance covers actual JSON, streaming and ZIP downloads, checked-field import, source/destination review, old and future metadata, quota failures/retry, duplicate names, activation, discard and reload. Existing populated profiles and atomic restore/rollback retain their prior behavior. Final production evidence and full-page audits are recorded in the milestone verification ledger.


Evidence files:

- screenshots/milestone86-tests.txt; milestone86-native.json; milestone86-build.txt; milestone86-typecheck.txt.
- screenshots/milestone86-portability-dev.json and milestone86-portability-production.json, plus populated review and source/destination screenshots for each viewport.
- screenshots/milestone86-restore-dev.json and milestone86-restore-production.json; milestone86-profiles-dev.json and milestone86-profiles-production.json.
- screenshots/milestone86-mission-dev.json and milestone86-mission-production.json; milestone86-mission-regression.json.
- screenshots/milestone86-pages-dev.json and milestone86-pages-production.json: 64 reports each.
- screenshots/milestone86-home-dev.json and milestone86-home-production.json: no baseline divergence.
