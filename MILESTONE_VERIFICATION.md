# Milestone verification ledger

## Revision 77 — cross-tab catalog leases and Stream Signal revisions

Date: 2026-10-30. Completed **next-006** and **next-087** together. Default plan: **288 / 306 complete**, including **86 / 100 next-level milestones**. Revision 77 promotes only this pair once; later manual reopens, custom instructions and earlier external checks remain intact. Fourteen next-level milestones and four earlier external checks remain open.

### Baseline and resulting behavior

- Catalog journal transactions were individually atomic, but separate tabs had no durable ownership protocol for longer imports, cleanup and recovery. The shared version-1 writer lease now records scope, owner, generation, revision, expiry and an atomic dirty receipt in the existing remote-cache store. The production lease lasts 15 seconds and renews every five seconds only while active. Same-tab nested work shares ownership until all work settles; a second tab receives an explicit busy outcome. Unknown/future lease records are retained and block writes.
- Every protected data transaction checks ownership/generation/expiry in that same IndexedDB transaction. Directory insertion/deletion, folder replacement/clear, local append, remote snapshot/removal, creator coverage repair, journal prepare/apply, cleanup and paired manual metadata participate. An expired old owner cannot commit or release a newer owner's generation. Accepted journal operations retain existing idempotent recovery and strict-durability requests. A dirty receipt lets the next owner recover committed work whose final notification was lost when a renderer closed.
- Writers broadcast bounded revision notices, never whole catalogs or draft text. Readers ignore duplicate/older notices, coalesce updates and use existing paged/yielded disk readers under a non-mutating lease. Focus/visibility reads one lease record and avoids an unchanged catalog reload. There is no idle renewal or polling loop. Visible status explains another tab's ownership and offers safe refresh; ordinary local saves do not flash an extra status panel. Channels/timers are closed on teardown without reopening disposed instances.
- Reader rebase preserves existing private/provider boundaries and manual field clocks, waits for the current local scan, reflects committed rows/removals and does not rewrite broad preferences, follows or feedback. Previously unseen local files remain deferred until reload restores their source privacy/permission metadata; the UI explains this instead of inferring a new source is public.
- Stream Signal previously saved whole pending pack documents without revision checks. Packs/profile setup now use expected-revision checks in the same fenced write transaction. Stable pack IDs, immutable original channel links, per-platform counters and twelve compact prior platform states provide reviewable edit history. No-op saves avoid rewriting the document/history.
- A conflicting editor retains its local text, compares it against the newer saved version and offers Keep current saved version or Restore my changes as a new revision. Field-wise rebase preserves newer text and manual checklist marks on platforms the local editor did not change. A legacy recovery copy with no baseline is explicitly labeled as a full snapshot choice. A history restore creates another revision of one platform's text/manual checklist state. Copy, composer/platform links, export and recovery never mark anything published.
- Pending edits use a bounded per-editor mirror and per-tab pointer. Replay uses the normal revision checks; acknowledgement removes only an exact unchanged captured mirror. Reload preserves unresolved conflicts, and unmount flushes correctly rebase newly pending in-visit edits after an earlier save completes. Existing eight-pack archive paging, fast selection, user namespaces, manual sharing and text/Story exports are preserved.

### Files and scope

- New protocol: src/lib/writer-lease.ts. Catalog integration: src/lib/videos/catalog-mutations.ts, persist.ts, store.ts; src/components/library/catalog-writer-status.tsx and library-app.tsx.
- Announcement integration: src/lib/stream-signal-revisions.ts, stream-signal.ts; src/components/library/use-stream-signal.ts and stream-signal-section.tsx.
- Policy and recovery details: docs/WRITER_LEASE_AND_SIGNAL_REVISIONS.md. Roadmap sources/tests and generated NEXT_LEVEL_MILESTONES.md updated to revision 77.
- Broad preference/follow/activity snapshots and unrelated tool documents retain their existing independent persistence. This is not a global transaction across all personal state or an atomic interrupted whole-library generation switch. Whole-library recovery/rollback, tombstones and portable profile milestones remain open. Updated code is required in each tab; an older running build cannot enforce a protocol it never implemented.

### Verification

- npm run build and npm run typecheck passed on final runtime source. Logs: screenshots/milestone77-build.txt and .grok/milestone77-typecheck.txt. One initial Windows generated-output EPERM was resolved by an approved normal build retry; no data reset or dependency change was needed. No DATABASE_URL was configured, so the existing build migration script skipped the external database normally.
- **190 focused unit/store tests passed**: 163 in screenshots/milestone77-tests.txt and 27 selected real-store regressions in screenshots/milestone77-store-tests.txt. Coverage includes writer record guards; legacy pack/profile migration; independent platform revisions; changed-field rebase; bounded history; manual checklist undo/restore; revision-77 migration/manual preservation; activity, follows, saved edits and startup; journal/control recovery; sparse metadata; million-entry merge/restore yielding; private/saved shelf boundaries; Twitch aliases; tags/locks/category protection; cleanup and bounded admission. This is a focused suite, not a claim that every repository test was run.
- scripts/writer-signal-revisions-browser-check.mjs passed on dev and production desktop 1440x1000 / touch-mobile 390x844 profiles. Reports: screenshots/writer-signal-dev.json and screenshots/writer-signal-production.json. Real same-origin tabs verified busy ownership, an actual import API holding the lease while cleanup/retry is refused, stale owner fencing, refusing an old owner's release, tab closure after data commit, dirty-receipt catch-up, compact notices, mounted reader rebase and no idle renewal activity. Short 600 ms leases are used for crash fixtures; the production 15-second default is separately asserted.
- Two editors verified conflict retention, keep-current, restore-mine, preservation of newer Facebook text/manual mark, clean reader updates, unresolved conflict replay after reload, and text/manual checklist restoration from history. Previously unseen synthetic local files remained excluded until saved privacy/permissions restore.
- Each scale profile retained **100,001 synthetic catalog rows**. Reads used **197 bounded pages, maximum 512 records, zero unbounded catalog getAll calls**. Dev desktop/mobile Home navigation took **88 / 149 ms** with maximum sampled timer gaps **68.8 / 56.8 ms**; production took **31 / 70 ms** with gaps **19.8 / 24.7 ms**. These are fixture measurements on this host, not physical-phone or long-duration memory guarantees. A later mobile-only layout refinement reran focused visual/functional gates; the catalog logic was unchanged.
- Focused ownership/history desktop/mobile visual gates passed on final source/build: screenshots/writer-signal-visual-dev.json and screenshots/writer-signal-visual-production.json. The mobile ownership message/action stack was visually checked after refinement; history, comparison and manual status controls were inspected on desktop/mobile.
- The full existing Stream Signal browser workflow passed on dev/production: screenshots/milestone77-signal-dev.json and screenshots/milestone77-signal-production.json. Generation, editing, clipboard, intercepted platform/composer handoffs, both stream links, plain text export, exact 1080x1920 PNG export, navigation/reload, quota retry, user isolation and simulator controls passed. No actual platform post was sent.
- Milestone browser gates passed on dev/production desktop/mobile: screenshots/milestone77-mission-dev.json and screenshots/milestone77-mission-production.json. Counts, revision promotion, exact remaining-page boundary, filters, full Markdown/CSV exports, clipboard fallback and manual/custom statuses passed. The pagination fixture now correctly handles the remaining active queue fitting on one page.
- Home smoke passed on final dev/production desktop/mobile: screenshots/milestone77-home-dev.json and screenshots/milestone77-home-production.json. Production divergesFromBaseline:false; no console, hydration, overflow, branding or auth warnings. Home pairs and the new ownership/conflict/history screens were visually inspected. Scoped git diff --check passed; all runtime source timestamps precede the final build.

### Remaining checks and operational limits

- Fixtures used isolated browser profiles/databases and intercepted Companion/platform requests. No real account login, publication, provider pull, native file access, GPU job, game control or remote desktop session was performed. There is no new external integration to connect.
- Browser viewport/touch automation is not physical Android/iOS verification. Renderer closure/expiry and transaction interruption are not a physical power-loss/eviction or eight-hour soak test. Those milestones remain open, as do complete restore generation switching and destructive tombstone/rollback workflows.
- Only the owned temporary production QA preview was stopped afterward. The existing app server was left running. No real user library, personal draft workspace, native service, desktop shortcut or model files were reset or used as a fixture.

---

## Revision 76 — Twitch media aliases and generated image retention

Date: 2026-10-30. Completed **next-036** and **next-086** together. Default plan: **286 / 306 complete**, including **84 / 100 next-level milestones**. Revision 76 promotes only this pair once; later manual reopens, custom instructions and external verification states remain intact. Sixteen next-level milestones and four earlier external checks remain open.

### Baseline and resulting behavior

- Watch Together recognized several Twitch routes while catalog admission mainly matched internal card IDs. A shared typed identity parser now unifies public clip, channel-clip, embed and VOD routes across imports, bounded entry admission, archive sweeps, catalog recovery and room descriptors. Clip slugs remain case-sensitive; live logins are case-insensitive. Titles, thumbnails and display names are never identity evidence. Conflicting/invalid routes are not treated as aliases.
- Public clip responses retain a versioned numeric-ID/slug pair. A numeric legacy clip ID acquires a playable slug only after that evidence; missing-slug API rows no longer invent a clip route. Merging retains the saved card ID/primary source and unions source memberships, leaving personal feedback dictionaries intact. Older held pages may add verified aliases/memberships without rolling back fresh titles, views or observation clocks. No creator rename, broad personal-feedback migration or destructive rewrite of legacy raw rows is claimed.
- The studio had one in-memory image and downloadable files but no explicit saved-PNG workflow. Image storage now separates the latest temporary preview, small job receipts and explicitly saved PNGs. Temporary previews are capped at one / 10 MiB. A selected saved viewer holds at most one additional / 10 MiB image, rather than opening every saved image into a gallery.
- Save image in app commits PNG + allowlisted settings/provenance together, scoped to the current app user in the existing IndexedDB activity store. Its 32-image / 128 MiB per-user budget is checked inside the write transaction, including concurrent saves. Quota failures roll back both records, duplicate saves are idempotent, future/corrupt ledgers are retained and rejected, and saved work is never automatically evicted.
- Preview cleanup has review/cancel/confirmation, a five-minute expiry and stale-result protection. Saved PNGs, recipes, job receipts and downloaded files are excluded. Optional clear-on-navigation also releases results completed after leaving. Existing keep-latest-between-tabs behavior remains the default. Object URLs are revoked on replacement, close and navigation. Failed engine responses retain the prior completed preview.
- Saved PNGs and recipes survive cleanup/reload. Missing PNG bytes leave an identifiable receipt and reusable parameters. Explicit saved-image removal has a scoped confirmation and preserves separate recipes/downloaded files. No filesystem scan, engine installation, provider call, automatic cleanup or polling was added.

### Files and guidance

- Identity: src/lib/videos/twitch-identity.ts, catalog-identity.ts, remote-merge.ts, entry-limits.ts, types.ts, store.ts; src/lib/remote/api.ts; src/lib/multiplayer/room-media.ts.
- Studio: src/lib/studio-outputs.ts, studio-session.ts; src/lib/videos/persist.ts; src/components/library/studio-output-library.tsx, stable-diffusion-section.tsx.
- Full policy and limits: docs/TWITCH_IDENTITIES_AND_IMAGE_RETENTION.md. Roadmap source/briefs and generated NEXT_LEVEL_MILESTONES.md updated to revision 76.

### Verification

- npm run build and npm run typecheck passed on final source. Logs: screenshots/milestone76-build.txt and .grok/milestone76-typecheck.txt. No configured DATABASE_URL was present; the existing build migration script skipped the external database normally.
- **169 focused unit/regression tests passed**: 160 in screenshots/milestone76-tests.txt; two actual store-action tests in screenshots/milestone76-store-tests.txt; seven persistence regressions in screenshots/milestone76-persistence-tests.txt. Coverage includes every merge variant, public URL forms, case/type distinctions, verified numeric aliases, delayed pages, canonical durable writes, personal tags/locks/categories/ratings/history/progress, 100 sequential generations, expired/cancelled/stale cleanup plans and oversized responses. Existing million-row merge/restore yielding tests passed. This is a focused suite, not a claim that every repository test was run.
- scripts/identity-output-batch-browser-check.mjs passed on final dev and production builds in fresh desktop 1440x1000 and touch-mobile 390x844 profiles. Reports: screenshots/identity-output-dev.json and screenshots/identity-output-production.json. Actual IndexedDB fixtures verified atomic PNG/index quota rollback, independent account namespaces, concurrent final-slot admission, count cap, synthetic byte-budget refusal, duplicate saves, future-version preservation, missing-byte receipts and explicitly scoped removal.
- Rendered UI checks exercised generation, save PNG/settings, separate recipe save, preview/cancel/confirm cleanup, download, quota failure/retry, retention preference, navigation buffer/URL release, reload without resubmission, reuse of settings and missing-byte warnings. Shared Twitch routes produced one persistent card, three source memberships and one room identity. One hundred synthetic generations retained one preview and eight metadata-only jobs per fixture.
- Mission browser checks passed on dev/production desktop/mobile: screenshots/milestone76-mission-dev.json and screenshots/milestone76-mission-production.json. Counts, revision promotion, paging, filters, complete Markdown/CSV exports, clipboard fallback and preservation of manual/custom states passed.
- Home smoke passed on dev/production desktop/mobile: screenshots/milestone76-home-dev.json and screenshots/milestone76-home-production.json. Production divergesFromBaseline:false; no console, hydration, overflow, branding or auth warnings. Both Home screenshot pairs and final feature desktop/mobile screenshots were visually inspected. Scoped git diff --check passed.

### Limits and remaining work

- Browser checks use isolated synthetic PNGs and a mocked Companion; no real GPU image job, provider request, model download or physical-phone verification was performed. The 128 MiB ceiling test uses synthetic ledger receipts, not a physical disk-capacity or eviction measurement. Native generation and long-session/provider verification remain separate.
- Saved images are local to this browser/account namespace, not synchronized or included in the media library pack. Browser eviction can remove bytes; download important work. Downloaded external files are never inspected or silently pruned.
- Full catalog cross-tab leases, whole-library atomic restore, tombstones, creator-rename migration, long-duration soak and release rollback milestones remain open. This pair does not claim those foundations are complete.
- Only the owned production QA preview was stopped afterward; the existing app server was left running. No real profile, desktop shortcut, Companion service, model files or external account connection was changed by the checks.

---

## Revision 75 — catalog operation recovery and storage pressure workflow

Date: 2026-10-30. Completed **next-001** and **next-002** together. Default plan: **284 / 306 complete**, including **82 / 100 next-level milestones**. Revision 75 promotes only this pair once; later manual reopens, custom notes and external integration states remain intact. Eighteen next-level milestones and four earlier external checks remain open.

### Baseline and final behavior

- Provider cards, automatic tags and preference snapshots previously had separate persistence boundaries; a manual edit mirrored tags and locks in separate keys. Interrupted writes had no shared bounded replay/commit outcome. Version 1 bounded catalog deltas now stage in the existing remote cache and apply rows, available tag metadata, pending deletion and commit marker atomically. Startup drains pending operations before catalog mutations; unknown versions are preserved and block conflicting writes. Strict IndexedDB durability is requested where supported. No whole-catalog copy or new polling loop was introduced.
- Manual tags, provenance, locks and categories share one per-title durable record plus a bounded combined mirror. A lost acknowledgement replays idempotently, a full mirror can use IndexedDB, and simultaneous storage refusal keeps bounded edits pending in the visit for explicit retry. Per-field clocks preserve category ownership through later automatic tag updates and keep later edits ahead of an older wall clock. Sparse category preferences now use clone-safe encoding.
- Existing atomic cleanup remains atomic; an interrupted deletion rolls back instead of being replayed later after the owner may have saved a title. Local folder replacement/deletion and remote removals wait for pending recovery. Provider detail and live-room admissions pass known paired tag metadata.
- Settings now includes Storage and save recovery. A read-only preview selects at most 256 artwork receipts, shows protected store counts, distinguishes missing size measurements, supports cancel/expiry, and clears only unchanged selected browser artwork after confirmation. A partial failure reports only committed cache removals. Personal records, pending recovery, original media and native caches are untouched.
- Explicit retry waits for initial catalog/personal recovery, drains accepted operations, retries preference slices and additively saves visible remote cards without advancing source metadata or deleting a legacy snapshot. Imports rejected before acceptance may need repeating. Repeated save-error notifications use one toast rather than stacking.

### Validation

- `npm run build` and `npm run typecheck` passed. Logs: `screenshots/catalog-recovery-build.txt`, `.grok/catalog-recovery-typecheck.txt`.
- **121 focused unit/regression tests passed** naturally, covering version and payload guards, control generations, field clock merging, explicit slice retry, sparse category cloning, activity, shelves, follows, startup, catalog restore, immutable ledgers and revision-75 migration. Log: `screenshots/catalog-recovery-tests.txt`.
- **26 additional focused store tests passed** naturally for metadata, manual signals, partial pulls, cleanup protection, entry caps, first-page failure and retained clips. Log: `screenshots/catalog-recovery-store-tests.txt`. Command uses the documented positive test-name selection for changed paths; no full-repository test-suite pass is claimed. An earlier unfiltered legacy pull run stalled in its clock-controlled rotation case and was stopped; the new actual-IndexedDB 100k recovery check is separate.
- Actual IndexedDB browser injection passed before prepare, after durable prepare, during card apply, during enrichment apply, at commit and after manual commit before acknowledgement. Prior saved rows remain readable on quota failures; prepared rows recover once. Future journals remain preserved and block new writes. Full-mirror fallback, both-stores-full retry, independent category clocks and a backward wall clock pass.
- Isolated desktop (1440×1000) and touch-mobile (390×844) development/production workflows passed real reload, another preference save after recovery, preview/cancel, changed-artwork skip, expiration, unavailable estimates, partial quota cleanup, protected personal records and explicit retry. All consoles are clean and there is no horizontal overflow. Artifacts: `screenshots/catalog-recovery-dev.json`, `screenshots/catalog-recovery-production.json`.
- Each profile includes **100,000 synthetic saved rows plus one recovered row**. Pending recovery performs **zero full-catalog scans**, staged chunks stay at **64 rows**, the largest sampled event-loop gap was **34 ms**, and Settings controls were ready within **544 ms** while a 100k read ran (declared budget: 2,000 ms). These are controlled local browser observations, not physical-phone benchmarks.
- Desktop/mobile Mission queue checks passed on development and production: 100 next-level entries with 82 verified defaults, bounded 20-card pages, working brief copy/fallback and Markdown/CSV export, and preserved manual/custom states. Artifacts: `screenshots/catalog-recovery-mission-dev.json`, `screenshots/catalog-recovery-mission-production.json`.
- Home desktop/mobile development and production smoke passed hydration, console, overflow, branding/auth and baseline checks. Artifacts: `screenshots/catalog-recovery-home-dev.json`, `screenshots/catalog-recovery-home-production.json`. Feature and Home screenshots were visually inspected in desktop/mobile pairs.

### Scope and remaining checks

The durable acceptance boundary is successful journal preparation. Unaccepted inputs cannot be guaranteed across page closure; local imports may need repeating after storage becomes available. Follow observations retain their independent ledger, and this pair does not claim an atomic generation for every preference, backup, source checkpoint or profile. Cross-tab leasing, atomic whole-library restore, deletion tombstones and profile namespaces remain their own open milestones. Browser eviction, physical power loss, real-provider throughput, physical devices and the eight-hour soak are not asserted by injected failures and emulated mobile checks. No real user library, external account, native session or provider was changed in testing. See `docs/CATALOG_DURABILITY_AND_STORAGE.md`.

---

## Revision 74 — desktop shutdown controls and feature readiness

Date: 2026-10-30. Completed **next-098** and refined the existing **Desktop companion** milestone with the requested one-click shutdown workflow. Default plan: **282 / 306 complete**, including **80 / 100 next-level milestones**. Revision 74 promotes only next-098 once; manual reopens, custom notes and external verification remain unchanged. Twenty next-level milestones and four earlier external checks remain open.

### Delivered

- Installed **Stop Realhub.lnk** beside **Realhub.lnk** on the actual Windows desktop. Both target Node directly, with the exact installation directory and no PowerShell command. Shortcut target readback: `screenshots/desktop-shortcuts.json`. The actual user app was not stopped or restarted for this check.
- The stop command selects the exact own Vite development entry and Companion main script, rechecks creation time and command before termination, and leaves foreign/replaced processes alone. Companion receives an OS named-pipe cleanup request first; older/unresponsive services use a disclosed, bounded fallback. Repeated stop is harmless. The launch command now supplies an absolute Companion entry and uses one-shot lock cleanup. No HTTP shutdown endpoint, kill-by-port or broad Node termination was added.
- Settings and Mission Plan now offer a collapsed readiness inventory for library, downloads, AUTOMATIC1111, Qwen, RustDesk, manual Stream Signal, simulated Chat Plays and Watch Together. Opening it does no native probing. An explicit check reads compatible capabilities and bounded local GET status only, without polling, private snapshot storage, setup or milestone mutation.
- Implementation, configuration and external verification remain separate. Installed models and engine metadata do not prove generation; a RustDesk launcher does not prove authentication/session/disconnection; manual drafts do not prove publication; simulated ballots do not imply live chat or installed game control. Missing evidence is explicitly unverified. Linked public evidence contains implementation references, never private probe results.

### Validation

- `npm run build` and `npm run typecheck` passed. Logs: `screenshots/desktop-readiness-build.txt`, `.grok/desktop-readiness-typecheck.txt`.
- **227 focused tests passed** with concurrency 2, including exact process/path/port matching, PID reuse, replaced command, foreign-process preservation, failed stops, repeated stop, real local IPC stale-token rejection, inventory dimensions, permissions, models, downloads, folder access, print transactions, protocol and roadmap migration. Log: `screenshots/desktop-readiness-tests.txt`.
- Real Windows process/WMI/named-pipe check passed in a disposable installation containing spaces and non-ASCII characters. Companion wrote its checkpoint before exit; the exact server stopped; an unrelated Node process survived; repeated stop and older-service fallback passed. Actual user server PIDs were unchanged. Artifact: `screenshots/desktop-stop-windows.json`.
- Copied actual Companion HTTP checks passed for model checkpoint/restart/hash recovery, remote approval expiry/replay/literal arguments, consent revocation and root identity. Logs: `screenshots/desktop-readiness-http.txt`, `screenshots/desktop-readiness-consent-http.txt`, `screenshots/desktop-readiness-root-http.txt`. Native processes/provider responses are fixtures; no real peer, weights or account was used.
- Isolated Chrome desktop (1440×1000) and touch-mobile (390×844) interactions passed on development and production: zero opening probes, explicit bounded GET-only checks, unsupported/incompatible/error states, generation/session honesty, linked evidence, reload reset, source navigation, 44px controls, no overflow and clean console. Artifacts: `screenshots/feature-readiness-dev.json`, `screenshots/feature-readiness-production.json`. Both screenshot pairs were visually inspected.
- Mission queue migration/export/manual-state checks passed in both desktop/mobile development and production profiles: 100 next-level entries, 80 verified defaults, bounded 20-card pages, complete copy fallback, full Markdown/CSV exports and preserved custom/reopened states. Artifacts: `screenshots/desktop-readiness-mission-dev.json`, `screenshots/desktop-readiness-mission-production.json`.
- Home development/production desktop/mobile smoke passed with hydration, clean console, no overflow, no brand/auth warnings and no baseline divergence. All four screenshots were visually inspected. Artifacts: `screenshots/desktop-readiness-home-dev.json`, `screenshots/desktop-readiness-home-production.json`.

### Limits and operator notes

The shortcut interrupts active work; save edits first. Saved libraries and files are not deleted. Older Companion processes without the cleanup channel may require the exact-identity force fallback. Independently started engines, native app handoffs and actual remote sessions can remain open; no native session readiness is claimed. WMI denial fails closed. The desktop controls target this Windows installation, not arbitrary services; Companion auto-start preferences remain intact. Real provider throughput, physical devices and the eight-hour soak remain open. See `docs/DESKTOP_SERVICE_CONTROLS.md`.

---

## Revision 73 — resumable model integrity and scoped RustDesk safeguards

Date: 2026-10-30. Completed **next-082** and **next-093** together. Default plan: **281 / 306 complete**, including **79 / 100 next-level milestones**. Revision 73 promotes only this pair once, preserving manual reopens, custom notes and external integration states. Twenty-one next-level milestones and four earlier external checks remain open. **next-093 completes application safeguards only; no actual native remote session is marked verified.**

### Baseline and implementation

- Previously model download failures removed their partial file and job state was memory-only. Model library now shows a bounded durable recovery list with explicit Review, Resume, Pause, Cancel and separately reviewed fresh-download paths. Opening/reloading the app starts no transfer. A changed publisher identity cannot silently append to old bytes.
- New companion/model-transfers.mjs stores at most eight private receipts in a 128 KiB versioned journal, pinned to Companion-managed folders and exact file identities. Corrupt/future journals are preserved and block new recovery-managed downloads. No legacy unowned partial scan/adoption. Heavyweight verification admits one review at a time.
- Native transfers use <=4 MiB ranges, exact byte-range budgets, pinned repository/revision/file/role/length/mandatory publisher SHA-256, strong ETags when supplied, approved HTTPS Hugging Face/CDN redirect hosts, 64 KiB hashing buffers and existing bounded safetensors header checks. Checkpoints occur every 16 MiB, at completion and on handled interruption. Review is read-only for model bytes; resume revalidates before trimming only a verified owned uncommitted suffix and appending. No complete model buffer is retained by the browser or Node runtime.
- Full checksum/format validation precedes exclusive final publication. Existing different weights and pre-existing provenance sidecars remain unchanged. A lost completion receipt recovers by verifying the existing destination without downloading the full weights again. Cancel removes only proven owned partial data; modified/replaced files remain. A separate fresh transfer requires metadata preview, acknowledgement and a matching reviewed source fingerprint. Native model permission generation still gates admission/publication; upload checks permission before sending file bytes.
- Existing RustDesk one-use peer/origin approval gains an ephemeral page requester scope, monotonic client deadline, replay/expiry checks, protection against another page consuming approval, and rejection of unattended/password/custom-command fields. The command remains the fixed password-free literal argv without a shell. Status/activity omit peer, requester and token.
- Remote launch receipts distinguish requested, failed, stop requested and observed launcher exit; every outcome retains sessionVerified:false. Missing responses trigger status review without automatic retry. Stop keeps the tracked process until exit is observed. Page-scoped cleanup cannot stop another page's launcher; the trusted legacy empty-scope lock behavior remains explicit. Shutdown requests stopping only its own tracked launcher.
- The Remote desktop page explicitly separates these controls from native pairing/authentication/session permission verification. No automatic probe on page entry and no status polling. Model recovery and scoped launch controls negotiate new v19 capabilities; other existing supported operations retain their negotiated behavior.
- Companion source **v19**, protocol 1. Runbook: docs/MODEL_TRANSFER_AND_REMOTE_SAFEGUARDS.md. Companion README and Mission plan RustDesk credit updated. No dependency or third-party repository added.

### Verification

- **210 focused tests pass**, concurrency limited to two: screenshots/model-remote-tests.txt. Includes 17 MiB generated model interruption/restart/exact continuation, unchanged review, uncommitted suffix handling, ETag/pinned source changes, modified/replaced ownership, cleanup, changed fresh-source preview, checksum failure, future/malformed journals, failed journal writes, publication receipt recovery, bounded admission/review, malformed client receipt handling, provenance preservation and page/origin/expiry/replay/native stop isolation. Existing Studio, consent, protocol, job/update recovery, diagnostic privacy, root/download/print/platform behavior and all 100 roadmap contracts plus revision 73 migration also pass.
- **Final build and typecheck pass**: screenshots/model-remote-build.txt and .grok/model-remote-typecheck.txt.
- **Real isolated native HTTP passes**: screenshots/model-remote-http.{txt,json}. A copied full v19 service uses actual Windows files and HTTP with controlled Hugging Face responses and mocked child processes. Checkpoint survives process restart without replay; resumed final bytes match SHA-256; expired/replayed approvals and unattended fields start no launcher; fixed literal argv is observed; stop/exit never proves a session. No real native binary, peer, credentials or model source was invoked.
- Existing native regressions pass against v19: screenshots/model-remote-consent-http.txt (stale request/permission generations and revocation), screenshots/model-remote-root-http.txt (root replacement, revocation and held writes), screenshots/model-remote-download-http.txt (disk budgets, partial ownership and launch receipts).
- **Feature browsers pass on development and final production**, desktop 1440×1000 and touch mobile 390×844: screenshots/model-remote-{dev,production}.json. Saved partial appears without replay; review gates append; pause/reload preserves progress; changed identity blocks resume; fresh download requires explicit review/acknowledgement; remote page starts no probe/launch; expired approval submits no connection; lost response resolves through status without retry; stop remains requested; native sessions remain unverified. No uncaught console/page errors or horizontal overflow. Explicit button bounds and screenshot review caught/fixed long phone action labels before final verification.
- **Existing production local integration regressions pass**: screenshots/model-remote-tools-production.json with --local-only covers Studio requests, settings/recipes/reload, expiry/revoke/launch controls and repository credits; screenshots/model-remote-studio-production.json covers compatibility, job recovery/cancellation, Qwen and recipes/notes. The broader legacy helper's unrelated live YouTube publication portion was not completed; no live-provider date claim is made for this batch.
- **Roadmap browsers pass in development and production**: screenshots/model-remote-mission-{dev,production}.json. Revision 73 and 79 verified next-level code milestones, manual/custom preservation, bounded queue, clipboard fallback and all 100 brief/CSV exports.
- **Home smoke passes desktop/mobile in development and final production**: screenshots/model-remote-home-{dev,production}.json. Visible hydrated content, clean console, no overflow or brand/auth warnings, no production baseline divergence. Final feature and both Home screenshot pairs visually inspected.
- Scoped whitespace check passes. Final production browser checks, build/typecheck and all 210 tests were rerun after the page-ownership correction. QA uses isolated profiles, generated files and copied processes; actual user content, provider sessions and native services remain unchanged.

### External state and limits

The running user Companion was **not restarted or upgraded**. New recovery/approval controls require the included v19 capability. Actual Windows filesystem/HTTP behavior is tested; other OS behavior, physical devices, real Hugging Face multi-gigabyte transfers, GPU generation and real RustDesk sessions remain unverified. An installed model still needs engine compatibility/readiness checks; no model was downloaded for the user during this work.

RustDesk authenticates and owns the actual native session. This batch does not verify an approved peer, remote login, effective session privileges or handed-off disconnection, and does not enable unattended access. Native verification still requires the installed client and a separately approved peer. Upstream flags/authentication boundaries were checked against the official client documentation and source linked in the runbook; app controls do not override existing native client permissions.

Resume hashes the saved prefix and can take minutes. File-range buffers are bounded, but header assembly can briefly retain roughly twice its 8 MB header limit, excluding metadata/runtime overhead. Hard-link filesystem support is required for exclusive publication. Changed or unverified partials are retained for manual review; they are not disposable without ownership proof. Process-interruption recovery is not guaranteed physical power-loss durability. The development app remains running; only the owned production QA preview is stopped after verification.

## Revision 72 — optional permission ledger and contextual setup

Date: 2026-10-30. Completed **next-092** and **next-097** together. Default plan: **279 / 306 complete**, including **77 / 100 next-level milestones**. Revision 72 promotes only this pair once. Manual reopens, custom notes and external verification states remain intact. Twenty-three next-level milestones and four earlier external checks remain open.

### Implemented

- Settings → Optional permissions lists host model transfers, local browser-session access, browser image analysis and Stream Signal draft composers with scope, current/unchecked state, grant/revoke controls and recovery. Folder approval remains in the existing pinned-root panel. A permission is never labeled an account connection, engine readiness or publication. Remote AI and automatic publishing remain unconfigured.
- Companion source **v18**, protocol 1, advertises capability-consent. Its private bounded two-scope policy defaults off, saves before granting and uses per-scope generation leases. Stale mutation revisions and held request bodies are rejected. Revocation stops affected queued/active session downloads, aborts model transfers and prevents late model publication, including after immediate regrant. Existing models, partial files and ordinary unauthenticated downloads remain. Each authenticated download still requires its own explicit browser-session selection; restart does not reuse it.
- Native model file publication now exclusively links a new destination rather than renaming over an existing file. Existing weights are preserved. Native policy corruption/future versions are preserved and deny changes; failed grants remain denied. Failed native revocation blocks its scope in memory, cancels affected leases and offers Retry revocation until saved.
- Browser choices use a bounded versioned record, per-scope generations, storage-event invalidation and final result admission checks. Revoking image analysis discards pending results and prevents subsequent inference dispatch. Draft-composer revocation prevents opening prepared text on X; plain platform/help links, Copy/export and manual sharing receipts remain independent. Corrupt/future browser records are preserved and cannot be granted over. Storage-save failure blocks optional actions for the visit with an explicit persistence warning.
- Home and Settings offer a small setup checklist derived from existing hydrated catalog/source counts, reviewed choices and an explicit Companion health check. No media graph scan, automatic provider request, import, model download or account connection is added. Populated returning profiles stay collapsed. Dismiss/resume/reviewed choices persist separately; local file selection uses the existing picker. Empty profiles retain useful offline-first paths.
- Desktop checklist uses a two-column layout; mobile permission controls stack without cramped text or overflow. Smoke checks wait for saved-state checklist readiness so baseline comparisons do not race catalog hydration. No new dependency or external repository. Runbook: docs/OPTIONAL_PERMISSIONS_AND_SETUP.md; Companion README updated.

### Verification

- **179 focused tests pass**, concurrency limited to two: screenshots/consent-setup-tests.txt. Covers native/browser consent persistence, scope isolation, stale generations, revoke/regrant, failed grants/revocations, corruption/future versions, lease bounds, held model metadata/ranges, queued/active credential jobs and ordinary downloads, setup parsing/readiness, existing Studio/model/protocol/recovery/update/privacy/root/download/print/platform behavior, all 100 milestone contracts and revision 72 migration.
- **Build and typecheck pass** on final source: screenshots/consent-setup-build.txt and .grok/consent-setup-typecheck.txt. Earlier local upload testing encountered sandbox loopback denial; the normal approved fixture run passed. No approval bypass or unresolved check.
- **Copied real Companion HTTP passes**: screenshots/consent-setup-http.{txt,json}. Real Windows filesystem/HTTP, controlled metadata and native child processes: origin gating, default denial before external work, held lookup revoke/regrant rejection, stale revisions/body generations, session job cancellation, durable choices and restart without replay. No actual cookies, model transfer or installed service used.
- Existing native regressions pass against v18: screenshots/consent-setup-root-http.txt, screenshots/consent-setup-download-http.txt and screenshots/consent-setup-print-http.txt. Approved-root replacement/revocation and held writes, disk-budget/partial ownership/launch receipts, exclusive verified print saves and restart remain intact. The print fixture's other-OS contracts remain simulations, not native OS evidence.
- **Interactive feature checks pass in development and final production**, desktop 1440×1000 and touch mobile 390×844: screenshots/consent-setup-{dev,production}.json. Empty setup, reviewed/dismiss/resume reload, no automatic grants/scans, explicit Companion health, native grant/revoke and held-transfer cancellation fixture, browser persistence/cross-tab revocation, unrelated permission retention, storage failure, denied/allowed draft composer and Copy separation, actual saved catalog/source hydration, collapsed returning profile and older-Companion denial before dispatch. Clean page/console errors and no horizontal overflow. Desktop/mobile screenshots visually inspected; a cramped mobile row was corrected before the final passes.
- **Roadmap checks pass in development and production**: screenshots/consent-setup-mission-{dev,production}.json. Revision 72, both promotions, manual/custom preservation, bounded delivery queue, clipboard fallback and full 100-brief Markdown/CSV exports.
- Existing production browser regressions pass: screenshots/consent-setup-signal-production.json (generation, editing, persistence/archive, Copy/Open/manual state, exports/Story and simulator); screenshots/consent-setup-download-production.json (paused/fresh downloads, launch receipts and history); screenshots/consent-setup-studio-production.json (preflight, controlled generation/recovery, Qwen, recipes/notes). These ran before the final future-record rejection tightening; final feature browsers, build/typecheck, native permission HTTP and all 179 focused tests were rerun afterward.
- **Final Home smoke passes desktop/mobile in development and production**: screenshots/consent-setup-home-{dev,production}.json. Visible hydrated content, clean consoles, no overflow or brand/auth warnings, and no final production baseline divergence. Initial comparison raced checklist hydration; the smoke helper now waits for its explicit readiness marker. Final Home screenshot pairs visually inspected.
- Scoped whitespace check passes. Browser profiles, catalog/model fixtures and copied services are isolated; actual user content, native processes and provider sessions remain untouched.

