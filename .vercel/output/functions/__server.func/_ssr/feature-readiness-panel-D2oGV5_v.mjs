import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { F as RefreshCw, R as Power, sn as ArrowRight } from "../_libs/lucide-react.mjs";
import { D as negotiateCompanion } from "./companion-DacueTBp.mjs";
import { $n as useLibrary } from "./store-0MIXEefC.mjs";
import { Vt as Button } from "./library-app-BzjSyqkW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/feature-readiness-panel-D2oGV5_v.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Metadata/health observations never promote a native action to verified. */
function featureReadiness(input) {
	const { snapshot } = input, negotiation = negotiateCompanion(snapshot?.health);
	const native = (id, title, cap, target) => {
		const base = {
			id,
			title,
			target,
			evidence: "Externally unverified",
			next: "Check capabilities, then use the feature’s own reviewed controls."
		};
		if (!snapshot) return {
			...base,
			state: "unchecked",
			configuration: "Not checked on this computer"
		};
		if (!negotiation.compatible) return {
			...base,
			state: "unavailable",
			configuration: "Companion unavailable or incompatible",
			next: "Start Realhub and Companion from the desktop launcher, then check again."
		};
		if (!negotiation.capabilities.includes(cap)) return {
			...base,
			state: "unsupported",
			configuration: "Required capability is unavailable",
			next: "Update Companion for this capability. Existing browser features remain usable."
		};
		const probe = snapshot.probes[id];
		if (!probe?.ok) return {
			...base,
			state: "unavailable",
			configuration: "Status check did not succeed",
			next: "Open this feature to review its connection, then retry the check."
		};
		const value = probe.value;
		if (id === "downloads") return {
			...base,
			state: value.configured === true ? "ready" : "unconfigured",
			configuration: value.configured === true ? "Downloader and approved output folder available" : "Downloader or approved output folder missing",
			evidence: "Authenticated download and playback unverified",
			next: "Review disk space and session access before starting a download."
		};
		if (id === "remote") return {
			...base,
			state: value.installed === true ? "ready" : "unconfigured",
			configuration: value.installed === true ? "RustDesk installed · launch controls available" : "RustDesk installation not detected",
			evidence: "Native authentication and session unverified",
			next: "Review the peer, approve one launch and authenticate in RustDesk. A launcher receipt does not prove connection."
		};
		const ready = value.connected === true && value.ready === true;
		return {
			...base,
			state: ready ? "ready" : "unconfigured",
			configuration: ready ? "Engine API and model metadata available" : value.connected === true ? "Engine responds · model setup incomplete" : "Engine API not connected",
			evidence: "Successful image generation unverified",
			next: id === "qwen" ? "Review the matching Qwen diffusion model, text encoder and VAE, then run model preflight." : "Review an AUTOMATIC1111-compatible checkpoint, then run model preflight."
		};
	};
	return [
		{
			id: "library",
			title: "Local library",
			state: !input.hydrated ? "unchecked" : input.videos > 0 ? "ready" : "unconfigured",
			configuration: !input.hydrated ? "Saved catalog loading" : input.videos > 0 ? "Saved catalog metadata available" : "No saved videos yet",
			evidence: "Individual file access and playback unverified",
			next: "Open a saved video or choose local files. A catalog entry alone cannot verify its file.",
			target: "landing"
		},
		native("downloads", "YouTube downloads", "youtube-downloads", "settings"),
		native("a1111", "Stable Diffusion", "studio-models", "stable-diffusion"),
		native("qwen", "Qwen image engine", "studio-models", "stable-diffusion"),
		native("remote", "Remote desktop", "remote-launch-safeguards", "remote-desktop"),
		{
			id: "signal",
			title: "Stream Signal",
			state: "ready",
			configuration: "Manual drafts, exports and sharing checklist available",
			evidence: "Social publishing and Twitch live detection unconnected",
			next: "Prepare a pack, review each draft and share it yourself. Copying or opening a composer is not publication.",
			target: "stream-signal"
		},
		{
			id: "chat",
			title: "Chat Plays Lab",
			state: "ready",
			configuration: "Local batching simulator available",
			evidence: "Live chat and installed game control unconnected",
			next: "Try simulated ballots. Real racing requires a separate local game adapter and authenticated connection.",
			target: "stream-signal"
		},
		{
			id: "watch",
			title: "Watch Together",
			state: "ready",
			configuration: "Room and queue controls available",
			evidence: "This room’s cross-device playback unverified",
			next: "Join the same room on another device and review its player status. Provider embedding restrictions still apply.",
			target: "watch-room"
		}
	];
}
function FeatureReadinessPanel() {
	const hydrated = useLibrary((s) => s.hydrated), videos = useLibrary((s) => s.videos.length), go = useLibrary((s) => s.setSource);
	const [open, setOpen] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false), [snapshot, setSnapshot] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)("");
	const check = async () => {
		setBusy(true);
		setError("");
		try {
			const { companionHealth } = await import("./companion-DacueTBp.mjs").then((n) => n.w).then((n) => n.y), { localTool } = await import("./local-tools-C2hAclyW.mjs");
			const health = await companionHealth(true), probes = {};
			if (health?.negotiation?.compatible) {
				const capabilities = health.negotiation.capabilities;
				await Promise.allSettled([
					[
						"downloads",
						"/youtube/downloads",
						"youtube-downloads"
					],
					[
						"a1111",
						"/studio/status",
						"studio-models"
					],
					[
						"qwen",
						"/studio/qwen/status",
						"studio-models"
					],
					[
						"remote",
						"/remote/status",
						"remote-launch-safeguards"
					]
				].map(async ([id, path, cap]) => {
					if (!capabilities.includes(cap)) return;
					try {
						const value = await localTool(path);
						probes[id] = {
							ok: true,
							value
						};
					} catch {
						probes[id] = { ok: false };
					}
				}));
			}
			setSnapshot({
				health,
				probes,
				checkedAt: Date.now()
			});
		} catch {
			setError("The check could not finish. Previous observations remain visible; no setup was changed.");
		} finally {
			setBusy(false);
		}
	};
	const rows = featureReadiness({
		hydrated,
		videos,
		snapshot
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Feature readiness",
		className: "my-6 rounded-xl border border-border bg-surface p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl text-fg",
						children: "Feature readiness"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: "App implementation, local setup and real-world verification are separate. Milestone checkmarks do not connect an integration."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					"aria-expanded": open,
					onClick: () => setOpen(!open),
					children: open ? "Hide readiness" : "Review readiness"
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-bg p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "flex items-center gap-2 text-sm font-medium text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: "size-4" }), "Desktop server controls"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: "Use Realhub on your desktop to launch the server and Companion. Stop Realhub shuts down this installation and keeps saved libraries. Active work is interrupted; save edits first. Closing a browser tab leaves the services running."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: "The stop shortcut requests Companion cleanup and verifies exact process identities before its fallback. Separately started native apps or handed-off RustDesk sessions may stay open."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: busy,
							onClick: () => void check(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), busy ? "Checking local setup…" : "Check local readiness"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "status",
							className: "text-xs text-muted",
							children: snapshot ? "Snapshot at " + new Date(snapshot.checkedAt).toLocaleTimeString() + ". Check again after changing setup." : "No local services checked yet."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "A check reads local status only. It does not start engines, scan folders, download models, connect accounts or join rooms. Configuration ready means a prerequisite is available; native actions remain unverified here."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 lg:grid-cols-2",
						children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							"data-readiness": row.id,
							className: "min-w-0 rounded-lg border border-border bg-bg p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium text-fg",
										children: row.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded border border-border px-2 py-1 text-xs text-muted",
										children: "App implemented"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs leading-5 text-fg",
									"data-configuration": row.state,
									children: row.configuration
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-5 text-muted",
									children: row.evidence
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-5 text-muted",
									children: row.next
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "mt-3 min-h-11",
									onClick: () => {
										go(row.target);
										window.scrollTo({
											top: 0,
											behavior: "instant"
										});
									},
									children: [
										"Open ",
										row.title,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
									]
								})
							]
						}, row.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "inline-flex min-h-11 items-center text-sm text-accent underline",
						href: "/feature-readiness-evidence.json",
						target: "_blank",
						rel: "noreferrer",
						children: "Read implementation verification evidence"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Evidence describes controlled checks of app behavior. Missing native or account evidence remains unverified. This inventory does not store private probe results or change milestone statuses."
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-xs text-danger",
				children: error
			})
		]
	});
}
//#endregion
export { FeatureReadinessPanel as t };
