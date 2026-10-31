# Realhub desktop start and stop

The desktop has two direct Node.js shortcuts: **Realhub** starts or reuses the local website and Companion; **Stop Realhub** stops the verified services for this installation. A successful stop closes its small console automatically. Errors remain visible. Closing a browser tab does not stop the services.

Save edits before stopping. Server connections and active work are interrupted. Saved libraries, downloaded files, installed models and permission choices are not deleted. New Companion processes accept a local OS named-pipe cleanup request first, reusing existing checkpoint, permission, root-lease, print, download and owned-engine shutdown handling. Independently started engines and native remote session handoffs can remain open; a launcher exit cannot prove disconnection.

## Ownership and fallback

The stop command uses Windows WMI to identify Node processes by their exact main script in this installation. The website must be this installation’s Vite development entry with the normal host and port arguments. Companion must use this installation’s absolute main-script path; an older relative Companion entry additionally needs its verified launcher parent. Build, preview, Codex, unrelated Node apps, other installations and arbitrary port holders are not selected.

Immediately before termination, the command checks the PID, creation timestamp and command again. The native termination bridge independently rechecks the creation timestamp. A replaced or newly restarted process is not killed from an older observation. After a stop request, the command checks whether verified service processes remain. A second click with nothing running is harmless. If WMI is blocked or identity is unavailable, the command fails closed and leaves an error visible.

An older Companion without the OS control channel, or a Companion that misses the seven-second cleanup deadline, uses a disclosed force-stop fallback. Review interrupted job receipts after restarting. The HTTP website has no shutdown endpoint. The new scripts use ordinary Node.js and a readable Windows Script Host WMI bridge; they do not run PowerShell, encoded commands, broad Node kills, or a kill-by-port command.

## Files and installation

- `Start-Realhub.cmd` and `scripts/start-desktop.mjs` remain the launch entry points. New launches use an absolute Companion path so ownership can be proven.
- `Stop-Realhub.cmd` and `scripts/stop-desktop.mjs` are the stop entry points. `--status` is read-only; `--no-wait` is intended for scripted checks.
- `scripts/install-desktop-shortcut.vbs` installs both shortcuts, refusing to overwrite a matching-name shortcut belonging to another installation. The PowerShell installer remains a compatibility wrapper only; neither installed shortcut invokes PowerShell.

Companion auto-start preferences are preserved. A Windows login can start it again if auto-start remains enabled. The desktop control recognizes the normal Vite development arguments and Companion processes from this installation. A custom-port Companion may use the force fallback; differently configured website servers require their own controls.

## Readiness inventory

Settings and Mission Plan offer **Review readiness**. Opening the inventory does no native setup and sends no status requests. **Check local readiness** explicitly reads compatible Companion capabilities and four local status endpoints. It starts no engine, transfer, scan, account connection, remote peer or room. Requests are bounded and there is no polling or private snapshot persistence.

Each feature separates implemented app behavior, current configuration and external verification. Installed models, engine metadata, downloader availability and a RustDesk launcher do not prove generation, authenticated download, playback or a native session. Stream Signal remains manual sharing; Chat Plays remains a simulator without connected live chat or installed game control. Configuration snapshots reset when the panel unmounts or the page reloads. Milestone completion never changes from these probes.

The public `feature-readiness-evidence.json` contains implementation scope and verification references only. It excludes local probe results, paths, peers, credentials and account data. Actual native/device checks remain separate in the milestone ledger.
