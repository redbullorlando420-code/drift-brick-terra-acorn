import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CaddXIm6.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asString(v) {
	return typeof v === "string" ? v : "";
}
function parseFollow(data) {
	if (typeof data !== "object" || data === null) throw new Error("Enter a channel or URL");
	const rec = data;
	const query = asString(rec.query).trim();
	if (!query) throw new Error("Enter a channel or URL");
	return {
		query,
		kind: rec.kind === "youtube" || rec.kind === "twitch" ? rec.kind : "auto"
	};
}
function parseRefresh(data) {
	if (typeof data !== "object" || data === null) return { channels: [] };
	const rec = data;
	return { channels: (Array.isArray(rec.channels) ? rec.channels : []).slice(0, 24) };
}
var followRemote = createServerFn({ method: "POST" }).validator((data) => parseFollow(data)).handler(createSsrRpc("0c214d4b031988870bdc1c9a42a92ccbf9e9579cd8ab478f2d173e66fe73e2f0"));
var refreshRemotes = createServerFn({ method: "POST" }).validator((data) => parseRefresh(data)).handler(createSsrRpc("ac1a300259a0cb0e7b027567a01868e6019bb4d175aa2aacdf50dd329b558123"));
//#endregion
export { followRemote, refreshRemotes };
