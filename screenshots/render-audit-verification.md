# Render invalidation milestone — 2026-10-04

Completed `speed-03`; defaults now total 177 / 200. Revision 16 promotes only this new completion and preserves later manual status choices.

## Delivered

- Search keeps one published result order while ratings, favorites, likes and watch counts change. Closing a preview/player no longer removes the grid to rerank it. Pagination and keyboard return anchors survive.
- Refresh ranking explicitly applies the latest feedback. Query/source/catalog, hidden/unavailable titles, privacy folders and tag eligibility still invalidate old results immediately. Failed ranking has a retry action.
- One cancelable ranking job is held during playback and released on navigation/idle/unmount. No historical query cache or full-catalog scan runs for taste updates.
- Memoized unchanged grids skip parent updates. Rating subscribers are keyed by title, so preview ratings synchronize matching cards without notifying unrelated cards. Recycled cards release listeners; durable feedback hydration refreshes active snapshots.
- Ratings expose their selected state to assistive technology; clicking the selected rating clears it. Test likes and the test rating were restored to their prior values.
- Automatic grid paging disconnects while a preview/player covers browsing, including the queued observer callback race.

## Verification

- 385 TypeScript library tests and 41 relevant store/persistence tests passed (426 total). Coverage includes a million-row result reused across 10,000 feedback updates, no scan/rerank on those updates, keyed listener cleanup across 10,000 recycled cards, explicit reranking, every eligibility dimension, viewer cancellation/resume, late resolve/reject, release/remount, real ranking and durable feedback restoration.
- `npm run typecheck` and `npm run build` passed. Windows sandbox dependency tracing and browser network restrictions required the already authorized outside-sandbox build/browser commands.
- Development and production desktop/phone smoke passed: visible content, no console/page errors, no horizontal overflow, no brand/auth warnings, no production baseline divergence.
- Populated Chrome profile: 172,070 total entries; 99,999 YouTube entries; Minecraft search returns 515 titles. Desktop search loaded additional pages, used End to focus a later title, synchronized preview/card rating, and retained its order and focus on close. Phone search retained 72 loaded titles after a like/preview close with only 10 cards mounted. A repeat preview returned index 2 at exactly 331.96875 px before/after, retaining the same title, focus and loaded count. Explicit refresh returned to the initial 36-title page and “Ranking up to date.”
- Large YouTube navigation rendered its creator mix with six rail cards mounted. Favorites navigation and Home/Settings transitions rendered. Existing local diagnostics reported input-to-next-paint approximation: navigation 57 ms (worst 79 ms), search input 84 ms, rating 49 ms. These are spot samples, not complete search-ranking duration or physical-device timings.
- Production search/refresh and its no-match grid were also exercised in a clean browser origin with no runtime errors. The populated profile belongs to the development origin; production smoke used a separate empty origin.

## Limits still open

The long-session memory soak, physical-device memory measurements, broader accessibility/dialog focus audit and real-provider archive soak remain separate milestones. This turn does not claim those are complete. Search deliberately keeps its order until explicit refresh; new queries and eligibility changes always rebuild from current inputs.

Proof: `render-audit-desktop.png`, `render-audit-mobile.png`, `render-audit-dev.json`, `render-audit-production.json`, `render-audit-library-tests.txt`, `render-audit-store-tests.txt`, `render-audit-build.txt`, `render-audit-typecheck.txt`.
