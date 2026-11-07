# Recommendation continuity — revision 100

Delivered 2026-11-06: `next-132` feedback undo timeline, `next-133` followed-creator cold-start tuning, and `next-139` cross-session repeat suppression. The default plan is now **335/409 complete**, including **130/200 next-level** and **34/100 second-batch** milestones. Earlier manual reopens and custom notes remain preserved.

## Feedback undo history

AI guide now includes a collapsed **Feedback undo history** panel. New title star ratings, creator ratings/likes/favorites, tag hearts and recommendation rejection edits enter a versioned forty-operation timeline. Eight rows mount per page. Each row shows its previous/next value, time and whether it has been undone or superseded. Edits before this feature remain intact without invented history.

Undo operates on a selected target and refuses an older edit when a newer operation changed that target, even if the value returned to the same number. An unrelated newer manual rating is retained when undoing a rejection. The durable IndexedDB transaction compares the current manual-state fingerprint against both storage mirrors and the active document before writing. The UI publishes only after commit. Quota failure leaves the preceding active and saved feedback unchanged. Another tab's changed feedback stops undo with a reload instruction. Undo does not silently reset global preferences.

The timeline lives inside the existing profile-bound feedback payload and durable mirror. Automatic watch seconds, exposure and notes are not history operations. Notes and tag-heart history participate in conflict checks; automatic watch counters merge by maxima, never sums, so undo cannot duplicate or discard newer observations. Undoing a newly created tag heart removes only that edit's historical-heart contribution; an older preexisting contribution remains. Rating undo updates its current rating ledger without rewriting historical achievements.

Existing feedback exports retain version 5 and their rating/rejection content. Legacy ZIP now also emits the canonical rejection section used by reviewed restore; older nested-only rejection backups are normalized during preflight, while an explicit canonical section retains precedence. Invalid/future ledgers fail inspection. Reviewed restores discard prior local undo history before activation. The local undo timeline is intentionally excluded; importing feedback begins a new timeline rather than offering inverses against a foreign library snapshot. History failure does not reset ratings. Unsupported history is retained and shown as unavailable for undo. Existing legacy rating, creator-heart, notification and coalesced persistence paths remain active.

## Followed-creator exploration

The collapsed **New creators and repeat cooldown** panel saves zero, one or two exploration slots for the twelve-card Guide mix. Default: one. Only an active confirmed YouTube channel ID or numeric Twitch user ID qualifies. Unresolved/review-needed follows and display-name matches do not qualify.

Cold start means a followed creator has no eligible recorded watch or explicit title/creator feedback in this profile. Existing follows with no such evidence can also qualify; the app does not invent a follow date. A first relevant rating, like, favorite, recorded watch or rejection retires that creator from exploration. A recorded watch is not a completion claim. Unfollow removes eligibility without removing saved watched media.

Candidates must be public, available recordings with supported publication evidence within thirty days. Unknown, relative, coarse and future publication dates do not supply freshness. Rejected or exposure-reduced candidates cannot take an exploration slot. One candidate per creator is retained in a bounded sixty-four-creator pool, using at most 4,096 confirmed follow rows. Sampling is disclosed. No network discovery is triggered.

Exploration reserves at most the configured number of slots and retains established candidates. It honors current source/length choices, balanced-source replacements and existing creator/source/age diversity constraints. Protected favorites/likes/high-rated titles are retained. If compatible space cannot be found, fewer slots are filled. The Guide labels each actual exploration slot as discovery and states the confirmed-ID, freshness and feedback evidence. Explicit title/topic queries retain their field-matching behavior and do not receive forced exploration slots.

## Cross-session repeat cooldown

Guide mixes can temporarily omit an unsaved title after at least two meaningful recommendation exposures. The cooldown is off, six, twenty-four or seventy-two hours after the latest saved exposure; default: twenty-four. Existing exposure bounds and expiry still apply. Favorites, likes, creator favorites and four/five-star titles bypass this omission. It is a ranking workflow choice, not a hidden/unavailable flag or negative taste signal.

**Show cooled-down picks** is a temporary Guide view containing only otherwise-eligible cooled-down recordings. It records no new recommendation exposures. Return to regular picks restores normal selection. Explicit Guide title/topic searches can always rediscover a cooled-down item. The summary states the current window, omitted count and actual exploration usage.

The existing local profile exposure ledger survives reload and is read by a newly opened tab. Compact profile-normalized storage events adopt newer saved exposure snapshots without polling or automatically moving the current cards. An explicit new mix applies them. Reset recent exposure in another tab propagates without erasing ratings, rejections or watch progress. There is no distributed per-impression counter: simultaneous tabs may coalesce observations conservatively, and unsaved/failed receipts are labeled session-only by the existing controls.

Tuning uses the existing reviewed profile document adapter under `reelcase.recommendation-tuning.v1`; conflict, quota and future-format errors preserve saved settings. Only explicit Save writes the small tuning document. Reload recovers a changed document. Tuning is a local tool document outside legacy library pack restore. Existing exposure and feedback pack content retain their current behavior. Other recommendation shelves keep their existing exposure scoring; this hard cooldown and exploration reservation apply to Guide mixes.

## Verification and limits

Build and typecheck passed, with **197 focused tests** covering the new policies, undo model, existing Guide ranking/diversity/evidence, exposure, feedback subscriptions, presets and milestone migrations. Desktop/mobile browser fixtures exercised cold-start reasons, protected repeats, explicit queries, temporary review, tuning persistence, durable undo, quota rejection/retry, actual Guide rejection edits, cross-document conflict refusal, separate local profiles and second-tab cooldown/reset behavior.

The rejection/legacy ZIP/reviewed restore regression also passed on desktop/mobile in development and production, including ratings/watch-time retention, canonical rejection sections and paged choice review. Existing Guide diversity/provenance checks passed in development. Full navigation audits passed 66 page reports per build; Home had no brand/auth/overflow/console problems or production baseline divergence.

Development and production browser checks use disposable catalogs, storage and profiles. No actual provider playback, external data collection, paid API, physical-phone certification or long memory soak is claimed. Evidence is in `screenshots/recommendation-continuity-*`; the milestone ledger records final build/browser outcomes. Existing user library and profiles were not replaced by test fixtures.
