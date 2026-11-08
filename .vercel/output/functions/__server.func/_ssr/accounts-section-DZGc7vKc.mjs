import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { c as profileDatabaseName, d as validProfileId, n as PROFILE_PREFIX, o as currentProfileId } from "./local-profile-storage-CUAAAjCd.mjs";
import { a as setPerformanceMode, n as getPerformanceMode, o as subscribePerformanceProfile } from "./performance-profile-DmjhxzD1.mjs";
import { Z as artworkBytes } from "./persist-BKzTZjAH.mjs";
import { A as Settings2, c as UserRound, l as UserPlus, tn as Check } from "../_libs/lucide-react.mjs";
import { d as createLocalProfile, h as renameLocalProfile } from "./router-3vZ1PekY.mjs";
import { Bt as useLocalProfiles, Lt as listenProfileControls, Rt as refreshLocalProfiles, _n as Input, a as DeskDisclosure, fn as useLibrary, i as ConsequenceAction, nn as onDirectoryGrantForgotten, qt as forgetCurrentDirectoryGrant, zt as settleLocalProfiles } from "./library-app-B2g2Od4o.mjs";
import { v as rememberDirHandle } from "./scan-CiGpVPkS.mjs";
import { i as switchProfileSafely, n as ProfileSwitchInventory, r as StorageRecoveryPanel, t as ProfileSettingsPackPanel } from "./profile-switch-inventory-CjbOnubv.mjs";
import { t as BrowserPermissionControl } from "./capability-permissions-BZeiCEgg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounts-section-DZGc7vKc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ARTWORK_SAMPLE = 256;
var PRINT_SAMPLE = 64;
var appKey = /^(?:reelcase|realhub)[.:_-]/;
function countProfileKeys(storage, id) {
	const prefix = PROFILE_PREFIX + id + ":";
	let keys = 0;
	for (let i = 0; i < storage.length; i++) {
		const key = storage.key(i);
		if (key && (id === "default" ? appKey.test(key) && key !== "realhub.active-local-profile.v1" && !key.startsWith("realhub.profile.v1:") : key.startsWith(prefix))) keys++;
	}
	return keys;
}
var finiteBytes = (bytes) => typeof bytes === "number" && Number.isFinite(bytes) && bytes >= 0 ? bytes : void 0;
var empty = () => ({
	records: 0,
	bytes: 0,
	complete: true
});
/** Open only an enumerated database, and abort if it disappeared or needs creation. */
function openExisting(factory, name, signal) {
	return new Promise((resolve, reject) => {
		signal.throwIfAborted();
		const request = factory.open(name);
		let settled = false;
		const fail = (cause) => {
			if (!settled) {
				settled = true;
				finish();
				reject(cause);
			}
		};
		const abort = () => fail(signal.reason);
		signal.addEventListener("abort", abort, { once: true });
		const finish = () => signal.removeEventListener("abort", abort);
		request.onupgradeneeded = () => {
			request.transaction?.abort();
		};
		request.onsuccess = () => {
			finish();
			if (settled || signal.aborted) request.result.close();
			else {
				settled = true;
				resolve(request.result);
			}
		};
		request.onerror = () => fail(request.error);
		request.onblocked = () => fail(Error("A database is busy."));
	});
}
function untilAbort(task, signal) {
	return new Promise((resolve, reject) => {
		signal.throwIfAborted();
		const stop = () => reject(signal.reason);
		signal.addEventListener("abort", stop, { once: true });
		task.then(resolve, reject).finally(() => signal.removeEventListener("abort", stop));
	});
}
function count(db, stores, signal) {
	if (!stores.length) return Promise.resolve(0);
	return new Promise((resolve, reject) => {
		signal.throwIfAborted();
		const tx = db.transaction(stores, "readonly");
		let total = 0;
		const stop = () => {
			try {
				tx.abort();
			} catch {}
		};
		signal.addEventListener("abort", stop, { once: true });
		for (const store of stores) {
			const request = tx.objectStore(store).count();
			request.onsuccess = () => {
				total += request.result;
			};
		}
		tx.oncomplete = () => {
			signal.removeEventListener("abort", stop);
			resolve(total);
		};
		tx.onabort = () => {
			signal.removeEventListener("abort", stop);
			reject(tx.error ?? signal.reason);
		};
	});
}
function payload$1(db, store, limit, bytesFor, signal) {
	if (!db.objectStoreNames.contains(store)) return Promise.resolve(void 0);
	return new Promise((resolve, reject) => {
		signal.throwIfAborted();
		const tx = db.transaction(store, "readonly"), bucket = tx.objectStore(store);
		const total = bucket.count(), rows = bucket.openCursor();
		let bytes = 0, visited = 0, valid = true;
		const stop = () => {
			try {
				tx.abort();
			} catch {}
		};
		signal.addEventListener("abort", stop, { once: true });
		rows.onsuccess = () => {
			const cursor = rows.result;
			if (!cursor) return;
			visited++;
			const size = bytesFor(cursor.value);
			if (size === void 0) valid = false;
			else bytes += size;
			if (visited < limit) cursor.continue();
		};
		tx.oncomplete = () => {
			signal.removeEventListener("abort", stop);
			resolve({
				records: total.result,
				bytes,
				complete: valid && visited === total.result
			});
		};
		tx.onabort = () => {
			signal.removeEventListener("abort", stop);
			reject(tx.error ?? signal.reason);
		};
	});
}
async function measureProfileBudget(id, cancelled) {
	if (!validProfileId(id)) throw Error("That profile is unavailable.");
	const timeout = AbortSignal.timeout(8e3), signal = cancelled ? AbortSignal.any([cancelled, timeout]) : timeout;
	const result = { issues: [] };
	try {
		result.preferences = countProfileKeys(globalThis.localStorage, id);
	} catch {
		result.issues.push("Browser setting counts are unavailable.");
	}
	const quota = (async () => {
		try {
			const evidence = await globalThis.navigator?.storage?.estimate?.();
			if (!evidence) return;
			const usage = finiteBytes(evidence.usage), quota = finiteBytes(evidence.quota);
			if (usage !== void 0 || quota !== void 0) result.origin = {
				usage,
				quota
			};
		} catch {}
	})();
	const factory = globalThis.indexedDB;
	try {
		if (typeof factory?.databases !== "function") throw Error("Unavailable");
		const names = new Set((await untilAbort(factory.databases(), signal)).map((row) => row.name));
		for (const base of ["reelcase", "reelcase-prints"]) {
			signal.throwIfAborted();
			const name = profileDatabaseName(base, id), library = base === "reelcase";
			if (!names.has(name)) {
				if (library) {
					result.metadataRecords = 0;
					result.artwork = empty();
				} else result.prints = empty();
				continue;
			}
			let db;
			try {
				db = await openExisting(factory, name, signal);
				if (library) {
					const stores = [
						"videos",
						"activity",
						"activity-journal",
						"dirs",
						"source-health"
					].filter((store) => db.objectStoreNames.contains(store));
					result.metadataRecords = await count(db, stores, signal);
					result.artwork = await payload$1(db, "thumb-cache", ARTWORK_SAMPLE, (row) => {
						const thumb = row?.thumb;
						if (thumb instanceof Blob) return thumb.size;
						if (typeof thumb === "string") return artworkBytes(thumb);
					}, signal);
				} else result.prints = await payload$1(db, "blobs", PRINT_SAMPLE, (row) => {
					const blob = row?.blob;
					return blob instanceof Blob ? blob.size : void 0;
				}, signal);
			} catch {
				result.issues.push(library ? "Some library measurements are unavailable." : "Print file measurements are unavailable.");
			} finally {
				db?.close();
			}
		}
	} catch {
		result.issues.push("This browser could not enumerate saved databases. No missing database was opened.");
	}
	await untilAbort(quota, signal).catch(() => {});
	cancelled?.throwIfAborted();
	return result;
}
var number = (value) => value === void 0 ? "Unavailable" : value.toLocaleString();
var bytes = (value) => value === void 0 ? "Unavailable" : value < 1024 ? number(value) + " B" : value < 1024 ** 2 ? (value / 1024).toFixed(1) + " KiB" : value < 1024 ** 3 ? (value / 1024 ** 2).toFixed(1) + " MiB" : (value / 1024 ** 3).toFixed(1) + " GiB";
function payload(value) {
	if (!value) return "Unavailable";
	return number(value.records) + " records · " + (value.complete ? "" : "at least ") + bytes(value.bytes) + (value.complete ? "" : " measured");
}
function ProfileStoragePanel({ profiles, active }) {
	const [selected, setSelected] = (0, import_react.useState)(active), [busy, setBusy] = (0, import_react.useState)(false);
	const [report, setReport] = (0, import_react.useState)(), [error, setError] = (0, import_react.useState)(""), [cleanup, setCleanup] = (0, import_react.useState)(false);
	const pending = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => pending.current?.abort(), []);
	const measure = async () => {
		pending.current?.abort();
		const request = new AbortController();
		pending.current = request;
		setBusy(true);
		setError("");
		try {
			const result = await measureProfileBudget(selected, request.signal);
			if (!request.signal.aborted) setReport(result);
		} catch {
			if (!request.signal.aborted) setError("This profile could not be measured. Its data and your selection were kept.");
		} finally {
			if (!request.signal.aborted) setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Profile storage budget",
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "Compare saved storage without opening another profile or showing its titles, notes or draft contents."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "min-w-0 flex-1 basis-48 text-xs text-muted",
					children: ["Profile to measure", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg",
						value: selected,
						onChange: (e) => {
							pending.current?.abort();
							setSelected(e.target.value);
							setReport(void 0);
							setBusy(false);
							setError("");
							setCleanup(false);
						},
						children: profiles.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: row.id,
							children: [row.name, row.id === active ? " (current)" : ""]
						}, row.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: busy || !profiles.some((row) => row.id === selected),
					onClick: () => void measure(),
					children: busy ? "Measuring…" : "Measure selected profile"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			}),
			report && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid gap-3 sm:grid-cols-2",
					"aria-label": "Storage measurements",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-bg p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-sm font-medium",
								children: "Protected browser data"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 text-sm text-muted",
								children: [
									number(report.preferences),
									" setting keys · ",
									number(report.metadataRecords),
									" local catalog and activity records. Disk bytes unavailable."
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-bg p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-sm font-medium",
								children: "Saved print files"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-sm text-muted",
								children: payload(report.prints)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-bg p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-sm font-medium",
								children: "Disposable browser artwork"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-sm text-muted",
								children: payload(report.artwork)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-bg p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-sm font-medium",
								children: "Shared storage"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 text-sm text-muted",
								children: [
									"Whole site estimate: ",
									bytes(report.origin?.usage),
									" used ·",
									" ",
									bytes(report.origin?.quota),
									" quota. Companion caches and native files are outside this measurement."
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "Payload sizes exclude database overhead. Large caches use a bounded sample, so the reported bytes can be a lower bound. Shared usage cannot be assigned to one profile."
				}),
				report.issues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs text-accent",
					children: issue
				}, issue)),
				selected === active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11",
					variant: "secondary",
					"aria-expanded": cleanup,
					onClick: () => setCleanup((v) => !v),
					children: "Review current profile cleanup"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Switch to this profile before reviewing its artwork cleanup."
				}),
				selected === active && cleanup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StorageRecoveryPanel, {})
			] })
		]
	});
}
var PAGE = 12;
var labels = {
	granted: "Read access granted",
	denied: "Permission needed · denied",
	prompt: "Permission needed",
	unavailable: "Browser permission status unavailable"
};
var basename = (name) => name.split(/[\\/]/).at(-1)?.slice(0, 150) || "Saved folder";
function ProfilePermissionsPanel() {
	const [rows, setRows] = (0, import_react.useState)(), [hidden, setHidden] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [page, setPage] = (0, import_react.useState)(0), [checking, setChecking] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)("");
	const [states, setStates] = (0, import_react.useState)({}), [status, setStatus] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	const loadRevision = (0, import_react.useRef)(0), latch = (0, import_react.useRef)(false);
	const refresh = async () => {
		const request = ++loadRevision.current;
		setChecking(true);
		setError("");
		try {
			const { loadDirectoryGrantRecords, loadHiddenSources } = await import("./persist-BKzTZjAH.mjs").then((n) => n.si).then((n) => n.Y);
			const [records, visibility] = await Promise.all([loadDirectoryGrantRecords(), loadHiddenSources()]);
			if (request !== loadRevision.current) return;
			setRows(records);
			setHidden(new Set(visibility.hidden.map((row) => row.id)));
			setPage((p) => Math.min(p, Math.max(0, Math.ceil(records.length / PAGE) - 1)));
		} catch {
			if (request === loadRevision.current) setError("Saved directory grants could not be read. No access was changed.");
		} finally {
			if (request === loadRevision.current) setChecking(false);
		}
	};
	(0, import_react.useEffect)(() => {
		refresh();
		const off = onDirectoryGrantForgotten(() => void refresh());
		return () => {
			loadRevision.current++;
			off();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!rows) return;
		let live = true;
		setStates({});
		Promise.all(rows.slice(page * PAGE, (page + 1) * PAGE).flatMap((row) => {
			if (!("handle" in row)) return [];
			const handle = row.handle;
			return [(async () => {
				try {
					const state = await handle.queryPermission?.({ mode: "read" });
					return [row.id, state && Object.hasOwn(labels, state) ? state : "unavailable"];
				} catch {
					return [row.id, "unavailable"];
				}
			})()];
		})).then((next) => {
			if (live) setStates(Object.fromEntries(next));
		});
		return () => {
			live = false;
		};
	}, [rows, page]);
	const reauthorize = async (row) => {
		if (!("handle" in row) || hidden.has(row.id) || latch.current) return;
		const handle = row.handle;
		latch.current = true;
		setBusy(row.id);
		setError("");
		setStatus("");
		try {
			const permission = await handle.requestPermission?.({ mode: "read" });
			const { readDirectoryGrant } = await import("./persist-BKzTZjAH.mjs").then((n) => n.si).then((n) => n.Y);
			const latest = await readDirectoryGrant(row.id);
			if (!latest || !("handle" in latest)) throw Error("Folder access changed. Refresh this inventory.");
			if (permission === "granted") {
				rememberDirHandle(row.id, latest.handle);
				useLibrary.setState((s) => ({ folders: s.folders.map((folder) => folder.id === row.id ? {
					...folder,
					needsPermission: false
				} : folder) }));
				setStatus("Folder read access renewed. No scan was started.");
			} else setStatus("Permission was not granted. Saved source records and bookmarks are still available.");
			setStates((s) => ({
				...s,
				[row.id]: permission && Object.hasOwn(labels, permission) ? permission : "unavailable"
			}));
		} catch {
			setStatus("Permission could not be renewed. Saved source records and bookmarks were kept.");
			refresh();
		} finally {
			latch.current = false;
			setBusy("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Profile permission inventory",
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Saved browser folders"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "Read access for the current profile. Checking access does not ask for new permission or scan files."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: checking || !!busy,
					onClick: () => void refresh(),
					children: "Refresh folder access"
				})]
			}),
			checking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-xs text-muted",
				children: "Checking saved folder access…"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			}),
			status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm text-accent",
				children: status
			}),
			rows?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No saved browser folder grants in this profile."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: rows?.slice(page * PAGE, (page + 1) * PAGE).map((row) => {
					const state = states[row.id], isHidden = hidden.has(row.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg border border-border bg-bg p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "break-words text-sm font-medium",
								children: basename(row.name)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: ["handle" in row ? state ? labels[state] : "Checking browser status…" : "Folder access forgotten", isHidden ? " · hidden source" : ""]
							}),
							"handle" in row ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: [!isHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									className: "min-h-11",
									disabled: checking || !!busy || state === "granted" || typeof row.handle.requestPermission !== "function",
									onClick: () => void reauthorize(row),
									children: "Renew read access"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConsequenceAction, {
									label: "Forget folder access",
									title: "Forget access to " + basename(row.name) + "?",
									confirm: "Forget saved access",
									disabled: checking || !!busy,
									onConfirm: async () => {
										await forgetCurrentDirectoryGrant(row.id);
										setStatus("Saved handle forgotten for this profile. The catalog and original files were kept.");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This profile will stop opening or rescanning files through this handle. It cannot start a new Watch Room share from it. An already open stream in another tab may continue." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Catalog rows, bookmarks and original files stay in place. Other profiles and Companion roots are unchanged." })]
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: "Add the folder again or use file identity review to reconnect saved titles."
							})
						]
					}, row.id);
				})
			}),
			!!rows && rows.length > PAGE && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: !page,
						onClick: () => setPage(page - 1),
						children: "Previous folders"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Page ",
						page + 1,
						" of ",
						Math.ceil(rows.length / PAGE)
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: (page + 1) * PAGE >= rows.length,
						onClick: () => setPage(page + 1),
						children: "Next folders"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium",
						children: "Optional permissions for this profile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserPermissionControl, { scope: "local-vision" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserPermissionControl, { scope: "draft-composer" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-bg p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium",
						children: "Companion device access"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: "Approved native roots and Companion permissions apply to this computer and its approved app origins. This inventory never changes them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "mt-2 min-h-11",
						onClick: () => {
							const library = useLibrary.getState();
							library.setQuery("");
							library.setSource("settings");
						},
						children: "Open device settings"
					})
				]
			})
		]
	});
}
var serverMode = () => "adaptive";
var control = "min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg";
var action = "h-auto min-h-11 max-w-full whitespace-normal py-2";
function AccountsSection() {
	const registry = useLocalProfiles(), active = currentProfileId();
	const current = registry.profiles.find((profile) => profile.id === active);
	const [name, setName] = (0, import_react.useState)(""), [rename, setRename] = (0, import_react.useState)();
	const [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)("");
	const latch = (0, import_react.useRef)(false);
	const view = useLibrary((state) => state.view), sort = useLibrary((state) => state.sort);
	const hardware = useLibrary((state) => state.hardwareAccel), ready = useLibrary((state) => state.hydrated);
	const mode = (0, import_react.useSyncExternalStore)(subscribePerformanceProfile, getPerformanceMode, serverMode);
	(0, import_react.useEffect)(listenProfileControls, []);
	const mutate = async (kind) => {
		if (latch.current || registry.status !== "ready") return;
		if (kind === "rename" && (!rename?.trim() || rename.trim() === current?.name)) return;
		latch.current = true;
		setBusy(true);
		setError("");
		setNote("");
		try {
			const result = kind === "create" ? await createLocalProfile(name) : await renameLocalProfile(active, rename ?? "");
			if (kind === "create") setName("");
			else setRename(void 0);
			await settleLocalProfiles();
			setNote(kind === "create" ? result.name + " is ready. Choose Use account to open its empty library." : "Account name updated.");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Account settings could not be saved.");
		} finally {
			latch.current = false;
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Accounts",
		className: "mx-auto max-w-6xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rounded-xl border border-border bg-surface p-5 sm:p-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-accent",
						children: "Your Realhub"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						id: "local-profile-heading",
						tabIndex: -1,
						className: "mt-2 scroll-mt-4 font-display text-4xl text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent",
						children: "Accounts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm leading-6 text-muted",
						children: "Choose who is using Realhub and make their setup feel right. These are saved profiles on this computer, with separate libraries, follows, history, drafts and preferences."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: "Local profiles do not have passwords or separate website sign-ins. Browser permissions and installed Companion services stay on this device."
					})
				]
			}),
			(error || registry.error) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "rounded-lg border border-border bg-surface p-4 text-sm text-danger",
				children: [error || registry.error, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: action + " ml-2",
					onClick: () => {
						setError("");
						refreshLocalProfiles();
					},
					children: "Retry account list"
				})]
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "rounded-lg bg-elevated p-4 text-sm text-accent",
				children: note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-6 xl:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-label": "Choose an account",
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl text-fg",
								children: "Choose an account"
							}),
							registry.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "status",
								className: "text-sm text-muted",
								children: "Loading saved accounts…"
							}),
							registry.profiles.map((profile) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								"aria-label": "Account " + profile.name,
								"data-current-account": profile.id === active || void 0,
								className: "min-w-0 rounded-xl border p-4 " + (profile.id === active ? "border-accent bg-elevated" : "border-border bg-surface"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-w-0 items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											className: "grid size-11 shrink-0 place-items-center rounded-full bg-bg text-base font-medium text-accent",
											children: profile.name.slice(0, 2).toUpperCase()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "break-words text-sm font-medium text-fg",
												children: profile.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted",
												children: profile.id === "default" ? "Original library" : "Local profile"
											})]
										}),
										profile.id === active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											"aria-label": "Current account",
											className: "size-4 shrink-0 text-accent"
										})
									]
								}), profile.id === active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs font-medium text-accent",
									children: "Using this account"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConsequenceAction, {
										label: "Use account",
										title: "Switch to " + profile.name + "?",
										confirm: "Save and switch account",
										disabled: busy || registry.status !== "ready",
										onConfirm: () => switchProfileSafely(profile.id),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
												"This tab will save its current work and open ",
												profile.name,
												". Other tabs keep their account. Nothing is copied between libraries."
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Active pulls or source scans must finish before switching. Native files, directory grants and connected device services are not transferred." }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSwitchInventory, {})
										]
									})
								})]
							}, profile.id))
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						"aria-label": "Create an account",
						className: "space-y-3 rounded-xl border border-border bg-surface p-4",
						onSubmit: (event) => {
							event.preventDefault();
							mutate("create");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "flex items-center gap-2 text-sm font-medium text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {
									"aria-hidden": "true",
									className: "size-4"
								}), "Add an account"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-muted",
								children: ["Account name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: name,
									maxLength: 48,
									"aria-label": "New account name",
									className: "mt-2 min-h-11",
									placeholder: "e.g. notyoda",
									disabled: busy || registry.status !== "ready",
									onChange: (event) => setName(event.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-5 text-muted",
								children: "Starts empty. Your existing collection stays in Default."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: action,
								disabled: busy || !name.trim() || registry.status !== "ready",
								children: busy ? "Saving…" : "Create account"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 space-y-5 xl:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-label": "Current account settings",
							className: "space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
										"aria-hidden": "true",
										className: "mt-1 size-5 shrink-0 text-accent"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: "Current account"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-1 break-words font-display text-2xl text-fg",
											children: current?.name ?? "Selected profile"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "space-y-3",
									onSubmit: (event) => {
										event.preventDefault();
										mutate("rename");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-sm text-fg",
										children: ["Display name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"aria-label": "Account display name",
											className: "mt-2 min-h-11",
											value: rename ?? current?.name ?? "",
											maxLength: 48,
											placeholder: current?.name,
											disabled: active === "default" || busy || registry.status !== "ready",
											onChange: (event) => setRename(event.target.value)
										})]
									}), active === "default" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs leading-5 text-muted",
										children: "Default keeps its name and original library. Add a named account for your own setup."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs leading-5 text-muted",
										children: "Renaming keeps your library and settings in the same account."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: action,
										disabled: busy || !rename?.trim() || rename.trim() === current?.name || registry.status !== "ready",
										children: "Save account name"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-border pt-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "flex items-center gap-2 text-sm font-medium text-fg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
												"aria-hidden": "true",
												className: "size-4"
											}), "Preferences for this account"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs leading-5 text-muted",
											children: "Changes apply to this profile. Other accounts keep their own choices."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
											disabled: !ready,
											className: "mt-4 grid min-w-0 gap-4 sm:grid-cols-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "min-w-0 space-y-2 text-xs text-muted",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Library layout" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
														"aria-label": "Account library layout",
														className: control,
														value: view,
														onChange: (event) => useLibrary.getState().setView(event.target.value),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "grid",
															children: "Poster grid"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "list",
															children: "List"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "min-w-0 space-y-2 text-xs text-muted",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Library sort" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
														"aria-label": "Account library sort",
														className: control,
														value: sort,
														onChange: (event) => useLibrary.getState().setSort(event.target.value),
														children: [
															["added", "Date added"],
															["name", "Name"],
															["recent", "Recently watched"],
															["duration", "Duration"],
															["size", "File size"],
															["type", "File type"],
															["folder", "Folder"],
															["path", "Path"]
														].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value,
															children: label
														}, value))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "min-w-0 space-y-2 text-xs text-muted",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Performance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
														"aria-label": "Account performance preset",
														className: control,
														value: mode,
														onChange: (event) => setPerformanceMode(event.target.value),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "adaptive",
															children: "Adaptive"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "low-memory",
															children: "Low memory"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: "flex min-h-11 items-center gap-3 text-sm text-fg",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: hardware,
														onChange: (event) => useLibrary.getState().setHardwareAccel(event.target.checked)
													}), "Prefer hardware playback"]
												})
											]
										}),
										!ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											role: "status",
											className: "mt-3 text-xs text-muted",
											children: "Loading saved preferences…"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskDisclosure, {
							title: "Storage by profile",
							description: "Compare protected data, print files and disposable artwork.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileStoragePanel, {
								profiles: registry.profiles,
								active
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskDisclosure, {
							title: "Profile permissions",
							description: "Review saved browser folder access and optional app permissions.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfilePermissionsPanel, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskDisclosure, {
							title: "Portable settings",
							description: "Copy selected preferences into a new empty account.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSettingsPackPanel, { onCreated: (profile) => setNote(profile.name + " is ready in the account list. Your current account stayed open.") })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							"aria-label": "More account settings",
							className: "rounded-xl border border-border bg-surface p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium text-fg",
									children: "Library and device settings"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-5 text-muted",
									children: "Backups, storage recovery, source permissions and provider connections remain in Settings. Saved creator follows belong to the account currently open."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									className: action + " mt-4",
									onClick: () => {
										const state = useLibrary.getState();
										state.setQuery("");
										state.setSource("settings");
									},
									children: "Open library and device settings"
								})
							]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { AccountsSection };
