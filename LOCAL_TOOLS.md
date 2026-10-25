# Local tools and publication dates

## YouTube dates

Only explicit RSS, exact provider, or verified watch-page dates count as publication evidence. Legacy import/pull timestamps show **Publication date unknown** and sort after known dates. The YouTube desk offers a bounded five-video repair, and each preview has **Verify publication date**. These read the matching video's `ytInitialPlayerResponse` microformat (with a canonical-page fallback), reject relative labels and current/upcoming broadcasts, and persist the exact date. Watch-page evidence survives shallower feed/archive refreshes. Provider calendar dates are formatted in UTC to avoid showing yesterday in western time zones.

Requests reuse the existing YouTube pacing/cooldown transport. The server coalesces requests, keeps at most 256 small date entries, and caches missing dates briefly. There is no per-card request, background date polling, or automatic full-archive crawl. Date updates write one video at a time and retain source folders, comments, tags and other details.

## Stable Diffusion

The sidebar tab uses the AUTOMATIC1111 local API through Companion. It exposes a fixed allow-list of prompt/negative prompt, size, steps and seed: one image, 256–768 pixels in multiples of 64, at most 40 steps. It cannot execute scripts, install extensions, change arbitrary engine settings, proxy arbitrary hosts, or enable public sharing. Credentials use the native environment `REELCASE_SD_API_AUTH`; they never reach the browser. Prompt, negative prompt, steps, seed and size are saved under the current app user's `reelcase.studio.settings.v1` browser key, migrating the previous prompt key. Writes are debounced and unchanged values are skipped. Generated images use revocable object URLs in the active workspace until downloaded; they are not silently added to a shared gallery.

Each result retains the submitted settings, actual seed when supplied by the engine, and duration. Editing during generation cannot relabel the previous image. Reuse restores the settings for that result; failed generation keeps the prior image and download available. Invalid or fractional numeric settings block submission. Connection badges distinguish unchecked, offline, starting, generating, stopping, missing checkpoint, ready and authentication failures. An API authentication/error response never starts a second engine. Status checks remain manual.

User-started generations and the latest image now live in a bounded, account-keyed in-memory session. Navigating to another app desk keeps the request alive and returning restores the result without a second generation or polling. Each account retains one image, with at most two account sessions retained in least-recently-used order. Leaving the component revokes only its preview URL; the image blob remains in its account session until replaced, cleared or evicted. Reloading/closing the browser tab clears these sessions, so downloading is still required for a durable image. Clear image releases the cached result without deleting recipes or downloaded files. Interrupts are coalesced and any partial returned image is labeled as partial.

The studio also keeps up to eight explicitly saved image recipes under the current user's `reelcase.studio.recipes.v1` browser key. Recipes store only a name, allow-listed form settings, actual seed and checkpoint name when supplied. Images, peer IDs, credentials and native instructions are excluded. Import/export uses versioned JSON with a 64 KB input ceiling; importing never generates an image or changes the engine checkpoint. Save, remove and undo commit only on explicit actions, check current storage first, and preserve other valid recipes if one entry is damaged. Reuse loads the form for review.

Saved recipes support inline renaming with Enter to save and Escape to cancel. Rename reads the current account's latest storage, preserves all settings, and reports if another tab removed the recipe. Empty names are rejected.

Engine responses are read with a streaming byte budget (20 MB for generation; 512 KB for small API responses). Declared or chunked oversized bodies are cancelled before their full contents are buffered. This protects Companion memory when a local engine returns unexpected output.

The web development server explicitly denies static access to native runtime/model caches, local Companion configuration and downloaded media. These large trees are excluded from file watching as well. Native files remain separate from the web bundle.

`Setup-Creative-Tools.cmd` prepares the source and verified RustDesk portable binary. The separately invoked `Install-Stable-Diffusion.cmd` creates a project-local Python 3.10 environment, installs CUDA 12.8 PyTorch for this NVIDIA workstation, and downloads/hash-verifies the public SD 1.5 safetensors checkpoint. The NVIDIA 50-series installation follows AUTOMATIC1111's official development-branch compatibility instructions. No system Python/PATH or Windows service is changed. The source, runtime, caches, checkpoint and native executable are ignored under `companion/tools/`. Original project/model licenses stay with the distributions.