### Limits / external state

The running user Companion was **not restarted or upgraded**. The included v18 source is required for new native permission controls; older services are explicitly unsupported for those controls while their ordinary negotiated features remain available. Permission approval is not external readiness verification. No real browser session, provider/model download, GPU inference/generation, native game/tray/registry action or RustDesk peer was invoked. Native filesystem/HTTP tests ran on Windows; physical devices and other operating systems remain unverified.

Revocation cannot retract received bytes, undo an already committed model, close an external composer or erase cached browser models. Native process termination is asynchronous. An in-flight browser model download/inference can finish, but pending inference results are denied after revocation. A failed revocation must be saved successfully before closing/reloading: an older disk/browser choice can otherwise return; UI and runbook state this limit. Browser consent is an application boundary, not an OS sandbox or protection from arbitrary same-origin scripts. The development app remains running; only the owned production QA preview is stopped after checks.

## Revision 71 — reviewed edited print saves and platform support

Date: 2026-10-30. Completed **next-078** and **next-080** together. Default plan: **277 / 306 complete**, including **75 / 100 next-level milestones**. Revision 71 promotes only this pair once, retaining manual reopens, custom notes and external verification states. Twenty-five next-level milestones and four earlier external checks remain open.

### Implemented

- Prints now export the edited static model as a new GLB after explicit destination, filename, format-limit acknowledgement and review. Supported materials and transforms survive an actual export/import round trip; grid, lighting, camera, wireframe and explode preview are excluded. An origin marker prevents bed repositioning and doubled transforms on reopen. Imported colors remain until deliberately overridden; Reset restores them.
- Companion v17 streams checksum-bound reviewed uploads with a 48 MiB cap, bounded GLB validation and approved-folder leases. Exclusive owned temporary files plus exclusive hard links prevent replacement of original or existing destination files. The older original-byte copy path now also refuses overwrites. Unrelated temporary-name collisions are retained. Hard-link support is required; unsupported filesystems fail safely.
- A bounded private transaction journal supports explicit status recovery after interrupted responses or service restart, without uploading/replaying a save. Incomplete requests stay unconfirmed. Cancel removes only proven owned temporary output. Local draft preferences persist independently from confirmed file receipts. Geometry/texture/export budgets, coalesced draft writes, released upload buffers and rendering only while the scene changes protect responsiveness and idle GPU use.
- The Companion reports its own platform and advertises matching capabilities. Unsupported Windows desktop, shortcut, tray and bundled image-engine setup routes are rejected before dispatch on other platforms. Games, Settings and Mission plan explain support and gate controls using the service capability declaration; web games remain usable. Existing services without platform metadata retain legacy capability behavior with an unverified-platform explanation. Root declarations require bounded absolute paths, using Windows semicolons or POSIX colons (legacy POSIX semicolons remain accepted).
- Mobile print controls wrap, keep Close visible and provide separate scrollable editor space. New source modules, transaction APIs and format/platform matrix are documented in docs/PRINT_SAVE_AND_PLATFORM_CONTRACT.md and companion/README.md. Existing Three.js repository credit now covers GLB export/import. No new dependency or repository.

### Verification

- **167 focused tests pass**, with concurrency limited to two: screenshots/print-platform-tests.txt. Includes transaction commit/conflict/hash/corruption/revocation/restart/uncertain-link recovery/ownership/bounds; actual GLB round-trip geometry and materials; draft/receipt failure handling; OS paths/capabilities/dispatch/client negotiation; existing Studio, protocol, update, diagnostic privacy, root access, download budgets and launch receipts; all 100 milestone contracts and revision 71 migration.
- **Build and typecheck pass**: screenshots/print-platform-build.txt and .grok/print-platform-typecheck.txt. The final production build includes the color-reset and temporary-file ownership corrections.
- **Real isolated Companion HTTP passes**: screenshots/print-platform-http.txt. Copied v17 service on real Windows filesystem verifies origin checks, review without model output, streamed exclusive/hash-verified save, original preservation, restart verification and no replay. Linux/macOS service declarations and dispatch guards (including bundled Studio start routes) are simulated on Windows; no native process is spawned.
- Existing approved-root and download/launch HTTP regressions also pass against v17: screenshots/print-platform-root-http.txt and screenshots/print-platform-download-launch-http.txt. Disposable workspace roots and controlled OS/tool responses; no installed user service or personal files.
- **Feature browser checks pass on development and production**, desktop 1440×1000 and touch mobile 390×844: screenshots/print-platform-{dev,production}.json. Actual WebGL model editing/export/reimport; explicit format/path review; failed save retains unsaved draft; interrupted response and reload preserve edits; status confirms without reupload; transformed bounds/materials survive reimport with neutral draft transforms; original material Reset works. Actual orbit dragging renders, damping settles and the unchanged scene stops drawing. Platform fixtures disable contradictory native claims while web games open. No uncaught page/console errors or horizontal overflow.
- **Roadmap checks pass on development and production**: screenshots/print-platform-mission-{dev,production}.json. Revision 71, both promotions, manual/custom persistence, bounded delivery queue, clipboard fallback and all 100 brief/CSV exports.
- Existing production download/launch and Studio browser regressions pass: screenshots/print-platform-download-launch-production.json and screenshots/print-platform-studio-production.json. Controlled native/provider/engine fixtures; no real game launch, GPU generation or download.
- **Home smoke passes desktop/mobile in development and production**: screenshots/print-platform-home-{dev,production}.json. Hydrated visible content, clean consoles, no overflow or brand/auth warnings, no production baseline divergence. Both Home screenshot pairs and final feature desktop/mobile screenshots visually inspected.
- Scoped whitespace check passes. Verification uses isolated browser profiles, generated model fixtures and copied services; real user models, games, follows, provider sessions and native processes remain untouched.

### Limits / external state

The user's running Companion was **not restarted**. New native print transactions require the included v17 source/capability. Actual Windows filesystem and HTTP behavior is tested; Linux/macOS coverage is a contract simulation, not native OS verification. Native game launch, registry/tray execution, installed image engines and RustDesk sessions remain unverified. GLB saves static geometry, transforms and supported embedded materials, not full animation, CAD or slicer semantics; embedded textures may resize to 2048 pixels. Hard-link filesystem support is required. Existing externally unverified milestones remain open. The development app stays running; the owned production QA preview is stopped after checks.

## Revision 70 — download disk budgets and game launch receipts

Date: 2026-10-29. Completed **next-076** and **next-077** together. Default plan: **275 / 306 complete**, including **73 / 100 next-level milestones**. Revision 70 promotes only this pair once. Manual reopens, custom notes and external verification states remain intact. Twenty-seven next-level milestones and four earlier external checks remain open.

### Implemented
- Download manager: approved destination and bounded partial inventory checks before each queued dispatch; measured free bytes, explicit unknown-size allowance and configurable bounded safety margin. Low/unmeasurable space pauses before output-folder creation/process launch; job-receipt metadata remains persistent. Active progress checks stop at the margin, no more often than every five seconds.
- Resume protection: unique receipt-ID destination folders for new attempts; ownership/source/key, folder and file identity, size/time and bounded first/last samples before continuation. Explicit fresh copies retain previous files. Missing/changed legacy ownership remains blocked rather than silently adopting unrelated partials. Completed legacy media receipts still resolve.
- UI: YouTube Download explains estimates/margin, paused status, explicit resume and Start fresh copy. Settings recovery and update comparisons retain paused jobs. Old six-status update baselines remain readable. Shared diagnostics retain only allowlisted counts.
- Games: approved literal-path Windows Explorer dispatch replaces the shell-based launch path. Up to eight independent pending requests; identical pending requests and accepted requests within eight seconds share one receipt. At most 50 private local receipts persist; pending work becomes interrupted on restart and never replays. Accepted launch requests and launcher exit codes explicitly leave actual game readiness unverified. History is on demand. The Games toolbar now wraps on desktop and mobile.
- Companion source is **v16**, protocol 1, with additive download-preflight and launch-receipts capabilities. Private launch receipts are excluded from Git. Runbook: docs/DOWNLOAD_BUDGET_AND_GAME_RECEIPTS.md. No new dependency or external repository.

### Verification
- **138 passing focused tests**, concurrency bounded to two (screenshots/download-launch-tests.txt): disk budget/partial ownership, launch identity/deduplication/errors/timeouts/restart/unsupported OS, existing downloads/recovery/origin/root revocation/media range/protocol/update/privacy, all 100 milestone contracts, and revision 70 migration. Tests use real temporary filesystem identities and partial samples with mocked disk/native outcomes.
- **Build and typecheck pass**: screenshots/download-launch-build.txt and .grok/download-launch-typecheck.txt.
- **Actual Companion HTTP fixture passes**: screenshots/download-launch-http.txt. Disposable copy of the full v16 service, isolated approved root, mocked executable discovery/spawn/space. Origin gating, one literal-path request for concurrent launches, independent games, revoked shortcut denial, low-space pause, preserved verified partial resume, altered partial denial and separate fresh destination all pass. Existing root and restart fixtures also pass: screenshots/download-launch-root-http.txt and screenshots/download-launch-recovery-http.txt.
- **Feature browser checks pass on development and production**: screenshots/download-launch-{dev,production}.json. Desktop 1440×1000 and mobile 390×844; final production pass uses touch/mobile emulation. Explicit paused resume, no browser-session reuse, separate fresh copy, closed-panel polling stop, double-click guard, unverified readiness, independent games, history reload without launch and denial guidance. Screenshots inspected for both viewports; no overflow or uncaught browser errors.
- **Roadmap browser checks pass on development and production**: screenshots/download-launch-mission-{dev,production}.json. Revision 70, both new promotions, manual/custom persistence, bounded delivery queue, clipboard fallback and all 100 brief/CSV exports.
- **Existing production browser regressions pass**: screenshots/download-launch-youtube-production.json (download, cancellation/retry, consent reset, failure guidance, real decoding/seeking of a generated fixture clip, preview/player entry and interrupted resume); screenshots/download-launch-recovery-production.json (older/incompatible capability gating, paused resume/cancel, bounded job history and no automatic replay/polling); screenshots/download-launch-update-production.json (old baseline retention, paused/interrupted warnings, redacted export and failed-save recovery). Native/provider actions are controlled fixtures.
- **Home smoke passes desktop/mobile in dev and production**: screenshots/download-launch-home-{dev,production}.json. Clean console/hydration, no overflow, brand/auth checks clean; production does not diverge from the dev baseline. Both screenshot pairs visually inspected. Scoped diff whitespace check passes.

### Limits / external state
No actual game, provider download, browser-cookie/session extraction or physically full disk was used. Native HTTP tests mock the OS launcher; Explorer acceptance is not game readiness. Partial samples are ownership/change checks, not a full-file checksum; real continuation depends on the provider/downloader. Disk checks are estimates and progress-triggered checks, not reserved capacity. Crashes before a checkpoint can require a fresh copy; partial files are kept. The user's running Companion was **not restarted**; these new native controls require the v16 source included here. Existing externally unverified milestones remain open. The dev app stays running; the owned production QA preview is stopped after checks.

# Revision 69 — Configured folder access and diagnostic export privacy

Date: 2026-10-29. Completed **next-073** and **next-091** together. Default plan: **273 / 306 complete**, including **71 / 100 next-level milestones**. Revision 69 promotes only this pair once, preserving manual reopens, custom notes and external integration statuses. Twenty-nine next-level milestones and four earlier external checks remain open.

## Delivered

- Settings → Companion folder access reviews configured roots only on explicit action, previews revoke/restore consequences, rejects stale revisions, preserves personal records and exposes an identifier-free diagnostic. Companion v15 advertises the root-access capability; older services are clearly unsupported for these new operations without disabling their other capabilities.
- A shared Companion authority pins canonical folders to exact BigInt device/inode/creation identities. Replaced roots and retargeted junctions cannot inherit approval. Revocation is persisted in a bounded private policy; malformed/future policies fail closed, and a failed grant save remains blocked. Closed owners reject late operations.
- Queued and active downloads, native metadata/icon jobs, delayed artwork fetches, audits, and completed-media streams hold cancellable access leases. Reads and final writes recheck paths; writes use exclusive temporary files and verify before rename. Inbound file mutations also reject an approval generation changed while receiving the request body. A stale held print request fails even after reapproval, and a fresh approved save succeeds. Endpoint body and image-response budgets prevent unbounded transfers.
- Affected watches close on revoke and reopen only for approved configured roots. Existing download destinations/receipts can recover after explicit reapproval without starting jobs. Files, partial downloads and browser personal metadata are retained. Native icon/metadata subprocess waits are asynchronous, bounded and cancellable; no new PowerShell command was introduced.
- Shareable performance, room, update, root, YouTube player and provider-quality diagnostics now use closed export schemas. Unknown/nested fields and accessors are not traversed; free text, credentials, invitations, addresses, paths, media IDs/URLs, private notes/titles and configuration fingerprints are excluded. Privacy previews show the exact safe JSON and clear on snapshot changes. Diagnostic payloads/arrays and object-URL lifetimes are bounded.
- Private backup/content exports retain their intended fields and are explicitly distinguished from diagnostics. A private pack with canary notes/history, ratings, favorites and resume marks remains inspectable and restores exact values. YouTube player diagnostics are version 2 with observed states/codes and no selected-video IDs/URLs. Local update baselines retain their existing detailed comparison; their shareable exports contain only safe summaries.

## Verification

- Build: pass, screenshots/root-diagnostic-build.txt. Final typecheck: pass, .grok/root-diagnostic-typecheck.txt. Final Companion modules are syntax/runtime checked by the copied-service HTTP tests.
- **50 focused tests pass**, screenshots/root-diagnostic-tests.txt: thirteen new root lifecycle cases and seven new diagnostic/private-backup cases, plus existing job recovery, protocol, update and 100k library-pack acceptance checks. Covers real Windows directory junctions, identity replacement, revoked queued/active jobs, held stream closure, native normal/overflow/revoked output, failed policy saves, malformed policies and owner shutdown. A multi-file run exposed lossy Windows numeric inode comparison; exact BigInt identities plus creation time fixed it, and the complete run passes.
- Existing provider/import tests: **311 script + 106 native passing**, screenshots/root-diagnostic-import-tests.txt. Room/status/mission tests: **87 script + 110 native passing**, screenshots/root-diagnostic-room-tests.txt. Artwork audit, Companion memory and scorecard tests: **4 passing**, screenshots/root-diagnostic-metrics-tests.txt. **668 distinct tests in these bounded relevant runs.** No unbounded full npm test claim.
- Copied real Companion HTTP: screenshots/root-access-http.txt. Explicit origin gating, held artwork fetch across revocation, stale-generation rejection, pinned reapproval, denied junction print target, replaced configured-root status/health, held request body across revoke/reapprove, and fresh approved save all pass. Existing job-recovery HTTP checks also pass against v15: screenshots/root-access-recovery-http.txt. These use disposable workspace roots and an empty executable PATH, not a user service or external provider.
- Interactive feature checks: screenshots/root-diagnostics-{dev,production}.json. Desktop 1440×1000 and touch mobile 390×844 pass explicit review/cancel/revoke, no automatic root reads or setup, privacy preview/download equality, preview invalidation, unchanged personal state, reload, stale request recovery, explicit reapproval without work start, intentional private-pack contents, and v14 capability denial before dispatch. Clean page/console errors and no horizontal overflow.
- Existing production interactions: screenshots/root-diagnostics-room-production.json verifies room role/reconnect/queue behavior, safe diagnostic clipboard and selectable fallback. screenshots/root-diagnostics-update-production.json verifies owner-specific baseline persistence, failed saves and safe update exports on desktop/mobile. screenshots/root-diagnostics-worker-production.json verifies worker recovery and native decode lifecycle counters still export correctly on desktop/mobile. Existing Twitch ranking/export and 100k cooperative work checks pass: screenshots/root-diagnostics-ranking-dev.json.
- Roadmap checks: screenshots/root-diagnostics-mission-{dev,production}.json. Revision 69, both promotions, dependency briefs, manual/custom preservation, active queue pagination, clipboard fallback and Markdown/CSV export pass on desktop/mobile.
- Home smoke: screenshots/root-diagnostics-home-{dev,production}.json. Both viewports hydrate visible content with clean consoles, no overflow or brand/auth warnings and no production baseline divergence. Rendered Home and feature screenshots inspected in desktop/mobile pairs.
- Scoped git diff --check passes, with existing Windows line-ending conversion warnings only. Verification did not modify real user roots, follows, feedback, browser profiles, jobs or service processes.

## Limits and handoff

Companion source v15 is delivered and tested as an isolated copied service; no running user Companion was restarted or upgraded. New folder controls require the v15 capability, and existing services retain their current state until updated through the normal local workflow. Native child termination is requested immediately on invalidation; OS process shutdown is asynchronous, and already written/sent bytes cannot be undone. App-level path checks are not an OS sandbox against a concurrent privileged filesystem attacker. Privileged file-symlink creation, arbitrary network filesystems, physical phones, real active downloader termination and long-session soak remain unverified; real directory junctions and simulated held native jobs are covered.

Intentional private library packs retain their existing metadata scope; no atomic catalog restore, rollback, profile isolation, capability-consent or remote desktop session milestone was promoted. Application-owned engine/model/configuration directories retain their separate local policies. No new external repository or dependency was added. Source/export boundary inventory, usage and limits: docs/FOLDER_ACCESS_AND_DIAGNOSTIC_PRIVACY.md.

---

# Revision 68 — Backup inspection and bounded metadata export

Date: 2026-10-29. Completed **next-003** and **next-005** together. Default plan: **271 / 306 complete**, including **69 / 100 next-level milestones**. Revision 68 promotes only this pair once; manual reopens, custom notes and external verification states remain intact. Thirty-one next-level milestones and four earlier external checks remain open.

## Delivered

- Settings now stages a read-only backup report before any import. It shows format/version, source and section counts, duplicate identities, differing personal values and actionable rejection locations. Merge and replace-follows consequences are explicit; apply requires a review acknowledgement and rechecks the relevant current state before writing.
- Version 2 .reelpack exports existing personal/source metadata in bounded UTF-8 JSON-line chunks: at most 128 records and 128 KiB per write, one acknowledged destination write at a time. A final record/section/byte/checksum manifest detects incomplete or damaged packs. Reader and validator yield between batches and support cancellation; pending download bytes are discarded on cancellation.
- Legacy ZIP, JSON, CSV and approved Companion-folder inspection share the same report. Future versions, malformed shapes, dangerous keys, duplicate section paths and excessive ZIP expansion block the reviewed import. Existing ZIP/Companion export, Full backup and provider/CSV controls remain; durable review ledgers are hydrated for explicit operations and legacy Adult-statistics reports are retained.
- Parsed staged records feed the existing importer without another full serialization/reparse. Distinct verified YouTube IDs no longer collapse by matching display handles during pack apply. Empty follow replacement is explicit; inspection/discard retains saved data.

## Verification

- Build: pass, screenshots/pack-transfer-build.txt. Typecheck: pass, .grok/pack-transfer-typecheck.txt.
- **14 new backup acceptance tests pass**, screenshots/pack-transfer-tests.txt. Includes exactly 100,000 metadata records exported, inspected and restored with exact IDs, favorites, ratings and resume marks; full error counts with bounded displayed locations; backpressure; cancel/release/incomplete rejection; checksum, future/schema/duplicate/unsafe-input/ZIP limits; quoted CSV; large sidecar chunks; empty follow replacement and legacy text/file budgets.
- Existing provider/import regressions: **311 script + 106 native passing**, screenshots/pack-transfer-import-tests.txt. Existing room/status/roadmap regressions: **87 script + 109 native passing**, screenshots/pack-transfer-room-tests.txt. **627 distinct tests in these relevant runs.** These are bounded suites, not an unbounded full npm test claim.
- Allocation comparison: screenshots/pack-transfer-benchmark.json. 100,000 synthetic personal/source records: legacy retains 7,253,777 encoded text bytes before ZIP (largest document 2,504,955 bytes); streaming emits a 3,695,635-byte file with largest write 8,604 bytes, 808 writes and one in flight. Serialization took 51 ms legacy versus 141 ms streaming in this small controlled run; the gain is bounded work and fewer retained text copies, not a claim of faster total export time or sampled peak heap.
- Interactive backup checks: screenshots/pack-transfer-{dev,production}.json. Desktop 1440×1000 and touch mobile 390×844 both pass: reject a future file without mutation, inspect/conflict/mode/discard behavior, cancel a 100k inspection, complete a 100k inspection with an existing note conflict, explicitly apply a small pack, reload saved follows/notes/ratings and download/reinspect the resulting pack. Isolated synthetic storage; no actual provider or Companion mutation. Clean page/console errors and no horizontal overflow.
- Mission checks: screenshots/pack-transfer-mission-{dev,production}.json. Revision 68, both promotions, manual/custom preservation, filtered/paginated active queue, copied briefs including clipboard fallback, Markdown/CSV exports and reload all pass on desktop/mobile.
- Home smoke: screenshots/pack-transfer-home-{dev,production}.json. Desktop/mobile hydrated visible content, clean consoles, no overflow, no brand/auth warnings and no production baseline divergence. Development and production feature/Home screenshots inspected visually.
- Final verification chronology: after the final parser bounds/yield changes, build, typecheck, all 14 backup tests, desktop/mobile development interactions and production Home smoke passed. The additional production backup/mission interaction commands initially failed to execute because automatic approval review hit a usage limit. At the user’s explicit retry request, normal approval succeeded and both final-production interaction suites passed. No approval bypass was used; no recheck remains pending.
- Scoped git diff --check passes, with existing Windows line-ending conversion warnings only. No real user follows, feedback, browser profile or native Companion folder was changed by verification.

## Limits and handoff

These packs contain personal/source metadata, not original media or a complete media catalog. The browser Blob destination retains finished file bytes (up to 128 MiB), and preflight retains staged records and identity indexes; 128 KiB is the per-write bound, not a total-heap claim. Apply still uses existing persistence, without transactional activation, cross-tab locking or rollback; next-001, next-004 and related durability work remain open. Real Companion file I/O, storage-exhaustion recovery, physical phones, provider soak and eight-hour memory checks remain unverified. No new third-party repository/dependency. Usage and implementation notes: LIBRARY_PACK_PREFLIGHT.md.

---

# Revision 67 — YouTube event transitions and playlist reconciliation

Date: 2026-10-29. Completed **next-025** and **next-026** together. Default plan: **269 / 306 complete**, including **67 / 100 next-level milestones**. Revision 67 promotes only this pair once and preserves manual reopens, custom notes and external statuses. Thirty-three next-level milestones and four earlier external checks remain open.

## Baseline and delivered behavior

- Live parsing previously discarded scheduled broadcasts; there was no durable schedule/transition ledger or upcoming-event panel. Live now has a paginated schedule panel, explicit changed-time and uncertainty states, official links and focused checks. Schedules and waiting audiences never establish live status, viewers or publication dates.
- Upcoming → confirmed live → complete-negative ten-minute hold → replay retains one canonical video. Canonical cards and the compact follow ledger preserve the first announcement receipt. Enabled in-app alerts persist across reload and repeated checks, without publishing external announcements. Missing pre-live events remain uncertain.
- Near-start checks use existing request slots and cooldowns. A bounded portion of discovery slots serves near-start events; ordinary creators retain oldest-first discovery. No new polling owner, transfer concurrency or automatic provider budget was added.
- Playlist sources previously accumulated memberships without removal or durable source order. Versioned walks now mark each observed edge/order and resume their matching token. Only a complete root walk whose distinct admitted identities match its count can remove edges. Interrupted pages, legacy suffixes, entry caps, mismatched tokens and inconsistent duplicate walks remain provisional.
- Departed playlist entries retain stable card IDs, other sources, favorites, manual tags and watch history. Orphaned cards move to a retained YouTube folder. A source control explains provisional/confirmed status, starts reconciliation and exposes Playlist order. Playlist controls no longer invite correction into an unrelated creator identity.

## Verification

- Build: pass, screenshots/youtube-events-build.txt. Typecheck: pass, .grok/youtube-events-typecheck.txt.
- Provider/import script regressions: **311 passing**; native YouTube/remote-merge regressions: **106 passing** (screenshots/youtube-events-regressions.txt). Includes twelve new event/playlist cases, a repeated near-start 2k-creator fairness simulation and unchanged-reference reuse over 100k saved cards.
- Room/status/mission regressions: **195 passing** (87 script + 108 native, screenshots/youtube-events-room-tests.txt). Revision 67 preserves unrelated manual/custom/external states and one-shot promotions.
- Creator catalog, entry admission and real-store regressions: **98 passing**, with the expensive 1,588-creator case run separately (screenshots/youtube-events-catalog-tests.txt). That separate **one-test scale run passed in 84.3 seconds** over **215,452 entries and 1,588 creators**, preserving comments/tags and visiting every creator (screenshots/youtube-events-scale-test.txt). Earlier 15/30-second diagnostic timeouts were too short for that fixture; subsequent complete runs pass. **711 passing tests in the completed relevant runs.** This does not claim an unbounded full npm test run or real-provider speed.
- Interactive feature checks: screenshots/youtube-events-{dev,production}.json. Desktop 1440×1000 and touch mobile 390×844 both pass: 12-card event pagination, meaningful postponement through reload, focused creator checks, actual live transition, one persisted alert after another reload/recheck, interrupted real-adapter playlist traversal, checkpoint resume after reload, confirmed membership and playlist order, unchanged favorites/manual tags/history, ten-minute completion and exactly one cached replay. Each profile makes six explicit app requests and seven fixture provider reads. No page/console errors or horizontal overflow.
- Roadmap browser checks: screenshots/youtube-events-mission-{dev,production}.json. Revision 67, both promotions, manual/custom preservation, filtered/paginated queue, clipboard fallback and Markdown/CSV exports pass on desktop/mobile. The second page now correctly contains 19 remaining active cards in the seeded custom plan.
- Home smoke: screenshots/youtube-events-home-{dev,production}.json. Visible hydrated desktop/mobile content, clean consoles, no overflow, no brand/auth warnings and no production baseline divergence. Rendered feature/Home screenshot pairs inspected visually.
- Scoped git diff --check passes; only existing Windows CRLF conversion warnings. No real user follows, feedback or browser profiles were changed by the isolated checks.

## Limits and handoff

These are controlled provider fixtures using real adapter/store paths, with an accelerated event clock. Real YouTube throughput, provider layout soak, physical-phone playback, eight-hour memory behavior and the existing external/native milestones remain open. Complete playlist snapshots verify the traversed public listing; continuously changing playlists can remain provisional and require restarting. Saved cache/preferences retain their existing persistence limitations; no transactional catalog-journal milestone is claimed complete. No new third-party repository/dependency was added. Usage and implementation notes: YOUTUBE_EVENTS_AND_PLAYLISTS.md.

---

# Revision 66 — Large import review and provider allocation safeguards

Date: 2026-10-29. Completed **next-017** and **next-012** together. Default plan: **267 / 306 complete**, including **65 / 100 next-level milestones**. Revision 66 promotes only this pair once; prior manual reopens, custom notes and external verification states remain intact. Thirty-five next-level milestones and four earlier external checks remain open.

## Delivered

- YouTube/Twitch drafts have a virtual review with at most ten mounted rows for a 10k-entry list. Filters, status, stable logical focus and Arrow/Home/End/Space/Enter interaction support large reviews on desktop and mobile. Held/excluded names stay separate from submitted entries. Lists over 10k show an explicit review limit without discarding the full draft.
- Choices, failure status/reasons, filters and focus persist inside the existing optional import-session sidecar and coalesced mirror/IndexedDB writer. Legacy sessions retain their shape and legacy recovery. New reviewed drafts never become a startup auto-import queue; the browser verifies this with automatic pulls enabled.
- Each explicit batch contains at most 50 entries and uses existing smaller provider batches. Plain YouTube names default to held; identity resolution still requires a single exact public match. Failed entries require explicit retry, including after their old reason strings leave the 128-message cache. Verified rows cannot be submitted again. Submission latches prevent duplicate clicks; pause/resume and storage/network failures retain decisions.
- Metadata JSON is scanned before object-graph allocation, with bounds for tokens, containers, nesting, string units and a declared scratch payload estimate. Budget errors preserve previous pages/cursors instead of supplying false empty results. Embedded initial/player JSON uses the same safeguards.
- Retained YouTube/Twitch archive rows project consumed catalog fields and drop unused command/tracking graphs. Overlong identities/cursors and Twitch pages above the legal 100-row contract are rejected rather than shortened or partially consumed. Existing reference reuse and cache/transport concurrency limits remain.

## Verification

- npm run build: pass (screenshots/import-payload-build.txt). npm run typecheck: pass (.grok/import-payload-typecheck.log).
- Bounded provider/import script regressions: **299 passing**; native YouTube/remote-merge regressions: **106 passing** (screenshots/import-payload-final-regressions.txt). Includes ten new allocation/import cases and a 100k-card unchanged-reference check.
- Room/status/mission regressions: **194 passing** (87 script + 107 native, screenshots/import-payload-room-tests.txt). Isolated auth-symlink/local-media regressions: **13 passing** with required loopback/filesystem access (screenshots/import-payload-host-checks-elevated.txt). **612 passing focused/regression tests**, zero failures in these completed runs.
- A broad npm test attempt was stopped rather than treated as passing after sandbox EPERM/EACCES blocked a junction and loopback media request. The two affected cases passed in the isolated permitted rerun. Subsequent relevant tests use concurrency two; this is not a claim that the entire npm test command completed.
- Allocation benchmark: pass (screenshots/provider-allocation.json). Synthetic 100-row YouTube raw/legacy/compact payloads: 1,243,291 / 1,241,491 / 31,491 bytes; Twitch: 619,587 / 619,471 / 12,271 bytes. Both remain below the declared 6 MiB representative scratch estimate and 128 KiB retained-page baseline. Heap checkpoint samples are reported separately, not claimed as exact peaks or portable heap limits.
- Desktop/mobile review checks pass on development and production (screenshots/import-review-{dev,production}.json): 10k names, keyboard controls, filters/choices through reload, manual pause/resume, no unrelated stub creation or automatic retry, explicit verified admission, clean consoles and no horizontal overflow.
- Mission migrations, manual/custom preservation, current revision 66 and roadmap exports pass on development and production (screenshots/import-payload-mission-{dev,production}.json). Home desktop/mobile smoke passes with visible hydrated content, clean consoles, no overflow or brand/auth warnings, and no production baseline divergence (screenshots/import-payload-home-{dev,production}.json). Rendered review/Home pairs visually inspected.

## Limits

These are deterministic fixtures and desktop Chromium mobile emulation. Physical-phone, real-provider throughput and long-running process memory are not claimed. The 32 MiB scratch number is a structural payload estimate per page, not an exact or process-wide heap cap. Existing concurrency and media/download paths keep their own limits. No real creator accounts, model downloads, native Companion operations or remote sessions were started. See docs/IMPORT_REVIEW_AND_PROVIDER_ALLOCATIONS.md for contracts and commands.

---

# Revision 65 — Cooperative recommendation work and Save Data accounting

Date: 2026-10-28. Completed **next-015** and **next-019** together. Default plan: **265 / 306 complete**, including **63 / 100 next-level milestones**. Revision 65 promotes only this pair once, preserving manual reopens, custom notes and external verification states. Thirty-seven next-level milestones and four earlier external checks remain open.

## Delivered

- YouTube worker creation/feedback preparation and Twitch recommendation preparation settle for 80 ms before starting. Cleanup discards obsolete waiting revisions or aborts running preparation. Packing/scanning yields at 256 rows or a 3 ms cooperative target. Existing scoring, sorting, worker disposal and compatible painted shelves are retained.
- Settings diagnostics expose bounded scalar recommendation timings and counts, including obsolete starts avoided. At most 32 samples are retained, with no media graph or identifiers. Refresh/export reuse the existing scorecard.
- Settings Save Data follows the device or a persistent manual choice. It pauses nearby artwork and speculative preview/player/desk code warming, withdraws revocable low-priority image leases, and resumes through the existing event-driven pump. Visible artwork and deliberate playback/pull/room paths remain available. Preference write failures retain the page-session choice.
- One reference-counted Resource Timing observer aggregates five fixed categories. The transfer summary distinguishes exposed browser bytes from unmeasured cross-origin, embed/media internals and native traffic; it does not claim exact savings or all-network coverage. No URLs, titles, cookies, full timing entries, polling or new provider concurrency are added.

## Verification

- npm run build: pass (screenshots/ranking-data-build.txt). npm run typecheck: pass (.grok/ranking-data-typecheck.log).
- Focused script regressions: **38 passing** (screenshots/ranking-data-regressions.txt), including seven new cases for final-revision starts, cancellation, timing/retention ceilings, exact 100k Twitch ranking/reference equivalence, 100k-resource fixed accounting, hidden byte totals, device/manual Save Data, visible-image admission and failure-safe preference writes.
- Native image-budget/route-warming/YouTube-demand/protocol regressions: **22 passing** (screenshots/ranking-data-native-regressions.txt). Room/status/mission regressions: **193 passing** (87 script + 106 native, screenshots/ranking-data-room-regressions.txt). **253 passing tests total**, zero failures.
- Desktop + touch-mobile interaction checks pass on development and production: screenshots/ranking-data-{dev,production}.json. Checks exercise saved controls/reload, metadata/artwork accounting, real Twitch preparation/diagnostic export, clean consoles and no overflow. A real click succeeds during the isolated 100k-row preparation probe; worst 16 ms heartbeat gaps are below the declared 100 ms gate (production: 21.5 ms desktop, 18.0 ms mobile emulation).
- Mission-plan desktop/mobile migration, manual/custom preservation and exports pass on development and production: screenshots/ranking-data-mission-{dev,production}.json.
- Home development/production desktop/mobile smoke checks hydrate with visible content, clean consoles, no overflow, no brand/auth warnings and no baseline divergence: screenshots/ranking-data-home-{dev,production}.json. Settings and Home screenshot pairs visually reviewed.

## Scope and limits

This is a preparation/coalescing and optional-transfer improvement, not a measured increase in real YouTube/Twitch provider throughput. The 100k browser probe runs the actual preparation helper with a controlled workload; the complete 100k Twitch ordering/reference comparison runs separately in Node. Physical phones, full-library heap/soak and real-provider throughput are not claimed. Embedded player internals, upstream server requests, native downloads and room data-channel byte totals remain unmeasured. No real account, model download, native process or remote session was started. See docs/RECOMMENDATION_AND_DATA_BUDGETS.md for contracts and repeatable commands.

---

# Revision 64 — Twitch VOD chapters and bounded pull canaries

Date: 2026-10-28. Completed **next-037** and **next-040** together. Default plan: **263 / 306 complete**, including **61 / 100 next-level milestones**. Revision 64 promotes only this pair once, preserving later manual reopens, custom notes and external verification states. There are 39 next-level milestones and four earlier external checks still open.

## Delivered

- Preview and the full player offer Show VOD chapters for eligible recorded Twitch identities. Opening a title, routine archives, clips and live checks make no chapter requests. The public provider marker source is verified; no title/current-game chapter fallback is invented.
- A selected-VOD reader validates numeric identity, bounded marker count/labels, timing, ordering and overlaps. Readable empty data and unavailable/malformed data are distinct. Collapse/unmount ignores late UI completion; explicit retry retains prior readable markers when a refresh fails. No catalog mutation, polling, progress write or room command is added.
- Twelve chapter rows mount per page. Server cache retains eight selected reports, browser cache four, for ten minutes; concurrent same-VOD requests coalesce and pending server reads cap at eight. Full-player controls use the existing bounded scrolling area. Re-selecting the same timestamp replaces the official iframe deliberately, retaining Twitch parent context. Canonical timestamp links provide a first-party fallback.
- The explicit Twitch canary CLI uses production live refresh, VOD and clip readers for one to three caller-selected public creators, with a hard ceiling of 1–18 actual upstream requests. Concurrent attempts cannot race past the ceiling. It reports safe task states, status codes, response-header timing, paging stops and counts without provider payloads, titles, query bodies, cursors, credentials or private account data.
- Rate-limited canaries stop and retain a bounded resumable task report; saved cooldowns are honored and confirmed tasks are skipped. Unrun, malformed, rate-limited and failed observations are not passed or inferred offline. No canary runs at application startup or default CI. Mission-plan repository credits now mention the yt-dlp schema cross-check.

## Verification

