import { l as profileLocalStorage } from "./local-profile-storage-CUAAAjCd.mjs";
import { t as LIBRARY_LIMITS } from "./youtube-contract-DMSANo43.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/performance-profile-DmjhxzD1.js
var MIB = 1048576;
var standard = Object.freeze({
	lowMemory: false,
	reason: "standard",
	artworkBytes: 8 * MIB,
	artworkEntries: LIBRARY_LIMITS.memoryThumbEntries,
	imageRequests: 12,
	thumbnailWorkers: 4,
	photoWorkers: 12,
	gridMountCap: 108,
	gridPageSize: 24,
	railOverscan: 1
});
var constrained = (reason) => Object.freeze({
	lowMemory: true,
	reason,
	artworkBytes: 2 * MIB,
	artworkEntries: 72,
	imageRequests: 4,
	thumbnailWorkers: 1,
	photoWorkers: 2,
	gridMountCap: 36,
	gridPageSize: 24,
	railOverscan: 0
});
var selected = constrained("selected");
var device = constrained("device");
/** Device memory is a coarse capability hint, never measured free RAM. Unknown
* devices keep normal defaults; explicit low-memory mode also works on desktop. */
function resolvePerformanceProfile(mode, hints = {}) {
	if (mode === "low-memory") return selected;
	return hints.saveData || Number.isFinite(hints.cores) && hints.cores > 0 && hints.cores <= 4 || Number.isFinite(hints.memoryGiB) && hints.memoryGiB > 0 && hints.memoryGiB <= 2 ? device : standard;
}
var PERFORMANCE_MODE_KEY = "reelcase.performance-mode";
var savedMode;
var listeners = /* @__PURE__ */ new Set();
var stopStorage;
function getPerformanceMode() {
	if (typeof window === "undefined") return "adaptive";
	if (!savedMode) try {
		savedMode = profileLocalStorage.getItem("reelcase.performance-mode") === "low-memory" ? "low-memory" : "adaptive";
	} catch {
		savedMode = "adaptive";
	}
	return savedMode;
}
function getPerformanceProfile() {
	const nav = typeof navigator === "undefined" ? void 0 : navigator;
	return resolvePerformanceProfile(getPerformanceMode(), {
		cores: nav?.hardwareConcurrency,
		memoryGiB: nav?.deviceMemory,
		saveData: nav?.connection?.saveData
	});
}
var getServerPerformanceProfile = () => standard;
function setPerformanceMode(mode) {
	savedMode = mode;
	try {
		profileLocalStorage.setItem(PERFORMANCE_MODE_KEY, mode);
	} catch {}
	for (const listener of listeners) listener();
}
/** Only subscribed surfaces retain a shared cross-tab settings listener. */
function subscribePerformanceProfile(listener) {
	if (!listeners.size && typeof window !== "undefined") {
		savedMode = void 0;
		const onStorage = (event) => {
			if (event.key !== "reelcase.performance-mode" && event.key !== null) return;
			savedMode = void 0;
			for (const notify of listeners) notify();
		};
		const onConnection = () => {
			for (const notify of listeners) notify();
		};
		const connection = typeof navigator === "undefined" ? void 0 : navigator.connection;
		window.addEventListener("storage", onStorage);
		connection?.addEventListener("change", onConnection);
		stopStorage = () => {
			window.removeEventListener("storage", onStorage);
			connection?.removeEventListener("change", onConnection);
		};
	}
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
		if (!listeners.size) {
			stopStorage?.();
			stopStorage = void 0;
		}
	};
}
//#endregion
export { setPerformanceMode as a, getServerPerformanceProfile as i, getPerformanceMode as n, subscribePerformanceProfile as o, getPerformanceProfile as r, PERFORMANCE_MODE_KEY as t };
