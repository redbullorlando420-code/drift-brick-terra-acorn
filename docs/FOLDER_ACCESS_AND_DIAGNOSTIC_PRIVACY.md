# Configured folder access and diagnostic privacy

Delivered together: next-073 and next-091, mission-plan revision 69.

## Folder access

Open Settings → Companion folder access → Review approved folders. This is an on-demand metadata check, not a disk scan. It lists configured roots and their current approval. The browser cannot supply a new root path. Revoke folder access first shows the selected folder and affected work; cancelling changes nothing. Confirming revocation invalidates affected leases immediately, stops queued downloads, asks native processes to stop, closes media streams, denies delayed writes, clears revoked folder-watch hints, and keeps existing media, partial files and browser personal records.

Restore configured access verifies the original canonical folder and its pinned filesystem identity. It changes only that configured root; jobs never resume automatically. Existing approved download destinations and their saved receipts can recover after a service started with that root revoked. Missing destinations still require local setup. A stale root revision is rejected and requires an explicit refresh. A replaced or retargeted folder cannot inherit approval; review configuration locally and restart before reapproval. New approval writes that fail persistence remain blocked, and an unreadable local policy fails closed.

The authority records device, exact BigInt inode and creation time, avoiding Windows integer precision loss. Paths are resolved against current real ancestors. File writes use an exclusive temporary file and recheck access before rename; reads use a verified file descriptor with no-follow where available. Traversals recheck each directory and file. Root metadata checks are limited to configured/requested folders. A single 250 ms check runs only while access leases exist; explicit revocations notify leases synchronously, without waiting for it. Unrelated roots are not checked for every file operation. Folder watches close on revoke and reopen only for approved configured roots; watch status reflects actual watcher ownership.

Downloads capture a root lease when queued and a folder lease before spawning. Revocation invalidates both pending and running work and denies further receipt/file admission. Native ffprobe and icon extraction now run asynchronously through the same lease boundary with time/response limits, so their subprocess wait does not block the revocation endpoint. No new PowerShell command was added; the existing icon command is now asynchronous and cancellable. Artwork fetches hold a lease across the network await and cap received bytes before allocation of the final image. Artwork audits and completed-download streams also release on abort/close.

Folder roots govern the approved-file bridge. Application-owned configuration, managed image-engine/model directories and other separately configured local services retain their own policies; this does not complete the capability-consent milestone. This application boundary is not an operating-system sandbox against an already privileged concurrent filesystem attacker. Native process termination is requested immediately on invalidation but OS shutdown is asynchronous; the app never admits later output as success. It cannot undo bytes already written or sent before revocation. No source media is deleted. Incoming file-mutation requests also capture the approval generation before receiving their body and must retry if permissions change before dispatch, even if access was later restored. File-transfer request bodies have endpoint-specific ceilings (32 MiB legacy pack, 72 MiB base64 print, 4 MiB ordinary file metadata); smaller existing download/root-control limits remain.

Companion source is version 15 with the explicit root-access capability. Existing user Companion processes were not restarted or changed during verification; a running older service will show the version requirement until it is updated through its normal local workflow.

## Shareable diagnostics and private exports

DiagnosticExport uses closed schemas. It reads only listed own data fields, discards unexpected fields without traversal, accepts finite nonnegative measurements and known status enums, and limits arrays and final JSON to 64 KiB. It never serializes the raw input as a fallback, invokes object accessors or logs the rejected input. Configuration fingerprints, root IDs, local paths, media IDs/URLs, invitation tokens, free-text errors, titles, notes, tags, prompts, chats and credentials are excluded. Missing/unmeasured or invalid values are omitted rather than invented.

Performance measurements, room connection diagnostics, Companion update comparisons, folder status diagnostics, YouTube player diagnostics and Adult provider quality reports use this common boundary. Each interactive diagnostic surface has a privacy preview of excluded classes and exact safe JSON. The preview clears when its source snapshot changes. Existing copy/download actions remain deliberate, use the same sanitized shape, and release temporary object URLs.

YouTube player diagnostic JSON is now version 2: per-entry phases, times, load counts and observed player codes remain; video IDs and official watch URLs are excluded. The visible player still offers its separate deliberate official-link action. Companion update diagnostic exports omit configuration fingerprints and arbitrary comparison strings; the local update checklist/baseline retains its existing detailed comparison.

