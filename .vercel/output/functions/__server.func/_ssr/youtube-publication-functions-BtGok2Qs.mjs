import { t as exactYoutubePublished } from "./youtube-metadata-Cxzyxaug.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { o as fetchYoutubeResponse, r as createServerRpc } from "./youtube-transport-ClGDYatb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-publication-functions-BtGok2Qs.js
/** Read only the selected video's player metadata, never a recommendation date. */
function youtubeWatchPublication(html, videoId) {
	const marker = /(?:var\s+ytInitialPlayerResponse\s*=|ytInitialPlayerResponse\s*=)\s*/g;
	if (marker.exec(html)) {
		const start = marker.lastIndex;
		let depth = 0, quoted = false, escaped = false;
		for (let i = start; i < html.length; i++) {
			const c = html[i];
			if (quoted) {
				if (escaped) escaped = false;
				else if (c === "\\") escaped = true;
				else if (c === "\"") quoted = false;
			} else if (c === "\"") quoted = true;
			else if (c === "{") depth++;
			else if (c === "}" && --depth === 0) try {
				const data = JSON.parse(html.slice(start, i + 1));
				if (data.videoDetails?.videoId !== videoId || data.videoDetails?.isLive === true || data.videoDetails?.isUpcoming === true) return;
				const micro = data.microformat?.playerMicroformatRenderer;
				if (micro?.liveBroadcastDetails?.isLiveNow === true) return;
				return exactYoutubePublished(micro?.publishDate) ?? exactYoutubePublished(micro?.uploadDate);
			} catch {
				break;
			}
		}
	}
	if (!html.includes(`watch?v=${videoId}`)) return;
	for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
		if (!/itemprop\s*=\s*["']datePublished["']/i.test(tag)) continue;
		return exactYoutubePublished(tag.match(/content\s*=\s*["']([^"']+)["']/i)?.[1]);
	}
}
/** Parse one bounded, identity-checked player response. Recommendations and
* consent/error pages must never contribute another video's tags. */
function youtubeWatchMetadata(html, id) {
	if (!/^[\w-]{11}$/.test(id)) return;
	const marker = /(?:var\s+ytInitialPlayerResponse\s*=|window\[\s*["']ytInitialPlayerResponse["']\s*\]\s*=|ytInitialPlayerResponse\s*=)\s*/g;
	if (!marker.exec(html)) return;
	const start = marker.lastIndex;
	if (html[start] !== "{") return;
	let depth = 0, quoted = false, escaped = false;
	for (let i = start; i < Math.min(html.length, start + 2e6); i++) {
		const c = html[i];
		if (quoted) {
			if (escaped) escaped = false;
			else if (c === "\\") escaped = true;
			else if (c === "\"") quoted = false;
		} else if (c === "\"") quoted = true;
		else if (c === "{") depth++;
		else if (c === "}" && --depth === 0) try {
			const data = JSON.parse(html.slice(start, i + 1)), details = data.videoDetails;
			if (details?.videoId !== id || data.playabilityStatus?.status && data.playabilityStatus.status !== "OK") return;
			const micro = data.microformat?.playerMicroformatRenderer;
			const live = details.isLive === true || details.isUpcoming === true || micro?.liveBroadcastDetails?.isLiveNow === true;
			const keywords = Array.isArray(details.keywords) ? [...new Set(details.keywords.slice(0, 80).filter((word) => typeof word === "string").map((word) => word.normalize("NFKC").trim().slice(0, 80)).filter(Boolean))].slice(0, 40) : void 0;
			const description = typeof details.shortDescription === "string" ? details.shortDescription.slice(0, 16e3) : void 0;
			return {
				id,
				...description !== void 0 ? { description } : {},
				...keywords ? { keywords } : {},
				...!live && Number.isFinite(Number(details.lengthSeconds)) && Number(details.lengthSeconds) > 0 && Number(details.lengthSeconds) <= 31536e3 ? { duration: Number(details.lengthSeconds) } : {},
				...!live ? { date: exactYoutubePublished(micro?.publishDate) ?? exactYoutubePublished(micro?.uploadDate) } : {}
			};
		} catch {
			return;
		}
	}
}
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
async function read(id) {
	const cached = cache.get(id);
	if (cached && cached.expires > Date.now()) return cached.metadata;
	if (pending.has(id)) return pending.get(id);
	const task = (async () => {
		const response = await fetchYoutubeResponse(`https://www.youtube.com/watch?v=${id}`, { timeoutMs: 12e3 });
		if (!response.ok) throw new Error(`YouTube returned HTTP ${response.status}.`);
		const html = await response.text();
		const metadata = youtubeWatchMetadata(html, id) ?? (youtubeWatchPublication(html, id) ? {
			id,
			date: youtubeWatchPublication(html, id)
		} : void 0);
		const hasDetails = metadata?.description !== void 0 || metadata?.keywords !== void 0 || metadata?.duration !== void 0;
		cache.delete(id);
		cache.set(id, {
			metadata,
			expires: Date.now() + (hasDetails ? 216e5 : 3e5)
		});
		while (cache.size > 256) cache.delete(cache.keys().next().value);
		return metadata;
	})().finally(() => pending.delete(id));
	pending.set(id, task);
	return task;
}
var fetchYoutubePublication_createServerFn_handler = createServerRpc({
	id: "794a0745916e73a363fe4200a3ba342c12d8591cdc35e8b3c97b1989462159bc",
	name: "fetchYoutubePublication",
	filename: "src/lib/remote/youtube-publication-functions.ts"
}, (opts) => fetchYoutubePublication.__executeServer(opts));
var fetchYoutubePublication = createServerFn({ method: "POST" }).validator((data) => {
	const ids = data?.ids;
	if (!Array.isArray(ids) || ids.length > 5 || ids.some((id) => typeof id !== "string" || !/^[\w-]{11}$/.test(id))) throw new Error("Choose one to five YouTube videos.");
	return [...new Set(ids)];
}).handler(fetchYoutubePublication_createServerFn_handler, async ({ data }) => {
	const results = [];
	for (const id of data) try {
		results.push({
			id,
			date: (await read(id))?.date
		});
	} catch (cause) {
		results.push({
			id,
			error: cause instanceof Error ? cause.message : "YouTube date unavailable."
		});
		break;
	}
	return results;
});
var fetchYoutubeVideoMetadata_createServerFn_handler = createServerRpc({
	id: "b4c3b85db5cb6ccf616bd8c074fb3cb74c74d76727d2e997c86a1c0ee28e28d2",
	name: "fetchYoutubeVideoMetadata",
	filename: "src/lib/remote/youtube-publication-functions.ts"
}, (opts) => fetchYoutubeVideoMetadata.__executeServer(opts));
var fetchYoutubeVideoMetadata = createServerFn({ method: "POST" }).validator((data) => {
	const id = data?.id;
	if (typeof id !== "string" || !/^[\w-]{11}$/.test(id)) throw new Error("Choose a valid YouTube video.");
	return id;
}).handler(fetchYoutubeVideoMetadata_createServerFn_handler, async ({ data }) => {
	const metadata = await read(data);
	if (!metadata || metadata.description === void 0 && metadata.keywords === void 0 && metadata.duration === void 0) throw new Error("YouTube did not expose a runtime, tags or a description. Saved metadata was kept. Sign-in, age restrictions or a consent page can prevent public metadata access.");
	return metadata;
});
//#endregion
export { fetchYoutubePublication_createServerFn_handler, fetchYoutubeVideoMetadata_createServerFn_handler };
