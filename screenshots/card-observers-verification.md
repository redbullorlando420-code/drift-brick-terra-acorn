# Card responsiveness verification — 2026-10-01

Video cards now share two visibility observers across the mounted page. The
last card unmount disconnects both observers and releases retained DOM nodes.
Metadata updates for the same video no longer rebuild its observers. Old
observer generations cannot publish into a new mount.

Each card uses one scoped subscription to the thumbnail store and one to the
library store. Shallow comparison preserves per-video updates while reducing
listener and React hook overhead. Folder privacy flags are cached against the
immutable folder snapshot in a WeakMap, avoiding a source-list scan for each
card on every library update.

## Automated checks

- Type check and production build passed.
- TypeScript test phase: 208 passed, including three shared-observer tests.
- Media performance script: five passed.
- Observer fixture: 1,000 cards share two observers; teardown retains zero
  cards or observers. Duplicate, unmounted, and stale-generation callbacks
  are covered.
- Folder fixture: 108 mounted cards checked across 100 updates inspect the
  1,000 source flags only once. A new folder snapshot updates privacy correctly.
- Desktop/mobile dev and production smoke checks passed with visible content,
  no horizontal overflow, and no console errors. Production did not diverge
  from the dev baseline. Desktop/mobile screenshots were visually inspected.

## Saved-library browser checks

- Used the existing saved YouTube catalog of approximately 60,000 videos;
  pulling remained paused throughout.
- Desktop 1280 × 800: expanded discovery, paged to 96 loaded titles, scrolled
  both directions, and opened/closed a video preview. All 13 visible cards
  had loaded artwork after scrolling.
- Mobile 390 × 844: responsive grid, all 12 visible cards had loaded artwork,
  preview opened and closed, and subsequent scrolling displayed loaded cards.
  No horizontal overflow or captured console errors.
- Returning Home unmounted all video cards. The temporary test tab was closed
  and the viewport override reset.

The full npm test chain has unrelated Windows harness/migration failures from
earlier runs; this pass ran the complete TypeScript phase and relevant media
performance tests. No long-duration memory soak or before/after frame-time
benchmark was performed, so these checks do not establish that every lag or
out-of-memory condition has been resolved.