- npm run build: pass (screenshots/twitch-context-build.txt). npm run typecheck: pass (.grok/twitch-context-typecheck.log).
- All Twitch script tests: **106 passing**, zero failures (screenshots/twitch-context-regressions.txt). Includes twelve chapter/API/canary cases covering routine-query exclusion, cache/in-flight bounds, invalid reports, unknown data, safe timestamp URLs, strict concurrent request cap, redaction and resumable cooldown behavior.
- Room/status/mission suite: **192 passing** (87 script + 105 native), zero failures (screenshots/twitch-context-room-regressions.txt). Combined **298 passing tests**.
- Desktop/mobile chapter browser workflows on development and production: screenshots/twitch-chapters-dev.json and screenshots/twitch-chapters-production.json. Pass: demand-only reads, collapse/late delivery, twelve mounted rows, page navigation, canonical links and preserved parent, selected-cache reuse, preview and full-player actions, repeat selection, malformed manual retry, empty markers, clip exclusion, clean consoles and no horizontal overflow. Production explicitly checks same-marker iframe replacement. Screenshots visually reviewed.
- Mission migration/copy/export/filter/reload on development and production: screenshots/twitch-context-mission-dev.json and screenshots/twitch-context-mission-production.json. Revision 64 and 61 verified next-level completions, manual/custom rows preserved, no duplicated additions or console errors.
- Home smoke on development/production: screenshots/twitch-context-home-dev.json and screenshots/twitch-context-home-production.json. Hydrated visible content, clean consoles, no horizontal overflow or branding/auth warnings; no production divergence. Desktop/mobile screenshots visually reviewed. Scoped git diff --check passes apart from line-ending notices.

## Real metadata evidence and limits

- The official Twitch-channel VOD probe returned HTTP 200 with zero chapter markers, recorded without an inferred fallback: screenshots/twitch-chapter-source-probe.json. LIRIK VOD 2913136839 returned HTTP 200 and four actual markers: screenshots/twitch-chapter-lirik-probe.json. Shroud's lookup returned a service error and remains unavailable: screenshots/twitch-chapter-shroud-probe.json.
- Real canary tasks confirmed 100 VODs and two clips for each of Twitch and LIRIK. The initial run used eight of twelve permitted requests. A scoped resume confirmed Twitch offline; the final LIRIK live request timed out and remains failed/transport. The overall real-network canary is **not fully passing** (screenshots/twitch-canary-final.json). Failed live reads do not imply offline. Intermediate development snapshots also exposed an over-strict canary assertion about live identities, corrected to validate the existing channel-based contract. Confirmed VOD/clip tasks were not repeated by resume.
- The metadata GQL source is public but undocumented and may change. The feature uses the existing anonymous public Client-ID, with no credential minting or access bypass. Code/tool completion is separate from current provider health. Browser playback is a controlled official-player document in isolated desktop/touch-phone profiles; actual provider decoding/autoplay, account eligibility, physical phones and sustained provider soak remain unverified. The user's real library and running Companion were not modified for QA.

Runbook, source references, request limits and exact manual commands: [docs/TWITCH_CHAPTERS_AND_CANARY.md](docs/TWITCH_CHAPTERS_AND_CANARY.md). Twitch's documented VOD start-time parameter and yt-dlp's public chapter schema are linked there.

---

# Revision 63 — Download authentication and Companion update checks

Date: 2026-10-28. Completed **next-075** and **next-079** together. Default plan: **261 / 306 complete**, including **59 / 100 next-level milestones**. Revision 63 promotes only this pair once. Manual reopens, custom rows and external checks are preserved; 41 next-level milestones and four earlier external checks remain open.

## Delivered

- YouTube download failures distinguish unreadable browser sessions, expired sessions/provider verification, account access, restricted content, unavailable video and local tool/storage failures. Guidance retains the existing video identity and explicit retry/resume; Open YouTube remains available. Restricted content is never promised playable.
- Default local Chrome/Edge/Firefox profile scope is shown before session use. Browser selection alone makes no session request. Consent resets after each accepted attempt, on close and on reload. A previous browser enum remains descriptive only; Settings recovery still uses public access.
- Native YouTube progress and error receipts use fixed safe descriptions instead of persisting raw downloader output, and legacy YouTube errors are sanitized on load. Browser fallback classification also avoids rendering raw legacy failure text. Cookie/header filtering and enum-only native arguments remain in effect.
- Settings update checklist explicitly saves one redacted before-update baseline per workspace, reads it after reload, compares capabilities, root counts/approval-configuration references, destination approval, confirmed downloader versions and job counts, and exports a redacted report. Unknown/future schemas and storage failure preserve the prior baseline. Refresh/export do not overwrite it.
- Companion v14 adds an inspection summary to protocol 1.0 health. Health checks inspect optional directories without creating them. The report holds summary counts and a configuration fingerprint, without paths, source URLs, job IDs/titles, user identifiers, browser selections or session content. The fingerprint is a reference for root/destination settings, not a restorable private configuration backup or automatic updater.

## Verification

- npm run build: pass (screenshots/companion-update-build.txt). npm run typecheck: pass (.grok/companion-update-typecheck.log).
- Protocol/download/auth/update-summary/media tests: **28 passing**, zero failures (screenshots/companion-update-focused.txt). Includes safe failure categories, progress/error receipt privacy, retained failed-video identity, future/corrupt baseline handling, owner keys and incompatible-update comparison.
- Room/status/mission regressions: **191 passing** (87 script + 104 native), zero failures (screenshots/companion-update-regressions.txt). Combined **219 passing tests**.
- Disposable real HTTP Companion v14: pass (screenshots/companion-update-http.txt). Inspects the native summary and asserts health creates no optional directories, while prior interruption, Origin checks, missing-tool errors and durable cancellation still pass.
- Update workflow desktop/mobile on development and production: screenshots/companion-update-dev.json and screenshots/companion-update-production.json. Pass: explicit baseline save; missing capability/root/tool warnings; incompatible update; redacted downloadable report; failed-save preservation; reload; another workspace record untouched; no polling or native mutation. Browser console clean, no horizontal overflow. Screenshots visually reviewed.
- YouTube download desktop/mobile on development and production: screenshots/companion-auth-dev.json and screenshots/companion-auth-production.json. Pass: unreadable/expired/restricted guidance, secret-bearing fixture text omitted, per-attempt consent reset, explicit retry/resume, retained receipt, local synthetic-video decoding/seeking, preview/player paths and polling stops on close. Screenshots visually reviewed.
- Existing Companion recovery browser regression also passes on the final production build: screenshots/companion-update-recovery-production.json. Legacy shortcuts, incompatible protocol handling, bounded receipts, explicit resume/cancel and no idle polling remain intact.
- Mission migration/copy/export/filter/reload desktop/mobile on development and production: screenshots/companion-update-mission-dev.json and screenshots/companion-update-mission-production.json. Revision 63 with 59 verified next-level completions; manual and custom states preserved.
- Home development/production smoke: screenshots/companion-update-home-dev.json and screenshots/companion-update-home-production.json. Hydrated content, clean console, no overflow or branding/auth warnings, no production divergence. Desktop/mobile screenshots visually reviewed. Scoped git diff --check passes, apart from line-ending notices.

## Limits and operation notes

The user's running Companion was not updated/restarted; a normal restart loads v14 and its native summary. Keep a separate private copy of the previous service, local downloader configuration and operator-managed startup environment before manually updating. This feature exports a diagnostic/reference, not a configuration backup or installer. Browser responses and downloader processes are fixtures; the HTTP check runs only its own disposable local service. No real cookie extraction, restricted-video download, app install, GPU work, firewall change or real-provider access was performed. Root revocation during active work and other external/native checks remain open.

Runbook: [docs/COMPANION_UPDATE_AND_AUTH.md](docs/COMPANION_UPDATE_AND_AUTH.md).

---

# Revision 62 — Companion compatibility and durable job recovery

Date: 2026-10-28. Completed **next-071** and **next-072** together. Default plan: **259 / 306 complete**, including **57 / 100 next-level milestones**. Additive revision 62 promotes only this pair once. Existing manual reopens, custom rows and external verification states remain intact; 43 next-level milestones and four earlier external checks remain open.

## Delivered

- Versioned Companion protocol 1.0 and explicit capability negotiation across file checks, downloads, artwork, prints, launch and creative tools. Legacy v10–12 operations remain supported; unsupported operations stop before native dispatch with minimum-version guidance. Unknown fields are ignored, incompatible major versions fail clearly, and simultaneous requests share the bounded health probe.
- Settings → Companion & local jobs shows supported features and download receipts, ten per page with forty retained. History is explicit-refresh only, without idle polling or automatic execution. It distinguishes support from configured tools, approved folders or verified native execution.
- Atomic version 2 download receipts persist queued/running transitions before process execution. Restart recovers these as interrupted, without automatically launching anything. Explicit resume retains the receipt and partial folder, increments its attempt and requires fresh browser sign-in consent where requested.
- Repeated completed downloads reuse a verified nonempty approved file unless Download again is explicit. Cancellation/late process exit cannot report false completion. Storage failures preserve existing disk and in-memory history, block new execution and explain checking storage/restarting Companion. Public receipts omit source URLs and unknown fields; cookie/authorization output is filtered.
- Existing generation, model-transfer and scan owners retain their own controls; this panel never silently resubmits them. Native approval/Origin rules remain in effect. No automatic provider budgets or polling increased.

## Verification

- npm run build and npm run typecheck: pass. Logs: screenshots/companion-recovery-build.txt and .grok/companion-recovery-typecheck.log.
- Focused protocol/download/storage/media/Studio tests: **45 passing**, zero failures (screenshots/companion-recovery-focused.txt). Includes stable-ID restart resume, fresh browser consent, completed deduplication, explicit Download again, cancellation race, future manifests and full-history rollback on atomic-commit failure.
- Room/status/mission regression suite: **190 passing** (87 script + 103 native), zero failures (screenshots/companion-recovery-regressions.txt). Poster memory/backoff regression: **1 passing** (screenshots/companion-recovery-memory.txt). Combined **236 passing tests**.
- Real HTTP disposable Companion v13: pass (screenshots/companion-recovery-http.txt). Checks protocol, restored interruption, no automatic execution, untrusted-Origin denial, missing downloader errors and durable cancellation. Only its own temporary service/files are created and removed.
- Companion Settings workflows on development/production: screenshots/companion-recovery-dev.json and screenshots/companion-recovery-production.json. Desktop/mobile pass: legacy shortcuts work, incompatible versions block native dispatch, recovery retains IDs, history is bounded, reload preserves outcomes, idle polling is absent and malformed receipts produce a clear error.
- YouTube download dialogs on development/production: screenshots/companion-download-dev.json and screenshots/companion-download-production.json. Desktop/mobile pass: download start/cancel/retry, same-receipt resume, fresh browser consent, preview/player controls, actual synthetic local-video decoding/seeking, live-download exclusion and polling stops on close.
- Studio regression on development/production: screenshots/studio-companion-dev.json and screenshots/studio-companion-production.json. Desktop/mobile pass: negotiated legacy Studio support, actual selection versus candidate review, incompatible Qwen blocks, notes/storage failures, generation-intent recovery and cancellation.
- Mission copy/export/filter/migration/reload desktop/mobile: screenshots/companion-recovery-mission-dev.json and screenshots/companion-recovery-mission-production.json. Revision 62 with 57 next-level completions, custom/manual rows preserved.
- Home development/production smoke: screenshots/companion-recovery-home-dev.json and screenshots/companion-recovery-home-production.json. Hydrated visible content, clean consoles, no horizontal overflow, no branding/auth warnings and no production divergence. Both viewport pairs and the new Settings/history screenshots visually inspected.

## Scope and remaining integrations

An already-running older Companion needs its normal restart to advertise v13; the user's service was not restarted. Browser native responses and downloader processes are fixtures. No real native application launch, browser-cookie extraction, provider download, model install or GPU generation was performed. Root revocation during active work remains next-073, and physical-device/provider soak milestones remain open. See [docs/COMPANION_PROTOCOL_AND_RECOVERY.md](docs/COMPANION_PROTOCOL_AND_RECOVERY.md) for the protocol, job ownership inventory and repeatable runbook.

---

# Revision 61 — Room keyboard audit and semantic status announcements

Date: 2026-10-28. Completed next-050 (room accessibility audit protocol) and next-096 (accessible status announcement policy). Default plan: **257 / 306 complete**, including **55 / 100 next-level milestones**. Versioned migration promotes only this new pair once; unrelated manual reopens, custom milestones and external verification states remain preserved.

## Delivered

- Queue consumption/removal and suggestion approval/dismissal recover keyboard focus to the corresponding next/last action, or the section heading when empty. Recovery scrolls only the lost focus target into view, with heading margins below the sticky toolbar. Remote queue changes never take focus or an unsent draft from chat/search.
- Connection retries recover focus to their stage when the retry button disappears. Role preview and move-position cancellation/application return focus to their opener. Existing modal Escape and device-player reload focus were exercised in the room audit.
- Queue summaries announce semantic count/current/next changes without clocks. Provider batches announce start, wait/stop transitions and a final outcome; internal creator names and progress counter ticks remain visible but outside live regions. Last outcomes remain readable and explicit action errors retain alert priority.
- Native progress detail, failure lists and retry controls remain available. New announcement handling retains only bounded strings, no history, timers, polling, network requests or storage writes. Forced colors retain a system focus outline; reduced motion suppresses the live spinner and mission progress animation.

## Verification

- npm run build: pass (screenshots/room-access-build.txt). npm run typecheck: pass (.grok/room-access-typecheck.log).
- node .grok/room-workflow-regressions.mjs: **189 passing**, zero failures: 87 script tests (including two semantic announcement tests) + 102 native tests. Log: screenshots/room-access-regressions.txt.
- Watch Room audit on development and final production: screenshots/room-access-dev.json and screenshots/room-access-production.json, both pass, clean consoles. Two isolated desktop/touch-phone contexts use real WebRTC, controlled provider documents and malformed signaling. Keyboard checks cover suggestion approval/dismissal, consumed/removed queue titles, move and role previews, reconnect retry, unsent chat focus, modal Escape, player reload, stable queue announcements and an accessibility-tree snapshot. The recovered heading is asserted visible below the sticky toolbar.
- Provider status on development and production: screenshots/status-announcements-dev.json and screenshots/status-announcements-production.json. Each desktop/mobile run applies a 100-creator clip batch with one failure plus a 100-creator live check. Each batch produces exactly two semantic DOM live-region text changes, with start/completion outcomes and reachable retry controls. No per-creator announcements; clean consoles, no overflow.
- Mission migration/copy/export/filter/reload desktop/mobile: screenshots/room-access-mission-dev.json and screenshots/room-access-mission-production.json, both pass; revision 61 and 55 default next-level completions, custom/manual rows preserved.
- Home smoke on development and production: screenshots/room-access-home-dev.json and screenshots/room-access-home-production.json, hydrated visible content, no console/page errors or horizontal overflow, no branding/auth warnings; production does not diverge from the development baseline. Both desktop/mobile pairs visually reviewed.
- Room and provider forced-colors/reduced-motion desktop/mobile screenshots visually reviewed on development and production. Focus outlines and controls are visible. Scoped git diff --check passes (line-ending notices only).

## Unverified external checks

**Actual screen-reader speech remains unverified.** NVDA was not found by where.exe nvda.exe; no Narrator/JAWS/VoiceOver/TalkBack speech session was operated. DOM accessibility-tree snapshots and live-region mutation counts do not prove spoken output. Physical-phone assistive technology, provider iframe accessibility, real ads and cross-network TURN remain external checks. This batch completes the repeatable protocol and implemented focus/status policy, not external AT certification; earlier external milestones stay open.

## Files and repeatable runbook

See [docs/ACCESSIBILITY_STATUS_AND_FOCUS.md](docs/ACCESSIBILITY_STATUS_AND_FOCUS.md) for named regions, announcement priority, focus ownership, exact browser coverage and the remaining manual speech runbook. Implementation: src/lib/status-announcement.ts; src/components/library/batch-status-announcement.tsx; use-room-list-focus.ts; room-queue-panel.tsx; room-suggestions-panel.tsx; room-connection-panel.tsx; room-role-presets.tsx; live-check-status.tsx; twitch-clips-control.tsx; mission-plan-section.tsx; src/styles.css. Browser entry points: scripts/watch-room-roles-timeline-check.mjs and scripts/status-announcement-browser-check.mjs.

---

# Revision 60 — Live playback guidance and device-local captions

Date: 2026-10-28. Completed next-045 and next-049 together. Default plan: **255 / 306 complete**, including **53 / 100 next-level milestones**. Remaining external validation is not marked complete. Existing manual reopens/custom rows survive the one-time additive migration.

## Delivered

- Live YouTube/Twitch provider events stay device-local. Host buffering no longer stops a live guest in Twitch alignment, device-start or ongoing playback paths. Explicit authorized room controls still share play/pause; recorded-video synchronization remains unchanged.
- Live playback panel distinguishes independent clocks, local loading/ad uncertainty and a confirmed room pause. Device-only reload is explicit. Neither bridge exposes a verified DVR seek window or live-edge delay, so Realhub offers no guessed DVR seeking or numerical latency.
- Captions panel inventories native subtitle/caption tracks, selects a preferred language and supports native disable. YouTube requests documented caption load/language preferences only at deliberate load/reload; Save alone does not reload. Twitch and RTC missing-track states explain the available native/local-copy fallback.
- Caption preferences never travel over room transport. Only changed Save actions write browser preference storage. Controls are memoized with stable callbacks so timeline heartbeats do not rerender their forms; inventory listeners detach with the selected player. No new polling or provider downloads.

## Verification

- npm run build: pass. Log: screenshots/room-device-build.txt.
- npm run typecheck: pass. Log: .grok/room-device-typecheck.log.
- node .grok/room-workflow-regressions.mjs: **186 passing** (85 script + 101 native), zero failures. Log: screenshots/room-device-regressions.txt.
- Device workflow on dev and final production output: screenshots/room-device-dev.json and screenshots/room-device-production.json, both pass with clean consoles. Two isolated desktop/touch-phone contexts use real WebRTC and controlled YouTube/Twitch bridges. Checks include buffering, implicit live pause observations, explicit shared pause, reload, live→VOD transition, caption language validation, save/reload persistence, no redundant preference writes, host isolation, native TextTrack selection/disable and missing-track guidance with preserved focus.
- Real local-video RTC playback: screenshots/room-device-local-dev.txt and screenshots/room-device-local-production.txt. Empty phone receives decoded frames without selecting a local file; guest caption Save keeps shared playback and focus, subtitle fallback is visible, pause/resume and keyboard seeking work, leave releases player.
- Mission migration/filters/copy/export/reload on desktop and mobile: screenshots/room-device-mission-dev.json and screenshots/room-device-mission-production.json, both pass; revision 60, 53 verified additions, custom/manual state preserved.
- Dev/production Home smoke: screenshots/room-device-home-dev.json and screenshots/room-device-home-production.json; hydrated visible content, no console/page errors, no overflow, no branding/auth warnings, no production divergence. Desktop/mobile screenshots visually inspected, as were final room captions/live panels.
- Existing guest-control browser regression on production: screenshots/room-device-controls-production.json, pass (ready checks, votes, independent play/seek policy, direct transport rejection, reload and leave).
- Scoped git diff --check: pass (line-ending notices only).

## Boundaries and entry points

The provider playback/ad events are controlled fixtures; physical-phone autoplay, real provider captions, real ad timing, verified DVR availability and cross-network TURN remain external checks. No new external integration was connected. A reload does not bypass provider restrictions or promise an exact live-edge position. The four earlier external verification milestones remain open.

Implementation: src/lib/multiplayer/room-provider-clock.ts, src/lib/multiplayer/room-device-captions.ts, src/components/library/room-live-guidance.tsx, src/components/library/room-device-captions.tsx, src/components/library/watch-room-section.tsx and src/components/library/room-stream-player.tsx. Protocol behavior and official reference links: [docs/WATCH_ROOM_DEVICE_PLAYBACK.md](docs/WATCH_ROOM_DEVICE_PLAYBACK.md). New workflow: scripts/watch-room-device-playback-check.mjs; expanded native stream regression: scripts/watch-room-local-build-check.mjs.

---

# Watch Room transport and reconnect receipts — revision 59

Verified 2026-10-28. Completed **next-042** (Room transport congestion control) and **next-048** (Reconnect queue intent reconciliation). **253/306 default milestones complete; 51 next-level complete and 49 planned.** Four earlier external verification milestones remain open. Saved manual reopens, custom milestones and private library state are preserved.

- Added a bounded per-peer reliable outbox. Chat, pause/play/seek, canonical state and receipts precede paced catalog pages. Native bufferedAmount is checked before writes; obsolete passive clocks coalesce, while explicit pause/seek/new-video state discards stale observations. Closed/recreated peers release pending bytes and timers.
- Catalog pages use their existing size limit and get one bounded same-ID search retry. Cancellation removes unsent pages; status revocation and a last-moment authority guard prevent obsolete metadata from escaping the outbox. Privacy controls continue to apply before publishing.
- Replaced blind queue mutation retries with targeted receipt queries. Stable operation IDs and host delivery epochs survive transport interruption. Applied receipts retire edits without resend; a missing receipt allows one retry only if queue and selected-video revisions still match. Host role and catalog permissions are rechecked.
- Added a 45-second edit validity window on both guest and host, a 90-second bounded receipt cache, and query fences for late originals. The edit clock comes from an accepted host timestamp advanced with a monotonic local clock. A consumed/removed title cannot reappear via a delayed reconnect retry or an expired original after cache pruning.
- Queue delivery above the shared queue shows waiting/checking/offline and applied/superseded/rejected/expired outcomes. Pending work and history are bounded; expiry retains the edit's captured queue revision. Unsent draft text remains separate from the confirmed queue. No new persistence writes or idle poller were added.

## Checks

- npm run build and npm run typecheck passed. Scoped git diff --check passed with only Windows line-ending warnings.
- **180 focused regression tests passed** (80 script tests plus 100 native protocol/mission tests). Includes outbox byte/packet caps, priority, coalescing, stale-page purge, send-time guard, stalled/throwing/closed channels, three independent peer budgets, receipt ownership, same-ID single retry, supersession, host epoch fencing, expiry after receipt-cache pruning and bounded outcome history.
- Dev and production three-client browser check: real WebRTC between desktop host, mobile-sized guest and another desktop guest. Controlled bufferedAmount pressure holds both catalog searches while chat and pause reach both guests. One retry preserves the catalog request ID. A missing edit is retried once, using its original identity. After host apply and lost acknowledgement, the guest's actual peer connections are closed/recreated; the applied receipt recovers without resending the mutation or reinserting a consumed title.
- Browser checks also prove a changed queue supersedes an absent intent, a delayed original is fenced, permission revocation produces Rejected without mutation, orphaned edits expire, and unrelated room updates preserve an unsent link draft. Desktop/mobile screenshots were visually inspected; no console errors or horizontal overflow.
- Existing privacy workflow passed on dev/production: collection preview/paging, local opt-in, single-collection revocation, held-result discard, forged private provider alias rejection, role locks, queue edits and guest reload. Role/timeline regression passed on dev/production, including replacement-host epochs, redacted diagnostics and clipboard fallback. Guest playback/readiness/voting controls passed against production.
- Mission desktop/mobile migration/filter/export/fallback/reload checks passed on dev and production. The revision-59 additive migration promotes only these two newly verified items and preserves custom/manual work.
- Home dev and production desktop/mobile render smoke passed: visible hydrated content, no console/page errors, no overflow, no branding/auth warnings and no production divergence.

Evidence: screenshots/room-delivery-verification-summary.json; room-reconnect-{dev,production}.json; room-delivery-{roles,privacy,mission}-{dev,production}.json; room-delivery-controls-production.json; room-delivery-home-{dev,production}.json. Behavior/protocol and limits: docs/WATCH_ROOM_DELIVERY.md.

The browser uses controlled buffer pressure, dropped/held messages and a deterministic clock step; this is not a physical-device bandwidth or long-duration soak measurement. External players are fixtures. Cross-network TURN and real phone media policy remain unverified. Scheduling cannot preempt bytes already admitted to SCTP. Receipt state is session-only and tab reload does not revive old intentions. No external service was newly connected.

---

# Catalog privacy and public recommendation isolation — revision 58

Verified 2026-10-28. Completed **next-043** (Guest catalog privacy review) and **next-069** (Private recommendation isolation audit), following the completed connection timeline/guest role batch (next-041/next-046). **251/306 default milestones complete; 49 next-level complete and 51 planned.** Four older external verification milestones remain open. Existing manual reopens and custom milestones are preserved.

- Host sharing now starts off per room session. Public collection selection, source details, filter/paging, a 24-title preview and Apply make grants reviewable; active collection/local/master revocations take effect immediately.
- Host authority and guest pages use catalog revisions. Held replies, pagination and known-title queue additions are checked against current access; stale additions are rejected after regrant. Current playback/confirmed queue retain their explicit access. Unrelated guest public links and role/review controls still work.
- Discovery searches title/creator only. Descriptions, saved tags, private collection labels and filesystem metadata are excluded. Local title opt-in sends an opaque alias and filename; host playback packets omit annotations.
- Any private source membership vetoes public merged metadata. Home/landing shelves, saved/history/continue, YouTube/recent, movie/anime selection, Guide evidence and topic/alias/bridge indexes share the boundary. Unlocking the private desk grants no ordinary recommendation or room visibility.
- Fixed a preparation/regrant timing issue: when host candidates rebuild, guest discovery resumes when availability returns instead of remaining on a temporary retry error. No new polling loop or per-heartbeat catalog write.

## Checks

- npm run build and npm run typecheck passed; scoped git diff --check passed (only Windows line-ending warnings).
- **361 focused regression tests passed:** room/protocol/mission 170; Guide/topics/recommendation/privacy/selectors 137; anime/film/recent/Home/clip shelf regressions 54. These counts exclude repeated focused runs and browser flows.
- Dev and production: isolated desktop host/mobile guest, real WebRTC, 120 public remote titles, local file, private source and merged private title. Verified preview/apply, paging, queue add/next/remove, local-title opt-in, single-collection revocation, revoke/regrant, held-result discard, stale queue requests, forged private provider alias rejection, role locks, current playback preservation and guest reload. A narrow mobile host also filters collections and cancels a preview.
- Production role/timeline regression passed all ten flows, including signaling recovery, redacted diagnostics, clipboard fallback and replacement host revisions.
- Guide desktop/mobile on dev and production: real public evidence, private-only signal exclusion, topic queries, feedback persistence, save failure/retry and Undo passed. Mission desktop/mobile migration/filter/export/fallback/reload checks passed.
- Home dev/production desktop/mobile render smoke: content and hydration verified, no console errors, horizontal overflow, brand/auth warnings or production divergence. Screenshots visually reviewed, including the desktop/mobile sharing controls.

Evidence: screenshots/catalog-privacy-verification-summary.json, catalog-privacy-{dev,production}.json, catalog-privacy-guide-{dev,production}.json, catalog-privacy-mission-{dev,production}.json, catalog-privacy-roles-production.json and catalog-privacy-home-{dev,production}.json. Behavior/wire audit: docs/WATCH_ROOM_CATALOG_PRIVACY.md.

External player documents are controlled fixtures. Physical phones, cross-network TURN, provider account authorization and a long personal-library soak remain unverified; no external service is newly connected. Intentional private backups keep their documented scope, and access changes cannot erase information a peer already received.

---

# Watch Room connection and roles batch — 27 October 2026

Revision **57** completes **next-041 — Watch Room connection state timeline** and **next-046 — Room role presets** together. Default progress is **249/306 complete** (47 next-level completions, 53 planned, four earlier external verification items remain open). The additive migration preserves custom entries, unrelated manual reopens and later manual status choices.

Watch Room now separates signaling, ICE, reliable room data, room-state handshake and device-player readiness in a collapsed, bounded timeline. Failed signaling and device autoplay no longer imply that a healthy peer disconnected. Scoped retries preserve healthy channels and the canonical queue; only failed/closed peer paths are recreated. Diagnostic copying exports allowlisted stage evidence and aggregate counts, excludes invitations/names/paths/titles/credentials, and has a selectable clipboard fallback.

Hosts can preview and apply Viewer, Contributor and Co-controller presets over the existing independent permissions. Custom combinations remain available. Preview/cancel changes nothing; changing controls invalidates a stale preview. Guest mutation packets carry the host permission revision, retries retain that original revision, and host-side validation rejects old commands after revoke/regrant. Canonical policy packets read the authoritative current ref. A replacement host establishes a fresh permission clock. Roles do not alter library visibility or local-file consent, and normal saved settings remain effective across reload.

Verification: build/type checks passed. The final focused regression runner passed **69 script tests + 95 native tests = 164 tests**, with zero failures. Real WebRTC desktop/touch-phone browser checks passed in development and production, covering a held handshake, keyboard preset preview/cancel, custom-state invalidation, stale and current queue/playback requests, reviewed suggestions, autoplay blocking, malformed signaling, scoped recovery, redacted copy/fallback, guest reload and replacement-host reload. Existing guest play/seek/vote/Ready/departure/reload checks also passed. Milestone migration/export/reload checks passed in both builds on desktop/mobile; Home production smoke did not diverge from development. Console/error and horizontal-overflow checks are clean. Desktop/mobile timeline, role and Home screenshots were visually reviewed.

Evidence: [Watch Room contracts and limitations](docs/WATCH_ROOM_ROLES_AND_CONNECTION.md); screenshots/room-roles-{dev,production}.json; screenshots/room-roles-existing-controls-{dev,production}.json; screenshots/room-roles-mission-{dev,production}.json; screenshots/room-roles-home-{dev,production}.json; screenshots/room-roles-regression-tests.txt; screenshots/room-roles-build.txt. Provider documents and failure injection are controlled fixtures. Physical phones, cross-network TURN, real-provider authentication/autoplay and long-session soak remain unmeasured. Durable queue-intent reconciliation across a full host process restart is still a separate planned milestone.

---

# Live allocation and dispatch batch — 27 October 2026

Revision **56** completes **next-018 — Page-specific network priority proof** and **next-030 — YouTube adaptive discovery allocation** together. Default progress is **247/306 complete** (45 next-level completions, 55 planned, four earlier external verification items still open). Additive migration preserves custom entries, unrelated manual reopens and subsequent status choices.

YouTube automatic batches adapt known-live/discovery shares to backlog age, unchecked creators and recent failure observations, with a minimum discovery share. Failed attempts rotate instead of pinning the oldest-success prefix; successful freshness and offline evidence remain separate. Existing concurrency, pacing, provider waits and visibility/pause rules are retained. Settings exposes a bounded session-only dispatch trace, while Live explains the actual allocation and per-class observation counts. Pause bypass no longer reverses FIFO order among eligible jobs. An obsolete per-response follow-list filter was removed after consolidating adaptive selection.

Verification: build and type checks passed; the broad targeted run passed **104 tests**, native queue/pause/migration checks passed **66**, the final scoped allocation/recovery/roadmap run passed **37**, and a final adaptive-store recheck passed **5** (these runs overlap; they are not a unique aggregate). A simulated 2,000-creator fixture with a permanently failing prefix and held requests reached every eligible tail creator within 400 one-second dispatches. Actual app and upstream lane tests show live starts while archives are held, retained FIFO ordering, response draining, bounded 64-event traces and cooldown preservation. Development and production browser checks passed on desktop and mobile with 1,588 YouTube and 591 Twitch creators, a stalled first YouTube response, persisted observations, navigation priority, six minutes of simulated idle time, diagnostics and milestone exports/reloads. Home production smoke did not diverge from development; console/error and horizontal-overflow checks are clean. Desktop/mobile screenshots were visually reviewed.

Evidence: [Scheduling contracts and limits](docs/LIVE_ALLOCATION_AND_DISPATCH.md), screenshots/live-allocation-{dev,production}.json, screenshots/live-allocation-mission-{dev,production}.json, screenshots/live-allocation-home-{dev,production}.json, screenshots/live-allocation-{targeted,native,final,final-store}-tests.txt, and screenshots/live-allocation-build.txt. Fixtures measure app-controlled scheduling, not real-network provider speed or physical-phone behavior. No long-running soak or external authentication was claimed.

---

# Recent discovery and pull recovery batch — 27 October 2026

Revision **55** completes **next-021 — YouTube feed gap repair** and **next-029 — YouTube endpoint-specific recovery guidance** together. Default progress is **245/306 complete** (43 next-level completions, 57 planned, four earlier external verification items still open). Existing custom/manual statuses are preserved by the additive migration.

YouTube and Twitch now have Fresh on sections with confirmed newest publication times, explained recent recommendations and saved open history. Unknown/relative/future/live/upcoming publication dates do not masquerade as new uploads; missing Twitch VOD dates no longer become the pull time. Mobile uses swipeable rows, with eight cards initially.

Recent pulls support 12/24/50/100 creators and use up to four creators per response, retaining two for small lists. A controlled 12-creator refresh uses three app responses rather than six; upstream transfer limits and cooldowns are unchanged. Completed healthy responses share merge work. Possible RSS gaps have an explicit, independently resumable two-page repair, and feed/archive/live recovery actions honor their own wait or a real provider-wide hold.

Build/type checks passed. **1,021 script tests + 622 native TypeScript tests passed**; final native results are recorded separately after an import-resolution correction. Development/production desktop/mobile tests verify shelves, recommendations, player opening, pull rotation, repair, scoped/global cooldowns, persisted checkpoints and milestone migration. The selector also passed a 100k-entry cooperative/bounded fixture. See [Recent discovery contracts and evidence](docs/RECENT_DISCOVERY_AND_PULL_RECOVERY.md) for paths, bounds and limitations. Provider buffering/authentication and real network throughput were not measured.

---

# Video opening and MyFreeCams default — 27 October 2026

YouTube and Twitch iframe mounting now takes priority over preview ranking preparation, playback-neighbor selection and film/anime review downloads. Preview ranking starts as cancellable background work; the player starts with its selected ID while its bounded Next/Previous queue prepares. Review tools retain their existing functionality behind an independent lazy boundary. MyFreeCams defaults to Inside Realhub, with that action first; explicitly saved direct-website choices still win. Login recovery, first-party links, remembered modes and background-page unloading remain available.

Verification: build and type checks passed; 29 focused provider/worker/performance regressions passed. Desktop and mobile development/production browser checks use 20,001 synthetic catalog entries and controlled provider documents. Final production preview opening measured 156–428 ms; Watch now to full player measured 67–366 ms. MFC default, explicit external-mode persistence across reload and switching back all passed. Existing provider recovery/backup browser checks and worker crash recovery checks passed on desktop and mobile. Development and production Home smoke checks passed without console errors or production divergence; desktop and mobile screenshots were visually reviewed. Screenshots and reports: `screenshots/video-opening-{dev,production}.json`, `screenshots/video-opening-provider-dev.json`, `screenshots/video-opening-recovery-dev.json`; build: `screenshots/video-opening-build.txt`.

Limitations: these timings measure app-controlled startup, not real provider buffering, playback eligibility, embedded login or physical-phone performance. No real adult media or account was accessed. This is a regression fix; milestone revision 54 and completion counts are unchanged.

---

# Worker recovery and artwork lifecycle batch — 26 October 2026

Revision 54 completes **two milestones together**: **next-013 — Worker crash recovery** and **next-016 — Artwork decode cancellation**. Default progress is **243/306 complete**: 41 next-level milestones verified, 59 next-level briefs planned, and four older external verification milestones still open. The additive migration promotes only these two defaults and preserves unrelated manual reopens, custom notes and later status choices. The eight-hour soak, provider allocation benchmark and recommendation CPU budget remain separate open work.

Baseline: search failures could retain generation-ambiguous request handling and rebuild on later syncs; previews had no failure callback/deadline, YouTube ranking lacked message-error/deadline recovery, and failed background jobs could leave pending state or restart after incidental updates. Photos decoded eight dimensions independently from thumbnail workers. Cancelled native bitmap promises could accumulate across visits, and a lower image budget did not immediately withdraw excess unfinished image leases. Existing thumbnail caches, profile controls, virtualized cards and saved media were retained.

## Delivered together

