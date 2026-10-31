//#region node_modules/.nitro/vite/services/ssr/assets/provider-json-CjRAnOrq.js
/** Session-only, bounded state transitions. No URLs, creator IDs, payloads or timers. */
function createDispatchTrace(now = () => Date.now()) {
	let serial = 0, events = [];
	const listeners = /* @__PURE__ */ new Set();
	return {
		begin(lane, operation) {
			const id = ++serial, queuedAt = now();
			return (phase) => {
				const at = now();
				events = [...events.slice(-63), {
					id,
					lane,
					operation,
					phase,
					at,
					waitedMs: Math.max(0, at - queuedAt)
				}];
				for (const listener of listeners) listener();
			};
		},
		snapshot: () => events,
		subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
	};
}
var pullDispatchTrace = createDispatchTrace();
var minimumDate = Date.UTC(2e3, 0, 1);
function youtubePublicationTime(video) {
	const remote = video.remote;
	if (remote?.kind === "youtube" && remote.publishedSource !== "rss" && remote.publishedSource !== "provider" && remote.publishedSource !== "watch") return 0;
	if (remote?.publishedPrecision === "relative" || remote?.publishedPrecision === "unknown" || remote?.publishedSource === "unknown" || !Number.isFinite(video.addedAt) || video.addedAt <= minimumDate) return 0;
	if (remote?.publishedDate && (remote.publishedPrecision === "day" || !remote.publishedPrecision && remote.publishedSource !== "rss")) {
		const date = exactYoutubePublished(remote.publishedDate);
		if (date?.length === 10) return Date.parse(date);
	}
	return video.addedAt;
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
var precisionStrength = {
	unknown: 0,
	relative: 1,
	day: 2,
	instant: 3
};
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
	if (previous.remote?.videoId && incoming.remote?.videoId && previous.remote.videoId !== incoming.remote.videoId) return incoming;
	const oldSource = youtubeDateSource(previous), newSource = youtubeDateSource(incoming);
	const oldPrecision = youtubePublicationPrecision(previous), newPrecision = youtubePublicationPrecision(incoming);
	const keepDate = Boolean(youtubePublicationTime(previous)) && (incoming.remote?.youtubeType === "upcoming" || incoming.remote?.live === true || precisionStrength[oldPrecision] > precisionStrength[newPrecision] || priority[oldSource] > priority[newSource]);
	const old = previous.remote, next = incoming.remote;
	const keepKind = !next.youtubeType && Boolean(old.youtubeType);
	const keepLive = next.live === void 0 && old.live !== void 0;
	const keepLabel = !youtubePublicationTime(previous) && !youtubePublicationTime(incoming) && !next.publishedLabel && Boolean(old.publishedLabel) && next.youtubeType !== "upcoming" && !next.live;
	const keepTags = !next.youtubeTagsCheckedAt && Boolean(old.youtubeTagsCheckedAt);
	const keepDuration = !(Number.isFinite(incoming.duration) && incoming.duration > 0) && Number.isFinite(previous.duration) && previous.duration > 0;
	if (!keepDate && !keepLabel && !keepKind && !keepLive && !keepTags && !keepDuration) return incoming;
	return {
		...incoming,
		...keepDuration ? { duration: previous.duration } : {},
		...keepDate ? { addedAt: previous.addedAt } : {},
		remote: {
			...next,
			...keepDate ? {
				publishedSource: oldSource,
				publishedDate: old.publishedDate,
				publishedPrecision: old.publishedPrecision,
				publishedLabel: old.publishedLabel,
				publishedLabelAt: old.publishedLabelAt
			} : {},
			...keepLabel ? {
				publishedLabel: old.publishedLabel,
				publishedLabelAt: old.publishedLabelAt,
				publishedPrecision: "relative"
			} : {},
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
	if (value.length > 64) return;
	if (value.length > 10) {
		const [hour, minute, second] = value.slice(11, 19).split(":").map(Number);
		if (hour > 23 || minute > 59 || second > 59) return;
	}
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
	const published = type === "live" || type === "upcoming" ? void 0 : exactYoutubePublished(renderer.publishedAt) ?? exactYoutubePublished(renderer.publishDate) ?? exactYoutubePublished(renderer.uploadDate) ?? exactYoutubePublished(label);
	const publishedLabel = !published && type !== "live" && type !== "upcoming" ? cleanYoutubePublishedLabel(label) : void 0;
	const duration = type === "live" || type === "upcoming" ? void 0 : youtubeRuntime(text(renderer.lengthText)) ?? renderer.thumbnailOverlays?.map((row) => youtubeRuntime(text(row.thumbnailOverlayTimeStatusRenderer?.text))).find(Boolean);
	return {
		...type ? { youtubeType: type } : {},
		...published ? { published } : {},
		...publishedLabel ? { publishedLabel } : {},
		...duration ? { duration } : {}
	};
}
function cleanYoutubePublishedLabel(value) {
	if (typeof value !== "string") return;
	return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) || void 0;
}
function youtubePublicationPrecision(video) {
	if (youtubePublicationTime(video)) return video.remote?.publishedPrecision === "day" || !video.remote?.publishedPrecision && video.remote?.publishedDate && video.remote?.publishedSource !== "rss" ? "day" : "instant";
	return cleanYoutubePublishedLabel(video.remote?.publishedLabel) && youtubeContentKind(video) !== "upcoming" && youtubeContentKind(video) !== "live" ? "relative" : "unknown";
}
/** Exact repair inputs are tied to the selected canonical identity. Relative and
* scheduled evidence never enters this path. Stronger known precision wins. */
function withYoutubePublication(video, videoId, raw) {
	const date = exactYoutubePublished(raw);
	if (!date || !/^[-_a-zA-Z0-9]{11}$/.test(videoId) || video.remote?.kind !== "youtube" || video.remote.videoId !== videoId) throw Error("Publication evidence does not match this YouTube video.");
	if (video.remote.live || video.remote.youtubeType === "upcoming") throw Error("Publication checks are available after this stream has ended.");
	const precision = date.length === 10 ? "day" : "instant";
	return retainYoutubeMetadata(video, {
		...video,
		addedAt: Date.parse(date),
		remote: {
			...video.remote,
			publishedSource: "watch",
			publishedPrecision: precision,
			publishedDate: date.slice(0, 10),
			publishedLabel: void 0,
			publishedLabelAt: void 0
		}
	});
}
/** Locale/time-zone-independent identity ties also stabilize undated cache reloads. */
function youtubePublicationIdentityOrder(a, b) {
	return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
function compareYoutubePublication(a, b) {
	return youtubePublicationTime(b) - youtubePublicationTime(a) || youtubePublicationIdentityOrder(a, b);
}
/** Metadata safeguards; media playback/downloads never use these readers.
* Limits apply to each complete upstream page, not the accumulated archive. */
var PROVIDER_BUDGETS = {
	responseBytes: 8388608,
	/** Per-page structural ceilings, checked before allocating parsed objects. */
	json: {
		tokens: 12e4,
		containers: 4e4,
		depth: 96,
		stringUnits: 262144,
		scratchBytes: 33554432
	},
	errorPrefixBytes: 65536,
	bodyTimeoutMs: 15e3,
	queuedRequests: 80,
	youtubeTransfers: 1,
	/** Two lightweight RSS bodies can complete independently of archive pages. */
	youtubeFeedTransfers: 2,
	youtubeLiveTransfers: 8,
	youtubeLiveWorkers: 8,
	youtubeLiveRequestGapMs: 80,
	twitchTransfers: 6,
	adultTransfers: 6,
	refreshWorkers: 3,
	liveWorkers: 2,
	archiveWorkers: 1,
	importWorkers: 6,
	importAttempts: 2,
	warmCacheRows: 250,
	warmCacheEntryBytes: 1048576,
	youtubeCacheBytes: 4194304,
	twitchCacheBytes: 4194304,
	adultCacheBytes: 12582912
};
var ProviderBudgetError = class extends Error {
	budget;
	constructor(budget, message) {
		super(message);
		this.budget = budget;
		this.name = "ProviderBudgetError";
	}
};
var samples = [];
/** Scan before JSON.parse allocates an object graph. This is a structural and
* conservative payload estimate, not a claim to measure engine heap bytes. */
function parseProviderJson(text, provider = "other") {
	const limits = PROVIDER_BUDGETS.json, started = performance.now();
	let rawBytes = 0, tokens = 0, containers = 0, depth = 0, peakDepth = 0, quoted = false, escaped = false, atom = false, stringUnits = 0;
	const scratch = () => rawBytes + text.length * 2 + tokens * 24 + containers * 64;
	const fail = () => {
		throw new ProviderBudgetError("graph", "Provider metadata exceeded its parsed JSON graph budget; the page and its cursor were not accepted.");
	};
	try {
		if (text.length > PROVIDER_BUDGETS.responseBytes) fail();
		for (let i = 0; i < text.length; i++) {
			const code = text.charCodeAt(i), c = text[i];
			rawBytes += code < 128 ? 1 : code < 2048 ? 2 : code >= 55296 && code <= 56319 && text.charCodeAt(i + 1) >= 56320 && text.charCodeAt(i + 1) <= 57343 ? 1 : 3;
			if (quoted) {
				if (c === "\"" && !escaped) quoted = false;
				else {
					if (++stringUnits > limits.stringUnits) fail();
					if (escaped) escaped = false;
					else if (c === "\\") escaped = true;
				}
			} else if (c === "\"") {
				quoted = true;
				stringUnits = 0;
				atom = false;
				tokens++;
			} else if (c === "{" || c === "[") {
				depth++;
				peakDepth = Math.max(peakDepth, depth);
				containers++;
				tokens++;
				atom = false;
			} else if (c === "}" || c === "]") {
				depth--;
				atom = false;
			} else if (c === "," || c === ":" || code === 32 || code === 9 || code === 10 || code === 13) atom = false;
			else if (!atom) {
				tokens++;
				atom = true;
			}
			if (rawBytes > PROVIDER_BUDGETS.responseBytes || tokens > limits.tokens || containers > limits.containers || peakDepth > limits.depth || scratch() > limits.scratchBytes) fail();
		}
		const parsed = JSON.parse(text);
		samples.push({
			provider,
			outcome: "accepted",
			rawBytes,
			textUnits: text.length,
			tokens,
			containers,
			depth: peakDepth,
			estimatedScratchBytes: scratch(),
			parseMs: performance.now() - started
		});
		return parsed;
	} catch (error) {
		samples.push({
			provider,
			outcome: "rejected",
			rawBytes,
			textUnits: text.length,
			tokens,
			containers,
			depth: peakDepth,
			estimatedScratchBytes: scratch(),
			parseMs: performance.now() - started
		});
		throw error;
	} finally {
		if (samples.length > 16) samples.shift();
	}
}
var readProviderJson = async (response, provider = "other") => parseProviderJson(await response.text(), provider);
//#endregion
export { youtubePublicationTime as _, createDispatchTrace as a, pullDispatchTrace as c, retainYoutubeMetadata as d, withYoutubePublication as f, youtubePublicationPrecision as g, youtubePublicationIdentityOrder as h, compareYoutubePublication as i, readProviderJson as l, youtubeDateSource as m, ProviderBudgetError as n, exactYoutubePublished as o, youtubeContentKind as p, cleanYoutubePublishedLabel as r, parseProviderJson as s, PROVIDER_BUDGETS as t, repairYoutubePublication as u, youtubeRendererMetadata as v };
