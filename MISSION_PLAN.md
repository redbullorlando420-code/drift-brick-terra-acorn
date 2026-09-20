# Reelcase mission plan

The in-app **Mission plan** tracks these larger, local-first improvements:

1. Durable media index — **complete**: cached catalog metadata, source health, persisted thumbnail cache, and fast search.
2. Desktop companion — **complete**: explicit local-file verification, folder watching, and approved shortcut launching.
3. Watch room reliability — in progress: host-authoritative state publishing, stale-command rejection, revisioned queue reconciliation, a compact local session ledger, LAN diagnostics, and guest checks. Real cross-device matrix validation and a TURN-backed recovery route remain.
4. Connected services — **complete**: independently cached Twitch, YouTube, Roku, Spotify, and photo refreshes with focused retries.
5. VR theater reliability — **complete**: local playable videos open in a real WebXR cinema surface with controller play/pause and seek controls, plus clear Meta Quest recovery guidance. Remote sources remain intentionally excluded until they are safe for the headset surface.
6. Companion onboarding — **complete**: a one-screen checklist, exact Windows launcher, companion health check, Desktop approval, shortcut validation, and safe first-launch path.

Additional completed work: thumbnail health queue, Windows Explorer bridge, service refresh status,
large-library progressive views, favorites recovery/export, theme/accessibility controls, and local preview recovery.

Recent completed work: History and Stats both provide a merge-safe library-pack recovery import (including standalone History exports), and tag search now accepts human-readable partial creator, source, and interest tags in Adults and the top bar without leaving the Adult desk.

Recent completed work: Watch Room now routes guest playback, video, and queue changes through host confirmation; canonical room packets are timestamped, out-of-order packets are rejected, queues have monotonic revisions, and a local diagnostic ledger records reconciliation decisions without storing media bytes.

Recent completed work: Anime now has its own local-first desk with title/tag search, Continue, Series, and Films & specials shelves, plus an explicit local #anime tagging flow. It preserves recovery data and deliberately does not fetch, proxy, download, or embed video from unverified third-party streaming sites.

Recent completed work: Adult player recovery now prefers Redgifs' official iframe—the same durable route used by linked Reddit posts—rather than an expiring direct CDN URL. Other direct-media adult providers now pass their known source into the full player instead of reaching an empty video element.

Each milestone is broken into an implementation change, a browser verification, and a production build check. The interactive checklist is saved in the browser under `reelcase.mission-plan.v1`.

## Next quality and performance stream

- YouTube: channel import health, pagination, freshness windows, and selective retries.
- Twitch: live/archive separation, channel diagnostics, stream freshness, and focused refresh.
- X: explicit source connection status, cache age, opt-in import controls, and retry diagnostics.
- Startup budget: progressively hydrate shelves, prioritize visible artwork, and measure search, scrolling, and thumbnail queue latency on large libraries.
