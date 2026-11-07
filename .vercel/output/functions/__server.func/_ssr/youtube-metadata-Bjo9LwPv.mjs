//#region node_modules/.nitro/vite/services/ssr/assets/youtube-metadata-Bjo9LwPv.js
var defaultSearchDates = () => ({
	field: "published",
	from: "",
	to: "",
	unknown: "exclude",
	partial: "overlap"
});
var day = 864e5;
var validEpoch = (value) => Number.isFinite(value) && value > 0 && value <= 0xe677d21fdbff;
function publicationInstant(value) {
	if (value.length > 64 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || calendarDay(value.slice(0, 10)) === void 0) return;
	const [hour, minute, second] = value.slice(11, 19).split(":").map(Number);
	if (hour > 23 || minute > 59 || second > 59) return;
	const stamp = Date.parse(value);
	return validEpoch(stamp) ? stamp : void 0;
}
function calendarDay(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
	const stamp = Date.parse(value + "T00:00:00Z");
	if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== value || Number(value.slice(0, 4)) < 1900) return;
	return stamp;
}
function validateSearchDates(value) {
	const q = value;
	if (!q || typeof q !== "object" || Object.keys(q).some((key) => ![
		"field",
		"from",
		"to",
		"unknown",
		"partial"
	].includes(key)) || !["published", "added"].includes(q.field) || typeof q.from !== "string" || typeof q.to !== "string" || q.from !== "" && calendarDay(q.from) === void 0 || q.to !== "" && calendarDay(q.to) === void 0 || ![
		"exclude",
		"include",
		"only"
	].includes(q.unknown) || !["overlap", "exclude"].includes(q.partial)) throw Error("Use valid calendar dates, an explicit date field and supported unknown/partial-date choices.");
	if (q.from && q.to && q.from > q.to) throw Error("Start date must not follow end date.");
	return {
		field: q.field,
		from: q.from,
		to: q.to,
		unknown: q.unknown,
		partial: q.partial
	};
}
/** Publication never falls back to a scan/download clock. UTC calendar periods
* describe uncertainty, not invented instants written into saved metadata. */
function searchDateEvidence(video, field) {
	if (field === "added") return !video.remote && validEpoch(video.addedAt) ? {
		start: video.addedAt,
		end: video.addedAt + 1,
		precision: "instant",
		source: "local library added time"
	} : void 0;
	const r = video.remote;
	if (!r || ![
		"rss",
		"provider",
		"watch"
	].includes(r.publishedSource ?? "") || r.live || r.youtubeType === "upcoming" || r.publishedPrecision === "relative" || r.publishedPrecision === "unknown") return;
	const value = r.publishedDate;
	if (r.publishedPrecision === "year" || r.publishedPrecision === "month") {
		const year = r.publishedPrecision === "year";
		if (typeof value !== "string" || !(year ? /^\d{4}$/ : /^\d{4}-\d{2}$/).test(value)) return;
		const start = calendarDay(value + (year ? "-01-01" : "-01"));
		if (start === void 0) return;
		const date = new Date(start);
		return {
			start,
			end: year ? Date.UTC(date.getUTCFullYear() + 1, 0, 1) : Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
			precision: year ? "year" : "month",
			source: r.publishedSource
		};
	}
	if (r.publishedPrecision === "day" || !r.publishedPrecision && value?.length === 10) {
		const start = typeof value === "string" ? calendarDay(value) : void 0;
		return start === void 0 ? void 0 : {
			start,
			end: start + day,
			precision: "day",
			source: r.publishedSource
		};
	}
	if (r.publishedPrecision === "instant" || !r.publishedPrecision) {
		const start = r.publishedPrecision === "instant" || !value || r.publishedSource === "rss" ? video.addedAt : value && value.length > 10 ? publicationInstant(value) : void 0;
		if (start !== void 0 && validEpoch(start)) return {
			start,
			end: start + 1,
			precision: "instant",
			source: r.publishedSource
		};
	}
}
function matchesSearchDates(video, q) {
	const evidence = searchDateEvidence(video, q.field);
	if (!evidence) return q.unknown !== "exclude";
	if (q.unknown === "only") return false;
	if (q.partial === "exclude" && (evidence.precision === "year" || evidence.precision === "month")) return false;
	const start = q.from ? calendarDay(q.from) : -Infinity, end = q.to ? calendarDay(q.to) + day : Infinity;
	return evidence.start < end && evidence.end > start;
}
function publicationPeriodLabel(video) {
	if (video.remote?.publishedPrecision !== "year" && video.remote?.publishedPrecision !== "month") return;
	const evidence = searchDateEvidence(video, "published");
	return evidence && (evidence.precision === "year" || evidence.precision === "month") ? `Published ${video.remote.publishedDate} · ${evidence.precision} only` : void 0;
}
var partialPrecisionWeight = {
	year: 1,
	month: 2,
	day: 3,
	instant: 4
};
var partialEvidence = (video) => video.remote?.publishedPrecision === "year" || video.remote?.publishedPrecision === "month" ? searchDateEvidence(video, "published") : void 0;
var minimumDate = Date.UTC(2e3, 0, 1);
function youtubePublicationTime(video) {
	const remote = video.remote;
	if (remote?.kind === "youtube" && remote.publishedSource !== "rss" && remote.publishedSource !== "provider" && remote.publishedSource !== "watch") return 0;
	if (remote?.publishedPrecision === "relative" || remote?.publishedPrecision === "unknown" || remote?.publishedPrecision === "year" || remote?.publishedPrecision === "month" || remote?.publishedSource === "unknown") return 0;
	if (remote?.publishedDate && (remote.publishedPrecision === "day" || !remote.publishedPrecision && remote.publishedSource !== "rss")) {
		const date = exactYoutubePublished(remote.publishedDate);
		if (date) return Date.parse(date);
		return 0;
	}
	if (!Number.isFinite(video.addedAt) || video.addedAt <= minimumDate) return 0;
	return video.addedAt;
}
function youtubeContentKind(video) {
	if (video.remote?.live) return "live";
	const type = video.remote?.youtubeType;
	return type === "short" || type === "replay" || type === "live" || type === "upcoming" ? type : "upload";
}
function youtubeDateSource(video) {
	const partial = partialEvidence(video);
	if (partial && (partial.precision === "year" || partial.precision === "month")) return video.remote.publishedSource;
	if (!youtubePublicationTime(video)) return "unknown";
	const source = video.remote?.publishedSource;
	return source === "rss" || source === "provider" || source === "watch" ? source : "legacy";
}
/** Old generated archive dates are recognized narrowly. Explicit provenance
* prevents this compatibility repair from erasing a real RSS/provider date. */
function repairYoutubePublication(video) {
	if (video.remote?.kind !== "youtube") return video;
	const partial = partialEvidence(video);
	if (partial && (partial.precision === "year" || partial.precision === "month")) return video.addedAt === 0 ? video : {
		...video,
		addedAt: 0
	};
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
	const oldPartial = partialEvidence(previous), newPartial = oldPartial ? searchDateEvidence(incoming, "published") : void 0;
	if (oldPartial && (!newPartial || partialPrecisionWeight[oldPartial.precision] > partialPrecisionWeight[newPartial.precision])) incoming = {
		...incoming,
		addedAt: 0,
		remote: {
			...incoming.remote,
			publishedSource: previous.remote.publishedSource,
			publishedDate: previous.remote.publishedDate,
			publishedPrecision: previous.remote.publishedPrecision,
			publishedLabel: void 0,
			publishedLabelAt: void 0
		}
	};
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
	if (youtubePublicationTime(video)) return video.remote?.publishedPrecision === "day" || !video.remote?.publishedPrecision && video.remote?.publishedDate?.length === 10 && video.remote?.publishedSource !== "rss" ? "day" : "instant";
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
//#endregion
export { youtubeRendererMetadata as _, matchesSearchDates as a, retainYoutubeMetadata as c, withYoutubePublication as d, youtubeContentKind as f, youtubePublicationTime as g, youtubePublicationPrecision as h, exactYoutubePublished as i, searchDateEvidence as l, youtubePublicationIdentityOrder as m, compareYoutubePublication as n, publicationPeriodLabel as o, youtubeDateSource as p, defaultSearchDates as r, repairYoutubePublication as s, cleanYoutubePublishedLabel as t, validateSearchDates as u };
