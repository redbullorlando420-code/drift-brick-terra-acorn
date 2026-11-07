# Desk taste and novelty

Open **Tune … desk picks** in YouTube, Twitch, Movies or AI guide. The closed control does not subscribe to the catalog or prepare recommendations. Opening it borrows the current catalog; **Preview desk mix** cooperatively samples at most 240 eligible public recordings in saved catalog order and compares two twelve-card rankings with the same seed and clock. Only current comparisons can be applied. Changing controls, feedback, library observations or opening a viewer invalidates the comparison. Closing the control releases its preview and pending work.

**Use for this session** changes an in-memory desk override. **Save desk overlay** explicitly writes one small profile-local settings record. Reload clears temporary overrides. Reset removes only that desk's overlay and temporary override; it leaves shared Guide weights, ratings, notes, history, feedback and other desks untouched. A comparison is required before applying or saving, including on an empty sample. Empty comparisons do not invent recommendations.

Precedence is temporary desk mix, saved desk overlay, then shared Guide preset. The active origin and numerical weights are visible. Guide's existing temporary source/length/familiarity controls still constrain its full-library picks and questions. Choosing YouTube or Twitch in the Guide source mix selects that desk's overlay. All public sources, balanced and local mixes use the Guide overlay. Movies uses the existing confirmed-film catalog in its preview; it does not reclassify videos as films. Existing provider shelves retain their established ranking. Adults is outside this feature.

## Novelty evidence

The default is neutral (zero), which leaves existing scores unchanged. Five integer choices range from familiar (-2) to new (+2). The additional score is `level / 2 * (1 - 2 * familiarity)`, bounded to one point either way. It cannot admit a recording rejected by visibility, source, length or query relevance filters, and existing source balance and explicit feedback penalties remain in place.

Evidence comes only from eligible public catalog observations. Actual stored recommendation exposure supplies a familiarity fraction `min(count / 3, 1)` for that title. Otherwise a YouTube/Twitch creator present in recorded history supplies 1; an absent creator supplies 0 only when there is some eligible creator history and the compact creator evidence is complete. Provider-scoped channel IDs (or saved channel names as a fallback) prevent cross-provider name collisions. Unknown creators and local videos without observed exposure remain neutral. No-history/no-exposure samples display a labelled neutral default. An exposure means shown; a history entry means recorded activity. Neither proves a completed watch.

Creator evidence retains at most 4,096 compact keys and exposure uses the existing 2,048-entry, 30-day ledger. Exceeding the creator cap leaves unseen creators unknown. Query-only history membership uses at most 8,192 IDs and marks incomplete evidence rather than inferring absence. Full Guide preparation reuses its existing history membership map. Ranking still keeps bounded source pools and twelve results; no provider requests, polling or per-input storage writes are added.

## Persistence and recovery

`reelcase.desk-taste.v1` uses the existing profile storage adapter. It contains only known desk IDs, integer weights and a novelty level, with an 8 KiB maximum. Future versions, unknown fields/desks and invalid ranges block persistent writes without replacing stored bytes. Save checks for another tab's changed bytes before writing. Quota failures keep both prior disk bytes and active settings. Reload preferences reads the latest record; it does not silently overwrite it. Temporary controls remain usable when storage cannot save. These settings are local to the selected saved profile on this computer.

## Verification

`src/lib/desk-taste.test.ts` exercises precedence, reset, strict schemas, conflict/quota rollback and profile namespaces. `scripts/desk-taste.test.mjs` uses fixed seed 42 and clock 1793653200000: dense creator history moves mean familiarity from 1 to 0, sparse history remains unknown, neutral exactly matches existing ranking, source diversity and query relevance remain intact, strong favorites survive, private evidence is excluded, and preview/cancellation/caps are enforced.

`scripts/desk-taste-browser-check.mjs` exercises actual controls in disposable desktop/mobile profiles against development and production builds. Fixtures avoid real provider playback and do not modify the user's library. Browser results and screenshots are under `screenshots/desk-taste-*`. A physical phone and long-running live-provider soak are outside this check.
