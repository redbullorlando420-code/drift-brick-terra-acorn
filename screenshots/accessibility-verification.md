# Keyboard browsing milestone — 2026-10-04

Completed `smooth-11` (Accessibility performance audit). Mission revision 18 promotes this newly verified milestone once, preserves later manual choices, and leaves memory/provider/device soak work open. Both the saved development profile and fresh production UI show **179/200 complete**, with 21 remaining.

## Changes verified

- A single Radix modal lifetime covers lazy opening, preview and playback. It has an accessible title, explicit modal semantics, background control exclusion and scroll locking.
- Loading has a focused Cancel action, including the preview-to-player handoff. Ready controls take focus without waiting for provider artwork.
- Tab wraps inside the viewer. Escape closes the top nested menu first. Closing returns to the original card without changing search order or the number of loaded titles; source navigation can use the library focus target instead.
- Deferred shelves mount immediately on keyboard focus. Their single delayed unmount checks current focus and rejects canceled callbacks, including callbacks already queued for execution.
- Grid paging announces the available count politely. Keyboard instructions explain Arrow, Home/End and Enter behavior. Card actions remain available while artwork says Loading preview.
- Player shortcut handling yields to buttons, inputs, sliders, menus, modifiers and already-handled events. Provider embeds retain their playback keys. Local control chrome holds during keyboard focus or an open menu; hidden chrome is inert.

## Saved Chrome profile

The profile contains **100,000 distinct YouTube IDs with zero duplicate cached rows**, plus tens of thousands of other media entries. Background pulls continued to change source totals during verification; no fixed whole-catalog total or browser heap measurement is claimed.

- YouTube Minecraft search returned 426 results.
- Desktop grid End focused index 35 with 21 mounted cards; Home returned to index 0. The standard cap remains 108. Normal paging at the bottom expanded the loaded page from 36 to 72 before opening the viewer; it then stayed at 72 through preview/player and return.
- Desktop preview loading focused Cancel; ready preview focused Browse. Shift+Tab wrapped to a recommendation inside the viewer. Covered grid buttons were under `aria-hidden`. Escape returned to the opened video at index 35.
- Space on Watch now opened the official YouTube player. Space opened its metadata menu; Escape closed the menu while retaining the player and focused trigger. Space on Back to library closed the player and restored the original card at index 0. No metadata or reaction edits were saved during these checks.
- An offscreen Favorite YouTube shelf initially mounted no cards. Keyboard entry through its header mounted seven cards and focused index 0. End focused index 13 while retaining a seven-card window. Closing its preview restored index 13 and its original video ID.
- At 390×844, the offscreen result grid started with no mounted cards. Keyboard entry mounted 12 and focused the next title. Preview loading and player loading both kept focus inside the modal on Cancel. Ready player focused Back to library, rendered YouTube's own controls, and retained eight covered grid cards with 36 loaded titles. Closing restored the original card at index 0 and all 36 loaded titles.
- Phone width remained within the viewport during preview/player and after return (390px with modal scroll locking; 375px client width with the normal scrollbar). No overflow or captured console error/warning occurred in this phone session.
- Saved development profile was left on Home with no open viewer or query. Pulls were active, matching the observed starting state after the fresh session restored.

## Build and production gates

- `npm run typecheck`: passed.
- `npm run build`: passed.
- 402 TypeScript library tests and 42 relevant store/integration tests: **444 passed**. New cases cover native keyboard ownership, focus return during handoff/navigation/virtualization, stale shelf release cancellation and milestone migration.
- Development and built Vercel output smoke checks passed at 1280×800 and 390×844. Content is visible, no horizontal overflow, no console/page errors, and no branding/auth warnings. Final production baseline comparison does not diverge.
- Desktop and phone screenshots were visually inspected for both builds.
- Fresh production interactions: search draft canceled with Escape and restored the compact trigger; phone navigation closed its drawer and opened Mission plan showing 179/200. No captured console errors or warnings.

## Limits

- Chrome extension file access blocked importing the four bundled local clips. No extension permission was changed.
- A saved local preview resolved a blob URL and reached media readyState 4. Subsequent input commands timed out, so native local player interactions are not recorded as passed. The delayed test tab was closed; a fresh saved-profile phone session successfully completed YouTube interactions afterward.
- Clicking YouTube's fullscreen control did not establish a top-document fullscreen element in automation. Official provider controls and their separate layout were observed; fullscreen entry is not claimed as verified.
- These checks do not constitute a physical screen-reader/device test, a long-session memory soak, or a measured browser heap improvement.

Proof screenshots: `accessibility-phone-player.png`, `accessibility-desktop-player.png`, `accessibility-dev.png`, `accessibility-dev-mobile.png`, `accessibility-production.png`, `accessibility-production-mobile.png`.
