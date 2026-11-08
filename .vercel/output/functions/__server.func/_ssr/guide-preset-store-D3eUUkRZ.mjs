import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-C3xxOucA.mjs";
import { Ir as newestGuidePreset, Kr as normalizeGuidePreset, Na as rollbackGuidePreset, f as EMPTY_GUIDE_PRESET, no as saveGuidePreset, rr as loadGuidePresetSync, xt as changeGuidePreset, ya as restoreGuidePreset, zn as isGuidePreset } from "./persist-BKzTZjAH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guide-preset-store-D3eUUkRZ.js
var guide_preset_store_D3eUUkRZ_exports = /* @__PURE__ */ __exportAll({
	a: () => hydrateGuidePreset,
	i: () => guide_preset_store_exports,
	n: () => getGuidePreset,
	o: () => retryGuidePresetSave,
	r: () => guidePresetSaveStatus,
	s: () => undoGuidePreset,
	t: () => acceptGuidePreset
});
var guide_preset_store_exports = /* @__PURE__ */ __exportAll$1({
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
export { hydrateGuidePreset as a, guide_preset_store_D3eUUkRZ_exports as i, getGuidePreset as n, retryGuidePresetSave as o, guidePresetSaveStatus as r, undoGuidePreset as s, acceptGuidePreset as t };
