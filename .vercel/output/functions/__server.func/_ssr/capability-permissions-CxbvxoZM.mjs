import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as companionFetch } from "./companion-DacueTBp.mjs";
import { Vt as Button, et as browserConsent, nt as serverPermissionSnapshot, tt as refreshBrowserConsent } from "./library-app-BzjSyqkW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/capability-permissions-CxbvxoZM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useBrowserPermission(scope) {
	const value = (0, import_react.useSyncExternalStore)(browserConsent.subscribe, browserConsent.snapshot, () => serverPermissionSnapshot);
	(0, import_react.useEffect)(refreshBrowserConsent, []);
	return value.scopes[scope].allowed && !value.error;
}
var labels = {
	"draft-composer": "Draft composers",
	"local-vision": "Local image analysis"
};
var descriptions = {
	"draft-composer": "Allows opening a prepared Stream Signal draft in an external composer. Copy/export and manual sharing receipts are separate. This never publishes a post.",
	"local-vision": "Allows optional browser model downloads and selected-image inference on this device. Photo bytes stay local. Revocation discards pending results. An in-flight model download or inference may finish; already cached model files are retained."
};
function BrowserPermissionControl({ scope }) {
	const allowed = useBrowserPermission(scope), value = (0, import_react.useSyncExternalStore)(browserConsent.subscribe, browserConsent.snapshot, () => serverPermissionSnapshot), [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border p-4",
		"data-browser-permission": scope,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-start justify-between gap-3 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 w-full flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium text-fg",
						children: labels[scope]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: descriptions[scope]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-accent",
						children: allowed ? "Allowed in this browser" : "Not allowed in this browser"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				className: "min-h-11 max-w-full shrink-0 whitespace-normal",
				onClick: () => {
					try {
						browserConsent.change(scope, !allowed);
						setError("");
					} catch (cause) {
						setError(cause.message);
					}
				},
				children: [
					allowed ? "Revoke" : "Allow",
					" ",
					labels[scope].toLowerCase()
				]
			})]
		}), (error || value.error) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "mt-2 text-xs text-danger",
			children: error || value.error
		})]
	});
}
async function readNativePermissions() {
	const response = await companionFetch("/permissions"), value = await response.json();
	if (!response.ok || !value.ok) throw Error(value.error || "Permission status unavailable.");
	if (value.version !== 1 || !Number.isSafeInteger(value.revision) || ["model-transfers", "provider-session"].some((id) => typeof value.scopes?.[id]?.allowed !== "boolean" || !Number.isSafeInteger(value.scopes[id].generation))) throw Error("Permission status is unreadable; optional access remains unverified.");
	return value;
}
var nativeLabels = {
	"model-transfers": "Model transfers",
	"provider-session": "Browser-session access"
};
var nativeDescriptions = {
	"model-transfers": "Allows explicitly requested model weight downloads/imports on this computer. Revocation cancels pending transfers and prevents publication. Installed models, prompts and recipes remain. Engine setup is a separate explicit operation.",
	"provider-session": "Allows the local downloader to read the selected browser session only when you also select Use my signed-in browser for an individual download. Revocation stops affected queued/running jobs; partial files and ordinary downloads remain."
};
function NativePermissionControl({ scope, autoload = false }) {
	const [state, setState] = (0, import_react.useState)(null), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	const check = async () => {
		setBusy(true);
		setError("");
		try {
			setState(await readNativePermissions());
		} catch (cause) {
			setError(cause.message);
		} finally {
			setBusy(false);
		}
	};
	(0, import_react.useEffect)(() => {
		if (autoload) check();
	}, [autoload]);
	const allowed = !!state?.scopes?.[scope]?.allowed, pending = state?.pendingRevocations?.includes(scope);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border p-4",
		"data-native-permission": scope,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium text-fg",
				children: nativeLabels[scope]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: nativeDescriptions[scope]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-accent",
				children: state ? allowed ? "Allowed on this Companion" : "Not allowed on this Companion" : "Not checked · Companion v18 required"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: busy,
					onClick: () => void check(),
					children: busy ? "Checking…" : "Check " + nativeLabels[scope].toLowerCase()
				}), state && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "min-h-11",
					variant: allowed ? "secondary" : "default",
					disabled: busy || !!state.error && !allowed,
					onClick: () => {
						setBusy(true);
						setError("");
						(async () => {
							try {
								const response = await companionFetch("/permissions/change", {
									method: "POST",
									body: JSON.stringify({
										scope,
										revision: state.revision,
										allowed: pending ? false : !allowed
									})
								}), next = await response.json();
								if (!response.ok || !next.ok) throw Error(next.error || "Permission change failed.");
								setState(next);
							} catch (cause) {
								setError(cause.message);
								try {
									setState(await readNativePermissions());
								} catch {
									setState(null);
								}
							} finally {
								setBusy(false);
							}
						})();
					},
					children: [
						pending ? "Retry revocation of" : allowed ? "Revoke" : "Allow",
						" ",
						nativeLabels[scope].toLowerCase()
					]
				})]
			}),
			(error || state?.error) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-xs text-danger",
				children: error || state?.error
			})
		]
	});
}
function CapabilityPermissions() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Optional integration permissions",
		className: "my-5 space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl text-fg",
				children: "Optional permissions"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "A permission allows a specific action; it does not connect an account, install a tool or prove readiness. Browser choices apply to this browser profile. Companion choices apply to this computer and all its approved app origins. Folder grants remain in Companion folder access below."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativePermissionControl, { scope: "model-transfers" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativePermissionControl, { scope: "provider-session" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserPermissionControl, { scope: "local-vision" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserPermissionControl, { scope: "draft-composer" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "Remote AI assistance and automatic publishing are unconfigured and have no grant. AI guide uses existing title/tag matches locally. RustDesk pairing stays in its native client. Revocation cannot retract bytes already downloaded or posted, close an external composer, or erase cached models. No credentials or content are stored in this ledger."
			})
		]
	});
}
//#endregion
export { CapabilityPermissions as n, NativePermissionControl as r, BrowserPermissionControl as t };
