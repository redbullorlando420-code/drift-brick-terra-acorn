//#region node_modules/.nitro/vite/services/ssr/assets/youtube-metadata-Cxzyxaug.js
var minimumDate = Date.UTC(2e3, 0, 1);
function youtubePublicationTime(video) {
	const remote = video.remote;
	if (remote?.kind === "youtube" && remote.publishedSource !== "rss" && remote.publishedSource !== "provider" && remote.publishedSource !== "watch") return 0;
	return remote?.publishedSource === "unknown" || !Number.isFinite(video.addedAt) || video.addedAt <= minimumDate ? 0 : video.addedAt;
}
function youtubeContentKind(video) {
	if (video.remote?.live) return "live";
	const type = video.remote?.youtubeType;
	return type === "short" || type === "replay" || type === "live" || type === "upcoming" ? type : "upload";
}
function youtubeDateSource(video) {
	if (!youtubePublicationTime(video)) return "unknown";
	const source = video.remote?.publishedSource;
	return source === "rss" || source === "provider" || source === "watch" ? source : "legacy";
}
/** Old generated archive dates are recognized narrowly. Explicit provenance
* prevents this compatibility repair from erasing a real RSS/provider date. */
function repairYoutubePublication(video) {
	if (video.remote?.kind !== "youtube") return video;
	if (!(!video.remote.publishedSource && video.remote.channelName && video.description === `${video.remote.channelName} public channel catalog item.`) && youtubePublicationTime(video) || video.addedAt === 0) return video;
	return {
		...video,
		addedAt: 0,
		remote: {
			...video.remote,
			publishedSource: "unknown"
		}
	};
}
var priority = {
	unknown: 0,
	legacy: 1,
	provider: 2,
	rss: 3,
	watch: 4
};
/** Preserve the strongest date evidence across shallow/live/playlist refreshes.
* A feed has no live-state or format evidence and cannot erase either. */
function retainYoutubeMetadata(previous, incoming) {
	if (incoming.remote?.kind !== "youtube") return incoming;
	incoming = repairYoutubePublication(incoming);
	if (previous?.remote?.kind !== "youtube") return incoming;
	previous = repairYoutubePublication(previous);
	const oldSource = youtubeDateSource(previous), newSource = youtubeDateSource(incoming);
	const keepDate = priority[oldSource] > priority[newSource];
	const old = previous.remote, next = incoming.remote;
	const keepKind = !next.youtubeType && Boolean(old.youtubeType);
	const keepLive = next.live === void 0 && old.live !== void 0;
	const keepTags = !next.youtubeTagsCheckedAt && Boolean(old.youtubeTagsCheckedAt);
	const keepDuration = !(Number.isFinite(incoming.duration) && incoming.duration > 0) && Number.isFinite(previous.duration) && previous.duration > 0;
	if (!keepDate && !keepKind && !keepLive && !keepTags && !keepDuration) return incoming;
	return {
		...incoming,
		...keepDuration ? { duration: previous.duration } : {},
		...keepDate ? { addedAt: previous.addedAt } : {},
		remote: {
			...next,
			...keepDate ? { publishedSource: oldSource } : {},
			...keepDate && old.publishedDate ? { publishedDate: old.publishedDate } : {},
			...keepKind ? { youtubeType: old.youtubeType } : {},
			...keepLive ? {
				live: old.live,
				observedAt: old.observedAt,
				viewers: old.viewers
			} : {},
			...keepTags ? {
				youtubeKeywords: old.youtubeKeywords,
				youtubeTagsCheckedAt: old.youtubeTagsCheckedAt,
				youtubeTagSummary: old.youtubeTagSummary
			} : {}
		}
	};
}
/** Exact dates only. Relative labels and scheduled start times are not upload
* dates; never infer them from the current clock, duration, or video title. */
function exactYoutubePublished(value) {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return;
	const time = Date.parse(value);
	if (!Number.isFinite(time) || time <= minimumDate) return;
	const [year, month, day] = value.slice(0, 10).split("-").map(Number);
	if (new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) !== value.slice(0, 10)) return;
	return value;
}
var text = (value) => value?.simpleText ?? value?.runs?.map((row) => row.text ?? "").join("") ?? "";
function youtubeRuntime(value) {
	if (typeof value === "number") return Number.isFinite(value) && value > 0 && value <= 31536e3 ? value : void 0;
	if (typeof value !== "string" || !/^\d{1,4}:\d{2}(?::\d{2})?$/.test(value.trim())) return;
	const parts = value.trim().split(":").map(Number);
	if (parts.slice(1).some((part) => part > 59)) return;
	return youtubeRuntime(parts.reduce((total, part) => total * 60 + part, 0));
}
function youtubeRendererMetadata(renderer) {
	const live = renderer.isLive === true || renderer.thumbnailOverlays?.some((row) => row.thumbnailOverlayTimeStatusRenderer?.style === "LIVE") || renderer.badges?.some((row) => row.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW");
	const label = text(renderer.publishedTimeText);
	const type = renderer.upcomingEventData || renderer.thumbnailOverlays?.some((row) => row.thumbnailOverlayTimeStatusRenderer?.style === "UPCOMING") || renderer.badges?.some((row) => row.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_UPCOMING_EVENT") ? "upcoming" : live ? "live" : renderer.youtubeType ?? (renderer.navigationEndpoint?.reelWatchEndpoint || /\/shorts\//.test(renderer.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ?? "") ? "short" : renderer.isLiveContent || /^Streamed\s/i.test(label) ? "replay" : renderer.thumbnailOverlays?.some((row) => row.thumbnailOverlayTimeStatusRenderer?.style === "DEFAULT") ? "upload" : void 0);
	const published = exactYoutubePublished(renderer.publishedAt) ?? exactYoutubePublished(renderer.publishDate) ?? exactYoutubePublished(renderer.uploadDate) ?? exactYoutubePublished(label);
	const duration = type === "live" || type === "upcoming" ? void 0 : youtubeRuntime(text(renderer.lengthText)) ?? renderer.thumbnailOverlays?.map((row) => youtubeRuntime(text(row.thumbnailOverlayTimeStatusRenderer?.text))).find(Boolean);
	return {
		...type ? { youtubeType: type } : {},
		...published ? { published } : {},
		...duration ? { duration } : {}
	};
}
//#endregion
export { youtubeDateSource as a, youtubeContentKind as i, repairYoutubePublication as n, youtubePublicationTime as o, retainYoutubeMetadata as r, youtubeRendererMetadata as s, exactYoutubePublished as t };
