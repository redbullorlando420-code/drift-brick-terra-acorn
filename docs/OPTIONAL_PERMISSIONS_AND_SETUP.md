# Optional permissions and contextual setup

Milestones next-092 and next-097. Companion source v18, protocol 1. Existing library content, root grants and native services are preserved.

## Settings and scope

Settings → Optional permissions lists local model weight transfers, local browser-session access, browser image analysis and Stream Signal draft composers. Each row explains its scope and revocation effects. Grants allow specific actions; they do not connect accounts, verify a model/engine, read a session immediately or publish content. Native choices apply to the Companion computer and all its approved app origins. Browser choices apply to this browser profile, including its tabs. Existing configured-folder approvals stay in Companion folder access, with the independent root identity/generation guards already delivered.

Model transfers require the v18 capability and an explicit host grant. Inspecting model metadata remains an explicit read-only request; downloading/importing weights needs permission. Engine installation/startup is a separate explicit action. Existing models, prompts and recipes are retained on revoke. Native model publication uses exclusive hard links to new names; unsupported filesystems fail without overwriting existing weights.

Browser-session permission is an additional gate. Every authenticated download still requires Use my signed-in browser and a supported browser choice for that attempt. No browser session is reused after restart. Ordinary downloads remain available without this grant. Cookies stay inside the local downloader. The ledger contains no cookie/token, URL, file path, prompt, title or image.

Local image analysis may download its browser model and classify selected images locally. Revocation stops subsequent inference dispatch and discards pending results. An already in-flight model download or inference may finish; cached models and existing reviewed labels remain. No new remote assistant access was added: AI guide uses existing local title/tag matching, remote AI and automatic publication remain unconfigured. Draft composer permission controls opening an X draft containing prepared text; plain platform/help links, Copy, file export and manual Mark shared remain separate. Revocation cannot close an already-open external page or retract published content.

## Enforcement and recovery

The private native .local-capability-consent.json is bounded to two known scopes and at most 16 KiB. Changes require the current policy revision, are persisted before granting access and increment the affected generation. Grants default off. Corrupt/future policy data is preserved and blocks optional access. Held request bodies, delayed model metadata responses, queued/active authenticated jobs and model publication recheck policy generation. Revocation aborts affected leases; regrant never resurrects an older lease. Restart restores choices and never replays pending work.

A failed native grant is denied. A failed native revocation still blocks the affected scope for the running process and cancels its leases, and exposes Retry revocation until saving succeeds. Do not close Companion while this retry remains pending: the old disk policy can otherwise return on restart. Native process termination is requested, not guaranteed instantaneous. Bytes already received cannot be undone; partial media files remain.

Browser choices use a bounded versioned record with per-scope generations and a storage-event invalidation. Unreadable or future records are preserved; no action can grant over them. A live action rechecks storage before admitting its result, even if a storage event was delayed. A failed save blocks optional actions for the current visit and reports that a reload can restore the previous saved choice; retry explicitly before closing. This is an app consent boundary, not an OS sandbox or protection from arbitrary same-origin script execution.

## Your setup

Home derives a small checklist from hydrated catalog/source counts and reviewed choices, without walking the media graph or mounting shelves. Saved metadata is not presented as verified playback or a connected provider. Empty profiles get local-file, source, permission and optional Companion choices. Returning populated/saved-source profiles start collapsed. Dismiss/resume and reviewed steps persist in a separate bounded record, without changing catalog metadata.

Settings can resume setup. The Companion check is explicit and reads health only; untested devices remain Not checked until then, failed probes remain unavailable, and compatible services without approved folders say so. Navigation, reviewing a step, dismissing setup and checking readiness start no import, scan, model download, cookie extraction or account connection. Choosing local files uses the existing user-initiated folder picker. Browser-local use remains available offline.

## Verification boundaries

Focused tests exercise stale generations, revoke/regrant, malformed/future data, save failures, bounds, held model requests, native queued/active cancellation and setup parsing/readiness. Copied-service HTTP checks use real Windows filesystem and HTTP with controlled metadata/native processes. Desktop and touch-mobile browser checks use isolated profiles and synthetic native responses. No user Companion was upgraded/restarted and no real model, provider session, paid service, native engine or RustDesk peer was invoked. See MILESTONE_VERIFICATION.md for exact artifacts.
