# Browse tasks and saved places

Revision 93 · next-125 and next-128 · 2026-11-03

The header has Back, Forward and a map-pin **Saved places** button. Back/Forward (also Alt+Left/Right outside text fields) move through this app session's last 32 browsing tasks. A task retains its desk, search and structured filters, sort, grid/list view, supported desk controls, and a logical media anchor. Moving back from a title closes its preview/player; moving forward to a title opens its preview and does not start playback. Starting a new task after going back discards the old forward branch.

Choose Saved places → **Save this place** to preserve a task across reloads. Focus a result first to save that title, including a result beyond the first page. Otherwise the visible grid supplies an anchor. Up to 24 places fit in the selected local profile. Open restores the task; Remove deletes only the saved place. The list uses numbered places and current source labels rather than retaining old media titles. Public and private places appear only in their corresponding desk scope; private places also require Adults to remain unlocked.

## Baseline and implementation

The previous app kept one global source/query/sort/view and some desk-local controls. Leaving YouTube reset expanded shelves and tag selection. Virtual grids retained a viewer-return anchor only when their array and route identities stayed unchanged. Saved search workspaces preserved a query, but had no logical result position. There was no bounded browse-task stack or persisted result bookmark.

The implementation extends those existing owners rather than creating another result catalog:

- `src/lib/browse-tasks.ts` validates small snapshots, owns the bounded session history and explicit bookmark transactions, and resolves at most four candidate identities in cooperative slices.
- `src/lib/browse-task-session.ts` supplies a small shared control/restore signal with tickets. Obsolete completions cannot consume a newer restore.
- `src/components/library/use-browse-tasks.ts` joins the existing catalog-restore promise before enabling controls. It captures transitions from the live library store and restores the supported root-owned YouTube, Twitch, Adults, Favorites and History controls after route resets. Tool-specific editor forms keep their own existing persistence; the task stack does not copy those forms or integration credentials.
- `src/components/library/browse-task-controls.tsx` adds the existing-style header controls, scoped Saved places sheet, explicit storage-error recovery and restore feedback. Opening a place transfers focus to the result instead of allowing the closing sheet to reclaim it.
- `src/components/library/virtual-video-grid.tsx`, `use-grid-admission.ts` and `src/lib/grid-admission.ts` restore against the current eligible result slice. A far-away identity advances only the numeric admission extent; the existing measured viewport window still bounds mounted cards. Measurements can recalibrate while seeking the target. Weak references and the current ranking revision allow selection to survive delayed enrichment or complete grid replacement. Explicit pointer, wheel/touch and focus changes stop automatic continuation so an older anchor cannot override a newer intent.

Snapshots contain no card arrays, cached title text, descriptions, artwork, media bytes or integration credentials. They retain a query, primitive desk settings, scroll offset and at most four media IDs. Verified local-file aliases use the existing identity ledger; titles and paths never serve as identity guesses. Neighborhood IDs can provide an explicitly labelled fallback. A missing or newly private title never reveals its old title text, and the remaining query stays open. An unavailable source discards its unavailable anchor and opens the remaining task in its public/private library desk.

## Persistence, privacy and performance

The session history stays in memory and resets with the document/profile. Scrolling and history changes make no new storage writes. Only explicit Save/Remove writes the version 1 `reelcase.browse-bookmarks.v1` envelope through the existing profile-storage adapter. Invalid, oversized or future schemas disable mutations and preserve existing bytes. Read-before-write conflict detection asks for Reload saved places rather than overwriting another tab; this is not a transactional cross-process lock. A quota failure preserves the last saved value.

Private task history is purged when Adults locks. Saved private places remain stored but unavailable outside the private desk or while locked. A profile switch starts a new document and task stack, with a separate namespaced bookmark key. Result restoration runs only against the already visibility-filtered current grid; removed, hidden and private media do not become visible through a bookmark. Existing search workers, cancellation, provider budgets and media persistence remain in use. No polling, new provider requests or catalog-sized history copies are added.

## Verification

Focused commands and reports use `screenshots/browse-tasks-*`:

```text
node --experimental-strip-types --test src/lib/browse-tasks.test.ts src/lib/browse-task-session.test.ts src/lib/grid-admission.test.ts src/lib/virtual-grid.test.ts src/lib/library-navigation.test.ts src/lib/navigation-store.test.ts src/lib/search-workspaces.test.ts src/lib/videos/search-query.test.ts src/lib/videos/search-ranking-session.test.ts src/lib/local-profile-storage.test.ts src/lib/mission-plan.test.ts scripts/mission-next-wave.test.mjs scripts/mission-next-level.test.mjs
node scripts/browse-tasks-browser-check.mjs http://127.0.0.1:8080/ screenshots/browse-tasks-dev.json
node scripts/browse-tasks-browser-check.mjs http://127.0.0.1:8083/ screenshots/browse-tasks-production.json
```

The browser workflow uses fresh desktop/mobile contexts and the real app, virtual grids, search workers, profile adapter and file-identity repository. It covers three distinct desk searches, deep anchors, back/forward, preview navigation, reload, verified file moves, reordered results, newly private anchors/neighbors, source removal, explicit deletion, quota errors, alternate profiles and future schemas. Fixture source removal retires its catalog rows as well as its source metadata, since the app correctly reconstructs source folders from saved media.

Final results: build and typecheck pass, with **156 focused automated tests** passing. The workflow passes in development and production, including an explicit ranking refresh, a subsequent mouse click and restored Twitch full-catalog expansion. Existing saved-workspace and historical mission browser regressions pass; revision 93 migration passes in both builds. Navigation audits pass **66 page reports per build**. Final Home renders have clean consoles/layout, no brand/auth warnings and no production baseline divergence. Desktop/mobile Saved places, restored titles and the responsive header were visually inspected. The header reserves space for readable page/profile labels and wraps the action group on narrower desktop windows.

Verified default roadmap totals: **315/406 complete**, **113/200 next-level** and **17/100 new batch**. Revision 93 promotes only next-125 and next-128 once; earlier manual reopens and custom notes remain preserved.

Limitations: browser metadata and provider responses are deterministic fixtures. These checks do not establish real provider playback, physical-phone performance, native file permission recovery or a long-running memory soak. App task controls do not replace the browser's document history. Saved places are browser-origin/profile local and do not synchronize across devices.
