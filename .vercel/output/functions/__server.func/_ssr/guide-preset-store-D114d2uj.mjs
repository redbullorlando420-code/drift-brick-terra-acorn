import { Jt as __exportAll } from "./twitch-retry-D5SsgGzE.mjs";
import { Er as newestGuidePreset, Fr as normalizeGuidePreset, Mn as isGuidePreset, Xn as loadGuidePresetSync, _a as rollbackGuidePreset, _t as changeGuidePreset, f as EMPTY_GUIDE_PRESET, na as restoreGuidePreset, za as saveGuidePreset } from "./persist-BLKyjE-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guide-preset-store-D114d2uj.js
var guide_preset_store_exports = /* @__PURE__ */ __exportAll({
	acceptGuidePreset: () => acceptGuidePreset,
	getGuidePreset: () => getGuidePreset,
	guidePresetSaveStatus: () => guidePresetSaveStatus,
	hydrateGuidePreset: () => hydrateGuidePreset,
	importGuidePreset: () => importGuidePreset,
	retryGuidePresetSave: () => retryGuidePresetSave,
	undoGuidePreset: () => undoGuidePreset
});
var ledger = EMPTY_GUIDE_PRESET;
var started = false;
var pending;
var status = "saved";
var attempt = 0;
var notify = (name = "reelcase:guide-preset-change") => {
	if (typeof window !== "undefined") window.dispatchEvent(new Event(name));
};
function getGuidePreset() {
	if (!started && typeof window !== "undefined") {
		started = true;
		ledger = normalizeGuidePreset(loadGuidePresetSync());
	}
	return ledger;
}
function hydrateGuidePreset() {
	getGuidePreset();
	if (typeof window === "undefined") return Promise.resolve();
	return pending ??= restoreGuidePreset().then((saved) => {
		const next = newestGuidePreset(saved, ledger);
		if (JSON.stringify(next) !== JSON.stringify(ledger)) {
			ledger = next;
			notify();
		}
	}).catch(() => {
		pending = void 0;
	});
}
function save() {
	const current = ++attempt;
	status = "pending";
	saveGuidePreset(ledger).then((ok) => {
		if (current !== attempt) return;
		status = ok ? "saved" : "failed";
		notify("reelcase:guide-preset-save");
	}, () => {
		if (current !== attempt) return;
		status = "failed";
		notify("reelcase:guide-preset-save");
	});
}
/** Called only by explicit acceptance of a reviewed current-library experiment. */
function acceptGuidePreset(weights) {
	const next = changeGuidePreset(getGuidePreset(), weights);
	if (next === ledger) return;
	ledger = next;
	save();
	notify();
}
function undoGuidePreset() {
	const next = rollbackGuidePreset(getGuidePreset());
	if (next === ledger) return;
	ledger = next;
	save();
	notify();
}
var guidePresetSaveStatus = () => status;
function retryGuidePresetSave() {
	save();
}
function importGuidePreset(raw) {
	if (!isGuidePreset(raw)) return;
	const old = getGuidePreset(), parsed = normalizeGuidePreset(raw);
	ledger = normalizeGuidePreset({
		...parsed,
		updatedAt: Math.max(Date.now(), old.updatedAt + 1)
	});
	save();
	notify();
}
//#endregion
export { hydrateGuidePreset as a, guide_preset_store_exports as i, getGuidePreset as n, retryGuidePresetSave as o, guidePresetSaveStatus as r, undoGuidePreset as s, acceptGuidePreset as t };
