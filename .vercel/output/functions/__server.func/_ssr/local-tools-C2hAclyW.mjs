import { d as companionFetch } from "./companion-DacueTBp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/local-tools-C2hAclyW.js
async function localTool(path, body, signal, keepalive = false) {
	let response;
	try {
		const timeout = AbortSignal.timeout(path.endsWith("/generate") ? 61e4 : path.includes("/models/transfers/") ? 18e4 : path.startsWith("/studio/models/") ? 2e4 : 6e3);
		response = await companionFetch(path, {
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
export { localTool };