- Search keeps one generation-owned worker, bounded backpressure packets and at most eight pending queries. Crashes, unreadable/invalid messages, constructor/postMessage errors and a 15-second deadline settle requests, release its source/index and show a recovery notice. Superseded generations settle to null and stale owners/replies cannot publish. Failed syncs do not rebuild on every keystroke; the existing cooperative local scan remains available and Retry search index uses the current query/catalog. Idle retirement remains active.
- Preview ranking gains structured-clone/error/deadline recovery, bounded result checks, disposal of candidate maps/scheduled packing and an explicit retry control. Compatible completed suggestions remain. Failures latch across metadata/watch-count changes; explicit retry, Refresh suggestions or a new title may start fresh work. Its normal short reuse grace remains.
- YouTube ranking tracks shelf/page outcomes under a 30-second watchdog, catches worker/message/post errors, releases enrichment holds and preserves compatible shelves/newest-first browsing. Retry personal ranking starts fresh work; incidental inputs cannot silently retry a failed owner. Statistics guards aborted callbacks, releases failed packing waits and offers retry while preserving its last snapshot. Adult browse starts its deadline before packing, releases queued/sent snapshots on failure and resolves pending state.
- Photos and local thumbnail capture now share a native bitmap pool, capped at four calls or the current lower profile ceiling and 96 waiting jobs. Cancellation immediately settles the caller, removes queued source references and prevents publication. Already dispatched native work keeps its slot until its actual promise settles; obsolete returned bitmaps close rather than admitting unbounded replacement calls. Lower ceilings stop new dispatch until existing native calls drain.
- Thumbnail capture aborts its decoder scope on completion, timeout and cancellation; resets its video and zeros its canvas. A delivered bitmap closes immediately after drawing, before encoding. Late blobs cannot repopulate the cache. Photo dimension jobs abort on unmount and obsolete outcomes cannot change metadata. Existing photo URL cleanup and bounded thumbnail cache eviction remain intact.
- Shrinking the image budget withdraws excess revocable unfinished image leases, preferring low-priority work. Thumbnail worker reductions abort excess jobs and wait for cleanup. Existing viewer/visibility pauses still release unfinished DOM sources without blacklisting healthy URLs, and the existing profile-aware blob cache applies its current byte/entry ceiling to late results.
- Existing opt-in Performance scorecard gains small on-demand search/decoder/admission counters: active, waiting, cancellations, late bitmap closes and peak calls. The export adds no media buffers, titles, paths, raw error text or source URLs in these new fields. No polling, provider budget increases, external downloads or native service changes were added. Documentation: docs/WORKER_ARTWORK_LIFECYCLES.md.

## Verification for revision 54

- **npm run build** and **npm run typecheck** passed. The final complete regression passed **1,635 tests, zero failures**: 1,014 script tests with two bounded workers and 621 native TypeScript tests. Focused lifecycle/media tests passed **21 tests**; existing image-admission/thumbnail-queue/blob-URL tests passed **17 tests**.
- Eight new policy tests cover 100 cancelled native decode cycles, queue limits, cancellation/source release, disposal, decoder failure, lower profile dispatch, thumbnail worker reduction, search crash/timeout/unreadable replies, explicit latest-query retry, obsolete generations and constructor/postMessage failure. The existing search-client regression now requires superseded requests to settle and supplies the full typed result packet, while retaining acknowledgement/backpressure, bounded abandoned typing, stale-reply and handled-error assertions.
- Final development and production Chrome workflows passed in isolated desktop (1440x1000) and mobile (390x844) browsers, with real application workers plus deliberate error events. They verify failed search falls back without restarting on typing, retries the latest beta query, and retains one index; preview refresh failure preserves compatible suggestions, remains failed across the preview watch-count update and explicitly retries; statistics recovers from constructor failure; YouTube ranking exposes and recovers through its retry control.
- A valid PNG generated by the browser exercised real native ImageBitmap ownership with held completion promises. Six photo visits with eight files each left only four native calls on both viewports, zero photo-owned URLs after navigation, and all four obsolete bitmaps closed after late completion. The exported scorecard confirmed empty active/queued decode counts, peak no greater than four, late-close counters and no synthetic title text.
- The existing artwork browser workflow now performs **100 viewer interruptions per viewport** against **60,000 synthetic titles**, held CDN responses and an offline Companion. Development and production both passed visibility/pagehide/pageshow, preview/player admission withdrawal, return, live low-memory admission, and real cross-tab text-first/restore controls without console errors, overflow or fallback-candidate exhaustion. Final mounted artwork was eight images on desktop and four on mobile. Production preview readiness measured 492 ms desktop / 421 ms mobile in this run; these are fixture timings, not a claimed percentage speedup or real-provider latency.
- Home smoke passed in development and production desktop/mobile; production matches the development baseline without console/runtime errors, auth warnings, brand warnings or overflow. Mission browser checks passed on both builds, verifying revision 54, 41 next-level completions, bounded paging, exports/reload and preservation of custom/manual choices. Final recovery, diagnostics, artwork and Home desktop/mobile screenshots were visually inspected. File-scoped git diff --check passed.

## Evidence and entry points

- Search: src/lib/videos/search-worker-index.ts; src/components/library/search-worker-recovery.tsx, global-search.tsx and library-app.tsx. Worker consumers: use-preview-ranking.ts, pre-video.tsx, use-youtube-ranking.ts, youtube-deep-discovery.tsx, use-library-stats.ts, stats-section.tsx and use-adult-browse.ts.
- Artwork: src/lib/videos/bitmap-pool.ts, hw.ts, thumbs.ts, image-load-budget.ts and thumbnail-queue.ts; src/components/library/photos-section.tsx and performance-scorecard.tsx. Saved catalog/preferences/cache formats remain unchanged.
- Tests: scripts/worker-artwork-batch.test.mjs, worker-artwork-browser-check.mjs, updated media-performance.test.mjs and artwork-viewer-check.mjs; existing search-worker-lifecycle.test.mjs and resource tests; mission defaults/migration and browser assertions; regenerated NEXT_LEVEL_MILESTONES.md.
- Artifacts: screenshots/worker-artwork-{dev,production}.json and desktop/mobile search-recovery/preview-recovery/diagnostics PNGs; corresponding downloaded measurement JSONs. Stress: worker-artwork-100-{dev,production}.json and artwork/player/text screenshots. Home: worker-artwork-home-{dev,production}.json/PNG. Mission: worker-artwork-mission-{dev,production}.json. Gates: worker-artwork-build.txt, worker-artwork-tests.txt and .grok/worker-artwork-*.log. The full runner reuses .grok/studio-batch-regression.cmd with two script workers.

Limits: native createImageBitmap cannot be forcibly aborted; obsolete calls remain counted until they settle, and a stuck call holds a slot rather than allowing unlimited replacements. Browser network/cache/decoded-image internals and exact heap/GPU bytes are not measured by DOM cleanup. This is a 100-cycle ownership test, not an eight-hour soak, physical-phone test or proof of live-provider availability. No optional ML models, native Companion engines, user media or saved personal state were reset or downloaded for verification. All fixture writes used isolated browser contexts, and the app's existing development server remains running.

---

# Reproducible recipes and keyboard coverage batch — 26 October 2026

Revision 53 completes **two milestones together**: **next-085 — Reproducible generation recipes** and **next-095 — Keyboard command coverage map**. Default progress is **241/306 complete**: 39 next-level milestones verified, 61 next-level briefs planned, with four older external verification milestones still open. The one-time additive migration promotes only these two defaults; earlier manual reopens, custom instructions and later status choices remain intact. Storage/output retention, Companion protocol negotiation and assistive-technology room verification remain separate open work.

Baseline: recipes immediately replaced the form and kept prompts/seed/checkpoint but lacked sampler, hash/revision evidence or a missing-model review. Global search/sidebar/player key handlers had separate scope guards; there was no discoverable command map or owner-scoped conflict preference. The existing player is itself a Radix modal, which required an explicit viewer exception rather than blocking every dialog.

## Delivered together

- Recipe version 2 records available engine observations (sampler, scheduler, guidance, denoise, returned seed, model name and short engine hash), submitted square dimensions/settings and exact matching inspected-install family/revision/recorded SHA-256. Missing evidence remains unrecorded. Install digests and imported provenance are declarations, not a fresh whole-file verification. The result captures the submitted form separately from later edits.
- The updated AUTOMATIC1111 bridge pins Euler / Automatic / guidance 7; the existing fixed Qwen graph reports euler / simple / guidance 1 for Turbo or 4 otherwise, denoise 1. These are supported form parameters, not arbitrary imported engine instructions. Unknown or different recipe parameters produce a mapping warning before load. Different engines/weights/versions/hardware are explicitly not promised pixel-identical.
- Use recipe and imported recipes open an explicit preview of recorded settings and evidence. No form values change until Load reviewed recipe. A missing/unverified model leaves load disabled until the user chooses an installed alternative; differences and unverified hashes/revisions require acknowledgement. A different engine must first be selected/checked in the main form. An explicit alternative never bypasses the existing header/component preflight or starts generation/downloads.
- Existing version-1 recipes remain readable and use the same eight-slot owner namespace. Version-2 import/export allowlist nested fields, validate schema consistency, enforce a 64 KB byte limit and reject unsupported future versions or credential/path-bearing model metadata. Intended prompt text remains portable. Unknown scripts, server config and credential fields are discarded. Save, rename, remove/undo, cross-tab list refresh and failed-write preservation remain working.
- Header and player Keyboard shortcuts buttons and ? open a searchable contextual map. It describes library, virtualized media-card, local player, native iframe and dialog keys, including why a command is unavailable. The map does not execute commands. Owner-scoped search/navigation binding toggles resolve conflicts; player/provider keys are explicitly fixed. Preferences write on change, use compact storage events and reset on owner changes.
- Shared scope guards protect typing, native video/audio controls, composition, repeats, prevented events and secondary dialogs. The viewer's own keys remain allowed. Library search/navigation shortcuts stay suppressed while viewing. Help supports Tab containment, nested Escape dismissal and return to the exact opener/fallback. Search, title and close controls stay visible while its bounded command list scrolls; the mobile help input retains a 44px touch height. No polling, full-catalog copies or per-card key listeners were added.

## Verification for revision 53

- Final **npm run build** and **npm run typecheck** passed. Full regression passed **1,626 tests, zero failures**: 1,006 script tests with two bounded workers and 620 native TypeScript tests. This includes ten new recipe/keyboard policy tests and the new revision-53 additive migration test. The focused recipe/local-tools run passed all 25 tests.
- Policy coverage: v1/v2 round-trip/restore; model source/digest consistency; allowlisted portable export with canary credentials; missing/alternate model and engine mismatch; unsupported sampler mapping; actual captured seed/settings and provenance; fixed supported Qwen profile; shortcut search/context, composition/repeat/prevented/text/modal ownership, and safe conflict preference defaults. Deterministic parameter replay reproduces settings, not GPU pixels.
- Final isolated desktop (1440x1000) and mobile (390x844) Chrome workflows passed on development and the final production output, with zero browser console/runtime errors or horizontal overflow. Checks cover explicit preview/load without generation, schema-2 JSON export, missing model choice/acknowledgement, retained saved recipes on storage failure, legacy import, parameter/preference reload, virtual-grid Arrow/Home/End and Enter navigation, provider N/P and iframe text ownership, help focus containment/return, and nested help preserving the player.
- A real bundled MP4 was imported through the app's file control in those isolated browsers. App K play/pause and Right seek worked on desktop/mobile; focused native video keys were not intercepted. Local player help closed back into the player. This uses existing sample media, not a real external provider or physical phone.
- Existing studio-only browser regression passed in development desktop/mobile: explicit engine checks, prompt/seed validation, navigation during generation, captured settings, previous image preserved on engine failure, PNG download, recipe export/import, rename validation, remove/Undo and image/settings retention. Its import assertion now awaits/closes the new preview before checking the underlying saved list.
- Home smoke passed in development and final production desktop/mobile. Final production matches the passing development baseline with no console/runtime errors, brand warnings, auth warnings or overflow. A first development smoke observed transient Chrome network-change errors; a clean repeat passed without suppressing errors. Mission workflows passed in development and production, verifying 39 next-level completions, revision 53, bounded paging, custom/manual preservation, exports and reload.
- Final desktop/mobile help, recipe/missing-model and Home screenshots were visually inspected. That review found and corrected a flex-shrunk mobile search input; its 44px minimum is now asserted by the browser test. File-scoped git diff --check passed.

## Evidence and entry points

- Policy/UI: src/lib/studio-recipes.ts, studio-session.ts, keyboard-commands.ts; src/components/library/studio-recipes.tsx, stable-diffusion-section.tsx, keyboard-help.tsx, top-bar.tsx, library-app.tsx, global-search.tsx and player.tsx. Native metadata: companion/creative-tools.mjs and qwen-engine.mjs. Workflow notes: docs/RECIPES_AND_KEYBOARD.md.
- Tests: scripts/recipe-keyboard-batch.test.mjs and recipe-keyboard-batch-browser-check.mjs; updated local-tools tests/check; mission defaults/migration and browser expectations; regenerated NEXT_LEVEL_MILESTONES.md.
- Evidence: screenshots/recipe-keyboard-{dev,production}.json and desktop/mobile help/recipe/missing-model PNGs; recipe-keyboard-local-tools-dev.json and studio/recipes PNGs; recipe-keyboard-home-{dev,production}.json/PNG; recipe-keyboard-mission-{dev,production}.json. Build/tests: screenshots/recipe-keyboard-build.txt and recipe-keyboard-tests.txt; type/browser logs: .grok/recipe-keyboard-*.log. Full regression runner uses the existing .grok/studio-batch-regression.cmd with two script workers.

Limits: no real GPU generation, native Companion restart, new model download, cloud synchronization, provider session or physical-phone/screen-reader verification was performed. Companion must restart to activate the updated native metadata/pinned sampler behavior. Imported or sidecar hashes are not independently rehashed during recipe review; engine reports can be absent. Recipes are local settings/provenance documents, not saved output images. No real user data was reset, no external messages were sent, and no native integration is promoted based on browser fixtures.

---

# Model compatibility, requirements notes and generation lifecycle batch — 26 October 2026

Revision 52 completes **three related milestones together**: **next-081 — Image model compatibility preflight**, **next-083 — Model card requirements notes**, and **next-084 — Generation job lifecycle**. Default progress is **239/306 complete**: thirty-seven next-level milestones verified, 63 next-level briefs planned, with four older external verification milestones still open. The additive migration promotes only these three defaults for older plans and preserves unrelated manual reopens, custom instructions and later status choices. Resumable downloads, portable recipe provenance and saved-output retention (next-082/085/086) remain open.

Baseline: existing transfers checked file format and selected filenames, but browser model selection lacked an exact structural/component preflight and a review/commit distinction. Model-card guidance was generic rather than saved per model. Generation was single-flight in memory and retained a result across navigation, but reload discarded job identity/outcome and there was no durable interruption receipt.

## Delivered together

- Companion has a version-1 installed-model preflight endpoint. New reads resolve the known model folder and reject path escapes. They inspect at most an 8 MB safetensors header, validate bounded offsets/shapes and return a small allowlisted report; up to 32 metadata summaries are cached by size/modification time. Full weights do not enter browser memory. Publisher revision/digest records are read within a separate 4 KB bound and labeled as recorded provenance, not a new full-file digest check.
- The detector distinguishes complete supported SD1/SDXL structures from incomplete conditioning/decoder sets, unsupported SD2-style structures, LoRA add-ons, standalone encoders/VAEs and unknown architectures. The fixed Qwen-Image 2.1 workflow requires its recognized diffusion structure/filename, matching qwen3vl_8b_w4a8 encoder and matching Qwen 2.1 VAE headers. A filename alone cannot promote Qwen or a language-model artifact to an AUTOMATIC1111 checkpoint.
- Model candidates are separate from the saved selected model. Review shows exact missing/unsupported requirements, source provenance and weight-file size with an explicit hardware/VRAM uncertainty label. Only an explicit Use reviewed model commits a candidate. Failed, malformed or future-version reports preserve the previous selection and block generation. Saved valid choices remain available after reload/review. Both actual local generation paths recheck compatibility in Companion before calling an engine; browser state cannot bypass this.
- Engine connection/readiness, reviewed model structure and real generation remain separate. Engine status is checked only on request. Overlapping review/engine actions are disabled, the selected-engine status route is used after start/stop, and a ready API awaiting model review is labeled accurately. Existing model transfers remain explicit and stream directly to Companion. No additional model download, package installation, engine process or GPU job was started by this batch.
- A requirements notebook stores up to 64 owner-reviewed notes, with four mounted per page. Each records a canonical public Hugging Face URL, revision, exact filename, family, required engine, artifact role, license text, required components and hardware notes. Checklists distinguish checkpoint, diffusion weights, LoRA, VAE, text encoder and pipeline roles. Branch/ambiguous revisions, unsupported combinations, license acceptance and hardware suitability stay unverified; a note cannot enable or select a model.
- Pasted/file JSON is strictly bounded and allowlisted, then shown as a staged form/checklist before explicit Save. Commands, workflows and credential fields are discarded; model-card prose is plain text rather than executable HTML/instructions. Changing a field invalidates the staged review. Individual note JSON exports preserve intended requirements while excluding unknown fields. Saved notes use existing owner-scoped IndexedDB activity documents and a local mirror with monotonic timestamps, visible save/load errors and retry. A dual-write failure preserves the prior saved note and the staged form.
- Generation now records queued, running, cancel-requested, completed, cancelled, failed and interrupted states in an eight-receipt owner-scoped ledger. Serialized writes save the intent and running receipt before any engine request; dual-storage failure prevents dispatch. Captured request parameters and optional output metadata/native ComfyUI ID are separate from later form changes and preview bytes. The existing two-owner in-memory session limit and one-preview policy remain.
- Reload converts unfinished receipts to interrupted without contacting or resubmitting the engine. This bridge currently has no supported browser reattachment path: AUTOMATIC1111 exposes no owned request ID here, and returned ComfyUI IDs are completed references while existing temporary engine history cleanup remains. An unknown transport result is not labeled completed or confirmed cancelled. Explicit cancellation coalesces repeated requests, can prevent a not-yet-sent request, and otherwise waits for an outcome. Disconnect/cancellation preserve the previous completed image; a partial result cannot overwrite it. Loading historical parameters only fills the form.
- Receipts contain no image bytes or object URLs and do not promise preview recovery after reload. Existing recipe/download behavior remains separate. Documentation: docs/STUDIO_MODEL_READINESS.md, linked from companion/README.md. Repository credits already include AUTOMATIC1111, ComfyUI, Qwen and their model distributions and remain available in Mission plan.

## Verification for revision 52

- Final npm run build and npm run typecheck passed. Full regression passed **1,615 tests, zero failures**: 996 script tests with two workers and 619 native TypeScript tests. The focused studio/installer/local-tools/mission run passed **43 tests**. npm run check:recommendations passed the existing reviewed baseline without re-recording it.
- Thirteen new policy tests cover complete/incomplete/SD2/component classification, real Qwen structural and component requirements, bounded/missing/malformed paths and changed-header cache behavior, source allowlists, server-side preflight before engine requests, plain-data requirements import, every artifact role, false ready claims, pinned/ambiguous revisions, note bounds/no eviction, persistence-before-submission, interrupted recovery with zero requests, intent-save failure, cancel-before-submit, duplicate cancellation, network uncertainty, previous-image preservation and bounded strict job history. Existing session subscription assertions still test no notification after unmount while allowing the new visible lifecycle phases.
- The combined browser workflow passed on final development and production in desktop (1440×1000) and touch-phone (390×844) Chrome with isolated real IndexedDB/localStorage and synthetic Companion responses. It checks incompatible Qwen/future reports cannot replace a prior selection, note staging and full JSON exports, no command execution/download on import, dual-write note failure, reload, and a different owner's canary record remaining absent.
- The same workflow verifies the actual held request has reached the mock engine before reload, then finds an interrupted receipt with identical submitted prompt and no additional request. A busy engine blocks a duplicate action. In-flight cancellation and disconnect preserve the completed preview, failed intent persistence makes no engine call, and history retry works. Missing Qwen components block selection; only a successful review enables its distinct route, and a returned native ID is retained separately. No console errors or horizontal overflow occurred.
- Existing image/recipe workflows passed in development and production desktop/mobile using the studio-only mode: explicit engine checks without polling, prompt/seed validation, generation surviving navigation, captured submitted settings, prior image after engine failure, actual PNG download, actual recipe export/import, rename validation, remove/Undo and stable saved settings. Native remote-desktop sessions and external video verification were excluded from this focused regression mode.
- Actual installed files were inspected read-only through the new module: the SD1.5 checkpoint and the Qwen 2.1 Turbo diffusion model with matching encoder/VAE passed structural preflight. The installed Qwen bundle totals about 14.24 GB on disk. These checks loaded headers only, not full weights or GPU state. Native status reports show both engines disconnected and the running Companion lacks the new preflight flag. Its process/configuration was preserved; Companion must restart to load the updated backend, and engine startup/generation remain explicit later actions. No real GPU generation was claimed.
- Home and mission workflows passed in development and production. Production Home matches the development baseline without console, overflow, auth or brand warnings. Mission checks verify thirty-seven completed additions, bounded paging, custom/manual preservation, current exports and reload. Final desktop/mobile compatibility, notes, job-history and Home screenshots were visually inspected; controls wrap and labels remain readable.

## Evidence and entry points

- Companion: companion/studio-model-preflight.mjs; existing studio-models.mjs, creative-tools.mjs and qwen-engine.mjs. Studio UI: src/components/library/stable-diffusion-section.tsx, studio-model-library.tsx, studio-model-requirements.tsx and studio-job-history.tsx.
- Notes/report policy: src/lib/studio-model-notes.ts. Receipt policy/session: src/lib/studio-jobs.ts and studio-session.ts. Existing persistence is reused through studio-documents.ts; local-tools.ts marks unknown transport outcomes and studio-settings.ts validates supported settings. Existing profile, recipe, library, rating and draft stores remain separate.
- Tests: scripts/studio-readiness-batch.test.mjs and studio-readiness-batch-browser-check.mjs, updated local-tools.test.mjs/local-tools-check.mjs, existing studio-models.test.mjs, mission migration/default tests and regenerated NEXT_LEVEL_MILESTONES.md.
- Artifacts: screenshots/studio-batch-{dev,built}.json with desktop/mobile compatibility/requirements/jobs PNGs and downloaded note JSON; studio-batch-existing-{dev,built}.json and recipe/studio PNGs; studio-batch-home-{dev,built}.json/PNG and studio-batch-mission-{dev,built}.json. Native evidence: studio-batch-installed-{sd,qwen}-preflight.json and studio-batch-native-status.json. Gates: studio-batch-build.txt, studio-batch-tests.txt and .grok/studio-batch-*.log; bounded regression runner: .grok/studio-batch-regression.cmd.

Limits: structural header evidence is not whole-weight correctness, measured GPU suitability, licensing approval or real generation success. Browser fixtures do not establish physical-phone behavior or native reconnection. The existing Companion needs a restart for this backend update; no running service, engine, model transfer or native configuration was replaced automatically. Job receipts and model notes are local per-user documents rather than cloud synchronization or new library-pack entries. Preview bytes remain session-only, arbitrary pipelines stay unsupported, and resumable downloads/output retention and the existing external milestones remain open.

---

# Story accessibility, deterministic replay and racing contract batch — 26 October 2026

Revision 51 completes **three related milestones together**: **next-088 — Announcement card accessibility**, **next-089 — Chat Plays deterministic replay**, and **next-090 — Local racing adapter contract**. Default progress is **236/306 complete**: thirty-four next-level milestones verified, 66 next-level briefs planned, with four older external verification milestones still open. The one-time additive migration promotes only this batch for older plans and preserves unrelated manual reopens, custom instructions and later status choices. The local racing contract is delivered as an offline boundary/validator only; no installed-game integration or real authenticated transport is marked connected.

Baseline: Story exports silently ellipsized text using a separate approximate HTML preview; there was no measured pre-download warning or full text alternative. The battle simulator had deterministic rules but no retained event trace, checkpoint comparison or replay import/recovery. The AI Blueprint described a future local controller without an executable observation/intent/acknowledgement boundary.

## Delivered together

- Story export loads its canvas module only on an explicit review action. The actual 1080×1920 PNG uses measured text regions, bounded adaptive font sizes and grapheme-aware wrapping when supported. Long creator/title/message fields either fit or produce named shortening warnings before the download link appears. The older HTML sketch is bounded and explicitly distinguished from the measured export.
- The review shows the actual PNG, per-field line/font/shortening details and computed text/background contrast ratios. All four drawn text-color pairings exceed 4.5:1. A downloadable/selectable full caption preserves the complete announcement, validated Twitch and YouTube channel links, image description and manual Story Link-sticker/profile guidance. Invalid stored channel links block export with a useful error. Copy/Open/download actions do not alter manual sharing marks. Preview object URLs release on replacement/navigation and obsolete preparation results are ignored.
- Chat Plays records normalized simulated actions with a bounded seed/window configuration, relative monotonic event times and a non-security state checksum after each event. Voting, latest-valid ballots, duplicate rejection, invalid/late message handling, whole-sequence ties, execution order and resource checks use the existing battle reducer. The seed produces repeatable optional sample votes; it is not connected chat. At most 512 events are retained without silent prefix eviction, with the last slot reserved for emergency stop. Existing voter/message/queue/log bounds remain.
- Replay JSON/file imports validate version, simulator, exact fields, size, event order and checkpoints before replacing the review. Step-through and full verification show the first mismatched event with expected/actual checksums and stop verification there. Replay review does not mutate the current battle. Emergency stop clears live/replay votes and pending moves, cancels held imports, and remains usable when the recording clock is outside its ordinary range. A stopped replay can restart only through an explicit review action.
- One explicit saved replay per current app user uses the existing IndexedDB activity-document path and owner namespace. Nothing writes on every ballot. Save/load failure is visible and retryable; a failed replacement leaves the prior committed replay readable. Other owners' records do not load. JSON exports contain only the normalized simulated events/configuration/checkpoints; the UI explains that simulated viewer text should be reviewed before sharing. The battle still resets on leaving the lab; only an explicit Save retains its replay.
- AI Blueprint includes an offline version-1 racing contract validator and synthetic example export. Known observation, strategic intent, acknowledgement and stop messages use exact field/command allowlists. Strategies are push, conserve, hold-line and overtake-clear, with one to four conditional stages per intent and four active/queued intents total. No raw keys, steering values, paths or shell commands are accepted. JSON messages cannot grant authentication.
- A future service must supply verified paired transport context, matching session, exact approved origin and expiry. The validator denies unauthenticated/unpaired/expired/mismatched origins or sessions, duplicate/out-of-order intents, stale/future telemetry, unknown versions/fields/commands and unsafe conditions. Every local dispatch rechecks current observations, readiness, danger, grip and required clearance. A new observation is required after a sequence stage. Admission, dispatch and matching acknowledgement are distinct; no game input is executed by the website.
- Acknowledgement/intent/session expiry, disconnect, unsafe observations, backwards clock or emergency stop clear active and queued strategies and latch stop. The future local controller must call the maintenance function during its own connection/scheduling lifecycle. The offline UI can simulate trust revocation, lost clearance, fresh telemetry, time advance, staged acknowledgement and emergency stop without network work. Documentation specifies the transport trust boundary and supervised native work still required: docs/LOCAL_RACING_ADAPTER_CONTRACT.md, linked from companion/README.md.

## Verification for revision 51

- Final npm run build and npm run typecheck passed. Full regression passed **1,601 tests, zero failures**: 983 script tests with two workers and 618 native TypeScript tests. The final focused creator/legacy-signal/mission run passed **25 tests**; it includes the expired/invalid recording-clock emergency-stop assertions. npm run check:recommendations passed the existing reviewed baseline without re-recording it.
- Thirteen new policy tests cover measured safe regions and contrast, long Unicode warnings/full captions, valid channel links, immutable packs/manual marks, identical normalized replay results, first divergence, malformed/out-of-order/oversized imports, reproducible seeds, full-capacity stop reservation, clearing partially replayed votes/queues, strategic dispatch/ack separation, fresh subsequent observations, transport-context rejection, unknown/duplicate intents, telemetry/intent age, live condition checks, bounded queue/logs, timeouts, disconnects, unsafe observations and backwards clocks. A native mission test covers the revision-51 additive completion migration while preserving unrelated integration/custom status.
- The combined creator workflow passed on final development and production builds in desktop (1440×1000) and touch-phone (390×844) Chrome using isolated real IndexedDB/localStorage. It exports long Unicode creator/title/message cards, checks exact PNG dimensions, reads the downloaded caption bytes with both full stream links, verifies unmarked sharing and releases preview URLs on navigation.
- The same browser workflow records a real local battle with duplicate and invalid ballots, verifies matching resources/checkpoints, downloads/imports the JSON and saves/reloads it under the current owner. A different owner's seed-999 record cannot replace the seed-42 save. An injected write failure preserves that previous save; malformed input preserves review state, changed checkpoints report event 3, emergency stop clears a partially advanced replay, and a held file import cannot reopen it after stop. Seeded sample input stays labeled local.
- Browser racing checks admit a strategic sequence, separately dispatch and acknowledge, send fresh telemetry before the next step and stop on acknowledgement timeout. Missing clearance, revoked fixture authentication, unexpected authentication fields and malformed JSON cannot enqueue work. The example download is visibly synthetic. No native game, real service, account session or external chat connection was opened.
- Existing Stream Signal browser coverage passed on development and production desktop/mobile: channel validation, all four editable drafts, clipboard and platform handoffs, manual share/Undo separation, actual text/PNG exports, eight-pack archive paging, recovery across immediate navigation/reload, owner isolation, injected disk-save failure/retry and automatic voting-window closure. Platform handoffs were intercepted; no post was sent.
- Home and mission workflows passed on development and production. Production Home matches the development baseline with no console, overflow, auth or brand warnings. Mission tests verify thirty-four completed additions, bounded card paging, current statuses, manual/custom preservation, clipboard fallback, exports and reload. Development/production Home, final Story review/PNG, replay and contract screenshots were visually inspected; phone controls wrap and retain readable labels without horizontal overflow.

## Evidence and entry points

- Card: src/lib/stream-signal-card.ts and src/components/library/signal-story-export.tsx; existing stream-signal-section.tsx integration. Recorder/playback: src/lib/stream-signal-replay.ts, existing stream-signal-lab.ts, src/components/library/stream-signal-lab.tsx and stream-signal-replay.tsx. Existing owner-scoped workspace document persistence is reused; pack/profile schemas and manual publication marks are unchanged.
- Offline boundary: src/lib/racing-adapter-contract.ts, src/components/library/racing-contract-lab.tsx and docs/LOCAL_RACING_ADAPTER_CONTRACT.md. Companion implements no racing endpoint or game control in this batch.
- Tests: scripts/creator-tools-batch.test.mjs, creator-tools-batch-browser-check.mjs and updated stream-signal-check.mjs; additive mission migration/default tests and regenerated NEXT_LEVEL_MILESTONES.md.
- Artifacts: screenshots/creator-batch-{dev,built}.json; desktop/mobile Story review, actual PNG/caption, replay JSON/PNG and contract JSON/PNG; creator-batch-existing-{dev,built}.json and existing announcement screenshots; creator-batch-home-{dev,built}.json/PNG and creator-batch-mission-{dev,built}.json. Gates/logs: screenshots/creator-batch-build.txt, creator-batch-tests.txt and .grok/creator-batch-*.log. Full regression runner: .grok/creator-batch-regression.cmd.

Limits: desktop/touch-phone Chrome fixtures do not establish physical-phone sharing, social publication, real chat, an authenticated local transport or installed-game behavior. The adapter's supplied trust context is a caller responsibility; editable offline flags are test data, not authentication. Continuous driving, telemetry correctness, native pairing and supervised game verification remain external work. Replay checksums detect deterministic differences rather than tampering; imported simulations cannot operate a game. Ordinary replay offsets span one day; reset starts a fresh recording, and emergency stop remains available. Explicit lab replay Save is local to the current app user's browser and is not cloud synchronization or a library-pack replay backup. Existing external verification milestones remain open.

---

# Provider capabilities, pull quality and login recovery batch — 26 October 2026

Revision 50 completes **three related milestones together**: **next-067 — Adult provider capability registry**, **next-068 — Adult pull quality fixtures**, and **next-070 — Saved provider login guidance**. Default progress is **233/306 complete**: thirty-one next-level milestones verified, 69 next-level briefs planned, with four older external verification milestones still open. The additive migration promotes only these three verified defaults for older plans and preserves unrelated manual reopens, custom instructions and later status choices. **next-069 remains open**, because its prerequisite next-043 guest-catalog privacy review remains unfinished.

Baseline: source labels conflated catalog pulls with embedded playback, including MFC; several malformed responses could resemble empty catalogs. Missing publication dates could become download-time dates, numeric image IDs could be dropped, and only MFC had a legacy remembered viewing mode. Provider login failures lacked a consistent saved first-party recovery path.

## Delivered together

- One registry describes the existing seven adapters' media, search scope, paging, sort and player capabilities. Adults source controls and live directory admission use that registry. Live-only selections disable archive/sort controls and explain that search filters the fetched directory; Reddit explains its community-window scope. MFC is labeled as official-site viewing with an optional whole-page view, distinct from a video-player integration. Unsupported destinations remain external links. The existing adult/private classifier is unchanged; modifying capability labels cannot make a built-in source public.
- The existing seven adapters have bounded synthetic, redacted response fixtures that execute their actual conversions and pagination. Structured envelopes and required identities are validated, including numeric Booru/e621 IDs and valid Atom entries. Recognized empty results remain distinguishable from unreadable responses, avoiding unnecessary fallback requests. Redgifs fallback failure and malformed MFC directories cannot report successful fresh empty results.
- Healthy sibling providers and previously accepted pages survive a failure. An incomplete page/window retains its unconsumed cursor and useful error detail; a partial pull stops the walk instead of immediately repeating the failed page. Accepted rows persist before successful cursor commits. Previous successful observations remain available.
- Missing, invalid or future publication values stay unknown instead of using the download time. Real provider calendar dates remain day-precision evidence. Refresh preserves only evidenced prior publication dates, existing artwork when omitted, locked categories and manual tags. Legacy unverified timestamps are not promoted to confirmed source dates.
- Pull diagnostics include bounded completeness counters and ratios for returned normalized page records: duplicates, missing titles, unknown publication dates and missing artwork. Live records are excluded from publication-date denominators. A downloadable redacted JSON report contains only allowlisted provider/status/counters/rates, excluding source titles, IDs, URLs, queries, tags, credentials and raw error messages. Counters describe returned adapter records, not a census of every raw provider record.
- Supported existing adult frames share explicit embedded/direct-site controls and login guidance. Recovery removes the iframe, remembers a canonical official URL/mode and opens the first-party site through an explicit link. A saved direct choice hydrates before any iframe mounts, so reload does not launch a hidden embedded session. Unsupported embed hosts/paths are disabled. Denied clipboard access leaves a selectable link. MFC preserves its existing layout, fullscreen recovery toolbar, legacy preference and optional whole-page view.
- Guidance explains normal browser profiles, separate first-party sessions and embedded cookie limits. No credentials/cookies are inspected, copied or proxied and no provider restriction is relaxed. The Adults desk lists at most seven remembered official links with explicit Forget. Background frame release and progress accounting retain existing safeguards; no polling loop is added.
- A strict version-1 ledger stores at most one safe official destination per known provider. Credentials, tracking/auth query parameters, arbitrary hosts and unsupported modes are rejected or removed. Explicit actions use coalesced IndexedDB activity storage plus a local mirror, monotonic deletion timestamps and visible retry on dual-mirror failure. Browser and companion packs include marks/provider-viewing.json. Direct Settings export awaits disk hydration; valid restores recover choices, malformed/unsupported entries warn without replacement, and legacy packs preserve current choices.

## Verification for revision 50

- Final npm run build and npm run typecheck passed. Full regression passed **1,587 tests, zero failures**: 970 script tests with two workers and 617 native TypeScript tests. The final focused provider/mission run passed **18 tests**. npm run check:recommendations passed the existing reviewed baseline without re-recording it.
- Twelve provider policy tests cover capability and exact embed allowlists, unchanged private classification, all seven real adapter conversions with controlled payloads, malformed versus genuinely empty results, failed-sibling isolation, unconsumed cursors, stopped partial walks, numeric image IDs, evidenced publication preservation, source-date precision, completeness rates, redacted export bounds, canonical first-party URL policy, strict preference parsing and monotonic forgetting. Mission tests verify the revision-50 additive completion migration.
- The integrated workflow passed on final development and production builds in desktop (1440x1000) and touch-phone (390x844) Chrome with real isolated IndexedDB/localStorage. It checks all seven capability cards, live-only controls and MFC/image distinctions; a partial refresh followed by an unreadable response preserves date/poster/locked category/manual tags and cursor while making only two explicit requests; the downloaded quality report contains no private payload values.
- The same browser checks mount a controlled iframe, simulate denied clipboard access, recover to the direct site and verify reload produces no hidden frame request. Unsupported embed hosts stay disabled, MFC page view is labeled separately, and dual-storage failure/retry works. Actual ZIP backup/import restores saved viewing choices; unsupported/legacy packs preserve them; direct Settings export recovers disk-only choices. Recovery links stay off Home. No horizontal overflow or uncaught console errors occurred.
- Existing MFC login-handoff checks passed on development and production desktop/mobile: fresh direct default, selectable clipboard fallback, retained desktop fullscreen toolbar, explicit top-level official room navigation, unloaded iframe and remembered mode after reload. The cookie test uses a non-account first-party fixture; it does not establish actual provider account authentication.
- Existing YouTube/Twitch pull controls passed on production desktop/mobile, rotating recent checks across sixteen creators while independently preserving selected older cursors and health across reload. Home and mission checks passed in development and production; production Home matches its development baseline without console, overflow, auth or brand warnings. Mission checks verify thirty-one completed additions, bounded paging, manual/custom preservation, real exports and clipboard fallback.
- Final production capability/recovery and development/production Home screenshots were visually inspected on desktop/mobile. Controls wrap, text remains readable and panels fit the established design.

