# Reelcase mission plan

The in-app **Mission plan** tracks these larger, local-first improvements:

1. Durable media index — **complete**: cached catalog metadata, source health, persisted thumbnail cache, and fast search.
2. Desktop companion — **complete**: explicit local-file verification, folder watching, and approved shortcut launching.
3. Watch room reliability — in progress: host-authoritative state publishing, stale-command rejection, revisioned queue reconciliation, a compact local session ledger, LAN diagnostics, guest checks, and compatibility-safe local room identifiers. Optional visit-only TURN credentials and relay-only testing now support blocked direct paths; real TURN and cross-device matrix validation remain. Same-browser fallback no longer reports signaling as healthy before registration succeeds.
4. Connected services — **complete**: independently cached Twitch, YouTube, Roku, Spotify, and photo refreshes with focused retries.
5. VR theater reliability — **complete**: local playable videos open in a real WebXR cinema surface with controller play/pause and seek controls, plus clear Meta Quest recovery guidance. Remote sources remain intentionally excluded until they are safe for the headset surface.
6. Companion onboarding — **complete**: a one-screen checklist, exact Windows launcher, companion health check, Desktop approval, shortcut validation, and safe first-launch path.

Additional completed work: thumbnail health queue, Windows Explorer bridge, service refresh status,
large-library progressive views, favorites recovery/export, theme/accessibility controls, and local preview recovery.

Recent completed work: History and Stats both provide a merge-safe library-pack recovery import (including standalone History exports), and tag search now accepts human-readable partial creator, source, and interest tags in Adults and the top bar without leaving the Adult desk.

Recent completed work: Watch Room now routes guest playback, video, and queue changes through host confirmation; canonical room packets are timestamped, out-of-order packets are rejected, queues have monotonic revisions, and a local diagnostic ledger records reconciliation decisions without storing media bytes.

Recent completed work: Anime now has its own local-first desk with title/tag search, Continue, Series, and Films & specials shelves, plus an explicit local #anime tagging flow. It preserves recovery data and deliberately does not fetch, proxy, download, or embed video from unverified third-party streaming sites.

Recent completed work: Adult player recovery now prefers Redgifs' official iframe—the same durable route used by linked Reddit posts—rather than an expiring direct CDN URL. Other direct-media adult providers now pass their known source into the full player instead of reaching an empty video element.

Recent completed work: Focused YouTube catalog pulls now have a 100,000-video metadata ceiling (not media-file downloading), while normal refresh and bulk import limits remain deliberately smaller. On-demand comments now recover from both current entity responses and legacy `commentRenderer` responses, including an initial-page continuation fallback.

Recent completed work: Adult discovery now presents the video, photo, and rotating-pick rows at full width. Private recommendations apply both creator and provider diversity, and Booru source recovery handles source-specific search semantics plus JSON, XML, and public-listing response variants for Rule34-style hosts, Gelbooru, and Realbooru.

Recent completed work: Watch Room and other local-only identifiers no longer assume `crypto.randomUUID` exists. Browser profiles with partial Web Crypto can create and join a room instead of failing immediately.

Recent completed work: Companion media inspection now reads a bounded, root-gated ffprobe metadata batch, previews sanitized embedded fields and compact tag suggestions, and persists only the suggestions a person explicitly selects. Saved inspection tags retain their own provenance and never override a manual tag lock.

Recent completed work: Local video vision now holds every inferred frame label in a per-label review panel before it touches the catalog. Accepted labels record local-vision provenance; skipped labels are discarded, and manual tag locks are excluded from the work queue.

Recent completed work: Local photo vision now follows the same explicit-review contract. The classifier prepares at most 48 transient photo-label results at a time; every label starts checked but remains local until applied, while skipped or discarded labels never modify durable photo metadata.

Recent completed work: Metadata-tail coverage now shows tagged, waiting, and manually locked titles by source. Its explicit 48-title batch reuses cached provider fields and local names only—no network request or media inspection—while preserving provenance and manual locks.

Recent completed work: Creator coverage repair now fills missing YouTube/Twitch display names only from exact cached channel or source IDs shared with a saved follow. It runs in bounded 48-card batches, preserves manual tag locks, retains a verified name through a shallow provider response, and surfaces conflicting matches for review instead of guessing.

Recent completed work: Provider refreshes now retain unchanged cards at their original catalog indexes, so shallow selectors can skip re-rendering unaffected shelves. New or changed rows alone propagate; ordinary refreshes also retain on-demand comments and verified creator names that the shallow provider response does not carry.

Recent completed work: Hub route warmup now shares the normal lazy-load promise and prefetches one adjacent desk only after the current desk has painted and the browser is idle. It gives way to typing, hidden tabs, Save-Data, 2G/3G, and low-memory devices.

Recent completed work: Long horizontal rails now retain only a measured card window and spacer geometry. Arrow keys, Home/End, and focus bridges keep keyboard travel continuous across cards that are not currently mounted.

Recent completed work: Visible-card actions now receive a short foreground scheduling lease. Ratings, playback, and card opens paint ahead of deferred search indexing, discovery selection, Adult ranking/facets, and speculative artwork work; each background pass resumes promptly once interaction settles.

Each milestone is broken into an implementation change, a browser verification, and a production build check. The interactive checklist is saved in the browser under `reelcase.mission-plan.v1`.

Recent completed work: Live is grouped by Twitch, YouTube, Chaturbate, and MyFreeCams with source counts and shared search, favorite/like filters, sorting, and per-source pagination. Fresh Twitch responses use the current clock instead of an older timer tick; stale observations and missing follows have explicit diagnostics and a Twitch-only refresh action.

Recent completed work: Settings provides an on-demand Companion artwork disk audit with per-source sizes, file counts, oldest updates, and hit/miss samples since Companion startup. Scans are bounded, report partial inventories, and leave retention unchanged. Cross-device Watch Room validation remains open.

## Next quality and performance stream

- [x] Prepare an opt-in, private LAN HTTPS gateway with checksum-verified Caddy installation, LAN-interface binding, private CA storage outside the served workspace, and a non-destructive recovery-pack migration guide.
- [x] Start the gateway on the selected home-LAN interface and verify a 200 response with hostname/certificate validation against its local CA (no TLS bypass). Build and typecheck pass. This transport check is not a browser/device trust or Twitch playback check.
- [ ] Activate home-network DNS and per-device certificate trust; verify HTTPS and actual Twitch playback on desktop and phone before marking the LAN embed issue resolved. Preserve the original HTTP library until the migration is verified.

- YouTube: resumable deep-pull checkpoints, live comment/chat regression coverage, channel import health, freshness windows, and selective retries.
- Twitch: live/archive separation, channel diagnostics, stream freshness, and focused refresh.
- X: explicit source connection status, cache age, opt-in import controls, and retry diagnostics.
- Startup budget: progressively hydrate shelves, prioritize visible artwork, and measure search, scrolling, and thumbnail queue latency on large libraries.
