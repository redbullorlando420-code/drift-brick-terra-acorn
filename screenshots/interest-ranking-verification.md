# Ranking, lag and Reddit removal verification — 2026-10-01

Implemented:
- Shared capped multipliers for video likes/favorites, useful topics, hearted interests, creator likes/favorites, private marks and saved viewing time. Combined interest boost caps at 3x; star semantics remain separate and one-star recommendations remain excluded.
- Fixed YouTube discovery subtracting points for liked/favorited videos. Creator/provider variety remains intact.
- New separate creator-favorite ledger, backup/import support, and migration preserving the previous creator-favorite control's saved likes. Independent creator controls in previews and creator management.
- YouTube discovery scoring moved to a disposable worker. Compact metadata arrives in yielding batches; only bounded result IDs/positions return. UI resolves positions directly without another full catalog scan. Worker is released for preview/player, idle, hidden tabs and navigation.
- Feedback snapshots coalesce and copy large ledgers in yielding batches. Changes during packing invalidate obsolete snapshots. Preview tags/taste compile once, and both preview shelves share one candidate pass. Adult scores and inferred topics cache per signal snapshot; recommendation windows retain only 96 candidates.
- Reddit removal title/body/URL filtering applies at ingest and to cached Adult shelves and preview candidates. Selected Reddit photos get a bounded, cached media check for removal SVGs behind normal image URLs. Ordinary images cancel the extra response body; transient denial/offline responses do not hide content. Confirmed removals are marked unavailable without deleting saved records or reactions.
- Stats > Ranking lab > Interest boosts documents all families; score comparison includes topic/tag, creator, private mark and watch-time examples.

Checks:
- npm run typecheck: passed.
- npm run build: passed.
- TypeScript unit phase: 252 passed, zero failures.
- Focused integration suite: 42 passed, zero failures (Adult/media performance, real store admission/removal, YouTube ranking, feedback persistence).
- Includes 60,000-title callback scaling and bounded candidate comparisons against full-sort winners; no claim of a million-title or overnight browser soak.
- Full npm test script phase: 245 passed / 7 pre-existing failures (browser smoke structural assertion, Windows auth-schema glob, two symlink EPERM tests, three command-quoting/exit propagation tests). The later TypeScript phase was run independently and passed.
- Dev and production browser smoke: desktop/mobile content, no overflow, no console/page errors or branding warnings. Production matched the dev baseline.
- Real browser: 6,143 YouTube titles; worker recommendation shelf rendered 48 candidates with progressive cards. Preview opened with related/recommended results. Creator favorite/like toggles persisted over reload, remained independent, then were restored. Sample score changed from 143.4 to 370.2 at the combined 3x cap. Mobile 390x844 controls fit without horizontal overflow. Production Ranking lab guide and sample controls worked with no runtime errors.
- YouTube provider iframe requested bot sign-in, so playback itself was not verified. Reddit replacement responses were deterministic server tests; the user supplied notice text without a specific removed-image URL.
- Development hot refresh after adding hooks required a clean reload; final reloaded discovery rendered correctly.
- Global pulling restored to its original running state after browser checks. Generated .vercel/output changes were restored; source changes remain uncommitted. Dev server left running.