## Evidence and entry points

- Registry/control integration: src/lib/videos/adult-provider-adapters.ts, adult-sites.ts; src/lib/remote/live-rooms.ts; src/components/library/adult-panel.tsx. Pull contracts: src/lib/remote/adult-quality.ts and api.ts; src/lib/videos/adult-pull-walk.ts, remote-merge.ts and store.ts.
- Viewing policy/store: src/lib/videos/provider-viewing.ts and src/lib/provider-viewing-store.ts; persistence and packs: src/lib/videos/persist.ts and library-pack.ts. UI: src/components/library/provider-recovery.tsx, use-provider-viewing.ts, official-room-player.tsx, pre-video.tsx, player.tsx and settings-section.tsx.
- Tests: scripts/provider-capability-batch.test.mjs, scripts/fixtures/adult-contracts.json and scripts/provider-capability-batch-browser-check.mjs; updated mission defaults/migration tests and NEXT_LEVEL_MILESTONES.md.
- Artifacts: screenshots/provider-batch-{dev,built}.json with desktop/mobile capability/recovery PNGs; provider-batch-home-{dev,built}.json/PNG; provider-batch-mission-{dev,built}.json; provider-batch-mfc-{dev,built}.json and provider-batch-public-pulls-built.json. Gates: screenshots/provider-batch-build.txt, provider-batch-tests.txt and .grok/provider-batch-*.log; bounded full regression runner: .grok/provider-batch-regression.cmd.

Limits: fixtures exercise existing parser and browser contracts, not current upstream availability, real provider accounts, physical phones or a long-running memory soak. Completeness metrics cover returned normalized adapter page records, not unreturned raw records. This batch adds no providers, scraping paths, background polling or request-budget expansion. It is not a complete guest/private-catalog privacy review; next-069 and its prerequisite remain open. Existing external verification milestones remain open.

---

# Anime identity, episode maps and next-episode batch — 26 October 2026

Revision 49 completes **three related milestones together**: **next-064 — Anime series identity review**, **next-065 — Anime episode gap map**, and **next-066 — Anime next-episode policy**. Default progress is **230/306 complete**: twenty-eight next-level milestones verified, 72 next-level briefs planned, with four older external verification milestones still open. The one-time additive migration promotes this batch for older plans and preserves unrelated manual reopens, custom instructions and later status decisions.

Baseline: Anime had filename-based series shortcuts and natural ordering, but no separate reviewed identity, aliases, release/remake distinction, bounded gap map or explicit next-episode policy. Parsed names/numbers are retained as unverified browsing evidence.

## Delivered together

- Anime includes an on-demand public source finder and owner review form; existing video previews have a collapsed entry to the same workflow. Search accepts source names, approved labels and aliases, scans cooperatively, shows at most 24 matches and cancels obsolete work on input, source, viewer, visibility or session changes. Public local/YouTube records only; private/adult, hidden, unavailable, sample, live, unsupported and orphan local records are ineligible for review. YouTube follows need no local-folder record.
- The explicit confirmation records an opaque series identity, a required release/sequel label, up to twelve aliases, source type and a season/episode or absolute mapping. Similar names and aliases never auto-merge. Remakes remain separate unless the owner deliberately chooses an existing identity. Parsed season/episode evidence is shown before approval, unresolved numbering can stay unresolved, and mapping removal/Undo retains the source and its marks. Filename refreshes with the same source ID keep approved identity/progress. No source file is renamed and no external anime database is connected.
- Reviewed sources can enter Anime even without a filename/tag cue. Catalog filtering/order uses eligible confirmed identities and alias search without rewriting the original video objects. Other titles retain the existing heuristic classification and runtime/film/special behavior. Existing series shortcuts now distinguish reviewed versus parsed sources. Preparation waits for review hydration, uses existing cooperative scheduling/cancellation and rebuilds on changed ledger/catalog inputs; save-status notifications and progress do not reclassify the catalog. The review finder and map resume inputs use the existing held browse snapshot so playback progress does not keep recomputing the covered map.
- A selected reviewed series shows an episode map with natural season/episode order and duplicate source versions in the same slot. Observed ranges begin/end at actual confirmed numbers: 1,2,4 yields only gap 3, not a guessed tail. Empty slots are explicitly absent from the eligible reviewed library, not proof of a release schedule. Absolute numbering occupies its own lane. Specials/OVAs and unresolved sources are separate; they cannot stretch numbered ranges. Wide observed spans over 200 remain unverified with no allocated gap grid. Owners may enter a range of at most 200 per lane, up to 24 entered lanes per series, and return to observed ranges.
- UI mounts four series selectors per page, one selected series/lane, twenty episode slots per page and four versions per slot/auxiliary page. Per-version source links and actual durable resume marks are retained. Only eligible cached sources/folders with current permission can open or become preferred. A saved preferred version is per episode slot; unavailable preferences yield an available fallback without rewriting the preference or comparing file sizes.
- Each series has an explicitly saved next-numbering lane, 90/95/99.2/100-percent completion threshold (95 by default) and specials/OVA opt-in (off by default). The most recently watched incomplete episode resumes its exact version. After a completed episode, the next incomplete confirmed slot is selected in natural order, with a visible explanation for absent intervening episodes. Duplicate versions do not become new episodes. Specials form an opt-in tail after numbered episodes; unresolved numbers stay manual. An unavailable in-progress version asks for reconnection instead of silently transplanting its resume. Every launch uses an explicit existing preview action; no autoplay or provider polling is added.
- All three workflows share a strict version-1 ledger, capped at 512 series identities and 4,096 source bindings with no silent eviction. One-step Undo uses bounded inverse patches (one series, at most 48 bindings) and monotonic whole-ledger timestamps, so an older mirror cannot resurrect an undone change. Existing coalesced IndexedDB activity storage and a local mirror save explicit actions; dual-mirror failure shows a session-only warning and retry.
- Browser and companion packs include marks/anime-reviews.json. Direct Settings exports await disk hydration even before visiting Anime. Valid imports restore identities, aliases, ranges, policy and preferred versions. Unsupported/malformed imports warn and preserve current choices; legacy packs lacking this entry leave it intact. Original metadata, manual locks, tags, favorites, ratings and playback ledgers remain separate.

## Verification for revision 49

- Final npm run build and npm run typecheck passed. The complete regression run passed **1,574 tests, zero failures**: 958 script tests with two workers and 616 native TypeScript tests. The focused anime/catalog/mission run passed all 25 tests.
- Fifteen new policy tests cover unverified parsing, separate remake/sequel identities, deliberate linking, alias lookup and filename variation, original object/mark immutability, reviewed ordering/classification, visibility boundaries, 1/2/4 gaps, duplicate versions, absolute/wide/special/unresolved separation, strict range bounds, reversible edits/removal, next 3/skip-to-4, exact-version resume, completion thresholds, explicit specials and numbering, current availability/preferences, monotonic Undo and strict import fields/graphs/limits. A 100,003-row fixture yields across 200 task boundaries while retaining three reviewed bindings, and cancellation before source reads is verified.
- The integrated anime browser workflow passed on final development and production builds for desktop (1440x1000) and touch-phone (390x844) Chrome, using isolated real IndexedDB/localStorage. It confirms nine sources into separate remake identities and numbering/type mappings, preserves all source tags/locks/ratings and actual per-version progress, and checks gap 3, duplicate versions, preferred opening and the existing preview entry. A 1-to-900 absolute span stays unverified without a gap grid. Threshold changes resume episode 2 at 100 percent, normal policy skips missing 3 to 4 with explanation, and reviewing 3 makes it the next choice. Removing/Undoing that mapping updates the choice correctly. Range errors preserve saved state; explicit ranges, aliases, policy and preference persist across reload. Real ZIP exports/imports restore the ledger; unsupported/legacy packs preserve choices, Settings exports disk-only reviews and dual-mirror failure has working retry. No overflow or uncaught console errors. Mobile also tests creation with crypto.randomUUID unavailable, using the existing HTTP/LAN-compatible local ID helper. Final desktop/mobile next-choice and map screenshots were visually inspected; nested actions wrap inside phone panels.
- Existing Movie/Anime/clip workflows passed on final production desktop and mobile: all movie filters, anime natural ordering/film/OVA exclusions, clip refresh rotation, ranked metadata and durable cursors. The previous film identity/edition/metadata workflow also passed, including correct preview entry, independent marks, poster locks/errors, Undo, dual-mirror retry and real backup/restore. The legacy parsed-series browser assertion was updated to the clarified parsed-source label.
- Home and mission checks: Home and mission workflows passed on development and production. Production Home matches the development baseline with no console, overflow, auth or brand warnings. Mission checks verify twenty-eight completed additions, bounded paging, custom/manual preservation, clipboard fallback and real exports/reload. Home screenshots: development and final production desktop/mobile screenshots were visually inspected; content and navigation fit the established design.
- npm run check:recommendations passed the existing reviewed baseline without re-recording it. Guide/provider ranking algorithms and existing quality judgments were not changed. Previous quality gaps and external milestones remain open.

## Evidence and entry points

- Shared review/gap/next policy: src/lib/videos/anime-review.ts; catalog: anime-catalog.ts. Store: src/lib/anime-review-store.ts plus existing videos/persist.ts and library-pack.ts. UI: components/library/anime-review.tsx, use-anime-reviews.ts, anime-section.tsx, use-anime-catalog.ts, pre-video.tsx and settings-section.tsx.
- Tests: scripts/anime-review-batch.test.mjs and anime-review-batch-browser-check.mjs; additive mission migration/default tests and regenerated NEXT_LEVEL_MILESTONES.md.
- Artifacts: screenshots/anime-batch-{dev,built}.json with desktop/mobile next-choice/map PNGs; anime-batch-home-{dev,built}.json/PNG; anime-batch-mission-{dev,built}.json; anime-batch-existing-desks-built.json and anime-batch-films-built.json. Gates/logs: screenshots/anime-batch-build.txt, anime-batch-tests.txt and .grok/anime-batch-*.log. Full regression runner: .grok/anime-batch-regression.cmd.

Limits: identity, ranges and numbering are owner-reviewed evidence, not database verification or an asserted complete release schedule. Numbering lanes never convert automatically. Provider playback permission/availability is outside the cached source/folder check. Backup restores the same source IDs; it does not infer renamed/moved files with different identities. Controlled desktop/touch-phone Chrome fixtures do not establish real provider playback, physical-device behavior or long-running memory endurance. The existing external milestones remain open.

---

# Film identity, editions and metadata review batch — 26 October 2026

Revision 48 completes **three related milestones together**: **next-061 — Film identity review**, **next-062 — Movie cuts and editions**, and **next-063 — Movie metadata provenance review**. Default progress is **227/306 complete**: twenty-five next-level milestones verified, 75 next-level briefs planned and four older external verification milestones remain open. The migration promotes only these three verified defaults for older plans and preserves unrelated manual reopens, custom instructions and later status choices.

Baseline: Movies used useful title/tag/folder heuristics and runtime checks, but offered no owner-reviewed identity separate from filenames, edition grouping, preferred-version choice or selected-field film metadata correction with provenance and Undo.

## Delivered together

- Movies has an on-demand film review search and an inline owner-review form. Existing previews have a collapsed entry to the same workflow. Search reads the actual public local/YouTube library cooperatively, displays at most 24 records and requires two title characters; no provider request or broad disk scan is introduced. Known private folders, hidden/unavailable/sample/live records, unsupported providers and orphan local roots are excluded. Public YouTube follows do not require a local-folder record.
- Filename/year/runtime evidence is visibly unverified until the owner confirms that the source is the complete film with the chosen identity, release year, edition and a verified runtime strictly over ten minutes. Explicit release-year selection separates remakes; existing identities require a deliberate choice and a new identity remains separate. Records use opaque film IDs. Owner-reviewed confidence is distinguished from an external database verification. No external film metadata service is connected.
- The review sidecar stores identity separately from source files, tags, ratings and playback marks. Movies projects reviewed title/year/runtime and optional poster/category onto display copies only. This can recover an otherwise unclassified public film without renaming its source, altering its ID or rewriting locked metadata. Owner title/year fields start locked. Existing heuristic shelves and runtime repair remain available for unreviewed content; heuristic membership is explicitly not database identity confirmation.
- Explicit edition tokens suggest theatrical, extended, director/final cuts, unrated or remastered versions; resolution alone does not invent a cut. Grouping is opt-in and restricted to versions of the same reviewed identity. Group cards coexist with individual film records and preserve source-specific runtime, file/player links and resume marks. Ungroup changes presentation only, retaining the review and individual records. Per-operation grouping is limited to 48 versions.
- Preferred versions require a current eligible source and reviewed runtime. Cached unavailable records are excluded and local folders awaiting permission cannot be preferred/opened through the group control. An unavailable or absent saved preference yields a visible fallback suggestion from available reviewed sources, preferring local availability without any file-size comparison; playback still requires an explicit action. Group cards mount four films per page and six versions per group page. Durable resume lookup preserves per-ID/provider-path recovery rather than copying progress between cuts.
- Film metadata review exposes each title/year/poster/genre field, its source, owner-reviewed/unknown confidence and lock. A local public-catalog search can stage alternate saved title/year/artwork/category values, or the owner can enter a correction. A before/after preview shows ready, locked, unchanged or invalid selections. Only selected changed unlocked fields apply. Locked title/year remain intact during poster correction; the original source category lock is also respected. Unlock is explicit and itself undoable.
- Poster proposals require a valid HTTPS or safe app-relative image URL. One proposed poster is requested only through an explicit preview action. A failed poster request keeps the current metadata and blocks applying that selected poster. Invalid proposals do not replace the confirmed film. Applying a reviewed poster updates lazy Movies artwork, including priority over a stale cached billboard image; there is no large artwork download batch.
- All three workflows share a versioned bounded ledger: at most 1,024 film identities and 4,096 source-version bindings, with no silent eviction. One-step Undo uses bounded inverse patches (one identity and at most 48 versions), not a duplicated library graph; it can swap the latest change back and forth. Monotonic ledger timestamps preserve Undo through recovery. Existing coalesced IndexedDB activity storage and a local mirror persist changes; simultaneous failures show a session-only warning and explicit retry.
- Library and companion packs include marks/film-reviews.json. Direct Settings backups hydrate disk-only reviews before serializing. Valid imports restore the sidecar, legacy packs leave it intact, and unsupported/malformed imports warn while preserving current choices. Movie catalog preparation waits for review hydration, uses existing cancellation/scheduling and rebuilds only for changed inputs/ledger, not save-status notifications.

## Verification for revision 48

- Final npm run build and npm run typecheck passed. Full regression passed **1,558 tests, zero failures**: 943 script tests with two workers and 615 native TypeScript tests. The final focused film/classification/runtime/filter run passed all 35 tests.
- Fourteen new policy tests cover unverified filename proposals, distinct remake IDs, strict runtime/year checks, unchanged source/feedback objects, Movies-only identity projection and year filtering, private/hidden/unavailable/sample/live/unsupported/orphan exclusions, public provider folders, explicit edition tokens, bounded same-film grouping, reversible ungrouping, independent resume records, available preferred-version checks, selected poster-only correction under title/year/category locks, invalid proposal preservation, explicit unlock, provenance, monotonic Undo, strict import graphs/limits/allowlists and a cooperatively prepared 100,000-title catalog with cancellation before reads.
- The integrated batch browser workflow passed on development and production for desktop (1440x1000) and mobile (390x844), using isolated real IndexedDB/localStorage. It confirms the 1984 and 2021 remakes separately, groups theatrical/extended versions, preserves actual independent 10-percent/50-percent resume records, opens the correct preferred source and verifies the existing preview entry. Ungroup retains all individual movie records.
- The same browser run stages an alternate saved match, applies a poster while title/year/category stay locked, checks origin/confidence, rejects unsafe proposals, simulates a failed poster request without replacing the saved poster, and Undoes the correction. Hidden/private search produces a clear empty result. Reload retains identities/grouping/preference; dual-mirror failure shows retry. Actual ZIP downloads/imports restore all three workflows; unsupported and legacy packs preserve choices; a direct Settings export recovers an IndexedDB-only review ledger. No overflow or uncaught console errors.
- Existing Movies/Anime/clip browser workflows passed on production for desktop and mobile: movie filters and trailer/episode exclusion, ordered anime groups, clip-refresh rotation and durable older cursors. Runtime-repair/Twitch archive checks passed, including persisted repaired runtime and resumed pulls. Grounded Guide/preview checks passed with correct source navigation, public evidence, feedback, Undo, storage-failure retry and stable focus/order.
- Home and mission browser workflows passed on development and production. Production Home matches the development baseline, with no console errors, overflow or auth/brand warnings. Mission checks verify twenty-five completed additions, paging, manual/custom preservation, clipboard fallback, real exports and reload. Development and production desktop/mobile Home and film-review screenshots were visually inspected; content and controls fit the established design without clipping or horizontal overflow.
- npm run check:recommendations passed the existing reviewed baseline without re-recording it. These changes do not alter the Guide/provider ranking implementations or existing quality judgments. Prior recommendation quality gaps and external milestones remain open.

## Evidence and entry points

- Shared policy/types: src/lib/videos/film-review.ts and types.ts. Persistence: src/lib/film-review-store.ts, videos/persist.ts and library-pack.ts. Movies integration: movie-catalog.ts and components/library/use-movie-catalog.ts. No underlying source-video, rating, favorite, tag, playback or room descriptor schema is rewritten.
- UI: src/components/library/film-review.tsx, movie-desk.tsx, pre-video.tsx, browse.tsx and settings-section.tsx. Existing poster-card image admission, runtime repair, filtering and real player entry points are retained.
- Tests: scripts/film-review-batch.test.mjs and film-review-batch-browser-check.mjs; additive mission defaults/migration tests and regenerated NEXT_LEVEL_MILESTONES.md.
- Artifacts: screenshots/film-batch-{dev,built}.json and desktop/mobile identity/metadata PNGs; film-batch-home-{dev,built}.json and PNGs; film-batch-mission-{dev,built}.json; film-batch-existing-desks-built.json, film-batch-runtime-built.json and film-batch-preview-built.json.
- Gates/logs: screenshots/film-batch-build.txt and film-batch-tests.txt; .grok/film-batch-typecheck-final.log, film-batch-focused-final.log, film-batch-recommendation-check.log and film-batch-*.log. Full regression runner: .grok/film-batch-regression.cmd.

Limits: identity and runtime confidence come from explicit owner review, not a connected film database. Alternate matching uses the public saved catalog or owner-provided values; no external metadata account/service has been added. Source availability reflects the current cache/folder permission state and cannot guarantee a provider will permit playback. Grouping adds a reversible version view without deleting individual records. Caps are explicit and never evict prior reviews. Browser checks use synthetic catalogs and controlled players/artwork; real provider availability, physical devices, real media-file metadata and long-running memory/provider soaks remain unverified. Existing external milestones stay open.

---

# Feedback experiment replay — 26 October 2026

Revision 47 completes **next-060 — Feedback experiment replay**. Default progress is **224/306 complete**: twenty-two next-level milestones verified, 78 next-level briefs planned and four older external verification milestones remain open. The one-time migration promotes only next-060 for older plans, retaining manual reopens, custom instructions and later status choices.

Baseline: the Guide had fixed positive-signal weights and output diagnostics, but no frozen evidence replay, current/proposed comparison, explicit preset acceptance or durable rollback.

## Delivered behavior

- Stats includes Feedback experiment replay. Capture scans the actual public personal-Guide eligibility rules cooperatively: visibility, hidden/unavailable/sample exclusion, known local folders, source/length settings, non-live recordings and recorded-history exclusion. Public favorites/likes supply the existing bounded saved-content affinity and source-pair suppression policy. No provider/model request is added.
- The frozen version-1 capsule contains at most 512 anonymous candidate records: the current top twelve plus up to 500 seeded alternatives, deduplicated by catalog row. A capture uses at most 548 temporary selector records across seeded and per-source pools; it never retains a full title graph. Anonymous ordinal media/creator tokens, source, favorite/like booleans, affinity count, fixed rejection/exposure deductions, exposure presence and deterministic tie ranks replace titles, raw media IDs, creator names, paths, tags and images. The clock, seed, current weights, applied session and total eligible row count are frozen.
- Compare reuses the Guide positive-score/session function and the same bounded source-balanced selector. Favorite and like weights are integers 0–8; shared-topic weight is 0–3. Current and proposed top-twelve order, exact score contributions, entered/exited ranks and up to eight top-output changes are shown. Rejection deductions, exposure protection/deductions, query relevance and eligibility are held fixed. A small complete capsule reproduces the actual runtime order; for large libraries the proposal comparison is explicitly limited to the retained sample, which may omit new full-library winners.
- Comparison metrics reuse the fairness report definitions: unique/repeated canonical media, recent-exposure novelty, retained current media, provider slots, largest credited creator share and missing credits. Personal replay already excludes recorded history. Unjudged capsules have no relevance judgments, so higher relevance or user satisfaction is not claimed. Creator buckets and candidate ordinals belong only to that capsule.
- Preview/capture/comparison writes no likes, ratings, history, exposure, tags or presets. Proposal edits require a new comparison. Import/export uses a real JSON file, a 256-KB file limit, a strict versioned numeric allowlist and 512-row validation; unknown private fields are stripped and invalid versions/counts/values are rejected without losing the current snapshot. The exported proposal can be re-imported and recomputed identically. Imported capsules remain preview-only. Changing tracked library/preset/session inputs makes the capsule preview-only; recapture is required to apply. Leaving the page, changing inputs, backgrounding or opening a viewer cancels in-flight capture.
- Apply reviewed Guide preset is an explicit action enabled only after a changed, nonempty, fresh current-library comparison. It stores the current and previous weights, enabling a durable one-step rollback that can toggle between the last two choices. Rollback and acceptance use monotonic whole-ledger timestamps so older mirrors cannot resurrect a replaced preset. Duplicate acceptance is a no-op. Weights affect Guide personal positive signals and preference boosts in Guide questions only; other desks, relevance matches, feedback protections, visibility and session eligibility remain intact.
- Existing painted Guide cards stay stable on a preset-change event; the next mix/question uses current accepted weights. Reload hydrates the preset before preparing the Guide. Fairness snapshots now record the actual weights used, keeping historical reports interpretable after later changes.
- The preset uses the existing coalesced IndexedDB activity store plus localStorage mirror. Both-mirror failures show a session-only warning and explicit retry. Library/companion packs include marks/guide-preset.json with current/previous weights. Legacy packs preserve choices and unsupported versions warn without replacing them. Settings browser and companion-folder exports await preset hydration, so direct backups include an IndexedDB-only preset even before visiting Guide or Stats. Replay capsules themselves are temporary and clear on navigation/reload unless explicitly exported.

## Verification for revision 47

- Final npm run build and npm run typecheck passed. Broad regression passed **1,543 tests, zero failures**: 929 script tests with two workers and 614 native TypeScript tests. The final focused replay/Guide/session/report/bridge/evaluation run passed all 64 tests.
- Eleven replay/preset policy tests cover bounds, frozen/allowlisted state, no-op acceptance, monotonic rollback/recovery, fixed deductions, exact default/custom runtime parity, query preference weights, source/length constraints, public/private eligibility, repeated import determinism, invalid versions/oversized pools/duplicate keys/nonfinite signals, protected-exposure novelty, empty results and no invented changes. A 100,000-title capture retains at most 512 candidates, preserves every actual current winner, reproduces balanced runtime top order and yields cooperatively; cancellation before reads is verified.
- Development and final production interactive checks passed on desktop (1440x1000) and mobile (390x844), using isolated actual IndexedDB/localStorage stores. They verify a real 35-row public capture, an explainable twelve-YouTube to twelve-Twitch weight comparison, unchanged tastes/history/exposure/preset/provider request count during preview, actual anonymous JSON download/import, identical replay results, imported-data acceptance disabled and invalid-file preservation. Explicit acceptance changes a new real Guide mix and preserves the prior preset. Reload clears the capsule but retains weights; rollback survives both storage mirrors failing with retry. Actual ZIP backups restore both presets, unsupported/legacy packs preserve them and a direct Settings backup/read recovers an IndexedDB-only preset. No overflow or uncaught console errors.
- Existing fairness, grounded Guide evidence, session tuning, topic-bridge and exposure browser workflows all passed on production. Coverage includes actual balanced output, anonymous reports, feedback/Undo and mirror retry, stable focus/order, source/length controls, independent tabs, photo review, real backup export/restore, background-tab dwell, deduplication and visibility-only exposure.
- Home and mission browser workflows passed on development and production. Production Home matches the development baseline, with no console errors, overflow or auth/brand warnings. Mission checks verify twenty-two completed additions, paging, manual/custom preservation, clipboard fallback and real exports/reload. Development and production desktop/mobile Home, replay overview and comparison screenshots were visually inspected; controls and content fit the established design.
- npm run check:recommendations passed the reviewed regression baseline. Default case outputs, corpus, quality metrics and integrity-sentinel results are identical to revision 46; implementation fingerprints include the shared scoring/preset/replay modules. The same 84 passing, four failing, one unmeasured and ten not-applicable quality checks remain. Custom preset relevance is not established by an unjudged local replay.

## Evidence and entry points

- Shared scoring/preset policy: src/lib/videos/guide-preset.ts; bounded capture/validation/replay: guide-experiment.ts. Actual runtime: guide-picks.ts and recommendation-session.ts. Fairness snapshots: recommendation-report.ts.
- Durable ledger: src/lib/guide-preset-store.ts with existing videos/persist.ts and library-pack.ts. UI: src/components/library/guide-experiment.tsx, stats-section.tsx, ai-guide.tsx, recommendation-report.tsx and settings-section.tsx. No authentication, provider credentials, media metadata, room schema or other-desk ranking weights changed.
- Tests: scripts/guide-experiment.test.mjs, guide-experiment-browser-check.mjs and fixtures/guide-experiment-browser.mjs. Mission default/migration tests and NEXT_LEVEL_MILESTONES.md updated additively.
- Artifacts: screenshots/experiment-{dev,built}.json and desktop/mobile overview/comparison PNGs; experiment-home-{dev,built}.json and PNGs; experiment-mission-{dev,built}.json; experiment-evaluation.json; experiment-fairness-built.json, experiment-evidence-built.json, experiment-session-built.json, experiment-bridges-built.json and experiment-exposure-built.json.
- Gates/logs: screenshots/experiment-build.txt and experiment-tests.txt; .grok/experiment-typecheck-final.log, experiment-focused-final.log, experiment-recommendation-check.log and experiment-*.log. Full regression runner: .grok/experiment-regression.cmd.

Limits: this is a bounded public personal-Guide replay and local positive-weight preset, not a judged full-library quality experiment or a change to all recommendation engines. Large capsules include current winners but cannot guarantee all proposed winners; the limitation is visible before acceptance. Local files without creator credits remain unknown, not invented authors. Imported capsules are untrusted preview data and cannot apply a preset. Browser checks use synthetic public/private fixtures and controlled external responses; real-user satisfaction, live-provider availability, physical devices and memory/provider endurance remain unverified. Existing quality gaps and external milestones remain open.

---

# Recommendation fairness report — 26 October 2026

Revision 46 completes **next-059 — Recommendation fairness report**. Default progress is **223/306 complete**: twenty-one next-level milestones verified, 79 next-level briefs planned and four older external verification milestones remain open. The one-time migration promotes only next-059 for older plans, preserving manual reopens, custom instructions and later status choices.

Baseline: source balancing could shape Guide results, but there was no diagnostic of the actual generated output, eligible alternatives, creator concentration, duplicate media or snapshot novelty.

## Delivered behavior

- Every successfully generated personal Guide mix and question answer has a collapsed recommendation fairness report. The report is derived from the actual eligible candidate pass and selected output, including visibility, query/provider, source/length filters, live confirmation and the personal-versus-query history policy. It never substitutes full-library counts for query availability.
- Provider shares compare selected slots with eligible candidate rows. Balanced-source mode checks actual round-robin output against available pool capacity and explains shortages. Standard ranking has no equal-provider quota; a deliberately restricted or single-source library is explained rather than falsely labeled unfair.
- Creator share uses provider-scoped creator IDs, falling back to normalized creator names. Local folder names are not creator credits. Anonymous output groups report actual shares and known eligible capacity; missing credits and capacity overflow remain unknown. The configurable 25/50/75/100-percent diagnostic threshold never adds a creator cap, changes rankings, edits feedback or triggers provider requests. Concentration with enough other credited candidates is flagged for review; inadequate alternatives and missing credits receive distinct explanations. Available alternatives do not imply equal relevance.
- Novelty means no recorded history and no valid exposure within the existing 30-day exposure window at generation time. Protected favorites still count as exposed. It never claims a completed watch or that an unrecorded title has never been seen. Repeated slots and overlap with the preceding output of the same kind use canonical media IDs, not display-name similarity. Prior mixes and queries are tracked separately; changed filters are disclosed.
- Stats shows the latest two generated Guide snapshots from this tab, with a useful no-report action back to the Guide. Report inspection, threshold changes and export do not rerank cards. Navigation retains snapshots; Clear and a real reload discard them. There is no durable report store, automatic polling, background provider request or new exposure/history write. The existing exposure observer continues to measure actual card visibility independently.
- JSON export explicitly allowlists aggregate counters, session settings, findings and anonymous creator buckets. It omits all media keys, title/creator names, prompts, tags, file paths, samples and private media. No title-inclusive export was added. Existing public Guide visibility supplies the privacy boundary; private/adult, hidden, unavailable, orphan local and sample records are excluded before collection.
- Collection adds constant source counters and at most 4,096 creator counters inside the existing cooperative candidate pass. Completed reports retain at most twelve selection keys and twelve anonymous creator groups. The volatile store retains two reports plus twelve prior keys per shelf, with no per-title evidence graph or full-catalog sort. Query history inspection scans cooperatively while retaining only selected IDs. Report UI mounts only the two bounded outputs and uses the established design and mobile controls.

## Verification for revision 46

- Final npm run build and npm run typecheck passed.
- Broad regression passed **1,531 tests, zero failures**: 918 script tests with two workers and 613 native TypeScript tests. The final focused policy/Guide/session/bridge/evaluation run passed all 53 tests after refining missing-credit uncertainty and nested export allowlists.
- Eleven report tests cover single-source constraints, avoidable concentration, threshold isolation, balanced capacity/violation/shortage fixtures, provider-scoped identities, normalized creator-name fallback, unknown local credits and unknown alternatives, duplicate identities, previous-output overlap, recorded history, valid/expired/future exposure, aggregate privacy, exact personal/query eligibility, cancellation, empty output and bounded volatile publication/clearing. A 100,000-title fixture proves the 4,096-creator and twelve-output limits, reports overflow availability as unknown and exercises full Guide preparation.
- Development desktop (1440x1000) and mobile (390x844) browser checks passed with isolated real stores. They inspect actual 35-row/12-slot output and protected-favorite novelty, change thresholds without moving cards or editing saved tastes, download real JSON, compare consecutive generated mixes, verify actual balanced 6/6 output, inspect a recorded one-result question, find exact reports in Stats, clear reports, prove populated reports disappear on reload, and return from the empty state to the Guide. Consoles are clean and no horizontal overflow occurs.
- The same complete report workflow passed on the final production build for desktop and mobile, including strict aggregate downloads and clearing populated snapshots on a real reload.
- Existing grounded Guide, session tuning and topic-bridge browser workflows passed on production, preserving feedback/Undo, mirror retry, keyboard focus/order, source/length choices, real pack exports/restores, photo review and private exclusions. The existing exposure browser workflow also passed on the final production build, including background-tab dwell, visibility thresholds, duplicate suppression, opening-title reset, real ZIP export/restore and dual-mirror failure/retry.
- Home and mission browser workflows passed on development and production. The production Home matches the development baseline, with clean consoles, no overflow and no auth/brand warnings. Mission checks verify twenty-one completed additions, paged delivery, manual/custom preservation, clipboard fallback and actual exports/reload. Desktop/mobile Home, report and question screenshots were visually inspected; the layout and controls fit the existing design.
- npm run check:recommendations passed the reviewed regression baseline. All case output data, corpus and quality findings remain identical to revision 45; implementation fingerprints now include the read-only report collector. Integrity sentinels remain detected. The existing 84 passing, four failing and one unmeasured quality checks are retained, with ten checks not applicable. This is a regression gate, not a claim that all ranking quality is solved.

## Evidence and entry points

- Policy/counters: src/lib/videos/recommendation-report.ts; actual candidate/output integration in guide-picks.ts. Volatile snapshots: src/lib/recommendation-report-store.ts. UI: src/components/library/recommendation-report.tsx, ai-guide.tsx and stats-section.tsx. No authentication, provider credentials, video metadata, ranking weights or room schema changed.
- Tests: scripts/recommendation-report.test.mjs and recommendation-report-browser-check.mjs. Revision/default migration coverage in src/lib/mission-plan.test.ts and scripts/mission-next-level.test.mjs. NEXT_LEVEL_MILESTONES.md regenerated additively.
- Artifacts: screenshots/fairness-{dev,built}.json and desktop/mobile report/query PNGs; fairness-home-{dev,built}.json and PNGs; fairness-mission-{dev,built}.json; fairness-evaluation.json; fairness-evidence-built.json, fairness-session-built.json, fairness-bridges-built.json and fairness-exposure-built.json.
- Logs: screenshots/fairness-build.txt and fairness-tests.txt; .grok/fairness-typecheck-final.log, fairness-focused-final.log, fairness-recommendation-check.log and fairness-*.log. Full regression runner: .grok/fairness-regression.cmd.

Limits: this diagnostic covers generated public AI Guide mixes/questions only, not every provider-specific shelf, actual impressions or demographic fairness. Snapshots may describe earlier filters/catalog state; generate a new output to refresh. Anonymous creator buckets are scoped to each output, not stable public pseudonyms. Availability counts candidate rows; duplicate media are diagnosed separately. Creator counts beyond the bounded vocabulary are unknown. Browser checks use synthetic local catalogs and controlled external responses; live provider availability, physical devices, real-user satisfaction and long-running memory/provider soaks remain unverified. Existing quality gaps and external milestones stay open.

---

# Cross-source topic bridge audit — 26 October 2026

Revision 45 completes **next-058 — Cross-source topic bridge audit**. Default progress is **222/306 complete**: twenty next-level milestones verified, 80 next-level briefs planned and four older external verification milestones remain open. The one-time migration promotes only next-058 for older plans and preserves manual reopens, custom instructions and later status choices.

Baseline: Guide affinity used one origin per label across all sources, including arbitrary shared labels. There was no source-pair control, inspected cross-source evidence, bounded bridge audit or safe photo review route.

## Delivered behavior

