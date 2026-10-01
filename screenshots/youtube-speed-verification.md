# YouTube opening, live checks, and Adult Photos verification

Verified September 30, 2026.

- Preview recommendation/tag aggregation now runs in a short-lived worker; lightweight row packing yields every 250 records and cancels when closed. Player chunks warm before use. Full catalog playlist IDs are memoized.
- Card artwork starts ahead of scrolling, avoids a second browser lazy-loading delay, and pauses queued work while preview/player overlays open.
- YouTube comments open explicitly; comment/chat rows render in batches of 20. Recommendation rotation rests when the session is hidden or idle.
- Live detection parses channel JSON and current live badges, including modern lockupViewModel thumbnails. Scheduled/replayed/unrelated videos are excluded; blocked or malformed responses fail rather than marking channels offline. A real public Lofi Girl streams page returned a live broadcast through the parser.
- Adult recommendation candidates respect the current media filter before ranking. Small photo catalogs retain a shelf even when overview picks consume all candidates; compatible previous worker results remain visible while refreshed results arrive.

Checks: typecheck and production build passed. 60 focused tests passed (58 YouTube/catalog/preview/image/creator tests plus 2 Adult Photos tests). Development and built smoke checks passed on desktop and mobile with no console/page errors or horizontal overflow. The first cold production snapshot preceded deferred Home content; the warm retry matched the development baseline.

Interactive browser: saved catalog had 5,717 YouTube videos. Opened previews, switched to the player, opened comments, checked visible thumbnails, and inspected a 390×844 preview without horizontal overflow. Photos recommendations survived Combined→Photos transitions. The live guide checked both followed creators and reported none currently confirmed live.

Playback limitation: YouTube embeds displayed “Sign in to confirm you’re not a bot” in this browser. The app iframe and controls rendered; actual video playback and external startup latency could not be verified past that provider restriction.

Smoke evidence: youtube-speed-dev.json, youtube-speed-built.json, plus desktop/mobile PNGs alongside this report. Existing unrelated full-suite failures are documented in memory-sidebar-full-tests.txt from the preceding verification.
