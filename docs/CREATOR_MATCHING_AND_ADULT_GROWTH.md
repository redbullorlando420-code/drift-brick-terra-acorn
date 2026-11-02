# Creator matching and Adult archive growth

## Creator imports

YouTube imports keep whole display names. **Match next 50 held names** checks a bounded group of names for unique exact public channel identities. The search filter narrows that group; excluded, failed and already verified entries are not silently selected. Ambiguous names retain an actionable failure and need a channel URL or @handle. Existing explicit retries still work.

The matching action uses a new identity-only path. YouTube requests only channel resolution; Twitch requests user metadata without VOD or clip walks. Four YouTube names or twenty Twitch logins can share a small client job. It respects pause, cancellation and provider cooldowns. Matching works with full or disabled media caps because it neither admits media nor runs cleanup. A proven existing YouTube identity retains its source ID, archive cursor and video references when a legacy hold is cleared.

Twitch CSV imports recognize login/username columns rather than importing headings, display names and numeric IDs as creators. A numeric verified Twitch user ID remains resolved when only its archive request fails. Renamed/recycled accounts still use the existing continuity review.

These actions preserve the profile's existing import session, choices and failure reasons across reload. Opening an importer does not launch lookups for its 10,000-name draft.

## Adult growth

| Setting | Previous default | New default |
| --- | ---: | ---: |
| Candidates per pull | 2,000 | 10,000 |
| Maximum configurable batch | 10,000 | 50,000 |
| Automatic interval | 120 seconds | 60 seconds |
| Automatic archive goal | 100,000 mixed entries | 250,000 archived videos |
| Adult retention cap | 100,000 | 300,000 |
| Shared remote retention cap | 200,000 | 500,000 |

Existing saved custom settings remain intact. **Adults → Archive growth → Use larger archive growth** upgrades a saved smaller configuration and reserves shared headroom for other providers. Explicit zero caps, automatic-pull selection and paused state remain unchanged. Settings retains individual controls.

The pull still requests at most 400 entries per response and commits accepted windows before advancing. Duplicate-heavy windows allow up to 12 automatic or 40 manual requests, with 90-second automatic and five-minute manual whole-pull budgets. These are bounded attempts, not guaranteed yields. Provider hard limits, availability, public catalog coverage, retry waits and shared admission/protected-entry cleanup still apply. Automatic discovery remains active-page work and stops at its real archived-video goal.

Archive progress now separates archived videos, photos, live room cards and unclassified entries. Offline room descriptors remain rooms. All classes consume retention slots; photos and rooms do not fill the video goal. Reclassifying an existing card changes its class count without recording a new catalog addition. Manual tag locks remain authoritative.

Counts are weakly cached by immutable catalog snapshot. The retention-count pass also prepares media-class counts; accepted Adult replacements update those four counters incrementally. Restored or cleanup snapshots are recounted in yielded slices. No interval traverses an unchanged catalog to update the panel.

A checkpoint now returns its accepted in-session continuation even when the localStorage mirror fails. This fixes the previous repeated-page assertion. Reload after quota failure can still replay an older saved cursor safely; a crash-atomic IndexedDB cursor repository remains **next-112**, planned.

## Milestones and verification

**next-111 — Video archive growth accounting** is complete at revision 87. Defaults are **303/406 complete**, including **101/200 next-level** and **5/100 new-batch** milestones. Only next-111 promotes at this revision; previous manual reopens and custom instructions are preserved.

Verification uses synthetic provider metadata and disposable browser profiles, preserving the real library and cookies. Evidence is under `screenshots/creator-growth-*`: focused media/import/count tests, provider resolver tests, store regressions, mission migration/export tests, desktop/mobile dev and production workflow checks, Home render comparisons and sidebar page audits. Real provider availability and long-running upstream soak tests are not claimed by these fixtures.

Build/typecheck pass. The focused suite passes 55 checks, the mission suites 97, and the broader non-scale store regression run 91. The final changed-path store recheck passes all nine matching Adult/identity cases. Both sidebar audits have 66 reports with no failures; production Home matches development without console errors or overflow. A Windows lock on generated build output during an intermediate rebuild cleared after stopping the owned QA server; the subsequent final build and browser checks pass.
