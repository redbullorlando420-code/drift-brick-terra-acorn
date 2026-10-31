# Companion update checks and download authentication

## Before and after a manual update

In **Settings → Companion & local jobs**, refresh status and review running/queued downloads. Save a **before-update snapshot** before changing the service. The snapshot belongs to the signed-in workspace (or the existing local workspace when authentication is disabled). Saving is explicit; refreshing never replaces the baseline. A failed save retains the prior baseline.

Keep a separate private backup of the previous Companion files, `.local-youtube-dl.json`, and any operator-managed environment/startup configuration. These may contain local paths and must not be included in a public diagnostic. The saved summary records a configuration fingerprint for comparison; it cannot restore configuration, credentials, model files or service binaries.

Finish or cancel active work before manually updating. Refresh status afterward to compare capabilities, root counts/configuration fingerprints, approved destination availability, confirmed downloader versions and download receipt counts. An incompatible service leaves the baseline and browser catalog intact. Review missing features or approvals before using native tools; the report never performs rollback for you.

**Export redacted update report** includes only the current summary, the prior baseline, comparison notes and rollback guidance. It excludes local paths, source URLs, job titles/IDs, user identifiers, browser selections, cookies, tokens and raw tool output. Older service summaries display unsupported fields as unverified. Unknown/future saved schemas produce a clear error. One baseline is retained per workspace, under 32 KB; checking/exporting adds no automatic polling or storage writes.

Health checks do not install packages, update the downloader, change root permissions/firewall rules, create cache folders, launch apps or restart processes. The native `/health` endpoint now checks optional directories without creating them. Companion v14’s additive `inspection.schema = 1` supplies the configuration reference, configured downloader versions and approved destination booleans. Checks do not prove native applications, provider sessions or GPU workloads function.

## Download session consent

The YouTube download panel supports the default local Chrome, Edge or Firefox profile only. Custom profile names, directories and arbitrary downloader flags are not accepted. The scope is shown before submission. Selecting a browser or checking the consent box does not inspect the session; starting an explicitly authorized attempt does.

Consent resets after each accepted attempt, on close and after reload. Resuming from Settings always uses public access. The saved browser enum describes a prior attempt and grants no future authorization. To use a session again, open that video's download panel, deliberately enable sign-in and start/resume it. Session extraction stays in the local Companion; the app sends only canonical video identity and the selected enum/consent flag.

Failures have distinct guidance:

| State | Action |
| --- | --- |
| Local browser session unreadable | Check a locked database or Chromium encryption; use an eligible Firefox session if needed. |
| Expired session/provider verification | Open YouTube in the chosen browser, complete its normal sign-in/verification, then explicitly retry. |
| Restricted access | Verify account eligibility directly with YouTube. Authentication cannot grant additional access. |
| Sign-in required | Confirm playback in the provider, then opt in for an eligible account. |
| Unavailable/unsupported video | Check provider availability and use **Open YouTube** when downloading is unsupported. |
| Downloader/storage/permission failure | Repair the local tool or approved destination, keeping the existing receipt and partial files. |

The native manager classifies YouTube failure output into fixed messages and replaces progress output with numeric progress text. It does not persist raw downloader output that might include session data. Legacy saved YouTube error details are sanitized when loaded. The dialog also classifies older Companion errors without rendering arbitrary raw failure text. No credential content is included in update reports or browser storage.

## Evidence and limits

- `node --test scripts/companion-update.test.mjs scripts/youtube-download.test.mjs scripts/companion-job-recovery.test.mjs` covers safe summaries, corrupted/future baselines, comparison, owner keys, stable failure categories and native progress/error privacy.
- `node scripts/companion-recovery-http-check.mjs` checks an isolated real HTTP service, including no directory creation during health inspection.
- `node scripts/companion-update-browser-check.mjs <url> screenshots/<report>.json` exercises desktop/mobile baseline save, failed save, export, incompatible update, reload, workspace isolation and no automatic native execution.
- `node scripts/youtube-download-check.mjs <url> screenshots/<report>.json` covers session consent, failure guidance, retained identity, explicit retry/resume and local synthetic-media playback.

The browser uses controlled native responses, and process tests use simulated downloader processes. No real cookie extraction, restricted-video download, service upgrade, installation, firewall change or process restart of the user's service was performed. Real provider access remains dependent on the account and provider restrictions.
