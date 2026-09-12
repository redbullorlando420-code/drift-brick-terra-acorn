# Reelcase Companion (early foundation)

## Start it on Windows

1. Close any older Companion window.
2. In the main Reelcase folder, double-click `Start-Reelcase-Companion.cmd`.
3. If Windows asks, choose **More info → Run anyway** only if the file is in
   your own Reelcase folder; it is a local script, not a downloaded installer.
4. Keep the small “Reelcase Companion” window open. The line saying it is
   listening means it is ready.
5. In Reelcase, go to **Settings → Diagnostics**, enable diagnostics, and use
   **Check companion**. A ready response reports the version and approved roots.

The companion is optional; it is only needed for approved desktop shortcut
launching, source health checks, Explorer changes, and Roku discovery.

This optional loopback service is the native boundary for desktop launching and local source verification. It binds only to `127.0.0.1`, checks the browser origin, and permits launches only from explicitly configured game roots. It does not scan disks, accept LAN requests, or transmit media.

The Windows Desktop is included as a guarded default launch location. Add other game roots with `REELCASE_ALLOWED_ROOTS`, separated by semicolons. Current endpoints include health, guarded desktop launch, source health/watch events, and Roku SSDP discovery.


## Offline save (adult embeds)

`POST /offline/save` is a stub for a future local yt-dlp path. It does **not**
download media yet. To finish it later: install `yt-dlp` on PATH, set an allowed
download folder under `REELCASE_ALLOWED_ROOTS`, then teach the companion to spawn
`yt-dlp -o <folder> <url>` for https watch/embed URLs only. No torrent clients.
