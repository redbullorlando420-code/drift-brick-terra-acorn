import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-D5SsgGzE.mjs";
import { $t as exposureKey, Ga as saveRecommendationExposure, Nr as normalizeExposure, U as applyExposureEvents, ca as restoreRecommendationExposure, jn as isExposureLedger, kt as clearExposure, tr as loadRecommendationExposureSync, u as EMPTY_EXPOSURE, wr as newestExposure } from "./persist-BLKyjE-q.mjs";
import { a as scheduleBackgroundWork } from "./interaction-budget-2wyu0HNo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recommendation-exposure-store-DrLUoFck.js
var recommendation_exposure_store_DrLUoFck_exports = /* @__PURE__ */ __exportAll({
	a: () => markRecommendationOpened,
	c: () => refreshExposureRecommendations,
	i: () => hydrateRecommendationExposure,
	l: () => resetRecommendationExposure,
	n: () => getExposureRevision,
	o: () => recommendation_exposure_store_exports,
	r: () => getRecommendationExposure,
	s: () => recordRecommendationExposure,
	t: () => exposureDiagnostics,
	u: () => retryRecommendationExposure
});
var recommendation_exposure_store_exports = /* @__PURE__ */ __exportAll$1({
	exposureDiagnostics: () => exposureDiagnostics,
	flushRecommendationExposure: () => flushRecommendationExposure,
	getExposureRevision: () => getExposureRevision,
	getRecommendationExposure: () => getRecommendationExposure,
	hydrateRecommendationExposure: () => hydrateRecommendationExposure,
	importRecommendationExposure: () => importRecommendationExposure,
	markRecommendationOpened: () => markRecommendationOpened,
	recordRecommendationExposure: () => recordRecommendationExposure,
	refreshExposureRecommendations: () => refreshExposureRecommendations,
	resetRecommendationExposure: () => resetRecommendationExposure,
	retryRecommendationExposure: () => retryRecommendationExposure
});
var ledger;
var revision = 0;
var hydrating;
var timer;
var cancelWork;
var dirty = false;
var attempt = 0;
var status = "saved";
var pending = /* @__PURE__ */ new Map();
function notify() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:exposure-change"));
}
function read() {
	return ledger ??= typeof window === "undefined" ? EMPTY_EXPOSURE : normalizeExposure(loadRecommendationExposureSync());
}
function hydrateRecommendationExposure() {
	if (typeof window === "undefined") return Promise.resolve();
	return hydrating ??= restoreRecommendationExposure().then((saved) => {
		const current = read();
		ledger = newestExposure(saved, current);
		if (JSON.stringify(ledger) !== JSON.stringify(current)) {
			revision++;
			notify();
			refreshExposureRecommendations();
		}
	}).catch(() => {
		hydrating = void 0;
	});
}
function getRecommendationExposure() {
	read();
	if (pending.size) {
		ledger = applyExposureEvents(ledger, [...pending].map(([key, at]) => ({
			key,
			at
		})));
		pending.clear();
	}
	return ledger;
}
var getExposureRevision = () => revision;
function exposureDiagnostics() {
	return {
		entries: getRecommendationExposure().entries.length,
		pending: pending.size,
		status
	};
}
function queue() {
	dirty = true;
	attempt++;
	status = "pending";
	if (timer !== void 0 || cancelWork) return;
	timer = setTimeout(() => {
		timer = void 0;
		cancelWork = scheduleBackgroundWork(() => {
			cancelWork = void 0;
			flushRecommendationExposure();
		}, { timeoutMs: 1e4 });
	}, 5e3);
}
function recordRecommendationExposure(key, now = Date.now()) {
	if (!key || key.length > 500 || pending.has(key) || pending.size >= 256) return;
	const previous = read().entries.find((row) => row.key === key);
	if (previous && now - previous.at < 18e5) return;
	pending.set(key, now);
	revision++;
	queue();
}
function flushRecommendationExposure() {
	if (timer !== void 0) clearTimeout(timer);
	timer = void 0;
	cancelWork?.();
	cancelWork = void 0;
	if (!dirty) return;
	dirty = false;
	const value = getRecommendationExposure(), current = ++attempt;
	saveRecommendationExposure(value).then((ok) => {
		if (current !== attempt) return;
		status = ok ? "saved" : "failed";
		notify();
	}, () => {
		if (current !== attempt) return;
		status = "failed";
		notify();
	});
}
function retryRecommendationExposure() {
	dirty = true;
	flushRecommendationExposure();
}
function markRecommendationOpened(video) {
	const current = getRecommendationExposure(), key = exposureKey(video);
	if (!current.entries.some((row) => row.key === key)) return;
	ledger = clearExposure(current, key);
	revision++;
	queue();
}
function resetRecommendationExposure() {
	ledger = clearExposure(getRecommendationExposure());
	pending.clear();
	revision++;
	queue();
	flushRecommendationExposure();
	refreshExposureRecommendations();
	notify();
}
function importRecommendationExposure(raw) {
	if (!isExposureLedger(raw)) return;
	ledger = {
		...normalizeExposure(raw),
		updatedAt: Math.max(Date.now(), getRecommendationExposure().updatedAt + 1)
	};
	pending.clear();
	revision++;
	queue();
	flushRecommendationExposure();
	refreshExposureRecommendations();
	notify();
}
function refreshExposureRecommendations() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:rating-change"));
}
if (typeof window !== "undefined") {
	const hide = () => {
		if (document.visibilityState === "hidden") flushRecommendationExposure();
	};
	window.addEventListener("pagehide", flushRecommendationExposure);
	document.addEventListener("visibilitychange", hide);
}
//#endregion
export { markRecommendationOpened as a, refreshExposureRecommendations as c, hydrateRecommendationExposure as i, resetRecommendationExposure as l, getExposureRevision as n, recommendation_exposure_store_DrLUoFck_exports as o, getRecommendationExposure as r, recordRecommendationExposure as s, exposureDiagnostics as t, retryRecommendationExposure as u };
