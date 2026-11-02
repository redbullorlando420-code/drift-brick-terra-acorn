import { o as __toESM } from "../_runtime.mjs";
import { Jt as __exportAll } from "./twitch-retry-D5SsgGzE.mjs";
import { t as cn } from "./utils-Cq6DDHIb.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { a as currentProfileId, i as createProfileStorage, n as PROFILE_SELECTION_KEY, r as assertProfileContext, s as profileDatabaseName, t as PROFILE_PREFIX, u as validProfileId } from "./local-profile-storage-YmNvgtyc.mjs";
import { t as PERFORMANCE_MODE_KEY } from "./performance-profile-BTCSA4hL.mjs";
import { C as RESTORE_EVENT, Dn as installRestoreEpoch, Ln as libraryRestoreState, O as activateLibraryRestore, Xi as restoreDurablePrefs, aa as restorePreparationError, ea as restoreEpoch, lt as cancelRestorePreparation, qt as discardLibraryRestore, ra as restoreIsPreparing, zi as repairLibraryRestoreMirrors } from "./persist-BLKyjE-q.mjs";
import { _ as Link, f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as number, c as union, i as literal, l as unknown, n as _enum, o as object, r as discriminatedUnion, s as string, t as number$1 } from "../_libs/zod.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Dzt9BRxN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PROFILE_SOURCE_FILE = "profile/source.json";
/** Descriptive provenance only. Never a restore destination or authentication identity. */
function readProfileSource(raw) {
	const row = raw;
	if (!row || typeof row !== "object" || Array.isArray(row) || row.version !== 1 || typeof row.id !== "string" || !validProfileId(row.id) || typeof row.name !== "string" || !row.name.trim() || row.name !== row.name.trim() || row.name.length > 48 || /[\u0000-\u001f\u007f]/.test(row.name) || Object.keys(row).some((key) => ![
		"version",
		"id",
		"name"
	].includes(key)) || (row.id === "default" ? row.name !== "Default" : row.name.toLocaleLowerCase() === "default")) throw Error("Unsupported source-profile metadata. The backup was not applied.");
	return {
		version: 1,
		id: row.id,
		name: row.name
	};
}
var PROFILE_SETTINGS_PREFS_KEY = "reelcase.prefs.v4";
var PROFILE_SETTING_FIELDS = {
	view: {
		label: "Library layout",
		values: ["grid", "list"]
	},
	sort: {
		label: "Library sort",
		values: [
			"name",
			"added",
			"size",
			"duration",
			"recent",
			"type",
			"folder",
			"path"
		]
	},
	performanceMode: {
		label: "Performance preset",
		values: ["adaptive", "low-memory"]
	},
	hardwareAccel: {
		label: "Hardware playback preference",
		values: [true, false]
	}
};
function readProfileSettings(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw Error("Profile settings must be an object.");
	const keys = Object.keys(raw);
	if (!keys.length || keys.length > Object.keys(PROFILE_SETTING_FIELDS).length) throw Error("Choose 1–4 supported settings.");
	const settings = {};
	for (const key of keys) {
		if (!Object.hasOwn(PROFILE_SETTING_FIELDS, key)) throw Error("This pack contains unsupported settings. No settings were applied.");
		const field = key, value = raw[key];
		if (!PROFILE_SETTING_FIELDS[field].values.includes(value)) throw Error("Invalid value for " + PROFILE_SETTING_FIELDS[field].label + ".");
		settings[field] = value;
	}
	return settings;
}
function selectProfileSettings(raw, keys) {
	const valid = readProfileSettings(raw), selected = {};
	for (const key of new Set(keys)) {
		if (!Object.hasOwn(PROFILE_SETTING_FIELDS, key) || !Object.hasOwn(valid, key)) throw Error("The selected setting is unavailable. Review the pack again.");
		selected[key] = valid[key];
	}
	return readProfileSettings(selected);
}
function parseProfileSettingsPack(text) {
	if (new TextEncoder().encode(text).length > 32768) throw Error("Profile settings packs are limited to 32 KiB.");
	let row;
	try {
		row = JSON.parse(text);
	} catch {
		throw Error("This settings pack is not valid JSON.");
	}
	if (!row || typeof row !== "object" || Array.isArray(row) || row.format !== "realhub-profile-settings" || row.version !== 1 || Object.keys(row).some((key) => ![
		"format",
		"version",
		"exportedAt",
		"sourceProfile",
		"settings"
	].includes(key)) || typeof row.exportedAt !== "string" || row.exportedAt.length > 40 || !Number.isFinite(Date.parse(row.exportedAt))) throw Error("Unsupported profile settings pack. Choose a version 1 Realhub settings export.");
	return {
		format: row.format,
		version: 1,
		exportedAt: row.exportedAt,
		sourceProfile: readProfileSource(row.sourceProfile),
		settings: readProfileSettings(row.settings)
	};
}
/** Deliberately omits history, identifiers, paths, endpoints, grants and account data. */
function captureProfileSettings(state) {
	return readProfileSettings(Object.fromEntries(Object.keys(PROFILE_SETTING_FIELDS).map((key) => [key, state[key]])));
}
function makeProfileSettingsPack(source, settings, now = /* @__PURE__ */ new Date()) {
	return parseProfileSettingsPack(JSON.stringify({
		format: "realhub-profile-settings",
		version: 1,
		exportedAt: now.toISOString(),
		sourceProfile: source,
		settings
	}));
}
var DEFAULT_PROFILE = {
	id: "default",
	name: "Default",
	createdAt: 0
};
var PROFILE_REGISTRY_DB = "realhub-local-profiles";
var PROFILE_REGISTRY_EVENT = "realhub:profile-registry";
var PROFILE_REGISTRY_CHANNEL = "realhub-profile-registry-v1";
function validateProfileName(name) {
	const trimmed = name.trim();
	if (!trimmed || trimmed.length > 48 || trimmed.toLocaleLowerCase() === "default" || /[\u0000-\u001f\u007f]/.test(trimmed)) throw Error("Use a unique profile name with 1–48 characters. Default is reserved; control characters are not allowed.");
	return trimmed;
}
/** Control-plane hints only. Receivers always reread the transactional registry. */
function announceRegistry(revision) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(PROFILE_REGISTRY_EVENT));
	try {
		const channel = new BroadcastChannel(PROFILE_REGISTRY_CHANNEL);
		channel.postMessage({
			version: 1,
			revision
		});
		channel.close();
	} catch {}
}
function subscribeProfileRegistryChanges(notify) {
	const visible = () => {
		if (document.visibilityState !== "hidden") notify();
	};
	window.addEventListener(PROFILE_REGISTRY_EVENT, notify);
	window.addEventListener("focus", visible);
	document.addEventListener("visibilitychange", visible);
	let channel;
	try {
		channel = new BroadcastChannel(PROFILE_REGISTRY_CHANNEL);
		channel.onmessage = (event) => {
			const hint = event.data;
			if (hint?.version === 1 && Number.isSafeInteger(hint.revision) && hint.revision >= 0) notify();
		};
	} catch {}
	return () => {
		window.removeEventListener(PROFILE_REGISTRY_EVENT, notify);
		window.removeEventListener("focus", visible);
		document.removeEventListener("visibilitychange", visible);
		channel?.close();
	};
}
function readProfileRegistry(raw) {
	if (raw === void 0) return {
		version: 1,
		revision: 0,
		profiles: []
	};
	const r = raw;
	if (!r || r.version !== 1 || !Number.isSafeInteger(r.revision) || r.revision < 0 || !Array.isArray(r.profiles) || r.profiles.length >= 16 || r.profiles.some((p) => !p || p.id === "default" || !validProfileId(p.id) || typeof p.name !== "string" || !p.name.trim() || p.name.length > 48 || p.name.toLocaleLowerCase() === "default" || !Number.isSafeInteger(p.createdAt) || p.createdAt < 0) || new Set(r.profiles.map((p) => p.id)).size !== r.profiles.length || new Set(r.profiles.map((p) => p.name.toLocaleLowerCase())).size !== r.profiles.length) throw Error("The local profile registry is unsupported. Existing libraries were kept.");
	return r;
}
function openRegistry() {
	return new Promise((yes, no) => {
		const request = indexedDB.open(PROFILE_REGISTRY_DB, 1);
		request.onupgradeneeded = () => request.result.createObjectStore("control");
		request.onsuccess = () => yes(request.result);
		request.onerror = () => no(request.error ?? Error("Local profile registry could not open."));
		request.onblocked = () => no(Error("Another tab is updating the profile registry. Close that tab and retry."));
	});
}
function createProfileRepository(open, committed = () => {}) {
	async function list() {
		const db = await open();
		try {
			return await new Promise((yes, no) => {
				const tx = db.transaction("control"), r = tx.objectStore("control").get("registry");
				tx.oncomplete = () => {
					try {
						yes(readProfileRegistry(r.result));
					} catch (e) {
						no(e);
					}
				};
				tx.onerror = tx.onabort = () => no(tx.error ?? Error("Profiles could not be read."));
			});
		} finally {
			db.close();
		}
	}
	async function create(name, initialize) {
		const trimmed = validateProfileName(name);
		const db = await open();
		try {
			return await new Promise((yes, no) => {
				const tx = db.transaction("control", "readwrite"), store = tx.objectStore("control"), read = store.get("registry");
				let cleanup;
				let result, cause, revision = 0;
				tx.oncomplete = () => {
					try {
						committed(revision);
					} catch {}
					yes(result);
				};
				tx.onerror = tx.onabort = () => {
					try {
						cleanup?.();
					} catch {
						no(Error("The new profile was not published. Its unused settings could not be cleared; existing profiles were kept."));
						return;
					}
					no(cause ?? tx.error ?? Error("The new profile could not be saved."));
				};
				read.onsuccess = () => {
					try {
						const registry = readProfileRegistry(read.result);
						if (registry.profiles.some((p) => p.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) throw Error("A profile already uses that name.");
						result = {
							id: "p-" + crypto.randomUUID(),
							name: trimmed,
							createdAt: Date.now()
						};
						const next = {
							version: 1,
							revision: registry.revision + 1,
							profiles: [...registry.profiles, result]
						};
						readProfileRegistry(next);
						cleanup = initialize?.(result);
						revision = next.revision;
						store.put(next, "registry");
					} catch (e) {
						cause = e;
						tx.abort();
					}
				};
			});
		} finally {
			db.close();
		}
	}
	async function rename(id, name) {
		if (id === "default") throw Error("Default keeps its reserved name.");
		if (!validProfileId(id)) throw Error("Invalid profile selection.");
		const trimmed = validateProfileName(name), db = await open();
		try {
			return await new Promise((yes, no) => {
				const tx = db.transaction("control", "readwrite"), store = tx.objectStore("control"), read = store.get("registry");
				let result, cause, revision;
				tx.oncomplete = () => {
					if (revision !== void 0) try {
						committed(revision);
					} catch {}
					yes(result);
				};
				tx.onerror = tx.onabort = () => no(cause ?? tx.error ?? Error("The profile name could not be saved. Its previous name was kept."));
				read.onsuccess = () => {
					try {
						const registry = readProfileRegistry(read.result), existing = registry.profiles.find((p) => p.id === id);
						if (!existing) throw Error("That local profile is no longer available. Refresh the profile list.");
						if (registry.profiles.some((p) => p.id !== id && p.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) throw Error("A profile already uses that name.");
						result = {
							...existing,
							name: trimmed
						};
						if (existing.name === trimmed) return;
						const next = {
							...registry,
							revision: registry.revision + 1,
							profiles: registry.profiles.map((p) => p.id === id ? result : p)
						};
						readProfileRegistry(next);
						revision = next.revision;
						store.put(next, "registry");
					} catch (e) {
						cause = e;
						tx.abort();
					}
				};
			});
		} finally {
			db.close();
		}
	}
	return {
		list,
		create,
		rename
	};
}
var repository = createProfileRepository(openRegistry, announceRegistry);
async function listLocalProfiles() {
	return [DEFAULT_PROFILE, ...(await repository.list()).profiles];
}
var createLocalProfile = (name) => repository.create(name);
var createConfiguredLocalProfile = (name, raw) => {
	const settings = readProfileSettings(raw);
	return repository.create(name, (profile) => {
		const storage = createProfileStorage(() => globalThis.localStorage, profile.id);
		if (storage.length) throw Error("The new profile namespace is not empty. No existing settings were overwritten.");
		const { performanceMode, ...prefs } = settings;
		const written = [];
		const cleanup = () => {
			let failed = false;
			for (const key of written) try {
				storage.removeItem(key);
			} catch {
				failed = true;
			}
			if (failed) throw Error("The new profile was not published. Its unused settings could not be cleared; existing profiles were kept.");
		};
		try {
			storage.setItem(PROFILE_SETTINGS_PREFS_KEY, JSON.stringify({
				...prefs,
				sourceId: "home"
			}));
			written.push(PROFILE_SETTINGS_PREFS_KEY);
			if (performanceMode !== void 0) {
				storage.setItem(PERFORMANCE_MODE_KEY, String(performanceMode));
				written.push(PERFORMANCE_MODE_KEY);
			}
		} catch (error) {
			cleanup();
			throw error;
		}
		return cleanup;
	});
};
async function localProfileSource() {
	const profile = await activeLocalProfile();
	return readProfileSource({
		version: 1,
		id: profile.id,
		name: profile.name
	});
}
var renameLocalProfile = (id, name) => repository.rename(id, name);
async function activeLocalProfile() {
	assertProfileContext();
	const id = currentProfileId();
	if (id === "default") return DEFAULT_PROFILE;
	const profile = (await listLocalProfiles()).find((p) => p.id === id);
	if (!profile) throw Error("This local profile is missing. Return to Default; existing libraries have not been changed.");
	return profile;
}
async function validateProfileTarget(id) {
	if (!(await listLocalProfiles()).some((p) => p.id === id)) throw Error("That local profile is no longer available.");
}
function chooseDefaultProfile() {
	globalThis.sessionStorage.setItem(PROFILE_SELECTION_KEY, "default");
	location.reload();
}
async function activateLocalProfile(id) {
	await validateProfileTarget(id);
	globalThis.sessionStorage.setItem(PROFILE_SELECTION_KEY, id);
	location.reload();
}
/** Counts only; no titles, file handles, drafts or private tag values are read. */
async function inspectLocalProfile(id = currentProfileId()) {
	if (!validProfileId(id)) throw Error("Invalid profile selection.");
	let preferences = 0;
	const prefix = PROFILE_PREFIX + id + ":";
	for (let i = 0; i < globalThis.localStorage.length; i++) {
		const key = globalThis.localStorage.key(i) ?? "";
		if (id === "default" ? /^(reelcase|realhub)[.:_-]/.test(key) && !key.startsWith("realhub.profile.v1:") && key !== "realhub.active-local-profile.v1" : key.startsWith(prefix)) preferences++;
	}
	const result = {
		id,
		preferences,
		databases: []
	};
	if (typeof indexedDB.databases !== "function") return {
		...result,
		measurement: "Database counts unavailable in this browser. No databases were opened for this preview."
	};
	const names = new Set((await indexedDB.databases()).map((row) => row.name));
	for (const base of ["reelcase", "reelcase-prints"]) {
		const name = profileDatabaseName(base, id);
		if (!names.has(name)) continue;
		const db = await new Promise((yes, no) => {
			const r = indexedDB.open(name);
			r.onupgradeneeded = () => {
				r.transaction?.abort();
				no(Error("The database changed during preview. Retry to inspect the current setup."));
			};
			r.onsuccess = () => yes(r.result);
			r.onerror = () => no(r.error);
		});
		try {
			const counts = {};
			for (const store of Array.from(db.objectStoreNames)) counts[store] = await new Promise((yes, no) => {
				const r = db.transaction(store).objectStore(store).count();
				r.onsuccess = () => yes(r.result);
				r.onerror = () => no(r.error);
			});
			result.databases.push({
				name,
				stores: counts
			});
		} finally {
			db.close();
		}
	}
	return result;
}
async function hydratePersonalReaders() {
	await restoreDurablePrefs();
	const modules = await Promise.all([
		import("./media-feedback-CKdjk9WZ.mjs").then((n) => n.g).then((n) => n.m),
		import("./topic-alias-store-VpX-1OFI.mjs").then((n) => n.a).then((n) => n.a),
		import("./topic-bridge-store-CIFug5FF.mjs").then((n) => n.o),
		import("./guide-preset-store-D114d2uj.mjs").then((n) => n.i),
		import("./film-review-store-OPgbJ-W1.mjs").then((n) => n.n).then((n) => n.n),
		import("./anime-review-store-CoPJbh9Y.mjs").then((n) => n.t).then((n) => n.t),
		import("./provider-viewing-store-B5fk34XI.mjs").then((n) => n.a).then((n) => n.a),
		import("./recommendation-exposure-store-DrLUoFck.mjs").then((n) => n.o).then((n) => n.o)
	]);
	await Promise.all([
		modules[0].hydrateDurableFeedback(),
		modules[1].hydrateTopicAliases(),
		modules[2].hydrateTopicBridges(),
		modules[3].hydrateGuidePreset(),
		modules[4].hydrateFilmReviews(),
		modules[5].hydrateAnimeReviews(),
		modules[6].hydrateProviderViewing(),
		modules[7].hydrateRecommendationExposure()
	]);
}
/** A committed generation's mirrors finish before any page can resume personal writes. */
function RestoreBoundary({ children }) {
	const [control, setControl] = (0, import_react.useState)(), [ready, setReady] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	const latch = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		let alive = true;
		const refresh = () => void libraryRestoreState().then((next) => {
			if (alive) {
				setControl(next);
				if (restorePreparationError()) setError(restorePreparationError());
			}
		}, (e) => {
			if (alive) setError(e instanceof Error ? e.message : "Restore state could not be read.");
		});
		(async () => {
			try {
				let next = await libraryRestoreState();
				if (!alive) return;
				setControl(next);
				if (next.mirror) {
					await repairLibraryRestoreMirrors();
					location.reload();
					return;
				}
				if (!alive) return;
				setControl(next);
				if (next.phase === "idle") {
					installRestoreEpoch(next.epoch);
					if (next.epoch > 0) await hydratePersonalReaders();
					if (alive) setReady(true);
				}
			} catch (e) {
				if (alive) setError(e instanceof Error ? e.message : "Recovery could not complete.");
			}
		})();
		const storage = (e) => {
			if (e.key === "reelcase.restore-head.v1") refresh();
		};
		window.addEventListener(RESTORE_EVENT, refresh);
		window.addEventListener("storage", storage);
		return () => {
			alive = false;
			window.removeEventListener(RESTORE_EVENT, refresh);
			window.removeEventListener("storage", storage);
		};
	}, []);
	const stale = !!control && ready && !control.mirror && control.epoch !== restoreEpoch(), blocked = !!error && !ready || !!control && (control.phase !== "idle" || !!control.mirror || stale);
	const action = async (work) => {
		if (latch.current) return;
		latch.current = true;
		setBusy(true);
		setError("");
		try {
			await work();
			location.reload();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Restore recovery failed.");
			const next = await libraryRestoreState().catch(() => void 0);
			if (next) setControl(next);
		} finally {
			latch.current = false;
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		inert: blocked || void 0,
		"aria-hidden": blocked || void 0,
		children
	}), (!ready || blocked) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"data-workspace-loading": "true",
		role: blocked ? "dialog" : void 0,
		"aria-modal": blocked ? "true" : void 0,
		"aria-label": "Library restore recovery",
		className: ready ? "fixed inset-0 z-50 overflow-y-auto bg-bg/95 p-5 backdrop-blur-sm" : "min-h-screen bg-bg p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto mt-12 max-w-xl space-y-4 rounded-xl border border-border bg-surface p-6 text-fg shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: stale ? "Library restored in another tab" : control?.mirror ? "Finishing library recovery" : control?.phase === "ready" ? "Verified restore ready" : control?.phase === "capturing" ? "Preparing a safe restore" : "Loading your saved workspace"
				}),
				control?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "break-words text-sm text-muted",
					children: control.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-6 text-muted",
					children: stale ? "Reload to use the complete restored generation. This tab’s older state cannot overwrite it." : control?.mirror ? "The personal data transaction committed. Emergency mirrors must finish before the workspace can safely resume. Retrying is idempotent; rollback remains available." : control?.phase === "ready" ? "Both generations were read back and verified. Activation switches the complete personal-data snapshot together and retains one recovery slot. Native media and folder permissions are not changed. Activating another restore replaces the earlier recovery slot." : control?.phase === "capturing" ? "The current library has not been replaced. Preparation stores and verifies a separate personal-data snapshot. If preparation was interrupted, discard it safely and inspect the backup again." : "Checking saved preferences and any interrupted restore before opening your pages."
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "break-words text-sm text-danger",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						restoreIsPreparing() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11 max-w-full whitespace-normal",
							onClick: cancelRestorePreparation,
							children: "Stop preparation"
						}),
						stale && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11 max-w-full whitespace-normal",
							onClick: () => location.reload(),
							children: "Reload restored workspace"
						}),
						!stale && control?.phase === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11 max-w-full whitespace-normal",
							disabled: busy,
							onClick: () => void action(() => activateLibraryRestore()),
							children: busy ? "Activating…" : "Activate verified restore and reload"
						}),
						!stale && control?.phase !== "idle" && control && !control.mirror && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11 max-w-full whitespace-normal",
							disabled: busy || restoreIsPreparing(),
							onClick: () => void action(discardLibraryRestore),
							children: "Discard staged restore"
						}),
						!stale && control?.mirror && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11 max-w-full whitespace-normal",
							disabled: busy,
							onClick: () => void action(repairLibraryRestoreMirrors),
							children: "Retry mirror recovery"
						}),
						!stale && control?.mirror && control.previous && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11 max-w-full whitespace-normal",
							disabled: busy,
							onClick: () => void action(() => activateLibraryRestore(true)),
							children: "Roll back restore and reload"
						}),
						!ready && error && !control && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11 max-w-full whitespace-normal",
							onClick: () => location.reload(),
							children: "Retry workspace recovery"
						})
					]
				})
			]
		})
	})] });
}
function LibraryRestoreRecovery() {
	const [control, setControl] = (0, import_react.useState)(), [review, setReview] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let alive = true;
		libraryRestoreState().then((v) => {
			if (alive) setControl(v);
		}, (e) => {
			if (alive) setError(e instanceof Error ? e.message : "Recovery state unavailable.");
		});
		return () => {
			alive = false;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Library restore recovery slot",
		className: "mt-4 space-y-3 rounded-lg border border-border bg-elevated p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Restore recovery slot"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: control?.previous ? "One complete personal-data snapshot from before the last restore is available. Rollback replaces follows, ratings, tags, category locks, history, resume and review settings together." : "A verified restore retains one complete previous personal-data generation here. Native media, folder grants and tool documents are outside the restore scope."
			}),
			control?.previous && !review && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "min-h-11 max-w-full whitespace-normal",
				variant: "secondary",
				onClick: () => setReview(true),
				children: "Review restore rollback"
			}),
			review && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm leading-6 text-muted",
					children: [
						"Rollback discards personal-library changes made since the restore at",
						" ",
						control?.at ? new Date(control.at).toLocaleString() : "the saved checkpoint",
						". It consumes this recovery slot. Export the current library first if you need to keep those newer edits. Current private-source boundaries and an enabled privacy PIN remain protected."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy,
						className: "min-h-11 max-w-full whitespace-normal",
						onClick: () => {
							setBusy(true);
							setError("");
							activateLibraryRestore(true).then(() => location.reload(), (e) => {
								setError(e instanceof Error ? e.message : "Rollback failed.");
								setBusy(false);
							});
						},
						children: "Confirm rollback and reload"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy,
						variant: "ghost",
						className: "min-h-11 max-w-full whitespace-normal",
						onClick: () => setReview(false),
						children: "Keep current generation"
					})]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			})
		]
	});
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
function NotFoundPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-accent",
				children: "Realhub"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "That page is not here"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm leading-6 text-muted",
				children: "This library view may have moved. Return to Home, then open Landing page or another workspace from the sidebar."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg",
				children: "Return to Home"
			})
		]
	});
}
function ProfileBoundary({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let alive = true;
		activeLocalProfile().then(() => {
			if (alive) setReady(true);
		}, (e) => {
			if (alive) setError(e instanceof Error ? e.message : "Local profile could not open.");
		});
		return () => {
			alive = false;
		};
	}, []);
	if (ready) return children;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"data-workspace-loading": "true",
		className: "min-h-screen bg-bg p-5 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto mt-12 max-w-xl space-y-4 rounded-xl border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: error ? "Local profile needs attention" : "Opening your local profile"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-6 text-muted",
					children: error || "Checking the selected workspace before loading its library."
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "break-all text-xs text-muted",
					children: [
						"Selected local profile:",
						" ",
						currentProfileId() === "default" ? "Default" : currentProfileId(),
						". This identifier stays the same when a profile is renamed."
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11",
					onClick: chooseDefaultProfile,
					children: "Return to Default profile"
				})
			]
		})
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function TooltipProvider({ delayDuration = 250, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration,
		...props
	});
}
function Tooltip(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root3, { ...props });
}
function TooltipTrigger(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, { ...props });
}
function TooltipContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 rounded-sm bg-elevated px-2 py-1 text-xs text-fg shadow-border", className),
		...props
	}) });
}
var styles_default = "/assets/styles-beHolWN9.css";
var APP_NAME = "Realhub";
var Route$8 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Every video on this computer, in one private library."
			},
			{
				name: "theme-color",
				content: "#0c0b0a"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestoreBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$2 = () => import("./routes-BqTnM4t1.mjs");
var Route$7 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("../_-aPwKtyBO.mjs");
var Route$6 = createFileRoute("/$")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./landing-12EMebhC.mjs");
var Route$5 = createFileRoute("/landing")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var isPrivateV4 = (address) => {
	const parts = address.split(".").map(Number);
	return parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) && (parts[0] === 10 || parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31 || parts[0] === 192 && parts[1] === 168);
};
var Route$4 = createFileRoute("/api/lan-origin")({ server: { handlers: { GET: ({ request }) => {
	const url = new URL(request.url);
	if (process.env.VERCEL || ![
		"localhost",
		"127.0.0.1",
		"[::1]"
	].includes(url.hostname.toLowerCase())) return Response.json({ origins: [] }, { headers: { "cache-control": "no-store" } });
	const candidates = Object.entries(networkInterfaces()).filter(([name]) => !/nord|vpn|tun|tap|wireguard|veth|virtual|hyper-v|loopback|wsl|docker|tailscale|zerotier/i.test(name)).flatMap(([name, rows]) => (rows ?? []).filter((row) => row.family === "IPv4" && !row.internal && isPrivateV4(row.address)).map((row) => ({
		name,
		address: row.address
	})));
	candidates.sort((a, b) => Number(/ethernet|wi-?fi|wlan/i.test(b.name)) - Number(/ethernet|wi-?fi|wlan/i.test(a.name)));
	const origins = [...new Set(candidates.map(({ address }) => `${url.protocol}//${address}${url.port ? `:${url.port}` : ""}`))].slice(0, 4);
	return Response.json({ origins }, { headers: { "cache-control": "no-store" } });
} } } });
var _0002_network_presence_default = "CREATE TABLE IF NOT EXISTS reelcase_network_presence (\n  scope TEXT NOT NULL,\n  device_id TEXT NOT NULL,\n  label TEXT NOT NULL,\n  device_kind TEXT NOT NULL,\n  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),\n  PRIMARY KEY (scope, device_id)\n);\n\nCREATE INDEX IF NOT EXISTS reelcase_network_presence_active\n  ON reelcase_network_presence (scope, last_seen DESC);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef$1 = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef$1.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef$1.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef$1.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef$1.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef$1.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef$1.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_network_presence.sql": _0002_network_presence_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef$1.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef$1.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var device = object({
	id: string().uuid(),
	label: string().trim().min(1).max(48),
	kind: _enum(["desktop", "mobile"])
});
function json$1(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
function scopeFor(request) {
	return (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").toLowerCase().slice(0, 255);
}
async function activeDevices(sql, scope) {
	await sql.query("DELETE FROM reelcase_network_presence WHERE last_seen < now() - interval '90 seconds'");
	return (await sql.query("SELECT device_id, label, device_kind, last_seen FROM reelcase_network_presence WHERE scope = $1 AND last_seen > now() - interval '90 seconds' ORDER BY last_seen DESC LIMIT 24", [scope])).map((row) => ({
		id: row.device_id,
		label: row.label,
		kind: row.device_kind,
		lastSeen: new Date(row.last_seen).getTime()
	}));
}
async function handleNetworkPresence(request) {
	try {
		const scope = scopeFor(request);
		if (!scope) return json$1({ error: "missing host" }, 400);
		const sql = await getSql();
		if (request.method === "GET") return json$1({ devices: await activeDevices(sql, scope) });
		if (request.method !== "POST") return json$1({ error: "method not allowed" }, 405);
		const parsed = device.safeParse(await request.json().catch(() => null));
		if (!parsed.success) return json$1({ error: "invalid device" }, 400);
		const { id, label, kind } = parsed.data;
		await sql.query("INSERT INTO reelcase_network_presence (scope, device_id, label, device_kind, last_seen) VALUES ($1, $2, $3, $4, now()) ON CONFLICT (scope, device_id) DO UPDATE SET label = EXCLUDED.label, device_kind = EXCLUDED.device_kind, last_seen = now()", [
			scope,
			id,
			label,
			kind
		]);
		return json$1({ devices: await activeDevices(sql, scope) });
	} catch (error) {
		console.error("[network-presence] failed", error);
		return json$1({ error: "network presence failed" }, 500);
	}
}
var handle$1 = ({ request }) => handleNetworkPresence(request);
var Route$3 = createFileRoute("/api/network-presence")({ server: { handlers: {
	GET: handle$1,
	POST: handle$1
} } });
var globalTunnel = globalThis;
var state = globalTunnel.reelcaseQuickTunnel ??= {};
function localRequest(request) {
	if (process.env.VERCEL) return false;
	const host = request.headers.get("host")?.toLowerCase() ?? "";
	const loopback = /^(?:localhost|127\.0\.0\.1|\[::1\]):8080$/.test(host);
	if (request.headers.has("cf-connecting-ip") || request.headers.has("cf-ray") || request.headers.has("x-forwarded-host")) return false;
	const origin = request.headers.get("origin");
	return loopback && (!origin || origin === `http://${host}` || origin === `https://${host}`);
}
function response(request) {
	if (!localRequest(request)) return Response.json({ error: "Quick Tunnel can only be controlled on the host computer." }, { status: 403 });
	return Response.json({
		running: Boolean(state.url && state.process && !state.process.killed),
		starting: Boolean(state.starting),
		url: state.url ?? null,
		error: state.error ?? null
	}, { headers: { "cache-control": "no-store" } });
}
function startTunnel() {
	if (state.process || state.starting) return;
	state.starting = true;
	state.url = void 0;
	state.error = void 0;
	const child = spawn("cloudflared", [
		"tunnel",
		"--url",
		"http://127.0.0.1:8080"
	], {
		windowsHide: true,
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		]
	});
	state.process = child;
	const capture = (chunk) => {
		const output = chunk.toString();
		const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com\b/i);
		if (match) {
			state.url = match[0];
			state.starting = false;
			state.error = void 0;
		} else if (/failed to|error|fatal/i.test(output) && !state.url) state.error = output.trim().slice(0, 240);
	};
	child.stdout?.on("data", capture);
	child.stderr?.on("data", capture);
	child.on("error", (error) => {
		state.error = error.code === "ENOENT" ? "Install cloudflared on this computer to start a trial tunnel." : error.message;
		state.starting = false;
		if (state.process === child) state.process = void 0;
	});
	child.on("exit", (code) => {
		if (state.process === child) {
			state.process = void 0;
			state.url = void 0;
			state.starting = false;
			if (code && !state.error) state.error = `cloudflared exited with code ${code}.`;
		}
	});
}
var Route$2 = createFileRoute("/api/quick-tunnel")({ server: { handlers: {
	GET: ({ request }) => response(request),
	POST: async ({ request }) => {
		if (!localRequest(request)) return response(request);
		const body = await request.json().catch(() => ({}));
		if (body.action === "start") startTunnel();
		else if (body.action === "stop") {
			state.process?.kill();
			state.process = void 0;
			state.url = void 0;
			state.starting = false;
			state.error = void 0;
		} else return Response.json({ error: "Unknown action." }, { status: 400 });
		return response(request);
	}
} } });
var id = string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
var signal = object({
	op: literal("signal"),
	room: id,
	from: id,
	to: id,
	kind: _enum([
		"offer",
		"answer",
		"ice"
	]),
	payload: unknown().refine((value) => value !== void 0 && JSON.stringify(value).length <= 32768)
});
var post = discriminatedUnion("op", [signal, object({
	op: literal("leave"),
	room: id,
	peer: id
})]);
var globalRef = globalThis;
function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
function ensure(sql) {
	globalRef.__reelcaseRtcSchema ??= Promise.all([
		sql.query("CREATE TABLE IF NOT EXISTS webrtc_peers (room TEXT NOT NULL, peer_id TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', last_seen TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (room, peer_id))"),
		sql.query("CREATE TABLE IF NOT EXISTS webrtc_signals (id BIGSERIAL PRIMARY KEY, room TEXT NOT NULL, to_peer TEXT NOT NULL, from_peer TEXT NOT NULL, kind TEXT NOT NULL, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())"),
		sql.query("CREATE INDEX IF NOT EXISTS webrtc_signals_inbox ON webrtc_signals (room, to_peer, id)")
	]).then(() => void 0).catch((error) => {
		globalRef.__reelcaseRtcSchema = void 0;
		throw error;
	});
	return globalRef.__reelcaseRtcSchema;
}
async function prune(sql) {
	await Promise.all([sql.query("DELETE FROM webrtc_peers WHERE last_seen < now() - interval '30 seconds'"), sql.query("DELETE FROM webrtc_signals WHERE created_at < now() - interval '60 seconds'")]);
}
async function handleSignaling(request) {
	try {
		const sql = await getSql();
		await ensure(sql);
		if (request.method === "GET") {
			const url = new URL(request.url);
			const parsed = object({
				room: id,
				peer: id,
				name: string().max(64).default(""),
				since: number$1().int().min(0).default(0)
			}).safeParse({
				room: url.searchParams.get("room"),
				peer: url.searchParams.get("peer"),
				name: url.searchParams.get("name") ?? "",
				since: url.searchParams.get("since") ?? 0
			});
			if (!parsed.success) return json({ error: "invalid query" }, 400);
			const { room, peer, name, since } = parsed.data;
			if (since === 0 || Math.random() < .02) await prune(sql);
			await sql.query("INSERT INTO webrtc_peers (room, peer_id, name, last_seen) VALUES ($1, $2, $3, now()) ON CONFLICT (room, peer_id) DO UPDATE SET name = EXCLUDED.name, last_seen = now()", [
				room,
				peer,
				name
			]);
			const [peers, signals] = await Promise.all([sql.query("SELECT peer_id, name FROM webrtc_peers WHERE room = $1 AND last_seen > now() - interval '30 seconds' ORDER BY peer_id LIMIT 8", [room]), sql.query("SELECT id, from_peer, kind, payload FROM webrtc_signals WHERE room = $1 AND to_peer = $2 AND id > $3 ORDER BY id LIMIT 200", [
				room,
				peer,
				since
			])]);
			return json({
				peers: peers.map((row) => ({
					id: row.peer_id,
					name: row.name
				})),
				signals: signals.map((row) => ({
					id: Number(row.id),
					from: row.from_peer,
					kind: row.kind,
					payload: row.payload
				}))
			});
		}
		if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
		const parsed = post.safeParse(await request.json().catch(() => null));
		if (!parsed.success) return json({ error: "invalid request" }, 400);
		if (parsed.data.op === "leave") await sql.query("DELETE FROM webrtc_peers WHERE room = $1 AND peer_id = $2", [parsed.data.room, parsed.data.peer]);
		else await sql.query("INSERT INTO webrtc_signals (room, to_peer, from_peer, kind, payload) VALUES ($1, $2, $3, $4, $5)", [
			parsed.data.room,
			parsed.data.to,
			parsed.data.from,
			parsed.data.kind,
			JSON.stringify(parsed.data.payload)
		]);
		return json({ ok: true });
	} catch (error) {
		console.error("[rtc] signaling error", error);
		return json({ error: "signaling failed" }, 500);
	}
}
var handle = ({ request }) => handleSignaling(request);
var Route$1 = createFileRoute("/api/rtc")({ server: { handlers: {
	GET: handle,
	POST: handle
} } });
var rootRouteChildren = {
	IndexRoute: Route$7.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$8
	}),
	SplatRoute: Route$6.update({
		id: "/$",
		path: "/$",
		getParentRoute: () => Route$8
	}),
	LandingRoute: Route$5.update({
		id: "/landing",
		path: "/landing",
		getParentRoute: () => Route$8
	}),
	ApiLanOriginRoute: Route$4.update({
		id: "/api/lan-origin",
		path: "/api/lan-origin",
		getParentRoute: () => Route$8
	}),
	ApiNetworkPresenceRoute: Route$3.update({
		id: "/api/network-presence",
		path: "/api/network-presence",
		getParentRoute: () => Route$8
	}),
	ApiQuickTunnelRoute: Route$2.update({
		id: "/api/quick-tunnel",
		path: "/api/quick-tunnel",
		getParentRoute: () => Route$8
	}),
	ApiRtcRoute: Route$1.update({
		id: "/api/rtc",
		path: "/api/rtc",
		getParentRoute: () => Route$8
	})
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultNotFoundComponent: NotFoundPage
	});
}
//#endregion
export { PROFILE_SOURCE_FILE as C, selectProfileSettings as S, TooltipTrigger as a, makeProfileSettingsPack as b, DEFAULT_PROFILE as c, createLocalProfile as d, inspectLocalProfile as f, subscribeProfileRegistryChanges as g, renameLocalProfile as h, TooltipProvider as i, activateLocalProfile as l, localProfileSource as m, Tooltip as n, NotFoundPage as o, listLocalProfiles as p, TooltipContent as r, LibraryRestoreRecovery as s, router_exports as t, createConfiguredLocalProfile as u, PROFILE_SETTING_FIELDS as v, readProfileSource as w, parseProfileSettingsPack as x, captureProfileSettings as y };
