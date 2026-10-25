import { n as createServerFn } from "./ssr.mjs";
import { r as createServerRpc } from "./youtube-transport-ClGDYatb.mjs";
import { s as youtubePublicRequest } from "./youtube-browse-ClLVmFVe.mjs";
import { n as roomYoutubeSearchInput, t as parseRoomYoutubeSearch } from "./room-youtube-search-elKa7As4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/room-search-functions-BE24wBGi.js
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
var searchRoomYoutube_createServerFn_handler = createServerRpc({
	id: "a9fbf7ab77502dc25415c97d05cc253be8ce3aab9920444d607b7989b3abcd3a",
	name: "searchRoomYoutube",
	filename: "src/lib/remote/room-search-functions.ts"
}, (opts) => searchRoomYoutube.__executeServer(opts));
var searchRoomYoutube = createServerFn({ method: "POST" }).validator(roomYoutubeSearchInput).handler(searchRoomYoutube_createServerFn_handler, async ({ data }) => {
	const key = JSON.stringify([data.query, data.cursor ?? ""]);
	const hit = cache.get(key);
	if (hit && hit.expires > Date.now()) return hit.page;
	const existing = pending.get(key);
	if (existing) return existing;
	if (pending.size >= 8) throw Error("Search is busy. Wait a moment and try again.");
	const task = (async () => {
		const response = await youtubePublicRequest("search", data.cursor ? { continuation: data.cursor } : {
			query: data.query,
			params: "EgIQAQ%3D%3D"
		});
		const page = parseRoomYoutubeSearch(response);
		cache.delete(key);
		cache.set(key, {
			page,
			expires: Date.now() + 12e4
		});
		while (cache.size > 24) cache.delete(cache.keys().next().value);
		return page;
	})().finally(() => pending.delete(key));
	pending.set(key, task);
	return task;
});
//#endregion
export { searchRoomYoutube_createServerFn_handler };
