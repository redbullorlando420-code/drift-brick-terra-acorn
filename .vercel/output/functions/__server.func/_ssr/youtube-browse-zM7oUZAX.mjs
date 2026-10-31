import { l as readProviderJson } from "./provider-json-CjRAnOrq.mjs";
import { r as validateYoutubeItems, t as LIBRARY_LIMITS } from "./youtube-contract-DMSANo43.mjs";
import { i as youtubeVideoRenderers } from "./youtube-page-data-BJBSVcir.mjs";
import { o as fetchYoutubeResponse, t as YoutubeRequestError } from "./youtube-transport-CIU2khFM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-browse-zM7oUZAX.js
/** The active Videos grid is the only safe source of archive continuations.
* Channel headers, descriptions and sort chips carry unrelated tokens. */
function youtubeCatalogItems(root) {
	if (!root || typeof root !== "object") return null;
	const page = root;
	const tabs = page.contents?.twoColumnBrowseResultsRenderer?.tabs ?? [];
	const hasGrid = (tab) => Array.isArray(tab.tabRenderer?.content?.richGridRenderer?.contents);
	const selected = tabs.find((tab) => tab.tabRenderer?.selected && hasGrid(tab));
	if (selected) return selected.tabRenderer.content.richGridRenderer.contents;
	const videosTab = tabs.find((tab) => tab.tabRenderer?.title?.trim().toLowerCase() === "videos" && hasGrid(tab));
	if (videosTab) return videosTab.tabRenderer.content.richGridRenderer.contents;
	const populatedTabs = tabs.filter(hasGrid);
	if (populatedTabs.length === 1) return populatedTabs[0].tabRenderer.content.richGridRenderer.contents;
	const selectedContent = tabs.find((tab) => tab.tabRenderer?.selected)?.tabRenderer?.content;
	const stack = [selectedContent, root.contents?.singleColumnBrowseResultsRenderer?.tabs?.find((tab) => tab.tabRenderer?.selected)?.tabRenderer?.content];
	while (stack.length) {
		const node = stack.pop();
		if (!node || typeof node !== "object") continue;
		const record = node;
		for (const name of ["playlistVideoListRenderer", "gridRenderer"]) {
			const items = record[name]?.contents ?? record[name]?.items;
			if (Array.isArray(items)) return items;
		}
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	if (root.metadata?.playlistMetadataRenderer) {
		const sections = selectedContent?.sectionListRenderer?.contents;
		if (Array.isArray(sections)) return sections.flatMap((section) => section.itemSectionRenderer?.contents ?? [section]);
	}
	for (const name of [
		"playlistVideoListContinuation",
		"gridContinuation",
		"richGridContinuation"
	]) {
		const continuation = root.continuationContents?.[name];
		if (!continuation) continue;
		const items = continuation.contents ?? continuation.items;
		if (Array.isArray(items)) return [...items, ...continuation.continuations ?? []];
	}
	for (const action of [...page.onResponseReceivedActions ?? [], ...page.onResponseReceivedEndpoints ?? []]) {
		const items = action.appendContinuationItemsAction?.continuationItems ?? action.reloadContinuationItemsCommand?.continuationItems;
		if (Array.isArray(items)) return items;
	}
	return null;
}
function youtubeCatalogContinuation(root) {
	const items = youtubeCatalogItems(root);
	if (!items) return null;
	for (let index = items.length - 1; index >= 0; index -= 1) {
		const stack = [items[index]];
		while (stack.length) {
			const current = stack.pop();
			if (!current || typeof current !== "object") continue;
			if (Array.isArray(current)) {
				for (let item = current.length - 1; item >= 0; item -= 1) stack.push(current[item]);
				continue;
			}
			const record = current;
			const command = record.continuationCommand;
			if (command && typeof command === "object" && typeof command.token === "string") return command.token;
			for (const key of [
				"nextContinuationData",
				"reloadContinuationData",
				"continuationData"
			]) {
				const data = record[key];
				if (data && typeof data === "object" && typeof data.continuation === "string") return data.continuation;
			}
			for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
		}
	}
	return null;
}
/** Only call an archive exhausted when a recognized Videos grid is terminal. */
function youtubeCatalogHasTerminalPage(root) {
	const items = youtubeCatalogItems(root);
	if (items === null) return false;
	validateYoutubeItems(items);
	return youtubeCatalogContinuation(root) === null;
}
var YOUTUBE_WEB_VERSION = "2.20260623.01.00";
var youtubePlaylistBrowseId = (playlistId) => playlistId.startsWith("VL") ? playlistId : `VL${playlistId}`;
async function youtubePublicRequest(endpoint, target, manualRetry, live = false) {
	const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/${endpoint}?prettyPrint=false&alt=json`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"x-youtube-client-name": "1",
			"x-youtube-client-version": YOUTUBE_WEB_VERSION
		},
		body: JSON.stringify({
			context: { client: {
				clientName: "WEB",
				clientVersion: YOUTUBE_WEB_VERSION,
				hl: "en",
				gl: "US"
			} },
			...target
		}),
		timeoutMs: live ? 8e3 : 15e3,
		manualRetry,
		...live ? { scope: "live" } : {}
	});
	return readProviderJson(response, "youtube");
}
var browseYoutubeCatalog = (target, manualRetry, live = false) => youtubePublicRequest("browse", target, manualRetry, live);
/** Read complete provider pages, retaining the unconsumed token on every
* failure. Resumed pulls start with the saved token, without fetching HTML,
* RSS or the first hundred uploads again. */
async function youtubeBrowseArchive(playlistId, limit, resumeCursor, manualRetry, options) {
	const browseId = youtubePlaylistBrowseId(playlistId);
	const rows = [], seen = /* @__PURE__ */ new Set(), visited = /* @__PURE__ */ new Set();
	let cursor = resumeCursor ?? null, completed = false, reset = false, author, title;
	const deadline = Date.now() + (limit <= 100 ? 3e4 : 12e4);
	const budget = Math.min(options?.maxPages ?? Infinity, LIBRARY_LIMITS.youtubeArchivePagesPerPull, Math.max(2, Math.ceil(limit / 30) + 2));
	for (let page = 0; page < budget && rows.length < limit; page++) {
		if (Date.now() >= deadline || cursor && visited.has(cursor)) break;
		const requesting = cursor;
		try {
			const root = await browseYoutubeCatalog(cursor ? { continuation: cursor } : { browseId }, manualRetry);
			title ??= root?.metadata?.playlistMetadataRenderer?.title;
			const items = youtubeCatalogItems(root);
			if (!items) {
				const alert = root?.alerts?.find((row) => row.alertRenderer?.type === "ERROR")?.alertRenderer;
				if (alert) throw new Error(`YouTube catalog unavailable: ${alert.text?.simpleText ?? alert.text?.runs?.map((run) => run.text ?? "").join("") ?? "No public uploads."}`);
				if (!rows.length) return null;
				throw new Error("YouTube returned an unreadable catalog page; the archive position was preserved.");
			}
			validateYoutubeItems(items);
			const pageRows = youtubeVideoRenderers(items, 500);
			for (const row of pageRows) if (row.videoId && !seen.has(row.videoId)) {
				seen.add(row.videoId);
				rows.push(row);
			}
			if (!author) {
				const byline = pageRows[0]?.shortBylineText;
				author = byline?.simpleText ?? byline?.runs?.map((run) => run.text ?? "").join("");
			}
			const next = youtubeCatalogContinuation(root);
			if (requesting) visited.add(requesting);
			if (next === requesting && next) break;
			cursor = next;
			completed = !next;
			if (completed || options?.stopAtId && seen.has(options.stopAtId)) break;
		} catch (error) {
			if (requesting === resumeCursor && !reset && error instanceof YoutubeRequestError && (error.status === 400 || error.status === 404)) {
				reset = true;
				cursor = null;
				continue;
			}
			if (rows.length) return {
				rows,
				cursor,
				completed: false,
				failure: error,
				author,
				title
			};
			if (error instanceof SyntaxError || error instanceof YoutubeRequestError && (error.status === 400 || error.status === 404) && !resumeCursor) return null;
			throw error;
		}
	}
	return {
		rows,
		cursor,
		completed,
		author,
		title
	};
}
var youtubeUploadsArchive = (channelId, limit, resumeCursor, manualRetry, options) => youtubeBrowseArchive(`UU${channelId.slice(2)}`, limit, resumeCursor, manualRetry, options);
//#endregion
export { youtubeCatalogItems as a, youtubeUploadsArchive as c, youtubeCatalogHasTerminalPage as i, youtubeBrowseArchive as n, youtubePlaylistBrowseId as o, youtubeCatalogContinuation as r, youtubePublicRequest as s, browseYoutubeCatalog as t };
