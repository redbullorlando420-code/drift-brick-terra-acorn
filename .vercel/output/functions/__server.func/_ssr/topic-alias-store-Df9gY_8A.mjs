import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-C3xxOucA.mjs";
import { Ct as changeTopicAlias, Ea as restoreTopicAliases, Fn as installTopicAliases, Hn as isTopicAliasLedger, Xr as normalizeTopicAliases, fr as loadTopicAliasesSync, mo as saveTopicAliases, yn as getTopicAliases, zr as newestTopicAliases } from "./persist-BKzTZjAH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/topic-alias-store-Df9gY_8A.js
var topic_alias_store_Df9gY_8A_exports = /* @__PURE__ */ __exportAll({
	a: () => topic_alias_store_exports,
	i: () => topicAliasSaveStatus,
	n: () => retryTopicAliasSave,
	r: () => reviewTopicAlias,
	t: () => hydrateTopicAliases
});
var topic_alias_store_exports = /* @__PURE__ */ __exportAll$1({
	ensureTopicAliases: () => ensureTopicAliases,
	hydrateTopicAliases: () => hydrateTopicAliases,
	importTopicAliases: () => importTopicAliases,
	retryTopicAliasSave: () => retryTopicAliasSave,
	reviewTopicAlias: () => reviewTopicAlias,
	topicAliasSaveStatus: () => topicAliasSaveStatus
});
var started = false;
var pending;
var status = "saved";
var attempt = 0;
function notify() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event("reelcase:topic-alias-change"));
		window.dispatchEvent(new Event("reelcase:rating-change"));
	}
}
function ensureTopicAliases() {
	if (started || typeof window === "undefined") return;
	started = true;
	installTopicAliases(loadTopicAliasesSync());
}
function hydrateTopicAliases() {
	ensureTopicAliases();
	if (typeof window === "undefined") return Promise.resolve();
	return pending ??= restoreTopicAliases().then((saved) => {
		if (installTopicAliases(newestTopicAliases(saved, getTopicAliases())).length) notify();
	}).catch(() => {
		pending = void 0;
	});
}
function save() {
	const current = ++attempt;
	status = "pending";
	saveTopicAliases(getTopicAliases()).then((ok) => {
		if (current !== attempt) return;
		status = ok ? "saved" : "failed";
		if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:topic-alias-save"));
	}, () => {
		if (current !== attempt) return;
		status = "failed";
		if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:topic-alias-save"));
	});
}
function reviewTopicAlias(entry, remove = false) {
	ensureTopicAliases();
	const next = changeTopicAlias(getTopicAliases(), entry, remove);
	if (next === getTopicAliases()) return;
	installTopicAliases(next);
	save();
	notify();
}
function retryTopicAliasSave() {
	save();
}
var topicAliasSaveStatus = () => status;
function importTopicAliases(raw) {
	if (!isTopicAliasLedger(raw)) return;
	ensureTopicAliases();
	const current = getTopicAliases(), parsed = normalizeTopicAliases(raw);
	installTopicAliases({
		...parsed,
		updatedAt: Math.max(Date.now(), current.updatedAt + 1)
	});
	save();
	notify();
}
ensureTopicAliases();
//#endregion
export { topic_alias_store_Df9gY_8A_exports as a, topicAliasSaveStatus as i, retryTopicAliasSave as n, reviewTopicAlias as r, hydrateTopicAliases as t };
