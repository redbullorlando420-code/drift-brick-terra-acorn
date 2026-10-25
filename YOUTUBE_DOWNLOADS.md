# YouTube downloads

YouTube cards, previews, and the player have a **Download** button. Open it to check the local Companion, start one video, view real progress, cancel, or retry. Opening a panel never starts a download. Closing the panel leaves a started download running; reopening it or reloading the app restores status from Companion. Mobile controls wrap; native downloading requires the app and Companion on the same computer.

The download panel loads only when opened. Cards do not check Companion or subscribe to progress. Polling runs every two seconds only while this panel is visible and its selected video has a queued/running job. Closing or hiding it aborts requests and stops the timer.

## Local setup

Double-click `companion/Setup-YouTube-Downloads.cmd`, then `companion/Start-Realhub-Companion.cmd` (restart an existing Companion after setup). Developers can use `npm run setup:youtube-dl` and `npm run companion`.

Setup downloads the Windows executable (Unix executable on other systems) from the official [youtube-dl nightly releases](https://github.com/ytdl-org/ytdl-nightly/releases), verifies its published SHA-256, and checks `--version`. It installs under `companion/tools/` without changing PATH. Re-running setup preserves the local save folder. The ignored `companion/.local-youtube-dl.json` approves the local download root, defaulting to `downloads/YouTube/` in this project. Binaries, media, and local configuration stay out of Git. `YOUTUBE_DL_PATH` can select an operator-installed executable; `REELCASE_DOWNLOAD_DIR` can select an output directory under approved `REELCASE_ALLOWED_ROOTS`.

The existing yt-dlp Adult offline-save endpoint remains supported. It now also tracks the actual process instead of claiming completion after eight seconds. YouTube uses youtube-dl explicitly, with no silent engine substitution.

## Native boundary

Companion v11 remains bound to loopback with its origin allow-list. `/youtube/downloads` accepts an 11-character video ID and title, constructs the canonical HTTPS watch URL server-side, and rejects arbitrary URLs, command flags and playlists. No browser credentials or cookies are supplied. Live broadcasts are excluded in the UI and with the downloader's match filter. Videos requiring unavailable provider access fail visibly.

Processes run without a shell or user config. They write only within an approved output directory, one process at a time, with at most eight waiting jobs and 40 history entries. Requests for the same active video deduplicate. Output buffers and error messages are bounded. Cancellation kills the process; the next queued process waits for exit. A job is complete only after exit code zero and a nonempty completed media file. An interrupted job becomes an error on restart, rather than resuming unattended. Status is saved on lifecycle changes, not on every progress line.

The combined MP4 format is preferred, falling back to the best combined format. This avoids requiring ffmpeg, while making no promise of maximum-resolution separate video/audio merging. Files remain on disk; the browser does not stream them through Companion or insert them into the library without folder permission.

## Verification

- `node --test scripts/youtube-download.test.mjs`: identity validation, safe arguments, progress versus completion, real errors, output checks, duplicates, queue bounds, cancellation, launch failure, root revocation and restart recovery.
- `node scripts/youtube-download-check.mjs URL screenshots/youtube-download-NAME.json`: isolated desktop/mobile card, preview and player controls; cancellation, retry, completion, reload recovery, setup/old-Companion errors, live exclusion, and idle polling checks. Native/provider responses are fixtures in this browser check.
- A separate real Companion check downloaded the public 19-second `jNQXAC9IVRw` video as a 629,172-byte MP4 using the checksum-verified youtube-dl 2025.11.26 executable. The former upstream test ID `BaW_jenozKc` returned unavailable; that was recorded as an error, not a completed download.
- Build, TypeScript, existing regression tests, and desktop/mobile development/production browser checks accompany the change.
