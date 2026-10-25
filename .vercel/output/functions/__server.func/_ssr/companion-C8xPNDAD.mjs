//#region node_modules/.nitro/vite/services/ssr/assets/companion-C8xPNDAD.js
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
var COMPANION_ORIGIN = "http://127.0.0.1:43123";
async function companionFetch(path, init) {
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
			healthCached = response.ok ? await response.json() : null;
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
			printsRoot: data.printsRoot
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
//#endregion
export { trackSessionActivity as S, companionSetAutostart as _, companionAckJobs as a, getSessionPhase as b, companionExportLibraryPack as c, companionImportLibraryPack as d, companionInspectMedia as f, companionSavePrint as g, companionReadPrint as h, allowCardArtwork as i, companionGetThumb as l, companionPutThumb as m, CoalescedWriter as n, companionArtworkAudit as o, companionListPrints as p, allowAutomaticRefresh as r, companionCacheThumbUrl as s, COMPANION_ORIGIN as t, companionHealth as u, companionSteamEpicGames as v, subscribeSessionPhase as x, getCompanionMemorySnapshot as y };
