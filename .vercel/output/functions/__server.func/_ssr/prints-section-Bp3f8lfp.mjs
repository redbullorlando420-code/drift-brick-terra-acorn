import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Ft as Eye, K as PackageSearch, Qt as Box } from "../_libs/lucide-react.mjs";
import { g as companionSavePrint, h as companionReadPrint, p as companionListPrints } from "./companion-C8xPNDAD.mjs";
import { Ot as Button } from "./library-app-CrsCDQmv.mjs";
import { d as bytes, l as ServiceLink, m as writeHub, p as readHub, s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prints-section-Bp3f8lfp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Local IndexedDB store for 3D print file bytes (viewer only). Metadata stays in localStorage. */
var DB_NAME = "reelcase-prints";
var DB_VERSION = 1;
var STORE = "blobs";
var MAX_BLOBS = 32;
var MAX_BYTES = 50331648;
var MAX_TOTAL_BYTES = 201326592;
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? /* @__PURE__ */ new Error("prints IndexedDB open failed"));
	});
}
function printFileId(file) {
	return `print:${file.name.normalize("NFKC").toLowerCase()}:${file.size}:${file.lastModified}`;
}
function isViewablePrintName(name) {
	return /\.(stl|obj|glb|gltf|3mf)$/i.test(name);
}
async function savePrintBlob(file, id = printFileId(file)) {
	if (!isViewablePrintName(file.name)) return null;
	if (file.size <= 0 || file.size > MAX_BYTES) return null;
	const record = {
		id,
		name: file.name,
		path: file.webkitRelativePath || file.name,
		mime: file.type || "application/octet-stream",
		size: file.size,
		addedAt: Date.now(),
		blob: file
	};
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, "readwrite");
			tx.objectStore(STORE).put(record);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
	await prunePrintBlobs();
	return id;
}
async function loadPrintBlob(id) {
	try {
		const db = await openDb();
		try {
			return await new Promise((resolve, reject) => {
				const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
				req.onsuccess = () => resolve(req.result);
				req.onerror = () => reject(req.error);
			});
		} finally {
			db.close();
		}
	} catch {
		return;
	}
}
async function prunePrintBlobs() {
	try {
		const db = await openDb();
		try {
			const ordered = [...await new Promise((resolve, reject) => {
				const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
				req.onsuccess = () => resolve(req.result ?? []);
				req.onerror = () => reject(req.error);
			})].sort((a, b) => a.addedAt - b.addedAt);
			let total = ordered.reduce((sum, row) => sum + (row.size || 0), 0);
			const drop = [];
			while (ordered.length - drop.length > MAX_BLOBS || total > MAX_TOTAL_BYTES) {
				const oldest = ordered[drop.length];
				if (!oldest) break;
				drop.push(oldest);
				total -= oldest.size || 0;
			}
			if (!drop.length) return;
			await new Promise((resolve, reject) => {
				const tx = db.transaction(STORE, "readwrite");
				const store = tx.objectStore(STORE);
				for (const row of drop) store.delete(row.id);
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
			});
		} finally {
			db.close();
		}
	} catch {}
}
var PrintModelViewer = (0, import_react.lazy)(async () => {
	return { default: (await import("./print-model-viewer-kHPFA75-.mjs")).PrintModelViewer };
});
function filesToItems(files, gamesOnly = false) {
	return [...files].filter((file) => !gamesOnly || /\.(exe|lnk|url|appref-ms)$/i.test(file.name)).filter((file) => !/^(uninstall|setup|crashreporter)/i.test(file.name)).map((file) => ({
		name: file.name,
		path: file.webkitRelativePath || file.name,
		size: file.size,
		addedAt: Date.now()
	}));
}
function PrintsSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalCatalog, {
		kind: "prints",
		eyebrow: "Maker shelf",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-4" }),
		title: "3D prints",
		copy: "Keep a lightweight catalog of print-ready files. Preview STL, OBJ, GLB/GLTF, and 3MF in an interactive orbit viewer with transform editor, lighting presets, wireframe, grid, and fullscreen; G-code stays list-only for slicers.",
		accept: ".stl,.obj,.3mf,.gcode,.glb,.gltf",
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
				name: "Printables",
				href: "https://www.printables.com/",
				copy: "Browse community-shared printable models."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
				name: "OpenSCAD",
				href: "https://openscad.org/",
				copy: "Build and customize open parametric models."
			})]
		})
	});
}
function LocalCatalog({ kind, eyebrow, icon, title, copy, accept, directory, footer }) {
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	const [viewer, setViewer] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [companionNote, setCompanionNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setHub(readHub()), []);
	const items = hub[kind];
	const change = async (files) => {
		if (!files?.length) return;
		if (kind === "prints") {
			setBusy(true);
			try {
				const nextItems = [];
				for (const file of [...files]) {
					const blobId = await savePrintBlob(file);
					nextItems.push({
						name: file.name,
						path: file.webkitRelativePath || file.name,
						size: file.size,
						addedAt: Date.now(),
						id: blobId ?? void 0
					});
				}
				const next = {
					...hub,
					prints: [...nextItems, ...hub.prints].slice(0, 120)
				};
				setHub(next);
				writeHub(next);
			} finally {
				setBusy(false);
			}
			return;
		}
		const next = {
			...hub,
			[kind]: filesToItems(files, kind === "games")
		};
		setHub(next);
		writeHub(next);
	};
	const canView = (item) => Boolean(item.sampleSrc || item.id && isViewablePrintName(item.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow,
		icon,
		title,
		copy,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/40 px-5 text-center transition-[background-color,border-color] duration-150 hover:border-fg/30 hover:bg-elevated",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-3 text-sm font-medium text-fg",
						children: directory ? "Choose Desktop games folder" : busy ? "Saving print files…" : "Add print files"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-xs text-muted",
						children: directory ? "Keeps only game launchers and shortcuts; folders and support files stay out." : "STL, OBJ, GLB/GLTF, and 3MF open in the in-app viewer; G-code is catalog-only."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						multiple: true,
						accept,
						className: "sr-only",
						disabled: busy,
						...directory ? {
							webkitdirectory: "",
							directory: ""
						} : {},
						onChange: (event) => {
							change(event.target.files);
							event.target.value = "";
						}
					})
				]
			}),
			kind === "prints" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: busy,
						onClick: () => void (async () => {
							setBusy(true);
							try {
								const { prints } = await companionListPrints(120);
								if (!prints.length) {
									setCompanionNote("No STL/OBJ/GLB/3MF under approved roots (or Realhub Prints). Add a prints folder to REELCASE_ALLOWED_ROOTS.");
									return;
								}
								const nextItems = [];
								for (const row of prints.slice(0, 40)) {
									if (!isViewablePrintName(row.name)) continue;
									const file = await companionReadPrint(row.path);
									if (!file.ok || !file.dataBase64) continue;
									const bytes = Uint8Array.from(atob(file.dataBase64), (c) => c.charCodeAt(0));
									const blobId = await savePrintBlob(new File([bytes], file.name || row.name, { type: "application/octet-stream" }));
									nextItems.push({
										name: row.name,
										path: row.path,
										size: row.size,
										addedAt: Date.now(),
										id: blobId ?? void 0
									});
								}
								if (!nextItems.length) {
									setCompanionNote("Companion listed prints, but none could be loaded (size/format).");
									return;
								}
								const next = {
									...hub,
									prints: [...nextItems, ...hub.prints].slice(0, 120)
								};
								setHub(next);
								writeHub(next);
								setCompanionNote(`Opened ${nextItems.length} print file${nextItems.length === 1 ? "" : "s"} from approved companion folders.`);
							} finally {
								setBusy(false);
							}
						})(),
						children: "Open prints from companion folder"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: busy || !items.some((item) => item.id),
						onClick: () => void (async () => {
							setBusy(true);
							try {
								let saved = 0;
								for (const item of items.slice(0, 20)) {
									if (!item.id || !isViewablePrintName(item.name)) continue;
									const { loadPrintBlob } = await import("./prints-blobs-_clRtYAi.mjs");
									const record = await loadPrintBlob(item.id);
									if (!record?.blob) continue;
									const buffer = new Uint8Array(await record.blob.arrayBuffer());
									let binary = "";
									for (let i = 0; i < buffer.length; i += 1) binary += String.fromCharCode(buffer[i]);
									if ((await companionSavePrint(item.name, btoa(binary))).ok) saved += 1;
								}
								setCompanionNote(saved ? `Saved ${saved} print file${saved === 1 ? "" : "s"} into the companion Realhub Prints folder.` : "Nothing saved — start Companion and ensure an approved prints folder exists.");
							} finally {
								setBusy(false);
							}
						})(),
						children: "Save open prints to companion"
					}),
					companionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "w-full text-xs text-muted",
						children: companionNote
					})
				]
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 overflow-hidden rounded-lg shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [
							items.length,
							" saved ",
							kind === "prints" ? "print files" : "games"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: kind === "prints" ? "Names in localStorage · viewable bytes in IndexedDB" : "Stored as names only"
					})]
				}), items.slice(0, 80).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-fg",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: item.path
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2",
						children: [kind === "prints" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: canView(item) ? "default" : "secondary",
							type: "button",
							disabled: !canView(item),
							title: canView(item) ? "Open viewer + editor" : /\.gcode$/i.test(item.name) ? "G-code is not a mesh preview" : "Re-add this file to enable preview",
							onClick: () => setViewer({
								name: item.name,
								path: item.path,
								size: item.size,
								sampleSrc: item.sampleSrc,
								blobId: item.id
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }), "View / Edit"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-subtle",
							children: bytes(item.size)
						})]
					})]
				}, `${item.path}:${item.addedAt}`))]
			}),
			footer,
			viewer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintModelViewer, {
					target: viewer,
					onClose: () => setViewer(null)
				})
			})
		]
	});
}
//#endregion
export { PrintsSection, loadPrintBlob as n, isViewablePrintName as t };
