# Media recovery

Open **Settings → Media recovery → Review affected media**, or use **Check selected title availability** in a local video or Twitch VOD/clip preview. Checks are explicit. Opening the panel never checks the entire library, starts a player, prompts for permissions, or scans a disk.

## Twitch VODs and clips

A fixed-host, item-specific public metadata query checks one canonical VOD ID or clip slug. A clean typed record means public metadata was available at that check; a clean `null` means the item was not publicly available then. This does not distinguish expiration, deletion, privacy, subscription restrictions or other access policy. It never promises an embed will work.

HTTP errors, rate limits, timeouts, malformed responses, mismatched identities and GraphQL field errors remain unverified. A failed retry retains the previous verified observation separately. Embed/player errors do not prove permanent expiry. Live channels keep using the separate Live checker.

Choose **Keep bookmark** to retain browsing access and personal marks, **Hide from browsing** to hide it, or **Remove saved title** for a consequence preview. Removal uses the durable removal ledger; restore that title individually in **Removed titles**. None of these actions deletes source media. Opening the official Twitch page does not change an availability observation.

## Local sources

Affected entries are grouped by their already selected source. **Reconnect permission** requests access to that saved browser directory only. **Check next entries** inspects at most 20 selected entries, distinguishing denied permission, an unreadable/disconnected source, an absent file, changed size, and a readable file. Recorded fingerprints are checked when available. A readable path without a prior fingerprint is an availability check, not proof that arbitrary moved files are identical.

**Rescan this folder** walks only the selected granted directory. It preserves unresolved bookmarks and all personal records, rather than replacing the folder with only the files found this time. It never migrates resume by filename. Changed sizes and conflicts with recorded fingerprints remain held for review, with mismatched playback blocked. A disconnected drive does not prove that its files were deleted.

Use **Review verified identity** to record/compare complete fingerprints and explicitly approve a move using the existing identity ledger. **Add destination folder** uses the ordinary picker; matching a new directory by its name alone never reconnects the old identity. Native-only Companion paths need a browser-selected file/directory for this workflow. Companion approved-root restrictions and native services are unchanged.

## Saved records, bounds and cancellation

The version-1 `media-health:v1` activity document holds at most 1,024 compact records and 8 MiB. It stores canonical metadata, fixed observation codes, latest observation, last verified public status, and a separate timestamped visibility choice. It contains no cookies, credentials, media bytes or raw provider responses. Unknown future versions, quota failures and conflicting writer ownership block the write while preserving saved data. No idle polling or whole-library retry was added. Recorded originals receive fingerprint verification during playback too; thumbnail browsing skips those complete-file reads.

Review preparation yields while walking large catalogs. Up to 12 source groups mount initially, each retaining at most 20 candidates, with the least recently checked first. Refresh after a batch to reach other entries; explicit title search finds a particular affected entry. Handled bookmarks and hidden records can be included for review. Locked private sources conceal their names and cards, and private evidence remains private after merge.

**Cancel remaining checks** stops new checks and ignores a held result after cancellation. Earlier committed checks remain saved. Closing a preview cancels its pending check. A rescan or accepted metadata choice completes its own transaction; it is not presented as cancellable midway through commit.

At the record limit, export a backup or explicitly **Forget check record** for a selected diagnostic. Its confirmation explains that only the observation/choice timestamp is forgotten; source media, saved title, feedback, resume and current hidden state stay unchanged. Forgotten diagnostics have no automatic Undo.

Library ZIP and streaming backups include `marks/media-health.json`. Preflight rejects invalid/future sidecars. Reviewed import waits for durable recovery choices, merges observation/verification/choice timestamps independently, and retains personal signals through their original IDs. The import remains the existing multi-section import; it does not claim whole-library atomic restore or rollback.

Desktop/mobile automation uses isolated browser storage, browser-granted fixture files, controlled permission responses and controlled Twitch metadata. Physical drive reconnection, real provider account access, physical phones and native Companion-only file repair require separate real-device checks. No real source file was moved or deleted by those tests.