- AI Guide includes Audit connections between sources. It scans public local/YouTube/Twitch records on demand and shows supported topics, per-source counts, exact source-specific field quotes and an actual evidence title from each side. Evidence buttons use the existing preview. The audit filters its small aggregates, mounts eight connections per page and can export aggregate JSON without titles, IDs, paths or sample text.
- Bridge evidence uses canonical saved content topics. Local video filenames/categories and photo filenames do not infer a bridge. YouTube/Twitch may also provide genuine provider-title/category evidence for coverage. Creator names, URLs, hashtag-only titles, date labels, source/provider/format labels, file extensions and unreviewed generic keywords are excluded. Operational labels remain excluded even if a topic alias was manually approved for them.
- Coverage is separated from personal preference. Guide cross-source preference boosts require a public favorite/like and a valid saved content topic on both sides. Same-source generic saved-label affinity remains compatible. Source-aware origin slots prefer same-source evidence and retain alternate legitimate cross-source origins, so pausing one pair does not accidentally disable another pair. Actual selected reasons quote the valid raw fields and show the connecting topic/source pair.
- Pause Guide bridge/Undo is available beside a specific reason and in the audit. It symmetrically pauses one canonical topic between two source types; same-source preferences, direct favorites/likes, tags, locks, ratings, explicit topic search and other recommendation desks stay intact. Current cards and keyboard focus remain stable until Ask again/New recommendations applies the latest Guide policy. Paused connections remain inspectable for Undo and do not count toward active audit connections.
- A version-1 ledger stores only canonical topic, source pair and timestamp, up to 256 pauses. It never retains evidence samples or title/path/image data. Duplicate actions are no-ops; a full ledger requires Undo rather than eviction. The existing coalesced IndexedDB activity store and local mirror persist it. Whole-ledger timestamps preserve Undo during recovery. Dual-mirror failures show a session-only warning and explicit retry. Library ZIP/companion packs include marks/topic-bridges.json; legacy packs leave choices intact and unsupported versions warn without replacing the current ledger.
- Photo metadata is excluded by default. In Photos, the owner can select up to 48 visible photos chosen directly in that view and explicitly confirm suitability for public topic connections. Imported source photos and hidden photos cannot enter the review. The handoff opens the audit and carries allowlisted filenames/saved tags plus temporary ordinal IDs; no image bytes, paths, people labels or favorite/rating inference are copied. Returning to Photos or reloading clears the review. Existing photo edits flush before the audit handoff to avoid losing changes to a pending metadata timer.
- Photo connections are explicitly audit-only and do not train Guide preferences or pretend to be playable video recommendations. Their pause/Undo excludes them from active coverage counts. The UI and exported scope distinguish this from a video Guide preference bridge.
- Private/adult, hidden, unavailable, sample and unknown-local sources cannot supply public audit or Guide preference evidence. Preparation is cooperative and cancellable; changed inputs invalidate old results immediately. The audit retains only topic/source aggregates with one bounded sample per group, not a per-title evidence graph. Guide generic affinity remains capped at 4,096 labels with compact per-source ordinals; cross-source slots are limited by the canonical taxonomy. Pausing and filtering do not rescan the catalog; reopening an unchanged completed audit reuses its result. No provider poller or external model call was added.

## Verification for revision 45

- Final npm run build and npm run typecheck passed.
- Broad regression passed **1,519 tests, zero failures**: 907 script tests with two workers and 612 native TypeScript tests. The final focused policy/Guide/session/evaluation run also passed all 42 tests after tightening temporary photo metadata.
- Ten policy tests cover fourteen versioned true/false field fixtures, reviewed spelling and forged operational aliases, symmetric keys, validation/capacity/no-op behavior, whole-ledger Undo recovery, sample-field stripping, local/provider/photo evidence, private/hidden/orphan/unavailable/sample exclusions, actual Guide boost suppression, same-source/direct-positive preservation, explicit searches, alternate origins and valid reason quotes. Photo review tests prove its 48-row bound, immutability, field allowlist, temporary IDs and clearing.
- A 100,000-title audit fixture yields in catalog slices, returns only three supported source-pair aggregates and two references per connection, and honors cancellation before reading a discarded input. Generic affinity stops at 4,096 labels. The focused CPU-only audit run was about 344 ms with a no-op yield callback; this is not a provider or physical-device endurance measurement.
- Development desktop (1440x1000) and mobile (390x844) interactive checks passed using isolated real browser stores. They inspect/open actual evidence, page eight rows, pause from a Guide reason without moving focus/cards, refresh the ranking, preserve same-source preference and explicit topic search, reload durable choices, recover Undo from both storage mirrors failing, download a real aggregate report and library ZIP, restore exact choices, and reject an unsupported ledger version with a visible warning. Real photo upload/tag editing, required confirmation, hidden-photo exclusion, automatic audit handoff, audit-only pause and review clearing on return/reload are exercised.
- The same bridge workflow passed on the production build. Desktop/mobile audit and photo layouts were visually inspected. Existing Guide, session and exposure regression workflows also passed on production, preserving grounded evidence, feedback/Undo, save retry, source/length controls, independent tabs, background-tab dwell, deduplication, actual backup/restore and default reload behavior.
- npm run check:recommendations passed the reviewed regression baseline. The same 62-title/16-scenario corpus, default outputs, metrics, quality findings and corruption sentinels are retained; implementation fingerprints now include the source-aware affinity policy. Four pre-existing quality checks and one missing-judgment scenario remain open.
- Home and mission browser workflows passed on development and production. Built Home matches the development baseline with clean consoles, no overflow and no auth/brand warnings. Desktop/mobile Home screenshots were visually inspected. Mission checks verify twenty completed additions, paged work, manual/custom preservation, clipboard fallback, real exports and reload behavior.

## Evidence and entry points

- Policy and audit: src/lib/videos/topic-bridges.ts, topic-bridge-audit.ts and guide-affinity.ts; integration in guide-picks.ts and guide-evidence.ts. UI: src/components/library/topic-bridge-audit.tsx, topic-bridge-button.tsx, guide-suggestion.tsx and ai-guide.tsx.
- Photo handoff: src/lib/reviewed-photo-bridges.ts and photos-section.tsx. Durable pauses: src/lib/topic-bridge-store.ts, existing videos/persist.ts and library-pack.ts. No video metadata, authentication, provider credentials or room descriptor schema changed.
- Tests: scripts/fixtures/topic-bridges.json, topic-bridges.test.mjs and topic-bridge-browser-check.mjs. Mission revision/defaults/migration tests and NEXT_LEVEL_MILESTONES.md updated additively.
- Artifacts: screenshots/topic-bridge-{dev,built}.json and desktop/mobile audit/photo PNGs; topic-bridge-home-{dev,built}.json and PNGs; topic-bridge-mission-{dev,built}.json and PNGs; topic-bridge-evaluation.json; topic-bridge-guide-regression-built.json, topic-bridge-session-regression-built.json and topic-bridge-exposure-built.json.
- Gates/logs: screenshots/topic-bridge-build.txt and topic-bridge-tests.txt; .grok/topic-bridge-typecheck-verified.log, topic-bridge-focused-final.log and topic-bridge-*.log. Full regression runner: .grok/topic-bridge-regression.cmd (two script workers, then the package native suite).

Limits: this is public Guide preference-bridge control and an evidence/coverage audit, not a new photo recommender or a change to every provider-specific ranking engine. Photo review is temporary owner-approved metadata, not an automatic public classification of the whole photo library. Browser checks use synthetic local catalogs and controlled external responses; real provider availability, a physical phone and long-running memory/provider soaks remain unverified. Existing recommendation quality gaps and external milestones remain open.

---

# Recommendation session tuning — 26 October 2026

Revision 44 completes **next-057 — Recommendation session tuning**. Default progress is **221/306 complete**: nineteen next-level milestones verified, 81 next-level briefs planned and four older external verification milestones remain open. The one-time migration promotes only next-057 for older plans and preserves earlier manual reopens, custom instructions and later status changes.

Baseline: the public AI Guide had fixed preference weighting and source/length eligibility. Exploring another source or a different length meant rewriting saved tastes, changing the question manually or navigating to a provider-specific shelf.

## Delivered behavior

- Tune this Guide session adds explicit discovery style, recording length and source choices in the existing Guide, components and visual system. Changes remain drafts until Apply; current cards and applied settings stay stable while selecting options. Apply and Reset keep focus on their existing buttons.
- Standard ranking preserves existing preference weights. Familiar adds a bounded boost for favorites, likes and shared saved content labels. Explore reduces that affinity so less familiar eligible titles have room. Neither changes or clears ratings, tags, locks, likes, favorites, watch history, exposure or explicit rejection choices. Existing negative/protection rules still run.
- Sources support all public sources, balancing available sources, YouTube only, Twitch only and local only. Balance alternates ranked candidates from nonempty sources and fills gaps from remaining sources; it does not promise unavailable titles or precise percentages. Public saved content evidence can legitimately cross sources even when candidates are restricted to one source.
- Length supports any (including unknown), up to 10 minutes, over 10 minutes through 1 hour and over 1 hour. Restricted ranges require positive finite known durations. Length does not promise an end time for live broadcasts: live questions and the prepared Twitch snapshot use source eligibility plus the existing strict fresh-confirmation checks.
- Applied tuning affects Guide personal picks, explicit questions, matching-recording counts, available topic alternatives and source-scoped live observations. An explicit provider in a question must also satisfy the session choice; conflicts yield a readable empty state rather than silently overriding either constraint. Filtered-empty personal questions suggest resetting/changing the session instead of claiming the library is empty.
- Settings are volatile and independent per tab. They survive in-app navigation and reset on real reload or Reset. No localStorage/sessionStorage or database record is introduced. They are not exported, sent to providers or shared with Watch Together guests. Provider-specific recommendation desks keep their existing behavior; the UI names this Guide-only scope explicitly.
- The existing ranking scan remains cooperative and cancellable. Applied input changes immediately cancel stale work and hide old replies; the existing settled-input gate waits before preparing the latest snapshot. Standard selection retains twelve candidates; balanced selection keeps at most twelve per fixed source pool (48 scratch rows maximum), then selects twelve. The 4,096-label compact public-affinity cap remains in place. No full-catalog sort, retained per-title evidence graph, added polling or new provider request was introduced.

## Verification for revision 44

- Final npm run build and npm run typecheck passed.
- Broad regression passed **1,508 tests, zero failures**: 897 script tests with two workers and 611 native TypeScript tests. The final focused Guide/session/evaluation run also passed 40 tests, including custom-mode rejection and favorite-protection assertions.
- Nine session-policy tests cover immutable/equivalent defaults, no-op notifications, fresh-store reset, all length boundaries including invalid/unknown durations, source constraints, familiar/explore ordering in personal and explicit queries, cross-source evidence, privacy, strict live confirmation, empty-filter recovery, scoped topic/live alternatives and cancellation before reads/during affinity preparation.
- A 100,024-title fixture checks that balanced source selection scans the tail, returns four per source when all three have enough candidates, backfills missing slots, returns only twelve explanation records and never passes more than twelve rows to a native sort. It completed in about 400 ms with a no-op yield callback in the focused CPU-only run; actual UI scheduling/large-library endurance is not inferred from that timing.
- Development desktop (1440x1000) and mobile (390x844) interactive checks pass against an isolated real IndexedDB/localStorage catalog with local files, YouTube, Twitch, locked manual tags and hidden/private exclusions. They verify unchanged cards before Apply, retained Apply focus, source balancing, actual familiar/explore reordering, strict local/short/medium/long/unknown duration behavior, explicit-query conflicts, stale-answer removal, navigation persistence, second-tab independence, Reset and real reload. Saved tags/provenance/locks/favorites/ratings/rejection inputs remain identical and no extra provider request occurs.
- The same session workflow also passed on the production build. Desktop/mobile controls, cards and Home screenshots were visually inspected. Existing Guide/exposure regression results: both passed on production, including grounded evidence, reason feedback/Undo, dual-mirror retry, background-tab dwell, exposure deduplication and real backup export/restore.
- Home and mission browser workflows passed on development and production. Production Home matches the development baseline, with clean consoles, no overflow and no auth/brand warnings. The mission workflow checks revision/default promotions, 20-card queue paging, manual/custom preservation, clipboard fallback, real Markdown/CSV downloads and reload behavior.
- npm run check:recommendations passed the reviewed regression baseline. The same 62-title/16-scenario corpus, judgments, default outputs, metrics, quality findings and five corruption sentinels are retained; only implementation fingerprints were refreshed, including the new session-policy module. Four pre-existing quality checks and one missing-judgment scenario remain open. This is a regression gate, not a claim that all ranking quality is solved.

## Evidence and entry points

- Policy: src/lib/videos/recommendation-session.ts; volatile lifecycle: src/lib/recommendation-session.ts. Existing cooperative Guide ranking/query path: src/lib/videos/guide-picks.ts.
- UI: src/components/library/recommendation-session-control.tsx and ai-guide.tsx, using the current Guide, library, previews, feedback and exposure controls. No external AI/model integration was added.
- Tests: scripts/recommendation-session.test.mjs and recommendation-session-browser-check.mjs; migration coverage in src/lib/mission-plan.test.ts and scripts/mission-next-level.test.mjs. NEXT_LEVEL_MILESTONES.md regenerated from verified defaults.
- Artifacts: screenshots/session-tuning-{dev,built}.json and desktop/mobile controls/picks PNGs; session-tuning-home-{dev,built}.json and PNGs; session-tuning-mission-{dev,built}.json and PNGs; session-tuning-evaluation.json; session-tuning-guide-regression-built.json and session-tuning-exposure-built.json.
- Gates/logs: screenshots/session-tuning-build.txt and session-tuning-tests.txt; .grok/session-tuning-typecheck-final.log, session-tuning-focused.log, session-tuning-policy.log and session-tuning-*.log. Full regression runner: .grok/session-tuning-regression.cmd (two script workers, then the package native suite).

Limits: browser checks use isolated synthetic metadata, not real provider availability, personal recommendation satisfaction, a physical phone or a long-running memory soak. This milestone adds public Guide session controls; other recommendation desks, quality gaps and physical-device/relay/provider-soak milestones remain open.

---

# AI Guide grounded explanations — 25 October 2026

Revision 43 completes **next-056 — AI Guide grounded explanation**. Default progress is **220/306 complete**: eighteen next-level milestones verified, 82 next-level briefs planned, and four older external verification milestones remain open. The one-time migration promotes only next-056 for older plans and preserves unrelated custom/manual states and later reopens. The delivery queue and exported roadmap introduction now describe both completed and pending work accurately.

Baseline: personal picks reused one generic favorites/tags explanation, without identifying supporting titles or matching fields. Counts included orphan/private signals, operational source/format tags could dominate interest affinity, and there was no reason-specific feedback or useful public-only cold-start chooser.

## Delivered behavior

- Personal picks show actual favorite/like evidence or a shared saved content label and the eligible public title that supplied it. Raw candidate/origin label spellings are retained in the explanation, including reviewed aliases. Open evidence title uses the existing preview.
- Explicit questions quote actual title, saved tag, creator, category or recorded topic evidence. Discovery picks explicitly say that no saved content preference matched. Explanations use deterministic local rules; no external model wording or invented creator facts are presented.
- Recorded history excludes titles from the personal mix but never implies a completed watch. Signal counts and topic choices exclude hidden, unavailable, sample, adult/private, orphan local and missing titles. Explicit questions can find public titles already in history.
- Sparse evidence offers up to eight topics from the real eligible catalog. Selecting one searches this session without changing tags, likes or ratings. Empty/private-only libraries offer public-source navigation. No-match questions explain alternatives instead of fabricating matches.
- Each reason offers a title, provider-scoped creator or canonical topic reduction using the existing bounded feedback ledger, plus Undo. Existing positive favorite/topic-heart protections remain in effect. Contradictory 1-star/favorite choices and ranking adjustments are explained. Recent exposure is distinguished from watching.
- Feedback does not reshuffle the current cards or discard keyboard focus. Ask again or New recommendations applies the latest choices. Existing coalesced IndexedDB/localStorage mirrors preserve choices across reload; simultaneous failures show a session-only warning and explicit retry.
- Live questions require a fresh provider observation and reject unconfirmed, grace-held, stale, missing and implausibly future timestamps. A prepared snapshot is labeled as a snapshot; absence of a fresh match is not presented as proof of an offline stream.
- Preparation uses cooperative catalog slices, a twelve-candidate selector, at most four reasons per selected title and a 4,096-label compact affinity map of numeric source ordinals. Overflow is explained, and explicit queries still scan the complete eligible catalog. No full per-title evidence graph, new poller, provider request or storage format was added. Input changes and typing discard stale replies; navigation cancels work.

## Verification for revision 43

- Final npm run build and npm run typecheck passed.
- Broad regression passed **1,498 tests, zero failures**: 888 script tests with two workers and 610 native TypeScript tests. The final focused evidence/Guide/evaluation run passed 23 tests; the catalog-tail/evidence run passed 17. One obsolete free-text assertion found in the initial broad run was replaced with exact structured title/tag evidence checks, then the full suite was rerun successfully.
- Focused pure tests cover real public-origin evidence, raw reviewed aliases, empty/private-only/orphan/hidden/unavailable/sample inputs, operational facet exclusion, history-only discovery, exact field quotes, contradictory feedback/protections/exposure, strict live confirmation, vocabulary/output caps and cancellation before reads. The existing 100k fixture rejects catalog-sized sorts and sparse-ledger exports.
- npm run check:recommendations passes the reviewed regression baseline and all five corruption sentinels. The fixed 62-title/16-scenario corpus, judgments and thresholds are unchanged. Only guide-operational-facets changed output: three operational-only picks became three relevant content matches, NDCG 0 → 1, operational-only share 1 → 0, maximum creator share 1 → 1/3. Added the evidence helper to implementation fingerprints. Four pre-existing quality checks still fail (YouTube exposure, Twitch creator concentration and two Twitch freshness metrics); one partial-judgment scenario remains unmeasured. This is a regression gate, not an assertion that all recommendation quality is solved.
- Development and production interactive workflows passed on desktop (1440x1000) and mobile (390x844): empty-source navigation, public-only counts, topic chooser without taste writes, quoted query fields, no-match alternatives, stale-answer removal on typing, opening an actual evidence title, conflicting rating notice, reason-specific reduction/Undo, stable focus/order, durable reload, dual-mirror failure/retry and explicit refresh. Consoles are clean and horizontal overflow is absent.
- Home smoke and mission migration checks passed on development and production. Production Home matches the development baseline without page/console errors, auth or brand warnings. Actual roadmap/CSV downloads, clipboard fallback, existing manual/custom states and later reload are covered by the mission workflow.
- Desktop/mobile Home, Guide overview, expanded evidence and mission screenshots were visually inspected. Existing scoped-feedback and exposure browser regressions also passed on production, including actual backup downloads/restores, positive protections, bounded review paging, background-tab dwell, duplicate exposure prevention and dual-mirror retry.

## Evidence and entry points

- Logic: src/lib/videos/guide-picks.ts and guide-evidence.ts. UI: src/components/library/ai-guide.tsx and guide-suggestion.tsx, using the current store, preview, components, exposure control and feedback persistence.
- Tests: scripts/guide-evidence.test.mjs, guide-picks.test.mjs and guide-evidence-browser-check.mjs. Updated recommendation fingerprint/baseline, mission migration tests and NEXT_LEVEL_MILESTONES.md.
- Artifacts: screenshots/guide-evidence-{dev,built}.json and desktop/mobile PNGs; guide-evidence-home-{dev,built}.json and PNGs; guide-evidence-mission-{dev,built}.json and PNGs; guide-evidence-evaluation.json; guide-evidence-existing-feedback-built.json; guide-evidence-exposure-built.json.
- Gates/logs: screenshots/guide-evidence-build.txt and guide-evidence-tests.txt; .grok/guide-evidence-typecheck-final.log, guide-evidence-focused-final.log, guide-evidence-recommendation-check.log and guide-evidence-*-{dev,built}.log. Full regression runner: .grok/guide-evidence-regression.cmd (script tests with two workers, followed by the package native suite).

Limits: isolated synthetic catalogs and controlled player responses, not a real-library audit, physical-phone endurance test, provider availability test or continuous live checker. The Guide remains local and deterministic; no external language model was connected. Other ranking-quality and physical-device/relay/provider-soak milestones remain open.

---

# Tag recommendation confidence — 25 October 2026

Revision 42 completes **next-055 — Tag recommendation confidence**. Default progress is **219/306 complete**: seventeen next-level milestones verified, 83 next-level briefs planned, and four older external verification milestones remain open. The one-time migration promotes only next-055 for older plans and preserves unrelated custom/manual states and later reopens.

Baseline: inferred tags had a strongest-source label but no confidence or multi-field evidence. Uncorroborated creator keywords, isolated hashtags and description words could enter automatic interest tags; keyword/hashtag dumps could occupy the candidate cap ahead of stronger content. The preview offered no explicit acceptance path with retained confidence provenance.

## Delivered behavior

- Version-4 YouTube text inference separates creator video tags, title prose, chapters, hashtags and description prose into distinct evidence bits. Hashtags do not count again as independent title/chapter/prose evidence. Repetition within a field adds no confidence. Promotional lines, links and music credits are excluded.
- Scores describe evidence strength, not probabilities: high 80–100, medium 50–79, low 0–49. A creator tag corroborated by a title reaches 96; title/description or title/chapter agreement reaches 90. Creator-only tags remain 55, isolated hashtags 40, repeated generic prose 35. Description/creator agreement alone remains review-only; a high score requires a content title or chapter anchor.
- Confidence determines ordering before the 28-tag retention cap. Scratch candidates cap at 96 and the existing compact cache at 512. Weak dumps cannot crowd a stronger title entity out of the retained suggestions. Chapter normalization preserves evidence through stop-word removal; unsupported zero-evidence candidates are excluded.
- Only high-confidence interest candidates enter new automatic YouTube enrichment and inferred description topics. Existing source/creator/format filter labels remain supported. Manual, unknown legacy, explicitly reviewed and locked labels retain their existing protection. Cached provider repairs use the established bounded idle queue and the version stamp; they do not trigger automatic network rechecks.
- Browse summaries store compact aligned score/mask arrays, plus a short title hash. They contain no excerpts or full descriptions. The title hash prevents a renamed listing inheriting a previous title anchor; current evidence must be fetched before explicit acceptance. The YouTube ranking worker projection preserves the compact confidence fields. Legacy unscored summaries retain existing ranking compatibility.
- The video preview has a paginated confidence review with eight mounted suggestions, source badges, bounded field excerpts, saved/manual/accepted status, explicit selection and acceptance, and readable lock/stale/cap/invalid-evidence errors. At most three excerpts of 120 characters are prepared for an expanded candidate; excerpts center the matching term.
- Explicit acceptance records youtube-review provenance, original score, source mask and acceptance time. It does not create a field lock or rewrite manual labels/category locks. Accepted evidence survives provider refreshes and durable browser reload. The current tag/provenance/summary/check time must still match the review snapshot; stale acceptance is rejected. Manual editing continues to lock the field and supersedes the reviewed record.
- Export tag evidence downloads one bounded JSON snapshot of the selected public video’s current suggestions and matching field excerpts. It is an inspection report, not a restorable library backup. The existing general library pack does not gain a tag/provenance restore format in this milestone.
- Pulling remains explicit and sequential, up to five videos. Stop ignores an in-flight response before saving and starts no remaining requests. A disk save already underway may finish, as the control explains. Provider/canonical identity failures preserve saved metadata; edits made while a metadata request or disk save is pending remain authoritative.

## Verification for revision 42

- Final npm run build and npm run typecheck passed.
- Broad regression passed **1,488 tests, zero failures**: 879 script tests with two workers and 609 native TypeScript tests. After the final candidate-cap/chapter refinements, the affected-path runs passed **39 script tests and 30 native tests**.
- npm run check:recommendations passed against the reviewed 62-title/16-scenario baseline without new measured confidence inputs. Other recommendation-quality gaps remain open.
- A versioned, reviewed 24-case fixture set covers corroborated titles/chapters, generic title words, creator-only tags, unrelated keyword dumps, hashtag repetition and title hashtags, Unicode, generic/known-entity prose, stop-word chapter normalization, sponsor/affiliate/music-credit/discount/social/link noise. All 24 expected labels match; all five expected high-confidence cases are high and none of the negative cases is high. This is a small synthetic calibration set, not broad language accuracy or a held-out probability estimate.
- Pure tests verify exact JSON/card recovery, stale-title invalidation, weak description/topic isolation, source masks, bounded centered excerpts, strong candidates surviving noisy caps, accepted provenance, capacity/lock/stale/invalid-candidate rejection and manual-value preservation.
- Real store tests verify explicit weak-tag acceptance, preservation across later provider refreshes, rejection of old review snapshots, sparse immutable ledgers, hashtag-only topic isolation and manual edits while asynchronous metadata persistence is held. Existing repair tests retain saturation handling, durable versioning, idempotence, locks and bounded catalog work.
- Development and production interactive checks passed on desktop (1440x1000) and mobile (390x844). They pull real application metadata through controlled responses, inspect high/medium/low evidence, paginate, export the actual JSON, explicitly accept a weak suggestion, reload real IndexedDB/localStorage, verify original provenance, reject a mismatched video ID, Stop a held response, and edit/lock tags during another held response. Exactly four explicit metadata requests occur; reload/review/export add none. Consoles are clean and horizontal overflow is absent.
- Home smoke and mission migration checks passed on development and production; production matches the development smoke baseline with no console/page errors, auth or brand warnings. Desktop/mobile Home and confidence screenshots were visually inspected.
- The CPU-only scale check prepared eight rich selected records in 54 ms (about 7 ms each) and 20,000 compact rows in 81 ms. In that fixture, the full compact summary was 1,021 bytes and confidence arrays 174 bytes. These are timings from this machine/run, not provider, disk or real-user endurance measurements.

## Evidence and entry points

- New policy/review logic: src/lib/videos/youtube-tag-confidence.ts and youtube-tag-review.ts.
- UI: src/components/library/youtube-tag-suggestions.tsx, integrated in youtube-tags-control.tsx and readable provenance wording in pre-video.tsx using the existing preview, components and styling.
- Existing paths updated: youtube-text-tags.ts, topics.ts, types.ts, store.ts and use-youtube-ranking.ts.
- Tests: scripts/fixtures/youtube-tag-confidence.json, youtube-tag-confidence.test.mjs and youtube-tag-confidence-browser-check.mjs; enrichment-store.test.mjs, youtube-tags.test.mjs and youtube-text-tags.test.ts. Mission revision/defaults/migration tests and NEXT_LEVEL_MILESTONES.md updated additively.
- Artifacts: screenshots/tag-confidence-{dev,built}.json plus desktop/mobile controls and evidence PNGs; tag-confidence-home-{dev,built}.json and PNGs; tag-confidence-plan-{dev,built}.json; tag-confidence-calibration.json; tag-confidence-scale.json.
- Logs: .grok/tag-confidence-{build,typecheck,regression,tests,native-focused,baseline,scale}.log; tag-confidence-browser.log and tag-confidence-browser-built.log; tag-confidence-{smoke,plan}-{dev,built}.log. Scale reproduction: .grok/tag-confidence-scale.mjs.

Limits: browser tests use isolated synthetic public catalogs and controlled metadata responses, not real YouTube availability. Mobile is a Chrome viewport, not a physical-device endurance run. Inference remains conservative and primarily based on the existing English taxonomy; explicit review remains available for weaker or unfamiliar terms. No external integration or model service was connected or changed. The four older physical-device/relay/provider-soak milestones remain open.

---

# Reviewed topic aliases — 25 October 2026

Revision 41 completes **next-054 — Topic alias review workflow**. The default plan is **218/306 complete**: sixteen next-level milestones verified, 84 next-level briefs planned, and four older external verification milestones still open. The one-time migration promotes only next-054 for older plans, preserving unrelated manual/custom states and later reopens.

Baseline: built-in topic aliases could connect known synonyms, but saved misspellings remained disconnected and there was no evidence-based review, provenance or Undo. Topic Explorer also prepared its full topic interpretation again after each refresh.

## Delivered behavior

- Topics includes **Review topic spelling and aliases**, with bounded suggested spelling candidates and exact saved-label inspection. Evidence shows public title counts, source types and up to three title examples. Hidden, unavailable, sample, orphan local and private/adult titles are excluded. Operational provider, creator and format labels cannot be remapped.
- Suggestions never apply themselves. The owner reviews a canonical target before approval; short or tied labels additionally require a target and an explicit acknowledgement. Existing built-in topics/aliases cannot be reassigned, and targets cannot chain or cycle through another reviewed alias.
- A separate version-1 ledger retains at most 128 reviewed aliases, timestamps, approval method and supporting counts/sources. The UI mounts eight candidate/saved rows at a time. A full ledger requires explicit Undo before adding another decision; it does not silently evict approvals.
- Tags, manual locks, provider metadata, media identities, ratings and private content remain unchanged. Undo removes only the local interpretation and restores separate topic counts. Review samples do not enter the ledger or public Watch Together descriptors/session files.
- Existing localStorage and the coalesced activity database persist the ledger. Newest whole-ledger timestamps prevent stale mirrors resurrecting Undo. Reads do not write; explicit actions save once. Failure in both mirrors keeps session behavior available and shows an explicit retry. ZIP and companion-folder packs include marks/topic-aliases.json; legacy packs leave decisions intact and unsupported versions show a readable warning.
- Approved saved labels join Topic Explorer, public global search, YouTube/Twitch recommendation inputs and Guide topic answers across reload. Worker resets carry a bounded alias snapshot; search changes query expansions without rebuilding base document postings. Private/adult search requests retain raw interpretation. Existing preview ranking weights are not changed by this milestone.
- Topic Explorer caches typed ordinal postings. Approval/Undo stages and swaps only the affected old/new target postings; unrelated topic arrays are reused. Catalog/visibility edits still rebuild safely. Cooperative checkpoints preserve cancellation, and active consumers recover when an earlier mount cancelled shared preparation. Concurrent consumers share one staged patch. A regression covers the startup race discovered during browser testing.
- No provider request, model call, added polling or automatic merge is involved.

## Verification for revision 41

- Final npm run build and npm run typecheck passed.
- Broad regression: **1,477 tests passed, 0 failures** — 869 script tests with two workers plus 608 native TypeScript tests. Final affected-path run: **41 passed, 0 failures**, including the added shared-patch concurrency regression after the final safeguard. An earlier run exposed an outdated revision-40 test expectation; it was corrected and the full script suite rerun.
- npm run check:recommendations passed: the reviewed 62-title/16-scenario baseline remains unchanged with no approved aliases. Other recommendation-quality gaps remain open.
- Pure tests cover validation, limits, candidate evidence, ambiguity, exact manual/locked-tag preservation, approval/reload/Undo, unaffected evidence/posting identity, private/raw search, the actual search worker with one document batch, YouTube worker resets, public YouTube/Twitch/Guide scoring, interrupted patch recovery, stale mirror ordering, backup compatibility, quota failure and room/session exclusion.
- Development and production interactive checks pass on desktop (1440x1000) and mobile (390x844): review/approval, required short-label acknowledgement, Undo, current topic counts, real worker-backed global search for both spellings, durable reload, real ZIP export/import with exact provenance, simultaneous quota failures/retry and eight-row pagination. A mobile pagination overflow found during verification was fixed.
- Home smoke passes on both outputs and viewports; production matches the development baseline. Console/page errors, horizontal overflow, auth and brand warnings are absent. Desktop/mobile Home and alias screenshots were visually inspected.
- Mission browser checks verify revision 41, sixteen verified next-level completions, preserved custom/manual states, start/block/resume, filters, clipboard denial fallback, complete Markdown/CSV export and reload.
- A separate synthetic 80,000-title check measured a 342 ms initial build and 86 ms affected-topic patch over 710 cooperative checkpoints. Science reached 40,000 connected titles; gaming retained the exact same posting object and the index retained one base build. Timings describe this machine/run, not a real-user endurance result.

## Evidence and entry points

- New logic: src/lib/videos/topic-taxonomy.ts, topic-aliases.ts, topic-alias-candidates.ts and topic-postings.ts; src/lib/topic-alias-store.ts.
- UI: src/components/library/topic-alias-review.tsx and topic-links.tsx. Existing Topics layout, components and styling are retained.
- Integration: topics.ts, topic-catalog.ts, ranking-core.ts, guide-picks.ts, search-index.ts, search-token-query.ts, search.worker.ts, search-worker-index.ts, persist.ts, library-pack.ts and store.ts; YouTube ranking protocol/selector/hook; media-feedback.ts, library-app.tsx, search-ranking.ts and pre-video.tsx.
- Tests: scripts/topic-aliases.test.mjs, topic-alias-store.test.mjs and topic-alias-browser-check.mjs. Mission revision/defaults/migration tests and NEXT_LEVEL_MILESTONES.md updated additively.
- Browser artifacts: screenshots/topic-alias-{dev,built}.json and desktop/mobile approval/control PNGs; topic-alias-home-{dev,built}.json and PNGs; topic-alias-plan-{dev,built}.json.
- Scale artifact: screenshots/topic-alias-scale.json, reproducible via .grok/topic-alias-scale.mjs.
- Logs: .grok/topic-alias-{build,typecheck,tests,native,regression-final,baseline,scale}.log; topic-alias-browser.log and topic-alias-browser-built.log; topic-alias-{smoke,plan}-{dev,built}.log.

Limits: isolated synthetic public catalogs and controlled provider responses verify application behavior; no real user library was changed. Mobile is a Chrome viewport, not a physical-device endurance run. The four older physical-device/relay/provider-soak milestones remain open.

---

# Visible recommendation exposure — 25 October 2026

Revision 40 completes **next-053 — Recommendation exposure ledger**. The default plan is **217/306 complete**: fifteen next-level milestones verified, 85 next-level briefs planned, and four older external verification milestones still open. The revision-39 migration promotes only next-053 and preserves unrelated manual/custom statuses and later reopens.

Baseline: ranking knew opens, ratings and favorites but did not know which unopened recommendations were actually shown. Repeated shelves could therefore continue promoting the same unseen items. Artwork visibility alone was insufficient evidence: cards may be prefetched, clipped, quickly skipped, covered by the player or shown in a background tab.

## Delivered behavior

- Exposure is limited to explicitly marked public recommendation surfaces: More from your rated YouTube, Recommended Twitch VODs, Guide personal picks and public preview suggestion cards. Ordinary catalog/search/history/live/favorite lists, private/adult pages and offscreen prefetched rows are not counted.
- One pooled observer requires at least 50% of the card to intersect the viewport, including ancestor clipping. A shared event-driven dwell manager requires two continuous seconds while the document is visible and focused. Blur, visibility changes, player/preview context changes, intersection loss and unmount discard incomplete dwell. Completion also verifies the card is connected and contains the topmost element at its visible center; covered controls cannot count merely because their rectangles intersect.
- No observer or dwell callback changes React card state. A visible mounted row can contribute once; canonical media identity and a 30-minute cooldown deduplicate remounts and repeated shelves. The dwell/observer pools cap registrations at 1,024 and release nodes, listeners and timers after their final consumer leaves. There is no interval or hidden-page poller.
- A separate version-1 ledger contains only canonical media keys, bounded counts and timestamps. Pending observations cap at 256 and saved rows cap at 2,048; disposable oldest exposure rows rotate out. Counts cap at eight. This is separate from opens, watch time, likes, ratings, explicit rejection reasons and hidden/unavailable flags.
- Updates coalesce into one five-second batch scheduled through the existing background-work budget, using the existing activity database, coalesced writer and a bounded localStorage mirror. Opening, reset, import, page hiding and page exit use the same save path. Reads do not write. Both-mirror failures leave evidence usable for the session and expose an explicit retry. Newer state invalidates older pending save-status completions.
- The novelty reduction is three points per counted exposure, capped at 18 points, halved every seven days and expired after 30 days. It never removes a title. Opening a title clears its canonical exposure. Saves, likes, creator favorites and four/five-star ratings bypass it. Explicit rejection semantics and visibility rules remain independent.
- Production YouTube worker ranking, Twitch VOD scoring, Guide personal/query ranking and public preview ranking apply this reduction. Empty ledgers skip candidate penalty work. Private/adult preview scoring explicitly ignores the public penalty. Worker packing now preserves provider video identity, needed for both canonical exposure and the prior title-scoped rejection choice.
- Passive impressions do not trigger ranking events or reshuffle the currently painted shelf. The next mix, a ranking refresh or a new preparation uses current evidence. YouTube mix invalidation rebuilds scores only if exposure inputs changed; otherwise it retains the existing scored-evidence reuse. Guide New recommendations captures the current ledger. The explicit Apply recent exposure action refreshes affected ranking inputs.
- Fresh recommendations / recent exposure controls explain measurement, decay, protection and scope; show a bounded count; allow Apply, Reset and failed-save retry. They appear in the Guide, public preview recommendation choices, and YouTube/Twitch ranking explanations. Reset clears only disposable exposure, preserving ratings, saves, history and explicit rejection choices.
- The actual library-pack ZIP and companion-folder pack include marks/recommendation-exposure.json. Import validates the version/container, restores that ledger (including an explicit empty reset) and advances its save stamp. Older packs leave current exposure unchanged. Whole-ledger timestamps prevent an old mirror from resurrecting an open/reset state. Public Watch Together descriptors/session files omit exposure data.

## Verification for revision 40

- Final npm run build and npm run typecheck passed.
- Complete regression command passed: **1,461 tests, 0 failures** — 854 script tests with two workers plus 607 native TypeScript tests. Final focused run: **43 passed, 0 failures**.
- npm run check:recommendations passed against the reviewed baseline with no measured exposure input.
- Development and production feature, mission migration and Home smoke checks passed on desktop/mobile. Production matched the development smoke baseline; console errors, horizontal overflow and brand/auth warnings were absent.

