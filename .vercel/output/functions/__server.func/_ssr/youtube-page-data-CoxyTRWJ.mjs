//#region node_modules/.nitro/vite/services/ssr/assets/youtube-page-data-CoxyTRWJ.js
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
			return JSON.parse(html.slice(start, index + 1));
		} catch {
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
			found.push(normalized);
		}
		for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
	}
	return found;
}
//#endregion
export { youtubePageChannelId as n, youtubeVideoRenderers as r, youtubeInitialData as t };
