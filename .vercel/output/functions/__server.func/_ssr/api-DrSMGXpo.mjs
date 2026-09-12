import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { c as ADULT_PULL_PROVIDERS, m as LIBRARY_LIMITS } from "./library-limits-D-UjAuZX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DrSMGXpo.js
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
/** Share identical work across browser tabs and suppress only background retries. */
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
	return { channels: (Array.isArray(rec.channels) ? rec.channels : []).slice(0, 80) };
}
function twitchLogin(input) {
	const raw = input.trim().replaceAll("\\_", "_").replace(/^["'([{<]+|["')\]}>.;:]+$/g, "");
	try {
		return (new URL(raw.startsWith("http") ? raw : `https://twitch.tv/${raw}`).pathname.split("/").filter(Boolean)[0] ?? raw).replace(/^@/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
	} catch {
		return raw.replace(/^@/, "").replace(/^tw:/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
	}
}
/**
* Twitch exposes archives as a cursor connection. Reading only its first page
* made a busy creator look as though they had about 160 VODs, and a later
* focused refresh then overwrote the locally retained history with that page.
* Deep reads are reserved for a user-initiated channel pull; rotating live
* refreshes intentionally keep their small first-page window.
*/
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
var EPORNER_ORDERS = /* @__PURE__ */ new Set([
	"latest",
	"longest",
	"shortest",
	"top-rated",
	"most-popular",
	"top-weekly",
	"top-monthly"
]);
function parseAdultProviders(raw) {
	const known = new Set(ADULT_PULL_PROVIDERS);
	if (raw === "all" || raw == null) return [...ADULT_PULL_PROVIDERS];
	if (Array.isArray(raw)) {
		const out = raw.filter((p) => typeof p === "string" && known.has(p));
		return out.length ? [...new Set(out)] : [...ADULT_PULL_PROVIDERS];
	}
	if (typeof raw === "string" && known.has(raw)) return [raw];
	return [...ADULT_PULL_PROVIDERS];
}
function parseProviderPages(raw) {
	if (!raw || typeof raw !== "object") return {};
	const known = new Set(ADULT_PULL_PROVIDERS);
	const out = {};
	for (const [key, value] of Object.entries(raw)) {
		if (!known.has(key)) continue;
		const n = typeof value === "number" ? value : Number(value);
		if (!Number.isFinite(n) || n < 1) continue;
		out[key] = Math.min(Math.floor(n), 1e5);
	}
	return out;
}
function parseRedditSources(raw) {
	if (!Array.isArray(raw)) return [];
	const unique = /* @__PURE__ */ new Map();
	for (const value of raw.slice(0, 120)) {
		const row = asRecord(value);
		const subreddit = asString(row?.subreddit).trim().replace(/^r\//i, "");
		if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) continue;
		const rawPriority = Number(row?.priority);
		const priority = rawPriority >= 3 ? 3 : rawPriority <= 1 ? 1 : 2;
		unique.set(subreddit.toLowerCase(), {
			subreddit,
			priority
		});
	}
	return [...unique.values()];
}
function parseAdultSearch(data) {
	const rec = typeof data === "object" && data !== null ? data : {};
	const query = asString(rec.query).trim() || "all";
	const orderRaw = asString(rec.order).trim() || "top-weekly";
	const order = EPORNER_ORDERS.has(orderRaw) ? orderRaw : "top-weekly";
	const pageNum = typeof rec.page === "number" ? rec.page : Number(rec.page);
	const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.min(Math.floor(pageNum), 1e5) : 1;
	const maxRaw = typeof rec.maxVideos === "number" ? rec.maxVideos : Number(rec.maxVideos);
	const maxVideos = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.min(Math.floor(maxRaw), LIBRARY_LIMITS.epornerVideosPerPull) : LIBRARY_LIMITS.epornerVideosPerPull;
	const append = Boolean(rec.append);
	return {
		query: query.slice(0, 80),
		order,
		page,
		maxVideos,
		append,
		providers: parseAdultProviders(rec.providers),
		providerPages: parseProviderPages(rec.providerPages),
		redditSources: parseRedditSources(rec.redditSources)
	};
}
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
/** A mixed foreground pull should return its healthy providers promptly. A
* slow public feed is reported as partial work instead of freezing the whole
* Adults screen behind its retry window. */
var searchAdultVideos = createServerFn({ method: "POST" }).validator((data) => parseAdultSearch(data)).handler(createSsrRpc("b67bda5afb0e1fb905845cee088441086d5bba37e933c8edb45ef4d6c5182360"));
var fetchAdultComments = createServerFn({ method: "POST" }).validator((data) => {
	const rec = typeof data === "object" && data !== null ? data : {};
	return {
		kind: asString(rec.kind).trim(),
		videoId: asString(rec.videoId).trim(),
		watchUrl: asString(rec.watchUrl).trim()
	};
}).handler(createSsrRpc("c94242a255b5578005d0637a8c72789ab5d9dbe21861256590a340456a1ea9f6"));
var searchRedtubeStars = createServerFn({ method: "POST" }).validator((data) => {
	const rec = typeof data === "object" && data !== null ? data : {};
	const page = Number(rec.page);
	return {
		query: asString(rec.query).trim(),
		page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
	};
}).handler(createSsrRpc("49eff4fc659c625b4ff6b2ae76ba10b0db89905b9626afe89893193d4d2e7884"));
//#endregion
export { fetchAdultComments, fetchTwitchFollowing, followRemote, importChannels, refreshRemotes, searchAdultVideos, searchRedtubeStars };
