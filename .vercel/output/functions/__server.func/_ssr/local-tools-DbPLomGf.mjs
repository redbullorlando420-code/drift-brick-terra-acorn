import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-Cq6DDHIb.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as COMPANION_ORIGIN } from "./companion-C8xPNDAD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/local-tools-DbPLomGf.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-elevated text-muted shadow-border",
		solid: "bg-accent text-accent-fg"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
async function localTool(path, body, signal, keepalive = false) {
	let response;
	try {
		const timeout = AbortSignal.timeout(path.endsWith("/generate") ? 61e4 : path.startsWith("/studio/models/") ? 2e4 : 6e3);
		response = await fetch(`${COMPANION_ORIGIN}${path}`, {
			method: body ? "POST" : "GET",
			headers: body ? { "content-type": "application/json" } : {},
			body: body ? JSON.stringify(body) : void 0,
			signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
			keepalive
		});
	} catch (cause) {
		if (signal?.aborted) throw Object.assign(/* @__PURE__ */ new Error("Request cancelled. Use the engine interrupt control to stop any generation still running."), { outcome: "unknown" });
		if (cause instanceof Error && cause.name === "TimeoutError") throw Object.assign(/* @__PURE__ */ new Error("The local tool took too long to respond. Check its status before retrying."), { outcome: "unknown" });
		throw Object.assign(/* @__PURE__ */ new Error("Realhub Companion is unavailable on this computer. Start Companion, then check again."), { outcome: "unknown" });
	}
	const data = await response.json().catch(() => {
		throw Object.assign(/* @__PURE__ */ new Error("Companion returned an unreadable response. Check that it is up to date."), { outcome: "unknown" });
	});
	if (!response.ok || !data.ok) throw new Error(data.error || "Local tool request failed.");
	return data;
}
//#endregion
export { localTool as n, Badge as t };
