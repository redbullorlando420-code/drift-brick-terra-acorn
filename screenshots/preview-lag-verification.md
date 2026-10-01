# Preview and playback lag verification

Verified September 30, 2026.

## Changes

- Preview recommendations reuse a short-lived worker catalog across video switches. Catalog preparation yields in small batches, and results return only the selected video's tag scores.
- Preview, player selection, opening playback, and recording a play share a bounded sparse video lookup. They no longer repeatedly search the complete library for the same video.
- Startup metadata cleanup skips unchanged tags and attribution, yields after small slices, and pauses while a preview or player is open.
- Follow normalization now rejects duplicate stable provider IDs as well as duplicate handles, fixing repeated React key errors after creator renames or channel resolution.
- Provider playback keeps the app controls visible. Cross-origin iframe touches cannot reliably restore a hidden toolbar.
- Recommendation cards immediately honor hidden, unavailable, and public/adult scope changes while their replacement worker catalog is being prepared.

## Checks

- `npm run typecheck`: passed.
- `npm run build`: passed after the final player and store changes.
- 59 focused tests: passed for preview ranking and its worker protocol, bounded video lookup, follow identity, merge/index behavior, YouTube discovery, creator mixing, recommendations, archive/live sweep, and embeds.
- A 90,000-video lookup test confirms 100 repeated playback lookups perform no further video-ID reads after the initial lookup.
- Final dev and production browser smoke checks: desktop and mobile rendered successfully, with no console errors, horizontal overflow, or production-baseline divergence. All four screenshots were inspected.
- Interactive checks used the real saved Chrome library with roughly 93,000 media entries and 29,000 YouTube videos. Desktop preview switching, recommendation loading, mobile preview-to-playback, persistent provider controls, and returning to the library worked. The final browser console was clean.

## Artifacts

- `preview-lag-final-dev.json` and desktop/mobile PNGs.
- `preview-lag-final-built.json` and desktop/mobile PNGs.

No before/after wall-clock percentage or long idle soak was measured. The full repository suite has existing Windows path/alias, symlink-permission, and migration-expectation failures recorded in the earlier verification reports; the focused pass above does not claim that full suite passes.
