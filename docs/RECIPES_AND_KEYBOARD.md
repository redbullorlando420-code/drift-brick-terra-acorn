# Reproducible recipes and keyboard access

## Recipe workflow

Generate locally, then Save image recipe. The image's submitted parameters and returned seed are captured separately from later form edits. Up to eight recipes remain in the existing owner-scoped browser storage; image bytes are not stored with them. Existing version-1 recipes remain readable. Export now writes version 2 using an allowlist of fields. Import never executes engine instructions or starts generation.

Use recipe opens a review dialog before changing the form. It shows prompts, engine, square dimensions, steps, seed, available model evidence and supported parameters. An exact installed model can be selected by identity; a missing model leaves the load action disabled until the user explicitly chooses an installed alternative. Alternatives, unknown parameters, unmatched digests/revisions and random seeds require acknowledgement. Switching engines must be done in the main studio first, followed by its existing explicit status/header review. Loading cannot bypass model preflight or start generation.

Model filenames are not identity proof. Engine-reported short hashes are labelled separately from a recorded install SHA-256 and repository commit. The install digest comes from the inspected source sidecar; it is not a new full-file hash during recipe loading. Imported provenance is a declaration, not proof. Absent evidence stays unrecorded. Different model weights, engines, versions and hardware can produce different pixels.

The updated AUTOMATIC1111 bridge pins Euler / Automatic / guidance 7. The existing fixed Qwen graph uses euler / simple / guidance 1 for Turbo or 4 otherwise, denoise 1. The form supports prompt, negative prompt, steps, seed, square size and an explicitly selected model. Arbitrary imported sampler names, scripts, plugin configuration and native workflow graphs are never executed. Unsupported recorded parameters are shown before mapping to these supported values. Companion must be restarted to activate the updated native bridge; no service restart or GPU job was performed for this batch.

Recipe JSON excludes unknown fields, private server configuration, credentials and paths in model metadata. Intentional prompt text remains portable. Inputs are limited to 64 KB; the existing eight-slot limit, rename, explicit remove/undo and storage-failure behavior remain. A failed local save leaves the previously saved list intact.

## Keyboard map and focus scopes

The header and player contain a Keyboard shortcuts button; ? opens help outside text fields and secondary dialogs. Help provides searchable commands, current-context availability, Tab containment, Escape dismissal and return to the originating control. It runs no displayed command.

- Library: Ctrl/Cmd+K or / opens search; Ctrl/Cmd+B toggles desktop navigation or the mobile menu. Saved owner-scoped preferences can disable either library binding to resolve browser/extension conflicts. Player and native provider bindings are fixed, not remappable.
- Media cards: arrows navigate mounted or virtualized titles, Home/End select the loaded page boundaries, Enter opens the focused title. Shelves use Left/Right. Grids also use Up/Down. Virtualization remains bounded.
- Local player outside controls: Space/K toggles playback; Left/Right seek 10 seconds (Shift: 30); Up/Down adjusts volume 5%; M toggles mute; F requests fullscreen; N/P selects next/previous; R chooses another random playlist title. Fullscreen permission remains the browser's decision.
- Provider iframe: the provider owns all keys inside its frame. The parent app only offers N/P outside focused controls; other local playback keys do not intercept the provider.
- Dialogs: Radix owns Tab/Shift+Tab/Escape and nested focus scopes. A viewer is itself a modal, so its own player keys remain allowed while other app shortcuts are suppressed. Secondary dialogs, typing, composition, already-prevented events and repeated app shortcut events are protected. Native video/audio controls retain their own keyboard actions.

No polling was added. The static command list is small; the help dialog mounts content only when opened. Preferences write only on user changes, synchronize compactly across tabs and reset to safe defaults when an owner changes or storage is unreadable. No catalog copy is retained by the command map.

## Verification and limits

Deterministic tests cover recipe schema migration, missing/alternate models, supported parameter replay, source/hash consistency, sensitive-field rejection, session provenance, scope guards and conflict preferences. Desktop and 390x844 Chrome checks cover explicit review/load, no implicit generation, export, storage failure, reload, virtual grid Arrow/Home/End navigation, provider N/P and iframe typing, local playback/seek using the bundled MP4, native video key ownership, nested help, modal focus and return. The existing studio browser check also covers generation navigation, rename, remove/undo and import/export. These are isolated fixtures, not real provider, GPU, physical-phone or native assistive-technology verification.
