import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-D5SsgGzE.mjs";
import { c as profileLocalStorage } from "./local-profile-storage-YmNvgtyc.mjs";
import { Dr as newestProviderViewing, Gr as parseProviderViewing, Ir as normalizeProviderViewing, Wa as saveProviderViewing, er as loadProviderViewingSync, m as EMPTY_PROVIDER_VIEWING, oa as restoreProviderViewing } from "./persist-BLKyjE-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/provider-viewing-store-B5fk34XI.js
var provider_viewing_store_B5fk34XI_exports = /* @__PURE__ */ __exportAll({
	a: () => provider_viewing_store_exports,
	i: () => hydrateProviderViewing,
	n: () => getProviderViewing,
	o: () => retryProviderViewingSave,
	r: () => getServerProviderViewing,
	s: () => subscribeProviderViewing,
	t: () => changeProviderViewing
});
var provider_viewing_store_exports = /* @__PURE__ */ __exportAll$1({
	changeProviderViewing: () => changeProviderViewing,
	getProviderViewing: () => getProviderViewing,
	getServerProviderViewing: () => getServerProviderViewing,
	hydrateProviderViewing: () => hydrateProviderViewing,
	importProviderViewing: () => importProviderViewing,
	retryProviderViewingSave: () => retryProviderViewingSave,
	subscribeProviderViewing: () => subscribeProviderViewing
});
var server = {
	ledger: EMPTY_PROVIDER_VIEWING,
	status: "saved",
	ready: false,
	legacyMfc: false
};
var listeners = /* @__PURE__ */ new Set();
var snapshot = server;
var started = false;
var pending;
var attempt = 0;
var emit = () => {
	for (const listener of listeners) listener();
};
function getProviderViewing() {
	if (!started && typeof window !== "undefined") {
		started = true;
		let legacyMfc = false;
		try {
			legacyMfc = profileLocalStorage.getItem("reelcase.mfc.view-mode.v1") === "embedded";
		} catch {}
		snapshot = {
			...snapshot,
			ledger: normalizeProviderViewing(loadProviderViewingSync()),
			legacyMfc
		};
	}
	return snapshot;
}
var getServerProviderViewing = () => server;
function subscribeProviderViewing(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function hydrateProviderViewing() {
	getProviderViewing();
	if (typeof window === "undefined") return Promise.resolve();
	return pending ??= restoreProviderViewing().then((saved) => {
		const next = newestProviderViewing(saved, snapshot.ledger);
		snapshot = {
			...snapshot,
			ledger: JSON.stringify(next) === JSON.stringify(snapshot.ledger) ? snapshot.ledger : next,
			ready: true
		};
		emit();
	}).catch(() => {
		snapshot = {
			...snapshot,
			ready: true
		};
		pending = void 0;
		emit();
	});
}
function save() {
	const current = ++attempt;
	snapshot = {
		...snapshot,
		status: "pending"
	};
	emit();
	saveProviderViewing(snapshot.ledger).then((ok) => {
		if (current !== attempt) return;
		snapshot = {
			...snapshot,
			status: ok ? "saved" : "failed"
		};
		emit();
	}, () => {
		if (current !== attempt) return;
		snapshot = {
			...snapshot,
			status: "failed"
		};
		emit();
	});
}
function changeProviderViewing(change) {
	const old = getProviderViewing().ledger, next = change(old);
	if (next === old) return;
	snapshot = {
		...snapshot,
		ledger: next
	};
	save();
}
function retryProviderViewingSave() {
	save();
}
function importProviderViewing(raw) {
	const old = getProviderViewing().ledger, parsed = parseProviderViewing(raw);
	snapshot = {
		...snapshot,
		ledger: {
			...parsed,
			updatedAt: Math.max(Date.now(), old.updatedAt + 1)
		},
		legacyMfc: false
	};
	save();
}
//#endregion
export { provider_viewing_store_B5fk34XI_exports as a, hydrateProviderViewing as i, getProviderViewing as n, retryProviderViewingSave as o, getServerProviderViewing as r, subscribeProviderViewing as s, changeProviderViewing as t };