Private exports intentionally keep personal data and do not use the diagnostic redactor. The Library pack heading and catalog-export explanation label this distinction. A selected .reelpack retains exact notes, ratings, history, favorites and resume marks and still passes preflight/restore. Existing Full backup is the legacy full catalog metadata export; no new transactional full-catalog restore or rollback is claimed here. Full library-pack scope and bounds remain documented in LIBRARY_PACK_PREFLIGHT.md.

## Export/clipboard boundary inventory

| Surface / source | Class and boundary |
| --- | --- |
| PerformanceScorecard | Shareable diagnostic; common performance schema, counters/timings only |
| RoomConnectionPanel / room-connection-timeline | Shareable diagnostic; common room schema before clipboard/fallback |
| CompanionUpdatePanel | Shareable diagnostic; summary snapshots, no fingerprints, raw comparison text or job records |
| RootAccessPanel | Shareable diagnostic; aggregate/status rows, no folder paths or root IDs |
| YoutubeEmbedRecovery / room-youtube-diagnostics | Shareable diagnostic v2; observed state/codes without selected-video identity |
| ProviderQualityDetails / adult-quality | Shareable diagnostic; known provider enums and bounded quality counters |
| LibraryPackTransfer, library-pack, library-pack-stream | Explicit private metadata backup; personal records preserved and restorable through reviewed import |
| Settings exportLocal / Catalog CSV / YouTube + Twitch | Explicit private catalog/source metadata exports; retain intended paths, titles and saved creator data |
| use-history-browse, adult-stats, topic-links, twitch-content-controls | Explicit personal history/stats/source reports; may identify media and interests |
| guide-experiment, recommendation-report, topic-bridge-audit | Explicit personal recommendation/provenance reports; tags and interests are intentional content |
| youtube-publication-evidence, youtube-tag-suggestions | Explicit selected-video evidence; video identity/provenance remain intentional content |
| Room session file and public queue links | Deliberate session/selected-public-content handoff; existing room privacy filters remain in force |
| Room invitations and LAN/tunnel addresses | Deliberately copied connection capabilities; never included in generic diagnostics |
| Provider recovery / download links | Deliberately copied/opened official content links; not diagnostic data |
| Mission-plan CSV/Markdown/copied briefs | User-authored project instructions/status, including custom notes; not an account diagnostic |
| Stream Signal posts, captions and PNG; Chat Plays replay; racing examples | Deliberate authored/simulated content exports; no platform publication is inferred |
| Studio recipes, model requirements, outputs; print/photo downloads | Deliberate selected private/content artifacts; managed native storage retains its separate configuration |
| hub-shared downloadCsv and shared file/download helpers | Transport helpers for the caller's explicitly classified content; never a generic raw diagnostic route |

The inventory was checked against download/clipboard assignments and shared transport helpers in source. Intentional content sharing is not silently converted into a redacted file, and diagnostics are not advertised as restorable backups.

## Evidence and limits

- scripts/root-access.test.mjs covers approved reads/writes, traversal denial, persistent revocation, stale revisions, exact root replacement, junction retargeting, held active/queued downloads, partial-file retention, replacement of a job folder, failed policy save, and cancelled native output, healthy native completion/overflow, backpressured stream closure and closed-owner rejection. Windows directory-junction fixtures are real; file-symlink creation requires privileges unavailable here and was replaced by equivalent ancestor-junction coverage, not claimed as native file-symlink coverage.
- scripts/root-access-http-check.mjs runs a copied service on an ephemeral loopback port with disposable workspace roots. A controlled image response is held across real HTTP revocation, then released. No final cache write occurs. It also tests origin gating, stale reapproval, root-junction replacement, denied print writes and current health counts. Existing receipt HTTP checks run against the copied v15 service too.
- scripts/diagnostic-export.test.mjs injects canary secrets into every diagnostic kind, nested/unknown fields and accessors; validates finite telemetry, array limits, identifier-free player export, actual room export, and deliberate private-pack restore with exact private notes/ratings.
- scripts/root-diagnostic-browser-check.mjs exercises desktop 1440×1000 and touch mobile 390×844: no automatic root read, review/cancel/revoke, preview/download equivalence, no private path/ID in output, stale generation failure and refreshed reapproval, reload, private-pack preservation and capability denial for v14.
- Build, type, existing room/provider/import/ranking/Companion tests and dev/production render/interaction artifacts are recorded in MILESTONE_VERIFICATION.md.

No new dependency, external repository, native installation, user-folder mutation, user-service restart, model download or real signed-in provider action occurred. Physical phones, adversarial OS-level filesystem races, arbitrary network filesystems, real active downloader termination and long-session soak remain separate verification. No capability-consent, native remote desktop, atomic restore or profile-isolation milestone was promoted by this work.
