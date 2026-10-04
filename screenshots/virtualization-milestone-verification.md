# Long-list virtualization proof

Verified October 4, 2026. Plan revision 13 completes `smooth-02`. Development and compiled production both show **173 of 200 milestones complete**, with 27 remaining. Existing unrelated work and later manual milestone choices are retained.

## Changes

- Rails now slice only their mounted window. Previously, an End jump or repeated expansion first copied the entire loaded prefix, then discarded everything outside the visible window. A million-entry End jump now reads only the visible references.
- Actual rendered card width and gap drive the rail stride, including responsive poster-width changes. Horizontal window restoration survives collapse and expansion.
- Virtual grids now provide keyboard entry into offscreen windows, with direction-aware boundaries for Tab and reverse Tab. Arrow/Home/End follow the measured column count. Modified shortcuts retain browser behavior.
- Rail and grid list items expose their actual positions and the full catalog count to accessibility APIs. Spacer rows remain hidden from them.
- Closing a preview restores the visible title anchor and keyboard focus for an unchanged grid. Restoration uses one mounted item and indexed lookup; it skips changed catalogs or navigation rather than scanning the library.
- Live-card Save/Like controls wrap within narrow cards. This fixed a real phone overflow from 415px of content at a 390px viewport to 375px of content.

## Verification

**351 library tests and 42 integration tests passed: 393 total.** Covered cases include guarded million-entry rail reads, shrinking inventories, boundary direction and empty windows, responsive grid keyboard targets, row geometry, bounded recent measurements, mission migration, metadata persistence, media work and YouTube coverage. Full repository `npm test` was not rerun; this result covers the named relevant suites.

Final typecheck, production build and diff checks passed. Development and compiled-production smoke checks covered desktop 1280×800 and phone 390×844, with visible content, clean console/page errors, no horizontal overflow, no branding/auth warnings, and no production divergence. All four smoke screenshots were visually inspected. The compiled milestone module also loaded interactively and showed the correct status and phone layout.

The populated development profile had 172,070 entries, including 99,999 YouTube records. Its full public YouTube grid exposed 99,994 eligible titles. Desktop paging reached 192 loaded titles while retaining a bounded window; observed grid mounts peaked at 63, below the 108-card cap. Phone windows contained 12–18 cards during the checked positions. Desktop and phone rail End/Home reached indices 47/0 using six/four mounted rail cards. Grid End, Home and phone ArrowUp retained valid focus. Keyboard entry reached an offscreen grid, and reverse entry reached the final loaded title.

After the preview finished opening, the stable covered title's top and scroll position matched its return position (321.90625px and 4885px); focus returned to index 47. Locator actions can scroll before opening, so this comparison uses the settled covered grid. Collapsing and expanding a rail restored indices 42–47, with horizontal position differing by 16px, within one gap. Pulls remained paused; source limits and saved shelves were retained. Preview checks naturally recorded watch activity.

## Scale measurements and limits

The synthetic Node benchmark performed 10,000 window/geometry visits on real 100,000 and 1,000,000-entry reference arrays. Both runs resolved at most eight rail references and 45 grid cards per visit and retained only 512 recent row measurements. The million-entry run's median was 0.039ms, p95 0.073ms, and worst observed task 1.232ms. These are algorithm timings, not browser input or scroll latency.

This does not establish a full million-entry browser catalog, physical-device memory stability, or scrolling beyond browser maximum pixel dimensions. Long-running memory soak, cold startup, broad persistence snapshots, and further render invalidation remain separate milestones. The production interactive check used an empty profile; the populated card checks ran in development.

Artifacts: [benchmark](./virtualization-benchmark.json), [library tests](./virtualization-library-tests.txt), [integration tests](./virtualization-media-tests.txt), [typecheck](./virtualization-typecheck.txt), [build](./virtualization-build.txt), [development verdict](./virtualization-dev.json), [production verdict](./virtualization-production.json), [completed milestone](./virtualization-milestone-desktop.png), [desktop rail](./virtualization-rail-desktop.png), [desktop grid](./virtualization-grid-desktop.png), [phone rail](./virtualization-rail-mobile.png), [phone grid](./virtualization-grid-mobile.png).
