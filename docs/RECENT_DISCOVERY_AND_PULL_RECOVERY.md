# Recent discovery and pull recovery

Delivered 27 October 2026. Mission revision 55 completes next-021 (YouTube feed gap repair) and next-029 (YouTube endpoint-specific recovery guidance). Default progress: 245/306 complete; 43 next-level items complete, 57 planned, four earlier external verification items remain open.

## Recent videos

Both provider pages include Fresh on YouTube/Twitch. Newest published uses provider publication evidence, not the time a pull/download ran. YouTube accepts RSS, watch-page or provider dates with known precision; relative, unknown, future, live and upcoming dates are excluded. Date-only evidence stays a UTC calendar date; exact timestamps display in local time. Twitch refreshes now retain publication precision/source and never substitute the current clock for a missing VOD date. Older Twitch rows without that provenance remain unconfirmed until refreshed.

Recommended recent ranks the newest 96 confirmed releases from the last 30 days using liked tags, creator likes/favorites, video saves/likes and ratings. Already opened titles get a modest penalty; disliked titles are excluded. A creator contributes at most three recommendations. Cold starts explicitly say recent release in the saved library instead of inventing personal evidence. Recently opened uses existing saved open events, including previews; it does not claim verified playback duration from an iframe.

Selection visits the catalog cooperatively in the existing four-millisecond slices and retains at most 48 newest, 24 recommended and 48 history rows. Eight cards mount initially; Show 8 more caps the window at 48. Mobile uses a horizontally swipeable row. Selection cancels during viewer use, hidden/idle ownership or navigation; there is no new polling or persistence ledger. Refresh recent picks recalculates local picks; provider fetching remains in the pull controls.

## Faster routine pulls

Recent pulls have a selectable target of 12, 24, 50 or 100 eligible creators, defaulting to 24. Large batches send four creators per app response instead of two; lists of four or fewer retain two-creator responses. The completion queue still holds at most two requests. Already completed healthy responses can share a catalog merge without waiting for a held response. Provider transfer limits, spacing, cooldowns, cancellation, saved archive progress and oldest-first rotation remain enforced.

Controlled desktop/mobile browser tests verify that a 12-creator recent refresh takes three app responses instead of six. This halves app/server round trips and scheduling/merge overhead; it does not halve the number of upstream RSS reads or guarantee doubled internet throughput. A 100-creator store fixture uses 25 responses, while scheduled turns remain bounded at 12 creators. Held-batch tests verify independent healthy completion and checkpoint retention.

## Feed gaps

A saved upload watermark missing from a full 15-entry RSS window records a possible gap. Short/empty feeds do not establish a gap or deletion. The original watermark stays in recentPull.gap even as normal recent checks advance their newest-video watermark. Gap state and its separate continuation survive reload/export through the existing follow checkpoint normalizer.

Repair feed gap is explicit and reads at most two complete upload pages per action, targeting 100 rows. It stops when the old identity is observed and admits recovered cards through the existing deduplicating, capped merge. Partial pages retain their unconsumed repair cursor. Normal catalogCursor/catalogCheckedAt/catalogExhaustedAt, feed observation time, personal tags, saved feedback and live state remain independent. A terminal public catalog without the old watermark is unresolved, not proof of deletion. There is no automatic deep-history walk.

## Recovery lanes

The YouTube pull control shows separate feed, archive and live observation/retry state, plus public-page/details diagnostics where available. A feed-only hold leaves healthy archive/live actions available. A provider-wide rejection disables every affected action without clearing previous successful observations. Explicit actions retain other lane waits; there is no blanket reset. Refresh retry status re-evaluates local deadlines without polling a provider. Unknown archive success time is labeled Not recorded rather than using an attempt as a success.

## Verification

- Build and TypeScript checks passed.
- Script suite: 1,021 passed, zero failures. Native TypeScript suite: 622 passed, zero failures after correcting the new helper's explicit .ts import. Full evidence is split between screenshots/recent-discovery-tests.txt (script phase) and screenshots/recent-discovery-native-tests.txt (final native run).
- Focused real-adapter fixtures recover more than 15 intervening uploads, stop at the anchor, deduplicate overlapping RSS/archive cards, enforce the two-page repair budget and preserve all independent positions on malformed responses.
- A 100,000-row selector fixture verifies cooperative yielding, bounded results, date exclusions, privacy filters and personalized explanations.
- Development and production browser reports: screenshots/recent-discovery-{dev,production}.json. Both desktop and mobile cover sorting, 8-to-16 expansion, liked-tag recommendations, opening previews/players, saved open times, feed-only versus global waits, repair and reload persistence.
- Pull rotation/batch reports: screenshots/recent-pulls-{dev,production}.json.
- Revision 55 migration reports: screenshots/recent-discovery-mission-{dev,production}.json; custom and manually reopened states are preserved.
- Production fast-opening/MFC guard: screenshots/recent-discovery-opening-production.json.
- Home dev/production smoke reports and screenshots: screenshots/recent-discovery-home-*.json/png, clean consoles and no production divergence. Desktop/mobile recent and recovery screenshots were visually reviewed.

Provider pages and metadata were controlled fixtures in isolated Chrome profiles. No real provider account, media, physical phone, sustained upstream throughput or multi-hour soak is claimed.
