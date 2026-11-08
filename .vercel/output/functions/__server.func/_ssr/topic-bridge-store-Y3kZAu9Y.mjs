import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-C3xxOucA.mjs";
import { Da as restoreTopicBridges, Hr as normalizeBridgeLedger, In as isBridgeLedger, Nr as newestBridges, c as EMPTY_BRIDGES, ho as saveTopicBridges, pr as loadTopicBridgesSync, yt as changeBridge } from "./persist-BKzTZjAH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/topic-bridge-store-Y3kZAu9Y.js
var topic_bridge_store_Y3kZAu9Y_exports = /* @__PURE__ */ __exportAll({
	a: () => topicBridgeSaveStatus,
	i: () => retryTopicBridgeSave,
	n: () => hydrateTopicBridges,
	o: () => topic_bridge_store_exports,
	r: () => pauseTopicBridge,
	t: () => getTopicBridges
});
var topic_bridge_store_exports = /* @__PURE__ */ __exportAll$1({
	getTopicBridges: () => getTopicBridges,
	hydrateTopicBridges: () => hydrateTopicBridges,
	importTopicBridges: () => importTopicBridges,
	pauseTopicBridge: () => pauseTopicBridge,
	retryTopicBridgeSave: () => retryTopicBridgeSave,
	topicBridgeSaveStatus: () => topicBridgeSaveStatus
});
var ledger = EMPTY_BRIDGES;
var started = false;
var pending;
var status = "saved";
var attempt = 0;
var notify = (name = "reelcase:bridge-change") => {
	if (typeof window !== "undefined") window.dispatchEvent(new Event(name));
};
function getTopicBridges() {
	if (!started && typeof window !== "undefined") {
		started = true;
		ledger = normalizeBridgeLedger(loadTopicBridgesSync());
	}
	return ledger;
}
function hydrateTopicBridges() {
	getTopicBridges();
	if (typeof window === "undefined") return Promise.resolve();
	return pending ??= restoreTopicBridges().then((saved) => {
		const next = newestBridges(saved, ledger);
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
	saveTopicBridges(ledger).then((ok) => {
		if (current !== attempt) return;
		status = ok ? "saved" : "failed";
		notify("reelcase:bridge-save");
	}, () => {
		if (current !== attempt) return;
		status = "failed";
		notify("reelcase:bridge-save");
	});
}
function pauseTopicBridge(row, remove = false) {
	const next = changeBridge(getTopicBridges(), row, remove);
	if (next === ledger) return;
	ledger = next;
	save();
	notify();
}
var topicBridgeSaveStatus = () => status;
function retryTopicBridgeSave() {
	save();
}
function importTopicBridges(raw) {
	if (!isBridgeLedger(raw)) return;
	const current = getTopicBridges();
	ledger = {
		...normalizeBridgeLedger(raw),
		updatedAt: Math.max(Date.now(), current.updatedAt + 1)
	};
	save();
	notify();
}
//#endregion
export { topicBridgeSaveStatus as a, retryTopicBridgeSave as i, hydrateTopicBridges as n, topic_bridge_store_Y3kZAu9Y_exports as o, pauseTopicBridge as r, getTopicBridges as t };
