# Saved entry limits and responsiveness — 2026-10-01

Settings → Pull management now provides combined remote, YouTube, Twitch, Adult, and other remote entry caps. Defaults are 200,000 combined; 100,000 YouTube; 25,000 Twitch; 100,000 Adult; 25,000 other. Each can be set from zero through one million. Adult limits include booru images and live providers. Hidden/saved records count; local file imports are excluded. Lowering a limit does not delete the retained library or set a byte-based RAM ceiling.

Admission runs before metadata, catalog merges and persistence for focused creator pulls, bulk imports, routine/live/archive refreshes and Adult pulls. Existing identities can refresh at a cap. YouTube aliases share one slot and canonical metadata ID. Partially admitted source pages retain their previous continuation/watermark; Adult providers do not advance a partially blocked page. Full archive sources stop starting new archive requests. Automatic Adult pulls check both source and combined capacity.

Large import batches merge once rather than rebuilding the entire library for every creator. New accounting/index scans, archive index construction, routine refresh traversal and tag/provenance copies yield in short browser tasks. Concurrent accounting/index callers share work per immutable snapshot. Accounting retains five counters, with weak snapshot caches. Routine preparation safely rebases against concurrent changes without fetching the same provider page again.

Companion availability probes coalesce and have a 1.5-second deadline, with brief success/failure caching and explicit retry. Disk thumbnail reads have a one-second deadline and ten-second offline backoff. Presence reads coalesce and briefly cache; presence requests have three-second deadlines. Longer companion import/inspection operations retain their existing budgets.

## Verification

- `npm run typecheck`: pass (`entry-limits-typecheck.txt`).
- `npm run build`: pass (`entry-limits-build.txt`).
- Full TypeScript test phase: 239 passed, zero failed (`entry-limits-unit-tests.txt`).
- Affected integration/performance/ranking scripts: 34 passed, zero failed (`entry-limits-integration-tests.txt`). Includes five real store-action tests with mocked provider and disk boundaries: focused cap and cursor, bulk cap, zero-cap refresh, changed in-flight settings, and Adult append exclusion.
- Full `npm test` script phase: 237 passed, seven existing harness failures (`entry-limits-full-suite.txt`). Same failures as prior verification: browser-smoke structural assertion; Windows auth glob; two symlink privilege failures; three Windows command-wrapper quoting assertions. The full command stops before its TS phase, so that phase was also run separately.
- Dev and production smoke: desktop 1280×800 and mobile 390×844 render content without console/page errors or horizontal overflow. Production does not diverge from dev (`entry-limits-dev.json`, `entry-limits-production.json`). Both dev screenshots visually inspected.
- Browser settings verification against the retained 7,782-entry dev library: YouTube cap zero holds new entries while preserving 6,142 YouTube entries; persists across reload. Combined cap 5,000 shows all 7,782 records retained and new entries held. Test settings restored to their initial defaults. Mobile input saving exercised; five fields fit without horizontal overflow. Desktop/mobile screenshots saved.
- Production browser opens the complete cap panel without runtime errors.
- Actual companion check returns `Companion v10 · 1 approved roots · Desktop ready`; diagnostic toggle restored to its initial disabled state.
- Prior ranking/performance work preserved. Generated production output cleaned after QA; dev server remains running. No commit or push.

This does not establish a million-entry browser soak result or a fixed RAM maximum. A lowered cap controls future growth; existing records remain retained.