- Pure tests cover malformed/future imports, TTL, cooldown, count bounds, exact seven-day half life, canonical aliases, positive-preference protection, opening/reset and mirror ordering. A 10,000-plus-observation simulated browse stays at 2,048 entries and retains no full-library graph.
- Actual production selector tests cover YouTube ordering and worker reset, Twitch score differences, Guide personal/query ordering, preview taste independence, private/adult protection and public room/session exclusion. The previous 62-title/16-scenario baseline remains unchanged without measured exposures; its other quality gaps remain open.
- Fake-clock dwell tests prove offscreen, immediately skipped, unfocused, occluded and wrong-context cards cannot count, and every interruption restarts the two-second requirement. Observer tests prove half-visible thresholds, pooling, cleanup and stale-generation rejection. Store tests prove coalesced writes, bounded pending work, no passive ranking event, canonical opens, stale-mirror reset protection, read-only snapshots, backup compatibility and failed-save retry.
- Development and production interactive checks run isolated desktop (1440x800) and mobile (390x844) Chrome. They switch to a real background browser tab, verify zero background/short-dwell impressions, compare stored identities with genuinely visible cards, verify no passive reorder, open a card, reset while retaining personal feedback, export/import the actual ZIP, reload real mirrors, inject simultaneous quota failures and retry. Both viewports verify clean consoles and no horizontal overflow.
- Home smoke checks cover development and production with baseline comparison; new controls and Home desktop/mobile screenshots were visually inspected. Mission browser checks exercise revision migration, custom/manual preservation, start/block/resume, filters, clipboard fallback, full Markdown/CSV exports and reload.

## Evidence and entry points

- New logic: src/lib/videos/recommendation-exposure.ts, src/lib/recommendation-exposure-dwell.ts, src/lib/recommendation-exposure-store.ts. The existing src/lib/card-visibility.ts now owns the additional pooled meaningful-visibility observer.
- New components: src/components/library/use-recommendation-exposure.ts, recommendation-button.tsx and recommendation-exposure-control.tsx. Integrated with video-card.tsx, browse.tsx, library-app.tsx, ai-guide.tsx, pre-video.tsx, recommendation-choices.tsx and ranking-panel.tsx.
- Ranking/storage paths: src/components/library/use-youtube-ranking.ts, use-twitch-vod-ranking.ts, use-preview-ranking.ts; src/lib/remote/youtube-recommendations.ts and youtube-ranking-protocol.ts; src/lib/videos/twitch-recommendations.ts, guide-picks.ts, preview-ranking.ts, store.ts, persist.ts and library-pack.ts.
- Tests: scripts/recommendation-exposure.test.mjs and recommendation-exposure-store.test.mjs; scripts/recommendation-exposure-browser-check.mjs. Mission revision/defaults/tests and NEXT_LEVEL_MILESTONES.md updated additively.
- Artifacts: screenshots/exposure-dev-ui.json and exposure-built-ui.json plus desktop/mobile control screenshots; exposure-dev.json and exposure-built.json plus Home screenshots; exposure-dev-plan.json and exposure-built-plan.json. Existing offline baseline artifact remains screenshots/recommendation-evaluation-current.json.
- Logs: .grok/recommendation-exposure-{tests,regression,build,typecheck,baseline,dev-ui,built-ui,dev-plan,built-plan,dev-smoke,built-smoke}.log.

Limits: evidence uses synthetic catalog rows and controlled provider-player responses in isolated browser storage. Real tab backgrounding is verified in desktop Chrome with a mobile viewport, not a physical-phone endurance run. No external provider, model service, paid action or real-user preference reset is needed. The four older physical-device/relay/provider-soak milestones remain open.

---
# Scoped recommendation choices — 25 October 2026

Revision 39 completes **next-052 — Explicit recommendation rejection reasons**. The default plan is **216/306 complete**: fourteen next-level milestones verified, 86 next-level briefs planned, and four older external verification milestones still open. The one-time migration promotes only next-052 for revision-38 plans and preserves unrelated manual/custom states and later reopens.

Baseline: title stars could indirectly influence shared creator/topic affinity, but there was no separate opt-in title, creator or topic rejection record, no review/Undo workflow, and no backup payload for those decisions. The new controls keep rejection evidence separate from ratings, hidden/unavailable flags, catalog rows and room data.

## Delivered behavior

- Public/local title previews now include **Not interested? Tune recommendations**. Choose less of this title, less from its provider-scoped creator (or local folder), or less of one evidenced canonical topic. Each choice is independently reversible, and Review saved choices can undo any saved entry.
- Title keys use provider media identity, so alternate saved rows for the same remote item match without penalizing sibling titles. Creator keys include provider identity; topic keys use existing content evidence and aliases, not operational tags or creator-name guesses. Title-only choices do not train broader affinity.
- YouTube personalized worker ranking, Twitch VOD recommendations, Guide personal/query ranking, and preview suggestions apply bounded score penalties: title 40, creator 24, topic 16, combined maximum 64. These are soft score reductions; they do not delete, hide, mark unavailable, alter ratings, or promise permanent exclusion. Sorting by date/viewers and manually saved libraries retain their existing behavior.
- Saved titles and favorited creators bypass these new penalties. Canonically hearted topics bypass their own topic penalty. Positive preferences and rejection choices remain stored independently, so removing a favorite restores the applicable penalty. Existing one-star behavior remains separate.
- No-choice ranking takes a fast path without new per-candidate penalty/protection work. Ledger indexes compile once per ranking preparation. No polling, provider request, model call or automatic budget increase was introduced.
- At most **512 choices** are retained; adding a 513th reports the limit without evicting another personal choice. The review mounts **eight rows per page**. Import normalization validates version, fields, bounded scan, identities and topics. Unsupported/malformed ledger containers are ignored rather than clearing current choices.
- Feedback export version 5 adds an optional version-1 rejection ledger using the existing feedback localStorage/IndexedDB mirrors and coalesced save. Whole-ledger timestamps include removals, so an older mirror cannot resurrect an undone choice. Startup hydration and cache-protection reads use the newest ledger. Old packs without the field keep current choices; a valid imported ledger explicitly restores its choices, including an empty state.
- Library pack ratings JSON now includes rejection choices, creator favorites and watch-time evidence in addition to its existing ratings/notes/creator likes. Pack restore recovers the saved rejection ranking inputs exactly. Rejection ledger save timestamps advance on restore to retain that restore across mirrors; timestamps are not ranking weights.
- Both mirrors failing shows a session-only storage warning with **Retry saving feedback**. Retry saves current inputs; an older asynchronous completion cannot overwrite a newer pending status. Save-status notifications use a dedicated channel and do not trigger aggregate ranking events or per-card rating subscriptions.
- The UI is available on public/local previews; private/adult preview presentation is unchanged. Watch Together media descriptors and public session exports use their existing allowlists and cannot include this feedback ledger.

## Verification for revision 39

- Final npm run build and npm run typecheck passed.
- Complete script regression stage: **837 passed, 0 failures** (two workers). Its first native stage exposed a missing explicit .ts worker import; that was fixed, and the entire native stage reran: **606 passed, 0 failures**. Final focused checks, including an additional malformed-import guard and the private-preview boundary: **37 passed, 0 failures**.
- Recommendation baseline check passed. Final production UI, plan migration and baseline smoke checks passed on desktop/mobile with no console errors, overflow or baseline divergence.

- Focused production-path tests cover canonical title aliases, sibling/creator/provider isolation, canonical topic evidence, explicit favorite/topic-heart protection, bounded imports/capacity, deterministic Undo, YouTube worker reset, Twitch score subtraction, Guide ordering/visibility, preview scores without tag-training changes, backup round-trip, failed-save retry, malformed/future imports, dedicated notification channels and room/session privacy.
- The previous 62-title/16-scenario recommendation baseline still matches with no explicit rejection choices. Its existing quality gaps remain open; next-052 does not claim to fix creator diversity, repeated exposure, operational-tag relevance or publication freshness globally.
- Development and production desktop/mobile interactive checks exercise separate scoped choices, real mirror reloads, favorite explanation, simulated simultaneous quota failures and retry, actual library-pack ZIP download/restore, exact saved evidence and rating/watch-time retention, and eight-row review pagination. Console errors and horizontal overflow are checked on both viewports.
- Home smoke passes on development and production; production is compared with the development baseline. Desktop/mobile Home and new-controls screenshots were visually inspected. Mission UI checks on both builds exercise revision migration, manual/custom status preservation, filtering, start/block/resume, copied briefs, clipboard fallback, Markdown/CSV download and reload.

## Evidence and changed entry points

- Production entry points: src/components/library/recommendation-choices.tsx, pre-video.tsx, use-preview-ranking.ts, use-youtube-ranking.ts, use-twitch-vod-ranking.ts, ai-guide.tsx; src/lib/videos/recommendation-rejections.ts, preview-ranking.ts, twitch-recommendations.ts, guide-picks.ts, persist.ts, library-pack.ts; src/lib/remote/youtube-recommendations.ts and youtube-ranking-protocol.ts; src/lib/media-feedback.ts.
- Migration and roadmap: src/lib/mission-plan.ts, mission-plan.test.ts, scripts/mission-next-level.test.mjs, scripts/mission100-browser-check.mjs, scripts/milestone-completion-browser-check.mjs and NEXT_LEVEL_MILESTONES.md.
- Focused tests: scripts/recommendation-rejections.test.mjs, scripts/ranking-feedback.test.mjs, scripts/rating-subscriptions.test.mjs. Interactive script: scripts/recommendation-rejections-browser-check.mjs.
- Browser artifacts: screenshots/rejections-dev-ui.json and rejections-built-ui.json (desktop/mobile feature screenshots alongside each); rejections-dev-plan.json and rejections-built-plan.json; rejections-dev.json and rejections-built.json. Offline baseline artifact: screenshots/recommendation-evaluation-current.json.
- Logs: .grok/recommendation-rejections-{tests,regression,build,typecheck,baseline,dev-ui,built-ui,dev-plan,built-plan,dev-smoke,built-smoke}.log.

Limits: browser checks use isolated synthetic catalog/storage and a local provider-player fixture. No external provider changes or paid/model calls are needed for this milestone. No real-user preference migration was forced, no library reset was performed, and no physical-device/provider-soak result is claimed. The four earlier external verification milestones remain open.

---
# Recommendation evaluation foundation — 25 October 2026

Revision 38 completes **next-051 — Recommendation evaluation dataset**. The default plan is **215/306 complete**: thirteen next-level milestones are verified, 87 next-level briefs remain planned, and four older external verification milestones remain open. Revision-37 plans promote only next-051; unrelated manual/custom choices and later reopens remain preserved.

Baseline: existing unit tests covered individual ranking behaviors, but there was no common graded corpus, frozen quality artifact, per-source evaluation or proof that operational-tag/creator-concentration regressions would be detected. This milestone creates that foundation. It does not change production ranking weights, feedback semantics or saved user preferences, and it does not claim to fix the quality gaps it measures.

The new offline runner invokes the actual YouTube personalized ranker, Twitch recommendation scorer plus VOD ordering, Guide personal selector and Guide topic query. Its version-1 corpus contains 62 synthetic media rows and 16 scenarios with written intents, explicit eligible identities, independent graded judgments and feedback. A fixed UTC clock and seed make ranking outputs reproducible. Creator/topic affinity, publication age versus ingestion age, one-star rejection, operational labels, canonical aliases, prior shelf exposure, privacy/visibility exclusions, cold start, single-creator availability and missing judgments are represented. No real account, creator, file path or user library is loaded.

Metrics include graded canonical-aware NDCG, judged-slot precision with a separate fill check, creator/provider distributions, canonical repeat rate, prior synthetic shelf overlap, explicit-negative/operational-only shares and known-publication freshness. Unknown dates and judgments stay unknown, and empty eligible libraries are inapplicable rather than perfect relevance. A single available relevant creator is not falsely accused of avoidable concentration. Reports include case-level and per-source breakdowns and state that these are synthetic assertions, not user satisfaction or provider throughput.

Five adversarial output variants must trip their intended operational-tag, creator-monopoly, repeat-exposure, canonical-duplicate and explicit-negative detector. These variants do not alter real weights or become the accepted output. The baseline records production outputs first, so it cannot hide current weaknesses by deriving judgments from those outputs.

The initial reviewed baseline has **81 passing checks, seven failing quality checks across four scenarios, one deliberately unmeasured judgment check and ten inapplicable checks**. All five adversarial detectors work, and production outputs have no unexpected/excluded-result contract violations. Findings remain explicit: Guide personal picks can favor mechanical tags; Twitch VODs can concentrate on one prolific liked creator and favor ingestion recency over publication freshness; YouTube can repeat a prior shelf without exposure evidence. Future recommendation milestones own those fixes.

Two npm commands are available: benchmark:recommendations writes the current report; check:recommendations compares it with the reviewed baseline. Integrity, baseline drift and strict quality results are separate. The normal baseline comparison passes when the known output/metrics are unchanged; the optional --quality-gate intentionally exits nonzero for this initial baseline. Missing/incompatible baselines, changed judgments/clock/seed, altered outputs or metric definitions require review. Baseline recording cannot overwrite an existing artifact without --replace-baseline, and path preflights prevent current output from overwriting either the corpus or baseline, including Windows case aliases. Current artifacts are limited to the workspace benchmark/screenshots locations.

The runner performs no network calls, browser storage reads/writes, real-feedback mutations or optional model requests. It is not loaded by page startup, so there is no additional production polling, ranking pass or retained catalog graph. README instructions describe metric denominators, current findings, command exit meanings and explicit baseline review.

## Verification for revision 38

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,428 passed, 0 failures** — 823 script tests with two workers plus all 605 TypeScript tests from the package command. Existing large-library, provider, and room regressions remain included.
- Ten evaluation tests cover corpus validation/reference bounds, an independently calculated two-title NDCG value, incomplete judgments, publication/ingestion separation, canonical aliases, exposure versus rejection, single-creator/empty handling, five independent adversarial mutations, deterministic real selectors, frozen input preservation, no fetch, strict baseline comparison, overwrite preflights and actual CLI nonzero exits for strict quality and missing baselines.
- npm run check:recommendations passed against the frozen baseline. The strict quality gate was separately verified to fail as intended; this is a measured foundation, not a passing recommendation-quality release. The checked artifact records current source-file hashes alongside corpus/version/clock/seed evidence.
- Desktop/mobile development and production Mission plan acceptance passed migration with thirteen verified next-level defaults, manual/custom status preservation, workstream/search/priority filters, copy and clipboard fallback, Markdown/CSV exports and reload. No console errors or horizontal overflow occurred; screenshots inspected.
- Desktop/mobile development and production Home smoke passed with no console, branding or auth warnings and a non-diverging baseline. Production app ranking behavior is unchanged; the offline selector tests exercise ranking directly rather than substituting mock scores.

Validation: npm run build; npm run typecheck; node --test scripts/recommendation-evaluation.test.mjs; full package tests with script concurrency two; npm run check:recommendations; actual CLI quality/missing-baseline exit checks; scripts/mission100-browser-check.mjs on development/production; scripts/browser-smoke.mjs on development/production.

Evidence: benchmarks/recommendations/corpus.v1.json, baseline.v1.json and README.md; screenshots/recommendation-evaluation-current.json; screenshots/recommendation-evaluation-{dev,built}-plan.json; screenshots/recommendation-evaluation-{dev,built}.json, with desktop/mobile PNGs. Browser profiles were isolated and the real user's saved library/statuses were not seeded or reset. Photo/adult recommendation quality, remote AI wording, live ordering, real-user satisfaction and provider retrieval performance are outside this synthetic baseline. Existing real-provider/physical-device/relay milestones remain open. The development app remains available after stopping the temporary production QA server.

Changed entry points: scripts/lib/recommendation-evaluation.mjs, scripts/lib/recommendation-rankers.mjs, scripts/recommendation-evaluation.mjs, its tests, benchmarks/recommendations/, npm script entries and versioned mission defaults/tests/export.

---
# YouTube embed failure triage milestone — 25 October 2026

Revision 37 completes **next-028 — YouTube embed failure triage**. The default plan is **214/306 complete**: twelve next-level milestones are verified, 88 next-level briefs remain planned, and four older external verification milestones remain open. Revision-36 plans promote only next-028; unrelated manual/custom choices and later reopens remain preserved.

Baseline: trusted iframe errors and a generic device-local reload/watch link already existed, but the room lacked structured cause/action guidance, bounded per-title error evidence and an export. An errored iframe could still receive corrective seeks from later canonical reconciliation; incidental readiness/clock messages could make a failed player look recovered. Existing queue, chat, manual Ready choices, per-device startup and independent host permission enforcement remain intact.

