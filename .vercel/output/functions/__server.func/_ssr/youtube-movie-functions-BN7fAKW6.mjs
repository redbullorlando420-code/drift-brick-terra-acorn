import { n as createServerFn } from "./ssr.mjs";
import { a as parseYoutubeMovies, r as movieRequest } from "./youtube-movies-DqLPJL7A.mjs";
import { r as createServerRpc } from "./youtube-transport-DftBCfsW.mjs";
import { c as youtubePublicRequest, t as YOUTUBE_WEB_VERSION } from "./youtube-browse-BdttBv7Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-movie-functions-BN7fAKW6.js
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
var handles = /* @__PURE__ */ new Map();
var scope = (r) => JSON.stringify([
	r.mode,
	r.region,
	r.query
]);
function handle(r, target) {
	const key = crypto.randomUUID();
	handles.set(key, {
		scope: scope(r),
		target,
		expires: Date.now() + 9e5
	});
	while (handles.size > 256) handles.delete(handles.keys().next().value);
	return key;
}
/** No polling, cookies, purchases, player extraction, or arbitrary provider URLs. */
var discoverYoutubeMovies_createServerFn_handler = createServerRpc({
	id: "2d8f4a0b2d8e808b23582a1eb0a5d90d044feab4c6c7e5730dec8887b651891b",
	name: "discoverYoutubeMovies",
	filename: "src/lib/remote/youtube-movie-functions.ts"
}, (opts) => discoverYoutubeMovies.__executeServer(opts));
var discoverYoutubeMovies = createServerFn({ method: "POST" }).validator(movieRequest).handler(discoverYoutubeMovies_createServerFn_handler, async ({ data }) => {
	const key = JSON.stringify(data), now = Date.now();
	for (const [id, value] of handles) if (value.expires <= now) handles.delete(id);
	const hit = cache.get(key);
	if (hit && hit.expires > now) return hit.page;
	if (pending.has(key)) return pending.get(key);
	if (pending.size >= 4) throw Error("Movie discovery is busy. Wait a moment and retry.");
	let target = data.mode === "search" ? {
		query: data.query,
		params: "EgIQBA%3D%3D"
	} : { browseId: "FEstorefront" };
	if (data.page) {
		const saved = handles.get(data.page);
		if (!saved || saved.scope !== scope(data)) throw Error("This movie page expired. Load the catalog or search again.");
		target = saved.target;
	}
	const task = (async () => {
		const raw = await youtubePublicRequest(data.mode === "search" ? "search" : "browse", {
			...target,
			context: { client: {
				clientName: "WEB",
				clientVersion: YOUTUBE_WEB_VERSION,
				hl: "en",
				gl: data.region
			} }
		});
		const parsed = parseYoutubeMovies(raw, data.region);
		const page = {
			movies: parsed.movies,
			observedAt: parsed.observedAt,
			next: parsed.continuation ? handle(data, { continuation: parsed.continuation }) : null,
			shelves: parsed.shelves.map((s) => ({
				title: s.title,
				page: handle(data, {
					browseId: "FEstorefront",
					params: s.params
				})
			}))
		};
		cache.delete(key);
		cache.set(key, {
			page,
			expires: Date.now() + 3e5
		});
		while (cache.size > 24) cache.delete(cache.keys().next().value);
		return page;
	})().finally(() => pending.delete(key));
	pending.set(key, task);
	return task;
});
//#endregion
export { discoverYoutubeMovies_createServerFn_handler };
