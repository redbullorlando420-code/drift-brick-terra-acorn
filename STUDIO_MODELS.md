# Local image models

Open **Stable Diffusion → Model library**. Drop a public Hugging Face repository/file link, inspect its files, and download the selected weights. Alternatively choose the local file type and drop a downloaded `.safetensors` file. The browser streams uploads to Companion; it never reads gigabytes of weights into JavaScript memory. Only an active transfer is polled. Cancel stops the transfer and removes its temporary file. Existing weights are not overwritten.

## Qwen-Image 2.1 for this computer

The machine has an RTX 5070 Ti (16 GB VRAM) and approximately 32 GB system RAM. Start with the **Install Qwen 2.1 Turbo bundle** button. It installs these official Comfy-Org files, totaling approximately **14.25 GB**:

| Component | File | Folder |
|---|---|---|
| Image model | `qwen_image_2.1_turbo_int8_convrot.safetensors` | ComfyUI `models/diffusion_models` |
| Prompt encoder | `qwen3vl_8b_w4a8.safetensors` | ComfyUI `models/text_encoders` |
| Image decoder | `qwen_image_2.1_vae_bf16.safetensors` | ComfyUI `models/vae` |

Select **Qwen-Image 2.1 · ComfyUI** as the image engine, check it, start it if needed, then check again after startup. Begin with **8 steps**, **512 × 512**, a short descriptive prompt and a fixed seed when comparing results. Turbo uses CFG 1. The app automatically asks ComfyUI to unload weights after each request; the next image reloads them. **Release model memory** also works when idle. Stop the selected engine when finished. The app prevents starting its two image engines simultaneously.

This is Qwen's image model, not a Qwen chat/language model. “2.1” identifies the image family; Turbo is its faster generation variant. The regular 2.1 BF16/INT8 image models are also selectable when installed from the official compatible repository. They need the same encoder and VAE; BF16 takes more memory. The optional `qwen3.5_9b_...pe...` files are prompt enhancers, not the required Qwen3-VL encoder. The integration does not load them.

The isolated engine is `companion/tools/comfyui`, prepared by `companion/Install-Qwen.cmd`. It has its own Python 3.12 environment and CUDA 13.0 PyTorch. Your existing AUTOMATIC1111 installation and SD 1.5 checkpoint remain available. The Qwen engine listens only on **127.0.0.1:8189** so an existing application on 8188 is left alone. Custom nodes, cloud API nodes and public sharing are disabled. Imports cannot install code or submit arbitrary ComfyUI workflows; generation uses a fixed set of built-in nodes. One image is generated at a time, with bounded size, steps and response data. Interrupt targets only the app's own queued/running prompt.

## Other Hugging Face models

| Download type | Use here |
|---|---|
| Full SD 1.x / SDXL `.safetensors` checkpoint | AUTOMATIC1111; select it after import and engine refresh |
| Official Qwen-Image 2.1 diffusion weights | Qwen / ComfyUI, with the matching encoder and VAE |
| LoRA | Add-on, not a standalone image model; not supported by this simple workflow |
| VAE / text encoder alone | Supporting component, not a complete image model |
| GGUF / Qwen LLM / sharded Diffusers directory / ZIP / CKPT / arbitrary workflow | Different loader or workflow required; not accepted as a full checkpoint |

Remote imports pin the Hugging Face commit and verify SHA-256 before enabling a file. Local imports validate the safetensors structure and full-checkpoint shape where applicable. Those checks do not establish the source's trustworthiness or guarantee artistic quality. Obtain weights from a trusted publisher and review the model card. Private or gated repositories requiring tokens are not supported by the drag-and-drop downloader; credentials are not accepted in URLs.

Model files belong to the computer's shared native engine. Prompts, selected engine/model, settings and recipes use the existing account-scoped browser persistence. Switching accounts never exposes another account's result. A generated image stays in the current app session; download it before reloading.

Official references: [Qwen model card and Research License Agreement](https://huggingface.co/Qwen/Qwen-Image-2.1), [compatible Comfy-Org model files](https://huggingface.co/Comfy-Org/Qwen-Image-2.1), [ComfyUI](https://github.com/Comfy-Org/ComfyUI), [official text-to-image workflow](https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json). Credits also appear in Mission plan.

## PowerShell antivirus alert

The previous desktop shortcut used hidden PowerShell with an execution-policy bypass; its tests also used encoded PowerShell commands. These are plausible triggers for a command-line heuristic alert. The screenshot does not identify the parent application or prove the exact cause, and it does not establish a false positive.

The desktop shortcut and `Start-Realhub.cmd` now start Node.js directly in a visible console. Launcher tests use Node without PowerShell, encoding or policy bypasses. The launcher reuses healthy services, refuses unrelated occupied ports and only stops child services it started. Leave its console open while using services it launched.

No antivirus protection, exclusions or quarantine settings were changed. Some existing Windows-only Companion actions (shortcut-icon extraction and explicitly requested tray notifications) still use PowerShell; they are separate from the desktop startup path. If an alert recurs, its parent-process/script details are needed to attribute it. [Avast's official suspected false-positive reporting guidance](https://support.avast.com/article/258/) explains vendor review; no report or file has been sent automatically.
