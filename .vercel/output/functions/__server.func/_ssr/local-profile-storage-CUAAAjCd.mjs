//#region node_modules/.nitro/vite/services/ssr/assets/local-profile-storage-CUAAAjCd.js
var PROFILE_SELECTION_KEY = "realhub.active-local-profile.v1";
var PROFILE_ARRIVAL_KEY = "realhub.profile-arrival.v1";
var PROFILE_PREFIX = "realhub.profile.v1:";
var validProfileId = (id) => id === "default" || /^p-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);
function selection() {
	if (typeof window === "undefined") return "default";
	try {
		return globalThis.sessionStorage?.getItem("realhub.active-local-profile.v1") ?? "default";
	} catch {
		return "default";
	}
}
var boundId = selection();
var currentProfileId = () => boundId;
function assertProfileContext() {
	if (!validProfileId(boundId)) throw Error("This local profile selection is unsupported. Return to Default to recover.");
}
function profileDatabaseName(base, id = boundId) {
	return id === "default" ? base : base + ".profile." + (validProfileId(id) ? id : "invalid");
}
function profileChannelName(base) {
	return boundId === "default" ? base : base + ".profile." + boundId;
}
var reserved = (key) => key === "realhub.active-local-profile.v1" || key === "realhub.profile-arrival.v1" || key.startsWith("realhub.profile.v1:");
function createProfileStorage(native, id) {
	const prefix = id === "default" ? "" : PROFILE_PREFIX + id + ":";
	const physical = (key) => {
		if (!validProfileId(id)) throw Error("Unsupported local profile.");
		if (reserved(key)) throw Error("Reserved profile-control key.");
		return prefix + key;
	};
	const keys = () => {
		const store = native();
		const result = [];
		for (let i = 0; i < store.length; i++) {
			const key = store.key(i);
			if (key === null) continue;
			if (prefix ? key.startsWith(prefix) : !reserved(key)) result.push(prefix ? key.slice(prefix.length) : key);
		}
		return result;
	};
	return {
		get length() {
			return keys().length;
		},
		key: (index) => keys()[index] ?? null,
		getItem: (key) => native().getItem(physical(String(key))),
		setItem: (key, value) => {
			native().setItem(physical(String(key)), String(value));
		},
		removeItem: (key) => {
			native().removeItem(physical(String(key)));
		},
		clear: () => {
			const names = keys().slice();
			for (const key of names) native().removeItem(physical(key));
		}
	};
}
var profileLocalStorage = createProfileStorage(() => globalThis.localStorage, boundId);
var profileSessionStorage = createProfileStorage(() => globalThis.sessionStorage, boundId);
/** Normalize only app storage events; authentication SDK transport stays global. */
function profileEventKey(key, id = boundId) {
	if (key === null) return null;
	if (key === "realhub.active-local-profile.v1" || key === "realhub.profile-arrival.v1") return void 0;
	if (key.startsWith("realhub.profile.v1:")) {
		const prefix = PROFILE_PREFIX + id + ":";
		return id !== "default" && key.startsWith(prefix) ? key.slice(prefix.length) : void 0;
	}
	if (id !== "default" && /^(?:reelcase|realhub)[.:_-]/.test(key)) return void 0;
	return key;
}
if (typeof window !== "undefined") {
	const normalized = /* @__PURE__ */ new WeakSet();
	const receive = (event) => {
		if (normalized.has(event)) return;
		const key = profileEventKey(event.key);
		if (key === event.key) return;
		event.stopImmediatePropagation();
		if (key === void 0) return;
		const translated = new StorageEvent("storage", {
			key,
			oldValue: event.oldValue,
			newValue: event.newValue,
			url: event.url,
			storageArea: event.storageArea
		});
		normalized.add(translated);
		window.dispatchEvent(translated);
	};
	window.addEventListener("storage", receive, true);
}
//#endregion
export { createProfileStorage as a, profileDatabaseName as c, validProfileId as d, assertProfileContext as i, profileLocalStorage as l, PROFILE_PREFIX as n, currentProfileId as o, PROFILE_SELECTION_KEY as r, profileChannelName as s, PROFILE_ARRIVAL_KEY as t, profileSessionStorage as u };
