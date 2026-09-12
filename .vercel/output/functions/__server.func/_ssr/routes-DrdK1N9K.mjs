import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { B as markAdultThumbFailed, C as adultTagRankBoost, D as adultThumbCandidatesForVideo, E as adultTextFetishTags, F as isAdultMetaTaxonomyTag, G as redditTitleTokens, H as mineRedditCommentTags, I as isAdultPullKind, J as warmAdultThumbUrls, L as isAdultThumbBlacklisted, M as findFreshAdultPullFingerprint, N as isAdultGenreTag, P as isAdultImageKind, R as isDecodedAdultThumbLikelyReal, S as adultSourceTag, T as adultTaxonomyTags, V as markAdultThumbGood, W as redditIngestExtras, a as ADULT_FOLDER_BY_PROVIDER, b as adultIngestTags, c as ADULT_PULL_PROVIDERS, i as ADULT_FEATURED_FETISH_TAGS, j as fetishSearchQuery, l as ADULT_SOURCE_OPTIONS, m as LIBRARY_LIMITS, n as ADULT_CURATED_FETISH_TAGS, o as ADULT_FOLDER_IDS, q as rememberAdultPullFingerprint, r as ADULT_EMBED_LINKS, s as ADULT_MILESTONE_LINKS, t as ADULT_CATEGORY_HUB, w as adultTaxonomyLabel, x as adultRemoteLabel, z as isUsableAdultThumb } from "./library-limits-D-UjAuZX.mjs";
import { n as create, t as useShallow } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { $ as FolderSearch, A as Monitor, B as List, C as RefreshCw, D as Pause, E as PictureInPicture2, F as Maximize, G as Images, J as History, K as Image, L as Lock, M as Minimize, N as MessageCircle, P as Menu, Q as Folder, R as LockOpen, T as Play, U as LayoutGrid, V as ListPlus, X as Glasses, Y as Heart, Z as Gamepad2, _ as Shuffle, _t as Box, a as Volume2, at as ExternalLink, b as Settings2, bt as BellOff, c as Upload, d as Tag, dt as CircleAlert, et as FolderPlus, f as Star, ft as ChevronRight, g as SkipBack, gt as ChartColumn, h as SkipForward, ht as Check, i as VolumeX, it as FileText, j as MonitorPlay, k as Music2, lt as Clock3, m as Smartphone, mt as ChevronDown, n as X, nt as Flag, o as Video, ot as Download, p as Sparkles, pt as ChevronLeft, r as Wifi, rt as Film, s as Users, st as Cpu, t as Youtube, tt as Flame, u as ThumbsUp, ut as Clapperboard, v as ShoppingBag, vt as Bot, w as Radio, x as Search, xt as ArrowLeft, yt as Bell, z as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
import { a as Trigger, i as Root2, n as Item2, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DrdK1N9K.js
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
var KEY$2 = "reelcase.adult-archive-cursors.v1";
function readRaw() {
	try {
		const raw = localStorage.getItem(KEY$2);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
function writeRaw(map) {
	try {
		localStorage.setItem(KEY$2, JSON.stringify(map));
	} catch {}
}
function slotKey(provider, query, order) {
	return `${provider}::${query.trim().toLowerCase() || "all"}::${order}`;
}
/** Load next-page cursors for the active query/order across providers. */
function loadAdultArchiveCursors(query, order) {
	const raw = readRaw();
	const out = {};
	for (const provider of ADULT_PULL_PROVIDERS) {
		const row = raw[slotKey(provider, query, order)];
		if (row && typeof row.page === "number" && row.page >= 1) out[provider] = row;
	}
	return out;
}
/** Persist the next page each provider should resume from. */
function saveAdultArchiveCursors(query, order, pages) {
	const raw = readRaw();
	const now = Date.now();
	for (const provider of ADULT_PULL_PROVIDERS) {
		const next = pages[provider];
		const key = slotKey(provider, query, order);
		if (next == null || next < 1) {
			delete raw[key];
			continue;
		}
		raw[key] = {
			page: next,
			query: query.trim().toLowerCase() || "all",
			order,
			updatedAt: now
		};
	}
	writeRaw(raw);
}
/** Summarize how deep the archive resume points go for UI copy. */
function adultArchiveDepthLabel(cursors) {
	const rows = Object.entries(cursors);
	if (!rows.length) return "No saved archive depth yet — Pull catalog starts at page 1.";
	return `Resume cursors · ${rows.sort((a, b) => a[0].localeCompare(b[0])).map(([provider, row]) => `${provider}→p${row.page}`).join(" · ")}`;
}
var DB_NAME = "reelcase";
var STORE = "dirs";
var VIDEO_STORE = "videos";
var SOURCE_HEALTH_STORE = "source-health";
var THUMB_STORE = "thumb-cache";
var ACTIVITY_STORE = "activity";
var ACTIVITY_JOURNAL_STORE = "activity-journal";
var PREFS_KEY = "reelcase.prefs.v4";
var LEGACY_KEYS = [
	"reelcase.prefs.v3",
	"reelcase.prefs.v2",
	"reelcase.prefs.v1"
];
var durablePrefs = null;
var prefsWrites = Promise.resolve();
async function restoreDurablePrefs() {
	const db = await openDb();
	try {
		const saved = await new Promise((resolve, reject) => {
			const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get("preferences");
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
		if (saved) durablePrefs = saved;
	} finally {
		db.close();
	}
}
var TAG_EDITS_KEY = "reelcase.tag-edits.v1";
var HISTORY_PENDING_KEY = "reelcase.history-pending.v1";
function readPending(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
	} catch {
		return fallback;
	}
}
function saveTagEdit(id, tags) {
	const edits = readPending(TAG_EDITS_KEY, {});
	edits[id] = tags;
	try {
		localStorage.setItem(TAG_EDITS_KEY, JSON.stringify(edits));
	} catch {}
}
function restoreTagEdits(tags) {
	return {
		...tags,
		...readPending(TAG_EDITS_KEY, {})
	};
}
function migrateSource(id) {
	if (!id || id === "all" || id === "starred") {
		if (id === "starred") return "favorites";
		return "home";
	}
	return id;
}
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 7);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("remote-cache")) db.createObjectStore("remote-cache");
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(VIDEO_STORE)) db.createObjectStore(VIDEO_STORE, { keyPath: "id" }).createIndex("folderId", "folderId", { unique: false });
			if (!db.objectStoreNames.contains(SOURCE_HEALTH_STORE)) db.createObjectStore(SOURCE_HEALTH_STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(THUMB_STORE)) db.createObjectStore(THUMB_STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(ACTIVITY_STORE)) db.createObjectStore(ACTIVITY_STORE);
			if (!db.objectStoreNames.contains(ACTIVITY_JOURNAL_STORE)) db.createObjectStore(ACTIVITY_JOURNAL_STORE, { keyPath: "key" });
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
/** Append-only playback journal: a snapshot write can never erase an earlier event. */
async function appendActivityJournal(entry) {
	const pending = readPending(HISTORY_PENDING_KEY, []);
	try {
		localStorage.setItem(HISTORY_PENDING_KEY, JSON.stringify([entry, ...pending].slice(0, 50)));
	} catch {}
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
			tx.objectStore(ACTIVITY_JOURNAL_STORE).put({
				key: entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`,
				entry
			});
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function loadActivityJournal() {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(ACTIVITY_JOURNAL_STORE, "readonly").objectStore(ACTIVITY_JOURNAL_STORE).getAll();
			req.onsuccess = () => resolve([...req.result.map((row) => row.entry).filter((entry) => Boolean(entry)), ...readPending(HISTORY_PENDING_KEY, [])]);
			req.onerror = () => reject(req.error);
		});
	} finally {
		db.close();
	}
}
async function clearActivityJournal() {
	try {
		localStorage.removeItem(HISTORY_PENDING_KEY);
	} catch {}
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
			tx.objectStore(ACTIVITY_JOURNAL_STORE).clear();
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function pruneActivityJournal(before) {
	try {
		localStorage.setItem(HISTORY_PENDING_KEY, JSON.stringify(readPending(HISTORY_PENDING_KEY, []).filter((entry) => entry.at >= before)));
	} catch {}
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
			const req = tx.objectStore(ACTIVITY_JOURNAL_STORE).openCursor();
			req.onsuccess = () => {
				const cursor = req.result;
				if (!cursor) return;
				const entry = cursor.value.entry;
				if (entry && entry.at < before) cursor.delete();
				cursor.continue();
			};
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
function asCountMap(raw) {
	if (!raw || typeof raw !== "object") return {};
	const out = {};
	for (const [id, value] of Object.entries(raw)) if (typeof value === "number" && Number.isFinite(value) && value > 0) out[id] = Math.floor(value);
	return out;
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
		resumeProgress: raw.resumeProgress ?? {},
		history: raw.history ?? [],
		viewCounts: asCountMap(raw.viewCounts),
		cameCounts: asCountMap(raw.cameCounts),
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
	if (durablePrefs) return durablePrefs;
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
	durablePrefs = prefs;
	prefsWrites = prefsWrites.catch(() => void 0).then(async () => {
		const db = await openDb();
		try {
			await new Promise((resolve, reject) => {
				const tx = db.transaction(ACTIVITY_STORE, "readwrite");
				tx.objectStore(ACTIVITY_STORE).put(prefs, "preferences");
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
				tx.onabort = () => reject(tx.error);
			});
		} finally {
			db.close();
		}
	});
	prefsWrites.catch(() => {
		try {
			localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
		} catch {
			window.dispatchEvent(new CustomEvent("reelcase:save-error"));
		}
	});
}
var LS_KEY = "reelcase.adult-preview-urls.v1";
var MAX_LS = 2400;
function readMap() {
	if (typeof localStorage === "undefined") return {};
	try {
		const raw = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
		return raw && typeof raw === "object" ? raw : {};
	} catch {
		return {};
	}
}
function writeMap(map) {
	if (typeof localStorage === "undefined") return;
	const rows = Object.entries(map).sort((a, b) => (b[1].at ?? 0) - (a[1].at ?? 0)).slice(0, MAX_LS);
	try {
		localStorage.setItem(LS_KEY, JSON.stringify(Object.fromEntries(rows)));
	} catch {}
}
function rememberAdultPreviewUrl(id, poster, previewUrl) {
	const goodPoster = poster && isUsableAdultThumb(poster) ? poster : void 0;
	const goodPreview = previewUrl && isUsableAdultThumb(previewUrl) ? previewUrl : goodPoster;
	if (!goodPoster && !goodPreview) return;
	const map = readMap();
	map[id] = {
		poster: goodPoster,
		previewUrl: goodPreview,
		at: Date.now()
	};
	writeMap(map);
	saveThumbCache({
		id,
		thumb: goodPoster ?? goodPreview ?? "",
		at: Date.now()
	}).catch(() => void 0);
}
/** Fill missing/broken incoming artwork from the durable URL cache. */
function applyCachedAdultUrls(videos) {
	const map = readMap();
	return videos.map((video) => {
		const cached = map[video.id];
		const posterOk = video.poster && isUsableAdultThumb(video.poster);
		const previewOk = video.remote?.previewUrl && isUsableAdultThumb(video.remote.previewUrl);
		if (posterOk && previewOk) return video;
		if (!cached?.poster && !cached?.previewUrl) return video;
		return {
			...video,
			poster: posterOk ? video.poster : cached.poster ?? video.poster,
			remote: video.remote ? {
				...video.remote,
				previewUrl: previewOk ? video.remote.previewUrl : cached.previewUrl ?? cached.poster ?? video.remote.previewUrl
			} : video.remote
		};
	});
}
function cacheAdultVideoUrls(videos) {
	for (const video of videos) rememberAdultPreviewUrl(video.id, video.poster, video.remote?.previewUrl);
}
/**
* Merge a provider refresh without letting a shallow public response erase a
* known Twitch archive. Twitch's public archive endpoint can legitimately
* return a partial window (or no rows while it is rate-limited), so archive
* rows are additive per channel. Fresh rows still win by id, and stale live
* cards are turned offline when their channel has checked successfully.
*/
function mergeRemoteRefresh(existing, incoming, refreshedIds, savedIds) {
	const refreshed = new Set(refreshedIds);
	const existingById = new Map(existing.map((video) => [video.id, video]));
	const fresh = new Map(incoming.map((video) => {
		const previous = existingById.get(video.id);
		const incomingObservation = video.remote?.observedAt ?? 0;
		const previousObservation = previous?.remote?.observedAt ?? 0;
		if (previous?.remote?.live && video.remote?.live && incomingObservation < previousObservation) return [video.id, previous];
		if (previous && previous.name === video.name && previous.path === video.path && previous.poster === video.poster && previous.genre === video.genre && previous.tagline === video.tagline && previous.description === video.description && previous.addedAt === video.addedAt && previous.duration === video.duration && JSON.stringify(previous.remote) === JSON.stringify(video.remote)) return [video.id, previous];
		return [video.id, video];
	}));
	return [...existing.filter((video) => {
		if (fresh.has(video.id) || !video.remote || !refreshed.has(video.folderId)) return !fresh.has(video.id);
		if (savedIds.has(video.id)) return true;
		return video.remote.kind === "twitch" && !video.remote.live;
	}).map((video) => video.remote?.live && refreshed.has(video.folderId) ? {
		...video,
		tagline: "Offline · saved channel",
		remote: {
			...video.remote,
			live: false
		}
	} : video), ...fresh.values()];
}
var samples = {
	navigation: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	},
	search: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	},
	rating: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	},
	playback: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	},
	queue: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	}
};
var lastStarted = {};
/** Records a local input-to-next-paint approximation without collecting media data. */
function measureInteraction(kind) {
	if (typeof window === "undefined" || typeof performance === "undefined") return;
	const now = performance.now();
	if (now - (lastStarted[kind] ?? -Infinity) < 120) return;
	lastStarted[kind] = now;
	window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
		const elapsed = Math.round(performance.now() - now);
		const sample = samples[kind];
		sample.count += 1;
		sample.lastMs = elapsed;
		sample.worstMs = Math.max(sample.worstMs, elapsed);
		sample.at = Date.now();
	}));
}
function getInteractionBudgetSnapshot() {
	return Object.fromEntries(Object.entries(samples).map(([kind, sample]) => [kind, { ...sample }]));
}
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
/** Old cached viewer counts are intentionally not treated as current demand. */
function hasFreshViewerCount(remote, now = Date.now()) {
	return Boolean(remote && typeof remote.viewers === "number" && Number.isFinite(remote.viewers) && remote.viewers >= 0 && typeof remote.observedAt === "number" && now >= remote.observedAt && now - remote.observedAt <= 3e5);
}
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
	if (opts.imagesOnly) {
		await walkImagesBreadthFirst(dir, dir.name, opts, drive);
		return acc;
	}
	await walkHandle(dir, "", folderId, acc, dir.name, opts, flushed, 0, drive);
	if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
	return acc;
}
async function walkImagesBreadthFirst(root, folderName, opts, drive) {
	const maxDepth = drive ? MAX_DRIVE_DEPTH : MAX_DEPTH;
	const queue = [{
		dir: root,
		prefix: "",
		depth: 0
	}];
	let cursor = 0;
	let found = 0;
	let looked = 0;
	const progress = {
		lastAt: 0,
		lastFound: 0
	};
	while (cursor < queue.length && !aborted(opts.signal)) {
		const { dir, prefix, depth } = queue[cursor++];
		if (depth > maxDepth) continue;
		const iterable = dir;
		if (typeof iterable.entries !== "function") continue;
		for await (const [name, handle] of iterable.entries()) {
			if (aborted(opts.signal)) return;
			looked += 1;
			if (handle.kind === "directory") {
				if (!shouldSkipDir(name)) queue.push({
					dir: handle,
					prefix: `${prefix}${name}/`,
					depth: depth + 1
				});
			} else if (handle.kind === "file" && /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(name)) try {
				const file = await handle.getFile();
				found += 1;
				opts.onImage?.(file, prefix + name);
				throttleProgress(opts, progress, {
					found,
					looked,
					folderName,
					current: prefix + name
				});
				if (found % 8 === 0) await yieldUi();
			} catch {}
			if (looked % 160 === 0) await yieldUi();
		}
	}
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
var KEY$1 = "reelcase.rating-streaks.v1";
var GOAL_KEY = "reelcase.rating-weekly-goal.v1";
var DEFAULT_WEEKLY_GOAL = 5;
var RATING_GOALS = [
	3,
	5,
	10
];
function weeklyGoal() {
	try {
		const saved = Number(localStorage.getItem(GOAL_KEY) ?? DEFAULT_WEEKLY_GOAL);
		return RATING_GOALS.includes(saved) ? saved : DEFAULT_WEEKLY_GOAL;
	} catch {
		return DEFAULT_WEEKLY_GOAL;
	}
}
function setRatingWeeklyGoal(goal) {
	if (!RATING_GOALS.includes(goal) || typeof window === "undefined") return;
	try {
		localStorage.setItem(GOAL_KEY, String(goal));
	} catch {}
	window.dispatchEvent(new Event("reelcase:rating-streak-change"));
}
function dayKey(at = /* @__PURE__ */ new Date()) {
	return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
}
function weekKey(at = /* @__PURE__ */ new Date()) {
	const date = new Date(at);
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	const firstThursday = new Date(date.getFullYear(), 0, 4);
	const week = 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 864e5 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
	return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
function read$1() {
	try {
		const saved = JSON.parse(localStorage.getItem(KEY$1) ?? "[]");
		return Array.isArray(saved) ? saved.filter((row) => typeof row?.day === "string" && Array.isArray(row?.ids)).slice(-400) : [];
	} catch {
		return [];
	}
}
function write$1(days) {
	try {
		localStorage.setItem(KEY$1, JSON.stringify(days.slice(-400)));
	} catch {}
}
function recordRatingForStreak(id, rating) {
	if (!id || rating < 1 || typeof window === "undefined") return;
	const days = read$1();
	const today = dayKey();
	const row = days.find((entry) => entry.day === today);
	if (row) {
		if (!row.ids.includes(id)) row.ids.push(id);
	} else days.push({
		day: today,
		ids: [id]
	});
	write$1(days);
	window.dispatchEvent(new Event("reelcase:rating-streak-change"));
}
function getRatingStreakSnapshot(now = /* @__PURE__ */ new Date()) {
	const days = read$1();
	const weeklyGoalValue = weeklyGoal();
	const currentWeek = weekKey(now);
	const weekTotals = /* @__PURE__ */ new Map();
	for (const row of days) {
		const key = weekKey(/* @__PURE__ */ new Date(`${row.day}T12:00:00`));
		weekTotals.set(key, (weekTotals.get(key) ?? 0) + new Set(row.ids).size);
	}
	const thisWeek = weekTotals.get(currentWeek) ?? 0;
	let weeklyStreak = 0;
	const cursor = new Date(now);
	while (true) {
		if ((weekTotals.get(weekKey(cursor)) ?? 0) < weeklyGoalValue) break;
		weeklyStreak += 1;
		cursor.setDate(cursor.getDate() - 7);
	}
	const rewards = [
		{
			label: "First impression",
			earned: thisWeek >= 1,
			detail: "Rate one title this week."
		},
		{
			label: "Weekly curator",
			earned: thisWeek >= weeklyGoalValue,
			detail: `Rate ${weeklyGoalValue} distinct titles this week.`
		},
		{
			label: "Two-week rhythm",
			earned: weeklyStreak >= 2,
			detail: "Complete your weekly goal two weeks in a row."
		}
	];
	const next = rewards.find((reward) => !reward.earned);
	return {
		weekKey: currentWeek,
		thisWeek,
		weeklyGoal: weeklyGoalValue,
		weeklyStreak,
		nextReward: next ? next.detail : "All current local rewards earned.",
		rewards
	};
}
var KEY = "reelcase.media-feedback.v1";
var cached = null;
var changeTimer;
var persistTimer$1;
var lastRatingQueueMs = 0;
var lastPersistMs = 0;
var pendingWrites = 0;
var legacyRatings = /* @__PURE__ */ new Map();
function read() {
	if (cached) return cached;
	try {
		const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
		cached = {
			ratings: saved.ratings ?? {},
			ratingHistory: saved.ratingHistory ?? {},
			notes: saved.notes ?? {},
			creatorRatings: saved.creatorRatings ?? {},
			creatorLikes: saved.creatorLikes ?? {},
			tagLikes: saved.tagLikes ?? {}
		};
	} catch {
		cached = {
			ratings: {},
			ratingHistory: {},
			notes: {},
			creatorRatings: {},
			creatorLikes: {},
			tagLikes: {}
		};
	}
	return cached;
}
function persist() {
	persistTimer$1 = void 0;
	const started = typeof performance !== "undefined" ? performance.now() : Date.now();
	try {
		if (cached) localStorage.setItem(KEY, JSON.stringify(cached));
	} catch {} finally {
		lastPersistMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
		pendingWrites = 0;
	}
}
/** Finish a queued rating write before a reload, tab close, or mobile app switch. */
function flush() {
	if (persistTimer$1 !== void 0) window.clearTimeout(persistTimer$1);
	persist();
}
if (typeof window !== "undefined") {
	window.addEventListener("pagehide", flush);
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") flush();
	});
}
function write(next) {
	cached = next;
	if (typeof window === "undefined") return;
	pendingWrites = 1;
	if (persistTimer$1) window.clearTimeout(persistTimer$1);
	persistTimer$1 = window.setTimeout(persist, 90);
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
	if (typeof window === "undefined") return 0;
	const known = legacyRatings.get(id);
	if (known !== void 0) return known;
	let legacy = 0;
	try {
		legacy = Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0);
	} catch {}
	const rating = Number.isFinite(legacy) ? legacy : 0;
	legacyRatings.set(id, rating);
	return rating;
}
function setRating(id, rating) {
	const started = typeof performance !== "undefined" ? performance.now() : Date.now();
	const next = read();
	next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
	next.ratingHistory[id] = {
		rating: next.ratings[id],
		updatedAt: Date.now()
	};
	legacyRatings.set(id, next.ratings[id]);
	recordRatingForStreak(id, next.ratings[id]);
	write(next);
	notifyChange();
	lastRatingQueueMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
}
/** Local timing only. This never transmits library feedback or usage data. */
function getFeedbackDiagnostics() {
	return {
		lastRatingQueueMs,
		lastPersistMs,
		pendingWrites
	};
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
		version: 4,
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
var TOPICS = /* @__PURE__ */ new Set([
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
	"legal",
	"animation",
	"documentary",
	"history",
	"true-crime",
	"photography",
	"art",
	"design",
	"family",
	"animals",
	"lifestyle",
	"beauty",
	"fashion",
	"home",
	"outdoors",
	"space",
	"environment",
	"politics",
	"finance"
]);
var aliases = {
	tech: "technology",
	coding: "technology",
	programming: "technology",
	cooking: "food",
	recipes: "food",
	automotive: "motors",
	cars: "motors",
	diy: "maker",
	education: "learning",
	meditation: "wellbeing",
	football: "sports",
	podcast: "talk",
	photos: "photography",
	photo: "photography",
	artworks: "art",
	documentaries: "documentary",
	truecrime: "true-crime",
	pets: "animals",
	makeup: "beauty",
	skincare: "beauty",
	investing: "finance",
	money: "finance",
	hiking: "outdoors"
};
function canonicalTopic(tag) {
	const clean = tag.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
	return TOPICS.has(clean) ? clean : aliases[clean];
}
var isTopicTag = (tag) => Boolean(canonicalTopic(tag));
var rules = [
	["gaming", /\b(gaming|gameplay|playthrough|speedrun|walkthrough|minecraft|fortnite|valorant|counter.strike|grand theft auto|gta [v56]|call of duty|cod zombies|zombies|elden ring|roblox|league of legends|streamer games|nba 2k\d*|cozy games|\barc\b)\b/i],
	["technology", /\b(software|programming|coding|artificial intelligence|machine learning|linux|javascript)\b/i],
	["hardware", /\b(pc build|graphics card|gpu|cpu|keyboard|smartphone|iphone|computer hardware)\b/i],
	["motors", /\b(dash.?cam|tesla.?cam|car repair|motorcycle|automotive|formula (one|1)|nascar|simucube|racing rig)\b/i],
	["legal", /\b(police chase|body.?cam|courtroom|lawsuit|trial verdict)\b/i],
	["food", /\b(cooking|recipe|baking|restaurant|street food|chef|cake|cake decorating)\b/i],
	["travel", /\b(travel|vacation|bali|backpacking|road trip|walking tour|pool party)\b/i],
	["music", /\b(music|concert|song|album|guitar|piano|dj set|karaoke)\b/i],
	["film", /\b(movie|cinema|film review|movie trailer)\b/i],
	["anime", /\b(anime|manga)\b/i],
	["fitness", /\b(workout|weightlifting|fitness|pilates|yoga)\b/i],
	["sports", /\b(football|soccer|basketball|baseball|tennis|olympics|esports)\b/i],
	["science", /\b(physics|chemistry|astronomy|biology|space telescope|scientific)\b/i],
	["maker", /\b(woodworking|diy|3d printing|restoration|soldering)\b/i],
	["creative", /\b(painting|drawing|photography|sculpture|animation tutorial)\b/i],
	["animation", /\b(animation|animated|animator|cartoon)\b/i],
	["documentary", /\b(documentary|docuseries)\b/i],
	["history", /\b(history|historical|ancient|medieval|world war|archaeology)\b/i],
	["true-crime", /\b(true crime|murder case|missing person|serial killer|crime documentary)\b/i],
	["photography", /\b(photography|photo shoot|camera review|street photography)\b/i],
	["art", /\b(fine art|artwork|watercolor|illustration|digital art)\b/i],
	["design", /\b(interior design|graphic design|ui design|architecture)\b/i],
	["family", /\b(family|parenting|parenthood|baby)\b/i],
	["animals", /\b(animals?|pets?|dogs?|cats?|wildlife)\b/i],
	["lifestyle", /\b(lifestyle|daily vlog|day in the life|routine)\b/i],
	["beauty", /\b(makeup|skincare|beauty|hair tutorial)\b/i],
	["fashion", /\b(fashion|outfit|streetwear|clothing haul)\b/i],
	["home", /\b(home tour|home decor|organization|clean with me)\b/i],
	["outdoors", /\b(hiking|camping|fishing|outdoors?|backpacking)\b/i],
	["space", /\b(space|nasa|astronomy|rocket launch|astronaut)\b/i],
	["environment", /\b(climate|environment|sustainability|recycling|conservation)\b/i],
	["politics", /\b(politics?|election|government|congress|parliament)\b/i],
	["finance", /\b(finance|stock market|personal finance|budgeting|investing)\b/i],
	["learning", /\b(tutorial|lesson|lecture|course|how to)\b/i],
	["talk", /\b(podcast|interview|just chatting)\b/i],
	["comedy", /\b(comedy|stand.up|sketch comedy)\b/i],
	["nature", /\b(wildlife|birdwatching|rainforest|coral reef)\b/i],
	["wellbeing", /\b(meditation|mental health|mindfulness|acupuncture)\b/i],
	["business", /\b(entrepreneur|small business|startup funding|investing)\b/i],
	["news-commentary", /\b(election|political|breaking news)\b/i]
];
var cache$1 = /* @__PURE__ */ new WeakMap();
var EMPTY = [];
function resolve(video, tags = EMPTY) {
	const previous = cache$1.get(video);
	if (previous?.tags === tags) return previous;
	const links = /* @__PURE__ */ new Map();
	for (const tag of tags) {
		const topic = canonicalTopic(tag);
		if (topic) links.set(topic, {
			topic,
			reason: `Saved tag: ${tag}`,
			saved: true
		});
	}
	const text = `${video.name.slice(0, 500)} ${video.genre ?? ""}`;
	for (const [topic, pattern] of rules) {
		const match = text.match(pattern);
		if (match && !links.has(topic)) links.set(topic, {
			topic,
			reason: `Title/category: ${match[0]}`,
			saved: false
		});
	}
	const result = {
		tags,
		links: [...links.values()],
		topics: [...links.keys()]
	};
	cache$1.set(video, result);
	return result;
}
var topicEvidence = (video, tags) => resolve(video, tags).links;
var topicsForVideo = (video, tags) => resolve(video, tags).topics;
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
		...topicsForVideo(video, tags[video.id]),
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
var twitchRefreshCursor = 0;
var youtubeRefreshCursor = 0;
var historyRecoveryCardCache = /* @__PURE__ */ new Map();
var REMOTE_REFRESH_BATCH_SIZE = LIBRARY_LIMITS.remoteRefreshChannelBatch;
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
var preferencesRestored = false;
function persistNow(get) {
	if (!preferencesRestored) return;
	const s = get();
	savePrefs({
		favorites: Object.keys(s.favorites),
		likes: Object.keys(s.likes),
		tags: s.tags,
		categories: s.categories,
		progress: s.progress,
		resumeProgress: s.resumeProgress,
		history: s.history,
		viewCounts: s.viewCounts,
		cameCounts: s.cameCounts,
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
		resumeProgress: s.resumeProgress,
		viewCounts: s.viewCounts,
		cameCounts: s.cameCounts,
		savedAt: Date.now()
	}).catch(() => queueResumeReplay(s.resumeProgress));
}
function persistActivity(get) {
	if (!preferencesRestored) return;
	const s = get();
	saveActivitySnapshot({
		history: s.history,
		progress: s.progress,
		resumeProgress: s.resumeProgress,
		viewCounts: s.viewCounts,
		cameCounts: s.cameCounts,
		savedAt: Date.now()
	}).catch(() => queueResumeReplay(s.resumeProgress));
}
function mergeHistory(a, b) {
	const rows = /* @__PURE__ */ new Map();
	for (const entry of [...a, ...b]) {
		if (!entry?.id || !Number.isFinite(entry.at)) continue;
		const key = entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`;
		if (!rows.has(key)) rows.set(key, entry);
	}
	return [...rows.values()].sort((left, right) => right.at - left.at);
}
var historyJournalSession = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
var historyEventSequence = 0;
function nextHistoryEventId(now) {
	historyEventSequence = (historyEventSequence + 1) % 1e6;
	return `h:${historyJournalSession}:${now.toString(36)}:${historyEventSequence.toString(36)}`;
}
var RESUME_QUEUE_KEY = "reelcase.resume-replay.v1";
var MAX_RESUME_DURATION = 2592e3;
function validResumeMark(mark) {
	return Boolean(mark && Number.isFinite(mark.t) && Number.isFinite(mark.d) && Number.isFinite(mark.at) && mark.d > .25 && mark.d <= MAX_RESUME_DURATION && mark.t >= 0 && mark.t <= mark.d * 1.015);
}
function normalizeResumeMark(mark) {
	if (!validResumeMark(mark)) return void 0;
	return {
		t: Math.min(mark.t, mark.d),
		d: mark.d,
		at: mark.at
	};
}
function stableResumeKeys(video) {
	return [...new Set([
		`id:${video.id}`,
		video.remote?.watchUrl,
		video.remote?.embedUrl,
		video.src,
		video.path
	].filter((key) => Boolean(key)))];
}
function newestResume(...marks) {
	return marks.reduce((best, mark) => {
		const normalized = normalizeResumeMark(mark);
		return normalized && (!best || normalized.at > best.at) ? normalized : best;
	}, void 0);
}
function isResumable(video, mark) {
	if (!mark) return false;
	const minimumSeconds = video.remote ? 2 : 5;
	const completeAt = video.remote ? .992 : .985;
	return mark.t >= minimumSeconds && mark.t / mark.d < completeAt;
}
function reconcileResumeForVideos(videos, progress, resumeProgress) {
	const next = { ...progress };
	for (const video of videos) {
		const mark = newestResume(next[video.id], ...stableResumeKeys(video).map((key) => resumeProgress[key]));
		if (mark) next[video.id] = mark;
	}
	return next;
}
function queueResumeReplay(records) {
	try {
		const next = {
			...JSON.parse(localStorage.getItem(RESUME_QUEUE_KEY) ?? "{}"),
			...records
		};
		const kept = Object.entries(next).filter(([, mark]) => validResumeMark(mark)).sort((a, b) => b[1].at - a[1].at).slice(0, 600);
		localStorage.setItem(RESUME_QUEUE_KEY, JSON.stringify(Object.fromEntries(kept)));
	} catch {}
}
function takeQueuedResumeReplay() {
	try {
		const queued = JSON.parse(localStorage.getItem(RESUME_QUEUE_KEY) ?? "{}");
		localStorage.removeItem(RESUME_QUEUE_KEY);
		return Object.fromEntries(Object.entries(queued).filter(([, mark]) => validResumeMark(mark)));
	} catch {
		return {};
	}
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
	].filter(Boolean))].slice(0, LIBRARY_LIMITS.remoteMetadataTagsPerTitle);
}
/** Upgrade cached provider cards with the same safe tags created for new pulls. */
function enrichRemoteTags(existing, videos) {
	const tags = { ...existing };
	for (const video of videos) {
		if (!video.remote) continue;
		tags[video.id] = compactIngestedTags(tags[video.id] ?? [], remoteMetadataTags(video));
	}
	return tags;
}
/** Normalize provider enrichment once when it enters the catalog. Manual tags
* are retained, while old keyword-/creator- wrappers and duplicate labels do
* not keep inflating every selector and render pass. */
function compactIngestedTags(existing, inferred) {
	const seen = /* @__PURE__ */ new Set();
	const compact = [];
	for (const raw of [...existing, ...inferred]) {
		let tag = raw.trim().toLowerCase().replace(/^keyword-/, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
		if (!tag || tag === "http" || tag === "https" || seen.has(tag)) continue;
		seen.add(tag);
		compact.push(tag);
		if (compact.length >= LIBRARY_LIMITS.remoteMetadataTagsPerTitle) break;
	}
	return compact;
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
		if (tags.length >= LIBRARY_LIMITS.descriptionKeywordTagsPerTitle) break;
	}
	return tags;
}
/** Local, explainable semantic taxonomy. It runs over provider titles and descriptions only—never media bytes or uploads. */
function semanticTags(video) {
	const text = `${video.name} ${video.path} ${video.tagline ?? ""} ${video.description ?? ""}`.toLowerCase();
	const tags = [
		[/\b(game|gaming|playthrough|speedrun|walkthrough|minecraft|steam|zombies|streamer games|nba 2k\d*|cozy games|\barc\b)\b/, "gaming"],
		[/\b(tech|software|coding|programming|computer|ai|gadget)\b/, "technology"],
		[/\b(news|politic|election|debate|commentary)\b/, "news-commentary"],
		[/\b(music|song|album|concert|cover|playlist)\b/, "music"],
		[/\b(movie|film|cinema|trailer|review)\b/, "film"],
		[/\b(anime|manga|japan|otaku)\b/, "anime"],
		[/\b(food|cook|recipe|restaurant|kitchen|cake|baking|cake decorating)\b/, "food"],
		[/\b(travel|trip|tour|flight|hotel|beach|bali|pool party)\b/, "travel"],
		[/\b(fitness|workout|gym|health|sport)\b/, "fitness"],
		[/\b(science|space|history|documentary|education)\b/, "learning"],
		[/\b(comedy|funny|sketch|standup|meme)\b/, "comedy"],
		[/\b(asmr|relax|sleep|ambient|meditation)\b/, "relaxing"],
		[/\b(acupuncture|wellness|self care)\b/, "wellbeing"],
		[/\b(podcast|interview|talk|discussion)\b/, "talk"],
		[/\b(react|reaction|drama|tea|opinion)\b/, "commentary"],
		[/\b(art|drawing|painting|design|animation)\b/, "creative"],
		[/\b(animal|wildlife|zoo|nature)\b/, "nature"],
		[/\b(finance|money|business|investing)\b/, "business"],
		[/\b(fashion|beauty|makeup|style)\b/, "style"],
		[/\b(car|cars|driving|racing|automotive|motorcycle|simucube|racing rig)\b/, "motors"],
		[/\b(horror|scary|creepy|ghost|true crime)\b/, "horror"],
		[/\b(diy|repair|build|woodwork|maker|restoration)\b/, "maker"],
		[/\b(soccer|football|basketball|baseball|esports|tournament)\b/, "sports"],
		[/\b(science|space|physics|biology|chemistry)\b/, "science"],
		[/\b(relationship|dating|love|couple)\b/, "relationships"],
		[/\b(mental health|therapy|psychology|mindfulness)\b/, "wellbeing"],
		[/\b(language|linguistics|learn \w+|lesson|tutorial)\b/, "skills"],
		[/\b(hardware|pc build|keyboard|phone|camera)\b/, "hardware"],
		[/\b(legal|court|law|lawsuit)\b/, "legal"],
		[/\b(documentary|docuseries)\b/, "documentary"],
		[/\b(history|historical|ancient|archaeology)\b/, "history"],
		[/\b(true crime|murder|missing person|serial killer)\b/, "true-crime"],
		[/\b(photo|photography|camera review|photographer)\b/, "photography"],
		[/\b(artwork|watercolor|illustration|digital art)\b/, "art"],
		[/\b(animation|animated|cartoon|animator)\b/, "animation"],
		[/\b(animals?|pets?|dogs?|cats?|wildlife)\b/, "animals"],
		[/\b(hiking|camping|fishing|backpacking|outdoors?)\b/, "outdoors"],
		[/\b(climate|environment|sustainability|conservation)\b/, "environment"],
		[/\b(makeup|skincare|beauty|hair tutorial)\b/, "beauty"],
		[/\b(fashion|outfit|streetwear|clothing)\b/, "fashion"],
		[/\b(home decor|home tour|interior design|organization)\b/, "home"]
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
		progress: Object.fromEntries(Object.entries(prefs.progress ?? {}).flatMap(([id, mark]) => {
			const normalized = normalizeResumeMark(mark);
			return normalized ? [[id, normalized]] : [];
		})),
		resumeProgress: Object.fromEntries(Object.entries(prefs.resumeProgress ?? {}).flatMap(([key, mark]) => {
			const normalized = normalizeResumeMark(mark);
			return normalized ? [[key, normalized]] : [];
		})),
		history: prefs.history ?? [],
		viewCounts: prefs.viewCounts ?? {},
		cameCounts: prefs.cameCounts ?? {},
		view: prefs.view ?? "grid",
		sort: prefs.sort ?? "name",
		hideDemo: true,
		sourceId: prefs.sourceId ?? "home",
		hardwareAccel: prefs.hardwareAccel ?? true,
		adultPinHash: null,
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
	resumeProgress: {},
	history: [],
	viewCounts: {},
	cameCounts: {},
	hideDemo: true,
	hardwareAccel: true,
	adultPinHash: null,
	adultsUnlocked: true,
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
	remoteRefreshStatus: null,
	remoteRetryAt: {},
	importProgress: null,
	setQuery: (query) => {
		measureInteraction("search");
		set({ query });
	},
	setSort: (sort) => {
		set({ sort });
		persistNow(get);
	},
	setView: (view) => {
		set({ view });
		persistNow(get);
	},
	setSource: (sourceId) => {
		measureInteraction("navigation");
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
		measureInteraction("rating");
		set((s) => {
			const likes = { ...s.likes };
			if (likes[id]) delete likes[id];
			else likes[id] = true;
			return { likes };
		});
		persistSoon(get);
		cacheRemotesSoon(get);
	},
	markCame: (id) => {
		set((s) => ({ cameCounts: {
			...s.cameCounts,
			[id]: (s.cameCounts[id] ?? 0) + 1
		} }));
		persistNow(get);
	},
	setVideoTags: (id, tags) => {
		set((s) => ({ tags: {
			...s.tags,
			[id]: [...new Set(tags.map((tag) => tag.trim().toLowerCase().replace(/^keyword-/, "")).filter(Boolean))].slice(0, 18)
		} }));
		const state = get();
		const video = state.videos.find((item) => item.id === id);
		if (video) librarySearchIndex.updateMetadata(video, state.videos, state.tags, state.categories);
		saveTagEdit(id, state.tags[id] ?? []);
		persistSoon(get);
	},
	autoTagLibrary: () => {
		let changed = 0;
		set((s) => {
			const tags = { ...s.tags };
			for (const video of s.videos) {
				const inferred = video.remote ? remoteMetadataTags(video) : localNameTags(video);
				const merged = compactIngestedTags((tags[video.id] ?? []).map((tag) => tag.replace(/^keyword-/i, "").replace(/^creator-/i, "")), inferred);
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
		saveTagEdit(id, state.tags[id] ?? []);
		persistNow(get);
	},
	markProgress: (id, t, d) => {
		const now = Date.now();
		const incoming = normalizeResumeMark({
			t,
			d,
			at: now
		});
		if (!incoming) return;
		const previous = get().progress[id];
		if (previous && now - previous.at < 2500 && Math.abs(previous.t - t) < 4) return;
		set((s) => {
			const latest = s.history[0];
			const history = incoming.t >= 2 && (!latest || latest.id !== id || now - latest.at > 6e4) ? [{
				eventId: nextHistoryEventId(now),
				id,
				at: now,
				position: incoming.t,
				duration: incoming.d,
				source: "progress"
			}, ...s.history] : s.history;
			const mark = incoming;
			const video = s.videos.find((item) => item.id === id);
			const resumeProgress = { ...s.resumeProgress };
			if (video) for (const key of stableResumeKeys(video)) resumeProgress[key] = newestResume(resumeProgress[key], mark) ?? mark;
			return {
				progress: {
					...s.progress,
					[id]: mark
				},
				resumeProgress,
				history
			};
		});
		const event = get().history[0];
		if (event?.id === id && event.at === now) appendActivityJournal(event).catch(() => void 0);
		persistActivity(get);
		persistSoon(get);
	},
	recordPlay: (id, source = "open") => {
		const beforeAt = get().history[0]?.at;
		set((s) => {
			const now = Date.now();
			const latest = s.history[0];
			if (latest?.id === id && now - latest.at < 2e4) return {};
			const mark = s.progress[id];
			const video = s.videos.find((item) => item.id === id);
			const url = video?.remote?.embedUrl ?? video?.src ?? video?.remote?.watchUrl;
			const title = video?.name?.trim();
			const poster = video?.poster ?? video?.remote?.previewUrl;
			const rating = getRating(id);
			return {
				history: [{
					eventId: nextHistoryEventId(now),
					id,
					at: now,
					position: mark?.t,
					duration: mark?.d,
					source,
					...url ? { url } : {},
					...title ? { title } : {},
					...poster ? { poster } : {},
					...rating ? { rating } : {}
				}, ...s.history],
				viewCounts: {
					...s.viewCounts,
					[id]: (s.viewCounts[id] ?? 0) + 1
				}
			};
		});
		const event = get().history[0];
		if (event?.id === id && event.at !== beforeAt) appendActivityJournal(event).catch(() => void 0);
		persistActivity(get);
		persistSoon(get);
	},
	clearHistory: () => {
		set({ history: [] });
		clearActivityJournal().catch(() => void 0);
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
		queueMicrotask(() => get().recordPlay(activeId));
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
	searchAdultFeed: async (query = "all", order = "top-weekly", opts) => {
		const providers = opts?.providers ?? "all";
		const providerList = providers === "all" ? [...ADULT_PULL_PROVIDERS] : providers;
		set({
			remoteBusy: true,
			importProgress: {
				done: 0,
				total: 1,
				label: providerList.length === 1 ? `Pulling ${providerList[0]} catalog…` : "Pulling official adult catalogs…"
			}
		});
		try {
			const { searchAdultVideos } = await import("./api-DrSMGXpo.mjs");
			const page = opts?.page ?? 1;
			const maxVideos = opts?.maxVideos ?? LIBRARY_LIMITS.epornerVideosPerPull;
			const append = Boolean(opts?.append);
			const providerPages = opts?.providerPages;
			const redditSources = opts?.redditSources;
			const providerKey = providerList.slice().sort().join("+");
			if (!append && !providerPages && findFreshAdultPullFingerprint(query, order, page, providerKey)) {
				const have = get().videos.filter((v) => ADULT_FOLDER_IDS.includes(v.folderId));
				const reddit = have.filter((v) => v.remote?.kind === "reddit").length;
				if (have.length >= LIBRARY_LIMITS.adultFastStartVideosPerPull && reddit >= 200) {
					set({
						remoteBusy: false,
						importProgress: null
					});
					return have.length;
				}
			}
			const result = await searchAdultVideos({ data: {
				query,
				order,
				page,
				maxVideos,
				append,
				providers,
				providerPages,
				redditSources
			} });
			if (result.providerNextPages) saveAdultArchiveCursors(query, order, result.providerNextPages);
			rememberAdultPullFingerprint({
				at: Date.now(),
				query: query.trim().toLowerCase() || "all",
				order,
				page,
				providers: providerKey,
				count: result.videos.length
			});
			const videos = applyCachedAdultUrls(result.videos);
			cacheAdultVideoUrls(videos);
			const touched = new Set(videos.map((v) => v.folderId));
			set((s) => {
				let nextVideos = s.videos;
				let folders = s.folders;
				const tagPatch = {};
				for (const folderId of ADULT_FOLDER_IDS) {
					if (!touched.has(folderId) && append) continue;
					if (!touched.has(folderId) && !append) continue;
					const incoming = videos.filter((v) => v.folderId === folderId);
					const existingRemote = nextVideos.filter((v) => v.folderId === folderId);
					const byId = new Map(existingRemote.map((v) => [v.id, v]));
					for (const video of incoming) byId.set(video.id, video);
					const merged = [...byId.values()].sort((a, b) => b.addedAt - a.addedAt);
					const provider = Object.keys(ADULT_FOLDER_BY_PROVIDER).find((key) => ADULT_FOLDER_BY_PROVIDER[key].id === folderId);
					const baseFolder = provider ? ADULT_FOLDER_BY_PROVIDER[provider] : ADULT_FOLDER_BY_PROVIDER.eporner;
					const kind = baseFolder.kind;
					folders = folders.some((f) => f.id === folderId) ? folders.map((f) => f.id === folderId ? {
						...f,
						videoCount: merged.length,
						adult: true,
						kind
					} : f) : [...folders, {
						...baseFolder,
						videoCount: merged.length
					}];
					nextVideos = [...nextVideos.filter((v) => v.folderId !== folderId), ...merged];
				}
				for (const video of videos) {
					const source = video.remote?.kind ?? video.folderId.split(":")[0] ?? "eporner";
					const hostExtra = source === "booru" && video.remote?.channelId ? [video.remote.channelId] : source === "reddit" && video.remote?.channelId ? [`reddit-${video.remote.channelId}`] : [];
					const creatorNames = [video.remote?.channelName, video.remote?.videoId && (source === "chaturbate" || source === "camsoda" || source === "myfreecams") ? video.remote.videoId : void 0];
					const redditExtra = source === "reddit" ? redditIngestExtras({
						subreddit: video.remote?.channelId,
						title: video.name,
						extraText: `${video.description ?? ""} ${video.tagline ?? ""}`,
						mediaKind: video.extension === "image" ? "image" : /video/i.test(video.mime) ? "video" : void 0
					}) : [];
					tagPatch[video.id] = compactIngestedTags(s.tags[video.id] ?? [], [...adultIngestTags({
						source,
						extraSources: hostExtra,
						creatorNames,
						apiKeywords: video.description ?? video.tagline ?? "",
						title: video.name,
						description: video.description ?? video.tagline ?? "",
						extraTags: redditExtra,
						extraText: source === "reddit" ? `${video.name} ${video.tagline ?? ""}` : void 0,
						limit: LIBRARY_LIMITS.adultKeywordTagsPerTitle + 36
					})]);
				}
				return {
					folders,
					videos: nextVideos,
					tags: {
						...s.tags,
						...tagPatch
					},
					adultsUnlocked: true,
					remoteBusy: false,
					importProgress: null
				};
			});
			persistNow(get);
			let writeChain = Promise.resolve();
			for (const folderId of touched) {
				const folderVideos = get().videos.filter((v) => v.folderId === folderId);
				if (!folderVideos.length) continue;
				writeChain = writeChain.then(() => appendCatalogVideos(folderVideos)).catch(() => void 0);
			}
			await writeChain;
			return get().videos.filter((v) => ADULT_FOLDER_IDS.includes(v.folderId)).length;
		} catch (err) {
			set({
				remoteBusy: false,
				importProgress: null
			});
			throw err;
		}
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
			}
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
				scanning: null
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
			}
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
			scanning: null
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
			scanning: null
		}));
		if (videos.length) set((s) => ({ tags: addLocalNameTags(s.tags, videos) }));
		flushPersist(get);
		if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
	},
	restoreFolders: async () => {
		if (get().hydrated || restoring) return;
		restoring = true;
		await restoreDurablePrefs().catch(() => void 0);
		preferencesRestored = true;
		const prefsState = applyPrefs({});
		prefsState.tags = restoreTagEdits(prefsState.tags ?? {});
		const adultIds = new Set(loadPrefs()?.privateFolderIds ?? []);
		let cachedFolderIds = /* @__PURE__ */ new Set();
		let savedHealth = /* @__PURE__ */ new Map();
		set({ ...prefsState });
		Promise.all([loadActivitySnapshot(), loadActivityJournal()]).then(([activity, journal]) => {
			const queuedResume = takeQueuedResumeReplay();
			if (!activity && !journal.length && !Object.keys(queuedResume).length) return;
			set((s) => {
				const resumeProgress = {
					...activity?.resumeProgress ?? {},
					...queuedResume,
					...s.resumeProgress
				};
				return {
					history: mergeHistory(mergeHistory(s.history, activity?.history ?? []), journal),
					resumeProgress,
					progress: reconcileResumeForVideos(s.videos, {
						...activity?.progress ?? {},
						...s.progress
					}, resumeProgress),
					viewCounts: {
						...activity?.viewCounts ?? {},
						...s.viewCounts
					},
					cameCounts: {
						...activity?.cameCounts ?? {},
						...s.cameCounts
					}
				};
			});
		}).catch(() => void 0);
		try {
			const snapshot = await loadRemoteSnapshot();
			if (snapshot) {
				const ids = new Set(get().follows.map((channel) => channel.id));
				set((s) => {
					const videos = mergeVideos(s.videos, snapshot.videos.filter((v) => ids.has(v.folderId) || s.favorites[v.id] || s.likes[v.id]));
					return {
						videos,
						tags: enrichRemoteTags(s.tags, snapshot.videos),
						progress: reconcileResumeForVideos(videos, s.progress, s.resumeProgress),
						folders: [...s.folders.filter((f) => !snapshot.folders.some((saved) => saved.id === f.id)), ...snapshot.folders.filter((f) => ids.has(f.id))],
						remoteCheckedAt: snapshot.checkedAt
					};
				});
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
				set((s) => {
					const videos = mergeVideos(s.videos, catalog);
					return {
						videos,
						tags: enrichRemoteTags(s.tags, catalog),
						progress: reconcileResumeForVideos(videos, s.progress, s.resumeProgress),
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
					};
				});
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
		const name = get().folders.find((f) => f.id === folderId)?.name ?? handle.name;
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
			const { followRemote } = await import("./api-DrSMGXpo.mjs");
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
					videos: mergeVideos(s.videos.filter((v) => v.folderId !== result.channel.id || s.favorites[v.id] || s.likes[v.id] || result.channel.kind === "twitch" && v.remote?.kind === "twitch" && !v.remote.live), result.videos),
					tags: {
						...s.tags,
						...Object.fromEntries(result.videos.map((video) => [video.id, compactIngestedTags(s.tags[video.id] ?? [], remoteMetadataTags(video))]))
					},
					remoteBusy: false
				};
			});
			persistNow(get);
			cacheRemotes(get);
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
			const { importChannels } = await import("./api-DrSMGXpo.mjs");
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
							...Object.fromEntries(result.ok.flatMap((row) => row.videos.map((video) => [video.id, compactIngestedTags(s.tags[video.id] ?? [], remoteMetadataTags(video))])))
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
		const rotate = (items, limit, cursor) => {
			if (!items.length) return [];
			const savedCursor = cursor === "twitch" ? twitchRefreshCursor : cursor === "youtube" ? youtubeRefreshCursor : remoteRefreshCursor;
			const count = Math.min(limit, items.length);
			const start = savedCursor % items.length;
			const next = Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
			const updated = (start + count) % items.length;
			if (cursor === "twitch") twitchRefreshCursor = updated;
			else if (cursor === "youtube") youtubeRefreshCursor = updated;
			else remoteRefreshCursor = updated;
			return next;
		};
		const twitch = allFollows.filter((follow) => follow.kind === "twitch");
		const youtube = allFollows.filter((follow) => follow.kind === "youtube");
		const current = twitch.length && youtube.length ? [...rotate(twitch, Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "twitch"), ...rotate(youtube, REMOTE_REFRESH_BATCH_SIZE - Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "youtube")] : rotate(allFollows, REMOTE_REFRESH_BATCH_SIZE, "all");
		set({ refreshing: true });
		const beforeLive = new Set(get().videos.filter((v) => v.remote?.live).map((v) => v.id));
		const beforeIds = new Set(get().videos.map((v) => v.id));
		try {
			const { refreshRemotes } = await import("./api-DrSMGXpo.mjs");
			const result = await refreshRemotes({ data: { channels: current } });
			new Set(result.refreshedIds);
			set((s) => {
				const mergedVideos = mergeRemoteRefresh(s.videos, result.videos, result.refreshedIds, /* @__PURE__ */ new Set([
					...Object.keys(s.favorites),
					...Object.keys(s.likes),
					...s.history.map((entry) => entry.id)
				]));
				const folderCounts = /* @__PURE__ */ new Map();
				for (const video of mergedVideos) folderCounts.set(video.folderId, (folderCounts.get(video.folderId) ?? 0) + 1);
				return {
					follows: dedupeFollows([...result.channels, ...s.follows]),
					remoteCheckedAt: Date.now(),
					folders: [...s.folders.filter((f) => !result.channels.some((channel) => channel.id === f.id)), ...result.channels.map((c) => ({
						id: c.id,
						name: c.title,
						kind: c.kind,
						videoCount: folderCounts.get(c.id) ?? 0,
						health: "healthy",
						lastCheckedAt: Date.now()
					}))],
					videos: mergedVideos,
					progress: reconcileResumeForVideos(mergedVideos, s.progress, s.resumeProgress),
					tags: {
						...s.tags,
						...Object.fromEntries(result.videos.map((video) => [video.id, compactIngestedTags(s.tags[video.id] ?? [], remoteMetadataTags(video))]))
					},
					remoteRefreshStatus: {
						at: Date.now(),
						checked: current.length,
						refreshed: result.refreshedIds.length,
						failed: Math.max(0, current.length - result.refreshedIds.length),
						youtube: result.videos.filter((video) => video.remote?.kind === "youtube").length,
						twitch: result.videos.filter((video) => video.remote?.kind === "twitch" && !video.remote.live).length
					},
					remoteRetryAt: result.retryAt
				};
			});
			persistNow(get);
			cacheRemotes(get);
			return {
				wentLive: result.channels.filter((c) => c.live && !beforeLive.has(`tw:${c.handle}:live`) && !beforeLive.has(`tw:${c.handle.toLowerCase()}:live`)),
				newVideos: result.videos.filter((v) => !beforeIds.has(v.id) && Boolean(v.remote))
			};
		} catch {
			set({ remoteRefreshStatus: {
				at: Date.now(),
				checked: current.length,
				refreshed: 0,
				failed: current.length,
				youtube: 0,
				twitch: 0
			} });
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
	},
	pruneHistory: (before) => {
		set((s) => ({ history: s.history.filter((entry) => entry.at >= before) }));
		persistNow(get);
		pruneActivityJournal(before).catch(() => void 0);
	},
	getResumeRepairPreview: () => {
		const state = get();
		const marks = Object.values(state.progress);
		const staleBefore = Date.now() - 15552e6;
		const linkedKeys = new Set(state.videos.flatMap(stableResumeKeys));
		return {
			valid: marks.filter(validResumeMark).length,
			invalid: marks.filter((mark) => !validResumeMark(mark)).length,
			stale: marks.filter((mark) => validResumeMark(mark) && mark.at < staleBefore).length,
			recoverable: Object.entries(state.resumeProgress).filter(([key, mark]) => validResumeMark(mark) && linkedKeys.has(key)).length
		};
	}
}));
var selectorMemo = /* @__PURE__ */ new WeakMap();
function memoFor(state) {
	let memo = selectorMemo.get(state);
	if (!memo) {
		memo = {};
		selectorMemo.set(state, memo);
	}
	return memo;
}
var resumeLookupMemo = /* @__PURE__ */ new WeakMap();
function resumeLookup(state, list) {
	const cached = resumeLookupMemo.get(state);
	if (cached) return cached;
	const index = /* @__PURE__ */ new Map();
	for (const video of list) for (const key of [
		video.id,
		video.remote?.watchUrl,
		video.remote?.embedUrl,
		video.src,
		video.path
	]) if (key) index.set(key, video);
	resumeLookupMemo.set(state, index);
	return index;
}
function publicList(state) {
	const memo = memoFor(state);
	if (memo.public) return memo.public;
	const adult = adultIdSet(state.folders);
	const knownFolders = new Set(state.folders.map((folder) => folder.id));
	let list = state.videos.filter((v) => !state.unavailable[v.id] && !adult.has(v.folderId) && (knownFolders.has(v.folderId) || Boolean(v.remote) || v.isSample));
	if (state.hideDemo) list = list.filter((v) => !v.isSample);
	memo.public = list;
	return list;
}
function adultList(state) {
	const adult = adultIdSet(state.folders);
	return state.videos.filter((v) => !state.unavailable[v.id] && adult.has(v.folderId));
}
function selectVisible(state) {
	const q = state.query.trim().toLowerCase();
	const inAdults = state.sourceId === "adults";
	let list = inAdults ? adultList(state) : publicList(state);
	if (state.sourceId === "favorites") list = list.filter((v) => state.favorites[v.id]);
	else if (state.sourceId === "continue") list = selectContinue(state, false);
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
	const memo = memoFor(state);
	const existing = adult ? memo.continueAdult : memo.continuePublic;
	if (existing) return existing;
	const marks = /* @__PURE__ */ new Map();
	const recordMark = (id, mark) => {
		if (!mark || !Number.isFinite(mark.t) || !Number.isFinite(mark.d) || mark.t < 2 || mark.d <= 0 || mark.t / mark.d >= .992) return;
		const current = marks.get(id);
		if (!current || mark.at > current.at) marks.set(id, mark);
	};
	for (const video of recoveryList(state, adult)) recordMark(video.id, resumeForVideo(state, video));
	for (const entry of state.history) {
		if (!entry.position || !entry.duration || entry.position < 2 || entry.position / entry.duration >= .992) continue;
		recordMark(entry.id, {
			t: entry.position,
			d: entry.duration,
			at: entry.at
		});
	}
	const candidates = [...recoveryList(state, adult), ...selectHistory(state, adult)];
	const seen = /* @__PURE__ */ new Set();
	const items = candidates.filter((video) => {
		if (seen.has(video.id)) return false;
		seen.add(video.id);
		return isResumable(video, marks.get(video.id) ?? resumeForVideo(state, video));
	});
	items.sort((a, b) => (marks.get(b.id)?.at ?? resumeForVideo(state, b)?.at ?? 0) - (marks.get(a.id)?.at ?? resumeForVideo(state, a)?.at ?? 0));
	if (adult) memo.continueAdult = items;
	else memo.continuePublic = items;
	return items;
}
function selectFavorites(state, adult = false) {
	return recoveryList(state, adult).filter((v) => state.favorites[v.id]);
}
function resumeForVideo(state, video) {
	return newestResume(state.progress[video.id], ...stableResumeKeys(video).map((key) => state.resumeProgress[key]));
}
function selectHistory(state, adult = false) {
	const byId = resumeLookup(state, recoveryList(state, adult));
	const seen = /* @__PURE__ */ new Set();
	return state.history.filter((h) => !seen.has(h.id) && Boolean(seen.add(h.id))).map((h) => {
		const cached = byId.get(h.id) ?? (h.url ? byId.get(h.url) : void 0);
		if (cached) return cached;
		const live = state.videos.find((item) => item.id === h.id);
		if (live) {
			const isAdult = adultIdSet(state.folders).has(live.folderId);
			if (adult === isAdult) return live;
			if (!adult && isAdult) return null;
		}
		if (!h.url && !h.title) return null;
		const historyUrl = h.url ?? "";
		const isYoutube = /youtube\.com|youtu\.be/i.test(historyUrl);
		const isTwitch = /twitch\.tv/i.test(historyUrl);
		const isEporner = /eporner\.com/i.test(historyUrl);
		const isRedtube = /redtube\.com/i.test(historyUrl);
		const isChaturbate = /chaturbate\.com/i.test(historyUrl);
		const isCamsoda = /camsoda\.com/i.test(historyUrl);
		const isMfc = /myfreecams\.com|mfc\.cdn/i.test(historyUrl);
		const isReddit = /reddit\.com|redd\.it/i.test(historyUrl);
		const isBooru = /xbooru\.com|tbib\.org|hypnohub\.net/i.test(historyUrl);
		const isRedgifs = /redgifs\.com/i.test(historyUrl);
		const adultKind = isEporner ? "eporner" : isRedtube ? "redtube" : isChaturbate ? "chaturbate" : isCamsoda ? "camsoda" : isMfc ? "myfreecams" : isReddit ? "reddit" : isBooru ? "booru" : isRedgifs ? "redgifs" : null;
		if (!adult && (isEporner || isRedtube || isChaturbate || isCamsoda || isMfc || isReddit || isBooru || isRedgifs)) return null;
		const signature = `${h.at}:${h.url}:${h.position ?? ""}:${h.duration ?? ""}:${h.title ?? ""}`;
		const cachedRecovery = historyRecoveryCardCache.get(h.id);
		if (cachedRecovery?.signature === signature) return cachedRecovery.video;
		const recovered = {
			id: h.id,
			folderId: adultKind ? `history:recovery:${adultKind}` : "history:recovery",
			name: h.title?.trim() || (isYoutube ? "Saved YouTube history" : isTwitch ? "Saved Twitch history" : adultKind ? `Saved ${adultKind} history` : "Saved playback history"),
			path: h.url ?? h.id,
			src: h.url,
			extension: isYoutube ? "yt" : isTwitch ? "vod" : adultKind ?? "history",
			mime: isYoutube ? "video/youtube" : isTwitch ? "video/twitch" : adultKind ? `video/${adultKind}` : "video/history",
			size: 0,
			duration: h.duration,
			addedAt: h.at,
			poster: h.poster,
			tagline: h.title ? "Saved from watch history." : "Original card is not cached right now. The saved link is retained for recovery.",
			remote: isYoutube || isTwitch || adultKind ? {
				kind: isYoutube ? "youtube" : isTwitch ? "twitch" : adultKind,
				live: false,
				embedUrl: h.url,
				watchUrl: h.url
			} : void 0
		};
		historyRecoveryCardCache.set(h.id, {
			signature,
			video: recovered
		});
		if (historyRecoveryCardCache.size > 1500) historyRecoveryCardCache.delete(historyRecoveryCardCache.keys().next().value);
		return recovered;
	}).filter((v) => v != null);
}
/** Combined official adult pull shelves (Eporner + RedTube). */
function selectAdultRemote(state) {
	const matching = state.videos.filter((v) => v.remote?.kind === "eporner" || v.remote?.kind === "redtube" || v.remote?.kind === "chaturbate" || v.remote?.kind === "camsoda" || v.remote?.kind === "myfreecams" || v.remote?.kind === "reddit" || v.remote?.kind === "booru" || v.remote?.kind === "redgifs" || ADULT_FOLDER_IDS.includes(v.folderId));
	return [...new Map(matching.map((video) => [video.id, video])).values()].sort((a, b) => b.addedAt - a.addedAt);
}
function selectYoutube(state) {
	const memo = memoFor(state);
	return memo.youtube ?? (memo.youtube = [...publicList(state).filter((v) => v.remote?.kind === "youtube")].sort((a, b) => b.addedAt - a.addedAt));
}
function selectTwitch(state) {
	const memo = memoFor(state);
	if (memo.twitch) return memo.twitch;
	const twitch = publicList(state).filter((v) => v.remote?.kind === "twitch");
	const live = twitch.filter((v) => v.remote?.live);
	const vods = twitch.filter((v) => !v.remote?.live);
	memo.twitch = [...live, ...vods];
	return memo.twitch;
}
function selectLive(state) {
	const memo = memoFor(state);
	return memo.live ?? (memo.live = publicList(state).filter((v) => v.remote?.live));
}
function selectClassics(state) {
	const memo = memoFor(state);
	return memo.classics ?? (memo.classics = publicList(state).filter((v) => !v.remote && isClassicVideo(v)));
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
var active$1 = 0;
var waiting = [];
var MAX_MEMORY_THUMBS = 360;
var MAX_ARTWORK_ATTEMPTS = 3;
var MAX_THUMB_QUEUE = 96;
var artworkHits = 0;
var artworkMisses = 0;
var artworkEvictions = 0;
function inputOrBackgroundWork() {
	return Boolean((typeof navigator !== "undefined" ? navigator : void 0)?.scheduling?.isInputPending?.()) || typeof document !== "undefined" && document.visibilityState !== "visible";
}
function maxThumbnailWorkers() {
	const nav = typeof navigator !== "undefined" ? navigator : void 0;
	const cores = nav?.hardwareConcurrency ?? 4;
	const memory = nav?.deviceMemory ?? 4;
	const adaptive = Boolean(nav?.scheduling?.isInputPending?.()) || typeof document !== "undefined" && document.visibilityState !== "visible" || memory <= 2 ? 1 : Math.min(4, Math.max(2, Math.floor(cores / (memory <= 4 ? 3 : 2))));
	try {
		const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0");
		return [
			1,
			2,
			3,
			4
		].includes(saved) ? Math.min(saved, adaptive + 1) : adaptive;
	} catch {
		return adaptive;
	}
}
async function acquire() {
	while (inputOrBackgroundWork() || active$1 >= maxThumbnailWorkers()) if (inputOrBackgroundWork()) await new Promise((resolve) => window.setTimeout(resolve, 80));
	else await new Promise((resolve) => waiting.push(resolve));
	active$1 += 1;
}
/** Local-only artwork queue/cache numbers for the opt-in diagnostics panel. */
function getThumbDiagnostics() {
	return {
		active: active$1,
		queued: waiting.length,
		inflight: inflight.size,
		hits: artworkHits,
		misses: artworkMisses,
		evictions: artworkEvictions
	};
}
function release() {
	active$1 = Math.max(0, active$1 - 1);
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
		if (byId[video.id]) {
			artworkHits += 1;
			return;
		}
		if (failed[video.id] || inflight.has(video.id)) return;
		if ((diagnostics[video.id]?.attempts ?? 0) >= MAX_ARTWORK_ATTEMPTS) return;
		if (inflight.size >= MAX_THUMB_QUEUE) return;
		artworkMisses += 1;
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
						if (ids.length > MAX_MEMORY_THUMBS) {
							delete nextThumbs[ids[0]];
							artworkEvictions += 1;
						}
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
/** Resolve the best direct image URL for an adult photo-kind card. */
function adultPhotoDownloadUrl(video) {
	if (!isAdultImageKind(video.remote?.kind, video.mime, video.extension)) {
		if (!(video.mime?.startsWith("image/") || video.extension === "image")) return null;
	}
	const url = video.src || video.remote?.embedUrl || video.remote?.previewUrl || video.poster || "";
	if (!url || !/^https?:\/\//i.test(url)) return null;
	return url;
}
function filenameFor(video, url) {
	const ext = (url.split("?")[0]?.split("/").pop() || "").match(/\.(jpe?g|png|gif|webp|avif)$/i)?.[1]?.toLowerCase() || "jpg";
	return `${(video.name || video.id || "adult-photo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "adult-photo"}.${ext}`;
}
/**
* Save an adult photo to the user's local disk via browser download.
* Uses File System Access `showSaveFilePicker` when available; otherwise
* falls back to an anchor download of a fetched blob.
*/
async function downloadAdultPhoto(video) {
	const url = adultPhotoDownloadUrl(video);
	if (!url) return {
		ok: false,
		error: "No downloadable image on this title."
	};
	const name = filenameFor(video, url);
	try {
		const res = await fetch(url, {
			mode: "cors",
			credentials: "omit"
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const blob = await res.blob();
		const handlePicker = window.showSaveFilePicker;
		if (typeof handlePicker === "function") try {
			const handle = await handlePicker({
				suggestedName: name,
				types: [{
					description: "Image",
					accept: { [blob.type || "image/jpeg"]: [`.${name.split(".").pop()}`] }
				}]
			});
			const writable = await handle.createWritable();
			await writable.write(blob);
			await writable.close();
			return {
				ok: true,
				name: handle.name || name
			};
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return {
				ok: false,
				error: "Save cancelled."
			};
		}
		const objectUrl = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = objectUrl;
		a.download = name;
		a.rel = "noopener";
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.setTimeout(() => URL.revokeObjectURL(objectUrl), 3e4);
		return {
			ok: true,
			name
		};
	} catch (err) {
		try {
			const a = document.createElement("a");
			a.href = url;
			a.target = "_blank";
			a.rel = "noreferrer";
			a.download = name;
			document.body.appendChild(a);
			a.click();
			a.remove();
			return {
				ok: true,
				name
			};
		} catch {
			return {
				ok: false,
				error: err instanceof Error ? err.message : "Download failed."
			};
		}
	}
}
var mountedCards = 0;
var longFrames = 0;
var lastFrameMs = 0;
var worstFrameMs = 0;
var previousFrame = 0;
var frameLoopRunning = false;
var startedAt$1 = Date.now();
function observeFrames() {
	if (frameLoopRunning || typeof window === "undefined") return;
	frameLoopRunning = true;
	const frame = (now) => {
		if (previousFrame) {
			lastFrameMs = Math.round(now - previousFrame);
			worstFrameMs = Math.max(worstFrameMs, lastFrameMs);
			if (lastFrameMs > 34) longFrames += 1;
		}
		previousFrame = now;
		if (mountedCards > 0) window.requestAnimationFrame(frame);
		else frameLoopRunning = false;
	};
	window.requestAnimationFrame(frame);
}
/** Lightweight, local-only telemetry for the diagnostics panel. */
function registerMountedCard() {
	mountedCards += 1;
	observeFrames();
	return () => {
		mountedCards = Math.max(0, mountedCards - 1);
	};
}
function getRenderBudgetSnapshot() {
	return {
		mountedCards,
		longFrames,
		lastFrameMs,
		worstFrameMs,
		startedAt: startedAt$1
	};
}
var active = 0;
var waitingHigh = [];
var waitingLow = [];
/** Default ceiling — aggressive enough that dense Adult rails stay scrollable. */
var MAX_CONCURRENT = 12;
/** Reserve a few slots so visible cards are not starved by speculative warm. */
var HIGH_RESERVED = 4;
function maxConcurrent() {
	const nav = typeof navigator !== "undefined" ? navigator : void 0;
	if (nav?.connection?.saveData) return 3;
	if (nav?.deviceMemory && nav.deviceMemory <= 2) return 4;
	if (nav?.deviceMemory && nav.deviceMemory <= 4) return 6;
	if (nav?.hardwareConcurrency && nav.hardwareConcurrency <= 4) return 6;
	const type = nav?.connection?.effectiveType;
	if (type === "slow-2g" || type === "2g") return 3;
	if (type === "3g") return 6;
	if (typeof nav?.connection?.downlink === "number" && nav.connection.downlink > 0 && nav.connection.downlink < 1.5) return 6;
	return MAX_CONCURRENT;
}
function wakeNext() {
	const next = waitingHigh.shift() ?? waitingLow.shift();
	if (next) next();
}
function canStart(priority) {
	const max = maxConcurrent();
	if (active >= max) return false;
	if (priority === "high") return true;
	if (waitingHigh.length > 0 && active >= Math.max(1, max - HIGH_RESERVED)) return false;
	return true;
}
async function acquireImageSlot(opts) {
	const priority = opts?.priority ?? "low";
	const queue = priority === "high" ? waitingHigh : waitingLow;
	while (!canStart(priority)) await new Promise((resolve) => queue.push(resolve));
	active += 1;
	let released = false;
	return () => {
		if (released) return;
		released = true;
		active = Math.max(0, active - 1);
		wakeNext();
	};
}
var THUMB_LOAD_TIMEOUT_MS = 4500;
var RAIL_WARM_INDEX = 8;
var EMPTY_TAGS$2 = [];
var artworkRepairRequested = /* @__PURE__ */ new Set();
var remoteArtworkRepairRequested = /* @__PURE__ */ new Set();
var VideoCard = (0, import_react.memo)(function VideoCard({ video, variant = "grid", index = 0, playedAt, className }) {
	const ref = (0, import_react.useRef)(null);
	const thumb = useThumbs((s) => s.byId[video.id]);
	const failed = useThumbs((s) => s.failed[video.id]);
	const capturedDur = useThumbs((s) => s.durations[video.id]);
	const request = useThumbs((s) => s.request);
	const retry = useThumbs((s) => s.retry);
	const artworkDiagnostic = useThumbs((s) => s.diagnostics[video.id]);
	const repairArtworkSource = useLibrary((s) => s.repairArtworkSource);
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const progress = useLibrary((s) => s.progress[video.id]);
	const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
	const liked = useLibrary((s) => Boolean(s.likes[video.id]));
	const tags = useLibrary((s) => s.tags[video.id] ?? EMPTY_TAGS$2);
	const category = useLibrary((s) => s.categories[video.id] ?? "");
	const viewCount = useLibrary((s) => s.viewCounts[video.id] ?? 0);
	const cameCount = useLibrary((s) => s.cameCounts[video.id] ?? 0);
	const adultFolder = useLibrary((s) => Boolean(s.folders.find((folder) => folder.id === video.folderId)?.adult));
	const markCame = useLibrary((s) => s.markCame);
	const adult = adultFolder || isAdultPullKind(video.remote?.kind);
	const adultPhoto = Boolean(adult && isAdultImageKind(video.remote?.kind, video.mime, video.extension));
	const toggleLike = useLibrary((s) => s.toggleLike);
	const openPreview = useLibrary((s) => s.openPreview);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const setSource = useLibrary((s) => s.setSource);
	const duration = capturedDur ?? video.duration;
	const ratio = progress && progress.d > 0 ? Math.min(1, progress.t / progress.d) : 0;
	const playable = isLikelyPlayable(video.extension);
	const youtubeId = video.remote?.kind === "youtube" ? video.remote.videoId ?? video.remote.embedUrl?.match(/(?:embed\/|v=)([A-Za-z0-9_-]{11})/)?.[1] : void 0;
	const youtubeFallback = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : void 0;
	const youtubeFallbacks = youtubeId ? [
		`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
		`https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
		`https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`,
		`https://i.ytimg.com/vi/${youtubeId}/default.jpg`
	] : [];
	const adultCandidates = (0, import_react.useMemo)(() => video.remote && video.remote.kind !== "youtube" && video.remote.kind !== "twitch" ? adultThumbCandidatesForVideo(video) : [], [video]);
	const providerArt = video.poster || youtubeFallback || video.remote?.previewUrl;
	const isPoster = variant === "poster";
	const live = Boolean(video.remote?.live);
	const preview = video.remote?.previewUrl;
	const [hovered, setHovered] = (0, import_react.useState)(false);
	const [thumbIndex, setThumbIndex] = (0, import_react.useState)(0);
	const [artVisible, setArtVisible] = (0, import_react.useState)(false);
	const [artAllowed, setArtAllowed] = (0, import_react.useState)(false);
	const [paintedSrc, setPaintedSrc] = (0, import_react.useState)();
	const [candidateReady, setCandidateReady] = (0, import_react.useState)(false);
	const [textFirst, setTextFirst] = (0, import_react.useState)(false);
	const [rating, setRating$3] = (0, import_react.useState)(0);
	const imageSlotRelease = (0, import_react.useRef)(void 0);
	const releaseImageSlot = () => {
		imageSlotRelease.current?.();
		imageSlotRelease.current = void 0;
		setArtAllowed(false);
	};
	const thumbCandidates = (0, import_react.useMemo)(() => {
		const out = [];
		const seen = /* @__PURE__ */ new Set();
		const push = (url) => {
			if (!url || seen.has(url)) return;
			seen.add(url);
			out.push(url);
		};
		if (variant === "poster") {
			push(providerArt);
			push(thumb);
		} else {
			push(thumb);
			push(providerArt);
		}
		for (const url of adultCandidates) push(url);
		for (const url of youtubeFallbacks) push(url);
		push(preview);
		return out;
	}, [
		adultCandidates,
		preview,
		providerArt,
		thumb,
		variant,
		youtubeId
	]);
	const resolvedThumbIndex = (() => {
		for (let i = thumbIndex; i < thumbCandidates.length; i++) if (!isAdultThumbBlacklisted(thumbCandidates[i])) return i;
		return thumbCandidates.length;
	})();
	const thumbsExhausted = thumbCandidates.length === 0 || resolvedThumbIndex >= thumbCandidates.length;
	const activeThumb = thumbsExhausted ? void 0 : thumbCandidates[resolvedThumbIndex];
	const showPreview = Boolean(hovered && preview && preview !== activeThumb && resolvedThumbIndex === 0 && !isAdultThumbBlacklisted(preview));
	const advanceThumb = () => {
		setCandidateReady(false);
		setThumbIndex((index) => {
			let next = index + 1;
			while (next < thumbCandidates.length && isAdultThumbBlacklisted(thumbCandidates[next])) next += 1;
			if (next >= thumbCandidates.length) repairRemoteArtwork();
			return next;
		});
	};
	(0, import_react.useEffect)(() => {
		setThumbIndex(0);
		setPaintedSrc(void 0);
		setCandidateReady(false);
	}, [
		video.id,
		video.poster,
		video.remote?.previewUrl
	]);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver((entries) => {
			const visible = entries.some((e) => e.isIntersecting);
			setArtVisible(visible);
			if (visible && !video.remote) request(video);
		}, { rootMargin: "160px" });
		io.observe(el);
		return () => io.disconnect();
	}, [request, video]);
	(0, import_react.useEffect)(() => {
		if (!artVisible || !adultCandidates.length) return;
		if (variant !== "rail" && variant !== "grid") return;
		if (index > RAIL_WARM_INDEX) return;
		warmAdultThumbUrls(thumbCandidates, 3);
	}, [
		artVisible,
		adultCandidates.length,
		index,
		thumbCandidates,
		variant
	]);
	(0, import_react.useEffect)(() => {
		if (!artVisible || thumbsExhausted) {
			setArtAllowed(false);
			return;
		}
		let release;
		let cancelled = false;
		acquireImageSlot({ priority: "high" }).then((done) => {
			if (cancelled) {
				done();
				return;
			}
			release = done;
			imageSlotRelease.current = done;
			setArtAllowed(true);
		});
		return () => {
			cancelled = true;
			if (imageSlotRelease.current === release) imageSlotRelease.current = void 0;
			release?.();
			setArtAllowed(false);
		};
	}, [
		activeThumb,
		artVisible,
		thumbsExhausted,
		video.id
	]);
	(0, import_react.useEffect)(() => {
		setCandidateReady(false);
	}, [activeThumb]);
	(0, import_react.useEffect)(() => {
		if (!artVisible || !artAllowed || !activeThumb || showPreview || candidateReady) return;
		if (paintedSrc === activeThumb) return;
		const timer = window.setTimeout(() => {
			markAdultThumbFailed(activeThumb);
			releaseImageSlot();
			advanceThumb();
		}, THUMB_LOAD_TIMEOUT_MS);
		return () => window.clearTimeout(timer);
	}, [
		activeThumb,
		artAllowed,
		artVisible,
		candidateReady,
		paintedSrc,
		showPreview,
		thumbIndex
	]);
	(0, import_react.useEffect)(() => {
		setRating$3(getRating(video.id));
	}, [video.id]);
	(0, import_react.useEffect)(() => {
		setTextFirst(document.documentElement.dataset.artworkMode === "text");
	}, []);
	(0, import_react.useEffect)(() => registerMountedCard(), []);
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
		measureInteraction("rating");
		setRating$3(value);
		window.requestAnimationFrame(() => setRating(video.id, value));
	};
	const repairRemoteArtwork = () => {
		if (!video.remote || video.remote.kind !== "youtube" && video.remote.kind !== "twitch" || remoteArtworkRepairRequested.has(video.folderId)) return;
		remoteArtworkRepairRequested.add(video.folderId);
		const query = video.remote.channelId ?? video.folderId.replace(/^(?:yt|tw):/, "");
		followRemoteQuery(query, video.remote.kind).catch(() => void 0);
	};
	const poster = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-elevated", variant === "list" && "h-16 w-28 shrink-0 rounded-sm", variant === "poster" && "aspect-poster w-full rounded-md", (variant === "grid" || variant === "rail") && "aspect-video w-full rounded-md"),
		children: [
			paintedSrc && !textFirst && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: paintedSrc,
				alt: "",
				"aria-hidden": true,
				decoding: "async",
				referrerPolicy: "no-referrer",
				className: "absolute inset-0 size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
			}),
			!textFirst && artVisible && (artAllowed || candidateReady || paintedSrc === activeThumb) && !thumbsExhausted && (showPreview ? preview : activeThumb) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				loading: index <= RAIL_WARM_INDEX ? "eager" : "lazy",
				decoding: "async",
				fetchPriority: index <= 3 && artVisible ? "high" : "auto",
				referrerPolicy: "no-referrer",
				src: showPreview ? preview : activeThumb,
				alt: "",
				onLoad: (event) => {
					if (showPreview) return;
					const img = event.currentTarget;
					const url = activeThumb;
					if (!url) return;
					if (!isDecodedAdultThumbLikelyReal(img)) {
						markAdultThumbFailed(url);
						releaseImageSlot();
						advanceThumb();
						return;
					}
					markAdultThumbGood(url, video.id);
					setPaintedSrc(url);
					setCandidateReady(true);
					releaseImageSlot();
				},
				onError: () => {
					if (showPreview) return;
					if (activeThumb) markAdultThumbFailed(activeThumb);
					releaseImageSlot();
					advanceThumb();
				},
				className: cn("relative size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10 transition-opacity duration-150", candidateReady || paintedSrc === activeThumb ? "opacity-100" : "opacity-0")
			}, `${video.id}:${resolvedThumbIndex}:${showPreview ? "p" : "a"}`) : !paintedSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-elevated outline outline-1 -outline-offset-1 outline-fg/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-10 items-center justify-center rounded-full bg-bg/40 text-muted", !failed && "animate-pulse"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
				}), failed && !video.remote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					title: artworkDiagnostic ? `${artworkDiagnostic.lastError} · attempt ${artworkDiagnostic.attempts}/3` : void 0,
					className: "absolute bottom-2 left-2 right-2 rounded-xs bg-bg/80 px-2 py-1 text-center text-[11px] text-muted",
					children: ["Local artwork unavailable", artworkDiagnostic ? ` · ${artworkDiagnostic.attempts}/3` : ""]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-bg/80 via-transparent to-transparent opacity-90" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lift",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
				})
			}),
			live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "absolute top-2 left-2 flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-white uppercase shadow-lift",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-white shadow-[0_0_0_3px_rgb(255_255_255_/_0.2)]" }), "Live"]
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
		"data-video-card": true,
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
								children: playedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: formatAgo(playedAt) }) : live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [video.remote?.channelName ?? "Twitch", hasFreshViewerCount(video.remote) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}),
									video.remote?.viewers?.toLocaleString(),
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
							adult && cameCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-accent",
								children: [
									"I cummed to it · ",
									cameCount,
									"×"
								]
							}),
							(category || tags.length > 0) && variant !== "list" && variant !== "rail" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-center gap-1 truncate text-xs text-subtle",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-3 shrink-0" }), [category, ...tags.slice(0, 6)].filter(Boolean).join(" · ")]
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
			adult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-label": "I cummed to it",
				onClick: (event) => {
					event.stopPropagation();
					markCame(video.id);
				},
				className: cn("absolute top-20 right-2 flex min-h-9 items-center gap-1 rounded-sm bg-bg/55 px-1.5 text-[10px] text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", cameCount > 0 && "opacity-100 text-accent", variant === "list" && "top-[4.75rem] right-3"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: cn("size-3.5", cameCount > 0 && "fill-accent text-accent") }), cameCount > 0 ? cameCount : ""]
			}),
			adultPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Download photo",
				title: "Download photo to this device",
				onClick: (event) => {
					event.stopPropagation();
					downloadAdultPhoto(video).then((result) => {
						if (result.ok) toast.success(`Saved ${result.name}`);
						else if (result.error !== "Save cancelled.") toast.error(result.error);
					});
				},
				className: cn("absolute top-[7.25rem] right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", variant === "list" && "top-[6.5rem] right-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" })
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
});
function openTopic(topic) {
	useLibrary.getState().setQuery(topic);
	useLibrary.getState().setSource("genres");
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("h-11 w-full min-w-0 rounded-md bg-elevated px-3 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle", "focus-visible:shadow-border-hover focus-visible:ring-2 focus-visible:ring-ring/50", "disabled:cursor-not-allowed disabled:opacity-40", className),
		...props
	});
}
var ADULT_SOURCE_FILTERS = [
	{
		id: "all",
		label: "All sources"
	},
	{
		id: "reddit",
		label: "Reddit"
	},
	{
		id: "redtube",
		label: "RedTube"
	},
	{
		id: "eporner",
		label: "Eporner"
	},
	{
		id: "chaturbate",
		label: "Chaturbate"
	},
	{
		id: "camsoda",
		label: "CamSoda"
	},
	{
		id: "myfreecams",
		label: "MyFreeCams"
	},
	{
		id: "booru",
		label: "Booru"
	},
	{
		id: "redgifs",
		label: "Redgifs"
	}
];
function adultProviderKind(video) {
	const kind = video.remote?.kind;
	if (kind && ADULT_PULL_PROVIDERS.includes(kind)) return kind;
	const folder = video.folderId.split(":")[0] ?? "";
	if (ADULT_PULL_PROVIDERS.includes(folder)) return folder;
	return "";
}
function videoMatchesAdultSource(video, source) {
	if (!source || source === "all" || source === "All") return true;
	const kind = adultProviderKind(video);
	const needle = source.replace(/^source-/, "").toLowerCase();
	if (kind && (kind === needle || needle.startsWith(`${kind}-`) || needle === kind)) return true;
	if (needle.startsWith("reddit") && kind === "reddit") return true;
	return false;
}
function videoMatchesAdultTag(video, tag, tags) {
	if (!tag || tag === "All" || tag === "all") return true;
	if (tag.startsWith("source-")) return videoMatchesAdultSource(video, tag);
	const itemTags = tags[video.id] ?? [];
	if (itemTags.includes(tag)) return true;
	if (itemTags.some((item) => adultTaxonomyTags(item).includes(tag))) return true;
	if (tag.startsWith("creator-")) {
		const slug = tag.slice(8);
		const name = (video.remote?.channelName ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
		return Boolean(slug) && name === slug;
	}
	return false;
}
function countAdultBySource(videos) {
	const counts = { all: videos.length };
	for (const provider of ADULT_PULL_PROVIDERS) counts[provider] = 0;
	for (const video of videos) {
		const kind = adultProviderKind(video);
		if (kind) counts[kind] = (counts[kind] ?? 0) + 1;
	}
	return counts;
}
/** Stable personal-interest tags for the main Adults browser. Sources and
* creators already have dedicated filters; raw API keyword dumps stay
* searchable without flooding the browse chips. */
function isAdultInterestTag(tag) {
	return tag.startsWith("fetish-") || isAdultGenreTag(tag);
}
function redditSignal(tags) {
	let score = 0;
	for (const tag of tags) {
		if (tag.startsWith("source-reddit") || tag.startsWith("sub-")) score += 2;
		if (tag === "reddit-photo" || tag === "reddit-video") score += 1.5;
		if (tag.startsWith("fetish-")) score += .6;
	}
	return score;
}
function scoreAdultVideo(video, ctx) {
	const itemTags = ctx.tags[video.id] ?? [];
	const rating = ctx.ratingOf(video.id);
	const came = Math.min(24, (ctx.cameCounts[video.id] ?? 0) * 7);
	const views = Math.min(8, (ctx.viewCounts?.[video.id] ?? 0) * 1.2);
	const boost = itemTags.reduce((sum, tag) => sum + adultTagRankBoost(tag), 0);
	const recency = Math.max(0, 1 - (Date.now() - video.addedAt) / 18144e5) * 8;
	const reddit = video.remote?.kind === "reddit" ? 6 + redditSignal(itemTags) : redditSignal(itemTags);
	return rating * 14 + (ctx.favorites[video.id] ? 10 : 0) + (ctx.likes[video.id] ? 6 : 0) + came + views + boost + recency + reddit + Math.min(6, itemTags.length) * .35;
}
/**
* Metadata stays searchable and useful to recommendations without becoming an
* unmanageable filter list.  Provider/source, creator and mechanical ingest
* labels remain dedicated facets; the remaining verified provider metadata is
* scored with the same personal signals as curated interests.
*/
function isAdultMetaTag(tag) {
	return isAdultMetaTaxonomyTag(tag) || Boolean(tag) && !isAdultInterestTag(tag) && !tag.startsWith("source-") && !tag.startsWith("creator-") && !tag.startsWith("auto-") && !tag.startsWith("sub-") && !tag.startsWith("provider-") && !tag.startsWith("format-") && !/^(?:adult|video|photo|live|cam|image|explicit|https?|www|com|eporner|redtube|reddit|chaturbate|camsoda|myfreecams|booru|redgifs)$/.test(tag) && tag.length >= 3 && !/(?:https?|\bwww\b|redgifs|eporner|redtube)/.test(tag);
}
function rankAdultTags(videos, ctx, limit = 64) {
	const rows = /* @__PURE__ */ new Map();
	for (const video of videos) {
		const rating = ctx.ratingOf(video.id);
		const signal = Math.max(rating, ctx.favorites[video.id] ? 4 : 0, ctx.likes[video.id] ? 3 : 0, Math.min(5, ctx.cameCounts[video.id] ?? 0), 1);
		const kind = adultProviderKind(video);
		const itemTags = ctx.tags[video.id] ?? [];
		for (const tag of /* @__PURE__ */ new Set([...itemTags, ...itemTags.flatMap(adultTaxonomyTags)])) {
			if (!isAdultInterestTag(tag)) continue;
			const row = rows.get(tag) ?? {
				total: 0,
				count: 0,
				recent: 0
			};
			const redditBoost = kind === "reddit" && (tag.startsWith("source-reddit") || tag.startsWith("sub-") || tag.startsWith("fetish-")) ? 2 : 0;
			row.total += signal + adultTagRankBoost(tag) + redditBoost;
			row.count += 1;
			row.recent = Math.max(row.recent, video.addedAt);
			rows.set(tag, row);
		}
	}
	const now = Date.now();
	return [...rows.entries()].map(([tag, row]) => {
		const engagement = (row.total + 9) / (row.count + 3);
		const recency = Math.max(0, 1 - (now - row.recent) / 2592e6);
		return {
			tag,
			count: row.count,
			score: engagement * 12 + row.count * .35 + recency * 4 + adultTagRankBoost(tag)
		};
	}).sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, limit);
}
function sortAdultVideos(videos, ctx) {
	const scored = videos.map((video) => ({
		video,
		score: scoreAdultVideo(video, ctx)
	})).sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt);
	const byProvider = /* @__PURE__ */ new Map();
	for (const item of scored) {
		const provider = adultProviderKind(item.video) || "other";
		const bucket = byProvider.get(provider) ?? [];
		bucket.push(item);
		byProvider.set(provider, bucket);
	}
	const providers = [...byProvider.entries()].sort(([, a], [, b]) => (b[0]?.score ?? 0) - (a[0]?.score ?? 0)).map(([provider]) => provider);
	const ordered = [];
	while (providers.length) for (let index = providers.length - 1; index >= 0; index -= 1) {
		const provider = providers[index];
		const next = byProvider.get(provider)?.shift();
		if (next) ordered.push(next.video);
		if (!byProvider.get(provider)?.length) providers.splice(index, 1);
	}
	return ordered;
}
function rankAdultMetaTags(videos, ctx, limit = 64) {
	const rows = /* @__PURE__ */ new Map();
	for (const video of videos) {
		const engagement = Math.max(ctx.ratingOf(video.id), ctx.favorites[video.id] ? 4 : 0, ctx.likes[video.id] ? 3 : 0, Math.min(5, ctx.cameCounts[video.id] ?? 0), 1);
		const provider = adultProviderKind(video) || "other";
		const itemTags = ctx.tags[video.id] ?? [];
		for (const tag of /* @__PURE__ */ new Set([...itemTags, ...itemTags.flatMap(adultTaxonomyTags)])) {
			if (!isAdultMetaTag(tag)) continue;
			const row = rows.get(tag) ?? {
				total: 0,
				count: 0,
				recent: 0,
				providers: /* @__PURE__ */ new Set()
			};
			row.total += engagement;
			row.count += 1;
			row.recent = Math.max(row.recent, video.addedAt);
			row.providers.add(provider);
			rows.set(tag, row);
		}
	}
	const now = Date.now();
	return [...rows.entries()].map(([tag, row]) => {
		const engagement = (row.total + 6) / (row.count + 2);
		const recency = Math.max(0, 1 - (now - row.recent) / 2592e6);
		return {
			tag,
			count: row.count,
			score: engagement * 10 + row.count * .25 + recency * 3 + Math.min(4, row.providers.size) * 1.5
		};
	}).sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, limit);
}
function buildAdultStatsSnapshot(videos, folders, tags, ctx) {
	const adultIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
	const matchedAdults = videos.filter((video) => adultIds.has(video.folderId) || Boolean(adultProviderKind(video)));
	const adultVideos = [...new Map(matchedAdults.map((video) => [video.id, video])).values()];
	const rankCtx = {
		...ctx,
		tags
	};
	const ranked = rankAdultTags(adultVideos, rankCtx, 120);
	const metaRanked = rankAdultMetaTags(adultVideos, rankCtx, 120);
	const sources = countAdultBySource(adultVideos);
	const providerMix = ADULT_PULL_PROVIDERS.map((provider) => ({
		provider,
		label: adultRemoteLabel(provider),
		titles: sources[provider] ?? 0,
		share: adultVideos.length ? (sources[provider] ?? 0) / adultVideos.length : 0,
		status: sources[provider] ?? 0 ? "active" : "empty"
	})).sort((a, b) => b.titles - a.titles || a.label.localeCompare(b.label));
	return {
		at: Date.now(),
		titles: adultVideos.length,
		sources,
		providerMix,
		genres: ranked.filter((row) => isAdultGenreTag(row.tag)).slice(0, 40).map((row) => ({
			...row,
			label: adultTaxonomyLabel(row.tag)
		})),
		topTags: ranked.slice(0, 60),
		metaTags: metaRanked.slice(0, 60),
		fetishTags: ranked.filter((row) => row.tag.startsWith("fetish-")).slice(0, 40),
		redditTags: ranked.filter((row) => row.tag.includes("reddit") || row.tag.startsWith("sub-")).slice(0, 40),
		markedTitles: adultVideos.filter((video) => (ctx.cameCounts[video.id] ?? 0) > 0).length,
		totalMarks: adultVideos.reduce((sum, video) => sum + (ctx.cameCounts[video.id] ?? 0), 0)
	};
}
function adultStatsToCsv(snapshot) {
	const quote = (value) => `"${String(value).replaceAll("\"", "\"\"")}"`;
	const rows = [
		[
			"metric",
			"key",
			"count",
			"score"
		],
		[
			"titles",
			"all",
			snapshot.titles,
			""
		],
		[
			"marked_titles",
			"i-cummed",
			snapshot.markedTitles,
			""
		],
		[
			"total_marks",
			"i-cummed",
			snapshot.totalMarks,
			""
		]
	];
	for (const [key, count] of Object.entries(snapshot.sources)) rows.push([
		"source",
		key,
		count,
		""
	]);
	for (const row of snapshot.providerMix) rows.push([
		"provider_mix",
		`${row.provider}:${row.status}:${Math.round(row.share * 100)}%`,
		row.titles,
		""
	]);
	for (const row of snapshot.genres) rows.push([
		"genre",
		row.tag,
		row.count,
		row.score.toFixed(2)
	]);
	for (const row of snapshot.topTags) rows.push([
		"tag",
		row.tag,
		row.count,
		row.score.toFixed(2)
	]);
	for (const row of snapshot.metaTags) rows.push([
		"meta_tag",
		row.tag,
		row.count,
		row.score.toFixed(2)
	]);
	for (const row of snapshot.redditTags) rows.push([
		"reddit_tag",
		row.tag,
		row.count,
		row.score.toFixed(2)
	]);
	return rows.map((row) => row.map(quote).join(",")).join("\n");
}
function downloadTextFile(body, filename, mime) {
	const url = URL.createObjectURL(new Blob([body], { type: mime }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function exportAdultStats(snapshot, format) {
	const stamp = new Date(snapshot.at).toISOString().slice(0, 10);
	if (format === "json") {
		downloadTextFile(JSON.stringify(snapshot, null, 2), `reelcase-adult-stats-${stamp}.json`, "application/json");
		return;
	}
	downloadTextFile(adultStatsToCsv(snapshot), `reelcase-adult-stats-${stamp}.csv`, "text/csv;charset=utf-8");
}
var startedAt = typeof performance === "undefined" ? Date.now() : performance.now();
var trace = { startedAt };
/** Records the first mounted shelf only. It is local diagnostics, not analytics. */
function markFirstShelf(title, cards) {
	if (trace.firstShelfAt) return;
	const now = typeof performance === "undefined" ? Date.now() : performance.now();
	trace = {
		startedAt,
		firstShelfAt: now,
		elapsedMs: Math.round(now - startedAt),
		title,
		cards
	};
}
function getFirstShelfTrace() {
	return trace;
}
var DEVICE_ID_KEY = "reelcase.network-device.v1";
function newDeviceId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (letter) => {
		const value = Math.floor(Math.random() * 16);
		return (letter === "x" ? value : value & 3 | 8).toString(16);
	});
}
function getDeviceId() {
	try {
		const saved = localStorage.getItem(DEVICE_ID_KEY);
		if (saved && /^[a-z0-9-]{8,64}$/i.test(saved)) return saved;
		const next = newDeviceId();
		localStorage.setItem(DEVICE_ID_KEY, next);
		return next;
	} catch {
		return newDeviceId();
	}
}
function deviceDetails() {
	const mobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
	const browser = /edg\//i.test(navigator.userAgent) ? "Edge" : /firefox\//i.test(navigator.userAgent) ? "Firefox" : /chrome\//i.test(navigator.userAgent) ? "Chrome" : "Browser";
	return {
		label: `${mobile ? "Mobile" : "Desktop"} · ${browser}`,
		kind: mobile ? "mobile" : "desktop"
	};
}
function getNetworkDeviceId() {
	return getDeviceId();
}
async function announceNetworkPresence() {
	const details = deviceDetails();
	const response = await fetch("/api/network-presence", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			id: getDeviceId(),
			...details
		}),
		keepalive: true
	});
	if (!response.ok) throw new Error("Network presence could not be updated");
	return response.json();
}
async function listNetworkDevices() {
	const response = await fetch("/api/network-presence", { cache: "no-store" });
	if (!response.ok) throw new Error("Network devices could not be read");
	return response.json();
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
	const [artIndex, setArtIndex] = (0, import_react.useState)(0);
	const artwork = [
		thumb,
		video.poster,
		video.remote?.previewUrl,
		...adultThumbCandidatesForVideo(video)
	].filter((url, index, all) => Boolean(url) && all.indexOf(url) === index);
	const art = artwork[artIndex];
	(0, import_react.useEffect)(() => {
		request(video);
	}, [request, video]);
	(0, import_react.useEffect)(() => setArtIndex(0), [video.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative mb-8 overflow-hidden rounded-xl bg-elevated shadow-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-video max-h-[min(72vh,560px)] w-full min-h-64",
			children: [
				art ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: art,
					alt: "",
					decoding: "async",
					referrerPolicy: "no-referrer",
					onError: () => setArtIndex((index) => Math.min(index + 1, artwork.length)),
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
function TitleRail({ title, videos, variant = "poster", playedAt, onTitleClick, reason }) {
	const shelfRef = (0, import_react.useRef)(null);
	const railRef = (0, import_react.useRef)(null);
	const scrollLeft = (0, import_react.useRef)(0);
	const leaveTimer = (0, import_react.useRef)(void 0);
	const [nearViewport, setNearViewport] = (0, import_react.useState)(false);
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [shelfHeight, setShelfHeight] = (0, import_react.useState)();
	const [railWidth, setRailWidth] = (0, import_react.useState)(0);
	const [windowStart, setWindowStart] = (0, import_react.useState)(0);
	const cardStride = variant === "poster" ? 148 : 236;
	(0, import_react.useEffect)(() => {
		const shelf = shelfRef.current;
		if (!shelf || !videos.length) return;
		if (typeof IntersectionObserver === "undefined") {
			setNearViewport(true);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting || shelf.contains(document.activeElement)) {
				if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
				leaveTimer.current = void 0;
				setNearViewport(true);
				return;
			}
			if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
			leaveTimer.current = window.setTimeout(() => setNearViewport(false), 1200);
		}, { rootMargin: "480px 0px" });
		observer.observe(shelf);
		return () => {
			observer.disconnect();
			if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
		};
	}, [Boolean(videos.length)]);
	(0, import_react.useEffect)(() => {
		const shelf = shelfRef.current;
		if (!shelf || !nearViewport) return;
		const observer = new ResizeObserver(() => setShelfHeight(shelf.getBoundingClientRect().height));
		observer.observe(shelf);
		return () => observer.disconnect();
	}, [nearViewport]);
	(0, import_react.useEffect)(() => {
		const rail = railRef.current;
		if (!rail || !nearViewport) return;
		const sync = () => setRailWidth(Math.max(320, Math.round(rail.clientWidth)));
		sync();
		const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : void 0;
		observer?.observe(rail);
		return () => observer?.disconnect();
	}, [nearViewport, variant]);
	const [limit, setLimit] = (0, import_react.useState)(() => savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
	(0, import_react.useEffect)(() => {
		const sync = () => setLimit(savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
		window.addEventListener("reelcase:render-settings", sync);
		return () => window.removeEventListener("reelcase:render-settings", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		if (nearViewport && videos.length) markFirstShelf(title, Math.min(videos.length, limit));
	}, [
		nearViewport,
		limit,
		title,
		videos.length
	]);
	if (!videos.length) return null;
	const shown = videos.slice(0, limit);
	const overscan = 3;
	const visibleSlots = Math.max(6, Math.ceil((railWidth || 800) / cardStride) + 6);
	const maxStart = Math.max(0, shown.length - visibleSlots);
	const start = Math.max(0, Math.min(windowStart, maxStart));
	const end = Math.min(shown.length, start + visibleSlots);
	const windowed = shown.slice(start, end);
	const leadPx = start * cardStride;
	const trailPx = Math.max(0, shown.length - end) * cardStride;
	const endCaps = Math.max(0, Math.min(6, Math.min(limit, 8) - shown.length));
	const onRailScroll = (rail) => {
		scrollLeft.current = rail.scrollLeft;
		const nextStart = Math.max(0, Math.floor(rail.scrollLeft / cardStride) - overscan);
		setWindowStart((current) => current === nextStart ? current : nextStart);
		if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 160) setLimit((value) => Math.min(videos.length, value + 16));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: shelfRef,
		className: "media-shelf mb-8",
		style: !nearViewport ? { minHeight: shelfHeight ?? (variant === "poster" ? 320 : 250) } : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
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
				}), reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 truncate text-xs text-muted",
					children: reason
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1",
				children: [videos.length > limit && !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					className: "text-xs",
					onClick: () => setLimit((value) => Math.min(videos.length, value + 16)),
					children: ["Show 16 more · ", videos.length - limit]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					"aria-expanded": !collapsed,
					"aria-label": `${collapsed ? "Expand" : "Minimize"} ${title}`,
					onClick: () => setCollapsed((value) => !value),
					children: [collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" }), collapsed ? "Expand" : "Minimize"]
				})]
			})]
		}), nearViewport && !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: (rail) => {
				railRef.current = rail;
				if (rail) rail.scrollLeft = scrollLeft.current;
			},
			onScroll: (event) => onRailScroll(event.currentTarget),
			className: "rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4",
			children: [
				leadPx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": "true",
					className: "shrink-0",
					style: {
						width: leadPx,
						height: 1
					}
				}),
				windowed.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn(variant === "poster" && "w-32 shrink-0 sm:w-36 md:w-40", variant === "rail" && "shrink-0"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
						video,
						variant,
						index: start + i,
						playedAt: playedAt?.[video.id]
					})
				}, video.id)),
				trailPx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": "true",
					className: "shrink-0",
					style: {
						width: trailPx,
						height: 1
					}
				}),
				Array.from({ length: endCaps }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": "true",
					className: cn("shrink-0 rounded-md border border-border/50 bg-elevated/35", variant === "poster" ? "aspect-poster w-32 sm:w-36 md:w-40" : "h-36 w-56")
				}, `end-cap-${index}`))
			]
		})]
	});
}
function PosterGrid({ videos }) {
	const gridRef = (0, import_react.useRef)(null);
	const leaveTimer = (0, import_react.useRef)(void 0);
	const [nearViewport, setNearViewport] = (0, import_react.useState)(false);
	const [gridHeight, setGridHeight] = (0, import_react.useState)();
	const [pageSize, setPageSize] = (0, import_react.useState)(() => savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 48));
	(0, import_react.useEffect)(() => {
		const sync = () => setPageSize(savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 48));
		window.addEventListener("reelcase:render-settings", sync);
		return () => window.removeEventListener("reelcase:render-settings", sync);
	}, []);
	const safePageSize = pageSize;
	const [limit, setLimit] = (0, import_react.useState)(safePageSize);
	(0, import_react.useEffect)(() => setLimit(safePageSize), [safePageSize, videos.length]);
	(0, import_react.useEffect)(() => {
		const grid = gridRef.current;
		if (!grid || !videos.length) return;
		if (typeof IntersectionObserver === "undefined") {
			setNearViewport(true);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting || grid.contains(document.activeElement)) {
				if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
				leaveTimer.current = void 0;
				setNearViewport((current) => current ? current : true);
				return;
			}
			if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
			leaveTimer.current = window.setTimeout(() => setNearViewport(false), 1400);
		}, { rootMargin: "560px 0px" });
		observer.observe(grid);
		return () => {
			observer.disconnect();
			if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
		};
	}, [videos.length]);
	(0, import_react.useEffect)(() => {
		const grid = gridRef.current;
		if (!grid || !nearViewport || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() => {
			const next = Math.round(grid.getBoundingClientRect().height);
			setGridHeight((current) => current === next ? current : next);
		});
		observer.observe(grid);
		return () => observer.disconnect();
	}, [nearViewport]);
	if (!videos.length) return null;
	const visible = videos.slice(0, limit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		ref: gridRef,
		className: "media-shelf",
		style: !nearViewport ? { minHeight: gridHeight ?? 900 } : void 0,
		children: nearViewport && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7",
			children: visible.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
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
		})] })
	});
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
		const candidatePool = videos.filter((video) => !video.remote?.live && !video.isSample);
		const chosen = [];
		for (const video of candidatePool) {
			const classicFallback = video.collection === "classics" || /classic|noir/i.test(`${video.name} ${video.remote?.channelName ?? ""}`);
			const freshness = Math.max(1, Math.min(8, (video.addedAt - Date.now() + 31536e6) / 3942e6));
			const weight = (video.remote ? 7 : 2) + freshness + (classicFallback ? -6 : 0);
			const entry = {
				video,
				score: random() * Math.max(.25, weight)
			};
			if (chosen.length < 12) {
				chosen.push(entry);
				continue;
			}
			let weakest = 0;
			for (let index = 1; index < chosen.length; index += 1) if (chosen[index].score < chosen[weakest].score) weakest = index;
			if (entry.score > chosen[weakest].score) chosen[weakest] = entry;
		}
		return chosen.map((entry) => entry.video);
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
function RatingStreakCard() {
	const [snapshot, setSnapshot] = (0, import_react.useState)(() => getRatingStreakSnapshot());
	(0, import_react.useEffect)(() => {
		const refresh = () => setSnapshot(getRatingStreakSnapshot());
		window.addEventListener("reelcase:rating-streak-change", refresh);
		return () => window.removeEventListener("reelcase:rating-streak-change", refresh);
	}, []);
	const remaining = Math.max(0, snapshot.weeklyGoal - snapshot.thisWeek);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8 rounded-xl border border-border bg-surface p-5 shadow-border sm:p-6",
		"aria-label": "Rating streak",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4" }), "Rating rhythm"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Small ratings, clearer shelves."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: remaining ? `${remaining} more distinct rating${remaining === 1 ? "" : "s"} unlocks this week’s local reward.` : "This week’s local reward is unlocked."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated px-4 py-3 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Weekly streak"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-2xl text-fg",
						children: [
							snapshot.weeklyStreak,
							" week",
							snapshot.weeklyStreak === 1 ? "" : "s"
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 h-2 overflow-hidden rounded-full bg-bg/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full bg-accent transition-[width] duration-200 ease-out",
					style: { width: `${Math.min(100, snapshot.thisWeek / snapshot.weeklyGoal * 100)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					snapshot.thisWeek,
					" of ",
					snapshot.weeklyGoal,
					" rated this week"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: snapshot.nextReward })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mr-1 text-xs text-muted",
					children: "Weekly goal"
				}), RATING_GOALS.map((goal) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: snapshot.weeklyGoal === goal ? "default" : "secondary",
					onClick: () => {
						setRatingWeeklyGoal(goal);
						setSnapshot(getRatingStreakSnapshot());
					},
					children: [goal, " ratings"]
				}, goal))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-3",
				children: snapshot.rewards.map((reward) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-elevated px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [reward.earned ? "Earned · " : "Next · ", reward.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: reward.detail
					})]
				}, reward.label))
			})
		]
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
	const [visibleLimit, setVisibleLimit] = (0, import_react.useState)(120);
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
	(0, import_react.useEffect)(() => setVisibleLimit(120), [
		filter,
		search,
		sort
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
	const favorites = useLibrary((s) => s.favorites);
	const progress = useLibrary((s) => s.progress);
	const resumeProgress = useLibrary((s) => s.resumeProgress);
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
				const mark = resumeForVideo({
					progress,
					resumeProgress
				}, video);
				if (mark && mark.t >= (video.remote ? 2 : 5) && mark.t / mark.d < (video.remote ? .992 : .985)) continueCount += 1;
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
				adultCount,
				ytCount,
				twitchCount,
				liveCount,
				continueCount,
				favCount,
				historyCount
			}
		};
	}, [
		favorites,
		folders,
		hideDemo,
		history,
		progress,
		resumeProgress,
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
						icon: Flame,
						label: "Adults",
						count: counts.adultCount
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
					adultFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
				}), sourceId === "adults" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
var worker = null;
var sequence = 0;
var pending = /* @__PURE__ */ new Map();
var status = "idle";
var listeners = /* @__PURE__ */ new Set();
function setStatus(next) {
	status = next;
	listeners.forEach((listener) => listener(status));
}
function instance() {
	if (!worker) {
		worker = new Worker(new URL("./search.worker.ts", import.meta.url), { type: "module" });
		worker.onmessage = ({ data }) => {
			if (data.type === "ready") {
				setStatus("ready");
				return;
			}
			pending.get(data.requestId)?.(data.ids);
		};
	}
	return worker;
}
var searchWorkerIndex = {
	sync(videos, tags, categories) {
		const documents = videos.map((v) => ({
			id: v.id,
			text: [
				v.name,
				v.path,
				v.genre,
				v.tagline,
				v.collection,
				v.description,
				categories[v.id],
				...tags[v.id] ?? [],
				...topicsForVideo(v, tags[v.id]),
				v.remote?.channelName,
				v.remote?.channelId,
				v.remote?.kind
			].filter(Boolean).join(" ")
		}));
		setStatus("building");
		instance().postMessage({
			type: "sync",
			documents
		});
	},
	search(query) {
		return new Promise((resolve) => {
			const requestId = ++sequence;
			pending.set(requestId, (ids) => {
				pending.delete(requestId);
				resolve(ids);
			});
			instance().postMessage({
				type: "search",
				requestId,
				query
			});
		});
	},
	getStatus() {
		return status;
	},
	subscribe(listener) {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}
};
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
	const [workerIds, setWorkerIds] = (0, import_react.useState)(null);
	const [searchIndexStatus, setSearchIndexStatus] = (0, import_react.useState)(searchWorkerIndex.getStatus());
	(0, import_react.useEffect)(() => searchWorkerIndex.subscribe(setSearchIndexStatus), []);
	(0, import_react.useEffect)(() => {
		let active = true;
		if (!needle) {
			setWorkerIds(null);
			return;
		}
		searchWorkerIndex.search(needle).then((ids) => {
			if (active) setWorkerIds(ids);
		});
		return () => {
			active = false;
		};
	}, [needle]);
	const videoById = (0, import_react.useMemo)(() => new Map(videos.map((video) => [video.id, video])), [videos]);
	const hits = (0, import_react.useMemo)(() => {
		if (!needle) return [];
		const indexedIds = workerIds ? new Set(workerIds) : librarySearchIndex.search(needle);
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
		videos,
		workerIds
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
						children: [
							searchIndexStatus === "building" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-2 text-xs text-muted",
								children: "Warming the local search index… suggestions are using the fast fallback."
							}),
							hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							})
						]
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
var PAGE = 36;
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
		}, { rootMargin: "400px 0px" });
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
var ADULT_PROVIDER_ADAPTERS = [
	{
		id: "eporner",
		label: "Eporner",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster",
			"playback"
		]
	},
	{
		id: "redtube",
		label: "RedTube",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster",
			"playback"
		]
	},
	{
		id: "reddit",
		label: "Reddit",
		transport: "atom-rss",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster"
		]
	},
	{
		id: "redgifs",
		label: "Redgifs",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"poster",
			"playback"
		]
	},
	{
		id: "new-provider",
		label: "New documented provider",
		transport: "public-api",
		status: "planned",
		capabilities: [
			"catalog",
			"search",
			"poster"
		]
	}
];
var ORDERS = [
	{
		id: "top-weekly",
		label: "Top this week"
	},
	{
		id: "most-popular",
		label: "Most popular"
	},
	{
		id: "latest",
		label: "Latest"
	},
	{
		id: "top-rated",
		label: "Top rated"
	}
];
var PROVIDER_CHOICES = [
	{
		id: "all",
		label: "All pull sources"
	},
	{
		id: ["eporner", "redtube"],
		label: "Videos (Eporner + RedTube)"
	},
	{
		id: [
			"chaturbate",
			"camsoda",
			"myfreecams"
		],
		label: "Live cams"
	},
	{
		id: ["chaturbate"],
		label: "Chaturbate only"
	},
	{
		id: ["camsoda"],
		label: "CamSoda only"
	},
	{
		id: ["myfreecams"],
		label: "MyFreeCams only"
	},
	{
		id: ["reddit"],
		label: "Reddit (18+)"
	},
	{
		id: ["booru"],
		label: "Booru photos (18+)"
	},
	{
		id: ["redgifs"],
		label: "Redgifs (needs API key)"
	},
	{
		id: ["eporner"],
		label: "Eporner only"
	},
	{
		id: ["redtube"],
		label: "RedTube only"
	}
];
var REDDIT_SOURCE_STORAGE_KEY = "reelcase.adult-reddit-sources.v1";
function readRedditSourceSettings() {
	try {
		const raw = JSON.parse(localStorage.getItem(REDDIT_SOURCE_STORAGE_KEY) ?? "[]");
		if (!Array.isArray(raw)) return [];
		const seen = /* @__PURE__ */ new Set();
		const settings = [];
		for (const item of raw.slice(0, 120)) {
			const row = item && typeof item === "object" ? item : {};
			const subreddit = String(row.subreddit ?? "").trim().replace(/^r\//i, "");
			if (!/^[a-z0-9_]{3,48}$/i.test(subreddit) || seen.has(subreddit.toLowerCase())) continue;
			seen.add(subreddit.toLowerCase());
			const priority = Number(row.priority);
			settings.push({
				subreddit,
				priority: priority >= 3 ? 3 : priority <= 1 ? 1 : 2
			});
		}
		return settings;
	} catch {
		return [];
	}
}
function SiteCard({ name, href, copy, embeds, badge, sourceId, compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: `group rounded-lg bg-surface shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover ${compact ? "p-2.5" : "p-4"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: compact ? "text-sm font-medium text-fg" : "font-display text-xl text-fg",
					children: name
				}), (embeds || badge) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-accent uppercase",
					children: badge ?? "Embeds"
				})]
			}),
			!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: copy
			}),
			sourceId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[10px] tracking-wide text-subtle uppercase",
				children: ["source tag · #", adultSourceTag(sourceId)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: `${compact ? "mt-1.5 text-xs" : "mt-3 text-sm"} inline-flex items-center gap-1.5 font-medium text-accent`,
				children: ["Open site ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
			})
		]
	});
}
function AdultPanel({ showMilestones = false, autoPull = true, sourceFilter = "all", tagFilter: tagFilterProp, onSourceFilter, onTagFilter }) {
	const searchAdultFeed = useLibrary((s) => s.searchAdultFeed);
	const remoteBusy = useLibrary((s) => s.remoteBusy);
	const importProgress = useLibrary((s) => s.importProgress);
	const tags = useLibrary((s) => s.tags);
	const adultVideos = useLibrary(useShallow(selectAdultRemote));
	const [query, setQuery] = (0, import_react.useState)("");
	const [order, setOrder] = (0, import_react.useState)("top-weekly");
	const [providers, setProviders] = (0, import_react.useState)("all");
	const [booted, setBooted] = (0, import_react.useState)(false);
	const [localTag, setLocalTag] = (0, import_react.useState)("all");
	const tagFilter = tagFilterProp ?? localTag;
	const setTagFilter = (tag) => {
		setLocalTag(tag);
		if (tag.startsWith("source-") || tag === "all") onSourceFilter?.(tag === "all" ? "all" : tag.replace(/^source-/, "").split("-")[0] ?? "all");
		onTagFilter?.(tag === "all" ? "All" : tag);
	};
	const [nextPage, setNextPage] = (0, import_react.useState)(2);
	const [showAllFetishes, setShowAllFetishes] = (0, import_react.useState)(false);
	const [starQuery, setStarQuery] = (0, import_react.useState)("");
	const [stars, setStars] = (0, import_react.useState)([]);
	const [starNote, setStarNote] = (0, import_react.useState)("");
	const [archiveLabel, setArchiveLabel] = (0, import_react.useState)("No saved archive depth yet — Pull catalog starts at page 1.");
	const [autoArchiveRounds, setAutoArchiveRounds] = (0, import_react.useState)(0);
	const [adultMaxVideos, setAdultMaxVideos] = (0, import_react.useState)(LIBRARY_LIMITS.adultInteractiveVideosPerPull);
	const [useCustomRedditSources, setUseCustomRedditSources] = (0, import_react.useState)(false);
	const [redditSources, setRedditSources] = (0, import_react.useState)([]);
	const [redditSourceInput, setRedditSourceInput] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const load = () => {
			const saved = Number(localStorage.getItem("reelcase.adult-pull-limit") ?? LIBRARY_LIMITS.adultInteractiveVideosPerPull);
			setAdultMaxVideos([
				240,
				480,
				800,
				1200
			].includes(saved) ? saved : LIBRARY_LIMITS.adultInteractiveVideosPerPull);
		};
		load();
		window.addEventListener("reelcase:adult-render-settings", load);
		return () => window.removeEventListener("reelcase:adult-render-settings", load);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = readRedditSourceSettings();
		setRedditSources(saved);
		setUseCustomRedditSources(localStorage.getItem(`${REDDIT_SOURCE_STORAGE_KEY}.enabled`) === "true" && saved.length > 0);
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(REDDIT_SOURCE_STORAGE_KEY, JSON.stringify(redditSources));
			localStorage.setItem(`${REDDIT_SOURCE_STORAGE_KEY}.enabled`, String(useCustomRedditSources));
		} catch {}
	}, [redditSources, useCustomRedditSources]);
	const redditPullOptions = (0, import_react.useMemo)(() => useCustomRedditSources && redditSources.length ? { redditSources } : {}, [redditSources, useCustomRedditSources]);
	const sourceCounts = (0, import_react.useMemo)(() => countAdultBySource(adultVideos), [adultVideos]);
	const sourceFacets = (0, import_react.useMemo)(() => ADULT_SOURCE_FILTERS.filter((row) => row.id !== "all").map((row) => [row.id, sourceCounts[row.id] ?? 0]), [sourceCounts]);
	const [facetsReady, setFacetsReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setFacetsReady(false);
		let cancelled = false;
		const ready = () => {
			if (!cancelled) setFacetsReady(true);
		};
		const ric = window.requestIdleCallback;
		if (typeof ric === "function") {
			const id = ric(ready, { timeout: 1200 });
			return () => {
				cancelled = true;
				window.cancelIdleCallback(id);
			};
		}
		const id = window.setTimeout(ready, 200);
		return () => {
			cancelled = true;
			window.clearTimeout(id);
		};
	}, [adultVideos.length]);
	const creatorFacets = (0, import_react.useMemo)(() => {
		if (!facetsReady) return [];
		const counts = /* @__PURE__ */ new Map();
		for (const video of adultVideos) for (const tag of tags[video.id] ?? []) if (tag.startsWith("creator-")) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		return [...counts.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
	}, [
		adultVideos,
		facetsReady,
		tags
	]);
	const fetishFacets = (0, import_react.useMemo)(() => {
		if (!facetsReady) return [];
		const counts = /* @__PURE__ */ new Map();
		for (const video of adultVideos) for (const tag of tags[video.id] ?? []) if (tag.startsWith("fetish-")) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 24);
	}, [
		adultVideos,
		facetsReady,
		tags
	]);
	(0, import_react.useEffect)(() => {
		if (!autoPull || booted) return;
		setBooted(true);
		if (adultVideos.length >= LIBRARY_LIMITS.adultFastStartVideosPerPull) return;
		searchAdultFeed("all", "top-weekly", {
			providers: "all",
			maxVideos: adultMaxVideos,
			...redditPullOptions
		}).then((n) => {
			setNextPage(2);
			if (n) toast.success(`Loaded ${n.toLocaleString()} adult titles`);
		}).catch((err) => {
			toast.error(err instanceof Error ? err.message : "Could not load adult feed.");
		});
	}, [
		adultMaxVideos,
		autoPull,
		booted,
		adultVideos.length,
		redditPullOptions,
		searchAdultFeed
	]);
	const refreshArchiveLabel = (q, ord) => {
		setArchiveLabel(adultArchiveDepthLabel(loadAdultArchiveCursors(q, ord)));
	};
	(0, import_react.useEffect)(() => {
		refreshArchiveLabel(query.trim() || "all", order);
	}, [
		query,
		order,
		adultVideos.length
	]);
	const runSearch = (append = false, resume = false) => {
		const q = query.trim() || "all";
		const cursors = loadAdultArchiveCursors(q, order);
		const providerPages = resume ? Object.fromEntries(Object.entries(cursors).map(([provider, row]) => [provider, row.page])) : void 0;
		const page = append || resume ? resume ? 1 : nextPage : 1;
		searchAdultFeed(q, order, {
			page: resume ? 1 : page,
			maxVideos: adultMaxVideos,
			append: append || resume,
			providers,
			providerPages,
			...redditPullOptions
		}).then((n) => {
			setNextPage((resume ? Math.max(2, ...Object.values(cursors).map((c) => c.page)) : page) + 1);
			setTagFilter("all");
			refreshArchiveLabel(q, order);
			toast.success(n ? `${append || resume ? "Catalog now has" : "Loaded"} ${n.toLocaleString()} adult titles` : "No results");
		}).catch((err) => {
			toast.error(err instanceof Error ? err.message : "Search failed");
		});
	};
	(0, import_react.useEffect)(() => {
		if (!autoPull || remoteBusy || query.trim() || providers !== "all" || adultVideos.length >= LIBRARY_LIMITS.adultTargetCatalogVideos || autoArchiveRounds >= LIBRARY_LIMITS.adultAutoArchivePagesPerVisit) return;
		const timer = window.setTimeout(() => {
			setAutoArchiveRounds((rounds) => rounds + 1);
			runSearch(false, true);
		}, LIBRARY_LIMITS.adultAutoArchiveDelayMs);
		return () => window.clearTimeout(timer);
	}, [
		adultVideos.length,
		autoArchiveRounds,
		autoPull,
		order,
		providers,
		query,
		redditPullOptions,
		remoteBusy
	]);
	const milestoneLinks = ADULT_MILESTONE_LINKS.filter((site) => site.href !== ADULT_CATEGORY_HUB.href);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 flex flex-col gap-5",
		children: [showMilestones && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-xl bg-elevated shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Category hub"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg sm:text-3xl",
							children: "ThePornDude directory"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Collapse this section to keep the Adult catalog compact."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted",
						children: "Use ThePornDude as the main adult category map (tubes, cams, anime, games, niche lists). In-app playback comes from official public APIs below; other destinations stay as milestones with labeled source tags."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, {
							...ADULT_CATEGORY_HUB,
							badge: "Hub"
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-xl bg-elevated shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Adult sites"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg sm:text-3xl",
							children: "Embed-ready pull sources"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Collapse this section to focus on the catalog."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted",
						children: "Official public APIs: Eporner, RedTube, Chaturbate embeds, CamSoda room pages, the MyFreeCams online list, Reddit public Atom RSS for curated 18+ subs, and Gelbooru-style booru JSON (XBooru / TBIB / Hypnohub). If one source errors, the others still fill the shelf."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: ADULT_EMBED_LINKS.map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, { ...site }, site.name))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "order-last rounded-xl bg-elevated shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Link-out destinations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Optional directories grouped below the catalog · ",
							milestoneLinks.length,
							" sites."
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border px-4 pb-4 pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 flex size-9 items-center justify-center rounded-lg bg-surface text-accent shadow-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-2xl text-sm text-muted",
								children: "These sites do not expose a documented public discovery/embed API we can use without scraping or bypassing logins/paywalls. Reelcase keeps them as milestones with source tags — open the official page in a new tab."
							}) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: ADULT_SOURCE_OPTIONS.filter((s) => !s.pull).slice(0, 36).map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: source.href,
								target: "_blank",
								rel: "noreferrer",
								className: "rounded-full bg-surface px-3 py-1 text-xs text-muted shadow-border hover:text-fg",
								children: [
									"#",
									adultSourceTag(source.id),
									" · ",
									source.label
								]
							}, source.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-5",
							children: [
								["cam", "Cams / interactive"],
								["vr", "VR"],
								["tube", "Tubes / aggregators / hubs"],
								["games", "Games"],
								["comic", "Comics"],
								["anime", "Anime / hentai"],
								["community", "Community / Reddit link-outs"],
								["directory", "Stores / directories"],
								["short", "Short-form"],
								["review", "Review / niche hubs"],
								["voyeur", "Live voyeur"],
								["blog", "Blogs"],
								["ai", "AI stories"],
								["extreme", "Extreme (18+)"],
								["download", "Downloads (link-out)"],
								["torrent", "Torrents (link-out)"],
								["feet", "Feet"],
								["cosplay", "Cosplay"],
								["celeb", "Celeb / film nudes"],
								["manhwa", "Manhwa"]
							].map(([group, label]) => {
								const sites = milestoneLinks.filter((site) => site.group === group);
								if (!sites.length) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
									children: sites.map((site) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteCard, {
										...site,
										compact: true,
										badge: group === "cam" || group === "voyeur" ? "Cam/chat" : group === "download" || group === "torrent" ? "Link-out only" : group === "community" || group === "blog" ? "Link-out" : "Milestone"
									}, `${site.sourceId ?? site.name}-${site.href}`))
								})] }, group);
							})
						})
					]
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-xl bg-elevated p-5 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "Remote pull"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-2xl text-fg sm:text-3xl",
					children: "Adult discovery"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: [
						"Failover-friendly pulls via",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.eporner.com/api/v2/",
							target: "_blank",
							rel: "noreferrer",
							className: "text-accent hover:text-fg",
							children: "Eporner API v2"
						}),
						" ",
						"and",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://api.redtube.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "text-accent hover:text-fg",
							children: "RedTube webmaster API"
						}),
						" ",
						"(up to ",
						LIBRARY_LIMITS.adultInteractiveVideosPerPull.toLocaleString(),
						" titles per pull). Every pulled item always gets a filterable ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "source-*"
						}),
						" tag, plus",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "creator-*"
						}),
						" when a username/channel/owner is known, API keywords, and curated fetish tokens mined from titles/descriptions. Cards open the same preview + in-app play window as YouTube and Twitch. Use I cummed to it on a card or in the player to keep a private local count that never leaves this browser."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: PROVIDER_CHOICES.map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: JSON.stringify(providers) === JSON.stringify(choice.id) ? "default" : "secondary",
						onClick: () => setProviders(choice.id),
						children: choice.label
					}, choice.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mt-4 rounded-md border border-border bg-bg/35 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "cursor-pointer text-xs font-medium text-fg",
							children: "Reddit photo sources · custom list and priority"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: [
								"Use the curated rotation, or switch to your own communities. Each imported Reddit photo and video receives both",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "mx-1 text-fg",
									children: "source-reddit-*"
								}),
								" and ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "text-fg",
									children: "sub-*"
								}),
								" tags for filtering."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: useCustomRedditSources ? "default" : "secondary",
								onClick: () => setUseCustomRedditSources((enabled) => !enabled),
								disabled: !redditSources.length,
								children: useCustomRedditSources ? "Using my source list" : "Use my source list"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: useCustomRedditSources ? `${redditSources.length} selected communities` : "Curated rotation active"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: redditSourceInput,
								onChange: (event) => setRedditSourceInput(event.target.value),
								onKeyDown: (event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										const subreddit = redditSourceInput.trim().replace(/^r\//i, "");
										if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) return toast.error("Enter a valid subreddit name.");
										setRedditSources((current) => current.some((row) => row.subreddit.toLowerCase() === subreddit.toLowerCase()) ? current : [...current, {
											subreddit,
											priority: 2
										}]);
										setUseCustomRedditSources(true);
										setRedditSourceInput("");
									}
								},
								placeholder: "Add subreddit, e.g. ExampleSub",
								"aria-label": "Add Reddit source"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									const subreddit = redditSourceInput.trim().replace(/^r\//i, "");
									if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) return toast.error("Enter a valid subreddit name.");
									setRedditSources((current) => current.some((row) => row.subreddit.toLowerCase() === subreddit.toLowerCase()) ? current : [...current, {
										subreddit,
										priority: 2
									}]);
									setUseCustomRedditSources(true);
									setRedditSourceInput("");
								},
								children: "Add source"
							})]
						}),
						redditSources.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: redditSources.slice().sort((a, b) => b.priority - a.priority || a.subreddit.localeCompare(b.subreddit)).map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 rounded-full bg-surface py-1 pl-3 pr-1 text-xs text-muted shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["r/", source.subreddit] }),
									[
										3,
										2,
										1
									].map((priority) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "h-6 px-1.5 text-[10px]",
										variant: source.priority === priority ? "default" : "ghost",
										onClick: () => setRedditSources((current) => current.map((row) => row.subreddit === source.subreddit ? {
											...row,
											priority
										} : row)),
										children: priority === 3 ? "High" : priority === 2 ? "Normal" : "Low"
									}, priority)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "h-6 px-1.5 text-[10px]",
										variant: "ghost",
										onClick: () => setRedditSources((current) => current.filter((row) => row.subreddit !== source.subreddit)),
										children: "Remove"
									})
								]
							}, source.subreddit))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Featured fetish pulls"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Clicking a chip searches official APIs for that keyword (DP expands to double penetration) and stamps fetish tags on ingested titles."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: ADULT_FEATURED_FETISH_TAGS.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "default",
								disabled: remoteBusy,
								onClick: () => {
									const q = fetishSearchQuery(tag);
									setQuery(q);
									setTagFilter(`fetish-${q.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`);
									searchAdultFeed(q, order, {
										page: 1,
										maxVideos: adultMaxVideos,
										providers,
										...redditPullOptions
									}).then((n) => toast.success(`Loaded ${n.toLocaleString()} for #${tag}`));
								},
								children: ["#", tag]
							}, tag))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Full fetish catalog"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => setShowAllFetishes((v) => !v),
								children: showAllFetishes ? "Hide extra chips" : `Show all ${ADULT_CURATED_FETISH_TAGS.length} chips`
							})]
						}),
						showAllFetishes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: ADULT_CURATED_FETISH_TAGS.filter((tag) => !ADULT_FEATURED_FETISH_TAGS.includes(tag)).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: remoteBusy,
								onClick: () => {
									const q = fetishSearchQuery(tag);
									setQuery(q);
									setTagFilter(`fetish-${q.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`);
									searchAdultFeed(q, order, {
										page: 1,
										maxVideos: adultMaxVideos,
										providers,
										...redditPullOptions
									}).then((n) => toast.success(`Loaded ${n.toLocaleString()} for #${tag}`));
								},
								children: ["#", tag]
							}, tag))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-2 sm:flex-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: query,
								onChange: (e) => setQuery(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") runSearch(false);
								},
								placeholder: "Search adult feeds (empty = all)",
								className: "pl-9",
								"aria-label": "Search adult feed"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: ORDERS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: order === o.id ? "default" : "secondary",
								onClick: () => setOrder(o.id),
								children: o.label
							}, o.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => runSearch(false),
							disabled: remoteBusy,
							children: [remoteBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Pull catalog"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => runSearch(true),
							disabled: remoteBusy || !adultVideos.length,
							children: "Load more"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => runSearch(false, true),
							disabled: remoteBusy,
							title: "Resume each provider from its saved archive cursor",
							children: "Continue archive"
						})
					]
				}),
				autoPull && autoArchiveRounds > 0 && adultVideos.length < LIBRARY_LIMITS.adultTargetCatalogVideos && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted",
					children: [
						"Background archive catch-up · ",
						autoArchiveRounds,
						"/",
						LIBRARY_LIMITS.adultAutoArchivePagesPerVisit,
						" saved cursor passes this visit · ",
						adultVideos.length.toLocaleString(),
						"/",
						LIBRARY_LIMITS.adultTargetCatalogVideos.toLocaleString(),
						" title target."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mt-3 rounded-md border border-border bg-bg/35 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "cursor-pointer text-xs font-medium text-fg",
							children: "Provider adapter platform · active and planned sources"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: "Each adapter needs a documented public API, public feed, or permitted embed before it can enter the catalog. This keeps unsupported sites as safe link-outs until their source contract is implemented."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: ADULT_PROVIDER_ADAPTERS.map((adapter) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-xs bg-elevated px-2 py-1 text-xs text-muted",
								children: [
									adapter.label,
									" · ",
									adapter.status,
									" · ",
									adapter.capabilities.join(", ")
								]
							}, adapter.id))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-md bg-bg/40 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "RedTube creator search"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: starQuery,
								onChange: (event) => setStarQuery(event.target.value),
								placeholder: "Star or creator name",
								className: "max-w-xs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: remoteBusy,
								onClick: () => {
									const q = starQuery.trim();
									if (!q) return;
									setProviders(["redtube"]);
									setQuery(q);
									(async () => {
										try {
											const { searchRedtubeStars } = await import("./api-DrSMGXpo.mjs");
											const result = await searchRedtubeStars({ data: {
												query: q,
												page: 1
											} });
											setStars(result.stars);
											setStarNote(result.note);
										} catch (err) {
											setStarNote(err instanceof Error ? err.message : "Star list unavailable.");
										}
									})();
									searchAdultFeed(q, order, {
										providers: ["redtube"],
										maxVideos: LIBRARY_LIMITS.redtubeStarVideosPerPull
									}).then((n) => toast.success(`Loaded ${n.toLocaleString()} for ${q}`));
								},
								children: "Search creator"
							})]
						}),
						starNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: starNote
						}),
						stars.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: stars.map((star) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									setStarQuery(star.name);
									setProviders(["redtube"]);
									setQuery(star.name);
									searchAdultFeed(star.name, order, {
										providers: ["redtube"],
										maxVideos: LIBRARY_LIMITS.redtubeStarVideosPerPull
									}).then((n) => toast.success(`Loaded ${n.toLocaleString()} for ${star.name}`));
								},
								children: star.name
							}, star.name))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted",
					children: [
						"Durable adult catalog: ",
						adultVideos.length.toLocaleString(),
						" titles · provider pages append to this library across reloads",
						importProgress ? ` · ${importProgress.label}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-accent",
					children: archiveLabel
				}),
				sourceFacets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Source tags"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Every pull stamps source-* so you can filter by provider (and booru host / subreddit when present)."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: (tagFilterProp ? sourceFilter : tagFilter) === "all" ? "default" : "secondary",
								onClick: () => {
									setTagFilter("all");
									onSourceFilter?.("all");
								},
								children: ["All sources · ", adultVideos.length]
							}), sourceFacets.map(([id, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: (tagFilterProp ? sourceFilter : tagFilter) === id || tagFilter === `source-${id}` ? "default" : "secondary",
								onClick: () => {
									onSourceFilter?.(id);
									setTagFilter(`source-${id}`);
								},
								children: [
									id,
									" · ",
									count
								]
							}, id))]
						})
					]
				}),
				creatorFacets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Creator tags"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: creatorFacets.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: tagFilter === tag ? "default" : "secondary",
							onClick: () => setTagFilter(tag),
							children: [
								"#",
								tag,
								" · ",
								count
							]
						}, tag))
					})]
				}),
				fetishFacets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Interest tags"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: fetishFacets.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: tagFilter === tag ? "default" : "secondary",
								onClick: () => setTagFilter(tag),
								children: [
									"#",
									tag,
									" · ",
									count
								]
							}, tag))
						}),
						tagFilter.toLowerCase() !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-accent",
								children: ["Selected #", tagFilter]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: remoteBusy,
								onClick: () => {
									const q = fetishSearchQuery(tagFilter.replace(/^fetish-/, "").replace(/^source-/, "").replace(/-/g, " "));
									setQuery(q);
									searchAdultFeed(q, order, {
										page: 1,
										maxVideos: LIBRARY_LIMITS.adultInteractiveVideosPerPull,
										providers,
										...redditPullOptions
									}).then((n) => toast.success(`Loaded ${n.toLocaleString()} for #${tagFilter}`));
								},
								children: ["Search providers for #", tagFilter]
							})]
						})
					]
				})
			]
		})]
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
function AdultComments({ video }) {
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const [comments, setComments] = (0, import_react.useState)(video.remote?.comments ?? []);
	const [note, setNote] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (video.remote?.kind !== "reddit" || !video.remote.videoId) {
			setComments(video.remote?.comments ?? []);
			setNote(video.remote?.kind === "reddit" ? "" : "No public comment feed for this source.");
			return;
		}
		setLoading(true);
		(async () => {
			try {
				const { fetchAdultComments } = await import("./api-DrSMGXpo.mjs");
				const result = await fetchAdultComments({ data: {
					kind: video.remote?.kind ?? "",
					videoId: video.remote?.videoId ?? "",
					watchUrl: video.remote?.watchUrl ?? ""
				} });
				if (cancelled) return;
				setComments(result.comments);
				setNote(result.note);
				if (result.comments.length) {
					const blob = result.comments.map((c) => c.body).join(" ");
					const mined = [
						...mineRedditCommentTags(blob, 24),
						...adultTextFetishTags(blob, 16),
						...redditTitleTokens(video.name, 8)
					];
					if (mined.length) {
						const existing = useLibrary.getState().tags[video.id] ?? [];
						const merged = [.../* @__PURE__ */ new Set([...existing, ...mined])].slice(0, 120);
						setVideoTags(video.id, merged);
					}
				}
			} catch (err) {
				if (!cancelled) setNote(err instanceof Error ? err.message : "Comments unavailable.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		video.id,
		video.remote?.kind,
		video.remote?.videoId,
		video.remote?.watchUrl,
		video.remote?.comments,
		setVideoTags
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 rounded-lg border border-border bg-bg/40 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), " Comments"]
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "Loading comments…"
			}),
			!loading && note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: note
			}),
			!loading && comments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 max-h-48 space-y-2 overflow-y-auto",
				children: comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-sm bg-elevated/60 px-2 py-1.5 text-xs text-fg",
					children: [comment.author && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium text-accent",
						children: [
							"u/",
							comment.author,
							" · "
						]
					}), comment.body]
				}, comment.id))
			})
		]
	});
}
/** In-app full-bleed image viewer for booru / photo-kind adult pulls. */
function AdultImageLightbox({ video, tags = [] }) {
	const remote = video.remote;
	const src = video.src || remote?.embedUrl || remote?.previewUrl || video.poster || "";
	const sourceTags = tags.filter((tag) => tag.startsWith("source-")).slice(0, 4);
	const creatorTags = tags.filter((tag) => tag.startsWith("creator-")).slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 flex flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6",
			children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: video.name,
				className: "max-h-full max-w-full object-contain",
				decoding: "async"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No image available for this title."
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-bg via-bg/80 to-transparent px-4 pb-20 pt-16 sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: [adultRemoteLabel(remote?.kind), " photo viewer"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-fg",
						children: video.name
					}),
					(sourceTags.length > 0 || creatorTags.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [...sourceTags, ...creatorTags].map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-elevated px-2 py-0.5 text-[11px] text-muted shadow-border",
							children: ["#", tag]
						}, tag))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "default",
							onClick: () => {
								downloadAdultPhoto(video).then((result) => {
									if (result.ok) toast.success(`Saved ${result.name}`);
									else toast.error(result.error);
								});
							},
							children: "Download photo"
						}), remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: remote.watchUrl,
							target: "_blank",
							rel: "noreferrer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								children: ["Open post page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultComments, { video })
				]
			})
		})]
	});
}
async function requestAdultOfflineSave(url) {
	const target = url.trim();
	if (!/^https:\/\//i.test(target)) return {
		ok: false,
		error: "No https URL to save."
	};
	try {
		const res = await fetch("http://127.0.0.1:43123/offline/save", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				origin: window.location.origin
			},
			body: JSON.stringify({ url: target }),
			signal: AbortSignal.timeout(6e3)
		});
		const data = await res.json();
		if (res.ok && data.ok) return {
			ok: true,
			detail: data.detail || (data.path ? `Download started into ${data.path}` : "Download started.")
		};
		return {
			ok: false,
			error: data.error || `Companion offline save unavailable (HTTP ${res.status}).`,
			needs: data.needs
		};
	} catch {
		return {
			ok: false,
			error: "Reelcase Companion is not running. Start it locally to enable offline save.",
			needs: [
				"Start Reelcase Companion",
				"Install yt-dlp on PATH or set YT_DLP_PATH",
				"Set REELCASE_ALLOWED_ROOTS / optional REELCASE_DOWNLOAD_DIR"
			]
		};
	}
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
	const video = useLibrary((s) => s.activeId ? s.videos.find((v) => v.id === s.activeId) : void 0);
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
	const cameCount = useLibrary((s) => s.activeId ? s.cameCounts[s.activeId] ?? 0 : 0);
	const markCame = useLibrary((s) => s.markCame);
	const folders = useLibrary((s) => s.folders);
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
	const lastProgressWrite = (0, import_react.useRef)(0);
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
				if (JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}")["playback-autoplay-next-video"]) playRelative(1, playlist);
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
			if (video && el.duration) {
				const now = Date.now();
				if (now - lastProgressWrite.current >= 4e3) {
					lastProgressWrite.current = now;
					markProgress(video.id, t, el.duration);
				}
			}
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
		lastProgressWrite.current = 0;
		const durationHint = Math.max(video.duration ?? 0, 120);
		const heartbeat = () => {
			if (document.visibilityState === "hidden") return;
			const elapsed = Math.max(2, (Date.now() - remoteStartedAt.current) / 1e3);
			markProgress(video.id, Math.min(elapsed, durationHint * .94), durationHint);
		};
		const timer = window.setInterval(heartbeat, 1e4);
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
		measureInteraction("playback");
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
	const adultImage = Boolean(remote && isAdultImageKind(remote.kind, video.mime, video.extension));
	const redgifsDirectMedia = remote?.kind === "redgifs" && Boolean(video.src && video.src !== remote.embedUrl);
	const embedSrc = adultImage ? null : remote ? remote.kind === "twitch" ? twitchEmbed(remote.embedUrl ?? "") : remote.kind === "youtube" ? youtubeEmbed(remote.embedUrl ?? video.src ?? "") : isAdultPullKind(remote.kind) ? redgifsDirectMedia ? null : remote.embedUrl ?? video.src ?? null : remote.embedUrl ? `${remote.embedUrl}${remote.embedUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0&modestbranding=1` : null : null;
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
			adultImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultImageLightbox, {
				video,
				tags
			}) : embedSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				title: video.name,
				src: embedSrc,
				className: "absolute inset-0 size-full border-0 bg-bg",
				allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
				allowFullScreen: true,
				referrerPolicy: "strict-origin-when-cross-origin"
			}, `embed:${video.id}`) : remote?.kind === "youtube" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
				autoPlay: true,
				preload: "auto",
				onCanPlay: (event) => {
					if (remote?.kind === "redgifs") event.currentTarget.play().catch(() => void 0);
				},
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
								remote.live ? "Live" : adultRemoteLabel(remote.kind),
								remote.channelName,
								hasFreshViewerCount(remote) ? `${remote.viewers?.toLocaleString()} watching` : null
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
						isAdultVideo(video, folders) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: cameCount > 0 ? "secondary" : "ghost",
							size: "sm",
							"aria-label": "I cummed to it",
							onClick: () => markCame(video.id),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: cn("size-4", cameCount > 0 && "fill-accent text-accent") }),
								"I cummed to it",
								cameCount > 0 ? ` · ${cameCount}` : ""
							]
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
						remote && isAdultPullKind(remote.kind) && (remote.watchUrl || remote.embedUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							title: "Requires local Companion + yt-dlp",
							onClick: () => {
								requestAdultOfflineSave(remote.watchUrl || remote.embedUrl || "").then((result) => {
									if (result.ok) toast.success(result.detail);
									else toast.error(result.needs?.length ? `${result.error} (${result.needs.join(", ")})` : result.error);
								});
							},
							children: "Save offline"
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
			remote && isAdultPullKind(remote.kind) && chrome && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute z-20 bottom-24 left-4 right-4 max-w-xl sm:left-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultComments, { video })
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
					children: ["Open on ", adultRemoteLabel(remote.kind)]
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
	const markProgress = useLibrary((s) => s.markProgress);
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
	const [ratingRevision, setRatingRevision] = (0, import_react.useState)(0);
	const [creatorRevision, setCreatorRevision] = (0, import_react.useState)(0);
	const [creatorLoading, setCreatorLoading] = (0, import_react.useState)(false);
	const [tagRevision, setTagRevision] = (0, import_react.useState)(0);
	const [recommendationSeed, setRecommendationSeed] = (0, import_react.useState)(() => Date.now() >>> 0);
	const [localPreviewSrc, setLocalPreviewSrc] = (0, import_react.useState)(null);
	const [previewError, setPreviewError] = (0, import_react.useState)("");
	const [shelfReady, setShelfReady] = (0, import_react.useState)(false);
	const markUnavailable = useLibrary((s) => s.markUnavailable);
	const video = videos.find((item) => item.id === previewId);
	(0, import_react.useEffect)(() => {
		if (video) recordPlay(video.id, "open");
	}, [recordPlay, video?.id]);
	(0, import_react.useEffect)(() => {
		if (!video?.remote) return;
		const openedAt = Date.now();
		const durationHint = Math.max(video.duration ?? 0, 120);
		const savePreviewWatch = () => {
			const watched = (Date.now() - openedAt) / 1e3;
			if (watched >= 8) markProgress(video.id, Math.min(watched, durationHint * .94), durationHint);
		};
		const timer = window.setInterval(savePreviewWatch, 5e3);
		return () => {
			savePreviewWatch();
			window.clearInterval(timer);
		};
	}, [
		markProgress,
		video?.id,
		video?.remote
	]);
	const creator = video?.remote?.channelName?.trim() ?? "";
	const creatorKeyword = creator.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const tagScores = (0, import_react.useMemo)(() => {
		const scores = /* @__PURE__ */ new Map();
		for (const item of videos) for (const rawTag of allTags[item.id] ?? EMPTY_TAGS) {
			const tag = rawTag.replace(/^(?:keyword-|creator-)/i, "");
			const entry = scores.get(tag) ?? {
				total: 0,
				count: 0
			};
			entry.total += getRating(item.id);
			entry.count += 1;
			scores.set(tag, entry);
		}
		return scores;
	}, [
		allTags,
		ratingRevision,
		videos
	]);
	const allVisibleTags = (creatorKeyword && !tags.includes(creatorKeyword) ? [creatorKeyword, ...tags] : tags).map((tag) => tag.replace(/^(?:keyword-|creator-)/i, ""));
	const visibleTags = allVisibleTags.slice(0, 80);
	const creatorRating = creator ? getCreatorRating(creator) : 0;
	const creatorLiked = creator ? creatorIsLiked(creator) : false;
	(0, import_react.useEffect)(() => {
		if (!previewId) return;
		setRating$1(getRating(previewId));
	}, [previewId]);
	(0, import_react.useEffect)(() => {
		const refresh = () => setRatingRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
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
	const adultImage = Boolean(video.remote && isAdultImageKind(video.remote.kind, video.mime, video.extension));
	const imageSrc = adultImage ? video.src || video.remote?.embedUrl || video.remote?.previewUrl || video.poster || null : null;
	const embed = adultImage ? null : video.remote?.embedUrl ? video.remote.kind === "twitch" ? `${video.remote.embedUrl}${video.remote.embedUrl.includes("?") ? "&" : "?"}parent=${encodeURIComponent(window.location.hostname)}` : video.remote.kind === "youtube" ? (() => {
		const url = new URL(video.remote.embedUrl, "https://www.youtube.com");
		url.protocol = "https:";
		url.hostname = "www.youtube.com";
		url.searchParams.set("autoplay", "1");
		url.searchParams.set("rel", "0");
		url.searchParams.set("modestbranding", "1");
		url.searchParams.set("playsinline", "1");
		url.searchParams.set("origin", window.location.origin);
		return url.toString();
	})() : video.remote.embedUrl : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 overflow-y-auto bg-bg/98 px-4 py-5 sm:px-8 sm:py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: video.remote ? "w-full max-w-none" : "mx-auto max-w-6xl",
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
					className: video.remote?.kind === "twitch" ? "mt-5 grid gap-7" : video.remote?.kind === "youtube" ? "mt-5 grid gap-7 xl:grid-cols-[minmax(0,2.35fr)_minmax(20rem,0.65fr)]" : "mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.7fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-lg bg-elevated shadow-border",
							children: imageSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: imageSrc,
								alt: video.name,
								className: "aspect-video w-full bg-bg object-contain",
								decoding: "async"
							}) : embed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
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
								controls: true,
								onTimeUpdate: (event) => {
									const element = event.currentTarget;
									if (Number.isFinite(element.duration) && element.duration > 0) markProgress(video.id, element.currentTime, element.duration);
								}
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
												setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : isAdultPullKind(video.remote?.kind) ? "adults" : "youtube");
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
												if (video.remote.kind === "youtube" || video.remote.kind === "twitch") await followRemoteQuery(creator, video.remote.kind);
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: topicEvidence(video, tags).map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									title: link.reason,
									onClick: () => {
										openTopic(link.topic);
										closePreview();
									},
									children: [
										"#",
										link.topic,
										" ↔"
									]
								}, link.topic))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Topic links explore all public sources. Hover a topic for its evidence."
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
										title: `Show videos tagged ${tag} · score ${Math.round((tagScores.get(tag)?.total ?? 0) / Math.max(1, tagScores.get(tag)?.count ?? 1) * 1e3).toLocaleString()}`,
										onClick: () => {
											setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : "all");
											setQuery(tag);
											closePreview();
										},
										className: "px-2 py-1 transition-colors hover:bg-accent/15 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent",
										children: [
											"#",
											tag,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-accent",
												children: ["· ", Math.round((tagScores.get(tag)?.total ?? 0) / Math.max(1, tagScores.get(tag)?.count ?? 1) * 1e3).toLocaleString()]
											})
										]
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
							allVisibleTags.length > visibleTags.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted",
								children: [
									"Showing ",
									visibleTags.length,
									" of ",
									allVisibleTags.length,
									" saved provider tags. Search the source to use the rest."
								]
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
	const liveNow = (0, import_react.useMemo)(() => videos.filter((video) => video.remote?.kind === "twitch" && video.remote.live).sort((a, b) => (hasFreshViewerCount(b.remote) ? b.remote?.viewers ?? 0 : 0) - (hasFreshViewerCount(a.remote) ? a.remote?.viewers ?? 0 : 0)), [videos]);
	const localAnswer = () => {
		if (/live|twitch|stream/i.test(prompt) && liveNow.length) return `Live on your followed Twitch channels:\n${liveNow.slice(0, 4).map((video, index) => `${index + 1}. ${video.remote?.channelName ?? video.name}${hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()} viewers` : ""}`).join("\n")}\n\nLive status comes from the latest refresh in Reelcase. Open a card to watch it.`;
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
						children: [video.remote?.channelName ?? video.name, hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()}` : ""]
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
			const { fetchTwitchFollowing } = await import("./api-DrSMGXpo.mjs");
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
var loadHub = () => import("./hub-sections-C_SD3X6F.mjs");
var hubSection = (name) => (0, import_react.lazy)(async () => ({ default: (await loadHub())[name] }));
var GamesSection = hubSection("GamesSection");
var FindPhoneSection = hubSection("FindPhoneSection");
var GenreSection = hubSection("GenreSection");
var LanConnectionSection = hubSection("LanConnectionSection");
var MissionPlanSection = hubSection("MissionPlanSection");
var PhotosSection = hubSection("PhotosSection");
var PrivateWebShortcuts = hubSection("PrivateWebShortcuts");
var PrintsSection = hubSection("PrintsSection");
var SettingsSection = hubSection("SettingsSection");
var StatsSection = hubSection("StatsSection");
var ShopSection = hubSection("ShopSection");
var SocialSection = hubSection("SocialSection");
var SpotifySection = hubSection("SpotifySection");
var StreamingSection = hubSection("StreamingSection");
var WatchRoomSection = hubSection("WatchRoomSection");
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
var isTasteTag = isTopicTag;
function LibraryApp() {
	(0, import_react.useEffect)(() => {
		const announce = () => {
			if (document.visibilityState === "visible") announceNetworkPresence().catch(() => void 0);
		};
		announce();
		const timer = window.setInterval(announce, 25e3);
		document.addEventListener("visibilitychange", announce);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", announce);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const failed = () => toast.error("Library changes could not be saved. Browser storage is unavailable or full.");
		window.addEventListener("reelcase:save-error", failed);
		return () => window.removeEventListener("reelcase:save-error", failed);
	}, []);
	const dirInputRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const pendingAdult = (0, import_react.useRef)(false);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [movieShuffle, setMovieShuffle] = (0, import_react.useState)(() => Date.now());
	const [homePickShuffle, setHomePickShuffle] = (0, import_react.useState)(() => Date.now());
	const [ratingRevision, setRatingRevision] = (0, import_react.useState)(0);
	const [adultTag, setAdultTag] = (0, import_react.useState)("All");
	const [adultSource, setAdultSource] = (0, import_react.useState)("all");
	const [adultView, setAdultView] = (0, import_react.useState)("all");
	const [adultRailLimit, setAdultRailLimit] = (0, import_react.useState)(48);
	const [adultTagQuery, setAdultTagQuery] = (0, import_react.useState)("");
	/** Visible ranked tag chips — starts small; Show more adds a page, never dumps hundreds. */
	const [adultTagVisibleCount, setAdultTagVisibleCount] = (0, import_react.useState)(10);
	const [adultSort, setAdultSort] = (0, import_react.useState)("ranked");
	const [twitchSort, setTwitchSort] = (0, import_react.useState)("live");
	const [twitchFilter, setTwitchFilter] = (0, import_react.useState)("all");
	const [youtubeTagFilter, setYoutubeTagFilter] = (0, import_react.useState)("all");
	const [youtubeExploreVisible, setYoutubeExploreVisible] = (0, import_react.useState)(false);
	const [youtubeDeepVisible, setYoutubeDeepVisible] = (0, import_react.useState)(false);
	const [youtubeHealthVisible, setYoutubeHealthVisible] = (0, import_react.useState)(false);
	const [adultDeepVisible, setAdultDeepVisible] = (0, import_react.useState)(true);
	/** Heavy Adult ranking (full catalog sort + tag chips + recs) runs after first paint. */
	const [adultRankReady, setAdultRankReady] = (0, import_react.useState)(false);
	const archiveQueueRef = (0, import_react.useRef)([]);
	const archiveQueueBusyRef = (0, import_react.useRef)(false);
	const [archiveQueued, setArchiveQueued] = (0, import_react.useState)([]);
	const [twitchTagFilter, setTwitchTagFilter] = (0, import_react.useState)("all");
	const [historyWindow, setHistoryWindow] = (0, import_react.useState)("all");
	const [historySource, setHistorySource] = (0, import_react.useState)("all");
	const [historyRetention, setHistoryRetention] = (0, import_react.useState)("forever");
	const [homeExpanded, setHomeExpanded] = (0, import_react.useState)(false);
	const [homeRecommendationsReady, setHomeRecommendationsReady] = (0, import_react.useState)(false);
	const [remoteRefreshMs, setRemoteRefreshMs] = (0, import_react.useState)(() => {
		try {
			const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30");
			return [
				15,
				30,
				60,
				120,
				300
			].includes(seconds) ? seconds * 1e3 : 3e4;
		} catch {
			return 3e4;
		}
	});
	const restoreFolders = useLibrary((s) => s.restoreFolders);
	const openVideo = useLibrary((s) => s.openVideo);
	const addFolder = useLibrary((s) => s.addFolder);
	const ingestFromInput = useLibrary((s) => s.ingestFromInput);
	const ingestDrop = useLibrary((s) => s.ingestDrop);
	const clearHistory = useLibrary((s) => s.clearHistory);
	const pruneHistory = useLibrary((s) => s.pruneHistory);
	const folders = useLibrary((s) => s.folders);
	const sourceId = useLibrary((s) => s.sourceId);
	const setSource = useLibrary((s) => s.setSource);
	const hydrated = useLibrary((s) => s.hydrated);
	const query = useLibrary((s) => s.query);
	const setQuery = useLibrary((s) => s.setQuery);
	const scanning = useLibrary((s) => s.scanning);
	const activeId = useLibrary((s) => s.activeId);
	const previewId = useLibrary((s) => s.previewId);
	const history = useLibrary((s) => s.history);
	const videos = useLibrary(useShallow(selectVisible));
	const continueVideos = useLibrary(useShallow((s) => selectContinue(s, false)));
	const favoriteVideos = useLibrary(useShallow((s) => selectFavorites(s, false)));
	const historyVideos = useLibrary(useShallow((s) => selectHistory(s, false)));
	const historyLastDay = (0, import_react.useMemo)(() => history.filter((entry) => entry.at > Date.now() - 864e5).length, [history]);
	const classics = useLibrary(useShallow(selectClassics));
	const featured = useLibrary((s) => selectFeatured(s, s.sourceId === "adults"));
	const youtubeCatalog = useLibrary(useShallow(selectYoutube));
	const youtubeVideos = (0, import_react.useMemo)(() => youtubeCatalog.filter((video) => !isExcludedDemoVideo(video)), [youtubeCatalog]);
	const newestYoutube = youtubeVideos;
	const twitchVideos = useLibrary(useShallow(selectTwitch));
	const newThisWeek = (0, import_react.useMemo)(() => sourceId !== "home" || !homeRecommendationsReady ? [] : [...youtubeVideos, ...twitchVideos].filter((video) => video.remote && Date.now() - video.addedAt >= -3e5 && Date.now() - video.addedAt < 6048e5).sort((a, b) => b.addedAt - a.addedAt), [
		homeRecommendationsReady,
		sourceId,
		twitchVideos,
		youtubeVideos
	]);
	const liveVideos = useLibrary(useShallow(selectLive));
	const adultContinue = useLibrary(useShallow((s) => selectContinue(s, true)));
	const adultFavorites = useLibrary(useShallow((s) => selectFavorites(s, true)));
	const adultHistory = useLibrary(useShallow((s) => selectHistory(s, true)));
	const adultRemoteVideos = useLibrary(useShallow(selectAdultRemote));
	const cameCounts = useLibrary((s) => s.cameCounts);
	const hasUserFolders = userFolderCount(folders) > 0;
	const publicFolders = folders.filter((f) => f.kind !== "demo" && f.kind !== "youtube" && f.kind !== "twitch" && !f.adult);
	const adultFolders = folders.filter((f) => f.adult);
	const tags = useLibrary((s) => s.tags);
	const markedAdult = (0, import_react.useMemo)(() => [...adultRemoteVideos.filter((video) => (cameCounts[video.id] ?? 0) > 0)].sort((a, b) => (cameCounts[b.id] ?? 0) - (cameCounts[a.id] ?? 0)), [adultRemoteVideos, cameCounts]);
	const sourceMatchedAdult = (0, import_react.useMemo)(() => adultRemoteVideos.filter((video) => videoMatchesAdultSource(video, adultSource)), [adultRemoteVideos, adultSource]);
	const adultKind = (video) => video.remote?.live || [
		"chaturbate",
		"camsoda",
		"myfreecams"
	].includes(video.remote?.kind ?? "") ? "live" : isAdultImageKind(video.remote?.kind, video.mime, video.extension) ? "photos" : "videos";
	const viewMatchedAdult = (0, import_react.useMemo)(() => adultView === "all" ? sourceMatchedAdult : sourceMatchedAdult.filter((video) => adultKind(video) === adultView), [
		adultSource,
		adultView,
		sourceMatchedAdult
	]);
	const filteredEporner = (0, import_react.useMemo)(() => viewMatchedAdult.filter((video) => videoMatchesAdultTag(video, adultTag, tags)), [
		adultTag,
		tags,
		viewMatchedAdult
	]);
	const adultSourceCounts = (0, import_react.useMemo)(() => countAdultBySource(adultRemoteVideos), [adultRemoteVideos]);
	const adultKindCounts = (0, import_react.useMemo)(() => ({
		videos: adultRemoteVideos.filter((video) => adultKind(video) === "videos").length,
		live: adultRemoteVideos.filter((video) => adultKind(video) === "live").length,
		photos: adultRemoteVideos.filter((video) => adultKind(video) === "photos").length
	}), [adultRemoteVideos]);
	(0, import_react.useMemo)(() => [...new Set(sourceMatchedAdult.flatMap((video) => tags[video.id] ?? []))].sort(), [sourceMatchedAdult, tags]);
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
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const viewCounts = useLibrary((s) => s.viewCounts);
	const adultRankCtx = (0, import_react.useMemo)(() => ({
		tags,
		favorites,
		likes,
		cameCounts,
		viewCounts,
		ratingOf: getRating
	}), [
		cameCounts,
		favorites,
		likes,
		ratingRevision,
		tags,
		viewCounts
	]);
	const rankedAdultCatalog = (0, import_react.useMemo)(() => {
		if (sourceId !== "adults") return filteredEporner;
		if (!adultRankReady) return filteredEporner;
		return sortAdultVideos(filteredEporner, adultRankCtx);
	}, [
		adultRankCtx,
		adultRankReady,
		filteredEporner,
		sourceId
	]);
	const adultTagRank = (0, import_react.useMemo)(() => {
		if (sourceId !== "adults" || !adultRankReady) return [];
		return rankAdultTags(sourceMatchedAdult, adultRankCtx, 80);
	}, [
		adultRankCtx,
		adultRankReady,
		sourceId,
		sourceMatchedAdult
	]);
	const adultMetaTagRank = (0, import_react.useMemo)(() => {
		if (sourceId !== "adults" || !adultRankReady) return [];
		return rankAdultMetaTags(sourceMatchedAdult, adultRankCtx, 48);
	}, [
		adultRankCtx,
		adultRankReady,
		sourceId,
		sourceMatchedAdult
	]);
	const adultTagMatches = (0, import_react.useMemo)(() => {
		const needle = adultTagQuery.trim().toLowerCase();
		if (!needle) return adultTagRank;
		return adultTagRank.filter((row) => row.tag.includes(needle) || row.tag.replace(/-/g, " ").includes(needle));
	}, [adultTagQuery, adultTagRank]);
	const visibleAdultTags = (0, import_react.useMemo)(() => {
		const page = Math.min(Math.max(10, adultTagVisibleCount), 36);
		return adultTagMatches.slice(0, page);
	}, [adultTagMatches, adultTagVisibleCount]);
	const adultRecommended = (0, import_react.useMemo)(() => {
		if (sourceId !== "adults" || !adultRankReady) return [];
		const preferred = new Set([...adultTagRank.slice(0, 16), ...adultMetaTagRank.slice(0, 12)].map((row) => row.tag));
		const likedTags = new Set(sourceMatchedAdult.filter((video) => favorites[video.id] || likes[video.id] || getRating(video.id) >= 4 || (cameCounts[video.id] ?? 0) > 0).flatMap((video) => tags[video.id] ?? []));
		return (adultTag === "All" && adultSource === "all" ? rankedAdultCatalog : sortAdultVideos(sourceMatchedAdult, adultRankCtx)).map((video) => {
			const itemTags = tags[video.id] ?? [];
			const overlap = itemTags.filter((tag) => preferred.has(tag)).length;
			const likedOverlap = itemTags.filter((tag) => likedTags.has(tag)).length;
			return {
				video,
				score: overlap * 8 + likedOverlap * 10
			};
		}).sort((a, b) => b.score - a.score).map(({ video }) => video).slice(0, 48);
	}, [
		adultMetaTagRank,
		adultRankCtx,
		adultRankReady,
		adultSource,
		adultTag,
		adultTagRank,
		cameCounts,
		favorites,
		likes,
		rankedAdultCatalog,
		ratingRevision,
		sourceId,
		sourceMatchedAdult,
		tags
	]);
	const adultRelatedRecommended = (0, import_react.useMemo)(() => {
		if (sourceId !== "adults" || !adultRankReady) return [];
		const seedTags = new Set((adultTag !== "All" ? [adultTag] : [...adultTagRank.slice(0, 8), ...adultMetaTagRank.slice(0, 6)].map((row) => row.tag)).concat(adultContinue[0] ? tags[adultContinue[0].id] ?? [] : [], adultFavorites[0] ? tags[adultFavorites[0].id] ?? [] : []));
		const recommendedIds = new Set(adultRecommended.map((video) => video.id));
		return adultRemoteVideos.filter((video) => !recommendedIds.has(video.id)).map((video) => {
			return {
				video,
				score: (tags[video.id] ?? []).filter((tag) => seedTags.has(tag)).length * 12 + getRating(video.id) * 8 + (favorites[video.id] ? 5 : 0) + (likes[video.id] ? 3 : 0),
				shuffle: shuffleRank(`adult-rel:${video.id}:${homePickShuffle}`, homePickShuffle)
			};
		}).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.shuffle - b.shuffle).map(({ video }) => video).slice(0, 48);
	}, [
		adultContinue,
		adultFavorites,
		adultMetaTagRank,
		adultRankReady,
		adultRecommended,
		adultRemoteVideos,
		adultTag,
		adultTagRank,
		favorites,
		homePickShuffle,
		likes,
		ratingRevision,
		sourceId,
		tags
	]);
	const adultShelfRails = (0, import_react.useMemo)(() => {
		const used = /* @__PURE__ */ new Set();
		const take = (list, limit, claim = true) => {
			const out = [];
			for (const video of list) {
				if (used.has(video.id)) continue;
				out.push(video);
				if (claim) used.add(video.id);
				if (out.length >= limit) break;
			}
			return out;
		};
		const scoped = (list) => list.filter((video) => videoMatchesAdultSource(video, adultSource) && videoMatchesAdultTag(video, adultTag, tags) && (adultView === "all" || adultKind(video) === adultView));
		const continueRail = take(scoped(adultContinue), Math.min(24, adultRailLimit));
		const marked = take(scoped(markedAdult), Math.min(24, adultRailLimit));
		const recommended = take(scoped(adultRecommended), adultRailLimit);
		const related = take(scoped(adultRelatedRecommended), adultRailLimit);
		const reddit = take(scoped(rankedAdultCatalog.filter((video) => video.remote?.kind === "reddit")), adultRailLimit);
		const latest = take(scoped(rankedAdultCatalog), adultRailLimit);
		const catalog = take(scoped(rankedAdultCatalog), Math.max(48, adultRailLimit * 3));
		const posterFresh = take(scoped(rankedAdultCatalog), Math.max(96, adultRailLimit * 6), true);
		const seenPoster = new Set(posterFresh.map((video) => video.id));
		return {
			recommended,
			related,
			continueRail,
			marked,
			reddit,
			latest,
			catalog,
			poster: posterFresh.length >= 48 ? posterFresh : [...posterFresh, ...scoped(rankedAdultCatalog).filter((video) => !seenPoster.has(video.id))].slice(0, Math.max(96, adultRailLimit * 6))
		};
	}, [
		adultContinue,
		adultRailLimit,
		adultRecommended,
		adultRelatedRecommended,
		adultTag,
		adultSource,
		adultView,
		markedAdult,
		rankedAdultCatalog,
		tags
	]);
	const adultRecommendedRail = adultShelfRails.recommended;
	const adultRelatedRail = adultShelfRails.related;
	const adultContinueRail = adultShelfRails.continueRail;
	const adultMarkedRail = adultShelfRails.marked;
	const adultRedditRail = adultShelfRails.reddit;
	const adultLatestRail = adultShelfRails.latest;
	const adultCatalogRail = adultShelfRails.catalog;
	const adultPosterCatalog = adultShelfRails.poster;
	const adultFeatured = (0, import_react.useMemo)(() => [
		...adultRecommendedRail,
		...adultLatestRail,
		...adultRemoteVideos
	].find((video) => Boolean(video.poster || video.remote?.previewUrl)), [
		adultLatestRail,
		adultRecommendedRail,
		adultRemoteVideos
	]);
	(0, import_react.useEffect)(() => {
		setAdultTagVisibleCount(10);
	}, [adultTagQuery, adultSource]);
	(0, import_react.useEffect)(() => {
		const load = () => {
			const saved = Number(localStorage.getItem("reelcase.adult-rail-limit") ?? "48");
			setAdultRailLimit([
				16,
				24,
				48,
				72
			].includes(saved) ? saved : 48);
		};
		load();
		window.addEventListener("reelcase:adult-render-settings", load);
		return () => window.removeEventListener("reelcase:adult-render-settings", load);
	}, []);
	(0, import_react.useEffect)(() => {
		if (sourceId !== "adults") {
			setAdultRankReady(false);
			setAdultTagVisibleCount(10);
			return;
		}
		setAdultRankReady(false);
		let cancelled = false;
		const ready = () => {
			if (!cancelled) setAdultRankReady(true);
		};
		const ric = window.requestIdleCallback;
		if (typeof ric === "function") {
			const id = ric(ready, { timeout: 700 });
			return () => {
				cancelled = true;
				window.cancelIdleCallback(id);
			};
		}
		const id = window.setTimeout(ready, 120);
		return () => {
			cancelled = true;
			window.clearTimeout(id);
		};
	}, [
		sourceId,
		filteredEporner.length,
		adultSource,
		adultTag
	]);
	const filteredYoutube = (0, import_react.useMemo)(() => youtubeTagFilter === "all" ? newestYoutube : newestYoutube.filter((video) => topicsForVideo(video, tags[video.id]).includes(youtubeTagFilter)), [
		newestYoutube,
		tags,
		youtubeTagFilter
	]);
	const searchInsights = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return {
			ranked: videos,
			tags: []
		};
		const terms = needle.split(/[^a-z0-9]+/).filter(Boolean);
		const score = (video) => {
			const title = video.name.toLowerCase();
			const creator = (video.remote?.channelName ?? "").toLowerCase();
			const exactTagHits = [...new Set([...topicsForVideo(video, tags[video.id]), ...tags[video.id] ?? []].map((tag) => tag.toLowerCase()))].filter((tag) => terms.some((term) => tag === term || tag.includes(term))).length;
			const titleHits = terms.filter((term) => title.includes(term)).length;
			const creatorHits = terms.filter((term) => creator.includes(term)).length;
			return (title.includes(needle) ? 120 : 0) + (creator.includes(needle) ? 95 : 0) + titleHits * 28 + creatorHits * 22 + exactTagHits * 18 + getRating(video.id) * 7 + (favorites[video.id] ? 12 : 0) + (likes[video.id] ? 6 : 0) + Math.min(8, viewCounts[video.id] ?? 0);
		};
		const rankedRows = videos.map((video) => ({
			video,
			score: score(video)
		})).sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt || a.video.name.localeCompare(b.video.name));
		const tagRows = /* @__PURE__ */ new Map();
		for (const row of rankedRows.slice(0, 240)) for (const tag of topicsForVideo(row.video, tags[row.video.id])) {
			const clean = tag.toLowerCase();
			if (clean.length < 3 || /^(?:year|month|day|type|format|source|provider)-/.test(clean)) continue;
			const previous = tagRows.get(clean) ?? {
				count: 0,
				score: 0
			};
			tagRows.set(clean, {
				count: previous.count + 1,
				score: previous.score + row.score
			});
		}
		return {
			ranked: rankedRows.map((row) => row.video),
			tags: [...tagRows.entries()].map(([tag, value]) => ({
				tag,
				...value
			})).sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, 12)
		};
	}, [
		favorites,
		likes,
		query,
		ratingRevision,
		tags,
		videos,
		viewCounts
	]);
	const trendingYoutube = (0, import_react.useMemo)(() => sourceId === "youtube" && youtubeExploreVisible ? diversifyCreators([...filteredYoutube].sort((a, b) => (b.remote?.views ?? 0) - (a.remote?.views ?? 0) || b.addedAt - a.addedAt)) : [], [
		filteredYoutube,
		sourceId,
		youtubeExploreVisible
	]);
	const categories = useLibrary((s) => s.categories);
	const catalogVideos = useLibrary((s) => s.videos);
	const progress = useLibrary((s) => s.progress);
	const resumeProgress = useLibrary((s) => s.resumeProgress);
	const unavailable = useLibrary((s) => s.unavailable);
	const follows = useLibrary((s) => s.follows);
	const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
	const remoteRetryAt = useLibrary((s) => s.remoteRetryAt);
	const youtubeHealth = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" || !youtubeHealthVisible) return [];
		const counts = /* @__PURE__ */ new Map();
		for (const video of youtubeVideos) {
			const row = counts.get(video.folderId) ?? {
				cached: 0,
				newest: 0
			};
			row.cached++;
			row.newest = Math.max(row.newest, video.addedAt);
			counts.set(video.folderId, row);
		}
		return follows.filter((channel) => channel.kind === "youtube").map((channel) => ({
			...channel,
			...counts.get(channel.id) ?? {
				cached: 0,
				newest: 0
			},
			retryAt: remoteRetryAt[channel.id]
		})).sort((a, b) => (a.lastCheckedAt ?? 0) - (b.lastCheckedAt ?? 0) || a.title.localeCompare(b.title));
	}, [
		follows,
		remoteRetryAt,
		sourceId,
		youtubeHealthVisible,
		youtubeVideos
	]);
	const continueInsights = (0, import_react.useMemo)(() => {
		const marks = Object.values(progress);
		const staleBefore = Date.now() - 15552e6;
		const valid = marks.filter((mark) => Number.isFinite(mark.t) && Number.isFinite(mark.d) && mark.d > .25 && mark.d <= 2592e3 && mark.t >= 0 && mark.t <= mark.d * 1.015);
		return {
			valid: valid.length,
			stale: valid.filter((mark) => mark.at < staleBefore).length,
			linked: continueVideos.filter((video) => Boolean(resumeForVideo({
				progress,
				resumeProgress
			}, video))).length
		};
	}, [
		continueVideos,
		progress,
		resumeProgress
	]);
	const adultPageVideos = (0, import_react.useMemo)(() => sourceId === "adults" ? videos : [], [sourceId, videos]);
	const moviesByGenre = (0, import_react.useMemo)(() => [...videos].filter((video) => Boolean(video.genre)).sort((a, b) => a.genre.localeCompare(b.genre)), [videos]);
	const movieCatalog = (0, import_react.useMemo)(() => {
		if (sourceId !== "movies") return [];
		const adultIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
		return catalogVideos.filter((video) => !video.remote && !video.isSample && !adultIds.has(video.folderId) && !unavailable[video.id]);
	}, [
		catalogVideos,
		folders,
		sourceId,
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
	const adultSorted = (0, import_react.useMemo)(() => {
		if (sourceId !== "adults" || !adultDeepVisible) return adultPageVideos;
		if (adultSort === "ranked") return sortAdultVideos(adultPageVideos, {
			tags,
			favorites,
			likes,
			cameCounts,
			viewCounts,
			ratingOf: getRating
		});
		return [...adultPageVideos].sort((a, b) => adultSort === "name" ? a.name.localeCompare(b.name) : adultSort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt : adultSort === "tagged" ? (tags[b.id] ?? []).length - (tags[a.id] ?? []).length || b.addedAt - a.addedAt : adultSort === "played" ? (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0) || b.addedAt - a.addedAt : b.addedAt - a.addedAt);
	}, [
		adultDeepVisible,
		adultSort,
		adultPageVideos,
		cameCounts,
		favorites,
		likes,
		progress,
		sourceId,
		tags,
		viewCounts,
		ratingRevision
	]);
	const adultTagged = (0, import_react.useMemo)(() => {
		if (!adultDeepVisible) return [];
		return adultPageVideos.filter((video) => (tags[video.id] ?? []).length > 0).sort((a, b) => (tags[b.id] ?? []).length - (tags[a.id] ?? []).length);
	}, [
		adultDeepVisible,
		tags,
		adultPageVideos
	]);
	const adultNeedsTags = (0, import_react.useMemo)(() => {
		if (!adultDeepVisible) return [];
		return adultPageVideos.filter((video) => !(tags[video.id] ?? []).length);
	}, [
		adultDeepVisible,
		tags,
		adultPageVideos
	]);
	const highlyRatedTags = (0, import_react.useMemo)(() => {
		const preferred = /* @__PURE__ */ new Set();
		if (sourceId !== "twitch") return preferred;
		for (const video of videos) {
			const rating = getRating(video.id);
			for (const tag of topicsForVideo(video, tags[video.id])) if (rating >= 4 || tagIsLiked(tag)) preferred.add(tag);
		}
		return preferred;
	}, [
		ratingRevision,
		sourceId,
		tags,
		videos
	]);
	const tasteAverages = (0, import_react.useMemo)(() => {
		if (!homeRecommendationsReady && sourceId === "home") return {
			tag: /* @__PURE__ */ new Map(),
			creator: /* @__PURE__ */ new Map()
		};
		const tagsByScore = /* @__PURE__ */ new Map();
		const creatorsByScore = /* @__PURE__ */ new Map();
		for (const video of videos) {
			const rating = getRating(video.id);
			const signal = Math.max(rating, favorites[video.id] ? 4 : 0, likes[video.id] ? 3 : 0);
			if (!signal) continue;
			for (const tag of topicsForVideo(video, tags[video.id])) {
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
		const score = (row) => (row.total + 9) / (row.count + 3);
		const confidence = (row) => Math.min(1, row.count / 5);
		return {
			tag: new Map([...tagsByScore].map(([key, row]) => [key, {
				score: score(row),
				confidence: confidence(row)
			}])),
			creator: new Map([...creatorsByScore].map(([key, row]) => [key, {
				score: score(row),
				confidence: confidence(row)
			}]))
		};
	}, [
		favorites,
		homeRecommendationsReady,
		likes,
		ratingRevision,
		sourceId,
		tags,
		videos
	]);
	const personalizedPicks = (0, import_react.useMemo)(() => {
		if (sourceId !== "home" || !homeRecommendationsReady) return [];
		const watched = new Set(history.map((entry) => entry.id));
		const preferredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id] || getRating(video.id) >= 4).flatMap((video) => topicsForVideo(video, tags[video.id])));
		const score = (video) => {
			const creatorAverage = tasteAverages.creator.get(video.remote?.channelName?.trim().toLowerCase() ?? "");
			const tagAverage = topicsForVideo(video, tags[video.id]).reduce((total, tag) => {
				const signal = tasteAverages.tag.get(tag);
				return total + (signal ? (signal.score - 3) * signal.confidence : 0);
			}, 0);
			const creatorLift = creatorAverage ? (creatorAverage.score - 3) * creatorAverage.confidence : 0;
			return getRating(video.id) * 18 + getCreatorRating(video.remote?.channelName ?? "") * 10 + creatorLift * 9 + tagAverage * 7 + (creatorIsLiked(video.remote?.channelName ?? "") ? 9 : 0) + (favorites[video.id] ? 6 : 0) + (likes[video.id] ? 4 : 0) + topicsForVideo(video, tags[video.id]).filter((tag) => isTasteTag(tag) && preferredTags.has(tag)).length * 2 + (video.remote?.live ? 1 : 0);
		};
		return videos.filter((video) => !video.isSample && !watched.has(video.id)).map((video) => ({
			video,
			rank: score(video) * .45 + shuffleRank(`${video.id}:${homePickShuffle}`, homePickShuffle) / 4294967295
		})).sort((a, b) => b.rank - a.rank).map(({ video }) => video);
	}, [
		favorites,
		history,
		homePickShuffle,
		homeRecommendationsReady,
		likes,
		ratingRevision,
		sourceId,
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
		if (sourceId !== "home" || !homeRecommendationsReady) return [];
		const seed = Math.floor(Date.now() / 36e5);
		return videos.filter((video) => !video.isSample && !video.remote?.live).map((video) => ({
			video,
			views: viewCounts[video.id] ?? 0,
			rank: shuffleRank(`${video.id}:${seed}`, seed)
		})).sort((a, b) => a.views - b.views || a.rank - b.rank).slice(0, 48).map(({ video }) => video);
	}, [
		homeRecommendationsReady,
		sourceId,
		videos,
		viewCounts
	]);
	const homeLocalRecent = (0, import_react.useMemo)(() => sourceId !== "home" || !homeRecommendationsReady ? [] : videos.filter((video) => !video.remote && !video.isSample).map((video) => ({
		video,
		ageBucket: Math.floor(Math.max(0, Date.now() - video.addedAt) / 6048e5),
		rank: shuffleRank(`${video.id}:recent`, homePickShuffle)
	})).sort((a, b) => a.ageBucket - b.ageBucket || a.rank - b.rank).slice(0, 48).map(({ video }) => video), [
		homePickShuffle,
		homeRecommendationsReady,
		sourceId,
		videos
	]);
	const homeLatestChannels = (0, import_react.useMemo)(() => sourceId !== "home" || !homeRecommendationsReady ? [] : [...youtubeVideos, ...twitchVideos].filter((video) => !video.remote?.live && !video.isSample && !isOfflineChannelCard(video)).sort((a, b) => b.addedAt - a.addedAt).slice(0, 48), [
		homeRecommendationsReady,
		sourceId,
		twitchVideos,
		youtubeVideos
	]);
	const sortedTwitch = (0, import_react.useMemo)(() => {
		if (sourceId !== "twitch") return [];
		return [...twitchVideos].filter((video) => !isOfflineChannelCard(video)).sort((a, b) => {
			const viewers = (video) => hasFreshViewerCount(video.remote) ? video.remote?.viewers ?? 0 : 0;
			if (twitchSort === "viewers") return viewers(b) - viewers(a) || a.name.localeCompare(b.name);
			if (twitchSort === "name") return a.name.localeCompare(b.name);
			return Number(Boolean(b.remote?.live)) - Number(Boolean(a.remote?.live)) || viewers(b) - viewers(a) || b.addedAt - a.addedAt;
		});
	}, [
		sourceId,
		twitchSort,
		twitchVideos
	]);
	const twitchVodPicks = (0, import_react.useMemo)(() => {
		if (sourceId !== "twitch") return [];
		const popularity = (video) => (hasFreshViewerCount(video.remote) ? video.remote?.viewers ?? 0 : 0) + getRating(video.id) * 40 + (favorites[video.id] ? 28 : 0) + (likes[video.id] ? 16 : 0) + (viewCounts[video.id] ?? 0) * 5 + topicsForVideo(video, tags[video.id]).filter((tag) => highlyRatedTags.has(tag)).length * 8;
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
	const twitchArchiveDepth = (0, import_react.useMemo)(() => {
		if (sourceId !== "twitch") return {
			total: 0,
			sparse: 0,
			channels: []
		};
		const rows = /* @__PURE__ */ new Map();
		for (const video of twitchVodPicks) {
			const name = video.remote?.channelName?.trim() || "Unknown creator";
			const previous = rows.get(name) ?? {
				count: 0,
				oldest: Number.MAX_SAFE_INTEGER,
				newest: 0,
				clips: 0
			};
			rows.set(name, {
				count: previous.count + 1,
				oldest: Math.min(previous.oldest, video.addedAt),
				newest: Math.max(previous.newest, video.addedAt),
				clips: previous.clips + ((video.duration ?? 0) > 0 && (video.duration ?? 0) <= 120 ? 1 : 0)
			});
		}
		const channels = follows.filter((channel) => channel.kind === "twitch").map((channel) => ({
			id: channel.id,
			name: channel.title,
			...rows.get(channel.title) ?? {
				count: 0,
				oldest: 0,
				newest: 0,
				clips: 0
			},
			lastCheckedAt: channel.lastCheckedAt,
			lastResponseCount: channel.lastResponseCount,
			retryAt: remoteRetryAt[channel.id]
		})).sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));
		return {
			total: twitchVodPicks.length,
			sparse: channels.filter((channel) => channel.count < 24).length,
			channels
		};
	}, [
		follows,
		remoteRetryAt,
		sourceId,
		twitchVodPicks
	]);
	const twitchClips = (0, import_react.useMemo)(() => twitchVodPicks.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) <= 120).slice(0, 24), [twitchVodPicks]);
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
				vods: twitchVodPicks.filter((video) => video.remote?.channelName?.trim().toLowerCase() === creator.toLowerCase())
			};
		}).filter((group) => group.vods.length > 0).slice(0, 8);
	}, [sortedTwitch, twitchVodPicks]);
	const relatedYoutube = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" || !youtubeExploreVisible) return [];
		const likedChannels = new Set(youtubeVideos.filter((video) => favorites[video.id] || likes[video.id]).map((video) => video.remote?.channelName).filter(Boolean));
		const favoriteTags = new Set(youtubeVideos.filter((video) => getRating(video.id) >= 3).flatMap((video) => topicsForVideo(video, tags[video.id])));
		const score = (video) => {
			const creatorAverage = tasteAverages.creator.get(video.remote?.channelName?.trim().toLowerCase() ?? "");
			const tagAverage = topicsForVideo(video, tags[video.id]).reduce((total, tag) => {
				const signal = tasteAverages.tag.get(tag);
				return total + (signal ? (signal.score - 3) * signal.confidence : 0);
			}, 0);
			const sharedFavoriteTopics = topicsForVideo(video, tags[video.id]).filter((tag) => isTasteTag(tag) && favoriteTags.has(tag)).length;
			const creatorLift = creatorAverage ? (creatorAverage.score - 3) * creatorAverage.confidence : 0;
			return getRating(video.id) * 14 + getCreatorRating(video.remote?.channelName ?? "") * 15 + creatorLift * 14 + tagAverage * 11 + (creatorIsLiked(video.remote?.channelName ?? "") ? 16 : 0) + (likedChannels.has(video.remote?.channelName) ? 12 : 0) + sharedFavoriteTopics * 18;
		};
		return youtubeVideos.map((video) => ({
			video,
			score: score(video),
			shuffle: shuffleRank(`${video.id}:${homePickShuffle}`, homePickShuffle)
		})).sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt || a.shuffle - b.shuffle).map(({ video }) => video);
	}, [
		favorites,
		homePickShuffle,
		likes,
		ratingRevision,
		sourceId,
		tags,
		tasteAverages,
		youtubeExploreVisible,
		youtubeVideos
	]);
	const youtubeDiscovery = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" || !youtubeExploreVisible) return [];
		const known = new Set(follows.filter((channel) => channel.kind === "youtube").map((channel) => channel.title.toLowerCase()));
		return youtubeVideos.filter((video) => !known.has((video.remote?.channelName ?? "").toLowerCase()) || Boolean(video.isSample));
	}, [
		follows,
		sourceId,
		youtubeExploreVisible,
		youtubeVideos
	]);
	const channelTagShelves = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" && sourceId !== "twitch") return {
			youtube: [],
			twitch: []
		};
		const build = (items, kind) => {
			const groups = /* @__PURE__ */ new Map();
			for (const video of items) {
				if (video.remote?.kind !== kind) continue;
				for (const tag of topicsForVideo(video, tags[video.id])) {
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
			return [...groups.entries()].filter(([, items]) => items.length >= 2).map(([tag, videos]) => ({
				tag,
				videos,
				score: videos.reduce((score, video) => score + getRating(video.id) * 2, 0)
			})).sort((a, b) => b.score - a.score || b.videos.length - a.videos.length || a.tag.localeCompare(b.tag)).slice(0, 40).map(({ tag, videos }) => ({
				tag,
				videos: diversifyCreators(videos)
			}));
		};
		if (sourceId === "youtube") return {
			youtube: youtubeExploreVisible ? build(youtubeVideos, "youtube") : [],
			twitch: []
		};
		return {
			youtube: [],
			twitch: build(twitchVideos, "twitch")
		};
	}, [
		ratingRevision,
		sourceId,
		tags,
		twitchVideos,
		youtubeExploreVisible,
		youtubeVideos
	]);
	(0, import_react.useEffect)(() => {
		restoreFolders();
	}, [restoreFolders]);
	(0, import_react.useEffect)(() => {
		if (sourceId === "home") setHomePickShuffle(Date.now());
	}, [sourceId]);
	(0, import_react.useEffect)(() => {
		if (sourceId !== "home") {
			setHomeRecommendationsReady(false);
			return;
		}
		let cancelled = false;
		const ready = () => {
			if (!cancelled) (0, import_react.startTransition)(() => setHomeRecommendationsReady(true));
		};
		const frame = window.requestAnimationFrame(() => window.setTimeout(ready, 0));
		return () => {
			cancelled = true;
			window.cancelAnimationFrame(frame);
		};
	}, [sourceId, videos.length]);
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
				const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30");
				setRemoteRefreshMs(([
					15,
					30,
					60,
					120,
					300
				].includes(seconds) ? seconds : 30) * 1e3);
			} catch {
				setRemoteRefreshMs(3e4);
			}
		};
		window.addEventListener("reelcase:refresh-settings", update);
		return () => window.removeEventListener("reelcase:refresh-settings", update);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const build = () => {
			librarySearchIndex.sync(catalogVideos, tags, categories);
			searchWorkerIndex.sync(catalogVideos, tags, categories);
		};
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
	const remoteRefreshStatus = useLibrary((s) => s.remoteRefreshStatus);
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const pushNotice = useLibrary((s) => s.pushNotice);
	const [channelRefreshing, setChannelRefreshing] = (0, import_react.useState)("");
	const drainArchiveQueue = async () => {
		if (archiveQueueBusyRef.current) return;
		const next = archiveQueueRef.current.shift();
		if (!next) return;
		archiveQueueBusyRef.current = true;
		setArchiveQueued(archiveQueueRef.current.map((item) => item.id));
		setChannelRefreshing(next.id);
		try {
			await followRemoteQuery(next.handle, "twitch");
		} catch {} finally {
			setChannelRefreshing("");
			archiveQueueBusyRef.current = false;
			drainArchiveQueue();
		}
	};
	const queueArchivePull = (id, handle) => {
		if (channelRefreshing === id || archiveQueueRef.current.some((item) => item.id === id)) return;
		archiveQueueRef.current.push({
			id,
			handle
		});
		setArchiveQueued(archiveQueueRef.current.map((item) => item.id));
		drainArchiveQueue();
	};
	const queueAllArchivePulls = () => {
		for (const channel of follows.filter((item) => item.kind === "twitch")) queueArchivePull(channel.id, channel.handle);
	};
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
					return JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}");
				} catch {
					return {};
				}
			})();
			if (preferences["alerts-go-live-alerts"] === true) for (const ch of wentLive) pushNotice({
				title: `${ch.title} is live`,
				body: "Tap to watch in Reelcase.",
				kind: "twitch",
				videoId: `tw:${ch.handle}:live`
			});
			for (const v of newVideos.filter((video) => video.remote?.kind === "twitch" && preferences["alerts-new-twitch-vod-alerts"] === true).slice(0, 3)) pushNotice({
				title: v.name,
				body: v.remote?.channelName ?? "New Twitch video",
				kind: "twitch",
				videoId: v.id
			});
		};
		const id = window.setInterval(() => void tick(), remoteRefreshMs);
		const first = window.setTimeout(() => void tick(), 1500);
		const onVisibilityChange = () => {
			if (!document.hidden) tick();
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.clearTimeout(first);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, [
		hydrated,
		follows.length,
		refreshFollows,
		pushNotice,
		remoteRefreshMs
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated || sourceId !== "adults") return;
		let cancelled = false;
		let cursor = 0;
		const tick = async () => {
			if (cancelled || document.hidden || !navigator.onLine) return;
			const state = useLibrary.getState();
			if (state.remoteBusy) return;
			const catalog = state.videos.filter((video) => video.remote && ADULT_PULL_PROVIDERS.includes(video.remote.kind));
			if (catalog.length >= LIBRARY_LIMITS.adultTargetCatalogVideos) return;
			const provider = catalog.filter((video) => video.remote?.kind === "reddit").length < Math.max(200, Math.floor(catalog.length * .2)) ? "reddit" : ADULT_PULL_PROVIDERS[cursor % ADULT_PULL_PROVIDERS.length];
			cursor += 1;
			const page = loadAdultArchiveCursors("all", "top-weekly")[provider]?.page ?? 1;
			try {
				await state.searchAdultFeed("all", "top-weekly", {
					append: true,
					providers: [provider],
					maxVideos: LIBRARY_LIMITS.adultRefreshVideosPerTick,
					providerPages: { [provider]: page }
				});
			} catch {}
		};
		const first = window.setTimeout(() => void tick(), 8e3);
		const id = window.setInterval(() => void tick(), LIBRARY_LIMITS.adultRefreshIntervalMs);
		return () => {
			cancelled = true;
			window.clearTimeout(first);
			window.clearInterval(id);
		};
	}, [hydrated, sourceId]);
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
	const historyVisibleEntries = (0, import_react.useMemo)(() => {
		const cutoff = historyWindow === "day" ? Date.now() - 864e5 : historyWindow === "week" ? Date.now() - 6048e5 : 0;
		return history.filter((entry) => entry.at >= cutoff && (historySource === "all" || (entry.source ?? "open") === historySource));
	}, [
		history,
		historySource,
		historyWindow
	]);
	const historyFilteredVideos = (0, import_react.useMemo)(() => {
		const visibleIds = new Set(historyVisibleEntries.map((entry) => entry.id));
		return historyVideos.filter((video) => visibleIds.has(video.id));
	}, [historyVideos, historyVisibleEntries]);
	const historyVideoById = (0, import_react.useMemo)(() => new Map(catalogVideos.map((video) => [video.id, video])), [catalogVideos]);
	const historyOrphans = (0, import_react.useMemo)(() => history.filter((entry) => !historyVideoById.has(entry.id) && Boolean(entry.url)).length, [history, historyVideoById]);
	const historyRetentionCutoff = historyRetention === "week" ? Date.now() - 6048e5 : historyRetention === "month" ? Date.now() - 2592e6 : historyRetention === "year" ? Date.now() - 31536e6 : 0;
	const exportHistory = () => {
		const rows = historyVisibleEntries.map((entry) => ({
			eventId: entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`,
			occurredAt: new Date(entry.at).toISOString(),
			localTime: new Date(entry.at).toLocaleString(),
			source: entry.source ?? "open",
			positionSeconds: entry.position ?? null,
			durationSeconds: entry.duration ?? null,
			url: entry.url ?? null,
			title: historyVideoById.get(entry.id)?.name ?? "Recovered activity"
		}));
		const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `reelcase-history-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		link.click();
		URL.revokeObjectURL(link.href);
	};
	const browsing = !query && (sourceId === "home" || sourceId === "movies" || sourceId === "adults" || sourceId === "youtube" || sourceId === "twitch" || sourceId === "live");
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
					children: isHubSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "rounded-xl bg-elevated p-8 text-sm text-muted shadow-border",
							children: "Loading this library workspace…"
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
						] })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						sourceId === "home" && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryDesk, { videos }),
						!hasUserFolders && sourceId === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteStrip, {
							onAddFolder: () => onAddFolder(),
							onAddFiles: () => fileInputRef.current?.click(),
							onRecommended: (id) => onAddFolder(id)
						}),
						sourceId === "home" && !query && !follows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectPanel, { defaultKind: "youtube" }, "home-imports"),
						sourceId === "movies" && !query && (randomSourceMovies[0] || featured) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: randomSourceMovies[0] ?? featured }),
						sourceId === "adults" && adultFeatured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: adultFeatured }),
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
							!homeRecommendationsReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8 flex min-h-12 items-center gap-3 rounded-lg bg-elevated/70 px-4 py-3 text-sm text-muted shadow-border",
								role: "status",
								"aria-live": "polite",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-accent" }), "Preparing recommendations after the first screen…"]
							}),
							homeRecommendationsReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingStreakCard, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Recently added from your folders",
									reason: "Fresh additions from your local folders.",
									videos: homeLocalRecent,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Unseen & ready to discover",
									reason: "Less-played titles, rotated so familiar picks do not take over.",
									videos: freshPicks,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Top-rated local picks",
									reason: "Built from your ratings, likes, and saved favorites.",
									videos: topRatedLocalPicks,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Live now",
									reason: "Channels confirmed live in the latest check.",
									videos: liveVideos,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "New this week",
									reason: "Recently published or added from your saved sources.",
									videos: newThisWeek,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: follows.length ? "Latest from your channels" : "Fresh from YouTube",
									reason: "The newest uploads from creators you follow.",
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
										reason: "Items with a saved, unfinished watch position.",
										videos: continueVideos,
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "From YouTube",
										reason: "Your saved YouTube channel cache.",
										videos: youtubeVideos.filter((video) => !video.isSample),
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "Twitch",
										reason: "Live and archived videos from your followed Twitch creators.",
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
										reason: "Titles you explicitly saved.",
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
											"Fresh uploads are ordered by YouTube’s published date, not title. Background cache pulls are quiet; only an explicit refresh reports its result. ",
											follows.filter((channel) => channel.kind === "youtube").length,
											" channel",
											follows.filter((channel) => channel.kind === "youtube").length === 1 ? "" : "s",
											" tracked locally · ",
											youtubeVideos.length.toLocaleString(),
											" cached videos."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-accent",
										children: [remoteCheckedAt ? `Automatic refresh last checked ${new Date(remoteCheckedAt).toLocaleTimeString([], {
											hour: "numeric",
											minute: "2-digit"
										})}` : "Automatic refresh will begin after the first channel check.", remoteRefreshStatus ? ` · last batch: ${remoteRefreshStatus.refreshed}/${remoteRefreshStatus.checked} channels refreshed, ${remoteRefreshStatus.youtube.toLocaleString()} YouTube entries returned${remoteRefreshStatus.failed ? `, ${remoteRefreshStatus.failed} unavailable` : ""}` : ""]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => setYoutubeHealthVisible((value) => !value),
												children: youtubeHealthVisible ? "Hide channel health" : "Channel health"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "self-center text-xs text-muted",
												children: "Saved channels retry in rotating background batches; each result adds to this cached count."
											})
										]
									}),
									youtubeHealthVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
										children: youtubeHealth.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
											className: "rounded-sm bg-bg/45 p-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-sm font-medium text-fg",
													children: channel.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-muted",
													children: [
														channel.cached.toLocaleString(),
														" cached · last result ",
														channel.lastResponseCount ?? 0,
														" rows"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-muted",
													children: [
														channel.newest ? `Newest ${new Date(channel.newest).toLocaleDateString()}` : "No published item cached",
														" · ",
														channel.lastCheckedAt ? `checked ${new Date(channel.lastCheckedAt).toLocaleString([], {
															month: "short",
															day: "numeric",
															hour: "numeric",
															minute: "2-digit"
														})}` : "not checked yet"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-xs text-muted",
													children: channel.retryAt && channel.retryAt > Date.now() ? `Retry ${new Date(channel.retryAt).toLocaleTimeString([], {
														hour: "numeric",
														minute: "2-digit"
													})}` : "Provider ready"
												})
											]
										}, channel.id))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Latest uploads",
								videos: filteredYoutube,
								variant: "rail"
							}),
							!youtubeExploreVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-6 rounded-xl border border-border bg-surface p-5 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Fast start"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: "Open YouTube fast, then deepen the catalog when you want it."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Recommendations, artwork-heavy discovery shelves, tag filters, and the full grid wait until requested. Your newest uploads are ready immediately."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-4",
										variant: "secondary",
										onClick: () => setYoutubeExploreVisible(true),
										children: "Explore recommendations and full catalog"
									})
								]
							}),
							youtubeExploreVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Trending in your tracked channels",
									videos: trendingYoutube,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "New to you on YouTube",
									videos: freshPicks.filter((video) => video.remote?.kind === "youtube" && (youtubeTagFilter === "all" || topicsForVideo(video, tags[video.id]).includes(youtubeTagFilter))),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "More from your rated YouTube",
									videos: relatedYoutube.filter((video) => youtubeTagFilter === "all" || topicsForVideo(video, tags[video.id]).includes(youtubeTagFilter)),
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
								!youtubeDeepVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mb-6 rounded-xl border border-border bg-surface p-5 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Deep discovery"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 font-display text-2xl text-fg",
											children: "Browse creator and topic shelves."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "These shelves remain optional so opening YouTube stays responsive even with a very large archive."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											className: "mt-4",
											variant: "secondary",
											onClick: () => setYoutubeDeepVisible(true),
											children: "Load creator and topic shelves"
										})
									]
								}),
								youtubeDeepVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [[...new Set(newestYoutube.map((video) => video.remote?.channelName).filter(Boolean))].slice(0, 16).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `From ${channel}`,
									videos: newestYoutube.filter((video) => video.remote?.channelName === channel),
									variant: "rail"
								}, channel)), channelTagShelves.youtube.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `YouTube · ${shelf.tag}`,
									videos: shelf.videos,
									variant: "rail"
								}, `youtube-tag-${shelf.tag}`))] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: filteredYoutube })
							] }),
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
											" clips",
											remoteRefreshStatus ? ` · last batch returned ${remoteRefreshStatus.twitch.toLocaleString()} VODs from ${remoteRefreshStatus.refreshed}/${remoteRefreshStatus.checked} checked channels${remoteRefreshStatus.failed ? ` (${remoteRefreshStatus.failed} unavailable)` : ""}` : ""
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
										className: "cursor-pointer list-none",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
												children: "Archive coverage"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-sm text-muted",
												children: [
													twitchArchiveDepth.total.toLocaleString(),
													" cached VODs across ",
													twitchArchiveDepth.channels.length,
													" channels · expand to review and queue deep pulls."
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-accent",
												children: "Expand"
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap items-end justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
												children: "Archive coverage"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-sm text-fg",
												children: [
													twitchArchiveDepth.total.toLocaleString(),
													" cached VODs across ",
													twitchArchiveDepth.channels.length,
													" channels · ",
													twitchArchiveDepth.sparse,
													" sparse channel",
													twitchArchiveDepth.sparse === 1 ? "" : "s",
													" under 24 VODs."
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted",
												children: "Background checks use a fast recent-VOD window. Focused pulls run serially through the queued creators, so live-state checks retain their budget. Partial responses preserve the existing archive."
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												disabled: channelRefreshing === "twitch-archives",
												onClick: () => void (async () => {
													setChannelRefreshing("twitch-archives");
													try {
														await refreshFollows();
													} finally {
														setChannelRefreshing("");
													}
												})(),
												children: channelRefreshing === "twitch-archives" ? "Refreshing archives…" : "Refresh Twitch archives"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												disabled: Boolean(channelRefreshing) || archiveQueued.length > 0,
												onClick: queueAllArchivePulls,
												children: "Queue all deep pulls"
											})]
										})]
									}),
									archiveQueued.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-accent",
										children: [
											"Focused archive queue · ",
											archiveQueued.length,
											" waiting. Reelcase continues creator-by-creator toward the oldest public VOD available; it retains every accepted page."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
										children: twitchArchiveDepth.channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-sm bg-bg/45 p-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "truncate text-sm font-medium text-fg",
															children: channel.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-1 text-xs text-muted",
															children: [
																channel.count.toLocaleString(),
																" cached VODs · ",
																channel.clips,
																" confirmed clip",
																channel.clips === 1 ? "" : "s",
																" · last result ",
																channel.lastResponseCount ?? 0,
																" rows"
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-1 text-xs text-muted",
															children: [channel.oldest ? `${new Date(channel.oldest).toLocaleDateString()} – ${new Date(channel.newest).toLocaleDateString()}` : "No archive dates yet", " · public depth may be limited"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-1 text-xs text-muted",
															children: [channel.lastCheckedAt ? `Checked ${new Date(channel.lastCheckedAt).toLocaleString([], {
																month: "short",
																day: "numeric",
																hour: "numeric",
																minute: "2-digit"
															})}` : "Not checked yet", channel.retryAt && channel.retryAt > Date.now() ? ` · cooldown until ${new Date(channel.retryAt).toLocaleTimeString([], {
																hour: "numeric",
																minute: "2-digit",
																second: "2-digit"
															})}` : " · ready"]
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													disabled: channelRefreshing === channel.id || archiveQueued.includes(channel.id),
													onClick: () => queueArchivePull(channel.id, channel.id.replace(/^tw:/, "")),
													children: channelRefreshing === channel.id ? "Pulling…" : archiveQueued.includes(channel.id) ? "Queued" : "Queue deep pull"
												})]
											})
										}, channel.id))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: sortedTwitch.filter((video) => (twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id])) && (twitchTagFilter === "all" || topicsForVideo(video, tags[video.id]).includes(twitchTagFilter))) }),
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
						sourceId === "adults" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultPanel, {
								showMilestones: adultDeepVisible,
								autoPull: true,
								sourceFilter: adultSource,
								tagFilter: adultTag,
								onSourceFilter: setAdultSource,
								onTagFilter: setAdultTag
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-xl border border-border bg-surface p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Adult media view"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Choose one media type or keep the combined discovery view. Provider and tag filters apply to every rail below."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [
											["all", `Combined · ${adultRemoteVideos.length}`],
											["videos", `Videos · ${adultKindCounts.videos}`],
											["live", `Live · ${adultKindCounts.live}`],
											["photos", `Photos · ${adultKindCounts.photos}`]
										].map(([view, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: adultView === view ? "default" : "secondary",
											onClick: () => setAdultView(view),
											children: label
										}, view))
									})
								]
							}),
							adultView === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 grid gap-4 xl:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: `Adult videos · ${adultKindCounts.videos}`,
										videos: rankedAdultCatalog.filter((video) => adultKind(video) === "videos").slice(0, adultRailLimit),
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: `Adult live · ${adultKindCounts.live}`,
										videos: rankedAdultCatalog.filter((video) => adultKind(video) === "live").slice(0, adultRailLimit),
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: `Adult photos · ${adultKindCounts.photos}`,
										videos: rankedAdultCatalog.filter((video) => adultKind(video) === "photos").slice(0, adultRailLimit),
										variant: "rail"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Recommended videos",
								reason: "Ranked from tag overlap, extreme/fetish boosts, I-cummed marks, Reddit signals, ratings, and recency — not just newest tube titles.",
								videos: adultRecommendedRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Related recommended",
								reason: "Nearby titles sharing your top adult tags, continue-watching tags, and favorite fetish overlap.",
								videos: adultRelatedRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Continue watching",
								videos: adultContinueRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "I cummed to it",
								reason: "Private local marks only — counts stay on this device.",
								videos: adultMarkedRail,
								variant: "rail"
							}),
							adultSource === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Reddit photos & videos",
								reason: "Curated 18+ Atom feeds — photos, gifs, and v.redd.it / redgifs posters.",
								videos: adultRedditRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-xl border border-border bg-surface p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-end justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Interest tags"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Curated interests only. Sources and creators stay in their own filters, then tap an interest to narrow every Adult rail."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: adultTagQuery,
											onChange: (event) => setAdultTagQuery(event.target.value),
											placeholder: "Filter tags…",
											className: "max-w-xs"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: ADULT_SOURCE_FILTERS.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: adultSource === source.id ? "default" : "secondary",
											onClick: () => setAdultSource(source.id),
											children: [
												source.label,
												" · ",
												source.id === "all" ? adultRemoteVideos.length : adultSourceCounts[source.id] ?? 0
											]
										}, source.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: adultTag === "All" ? "default" : "secondary",
												onClick: () => setAdultTag("All"),
												children: "All adult tags"
											}),
											visibleAdultTags.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: adultTag === row.tag ? "default" : "secondary",
												onClick: () => setAdultTag(row.tag),
												children: [
													"#",
													row.tag,
													" · ",
													row.count
												]
											}, `adult-tag-${row.tag}`)),
											adultTagMatches.length > visibleAdultTags.length && visibleAdultTags.length < 36 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => setAdultTagVisibleCount((count) => Math.min(36, count + 10)),
												children: [
													"Show more · ",
													Math.min(10, Math.min(36, adultTagMatches.length) - visibleAdultTags.length),
													" of ",
													adultTagMatches.length
												]
											}),
											visibleAdultTags.length > 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => setAdultTagVisibleCount(10),
												children: "Show fewer"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-muted",
										children: [
											"Showing ",
											visibleAdultTags.length,
											" of ",
											adultTagMatches.length || adultTagRank.length,
											" ranked tags",
											adultTagQuery.trim() ? " (filtered)" : "",
											" · cap 36 on screen."
										]
									}),
									adultMetaTagRank.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium tracking-[0.12em] text-accent uppercase",
												children: "Ranked metadata"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted",
												children: "Verified provider descriptors scored by ratings, saves, marks, recency, and cross-provider coverage. Use one to focus every Adult rail."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 flex flex-wrap gap-2",
												children: adultMetaTagRank.slice(0, 18).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: adultTag === row.tag ? "default" : "secondary",
													onClick: () => setAdultTag(row.tag),
													children: [
														"#",
														row.tag,
														" · ",
														row.count,
														" · ",
														Math.round(row.score)
													]
												}, `adult-meta-${row.tag}`))
											})
										]
									}),
									(adultTag !== "All" || adultSource !== "all") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-accent",
										children: [
											"Showing ",
											rankedAdultCatalog.length.toLocaleString(),
											" titles",
											adultSource !== "all" ? ` · ${adultSource}` : "",
											adultTag !== "All" ? ` · #${adultTag}` : "",
											"."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
								className: "mb-5 rounded-xl bg-elevated p-4 shadow-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Adult stats"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											adultRemoteVideos.length.toLocaleString(),
											" cached titles · Reddit ",
											adultSourceCounts.reddit ?? 0,
											" · export tag ranks and source counts."
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => exportAdultStats(buildAdultStatsSnapshot(adultRemoteVideos, folders, tags, {
												favorites,
												likes,
												cameCounts,
												viewCounts,
												ratingOf: getRating
											}), "csv"),
											children: "Export CSV"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => exportAdultStats(buildAdultStatsSnapshot(adultRemoteVideos, folders, tags, {
												favorites,
												likes,
												cameCounts,
												viewCounts,
												ratingOf: getRating
											}), "json"),
											children: "Export JSON"
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Latest from official adult APIs",
								reason: "Ranked catalog from official APIs and Reddit Atom — source chips actually filter these rails.",
								videos: adultLatestRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "From official adult APIs",
								reason: "Windowed filtered catalog, ranked (first 120).",
								videos: adultCatalogRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: adultPosterCatalog }),
							!adultDeepVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-6 rounded-xl border border-border bg-surface p-5 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Deep discovery"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: "Milestones, private shelves, and history."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Link-out catalogs, private folder rails, and full adult history stay optional so opening Adults stays responsive with a large cached archive."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-4",
										variant: "secondary",
										onClick: () => setAdultDeepVisible(true),
										children: "Load milestones and private shelves"
									})
								]
							}),
							adultDeepVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: adultTag === "All" ? "default" : "secondary",
													onClick: () => setAdultTag("All"),
													children: "All titles"
												}),
												visibleAdultTags.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: adultTag === row.tag ? "default" : "secondary",
													onClick: () => setAdultTag(row.tag),
													children: ["#", row.tag]
												}, row.tag)),
												adultTagMatches.length > visibleAdultTags.length && visibleAdultTags.length < 36 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													onClick: () => setAdultTagVisibleCount((count) => Math.min(36, count + 10)),
													children: "Show more tags"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "self-center text-xs text-muted",
												children: "Sort"
											}), [
												"ranked",
												"recent",
												"name",
												"favorites",
												"tagged",
												"played"
											].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: adultSort === sort ? "default" : "secondary",
												onClick: () => setAdultSort(sort),
												children: sort === "tagged" ? "Most tagged" : sort === "played" ? "Last played" : sort === "ranked" ? "Ranked" : sort
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
											className: "mt-4",
											onClick: () => onAddFolder(void 0, true),
											children: "Add private folder"
										})
									]
								})
							] })
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
											size: "sm",
											variant: "secondary",
											onClick: exportHistory,
											children: "Export visible"
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
							query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "Search ranking and matching tags",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Search ranking"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Exact title and creator matches lead, followed by matching tags and your saved reactions."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-accent",
											children: [searchInsights.ranked.length.toLocaleString(), " ranked results"]
										})]
									}),
									searchInsights.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "self-center text-xs text-muted",
											children: "Top tags"
										}), searchInsights.tags.map(({ tag, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => setQuery(tag),
											children: [
												"#",
												tag,
												" · ",
												count
											]
										}, tag))]
									}),
									searchInsights.ranked.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid gap-2 md:grid-cols-3",
										children: searchInsights.ranked.slice(0, 3).map((video, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => openVideo(video.id),
											className: "flex min-w-0 items-center gap-3 rounded-md bg-elevated px-3 py-3 text-left hover:bg-bg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "shrink-0 rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent",
												children: ["#", index + 1]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate text-sm font-medium text-fg",
													children: video.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate text-xs text-muted",
													children: (video.remote?.channelName ?? topicsForVideo(video, tags[video.id]).slice(0, 2).join(" · ")) || "Library match"
												})]
											})]
										}, video.id))
									})
								]
							}),
							(sourceId === "continue" || sourceId === "history") && !query && (adultContinue.length > 0 || adultHistory.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-xl border border-border bg-surface p-5 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Adults activity"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: "Private continue & history stay in Adults."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Public Continue / History rails stay clean. Open Adults for private resume marks, fetish-tagged history, and I-cummed counters — catalog shelves on Home stay public-only."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											onClick: () => setSource("adults"),
											children: "Open Adults"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => {
												setSource("adults");
												setAdultDeepVisible(true);
											},
											children: "Adults history & shelves"
										})]
									}),
									sourceId === "continue" && adultContinue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
											title: "Adults · continue watching",
											videos: adultContinue.slice(0, 18),
											variant: "rail"
										})
									}),
									sourceId === "history" && adultHistory.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
											title: "Adults · recent history",
											videos: adultHistory.slice(0, 18),
											variant: "rail",
											playedAt
										})
									})
								]
							}),
							sourceId === "continue" && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "Continue recovery details",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Resume recovery"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Continue uses a provider URL or approved local path when a catalog card changes, then keeps the newest credible mark."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-subtle",
											children: [continueInsights.linked, " ready to resume"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-2 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-md bg-elevated px-3 py-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Durable marks"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 font-display text-xl text-fg",
													children: continueInsights.valid
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-md bg-elevated px-3 py-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Stale, review-only"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 font-display text-xl text-fg",
													children: continueInsights.stale
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-md bg-elevated px-3 py-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Resume rule"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-sm font-medium text-fg",
													children: "Local 5 sec · providers 2 sec"
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs leading-5 text-subtle",
										children: "Repair preview is non-destructive: invalid marks are rejected on recovery, while older marks remain visible for review and no file handle is reopened automatically."
									}),
									continueVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.12em] text-muted uppercase",
											children: "Why these are here"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 grid gap-2",
											children: continueVideos.slice(0, 8).map((video) => {
												const mark = resumeForVideo({
													progress,
													resumeProgress
												}, video);
												const percent = mark ? Math.round(mark.t / mark.d * 100) : 0;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													onClick: () => openVideo(video.id),
													className: "flex min-h-11 items-center gap-3 rounded-md border border-border px-3 text-left",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "shrink-0 rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent",
															children: video.remote ? "Provider key" : "Local path"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "min-w-0 flex-1 truncate text-sm text-fg",
															children: video.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "shrink-0 text-xs text-muted",
															children: [
																percent,
																"% · ",
																mark ? new Date(mark.at).toLocaleString() : "awaiting mark"
															]
														})
													]
												}, video.id);
											})
										})]
									})
								]
							}),
							sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "History controls",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-1 text-xs font-medium tracking-[0.12em] text-muted uppercase",
										children: "Activity source"
									}), [
										"all",
										"open",
										"progress",
										"watch-room"
									].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: historySource === kind ? "default" : "secondary",
										onClick: () => setHistorySource(kind),
										children: kind === "all" ? "Everything" : kind === "open" ? "Direct opens" : kind === "progress" ? "Playback" : "Watch Room"
									}, kind))]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs text-muted",
											htmlFor: "history-retention",
											children: "Keep activity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											id: "history-retention",
											value: historyRetention,
											onChange: (event) => setHistoryRetention(event.target.value),
											className: "min-h-9 rounded-md border border-border bg-elevated px-2 text-sm text-fg",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "forever",
													children: "Until I remove it"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "week",
													children: "7 days"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "month",
													children: "30 days"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "year",
													children: "1 year"
												})
											]
										}),
										historyRetention !== "forever" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => pruneHistory(historyRetentionCutoff),
											children: "Remove older entries"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-subtle",
											children: "Export first if you want a copy."
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
							sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg bg-elevated px-4 py-3 shadow-border",
								"aria-label": "History privacy and recovery",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Local record"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: "This device stores event time, source, optional playback position, and a provider URL only when available. Private and adult items remain behind the existing library gate."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-subtle",
										children: historyOrphans ? `${historyOrphans} recovered event${historyOrphans === 1 ? "" : "s"} can still use a saved provider link after its card left the catalog.` : "Saved provider links are retained so an evicted card can be recovered."
									})
								]
							}),
							sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "Recent history activity",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-fg",
											children: "Recent activity"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-subtle",
											children: "Times shown in your local timezone"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid gap-2",
										children: historyVisibleEntries.slice(0, 12).map((entry) => {
											const video = historyVideoById.get(entry.id);
											const label = entry.source === "watch-room" ? "Watch Room" : entry.source === "progress" ? "Playback" : "Direct open";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												disabled: !video,
												onClick: () => video && openVideo(video.id),
												className: "flex min-h-11 items-center gap-3 rounded-md border border-border px-3 text-left disabled:cursor-default disabled:opacity-75",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "shrink-0 rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent",
														children: label
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "min-w-0 flex-1 truncate text-sm text-fg",
														children: video?.name ?? "Recovered activity — source card unavailable"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
														className: "shrink-0 text-xs text-muted",
														dateTime: new Date(entry.at).toISOString(),
														title: new Date(entry.at).toISOString(),
														children: new Date(entry.at).toLocaleString()
													})
												]
											}, entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`);
										})
									}),
									historyVisibleEntries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-muted",
										children: "No activity matches this time and source filter. Try Everything or a longer time window; recovered cards appear when a saved provider URL is available."
									})
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
								videos: sourceId === "history" ? historyFilteredVideos : query ? searchInsights.ranked : videos,
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
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryApp, {});
}
//#endregion
export { exportFeedback as C, toggleTagLike as D, tagIsLiked as E, getInteractionBudgetSnapshot as O, topicsForVideo as S, getRating as T, useLibrary as _, buildAdultStatsSnapshot as a, isTopicTag as b, countAdultBySource as c, VideoCard as d, getRenderBudgetSnapshot as f, resumeForVideo as g, Button as h, getFirstShelfTrace as i, measureInteraction as k, Input as l, useThumbs as m, getNetworkDeviceId as n, exportAdultStats as o, getThumbDiagnostics as p, listNetworkDevices as r, rankAdultTags as s, routes_exports as t, openTopic as u, useSourceAssets as v, getFeedbackDiagnostics as w, topicEvidence as x, canonicalTopic as y };
