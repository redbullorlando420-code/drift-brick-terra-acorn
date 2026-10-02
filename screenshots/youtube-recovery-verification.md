# YouTube stalled-growth recovery — October 2, 2026

## Repaired app-side stalls

- Replaced four competing Twitch/YouTube timer effects with one background owner. It picks a due archive/feed/live/Twitch turn rather than repeatedly missing the busy window. Busy/cooldown skips do not reset a lane's schedule.
- Archive recovery gets the first eligible probe after a provider cooldown. Other due lanes retain fair turns once recovery succeeds.
- Visible idle pages can run bounded YouTube archive turns. The previous five-minute inactivity stop prevented recovery after a fifteen-minute provider cooldown. Hidden pages, paused pulls, playback holds, disabled automatic pulls and entry caps remain enforced. Artwork cleanup and speculative/live/feed inactivity behavior are preserved.
- Automatic archive turns admit up to four creators through separate small responses, reduced at slow pacing settings or a lower source cap. Cursor persistence and deduplication remain active.
- Creators with expired rate-limit deadlines become eligible immediately instead of waiting an additional hour. Legacy rate-limit records without deadlines use five minutes; unavailable sources retain their existing one-hour hold.
- The YouTube button prioritizes the actual cooldown label while another provider is busy, and the page explains visible idle archive growth.

## Validation

- Typecheck and production build passed.
- 36 focused script tests, 33 sweep/catalog/live/scheduler tests, and 3 session/artwork tests passed (72 total).
- The real store test checks four separate scheduled creator requests, four new admitted/persisted video entries, and four updated continuation cursors.
- Dev and production desktop/mobile smoke checks passed with no console/page errors, horizontal overflow, branding/auth warnings or production divergence. Populated Chrome desktop/mobile controls verified, with 35 favorites and 674 history entries restored after reload.
- The populated page still reports 67,703 distinct cached YouTube IDs, zero duplicate cached rows and 32,297 available slots below the configured 100,000 cap. No saved sources or videos were removed.

## Live provider limitation

At the October 2 12:20 AM ET recovery attempt, the app received Google's explicit HTTP 429 unusual-traffic result again and recorded a new quiet period ending 12:35:07 AM ET. The final automatic archive recovery attempt at approximately 12:35:22 AM ET checked one source, returned zero entries, and received the same explicit block; the next retry is allowed after 12:50:22 AM ET. A single separate check of the confirmed National Geographic channel's standard public RSS URL returned HTTP 404 from the YouTube RSS Feeds server, with zero entries. No successful live YouTube growth was observed in this verification. The passing tests establish the corrected app path; they do not establish provider recovery.

No CAPTCHA or network-block bypass, identity rotation, or deletion of cached data was attempted. The app remains running with automatic bounded recovery enabled according to existing user settings. No commit, push or deployment was performed.
