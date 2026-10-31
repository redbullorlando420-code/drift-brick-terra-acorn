# Reviewed print saves and the Companion platform contract

Milestones next-078 and next-080. Companion source v17, protocol 1. The app remains usable without Companion; no installation, provider connection or desktop launch happens merely by opening these features.

## Save an edited print

Open a print in 3D prints → View / Edit. Transforms and material choices are local drafts. Choose save destination lists existing approved local folders. Choose a new GLB filename, acknowledge the format limits, then Review new copy. This exports the scene and records a bounded review; it creates no model file. Save reviewed copy streams the reviewed payload to Companion. Existing files are never replaced, including the older original-byte copy button.

GLB retains the current static geometry, transforms and supported embedded materials. Export excludes camera, lighting, grid, wireframe and explode preview. STL/OBJ cannot carry these material edits; edited outputs are GLB only. Animations, CAD constraints, slicer settings and assembly semantics are not promised. Embedded textures may be resized to 2048 pixels. Source units remain unchanged: check scale in a slicer. Imported colors are retained until a deliberate material-color override. Reset restores the imported colors. Saved GLB files contain a versioned origin-preservation marker, so reopening does not move the file onto the bed or apply its baked transforms twice.

The browser checks a 32 MiB geometry/16-million-texture-pixel estimate before export and a 48 MiB final file limit. SHA-256 binds the review to the exact upload. The Companion streams at most two concurrent uploads with 64 KiB write buffers, verifies size/hash and bounded GLB structure (4 MiB JSON and 128 chunk headers maximum), and pins the approved folder across awaits. Reviews expire after five minutes; at most eight wait at a time. There is no status polling.

A same-directory exclusive temporary file is linked atomically to a new destination after verification. This requires filesystem hard-link support (tested on Windows NTFS); unsupported filesystems fail without replacing the original. Cleanup checks ownership of transaction temporary files and retains unrelated collisions. The private .local-print-transactions.json journal keeps at most forty receipts and is excluded from Git. A corrupt/future journal blocks new transactions and is preserved.

A failed/interrupted response leaves the draft unconfirmed. Reload retains edits and the pending receipt ID. Check pending save verifies the saved file before marking a copy confirmed; it does not upload again. After a process interruption, an incomplete upload never replays. If the link was made before its completion receipt, recovery requires the target and transaction temporary file to share filesystem identity and match the reviewed bytes/hash. Cancellation removes only a verified owned temporary file; it does not delete a completed model. Revoked/unavailable destinations can leave hidden temporary files for later approved review. Original models and browser drafts are retained. Local draft writes are coalesced; idle viewers stop rendering, and closing disposes their resources.

## Platform contract

The service reports its own OS. The browser does not infer the server OS from the phone/laptop browser. Explicit OS declarations filter contradictory capabilities; older services retain their advertised legacy features with an unverified-platform explanation. Unsupported operations are disabled in the app and rejected at the service before native dispatch.

| Capability | Windows | Linux/macOS contract |
| --- | --- | --- |
| Approved file roots, metadata, print transactions, packs, artwork | Available with configured folders | Portable core, native OS behavior unverified |
| ffprobe inspection and yt-dlp jobs | Requires the separately installed tool | Portable argv execution; tool/OS behavior unverified |
| Browser catalog, local imports and web games | Available without Companion | Available without Companion |
| Desktop launch receipts, Windows shortcuts/icons, Steam/Epic Windows layouts | Advertised Windows capability and approved root required | Unsupported and disabled |
| Registry auto-start and tray balloons | Explicit Windows capability required | Unsupported; use the OS service manager separately |
| Bundled AUTOMATIC1111/ComfyUI installers and owned engine starts | Existing isolated Windows setup | Unsupported; external engine setup required |
| Already-running local image API and configured RustDesk binary | Separate readiness/consent still required | Existing configured API/binary path; actual OS behavior unverified |

REELCASE_ALLOWED_ROOTS accepts absolute paths: semicolon-separated on Windows, colon-separated on POSIX. Legacy semicolon-separated POSIX declarations remain accepted. Relative declarations are rejected; roots are still pinned by canonical filesystem identity. No whole-disk scanning or arbitrary command flags were added. Folder-watch status remains honest when recursive watching is unavailable.

Games performs one coalesced support probe on mount and offers explicit refresh; it never polls. Browser web shortcuts stay usable while native actions are unavailable. Mission plan startup buttons require Check Companion setup and the actual tray-autostart capability. Settings explains the reported platform alongside individual capability states. New capabilities are platform-contract, print-save-transaction and tray-notifications.

## Evidence and limits

Actual filesystem, process-isolation and HTTP tests ran on Windows. Native game launch, registry changes, tray execution, installed image engines and RustDesk sessions were not invoked. Linux/macOS contract, path and dispatch fixtures ran on Windows; this is not native Linux/macOS verification. GLB round-trip tests use actual Three.js export/import, and desktop/touch-mobile browser checks edit, export and reopen a real model in WebGL. No user's model or running Companion service was replaced or restarted. See MILESTONE_VERIFICATION.md for this batch's exact checks and artifacts.