Watch Room → Player recovery now distinguishes invalid link, browser/HTML5 playback, unavailable/private video, creator-disabled embedding, player identification/setup, unknown reported errors and device autoplay blocks. Mapping uses the observed numeric error code from the current trusted iframe, following [YouTube’s official player events documentation](https://developers.google.com/youtube/iframe_api_reference#onError), checked 25 October 2026. Code 101/150 guidance explains the official watch-page path; code 153 guidance identifies referrer/player identity as a possible setup cause. No access/age bypass, cookie extraction, media download or restricted-content probe is implemented.

A bounded existing handshake that never receives readiness now reports setup uncertainty without inventing a provider error or claiming that the video was removed/restricted. Late readiness can recover a timed-out handshake without an automatic reload. Official watch links are rebuilt from the public video identity and open separately; the UI explains that external playback is not synchronized. Device-only reload records a new player load, preserves the room/queue/access settings and exposes a fresh loading state. Confirmed playback clears the active failure; an incidental Ready or stale playing clock sample cannot erase a provider error.

Confirmed failures suppress automatic iframe seek/play reconciliation until an explicit local retry or a fresh observed play event. Failed-frame clock/ended samples cannot change the room timeline or skip its queue. The host’s canonical room state and other viewers continue normally. The guard does not broaden guest queue, playback or seek access, and a recovery action never publishes a video selection or permission change.

Diagnostics retain at most 12 public YouTube video identities with six recent transitions each during this browser’s room visit. Repeated error codes and playing clock messages retain the same evidence array and original observation time. Per-title load counts are bounded; invalid identities, phases, clocks and error payloads are ignored. Room/title/player generations prevent late replaced-player observations from contaminating another title. The history clears on browser reload or room replacement; Clear earlier title diagnostics retains only the current title. No new persistence ledger is introduced.

An explicit version-1 JSON download whitelists canonical public identity/watch URL, compact phases/codes, observation times and bounded load counts. It excludes room codes/invitations, peer names, local paths/fingerprints, private catalog fields, account/cookie data, provider payloads and playback positions. The collapsed diagnostic body mounts only when opened. Stable recovery callbacks and transition deduplication prevent clock ticks from rebuilding the panel or adding evidence. No provider polling, automatic reload, automatic file download or extra fetch is added; timeout guidance reuses the existing finite handshake budget.

## Verification for revision 37

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,417 passed, 0 failures** — 813 script tests with two workers plus all 604 TypeScript tests from the package command, including existing large-library regressions. An initial stale completed-count assertion was updated; the final complete run passed.
- Eight new diagnostic cases cover documented code classes, unknown codes, autoplay versus setup uncertainty, absent invented timeout codes, 10,000 duplicate errors without identity/timestamp growth, sticky errors, retry/play recovery, 12-title/six-event bounds, invalid inputs, public-only export and late-clock preservation. The mission migration case verifies only next-028 promotion and preserved manual/custom/later states.
- Final development and production acceptance passed with isolated desktop host and 390px touch-phone guest Chrome clients using actual signaling and WebRTC. Controlled current-origin provider events covered all code categories, parent-source spoof rejection, 100 repeated errors, delayed playing clock samples and repeated host resyncs without new iframe loads or seek/play loops. Chat, acknowledged queue addition and opening the canonical official watch page continued while one guest’s embed failed. Local reload, autoplay recovery, exhausted handshake, late readiness, diagnostic downloads, title changes, earlier-history clearing and browser reload all passed. The paused clock remained within sub-second initial transport-settling tolerance; host permissions and confirmed queue remained intact. No console errors or horizontal overflow occurred; screenshots inspected.
- Existing production readiness acceptance passed manual Ready versus blocked autoplay, no duplicate readiness traffic, explicit host wait/pause, independent locked playback/seek enforcement, stale title report rejection, Twitch ready/blocked/playing states, honest unsupported clips, real sample MP4 decoding on an empty phone library over RTC and departure cleanup.
- Production milestone migration/filter/copy-fallback/Markdown/CSV/reload checks passed with twelve verified next-level defaults and preserved manual/custom work. Desktop/mobile development and final production Home smoke passed with no console, branding or auth warnings and a non-diverging baseline.

Validation: npm run build; npm run typecheck; node --test scripts/room-youtube-diagnostics.test.mjs scripts/room-player-readiness.test.mjs; full package test commands with script concurrency two; scripts/watch-room-embed-triage-check.mjs on development/production; scripts/watch-room-readiness-check.mjs on production; scripts/mission100-browser-check.mjs on production; desktop/mobile browser-smoke checks.

Evidence: screenshots/embed-triage-{dev,built}-ui.json, screenshots/embed-triage-existing-readiness.json, screenshots/embed-triage-plan.json and screenshots/embed-triage-{dev,built}.json, with desktop/mobile PNGs. Isolated browser profiles were used; the real user’s library and saved room preferences were not seeded or reset. Provider frames and the official watch page were controlled fixtures; room transport and the separate existing local-video decode case were real. Physical-device policies, real-provider restrictions/soak and cross-network relay remain external verification requirements and are not marked complete. The development app remains available after the temporary production QA server is stopped.

Changed entry points: src/lib/multiplayer/room-youtube-diagnostics.ts, src/components/library/use-youtube-embed-diagnostics.ts, youtube-embed-recovery.tsx, watch-room-section.tsx, diagnostic/browser tests and versioned mission defaults/tests/export.

---
# Watch Room observed readiness milestone — 25 October 2026

Revision 36 completes **next-044 — Per-guest playback readiness**. The default plan is **213/306 complete**: eleven next-level milestones are verified, 89 next-level briefs remain planned, and four older external verification milestones remain open. Revision-35 plans promote only next-044; unrelated manual/custom states and later reopens remain preserved.

Baseline: the room exposed a host-confirmed manual Ready flag and queue vote, but did not tell the host whether a guest’s actual player was loading, blocked, buffering or playing. A guest could be manually Ready while still unable to start playback. The existing manual vote, queue permissions, player recovery and host control paths are retained.

Watch Room → Ready & votes now shows a manual readiness choice alongside a separate device-observed player status and a count of devices reporting playback. YouTube iframe readiness, play/pause, buffering, ended, embed errors and autoplay-block events feed the status; Twitch uses interactive ready, actual playing, pause, playback-block and failure signals. Native library/matching-file players and incoming RTC streams report native readiness/playback/buffering/error events. Waiting for an approved local stream/file is distinct from a loading player. Twitch clips and unsupported embed setups explicitly report unavailable observation instead of pretending to be ready.

The host sees status-specific help and an explicit Pause room to wait action. Observations never toggle manual Ready, move the queue, seek, start guests, or authorize a playback request. A blocked manually Ready guest remains visibly blocked until an actual playback observation, while routine ready/buffering messages cannot silently clear the tap requirement. Shared play/pause and seek controls retain their independent host-enforced permissions.

Readiness reports contain only a bounded enum status, capability and numeric host selection revision: no video identity, local path/fingerprint, position, diagnostic error text, credential or device details. Host transport identity owns each report; stale/future selections, malformed reports and unknown senders are rejected. Selecting another title clears player observations without discarding manual choices or valid queue votes. Local player generations ignore events from replaced sources/players. Departing peers lose their ephemeral observations and votes. Older manual-only clients remain readable and show unreported player status.

Apart from initial/reconnect handshakes, only effective status/capability/selection changes report, coalesced at 250 ms; host publication is also coalesced. The state retains at most 65 participants and no observation history. The UI mounts 16 statuses initially with explicit Show more. Clock ticks do not publish readiness, and the feature introduces no new polling, storage ledger, provider requests or background video players.

## Verification for revision 36

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,408 passed, 0 failures** — 805 script tests with two workers plus all 603 TypeScript tests from the package command. Existing large-library and provider/store regressions remain included.
- Eight focused readiness cases verify wire whitelisting, invalid inputs, sticky autoplay/error handling, manual/vote independence, monotonic title revisions, stale/future/outsider rejection, 10,000 duplicate reports without revision growth, roster/queue pruning, 65-person bounds, legacy-client parsing and identity ownership. Existing room/film/clip unit cases also pass.
- Final development and production browser acceptance passed with isolated desktop host and 390px touch-phone guest Chrome clients using actual room signaling and WebRTC. Controlled YouTube/Twitch signals cover manual Ready plus blocked autoplay, host-only wait/pause, locked playback/seek permissions, buffering/playing/paused/error states, device reload, selection changes, delayed old reports, unsupported clips, duplicate event storms and clock-only quietness. Real sample MP4 frames decoded on an empty guest library over RTC and moved from waiting to actual playing. The queue and playback permission checks stayed intact. Readiness packets contained no title, file identity, clock or extra private field. No console errors or horizontal overflow occurred; screenshots inspected.
- The existing production guest-control acceptance passed manual Ready acknowledgements, one latest queue vote, explicit host prioritization, locked queue access, independently enforced play/pause/seek, quiet timing heartbeats, guest reload and departure cleanup.
- Production mission migration, filtering, copied-brief fallback, Markdown/CSV export and reload checks passed with eleven verified next-level defaults, preserving manual/custom statuses. Desktop/mobile development and final production Home smoke passed with no console, branding or auth warnings and a non-diverging baseline.

Validation: npm run build; npm run typecheck; node --test scripts/room-player-readiness.test.mjs scripts/watch-film-clips-upgrade.test.mjs; full package test commands with script concurrency two; scripts/watch-room-readiness-check.mjs on development/production; scripts/watch-room-guest-controls-check.mjs on production; scripts/mission100-browser-check.mjs on production; desktop/mobile browser-smoke checks.

Evidence: screenshots/player-readiness-{dev,built}-ui.json, screenshots/player-readiness-existing-controls.json, screenshots/player-readiness-plan.json and screenshots/player-readiness-{dev,built}.json, with desktop/mobile PNGs. Isolated browser profiles were used; the real user’s library and stored room preferences were not seeded or reset. Public provider events were controlled fixtures; local media playback and room transport were real. Physical iOS/Android policies, real-provider embed verification/soak and cross-network relay remain separate requirements and are not marked complete. The development app remains available after the temporary production QA server is stopped.

Changed entry points: src/lib/multiplayer/room-player-readiness.ts, room-participation.ts, src/components/library/use-room-player-readiness.ts, room-participation-panel.tsx, watch-room-section.tsx, room-stream-player.tsx, readiness/browser tests and versioned mission defaults/tests/export.

---
# Watch Room session handoff milestone — 25 October 2026

Revision 35 completes **next-047 — Session playlist handoff file**. The default plan is **212/306 complete**: ten next-level milestones are verified, 90 next-level briefs remain planned, and four older external verification milestones remain open. Revision-34 plans promote only next-047; unrelated manual/custom states and later reopens remain preserved.

Baseline: Watch Room could copy upcoming links and save personal named lists, but could not transfer a versioned public session with played/current/upcoming context, a file-validation preview, or one host-approved undoable file import. Existing named lists, queue permissions and sharing paths remain intact.

Watch Room → Queue → Session handoff file now downloads a version-1 JSON file containing canonical public YouTube/Twitch identities, titles and known runtimes. It includes up to 12 recent played requests observed during the current room visit, the current title, and up to 48 upcoming titles. This is visit context, not a completed-watch ledger. Local paths, local/unmatched file identities, invitations, participants, tracking parameters, private catalog IDs, descriptions, artwork and playback settings are excluded through a strict export whitelist. Live titles do not claim a duration. The file contains no room credential or peer state.

Import validates UTF-8 size (256 KB), format/version, provider identity, HTTPS routes, item counts and titles before showing a preview. Unsupported providers and invalid rows are skipped and counted; corrupt structures reject the file without changing the room. Canonical duplicates, the current stage, existing queue entries and capacity are checked again using the latest room refs when the host applies the file. Local/unmatched queued entries still occupy capacity. Only eligible upcoming entries append, through the existing queue batch path, as one undoable operation. Current/played file entries are context only; importing never stages the old current title, changes play/pause or seeks, or restores automatic-next settings. Re-import does not duplicate queued videos.

Guests can inspect and export files but cannot apply them. The panel explicitly distinguishes local link validation from unverified provider availability/embed permission; no new provider request or availability claim is added. File reads ignore stale completions, repeated selections work, and cancel clears only the preview. The collapsed panel defers its body/export projection, import rows render in bounded groups, played context is bounded in memory, and no new storage ledger, polling or peer packet type is introduced. Existing public queue persistence and host acknowledgements remain in use.

## Verification for revision 35

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,399 passed, 0 failures** — 797 script tests with two workers plus all 602 TypeScript tests from the package command. Existing large-library tests remain included. Final edge assertions for malformed current arrays and full local/unmatched queues also passed in the focused 12-test session/list run.
- Eight new session cases cover strict public export/redaction, canonical YouTube/Twitch routes, live/runtime rules, stage bounds, invalid versions/structures and UTF-8 caps, unsupported entries, canonical duplicate planning, capacity including local/unmatched slots, unavailable identities, immutability and re-import. The four existing named-list unit cases also passed.
- Development and production acceptance passed with isolated desktop host, 390px guest and 390px independent host profiles using actual room signaling and WebRTC. Checks exercised downloaded played/current/upcoming JSON, guest preview/export restrictions, concurrent guest queue changes, exactly one host queue publication per import, Undo, re-import, queue capacity, malformed/oversized files, cancel and reload. Playback title, paused clock and automatic-next preference stayed unchanged. No whole file, rejected entry or extra private field was broadcast. Screenshots inspected; no console errors or horizontal overflow occurred.
- Existing production saved-list browser acceptance passed, including persistence, quota failure preservation, acknowledged guest proposals, retry/deduplication, host approval and Undo.
- Development/production milestone migration, filters, copy fallback, Markdown/CSV exports and reload checks passed with ten verified next-level defaults, preserving unrelated manual choices and custom work. Desktop/mobile Home smoke passed with clean console, no brand/auth warnings and a non-diverging production baseline.

Validation: npm run build; npm run typecheck; node --test scripts/room-session-file.test.mjs scripts/room-playlists.test.mjs; full package test commands with script concurrency two; scripts/watch-room-session-file-check.mjs on development/production; scripts/watch-room-playlists-check.mjs on production; scripts/mission100-browser-check.mjs on development/production; desktop/mobile browser-smoke checks.

Evidence: screenshots/session-file-{dev,built}-ui.json, screenshots/session-file-{plan,built-plan}.json, screenshots/session-file-existing-lists.json and screenshots/session-file-{dev,built}.json, with desktop/mobile PNGs. Isolated browser profiles were used; the real user's library was not seeded or reset. Public player surfaces were controlled fixtures. Real-provider availability/soak, physical devices and cross-network relay remain separate verification requirements and are not marked complete. The development app remains available after stopping the temporary production QA server.

Changed entry points: src/lib/multiplayer/room-session-file.ts, src/components/library/room-session-file-panel.tsx, room-queue-panel.tsx, watch-room-section.tsx, session/room browser and unit tests, and versioned mission defaults/tests/export.

---
# YouTube publication precision milestone — 25 October 2026

Revision 34 completes **next-027 — YouTube publication uncertainty**. The default plan is **211/306 complete**: nine next-level milestones are verified, 91 next-level briefs remain planned, and four older external verification milestones remain open. Revision-33 plans promote only next-027; unrelated manual/custom states and later reopens remain preserved.

Baseline: relative listing labels were discarded; the date repair action accepted weak date strings without a supplied canonical video identity; timestamp versus calendar-day precision was lost; an HTML fallback could accept a recommended watch link as identity evidence; equal/undated catalog rows could reorder when IndexedDB returned a different key order. Existing exact-date provenance and explicit on-demand checks were retained and extended.

Publication evidence now distinguishes exact timestamps, calendar days, saved relative labels and unknown dates. Relative labels are bounded to 120 characters with their provider observation clock and never converted into guessed epochs. Listing live/upcoming fields cannot supply a publication date. Stronger source or precision evidence survives shallow, relative, unknown, scheduled and day-only responses. Legacy trusted sources remain compatible, and user-authored tags/categories/locks, favorites and history remain intact.

Selected-video details explain precision and source and provide an explicit JSON date-evidence export. Calendar dates and timestamps display consistently in UTC; day-only evidence never claims a time within that day. Full and incremental publication ordering use numeric UTC publication values followed by locale-independent video-ID ties, including the relative/unknown tail. A sparse legacy-day override preserves correct UTC day order without projecting the entire normal catalog into a second key map. Provider response order, later clocks, device time zones and cache key order no longer decide equal-value ordering.

Date repairs require the matching selected canonical video, strict calendar/instant validation and an ended/non-upcoming video. Calendar overflow, invalid hours, relative strings, mismatched IDs, blocked player responses and mere recommendation links are rejected. HTML-only fallback requires the matching official HTTPS canonical watch page. No-op or weaker date repairs skip catalog writes; selected date saves re-evaluate after asynchronous disk work. Existing serial, user-triggered one-to-five-video checks and provider budgets remain unchanged. No background polling, bulk rewrite, download or new external connection was added.

## Verification for revision 34

- Final production build, type checks and affected-source whitespace checks passed.
- Complete regression suite: **1,390 passed, 0 failures** — 789 script tests with two workers plus all 601 TypeScript tests from the package test command. Existing large-library cases remain included. Date-order expectations in existing full/incremental/store tests now explicitly assert the new deterministic identity tie contract.
- Eight new precision cases cover bounded relative evidence, live/upcoming exclusions, malformed dates, stronger evidence retention, matching canonical repair, official canonical fallback, blocked/recommended-page rejection, compact/disk/JSON persistence, sparse refreshes, reversed cache-order ties and opposite time zones. Actual RSS/archive tests also verify that relative label evidence reaches the adapter output.
- The new real-store case verifies matching-ID enforcement, durable day-to-instant upgrades, weaker/no-op write avoidance, metadata-tag repair retaining precise dates, preserved manual tag/category locks, favorites/history and upcoming repair refusal.
- Development and final production acceptance passed on isolated desktop America/Los_Angeles and 390px mobile Asia/Tokyo Chrome profiles. Actual UI/store/IndexedDB and controlled matching watch payloads exercised relative/unknown displays, no automatic date request, failure preservation, explicit retry, day-only repair, exact-RSS retention, JSON exports and reloads. No console errors or horizontal overflow occurred; final screenshots inspected.
- Production milestone migration/copy/export/filter/reload checks passed with nine verified next-level defaults and preserved custom/manual work. Development/production Home smoke passed with a non-diverging baseline.
- The 100,000-YouTube/20,000-Twitch CPU fixture passed under the same deterministic tie contract: median cold selection 35.4 ms versus 62.7 ms for the equivalent full-sort baseline; an unrelated Twitch update reused the exact YouTube selection in about 7.0 ms. These are local CPU fixture results, not provider throughput measurements.

Validation: npm run build; npm run typecheck; node --test scripts/youtube-publication-precision.test.mjs scripts/youtube-metadata.test.mjs scripts/local-tools.test.mjs; targeted real-store publication/order tests; full package regression commands with script concurrency two; scripts/youtube-publication-precision-browser-check.mjs on development/production; scripts/mission100-browser-check.mjs on production; desktop/mobile browser-smoke checks; scripts/youtube-refresh-speed-benchmark.mjs.

Evidence: screenshots/publication-{dev,built}-ui.json, screenshots/publication-plan.json, screenshots/publication-{dev,built}.json and screenshots/youtube-refresh-speed-benchmark.json, with desktop/mobile PNGs. Controlled provider payloads and isolated profiles were used; the real user’s library was not seeded or reset. Real-provider soak and physical-device milestones remain open. The development app remains available after stopping the temporary production QA server.

Changed entry points: src/lib/videos/youtube-metadata.ts, youtube-catalog-selection.ts, youtube-shelf.ts, remote-merge.ts, types.ts, store.ts, src/lib/remote/api.ts, youtube-publication.ts, src/components/library/youtube-publication-evidence.tsx, youtube-publication-control.tsx, video-card.tsx, publication/store/order/browser tests, benchmark and versioned mission defaults/tests/export.

---
# Twitch creator pull policy milestone — 25 October 2026

Revision 33 completes **next-033 — Twitch creator pull policies**. The default plan is **210/306 complete**: eight next-level milestones are verified, 92 next-level briefs remain planned, and four older external verification milestones remain open. Revision-32 plans promote only next-033; unrelated manual/custom statuses and later reopens remain preserved.

Baseline: every routine Twitch creator pull requested the same VOD/clip mix, and automatic selection had no per-creator inclusion or priority controls. Twitch → Manage creators → choose a creator now provides independent automatic VOD/clip inclusion, High/Normal/Low priority, and Restore default pull policy. Missing or invalid legacy settings retain both content lanes at Normal priority without eager migration writes. A compact version-1 policy is validated through the existing follow reload and library-pack boundaries.

Only automatic content selection applies these choices. A creator with both content lanes disabled consumes no content request or attempt/failure timestamp; live checks remain independent. Disabling clips retains VOD pulls/history, and disabling VODs uses a profile/live query followed by clips without walking the VOD shelves. Explicit selected-creator, focused archive and clip actions retain their requested behavior. Coverage labels distinguish clip/VOD/all-content exclusions from failed or not-yet-checked creators. Saved videos and personal signals are not deleted by a policy change.

Automatic priority uses bounded weighted lanes: four High, two Normal and one Low slot per seven eligible dispatches when all tiers have work, oldest first within each tier. Empty lanes lend their slots. A 600-creator fixture demonstrates that every enabled creator rotates, including Low priority, under the unchanged batch limits. The scheduler adds no polling, increases no provider page/concurrency budget, and performs no catalog scan for policy edits. Effective no-op edits preserve the follow array and skip writes. User-owned policy survives late provider copies, clip/live/archive merges and resolved re-imports; reload and backup import preserve valid choices.

## Verification for revision 33

- Final production build and type checks passed. Affected tracked-source whitespace checks passed.
- Complete regression suite: **1,380 passed, 0 failures** — 780 script tests with two workers plus all 600 TypeScript tests from the package test command, including the existing large-library regressions. A direct-TypeScript import-resolution failure found in the initial run was fixed with explicit module extensions; the final complete run passed.
- Eight policy cases cover legacy defaults, strict compact normalization, lane-specific skips, bounded weighted fairness across 600 creators, retry exclusion, late-response protection, actual provider request fields, live independence, explicit manual behavior, library-pack import and failure/retry/recovery. The new real-store case verifies effective edits only write once, automatic dispatch omits disabled creators, manual/live requests remain available, late responses retain current policy, and saved history/favorites/catalog rows survive.
- Development and final production browser acceptance passed in isolated desktop and 390px mobile Chrome profiles. The actual UI/store/follow storage and controlled Twitch adapter exercised legacy defaults, clip/VOD controls, priority, explicit skip labels, reload persistence, manual creator refresh despite automatic exclusions, and default recovery. Policy edits triggered no provider reads. No console errors or horizontal overflow occurred; screenshots inspected.
- Production milestone migration/copy/export/filter/reload checks passed with eight verified next-level defaults and preserved custom/manual states. Development/production Home smoke passed with a non-diverging baseline.

Validation commands: npm run build; npm run typecheck; node --test scripts/twitch-pull-policy.test.mjs; node --test --test-name-pattern=Twitch.automatic.policies scripts/pull-entry-limits.test.mjs; the full package test commands with script test concurrency limited to two; scripts/twitch-pull-policy-browser-check.mjs on development and production; scripts/mission100-browser-check.mjs on production; scripts/browser-smoke.mjs on both outputs.

Evidence: screenshots/twitch-policy-{dev,built}-ui.json, screenshots/twitch-policy-plan.json and screenshots/twitch-policy-{dev,built}.json, with desktop/mobile PNGs. Browser profiles and provider payloads were isolated; the real user’s library was not seeded or reset. Real-provider scale/soak and physical-device verification remain open. No new external integration is claimed connected.

Changed entry points: src/lib/videos/twitch-pull-policy.ts, twitch-refresh-selection.ts, types.ts, follow-checkpoints.ts, follow-identity.ts, twitch-clip-freshness.ts, store.ts, src/lib/remote/api.ts, src/components/library/twitch-pull-policy.tsx, follow-manager.tsx, the policy/store/browser tests and versioned mission defaults/tests/export.

---
# Twitch content type milestone — 25 October 2026

Revision 32 completes **next-039 — Twitch content type precision**. The default plan is **209/306 complete**: seven next-level milestones are verified, 93 next-level briefs remain planned, and four older external verification milestones remain open. Revision-31 plans promote only next-039; unrelated manual/custom states and later reopens remain preserved.

Twitch archive pages now retain the queried ARCHIVE, HIGHLIGHT or UPLOAD shelf alongside the canonical video ID and original observation time. Clip reads retain CLIPS evidence. Classification validates that compact evidence against the saved identity; short broadcasts and long clips are no longer guessed from duration or titles. Explicit legacy clip markers remain supported, including older clips with VOD-style IDs. Uncertain legacy videos display Unknown video subtype, and offline channel placeholders remain channel bookmarks.

Matching subtype evidence survives sparse responses and durable catalog reloads. Older observations cannot replace newer matching evidence; a new exact subtype observation can update an unknown item without losing favorites, history, likes or manual tags. Admission and comparison use the existing catalog paths, with no bulk reclassification, extra provider requests or storage migration.

The Full Twitch catalog adds past broadcast, highlight, upload, clip, live and unknown filters composed with existing saved/topic selection. Archive search supports the same exact types. Cards and previews show the type; previews explain the source shelf and observation time. An explicit cooperative CSV report exports the selected rows with canonical identity, type, source, observation time and watch link, with spreadsheet formula escaping. Opening/filtering adds no polling or storage writes; provider page and concurrency limits are unchanged.

## Verification for revision 32

- Final production build and type checks passed.
- Complete regression suite: **1,370 passed, 0 failures** — 771 script tests with two workers plus all 599 TypeScript tests from the package test command. The existing large-library regressions remain included. Three legacy clip compatibility failures found during verification were corrected in runtime identity handling, without weakening their existing tests.
- Seven new adapter/merge/report cases cover the three archive shelves, explicit clip evidence, short broadcasts, long clips, malformed and mismatched evidence, immutable provider edges, bounded page walks, sparse/newer observation rules, filter composition, archive search, ranking and CSV output. A real-store case verifies proof upgrades and persistence while preserving personal signals.
- Development and final production browser acceptance passed on isolated desktop and 390px mobile Chrome profiles. Actual creator action, provider adapter, UI, store and IndexedDB exercised shelf classification, all type filters, favorites intersection, preview evidence, selected-row CSV download, archive search and reload persistence. No extra provider reads during inspection, console errors or horizontal overflow occurred; screenshots inspected.
- Production milestone migration/copy/export/filter/reload checks passed with seven verified defaults and preserved custom/manual states. Desktop/mobile Home smoke passed with a non-diverging production baseline.

Evidence: screenshots/twitch-types-{dev,built}-ui.json, screenshots/twitch-types-plan.json and screenshots/twitch-types-{dev,built}.json. Controlled public Twitch payloads and isolated browser storage were used; the real user’s library was not seeded or reset. Real-provider scale/soak and physical-device playback remain open, and no external integration is newly claimed connected.

Changed entry points: src/lib/videos/twitch-content.ts, types.ts, twitch-clips.ts, remote-merge.ts, twitch-saved-catalog.ts, twitch-archive-search.ts, src/lib/remote/twitch-archive-walk.ts, api.ts, src/components/library/twitch-content-controls.tsx, use-twitch-saved-catalog.ts, twitch-archive-search.tsx, library-app.tsx, video-card.tsx, pre-video.tsx, and the versioned mission defaults/tests/export.

---
# Twitch clip freshness milestone — 24 October 2026

Revision 31 completes **next-032 — Clip observation freshness audit**. The default plan is **208/306 complete**: six next-level milestones are verified, 94 next-level briefs remain planned, and four older external verification milestones remain open. Revision-30 plans promote only next-032; unrelated manual/custom states and later reopens remain preserved.

**Twitch → Inspect clip coverage** now shows separate recent/older last-attempt and last-successful-check clocks. Attempts record the local action start. Successful clocks and clip metadata retain the original bounded provider read time, including warm deliveries; partial errors do not claim a successful full check. Legacy missing clocks remain explicitly unrecorded. Existing reload/backup checkpoint fields preserve both clocks without a second telemetry ledger.

The new **Check fresh recent clips** action skips only the exact creator/mode/count/cursor cache entry through the existing clip workflow. Other creator, count, older, VOD and live cache entries remain warm. It respects the existing retry wait and page limits. A fresh read waits for an older request on that key, concurrent fresh callers share work, ordinary callers join the pending fresh read, and the final cache contains the fresh result. Zero-clip requests cannot be counted as clip checks. No background polling or automatic cache invalidation was added.

All catalog admission paths now keep a fresher Twitch clip when a cached or held older observation arrives, preserving title, views, publication date, duration, poster and card identity. Unknown legacy observations cannot replace known newer evidence; a genuinely newer provider count can still change naturally. Follow commits preserve newer clip failures, independent retry deadlines, successful clocks and safe older positions. Unrelated copied live/archive responses retain current clip health while keeping their own response counts. Identical/stale-only focused clip responses skip the remote catalog write.

## Verification for revision 31

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,361 passed, 0 failures** — 763 script tests with two workers plus all 598 TypeScript tests from the package test command. This includes the existing 80k/215k-library cases.
- Seven new audit cases cover warm attempt/success clocks, cached/held result health, separate retry scopes, copied follow state, all five catalog admission paths, actual API cache-key isolation, input validation, pending-read ordering, fresh caller coalescing and final warm-cache contents.
- Two actual-store cases verify cached retries leave successful clocks unchanged, unchanged clip arrays avoid catalog writes, a fresh action cannot bypass a retry, accepted fresh metrics reach disk, and a held older result preserves newer metrics/health plus saved personal signals.
- Development and production desktop/mobile browser acceptance passed in isolated Chrome profiles. Actual UI, clip API, store and durable follows were exercised with controlled public Twitch payloads: inspection performs no provider read/follow write; fresh actions contact the selected creator; ordinary retries reuse the cache; separate clocks, retry waits and evidence survive reload. No console errors or horizontal overflow occurred; screenshots inspected.
- Production 25-creator batch/Stop regression passed on both viewports, preserving partial results, rotation and older cursor continuation. Production milestone migration/copy/export/filter/reload checks passed with six verified next-level defaults and preserved custom/manual work. Home smoke checks passed with a non-diverging production baseline.

Evidence: screenshots/clip-freshness-{dev,built}-ui.json, screenshots/clip-freshness-batch-regression.json, screenshots/clip-freshness-plan.json and screenshots/clip-freshness-{dev,built}.json. Browser profiles and provider payloads were isolated; the real user’s library was not seeded or reset. No real-provider scale/soak or physical-device playback is claimed complete. The local development app remains running after the temporary production QA server was stopped.

Changed entry points: src/lib/videos/twitch-clip-freshness.ts, remote-merge.ts, store.ts, src/lib/remote/api.ts, provider-metadata-cache.ts, src/components/library/twitch-clips-control.tsx, twitch-clip-coverage-panel.tsx, and the versioned mission defaults/tests/export.

---

# Twitch clip coverage milestone — 24 October 2026

Revision 30 completes **next-031 — Clip coverage evidence panel**. The default plan is **207/306 complete**: five next-level milestones are verified, 95 next-level briefs remain planned, and four older external verification milestones remain open. Revision-29 plans promote only next-031; earlier/later manual reopens, unrelated statuses and custom entries are preserved.

In **Twitch → Keep clips fresh → Inspect clip coverage**, each saved creator snapshot shows the requested unique target, accepted clips, raw listings, overlapping duplicates and page attempts. Up to four public shelves show their allocation, results, failure and stop reason. Sparse/exhausted shelves, a filled quota, page-budget stops, partial errors and provider waits are distinct. A one-page allowance with unvisited shelves cannot falsely claim exhaustion. Older snapshots retain unknown targets/reasons instead of guessing. Public highlight rankings are not presented as an exhaustive Twitch archive.

Fresh provider results and warm deliveries are labeled separately. A cache hit preserves the original provider observation and successful clip clock; its response delivery time is separate. Normalization whitelists the compact snapshot, bounds errors to 240 characters, accepts legacy data and rejects malformed/oversized shelf collections. Reload and backup paths retain the new optional evidence.

Focused recent/older actions check only the displayed creator through the existing workflow and count selector. They respect independent retry deadlines, retain safe older continuations, disable completed older shelves, and request no VOD/live metadata. Snapshot content mounts only when expanded. Inspection uses existing follows without catalog scans, storage writes, or provider requests. One deadline timeout updates retry availability while the panel is mounted; no interval polling or growing history is added. Existing provider page/concurrency budgets are unchanged.

## Verification for revision 30

- Production build and type checks passed. Whitespace checks passed on affected tracked sources.
- Complete regression suite: **1,351 passed, 0 failures** — 754 script tests with two workers plus all 597 TypeScript tests from the package test command. New cases cover sparse/duplicate-heavy shelves, quotas versus budgets, partial errors versus holds, unvisited shelves, legacy/bounded normalization, scoped retries, and the actual API warm cache clock contract.
- Development and production acceptance passed on isolated Chrome desktop and 390px mobile profiles. Actual UI, clip adapter, store and durable follow storage exercised zero-read/zero-write inspection, accurate reasons, selected-creator recovery, cursor continuation, independent retries, cache labeling, original observation clocks and reload persistence. No horizontal overflow or console errors occurred; screenshots inspected.
- Existing 25-creator batch/Stop browser regression passed on both viewports: stopping saves the active creator, later batches rotate fairly, partial failures retain clips and older discovery keeps its own position.
- Production milestone browser checks passed for five verified defaults, revision migration, preserved custom/manual states, filters, copy fallback, Markdown/CSV export and reloads. Desktop/mobile Home smoke passed with a non-diverging production baseline.

Evidence: screenshots/clip-coverage-{dev,built}-ui.json, screenshots/clip-coverage-batch-regression.json, screenshots/clip-coverage-plan.json and screenshots/clip-coverage-{dev,built}.json. UI screenshots include production snapshot tops and mobile action controls. Browser tests used isolated storage and controlled public provider responses; they did not seed or reset the real user’s library. Real-provider scale/soak, physical-device playback and unrelated external integrations are not claimed complete.

Changed entry points: src/lib/remote/twitch-clips.ts, src/lib/remote/api.ts, src/lib/videos/types.ts, twitch-clip-coverage.ts, follow-checkpoints.ts, src/components/library/twitch-clips-control.tsx, twitch-clip-coverage-panel.tsx and the versioned mission defaults/tests/export.

---

# YouTube live coverage milestone — 24 October 2026

Revision 29 completes **next-023 — YouTube live coverage progress model**. Default progress is **206/306 complete**. The remaining 96 next-level briefs and four older external verification milestones remain open. Only next-023 is newly promoted for revision-28 plans; earlier or later manual reopens and custom entries are preserved.

Coverage now groups canonical creators once, separates latest failed attempts from recent successful freshness, and derives ready/retry/never-verified states from existing observation and attempt clocks. Historical success remains visible on failed rows without inflating current success coverage. Legacy timestamp-less retry waits remain conservative; a superseded individual failure cannot hold a newer successful observation. Duplicate queue actions retain the same first identity as the store deduper.

The expandable creator queue provides search, ready/waiting/not-due/never-verified filters, last success/attempt and next eligibility, pagination at 20 rows, and single-creator checks. Opening, searching and paging do not start provider requests. Waiting creators cannot bypass retry deadlines. The queue uses existing follow data; it adds no background scan, polling or storage writes. Progress-only changes no longer recalculate coverage when the follow ledger is unchanged.

A sweep keeps at most 33 aggregate throughput samples over a rolling recent window, with each requested creator counted once. Estimates require at least eight successful creator results, two successful result batches, one second of observations and a sufficient success ratio. The ready-queue range excludes retry waits. It disappears when two result updates make no successful progress, the last success is over 30 seconds old, the sweep stops, or a provider cooldown begins. Telemetry is volatile and never copied into follows, preferences or a second catalog. Provider concurrency and request pacing are unchanged.

## Verification for revision 29

- Final production build and type checks passed.
- Complete regression suite: **1,343 passed, 0 failures** (747 script tests with two workers plus all 596 TypeScript tests from the package test command). The focused coverage/migration tests were also rerun after final identity alignment.
- A mixed 2,000-creator fixture, including duplicate aliases and excluded sources, verified exact distinct freshness, due, unavailable, retry and never-verified counts. Bounded throughput fixtures cover warming, active range, stalls, stopped sweeps, low success ratios and provider waits. The real store test confirms only accepted observations count, the catalog retains its identity, no catalog write occurs for empty live checks, and telemetry is absent from saved follows.
- Development and final production acceptance passed in isolated Chrome desktop and 390px mobile profiles. The real API/store/persistence paths exercised queue paging/search/filtering without requests, one-creator checks, disabled retry controls, reload persistence, held-response throughput, stalled estimate removal using the existing visible-page timer, and a real adapter 429 response replacing the estimate with a wait. Console errors and horizontal overflow were absent; screenshots inspected.
- Production milestone browser checks passed for revision migration, four verified next-level defaults, preserved unrelated/custom/manual states, filtering, copying, Markdown/CSV export and reloads. Development/production Home smoke checks passed with a non-diverging baseline.

Evidence: `screenshots/live-coverage-{dev,built}-ui.json`, `screenshots/live-coverage-{dev,built}.json`, and `screenshots/live-coverage-plan.json`. Browser cases use controlled provider responses and isolated storage, with an adjusted clock for stall detection. They do not measure real-provider throughput, a long provider soak, or physical-device playback. The actual user's saved library was not seeded or reset.

Changed entry points: `src/lib/videos/youtube-live-health.ts`, `youtube-live-throughput.ts`, `youtube-quick-live.ts`, `live-refresh-selection.ts`, `store.ts`, `src/lib/remote/api.ts`, `src/components/library/live-check-status.tsx`, `youtube-live-coverage-panel.tsx`, and the versioned mission defaults/tests/export.

---

# YouTube negative-evidence milestone — 24 October 2026

Revision 28 completes **next-024 — YouTube ambiguous negative live evidence**. Default progress is now **205/306 complete**. The remaining 97 next-level briefs and four older external verification milestones stay open. Only this new completion is promoted for revision-27 plans; previous and later manual reopens, custom entries, and unrelated statuses are preserved.

The live adapter now records the observation source, time, state, and completeness. Readable Home shelves and Streams pages with unread continuations cannot establish an ending. HTML recovery applies the same rules. Positive observations remain usable, while missing broadcasts stay provisional. Consent, malformed, wrong-owner, login and transport failures preserve the prior success clock and cannot start the offline hold.

An incomplete listing may check at most two missing known broadcasts directly, in the existing live transport lane. Only playable metadata for the exact video and creator with an explicit not-live/end signal supplies negative evidence. Older saved cards join the bounded identity ledger; an exact proof cannot end another saved broadcast it omitted. Source aliases are covered, and a 64-ID overflow disables supplemental negative checks. A complete Streams listing can still establish absence. No archive pagination or extra polling was added.

The existing ten-minute hold begins only with complete relevant evidence. Unknown checks cannot expire it; fresh positive observations clear it immediately. The interface explains provisional status, evidence source/time and retry deadlines, with a focused single-creator recheck. Metadata survives reload through the existing persistence path.

## Verification for revision 28

- Final build and type checks passed.
- Final full regression suite: **1,336 passed, 0 failures** (741 script tests with two workers + all 595 TypeScript tests from the package test command). The existing catalog-cancellation assertion was sensitive to concurrent build/browser load; its isolated rerun and this complete reduced-concurrency run passed.
- Focused tests cover Home/Streams/HTML boundaries, consent/malformed replies, exact known-broadcast checks, request ceilings, identity mismatches, offline hold/recovery, durable normalization, overflow, and the real store's legacy/source-alias recovery path.
- Development and final production desktop/mobile acceptance passed with controlled public-response fixtures and an accelerated clock: provisional explanations, disabled retry before deadline, focused rechecks, reload persistence, complete absence through the hold, intervening unknown replies and immediate positive recovery. Console errors and horizontal overflow were absent; screenshots inspected.
- Production milestone migration/export browser checks passed: three verified next-level completions, unrelated/custom/manual status preservation, filtering, copy fallback, Markdown/CSV and reloads. Home smoke checks passed on desktop and mobile with a non-diverging production baseline.
- A read-only public canary returned **23 live YouTube broadcasts** with a partial Streams catalog labeled incomplete; no complete negative check was claimed. This is one snapshot, not a long provider soak or physical-device test.

Evidence: `screenshots/negative-evidence-{dev,built}-ui.json`, `screenshots/negative-evidence-{dev,built}.json`, `screenshots/negative-evidence-plan.json`, and `screenshots/negative-evidence-public.json`. Boundary notes and commands: `fixtures/provider-contracts/README.md`. Browser QA used isolated profiles and did not seed or reset the real user's saved library.

---

# Provider milestone completion — 24 October 2026

Revision 27 completes **next-022 — YouTube response contract fixtures** and **next-038 — Twitch live batch fault isolation**. The verified default plan is now **204/306 complete**. The remaining 98 next-level briefs stay planned; the four older external verification milestones remain open. Existing custom entries, older manual states, and later manual reopens are preserved.

| Completed milestone | Delivered behavior |
| --- | --- |
| next-022 | Explicit feed/catalog/live response boundaries distinguish genuine empty results from malformed or changed responses. RSS owner/identity checks, supported classic and modern renderers, continuation validation, and 23 redacted synthetic fixtures protect saved observations and archive positions. Invalid service/sign-in messages cannot establish an empty catalog. Valid empty recent RSS avoids unnecessary HTML/Shorts fallback requests. |
| next-038 | Twitch validates each creator independently, preserving healthy aliases when another fails. Optional title/game/artwork errors remain visible warnings while stream state and viewers stay usable. Identity/stream/viewer failures retain the previous successful clock and saved state. Two concurrent requests return up to 12 creators each and publish in completion order, so a slow first chunk cannot delay healthy later results. Full follow-list rotation and bounded storage checkpoints remain. |

## Verification for revision 27

- Final build and TypeScript checks passed.
- Full regression result: **1,326 passed, 0 failures** (732 script tests + 594 TypeScript tests). The focused provider contract suite also passed all eight checks, including the actual 100-target API with six malformed creators and 94 healthy results.
- The held-first-response regression publishes later Twitch viewer counts before the first chunk resolves. A 2,000-follow / 80,000-record test retains the existing catalog identity and bounds live requests to 12 creators.
- Development and final production browser checks passed on desktop and 390px mobile: actual adapter/store failure isolation, optional warnings, valid empty feed behavior, prior live state preservation, and reload persistence. Consoles were clean and pages had no horizontal overflow. Home smoke screenshots were inspected on both builds; production matched the development baseline.
- Production mission-plan browser checks verified revision migration from saved planned entries, exactly two newly completed defaults, preserved custom/manual statuses, filters, copy fallback, full Markdown/CSV export, and reload persistence. These used isolated profiles; the real user's library and browser-local states were not seeded or rewritten by QA.
- Read-only public metadata probes succeeded: 15 YouTube recent uploads, 23 YouTube live observations with viewer metadata, and two valid Twitch offline observations. These are snapshots, not a large-follow/provider soak or native playback certification.

Evidence: `screenshots/provider-milestones-{dev,built}-ui.json`, `screenshots/provider-milestones-{dev,built}.json`, `screenshots/provider-milestones-plan.json`, and `screenshots/provider-milestones-public.json`. Contract fixtures and runner guidance are in `fixtures/provider-contracts/README.md`.

---

# Milestone completion — 22 October 2026

The default plan now has **202 of 206 milestones complete** (previously 198).
Revision 25 promotes only the four verified entries below. Custom ideas,
older manual reopens and later status choices are preserved. The real app’s
Mission plan page was opened, reloaded and checked: 202/206 remained saved.

| Completed milestone | Delivered behavior |
| --- | --- |
| youtube-upgrade-06 — Creator ambiguity review | Review contradictory exact links and aliases/names shared by distinct channel IDs. Explicit keep-separate choice persists, reopens after changed identity evidence, and retains saved media. Legacy exact IDs in source keys remain distinct. Ambiguous pending aliases survive automatic resolution. |
| youtube-upgrade-17 — Offline cache audit | On-demand channel/card coverage, actual local artwork bytes, poster-reference count, oldest saved observations/artwork, catalog save time and recovery links. Small cancellable reads; no provider requests or success-state writes. Browser HTTP/Companion caches are explicitly unmeasured. |
| youtube-upgrade-18 — Mobile rail gesture | Native horizontal touch swipes, visible keyboard focus and explicit 44px Save/Like/Together controls for public touch cards; invisible hover controls no longer intercept touch swipes. |
| twitch-upgrade-19 — Twitch device regression | Chrome and Edge desktop/touch-phone matrix for live-card Watch Room handoff, VOD seeking, blocked playback, reload, clip restrictions and official parent/URL parameters. Provider fixtures are distinguished from native playback. |

## Verification

- npm run build and npm run typecheck passed.
- npm test: **1,269 passed**, 0 failures (676 script tests + 593 TypeScript tests).
- Development and production desktop/mobile render checks passed with clean
  consoles and no horizontal page overflow. Screenshots inspected.
- Development and production milestone acceptance checks passed in Chrome
  and Edge, desktop and native touch-phone viewports: audit storage failure
  and retry, no provider reads from the audit, identity choice across reload,
  filtering, swipes, 44px actions, visible focus, migration and CSV contents.
- Development and production Twitch matrices passed in all four configurations.
- Host-library browser check passed with two real WebRTC clients and an empty
  guest library: host search/page, permission revocation, queue priority/removal,
  catalog title playback, reconnect and no host path/follow disclosure.
- Production Edge host/phone check passed all seven synchronization scenarios:
  delayed readiness, device-local autoplay unlock, 90s clock skew, drift recovery,
  buffering, shared pause/resume, live reload/independent clocks, VOD return and
  Twitch startup. Provider players are deterministic fixtures.
- An earlier development Edge run was interrupted by the 19:41:28 source hot
  reload; its host returned Home. The stable production rerun passed. It is not
  used as a successful test result.

Evidence:

- screenshots/milestones-confirmed-app.png
- screenshots/milestone-completion-dev.json
- screenshots/milestone-completion-built.json
- screenshots/twitch-device-matrix-dev.json
- screenshots/twitch-device-matrix-built.json
- screenshots/milestones-host-catalog.json
- screenshots/milestones-watch-phone-edge-built.json
- screenshots/milestones-smoke-dev.json
- screenshots/milestones-smoke-built.json
- .grok/milestones-tests.log, milestones-typecheck.log, milestones-build.log

Repeatable browser gates:

    node scripts/milestone-completion-browser-check.mjs <app-url> screenshots/milestone-check.json
    node scripts/twitch-device-matrix-check.mjs <app-url> screenshots/twitch-matrix.json
    node scripts/watch-room-phone-check.mjs <app-url> screenshots/phone-check.json msedge
    node scripts/watch-room-host-catalog-check.mjs <app-url> screenshots/host-catalog.json

## Still open — requirements retained

| Milestone | Evidence still needed |
| --- | --- |
| watch — Watch room reliability | Physical-device drift and recovery under actual phone media/network policy. Host-library guest playback is now verified in the isolated browser matrix. |
| sprint-19 — Watch room device matrix | Real home-network iOS/Android devices. Chrome and Edge isolated desktop/phone browser checks pass; viewport/touch automation cannot establish physical-device behavior. |
| watch-room-cross-device — Watch Room cross-device relay | A configured real TURN service plus two devices on separate networks, with relay-only selected-candidate proof. |
| recent-provider-soak — Real-provider archive soak | Sustained large real YouTube/Twitch follow lists, fair rotations/retries, catalog growth, memory and live latency under existing automatic budgets. Synthetic throughput tests and short public reads do not establish this. |

No automatic pull budgets were increased. Existing saved libraries and media
feedback were preserved. QA uses isolated browser profiles. The app stays up;
the separate production QA server is stopped after verification, and the
pre-existing tracked build-output tree is restored byte-for-byte.


## YouTube and Twitch recent-pull upgrade — 24 October 2026

Delivered:
- Durable per-creator recent-upload attempts, successful observations, retries and
  feed watermarks. Recent rotation no longer depends on archive/live timestamps.
- Recent checks preserve deep archive cursors, diagnostics and failures. Late
  live responses preserve newer recent health and archive positions.
- Two bounded client requests, at most two creators each, publish completed
  batches without waiting for a stalled first batch. Independent RSS body slots
  keep recent feeds moving beside archive transfers; shared request pacing,
  global cooldown revisions, body limits and cancellation remain enforced.
- Empty recent results preserve existing video/tag/provenance references and
  write only follow checkpoints. Transient failures receive a short bounded
  creator retry; unavailable sources and advertised provider deadlines wait longer.
- Both provider desks expose recent checks, saved older-video continuation,
  individual creator selection, health counts and failures. Mobile creator
  selection uses the full panel width. Existing clip and older-VOD tools remain.

Verification:
- npm run build and npm run typecheck passed on final source.
- Full npm test: 1,294 passed, 0 failures (701 script + 593 TypeScript).
- Final recent/store checks: six passed, including two subsequently added cases
  for a late live response and an unfollow during a pending recent response.
- Controlled 2,000-creator rotation survives JSON reloads; a held first batch
  does not prevent later batches publishing; request concurrency stays at two.
  An empty recent check preserves an 80,000-entry catalog and metadata identities
  without catalog disk writes. Held archive-body test proves RSS can finish
  independently while at most two feed bodies overlap.
- Real public read-only probes: YouTube returned 15 uploads. Twitch initially
  returned a service error; a later ordinary retry returned 17 videos/clips.
  Both retained archive checkpoints. No user's saved follows were modified.
- Isolated Chrome desktop/mobile development and final production checks passed:
  both provider tabs, two rounds covering all 16 fixture creators, selected
  archive continuation, saved state after reload, clean consoles and no overflow.
  Smoke checks render both viewports with no production baseline divergence.
- Existing production Twitch/movie browser regression also passed.

Evidence:
- screenshots/provider-pulls-dev-ui.json
- screenshots/provider-pulls-built-ui.json
- screenshots/provider-pulls-dev.json
- screenshots/provider-pulls-built.json
- screenshots/provider-pulls-twitch-regression.json
- screenshots/provider-pulls-public-probe.json
- .grok/provider-pulls-tests.log
- .grok/provider-pulls-store-recent.log
- .grok/provider-pulls-build.log
- .grok/provider-pulls-typecheck.log

Limits: controlled concurrency/rotation tests do not establish real-world speed
for thousands of creators. Provider availability, public API changes, rate limits
and archive-depth soak testing remain external constraints. No unfinished
physical-device or multi-provider soak milestone was marked complete.


## Twitch clip pulling upgrade — 24 October 2026

Delivered:
- Clip discovery uses a bounded, testable window walker. It skips repeated
  identities, advances duplicate-heavy pages, detects cursor cycles, and refills
  unused weekly/monthly quotas from healthy earlier continuations.
- At most eight clip-page requests per creator across all windows; API page
  sizes remain at most 100. Provider rate/integrity holds stop further windows.
  Other window failures retain accepted clips and allow healthy windows to run.
- All-time discovery saves the last complete continuation after a partial
  failure. Incomplete pages retain valid clips without advancing past the
  malformed page or declaring false exhaustion.
- Clip metadata includes game/category and validated view counts, while unknown
  creation dates remain unknown. Recent clip cache freshness is 45 seconds;
  archive cache behavior remains separate.
- Recent and older clip retries/attempt clocks are independent and persist
  through reload/backup normalization. Attempts rotate fairly even after errors.
- Explicit creator batches: 8, 25, 50 or 100, one creator at a time, with 25–500
  requested clips per creator, progress, Stop after this creator, and per-creator
  page/duplicate/failure results. Switching away or global cancellation stops
  later creators. Each completed creator is saved before continuing.
- Empty clip checks update only follow state, preserving video/tag/provenance
  references without catalog writes. Existing VOD/live observations and saved
  older clip positions remain intact during recent updates.

Verification:
- Final build and typecheck passed. The initial restricted build encountered a
  Windows native-dependency directory permission error; the permitted build passed.
- Full npm test: 1,309 passed, zero failures (716 script + 593 TypeScript tests).
- Final focused clip suite: 24 passed, including the subsequently added unused
  quota backfill case. Store checks cover 80,000-entry empty clip updates,
  partial-result persistence and independent retry lanes.
- Deterministic 100-creator batches cover all 600 creators through JSON reloads.
- Isolated desktop/mobile Chrome acceptance passed on development and production:
  stop after a held first creator, 25-creator rotation, partial failures with
  continued healthy creators, requested clip budget, duplicate/page results,
  older cursor old → next → last, independent retry, reload persistence,
  preserved live/VOD state, clean console and no horizontal overflow.
- Desktop/mobile development and production smoke checks passed with no baseline
  divergence. Both sets of screenshots were visually inspected.
- Read-only public provider probe: notyoda returned 12 clips (11 with a game);
  Twitch returned 25 (21 with a game), skipping five repeated listings.
  Both completed without errors and made no VOD/live requests or private
  library changes.

Evidence:
- screenshots/clip-upgrade-dev-ui.json
- screenshots/clip-upgrade-built-ui.json
- screenshots/clip-upgrade-dev.json
- screenshots/clip-upgrade-built.json
- screenshots/clip-upgrade-public-probe.json
- .grok/clip-upgrade-tests.log
- .grok/clip-upgrade-focused.log
- .grok/clip-upgrade-store.log
- .grok/clip-upgrade-build.log
- .grok/clip-upgrade-typecheck.log

Limitations: public Twitch clip windows rank highlights rather than guaranteeing
an exhaustive chronological feed. Requested counts are ceilings; unavailable
clips, provider errors, sparse shelves and rate limits can reduce the result.
A 600-creator real-network soak remains unverified. No such milestone was
marked complete from deterministic fixtures.


## 100 model-executable milestones — 24 October 2026

The default mission baseline now contains **306 milestones: 202 complete and
104 still active**, comprising the prior four open items plus 100 new planned
items. Existing manual reopens, completion decisions and custom ideas are kept;
actual user totals can differ from this default baseline. Revision 26 adds the
briefs without promoting any new work to complete.

The 100 additions cover ten workstreams with ten items each: data durability,
performance at scale, YouTube reliability, Twitch depth/coverage, Watch Together
collaboration, recommendations/topics, film/anime/private media, desktop/local
workflows, AI studio/creator tools, and trust/accessibility/release quality.
Each has a stable ID, outcome, priority, verified code entry points, three
implementation steps, two acceptance checks and explicit prerequisites where
needed. External device/service/native checks are labeled. The shared execution
contract requires validating the gap first and reusing work already delivered,
preserving user data and privacy, bounded work, relevant validation and an
evidence-based handoff before completion.

Mission plan adds search, workstream/priority/status filters and 20-card paging.
Each item has a copyable model brief; clipboard denial leaves selectable text.
The Markdown download includes all 100 full briefs with current saved statuses
and dependency context. CSV adds IDs, entry points, dependencies, implementation,
acceptance and external requirements. NEXT_LEVEL_MILESTONES.md is generated
reproducibly from src/lib/mission-next-level.ts by
scripts/export-next-level-milestones.mjs.

Verification:
- npm run build and npm run typecheck passed.
- 38 relevant automated checks passed: 13 plan/creator/audit script cases and
  25 prior mission migration cases. New checks prove exact count, ten tracks,
  unique IDs/titles, valid code references, acyclic prerequisites, substantive
  briefs, status/custom-idea preservation, idempotent revision-26 migration,
  current contract refresh, clipboard/export content and document reproducibility.
- Isolated desktop/mobile development and production Chrome acceptance passed:
  307-row migration fixture with custom/manual decisions, exactly 100 new planned
  rows, 20 mounted active cards, paging, workstream/priority/search filters,
  implementation expansion, copy success/denial, full Markdown/CSV downloads,
  start/block/resume and reload without duplicate additions.
- Existing production milestone/creator/offline-audit regression passed in Chrome
  and Edge on desktop and touch-phone layouts, retaining prior manual choices.
- Development and production desktop/mobile smoke checks hydrated with clean
  consoles, no horizontal overflow and no production baseline divergence.
  Screenshots were visually inspected.
- No real user library/status fixture was overwritten and no future milestone
  implementation is claimed complete.

Evidence:
- screenshots/mission100-dev-ui.json
- screenshots/mission100-built-ui.json
- screenshots/mission100-existing-regression.json
- screenshots/mission100-dev.json
- screenshots/mission100-built.json
- .grok/mission100-tests.log
- .grok/mission100-migration.log
- .grok/mission100-build.log
- .grok/mission100-typecheck.log
