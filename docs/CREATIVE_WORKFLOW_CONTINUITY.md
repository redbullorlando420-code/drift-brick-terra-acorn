# Creative workflow continuity

Milestones: **next-171**, **next-176**, **next-180**. Mission-plan revision **101**.

## Image recipe parameter migration

An updated, connected Companion advertises a versioned form parameter contract in image-engine status. The generation payload and Qwen graph use the same contract values. This describes the Companion adapter's supported form, not arbitrary upstream workflow nodes or extensions. Older companions remain usable through the existing recipe path; conversion clearly shows when the required contract is unavailable.

Open a saved/imported recipe, review its parameter conversion and differences, acknowledge them, and save a separate converted revision. Loading that revision into the form is another explicit action. Neither action submits generation or installs a model. The original remains in the eight-slot shelf; full shelves reject additions without eviction. Prompts and seed remain unchanged, while square size and steps are constrained to advertised support. Sampler, scheduler, guidance, denoise, engine and selected model changes are listed. Changed model/engine identities discard inherited hash and source declarations. Existing model header preflight still applies before generation.

Converted exports use recipe document version 3 with the adapter schema and bounded conversion history. Existing versions 1 and 2 remain readable. Strict shelf mutation reads reject damaged, partial or future documents rather than dropping unsupported rows on the next save. Storage quota errors publish no new revision and show an error in the review dialog. Shelf data remains profile-local; imports/exports retain existing size limits.

## Print workspace comparison

The existing print editor can capture a baseline, list numeric differences, preview that baseline, revert working edits, and undo the preceding comparison change after reload. Transform/material changes are distinguished from viewer settings. A visual preview does not save or export geometry, and editing a control returns to the retained working model.

Working transforms, baseline and one inverse occupy the existing profile-local per-model workspace row. Comparison changes validate the reviewed row and persist all three together before updating the viewer. Autosaves check the last accepted row token, skip identical writes, and report conflicts or quota failure. A newer edit from another tab therefore blocks an ordinary stale autosave. This is a local conflict check, not a distributed transaction guarantee. The workspace map stays bounded to 80 models and 512,000 characters; additions at capacity fail without discarding older workspaces. Unknown comparison versions are preserved and cannot be overwritten through comparison actions.

Native saved-copy actions, source model files and existing save receipts remain separate. Source-file signatures do not change during comparison, revert or undo. The opening workspace is the initial baseline until the owner explicitly captures one.

## Conditional Chat Plays plans

Chat Plays Lab includes a collapsed conditional JSON editor with explicit observation, transition preview, saved plans and reviewed ballot submission. A plan has one to four moves. Preconditions can test health, energy, opponent state and guard state. Resource thresholds are 0–100, observation freshness is 100–30,000 ms, and sequence timeout is 1,000–120,000 ms from queue admission. Unknown fields, unsupported versions and oversized documents are rejected.

Votes still use one latest valid ballot per viewer/window, message deduplication, deterministic whole-sequence tie-breaking and the twelve-move queue cap. A conditional plan votes as a whole, including its rules. Before each move the controller checks elapsed timeout, observation freshness, conditions and existing resource constraints. False/stale conditions follow the chosen skip-move or stop-sequence policy; timeout always cancels that sequence. Successful simulated moves record their simulated result as a fresh observation. Other sequences remain queued. Emergency stop clears votes, conditional ballots and pending moves, and records cancellation details.

Preview clones simulator state and never executes real moves. Resource/window changes invalidate ballot review; runtime checks still apply when time passes. Plan preferences use the existing reviewed profile/owner storage document with explicit writes, reload, quota errors and conflict checks. Simulator sessions reset as before. New observation and conditional-ballot events export as battle-v2; legacy battle-v1 replays remain supported with their original checkpoints. Existing replay event, time and file bounds remain in force.

No Twitch chat, YouTube chat, installed game or racing controller is connected by this feature.

## Verification scope

The keyboard regression also found and fixed a local import timing bug. File selections and drag entries are now copied before asynchronous identity hydration, while the browser still grants access. The fixture waits for completed import before searching for its MP4. The rebuilt development/production desktop and mobile checks verify real bundled MP4 playback, pause and seek alongside existing provider keyboard behavior.

Evidence is recorded under `screenshots/creative-continuity-*` and in the revision 101 verification ledger. Tests use disposable browser profiles and mocked engine/native-save endpoints. They verify retained originals, conversion persistence, quota rejection/retry, source-file signatures, reload-safe print undo, conditional interruption, stop behavior, replay export and profile isolation on desktop and mobile. Existing model-generation and native-print regressions verify their separate behavior. These checks do not certify actual image generation, physical mobile hardware, external chat/game control or a long-running memory soak. No real user library was reset.
