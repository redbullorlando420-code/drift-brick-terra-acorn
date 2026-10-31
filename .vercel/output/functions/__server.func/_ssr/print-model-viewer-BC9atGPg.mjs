import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as Minimize2, N as RotateCcw, Tt as Grid3x3, _ as Sun, en as Box, it as Maximize2, n as X, st as LoaderCircle, zt as Expand } from "../_libs/lucide-react.mjs";
import { d as companionFetch } from "./companion-DacueTBp.mjs";
import { Bt as Input, Vt as Button } from "./library-app-BzjSyqkW.mjs";
import { n as loadPrintBlob, t as isViewablePrintName } from "./prints-section-Dx-vcpgU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/print-model-viewer-BC9atGPg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var printModelSignature = (edit) => JSON.stringify([
	edit.scale,
	edit.rotX,
	edit.rotY,
	edit.rotZ,
	edit.posX,
	edit.posY,
	edit.posZ,
	edit.overrideMaterial ? edit.color : null,
	edit.overrideMaterial
]);
function isSavedPrintScene(object) {
	let found = false;
	object.traverse((node) => {
		const value = node.userData?.reelcasePrint;
		if (value?.version === 1 && value.origin === "preserve") found = true;
	});
	return found;
}
function defaultPrintCopyName(name) {
	return (name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9 _().-]/gi, "_").replace(/^[^a-z0-9]+/gi, "").slice(0, 95) || "model") + "-edited.glb";
}
function validPrintCopyName(name) {
	return name.length <= 120 && /^[a-z0-9][a-z0-9 _().-]*\.glb$/i.test(name) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name);
}
async function exportPrintCopy(object, bases) {
	object.updateMatrixWorld(true);
	const arrays = /* @__PURE__ */ new Set(), textures = /* @__PURE__ */ new Set();
	let bytes = 0, pixels = 0;
	object.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh) return;
		for (const attribute of [...Object.values(mesh.geometry.attributes), ...mesh.geometry.index ? [mesh.geometry.index] : []]) {
			const array = attribute.array;
			if (!arrays.has(array.buffer)) {
				arrays.add(array.buffer);
				bytes += array.byteLength;
			}
		}
		for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) for (const value of Object.values(material)) if (value && typeof value === "object" && value.isTexture && !textures.has(value)) {
			textures.add(value);
			const image = value.image;
			pixels += Math.min(image?.width ?? 0, 2048) * Math.min(image?.height ?? 0, 2048);
		}
	});
	if (bytes > 33554432 || pixels > 16777216) throw Error("This scene exceeds the editor export budget. Use a desktop model editor for this file.");
	const clone = object.clone(true), materials = [];
	let index = 0;
	clone.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh) return;
		const base = bases[index++];
		if (base) mesh.position.copy(base.base);
		const copy = (original) => {
			const material = original.clone();
			if ("wireframe" in material) material.wireframe = false;
			materials.push(material);
			return material;
		};
		mesh.material = Array.isArray(mesh.material) ? mesh.material.map(copy) : copy(mesh.material);
	});
	clone.userData = { reelcasePrint: {
		version: 1,
		origin: "preserve",
		units: "source-units"
	} };
	clone.updateMatrixWorld(true);
	try {
		const { GLTFExporter } = await import("../_libs/three.mjs").then((n) => n.a);
		const buffer = await new GLTFExporter().parseAsync(clone, {
			binary: true,
			onlyVisible: true,
			maxTextureSize: 2048
		});
		if (!(buffer instanceof ArrayBuffer) || !buffer.byteLength || buffer.byteLength > 50331648) throw Error("The edited GLB exceeds the 48 MiB save limit.");
		return new Blob([buffer], { type: "model/gltf-binary" });
	} finally {
		materials.forEach((material) => material.dispose());
	}
}
var KEY$1 = "reelcase.print-saved-copies.v1";
function loadSavedPrintCopy(key) {
	try {
		const row = JSON.parse(localStorage.getItem(KEY$1) || "{}")[key];
		return row && typeof row.signature === "string" && row.signature.length < 512 && row.receipt?.status === "done" && typeof row.receipt.path === "string" && row.receipt.path.length <= 4096 ? row : null;
	} catch {
		return null;
	}
}
function rememberSavedPrintCopy(key, value) {
	try {
		const data = JSON.parse(localStorage.getItem(KEY$1) || "{}");
		data[key] = value;
		for (const old of Object.keys(data).slice(0, -80)) delete data[old];
		localStorage.setItem(KEY$1, JSON.stringify(data));
		return true;
	} catch {
		return false;
	}
}
var printPendingKey = (key) => "reelcase.print-save-pending.v1:" + encodeURIComponent(key);
function PrintSavePanel({ modelKey, name, signature, exportModel, onSaved }) {
	const [filename, setFilename] = (0, import_react.useState)(() => defaultPrintCopyName(name)), [folders, setFolders] = (0, import_react.useState)([]), [folder, setFolder] = (0, import_react.useState)(""), [receipt, setReceipt] = (0, import_react.useState)(null), [notice, setNotice] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false), [review, setReview] = (0, import_react.useState)(false), [ack, setAck] = (0, import_react.useState)(false), [pendingId, setPendingId] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem(printPendingKey(modelKey));
		} catch {
			return null;
		}
	});
	const prepared = (0, import_react.useRef)(null), alive = (0, import_react.useRef)(true), request = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		alive.current = true;
		return () => {
			alive.current = false;
			request.current?.abort();
			prepared.current = null;
		};
	}, []);
	const call = async (path, options = {}) => {
		const controller = new AbortController();
		request.current = controller;
		const response = await companionFetch(path, {
			...options,
			signal: AbortSignal.any([controller.signal, AbortSignal.timeout(9e4)])
		});
		const data = await response.json();
		if (!response.ok || !data.ok) throw Error(data.error || "Companion could not finish this print save.");
		return data;
	};
	const keepPending = (id) => {
		setPendingId(id);
		try {
			if (id) localStorage.setItem(printPendingKey(modelKey), id);
			else {
				localStorage.removeItem(printPendingKey(modelKey));
				localStorage.removeItem(printPendingKey(modelKey) + ":signature");
			}
		} catch {}
	};
	const saved = (r, snapshotSignature) => {
		if (r.status !== "done") return;
		const persisted = rememberSavedPrintCopy(modelKey, {
			signature: snapshotSignature,
			receipt: r
		});
		keepPending(null);
		prepared.current = null;
		onSaved(snapshotSignature, r);
		setNotice(persisted ? r.detail : r.detail + " The browser could not retain this save receipt.");
	};
	const run = async (fn) => {
		if (busy) return;
		setBusy(true);
		setNotice("");
		try {
			await fn();
		} catch (error) {
			if (alive.current) setNotice((error instanceof Error ? error.message : "Print save failed.") + " Your editor draft is retained.");
		} finally {
			if (alive.current) setBusy(false);
		}
	};
	const open = () => void run(async () => {
		const data = await call("/prints/save-folders");
		if (!alive.current) return;
		const next = Array.isArray(data.folders) ? data.folders.filter((p) => typeof p === "string" && p.length <= 4096).slice(0, 64) : [];
		setFolders(next);
		setFolder(next[0] || "");
		setReview(true);
		setNotice(next.length ? "Choose a new filename and review format limits." : "No approved destination exists. Configure a local Companion folder first.");
	});
	const prepare = () => void run(async () => {
		if (!validPrintCopyName(filename) || !folder || !ack) throw Error("Choose a new GLB filename, destination and acknowledge the format limits.");
		const captured = signature, blob = await exportModel();
		const sha256 = [...new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))].map((n) => n.toString(16).padStart(2, "0")).join("");
		const data = await call("/prints/transactions/review", {
			method: "POST",
			body: JSON.stringify({
				name: filename,
				dir: folder,
				bytes: blob.size,
				sha256
			})
		});
		if (!alive.current) return;
		prepared.current = {
			blob,
			signature: captured
		};
		setReceipt(data.receipt);
		keepPending(data.receipt.id);
		try {
			localStorage.setItem(printPendingKey(modelKey) + ":signature", captured);
		} catch {}
		setNotice("Review the exact new path below. No model file has been written.");
	});
	const commit = () => void run(async () => {
		const payload = prepared.current;
		if (!payload || !receipt || signature !== payload.signature) throw Error("The model changed after review. Cancel this review and prepare the latest edits.");
		try {
			const data = await call("/prints/transactions/" + receipt.id + "/commit", {
				method: "POST",
				headers: { "content-type": "model/gltf-binary" },
				body: payload.blob
			});
			if (!alive.current) return;
			setReceipt(data.receipt);
			saved(data.receipt, payload.signature);
		} catch (error) {
			if (alive.current) setReceipt((previous) => previous ? {
				...previous,
				status: "interrupted",
				detail: "Save is unconfirmed. Check pending save before retrying."
			} : previous);
			throw error;
		} finally {
			prepared.current = null;
		}
	});
	const check = () => void run(async () => {
		if (!pendingId) return;
		const data = await call("/prints/transactions/" + pendingId);
		if (!alive.current) return;
		setReceipt(data.receipt);
		setReview(true);
		setNotice(data.receipt.detail);
		let captured = "";
		try {
			captured = localStorage.getItem(printPendingKey(modelKey) + ":signature") || "";
		} catch {}
		if (data.receipt.status === "done" && captured) saved(data.receipt, captured);
	});
	const cancel = () => void run(async () => {
		if (pendingId) await call("/prints/transactions/" + pendingId + "/cancel", {
			method: "POST",
			body: "{}"
		});
		if (!alive.current) return;
		keepPending(null);
		prepared.current = null;
		setReceipt(null);
		setNotice("Save review cancelled. Your draft and original file are retained.");
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Save edited print copy",
		className: "border-t border-border pt-3 text-xs leading-5 text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-medium text-fg",
				children: "Save a new model copy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1",
				children: "Edits below are a local draft until a file save is confirmed. The source file stays unchanged."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 min-h-11",
				size: "sm",
				variant: "secondary",
				disabled: busy || Boolean(pendingId),
				onClick: open,
				children: "Choose save destination"
			}),
			pendingId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "min-h-11",
					variant: "secondary",
					disabled: busy,
					onClick: check,
					children: "Check pending save"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "min-h-11",
					variant: "ghost",
					disabled: busy,
					onClick: cancel,
					children: "Cancel save review"
				})]
			}),
			review && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: ["New GLB filename", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1 min-h-11",
							"aria-label": "New GLB filename",
							value: filename,
							disabled: busy || Boolean(pendingId),
							onChange: (e) => setFilename(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: ["Approved destination", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Approved print destination",
							className: "mt-1 min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-2 text-fg",
							value: folder,
							disabled: busy || Boolean(pendingId),
							onChange: (e) => setFolder(e.target.value),
							children: folders.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p,
								children: p
							}, p))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["GLB stores the current static geometry, transforms and supported embedded materials. STL and OBJ do not retain these material edits, so edited copies are saved as GLB. Camera, lighting, grid, wireframe and explode preview are excluded. Animations, CAD constraints and slicer settings are not exported. Source units are retained; check scale in your slicer.", " Embedded textures may be resized to 2048 pixels."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							"aria-label": "I reviewed GLB format limits",
							className: "mt-1",
							checked: ack,
							disabled: busy || Boolean(pendingId),
							onChange: (e) => setAck(e.target.checked)
						}), "I reviewed the format limits and will save a new copy."]
					}),
					!pendingId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						size: "sm",
						disabled: busy || !ack || !folder || !validPrintCopyName(filename),
						onClick: prepare,
						children: busy ? "Preparing…" : "Review new copy"
					}),
					receipt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border bg-bg p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-fg",
								children: receipt.status === "done" ? "Confirmed saved copy" : "Save receipt: " + receipt.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 break-all",
								children: receipt.path
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [receipt.bytes < 1024 ** 2 ? (receipt.bytes / 1024).toFixed(1) + " KiB" : (receipt.bytes / 1024 ** 2).toFixed(2) + " MiB", " · original retained"] }),
							receipt.status === "review" && prepared.current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "mt-3 min-h-11",
								disabled: busy || signature !== prepared.current.signature,
								onClick: commit,
								children: busy ? "Saving…" : "Save reviewed copy"
							})
						]
					})
				]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 break-words text-accent",
				children: notice
			})
		]
	});
}
var DEFAULT_PRINT_EDIT = {
	scale: 1,
	rotX: 0,
	rotY: 0,
	rotZ: 0,
	posX: 0,
	posY: 0,
	posZ: 0,
	color: "#6aa8ff",
	overrideMaterial: false,
	wireframe: false,
	showGrid: true,
	lighting: "studio",
	explode: 0
};
var KEY = "reelcase.print-edit.v1";
function printEditKey(target) {
	return target.blobId || target.sampleSrc || target.path || target.name;
}
function loadPrintEdit(key) {
	try {
		const row = JSON.parse(localStorage.getItem(KEY) ?? "{}")[key];
		if (!row || typeof row !== "object") return { ...DEFAULT_PRINT_EDIT };
		return sanitizePrintEdit(row);
	} catch {
		return { ...DEFAULT_PRINT_EDIT };
	}
}
function savePrintEdit(key, state) {
	try {
		const all = JSON.parse(localStorage.getItem(KEY) ?? "{}");
		all[key] = sanitizePrintEdit(state);
		const keys = Object.keys(all);
		if (keys.length > 80) for (const drop of keys.slice(0, keys.length - 80)) delete all[drop];
		localStorage.setItem(KEY, JSON.stringify(all));
	} catch {}
}
function sanitizePrintEdit(value) {
	const result = { ...DEFAULT_PRINT_EDIT };
	for (const key of [
		"scale",
		"rotX",
		"rotY",
		"rotZ",
		"posX",
		"posY",
		"posZ",
		"explode"
	]) {
		const n = value[key], min = key === "scale" ? .05 : key === "explode" ? 0 : key.startsWith("rot") ? -180 : -100, max = key === "scale" ? 5 : key === "explode" ? 40 : key.startsWith("rot") ? 180 : 100;
		if (typeof n === "number" && Number.isFinite(n)) result[key] = Math.min(max, Math.max(min, n));
	}
	if (typeof value.color === "string" && /^#[a-f0-9]{6}$/i.test(value.color)) result.color = value.color;
	for (const key of [
		"wireframe",
		"showGrid",
		"overrideMaterial"
	]) if (typeof value[key] === "boolean") result[key] = value[key];
	if ([
		"studio",
		"bright",
		"soft",
		"contrast"
	].includes(value.lighting || "")) result.lighting = value.lighting;
	if (value.overrideMaterial === void 0 && typeof value.color === "string" && /^#[a-f0-9]{6}$/i.test(value.color) && value.color.toLowerCase() !== DEFAULT_PRINT_EDIT.color) result.overrideMaterial = true;
	return result;
}
function formatHint(name) {
	if (/\.gcode$/i.test(name)) return "G-code is a toolpath — open it in a slicer or printer UI.";
	if (/\.3mf$/i.test(name)) return "3MF preview uses three.js 3MFLoader when the archive is valid.";
	return "Drag to orbit · scroll to zoom · right-drag to pan · editor panel for transform & view";
}
function degToRad(d) {
	return d * Math.PI / 180;
}
/**
* Lightweight three.js print inspector + practical in-section editor.
* three is dynamically imported so the hub chunk stays lean until open.
*/
function PrintModelViewer({ target, onClose }) {
	const hostRef = (0, import_react.useRef)(null);
	const shellRef = (0, import_react.useRef)(null);
	const originalColorRef = (0, import_react.useRef)(DEFAULT_PRINT_EDIT.color);
	const editKey = printEditKey(target);
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [detail, setDetail] = (0, import_react.useState)(formatHint(target.name));
	const [stats, setStats] = (0, import_react.useState)("");
	const [edit, setEdit] = (0, import_react.useState)(() => loadPrintEdit(editKey));
	const [savedCopy, setSavedCopy] = (0, import_react.useState)(() => loadSavedPrintCopy(editKey));
	const signature = printModelSignature(edit), unsaved = signature !== (savedCopy?.signature ?? printModelSignature(DEFAULT_PRINT_EDIT));
	const [panelOpen, setPanelOpen] = (0, import_react.useState)(true);
	const [fullscreen, setFullscreen] = (0, import_react.useState)(false);
	const editRef = (0, import_react.useRef)(edit);
	editRef.current = edit;
	const apiRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => savePrintEdit(editKey, edit), 180);
		apiRef.current?.applyEdit();
		apiRef.current?.setGridVisible(edit.showGrid);
		apiRef.current?.setLighting(edit.lighting);
		return () => clearTimeout(timer);
	}, [edit, editKey]);
	(0, import_react.useEffect)(() => () => {
		savePrintEdit(editKey, editRef.current);
	}, [editKey]);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!host) return;
		let disposed = false;
		let tick = () => {
			frame = 0;
		};
		let objectUrl = null;
		let frame = 0;
		const invalidate = () => {
			if (!disposed && !document.hidden && !frame) frame = requestAnimationFrame((time) => {
				frame = 0;
				tick(time);
			});
		};
		const visibility = () => {
			if (document.hidden) {
				cancelAnimationFrame(frame);
				frame = 0;
			} else invalidate();
		};
		document.addEventListener("visibilitychange", visibility);
		let renderer = null;
		let controls = null;
		let scene = null;
		let camera = null;
		let root = null;
		let pivot = null;
		let grid = null;
		let hemi = null;
		let key = null;
		let fill = null;
		let rim = null;
		let resizeObs = null;
		const originalColors = /* @__PURE__ */ new Map();
		let meshBases = [];
		let fitCenter = {
			x: 0,
			y: 0,
			z: 0
		};
		let fitDistance = 80;
		let THREE_REF = null;
		const disposeObject = (object) => {
			object.traverse((child) => {
				const mesh = child;
				if (mesh.geometry) mesh.geometry.dispose();
				const material = mesh.material;
				if (!material) return;
				const mats = Array.isArray(material) ? material : [material];
				for (const mat of mats) {
					for (const keyName of Object.keys(mat)) {
						const value = mat[keyName];
						if (value && typeof value === "object" && "dispose" in value && typeof value.dispose === "function") value.dispose();
					}
					mat.dispose();
				}
			});
		};
		const applyLighting = (mode) => {
			if (!hemi || !key || !fill || !rim) return;
			if (mode === "studio") {
				hemi.intensity = 1.05;
				key.intensity = 1.2;
				fill.intensity = .4;
				rim.intensity = .35;
			} else if (mode === "bright") {
				hemi.intensity = 1.4;
				key.intensity = 1.6;
				fill.intensity = .7;
				rim.intensity = .2;
			} else if (mode === "soft") {
				hemi.intensity = 1.2;
				key.intensity = .55;
				fill.intensity = .85;
				rim.intensity = .15;
			} else {
				hemi.intensity = .45;
				key.intensity = 1.8;
				fill.intensity = .15;
				rim.intensity = .9;
			}
		};
		const applyEditToScene = () => {
			if (!pivot || !THREE_REF) return;
			const e = editRef.current;
			pivot.scale.setScalar(Math.max(.05, e.scale));
			pivot.rotation.set(degToRad(e.rotX), degToRad(e.rotZ), degToRad(e.rotY), "XYZ");
			pivot.position.set(e.posX, e.posY, e.posZ);
			pivot.traverse((child) => {
				const mesh = child;
				if (!mesh.isMesh || !mesh.material) return;
				const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
				for (const mat of mats) {
					const std = mat;
					if ("wireframe" in std) std.wireframe = e.wireframe;
					if ("color" in std && std.color && (!mesh.userData?.keepColor || e.overrideMaterial)) try {
						std.color.set(e.color);
					} catch {}
					if (mesh.userData?.keepColor && !e.overrideMaterial && originalColors.has(mat) && std.color) std.color.copy(originalColors.get(mat));
					std.needsUpdate = true;
				}
			});
			if (meshBases.length > 1) for (const row of meshBases) {
				const dir = row.base.clone();
				if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
				else dir.normalize();
				row.mesh.position.copy(row.base).addScaledVector(dir, e.explode);
			}
			invalidate();
		};
		const fitCamera = (preset = "iso") => {
			if (!camera || !controls || !THREE_REF) return;
			const c = fitCenter;
			const d = fitDistance;
			if (preset === "front") camera.position.set(c.x, c.y, c.z + d);
			else if (preset === "back") camera.position.set(c.x, c.y, c.z - d);
			else if (preset === "top") camera.position.set(c.x, c.y + d, c.z + .01);
			else if (preset === "side") camera.position.set(c.x + d, c.y, c.z);
			else camera.position.set(c.x + d * .9, c.y + d * .55, c.z + d * .9);
			controls.target.set(c.x, c.y, c.z);
			controls.update();
			invalidate();
		};
		const measureAndFit = (THREE, object) => {
			const box = new THREE.Box3().setFromObject(object);
			const size = box.getSize(new THREE.Vector3());
			const center = box.getCenter(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z, 1);
			const distance = maxDim / (2 * Math.tan((camera?.fov ?? 45) * Math.PI / 360));
			fitCenter = {
				x: center.x,
				y: center.y,
				z: center.z
			};
			fitDistance = Math.max(distance * 1.35, maxDim * 1.2);
			if (camera) {
				camera.near = Math.max(maxDim / 200, .01);
				camera.far = Math.max(maxDim * 40, 100);
				camera.updateProjectionMatrix();
			}
			if (grid) {
				const gScale = Math.max(maxDim * 2.5, 40);
				grid.scale.setScalar(gScale / 120);
				grid.position.y = box.min.y;
			}
			fitCamera("iso");
			const tris = Math.round((() => {
				let count = 0;
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh || !mesh.geometry) return;
					const geo = mesh.geometry;
					count += geo.index ? geo.index.count / 3 : (geo.attributes.position?.count ?? 0) / 3;
				});
				return count;
			})());
			setStats(`${tris.toLocaleString()} tris · ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)} units`);
		};
		const run = async () => {
			setStatus("loading");
			setDetail(formatHint(target.name));
			if (!isViewablePrintName(target.name) && !target.sampleSrc) {
				setStatus("error");
				setDetail(formatHint(target.name));
				return;
			}
			const THREE = await import("../_libs/three.mjs").then((n) => n.s);
			THREE_REF = THREE;
			const { OrbitControls } = await import("../_libs/three.mjs").then((n) => n.o);
			if (disposed) return;
			scene = new THREE.Scene();
			scene.background = new THREE.Color("#0f1218");
			camera = new THREE.PerspectiveCamera(45, 1, .1, 2e3);
			camera.position.set(80, 60, 80);
			renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: false,
				powerPreference: "low-power"
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
			renderer.setSize(host.clientWidth || 640, host.clientHeight || 420, false);
			host.replaceChildren(renderer.domElement);
			renderer.domElement.style.width = "100%";
			renderer.domElement.style.height = "100%";
			renderer.domElement.style.display = "block";
			renderer.domElement.setAttribute("aria-label", `3D preview of ${target.name}`);
			hemi = new THREE.HemisphereLight(14542847, 2238515, 1.05);
			key = new THREE.DirectionalLight(16777215, 1.2);
			key.position.set(40, 80, 30);
			fill = new THREE.DirectionalLight(8956671, .4);
			fill.position.set(-50, 20, -40);
			rim = new THREE.DirectionalLight(16770760, .35);
			rim.position.set(-20, 40, 60);
			scene.add(hemi, key, fill, rim);
			applyLighting(editRef.current.lighting);
			grid = new THREE.GridHelper(120, 24, 3818840, 2238515);
			grid.position.y = 0;
			grid.visible = editRef.current.showGrid;
			scene.add(grid);
			controls = new OrbitControls(camera, renderer.domElement);
			controls.enableDamping = true;
			controls.dampingFactor = .08;
			controls.enablePan = true;
			const resize = () => {
				if (!renderer || !camera || !host) return;
				const w = host.clientWidth || 1;
				const h = host.clientHeight || 1;
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
				renderer.setSize(w, h, false);
				invalidate();
			};
			resize();
			resizeObs = new ResizeObserver(resize);
			resizeObs.observe(host);
			const renderLoop = () => {
				if (disposed || !renderer || !scene || !camera || !controls) return;
				frame = 0;
				const moving = controls.update();
				renderer.render(scene, camera);
				if (moving) invalidate();
			};
			tick = renderLoop;
			controls.addEventListener("change", invalidate);
			invalidate();
			let url = target.sampleSrc ?? null;
			let ext = (target.sampleSrc || target.name).split(".").pop()?.toLowerCase() ?? "";
			if (!url && target.blobId) {
				const record = await loadPrintBlob(target.blobId);
				if (!record) throw new Error("Saved model bytes are missing — re-add the file to view it.");
				objectUrl = URL.createObjectURL(record.blob);
				url = objectUrl;
				ext = record.name.split(".").pop()?.toLowerCase() ?? ext;
			}
			if (!url) throw new Error("No geometry source for this print file.");
			let object;
			if (ext === "stl") {
				const { STLLoader } = await import("../_libs/three.mjs").then((n) => n.t);
				const geometry = await new STLLoader().loadAsync(url);
				geometry.computeVertexNormals();
				const material = new THREE.MeshStandardMaterial({
					color: editRef.current.color,
					metalness: .05,
					roughness: .55,
					flatShading: false,
					wireframe: editRef.current.wireframe
				});
				object = new THREE.Mesh(geometry, material);
			} else if (ext === "obj") {
				const { OBJLoader } = await import("../_libs/three.mjs").then((n) => n.n);
				object = await new OBJLoader().loadAsync(url);
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh) return;
					mesh.material = new THREE.MeshStandardMaterial({
						color: editRef.current.color,
						metalness: .08,
						roughness: .5,
						wireframe: editRef.current.wireframe
					});
				});
			} else if (ext === "glb" || ext === "gltf") {
				const { GLTFLoader } = await import("../_libs/three.mjs").then((n) => n.r);
				object = (await new GLTFLoader().loadAsync(url)).scene;
				object.traverse((child) => {
					const mesh = child;
					if (mesh.isMesh) mesh.userData.keepColor = true;
				});
			} else if (ext === "3mf") {
				const { ThreeMFLoader } = await import("../_libs/three.mjs").then((n) => n.i);
				object = await new ThreeMFLoader().loadAsync(url);
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh) return;
					if (!mesh.material) mesh.material = new THREE.MeshStandardMaterial({
						color: 13215339,
						metalness: .1,
						roughness: .55,
						wireframe: editRef.current.wireframe
					});
					else mesh.userData.keepColor = true;
				});
			} else throw new Error(`Unsupported format .${ext}`);
			if (disposed) {
				disposeObject(object);
				return;
			}
			const box = new THREE.Box3().setFromObject(object);
			if (!isSavedPrintScene(object)) object.position.y -= box.min.y;
			pivot = new THREE.Group();
			pivot.add(object);
			scene.add(pivot);
			root = pivot;
			meshBases = [];
			object.traverse((child) => {
				const mesh = child;
				if (!mesh.isMesh) return;
				meshBases.push({
					mesh,
					base: mesh.position.clone()
				});
				for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
					const standard = material;
					if (standard.color) originalColors.set(material, standard.color.clone());
				}
			});
			const firstColor = [...originalColors.values()][0]?.getHexString();
			if (firstColor) {
				originalColorRef.current = "#" + firstColor;
				setEdit((previous) => previous.overrideMaterial || previous.color === "#" + firstColor ? previous : {
					...previous,
					color: "#" + firstColor
				});
			}
			measureAndFit(THREE, pivot);
			applyEditToScene();
			apiRef.current = {
				exportCopy: () => {
					applyEditToScene();
					if (!pivot) throw Error("The model is unavailable.");
					return exportPrintCopy(pivot, meshBases);
				},
				fit: (preset = "iso") => {
					if (THREE_REF && pivot) measureAndFit(THREE_REF, pivot);
					fitCamera(preset);
				},
				applyEdit: applyEditToScene,
				setGridVisible: (v) => {
					if (grid) grid.visible = v;
					invalidate();
				},
				setLighting: (mode) => {
					applyLighting(mode);
					invalidate();
				}
			};
			setStatus("ready");
			setDetail(formatHint(target.name));
		};
		run().catch((error) => {
			if (disposed) return;
			setStatus("error");
			setDetail(error instanceof Error ? error.message : "Could not load this model.");
		});
		return () => {
			disposed = true;
			cancelAnimationFrame(frame);
			document.removeEventListener("visibilitychange", visibility);
			resizeObs?.disconnect();
			controls?.dispose();
			apiRef.current = null;
			if (root && scene) {
				scene.remove(root);
				disposeObject(root);
			}
			if (scene) while (scene.children.length) {
				const child = scene.children.pop();
				if (child) {
					scene.remove(child);
					disposeObject(child);
				}
			}
			renderer?.dispose();
			if (renderer && "forceContextLoss" in renderer) renderer.forceContextLoss();
			if (renderer?.domElement.parentElement === host) host.replaceChildren();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			renderer = null;
			controls = null;
			scene = null;
			camera = null;
			root = null;
			pivot = null;
			grid = null;
		};
	}, [target]);
	const patch = (partial) => setEdit((prev) => ({
		...prev,
		...partial
	}));
	const toggleFullscreen = async () => {
		const shell = shellRef.current;
		if (!shell) return;
		try {
			if (!document.fullscreenElement) {
				await shell.requestFullscreen();
				setFullscreen(true);
			} else {
				await document.exitFullscreen();
				setFullscreen(false);
			}
		} catch {
			setFullscreen(Boolean(document.fullscreenElement));
		}
	};
	(0, import_react.useEffect)(() => {
		const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onFs);
		return () => document.removeEventListener("fullscreenchange", onFs);
	}, []);
	const slider = (label, value, min, max, step, onChange, suffix = "") => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular-nums text-fg",
				children: [Number.isInteger(step) ? value : value.toFixed(2), suffix]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min,
			max,
			step,
			value,
			disabled: status !== "ready",
			onChange: (event) => onChange(Number(event.target.value)),
			className: "mt-1 w-full accent-[var(--accent,#6aa8ff)]",
			"aria-label": label
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: shellRef,
		className: "fixed inset-0 z-50 flex flex-col bg-bg/95",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `View ${target.name}`,
		"data-print-ready": status,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "3D print viewer + editor"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-fg",
							children: target.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted",
							children: [
								target.path,
								target.size > 0 ? ` · ${target.size < 1048576 ? `${Math.max(1, Math.round(target.size / 1024))} KB` : `${(target.size / 1024 / 1024).toFixed(1)} MB`}` : "",
								stats ? ` · ${stats}` : ""
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "min-h-11",
							variant: "secondary",
							type: "button",
							disabled: status !== "ready",
							onClick: () => apiRef.current?.fit("iso"),
							"aria-label": "Fit model",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expand, { className: "size-3.5" }), "Fit"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "min-h-11",
							variant: "secondary",
							type: "button",
							disabled: status !== "ready",
							onClick: () => {
								setEdit({
									...DEFAULT_PRINT_EDIT,
									color: originalColorRef.current
								});
								apiRef.current?.fit("iso");
							},
							"aria-label": "Reset transform and camera",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Reset"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "min-h-11",
							variant: "secondary",
							type: "button",
							onClick: () => setPanelOpen((v) => !v),
							"aria-label": "Toggle editor panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-3.5" }), panelOpen ? "Hide editor" : "Editor"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "min-h-11",
							variant: "secondary",
							type: "button",
							onClick: () => void toggleFullscreen(),
							"aria-label": "Toggle fullscreen",
							children: [fullscreen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" }), fullscreen ? "Exit" : "Full"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "min-h-11",
							variant: "secondary",
							type: "button",
							onClick: onClose,
							"aria-label": "Close viewer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), "Close"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex min-h-0 flex-1 flex-col sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-52 min-w-0 flex-1 sm:min-h-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: hostRef,
							className: "absolute inset-0 touch-none"
						}),
						status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Loading model…"]
						}),
						status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center p-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-md rounded-lg bg-elevated px-4 py-3 text-center text-sm text-muted shadow-border",
								children: detail
							})
						}),
						status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1",
							children: [
								"iso",
								"front",
								"top",
								"side",
								"back"
							].map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "pointer-events-auto min-h-11 min-w-11 rounded-sm bg-bg/80 px-2 py-1 text-[11px] font-medium text-fg shadow-border hover:bg-elevated",
								onClick: () => apiRef.current?.fit(preset),
								children: preset
							}, preset))
						})
					]
				}), panelOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					"aria-label": "Print editor",
					className: "flex max-h-96 w-full shrink-0 flex-col gap-3 overflow-y-auto border-t border-border bg-surface p-4 sm:max-h-none sm:w-80 sm:border-t-0 sm:border-l",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "View"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									className: "min-h-11",
									variant: edit.wireframe ? "default" : "secondary",
									disabled: status !== "ready",
									onClick: () => patch({ wireframe: !edit.wireframe }),
									children: "Wireframe"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "min-h-11",
									variant: edit.showGrid ? "default" : "secondary",
									disabled: status !== "ready",
									onClick: () => patch({ showGrid: !edit.showGrid }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "size-3.5" }), "Grid"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 flex items-center gap-1 text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-3.5" }), " Lighting"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 flex flex-wrap gap-1",
								children: [
									"studio",
									"bright",
									"soft",
									"contrast"
								].map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									className: "min-h-11",
									variant: edit.lighting === mode ? "default" : "secondary",
									disabled: status !== "ready",
									onClick: () => patch({ lighting: mode }),
									children: mode
								}, mode))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 block text-xs text-muted",
								children: ["Material color", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "color",
									value: edit.overrideMaterial ? edit.color : originalColorRef.current,
									disabled: status !== "ready",
									onChange: (event) => patch({
										color: event.target.value,
										overrideMaterial: true
									}),
									className: "mt-1 h-11 w-full cursor-pointer p-1",
									"aria-label": "Material color"
								})]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border pt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Transform"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "status",
									className: "mt-1 text-xs text-muted",
									children: unsaved ? "Unsaved model changes · draft kept locally" : savedCopy ? "A copy of these edits was saved · original retained" : "Original model · viewing preferences are local"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 space-y-3",
									children: [
										slider("Scale", edit.scale, .1, 5, .05, (n) => patch({ scale: n }), "×"),
										slider("Rotate X", edit.rotX, -180, 180, 1, (n) => patch({ rotX: n }), "°"),
										slider("Rotate Y", edit.rotY, -180, 180, 1, (n) => patch({ rotY: n }), "°"),
										slider("Rotate Z", edit.rotZ, -180, 180, 1, (n) => patch({ rotZ: n }), "°"),
										slider("Move X", edit.posX, -100, 100, .5, (n) => patch({ posX: n })),
										slider("Move Y", edit.posY, -100, 100, .5, (n) => patch({ posY: n })),
										slider("Move Z", edit.posZ, -100, 100, .5, (n) => patch({ posZ: n })),
										slider("Explode parts", edit.explode, 0, 40, .5, (n) => patch({ explode: n }))
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "min-h-11",
										variant: "secondary",
										disabled: status !== "ready",
										onClick: () => patch({
											rotX: 0,
											rotY: 0,
											rotZ: 0,
											posX: 0,
											posY: 0,
											posZ: 0,
											scale: 1,
											explode: 0
										}),
										children: "Clear transform"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "min-h-11",
										variant: "secondary",
										disabled: status !== "ready",
										onClick: () => patch({ rotX: -90 }),
										title: "Common bed flat correction",
										children: "Flat on bed (−90° X)"
									})]
								})
							]
						}),
						status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintSavePanel, {
							modelKey: editKey,
							name: target.name,
							signature,
							exportModel: () => {
								if (!apiRef.current) throw Error("The model is unavailable.");
								return apiRef.current.exportCopy();
							},
							onSaved: (savedSignature, receipt) => setSavedCopy({
								signature: savedSignature,
								receipt
							})
						})
					]
				})]
			}),
			status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-t border-border px-4 py-2 text-xs text-subtle",
				children: detail
			})
		]
	});
}
//#endregion
export { PrintModelViewer };
