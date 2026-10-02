# Ranking update — 2026-10-01

The shared formula is in `src/lib/videos/ranking-core.ts`. `RATING_MULTIPLIERS`, `RATING_STAR_WEIGHTS`, and `PERSONAL_RANK_WEIGHTS` hold the production values. UI comparisons and worker ranking import the same math and star weights.

## Behavior

- Original star meanings remain: 1 dislikes, 2 is neutral, 3–5 become progressively positive. Unrated evidence has a 1× multiplier.
- Multipliers for unrated / 1 / 2 / 3 / 4 / 5 are 1 / 0.2 / 1 / 1.2 / 1.5 / 1.9. Star preference is 0 / −3 / 0 / 1 / 2 / 3.
- Positive evidence multiplies; negative evidence divides. Add star preference × the context weight (personal 12, YouTube 6, preview 2). Raising a rating therefore cannot worsen a negative discovery penalty.
- Personal signals saturate: favorite 12, like 6, watch 12, plays 6, private marks 12, topics ±12, creator affinity ±8, creator like 6, freshness 3. Plays and marks grow logarithmically. Creator stars add a separate adjustment.
- Adults recommendation and related rows retain personal score before bounded relevance bonuses. One-star titles stay in the catalog and saved pages but are excluded from those rows and preview/YouTube recommendations.
- Adults related results follow the current source/type/tag filters. Small photo catalogs still receive recommendations.
- Tag preference counts explicit ratings or other feedback, rather than treating every unrated title as a vote. Preview tag aliases count once per rated title. Sparse feedback shrinks toward neutral.
- Local top-rated picks include watched titles rated 3–5; stars lead, then personal score and a shuffle tie-break, with three titles per folder.
- The old offset incorrectly subtracting three from already-centered topic/creator preferences is removed.
- Creator/provider balancing remains. A score is not a guarantee of absolute shelf position. Mixed/Latest/Trending/manual catalog orders retain their separate rules.

## Interface

Stats → Ranking lab has Formula, Compare scores, and Page ordering tabs. Comparisons cover personal shelves, YouTube discovery, and preview suggestions. Controls are a sample sandbox; they do not alter saved feedback or production tuning. YouTube, Adults, Landing, and Twitch include expandable ranking guides linking to Stats. Long Stats watch-history labels no longer widen the mobile page.

## Verification

- Typecheck and final production build passed.
- Complete TypeScript phase: 230 tests passed (`ranking-unit-tests.txt`). Relevant integration suites: 31 passed (`ranking-script-tests.txt`). Final affected-suite rerun after shared-weight/UI changes: 43 passed (`ranking-final-tests.txt`).
- Tests cover monotonic stars for positive and negative evidence in all three contexts; bounded feedback/tag bonuses; preservation of Adults rating order; source/photo filters; dislike exclusion; sparse tag evidence; exact agreement between score breakdown and the hot scoring path; creator diversity and catalog/cache behavior.
- Desktop 1280×800 and mobile 390×844 smoke checks passed on dev and final built output, without console/page errors, overflow or baseline divergence (`ranking-dev.json`, `ranking-build.json`). Both dev screenshots were visually checked.
- Interactive browser checks exercised all ranking tabs, keyboard Home/End, negative and positive evidence, rating/watch inputs, favorite/like checkboxes, all comparison contexts, and the mobile YouTube-guide → Stats link. Built comparison results matched development and had no console errors. Mobile Stats and comparison page widths were 375px within a 390px viewport.
- The in-app dev browser restored roughly 6,000 YouTube and 1,640 Adult titles. Chrome’s debugging connection was unavailable; the in-app browser was used for interactive verification.
- Full `npm test` still has seven pre-existing harness failures involving symlinks, Windows command quoting/path handling, and stale structural assertions in browser/auth checks. The affected source files were not changed. See `ranking-full-suite.txt`; these failures are not reported as a passing full suite.
