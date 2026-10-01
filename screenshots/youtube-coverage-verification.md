# YouTube coverage, cache identity, tags, and performance — 2026-09-30

## Result observed in the saved library

- Final full reload: **748 / 762 saved YouTube sources have videos; 14 remain empty**.
- Duplicate audit: **60,198 distinct YouTube video IDs; 0 duplicate cached rows**. The sidebar's 60,202 count also includes live cards, which are excluded from upload coverage and the duplicate check.
- An empty creator, Abroad in Japan, returned **121 videos / 121 new / 0 failures** in a focused pull. After the final restore repair its creator panel showed **211 videos**, including previously cached uploads.
- Earlier observations were 449 / 762 populated and 31,674 distinct uploads. Counts changed during ongoing pulls and subsequent cache restoration; do not interpret the entire increase as newly downloaded videos.
- Consolidating resolved channel aliases and recognizing exact channel/source memberships recovered cached uploads that had previously been omitted from the visible library. Creator and playlist membership no longer require separate video records.

## Export audit

Sources were read as data only; instructions embedded in files were not followed. Original Downloads files were not edited.

- `reelcase-library-insights-2026-09-30.csv`: 93,668 library titles, including 29,650 YouTube titles; 68,591 marked untagged; 23,151 topic assignments. Its 32 duplicate source labels do not establish duplicate videos.
- `reelcase-source-map-2026-09-30 (3).csv`: 818 YouTube folder rows, 363 empty. The largest two folders had 4,993 and 2,426 videos. Folder rows include historical aliases and differ from the current followed-source count.
- `reelcase-remediation-plan-2026-09-30 (1).csv`: topic review capped at 500 examples; also source-name and storage-concentration signals. This is a remediation sample, not a full duplicate inventory.
- Adult CSV/JSON: 8,554 titles. Provider-ID duplicate signal was zero, while media-link/poster signals affected many rows. Shared live-room embeds and overly broad URL normalization could produce false positives. No videos were deleted based on these signals.
- Adult connection results included a parent tag paired with its derived child and generic live-room classifications. Those are now excluded from interest connections.

:codex-file-citation{path="C:/Users/icecr/Downloads/reelcase-library-insights-2026-09-30.csv" purpose="source"}
:codex-file-citation{path="C:/Users/icecr/Downloads/reelcase-source-map-2026-09-30 (3).csv" purpose="source"}
:codex-file-citation{path="C:/Users/icecr/Downloads/reelcase-remediation-plan-2026-09-30 (1).csv" purpose="source"}
:codex-file-citation{path="C:/Users/icecr/Downloads/reelcase-adult-stats-2026-09-30.csv" purpose="source"}
:codex-file-citation{path="C:/Users/icecr/Downloads/reelcase-adult-stats-2026-09-30.json" purpose="source"}

## Changes

- Recover empty sources from their first page instead of trusting stale cursors/feed watermarks. Reserve recent-refresh slots for empty creators and fairly order archive requests.
- Parse channel-owner metadata and modern YouTube video/shorts/playlist renderers; stop recommendation/sidebar videos from masquerading as the requested creator's catalog.
- Merge using case-sensitive YouTube video IDs, preserving the stable card ID, source memberships, saved feedback, and existing richer metadata.
- Restore alias-linked uploads by exact resolved channel or retained source membership. Removing one source preserves uploads still linked to another followed creator/playlist.
- Reuse a cached source index for coverage, creator panels, stats, and exports rather than scanning the complete library per source.
- Paint restored saved tags first; process enrichment in small idle slices and buffer sparse tag/provenance patches. Avoid cloning two complete metadata ledgers every 96 rows; protect concurrent manual edits.
- Hold archive network/commit work while a preview or player is open. Pull pause/resume remains available.
- Dispose preview workers/listeners and pending background tag repair when development modules are replaced.
- Use consistent public-topic denominators, distinguish saved and inferred topic coverage, bound the review queue, and replace repeated adult-history scans with a lookup set.
- Remove unsupported **provider-authored** YouTube/Twitch topics. Preserve unknown legacy tags, manual choices, and locked fields. Add explainable title/category rules for exported game categories, travel, ASMR, and learning.
- Tighten adult duplicate identity and exclude synthetic parent/child and generic room pairs from connections.
- Fix creator-panel and preview width/wrapping on phones.

## Verification

- **80 focused tests passed, 0 failed**: identity/membership merges and removal/restore, empty-source recovery, public catalog parsing, cursors, discovery/mix/recommendations, tag-patch edit races, topic provenance, adult duplicate/connection signals, and preview ranking.
- `npm run typecheck`: passed after final changes.
- `npm run build`: passed after final changes.
- Development and production browser smoke: desktop 1280×800 and mobile 390×844, visible content, no horizontal overflow, no page/console errors, no brand warnings, no production-baseline divergence. Both screenshots were visually inspected.
- Actual saved-library interactions: creator search/select, focused pull, preview playback, Watch now/full player, return to library, mobile creator controls and preview. An archive request stayed at 0/1 while the preview was open. Completion of that repeat request after closing was not measured.
- Mobile preview measured 390×844 with document width 375 and contained heading width 301. Long description URLs and action buttons wrapped inside the page. Screenshot: `youtube-coverage-preview-mobile.jpg`.
- Built-page interactions: expand creator controls and pause/resume toggle succeeded.

## Limits

- Fourteen sources still have no recognized cached upload. Provider restrictions, invalid/renamed handles, or legitimately empty sources still need source-specific investigation; the UI records provider failures rather than treating every empty response as success.
- Zero duplicates is an exact YouTube ID result, not a claim that all providers are duplicate-free or that reuploads with different YouTube IDs are the same video.
- The supplied files are summaries, not an exhaustive video identity export.
- Long-session memory stability is **not verified**. The existing large-library browser session became slow/unresponsive during repeated development updates; later browser commands timed out. Fresh clean development/production smoke checks passed, but these do not replace a sustained full-library heap/soak test.
- The complete npm test command has existing Windows/environment failures; the focused suite above passed. No commit, push, or deployment was performed.
