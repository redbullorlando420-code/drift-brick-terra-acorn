# Backup review and Twitch identity updates

Delivered November 1, 2026 · mission revision 80.

## Twitch login changes

Open **Twitch → Manage creators**, select a creator, then find **Twitch login identity**. **Check current Twitch login** makes one public lookup using the saved numeric Twitch user ID. It does not walk videos, enumerate follows or start a poller. A creator without a verified user ID needs an ordinary pull first.

If Twitch reports a different login for the same user, review **old → new** and choose **Apply verified login change** or **Keep saved login**. Evidence expires after five minutes. The follow and its bounded identity journal commit in one fenced IndexedDB transaction. A failed request, stale review, full journal, storage quota error or another tab's writer lease preserves the existing follow.

The original source ID stays canonical. VOD/clip IDs, personal ratings, notes, tags, playback history, resume marks and automatic pull policy keep their existing identities. Future results bind to that source. Original logins remain as aliases, up to 16 per creator. The journal retains at most 128 reviews and refuses to evict older entries silently. Reimporting the current login retains the canonical source and reviewed alias state.

A public response with a different verified user ID cannot refresh the old follow. A newly imported account reusing that login receives a separate source key and separate creator signal key. It cannot inherit the old account's media ratings or pull policy. The old account can be resolved by its stable ID even when its previous login has been reused. Alias review does not copy, rename or delete native files.

These checks were verified using controlled public-response fixtures. An actual renamed Twitch account and Twitch's future endpoint behavior remain external checks; there is no OAuth connection or access bypass.

## Backup field choices

In **Settings → Library pack**, inspect a streaming pack or supported legacy ZIP/JSON/CSV. The existing preflight still rejects invalid or unsupported sections before application. A new **Review saved field conflicts** queue shows eight fields at a time, with current and imported values and explicit choices:

- **Keep current** retains the corresponding saved field.
- **Use imported** accepts that field from the backup.
- **Merge safe values** uses the newer resume observation, maximum watch-time counters, or tag union with retained provenance and locks. Opposing categories and ratings have no automatic merge.

**Keep all current fields** and **Merge safe fields; keep other current fields** are explicit bulk policies. No unresolved field can be applied. Ratings travel with their rating-history record. Both backup formats now include `marks/metadata.json` for tags, provenance and categories. Existing metadata locks remain protected even when imported values are chosen. Missing fields do not erase unrelated current records. Other feature ledgers retain their existing merge policies.

**Save review for later** retains one private local review slot, up to 16 MiB and 20,000 differing fields. Saving another inspected backup replaces that slot. It contains the validated metadata and choices, not native media, credentials or file-system grants. Backups and review drafts are unencrypted personal data in this browser workspace. **Resume saved review** validates again after reload. If a relevant current value changed, the backup stays available and old choices are invalidated. Unrelated title edits or background creator status changes do not invalidate a small personal-field review. Revision checks prevent another tab's stale draft from overwriting newer choices. Quota failures leave the earlier saved review readable. **Discard saved review** removes the draft only.

Comparison hashes only affected current values, yields between bounded batches, and does not enumerate unrelated large-library tag/rating maps. Inspection, editing choices and opening Settings do not start provider polling. Reviewed values now enter the staged restore path; no sectional import is applied to the active library.

## Atomic restore completion

Revision 81 completes **next-004 and next-008**. Reviewed choices are journaled with verified before/after snapshots and activated in one personal-data transaction, followed by idempotent mirror recovery. One previous generation supports rollback. See [Atomic personal-library restore](ATOMIC_LIBRARY_RESTORE.md) for controls, protected scope, quota limits and verification.

## Revision 80 verification artifacts

- Build/typecheck: `screenshots/milestone80-final-build.txt`, `screenshots/milestone80-typecheck.txt`.
- Focused runtime/store/provider tests: `screenshots/milestone80-final-tests.txt` — 92 passed.
- Roadmap migration/contracts: `screenshots/milestone80-roadmap-tests.txt` — 85 passed.
- Desktop/mobile interaction and native IndexedDB fault fixtures: `screenshots/milestone80-final-dev.json`, `screenshots/milestone80-final-production.json`.
- Root production render matches development: `screenshots/milestone80-final-home.json`.
- Mission UI: `screenshots/milestone80-mission-dev.json`, `screenshots/milestone80-mission-production.json`.

Tests use isolated browser profiles. The actual user's library, provider accounts and native files were not modified. Existing large frozen-clock provider scenarios are outside this bounded test selection; an eight-hour soak and physical-device/provider checks are not claimed.