`Start-Stable-Diffusion.cmd` starts the engine on **127.0.0.1:7860** with its API. The tab can also start the fixed installed engine through Companion and stop only that owned process tree. Engine processes use project-local caches and disable optional analytics; public sharing and extra extensions stay disabled. Companion stays on loopback. The tab checks availability only on demand, and generation can be interrupted. Closing the browser request does not promise the GPU operation was interrupted; use its interrupt control or the native engine when needed.

## RustDesk safeguards

The Remote desktop tab launches the separate native client; it does not embed or reimplement RustDesk's encrypted transport, display capture, input control, authentication or permission system. It accepts only numeric peer IDs, requires a permission acknowledgment and typed confirmation, and uses a cryptographically random one-use approval valid for 30 seconds and bound to the browser origin and peer. No password, token or peer ID is persisted by the web feature. The bounded native activity log excludes credentials and peer IDs.

Only `--connect ID --no-server` can be launched. No file-transfer, terminal, camera, service installation, automatic startup or unattended-password command is exposed. The official portable executable's SHA-256 is verified during setup. `RUSTDESK_PATH` is an operator-only override. The web feature uses the app's existing signed-in-user state; the loopback Companion separately checks its origin allow-list. This is a local operator trust boundary, not an internet-facing remote-access server. Pasted IDs normalize spaces/hyphens. Approvals show a countdown and can be cancelled; changing the target or permission revokes the exact token without touching a newer approval or native session. A failed connection consumes the local approval as well as the server token. New preparation is blocked while the tracked launcher is active.

**Lock launch controls** revokes approvals and stops the tracked launcher. Leaving the desk locks as well. A native client can hand off to another process, so the site explicitly does not claim this proves disconnection. End the session in RustDesk to guarantee it. Permissions and interactive approval must be chosen in the native clients. No remote peer has been connected during development verification.

Hiding the browser tab revokes only an unconfirmed approval, with a token-bound keepalive request. A pending arm response arriving after the tab is hidden is revoked too. This does not stop a confirmed native handoff or claim an active session has disconnected.

## UI and credits

Reusable Card components adapt shadcn/ui's MIT-licensed structure to existing Realhub tokens. New tools, Mission plan credits, and existing shared information cards use them. Buttons and other existing Radix/shadcn components remain compatible. Mission plan lists repository links, licenses and the exact integration scope; `THIRD_PARTY_NOTICES.md` retains shadcn's license.

## Verification

`scripts/local-tools.test.mjs` covers exact/matching video dates, untrusted date rejection, merge provenance, bounded generation payloads, fixed loopback targets, invalid image handling, expiring/replayed/cross-origin remote approvals and launcher locking. Existing publication-order and performance fixtures now explicitly distinguish provider dates from import times.

Publication repair scans only until five eligible rows are found, deduplicates watch requests and skips live/upcoming streams. Per-provider failure and unavailable dates are reported separately. Unavailable dates can be retried explicitly; no missing date is guessed or overwritten, and only watch-page dates carry the verified label.

The last-check report is bounded to those five rows and lists the title, verified calendar date, previous date when changed, unavailable results and paused/failed checks. Title links open the exact YouTube video. Timestamps are normalized to the same calendar-date display used by saved cards.

Changing the selected video invalidates the previous check's UI revision. Its requested date may still finish saving to the correct original video, but late notes, reports and busy states cannot overwrite the newly selected video's controls.

`scripts/local-tools-check.mjs` exercises desktop/mobile navigation, prompts, generation/download, native handoff confirmation, lock, credits, and reload persistence. Image/native responses are isolated fixtures; real YouTube watch-page requests verified **2005-04-23** for `jNQXAC9IVRw` in development and production. The fixture browser check never opens a real remote session.

The fresh installation also passed a real end-to-end run through `scripts/stable-diffusion-live-check.mjs`: start the owned AUTOMATIC1111 engine from the tab, load the verified SD 1.5 checkpoint on the RTX 5070 Ti, generate with 20 steps and seed 42, and download a valid 512 × 512 PNG (468,046 bytes). Desktop and mobile checks reported no browser errors or horizontal overflow. Evidence is in `screenshots/stable-diffusion-live.json`, the matching desktop/mobile screenshots, and `screenshots/stable-diffusion-live.png`. The engine status reports connected, ready, idle, and owned by Companion.


Model upgrades: see [STUDIO_MODELS.md](./STUDIO_MODELS.md) for Qwen-Image 2.1, supported Hugging Face drag-and-drop imports, engine compatibility, GPU memory controls and the launcher antivirus investigation.
