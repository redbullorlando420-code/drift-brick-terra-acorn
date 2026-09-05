import { t as createServerFn } from "./ssr.mjs";
import { n as createSsrRpc } from "./routes-5G0itYQD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-uXBZW8EY.js
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
function twitchLogin(input) {
	const raw = input.trim();
	try {
		return (new URL(raw.startsWith("http") ? raw : `https://twitch.tv/${raw}`).pathname.split("/").filter(Boolean)[0] ?? raw).replace(/^@/, "").toLowerCase();
	} catch {
		return raw.replace(/^@/, "").replace(/^tw:/, "").toLowerCase();
	}
}
var followRemote = createServerFn({ method: "POST" }).validator((data) => parseFollow(data)).handler(createSsrRpc("0c214d4b031988870bdc1c9a42a92ccbf9e9579cd8ab478f2d173e66fe73e2f0"));
var refreshRemotes = createServerFn({ method: "POST" }).validator((data) => parseRefresh(data)).handler(createSsrRpc("ac1a300259a0cb0e7b027567a01868e6019bb4d175aa2aacdf50dd329b558123"));
function parseImport(data) {
	if (typeof data !== "object" || data === null) return { items: [] };
	const rec = data;
	if (!Array.isArray(rec.items)) return { items: [] };
	const items = [];
	for (const raw of rec.items) {
		if (!raw || typeof raw !== "object") continue;
		const row = raw;
		const query = asString(row.query).trim();
		if (!query) continue;
		items.push({
			query,
			kind: row.kind === "twitch" ? "twitch" : "youtube"
		});
	}
	return { items: items.slice(0, 80) };
}
var importChannels = createServerFn({ method: "POST" }).validator((data) => parseImport(data)).handler(createSsrRpc("d7a9de260cc8839e45abd41f5c96ef881c8fdf9d186bdd087f29f6faeff9bd1d"));
function parseTwitchUser(data) {
	if (typeof data !== "object" || data === null) throw new Error("Enter your Twitch name");
	const login = twitchLogin(asString(data.login));
	if (!login) throw new Error("Enter your Twitch name");
	return { login };
}
var fetchTwitchFollowing = createServerFn({ method: "POST" }).validator((data) => parseTwitchUser(data)).handler(createSsrRpc("298e45714281c48abde137e2b56dd5a9336fcd5d739cb85235ad8f876afe9a48"));
//#endregion
export { fetchTwitchFollowing, followRemote, importChannels, refreshRemotes };
