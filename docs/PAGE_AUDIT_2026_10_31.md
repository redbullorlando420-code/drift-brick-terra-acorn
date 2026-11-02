# Page audit and reproduced fixes

Audit started October 30 and finished October 31, 2026. Existing library data was never reset: browser checks used disposable contexts, synthetic media, and intercepted native/service actions.

## Fixes

- Games, 3D Prints, and Settings recover valid hub entries from null, partial, or damaged saved records without rewriting the original record on load.
- Photos search/sort controls wrap within desktop and mobile widths. Gallery people/tags and full-screen tags preserve commas and spaces during actual typing, then normalize labels on blur.
- Pending photo metadata flushes on navigation, page hide, and document hiding. Empty photo workspaces avoid metadata writes. Hidden-photo flags survive the durable metadata normalization and reload.
- Shop validates package records individually, preserves readable orders, and no longer writes an empty initial list over storage on mount. Failed saves retain session changes, explain the problem, and offer Retry saving packages. Order status controls have names and long values wrap on mobile.
- Spotify validates official playlist/album/artist links, handles localized URLs, removes tracking variants, and rejects invalid stored links. One versioned record keeps the selected shortcut and imports together. Storage failures preserve the prior saved state and retain the input for retry.
- An explicit Next/Previous request prepares the existing bounded playback ID window when background preparation is still deferred. An early mobile keyboard request no longer disappears. Opening the player still defers background work, and the playlist retains its order as playback advances.

## Coverage and evidence

- `scripts/all-pages-browser-check.mjs` derives all **30 sidebar pages** from the real navigation and checks desktop and touch-mobile rendering, **14 internal ARIA tabs per viewport**, expandable panels, visible content, horizontal overflow, and uncaught errors. It also visits the landing redirect and missing-page route. Development and production each cover **64 page/viewport combinations**.
- Final navigation evidence: `screenshots/all-pages-final-dev.json`, `screenshots/all-pages-release-production.json`. Contact sheets and individual page screenshots are under `screenshots/all-pages-*`.
- Damaged saved hub regression: `screenshots/page-recovery-before.json`, `screenshots/page-recovery-fixed-dev.json`, `screenshots/page-recovery-production.json`. Twelve cases per run verify all three affected pages, both viewports, null/partial records, valid-entry retention, and no rewrite on load.
- Shop/Spotify regressions: `screenshots/workspace-shortcuts-before.json`, `screenshots/workspace-shortcuts-fixed-dev.json`, `screenshots/workspace-shortcuts-production.json`. Includes storage-full injection, explicit retry, and reload.
- Photos: `screenshots/photos-workflow-before.json`, `screenshots/photos-workflow-fixed-dev.json`, `screenshots/photos-workflow-production.json`. Actual sequential typing, upload, viewer, download, search/no-match, hide/restore, immediate navigation, reload, and explicit file reattachment are exercised. Browser-selected files still require reattachment after reload; metadata persists separately.
- Keyboard/player: `screenshots/keyboard-queue-verified-dev.json`, `screenshots/keyboard-queue-production.json`. The test deliberately withholds idle queue preparation, then exercises Next/Previous, native provider input, local MP4 playback/seek, shortcut help, focus restoration, and recipe review.
- Additional desktop/mobile workflows passed: `all-pages-desks-final-dev.json` (Twitch status, movie/anime classification, Guide and Topics), `all-pages-film-fixed-dev.json`, `all-pages-anime-fixed-dev.json` (editions/episodes, metadata, undo, save failure, reload, ZIP compatibility and reviewed import), `all-pages-prints-dev.json`, `all-pages-local-tools-fixed-dev.json`, `all-pages-signal-dev.json`, and `all-pages-backup-dev.json`.
- Watch Room: `all-pages-room-reconnect-dev.json` covers three real WebRTC clients, bounded catalog backpressure, receipt reconciliation, dropped requests, superseded intentions, and permission revocation. The older collaboration test assumed an automatic retry after another guest changed the queue; the current receipt/revision policy correctly requires reconciliation instead. It is not counted as a passing check.
- Updated older browser checks to the current movie browser, Guide evidence/empty-result wording, explicit image cleanup confirmation, Companion protocol, legacy ZIP controls, and reviewed backup import. None of the production safeguards was removed to satisfy old tests.
- `npm run build`, `npm run typecheck`, and **126 focused tests** passed. Logs: `screenshots/all-pages-build.txt`, `.grok/all-pages-typecheck.txt`, `screenshots/all-pages-tests.txt`.
- Desktop/mobile smoke checks have visible content, clean runtime/console and layout checks, no branding/authentication warnings, and a production baseline comparison without divergence: `screenshots/all-pages-home-dev.json`, `screenshots/all-pages-release-home.json`.

## Limits

This is bounded page and workflow testing, not an assertion that every possible action or external service is bug-free. Authenticated provider playback, real GPU generation, native remote sessions, real account posting, physical phones, and an eight-hour soak were not claimed. Companion/service failures were controlled in fixtures; production account credentials were not accessed. A transient Windows error writing an existing evidence filename was retried with fresh evidence paths and was not treated as an app failure.

No roadmap milestone was marked complete solely because of this audit.
