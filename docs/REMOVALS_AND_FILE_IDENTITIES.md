# Removed titles and verified file moves

Manual **Remove** now saves an exclusion record before removing the catalog card. Delayed provider responses, catalog journals, backup media merges and folder recovery consult these records. Automatic YouTube cleanup remains a separate workflow. Ratings, tags, favorites, history, resume and reviewed film/anime identities remain attached to the original media ID.

Use **Settings → Removed titles → Restore** to restore one chosen title. Other removals stay excluded. Nothing expires automatically. Recovery retains up to 1,024 records; a full ledger refuses another removal rather than discarding an older exclusion. Local source permission may still be needed to play a restored file. Private recovery retains its private classification even when its original folder is absent, and locked panels conceal private names.

## Move or rename a local file

1. While the original is readable, open its preview, expand **Verify or repair this file’s identity**, and choose **Record original fingerprint**.
2. Move the file yourself and add its destination source to the library. The app does not move or copy the media bytes.
3. Open the original preview, or **Settings → File identities & moves → Review identity** if the old location is missing. Search for the destination, select it, and choose **Verify destination contents**.
4. Review the matching full-content fingerprint, check the confirmation, and apply the move. Close playback and release either title from Watch Room first.
5. Use **Undo file move** in Settings to restore the preceding metadata mapping. Saved marks added since the move remain attached to the original ID. Reconnect the old source if needed.

Names and paths are candidate hints only. Equal names or equal sizes do not prove identity. A recorded complete SHA-256 fingerprint plus a freshly inspected, already permission-granted destination is the strong identity tier. Multiple matching candidates require an explicit owner selection; no automatic merge takes place. Without a recorded readable original, the app refuses to guess. A destination with personal signals is rejected for separate conflict review; a private original cannot be linked into a public destination.

## Persistence and resource limits

Version-1 ledgers live in the existing IndexedDB remote-cache store under `catalog-deletions:v1` and `file-identities:v1`. File moves and Undo atomically update the canonical row, destination row and reversible receipt under the catalog writer lease. Keeping the original ID preserves sparse personal records without copying or rewriting them. There is no media-byte transfer or broad filesystem walk. The browser uses selected files and granted directory handles; Companion approved-root policy is unchanged. Native Companion-only paths cannot be fingerprinted through this browser workflow without a granted local file.

The identity ledger is bounded to 2,048 fingerprints, 128 move receipts and an 8 MiB serialized budget. Unsupported future schemas, stale revisions, conflicting destination state, quota failures and lost writer ownership fail without replacing saved mappings. Settings pages show records in windows of 12; candidate search yields through the catalog and returns at most 20 matches.

SHA-256 runs in a separate worker using the credited MIT-licensed `@noble/hashes` implementation, with 1 MiB incremental chunks, at most two inspections, cancellation and a ten-minute timeout. Unrelated scans and thumbnail rails do not hash files. Explicit inspection, first playback after reload, and scans of approved alias locations can read a complete moved file. Large files can therefore take time to verify. Workers terminate on completion, failure or cancellation.

Rescans verify known alias locations. An unchanged old copy is suppressed, the approved destination returns under the canonical ID, and different bytes at a reused location receive a content-specific new ID without the old title’s marks. Verification remains attached after Undo, protecting the restored location too. No original file is deleted. Directory permissions, source availability and filesystem integrity remain external requirements.

These are bounded metadata transactions, not a whole-library restore generation switch, portable profile implementation, or physical power-loss guarantee. Those roadmap items remain open.
