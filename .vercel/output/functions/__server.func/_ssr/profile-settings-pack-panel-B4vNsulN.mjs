import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { n as getPerformanceMode } from "./performance-profile-BTCSA4hL.mjs";
import { S as selectProfileSettings, b as makeProfileSettingsPack, m as localProfileSource, u as createConfiguredLocalProfile, v as PROFILE_SETTING_FIELDS, x as parseProfileSettingsPack, y as captureProfileSettings } from "./router-Dzt9BRxN.mjs";
import { _t as Input, ht as settleLocalProfiles } from "./library-app-CdyqOeNr.mjs";
import { yt as useLibrary } from "./store-tNfphKUZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-settings-pack-panel-B4vNsulN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
//#endregion
export { ProfileSettingsPackPanel as t };
