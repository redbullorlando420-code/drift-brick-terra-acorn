# YouTube Movies connection

Delivered 2026-11-06 as `movie-connect-01`, `movie-connect-02` and `movie-connect-03`, revision 99. These three tasks implement the explicit movie-connection request. They append to the delivery plan without renumbering or completing unrelated work in the fixed 200-task roadmap.

## Using Movies

The existing Movies page now includes a YouTube Movies panel before the local movie tools. Choose **Load YouTube Movies** for the public storefront, or **Search films** to submit a title through YouTube's Movies search filter. The selected catalog region is a request preference, not a change to account location or playback rights.

Cards show dedicated provider film evidence, posters, runtime, release/genre metadata, rating, offer and observation time where supplied. Ordinary video, TV and advertisement renderers are excluded. Runtime at or below ten minutes is excluded; missing runtime remains labeled unknown. A long video or title match does not become a confirmed film. Offer metadata can be missing, and free-with-ads filters use explicit labels rather than assumptions.

Movie-only shelf expansion and continuation buttons request further provider pages. Previous keeps up to five pages locally. Each provider page projects at most 64 unique film cards; 24 cards mount initially, with an explicit button for additional cards. Counts describe the current page, not the full YouTube catalog. An empty page, expired handle or provider layout change offers retry or the official catalog link. Previous results remain available after a failed request. Cancellation or navigation ignores late results.

**Open on YouTube** opens a canonical official watch page. Signing in, renting, buying, subscriptions and protected playback happen there. The app does not claim rental playback in its embedded player, download protected films, import account purchases or synchronize paid films in Watch Together. Opening a film never marks it watched. [YouTube's availability guidance](https://support.google.com/youtube/answer/16618963?hl=en) explains regional availability and catalog changes; [purchases and rentals guidance](https://support.google.com/youtube/answer/9675559?hl=en) describes the provider's account/payment workflow.

## Saved shelf and recovery

**Save movie** keeps a profile-local shortlist, separately from imported playable library records. This avoids turning a rental listing into an owned or embeddable film. Saved observations retain their original check time and region; they do not silently refresh availability.

Saved movies support title search, length/offer filters, explicit manual watched toggles, removal, plain-text export and one reload-safe undo. **Reload saved movies** rereads the current profile's saved document after another tab changes it. Opening YouTube and exporting never alter playback history. Saved manual marks are independent of original library view counts, resume positions and completion evidence.

Storage uses the existing profile-bound `reviewedDocument` / `profileLocalStorage` adapter under `reelcase.youtube-movies.v1`. There are no new accounts or authentication paths. The document has a 64-film ceiling and the adapter's 64,000-character budget, including one inverse; large metadata can reach the byte budget sooner. Writes validate and check the current saved bytes before persistence, then publish. Quota failures, concurrent changes, invalid/future schemas and oversize documents retain the preceding saved shelf. Read errors prevent new mutations until recovery. Local profiles cannot read each other's shortlist or undo.

The shortlist is a local tool document outside legacy library ZIP restore. Export provides a portable plain-text list of titles, links, observed offers/regions/times and explicit watch marks; it does not recreate paid entitlements or restore the shortlist automatically.

## Request and performance boundaries

The server uses the existing public YouTube request transport, timeouts and provider budgets. It fetches fixed browse/search endpoints without cookies, credentials, signed playback URLs or arbitrary target URLs. The observed Movies search filter is `EgIQBA%3D%3D`; the public storefront browse ID is `FEstorefront`.

Movie parsing scans bounded primary content/continuation trees and emits small allowlisted records, not provider tracking, service endpoints or watch commands. Images are HTTPS ytimg posters with lazy decoding and fallback/retry. No player iframe is mounted.

Requests are user-initiated. There is no automatic movie polling, per-keystroke network request or autosave. The shared server cache has at most 24 pages for five minutes, coalesces identical requests, and allows at most four distinct in-flight requests. Opaque continuation/shelf handles are bound to query, mode and region, expire after fifteen minutes and occupy a bounded 256-entry map. A server restart can expire page handles; loading the catalog or searching again recovers. No client movie state grows with the whole library.

## Verification

- Build, typecheck and 126 focused automated checks passed, covering dedicated film projection, source exclusions, metadata, bounded input/results, storage conflict/quota/future-schema recovery, profile isolation, existing catalog behavior and milestone migrations.
- New desktop/mobile workflows passed in development and production: explicit loading, paging/back, offer filters, title search, provider failure/retry, stale cancellation, durable saving, manual marks, export, reload, undo, alternate profile isolation, external handoff without watched marks, no hidden player and no horizontal overflow.
- Actual anonymous public catalog, movie-only shelf expansion and Movies-filter search passed through both running builds. The Dune query returned 19 dedicated movie cards; shelf expansion displayed 24 initial cards. These are provider observations, not film playback or independent title validation.
- Existing movie metadata imports, reviewed collections and series-progress browser regressions passed on desktop/mobile in development. Production Mission plan migration retained manual choices, custom notes and the fixed roadmap counts.
- Full development and production navigation audits each passed 66 page reports. Home passed desktop/mobile render, console, overflow, brand/auth and production-baseline checks. Movie cards and mobile/desktop layouts were visually inspected.

Evidence is under `screenshots/movie-connection-*`. Browser contexts are disposable; the user's saved library, sources, watch marks and profiles were not used for fixtures. Paid playback, physical-phone behavior, account purchase imports and long memory soaks remain outside this verification.
