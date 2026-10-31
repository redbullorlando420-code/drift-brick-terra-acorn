# Companion compatibility and recovery

The Settings page has a **Companion & local jobs** panel. Choose **Check Companion status** to inspect the local service and its supported features. Opening Settings does not launch native work or start a background poller. Job history displays ten receipts per page, retaining at most forty on disk.

## Compatibility contract

Companion v13 advertises `{major: 1, minor: 0}` and a bounded list of known capabilities through `/health`. Unknown fields/capabilities are ignored. An incompatible major version blocks native dispatch with a clear update message. A future additive minor version remains compatible.

Legacy v10–12 health responses without a protocol remain supported. An explicitly supplied capability list is authoritative; when absent, only the documented capabilities for that legacy version are inferred. File operations and other advertised features keep working even when newer download, Studio or receipt features are missing. Native requests share a short-lived, coalesced health probe. Missing capabilities stop dispatch before a native operation; the browser library remains available.

Capabilities describe supported operations, not configured engines, approved folders, credentials or proof that a physical integration works. Root and trusted-Origin checks still apply to the native request. Uploads also check capability before sending bytes.

An already-running older Companion continues using its loaded code. Its normal restart is required to advertise v13 and the new receipt controls. Browser tests do not restart the user's service.

## Job inventory and ownership

| Work | Owner and recovery |
| --- | --- |
| YouTube and supported offline media downloads | Companion download manager; version 2 atomic receipts, explicit resume/cancel and Settings history |
| Studio generation | Existing browser intent ledger plus engine job identity; its own reconnect/cancel controls, never automatically resubmitted |
| Model transfers and local scans | Existing tool controls; not re-enqueued by the download receipt panel |
| Tray notifications | Existing bounded notification events; not a durable execution receipt |
| Launch/file/print operations | Explicit one-shot operations; not replayed as downloads |

## Download receipt lifecycle

- One active process, at most eight pending jobs and forty retained receipts. Progress remains in memory between durable state transitions; every progress tick does not write the manifest.
- Queued and running receipts are persisted before native execution. A failed write or atomic rename prevents new execution, reports the storage problem and retains the previous on-disk manifest and in-memory history. Correct the destination storage and restart Companion before starting or resuming downloads.
- After restart, previously queued/running work is **Interrupted**, with no automatic process start. Resume retains the receipt ID and partial folder, increments the attempt and uses the downloader's continuation support.
- A completed receipt is reused only while its nonempty media file remains in its approved folder. Repeated enqueue/resume does not repeat completed work. The video's explicit **Download again** action requests a fresh download.
- Cancelled/interrupted processes cannot become complete from a late successful exit. Resume/cancel are deliberate actions; cancelling retains existing files.
- Settings resumes with public access. A video requiring account access must use that video's Download panel and fresh browser sign-in consent. Prior browser selections never grant new consent after reload/restart.
- Public receipts omit download URLs and unknown fields. Cookie/authorization output is filtered; browser cookie contents and secret headers are not persisted. Offline URLs reject embedded credentials. An unreadable, oversized or future-version manifest is preserved and blocks new jobs with actionable guidance.

## Repeatable evidence

- `node --test scripts/companion-protocol.test.mjs scripts/companion-job-recovery.test.mjs scripts/youtube-download.test.mjs scripts/download-media.test.mjs scripts/verified-download.test.mjs`
- `node scripts/companion-recovery-http-check.mjs` starts and stops only its own disposable service, with an isolated approved directory and no configured downloader. It verifies real HTTP negotiation, restart interruption, Origin rejection and persisted cancellation.
- `node scripts/companion-recovery-browser-check.mjs <url> screenshots/<report>.json` exercises older/incompatible/current protocols, supported legacy shortcuts, bounded history, explicit recovery, reload and malformed receipts in desktop/mobile browser profiles.
- `node scripts/youtube-download-check.mjs <url> screenshots/<report>.json` exercises download/retry/cancel, browser-consent reset, same-receipt resume, local decoding/seeking, preview/player actions and no polling after close.
- `node scripts/studio-readiness-batch-browser-check.mjs <url> screenshots/<report>.json` guards existing Studio workflows behind negotiated capability checks.

Browser native responses and process execution are fixtures. No real provider download, browser-cookie extraction, GPU generation, model installation or native application launch is claimed. Root revocation during in-flight operations remains next-073; physical integration and long-run provider checks remain separate open milestones.
