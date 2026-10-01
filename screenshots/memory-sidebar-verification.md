Memory and sidebar verification — 2026-09-30

This pass adds decoded-poster release outside the near viewport, artwork suspension while hidden, visible-poster preservation while idle, a 1 MiB resting artwork budget (including late disk/companion results), bounded preview-health records, bounded/deduplicated companion poster mirroring with offline backoff and request deadlines, and search-suggestion allocation only while the search field is active.

The sidebar now supports a remembered desktop icon rail, keyboard/focus tooltips, Ctrl/Cmd+B outside editors, remembered collapsible navigation groups, collapsible source/follow/private lists, bounded source rows, fixed header/footer actions, and a scrolling navigation area. The desktop sidebar unmounts on phones; phone navigation closes its drawer.

Passed: production build and typecheck. The 95 application tests and 39 YouTube regression tests passed. Queue stress covers 6,000 stalled poster requests and a 1,000-request offline burst; preview-health stress covers 10,000 loaded and 10,000 failed observations.

Desktop and 390×844 mobile smoke checks pass on dev and production: visible content, no horizontal overflow, no console/page errors, and a matching final baseline. The first production capture caught the deferred Home module before it painted; a repeat after loading matched dev. All four final screenshots were inspected.

Interactive browser checks used the saved catalog: desktop collapse/reopen, collapse persistence across reload, Ctrl+B, Ctrl+B ignored in search input, group collapse/open, keyboard tooltip, phone drawer open/reopen/navigation, and source navigation. Scrolling a 31-card YouTube discovery page left zero images mounted inside the seven cards beyond the near-viewport margin; returning restored artwork. The phone rendered no hidden desktop sidebar. No browser console errors were observed.

Final real idle check, with no intervening input: 7,308 catalog entries / 5,717 YouTube videos. After five minutes, the artwork cache dropped from 117 entries / 8.0 MiB to 32 entries / 1.0 MiB; 85 entries were evicted. Automatic refresh paused, with zero active decodes, queued artwork/activity saves, temporary media URLs, or poster mirrors. Input resumed automatic refresh immediately. Search rebuilt after worker release and returned 5,341 Linus results. Diagnostics were restored to off and the desktop sidebar to expanded after testing. The earlier hour-long pause was interrupted by page state changes, so it is not counted as a controlled soak.

Full npm test still reports the same nine pre-existing runner/platform/schema failures, including outside the sandbox: TypeScript aliases in script tests, Linux workspace assumptions, Windows executable quoting and symlink privileges, and an auth migration fixture. Application and YouTube tests were run separately. Full log: memory-sidebar-full-tests.txt.

This verifies bounded resources and the idle cutoff. It does not claim an overnight heap soak or a guarantee against every browser/extension memory issue.
