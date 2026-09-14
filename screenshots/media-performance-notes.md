# Media performance verification — September 14, 2026

The isolated browser fixture contains 60,000 neutral titles: 20,000 each for Adults, YouTube, and Twitch. Artwork uses an embedded SVG. Measurements cover local section navigation with desktop (1280×800) and mobile (390×844) layouts in Chrome on the test machine; they do not measure provider request or streaming latency.

Latest navigation measurements (milliseconds):

| Layout | Adults | YouTube | Twitch |
| --- | ---: | ---: | ---: |
| Desktop | 413 | 91 | 233 |
| Mobile | 195 | 83 | 258 |

Verified YouTube creator shelves, Twitch sort controls, six pages of grid content, keyboard entry into virtualized rows, source-scoped search, rapid query replacement, repeated Enter, metadata edits, and a blocked search-worker fallback. After six pages (288 titles), nearby mounted grid cards were 36 desktop / 9 mobile. No page errors or horizontal overflow.

Build and typecheck pass. The 11 targeted tests in adult-performance.test.mjs and media-performance.test.mjs pass, including cancellation races, worker backpressure, stale-generation handling, and worker-failure settlement. The full repository test suite was not rerun for this change.

Development and production desktop/mobile render checks have clean consoles and visible content. The final production smoke captured Home before delayed recommendations mounted on desktop, causing a text-length baseline difference; media-built-settled.mjs explicitly waited for those recommendations and confirmed the expected content with no errors or overflow at both sizes. The production search worker correctly indexed 20,000 titles in 157 batches and returned the expected result.
