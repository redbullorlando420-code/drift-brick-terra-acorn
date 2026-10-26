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
