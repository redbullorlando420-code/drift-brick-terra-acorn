# Search, sidebar and YouTube tags — 2026-10-04

Milestone plan revision 17: 178 of 200 complete. `speed-09` (Mobile memory budget) is now verified. Accessibility breadth, physical-device checks and long-session browser heap soak remain open.

## Changes

- Header search is a compact query control. Its popover collapses on Enter, Escape, outside interaction, keyboard focus exit, source change, viewer open and idle release. Ctrl/Cmd+K and slash open it. Closing cancels pending drafts and releases suggestion catalog subscriptions. Active queries remain available to reopen or clear.
- Desktop sidebar retracts to an 80px icon rail. Expansion overlays the desk without changing its width; pinning reserves 256px. Navigation/outside interactions close the automatic sidebar. A single cancellable leave timer protects reentry; keyboard focus holds it open. Escape restores the header control. Ctrl/Cmd+B and the mobile navigation drawer remain available. Sidebar state subscribes independently of the catalog.
- YouTube content tags use titles, substantive descriptions, hashtags, known phrases and chapter labels. Description evidence also connects canonical topics. Promotional lines, URLs and catalog placeholders are excluded. Text is capped at a 500-character title and 8,000-character description; token work, tags and the 512-card inference cache are bounded. The existing 32-tag catalog limit remains. Provider-authored keywords can be replaced; manual, unknown legacy tags and locked fields are protected.
- New pulls and cached recovery use the same inference. Sparse tag/provenance rows save through the idle queue. Durable repair versions survive older snapshots. Active search, viewers, input and hidden pages hold optional repair. Settings includes **Improve YouTube tags** alongside queue pause/resume.

## Verification

- 398 TypeScript library tests and 42 relevant store/persistence/performance tests passed (440 total).
- Typecheck and production build passed.
- Development and production browser smoke passed on desktop (1280×800) and phone (390×844), with visible content, no uncaught errors, no overflow, no branding/auth warnings and no baseline divergence. Both sets of screenshots visually inspected.
- Populated Chrome profile: 172,070 total entries, including 99,999 YouTube entries; pulls remained paused. Desktop Enter/Escape/forward and backward Tab/outside dismissal, Ctrl+K, sidebar pin/unpin, navigation retraction, Ctrl+B and sidebar Escape exercised. Pinning reserves 256px; automatic expansion leaves the main desk at x=80.
- Phone Low memory: YouTube search returned 426 results. Initial grid loaded 24, with a 36-card mount ceiling. Paging loaded 48 and mounted 12. Preview opened; a temporary four-star rating toggled on and back off. Closing preserved the 48-title page and restored focus to the opened card. No horizontal overflow. Search editor was bounded inside the phone viewport; menu navigation and Escape dismissed their respective panels. Adaptive preference restored afterward.
- A cached IGN trailer displayed additional title/description tags, including Minecraft, dungeons, launch, Nintendo, Xbox, PlayStation, Windows and Steam. Tests independently cover content chapter phrases, Unicode hashtags, meaningful description topic evidence, promotional exclusions, saturated old provider rows, manual locks, storage version recovery, cancellation and idempotence.
- Production interactive checks exercised pinned navigation, search submission/empty results, keyboard dismissal and phone drawer return; console errors absent.
- Saved-library reload and repair status checked after the final source build. Completed text-tag versions skip repeat writes; regression tests also verify equal-timestamp recovery and preservation of a newer repair version.
- 384 MiB Node benchmark passed for 100,000 and 1,000,000 synthetic entries. At one million, unchanged restore shared the original array, grid maximum was 35 and heap after restore was 258.2 MiB. This fixture omits artwork, browser/IndexedDB overhead and transcripts; capability hints do not emulate CPU speed or establish physical-device/browser soak.

## Artifacts and limits

Smoke verdicts: `search-sidebar-tags-dev.json` and `search-sidebar-tags-production.json`. Test/build/type logs and the constrained-memory benchmark are saved alongside this note. The populated desktop proof and phone preview are local screenshots.

Automatic inference uses available cached descriptions; missing or abbreviated provider descriptions limit the evidence. Existing manual/unknown legacy tags may occupy the tag cap. One successful browser session does not establish hours-long memory stability. Current requests did not exercise a new live provider pull; pull integration was checked through the real store with mocked provider/disk boundaries.

Earlier render-audit changes in this working tree were preserved. Only generated Vercel output is cleaned after production QA; the development server remains running.
