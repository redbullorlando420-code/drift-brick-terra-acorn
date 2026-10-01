# Home, saved library, creator controls, and performance verification

## Changes
- Home is a small navigation surface. Startup and reload use Home; the previous discovery experience is available as Landing page. Home mounts no media, artwork, or recommendation rails, and does not prefetch the large hub module.
- Sidebar counters use a disposable worker with acknowledgement backpressure. Packets contain at most 512 pairs of numeric flags and history multiplicity. Main-thread projection yields after 4 ms; worker failures use the same cooperative fallback. Workers terminate on completion, hidden tabs, dependency changes, and unmount.
- Creator controls show 100 creators initially and add 100 per request. Icons are 64 px (selected creator 80 px); the grid uses 64 px columns and 12 px gaps. Images decode asynchronously at low fetch priority.
- Favorites includes hearts and likes, with All saved / Hearts / Likes filters, saved creators, saved public topics, photo and private-save links, and a visible notice for unresolved or hidden saved IDs.
- Heart/like actions write the small durable shelf immediately instead of rewriting large preference metadata. Recovery selects the newest timestamped shelf, including intentional empty shelves/removals. Legacy untimestamped snapshots merge; concurrent in-session changes take precedence over delayed hydration.
- Provider iframes own playback and fullscreen controls. App controls and comments are placed outside the iframe rather than over the video. Local and direct adult-media playback retain native custom controls. App shortcuts no longer intercept provider playback keys.
- Removed Most useful tags and Source mapping & storage. Provider mix and Most useful topics are 672 px tall. Topics show up to 20 rows based on ratings, hearts, likes, and pinned topics; unrated titles do not dilute ratings.

## Verification
- Build passed; typecheck passed.
- All 170 TypeScript tests passed, including saved-shelf removal/empty recovery, public/private saved-item separation, and a million-row packet aggregation test.
- Full script suite: 216 passed, 7 existing failures (Windows symlink permissions, wrapper paths with spaces, legacy smoke-source assertion, migration-layout assertion). These are the same failures observed before this change.
- Dev and production smoke passed on desktop 1280×800 and mobile 390×844: visible Home content, no horizontal overflow, no console or page errors, no branding/auth warnings. Final production verdict does not diverge from the dev baseline.
- Real saved profile: 129,329 indexed entries, including 60,206 YouTube entries. Reloading from Landing page returned Home, with zero media elements in Home's main content. Full Landing recommendations still loaded.
- Real Favorites: 35 public saved titles, from 30 hearts and 33 likes; 5 private saved titles, 4 saved creator follows, 1 saved public topic, and 4 unresolved/hidden saved IDs. All three filters exercised. Adding and removing a test heart, then reloading, retained the original 30-heart / 33-like / 35-public-title totals.
- Creator paging expanded from 100 to 200 on desktop. Mobile creator search and detail panel exercised. Final icon rectangles are 64×64 with 12 px gaps, no overlap, and no horizontal overflow.
- Real Stats rendered 17 feedback-supported topic bars and 10 provider bars; both charts measured 672 px. Removed headings are absent.
- YouTube preview and full player exercised on desktop and mobile. Playback rendered with app controls outside the iframe; mobile has no horizontal overflow. Native provider fullscreen was exercised, but the automation did not confirm an OS fullscreen transition; no claim of that transition is made.

## Limits
The million-entry check covers the bounded counting pipeline, not a full million-entry browser library or an overnight memory soak. The real-profile browser checks used the existing 129,329-entry library. Saved IDs without source metadata are preserved and reported; they are not fabricated into playable cards.
