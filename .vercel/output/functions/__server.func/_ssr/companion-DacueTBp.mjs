import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/companion-DacueTBp.js
var companion_DacueTBp_exports = /* @__PURE__ */ __exportAll({
	A: () => negotiateCompanion,
	C: () => allowCardArtwork,
	D: () => CoalescedWriter,
	E: () => trackSessionActivity,
	O: () => COMPANION_FEATURES,
	S: () => allowAutomaticRefresh,
	T: () => subscribeSessionPhase,
	_: () => companionSetAutostart,
	a: () => companionExportLibraryPack,
	b: () => getCompanionMemorySnapshot,
	c: () => companionHealth,
	d: () => companionLaunchGame,
	f: () => companionLaunchHistory,
	g: () => companionSavePrint,
	h: () => companionReadPrint,
	i: () => companionCacheThumbUrl,
	k: () => companionFeatureIssue,
	l: () => companionImportLibraryPack,
	m: () => companionPutThumb,
	n: () => companionAckJobs,
	o: () => companionFetch,
	p: () => companionListPrints,
	r: () => companionArtworkAudit,
	s: () => companionGetThumb,
	t: () => COMPANION_ORIGIN,
	u: () => companionInspectMedia,
	v: () => companionSteamEpicGames,
	w: () => getSessionPhase,
	x: () => requireCompanionFeature,
	y: () => companion_exports
});
var windowsOnly = /* @__PURE__ */ new Set([
	"launch",
	"launch-receipts",
	"shortcut-catalog",
	"shortcut-icons",
	"steam-epic-catalog",
	"tray-autostart",
	"tray-notifications"
]);
/** @template {string} T @param {T[]} values @param {string} platform @returns {T[]} */
function supportedCapabilities(values, platform) {
	return values.filter((value) => platform === "win32" || !windowsOnly.has(value));
}
var COMPANION_PROTOCOL = {
	major: 1,
	minor: 0
};
var COMPANION_FEATURES = {
	"model-transfer-recovery": {
		label: "Resumable model transfers",
		version: 19
	},
	"remote-launch-safeguards": {
		label: "Scoped remote launch approvals",
		version: 19
	},
	"capability-consent": {
		label: "Optional integration permissions",
		version: 18
	},
	"print-save-transaction": {
		label: "Reviewed print saves",
		version: 17
	},
	"platform-contract": {
		label: "Platform support contract",
		version: 17
	},
	"tray-notifications": {
		label: "Windows tray notifications",
		version: 17
	},
	"download-preflight": {
		label: "Download disk preflight",
		version: 16
	},
	"launch-receipts": {
		label: "Game launch receipts",
		version: 16
	},
	"root-access": {
		label: "Folder access control",
		version: 15
	},
	"file-health": {
		label: "Approved file checks",
		version: 10
	},
	launch: {
		label: "Desktop launches",
		version: 10
	},
	"shortcut-catalog": {
		label: "Desktop shortcuts",
		version: 10
	},
	"shortcut-icons": {
		label: "Shortcut icons",
		version: 10
	},
	"batch-verify": {
		label: "Batch file verification",
		version: 10
	},
	"watch-status": {
		label: "Folder watch status",
		version: 10
	},
	"cache-status": {
		label: "Local cache status",
		version: 10
	},
	"cache-warmup": {
		label: "Local cache scan",
		version: 10
	},
	"media-inspection": {
		label: "Media metadata inspection",
		version: 10
	},
	"roku-ssdp-discovery": {
		label: "Roku discovery",
		version: 10
	},
	"offline-save": {
		label: "Offline saves",
		version: 10
	},
	"youtube-downloads": {
		label: "YouTube downloads",
		version: 11
	},
	"steam-epic-catalog": {
		label: "Steam/Epic catalog",
		version: 10
	},
	"library-pack-disk": {
		label: "Library pack folder",
		version: 10
	},
	"thumb-disk-cache": {
		label: "Artwork disk cache",
		version: 10
	},
	"thumb-cache-url": {
		label: "Artwork URL caching",
		version: 10
	},
	"artwork-audit": {
		label: "Artwork cache audit",
		version: 13
	},
	"prints-bridge": {
		label: "Print model files",
		version: 10
	},
	"tray-autostart": {
		label: "Companion startup preference",
		version: 10
	},
	"job-badge": {
		label: "Job notifications",
		version: 10
	},
	"studio-models": {
		label: "Local creative tools",
		version: 12
	},
	"task-receipts": {
		label: "Persistent job recovery",
		version: 13
	}
};
/** Explicit capability lists are authoritative. Legacy fallback is limited to documented v10+ operations. */
function negotiateCompanion(value) {
	const fail = (reason) => ({
		compatible: false,
		legacy: false,
		version: 0,
		capabilities: [],
		reason
	});
	if (!value || typeof value !== "object") return fail("Companion is unavailable on this computer.");
	const row = value;
	if (row.ok !== true || row.service !== "reelcase-companion") return fail("This service is not a compatible Realhub Companion.");
	const version = Number.isSafeInteger(row.version) && Number(row.version) > 0 ? Number(row.version) : 0;
	if (row.protocol !== void 0) {
		const protocol = row.protocol;
		if (!protocol || protocol.major !== COMPANION_PROTOCOL.major || !Number.isSafeInteger(protocol.minor) || Number(protocol.minor) < 0) return fail("Companion protocol is incompatible. Use a Companion release with protocol 1; existing library data is unchanged.");
	} else if (version < 10 || version > 12) return fail("This Companion has no supported protocol declaration. Update Companion; your browser library remains available.");
	const capabilities = Array.isArray(row.capabilities) ? [...new Set(row.capabilities.slice(0, 128).filter((entry) => typeof entry === "string" && Object.hasOwn(COMPANION_FEATURES, entry)))] : Object.entries(COMPANION_FEATURES).filter(([, feature]) => feature.version <= version && feature.version <= 12).map(([name]) => name);
	const platform = row.platform;
	const filtered = platform?.schema === 1 && [
		"win32",
		"linux",
		"darwin",
		"other"
	].includes(String(platform.os)) ? supportedCapabilities(capabilities, String(platform.os)) : capabilities;
	return {
		compatible: true,
		legacy: row.protocol === void 0,
		version,
		capabilities: filtered
	};
}
function companionFeatureIssue(negotiation, feature) {
	if (!negotiation.compatible) return negotiation.reason;
	if (!negotiation.capabilities.includes(feature)) return `${COMPANION_FEATURES[feature].label} is unavailable. Use Companion v${COMPANION_FEATURES[feature].version}+ with this capability enabled. Other supported features remain available.`;
}
function companionPathFeature(path) {
	const name = path.split("?")[0];
	if (name.startsWith("/permissions")) return "capability-consent";
	if (name.startsWith("/roots/")) return "root-access";
	if (name === "/launch-receipts") return "launch-receipts";
	if (name.startsWith("/youtube/downloads")) return "youtube-downloads";
	if (name.startsWith("/tasks")) return "task-receipts";
	if (name.startsWith("/studio/models/transfers/") || name === "/studio/models/pause") return "model-transfer-recovery";
	if (name.startsWith("/studio/") || name.startsWith("/remote/")) return "studio-models";
	if (name.startsWith("/prints/transactions") || name === "/prints/save-folders") return "print-save-transaction";
	if (name === "/tray/notify") return "tray-notifications";
	if (name.startsWith("/prints/")) return "prints-bridge";
	if (name.startsWith("/library-pack/")) return "library-pack-disk";
	if (name === "/thumbs/audit") return "artwork-audit";
	if (name === "/thumbs/cache-url") return "thumb-cache-url";
	if (name.startsWith("/thumbs/")) return "thumb-disk-cache";
	if (name.startsWith("/games/")) return "steam-epic-catalog";
	if (name === "/shortcut-icons" || name === "/shortcut-icon") return "shortcut-icons";
	if (name === "/shortcuts" || name === "/validate-shortcuts") return "shortcut-catalog";
	if (name === "/launch" || name === "/launch-history") return "launch";
	if (name === "/source-health") return "file-health";
	if (name === "/verify") return "batch-verify";
	if (name === "/inspect-media") return "media-inspection";
	if (name === "/watch-status") return "watch-status";
	if (name === "/cache-status") return "cache-status";
	if (name === "/cache-warmup") return "cache-warmup";
	if (name === "/roku/discover") return "roku-ssdp-discovery";
	if (name === "/offline/save") return "offline-save";
	if (name === "/tray/autostart") return "tray-autostart";
	if (name === "/jobs" || name === "/jobs/ack" || name === "/tray/notify") return "job-badge";
}
/** One active batch and one latest value per key, instead of retaining a
* promise chain containing every obsolete full snapshot. Cache-only users
* can also cap pending entries/bytes; durable user data uses no eviction. */
var CoalescedWriter = class {
	pending = /* @__PURE__ */ new Map();
	running;
	pendingWeight = 0;
	persist;
	options;
	constructor(persist, options = {}) {
		this.persist = persist;
		this.options = options;
	}
	write(key, value) {
		const weight = this.options.weight ?? (() => 1);
		if (weight(value) > (this.options.maxWeight ?? Infinity)) return this.idle();
		if (this.pending.has(key)) this.pendingWeight -= weight(this.pending.get(key));
		this.pending.delete(key);
		this.pending.set(key, value);
		this.pendingWeight += weight(value);
		while (this.pending.size > (this.options.maxPending ?? Infinity) || this.pendingWeight > (this.options.maxWeight ?? Infinity)) {
			const oldest = this.pending.entries().next().value;
			if (!oldest) break;
			this.pending.delete(oldest[0]);
			this.pendingWeight -= weight(oldest[1]);
		}
		if (!this.running) this.running = Promise.resolve().then(async () => {
			let failure;
			let failed = false;
			try {
				while (this.pending.size) {
					const rows = [];
					for (const [id, item] of this.pending) {
						rows.push([id, item]);
						this.pending.delete(id);
						this.pendingWeight -= weight(item);
						if (rows.length >= (this.options.batchSize ?? 64)) break;
					}
					try {
						await this.persist(rows);
					} catch (error) {
						if (!failed) failure = error;
						failed = true;
					}
				}
				if (failed) throw failure;
			} finally {
				this.pending.clear();
				this.pendingWeight = 0;
				this.running = void 0;
			}
		});
		return this.running;
	}
	idle() {
		return this.running ?? Promise.resolve();
	}
	snapshot() {
		return {
			pending: this.pending.size,
			pendingWeight: this.pendingWeight,
			writing: Boolean(this.running)
		};
	}
};
var SESSION_IDLE_MS = 3e5;
var lastActivityAt = 0;
var phase = "active";
var listeners = /* @__PURE__ */ new Set();
function getSessionPhase() {
	return phase;
}
function subscribeSessionPhase(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function publish(next) {
	if (next === phase) return;
	phase = next;
	for (const listener of listeners) listener();
}
/** Visible artwork remains painted during idle; speculative/hidden artwork
* releases decoded surfaces until input or visibility returns. */
function allowCardArtwork(current, near, visible) {
	return near && current !== "hidden" && (current === "active" || visible);
}
function sessionIsActive(lastInput, now, visible = true) {
	return visible && now - lastInput < 3e5;
}
/** Speculative refreshes stop after five minutes without input. Bounded
* YouTube archive turns use visibility, pause, playback and entry-limit gates
* instead, so an idle page can recover after a longer provider cooldown. */
function allowAutomaticRefresh(now = Date.now()) {
	return typeof document !== "undefined" && sessionIsActive(lastActivityAt, now, !document.hidden);
}
function trackSessionActivity(onIdle, onActive = () => {}) {
	lastActivityAt = Date.now();
	publish(document.hidden ? "hidden" : "active");
	let trimmed = false;
	let timer;
	const schedule = () => {
		if (timer !== void 0 || document.hidden) return;
		timer = window.setTimeout(check, Math.max(1, lastActivityAt + SESSION_IDLE_MS - Date.now()));
	};
	const mark = () => {
		if (document.hidden) return;
		lastActivityAt = Date.now();
		publish("active");
		if (trimmed) onActive();
		trimmed = false;
		schedule();
	};
	const check = () => {
		if (timer !== void 0) window.clearTimeout(timer);
		timer = void 0;
		publish(document.hidden ? "hidden" : allowAutomaticRefresh() ? "active" : "idle");
		if (!allowAutomaticRefresh() && !trimmed) {
			trimmed = true;
			onIdle();
		}
		if (allowAutomaticRefresh()) schedule();
	};
	const visible = () => {
		if (document.hidden) check();
		else mark();
	};
	const events = [
		"pointerdown",
		"keydown",
		"wheel",
		"touchstart"
	];
	for (const event of events) window.addEventListener(event, mark, { passive: true });
	document.addEventListener("visibilitychange", visible);
	check();
	return () => {
		if (timer !== void 0) window.clearTimeout(timer);
		for (const event of events) window.removeEventListener(event, mark);
		document.removeEventListener("visibilitychange", visible);
	};
}
/** Thin client for the optional loopback Realhub Companion (127.0.0.1 only). */
var companion_exports = /* @__PURE__ */ __exportAll$1({
	COMPANION_ORIGIN: () => COMPANION_ORIGIN,
	companionAckJobs: () => companionAckJobs,
	companionArtworkAudit: () => companionArtworkAudit,
	companionCacheThumbUrl: () => companionCacheThumbUrl,
	companionExportLibraryPack: () => companionExportLibraryPack,
	companionFetch: () => companionFetch,
	companionGetThumb: () => companionGetThumb,
	companionHealth: () => companionHealth,
	companionImportLibraryPack: () => companionImportLibraryPack,
	companionInspectMedia: () => companionInspectMedia,
	companionLaunchGame: () => companionLaunchGame,
	companionLaunchHistory: () => companionLaunchHistory,
	companionListPrints: () => companionListPrints,
	companionPutThumb: () => companionPutThumb,
	companionReadPrint: () => companionReadPrint,
	companionSavePrint: () => companionSavePrint,
	companionSetAutostart: () => companionSetAutostart,
	companionSteamEpicGames: () => companionSteamEpicGames,
	getCompanionMemorySnapshot: () => getCompanionMemorySnapshot,
	requireCompanionFeature: () => requireCompanionFeature
});
var COMPANION_ORIGIN = "http://127.0.0.1:43123";
async function requireCompanionFeature(feature) {
	const issue = companionFeatureIssue(negotiateCompanion(await companionHealth()), feature);
	if (issue) throw new Error(issue);
}
async function companionFetch(path, init) {
	if (path !== "/health") {
		const feature = companionPathFeature(path);
		const health = await companionHealth();
		init?.signal?.throwIfAborted();
		let sensitive = path === "/studio/models/install" || /^\/studio\/models\/transfers\/.+\/(resume|fresh)$/.test(path);
		if (path.startsWith("/youtube/downloads") && typeof init?.body === "string") try {
			sensitive = JSON.parse(init.body).useBrowserSession === true;
		} catch {}
		const issue = (sensitive ? companionFeatureIssue(negotiateCompanion(health), "capability-consent") : void 0) || (feature ? companionFeatureIssue(negotiateCompanion(health), feature) : "This Companion operation has no negotiated capability.");
		if (issue) return new Response(JSON.stringify({
			ok: false,
			error: issue,
			code: "COMPANION_CAPABILITY"
		}), {
			status: 503,
			headers: { "content-type": "application/json" }
		});
	}
	return fetch(`${COMPANION_ORIGIN}${path}`, {
		...init,
		signal: init?.signal ?? AbortSignal.timeout(1e4),
		headers: {
			...init?.body ? { "content-type": "application/json" } : {},
			...init?.headers ?? {}
		}
	});
}
var healthPending = null;
var healthCached = null;
var healthExpires = 0;
/** One short availability probe for simultaneous consumers; failures cool down. */
function companionHealth(force = false) {
	if (healthPending) return healthPending;
	if (!force && Date.now() < healthExpires) return Promise.resolve(healthCached);
	healthPending = (async () => {
		try {
			const response = await companionFetch("/health", { signal: AbortSignal.timeout(1500) });
			const value = response.ok ? await response.json() : null;
			healthCached = value ? {
				...value,
				negotiation: negotiateCompanion(value)
			} : null;
		} catch {
			healthCached = null;
		}
		healthExpires = Date.now() + (healthCached ? 15e3 : 3e3);
		return healthCached;
	})().finally(() => {
		healthPending = null;
	});
	return healthPending;
}
/**
* Optional, local-only metadata inspection. The Companion independently
* verifies every path is inside its approved roots and accepts at most 12.
*/
async function companionInspectMedia(paths) {
	const boundedPaths = paths.filter((path) => typeof path === "string" && Boolean(path.trim())).slice(0, 12);
	if (!boundedPaths.length) return {
		ok: false,
		entries: [],
		error: "No approved local files were selected."
	};
	try {
		const response = await companionFetch("/inspect-media", {
			method: "POST",
			body: JSON.stringify({ paths: boundedPaths })
		});
		const data = await response.json();
		return {
			ok: Boolean(response.ok && data.ok),
			entries: Array.isArray(data.entries) ? data.entries : [],
			...data.note ? { note: data.note } : {},
			...data.error ? { error: data.error } : {}
		};
	} catch {
		return {
			ok: false,
			entries: [],
			error: "Companion offline. Start it on this computer, then try again."
		};
	}
}
async function companionSteamEpicGames(limit = 250) {
	try {
		const data = await (await companionFetch(`/games/steam-epic?limit=${limit}`)).json();
		return data.ok && Array.isArray(data.games) ? data.games : [];
	} catch {
		return [];
	}
}
async function companionExportLibraryPack(files) {
	try {
		return await (await companionFetch("/library-pack/export", {
			method: "POST",
			body: JSON.stringify({ files })
		})).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionImportLibraryPack() {
	try {
		return await (await companionFetch("/library-pack/import")).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionPutThumb(id, dataUrl) {
	try {
		const data = await (await companionFetch("/thumbs/put", {
			method: "POST",
			body: JSON.stringify({
				id,
				dataUrl
			})
		})).json();
		return Boolean(data.ok);
	} catch {
		return false;
	}
}
var thumbOfflineUntil = 0;
async function companionGetThumb(id) {
	if (Date.now() < thumbOfflineUntil) return null;
	try {
		const response = await companionFetch(`/thumbs/get?id=${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(1e3) });
		if (!response.ok) return null;
		const data = await response.json();
		return data.ok && data.dataUrl?.startsWith("data:image") ? data.dataUrl : null;
	} catch {
		thumbOfflineUntil = Date.now() + 1e4;
		return null;
	}
}
async function companionArtworkAudit() {
	try {
		const response = await companionFetch("/thumbs/audit", { signal: AbortSignal.timeout(5e3) });
		if (!response.ok) return {
			ok: false,
			error: "Restart the updated Companion to enable the artwork audit."
		};
		return await response.json();
	} catch {
		return {
			ok: false,
			error: "Companion is unavailable. Start it with an approved thumbnail cache folder to inspect disk artwork."
		};
	}
}
async function companionListPrints(limit = 200) {
	try {
		const data = await (await companionFetch(`/prints/list?limit=${limit}`)).json();
		return {
			prints: data.ok && Array.isArray(data.prints) ? data.prints : [],
			printsRoot: data.printsRoot,
			...data.error ? { error: data.error } : {}
		};
	} catch {
		return { prints: [] };
	}
}
async function companionReadPrint(path) {
	try {
		return await (await companionFetch(`/prints/file?path=${encodeURIComponent(path)}`)).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionSavePrint(name, dataBase64, dir) {
	try {
		return await (await companionFetch("/prints/save", {
			method: "POST",
			body: JSON.stringify({
				name,
				dataBase64,
				dir
			})
		})).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionSetAutostart(enabled) {
	try {
		return await (await companionFetch("/tray/autostart", {
			method: "POST",
			body: JSON.stringify({ enabled })
		})).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionAckJobs() {
	try {
		await companionFetch("/jobs/ack", {
			method: "POST",
			body: "{}"
		});
	} catch {}
}
var mirroredPosters = /* @__PURE__ */ new Map();
var posterRetryAt = 0;
var posterMirror = new CoalescedWriter(async (rows) => {
	for (const [id, url] of rows) {
		if (!allowAutomaticRefresh() || Date.now() < posterRetryAt || mirroredPosters.get(id) === url) continue;
		try {
			const response = await companionFetch("/thumbs/cache-url", {
				method: "POST",
				body: JSON.stringify({
					id,
					url
				})
			});
			const data = await response.json();
			if (response.ok && data.ok) {
				mirroredPosters.delete(id);
				mirroredPosters.set(id, url);
				if (mirroredPosters.size > 256) mirroredPosters.delete(mirroredPosters.keys().next().value);
			} else posterRetryAt = Date.now() + 6e4;
		} catch {
			posterRetryAt = Date.now() + 6e4;
		}
	}
}, {
	batchSize: 2,
	maxPending: 96,
	maxWeight: 262144,
	weight: (url) => url.length * 2
});
async function companionCacheThumbUrl(id, url) {
	if (!id || !url || !allowAutomaticRefresh() || Date.now() < posterRetryAt) return false;
	if (mirroredPosters.get(id) === url) return true;
	await posterMirror.write(id, url);
	return mirroredPosters.get(id) === url;
}
function getCompanionMemorySnapshot() {
	return {
		posters: posterMirror.snapshot(),
		rememberedPosters: mirroredPosters.size
	};
}
async function companionLaunchGame(path) {
	return await (await companionFetch("/launch", {
		method: "POST",
		body: JSON.stringify({ path })
	})).json();
}
async function companionLaunchHistory() {
	return await (await companionFetch("/launch-receipts")).json();
}
//#endregion
export { trackSessionActivity as A, companionSteamEpicGames as C, negotiateCompanion as D, getSessionPhase as E, requireCompanionFeature as O, companionSetAutostart as S, getCompanionMemorySnapshot as T, companionLaunchHistory as _, allowCardArtwork as a, companionReadPrint as b, companionCacheThumbUrl as c, companionFetch as d, companionGetThumb as f, companionLaunchGame as g, companionInspectMedia as h, allowAutomaticRefresh as i, subscribeSessionPhase as k, companionExportLibraryPack as l, companionImportLibraryPack as m, COMPANION_ORIGIN as n, companionAckJobs as o, companionHealth as p, CoalescedWriter as r, companionArtworkAudit as s, COMPANION_FEATURES as t, companionFeatureIssue as u, companionListPrints as v, companion_DacueTBp_exports as w, companionSavePrint as x, companionPutThumb as y };
