import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { n as getPerformanceMode } from "./performance-profile-DmjhxzD1.mjs";
import { No as subscribeCatalogRecovery, _t as catalogRecoverySnapshot } from "./persist-BKzTZjAH.mjs";
import { L as RefreshCw, Wt as Database, m as Trash2 } from "../_libs/lucide-react.mjs";
import { C as selectProfileSettings, S as parseProfileSettingsPack, _ as validateProfileTarget, b as captureProfileSettings, l as activateLocalProfile, m as localProfileSource, u as createConfiguredLocalProfile, x as makeProfileSettingsPack, y as PROFILE_SETTING_FIELDS } from "./router-3vZ1PekY.mjs";
import { _n as Input, fn as useLibrary, gn as profileSwitchWork, zt as settleLocalProfiles } from "./library-app-B2g2Od4o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-switch-inventory-CjbOnubv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Observe only an already accepted local write; never poll or bypass a checkpoint. */
function waitForAccountWriter(writer, timeoutMs = 5e3) {
	if (!writer.current()) return Promise.resolve();
	return new Promise((resolve, reject) => {
		let settled = false, stop = () => {};
		const finish = (error) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			stop();
			if (error) reject(error);
			else resolve();
		};
		const timer = setTimeout(() => finish(Error("The catalog is still saving. Your current account was kept; try switching again when it finishes.")), timeoutMs);
		const changed = () => {
			if (!writer.current()) finish();
		};
		stop = writer.subscribe(changed);
		if (settled) stop();
		changed();
	});
}
async function checkpointAccountSwitch(checkpoint, writer, activate) {
	try {
		await checkpoint();
	} catch (error) {
		if (!(error instanceof Error) || !error.message.startsWith("A catalog write is still finishing.")) throw error;
		await waitForAccountWriter(await writer());
		await checkpoint();
	}
	await activate();
}
async function switchProfileSafely(id) {
	await profileSwitchWork.run(async () => {
		await validateProfileTarget(id);
		const [{ checkpointLibraryForProfileSwitch, releaseLibraryForProfileSwitch, useLibrary }, { catalogWriter }] = await Promise.all([import("./library-app-B2g2Od4o.mjs").then((n) => n.cn).then((n) => n.S), import("./persist-BKzTZjAH.mjs").then((n) => n.si).then((n) => n.Y)]);
		await checkpointAccountSwitch(checkpointLibraryForProfileSwitch, async () => catalogWriter, () => activateLocalProfile(id, () => {
			profileSwitchWork.assertIdle();
			const current = useLibrary.getState();
			if (current.remoteBusy || current.refreshing || current.scanning || catalogWriter.current()) throw Error("The library started new work. Your current profile was kept; try again when it finishes.");
		}, releaseLibraryForProfileSwitch));
	});
}
function ProfileSettingsPackPanel({ onCreated }) {
	const input = (0, import_react.useRef)(null), latch = (0, import_react.useRef)(false), generation = (0, import_react.useRef)(0);
	const [pack, setPack] = (0, import_react.useState)(), [mode, setMode] = (0, import_react.useState)("export");
	const [selected, setSelected] = (0, import_react.useState)([]), [name, setName] = (0, import_react.useState)(""), [reviewed, setReviewed] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)("");
	const stage = (value, nextMode) => {
		setPack(value);
		setMode(nextMode);
		setSelected(Object.keys(value.settings));
		setReviewed(false);
		setError("");
		setNote("Review only. No profile settings have changed.");
	};
	const load = async (file) => {
		const ticket = ++generation.current;
		setPack(void 0);
		setError("");
		setNote("");
		try {
			if (file.size > 32768) throw Error("Profile settings packs are limited to 32 KiB.");
			const value = parseProfileSettingsPack(await file.text());
			if (ticket === generation.current) stage(value, "import");
		} catch (e) {
			if (ticket === generation.current) setError(e instanceof Error ? e.message : "The settings pack could not be read.");
		}
	};
	const exportCurrent = async () => {
		const ticket = ++generation.current;
		setPack(void 0);
		setReviewed(false);
		setError("");
		try {
			const state = useLibrary.getState();
			if (!state.hydrated) throw Error("Wait for saved preferences to finish loading, then try again.");
			const settings = captureProfileSettings({
				...state,
				performanceMode: getPerformanceMode()
			}), source = await localProfileSource();
			if (ticket === generation.current) stage(makeProfileSettingsPack(source, settings), "export");
		} catch (e) {
			if (ticket === generation.current) setError(e instanceof Error ? e.message : "Settings could not be prepared.");
		}
	};
	const create = async () => {
		if (latch.current || !pack || mode !== "import" || !reviewed || !selected.length || !name.trim()) return;
		latch.current = true;
		setBusy(true);
		setError("");
		setNote("");
		try {
			const profile = await createConfiguredLocalProfile(name, selectProfileSettings(pack.settings, selected));
			setPack(void 0);
			setName("");
			setReviewed(false);
			await settleLocalProfiles();
			onCreated(profile);
			setNote("Created " + profile.name + " with the reviewed settings. Use the profile switch below when ready; this tab stayed in its current profile.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "The new profile could not be prepared. Existing profiles were kept.");
		} finally {
			latch.current = false;
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Portable profile settings",
		className: "space-y-3 rounded-md border border-border bg-bg p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium text-fg",
				children: "Portable profile settings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "Copy selected library layout, sort, performance preset and hardware playback preferences to a new empty profile. Accounts, follows, history, tags, ratings, private settings, file permissions, endpoints and native services are excluded. Existing profiles are never overwritten."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "h-auto min-h-11 max-w-full whitespace-normal py-2",
						disabled: busy,
						onClick: () => void exportCurrent(),
						children: "Review settings to export"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "h-auto min-h-11 max-w-full whitespace-normal py-2",
						disabled: busy,
						onClick: () => input.current?.click(),
						children: "Inspect settings pack"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: input,
						type: "file",
						accept: ".json,application/json",
						"aria-label": "Profile settings pack file",
						className: "sr-only",
						disabled: busy,
						onChange: (event) => {
							const file = event.target.files?.[0];
							if (file) load(file);
							event.target.value = "";
						}
					})
				]
			}),
			pack && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "region",
				"aria-label": "Settings pack review",
				className: "space-y-3 rounded-md bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "break-words text-sm",
						children: [
							"Source profile: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: pack.sourceProfile.name }),
							" ·",
							" ",
							new Date(pack.exportedAt).toLocaleDateString()
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: mode === "export" ? "Download only the checked settings. This does not change this profile." : "Only checked settings will seed a new empty profile. The source label cannot select a destination or copy personal activity. Unchecked fields use normal defaults."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: Object.keys(pack.settings).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 min-w-0 items-center gap-3 text-sm text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: selected.includes(key),
								disabled: busy,
								onChange: (event) => {
									setSelected((previous) => event.target.checked ? [...previous, key] : previous.filter((value) => value !== key));
									setReviewed(false);
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 break-words",
								children: [
									PROFILE_SETTING_FIELDS[key].label,
									": ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: String(pack.settings[key]) })
								]
							})]
						}, key))
					}),
					mode === "export" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "h-auto min-h-11 max-w-full whitespace-normal py-2",
						disabled: busy || !selected.length,
						onClick: () => {
							try {
								const value = makeProfileSettingsPack(pack.sourceProfile, selectProfileSettings(pack.settings, selected)), url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })), link = document.createElement("a");
								link.href = url;
								link.download = "realhub-profile-settings.json";
								link.click();
								setTimeout(() => URL.revokeObjectURL(url), 1e3);
								setNote("Selected settings downloaded. No personal library data was included.");
							} catch (e) {
								setError(e instanceof Error ? e.message : "Export failed.");
							}
						},
						children: "Download selected settings"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted",
							children: ["Destination name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"aria-label": "New settings profile name",
								maxLength: 48,
								value: name,
								disabled: busy,
								className: "mt-1 min-h-11",
								placeholder: "Name for a new empty profile",
								onChange: (event) => {
									setName(event.target.value);
									setReviewed(false);
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-words text-sm",
							children: [
								"Destination: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: name.trim() || "Choose a new profile name" }),
								" · a new local profile"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: reviewed,
								disabled: busy,
								onChange: (event) => setReviewed(event.target.checked)
							}), "I reviewed the selected settings and new destination"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "h-auto min-h-11 max-w-full whitespace-normal py-2",
							disabled: busy || !reviewed || !selected.length || !name.trim(),
							onClick: () => void create(),
							children: busy ? "Creating configured profile…" : "Create profile with selected settings"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "h-auto min-h-11 max-w-full whitespace-normal py-2",
						disabled: busy,
						onClick: () => {
							generation.current++;
							setPack(void 0);
							setReviewed(false);
							setNote("Settings review discarded. No profile settings changed.");
						},
						children: "Discard settings review"
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm leading-6 text-muted",
				children: note
			})
		]
	});
}
var size = (value) => value === void 0 ? "Unavailable" : value < 1024 ? value + " B" : value < 1024 ** 2 ? (value / 1024).toFixed(1) + " KiB" : (value / 1024 ** 2).toFixed(1) + " MiB";
function StorageRecoveryPanel() {
	const status = (0, import_react.useSyncExternalStore)(subscribeCatalogRecovery, catalogRecoverySnapshot, catalogRecoverySnapshot), [open, setOpen] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(""), [preview, setPreview] = (0, import_react.useState)(null), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	const owned = (0, import_react.useRef)(void 0), abort = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => {
		abort.current?.abort();
		const id = owned.current;
		if (id) import("./persist-BKzTZjAH.mjs").then((n) => n.si).then((n) => n.Y).then((module) => module.cancelStorageCleanup(id));
	}, []);
	const cancel = async () => {
		const { cancelStorageCleanup } = await import("./persist-BKzTZjAH.mjs").then((n) => n.si).then((n) => n.Y);
		cancelStorageCleanup(owned.current);
		owned.current = void 0;
		setPreview(null);
		setNote("Preview cancelled. No cache or personal records were removed.");
	};
	const inspect = async () => {
		setBusy("preview");
		setError("");
		setNote("");
		abort.current?.abort();
		const controller = new AbortController();
		abort.current = controller;
		try {
			const { previewStorageCleanup, cancelStorageCleanup } = await import("./persist-BKzTZjAH.mjs").then((n) => n.si).then((n) => n.Y);
			const result = await previewStorageCleanup(controller.signal);
			if (controller.signal.aborted) {
				cancelStorageCleanup(result.id);
				return;
			}
			owned.current = result.id;
			setPreview(result);
		} catch (cause) {
			if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Storage measurements are unavailable.");
		} finally {
			if (!controller.signal.aborted) setBusy("");
		}
	};
	const clear = async () => {
		if (!preview) return;
		setBusy("clear");
		setError("");
		try {
			const { confirmStorageCleanup } = await import("./persist-BKzTZjAH.mjs").then((n) => n.si).then((n) => n.Y);
			const result = await confirmStorageCleanup(preview.id);
			setNote(result.removed + " artwork cache entries removed · approximately " + size(result.estimatedBytes) + " of stored artwork payload. " + result.skipped + " changed or missing entries skipped. This is not a measurement of freed disk space.");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Artwork cleanup failed. Saved personal data was kept.");
		} finally {
			owned.current = void 0;
			setPreview(null);
			setBusy("");
		}
	};
	const retry = async () => {
		setBusy("retry");
		setError("");
		setNote("");
		try {
			const { retryLibraryPersistence } = await import("./library-app-B2g2Od4o.mjs").then((n) => n.cn).then((n) => n.S);
			await retryLibraryPersistence();
			setNote("Pending catalog operations and library preferences were saved. No provider request or download was started.");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Save retry failed. Pending records remain available for review.");
		} finally {
			setBusy("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Storage and save recovery",
		className: "my-6 rounded-xl border border-border bg-surface p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 font-display text-xl text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-5" }), "Storage and save recovery"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "Recover interrupted catalog saves and review disposable artwork before clearing anything."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					"aria-expanded": open,
					onClick: () => setOpen(!open),
					children: open ? "Hide storage recovery" : "Review storage recovery"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "mt-3 text-xs leading-5 text-muted",
				children: [
					status.phase === "error" ? status.error : status.phase === "working" ? "Saving or recovering bounded catalog operations…" : "Catalog recovery ready.",
					" ",
					status.recovered > 0 ? status.recovered + " operations applied this visit." : ""
				]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Ratings, history, tags, locks, categories, follows, drafts, approved folders, catalog rows and pending recovery records are protected. Only the selected browser artwork cache entries can be cleared. Offline artwork can disappear until its source is available again; native caches and original media are untouched."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: !!busy,
							onClick: () => void inspect(),
							children: busy === "preview" ? "Measuring…" : "Preview artwork cleanup"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: !!busy,
							onClick: () => void retry(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), busy === "retry" ? "Retrying saves…" : "Retry pending saves"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Preview is read-only and limited to 256 cache entries. Cancellation removes nothing. Retry waits for initial recovery, then replays pending operations and saves library preferences and currently visible remote cards in batches. A local import stopped before acceptance may need to be repeated."
					}),
					preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-bg p-4",
						"aria-label": "Artwork cleanup preview",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-sm font-medium text-fg",
								children: [preview.count, " artwork cache entries selected"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: [
									"Estimated selected payload: ",
									size(preview.estimatedBytes),
									". Browser origin usage:",
									" ",
									size(preview.inventory.usage),
									" · quota estimate: ",
									size(preview.inventory.quota),
									". Estimates do not measure exact disk allocation."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-3 space-y-2 text-xs text-muted",
								children: [preview.inventory.stores.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									row.name,
									": ",
									row.count.toLocaleString(),
									" records ·",
									" ",
									row.disposable ? "selected artwork may be cleared" : "protected; byte size unavailable"
								] }, row.name)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Browser preferences and drafts:",
									" ",
									preview.inventory.localKeys === void 0 ? "count unavailable" : preview.inventory.localKeys + " keys",
									" ",
									"· protected; byte size unavailable"
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs leading-5 text-muted",
								children: "Preview expires after five minutes. Changed artwork is skipped. Normal browsing can refill this disposable cache."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "min-h-11",
									disabled: !!busy || !preview.count,
									onClick: () => void clear(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), busy === "clear" ? "Clearing artwork…" : "Clear previewed artwork"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									className: "min-h-11",
									disabled: !!busy,
									onClick: () => void cancel(),
									children: "Cancel cleanup preview"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/catalog-recovery-notes.txt",
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex min-h-11 items-center text-sm text-accent underline",
						children: "Read recovery boundaries"
					})
				]
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 text-xs leading-5 text-muted",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-xs leading-5 text-danger",
				children: error
			})
		]
	});
}
function ProfileSwitchInventory() {
	(0, import_react.useSyncExternalStore)(profileSwitchWork.subscribe, profileSwitchWork.version, () => 0);
	const library = useLibrary((s) => s.remoteBusy || s.refreshing || !!s.scanning);
	const entries = profileSwitchWork.inventory();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Pending profile work",
		className: "rounded-lg border border-border bg-bg p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium text-fg",
			children: "Before switching"
		}), !library && !entries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: "No pending tool work detected. The saved library will be checked before switching."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-2 space-y-2 text-xs leading-5 text-muted",
			children: [library && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				className: "text-fg",
				children: "Library: "
			}), "Finish the active pull or source scan."] }), entries.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
				className: "text-fg",
				children: [item.label, ": "]
			}), item.detail] }, item.label + ":" + i))]
		})]
	});
}
//#endregion
export { switchProfileSafely as i, ProfileSwitchInventory as n, StorageRecoveryPanel as r, ProfileSettingsPackPanel as t };
