# Large-library search result budget — verified October 3, 2026

## Delivered

- Filtering, taste scoring, stable full-result sorting, tag aggregation, and card resolution run outside React render in short cancelable slices.
- A new query, source change, navigation to a hub, idle session, or unmount discards obsolete results. Opening a preview/player cancels in-progress ranking; closing it resumes one fresh preparation pass.
- Search skips the covered YouTube, Twitch, Live, featured, classic, and Movie browse shelves, avoiding duplicate hidden derivation work.
- YouTube and Twitch results are scoped before scoring. Hidden, unavailable, sample, and private/public boundaries remain enforced.
- Valid description/path/category matches remain visible even with no title score. Top tags count each normalized tag once per matching video.
- Pending state remains visible through both worker matching and result preparation; no premature empty-grid message.
- Mission-plan revision 7 adds only the completed Large-library search result budget milestone. Render invalidation, broader browsing navigation measurements, and real-provider/long-idle soak remain unfinished.

## Checks

- Final `npm run typecheck`: pass.
- Final `npm run build`: pass. The sandbox denied a generated Nitro write on the initial attempt; the approved build retry completed.
- 286 TypeScript library tests: pass, including six new search-ranking tests and the milestone migration test.
- Nine media-performance tests: pass, including worker backpressure and stale-generation behavior. Total relevant tests: 295 pass, zero failures.
- Final development and production browser smoke: desktop 1280×800 and mobile 390×844 pass, visible content, no horizontal overflow, no console/page errors, no production divergence. Both desktop/mobile screenshots were visually inspected for each build mode.
- Populated Chrome catalog: 172,070 media entries, including 99,999 YouTube and 41,085 Twitch entries. YouTube `space` yielded 504 results; broad `youtube` retained 99,999 results. Switching to Twitch produced 114 Twitch results. Rapid replacement with an exact title settled at one correct result without stale cards returning.
- Mobile search at 390×844: 375 px client/scroll width, six mounted cards for 504 matches. Unknown-query loading settled to a true empty state. Exact-title preview → Watch now → YouTube player → Back to library restored the correct result.
- The completed milestone was verified in the populated Mission plan and captured on mobile. Saved pull pause, entry caps, and catalog data were preserved; no provider pull was started for QA.

## Synthetic benchmark

`scripts/search-ranking-benchmark.mjs` retained all 100,000 matches in the same order as the representative previous ranking calculation. A warm synthetic run measured 110.99 ms for the previous single blocking task, versus 327.79 ms total cooperative preparation with 1,225 yields and a maximum observed work slice of 12.26 ms.

This trades total throughput for opportunities to paint and handle input. These numbers are not browser input timings, whole-app speed ratios, or whole-heap measurements. Slice targets cannot preempt one expensive record operation or runtime garbage collection.

## Evidence

- `search-ranking-benchmark.json`
- `search-ranking-library-tests.txt`, `search-ranking-media-tests.txt`
- `search-ranking-typecheck.txt`, `search-ranking-build.txt`
- `search-ranking-dev.json`, `search-ranking-production.json`
- `search-ranking-desktop.png`, `search-ranking-mobile.png`, `search-ranking-milestone-mobile.png`

The long-idle memory soak, full browsing navigation audit, and real-provider archive soak remain open. This change does not establish that every source of lag or out-of-memory failure is resolved.
