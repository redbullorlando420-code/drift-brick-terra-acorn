import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as FolderPlus, A as Monitor, B as List, C as RefreshCw, D as Pause, E as PictureInPicture2, F as Maximize, G as Image, H as Lightbulb, I as Maximize2, J as Heart, K as ImagePlus, L as Lock, M as Minimize, N as MessageCircle, O as PackageSearch, P as Menu, Q as FolderSearch, R as LockOpen, S as Rocket, T as Play, U as LayoutGrid, V as ListPlus, W as Images, X as Gamepad2, Y as Glasses, Z as Folder, _ as Shuffle, _t as ArrowLeft, a as Volume2, at as Copy, b as Settings2, c as Upload, ct as CircleAlert, d as Tag, dt as Check, et as Film, f as Star, ft as ChartColumn, g as SkipBack, gt as BellOff, h as SkipForward, ht as Bell, i as VolumeX, it as Cpu, j as MonitorPlay, k as Music2, lt as ChevronRight, m as Smartphone, mt as Bot, n as X, nt as ExternalLink, o as Video, ot as Clock3, p as Sparkles, pt as Box, q as History, r as Wifi, rt as Download, s as Users, st as Clapperboard, t as Youtube, tt as FileText, u as ThumbsUp, ut as ChevronLeft, v as ShoppingBag, w as Radio, x as Search, y as ShieldCheck, z as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Trigger, i as Root2, n as Item2, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as useShallow, t as create } from "../_libs/zustand.mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CGlhuPic.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatTime(sec) {
	if (!Number.isFinite(sec) || sec < 0) return "0:00";
	const total = Math.floor(sec);
	const s = total % 60;
	const m = Math.floor(total / 60) % 60;
	const h = Math.floor(total / 3600);
	const pad = (n) => n.toString().padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
function formatBytes(n) {
	if (!Number.isFinite(n) || n < 0) return "—";
	if (n < 1024) return `${n} B`;
	if (n < 1024 ** 2) return `${Math.round(n / 1024)} KB`;
	if (n < 1024 ** 3) {
		const mb = n / 1024 ** 2;
		return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
	}
	return `${(n / 1024 ** 3).toFixed(1)} GB`;
}
function extensionOf(name) {
	const i = name.lastIndexOf(".");
	if (i <= 0) return "";
	return name.slice(i + 1).toLowerCase();
}
function formatAgo(at, now = Date.now()) {
	const s = Math.max(0, Math.floor((now - at) / 1e3));
	if (s < 45) return "Just now";
	if (s < 3600) return `${Math.floor(s / 60)}m ago`;
	if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
	const d = Math.floor(s / 86400);
	if (d === 1) return "Yesterday";
	if (d < 7) return `${d}d ago`;
	return new Date(at).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function Sheet(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, { ...props });
}
function SheetContent({ className, children, side = "left", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex h-full w-72 flex-col bg-surface p-4 shadow-lift outline-none", side === "left" ? "inset-y-0 left-0" : "inset-y-0 right-0", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-sm p-2 text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
		className: cn("font-display text-xl text-fg", className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,opacity,box-shadow] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-elevated text-fg shadow-border hover:shadow-border-hover",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			outline: "text-fg shadow-border hover:bg-elevated",
			danger: "bg-danger text-fg hover:opacity-90"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-lg px-5 text-sm",
			icon: "size-11 rounded-md",
			"icon-sm": "size-9 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("h-11 w-full min-w-0 rounded-md bg-elevated px-3 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle", "focus-visible:shadow-border-hover focus-visible:ring-2 focus-visible:ring-ring/50", "disabled:cursor-not-allowed disabled:opacity-40", className),
		...props
	});
}
/** Replace successful channels only; saved entries survive provider pagination. */
function mergeRemoteRefresh(existing, incoming, refreshedIds, savedIds) {
	const refreshed = new Set(refreshedIds);
	const fresh = new Map(incoming.map((video) => [video.id, video]));
	return [...existing.filter((video) => !fresh.has(video.id) && (!video.remote || !refreshed.has(video.folderId) || savedIds.has(video.id))).map((video) => video.remote?.live && refreshed.has(video.folderId) ? {
		...video,
		tagline: "Offline · saved channel",
		remote: {
			...video.remote,
			live: false
		}
	} : video), ...fresh.values()];
}
var DB_NAME = "reelcase";
var STORE = "dirs";
var VIDEO_STORE = "videos";
var SOURCE_HEALTH_STORE = "source-health";
var THUMB_STORE = "thumb-cache";
var ACTIVITY_STORE = "activity";
var PREFS_KEY = "reelcase.prefs.v4";
var LEGACY_KEYS = [
	"reelcase.prefs.v3",
	"reelcase.prefs.v2",
	"reelcase.prefs.v1"
];
function migrateSource(id) {
	if (!id || id === "all" || id === "starred") {
		if (id === "starred") return "favorites";
		return "home";
	}
	return id;
}
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 6);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("remote-cache")) db.createObjectStore("remote-cache");
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(VIDEO_STORE)) db.createObjectStore(VIDEO_STORE, { keyPath: "id" }).createIndex("folderId", "folderId", { unique: false });
			if (!db.objectStoreNames.contains(SOURCE_HEALTH_STORE)) db.createObjectStore(SOURCE_HEALTH_STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(THUMB_STORE)) db.createObjectStore(THUMB_STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(ACTIVITY_STORE)) db.createObjectStore(ACTIVITY_STORE);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function saveDirHandle(entry) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(entry);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
async function loadDirHandles() {
	const db = await openDb();
	const rows = await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
		req.onsuccess = () => resolve(req.result ?? []);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return rows;
}
async function deleteDirHandle(id) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction([
			STORE,
			VIDEO_STORE,
			SOURCE_HEALTH_STORE
		], "readwrite");
		tx.objectStore(STORE).delete(id);
		tx.objectStore(SOURCE_HEALTH_STORE).delete(id);
		const req = tx.objectStore(VIDEO_STORE).index("folderId").openCursor(IDBKeyRange.only(id));
		req.onsuccess = () => {
			const cursor = req.result;
			if (cursor) {
				cursor.delete();
				cursor.continue();
			}
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
var IDB_WRITE_CHUNK = 400;
async function clearFolderVideosTx(db, folderId) {
	await new Promise((resolve, reject) => {
		const tx = db.transaction(VIDEO_STORE, "readwrite");
		const req = tx.objectStore(VIDEO_STORE).index("folderId").openCursor(IDBKeyRange.only(folderId));
		req.onsuccess = () => {
			const cursor = req.result;
			if (cursor) {
				cursor.delete();
				cursor.continue();
			}
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function putVideosChunked(db, videos) {
	for (let i = 0; i < videos.length; i += IDB_WRITE_CHUNK) {
		const slice = videos.slice(i, i + IDB_WRITE_CHUNK);
		await new Promise((resolve, reject) => {
			const tx = db.transaction(VIDEO_STORE, "readwrite");
			const store = tx.objectStore(VIDEO_STORE);
			for (const video of slice) {
				if (video.isSample) continue;
				store.put(video);
			}
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	}
}
/** Replace one folder's catalog rows in chunked IndexedDB writes. */
async function saveFolderVideos(folderId, videos) {
	const db = await openDb();
	await clearFolderVideosTx(db, folderId);
	await putVideosChunked(db, videos);
	db.close();
}
/** Append/upsert catalog rows without rewriting the whole folder (batched ingest). */
async function appendCatalogVideos(videos) {
	if (!videos.length) return;
	const db = await openDb();
	await putVideosChunked(db, videos);
	db.close();
}
async function clearFolderVideos(folderId) {
	const db = await openDb();
	await clearFolderVideosTx(db, folderId);
	db.close();
}
async function loadCatalogVideos() {
	const db = await openDb();
	const rows = await new Promise((resolve, reject) => {
		const req = db.transaction(VIDEO_STORE, "readonly").objectStore(VIDEO_STORE).getAll();
		req.onsuccess = () => resolve(req.result ?? []);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return rows.filter((v) => !v.isSample);
}
async function loadThumbCache(limit = 120) {
	const db = await openDb();
	try {
		return (await new Promise((resolve, reject) => {
			const req = db.transaction(THUMB_STORE, "readonly").objectStore(THUMB_STORE).getAll();
			req.onsuccess = () => resolve(req.result ?? []);
			req.onerror = () => reject(req.error);
		})).sort((a, b) => b.at - a.at).slice(0, limit);
	} finally {
		db.close();
	}
}
async function saveThumbCache(entry) {
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(THUMB_STORE, "readwrite");
			tx.objectStore(THUMB_STORE).put(entry);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function loadRemoteSnapshot() {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction("remote-cache").objectStore("remote-cache").get("snapshot");
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	} finally {
		db.close();
	}
}
async function saveRemoteSnapshot(snapshot) {
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction("remote-cache", "readwrite");
			tx.objectStore("remote-cache").put(snapshot, "snapshot");
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function loadActivitySnapshot() {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(ACTIVITY_STORE, "readonly").objectStore(ACTIVITY_STORE).get("primary");
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	} finally {
		db.close();
	}
}
async function saveActivitySnapshot(snapshot) {
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_STORE, "readwrite");
			tx.objectStore(ACTIVITY_STORE).put(snapshot, "primary");
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function saveSourceHealth(entry) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(SOURCE_HEALTH_STORE, "readwrite");
		tx.objectStore(SOURCE_HEALTH_STORE).put(entry);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
async function loadSourceHealth() {
	const db = await openDb();
	const rows = await new Promise((resolve, reject) => {
		const req = db.transaction(SOURCE_HEALTH_STORE, "readonly").objectStore(SOURCE_HEALTH_STORE).getAll();
		req.onsuccess = () => resolve(req.result ?? []);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return rows;
}
function normalize(raw) {
	const starred = raw.starred ?? [];
	const favorites = raw.favorites ?? starred;
	const sort = raw.sort ?? "added";
	return {
		favorites,
		likes: raw.likes ?? [],
		tags: raw.tags ?? {},
		categories: raw.categories ?? {},
		progress: raw.progress ?? {},
		history: raw.history ?? [],
		view: raw.view ?? "grid",
		sort,
		sortDir: raw.sortDir ?? (sort === "name" ? "asc" : "desc"),
		hideDemo: Boolean(raw.hideDemo),
		sourceId: migrateSource(raw.sourceId),
		hardwareAccel: raw.hardwareAccel !== false,
		privateFolderIds: raw.privateFolderIds ?? [],
		adultPinHash: raw.adultPinHash ?? null,
		extFilter: typeof raw.extFilter === "string" ? raw.extFilter : "all",
		sizeFilter: raw.sizeFilter ?? "any",
		playableOnly: Boolean(raw.playableOnly),
		groupBy: raw.groupBy ?? "none",
		follows: Array.isArray(raw.follows) ? raw.follows : [],
		notices: Array.isArray(raw.notices) ? raw.notices : [],
		notifyPush: Boolean(raw.notifyPush)
	};
}
function loadPrefs() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(PREFS_KEY);
		if (raw) return normalize(JSON.parse(raw));
		for (const key of LEGACY_KEYS) {
			const legacy = localStorage.getItem(key);
			if (legacy) return normalize(JSON.parse(legacy));
		}
		return null;
	} catch {
		return null;
	}
}
function savePrefs(prefs) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
	} catch {}
}
async function hashPin(pin) {
	const data = new TextEncoder().encode(`reelcase.adults.v1:${pin}`);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
function isPinShape(pin) {
	return /^\d{4}$/.test(pin);
}
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([
	"mp4",
	"webm",
	"mkv",
	"mov",
	"m4v",
	"avi",
	"ogv",
	"ogg",
	"3gp",
	"wmv",
	"flv",
	"ts",
	"mts",
	"m2ts",
	"mpeg",
	"mpg",
	"mpe",
	"asf",
	"m2v",
	"vob"
]);
var NATIVE_PLAYABLE = /* @__PURE__ */ new Set([
	"mp4",
	"webm",
	"ogv",
	"ogg",
	"m4v",
	"mov"
]);
var SKIP_DIRS = /* @__PURE__ */ new Set([
	"node_modules",
	".git",
	".svn",
	".hg",
	".cache",
	".next",
	".nuxt",
	"dist",
	"build",
	"__pycache__",
	"system volume information",
	"$recycle.bin",
	"windows",
	"windows.old",
	"program files",
	"program files (x86)",
	"programdata",
	"recovery",
	"perflogs",
	"boot",
	"intel",
	"amd",
	"nvidia",
	"nvidia corporation",
	"msocache",
	"config.msi",
	"$windows.~bt",
	"$windows.~ws",
	"documents and settings",
	"appdata",
	"application data",
	"local settings",
	"library",
	"system",
	"applications",
	"private",
	"usr",
	"proc",
	"sys",
	"dev",
	"run",
	"snap",
	"var",
	"cores",
	"tmp",
	"temp",
	"cache"
]);
var RECOMMENDED_FOLDERS = [
	{
		id: "videos",
		label: "Videos",
		hint: "Movies & TV"
	},
	{
		id: "downloads",
		label: "Downloads",
		hint: "Saved files"
	},
	{
		id: "desktop",
		label: "Desktop",
		hint: "On the desktop"
	},
	{
		id: "documents",
		label: "Documents",
		hint: "Docs folder"
	},
	{
		id: "pictures",
		label: "Pictures",
		hint: "Camera rolls"
	}
];
function isVideoFile(name, mime) {
	const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
	if (VIDEO_EXTENSIONS.has(ext)) return true;
	return Boolean(mime && mime.startsWith("video/"));
}
function shouldSkipDir(name) {
	if (name.startsWith(".")) return true;
	return SKIP_DIRS.has(name.toLowerCase());
}
function isDriveName(name) {
	const n = name.trim();
	if (/^[a-z]:?$/i.test(n)) return true;
	if (n === "/" || n === "\\") return true;
	return /^(macintosh hd|local disk|os|windows|ubuntu|fedora|linux)$/i.test(n);
}
function mimeFromName(name) {
	switch (name.slice(name.lastIndexOf(".") + 1).toLowerCase()) {
		case "mp4":
		case "m4v": return "video/mp4";
		case "webm": return "video/webm";
		case "ogv":
		case "ogg": return "video/ogg";
		case "mov": return "video/quicktime";
		case "mkv": return "video/x-matroska";
		case "avi": return "video/x-msvideo";
		default: return "video/*";
	}
}
function isLikelyPlayable(ext) {
	return NATIVE_PLAYABLE.has(ext.toLowerCase());
}
function titleOf(video) {
	return video.name.replace(/\.[^/.]+$/, "");
}
function isClassicVideo(video) {
	if (video.collection === "classics") return true;
	const blob = `${video.path} ${video.name} ${video.genre ?? ""}`.toLowerCase();
	return /\b(classic|classics|noir|silent|golden.?age)\b/.test(blob);
}
var SYSTEM_SOURCES = /* @__PURE__ */ new Set([
	"home",
	"all",
	"movies",
	"favorites",
	"history",
	"adults",
	"continue",
	"youtube",
	"twitch",
	"live",
	"prints",
	"photos",
	"spotify",
	"games",
	"shop",
	"streaming",
	"social",
	"watch-room",
	"settings"
]);
var files = /* @__PURE__ */ new Map();
var fileHandles = /* @__PURE__ */ new Map();
var dirHandles = /* @__PURE__ */ new Map();
var objectUrls = /* @__PURE__ */ new Map();
var MAX_OBJECT_URLS = 48;
function rememberFile(id, file) {
	files.set(id, file);
}
function rememberFileHandle(id, handle) {
	fileHandles.set(id, handle);
	files.delete(id);
}
function rememberDirHandle(folderId, handle) {
	dirHandles.set(folderId, handle);
}
function getDirHandle(folderId) {
	return dirHandles.get(folderId);
}
function forgetFolder(folderId, videoIds) {
	dirHandles.delete(folderId);
	for (const id of videoIds) {
		files.delete(id);
		fileHandles.delete(id);
		const url = objectUrls.get(id);
		if (url) {
			URL.revokeObjectURL(url);
			objectUrls.delete(id);
		}
	}
}
function rememberObjectUrl(id, url) {
	if (objectUrls.has(id)) {
		const prev = objectUrls.get(id);
		if (prev && prev !== url) URL.revokeObjectURL(prev);
		objectUrls.delete(id);
	}
	while (objectUrls.size >= MAX_OBJECT_URLS) {
		const oldest = objectUrls.keys().next().value;
		if (!oldest) break;
		const prev = objectUrls.get(oldest);
		if (prev) URL.revokeObjectURL(prev);
		objectUrls.delete(oldest);
	}
	objectUrls.set(id, url);
}
async function resolvePlayUrl(video) {
	if (video.src) return video.src;
	const cached = objectUrls.get(video.id);
	if (cached) {
		objectUrls.delete(video.id);
		objectUrls.set(video.id, cached);
		return cached;
	}
	let file = files.get(video.id);
	if (!file) {
		const handle = fileHandles.get(video.id);
		if (handle) file = await handle.getFile();
	}
	if (!file && video.folderId && video.path) {
		const root = dirHandles.get(video.folderId);
		if (root) try {
			const segments = video.path.split("/").filter(Boolean);
			const leaf = segments.pop();
			let dir = root;
			for (const segment of segments) dir = await dir.getDirectoryHandle(segment);
			if (leaf) {
				const handle = await dir.getFileHandle(leaf);
				rememberFileHandle(video.id, handle);
				file = await handle.getFile();
			}
		} catch {}
	}
	if (!file) throw new Error("This file is no longer available. Add the folder again.");
	const url = URL.createObjectURL(file);
	rememberObjectUrl(video.id, url);
	return url;
}
var MAX_DEPTH = 14;
var MAX_DRIVE_DEPTH = 12;
function asOpts(arg) {
	if (typeof arg === "function") return { onProgress: arg };
	return arg ?? {};
}
function aborted(signal) {
	return Boolean(signal?.aborted);
}
async function yieldUi() {
	await new Promise((r) => setTimeout(r, 0));
}
var BATCH_SIZE = 250;
function inferGenre(name) {
	const text = name.toLowerCase();
	if (/\b(comedy|funny|standup|sitcom)\b/.test(text)) return "Comedy";
	if (/\b(horror|scary|slasher|ghost)\b/.test(text)) return "Horror";
	if (/\b(action|fight|battle|war)\b/.test(text)) return "Action";
	if (/\b(documentary|documentary|history|nature)\b/.test(text)) return "Documentary";
	if (/\b(sci[ .-]?fi|science fiction|space)\b/.test(text)) return "Science Fiction";
}
function maybeFlush(acc, flushed, onBatch, force = false) {
	if (!onBatch) return;
	if (!force && acc.length - flushed.n < BATCH_SIZE) return;
	if (acc.length <= flushed.n) return;
	onBatch(acc.slice(flushed.n));
	flushed.n = acc.length;
}
function throttleProgress(opts, state, progress) {
	const now = typeof performance !== "undefined" ? performance.now() : Date.now();
	if (progress.found - state.lastFound < 40 && now - state.lastAt < 150 && progress.found % 200 !== 0) return;
	state.lastAt = now;
	state.lastFound = progress.found;
	opts.onProgress?.(progress);
}
async function ingestDirectoryHandle(dir, folderId, arg) {
	const opts = asOpts(arg);
	const acc = [];
	const flushed = { n: 0 };
	const drive = opts.drive ?? isDriveName(dir.name);
	await walkHandle(dir, "", folderId, acc, dir.name, opts, flushed, 0, drive);
	if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
	return acc;
}
async function walkHandle(dir, prefix, folderId, acc, folderName, opts, flushed, depth, drive, progressState = {
	lastAt: 0,
	lastFound: 0
}) {
	if (depth > (drive ? MAX_DRIVE_DEPTH : MAX_DEPTH) || aborted(opts.signal)) return;
	const iterable = dir;
	if (typeof iterable.entries !== "function") return;
	let looked = 0;
	for await (const [name, handle] of iterable.entries()) {
		if (aborted(opts.signal)) return;
		looked += 1;
		if (handle.kind === "directory") {
			if (shouldSkipDir(name)) continue;
			await walkHandle(handle, `${prefix}${name}/`, folderId, acc, folderName, opts, flushed, depth + 1, drive, progressState);
		} else if (handle.kind === "file" && !opts.imagesOnly && isVideoFile(name)) try {
			const fileHandle = handle;
			const file = await fileHandle.getFile();
			pushVideo(acc, folderId, prefix + name, file, fileHandle);
			throttleProgress(opts, progressState, {
				found: acc.length,
				looked,
				folderName,
				current: prefix + name
			});
			maybeFlush(acc, flushed, opts.onBatch);
			if (acc.length % 20 === 0) await yieldUi();
		} catch {}
		else if (handle.kind === "file" && /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(name)) try {
			opts.onImage?.(await handle.getFile(), prefix + name);
		} catch {}
		else if (looked % 200 === 0) {
			throttleProgress(opts, progressState, {
				found: acc.length,
				looked,
				folderName,
				current: prefix + name
			});
			await yieldUi();
		}
	}
}
async function ingestFileList(list, folderId, folderName, arg) {
	const opts = asOpts(arg);
	const files = Array.from(list);
	const acc = [];
	const flushed = { n: 0 };
	let looked = 0;
	const progressState = {
		lastAt: 0,
		lastFound: 0
	};
	for (const file of files) {
		if (aborted(opts.signal)) break;
		looked += 1;
		const rel = "webkitRelativePath" in file && file.webkitRelativePath ? file.webkitRelativePath : file.name;
		const parts = rel.split("/").filter(Boolean);
		if (parts.some((p, i) => i < parts.length - 1 && shouldSkipDir(p))) continue;
		if (!isVideoFile(file.name, file.type)) continue;
		pushVideo(acc, folderId, rel, file);
		throttleProgress(opts, progressState, {
			found: acc.length,
			looked,
			folderName,
			current: rel
		});
		maybeFlush(acc, flushed, opts.onBatch);
		if (acc.length % 20 === 0) await yieldUi();
	}
	if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
	return acc;
}
function readAllEntries(reader) {
	return new Promise((resolve, reject) => {
		const out = [];
		const pump = () => {
			reader.readEntries((batch) => {
				if (!batch.length) resolve(out);
				else {
					out.push(...batch);
					pump();
				}
			}, reject);
		};
		pump();
	});
}
function entryFile(entry) {
	return new Promise((resolve, reject) => entry.file(resolve, reject));
}
async function ingestDataTransfer(dt, folderId, folderName, arg) {
	const opts = asOpts(arg);
	const acc = [];
	const flushed = { n: 0 };
	const items = dt.items;
	const entries = [];
	if (items && items.length) for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const entry = item.webkitGetAsEntry?.call(item) ?? null;
		if (entry) entries.push(entry);
	}
	if (entries.length) {
		for (const entry of entries) await walkEntry(entry, "", folderId, acc, folderName, opts, flushed, 0);
		if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
		if (acc.length) return acc;
	}
	if (dt.files?.length) return ingestFileList(dt.files, folderId, folderName, opts);
	return acc;
}
async function walkEntry(entry, prefix, folderId, acc, folderName, opts, flushed, depth) {
	if (depth > MAX_DEPTH || aborted(opts.signal)) return;
	if (entry.isDirectory) {
		if (shouldSkipDir(entry.name)) return;
		const children = await readAllEntries(entry.createReader());
		const nextPrefix = prefix ? `${prefix}${entry.name}/` : "";
		for (const child of children) await walkEntry(child, nextPrefix, folderId, acc, folderName, opts, flushed, depth + 1);
		return;
	}
	if (entry.isFile && isVideoFile(entry.name)) try {
		const file = await entryFile(entry);
		const rel = prefix ? `${prefix}${entry.name}` : entry.name;
		pushVideo(acc, folderId, rel, file);
		if (acc.length % 40 === 0 || acc.length < 5) opts.onProgress?.({
			found: acc.length,
			looked: acc.length,
			folderName,
			current: rel
		});
		maybeFlush(acc, flushed, opts.onBatch);
		if (acc.length % 20 === 0) await yieldUi();
	} catch {}
}
function pushVideo(acc, folderId, relPath, file, handle) {
	const name = file.name;
	const id = `${folderId}:${relPath}`;
	if (handle) rememberFileHandle(id, handle);
	else rememberFile(id, file);
	acc.push({
		id,
		folderId,
		name,
		path: relPath,
		extension: extensionOf(name),
		mime: file.type || mimeFromName(name),
		size: file.size,
		addedAt: Date.now(),
		genre: inferGenre(`${relPath} ${name}`)
	});
}
async function pickDirectory(startIn) {
	if (typeof window === "undefined") return "fallback";
	const picker = window.showDirectoryPicker;
	if (typeof picker !== "function") return "fallback";
	try {
		if (startIn === "drive") return await picker({
			id: "reelcase-drive",
			mode: "read"
		});
		return await picker({
			id: startIn ? `reelcase-${startIn}` : "reelcase-videos",
			mode: "read",
			startIn: startIn ?? "videos"
		});
	} catch (err) {
		if (err?.name === "AbortError") return "abort";
		return "fallback";
	}
}
async function queryDirPermission(handle) {
	const h = handle;
	if (typeof h.queryPermission !== "function") return "granted";
	return h.queryPermission({ mode: "read" });
}
async function requestDirPermission(handle) {
	const h = handle;
	if (typeof h.queryPermission !== "function") return true;
	if (await h.queryPermission({ mode: "read" }) === "granted") return true;
	if (typeof h.requestPermission !== "function") return false;
	return await h.requestPermission({ mode: "read" }) === "granted";
}
/** Tokenize for indexed search: lowercase alphanumerics, keep path-ish separators as splits. */
function tokenize(text) {
	const out = [];
	const lower = text.toLowerCase();
	let start = -1;
	for (let i = 0; i <= lower.length; i++) {
		const ch = lower.charCodeAt(i);
		if (i < lower.length && (ch >= 48 && ch <= 57 || ch >= 97 && ch <= 122 || ch === 95)) {
			if (start < 0) start = i;
		} else if (start >= 0) {
			if (i - start >= 1) out.push(lower.slice(start, i));
			start = -1;
		}
	}
	return out;
}
function haystackFor(video, tags, categories) {
	return [
		video.name,
		video.path,
		video.genre ?? "",
		video.tagline ?? "",
		video.collection ?? "",
		video.description ?? "",
		categories[video.id] ?? "",
		...tags[video.id] ?? [],
		video.remote?.channelName ?? "",
		video.remote?.channelId ?? "",
		video.remote?.kind ?? ""
	].join(" ");
}
/**
* Inverted token index over the durable catalog.
* Search is AND-of-tokens with prefix expansion so typing stays cheap
* without scanning every video field on the main thread each keystroke.
*/
var VideoSearchIndex = class {
	byToken = /* @__PURE__ */ new Map();
	docTokens = /* @__PURE__ */ new Map();
	videosRef = null;
	tagsRef = null;
	categoriesRef = null;
	clear() {
		this.byToken.clear();
		this.docTokens.clear();
		this.videosRef = null;
		this.tagsRef = null;
		this.categoriesRef = null;
	}
	unlink(id) {
		const prev = this.docTokens.get(id);
		if (!prev) return;
		for (const token of prev) {
			const set = this.byToken.get(token);
			if (!set) continue;
			set.delete(id);
			if (!set.size) this.byToken.delete(token);
		}
		this.docTokens.delete(id);
	}
	link(id, text) {
		const tokens = [...new Set(tokenize(text))];
		this.docTokens.set(id, tokens);
		for (const token of tokens) {
			let set = this.byToken.get(token);
			if (!set) {
				set = /* @__PURE__ */ new Set();
				this.byToken.set(token, set);
			}
			set.add(id);
		}
	}
	upsert(video, tags, categories) {
		this.unlink(video.id);
		this.link(video.id, haystackFor(video, tags, categories));
	}
	/** Update one locally edited document without rebuilding a very large catalog. */
	updateMetadata(video, videos, tags, categories) {
		if (this.videosRef !== videos) return;
		this.upsert(video, tags, categories);
		this.tagsRef = tags;
		this.categoriesRef = categories;
	}
	remove(id) {
		this.unlink(id);
	}
	/**
	* Sync index to current store slices. Append-only growth (ingest batches)
	* only indexes the new suffix; tag/category or reorder changes rebuild.
	*/
	sync(videos, tags, categories) {
		if (videos === this.videosRef && tags === this.tagsRef && categories === this.categoriesRef) return;
		const prevVideos = this.videosRef;
		if (!(tags !== this.tagsRef || categories !== this.categoriesRef) && prevVideos != null && videos.length >= prevVideos.length && prevVideos.every((v, i) => v === videos[i])) for (let i = prevVideos.length; i < videos.length; i++) this.upsert(videos[i], tags, categories);
		else {
			this.byToken.clear();
			this.docTokens.clear();
			for (const video of videos) this.link(video.id, haystackFor(video, tags, categories));
		}
		this.videosRef = videos;
		this.tagsRef = tags;
		this.categoriesRef = categories;
	}
	/** Matching video ids, or null when query is empty (caller keeps full list). */
	search(query) {
		const tokens = tokenize(query);
		if (!tokens.length) return null;
		let acc = null;
		for (const token of tokens) {
			const hits = this.idsForPrefix(token);
			if (!hits.size) return /* @__PURE__ */ new Set();
			if (!acc) {
				acc = hits;
				continue;
			}
			const next = /* @__PURE__ */ new Set();
			for (const id of acc) if (hits.has(id)) next.add(id);
			acc = next;
			if (!acc.size) return acc;
		}
		return acc ?? /* @__PURE__ */ new Set();
	}
	idsForPrefix(prefix) {
		if (prefix.length >= 3 && this.byToken.has(prefix)) return this.byToken.get(prefix);
		const out = /* @__PURE__ */ new Set();
		for (const [token, ids] of this.byToken) if (token.startsWith(prefix) || prefix.length >= 4 && token.includes(prefix)) for (const id of ids) out.add(id);
		return out;
	}
};
var librarySearchIndex = new VideoSearchIndex();
var imageFile = (file) => file.type.startsWith("image/") || /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(file.name);
var shortcutFile = (file) => /\.(url|lnk|exe|appref-ms)$/i.test(file.name);
var MAX_WARM_PHOTOS = 900;
function releaseDiscardedUrls(previous, next) {
	const retained = new Set(next.map((asset) => asset.url));
	for (const asset of previous) if (!retained.has(asset.url)) URL.revokeObjectURL(asset.url);
}
/** Companion assets discovered in a source picker. File handles remain browser-private. */
var useSourceAssets = create((set) => ({
	photos: [],
	shortcuts: [],
	capture: (input) => set((state) => {
		const files = Array.from(input);
		const append = (current, next) => [...current, ...next.filter((file) => !current.some((saved) => `${saved.name}:${saved.lastModified}` === `${file.name}:${file.lastModified}`))].slice(-600);
		const photoFiles = files.filter(imageFile);
		const existing = new Set(state.photos.map((asset) => `${asset.path}:${asset.file.lastModified}`));
		const incoming = photoFiles.filter((file) => {
			const key = `${file.webkitRelativePath || file.name}:${file.lastModified}`;
			if (existing.has(key)) return false;
			existing.add(key);
			return true;
		}).slice(-900);
		const overflow = Math.max(0, state.photos.length + incoming.length - MAX_WARM_PHOTOS);
		const photos = [...state.photos.slice(overflow), ...incoming.map((file) => ({
			file,
			path: file.webkitRelativePath || file.name,
			url: URL.createObjectURL(file)
		}))];
		releaseDiscardedUrls(state.photos, photos);
		return {
			photos,
			shortcuts: append(state.shortcuts, files.filter(shortcutFile))
		};
	}),
	capturePhoto: (file, path) => set((state) => {
		const key = `${path}:${file.lastModified}`;
		if (state.photos.some((asset) => `${asset.path}:${asset.file.lastModified}` === key)) return state;
		const next = [...state.photos, {
			file,
			path,
			url: URL.createObjectURL(file)
		}].slice(-900);
		releaseDiscardedUrls(state.photos, next);
		return { photos: next };
	})
}));
var restoring = false;
var remoteRefreshCursor = 0;
var REMOTE_REFRESH_BATCH_SIZE = 80;
var STARTER_FOLLOWS = [
	{
		id: "yt:starter-h3",
		kind: "youtube",
		handle: "H3Podcast",
		title: "H3 Podcast"
	},
	{
		id: "yt:starter-ltt",
		kind: "youtube",
		handle: "LinusTechTips",
		title: "Linus Tech Tips"
	},
	{
		id: "tw:starter-ironmouse",
		kind: "twitch",
		handle: "ironmouse",
		title: "Ironmouse"
	},
	{
		id: "tw:starter-zackrawrr",
		kind: "twitch",
		handle: "zackrawrr",
		title: "Zackrawrr"
	}
];
function persistNow(get) {
	const s = get();
	savePrefs({
		favorites: Object.keys(s.favorites),
		likes: Object.keys(s.likes),
		tags: s.tags,
		categories: s.categories,
		progress: s.progress,
		history: s.history,
		viewCounts: s.viewCounts,
		view: s.view,
		sort: s.sort,
		hideDemo: s.hideDemo,
		sourceId: s.sourceId === "adults" ? "home" : s.sourceId,
		hardwareAccel: s.hardwareAccel,
		privateFolderIds: s.folders.filter((f) => f.adult).map((f) => f.id),
		adultPinHash: s.adultPinHash,
		sortDir: "asc",
		extFilter: "all",
		sizeFilter: "any",
		playableOnly: false,
		groupBy: "none",
		follows: s.follows,
		notices: s.notices.slice(0, 40),
		notifyPush: s.notifyPush,
		unavailableVideoIds: Object.keys(s.unavailable)
	});
	saveActivitySnapshot({
		history: s.history,
		progress: s.progress,
		viewCounts: s.viewCounts,
		savedAt: Date.now()
	}).catch(() => void 0);
}
function persistActivity(get) {
	const s = get();
	saveActivitySnapshot({
		history: s.history,
		progress: s.progress,
		viewCounts: s.viewCounts,
		savedAt: Date.now()
	}).catch(() => void 0);
}
function mergeHistory(a, b) {
	const rows = /* @__PURE__ */ new Map();
	for (const entry of [...a, ...b]) {
		if (!entry?.id || !Number.isFinite(entry.at)) continue;
		const key = `${entry.id}:${entry.at}:${entry.source ?? "open"}`;
		if (!rows.has(key)) rows.set(key, entry);
	}
	return [...rows.values()].sort((left, right) => right.at - left.at);
}
var persistTimer$1 = null;
function persistSoon(get) {
	if (typeof window === "undefined") {
		persistNow(get);
		return;
	}
	if (persistTimer$1 != null) return;
	persistTimer$1 = setTimeout(() => {
		persistTimer$1 = null;
		persistNow(get);
	}, 900);
}
function flushPersist(get) {
	if (persistTimer$1 != null) {
		clearTimeout(persistTimer$1);
		persistTimer$1 = null;
	}
	persistNow(get);
}
function mergeVideos(existing, incoming) {
	const map = new Map(existing.map((v) => [v.id, v]));
	for (const v of incoming) map.set(v.id, v);
	return Array.from(map.values());
}
function cacheRemotes(get) {
	const s = get();
	saveRemoteSnapshot({
		videos: s.videos.filter((v) => v.remote && !v.isSample),
		folders: s.folders.filter((f) => f.kind === "youtube" || f.kind === "twitch"),
		checkedAt: s.remoteCheckedAt
	}).catch(() => void 0);
}
var remoteCacheTimer = null;
function cacheRemotesSoon(get) {
	if (typeof window === "undefined") {
		cacheRemotes(get);
		return;
	}
	if (remoteCacheTimer != null) return;
	remoteCacheTimer = setTimeout(() => {
		remoteCacheTimer = null;
		cacheRemotes(get);
	}, 1200);
}
function canonicalFollowHandle(kind, raw) {
	const value = raw.trim().replaceAll("\\_", "_").toLowerCase();
	if (kind === "twitch") return (value.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([^/?#]+)/i)?.[1] ?? value.replace(/^tw:/, "")).replace(/^@/, "").replace(/[^a-z0-9_]/g, "");
	return (value.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:@|channel\/)?([^/?#]+)/i)?.[1] ?? value).replace(/^@/, "").replace(/[^a-z0-9_-]/g, "");
}
function dedupeFollows(rows) {
	const seen = /* @__PURE__ */ new Set();
	return rows.filter((row) => {
		const key = `${row.kind}:${canonicalFollowHandle(row.kind, row.handle || row.id)}`;
		if (!key || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function remoteMetadataTags(video) {
	const creator = video.remote?.channelName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "";
	const provider = video.remote?.kind ? `provider-${video.remote.kind}` : "";
	const format = video.remote?.live ? "format-live" : video.remote ? "format-vod" : "";
	const twitchFormat = video.remote?.kind === "twitch" ? video.remote.live ? "twitch-live" : "twitch-vod" : "";
	const genre = video.genre?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const twitchGame = video.remote?.kind === "twitch" && genre ? `twitch-game-${genre}` : "";
	return [...new Set([
		provider,
		creator,
		format,
		twitchFormat,
		genre ? `genre-${genre}` : "",
		twitchGame,
		...semanticTags(video),
		...descriptionKeywordTags(video)
	].filter(Boolean))].slice(0, 40);
}
function descriptionKeywordTags(video) {
	const ignored = /* @__PURE__ */ new Set([
		"about",
		"after",
		"also",
		"because",
		"being",
		"between",
		"channel",
		"click",
		"creator",
		"description",
		"from",
		"have",
		"here",
		"just",
		"more",
		"next",
		"official",
		"please",
		"really",
		"subscribe",
		"that",
		"this",
		"through",
		"today",
		"video",
		"watch",
		"with",
		"youtube",
		"your"
	]);
	const words = `${video.remote?.channelName ?? ""} ${video.name} ${video.description ?? video.tagline ?? ""}`.toLowerCase().match(/[a-z][a-z0-9-]{3,30}/g) ?? [];
	const seen = /* @__PURE__ */ new Set();
	const tags = [];
	for (const word of words) {
		if (ignored.has(word) || seen.has(word)) continue;
		seen.add(word);
		tags.push(word);
		if (tags.length >= 20) break;
	}
	return tags;
}
/** Local, explainable semantic taxonomy. It runs over provider titles and descriptions only—never media bytes or uploads. */
function semanticTags(video) {
	const text = `${video.name} ${video.path} ${video.tagline ?? ""} ${video.description ?? ""}`.toLowerCase();
	const tags = [
		[/\b(game|gaming|playthrough|speedrun|walkthrough|minecraft|steam)\b/, "gaming"],
		[/\b(tech|software|coding|programming|computer|ai|gadget)\b/, "technology"],
		[/\b(news|politic|election|debate|commentary)\b/, "news-commentary"],
		[/\b(music|song|album|concert|cover|playlist)\b/, "music"],
		[/\b(movie|film|cinema|trailer|review)\b/, "film"],
		[/\b(anime|manga|japan|otaku)\b/, "anime"],
		[/\b(food|cook|recipe|restaurant|kitchen)\b/, "food"],
		[/\b(travel|trip|tour|flight|hotel|beach)\b/, "travel"],
		[/\b(fitness|workout|gym|health|sport)\b/, "fitness"],
		[/\b(science|space|history|documentary|education)\b/, "learning"],
		[/\b(comedy|funny|sketch|standup|meme)\b/, "comedy"],
		[/\b(asmr|relax|sleep|ambient|meditation)\b/, "relaxing"],
		[/\b(podcast|interview|talk|discussion)\b/, "talk"],
		[/\b(react|reaction|drama|tea|opinion)\b/, "commentary"],
		[/\b(art|drawing|painting|design|animation)\b/, "creative"],
		[/\b(animal|wildlife|zoo|nature)\b/, "nature"],
		[/\b(finance|money|business|investing)\b/, "business"],
		[/\b(fashion|beauty|makeup|style)\b/, "style"],
		[/\b(car|cars|driving|racing|automotive|motorcycle)\b/, "motors"],
		[/\b(horror|scary|creepy|ghost|true crime)\b/, "horror"],
		[/\b(diy|repair|build|woodwork|maker|restoration)\b/, "maker"],
		[/\b(soccer|football|basketball|baseball|esports|tournament)\b/, "sports"],
		[/\b(science|space|physics|biology|chemistry)\b/, "science"],
		[/\b(relationship|dating|love|couple)\b/, "relationships"],
		[/\b(mental health|therapy|psychology|mindfulness)\b/, "wellbeing"],
		[/\b(language|linguistics|learn \w+|lesson|tutorial)\b/, "skills"],
		[/\b(hardware|pc build|keyboard|phone|camera)\b/, "hardware"],
		[/\b(legal|court|law|lawsuit)\b/, "legal"]
	].filter(([pattern]) => pattern.test(text)).map(([, tag]) => tag);
	if (video.remote?.kind === "youtube" && ((video.duration ?? 0) > 0 && (video.duration ?? 0) < 90 || /(?:#|\b)shorts?\b/i.test(text))) tags.push("shorts", "short-form");
	if (video.remote?.kind === "twitch" && !video.remote.live && (video.duration ?? 0) > 0 && (video.duration ?? 0) < 120) tags.push("clip");
	if ((video.duration ?? 0) >= 3600) tags.push("long-form");
	return tags;
}
function localNameTags(video) {
	const text = `${video.name} ${video.path}`.toLowerCase();
	const added = new Date(video.addedAt);
	const dateTags = Number.isFinite(added.getTime()) ? [`year-${added.getFullYear()}`, `month-${added.toLocaleString("en-US", { month: "long" }).toLowerCase()}`] : [];
	const nameTags = video.name.replace(/\.[^.]+$/, "").toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !/^(video|movie|final|copy|edit|the|with|from)$/.test(word)).slice(0, 4);
	const sourceName = video.path.split(/[\\/]/).find(Boolean)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const tags = [
		video.genre?.toLowerCase(),
		`type-${video.extension.replace(/^\./, "").toLowerCase()}`,
		sourceName ? `source-${sourceName}` : "",
		...dateTags,
		...semanticTags(video),
		...nameTags
	];
	if (/\b(open source|creative commons|blender|public domain)\b/.test(text)) tags.push("open-source");
	if (/\b(trailer|teaser)\b/.test(text)) tags.push("trailer");
	if (/\b(1080p|2160p|4k|720p)\b/.test(text)) tags.push(text.match(/\b(2160p|4k|1080p|720p)\b/)?.[1] ?? "hd");
	return tags.filter((tag) => Boolean(tag));
}
function addLocalNameTags(existing, videos) {
	const next = { ...existing };
	for (const video of videos) {
		const inferred = localNameTags(video);
		if (!inferred.length) continue;
		next[video.id] = [.../* @__PURE__ */ new Set([...next[video.id] ?? [], ...inferred])].slice(0, 18);
	}
	return next;
}
function applyPrefs(partial) {
	const prefs = loadPrefs();
	if (!prefs) return partial;
	const favorites = {};
	const likes = {};
	for (const id of prefs.favorites ?? []) favorites[id] = true;
	for (const id of prefs.likes ?? []) likes[id] = true;
	return {
		...partial,
		favorites,
		likes,
		tags: prefs.tags ?? {},
		categories: prefs.categories ?? {},
		progress: prefs.progress ?? {},
		history: prefs.history ?? [],
		viewCounts: prefs.viewCounts ?? {},
		view: prefs.view ?? "grid",
		sort: prefs.sort ?? "name",
		hideDemo: true,
		sourceId: prefs.sourceId === "adults" ? "home" : prefs.sourceId ?? "home",
		hardwareAccel: prefs.hardwareAccel ?? true,
		adultPinHash: prefs.adultPinHash ?? null,
		follows: dedupeFollows(prefs.follows ?? []),
		notices: prefs.notices ?? [],
		notifyPush: prefs.notifyPush ?? false,
		unavailable: Object.fromEntries((prefs.unavailableVideoIds ?? []).map((id) => [id, true]))
	};
}
function adultIdSet(folders) {
	return new Set(folders.filter((f) => f.adult).map((f) => f.id));
}
function isAdultVideo(video, folders) {
	return adultIdSet(folders).has(video.folderId);
}
var useLibrary = create((set, get) => ({
	folders: [],
	videos: [],
	query: "",
	sort: "added",
	view: "grid",
	sourceId: "home",
	favorites: {},
	likes: {},
	tags: {},
	categories: {},
	progress: {},
	history: [],
	viewCounts: {},
	hideDemo: true,
	hardwareAccel: true,
	adultPinHash: null,
	adultsUnlocked: false,
	activeId: null,
	previewId: null,
	scanning: null,
	hydrated: false,
	follows: STARTER_FOLLOWS,
	notices: [],
	unavailable: {},
	notifyPush: false,
	remoteBusy: false,
	refreshing: false,
	remoteCheckedAt: 0,
	importProgress: null,
	setQuery: (query) => set({ query }),
	setSort: (sort) => {
		set({ sort });
		persistNow(get);
	},
	setView: (view) => {
		set({ view });
		persistNow(get);
	},
	setSource: (sourceId) => {
		set({ sourceId });
		persistNow(get);
	},
	toggleFavorite: (id) => {
		set((s) => {
			const favorites = { ...s.favorites };
			if (favorites[id]) delete favorites[id];
			else favorites[id] = true;
			return { favorites };
		});
		persistSoon(get);
		cacheRemotesSoon(get);
	},
	toggleLike: (id) => {
		set((s) => {
			const likes = { ...s.likes };
			if (likes[id]) delete likes[id];
			else likes[id] = true;
			return { likes };
		});
		persistSoon(get);
		cacheRemotesSoon(get);
	},
	setVideoTags: (id, tags) => {
		set((s) => ({ tags: {
			...s.tags,
			[id]: [...new Set(tags.map((tag) => tag.trim().toLowerCase().replace(/^keyword-/, "")).filter(Boolean))].slice(0, 18)
		} }));
		const state = get();
		const video = state.videos.find((item) => item.id === id);
		if (video) librarySearchIndex.updateMetadata(video, state.videos, state.tags, state.categories);
		persistNow(get);
	},
	autoTagLibrary: () => {
		let changed = 0;
		set((s) => {
			const tags = { ...s.tags };
			for (const video of s.videos) {
				const inferred = video.remote ? remoteMetadataTags(video) : localNameTags(video);
				const existing = (tags[video.id] ?? []).map((tag) => tag.replace(/^keyword-/i, "").replace(/^creator-/i, ""));
				const merged = [.../* @__PURE__ */ new Set([...existing, ...inferred])].slice(0, 40);
				if (merged.length !== (tags[video.id] ?? []).length) changed += 1;
				tags[video.id] = merged;
			}
			return { tags };
		});
		const state = get();
		librarySearchIndex.sync(state.videos, state.tags, state.categories);
		persistNow(get);
		return changed;
	},
	setVideoCategory: (id, category) => {
		set((s) => ({ categories: {
			...s.categories,
			[id]: category.trim().slice(0, 40)
		} }));
		const state = get();
		const video = state.videos.find((item) => item.id === id);
		if (video) librarySearchIndex.updateMetadata(video, state.videos, state.tags, state.categories);
		persistNow(get);
	},
	markProgress: (id, t, d) => {
		const now = Date.now();
		const previous = get().progress[id];
		if (previous && now - previous.at < 2500 && Math.abs(previous.t - t) < 4) return;
		set((s) => {
			const latest = s.history[0];
			const history = t >= 2 && (!latest || latest.id !== id || now - latest.at > 6e4) ? [{
				id,
				at: now,
				position: t,
				duration: d,
				source: "progress"
			}, ...s.history] : s.history;
			return {
				progress: {
					...s.progress,
					[id]: {
						t,
						d,
						at: now
					}
				},
				history
			};
		});
		persistActivity(get);
		persistSoon(get);
	},
	recordPlay: (id, source = "open") => {
		set((s) => {
			const now = Date.now();
			const latest = s.history[0];
			if (latest?.id === id && now - latest.at < 2e4) return {};
			const mark = s.progress[id];
			const video = s.videos.find((item) => item.id === id);
			const url = video?.remote?.embedUrl ?? video?.src;
			return {
				history: [{
					id,
					at: now,
					position: mark?.t,
					duration: mark?.d,
					source,
					...url ? { url } : {}
				}, ...s.history],
				viewCounts: {
					...s.viewCounts,
					[id]: (s.viewCounts[id] ?? 0) + 1
				}
			};
		});
		persistActivity(get);
		persistSoon(get);
	},
	clearHistory: () => {
		set({ history: [] });
		persistNow(get);
	},
	openVideo: (activeId) => {
		const s = get();
		const video = s.videos.find((v) => v.id === activeId);
		if (video && isAdultVideo(video, s.folders) && !s.adultsUnlocked) {
			set({ sourceId: "adults" });
			persistNow(get);
			return;
		}
		set({
			activeId,
			previewId: null
		});
		get().recordPlay(activeId);
	},
	openPreview: (previewId) => set({ previewId }),
	closePreview: () => set({ previewId: null }),
	closePlayer: () => set({ activeId: null }),
	removeVideo: (id) => {
		set((s) => {
			const favorites = { ...s.favorites };
			const likes = { ...s.likes };
			const tags = { ...s.tags };
			const categories = { ...s.categories };
			const progress = { ...s.progress };
			const viewCounts = { ...s.viewCounts };
			delete favorites[id];
			delete likes[id];
			delete tags[id];
			delete categories[id];
			delete progress[id];
			delete viewCounts[id];
			return {
				videos: s.videos.filter((video) => video.id !== id),
				activeId: s.activeId === id ? null : s.activeId,
				previewId: s.previewId === id ? null : s.previewId,
				favorites,
				likes,
				tags,
				categories,
				progress,
				viewCounts,
				history: s.history.filter((h) => h.id !== id)
			};
		});
		persistNow(get);
	},
	playRelative: (delta, playlist) => {
		const { activeId } = get();
		if (!activeId || !playlist.length) return;
		const i = playlist.indexOf(activeId);
		if (i < 0) return;
		const next = playlist[i + delta];
		if (next) get().openVideo(next);
	},
	setHideDemo: (hideDemo) => {
		set((s) => ({
			hideDemo,
			sourceId: hideDemo && s.sourceId === "demo" ? "home" : s.sourceId
		}));
		persistNow(get);
	},
	setHardwareAccel: (hardwareAccel) => {
		set({ hardwareAccel });
		persistNow(get);
	},
	setFolderAdult: (folderId, adult) => {
		if (folderId === "demo") return;
		set((s) => ({
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				adult
			} : f),
			sourceId: adult ? "adults" : s.sourceId === folderId ? "home" : s.sourceId,
			activeId: s.activeId && s.videos.some((v) => v.id === s.activeId && v.folderId === folderId) && adult && !s.adultsUnlocked ? null : s.activeId
		}));
		persistNow(get);
	},
	setAdultPin: async (pin) => {
		if (!isPinShape(pin)) return false;
		set({
			adultPinHash: await hashPin(pin),
			adultsUnlocked: true
		});
		persistNow(get);
		return true;
	},
	unlockAdults: async (pin) => {
		const { adultPinHash } = get();
		if (!adultPinHash || !isPinShape(pin)) return false;
		if (await hashPin(pin) !== adultPinHash) return false;
		set({
			adultsUnlocked: true,
			sourceId: "adults"
		});
		return true;
	},
	lockAdults: () => {
		set((s) => {
			const current = s.videos.find((v) => v.id === s.activeId);
			const hidePlayer = current ? isAdultVideo(current, s.folders) : false;
			return {
				adultsUnlocked: false,
				sourceId: s.sourceId === "adults" ? "home" : s.sourceId,
				activeId: hidePlayer ? null : s.activeId
			};
		});
	},
	resetAdultPin: () => {
		set({
			adultPinHash: null,
			adultsUnlocked: false
		});
		persistNow(get);
	},
	addFolder: async (inputEl, startIn, opts) => {
		const result = await pickDirectory(startIn);
		if (result === "abort") return;
		if (result === "fallback") {
			inputEl?.click();
			return;
		}
		const handle = result;
		if (!await requestDirPermission(handle)) return;
		const folderId = `folder:${handle.name}:${crypto.randomUUID().slice(0, 8)}`;
		rememberDirHandle(folderId, handle);
		const adult = Boolean(opts?.adult);
		const folder = {
			id: folderId,
			name: handle.name,
			kind: "directory",
			videoCount: 0,
			recommended: startIn,
			adult
		};
		set((s) => ({
			folders: [...s.folders.filter((f) => f.id !== folderId), folder],
			scanning: {
				found: 0,
				looked: 0,
				folderName: handle.name
			},
			sourceId: adult ? "adults" : folderId
		}));
		let writeChain = clearFolderVideos(folderId).catch(() => void 0);
		let discoveredPhotos = 0;
		try {
			const videos = await ingestDirectoryHandle(handle, folderId, {
				onProgress: (p) => set({ scanning: p }),
				onImage: (file, relativePath) => {
					discoveredPhotos += 1;
					useSourceAssets.getState().capturePhoto(file, `${handle.name}/${relativePath}`);
				},
				onBatch: (batch) => {
					if (!batch.length) return;
					set((s) => ({
						videos: s.videos.concat(batch),
						folders: s.folders.map((f) => f.id === folderId ? {
							...f,
							videoCount: (f.videoCount ?? 0) + batch.length
						} : f)
					}));
					writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
				}
			});
			await writeChain;
			set((s) => ({
				folders: s.folders.map((f) => f.id === folderId ? {
					...f,
					videoCount: videos.length,
					photoCount: discoveredPhotos
				} : f),
				scanning: null,
				sourceId: adult ? "adults" : videos.length ? folderId : discoveredPhotos ? "photos" : s.sourceId
			}));
			if (videos.length) set((s) => ({ tags: addLocalNameTags(s.tags, videos) }));
			flushPersist(get);
			await saveDirHandle({
				id: folderId,
				name: handle.name,
				handle
			});
			if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
		} catch (err) {
			set({ scanning: null });
			throw err;
		}
	},
	addFiles: async (inputEl) => {
		inputEl?.click();
	},
	ingestFromInput: async (files, asDirectory, opts) => {
		if (!files.length) return;
		useSourceAssets.getState().capture(files);
		const rel = files[0].webkitRelativePath || "";
		const folderName = asDirectory ? rel.split("/")[0] || "Folder" : "Added files";
		const folderId = asDirectory ? `folder:${folderName}:${crypto.randomUUID().slice(0, 8)}` : `files:${crypto.randomUUID().slice(0, 8)}`;
		const adult = Boolean(opts?.adult) || get().sourceId === "adults";
		const folder = {
			id: folderId,
			name: folderName,
			kind: asDirectory ? "directory" : "files",
			videoCount: 0,
			adult
		};
		set((s) => ({
			folders: [...s.folders, folder],
			scanning: {
				found: 0,
				looked: 0,
				folderName
			},
			sourceId: adult ? "adults" : folderId
		}));
		let writeChain = Promise.resolve();
		const videos = await ingestFileList(files, folderId, folderName, {
			onProgress: (p) => set({ scanning: p }),
			onBatch: (batch) => {
				if (!batch.length) return;
				set((s) => ({
					videos: s.videos.concat(batch),
					folders: s.folders.map((f) => f.id === folderId ? {
						...f,
						videoCount: (f.videoCount ?? 0) + batch.length
					} : f)
				}));
				writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
			}
		});
		await writeChain;
		set((s) => ({
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				videoCount: videos.length
			} : f),
			scanning: null,
			sourceId: adult ? "adults" : videos.length ? folderId : s.sourceId
		}));
		if (videos.length) set((s) => ({ tags: addLocalNameTags(s.tags, videos) }));
		flushPersist(get);
		if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
	},
	ingestDrop: async (dt) => {
		const nameGuess = dt.files?.[0]?.webkitRelativePath?.split("/")[0] || dt.files?.[0]?.name || "Dropped files";
		const folderId = `drop:${crypto.randomUUID().slice(0, 8)}`;
		const adult = get().sourceId === "adults";
		set((s) => ({
			folders: [...s.folders, {
				id: folderId,
				name: nameGuess,
				kind: "files",
				videoCount: 0,
				adult
			}],
			scanning: {
				found: 0,
				looked: 0,
				folderName: nameGuess
			}
		}));
		let writeChain = Promise.resolve();
		const videos = await ingestDataTransfer(dt, folderId, nameGuess, {
			onProgress: (p) => set({ scanning: p }),
			onBatch: (batch) => {
				if (!batch.length) return;
				set((s) => ({
					videos: s.videos.concat(batch),
					folders: s.folders.map((f) => f.id === folderId ? {
						...f,
						videoCount: (f.videoCount ?? 0) + batch.length
					} : f)
				}));
				writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
			}
		});
		await writeChain;
		const folderName = videos[0]?.path.includes("/") ? videos[0].path.split("/")[0] : "Dropped files";
		set((s) => ({
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				name: folderName,
				kind: videos.some((v) => v.path.includes("/")) ? "directory" : "files",
				videoCount: videos.length
			} : f),
			scanning: null,
			sourceId: adult ? "adults" : videos.length ? folderId : s.sourceId
		}));
		if (videos.length) set((s) => ({ tags: addLocalNameTags(s.tags, videos) }));
		flushPersist(get);
		if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
	},
	restoreFolders: async () => {
		if (get().hydrated || restoring) return;
		restoring = true;
		const prefsState = applyPrefs({});
		const adultIds = new Set(loadPrefs()?.privateFolderIds ?? []);
		let cachedFolderIds = /* @__PURE__ */ new Set();
		let savedHealth = /* @__PURE__ */ new Map();
		set({ ...prefsState });
		loadActivitySnapshot().then((activity) => {
			if (!activity) return;
			set((s) => ({
				history: mergeHistory(s.history, activity.history ?? []),
				progress: {
					...activity.progress,
					...s.progress
				},
				viewCounts: {
					...activity.viewCounts,
					...s.viewCounts
				}
			}));
		}).catch(() => void 0);
		try {
			const snapshot = await loadRemoteSnapshot();
			if (snapshot) {
				const ids = new Set(get().follows.map((channel) => channel.id));
				set((s) => ({
					videos: mergeVideos(s.videos, snapshot.videos.filter((v) => ids.has(v.folderId) || s.favorites[v.id] || s.likes[v.id])),
					folders: [...s.folders.filter((f) => !snapshot.folders.some((saved) => saved.id === f.id)), ...snapshot.folders.filter((f) => ids.has(f.id))],
					remoteCheckedAt: snapshot.checkedAt
				}));
			}
		} catch {}
		set({ hydrated: true });
		restoring = false;
		if (typeof window !== "undefined") {
			const recover = async (kind) => {
				try {
					const saved = JSON.parse(localStorage.getItem(`reelcase.import-history.${kind}`) ?? "[]");
					if (!Array.isArray(saved) || !saved.length) return;
					await get().importBatch(saved.filter((value) => typeof value === "string" && Boolean(value.trim())).slice(0, 80).map((query) => ({
						query,
						kind
					})));
				} catch {}
			};
			(async () => {
				await recover("twitch");
				await recover("youtube");
			})();
		}
		try {
			const [catalog, healthRows] = await Promise.all([loadCatalogVideos(), loadSourceHealth()]);
			savedHealth = new Map(healthRows.map((entry) => [entry.id, entry]));
			cachedFolderIds = new Set(catalog.map((video) => video.folderId));
			if (catalog.length) {
				const counts = /* @__PURE__ */ new Map();
				for (const v of catalog) counts.set(v.folderId, (counts.get(v.folderId) ?? 0) + 1);
				set((s) => ({
					videos: mergeVideos(s.videos, catalog),
					folders: [...s.folders, ...[...counts.entries()].filter(([id]) => !s.folders.some((f) => f.id === id)).map(([id, videoCount]) => ({
						id,
						name: id.split(":")[1] || id,
						kind: "directory",
						videoCount,
						adult: adultIds.has(id),
						needsPermission: true
					}))].map((f) => counts.has(f.id) ? {
						...f,
						videoCount: counts.get(f.id) ?? f.videoCount,
						...savedHealth.get(f.id) ?? {}
					} : f)
				}));
			}
		} catch {}
		let stored = [];
		try {
			stored = await loadDirHandles();
		} catch {
			return;
		}
		for (const row of stored) {
			rememberDirHandle(row.id, row.handle);
			let perm = "prompt";
			try {
				perm = await queryDirPermission(row.handle);
			} catch {
				perm = "prompt";
			}
			const adult = adultIds.has(row.id);
			if (localStorage.getItem("reelcase.source-cache-first") !== "false" && cachedFolderIds.has(row.id)) {
				const snapshot = {
					id: row.id,
					health: "cached",
					lastCheckedAt: Date.now(),
					videoCount: savedHealth.get(row.id)?.videoCount ?? 0
				};
				set((s) => ({ folders: s.folders.map((folder) => folder.id === row.id ? {
					...folder,
					name: row.name,
					needsPermission: false,
					...snapshot
				} : folder) }));
				saveSourceHealth(snapshot).catch(() => void 0);
				continue;
			}
			if (perm === "granted") {
				set((s) => ({
					scanning: {
						found: 0,
						looked: 0,
						folderName: row.name
					},
					folders: [...s.folders.filter((f) => f.id !== row.id), {
						id: row.id,
						name: row.name,
						kind: "directory",
						videoCount: 0,
						adult
					}],
					videos: s.videos.filter((v) => v.folderId !== row.id)
				}));
				let writeChain = clearFolderVideos(row.id).catch(() => void 0);
				try {
					const videos = await ingestDirectoryHandle(row.handle, row.id, {
						onProgress: (p) => set({ scanning: p }),
						onBatch: (batch) => {
							if (!batch.length) return;
							set((s) => ({
								videos: s.videos.concat(batch),
								folders: s.folders.map((f) => f.id === row.id ? {
									...f,
									videoCount: (f.videoCount ?? 0) + batch.length
								} : f)
							}));
							writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
						}
					});
					await writeChain;
					set((s) => ({
						folders: s.folders.map((f) => f.id === row.id ? {
							...f,
							videoCount: videos.length,
							needsPermission: false,
							health: "healthy",
							lastCheckedAt: Date.now()
						} : f),
						scanning: null
					}));
					if (videos.length) await saveFolderVideos(row.id, videos).catch(() => void 0);
					saveSourceHealth({
						id: row.id,
						health: "healthy",
						lastCheckedAt: Date.now(),
						videoCount: videos.length
					}).catch(() => void 0);
				} catch {
					saveSourceHealth({
						id: row.id,
						health: "unavailable",
						lastCheckedAt: Date.now(),
						videoCount: 0
					}).catch(() => void 0);
					set((s) => ({
						scanning: null,
						folders: [...s.folders.filter((f) => f.id !== row.id), {
							id: row.id,
							name: row.name,
							kind: "directory",
							videoCount: 0,
							needsPermission: true,
							health: "unavailable",
							lastCheckedAt: Date.now(),
							adult
						}]
					}));
				}
			} else {
				saveSourceHealth({
					id: row.id,
					health: "permission-needed",
					lastCheckedAt: Date.now(),
					videoCount: savedHealth.get(row.id)?.videoCount ?? 0
				}).catch(() => void 0);
				set((s) => ({ folders: [...s.folders.filter((f) => f.id !== row.id), {
					id: row.id,
					name: row.name,
					kind: "directory",
					videoCount: s.folders.find((f) => f.id === row.id)?.videoCount ?? 0,
					needsPermission: true,
					health: "permission-needed",
					lastCheckedAt: Date.now(),
					adult
				}] }));
			}
		}
	},
	restoreOne: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle) return;
		if (!await requestDirPermission(handle)) return;
		const folder = get().folders.find((f) => f.id === folderId);
		const name = folder?.name ?? handle.name;
		const resumeByPath = new Map(get().videos.filter((video) => video.folderId === folderId).map((video) => [video.path, get().progress[video.id]]));
		const retainedRecoveryIds = /* @__PURE__ */ new Set([
			...get().history.map((entry) => entry.id),
			...Object.keys(get().favorites),
			...Object.keys(get().likes)
		]);
		set((s) => ({
			scanning: {
				found: 0,
				looked: 0,
				folderName: name
			},
			videos: s.videos.filter((v) => v.folderId !== folderId || retainedRecoveryIds.has(v.id)),
			unavailable: Object.fromEntries(Object.entries(s.unavailable).filter(([id]) => !s.videos.some((video) => video.id === id && video.folderId === folderId))),
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				videoCount: 0,
				needsPermission: false
			} : f)
		}));
		let writeChain = clearFolderVideos(folderId).catch(() => void 0);
		const videos = await ingestDirectoryHandle(handle, folderId, {
			onProgress: (p) => set({ scanning: p }),
			onBatch: (batch) => {
				if (!batch.length) return;
				set((s) => ({
					videos: s.videos.concat(batch.filter((video) => !s.videos.some((existing) => existing.id === video.id))),
					folders: s.folders.map((f) => f.id === folderId ? {
						...f,
						videoCount: (f.videoCount ?? 0) + batch.length
					} : f)
				}));
				writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
			}
		});
		await writeChain;
		const recoveredProgress = videos.reduce((next, video) => {
			const mark = resumeByPath.get(video.path);
			if (mark) next[video.id] = mark;
			return next;
		}, {});
		set((s) => ({
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				videoCount: videos.length,
				needsPermission: false
			} : f),
			scanning: null,
			sourceId: folder?.adult ? "adults" : folderId,
			progress: {
				...s.progress,
				...recoveredProgress
			}
		}));
		if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
	},
	repairArtworkSource: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle || await queryDirPermission(handle) !== "granted") return false;
		await get().restoreOne(folderId);
		return true;
	},
	refreshSourcePhotos: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle) return 0;
		try {
			if (await queryDirPermission(handle) !== "granted") return 0;
			let photoCount = 0;
			await ingestDirectoryHandle(handle, folderId, {
				imagesOnly: true,
				onImage: (file, relativePath) => {
					photoCount += 1;
					useSourceAssets.getState().capturePhoto(file, `${handle.name}/${relativePath}`);
				}
			});
			set((s) => ({ folders: s.folders.map((folder) => folder.id === folderId ? {
				...folder,
				photoCount,
				needsPermission: false
			} : folder) }));
			return photoCount;
		} catch {
			return 0;
		}
	},
	removeFolder: async (folderId) => {
		if (folderId === "demo") {
			get().setHideDemo(true);
			return;
		}
		const ids = get().videos.filter((v) => v.folderId === folderId).map((v) => v.id);
		forgetFolder(folderId, ids);
		set((s) => {
			const favorites = { ...s.favorites };
			const likes = { ...s.likes };
			const tags = { ...s.tags };
			const categories = { ...s.categories };
			const progress = { ...s.progress };
			for (const id of ids) {
				delete favorites[id];
				delete likes[id];
				delete tags[id];
				delete categories[id];
				delete progress[id];
			}
			return {
				folders: s.folders.filter((f) => f.id !== folderId),
				videos: s.videos.filter((v) => v.folderId !== folderId),
				favorites,
				likes,
				tags,
				categories,
				progress,
				history: s.history.filter((h) => !ids.includes(h.id)),
				sourceId: s.sourceId === folderId ? "home" : s.sourceId,
				activeId: s.activeId && ids.includes(s.activeId) ? null : s.activeId,
				previewId: s.previewId && ids.includes(s.previewId) ? null : s.previewId
			};
		});
		persistNow(get);
		try {
			await deleteDirHandle(folderId);
		} catch {}
	},
	followRemoteQuery: async (query, kind = "auto") => {
		set({ remoteBusy: true });
		try {
			const { followRemote } = await import("./api-CeYPgULp.mjs");
			const result = await followRemote({ data: {
				query,
				kind
			} });
			set((s) => {
				const follows = [result.channel, ...s.follows.filter((f) => f.id !== result.channel.id)];
				const folder = {
					id: result.channel.id,
					name: result.channel.title,
					kind: result.channel.kind,
					videoCount: result.videos.length
				};
				return {
					follows,
					folders: [...s.folders.filter((f) => f.id !== folder.id), folder],
					videos: mergeVideos(s.videos.filter((v) => v.folderId !== result.channel.id || s.favorites[v.id] || s.likes[v.id]), result.videos),
					tags: {
						...s.tags,
						...Object.fromEntries(result.videos.map((video) => [video.id, [.../* @__PURE__ */ new Set([...s.tags[video.id] ?? [], ...remoteMetadataTags(video)])]]))
					},
					sourceId: result.channel.kind,
					remoteBusy: false
				};
			});
			persistNow(get);
			cacheRemotes(get);
			get().pushNotice({
				title: `Following ${result.channel.title}`,
				body: result.channel.kind === "twitch" ? result.channel.live ? "Live right now." : "You'll be notified when they go live." : `${result.videos.length} latest video${result.videos.length === 1 ? "" : "s"} pulled in.`,
				kind: result.channel.kind
			});
		} catch (err) {
			set({ remoteBusy: false });
			throw err;
		}
	},
	importBatch: async (items) => {
		const savedHandles = new Set(get().follows.map((follow) => `${follow.kind}:${canonicalFollowHandle(follow.kind, follow.handle)}`));
		const seenQueries = /* @__PURE__ */ new Set();
		const unique = items.map((i) => ({
			query: i.query.trim().replaceAll("\\_", "_"),
			kind: i.kind
		})).filter((i) => {
			const handle = canonicalFollowHandle(i.kind, i.query);
			const key = `${i.kind}:${handle}`;
			if (!i.query || !handle || seenQueries.has(key) || savedHandles.has(key)) return false;
			seenQueries.add(key);
			return true;
		});
		if (!unique.length) return {
			ok: 0,
			failed: 0,
			failedQueries: [],
			failedReasons: {}
		};
		const existing = new Set(get().follows.map((f) => f.id));
		set({
			remoteBusy: true,
			importProgress: {
				done: 0,
				total: unique.length,
				label: "Importing"
			}
		});
		let ok = 0;
		let failed = 0;
		const failedQueries = [];
		const failedReasons = {};
		const chunk = 20;
		try {
			const { importChannels } = await import("./api-CeYPgULp.mjs");
			for (let i = 0; i < unique.length; i += chunk) {
				const slice = unique.slice(i, i + chunk);
				let result;
				try {
					result = await Promise.race([importChannels({ data: { items: slice } }), new Promise((_, reject) => window.setTimeout(() => reject(/* @__PURE__ */ new Error("Provider request timed out")), 2e4))]);
				} catch (error) {
					failed += slice.length;
					failedQueries.push(...slice.map((item) => item.query));
					const reason = error instanceof Error && error.message ? error.message : "Provider request failed before public metadata could be read";
					for (const item of slice) failedReasons[item.query] = reason;
					set({ importProgress: {
						done: Math.min(i + slice.length, unique.length),
						total: unique.length,
						label: "Retrying next batch"
					} });
					continue;
				}
				ok += result.ok.length;
				failed += result.failed;
				if (result.failedQueries?.length) {
					failedQueries.push(...result.failedQueries);
					for (const query of result.failedQueries) failedReasons[query] = "Channel was not found publicly, is unavailable, or provider metadata could not be read";
				}
				set((s) => {
					let follows = s.follows;
					let folders = s.folders;
					let videos = s.videos;
					for (const row of result.ok) {
						const key = canonicalFollowHandle(row.channel.kind, row.channel.handle);
						follows = [row.channel, ...follows.filter((f) => canonicalFollowHandle(f.kind, f.handle) !== key)];
						const folder = {
							id: row.channel.id,
							name: row.channel.title,
							kind: row.channel.kind,
							videoCount: row.videos.length
						};
						folders = [...folders.filter((f) => f.id !== folder.id), folder];
						videos = mergeVideos(videos.filter((v) => v.folderId !== row.channel.id || s.favorites[v.id] || s.likes[v.id]), row.videos);
					}
					return {
						follows: dedupeFollows(follows),
						folders,
						videos,
						tags: {
							...s.tags,
							...Object.fromEntries(result.ok.flatMap((row) => row.videos.map((video) => [video.id, [.../* @__PURE__ */ new Set([...s.tags[video.id] ?? [], ...remoteMetadataTags(video)])]])))
						},
						importProgress: {
							done: Math.min(i + slice.length, unique.length),
							total: unique.length,
							label: "Importing"
						}
					};
				});
				persistSoon(get);
				cacheRemotes(get);
			}
			persistNow(get);
			const added = get().follows.filter((f) => !existing.has(f.id)).length;
			get().pushNotice({
				title: `Imported ${added || ok} channel${(added || ok) === 1 ? "" : "s"}`,
				body: failed ? `${failed} need attention. Open the importer for the saved reason list.` : "Latest uploads are on the shelves.",
				kind: unique[0]?.kind === "twitch" ? "twitch" : "youtube"
			});
			set({
				remoteBusy: false,
				importProgress: null
			});
			persistNow(get);
			return {
				ok,
				failed,
				failedQueries,
				failedReasons
			};
		} catch (err) {
			set({
				remoteBusy: false,
				importProgress: null
			});
			throw err;
		}
	},
	unfollow: (id) => {
		set((s) => ({
			follows: s.follows.filter((f) => f.id !== id),
			folders: s.folders.filter((f) => f.id !== id),
			videos: s.videos.filter((v) => v.folderId !== id || s.favorites[v.id] || s.likes[v.id]),
			sourceId: s.sourceId === id ? "home" : s.sourceId
		}));
		persistNow(get);
		cacheRemotes(get);
	},
	refreshFollows: async () => {
		if (get().refreshing || get().remoteBusy) return {
			wentLive: [],
			newVideos: []
		};
		const allFollows = dedupeFollows(get().follows);
		if (!allFollows.length) return {
			wentLive: [],
			newVideos: []
		};
		const batchSize = Math.min(REMOTE_REFRESH_BATCH_SIZE, allFollows.length);
		const start = remoteRefreshCursor % allFollows.length;
		const current = Array.from({ length: batchSize }, (_, index) => allFollows[(start + index) % allFollows.length]);
		remoteRefreshCursor = (start + batchSize) % allFollows.length;
		set({ refreshing: true });
		const beforeLive = new Set(get().videos.filter((v) => v.remote?.live).map((v) => v.id));
		const beforeIds = new Set(get().videos.map((v) => v.id));
		try {
			const { refreshRemotes } = await import("./api-CeYPgULp.mjs");
			const result = await refreshRemotes({ data: { channels: current } });
			new Set(result.refreshedIds);
			set((s) => ({
				follows: dedupeFollows([...result.channels, ...s.follows]),
				remoteCheckedAt: Date.now(),
				folders: [...s.folders.filter((f) => !result.channels.some((channel) => channel.id === f.id)), ...result.channels.map((c) => ({
					id: c.id,
					name: c.title,
					kind: c.kind,
					videoCount: result.videos.filter((v) => v.folderId === c.id).length,
					health: "healthy",
					lastCheckedAt: Date.now()
				}))],
				videos: mergeRemoteRefresh(s.videos, result.videos, result.refreshedIds, /* @__PURE__ */ new Set([
					...Object.keys(s.favorites),
					...Object.keys(s.likes),
					...s.history.map((entry) => entry.id)
				]))
			}));
			persistNow(get);
			cacheRemotes(get);
			return {
				wentLive: result.channels.filter((c) => c.live && !beforeLive.has(`tw:${c.handle}:live`) && !beforeLive.has(`tw:${c.handle.toLowerCase()}:live`)),
				newVideos: result.videos.filter((v) => !beforeIds.has(v.id) && Boolean(v.remote))
			};
		} catch {
			return {
				wentLive: [],
				newVideos: []
			};
		} finally {
			set({ refreshing: false });
		}
	},
	pushNotice: (n) => {
		const notice = {
			id: `n:${Date.now()}:${Math.random().toString(16).slice(2, 6)}`,
			at: Date.now(),
			read: false,
			...n
		};
		set((s) => ({ notices: [notice, ...s.notices].slice(0, 40) }));
		persistNow(get);
		if (get().notifyPush && typeof window !== "undefined" && "Notification" in window) {
			if (Notification.permission === "granted") try {
				new Notification(n.title, {
					body: n.body,
					silent: false
				});
			} catch {}
		}
	},
	markNoticesRead: () => {
		set((s) => ({ notices: s.notices.map((n) => ({
			...n,
			read: true
		})) }));
		persistNow(get);
	},
	setNotifyPush: (notifyPush) => {
		set({ notifyPush });
		persistNow(get);
	},
	markUnavailable: (id, reason) => {
		const video = get().videos.find((item) => item.id === id);
		if (!video || video.remote) return;
		set((s) => ({ unavailable: {
			...s.unavailable,
			[id]: true
		} }));
		get().pushNotice({
			title: "Hidden unavailable video",
			body: `${video.name} · ${reason}`,
			kind: "system"
		});
		persistNow(get);
	}
}));
function publicList(state) {
	const adult = adultIdSet(state.folders);
	const knownFolders = new Set(state.folders.map((folder) => folder.id));
	let list = state.videos.filter((v) => !state.unavailable[v.id] && !adult.has(v.folderId) && (knownFolders.has(v.folderId) || Boolean(v.remote) || v.isSample));
	if (state.hideDemo) list = list.filter((v) => !v.isSample);
	return list;
}
function adultList(state) {
	if (!state.adultsUnlocked) return [];
	const adult = adultIdSet(state.folders);
	return state.videos.filter((v) => !state.unavailable[v.id] && adult.has(v.folderId));
}
function selectVisible(state) {
	const q = state.query.trim().toLowerCase();
	const inAdults = state.sourceId === "adults";
	let list = inAdults ? adultList(state) : publicList(state);
	if (state.sourceId === "favorites") list = list.filter((v) => state.favorites[v.id]);
	else if (state.sourceId === "continue") list = list.filter((v) => {
		const p = state.progress[v.id];
		if (!p || p.d <= 0) return false;
		const r = p.t / p.d;
		return r > .04 && r < .96;
	});
	else if (state.sourceId === "history") {
		const byId = new Map(list.map((v) => [v.id, v]));
		list = state.history.map((h) => byId.get(h.id)).filter((v) => v != null);
	} else if (state.sourceId === "movies") list = list.filter((v) => !v.remote);
	else if (state.sourceId === "youtube") list = list.filter((v) => v.remote?.kind === "youtube");
	else if (state.sourceId === "twitch") list = list.filter((v) => v.remote?.kind === "twitch");
	else if (state.sourceId === "live") list = list.filter((v) => v.remote?.live);
	else if (state.sourceId === "home" || state.sourceId === "all") {} else if (!SYSTEM_SOURCES.has(state.sourceId) && !inAdults) list = list.filter((v) => v.folderId === state.sourceId);
	if (q) {
		librarySearchIndex.sync(state.videos, state.tags, state.categories);
		const hits = librarySearchIndex.search(q);
		if (hits) list = list.filter((v) => hits.has(v.id));
	}
	if (state.sourceId === "history") return list;
	const sorted = [...list];
	sorted.sort((a, b) => {
		if (state.sourceId === "movies" && Boolean(state.likes[b.id]) !== Boolean(state.likes[a.id])) return state.likes[b.id] ? 1 : -1;
		switch (state.sort) {
			case "added": return b.addedAt - a.addedAt;
			case "size": return b.size - a.size;
			case "duration": return (b.duration ?? 0) - (a.duration ?? 0);
			case "recent": {
				const ra = state.progress[a.id]?.at ?? 0;
				return (state.progress[b.id]?.at ?? 0) - ra;
			}
			default: return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
		}
	});
	return sorted;
}
function scoped(state, adult) {
	return adult ? adultList(state) : publicList(state);
}
function recoveryList(state, adult) {
	const adultIds = adultIdSet(state.folders);
	return state.videos.filter((video) => {
		if (state.hideDemo && video.isSample) return false;
		return adult ? adultIds.has(video.folderId) : !adultIds.has(video.folderId);
	});
}
function selectContinue(state, adult = false) {
	const items = scoped(state, adult).filter((v) => {
		const p = state.progress[v.id];
		if (!p || p.d <= 0) return false;
		const r = p.t / p.d;
		return r > .01 && r < .985;
	});
	items.sort((a, b) => (state.progress[b.id]?.at ?? 0) - (state.progress[a.id]?.at ?? 0));
	return items;
}
function selectFavorites(state, adult = false) {
	return recoveryList(state, adult).filter((v) => state.favorites[v.id]);
}
function selectHistory(state, adult = false) {
	const list = recoveryList(state, adult);
	const byId = new Map(list.map((v) => [v.id, v]));
	const seen = /* @__PURE__ */ new Set();
	return state.history.filter((h) => !seen.has(h.id) && Boolean(seen.add(h.id))).map((h) => byId.get(h.id)).filter((v) => v != null);
}
function selectYoutube(state) {
	return [...publicList(state).filter((v) => v.remote?.kind === "youtube")].sort((a, b) => b.addedAt - a.addedAt);
}
function selectTwitch(state) {
	const twitch = publicList(state).filter((v) => v.remote?.kind === "twitch");
	const live = twitch.filter((v) => v.remote?.live);
	const vods = twitch.filter((v) => !v.remote?.live);
	return [...live, ...vods];
}
function selectLive(state) {
	return publicList(state).filter((v) => v.remote?.live);
}
function selectClassics(state) {
	return publicList(state).filter((v) => !v.remote && isClassicVideo(v));
}
function selectFeatured(state, adult = false) {
	const cont = selectContinue(state, adult);
	if (cont[0]) return cont[0];
	const pool = adult ? scoped(state, true) : [...selectClassics(state), ...publicList(state).filter((video) => !video.remote && !isClassicVideo(video))];
	if (!pool.length) return void 0;
	return pool[Math.floor(Date.now() / 864e5) % pool.length];
}
function userFolderCount(folders) {
	return folders.filter((f) => f.kind !== "demo").length;
}
var cache = /* @__PURE__ */ new Map();
async function probeHardwareDecode(mime, width = 1920, height = 1080) {
	const key = `${mime}:${width}x${height}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const fallback = {
		supported: true,
		powerEfficient: false,
		smooth: true
	};
	const mc = navigator.mediaCapabilities;
	if (!mc?.decodingInfo) {
		cache.set(key, fallback);
		return fallback;
	}
	const contentType = mime.includes("codecs") ? mime : mime === "video/webm" ? "video/webm; codecs=\"vp09.00.10.08\"" : "video/mp4; codecs=\"avc1.640028\"";
	try {
		const hw = await mc.decodingInfo({
			type: "file",
			video: {
				contentType,
				width,
				height,
				bitrate: 8e6,
				framerate: 30,
				hardwareAcceleration: "prefer-hardware"
			}
		});
		const info = {
			supported: hw.supported,
			powerEfficient: hw.powerEfficient,
			smooth: hw.smooth
		};
		cache.set(key, info);
		return info;
	} catch {
		cache.set(key, fallback);
		return fallback;
	}
}
function attachFrameCallback(video, onFrame) {
	const el = video;
	if (typeof el.requestVideoFrameCallback !== "function") {
		const onTime = () => onFrame(video.currentTime);
		video.addEventListener("timeupdate", onTime);
		return () => video.removeEventListener("timeupdate", onTime);
	}
	let id = 0;
	let alive = true;
	const loop = (_now, meta) => {
		if (!alive) return;
		onFrame(meta.mediaTime);
		id = el.requestVideoFrameCallback(loop);
	};
	id = el.requestVideoFrameCallback(loop);
	return () => {
		alive = false;
		el.cancelVideoFrameCallback?.(id);
	};
}
async function bitmapFromVideo(video) {
	try {
		if (typeof createImageBitmap === "function" && video.videoWidth) return await createImageBitmap(video);
	} catch {
		return null;
	}
	return null;
}
var inflight = /* @__PURE__ */ new Set();
var active = 0;
var waiting = [];
var MAX_MEMORY_THUMBS = 360;
var MAX_ARTWORK_ATTEMPTS = 3;
function maxThumbnailWorkers() {
	const adaptive = Math.min(4, Math.max(2, Math.floor(((typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 4) || 4) / 2)));
	try {
		const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0");
		return [
			2,
			3,
			4
		].includes(saved) ? saved : adaptive;
	} catch {
		return adaptive;
	}
}
async function acquire() {
	if (active < maxThumbnailWorkers()) {
		active += 1;
		return;
	}
	await new Promise((resolve) => waiting.push(resolve));
	active += 1;
}
function release() {
	active = Math.max(0, active - 1);
	const next = waiting.shift();
	if (next) next();
}
function capture(src) {
	return new Promise((resolve) => {
		const video = document.createElement("video");
		video.muted = true;
		video.playsInline = true;
		video.preload = "metadata";
		video.crossOrigin = "anonymous";
		video.className = "hw-video";
		let settled = false;
		const finish = (thumb, duration) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timer);
			video.removeAttribute("src");
			video.load();
			resolve({
				thumb,
				duration
			});
		};
		const timer = window.setTimeout(() => finish(null), 6e3);
		video.addEventListener("loadedmetadata", () => {
			const duration = Number.isFinite(video.duration) ? video.duration : void 0;
			const t = duration && duration > 0 ? Math.min(Math.max(duration * .15, .35), 6) : .35;
			try {
				video.currentTime = t;
			} catch {
				finish(null, duration);
			}
		});
		video.addEventListener("seeked", () => {
			(async () => {
				try {
					const width = video.videoWidth;
					const height = video.videoHeight;
					if (!width || !height) {
						finish(null, Number.isFinite(video.duration) ? video.duration : void 0);
						return;
					}
					const w = 360;
					const h = Math.round(height / width * w) || 360;
					const canvas = document.createElement("canvas");
					canvas.width = w;
					canvas.height = h;
					const ctx = canvas.getContext("2d", { alpha: false });
					if (!ctx) {
						finish(null);
						return;
					}
					const bitmap = await bitmapFromVideo(video);
					if (bitmap) {
						ctx.drawImage(bitmap, 0, 0, w, h);
						bitmap.close();
					} else ctx.drawImage(video, 0, 0, w, h);
					finish(canvas.toDataURL("image/jpeg", .74), Number.isFinite(video.duration) ? video.duration : void 0);
				} catch {
					finish(null);
				}
			})();
		});
		video.addEventListener("error", () => finish(null));
		video.src = src;
	});
}
var useThumbs = create((set, get) => ({
	byId: {},
	failed: {},
	durations: {},
	diagnostics: {},
	request: (video) => {
		const { byId, failed, diagnostics } = get();
		if (byId[video.id] || failed[video.id] || inflight.has(video.id)) return;
		if ((diagnostics[video.id]?.attempts ?? 0) >= MAX_ARTWORK_ATTEMPTS) return;
		if (video.remote) {
			const youtubeId = video.remote.kind === "youtube" ? video.remote.videoId ?? video.remote.embedUrl?.match(/(?:embed\/|v=)([A-Za-z0-9_-]{11})/)?.[1] : void 0;
			const providerArtwork = video.poster || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : void 0) || video.remote.previewUrl;
			if (providerArtwork) set((s) => ({ byId: {
				...s.byId,
				[video.id]: providerArtwork
			} }));
			return;
		}
		inflight.add(video.id);
		(async () => {
			await acquire();
			try {
				const { thumb, duration } = await capture(await resolvePlayUrl(video));
				inflight.delete(video.id);
				if (thumb) {
					set((s) => {
						const nextThumbs = {
							...s.byId,
							[video.id]: thumb
						};
						const ids = Object.keys(nextThumbs);
						if (ids.length > MAX_MEMORY_THUMBS) delete nextThumbs[ids[0]];
						return {
							byId: nextThumbs,
							durations: duration && duration > 0 ? {
								...s.durations,
								[video.id]: duration
							} : s.durations
						};
					});
					saveThumbCache({
						id: video.id,
						thumb,
						at: Date.now()
					}).catch(() => void 0);
				} else set((s) => ({
					failed: {
						...s.failed,
						[video.id]: true
					},
					diagnostics: {
						...s.diagnostics,
						[video.id]: {
							attempts: (s.diagnostics[video.id]?.attempts ?? 0) + 1,
							lastError: "No decodable frame",
							at: Date.now()
						}
					},
					durations: duration && duration > 0 ? {
						...s.durations,
						[video.id]: duration
					} : s.durations
				}));
			} catch {
				inflight.delete(video.id);
				set((s) => ({
					failed: {
						...s.failed,
						[video.id]: true
					},
					diagnostics: {
						...s.diagnostics,
						[video.id]: {
							attempts: (s.diagnostics[video.id]?.attempts ?? 0) + 1,
							lastError: "Source could not be reopened",
							at: Date.now()
						}
					}
				}));
			} finally {
				release();
			}
		})();
	},
	retry: (video) => {
		set((s) => {
			if ((s.diagnostics[video.id]?.attempts ?? 0) >= MAX_ARTWORK_ATTEMPTS) return s;
			const failed = { ...s.failed };
			delete failed[video.id];
			return { failed };
		});
		get().request(video);
	},
	hydrate: async () => {
		try {
			const rows = await loadThumbCache(MAX_MEMORY_THUMBS);
			set((s) => ({ byId: {
				...Object.fromEntries(rows.map((row) => [row.id, row.thumb])),
				...s.byId
			} }));
		} catch {}
	}
}));
var KEY = "reelcase.media-feedback.v1";
var cached = null;
var changeTimer;
var persistTimer;
function read() {
	if (cached) return cached;
	try {
		const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
		cached = {
			ratings: saved.ratings ?? {},
			notes: saved.notes ?? {},
			creatorRatings: saved.creatorRatings ?? {},
			creatorLikes: saved.creatorLikes ?? {},
			tagLikes: saved.tagLikes ?? {}
		};
	} catch {
		cached = {
			ratings: {},
			notes: {},
			creatorRatings: {},
			creatorLikes: {},
			tagLikes: {}
		};
	}
	return cached;
}
function persist() {
	persistTimer = void 0;
	try {
		if (cached) localStorage.setItem(KEY, JSON.stringify(cached));
	} catch {}
}
function write(next) {
	cached = next;
	if (typeof window === "undefined") return;
	if (persistTimer) window.clearTimeout(persistTimer);
	persistTimer = window.setTimeout(persist, 90);
}
function notifyChange() {
	if (typeof window === "undefined" || changeTimer) return;
	changeTimer = window.setTimeout(() => {
		changeTimer = void 0;
		window.dispatchEvent(new Event("reelcase:rating-change"));
	}, 48);
}
function getRating(id) {
	const value = read().ratings[id];
	if (Number.isFinite(value)) return value;
	try {
		return Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0);
	} catch {
		return 0;
	}
}
function setRating(id, rating) {
	const next = read();
	next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
	write(next);
	notifyChange();
}
function creatorKey(name) {
	return name.trim().toLowerCase();
}
function getCreatorRating(name) {
	return read().creatorRatings[creatorKey(name)] ?? 0;
}
function setCreatorRating(name, rating) {
	const next = read();
	next.creatorRatings[creatorKey(name)] = Math.max(0, Math.min(5, Math.round(rating)));
	write(next);
	notifyChange();
}
function creatorIsLiked(name) {
	return Boolean(read().creatorLikes[creatorKey(name)]);
}
function toggleCreatorLike(name) {
	const next = read();
	const key = creatorKey(name);
	if (next.creatorLikes[key]) delete next.creatorLikes[key];
	else next.creatorLikes[key] = true;
	write(next);
	notifyChange();
}
function tagKey(tag) {
	return tag.trim().toLowerCase();
}
function tagIsLiked(tag) {
	return Boolean(read().tagLikes[tagKey(tag)]);
}
function toggleTagLike(tag) {
	const next = read();
	const key = tagKey(tag);
	if (next.tagLikes[key]) delete next.tagLikes[key];
	else next.tagLikes[key] = true;
	write(next);
	notifyChange();
}
/** Versioned rating/note payload used by the full library backup. */
function exportFeedback() {
	return {
		version: 3,
		...read()
	};
}
function getNote(id) {
	const value = read().notes[id];
	if (typeof value === "string") return value;
	try {
		return localStorage.getItem(`reelcase.note.${id}`) ?? "";
	} catch {
		return "";
	}
}
function setNote(id, note) {
	const next = read();
	if (note.trim()) next.notes[id] = note.trim();
	else delete next.notes[id];
	write(next);
}
var EMPTY_TAGS$2 = [];
var artworkRepairRequested = /* @__PURE__ */ new Set();
function VideoCard({ video, variant = "grid", index = 0, playedAt, className }) {
	const ref = (0, import_react.useRef)(null);
	const thumb = useThumbs((s) => s.byId[video.id]);
	const failed = useThumbs((s) => s.failed[video.id]);
	const capturedDur = useThumbs((s) => s.durations[video.id]);
	const request = useThumbs((s) => s.request);
	const retry = useThumbs((s) => s.retry);
	const artworkDiagnostic = useThumbs((s) => s.diagnostics[video.id]);
	const repairArtworkSource = useLibrary((s) => s.repairArtworkSource);
	const progress = useLibrary((s) => s.progress[video.id]);
	const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
	const liked = useLibrary((s) => Boolean(s.likes[video.id]));
	const tags = useLibrary((s) => s.tags[video.id] ?? EMPTY_TAGS$2);
	const category = useLibrary((s) => s.categories[video.id] ?? "");
	const viewCount = useLibrary((s) => s.viewCounts[video.id] ?? 0);
	const toggleLike = useLibrary((s) => s.toggleLike);
	const openPreview = useLibrary((s) => s.openPreview);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const setSource = useLibrary((s) => s.setSource);
	const duration = capturedDur ?? video.duration;
	const ratio = progress && progress.d > 0 ? Math.min(1, progress.t / progress.d) : 0;
	const playable = isLikelyPlayable(video.extension);
	const youtubeId = video.remote?.kind === "youtube" ? video.remote.videoId ?? video.remote.embedUrl?.match(/(?:embed\/|v=)([A-Za-z0-9_-]{11})/)?.[1] : void 0;
	const youtubeFallback = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : void 0;
	const providerArt = video.poster || youtubeFallback || video.remote?.previewUrl;
	const art = variant === "poster" ? providerArt || thumb : thumb || providerArt;
	const isPoster = variant === "poster";
	const live = Boolean(video.remote?.live);
	const preview = video.remote?.previewUrl;
	const [hovered, setHovered] = (0, import_react.useState)(false);
	const [imageFailed, setImageFailed] = (0, import_react.useState)(false);
	const [rating, setRating$3] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el || video.remote) return;
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) request(video);
		}, { rootMargin: "160px" });
		io.observe(el);
		return () => io.disconnect();
	}, [request, video]);
	(0, import_react.useEffect)(() => {
		setRating$3(getRating(video.id));
	}, [video.id]);
	(0, import_react.useEffect)(() => {
		if (!failed || video.remote || artworkRepairRequested.has(video.folderId)) return;
		artworkRepairRequested.add(video.folderId);
		repairArtworkSource(video.folderId).then((rescanned) => {
			if (rescanned) retry(video);
		});
	}, [
		failed,
		repairArtworkSource,
		retry,
		video
	]);
	const rate = (value) => {
		setRating$3(value);
		window.requestAnimationFrame(() => setRating(video.id, value));
	};
	const poster = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-elevated", variant === "list" && "h-16 w-28 shrink-0 rounded-sm", variant === "poster" && "aspect-poster w-full rounded-md", (variant === "grid" || variant === "rail") && "aspect-video w-full rounded-md"),
		children: [
			(imageFailed && youtubeFallback ? youtubeFallback : art) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				loading: "lazy",
				decoding: "async",
				src: imageFailed && youtubeFallback ? youtubeFallback : hovered && preview ? preview : art,
				alt: "",
				onError: () => setImageFailed(true),
				className: "size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-elevated outline outline-1 -outline-offset-1 outline-fg/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-10 items-center justify-center rounded-full bg-bg/40 text-muted", !failed && "animate-pulse"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
				}), failed && !video.remote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					title: artworkDiagnostic ? `${artworkDiagnostic.lastError} · attempt ${artworkDiagnostic.attempts}/3` : void 0,
					className: "absolute bottom-2 left-2 right-2 rounded-xs bg-bg/80 px-2 py-1 text-center text-[11px] text-muted",
					children: ["Local artwork unavailable", artworkDiagnostic ? ` · ${artworkDiagnostic.attempts}/3` : ""]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-bg/80 via-transparent to-transparent opacity-90" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lift",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
				})
			}),
			live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "absolute top-2 left-2 flex items-center gap-1.5 rounded-xs bg-bg/80 px-1.5 py-0.5 text-xs font-medium tracking-wide text-fg uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-danger" }), "Live"]
			}),
			video.remote?.kind === "youtube" && !live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-2 left-2 rounded-xs bg-bg/75 px-1.5 py-0.5 text-xs text-muted",
				children: "YouTube"
			}),
			video.remote?.kind === "twitch" && !live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-2 left-2 rounded-xs bg-bg/75 px-1.5 py-0.5 text-xs text-muted",
				children: "Twitch"
			}),
			duration && !isPoster && !live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute right-2 bottom-2 rounded-xs bg-bg/75 px-1.5 py-0.5 font-mono text-xs tabular-nums text-fg",
				children: formatTime(duration)
			}) : null,
			isPoster && video.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute bottom-2 left-2 font-mono text-xs tabular-nums text-fg/90",
				children: video.year
			}) : null,
			ratio > .02 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-x-0 bottom-0 h-0.5 bg-fg/20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block h-full bg-accent",
					style: { width: `${Math.round(ratio * 100)}%` }
				})
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("stagger-in group relative", isPoster && "poster-hit", live && "rounded-lg border border-border bg-surface p-2 shadow-border", className),
		style: { ["--stagger-i"]: Math.min(index, 16) },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				ref,
				type: "button",
				onMouseEnter: () => setHovered(true),
				onMouseLeave: () => setHovered(false),
				onClick: () => openPreview(video.id),
				className: cn("w-full text-left outline-none", variant === "list" && "flex items-center gap-3 rounded-lg p-2 hover:bg-elevated", variant === "grid" && "block", variant === "rail" && "block w-56 shrink-0", variant === "poster" && "block w-full"),
				children: [
					poster,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("min-w-0", variant === "list" ? "flex-1" : "mt-2.5"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "min-w-0 flex-1 truncate text-sm font-medium text-fg",
									children: titleOf(video)
								}), fav && variant !== "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "mt-0.5 size-3.5 shrink-0 fill-accent text-accent" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 truncate text-xs text-muted",
								children: playedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: formatAgo(playedAt) }) : live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [video.remote?.channelName ?? "Twitch", video.remote?.viewers ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}),
									video.remote.viewers.toLocaleString(),
									" watching"
								] }) : null] }) : video.remote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									video.remote.channelName ?? video.remote.kind,
									video.remote.views ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-subtle",
											children: " · "
										}),
										video.remote.views.toLocaleString(),
										" views"
									] }) : null,
									video.remote.kind === "youtube" || video.remote.kind === "twitch" && !live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}), video.addedAt > Date.UTC(2e3, 0, 1) ? `Published ${new Intl.DateTimeFormat(void 0, {
										month: "short",
										day: "numeric",
										year: "numeric"
									}).format(video.addedAt)}` : "Older catalog item"] }) : null
								] }) : video.year || video.genre ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [video.year ?? video.extension.toUpperCase(), video.genre && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: " · "
								}), video.genre] })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									video.extension.toUpperCase(),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}),
									formatBytes(video.size),
									!playable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "May not play" })] })
								] })
							}),
							rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-center gap-1 text-xs text-accent",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-current" }),
									" Your rating ",
									rating,
									"/5"
								]
							}),
							viewCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-subtle",
								children: [
									"Watched ",
									viewCount,
									" time",
									viewCount === 1 ? "" : "s"
								]
							}),
							(category || tags.length > 0) && variant !== "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-center gap-1 truncate text-xs text-subtle",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-3 shrink-0" }), [category, ...tags].filter(Boolean).join(" · ")]
							})
						]
					}),
					variant === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden max-w-xs truncate text-xs text-subtle sm:block",
						children: video.path
					})
				]
			}),
			failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": `Retry artwork for ${video.name}`,
				onClick: (event) => {
					event.stopPropagation();
					retry(video);
				},
				className: "absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-sm bg-bg/75 text-fg opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" })
			}),
			!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": fav ? "Remove from favorites" : "Add to favorites",
				onClick: (e) => {
					e.stopPropagation();
					toggleFavorite(video.id);
				},
				className: cn("absolute top-2 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", fav && "opacity-100", variant === "list" && "top-3 right-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-3.5", fav && "fill-accent text-accent") })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-label": `Watch ${video.name} together`,
				onClick: (event) => {
					event.stopPropagation();
					localStorage.setItem("reelcase.watch-room.pending-video", video.id);
					setSource("watch-room");
				},
				className: cn("absolute bottom-2 left-2 flex min-h-9 items-center gap-1 rounded-sm bg-bg/75 px-2 text-xs text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", variant === "list" && "bottom-3 left-auto right-3"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }), " Together"]
			}),
			!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": liked ? "Remove like" : "Like",
				onClick: (event) => {
					event.stopPropagation();
					toggleLike(video.id);
				},
				className: cn("absolute top-11 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", liked && "opacity-100", variant === "list" && "top-12 right-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: cn("size-3.5", liked && "fill-accent text-accent") })
			}),
			live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center justify-between border-t border-border pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] text-muted",
					children: "Save this stream"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": fav ? "Remove from favorites" : "Add to favorites",
						onClick: (event) => {
							event.stopPropagation();
							toggleFavorite(video.id);
						},
						className: cn("flex min-h-8 items-center gap-1 rounded-sm px-2 text-xs transition-colors hover:bg-elevated", fav && "bg-accent/15 text-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-3.5", fav && "fill-current") }), fav ? "Saved" : "Save"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": liked ? "Remove like" : "Like",
						onClick: (event) => {
							event.stopPropagation();
							toggleLike(video.id);
						},
						className: cn("flex min-h-8 items-center gap-1 rounded-sm px-2 text-xs transition-colors hover:bg-elevated", liked && "bg-accent/15 text-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: cn("size-3.5", liked && "fill-current") }), liked ? "Liked" : "Like"]
					})]
				})]
			}),
			!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute right-2 bottom-2 hidden items-center gap-0.5 rounded-sm bg-bg/75 p-1 text-accent backdrop-blur-sm group-hover:flex group-focus-within:flex",
				children: [
					1,
					2,
					3,
					4,
					5
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Rate ${video.name} ${value} stars`,
					onClick: (event) => {
						event.stopPropagation();
						rate(value);
					},
					className: cn("p-0.5", value <= rating && "text-fg"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3", value <= rating && "fill-current") })
				}, value))
			})
		]
	});
}
var RAIL_SIZES = [
	8,
	16,
	32,
	48
];
var GRID_SIZES = [
	24,
	48,
	96,
	144
];
function savedRenderBudget(key, allowed, fallback) {
	if (typeof window === "undefined") return fallback;
	const value = Number(localStorage.getItem(key) ?? fallback);
	return allowed.includes(value) ? value : fallback;
}
function Billboard({ video }) {
	const thumb = useThumbs((s) => s.byId[video.id]);
	const request = useThumbs((s) => s.request);
	const openVideo = useLibrary((s) => s.openVideo);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
	const art = thumb || video.poster;
	(0, import_react.useEffect)(() => {
		request(video);
	}, [request, video]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative mb-8 overflow-hidden rounded-xl bg-elevated shadow-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-video max-h-[min(72vh,560px)] w-full min-h-64",
			children: [
				art ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: art,
					alt: "",
					className: "absolute inset-0 size-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-elevated" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-bg/10" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-r from-bg/80 via-bg/30 to-transparent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 py-5 sm:max-w-xl sm:px-8 sm:py-8",
					children: [
						video.genre || video.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium tracking-wide text-accent uppercase",
							children: [video.genre ?? "Featured", video.year ? ` · ${video.year}` : ""]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-accent uppercase",
							children: "Featured"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl",
							children: titleOf(video)
						}),
						video.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md text-sm text-muted sm:text-base",
							children: video.tagline
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => openVideo(video.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), "Play"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => toggleFavorite(video.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", fav && "fill-accent text-accent") }), fav ? "In My List" : "My List"]
							})]
						})
					]
				})
			]
		})
	});
}
function TitleRail({ title, videos, variant = "poster", playedAt, onTitleClick }) {
	const [limit, setLimit] = (0, import_react.useState)(() => savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
	(0, import_react.useEffect)(() => {
		const sync = () => setLimit(savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
		window.addEventListener("reelcase:render-settings", sync);
		return () => window.removeEventListener("reelcase:render-settings", sync);
	}, []);
	if (!videos.length) return null;
	const shown = videos.slice(0, limit);
	const endCaps = Math.max(0, Math.min(6, Math.min(limit, 8) - shown.length));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "media-shelf mb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-3",
			children: [onTitleClick ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onTitleClick,
				className: "block min-w-0 truncate font-display text-xl text-fg hover:text-accent sm:text-2xl",
				children: [
					title,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: "Open source →"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "min-w-0 truncate font-display text-xl text-fg sm:text-2xl",
				children: title
			}), videos.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "ghost",
				className: "shrink-0 text-xs",
				onClick: () => setLimit((value) => Math.min(videos.length, value + 16)),
				children: ["Show 16 more · ", videos.length - limit]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4",
			children: [shown.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(variant === "poster" && "w-32 shrink-0 sm:w-36 md:w-40", variant === "rail" && "shrink-0"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
					video,
					variant,
					index: i,
					playedAt: playedAt?.[video.id]
				})
			}, video.id)), Array.from({ length: endCaps }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": "true",
				className: cn("shrink-0 rounded-md border border-border/50 bg-elevated/35", variant === "poster" ? "aspect-poster w-32 sm:w-36 md:w-40" : "h-36 w-56")
			}, `end-cap-${index}`))]
		})]
	});
}
function PosterGrid({ videos }) {
	const [pageSize, setPageSize] = (0, import_react.useState)(() => savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 48));
	(0, import_react.useEffect)(() => {
		const sync = () => setPageSize(savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 48));
		window.addEventListener("reelcase:render-settings", sync);
		return () => window.removeEventListener("reelcase:render-settings", sync);
	}, []);
	const safePageSize = pageSize;
	const [limit, setLimit] = (0, import_react.useState)(safePageSize);
	(0, import_react.useEffect)(() => setLimit(safePageSize), [videos, safePageSize]);
	if (!videos.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7",
		children: videos.slice(0, limit).map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
			video,
			variant: "poster",
			index: i,
			className: "w-full"
		}, video.id))
	}), videos.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-muted",
			children: [
				"Page ",
				Math.ceil(limit / safePageSize),
				" · showing ",
				limit.toLocaleString(),
				" of ",
				videos.length.toLocaleString(),
				" titles"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "secondary",
			onClick: () => setLimit((value) => Math.min(value + safePageSize, videos.length)),
			children: ["Next page · ", safePageSize]
		})]
	})] });
}
function DiscoveryDesk({ videos }) {
	const [seed, setSeed] = (0, import_react.useState)(1);
	const open = useLibrary((s) => s.openVideo);
	(0, import_react.useEffect)(() => {
		const rotate = () => setSeed((Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0);
		rotate();
		const timer = window.setInterval(rotate, 6e4);
		return () => window.clearInterval(timer);
	}, []);
	const picks = (0, import_react.useMemo)(() => {
		let state = seed >>> 0;
		const random = () => {
			state ^= state << 13;
			state ^= state >>> 17;
			state ^= state << 5;
			return (state >>> 0) / 4294967296;
		};
		const chosen = videos.filter((video) => !video.remote?.live && !video.isSample).map((video) => {
			const classicFallback = video.collection === "classics" || /classic|noir/i.test(`${video.name} ${video.remote?.channelName ?? ""}`);
			const freshness = Math.max(1, Math.min(8, (video.addedAt - Date.now() + 31536e6) / 3942e6));
			const weight = (video.remote ? 7 : 2) + freshness + (classicFallback ? -6 : 0);
			return {
				video,
				score: random() * Math.max(.25, weight)
			};
		}).sort((a, b) => b.score - a.score).slice(0, 12).map((entry) => entry.video);
		for (let i = chosen.length - 1; i > 0; i--) {
			const j = Math.floor(random() * (i + 1));
			[chosen[i], chosen[j]] = [chosen[j], chosen[i]];
		}
		return chosen;
	}, [videos, seed]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8 rounded-xl border border-border bg-surface p-5 sm:p-7",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-end justify-between gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-semibold uppercase tracking-widest text-accent",
					children: "Your daily detour"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "discovery-heading font-display",
					children: "Something worth finding."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "A fresh mix from your library. Follow your curiosity."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: !picks.length,
					onClick: () => open(picks[0].id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Surprise me"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: () => setSeed(Math.floor(Math.random() * 4294967295) || 1),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), "Shuffle picks"]
				})]
			})]
		}), picks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
			title: "Random discoveries",
			videos: picks,
			variant: "rail"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-6 text-sm text-muted",
			children: "Add videos or follow a channel to start discovering."
		})]
	});
}
function LiveDesk({ videos }) {
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const refreshing = useLibrary((s) => s.refreshing);
	const checkedAt = useLibrary((s) => s.remoteCheckedAt);
	const refresh = useLibrary((s) => s.refreshFollows);
	const setSource = useLibrary((s) => s.setSource);
	const follows = useLibrary((s) => s.follows);
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [sort, setSort] = (0, import_react.useState)("favorites");
	const [columns, setColumns] = (0, import_react.useState)(4);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [adding, setAdding] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.live-desk") ?? "{}");
			if ([
				"all",
				"favorites",
				"likes"
			].includes(saved.filter)) setFilter(saved.filter);
			if ([
				"favorites",
				"viewers",
				"name"
			].includes(saved.sort)) setSort(saved.sort);
			const count = Number(localStorage.getItem("reelcase.live-columns") ?? 4);
			if ([
				3,
				4,
				6
			].includes(count)) setColumns(count);
		} catch {}
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		try {
			localStorage.setItem("reelcase.live-desk", JSON.stringify({
				filter,
				sort
			}));
			localStorage.setItem("reelcase.live-columns", String(columns));
		} catch {}
	}, [
		filter,
		sort,
		columns,
		ready
	]);
	const visible = (0, import_react.useMemo)(() => videos.filter((v) => (filter === "all" || (filter === "favorites" ? favorites[v.id] : likes[v.id])) && `${v.name} ${v.remote?.channelName ?? ""}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : (sort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) : 0) || (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0)), [
		videos,
		filter,
		favorites,
		likes,
		sort,
		search
	]);
	const youtubeLiveCount = videos.filter((video) => video.remote?.kind === "youtube").length;
	const recommendedChannels = [
		{
			handle: "twitch",
			title: "Twitch"
		},
		{
			handle: "eslcs",
			title: "ESL Counter-Strike"
		},
		{
			handle: "gamesdonequick",
			title: "Games Done Quick"
		},
		{
			handle: "otknetwork",
			title: "OTK Network"
		},
		{
			handle: "criticalrole",
			title: "Critical Role"
		}
	].filter((channel) => !follows.some((follow) => follow.kind === "twitch" && follow.handle.toLowerCase() === channel.handle));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-6 rounded-xl border border-border bg-surface p-5 sm:p-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }), "On air"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "discovery-heading font-display",
						children: "Your live control room."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							videos.length,
							" confirmed live stream",
							videos.length === 1 ? "" : "s",
							" · ",
							youtubeLiveCount,
							" from YouTube · scheduled “waiting to go live” channels stay out · ",
							checkedAt ? `Checked ${new Date(checkedAt).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit"
							})}` : "Waiting for first refresh"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						disabled: refreshing,
						onClick: () => void refresh(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: refreshing ? "size-4 animate-spin" : "size-4" }), refreshing ? "Refreshing…" : "Refresh streams"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex flex-wrap gap-2",
					children: [
						["all", "All streams"],
						["favorites", "Favorites"],
						["likes", "Liked"]
					].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: filter === value ? "default" : "secondary",
						onClick: () => setFilter(value),
						children: [value === "favorites" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }) : value === "likes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: "size-4" }) : null, label]
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "min-w-0 flex-1",
							value: search,
							onChange: (event) => setSearch(event.target.value),
							placeholder: "Find a stream or creator",
							"aria-label": "Search live streams"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Sort live streams",
							className: "min-h-11 rounded-sm border border-border bg-elevated px-3 text-sm",
							value: sort,
							onChange: (event) => setSort(event.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "favorites",
									children: "Favorites first"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "viewers",
									children: "Most viewers"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "name",
									children: "Channel A–Z"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Live card size",
							className: "min-h-11 rounded-sm border border-border bg-elevated px-3 text-sm",
							value: columns,
							onChange: (event) => setColumns(Number(event.target.value)),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 3,
									children: "Large cards"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 4,
									children: "Comfortable"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 6,
									children: "Compact"
								})
							]
						})
					]
				})
			]
		}),
		visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: columns === 3 ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : columns === 6 ? "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: visible.slice(0, 120).map((video, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
				video,
				variant: "rail",
				index,
				className: "w-full"
			}, video.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: videos.length ? "No streams match this view" : "A quiet moment on your channels"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: videos.length ? "Try all streams or a different search." : "Browse saved Twitch videos while you wait for the next stream."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					variant: "secondary",
					onClick: () => {
						if (videos.length) {
							setFilter("all");
							setSearch("");
						} else setSource("twitch");
					},
					children: videos.length ? "Reset filters" : "Browse Twitch"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 rounded-xl border border-border bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-widest text-accent",
					children: "New live discovery"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-2xl text-fg",
					children: "Outside your followed channels."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "These are public Twitch channels to explore separately from your saved feed. Following one adds it to Reelcase and immediately checks its current live status."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
					children: recommendedChannels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-4 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-fg",
								children: channel.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: ["twitch.tv/", channel.handle]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "mt-3",
								disabled: adding === channel.handle,
								onClick: () => void (async () => {
									setAdding(channel.handle);
									try {
										await followRemoteQuery(channel.handle, "twitch");
									} finally {
										setAdding("");
									}
								})(),
								children: adding === channel.handle ? "Checking…" : "Follow & check live"
							})
						]
					}, channel.handle))
				})
			]
		})
	] });
}
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		decorative,
		orientation,
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
		...props
	});
}
function NavItem({ active, onClick, icon: Icon, label, count, trailing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-[background-color,color] duration-150 ease-[var(--ease-out)]", active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate text-left",
				children: label
			}),
			typeof count === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs tabular-nums text-subtle",
				children: count
			}),
			trailing
		]
	});
}
function SidebarNav({ onAddFolder, onNavigate }) {
	const folders = useLibrary((s) => s.folders);
	const videos = useLibrary((s) => s.videos);
	const sourceId = useLibrary((s) => s.sourceId);
	const hideDemo = useLibrary((s) => s.hideDemo);
	const setSource = useLibrary((s) => s.setSource);
	const removeFolder = useLibrary((s) => s.removeFolder);
	const restoreOne = useLibrary((s) => s.restoreOne);
	const setFolderAdult = useLibrary((s) => s.setFolderAdult);
	const unfollow = useLibrary((s) => s.unfollow);
	const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
	const lockAdults = useLibrary((s) => s.lockAdults);
	const favorites = useLibrary((s) => s.favorites);
	const progress = useLibrary((s) => s.progress);
	const history = useLibrary((s) => s.history);
	const [followingOpen, setFollowingOpen] = (0, import_react.useState)(false);
	const [sourcesOpen, setSourcesOpen] = (0, import_react.useState)(false);
	const [followingLimit, setFollowingLimit] = (0, import_react.useState)(48);
	const [sourceLimit, setSourceLimit] = (0, import_react.useState)(80);
	(0, import_react.useEffect)(() => {
		try {
			setFollowingOpen(localStorage.getItem("reelcase.sidebar.following-open") === "true");
			setSourcesOpen(localStorage.getItem("reelcase.sidebar.sources-open") === "true");
		} catch {}
	}, []);
	const toggleFollowing = () => setFollowingOpen((open) => {
		const next = !open;
		try {
			localStorage.setItem("reelcase.sidebar.following-open", String(next));
		} catch {}
		return next;
	});
	const toggleSources = () => setSourcesOpen((open) => {
		const next = !open;
		try {
			localStorage.setItem("reelcase.sidebar.sources-open", String(next));
		} catch {}
		return next;
	});
	const go = (id) => {
		setSource(id);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
		onNavigate?.();
	};
	const { publicFolders, networkFolders, adultFolders, counts } = (0, import_react.useMemo)(() => {
		const publicFolders = [];
		const networkFolders = [];
		const adultFolders = [];
		const folderById = new Map(folders.map((folder) => [folder.id, folder]));
		let publicCount = 0, adultCount = 0, ytCount = 0, twitchCount = 0, liveCount = 0, continueCount = 0;
		const videosById = new Map(videos.map((video) => [video.id, video]));
		for (const folder of folders) if (folder.adult) adultFolders.push(folder);
		else if ((folder.kind === "youtube" || folder.kind === "twitch") && folder.id !== "youtube:featured") networkFolders.push(folder);
		else if (folder.kind !== "demo" && folder.kind !== "youtube" && folder.kind !== "twitch") publicFolders.push(folder);
		for (const video of videos) {
			if (Boolean(folderById.get(video.folderId)?.adult)) {
				adultCount += 1;
				continue;
			}
			if (!(hideDemo && video.isSample)) {
				publicCount += 1;
				const mark = progress[video.id];
				if (mark?.d && mark.t / mark.d > .04 && mark.t / mark.d < .96) continueCount += 1;
			}
			if (video.remote?.kind === "youtube") ytCount += 1;
			if (video.remote?.kind === "twitch") twitchCount += 1;
			if (video.remote?.live) liveCount += 1;
		}
		let favCount = 0, historyCount = 0;
		for (const id of Object.keys(favorites)) if (videosById.get(id) && !folderById.get(videosById.get(id).folderId)?.adult) favCount += 1;
		for (const entry of history) {
			const video = videosById.get(entry.id);
			if (video && !folderById.get(video.folderId)?.adult && !(hideDemo && video.isSample)) historyCount += 1;
		}
		return {
			publicFolders,
			networkFolders,
			adultFolders,
			counts: {
				publicCount,
				adultCount: adultsUnlocked ? adultCount : void 0,
				ytCount,
				twitchCount,
				liveCount,
				continueCount,
				favCount,
				historyCount
			}
		};
	}, [
		adultsUnlocked,
		favorites,
		folders,
		hideDemo,
		history,
		progress,
		videos
	]);
	const demo = folders.find((f) => f.kind === "demo" && !hideDemo);
	const youtubeFollowing = networkFolders.filter((folder) => folder.kind === "youtube");
	const twitchFollowing = networkFolders.filter((folder) => folder.kind === "twitch");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-2 pt-1 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-9 items-center justify-center rounded-lg bg-accent text-accent-fg shadow-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl leading-none tracking-tight text-fg",
						children: "Reelcase"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Vault · networks · live"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-col gap-0.5 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "home",
						onClick: () => go("home"),
						icon: Clapperboard,
						label: "Home",
						count: counts.publicCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "movies",
						onClick: () => go("movies"),
						icon: Film,
						label: "Movies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "genres",
						onClick: () => go("genres"),
						icon: Film,
						label: "Topics"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "youtube",
						onClick: () => go("youtube"),
						icon: Youtube,
						label: "YouTube",
						count: counts.ytCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "twitch",
						onClick: () => go("twitch"),
						icon: Radio,
						label: "Twitch",
						count: counts.twitchCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "live",
						onClick: () => go("live"),
						icon: Radio,
						label: "Live",
						count: counts.liveCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "favorites",
						onClick: () => go("favorites"),
						icon: Heart,
						label: "Favorites",
						count: counts.favCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "continue",
						onClick: () => go("continue"),
						icon: Clock3,
						label: "Continue",
						count: counts.continueCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "history",
						onClick: () => go("history"),
						icon: History,
						label: "History",
						count: counts.historyCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "adults",
						onClick: () => go("adults"),
						icon: adultsUnlocked ? LockOpen : Lock,
						label: "Adults",
						count: counts.adultCount,
						trailing: adultsUnlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							role: "button",
							tabIndex: 0,
							"aria-label": "Lock Adults",
							onClick: (e) => {
								e.stopPropagation();
								lockAdults();
								onNavigate?.();
							},
							onKeyDown: (e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									e.stopPropagation();
									lockAdults();
								}
							},
							className: "flex size-7 items-center justify-center rounded-sm text-subtle hover:bg-bg hover:text-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" })
						}) : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "photos",
						onClick: () => go("photos"),
						icon: Images,
						label: "Photos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "spotify",
						onClick: () => go("spotify"),
						icon: Music2,
						label: "Spotify"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "prints",
						onClick: () => go("prints"),
						icon: Box,
						label: "3D prints"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "games",
						onClick: () => go("games"),
						icon: Gamepad2,
						label: "Games"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "shop",
						onClick: () => go("shop"),
						icon: ShoppingBag,
						label: "Shop"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "streaming",
						onClick: () => go("streaming"),
						icon: MonitorPlay,
						label: "Streaming"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "watch-room",
						onClick: () => go("watch-room"),
						icon: Users,
						label: "Watch room"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "connection",
						onClick: () => go("connection"),
						icon: Wifi,
						label: "Connection guide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "find-phone",
						onClick: () => go("find-phone"),
						icon: Smartphone,
						label: "Find my phone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "social",
						onClick: () => go("social"),
						icon: X,
						label: "X accounts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "assistant",
						onClick: () => go("assistant"),
						icon: Sparkles,
						label: "AI guide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "mission-plan",
						onClick: () => go("mission-plan"),
						icon: Clapperboard,
						label: "Mission plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "settings",
						onClick: () => go("settings"),
						icon: Settings2,
						label: "Settings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "stats",
						onClick: () => go("stats"),
						icon: ChartColumn,
						label: "Stats"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: toggleSources,
				className: "flex items-center justify-between px-3 pb-2 text-xs font-medium tracking-wide text-subtle uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Local sources" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: sourcesOpen ? "Hide" : `${publicFolders.length}` })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-0.5 overflow-y-auto px-1",
				children: [
					sourcesOpen && demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === demo.id,
						onClick: () => go(demo.id),
						icon: Film,
						label: demo.name,
						count: demo.videoCount
					}),
					sourcesOpen && publicFolders.slice(0, sourceLimit).map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
						folder,
						active: sourceId === folder.id,
						onClick: () => {
							if (folder.needsPermission) restoreOne(folder.id);
							else go(folder.id);
						},
						onRemove: () => void removeFolder(folder.id),
						onToggleAdult: () => setFolderAdult(folder.id, true)
					}, folder.id)),
					sourcesOpen && publicFolders.length > sourceLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "mx-1 mt-1",
						onClick: () => setSourceLimit((value) => value + 80),
						children: "Show 80 more sources"
					}),
					networkFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: toggleFollowing,
							className: "mt-3 flex items-center justify-between px-2 pb-1 text-xs font-medium tracking-wide text-subtle uppercase",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Following" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: followingOpen ? "Hide" : networkFolders.length })]
						}),
						followingOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-2 pt-1 text-[10px] font-medium tracking-wide text-subtle uppercase",
							children: ["YouTube · ", youtubeFollowing.length]
						}),
						followingOpen && youtubeFollowing.slice(0, followingLimit).map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
							folder,
							active: sourceId === folder.id,
							onClick: () => go(folder.id),
							onRemove: () => unfollow(folder.id),
							onToggleAdult: () => {},
							hideAdult: true
						}, folder.id)),
						followingOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-2 pt-3 text-[10px] font-medium tracking-wide text-subtle uppercase",
							children: ["Twitch · ", twitchFollowing.length]
						}),
						followingOpen && twitchFollowing.slice(0, followingLimit).map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
							folder,
							active: sourceId === folder.id,
							onClick: () => go(folder.id),
							onRemove: () => unfollow(folder.id),
							onToggleAdult: () => {},
							hideAdult: true
						}, folder.id)),
						followingOpen && (youtubeFollowing.length > followingLimit || twitchFollowing.length > followingLimit) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "mx-1 mt-1",
							onClick: () => setFollowingLimit((value) => value + 48),
							children: "Show 48 more follows"
						})
					] }),
					adultsUnlocked && adultFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 px-2 pb-1 text-xs font-medium tracking-wide text-subtle uppercase",
						children: "Private"
					}), adultFolders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
						folder,
						active: sourceId === folder.id,
						onClick: () => {
							if (folder.needsPermission) restoreOne(folder.id);
							else go("adults");
						},
						onRemove: () => void removeFolder(folder.id),
						onToggleAdult: () => setFolderAdult(folder.id, false)
					}, folder.id))] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col gap-2 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					onClick: () => onAddFolder(false),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, { className: "size-4" }), "Add folder"]
				}), sourceId === "adults" && adultsUnlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					className: "w-full",
					onClick: () => onAddFolder(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), "Private folder"]
				})]
			})
		]
	});
}
function FolderRow({ folder, active, onClick, onRemove, onToggleAdult, hideAdult }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "group relative",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
			active,
			onClick,
			icon: folder.adult ? Lock : Folder,
			label: folder.needsPermission ? `${folder.name} (restore)` : folder.name,
			count: folder.needsPermission ? void 0 : folder.videoCount,
			trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center",
				children: [
					folder.health && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						title: folder.health === "healthy" ? "Source checked" : folder.health === "cached" ? "Cached catalog" : "Source needs attention",
						className: cn("mr-1 size-2 rounded-full", folder.health === "healthy" ? "bg-accent" : folder.health === "cached" ? "bg-muted" : "bg-danger")
					}),
					!hideAdult && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "button",
						tabIndex: 0,
						"aria-label": folder.adult ? `Move ${folder.name} to library` : `Move ${folder.name} to Adults`,
						onClick: (e) => {
							e.stopPropagation();
							onToggleAdult();
						},
						onKeyDown: (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								onToggleAdult();
							}
						},
						className: "flex size-7 items-center justify-center rounded-sm text-subtle opacity-0 transition-opacity duration-150 hover:bg-bg hover:text-fg group-hover:opacity-100 focus-visible:opacity-100",
						children: folder.adult ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "button",
						tabIndex: 0,
						"aria-label": `Remove ${folder.name}`,
						onClick: (e) => {
							e.stopPropagation();
							onRemove();
						},
						onKeyDown: (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								onRemove();
							}
						},
						className: "flex size-7 items-center justify-center rounded-sm text-subtle opacity-0 transition-opacity duration-150 hover:bg-bg hover:text-fg group-hover:opacity-100 focus-visible:opacity-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
					})
				]
			})
		})
	});
}
function DropdownMenu(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, { ...props });
}
function DropdownMenuTrigger(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, { ...props });
}
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-40 overflow-hidden rounded-lg bg-elevated p-1 text-fg shadow-border shadow-lift", className),
		...props
	}) });
}
function DropdownMenuItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none", "focus:bg-surface focus:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-40", className),
		...props
	});
}
function NoticeBell() {
	const notices = useLibrary((s) => s.notices);
	const unread = notices.filter((n) => !n.read).length;
	const markNoticesRead = useLibrary((s) => s.markNoticesRead);
	const notifyPush = useLibrary((s) => s.notifyPush);
	const setNotifyPush = useLibrary((s) => s.setNotifyPush);
	const openVideo = useLibrary((s) => s.openVideo);
	const enablePush = async () => {
		if (!("Notification" in window)) return;
		const perm = await Notification.requestPermission();
		setNotifyPush(perm === "granted");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
		onOpenChange: (open) => {
			if (open) markNoticesRead();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "icon-sm",
				"aria-label": "Notifications",
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 right-1 size-1.5 rounded-full bg-danger" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "end",
			className: "w-80 p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Notifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => notifyPush ? setNotifyPush(false) : void enablePush(),
					className: "flex items-center gap-1 text-xs text-muted hover:text-fg",
					children: [notifyPush ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "size-3.5" }), notifyPush ? "Alerts on" : "Enable alerts"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-80 overflow-y-auto",
				children: notices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-6 text-center text-sm text-muted",
					children: "Follow YouTube or Twitch to get live and upload alerts."
				}) : notices.slice(0, 20).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => n.videoId && openVideo(n.videoId),
					className: cn("flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-elevated", !n.read && "bg-elevated/50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-fg",
							children: n.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: n.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-subtle",
							children: formatAgo(n.at)
						})
					]
				}, n.id))
			})]
		})]
	});
}
var SORTS = [
	{
		key: "name",
		label: "Name"
	},
	{
		key: "added",
		label: "Date added"
	},
	{
		key: "recent",
		label: "Recently played"
	},
	{
		key: "size",
		label: "Size"
	},
	{
		key: "duration",
		label: "Duration"
	},
	{
		key: "type",
		label: "File type"
	},
	{
		key: "folder",
		label: "Folder"
	},
	{
		key: "path",
		label: "Full path"
	}
];
function TopBar({ onMenu, onAddFolder }) {
	const query = useLibrary((s) => s.query);
	const setQuery = useLibrary((s) => s.setQuery);
	const [draft, setDraft] = (0, import_react.useState)(query);
	const [lookup, setLookup] = (0, import_react.useState)(query);
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setDraft(query);
	}, [query]);
	(0, import_react.useEffect)(() => {
		const id = window.setTimeout(() => setLookup(draft), 140);
		return () => window.clearTimeout(id);
	}, [draft]);
	(0, import_react.useEffect)(() => {
		if (draft === query) return;
		const t = window.setTimeout(() => setQuery(draft), 180);
		return () => window.clearTimeout(t);
	}, [
		draft,
		query,
		setQuery
	]);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 15e3);
		return () => window.clearInterval(id);
	}, []);
	const view = useLibrary((s) => s.view);
	const setView = useLibrary((s) => s.setView);
	const sort = useLibrary((s) => s.sort);
	const setSort = useLibrary((s) => s.setSort);
	const scanning = useLibrary((s) => s.scanning);
	const sourceId = useLibrary((s) => s.sourceId);
	const folders = useLibrary((s) => s.folders);
	const videos = useLibrary((s) => s.videos);
	const openPreview = useLibrary((s) => s.openPreview);
	const setSource = useLibrary((s) => s.setSource);
	const tags = useLibrary((s) => s.tags);
	const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
	const [focused, setFocused] = (0, import_react.useState)(false);
	const [recent, setRecent] = (0, import_react.useState)(() => {
		try {
			return JSON.parse(localStorage.getItem("reelcase.search.recent") ?? "[]");
		} catch {
			return [];
		}
	});
	const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Name";
	const sourceLabel = sourceId === "home" ? "Home" : sourceId === "movies" ? "Movies" : sourceId === "photos" ? "Photos" : sourceId === "twitch" ? "Twitch" : sourceId === "youtube" ? "YouTube" : folders.find((folder) => folder.id === sourceId)?.name ?? "Library";
	const sourceCount = sourceId === "home" ? videos.length : folders.find((folder) => folder.id === sourceId)?.videoCount;
	const needle = lookup.trim().toLowerCase();
	const videoById = (0, import_react.useMemo)(() => new Map(videos.map((video) => [video.id, video])), [videos]);
	const hits = (0, import_react.useMemo)(() => {
		if (!needle) return [];
		const indexedIds = librarySearchIndex.search(needle);
		return (indexedIds ? Array.from(indexedIds, (id) => videoById.get(id)).filter((video) => Boolean(video)) : videos).filter((video) => {
			if (folders.find((item) => item.id === video.folderId)?.adult && !(sourceId === "adults" && adultsUnlocked)) return false;
			return indexedIds ? true : `${video.name} ${video.path} ${video.description ?? ""} ${video.remote?.channelName ?? ""} ${(tags[video.id] ?? []).join(" ")}`.toLowerCase().includes(needle);
		}).sort((a, b) => b.addedAt - a.addedAt).slice(0, 6);
	}, [
		adultsUnlocked,
		folders,
		needle,
		sourceId,
		tags,
		videoById,
		videos
	]);
	const suggestionTags = (0, import_react.useMemo)(() => [...new Set(hits.flatMap((video) => tags[video.id] ?? []))].filter((tag) => tag.length >= 3).slice(0, 5), [hits, tags]);
	const commit = (value = draft) => {
		const clean = value.trim();
		setQuery(clean);
		if (clean) {
			const next = [clean, ...recent.filter((item) => item !== clean)].slice(0, 5);
			setRecent(next);
			localStorage.setItem("reelcase.search.recent", JSON.stringify(next));
		}
		setFocused(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "grid gap-3 border-b border-border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 xl:grid-cols-[minmax(13rem,0.55fr)_minmax(20rem,1.4fr)_auto]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: "lg:hidden",
					"aria-label": "Open menu",
					onClick: onMenu,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-lg leading-none text-fg",
						children: sourceLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: typeof sourceCount === "number" ? `${sourceCount.toLocaleString()} indexed` : "Control room"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-w-0 xl:max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "search",
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter") commit();
							if (e.key === "Escape") setFocused(false);
						},
						onFocus: () => setFocused(true),
						placeholder: "Search your entire media desk…",
						className: "h-12 border-border bg-elevated pl-11 pr-10 text-base shadow-border",
						"aria-label": "Global media search"
					}),
					draft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Clear search",
						onClick: () => {
							setDraft("");
							setQuery("");
						},
						className: "absolute top-1/2 right-3 -translate-y-1/2 text-subtle hover:text-fg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					}),
					focused && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-[calc(100%+0.5rem)] z-40 w-full overflow-hidden rounded-lg bg-surface p-2 shadow-lift shadow-border",
						children: [hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-2 text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Best matches"
							}),
							hits.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onMouseDown: (event) => event.preventDefault(),
								onClick: () => {
									openPreview(video.id);
									setFocused(false);
								},
								className: "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left hover:bg-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-8 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderSearch, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-medium text-fg",
										children: video.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-xs text-muted",
										children: video.remote?.channelName ?? video.path
									})]
								})]
							}, video.id)),
							suggestionTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2 border-t border-border px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "self-center text-xs text-muted",
									children: "Related tags"
								}), suggestionTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => {
										setDraft(tag);
										commit(tag);
									},
									children: ["#", tag]
								}, tag))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onMouseDown: (event) => event.preventDefault(),
								onClick: () => commit(),
								className: "mt-1 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-accent hover:bg-elevated",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
									" See all results for “",
									draft,
									"”"
								]
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-2 text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Search everywhere"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2 px-3 py-2",
								children: [
									"favorites",
									"4k",
									"documentary",
									"watch later"
								].map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => {
										setDraft(term);
										commit(term);
									},
									children: term
								}, term))
							}),
							recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border px-3 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Recent"
								}), recent.map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => {
										setDraft(term);
										commit(term);
									},
									className: "mt-1 flex w-full items-center gap-2 py-1 text-left text-sm text-fg hover:text-accent",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), term]
								}, term))]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2 border-t border-border px-3 pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => setSource("home"),
									children: "Library"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => setSource("youtube"),
									children: "YouTube"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => setSource("twitch"),
									children: "Twitch"
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 sm:justify-end",
				children: [
					scanning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mr-2 hidden truncate text-xs text-muted sm:inline",
						children: [
							"Scanning ",
							scanning.folderName,
							" · ",
							scanning.found
						]
					}),
					sourceId !== "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							children: sortLabel
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
						align: "end",
						children: SORTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: () => setSort(s.key),
							children: [s.key === sort ? "· " : "  ", s.label]
						}, s.key))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden items-center gap-1.5 px-2 text-xs tabular-nums text-muted xl:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5" }), now ? now.toLocaleTimeString([], {
							hour: "numeric",
							minute: "2-digit"
						}) : "--:--"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeBell, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex rounded-md bg-elevated p-0.5 shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Grid view",
							onClick: () => setView("grid"),
							className: cn("flex size-9 items-center justify-center rounded-sm transition-colors duration-150", view === "grid" ? "bg-surface text-fg" : "text-muted hover:text-fg"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "List view",
							onClick: () => setView("list"),
							className: cn("flex size-9 items-center justify-center rounded-sm transition-colors duration-150", view === "list" ? "bg-surface text-fg" : "text-muted hover:text-fg"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						size: "sm",
						onClick: onAddFolder,
						className: "hidden sm:inline-flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }), "Folder"]
					})
				]
			})
		]
	});
}
var ICONS = {
	videos: Video,
	downloads: Download,
	desktop: Monitor,
	documents: FileText,
	pictures: Image,
	music: Video
};
function InviteStrip({ onAddFolder, onAddFiles, onRecommended }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8 rounded-xl bg-surface px-5 py-5 shadow-border sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl leading-tight text-fg",
						children: "Pull in the rest of this computer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Start with a recommended folder, or pick any drive. Files are read in the browser and never leave the machine."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onAddFolder,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, { className: "size-4" }), "Add folder"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: onAddFiles,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "Add files"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 mb-2 text-xs font-medium tracking-wide text-subtle uppercase",
				children: "Recommended folders"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5",
				children: RECOMMENDED_FOLDERS.map((folder) => {
					const Icon = ICONS[folder.id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onRecommended(folder.id),
						className: "flex h-16 items-center gap-3 rounded-lg bg-elevated px-3 text-left shadow-border transition-[box-shadow,transform] duration-150 hover:shadow-border-hover active:scale-[0.96]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-9 items-center justify-center rounded-sm bg-surface text-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium text-fg",
								children: folder.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted",
								children: folder.hint
							})]
						})]
					}, folder.id);
				})
			})
		]
	});
}
/** Initial / incremental page size — catalog stays full in memory/IDB; only this many cards mount. */
var PAGE = 60;
function VideoGrid({ videos, playedAt }) {
	const view = useLibrary((s) => s.view);
	const [limit, setLimit] = (0, import_react.useState)(PAGE);
	const sentinelRef = (0, import_react.useRef)(null);
	const sourceKey = `${videos.length}:${videos[0]?.id ?? ""}:${videos[videos.length - 1]?.id ?? ""}`;
	(0, import_react.useEffect)(() => {
		setLimit(PAGE);
	}, [sourceKey]);
	(0, import_react.useEffect)(() => {
		const el = sentinelRef.current;
		if (!el || limit >= videos.length) return;
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) setLimit((value) => Math.min(videos.length, value + PAGE));
		}, { rootMargin: "600px 0px" });
		io.observe(el);
		return () => io.disconnect();
	}, [limit, videos.length]);
	const visible = videos.slice(0, limit);
	if (!videos.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-6 py-16 text-center shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl text-fg",
			children: "No videos here"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mx-auto mt-2 max-w-sm text-sm text-muted",
			children: "Try another source, clear search, or add a folder from this computer."
		})]
	});
	const more = limit < videos.length;
	if (view === "list") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-1",
		children: visible.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
			video,
			variant: "list",
			index: i,
			playedAt: playedAt?.[video.id]
		}, video.id))
	}), more && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: sentinelRef,
		className: "h-8",
		"aria-hidden": true
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "secondary",
		className: "mt-5 w-full",
		onClick: () => setLimit((value) => Math.min(videos.length, value + PAGE)),
		children: [
			"Show more · ",
			videos.length - limit,
			" remaining"
		]
	})] })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
		children: visible.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
			video,
			variant: "grid",
			index: i,
			playedAt: playedAt?.[video.id]
		}, video.id))
	}), more && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: sentinelRef,
		className: "h-8",
		"aria-hidden": true
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "secondary",
		className: "mt-6 w-full",
		onClick: () => setLimit((value) => Math.min(videos.length, value + PAGE)),
		children: [
			"Show more · ",
			videos.length - limit,
			" remaining"
		]
	})] })] });
}
function PinGate() {
	const hasPin = useLibrary((s) => Boolean(s.adultPinHash));
	const setAdultPin = useLibrary((s) => s.setAdultPin);
	const unlockAdults = useLibrary((s) => s.unlockAdults);
	const resetAdultPin = useLibrary((s) => s.resetAdultPin);
	const setSource = useLibrary((s) => s.setSource);
	const [pin, setPin] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const submit = async () => {
		setError(null);
		if (!isPinShape(pin)) {
			setError("Use four digits.");
			return;
		}
		setBusy(true);
		try {
			if (!hasPin) {
				if (pin !== confirm) {
					setError("Those PINs do not match.");
					return;
				}
				await setAdultPin(pin);
				return;
			}
			if (!await unlockAdults(pin)) setError("Wrong PIN.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-12 items-center justify-center rounded-lg bg-elevated text-fg shadow-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-5 font-display text-3xl text-fg",
				children: "Adults"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: hasPin ? "Enter your PIN. Private folders stay off the rest of the library." : "Set a 4-digit PIN. Folders you mark as private only open here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex w-full flex-col gap-3",
				onSubmit: (e) => {
					e.preventDefault();
					submit();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						inputMode: "numeric",
						autoComplete: "off",
						maxLength: 4,
						value: pin,
						onChange: (e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4)),
						"aria-label": "PIN",
						placeholder: "••••",
						className: "text-center font-mono text-lg tracking-[0.4em]"
					}),
					!hasPin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						inputMode: "numeric",
						autoComplete: "off",
						maxLength: 4,
						value: confirm,
						onChange: (e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4)),
						"aria-label": "Confirm PIN",
						placeholder: "Confirm",
						className: "text-center font-mono text-lg tracking-[0.4em]"
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						className: "w-full",
						children: hasPin ? "Unlock" : "Set PIN"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => setSource("home"),
					children: "Back to Home"
				}), hasPin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => {
						resetAdultPin();
						setPin("");
						setConfirm("");
						setError(null);
					},
					children: "Reset PIN"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 max-w-sm text-xs text-subtle",
				children: "Nothing is uploaded. The PIN stays on this browser. Resetting it keeps private folders hidden until you set a new one."
			})
		]
	});
}
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex h-4 w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow overflow-hidden rounded-full bg-fg/15",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-accent" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-3 rounded-full bg-accent shadow-lift outline-none transition-transform duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/70" })]
	});
}
var SPEEDS = [
	.5,
	.75,
	1,
	1.25,
	1.5,
	2
];
var EMPTY_TAGS$1 = [];
var TAG_PRESETS = [
	"watch-later",
	"favorite",
	"family",
	"4k",
	"short",
	"documentary",
	"how-to",
	"comfort"
];
function twitchEmbed(base) {
	if (typeof window === "undefined") return base;
	const qs = [.../* @__PURE__ */ new Set([
		window.location.hostname,
		window.location.hostname.replace(/^www\./, ""),
		"localhost",
		"127.0.0.1"
	])].map((h) => `parent=${encodeURIComponent(h)}`).join("&");
	return `${base}${base.includes("?") ? "&" : "?"}${qs}`;
}
function youtubeEmbed(base) {
	if (!base) return null;
	const url = new URL(base, "https://www.youtube.com");
	url.protocol = "https:";
	url.hostname = "www.youtube.com";
	url.searchParams.set("autoplay", "1");
	url.searchParams.set("rel", "0");
	url.searchParams.set("modestbranding", "1");
	url.searchParams.set("playsinline", "1");
	url.searchParams.set("controls", "1");
	if (typeof window !== "undefined") url.searchParams.set("origin", window.location.origin);
	return url.toString();
}
function Player({ playlist }) {
	const activeId = useLibrary((s) => s.activeId);
	const video = useLibrary((s) => s.videos.find((v) => v.id === s.activeId));
	const closePlayer = useLibrary((s) => s.closePlayer);
	const openVideo = useLibrary((s) => s.openVideo);
	const playRelative = useLibrary((s) => s.playRelative);
	const markProgress = useLibrary((s) => s.markProgress);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const toggleLike = useLibrary((s) => s.toggleLike);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setVideoCategory = useLibrary((s) => s.setVideoCategory);
	const hardwareAccel = useLibrary((s) => s.hardwareAccel);
	const setHardwareAccel = useLibrary((s) => s.setHardwareAccel);
	const removeVideo = useLibrary((s) => s.removeVideo);
	const restoreOne = useLibrary((s) => s.restoreOne);
	const markUnavailable = useLibrary((s) => s.markUnavailable);
	const folder = useLibrary((s) => s.folders.find((item) => item.id === video?.folderId));
	const fav = useLibrary((s) => s.activeId ? Boolean(s.favorites[s.activeId]) : false);
	const liked = useLibrary((s) => s.activeId ? Boolean(s.likes[s.activeId]) : false);
	const tags = useLibrary((s) => s.activeId ? s.tags[s.activeId] ?? EMPTY_TAGS$1 : EMPTY_TAGS$1);
	const category = useLibrary((s) => s.activeId ? s.categories[s.activeId] ?? "" : "");
	const saved = useLibrary((s) => s.activeId ? s.progress[s.activeId] : void 0);
	const wrapRef = (0, import_react.useRef)(null);
	const mediaRef = (0, import_react.useRef)(null);
	const hideTimer = (0, import_react.useRef)(0);
	const [src, setSrc] = (0, import_react.useState)(null);
	const [srcError, setSrcError] = (0, import_react.useState)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [current, setCurrent] = (0, import_react.useState)(0);
	const [duration, setDuration] = (0, import_react.useState)(0);
	const [volume, setVolume] = (0, import_react.useState)(() => {
		try {
			const saved = Number(localStorage.getItem("reelcase.player-volume") ?? "85");
			return [
				25,
				50,
				70,
				85,
				100
			].includes(saved) ? saved / 100 : .85;
		} catch {
			return .85;
		}
	});
	const [muted, setMuted] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.player-start-muted") === "true";
		} catch {
			return false;
		}
	});
	const [speed, setSpeed] = (0, import_react.useState)(1);
	const [chrome, setChrome] = (0, import_react.useState)(true);
	const [fs, setFs] = (0, import_react.useState)(false);
	const [scrub, setScrub] = (0, import_react.useState)(null);
	const [loadError, setLoadError] = (0, import_react.useState)(null);
	const [hw, setHw] = (0, import_react.useState)(null);
	const [vrAvailable, setVrAvailable] = (0, import_react.useState)(false);
	const [vrStatus, setVrStatus] = (0, import_react.useState)("");
	const [removeReady, setRemoveReady] = (0, import_react.useState)(false);
	const capturedDur = useThumbs((s) => video ? s.durations[video.id] : void 0);
	const scrubbing = (0, import_react.useRef)(false);
	const remoteStartedAt = (0, import_react.useRef)(0);
	const enterVrTheater = (0, import_react.useCallback)(async () => {
		const xr = navigator.xr;
		const media = mediaRef.current;
		if (!xr) {
			setVrStatus("VR needs Meta Quest Browser on a secure site. Open Reelcase there, allow immersive VR, then try again.");
			return;
		}
		if (!media) {
			setVrStatus("VR cinema is available for local video playback. Open a local file first; embedded provider video stays in its official player.");
			return;
		}
		try {
			const session = await xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "bounded-floor"] });
			const canvas = document.createElement("canvas");
			const gl = canvas.getContext("webgl", { xrCompatible: true });
			if (!gl) {
				await session.end();
				setVrStatus("This headset browser could not create the cinema surface. Update Meta Quest Browser and retry.");
				return;
			}
			await gl.makeXRCompatible?.();
			const layer = new window.XRWebGLLayer(session, gl);
			session.updateRenderState({ baseLayer: layer });
			const source = await session.requestReferenceSpace("local");
			const shader = (type, code) => {
				const part = gl.createShader(type);
				gl.shaderSource(part, code);
				gl.compileShader(part);
				return part;
			};
			const program = gl.createProgram();
			gl.attachShader(program, shader(gl.VERTEX_SHADER, "attribute vec2 p; varying vec2 uv; void main(){uv=(p+1.0)*.5;gl_Position=vec4(p,0.,1.);}"));
			gl.attachShader(program, shader(gl.FRAGMENT_SHADER, "precision mediump float; varying vec2 uv; uniform sampler2D video; void main(){vec2 q=vec2(uv.x,1.0-uv.y); gl_FragColor=texture2D(video,q);}"));
			gl.linkProgram(program);
			gl.useProgram(program);
			const buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
				-1,
				-1,
				1,
				-1,
				-1,
				1,
				-1,
				1,
				1,
				-1,
				1,
				1
			]), gl.STATIC_DRAW);
			const position = gl.getAttribLocation(program, "p");
			gl.enableVertexAttribArray(position);
			gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			let lastControl = 0;
			const render = (time, frame) => {
				const pose = frame.getViewerPose(source);
				if (pose) {
					gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
					for (const view of pose.views) {
						const viewport = layer.getViewport(view);
						gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
						try {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, media);
						} catch {}
						gl.drawArrays(gl.TRIANGLES, 0, 6);
					}
				}
				for (const input of session.inputSources) {
					const buttons = input.gamepad?.buttons;
					if (buttons?.[0]?.pressed && time - lastControl > 500) {
						media.paused ? media.play() : media.pause();
						lastControl = time;
					}
					if (buttons?.[4]?.pressed && time - lastControl > 500) {
						media.currentTime = Math.max(0, media.currentTime - 10);
						lastControl = time;
					}
					if (buttons?.[5]?.pressed && time - lastControl > 500) {
						media.currentTime += 10;
						lastControl = time;
					}
				}
				session.requestAnimationFrame(render);
			};
			session.requestAnimationFrame(render);
			setVrStatus("VR cinema active. Trigger: play/pause · left grip: −10 seconds · right grip: +10 seconds. Use the headset system button to exit.");
			session.addEventListener("end", () => {
				gl.deleteTexture(texture);
				gl.deleteProgram(program);
				canvas.remove();
				setVrStatus("VR cinema closed.");
			});
		} catch {
			setVrStatus("VR cinema was not started. In Meta Quest Browser, allow immersive VR, use HTTPS, and retry with a local playable video.");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!video) {
			setSrc(null);
			return;
		}
		if (video.remote) {
			setSrc(null);
			setSrcError(null);
			setLoadError(null);
			return;
		}
		let cancelled = false;
		setSrcError(null);
		setLoadError(null);
		setPlaying(false);
		setCurrent(0);
		setHw(null);
		resolvePlayUrl(video).then((url) => {
			if (!cancelled) setSrc(url);
		}).catch((err) => {
			const message = err instanceof Error ? err.message : "Could not open file";
			if (!cancelled) {
				setSrcError(message);
				markUnavailable(video.id, message);
			}
		});
		probeHardwareDecode(video.mime).then((info) => {
			if (!cancelled) setHw(info);
		});
		return () => {
			cancelled = true;
		};
	}, [video]);
	const reveal = (0, import_react.useCallback)(() => {
		setChrome(true);
		window.clearTimeout(hideTimer.current);
		hideTimer.current = window.setTimeout(() => {
			setChrome(false);
		}, 2400);
	}, []);
	(0, import_react.useEffect)(() => {
		reveal();
		return () => window.clearTimeout(hideTimer.current);
	}, [activeId, reveal]);
	(0, import_react.useEffect)(() => {
		const el = mediaRef.current;
		if (!el || !src) return;
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onMeta = () => {
			setDuration(el.duration || 0);
			const resume = saved;
			if (resume && resume.t > 1 && resume.d > 0 && resume.t / resume.d < .95) {
				el.currentTime = resume.t;
				setCurrent(resume.t);
			}
		};
		const onEnd = () => {
			if (video && el.duration) markProgress(video.id, el.duration, el.duration);
			try {
				if (JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}")["playback-autoplay-next-video"]) playRelative(1, playlist);
			} catch {}
		};
		const onErr = () => {
			const message = isLikelyPlayable(video?.extension ?? "") ? "This file could not be decoded." : `${(video?.extension ?? "this").toUpperCase()} often needs a desktop player.`;
			setLoadError(message);
			if (video) markUnavailable(video.id, message);
		};
		const stopFrames = attachFrameCallback(el, (t) => {
			if (scrubbing.current) return;
			setCurrent(t);
			if (video && el.duration) markProgress(video.id, t, el.duration);
		});
		el.addEventListener("play", onPlay);
		el.addEventListener("pause", onPause);
		el.addEventListener("loadedmetadata", onMeta);
		el.addEventListener("ended", onEnd);
		el.addEventListener("error", onErr);
		el.play().catch(() => {});
		return () => {
			stopFrames();
			el.removeEventListener("play", onPlay);
			el.removeEventListener("pause", onPause);
			el.removeEventListener("loadedmetadata", onMeta);
			el.removeEventListener("ended", onEnd);
			el.removeEventListener("error", onErr);
		};
	}, [src, video?.id]);
	(0, import_react.useEffect)(() => {
		if (!video?.remote) return;
		remoteStartedAt.current = Date.now();
		const durationHint = Math.max(video.duration ?? 0, 120);
		const heartbeat = () => {
			const elapsed = Math.max(2, (Date.now() - remoteStartedAt.current) / 1e3);
			markProgress(video.id, Math.min(elapsed, durationHint * .94), durationHint);
		};
		const timer = window.setInterval(heartbeat, 5e3);
		return () => {
			heartbeat();
			window.clearInterval(timer);
		};
	}, [
		markProgress,
		video?.id,
		video?.remote
	]);
	(0, import_react.useEffect)(() => {
		const el = mediaRef.current;
		if (el) el.playbackRate = speed;
	}, [speed, src]);
	(0, import_react.useEffect)(() => {
		const xr = navigator.xr;
		if (xr) xr.isSessionSupported("immersive-vr").then(setVrAvailable).catch(() => setVrAvailable(false));
	}, []);
	(0, import_react.useEffect)(() => {
		const el = mediaRef.current;
		if (!el) return;
		el.volume = volume;
		el.muted = muted;
	}, [
		volume,
		muted,
		src
	]);
	(0, import_react.useEffect)(() => {
		const onFs = () => setFs(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onFs);
		return () => document.removeEventListener("fullscreenchange", onFs);
	}, []);
	const togglePlay = (0, import_react.useCallback)(() => {
		const el = mediaRef.current;
		if (!el) return;
		if (el.paused) el.play();
		else el.pause();
	}, []);
	const seekBy = (0, import_react.useCallback)((delta) => {
		const el = mediaRef.current;
		if (!el) return;
		el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + delta));
	}, []);
	const toggleFs = (0, import_react.useCallback)(async () => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		if (document.fullscreenElement) await document.exitFullscreen();
		else await wrap.requestFullscreen().catch(() => {});
	}, []);
	const playRandom = (0, import_react.useCallback)(() => {
		const choices = playlist.filter((id) => id !== activeId);
		const nextId = choices[Math.floor(Math.random() * choices.length)];
		if (nextId) openVideo(nextId);
	}, [
		activeId,
		openVideo,
		playlist
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			switch (e.key) {
				case " ":
				case "k":
				case "K":
					e.preventDefault();
					togglePlay();
					break;
				case "Escape":
					if (document.fullscreenElement) document.exitFullscreen();
					else closePlayer();
					break;
				case "ArrowLeft":
					e.preventDefault();
					seekBy(e.shiftKey ? -30 : -10);
					break;
				case "ArrowRight":
					e.preventDefault();
					seekBy(e.shiftKey ? 30 : 10);
					break;
				case "ArrowUp":
					e.preventDefault();
					setVolume((v) => Math.min(1, v + .05));
					setMuted(false);
					break;
				case "ArrowDown":
					e.preventDefault();
					setVolume((v) => Math.max(0, v - .05));
					break;
				case "f":
				case "F":
					e.preventDefault();
					toggleFs();
					break;
				case "m":
				case "M":
					setMuted((m) => !m);
					break;
				case "n":
				case "N":
					playRelative(1, playlist);
					break;
				case "p":
				case "P":
					playRelative(-1, playlist);
					break;
				case "r":
				case "R": playRandom();
			}
			reveal();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		togglePlay,
		seekBy,
		toggleFs,
		closePlayer,
		playRelative,
		playlist,
		playRandom,
		reveal
	]);
	if (!video) return null;
	const remote = video.remote;
	const embedSrc = remote ? remote.kind === "twitch" ? twitchEmbed(remote.embedUrl ?? "") : remote.kind === "youtube" ? youtubeEmbed(remote.embedUrl ?? video.src ?? "") : remote.embedUrl ? `${remote.embedUrl}${remote.embedUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0&modestbranding=1` : null : null;
	const shown = scrub ?? current;
	const dur = duration || capturedDur || video.duration || 0;
	const i = playlist.indexOf(video.id);
	const hwLabel = hardwareAccel && hw?.powerEfficient ? "GPU decode" : hardwareAccel ? "Hardware on" : "Software";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "fixed inset-0 z-50 flex flex-col bg-bg",
		onMouseMove: reveal,
		onTouchStart: reveal,
		children: [
			embedSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				title: video.name,
				src: embedSrc,
				className: "absolute inset-0 size-full border-0 bg-bg",
				allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
				allowFullScreen: true,
				referrerPolicy: "strict-origin-when-cross-origin"
			}, embedSrc) : remote?.kind === "youtube" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-bg px-6 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl text-fg",
						children: "This title plays on YouTube"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-md text-sm text-muted",
						children: "The embedded player could not be built for this title. Open it on YouTube instead."
					}),
					remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: remote.watchUrl,
						target: "_blank",
						rel: "noreferrer",
						className: "mt-5 inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
						children: ["Open YouTube ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
					})
				] })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: mediaRef,
				src: src ?? void 0,
				className: cn("absolute inset-0 size-full object-contain bg-bg", hardwareAccel && "hw-video"),
				playsInline: true,
				onClick: togglePlay,
				onDoubleClick: () => void toggleFs()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-transparent to-bg/50 transition-opacity duration-200 ease-[var(--ease-out)]", chrome ? "opacity-100" : "opacity-0") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative z-10 flex items-center justify-between gap-3 px-4 py-3 transition-[opacity,transform] duration-200 ease-[var(--ease-smooth-out)] sm:px-6", chrome ? "opacity-100" : "pointer-events-none opacity-0 -translate-y-1"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Back to library",
						onClick: closePlayer,
						children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "truncate font-display text-xl leading-tight text-fg sm:text-2xl",
							children: video.name.replace(/\.[^/.]+$/, "")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: remote ? [
								remote.live ? "Live" : remote.kind === "youtube" ? "YouTube" : "Twitch",
								remote.channelName,
								remote.viewers ? `${remote.viewers.toLocaleString()} watching` : null
							].filter(Boolean).join(" · ") : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								video.path,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: " · "
								}),
								video.extension.toUpperCase(),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: " · "
								}),
								formatBytes(video.size)
							] })
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mr-1 hidden items-center gap-1 rounded-full bg-elevated px-2 py-1 text-xs text-muted shadow-border sm:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "size-3" }), hwLabel]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": fav ? "Remove from favorites" : "Add to favorites",
							onClick: () => toggleFavorite(video.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", fav && "fill-accent text-accent") })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							disabled: !vrAvailable,
							title: vrAvailable ? "Enter the headset theater" : "VR requires Meta Quest Browser on a secure site",
							onClick: () => void enterVrTheater(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glasses, { className: "size-4" }), " VR theater"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": liked ? "Remove like" : "Like",
							onClick: () => toggleLike(video.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: cn("size-4", liked && "fill-accent text-accent") })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Edit tags and category",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
							align: "end",
							className: "w-72 p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetadataEditor, {
								videoId: video.id,
								initialTags: tags,
								initialCategory: category,
								onSave: (nextTags, nextCategory) => {
									setVideoTags(video.id, nextTags);
									setVideoCategory(video.id, nextCategory);
								}
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Close",
							onClick: closePlayer,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						}),
						remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: remote.watchUrl,
							target: "_blank",
							rel: "noreferrer",
							className: "hidden items-center gap-1 text-xs text-accent hover:text-fg sm:inline-flex",
							children: ["Open official player ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								if (removeReady) removeVideo(video.id);
								else setRemoveReady(true);
							},
							children: removeReady ? "Confirm remove" : "Remove"
						})
					]
				})]
			}),
			(srcError || loadError) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto mt-auto mb-auto max-w-md rounded-xl bg-surface px-6 py-5 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl text-fg",
						children: "Can’t play this file"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: srcError || loadError
					}),
					!remote && folder?.kind === "directory" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-subtle",
							children: "Reelcase still has this title in your catalog, but the browser no longer has permission to read its folder."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-3",
							onClick: () => void restoreOne(folder.id),
							children: ["Reconnect ", folder.name]
						})]
					})
				]
			}),
			vrStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute z-20 right-4 bottom-4 max-w-sm rounded-md bg-surface/95 px-3 py-2 text-xs text-fg shadow-border sm:right-6",
				children: vrStatus
			}),
			!remote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative z-10 mt-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-200 ease-[var(--ease-smooth-out)] sm:px-6", chrome ? "opacity-100" : "pointer-events-none opacity-0 translate-y-1"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						min: 0,
						max: Math.max(dur, .01),
						step: .05,
						value: [shown],
						onValueChange: (v) => {
							scrubbing.current = true;
							setScrub(v[0] ?? 0);
						},
						onValueCommit: (v) => {
							const t = v[0] ?? 0;
							const el = mediaRef.current;
							if (el) el.currentTime = t;
							setCurrent(t);
							setScrub(null);
							scrubbing.current = false;
						},
						"aria-label": "Seek"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-1 sm:gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Previous",
								disabled: i <= 0,
								onClick: () => playRelative(-1, playlist),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "icon",
								"aria-label": playing ? "Pause" : "Play",
								onClick: togglePlay,
								children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Next",
								disabled: i < 0 || i >= playlist.length - 1,
								onClick: () => playRelative(1, playlist),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Play a random video",
								disabled: playlist.length < 2,
								onClick: playRandom,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-1 min-w-20 font-mono text-xs tabular-nums text-muted",
								children: [
									formatTime(shown),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " / "
									}),
									formatTime(dur)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": muted ? "Unmute" : "Mute",
										onClick: () => setMuted((m) => !m),
										children: muted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "hidden w-24 sm:block",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
											min: 0,
											max: 1,
											step: .01,
											value: [muted ? 0 : volume],
											onValueChange: (v) => {
												setVolume(v[0] ?? 0);
												setMuted((v[0] ?? 0) === 0);
											},
											"aria-label": "Volume"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											className: "tabular-nums",
											children: speed === 1 ? "1×" : `${speed}×`
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
										align: "end",
										children: [SPEEDS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setSpeed(s),
											children: [
												s === speed ? "· " : "  ",
												s,
												"×"
											]
										}, s)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setHardwareAccel(!hardwareAccel),
											children: [hardwareAccel ? "· " : "  ", "Hardware accel"]
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": "Picture in picture",
										onClick: () => {
											const el = mediaRef.current;
											if (el && document.pictureInPictureEnabled) el.requestPictureInPicture().catch(() => {});
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PictureInPicture2, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": fs ? "Exit fullscreen" : "Fullscreen",
										onClick: () => void toggleFs(),
										children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4" })
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 hidden text-center text-xs text-subtle sm:block",
						children: "Space play · ← → 10s · F full · M mute · N / P next · Esc close"
					})
				]
			}),
			remote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mt-auto flex items-center justify-between gap-3 px-4 py-4 sm:px-6",
				children: [remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: remote.watchUrl,
					target: "_blank",
					rel: "noreferrer",
					className: "text-sm text-muted hover:text-fg",
					children: ["Open on ", remote.kind === "youtube" ? "YouTube" : "Twitch"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Fullscreen",
					onClick: () => void toggleFs(),
					children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4" })
				})]
			})
		]
	});
}
function MetadataEditor({ videoId, initialTags, initialCategory, onSave }) {
	const [tags, setTags] = (0, import_react.useState)(initialTags.join(", "));
	const [category, setCategory] = (0, import_react.useState)(initialCategory);
	const [rating, setRating$2] = (0, import_react.useState)(0);
	const [note, setNote$1] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setTags(initialTags.join(", "));
		setCategory(initialCategory);
		try {
			setRating$2(getRating(videoId));
			setNote$1(getNote(videoId));
		} catch {
			setRating$2(0);
			setNote$1("");
		}
	}, [
		videoId,
		initialCategory,
		initialTags
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-fg",
				children: "Local metadata"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: "Saved only in this browser."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Category", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: category,
					onChange: (event) => setCategory(event.target.value),
					placeholder: "Movie, tutorial, stream…",
					className: "mt-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Tags", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: tags,
					onChange: (event) => setTags(event.target.value),
					placeholder: "noir, favorites, watch later",
					className: "mt-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Quick tags"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-1.5",
				children: TAG_PRESETS.map((preset) => {
					const selected = tags.split(",").map((tag) => tag.trim().toLowerCase()).includes(preset);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTags((value) => {
							const rows = value.split(",").map((tag) => tag.trim()).filter(Boolean);
							return selected ? rows.filter((tag) => tag.toLowerCase() !== preset).join(", ") : [...rows, preset].join(", ");
						}),
						className: cn("rounded-full px-2 py-1 text-[11px] shadow-border", selected ? "bg-accent text-accent-fg" : "bg-elevated text-muted"),
						children: preset
					}, preset);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Your rating"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 flex gap-1",
				children: [
					1,
					2,
					3,
					4,
					5
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setRating$2(value);
						(0, import_react.startTransition)(() => setRating(videoId, value));
					},
					className: cn("flex size-8 items-center justify-center rounded-sm text-sm shadow-border", value <= rating ? "bg-accent text-accent-fg" : "bg-elevated text-muted"),
					children: value
				}, value))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Private viewing note", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: note,
					onChange: (event) => setNote$1(event.target.value),
					placeholder: "Why save this? What to watch for?",
					className: "mt-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "w-full",
				onClick: () => {
					setNote(videoId, note);
					onSave(tags.split(","), category);
				},
				children: "Save metadata"
			})
		]
	});
}
var EMPTY_TAGS = [];
function previewShuffle(id, seed) {
	let value = seed >>> 0;
	for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 73244475);
	return value >>> 0;
}
function isExcludedPreviewCandidate(video) {
	return Boolean(video.isSample) || /\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`);
}
function PreVideo() {
	const previewId = useLibrary((s) => s.previewId);
	const videos = useLibrary((s) => s.videos);
	const allTags = useLibrary((s) => s.tags);
	const unavailable = useLibrary((s) => s.unavailable);
	const openVideo = useLibrary((s) => s.openVideo);
	const closePreview = useLibrary((s) => s.closePreview);
	const setSource = useLibrary((s) => s.setSource);
	const setQuery = useLibrary((s) => s.setQuery);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setVideoCategory = useLibrary((s) => s.setVideoCategory);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const recordPlay = useLibrary((s) => s.recordPlay);
	const toggleLike = useLibrary((s) => s.toggleLike);
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const favorite = useLibrary((s) => previewId ? Boolean(s.favorites[previewId]) : false);
	const liked = useLibrary((s) => previewId ? Boolean(s.likes[previewId]) : false);
	const tags = useLibrary((s) => previewId ? s.tags[previewId] ?? EMPTY_TAGS : EMPTY_TAGS);
	const category = useLibrary((s) => previewId ? s.categories[previewId] ?? "" : "");
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [tagText, setTagText] = (0, import_react.useState)("");
	const [categoryText, setCategoryText] = (0, import_react.useState)("");
	const [vrAvailable, setVrAvailable] = (0, import_react.useState)(false);
	const [rating, setRating$1] = (0, import_react.useState)(0);
	const [creatorRevision, setCreatorRevision] = (0, import_react.useState)(0);
	const [creatorLoading, setCreatorLoading] = (0, import_react.useState)(false);
	const [tagRevision, setTagRevision] = (0, import_react.useState)(0);
	const [recommendationSeed, setRecommendationSeed] = (0, import_react.useState)(() => Date.now() >>> 0);
	const [localPreviewSrc, setLocalPreviewSrc] = (0, import_react.useState)(null);
	const [previewError, setPreviewError] = (0, import_react.useState)("");
	const [shelfReady, setShelfReady] = (0, import_react.useState)(false);
	const markUnavailable = useLibrary((s) => s.markUnavailable);
	const video = videos.find((item) => item.id === previewId);
	const creator = video?.remote?.channelName?.trim() ?? "";
	const creatorKeyword = creator.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const visibleTags = (creatorKeyword && !tags.includes(creatorKeyword) ? [creatorKeyword, ...tags] : tags).map((tag) => tag.replace(/^(?:keyword-|creator-)/i, ""));
	const creatorRating = creator ? getCreatorRating(creator) : 0;
	const creatorLiked = creator ? creatorIsLiked(creator) : false;
	(0, import_react.useEffect)(() => {
		if (!previewId) return;
		setRating$1(getRating(previewId));
	}, [previewId]);
	(0, import_react.useEffect)(() => {
		setShelfReady(false);
		const timer = window.setTimeout(() => setShelfReady(true), 140);
		return () => window.clearTimeout(timer);
	}, [previewId]);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setRecommendationSeed(Date.now() >>> 0), 6e4);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!video || video.remote || video.src) {
			setLocalPreviewSrc(null);
			setPreviewError("");
			return;
		}
		let cancelled = false;
		setLocalPreviewSrc(null);
		setPreviewError("");
		resolvePlayUrl(video).then((src) => {
			if (!cancelled) setLocalPreviewSrc(src);
		}).catch((error) => {
			const message = error instanceof Error ? error.message : "This local file is no longer available.";
			if (!cancelled) {
				setPreviewError(message);
				markUnavailable(video.id, message);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [markUnavailable, video]);
	(0, import_react.useEffect)(() => {
		const xr = navigator.xr;
		if (xr) xr.isSessionSupported("immersive-vr").then(setVrAvailable).catch(() => setVrAvailable(false));
	}, []);
	const related = (0, import_react.useMemo)(() => {
		if (!video || !shelfReady) return [];
		const sourceTags = new Set(tags);
		const creatorName = video.remote?.channelName?.trim().toLowerCase();
		const sourceKind = video.remote?.kind;
		return videos.filter((item) => item.id !== video.id && !isExcludedPreviewCandidate(item) && !unavailable[item.id]).map((item) => {
			const itemTags = allTags[item.id] ?? EMPTY_TAGS;
			const sharedTopics = itemTags.filter((tag) => sourceTags.has(tag)).length;
			const sameCreator = Boolean(creatorName && item.remote?.channelName?.trim().toLowerCase() === creatorName);
			const liveToVod = Boolean(video.remote?.live && !item.remote?.live && sameCreator);
			return {
				item,
				score: Number(sameCreator) * 14 + Number(liveToVod) * 8 + Number(item.folderId === video.folderId) * 5 + Number(item.genre === video.genre) * 4 + Number(item.remote?.kind === sourceKind) * 2 + sharedTopics * 3 + itemTags.filter((tag) => tagIsLiked(tag)).length * 2 + getRating(item.id) * 1.5 + getCreatorRating(item.remote?.channelName ?? "") * 2 + Number(creatorIsLiked(item.remote?.channelName ?? "")) * 3,
				random: previewShuffle(`${video.id}:${item.id}:${recommendationSeed}`, recommendationSeed)
			};
		}).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.random - b.random).slice(0, 8).map((row) => row.item);
	}, [
		allTags,
		creatorRevision,
		recommendationSeed,
		shelfReady,
		tags,
		unavailable,
		video,
		videos
	]);
	const recommended = (0, import_react.useMemo)(() => {
		if (!video || !shelfReady) return [];
		const sourceTags = new Set(tags);
		const sourceKind = video.remote?.kind;
		const seed = recommendationSeed + 17 >>> 0;
		const highlyRatedTags = new Set(videos.flatMap((item) => {
			const itemTags = allTags[item.id] ?? EMPTY_TAGS;
			return getRating(item.id) >= 4 ? itemTags : itemTags.filter((tag) => tagIsLiked(tag));
		}));
		const relatedIds = new Set(related.map((relatedItem) => relatedItem.id));
		return videos.filter((item) => item.id !== video.id && !isExcludedPreviewCandidate(item) && !unavailable[item.id] && !relatedIds.has(item.id)).map((item) => {
			const itemTags = allTags[item.id] ?? EMPTY_TAGS;
			const sharedTopics = itemTags.filter((tag) => sourceTags.has(tag)).length;
			return {
				item,
				score: Number(item.genre === video.genre) * 3 + Number(item.remote?.kind === sourceKind) * 1.5 + sharedTopics * 3 + getRating(item.id) * 2 + getCreatorRating(item.remote?.channelName ?? "") * 2 + Number(creatorIsLiked(item.remote?.channelName ?? "")) * 3 + itemTags.filter((tag) => highlyRatedTags.has(tag)).length * 3 + itemTags.filter((tag) => tagIsLiked(tag)).length * 2,
				random: previewShuffle(`${video.id}:${item.id}:${seed}`, seed)
			};
		}).sort((a, b) => b.score - a.score || a.random - b.random).slice(0, 6).map((row) => row.item);
	}, [
		allTags,
		creatorRevision,
		recommendationSeed,
		related,
		shelfReady,
		tagRevision,
		tags,
		unavailable,
		video,
		videos
	]);
	if (!video) return null;
	const embed = video.remote?.embedUrl ? video.remote.kind === "twitch" ? `${video.remote.embedUrl}${video.remote.embedUrl.includes("?") ? "&" : "?"}parent=${encodeURIComponent(window.location.hostname)}` : (() => {
		const url = new URL(video.remote.embedUrl, "https://www.youtube.com");
		url.protocol = "https:";
		url.hostname = "www.youtube.com";
		url.searchParams.set("autoplay", "1");
		url.searchParams.set("rel", "0");
		url.searchParams.set("modestbranding", "1");
		url.searchParams.set("playsinline", "1");
		url.searchParams.set("origin", window.location.origin);
		return url.toString();
	})() : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 overflow-y-auto bg-bg/98 px-4 py-5 sm:px-8 sm:py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: closePreview,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Browse"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Close preview",
						onClick: closePreview,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.7fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-lg bg-elevated shadow-border",
							children: embed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								title: `${video.name} preview`,
								src: embed,
								className: "aspect-video w-full border-0",
								allow: "autoplay; encrypted-media; picture-in-picture",
								allowFullScreen: true
							}) : video.src || localPreviewSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: video.src ?? localPreviewSrc ?? void 0,
								poster: video.poster,
								className: "aspect-video w-full bg-bg object-contain",
								muted: true,
								autoPlay: true,
								preload: "metadata",
								playsInline: true,
								controls: true
							}) : previewError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex aspect-video items-center justify-center bg-bg px-6 text-center text-sm text-muted",
								children: previewError
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: video.poster,
								alt: "",
								className: "aspect-video w-full object-cover"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: video.remote?.kind ?? video.genre ?? "Library"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl leading-none text-fg sm:text-5xl",
							children: video.name.replace(/\.[^/.]+$/, "")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-3xl text-sm leading-6 text-muted",
							children: video.tagline ?? "Preview this title, tune its metadata, then start watching."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => openVideo(video.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), " Watch now"]
								}),
								video.remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: video.remote.watchUrl,
									onClick: () => recordPlay(video.id),
									className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
									children: ["Open official player ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									title: vrAvailable ? "Use Meta Quest Browser to enter VR" : "VR is available on a Meta Quest or other WebXR browser",
									onClick: () => openVideo(video.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glasses, { className: "size-4" }), " Open VR cinema"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => {
										setEditing((value) => !value);
										setTagText(tags.join(", "));
										setCategoryText(category);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" }), " Edit tags"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: favorite ? "default" : "secondary",
									onClick: () => toggleFavorite(video.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: favorite ? "size-4 fill-current" : "size-4" }), favorite ? "Saved" : "Save"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: liked ? "default" : "secondary",
									onClick: () => toggleLike(video.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: liked ? "size-4 fill-current" : "size-4" }), liked ? "Liked" : "Like"]
								})
							]
						}),
						creator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-lg border border-border bg-elevated/55 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Creator taste"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setSource(video.remote?.kind ?? "youtube");
												setQuery(creator);
												closePreview();
											},
											className: "font-medium text-fg hover:text-accent",
											children: creator
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: creatorLiked ? "default" : "secondary",
											onClick: () => {
												toggleCreatorLike(creator);
												setCreatorRevision((value) => value + 1);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: creatorLiked ? "size-3.5 fill-current" : "size-3.5" }), creatorLiked ? "Creator liked" : "Like creator"]
										}),
										[
											1,
											2,
											3,
											4,
											5
										].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setCreatorRating(creator, value);
												setCreatorRevision((revision) => revision + 1);
											},
											className: `flex size-8 items-center justify-center rounded-sm text-xs shadow-border ${value <= creatorRating ? "bg-accent text-accent-fg" : "bg-bg/50 text-accent"}`,
											"aria-label": `Rate creator ${creator} ${value} stars`,
											children: value
										}, value))
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: creatorLoading || !video.remote,
										onClick: () => void (async () => {
											if (!video.remote) return;
											setCreatorLoading(true);
											try {
												await followRemoteQuery(creator, video.remote.kind);
												setCreatorRevision((value) => value + 1);
											} finally {
												setCreatorLoading(false);
											}
										})(),
										children: creatorLoading ? "Pulling older videos…" : "Pull older creator videos"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted",
									children: "Creator likes, ratings, and the older-video pull boost this creator and shared tags across related recommendations."
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-fg",
								children: [
									video.year ?? "New",
									" · ",
									video.genre ?? "Uncategorized"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-1.5",
								children: visibleTags.length ? visibleTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex overflow-hidden rounded-xs bg-bg/50 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										title: `Show videos tagged ${tag}`,
										onClick: () => {
											setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : "all");
											setQuery(tag);
											closePreview();
										},
										className: "px-2 py-1 transition-colors hover:bg-accent/15 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent",
										children: ["#", tag]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										title: tagIsLiked(tag) ? `Unlike tag ${tag}` : `Like tag ${tag}`,
										"aria-label": tagIsLiked(tag) ? `Unlike tag ${tag}` : `Like tag ${tag}`,
										onClick: () => {
											toggleTagLike(tag);
											setTagRevision((value) => value + 1);
										},
										className: `border-l border-border px-1.5 transition-colors hover:bg-accent/15 ${tagIsLiked(tag) ? "text-accent" : "text-subtle"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: tagIsLiked(tag) ? "size-3 fill-current" : "size-3" })
									})]
								}, tag)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-subtle",
									children: "No keywords yet"
								})
							}),
							editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 space-y-3 border-t border-border pt-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs text-muted",
										children: ["IPTC/XMP-style keywords", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: tagText,
											onChange: (event) => setTagText(event.target.value),
											className: "mt-1",
											placeholder: "science, repair, funny"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs text-muted",
										children: ["Collection / category", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: categoryText,
											onChange: (event) => setCategoryText(event.target.value),
											className: "mt-1",
											placeholder: "Tech, comedy, open film"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "w-full",
										onClick: () => {
											setVideoTags(video.id, tagText.split(","));
											setVideoCategory(video.id, categoryText);
											setEditing(false);
										},
										children: "Save metadata"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-sm text-fg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-accent" }), " Your rating"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex gap-1",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setRating$1(value);
											(0, import_react.startTransition)(() => setRating(video.id, value));
										},
										className: `flex size-9 items-center justify-center rounded-sm text-sm shadow-border ${value <= rating ? "bg-accent text-accent-fg" : "bg-bg/50 text-accent"}`,
										children: value
									}, value))
								})]
							})
						]
					})]
				}),
				related.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "More from this shelf"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6",
						children: related.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => useLibrary.getState().openPreview(item.id),
							className: "overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface",
							children: [item.poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: item.poster,
								alt: "",
								loading: "lazy",
								className: "aspect-video w-full object-cover",
								onError: (event) => {
									const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : "";
									if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
									else event.currentTarget.style.display = "none";
								}
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block aspect-video bg-bg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate px-3 py-2 text-sm text-fg",
								children: item.name
							})]
						}, item.id))
					})]
				}),
				recommended.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-9",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "More to try next"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "A fresh mix based on this title’s genre and what was added recently."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
							children: recommended.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => useLibrary.getState().openPreview(item.id),
								className: "overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface",
								children: [item.poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: item.poster,
									alt: "",
									loading: "lazy",
									className: "aspect-video w-full object-cover",
									onError: (event) => {
										const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : "";
										if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
										else event.currentTarget.style.display = "none";
									}
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block aspect-video bg-bg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate px-3 py-2 text-sm text-fg",
									children: item.name
								})]
							}, item.id))
						})
					]
				})
			]
		})
	});
}
function AiGuide() {
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const history = useLibrary((s) => s.history);
	const openPreview = useLibrary((s) => s.openPreview);
	const [recommendationSeed, setRecommendationSeed] = (0, import_react.useState)(() => Date.now());
	const [prompt, setPrompt] = (0, import_react.useState)("What should I watch tonight?");
	const [answer, setAnswer] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const localPicks = (0, import_react.useMemo)(() => {
		const favoredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id]).flatMap((video) => tags[video.id] ?? []));
		const watched = new Set(history.map((entry) => entry.id));
		const rank = (id) => {
			let value = recommendationSeed >>> 0;
			for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 73244475);
			return value >>> 0;
		};
		return [...videos].filter((video) => !watched.has(video.id)).map((video) => ({
			video,
			score: (favorites[video.id] ? 3 : 0) + (likes[video.id] ? 2 : 0) + (tags[video.id] ?? []).filter((tag) => favoredTags.has(tag)).length,
			random: rank(video.id)
		})).sort((a, b) => {
			return b.score - a.score || a.random - b.random;
		}).slice(0, 12).map((row) => row.video);
	}, [
		favorites,
		history,
		likes,
		recommendationSeed,
		tags,
		videos
	]);
	const liveNow = (0, import_react.useMemo)(() => videos.filter((video) => video.remote?.kind === "twitch" && video.remote.live).sort((a, b) => (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0)), [videos]);
	const localAnswer = () => {
		if (/live|twitch|stream/i.test(prompt) && liveNow.length) return `Live on your followed Twitch channels:\n${liveNow.slice(0, 4).map((video, index) => `${index + 1}. ${video.remote?.channelName ?? video.name}${video.remote?.viewers ? ` · ${video.remote.viewers.toLocaleString()} viewers` : ""}`).join("\n")}\n\nLive status comes from the latest refresh in Reelcase. Open a card to watch it.`;
		return localPicks.length ? `Local recommendation${localPicks.length === 1 ? "" : "s"} for “${prompt}”:\n${localPicks.slice(0, 3).map((video, index) => `${index + 1}. ${video.name} — ${video.genre ?? "a library pick"}${(tags[video.id] ?? []).length ? ` · ${(tags[video.id] ?? []).slice(0, 2).join(", ")}` : ""}`).join("\n")}\n\nThe optional cloud guide is unavailable, so these picks were ranked privately from your library signals.` : "Add a few titles, tags, likes, or favorites and the local guide will start making picks.";
	};
	const ask = async () => {
		setBusy(true);
		setAnswer("");
		await new Promise((resolve) => window.setTimeout(resolve, 120));
		setAnswer(localAnswer());
		setBusy(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), "Library guide"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-fg sm:text-5xl",
				children: "Useful answers from local signals."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted",
				children: "This guide only uses saved favorites, likes, tags, viewing history, and the most recent Twitch refresh. It does not send your catalog or files to a cloud model."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl text-fg",
						children: "Your current signals"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							history.length,
							" history signals · ",
							Object.keys(favorites).length,
							" favorites · ",
							Object.values(tags).flat().length,
							" tags"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setRecommendationSeed(Date.now()),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "New recommendations"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
					children: localPicks.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => openPreview(video.id),
						className: "rounded-md bg-bg/45 px-3 py-3 text-left shadow-border hover:bg-bg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-fg",
							children: video.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 truncate text-xs text-muted",
							children: [
								video.remote?.channelName ?? video.genre ?? "Library pick",
								" · ",
								(tags[video.id] ?? []).slice(0, 3).join(", ") || "Fresh discovery"
							]
						})]
					}, video.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg border border-border bg-elevated/60 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-fg",
						children: "Twitch live check"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: liveNow.length ? `${liveNow.length} followed channel${liveNow.length === 1 ? "" : "s"} live in the latest refresh.` : "No followed channels are live in the latest refresh."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent",
						children: [liveNow.length, " live"]
					})]
				}), liveNow.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: liveNow.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => openPreview(video.id),
						children: [video.remote?.channelName ?? video.name, video.remote?.viewers ? ` · ${video.remote.viewers.toLocaleString()}` : ""]
					}, video.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: prompt,
					onChange: (event) => setPrompt(event.target.value),
					onKeyDown: (event) => {
						if (event.key === "Enter") ask();
					},
					"aria-label": "Library guide question"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: busy || !prompt.trim(),
					onClick: () => void ask(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), busy ? "Checking library…" : "Ask guide"]
				})]
			}),
			answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 rounded-lg bg-elevated p-5 text-sm leading-6 text-fg shadow-border whitespace-pre-wrap",
				children: answer
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					"Who is live on Twitch?",
					"Something funny",
					"A tech video",
					"What fits my favorites?",
					"Show a surprise based on my tags"
				].map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setPrompt(suggestion),
					children: suggestion
				}, suggestion))
			})
		]
	});
}
/** Split pasted lists on newlines, commas, or whitespace (URLs never contain spaces). */
function linesToCandidates(value, kind) {
	return [...new Set(value.split(/[\s,]+/).map((line) => line.trim().replaceAll("\\_", "_").replace(/^["'([{<]+|["')\]}>.;:]+$/g, "")).filter(Boolean))].map((query) => ({
		query,
		kind
	}));
}
function ConnectPanel({ defaultKind = "youtube", lockedKind }) {
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const importBatch = useLibrary((s) => s.importBatch);
	const remoteBusy = useLibrary((s) => s.remoteBusy);
	const importProgress = useLibrary((s) => s.importProgress);
	const follows = useLibrary((s) => s.follows);
	const [kind, setKind] = (0, import_react.useState)(lockedKind ?? defaultKind);
	const [query, setQuery] = (0, import_react.useState)("");
	const [discovery, setDiscovery] = (0, import_react.useState)("");
	const [bulk, setBulk] = (0, import_react.useState)("");
	const [twitchName, setTwitchName] = (0, import_react.useState)("");
	const [found, setFound] = (0, import_react.useState)([]);
	const [finding, setFinding] = (0, import_react.useState)(false);
	const [savedLists, setSavedLists] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			setBulk(localStorage.getItem(`reelcase.import-draft.${kind}`) ?? "");
		} catch {}
	}, [kind]);
	(0, import_react.useEffect)(() => {
		if (lockedKind) setKind(lockedKind);
	}, [lockedKind]);
	(0, import_react.useEffect)(() => {
		try {
			setSavedLists(JSON.parse(localStorage.getItem(`reelcase.import-history.${kind}`) ?? "[]"));
		} catch {
			setSavedLists([]);
		}
	}, [kind]);
	const candidates = (0, import_react.useMemo)(() => linesToCandidates(bulk, kind), [bulk, kind]);
	const networkFollows = follows.filter((follow) => follow.kind === kind);
	const recommended = (kind === "twitch" ? [
		"Northernlion",
		"CohhCarnage",
		"LIRIK"
	] : [
		"H3Podcast",
		"LinusTechTips",
		"MarquesBrownlee",
		"Kurzgesagt"
	]).filter((handle) => !follows.some((follow) => follow.kind === kind && follow.handle.toLowerCase() === handle.toLowerCase()));
	const submit = async () => {
		const items = linesToCandidates(query, kind);
		if (!items.length) return;
		if (items.length > 1) {
			await importItems(items);
			setQuery("");
			return;
		}
		try {
			await followRemoteQuery(items[0].query, kind);
			setQuery("");
			toast.success(kind === "twitch" ? "Twitch channel added" : "YouTube channel added");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not add that source");
		}
	};
	const importItems = async (items) => {
		if (!items.length) return;
		const normalized = items.map((item) => ({
			...item,
			query: item.query.trim().replaceAll("\\_", "_")
		}));
		const saved = [.../* @__PURE__ */ new Set([...normalized.map((item) => item.query), ...savedLists])].slice(0, 1e3);
		localStorage.setItem(`reelcase.import-history.${kind}`, JSON.stringify(saved));
		localStorage.setItem(`reelcase.import-draft.${kind}`, bulk);
		setSavedLists(saved);
		try {
			const result = await importBatch(normalized);
			setFound([]);
			if (result.failed && result.failedQueries?.length) toast.message(`${result.ok} added · ${result.failed} unavailable`, { description: result.failedQueries.slice(0, 8).map((query) => `${query}: ${result.failedReasons?.[query] ?? "unavailable"}`).join(" · ") + (result.failedQueries.length > 8 ? "…" : "") });
			else toast.success(result.failed ? `${result.ok} added · ${result.failed} unavailable` : `${result.ok} channel${result.ok === 1 ? "" : "s"} added`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not import those channels");
		}
	};
	const findTwitchFollows = async () => {
		const login = twitchName.trim();
		if (!login) return;
		setFinding(true);
		try {
			const { fetchTwitchFollowing } = await import("./api-CeYPgULp.mjs");
			const result = await fetchTwitchFollowing({ data: { login } });
			const rows = result.channels.map((channel) => ({
				query: channel.login,
				kind: "twitch"
			}));
			setFound(rows);
			if (!rows.length) toast.message(result.privateList ? "Twitch did not expose a public following list for that profile." : "No follows were found for that profile.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not look up that Twitch profile");
		} finally {
			setFinding(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8 overflow-hidden rounded-xl bg-surface shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border bg-elevated/45 px-5 py-5 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
								children: [
									kind === "twitch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Youtube, { className: "size-3.5" }),
									" ",
									kind === "twitch" ? "Twitch follow manager" : "YouTube subscriptions"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-3xl leading-none text-fg sm:text-4xl",
								children: kind === "twitch" ? "Build your live desk." : "Bring subscriptions home."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: kind === "twitch" ? "Keep live channels, VODs, and clips in a Twitch-only follow list." : "Keep channel uploads, previews, and recommendations in a YouTube-only subscription list."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Following",
							value: follows.length
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "This network",
							value: networkFollows.length
						})]
					})]
				}), !lockedKind && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 inline-flex rounded-md bg-bg/50 p-1 shadow-border",
					role: "tablist",
					"aria-label": "Network",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkTab, {
						active: kind === "youtube",
						onClick: () => {
							setKind("youtube");
							setFound([]);
						},
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Youtube, { className: "size-4" }),
						label: "YouTube"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkTab, {
						active: kind === "twitch",
						onClick: () => {
							setKind("twitch");
							setFound([]);
						},
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }),
						label: "Twitch"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBadge, {
						number: "01",
						label: kind === "twitch" ? "Follow live channels" : "Add subscriptions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: kind === "youtube" ? "Paste a channel URL, @handle, channel ID, or a video link. Several at once is fine." : "Paste one or more Twitch usernames or channel URLs (comma, space, or newline separated)."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						onSubmit: (event) => {
							event.preventDefault();
							submit();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: kind === "youtube" ? "youtube.com/@creator or @creator" : "ironmouse, zackrawrr  or  twitch.tv/creator",
							"aria-label": kind === "youtube" ? "YouTube channel or video" : "Twitch channels"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: remoteBusy || !query.trim(),
							className: "sm:w-32",
							children: [
								remoteBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }),
								" ",
								"Follow"
							]
						})]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBadge, {
						number: "02",
						label: kind === "twitch" ? "Import Twitch follows" : "Import YouTube subscriptions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: kind === "twitch" ? "Paste a list of Twitch logins or channel URLs. You can also look up someone else's public follows below." : "Paste one channel URL or @handle per line. This is the fastest way to move a saved subscription list into Reelcase."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 rounded-md bg-bg/45 px-3 py-2 text-xs leading-5 text-muted",
							children: kind === "twitch" ? "How to import: copy public channel links or logins from Twitch, paste them below (one per line, or comma-separated), then select Import list. Private Twitch follows are not exposed by the site, so Reelcase cannot read them directly." : "How to import: copy YouTube channel URLs or @handles from your subscriptions, paste them below (one per line, or comma-separated), then select Import list. Your pasted list stays saved locally for future refreshes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: bulk,
							onChange: (event) => {
								setBulk(event.target.value);
								localStorage.setItem(`reelcase.import-draft.${kind}`, event.target.value);
							},
							className: "mt-3 min-h-28 w-full resize-y rounded-md bg-elevated px-3 py-2.5 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/50",
							placeholder: kind === "twitch" ? "ironmouse\nzackrawrr\ntwitch.tv/shroud, pokimane" : "@CreatorOne\nyoutube.com/@CreatorTwo\nhttps://youtube.com/channel/UC...",
							"aria-label": kind === "twitch" ? "Twitch channels to import" : "YouTube channels to import"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: candidates.length ? `${candidates.length} channels ready` : "Separate with spaces, commas, or new lines."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								disabled: remoteBusy || !candidates.length,
								onClick: () => void importItems(candidates),
								children: [
									remoteBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-4" }),
									" ",
									"Import list"
								]
							})]
						}),
						kind === "twitch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Or enter a Twitch profile to look for its publicly visible follows, then choose what to add."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-col gap-2 sm:flex-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: twitchName,
										onChange: (event) => setTwitchName(event.target.value),
										placeholder: "Twitch username",
										"aria-label": "Twitch username to inspect"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										disabled: finding || !twitchName.trim(),
										onClick: () => void findTwitchFollows(),
										className: "sm:w-40",
										children: [
											finding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-4" }),
											" ",
											"Find follows"
										]
									})]
								}),
								found.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportReview, {
									items: found,
									onImport: () => void importItems(found),
									busy: remoteBusy
								})
							]
						})
					] })]
				})]
			}),
			recommended.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border px-5 py-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Recommended follows"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Quick local suggestions. Already saved channels are hidden automatically."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: recommended.map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: remoteBusy,
							onClick: () => void importItems([{
								query: handle,
								kind
							}]),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-3.5" }),
								" ",
								handle
							]
						}, handle))
					})
				]
			}),
			savedLists.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border px-5 py-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Saved import list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [savedLists.length, " channel entries retained locally for this service. Reelcase retries this list automatically at startup when the follow shelf is empty."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: savedLists.slice(0, 12).map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm bg-elevated px-2 py-1 text-xs text-muted",
							children: handle
						}, handle))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-3",
						size: "sm",
						variant: "secondary",
						disabled: remoteBusy,
						onClick: () => void importItems(savedLists.map((query) => ({
							query,
							kind
						}))),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-3.5" }), " Load saved list now"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 border-t border-border bg-elevated/30 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-accent" }), " Latest uploads and live streams appear automatically on Home."]
					}),
					importProgress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-accent",
						children: [
							importProgress.label,
							" ",
							importProgress.done,
							"/",
							importProgress.total
						]
					}),
					kind === "twitch" && !importProgress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5" }), " Private following lists cannot be read by Twitch."]
					})
				]
			}),
			kind === "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border px-5 py-5 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Live discovery"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-col gap-2 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: discovery,
							onChange: (event) => setDiscovery(event.target.value),
							placeholder: "Search live channels, games, or events",
							"aria-label": "Discover live YouTube channels"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "inline-flex min-h-10 items-center justify-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							target: "_blank",
							rel: "noreferrer",
							href: `https://www.youtube.com/results?search_query=${encodeURIComponent(discovery || "live")}&sp=EgJAAQ%3D%3D`,
							children: "Browse live"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "Open a live channel, then paste it above to add it to your guide. Your followed channels remain browsable, refreshable, and ready for a random pick from Home."
					})
				]
			})
		]
	});
}
function NetworkTab({ active, icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "tab",
		"aria-selected": active,
		onClick,
		className: cn("flex h-10 items-center gap-2 rounded-sm px-4 text-sm transition-[background-color,color,box-shadow] duration-150", active ? "bg-surface text-fg shadow-border" : "text-muted hover:text-fg"),
		children: [icon, label]
	});
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-20 rounded-md bg-bg/50 px-3 py-2 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-lg leading-none tabular-nums text-fg",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-subtle",
			children: label
		})]
	});
}
function StepBadge({ number, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "font-mono text-xs font-medium tracking-[0.12em] text-accent uppercase",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mr-2 text-subtle",
			children: number
		}), label]
	});
}
function ImportReview({ items, onImport, busy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-md bg-elevated p-3 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-fg",
				children: [
					items.length,
					" public follow",
					items.length === 1 ? "" : "s",
					" found"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				disabled: busy,
				onClick: onImport,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-4" }), " Import all"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 line-clamp-2 text-xs text-muted",
			children: [items.slice(0, 12).map((item) => item.query).join(" · "), items.length > 12 ? " · …" : ""]
		})]
	});
}
var FAST_POLL_MS = 400;
var IDLE_POLL_MS = 2e3;
var PING_INTERVAL_MS = 2e3;
var STALL_MS = 1e4;
var MAX_RECOVERY_ATTEMPTS = 3;
var SIGNAL_RETRY_DELAYS_MS = [250, 750];
function defaultIceServers() {
	return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
}
var P2PRoom = class {
	opts;
	peers = /* @__PURE__ */ new Map();
	/** Per-remote-peer signal delivery chains (order-preserving). */
	signalQueues = /* @__PURE__ */ new Map();
	cursor = 0;
	pollTimer = null;
	pingTimer = null;
	closed = false;
	everPolled = false;
	lastPeersFingerprint = "";
	lastRosterCount = -1;
	/** Same-origin tabs get a zero-config reliable fallback while WebRTC negotiates. */
	localRelay = null;
	debug(event) {
		this.opts.onDebug?.(`${(/* @__PURE__ */ new Date()).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		})} · ${event}`);
	}
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		if (typeof BroadcastChannel !== "undefined") {
			this.localRelay = new BroadcastChannel(`reelcase-watch:${this.opts.room}`);
			this.localRelay.onmessage = (event) => {
				const message = event.data;
				if (!message || message.from === this.opts.selfId || message.to && message.to !== this.opts.selfId) return;
				this.debug("Local tab relay delivered a room message");
				this.opts.onMessage?.(message.from ?? "local-guest", message.data, "reliable");
			};
			this.debug("Local tab relay ready");
			this.opts.onConnected?.();
		}
		try {
			await this.pollOnce();
			this.debug("Signaling registered");
		} catch {
			this.debug("Signaling retry scheduled");
		}
		if (this.closed) return;
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
		this.pingTimer = setInterval(() => {
			this.pingAll();
			this.watchdog();
		}, PING_INTERVAL_MS);
	}
	close() {
		this.closed = true;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		if (this.pingTimer) clearInterval(this.pingTimer);
		this.localRelay?.close();
		this.localRelay = null;
		for (const slot of this.peers.values()) slot.pc.close();
		this.peers.clear();
		fetch("/api/rtc", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				op: "leave",
				room: this.opts.room,
				peer: this.opts.selfId
			}),
			keepalive: true
		}).catch(() => {});
	}
	/** Send on the unreliable game-state channel (drops stale packets). */
	broadcast(data) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		for (const slot of this.peers.values()) if (slot.state?.readyState === "open") slot.state.send(wire);
	}
	/** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
	send(data, peerId) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
		let delivered = false;
		for (const slot of targets) {
			if (slot?.reliable?.readyState === "open") delivered = true;
			if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
		}
		if (!delivered) this.localRelay?.postMessage({
			from: this.opts.selfId,
			to: peerId,
			data
		});
	}
	peerList() {
		return [...this.peers.values()].map((s) => ({ ...s.info }));
	}
	schedulePoll(delay) {
		if (this.closed) return;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = setTimeout(() => void this.poll(), delay);
	}
	anyPairConnecting() {
		for (const s of this.peers.values()) {
			if (s.terminal) continue;
			if (s.info.connectionState !== "connected") return true;
		}
		return false;
	}
	async pollOnce() {
		const params = new URLSearchParams({
			room: this.opts.room,
			peer: this.opts.selfId,
			name: this.opts.name ?? "",
			since: String(this.cursor)
		});
		const res = await fetch(`/api/rtc?${params}`);
		if (this.closed) return;
		if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
		const body = await res.json();
		if (this.closed) return;
		if (!this.everPolled) {
			this.everPolled = true;
			this.opts.onConnected?.();
		}
		this.reconcileRoster(body.peers);
		const otherPeers = Math.max(0, body.peers.length - 1);
		if (otherPeers !== this.lastRosterCount) {
			this.lastRosterCount = otherPeers;
			this.debug(`Roster visible: ${otherPeers} other peer${otherPeers === 1 ? "" : "s"}`);
		}
		const roster = new Set(body.peers.map((p) => p.id));
		for (const sig of body.signals) {
			this.cursor = Math.max(this.cursor, sig.id);
			await this.onSignal(sig.from, sig.kind, sig.payload, roster);
			if (this.closed) return;
		}
	}
	async poll() {
		if (this.closed) return;
		try {
			await this.pollOnce();
		} catch {}
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
	}
	reconcileRoster(peers) {
		const alive = new Set(peers.map((p) => p.id));
		for (const p of peers) {
			if (p.id === this.opts.selfId) continue;
			const existing = this.peers.get(p.id);
			if (existing) existing.info.name = p.name;
			else this.connectTo(p.id, p.name, this.opts.selfId > p.id);
		}
		for (const [id, slot] of this.peers) if (!alive.has(id)) {
			slot.pc.close();
			this.peers.delete(id);
		}
		this.emitPeers();
	}
	connectTo(peerId, name, initiator) {
		if (this.closed) return null;
		const pc = new RTCPeerConnection({ iceServers: this.opts.iceServers ?? defaultIceServers() });
		const slot = {
			pc,
			makingOffer: false,
			ignoreOffer: false,
			pendingCandidates: [],
			lastProgressAt: Date.now(),
			recoveryAttempts: 0,
			info: {
				id: peerId,
				name,
				connectionState: pc.connectionState,
				candidateType: null,
				rttMs: null
			}
		};
		this.peers.set(peerId, slot);
		pc.onicecandidate = (e) => {
			if (e.candidate) this.sendSignal(peerId, "ice", e.candidate.toJSON());
		};
		pc.onconnectionstatechange = () => {
			slot.info.connectionState = pc.connectionState;
			if (pc.connectionState === "connecting" || pc.connectionState === "connected") slot.lastProgressAt = Date.now();
			if (pc.connectionState === "connected") {
				slot.recoveryAttempts = 0;
				slot.terminal = false;
				this.readCandidateType(slot);
			}
			this.emitPeers();
			if (pc.connectionState === "failed") pc.restartIce();
			if (pc.connectionState === "failed" || pc.connectionState === "disconnected") this.schedulePoll(FAST_POLL_MS);
		};
		pc.onnegotiationneeded = async () => {
			try {
				slot.makingOffer = true;
				await pc.setLocalDescription();
				await this.sendSignal(peerId, "offer", pc.localDescription.toJSON());
			} catch {} finally {
				slot.makingOffer = false;
			}
		};
		pc.ondatachannel = (e) => this.attachChannel(slot, e.channel);
		if (initiator) {
			this.debug(`Negotiating direct channel with ${name || "guest"}`);
			this.attachChannel(slot, pc.createDataChannel("state", {
				ordered: false,
				maxRetransmits: 0
			}));
			this.attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
		}
		return slot;
	}
	attachChannel(slot, channel) {
		if (channel.label === "state") slot.state = channel;
		else slot.reliable = channel;
		channel.onopen = () => {
			slot.lastProgressAt = Date.now();
			this.debug(`Direct ${channel.label} channel open with ${slot.info.name || "guest"}`);
		};
		channel.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.t === "ping") {
				if (slot.state?.readyState === "open") slot.state.send(JSON.stringify({ t: "pong" }));
			} else if (msg.t === "pong") {
				if (slot.pingSentAt) {
					slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
					slot.pingSentAt = void 0;
					this.emitPeers();
				}
			} else this.opts.onMessage?.(slot.info.id, msg.d, channel.label === "state" ? "state" : "reliable");
		};
	}
	/** Apply buffered ICE candidates once a remote description is in place. */
	async flushPendingCandidates(slot) {
		while (slot.pendingCandidates.length > 0) {
			const candidate = slot.pendingCandidates.shift();
			try {
				await slot.pc.addIceCandidate(candidate);
			} catch (err) {
				if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
			}
			if (this.closed) return;
		}
	}
	async onSignal(from, kind, payload, roster) {
		if (this.closed) return;
		let slot = this.peers.get(from);
		if (!slot) {
			if (!roster.has(from)) return;
			const created = this.connectTo(from, "", false);
			if (!created) return;
			slot = created;
		}
		const polite = this.opts.selfId < from;
		try {
			if (kind === "offer" || kind === "answer") {
				const description = payload;
				const collision = kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
				slot.ignoreOffer = !polite && collision;
				if (slot.ignoreOffer) return;
				try {
					await slot.pc.setRemoteDescription(description);
				} catch (err) {
					if (kind !== "offer" || slot.recreatedForOffer) throw err;
					const attempts = slot.recoveryAttempts;
					const name = slot.info.name;
					slot.pc.close();
					this.peers.delete(from);
					const fresh = this.connectTo(from, name, false);
					if (!fresh) return;
					fresh.recoveryAttempts = attempts;
					fresh.recreatedForOffer = true;
					slot = fresh;
					await slot.pc.setRemoteDescription(description);
				}
				if (this.closed) return;
				await this.flushPendingCandidates(slot);
				if (this.closed) return;
				if (kind === "offer") {
					await slot.pc.setLocalDescription();
					if (this.closed) return;
					await this.sendSignal(from, "answer", slot.pc.localDescription.toJSON());
				}
			} else if (kind === "ice") {
				const candidate = payload;
				if (!slot.pc.remoteDescription) {
					slot.pendingCandidates.push(candidate);
					return;
				}
				try {
					await slot.pc.addIceCandidate(candidate);
				} catch (err) {
					if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
				}
			}
		} catch {}
	}
	/**
	* Signals are serialized per remote peer (a candidate must never overtake
	* its SDP into the DB) and retried on failure with short backoff.
	*/
	sendSignal(to, kind, payload) {
		const next = (this.signalQueues.get(to) ?? Promise.resolve()).then(() => this.postSignal(to, kind, payload));
		this.signalQueues.set(to, next.catch(() => {}));
		return next;
	}
	async postSignal(to, kind, payload) {
		for (let attempt = 0;; attempt++) {
			if (this.closed) return;
			try {
				const res = await fetch("/api/rtc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						op: "signal",
						room: this.opts.room,
						from: this.opts.selfId,
						to,
						kind,
						payload
					})
				});
				if (res.ok) return;
				throw new Error(`signal POST failed: ${res.status}`);
			} catch (err) {
				if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
					console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
					this.debug(`Could not deliver ${kind} signal`);
					return;
				}
				await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
			}
		}
	}
	pingAll() {
		const wire = JSON.stringify({ t: "ping" });
		for (const slot of this.peers.values()) {
			if (slot.state?.readyState !== "open") continue;
			const stale = slot.pingSentAt !== void 0 && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
			if (slot.pingSentAt === void 0 || stale) {
				slot.pingSentAt = performance.now();
				slot.state.send(wire);
			}
		}
	}
	/**
	* Stuck-pair recovery, piggybacked on the ping interval. A pair that has
	* made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
	* RTCPeerConnection (new DTLS identity — fixes the suspend/resume
	* fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
	* visible to the app as its last connectionState, ignored by fast-poll.
	*/
	watchdog() {
		if (this.closed) return;
		const now = Date.now();
		for (const [peerId, slot] of this.peers) {
			const live = slot.pc.connectionState;
			if (live !== slot.info.connectionState) {
				slot.info.connectionState = live;
				if (live === "connecting" || live === "connected") slot.lastProgressAt = now;
				this.emitPeers();
			}
			if (slot.terminal || live === "connected") continue;
			if (now - slot.lastProgressAt <= STALL_MS) continue;
			if (slot.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
				slot.terminal = true;
				this.emitPeers();
				continue;
			}
			slot.recoveryAttempts += 1;
			slot.lastProgressAt = now;
			if (this.opts.selfId > peerId) {
				const { name } = slot.info;
				const attempts = slot.recoveryAttempts;
				slot.pc.close();
				this.peers.delete(peerId);
				const fresh = this.connectTo(peerId, name, true);
				if (fresh) fresh.recoveryAttempts = attempts;
				this.schedulePoll(FAST_POLL_MS);
			}
		}
	}
	async readCandidateType(slot) {
		try {
			const stats = await slot.pc.getStats();
			let selected;
			stats.forEach((s) => {
				if (s.type === "candidate-pair" && s.nominated) selected = s;
			});
			const localId = selected?.localCandidateId;
			if (localId) {
				const local = stats.get(localId);
				slot.info.candidateType = local?.candidateType ?? null;
				this.emitPeers();
			}
		} catch {}
	}
	emitPeers() {
		const list = this.peerList();
		const fingerprint = JSON.stringify(list.map((p) => [
			p.id,
			p.name,
			p.connectionState,
			p.candidateType,
			p.rttMs
		]));
		if (fingerprint === this.lastPeersFingerprint) return;
		this.lastPeersFingerprint = fingerprint;
		this.opts.onPeersChanged?.(list);
	}
};
function useP2PRoom(room, name) {
	const [selfId] = (0, import_react.useState)(() => `p-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`);
	const [peers, setPeers] = (0, import_react.useState)([]);
	const [joined, setJoined] = (0, import_react.useState)(false);
	const [events, setEvents] = (0, import_react.useState)([]);
	const ref = (0, import_react.useRef)(null);
	const listeners = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (!room.trim()) {
			setJoined(false);
			setPeers([]);
			setEvents([]);
			ref.current = null;
			return;
		}
		setEvents(["Preparing room connection…"]);
		const p2p = new P2PRoom({
			room,
			selfId,
			name,
			onPeersChanged: setPeers,
			onConnected: () => setJoined(true),
			onDebug: (event) => setEvents((items) => [event, ...items].slice(0, 16)),
			onMessage: (from, data) => listeners.current.forEach((fn) => fn(from, data))
		});
		ref.current = p2p;
		p2p.join();
		return () => {
			ref.current = null;
			p2p.close();
		};
	}, [
		room,
		selfId,
		name
	]);
	return {
		selfId,
		peers,
		joined,
		events,
		send: (0, import_react.useCallback)((data, peer) => ref.current?.send(data, peer), []),
		onMessage: (0, import_react.useCallback)((fn) => {
			listeners.current.add(fn);
			return () => {
				listeners.current.delete(fn);
			};
		}, [])
	};
}
/**
* Optional, user-initiated image classification. The model executes in the
* browser (WebGPU when available, otherwise WASM); photo bytes stay local.
* The model download is cached by the browser for later passes.
*/
async function classifyImagesLocally(urls, onProgress) {
	const { pipeline } = await import("../_libs/@huggingface/transformers+[...].mjs").then((n) => n.t);
	const classifier = await pipeline("image-classification", "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k", { device: typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm" });
	const results = Array.from({ length: urls.length }, () => []);
	let cursor = 0;
	let completed = 0;
	const workers = Array.from({ length: Math.min(3, urls.length) }, async () => {
		while (true) {
			const index = cursor++;
			if (index >= urls.length) return;
			const labels = await classifier(urls[index], { topk: 5 });
			results[index] = [...new Set(labels.filter((item) => item.score >= .045).map((item) => item.label.toLowerCase().split(",")[0].replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).filter((label) => label.length >= 3).slice(0, 5))];
			completed += 1;
			onProgress?.(completed, urls.length);
		}
	});
	await Promise.all(workers);
	return results;
}
var widgetScript;
function loadWidgets() {
	return widgetScript ??= new Promise((resolve, reject) => {
		const existing = window.twttr;
		if (existing?.widgets) {
			resolve(existing);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://platform.twitter.com/widgets.js";
		script.async = true;
		const timeout = window.setTimeout(() => {
			script.remove();
			reject(/* @__PURE__ */ new Error("X did not respond"));
		}, 12e3);
		script.onload = () => {
			clearTimeout(timeout);
			const api = window.twttr;
			api?.widgets ? resolve(api) : reject(/* @__PURE__ */ new Error("X unavailable"));
		};
		script.onerror = () => {
			clearTimeout(timeout);
			script.remove();
			reject(/* @__PURE__ */ new Error("X unavailable"));
		};
		document.head.append(script);
	}).catch((error) => {
		widgetScript = void 0;
		throw error;
	});
}
function XTimeline({ account, topic }) {
	const container = (0, import_react.useRef)(null);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const [status, setStatus] = (0, import_react.useState)("Loading public posts…");
	const deskKey = `reelcase.x-desk.${topic ? `topic:${topic.query}` : `account:${account ?? "public"}`}`;
	const [lastReadAt, setLastReadAt] = (0, import_react.useState)(() => typeof window === "undefined" ? 0 : Number(localStorage.getItem(deskKey) ?? 0));
	(0, import_react.useEffect)(() => {
		const element = container.current;
		if (!element) return;
		let cancelled = false;
		setStatus("Loading public posts…");
		element.replaceChildren();
		const link = document.createElement("a");
		link.className = "twitter-timeline";
		link.href = topic ? `https://twitter.com/search?q=${encodeURIComponent(topic.query)}&src=typed_query&f=live` : `https://twitter.com/${account}`;
		link.dataset.height = "640";
		link.dataset.theme = document.documentElement.dataset.theme === "day" ? "light" : "dark";
		link.dataset.dnt = "true";
		link.textContent = topic ? `Public posts about ${topic.label}` : `Public posts by @${account}`;
		element.append(link);
		const timeout = window.setTimeout(() => {
			if (!cancelled) setStatus("X hasn’t supplied a timeline. Open the profile to view posts, or retry.");
		}, 15e3);
		const observer = new MutationObserver(() => {
			const frame = element.querySelector("iframe");
			if (frame) frame.addEventListener("load", () => {
				if (!cancelled) {
					clearTimeout(timeout);
					const now = Date.now();
					localStorage.setItem(deskKey, String(now));
					setLastReadAt(now);
					setStatus("Public timeline supplied by X. If posts are unavailable, open the profile.");
				}
			}, { once: true });
		});
		observer.observe(element, {
			childList: true,
			subtree: true
		});
		loadWidgets().then((api) => {
			if (!cancelled) return api.widgets.load(element);
		}).catch(() => {
			if (!cancelled) {
				clearTimeout(timeout);
				setStatus("X is unavailable here. Your saved accounts are still ready to open.");
			}
		});
		return () => {
			cancelled = true;
			clearTimeout(timeout);
			observer.disconnect();
			element.replaceChildren();
		};
	}, [
		account,
		attempt,
		deskKey,
		topic
	]);
	const destination = topic ? `https://x.com/search?q=${encodeURIComponent(topic.query)}&src=typed_query&f=live` : `https://x.com/${account}`;
	const title = topic ? topic.label : `@${account}`;
	const unavailable = /hasn’t supplied|unavailable/i.test(status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5 rounded-lg border border-border bg-elevated p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setAttempt((value) => value + 1),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Retry"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg",
						href: destination,
						target: "_blank",
						rel: "noopener noreferrer",
						children: [topic ? "Open topic" : "Open profile", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "my-4 text-sm text-muted",
				children: status
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-subtle",
				children: lastReadAt ? `Reading position saved locally · last loaded ${new Date(lastReadAt).toLocaleString()}` : "No public timeline has loaded in this browser yet."
			}),
			unavailable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid gap-3 rounded-md bg-bg/45 p-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm font-medium text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-accent" }), "Public-reader fallback"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "X did not permit an embedded timeline in this browser. Reelcase does not invent posts or store credentials."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: destination,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg",
						children: ["Open official view", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: topic ? `https://www.google.com/search?q=site%3Ax.com+${encodeURIComponent(topic.query)}` : `https://www.google.com/search?q=site%3Ax.com%2F${encodeURIComponent(account ?? "")}`,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "inline-flex min-h-10 items-center rounded-sm bg-surface px-3 text-sm text-fg shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 size-4" }), "Search public posts"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: container,
				className: "min-h-24 overflow-hidden"
			})
		]
	});
}
var HUB_KEY = "reelcase.hub.v1";
function gameKind(item) {
	if (item.launchUrl) return "web-ready";
	if (/\.url$/i.test(item.name)) return "web-needs-target";
	if (/\.lnk$/i.test(item.name)) return "desktop-shortcut";
	if (/\.appref-ms$/i.test(item.name)) return "desktop-app";
	return "desktop-executable";
}
function isWebGame(item) {
	return gameKind(item).startsWith("web-");
}
function isGameHelper(item) {
	const value = `${item.name} ${item.path}`.toLowerCase();
	return /(?:uninstall|setup|installer|updater|crashpad|helper|redistributable|vcredist|python|node_modules|\\\\lib\\\\|\/lib\/)/.test(value);
}
function gameBadge(item) {
	if (item.launchUrl?.startsWith("steam:")) return "STEAM";
	if (item.launchUrl?.startsWith("epic:") || item.launchUrl?.startsWith("com.epicgames")) return "EPIC";
	if (gameKind(item) === "web-needs-target") return "LINK?";
	if (gameKind(item) === "web-ready") return "WEB";
	if (/\.appref-ms$/i.test(item.name)) return "APP";
	if (/\.lnk$/i.test(item.name)) return "LINK";
	return "GAME";
}
var PREFERENCE_GROUPS = {
	Alerts: [
		"Go-live alerts",
		"New Twitch VOD alerts",
		"New YouTube upload alerts",
		"Desktop notifications"
	],
	Playback: ["Autoplay next video"],
	Privacy: ["Reduce motion", "Hide demo media"]
};
var ACTIVE_PREFERENCE_DETAILS = {
	"alerts-go-live-alerts": "Active: adds an in-app notice when a tracked Twitch channel goes live after a refresh.",
	"alerts-new-twitch-vod-alerts": "Active: adds an in-app notice when a tracked Twitch channel has a newly discovered VOD or clip.",
	"alerts-new-youtube-upload-alerts": "Active: adds an in-app notice when a tracked YouTube channel has a newly discovered upload.",
	"alerts-desktop-notifications": "Active: asks the browser for permission, then mirrors enabled Reelcase alerts as desktop notifications.",
	"playback-autoplay-next-video": "Active: starts the next library title when a local video ends.",
	"privacy-reduce-motion": "Active: reduces animation and scrolling motion across Reelcase.",
	"privacy-hide-demo-media": "Active: hides bundled demonstration titles from your library shelves."
};
var PREFERENCES = Object.entries(PREFERENCE_GROUPS).flatMap(([group, labels]) => labels.map((label) => ({
	key: `${group}-${label}`.toLowerCase().replaceAll(" ", "-"),
	group,
	label,
	detail: ACTIVE_PREFERENCE_DETAILS[`${group}-${label}`.toLowerCase().replaceAll(" ", "-")],
	implemented: true
})));
function readHub() {
	const samples = [
		{
			name: "Calibration cube.stl",
			path: "Reelcase samples/Calibration cube.stl",
			size: 182400,
			addedAt: 1
		},
		{
			name: "Cable clip.3mf",
			path: "Reelcase samples/Cable clip.3mf",
			size: 94100,
			addedAt: 2
		},
		{
			name: "OpenSCAD phone stand.stl",
			path: "Open-source examples/OpenSCAD phone stand.stl",
			size: 512400,
			addedAt: 4
		},
		{
			name: "Gridfinity bin.3mf",
			path: "Open-source examples/Gridfinity bin.3mf",
			size: 784200,
			addedAt: 5
		},
		{
			name: "Benchy calibration.stl",
			path: "Open-source examples/Benchy calibration.stl",
			size: 643100,
			addedAt: 6
		},
		{
			name: "Parametric drawer label.stl",
			path: "Open-source examples/Parametric drawer label.stl",
			size: 229100,
			addedAt: 7
		},
		{
			name: "Tool tray.gcode",
			path: "Reelcase samples/Tool tray.gcode",
			size: 1248e3,
			addedAt: 3
		}
	];
	try {
		const raw = localStorage.getItem(HUB_KEY);
		if (!raw) return {
			prints: samples,
			games: []
		};
		return JSON.parse(raw);
	} catch {
		return {
			prints: samples,
			games: []
		};
	}
}
function writeHub(next) {
	localStorage.setItem(HUB_KEY, JSON.stringify(next));
}
function filesToItems(files, gamesOnly = false) {
	return [...files].filter((file) => !gamesOnly || /\.(exe|lnk|url|appref-ms)$/i.test(file.name)).filter((file) => !/^(uninstall|setup|crashreporter)/i.test(file.name)).map((file) => ({
		name: file.name,
		path: file.webkitRelativePath || file.name,
		size: file.size,
		addedAt: Date.now()
	}));
}
function bytes(value) {
	return value < 1048576 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;
}
function watchRoomEmbed(video) {
	const base = video.remote?.embedUrl;
	if (!base) return "";
	const url = new URL(base);
	if (video.remote?.kind === "twitch") {
		url.searchParams.set("parent", window.location.hostname);
		url.searchParams.set("autoplay", "false");
	} else {
		url.searchParams.set("autoplay", "0");
		url.searchParams.set("rel", "0");
		url.searchParams.set("playsinline", "1");
		url.searchParams.set("controls", "1");
		url.searchParams.set("origin", window.location.origin);
		if (video.remote?.kind === "youtube") url.searchParams.set("enablejsapi", "1");
	}
	return url.toString();
}
function watchRoomPoster(video) {
	if (video.remote?.kind === "youtube" && video.remote.videoId) return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
	return video.poster;
}
function roomShuffleRank(id, seed) {
	let value = seed >>> 0;
	for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 73244475);
	return value >>> 0;
}
function localRoomFingerprint(file) {
	return `${file.name.normalize("NFKC").toLowerCase()}::${file.size}::${file.lastModified}`;
}
var twitchEmbedLoader;
function loadTwitchEmbed() {
	return twitchEmbedLoader ??= new Promise((resolve, reject) => {
		const ready = window.Twitch;
		if (ready?.Player) {
			resolve(ready);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://player.twitch.tv/js/embed/v1.js";
		script.async = true;
		script.onload = () => {
			const api = window.Twitch;
			if (api?.Player) resolve(api);
			else reject(/* @__PURE__ */ new Error("Twitch player API unavailable"));
		};
		script.onerror = () => reject(/* @__PURE__ */ new Error("Twitch player script failed to load"));
		document.head.append(script);
	});
}
var TOPIC_TAXONOMY = /* @__PURE__ */ new Set([
	"gaming",
	"technology",
	"news-commentary",
	"music",
	"film",
	"anime",
	"food",
	"travel",
	"fitness",
	"learning",
	"comedy",
	"relaxing",
	"talk",
	"commentary",
	"creative",
	"nature",
	"business",
	"style",
	"motors",
	"horror",
	"maker",
	"sports",
	"science",
	"relationships",
	"wellbeing",
	"skills",
	"hardware",
	"legal"
]);
var TOPIC_GENRE_MAP = {
	anime: ["Animation", "Fantasy"],
	comedy: ["Comedy"],
	creative: ["Animation", "Fantasy"],
	film: [
		"Documentary",
		"Drama",
		"Sci-Fi",
		"Science Fiction",
		"Thriller"
	],
	gaming: ["Action", "Adventure"],
	horror: ["Horror", "Thriller"],
	maker: ["Documentary", "Science Fiction"],
	learning: ["Documentary"],
	music: ["Documentary"],
	motors: ["Action", "Documentary"],
	nature: ["Documentary", "Adventure"],
	"news-commentary": ["Documentary"],
	relationships: ["Romance", "Drama"],
	relaxing: ["Nature", "Documentary"],
	science: ["Science Fiction", "Documentary"],
	skills: ["Documentary"],
	sports: ["Action", "Documentary"],
	style: ["Documentary"],
	technology: ["Documentary", "Science Fiction"],
	travel: ["Documentary", "Adventure"],
	wellbeing: ["Documentary"]
};
function isTopicTag(tag) {
	return TOPIC_TAXONOMY.has(tag.trim().toLowerCase());
}
function downloadCsv(rows, filename) {
	const quote = (value) => `"${String(value).replaceAll("\"", "\"\"")}"`;
	const body = rows.map((row) => row.map(quote).join(",")).join("\n");
	const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function GenreSection() {
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const folders = useLibrary((s) => s.folders);
	const [selected, setSelected] = (0, import_react.useState)("All topics");
	const [limit, setLimit] = (0, import_react.useState)(96);
	const [topicLimit, setTopicLimit] = (0, import_react.useState)(36);
	const catalog = (0, import_react.useMemo)(() => {
		const privateFolders = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
		const publicVideos = [];
		const genreCounts = /* @__PURE__ */ new Map();
		const liveCategoryCounts = /* @__PURE__ */ new Map();
		const tagCounts = /* @__PURE__ */ new Map();
		const tagSources = /* @__PURE__ */ new Map();
		const folderKinds = new Map(folders.map((folder) => [folder.id, folder.kind]));
		const mediaGenres = /* @__PURE__ */ new Set([
			"Action",
			"Adventure",
			"Animation",
			"Comedy",
			"Documentary",
			"Drama",
			"Fantasy",
			"Horror",
			"Romance",
			"Sci-Fi",
			"Science Fiction",
			"Thriller"
		]);
		for (const video of videos) {
			if (privateFolders.has(video.folderId)) continue;
			publicVideos.push(video);
			const genre = video.genre?.trim();
			if (genre && mediaGenres.has(genre)) genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
			if (genre && video.remote?.kind === "twitch" && video.remote.live) liveCategoryCounts.set(genre, (liveCategoryCounts.get(genre) ?? 0) + 1);
			const directTopics = new Set((tags[video.id] ?? []).map((tag) => tag.trim().toLowerCase()).filter(isTopicTag));
			for (const [topic, linkedGenres] of Object.entries(TOPIC_GENRE_MAP)) if (genre && linkedGenres.includes(genre)) directTopics.add(topic);
			for (const clean of directTopics) {
				tagCounts.set(clean, (tagCounts.get(clean) ?? 0) + 1);
				const sources = tagSources.get(clean) ?? /* @__PURE__ */ new Set();
				sources.add(video.remote?.kind ?? (folderKinds.get(video.folderId) === "directory" || folderKinds.get(video.folderId) === "files" ? "local" : "library"));
				tagSources.set(clean, sources);
			}
		}
		return {
			publicVideos,
			genres: [...genreCounts.entries()].sort((a, b) => a[0].localeCompare(b[0])),
			liveCategories: [...liveCategoryCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 18),
			tags: [...tagCounts.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
			bridges: [...tagSources.entries()].filter(([tag, sources]) => (tagCounts.get(tag) ?? 0) >= 2 && sources.size >= 2).sort((a, b) => (tagCounts.get(b[0]) ?? 0) - (tagCounts.get(a[0]) ?? 0)).slice(0, 18).map(([tag, sources]) => ({
				tag,
				sources: [...sources],
				count: tagCounts.get(tag) ?? 0
			}))
		};
	}, [
		folders,
		tags,
		videos
	]);
	const genreNames = (0, import_react.useMemo)(() => new Set(catalog.genres.map(([genre]) => genre)), [catalog.genres]);
	const matching = (0, import_react.useMemo)(() => selected === "All topics" ? catalog.publicVideos : genreNames.has(selected) || catalog.liveCategories.some(([category]) => category === selected) ? catalog.publicVideos.filter((video) => video.genre === selected) : catalog.publicVideos.filter((video) => (tags[video.id] ?? []).includes(selected) || (TOPIC_GENRE_MAP[selected] ?? []).includes(video.genre ?? "")), [
		catalog.liveCategories,
		catalog.publicVideos,
		genreNames,
		selected,
		tags
	]);
	(0, import_react.useEffect)(() => setLimit(96), [selected]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Topic explorer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Explore ideas, not noisy labels.",
		copy: "Topics connect local media, YouTube, and Twitch. Media genres stay separate, while Twitch game names remain live categories instead of pretending to be genres.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: ["Topics · ", catalog.tags.length]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: selected === "All topics" ? "default" : "secondary",
							onClick: () => setSelected("All topics"),
							children: ["All titles · ", catalog.publicVideos.length]
						}), catalog.tags.slice(0, topicLimit).map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: selected === tag ? "default" : "secondary",
							onClick: () => setSelected(tag),
							children: [
								"#",
								tag,
								" · ",
								count
							]
						}, tag))]
					}),
					catalog.tags.length > topicLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-3",
						size: "sm",
						variant: "secondary",
						onClick: () => setTopicLimit((limit) => Math.min(catalog.tags.length, limit + 18)),
						children: [
							"Show more topics · ",
							catalog.tags.length - topicLimit,
							" remaining"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Topic bridges across local, YouTube & Twitch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: catalog.bridges.map((bridge) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: selected === bridge.tag ? "default" : "secondary",
							onClick: () => setSelected(bridge.tag),
							children: [
								"#",
								bridge.tag,
								" · ",
								bridge.count,
								" · ",
								bridge.sources.join(" + ")
							]
						}, bridge.tag))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-5 text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: ["Media genres · ", catalog.genres.length]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: catalog.genres.map(([genre, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: selected === genre ? "default" : "secondary",
							onClick: () => setSelected(genre),
							children: [
								genre,
								" · ",
								count
							]
						}, genre))
					}),
					catalog.liveCategories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Twitch live categories"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: catalog.liveCategories.map(([category, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: selected === category ? "default" : "secondary",
							onClick: () => setSelected(category),
							children: [
								category,
								" · ",
								count
							]
						}, category))
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-sm text-muted",
				children: [
					matching.length.toLocaleString(),
					" title",
					matching.length === 1 ? "" : "s",
					" in this view."
				]
			}),
			matching.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
				children: matching.slice(0, limit).map((video, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
					video,
					variant: "poster",
					index
				}, video.id))
			}), matching.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				className: "mt-5",
				onClick: () => setLimit((value) => value + 96),
				children: [
					"Show 96 more · ",
					matching.length - limit,
					" remaining"
				]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-lg bg-elevated p-6 text-sm text-muted shadow-border",
				children: "No titles match this topic or category yet. Refresh a channel to populate it."
			})
		]
	});
}
function StatsSection() {
	const videos = useLibrary((s) => s.videos);
	const folders = useLibrary((s) => s.folders);
	const tags = useLibrary((s) => s.tags);
	const favorites = useLibrary((s) => s.favorites);
	const history = useLibrary((s) => s.history);
	const unavailable = useLibrary((s) => s.unavailable);
	const progress = useLibrary((s) => s.progress);
	const viewCounts = useLibrary((s) => s.viewCounts);
	const [showAllSources, setShowAllSources] = (0, import_react.useState)(false);
	const [remediationView, setRemediationView] = (0, import_react.useState)("");
	const summary = (0, import_react.useMemo)(() => {
		const byFolder = /* @__PURE__ */ new Map();
		const byGenre = /* @__PURE__ */ new Map();
		const byTag = /* @__PURE__ */ new Map();
		let totalBytes = 0;
		let localTitles = 0;
		let remoteTitles = 0;
		let untaggedTitles = 0;
		let freshRemoteTitles = 0;
		let thumbReady = 0;
		let youtubeTitles = 0;
		let twitchTitles = 0;
		let liveTitles = 0;
		let knownDuration = 0;
		let durationTitles = 0;
		let resumedTitles = 0;
		let totalViews = 0;
		let metadataTaggedTitles = 0;
		let creatorTaggedTitles = 0;
		let descriptionTaggedTitles = 0;
		let multiTopicTitles = 0;
		let operationalTagAssignments = 0;
		const topicSources = /* @__PURE__ */ new Map();
		for (const video of videos) {
			totalBytes += video.size;
			if (video.remote) remoteTitles += 1;
			else localTitles += 1;
			if (video.poster) thumbReady += 1;
			if (video.remote?.kind === "youtube") youtubeTitles += 1;
			if (video.remote?.kind === "twitch") twitchTitles += 1;
			if (video.remote?.live) liveTitles += 1;
			if ((video.duration ?? 0) > 0) {
				knownDuration += video.duration ?? 0;
				durationTitles += 1;
			}
			if (progress[video.id] && progress[video.id].t > 0) resumedTitles += 1;
			totalViews += viewCounts[video.id] ?? 0;
			const videoTags = tags[video.id] ?? [];
			const usefulTopics = new Set(videoTags.map((tag) => tag.trim().toLowerCase()).filter(isTopicTag));
			if (videoTags.length) metadataTaggedTitles += 1;
			if (Boolean(video.remote?.channelName?.trim())) creatorTaggedTitles += 1;
			if (videoTags.some((tag) => !tag.includes("-") && tag.length >= 4)) descriptionTaggedTitles += 1;
			if (!videoTags.some(isTopicTag)) untaggedTitles += 1;
			if (usefulTopics.size >= 2) multiTopicTitles += 1;
			if (video.remote && Date.now() - video.addedAt < 6048e5) freshRemoteTitles += 1;
			const folder = byFolder.get(video.folderId) ?? {
				videos: 0,
				bytes: 0
			};
			folder.videos += 1;
			folder.bytes += video.size;
			byFolder.set(video.folderId, folder);
			if (video.genre?.trim()) byGenre.set(video.genre, (byGenre.get(video.genre) ?? 0) + 1);
			for (const tag of videoTags) {
				const clean = tag.trim().toLowerCase();
				if (/^(?:year-|month-|day-|type-|provider-|format-|source-|keyword-|creator-|https?$)/.test(clean)) operationalTagAssignments += 1;
				if (isTopicTag(clean)) {
					byTag.set(clean, (byTag.get(clean) ?? 0) + 1);
					const sources = topicSources.get(clean) ?? /* @__PURE__ */ new Set();
					sources.add(video.remote?.kind ?? "local");
					topicSources.set(clean, sources);
				}
			}
		}
		const tagAssignments = [...byTag.values()].reduce((sum, count) => sum + count, 0);
		const bridgeTopics = [...topicSources.values()].filter((sources) => sources.size >= 2).length;
		return {
			totalBytes,
			byFolder,
			localTitles,
			remoteTitles,
			untaggedTitles,
			metadataTaggedTitles,
			creatorTaggedTitles,
			descriptionTaggedTitles,
			multiTopicTitles,
			operationalTagAssignments,
			bridgeTopics,
			freshRemoteTitles,
			thumbReady,
			youtubeTitles,
			twitchTitles,
			liveTitles,
			knownDuration,
			durationTitles,
			resumedTitles,
			totalViews,
			genreRows: [...byGenre.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
			topTags: [...byTag.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 14),
			tagAssignments,
			tagDensity: tagAssignments / Math.max(videos.length, 1),
			remoteShare: remoteTitles / Math.max(videos.length, 1)
		};
	}, [
		progress,
		tags,
		videos,
		viewCounts
	]);
	const folderRows = (0, import_react.useMemo)(() => folders.filter((folder) => folder.kind !== "demo").map((folder) => ({
		folder,
		...summary.byFolder.get(folder.id) ?? {
			videos: 0,
			bytes: 0
		}
	})).sort((a, b) => b.bytes - a.bytes || b.videos - a.videos || a.folder.name.localeCompare(b.folder.name)), [folders, summary.byFolder]);
	const favoriteHealth = (0, import_react.useMemo)(() => {
		const videoIds = new Set(videos.map((video) => video.id));
		const saved = Object.keys(favorites);
		return {
			saved: saved.length,
			resolved: saved.filter((id) => videoIds.has(id)).length,
			missing: saved.filter((id) => !videoIds.has(id)).length
		};
	}, [favorites, videos]);
	const sourceHealth = (0, import_react.useMemo)(() => {
		const names = /* @__PURE__ */ new Map();
		for (const { folder } of folderRows) names.set(folder.name.trim().toLowerCase(), (names.get(folder.name.trim().toLowerCase()) ?? 0) + 1);
		const duplicateNames = [...names.entries()].filter(([, count]) => count > 1).map(([name, count]) => ({
			name,
			count
		}));
		const largest = folderRows[0];
		return {
			duplicateNames,
			largest,
			concentration: largest ? Math.round(largest.bytes / Math.max(summary.totalBytes, 1) * 100) : 0
		};
	}, [folderRows, summary.totalBytes]);
	const visibleFolderRows = showAllSources ? folderRows : folderRows.slice(0, 80);
	const exportStats = () => {
		const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const feedback = exportFeedback();
		downloadCsv([
			["metric", "value"],
			["catalog_titles", videos.length],
			["topic_tags_per_title", summary.tagDensity.toFixed(3)],
			["remote_catalog_percent", Math.round(summary.remoteShare * 100)],
			["local_storage_bytes_per_local_title", Math.round(summary.totalBytes / Math.max(summary.localTitles, 1))],
			["local_storage_bytes", summary.totalBytes],
			["topic_tag_assignments", summary.tagAssignments],
			["favorites", Object.keys(favorites).length],
			["local_titles", summary.localTitles],
			["remote_titles", summary.remoteTitles],
			["untagged_titles", summary.untaggedTitles],
			["fresh_remote_titles_7d", summary.freshRemoteTitles],
			["youtube_titles", summary.youtubeTitles],
			["twitch_titles", summary.twitchTitles],
			["live_titles", summary.liveTitles],
			["poster_ready_titles", summary.thumbReady],
			["unavailable_titles", Object.keys(unavailable).length],
			["history_events", history.length],
			["topic_tag_coverage_percent", Math.round((1 - summary.untaggedTitles / Math.max(videos.length, 1)) * 100)],
			["largest_source_percent", sourceHealth.concentration],
			["duplicate_source_names", sourceHealth.duplicateNames.length],
			["metadata_tagged_titles", summary.metadataTaggedTitles],
			["metadata_tag_coverage_percent", Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)],
			["creator_tagged_titles", summary.creatorTaggedTitles],
			["description_keyword_tagged_titles", summary.descriptionTaggedTitles],
			["multi_topic_titles", summary.multiTopicTitles],
			["cross_source_bridge_topics", summary.bridgeTopics],
			["operational_tag_assignments", summary.operationalTagAssignments],
			["useful_topic_share_percent", Math.round((1 - summary.untaggedTitles / Math.max(videos.length, 1)) * 100)],
			["favorites_saved", favoriteHealth.saved],
			["favorites_resolved", favoriteHealth.resolved],
			["favorites_waiting_for_source", favoriteHealth.missing],
			["video_ratings_saved", Object.keys(feedback.ratings).length],
			["creator_ratings_saved", Object.keys(feedback.creatorRatings).length],
			["creator_likes_saved", Object.keys(feedback.creatorLikes).length],
			["notes_saved", Object.keys(feedback.notes).length],
			["known_duration_titles", summary.durationTitles],
			["known_duration_hours", Math.round(summary.knownDuration / 3600)],
			["resume_marks", summary.resumedTitles],
			["local_view_events", summary.totalViews],
			...summary.genreRows.map(([name, count]) => [`genre:${name}`, count]),
			...summary.topTags.map(([name, count]) => [`topic_tag:${name}`, count]),
			...sourceHealth.duplicateNames.map(({ name, count }) => [`duplicate_source:${name}`, count])
		], `reelcase-library-insights-${stamp}.csv`);
	};
	const exportSources = () => downloadCsv([[
		"source",
		"kind",
		"mapped_titles",
		"local_storage_bytes",
		"last_checked"
	], ...folderRows.map(({ folder, videos: mapped, bytes: mappedBytes }) => [
		folder.name,
		folder.kind,
		mapped,
		mappedBytes,
		folder.lastCheckedAt ? new Date(folder.lastCheckedAt).toISOString() : ""
	])], `reelcase-source-map-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	const exportRemediation = () => downloadCsv([
		[
			"queue",
			"priority",
			"title_or_source",
			"reason",
			"suggested_safe_action"
		],
		...videos.filter((video) => !(tags[video.id] ?? []).some(isTopicTag)).slice(0, 500).map((video, index) => [
			"topic-coverage",
			index + 1,
			video.name,
			"No useful topic tag",
			"Review in preview or apply explainable smart tags"
		]),
		...sourceHealth.duplicateNames.flatMap(({ name, count }) => [[
			"source-hygiene",
			1,
			name,
			`${count} identical source labels`,
			"Open source map and rename only after review"
		]]),
		...sourceHealth.largest ? [[
			"storage-concentration",
			1,
			sourceHealth.largest.folder.name,
			`${sourceHealth.concentration}% of mapped local bytes`,
			"Review source contents; no files are changed automatically"
		]] : []
	], `reelcase-remediation-plan-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Library intelligence",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }),
		title: "Know what your library needs next.",
		copy: "These local-only counts help identify coverage gaps, oversized source folders, and the tags that are driving discovery.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportStats,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download insight CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportSources,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download source-map CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportRemediation,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download remediation CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "self-center text-xs text-muted",
						children: "Exports only local catalog metadata, useful for improving sorting and discovery rules."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Catalog titles",
						value: videos.length.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local storage mapped",
						value: bytes(summary.totalBytes)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Topic-tag assignments",
						value: summary.tagAssignments.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Favorites",
						value: Object.keys(favorites).length.toLocaleString()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local / remote",
						value: `${summary.localTitles.toLocaleString()} / ${summary.remoteTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Remote catalog share",
						value: `${Math.round(summary.remoteShare * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "New provider items · 7d",
						value: summary.freshRemoteTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Needs useful topic",
						value: `${summary.untaggedTitles.toLocaleString()} titles`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Topic coverage",
						value: `${Math.round((1 - summary.untaggedTitles / Math.max(videos.length, 1)) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Topic tags per title",
						value: summary.tagDensity.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cross-source topic bridges",
						value: summary.bridgeTopics.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Multi-topic titles",
						value: summary.multiTopicTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Operational labels",
						value: summary.operationalTagAssignments.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Any metadata coverage",
						value: `${Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Creator / description tags",
						value: `${summary.creatorTaggedTitles.toLocaleString()} / ${summary.descriptionTaggedTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "YouTube / Twitch",
						value: `${summary.youtubeTitles.toLocaleString()} / ${summary.twitchTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Known runtime",
						value: `${Math.round(summary.knownDuration / 3600).toLocaleString()} hours`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Resume marks",
						value: summary.resumedTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local view events",
						value: summary.totalViews.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Live right now",
						value: summary.liveTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Artwork coverage",
						value: `${Math.round(summary.thumbReady / Math.max(videos.length, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "History events",
						value: history.length.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Unavailable cards",
						value: Object.keys(unavailable).length.toLocaleString()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-5 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-72 rounded-lg bg-elevated p-5 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Provider mix"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "85%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: [
								{
									name: "Local",
									titles: summary.localTitles
								},
								{
									name: "YouTube",
									titles: summary.youtubeTitles
								},
								{
									name: "Twitch",
									titles: summary.twitchTitles
								}
							],
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									stroke: "currentColor",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "currentColor",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "titles",
									fill: "var(--color-accent)",
									radius: 4
								})
							]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-72 rounded-lg bg-elevated p-5 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Most useful topics"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "85%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							layout: "vertical",
							margin: { left: 16 },
							data: summary.topTags.slice(0, 8).map(([name, titles]) => ({
								name,
								titles
							})),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									stroke: "currentColor",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									type: "category",
									dataKey: "name",
									width: 150,
									stroke: "currentColor",
									fontSize: 10
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "titles",
									fill: "var(--color-accent)",
									radius: 4
								})
							]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Tagging backlog"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: summary.untaggedTitles.toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "titles still need a useful topic tag. Prioritize these before adding more discovery rules."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "topics" ? "" : "topics"),
								children: "Review safe queue"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Storage concentration"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: [sourceHealth.concentration, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									"of mapped local bytes sit in ",
									sourceHealth.largest?.folder.name ?? "the largest source",
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "sources" ? "" : "sources"),
								children: "Review source queue"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Source hygiene"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: sourceHealth.duplicateNames.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "duplicate source labels can make refresh results harder to interpret."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "sources" ? "" : "sources"),
								children: "Review duplicates"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Favorite recovery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: [
									favoriteHealth.resolved,
									" / ",
									favoriteHealth.saved
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: favoriteHealth.missing ? `${favoriteHealth.missing} saved favorites are waiting for their source to return.` : "Every saved favorite resolves in the current catalog."
							})
						]
					})
				]
			}),
			remediationView === "topics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Safe tag review queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "These are review candidates only—nothing is tagged or deleted by opening this queue."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => useLibrary.getState().setSource("settings"),
						children: "Open smart-tag tools"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-2",
					children: videos.filter((video) => !(tags[video.id] ?? []).some(isTopicTag)).slice(0, 12).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg",
						onClick: () => useLibrary.getState().openPreview(video.id),
						children: [video.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs text-muted",
							children: "· no useful topic yet"
						})]
					}, video.id))
				})]
			}),
			remediationView === "sources" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Safe source review queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Review signals only. Reelcase will not rename, reconnect, or remove a folder from this page."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [sourceHealth.largest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg",
							onClick: () => useLibrary.getState().setSource(sourceHealth.largest.folder.id),
							children: [
								"Largest source · ",
								sourceHealth.largest.folder.name,
								" · ",
								bytes(sourceHealth.largest.bytes)
							]
						}), sourceHealth.duplicateNames.map(({ name, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-sm bg-bg/45 px-3 py-2 text-sm text-fg",
							children: [
								"Duplicate label · ",
								name,
								" · ",
								count,
								" sources"
							]
						}, name))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-5 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-elevated p-5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Genre distribution"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Bars compare genres with the most common genre in this list."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3",
							children: summary.genreRows.slice(0, 18).map(([genre, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributionRow, {
								label: genre,
								value: count,
								total: summary.genreRows[0]?.[1] ?? 1
							}, genre)) || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Genres will appear as media is tagged."
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-elevated p-5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Most useful tags"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Bars compare useful topics with the leading topic, not the full catalog."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3",
							children: summary.topTags.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributionRow, {
								label: `#${tag}`,
								value: count,
								total: summary.topTags[0]?.[1] ?? 1
							}, tag)) || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Tags will appear as media is indexed."
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Source mapping & storage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Only local files contribute bytes; remote providers report catalog counts but not source storage."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: visibleFolderRows.map(({ folder, videos: mapped, bytes: folderBytes }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 truncate text-sm text-fg",
								children: folder.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									mapped.toLocaleString(),
									" mapped · ",
									folderBytes ? bytes(folderBytes) : folder.kind === "youtube" || folder.kind === "twitch" ? "remote catalog" : "no local media yet"
								]
							})]
						}, folder.id))
					}),
					folderRows.length > visibleFolderRows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						size: "sm",
						className: "mt-4",
						onClick: () => setShowAllSources(true),
						children: [
							"Show all ",
							folderRows.length.toLocaleString(),
							" sources"
						]
					})
				]
			})
		]
	});
}
function LanConnectionSection() {
	const [origin, setOrigin] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [companion, setCompanion] = (0, import_react.useState)("checking");
	(0, import_react.useEffect)(() => {
		const current = window.location;
		const loopback = current.hostname === "localhost" || current.hostname === "127.0.0.1" || current.hostname === "::1";
		setOrigin(loopback ? "" : current.origin);
		fetch("http://127.0.0.1:43123/health").then((response) => setCompanion(response.ok ? "ready" : "offline")).catch(() => setCompanion("offline"));
	}, []);
	const copyAddress = async () => {
		if (!origin) return;
		try {
			await navigator.clipboard.writeText(origin);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Home network",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }),
		title: "Connect another screen, clearly.",
		copy: "Use this page before Watch Room. It separates reaching Reelcase from joining a synchronized room, so connection problems have an obvious next step.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "Shareable Reelcase address"
				}), origin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 break-all font-mono text-sm text-fg",
						children: origin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => void copyAddress(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Address copied" : "Copy address"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => useLibrary.getState().setSource("watch-room"),
							children: "Open Watch Room"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs leading-5 text-muted",
						children: "On the other computer or phone, connect to the same home Wi‑Fi, open this address, then use the Watch Room invitation or room code."
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fg",
						children: "This computer is using a local-only address."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "It cannot be opened from another device, so Reelcase will not recommend it. Open Reelcase from its shared site address, or use the Companion’s LAN host option when it is available; then return here to copy that address."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-4",
						onClick: () => useLibrary.getState().setSource("watch-room"),
						children: "Open Watch Room on this device"
					})
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Local companion"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl text-fg",
						children: companion === "ready" ? "Ready on this computer" : companion === "checking" ? "Checking…" : "Not detected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "The companion accelerates local folders only on the computer where it is running. It does not expose your files to other devices and it cannot bypass X’s public access limits."
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "Ethernet and Wi‑Fi connection check"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-4 grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-fg",
									children: "1. Use the host’s shared address."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"This computer may be wired by Ethernet while the guest uses Wi‑Fi; that is expected when both connect through the same home router."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-fg",
									children: "2. Avoid guest Wi‑Fi."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Guest/isolated Wi‑Fi blocks device-to-device traffic. Move the guest to the normal home network, then open the copied address."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-fg",
									children: "3. Confirm Reelcase opens first."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"The guest must see this library before joining the room. If it cannot load, use the Companion LAN host option or a shared Reelcase site address; a local-only address cannot be reached by another device."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-fg",
									children: "4. Join the same room code."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Open the invitation or enter the exact code, then use Room diagnostics. Roster confirms signaling; Direct confirms playback/chat transport."
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs leading-5 text-subtle",
					children: "Ethernet-to-Wi‑Fi is not the problem by itself. The likely blockers are a local-only address, guest-network isolation, a router client-isolation setting, or a firewall rule on the host computer."
				})
			]
		})]
	});
}
function FindPhoneSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "Device recovery",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
		title: "Find your phone.",
		copy: "Open your device maker’s official locator. Reelcase does not collect location data or keep a copy of your account credentials.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.google.com/android/find/",
				target: "_blank",
				rel: "noopener noreferrer",
				className: "rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Android"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Find My Device"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open Google’s official Android device locator in a secure new tab."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.icloud.com/find/",
				target: "_blank",
				rel: "noopener noreferrer",
				className: "rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "iPhone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Find My"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open Apple’s official device locator in a secure new tab."
					})
				]
			})]
		})
	});
}
function DistributionRow({ label, value, total }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate text-fg",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: value
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 h-2 overflow-hidden rounded-full bg-bg/70",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full bg-accent",
			style: { width: `${Math.max(3, Math.round(value / Math.max(total, 1) * 100))}%` }
		})
	})] });
}
function SettingsSection() {
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	const [preferences, setPreferences] = (0, import_react.useState)({});
	const [preferenceGroup, setPreferenceGroup] = (0, import_react.useState)("Playback");
	const [zoom, setZoom] = (0, import_react.useState)(100);
	const [railLimit, setRailLimit] = (0, import_react.useState)(8);
	const [gridPageSize, setGridPageSize] = (0, import_react.useState)(48);
	const [thumbnailWorkers, setThumbnailWorkers] = (0, import_react.useState)(0);
	const [photoWorkers, setPhotoWorkers] = (0, import_react.useState)(0);
	const [defaultVolume, setDefaultVolume] = (0, import_react.useState)(85);
	const [startMuted, setStartMuted] = (0, import_react.useState)(false);
	const [videoVisionBusy, setVideoVisionBusy] = (0, import_react.useState)(false);
	const [videoVisionNote, setVideoVisionNote] = (0, import_react.useState)("");
	const [twitchRefreshSeconds, setTwitchRefreshSeconds] = (0, import_react.useState)(60);
	const [liveDensity, setLiveDensity] = (0, import_react.useState)(4);
	const [sourceCacheFirst, setSourceCacheFirst] = (0, import_react.useState)(true);
	const [debugEnabled, setDebugEnabled] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)("night");
	const [debugReport, setDebugReport] = (0, import_react.useState)("");
	const refreshFollows = useLibrary((s) => s.refreshFollows);
	const folders = useLibrary((s) => s.folders);
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
	const unavailableVideoCount = useLibrary((s) => Object.keys(s.unavailable).length);
	const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
	const smartTagStatus = (0, import_react.useMemo)(() => {
		const local = videos.filter((video) => !video.remote);
		const tagged = local.filter((video) => (tags[video.id] ?? []).some((tag) => /^(?:year-|month-|type-|source-)/.test(tag))).length;
		return {
			local: local.length,
			tagged,
			waiting: Math.max(0, local.length - tagged)
		};
	}, [tags, videos]);
	const [serviceNote, setServiceNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setHub(readHub()), []);
	(0, import_react.useEffect)(() => {
		try {
			const next = {
				"alerts-go-live-alerts": true,
				"alerts-new-twitch-vod-alerts": true,
				"alerts-new-youtube-upload-alerts": true,
				"playback-autoplay-next-video": true,
				...JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}")
			};
			setPreferences(next);
			localStorage.setItem("reelcase.settings.v1", JSON.stringify(next));
		} catch {
			setPreferences({});
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.ui-zoom") ?? "100");
		const value = [
			80,
			90,
			100,
			110,
			125
		].includes(saved) ? saved : 100;
		setZoom(value);
		document.documentElement.style.fontSize = `${value}%`;
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.home-rail-limit") ?? "8");
		setRailLimit([
			8,
			16,
			32,
			48
		].includes(saved) ? saved : 8);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.grid-page-size") ?? "48");
		setGridPageSize([
			24,
			48,
			96,
			144
		].includes(saved) ? saved : 48);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0");
		setThumbnailWorkers([
			2,
			3,
			4
		].includes(saved) ? saved : 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0");
		setPhotoWorkers([
			2,
			4,
			6,
			8,
			12
		].includes(saved) ? saved : 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.player-volume") ?? "85");
		setDefaultVolume([
			25,
			50,
			70,
			85,
			100
		].includes(saved) ? saved : 85);
		setStartMuted(localStorage.getItem("reelcase.player-start-muted") === "true");
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "60");
		setTwitchRefreshSeconds([
			15,
			30,
			60,
			120,
			300
		].includes(saved) ? saved : 60);
	}, []);
	(0, import_react.useEffect)(() => setSourceCacheFirst(localStorage.getItem("reelcase.source-cache-first") !== "false"), []);
	(0, import_react.useEffect)(() => {
		try {
			setDebugEnabled(localStorage.getItem("reelcase.debug-panel") === "true");
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			const saved = localStorage.getItem("reelcase.theme") === "day" ? "day" : "night";
			setTheme(saved);
			document.documentElement.dataset.theme = saved;
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => setLiveDensity([
		3,
		4,
		6
	].includes(Number(localStorage.getItem("reelcase.live-columns") ?? "4")) ? Number(localStorage.getItem("reelcase.live-columns")) : 4), []);
	const setGlobalZoom = (value) => {
		setZoom(value);
		localStorage.setItem("reelcase.ui-zoom", String(value));
		document.documentElement.style.fontSize = `${value}%`;
	};
	const setColorTheme = (value) => {
		setTheme(value);
		localStorage.setItem("reelcase.theme", value);
		document.documentElement.dataset.theme = value;
	};
	const togglePreference = (key) => {
		const enabled = !preferences[key];
		const next = {
			...preferences,
			[key]: enabled
		};
		setPreferences(next);
		localStorage.setItem("reelcase.settings.v1", JSON.stringify(next));
		if (key === "privacy-reduce-motion") document.documentElement.toggleAttribute("data-reduce-motion", enabled);
		if (key === "privacy-hide-demo-media") useLibrary.getState().setHideDemo(enabled);
		if (key === "alerts-desktop-notifications" && enabled) {
			if (!("Notification" in window)) {
				setServiceNote("This browser does not support desktop notifications.");
				return;
			}
			Notification.requestPermission().then((permission) => {
				if (permission !== "granted") {
					setPreferences((current) => ({
						...current,
						[key]: false
					}));
					localStorage.setItem("reelcase.settings.v1", JSON.stringify({
						...next,
						[key]: false
					}));
					setServiceNote("Desktop notifications were not granted. In-app alerts remain available.");
				} else {
					useLibrary.getState().setNotifyPush(true);
					setServiceNote("Desktop notifications are enabled for the alerts you keep switched on.");
				}
			});
		}
	};
	const exportLocal = () => {
		const state = useLibrary.getState();
		const payload = {
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			note: "Reelcase library metadata only. Original local files and browser permission handles are never exported.",
			library: {
				folders: state.folders,
				videos: state.videos,
				favorites: Object.keys(state.favorites),
				likes: Object.keys(state.likes),
				tags: state.tags,
				categories: state.categories,
				progress: state.progress,
				history: state.history,
				feedback: exportFeedback(),
				follows: state.follows,
				notices: state.notices,
				sourceCompanions: {
					photoNames: useSourceAssets.getState().photos.map((asset) => asset.path),
					shortcutNames: useSourceAssets.getState().shortcuts.map((file) => file.name)
				}
			},
			hub
		};
		const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = `reelcase-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};
	const tagLocalVideoFrames = async () => {
		const candidates = videos.filter((video) => !video.remote && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).slice(0, 12);
		if (!candidates.length) {
			setVideoVisionNote("No eligible local video frames are ready. Open a few local cards first so their cached frame artwork can warm.");
			return;
		}
		setVideoVisionBusy(true);
		setVideoVisionNote(`Warming local video frames · 0/${candidates.length}`);
		for (const video of candidates) useThumbs.getState().request(video);
		await new Promise((resolve) => window.setTimeout(resolve, 1200));
		const thumbs = useThumbs.getState().byId;
		const ready = candidates.filter((video) => Boolean(thumbs[video.id]));
		if (!ready.length) {
			setVideoVisionBusy(false);
			setVideoVisionNote("Frames are still warming. Try again in a moment; this beta never uploads local video.");
			return;
		}
		try {
			const labels = await classifyImagesLocally(ready.map((video) => thumbs[video.id]), (done, total) => setVideoVisionNote(`Classifying local video frames · ${done}/${total}`));
			ready.forEach((video, index) => setVideoTags(video.id, [...useLibrary.getState().tags[video.id] ?? [], ...labels[index].map((label) => `vision-${label}`)]));
			setVideoVisionNote(`Tagged ${ready.length} local video frame${ready.length === 1 ? "" : "s"}. Review vision-* tags before using them as a permanent organizer.`);
		} catch {
			setVideoVisionNote("The local vision model could not start. File data stayed on this device; filename tags are still available.");
		} finally {
			setVideoVisionBusy(false);
		}
	};
	const downloadExport = (body, filename, type) => {
		const url = URL.createObjectURL(new Blob([body], { type }));
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	};
	const exportChannels = () => {
		const follows = useLibrary.getState().follows.map((channel) => ({
			service: channel.kind,
			channel: channel.title,
			handle: channel.handle,
			channelId: channel.channelId ?? "",
			live: Boolean(channel.live)
		}));
		downloadExport(JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			channels: follows
		}, null, 2), `reelcase-channels-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, "application/json");
	};
	const exportCatalogCsv = () => {
		const state = useLibrary.getState();
		const quote = (value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
		const rows = [[
			"title",
			"source",
			"format",
			"tags",
			"category",
			"favorite",
			"added"
		], ...state.videos.map((video) => [
			video.name,
			state.folders.find((folder) => folder.id === video.folderId)?.name ?? video.remote?.channelName ?? "",
			video.extension,
			(state.tags[video.id] ?? []).join(" | "),
			state.categories[video.id] ?? "",
			Boolean(state.favorites[video.id]),
			new Date(video.addedAt).toISOString()
		])];
		downloadExport(rows.map((row) => row.map(quote).join(",")).join("\n"), `reelcase-catalog-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, "text/csv");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Library control",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" }),
		title: "Settings & local export",
		copy: "Your Reelcase library stays in this browser. Export a portable metadata backup whenever you need it.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Video entries",
						value: useLibrary((s) => s.videos.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Followed channels",
						value: useLibrary((s) => s.follows.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved hub items",
						value: hub.prints.length + hub.games.length
					})
				]
			}),
			unavailableVideoCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-danger/40 bg-elevated p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-medium text-fg",
					children: [
						"Playback health queue · ",
						unavailableVideoCount,
						" hidden"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "These catalog entries were hidden after a browser file-permission or decode failure. Reconnect the source folder from the playback message to rebuild its live file handles."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Smart local tags"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Tag by name, date, and file type."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: "Adds private, explainable tags such as year-2026, month-september, type-mp4, and meaningful words from the filename. Existing manual tags are preserved; nothing is uploaded."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-accent",
						children: [
							smartTagStatus.tagged.toLocaleString(),
							" of ",
							smartTagStatus.local.toLocaleString(),
							" local files ready · ",
							smartTagStatus.waiting ? `${smartTagStatus.waiting.toLocaleString()} can still be enriched` : "coverage is current"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4",
						size: "sm",
						variant: "secondary",
						disabled: !smartTagStatus.local,
						onClick: () => {
							const changed = useLibrary.getState().autoTagLibrary();
							setServiceNote(changed ? `Smart-tag run finished · ${changed} catalog item${changed === 1 ? "" : "s"} updated.` : "Smart tags are already current for every loaded catalog item.");
						},
						children: [" ", smartTagStatus.waiting ? "Apply smart tags to remaining files" : "Recheck smart-tag coverage"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Beta · local video vision"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Tag local videos from a cached frame."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: "Uses the same on-device image model as Photos on one cached local thumbnail per video. It runs only when you start it, uses a bounded 12-video batch, and keeps frames and labels on this device."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-accent",
						children: [
							videos.filter((video) => !video.remote && (tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).length.toLocaleString(),
							" processed · ",
							videos.filter((video) => !video.remote && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).length.toLocaleString(),
							" waiting · ready when local frame artwork is cached"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						size: "sm",
						variant: "secondary",
						disabled: videoVisionBusy || !videos.some((video) => !video.remote),
						onClick: () => void tagLocalVideoFrames(),
						children: videoVisionBusy ? videoVisionNote || "Preparing local frames…" : "Prepare and tag next 12 local videos"
					}),
					videoVisionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-accent",
						children: ["Latest output · ", videoVisionNote]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-4 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-fg",
					children: "Export local metadata"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Downloads your catalog, favorites, likes, tags, watch history, follows, notifications, print list, and game list. Your original media and any browser file permissions remain private on this device."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: exportLocal,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Full backup"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: exportCatalogCsv,
							children: "Catalog CSV"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: exportChannels,
							children: "YouTube + Twitch"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Connected services"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Independent caches, on your schedule."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Twitch and YouTube refresh together from your saved follows. Photo imports, Roku discovery, and Spotify remain independently local and refresh only when you ask."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5",
						children: [
							{
								name: "YouTube",
								detail: "Saved channels",
								checked: remoteCheckedAt,
								action: async () => {
									const result = await refreshFollows();
									setServiceNote(`Refreshed channel cache · ${result.newVideos.length} new items.`);
								}
							},
							{
								name: "Twitch",
								detail: "Live + VOD cache",
								checked: remoteCheckedAt,
								action: async () => {
									const result = await refreshFollows();
									setServiceNote(`Refreshed Twitch status · ${result.wentLive.length} channels live.`);
								}
							},
							{
								name: "Photos",
								detail: `${folders.filter((folder) => folder.photoCount).length} source folders`,
								checked: Math.max(0, ...folders.map((folder) => folder.lastCheckedAt ?? 0)),
								action: async () => {
									const sources = folders.filter((folder) => folder.photoCount && (folder.kind === "directory" || folder.kind === "files"));
									const counts = await Promise.all(sources.map((folder) => refreshSourcePhotos(folder.id)));
									setServiceNote(`Refreshed local photo sources · ${counts.reduce((sum, count) => sum + count, 0)} photos found.`);
								}
							},
							{
								name: "Roku",
								detail: "Companion-assisted",
								checked: 0,
								action: async () => {
									try {
										const data = await (await fetch("http://127.0.0.1:43123/roku/discover")).json();
										setServiceNote(`Roku refresh complete · ${(data.devices ?? []).length} device(s) found.`);
									} catch {
										setServiceNote("Roku refresh needs the local Reelcase Companion running.");
									}
								}
							},
							{
								name: "Spotify",
								detail: "Saved music shortcuts",
								checked: 0,
								action: async () => {
									setServiceNote("Spotify shortcuts are local and ready. Open Spotify from its library section to refresh provider content.");
								}
							}
						].map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-bg/45 p-3 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: service.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: service.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-subtle",
									children: service.checked ? `Last refreshed ${new Date(service.checked).toLocaleTimeString([], {
										hour: "numeric",
										minute: "2-digit"
									})}` : "Not refreshed this session"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "mt-3",
									onClick: () => void service.action(),
									children: "Refresh"
								})
							]
						}, service.name))
					}),
					serviceNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-accent",
						children: serviceNote
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Device & performance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "The controls that change how Reelcase runs and fits your screen."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Diagnostics"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Keep a local, opt-in status panel for source, cache, and companion troubleshooting. It is off by default and sends nothing away."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
									className: "mt-3 space-y-1 text-xs leading-5 text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-accent",
												children: "1."
											}),
											" In the main Reelcase folder, double-click ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-fg",
												children: "Start-Reelcase-Companion.cmd"
											}),
											"."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-accent",
											children: "2."
										}), " Leave the small Companion window open until it says it is listening."] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-accent",
											children: "3."
										}), " Enable diagnostics, select Check companion, then open Games to load approved shortcuts."] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-5 text-subtle",
									children: "The companion is optional. It only runs on this computer and is needed for desktop shortcut launching, source checks, and TV discovery—not for browsing your media library."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: debugEnabled ? "default" : "secondary",
									className: "mt-4",
									onClick: () => {
										const next = !debugEnabled;
										setDebugEnabled(next);
										localStorage.setItem("reelcase.debug-panel", String(next));
										if (!next) setDebugReport("");
									},
									children: debugEnabled ? "Disable diagnostics" : "Enable diagnostics"
								}),
								debugEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											useLibrary.getState().videos.length,
											" catalog entries · ",
											useLibrary.getState().folders.length,
											" sources · ",
											navigator.onLine ? "browser online" : "browser offline"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											useLibrary.getState().folders.filter((folder) => folder.health === "healthy").length,
											" healthy · ",
											useLibrary.getState().folders.filter((folder) => folder.health === "cached").length,
											" cache-first · ",
											useLibrary.getState().folders.filter((folder) => folder.health === "permission-needed" || folder.health === "unavailable").length,
											" need attention"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "mt-2",
											onClick: () => void (async () => {
												try {
													const data = await (await fetch("http://127.0.0.1:43123/health")).json();
													setDebugReport(`Companion v${data.version ?? "?"} · ${data.roots ?? 0} approved roots · Desktop ${data.desktopEnabled ? "ready" : "not available"}`);
												} catch {
													setDebugReport("Companion is not running or is unavailable to this browser.");
												}
											})(),
											children: "Check companion"
										}),
										debugReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-accent",
											children: debugReport
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "App zoom"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Scale the entire library interface for this browser. Your choice is remembered everywhere in Reelcase."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										80,
										90,
										100,
										110,
										125
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: zoom === value ? "default" : "secondary",
										onClick: () => setGlobalZoom(value),
										children: [value, "%"]
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Day & night"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose the palette that is easiest on your eyes. It applies to every Reelcase page and stays on this device."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: theme === "night" ? "default" : "secondary",
										onClick: () => setColorTheme("night"),
										children: "Night mode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: theme === "day" ? "default" : "secondary",
										onClick: () => setColorTheme("day"),
										children: "Day mode"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Live layout"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose a larger card layout or fit more live channels on screen. This changes the Live page without adding heavier media loads."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										3,
										4,
										6
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: liveDensity === value ? "default" : "secondary",
										onClick: () => {
											setLiveDensity(value);
											localStorage.setItem("reelcase.live-columns", String(value));
										},
										children: value === 3 ? "Large · 3 columns" : `${value} columns`
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Home performance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose how many cards each Home rail mounts. Lower counts keep huge folders smooth; the complete catalog remains searchable."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										8,
										16,
										32,
										48
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: railLimit === value ? "default" : "secondary",
										onClick: () => {
											setRailLimit(value);
											localStorage.setItem("reelcase.home-rail-limit", String(value));
											window.dispatchEvent(new Event("reelcase:render-settings"));
										},
										children: [value, " per shelf"]
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: sourceCacheFirst ? "default" : "secondary",
									className: "mt-3",
									onClick: () => {
										const next = !sourceCacheFirst;
										setSourceCacheFirst(next);
										localStorage.setItem("reelcase.source-cache-first", String(next));
									},
									children: sourceCacheFirst ? "Use cached sources first" : "Rescan sources on launch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-subtle",
									children: "Cached source catalogs load immediately. Use a source refresh when you want to check the disk again."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Grid memory budget"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets how many poster cards are mounted at once before a Next page control. Use 24 for the smoothest experience with very large YouTube and Twitch libraries."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										24,
										48,
										96,
										144
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: gridPageSize === value ? "default" : "secondary",
										onClick: () => {
											setGridPageSize(value);
											localStorage.setItem("reelcase.grid-page-size", String(value));
											window.dispatchEvent(new Event("reelcase:render-settings"));
										},
										children: [value, " cards"]
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Artwork worker budget"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Controls concurrent local thumbnail extraction. Adaptive uses available CPU without crowding playback; Fast is best while Reelcase is otherwise idle."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[0, "Adaptive"],
										[2, "Gentle · 2"],
										[3, "Balanced · 3"],
										[4, "Fast · 4"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: thumbnailWorkers === value ? "default" : "secondary",
										onClick: () => {
											setThumbnailWorkers(value);
											localStorage.setItem("reelcase.thumbnail-workers", String(value));
										},
										children: label
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Photo scan workers"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets background folder workers for cached photo metadata. Adaptive protects browsing; use Fast when you want a newly added photo source ready sooner."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[0, "Adaptive"],
										[2, "Gentle · 2"],
										[4, "Balanced · 4"],
										[6, "Fast · 6"],
										[8, "Max · 8"],
										[12, "Turbo · 12"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: photoWorkers === value ? "default" : "secondary",
										onClick: () => {
											setPhotoWorkers(value);
											localStorage.setItem("reelcase.photo-scan-workers", String(value));
										},
										children: label
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Player sound"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets the starting volume for local video and whether a newly opened player starts muted. Provider embeds keep their own service-level audio controls."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										25,
										50,
										70,
										85,
										100
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: defaultVolume === value ? "default" : "secondary",
										onClick: () => {
											setDefaultVolume(value);
											localStorage.setItem("reelcase.player-volume", String(value));
										},
										children: [value, "%"]
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-3",
									size: "sm",
									variant: startMuted ? "default" : "secondary",
									onClick: () => {
										const next = !startMuted;
										setStartMuted(next);
										localStorage.setItem("reelcase.player-start-muted", String(next));
									},
									children: startMuted ? "Start muted" : "Start with sound"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Twitch live refresh"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Checks the next saved provider batch while this tab is visible. Faster checks give live viewer counts a shorter stale window; one minute is the balanced default."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[15, "15 sec"],
										[30, "30 sec"],
										[60, "1 min"],
										[120, "2 min"],
										[300, "5 min"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: twitchRefreshSeconds === value ? "default" : "secondary",
										onClick: () => {
											setTwitchRefreshSeconds(value);
											localStorage.setItem("reelcase.twitch-refresh-seconds", String(value));
											window.dispatchEvent(new Event("reelcase:refresh-settings"));
										},
										children: label
									}, value))
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Connections, privacy & guides"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Optional services and explanations stay separate from everyday library preferences."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-5" }),
							title: "Local edit workspace",
							copy: "The player has reliable native playback and metadata tools today. A non-destructive OpenShot-style timeline requires a dedicated browser media engine; keep it local-first and never upload media by default."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
							title: "AI recommendations, later",
							copy: "Your tags, likes, categories, history, and export file are the future recommendation signal. Add a server endpoint and explicit consent screen before any assistant can read it."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
							title: "AI tools directory",
							copy: "Prepare future connectors for recommendations, metadata cleanup, captioning, and watch-list suggestions. Keep every connection opt-in and scoped to only the library data you select."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" }),
							title: "Privacy defaults",
							copy: "Local cataloging, tags, ratings, and history stay on this device. Export is metadata-only; no source videos, print files, game files, or browser permissions are included."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" }),
							title: "How Reelcase works",
							copy: "Folders and files are cataloged locally; channel follows use their public pages; Watch Room sends direct peer events; and external services open only when you choose them. See PROJECT_GUIDE.md and LAN_WATCH_ROOM.md in the repository for the complete maintainer guide."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlexaLightControl, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleYouTubeConnection, {})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Working preferences"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Every switch below works now, changes Reelcase immediately, and is saved in this browser. Future ideas belong in the Mission plan—not in this control panel."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [Object.values(preferences).filter(Boolean).length, " enabled"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: Object.keys(PREFERENCE_GROUPS).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: preferenceGroup === group ? "default" : "secondary",
							onClick: () => setPreferenceGroup(group),
							children: [
								group,
								" · ",
								PREFERENCE_GROUPS[group].length
							]
						}, group))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: PREFERENCES.filter((item) => item.group === preferenceGroup).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !item.implemented,
							onClick: () => togglePreference(item.key),
							className: "flex min-h-16 items-center justify-between gap-4 rounded-md bg-bg/45 px-4 text-left shadow-border disabled:cursor-not-allowed disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium text-fg",
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: item.detail
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `flex h-6 w-11 items-center rounded-full p-0.5 transition-[background-color] duration-150 ${item.implemented && preferences[item.key] ? "bg-accent justify-end" : "bg-surface justify-start"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-5 rounded-full ${item.implemented && preferences[item.key] ? "bg-accent-fg" : "bg-muted"}` })
							})]
						}, item.key))
					})
				]
			})
		]
	});
}
function PrintsSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalCatalog, {
		kind: "prints",
		eyebrow: "Maker shelf",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-4" }),
		title: "3D prints",
		copy: "Keep a lightweight catalog of print-ready files. Add STL, OBJ, 3MF, or G-code files to track what is ready for the printer.",
		accept: ".stl,.obj,.3mf,.gcode",
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
function SpotifySection() {
	const [saved, setSaved] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return "";
		try {
			return localStorage.getItem("reelcase.spotify.playlist") ?? "";
		} catch {
			return "";
		}
	});
	const [playlistUrl, setPlaylistUrl] = (0, import_react.useState)(saved);
	const [imports, setImports] = (0, import_react.useState)(() => {
		try {
			const savedImports = JSON.parse(localStorage.getItem("reelcase.spotify.imports.v1") ?? "[]");
			return Array.isArray(savedImports) ? savedImports.filter((item) => typeof item === "string") : [];
		} catch {
			return [];
		}
	});
	const importSpotifyLink = () => {
		const value = playlistUrl.trim();
		if (!/^https:\/\/open\.spotify\.com\/(playlist|album|artist)\//i.test(value)) return;
		const next = [value, ...imports.filter((item) => item !== value)].slice(0, 50);
		setImports(next);
		setSaved(value);
		localStorage.setItem("reelcase.spotify.imports.v1", JSON.stringify(next));
		localStorage.setItem("reelcase.spotify.playlist", value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Music companion",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4" }),
		title: "Spotify, beside your library.",
		copy: "Keep music separate from video playback. Connect through Spotify’s official player or save a playlist link locally for your next listening session.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Open Spotify"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Account sign-in and playback remain on Spotify’s official site or app. Reelcase does not collect your Spotify password or tokens."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://open.spotify.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							children: ["Open Spotify ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Save a playlist shortcut"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: playlistUrl,
							onChange: (event) => setPlaylistUrl(event.target.value),
							placeholder: "https://open.spotify.com/playlist/...",
							"aria-label": "Spotify playlist link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !playlistUrl.includes("spotify.com"),
							onClick: importSpotifyLink,
							children: "Import link"
						})]
					}),
					saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "mt-3 inline-flex text-sm text-accent hover:text-fg",
						href: saved,
						target: "_blank",
						rel: "noreferrer",
						children: ["Open saved playlist ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-4" })]
					})
				]
			}),
			imports.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Imported Spotify shortcuts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Playlist, album, and artist links are stored locally for quick return. Spotify account data remains in Spotify."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: imports.slice(0, 12).map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: url,
							target: "_blank",
							rel: "noreferrer",
							className: "max-w-full truncate rounded-sm bg-bg/45 px-3 py-2 text-xs text-fg shadow-border",
							children: url.replace("https://open.spotify.com/", "Spotify · ")
						}, url))
					})
				]
			})
		]
	});
}
function AlexaLightControl() {
	const [scene, setScene] = (0, import_react.useState)("Movie night");
	const [saved, setSaved] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: "Alexa light scenes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Set a preferred scene locally, then ask Alexa to run that scene. Direct device control needs an authorized Alexa Smart Home skill, which is not connected here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					"Movie night",
					"Bright",
					"Warm",
					"Pause lights"
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: scene === item ? "default" : "secondary",
					onClick: () => setScene(item),
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "mt-3",
				onClick: () => {
					localStorage.setItem("reelcase.alexa.scene", scene);
					setSaved(true);
				},
				children: "Save preferred scene"
			}),
			saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-accent",
				children: [
					"Saved. Say “Alexa, ",
					scene,
					".” after creating that scene in the Alexa app."
				]
			})
		]
	});
}
function GoogleYouTubeConnection() {
	const [clientId, setClientId] = (0, import_react.useState)("");
	const [token, setToken] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("Not connected");
	const videos = useLibrary((s) => s.videos);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	(0, import_react.useEffect)(() => {
		setClientId(localStorage.getItem("reelcase.google.client-id") ?? "");
		setToken(sessionStorage.getItem("reelcase.google.youtube-token") ?? "");
	}, []);
	const connect = () => {
		const id = clientId.trim();
		if (!id.endsWith(".apps.googleusercontent.com")) {
			setStatus("Enter the Google OAuth Client ID ending in .apps.googleusercontent.com.");
			return;
		}
		localStorage.setItem("reelcase.google.client-id", id);
		setStatus("Opening Google authorization…");
		const start = () => {
			const client = window.google?.accounts?.oauth2?.initTokenClient({
				client_id: id,
				scope: "https://www.googleapis.com/auth/youtube.readonly",
				callback: (response) => {
					if (response.access_token) {
						sessionStorage.setItem("reelcase.google.youtube-token", response.access_token);
						setToken(response.access_token);
						setStatus("Google connected for this browser session.");
					} else setStatus(`Google authorization failed${response.error ? `: ${response.error}` : "."}`);
				}
			});
			if (!client) {
				setStatus("Google authorization library did not load. Check the authorized JavaScript origin.");
				return;
			}
			client.requestAccessToken({ prompt: "consent" });
		};
		const existing = document.querySelector("script[data-reelcase-google=\"true\"]");
		if (existing && window.google) start();
		else {
			const script = existing ?? document.createElement("script");
			script.src = "https://accounts.google.com/gsi/client";
			script.async = true;
			script.dataset.reelcaseGoogle = "true";
			script.onload = start;
			script.onerror = () => setStatus("Google authorization library could not load.");
			if (!existing) document.head.appendChild(script);
		}
	};
	const importTags = async () => {
		if (!token) return;
		const items = videos.filter((video) => video.remote?.kind === "youtube" && video.remote.videoId).slice(0, 50);
		if (!items.length) {
			setStatus("No YouTube videos are available to enrich yet.");
			return;
		}
		setStatus("Importing available YouTube metadata…");
		try {
			const ids = items.map((video) => video.remote.videoId).join(",");
			const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(ids)}`, { headers: { Authorization: `Bearer ${token}` } });
			if (!response.ok) throw new Error("Google did not allow the metadata request.");
			const body = await response.json();
			const byId = new Map((body.items ?? []).map((item) => [item.id, item.snippet]));
			let changed = 0;
			for (const video of items) {
				const snippet = byId.get(video.remote.videoId);
				const imported = [...new Set([
					"youtube",
					snippet?.channelTitle ?? video.remote?.channelName ?? "",
					...snippet?.tags ?? []
				].map((tag) => tag.trim()).filter(Boolean))].slice(0, 30);
				if (imported.length) {
					setVideoTags(video.id, imported);
					changed += 1;
				}
			}
			setStatus(`Imported available tags for ${changed} YouTube title${changed === 1 ? "" : "s"}.`);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Could not import YouTube metadata.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: "Google & YouTube access"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Paste only the OAuth Client ID—never a secret. Google’s popup authorizes this browser session, then Reelcase can read permitted YouTube metadata and available creator tags."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-3 list-decimal space-y-1 pl-5 text-xs leading-5 text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "In Google Cloud, create a project and enable YouTube Data API v3." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Create an OAuth Client ID for a Web application; do not create or paste a client secret." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Add this exact Authorized JavaScript origin:",
						" ",
						typeof window === "undefined" ? "your app origin" : window.location.origin,
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Paste the Client ID here, select Connect Google, approve read-only YouTube access, then choose Import YouTube tags." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-3",
				value: clientId,
				onChange: (event) => setClientId(event.target.value),
				placeholder: "Google OAuth Client ID",
				"aria-label": "Google OAuth Client ID"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: connect,
						children: "Connect Google"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !token,
						onClick: () => void importTags(),
						children: "Import YouTube tags"
					}),
					token && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							sessionStorage.removeItem("reelcase.google.youtube-token");
							setToken("");
							setStatus("Disconnected from this browser session.");
						},
						children: "Disconnect"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-accent",
				children: status
			})
		]
	});
}
var PHOTO_FILE_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i;
var photoSourceWarmth = /* @__PURE__ */ new Map();
var PHOTO_BACKGROUND_REFRESH_MS = 18e5;
var cachedPhotoMetadata = null;
function photoMetadata() {
	if (cachedPhotoMetadata) return cachedPhotoMetadata;
	try {
		cachedPhotoMetadata = JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}");
	} catch {
		cachedPhotoMetadata = {};
	}
	return cachedPhotoMetadata;
}
function PhotosSection() {
	const scannedPhotoSources = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const photoUrls = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const knownPhotoIds = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const discoverySeen = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const metadataWriteTimer = (0, import_react.useRef)(null);
	const [ratingFilter, setRatingFilter] = (0, import_react.useState)("all");
	const [ratingQueuePhotoId, setRatingQueuePhotoId] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.rating-queue") ?? "";
		} catch {
			return "";
		}
	});
	const [photos, setPhotos] = (0, import_react.useState)([]);
	const [selectedPerson, setSelectedPerson] = (0, import_react.useState)("All photos");
	const [selectedAlbum, setSelectedAlbum] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.source-filter") || "All albums";
		} catch {
			return "All albums";
		}
	});
	const [selectedTag, setSelectedTag] = (0, import_react.useState)("All tags");
	const [selectedPhotoIds, setSelectedPhotoIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [photoSearch, setPhotoSearch] = (0, import_react.useState)("");
	const [discoveryFilter, setDiscoveryFilter] = (0, import_react.useState)("all");
	const [favoritesOnly, setFavoritesOnly] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.favorites-only") === "true";
		} catch {
			return false;
		}
	});
	const [photoSort, setPhotoSort] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.sort") || "newest";
		} catch {
			return "newest";
		}
	});
	const [showLocations, setShowLocations] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.show-locations") === "true";
		} catch {
			return false;
		}
	});
	const [photoFolders, setPhotoFolders] = (0, import_react.useState)([]);
	const [slideshow, setSlideshow] = (0, import_react.useState)(false);
	const [fullScreenSlide, setFullScreenSlide] = (0, import_react.useState)(false);
	const [slideSeconds, setSlideSeconds] = (0, import_react.useState)(() => {
		try {
			const value = Number(localStorage.getItem("reelcase.photos.slide-seconds") ?? "5");
			return [
				3,
				5,
				10,
				20,
				30
			].includes(value) ? value : 5;
		} catch {
			return 5;
		}
	});
	const [slideIndex, setSlideIndex] = (0, import_react.useState)(0);
	const [helperNote, setHelperNote] = (0, import_react.useState)("");
	const [focusedPhotoId, setFocusedPhotoId] = (0, import_react.useState)(null);
	const [photoViewerLoading, setPhotoViewerLoading] = (0, import_react.useState)(false);
	const [photoSourceLoading, setPhotoSourceLoading] = (0, import_react.useState)(false);
	const [photoScanTotal, setPhotoScanTotal] = (0, import_react.useState)(0);
	const [photoScanDone, setPhotoScanDone] = (0, import_react.useState)(0);
	const [photoScanStartedAt, setPhotoScanStartedAt] = (0, import_react.useState)(0);
	const [photoScanEstimatedPhotos, setPhotoScanEstimatedPhotos] = (0, import_react.useState)(0);
	const [photoScanFoundPhotos, setPhotoScanFoundPhotos] = (0, import_react.useState)(0);
	const [photoScanAverageMs, setPhotoScanAverageMs] = (0, import_react.useState)(0);
	const [photoLimit, setPhotoLimit] = (0, import_react.useState)(80);
	const [visionBusy, setVisionBusy] = (0, import_react.useState)(false);
	const [visionProgress, setVisionProgress] = (0, import_react.useState)("");
	const [upscalerHealth, setUpscalerHealth] = (0, import_react.useState)({
		state: "checking",
		detail: "Checking local model cache…"
	});
	const [upscalerUrl, setUpscalerUrl] = (0, import_react.useState)("");
	const [upscalerChecksum, setUpscalerChecksum] = (0, import_react.useState)("");
	const [upscalerInstalling, setUpscalerInstalling] = (0, import_react.useState)(false);
	const [companionCache, setCompanionCache] = (0, import_react.useState)(null);
	const [companionDeltaNote, setCompanionDeltaNote] = (0, import_react.useState)("");
	const appliedCompanionChanges = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const companionDeltaTimer = (0, import_react.useRef)(null);
	const [photoCacheNotice, setPhotoCacheNotice] = (0, import_react.useState)("Preparing cached photo index…");
	const libraryFolders = useLibrary((s) => s.folders);
	const sourcePhotos = useSourceAssets((s) => s.photos);
	const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
	const sourceFolders = (0, import_react.useMemo)(() => libraryFolders.filter((folder) => folder.kind === "directory" || folder.kind === "files"), [libraryFolders]);
	const checkUpscalerHealth = async () => {
		try {
			const raw = localStorage.getItem("reelcase.photo-upscaler.model.v1");
			const model = raw ? JSON.parse(raw) : null;
			if (model?.name && model.verifiedAt) {
				const cache = "caches" in window ? await caches.open("reelcase-local-models-v1") : null;
				if (!(cache && model.cacheKey ? await cache.match(model.cacheKey) : null)) throw new Error("Cached model artifact is unavailable");
				setUpscalerHealth({
					state: "ready",
					detail: `${model.name}${model.version ? ` · ${model.version}` : ""} verified ${new Date(model.verifiedAt).toLocaleDateString()} · ${bytes(model.bytes ?? 0)} cached locally. Originals remain untouched; execution and export stay disabled until runtime compatibility is verified.`
				});
			} else setUpscalerHealth({
				state: "missing",
				detail: "No verified local super-resolution model is installed. Upscaling is disabled, so no photo is ever mislabeled as enhanced."
			});
		} catch {
			setUpscalerHealth({
				state: "missing",
				detail: "The local model record could not be verified. Upscaling remains disabled and originals are safe."
			});
		}
	};
	(0, import_react.useEffect)(() => {
		checkUpscalerHealth();
	}, []);
	const installUpscalerModel = async () => {
		const url = upscalerUrl.trim();
		const expected = upscalerChecksum.trim().toLowerCase().replace(/^sha256:/, "");
		if (!/^https:\/\//i.test(url) || !/^[a-f0-9]{64}$/.test(expected)) {
			setUpscalerHealth({
				state: "missing",
				detail: "Enter an HTTPS model URL and the publisher’s exact 64-character SHA-256 checksum. Reelcase will not install an unverifiable model."
			});
			return;
		}
		setUpscalerInstalling(true);
		setUpscalerHealth({
			state: "checking",
			detail: "Downloading the model after your explicit request and verifying its SHA-256…"
		});
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(12e4) });
			if (!response.ok) throw new Error(`Download returned ${response.status}`);
			const blob = await response.blob();
			if (!blob.size || blob.size > 786432e3) throw new Error("Model size is outside the safe local cache budget");
			const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))).map((part) => part.toString(16).padStart(2, "0")).join("");
			if (digest !== expected) throw new Error("Checksum mismatch — the model was not stored");
			const cacheKey = "/reelcase-local-models/upscaler.onnx";
			await (await caches.open("reelcase-local-models-v1")).put(cacheKey, new Response(blob, { headers: { "content-type": blob.type || "application/octet-stream" } }));
			const name = new URL(url).pathname.split("/").pop() || "local-upscaler.onnx";
			localStorage.setItem("reelcase.photo-upscaler.model.v1", JSON.stringify({
				name,
				version: "user-verified",
				verifiedAt: Date.now(),
				cacheKey,
				bytes: blob.size,
				sha256: digest,
				url
			}));
			await checkUpscalerHealth();
		} catch (error) {
			setUpscalerHealth({
				state: "missing",
				detail: `${error instanceof Error ? error.message : "Model install failed"}. No model was enabled and originals were not changed.`
			});
		} finally {
			setUpscalerInstalling(false);
		}
	};
	const removeUpscalerModel = async () => {
		try {
			await (await caches.open("reelcase-local-models-v1")).delete("/reelcase-local-models/upscaler.onnx");
			localStorage.removeItem("reelcase.photo-upscaler.model.v1");
		} finally {
			await checkUpscalerHealth();
		}
	};
	(0, import_react.useEffect)(() => {
		let alive = true;
		const read = async () => {
			try {
				const data = await (await fetch("http://127.0.0.1:43123/cache-status")).json();
				if (!alive || !data.worker) return;
				setCompanionCache({
					state: data.worker.state ?? "ready",
					photos: Number(data.worker.photos) || 0,
					videos: Number(data.worker.videos) || 0,
					scannedAt: Number(data.worker.scannedAt) || 0,
					truncated: Boolean(data.worker.truncated)
				});
				const fresh = (data.recentChanges ?? []).filter((change) => Number(change.at) > 0 && !appliedCompanionChanges.current.has(Number(change.at)));
				if (!appliedCompanionChanges.current.size) {
					fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
					return;
				}
				fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
				if (appliedCompanionChanges.current.size > 240) appliedCompanionChanges.current = new Set([...appliedCompanionChanges.current].slice(-120));
				const changedIds = new Set(sourceFolders.filter((folder) => fresh.some((change) => {
					const path = String(change.path ?? "").replaceAll("\\", "/").toLowerCase();
					return path === folder.name.toLowerCase() || path.startsWith(`${folder.name.toLowerCase()}/`);
				})).map((folder) => folder.id));
				if (changedIds.size && !companionDeltaTimer.current) companionDeltaTimer.current = window.setTimeout(() => {
					companionDeltaTimer.current = null;
					Promise.all([...changedIds].slice(0, 3).map((id) => refreshSourcePhotos(id))).then((counts) => {
						if (alive) setCompanionDeltaNote(`Companion applied ${changedIds.size} folder change${changedIds.size === 1 ? "" : "s"} · ${counts.reduce((sum, count) => sum + count, 0).toLocaleString()} cached photos checked.`);
					});
				}, 1500);
			} catch {
				if (alive) setCompanionCache(null);
			}
		};
		read();
		const timer = window.setInterval(() => void read(), 3e4);
		return () => {
			alive = false;
			window.clearInterval(timer);
			if (companionDeltaTimer.current) window.clearTimeout(companionDeltaTimer.current);
		};
	}, [refreshSourcePhotos, sourceFolders]);
	const addPhotos = (files, folderName = "Unsorted", paths, urls) => {
		if (!files) return;
		const remembered = photoMetadata();
		const next = Array.from(files).filter((file) => file.type.startsWith("image/") || PHOTO_FILE_RE.test(file.name)).slice(0, 600).map((file, index) => {
			const path = paths?.[index] || file.webkitRelativePath || `${folderName}/${file.name}`;
			const id = `${path}-${file.lastModified}`;
			if (knownPhotoIds.current.has(id)) return null;
			const url = urls?.[index] ?? URL.createObjectURL(file);
			if (!urls?.[index]) photoUrls.current.add(url);
			return {
				id,
				name: file.name,
				path,
				url,
				people: remembered[id]?.people ?? [],
				tags: remembered[id]?.tags ?? [],
				album: remembered[id]?.album ?? paths?.[index]?.split("/")[0] ?? folderName,
				favorite: remembered[id]?.favorite ?? false,
				rating: remembered[id]?.rating ?? 0,
				addedAt: file.lastModified
			};
		}).filter((photo) => photo !== null);
		if (!next.length) return;
		for (const photo of next) knownPhotoIds.current.add(photo.id);
		setPhotos((current) => current.length ? [...current, ...next] : next);
	};
	(0, import_react.useEffect)(() => {
		if (sourcePhotos.length) {
			const remembered = photoMetadata();
			const metadataKey = (asset) => `${asset.path}-${asset.file.lastModified}`;
			const hot = sourcePhotos.filter((asset) => (remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite);
			const remaining = sourcePhotos.filter((asset) => !((remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite));
			const prioritized = [...hot, ...remaining].slice(0, 600);
			addPhotos(prioritized.map((asset) => asset.file), "Source import", prioritized.map((asset) => asset.path), prioritized.map((asset) => asset.url));
			setPhotoCacheNotice(`Cached index ready · ${sourcePhotos.length.toLocaleString()} source photos available`);
		}
	}, [sourcePhotos]);
	(0, import_react.useEffect)(() => () => {
		for (const url of photoUrls.current) URL.revokeObjectURL(url);
		photoUrls.current.clear();
	}, []);
	(0, import_react.useEffect)(() => {
		if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		metadataWriteTimer.current = setTimeout(() => {
			try {
				cachedPhotoMetadata = {
					...photoMetadata(),
					...Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, rating }) => [id, {
						path,
						people,
						tags,
						album,
						favorite,
						rating
					}]))
				};
				localStorage.setItem("reelcase.photo-meta.v1", JSON.stringify(cachedPhotoMetadata));
			} catch {}
		}, 650);
		return () => {
			if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		};
	}, [photos]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.sort", photoSort);
		} catch {}
	}, [photoSort]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.favorites-only", String(favoritesOnly));
		} catch {}
	}, [favoritesOnly]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.rating-queue", ratingQueuePhotoId);
		} catch {}
	}, [ratingQueuePhotoId]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.show-locations", String(showLocations));
		} catch {}
	}, [showLocations]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.slide-seconds", String(slideSeconds));
		} catch {}
	}, [slideSeconds]);
	(0, import_react.useEffect)(() => {
		const onFullscreen = () => setFullScreenSlide(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onFullscreen);
		return () => document.removeEventListener("fullscreenchange", onFullscreen);
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			await new Promise((resolve) => {
				const idle = window.requestIdleCallback;
				if (idle) idle(() => resolve(), { timeout: 450 });
				else window.setTimeout(resolve, 120);
			});
			if (cancelled) return;
			const toScan = sourceFolders.filter((folder) => !scannedPhotoSources.current.has(folder.id) && Date.now() - (photoSourceWarmth.get(folder.id) ?? 0) >= PHOTO_BACKGROUND_REFRESH_MS);
			if (toScan.length) {
				setPhotoSourceLoading(true);
				setPhotoScanTotal(toScan.length);
				setPhotoScanDone(0);
				setPhotoScanStartedAt(Date.now());
				setPhotoScanEstimatedPhotos(toScan.reduce((sum, folder) => sum + (folder.photoCount ?? 0), 0));
				setPhotoScanFoundPhotos(0);
				setPhotoScanAverageMs(0);
			}
			let cursor = 0;
			const adaptiveWorkers = Math.min(12, Math.max(2, Math.floor((navigator.hardwareConcurrency || 4) / 2)));
			const configuredWorkers = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0");
			const workerCount = Math.min(toScan.length, [
				2,
				4,
				6,
				8,
				12
			].includes(configuredWorkers) ? configuredWorkers : adaptiveWorkers);
			const workers = Array.from({ length: workerCount }, async () => {
				while (!cancelled) {
					const folder = toScan[cursor++];
					if (!folder) return;
					scannedPhotoSources.current.add(folder.id);
					const started = performance.now();
					const found = await refreshSourcePhotos(folder.id);
					const elapsed = performance.now() - started;
					photoSourceWarmth.set(folder.id, Date.now());
					if (!cancelled) {
						setPhotoScanDone((done) => done + 1);
						setPhotoScanFoundPhotos((total) => total + found);
						setPhotoScanAverageMs((mean) => mean ? mean * .65 + elapsed * .35 : elapsed);
					}
				}
			});
			await Promise.all(workers);
			if (!cancelled) setPhotoSourceLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [refreshSourcePhotos, sourceFolders]);
	const photoScanEta = photoSourceLoading && photoScanDone >= 2 && photoScanTotal > photoScanDone && photoScanAverageMs > 0 ? Math.max(1, Math.ceil(photoScanAverageMs * (photoScanTotal - photoScanDone) / 1e3)) : 0;
	const addPhotoFolder = (files) => {
		if (!files?.length) return;
		const first = [...files].find((file) => file.webkitRelativePath)?.webkitRelativePath.split("/")[0] ?? "Photo folder";
		setPhotoFolders((folders) => folders.includes(first) ? folders : [...folders, first]);
		addPhotos(files, first);
	};
	const people = (0, import_react.useMemo)(() => [...new Set(photos.flatMap((photo) => photo.people))], [photos]);
	const albums = (0, import_react.useMemo)(() => [...new Set(photos.map((photo) => photo.album))], [photos]);
	const photoTags = (0, import_react.useMemo)(() => [...new Set(photos.flatMap((photo) => photo.tags))].sort(), [photos]);
	const visionProcessed = (0, import_react.useMemo)(() => photos.filter((photo) => photo.tags.some((tag) => tag.startsWith("vision-"))).length, [photos]);
	const visionPending = Math.max(0, photos.length - visionProcessed);
	const visible = (0, import_react.useMemo)(() => photos.filter((photo) => (selectedPerson === "All photos" || photo.people.includes(selectedPerson)) && (selectedAlbum === "All albums" || photo.album === selectedAlbum) && (selectedTag === "All tags" || photo.tags.includes(selectedTag)) && (!favoritesOnly || photo.favorite) && (ratingFilter === "all" || (ratingFilter === "unrated" ? !photo.rating : photo.rating >= Number(ratingFilter))) && (discoveryFilter === "all" || (discoveryFilter === "screenshots" ? /screenshot|screen[_ -]?shot/i.test(photo.name) : discoveryFilter === "camera" ? /^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) : /download|image|copy|edited/i.test(photo.name))) && `${photo.name} ${photo.path} ${photo.people.join(" ")} ${photo.tags.join(" ")} ${photo.album}`.toLowerCase().includes(photoSearch.toLowerCase())).sort((a, b) => {
		if (photoSort === "name") return a.name.localeCompare(b.name);
		if (photoSort === "rating") return b.rating - a.rating || b.addedAt - a.addedAt;
		if (photoSort === "favorite") return Number(b.favorite) - Number(a.favorite) || b.addedAt - a.addedAt;
		if (photoSort === "auto-tags") return b.tags.length - a.tags.length || b.addedAt - a.addedAt;
		return b.addedAt - a.addedAt;
	}), [
		discoveryFilter,
		favoritesOnly,
		photoSearch,
		photoSort,
		photos,
		ratingFilter,
		selectedAlbum,
		selectedPerson,
		selectedTag
	]);
	const renderedPhotos = visible.slice(0, photoLimit);
	(0, import_react.useEffect)(() => setPhotoLimit(80), [
		photoSearch,
		selectedPerson,
		selectedAlbum,
		selectedTag,
		favoritesOnly,
		photoSort,
		discoveryFilter,
		ratingFilter
	]);
	(0, import_react.useEffect)(() => {
		if (!slideshow || !visible.length) return;
		const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % visible.length), slideSeconds * 1e3);
		return () => window.clearInterval(timer);
	}, [
		slideshow,
		slideSeconds,
		visible.length
	]);
	const featuredPhoto = visible[slideIndex % Math.max(visible.length, 1)];
	const focusedIndex = visible.findIndex((photo) => photo.id === focusedPhotoId);
	const focusedPhoto = focusedIndex >= 0 ? visible[focusedIndex] : photos.find((photo) => photo.id === focusedPhotoId);
	const moveFocus = (direction) => {
		if (!visible.length) return;
		const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + direction + visible.length) % visible.length;
		setFocusedPhotoId(visible[nextIndex].id);
	};
	const pickFreshDiscovery = () => {
		const unseen = visible.filter((photo) => !discoverySeen.current.has(photo.id));
		const pool = unseen.length ? unseen : visible;
		if (!unseen.length) discoverySeen.current.clear();
		const pick = pool[Math.floor(Math.random() * pool.length)];
		if (!pick) return;
		discoverySeen.current.add(pick.id);
		setSlideIndex(visible.findIndex((photo) => photo.id === pick.id));
		setPhotoViewerLoading(true);
		setFocusedPhotoId(pick.id);
	};
	const suggestPeopleFromNames = () => {
		let labeled = 0;
		setPhotos((items) => items.map((photo) => {
			if (photo.people.length) return photo;
			const candidate = photo.name.replace(/\.[^.]+$/, "").split(/[._\-\d]+/).map((word) => word.trim()).filter((word) => /^[A-Za-z]{3,20}$/.test(word)).find((word) => !/^(img|image|photo|picture|screenshot|copy|edited|final)$/i.test(word));
			if (!candidate) return photo;
			labeled += 1;
			return {
				...photo,
				people: [candidate[0].toUpperCase() + candidate.slice(1).toLowerCase()]
			};
		}));
		setHelperNote(labeled ? `Added ${labeled} suggested label${labeled === 1 ? "" : "s"} from file names. Review each label before relying on it.` : "No clear names were found in unlabeled file names.");
	};
	const autoTagPhotos = () => {
		let changed = 0;
		setPhotos((items) => items.map((photo) => {
			const text = `${photo.name} ${photo.path}`.toLowerCase();
			const extension = photo.name.split(".").pop()?.toLowerCase();
			const album = photo.album.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
			const suggestions = [
				/screenshot|screen[_ -]?shot/.test(text) ? "screenshot" : "",
				/^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) ? "camera" : "",
				/download|image|copy|edited/.test(text) ? "downloaded" : "",
				/vacation|travel|trip|beach|mountain/.test(text) ? "travel" : "",
				/birthday|wedding|party|event/.test(text) ? "event" : "",
				/pet|dog|cat/.test(text) ? "pets" : "",
				/receipt|invoice|document|scan/.test(text) ? "document" : "",
				/food|meal|restaurant|recipe/.test(text) ? "food" : "",
				/selfie|portrait|face/.test(text) ? "portrait" : "",
				extension ? `type-${extension}` : "",
				album && album !== "unsorted" && album !== "source-import" ? `album-${album}` : "",
				photo.favorite ? "favorite" : "",
				photo.rating >= 4 ? "highly-rated" : "",
				`year-${new Date(photo.addedAt).getFullYear()}`,
				`month-${new Date(photo.addedAt).toLocaleString("en-US", { month: "long" }).toLowerCase()}`
			].filter(Boolean);
			const tags = [.../* @__PURE__ */ new Set([...photo.tags, ...suggestions])];
			if (tags.length === photo.tags.length) return photo;
			changed += 1;
			return {
				...photo,
				tags
			};
		}));
		setHelperNote(changed ? `Added local filename-based auto tags to ${changed} photo${changed === 1 ? "" : "s"}. You can edit any tag on its card.` : "Everything already has the available local auto tags.");
	};
	const autoTagPhotosWithVision = async () => {
		const candidates = photos.filter((photo) => !photo.tags.some((tag) => tag.startsWith("vision-"))).slice(0, 48);
		if (!candidates.length) {
			setHelperNote("Every loaded photo already has a local vision pass. Add more photos or edit tags to review them.");
			return;
		}
		setVisionBusy(true);
		setVisionProgress(`Preparing a local model for ${candidates.length} photos…`);
		try {
			const labels = await classifyImagesLocally(candidates.map((photo) => photo.url), (done, total) => setVisionProgress(`Classifying locally · ${done}/${total}`));
			const byId = new Map(candidates.map((photo, index) => [photo.id, labels[index].map((label) => `vision-${label}`)]));
			let changed = 0;
			setPhotos((items) => items.map((photo) => {
				const additions = byId.get(photo.id) ?? [];
				const tags = [.../* @__PURE__ */ new Set([...photo.tags, ...additions])];
				if (tags.length === photo.tags.length) return photo;
				changed += 1;
				return {
					...photo,
					tags
				};
			}));
			setHelperNote(`Local vision suggestions added to ${changed} photo${changed === 1 ? "" : "s"}. Review the vision-* tags before relying on them.`);
		} catch {
			setHelperNote("The local vision model could not start. It needs browser storage and an initial model download; filename auto-tagging remains available.");
		} finally {
			setVisionBusy(false);
			setVisionProgress("");
		}
	};
	const downloadPhoto = (photo) => {
		const link = document.createElement("a");
		link.href = photo.url;
		link.download = photo.name;
		link.click();
	};
	const applyTagToSelected = (tag) => {
		const clean = tag.trim().toLowerCase();
		if (!clean || !selectedPhotoIds.size) return;
		setPhotos((items) => items.map((photo) => selectedPhotoIds.has(photo.id) ? {
			...photo,
			tags: [.../* @__PURE__ */ new Set([...photo.tags, clean])]
		} : photo));
		setHelperNote(`Added “${clean}” to ${selectedPhotoIds.size} selected photo${selectedPhotoIds.size === 1 ? "" : "s"}.`);
	};
	const startFullScreenSlideshow = async () => {
		const first = visible[slideIndex % Math.max(visible.length, 1)];
		if (!first) return;
		setFocusedPhotoId(first.id);
		setSlideshow(true);
		try {
			await document.documentElement.requestFullscreen?.();
		} catch {
			setHelperNote("Full-screen mode was blocked by this browser. The full-window viewer is still open.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Photo viewer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-4" }),
		title: "Your photos. Your favorites.",
		copy: "Add photos from this device, then group them by people yourself. Nothing uploads from this browser. Google Photos remains a separate, opt-in destination.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-2 text-sm font-medium",
						children: "Rating quest"
					}),
					[
						["all", "All ratings"],
						["unrated", "Needs a rating"],
						["3", "3+ stars"],
						["4", "4+ stars"],
						["5", "5 stars"]
					].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: ratingFilter === value ? "default" : "secondary",
						onClick: () => setRatingFilter(value),
						children: label
					}, value)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !photos.some((photo) => !photo.rating),
						onClick: () => {
							const choices = photos.filter((photo) => !photo.rating);
							const pick = choices[(choices.findIndex((photo) => photo.id === ratingQueuePhotoId) + 1 + choices.length) % choices.length];
							if (pick) {
								setRatingQueuePhotoId(pick.id);
								setFocusedPhotoId(pick.id);
							}
						},
						children: ratingQueuePhotoId ? "Continue rating queue" : "Rate a surprise photo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						children: [
							photos.filter((photo) => photo.rating > 0).length,
							" of ",
							photos.length,
							" rated"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Your local photo selection"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Photo folders become albums here; people labels are local notes, ready to map to XMP/IPTC subject metadata later."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "sr-only",
							type: "file",
							accept: "image/*",
							multiple: true,
							onChange: (event) => addPhotos(event.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							children: "Add photos"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "sr-only",
							type: "file",
							multiple: true,
							webkitdirectory: "",
							directory: "",
							onChange: (event) => addPhotoFolder(event.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Add photo folder"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://photos.google.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Open Google Photos"
						}),
						photoSearch.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `https://photos.google.com/search/${encodeURIComponent(photoSearch.trim())}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Search Google Photos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.google.com/android/find/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Find my phone"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-3 rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedPerson === "All photos" ? "default" : "secondary",
								onClick: () => setSelectedPerson("All photos"),
								children: "All photos"
							}),
							people.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedPerson === name ? "default" : "secondary",
								onClick: () => setSelectedPerson(name),
								children: name
							}, name)),
							albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-bg/45 px-2 py-1 text-xs text-muted",
								children: album
							}, album))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 border-t border-border pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-center text-xs text-muted",
								children: "Albums"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedAlbum === "All albums" ? "default" : "secondary",
								onClick: () => {
									setSelectedAlbum("All albums");
									localStorage.removeItem("reelcase.photos.source-filter");
								},
								children: "All albums"
							}),
							albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedAlbum === album ? "default" : "secondary",
								onClick: () => {
									setSelectedAlbum(album);
									localStorage.setItem("reelcase.photos.source-filter", album);
								},
								children: album
							}, album))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-center text-xs text-muted",
								children: "Tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedTag === "All tags" ? "default" : "secondary",
								onClick: () => setSelectedTag("All tags"),
								children: "All tags"
							}),
							photoTags.slice(0, 16).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: selectedTag === tag ? "default" : "secondary",
								onClick: () => setSelectedTag(tag),
								children: ["#", tag]
							}, tag))
						]
					}),
					selectedPhotoIds.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 rounded-sm bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-medium text-fg",
								children: [selectedPhotoIds.size, " selected"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => applyTagToSelected("favorite-set"),
								children: "Tag set"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									photos.filter((photo) => selectedPhotoIds.has(photo.id)).forEach(downloadPhoto);
								},
								children: "Download selected"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setSelectedPhotoIds(/* @__PURE__ */ new Set()),
								children: "Clear selection"
							})
						]
					}),
					photoFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["Sources · ", photoFolders.join(" · ")]
					}),
					sourceFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["Video sources available for photo folders · ", sourceFolders.map((folder) => folder.name).slice(0, 8).join(" · ")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: photoSearch,
								onChange: (event) => setPhotoSearch(event.target.value),
								placeholder: "Search names, people, albums, or file locations",
								"aria-label": "Search photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: favoritesOnly ? "default" : "secondary",
								onClick: () => setFavoritesOnly((value) => !value),
								children: "Favorites"
							}),
							[
								"newest",
								"name",
								"rating",
								"favorite",
								"auto-tags"
							].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: photoSort === sort ? "default" : "secondary",
								onClick: () => setPhotoSort(sort),
								children: sort === "newest" ? "Newest" : sort === "name" ? "A–Z" : sort === "rating" ? "Top rated" : sort === "favorite" ? "Favorites first" : "Auto tags"
							}, sort)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: showLocations ? "default" : "secondary",
								onClick: () => setShowLocations((value) => !value),
								children: showLocations ? "Hide locations" : "Show locations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: slideshow ? "default" : "secondary",
								onClick: () => setSlideshow((value) => !value),
								children: slideshow ? "Stop auto-change" : "Auto-change photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: fullScreenSlide ? "default" : "secondary",
								disabled: !visible.length,
								onClick: () => void startFullScreenSlideshow(),
								children: fullScreenSlide ? "Full screen active" : "Full-screen slideshow"
							}),
							slideshow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: slideSeconds,
								onChange: (event) => setSlideSeconds(Number(event.target.value)),
								"aria-label": "Photo slideshow interval",
								className: "h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
								children: [
									3,
									5,
									10,
									20,
									30
								].map((seconds) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: seconds,
									children: [
										"Every ",
										seconds,
										"s"
									]
								}, seconds))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !visible.length,
								onClick: pickFreshDiscovery,
								children: "Fresh discovery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: suggestPeopleFromNames,
								children: "Suggest people labels"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: autoTagPhotos,
								children: "Auto tag photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length || visionBusy,
								onClick: () => void autoTagPhotosWithVision(),
								children: visionBusy ? visionProgress || "Starting local vision…" : "Local vision tags · 48"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "self-center text-xs text-muted",
							children: "Local discovery"
						}), [
							"all",
							"screenshots",
							"camera",
							"downloads"
						].map((filter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: discoveryFilter === filter ? "default" : "secondary",
							onClick: () => setDiscoveryFilter(filter),
							children: filter === "all" ? "All" : filter === "camera" ? "Camera names" : filter[0].toUpperCase() + filter.slice(1)
						}, filter))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-md border border-border bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Local vision report"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-fg",
									children: [
										visionProcessed.toLocaleString(),
										" processed · ",
										visionPending.toLocaleString(),
										" waiting · 3 bounded local workers"
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: visionBusy || !photos.length,
									onClick: () => void autoTagPhotosWithVision(),
									children: visionBusy ? visionProgress || "Starting model…" : `Process next ${Math.min(48, visionPending)}`
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: "Suggestions are cached with photo metadata and shown as vision-* tags for review."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: `text-xs ${upscalerHealth.state === "ready" ? "text-accent" : "text-muted"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-fg",
													children: ["Upscaler beta · ", upscalerHealth.state === "ready" ? "verified artifact" : upscalerHealth.state === "checking" ? "checking" : "model not installed"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
												upscalerHealth.detail
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => void checkUpscalerHealth(),
												children: "Check"
											}), upscalerHealth.state === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => void removeUpscalerModel(),
												children: "Remove"
											})]
										})]
									}),
									upscalerHealth.state !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)_auto]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: upscalerUrl,
												onChange: (event) => setUpscalerUrl(event.target.value),
												placeholder: "HTTPS model URL",
												"aria-label": "Upscaler model URL"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: upscalerChecksum,
												onChange: (event) => setUpscalerChecksum(event.target.value),
												placeholder: "Publisher SHA-256",
												"aria-label": "Upscaler model SHA-256 checksum"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												disabled: upscalerInstalling,
												onClick: () => void installUpscalerModel(),
												children: upscalerInstalling ? "Verifying…" : "Download + verify"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-[11px] leading-4 text-subtle",
										children: "Installation is always user-initiated, requires an exact checksum, stays in this browser cache, and can be removed here. A verified artifact is not used for export until a compatible local runtime is proven."
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Private local discovery uses file-name patterns plus an optional on-device open-source image classifier. It analyzes up to 48 queued photos at a time; photo bytes stay in this browser. A 900-photo warm URL cache and small rendered batches keep scrolling responsive while folders continue to stream."
					}),
					companionCache && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-5 text-subtle",
						children: [
							"Companion cache worker · ",
							companionCache.state,
							" · ",
							companionCache.photos.toLocaleString(),
							" photo metadata hints · ",
							companionCache.videos.toLocaleString(),
							" video metadata hints",
							companionCache.truncated ? " · bounded pass reached its safe limit" : "",
							companionCache.scannedAt ? ` · checked ${new Date(companionCache.scannedAt).toLocaleTimeString([], {
								hour: "numeric",
								minute: "2-digit"
							})}` : "",
							". Media files remain on this computer."
						]
					}),
					companionDeltaNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-accent",
						children: companionDeltaNote
					}),
					(helperNote || photoSourceLoading || photoCacheNotice) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-xs text-accent",
						children: [photoSourceLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }), photoSourceLoading ? `Loading cached photo sources · ${photoScanDone}/${photoScanTotal} folders · ${photoScanFoundPhotos.toLocaleString()} found${photoScanEstimatedPhotos ? ` of about ${photoScanEstimatedPhotos.toLocaleString()}` : ""}${photoScanEta ? ` · about ${photoScanEta}s remaining` : " · estimating time remaining…"}` : helperNote || photoCacheNotice]
					})
				]
			}),
			!photos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "mx-auto size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-fg",
						children: "Start with a few favorites"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Add photos here to make private people sections without connecting an account."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 overflow-hidden rounded-lg bg-elevated shadow-border",
					children: featuredPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: featuredPhoto.url,
							alt: featuredPhoto.name,
							decoding: "async",
							className: "aspect-video size-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col justify-center p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Now showing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-display text-3xl text-fg",
									children: featuredPhoto.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm text-muted",
									children: [
										featuredPhoto.album,
										" · ",
										featuredPhoto.rating || 0,
										"/5 rating"
									]
								}),
								showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									title: featuredPhoto.path,
									className: "mt-2 truncate text-xs text-muted",
									children: featuredPhoto.path
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
					children: renderedPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden rounded-md bg-elevated shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "absolute z-10 m-2 flex size-7 items-center justify-center rounded-sm bg-bg/75 text-fg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: selectedPhotoIds.has(photo.id),
									onChange: () => setSelectedPhotoIds((current) => {
										const next = new Set(current);
										if (next.has(photo.id)) next.delete(photo.id);
										else next.add(photo.id);
										return next;
									}),
									"aria-label": `Select ${photo.name}`
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "group relative block w-full",
								onClick: () => {
									setPhotoViewerLoading(true);
									setFocusedPhotoId(photo.id);
								},
								"aria-label": `Open ${photo.name} full screen`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: photo.url,
									alt: photo.name,
									loading: "lazy",
									decoding: "async",
									className: "aspect-square w-full object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute inset-0 flex items-center justify-center bg-bg/45 opacity-0 transition-opacity group-hover:opacity-100",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-6 text-fg" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "min-w-0 flex-1 truncate text-sm text-fg",
												children: photo.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: photo.favorite ? "default" : "secondary",
												onClick: () => setPhotos((items) => items.map((item) => item.id === photo.id ? {
													...item,
													favorite: !item.favorite
												} : item)),
												children: "♥"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												"aria-label": `Download ${photo.name}`,
												onClick: () => downloadPhoto(photo),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
											})
										]
									}),
									showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										title: photo.path,
										className: "mt-1 truncate text-xs text-muted",
										children: photo.path
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStars, {
										name: photo.name,
										rating: photo.rating,
										onChange: (rating) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
											...item,
											rating
										} : item))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-2 h-9",
										placeholder: "People: Alex, Sam",
										value: photo.people.join(", "),
										onChange: (event) => {
											const names = event.target.value.split(",").map((value) => value.trim()).filter(Boolean);
											setPhotos((items) => items.map((item) => item.id === photo.id ? {
												...item,
												people: names
											} : item));
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-2 h-9",
										placeholder: "Tags: travel, pets, event",
										value: photo.tags.join(", "),
										onChange: (event) => {
											const tags = event.target.value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).slice(0, 20);
											setPhotos((items) => items.map((item) => item.id === photo.id ? {
												...item,
												tags: [...new Set(tags)]
											} : item));
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-2 h-9",
										placeholder: "Album, e.g. Summer 2026",
										value: photo.album,
										onChange: (event) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
											...item,
											album: event.target.value || "Unsorted"
										} : item))
									})
								]
							})
						]
					}, photo.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between gap-3 text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Showing ",
						Math.min(renderedPhotos.length, visible.length),
						" of ",
						visible.length,
						" matching photos"
					] }), renderedPhotos.length < visible.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setPhotoLimit((limit) => limit + 80),
						children: "Show 80 more"
					})]
				}),
				focusedPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": `Viewing ${focusedPhoto.name}`,
					className: "fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 p-4",
					onClick: () => setFocusedPhotoId(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-full w-full max-w-7xl flex-col gap-3",
						onClick: (event) => event.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate font-medium",
											children: focusedPhoto.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted",
											children: [
												Math.max(1, focusedIndex + 1),
												" of ",
												visible.length || photos.length,
												" · ",
												focusedPhoto.album
											]
										}),
										showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											title: focusedPhoto.path,
											className: "truncate text-xs text-muted",
											children: focusedPhoto.path
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setFocusedPhotoId(null),
									children: "Close"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: focusedPhoto.favorite ? "default" : "secondary",
									onClick: () => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
										...item,
										favorite: !item.favorite
									} : item)),
									children: focusedPhoto.favorite ? "♥ Favorite" : "♡ Favorite"
								}), focusedPhoto.tags.length ? focusedPhoto.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-xs bg-elevated px-2 py-1 text-xs text-muted",
									children: ["#", tag]
								}, tag)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "No tags yet"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStars, {
								name: focusedPhoto.name,
								rating: focusedPhoto.rating,
								onChange: (rating) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
									...item,
									rating
								} : item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-h-0 flex-1",
								children: [
									photoViewerLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/70 text-sm text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-7 animate-spin text-accent" }), "Loading full-resolution photo…"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: focusedPhoto.url,
										alt: focusedPhoto.name,
										className: "max-h-full w-full object-contain",
										decoding: "async",
										onLoad: () => setPhotoViewerLoading(false),
										onError: () => setPhotoViewerLoading(false)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "absolute top-1/2 left-2 -translate-y-1/2",
										onClick: () => {
											setPhotoViewerLoading(true);
											moveFocus(-1);
										},
										"aria-label": "Previous photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "absolute top-1/2 right-2 -translate-y-1/2",
										onClick: () => {
											setPhotoViewerLoading(true);
											moveFocus(1);
										},
										"aria-label": "Next photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
									})
								]
							})
						]
					})
				})
			] })
		]
	});
}
var DEFAULT_MISSIONS = [
	{
		id: "index",
		title: "Durable media index",
		detail: "Catalog source health, cached metadata, persistent thumbnails, and fast search without blocking the first screen.",
		done: true
	},
	{
		id: "companion",
		title: "Desktop companion",
		detail: "Verify local files, watch selected folders, and launch approved desktop shortcuts through a local companion.",
		done: true
	},
	{
		id: "watch",
		title: "Watch room reliability",
		detail: "LAN diagnostics, timeline reconciliation, queue controls, and guest-access messaging are implemented; real cross-device matrix validation remains in progress.",
		done: false
	},
	{
		id: "services",
		title: "Connected services",
		detail: "Keep Twitch, YouTube, Roku, Spotify, and photo imports independently cached and refreshable.",
		done: true
	},
	{
		id: "thumb-health",
		title: "Thumbnail health queue",
		detail: "Retry failed artwork, hide unavailable remote cards, and expose a small source diagnostic instead of blank previews.",
		done: true
	},
	{
		id: "windows-explorer",
		title: "Windows explorer bridge",
		detail: "Companion-backed folder health, change events, shortcut validation, and safe launch history for local libraries.",
		done: true
	},
	{
		id: "service-status",
		title: "Service refresh status",
		detail: "Show when each connected service last refreshed, preserve partial results, and allow focused retries without reloading the whole app.",
		done: true
	},
	{
		id: "vr-theater",
		title: "VR theater reliability",
		detail: "WebXR cinema surface for local playback, controller transport controls, and clear Meta Quest recovery guidance.",
		done: true
	},
	{
		id: "companion-onboarding",
		title: "Companion onboarding",
		detail: "One-screen startup checklist: run the companion, confirm Desktop approval, load shortcuts, verify a file, then launch one game safely.",
		done: true
	},
	{
		id: "large-library-views",
		title: "Large-library views",
		detail: "Progressively render grids and keep recommendations responsive with very large catalog views.",
		done: true
	},
	{
		id: "favorites-memory",
		title: "Favorites memory",
		detail: "Preserve favorites, shelves, and resume markers in the local catalog with export and recovery checks across sessions.",
		done: true
	},
	{
		id: "theme-accessibility",
		title: "Theme & accessibility",
		detail: "Day/night palettes, focus styling, reduced-motion support, and per-section density preferences.",
		done: true
	},
	{
		id: "preview-recovery",
		title: "Local preview recovery",
		detail: "Resolve restored file handles in previews, hide failures, and log playback health without blocking the library.",
		done: true
	},
	{
		id: "youtube-quality",
		title: "YouTube channel quality",
		detail: "Per-channel retry controls, published-date ordering, duplicate suppression, and unavailable-card recovery are available in the YouTube desk.",
		done: true
	},
	{
		id: "twitch-quality",
		title: "Twitch live quality",
		detail: "Live-first ordering, check timestamps, VOD/clip shelves, automatic rotating refresh, and focused per-channel refresh are available; provider backoff reporting remains in progress.",
		done: false
	},
	{
		id: "x-quality",
		title: "X reading desk quality",
		detail: "Public profile/topic navigation, per-view load state, retry handling, and local reading-position timestamps are available without credentials.",
		done: true
	},
	{
		id: "startup-budget",
		title: "Startup performance budget",
		detail: "Catalog hydration, deferred search-index construction, lazy thumbnails, and bounded photo rendering protect the first usable shelf.",
		done: true
	},
	{
		id: "provider-import-recovery",
		title: "Provider import recovery",
		detail: "Provider refreshes retain successful channel rows, preserve prior cache on partial failures, and use RSS/channel-page plus public Twitch GraphQL recovery paths.",
		done: true
	},
	{
		id: "watch-room-cross-device",
		title: "Watch Room cross-device relay",
		detail: "Verify the signaling relay across separate devices and add a TURN-backed recovery route for networks that block direct peer negotiation.",
		done: false
	},
	{
		id: "movie-private-tag-shelves",
		title: "Movie and private tag shelves",
		detail: "Movies have source, genre, and file-type rails; private shelves retain favorites, tags, history, and rating-aware sorting locally.",
		done: true
	},
	{
		id: "sprint-01",
		title: "Alert rules",
		detail: "Per-service alert switches and the notification activity center are active locally.",
		done: true
	},
	{
		id: "sprint-02",
		title: "Preference coverage",
		detail: "Shipped preferences have concrete local controls, with status copy explaining their effects.",
		done: true
	},
	{
		id: "sprint-03",
		title: "Ratings streaks",
		detail: "Add rating goals, weekly streaks, and explainable local rewards.",
		done: false
	},
	{
		id: "sprint-04",
		title: "Video rating import/export",
		detail: "Include local video ratings in backup and catalog export recovery.",
		done: true
	},
	{
		id: "sprint-05",
		title: "Photo rating queue",
		detail: "Make unrated-photo review resumable across sessions.",
		done: true
	},
	{
		id: "sprint-06",
		title: "Continue recovery",
		detail: "Resume marks are durable, throttled away from the video frame loop, and recovered by path when a permitted source reconnects.",
		done: true
	},
	{
		id: "sprint-07",
		title: "History timeline",
		detail: "Limitless activity history deduplicates start bursts while retaining provider, progress, and Watch Room recovery context.",
		done: true
	},
	{
		id: "sprint-08",
		title: "X topic desk",
		detail: "Add curated public topic views alongside saved X profiles.",
		done: true
	},
	{
		id: "sprint-09",
		title: "X read tracking",
		detail: "Save reading position and surface timeline load diagnostics.",
		done: false
	},
	{
		id: "sprint-10",
		title: "Twitch discovery",
		detail: "Verify recommended public channels and separate discovery from follows.",
		done: true
	},
	{
		id: "sprint-11",
		title: "YouTube discovery",
		detail: "Build a separate creator discovery shelf with follow actions.",
		done: true
	},
	{
		id: "sprint-12",
		title: "Channel recency",
		detail: "Show channel freshness and focused refresh results.",
		done: true
	},
	{
		id: "sprint-13",
		title: "Remote dedupe",
		detail: "Suppress duplicate remote cards while retaining the newest valid metadata.",
		done: true
	},
	{
		id: "sprint-14",
		title: "Artwork retry budget",
		detail: "Local frame artwork has a bounded three-attempt retry budget, source rescan recovery, and per-card failure diagnostics.",
		done: true
	},
	{
		id: "sprint-15",
		title: "File type views",
		detail: "File-type rails now extend from Games into Movies, built from the cached catalog without rescanning sources.",
		done: true
	},
	{
		id: "sprint-16",
		title: "Tag review queue",
		detail: "Smart name/date/type and vision tags remain explicit, reviewable local labels before you rely on them for browsing.",
		done: true
	},
	{
		id: "sprint-17",
		title: "Fast filters",
		detail: "Deferred search indexing, progressive grids, source-scoped selectors, and cached metadata keep large catalog filters off the first paint.",
		done: true
	},
	{
		id: "sprint-18",
		title: "Offline resilience",
		detail: "Cached source health, unavailable-card hiding, recovery views, and source diagnostics distinguish a stale cache from an unavailable file.",
		done: true
	},
	{
		id: "sprint-19",
		title: "Watch room device matrix",
		detail: "Validate host and guest paths across browsers and home-network devices.",
		done: false
	},
	{
		id: "sprint-20",
		title: "Accessibility audit",
		detail: "Shared controls use visible focus states, accessible labels, responsive targets, contrast tokens, and the persisted reduced-motion preference.",
		done: true
	},
	{
		id: "metadata-provenance",
		title: "Metadata provenance and locks",
		detail: "Adopt the open-library pattern: preserve manual tags, record the source of enrichment, and never let a provider overwrite a locked user choice.",
		done: false
	},
	{
		id: "media-inspection",
		title: "Companion media inspection",
		detail: "Use the local companion for optional ffprobe/embedded-tag extraction in bounded batches, with a preview before tags are saved.",
		done: false
	},
	{
		id: "vision-tagging",
		title: "Optional local vision tagging",
		detail: "Evaluate an on-device open model for photo/video scene suggestions, keeping media bytes local and requiring review before labels are applied.",
		done: true
	},
	{
		id: "photo-model-quality",
		title: "Open-source photo tagging quality",
		detail: "On-device vision suggestions are cached by stable file fingerprint and remain review-only as vision-* tags before joining shared taxonomy.",
		done: true
	},
	{
		id: "companion-cache-workers",
		title: "Companion cache workers",
		detail: "Use bounded companion workers for folder deltas, photo metadata, and thumbnail warmup while leaving the first screen responsive.",
		done: false
	},
	{
		id: "watch-room-local-queue",
		title: "Watch Room local queue handoff",
		detail: "Guests now match approved local files by name, size, and modified time without sending file bytes; the shared handoff queue and room controls synchronize on every device. Catalog room playback is recorded in history.",
		done: true
	},
	{
		id: "photo-super-resolution",
		title: "Local photo upscaler beta",
		detail: "Download and validate an on-device super-resolution model, keep originals untouched, and report model/cache health before enabling export.",
		done: false
	},
	{
		id: "cross-source-taste-map",
		title: "Cross-source taste map",
		detail: "Stars, creator ratings, liked tags, and shared provider topics now guide cross-source shelves while filename-only terms stay weak.",
		done: true
	},
	{
		id: "companion-delta-apply",
		title: "Companion delta application",
		detail: "New Companion folder-change hints now debounce into bounded refreshes of matching, already-approved browser folders—no reconnect or broad rescan required.",
		done: true
	},
	{
		id: "local-share-compatibility",
		title: "Local share compatibility matrix",
		detail: "The local-share panel now reports exactly how many connected guests matched the staged fingerprint before the host plays it.",
		done: true
	},
	{
		id: "upscaler-model-install",
		title: "Verified upscaler model install",
		detail: "A user-initiated HTTPS download requires a publisher SHA-256, stores only a verified browser-cache artifact with a version record, and offers one-click removal. Runtime/export remain disabled until compatible execution is proven.",
		done: true
	},
	{
		id: "stats-source-remediation",
		title: "Stats-driven source remediation",
		detail: "Stats now offers safe tag and source review queues plus an exportable remediation plan. It never renames, reconnects, or removes files automatically.",
		done: true
	},
	{
		id: "youtube-deep-pagination",
		title: "YouTube deep pagination",
		detail: "Creator pulls now use a bounded 720-item deep public catalog window, duplicate suppression, and a short server cache to avoid repeated provider work.",
		done: true
	},
	{
		id: "taste-signal-audit",
		title: "Taste-signal audit",
		detail: "Stats now separates topic coverage, multi-topic depth, cross-source bridges, and operational-label volume so ranking inputs can be inspected before their weight changes.",
		done: true
	},
	{
		id: "tag-noise-budget",
		title: "Tag noise budget",
		detail: "Date, provider, format, source, creator, and keyword labels remain searchable/exportable but are excluded from taste scoring.",
		done: true
	},
	{
		id: "creator-coverage-repair",
		title: "Creator coverage repair",
		detail: "Backfill missing creator identity from public provider metadata and flag ambiguous matches for review.",
		done: false
	},
	{
		id: "metadata-tail-coverage",
		title: "Metadata tail coverage",
		detail: "Run bounded enrichment batches over the remaining untagged catalog and report coverage by source before applying recommendations.",
		done: false
	},
	{
		id: "recommendation-diversity",
		title: "Recommendation diversity guardrails",
		detail: "Guarantee source, creator, and topic variety across Home, Watch Room, and related shelves without hiding high-rated favorites.",
		done: false
	},
	{
		id: "activity-journal",
		title: "Independent activity journal",
		detail: "Keep History, Continue marks, and local viewing counts in an IndexedDB activity record separate from broad preference storage.",
		done: true
	},
	{
		id: "shelf-explanations",
		title: "Explainable recommendation shelves",
		detail: "Show the active rating, creator, topic, freshness, and diversity signals behind each recommendation rail without exposing operational tags.",
		done: false
	},
	{
		id: "memory-pressure-observer",
		title: "Memory-pressure observer",
		detail: "Measure mounted cards, image decode pressure, and cache eviction decisions on large provider and photo shelves.",
		done: false
	}
];
function MissionPlanSection() {
	const [missions, setMissions] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.mission-plan.v1") ?? "null");
			return Array.isArray(saved) ? [...saved.map((item) => ({
				...item,
				done: item.done || Boolean(DEFAULT_MISSIONS.find((mission) => mission.id === item.id)?.done)
			})), ...DEFAULT_MISSIONS.filter((mission) => !saved.some((item) => item.id === mission.id))] : DEFAULT_MISSIONS;
		} catch {
			return DEFAULT_MISSIONS;
		}
	});
	const [idea, setIdea] = (0, import_react.useState)("");
	const [showArchive, setShowArchive] = (0, import_react.useState)(false);
	const [companionCheck, setCompanionCheck] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.mission-plan.v1", JSON.stringify(missions));
		} catch {}
	}, [missions]);
	const completed = missions.filter((mission) => mission.done).length;
	const activeMissions = missions.filter((mission) => !mission.done);
	const archivedMissions = missions.filter((mission) => mission.done);
	const exportMissions = () => downloadCsv([[
		"step",
		"title",
		"status",
		"detail"
	], ...missions.map((mission, index) => [
		index + 1,
		mission.title,
		mission.done ? "complete" : "in-progress",
		mission.detail
	])], `reelcase-mission-plan-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Mission plan",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-4" }),
		title: "Build a private media home that scales.",
		copy: "Reelcase is moving toward a fast, local-first media hub: your files load from a durable catalog, your watch room works across your home network, and connected services remain optional and easy to control.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Product mission"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl text-fg",
						children: "One calm control room for a very large library."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
						children: "Make a million-file media collection feel immediate: cache its catalog locally, keep original files private, surface useful recommendations, and let trusted people watch together without turning the app into a cloud upload service."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex items-end justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-2xl text-fg",
							children: [
								completed,
								" of ",
								missions.length,
								" milestones complete"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Every milestone includes implementation, browser verification, and a production build check."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-full bg-accent/15 px-3 py-1 text-sm text-accent",
							children: [missions.length ? Math.round(completed / missions.length * 100) : 0, "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 h-2 overflow-hidden rounded-full bg-bg/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-accent transition-all",
							style: { width: `${missions.length ? completed / missions.length * 100 : 0}%` }
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex items-center justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Active delivery queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							activeMissions.length,
							" milestone",
							activeMissions.length === 1 ? "" : "s",
							" still need implementation or verification."
						]
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: activeMissions.map((mission, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex gap-4 rounded-lg bg-elevated p-4 shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							"aria-label": `Mark ${mission.title} complete`,
							onClick: () => setMissions((items) => items.map((item) => item.id === mission.id ? {
								...item,
								done: true
							} : item)),
							children: `Step ${index + 1}`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium text-fg",
								children: mission.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: mission.detail
							})]
						})]
					}, mission.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-elevated/70 p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Delivery archive"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [archivedMissions.length, " completed milestones are retained for reference and export."]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setShowArchive((value) => !value),
						children: showArchive ? "Hide completed work" : "Show completed work"
					})]
				}), showArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-2",
					children: archivedMissions.map((mission) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex gap-3 rounded-sm bg-bg/45 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							"aria-label": `Restore ${mission.title} to active work`,
							onClick: () => setMissions((items) => items.map((item) => item.id === mission.id ? {
								...item,
								done: false
							} : item)),
							children: "Done"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium text-muted line-through",
								children: mission.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: mission.detail
							})]
						})]
					}, mission.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Companion onboarding"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "A safe five-minute desktop setup."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "1. Start Companion"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Double-click Start-Reelcase-Companion.cmd in the main Reelcase folder."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "2. Confirm Desktop"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Keep its window open, then run the check below."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "3. Load shortcuts"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Open Games and choose Load approved desktop shortcuts."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "4. Verify first"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Use a listed shortcut inside an approved root before launching it."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						variant: "secondary",
						onClick: () => void (async () => {
							try {
								const data = await (await fetch("http://127.0.0.1:43123/health")).json();
								setCompanionCheck({
									ready: true,
									desktop: Boolean(data.desktopEnabled),
									detail: `${data.roots ?? 0} approved root(s)`
								});
							} catch {
								setCompanionCheck({
									ready: false,
									desktop: false,
									detail: "Companion not detected. Start it, leave the window open, then retry."
								});
							}
						})(),
						children: "Check Companion setup"
					}),
					companionCheck && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-3 text-sm ${companionCheck.ready && companionCheck.desktop ? "text-accent" : "text-danger"}`,
						children: companionCheck.ready ? `Ready · Desktop ${companionCheck.desktop ? "approved" : "not approved"} · ${companionCheck.detail}` : companionCheck.detail
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-5" }),
						title: "Next: home network",
						copy: "Folder watch events, Roku discovery, stable room invitations, and stronger timeline recovery."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-5" }),
						title: "Then: media intelligence",
						copy: "Background metadata, thumbnail health, faster source search, and reviewable local tags."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
						title: "Later: optional assistants",
						copy: "Private recommendation controls, explainable picks, and only opt-in service connections."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: exportMissions,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export mission plan"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => setMissions(DEFAULT_MISSIONS),
						children: "Reset to the current delivery queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "self-center text-xs text-muted",
						children: "Exports the current status, or restores the complete delivery baseline."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-5 flex flex-col gap-2 sm:flex-row",
				onSubmit: (event) => {
					event.preventDefault();
					const title = idea.trim();
					if (!title) return;
					setMissions((items) => [...items, {
						id: crypto.randomUUID(),
						title,
						detail: "New idea — break this into implementation and verification steps.",
						done: false
					}]);
					setIdea("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: idea,
					onChange: (event) => setIdea(event.target.value),
					placeholder: "Add a larger change idea",
					"aria-label": "New mission idea"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Add to plan"
				})]
			})
		]
	});
}
function GamesSection() {
	const [games, setGames] = (0, import_react.useState)([]);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [removeGame, setRemoveGame] = (0, import_react.useState)(null);
	const [launchNotice, setLaunchNotice] = (0, import_react.useState)("");
	const [shortcutView, setShortcutView] = (0, import_react.useState)("all");
	const [fileType, setFileType] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("name");
	const [companionLoading, setCompanionLoading] = (0, import_react.useState)(false);
	const sourceShortcuts = useSourceAssets((s) => s.shortcuts);
	(0, import_react.useEffect)(() => {
		const saved = readHub().games;
		setGames(saved);
	}, []);
	const saveGames = (next) => {
		setGames(next);
		writeHub({
			...readHub(),
			games: next
		});
	};
	const add = async (files, allowWebShortcut = false) => {
		if (!files) return;
		const source = Array.from(files).filter((file) => allowWebShortcut ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name) : /\.(exe|lnk|url|appref-ms)$/i.test(file.name));
		const next = await Promise.all(source.map(async (file) => {
			let launchUrl;
			if (/\.url$/i.test(file.name)) launchUrl = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im)?.[1];
			return {
				name: file.name,
				path: file.webkitRelativePath || file.name,
				size: file.size,
				addedAt: Date.now(),
				launchUrl
			};
		}));
		setGames((current) => {
			const merged = [...current, ...next.filter((item) => !current.some((game) => game.path === item.path))];
			writeHub({
				...readHub(),
				games: merged
			});
			return merged;
		});
	};
	(0, import_react.useEffect)(() => {
		if (sourceShortcuts.length) add(sourceShortcuts, true);
	}, [sourceShortcuts]);
	const launchDesktop = async (game) => {
		try {
			const result = await (await fetch("http://127.0.0.1:43123/launch", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ path: game.path })
			})).json();
			setLaunchNotice(result.ok ? `Launching ${game.name} through the local companion.` : result.error ?? "The companion could not launch this item.");
		} catch {
			setLaunchNotice("Desktop launch needs the Reelcase Companion running and this shortcut inside one of its approved Windows folders.");
		}
	};
	const loadApprovedShortcuts = async () => {
		setCompanionLoading(true);
		try {
			const result = await (await fetch("http://127.0.0.1:43123/shortcuts?limit=300")).json();
			if (!result.ok) throw new Error(result.error ?? "The companion could not read approved shortcuts.");
			const next = (result.shortcuts ?? []).map((item) => ({
				...item,
				size: 0,
				addedAt: Date.now()
			}));
			setGames((current) => {
				const incoming = new Map(next.map((item) => [item.path, item]));
				const merged = [...current.map((game) => {
					const refreshed = incoming.get(game.path);
					return refreshed ? {
						...game,
						...refreshed,
						iconData: game.iconData
					} : game;
				}), ...next.filter((item) => !current.some((game) => game.path === item.path))];
				writeHub({
					...readHub(),
					games: merged
				});
				return merged;
			});
			setLaunchNotice(next.length ? `Added ${next.length} approved desktop shortcuts. They can launch through the companion.` : "No approved desktop shortcuts were found. Add a shortcut to Desktop or another approved companion folder.");
		} catch {
			setLaunchNotice("Companion connection unavailable. Start the local Reelcase Companion, then try again.");
		} finally {
			setCompanionLoading(false);
		}
	};
	const gameTypes = [...new Set(games.map((game) => (game.name.match(/\.([^.]+)$/)?.[1] ?? "other").toLowerCase()))].sort();
	const visible = games.filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()) && (shortcutView === "all" || (shortcutView === "ready" ? gameKind(game) === "web-ready" : shortcutView === "unknown" ? gameKind(game) === "web-needs-target" : !isWebGame(game))) && (fileType === "all" || game.name.toLowerCase().endsWith(`.${fileType}`))).filter((game) => shortcutView === "all" || !isGameHelper(game)).sort((a, b) => sort === "newest" ? b.addedAt - a.addedAt : sort === "type" ? a.name.split(".").pop().localeCompare(b.name.split(".").pop()) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Desktop game shelf",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "size-4" }),
		title: "A clearer game drawer.",
		copy: "Choose a dedicated games folder, add custom cover icons, and explicitly import web game shortcuts. Every card has a launch control: web shortcuts open directly; desktop launchers are clearly marked because browsers cannot start an .exe by themselves.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 sm:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						accept: ".url",
						onChange: (event) => void add(event.target.files, true)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
						children: "Add web game shortcut"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: companionLoading,
						onClick: () => void loadApprovedShortcuts(),
						children: companionLoading ? "Reading approved shortcuts…" : "Load approved desktop shortcuts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						webkitdirectory: "",
						directory: "",
						onChange: (event) => void add(event.target.files)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-4 text-sm text-fg shadow-border",
						children: "Choose game folder"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: filter,
						onChange: (event) => setFilter(event.target.value),
						placeholder: "Filter your games",
						"aria-label": "Filter games"
					}),
					[
						"all",
						"ready",
						"desktop",
						"unknown"
					].map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: shortcutView === view ? "default" : "secondary",
						onClick: () => setShortcutView(view),
						children: view === "all" ? "All (helpers hidden)" : view === "ready" ? "Web ready" : view === "desktop" ? "Desktop" : "Unknown URL"
					}, view))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "File type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: fileType === "all" ? "default" : "secondary",
						onClick: () => setFileType("all"),
						children: "All types"
					}),
					gameTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: fileType === type ? "default" : "secondary",
						onClick: () => setFileType(type),
						children: [".", type]
					}, type)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs text-muted",
						children: "Sort"
					}),
					[
						"name",
						"newest",
						"type"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: sort === value ? "default" : "secondary",
						onClick: () => setSort(value),
						children: value === "name" ? "A–Z" : value === "newest" ? "Recently added" : "File type"
					}, value))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					visible.length,
					" shown · ",
					games.filter((game) => gameKind(game) === "web-needs-target").length,
					" web shortcuts need a readable target"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => downloadCsv([[
						"name",
						"path",
						"kind",
						"extension",
						"launch_ready",
						"helper",
						"added_at"
					], ...games.map((game) => [
						game.name,
						game.path,
						gameKind(game),
						game.name.split(".").pop() ?? "",
						Boolean(game.launchUrl),
						isGameHelper(game),
						new Date(game.addedAt).toISOString()
					])], `reelcase-games-debug-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), " Export game debug CSV"]
				})]
			}),
			visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: visible.map((game) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent/10 text-center text-[10px] font-bold tracking-[0.08em] text-accent",
						children: game.iconData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: game.iconData,
							alt: "",
							className: "size-full object-cover"
						}) : gameBadge(game)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-base font-medium text-fg",
								children: game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 truncate text-xs text-muted",
								children: gameKind(game) === "web-ready" ? "Web launcher ready" : gameKind(game) === "web-needs-target" ? "Shortcut target is unknown here — open it through the Companion or refresh its target" : game.path
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => {
											if (game.launchUrl) {
												const link = document.createElement("a");
												link.href = game.launchUrl;
												link.target = game.launchUrl.startsWith("http") ? "_self" : "_blank";
												document.body.appendChild(link);
												link.click();
												link.remove();
												return;
											}
											if (gameKind(game) === "web-needs-target") {
												launchDesktop(game);
												return;
											}
											launchDesktop(game);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), gameKind(game) === "web-needs-target" ? "Open .url shortcut" : isWebGame(game) ? "Open web game" : "Launch desktop game"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "inline-flex cursor-pointer items-center text-xs text-muted hover:text-fg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "mr-1 size-3" }),
											" Set icon",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "sr-only",
												type: "file",
												accept: "image/*",
												onChange: (event) => {
													const file = event.target.files?.[0];
													if (!file) return;
													const reader = new FileReader();
													reader.onload = () => saveGames(games.map((item) => item.path === game.path ? {
														...item,
														iconData: String(reader.result)
													} : item));
													reader.readAsDataURL(file);
												}
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										target: "_blank",
										rel: "noreferrer",
										href: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name.replace(/\..*$/, ""))}`,
										className: "inline-flex text-xs text-muted hover:text-fg",
										children: ["Store page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-3" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-xs text-muted hover:text-danger",
										onClick: () => removeGame === game.path ? (saveGames(games.filter((item) => item.path !== game.path)), setRemoveGame(null)) : setRemoveGame(game.path),
										children: removeGame === game.path ? "Confirm remove" : "Remove"
									})
								]
							})
						]
					})]
				}, game.path))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "mx-auto size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-fg",
						children: "Build your launch list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Add `.url` shortcuts to launch their approved web destination, or catalog desktop launchers and choose a custom cover icon."
					})
				]
			}),
			launchNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-md bg-elevated px-3 py-2 text-xs leading-5 text-muted shadow-border",
				children: launchNotice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
					name: "Nexus Mods",
					href: "https://www.nexusmods.com/",
					copy: "Browse mod pages and collections."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
					name: "Vortex",
					href: "https://www.nexusmods.com/about/vortex/",
					copy: "Open the official mod manager page."
				})]
			})
		]
	});
}
var PRIVATE_SHORTCUTS_KEY = "reelcase.private-web-shortcuts.v1";
function PrivateWebShortcuts() {
	const [links, setLinks] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(PRIVATE_SHORTCUTS_KEY) ?? "[]");
			return Array.isArray(saved) ? saved.filter((item) => typeof item?.name === "string" && typeof item?.url === "string") : [];
		} catch {
			return [];
		}
	});
	const [name, setName] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const save = (next) => {
		setLinks(next);
		localStorage.setItem(PRIVATE_SHORTCUTS_KEY, JSON.stringify(next));
	};
	const add = () => {
		try {
			const parsed = new URL(url);
			if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported");
			save([...links, {
				id: crypto.randomUUID(),
				name: name.trim() || parsed.hostname,
				url: parsed.toString()
			}]);
			setName("");
			setUrl("");
		} catch {
			setUrl("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-6 rounded-xl bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: "Private web shortcuts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-2xl text-fg",
				children: "Your saved destinations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: "Add only links you trust. These are saved only in this browser and open when you press Launch."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Name",
						"aria-label": "Shortcut name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: url,
						onChange: (event) => setUrl(event.target.value),
						placeholder: "https://…",
						"aria-label": "Shortcut URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !url.trim(),
						onClick: add,
						children: "Save shortcut"
					})
				]
			}),
			links.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-2",
				children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-md bg-bg/45 p-3 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium text-fg",
								children: link.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: link.url
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => window.location.assign(link.url),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), "Launch"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => save(links.filter((item) => item.id !== link.id)),
							children: "Remove"
						})
					]
				}, link.id))
			})
		]
	});
}
function LocalCatalog({ kind, eyebrow, icon, title, copy, accept, directory, footer }) {
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	(0, import_react.useEffect)(() => setHub(readHub()), []);
	const items = hub[kind];
	const change = (files) => {
		if (!files?.length) return;
		const next = {
			...hub,
			[kind]: filesToItems(files, kind === "games")
		};
		setHub(next);
		writeHub(next);
	};
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
						children: directory ? "Choose Desktop games folder" : "Add print files"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-xs text-muted",
						children: directory ? "Keeps only game launchers and shortcuts; folders and support files stay out." : "STL, OBJ, 3MF, and G-code are supported."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						multiple: true,
						accept,
						className: "sr-only",
						...directory ? {
							webkitdirectory: "",
							directory: ""
						} : {},
						onChange: (event) => change(event.target.files)
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
						children: "Stored as names only"
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "shrink-0 font-mono text-xs text-subtle",
						children: bytes(item.size)
					})]
				}, `${item.path}:${item.addedAt}`))]
			}),
			footer
		]
	});
}
function ShopSection() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [packages, setPackages] = (0, import_react.useState)([]);
	const [packageTitle, setPackageTitle] = (0, import_react.useState)("");
	const [carrier, setCarrier] = (0, import_react.useState)("USPS");
	const [tracking, setTracking] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			setPackages(JSON.parse(localStorage.getItem("reelcase.package-tracking.v1") ?? "[]"));
		} catch {
			setPackages([]);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.package-tracking.v1", JSON.stringify(packages));
		} catch {}
	}, [packages]);
	const encoded = encodeURIComponent(query.trim());
	const stores = (0, import_react.useMemo)(() => [
		{
			name: "Amazon",
			href: `https://www.amazon.com/s?k=${encoded}`,
			detail: "Search Amazon"
		},
		{
			name: "Walmart",
			href: `https://www.walmart.com/search?q=${encoded}`,
			detail: "Search Walmart"
		},
		{
			name: "eBay",
			href: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
			detail: "Search eBay"
		},
		{
			name: "Etsy",
			href: `https://www.etsy.com/search?q=${encoded}`,
			detail: "Search handmade & niche shops"
		},
		{
			name: "Diipoo",
			href: `https://diipoo.com/?s=${encoded}`,
			detail: "Search Diipoo deals"
		}
	], [encoded]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Shopping shortcuts",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }),
		title: "Find gear for your setup",
		copy: "Search major retailers from one clean starting point. Listings, prices, checkout, and account activity stay on the retailer’s site.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Search film gear, printer parts, controllers…",
						className: "pl-9"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: stores.map((store) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: store.href,
					target: "_blank",
					rel: "noreferrer",
					className: "group rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl text-fg",
							children: store.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: query.trim() ? `${store.detail} for “${query.trim()}”` : store.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent",
							children: ["Open search ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
						})
					]
				}, store.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 font-display text-2xl text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5 text-accent" }), "Package tracking"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "A private local list for orders you are expecting. Tracking opens the carrier lookup in a new page; no retailer account is connected."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: packageTitle,
								onChange: (event) => setPackageTitle(event.target.value),
								placeholder: "Package or order name",
								"aria-label": "Package name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: carrier,
								onChange: (event) => setCarrier(event.target.value),
								placeholder: "Carrier",
								"aria-label": "Carrier"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: tracking,
								onChange: (event) => setTracking(event.target.value),
								placeholder: "Tracking number (optional)",
								"aria-label": "Tracking number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									if (!packageTitle.trim()) return;
									setPackages((items) => [{
										id: crypto.randomUUID(),
										title: packageTitle.trim(),
										carrier: carrier.trim() || "Carrier",
										tracking: tracking.trim(),
										status: "Ordered"
									}, ...items]);
									setPackageTitle("");
									setTracking("");
								},
								children: "Add package"
							})
						]
					}),
					packages.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: packages.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 rounded-md bg-bg/45 px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-36 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: item.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [item.carrier, item.tracking ? ` · ${item.tracking}` : ""]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: item.status,
									onChange: (event) => setPackages((items) => items.map((entry) => entry.id === item.id ? {
										...entry,
										status: event.target.value
									} : entry)),
									className: "h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Ordered" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Shipped" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Out for delivery" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Delivered" })
									]
								}),
								item.tracking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: `https://www.17track.net/en/track?nums=${encodeURIComponent(item.tracking)}`,
									target: "_blank",
									rel: "noreferrer",
									className: "rounded-sm bg-accent px-3 py-2 text-xs font-medium text-accent-fg",
									children: "Track"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setPackages((items) => items.filter((entry) => entry.id !== item.id)),
									children: "Remove"
								})
							]
						}, item.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "No packages yet. Add an order to keep its delivery status beside your shopping shortcuts."
					})
				]
			})
		]
	});
}
function StreamingSection() {
	const [ratingQuery, setRatingQuery] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Movie streaming",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Streaming destinations",
		copy: "Keep watch sources separate from shopping. These official services and public collections open in their own sites.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "External rating search"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Look up a title on the source you trust. Searches open on the official site; Reelcase does not copy ratings into your local catalog."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ratingQuery,
						onChange: (event) => setRatingQuery(event.target.value),
						placeholder: "Search an anime, movie, or series",
						"aria-label": "External rating search"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							{
								label: "AniList",
								url: "https://anilist.co/search/anime?search="
							},
							{
								label: "AniDB",
								url: "https://anidb.net/anime/?adb.search="
							},
							{
								label: "Rotten Tomatoes",
								url: "https://www.rottentomatoes.com/search?search="
							}
						].map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `${source.url}${encodeURIComponent(ratingQuery.trim())}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-3 text-sm text-fg shadow-border",
							children: [source.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-3.5" })]
						}, source.label))
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				{
					name: "Netflix",
					href: "https://www.netflix.com/",
					copy: "Movies & series"
				},
				{
					name: "Hulu",
					href: "https://www.hulu.com/",
					copy: "TV & films"
				},
				{
					name: "Crunchyroll",
					href: "https://www.crunchyroll.com/",
					copy: "Anime streaming"
				},
				{
					name: "Kick",
					href: "https://kick.com/",
					copy: "Live streaming"
				},
				{
					name: "Vimeo",
					href: "https://vimeo.com/",
					copy: "Creator video"
				},
				{
					name: "Nebula",
					href: "https://nebula.tv/",
					copy: "Independent creators"
				},
				{
					name: "Plex",
					href: "https://www.plex.tv/",
					copy: "Personal media & streaming"
				},
				{
					name: "Internet Archive",
					href: "https://archive.org/details/feature_films",
					copy: "Open & public-domain films"
				},
				{
					name: "Old Time Movies",
					href: "https://archive.org/details/moviesandfilms",
					copy: "Classic and public-domain cinema"
				},
				{
					name: "Library of Congress",
					href: "https://www.loc.gov/film-and-videos/",
					copy: "Historic films and moving images"
				},
				{
					name: "Open Culture",
					href: "https://www.openculture.com/freemoviesonline",
					copy: "Free film collections and courses"
				},
				{
					name: "AniList",
					href: "https://anilist.co/",
					copy: "Anime discovery & ratings"
				},
				{
					name: "AniDB",
					href: "https://anidb.net/",
					copy: "Anime database"
				},
				{
					name: "Rotten Tomatoes",
					href: "https://www.rottentomatoes.com/",
					copy: "Critic & audience ratings"
				}
			].map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, { ...service }, service.name))
		})]
	});
}
function SocialSection() {
	const [accounts, setAccounts] = (0, import_react.useState)([]);
	const [handle, setHandle] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [lastRead, setLastRead] = (0, import_react.useState)({});
	const [topic, setTopic] = (0, import_react.useState)(null);
	const defaultTopics = (0, import_react.useMemo)(() => [
		{
			label: "Movies & TV",
			query: "movies OR tv"
		},
		{
			label: "Anime",
			query: "anime"
		},
		{
			label: "Gaming",
			query: "gaming"
		},
		{
			label: "Live creators",
			query: "twitch streamer"
		}
	], []);
	(0, import_react.useEffect)(() => {
		try {
			const raw = JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]");
			const saved = Array.isArray(raw) ? raw.filter((value) => typeof value === "string" && /^[A-Za-z0-9_]{1,15}$/.test(value)) : [];
			setAccounts(saved);
			const last = localStorage.getItem("reelcase.x-active") ?? "";
			setActive(saved.includes(last) ? last : saved[0] ?? "");
			if (!saved.length) setTopic(defaultTopics[0]);
			const reads = JSON.parse(localStorage.getItem("reelcase.x-last-read") ?? "{}");
			if (reads && typeof reads === "object") setLastRead(reads);
		} catch {}
	}, []);
	const choose = (account) => {
		const at = Date.now();
		setTopic(null);
		setActive(account);
		setLastRead((current) => {
			const next = {
				...current,
				[account]: at
			};
			try {
				localStorage.setItem("reelcase.x-last-read", JSON.stringify(next));
			} catch {}
			return next;
		});
		try {
			localStorage.setItem("reelcase.x-active", account);
		} catch {}
	};
	const save = (next) => {
		setAccounts(next);
		try {
			localStorage.setItem("reelcase.x-accounts", JSON.stringify(next));
		} catch {
			setError("Storage is full. Account changes will last for this session only.");
		}
	};
	const add = () => {
		const value = handle.trim().replace(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "").toLowerCase();
		if (!/^[a-z0-9_]{1,15}$/.test(value)) {
			setError("Enter a valid X handle or profile URL (up to 15 letters, numbers or underscores).");
			return;
		}
		if (accounts.length >= 50 && !accounts.includes(value)) {
			setError("Your shelf holds 50 accounts. Remove one before adding another.");
			return;
		}
		setError("");
		save([.../* @__PURE__ */ new Set([...accounts, value])]);
		choose(value);
		setHandle("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Social desk",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }),
		title: "Keep your people close.",
		copy: "Save X profiles, switch between public timelines, and pick up where you left off. Public timelines render inside Reelcase through X’s official widget; private posts and account likes stay on X.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				onSubmit: (event) => {
					event.preventDefault();
					add();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: handle,
					onChange: (event) => setHandle(event.target.value),
					placeholder: "@handle or X profile URL",
					"aria-label": "X account handle"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: !handle.trim(),
					children: "Add account"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-4",
				value: search,
				onChange: (event) => setSearch(event.target.value),
				placeholder: "Find a saved account",
				"aria-label": "Search saved X accounts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Public topic views"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Explore these X searches separately from your saved people. X supplies the public timeline; open the topic if it is unavailable."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: defaultTopics.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: topic?.label === item.label ? "default" : "secondary",
							onClick: () => {
								setTopic(item);
								setActive("");
							},
							children: item.label
						}, item.label))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
				children: accounts.filter((account) => account.toLowerCase().includes(search.toLowerCase())).map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-lg border p-2 " + (active === account ? "border-accent bg-elevated" : "border-border bg-surface"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": active === account,
						onClick: () => choose(account),
						className: "min-w-0 flex-1 p-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-lg font-semibold",
							children: ["@", account]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: lastRead[account] ? `Read ${new Date(lastRead[account]).toLocaleDateString()}` : "Public profile"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Remove @" + account,
						onClick: () => {
							const next = accounts.filter((value) => value !== account);
							save(next);
							if (active === account) choose(next[0] ?? "");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}, account))
			}),
			!accounts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 rounded-lg border border-border p-5 text-sm text-muted",
				children: "Showing the default public topic view below. Add a profile to create a personal reading shelf; if X blocks embedded posts, the Open topic/profile button is the reliable fallback."
			}),
			(active || topic) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XTimeline, {
				account: active || void 0,
				topic: topic ?? void 0
			}, topic ? `topic:${topic.label}` : active)
		]
	});
}
function WatchRoomSection() {
	const [roomCode, setRoomCode] = (0, import_react.useState)(() => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
	const [roomInput, setRoomInput] = (0, import_react.useState)("");
	const [recentLocalRoom, setRecentLocalRoom] = (0, import_react.useState)(() => localStorage.getItem("reelcase.watch-room.last-host") ?? "");
	const [name, setName] = (0, import_react.useState)(() => localStorage.getItem("reelcase.profile-name") || "Host");
	const [activeRoom, setActiveRoom] = (0, import_react.useState)(null);
	const [joinedAsGuest, setJoinedAsGuest] = (0, import_react.useState)(false);
	const [guestAccess, setGuestAccess] = (0, import_react.useState)(false);
	const [localVideo, setLocalVideo] = (0, import_react.useState)(null);
	const [localShare, setLocalShare] = (0, import_react.useState)(null);
	const [pendingLocalShare, setPendingLocalShare] = (0, import_react.useState)(null);
	const [localQueue, setLocalQueue] = (0, import_react.useState)([]);
	const [localShareMatches, setLocalShareMatches] = (0, import_react.useState)({});
	const [rokuAddress, setRokuAddress] = (0, import_react.useState)("");
	const [rokuReady, setRokuReady] = (0, import_react.useState)(false);
	const [rokuDevices, setRokuDevices] = (0, import_react.useState)([]);
	const [rokuNotice, setRokuNotice] = (0, import_react.useState)("");
	const [queue, setQueue] = (0, import_react.useState)([]);
	const [stageSize, setStageSize] = (0, import_react.useState)("compact");
	const [playback, setPlayback] = (0, import_react.useState)({
		playing: false,
		position: 0
	});
	const [chat, setChat] = (0, import_react.useState)([]);
	const [message, setMessage] = (0, import_react.useState)("");
	const [partyPrompt, setPartyPrompt] = (0, import_react.useState)("Pick the next vibe");
	const [partyVotes, setPartyVotes] = (0, import_react.useState)({
		Comedy: 0,
		Action: 0,
		Surprise: 0
	});
	const [friendName, setFriendName] = (0, import_react.useState)("");
	const [friendCode, setFriendCode] = (0, import_react.useState)("");
	const [inviteNotice, setInviteNotice] = (0, import_react.useState)("");
	const [pulseStatus, setPulseStatus] = (0, import_react.useState)("No direct transport test yet.");
	const [friends, setFriends] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]");
			return Array.isArray(saved) ? saved.slice(0, 16) : [];
		} catch {
			return [];
		}
	});
	const videos = useLibrary((s) => s.videos);
	const favorites = useLibrary((s) => s.favorites);
	const history = useLibrary((s) => s.history);
	const recordPlay = useLibrary((s) => s.recordPlay);
	(0, import_react.useEffect)(() => {
		localStorage.setItem("reelcase.profile-name", name.trim() || "Host");
	}, [name]);
	const [sharedVideoId, setSharedVideoId] = (0, import_react.useState)(() => {
		const pending = localStorage.getItem("reelcase.watch-room.pending-video");
		return (pending ? videos.find((video) => video.id === pending && Boolean(video.src || video.remote?.embedUrl)) : void 0)?.id ?? videos.find((video) => Boolean(video.src || video.remote?.embedUrl))?.id ?? "";
	});
	const sharedVideo = videos.find((video) => video.id === sharedVideoId);
	const roomClockCeiling = Math.max(60, Math.min(sharedVideo?.duration && sharedVideo.duration > 0 ? sharedVideo.duration + 30 : 43200, 43200));
	const clampRoomClock = (seconds) => Math.max(0, Math.min(roomClockCeiling, Number.isFinite(seconds) ? seconds : 0));
	const localShareIsMatched = !sharedVideoId.startsWith("local:") || localShare?.fingerprint === sharedVideoId.slice(6);
	const roomVideoRef = (0, import_react.useRef)(null);
	const remoteFrameRef = (0, import_react.useRef)(null);
	const twitchPlayerHostRef = (0, import_react.useRef)(null);
	const twitchPlayerRef = (0, import_react.useRef)(null);
	const [remoteFrameReady, setRemoteFrameReady] = (0, import_react.useState)(0);
	const [remoteSeekNonce, setRemoteSeekNonce] = (0, import_react.useState)(0);
	const lastYoutubeSeekNonce = (0, import_react.useRef)(0);
	const lastTwitchSeekNonce = (0, import_react.useRef)(0);
	const suppressRemotePlayerEchoUntil = (0, import_react.useRef)(0);
	const [twitchPlayerStatus, setTwitchPlayerStatus] = (0, import_react.useState)("Waiting for Twitch player…");
	const [twitchPlayerReady, setTwitchPlayerReady] = (0, import_react.useState)(0);
	const [candidateSeed, setCandidateSeed] = (0, import_react.useState)(() => Date.now());
	const [roomPickLimit, setRoomPickLimit] = (0, import_react.useState)(18);
	const youtubePlaybackStartedAt = (0, import_react.useRef)(null);
	const [localVideoUrl, setLocalVideoUrl] = (0, import_react.useState)("");
	const lastRoomTick = (0, import_react.useRef)(0);
	const lastRoomHistoryId = (0, import_react.useRef)("");
	const lastRoomPosition = (0, import_react.useRef)(0);
	const applyingRemotePlaybackUntil = (0, import_react.useRef)(0);
	const p2p = useP2PRoom(activeRoom ?? "", name.trim() || "Guest");
	(0, import_react.useEffect)(() => {
		if (!localVideo) {
			setLocalVideoUrl("");
			return;
		}
		const url = URL.createObjectURL(localVideo);
		setLocalVideoUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [localVideo]);
	(0, import_react.useEffect)(() => {
		localStorage.removeItem("reelcase.watch-room.pending-video");
	}, []);
	const roomCandidates = (0, import_react.useMemo)(() => {
		const played = new Set(history.map((entry) => entry.id));
		return videos.filter((video) => !video.isSample && !/\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`) && !useLibrary.getState().unavailable[video.id] && Boolean(video.remote?.embedUrl || video.src)).map((video) => {
			return {
				video,
				rank: roomShuffleRank(`${video.id}:${candidateSeed}`, candidateSeed) / 4294967295 + (favorites[video.id] ? .18 : 0) - (played.has(video.id) ? .32 : 0)
			};
		}).sort((a, b) => b.rank - a.rank).map(({ video }) => video);
	}, [
		candidateSeed,
		favorites,
		history,
		videos
	]);
	const localQueueCandidates = (0, import_react.useMemo)(() => roomCandidates.filter((video) => !video.remote && video.id !== sharedVideoId && !queue.includes(video.id)).slice(0, 18), [
		queue,
		roomCandidates,
		sharedVideoId
	]);
	const queueRecommendations = (0, import_react.useMemo)(() => {
		const alreadyShown = new Set(roomCandidates.slice(0, roomPickLimit).map((video) => video.id));
		const queued = new Set(queue);
		const unseen = roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id) && !alreadyShown.has(video.id)).sort((a, b) => roomShuffleRank(`${a.id}:queue`, candidateSeed + 17) - roomShuffleRank(`${b.id}:queue`, candidateSeed + 17));
		return (unseen.length ? unseen : roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id))).slice(0, 12);
	}, [
		candidateSeed,
		queue,
		roomCandidates,
		roomPickLimit,
		sharedVideoId
	]);
	(0, import_react.useEffect)(() => {
		const rotate = () => setCandidateSeed(Date.now());
		const timer = window.setInterval(rotate, 3e4);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const invitedRoom = (params.get("room") ?? "").trim().toUpperCase();
		if (!/^RC[A-Z0-9]{4,12}$/.test(invitedRoom)) return;
		setRoomInput(invitedRoom);
		if (params.get("theater") === "1") {
			setJoinedAsGuest(true);
			setStageSize("cinema");
			setActiveRoom(invitedRoom);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!p2p.peers.length) return;
		p2p.send({
			type: "room-state",
			playing: playback.playing,
			position: playback.position,
			videoId: sharedVideoId,
			queue,
			localQueue
		});
	}, [
		localQueue,
		p2p.peers.length,
		playback.playing,
		playback.position,
		queue,
		sharedVideoId
	]);
	(0, import_react.useEffect)(() => {
		if (joinedAsGuest && p2p.joined) p2p.send({ type: "resync-request" });
	}, [
		joinedAsGuest,
		p2p.joined,
		p2p.send
	]);
	(0, import_react.useEffect)(() => p2p.onMessage((from, raw) => {
		const data = raw;
		if (data.type === "chat" && data.text) setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
		if (data.type === "room-pulse") p2p.send({
			type: "room-pulse-ack",
			sentAt: data.sentAt
		}, from);
		if (data.type === "room-pulse-ack" && data.sentAt) setPulseStatus(`Direct transport confirmed · ${Math.max(0, Date.now() - data.sentAt)}ms round trip.`);
		if (data.type === "share-ready" && data.name && data.fingerprint) {
			const share = {
				name: data.name,
				fingerprint: data.fingerprint,
				size: Number(data.size) || 0,
				modified: Number(data.modified) || 0
			};
			setPendingLocalShare(share);
			setInviteNotice(`${data.name} is waiting for a permitted local match. Select the same file on this device; Reelcase compares name, size, and modified time without sending file contents.`);
		}
		if (data.type === "share-matched" && data.name && data.fingerprint) {
			setLocalShareMatches((matches) => ({
				...matches,
				[from]: {
					name: data.name,
					fingerprint: data.fingerprint,
					at: Date.now()
				}
			}));
			setInviteNotice(`${data.name} was matched by a guest. The approved local copy can now follow the room timeline.`);
		}
		if (data.type === "sync") {
			if (data.videoId && sharedVideoId && data.videoId !== sharedVideoId) return;
			const nextPosition = (Number(data.position) || 0) + (data.playing && data.sentAt ? Math.max(0, (Date.now() - data.sentAt) / 1e3) : 0);
			const safePosition = clampRoomClock(!data.seek && nextPosition < lastRoomPosition.current ? lastRoomPosition.current : nextPosition);
			lastRoomPosition.current = safePosition;
			applyingRemotePlaybackUntil.current = Date.now() + 900;
			if (data.seek) setRemoteSeekNonce((value) => value + 1);
			setPlayback({
				playing: Boolean(data.playing),
				position: safePosition
			});
		}
		if (data.type === "video" && data.videoId) setSharedVideoId(data.videoId);
		if (data.type === "queue" && Array.isArray(data.queue)) setQueue(data.queue);
		if (data.type === "local-queue" && Array.isArray(data.localQueue)) setLocalQueue(data.localQueue.slice(0, 24));
		if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({
			...votes,
			[data.name]: Number(data.position) || 0
		}));
		if (data.type === "room-state") {
			const videoChanged = Boolean(data.videoId && data.videoId !== sharedVideoId);
			if (data.videoId) setSharedVideoId(data.videoId);
			if (Array.isArray(data.queue)) setQueue(data.queue);
			if (Array.isArray(data.localQueue)) setLocalQueue(data.localQueue.slice(0, 24));
			const nextPosition = (Number(data.position) || 0) + (data.playing && data.sentAt ? Math.max(0, (Date.now() - data.sentAt) / 1e3) : 0);
			const safePosition = clampRoomClock(!videoChanged && nextPosition + .75 < lastRoomPosition.current ? lastRoomPosition.current : nextPosition);
			lastRoomPosition.current = safePosition;
			applyingRemotePlaybackUntil.current = Date.now() + 900;
			setPlayback({
				playing: Boolean(data.playing),
				position: safePosition
			});
		}
		if (data.type === "resync-request" && !joinedAsGuest) {
			const position = roomVideoRef.current?.currentTime ?? playback.position;
			p2p.send({
				type: "room-state",
				playing: !roomVideoRef.current?.paused && playback.playing,
				position,
				videoId: sharedVideoId,
				queue,
				localQueue,
				sentAt: Date.now()
			}, from);
		}
	}), [
		joinedAsGuest,
		localQueue,
		p2p.onMessage,
		p2p.send,
		playback.playing,
		playback.position,
		queue,
		roomClockCeiling,
		sharedVideoId
	]);
	const sync = (next, seek = false) => {
		if (!seek && Date.now() < applyingRemotePlaybackUntil.current) return;
		const isYoutube = sharedVideo?.remote?.kind === "youtube";
		const isTwitch = sharedVideo?.remote?.kind === "twitch";
		const elapsed = (isYoutube || isTwitch) && playback.playing && youtubePlaybackStartedAt.current ? Math.max(0, (Date.now() - youtubePlaybackStartedAt.current) / 1e3) : 0;
		const playerPosition = isTwitch ? twitchPlayerRef.current?.getCurrentTime() : void 0;
		const hasTwitchPosition = typeof playerPosition === "number" && Number.isFinite(playerPosition) && playerPosition > .25;
		const providerFallback = lastRoomPosition.current > .25 && next.position <= .25 && !seek;
		const providerClock = Math.max(lastRoomPosition.current, playback.position + elapsed);
		const position = !seek && (isYoutube || isTwitch) && !next.playing ? Math.max(providerClock, next.position) : isTwitch ? hasTwitchPosition ? playerPosition : providerFallback ? providerClock : Math.max(providerClock, next.position) : providerFallback ? providerClock : isYoutube ? Math.max(providerClock, next.position) : next.position;
		const resolved = {
			...next,
			position: clampRoomClock(position)
		};
		lastRoomPosition.current = resolved.position;
		youtubePlaybackStartedAt.current = resolved.playing ? Date.now() - resolved.position * 1e3 : null;
		setPlayback(resolved);
		if (resolved.playing && sharedVideoId && !sharedVideoId.startsWith("local:") && lastRoomHistoryId.current !== sharedVideoId) {
			lastRoomHistoryId.current = sharedVideoId;
			recordPlay(sharedVideoId, "watch-room");
		}
		if (seek) setRemoteSeekNonce((value) => value + 1);
		p2p.send({
			type: "sync",
			...resolved,
			videoId: sharedVideoId,
			seek,
			sentAt: Date.now()
		});
	};
	(0, import_react.useEffect)(() => {
		const provider = sharedVideo?.remote?.kind;
		if (!provider || !playback.playing || !youtubePlaybackStartedAt.current) return;
		const timer = window.setInterval(() => {
			const twitchTime = provider === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : void 0;
			const estimated = clampRoomClock((typeof twitchTime === "number" && twitchTime > .25 ? twitchTime : void 0) ?? Math.max(lastRoomPosition.current, (Date.now() - youtubePlaybackStartedAt.current) / 1e3));
			if (estimated <= lastRoomPosition.current + .2) return;
			lastRoomPosition.current = estimated;
			setPlayback((current) => current.playing ? {
				...current,
				position: estimated
			} : current);
			if (!joinedAsGuest) p2p.send({
				type: "sync",
				playing: true,
				position: estimated,
				videoId: sharedVideoId,
				seek: false,
				sentAt: Date.now()
			});
		}, 1e3);
		return () => window.clearInterval(timer);
	}, [
		joinedAsGuest,
		p2p.send,
		playback.playing,
		sharedVideo?.id,
		sharedVideo?.remote?.kind
	]);
	const resync = () => {
		if (joinedAsGuest) {
			p2p.send({ type: "resync-request" });
			setInviteNotice("Requested the host’s current room state.");
			return;
		}
		const localPosition = roomVideoRef.current?.currentTime;
		const twitchPosition = sharedVideo?.remote?.kind === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : void 0;
		const position = typeof localPosition === "number" && localPosition > .25 ? localPosition : typeof twitchPosition === "number" && twitchPosition > .25 ? twitchPosition : playback.position;
		const playing = roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing;
		sync({
			playing,
			position
		});
		p2p.send({
			type: "room-state",
			playing,
			position,
			videoId: sharedVideoId,
			queue,
			localQueue,
			sentAt: Date.now()
		});
		setInviteNotice("Sent the current video and timeline to every guest.");
	};
	const copyInvite = async () => {
		const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}&theater=1`;
		try {
			await navigator.clipboard.writeText(link);
			setInviteNotice("Theater invitation link copied.");
		} catch {
			setInviteNotice(`Share this theater link: ${link}`);
		}
	};
	(0, import_react.useEffect)(() => {
		const media = roomVideoRef.current;
		if (!media || sharedVideo?.remote) return;
		const driftLimit = playback.playing ? .65 : .1;
		if (Math.abs(media.currentTime - playback.position) > driftLimit) media.currentTime = playback.position;
		if (playback.playing && media.paused) media.play().catch(() => {});
		if (!playback.playing && !media.paused) media.pause();
	}, [playback, sharedVideo]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "youtube" || !remoteFrameReady) return;
		const frame = remoteFrameRef.current?.contentWindow;
		if (!frame) return;
		const target = new URL(watchRoomEmbed(sharedVideo)).origin;
		if (remoteSeekNonce !== lastYoutubeSeekNonce.current) {
			lastYoutubeSeekNonce.current = remoteSeekNonce;
			if (remoteSeekNonce) frame.postMessage(JSON.stringify({
				event: "command",
				func: "seekTo",
				args: [playback.position, true]
			}), target);
		}
		frame.postMessage(JSON.stringify({
			event: "command",
			func: playback.playing ? "playVideo" : "pauseVideo",
			args: []
		}), target);
	}, [
		playback,
		remoteFrameReady,
		remoteSeekNonce,
		sharedVideo
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "twitch") {
			twitchPlayerRef.current = null;
			return;
		}
		const host = twitchPlayerHostRef.current;
		if (!host) return;
		let cancelled = false;
		const hostId = `reelcase-twitch-${p2p.selfId}`;
		host.id = hostId;
		host.replaceChildren();
		setTwitchPlayerStatus("Loading Twitch interactive player…");
		loadTwitchEmbed().then((api) => {
			if (cancelled) return;
			const live = Boolean(sharedVideo.remote?.live);
			const rawVideo = sharedVideo.remote?.videoId ?? "";
			const video = rawVideo ? rawVideo.startsWith("v") ? rawVideo : `v${rawVideo}` : void 0;
			const player = new api.Player(hostId, {
				width: "100%",
				height: "100%",
				parent: [window.location.hostname],
				autoplay: false,
				muted: false,
				...live ? { channel: sharedVideo.remote?.watchUrl?.split("/").pop() } : { video }
			});
			twitchPlayerRef.current = player;
			const events = player.constructor;
			player.addEventListener(events.READY ?? "ready", () => {
				if (!cancelled) {
					setTwitchPlayerStatus("Twitch player ready. Use room controls to start.");
					setTwitchPlayerReady(Date.now());
				}
			});
			player.addEventListener(events.PLAY ?? "play", () => {
				const position = player.getCurrentTime();
				if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) sync({
					playing: true,
					position: position > .25 ? position : playback.position
				});
			});
			player.addEventListener(events.PAUSE ?? "pause", () => {
				const position = player.getCurrentTime();
				if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) sync({
					playing: false,
					position: position > .25 ? position : playback.position
				});
			});
			player.addEventListener(events.SEEK ?? "seek", () => {
				if (!cancelled && !live) sync({
					playing: true,
					position: player.getCurrentTime() || playback.position
				}, true);
			});
		}).catch(() => {
			if (!cancelled) setTwitchPlayerStatus("Twitch interactive player could not load. Open Twitch directly below.");
		});
		return () => {
			cancelled = true;
			twitchPlayerRef.current = null;
			host.replaceChildren();
		};
	}, [p2p.selfId, sharedVideo?.id]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "twitch") return;
		const player = twitchPlayerRef.current;
		if (!player) return;
		if (remoteSeekNonce !== lastTwitchSeekNonce.current) {
			lastTwitchSeekNonce.current = remoteSeekNonce;
			if (remoteSeekNonce && !sharedVideo.remote.live) player.seek(playback.position);
		}
		suppressRemotePlayerEchoUntil.current = Date.now() + 750;
		if (playback.playing) player.play();
		else player.pause();
	}, [
		playback,
		remoteSeekNonce,
		sharedVideo,
		twitchPlayerReady
	]);
	const toggleRoomPlayback = () => {
		const playing = !playback.playing;
		const player = twitchPlayerRef.current;
		if (sharedVideo?.remote?.kind === "twitch" && (!player || !twitchPlayerReady)) {
			setInviteNotice("Twitch is still preparing its player. Wait for “Twitch player ready,” then press Play.");
			return;
		}
		if (sharedVideo?.remote?.kind === "twitch" && player) {
			if (playing) {
				player.setMuted?.(false);
				player.play();
				setTwitchPlayerStatus("Starting Twitch from the room control…");
			} else player.pause();
		}
		sync({
			...playback,
			playing
		});
	};
	const chooseVideo = (video) => {
		setLocalVideo(null);
		setLocalShare(null);
		setLocalShareMatches({});
		setSharedVideoId(video.id);
		setPlayback({
			playing: false,
			position: 0
		});
		lastRoomPosition.current = 0;
		lastRoomHistoryId.current = "";
		recordPlay(video.id, "watch-room");
		p2p.send({
			type: "video",
			videoId: video.id
		});
		p2p.send({
			type: "sync",
			playing: false,
			position: 0,
			seek: true
		});
	};
	const updateQueue = (next) => {
		setQueue(next);
		p2p.send({
			type: "queue",
			queue: next
		});
	};
	const updateLocalQueue = (next) => {
		const bounded = next.slice(0, 24);
		setLocalQueue(bounded);
		p2p.send({
			type: "local-queue",
			localQueue: bounded
		});
	};
	const stageLocalShare = (share) => {
		if (!localShare || localShare.fingerprint !== share.fingerprint || !localVideo) {
			setPendingLocalShare(share);
			setInviteNotice(`Choose ${share.name} on this device before staging it. File contents are never transferred.`);
			return;
		}
		setSharedVideoId(`local:${share.fingerprint}`);
		setPlayback({
			playing: false,
			position: 0
		});
		lastRoomPosition.current = 0;
		p2p.send({
			type: "video",
			videoId: `local:${share.fingerprint}`
		});
		p2p.send({
			type: "sync",
			playing: false,
			position: 0,
			videoId: `local:${share.fingerprint}`,
			seek: true,
			sentAt: Date.now()
		});
		setInviteNotice(`${share.name} is staged. Guests with a verified local match can play it in sync.`);
	};
	const selectLocalVideo = (file) => {
		if (!file) return;
		const share = {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		};
		if (joinedAsGuest && pendingLocalShare && pendingLocalShare.fingerprint !== share.fingerprint) {
			setInviteNotice(`That file does not match ${pendingLocalShare.name}. Select the same permitted copy (name, size, and modified time must agree).`);
			return;
		}
		setLocalVideo(file);
		setLocalShare(share);
		if (joinedAsGuest && pendingLocalShare) {
			setSharedVideoId(`local:${share.fingerprint}`);
			setPendingLocalShare(null);
			p2p.send({
				type: "share-matched",
				name: share.name,
				fingerprint: share.fingerprint
			});
			setInviteNotice(`${share.name} matched locally. Waiting for the host to stage or play it.`);
			return;
		}
		setSharedVideoId(`local:${share.fingerprint}`);
		setLocalShareMatches({});
		setPlayback({
			playing: false,
			position: 0
		});
		lastRoomPosition.current = 0;
		p2p.send({
			type: "share-ready",
			...share
		});
		p2p.send({
			type: "video",
			videoId: `local:${share.fingerprint}`
		});
		setInviteNotice("Local video is staged by a privacy-preserving fingerprint. Guests choose their own permitted matching copy; no file bytes leave this computer.");
	};
	const queueVideo = (video) => {
		if (video.id !== sharedVideoId && !queue.includes(video.id)) updateQueue([...queue, video.id]);
	};
	const queueImmediately = (video) => {
		if (video.id === sharedVideoId) return;
		updateQueue([video.id, ...queue.filter((id) => id !== video.id)]);
		setInviteNotice(`${video.name} will play next for everyone in the room.`);
	};
	const playNext = () => {
		const nextId = queue[0];
		if (!nextId) return;
		const next = videos.find((video) => video.id === nextId);
		updateQueue(queue.slice(1));
		if (next) chooseVideo(next);
	};
	const playQueuedNow = (id) => {
		const video = videos.find((item) => item.id === id);
		if (!video) return;
		updateQueue(queue.filter((item) => item !== id));
		chooseVideo(video);
	};
	const send = () => {
		const text = message.trim();
		if (!text) return;
		setChat((rows) => [...rows, `You: ${text}`].slice(-50));
		p2p.send({
			type: "chat",
			text,
			name: name.trim() || "Guest"
		});
		setMessage("");
	};
	if (!activeRoom) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "LAN watch room",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
		title: "Watch together, on your terms.",
		copy: "Create a private room code or join one on the same network. Peers connect directly; names, chat, and playback commands stay in the room.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Create a room"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl tracking-[0.16em] text-fg",
						children: roomCode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Share this code only with people you want in your watch room."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "mt-3 w-full",
						onClick: () => void copyInvite(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), " Copy theater invitation link"]
					}),
					inviteNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 break-all text-xs text-accent",
						children: inviteNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-5 w-full",
						onClick: () => {
							setJoinedAsGuest(false);
							localStorage.setItem("reelcase.watch-room.last-host", roomCode);
							setRecentLocalRoom(roomCode);
							setActiveRoom(roomCode);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }), " Start room"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: [
							"Testing on one computer? Start the room first, then use ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Open local guest window"
							}),
							" inside the room. A second browser window is a separate peer; a single tab cannot chat with itself."
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Join a theater"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Guests enter a focused theater view first; controls and chat stay available beside the screen."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-3",
						value: roomInput,
						onChange: (event) => setRoomInput(event.target.value.toUpperCase()),
						placeholder: "Enter room code",
						"aria-label": "Watch room code"
					}),
					recentLocalRoom && recentLocalRoom !== roomInput && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						className: "mt-2",
						onClick: () => {
							setRoomInput(recentLocalRoom);
							setInviteNotice(`Using this browser’s active host room: ${recentLocalRoom}.`);
						},
						children: ["Join local host · ", recentLocalRoom]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2",
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Your display name",
						"aria-label": "Your display name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3 w-full",
						disabled: !roomInput.trim(),
						onClick: () => {
							setJoinedAsGuest(true);
							setStageSize("cinema");
							setActiveRoom(roomInput.trim());
						},
						children: "Join theater"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Local friends"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-5 text-muted",
								children: "Save a trusted friend name and their current room code for one-tap joining on this network."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-2 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: friendName,
									onChange: (event) => setFriendName(event.target.value),
									placeholder: "Friend name",
									"aria-label": "Friend name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: friendCode,
									onChange: (event) => setFriendCode(event.target.value.toUpperCase()),
									placeholder: "Room code",
									"aria-label": "Friend room code"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "mt-2",
								disabled: !friendName.trim() || !friendCode.trim(),
								onClick: () => {
									const next = [{
										name: friendName.trim(),
										code: friendCode.trim()
									}, ...friends.filter((friend) => friend.code !== friendCode.trim())].slice(0, 16);
									setFriends(next);
									localStorage.setItem("reelcase.lan-friends.v1", JSON.stringify(next));
									setFriendName("");
									setFriendCode("");
								},
								children: "Save friend"
							}),
							friends.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: friends.map((friend) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										setRoomInput(friend.code);
										setName(friend.name);
									},
									children: [
										friend.name,
										" · ",
										friend.code
									]
								}, `${friend.name}-${friend.code}`))
							})
						]
					})
				]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Connected watch room",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
		title: joinedAsGuest ? `Theater · ${activeRoom}` : `Room ${activeRoom}`,
		copy: joinedAsGuest ? "Guest theater view. The host's current video, queue, and timeline arrive as the connection settles." : "Direct peer connection for your selected guests. Playback events are synchronized across connected devices.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Synchronized playback"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: `size-3 ${p2p.joined ? "text-accent" : "text-subtle"}` }), p2p.joined ? "Signaling online" : "Connecting…"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								const invite = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`;
								const opened = window.open(invite, "reelcase-local-guest", "noopener,width=1200,height=820");
								setInviteNotice(opened ? "Opened a separate local guest window. Give it a moment to appear in Guests." : "Your browser blocked the guest window. Allow pop-ups, then try again.");
							},
							children: "Open local guest window"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void navigator.clipboard?.writeText(JSON.stringify({
								room: activeRoom,
								invitation: `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`,
								self: p2p.selfId,
								signaling: p2p.joined,
								peers: p2p.peers,
								transportTest: pulseStatus,
								events: p2p.events,
								capturedAt: (/* @__PURE__ */ new Date()).toISOString()
							}, null, 2)).then(() => setInviteNotice("Connection diagnostic copied."), () => setInviteNotice("Could not copy the diagnostic.")),
							children: "Copy connection diagnostic"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-sm bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium text-fg",
									children: "Connection signals"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										p2p.peers.filter((peer) => peer.connectionState === "connected").length,
										"/",
										p2p.peers.length,
										" direct"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] leading-4 text-muted",
								children: p2p.events.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: event }, `${event}-${index}`))
							}),
							!p2p.peers.length && p2p.joined && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-accent",
								children: [
									"Signaling is healthy, but no peer is in ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeRoom }),
									". The other window must join this exact code—not create its own. Use Open local guest window or copy this room link."
								]
							}),
							p2p.peers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 space-y-1 text-xs text-muted",
								children: p2p.peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-fg",
										children: peer.name || "Guest"
									}),
									" · ",
									peer.connectionState,
									" · ",
									peer.candidateType ?? "path pending",
									" · ",
									peer.rttMs == null ? "RTT pending" : `${peer.rttMs}ms`,
									" · ",
									peer.id.slice(-6)
								] }, peer.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !p2p.peers.some((peer) => peer.connectionState === "connected"),
									onClick: () => {
										setPulseStatus("Sending direct transport test…");
										p2p.send({
											type: "room-pulse",
											sentAt: Date.now()
										});
									},
									children: "Test chat transport"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: pulseStatus
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl text-fg",
						children: playback.playing ? "Playing together" : "Paused together"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Timeline ",
							Math.floor(playback.position / 60),
							":",
							String(Math.floor(playback.position % 60)).padStart(2, "0"),
							" · controls are sent to every connected guest."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: toggleRoomPlayback,
								children: [playback.playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playback.playing ? "Pause" : "Play"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => sync({
									...playback,
									position: Math.max(0, playback.position - 15)
								}, true),
								children: "−15 sec"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => sync({
									...playback,
									position: playback.position + 15
								}, true),
								children: "+15 sec"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: resync,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }),
									" ",
									joinedAsGuest ? "Request resync" : "Resync guests"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								disabled: !queue.length,
								onClick: playNext,
								children: ["Play next ", queue.length ? `(${queue.length})` : ""]
							})
						]
					}),
					inviteNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-accent",
						children: inviteNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stage size" }), [
							"compact",
							"theater",
							"cinema"
						].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: stageSize === size ? "default" : "secondary",
							onClick: () => setStageSize(size),
							children: size
						}, size))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `mt-3 mx-auto w-full max-w-full overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "lg:max-w-2xl" : stageSize === "theater" ? "lg:max-w-6xl" : ""}`,
						children: localVideoUrl && localShareIsMatched ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: roomVideoRef,
							className: "aspect-video w-full bg-bg",
							src: localVideoUrl,
							controls: true,
							onEnded: playNext,
							onPlay: () => sync({
								playing: true,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onPause: () => sync({
								playing: false,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onSeeked: () => sync({
								playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
								position: roomVideoRef.current?.currentTime ?? 0
							})
						}) : sharedVideo?.remote?.kind === "twitch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative aspect-video w-full bg-bg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: twitchPlayerHostRef,
								className: "absolute inset-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "absolute bottom-2 left-2 rounded-sm bg-bg/80 px-2 py-1 text-xs text-muted",
								children: twitchPlayerStatus
							})]
						}) : sharedVideo?.remote?.embedUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							ref: remoteFrameRef,
							title: sharedVideo.name,
							src: watchRoomEmbed(sharedVideo),
							className: "aspect-video w-full border-0",
							allow: "autoplay; encrypted-media; picture-in-picture",
							allowFullScreen: true,
							onLoad: () => setRemoteFrameReady(Date.now())
						}) : sharedVideo?.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: roomVideoRef,
							className: "aspect-video w-full bg-bg",
							src: sharedVideo.src,
							controls: true,
							onEnded: playNext,
							onPlay: () => sync({
								playing: true,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onPause: () => sync({
								playing: false,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onSeeked: () => sync({
								playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onTimeUpdate: () => {
								const media = roomVideoRef.current;
								if (!media || media.paused || Date.now() - lastRoomTick.current < 900) return;
								lastRoomTick.current = Date.now();
								sync({
									playing: true,
									position: media.currentTime
								});
							}
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex aspect-video items-center justify-center px-6 text-center text-sm text-muted",
							children: sharedVideoId.startsWith("local:") ? "This local handoff is waiting for a matching permitted file on this device." : "Choose a starter movie or an online video to show it to the room."
						})
					}),
					sharedVideo?.remote?.kind === "youtube" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "YouTube room controls retain the last trusted clock on pause, then resume from that same point. Use the room controls so every guest receives the same command."
					}) : sharedVideo?.remote?.kind === "twitch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-fg",
							children: "Twitch currently needs one manual Play press in each viewer’s embed."
						}), " Browser media rules prevent Reelcase from forcing a guest stream to start. Selection, queue, chat, and the preserved pause clock still sync through the room controls."] }), sharedVideo.remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: sharedVideo.remote.watchUrl,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-8 items-center rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1 size-3" }), "Open Twitch directly"]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted",
						children: "Recommended from your playable library — saved titles get a small lift while unplayed playable videos rotate to the front. Ready local files can be added to the queue below without taking over the stage."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => {
								setCandidateSeed(Date.now());
								setRoomPickLimit(18);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3.5" }), " Mix playable picks"]
						}), roomCandidates.length > roomPickLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setRoomPickLimit((limit) => Math.min(roomCandidates.length, limit + 18)),
							children: "Load 18 more playable videos"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2 overflow-x-auto pb-2",
						children: roomCandidates.slice(0, roomPickLimit).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => chooseVideo(video),
							className: `w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === sharedVideoId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`,
							children: [watchRoomPoster(video) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: watchRoomPoster(video),
								alt: "",
								className: "aspect-video w-full object-cover",
								onError: (event) => {
									const fallback = video.remote?.kind === "youtube" && video.remote.videoId ? `https://i.ytimg.com/vi/${video.remote.videoId}/mqdefault.jpg` : "";
									if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
									else event.currentTarget.style.display = "none";
								}
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate px-2 py-2 text-xs",
								children: video.name
							})]
						}, video.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-md bg-bg/45 p-3 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: "Up next queue"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "Hosts can order the room playlist"
								})]
							}),
							queue.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 space-y-2",
								children: queue.map((id, index) => {
									const video = videos.find((item) => item.id === id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3 rounded-sm bg-elevated p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 items-center gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent",
													children: index + 1
												}),
												video && watchRoomPoster(video) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: watchRoomPoster(video),
													alt: "",
													className: "aspect-video w-16 shrink-0 rounded-sm object-cover"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex aspect-video w-16 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-xs text-muted",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block truncate text-sm text-fg",
														children: video?.name ?? "Unavailable title"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block truncate text-xs text-muted",
														children: video?.remote?.channelName ?? (video?.remote ? "Remote video" : "Local file")
													})]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													onClick: () => playQueuedNow(id),
													children: "Play now"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													disabled: index === 0,
													onClick: () => {
														const next = [...queue];
														[next[index - 1], next[index]] = [next[index], next[index - 1]];
														updateQueue(next);
													},
													children: "↑"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => updateQueue(queue.filter((item) => item !== id)),
													children: "Remove"
												})
											]
										})]
									}, id);
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Choose “Add next” below to build the shared queue."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex gap-2 overflow-x-auto pb-1",
								children: roomCandidates.filter((video) => video.id !== sharedVideoId).slice(0, 12).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex shrink-0 overflow-hidden rounded-sm shadow-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => queueImmediately(video),
										children: "Play next"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										disabled: queue.includes(video.id),
										onClick: () => queueVideo(video),
										children: ["+ queue · ", video.name]
									})]
								}, video.id))
							}),
							queueRecommendations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-fg",
										children: "More queue ideas"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Different from the theater picks above"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex gap-2 overflow-x-auto pb-1",
									children: queueRecommendations.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex shrink-0 overflow-hidden rounded-sm shadow-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => queueImmediately(video),
											children: "Play next"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => queueVideo(video),
											children: ["+ queue · ", video.name]
										})]
									}, video.id))
								})]
							}),
							localQueueCandidates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-fg",
										children: "Ready local files"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Add to queue without opening now"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex gap-2 overflow-x-auto pb-1",
									children: localQueueCandidates.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => queueVideo(video),
										children: ["+ queue · ", video.name]
									}, video.id))
								})]
							}),
							localQueue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-border pt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-fg",
										children: "Approved local handoffs"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Shared manifest · files stay on each device"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 space-y-2",
									children: localQueue.map((share) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-2 rounded-sm bg-elevated px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 truncate text-xs text-fg",
											children: [
												share.name,
												" · ",
												bytes(share.size)
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => stageLocalShare(share),
												children: "Stage"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => updateLocalQueue(localQueue.filter((item) => item.fingerprint !== share.fingerprint)),
												children: "Remove"
											})]
										})]
									}, share.fingerprint))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-md bg-bg/45 p-4 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: "Share local video"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Choose a file only when every guest has permission to view it. Guests confirm access before you start sharing."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "sr-only",
									type: "file",
									accept: "video/*",
									onChange: (event) => {
										const file = event.target.files?.[0] ?? null;
										selectLocalVideo(file);
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
									children: localVideo ? localVideo.name : "Choose local video"
								})]
							}),
							localShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-subtle",
								children: [
									"Fingerprint match: name + ",
									bytes(localShare.size),
									" + modified ",
									new Date(localShare.modified).toLocaleDateString(),
									". This is shared as metadata only."
								]
							}),
							localShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									"Compatibility matrix · ",
									Object.values(localShareMatches).filter((match) => match.fingerprint === localShare.fingerprint).length,
									"/",
									p2p.peers.length,
									" guests matched this exact file",
									p2p.peers.length ? ". Stage or play only when the expected guests are ready." : ". Connect a guest to verify the handoff."
								]
							}),
							pendingLocalShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-accent",
								children: [
									"Guest match requested: ",
									pendingLocalShare.name,
									" · ",
									bytes(pendingLocalShare.size),
									". Choose the matching permitted copy above."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 flex items-start gap-2 text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: guestAccess,
									onChange: (event) => setGuestAccess(event.target.checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I confirm guests have access to this video and may receive this direct share." })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "mt-3",
								disabled: !localVideo || !guestAccess || !p2p.peers.length,
								onClick: () => {
									if (!localShare) return;
									setLocalShareMatches({});
									p2p.send({
										type: "share-ready",
										...localShare
									});
									p2p.send({
										type: "video",
										videoId: `local:${localShare.fingerprint}`
									});
									setInviteNotice("Local-share request sent with a match fingerprint. Guests must choose their permitted local copy before playback can align.");
								},
								children: "Send sharing request"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "mt-3 ml-2",
								disabled: !localShare,
								onClick: () => {
									if (!localShare) return;
									if (!localQueue.some((item) => item.fingerprint === localShare.fingerprint)) updateLocalQueue([...localQueue, localShare]);
									setInviteNotice("Added this local file to the shared handoff queue. Guests see only its match metadata.");
								},
								children: "Add to local queue"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md bg-bg/45 p-4 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Watch-party mini games"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Start a lightweight shared vote while the room is paused. Votes are sent to connected guests."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-3",
								value: partyPrompt,
								onChange: (event) => setPartyPrompt(event.target.value),
								"aria-label": "Party vote question"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: Object.keys(partyVotes).map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										const next = (partyVotes[choice] ?? 0) + 1;
										setPartyVotes((votes) => ({
											...votes,
											[choice]: next
										}));
										p2p.send({
											type: "party-vote",
											name: choice,
											position: next
										});
									},
									children: [
										choice,
										" · ",
										partyVotes[choice] ?? 0
									]
								}, choice))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-accent",
								children: ["Now voting: ", partyPrompt]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-md bg-bg/45 p-4 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm font-medium text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4 text-accent" }), "Roku handoff"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
								className: "mt-2 space-y-1 text-xs text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 text-accent",
										children: "1."
									}), "On Roku, open Settings → Network → About and copy its IP address."] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 text-accent",
										children: "2."
									}), "Enter it below to save this TV as a trusted handoff target."] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 text-accent",
										children: "3."
									}), "Launch the channel and copy the room invitation to your Roku browser or companion app."] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-col gap-2 sm:flex-row",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: rokuAddress,
										onChange: (event) => {
											setRokuAddress(event.target.value);
											setRokuReady(false);
										},
										placeholder: "Roku IP address, e.g. 192.168.1.24",
										"aria-label": "Roku IP address"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										disabled: !rokuAddress.trim(),
										onClick: () => {
											setRokuReady(true);
											localStorage.setItem("reelcase.roku", rokuAddress.trim());
										},
										children: "Save & pair TV"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										onClick: () => void (async () => {
											try {
												const devices = (await (await fetch("http://127.0.0.1:43123/roku/discover")).json()).devices ?? [];
												setRokuDevices(devices);
												setRokuNotice(devices.length ? `${devices.length} Roku device${devices.length === 1 ? "" : "s"} found on this network.` : "No Roku devices responded. You can still pair one by its IP address.");
											} catch {
												setRokuNotice("Roku discovery needs the local Reelcase Companion running on this Windows computer.");
											}
										})(),
										children: "Discover TVs"
									})
								]
							}),
							rokuNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: rokuNotice
							}),
							rokuDevices.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: rokuDevices.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										setRokuAddress(device.address);
										setRokuReady(true);
										localStorage.setItem("reelcase.roku", device.address);
									},
									children: device.address
								}, device.address))
							}),
							rokuReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-sm bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-accent",
									children: ["Step 3 ready · ", rokuAddress]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => {
											const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}`;
											window.open(`http://${rokuAddress}:8060/launch/837`, "_blank", "noopener");
											navigator.clipboard?.writeText(url).catch(() => {});
										},
										children: "Launch & copy room link"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => {
											setRokuReady(false);
											localStorage.removeItem("reelcase.roku");
										},
										children: "Forget TV"
									})]
								})]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-sm font-medium text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 text-accent" }), " Room chat"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 max-h-48 space-y-2 overflow-y-auto text-sm text-muted",
						children: chat.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-sm bg-bg/45 px-3 py-2",
							children: row
						}, `${row}-${index}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: message,
							onChange: (event) => setMessage(event.target.value),
							onKeyDown: (event) => {
								if (event.key === "Enter") send();
							},
							placeholder: "Say something",
							"aria-label": "Room chat message"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: send,
							children: "Send"
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-lg bg-elevated p-4 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Guests & connection status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
						children: ["You · ", p2p.joined ? "ready" : "joining"]
					}), p2p.peers.length ? p2p.peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
						children: [
							peer.name || "Guest",
							" · ",
							peer.connectionState,
							peer.rttMs ? ` · ${peer.rttMs}ms` : ""
						]
					}, peer.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-subtle",
						children: "Waiting for guests to join with the room code."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (event) => setName(event.target.value),
						"aria-label": "Display name",
						className: "max-w-56"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setActiveRoom(null);
							setRoomCode(`RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
						},
						children: "Leave room"
					})]
				})
			]
		})]
	});
}
function HubShell({ eyebrow, icon, title, copy, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
				children: [
					icon,
					" ",
					eyebrow
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base",
				children: copy
			}),
			children
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated px-4 py-4 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-2xl tabular-nums text-fg",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: label
		})]
	});
}
function ServiceLink({ name, href, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		className: "rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-fg",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: copy
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent",
				children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
			})
		]
	});
}
function InfoCard({ icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: copy
			})
		]
	});
}
function PhotoStars({ name, rating, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex flex-wrap items-center gap-1",
		role: "group",
		"aria-label": "Rating for " + name,
		children: [[
			1,
			2,
			3,
			4,
			5
		].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent",
			"aria-label": "Rate " + name + " " + value + " stars",
			"aria-pressed": rating === value,
			onClick: () => onChange(value),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-5 " + (value <= rating ? "fill-accent text-accent" : "text-muted") })
		}, value)), rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "min-h-11 px-2 text-xs text-muted",
			"aria-label": "Clear rating for " + name,
			onClick: () => onChange(0),
			children: "Clear"
		})]
	});
}
var YT_FOLDER_ID = "youtube:featured";
function ytFilm(opts) {
	const videoId = opts.id;
	return {
		id: `yt:${videoId}`,
		folderId: YT_FOLDER_ID,
		name: opts.name,
		path: `youtube/${opts.name}`,
		extension: "yt",
		mime: "video/youtube",
		size: 0,
		duration: opts.duration,
		addedAt: 20 + opts.year,
		isSample: true,
		year: opts.year,
		genre: opts.genre,
		tagline: opts.tagline,
		poster: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
		src: `https://www.youtube.com/embed/${videoId}`,
		remote: {
			kind: "youtube",
			videoId,
			channelName: opts.channel,
			embedUrl: `https://www.youtube.com/embed/${videoId}`,
			watchUrl: `https://www.youtube.com/watch?v=${videoId}`
		}
	};
}
ytFilm({
	id: "aqz-KE-bpKQ",
	name: "Big Buck Bunny",
	year: 2008,
	duration: 596,
	genre: "Animation",
	tagline: "An open movie from the Blender Foundation.",
	channel: "Blender"
}), ytFilm({
	id: "Y-rmzh0PI3c",
	name: "Cosmos Laundromat",
	year: 2015,
	duration: 720,
	genre: "Fantasy",
	tagline: "A down-on-his-luck sheep, and a deal.",
	channel: "Blender"
}), ytFilm({
	id: "R6MlUcmOul8",
	name: "Tears of Steel",
	year: 2012,
	duration: 734,
	genre: "Sci-Fi",
	tagline: "Amsterdam, after the machines.",
	channel: "Blender"
}), ytFilm({
	id: "UXqq0ZvbOnk",
	name: "Charge",
	year: 2022,
	duration: 720,
	genre: "Sci-Fi",
	tagline: "A Blender Studio open movie.",
	channel: "Blender Studio"
}), ytFilm({
	id: "eRsGyueVLvQ",
	name: "Elephants Dream",
	year: 2006,
	duration: 650,
	genre: "Sci-Fi",
	tagline: "The first Blender open movie.",
	channel: "Blender"
}), ytFilm({
	id: "YE7VzlLtp-4",
	name: "Sintel",
	year: 2010,
	duration: 888,
	genre: "Fantasy",
	tagline: "An open adventure from Blender.",
	channel: "Blender"
}), ytFilm({
	id: "XCejtdKK40o",
	name: "Caminandes",
	year: 2013,
	duration: 120,
	genre: "Animation",
	tagline: "A short open-film journey.",
	channel: "Blender"
}), ytFilm({
	id: "mN0zPOpADL4",
	name: "Agent 327",
	year: 2017,
	duration: 210,
	genre: "Animation",
	tagline: "A Blender Studio open project.",
	channel: "Blender Studio"
});
function shuffleRank(id, seed) {
	let value = seed >>> 0;
	for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 73244475);
	return value >>> 0;
}
function diversifyCreators(items, limit = 48) {
	const groups = /* @__PURE__ */ new Map();
	const seenIds = /* @__PURE__ */ new Set();
	for (const item of items) {
		if (seenIds.has(item.id)) continue;
		seenIds.add(item.id);
		const key = item.remote?.channelName?.trim().toLowerCase() || "local";
		const group = groups.get(key) ?? [];
		group.push(item);
		groups.set(key, group);
	}
	const rows = [...groups.values()];
	const result = [];
	for (let index = 0; result.length < limit; index += 1) {
		let added = false;
		for (const group of rows) {
			const item = group[index];
			if (!item) continue;
			result.push(item);
			added = true;
			if (result.length >= limit) break;
		}
		if (!added) break;
	}
	return result;
}
function isExcludedDemoVideo(video) {
	return Boolean(video.isSample) || /\bblender\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`);
}
function isOfflineChannelCard(video) {
	if (video.remote?.kind !== "twitch" || video.remote.live) return false;
	return /^offline\b/i.test(video.tagline ?? "") || video.extension === "live" || /\/(?:live|channel)$/i.test(video.path ?? "") || /:(?:live|channel)$/i.test(video.id ?? "");
}
function isFreshRemoteUpload(video) {
	const age = Date.now() - video.addedAt;
	return age >= -3e5 && age <= 12096e5;
}
function isTasteTag(tag) {
	return !/^(?:year-|month-|day-|type-|provider-|format-|source-|keyword-|creator-|https?$|youtube$|twitch$|vod$|live$)/i.test(tag.trim());
}
function LibraryApp() {
	const dirInputRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const pendingAdult = (0, import_react.useRef)(false);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [movieShuffle, setMovieShuffle] = (0, import_react.useState)(() => Date.now());
	const [homePickShuffle, setHomePickShuffle] = (0, import_react.useState)(() => Date.now());
	const [ratingRevision, setRatingRevision] = (0, import_react.useState)(0);
	const [adultTag, setAdultTag] = (0, import_react.useState)("All");
	const [adultSort, setAdultSort] = (0, import_react.useState)("recent");
	const [twitchSort, setTwitchSort] = (0, import_react.useState)("live");
	const [twitchFilter, setTwitchFilter] = (0, import_react.useState)("all");
	const [youtubeTagFilter, setYoutubeTagFilter] = (0, import_react.useState)("all");
	const [twitchTagFilter, setTwitchTagFilter] = (0, import_react.useState)("all");
	const [historyWindow, setHistoryWindow] = (0, import_react.useState)("all");
	const [homeExpanded, setHomeExpanded] = (0, import_react.useState)(false);
	const [remoteRefreshMs, setRemoteRefreshMs] = (0, import_react.useState)(() => {
		try {
			const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "60");
			return [
				15,
				30,
				60,
				120,
				300
			].includes(seconds) ? seconds * 1e3 : 6e4;
		} catch {
			return 6e4;
		}
	});
	const restoreFolders = useLibrary((s) => s.restoreFolders);
	const openVideo = useLibrary((s) => s.openVideo);
	const addFolder = useLibrary((s) => s.addFolder);
	const ingestFromInput = useLibrary((s) => s.ingestFromInput);
	const ingestDrop = useLibrary((s) => s.ingestDrop);
	const clearHistory = useLibrary((s) => s.clearHistory);
	const folders = useLibrary((s) => s.folders);
	const sourceId = useLibrary((s) => s.sourceId);
	const setSource = useLibrary((s) => s.setSource);
	const hydrated = useLibrary((s) => s.hydrated);
	const query = useLibrary((s) => s.query);
	const scanning = useLibrary((s) => s.scanning);
	const activeId = useLibrary((s) => s.activeId);
	const previewId = useLibrary((s) => s.previewId);
	const history = useLibrary((s) => s.history);
	const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
	const videos = useLibrary(useShallow(selectVisible));
	const continueVideos = useLibrary(useShallow((s) => selectContinue(s, false)));
	const favoriteVideos = useLibrary(useShallow((s) => selectFavorites(s, false)));
	const historyVideos = useLibrary(useShallow((s) => selectHistory(s, false)));
	const historyLastDay = (0, import_react.useMemo)(() => history.filter((entry) => entry.at > Date.now() - 864e5).length, [history]);
	const classics = useLibrary(useShallow(selectClassics));
	const featured = useLibrary((s) => selectFeatured(s, s.sourceId === "adults"));
	const youtubeCatalog = useLibrary(useShallow(selectYoutube));
	const youtubeVideos = (0, import_react.useMemo)(() => youtubeCatalog.filter((video) => !isExcludedDemoVideo(video)), [youtubeCatalog]);
	const newestYoutube = (0, import_react.useMemo)(() => [...youtubeVideos].sort((a, b) => b.addedAt - a.addedAt || a.name.localeCompare(b.name)), [youtubeVideos]);
	const twitchVideos = useLibrary(useShallow(selectTwitch));
	const newThisWeek = (0, import_react.useMemo)(() => [...youtubeVideos, ...twitchVideos].filter((video) => video.remote && Date.now() - video.addedAt >= -3e5 && Date.now() - video.addedAt < 6048e5).sort((a, b) => b.addedAt - a.addedAt), [twitchVideos, youtubeVideos]);
	const liveVideos = useLibrary(useShallow(selectLive));
	const adultContinue = useLibrary(useShallow((s) => selectContinue(s, true)));
	const adultFavorites = useLibrary(useShallow((s) => selectFavorites(s, true)));
	const adultHistory = useLibrary(useShallow((s) => selectHistory(s, true)));
	const hasUserFolders = userFolderCount(folders) > 0;
	const publicFolders = folders.filter((f) => f.kind !== "demo" && f.kind !== "youtube" && f.kind !== "twitch" && !f.adult);
	const adultFolders = folders.filter((f) => f.adult);
	const tags = useLibrary((s) => s.tags);
	const historyTopTags = (0, import_react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		for (const entry of history) for (const tag of tags[entry.id] ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		return [...counts.entries()].filter(([tag]) => !/^year-|^month-|^type-|^format-|^https$|^youtube$|^twitch$/.test(tag)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
	}, [history, tags]);
	const historyRecovery = (0, import_react.useMemo)(() => {
		const sources = {
			open: 0,
			progress: 0,
			watchRoom: 0
		};
		let resumable = 0;
		for (const entry of history) {
			if (entry.source === "watch-room") sources.watchRoom += 1;
			else if (entry.source === "progress") sources.progress += 1;
			else sources.open += 1;
			if ((entry.position ?? 0) > 1 && (entry.duration ?? 0) > 0 && (entry.position ?? 0) < (entry.duration ?? 0) * .985) resumable += 1;
		}
		return {
			sources,
			resumable
		};
	}, [history]);
	const filteredYoutube = (0, import_react.useMemo)(() => youtubeTagFilter === "all" ? newestYoutube : newestYoutube.filter((video) => (tags[video.id] ?? []).includes(youtubeTagFilter)), [
		newestYoutube,
		tags,
		youtubeTagFilter
	]);
	const trendingYoutube = (0, import_react.useMemo)(() => diversifyCreators([...filteredYoutube].sort((a, b) => (b.remote?.views ?? 0) - (a.remote?.views ?? 0) || b.addedAt - a.addedAt)), [filteredYoutube]);
	const categories = useLibrary((s) => s.categories);
	const catalogVideos = useLibrary((s) => s.videos);
	const favorites = useLibrary((s) => s.favorites);
	const progress = useLibrary((s) => s.progress);
	const likes = useLibrary((s) => s.likes);
	const viewCounts = useLibrary((s) => s.viewCounts);
	const unavailable = useLibrary((s) => s.unavailable);
	const follows = useLibrary((s) => s.follows);
	const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
	const adultTagNames = (0, import_react.useMemo)(() => [...new Set(videos.flatMap((video) => tags[video.id] ?? []))].sort(), [tags, videos]);
	const moviesByGenre = (0, import_react.useMemo)(() => [...videos].filter((video) => Boolean(video.genre)).sort((a, b) => a.genre.localeCompare(b.genre)), [videos]);
	const movieCatalog = (0, import_react.useMemo)(() => {
		const adultIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
		return catalogVideos.filter((video) => !video.remote && !video.isSample && !adultIds.has(video.folderId) && !unavailable[video.id]);
	}, [
		catalogVideos,
		folders,
		unavailable
	]);
	const randomSourceMovies = (0, import_react.useMemo)(() => movieCatalog.map((video) => ({
		video,
		rank: shuffleRank(video.id, movieShuffle)
	})).sort((a, b) => a.rank - b.rank).map((entry) => entry.video), [movieCatalog, movieShuffle]);
	const priorityMovieGenres = (0, import_react.useMemo)(() => [
		"Comedy",
		"Action",
		"Horror",
		"Drama",
		"Documentary",
		"Science Fiction"
	].map((genre) => ({
		genre,
		videos: movieCatalog.filter((video) => video.genre?.toLowerCase() === genre.toLowerCase())
	})).filter((shelf) => shelf.videos.length > 0), [movieCatalog]);
	const movieTypeShelves = (0, import_react.useMemo)(() => {
		const groups = /* @__PURE__ */ new Map();
		for (const video of movieCatalog) {
			const type = (video.extension || "file").replace(/^\./, "").toUpperCase();
			const rows = groups.get(type) ?? [];
			rows.push(video);
			groups.set(type, rows);
		}
		return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).slice(0, 10).map(([type, videos]) => ({
			type,
			videos
		}));
	}, [movieCatalog]);
	const adultSorted = (0, import_react.useMemo)(() => [...videos].sort((a, b) => adultSort === "name" ? a.name.localeCompare(b.name) : adultSort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt : adultSort === "tagged" ? (tags[b.id] ?? []).length - (tags[a.id] ?? []).length || b.addedAt - a.addedAt : adultSort === "played" ? (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0) || b.addedAt - a.addedAt : b.addedAt - a.addedAt), [
		adultSort,
		favorites,
		progress,
		tags,
		videos
	]);
	const adultTagged = (0, import_react.useMemo)(() => videos.filter((video) => (tags[video.id] ?? []).length > 0).sort((a, b) => (tags[b.id] ?? []).length - (tags[a.id] ?? []).length), [tags, videos]);
	const adultNeedsTags = (0, import_react.useMemo)(() => videos.filter((video) => !(tags[video.id] ?? []).length), [tags, videos]);
	const highlyRatedTags = (0, import_react.useMemo)(() => {
		const preferred = /* @__PURE__ */ new Set();
		for (const video of videos) {
			const rating = getRating(video.id);
			for (const tag of tags[video.id] ?? []) if (rating >= 4 || tagIsLiked(tag)) preferred.add(tag);
		}
		return preferred;
	}, [
		ratingRevision,
		tags,
		videos
	]);
	const tasteAverages = (0, import_react.useMemo)(() => {
		const tagsByScore = /* @__PURE__ */ new Map();
		const creatorsByScore = /* @__PURE__ */ new Map();
		for (const video of videos) {
			const signal = getRating(video.id) || (favorites[video.id] ? 4 : 0) || (likes[video.id] ? 3 : 0);
			if (!signal) continue;
			for (const tag of (tags[video.id] ?? []).filter(isTasteTag)) {
				const row = tagsByScore.get(tag) ?? {
					total: 0,
					count: 0
				};
				row.total += signal;
				row.count += 1;
				tagsByScore.set(tag, row);
			}
			const creator = video.remote?.channelName?.trim().toLowerCase();
			if (creator) {
				const row = creatorsByScore.get(creator) ?? {
					total: 0,
					count: 0
				};
				row.total += signal;
				row.count += 1;
				creatorsByScore.set(creator, row);
			}
		}
		return {
			tag: new Map([...tagsByScore].map(([key, row]) => [key, row.total / row.count])),
			creator: new Map([...creatorsByScore].map(([key, row]) => [key, row.total / row.count]))
		};
	}, [
		favorites,
		likes,
		ratingRevision,
		tags,
		videos
	]);
	const personalizedPicks = (0, import_react.useMemo)(() => {
		const watched = new Set(history.map((entry) => entry.id));
		const preferredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id] || getRating(video.id) >= 4).flatMap((video) => (tags[video.id] ?? []).filter(isTasteTag)));
		return [...videos].filter((video) => !video.isSample && !watched.has(video.id)).sort((a, b) => {
			const score = (video) => {
				const creatorAverage = tasteAverages.creator.get(video.remote?.channelName?.trim().toLowerCase() ?? "") ?? 0;
				const tagAverage = (tags[video.id] ?? []).filter(isTasteTag).reduce((total, tag) => total + (tasteAverages.tag.get(tag) ?? 0), 0);
				return getRating(video.id) * 18 + getCreatorRating(video.remote?.channelName ?? "") * 10 + creatorAverage * 5 + tagAverage * 2 + (creatorIsLiked(video.remote?.channelName ?? "") ? 9 : 0) + (favorites[video.id] ? 6 : 0) + (likes[video.id] ? 4 : 0) + (tags[video.id] ?? []).filter((tag) => isTasteTag(tag) && preferredTags.has(tag)).length * 2 + (video.remote?.live ? 1 : 0);
			};
			const rank = (video) => score(video) * .45 + shuffleRank(`${video.id}:${homePickShuffle}`, homePickShuffle) / 4294967295;
			return rank(b) - rank(a);
		});
	}, [
		favorites,
		history,
		homePickShuffle,
		likes,
		ratingRevision,
		tags,
		tasteAverages,
		videos
	]);
	const topRatedLocalPicks = (0, import_react.useMemo)(() => {
		const perFolder = /* @__PURE__ */ new Map();
		return personalizedPicks.filter((video) => !video.remote && !video.isSample).map((video) => ({
			video,
			score: getRating(video.id) * 5 + (favorites[video.id] ? 2 : 0) + (likes[video.id] ? 1 : 0) + shuffleRank(`local-rated:${video.id}:${homePickShuffle}`, homePickShuffle) / 4294967295 * 5
		})).sort((a, b) => b.score - a.score).filter(({ video }) => {
			const seen = perFolder.get(video.folderId) ?? 0;
			if (seen >= 3) return false;
			perFolder.set(video.folderId, seen + 1);
			return true;
		}).map(({ video }) => video);
	}, [
		favorites,
		homePickShuffle,
		likes,
		personalizedPicks
	]);
	const freshPicks = (0, import_react.useMemo)(() => {
		const seed = Math.floor(Date.now() / 36e5);
		return videos.filter((video) => !video.isSample && !video.remote?.live).map((video) => ({
			video,
			views: viewCounts[video.id] ?? 0,
			rank: shuffleRank(`${video.id}:${seed}`, seed)
		})).sort((a, b) => a.views - b.views || a.rank - b.rank).slice(0, 48).map(({ video }) => video);
	}, [videos, viewCounts]);
	const homeLocalRecent = (0, import_react.useMemo)(() => videos.filter((video) => !video.remote && !video.isSample).map((video) => ({
		video,
		ageBucket: Math.floor(Math.max(0, Date.now() - video.addedAt) / 6048e5),
		rank: shuffleRank(`${video.id}:recent`, homePickShuffle)
	})).sort((a, b) => a.ageBucket - b.ageBucket || a.rank - b.rank).slice(0, 48).map(({ video }) => video), [homePickShuffle, videos]);
	const homeLatestChannels = (0, import_react.useMemo)(() => [...youtubeVideos, ...twitchVideos].filter((video) => !video.remote?.live && !video.isSample && !isOfflineChannelCard(video)).sort((a, b) => b.addedAt - a.addedAt).slice(0, 48), [twitchVideos, youtubeVideos]);
	const sortedTwitch = (0, import_react.useMemo)(() => {
		if (sourceId !== "twitch") return [];
		return [...twitchVideos].filter((video) => !isOfflineChannelCard(video)).sort((a, b) => {
			if (twitchSort === "viewers") return (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || a.name.localeCompare(b.name);
			if (twitchSort === "name") return a.name.localeCompare(b.name);
			return Number(Boolean(b.remote?.live)) - Number(Boolean(a.remote?.live)) || (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || b.addedAt - a.addedAt;
		});
	}, [
		sourceId,
		twitchSort,
		twitchVideos
	]);
	const twitchVodPicks = (0, import_react.useMemo)(() => {
		if (sourceId !== "twitch") return [];
		const popularity = (video) => (video.remote?.viewers ?? 0) + getRating(video.id) * 40 + (favorites[video.id] ? 28 : 0) + (likes[video.id] ? 16 : 0) + (viewCounts[video.id] ?? 0) * 5 + (tags[video.id] ?? []).filter((tag) => highlyRatedTags.has(tag)).length * 8;
		return sortedTwitch.filter((video) => !video.remote?.live).sort((a, b) => popularity(b) - popularity(a) || b.addedAt - a.addedAt);
	}, [
		favorites,
		highlyRatedTags,
		likes,
		ratingRevision,
		sortedTwitch,
		sourceId,
		tags,
		viewCounts
	]);
	const twitchClips = (0, import_react.useMemo)(() => twitchVodPicks.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) <= 1200).slice(0, 24), [twitchVodPicks]);
	const favoriteTwitchPicks = (0, import_react.useMemo)(() => sortedTwitch.filter((video) => favorites[video.id]).sort((a, b) => (viewCounts[b.id] ?? 0) - (viewCounts[a.id] ?? 0) || b.addedAt - a.addedAt), [
		favorites,
		sortedTwitch,
		viewCounts
	]);
	const likedTwitchPicks = (0, import_react.useMemo)(() => sortedTwitch.filter((video) => likes[video.id] && !favorites[video.id]).sort((a, b) => getRating(b.id) - getRating(a.id) || (viewCounts[a.id] ?? 0) - (viewCounts[b.id] ?? 0) || b.addedAt - a.addedAt), [
		favorites,
		likes,
		ratingRevision,
		sortedTwitch,
		viewCounts
	]);
	const twitchVodChannels = (0, import_react.useMemo)(() => {
		const groups = /* @__PURE__ */ new Map();
		for (const video of twitchVodPicks) {
			const creator = video.remote?.channelName?.trim() || "Unknown creator";
			const group = groups.get(creator) ?? [];
			group.push(video);
			groups.set(creator, group);
		}
		return [...groups.entries()].map(([creator, vods]) => ({
			creator,
			vods,
			score: vods.reduce((total, video) => total + getRating(video.id) * 10 + (favorites[video.id] ? 8 : 0) + (likes[video.id] ? 4 : 0) + (viewCounts[video.id] ?? 0), 0)
		})).sort((a, b) => b.score - a.score || b.vods.length - a.vods.length || a.creator.localeCompare(b.creator)).slice(0, 12);
	}, [
		favorites,
		likes,
		ratingRevision,
		twitchVodPicks,
		viewCounts
	]);
	const liveChannelVods = (0, import_react.useMemo)(() => {
		const liveByCreator = /* @__PURE__ */ new Map();
		for (const video of sortedTwitch) {
			const creator = video.remote?.channelName?.trim();
			if (video.remote?.live && creator && !liveByCreator.has(creator.toLowerCase())) liveByCreator.set(creator.toLowerCase(), video);
		}
		return [...liveByCreator.values()].map((live) => {
			const creator = live.remote?.channelName?.trim() ?? "";
			return {
				creator,
				live,
				vods: twitchVodPicks.filter((video) => video.remote?.channelName?.trim().toLowerCase() === creator.toLowerCase()).slice(0, 24)
			};
		}).filter((group) => group.vods.length > 0).slice(0, 8);
	}, [sortedTwitch, twitchVodPicks]);
	const relatedYoutube = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube") return [];
		const likedChannels = new Set(youtubeVideos.filter((video) => favorites[video.id] || likes[video.id]).map((video) => video.remote?.channelName).filter(Boolean));
		const favoriteTags = new Set(youtubeVideos.filter((video) => getRating(video.id) >= 3).flatMap((video) => (tags[video.id] ?? []).filter(isTasteTag)));
		return [...youtubeVideos].sort((a, b) => {
			const score = (video) => {
				const creatorAverage = tasteAverages.creator.get(video.remote?.channelName?.trim().toLowerCase() ?? "") ?? 0;
				const tagAverage = (tags[video.id] ?? []).filter(isTasteTag).reduce((total, tag) => total + (tasteAverages.tag.get(tag) ?? 0), 0);
				const sharedFavoriteTopics = (tags[video.id] ?? []).filter((tag) => isTasteTag(tag) && favoriteTags.has(tag)).length;
				return getRating(video.id) * 14 + getCreatorRating(video.remote?.channelName ?? "") * 15 + creatorAverage * 9 + tagAverage * 6 + (creatorIsLiked(video.remote?.channelName ?? "") ? 16 : 0) + (likedChannels.has(video.remote?.channelName) ? 12 : 0) + sharedFavoriteTopics * 18;
			};
			return score(b) - score(a) || b.addedAt - a.addedAt || shuffleRank(`${a.id}:${homePickShuffle}`, homePickShuffle) - shuffleRank(`${b.id}:${homePickShuffle}`, homePickShuffle);
		});
	}, [
		favorites,
		homePickShuffle,
		likes,
		ratingRevision,
		sourceId,
		tags,
		tasteAverages,
		youtubeVideos
	]);
	const youtubeDiscovery = (0, import_react.useMemo)(() => {
		const known = new Set(follows.filter((channel) => channel.kind === "youtube").map((channel) => channel.title.toLowerCase()));
		return youtubeVideos.filter((video) => !known.has((video.remote?.channelName ?? "").toLowerCase()) || Boolean(video.isSample));
	}, [follows, youtubeVideos]);
	const channelTagShelves = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" && sourceId !== "twitch") return {
			youtube: [],
			twitch: []
		};
		const build = (items, kind) => {
			const groups = /* @__PURE__ */ new Map();
			for (const video of items) {
				if (video.remote?.kind !== kind) continue;
				for (const tag of tags[video.id] ?? []) {
					const clean = tag.toLowerCase();
					if ([
						kind,
						"vod",
						"live"
					].includes(clean) || clean.length < 4) continue;
					const list = groups.get(clean) ?? [];
					list.push(video);
					groups.set(clean, list);
				}
			}
			return [...groups.entries()].filter(([, items]) => items.length >= 2).sort((a, b) => {
				const taste = (list) => list.reduce((score, video) => score + getRating(video.id) * 2, 0);
				return taste(b[1]) - taste(a[1]) || b[1].length - a[1].length || a[0].localeCompare(b[0]);
			}).slice(0, 40).map(([tag, videos]) => ({
				tag,
				videos: diversifyCreators(videos)
			}));
		};
		return {
			youtube: build(youtubeVideos, "youtube"),
			twitch: build(twitchVideos, "twitch")
		};
	}, [
		ratingRevision,
		sourceId,
		tags,
		twitchVideos,
		youtubeVideos
	]);
	(0, import_react.useEffect)(() => {
		restoreFolders();
	}, [restoreFolders]);
	(0, import_react.useEffect)(() => {
		if (sourceId === "home") setHomePickShuffle(Date.now());
	}, [sourceId]);
	(0, import_react.useEffect)(() => {
		const refreshRatedShelves = () => (0, import_react.startTransition)(() => setRatingRevision((value) => value + 1));
		window.addEventListener("reelcase:rating-change", refreshRatedShelves);
		return () => window.removeEventListener("reelcase:rating-change", refreshRatedShelves);
	}, []);
	(0, import_react.useEffect)(() => {
		useThumbs.getState().hydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		const update = () => {
			try {
				const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "60");
				setRemoteRefreshMs(([
					15,
					30,
					60,
					120,
					300
				].includes(seconds) ? seconds : 60) * 1e3);
			} catch {
				setRemoteRefreshMs(6e4);
			}
		};
		window.addEventListener("reelcase:refresh-settings", update);
		return () => window.removeEventListener("reelcase:refresh-settings", update);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const build = () => librarySearchIndex.sync(catalogVideos, tags, categories);
		const scheduleIdle = window.requestIdleCallback;
		if (typeof scheduleIdle === "function") {
			const id = scheduleIdle(build, { timeout: 2e3 });
			return () => window.cancelIdleCallback(id);
		}
		const id = window.setTimeout(build, 350);
		return () => window.clearTimeout(id);
	}, [
		catalogVideos,
		categories,
		hydrated,
		tags
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const room = new URLSearchParams(window.location.search).get("room")?.trim().toUpperCase() ?? "";
		if (/^RC[A-Z0-9]{4,12}$/.test(room)) setSource("watch-room");
	}, [hydrated, setSource]);
	const refreshFollows = useLibrary((s) => s.refreshFollows);
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const pushNotice = useLibrary((s) => s.pushNotice);
	const [channelRefreshing, setChannelRefreshing] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!hydrated || !follows.length) return;
		let cancelled = false;
		const tick = async () => {
			if (document.hidden || !navigator.onLine) return;
			if (Date.now() - useLibrary.getState().remoteCheckedAt < Math.max(5e3, remoteRefreshMs - 5e3)) return;
			const { wentLive, newVideos } = await refreshFollows();
			if (cancelled) return;
			const preferences = (() => {
				try {
					return JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}");
				} catch {
					return {};
				}
			})();
			if (preferences["alerts-go-live-alerts"] !== false) for (const ch of wentLive) pushNotice({
				title: `${ch.title} is live`,
				body: "Tap to watch in Reelcase.",
				kind: "twitch",
				videoId: `tw:${ch.handle}:live`
			});
			for (const v of newVideos.filter((video) => video.remote?.kind === "youtube" && isFreshRemoteUpload(video) && preferences["alerts-new-youtube-upload-alerts"] !== false).slice(0, 3)) pushNotice({
				title: v.name,
				body: `${v.remote?.channelName ?? "YouTube"} · published ${new Date(v.addedAt).toLocaleDateString()}`,
				kind: "youtube",
				videoId: v.id
			});
			for (const v of newVideos.filter((video) => video.remote?.kind === "twitch" && preferences["alerts-new-twitch-vod-alerts"] !== false).slice(0, 3)) pushNotice({
				title: v.name,
				body: v.remote?.channelName ?? "New Twitch video",
				kind: "twitch",
				videoId: v.id
			});
		};
		const id = window.setInterval(() => void tick(), remoteRefreshMs);
		const first = window.setTimeout(() => void tick(), 1500);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.clearTimeout(first);
		};
	}, [
		hydrated,
		follows.length,
		refreshFollows,
		pushNotice,
		remoteRefreshMs
	]);
	const prevScanning = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const was = prevScanning.current;
		prevScanning.current = scanning;
		if (was && !scanning) {
			const folder = useLibrary.getState().folders.find((f) => f.name === was.folderName);
			const n = folder?.videoCount ?? 0;
			if (n === 0 && folder?.photoCount) toast.success(`Found ${folder.photoCount} photo${folder.photoCount === 1 ? "" : "s"} in ${was.folderName}`);
			else if (n > 0) toast.success(`Found ${n} video${n === 1 ? "" : "s"} in ${was.folderName}`);
		}
	}, [scanning]);
	(0, import_react.useEffect)(() => {
		let depth = 0;
		const prevent = (e) => e.preventDefault();
		const enter = (e) => {
			e.preventDefault();
			depth += 1;
			setDragging(true);
		};
		const leave = (e) => {
			e.preventDefault();
			depth -= 1;
			if (depth <= 0) {
				depth = 0;
				setDragging(false);
			}
		};
		const drop = (e) => {
			e.preventDefault();
			depth = 0;
			setDragging(false);
			if (!e.dataTransfer) return;
			ingestDrop(e.dataTransfer).catch((err) => {
				toast.error(err instanceof Error ? err.message : "Could not read files");
			});
		};
		window.addEventListener("dragenter", enter);
		window.addEventListener("dragleave", leave);
		window.addEventListener("dragover", prevent);
		window.addEventListener("drop", drop);
		return () => {
			window.removeEventListener("dragenter", enter);
			window.removeEventListener("dragleave", leave);
			window.removeEventListener("dragover", prevent);
			window.removeEventListener("drop", drop);
		};
	}, [ingestDrop]);
	const heading = (0, import_react.useMemo)(() => {
		if (sourceId === "continue") return "Continue watching";
		if (sourceId === "favorites") return "Favorites";
		if (sourceId === "history") return "History";
		if (sourceId === "movies") return "Movies";
		if (sourceId === "home") return "Home";
		if (sourceId === "adults") return "Adults";
		if (sourceId === "youtube") return "YouTube";
		if (sourceId === "twitch") return "Twitch";
		if (sourceId === "live") return "Live";
		return folders.find((f) => f.id === sourceId)?.name ?? "Library";
	}, [sourceId, folders]);
	const onAddFolder = (startIn, adult) => {
		pendingAdult.current = Boolean(adult);
		addFolder(dirInputRef.current, startIn, { adult }).catch((err) => {
			const message = err instanceof Error ? err.message : "Could not open folder";
			toast.error(/system files|system folder|not allowed/i.test(message) ? "Choose a media subfolder instead. Windows system folders cannot be cataloged; use Folder to pick Videos, Downloads, or a dedicated library folder." : message);
		});
	};
	const playlist = videos.map((v) => v.id);
	const playedAt = (0, import_react.useMemo)(() => {
		const map = {};
		for (const h of history) if (map[h.id] == null) map[h.id] = h.at;
		return map;
	}, [history]);
	const historyFilteredVideos = (0, import_react.useMemo)(() => {
		const cutoff = historyWindow === "day" ? Date.now() - 864e5 : historyWindow === "week" ? Date.now() - 6048e5 : 0;
		return historyWindow === "all" ? historyVideos : historyVideos.filter((video) => (playedAt[video.id] ?? 0) >= cutoff);
	}, [
		historyVideos,
		historyWindow,
		playedAt
	]);
	const browsing = !query && (sourceId === "home" || sourceId === "movies" || sourceId === "adults" || sourceId === "youtube" || sourceId === "twitch" || sourceId === "live");
	const lockedAdults = sourceId === "adults" && !adultsUnlocked;
	const invitedToTheater = typeof window !== "undefined" && /^RC[A-Z0-9]{4,12}$/.test((new URLSearchParams(window.location.search).get("room") ?? "").trim().toUpperCase());
	const isHubSection = [
		"photos",
		"spotify",
		"prints",
		"games",
		"shop",
		"streaming",
		"social",
		"watch-room",
		"settings",
		"stats",
		"genres",
		"assistant",
		"mission-plan",
		"connection",
		"find-phone"
	].includes(sourceId) || invitedToTheater;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "sticky top-0 hidden h-dvh w-60 shrink-0 overflow-y-auto border-r border-border bg-surface/80 px-3 py-5 lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarNav, { onAddFolder: (adult) => onAddFolder(void 0, adult) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: menuOpen,
				onOpenChange: setMenuOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "overflow-y-auto bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
						className: "sr-only",
						children: "Library menu"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarNav, {
						onAddFolder: (adult) => {
							setMenuOpen(false);
							onAddFolder(void 0, adult);
						},
						onNavigate: () => setMenuOpen(false)
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
					onMenu: () => setMenuOpen(true),
					onAddFolder: () => onAddFolder()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "w-full max-w-none flex-1 px-4 py-6 sm:px-6 xl:px-8 2xl:px-10",
					children: lockedAdults ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinGate, {}) : isHubSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						sourceId === "prints" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintsSection, {}),
						sourceId === "photos" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotosSection, {}),
						sourceId === "spotify" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpotifySection, {}),
						sourceId === "games" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GamesSection, {}),
						sourceId === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopSection, {}),
						sourceId === "streaming" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreamingSection, {}),
						sourceId === "social" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialSection, {}),
						(sourceId === "watch-room" || invitedToTheater) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchRoomSection, {}),
						sourceId === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {}),
						sourceId === "stats" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsSection, {}),
						sourceId === "connection" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanConnectionSection, {}),
						sourceId === "find-phone" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FindPhoneSection, {}),
						sourceId === "genres" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenreSection, {}),
						sourceId === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiGuide, {}),
						sourceId === "mission-plan" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissionPlanSection, {})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						sourceId === "home" && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryDesk, { videos }),
						!hasUserFolders && sourceId === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteStrip, {
							onAddFolder: () => onAddFolder(),
							onAddFiles: () => fileInputRef.current?.click(),
							onRecommended: (id) => onAddFolder(id)
						}),
						sourceId === "home" && !query && !follows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectPanel, { defaultKind: "youtube" }, "home-imports"),
						sourceId === "movies" && !query && (randomSourceMovies[0] || featured) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: randomSourceMovies[0] ?? featured }),
						sourceId === "adults" && adultsUnlocked && featured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: featured }),
						sourceId === "home" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Local picks rotate inside your taste matches, so the same few titles do not take over Home."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setHomePickShuffle(Date.now()),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Mix local picks"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Recently added from your folders",
								videos: homeLocalRecent,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Unseen & ready to discover",
								videos: freshPicks,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Top-rated local picks",
								videos: topRatedLocalPicks,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Live now",
								videos: liveVideos,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "New this week",
								videos: newThisWeek,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: follows.length ? "Latest from your channels" : "Fresh from YouTube",
								videos: homeLatestChannels,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mb-8",
								variant: "secondary",
								onClick: () => setHomeExpanded((value) => !value),
								children: homeExpanded ? "Show fewer home shelves" : "Show more home shelves"
							}),
							homeExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Continue watching",
									videos: continueVideos,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "From YouTube",
									videos: youtubeVideos.filter((video) => !video.isSample),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Twitch",
									videos: twitchVideos.filter((video) => !video.isSample && !isOfflineChannelCard(video)),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Every local source",
									videos: homeLocalRecent,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Favorites",
									videos: favoriteVideos,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Short films & quick watches",
									videos: videos.filter((video) => !video.isSample && (video.collection === "shorts" || (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1800)).slice(0, 18),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Browse by genre",
									videos: moviesByGenre.filter((video) => !video.isSample).slice(0, 24),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "History",
									videos: historyVideos,
									variant: "rail",
									playedAt
								}),
								publicFolders.slice(0, 12).map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `${folder.name} · local source`,
									videos: videos.filter((v) => v.folderId === folder.id).slice(0, 24),
									variant: "rail",
									onTitleClick: () => setSource(folder.id)
								}, folder.id))
							] })
						] }),
						sourceId === "youtube" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Discovery desk"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-2 font-display text-4xl text-fg",
										children: "YouTube, tuned to you."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 max-w-2xl text-sm text-muted",
										children: [
											"Fresh uploads are ordered by YouTube’s published date, not title. Alerts only fire for uploads published within the last 14 days, so importing an older channel does not flood your notices. ",
											follows.filter((channel) => channel.kind === "youtube").length,
											" channel",
											follows.filter((channel) => channel.kind === "youtube").length === 1 ? "" : "s",
											" tracked locally · ",
											youtubeVideos.length.toLocaleString(),
											" cached videos."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-accent",
										children: remoteCheckedAt ? `Automatic refresh last checked ${new Date(remoteCheckedAt).toLocaleTimeString([], {
											hour: "numeric",
											minute: "2-digit"
										})}` : "Automatic refresh will begin after the first channel check."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											disabled: channelRefreshing === "youtube-refresh",
											onClick: () => void (async () => {
												setChannelRefreshing("youtube-refresh");
												try {
													const result = await refreshFollows();
													pushNotice({
														title: "YouTube refresh complete",
														body: `${result.newVideos.filter((video) => video.remote?.kind === "youtube").length} new YouTube video${result.newVideos.filter((video) => video.remote?.kind === "youtube").length === 1 ? "" : "s"} found.`,
														kind: "youtube"
													});
												} finally {
													setChannelRefreshing("");
												}
											})(),
											children: channelRefreshing === "youtube-refresh" ? "Refreshing YouTube…" : "Refresh now"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "self-center text-xs text-muted",
											children: "Saved channels retry in rotating background batches; each result adds to this cached count."
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Latest uploads",
								videos: filteredYoutube,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Trending in your tracked channels",
								videos: trendingYoutube,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "New to you on YouTube",
								videos: freshPicks.filter((video) => video.remote?.kind === "youtube" && (youtubeTagFilter === "all" || (tags[video.id] ?? []).includes(youtubeTagFilter))),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "More from your rated YouTube",
								videos: relatedYoutube.filter((video) => youtubeTagFilter === "all" || (tags[video.id] ?? []).includes(youtubeTagFilter)),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Quick picks",
								videos: filteredYoutube.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1200),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: youtubeTagFilter === "all" ? "default" : "secondary",
									onClick: () => setYoutubeTagFilter("all"),
									children: "All tags"
								}), channelTagShelves.youtube.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: youtubeTagFilter === shelf.tag ? "default" : "secondary",
									onClick: () => setYoutubeTagFilter(shelf.tag),
									children: [
										"#",
										shelf.tag,
										" · ",
										shelf.videos.length
									]
								}, shelf.tag))]
							}),
							youtubeTagFilter !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "-mt-2 mb-5 text-xs text-accent",
								children: [
									"Filtering every YouTube shelf and the full catalog by #",
									youtubeTagFilter,
									" · ",
									filteredYoutube.length.toLocaleString(),
									" matching videos."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-6 rounded-xl border border-border bg-surface p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Creator discovery"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: "Outside your known follows."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Discovery stays in its own shelf so saved channels never get mixed with suggestions. Follow adds a channel to your saved refresh list."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
											title: "Explore new YouTube",
											videos: youtubeDiscovery,
											variant: "rail"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [
											["Kurzgesagt", "kurzgesagt"],
											["Veritasium", "veritasium"],
											["PBS Space Time", "pbsspacetime"]
										].filter(([, handle]) => !follows.some((channel) => channel.kind === "youtube" && channel.handle.toLowerCase() === handle)).map(([label, handle]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											disabled: channelRefreshing === handle,
											onClick: () => void (async () => {
												setChannelRefreshing(handle);
												try {
													await followRemoteQuery(handle, "youtube");
												} finally {
													setChannelRefreshing("");
												}
											})(),
											children: channelRefreshing === handle ? "Checking…" : `Follow ${label}`
										}, handle))
									})
								]
							}),
							[...new Set(newestYoutube.map((video) => video.remote?.channelName).filter(Boolean))].slice(0, 8).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `From ${channel}`,
								videos: newestYoutube.filter((video) => video.remote?.channelName === channel),
								variant: "rail"
							}, channel)),
							channelTagShelves.youtube.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `YouTube · ${shelf.tag}`,
								videos: shelf.videos,
								variant: "rail"
							}, `youtube-tag-${shelf.tag}`)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: filteredYoutube }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectPanel, {
								defaultKind: "youtube",
								lockedKind: "youtube"
							}, "youtube-imports")
						] }),
						sourceId === "twitch" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Live desk"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-2 font-display text-4xl text-fg",
										children: "Twitch, live first."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 max-w-2xl text-sm text-muted",
										children: [
											"Sort live streams and VODs by what matters right now. ",
											follows.filter((channel) => channel.kind === "twitch").length,
											" channel",
											follows.filter((channel) => channel.kind === "twitch").length === 1 ? "" : "s",
											" tracked locally. A different rotating batch checks every minute; a successful check removes stale live cards."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-accent",
										children: [
											remoteCheckedAt ? `Live state checked ${new Date(remoteCheckedAt).toLocaleTimeString([], {
												hour: "numeric",
												minute: "2-digit"
											})}` : "Live state has not been checked yet.",
											" · ",
											sortedTwitch.filter((video) => video.remote?.live).length,
											" live · ",
											twitchVodPicks.length,
											" VODs · ",
											twitchClips.length,
											" clips"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [
											[
												"live",
												"viewers",
												"name"
											].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: twitchSort === sort ? "default" : "secondary",
												onClick: () => setTwitchSort(sort),
												children: sort === "live" ? "Live first" : sort === "viewers" ? "Most viewers" : "A–Z"
											}, sort)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => void refreshFollows(),
												children: "Refresh next live batch"
											}),
											follows.filter((channel) => channel.kind === "twitch").slice(0, 12).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												disabled: channelRefreshing === channel.id,
												onClick: () => void (async () => {
													setChannelRefreshing(channel.id);
													try {
														await followRemoteQuery(channel.handle, "twitch");
													} finally {
														setChannelRefreshing("");
													}
												})(),
												children: channelRefreshing === channel.id ? "Checking…" : `Refresh ${channel.title}`
											}, channel.id))
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-5 flex flex-wrap gap-2",
								children: [
									["all", "All Twitch"],
									["favorites", "Favorites"],
									["likes", "Liked"]
								].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: twitchFilter === value ? "default" : "secondary",
									onClick: () => setTwitchFilter(value),
									children: [label, value === "all" ? "" : " · " + twitchVideos.filter((video) => value === "favorites" ? favorites[video.id] : likes[video.id]).length]
								}, value))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: twitchTagFilter === "all" ? "default" : "secondary",
									onClick: () => setTwitchTagFilter("all"),
									children: "All tags"
								}), channelTagShelves.twitch.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: twitchTagFilter === shelf.tag ? "default" : "secondary",
									onClick: () => setTwitchTagFilter(shelf.tag),
									children: [
										"#",
										shelf.tag,
										" · ",
										shelf.videos.length
									]
								}, shelf.tag))]
							}),
							twitchFilter === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorite Twitch videos",
								videos: favoriteTwitchPicks,
								variant: "rail"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Liked on Twitch · discovery",
								videos: likedTwitchPicks,
								variant: "rail"
							})] }) : null,
							twitchFilter !== "all" && !sortedTwitch.some((video) => twitchFilter === "favorites" ? favorites[video.id] : likes[video.id]) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-6 rounded-lg border border-border p-6 text-muted",
								children: "Nothing saved here yet. Use the heart or like action on a Twitch video to keep it here between visits."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: twitchFilter === "all" ? "Your Twitch mix" : twitchFilter === "favorites" ? "Your favorites" : "Your liked videos",
								videos: sortedTwitch.filter((video) => twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id])),
								variant: "rail"
							}),
							twitchFilter === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "New to you on Twitch",
								videos: freshPicks.filter((video) => video.remote?.kind === "twitch"),
								variant: "rail"
							}),
							twitchFilter === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Live",
									videos: sortedTwitch.filter((video) => video.remote?.live),
									variant: "rail"
								}),
								liveChannelVods.map(({ creator, vods }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `${creator} · recent VODs`,
									videos: vods,
									variant: "rail"
								}, creator)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Popular VODs",
									videos: twitchVodPicks,
									variant: "rail"
								}),
								twitchVodChannels.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mb-8 rounded-xl border border-border bg-surface p-5 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "VOD explorer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 font-display text-2xl text-fg",
											children: "Browse VODs by creator."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Channels rise through your plays, saves, likes, high ratings, and the tags those highly rated videos share."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-5 space-y-6",
											children: twitchVodChannels.map(({ creator, vods }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
												title: `${creator} · ${vods.length} VOD${vods.length === 1 ? "" : "s"}`,
												videos: vods,
												variant: "rail"
											}, `vod-explorer-${creator}`))
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Clips & quick watches",
									videos: twitchClips,
									variant: "rail"
								}),
								channelTagShelves.twitch.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `Twitch · ${shelf.tag}`,
									videos: shelf.videos,
									variant: "rail"
								}, `twitch-tag-${shelf.tag}`))
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: sortedTwitch.filter((video) => (twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id])) && (twitchTagFilter === "all" || (tags[video.id] ?? []).includes(twitchTagFilter))) }),
							!twitchVideos.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Add a channel from the follow manager below to fill this shelf."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectPanel, {
								defaultKind: "twitch",
								lockedKind: "twitch"
							}, "twitch-imports")
						] }),
						sourceId === "live" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveDesk, { videos: liveVideos }),
						sourceId === "movies" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex items-center justify-between gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
										className: "font-display text-4xl text-fg",
										children: ["Movies ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xl text-muted",
											children: movieCatalog.length
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Liked titles stay at the front. Change the order when you want a surprise."
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										size: "sm",
										onClick: () => setMovieShuffle(Date.now()),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Random pick"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										size: "sm",
										onClick: () => void restoreFolders(),
										children: "Reload local files"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "From your source folders",
								videos: randomSourceMovies,
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Random from your library",
								videos: randomSourceMovies,
								variant: "poster"
							}),
							movieTypeShelves.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `${shelf.type} files · ${shelf.videos.length}`,
								videos: shelf.videos,
								variant: "poster"
							}, shelf.type)),
							priorityMovieGenres.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `${shelf.genre} first`,
								videos: shelf.videos,
								variant: "poster"
							}, shelf.genre)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "All movies",
								videos: randomSourceMovies.filter((video) => !isClassicVideo(video)),
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Classic movies",
								videos: classics,
								variant: "poster"
							}),
							!movieCatalog.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-surface px-6 py-14 text-center shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl text-fg",
									children: "Your movie cache is warming up"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-2 max-w-md text-sm text-muted",
									children: "Local titles return here from the durable catalog even while a folder needs reconnection. Use Reload local files only if the source is missing from the sidebar."
								})]
							}),
							classics.length === 0 && videos.length === 0 ? null : null
						] }),
						sourceId === "adults" && adultsUnlocked && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-6 rounded-xl bg-elevated p-5 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
												children: "Private library"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
												className: "mt-2 font-display text-4xl text-fg",
												children: "Your shelves, your tags."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm text-muted",
												children: "Tags, history, and organization remain private to this browser. Edit a title’s tags from its preview or player."
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											disabled: !videos.length,
											onClick: () => {
												const choices = adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag));
												const pick = choices[Math.floor(Math.random() * choices.length)];
												if (pick) openVideo(pick.id);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Random private pick"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: adultTag === "All" ? "default" : "secondary",
											onClick: () => setAdultTag("All"),
											children: "All titles"
										}), adultTagNames.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: adultTag === tag ? "default" : "secondary",
											onClick: () => setAdultTag(tag),
											children: tag
										}, tag))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "self-center text-xs text-muted",
											children: "Sort"
										}), [
											"recent",
											"name",
											"favorites",
											"tagged",
											"played"
										].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: adultSort === sort ? "default" : "secondary",
											onClick: () => setAdultSort(sort),
											children: sort === "tagged" ? "Most tagged" : sort === "played" ? "Last played" : sort
										}, sort))]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-6 grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-surface p-4 shadow-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Private favorite links"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: "Reserved for your personally saved, consented links. Nothing is added or shared automatically."
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-surface p-4 shadow-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Recommended sites"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: "Reserved for future opt-in recommendations. Link sorting will stay separate from your private video catalog."
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateWebShortcuts, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Continue watching",
								videos: adultContinue,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorites",
								videos: adultFavorites,
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Most organized",
								videos: adultTagged,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Needs a tag",
								videos: adultNeedsTags,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Recently added",
								videos: [...videos].sort((a, b) => b.addedAt - a.addedAt).slice(0, 24),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: adultTag === "All" ? "All private titles" : `Tagged · ${adultTag}`,
								videos: adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag)),
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "History",
								videos: adultHistory,
								variant: "rail",
								playedAt
							}),
							adultFolders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: folder.name,
								videos: videos.filter((v) => v.folderId === folder.id),
								variant: "rail"
							}, folder.id)),
							adultFolders.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-surface px-6 py-14 text-center shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mx-auto size-6 text-muted" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 font-display text-2xl text-fg",
										children: "No private folders yet"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mx-auto mt-2 max-w-sm text-sm text-muted",
										children: "Add a private folder, or lock an existing source. Those titles stay off Home, Movies, and Favorites."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-5",
										onClick: () => onAddFolder(void 0, true),
										children: "Add private folder"
									})
								]
							})
						] }),
						sourceId === "favorites" && !query && favoriteVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl",
									children: "Favorites"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "Your list, on this computer. Saved titles remain here even when a source is temporarily unavailable."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-elevated p-3 shadow-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: "Saved titles"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-display text-2xl text-fg",
												children: favoriteVideos.length
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-elevated p-3 shadow-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: "Local favorites"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-display text-2xl text-fg",
												children: favoriteVideos.filter((video) => !video.remote).length
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-elevated p-3 shadow-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: "Provider favorites"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-display text-2xl text-fg",
												children: favoriteVideos.filter((video) => video.remote).length
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setSource("stats"),
											className: "rounded-md bg-elevated p-3 text-left shadow-border hover:bg-surface",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: "Recovery & export"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm font-medium text-accent",
												children: "Open favorite diagnostics →"
											})]
										})
									]
								})
							]
						}),
						sourceId === "favorites" && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 rounded-lg bg-elevated p-4 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: "Photo favorites stay with the photo library"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: "Open your saved photos in their optimized viewer without mixing large image assets into this video grid."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "mt-3",
									onClick: () => {
										localStorage.setItem("reelcase.photos.favorites-only", "true");
										setSource("photos");
									},
									children: "Open photo favorites"
								})
							]
						}),
						sourceId === "favorites" && !query && favoriteVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Continue your favorites",
								videos: favoriteVideos.filter((video) => {
									const mark = progress[video.id];
									return mark && mark.t > 0 && mark.t < mark.d;
								}),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorite movies",
								videos: favoriteVideos.filter((video) => !video.remote && !video.isSample),
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorite YouTube",
								videos: favoriteVideos.filter((video) => video.remote?.kind === "youtube"),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorite Twitch",
								videos: favoriteVideos.filter((video) => video.remote?.kind === "twitch"),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Most recently saved",
								videos: [...favoriteVideos].sort((a, b) => (progress[b.id]?.at ?? b.addedAt) - (progress[a.id]?.at ?? a.addedAt)),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-3 font-display text-xl text-fg sm:text-2xl",
								children: "Everything in My List"
							})
						] }),
						sourceId === "favorites" && !query ? favoriteVideos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: favoriteVideos })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface px-6 py-16 text-center shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl text-fg",
								children: "Nothing in Favorites"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-2 max-w-sm text-sm text-muted",
								children: "Heart a title or use My List on the billboard."
							})]
						}) : null,
						(sourceId === "history" || sourceId === "continue" || query || !browsing && sourceId !== "favorites" && sourceId !== "home" && sourceId !== "movies" && sourceId !== "adults" && sourceId !== "genres" && sourceId !== "stats" && sourceId !== "connection" && sourceId !== "find-phone") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-end justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl",
									children: query ? "Search" : heading
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: sourceId === "history" ? `${history.length} saved watch event${history.length === 1 ? "" : "s"} · ${historyLastDay} in the last 24 hours · no maximum · newest first` : scanning ? `Scanning ${scanning.folderName} · ${scanning.found} found` : `${videos.length} video${videos.length === 1 ? "" : "s"}`
								})] }), sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: historyWindow === "all" ? "default" : "secondary",
											onClick: () => setHistoryWindow("all"),
											children: "All time"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: historyWindow === "day" ? "default" : "secondary",
											onClick: () => setHistoryWindow("day"),
											children: "24 hours"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: historyWindow === "week" ? "default" : "secondary",
											onClick: () => setHistoryWindow("week"),
											children: "7 days"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											onClick: clearHistory,
											children: "Clear history"
										})
									]
								})]
							}),
							sourceId === "history" && historyTopTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 rounded-lg bg-elevated px-4 py-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Historical interests"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: historyTopTags.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-full border border-border px-2.5 py-1 text-xs text-muted",
										children: [
											"#",
											tag,
											" · ",
											count
										]
									}, tag))
								})]
							}),
							sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex flex-wrap gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-muted shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-fg",
											children: "Viewing record"
										}),
										" · ",
										historyRecovery.resumable,
										" resumable activity mark",
										historyRecovery.resumable === 1 ? "" : "s"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· ",
										historyRecovery.sources.progress,
										" playback"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· ",
										historyRecovery.sources.watchRoom,
										" Watch Room"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· ",
										historyRecovery.sources.open,
										" direct opens"
									] })
								]
							}),
							folders.find((folder) => folder.id === sourceId)?.photoCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-fg",
									children: [
										"This source also has ",
										folders.find((folder) => folder.id === sourceId)?.photoCount,
										" discovered photos."
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										const folder = folders.find((item) => item.id === sourceId);
										if (folder) localStorage.setItem("reelcase.photos.source-filter", folder.name);
										setSource("photos");
									},
									children: "Browse this source’s photos"
								})]
							}) : null,
							sourceId === "history" || sourceId === "continue" || query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoGrid, {
								videos: sourceId === "history" ? historyFilteredVideos : videos,
								playedAt: sourceId === "history" ? playedAt : void 0
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos })
						] }),
						sourceId === "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-8 text-center text-xs text-subtle",
							children: "Original shorts styled as classics. Add a folder to scan this computer."
						})
					] })
				})]
			}),
			activeId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, { playlist }),
			previewId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreVideo, {}),
			dragging && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg/80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface px-8 py-6 text-center shadow-border shadow-lift",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl text-fg",
						children: "Drop to add"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Folders or video files"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: dirInputRef,
				type: "file",
				multiple: true,
				className: "sr-only",
				tabIndex: -1,
				"aria-hidden": "true",
				webkitdirectory: "",
				directory: "",
				onChange: (e) => {
					const files = e.target.files;
					const adult = pendingAdult.current;
					pendingAdult.current = false;
					if (files?.length) ingestFromInput(files, true, { adult }).catch((err) => {
						toast.error(err instanceof Error ? err.message : "Could not read folder");
					});
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileInputRef,
				type: "file",
				multiple: true,
				accept: "video/*",
				className: "sr-only",
				tabIndex: -1,
				"aria-hidden": "true",
				onChange: (e) => {
					const files = e.target.files;
					if (files?.length) ingestFromInput(files, false).catch((err) => {
						toast.error(err instanceof Error ? err.message : "Could not read files");
					});
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "bottom-right",
				toastOptions: { classNames: {
					toast: "bg-elevated text-fg shadow-border border-0",
					title: "text-fg",
					description: "text-muted"
				} }
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryApp, {});
}
//#endregion
export { Home as component };
