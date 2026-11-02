# Local profiles and catalog admission

Delivered 2026-11-02 after explicit approval to apply and verify the reviewed patch. Revision **83** completes **next-010** and **next-014**: **96/100** next-level milestones, **298/306** overall. Later manual statuses and custom mission wording remain preserved.

## Using profiles

Open **Settings → Local profiles**. Review setup counts, create an empty named profile, then review and confirm switching. Default retains its original storage in place. Other tabs keep their selected profiles. These are browser-local organizational profiles, **not passwords or separate sign-ins**; up to 16 including Default are supported.

Switching refuses active pulls/scans, closes views, cancels pending catalog admission, flushes personal changes and reloads. Modules bind once per document, so delayed writes cannot change destination just because session selection changed. Missing selections prevent the writable app from mounting and offer Return to Default. Duplicate names, unsupported records and quota failures preserve prior data.

## Storage inventory

- Each profile has separate app local/session preferences, catalog/activity/remote-cache database, restore checkpoints, source grants, Prints blobs and writer channel. History, follows, private tags, saved edits, announcements, tool notes and exports use these boundaries.
- Default keeps `reelcase` and `reelcase-prints`. New databases append `.profile.<id>`; app preference keys use `realhub.profile.v1:<id>:`. Selection is read once from raw sessionStorage. The small shared `realhub-local-profiles` database contains profile names/IDs only. Registry writes serialize in IndexedDB.
- Authentication cookies and Better Auth bearer storage remain global. No native Storage/prototype behavior is replaced in the product. Foreign personal notifications are filtered, same-profile keys translated, and authentication event transport left unchanged.
- Native Companion tools, approved roots and installed engines remain device services. Explicit Watch Room connections, disposable public-provider server caches and the local-model byte cache remain shared; app permissions, settings and personal annotations are scoped.
- The preview reads counts only, without personal values or creating a disappeared library database. Browser profiles do not transfer data between localhost origins or devices.

## Catalog admission

The consumer acknowledges each page before fetching another: **one pending page maximum**, at most **512 rows** per read. Startup yields behind navigation/input work; profile switching cancels admission. Disk records remain available on return, and the reusable reader can resume after its last acknowledged key. This bounds page scratch, not total catalog memory or eight-hour retention.

## Verification

- **215 focused tests pass:** 87 runtime (`milestone83-final-runtime-tests.txt`), 88 roadmap (`milestone83-final-roadmap-tests.txt`), 40 smoke guards (`milestone83-smoke-tests.txt`), all under `screenshots/`.
- `milestone83-profiles-dev.json` and `milestone83-profiles-production.json`: real desktop/mobile creation, preview, switch cancellation and Default/Alpha/Beta round trips; separate libraries, private tags, history, follows, announcement drafts, print bytes and actual ZIP exports; duplicate/quota errors and missing-profile recovery.
- `milestone83-cursor-native.json`: native IndexedDB **100,000-record** pause/cancel/resume, every ID exactly once, maximum pending pages one. `scripts/profile-switch-store.test.mjs` verifies the actual store checkpoint cancels a held read, rejects late admission, closes views and refuses busy pulls.
- `milestone83-profile-events.json`: native same-profile event delivery, foreign-profile filtering, frozen document selection and unchanged authentication transport. `milestone83-native.json` covers concurrent registry creation, quota rollback and future-version retention.
- Build/typecheck pass. Dev and production Home checks have clean consoles, no overflow or baseline divergence. Both environments pass **64** navigation/route reports. Desktop/mobile screenshots and contact sheets were inspected.
- `milestone83-missions-dev.json` and `milestone83-missions-production.json` verify completion promotion and manual/custom-state preservation. `milestone83-restore-production.json` verifies existing reviewed backup activation, rollback and actual ZIP export on desktop/mobile.

All browser checks use disposable contexts and synthetic records. No real user library was exported or copied. The eight-hour soak, physical-phone tests and external-provider readiness remain separate work. The earlier transfer remains pending in `LOCAL_ORIGIN_TRANSFER_STATUS.md`.

## Approval artifact

Automatic review initially rejected the integration because incorrect routing could strand or mix saved state. The user then explicitly approved **Apply migration and verify**. Every hunk of the exact 70-file patch matched before application; unrelated work was retained. Its SHA-256 is `859695f1fca97238fde8e325a1fd855b6adc5bb2d8cdd6ad0889c4ccc96b70a3`. `PROFILE_MIGRATION_PROPOSED.patch` and `.grok/profile-applied-manifest.json` preserve the artifact and initial application hashes. The generator refuses to overwrite it after application. Focused refinements are represented in the current source and tests.
