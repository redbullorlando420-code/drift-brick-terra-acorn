# Accounts and calmer provider pages

Date: 2026-11-02. Implements the requested Accounts section and YouTube/Twitch cleanup. The user explicitly selected **saved profiles on this computer**. Authentication stays in its existing disabled configuration; these accounts are local profiles, not new website sign-ins.

## Accounts

Accounts is a new lazy-loaded sidebar workspace and Home shortcut. The current-profile button in the header, navigation, preview, player and print editor opens Accounts. Existing viewer-close behavior is retained. The page shows saved accounts, a current-account marker, account creation, display-name editing, and profile-scoped library layout, sorting, Adaptive/Low memory preset and hardware playback preference. Default retains its reserved name and original storage.

Choosing another account uses the existing checkpoint, validation and reload boundary. Short catalog writes are observed through the existing writer subscription for at most five seconds, then the whole checkpoint runs again. There is no polling or bypass of pull, scan, restore, quota or writer guards. Busy work keeps the current account selected. Waiting releases the listener and deadline on completion or timeout. Creation and renaming retain the existing serialized registry validation, limits and error handling; no-op name saves remain disabled.

The page also exposes portable preference packs behind a collapsed panel and links to existing library/device settings. Personal libraries, follows, history, tags, drafts and print data retain their current namespaces. Browser grants, authentication and installed Companion services retain their existing scope. No data migration, sign-in setup or library relocation occurs.

## YouTube and Twitch

Both pages keep their normal viewing shelves and primary actions. YouTube's large publication-date, audit, coverage and pull-health area starts collapsed. Creators/imports and pull controls have their own collapsed sections; playlist shelves also wait behind a disclosure. A new close action releases YouTube recommendations and the full catalog after exploration.

Twitch groups live-check details, creator/import management, recent/archive/clip pulling and saved-library filters into collapsed sections. Existing recent videos, live viewing, creator mix, search and larger optional catalogs remain available. Active filters remain described in the collapsed filter summary. Blocking YouTube provider status and the shared pull banner remain visible independently of these controls.

Tools mount only when first opened. Once opened, closing a panel hides it without discarding typed inputs, job feedback or active user-initiated work. Leaving the page follows existing component cleanup. The disclosures themselves add no timers, storage writes or network calls. Existing automatic provider scheduling and public request limits are unchanged.

## Verification

- Build and typecheck pass; 65 focused account, navigation, profile/storage, performance, provider-contract and backup/restore tests pass.
- Desktop 1440×1000 and touch-phone 390×844 development/production acceptance uses disposable contexts and real persisted fixture data. It exercises creation, cancelled and confirmed switching, separate preferences, display-name changes, duplicate names, controlled registry quota failure, reload, Default round trips, empty new accounts, collapsed tool mounting, input retention, diagnostics, pull controls and opening/closing discovery catalogs. No uncaught browser errors or horizontal overflow.
- Populated-profile regression preserves actual catalog/history/follows/private tags/drafts/print bytes and ZIP exports. Viewer identity buttons close their viewers and open Accounts; the original Settings controls remain accessible. Portable settings-pack regression remains compatible with the new entry point.
- All-page development/production audits pass 66 navigation reports each (31 sidebar destinations plus landing and missing routes, in both viewports). Offline Companion 503 responses are expected controlled fixtures; no runtime/layout failures were recorded. Home production matches the development baseline. Desktop/mobile screenshots were visually inspected.

## Broader provider-test limitation

An additional run of the broad existing pull-entry-limits suite with a 20-second per-test budget timed out three large catalog cases; shared fixture work then affected later assertions. The three scale cases pass independently with a 120-second budget: 1,588 creators over 215,452 entries, 70,000 existing plus 3,000 newly admitted entries, and publication of live status before a 215k catalog reconciliation finishes. Four other isolated checks for cooldowns, scheduled growth, forced pulling and a stalled-first-batch pipeline pass.

One unrelated Adult paging assertion remains failing: **Adult multi-window pulls save accepted rows before a later failure and retain the latest resume page** expects requests [1,2], but records [1,1,2]. It also fails in a read-only comparison with the Accounts source registration removed from the only changed provider dependency. Provider logic was not changed for this UI request. This case is not counted as passing, and the broad suite is not reported as clean.

## Evidence

- screenshots/accounts-focused-tests.txt; accounts-switch-tests.txt; accounts-build.txt; accounts-typecheck.txt.
- screenshots/accounts-providers-dev.json and accounts-providers-production.json, with desktop/mobile Accounts and provider screenshots.
- screenshots/accounts-profiles-regression.json; accounts-portability-regression.json.
- screenshots/accounts-pages-dev.json and accounts-pages-production.json; accounts-home-dev.json and accounts-home-production.json.
- screenshots/accounts-tests.txt retains the broad-suite failures. accounts-provider-scale-recheck.txt, accounts-provider-stress-recheck.txt and accounts-provider-baseline-comparison.txt retain the isolated results.

Reproduce the main interactive check with node scripts/accounts-provider-browser-check.mjs followed by the development or production URL and a screenshots/ output path. Tests use synthetic local data and do not verify external provider playback or change the real user's library.
