# Realhub Companion (v10)

## YouTube browser sign-in and saved playback

Run `Setup-YouTube-Downloads.cmd` to install/update the official checksum-verified
yt-dlp binary, then start Companion. Existing youtube-dl installations remain a
fallback for ordinary downloads. The setup script never reads a browser session.

When a YouTube embed asks for age verification or sign-in, choose **Use browser
sign-in** in the player. In the download panel, explicitly enable **Use my
signed-in browser for this download**, choose Chrome, Edge or Firefox, and start
the download. Your account must already be able to watch the video on YouTube.
This option resets when the panel closes. No cookies are exported to the app,
localStorage, the download manifest or a cookie file. A browser database may be
locked, and Chromium encryption can prevent extraction; the panel explains
retrying with a signed-in Firefox session. YouTube may still reject access.

After completion, **Watch saved video** plays the local copy with native controls
and seeking. The companion serves only completed YouTube job files, by job ID,
under the approved download root. Range/HEAD requests retain the loopback and
trusted-Origin checks. Arbitrary paths, incomplete jobs and cookie files are not
served. The web player cannot inspect the age-restriction text inside YouTube's
cross-origin iframe; the sign-in fallback stays visible while viewing YouTube.
**Open on YouTube** remains available. No automatic authentication or polling is
added to cards or playback; the existing open-dialog job poll stops on close.

References: [yt-dlp cookies FAQ](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp),
[JavaScript runtime setup](https://github.com/yt-dlp/yt-dlp/wiki/EJS).

## Start it on Windows

The **Realhub** desktop shortcut now starts both the app server and Companion,
waits for readiness and opens the library. It reuses an already-running Companion.
`Start-Realhub.cmd` in the main app folder provides the same combined startup.
The combined launcher keeps services in the background; closing the browser
does not stop them. Its startup logs are in the main app's `.grok/desktop-*.log`.

For a standalone Companion console:

1. Close any older Companion window.
2. In the main Realhub folder, double-click `Start-Realhub-Companion.cmd`.
3. If Windows asks, choose **More info → Run anyway** only if the file is in
   your own Realhub folder; it is a local script, not a downloaded installer.
4. Keep the small “Realhub Companion” window open. The line saying it is
   listening means it is ready.
5. In Realhub, go to **Settings → Diagnostics**, enable diagnostics, and use
   **Check companion**. A ready response reports the version and approved roots.

The companion is optional; it is only needed for approved desktop shortcut
launching, Steam/Epic cataloging under allowed roots, library-pack disk
export/import, print file bridge, thumb/poster disk cache, source health
checks, Explorer changes, Roku discovery, optional offline saves, and
Windows auto-start / job balloons.

This optional loopback service is the native boundary for desktop launching and local source verification. It binds only to `127.0.0.1`, checks the browser origin, and permits launches only from explicitly configured game roots. It does not scan disks broadly, accept LAN requests, or transmit media off-machine.

The Windows Desktop is included as a guarded default launch location. Add other game roots with `REELCASE_ALLOWED_ROOTS`, separated by semicolons.
The `REELCASE_*` environment variables and existing disk folder names remain valid so previous Companion setups keep their data and settings.

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


For streamed Hugging Face model imports and the isolated Qwen-Image 2.1 engine, see [STUDIO_MODELS.md](../STUDIO_MODELS.md).


## Future racing adapter boundary

Stream Signal includes an offline version-1 strategy/observation/acknowledgement validator. See [the local racing adapter contract](../docs/LOCAL_RACING_ADAPTER_CONTRACT.md) for transport pairing, exact-origin checks, expiry, fresh observations, staged conditions and emergency-stop requirements. Companion does not currently implement this adapter, receive game commands or control iRacing Arcade. The exported trust flags are synthetic fixtures; they cannot authenticate a service.


## Image model compatibility preflight

The studio now reviews bounded safetensors headers before selecting or generating with a model. Both AUTOMATIC1111 and Qwen generation recheck compatibility in Companion. Restart Companion after updating these source files to load the new `/studio/models/preflight` endpoint and `modelPreflight` status flag. This does not install an engine or a model. See [studio readiness and recovery](../docs/STUDIO_MODEL_READINESS.md) for supported structures, component requirements, saved model notes, job interruption and verification limits. Existing engines remain explicitly started by the user.

### Recipe parameter provenance

The updated studio bridge pins its supported sampler profile and returns bounded parameter observations for recipe version 2. Restart Companion to activate this source update. Saved recipes review exact model choices and warn about missing/unmatched evidence; no automatic model substitution or generation occurs. See [Recipes and keyboard workflow](../docs/RECIPES_AND_KEYBOARD.md).
