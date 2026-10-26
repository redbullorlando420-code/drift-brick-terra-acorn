import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Lt as ExternalLink, N as RotateCcw, _t as Images, c as Upload, l as Undo2, n as X, tn as BookmarkPlus, yt as ImagePlus, zt as Download } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as COMPANION_ORIGIN } from "./companion-C8xPNDAD.mjs";
import { Dt as Input, I as useCurrentUserState, Ot as Button, bi as saveWorkspaceDocuments, ci as readWorkspaceDocument, tr as createLocalId } from "./library-app-CrsCDQmv.mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, s as HubShell, t as Card } from "./hub-shared-CSaQ1YXN.mjs";
import { n as localTool, t as Badge } from "./local-tools-DbPLomGf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stable-diffusion-section-gB0l3dDV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StudioModelLibrary({ disabled, onInstalled }) {
	const [url, setUrl] = (0, import_react.useState)(""), [files, setFiles] = (0, import_react.useState)([]), [chosen, setChosen] = (0, import_react.useState)(""), [catalog, setCatalog] = (0, import_react.useState)({
		models: [],
		job: null
	}), [error, setError] = (0, import_react.useState)(""), [working, setWorking] = (0, import_react.useState)(false), [role, setRole] = (0, import_react.useState)("checkpoints");
	const alive = (0, import_react.useRef)(true), upload = (0, import_react.useRef)(null);
	const refresh = async () => {
		const next = await localTool("/studio/models");
		if (alive.current) setCatalog(next);
		return next;
	};
	(0, import_react.useEffect)(() => {
		alive.current = true;
		refresh().catch(() => {});
		return () => {
			alive.current = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (catalog.job?.state !== "running") return;
		const timer = setTimeout(() => void refresh().catch((cause) => setError(cause.message)), 1e3);
		return () => clearTimeout(timer);
	}, [catalog.job]);
	const run = async (action) => {
		setWorking(true);
		setError("");
		try {
			await action();
		} catch (cause) {
			if (alive.current) setError(cause instanceof Error ? cause.message : "Model action failed.");
		} finally {
			if (alive.current) setWorking(false);
		}
	};
	const inspect = async (value = url) => run(async () => {
		const result = await localTool("/studio/models/inspect", { url: value.trim() });
		if (!result.files.length) throw Error("No installable safetensors weights were found. Open the model’s Files tab and choose a full checkpoint or the Qwen bundle.");
		setFiles(result.files);
		setChosen(result.files.find((f) => f.supported)?.file ?? "");
	});
	const install = async (bundle = false) => run(async () => {
		await localTool("/studio/models/install", {
			url: url.trim(),
			file: chosen,
			bundle
		});
		await refresh();
	});
	const sendFile = async (file) => run(async () => {
		if (!file.name.endsWith(".safetensors")) throw Error("Choose .safetensors weights. ZIP, CKPT, GGUF and workflow files cannot be installed here.");
		await new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			upload.current = xhr;
			xhr.open("POST", COMPANION_ORIGIN + "/studio/models/upload?" + new URLSearchParams({
				name: file.name,
				role
			}));
			xhr.timeout = 0;
			xhr.setRequestHeader("Content-Type", "application/octet-stream");
			xhr.upload.onprogress = (e) => {
				if (alive.current) setCatalog((previous) => ({
					...previous,
					job: {
						id: "upload",
						label: file.name,
						state: "running",
						received: e.loaded,
						total: file.size,
						note: "Uploading directly to Companion…"
					}
				}));
			};
			xhr.onload = () => {
				try {
					const data = JSON.parse(xhr.responseText);
					if (xhr.status !== 200 || !data.ok) throw Error(data.error ?? "Upload failed.");
					resolve();
				} catch (cause) {
					reject(cause);
				}
			};
			xhr.onerror = () => reject(Error("Upload failed. Check Companion; any existing models were preserved."));
			xhr.onabort = () => reject(Error("Upload cancelled."));
			xhr.send(file);
		});
		upload.current = null;
		await refresh();
		onInstalled();
	});
	const active = working || catalog.job?.state === "running";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Model library" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Drop a Hugging Face model link or downloaded .safetensors file below. Transfers go straight to Companion’s model folders without loading the weights into browser memory." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-studio-model-drop": true,
				role: "region",
				"aria-label": "Model drop zone",
				className: "rounded-lg border border-dashed border-border p-4",
				onDragOver: (event) => event.preventDefault(),
				onDrop: (event) => {
					event.preventDefault();
					event.stopPropagation();
					if (disabled || active) return;
					const file = event.dataTransfer.files[0];
					if (file) {
						sendFile(file);
						return;
					}
					const value = (event.dataTransfer.getData("text/uri-list") || event.dataTransfer.getData("text/plain")).split("\n").find((line) => line && !line.startsWith("#")) ?? "";
					setUrl(value);
					inspect(value);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-2 text-sm",
						children: ["Hugging Face model link", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Hugging Face model link",
							value: url,
							onChange: (e) => {
								setUrl(e.target.value);
								setFiles([]);
								setChosen("");
							},
							placeholder: "https://huggingface.co/creator/model",
							disabled: disabled || active
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: disabled || active || !url.trim(),
							onClick: () => void inspect(),
							children: "Inspect model link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: disabled || active,
							onClick: () => void install(true),
							children: "Install Qwen 2.1 Turbo bundle"
						})]
					}),
					files.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm",
							children: ["Model file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								"aria-label": "Hugging Face model file",
								className: "mt-2 min-h-11 w-full rounded-md border border-border bg-bg px-2",
								value: chosen,
								onChange: (e) => setChosen(e.target.value),
								children: files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: file.file,
									disabled: !file.supported,
									children: [
										file.name,
										" · ",
										(file.bytes / 1e9).toFixed(2),
										" GB",
										!file.supported ? " · different workflow required" : ""
									]
								}, file.file))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: disabled || active || !chosen,
							onClick: () => void install(),
							children: "Download selected model"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: ["Local file type", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Local model file type",
								value: role,
								disabled: disabled || active,
								onChange: (e) => setRole(e.target.value),
								className: "mt-2 min-h-11 w-full rounded-md border border-border bg-bg px-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "checkpoints",
										children: "SD 1.x / SDXL full checkpoint"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "diffusion_models",
										children: "Qwen 2.1 diffusion model"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "text_encoders",
										children: "Qwen 2.1 text encoder"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "vae",
										children: "Qwen 2.1 VAE"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: ["Or choose a downloaded model", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": "Choose local model file",
								type: "file",
								accept: ".safetensors",
								disabled: disabled || active,
								className: "mt-2 block min-h-11 w-full text-xs",
								onChange: (event) => {
									const file = event.target.files?.[0];
									if (file) sendFile(file);
									event.target.value = "";
								}
							})]
						})]
					})
				]
			}),
			catalog.job && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2",
				role: "status",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "break-words text-sm",
						children: [
							catalog.job.label,
							" · ",
							catalog.job.state
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
						className: "h-2 w-full accent-[var(--accent)]",
						max: catalog.job.total || 1,
						value: catalog.job.received
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							(catalog.job.received / 1e9).toFixed(2),
							" / ",
							(catalog.job.total / 1e9).toFixed(2),
							" GB · ",
							catalog.job.note
						]
					}),
					catalog.job.state === "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						onClick: () => void run(async () => {
							upload.current?.abort();
							await localTool("/studio/models/cancel", {});
							await refresh();
						}),
						children: "Cancel model transfer"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => {
							onInstalled();
							refresh();
						},
						children: "Refresh installed models"
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "min-h-11 cursor-pointer py-3",
					children: "What type of model should I download?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 text-xs leading-6 text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"The fixed Qwen workflow supports ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Qwen-Image 2.1 Turbo INT8 ConvRot" }),
							", ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "qwen3vl_8b_w4a8" }),
							" and the matching ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Qwen 2.1 VAE BF16" }),
							". The bundle installs all three (about 14.25 GB). Use the Qwen / ComfyUI engine, 8 steps and 512 × 512 for the first image. Hardware suitability is unverified until a local generation succeeds; larger images need more GPU memory and time."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"For AUTOMATIC1111, choose a complete SD 1.x or SDXL ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ".safetensors checkpoint" }),
							". A LoRA is an add-on, a VAE decodes images, and a text encoder reads prompts; none is a complete checkpoint. Qwen language/chat models, Qwen 2.5/3 LLMs, GGUF, Diffusers folders and arbitrary workflows are not interchangeable with this image pipeline."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Qwen 2.1 files cannot be loaded into AUTOMATIC1111. BF16 models use more memory than the quantized variants. Public, ungated Hugging Face downloads are supported; review each model’s license and intended use. Qwen-Image 2.1 uses the Qwen Research License Agreement." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-accent underline",
								target: "_blank",
								rel: "noreferrer",
								href: "https://huggingface.co/Comfy-Org/Qwen-Image-2.1",
								children: "Official compatible model files"
							}),
							" · ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-accent underline",
								target: "_blank",
								rel: "noreferrer",
								href: "https://huggingface.co/Qwen/Qwen-Image-2.1",
								children: "Qwen model card and license"
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Only weights are accepted. Imports never install Python, extensions or custom nodes. Remote downloads are pinned to a repository revision and SHA-256 checked. Local files receive format checks; obtain them from a source you trust. Existing model files are never overwritten." })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				disabled: working,
				onClick: () => void run(refresh),
				children: "Refresh model library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted",
				children: [catalog.models.length, " installed components · Models are shared by this computer’s local engine. Prompts, settings and recipes stay in your account’s app workspace."]
			})
		] })]
	});
}
var DEFAULT_STUDIO_SETTINGS = {
	prompt: "",
	negative: "",
	steps: 20,
	seed: -1,
	size: 512
};
function studioSettings(value, legacyPrompt = "") {
	const row = value && typeof value === "object" ? value : {};
	return {
		...row.engine === "comfy" ? { engine: "comfy" } : {},
		...typeof row.model === "string" && row.model.length <= 240 ? { model: row.model } : {},
		prompt: typeof row.prompt === "string" ? row.prompt.slice(0, 4e3) : legacyPrompt.slice(0, 4e3),
		negative: typeof row.negative === "string" ? row.negative.slice(0, 4e3) : "",
		steps: Number.isInteger(row.steps) && row.steps >= 1 && row.steps <= 40 ? row.steps : 20,
		seed: Number.isInteger(row.seed) && row.seed >= -1 && row.seed <= 2147483647 ? row.seed : -1,
		size: [
			256,
			512,
			768
		].includes(row.size) ? row.size : 512
	};
}
function studioSettingsError(settings) {
	if (!settings || typeof settings.prompt !== "string" || settings.prompt.length > 4e3 || typeof settings.negative !== "string" || settings.negative.length > 4e3) return "Use prompts of up to 4,000 characters.";
	if (![
		256,
		512,
		768
	].includes(settings.size) || settings.engine !== void 0 && !["a1111", "comfy"].includes(settings.engine)) return "Choose a supported engine and image size.";
	if (settings.model !== void 0 && (typeof settings.model !== "string" || settings.model.length > 240 || /[\\/:\x00-\x1f]/.test(settings.model))) return "Choose an engine model name without paths or credentials.";
	if (!settings.prompt.trim()) return "Enter a prompt to describe your image.";
	if (!Number.isInteger(settings.steps) || settings.steps < 1 || settings.steps > 40) return "Steps must be a whole number from 1 to 40.";
	if (!Number.isInteger(settings.seed) || settings.seed < -1 || settings.seed > 2147483647) return "Seed must be −1 for random, or a whole number from 0 to 2147483647.";
}
/** AUTOMATIC1111 supplies the actual seed in JSON info, including random runs. */
function generatedSeed(info, fallback) {
	try {
		const row = typeof info === "string" ? JSON.parse(info) : info;
		const value = row?.seed ?? row?.all_seeds?.[0];
		if (Number.isInteger(value) && value >= 0 && value <= 2147483647) return value;
	} catch {}
	return fallback >= 0 ? fallback : void 0;
}
var MODEL_NOTE_BYTES = 32e3;
var MODEL_ROLES = [
	"checkpoint",
	"diffusion-model",
	"lora",
	"vae",
	"text-encoder",
	"pipeline"
];
var EMPTY_MODEL_NOTES = {
	version: 1,
	updatedAt: 0,
	notes: []
};
function readModelPreflight(raw) {
	const r = raw;
	if (!r || r.version !== 1 || !["a1111", "comfy"].includes(r.engine) || typeof r.name !== "string" || r.name.length > 240 || typeof r.family !== "string" || r.family.length > 60 || typeof r.role !== "string" || r.role.length > 60 || !Array.isArray(r.checks) || !r.checks.length || r.checks.length > 32 || !Number.isSafeInteger(r.bytes) || r.bytes < 0 || !r.hardware || !Number.isFinite(r.hardware.weightsGiB) || r.hardware.weightsGiB < 0 || typeof r.hardware.note !== "string" || r.hardware.note.length > 1e3) throw Error("Unsupported model compatibility report.");
	const checks = r.checks.map((c) => {
		if (!c || typeof c.label !== "string" || c.label.length > 200 || typeof c.detail !== "string" || c.detail.length > 1e3 || ![
			"pass",
			"fail",
			"unknown"
		].includes(c.state)) throw Error("Invalid model compatibility checklist.");
		return {
			label: c.label,
			state: c.state,
			detail: c.detail
		};
	});
	const ready = r.ready === true && checks.every((c) => c.state !== "fail") && (r.engine === "a1111" ? ["sd1", "sdxl"].includes(r.family) && r.role === "checkpoint" : r.family === "qwen-image-2.1" && r.role === "diffusion-model");
	let source;
	if (r.source) {
		source = {
			url: canonicalModelUrl(r.source.url),
			revision: r.source.revision
		};
		if (!/^[a-f0-9]{40}$/.test(source.revision)) throw Error("Invalid installation revision.");
		if (r.source.recordedDigest && /^[a-f0-9]{64}$/.test(r.source.recordedDigest)) source.recordedDigest = r.source.recordedDigest;
	}
	return {
		version: 1,
		engine: r.engine,
		name: r.name,
		family: r.family,
		role: r.role,
		ready,
		bytes: r.bytes,
		checks,
		hardware: {
			weightsGiB: r.hardware.weightsGiB,
			note: r.hardware.note
		},
		...source ? { source } : {}
	};
}
function canonicalModelUrl(value) {
	const u = new URL(value);
	if (u.protocol !== "https:" || u.hostname !== "huggingface.co" || u.username || u.password || u.port || u.search || u.hash) throw Error("Use a public HTTPS Hugging Face repository or file URL without credentials or query parameters.");
	const parts = decodeURIComponent(u.pathname).split("/").filter(Boolean);
	if (parts.length < 2 || !parts.slice(0, 2).every((p) => /^[\w.-]+$/.test(p)) || parts.some((p) => p === "." || p === "..") || parts.length > 2 && (!["blob", "resolve"].includes(parts[2]) || parts.length < 5 || !parts.slice(3).every((p) => /^[\w .-]+$/.test(p)))) throw Error("Use a model repository or an exact model file page.");
	return "https://huggingface.co/" + parts.map(encodeURIComponent).join("/");
}
function parseModelNote(raw) {
	const r = raw;
	if (!r || r.version !== 1 || typeof r.url !== "string" || r.url.length > 2048) throw Error("Unsupported model requirements note.");
	const string = (key, max) => {
		const value = r[key];
		if (typeof value !== "string" || value.length > max) throw Error("Invalid " + key + " in model requirements.");
		return value.trim();
	};
	const revision = string("revision", 80), file = string("file", 180), license = string("license", 200), requirements = string("requirements", 4e3), hardware = string("hardware", 500);
	if (revision && !/^[\w.-]+$/.test(revision) || file && (!/^[\w .-]+$/.test(file) || file.includes(".."))) throw Error("Use a revision label and a filename without paths.");
	if (![
		"sd1",
		"sdxl",
		"qwen-image-2.1",
		"other",
		"unknown"
	].includes(r.family) || ![
		"a1111",
		"comfy",
		"other",
		"unknown"
	].includes(r.engine) || !MODEL_ROLES.includes(r.role)) throw Error("Select a supported note family, engine and artifact role.");
	return {
		version: 1,
		url: canonicalModelUrl(r.url),
		revision,
		file,
		license,
		family: r.family,
		engine: r.engine,
		role: r.role,
		requirements,
		hardware
	};
}
function importModelNote(text) {
	if (text.length > 32e3 || new TextEncoder().encode(text).length > 32e3) throw Error("Requirements notes must be smaller than 32 KB.");
	return parseModelNote(JSON.parse(text));
}
function readModelNotes(raw) {
	const r = raw;
	if (!r || r.version !== 1 || !Number.isSafeInteger(r.updatedAt) || r.updatedAt < 0 || !Array.isArray(r.notes) || r.notes.length > 64) throw Error("Unsupported model requirements storage.");
	const seen = /* @__PURE__ */ new Set();
	const notes = r.notes.map((value) => {
		const note = parseModelNote(value);
		if (!Number.isSafeInteger(value.savedAt) || value.savedAt < 0 || seen.has(note.url + "|" + note.file + "|" + note.revision)) throw Error("Invalid or duplicate saved model note.");
		seen.add(note.url + "|" + note.file + "|" + note.revision);
		return {
			...note,
			savedAt: value.savedAt
		};
	});
	return {
		version: 1,
		updatedAt: r.updatedAt,
		notes
	};
}
function saveModelNote(ledger, raw, now = Date.now()) {
	const note = parseModelNote(raw), same = (n) => n.url === note.url && n.file === note.file && n.revision === note.revision, notes = ledger.notes.filter((n) => !same(n));
	if (notes.length >= 64) throw Error("All 64 note slots are used. Export or remove a note before adding one.");
	return readModelNotes({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		notes: [{
			...note,
			savedAt: now
		}, ...notes]
	});
}
function modelNoteChecklist(note, review) {
	const match = !!review && review.name === note.file;
	return [
		{
			label: "Exact repository revision",
			verified: /^[a-f0-9]{40}$/.test(note.revision),
			detail: /^[a-f0-9]{40}$/.test(note.revision) ? "Pinned revision recorded; content verification is separate." : "Branch, missing or ambiguous revision remains unverified."
		},
		{
			label: "Artifact role",
			verified: match && review.role === note.role,
			detail: note.role === "checkpoint" ? "Full checkpoint, not a LoRA/VAE/encoder." : note.role === "diffusion-model" ? "Diffusion weights require matching text encoder and VAE." : note.role === "pipeline" ? "A pipeline is a multi-component package; this installer cannot run arbitrary pipeline code." : note.role + " is an add-on/component, not a full checkpoint."
		},
		{
			label: "Architecture and engine",
			verified: match && review.ready && review.family === note.family && review.engine === note.engine,
			detail: match ? "Compared with the inspected local model." : "Owner-entered requirements are unverified until the exact installed file is inspected."
		},
		{
			label: "License review",
			verified: false,
			detail: note.license ? "Recorded license: " + note.license + ". Review publisher terms; text is not legal verification." : "License is missing; review the publisher model card."
		},
		{
			label: "Hardware suitability",
			verified: false,
			detail: note.hardware || "No verified runtime/VRAM measurement is recorded."
		}
	];
}
var modelLabel = (v) => typeof v === "string" && v.trim() && v.length <= 240 && !/[\\/:\x00-\x1f]/.test(v) ? v.trim() : void 0;
var modelIdentity = (v) => v.replace(/ \[[a-f0-9]+\]$/i, "").replace(/\.(safetensors|ckpt)$/i, "");
function provenance(raw) {
	const r = raw;
	if (!r || !["a1111", "comfy"].includes(r.engine) || ![
		256,
		512,
		768
	].includes(r.width) || r.height !== r.width) throw Error("Unsupported recipe engine or dimensions.");
	const out = {
		engine: r.engine,
		width: r.width,
		height: r.height
	};
	for (const key of [
		"modelName",
		"family",
		"sampler",
		"scheduler"
	]) if (r[key] !== void 0) {
		const value = modelLabel(r[key]);
		if (!value) throw Error("Invalid recipe " + key + ".");
		out[key] = value;
	}
	for (const [key, re] of [
		["revision", /^[a-f0-9]{40}$/],
		["sha256", /^[a-f0-9]{64}$/],
		["engineHash", /^[a-f0-9]{8,64}$/]
	]) if (r[key] !== void 0) {
		if (typeof r[key] !== "string" || !re.test(r[key])) throw Error("Invalid recipe " + key + ".");
		out[key] = r[key];
	}
	if (r.source !== void 0) {
		if (typeof r.source !== "string" || r.source.length > 2048) throw Error("Invalid recipe model source.");
		out.source = canonicalModelUrl(r.source);
	}
	for (const key of ["guidance", "denoise"]) if (r[key] !== void 0) {
		if (!Number.isFinite(r[key]) || r[key] < 0 || r[key] > (key === "denoise" ? 1 : 100)) throw Error("Invalid recipe " + key + ".");
		out[key] = r[key];
	}
	return out;
}
function recipeDocument(recipe) {
	return {
		format: "realhub-studio-recipe",
		version: 2,
		...parseRecipe(JSON.stringify({
			format: "realhub-studio-recipe",
			version: 2,
			...recipe
		}))
	};
}
/** Imports are an allow-list of form values, never native engine instructions. */
function parseRecipe(text) {
	if (text.length > 64e3 || new TextEncoder().encode(text).length > 64e3) throw new Error("Choose a recipe JSON file smaller than 64 KB.");
	let data;
	try {
		data = JSON.parse(text);
	} catch {
		throw new Error("This file is not valid JSON. Choose an exported Realhub image recipe.");
	}
	if (data?.format !== "realhub-studio-recipe" || ![1, 2].includes(data.version) || !data.settings || typeof data.settings !== "object") throw new Error("This is not a supported Realhub image recipe.");
	const row = data.settings;
	if (typeof row.prompt !== "string" || row.prompt.length > 4e3 || typeof row.negative !== "string" || row.negative.length > 4e3 || ![
		256,
		512,
		768
	].includes(row.size)) throw new Error("The recipe contains invalid prompts or image dimensions.");
	const failure = studioSettingsError(row);
	if (failure) throw new Error(failure);
	if (data.version === 2 && data.provenance !== void 0) {
		const p = provenance(data.provenance);
		if (p.engine !== (row.engine ?? "a1111") || p.width !== row.size) throw Error("Recipe provenance disagrees with its engine or dimensions.");
	}
	return {
		name: typeof data.name === "string" && data.name.trim() ? data.name.trim().slice(0, 80) : row.prompt.trim().slice(0, 80),
		settings: studioSettings(row),
		...modelLabel(data.checkpoint) ? { checkpoint: modelLabel(data.checkpoint) } : {},
		...data.version === 2 && data.provenance !== void 0 ? { provenance: provenance(data.provenance) } : {}
	};
}
function restoreRecipes(text) {
	if (!text || text.length > 512e3) return [];
	try {
		const data = JSON.parse(text);
		if (!Array.isArray(data)) return [];
		const rows = [];
		for (const row of data.slice(0, 8)) {
			if (typeof row?.id !== "string" || row.id.length > 100 || !Number.isFinite(row.savedAt) || row.savedAt <= 0 || rows.some((item) => item.id === row.id)) continue;
			try {
				rows.push({
					...parseRecipe(JSON.stringify({
						...row,
						format: "realhub-studio-recipe",
						version: 2
					})),
					id: row.id,
					savedAt: row.savedAt
				});
			} catch {}
		}
		return rows;
	} catch {
		return [];
	}
}
function generatedCheckpoint(info) {
	try {
		const value = (typeof info === "string" ? JSON.parse(info) : info)?.sd_model_name;
		return modelLabel(value);
	} catch {
		return;
	}
}
/** Engine observations and the exact inspected install are separate evidence. */
function generatedProvenance(settings, info, review) {
	let row = {};
	try {
		const r = typeof info === "string" ? JSON.parse(info) : info;
		if (r && typeof r === "object") row = r;
	} catch {}
	const engine = settings.engine ?? "a1111", modelName = generatedCheckpoint(row) ?? modelLabel(settings.model);
	const out = {
		engine,
		width: settings.size,
		height: settings.size,
		...modelName ? { modelName } : {}
	};
	for (const [key, value] of [["sampler", row.sampler_name ?? row.sampler], ["scheduler", row.scheduler]]) {
		const clean = modelLabel(value);
		if (clean) out[key] = clean;
	}
	if (typeof row.cfg_scale === "number" && Number.isFinite(row.cfg_scale) && row.cfg_scale >= 0 && row.cfg_scale <= 100) out.guidance = row.cfg_scale;
	if (typeof row.denoising_strength === "number" && row.denoising_strength >= 0 && row.denoising_strength <= 1) out.denoise = row.denoising_strength;
	if (typeof row.sd_model_hash === "string" && /^[a-f0-9]{8,64}$/.test(row.sd_model_hash)) out.engineHash = row.sd_model_hash;
	if (review?.ready && review.engine === engine && modelName && modelIdentity(review.name) === modelIdentity(modelName)) {
		out.family = review.family;
		if (review.source) {
			out.source = review.source.url;
			out.revision = review.source.revision;
			if (review.source.recordedDigest) out.sha256 = review.source.recordedDigest;
		}
	}
	return provenance(out);
}
function recipeLoadReview(recipe, engine, models, selection, review) {
	const sourceEngine = recipe.provenance?.engine ?? recipe.settings.engine ?? "a1111", expected = recipe.provenance?.modelName ?? recipe.settings.model ?? recipe.checkpoint;
	const exact = expected ? models.find((name) => modelIdentity(name) === modelIdentity(expected)) : void 0;
	const chosen = selection === void 0 ? exact : models.includes(selection) ? selection : void 0;
	const p = recipe.provenance, qwen = chosen?.toLowerCase().includes("turbo"), warnings = [];
	if (sourceEngine !== engine) warnings.push("This recipe uses a different engine. Switch the image engine and check it before loading.");
	if (!chosen) warnings.push("The recorded model is missing or unverified. Choose an installed compatible model explicitly.");
	if (chosen && (!expected || modelIdentity(chosen) !== modelIdentity(expected))) warnings.push("You selected a different model. Its output will differ from this recipe.");
	const supported = {
		sampler: engine === "comfy" ? "euler" : "Euler",
		scheduler: engine === "comfy" ? "simple" : "Automatic",
		guidance: engine === "comfy" ? qwen ? 1 : 4 : 7,
		denoise: 1
	};
	if (!p?.sampler || !p?.scheduler || p.guidance === void 0) warnings.push("Sampler, scheduler or guidance was not recorded. The current supported engine parameters will be used.");
	else if (p.sampler !== supported.sampler || p.scheduler !== supported.scheduler || p.guidance !== supported.guidance || p.denoise !== void 0 && p.denoise !== supported.denoise) warnings.push("This engine form cannot apply the recorded sampler, scheduler, guidance or denoise. Only the displayed supported parameters can be loaded.");
	const matching = review?.ready && review.engine === engine && chosen && modelIdentity(review.name) === modelIdentity(chosen);
	if (p?.sha256 && (!matching || review.source?.recordedDigest !== p.sha256)) warnings.push("The recorded model digest does not match a reviewed install. Review the model before generation.");
	if (p?.revision && (!matching || review.source?.revision !== p.revision)) warnings.push("The recorded repository revision has not been matched to a reviewed install.");
	if (p?.engineHash && (!matching || !review.source?.recordedDigest?.startsWith(p.engineHash))) warnings.push("The engine-reported model hash has not been independently matched.");
	if (!p?.sha256 && !p?.engineHash) warnings.push("No model hash was recorded. A matching filename alone does not verify identical weights.");
	if (recipe.settings.seed === -1) warnings.push("The seed is random or was not returned. Loading cannot reproduce the same noise seed.");
	return {
		sourceEngine,
		expected,
		chosen,
		warnings,
		supported,
		canLoad: sourceEngine === engine && !!chosen,
		settings: chosen ? {
			...studioSettings(recipe.settings),
			engine,
			model: chosen
		} : void 0
	};
}
var STUDIO_JOB_STATES = [
	"queued",
	"running",
	"cancel-requested",
	"completed",
	"cancelled",
	"failed",
	"interrupted"
];
var EMPTY_STUDIO_JOBS = {
	version: 1,
	updatedAt: 0,
	jobs: []
};
function readStudioJobs(raw) {
	const r = raw;
	if (!r || r.version !== 1 || !Number.isSafeInteger(r.updatedAt) || r.updatedAt < 0 || !Array.isArray(r.jobs) || r.jobs.length > 8) throw Error("Unsupported image job history.");
	const seen = /* @__PURE__ */ new Set();
	const jobs = r.jobs.map((value) => {
		if (!value || typeof value.id !== "string" || !/^[\w:-]{1,100}$/.test(value.id) || seen.has(value.id) || !STUDIO_JOB_STATES.includes(value.status) || !Number.isSafeInteger(value.createdAt) || value.createdAt < 0 || !Number.isSafeInteger(value.updatedAt) || value.updatedAt < value.createdAt || typeof value.detail !== "string" || value.detail.length > 500) throw Error("Invalid saved image job.");
		seen.add(value.id);
		const settings = studioSettings(value.settings);
		if (studioSettingsError(value.settings) || studioSettingsError(settings) || typeof value.settings?.prompt !== "string" || settings.prompt !== value.settings.prompt) throw Error("Invalid saved image parameters.");
		const engineJobId = typeof value.engineJobId === "string" && /^[\w-]{1,128}$/.test(value.engineJobId) ? value.engineJobId : void 0;
		const output = value.output && Number.isFinite(value.output.seconds) && value.output.seconds >= 0 ? {
			seconds: Math.min(6e3, value.output.seconds),
			preview: "session-only",
			...Number.isInteger(value.output.seed) && value.output.seed >= 0 ? { seed: value.output.seed } : {},
			...typeof value.output.checkpoint === "string" ? { checkpoint: value.output.checkpoint.slice(0, 200) } : {}
		} : void 0;
		return {
			id: value.id,
			status: value.status,
			createdAt: value.createdAt,
			updatedAt: value.updatedAt,
			settings,
			detail: value.detail,
			...engineJobId ? { engineJobId } : {},
			...output ? { output } : {}
		};
	});
	return {
		version: 1,
		updatedAt: r.updatedAt,
		jobs
	};
}
var activeStudioJob = (job) => [
	"queued",
	"running",
	"cancel-requested"
].includes(job.status);
function recoverStudioJobs(jobs, now = Date.now()) {
	return jobs.map((job) => activeStudioJob(job) ? {
		...job,
		status: "interrupted",
		updatedAt: Math.max(now, job.updatedAt),
		detail: "Browser session ended. Engine outcome is unknown; this request was not resubmitted. Check the local engine before a new explicit generation."
	} : job);
}
/** One user-started request; durable small receipts never resubmit engine work.
* Image bytes remain one in-memory preview, separate from saved job metadata. */
var StudioSession = class {
	state;
	listeners = /* @__PURE__ */ new Set();
	run = 0;
	engine = "a1111";
	hydration = null;
	request;
	storage;
	writing = Promise.resolve(true);
	constructor(request, storage) {
		this.request = request;
		this.storage = storage;
		this.state = {
			busy: false,
			interrupting: false,
			image: null,
			note: "",
			error: "",
			jobs: [],
			ready: !storage,
			saveError: ""
		};
	}
	getSnapshot = () => this.state;
	subscribe = (listener) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
	patch(change) {
		this.state = {
			...this.state,
			...change
		};
		for (const listener of this.listeners) listener();
	}
	job(id, change) {
		this.patch({ jobs: this.state.jobs.map((row) => row.id === id ? {
			...row,
			...change,
			updatedAt: Math.max(Date.now(), row.updatedAt)
		} : row) });
	}
	async hydrate() {
		if (this.state.ready || !this.storage) return;
		if (this.hydration) return this.hydration;
		const task = (async () => {
			try {
				const saved = await this.storage.load(), jobs = recoverStudioJobs(saved);
				this.patch({
					jobs,
					ready: true,
					error: ""
				});
				if (jobs.some((job, i) => job !== saved[i])) await this.persist();
			} catch (e) {
				this.patch({ error: e instanceof Error ? e.message : "Could not recover image jobs." });
			}
		})();
		this.hydration = task;
		try {
			await task;
		} finally {
			this.hydration = null;
		}
	}
	persist() {
		if (!this.storage) return Promise.resolve(true);
		const jobs = this.state.jobs;
		const next = this.writing.then(async () => {
			try {
				const warning = await this.storage.save(jobs);
				this.patch({ saveError: warning ?? "" });
				return true;
			} catch (e) {
				this.patch({ saveError: e instanceof Error ? e.message : "Image job history could not be saved." });
				return false;
			}
		});
		this.writing = next;
		return next;
	}
	retrySave = () => this.persist();
	clearImage = () => {
		if (!this.state.busy) this.patch({
			image: null,
			error: "",
			note: "Image cleared from this app session. Downloaded files and saved recipes are unchanged."
		});
	};
	async generate(settings, review) {
		if (this.state.busy) return;
		if (!this.state.ready) {
			this.patch({ error: "Recover image job history before generating." });
			return;
		}
		const validation = studioSettingsError(settings);
		if (validation) {
			this.patch({ error: validation });
			return;
		}
		const submitted = { ...settings }, started = performance.now(), id = createLocalId("studio:"), at = Date.now();
		this.run++;
		this.engine = submitted.engine ?? "a1111";
		const job = {
			id,
			status: "queued",
			createdAt: at,
			updatedAt: at,
			settings: submitted,
			detail: "Intent recorded before contacting the local engine."
		};
		this.patch({
			busy: true,
			interrupting: false,
			error: "",
			note: "Preparing a recoverable local generation.",
			jobs: [job, ...this.state.jobs].slice(0, 8)
		});
		let sent = false;
		try {
			if (this.storage && !await this.persist()) throw Error("Job was not sent because its intent could not be saved.");
			if (this.state.interrupting) {
				this.job(id, {
					status: "cancelled",
					detail: "Cancelled before the local request was sent."
				});
				return;
			}
			this.job(id, {
				status: "running",
				detail: "Local request submitted. Navigation keeps this request; reload never resubmits it."
			});
			if (this.storage && !await this.persist()) throw Error("Job was not sent because its running receipt could not be saved.");
			if (this.state.interrupting) {
				this.job(id, {
					status: "cancelled",
					detail: "Cancelled before the local request was sent."
				});
				return;
			}
			this.patch({ note: "Generating locally. You can visit another app tab and return to the result." });
			sent = true;
			const result = await this.request(submitted.engine === "comfy" ? "/studio/qwen/generate" : "/studio/generate", {
				prompt: submitted.prompt,
				negativePrompt: submitted.negative,
				steps: submitted.steps,
				width: submitted.size,
				height: submitted.size,
				seed: submitted.seed,
				clientJobId: id,
				...submitted.model ? { model: submitted.model } : {}
			});
			if (typeof result.image !== "string" || result.image.length > 14e6 || !/^iVBORw0KGgo[A-Za-z0-9+/=\r\n]*$/.test(result.image)) throw Error("The image response is missing, invalid or exceeds the preview budget.");
			const bytes = Uint8Array.from(atob(result.image), (character) => character.charCodeAt(0)), interrupted = this.state.interrupting;
			const image = {
				blob: new Blob([bytes], { type: "image/png" }),
				settings: submitted,
				seed: generatedSeed(result.info, submitted.seed),
				checkpoint: generatedCheckpoint(result.info),
				provenance: generatedProvenance(submitted, result.info, review),
				seconds: Math.max(.1, Math.round((performance.now() - started) / 100) / 10)
			};
			this.job(id, {
				status: interrupted ? "cancelled" : "completed",
				detail: interrupted ? "Cancellation requested; returned image may be partial." : "Engine returned a PNG. Preview bytes are kept only in this browser session.",
				...typeof result.engineJobId === "string" && /^[\w-]{1,128}$/.test(result.engineJobId) ? { engineJobId: result.engineJobId } : {},
				output: {
					seed: image.seed,
					checkpoint: image.checkpoint,
					seconds: image.seconds,
					preview: "session-only"
				}
			});
			this.patch({
				image: interrupted && this.state.image ? this.state.image : image,
				note: interrupted ? "Generation stopped. The engine returned a partial image; your previous completed image was preserved when available." : "Image ready. Download it before reloading or closing this browser tab."
			});
		} catch (cause) {
			const message = cause instanceof Error ? cause.message : "Generation failed.", unknown = sent && cause?.outcome === "unknown";
			const status = unknown ? "interrupted" : this.state.interrupting && /interrupt|cancel/i.test(message) ? "cancelled" : "failed";
			this.job(id, {
				status,
				detail: unknown ? "Connection ended with an unknown engine outcome. Check the engine; no automatic retry was sent." : message.slice(0, 500)
			});
			this.patch({
				note: "",
				error: message + " Your previous image and submitted parameters remain available."
			});
		} finally {
			if (this.storage) await this.persist();
			this.patch({
				busy: false,
				interrupting: false
			});
		}
	}
	async interrupt() {
		if (!this.state.busy || this.state.interrupting || !["queued", "running"].includes(this.state.jobs[0]?.status ?? "")) return;
		const id = this.state.jobs[0]?.id, run = this.run;
		this.patch({
			interrupting: true,
			error: ""
		});
		if (id) this.job(id, {
			status: "cancel-requested",
			detail: "Explicit cancellation requested; waiting for an engine outcome."
		});
		try {
			await this.request(this.engine === "comfy" ? "/studio/qwen/interrupt" : "/studio/interrupt", {});
			if (this.state.busy && this.run === run) {
				this.patch({ note: "Interrupt requested. Waiting for the engine to finish stopping." });
				if (this.storage) await this.persist();
			}
		} catch (cause) {
			if (this.state.busy && this.run === run) {
				if (id) this.job(id, {
					status: "running",
					detail: "Cancellation could not be confirmed. Retry the interrupt control."
				});
				this.patch({
					interrupting: false,
					error: cause instanceof Error ? cause.message : "Interrupt could not be sent."
				});
			}
		}
	}
};
function createStudioSessions(request, storage) {
	const sessions = /* @__PURE__ */ new Map();
	return (owner) => {
		let session = sessions.get(owner);
		if (!session) {
			if (sessions.size >= 2) sessions.delete(sessions.keys().next().value);
			session = new StudioSession(request, storage?.(owner));
		}
		sessions.delete(owner);
		sessions.set(owner, session);
		return session;
	};
}
function StudioRecipes({ owner, result, disabled, onReuse, engine, models, review }) {
	const key = `reelcase.studio.recipes.v1:${encodeURIComponent(owner)}`;
	const read = () => restoreRecipes(localStorage.getItem(key));
	const [recipes, setRecipes] = (0, import_react.useState)(() => {
		try {
			return read();
		} catch {
			return [];
		}
	});
	const [name, setName] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), [importing, setImporting] = (0, import_react.useState)(false), [removed, setRemoved] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null), [selection, setSelection] = (0, import_react.useState)(), [acknowledged, setAcknowledged] = (0, import_react.useState)(false);
	const previewOrigin = (0, import_react.useRef)(null);
	const openPreview = (recipe) => {
		previewOrigin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		setSelection(void 0);
		setAcknowledged(false);
		setPreview(recipe);
	};
	const plan = preview ? recipeLoadReview(preview, engine, models, selection, review) : null;
	const [editing, setEditing] = (0, import_react.useState)(null), [newName, setNewName] = (0, import_react.useState)("");
	const input = (0, import_react.useRef)(null), mounted = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		const update = (event) => {
			if (event.key === key) setRecipes(restoreRecipes(event.newValue));
		};
		window.addEventListener("storage", update);
		return () => {
			mounted.current = false;
			window.removeEventListener("storage", update);
		};
	}, [key]);
	const commit = (rows) => {
		localStorage.setItem(key, JSON.stringify(rows));
		setRecipes(rows);
	};
	const save = (content) => {
		const latest = read();
		if (latest.some((row) => JSON.stringify(row.settings) === JSON.stringify(content.settings) && row.checkpoint === content.checkpoint && JSON.stringify(row.provenance) === JSON.stringify(content.provenance))) {
			setNote("This recipe is already saved.");
			return;
		}
		if (latest.length >= 8) throw new Error("Your eight recipe slots are full. Export or remove a recipe before saving another.");
		commit([{
			...content,
			id: createLocalId("recipe:"),
			savedAt: Date.now()
		}, ...latest]);
		setName("");
		setRemoved(null);
		setNote("Recipe saved in this browser account. No image or credentials were stored.");
	};
	const exportRecipe = (recipe) => {
		const url = URL.createObjectURL(new Blob([JSON.stringify(recipeDocument(recipe), null, 2)], { type: "application/json" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "realhub-image-recipe.json";
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	const importRecipe = async (file) => {
		if (!file) return;
		setError("");
		setNote("");
		setImporting(true);
		try {
			if (file.size > 64e3) throw new Error("Choose a recipe JSON file smaller than 64 KB.");
			const content = parseRecipe(await file.text());
			if (mounted.current) {
				save(content);
				openPreview(content);
			}
		} catch (cause) {
			if (mounted.current) setError(cause instanceof Error ? cause.message : "Recipe could not be imported. Browser storage may be full.");
		} finally {
			if (mounted.current) {
				setImporting(false);
				if (input.current) input.current.value = "";
			}
		}
	};
	const run = (action) => {
		setError("");
		setNote("");
		try {
			action();
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Recipes could not be saved.");
		}
	};
	const rename = (id) => run(() => {
		const title = newName.trim();
		if (!title) throw new Error("Enter a name for this recipe.");
		const latest = read();
		if (!latest.some((row) => row.id === id)) throw new Error("This recipe was removed in another tab.");
		commit(latest.map((row) => row.id === id ? {
			...row,
			name: title.slice(0, 80)
		} : row));
		setEditing(null);
		setNote("Recipe renamed. Its image settings are unchanged.");
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Saved image recipes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Keep up to eight sets of prompts and settings in this browser account. Export a recipe to keep it elsewhere; importing never starts generation. Review a recipe and choose an installed model before loading. Pixel identity can differ across engines, hardware and versions." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row sm:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "min-w-0 flex-1 space-y-2 text-sm",
						children: ["Recipe name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Recipe name",
							maxLength: 80,
							value: name,
							onChange: (event) => setName(event.target.value),
							placeholder: "Optional name for your latest image"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: disabled || !result || importing,
						onClick: () => run(() => {
							if (result) save({
								...result,
								name: name.trim() || result.name
							});
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkPlus, { className: "size-4" }), "Save image recipe"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						recipes.length,
						" of ",
						8,
						" slots used. A recipe stores settings, not the image itself."
					]
				}),
				recipes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: recipes.map((recipe) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "space-y-3 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "break-words font-medium",
									children: recipe.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs leading-5 text-muted",
									children: [
										recipe.settings.size,
										" × ",
										recipe.settings.size,
										" · ",
										recipe.settings.steps,
										" steps · seed ",
										recipe.settings.seed === -1 ? "random" : recipe.settings.seed
									]
								}),
								recipe.provenance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 break-words text-xs leading-5 text-muted",
									children: [
										recipe.provenance.engine,
										" · sampler ",
										recipe.provenance.sampler ?? "unrecorded",
										" · scheduler ",
										recipe.provenance.scheduler ?? "unrecorded",
										" · guidance ",
										recipe.provenance.guidance ?? "unrecorded",
										recipe.provenance.sha256 ? " · recorded SHA-256" : recipe.provenance.engineHash ? " · engine hash" : " · hash unrecorded"
									]
								}),
								recipe.checkpoint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 break-words text-xs leading-5 text-muted",
									children: ["Checkpoint: ", recipe.checkpoint]
								})
							] }),
							editing === recipe.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 rounded-lg border border-border bg-bg p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block space-y-2 text-sm",
									children: ["New recipe name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										"aria-label": "New recipe name",
										maxLength: 80,
										value: newName,
										autoFocus: true,
										onChange: (event) => setNewName(event.target.value),
										onKeyDown: (event) => {
											if (event.key === "Enter") {
												event.preventDefault();
												rename(recipe.id);
											}
											if (event.key === "Escape") setEditing(null);
										}
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => rename(recipe.id),
										children: "Save recipe name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										onClick: () => setEditing(null),
										children: "Cancel rename"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										disabled,
										"aria-label": `Use recipe ${recipe.name}`,
										onClick: () => openPreview(recipe),
										children: "Use recipe"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										"aria-label": `Export recipe ${recipe.name}`,
										onClick: () => exportRecipe(recipe),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export JSON"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										"aria-label": `Rename recipe ${recipe.name}`,
										onClick: () => {
											setEditing(recipe.id);
											setNewName(recipe.name);
											setError("");
										},
										children: "Rename"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										"aria-label": `Remove recipe ${recipe.name}`,
										onClick: () => run(() => {
											commit(read().filter((row) => row.id !== recipe.id));
											setRemoved(recipe);
											setNote("Recipe removed. You can undo this removal.");
										}),
										children: "Remove"
									})
								]
							})
						]
					}, recipe.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-3 text-sm leading-6 text-muted",
					children: "Generate an image and save its recipe to reuse its prompt, settings and actual seed later."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardFooter, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: input,
					className: "sr-only",
					"aria-label": "Import image recipe file",
					type: "file",
					disabled: disabled || importing,
					accept: ".json,application/json",
					onChange: (event) => void importRecipe(event.target.files?.[0])
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					disabled: importing || disabled,
					onClick: () => input.current?.click(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), importing ? "Importing…" : "Import recipe JSON"]
				}),
				removed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					onClick: () => run(() => {
						const latest = read();
						if (latest.length >= 8) throw new Error("Remove another recipe to free a slot for undo.");
						if (!latest.some((row) => row.id === removed.id)) commit([removed, ...latest]);
						setRemoved(null);
						setNote("Recipe restored.");
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" }), "Undo removal"]
				})
			] }),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "px-5 text-sm leading-6 text-muted",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "px-5 text-sm leading-6 text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!preview,
				onOpenChange: (open) => {
					if (!open) setPreview(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-[80] bg-bg/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "fixed top-1/2 left-1/2 z-[81] flex max-h-[90dvh] w-[min(38rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-lift outline-none",
					onCloseAutoFocus: (event) => {
						event.preventDefault();
						if (previewOrigin.current?.isConnected) previewOrigin.current.focus({ preventScroll: true });
						else input.current?.focus();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0 pr-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "font-display text-xl",
								children: "Review image recipe"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "mt-2 text-sm leading-6 text-muted",
								children: "Preview the recorded settings before changing your form. Loading never starts generation or installs a model."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "absolute top-2 right-2 min-h-11 min-w-11",
								"aria-label": "Close recipe review",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-h-0 space-y-4 overflow-y-auto",
							children: preview && plan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "break-words font-medium",
									children: preview.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "grid grid-cols-2 gap-3 text-xs leading-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "Recorded engine / size"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
										plan.sourceEngine,
										" · ",
										preview.settings.size,
										" × ",
										preview.settings.size
									] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "Steps / seed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
										preview.settings.steps,
										" · ",
										preview.settings.seed
									] })] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "break-words text-xs leading-5 text-muted",
									children: [
										"Recorded model: ",
										plan.expected ?? "Unrecorded",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"Revision: ",
										preview.provenance?.revision ?? "Unrecorded",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"SHA-256: ",
										preview.provenance?.sha256 ?? "Unrecorded (a recorded install digest is not a new file verification)",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"Engine hash: ",
										preview.provenance?.engineHash ?? "Unrecorded"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
										className: "min-h-11 cursor-pointer py-3 text-sm",
										children: "Prompt and negative prompt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "whitespace-pre-wrap break-words text-sm",
										children: preview.settings.prompt
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 whitespace-pre-wrap break-words text-xs text-muted",
										children: preview.settings.negative || "No negative prompt"
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block space-y-2 text-sm",
									children: ["Model for this recipe", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										"aria-label": "Recipe model choice",
										className: "min-h-11 w-full rounded-md border border-border bg-bg px-3",
										value: plan.chosen ?? "",
										onChange: (event) => {
											setSelection(event.target.value);
											setAcknowledged(false);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Choose an installed model"
										}), models.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: name,
											children: name
										}, name))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs leading-5 text-muted",
									children: [
										"Current form engine: ",
										engine,
										". Check the local engine to list models. Any chosen model still needs a compatible header review before generation."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs leading-5 text-muted",
									children: [
										"Parameters this form supports: ",
										plan.supported.sampler,
										" / ",
										plan.supported.scheduler,
										" · guidance ",
										plan.supported.guidance,
										" · denoise ",
										plan.supported.denoise,
										". Only prompt, negative prompt, steps, seed, square size and your chosen model are loaded."
									]
								}),
								plan.warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 rounded-lg border border-border bg-bg p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										"aria-label": "Recipe compatibility warnings",
										className: "list-disc space-y-2 pl-4 text-xs leading-5 text-muted",
										children: plan.warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: w }, w))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex min-h-11 items-center gap-3 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: acknowledged,
											onChange: (event) => setAcknowledged(event.target.checked)
										}), "I understand the listed differences and supported parameters"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-5 text-muted",
									children: "The same settings can produce different pixels with different weights, engine versions or hardware."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									disabled: disabled || !plan.canLoad || plan.warnings.length > 0 && !acknowledged,
									onClick: () => {
										if (plan.settings) {
											onReuse(plan.settings);
											setPreview(null);
											setNote("Reviewed recipe loaded into the form. No generation was started. Review the chosen model before generating.");
										}
									},
									children: "Load reviewed recipe"
								})
							] })
						})
					]
				})] })
			})
		]
	});
}
function document$1(owner, kind, parse, empty) {
	if (!owner) throw Error("A current app user is required.");
	const key = "studio:v1:" + encodeURIComponent(owner) + ":" + kind;
	let timestamp = 0;
	return {
		async load() {
			const candidates = [];
			let warning = "", present = false;
			try {
				const text = localStorage.getItem(key);
				if (text) {
					present = true;
					candidates.push(parse(JSON.parse(text)));
				}
			} catch {
				warning = "A local studio record could not be read.";
			}
			try {
				const raw = await readWorkspaceDocument(key);
				if (raw) {
					present = true;
					candidates.push(parse(raw));
				}
			} catch {
				warning = "The disk studio record could not be read.";
			}
			if (!candidates.length && present) throw Error("Saved studio data is unreadable. Export your current work before replacing it.");
			const value = candidates.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? empty;
			timestamp = value.updatedAt;
			return {
				value,
				warning
			};
		},
		async save(raw) {
			const value = parse({
				...raw,
				updatedAt: Math.max(Date.now(), timestamp + 1, raw.updatedAt)
			});
			let local = false, disk = false;
			try {
				localStorage.setItem(key, JSON.stringify(value));
				local = true;
			} catch {}
			try {
				await saveWorkspaceDocuments([{
					key,
					value
				}]);
				disk = true;
			} catch {}
			if (!local && !disk) throw Error("Studio storage failed. Nothing new was submitted; retry the save or export your work.");
			timestamp = value.updatedAt;
			return {
				value,
				warning: local && disk ? "" : local ? "Saved in the local mirror only; disk storage is unavailable." : "Saved on disk only; the local mirror is unavailable."
			};
		}
	};
}
var modelNotesDocument = (owner) => document$1(owner, "model-notes", readModelNotes, EMPTY_MODEL_NOTES);
function studioJobsDocument(owner) {
	const doc = document$1(owner, "jobs", readStudioJobs, EMPTY_STUDIO_JOBS);
	return {
		load: async () => (await doc.load()).value.jobs,
		save: async (jobs) => {
			return (await doc.save({
				version: 1,
				updatedAt: Date.now(),
				jobs
			})).warning;
		}
	};
}
var blank = {
	version: 1,
	url: "https://huggingface.co/Comfy-Org/Qwen-Image-2.1",
	revision: "",
	file: "",
	license: "",
	family: "unknown",
	engine: "unknown",
	role: "pipeline",
	requirements: "",
	hardware: ""
};
var select = "min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg";
function StudioModelRequirements({ owner, review }) {
	const doc = (0, import_react.useMemo)(() => modelNotesDocument(owner), [owner]), alive = (0, import_react.useRef)(true);
	const [ledger, setLedger] = (0, import_react.useState)(EMPTY_MODEL_NOTES), [draft, setDraft] = (0, import_react.useState)(blank), [staged, setStaged] = (0, import_react.useState)(null), [source, setSource] = (0, import_react.useState)(""), [notice, setNotice] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), [ready, setReady] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false), [page, setPage] = (0, import_react.useState)(0), [retry, setRetry] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		alive.current = true;
		doc.load().then(({ value, warning }) => {
			if (alive.current) {
				setLedger(value);
				setNotice(warning);
				setReady(true);
			}
		}).catch((e) => {
			if (alive.current) setError(e.message);
		});
		return () => {
			alive.current = false;
		};
	}, [doc, retry]);
	const change = (key, value) => {
		setDraft((current) => ({
			...current,
			[key]: value
		}));
		setStaged(null);
		setError("");
	};
	const stage = (value) => {
		try {
			const note = parseModelNote(value);
			setDraft(note);
			setStaged(note);
			setError("");
			setNotice("Review the checklist before saving. Text is data; no commands, downloads or engine changes will run.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Invalid requirements note.");
		}
	};
	const commit = async (next) => {
		setBusy(true);
		setError("");
		try {
			const result = await doc.save(next);
			if (alive.current) {
				setLedger(result.value);
				setNotice(result.warning || "Requirements saved for this app user. Compatibility still requires the installed-file preflight.");
				setStaged(null);
			}
		} catch (e) {
			if (alive.current) setError(e instanceof Error ? e.message : "Save failed; retry with the current form.");
		} finally {
			if (alive.current) setBusy(false);
		}
	};
	const download = (note) => {
		const url = URL.createObjectURL(new Blob([JSON.stringify(parseModelNote(note), null, 2)], { type: "application/json" })), link = document.createElement("a");
		link.href = url;
		link.download = "realhub-model-requirements.json";
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5 space-y-4 rounded-lg border border-border bg-surface p-5",
		"aria-label": "Model requirements notes",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold text-fg",
				children: "Model requirements notebook"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "Keep up to 64 owner-reviewed notes. A filename, model card or saved note cannot prove engine compatibility. Unknown architectures and ambiguous revisions stay unverified."
			}),
			review && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => {
					setDraft({
						...blank,
						url: review.source?.url ?? blank.url,
						revision: review.source?.revision ?? "",
						file: review.name,
						family: [
							"sd1",
							"sdxl",
							"qwen-image-2.1"
						].includes(review.family) ? review.family : "unknown",
						engine: review.engine,
						role: MODEL_ROLES.includes(review.role) ? review.role : "pipeline"
					});
					setStaged(null);
				},
				children: "Start note from inspected file"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					[
						["url", "Canonical model URL"],
						["revision", "Model revision / commit"],
						["file", "Exact model filename"],
						["license", "Model license"],
						["hardware", "Hardware requirements / estimates"]
					].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-2 text-sm",
						children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": label,
							value: draft[key],
							maxLength: key === "url" ? 2048 : key === "hardware" ? 500 : key === "license" ? 200 : 180,
							onChange: (e) => change(key, e.target.value)
						})]
					}, key)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-2 text-sm",
						children: ["Model family", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Requirements model family",
							className: select,
							value: draft.family,
							onChange: (e) => change("family", e.target.value),
							children: [
								"unknown",
								"sd1",
								"sdxl",
								"qwen-image-2.1",
								"other"
							].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-2 text-sm",
						children: ["Required engine", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Requirements engine",
							className: select,
							value: draft.engine,
							onChange: (e) => change("engine", e.target.value),
							children: [
								"unknown",
								"a1111",
								"comfy",
								"other"
							].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-2 text-sm",
						children: ["Artifact role", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Requirements artifact role",
							className: select,
							value: draft.role,
							onChange: (e) => change("role", e.target.value),
							children: MODEL_ROLES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: v }, v))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block space-y-2 text-sm",
				children: ["Required components / model-card notes", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					"aria-label": "Required components and model-card notes",
					rows: 4,
					maxLength: 4e3,
					value: draft.requirements,
					onChange: (e) => change("requirements", e.target.value),
					className: select + " py-3"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "Checkpoint = full model. LoRA = add-on. VAE = image decoder. Text encoder = prompt reader. A diffusion model or pipeline needs its matching components and engine. Never paste account tokens. Imported text is displayed as plain data."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => stage(draft),
						children: "Review requirements"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: !staged || !ready || busy,
						onClick: () => {
							try {
								if (staged) commit(saveModelNote(ledger, staged));
							} catch (e) {
								setError(String(e));
							}
						},
						children: "Save reviewed requirements"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						disabled: !staged,
						onClick: () => staged && download(staged),
						children: "Export reviewed note"
					})
				]
			}),
			staged && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"aria-label": "Model requirements checklist",
				className: "space-y-3 rounded-md bg-bg p-4 text-sm",
				children: modelNoteChecklist(staged, review ?? void 0).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
					row.label,
					" · ",
					row.verified ? "Evidence recorded" : "Unverified"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: row.detail
				})] }, row.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer py-3",
						children: "Import requirements JSON for review"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						"aria-label": "Model requirements JSON",
						value: source,
						onChange: (e) => setSource(e.target.value),
						rows: 4,
						maxLength: MODEL_NOTE_BYTES,
						className: select + " py-3 font-mono text-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3",
						onClick: () => {
							try {
								stage(importModelNote(source));
							} catch (e) {
								setError(e instanceof Error ? e.message : "Invalid note.");
							}
						},
						children: "Review imported requirements"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block text-sm",
						children: ["Or import a note file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": "Import model requirements file",
							type: "file",
							accept: ".json,application/json",
							className: "mt-2 block max-w-full text-xs",
							onChange: (e) => {
								const file = e.target.files?.[0];
								e.target.value = "";
								if (!file) return;
								if (file.size > 32e3) {
									setError("Choose a note smaller than 32 KB.");
									return;
								}
								file.text().then((text) => {
									if (alive.current) {
										setSource(text);
										stage(importModelNote(text));
									}
								}).catch((e) => {
									if (alive.current) setError(e.message);
								});
							}
						})]
					})
				]
			}),
			!ready && error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => {
					setError("");
					setRetry((n) => n + 1);
				},
				children: "Retry notebook load"
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm text-muted",
				children: notice
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [ledger.notes.length, "/64 saved notes · local to this user’s browser workspace. Export a note to keep it elsewhere."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"aria-label": "Saved model requirements",
				className: "space-y-3",
				children: ledger.notes.slice(page * 4, page * 4 + 4).map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "space-y-2 rounded-md border border-border p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-all text-sm font-medium",
							children: note.file || note.url
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								note.family,
								" · ",
								note.role,
								" · ",
								note.revision || "revision unverified"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => stage(note),
									children: "Review saved note"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: () => download(note),
									children: "Export note"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									disabled: busy,
									onClick: () => void commit({
										...ledger,
										updatedAt: Math.max(Date.now(), ledger.updatedAt + 1),
										notes: ledger.notes.filter((n) => n !== note)
									}),
									children: "Remove note"
								})
							]
						})
					]
				}, note.url + "|" + note.file + "|" + note.revision))
			}),
			ledger.notes.length > 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					disabled: page === 0,
					onClick: () => setPage((n) => n - 1),
					children: "Newer notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					disabled: (page + 1) * 4 >= ledger.notes.length,
					onClick: () => setPage((n) => n + 1),
					children: "Older notes"
				})]
			})
		]
	});
}
function StudioJobHistory({ jobs, busy, onReuse }) {
	const [page, setPage] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Generation job history",
		className: "mt-5 space-y-4 rounded-lg border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold text-fg",
				children: "Generation jobs"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "Eight recent parameter/outcome receipts per app user. Reload never resubmits a request. This bridge cannot reconnect a browser to an unfinished engine request; interrupted outcomes need a manual engine check. Native ComfyUI IDs, when returned, are references rather than reconnect permission."
			}),
			!jobs.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Your first explicit generation will appear here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-3",
				children: jobs.slice(page * 4, page * 4 + 4).map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-studio-job": job.status,
					className: "space-y-2 rounded-md border border-border bg-bg p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-sm",
								children: job.status
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: new Date(job.updatedAt).toLocaleString()
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-words text-sm",
							children: job.settings.prompt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-words text-xs text-muted",
							children: [
								job.settings.engine ?? "a1111",
								" · ",
								job.settings.model ?? "engine default",
								" · ",
								job.settings.steps,
								" steps · ",
								job.settings.size,
								" × ",
								job.settings.size,
								" · seed ",
								job.output?.seed ?? job.settings.seed
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-muted",
							children: job.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-all text-xs text-muted",
							children: [
								"Local intent: ",
								job.id,
								job.engineJobId ? " · Engine job: " + job.engineJobId : " · Engine job ID unavailable"
							]
						}),
						job.output && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Output preview was session-only; downloaded files and saved recipes are separate. This receipt does not restore image bytes after reload."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: busy,
							onClick: () => onReuse({ ...job.settings }),
							children: "Load job parameters"
						})
					]
				}, job.id))
			}),
			jobs.length > 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					disabled: !page,
					onClick: () => setPage((n) => n - 1),
					children: "Newer jobs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					disabled: (page + 1) * 4 >= jobs.length,
					onClick: () => setPage((n) => n + 1),
					children: "Older jobs"
				})]
			})
		]
	});
}
var getSession = createStudioSessions((path, body) => localTool(path, body), studioJobsDocument);
function StableDiffusionSection() {
	const { user, isPending } = useCurrentUserState();
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-6 text-muted",
		children: isPending ? "Loading your workspace…" : "Sign in through this app to use the local studio."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioWorkspace, { owner: user.id }, user.id);
}
function StudioWorkspace({ owner }) {
	const session = getSession(owner);
	const work = (0, import_react.useSyncExternalStore)(session.subscribe, session.getSnapshot, session.getSnapshot);
	(0, import_react.useEffect)(() => {
		session.hydrate();
	}, [session]);
	const [candidate, setCandidate] = (0, import_react.useState)(""), [review, setReview] = (0, import_react.useState)(null), [reviewing, setReviewing] = (0, import_react.useState)(false);
	const modelName = (value) => value.replace(/ \[[a-f0-9]+\]$/i, "");
	const settingsKey = `reelcase.studio.settings.v1:${encodeURIComponent(owner)}`;
	const [settings, setSettings] = (0, import_react.useState)(() => {
		try {
			return studioSettings(JSON.parse(localStorage.getItem(settingsKey) ?? "null"), localStorage.getItem(`reelcase.studio.prompt.v1:${encodeURIComponent(owner)}`) ?? "");
		} catch {
			return { ...DEFAULT_STUDIO_SETTINGS };
		}
	});
	const [engineStatus, setStatus] = (0, import_react.useState)(null);
	const status = engineStatus?.engine === (settings.engine ?? "a1111") ? engineStatus : null;
	const [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), [saveError, setSaveError] = (0, import_react.useState)("");
	const { busy, interrupting } = work;
	const [checking, setChecking] = (0, import_react.useState)(false), [imageUrl, setImageUrl] = (0, import_react.useState)("");
	const image = work.image ? {
		...work.image,
		url: imageUrl
	} : null;
	const mounted = (0, import_react.useRef)(true);
	const latestSettings = (0, import_react.useRef)(settings), saved = (0, import_react.useRef)(JSON.stringify(settings));
	latestSettings.current = settings;
	const persist = (report) => {
		const value = JSON.stringify(latestSettings.current);
		if (value === saved.current) return;
		try {
			localStorage.setItem(settingsKey, value);
			saved.current = value;
			if (report) setSaveError("");
		} catch {
			if (report) setSaveError("Settings could not be saved in this browser. You can still download your image.");
		}
	};
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!work.image) {
			setImageUrl("");
			return;
		}
		const url = URL.createObjectURL(work.image.blob);
		setImageUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [work.image]);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => persist(true), 500);
		return () => clearTimeout(timer);
	}, [settings, settingsKey]);
	(0, import_react.useEffect)(() => {
		const save = () => persist(false);
		window.addEventListener("pagehide", save);
		return () => {
			save();
			window.removeEventListener("pagehide", save);
		};
	}, [settingsKey]);
	const update = (key, value) => setSettings((previous) => ({
		...previous,
		[key]: value
	}));
	const inspectModel = async (model, engine = settings.engine ?? "a1111") => {
		setReviewing(true);
		setError("");
		try {
			const result = readModelPreflight(await localTool("/studio/models/preflight", {
				engine,
				model
			}));
			if (result.version !== 1 || result.engine !== engine || result.name !== modelName(model) || !Array.isArray(result.checks) || !result.checks.length) throw Error("Companion returned an unsupported compatibility report.");
			if (mounted.current) setReview(result);
		} catch (cause) {
			if (mounted.current) {
				setReview(null);
				setError(cause instanceof Error ? cause.message : "Model review failed. Your selected model was preserved.");
			}
		} finally {
			if (mounted.current) setReviewing(false);
		}
	};
	const check = async () => {
		setChecking(true);
		setError("");
		try {
			const next = await localTool(settings.engine === "comfy" ? "/studio/qwen/status" : "/studio/status");
			if (mounted.current) {
				setStatus({
					...next,
					engine: settings.engine ?? "a1111"
				});
				const choice = settings.model && next.models.includes(settings.model) ? settings.model : next.models[0] ?? "";
				setCandidate(choice);
				setReview(null);
				if (choice && next.modelPreflight) await inspectModel(choice);
				else if (next.ready) setError("Update Companion for model compatibility preflight before generating. Existing images and settings are preserved.");
			}
		} catch (cause) {
			if (mounted.current) {
				setStatus(null);
				setError(cause instanceof Error ? cause.message : "Could not check the local engine.");
			}
		} finally {
			if (mounted.current) setChecking(false);
		}
	};
	const engineAction = async (action) => {
		setChecking(true);
		setError("");
		try {
			const result = await localTool(`/studio/${settings.engine === "comfy" ? "qwen/" : ""}${action}`, {});
			if (mounted.current) setNote(result.note);
			const next = await localTool(settings.engine === "comfy" ? "/studio/qwen/status" : "/studio/status");
			if (mounted.current) setStatus({
				...next,
				engine: settings.engine ?? "a1111"
			});
		} catch (cause) {
			if (mounted.current) setError(cause instanceof Error ? cause.message : "Engine action failed.");
		} finally {
			if (mounted.current) setChecking(false);
		}
	};
	const generate = async () => {
		if (busy || !canGenerate || studioSettingsError(settings)) return;
		setError("");
		setNote("");
		await session.generate(settings, review ?? void 0);
	};
	const interrupt = () => session.interrupt();
	const validation = studioSettingsError(settings);
	const canGenerate = work.ready && !!status?.ready && !!settings.model && review?.ready === true && review.engine === (settings.engine ?? "a1111") && review.name === modelName(settings.model);
	const engineLabel = busy ? interrupting ? "Stopping generation" : "Generating locally" : canGenerate ? "Connected · reviewed model ready" : status?.connectionIssue === "authentication" ? "API authentication required" : status?.connectionIssue === "engine" ? "Engine needs attention" : status?.ownedEngine ? "Engine starting" : status?.connected ? status.ready ? "API connected · model review required" : "API connected · no checkpoint loaded" : status ? "Not connected" : "Not checked";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Local image studio",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-4" }),
		title: "Stable Diffusion",
		copy: "Generate with local Qwen-Image 2.1 or AUTOMATIC1111. Your latest result stays available as you move around the app. Download images before reloading or closing this browser tab.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-5 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Text to image" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Describe an image, check the engine, then generate. One image at a time with your selected model." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-2 text-sm",
							children: ["Image engine", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Image engine",
								disabled: busy || checking || reviewing,
								value: settings.engine ?? "a1111",
								onChange: (e) => {
									setSettings((previous) => ({
										...previous,
										engine: e.target.value,
										model: void 0,
										steps: e.target.value === "comfy" ? 8 : 20
									}));
									setStatus(null);
									setReview(null);
									setCandidate("");
									setError("");
								},
								className: "min-h-11 w-full rounded-md border border-border bg-bg px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "a1111",
									children: "Stable Diffusion · AUTOMATIC1111"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "comfy",
									children: "Qwen-Image 2.1 · ComfyUI"
								})]
							})]
						}),
						Boolean(status?.models.length) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "space-y-3 rounded-md border border-border bg-bg p-3",
							"aria-label": "Model compatibility review",
							"data-model-preflight": review?.ready ? "ready" : review ? "blocked" : "unreviewed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block space-y-2 text-sm",
									children: ["Model to inspect", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										"aria-label": "Selected image model",
										disabled: busy || checking || reviewing,
										value: candidate,
										onChange: (e) => {
											setCandidate(e.target.value);
											setReview(null);
										},
										className: "min-h-11 w-full rounded-md border border-border bg-bg px-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Choose an exact model"
										}), status?.models.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: model,
											children: model
										}, model))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "break-words text-xs text-muted",
									children: [
										"Current selected model: ",
										settings.model ?? "None reviewed yet",
										". Inspecting a different file does not replace it."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										disabled: busy || reviewing || !candidate || !status?.modelPreflight,
										onClick: () => void inspectModel(candidate),
										children: reviewing ? "Inspecting headers…" : "Review selected model"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										disabled: busy || reviewing || !review?.ready || review.name !== modelName(candidate),
										onClick: () => update("model", candidate),
										children: "Use reviewed model"
									})]
								}),
								review && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-medium",
											children: [
												review.ready ? "Compatible model structure" : "Model blocked",
												" · ",
												review.family,
												" · ",
												review.role
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											"aria-label": "Model compatibility checklist",
											className: "space-y-2 text-xs leading-5 text-muted",
											children: review.checks.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: item.state === "fail" ? "text-danger" : "text-fg",
													children: [
														item.label,
														": ",
														item.state
													]
												}),
												" · ",
												item.detail
											] }, i))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs leading-5 text-muted",
											children: [
												"Weights: ",
												review.hardware.weightsGiB,
												" GiB. ",
												review.hardware.note
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: "Header compatibility does not prove successful generation on this hardware."
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-2 text-sm",
							children: ["Prompt", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								"aria-label": "Image prompt",
								maxLength: 4e3,
								value: settings.prompt,
								onChange: (e) => update("prompt", e.target.value),
								placeholder: "A quiet forest at sunrise, watercolor illustration…",
								className: "min-h-32 w-full rounded-md border border-border bg-bg p-3 text-fg"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-2 text-sm",
							children: ["Negative prompt", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"aria-label": "Negative prompt",
								maxLength: 4e3,
								value: settings.negative,
								onChange: (e) => update("negative", e.target.value),
								placeholder: "Things to leave out (optional)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "space-y-2 text-sm",
								children: ["Steps", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Generation steps",
									type: "number",
									min: 1,
									max: 40,
									step: 1,
									value: Number.isNaN(settings.steps) ? "" : settings.steps,
									onChange: (e) => update("steps", e.target.value === "" ? NaN : Number(e.target.value)),
									"aria-invalid": !Number.isInteger(settings.steps) || settings.steps < 1 || settings.steps > 40
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "space-y-2 text-sm",
								children: ["Seed", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Generation seed",
									type: "number",
									min: -1,
									max: 2147483647,
									step: 1,
									value: Number.isNaN(settings.seed) ? "" : settings.seed,
									onChange: (e) => update("seed", e.target.value === "" ? NaN : Number(e.target.value)),
									"aria-invalid": !Number.isInteger(settings.seed) || settings.seed < -1 || settings.seed > 2147483647
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-muted",
							children: "Use −1 for a random seed. More steps and larger images take longer. Keep the same checkpoint to reproduce a result."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-2 text-sm",
							children: ["Image size", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								"aria-label": "Image size",
								value: settings.size,
								onChange: (e) => update("size", Number(e.target.value)),
								className: "min-h-11 w-full rounded-md border border-border bg-bg px-3",
								children: [
									256,
									512,
									768
								].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: n,
									children: [
										n,
										" × ",
										n
									]
								}, n))
							})]
						}),
						validation && settings.prompt.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							role: "alert",
							children: validation
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy || checking || reviewing || !canGenerate || status?.busy || Boolean(validation),
						onClick: () => void generate(),
						children: busy ? "Generating…" : "Generate image"
					}), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						disabled: interrupting,
						onClick: () => void interrupt(),
						children: interrupting ? "Stopping generation…" : "Interrupt generation"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: () => setSettings((previous) => ({
							...DEFAULT_STUDIO_SETTINGS,
							prompt: previous.prompt,
							engine: previous.engine,
							model: previous.model,
							steps: previous.engine === "comfy" ? 8 : 20
						})),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Reset settings"]
					})] }),
					!status?.ready && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-5 text-xs leading-5 text-muted",
						children: "Check the local engine to enable generation."
					}),
					status?.busy && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-5 text-xs leading-5 text-muted",
						children: "Companion has a generation in progress. Check again when it finishes."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: canGenerate ? "solid" : "default",
								children: engineLabel
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Local engine" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: status?.ownedEngine && !status.connected ? "First start can take a few minutes. Check again when the engine has loaded." : status?.note || "Status checks run only when requested. Nothing is sent to a cloud image service." })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [status?.models?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-words text-xs leading-5 text-muted",
							children: ["Available models: ", status.models.join(", ")]
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "min-h-11 cursor-pointer py-3 text-fg",
								children: "Setup and connection details"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 pb-3 text-xs leading-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Install-Qwen.cmd prepares the Qwen / ComfyUI runtime. Start and stop the selected engine here. Stop one image engine before starting the other. Start-Stable-Diffusion.cmd starts AUTOMATIC1111. Install-Stable-Diffusion.cmd prepares a fresh Windows/NVIDIA runtime, CUDA PyTorch and a verified SD 1.5 checkpoint. Setup downloads several gigabytes once." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "AUTOMATIC1111 stays on 127.0.0.1:7860; Qwen / ComfyUI stays on 127.0.0.1:8189 with custom nodes and cloud API nodes disabled. API credentials are configured server-side with REELCASE_SD_API_AUTH. Public sharing and extra extensions stay disabled." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Moving to another app tab keeps your latest result and any running request in memory. Reloading or closing this browser tab clears them. Interrupt generation here if you want the GPU job to stop." })
								]
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardFooter, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: checking || busy || reviewing,
								onClick: () => void check(),
								children: checking ? "Checking…" : "Check local engine"
							}),
							status?.canStart && !status.connected && !status.ownedEngine && !status.connectionIssue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy || checking,
								onClick: () => void engineAction("start"),
								children: "Start local engine"
							}),
							status?.ownedEngine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								disabled: checking || busy,
								onClick: () => void engineAction("stop"),
								children: "Stop local engine"
							}),
							settings.engine === "comfy" && status?.connected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: busy || checking,
								onClick: () => void (async () => {
									try {
										const result = await localTool("/studio/qwen/free", {});
										setNote(result.note);
									} catch (cause) {
										setError(cause instanceof Error ? cause.message : "Memory release failed.");
									}
								})(),
								children: "Release model memory"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: settings.engine === "comfy" ? "http://127.0.0.1:8189" : "http://127.0.0.1:7860",
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex min-h-11 items-center gap-2 text-sm text-accent",
								children: ["Open full WebUI", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
							})
						] })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: image ? "Generated image" : "Your next image" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: image ? "These settings describe this image, even if you edit the form." : "Your result will appear here. Downloaded images stay on your computer." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: image.url || void 0,
								alt: image.settings.prompt.slice(0, 150),
								width: image.settings.size,
								height: image.settings.size,
								className: "w-full rounded-lg"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid grid-cols-2 gap-3 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Size / steps"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "mt-1",
									children: [
										image.settings.size,
										" × ",
										image.settings.size,
										" · ",
										image.settings.steps,
										" steps"
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Seed / duration"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "mt-1",
									children: [
										image.seed ?? "Not supplied",
										" · ",
										image.seconds,
										"s"
									]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "break-words text-sm leading-6 text-muted",
								children: image.settings.prompt
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-6 text-center text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-xs text-sm leading-6",
								children: "Start with a subject, a style and a few details about the light or setting."
							})]
						}) }),
						image && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardFooter, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								download: "realhub-stable-diffusion.png",
								href: image.url,
								className: "inline-flex min-h-11 items-center gap-2 text-sm text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download PNG"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: busy,
								onClick: () => setSettings({
									...image.settings,
									seed: image.seed ?? image.settings.seed
								}),
								children: "Reuse image settings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: busy,
								onClick: session.clearImage,
								children: "Clear image"
							})
						] })
					] })]
				})]
			}),
			work.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-4 text-sm leading-6 text-muted",
				children: work.note
			}),
			work.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 text-sm leading-6 text-danger",
				children: work.error
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-4 text-sm leading-6 text-muted",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 text-sm leading-6 text-danger",
				children: error
			}),
			saveError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 text-sm leading-6 text-danger",
				children: saveError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioModelLibrary, {
				disabled: busy || checking || reviewing,
				onInstalled: () => void (async () => {
					if (settings.engine !== "comfy" && status?.connected) await localTool("/studio/refresh", {}).catch(() => {});
					await check();
				})()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioModelRequirements, {
				owner,
				review
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioJobHistory, {
				jobs: work.jobs,
				busy,
				onReuse: setSettings
			}),
			(!work.ready || work.saveError) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-md border border-border p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm text-danger",
					children: work.saveError || "Job history is not ready. Recover it before generating."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					disabled: busy,
					onClick: () => void (work.ready ? session.retrySave() : session.hydrate()),
					children: "Retry job history"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioRecipes, {
				owner,
				disabled: busy,
				result: image ? {
					name: image.settings.prompt.trim().slice(0, 80),
					settings: {
						...image.settings,
						seed: image.seed ?? image.settings.seed
					},
					checkpoint: image.checkpoint,
					provenance: image.provenance
				} : void 0,
				engine: settings.engine ?? "a1111",
				models: status?.models ?? [],
				review: review ?? void 0,
				onReuse: setSettings
			})
		]
	});
}
//#endregion
export { StableDiffusionSection };
