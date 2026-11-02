# Adult archive growth follow-up

Date: 2026-11-02. Refines the delivered Adult provider capability and pull-quality milestones (**next-067 / next-068**). Mission revision 83 and its **96/100** completed defaults remain unchanged; this follow-up does not claim the remaining soak/release milestones.

## What limited discovery

The default automatic goal is already 100,000, rather than a universal 10,000-entry ceiling. Saved goals/caps and the shared remote limit can still hold a particular library near 10,000. Provider availability and the size of the returned listing also matter.

Two paging defects were found in the code: all-query tube requests alternated sort orders on successive page numbers, and Eporner's fallback could change both sort and page size at the same position. Those cursors did not consistently describe one archive. Different pages of each listing could be skipped, and an exhausted listing could cause early restarts.

## Delivered behavior

- Requests retain the selected order and fixed provider page size. An unreadable page keeps its retry position rather than silently switching archives.
- Automatic discovery gives Eporner and RedTube separate saved positions for Latest, Most popular, Top rated, Top monthly and Top weekly. Provider recency keeps other sources in rotation. A failed provider's cooldown applies across its sort lanes, including legacy cooldowns; exhausting a listing only pauses that listing.
- Legacy all-query tube cursors revisit page one once under stable paging. Existing catalog entries stay in place and deduplicate; accepted positions then save with the new paging marker. Query-specific and already-stable positions are retained.
- **Adults → Archive growth** shows the automatic goal, Adults retention cap, shared cap, remaining room, per-provider depth, last accepted new/duplicate counts and retry state. It distinguishes records from videos because this catalog can also contain photos and live rooms.
- A visible **Allow up to 100,000 Adults entries** action appears when an older saved goal/cap is lower. It raises only the Adults goal/cap to at least that level, preserving the shared limit, pull pace and automatic-pull preference. Browser quota failure clearly says the change is tab-only and keeps prior saved preferences.
- Continue archive resumes saved depth. Pull catalog deliberately restarts the selected listing; the UI explains the difference. Failed provider work now gives a retry notice rather than a misleading empty-results success message.
- Existing per-request/window/time limits, provider body/cache budgets, pause/idle/playback gates and current cleanup/protection policies remain in force. No new poller or source scraper was added. The collapsed progress panel avoids catalog counting and cursor parsing; weak count snapshots do not retain obsolete catalogs.

## Verification

- `screenshots/adult-growth-tests.txt`: **73** targeted adapter, discovery, automatic-owner, pagination, performance, entry-limit, provider-budget and capability checks pass.
- Actual `runSearchAdultVideos` plus the bounded walker advances beyond **12,000 already-saved identities**, admits **800 distinct new entries** and only four bounded refresh records, and retains an exact continuation. The fixture observes 13 fixed-size provider-page reads; emitted client responses stay at or below 400 rows.
- Unreadable Eporner fixtures fail without a fallback order/page-size change. Planner tests cover provider fairness, independent sort lanes, legacy cooldowns, exhausted listings and one-time cursor migration. The actual automatic-owner test verifies that accepted video depth makes other providers due first, while idle/pause and cancellation gates continue to work.
- `screenshots/adult-growth-mission-profile-tests.txt`: **96** roadmap/profile regression checks pass. This batch therefore has **169** focused automated tests, with no completion-count promotion.
- `screenshots/adult-growth-dev.json` and `adult-growth-production.json`: disposable desktop/mobile profiles start with **10,050** synthetic saved records and a saved 10k goal/cap; quota failure retains prior settings; an explicit successful growth action preserves other settings; the real store appends **600** new records in 400/200 windows, ending at **10,650**. Reload retains records and per-sort positions, and a controlled failed continuation retains the cursor and displays retry guidance.
- Build and typecheck pass. Development and production Home smoke checks render on desktop/mobile with clean consoles, no horizontal overflow and no production baseline divergence. The Adults progress screenshots were visually inspected.

Tests use redacted synthetic metadata and controlled provider responses. They do not assert a particular live provider's total, fetch private accounts, download adult media or mutate the real user library. External providers can still restrict available results. Existing private/profile storage boundaries and unsupported-player restrictions remain unchanged.
