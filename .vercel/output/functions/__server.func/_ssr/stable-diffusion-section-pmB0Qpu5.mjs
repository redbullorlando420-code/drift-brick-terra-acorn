import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $t as BookmarkPlus, Ft as ExternalLink, Lt as Download, M as RotateCcw, _t as ImagePlus, c as Upload, ht as Images, l as Undo2 } from "../_libs/lucide-react.mjs";
import { t as COMPANION_ORIGIN } from "./companion-C8xPNDAD.mjs";
import { $ as Button, En as createLocalId, Q as Input } from "./library-app-BtCPS7Tj.mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, s as HubShell, t as Card } from "./hub-shared-CSaQ1YXN.mjs";
import { n as localTool, t as Badge } from "./local-tools-bCy5StpP.mjs";
import { t as useCurrentUserState } from "./use-current-user-BNDPe2yv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stable-diffusion-section-pmB0Qpu5.js
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
							"For your 16 GB NVIDIA GPU, start with ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Qwen-Image 2.1 Turbo INT8 ConvRot" }),
							", ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "qwen3vl_8b_w4a8" }),
							" and the matching ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Qwen 2.1 VAE BF16" }),
							". The bundle installs all three (about 14.25 GB). Use the Qwen / ComfyUI engine, 8 steps and 512 × 512 for the first image. Larger images need more GPU memory and time."
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
function recipeDocument(recipe) {
	return {
		format: "realhub-studio-recipe",
		version: 1,
		name: recipe.name,
		settings: { ...recipe.settings },
		...recipe.checkpoint ? { checkpoint: recipe.checkpoint } : {}
	};
}
/** Imports are an allow-list of form values, never native engine instructions. */
function parseRecipe(text) {
	if (text.length > 64e3) throw new Error("Choose a recipe JSON file smaller than 64 KB.");
	let data;
	try {
		data = JSON.parse(text);
	} catch {
		throw new Error("This file is not valid JSON. Choose an exported Realhub image recipe.");
	}
	if (data?.format !== "realhub-studio-recipe" || data.version !== 1 || !data.settings || typeof data.settings !== "object") throw new Error("This is not a supported Realhub image recipe.");
	const row = data.settings;
	if (typeof row.prompt !== "string" || row.prompt.length > 4e3 || typeof row.negative !== "string" || row.negative.length > 4e3 || ![
		256,
		512,
		768
	].includes(row.size)) throw new Error("The recipe contains invalid prompts or image dimensions.");
	const failure = studioSettingsError(row);
	if (failure) throw new Error(failure);
	return {
		name: typeof data.name === "string" && data.name.trim() ? data.name.trim().slice(0, 80) : row.prompt.trim().slice(0, 80),
		settings: studioSettings(row),
		...typeof data.checkpoint === "string" && data.checkpoint.trim() ? { checkpoint: data.checkpoint.trim().slice(0, 200) } : {}
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
						version: 1
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
		return typeof value === "string" && value.trim() ? value.trim().slice(0, 200) : void 0;
	} catch {
		return;
	}
}
var EMPTY = {
	busy: false,
	interrupting: false,
	image: null,
	note: "",
	error: ""
};
/** One in-memory result and one user-started request. Navigation needs no polling. */
var StudioSession = class {
	state = EMPTY;
	listeners = /* @__PURE__ */ new Set();
	request;
	run = 0;
	engine = "a1111";
	constructor(request) {
		this.request = request;
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
	clearImage = () => {
		if (!this.state.busy) this.patch({
			image: null,
			error: "",
			note: "Image cleared from this app session. Downloaded files and saved recipes are unchanged."
		});
	};
	async generate(settings) {
		if (this.state.busy) return;
		const validation = studioSettingsError(settings);
		if (validation) {
			this.patch({ error: validation });
			return;
		}
		const submitted = { ...settings }, started = performance.now();
		this.run++;
		this.engine = submitted.engine ?? "a1111";
		this.patch({
			busy: true,
			interrupting: false,
			error: "",
			note: "Generating locally. You can visit another app tab and return to the result."
		});
		try {
			const result = await this.request(submitted.engine === "comfy" ? "/studio/qwen/generate" : "/studio/generate", {
				prompt: submitted.prompt,
				negativePrompt: submitted.negative,
				steps: submitted.steps,
				width: submitted.size,
				height: submitted.size,
				seed: submitted.seed,
				...submitted.model ? { model: submitted.model } : {}
			});
			if (typeof result.image !== "string" || result.image.length > 14e6) throw new Error("The image response is missing or exceeds the preview budget.");
			const bytes = Uint8Array.from(atob(result.image), (character) => character.charCodeAt(0));
			const interrupted = this.state.interrupting;
			this.patch({
				image: {
					blob: new Blob([bytes], { type: "image/png" }),
					settings: submitted,
					seed: generatedSeed(result.info, submitted.seed),
					checkpoint: generatedCheckpoint(result.info),
					seconds: Math.max(.1, Math.round((performance.now() - started) / 100) / 10)
				},
				note: interrupted ? "Generation stopped. The engine returned a partial image; you can download or discard it." : "Image ready. It stays available while you move around the app. Download it before reloading or closing this browser tab."
			});
		} catch (cause) {
			this.patch({
				note: "",
				error: cause instanceof Error ? cause.message : "Generation failed. Your previous image remains available."
			});
		} finally {
			this.patch({
				busy: false,
				interrupting: false
			});
		}
	}
	async interrupt() {
		if (!this.state.busy || this.state.interrupting) return;
		this.patch({
			interrupting: true,
			error: ""
		});
		const run = this.run;
		try {
			await this.request(this.engine === "comfy" ? "/studio/qwen/interrupt" : "/studio/interrupt", {});
			if (this.state.busy && this.run === run) this.patch({ note: "Interrupt requested. Waiting for the engine to finish stopping." });
		} catch (cause) {
			if (this.state.busy && this.run === run) this.patch({
				interrupting: false,
				error: cause instanceof Error ? cause.message : "Interrupt could not be sent."
			});
		}
	}
};
function createStudioSessions(request) {
	const sessions = /* @__PURE__ */ new Map();
	return (owner) => {
		let session = sessions.get(owner);
		if (!session) {
			if (sessions.size >= 2) sessions.delete(sessions.keys().next().value);
			session = new StudioSession(request);
		}
		sessions.delete(owner);
		sessions.set(owner, session);
		return session;
	};
}
function StudioRecipes({ owner, result, disabled, onReuse }) {
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
		if (latest.some((row) => JSON.stringify(row.settings) === JSON.stringify(content.settings) && row.checkpoint === content.checkpoint)) {
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
			if (mounted.current) save(content);
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Saved image recipes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Keep up to eight sets of prompts and settings in this browser account. Export a recipe to keep it elsewhere; importing never starts generation or changes the engine’s checkpoint." })] }),
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
										onClick: () => {
											onReuse({ ...recipe.settings });
											setNote("Recipe loaded into the form. Check the engine and use the same checkpoint before generating.");
										},
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
			})
		]
	});
}
var getSession = createStudioSessions((path, body) => localTool(path, body));
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
	const check = async () => {
		setChecking(true);
		setError("");
		try {
			const next = await localTool(settings.engine === "comfy" ? "/studio/qwen/status" : "/studio/status");
			if (mounted.current) setStatus({
				...next,
				engine: settings.engine ?? "a1111"
			});
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
			const next = await localTool("/studio/status");
			if (mounted.current) setStatus(next);
		} catch (cause) {
			if (mounted.current) setError(cause instanceof Error ? cause.message : "Engine action failed.");
		} finally {
			if (mounted.current) setChecking(false);
		}
	};
	const generate = async () => {
		if (busy || !status?.ready || studioSettingsError(settings)) return;
		setError("");
		setNote("");
		await session.generate(settings);
	};
	const interrupt = () => session.interrupt();
	const validation = studioSettingsError(settings);
	const engineLabel = busy ? interrupting ? "Stopping generation" : "Generating locally" : status?.ready ? "Connected · checkpoint ready" : status?.connectionIssue === "authentication" ? "API authentication required" : status?.connectionIssue === "engine" ? "Engine needs attention" : status?.ownedEngine ? "Engine starting" : status?.connected ? "API connected · no checkpoint loaded" : status ? "Not connected" : "Not checked";
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
								disabled: busy || checking,
								value: settings.engine ?? "a1111",
								onChange: (e) => {
									setSettings((previous) => ({
										...previous,
										engine: e.target.value,
										model: void 0,
										steps: e.target.value === "comfy" ? 8 : 20
									}));
									setStatus(null);
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
						Boolean(status?.models.length) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-2 text-sm",
							children: ["Selected model", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Selected image model",
								disabled: busy || checking,
								value: settings.model ?? "",
								onChange: (e) => update("model", e.target.value || void 0),
								className: "min-h-11 w-full rounded-md border border-border bg-bg px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Engine default"
								}), status?.models.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: model,
									children: model
								}, model))]
							})]
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
						disabled: busy || checking || !status?.ready || status.busy || Boolean(validation),
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
								variant: status?.ready ? "solid" : "default",
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
								disabled: checking || busy,
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
				disabled: busy,
				onInstalled: () => void (async () => {
					if (settings.engine !== "comfy" && status?.connected) await localTool("/studio/refresh", {}).catch(() => {});
					await check();
				})()
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
					checkpoint: image.checkpoint
				} : void 0,
				onReuse: setSettings
			})
		]
	});
}
//#endregion
export { StableDiffusionSection };
