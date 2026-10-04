# Startup milestone verification

Plan revision 14 completes `speed-01` (First interaction budget) and `recent-cold-home-readiness` (Cold Home readiness proof): 175/200 complete, 25 remaining. Revision migration preserves later manual choices and leaves memory soak and slow-device work open.

## Changes

- Startup filtering, ID indexing, merging, folder counting and resume linking prepare outside Zustand updates, yielding after at most 512 rows or approximately four milliseconds. Remote merge no longer creates a synchronous catalog-sized flatMap. Disk-page scheduling uses background tasks when available, and final Map materialization and legacy migration traversal also yield.
- Preparation rebases around changed catalog, follows, favorites, likes and resume inputs. Current cards retain their canonical ID and source even when an older duplicate wrapper has another ID; saved memberships and missing durable metadata survive. This protects feedback and progress links.
- Home has an explicit committed-controls marker and remains independent of catalog completion. Diagnostics distinguish navigation-origin first contentful paint, Home readiness, preferences, remote/local disk reads, preparation, catalog readiness, first usable shelf, and subsequent artwork. Timings contain no video/channel identities or catalog references.
- Opening YouTube before hydration cannot freeze its selector/preparation trace on the empty shell. First shelf counts reflect mounted cards. Artwork observers release load listeners, detached images, observers and deadlines. Expanded diagnostics span available desktop columns.

## Browser measurements

Saved development profile: 172,070 total entries, 99,999 YouTube, 41,085 Twitch, 12,284 Adults, 35 favorites. Pulls remained paused; entry caps were not changed.

| Sample | First contentful paint | Home controls | All saved catalogs |
| --- | ---: | ---: | ---: |
| Final development desktop reload | 344 ms | 1,197 ms | 8,072 ms |
| Development phone reload | 272 ms | 959 ms | 14,101 ms |
| Production fresh code navigation, empty media profile | 544 ms | 1,603 ms | 1,743 ms |
| Production desktop reload, empty media profile | 124 ms | 202 ms | 310 ms |
| Production phone reload, empty media profile | 100 ms | 196 ms | 327 ms |

Early destination clicks worked while catalog counts were still zero, and the chosen destination survived restoration. In the final early-YouTube desktop sample, the first four mounted cards were usable 4,000 ms after opening the route (6,715 ms from navigation), before the full local catalog finished. First artwork loaded another 652 ms later. The corrected YouTube diagnostic reported 99,999 cached rows and 81 ms selector work. An earlier post-hydration desktop sample reached a shelf in 644 ms. Landing's first usable shelf was also measured separately from Home. Samples include task yielding and other desktop/browser work; they are observations, not guaranteed limits.

Production desktop/phone controls, keyboard activation, navigation drawer, milestone count, responsive diagnostics and Home rendering were exercised. Phone content width was 375 px within a 390 px viewport, with no overflow. Screenshots were inspected; final smoke results show visible content, clean consoles and no production divergence.

## Automated verification and limits

397 targeted tests pass: 360 TypeScript library tests plus 37 relevant store, persistence and media-performance tests. Tests cover concurrent pull/unfollow/favorite/resume/navigation during real-store startup, canonical duplicate wrappers, immutable progress, cancellation before million-row iterator materialization, readiness timing, SSR isolation, listener cleanup and milestone migration. Typecheck and the final build pass.

The synthetic Node preparation benchmark processes actual 100,000/1,000,000-entry reference arrays. The million-entry initiating stack measured 0.157 ms; preparation took 2,401 ms across 9,781 task boundaries. Worst measured work turn was 55 ms: allocation, individual operations and garbage collection can exceed the approximate four-ms work budget.

Production timing uses an empty media profile; the populated browser proof is development. No HTTP-cache disabling, physical-phone cold storage, million-entry browser heap soak or maximum-scroll proof is claimed. Large catalog restoration still takes seconds. Legacy giant blob reads, broad preferences/activity snapshots and full exports remain separate compaction budgets. This is not a completed memory soak or a claim that all startup lag is eliminated.
