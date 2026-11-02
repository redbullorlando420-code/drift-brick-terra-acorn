# Profile labels and visible identity — revision 85

Implements **next-101 — Profile rename lifecycle** and **next-105 — Profile identity in application chrome** together.

## Delivered workflow

In **Settings → Local profiles → Rename a profile**, select a named profile and save a new label. Names are trimmed, limited to 48 characters and checked for reserved names, case-insensitive duplicates and control characters. Default keeps its reserved name. A failed save keeps the previous durable label and the editable input for retry.

Renaming changes one profile registry entry inside a serialized IndexedDB transaction. Its immutable ID, creation time, selection, storage keys and database names stay the same. Competing renames cannot introduce duplicate names. Identical-name saves write nothing and emit no change. Notifications are sent only after transaction completion.

The active profile appears in the desktop/mobile header, expanded navigation, video preview/player and print editor. Its button opens the existing profile controls. Opening those controls from a viewer uses that viewer’s normal close path; it does not switch profiles. Missing selections identify their immutable ID on the existing recovery screen and keep the library unmounted until recovery.

The mobile player now keeps the profile beside its title, with the other actions on a second row. This fixes the initially clipped profile button in the crowded horizontal controls. Before/after evidence is retained as `screenshots/milestone85-player-mobile-before.png` and `screenshots/milestone85-isolation-production-player-mobile.png`. Viewer fixtures deliberately include an unavailable local file to verify identity and recovery controls without claiming successful playback.

Cross-tab messages carry only a version and revision hint. Tabs reread the validated registry; labels or personal counts are never accepted from the message. Shared identity consumers use one compact observer, with one read in flight and coalesced invalidations. There is no timer or polling fallback. Focus/visibility refresh supports environments without BroadcastChannel. In-flight results cannot overwrite a newer subscription, and unchanged snapshots do not notify consumers again.

Profile creation now waits for that same shared read before announcing success and offering the new switch target. This fixes a production timing race where the success notice could precede the new option. It does not add a second registry read or reload a catalog.

Profiles remain local organization with the existing authentication and storage boundaries. Identity is shown in Realhub’s own controls; a provider’s native fullscreen interface remains controlled by that provider. No external integration is newly connected by this change.

## Completion and persistence

Revision **85** promotes only next-101 and next-105 once. Later manual reopens and custom wording remain preserved. Defaults are **300/406 complete**, including **98/200 next-level milestones** and **2/100 in the new batch**. Actual local counts can differ because user decisions and custom ideas remain local.

The original 100-item completion registry is unchanged. The new batch has its own explicit completion IDs; both generated Markdown documents and in-app downloads include the current completion defaults or saved snapshot as appropriate.

## Verification

- **108 focused tests pass**, covering the migration history, both roadmap contracts, storage scoping, name validation and observer lifecycle/coalescing. An invalidation burst of 1,000 hints requires only one trailing read, and the settlement check returns the latest validated names.
- **13 native fixture checks pass**, including concurrent registry transactions, no-op rename, reserved/duplicate/missing targets, quota rollback, asynchronous transaction abort, unchanged database names and preserved private values.
- Build and typecheck pass. Desktop/mobile dev and production checks exercise two tabs, an unsaved local rename draft, live label/picker updates without reload, maximum-length labels, unsupported cross-tab transport, failed saves, reload, profile controls and missing-selection recovery.
- Populated-profile fixtures verify catalog records, private tags, history, follows, announcement drafts, print bytes and real ZIP exports before/after rename and profile round trips. Overlay checks exercise profile identity and navigation in preview, player and the sample print editor.
- Desktop/mobile mission checks verify one-time completion defaults, manual reopening, status controls and 100/200-brief downloads. All **64 sidebar-page reports** pass in dev and production. Home smoke checks have clean consoles, no overflow, no auth/branding warnings and no production baseline divergence. Screenshots inspected.

All browser work uses disposable contexts and synthetic data. No real user profile or library is modified by verification. Device-native fullscreen, actual provider playback and long-session memory retention are outside these milestone claims.

## Reproduce

```text
node --experimental-strip-types --test --test-timeout=20000 src/lib/mission-plan.test.ts scripts/mission-next-level.test.mjs scripts/mission-next-wave.test.mjs scripts/local-profile-storage.test.mjs src/lib/profile-registry-observer.test.ts
node scripts/profile-registry-native-check.mjs http://127.0.0.1:8080/ screenshots/milestone85-native.json
node scripts/profile-rename-browser-check.mjs http://127.0.0.1:8080/ screenshots/milestone85-profiles-dev.json
node scripts/local-profiles-browser-check.mjs http://127.0.0.1:8080/ screenshots/milestone85-isolation-dev.json
npm run typecheck
npm run build
```

Production browser checks use the built output on the isolated QA server. Evidence: `screenshots/milestone85-{tests,build,typecheck}.txt`, `milestone85-native.json`, `milestone85-profiles-{dev,production}.json`, `milestone85-isolation-{dev,production}.json`, `milestone85-missions-{dev,production}.json`, `milestone85-pages-{dev,production}.json`, and `milestone85-home-{dev,production}.json` with accompanying screenshots. Scripts use the established Playwright fallback for interactive checks.
