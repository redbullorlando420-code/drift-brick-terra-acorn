# Mixed creator shelf and creator controls

Verified September 30, 2026.

- The mixed creator shelf shows its loaded-title count and explicit Previous/Next controls. Navigation moves by nearly one viewport, and horizontal virtualization brings the later cards into view. The saved 5,898-video catalog showed eight titles in the opening window with more available on the shelf.
- The selected creator panel uses a responsive minimum/maximum width with a flexible creator list. Creator avatars use a fixed auto-fill grid so a narrow selected panel cannot force a ten-column overflow.
- Creator details show the latest saved upload date. Creator videos can be filtered to Unwatched or Favorites, sorted by Most views, and include view counts alongside date/runtime.

Interactive verification: the mixed shelf advanced to later videos (measured horizontal scroll offset 709 px). Linus Tech Tips details loaded 5,431 saved videos; Unwatched and Most views controls were exercised. At 1,024 px viewport width the creator list and details panel each measured 351–352 px, without document overflow.

Checks: typecheck, production build, eight focused YouTube mix/virtual-rail/creator-collection tests, and development plus built desktop/mobile smoke checks passed. No browser console/page errors or horizontal overflow. The first cold production snapshot arrived before deferred Home content; the warm retry matched development. Evidence is in creator-panel-dev.json and creator-panel-built.json with the paired viewport screenshots.
