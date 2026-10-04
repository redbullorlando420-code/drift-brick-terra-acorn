# Search dismissal and timer isolation — October 3, 2026

## Changes

- Search suggestions close on an outside pointer, focus leaving the search area, Escape, explicit dismissal, selection, source navigation, viewer opening, or idle/hidden time. Keyboard focus inside the panel remains usable. Returning to an active tab does not cancel the first activation.
- Suggestions and the minute clock are separate memoized header components. Closed suggestions select stable empty catalog/maps, cancel pending work, clear retained results, and unsubscribe from worker status. The header selects a count instead of the full catalog array.
- Source shortcuts remain above asynchronous suggestions, preventing result arrival from moving those actions. Mobile actions have 44 px minimum targets; the panel scrolls within its height limit. Search has one clear control and a Search keyboard hint.
- Explicit searches from Settings and other tool workspaces navigate to a result desk. YouTube, Twitch, folders, and private tag behavior retain their existing scopes. Unavailable media cannot occupy a quick suggestion slot.
- The header clock updates its own component at minute boundaries and stops below its visible breakpoint or during idle/hidden time. Live expiry updates only the live surface, with no root-library timer. It stops while empty, covered by a viewer, idle/hidden, or unmounted. YouTube/Twitch browse pages skip the unused general live selector.
- Mission-plan revision 8 starts Timer consolidation without marking it complete, changing blocked work, or overriding later manual choices. Search and render-audit details reflect the implemented work. Provider/Watch Room timer consolidation and broader render/navigation audits remain open.

## Verification

- Final build and typecheck passed.
- 290 TypeScript library tests and nine media-performance tests passed: 299 total, zero failures. New checks cover unavailable suggestions, tool/provider/private search destinations, and the timer milestone migration.
- Final development and production smoke passed at 1280×800 and 390×844: visible content, no horizontal overflow, no console/page errors, no production divergence. All four final screenshots were visually inspected.
- The populated development profile contains 172,070 entries, including 99,999 YouTube and 41,085 Twitch entries. Outside clicks preserved the exact query and did not open a preview. Escape, keyboard focus exit, internal Tab navigation, the dismissal button, Enter, source shortcuts, navigation, and suggestion-to-preview actions were exercised.
- Mobile Settings → submitted exact-title search opened Home results with one correct match. Mobile YouTube suggestions opened the correct preview and closed cleanly. Client and scroll widths were both 375 px in the 390×844 viewport; the temporary viewport override was reset.
- Mobile Live retained 15 cached YouTube streams awaiting confirmation and did not count stale observations as current live streams. No provider pull was started; saved pause and catalog entry caps were preserved.
- Final production interaction checks exercised Escape and a Settings search ending in a correct zero-result state with a clean console.

## Limits

No whole-app speed multiplier or heap reduction is claimed. A cold catalog index still needs preparation time. Long-idle memory, real-provider archive soak, and the remaining provider/Watch Room timer audit have not been completed.

Evidence: `search-dismissal-desktop.png`, `search-dismissal-mobile.png`, the development/production smoke JSON and screenshots, and the build/type/test logs beside this file.
