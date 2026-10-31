import { n as ProviderBudgetError, s as parseProviderJson } from "./provider-json-CjRAnOrq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-page-data-BJBSVcir.js
var text = (value, maximum) => typeof value === "string" ? value.slice(0, maximum) : void 0;
var number = (value) => typeof value === "number" && Number.isFinite(value) ? value : void 0;
var label = (value, maximum) => {
	const content = typeof value?.simpleText === "string" ? value.simpleText : Array.isArray(value?.runs) ? value.runs.slice(0, 64).map((run) => text(run?.text, maximum) ?? "").join("") : void 0;
	return content === void 0 ? void 0 : { simpleText: content.slice(0, maximum) };
};
/** Retained archive rows own only fields used by the catalog adapter, never
* provider command menus, tracking trees, comments or recommended shelves. */
function projectYoutubeRenderer(row) {
	if (typeof row.videoId === "string" && row.videoId.length > 128) throw new ProviderBudgetError("graph", "YouTube metadata identity exceeded its graph budget; the page was not accepted.");
	return {
		videoId: text(row.videoId, 128),
		youtubeType: [
			"upload",
			"short",
			"replay",
			"live",
			"upcoming"
		].includes(row.youtubeType) ? row.youtubeType : void 0,
		title: label(row.title, 2048),
		descriptionSnippet: label(row.descriptionSnippet, 16384),
		shortBylineText: label(row.shortBylineText, 512),
		viewCountText: label(row.viewCountText, 128),
		publishedTimeText: label(row.publishedTimeText, 128),
		lengthText: label(row.lengthText, 64),
		publishedAt: text(row.publishedAt, 128),
		publishDate: text(row.publishDate, 128),
		uploadDate: text(row.uploadDate, 128),
		isLive: row.isLive === true,
		isLiveContent: row.isLiveContent === true,
		upcomingEventData: row.upcomingEventData ? { startTime: text(row.upcomingEventData.startTime, 32) } : void 0,
		thumbnail: { thumbnails: Array.isArray(row.thumbnail?.thumbnails) ? row.thumbnail.thumbnails.slice(-4).map((thumb) => ({ url: text(thumb?.url, 4096) })) : [] },
		thumbnailOverlays: Array.isArray(row.thumbnailOverlays) ? row.thumbnailOverlays.slice(0, 8).map((overlay) => ({ thumbnailOverlayTimeStatusRenderer: {
			style: text(overlay.thumbnailOverlayTimeStatusRenderer?.style, 100),
			text: label(overlay.thumbnailOverlayTimeStatusRenderer?.text, 128)
		} })) : [],
		badges: Array.isArray(row.badges) ? row.badges.slice(0, 8).map((badge) => ({ metadataBadgeRenderer: { style: text(badge.metadataBadgeRenderer?.style, 100) } })) : [],
		navigationEndpoint: row.navigationEndpoint ? {
			reelWatchEndpoint: row.navigationEndpoint.reelWatchEndpoint ? {} : void 0,
			commandMetadata: { webCommandMetadata: { url: text(row.navigationEndpoint.commandMetadata?.webCommandMetadata?.url, 4096) } }
		} : void 0
	};
}
function projectTwitchArchiveUser(user) {
	const identity = (v, limit) => {
		if (typeof v === "string" && v.length > limit) throw new ProviderBudgetError("graph", "Twitch metadata identity/cursor exceeded its graph budget; the page was not accepted.");
	};
	identity(user.id, 128);
	identity(user.videos?.pageInfo?.endCursor, 16384);
	if (Array.isArray(user.videos?.edges)) for (const edge of user.videos.edges) {
		identity(edge?.cursor, 16384);
		identity(edge?.node?.id, 128);
	}
	const node = (v) => v ? {
		id: text(v.id, 128),
		title: text(v.title, 2048),
		description: text(v.description, 65536),
		lengthSeconds: number(v.lengthSeconds),
		viewCount: number(v.viewCount),
		previewThumbnailURL: text(v.previewThumbnailURL, 4096),
		publishedAt: text(v.publishedAt, 128),
		game: v.game ? { name: text(v.game.name, 256) } : void 0
	} : void 0;
	return {
		id: text(user.id, 128),
		displayName: text(user.displayName, 256),
		profileImageURL: text(user.profileImageURL, 4096),
		stream: user.stream ? {
			title: text(user.stream.title, 2048),
			viewersCount: number(user.stream.viewersCount),
			previewImageURL: text(user.stream.previewImageURL, 4096),
			game: user.stream.game ? { name: text(user.stream.game.name, 256) } : void 0
		} : user.stream === null ? null : void 0,
		videos: user.videos ? {
			providerError: typeof user.videos.providerError === "string" ? user.videos.providerError.slice(0, 240) : Boolean(user.videos.providerError),
			pageInfo: user.videos.pageInfo ? {
				hasNextPage: typeof user.videos.pageInfo.hasNextPage === "boolean" ? user.videos.pageInfo.hasNextPage : void 0,
				endCursor: text(user.videos.pageInfo.endCursor, 16384)
			} : void 0,
			edges: Array.isArray(user.videos.edges) ? user.videos.edges.map((edge) => ({
				cursor: text(edge.cursor, 16384),
				node: node(edge.node)
			})) : user.videos.edges
		} : void 0
	};
}
/** Extract the balanced JSON value rather than depending on script spacing or
* the closing script immediately following ytInitialData. */
function youtubeInitialData(html) {
	const marker = /(?:var\s+ytInitialData\s*=|window\[\s*["']ytInitialData["']\s*\]\s*=|ytInitialData\s*=)\s*/g;
	if (!marker.exec(html)) return null;
	const start = marker.lastIndex;
	if (html[start] !== "{") return null;
	let depth = 0, quoted = false, escaped = false;
	for (let index = start; index < html.length; index++) {
		const char = html[index];
		if (quoted) {
			if (escaped) escaped = false;
			else if (char === "\\") escaped = true;
			else if (char === "\"") quoted = false;
		} else if (char === "\"") quoted = true;
		else if (char === "{") depth++;
		else if (char === "}" && --depth === 0) try {
			return parseProviderJson(html.slice(start, index + 1));
		} catch (error) {
			if (error instanceof ProviderBudgetError) throw error;
			return null;
		}
	}
	return null;
}
/** The page owner's metadata must win over recommended channels embedded in
* the same document. Avoid the first arbitrary channelId in a large page. */
function youtubePageChannelId(html) {
	const root = youtubeInitialData(html);
	const owner = root?.metadata?.channelMetadataRenderer?.externalId ?? root?.header?.c4TabbedHeaderRenderer?.channelId;
	if (owner && /^UC[\w-]{20,}$/.test(owner)) return owner;
	return html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/(?:www\.)?youtube\.com\/channel\/(UC[\w-]{20,})/i)?.[1] ?? html.match(/"externalId"\s*:\s*"(UC[\w-]{20,})"/)?.[1] ?? html.match(/channel_id=(UC[\w-]{20,})/)?.[1] ?? null;
}
/** Only traverse the requested catalog boundary. Playlist rows and Shorts
* have different renderers from the long-form Videos grid. */
function youtubeVideoRenderers(items, maximum) {
	const found = [], seen = /* @__PURE__ */ new Set(), stack = [items];
	while (stack.length && found.length < maximum) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			for (let index = current.length - 1; index >= 0; index--) stack.push(current[index]);
			continue;
		}
		const record = current;
		const renderer = record.videoRenderer ?? record.gridVideoRenderer ?? record.playlistVideoRenderer ?? record.reelItemRenderer;
		const lockup = record.lockupViewModel;
		const short = record.shortsLockupViewModel;
		const normalized = renderer ? record.reelItemRenderer ? {
			...renderer,
			youtubeType: "short"
		} : renderer : lockup?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" ? {
			videoId: lockup.contentId,
			title: { simpleText: lockup.metadata?.lockupMetadataViewModel?.title?.content },
			thumbnail: { thumbnails: lockup.contentImage?.thumbnailViewModel?.image?.sources },
			shortBylineText: { simpleText: lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content },
			viewCountText: { simpleText: lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.flatMap((row) => row.metadataParts?.map((part) => part.text?.content) ?? []).find((text) => typeof text === "string" && /\bviews\b/i.test(text)) },
			publishedTimeText: { simpleText: lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.flatMap((row) => row.metadataParts?.map((part) => part.text?.content) ?? []).find((value) => typeof value === "string" && /^Streamed\s|^\d{4}-\d{2}-\d{2}$/.test(value)) },
			thumbnailOverlays: lockup.contentImage?.thumbnailViewModel?.overlays?.flatMap((overlay) => overlay.thumbnailBottomOverlayViewModel?.badges?.map((badge) => ({ thumbnailOverlayTimeStatusRenderer: {
				text: { simpleText: badge.thumbnailBadgeViewModel?.text },
				style: badge.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE" ? "LIVE" : badge.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_UPCOMING" ? "UPCOMING" : void 0
			} })) ?? [])
		} : short ? {
			videoId: short.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId,
			title: { simpleText: short.overlayMetadata?.primaryText?.content ?? short.accessibilityText },
			thumbnail: { thumbnails: short.thumbnail?.sources },
			youtubeType: "short"
		} : void 0;
		if (normalized?.videoId && !seen.has(normalized.videoId)) {
			seen.add(normalized.videoId);
			found.push(projectYoutubeRenderer(normalized));
		}
		for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
	}
	return found;
}
//#endregion
export { youtubeVideoRenderers as i, youtubeInitialData as n, youtubePageChannelId as r, projectTwitchArchiveUser as t };
