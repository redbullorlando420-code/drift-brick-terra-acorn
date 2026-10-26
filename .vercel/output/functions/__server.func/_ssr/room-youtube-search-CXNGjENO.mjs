import { f as youtubeRendererMetadata } from "./youtube-metadata-BN08kKrN.mjs";
import { r as youtubeVideoRenderers } from "./youtube-page-data-CoxyTRWJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/room-youtube-search-CXNGjENO.js
var text = (value) => (value?.simpleText ?? value?.runs?.map((row) => row.text ?? "").join("") ?? "").slice(0, 500);
function roomYoutubeSearchInput(value) {
	const data = value;
	if (!data || typeof data.query !== "string" || !data.query.trim() || data.query.length > 160) throw Error("Enter a search of 1–160 characters.");
	if (data.cursor !== void 0 && (typeof data.cursor !== "string" || !data.cursor || data.cursor.length > 12e3 || /[\u0000-\u001f]/.test(data.cursor))) throw Error("This search page has expired. Start a new search.");
	return {
		query: data.query.trim(),
		cursor: data.cursor
	};
}
/** Restrict extraction to the primary search results, excluding sidebars,
* ads and unrelated channel/watch-page continuation tokens. */
function parseRoomYoutubeSearch(root) {
	const data = root;
	const primary = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
	const commands = [
		...data?.onResponseReceivedCommands ?? [],
		...data?.onResponseReceivedActions ?? [],
		...data?.onResponseReceivedEndpoints ?? []
	];
	const items = Array.isArray(primary) ? primary : commands.find((row) => Array.isArray(row?.appendContinuationItemsAction?.continuationItems))?.appendContinuationItemsAction?.continuationItems;
	if (!Array.isArray(items)) throw Error("YouTube did not return readable search results. Try again later or paste a video link.");
	const boundary = [], stack = [...items].reverse();
	let visited = 0, cursor;
	while (stack.length && ++visited < 1e4) {
		const node = stack.pop();
		if (!node || typeof node !== "object") continue;
		if (Array.isArray(node)) {
			stack.push(...[...node].reverse());
			continue;
		}
		const row = node;
		if (row.adSlotRenderer || row.promotedSparklesWebRenderer || row.promotedVideoRenderer) continue;
		if (row.videoRenderer || row.gridVideoRenderer || row.reelItemRenderer || row.lockupViewModel || row.shortsLockupViewModel) {
			boundary.push(row);
			continue;
		}
		const token = row.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
		if (typeof token === "string" && token.length <= 12e3) cursor = token;
		for (const value of Object.values(row).reverse()) if (value && typeof value === "object") stack.push(value);
	}
	return {
		videos: youtubeVideoRenderers(boundary, 60).flatMap((renderer) => {
			const row = renderer, id = row.videoId;
			if (typeof id !== "string" || !/^[\w-]{11}$/.test(id)) return [];
			const metadata = youtubeRendererMetadata(renderer), published = metadata.published;
			const durationText = text(row.lengthText), parts = durationText.split(":").map(Number);
			const duration = /^\d{1,3}:\d{2}(?::\d{2})?$/.test(durationText) ? parts.reduce((sum, part) => sum * 60 + part, 0) : void 0;
			const viewText = text(row.viewCountText), count = /^[\d,\s]+ views?$/.test(viewText) ? Number(viewText.replace(/\D/g, "")) : void 0;
			const description = text(row.descriptionSnippet) || text(row.detailedMetadataSnippets?.[0]?.snippetText);
			return [{
				id: `room:youtube:${id}`,
				folderId: "room:youtube",
				path: id,
				name: text(row.title) || `YouTube · ${id}`,
				extension: "yt",
				mime: "video/youtube",
				size: 0,
				addedAt: published ? Date.parse(published) : 0,
				duration: metadata.youtubeType === "live" ? void 0 : duration,
				description: description.slice(0, 280),
				poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				remote: {
					kind: "youtube",
					videoId: id,
					channelName: text(row.ownerText) || text(row.longBylineText) || text(row.shortBylineText),
					live: metadata.youtubeType === "live",
					youtubeType: metadata.youtubeType,
					publishedDate: published,
					publishedSource: published ? "provider" : "unknown",
					publishedLabel: text(row.publishedTimeText).slice(0, 90),
					views: Number.isSafeInteger(count) ? count : void 0,
					watchUrl: `https://www.youtube.com/watch?v=${id}`,
					embedUrl: `https://www.youtube.com/embed/${id}`
				}
			}];
		}),
		cursor
	};
}
//#endregion
export { roomYoutubeSearchInput as n, parseRoomYoutubeSearch as t };
