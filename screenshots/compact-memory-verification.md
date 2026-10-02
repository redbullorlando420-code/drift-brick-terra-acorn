# Compact memory and disk cache — 2026-10-01

## Changes
- Search postings now retain numeric document ordinals, with singleton values for rare terms and growing Uint32Array buffers for common terms. Video ID strings are kept once in the worker dictionary.
- Removed eager main-thread index construction from metadata edits and repairs. The worker-unavailable fallback scans in yielding batches without keeping another full inverted index.
- Clearing search releases the worker. Hidden/idle cleanup also clears search results and derived selector caches; inactive selectors evict obsolete catalog generations after catalog/metadata changes.
- Local frame capture uses asynchronous native JPEG Blob encoding instead of synchronous base64 serialization. IndexedDB stores the compressed binary image; cards use owned blob URLs.
- Startup warms 32 disk thumbnails. Visible cards reopen individual disk thumbnails before trying file access or video decoding.
- Byte budgets count Blob backing bytes, and evictions revoke owned URLs. Legacy data URLs remain readable and migrate as requested; companion mirroring converts to base64 only in its small bounded queue.

## Verification
- Typecheck and production build passed.
- 222 TypeScript tests and nine media integration tests passed.
- One million references in a common search posting occupy 4,194,304 bytes of typed-array capacity. This excludes token strings, dictionary IDs, and index bookkeeping; it is not total app memory.
- Binary codec tests preserve 65,536 arbitrary bytes, resolve image blob URLs, and verify revocation. Base64 UTF-16 accounting exceeds binary byte size by about 2.67×; actual browser heap savings depend on the string representation.
- Integration tests exercise actual capture cancellation/cleanup, binary byte-budget eviction, disk hits without a decoder, worker append/generation behavior, and yielding/cancellable fallback search.
- Development and final production smoke checks passed on desktop/mobile, with visible content, no overflow or console errors, and no baseline divergence. Visually inspected both development screenshots.
- Chrome restored the saved 132,811-entry catalog, including 60,224 YouTube videos. Search retained `rocket league` while indexing and returned six matching suggestions. Favorites displayed loaded local images via binary blob URLs.
- Mobile source navigation, preview opening, and YouTube iframe playback worked; returned to Home afterward. Pulling stayed paused. Browser console remained clean.

## Limits
No whole-app heap comparison or prolonged out-of-memory soak was performed. These checks verify the compact representations and cleanup paths, not a guarantee that every source of memory pressure is eliminated. The full npm test command has unrelated Windows harness failures recorded in earlier work; this pass ran its complete TypeScript phase and the affected media integration suite.
