import { et as ratingPreference } from "./store-uZbLuJol.mjs";
import { A as expandedAdultTags, C as adultTagRankBoost, F as isAdultGenreTag, L as isAdultMetaTaxonomyTag, c as ADULT_PULL_PROVIDERS } from "./adult-pull-cache-CM6xh6_t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/adult-rank-Bn2wocg4.js
var ADULT_BOORU_HOST_FILTERS = [
	"rule34",
	"e621",
	"gelbooru",
	"realbooru"
];
var ADULT_SOURCE_FILTERS = [
	{
		id: "all",
		label: "All sources"
	},
	{
		id: "reddit",
		label: "Reddit"
	},
	{
		id: "redtube",
		label: "RedTube"
	},
	{
		id: "eporner",
		label: "Eporner"
	},
	{
		id: "chaturbate",
		label: "Chaturbate"
	},
	{
		id: "myfreecams",
		label: "MyFreeCams"
	},
	{
		id: "booru",
		label: "Booru"
	},
	{
		id: "rule34",
		label: "Rule34"
	},
	{
		id: "e621",
		label: "e621"
	},
	{
		id: "gelbooru",
		label: "Gelbooru"
	},
	{
		id: "realbooru",
		label: "Realbooru"
	},
	{
		id: "redgifs",
		label: "Redgifs"
	}
];
function isBooruHostFilter(needle) {
	return ADULT_BOORU_HOST_FILTERS.includes(needle);
}
function adultProviderKind(video) {
	const kind = video.remote?.kind;
	if (kind && ADULT_PULL_PROVIDERS.includes(kind)) return kind;
	const folder = video.folderId.split(":")[0] ?? "";
	if (ADULT_PULL_PROVIDERS.includes(folder)) return folder;
	return "";
}
/** Primary provider plus any verified media host attached to the same post. */
function adultProviderKinds(video) {
	const primary = adultProviderKind(video);
	const extra = video.remote?.sourceKinds ?? [];
	return [...new Set([primary, ...extra].filter((kind) => Boolean(kind) && ADULT_PULL_PROVIDERS.includes(kind)))];
}
function adultBooruHost(video) {
	if (adultProviderKind(video) !== "booru") return "";
	return (video.remote?.channelId ?? "").trim().toLowerCase();
}
function videoMatchesAdultSource(video, source) {
	if (!source || source === "all" || source === "All") return true;
	const kinds = adultProviderKinds(video);
	const needle = source.replace(/^source-/, "").toLowerCase();
	if (isBooruHostFilter(needle)) return kinds.includes("booru") && adultBooruHost(video) === needle;
	if (kinds.some((kind) => kind === needle || needle.startsWith(`${kind}-`))) return true;
	if (needle.startsWith("reddit") && kinds.includes("reddit")) return true;
	return false;
}
function videoMatchesAdultTag(video, tag, tags) {
	if (!tag || tag === "All" || tag === "all") return true;
	if (tag.startsWith("source-")) return videoMatchesAdultSource(video, tag);
	const needle = tag.trim().toLowerCase().replace(/^#/, "");
	if (!needle) return true;
	const itemTags = tags[video.id] ?? [];
	const lowered = itemTags.map((entry) => entry.toLowerCase());
	if (lowered.includes(needle)) return true;
	const expanded = expandedAdultTags(itemTags);
	if (expanded.has(needle) || [...expanded].some((entry) => entry.toLowerCase() === needle)) return true;
	if (needle.startsWith("creator-")) {
		const slug = needle.slice(8);
		const name = (video.remote?.channelName ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
		return Boolean(slug) && name === slug;
	}
	const bare = needle.replace(/^(?:fetish|genre|meta|creator|sub|source)-/, "");
	if (bare && bare !== needle) {
		if (lowered.includes(bare) || lowered.includes(`fetish-${bare}`) || lowered.includes(`genre-${bare}`)) return true;
		if (expanded.has(bare) || expanded.has(`fetish-${bare}`) || expanded.has(`genre-${bare}`) || expanded.has(`meta-${bare}`)) return true;
	}
	if (!needle.includes("-") && lowered.some((entry) => entry === `fetish-${needle}` || entry.endsWith(`-${needle}`))) return true;
	const terms = needle.replace(/^(?:fetish|genre|meta|creator|source|provider|sub)-/, "").replace(/[-_]+/g, " ").split(/\s+/).filter(Boolean);
	if (!terms.length) return true;
	return [...lowered, ...expanded].map((entry) => entry.toLowerCase().replace(/^(?:fetish|genre|meta|creator|source|provider|sub)-/, "").replace(/[-_]+/g, " ")).some((entry) => terms.every((term) => entry.includes(term)));
}
function countAdultBySource(videos) {
	const counts = { all: videos.length };
	for (const provider of ADULT_PULL_PROVIDERS) counts[provider] = 0;
	for (const host of ADULT_BOORU_HOST_FILTERS) counts[host] = 0;
	for (const video of videos) {
		for (const kind of adultProviderKinds(video)) counts[kind] = (counts[kind] ?? 0) + 1;
		const host = adultBooruHost(video);
		if (host && ADULT_BOORU_HOST_FILTERS.includes(host)) counts[host] = (counts[host] ?? 0) + 1;
	}
	return counts;
}
/** Host mix for Stats / shelves — Rule34 first so its coverage is obvious. */
function countAdultBooruHosts(videos) {
	const counts = /* @__PURE__ */ new Map();
	for (const video of videos) {
		const host = adultBooruHost(video);
		if (!host) continue;
		counts.set(host, (counts.get(host) ?? 0) + 1);
	}
	return [...counts.entries()].map(([host, count]) => ({
		host,
		count
	})).sort((a, b) => {
		if (a.host === "rule34") return -1;
		if (b.host === "rule34") return 1;
		return b.count - a.count || a.host.localeCompare(b.host);
	});
}
/** Stable personal-interest tags for the main Adults browser. Sources and
* creators already have dedicated filters; raw API keyword dumps stay
* searchable without flooding the browse chips. */
function isAdultInterestTag(tag) {
	const clean = tag.trim().toLowerCase();
	if (/^(?:fetish-)?(?:https?|www|com|watch|comments|reddit|redgifs|eporner|redtube)(?:-|$)/.test(clean) || /(?:https?|www|\.com)/.test(clean)) return false;
	return clean.startsWith("fetish-") || isAdultGenreTag(clean);
}
function redditSignal(tags) {
	let score = 0;
	for (const tag of tags) {
		if (tag.startsWith("source-reddit") || tag.startsWith("sub-")) score += 2;
		if (tag === "reddit-photo" || tag === "reddit-video") score += 1.5;
		if (tag.startsWith("fetish-")) score += .6;
	}
	return score;
}
function scoreAdultVideo(video, ctx) {
	const itemTags = ctx.tags[video.id] ?? [];
	const rating = ctx.ratingOf(video.id);
	const came = Math.min(24, (ctx.cameCounts[video.id] ?? 0) * 7);
	const views = Math.min(8, (ctx.viewCounts?.[video.id] ?? 0) * 1.2);
	const boost = itemTags.reduce((sum, tag) => sum + adultTagRankBoost(tag), 0);
	const recency = Math.max(0, 1 - (Date.now() - video.addedAt) / 18144e5) * 8;
	const reddit = video.remote?.kind === "reddit" ? 6 + redditSignal(itemTags) : redditSignal(itemTags);
	return ratingPreference(rating) * 14 + (ctx.favorites[video.id] ? 10 : 0) + (ctx.likes[video.id] ? 6 : 0) + came + views + boost + recency + reddit + Math.min(6, itemTags.length) * .35;
}
function stabilizedTagScore(engagement, count, recency, boost, providerCoverage = 1, videoScoreSum = 0) {
	const support = Math.max(count === 1 ? .42 : .28, count / (count + 3));
	const stableEngagement = 1 + (engagement - 1) * support;
	const videoScoreLift = Math.min(18, videoScoreSum / Math.max(1, count) / 8) * support;
	return stableEngagement * 12 + Math.log2(count + 1) * 2.8 + recency * 4 * support + boost * support + Math.min(4, providerCoverage) * 1.25 * support + videoScoreLift + Math.min(6, count) * .85;
}
/**
* Metadata stays searchable and useful to recommendations without becoming an
* unmanageable filter list.  Provider/source, creator and mechanical ingest
* labels remain dedicated facets; the remaining verified provider metadata is
* scored with the same personal signals as curated interests.
*/
function isAdultMetaTag(tag) {
	return isAdultMetaTaxonomyTag(tag) || Boolean(tag) && !isAdultInterestTag(tag) && !tag.startsWith("source-") && !tag.startsWith("creator-") && !tag.startsWith("auto-") && !tag.startsWith("sub-") && !tag.startsWith("provider-") && !tag.startsWith("format-") && !/^(?:adult|video|photo|live|cam|image|explicit|https?|www|com|eporner|redtube|reddit|chaturbate|myfreecams|booru|redgifs)$/.test(tag) && tag.length >= 3 && !/(?:https?|\bwww\b|redgifs|eporner|redtube)/.test(tag);
}
function rankAdultTags(videos, ctx, limit = 64) {
	const rows = /* @__PURE__ */ new Map();
	for (const video of videos) {
		const rating = ctx.ratingOf(video.id);
		const signal = rating === 1 ? -3 : Math.max(ratingPreference(rating), ctx.favorites[video.id] ? 4 : 0, ctx.likes[video.id] ? 3 : 0, Math.min(5, ctx.cameCounts[video.id] ?? 0), .35);
		const kind = adultProviderKind(video);
		const itemTags = ctx.tags[video.id] ?? [];
		const videoScore = scoreAdultVideo(video, ctx);
		for (const tag of expandedAdultTags(itemTags)) {
			if (!isAdultInterestTag(tag)) continue;
			const row = rows.get(tag) ?? {
				total: 0,
				count: 0,
				recent: 0,
				videoScoreSum: 0
			};
			const redditBoost = kind === "reddit" && (tag.startsWith("source-reddit") || tag.startsWith("sub-") || tag.startsWith("fetish-")) ? 2 : 0;
			row.total += signal + adultTagRankBoost(tag) + redditBoost;
			row.count += 1;
			row.recent = Math.max(row.recent, video.addedAt);
			row.videoScoreSum += videoScore;
			rows.set(tag, row);
		}
	}
	const now = Date.now();
	return [...rows.entries()].map(([tag, row]) => {
		const engagement = (row.total + 9) / (row.count + 3);
		const recency = Math.max(0, 1 - (now - row.recent) / 2592e6);
		const hearted = Boolean(ctx.tagIsHearted?.(tag));
		const historic = Boolean(ctx.tagHasHeartHistory?.(tag));
		const heartBoost = hearted ? 56 : historic ? 10 : 0;
		const sparseBoost = row.count === 1 && (hearted || historic || engagement > 1.4) ? 8 : 0;
		return {
			tag,
			count: row.count,
			score: stabilizedTagScore(engagement, row.count, recency, adultTagRankBoost(tag), 1, row.videoScoreSum) + heartBoost + sparseBoost
		};
	}).filter((row) => row.count >= 1).sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, limit);
}
function rankAdultMetaTags(videos, ctx, limit = 64) {
	const rows = /* @__PURE__ */ new Map();
	for (const video of videos) {
		const engagement = ctx.ratingOf(video.id) === 1 ? -3 : Math.max(ratingPreference(ctx.ratingOf(video.id)), ctx.favorites[video.id] ? 4 : 0, ctx.likes[video.id] ? 3 : 0, Math.min(5, ctx.cameCounts[video.id] ?? 0), 1);
		const provider = adultProviderKind(video) || "other";
		const itemTags = ctx.tags[video.id] ?? [];
		for (const tag of expandedAdultTags(itemTags)) {
			if (!isAdultMetaTag(tag)) continue;
			const row = rows.get(tag) ?? {
				total: 0,
				count: 0,
				recent: 0,
				providers: /* @__PURE__ */ new Set()
			};
			row.total += engagement;
			row.count += 1;
			row.recent = Math.max(row.recent, video.addedAt);
			row.providers.add(provider);
			rows.set(tag, row);
		}
	}
	const now = Date.now();
	return [...rows.entries()].map(([tag, row]) => {
		const engagement = (row.total + 6) / (row.count + 2);
		const recency = Math.max(0, 1 - (now - row.recent) / 2592e6);
		return {
			tag,
			count: row.count,
			score: stabilizedTagScore(engagement, row.count, recency, 0, row.providers.size) + (ctx.tagIsHearted?.(tag) ? 56 : 0) + (ctx.tagHasHeartHistory?.(tag) ? 10 : 0) + (row.count === 1 && ctx.tagIsHearted?.(tag) ? 8 : 0)
		};
	}).filter((row) => row.count >= 1).sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, limit);
}
//#endregion
export { countAdultBySource as a, rankAdultMetaTags as c, videoMatchesAdultTag as d, countAdultBooruHosts as i, rankAdultTags as l, adultProviderKind as n, isAdultInterestTag as o, adultProviderKinds as r, isAdultMetaTag as s, ADULT_SOURCE_FILTERS as t, videoMatchesAdultSource as u };
