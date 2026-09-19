# Reelcase Companion (v10)

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
launching, Steam/Epic cataloging under allowed roots, library-pack disk
export/import, print file bridge, thumb/poster disk cache, source health
checks, Explorer changes, Roku discovery, optional offline saves, and
Windows auto-start / job balloons.

This optional loopback service is the native boundary for desktop launching and local source verification. It binds only to `127.0.0.1`, checks the browser origin, and permits launches only from explicitly configured game roots. It does not scan disks broadly, accept LAN requests, or transmit media off-machine.

The Windows Desktop is included as a guarded default launch location. Add other game roots with `REELCASE_ALLOWED_ROOTS`, separated by semicolons.

## Capabilities (v10)

| Area | Endpoints | Notes |
|---|---|---|
| Health | `GET /health` | version, roots, capability list, tray badge |
| Shortcuts | `/shortcuts`, `/shortcut-icon(s)`, `/launch` | Desktop launchers under approved roots |
| Steam / Epic | `GET /games/steam-epic` | Known `steamapps/common` + `Epic Games` dirs **under allowed roots only** |
| Library pack | `POST /library-pack/export`, `GET /library-pack/import` | Writes/reads `<root>/Reelcase Library Pack` (or `REELCASE_LIBRARY_PACK_DIR`) |
| Thumb cache | `POST /thumbs/put`, `POST /thumbs/cache-url`, `GET /thumbs/get` | `<root>/Reelcase Cache/thumbs` (or `REELCASE_THUMB_CACHE_DIR`) |
| Prints bridge | `GET /prints/list`, `GET /prints/file`, `POST /prints/save` | STL/OBJ/GLB/GLTF/3MF/G-code under allowed roots / `Reelcase Prints` |
| Offline save | `POST /offline/save` | yt-dlp into allowed download folder |
| Tray / jobs | `POST /tray/autostart`, `POST /tray/notify`, `GET /jobs`, `POST /jobs/ack` | Windows Run-key auto-start + balloon when offline jobs finish |

## Offline save (adult embeds)

`POST /offline/save` spawns local **yt-dlp** into an allowed download folder.
yt-dlp is **not** bundled — install it yourself. No torrent / *arr stack.

### Requirements

1. **yt-dlp on PATH**, or set `YT_DLP_PATH` to the absolute binary path.
2. At least one approved root via Desktop default and/or `REELCASE_ALLOWED_ROOTS`.
3. Optional `REELCASE_DOWNLOAD_DIR` — must sit under an allowed root. When unset,
   Companion uses `<first-allowed-root>/Reelcase Offline` (created if needed).
4. Restart Companion after installing yt-dlp or changing env vars.

### Behavior

- Accepts HTTPS watch/embed URLs only.
- Returns **202** with `{ ok: true, detail, path }` when the download process starts.
- Returns **501** with a clear `needs` + `hint` list when yt-dlp or a download
  folder is missing.
- Writes files with `yt-dlp --no-playlist --restrict-filenames -o <dir>/…`.
- Raises a Windows tray balloon shortly after start so finished offline jobs are noticeable.

`GET /health` reports `ytDlp`, `downloadRoot`, pack/thumb/prints roots, `trayBadge`, and capabilities.
