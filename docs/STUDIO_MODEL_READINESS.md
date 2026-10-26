# Studio model readiness and generation recovery

The existing image studio now separates engine connection, model structure, owner requirements notes and successful generation. A downloaded file or a connected API alone does not establish that a model will generate on this computer.

## Model selection

Check the local engine, choose an exact advertised model to inspect, review the checklist, then use **Use reviewed model**. Inspecting an incompatible or missing file leaves the previously selected model in saved settings. Invalid/future compatibility reports cannot enable generation. A saved compatible choice can be reviewed again after reload; models are never selected from a note or automatically substituted after a failed review.

Companion examines at most an 8 MB safetensors header, validates bounded tensor offsets/shapes and detects supported structures. It retains at most 32 small summaries keyed by file size and modification time. It does not read complete weight files into browser memory or rehash gigabytes during a review. Publisher revision/digest records are labeled as installation provenance, not a fresh digest verification.

- AUTOMATIC1111: a full SD1 or SDXL checkpoint with recognized diffusion, conditioning and decoder structure. A LoRA, standalone decoder/encoder, unsupported SD2-style header or unknown pipeline is not promoted to a complete supported checkpoint.
- The fixed Qwen workflow: an exact supported Qwen-Image 2.1 diffusion-model filename and structure, `qwen3vl_8b_w4a8.safetensors` in text encoders and `qwen_image_2.1_vae_bf16.safetensors` in VAE. Each required component gets a header check. The [official Comfy model card](https://huggingface.co/Comfy-Org/Qwen-Image-2.1) documents these separate folders and component variants; the [Qwen publisher card](https://huggingface.co/Qwen/Qwen-Image-2.1) documents the image pipeline and license. This app implements its existing fixed subset, not every variant or arbitrary workflow.

Only the known Companion model folders are admitted by the new preflight. Paths, credentials and arbitrary URLs are not model selections; new reads resolve canonical paths and reject escapes. This is scoped to preflight, not a completed audit of all Companion root-changing operations.

Generation rechecks compatibility in Companion before reaching either local engine. A review cache becoming stale in the browser cannot bypass that check. Header compatibility is structural evidence, not a full tensor integrity proof, licensing approval or GPU suitability benchmark. Weight-file GiB is not a VRAM requirement. Model notes can record estimates, but hardware stays unverified until actual local testing.

After updating the Companion source files, restart Companion to load the new preflight endpoint and status flag. The frontend reports an older bridge as needing an update. Existing engine startup stays explicitly requested. No model download, package installation, engine startup or GPU job is triggered by opening the checklist or requirements notebook.

## Model requirements notebook

The notebook stores up to 64 notes per current app user, with four displayed per page. It records a canonical public Hugging Face URL, revision, exact filename, license text, family, required engine, artifact role, component notes and hardware estimates. A branch or ambiguous revision remains unverified; a syntactically pinned commit is recorded evidence, not proof that file contents were independently validated.

Pasted/imported JSON is parsed into a form and a review checklist before explicit Save. Unknown fields such as commands, workflows or tokens are discarded. Requirement text is plain data, never executed or rendered as active HTML. Notes distinguish a full checkpoint, LoRA add-on, VAE decoder, text encoder, diffusion weights and multi-component pipeline. Unsupported engines/families remain unverified, and no note changes the selected model or initiates a download.

Notes use the existing IndexedDB activity-document path plus a local mirror. Monotonic timestamps select the newest valid mirror. Dual-write failure keeps the prior saved record and leaves the staged form available for retry/export. Future/malformed stored versions are not silently replaced. JSON exports contain only allowlisted note fields. These local notes do not sync across devices or enter library packs automatically.

## Generation lifecycle

One request is active per browser session, with Companion retaining its existing engine single-flight check. Up to eight small per-user receipts record queued, running, cancel-requested, completed, cancelled, failed or interrupted states and the submitted settings. The intent is saved before an engine request; a dual-storage failure prevents dispatch. Writes are serialized and occur on state changes, not a polling/progress loop.

Navigation retains the existing in-memory request and latest preview. Reload restores unfinished receipts as **interrupted**, preserves submitted parameters and never resubmits them. The present bridge has no supported browser reattachment path: AUTOMATIC1111 provides no request identity here, while ComfyUI's returned native ID is kept only as a completed reference; owned temporary engine history is still cleaned up. A local intent ID is not a native job ID or an idempotency guarantee across arbitrary external clients.

An unknown network outcome is interrupted, not fabricated completion or confirmed cancellation. Explicit interrupt coalesces duplicates, cancels before dispatch when possible and otherwise waits for the engine outcome. Cancellation or disconnect retains the previous completed preview. A returned partial result does not replace an existing complete image. Each receipt keeps the captured request parameters separately from later form edits.

Receipts contain no image bytes or object URLs. They can retain a seed, checkpoint, elapsed time and session-only output label. The one latest in-memory preview and downloaded files remain separate. Reload cannot recover the preview bytes from a receipt; saved recipes remain the existing separate workflow. **Load job parameters** only fills the form; generation always needs an explicit new action after checking the engine.

## Evidence and limits

Policy tests: `scripts/studio-readiness-batch.test.mjs`, existing `studio-models.test.mjs` and `local-tools.test.mjs`. Desktop/mobile workflows: `scripts/studio-readiness-batch-browser-check.mjs`; the existing image/recipe regression supports `--studio-only` without external provider/native-session checks. Full results are in `MILESTONE_VERIFICATION.md`.

Actual installed SD1.5 and Qwen headers were read without loading full weights. Browser lifecycle tests use synthetic Companion responses and isolated real browser storage. They do not establish GPU output quality, physical-device behavior, real engine reconnection, resumable model downloads or long-term saved output retention. Those remaining milestones stay open.
