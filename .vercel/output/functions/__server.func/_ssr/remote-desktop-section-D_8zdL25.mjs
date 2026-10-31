import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Z as MonitorPlay, at as Lock } from "../_libs/lucide-react.mjs";
import { O as requireCompanionFeature } from "./companion-DacueTBp.mjs";
import { Bt as Input, G as useCurrentUserState, Vt as Button } from "./library-app-BzjSyqkW.mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, s as HubShell, t as Card } from "./hub-shared-4nVqg49O.mjs";
import { localTool } from "./local-tools-C2hAclyW.mjs";
import { t as Badge } from "./badge-hLoUDFkT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/remote-desktop-section-D_8zdL25.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RemoteDesktopSection() {
	const { user, isPending } = useCurrentUserState();
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-6 text-muted",
		children: isPending ? "Loading your workspace…" : "Sign in through this app to use remote launch controls."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RemoteWorkspace, {}, user.id);
}
function RemoteWorkspace() {
	const [peer, setPeer] = (0, import_react.useState)(""), [confirmation, setConfirmation] = (0, import_react.useState)(""), [approval, setApproval] = (0, import_react.useState)(null), [status, setStatus] = (0, import_react.useState)(null), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false), [owned, setOwned] = (0, import_react.useState)(false), [seconds, setSeconds] = (0, import_react.useState)(0);
	const [requester] = (0, import_react.useState)(() => {
		const bytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16));
		const value = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
		return value.slice(0, 8) + "-" + value.slice(8, 12) + "-" + value.slice(12, 16) + "-" + value.slice(16, 20) + "-" + value.slice(20);
	});
	const used = (0, import_react.useRef)(false);
	const mounted = (0, import_react.useRef)(true), operation = (0, import_react.useRef)(false);
	const currentApproval = (0, import_react.useRef)(approval);
	currentApproval.current = approval;
	(0, import_react.useEffect)(() => {
		const hide = () => {
			if (document.visibilityState !== "hidden" || !currentApproval.current) return;
			const token = currentApproval.current.token;
			currentApproval.current = null;
			setApproval(null);
			setConfirmation("");
			setNote("Unconfirmed approval cancelled when this tab was hidden. Prepare a new request to continue.");
			localTool("/remote/revoke", {
				token,
				requester
			}, void 0, true).catch(() => {});
		};
		document.addEventListener("visibilitychange", hide);
		return () => document.removeEventListener("visibilitychange", hide);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!approval) return;
		const tick = () => {
			const remaining = Math.max(0, Math.ceil((approval.deadline - performance.now()) / 1e3));
			setSeconds(remaining);
			if (!remaining) {
				setApproval(null);
				setConfirmation("");
				setNote("Connection approval expired. Prepare a new request.");
			}
		};
		tick();
		const timer = setInterval(tick, 1e3);
		return () => clearInterval(timer);
	}, [approval]);
	(0, import_react.useEffect)(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			if (used.current) localTool("/remote/lock", { requester }).catch(() => {});
		};
	}, []);
	const check = async () => {
		const next = await localTool("/remote/status");
		if (mounted.current) setStatus(next);
	};
	const revokeApproval = () => {
		setApproval(null);
		setConfirmation("");
		if (approval) localTool("/remote/revoke", {
			token: approval.token,
			requester
		}).catch(() => {});
	};
	const act = async (path) => {
		if (operation.current) return;
		operation.current = true;
		if (path !== "check") used.current = true;
		setBusy(true);
		setNote("");
		setError("");
		try {
			if (path === "arm") {
				await requireCompanionFeature("remote-launch-safeguards");
				const next = await localTool("/remote/arm", {
					peer,
					requester
				});
				if (mounted.current && document.visibilityState !== "hidden") {
					setApproval({
						...next,
						deadline: performance.now() + Math.min(3e4, Math.max(0, next.ttlMs ?? next.expires - Date.now()))
					});
					setConfirmation("");
				} else {
					await localTool("/remote/revoke", {
						token: next.token,
						requester
					});
					if (mounted.current) setNote("Unconfirmed approval cancelled while this tab was hidden. Prepare a new request.");
				}
			} else if (path === "connect") {
				const token = approval?.token;
				setApproval(null);
				setConfirmation("");
				const result = await localTool("/remote/connect", {
					peer,
					token,
					confirmation,
					requester
				});
				if (mounted.current) {
					setOwned(false);
					setNote(result.note);
				}
			} else if (path === "lock") {
				setApproval(null);
				setConfirmation("");
				setOwned(false);
				const result = await localTool("/remote/lock", { requester });
				if (mounted.current) setNote(result.note);
			}
			await check();
		} catch (cause) {
			if (path === "connect") {
				try {
					await check();
				} catch {}
				if (mounted.current) setNote("Check the native launch activity before retrying. A missing response does not prove the launcher failed; no automatic retry was sent.");
			}
			if (mounted.current) setError(cause instanceof Error ? cause.message : "Start Companion on this computer and retry.");
		} finally {
			operation.current = false;
			if (mounted.current) setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Personal access",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4" }),
		title: "Remote desktop",
		copy: "A guarded handoff to RustDesk on this computer. Desktop viewing and control run in RustDesk’s native window, outside this website.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": "Remote session verification",
				className: "mt-5 space-y-2 rounded-lg border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium text-fg",
						children: "Remote session: unverified"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-6 text-muted",
						children: "RustDesk authenticates the peer and owns all viewing, input and session permissions. Realhub observes only its launcher. A process start or exit does not prove a session connected or disconnected. Unattended access is unsupported here and requires a separate deliberate choice in the native client."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "No connection is prepared when this page opens. The stronger page-scoped controls require Companion v19; check the client explicitly."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-5 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: approval ? "solid" : "default",
							children: approval ? "Awaiting your confirmation" : status?.launcherRunning ? "Native launcher active" : "Launch controls locked"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Connect to your computer" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: status?.installed ? "RustDesk portable client detected" : status ? "RustDesk client not installed" : "Check the local client before connecting" })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "list-decimal space-y-1 pl-5 text-xs leading-6 text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Check RustDesk on this computer." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Enter the ID shown on your remote computer." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Confirm this launch, then authenticate in RustDesk." })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block space-y-2 text-sm",
							children: ["RustDesk ID", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"aria-label": "RustDesk peer ID",
								inputMode: "numeric",
								maxLength: 20,
								disabled: busy,
								autoComplete: "off",
								spellCheck: false,
								value: peer,
								onChange: (e) => {
									setPeer(e.target.value.replace(/[\s-]/g, "").slice(0, 12));
									revokeApproval();
									setOwned(false);
								},
								placeholder: "9–12 digit ID"
							})]
						}),
						peer && !/^\d{9,12}$/.test(peer) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Use 9–12 digits. Spaces and hyphens from a pasted ID are removed."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								disabled: busy,
								checked: owned,
								onChange: (e) => {
									setOwned(e.target.checked);
									revokeApproval();
								}
							}), "I own this device or have permission to connect"]
						}),
						approval && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 rounded-lg border border-border bg-bg p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										"One-use approval · expires in ",
										seconds,
										"s"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block space-y-2 text-sm",
									children: [
										"Type CONNECT ",
										peer,
										" to approve this one launch",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											"aria-label": "Connection confirmation",
											value: confirmation,
											onChange: (e) => setConfirmation(e.target.value),
											autoComplete: "off",
											autoCapitalize: "characters",
											spellCheck: false
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									disabled: busy,
									onClick: revokeApproval,
									children: "Cancel approval"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-muted",
							children: "The one-use approval expires after at most 30 seconds and is bound to this page, site and device ID. Passwords, peer IDs and approval tokens are never saved by this page. RustDesk asks for authentication and controls the actual session permissions."
						}),
						status?.launcherRunning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-6 text-muted",
							children: "A tracked RustDesk launcher is active. Finish in its native window or request a stop. New preparations wait until launcher exit is observed; use Check RustDesk to refresh."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardFooter, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: busy,
							onClick: () => void act("check"),
							children: busy ? "Working…" : "Check RustDesk"
						}),
						!approval ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy || !owned || !/^\d{9,12}$/.test(peer) || !status?.installed || status.launcherRunning,
							onClick: () => void act("arm"),
							children: "Prepare connection"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy || seconds <= 0 || confirmation !== `CONNECT ${peer}`,
							onClick: () => void act("connect"),
							children: "Launch RustDesk connection"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "danger",
							disabled: busy,
							onClick: () => void act("lock"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), "Lock launch controls"]
						})
					] })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Access safeguards" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "list-disc space-y-2 pl-5 text-sm leading-6 text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Only explicit outbound connections to numeric RustDesk IDs." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No service installation, unattended password, auto-start, public web endpoint, file transfer or terminal launch." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The native client is launched with --no-server. Existing RustDesk installations and sessions are not reconfigured." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use interactive approval on the remote computer. Disable clipboard, file transfer and input there unless you need them." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Lock revokes new approvals and requests a stop for the tracked launcher. Close the native RustDesk session to guarantee disconnection; this page cannot verify a handed-off session." })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-muted",
							children: "Run Setup-Creative-Tools.cmd in the Companion folder to prepare the verified portable client, then restart Companion. Mobile browsers cannot launch a client on another computer through this loopback bridge."
						})] })] }),
						status?.launch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Latest native launch request" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg",
							children: status.launch.state
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: [
								"Request ",
								status.launch.id.slice(0, 8),
								" · ",
								new Date(status.launch.requestedAt).toLocaleTimeString(),
								" · session unverified. Stop requested stays pending until launcher exit is observed. Use Check RustDesk to refresh; this page does not poll."
							]
						})] })] }),
						status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Local launch activity" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: status.audit.length ? status.audit.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs leading-5 text-muted",
							children: [
								new Date(row.at).toLocaleTimeString(),
								" · ",
								row.event
							]
						}, `${row.at}-${i}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No remote launch actions in this Companion session."
						}) })] })
					]
				})]
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-4 break-words text-sm leading-6 text-muted",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 break-words text-sm leading-6 text-danger",
				children: error
			})
		]
	});
}
//#endregion
export { RemoteDesktopSection };
