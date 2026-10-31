# Download budgets and game launch receipts

Milestones next-076 and next-077. Companion source v16, protocol 1. Both features remain local and origin-gated; no game, download or history review starts automatically. Existing library metadata, completed legacy download receipts and browser games remain available.

## Downloads

Before each queued job starts, Companion checks the approved root, canonical destination and bounded file inventory, then measures available bytes with Node's filesystem space API. Unknown size is explicitly unknown; the default allowance is 2 GiB, plus a 512 MiB safety margin. A saved positive size estimate is only an estimate. Set REELCASE_DOWNLOAD_MARGIN_MIB from 64 to 16384 and REELCASE_DOWNLOAD_ESTIMATE_MIB from 64 to 65536 in the local service environment; invalid settings use defaults. The app displays these values and the last check on the video's Download panel.

Insufficient or unmeasurable space pauses the job before output-folder creation or native process dispatch. Queue receipt metadata is still saved. There is no automatic retry loop. Explicit Resume checks everything again. During active downloader progress, a space check runs at most once per five seconds and stops the child when the safety margin is reached. This is not a filesystem reservation, and cannot guarantee that a very large unknown-size file fits or react instantly to another process filling the disk.

New attempts use unique receipt-ID folders. Start fresh copy keeps the old receipt and files, using a separate destination. Resume requires the ownership receipt to match job/source/key, folder identity, file identities, sizes, modification times and bounded first/last 64 KiB samples. Inventory is limited to 128 entries with no subdirectories or symbolic files. A changed/unowned/oversized inventory stays untouched and requires a fresh copy. Native flags include --continue and --no-overwrites; actual range continuation still depends on the provider and downloader. These ownership samples are not a full-file integrity checksum.

A normal stopped/failed attempt checkpoints partial files after the child exits. An abrupt crash, a root change, a file still being written or a failed checkpoint can leave partials unverified. Companion refuses unsafe adoption and does not delete them. Existing completed legacy receipts remain readable; old partials without ownership records need a fresh copy. Changing the configured download root requires local configuration and service restart; receipts cannot silently migrate authority to another root.

Settings job recovery and update comparisons understand Paused. Update baseline schema 1 accepts both earlier six-status summaries and new summaries containing the paused count. Shared diagnostics still exclude paths, titles, URLs, IDs and session contents.

## Game launches

Companion pins the exact approved shortcut's canonical path and filesystem identity before dispatch. The Windows Explorer executable receives that path as a literal argument; there is no command-shell or PowerShell interpolation. Supported targets are existing approved .exe, .lnk, .url and .appref-ms files. Other operating systems receive an explicit unsupported result. Revocation/missing files fail before new dispatch.

Concurrent identical requests share one in-flight request; a successfully accepted receipt is reused for eight seconds. Different games are independent, with at most eight pending requests. The desktop button also guards repeated clicks before React rerenders. A request that fails can be retried. Check the actual game before repeating an interrupted/unverified request.

Receipts contain a private local path, hashed shortcut identity, time, accepted/failed/interrupted outcome and observed launcher exit. **Accepted is OS launch-request acceptance; actual game readiness remains unverified.** Explorer's process is not the game. Neither child spawn nor an exit code proves a game has loaded. Revocation can stop an unaccepted launcher observation; it cannot undo an already accepted OS action.

Games → Review launch receipts fetches the last 50 records on demand. It performs no launch or periodic polling. Receipt history survives service restart; pending records become interrupted and never replay. The private .local-launch-receipts.json is excluded from Git and should remain local. Corrupt/future/unwritable receipt storage blocks new launches rather than discarding history. No launch-history sharing/export was added.

## Verification boundaries

Unit tests use approved temporary folders, real filesystem identity/partial samples, mocked disk measurements and mocked child processes. The HTTP harness runs a disposable copy of the actual Companion with an isolated approved root, intercepting native spawn/tool versions/space. Browser checks use isolated profiles and fixture routes on desktop and touch mobile. They cover explicit paused resume/fresh copy, no closed-panel polling, double-click controls, honest readiness, history reload and denial recovery. Existing origin/revocation/recovery and private-diagnostic regressions remain covered.

These checks do not claim a real game loaded, a provider resumed a real transfer, a disk was physically filled, or the user's installed Companion was restarted. Use the v16 Companion source to obtain the new native capabilities; older services retain their other negotiated features. No extra repository or dependency was introduced.
