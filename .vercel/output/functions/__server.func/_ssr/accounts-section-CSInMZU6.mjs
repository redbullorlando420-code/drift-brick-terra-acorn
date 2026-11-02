import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { a as currentProfileId } from "./local-profile-storage-YmNvgtyc.mjs";
import { a as setPerformanceMode, n as getPerformanceMode, o as subscribePerformanceProfile } from "./performance-profile-BTCSA4hL.mjs";
import { A as Settings2, c as UserRound, en as Check, l as UserPlus } from "../_libs/lucide-react.mjs";
import { d as createLocalProfile, h as renameLocalProfile, l as activateLocalProfile } from "./router-Dzt9BRxN.mjs";
import { _t as Input, gt as useLocalProfiles, ht as settleLocalProfiles, mt as refreshLocalProfiles, n as ConsequenceAction, pt as listenProfileControls, r as DeskDisclosure } from "./library-app-CdyqOeNr.mjs";
import { yt as useLibrary } from "./store-tNfphKUZ.mjs";
import { t as ProfileSettingsPackPanel } from "./profile-settings-pack-panel-B4vNsulN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/accounts-section-CSInMZU6.js
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
var serverMode = () => "adaptive";
var control = "min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg";
var action = "h-auto min-h-11 max-w-full whitespace-normal py-2";
async function switchAccount(id) {
	const { checkpointLibraryForProfileSwitch } = await import("./store-tNfphKUZ.mjs").then((n) => n.mt).then((n) => n.x);
	await checkpointAccountSwitch(checkpointLibraryForProfileSwitch, async () => (await import("./persist-BLKyjE-q.mjs").then((n) => n.Yr).then((n) => n.q)).catalogWriter, () => activateLocalProfile(id));
}
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
										onConfirm: () => switchAccount(profile.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											"This tab will save its current work and open ",
											profile.name,
											". Other tabs keep their account. Nothing is copied between libraries."
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Active pulls or source scans must finish before switching. Native files, directory grants and connected device services are not transferred." })]
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
