# Personal desk layouts, anime expectations and Stats alternatives

## Saved layouts (next-160)

YouTube, Twitch and Movies offer **Saved desk layout**. Save captures only grid/list view and supported expanded recommendation/catalog sections. Search, filters, sorting, media selection and player state are excluded. Ordinary route entry reads the selected profile's validated layout. A saved browsing-task restoration has precedence over this entry default. YouTube's deeper catalog requires its recommendation section to be expanded. Movies saves only its supported view; other desk settings remain intact.

Save is explicit. **Reset this desk layout** removes one override and returns that desk to grid/collapsed shelves. **Undo desk layout change** restores the preceding save/reset for that desk, including after reload. Only one recovery operation is retained; changing another desk can replace that undo receipt without replacing its saved layout. Reload reads a concurrent edit without applying it silently to the current screen.

`reelcase.desk-layouts.v1` uses the existing document-bound profile adapter. Future versions, unsupported options and invalid values block writes and leave the desk usable. Byte comparison detects another tab's changed settings. A failed quota write does not publish a new layout or alter the current view. Other layouts, content and personal feedback are preserved. The compact record is read at route entry, not polled or rewritten per render.

## Expected anime releases (next-153)

Expand **Expected anime releases** on Anime. Choose an existing reviewed series, numbering lane and episode, then enter an owner-observed expected time with an explicit UTC offset and an IANA display zone. The source/note remains labelled owner-entered; the app does not claim to verify release-provider announcements. Explicit offsets distinguish repeated daylight-saving hours. Invalid or ambiguous times and invalid zones are rejected. Dates display in the selected zone without rewriting the saved instant.

Save creates one versioned observation per reviewed series/numbering/season/episode. Edit updates the same identity; a changed expectation replaces its reminder rather than creating another. Postponement suppresses the due reminder. Acknowledgment stops repeat due labels, and removal affects only the expectation. The watchlist supports at most 32 observations in `reelcase.anime-releases.v1`, isolated by the existing profile storage adapter. Failed saves keep the current draft and last durable record. Unsupported schemas preserve existing bytes.

The reminder is an opt-in **in-app due label**, checked when this panel opens or **Refresh release reminders** is used. There is no background scheduler, notification permission request or promise of delivery while the page is closed. The checked time is visible. Editing/postponing/removing an entry leaves no old timer to fire later.

An expected date never makes a video available or modifies watch history. Availability requires an exact existing reviewed episode identity in the current eligible public library, with matching numbering and season, an available source and no hidden/unavailable/private boundary. Alternate numbering, unresolved episodes and similarly named files do not establish a match. Matching opens a preview through the existing library action, without autoplay. The closed panel has no catalog subscription; opening performs a cancellable cooperative scan and retains only IDs for the watchlist's reviewed series (bounded by the existing 4,096 episode review limit), rather than another full catalog graph.

## Stats data alternatives (next-158)

Every existing Stats chart has a **Read chart data** action. This includes Adult artwork percentages, Adult interest tags, Adult media types, Booru hosts, provider mix and useful topics. Each opens a labelled modal table with the plotted categories and series. Table rows borrow exactly the chart's aggregate data snapshot, retain series/unit labels, and omit unplotted fields. Missing or non-finite numerical values are marked unavailable. There is no additional statistics calculation or separately selected date range; these charts use the current completed library snapshot and active Stats scope.

Tables expose native table, caption, column-header and row-header roles, work by keyboard, close with Escape, and return focus to their triggering button. Hover and animation are unnecessary. At most twenty table rows mount at once, with Previous/Next controls. The existing chart visibility suspension and disabled chart animations remain in place. A pending Stats calculation continues to show the same last completed snapshot in both the chart and its table, with the existing updating status.

## Verification and limits

`src/lib/personal-desks.test.ts` covers schema bounds, desk-only reset/undo, exact-byte quota/conflict recovery, profile namespaces, explicit daylight-saving offsets, availability versus expected/postponed/acknowledged states, duplicate episode rejection, and chart snapshot/series identity. Existing Stats, anime catalog/review, browse-task, profile and milestone tests run as regressions.

`scripts/personal-desks-browser-check.mjs` exercises real desktop/mobile controls against development and production builds using disposable saved profiles. It verifies independent YouTube/Movies layouts, quota rollback, reload undo, chart/table count equality, keyboard/focus behavior, release edits and persistence, availability from reviewed catalog evidence, invalid time preservation, future schema safety and an empty alternate profile. The existing saved-browse-task browser scenario verifies that restoration still works. Artifacts are under `screenshots/personal-desks-*`.

No real release-feed integration, closed-app notification delivery, physical screen-reader session or real media playback is claimed by these browser fixtures. The semantic accessibility checks and keyboard tests are distinct from testing a particular assistive-technology/browser combination. Settings remain local to this browser origin/profile; they are not a cross-device account service.
