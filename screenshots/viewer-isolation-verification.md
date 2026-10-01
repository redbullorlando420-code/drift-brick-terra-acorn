# Playback and saved-library responsiveness

Verified October 1, 2026.

- The covered browse page uses a single shared subscription that holds one snapshot while a preview or player is open. Playback, controls, and durable saving use the live store. Closing the viewer publishes the latest state without replaying intermediate updates.
- Rating changes affecting browse recommendations coalesce until the viewer closes.
- History resolves public/private matches against the original sparse activity cache, avoiding separate full-catalog recovery arrays. Resolved aliases render once per video while the saved event timeline remains intact.
- History and Continue no longer compute and discard a full public list before selecting their saved activity. Favorites reuses activity matches when reopened or when privacy/display filters change.

## Verification

- Build and typecheck passed.
- All 204 TypeScript tests passed. The broader script suite has previously reported Windows harness/migration failures; it was not rerun as a passing gate for this change.
- Five media performance tests passed.
- A stress test applied 10,000 live playback updates with zero covered browse notifications, then one notification on close. Multiple subscribers share one upstream subscription. Unmount releases the retained snapshot, including a million-entry fixture.
- A 100,000-title Favorites test verified warm scope/filter changes stay proportional to saved matches rather than scanning unwatched titles.
- The browser module check exercised 100,004 catalog rows, public/private History and Favorites, hidden/demo exclusion, shared URL aliases, evicted playable links, and local/YouTube/Twitch/Watch Room Continue recovery.
- Real Chrome interaction used the existing 60,220-video YouTube archive. Preview opened, Watch now opened the provider player, Back returned to the browse page, and the watched title appeared in Continue and recent History. Favorites and History rendered with a clean console.
- Mobile playback was checked at 390 × 844 with reachable controls and no horizontal overflow. Desktop/mobile dev and production smoke checks passed with no console errors and no baseline divergence.

These are bounded-work and interaction checks, not a long-duration memory soak or a measurement of provider streaming latency.
