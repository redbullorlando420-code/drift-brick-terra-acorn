# YouTube archive recovery — October 2, 2026

The saved browser library grew from **67,873 to 75,710 distinct YouTube IDs** during this verification (**7,837 more**). The final duplicate check reports **zero duplicate cached rows**. The final counts, 2,872 saved YouTube sources, and 1,500ms request pacing survived a full browser reload.

## Repair

- Corrected uploads-playlist browse IDs from `UU…` to `VLUU…`. Confirmed creators and playlists now use public WEB browse metadata directly, without requiring a channel HTML page or an HTML-extracted API key.
- Recognized current playlist item sections containing `lockupViewModel` rows and `continuationItemViewModel` commands. Channel Home recommendations cannot supply an archive boundary.
- Resume directly from the saved continuation. Finish provider pages; retain accepted rows and the unconsumed token on failures. Recover expired 400/404 tokens once. Retain cached publication dates, views, duration, and fetched comments when compact responses omit them.
- Distinguish an HTML challenge from a catalog/RSS rejection. A challenged webpage holds further HTML reads, including streams, while independently healthy JSON catalogs and RSS feeds remain available. A confirmed network rejection on JSON/RSS still holds all requests. Manual force continues to ignore only previously known cooldowns; new endpoint rejections remain enforced.
- Keep routine checks RSS-only and rotate them across confirmed creator IDs. Failed feeds consume a durable turn and cannot launch another HTML scan. Bounded recent-feed and archive turns remain eligible on visible idle pages, respecting pause, playback, visibility and entry caps.
- Kept the 100,000 YouTube entry limit and the existing 100-source / 200-video target. Changed this browser's YouTube request gap from 80ms to 1,500ms for slower recovery; the setting remains editable and manual pulls remain available.

## Real provider and browser evidence

- The corrected National Geographic uploads request returned HTTP 200 and 100 public video IDs. A real `runRefreshRemotes` diagnostic then returned **200 distinct videos in two resumable turns** using one RSS request and two browse requests, all HTTP 200. No channel HTML request was needed. See `youtube-restored-live.txt`.
- Initial browser retry added **199 new entries** before another catalog rate limit. With 1,500ms pacing, a later real saved-source sweep showed **66 / 100 targets, 2,798 returned, 2,732 new, zero failed so far**. These are live provider results, not fixture counts.
- Later scheduled checks succeeded on four creators and added two, then three recent uploads. Final saved count after reload: **75,710**, zero duplicates, **24,290 remaining slots**. Some unavailable or unresolved creators still require a valid public catalog/link; provider rate limits remain possible.
- `youtube-restored-desktop.png` and `youtube-restored-mobile.png` show the final saved library. Both have no horizontal overflow; the browser error log is empty. Temporary viewport overrides were reset.

## Verification

- **68** remote/store/transport/background/ranking script tests passed.
- **52** catalog/sweep/page/playlist/merge/entry-cap/pull-control tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- Dev and production desktop/mobile smoke checks passed: visible content, no console or page errors, no overflow or brand warnings, production does not diverge from dev.
- Generated build artifacts were restored/cleaned after verification. The development server remains running. No commit, push or deployment was performed.

The 70,000-existing / 3,000-new fixture and 3,000-entry pagination fixture validate bounded commits, cursors, deduplication and entry limits; they are not live throughput measurements.

## Primary implementation reference

[YouTube.js playlist browse construction](https://github.com/LuanRT/YouTube.js/blob/main/src/Innertube.ts#L383) adds the `VL` prefix. Its [WEB client constants](https://github.com/LuanRT/YouTube.js/blob/main/src/utils/Constants.ts#L32) provide the current public metadata client version. Live diagnostics verified the request independently; no cookies, proxy, identity rotation or challenge solving was used.
