# Viewer performance milestone verification — 2026-10-03

Completed: Viewer detail isolation; Viewer detail memory budget. The broader Render invalidation audit remains in progress. Real-provider archive soak and long-idle browser memory verification remain open.

Comments now update only the selected viewer, write one remote record, and leave the browse catalog array unchanged. Closed/switched viewer responses are ignored. Empty successful comment refreshes clear older saved threads. Viewer reuse holds at most 12 records within an estimated 512,000-byte budget, excluding individual records above 128,000 bytes. Preview/player disk reads coalesce; invalidated reads cannot repopulate the reusable cache.

Validation:

- Build and typecheck passed.
- 279 library/type-stripped tests and 21 actual-store pull/entry tests passed (300 total).
- The 100,000-card actual-store test verified no catalog-array replacement or Zustand notifications during comment save/close, including an empty refresh, and no full remote metadata scan.
- The isolated million-entry benchmark measured 20 legacy comment cycles at 3,463.3 ms and 40,000,020 metadata reads, versus 0.94 ms and zero catalog reads/copies for the viewer service. These are synthetic operation measurements, not whole-app speedup claims.
- 5,000 viewer lifecycle cycles retained 11 reusable records / 28,358 estimated bytes, with zero active transcripts, pending reads, or subscriptions. Clear released all reusable records.
- In the populated desktop/mobile browser profile (172,070 catalog entries, 99,999 YouTube entries), a public YouTube preview loaded 40 comment threads; preview-to-player retained them. The mobile preview subsequently restored the threads from disk. Closing the player showed zero active transcripts and pending detail reads in Settings.
- Completed milestones are visible in the delivery archive; the broader audit displays In progress. The user's paused pull state and saved entry limits were preserved.
- Final dev and Vercel production smoke checks passed at desktop 1280×800 and mobile 390×844, with clean consoles, no horizontal overflow, and no baseline divergence. All four screenshots were visually inspected. Interactive desktop/mobile milestone and comment screenshots were also inspected. Temporary viewport override was reset.

The Windows-only production QA host was used because preview:restart depends on Linux /proc. This run did not measure a multi-hour browser/provider soak or prove an overall heap limit for the entire app.
