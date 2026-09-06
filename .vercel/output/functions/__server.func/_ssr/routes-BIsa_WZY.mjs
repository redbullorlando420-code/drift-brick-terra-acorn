import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { $ as ExternalLink, A as Minimize, B as Lightbulb, C as Play, D as Music2, E as PackageSearch, F as Lock, G as History, H as Images, I as LockOpen, J as Gamepad2, K as Heart, L as LoaderCircle, M as Menu, N as Maximize, O as Monitor, P as Maximize2, Q as FileText, R as List, S as Radio, T as Pause, U as Image, V as LayoutGrid, W as ImagePlus, X as FolderPlus, Y as Folder, Z as Film, _ as Shuffle, a as VolumeX, at as ChevronRight, b as Search, c as Users, ct as Box, d as ThumbsUp, dt as BellOff, et as Download, f as Tag, ft as ArrowLeft, g as SkipBack, h as SkipForward, i as WandSparkles, it as CircleAlert, j as MessageCircle, k as MonitorPlay, l as Upload, lt as Bot, m as Sparkles, n as X, nt as Clock3, o as Volume2, ot as ChevronLeft, p as Star, q as Glasses, r as Wifi, rt as Clapperboard, s as Video, st as Check, t as Youtube, tt as Cpu, ut as Bell, v as ShoppingBag, w as PictureInPicture2, x as Rocket, y as Settings2, z as ListPlus } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as useShallow, t as create } from "../_libs/zustand.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
import { a as Trigger, i as Root2, n as Item2, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BIsa_WZY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		decorative,
		orientation,
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
		...props
	});
}
var DEMO_FOLDER_ID = "demo";
var YT_FOLDER_ID = "youtube:featured";
var DEMO_FOLDER = {
	id: DEMO_FOLDER_ID,
	name: "Classics",
	kind: "demo",
	videoCount: 4
};
var YT_FOLDER = {
	id: YT_FOLDER_ID,
	name: "YouTube",
	kind: "youtube",
	videoCount: 4
};
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
var FEATURED_YOUTUBE = [
	ytFilm({
		id: "aqz-KE-bpKQ",
		name: "Big Buck Bunny",
		year: 2008,
		duration: 596,
		genre: "Animation",
		tagline: "An open movie from the Blender Foundation.",
		channel: "Blender"
	}),
	ytFilm({
		id: "Y-rmzh0PI3c",
		name: "Cosmos Laundromat",
		year: 2015,
		duration: 720,
		genre: "Fantasy",
		tagline: "A down-on-his-luck sheep, and a deal.",
		channel: "Blender"
	}),
	ytFilm({
		id: "R6MlUcmOul8",
		name: "Tears of Steel",
		year: 2012,
		duration: 734,
		genre: "Sci-Fi",
		tagline: "Amsterdam, after the machines.",
		channel: "Blender"
	}),
	ytFilm({
		id: "UXqq0ZvbOnk",
		name: "Charge",
		year: 2022,
		duration: 720,
		genre: "Sci-Fi",
		tagline: "A Blender Studio open movie.",
		channel: "Blender Studio"
	}),
	ytFilm({
		id: "eRsGyueVLvQ",
		name: "Elephants Dream",
		year: 2006,
		duration: 650,
		genre: "Sci-Fi",
		tagline: "The first Blender open movie.",
		channel: "Blender"
	}),
	ytFilm({
		id: "YE7VzlLtp-4",
		name: "Sintel",
		year: 2010,
		duration: 888,
		genre: "Fantasy",
		tagline: "An open adventure from Blender.",
		channel: "Blender"
	}),
	ytFilm({
		id: "M0mLqG-E1xw",
		name: "Caminandes",
		year: 2013,
		duration: 120,
		genre: "Animation",
		tagline: "A short open-film journey.",
		channel: "Blender"
	}),
	ytFilm({
		id: "E9wCYsP4VfI",
		name: "Agent 327",
		year: 2017,
		duration: 210,
		genre: "Animation",
		tagline: "A Blender Studio open project.",
		channel: "Blender Studio"
	})
];
var SAMPLE_VIDEOS = [
	{
		id: "demo:night-rain",
		folderId: DEMO_FOLDER_ID,
		name: "Night Rain",
		path: "Night Rain.mp4",
		extension: "mp4",
		mime: "video/mp4",
		size: 6468106,
		duration: 6,
		addedAt: 1,
		isSample: true,
		src: "/samples/night-rain.mp4",
		year: 1947,
		genre: "Noir",
		tagline: "The city never dries.",
		collection: "classics",
		poster: "/posters/night-rain.jpg"
	},
	{
		id: "demo:empty-house",
		folderId: DEMO_FOLDER_ID,
		name: "Empty House",
		path: "Empty House.mp4",
		extension: "mp4",
		mime: "video/mp4",
		size: 3499342,
		duration: 6,
		addedAt: 2,
		isSample: true,
		src: "/samples/empty-house.mp4",
		year: 1961,
		genre: "Drama",
		tagline: "Something stayed behind.",
		collection: "classics",
		poster: "/posters/empty-house.jpg"
	},
	{
		id: "demo:golden-coast",
		folderId: DEMO_FOLDER_ID,
		name: "Golden Coast",
		path: "Golden Coast.mp4",
		extension: "mp4",
		mime: "video/mp4",
		size: 15807485,
		duration: 6,
		addedAt: 3,
		isSample: true,
		src: "/samples/golden-coast.mp4",
		year: 1958,
		genre: "Romance",
		tagline: "Light on the water.",
		collection: "classics",
		poster: "/posters/golden-coast.jpg"
	},
	{
		id: "demo:tungsten-reel",
		folderId: DEMO_FOLDER_ID,
		name: "Tungsten Reel",
		path: "Tungsten Reel.mp4",
		extension: "mp4",
		mime: "video/mp4",
		size: 4498613,
		duration: 6,
		addedAt: 4,
		isSample: true,
		src: "/samples/tungsten-reel.mp4",
		year: 1932,
		genre: "Studio",
		tagline: "The lamp still burns.",
		collection: "classics",
		poster: "/posters/tungsten-reel.jpg"
	}
];
var DB_NAME = "reelcase";
var STORE = "dirs";
var VIDEO_STORE = "videos";
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
		const req = indexedDB.open(DB_NAME, 2);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(VIDEO_STORE)) db.createObjectStore(VIDEO_STORE, { keyPath: "id" }).createIndex("folderId", "folderId", { unique: false });
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
		const tx = db.transaction([STORE, VIDEO_STORE], "readwrite");
		tx.objectStore(STORE).delete(id);
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
function normalize(raw) {
	const starred = raw.starred ?? [];
	const favorites = raw.favorites ?? starred;
	const sort = raw.sort ?? "name";
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
		} else if (handle.kind === "file" && isVideoFile(name)) try {
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
		categories[video.id] ?? "",
		...tags[video.id] ?? [],
		video.remote?.channelName ?? "",
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
/** Companion assets discovered in a source picker. File handles remain browser-private. */
var useSourceAssets = create((set) => ({
	photos: [],
	shortcuts: [],
	capture: (input) => set((state) => {
		const files = Array.from(input);
		const append = (current, next) => [...current, ...next.filter((file) => !current.some((saved) => `${saved.name}:${saved.lastModified}` === `${file.name}:${file.lastModified}`))].slice(-600);
		return {
			photos: append(state.photos, files.filter(imageFile)),
			shortcuts: append(state.shortcuts, files.filter(shortcutFile))
		};
	})
}));
var HISTORY_CAP = 250;
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
		notifyPush: s.notifyPush
	});
}
var persistTimer = null;
function persistSoon(get) {
	if (typeof window === "undefined") {
		persistNow(get);
		return;
	}
	if (persistTimer != null) return;
	persistTimer = setTimeout(() => {
		persistTimer = null;
		persistNow(get);
	}, 900);
}
function flushPersist(get) {
	if (persistTimer != null) {
		clearTimeout(persistTimer);
		persistTimer = null;
	}
	persistNow(get);
}
function mergeVideos(existing, incoming) {
	const map = new Map(existing.map((v) => [v.id, v]));
	for (const v of incoming) map.set(v.id, v);
	return Array.from(map.values());
}
function remoteMetadataTags(video) {
	return [...new Set([
		video.remote?.kind,
		video.remote?.channelName,
		video.genre,
		video.remote?.live ? "live" : "vod"
	].filter((value) => Boolean(value)).map((value) => value.trim()).filter(Boolean))].slice(0, 12);
}
function localNameTags(video) {
	const text = `${video.name} ${video.path}`.toLowerCase();
	const tags = [video.genre?.toLowerCase()];
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
		next[video.id] = [.../* @__PURE__ */ new Set([...next[video.id] ?? [], ...inferred])].slice(0, 12);
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
		view: prefs.view ?? "grid",
		sort: prefs.sort ?? "name",
		hideDemo: prefs.hideDemo ?? false,
		sourceId: prefs.sourceId === "adults" ? "home" : prefs.sourceId ?? "home",
		hardwareAccel: prefs.hardwareAccel ?? true,
		adultPinHash: prefs.adultPinHash ?? null,
		follows: prefs.follows?.length ? prefs.follows : STARTER_FOLLOWS,
		notices: prefs.notices ?? [],
		notifyPush: prefs.notifyPush ?? false
	};
}
function adultIdSet(folders) {
	return new Set(folders.filter((f) => f.adult).map((f) => f.id));
}
function isAdultVideo(video, folders) {
	return adultIdSet(folders).has(video.folderId);
}
var useLibrary = create((set, get) => ({
	folders: [DEMO_FOLDER, YT_FOLDER],
	videos: [...SAMPLE_VIDEOS, ...FEATURED_YOUTUBE],
	query: "",
	sort: "name",
	view: "grid",
	sourceId: "home",
	favorites: {},
	likes: {},
	tags: {},
	categories: {},
	progress: {},
	history: [],
	hideDemo: false,
	hardwareAccel: true,
	adultPinHash: null,
	adultsUnlocked: false,
	activeId: null,
	previewId: null,
	scanning: null,
	hydrated: false,
	follows: STARTER_FOLLOWS,
	notices: [],
	notifyPush: false,
	remoteBusy: false,
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
		persistNow(get);
	},
	toggleLike: (id) => {
		set((s) => {
			const likes = { ...s.likes };
			if (likes[id]) delete likes[id];
			else likes[id] = true;
			return { likes };
		});
		persistNow(get);
	},
	setVideoTags: (id, tags) => {
		set((s) => ({ tags: {
			...s.tags,
			[id]: [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 12)
		} }));
		persistNow(get);
	},
	setVideoCategory: (id, category) => {
		set((s) => ({ categories: {
			...s.categories,
			[id]: category.trim().slice(0, 40)
		} }));
		persistNow(get);
	},
	markProgress: (id, t, d) => {
		set((s) => ({ progress: {
			...s.progress,
			[id]: {
				t,
				d,
				at: Date.now()
			}
		} }));
		persistSoon(get);
	},
	recordPlay: (id) => {
		set((s) => {
			return { history: [{
				id,
				at: Date.now()
			}, ...s.history.filter((h) => h.id !== id)].slice(0, HISTORY_CAP) };
		});
		persistNow(get);
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
			delete favorites[id];
			delete likes[id];
			delete tags[id];
			delete categories[id];
			delete progress[id];
			return {
				videos: s.videos.filter((video) => video.id !== id),
				activeId: s.activeId === id ? null : s.activeId,
				previewId: s.previewId === id ? null : s.previewId,
				favorites,
				likes,
				tags,
				categories,
				progress,
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
		try {
			const videos = await ingestDirectoryHandle(handle, folderId, {
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
		const prefsState = applyPrefs({});
		const adultIds = new Set(loadPrefs()?.privateFolderIds ?? []);
		let cachedFolderIds = /* @__PURE__ */ new Set();
		set({
			...prefsState,
			hydrated: true
		});
		if (prefsState.follows?.length) get().refreshFollows();
		try {
			const catalog = await loadCatalogVideos();
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
						videoCount: counts.get(f.id) ?? f.videoCount
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
				set((s) => ({ folders: s.folders.map((folder) => folder.id === row.id ? {
					...folder,
					name: row.name,
					needsPermission: false
				} : folder) }));
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
							needsPermission: false
						} : f),
						scanning: null
					}));
					if (videos.length) await saveFolderVideos(row.id, videos).catch(() => void 0);
				} catch {
					set((s) => ({
						scanning: null,
						folders: [...s.folders.filter((f) => f.id !== row.id), {
							id: row.id,
							name: row.name,
							kind: "directory",
							videoCount: 0,
							needsPermission: true,
							adult
						}]
					}));
				}
			} else set((s) => ({ folders: [...s.folders.filter((f) => f.id !== row.id), {
				id: row.id,
				name: row.name,
				kind: "directory",
				videoCount: s.folders.find((f) => f.id === row.id)?.videoCount ?? 0,
				needsPermission: true,
				adult
			}] }));
		}
	},
	restoreOne: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle) return;
		if (!await requestDirPermission(handle)) return;
		const folder = get().folders.find((f) => f.id === folderId);
		const name = folder?.name ?? handle.name;
		set((s) => ({
			scanning: {
				found: 0,
				looked: 0,
				folderName: name
			},
			videos: s.videos.filter((v) => v.folderId !== folderId),
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
				needsPermission: false
			} : f),
			scanning: null,
			sourceId: folder?.adult ? "adults" : folderId
		}));
		if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
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
			const { followRemote } = await import("./api-BKi_C3gc.mjs");
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
					videos: mergeVideos(s.videos.filter((v) => v.folderId !== result.channel.id), result.videos),
					tags: {
						...s.tags,
						...Object.fromEntries(result.videos.map((video) => [video.id, [.../* @__PURE__ */ new Set([...s.tags[video.id] ?? [], ...remoteMetadataTags(video)])]]))
					},
					sourceId: result.channel.kind,
					remoteBusy: false
				};
			});
			persistNow(get);
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
		const savedHandles = new Set(get().follows.map((follow) => `${follow.kind}:${follow.handle.toLowerCase()}`));
		const seenQueries = /* @__PURE__ */ new Set();
		const unique = items.map((i) => ({
			query: i.query.trim(),
			kind: i.kind
		})).filter((i) => {
			const handle = i.query.replace(/^https?:\/\/(www\.)?(youtube\.com\/(@|channel\/)?|twitch\.tv\/)?/i, "").replace(/^@/, "").split(/[/?#]/)[0].toLowerCase();
			const key = `${i.kind}:${handle}`;
			if (!i.query || !handle || seenQueries.has(key) || savedHandles.has(key)) return false;
			seenQueries.add(key);
			return true;
		});
		if (!unique.length) return {
			ok: 0,
			failed: 0,
			failedQueries: []
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
		const chunk = 10;
		try {
			const { importChannels } = await import("./api-BKi_C3gc.mjs");
			for (let i = 0; i < unique.length; i += chunk) {
				const slice = unique.slice(i, i + chunk);
				const result = await importChannels({ data: { items: slice } });
				ok += result.ok.length;
				failed += result.failed;
				if (result.failedQueries?.length) failedQueries.push(...result.failedQueries);
				set((s) => {
					let follows = s.follows;
					let folders = s.folders;
					let videos = s.videos;
					for (const row of result.ok) {
						follows = [row.channel, ...follows.filter((f) => f.id !== row.channel.id)];
						const folder = {
							id: row.channel.id,
							name: row.channel.title,
							kind: row.channel.kind,
							videoCount: row.videos.length
						};
						folders = [...folders.filter((f) => f.id !== folder.id), folder];
						videos = mergeVideos(videos.filter((v) => v.folderId !== row.channel.id), row.videos);
					}
					return {
						follows,
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
			}
			persistNow(get);
			const added = get().follows.filter((f) => !existing.has(f.id)).length;
			get().pushNotice({
				title: `Imported ${added || ok} channel${(added || ok) === 1 ? "" : "s"}`,
				body: failed ? `${failed} could not be reached.` : "Latest uploads are on the shelves.",
				kind: unique[0]?.kind === "twitch" ? "twitch" : "youtube"
			});
			set({
				remoteBusy: false,
				importProgress: null,
				sourceId: unique[0]?.kind === "twitch" ? "twitch" : "youtube"
			});
			persistNow(get);
			return {
				ok,
				failed,
				failedQueries
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
			videos: s.videos.filter((v) => v.folderId !== id),
			sourceId: s.sourceId === id ? "home" : s.sourceId
		}));
		persistNow(get);
	},
	refreshFollows: async () => {
		const current = get().follows;
		if (!current.length) return {
			wentLive: [],
			newVideos: []
		};
		const beforeLive = new Set(get().videos.filter((v) => v.remote?.live).map((v) => v.id));
		const beforeIds = new Set(get().videos.map((v) => v.id));
		try {
			const { refreshRemotes } = await import("./api-BKi_C3gc.mjs");
			const result = await refreshRemotes({ data: { channels: current } });
			const followIds = new Set(result.channels.map((c) => c.id));
			set((s) => ({
				follows: result.channels,
				folders: [
					...s.folders.filter((f) => f.kind !== "youtube" && f.kind !== "twitch"),
					YT_FOLDER,
					...result.channels.map((c) => ({
						id: c.id,
						name: c.title,
						kind: c.kind,
						videoCount: result.videos.filter((v) => v.folderId === c.id).length
					}))
				],
				videos: [...s.videos.filter((v) => !v.remote || v.folderId === "youtube:featured" || !followIds.has(v.folderId)), ...result.videos]
			}));
			persistNow(get);
			return {
				wentLive: result.channels.filter((c) => c.live && !beforeLive.has(`tw:${c.handle}:live`) && !beforeLive.has(`tw:${c.handle.toLowerCase()}:live`)),
				newVideos: result.videos.filter((v) => !beforeIds.has(v.id) && v.remote?.kind === "youtube")
			};
		} catch {
			return {
				wentLive: [],
				newVideos: []
			};
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
	}
}));
function publicList(state) {
	const adult = adultIdSet(state.folders);
	let list = state.videos.filter((v) => !adult.has(v.folderId));
	if (state.hideDemo) list = list.filter((v) => !v.isSample);
	return list;
}
function adultList(state) {
	if (!state.adultsUnlocked) return [];
	const adult = adultIdSet(state.folders);
	return state.videos.filter((v) => adult.has(v.folderId));
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
function selectContinue(state, adult = false) {
	const items = scoped(state, adult).filter((v) => {
		const p = state.progress[v.id];
		if (!p || p.d <= 0) return false;
		const r = p.t / p.d;
		return r > .04 && r < .96;
	});
	items.sort((a, b) => (state.progress[b.id]?.at ?? 0) - (state.progress[a.id]?.at ?? 0));
	return items.slice(0, 12);
}
function selectFavorites(state, adult = false) {
	return scoped(state, adult).filter((v) => state.favorites[v.id]);
}
function selectHistory(state, adult = false) {
	const list = scoped(state, adult);
	const byId = new Map(list.map((v) => [v.id, v]));
	return state.history.map((h) => byId.get(h.id)).filter((v) => v != null).slice(0, 12);
}
function selectYoutube(state) {
	return publicList(state).filter((v) => v.remote?.kind === "youtube").sort((a, b) => b.addedAt - a.addedAt).slice(0, 18);
}
function selectTwitch(state) {
	return publicList(state).filter((v) => v.remote?.kind === "twitch").sort((a, b) => Number(b.remote?.live) - Number(a.remote?.live) || b.addedAt - a.addedAt).slice(0, 18);
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
	const favCount = useLibrary((s) => Object.keys(s.favorites).filter((id) => {
		const v = s.videos.find((x) => x.id === id);
		return v && !isAdultVideo(v, s.folders);
	}).length);
	const continueCount = useLibrary((s) => {
		return s.videos.filter((v) => {
			if (isAdultVideo(v, s.folders)) return false;
			const p = s.progress[v.id];
			if (!p || p.d <= 0) return false;
			const r = p.t / p.d;
			return r > .04 && r < .96 && !(s.hideDemo && v.isSample);
		}).length;
	});
	const historyCount = useLibrary((s) => {
		return s.history.filter((h) => {
			const v = s.videos.find((x) => x.id === h.id);
			return v && !isAdultVideo(v, s.folders) && !(s.hideDemo && v.isSample);
		}).length;
	});
	const adultCount = useLibrary((s) => {
		if (!s.adultsUnlocked) return void 0;
		return s.videos.filter((v) => isAdultVideo(v, s.folders)).length;
	});
	const ytCount = useLibrary((s) => s.videos.filter((v) => v.remote?.kind === "youtube").length);
	const twitchCount = useLibrary((s) => s.videos.filter((v) => v.remote?.kind === "twitch").length);
	const liveCount = useLibrary((s) => s.videos.filter((v) => v.remote?.live).length);
	const go = (id) => {
		setSource(id);
		onNavigate?.();
	};
	const publicFolders = folders.filter((f) => f.kind !== "demo" && f.kind !== "youtube" && f.kind !== "twitch" && !f.adult);
	const networkFolders = folders.filter((f) => (f.kind === "youtube" || f.kind === "twitch") && f.id !== "youtube:featured");
	const adultFolders = folders.filter((f) => f.adult);
	const demo = folders.find((f) => f.kind === "demo" && !hideDemo);
	const publicCount = videos.filter((v) => !isAdultVideo(v, folders) && !(hideDemo && v.isSample)).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-2 pt-1 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl leading-none tracking-tight text-fg",
					children: "Reelcase"
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
						count: publicCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "movies",
						onClick: () => go("movies"),
						icon: Film,
						label: "Movies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "youtube",
						onClick: () => go("youtube"),
						icon: Youtube,
						label: "YouTube",
						count: ytCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "twitch",
						onClick: () => go("twitch"),
						icon: Radio,
						label: "Twitch",
						count: twitchCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "live",
						onClick: () => go("live"),
						icon: Radio,
						label: "Live",
						count: liveCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "favorites",
						onClick: () => go("favorites"),
						icon: Heart,
						label: "Favorites",
						count: favCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "continue",
						onClick: () => go("continue"),
						icon: Clock3,
						label: "Continue",
						count: continueCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "history",
						onClick: () => go("history"),
						icon: History,
						label: "History",
						count: historyCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "adults",
						onClick: () => go("adults"),
						icon: adultsUnlocked ? LockOpen : Lock,
						label: "Adults",
						count: adultCount,
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
						active: sourceId === "settings",
						onClick: () => go("settings"),
						icon: Settings2,
						label: "Settings"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pb-2 text-xs font-medium tracking-wide text-subtle uppercase",
				children: "Sources"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-0.5 overflow-y-auto px-1",
				children: [
					demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === demo.id,
						onClick: () => go(demo.id),
						icon: Film,
						label: demo.name,
						count: demo.videoCount
					}),
					publicFolders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
						folder,
						active: sourceId === folder.id,
						onClick: () => {
							if (folder.needsPermission) restoreOne(folder.id);
							else go(folder.id);
						},
						onRemove: () => void removeFolder(folder.id),
						onToggleAdult: () => setFolderAdult(folder.id, true)
					}, folder.id)),
					networkFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 px-2 pb-1 text-xs font-medium tracking-wide text-subtle uppercase",
						children: "Following"
					}), networkFolders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
						folder,
						active: sourceId === folder.id,
						onClick: () => go(folder.id),
						onRemove: () => unfollow(folder.id),
						onToggleAdult: () => {},
						hideAdult: true
					}, folder.id))] }),
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
				children: [!hideAdult && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
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
				})]
			})
		})
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("h-11 w-full min-w-0 rounded-md bg-elevated px-3 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle", "focus-visible:shadow-border-hover focus-visible:ring-2 focus-visible:ring-ring/50", "disabled:cursor-not-allowed disabled:opacity-40", className),
		...props
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
	}
];
function TopBar({ onMenu, onAddFiles }) {
	const query = useLibrary((s) => s.query);
	const setQuery = useLibrary((s) => s.setQuery);
	const [draft, setDraft] = (0, import_react.useState)(query);
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		setDraft(query);
	}, [query]);
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
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 15e3);
		return () => window.clearInterval(id);
	}, []);
	const view = useLibrary((s) => s.view);
	const setView = useLibrary((s) => s.setView);
	const sort = useLibrary((s) => s.sort);
	const setSort = useLibrary((s) => s.setSort);
	const scanning = useLibrary((s) => s.scanning);
	const sourceId = useLibrary((s) => s.sourceId);
	const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Name";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: "lg:hidden",
					"aria-label": "Open menu",
					onClick: onMenu,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg leading-none lg:hidden",
					children: "Reelcase"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "search",
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter") setQuery(draft);
					},
					placeholder: "Search titles, channels, paths",
					className: "pl-9",
					"aria-label": "Search videos"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5" }), now.toLocaleTimeString([], {
							hour: "numeric",
							minute: "2-digit"
						})]
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
						onClick: onAddFiles,
						className: "hidden sm:inline-flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }), "Files"]
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
var MAX = 2;
var MAX_MEMORY_THUMBS = 360;
async function acquire() {
	if (active < MAX) {
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
		const timer = window.setTimeout(() => finish(null), 9e3);
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
	request: (video) => {
		const { byId, failed } = get();
		if (byId[video.id] || failed[video.id] || inflight.has(video.id)) return;
		if (video.remote && video.poster) {
			set((s) => ({ byId: {
				...s.byId,
				[video.id]: video.poster
			} }));
			return;
		}
		inflight.add(video.id);
		(async () => {
			await acquire();
			try {
				const { thumb, duration } = await capture(await resolvePlayUrl(video));
				inflight.delete(video.id);
				if (thumb) set((s) => {
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
				else set((s) => ({
					failed: {
						...s.failed,
						[video.id]: true
					},
					durations: duration && duration > 0 ? {
						...s.durations,
						[video.id]: duration
					} : s.durations
				}));
			} catch {
				inflight.delete(video.id);
				set((s) => ({ failed: {
					...s.failed,
					[video.id]: true
				} }));
			} finally {
				release();
			}
		})();
	}
}));
var EMPTY_TAGS$2 = [];
function VideoCard({ video, variant = "grid", index = 0, playedAt, className }) {
	const ref = (0, import_react.useRef)(null);
	const thumb = useThumbs((s) => s.byId[video.id]);
	const failed = useThumbs((s) => s.failed[video.id]);
	const capturedDur = useThumbs((s) => s.durations[video.id]);
	const request = useThumbs((s) => s.request);
	const progress = useLibrary((s) => s.progress[video.id]);
	const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
	const liked = useLibrary((s) => Boolean(s.likes[video.id]));
	const tags = useLibrary((s) => s.tags[video.id] ?? EMPTY_TAGS$2);
	const category = useLibrary((s) => s.categories[video.id] ?? "");
	const toggleLike = useLibrary((s) => s.toggleLike);
	const openPreview = useLibrary((s) => s.openPreview);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const duration = capturedDur ?? video.duration;
	const ratio = progress && progress.d > 0 ? Math.min(1, progress.t / progress.d) : 0;
	const playable = isLikelyPlayable(video.extension);
	const art = variant === "poster" ? video.poster || thumb : thumb || video.poster;
	const isPoster = variant === "poster";
	const live = Boolean(video.remote?.live);
	const preview = video.remote?.previewUrl;
	const [hovered, setHovered] = (0, import_react.useState)(false);
	const [imageFailed, setImageFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) request(video);
		}, { rootMargin: "160px" });
		io.observe(el);
		return () => io.disconnect();
	}, [request, video]);
	const poster = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-elevated", variant === "list" && "h-16 w-28 shrink-0 rounded-sm", variant === "poster" && "aspect-poster w-full rounded-md", (variant === "grid" || variant === "rail") && "aspect-video w-full rounded-md"),
		children: [
			art && !imageFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: hovered && preview ? preview : art,
				alt: "",
				onError: () => setImageFailed(true),
				className: "size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-elevated outline outline-1 -outline-offset-1 outline-fg/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-10 items-center justify-center rounded-full bg-bg/40 text-muted", !failed && "animate-pulse"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
				})
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
		className: cn("stagger-in group relative", isPoster && "poster-hit", className),
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
								] }) : null] }) : video.remote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: video.remote.channelName ?? video.remote.kind }) : video.year || video.genre ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [video.year ?? video.extension.toUpperCase(), video.genre && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": fav ? "Remove from favorites" : "Add to favorites",
				onClick: (e) => {
					e.stopPropagation();
					toggleFavorite(video.id);
				},
				className: cn("absolute top-2 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", fav && "opacity-100", variant === "list" && "top-3 right-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-3.5", fav && "fill-accent text-accent") })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": liked ? "Remove like" : "Like",
				onClick: (event) => {
					event.stopPropagation();
					toggleLike(video.id);
				},
				className: cn("absolute top-11 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", liked && "opacity-100", variant === "list" && "top-12 right-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: cn("size-3.5", liked && "fill-accent text-accent") })
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
function TitleRail({ title, videos, variant = "poster", playedAt }) {
	if (!videos.length) return null;
	const limit = typeof window === "undefined" ? 12 : Number(localStorage.getItem("reelcase.home-rail-limit") ?? "12");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 font-display text-xl text-fg sm:text-2xl",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4",
			children: videos.slice(0, [
				12,
				24,
				48
			].includes(limit) ? limit : 24).map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(variant === "poster" && "w-32 shrink-0 sm:w-36 md:w-40", variant === "rail" && "shrink-0"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
					video,
					variant,
					index: i,
					playedAt: playedAt?.[video.id]
				})
			}, video.id))
		})]
	});
}
function PosterGrid({ videos }) {
	if (!videos.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6",
		children: videos.slice(0, 240).map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
			video,
			variant: "poster",
			index: i,
			className: "w-full"
		}, video.id))
	});
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
	const [volume, setVolume] = (0, import_react.useState)(1);
	const [muted, setMuted] = (0, import_react.useState)(false);
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
	const enterVrTheater = (0, import_react.useCallback)(async () => {
		const xr = navigator.xr;
		if (!xr) {
			setVrStatus("VR needs Meta Quest Browser or another WebXR browser.");
			return;
		}
		try {
			const session = await xr.requestSession("immersive-vr", {
				optionalFeatures: ["local-floor", "dom-overlay"],
				domOverlay: { root: document.body }
			});
			setVrStatus("VR theater active — your video remains visible in the headset overlay. Use the headset system button to exit.");
			session.addEventListener("end", () => setVrStatus("VR theater closed."));
		} catch {
			setVrStatus("VR session was not started. Allow immersive VR in your headset browser, then try again.");
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
			if (!cancelled) setSrcError(err instanceof Error ? err.message : "Could not open file");
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
			if (mediaRef.current && !mediaRef.current.paused) setChrome(false);
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
			setLoadError(isLikelyPlayable(video?.extension ?? "") ? "This file could not be decoded." : `${(video?.extension ?? "this").toUpperCase()} often needs a desktop player.`);
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl text-fg",
					children: "Can’t play this file"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: srcError || loadError
				})]
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
	const [rating, setRating] = (0, import_react.useState)(0);
	const [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setTags(initialTags.join(", "));
		setCategory(initialCategory);
		try {
			setRating(Number(localStorage.getItem(`reelcase.rating.${videoId}`) ?? 0));
			setNote(localStorage.getItem(`reelcase.note.${videoId}`) ?? "");
		} catch {
			setRating(0);
			setNote("");
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
						setRating(value);
						localStorage.setItem(`reelcase.rating.${videoId}`, String(value));
					},
					className: cn("flex size-8 items-center justify-center rounded-sm text-sm shadow-border", value <= rating ? "bg-accent text-accent-fg" : "bg-elevated text-muted"),
					children: value
				}, value))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Private viewing note", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: note,
					onChange: (event) => setNote(event.target.value),
					placeholder: "Why save this? What to watch for?",
					className: "mt-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "w-full",
				onClick: () => {
					localStorage.setItem(`reelcase.note.${videoId}`, note.trim());
					onSave(tags.split(","), category);
				},
				children: "Save metadata"
			})
		]
	});
}
var EMPTY_TAGS = [];
function PreVideo() {
	const previewId = useLibrary((s) => s.previewId);
	const videos = useLibrary((s) => s.videos);
	const openVideo = useLibrary((s) => s.openVideo);
	const closePreview = useLibrary((s) => s.closePreview);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setVideoCategory = useLibrary((s) => s.setVideoCategory);
	const tags = useLibrary((s) => previewId ? s.tags[previewId] ?? EMPTY_TAGS : EMPTY_TAGS);
	const category = useLibrary((s) => previewId ? s.categories[previewId] ?? "" : "");
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [tagText, setTagText] = (0, import_react.useState)("");
	const [categoryText, setCategoryText] = (0, import_react.useState)("");
	const [vrAvailable, setVrAvailable] = (0, import_react.useState)(false);
	const [rating, setRating] = (0, import_react.useState)(0);
	const video = videos.find((item) => item.id === previewId);
	(0, import_react.useEffect)(() => {
		if (!previewId) return;
		setRating(Number(localStorage.getItem(`reelcase.rating.${previewId}`) ?? 0));
	}, [previewId]);
	(0, import_react.useEffect)(() => {
		const xr = navigator.xr;
		if (xr) xr.isSessionSupported("immersive-vr").then(setVrAvailable).catch(() => setVrAvailable(false));
	}, []);
	const related = (0, import_react.useMemo)(() => video ? videos.filter((item) => item.id !== video.id && (item.folderId === video.folderId || item.genre === video.genre)).slice(0, 8) : [], [video, videos]);
	const recommended = (0, import_react.useMemo)(() => video ? videos.filter((item) => item.id !== video.id && !related.some((relatedItem) => relatedItem.id === item.id)).sort((a, b) => Number(b.genre === video.genre) - Number(a.genre === video.genre) || b.addedAt - a.addedAt).slice(0, 6) : [], [
		related,
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
							}) : video.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: video.src,
								poster: video.poster,
								className: "aspect-video w-full bg-bg object-contain",
								muted: true,
								autoPlay: true,
								preload: "metadata",
								playsInline: true,
								controls: true
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
									className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
									children: ["Open official player ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									title: vrAvailable ? "Use Meta Quest Browser to enter VR" : "VR is available on a Meta Quest or other WebXR browser",
									onClick: () => {
										const xr = navigator.xr;
										if (!xr) {
											window.alert("Open this video in Meta Quest Browser or another WebXR-capable browser to enter VR theater.");
											return;
										}
										xr.requestSession("immersive-vr", {
											optionalFeatures: ["local-floor", "dom-overlay"],
											domOverlay: { root: document.body }
										}).catch(() => {});
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glasses, { className: "size-4" }), " VR theater"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => {
										setEditing((value) => !value);
										setTagText(tags.join(", "));
										setCategoryText(category);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" }), " Edit tags"]
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
								children: tags.length ? tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-xs bg-bg/50 px-2 py-1 text-xs text-muted",
									children: tag
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
											localStorage.setItem(`reelcase.rating.${video.id}`, String(value));
											setRating(value);
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
								className: "aspect-video w-full object-cover"
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
									className: "aspect-video w-full object-cover"
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
var askRecommendations = createServerFn({ method: "POST" }).validator((data) => {
	const value = data;
	return {
		prompt: typeof value?.prompt === "string" ? value.prompt.slice(0, 600) : "",
		catalog: typeof value?.catalog === "string" ? value.catalog.slice(0, 2400) : ""
	};
}).handler(createSsrRpc("3db7b453b5e2b488878187f97cc6eceef7379870b4d578ec6a567d8b62bd4f4b"));
function AiGuide() {
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const history = useLibrary((s) => s.history);
	const openPreview = useLibrary((s) => s.openPreview);
	const [prompt, setPrompt] = (0, import_react.useState)("What should I watch tonight?");
	const [answer, setAnswer] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const localPicks = (0, import_react.useMemo)(() => {
		const favoredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id]).flatMap((video) => tags[video.id] ?? []));
		const watched = new Set(history.map((entry) => entry.id));
		return [...videos].filter((video) => !watched.has(video.id)).sort((a, b) => {
			const aScore = (favorites[a.id] ? 3 : 0) + (likes[a.id] ? 2 : 0) + (tags[a.id] ?? []).filter((tag) => favoredTags.has(tag)).length;
			return (favorites[b.id] ? 3 : 0) + (likes[b.id] ? 2 : 0) + (tags[b.id] ?? []).filter((tag) => favoredTags.has(tag)).length - aScore || b.addedAt - a.addedAt;
		}).slice(0, 6);
	}, [
		favorites,
		history,
		likes,
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
		try {
			const catalog = videos.slice(0, 80).map((video) => `${video.name} | ${video.genre ?? ""} | ${(tags[video.id] ?? []).join(", ")} | ${favorites[video.id] ? "favorite" : ""} ${likes[video.id] ? "liked" : ""}`).join("\n");
			const result = await askRecommendations({ data: {
				prompt,
				catalog
			} });
			setAnswer(result.ok ? result.text : localAnswer());
		} catch {
			setAnswer(localAnswer());
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-3xl rounded-xl bg-surface p-5 shadow-border sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), "Personal AI guide"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-fg sm:text-5xl",
				children: "Ask your library."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted",
				children: "Automatic local picks learn from favorites, likes, tags, history, and the latest followed Twitch status without sending video files anywhere. The optional guide receives only a compact title, genre, and tag list when you ask it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl text-fg",
						children: "For you, locally"
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
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "size-5 text-accent" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-2 sm:grid-cols-2",
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
								video.genre ?? "Library pick",
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
					children: liveNow.slice(0, 4).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
					"aria-label": "Recommendation question"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: busy || !prompt.trim(),
					onClick: () => void ask(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), busy ? "Thinking…" : "Ask guide"]
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
					"A short open film",
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
	return [...new Set(value.split(/[\s,]+/).map((line) => line.trim()).filter(Boolean))].map((query) => ({
		query,
		kind
	}));
}
function ConnectPanel({ defaultKind = "youtube" }) {
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const importBatch = useLibrary((s) => s.importBatch);
	const remoteBusy = useLibrary((s) => s.remoteBusy);
	const importProgress = useLibrary((s) => s.importProgress);
	const follows = useLibrary((s) => s.follows);
	const [kind, setKind] = (0, import_react.useState)(defaultKind);
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
		try {
			const result = await importBatch(items);
			const saved = [.../* @__PURE__ */ new Set([...items.map((item) => item.query.trim()), ...savedLists])].slice(0, 200);
			localStorage.setItem(`reelcase.import-history.${kind}`, JSON.stringify(saved));
			setSavedLists(saved);
			localStorage.setItem(`reelcase.import-draft.${kind}`, bulk);
			setFound([]);
			if (result.failed && result.failedQueries?.length) toast.message(`${result.ok} added · ${result.failed} unavailable`, { description: result.failedQueries.slice(0, 8).join(", ") + (result.failedQueries.length > 8 ? "…" : "") });
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
			const { fetchTwitchFollowing } = await import("./api-BKi_C3gc.mjs");
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), " Network desk"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-3xl leading-none text-fg sm:text-4xl",
								children: "Make Home your live guide."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Bring in creators once. Reelcase groups fresh uploads, recent streams, and live channels in one watchable feed."
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
						label: "Add creators"
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
						label: "Import several at once"
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
						children: [savedLists.length, " channel entries retained locally for this service."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: savedLists.slice(0, 12).map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm bg-elevated px-2 py-1 text-xs text-muted",
							children: handle
						}, handle))
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
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		try {
			await this.pollOnce();
		} catch {}
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
		for (const slot of targets) if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
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
	const ref = (0, import_react.useRef)(null);
	const listeners = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (!room.trim()) {
			setJoined(false);
			setPeers([]);
			ref.current = null;
			return;
		}
		const p2p = new P2PRoom({
			room,
			selfId,
			name,
			onPeersChanged: setPeers,
			onConnected: () => setJoined(true),
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
		send: (0, import_react.useCallback)((data, peer) => ref.current?.send(data, peer), []),
		onMessage: (0, import_react.useCallback)((fn) => {
			listeners.current.add(fn);
			return () => {
				listeners.current.delete(fn);
			};
		}, [])
	};
}
var HUB_KEY = "reelcase.hub.v1";
var PREFERENCE_GROUPS = {
	Playback: [
		"Autoplay next video",
		"Resume playback",
		"Skip intros",
		"Skip credits",
		"Remember volume",
		"Default playback speed",
		"Prefer captions",
		"Caption styling",
		"Prefer dubbed audio",
		"Picture in picture",
		"Theater mode",
		"Dim room lights",
		"Hardware decode",
		"Data saver",
		"High quality on Wi-Fi",
		"Play trailers muted",
		"Ask before autoplay",
		"Loop short videos",
		"Show chapter markers",
		"Keep player controls visible"
	],
	Library: [
		"Show hidden files",
		"Group by folder",
		"Remember folder view",
		"Compact list view",
		"Show file paths",
		"Show file size",
		"Show media details",
		"Index new folders",
		"Hide duplicate titles",
		"Prefer poster artwork",
		"Show unwatched badge",
		"Show progress bar",
		"Show date added",
		"Show runtime",
		"Open preview before play",
		"Keep last search",
		"Search tags",
		"Search notes",
		"Search exact titles",
		"Clear recent searches"
	],
	Discovery: [
		"Local recommendations",
		"Use favorites for picks",
		"Use watch history for picks",
		"Use tags for picks",
		"Surface short films",
		"Surface live channels",
		"Show channel uploads",
		"Show random pick",
		"Refresh public channels",
		"Include open-source films",
		"Prefer familiar genres",
		"Try new genres",
		"Show trending shelf",
		"Show recently added",
		"Show because-you-watched",
		"Show top picks",
		"Show trailers",
		"Show creator details",
		"Show similar titles",
		"Hide already watched"
	],
	WatchRoom: [
		"Watch-room notices",
		"Room clock correction",
		"Send periodic timeline ticks",
		"Require guest consent",
		"Show guest ping",
		"Show connection quality",
		"Keep chat history",
		"Allow queue edits",
		"Auto play next queue item",
		"Default compact stage",
		"Remember stage size",
		"Share playback speed",
		"Pause when host leaves",
		"Show ready check",
		"Copy room code on create",
		"Allow reaction messages",
		"Show queue duration",
		"Show room activity",
		"Mute room notifications",
		"Show Roku handoff"
	],
	Privacy: [
		"Reduce motion",
		"Hide demo media",
		"Private search history",
		"Clear history on exit",
		"Lock adult library on exit",
		"Hide private titles from picks",
		"Keep notes local",
		"Keep tags local",
		"Ask before external links",
		"Ask before file sharing",
		"Do not preload remote media",
		"Mask local file paths",
		"Hide viewing activity",
		"Do not use watch history",
		"Do not use likes",
		"Do not use ratings",
		"Export metadata only",
		"Remember device permissions",
		"Show privacy reminders",
		"Reset local preferences"
	]
};
var PREFERENCES = Object.entries(PREFERENCE_GROUPS).flatMap(([group, labels]) => labels.map((label) => ({
	key: `${group}-${label}`.toLowerCase().replaceAll(" ", "-"),
	group,
	label,
	detail: `${group} preference saved locally.`
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
function SettingsSection() {
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	const [preferences, setPreferences] = (0, import_react.useState)({});
	const [preferenceGroup, setPreferenceGroup] = (0, import_react.useState)("Playback");
	const [zoom, setZoom] = (0, import_react.useState)(100);
	const [railLimit, setRailLimit] = (0, import_react.useState)(24);
	const [sourceCacheFirst, setSourceCacheFirst] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => setHub(readHub()), []);
	(0, import_react.useEffect)(() => {
		try {
			setPreferences(JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}"));
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
		const saved = Number(localStorage.getItem("reelcase.home-rail-limit") ?? "24");
		setRailLimit([
			12,
			24,
			48
		].includes(saved) ? saved : 24);
	}, []);
	(0, import_react.useEffect)(() => setSourceCacheFirst(localStorage.getItem("reelcase.source-cache-first") !== "false"), []);
	const setGlobalZoom = (value) => {
		setZoom(value);
		localStorage.setItem("reelcase.ui-zoom", String(value));
		document.documentElement.style.fontSize = `${value}%`;
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
				follows: state.follows,
				notices: state.notices,
				sourceCompanions: {
					photoNames: useSourceAssets.getState().photos.map((file) => file.name),
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-4 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-fg",
					children: "Export local metadata"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Downloads your catalog, favorites, likes, tags, watch history, follows, notifications, print list, and game list. Your original media and any browser file permissions remain private on this device."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: exportLocal,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export JSON"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2",
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
									12,
									24,
									48
								].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: railLimit === value ? "default" : "secondary",
									onClick: () => {
										setRailLimit(value);
										localStorage.setItem("reelcase.home-rail-limit", String(value));
									},
									children: [value, " per row"]
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "100 local preferences"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Organized controls for playback, library management, discovery, rooms, and privacy."
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
							onClick: () => togglePreference(item.key),
							className: "flex min-h-16 items-center justify-between gap-4 rounded-md bg-bg/45 px-4 text-left shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium text-fg",
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: item.detail
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `flex h-6 w-11 items-center rounded-full p-0.5 transition-[background-color] duration-150 ${preferences[item.key] ? "bg-accent justify-end" : "bg-surface justify-start"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-5 rounded-full ${preferences[item.key] ? "bg-accent-fg" : "bg-muted"}` })
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Music companion",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4" }),
		title: "Spotify, beside your library.",
		copy: "Keep music separate from video playback. Connect through Spotify’s official player or save a playlist link locally for your next listening session.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
						onClick: () => {
							localStorage.setItem("reelcase.spotify.playlist", playlistUrl.trim());
							setSaved(playlistUrl.trim());
						},
						children: "Save shortcut"
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
		})]
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
function PhotosSection() {
	const [photos, setPhotos] = (0, import_react.useState)([]);
	const [selectedPerson, setSelectedPerson] = (0, import_react.useState)("All photos");
	const [photoSearch, setPhotoSearch] = (0, import_react.useState)("");
	const [favoritesOnly, setFavoritesOnly] = (0, import_react.useState)(false);
	const [newestFirst, setNewestFirst] = (0, import_react.useState)(true);
	const [photoFolders, setPhotoFolders] = (0, import_react.useState)([]);
	const [slideshow, setSlideshow] = (0, import_react.useState)(false);
	const [slideIndex, setSlideIndex] = (0, import_react.useState)(0);
	const [helperNote, setHelperNote] = (0, import_react.useState)("");
	const [focusedPhotoId, setFocusedPhotoId] = (0, import_react.useState)(null);
	const [photoLimit, setPhotoLimit] = (0, import_react.useState)(80);
	const libraryFolders = useLibrary((s) => s.folders);
	const sourcePhotos = useSourceAssets((s) => s.photos);
	const sourceFolders = (0, import_react.useMemo)(() => libraryFolders.filter((folder) => folder.kind === "directory" || folder.kind === "files"), [libraryFolders]);
	const addPhotos = (files, folderName = "Unsorted") => {
		if (!files) return;
		const remembered = (() => {
			try {
				return JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}");
			} catch {
				return {};
			}
		})();
		const next = Array.from(files).filter((file) => file.type.startsWith("image/") || PHOTO_FILE_RE.test(file.name)).slice(0, 600).map((file) => ({
			id: `${file.name}-${file.lastModified}`,
			name: file.name,
			url: URL.createObjectURL(file),
			people: remembered[`${file.name}-${file.lastModified}`]?.people ?? [],
			album: remembered[`${file.name}-${file.lastModified}`]?.album ?? folderName,
			favorite: remembered[`${file.name}-${file.lastModified}`]?.favorite ?? false,
			rating: remembered[`${file.name}-${file.lastModified}`]?.rating ?? 0,
			addedAt: file.lastModified
		}));
		setPhotos((current) => [...current, ...next]);
	};
	(0, import_react.useEffect)(() => {
		if (sourcePhotos.length) addPhotos(sourcePhotos, "Source import");
	}, [sourcePhotos]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photo-meta.v1", JSON.stringify(Object.fromEntries(photos.map(({ id, people, album, favorite, rating }) => [id, {
				people,
				album,
				favorite,
				rating
			}]))));
		} catch {}
	}, [photos]);
	const addPhotoFolder = (files) => {
		if (!files?.length) return;
		const first = [...files].find((file) => file.webkitRelativePath)?.webkitRelativePath.split("/")[0] ?? "Photo folder";
		setPhotoFolders((folders) => folders.includes(first) ? folders : [...folders, first]);
		addPhotos(files, first);
	};
	const people = [...new Set(photos.flatMap((photo) => photo.people))];
	const albums = [...new Set(photos.map((photo) => photo.album))];
	const visible = photos.filter((photo) => (selectedPerson === "All photos" || photo.people.includes(selectedPerson)) && (!favoritesOnly || photo.favorite) && `${photo.name} ${photo.people.join(" ")} ${photo.album}`.toLowerCase().includes(photoSearch.toLowerCase())).sort((a, b) => newestFirst ? b.addedAt - a.addedAt : a.name.localeCompare(b.name));
	const renderedPhotos = visible.slice(0, photoLimit);
	(0, import_react.useEffect)(() => setPhotoLimit(80), [
		photoSearch,
		selectedPerson,
		favoritesOnly,
		newestFirst
	]);
	(0, import_react.useEffect)(() => {
		if (!slideshow || !visible.length) return;
		const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % visible.length), 5e3);
		return () => window.clearInterval(timer);
	}, [slideshow, visible.length]);
	const featuredPhoto = visible[slideIndex % Math.max(visible.length, 1)];
	const focusedIndex = visible.findIndex((photo) => photo.id === focusedPhotoId);
	const focusedPhoto = focusedIndex >= 0 ? visible[focusedIndex] : void 0;
	const moveFocus = (direction) => {
		if (!visible.length) return;
		const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + direction + visible.length) % visible.length;
		setFocusedPhotoId(visible[nextIndex].id);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Photo viewer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-4" }),
		title: "A private people shelf.",
		copy: "Add photos from this device, then group them by people yourself. Nothing uploads from this browser. Google Photos remains a separate, opt-in destination.",
		children: [
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
								placeholder: "Search names, people, albums",
								"aria-label": "Search photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: favoritesOnly ? "default" : "secondary",
								onClick: () => setFavoritesOnly((value) => !value),
								children: "Favorites"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setNewestFirst((value) => !value),
								children: newestFirst ? "Newest" : "A–Z"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: slideshow ? "default" : "secondary",
								onClick: () => setSlideshow((value) => !value),
								children: slideshow ? "Stop auto-change" : "Auto-change photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !visible.length,
								onClick: () => {
									const pick = visible[Math.floor(Math.random() * visible.length)];
									if (pick) {
										setSlideIndex(visible.findIndex((photo) => photo.id === pick.id));
										setFocusedPhotoId(pick.id);
									}
								},
								children: "Random photo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: suggestPeopleFromNames,
								children: "Suggest people labels"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Private helper: suggestions come from your photo file names only. Face recognition is not enabled, so no image leaves this device. Large folders are displayed in small batches to keep scrolling responsive."
					}),
					helperNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-accent",
						children: helperNote
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
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
					children: renderedPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-md bg-elevated shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "group relative block w-full",
							onClick: () => setFocusedPhotoId(photo.id),
							"aria-label": `Open ${photo.name} full screen`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: photo.url,
								alt: photo.name,
								className: "aspect-square w-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute inset-0 flex items-center justify-center bg-bg/45 opacity-0 transition-opacity group-hover:opacity-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-6 text-fg" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "min-w-0 flex-1 truncate text-sm text-fg",
										children: photo.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: photo.favorite ? "default" : "secondary",
										onClick: () => setPhotos((items) => items.map((item) => item.id === photo.id ? {
											...item,
											favorite: !item.favorite
										} : item)),
										children: "♥"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex gap-1",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: value <= photo.rating ? "default" : "secondary",
										onClick: () => setPhotos((items) => items.map((item) => item.id === photo.id ? {
											...item,
											rating: value
										} : item)),
										children: value
									}, value))
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
									placeholder: "Album, e.g. Summer 2026",
									value: photo.album,
									onChange: (event) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
										...item,
										album: event.target.value || "Unsorted"
									} : item))
								})
							]
						})]
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
					className: "fixed inset-0 z-50 flex items-center justify-center bg-bg/95 p-4",
					onClick: () => setFocusedPhotoId(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-full w-full max-w-7xl flex-col gap-3",
						onClick: (event) => event.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: focusedPhoto.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										focusedPhoto.album,
										" · ",
										focusedIndex + 1,
										" of ",
										visible.length
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setFocusedPhotoId(null),
								children: "Close"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative min-h-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: focusedPhoto.url,
									alt: focusedPhoto.name,
									className: "size-full object-contain"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "absolute top-1/2 left-2 -translate-y-1/2",
									onClick: () => moveFocus(-1),
									"aria-label": "Previous photo",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "absolute top-1/2 right-2 -translate-y-1/2",
									onClick: () => moveFocus(1),
									"aria-label": "Next photo",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
								})
							]
						})]
					})
				})
			] })
		]
	});
}
function GamesSection() {
	const [games, setGames] = (0, import_react.useState)([]);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [removeGame, setRemoveGame] = (0, import_react.useState)(null);
	const [launchNotice, setLaunchNotice] = (0, import_react.useState)("");
	const [shortcutView, setShortcutView] = (0, import_react.useState)("all");
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
		const source = Array.from(files).filter((file) => allowWebShortcut ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name) : /\.(exe|lnk|appref-ms)$/i.test(file.name));
		const next = await Promise.all(source.map(async (file) => {
			let launchUrl;
			if (/\.url$/i.test(file.name)) launchUrl = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic):\S+)/im)?.[1];
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
	const visible = games.filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()) && (shortcutView === "all" || (shortcutView === "web" ? Boolean(game.launchUrl) : !game.launchUrl)));
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
						"web",
						"desktop"
					].map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: shortcutView === view ? "default" : "secondary",
						onClick: () => setShortcutView(view),
						children: view === "all" ? "All" : view === "web" ? "Web launchers" : "Desktop launchers"
					}, view))
				]
			}),
			visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: visible.map((game) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg/50 text-accent",
						children: game.iconData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: game.iconData,
							alt: "",
							className: "size-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "size-6" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-base font-medium text-fg",
								children: game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 truncate text-xs text-muted",
								children: game.launchUrl ? "Web shortcut ready to launch" : game.path
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => {
											if (game.launchUrl) {
												window.location.assign(game.launchUrl);
												return;
											}
											setLaunchNotice(`${game.name} is a desktop launcher. Browsers block direct .exe/.lnk starts; use its desktop shortcut or add its web/Steam shortcut to launch it here.`);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), game.launchUrl ? "Launch shortcut" : "Launch desktop game"]
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
			name: "AliExpress",
			href: `https://www.aliexpress.com/wholesale?SearchText=${encoded}`,
			detail: "Search AliExpress"
		},
		{
			name: "Temu",
			href: `https://www.temu.com/search_result.html?search_key=${encoded}`,
			detail: "Search Temu"
		},
		{
			name: "eBay",
			href: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
			detail: "Search eBay"
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "Movie streaming",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Streaming destinations",
		copy: "Keep watch sources separate from shopping. These official services and public collections open in their own sites.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
				}
			].map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, { ...service }, service.name))
		})
	});
}
function SocialSection() {
	const [accounts, setAccounts] = (0, import_react.useState)([]);
	const [handle, setHandle] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			setAccounts(JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]"));
		} catch {
			setAccounts([]);
		}
	}, []);
	const add = () => {
		const next = [...new Set([...accounts, handle.trim().replace(/^@/, "")].filter(Boolean))].slice(0, 12);
		setAccounts(next);
		localStorage.setItem("reelcase.x-accounts", JSON.stringify(next));
		setActive(next.at(-1) ?? "");
		setHandle("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Social browser",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }),
		title: "X account shelf",
		copy: "Save public handles locally and browse a selected public profile in this workspace. Reelcase does not read credentials, messages, or account data.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: handle,
					onChange: (event) => setHandle(event.target.value),
					placeholder: "@account",
					"aria-label": "X account handle"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: !handle.trim(),
					onClick: add,
					children: "Add account"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-3",
				value: search,
				onChange: (event) => setSearch(event.target.value),
				placeholder: "Search your saved X accounts",
				"aria-label": "Search saved X accounts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: accounts.filter((account) => account.toLowerCase().includes(search.trim().toLowerCase())).length ? accounts.filter((account) => account.toLowerCase().includes(search.trim().toLowerCase())).map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setActive(account),
					className: `rounded-lg p-5 text-left shadow-border transition-[background-color,color,transform] duration-150 hover:-translate-y-0.5 ${active === account ? "bg-accent text-accent-fg" : "bg-elevated text-fg"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-2xl",
						children: ["@", account]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm opacity-70",
						children: "Browse public profile"
					})]
				}, account)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-lg bg-elevated px-4 py-8 text-sm text-muted shadow-border sm:col-span-2",
					children: "Add public handles to keep a local launch list."
				})
			}),
			active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 overflow-hidden rounded-lg bg-elevated shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-fg",
						children: ["Browsing @", active]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Local account view"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-h-48 items-center justify-center px-6 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl text-fg",
						children: "Saved account, kept in Reelcase"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-md text-sm text-muted",
						children: "Search and switch saved handles here without being sent elsewhere. X does not make public profile timelines available for reliable in-app embedding."
					})] })
				})]
			})
		]
	});
}
function WatchRoomSection() {
	const [roomCode, setRoomCode] = (0, import_react.useState)(() => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
	const [roomInput, setRoomInput] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("Host");
	const [activeRoom, setActiveRoom] = (0, import_react.useState)(null);
	const [joinedAsGuest, setJoinedAsGuest] = (0, import_react.useState)(false);
	const [guestAccess, setGuestAccess] = (0, import_react.useState)(false);
	const [localVideo, setLocalVideo] = (0, import_react.useState)(null);
	const [rokuAddress, setRokuAddress] = (0, import_react.useState)("");
	const [rokuReady, setRokuReady] = (0, import_react.useState)(false);
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
	const [friends, setFriends] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]");
			return Array.isArray(saved) ? saved.slice(0, 16) : [];
		} catch {
			return [];
		}
	});
	const videos = useLibrary((s) => s.videos);
	const [sharedVideoId, setSharedVideoId] = (0, import_react.useState)(() => videos.find((video) => Boolean(video.src || video.remote?.embedUrl))?.id ?? "");
	const sharedVideo = videos.find((video) => video.id === sharedVideoId);
	const roomVideoRef = (0, import_react.useRef)(null);
	const lastRoomTick = (0, import_react.useRef)(0);
	const p2p = useP2PRoom(activeRoom ?? "", name.trim() || "Guest");
	(0, import_react.useEffect)(() => {
		if (!p2p.peers.length) return;
		p2p.send({
			type: "room-state",
			playing: playback.playing,
			position: playback.position,
			videoId: sharedVideoId,
			queue
		});
	}, [p2p.peers.length]);
	(0, import_react.useEffect)(() => p2p.onMessage((from, raw) => {
		const data = raw;
		if (data.type === "chat" && data.text) setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
		if (data.type === "sync") setPlayback({
			playing: Boolean(data.playing),
			position: Number(data.position) || 0
		});
		if (data.type === "video" && data.videoId) setSharedVideoId(data.videoId);
		if (data.type === "queue" && Array.isArray(data.queue)) setQueue(data.queue);
		if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({
			...votes,
			[data.name]: Number(data.position) || 0
		}));
		if (data.type === "room-state") {
			if (data.videoId) setSharedVideoId(data.videoId);
			if (Array.isArray(data.queue)) setQueue(data.queue);
			setPlayback({
				playing: Boolean(data.playing),
				position: Number(data.position) || 0
			});
		}
	}), [p2p.onMessage]);
	const sync = (next) => {
		setPlayback(next);
		p2p.send({
			type: "sync",
			...next
		});
	};
	(0, import_react.useEffect)(() => {
		const media = roomVideoRef.current;
		if (!media || !sharedVideo || sharedVideo.remote) return;
		const driftLimit = playback.playing ? .65 : .1;
		if (Math.abs(media.currentTime - playback.position) > driftLimit) media.currentTime = playback.position;
		if (playback.playing && media.paused) media.play().catch(() => {});
		if (!playback.playing && !media.paused) media.pause();
	}, [playback, sharedVideo]);
	const chooseVideo = (video) => {
		setSharedVideoId(video.id);
		setPlayback({
			playing: false,
			position: 0
		});
		p2p.send({
			type: "video",
			videoId: video.id
		});
		p2p.send({
			type: "sync",
			playing: false,
			position: 0
		});
	};
	const updateQueue = (next) => {
		setQueue(next);
		p2p.send({
			type: "queue",
			queue: next
		});
	};
	const queueVideo = (video) => {
		if (video.id !== sharedVideoId && !queue.includes(video.id)) updateQueue([...queue, video.id]);
	};
	const playNext = () => {
		const nextId = queue[0];
		if (!nextId) return;
		const next = videos.find((video) => video.id === nextId);
		updateQueue(queue.slice(1));
		if (next) chooseVideo(next);
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
						className: "mt-5 w-full",
						onClick: () => {
							setJoinedAsGuest(false);
							setActiveRoom(roomCode);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }), " Start room"]
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
			className: "mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
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
								onClick: () => sync({
									...playback,
									playing: !playback.playing
								}),
								children: [playback.playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playback.playing ? "Pause" : "Play"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => sync({
									...playback,
									position: Math.max(0, playback.position - 15)
								}),
								children: "−15 sec"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => sync({
									...playback,
									position: playback.position + 15
								}),
								children: "+15 sec"
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
						className: `mt-3 mx-auto w-full overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "max-w-2xl" : stageSize === "theater" ? "max-w-4xl" : "max-w-5xl"}`,
						children: sharedVideo?.remote?.embedUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							title: sharedVideo.name,
							src: `${sharedVideo.remote.embedUrl}${sharedVideo.remote.embedUrl.includes("?") ? "&" : "?"}autoplay=0&rel=0`,
							className: "aspect-video w-full border-0",
							allow: "autoplay; encrypted-media; picture-in-picture",
							allowFullScreen: true
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
							children: "Choose a starter movie or an online video to show it to the room."
						})
					}),
					sharedVideo?.remote?.embedUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "Embedded services show the selected title for everyone; exact timestamp sync is available for local and library video files."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2 overflow-x-auto pb-2",
						children: videos.filter((video) => Boolean(video.src || video.remote?.embedUrl)).slice(0, 18).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => chooseVideo(video),
							className: `w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === sharedVideoId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`,
							children: [video.poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: video.poster,
								alt: "",
								className: "aspect-video w-full object-cover"
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
										className: "flex items-center justify-between gap-3 rounded-sm bg-elevated px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 truncate text-sm text-fg",
											children: [
												index + 1,
												". ",
												video?.name ?? "Unavailable title"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												disabled: index === 0,
												onClick: () => {
													const next = [...queue];
													[next[index - 1], next[index]] = [next[index], next[index - 1]];
													updateQueue(next);
												},
												children: "↑"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => updateQueue(queue.filter((item) => item !== id)),
												children: "Remove"
											})]
										})]
									}, id);
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Choose “Add next” below to build the shared queue."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex gap-2 overflow-x-auto pb-1",
								children: videos.filter((video) => Boolean(video.src || video.remote?.embedUrl) && video.id !== sharedVideoId).slice(0, 12).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: queue.includes(video.id),
									onClick: () => queueVideo(video),
									children: ["Add next · ", video.name]
								}, video.id))
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
									onChange: (event) => setLocalVideo(event.target.files?.[0] ?? null)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
									children: localVideo ? localVideo.name : "Choose local video"
								})]
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
								onClick: () => p2p.send({
									type: "share-ready",
									name: localVideo?.name
								}),
								children: "Send sharing request"
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: rokuAddress,
									onChange: (event) => {
										setRokuAddress(event.target.value);
										setRokuReady(false);
									},
									placeholder: "Roku IP address, e.g. 192.168.1.24",
									"aria-label": "Roku IP address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									disabled: !rokuAddress.trim(),
									onClick: () => {
										setRokuReady(true);
										localStorage.setItem("reelcase.roku", rokuAddress.trim());
									},
									children: "Save & pair TV"
								})]
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
		className: "mx-auto max-w-4xl rounded-xl bg-surface p-5 shadow-border sm:p-8",
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
function LibraryApp() {
	const dirInputRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const pendingAdult = (0, import_react.useRef)(false);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [movieShuffle, setMovieShuffle] = (0, import_react.useState)(0);
	const [adultTag, setAdultTag] = (0, import_react.useState)("All");
	const [adultSort, setAdultSort] = (0, import_react.useState)("recent");
	const [twitchSort, setTwitchSort] = (0, import_react.useState)("live");
	const restoreFolders = useLibrary((s) => s.restoreFolders);
	const openVideo = useLibrary((s) => s.openVideo);
	const addFolder = useLibrary((s) => s.addFolder);
	const ingestFromInput = useLibrary((s) => s.ingestFromInput);
	const ingestDrop = useLibrary((s) => s.ingestDrop);
	const clearHistory = useLibrary((s) => s.clearHistory);
	const folders = useLibrary((s) => s.folders);
	const sourceId = useLibrary((s) => s.sourceId);
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
	const youtubeVideos = useLibrary(useShallow(selectYoutube));
	const twitchVideos = useLibrary(useShallow(selectTwitch));
	const liveVideos = useLibrary(useShallow(selectLive));
	const adultContinue = useLibrary(useShallow((s) => selectContinue(s, true)));
	const adultFavorites = useLibrary(useShallow((s) => selectFavorites(s, true)));
	const adultHistory = useLibrary(useShallow((s) => selectHistory(s, true)));
	const hasUserFolders = userFolderCount(folders) > 0;
	const publicFolders = folders.filter((f) => f.kind !== "demo" && f.kind !== "youtube" && f.kind !== "twitch" && !f.adult);
	const adultFolders = folders.filter((f) => f.adult);
	const tags = useLibrary((s) => s.tags);
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const adultTagNames = (0, import_react.useMemo)(() => [...new Set(videos.flatMap((video) => tags[video.id] ?? []))].sort(), [tags, videos]);
	const moviesByGenre = (0, import_react.useMemo)(() => [...videos].filter((video) => Boolean(video.genre)).sort((a, b) => a.genre.localeCompare(b.genre)), [videos]);
	const priorityMovieGenres = (0, import_react.useMemo)(() => [
		"Comedy",
		"Action",
		"Horror",
		"Drama",
		"Documentary",
		"Science Fiction"
	].map((genre) => ({
		genre,
		videos: videos.filter((video) => video.genre?.toLowerCase() === genre.toLowerCase())
	})).filter((shelf) => shelf.videos.length > 0), [videos]);
	const adultSorted = (0, import_react.useMemo)(() => [...videos].sort((a, b) => adultSort === "name" ? a.name.localeCompare(b.name) : adultSort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt : b.addedAt - a.addedAt), [
		adultSort,
		favorites,
		videos
	]);
	const personalizedPicks = (0, import_react.useMemo)(() => {
		const watched = new Set(history.map((entry) => entry.id));
		const preferredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id]).flatMap((video) => tags[video.id] ?? []));
		return [...videos].filter((video) => !watched.has(video.id)).sort((a, b) => {
			const score = (video) => (favorites[video.id] ? 5 : 0) + (likes[video.id] ? 3 : 0) + (tags[video.id] ?? []).filter((tag) => preferredTags.has(tag)).length + (video.remote?.live ? 1 : 0);
			return score(b) - score(a) || b.addedAt - a.addedAt;
		});
	}, [
		favorites,
		history,
		likes,
		tags,
		videos
	]);
	const sortedTwitch = (0, import_react.useMemo)(() => [...twitchVideos].sort((a, b) => {
		if (twitchSort === "viewers") return (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || a.name.localeCompare(b.name);
		if (twitchSort === "name") return a.name.localeCompare(b.name);
		return Number(Boolean(b.remote?.live)) - Number(Boolean(a.remote?.live)) || (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || b.addedAt - a.addedAt;
	}), [twitchSort, twitchVideos]);
	const twitchVodPicks = (0, import_react.useMemo)(() => sortedTwitch.filter((video) => !video.remote?.live).sort((a, b) => (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || b.addedAt - a.addedAt), [sortedTwitch]);
	const twitchClips = (0, import_react.useMemo)(() => twitchVodPicks.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) <= 1200).slice(0, 24), [twitchVodPicks]);
	const relatedYoutube = (0, import_react.useMemo)(() => {
		const likedChannels = new Set(youtubeVideos.filter((video) => favorites[video.id] || likes[video.id]).map((video) => video.remote?.channelName).filter(Boolean));
		return youtubeVideos.filter((video) => likedChannels.has(video.remote?.channelName));
	}, [
		favorites,
		likes,
		youtubeVideos
	]);
	(0, import_react.useEffect)(() => {
		restoreFolders();
	}, [restoreFolders]);
	const refreshFollows = useLibrary((s) => s.refreshFollows);
	const pushNotice = useLibrary((s) => s.pushNotice);
	const follows = useLibrary((s) => s.follows);
	(0, import_react.useEffect)(() => {
		if (!follows.length) return;
		let cancelled = false;
		const tick = async () => {
			const { wentLive, newVideos } = await refreshFollows();
			if (cancelled) return;
			for (const ch of wentLive) pushNotice({
				title: `${ch.title} is live`,
				body: "Tap to watch in Reelcase.",
				kind: "twitch",
				videoId: `tw:${ch.handle}:live`
			});
			for (const v of newVideos.slice(0, 3)) pushNotice({
				title: v.name,
				body: v.remote?.channelName ?? "New on YouTube",
				kind: "youtube",
				videoId: v.id
			});
		};
		const id = window.setInterval(() => void tick(), 9e4);
		const first = window.setTimeout(() => void tick(), 250);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.clearTimeout(first);
		};
	}, [
		follows.length,
		refreshFollows,
		pushNotice
	]);
	const prevScanning = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const was = prevScanning.current;
		prevScanning.current = scanning;
		if (was && !scanning) {
			const n = useLibrary.getState().folders.find((f) => f.name === was.folderName)?.videoCount ?? 0;
			if (n === 0) toast.message(`No videos in ${was.folderName}`);
			else toast.success(`Found ${n} video${n === 1 ? "" : "s"} in ${was.folderName}`);
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
			toast.error(err instanceof Error ? err.message : "Could not open folder");
		});
	};
	const playlist = videos.map((v) => v.id);
	const playedAt = (0, import_react.useMemo)(() => {
		const map = {};
		for (const h of history) map[h.id] = h.at;
		return map;
	}, [history]);
	const browsing = !query && (sourceId === "home" || sourceId === "movies" || sourceId === "adults" || sourceId === "youtube" || sourceId === "twitch" || sourceId === "live");
	const lockedAdults = sourceId === "adults" && !adultsUnlocked;
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
		"assistant"
	].includes(sourceId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border bg-surface/80 px-3 py-5 lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarNav, { onAddFolder: (adult) => onAddFolder(void 0, adult) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: menuOpen,
				onOpenChange: setMenuOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "bg-surface p-4",
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
					onAddFiles: () => fileInputRef.current?.click()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6",
					children: lockedAdults ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinGate, {}) : isHubSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						sourceId === "prints" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintsSection, {}),
						sourceId === "photos" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotosSection, {}),
						sourceId === "spotify" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpotifySection, {}),
						sourceId === "games" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GamesSection, {}),
						sourceId === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopSection, {}),
						sourceId === "streaming" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreamingSection, {}),
						sourceId === "social" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialSection, {}),
						sourceId === "watch-room" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchRoomSection, {}),
						sourceId === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {}),
						sourceId === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiGuide, {})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						!hasUserFolders && sourceId === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteStrip, {
							onAddFolder: () => onAddFolder(),
							onAddFiles: () => fileInputRef.current?.click(),
							onRecommended: (id) => onAddFolder(id)
						}),
						(sourceId === "home" || sourceId === "youtube" || sourceId === "twitch") && !query && (sourceId !== "home" || !follows.length) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectPanel, { defaultKind: sourceId === "twitch" ? "twitch" : "youtube" }),
						sourceId === "home" && !query && featured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: featured }),
						sourceId === "movies" && !query && (classics[0] || featured) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: classics[0] ?? featured }),
						sourceId === "adults" && adultsUnlocked && featured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: featured }),
						sourceId === "home" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Live now",
								videos: liveVideos,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: follows.length ? "Latest from your channels" : "Fresh from YouTube",
								videos: [...youtubeVideos, ...twitchVideos].filter((video) => !video.remote?.live).sort((a, b) => b.addedAt - a.addedAt).slice(0, 32),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Continue watching",
								videos: continueVideos,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "From YouTube",
								videos: youtubeVideos,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Twitch",
								videos: twitchVideos,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Popular Twitch VODs",
								videos: twitchVodPicks,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Twitch clips & short watches",
								videos: twitchClips,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorites",
								videos: favoriteVideos,
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Classic movies",
								videos: classics,
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-8 rounded-xl bg-elevated p-5 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Recommendation loader"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: "For you, locally"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "This shelf refreshes from your likes, favorites, tags, and watch history. It stays on this device."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
											title: "Personalized picks",
											videos: personalizedPicks,
											variant: "poster"
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Because you liked classics",
								videos: [...videos].filter((video) => video.collection === "classics" || video.genre === "Drama" || video.genre === "Noir").slice(0, 18),
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Short films & quick watches",
								videos: videos.filter((video) => video.collection === "shorts" || (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1800).slice(0, 18),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Browse by genre",
								videos: moviesByGenre.slice(0, 24),
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "History",
								videos: historyVideos,
								variant: "rail",
								playedAt
							}),
							publicFolders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: folder.name,
								videos: videos.filter((v) => v.folderId === folder.id).slice(0, 24),
								variant: "rail"
							}, folder.id))
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
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 max-w-2xl text-sm text-muted",
										children: "Fresh uploads, short watches, and recommendations from channels you like stay together here."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Latest uploads",
								videos: youtubeVideos,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "More from channels you like",
								videos: relatedYoutube,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Quick picks",
								videos: youtubeVideos.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1200),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: youtubeVideos })
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
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 max-w-2xl text-sm text-muted",
										children: "Sort live streams and VODs by what matters right now."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [
											"live",
											"viewers",
											"name"
										].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: twitchSort === sort ? "default" : "secondary",
											onClick: () => setTwitchSort(sort),
											children: sort === "live" ? "Live first" : sort === "viewers" ? "Most viewers" : "A–Z"
										}, sort))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Twitch sorted",
								videos: sortedTwitch,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Live",
								videos: sortedTwitch.filter((video) => video.remote?.live),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Popular VODs",
								videos: twitchVodPicks,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Clips & quick watches",
								videos: twitchClips,
								variant: "rail"
							}),
							!twitchVideos.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Follow a channel above to fill this shelf."
							})
						] }),
						sourceId === "live" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: liveVideos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: liveVideos }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface px-6 py-16 text-center shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl text-fg",
								children: "Nobody you follow is live"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-2 max-w-sm text-sm text-muted",
								children: "Add Twitch channels. Reelcase checks them and pings Notifications when they go live."
							})]
						}) }),
						sourceId === "movies" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex items-center justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-4xl text-fg",
									children: "Movies"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: "Liked titles stay at the front. Change the order when you want a surprise."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									size: "sm",
									onClick: () => setMovieShuffle((value) => value + 1),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Random pick"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Classic movies",
								videos: classics,
								variant: "poster"
							}),
							priorityMovieGenres.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `${shelf.genre} first`,
								videos: shelf.videos,
								variant: "poster"
							}, shelf.genre)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "All movies",
								videos: [...videos.filter((v) => !isClassicVideo(v))].sort((a, b) => (a.id.charCodeAt(0) + movieShuffle * 17) % 29 - (b.id.charCodeAt(0) + movieShuffle * 17) % 29),
								variant: "poster"
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
											"favorites"
										].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: adultSort === sort ? "default" : "secondary",
											onClick: () => setAdultSort(sort),
											children: sort
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl",
								children: "Favorites"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Your list, on this computer."
							})]
						}),
						sourceId === "favorites" && !query ? favoriteVideos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: favoriteVideos }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface px-6 py-16 text-center shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl text-fg",
								children: "Nothing in Favorites"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-2 max-w-sm text-sm text-muted",
								children: "Heart a title or use My List on the billboard."
							})]
						}) : null,
						(sourceId === "history" || sourceId === "continue" || query || !browsing && sourceId !== "favorites" && sourceId !== "home" && sourceId !== "movies" && sourceId !== "adults") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl",
								children: query ? "Search" : heading
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: sourceId === "history" ? `${history.length} watched title${history.length === 1 ? "" : "s"} · ${historyLastDay} in the last 24 hours · newest first` : scanning ? `Scanning ${scanning.folderName} · ${scanning.found} found` : `${videos.length} video${videos.length === 1 ? "" : "s"}`
							})] }), sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: clearHistory,
								children: "Clear history"
							})]
						}), sourceId === "history" || sourceId === "continue" || query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoGrid, {
							videos,
							playedAt: sourceId === "history" ? playedAt : void 0
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos })] }),
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
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryApp, {});
}
//#endregion
export { createSsrRpc as n, routes_exports as t };
