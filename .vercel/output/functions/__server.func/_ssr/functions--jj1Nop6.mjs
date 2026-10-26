import { i as validateYoutubeLiveContent, n as validateYoutubeFeed, t as LIBRARY_LIMITS } from "./youtube-contract-DMSANo43.mjs";
import { f as youtubeRendererMetadata } from "./youtube-metadata-BN08kKrN.mjs";
import { A as adultPublication, Ct as isRedditRemovalText, Dt as isYoutubeStreamsTab, Et as isUsableAdultThumb, G as canPullAdult, Gt as recentPullReady, H as advanceTwitchArchiveCursor, Kt as recentPullSuccess, Mn as youtubePublishedTime, Nt as measureAdultQuality, On as youtubeHtmlLiveEvidence, P as adultRows, Sn as validateAdultAtom, T as addAdultQuality, Tn as youtubeCatalogLiveEvidence, Ut as pickRedtubeThumb, Wt as recentPullFailure, Xt as redtubeStarNames, Y as completeKnownYoutubeEvidence, _ as MYFREECAMS_FOLDER_ID, _n as twitchPolicyAllows, at as encodeTwitchArchiveCursor, b as REDTUBE_FOLDER_ID, bn as twitchRetryPatch, ct as expandAdultThumbFallbacks, d as ADULT_REDDIT_SUBS, et as decodeTwitchArchiveCursor, g as EPORNER_FOLDER_ID, j as adultPublicationFields, jn as youtubeLiveFailure, kt as liveRoomRequest, l as ADULT_PULL_PROVIDERS, m as CHATURBATE_FOLDER_ID, ot as encodeTwitchClipCursor, p as BOORU_FOLDER_ID, pn as twitchContentEvidence, q as classifyTwitchFailure, rt as emptyAdultQuality, st as estimateProviderPayload, tt as decodeTwitchClipCursor, u as ADULT_REDDIT_PRIORITY_SUBS, ut as extractRedditFlair, v as REDDIT_FOLDER_ID, vn as twitchPullPolicy, w as YoutubeLiveEvidenceError, wt as isRedditRemovalUrl, xn as uniqueYoutubePage, y as REDGIFS_FOLDER_ID } from "./live-rooms-Wov1xeIQ.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { n as ProviderBudgetError, t as PROVIDER_BUDGETS } from "./provider-budgets-BFeaFj2c.mjs";
import { n as youtubePageChannelId, r as youtubeVideoRenderers, t as youtubeInitialData } from "./youtube-page-data-CoxyTRWJ.mjs";
import { a as fetchProviderMetadata, c as youtubeCooldownScope, i as createYoutubeManualRetry, l as youtubeRetryAt, n as assertYoutubeReady, o as fetchYoutubeResponse, r as createServerRpc, s as setYoutubeRequestGap, t as YoutubeRequestError } from "./youtube-transport-ClGDYatb.mjs";
import { a as youtubeCatalogItems, c as youtubeUploadsArchive, i as youtubeCatalogHasTerminalPage, n as youtubeBrowseArchive, o as youtubePlaylistBrowseId, r as youtubeCatalogContinuation, s as youtubePublicRequest, t as browseYoutubeCatalog } from "./youtube-browse-ClLVmFVe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions--jj1Nop6.js
async function walkTwitchClips(options) {
	const now = options.now ?? Date.now, limit = Math.max(0, Math.min(500, Math.floor(options.limit))), maxPages = Math.max(1, Math.min(8, Math.floor(options.maxPages)));
	const clips = [], seen = /* @__PURE__ */ new Set(), errors = [];
	const periods = options.variety ? options.recentOnly ? [
		null,
		"LAST_WEEK",
		"LAST_MONTH"
	] : [
		null,
		"LAST_WEEK",
		"LAST_MONTH",
		"ALL_TIME"
	] : ["ALL_TIME"];
	let cursor = decodeTwitchClipCursor(options.cursor), exhaustedAt, requests = 0;
	const diagnostics = {
		at: now(),
		mode: options.variety ? "recent" : "archive",
		requested: limit,
		maxPages,
		pages: 0,
		received: 0,
		accepted: 0,
		duplicates: 0,
		windows: []
	};
	let providerHold = false;
	const resume = /* @__PURE__ */ new Map();
	const visits = [...periods];
	for (const [index, period] of visits.entries()) {
		if (clips.length >= limit || providerHold || requests >= maxPages) break;
		const backfill = index >= periods.length;
		const window = diagnostics.windows.find((w) => w.period === (period ?? "CURRENT")) ?? {
			period: period ?? "CURRENT",
			pages: 0,
			received: 0,
			accepted: 0,
			duplicates: 0,
			requested: 0,
			stop: "budget",
			error: void 0
		};
		if (!diagnostics.windows.includes(window)) diagnostics.windows.push(window);
		let after = backfill ? resume.get(period)?.after : options.variety ? void 0 : cursor?.after, accepted = 0;
		const target = options.variety && !backfill ? Math.ceil((limit - clips.length) / (periods.length - index)) : limit;
		window.requested = (window.requested ?? 0) + Math.min(target, limit - clips.length);
		const positions = backfill ? resume.get(period).positions : new Set(after ? [after] : []);
		const pageBudget = Math.max(1, maxPages - requests - Math.max(0, periods.length - index - 1));
		for (let page = 0; page < pageBudget && requests < maxPages && clips.length < limit && accepted < target; page++) try {
			if (requests++) await options.gap();
			window.pages++;
			diagnostics.pages++;
			const connection = await options.read(period, Math.min(100, limit - clips.length, target - accepted), after);
			if (!connection || typeof connection.pageInfo?.hasNextPage !== "boolean" || !Array.isArray(connection.edges)) throw Error("Twitch returned a malformed clip page; the saved position was kept.");
			window.received += connection.edges.length;
			diagnostics.received += connection.edges.length;
			let malformed = false;
			for (const edge of connection.edges) {
				const node = edge.node, key = node?.slug || node?.id;
				if (!key) {
					malformed = true;
					continue;
				}
				if (seen.has(key)) {
					window.duplicates++;
					diagnostics.duplicates++;
					continue;
				}
				if (clips.length >= limit || accepted >= target) {
					malformed = true;
					break;
				}
				seen.add(key);
				clips.push(node);
				accepted++;
				window.accepted++;
				diagnostics.accepted++;
			}
			if (malformed) throw Error("Twitch returned an incomplete clip page; accepted clips were kept and the page will be retried.");
			const next = connection.pageInfo.endCursor || connection.edges.at(-1)?.cursor;
			if (!connection.pageInfo.hasNextPage) {
				window.stop = "exhausted";
				resume.delete(period);
				if (!options.variety) {
					cursor = void 0;
					exhaustedAt = now();
				}
				break;
			}
			if (!connection.edges.length || !next || positions.has(next)) throw Error("Twitch clip cursor stopped advancing; the saved position was kept.");
			positions.add(next);
			after = next;
			resume.set(period, {
				after: next,
				positions
			});
			if (!options.variety) cursor = { after: next };
		} catch (error) {
			window.stop = "error";
			resume.delete(period);
			window.error = (error instanceof Error ? error.message : String(error)).slice(0, 240);
			errors.push(window.period + ": " + window.error);
			providerHold = /\b429\b|rate.?limit|integrity|challenge|retry.after/i.test(window.error);
			break;
		}
		if (window.stop !== "error" && window.stop !== "exhausted") window.stop = accepted >= target || clips.length >= limit ? "quota" : "budget";
		if (options.variety && index === periods.length - 1 && clips.length < limit && requests < maxPages && !providerHold) visits.push(...resume.keys());
	}
	diagnostics.stopReason = providerHold ? "provider-hold" : errors.length ? "partial-error" : clips.length >= limit ? "quota" : requests >= maxPages && (resume.size > 0 || diagnostics.windows.length < periods.length || diagnostics.windows.some((w) => w.stop === "budget")) ? "page-budget" : "exhausted";
	return {
		clips,
		diagnostics,
		...!options.variety ? {
			cursor: encodeTwitchClipCursor(cursor),
			exhaustedAt
		} : {},
		...errors.length ? { error: errors.join("; ").slice(0, 240) } : {}
	};
}
/** Small LRU/TTL metadata cache. Weights estimate retained strings/scalars;
* they do not claim exact JavaScript heap size or include the durable library. */
function createProviderMetadataCache(options) {
	const rows = /* @__PURE__ */ new Map();
	const now = options.now ?? Date.now;
	let bytes = 0;
	const remove = (key) => {
		const row = rows.get(key);
		if (row) bytes -= row.bytes;
		rows.delete(key);
	};
	const prune = () => {
		const at = now();
		for (const [key, row] of rows) if (at - row.at >= options.ttlMs) remove(key);
	};
	return {
		delete: remove,
		get: (key) => {
			prune();
			const row = rows.get(key);
			if (!row) return;
			rows.delete(key);
			rows.set(key, row);
			return row.value;
		},
		set: (key, value, weight) => {
			prune();
			remove(key);
			if (!Number.isFinite(weight) || weight < 0 || weight > options.maxEntryBytes || weight > options.maxBytes) return false;
			while (rows.size && (rows.size >= options.maxEntries || bytes + weight > options.maxBytes)) remove(rows.keys().next().value);
			rows.set(key, {
				value,
				bytes: weight,
				at: now()
			});
			bytes += weight;
			return true;
		},
		snapshot: () => {
			prune();
			return {
				entries: rows.size,
				estimatedBytes: bytes,
				maxBytes: options.maxBytes,
				maxEntries: options.maxEntries
			};
		}
	};
}
/** Resume within a fixed provider page when the user's batch limit is smaller
* than that page. Advancing immediately would silently skip archive entries. */
function archivePageWindow(rows, page, offset, budget, nextPage) {
	const start = Math.max(0, Math.min(rows.length, Math.floor(offset)));
	const end = Math.min(rows.length, start + Math.max(0, Math.floor(budget)));
	return {
		rows: rows.slice(start, end),
		nextPage: end < rows.length ? page : nextPage,
		nextOffset: end < rows.length ? end : 0
	};
}
var STORE = /* @__PURE__ */ new Map();
var DEFAULT_TTL_MS = 6e5;
var MAX_ENTRIES = 240;
var MAX_BYTES = PROVIDER_BUDGETS.adultCacheBytes;
var MAX_BODY_BYTES = 2097152;
var cachedBytes = 0;
function remove(key) {
	const entry = STORE.get(key);
	if (entry) cachedBytes -= entry.body.length * 2;
	STORE.delete(key);
}
function prune(now) {
	for (const [key, entry] of STORE) if (now - entry.at > DEFAULT_TTL_MS * 3) remove(key);
	while (STORE.size > MAX_ENTRIES || cachedBytes > MAX_BYTES) remove(STORE.keys().next().value);
}
async function cachedAdultFetch(url, init = {}) {
	const ttl = init.cacheTtlMs ?? DEFAULT_TTL_MS;
	const { cacheTtlMs: _ttl, cacheKey, ...fetchInit } = init;
	const method = (fetchInit.method ?? "GET").toUpperCase();
	const key = cacheKey ?? `${method}:${url}`;
	const now = Date.now();
	if (method === "GET") {
		const hit = STORE.get(key);
		if (hit && now - hit.at <= ttl) return new Response(hit.body, {
			status: hit.status,
			headers: {
				"content-type": hit.contentType || "application/json",
				"x-reelcase-cache": "HIT",
				"x-reelcase-observed-at": String(hit.at)
			}
		});
	}
	const res = await fetchProviderMetadata(url, {
		...fetchInit,
		signal: fetchInit.signal ?? AbortSignal.timeout(2e4)
	});
	const contentType = res.headers.get("content-type") ?? "application/octet-stream";
	if (res.ok && method === "GET" && /json|xml|text|atom|rss/i.test(contentType)) {
		const body = await res.text();
		remove(key);
		if (body.length * 2 <= MAX_BODY_BYTES) {
			STORE.set(key, {
				at: now,
				status: res.status,
				body,
				contentType
			});
			cachedBytes += body.length * 2;
		}
		prune(now);
		return new Response(body, {
			status: res.status,
			headers: {
				"content-type": contentType,
				"x-reelcase-cache": "MISS",
				"x-reelcase-observed-at": String(now)
			}
		});
	}
	return res;
}
function decode(value) {
	let decoded = value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#32;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&apos;/g, "'");
	for (let pass = 0; pass < 2 && /&(?:amp|quot|lt|gt|#\d+|#x[\da-f]+);/i.test(decoded); pass += 1) decoded = decoded.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
	return decoded;
}
function upgradePreview(url) {
	let next = url.replace(/&amp;/g, "&");
	if (/preview\.redd\.it|external-preview\.redd\.it/i.test(next)) {
		next = next.replace(/([?&])(?:width|height)=\d+&?/gi, "$1").replace(/[?&]$/, "");
		const join = next.includes("?") ? "&" : "?";
		next = `${next}${join}width=960&auto=webp`;
	}
	return next;
}
function isImageHost(url) {
	return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) || /(?:^|\/\/)(?:i\.redd\.it|preview\.redd\.it|external-preview\.redd\.it|i\.imgur\.com|i\.redgifs\.com|thumbs\d*\.redgifs\.com|media\.redgifs\.com|i\.ibb\.co|pbs\.twimg\.com)\//i.test(url);
}
function isVideoHost(url) {
	return /(?:^|\/\/)(?:v\.redd\.it|www\.redgifs\.com|redgifs\.com|gfycat\.com|i\.redgifs\.com|media\.redgifs\.com)\//i.test(url) || /\.(mp4|webm|gifv)(\?|$)/i.test(url);
}
function isJunkLink(url) {
	return /icanhazchat|reddithelp\.com|redditstatic\.com|\/faq|sidebar rules|welcome\?gonewild/i.test(url);
}
function redgifsSlugFromUrl(raw) {
	const watch = raw.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1];
	if (watch) return watch;
	const thumb = raw.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1];
	if (thumb) return thumb;
	return raw.match(/https?:\/\/(?:i|media)\.redgifs\.com\/([a-z0-9_-]+)(?:[._-]|$)/i)?.[1];
}
function redgifsThumbFallbacks(urls) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	let watch;
	for (const raw of urls) {
		const slug = redgifsSlugFromUrl(raw);
		if (!slug) continue;
		watch ??= `https://www.redgifs.com/watch/${slug}`;
		for (const candidate of [
			`https://thumbs2.redgifs.com/${slug}-mobile.jpg`,
			`https://thumbs2.redgifs.com/${slug}-poster.jpg`,
			`https://thumbs2.redgifs.com/${slug}-thumb.jpg`,
			`https://thumbs1.redgifs.com/${slug}-mobile.jpg`,
			`https://thumbs1.redgifs.com/${slug}-poster.jpg`
		]) if (!seen.has(candidate)) {
			seen.add(candidate);
			out.push(candidate);
		}
	}
	return {
		thumbs: out,
		watch
	};
}
function collectUrls(entryXml, contentHtml) {
	const blob = `${entryXml}\n${contentHtml}`;
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (raw) => {
		const url = decode(raw).trim();
		if (!url.startsWith("http")) return;
		if (seen.has(url)) return;
		seen.add(url);
		found.push(url);
	};
	for (const match of blob.matchAll(/<media:thumbnail[^>]+url="([^"]+)"/gi)) push(match[1]);
	for (const match of blob.matchAll(/<media:content[^>]+url="([^"]+)"/gi)) push(match[1]);
	for (const match of blob.matchAll(/<img[^>]+src="([^"]+)"/gi)) push(match[1]);
	for (const match of blob.matchAll(/<(?:a|img|source|video)[^>]+(?:href|src|data-url|data-lazy-src|data-preview-url)="(https?:[^"]+)"/gi)) push(match[1]);
	for (const match of blob.matchAll(/https?:\\\/\\\/(?:i|preview|external-preview)\\\.redd\\\.it\\\/[^\s"'<]+/gi)) push(match[0].replace(/\\\//g, "/"));
	for (const match of blob.matchAll(/https?:\/\/(?:i|preview|external-preview)\.redd\.it\/[^\s"'<]+/gi)) push(match[0]);
	for (const match of blob.matchAll(/https?:\/\/(?:i\.)?imgur\.com\/[^\s"'<]+/gi)) push(match[0]);
	for (const match of blob.matchAll(/https?:\/\/(?:www\.)?redgifs\.com\/[^\s"'<]+/gi)) push(match[0]);
	for (const match of blob.matchAll(/https?:\/\/v\.redd\.it\/[^\s"'<]+/gi)) push(match[0]);
	for (const match of blob.matchAll(/https?:\/\/(?:i\.)?redd\.it\/[^\s"'<]+/gi)) push(match[0]);
	for (const match of blob.matchAll(/https?:\/\/[^\s"'<]+\.(?:jpe?g|png|gif|webp|mp4|webm)(?:\?[^\s"'<]*)?/gi)) push(match[0]);
	return found;
}
function extractRedditMedia(entryXml, contentHtml) {
	if (isRedditRemovalText(decode(contentHtml))) return {
		kind: "page",
		removed: true
	};
	const urls = collectUrls(entryXml, contentHtml);
	if (urls.some(isRedditRemovalUrl)) return {
		kind: "page",
		removed: true
	};
	const images = urls.filter((url) => isImageHost(url) && !isJunkLink(url)).map(upgradePreview);
	const videos = urls.filter((url) => isVideoHost(url) && !isJunkLink(url));
	const pages = urls.filter((url) => /reddit\.com\/gallery\//i.test(url) || /reddit\.com\/r\/[^/]+\/comments\//i.test(url));
	const redgifs = redgifsThumbFallbacks([...urls, ...videos]);
	const redgifsThumbs = redgifs.thumbs;
	const poster = images.find((url) => /i\.redd\.it/i.test(url)) ?? images.find((url) => /preview\.redd\.it/i.test(url)) ?? images.find((url) => /i\.imgur\.com/i.test(url)) ?? images[0];
	if (videos.length) return {
		kind: "video",
		poster,
		src: videos.find((url) => /\.(mp4|webm|gifv)(\?|$)/i.test(url)),
		watch: videos[0] ?? redgifs.watch,
		thumbFallbacks: [poster, ...redgifsThumbs].filter((url) => Boolean(url))
	};
	if (poster) return {
		kind: "image",
		poster,
		src: /i\.redd\.it|i\.imgur\.com|\.(jpe?g|png|gif|webp)(\?|$)/i.test(poster) ? poster : poster,
		watch: pages[0] ?? redgifs.watch,
		thumbFallbacks: [poster, ...redgifsThumbs].filter((url) => Boolean(url))
	};
	if (redgifs.watch) return {
		kind: "video",
		watch: redgifs.watch,
		thumbFallbacks: redgifsThumbs
	};
	return {
		kind: "page",
		watch: pages[0]
	};
}
function shouldKeepRedditEntry(media, title) {
	if (media.removed || isRedditRemovalText(title)) return false;
	if (media.kind === "image" || media.kind === "video") return true;
	if (/welcome|faq|sidebar|chatters|on cam/i.test(title)) return false;
	return false;
}
function selectYoutubeFeedDelta(entries, newestKnownVideoId, fallbackLimit = 24) {
	const limit = Math.max(1, Math.floor(fallbackLimit) || 1);
	if (!newestKnownVideoId) return entries.slice(0, limit);
	const cursorIndex = entries.findIndex((entry) => entry.videoId === newestKnownVideoId);
	return cursorIndex < 0 ? entries.slice(0, limit) : entries.slice(0, cursorIndex);
}
function newestYoutubeFeedVideoId(entries) {
	return entries.find((entry) => typeof entry.videoId === "string" && entry.videoId.length > 0)?.videoId;
}
/** A Gelbooru-style post page can show a resized sample while linking the original. */
function booruPostImageUrls(html) {
	const attribute = (markup, name) => markup.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2];
	const anchor = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].filter((match) => /(?:original (?:image|file)|view (?:the )?original|download)/i.test(match[2].replace(/<[^>]*>/g, " ")) || /\bdownload(?:\s|=|$)/i.test(match[1])).map((match) => attribute(match[1], "href")).find(Boolean);
	const sample = (html.match(/<img\b(?=[^>]*\bid\s*=\s*["']image["'])[^>]*>/i)?.[0])?.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
	const file = html.match(/\bdata-(?:file-url|original(?:-url)?)\s*=\s*(["'])(.*?)\1/i)?.[2];
	const fullImage = sample && !/(?:thumb(?:nail)?s?|samples?|resized|\/preview\/)/i.test(sample) ? sample : void 0;
	return {
		original: (file || anchor || fullImage)?.replaceAll("&amp;", "&"),
		sample: sample?.replaceAll("&amp;", "&")
	};
}
function youtubePlaylistId(input) {
	try {
		const url = new URL(input.trim());
		if (!/(^|\.)youtube\.com$/i.test(url.hostname)) return null;
		const id = url.searchParams.get("list") ?? "";
		return /^[A-Za-z0-9_-]{10,80}$/.test(id) ? id : null;
	} catch {
		return null;
	}
}
function text(value) {
	return value?.simpleText ?? value?.runs?.map((run) => run.text ?? "").join("") ?? "";
}
function publicPlaylistEntries(root, limit) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const stack = [root];
	while (stack.length && out.length < limit) {
		const item = stack.pop();
		if (!item || typeof item !== "object") continue;
		if (Array.isArray(item)) {
			for (let i = item.length - 1; i >= 0; i--) stack.push(item[i]);
			continue;
		}
		const record = item;
		const renderer = record.playlistVideoRenderer ?? record.playlistPanelVideoRenderer;
		if (renderer?.videoId && !seen.has(renderer.videoId)) {
			seen.add(renderer.videoId);
			out.push({
				id: renderer.videoId,
				title: text(renderer.title) || renderer.videoId,
				channelName: text(renderer.shortBylineText) || "YouTube",
				thumb: renderer.thumbnail?.thumbnails?.at(-1)?.url,
				metadata: youtubeRendererMetadata(renderer)
			});
		}
		const lockup = record.lockupViewModel;
		if (lockup?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" && lockup.contentId && !seen.has(lockup.contentId)) {
			seen.add(lockup.contentId);
			out.push({
				id: lockup.contentId,
				title: lockup.metadata?.lockupMetadataViewModel?.title?.content || lockup.contentId,
				channelName: lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || "YouTube",
				thumb: lockup.contentImage?.thumbnailViewModel?.image?.sources?.at(-1)?.url,
				metadata: youtubeRendererMetadata(youtubeVideoRenderers({ lockupViewModel: lockup }, 1)[0] ?? {})
			});
		}
		for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
	}
	return out;
}
function publicPlaylistTitle(root) {
	const stack = [root];
	while (stack.length) {
		const item = stack.pop();
		if (!item || typeof item !== "object") continue;
		if (Array.isArray(item)) {
			stack.push(...item);
			continue;
		}
		const record = item;
		const header = record.playlistHeaderRenderer ?? record.pageHeaderViewModel ?? record.pageHeaderRenderer;
		if (header?.title) {
			const title = text(header.title) || header.title.dynamicTextViewModel?.text?.content;
			if (title) return title;
		}
		if (header?.pageTitle) return header.pageTitle;
		stack.push(...Object.values(record).filter((value) => value && typeof value === "object"));
	}
	return null;
}
var normalized = (value) => value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
function exactYoutubeChannelData(data, query) {
	const matches = /* @__PURE__ */ new Set(), stack = [data];
	const expected = normalized(query);
	if (!expected) return null;
	while (stack.length) {
		const node = stack.pop();
		if (!node || typeof node !== "object") continue;
		const row = node;
		const channel = row.channelRenderer;
		const title = channel?.title?.simpleText ?? channel?.title?.runs?.map((run) => run.text ?? "").join("") ?? "";
		if (/^UC[\w-]{20,}$/.test(channel?.channelId ?? "") && normalized(title) === expected) matches.add(channel.channelId);
		for (const value of Object.values(row)) if (value && typeof value === "object") stack.push(value);
	}
	return matches.size === 1 ? [...matches][0] : null;
}
/** Names are search queries, never guessed handles. Explicit links must return
* a channel browse endpoint rather than a video/playlist/recommended channel. */
async function resolveYoutubeCreator(query, retry) {
	const text = query.trim().replaceAll("\\_", "_");
	if (/^UC[A-Za-z0-9_-]{22}$/.test(text)) return text;
	const explicit = /^(?:@|https?:\/\/|(?:www\.)?youtube\.com\/)/i.test(text);
	let id = null;
	if (explicit) {
		const url = text.startsWith("@") ? `https://www.youtube.com/${text}` : /^https?:\/\//i.test(text) ? text : `https://${text}`;
		const parsed = new URL(url);
		if (!/(^|\.)youtube\.com$/i.test(parsed.hostname)) throw new Error("Use a YouTube channel URL or @handle.");
		const direct = parsed.pathname.match(/^\/channel\/(UC[A-Za-z0-9_-]{22})(?:\/|$)/)?.[1];
		if (direct) return direct;
		id = (await youtubePublicRequest("navigation/resolve_url", { url }, retry)).endpoint?.browseEndpoint?.browseId ?? null;
	} else id = exactYoutubeChannelData(await youtubePublicRequest("search", {
		query: text,
		params: "EgIQAg=="
	}, retry), text);
	if (!id || !/^UC[A-Za-z0-9_-]{22}$/.test(id)) throw new Error("No unique exact YouTube channel match. Paste the creator’s @handle or channel URL; its videos were kept.");
	return id;
}
var ENDPOINT_TTL = 216e5;
var YoutubeLiveLayoutError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "YoutubeLiveLayoutError";
	}
};
/** Only a changed public layout/endpoint merits navigation recovery. Retrying
* timeouts, server failures or a body-budget error through Home and HTML can
* turn one eight-second failure into three expensive requests. */
function canRecoverYoutubeLiveLayout(error) {
	return error instanceof YoutubeLiveLayoutError || error instanceof SyntaxError || error instanceof YoutubeRequestError && (error.status === 400 || error.status === 404) && !error.retryAt;
}
/** Cache navigation endpoints, never live answers. A fresh Streams response is
* required on every check. Reused params must confirm creator and Streams tab. */
function createYoutubeLiveReader(read, now = () => Date.now()) {
	const endpoints = /* @__PURE__ */ new Map();
	const inflight = /* @__PURE__ */ new Map();
	let shared;
	const tabsFor = (page, id) => {
		if (page?.metadata?.channelMetadataRenderer?.externalId !== id) throw new YoutubeLiveLayoutError("YouTube did not confirm the requested live creator.");
		const tabs = page.contents?.twoColumnBrowseResultsRenderer?.tabs;
		if (!Array.isArray(tabs)) throw new YoutubeLiveLayoutError("YouTube returned an unreadable channel tab list.");
		return tabs;
	};
	const isStreams = isYoutubeStreamsTab;
	const observationsFor = (page, id) => {
		const selected = tabsFor(page, id).find((row) => row.tabRenderer?.selected)?.tabRenderer;
		if (!selected?.content || typeof selected.content !== "object") throw new YoutubeLiveLayoutError("YouTube returned an incomplete channel tab; the previous live observation was kept.");
		try {
			validateYoutubeLiveContent(selected.content);
			return youtubeCatalogLiveEvidence(page, id, now());
		} catch (error) {
			throw new YoutubeLiveLayoutError(error instanceof Error ? error.message : "YouTube returned an unreadable live catalog.");
		}
	};
	const remember = (id, params) => {
		endpoints.delete(id);
		endpoints.set(id, {
			params,
			at: now()
		});
		while (endpoints.size > 4096) endpoints.delete(endpoints.keys().next().value);
		if (params) shared = {
			params,
			at: now()
		};
	};
	const streamsPage = async (id, params) => {
		const page = await read({
			browseId: id,
			params
		});
		const selected = tabsFor(page, id).find((row) => row.tabRenderer?.selected)?.tabRenderer;
		return {
			page,
			selected,
			confirmed: isStreams(selected)
		};
	};
	const load = async (id) => {
		const cached = endpoints.get(id);
		const endpoint = cached && now() - cached.at < ENDPOINT_TTL ? cached : void 0;
		const common = shared && now() - shared.at < ENDPOINT_TTL ? shared : void 0;
		const params = endpoint ? endpoint.params : common?.params;
		let home;
		if (params) try {
			const result = await streamsPage(id, params);
			if (result.confirmed) {
				const lives = observationsFor(result.page, id);
				remember(id, params);
				return lives;
			}
			home = result.page;
		} catch (error) {
			if (!canRecoverYoutubeLiveLayout(error)) throw error;
			endpoints.delete(id);
		}
		home ??= await read({ browseId: id });
		const tabs = tabsFor(home, id);
		const streams = tabs.find((row) => isStreams(row.tabRenderer))?.tabRenderer;
		if (!streams) {
			const lives = observationsFor(home, id);
			remember(id);
			return lives;
		}
		const target = streams.endpoint?.browseEndpoint;
		if (streams.selected) {
			if (target?.browseId === id && typeof target.params === "string" && target.params.length <= 512) remember(id, target.params);
			return observationsFor(home, id);
		}
		if (target?.browseId !== id || typeof target.params !== "string" || !target.params || target.params.length > 512) throw new YoutubeLiveLayoutError("YouTube Streams tab has no readable channel endpoint.");
		const result = await streamsPage(id, target.params);
		if (!result.confirmed) throw new YoutubeLiveLayoutError("YouTube did not confirm the Streams tab; the previous live observation was kept.");
		const lives = observationsFor(result.page, id);
		const selected = tabs.find((row) => row.tabRenderer?.selected)?.tabRenderer;
		let homeLives = [];
		if (selected?.content) try {
			homeLives = observationsFor(home, id).observations;
		} catch {}
		remember(id, target.params);
		const observations = [...new Map([...homeLives, ...lives.observations].map((row) => [row.id, row])).values()].slice(0, 64);
		return {
			...lives,
			observations,
			evidence: {
				...lives.evidence,
				state: observations.length ? "live" : lives.evidence.state
			}
		};
	};
	const inspect = (channelId) => {
		if (!/^UC[A-Za-z0-9_-]{20,}$/.test(channelId)) return Promise.reject(/* @__PURE__ */ new Error("A verified YouTube channel is required for live checks."));
		const pending = inflight.get(channelId);
		if (pending) return pending;
		const task = load(channelId).finally(() => inflight.delete(channelId));
		inflight.set(channelId, task);
		return task;
	};
	const rowInflight = /* @__PURE__ */ new Map();
	const readRows = (channelId) => {
		const pending = rowInflight.get(channelId);
		if (pending) return pending;
		const task = inspect(channelId).then((result) => result.observations).finally(() => rowInflight.delete(channelId));
		rowInflight.set(channelId, task);
		return task;
	};
	return Object.assign(readRows, { inspect });
}
var browseYoutubeLives = createYoutubeLiveReader((target) => browseYoutubeCatalog(target, void 0, true));
var record = (v) => !!v && typeof v === "object" && !Array.isArray(v);
function validateTwitchLiveUser(value) {
	if (!record(value) || typeof value.id !== "string" || !value.id.trim() || value.id.length > 128) throw Error("Twitch returned a malformed live user identity; the prior observation was kept.");
	if (!Object.hasOwn(value, "stream") || value.stream !== null && (!record(value.stream) || !Number.isSafeInteger(value.stream.viewersCount) || value.stream.viewersCount < 0)) throw Error("Twitch returned a malformed stream/viewer observation; the prior observation was kept.");
	const text = (v, max) => typeof v === "string" ? v.slice(0, max) : void 0;
	const stream = value.stream === null ? null : {
		title: text(value.stream.title, 512),
		viewersCount: value.stream.viewersCount,
		previewImageURL: text(value.stream.previewImageURL, 2048),
		...record(value.stream.game) && typeof value.stream.game.name === "string" ? { game: { name: value.stream.game.name.slice(0, 256) } } : {}
	};
	return {
		id: value.id,
		displayName: text(value.displayName, 256),
		profileImageURL: text(value.profileImageURL, 2048),
		stream
	};
}
async function readTwitchLiveBatch(logins, read) {
	const found = /* @__PURE__ */ new Map();
	const unique = [...new Set(logins.filter((login) => /^[a-z0-9_]{1,25}$/i.test(login)).map((login) => login.toLowerCase()))];
	let cursor = 0;
	await Promise.all(Array.from({ length: Math.min(2, Math.ceil(unique.length / 12)) }, async () => {
		while (cursor < unique.length) {
			const offset = cursor;
			cursor += 12;
			const batch = unique.slice(offset, offset + 12), variables = Object.fromEntries(batch.map((login, index) => ["l" + index, login]));
			const query = "query(" + batch.map((_, i) => "$l" + i + ":String!").join(",") + "){" + batch.map((_, i) => "c" + i + ":user(login:$l" + i + "){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}}}").join(" ") + "}";
			try {
				const result = await read(query, variables);
				for (const [index, login] of batch.entries()) {
					const alias = "c" + index;
					try {
						if (!record(result) || result.errors !== void 0 && !Array.isArray(result.errors)) throw Error("Twitch returned a malformed live batch envelope; the prior observation was kept.");
						const errors = result.errors ?? [], global = errors.find((e) => !e || !Array.isArray(e.path) || !e.path.length);
						if (global) throw Error("Twitch live request failed: " + (typeof global.message === "string" ? global.message.slice(0, 180) : "provider error"));
						const own = errors.filter((e) => e.path?.[0] === alias);
						if (!record(result.data) || !Object.hasOwn(result.data, alias)) throw Error("Twitch returned an incomplete live response; the prior observation was kept.");
						const value = result.data[alias], user = validateTwitchLiveUser(value);
						const critical = own.find((e) => {
							const p = e.path;
							return p.length < 2 || p[1] === "id" || p[1] === "stream" && (p.length < 3 || p[2] === "viewersCount" || user.stream === null);
						});
						if (critical) throw Error("Twitch live check failed: " + (typeof critical.message === "string" ? critical.message.slice(0, 180) : "provider field error"));
						found.set(login, {
							user,
							...own.length ? { warning: "Optional Twitch metadata was unavailable; stream state and viewer count were verified." } : {}
						});
					} catch (error) {
						found.set(login, { error: error instanceof Error ? error : Error("Twitch returned a malformed creator observation.") });
					}
				}
			} catch (error) {
				for (const login of batch) found.set(login, { error: error instanceof Error ? error : Error("Twitch live transport failed; prior observations were kept.") });
			}
		}
	}));
	return found;
}
/** Keep only accepted pages. A later challenge must not discard earlier data or
* publish a position beyond an unreadable, oversized or non-advancing page. */
async function walkTwitchArchive(options) {
	let cursor = decodeTwitchArchiveCursor(options.savedCursor);
	let first = null;
	const edges = [];
	const seen = /* @__PURE__ */ new Set();
	const diagnostics = {
		at: Date.now(),
		pages: 0,
		received: 0,
		accepted: 0,
		duplicates: 0,
		resumed: Boolean(options.savedCursor),
		stopReason: "page-budget",
		stage: cursor.stage
	};
	for (let i = 0; i < options.maxPages && cursor && edges.length < options.limit; i++) {
		if (i) await options.gap();
		diagnostics.stage = cursor.stage;
		const requested = Math.max(1, Math.min(100, options.pageSize, options.limit - edges.length));
		let page;
		try {
			page = await options.read(cursor, requested);
			if (!page?.id) throw new Error("Twitch returned no readable archive page");
			if (page.videos?.providerError) throw new Error(typeof page.videos.providerError === "string" ? page.videos.providerError : "Twitch rejected the archive page");
			if (!page.videos || !Array.isArray(page.videos.edges) || typeof page.videos.pageInfo?.hasNextPage !== "boolean") throw new Error("Twitch returned a malformed archive connection");
		} catch (error) {
			if (!first) throw error;
			diagnostics.error = (error instanceof Error ? error.message : String(error)).slice(0, 240);
			diagnostics.stopReason = /integrity|challenge/i.test(diagnostics.error) ? "challenge" : "provider-error";
			break;
		}
		first ??= page;
		diagnostics.pages++;
		const rows = page.videos.edges;
		const observedAt = Date.now();
		diagnostics.received += rows.length;
		let lastAccepted;
		let skipped = false;
		for (const edge of rows) {
			const id = edge.node?.id;
			if (!id) {
				skipped = true;
				continue;
			}
			if (seen.has(id)) {
				diagnostics.duplicates++;
				continue;
			}
			if (edges.length >= options.limit) {
				skipped = true;
				continue;
			}
			seen.add(id);
			edges.push({
				...edge,
				broadcastType: cursor.stage,
				observedAt
			});
			lastAccepted = id;
		}
		diagnostics.accepted = edges.length;
		if (lastAccepted) diagnostics.lastVideoId = lastAccepted;
		if (skipped) {
			diagnostics.stopReason = "incomplete-page";
			diagnostics.error = "Twitch returned a malformed or oversized archive page; the safe position was preserved.";
			break;
		}
		const info = page.videos.pageInfo;
		const end = info.endCursor ?? rows.at(-1)?.cursor ?? null;
		if (info.hasNextPage && (!rows.length || !end || end.length > 4096 || end === cursor.after)) {
			diagnostics.stopReason = "stalled";
			diagnostics.error = "Twitch public archive page stopped advancing; the safe position was preserved.";
			break;
		}
		cursor = advanceTwitchArchiveCursor(cursor, info.hasNextPage === true, end);
		if (!cursor) diagnostics.stopReason = "exhausted";
		else if (edges.length >= options.limit) diagnostics.stopReason = "entry-budget";
	}
	return {
		first,
		edges,
		cursor: encodeTwitchArchiveCursor(cursor),
		exhaustedAt: cursor ? void 0 : Date.now(),
		diagnostics
	};
}
var providerInflight = /* @__PURE__ */ new Map();
var providerFailures = /* @__PURE__ */ new Map();
function providerKey(provider, handle) {
	return `${provider}:${handle.trim().toLowerCase()}`;
}
function retryAtFor(provider, handle) {
	return providerFailures.get(providerKey(provider, handle))?.retryAt;
}
/** Turn public-provider failures into a small, actionable local diagnosis.
* This never changes cached cards: the refresh merge is intentionally additive
* when a channel does not reach a healthy response. */
function classifyProviderFailure(provider, error) {
	if (provider === "twitch") return classifyTwitchFailure(error);
	const message = (error instanceof Error ? error.message : String(error || "Unknown provider failure")).replace(/\s+/g, " ").trim().slice(0, 240) || "Unknown provider failure";
	const lower = message.toLowerCase();
	const common = {
		message,
		at: Date.now(),
		...error instanceof YoutubeRequestError && error.retryAt ? {
			retryAt: error.retryAt,
			cooldownScope: error.cooldownScope
		} : {}
	};
	if (error instanceof ProviderBudgetError || /metadata.*(?:budget|queue)|response budget/.test(lower)) return {
		...common,
		kind: "response-budget",
		recovery: "This metadata response exceeded a memory or queue budget. Accepted pages and saved positions are preserved; retry later. This does not reduce your archive target."
	};
	if (/\b429\b|rate.?limit|too many requests|retrying after/.test(lower)) return {
		...common,
		kind: "rate-limited",
		recovery: `${provider === "youtube" ? "Automatic YouTube pulls wait for the recommended cooldown. You can force a fresh pull from the YouTube page." : "Twitch pulls wait for the provider cooldown before retrying."} Cached cards and archive positions are preserved.`
	};
	if (/integrity|challenge/.test(lower)) return {
		...common,
		kind: "integrity-challenge",
		recovery: "Twitch accepted the cached archive but requires its public integrity check for deeper pages. Try a focused pull later; no cached VODs were removed."
	};
	if (/page.?limit|first.*100|public.*page/.test(lower)) return {
		...common,
		kind: "public-page-limit",
		recovery: "The public archive stopped advancing. Keep the accepted pages and try a later focused pull rather than increasing the routine budget."
	};
	if (/json|parse|malformed|invalid response|unexpected token/.test(lower)) return {
		...common,
		kind: "malformed",
		recovery: "The provider returned an unreadable response. Cached cards remain available; retry this channel after the provider recovers."
	};
	if (/\b404\b|\b410\b|could not (find|resolve)|not found|unavailable|does not exist/.test(lower)) return {
		...common,
		kind: "unavailable",
		recovery: "The public channel or item is unavailable right now. Keep its cached cards and confirm the creator link before removing anything."
	};
	return {
		...common,
		kind: "network-offline",
		recovery: "The provider could not be reached. Cached cards remain available and Realhub will retry after the shown cooldown."
	};
}
/** Share identical work across browser tabs and suppress only background retries. */
async function providerRequest(provider, handle, focused, work, failureHandle = handle) {
	const key = providerKey(provider, handle);
	const failureKey = providerKey(provider, failureHandle);
	const cooling = providerFailures.get(failureKey);
	if (provider === "youtube" && !focused && cooling && cooling.retryAt > Date.now()) throw new Error(`${provider} is retrying after ${new Date(cooling.retryAt).toLocaleTimeString()}`);
	const existing = providerInflight.get(key);
	if (existing) return existing;
	const pending = work().then((result) => {
		if (provider === "youtube") providerFailures.delete(failureKey);
		return result;
	}).catch((error) => {
		if (provider === "twitch") throw error;
		const previous = providerFailures.get(failureKey);
		const attempts = Math.min(8, (previous?.attempts ?? 0) + 1);
		providerFailures.set(failureKey, {
			attempts,
			retryAt: Date.now() + Math.min(3e5, 15e3 * 2 ** (attempts - 1))
		});
		if (providerFailures.size > 512) {
			const now = Date.now();
			for (const [entryKey, failure] of providerFailures) if (failure.retryAt < now) providerFailures.delete(entryKey);
			while (providerFailures.size > 512) providerFailures.delete(providerFailures.keys().next().value);
		}
		throw error;
	}).finally(() => providerInflight.delete(key));
	providerInflight.set(key, pending);
	return pending;
}
function asString(v) {
	return typeof v === "string" ? v : "";
}
function parseFollow(data) {
	if (typeof data !== "object" || data === null) throw new Error("Enter a channel or URL");
	const rec = data;
	const query = asString(rec.query).trim();
	if (!query) throw new Error("Enter a channel or URL");
	const kind = rec.kind === "youtube" || rec.kind === "twitch" ? rec.kind : "auto";
	if (rec.twitchClipMode !== void 0 && !["recent", "archive"].includes(String(rec.twitchClipMode))) throw new Error("Choose recent or archive Twitch clips.");
	const twitchClipMode = rec.twitchClipMode;
	if (rec.freshTwitchClips !== void 0 && typeof rec.freshTwitchClips !== "boolean") throw new Error("Fresh clip read must be true or false.");
	if (rec.freshTwitchClips === true && !twitchClipMode) throw new Error("A fresh clip read requires a clip update mode.");
	const freshTwitchClips = rec.freshTwitchClips === true;
	const rawClips = typeof rec.clipLimit === "number" ? rec.clipLimit : Number(rec.clipLimit);
	const clipLimit = Number.isFinite(rawClips) && rawClips >= 0 ? Math.min(LIBRARY_LIMITS.twitchFocusedClipsPerChannel, Math.floor(rawClips)) : void 0;
	if (twitchClipMode && clipLimit === 0) throw new Error("Choose at least one clip for a clip update.");
	const catalogCursor = typeof rec.catalogCursor === "string" && rec.catalogCursor.length <= 16384 ? rec.catalogCursor : void 0;
	const twitchArchiveCursor = typeof rec.twitchArchiveCursor === "string" && rec.twitchArchiveCursor.length <= 16384 ? rec.twitchArchiveCursor : void 0;
	const twitchClipCursor = typeof rec.twitchClipCursor === "string" && rec.twitchClipCursor.length <= 8192 ? rec.twitchClipCursor : void 0;
	const twitchVodLimit = typeof rec.twitchVodLimit === "number" && Number.isFinite(rec.twitchVodLimit) ? Math.max(100, Math.min(TWITCH_FOCUSED_VOD_LIMIT, Math.floor(rec.twitchVodLimit))) : void 0;
	return {
		query,
		kind,
		...freshTwitchClips ? { freshTwitchClips: true } : {},
		...twitchClipMode ? { twitchClipMode } : {},
		...clipLimit !== void 0 ? { clipLimit } : {},
		...twitchVodLimit ? { twitchVodLimit } : {},
		...catalogCursor ? { catalogCursor } : {},
		...twitchArchiveCursor ? { twitchArchiveCursor } : {},
		...twitchClipCursor ? { twitchClipCursor } : {}
	};
}
function parseRefresh(data) {
	if (typeof data !== "object" || data === null) return {
		channels: [],
		youtubeCatalog: false,
		youtubeBackground: false,
		youtubeLiveOnly: false,
		twitchLiveOnly: false,
		twitchRoutine: false
	};
	const rec = data;
	const channels = Array.isArray(rec.channels) ? rec.channels : [];
	const limit = Number(rec.youtubeVideoLimit);
	return {
		twitchApplyPolicy: rec.twitchApplyPolicy === true,
		channels: channels.slice(0, rec.twitchLiveOnly === true && channels.every((channel) => channel.kind === "twitch") ? 100 : 80),
		youtubeCatalog: rec.youtubeCatalog === true,
		youtubeBackground: rec.youtubeBackground === true,
		youtubeLiveOnly: rec.youtubeLiveOnly === true,
		twitchLiveOnly: rec.twitchLiveOnly === true,
		twitchRoutine: rec.twitchRoutine === true,
		twitchContinueArchive: rec.twitchContinueArchive === true && rec.youtubeLiveOnly !== true && rec.twitchLiveOnly !== true,
		forceYoutube: rec.forceYoutube === true && rec.youtubeCatalog === true && rec.youtubeBackground !== true && rec.youtubeLiveOnly !== true && rec.twitchLiveOnly !== true && rec.twitchRoutine !== true,
		youtubeVideoLimit: Number.isFinite(limit) ? Math.max(30, Math.min(500, Math.floor(limit))) : 100
	};
}
function guessKind(query) {
	const q = query.toLowerCase();
	if (q.includes("twitch.tv") || q.startsWith("tw:")) return "twitch";
	if (q.includes("youtube") || q.includes("youtu.be") || q.startsWith("@")) return "youtube";
	return "youtube";
}
function ytVideoId(input) {
	try {
		if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
		const url = new URL(input.startsWith("http") ? input : `https://${input}`);
		if (url.hostname.includes("youtu.be")) {
			const id = url.pathname.split("/").filter(Boolean)[0];
			return id && id.length === 11 ? id : null;
		}
		if (url.searchParams.get("v")) return url.searchParams.get("v");
		const parts = url.pathname.split("/").filter(Boolean);
		if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") return parts[1] ?? null;
	} catch {
		return null;
	}
	return null;
}
function ytChannelIdFromText(text) {
	return youtubePageChannelId(text);
}
function youtubeChannelAvatar(html) {
	const avatar = (html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ?? html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i))?.[1] ?? html.match(/"avatar"\s*:\s*\{[^}]*"url"\s*:\s*"([^"]+)"/i)?.[1];
	return avatar && /^https:\/\/[^\s]+$/i.test(avatar) ? decodeXml(avatar) : void 0;
}
/** Fill artwork for older saved follows without pulling every channel archive. */
async function runYoutubeCreatorProfiles(dataRaw) {
	const ids = Array.isArray(dataRaw) ? dataRaw.filter((id) => typeof id === "string" && /^yt:UC[A-Za-z0-9_-]{20,}$/.test(id)).slice(0, 16) : [];
	const results = [];
	for (let start = 0; start < ids.length; start += 4) {
		const batch = await Promise.all(ids.slice(start, start + 4).map(async (id) => {
			try {
				const html = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(id.slice(3))}`);
				const thumb = youtubeChannelAvatar(html);
				const description = decodeXml(html.match(/<meta\s+(?:name|property)=["']description["']\s+content=["']([^"']+)["']/i)?.[1] ?? "").slice(0, 400);
				return {
					id,
					...thumb ? { thumb } : {},
					...description ? { description } : {}
				};
			} catch {
				return { id };
			}
		}));
		results.push(...batch);
	}
	return results;
}
function decodeXml(s) {
	return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}
function tag(xml, name) {
	const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
	return m ? decodeXml(m[1]).trim() : "";
}
async function fetchText(url, manualRetry, scope) {
	const youtube = new URL(url).hostname === "www.youtube.com";
	const headers = {
		"user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai) AppleWebKit/537.36",
		accept: "text/html,application/xhtml+xml,application/xml,application/json"
	};
	const res = await (youtube ? fetchYoutubeResponse(url, {
		timeoutMs: 12e3,
		headers,
		manualRetry,
		scope
	}) : fetchProviderMetadata(url, {
		signal: AbortSignal.timeout(12e3),
		headers
	}));
	if (!res.ok) throw new Error(`HTTP ${res.status}: Could not reach ${url}`);
	return res.text();
}
function applyYoutubePullPacing(data) {
	if (data && typeof data === "object") setYoutubeRequestGap(data.youtubeRequestGapMs);
}
function ytVideo(entry) {
	const rssDate = youtubePublishedTime(entry.published);
	const published = rssDate || youtubePublishedTime(entry.metadata?.published ?? "");
	const publicationValue = rssDate ? entry.published : entry.metadata?.published;
	const publishedLabel = entry.metadata?.publishedLabel;
	const live = entry.live ?? (entry.metadata?.youtubeType === "live" ? true : entry.metadata?.youtubeType ? false : void 0);
	return {
		id: `yt:${entry.id}`,
		folderId: `yt:${entry.channelId}`,
		name: entry.title,
		path: `youtube/${entry.channelName}/${entry.title}`,
		extension: "yt",
		mime: "video/youtube",
		size: 0,
		duration: entry.duration ?? entry.metadata?.duration,
		addedAt: published,
		tagline: entry.desc.slice(0, 180),
		description: entry.desc.slice(0, 800),
		poster: entry.thumb || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
		src: `https://www.youtube.com/embed/${entry.id}`,
		remote: {
			kind: "youtube",
			videoId: entry.id,
			channelId: entry.channelId,
			channelName: entry.channelName,
			live,
			publishedSource: published ? rssDate ? "rss" : "provider" : "unknown",
			...published ? {
				publishedPrecision: publicationValue?.length === 10 ? "day" : "instant",
				...publicationValue?.length === 10 ? { publishedDate: publicationValue } : {}
			} : publishedLabel ? {
				publishedPrecision: "relative",
				publishedLabel,
				publishedLabelAt: Date.now()
			} : {},
			...entry.metadata?.youtubeType ? { youtubeType: entry.metadata.youtubeType } : live ? { youtubeType: "live" } : {},
			...live ? {
				observedAt: Date.now(),
				liveOfflineSince: void 0
			} : {},
			views: entry.views,
			embedUrl: `https://www.youtube.com/embed/${entry.id}`,
			watchUrl: `https://www.youtube.com/watch?v=${entry.id}`,
			previewUrl: `https://i.ytimg.com/an_webp/${entry.id}/mqdefault_6s.webp`
		}
	};
}
var YOUTUBE_CHANNEL_CACHE_TTL_MS = 24e4;
var YOUTUBE_CHANNEL_CACHE_LIMIT = 12;
var YOUTUBE_DEEP_CACHE_MAX_VIDEOS = PROVIDER_BUDGETS.warmCacheRows;
var youtubeChannelCache = createProviderMetadataCache({
	maxEntries: YOUTUBE_CHANNEL_CACHE_LIMIT,
	maxBytes: PROVIDER_BUDGETS.youtubeCacheBytes,
	maxEntryBytes: PROVIDER_BUDGETS.warmCacheEntryBytes,
	ttlMs: YOUTUBE_CHANNEL_CACHE_TTL_MS
});
function rendererText(value) {
	return value?.simpleText ?? value?.runs?.map((run) => run.text ?? "").join("") ?? "";
}
function parsePublicViewCount(text) {
	const match = text.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?\s+(?:views|watching)/i);
	if (!match) return void 0;
	const value = Number(match[1]);
	const multiplier = match[2]?.toUpperCase() === "B" ? 1e9 : match[2]?.toUpperCase() === "M" ? 1e6 : match[2]?.toUpperCase() === "K" ? 1e3 : 1;
	return Number.isFinite(value) ? Math.round(value * multiplier) : void 0;
}
function youtubeRenderers(root, maximum) {
	return youtubeVideoRenderers(youtubeCatalogItems(root), maximum);
}
function channelPageRenderers(html) {
	const root = youtubeInitialData(html);
	return root ? youtubeRenderers(root, LIBRARY_LIMITS.youtubeFocusedVideosPerChannel) : [];
}
function youtubeContinuation(root) {
	const stack = [root];
	while (stack.length) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			for (let index = current.length - 1; index >= 0; index -= 1) stack.push(current[index]);
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
			const value = record[key];
			if (value && typeof value === "object" && typeof value.continuation === "string") return value.continuation;
		}
		const endpoint = record.continuationEndpoint;
		if (endpoint && typeof endpoint === "object") {
			const endpointRecord = endpoint;
			const endpointCommand = endpointRecord.continuationCommand;
			if (endpointCommand && typeof endpointCommand === "object" && typeof endpointCommand.token === "string") return endpointCommand.token;
			const endpointNext = endpointRecord.nextContinuationData;
			if (endpointNext && typeof endpointNext === "object" && typeof endpointNext.continuation === "string") return endpointNext.continuation;
		}
		for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
	}
	return null;
}
function youtubeBrowseConfig(html, root) {
	const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
	const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
	const continuation = youtubeCatalogContinuation(root);
	return apiKey ? {
		apiKey,
		clientVersion,
		continuation
	} : null;
}
async function youtubeContinuationBackfill(html, knownIds, channelId, channelName, limit, resumeCursor, manualRetry) {
	const root = youtubeInitialData(html);
	const config = root ? youtubeBrowseConfig(html, root) : null;
	if (!config) return {
		videos: [],
		cursor: resumeCursor ?? null,
		completed: false
	};
	if (limit <= 0) return {
		videos: [],
		cursor: resumeCursor ?? config.continuation,
		completed: false
	};
	const seen = new Set(knownIds);
	const videos = [];
	const addPageVideos = (pageData) => {
		const pageVideos = uniqueYoutubePage(youtubeRenderers(pageData, 500), seen);
		for (const renderer of pageVideos) {
			const id = renderer.videoId;
			if (!id) continue;
			const thumb = renderer.thumbnail?.thumbnails?.at(-1)?.url;
			videos.push(ytVideo({
				id,
				title: rendererText(renderer.title) || `${channelName} video`,
				published: "",
				metadata: youtubeRendererMetadata(renderer),
				thumb: thumb || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				desc: rendererText(renderer.descriptionSnippet) || `${channelName} public channel catalog item.`,
				channelId,
				channelName,
				views: parsePublicViewCount(rendererText(renderer.viewCountText))
			}));
		}
	};
	let continuation = resumeCursor ?? config.continuation;
	const initialCount = root ? youtubeRenderers(root, 31).length : 0;
	let completed = !continuation && youtubeCatalogHasTerminalPage(root) && initialCount > 0 && initialCount < 30;
	if (!continuation && /^UC[A-Za-z0-9_-]{20,}$/.test(channelId)) try {
		const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(config.apiKey)}`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-youtube-client-name": "1",
				"x-youtube-client-version": config.clientVersion
			},
			body: JSON.stringify({
				context: { client: {
					clientName: "WEB",
					clientVersion: config.clientVersion
				} },
				browseId: youtubePlaylistBrowseId(`UU${channelId.slice(2)}`)
			}),
			timeoutMs: 1e4,
			manualRetry
		});
		if (response.ok) {
			const pageData = await response.json();
			addPageVideos(pageData);
			continuation = youtubeCatalogContinuation(pageData);
			completed = !continuation && youtubeCatalogHasTerminalPage(pageData) && videos.length > 0;
		}
	} catch {}
	const archiveDeadline = Date.now() + (limit <= 100 ? 2e4 : 12e4);
	const visitedTokens = /* @__PURE__ */ new Set();
	const pageBudget = Math.min(LIBRARY_LIMITS.youtubeArchivePagesPerPull, Math.max(4, Math.ceil(limit / 30) + 2));
	for (let page = 0; continuation && page < pageBudget && videos.length < limit; page += 1) {
		if (visitedTokens.has(continuation) || Date.now() >= archiveDeadline) break;
		visitedTokens.add(continuation);
		try {
			const pageData = await (await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(config.apiKey)}`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-youtube-client-name": "1",
					"x-youtube-client-version": config.clientVersion
				},
				body: JSON.stringify({
					context: { client: {
						clientName: "WEB",
						clientVersion: config.clientVersion
					} },
					continuation
				}),
				timeoutMs: 1e4,
				manualRetry
			})).json();
			addPageVideos(pageData);
			const next = youtubeCatalogContinuation(pageData);
			if (next && next !== continuation) continuation = next;
			else if (youtubeCatalogHasTerminalPage(pageData) && youtubeRenderers(pageData, 1).length) {
				continuation = null;
				completed = true;
			} else if (resumeCursor && continuation === resumeCursor) {
				addPageVideos(root);
				continuation = config.continuation;
			} else break;
		} catch (error) {
			if (resumeCursor && continuation === resumeCursor && error instanceof YoutubeRequestError && (error.status === 400 || error.status === 404)) {
				addPageVideos(root);
				continuation = config.continuation;
				continue;
			}
			break;
		}
	}
	return {
		videos,
		cursor: continuation,
		completed
	};
}
async function youtubeChannelBackfill(channelId, channelName, knownIds, limit, manualRetry) {
	try {
		const html = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`, manualRetry);
		const seen = new Set(knownIds);
		const videos = [];
		for (const renderer of channelPageRenderers(html)) {
			const id = renderer.videoId;
			if (!id || seen.has(id)) continue;
			seen.add(id);
			videos.push(ytVideo({
				id,
				title: rendererText(renderer.title) || `${channelName} video`,
				published: "1970-01-01T00:00:00.000Z",
				metadata: youtubeRendererMetadata(renderer),
				thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				desc: rendererText(renderer.descriptionSnippet) || `${channelName} public channel catalog item.`,
				channelId,
				channelName,
				views: parsePublicViewCount(rendererText(renderer.viewCountText))
			}));
			if (videos.length >= limit) break;
		}
		return videos;
	} catch {
		return [];
	}
}
async function youtubeFromVideo(id, short = false) {
	const oembed = await fetchYoutubeResponse(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { timeoutMs: 12e3 });
	if (!oembed.ok) throw new Error("That YouTube video could not be found.");
	const meta = await oembed.json();
	const channelName = meta.author_name ?? "YouTube";
	let channelId = "";
	if (meta.author_url) try {
		channelId = ytChannelIdFromText(await fetchText(meta.author_url)) ?? "";
	} catch {
		channelId = "";
	}
	const folderId = channelId ? `yt:${channelId}` : YT_INBOX;
	const video = ytVideo({
		id,
		title: meta.title ?? "YouTube video",
		published: "",
		metadata: short ? { youtubeType: "short" } : void 0,
		thumb: meta.thumbnail_url ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
		desc: "",
		channelId: channelId || "inbox",
		channelName
	});
	video.folderId = folderId;
	return {
		channel: {
			id: folderId,
			kind: "youtube",
			handle: channelName,
			title: channelName,
			channelId: channelId || void 0,
			thumb: meta.thumbnail_url,
			lastCheckedAt: Date.now(),
			newestPublishedAt: video.addedAt,
			lastResponseCount: 1
		},
		videos: [video]
	};
}
var YT_INBOX = "youtube:inbox";
async function youtubeLiveForFollow(channel) {
	let channelId = channel.channelId ?? channel.id.match(/^yt:(UC[A-Za-z0-9_-]{20,})$/)?.[1] ?? "";
	if (!channelId) channelId = await resolveYoutubeCreator(channel.handle);
	let result;
	try {
		result = await browseYoutubeLives.inspect(channelId);
	} catch (error) {
		if (!canRecoverYoutubeLiveLayout(error)) throw error;
		result = youtubeHtmlLiveEvidence(await fetchText("https://www.youtube.com/channel/" + encodeURIComponent(channelId) + "/streams"), channelId);
	}
	result = await completeKnownYoutubeEvidence(result, channel.youtubeLiveKnownOverflow ? [] : channel.youtubeLiveVideoIds ?? [], channelId, (id) => fetchText("https://www.youtube.com/watch?v=" + encodeURIComponent(id), void 0, "live"));
	if (!result.observations.length && !result.evidence.complete) throw new YoutubeLiveEvidenceError(result.evidence);
	const checkedAt = result.evidence.at;
	const videos = result.observations.map((observed) => {
		const video = ytVideo({
			id: observed.id,
			title: observed.title || channel.title + " live",
			published: "",
			thumb: "https://i.ytimg.com/vi/" + observed.id + "/hqdefault.jpg",
			desc: channel.title + " is live on YouTube.",
			channelId,
			channelName: channel.title,
			live: true
		});
		if (video.remote) {
			video.remote.viewers = observed.viewers;
			video.remote.observedAt = checkedAt;
		}
		video.tagline = channel.title + " is live now";
		return video;
	});
	const ids = result.observations.map((row) => row.id);
	return {
		complete: result.evidence.complete,
		channel: {
			...channel,
			channelId,
			live: ids.length > 0,
			liveCheckedAt: checkedAt,
			lastLiveFailure: void 0,
			youtubeLiveEvidence: result.evidence,
			youtubeLiveKnownOverflow: result.evidence.complete ? void 0 : channel.youtubeLiveKnownOverflow,
			youtubeLiveVideoIds: result.evidence.complete ? ids : [.../* @__PURE__ */ new Set([...channel.youtubeLiveVideoIds ?? [], ...ids])].slice(0, 64)
		},
		videos
	};
}
function boundedFollowResult(result, limit) {
	const live = result.videos.filter((video) => video.remote?.live);
	const catalog = result.videos.filter((video) => !video.remote?.live).slice(0, limit);
	const videos = [...live, ...catalog];
	return {
		...result,
		channel: {
			...result.channel,
			lastResponseCount: videos.length
		},
		videos
	};
}
/** Return only feed entries ahead of a known upload, while keeping a short
* provider window as the recovery path if YouTube has aged that upload out. */
function routineYoutubeFeedDelta(result, limit, newestKnownVideoId) {
	const live = result.videos.filter((video) => video.remote?.live);
	const delta = selectYoutubeFeedDelta(result.videos.filter((video) => !video.remote?.live).map((video) => ({
		videoId: video.remote?.videoId,
		video
	})), newestKnownVideoId, limit).map((entry) => entry.video);
	const videos = [...live, ...delta];
	return {
		...result,
		channel: {
			...result.channel,
			lastResponseCount: videos.length
		},
		videos
	};
}
function youtubeResultForRequest(result, limit, deepCatalog, newestKnownVideoId) {
	return deepCatalog ? boundedFollowResult(result, limit) : routineYoutubeFeedDelta(result, limit, newestKnownVideoId);
}
function withYoutubeCacheTelemetry(result, entry) {
	return {
		...result,
		channel: {
			...result.channel,
			cache: entry ? {
				at: entry.at,
				hits: entry.hits,
				misses: entry.misses,
				scope: entry.scope,
				entries: entry.result.videos.length,
				estimatedBytes: entry.estimatedBytes
			} : {
				at: Date.now(),
				hits: 0,
				misses: 1,
				scope: "uncached"
			}
		}
	};
}
async function youtubeFromChannelUncoalesced(query, limit = LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, deepCatalog = true, newestKnownVideoId, resumeCursor, manualRetry, titleHint) {
	if (deepCatalog) assertYoutubeReady(Date.now(), "catalog", manualRetry);
	let channelId = "";
	const trimmed = query.trim();
	if (/^UC[\w-]{20,}$/.test(trimmed)) channelId = trimmed;
	const asUrl = query.startsWith("http") ? query : "";
	if (asUrl.includes("/channel/")) channelId = asUrl.split("/channel/")[1]?.split(/[/?#]/)[0] ?? "";
	if (!channelId) channelId = await resolveYoutubeCreator(trimmed, manualRetry);
	const boundedLimit = Math.max(24, Math.min(LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, Math.floor(limit)));
	const cached = youtubeChannelCache.get(channelId);
	if (!deepCatalog && cached && Date.now() - cached.at < YOUTUBE_CHANNEL_CACHE_TTL_MS) {
		cached.hits += 1;
		return youtubeResultForRequest(withYoutubeCacheTelemetry({
			...cached.result,
			videos: [...cached.result.videos.filter((video) => video.remote?.live), ...cached.feedVideos]
		}, cached), boundedLimit, deepCatalog, newestKnownVideoId);
	}
	const resumingArchive = deepCatalog && Boolean(resumeCursor);
	const feedRead = resumingArchive ? [{
		status: "fulfilled",
		value: ""
	}] : await Promise.allSettled([fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, manualRetry).then((xml) => {
		validateYoutubeFeed(xml, channelId);
		return xml;
	})]);
	if (!deepCatalog) {
		const recentRead = feedRead[0];
		if (recentRead.status === "rejected") throw recentRead.reason;
		validateYoutubeFeed(recentRead.value, channelId);
	}
	if (deepCatalog) {
		const archive = await youtubeUploadsArchive(channelId, boundedLimit, resumeCursor, manualRetry).catch((error) => {
			if (feedRead[0].status === "fulfilled" && feedRead[0].value.includes("<entry>")) return {
				rows: [],
				cursor: resumeCursor ?? null,
				completed: false,
				failure: error
			};
			throw error;
		});
		if (archive) {
			const xml = feedRead[0].status === "fulfilled" ? feedRead[0].value : "";
			const author = tag(xml, "name") || archive.author || titleHint || tag(xml, "title") || query;
			const feedEntries = [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)];
			const feedById = new Map(feedEntries.map((match) => [tag(match[1], "yt:videoId"), match[1]]));
			const seen = /* @__PURE__ */ new Set();
			const videos = archive.rows.map((row) => {
				const id = row.videoId;
				seen.add(id);
				const entry = feedById.get(id) ?? "";
				return ytVideo({
					id,
					title: rendererText(row.title) || tag(entry, "title") || id,
					published: tag(entry, "published"),
					metadata: youtubeRendererMetadata(row),
					thumb: row.thumbnail?.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
					desc: tag(entry, "media:description") || rendererText(row.descriptionSnippet) || `${author} public channel catalog item.`,
					channelId,
					channelName: author,
					views: Number(entry.match(/<media:statistics[^>]*views="(\d+)"/)?.[1]) || parsePublicViewCount(rendererText(row.viewCountText)),
					duration: Number(entry.match(/<yt:duration[^>]*seconds="(\d+)"/)?.[1]) || void 0
				});
			});
			for (const [id, entry] of feedById) if (id && !seen.has(id)) videos.push(ytVideo({
				id,
				title: tag(entry, "title") || id,
				published: tag(entry, "published"),
				thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				desc: tag(entry, "media:description"),
				channelId,
				channelName: author,
				views: Number(entry.match(/<media:statistics[^>]*views="(\d+)"/)?.[1]) || void 0,
				duration: Number(entry.match(/<yt:duration[^>]*seconds="(\d+)"/)?.[1]) || void 0
			}));
			return {
				channel: {
					id: `yt:${channelId}`,
					kind: "youtube",
					channelId,
					handle: `https://www.youtube.com/channel/${channelId}`,
					title: author,
					lastCheckedAt: Date.now(),
					catalogCheckedAt: Date.now(),
					lastResponseCount: videos.length,
					catalogCursor: archive.cursor ?? void 0,
					catalogExhaustedAt: archive.completed ? Date.now() : void 0,
					...!resumingArchive ? {
						newestVideoId: newestYoutubeFeedVideoId(feedEntries.map((match) => ({ videoId: tag(match[1], "yt:videoId") }))),
						newestPublishedAt: Math.max(0, ...videos.map((video) => video.addedAt))
					} : {},
					...archive.failure ? { lastProviderFailure: classifyProviderFailure("youtube", archive.failure) } : {}
				},
				videos
			};
		}
	}
	const pageRead = deepCatalog ? await Promise.allSettled([fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`, manualRetry)]) : [{
		status: "fulfilled",
		value: ""
	}];
	const sourceReads = [feedRead[0], pageRead[0]];
	const xml = sourceReads[0].status === "fulfilled" ? sourceReads[0].value : "";
	const fetchedChannelPage = sourceReads[1].status === "fulfilled" ? sourceReads[1].value : "";
	const sourceError = sourceReads.find((row) => row.status === "rejected" && row.reason instanceof YoutubeRequestError && row.reason.retryAt) ?? sourceReads.find((row) => row.status === "rejected");
	if (!xml && !fetchedChannelPage && sourceError?.status === "rejected") throw sourceError.reason;
	let channelPage = fetchedChannelPage;
	if (deepCatalog && !resumingArchive && !youtubeRetryAt() && !xml.includes("<entry>") && !channelPageRenderers(channelPage).length) {
		const shortsPage = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/shorts`, manualRetry).catch(() => "");
		if (channelPageRenderers(shortsPage).length) channelPage = shortsPage;
	}
	if (!xml && !channelPage) throw new Error("YouTube feed and channel page are unavailable. Retry this creator later.");
	const pageTitle = channelPage.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*-\s*YouTube\s*$/, "");
	const title = tag(xml, "title") || pageTitle || query;
	const author = tag(xml, "name") || title;
	const feedVideos = [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].slice(0, boundedLimit).map((m) => {
		const block = m[1];
		const id = tag(block, "yt:videoId");
		const thumb = block.match(/url="([^"]+)"/)?.[1] ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
		return ytVideo({
			id,
			title: tag(block, "title") || id,
			published: tag(block, "published"),
			thumb,
			desc: tag(block, "media:description"),
			channelId,
			channelName: author,
			duration: Number(block.match(/<yt:duration[^>]*seconds="(\d+)"/)?.[1]) || void 0,
			views: Number(block.match(/<media:statistics[^>]*views="(\d+)"/)?.[1]) || void 0
		});
	});
	const videos = [...feedVideos];
	const feedIds = new Set(videos.map((video) => video.remote?.videoId).filter((id) => Boolean(id)));
	const backfill = (deepCatalog || !feedVideos.length) && channelPage ? await (async () => {
		const seen = new Set(feedIds);
		const rows = [];
		for (const renderer of resumeCursor ? [] : channelPageRenderers(channelPage)) {
			const id = renderer.videoId;
			if (!id || seen.has(id)) continue;
			seen.add(id);
			rows.push(ytVideo({
				id,
				title: rendererText(renderer.title) || `${author} video`,
				published: "",
				metadata: youtubeRendererMetadata(renderer),
				thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				desc: rendererText(renderer.descriptionSnippet) || `${author} public channel catalog item.`,
				channelId,
				channelName: author,
				views: parsePublicViewCount(rendererText(renderer.viewCountText))
			}));
		}
		if (!deepCatalog) return {
			videos: rows,
			cursor: null,
			completed: false
		};
		const remaining = Math.max(0, boundedLimit - videos.length - rows.length);
		const older = await youtubeContinuationBackfill(channelPage, /* @__PURE__ */ new Set([...feedIds, ...rows.map((video) => video.remote?.videoId).filter((id) => Boolean(id))]), channelId, author, remaining, resumeCursor, manualRetry);
		return {
			...older,
			videos: [...rows, ...older.videos]
		};
	})() : deepCatalog ? {
		videos: await youtubeChannelBackfill(channelId, author, feedIds, Math.max(0, boundedLimit - videos.length), manualRetry),
		cursor: resumeCursor ?? null,
		completed: false
	} : {
		videos: [],
		cursor: null,
		completed: false
	};
	videos.push(...backfill.videos);
	if (!videos.length && sourceError?.status === "rejected") throw sourceError.reason;
	if (!videos.length && deepCatalog) throw new Error("YouTube returned no readable public uploads. The source may be empty or its public page is unavailable; retry from the first page later.");
	const result = {
		channel: {
			id: `yt:${channelId}`,
			kind: "youtube",
			handle: youtubeInitialData(channelPage)?.metadata?.channelMetadataRenderer?.vanityChannelUrl || `https://www.youtube.com/channel/${channelId}`,
			title: author,
			channelId,
			thumb: youtubeChannelAvatar(channelPage),
			lastCheckedAt: Date.now(),
			...!resumingArchive ? {
				newestPublishedAt: Math.max(0, ...videos.filter((video) => !video.remote?.live).map((video) => video.addedAt)),
				newestVideoId: newestYoutubeFeedVideoId(feedVideos.map((video) => ({ videoId: video.remote?.videoId })))
			} : {},
			lastResponseCount: videos.length,
			...youtubeRetryAt() ? { lastProviderFailure: classifyProviderFailure("youtube", new YoutubeRequestError("YouTube HTTP 429: partial catalog accepted; archive resumes after cooldown.", 429, youtubeRetryAt(), youtubeCooldownScope())) } : {},
			...deepCatalog ? {
				catalogCursor: backfill.cursor ?? void 0,
				catalogCheckedAt: Date.now(),
				catalogExhaustedAt: backfill.completed ? Date.now() : void 0
			} : {}
		},
		videos
	};
	const cacheable = !resumingArchive && videos.length <= YOUTUBE_DEEP_CACHE_MAX_VIDEOS;
	const cacheScope = videos.length > feedVideos.length ? "catalog" : "feed";
	let cacheEntry = cacheable ? {
		at: Date.now(),
		result,
		feedVideos,
		hits: 0,
		misses: 1,
		scope: cacheScope,
		estimatedBytes: estimateProviderPayload(videos)
	} : null;
	if (cacheEntry) {
		if (!youtubeChannelCache.set(channelId, cacheEntry, cacheEntry.estimatedBytes)) cacheEntry = null;
	}
	return youtubeResultForRequest(withYoutubeCacheTelemetry(result, cacheEntry), deepCatalog ? videos.length : boundedLimit, deepCatalog, newestKnownVideoId);
}
function twitchLogin(input) {
	const raw = input.trim().replaceAll("\\_", "_").replace(/^["'([{<]+|["')\]}>.;:]+$/g, "");
	try {
		return (new URL(raw.startsWith("http") ? raw : `https://twitch.tv/${raw}`).pathname.split("/").filter(Boolean)[0] ?? raw).replace(/^@/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
	} catch {
		return raw.replace(/^@/, "").replace(/^tw:/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
	}
}
function youtubeFromChannel(query, limit = LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, focused = true, deepCatalog = focused, newestKnownVideoId, resumeCursor, manualRetry, titleHint) {
	return providerRequest("youtube", `${query}:${deepCatalog ? "catalog" : "feed"}:${limit}:${resumeCursor ?? "start"}:${newestKnownVideoId ?? "none"}:${manualRetry ? `manual-${manualRetry.revision}` : "normal"}`, focused, () => youtubeFromChannelUncoalesced(query, limit, deepCatalog, newestKnownVideoId, resumeCursor, manualRetry, titleHint));
}
async function youtubeFromPlaylist(input, focused = true, resumeCursor, requestedLimit, manualRetry, titleHint) {
	const playlistId = youtubePlaylistId(input);
	if (!playlistId) throw new Error("Enter a public YouTube playlist URL.");
	return providerRequest("youtube", `playlist:${playlistId}:${resumeCursor ?? "start"}:${focused ? "catalog" : "feed"}:${requestedLimit ?? "default"}:${manualRetry ? `manual-${manualRetry.revision}` : "normal"}`, focused, async () => {
		const direct = await youtubeBrowseArchive(playlistId, requestedLimit ?? (focused ? LIBRARY_LIMITS.youtubePlaylistVideosPerPull : 80), resumeCursor, manualRetry);
		if (direct) {
			const folderId = `ytpl:${playlistId}`;
			const videos = direct.rows.map((entry) => {
				const video = ytVideo({
					id: entry.videoId,
					title: rendererText(entry.title) || entry.videoId,
					published: "",
					metadata: youtubeRendererMetadata(entry),
					thumb: entry.thumbnail?.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`,
					desc: "Public YouTube playlist",
					channelId: "playlist",
					channelName: rendererText(entry.shortBylineText) || "YouTube"
				});
				video.id = `${folderId}:${entry.videoId}`;
				video.folderId = folderId;
				return video;
			});
			return {
				channel: {
					id: folderId,
					kind: "youtube",
					handle: `https://www.youtube.com/playlist?list=${playlistId}`,
					title: direct.title || titleHint || `YouTube playlist ${playlistId.slice(0, 8)}`,
					thumb: videos[0]?.poster,
					lastCheckedAt: Date.now(),
					lastResponseCount: videos.length,
					...!resumeCursor ? { newestVideoId: direct.rows[0]?.videoId } : {},
					...direct.failure ? { lastProviderFailure: classifyProviderFailure("youtube", direct.failure) } : {},
					...focused ? {
						catalogCursor: direct.cursor ?? void 0,
						catalogCheckedAt: Date.now(),
						catalogExhaustedAt: direct.completed ? Date.now() : void 0
					} : {}
				},
				videos
			};
		}
		const html = await fetchText(`https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`, manualRetry);
		const root = youtubeInitialData(html);
		if (!root) throw new Error("This playlist did not return public metadata.");
		const limit = requestedLimit ?? (focused ? LIBRARY_LIMITS.youtubePlaylistVideosPerPull : 80);
		const found = resumeCursor ? [] : publicPlaylistEntries(root, Math.max(limit, 100));
		const seen = new Set(found.map((entry) => entry.id));
		const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
		const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
		let browseRoot = root;
		if (!found.length && !resumeCursor && apiKey) try {
			const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(apiKey)}`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-youtube-client-name": "1",
					"x-youtube-client-version": clientVersion
				},
				body: JSON.stringify({
					context: { client: {
						clientName: "WEB",
						clientVersion
					} },
					browseId: `VL${playlistId}`
				}),
				timeoutMs: 1e4,
				manualRetry
			});
			if (response.ok) {
				browseRoot = await response.json();
				for (const entry of publicPlaylistEntries(browseRoot, Math.max(limit, 100))) if (!seen.has(entry.id)) {
					seen.add(entry.id);
					found.push(entry);
				}
			}
		} catch {}
		let continuation = resumeCursor ?? youtubeCatalogContinuation(browseRoot) ?? youtubeContinuation(browseRoot);
		let completed = !continuation && found.length > 0;
		for (let page = 0; continuation && apiKey && page < (focused ? LIBRARY_LIMITS.youtubePlaylistPagesPerPull : 1) && found.length < limit; page++) try {
			const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(apiKey)}`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-youtube-client-name": "1",
					"x-youtube-client-version": clientVersion
				},
				body: JSON.stringify({
					context: { client: {
						clientName: "WEB",
						clientVersion
					} },
					continuation
				}),
				timeoutMs: 1e4,
				manualRetry
			});
			if (!response.ok) break;
			const pageData = await response.json();
			for (const entry of publicPlaylistEntries(pageData, Math.max(100, limit - found.length))) if (!seen.has(entry.id)) {
				seen.add(entry.id);
				found.push(entry);
			}
			const next = youtubeCatalogContinuation(pageData) ?? youtubeContinuation(pageData);
			if (next && next !== continuation) continuation = next;
			else {
				continuation = null;
				completed = true;
			}
		} catch {
			break;
		}
		if (!found.length) throw new Error("No public videos were found in that playlist.");
		const title = publicPlaylistTitle(browseRoot) || publicPlaylistTitle(root) || html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)/i)?.[1] || `YouTube playlist ${playlistId.slice(0, 8)}`;
		const folderId = `ytpl:${playlistId}`;
		const videos = found.map((entry) => {
			const video = ytVideo({
				id: entry.id,
				title: entry.title,
				published: "",
				metadata: entry.metadata,
				thumb: entry.thumb?.startsWith("//") ? `https:${entry.thumb}` : entry.thumb || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
				desc: `${title} · public playlist`,
				channelId: "playlist",
				channelName: entry.channelName
			});
			video.id = `${folderId}:${entry.id}`;
			video.folderId = folderId;
			return video;
		});
		return {
			channel: {
				id: folderId,
				kind: "youtube",
				handle: `https://www.youtube.com/playlist?list=${playlistId}`,
				title,
				thumb: videos[0]?.poster,
				lastCheckedAt: Date.now(),
				newestVideoId: found[0]?.id,
				lastResponseCount: videos.length,
				...focused ? {
					catalogCursor: continuation ?? void 0,
					catalogCheckedAt: Date.now(),
					catalogExhaustedAt: completed ? Date.now() : void 0
				} : {}
			},
			videos
		};
	});
}
var TWITCH_ARCHIVE_PAGE_SIZE = Math.min(100, LIBRARY_LIMITS.twitchArchivePageSize);
var TWITCH_ARCHIVE_MAX_PAGES = LIBRARY_LIMITS.twitchArchiveMaxPages;
var TWITCH_FOCUSED_VOD_LIMIT = LIBRARY_LIMITS.twitchFocusedVodsPerChannel;
var TWITCH_REFRESH_VOD_LIMIT = LIBRARY_LIMITS.twitchRoutineVodsPerChannel;
var TWITCH_FOCUSED_CLIP_LIMIT = LIBRARY_LIMITS.twitchFocusedClipsPerChannel;
var TWITCH_REFRESH_CLIP_LIMIT = LIBRARY_LIMITS.twitchRoutineClipsPerChannel;
var TWITCH_CLIP_MAX_PAGES = LIBRARY_LIMITS.twitchClipMaxPages;
/** Android/TV public Client-ID — multi-page archives/clips without web integrity. */
var TWITCH_CLIENT_ID = "kd1unb4b3q4t58fwlpcbzcbnm76a8fp";
var TWITCH_CHANNEL_CACHE_TTL_MS = 18e4;
var TWITCH_CHANNEL_CACHE_LIMIT = 16;
var TWITCH_PAGE_GAP_MS = 180;
var twitchChannelCache = createProviderMetadataCache({
	maxEntries: TWITCH_CHANNEL_CACHE_LIMIT,
	maxBytes: PROVIDER_BUDGETS.twitchCacheBytes,
	maxEntryBytes: PROVIDER_BUDGETS.warmCacheEntryBytes,
	ttlMs: TWITCH_CHANNEL_CACHE_TTL_MS
});
function twitchCacheResult(entry, cacheHit = false) {
	return {
		...entry.result,
		channel: {
			...entry.result.channel,
			cache: { ...entry.telemetry },
			...entry.result.channel.twitchClipDiagnostics ? { twitchClipDiagnostics: {
				...entry.result.channel.twitchClipDiagnostics,
				cacheHit,
				servedAt: Date.now()
			} } : {}
		}
	};
}
function twitchPageGap() {
	return new Promise((resolve) => setTimeout(resolve, TWITCH_PAGE_GAP_MS));
}
function twitchClampFirst(n) {
	return Math.max(1, Math.min(100, Math.floor(n)));
}
async function twitchGqlJson(query, variables) {
	const res = await fetchProviderMetadata("https://gql.twitch.tv/gql", {
		signal: AbortSignal.timeout(12e3),
		method: "POST",
		headers: {
			"client-id": TWITCH_CLIENT_ID,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			query,
			variables
		})
	});
	if (!res.ok) throw new Error(`Twitch request failed: HTTP ${res.status}`);
	return await res.json();
}
async function twitchUser(login, after, archivePageSize = TWITCH_ARCHIVE_PAGE_SIZE, broadcastType = "ARCHIVE") {
	const first = twitchClampFirst(archivePageSize);
	const json = await twitchGqlJson(`query($login:String!,$after:Cursor,$first:Int!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:$first,type:${broadcastType},after:$after){pageInfo{hasNextPage endCursor} edges{cursor node{id title description lengthSeconds viewCount publishedAt previewThumbnailURL(width:640,height:360) game{name}}}}}}`, {
		login,
		after: after ?? null,
		first
	});
	if (!json) return null;
	const user = json.data?.user ?? null;
	if (user && json.errors?.length) return {
		...user,
		videos: {
			providerError: json.errors.map((error) => error.message ?? "Provider error").join("; ").slice(0, 240),
			edges: []
		}
	};
	return user;
}
/** A live check must not inherit the three-minute archive cache or walk VOD
* and clip pages. Twitch stream state has its own short freshness window. */
async function twitchLiveForFollow(channel) {
	const login = twitchLogin(channel.handle);
	if (!login) throw new Error("Enter a Twitch channel.");
	const json = await twitchGqlJson(`query($login:String!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}}}}`, { login });
	const user = json?.data?.user;
	const streamFailure = json?.errors?.[0];
	if (streamFailure) throw new Error(`Twitch live check failed for ${login}: ${(streamFailure.message ?? "provider error").slice(0, 180)}`);
	if (!user?.id) throw new Error(`Twitch could not resolve ${login} for live status`);
	if (user.stream === void 0) throw new Error(`Twitch returned a malformed live status for ${login}`);
	return twitchLiveObservation(channel, login, validateTwitchLiveUser(user));
}
function twitchLiveObservation(channel, login, rawUser, warning) {
	const user = validateTwitchLiveUser(rawUser);
	if (!user?.id || user.stream === void 0) throw new Error(`Twitch could not confirm live status for ${login}`);
	const now = Date.now();
	const videos = user.stream ? twitchVideos(login, {
		...user,
		videos: { edges: [] }
	}, 0) : [];
	return {
		channel: {
			...channel,
			id: channel.id,
			kind: "twitch",
			handle: login,
			channelId: user.id,
			title: user.displayName ?? channel.title ?? login,
			thumb: user.profileImageURL ?? channel.thumb,
			live: Boolean(user.stream),
			lastCheckedAt: now,
			liveCheckedAt: now,
			lastLiveFailure: void 0,
			lastLiveWarning: warning ? {
				at: now,
				message: warning
			} : void 0
		},
		videos
	};
}
/**
* Twitch exposes archives as a cursor connection (`first` ≤100). With the
* Android/TV Client-ID we can walk many pages toward the focused budget;
* empty / integrity failures stop the loop (rate-limit friendly gap between
* pages). Focused pulls also merge HIGHLIGHT + UPLOAD shelves.
*/
async function twitchArchive(login, limit, savedCursor) {
	const result = await walkTwitchArchive({
		limit,
		maxPages: Math.max(1, Math.min(TWITCH_ARCHIVE_MAX_PAGES, Math.ceil(limit / Math.max(1, TWITCH_ARCHIVE_PAGE_SIZE)) + 1)),
		pageSize: TWITCH_ARCHIVE_PAGE_SIZE,
		savedCursor,
		gap: twitchPageGap,
		read: async (cursor, size) => {
			let page = await twitchUser(login, cursor.after, size, cursor.stage);
			if (page?.id && !page.videos?.providerError && !page.videos?.edges?.length && size > 30 && !cursor.after && cursor.stage === "ARCHIVE") page = await twitchUser(login, null, 30, cursor.stage);
			return page;
		}
	});
	if (!result.first) return null;
	return {
		...result.first,
		videos: { edges: result.edges },
		twitchArchiveCursor: result.cursor,
		twitchArchiveExhaustedAt: result.exhaustedAt,
		twitchArchiveDiagnostics: result.diagnostics
	};
}
async function twitchClips(login, limit, savedCursor, variety = false, recentOnly = false) {
	return walkTwitchClips({
		limit,
		maxPages: TWITCH_CLIP_MAX_PAGES,
		cursor: savedCursor,
		variety,
		recentOnly,
		gap: twitchPageGap,
		read: async (period, first, after) => {
			const json = await twitchGqlJson("query($login:String!,$first:Int!,$after:Cursor){user(login:$login){" + ("clips(first:$first, after:$after" + (period ? ", criteria:{period:" + period + "}" : "") + "){pageInfo{hasNextPage endCursor} edges{cursor node{id slug title viewCount durationSeconds createdAt thumbnailURL game{name}}}}") + "}}", {
				login,
				first,
				after: after ?? null
			});
			if (json?.errors?.length) throw Error(json.errors.map((row) => row.message ?? "Provider error").join("; "));
			return (json?.data?.user)?.clips;
		}
	});
}
function twitchVideos(login, user, vodLimit = TWITCH_ARCHIVE_PAGE_SIZE, clips = []) {
	const title = user.displayName ?? login;
	const folderId = `tw:${login}`;
	const observedAt = Date.now();
	const out = [];
	if (user.stream) out.push({
		id: `tw:${login}:live`,
		folderId,
		name: user.stream.title || `${title} live`,
		path: `twitch/${login}/live`,
		extension: "live",
		mime: "video/twitch",
		size: 0,
		addedAt: Date.now(),
		genre: user.stream.game?.name,
		tagline: `${title} is live`,
		poster: user.stream.previewImageURL,
		remote: {
			kind: "twitch",
			channelName: title,
			live: true,
			viewers: user.stream.viewersCount,
			observedAt,
			embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&autoplay=true`,
			watchUrl: `https://www.twitch.tv/${login}`
		}
	});
	for (const edge of (user.videos?.edges ?? []).slice(0, vodLimit)) {
		const node = edge.node;
		if (!node?.id) continue;
		const rawDuration = Number(node.lengthSeconds);
		const duration = Number.isFinite(rawDuration) && rawDuration > 0 && rawDuration <= 172800 ? rawDuration : void 0;
		out.push({
			id: `tw:v:${node.id}`,
			folderId,
			name: node.title || "Twitch video",
			path: `twitch/${login}/${node.id}`,
			extension: "vod",
			mime: "video/twitch",
			size: 0,
			duration,
			addedAt: Date.parse(node.publishedAt ?? "") || Date.now(),
			genre: node.game?.name,
			poster: node.previewThumbnailURL,
			tagline: node.description?.slice(0, 180),
			description: node.description?.slice(0, 800),
			remote: {
				kind: "twitch",
				...edge.broadcastType ? { twitchContent: twitchContentEvidence(edge.broadcastType, node.id, edge.observedAt ?? observedAt) } : {},
				videoId: node.id,
				channelId: user.id,
				...Number.isFinite(node.viewCount) && node.viewCount >= 0 ? { views: node.viewCount } : {},
				channelName: title,
				live: false,
				observedAt,
				embedUrl: `https://player.twitch.tv/?video=${encodeURIComponent(node.id)}&autoplay=true`,
				watchUrl: `https://www.twitch.tv/videos/${node.id}`
			}
		});
	}
	for (const clip of clips) {
		const slug = clip.slug || clip.id;
		if (!slug) continue;
		const views = Number.isFinite(clip.viewCount) && clip.viewCount >= 0 ? clip.viewCount : void 0;
		const rawDuration = Number(clip.durationSeconds);
		const duration = Number.isFinite(rawDuration) && rawDuration > 0 && rawDuration <= 3600 ? rawDuration : void 0;
		out.push({
			id: `tw:c:${slug}`,
			folderId,
			name: clip.title || "Twitch clip",
			genre: clip.game?.name,
			path: `twitch/${login}/clip/${slug}`,
			extension: "clip",
			mime: "video/twitch",
			size: 0,
			duration,
			addedAt: (() => {
				const at = Date.parse(clip.createdAt ?? "");
				return Number.isFinite(at) && at > 0 && at <= observedAt ? at : 0;
			})(),
			poster: clip.thumbnailURL,
			tagline: views !== void 0 ? `${views.toLocaleString()} views · clip` : "Twitch clip",
			remote: {
				kind: "twitch",
				twitchContent: twitchContentEvidence("CLIPS", slug, observedAt),
				videoId: slug,
				channelId: user.id,
				channelName: title,
				live: false,
				views,
				observedAt,
				embedUrl: `https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}&autoplay=true`,
				watchUrl: `https://www.twitch.tv/${login}/clip/${slug}`
			}
		});
	}
	if (!out.length) out.push({
		id: `tw:${login}:channel`,
		folderId,
		name: title,
		path: `twitch/${login}`,
		extension: "live",
		mime: "video/twitch",
		size: 0,
		addedAt: Date.now(),
		tagline: "Offline — open the channel anyway",
		remote: {
			kind: "twitch",
			channelName: title,
			live: false,
			observedAt,
			embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&autoplay=true`,
			watchUrl: `https://www.twitch.tv/${login}`
		}
	});
	return out;
}
async function followTwitchUncoalesced(query, compact = false, clipLimit, archiveCursor, clipCursor, focusedVodLimit) {
	const login = twitchLogin(query);
	if (!login) throw new Error("Enter a Twitch channel.");
	const vodLimit = compact ? focusedVodLimit ?? TWITCH_REFRESH_VOD_LIMIT : focusedVodLimit ?? TWITCH_FOCUSED_VOD_LIMIT;
	const clipsWanted = clipLimit ?? (compact ? TWITCH_REFRESH_CLIP_LIMIT : archiveCursor ? 0 : TWITCH_FOCUSED_CLIP_LIMIT);
	const cacheKey = `${login}:${compact ? "r" : "f"}:${vodLimit}:${clipsWanted}:${archiveCursor ?? "start"}:${clipCursor ?? "clip-start"}`;
	const cached = twitchChannelCache.get(cacheKey);
	if (cached && Date.now() - cached.at < TWITCH_CHANNEL_CACHE_TTL_MS) {
		cached.telemetry.hits++;
		return twitchCacheResult(cached, true);
	}
	const liveObservedAt = Date.now();
	const user = vodLimit === 0 ? await (async () => {
		const json = await twitchGqlJson("query($login:String!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}}}}", { login });
		if (json.errors?.length) throw Error(json.errors.map((e) => e.message ?? "Provider error").join("; "));
		return json.data?.user;
	})() : await twitchArchive(login, vodLimit, compact ? void 0 : archiveCursor);
	if (!user?.id) throw new Error(`Twitch could not resolve ${login}`);
	const clipResult = await twitchClips(login, clipsWanted, clipCursor, compact);
	const title = user.displayName ?? login;
	const videos = twitchVideos(login, user, vodLimit, clipResult.clips);
	for (const video of videos) if (video.remote?.live) video.remote.observedAt = liveObservedAt;
	else if (video.extension === "clip" && video.remote) video.remote.observedAt = clipResult.diagnostics.at;
	const channel = {
		id: `tw:${login}`,
		kind: "twitch",
		handle: login,
		title,
		channelId: user?.id,
		thumb: user?.profileImageURL,
		live: Boolean(user?.stream),
		...user.stream !== void 0 ? { liveCheckedAt: liveObservedAt } : {},
		lastCheckedAt: Date.now(),
		...vodLimit > 0 ? { twitchArchiveCheckedAt: Date.now() } : {},
		newestPublishedAt: Math.max(0, ...videos.filter((video) => !video.remote?.live).map((video) => video.addedAt)),
		lastResponseCount: videos.length,
		...!compact ? {
			twitchArchiveCursor: user.twitchArchiveCursor,
			twitchArchiveExhaustedAt: user.twitchArchiveExhaustedAt,
			twitchArchiveDiagnostics: user.twitchArchiveDiagnostics,
			twitchArchiveLastVideoId: user.twitchArchiveDiagnostics?.lastVideoId
		} : {},
		...!compact && clipsWanted > 0 ? {
			twitchClipCursor: clipResult.cursor,
			twitchClipExhaustedAt: clipResult.exhaustedAt
		} : {},
		lastProviderFailure: user.twitchArchiveDiagnostics?.error || clipResult.error ? classifyProviderFailure("twitch", user.twitchArchiveDiagnostics?.error ?? clipResult.error) : void 0
	};
	const result = {
		channel,
		videos
	};
	const entry = {
		at: Date.now(),
		result,
		telemetry: {
			at: Date.now(),
			hits: 0,
			misses: 1,
			scope: "catalog",
			entries: videos.length,
			estimatedBytes: estimateProviderPayload(videos)
		}
	};
	if (channel.lastProviderFailure || videos.length > PROVIDER_BUDGETS.warmCacheRows || !twitchChannelCache.set(cacheKey, entry, entry.telemetry.estimatedBytes)) entry.telemetry.scope = "uncached";
	return twitchCacheResult(entry);
}
/** Explicit clip updates never walk VODs or author live-state observations. */
async function followTwitchClips(query, mode, limit, cursor, fresh = false) {
	const login = twitchLogin(query);
	if (!login) throw new Error("Enter a Twitch channel.");
	const key = login + ":clips:" + mode + ":" + limit + ":" + (mode === "archive" ? cursor ?? "start" : "recent");
	const freshKey = providerKey("twitch", key + ":fresh");
	const pendingFresh = providerInflight.get(freshKey);
	if (pendingFresh) return pendingFresh;
	const prior = fresh ? providerInflight.get(providerKey("twitch", key)) : void 0;
	return providerRequest("twitch", key + (fresh ? ":fresh" : ""), true, async () => {
		if (fresh) {
			if (prior) await prior.catch(() => void 0);
			twitchChannelCache.delete(key);
		}
		const cached = twitchChannelCache.get(key);
		if (cached && Date.now() - cached.at < (mode === "recent" ? 45e3 : TWITCH_CHANNEL_CACHE_TTL_MS)) {
			cached.telemetry.hits++;
			return twitchCacheResult(cached, true);
		}
		const observedAt = Date.now();
		const json = await twitchGqlJson("query($login:String!){user(login:$login){id displayName profileImageURL(width:70)}}", { login });
		if (json.errors?.length) throw new Error(json.errors.map((row) => row.message ?? "Provider error").join("; "));
		const user = json.data?.user;
		if (!user?.id) throw new Error("Twitch could not resolve " + login);
		const result = await twitchClips(login, limit, mode === "archive" ? cursor : void 0, mode === "recent", mode === "recent");
		const videos = twitchVideos(login, user, 0, result.clips).filter((video) => video.extension === "clip");
		result.diagnostics.at = observedAt;
		for (const video of videos) if (video.remote) video.remote.observedAt = observedAt;
		const at = Date.now();
		const entry = {
			at,
			result: {
				channel: {
					id: "tw:" + login,
					kind: "twitch",
					handle: login,
					title: user.displayName ?? login,
					channelId: user.id,
					thumb: user.profileImageURL,
					lastResponseCount: videos.length,
					twitchClipDiagnostics: result.diagnostics,
					...mode === "archive" ? {
						twitchClipCursor: result.cursor,
						twitchClipExhaustedAt: result.exhaustedAt
					} : {},
					...result.error ? { lastClipFailure: classifyProviderFailure("twitch", result.error) } : {
						lastClipFailure: void 0,
						...mode === "recent" ? { twitchClipRecentCheckedAt: observedAt } : { twitchClipCheckedAt: observedAt }
					}
				},
				videos
			},
			telemetry: {
				at,
				hits: 0,
				misses: 1,
				scope: "catalog",
				entries: videos.length,
				estimatedBytes: estimateProviderPayload(videos)
			}
		};
		if (result.error || !twitchChannelCache.set(key, entry, entry.telemetry.estimatedBytes)) entry.telemetry.scope = "uncached";
		return twitchCacheResult(entry);
	}, query);
}
function followTwitch(query, compact = false, clipLimit, archiveCursor, clipCursor, focusedVodLimit) {
	return providerRequest("twitch", `${query}:${compact ? "routine" : "focused"}:${focusedVodLimit ?? "default"}:${clipLimit ?? "default"}:${archiveCursor ?? "start"}:${clipCursor ?? "clip-start"}`, !compact, () => followTwitchUncoalesced(query, compact, clipLimit, archiveCursor, clipCursor, focusedVodLimit), query);
}
async function runFollowRemote(dataRaw) {
	applyYoutubePullPacing(dataRaw);
	const data = parseFollow(dataRaw);
	const kind = data.kind === "auto" ? guessKind(data.query) : data.kind;
	if (data.freshTwitchClips && kind !== "twitch") throw new Error("Fresh clip reads are only available for Twitch clips.");
	if (kind === "twitch" && data.twitchClipMode) return followTwitchClips(data.query, data.twitchClipMode, data.clipLimit ?? 50, data.twitchClipCursor, data.freshTwitchClips);
	if (kind === "twitch") return followTwitch(data.query, false, data.clipLimit, data.twitchArchiveCursor, data.twitchClipCursor, data.twitchVodLimit);
	if (youtubePlaylistId(data.query)) return youtubeFromPlaylist(data.query, true, data.catalogCursor, LIBRARY_LIMITS.youtubeManualRefreshVideosPerChannel);
	const videoId = ytVideoId(data.query);
	if (videoId) return youtubeFromVideo(videoId, /^https?:\/\/(?:www\.|m\.)?youtube\.com\/shorts\//i.test(data.query.trim()));
	return youtubeFromChannel(data.query, LIBRARY_LIMITS.youtubeManualRefreshVideosPerChannel, true, true, void 0, data.catalogCursor);
}
async function runRefreshRemotes(dataRaw) {
	applyYoutubePullPacing(dataRaw);
	const data = parseRefresh(dataRaw);
	const manualRetry = data.forceYoutube ? createYoutubeManualRetry() : void 0;
	const videos = [];
	const channels = [];
	const refreshedIds = [];
	const liveCheckedIds = [];
	const batchLogins = data.twitchLiveOnly ? data.channels.filter((channel) => channel.kind === "twitch" && (channel.twitchLiveRetry?.retryAt ?? 0) <= Date.now()).map((channel) => twitchLogin(channel.handle)) : [];
	const batched = batchLogins.length > 1 ? await readTwitchLiveBatch(batchLogins, twitchGqlJson) : void 0;
	await mapPool(data.channels, data.youtubeCatalog ? PROVIDER_BUDGETS.archiveWorkers : data.youtubeLiveOnly ? PROVIDER_BUDGETS.youtubeLiveWorkers : data.twitchLiveOnly || data.twitchRoutine ? PROVIDER_BUDGETS.liveWorkers : PROVIDER_BUDGETS.refreshWorkers, async (ch) => {
		try {
			if (ch.kind === "twitch") {
				const scope = data.twitchLiveOnly ? "live" : data.twitchContinueArchive ? "archive" : "recent";
				if ((scope === "recent" ? ch.recentPull?.retryAt ?? 0 : ch[scope === "live" ? "twitchLiveRetry" : "twitchArchiveRetry"]?.retryAt ?? 0) > Date.now()) {
					channels.push(ch);
					return;
				}
				if (data.twitchLiveOnly) {
					const observation = batched?.get(twitchLogin(ch.handle));
					if (observation?.error) throw observation.error;
					const next = observation ? twitchLiveObservation(ch, twitchLogin(ch.handle), observation.user, observation.warning) : await providerRequest("twitch", `live:${ch.handle}`, true, () => twitchLiveForFollow(ch), ch.handle);
					channels.push({
						...ch,
						...next.channel,
						id: ch.id,
						...twitchRetryPatch(ch, "live")
					});
					videos.push(...next.videos.map((video) => ({
						...video,
						folderId: ch.id
					})));
					refreshedIds.push(ch.id);
					liveCheckedIds.push(ch.id);
					return;
				}
				if (data.twitchApplyPolicy && !twitchPolicyAllows(ch, data.twitchContinueArchive ? "archive" : "recent")) {
					channels.push(ch);
					return;
				}
				const policy = data.twitchApplyPolicy ? twitchPullPolicy(ch) : void 0;
				if (data.twitchContinueArchive && ch.twitchArchiveExhaustedAt) {
					channels.push(ch);
					return;
				}
				const next = data.twitchContinueArchive ? await followTwitch(ch.handle, false, 0, ch.twitchArchiveCursor, void 0, TWITCH_REFRESH_VOD_LIMIT) : await followTwitch(ch.handle, true, policy && !policy.clips ? 0 : void 0, void 0, void 0, policy && !policy.vods ? 0 : void 0);
				const freshLive = (next.channel.liveCheckedAt ?? 0) >= Math.max(ch.liveCheckedAt ?? 0, ch.lastLiveFailure?.at ?? 0) && Boolean(next.channel.liveCheckedAt);
				if (freshLive) liveCheckedIds.push(ch.id);
				channels.push({
					...ch,
					...next.channel,
					id: ch.id,
					...data.twitchContinueArchive ? {
						twitchArchiveCheckedAt: Date.now(),
						...twitchRetryPatch(ch, "archive", next.channel.lastProviderFailure)
					} : {
						twitchArchiveCheckedAt: ch.twitchArchiveCheckedAt,
						lastProviderFailure: ch.lastProviderFailure,
						recentPull: next.channel.lastProviderFailure ? recentPullFailure(ch, next.channel.lastProviderFailure) : recentPullSuccess(ch, next.channel)
					},
					...freshLive ? twitchRetryPatch(ch, "live") : {
						live: ch.live,
						liveCheckedAt: ch.liveCheckedAt,
						lastLiveFailure: ch.lastLiveFailure
					}
				});
				videos.push(...next.videos.filter((video) => freshLive || !video.remote?.live).map((video) => ({
					...video,
					folderId: ch.id
				})));
			} else if (data.youtubeLiveOnly) {
				if ((ch.lastLiveFailure?.at === void 0 || ch.lastLiveFailure.at >= (ch.liveCheckedAt ?? 0)) && (ch.lastLiveFailure?.retryAt ?? 0) > Date.now()) {
					channels.push(ch);
					return;
				}
				const next = await youtubeLiveForFollow(ch);
				if (next.complete) liveCheckedIds.push(ch.id);
				channels.push({
					...ch,
					...next.channel,
					id: ch.id
				});
				videos.push(...next.videos.map((video) => ({
					...video,
					folderId: ch.id
				})));
			} else {
				if (!data.youtubeCatalog && !recentPullReady(ch)) {
					channels.push(ch);
					return;
				}
				const id = ch.channelId ?? ch.id.match(/^yt:(UC[\w-]{20,})$/)?.[1];
				const q = id ? `https://www.youtube.com/channel/${id}` : ch.handle;
				const next = ch.id.startsWith("ytpl:") ? await youtubeFromPlaylist(ch.handle, data.youtubeCatalog, data.youtubeCatalog ? ch.catalogCursor : void 0, data.youtubeVideoLimit, manualRetry, ch.title) : data.youtubeCatalog ? await youtubeFromChannel(q, data.youtubeVideoLimit ?? 100, true, true, void 0, ch.catalogCursor, manualRetry, ch.title) : await youtubeFromChannel(q, LIBRARY_LIMITS.youtubeRoutineVideosPerChannel, false, false, ch.recentPull?.newestVideoId ?? ch.newestVideoId);
				channels.push({
					...ch,
					...next.channel,
					id: ch.id,
					handle: next.channel.handle || ch.handle,
					thumb: next.channel.thumb || ch.thumb,
					newestVideoId: ch.id.startsWith("ytpl:") && data.youtubeCatalog ? ch.newestVideoId ?? next.channel.newestVideoId : next.channel.newestVideoId ?? ch.newestVideoId,
					importNeedsReview: void 0,
					...data.youtubeCatalog ? { lastProviderFailure: next.channel.lastProviderFailure } : {
						lastProviderFailure: ch.lastProviderFailure,
						recentPull: next.channel.lastProviderFailure ? recentPullFailure(ch, next.channel.lastProviderFailure) : recentPullSuccess(ch, next.channel),
						newestVideoId: recentPullSuccess(ch, next.channel).newestVideoId ?? ch.newestVideoId
					}
				});
				videos.push(...next.videos.map((video) => ({
					...video,
					folderId: ch.id
				})));
			}
			if (data.youtubeCatalog || data.twitchContinueArchive || data.youtubeLiveOnly || data.twitchLiveOnly || !channels.at(-1)?.recentPull?.failure) refreshedIds.push(ch.id);
		} catch (error) {
			if (ch.kind === "twitch") {
				if (!data.twitchLiveOnly && !data.twitchContinueArchive) {
					channels.push({
						...ch,
						recentPull: recentPullFailure(ch, classifyTwitchFailure(error))
					});
					return;
				}
				channels.push({
					...ch,
					...!data.twitchLiveOnly ? { lastCheckedAt: Date.now() } : {},
					...!data.twitchLiveOnly ? { twitchArchiveCheckedAt: Date.now() } : {},
					...twitchRetryPatch(ch, data.twitchLiveOnly ? "live" : "archive", classifyTwitchFailure(error))
				});
				return;
			}
			if (!data.youtubeLiveOnly && !data.youtubeCatalog) {
				channels.push({
					...ch,
					recentPull: recentPullFailure(ch, classifyProviderFailure(ch.kind, error))
				});
				return;
			}
			channels.push({
				...ch,
				lastCheckedAt: data.youtubeLiveOnly ? ch.lastCheckedAt : Date.now(),
				...ch.kind === "youtube" && data.youtubeCatalog ? { catalogCheckedAt: Date.now() } : {},
				...ch.kind === "youtube" && data.youtubeLiveOnly ? {
					lastLiveFailure: youtubeLiveFailure(ch, classifyProviderFailure(ch.kind, error)),
					youtubeLiveEvidence: error instanceof YoutubeLiveEvidenceError ? error.evidence : {
						at: Date.now(),
						state: "unknown",
						source: "unreadable",
						complete: false,
						reason: "unreadable"
					}
				} : {},
				lastProviderFailure: data.youtubeLiveOnly ? ch.lastProviderFailure : classifyProviderFailure(ch.kind, error)
			});
		}
	});
	const retryAt = Object.fromEntries(data.channels.flatMap((channel) => {
		const retry = channel.kind === "youtube" ? youtubeRetryAt(Date.now(), data.youtubeLiveOnly ? "live" : data.youtubeCatalog ? "catalog" : "feed") ?? (!data.youtubeLiveOnly && !data.youtubeCatalog ? channels.find((row) => row.id === channel.id)?.recentPull?.retryAt : channels.find((row) => row.id === channel.id)?.[data.youtubeLiveOnly ? "lastLiveFailure" : "lastProviderFailure"]?.retryAt) ?? (!data.youtubeLiveOnly ? retryAtFor(channel.kind, channel.handle) : void 0) : !data.twitchLiveOnly && !data.twitchContinueArchive ? channels.find((row) => row.id === channel.id)?.recentPull?.retryAt : channels.find((row) => row.id === channel.id)?.[data.twitchLiveOnly ? "twitchLiveRetry" : "twitchArchiveRetry"]?.retryAt;
		return retry ? [[channel.id, retry]] : [];
	}));
	const scope = data.youtubeLiveOnly ? "live" : data.youtubeCatalog ? "catalog" : "feed";
	const deadline = youtubeRetryAt(Date.now(), scope);
	return {
		videos,
		channels,
		refreshedIds,
		liveCheckedIds,
		retryAt,
		...data.channels.some((channel) => channel.kind === "youtube") && deadline ? {
			providerRetryAt: deadline,
			providerCooldownScope: youtubeCooldownScope(Date.now(), scope)
		} : {}
	};
}
function parseImport(data) {
	if (typeof data !== "object" || data === null) return { items: [] };
	const rec = data;
	if (!Array.isArray(rec.items)) return { items: [] };
	const items = [];
	for (const raw of rec.items) {
		if (!raw || typeof raw !== "object") continue;
		const row = raw;
		const query = asString(row.query).trim();
		if (!query) continue;
		items.push({
			query,
			kind: row.kind === "twitch" ? "twitch" : "youtube"
		});
	}
	return { items: items.slice(0, 80) };
}
async function mapPool(items, size, fn) {
	const out = new Array(items.length);
	let i = 0;
	const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
		while (i < items.length) {
			const idx = i;
			i += 1;
			const item = items[idx];
			if (item === void 0) continue;
			out[idx] = await fn(item);
		}
	});
	await Promise.all(workers);
	return out;
}
async function runImportChannels(dataRaw) {
	applyYoutubePullPacing(dataRaw);
	const data = parseImport(dataRaw);
	const compact = data.items.length > 1 || data.items.some((item) => item.kind === "youtube");
	const failureReasons = /* @__PURE__ */ new Map();
	const failureDetails = /* @__PURE__ */ new Map();
	const rows = await mapPool(data.items, PROVIDER_BUDGETS.importWorkers, async (item) => {
		for (let attempt = 0; attempt < PROVIDER_BUDGETS.importAttempts; attempt += 1) try {
			if (item.kind === "twitch") return await followTwitch(item.query, compact);
			let result;
			if (youtubePlaylistId(item.query)) result = await youtubeFromPlaylist(item.query, !compact);
			else {
				const channelId = await resolveYoutubeCreator(item.query);
				result = await youtubeFromChannel(channelId, 24, false, true, void 0, void 0, void 0, item.query).catch((error) => ({
					channel: {
						id: `yt:${channelId}`,
						kind: "youtube",
						handle: `https://www.youtube.com/channel/${channelId}`,
						channelId,
						title: item.query,
						lastResponseCount: 0,
						catalogCheckedAt: Date.now(),
						lastProviderFailure: classifyProviderFailure("youtube", error)
					},
					videos: []
				}));
			}
			return {
				...result,
				channel: {
					...result.channel,
					importQuery: item.query
				}
			};
		} catch (error) {
			const failure = classifyProviderFailure(item.kind, error);
			failureReasons.set(item.query, failure.message);
			failureDetails.set(item.query, failure);
			if (item.kind === "youtube" && youtubeRetryAt()) break;
			if (item.kind === "youtube" && failure.message.includes("unique exact")) break;
			if (failure.kind === "response-budget") break;
			if (!attempt) await new Promise((resolve) => setTimeout(resolve, 350));
		}
		return null;
	});
	const ok = [];
	const failedQueries = [];
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		if (row) ok.push(row);
		else failedQueries.push(data.items[i]?.query ?? "");
	}
	return {
		ok,
		failed: failedQueries.length,
		failedQueries: failedQueries.filter(Boolean),
		failedReasons: Object.fromEntries(failedQueries.map((query) => [query, failureReasons.get(query) ?? "Public metadata unavailable"])),
		failedFailures: Object.fromEntries(failureDetails),
		...data.items.some((item) => item.kind === "youtube") && youtubeRetryAt() ? {
			providerRetryAt: youtubeRetryAt(),
			providerCooldownScope: youtubeCooldownScope()
		} : {}
	};
}
function parseTwitchUser(data) {
	if (typeof data !== "object" || data === null) throw new Error("Enter your Twitch name");
	const login = twitchLogin(asString(data.login));
	if (!login) throw new Error("Enter your Twitch name");
	return { login };
}
async function twitchGql(query, variables) {
	const res = await fetchProviderMetadata("https://gql.twitch.tv/gql", {
		signal: AbortSignal.timeout(12e3),
		method: "POST",
		headers: {
			"client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
			"content-type": "application/json"
		},
		body: JSON.stringify({
			query,
			variables
		})
	});
	if (!res.ok) return null;
	return await res.json();
}
async function runFetchTwitchFollowing(dataRaw) {
	const login = parseTwitchUser(dataRaw).login;
	if (!await twitchUser(login)) throw new Error(`No Twitch channel named ${login}`);
	for (const q of [`query($login:String!){user(login:$login){follows(first:100){edges{node{login displayName stream{id}}}}}}`, `query($login:String!){user(login:$login){followConnection(first:100){edges{node{login displayName stream{id}}}}}}`]) {
		const user = ((await twitchGql(q, { login }))?.data)?.user;
		if (!user) continue;
		const edges = (user.follows ?? user.followConnection)?.edges ?? [];
		if (!edges.length) continue;
		const channels = [];
		for (const edge of edges) {
			const node = edge.node;
			const handle = node?.login;
			if (!handle) continue;
			channels.push({
				login: handle,
				title: node.displayName ?? handle,
				live: Boolean(node.stream)
			});
		}
		if (channels.length) return {
			channels,
			privateList: false
		};
	}
	return {
		channels: [],
		privateList: true
	};
}
var EPORNER_ORDERS = /* @__PURE__ */ new Set([
	"latest",
	"longest",
	"shortest",
	"top-rated",
	"most-popular",
	"top-weekly",
	"top-monthly"
]);
function parseAdultProviders(raw) {
	const known = new Set(ADULT_PULL_PROVIDERS);
	if (raw === "all" || raw == null) return ADULT_PULL_PROVIDERS.filter(canPullAdult);
	if (Array.isArray(raw)) {
		const out = raw.filter((p) => typeof p === "string" && known.has(p));
		if (!out.length || out.length !== raw.length || out.some((id) => !canPullAdult(id))) throw Error("Choose an active supported Adult pull source. Unsupported destinations are link-out only.");
		return [...new Set(out)];
	}
	if (typeof raw === "string" && known.has(raw) && canPullAdult(raw)) return [raw];
	throw Error("Choose an active supported Adult pull source.");
}
function parseProviderPages(raw) {
	if (!raw || typeof raw !== "object") return {};
	const known = new Set(ADULT_PULL_PROVIDERS);
	const out = {};
	for (const [key, value] of Object.entries(raw)) {
		if (!known.has(key)) continue;
		const n = typeof value === "number" ? value : Number(value);
		if (!Number.isFinite(n) || n < 1) continue;
		out[key] = Math.min(Math.floor(n), 1e5);
	}
	return out;
}
/** Allows the complete saved library collection while keeping request size bounded. */
var MAX_REDDIT_SOURCE_PREFERENCES = 720;
function parseRedditSources(raw) {
	if (!Array.isArray(raw)) return [];
	const unique = /* @__PURE__ */ new Map();
	for (const value of raw.slice(0, MAX_REDDIT_SOURCE_PREFERENCES)) {
		const row = asRecord(value);
		const subreddit = asString(row?.subreddit).trim().replace(/^r\//i, "");
		if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) continue;
		const rawPriority = Number(row?.priority);
		const priority = rawPriority >= 3 ? 3 : rawPriority <= 1 ? 1 : 2;
		unique.set(subreddit.toLowerCase(), {
			subreddit,
			priority
		});
	}
	return [...unique.values()];
}
function parseAdultSearch(data) {
	const rec = typeof data === "object" && data !== null ? data : {};
	const query = asString(rec.query).trim() || "all";
	const orderRaw = asString(rec.order).trim() || "top-weekly";
	const order = EPORNER_ORDERS.has(orderRaw) ? orderRaw : "top-weekly";
	const pageNum = typeof rec.page === "number" ? rec.page : Number(rec.page);
	const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.min(Math.floor(pageNum), 1e5) : 1;
	const maxRaw = typeof rec.maxVideos === "number" ? rec.maxVideos : Number(rec.maxVideos);
	const maxVideos = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.max(1, Math.min(Math.floor(maxRaw), 1e3)) : 160;
	const append = Boolean(rec.append);
	return {
		query: query.slice(0, 80),
		order,
		page,
		maxVideos,
		append,
		providers: parseAdultProviders(rec.providers),
		providerPages: parseProviderPages(rec.providerPages),
		providerOffsets: Object.fromEntries(Object.entries(parseProviderPages(rec.providerOffsets)).map(([key, value]) => [key, Math.min(value, 1e4)])),
		redditSources: parseRedditSources(rec.redditSources)
	};
}
function epornerVideo(row) {
	const id = typeof row.id === "number" && Number.isSafeInteger(row.id) && row.id > 0 ? String(row.id) : asString(row.id).trim();
	const title = asString(row.title).trim();
	const embed = asString(row.embed).trim();
	const watch = asString(row.url).trim();
	if (!id || !title || !embed) return null;
	if (!embed.startsWith("https://www.eporner.com/embed/")) return null;
	const added = adultPublication(row.added);
	const rawThumb = asString(row.default_thumb?.src);
	const thumbFallbacks = expandAdultThumbFallbacks(rawThumb);
	const thumb = thumbFallbacks[0] ?? (isUsableAdultThumb(rawThumb) ? rawThumb : "");
	const keywords = asString(row.keywords).trim();
	const views = typeof row.views === "number" && Number.isFinite(row.views) ? row.views : void 0;
	return {
		id: `eporner:${id}`,
		folderId: EPORNER_FOLDER_ID,
		name: title,
		path: `eporner/${title}`,
		extension: "eporner",
		mime: "video/eporner",
		size: 0,
		duration: typeof row.length_sec === "number" ? row.length_sec : void 0,
		addedAt: added,
		tagline: keywords.slice(0, 160) || void 0,
		description: keywords || void 0,
		poster: thumb || void 0,
		src: embed,
		remote: {
			kind: "eporner",
			...adultPublicationFields(row.added),
			videoId: id,
			channelName: "Eporner",
			views,
			observedAt: Date.now(),
			embedUrl: embed.endsWith("/") ? embed : `${embed}/`,
			watchUrl: watch || `https://www.eporner.com/video-${id}/`,
			previewUrl: (thumbFallbacks[1] ?? thumb) || void 0,
			thumbFallbacks: thumbFallbacks.length ? thumbFallbacks.slice(0, 6) : void 0
		}
	};
}
async function fetchEpornerPageOnce(query, order, page, perPage) {
	const res = await cachedAdultFetch(`https://www.eporner.com/api/v2/video/search/?${new URLSearchParams({
		query,
		per_page: String(perPage),
		page: String(page),
		thumbsize: "medium",
		order,
		gay: "0",
		lq: "0",
		format: "json"
	}).toString()}`, {
		signal: AbortSignal.timeout(8e3),
		cacheTtlMs: 72e4,
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)"
		}
	});
	if (!res.ok) throw new Error(`Eporner API HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
	const json = await res.json();
	const videos = adultRows("eporner", json, ["videos"], ["id"], ["title", "embed"]).map(epornerVideo).filter((v) => v != null);
	return {
		videos,
		totalPages: typeof json.total_pages === "number" ? json.total_pages : page,
		totalCount: typeof json.total_count === "number" ? json.total_count : videos.length
	};
}
async function fetchEpornerPage(query, order, page, perPage) {
	try {
		return await fetchEpornerPageOnce(query, order, page, perPage);
	} catch {}
	return fetchEpornerPageOnce(query, order === "latest" ? "top-weekly" : "latest", page, Math.min(perPage, 120));
}
function parseClockDuration(raw) {
	const parts = raw.trim().split(":").map((p) => Number(p));
	if (!parts.length || parts.some((n) => !Number.isFinite(n))) return void 0;
	if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
	if (parts.length === 2) return parts[0] * 60 + parts[1];
	if (parts.length === 1) return parts[0];
}
function redtubeTagNames(tags) {
	if (!Array.isArray(tags)) return [];
	const out = [];
	for (const row of tags) {
		const clean = (typeof row === "object" && row !== null ? "tag_name" in row ? asString(row.tag_name) : asString(row.tag?.tag_name) : "").trim();
		if (clean) out.push(clean);
	}
	return out;
}
function redtubeVideo(row) {
	const id = String(row.video_id ?? "").trim();
	const title = asString(row.title).trim();
	const embed = asString(row.embed_url).trim();
	const watch = asString(row.url).trim();
	if (!id || !title || !embed) return null;
	if (!embed.startsWith("https://embed.redtube.com/")) return null;
	const tags = redtubeTagNames(row.tags);
	const stars = redtubeStarNames(row.stars);
	const keywords = [...stars, ...tags].join(", ");
	const picked = pickRedtubeThumb(row);
	const thumb = picked.poster ?? "";
	const added = adultPublication(row.publish_date);
	const views = typeof row.views === "number" && Number.isFinite(row.views) ? row.views : void 0;
	const creator = stars[0] || "RedTube";
	return {
		id: `redtube:${id}`,
		folderId: REDTUBE_FOLDER_ID,
		name: title,
		path: `redtube/${title}`,
		extension: "redtube",
		mime: "video/redtube",
		size: 0,
		duration: parseClockDuration(asString(row.duration)),
		addedAt: added,
		tagline: keywords.slice(0, 160) || void 0,
		description: keywords || void 0,
		poster: thumb || void 0,
		src: embed,
		remote: {
			kind: "redtube",
			publishedPrecision: added ? "instant" : "unknown",
			videoId: id,
			channelName: creator,
			views,
			observedAt: Date.now(),
			embedUrl: embed,
			watchUrl: watch || `https://www.redtube.com/${id}`,
			previewUrl: picked.previewUrl || thumb || void 0,
			thumbFallbacks: picked.thumbFallbacks
		}
	};
}
function redtubeOrdering(order) {
	switch (order) {
		case "latest": return { ordering: "newest" };
		case "top-rated": return {
			ordering: "rating",
			period: "alltime"
		};
		case "most-popular": return {
			ordering: "mostviewed",
			period: "alltime"
		};
		case "top-monthly": return {
			ordering: "mostviewed",
			period: "monthly"
		};
		default: return {
			ordering: "mostviewed",
			period: "weekly"
		};
	}
}
async function fetchRedtubePage(query, order, page) {
	const { ordering, period } = redtubeOrdering(order);
	const params = new URLSearchParams({
		data: "redtube.Videos.searchVideos",
		output: "json",
		thumbsize: "big",
		page: String(page),
		ordering
	});
	if (period) params.set("period", period);
	const q = query.trim();
	if (q && q.toLowerCase() !== "all") {
		params.set("search", q);
		params.append("stars[]", q);
	}
	const res = await cachedAdultFetch(`https://api.redtube.com/?${params.toString()}`, {
		signal: AbortSignal.timeout(2e4),
		cacheTtlMs: 72e4,
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)"
		}
	});
	if (!res.ok) throw new Error(`RedTube API HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
	const json = await res.json();
	if (json.message && json.code) throw new Error(json.message);
	const videos = adultRows("redtube", json, ["videos"], ["video_id"], ["title", "embed_url"]).map((row) => {
		const video = row && typeof row === "object" && "video" in row ? row.video : row;
		return video ? redtubeVideo(video) : null;
	}).filter((v) => v != null);
	const totalCount = typeof json.count === "number" ? json.count : videos.length;
	const perPage = LIBRARY_LIMITS.redtubePageSize;
	return {
		videos,
		totalCount,
		totalPages: Math.max(1, Math.ceil(totalCount / perPage))
	};
}
var ADULT_CSAM = /loli|shota|lolicon|shotacon|\bchild\b|underage|\bcub\b|toddler|infant|\bbaby\b|pedo|preteen|young.?girl|young.?boy|jailbait/i;
function adultBlockedText(...parts) {
	return ADULT_CSAM.test(parts.filter(Boolean).join(" "));
}
function chaturbateVideo(row) {
	const username = asString(row.username).trim().toLowerCase();
	if (!username || !/^[a-z0-9_]+$/.test(username)) return null;
	const show = asString(row.current_show).trim().toLowerCase() || "public";
	if (show !== "public" && show !== "group") return null;
	if (typeof row.age === "number" && Number.isFinite(row.age) && row.age < 18) return null;
	const tags = Array.isArray(row.tags) ? row.tags.map((tag) => asString(tag).trim()).filter(Boolean) : [];
	const subject = asString(row.room_subject).trim();
	const display = asString(row.display_name).trim() || username;
	if (adultBlockedText(username, display, subject, tags.join(" "))) return null;
	const embed = `https://chaturbate.com/embed/${encodeURIComponent(username)}/`;
	const watch = asString(row.chat_room_url).trim() || `https://chaturbate.com/${encodeURIComponent(username)}/`;
	const thumb360 = asString(row.image_url_360x270).trim();
	const thumbOriginal = asString(row.image_url).trim();
	const thumb = thumb360 || thumbOriginal;
	const viewers = typeof row.num_users === "number" && Number.isFinite(row.num_users) ? row.num_users : void 0;
	return {
		id: `chaturbate:${username}`,
		folderId: CHATURBATE_FOLDER_ID,
		name: display,
		path: `chaturbate/${username}`,
		extension: "chaturbate",
		mime: "video/chaturbate",
		size: 0,
		addedAt: Date.now(),
		tagline: subject.slice(0, 160) || void 0,
		description: [subject, ...tags].filter(Boolean).join(", ") || void 0,
		poster: thumb || void 0,
		src: embed,
		remote: {
			kind: "chaturbate",
			videoId: username,
			channelName: username,
			live: true,
			viewers,
			observedAt: Date.now(),
			embedUrl: embed,
			watchUrl: watch,
			previewUrl: thumb || void 0,
			thumbFallbacks: [thumb360, thumbOriginal].filter(isUsableAdultThumb)
		}
	};
}
async function fetchChaturbateRooms(query, maxVideos, offset = 0) {
	const limit = Math.max(1, Math.min(500, Math.floor(maxVideos)));
	const url = new URL("https://chaturbate.com/api/public/affiliates/onlinerooms/");
	url.search = new URLSearchParams({
		wm: "DkfRj",
		client_ip: "request_ip",
		limit: String(limit),
		offset: String(offset)
	}).toString();
	const res = await cachedAdultFetch(url.href, {
		signal: AbortSignal.timeout(12e3),
		cacheTtlMs: 6e4,
		headers: { accept: "application/json" }
	});
	if (!res.ok) throw new Error("Chaturbate rooms HTTP " + res.status + (res.status === 429 ? " (rate limited)" : ""));
	const data = await res.json();
	if (!Array.isArray(data.results) || !Number.isFinite(data.count)) throw new Error("Chaturbate returned an unreadable directory. Previous rooms were kept.");
	const checkedAt = Number(res.headers.get("x-reelcase-observed-at")) || Date.now();
	const needle = query.trim().toLowerCase();
	const videos = adultRows("chaturbate", data, ["results"], ["username"]).map(chaturbateVideo).filter((video) => Boolean(video)).filter((video) => !needle || needle === "all" || (video.name + " " + (video.description ?? "") + " " + video.remote?.videoId).toLowerCase().includes(needle)).map((video) => ({
		...video,
		remote: {
			...video.remote,
			observedAt: checkedAt
		}
	}));
	const totalCount = Math.max(0, Math.floor(data.count));
	return {
		videos,
		totalPages: Math.ceil(totalCount / limit),
		totalCount,
		checkedAt,
		nextOffset: data.results.length && offset + data.results.length < totalCount ? offset + data.results.length : null
	};
}
var myfreecamsCache = null;
var MYFREECAMS_CACHE_MS = 18e4;
var MYFREECAMS_PUBLIC_STATE = 0;
var MYFREECAMS_PROFILE_SUCCESS_CACHE_MS = 12e5;
var MYFREECAMS_PROFILE_MISS_CACHE_MS = 24e4;
var myfreecamsPreviewCache = /* @__PURE__ */ new Map();
function myfreecamsWatchUrl(username) {
	return `https://www.myfreecams.com/#${encodeURIComponent(username)}`;
}
function myfreecamsVideo(username, status) {
	if (status !== MYFREECAMS_PUBLIC_STATE) return null;
	const name = username.trim();
	if (!/^[A-Za-z0-9_]{2,32}$/.test(name)) return null;
	if (adultBlockedText(name)) return null;
	const watch = myfreecamsWatchUrl(name);
	return {
		id: `myfreecams:${name.toLowerCase()}`,
		folderId: MYFREECAMS_FOLDER_ID,
		name,
		path: `myfreecams/${name}`,
		extension: "myfreecams",
		mime: "video/myfreecams",
		size: 0,
		addedAt: Date.now(),
		tagline: "Live on MyFreeCams",
		description: "live, cam, public room",
		src: watch,
		remote: {
			kind: "myfreecams",
			videoId: name,
			channelName: name,
			live: true,
			observedAt: Date.now(),
			watchUrl: watch
		}
	};
}
function myfreecamsStateNumber(value) {
	if (typeof value !== "number" && typeof value !== "string") return null;
	const state = Number(value);
	return Number.isInteger(state) && state >= 0 && state <= 127 ? state : null;
}
function myfreecamsListing(payload) {
	const text = payload.replace(/\\u0022/gi, "\"").replace(/\\"/g, "\"");
	const pairs = /* @__PURE__ */ new Map();
	const add = (name, status) => {
		if (typeof name !== "string") return;
		const display = name.trim();
		const state = myfreecamsStateNumber(status);
		if (!/^[A-Za-z0-9_]{2,32}$/.test(display) || state == null) return;
		pairs.set(display.toLowerCase(), {
			name: display,
			state
		});
	};
	const walkJson = (value) => {
		if (Array.isArray(value)) {
			if (typeof value[0] === "string" && myfreecamsStateNumber(value[1]) != null) add(value[0], value[1]);
			for (const item of value) walkJson(item);
			return;
		}
		if (!value || typeof value !== "object") return;
		const row = value;
		const name = row.username ?? row.user_name ?? row.model ?? row.model_name ?? row.name;
		const state = row.vs ?? row.video_state ?? row.videoState ?? row.status ?? row.state;
		if (typeof name === "string" && myfreecamsStateNumber(state) != null) add(name, state);
		for (const [key, nested] of Object.entries(row)) {
			if (myfreecamsStateNumber(nested) != null) add(key, nested);
			if (nested && typeof nested === "object") walkJson(nested);
		}
	};
	try {
		const trimmed = text.trim();
		if (trimmed.startsWith("{") || trimmed.startsWith("[")) walkJson(JSON.parse(trimmed));
	} catch {}
	for (const line of text.split(/<br\s*\/?>|\r?\n/gi)) {
		const match = line.replace(/<[^>]+>/g, " ").trim().match(/^([A-Za-z0-9_]{2,32})\s*[,|:]\s*(\d{1,3})\b/);
		if (match) add(match[1], match[2]);
	}
	for (const match of text.matchAll(/["']([A-Za-z0-9_]{2,32})["']\s*:\s*["']?(\d{1,3})\b/g)) add(match[1], match[2]);
	for (const match of text.matchAll(/(?:^|[\x5B,{;\s>])([A-Za-z0-9_]{2,32})\s*[,|\s:]\s*(\d{1,3})\b/gm)) add(match[1], match[2]);
	for (const match of text.matchAll(/["']([A-Za-z0-9_]{2,32})["']\s*,\s*["']?(\d{1,3})\b/g)) add(match[1], match[2]);
	const states = /* @__PURE__ */ new Map();
	for (const { state } of pairs.values()) states.set(state, (states.get(state) ?? 0) + 1);
	return {
		rooms: [...pairs.values()].map(({ name, state }) => myfreecamsVideo(name, state)).filter((video) => video != null),
		rows: pairs.size,
		publicRows: states.get(MYFREECAMS_PUBLIC_STATE) ?? 0,
		states
	};
}
function myfreecamsPreviewFresh(preview, now) {
	return now - preview.at <= (preview.poster ? MYFREECAMS_PROFILE_SUCCESS_CACHE_MS : MYFREECAMS_PROFILE_MISS_CACHE_MS);
}
function withMyFreeCamsPreview(video, preview) {
	if (!preview?.poster || !video.remote) return video;
	const thumbs = [.../* @__PURE__ */ new Set([preview.poster, ...video.remote.thumbFallbacks ?? []])].filter(isUsableAdultThumb).slice(0, 4);
	return {
		...video,
		poster: preview.poster,
		remote: {
			...video.remote,
			channelId: preview.modelId ?? video.remote.channelId,
			previewUrl: preview.poster,
			thumbFallbacks: thumbs
		}
	};
}
async function myfreecamsRoomsWithPreviews(rooms) {
	const now = Date.now();
	const previews = /* @__PURE__ */ new Map();
	for (const room of rooms) {
		const username = room.remote?.videoId ?? room.name;
		const cached = myfreecamsPreviewCache.get(username.toLowerCase());
		if (cached && myfreecamsPreviewFresh(cached, now)) previews.set(username.toLowerCase(), cached);
	}
	return rooms.map((room) => withMyFreeCamsPreview(room, previews.get((room.remote?.videoId ?? room.name).toLowerCase())));
}
function myfreecamsStateSummary(states) {
	return [...states.entries()].sort((a, b) => a[0] - b[0]).map(([state, count]) => `${state}: ${count}`).join(", ");
}
async function fetchMyFreeCamsRooms(query, maxVideos, offset = 0) {
	if ((!myfreecamsCache || Date.now() - myfreecamsCache.at > MYFREECAMS_CACHE_MS) && (!myfreecamsCache?.failedAt || Date.now() - myfreecamsCache.failedAt > 6e4)) {
		const priorRooms = myfreecamsCache?.rooms ?? [];
		try {
			const res = await cachedAdultFetch("https://www.myfreecams.com/php/online_models.php", {
				cacheTtlMs: 18e4,
				signal: AbortSignal.timeout(12e3),
				headers: {
					accept: "text/plain, text/html;q=0.8",
					referer: "https://www.myfreecams.com/#Homepage",
					"accept-language": "en-US,en;q=0.8",
					"user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)"
				}
			});
			if (!res.ok) throw new Error(`MyFreeCams public list HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
			const payload = await res.text();
			const listing = myfreecamsListing(payload);
			if (!listing.rows && payload.trim() !== "[]" && !/^\s*Updated:[^<\r\n]*(?:<br\s*\/?>)?\s*$/i.test(payload)) throw new Error("MyFreeCams returned an unreadable public list. Previous rooms were kept.");
			if (!listing.rooms.length && listing.publicRows) {
				const states = myfreecamsStateSummary(listing.states);
				throw new Error(listing.publicRows ? `MyFreeCams listed ${listing.publicRows} public broadcast rows, but none had a usable safe room name.` : `MyFreeCams listed ${listing.rows} online rows but no public broadcasts (states: ${states || "unknown"}).`);
			}
			const rooms = listing.rooms.length ? await myfreecamsRoomsWithPreviews(listing.rooms) : [];
			myfreecamsCache = {
				at: Number(res.headers.get("x-reelcase-observed-at")) || Date.now(),
				rooms
			};
			for (const room of rooms) if (room.remote) room.remote.observedAt = myfreecamsCache.at;
		} catch (error) {
			if (priorRooms.length) myfreecamsCache = {
				...myfreecamsCache,
				rooms: priorRooms,
				failedAt: Date.now(),
				error: adultPullFailureDetail(error)
			};
			else throw error;
		}
	}
	const needle = query.trim().toLowerCase();
	const filtered = !needle || needle === "all" ? myfreecamsCache.rooms : myfreecamsCache.rooms.filter((video) => video.name.toLowerCase().includes(needle));
	return {
		videos: filtered.slice(offset, offset + maxVideos),
		totalPages: Math.ceil(filtered.length / maxVideos),
		totalCount: filtered.length,
		checkedAt: myfreecamsCache.at,
		stale: Boolean(myfreecamsCache.error),
		error: myfreecamsCache.error,
		retryAt: myfreecamsCache.failedAt ? myfreecamsCache.failedAt + 6e4 : void 0,
		nextOffset: offset + maxVideos < filtered.length ? offset + maxVideos : null
	};
}
var liveRoomInflight = /* @__PURE__ */ new Map();
function runFetchLiveRooms(raw) {
	const request = liveRoomRequest(raw), key = request.provider + ":" + request.offset + ":" + request.limit;
	const prior = liveRoomInflight.get(key);
	if (prior) return prior;
	const work = (async () => {
		const result = request.provider === "chaturbate" ? await fetchChaturbateRooms("all", request.limit, request.offset) : await fetchMyFreeCamsRooms("all", request.limit, request.offset);
		return {
			provider: request.provider,
			videos: result.videos,
			offset: request.offset,
			nextOffset: result.nextOffset,
			total: result.totalCount,
			checkedAt: result.checkedAt,
			stale: "stale" in result ? result.stale : false,
			..."error" in result ? {
				error: result.error,
				retryAt: result.retryAt
			} : {}
		};
	})().finally(() => liveRoomInflight.delete(key));
	liveRoomInflight.set(key, work);
	return work;
}
function htmlDecode(value) {
	return value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#32;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_all, hex, decimal) => {
		const codePoint = Number.parseInt(hex ?? decimal ?? "", hex ? 16 : 10);
		return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _all;
	});
}
function xmlField(xml, pattern) {
	return htmlDecode(pattern.exec(xml)?.[1] ?? "").trim();
}
/** Atom does not prescribe an attribute order. Reddit currently places `rel`
* before `href`, so never assume the first attribute is the target URL. */
function redditPermalink(entry) {
	const links = [...entry.matchAll(/<link\b[^>]*>/gi)];
	let first = "";
	for (const [tag] of links) {
		const href = xmlField(tag, /\bhref\s*=\s*["']([^"']+)["']/i);
		if (!href) continue;
		if (!first) first = href;
		const rel = xmlField(tag, /\brel\s*=\s*["']([^"']+)["']/i);
		if (/\balternate\b/i.test(rel)) return href;
	}
	return first;
}
function redgifsEmbedUrl(url) {
	const slug = url?.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1] ?? url?.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1] ?? url?.match(/https?:\/\/(?:i|media)\.redgifs\.com\/([a-z0-9_-]+)(?:[._-]|$)/i)?.[1];
	return slug ? `https://www.redgifs.com/ifr/${encodeURIComponent(slug)}` : void 0;
}
function redditVideo(entry, subreddit) {
	const id = xmlField(entry, /<id>([^<]+)<\/id>/i).replace(/^t3_/, "") || xmlField(entry, /\/comments\/([a-z0-9]+)\//i);
	const title = xmlField(entry, /<title>([^<]+)<\/title>/i);
	const permalink = redditPermalink(entry);
	const author = xmlField(entry, /<name>([^<]+)<\/name>/i).replace(/^\/u\//, "");
	const published = xmlField(entry, /<published>([^<]+)<\/published>/i);
	const content = xmlField(entry, /<content[^>]*>([\s\S]*?)<\/content>/i);
	if (!id || !title || !permalink) return null;
	const media = extractRedditMedia(entry, content);
	if (!shouldKeepRedditEntry(media, title)) return null;
	const flair = extractRedditFlair(entry, content);
	if (adultBlockedText(title, author, subreddit, flair, media.poster, media.src, media.watch)) return null;
	const addedAt = adultPublication(published);
	const poster = media.poster ?? media.thumbFallbacks?.[0];
	const isImage = media.kind === "image";
	const isVideo = media.kind === "video";
	const directMedia = media.src && /\.(?:mp4|webm|gifv)(?:\?|$)/i.test(media.src) ? media.src : void 0;
	const redgifsEmbed = redgifsEmbedUrl(media.watch ?? media.thumbFallbacks?.[0]);
	const redditEmbed = isVideo ? `https://www.redditmedia.com/r/${encodeURIComponent(subreddit)}/comments/${encodeURIComponent(id)}/?ref_source=embed&ref=share&embed=true` : void 0;
	return {
		id: `reddit:${id}`,
		folderId: REDDIT_FOLDER_ID,
		name: title.slice(0, 160),
		path: `reddit/${subreddit}/${id}`,
		extension: isImage ? "image" : isVideo ? "reddit" : "reddit",
		mime: isImage ? "image/jpeg" : isVideo ? "video/reddit" : "text/html",
		size: 0,
		addedAt,
		tagline: `r/${subreddit}${author ? ` · u/${author}` : ""}${flair ? ` · ${flair}` : ""}${isVideo ? " · video" : isImage ? " · photo" : ""}`,
		description: `reddit, r/${subreddit}, ${subreddit.replace(/_/g, " ")}, ${title}, ${flair}, ${media.watch ?? ""}`,
		poster: poster || void 0,
		src: isImage ? media.src || poster || permalink : directMedia || void 0,
		remote: {
			kind: "reddit",
			...adultPublicationFields(published),
			sourceKinds: redgifsEmbed ? ["reddit", "redgifs"] : ["reddit"],
			videoId: id,
			channelName: author || `r/${subreddit}`,
			channelId: subreddit,
			observedAt: Date.now(),
			embedUrl: directMedia || redgifsEmbed || redditEmbed,
			watchUrl: permalink,
			previewUrl: poster,
			thumbFallbacks: [poster, ...media.thumbFallbacks ?? []].filter((url) => Boolean(url)).slice(0, 8)
		}
	};
}
/** Rotate through the curated catalog so refreshes sample many subs over time. */
function redditSubWindow(page, configuredSources = []) {
	const configured = configuredSources.length ? [...configuredSources].sort((a, b) => b.priority - a.priority || a.subreddit.localeCompare(b.subreddit)).map((row) => row.subreddit) : (() => {
		const priority = ADULT_REDDIT_PRIORITY_SUBS.map((sub) => sub.toLowerCase());
		const rest = ADULT_REDDIT_SUBS.filter((sub) => !priority.includes(sub.toLowerCase()));
		return [...ADULT_REDDIT_PRIORITY_SUBS, ...rest];
	})();
	const all = [...new Map(configured.map((sub) => [sub.toLowerCase(), sub])).values()];
	const size = Math.max(1, LIBRARY_LIMITS.redditSubsPerPull);
	const totalPages = Math.max(1, Math.ceil(all.length / size));
	const tick = configured.length ? 0 : Math.floor(Date.now() / 12e5);
	const start = ((Math.max(1, page) - 1) * size + tick * 5) % all.length;
	const subs = [];
	for (let i = 0; i < Math.min(size, all.length); i += 1) subs.push(all[(start + i) % all.length]);
	return {
		subs,
		start,
		totalPages
	};
}
async function fetchRedditSubRss(sub, sort) {
	const path = sort === "new" ? `/r/${encodeURIComponent(sub)}/new/.rss` : `/r/${encodeURIComponent(sub)}/.rss`;
	let xml = "";
	let failure = "";
	const urls = [`https://www.reddit.com${path}?limit=${LIBRARY_LIMITS.redditPostsPerSub}`, `https://old.reddit.com${path}?limit=${LIBRARY_LIMITS.redditPostsPerSub}`];
	for (const url of urls) {
		try {
			const res = await cachedAdultFetch(url, {
				signal: AbortSignal.timeout(7e3),
				cacheTtlMs: 6e5,
				headers: {
					accept: "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
					"user-agent": "linux:reelcase:1.0 (by /u/reelcase)"
				}
			});
			if (res.ok) {
				xml = await res.text();
				break;
			}
			failure = res.status === 429 ? "rate limited" : `HTTP ${res.status}`;
			if (res.status === 429) break;
		} catch (err) {
			failure = err instanceof Error ? err.message : "network unavailable";
		}
		if (!xml) await new Promise((resolve) => setTimeout(resolve, 400));
	}
	if (!xml) throw new Error(failure || "empty feed");
	validateAdultAtom(xml);
	const posts = [];
	for (const match of xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)) {
		const video = redditVideo(match[1] ?? "", sub);
		if (video) posts.push(video);
	}
	return posts;
}
async function fetchRedditFeed(query, maxVideos, page = 1, configuredSources = []) {
	configuredSources.length ? Math.max(1, Math.ceil(configuredSources.length / LIBRARY_LIMITS.redditSubsPerPull)) : LIBRARY_LIMITS.redditWindowsPerPull;
	const windows = 1;
	const collected = [];
	const seen = /* @__PURE__ */ new Set();
	const errors = [];
	let lastTotalPages = 1;
	for (let offset = 0; offset < windows && collected.length < maxVideos; offset += 1) {
		const { subs, start, totalPages } = redditSubWindow(page + offset, configuredSources);
		lastTotalPages = totalPages;
		const batches = await mapPool(subs.map((sub) => ({
			sub,
			sort: "hot"
		})), LIBRARY_LIMITS.redditFetchConcurrency, async (job) => {
			try {
				return await fetchRedditSubRss(job.sub, job.sort);
			} catch (err) {
				const message = err instanceof Error ? err.message : "unavailable";
				errors.push(`r/${job.sub}/${job.sort}: ${message}`);
				return [];
			}
		});
		for (const batch of batches) {
			for (const video of batch) {
				if (seen.has(video.id)) continue;
				seen.add(video.id);
				collected.push(video);
				if (collected.length >= maxVideos) break;
			}
			if (collected.length >= maxVideos) break;
		}
	}
	const needle = query.trim().toLowerCase();
	const filtered = !needle || needle === "all" ? collected : collected.filter((video) => {
		return `${video.name} ${video.tagline ?? ""} ${video.description ?? ""}`.toLowerCase().includes(needle);
	});
	if (errors.length && !collected.length) throw Error("Reddit community window incomplete; previous results and cursor were kept. " + errors.length + " feeds need retry.");
	const nextPage = page + windows <= lastTotalPages * 6 ? page + windows : null;
	return {
		videos: filtered.slice(0, maxVideos),
		totalPages: lastTotalPages,
		totalCount: filtered.length,
		nextPage: errors.length ? page : nextPage,
		...errors.length ? { warning: "Reddit community window incomplete; healthy rows were kept and the same window needs retry." } : {}
	};
}
var BOORU_HOSTS = [
	{
		id: "rule34",
		base: "https://rule34.xxx",
		apiBase: "https://api.rule34.xxx",
		postPath: "/index.php?page=post&s=view&id="
	},
	{
		id: "gelbooru",
		base: "https://gelbooru.com",
		apiBase: "https://gelbooru.com",
		postPath: "/index.php?page=post&s=view&id="
	},
	{
		id: "realbooru",
		base: "https://realbooru.com",
		postPath: "/index.php?page=post&s=view&id="
	},
	{
		id: "xbooru",
		base: "https://xbooru.com",
		postPath: "/index.php?page=post&s=view&id="
	},
	{
		id: "tbib",
		base: "https://tbib.org",
		postPath: "/index.php?page=post&s=view&id="
	},
	{
		id: "hypnohub",
		base: "https://hypnohub.net",
		postPath: "/index.php?page=post&s=view&id="
	}
];
function normalizedBooruUrl(value, host) {
	const decoded = decodeBooruHtml(value).trim();
	if (!decoded) return "";
	if (decoded.startsWith("//")) return `https:${decoded}`;
	if (decoded.startsWith("/")) return `${host.base}${decoded}`;
	return decoded;
}
function booruVideo(row, host) {
	const id = typeof row.id === "number" && Number.isSafeInteger(row.id) && row.id > 0 ? String(row.id) : asString(row.id).trim();
	const tags = asString(row.tags).trim();
	const owner = pickString(row.owner, row.creator, row.uploader).trim();
	const preview = normalizedBooruUrl(asString(row.preview_url), host);
	const sample = normalizedBooruUrl(asString(row.sample_url), host);
	const file = normalizedBooruUrl(asString(row.file_url), host);
	const image = file || sample || preview;
	if (!id || !image) return null;
	if (adultBlockedText(tags, owner)) return null;
	const title = (tags.split(/\s+/).filter(Boolean).slice(0, 8).join(" ") || `${host.id} #${id}`).slice(0, 160);
	const watch = `${host.base}${host.postPath}${encodeURIComponent(id)}`;
	return {
		id: `booru:${host.id}:${id}`,
		folderId: BOORU_FOLDER_ID,
		name: title,
		path: `booru/${host.id}/${id}`,
		extension: "image",
		mime: "image/jpeg",
		size: 0,
		addedAt: adultPublication(asRecord(row)?.created_at),
		tagline: `${host.id} · photo${owner ? ` · ${owner}` : ""}`,
		description: tags.slice(0, 400),
		poster: sample || preview || void 0,
		src: image,
		remote: {
			kind: "booru",
			...adultPublicationFields(asRecord(row)?.created_at),
			videoId: id,
			channelName: owner || host.id,
			channelId: host.id,
			observedAt: Date.now(),
			embedUrl: image,
			watchUrl: watch,
			previewUrl: sample || preview || void 0,
			thumbFallbacks: [
				sample,
				preview,
				file
			].filter(isUsableAdultThumb).slice(0, 4)
		}
	};
}
function decodeBooruHtml(value) {
	return value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function booruMarkupAttribute(markup, name) {
	const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = markup.match(new RegExp(`\\b${escaped}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
	return match ? decodeBooruHtml(match[2] ?? "") : "";
}
function booruPostsFromXml(xml) {
	const rows = [];
	for (const match of xml.matchAll(/<post\b([\s\S]*?)(?:\/>|>)/gi)) {
		const attrs = match[1] ?? "";
		const id = booruMarkupAttribute(attrs, "id");
		if (!id) throw Error("booru returned a malformed post identity; previous cursor was kept.");
		rows.push({
			id,
			preview_url: booruMarkupAttribute(attrs, "preview_url"),
			sample_url: booruMarkupAttribute(attrs, "sample_url"),
			file_url: booruMarkupAttribute(attrs, "file_url"),
			tags: booruMarkupAttribute(attrs, "tags"),
			owner: booruMarkupAttribute(attrs, "owner") || booruMarkupAttribute(attrs, "creator") || booruMarkupAttribute(attrs, "uploader")
		});
	}
	return rows;
}
async function fetchBooruListing(host, tags, limit, pid) {
	const params = new URLSearchParams({
		page: "post",
		s: "list",
		tags,
		pid: String(Math.max(0, pid))
	});
	const res = await cachedAdultFetch(`${host.base}/index.php?${params.toString()}`, {
		signal: AbortSignal.timeout(15e3),
		cacheTtlMs: 6e5,
		headers: {
			accept: "text/html,application/xhtml+xml",
			"user-agent": "Mozilla/5.0 (compatible; Realhub/1.0)"
		}
	});
	if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
	const html = await res.text();
	const rows = [];
	for (const match of html.matchAll(/<(?:span|article|li)\b([^>]*\bid=["']s?(\d+)["'][^>]*)>([\s\S]*?)<\/(?:span|article|li)>/gi)) {
		const image = match[3]?.match(/<img\b([\s\S]*?)>/i)?.[1] ?? "";
		const preview = booruMarkupAttribute(image, "data-src") || booruMarkupAttribute(image, "src");
		const postId = match[2] ?? "";
		if (!postId || !preview) continue;
		rows.push({
			id: postId,
			preview_url: preview,
			tags: booruMarkupAttribute(image, "title") || booruMarkupAttribute(image, "alt")
		});
		if (rows.length >= limit) break;
	}
	if (!rows.length) for (const match of html.matchAll(/<span\s+id=["']s(\d+)["'][^>]*>[\s\S]*?<img\b([^>]*)>/gi)) {
		const preview = booruMarkupAttribute(match[2] ?? "", "data-src") || booruMarkupAttribute(match[2] ?? "", "src");
		if (!preview) continue;
		rows.push({
			id: match[1],
			preview_url: preview,
			tags: booruMarkupAttribute(match[2] ?? "", "title") || booruMarkupAttribute(match[2] ?? "", "alt")
		});
		if (rows.length >= limit) break;
	}
	if (!rows.length && !/no (?:posts|images)(?: found| match)|nobody here but us/i.test(html)) throw Error(host.id + " returned an unreadable public listing; previous results and cursor were kept.");
	return rows.map((row) => booruVideo(row, host)).filter((video) => video != null);
}
function rule34PostIdFromQuery(query) {
	const direct = query.match(/(?:rule34\.xxx\/index\.php\?[^\s]*\bid=|(?:^|\s)rule34:)(\d+)/i)?.[1];
	return direct && /^\d+$/.test(direct) ? direct : null;
}
async function fetchRule34Post(host, id) {
	const res = await cachedAdultFetch(`${host.base}${host.postPath}${encodeURIComponent(id)}`, {
		signal: AbortSignal.timeout(15e3),
		cacheTtlMs: 18e5,
		headers: {
			accept: "text/html,application/xhtml+xml",
			"user-agent": "Mozilla/5.0 (compatible; Realhub/1.0)"
		}
	});
	if (!res.ok) throw new Error(`${host.id} post ${id} HTTP ${res.status}`);
	const html = await res.text();
	const found = booruPostImageUrls(html);
	const image = found.original || found.sample;
	const tags = html.match(/<img\b(?=[^>]*\bid="image")[^>]*\balt="([^"]*)"[^>]*>/i)?.[1] ?? "";
	if (!image) throw new Error(`${host.id} post ${id} has no public image`);
	return booruVideo({
		id,
		file_url: decodeBooruHtml(image),
		preview_url: decodeBooruHtml(image),
		tags: decodeBooruHtml(tags)
	}, host);
}
async function fetchBooruJson(host, tags, limit, pid, postId) {
	const params = new URLSearchParams({
		page: "dapi",
		s: "post",
		q: "index",
		json: "1",
		limit: String(limit),
		pid: String(Math.max(0, pid)),
		tags
	});
	if (postId) params.set("id", postId);
	const res = await cachedAdultFetch(`${"apiBase" in host ? host.apiBase : host.base}/index.php?${params.toString()}`, {
		signal: AbortSignal.timeout(postId ? 6e3 : 15e3),
		cacheTtlMs: 6e5,
		headers: {
			accept: "application/json,text/plain,*/*",
			"user-agent": "Realhub/1.0"
		}
	});
	if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
	const body = await res.text();
	let raw;
	try {
		raw = JSON.parse(body);
	} catch {
		const rows = booruPostsFromXml(body);
		if (/^\s*(?:<\?xml[^>]*>\s*)?<posts\b/i.test(body) && (/<\/posts>\s*$/i.test(body) || /<posts[^>]*\/\s*>\s*$/i.test(body))) return rows.map((row) => booruVideo(row, host)).filter((video) => video != null);
		throw new Error(`${host.id} returned an unsupported public feed`);
	}
	const rows = adultRows("booru", raw, ["post", "posts"], ["id"]);
	const out = [];
	for (const row of rows) {
		if (!row || typeof row !== "object") continue;
		const video = booruVideo(row, host);
		if (video) out.push(video);
	}
	return out;
}
async function fetchBooruHost(host, tags, limit, pid) {
	try {
		return await fetchBooruJson(host, tags, limit, pid);
	} catch {}
	return fetchBooruListing(host, tags, limit, pid);
}
function booruTagsForHost(host, needle) {
	const query = needle.trim();
	if (host.id === "gelbooru") return ["rating:explicit", query].filter(Boolean).join(" ");
	return query;
}
async function runBooruOriginal(data) {
	const input = asRecord(data);
	const id = String(input?.id ?? "");
	if (!/^\d{1,12}$/.test(id)) return null;
	const hostId = String(input?.host ?? "tbib");
	const host = BOORU_HOSTS.find((item) => item.id === hostId);
	if (!host && hostId !== "e621") return null;
	try {
		if (hostId === "e621") {
			const response = await cachedAdultFetch(`https://e621.net/posts/${id}.json`, {
				signal: AbortSignal.timeout(1e4),
				cacheTtlMs: 18e5,
				headers: {
					accept: "application/json",
					"user-agent": "Realhub/1.0"
				}
			});
			if (!response.ok) return null;
			const url = asString(asRecord(asRecord(asRecord(await response.json())?.post)?.file)?.url);
			return /^https:\/\//.test(url) ? url : null;
		}
		if (!host) return null;
		if (host.id !== "tbib") try {
			const file = (await fetchBooruJson(host, "", 1, 0, id)).find((card) => card.remote?.videoId === id)?.src;
			if (file && /^https:\/\//.test(file) && !/(?:thumbnails?|samples?|resized)\//i.test(file)) return file;
		} catch {}
		const response = await cachedAdultFetch(`${host.base}${host.postPath}${id}`, {
			signal: AbortSignal.timeout(1e4),
			cacheTtlMs: 18e5,
			headers: {
				accept: "text/html",
				"user-agent": "Mozilla/5.0 (compatible; Realhub/1.0)"
			}
		});
		if (!response.ok) return null;
		const { original } = booruPostImageUrls(await response.text());
		const url = normalizedBooruUrl(original ?? "", host);
		return /^https:\/\//.test(url) ? url : null;
	} catch {
		return null;
	}
}
function e621TagString(tags) {
	if (!tags) return "";
	if (typeof tags === "string") return tags;
	return [
		tags.artist,
		tags.character,
		tags.copyright,
		tags.general,
		tags.meta
	].flatMap((part) => Array.isArray(part) ? part : []).filter(Boolean).join(" ");
}
function e621Video(row) {
	const id = typeof row.id === "number" && Number.isSafeInteger(row.id) && row.id > 0 ? String(row.id) : asString(row.id).trim();
	if (!id) return null;
	const rating = asString(row.rating).trim().toLowerCase();
	if (rating && rating !== "e" && rating !== "explicit") return null;
	const tags = e621TagString(row.tags);
	const preview = asString(row.preview?.url).trim();
	const sample = asString(row.sample?.url).trim();
	const file = asString(row.file?.url).trim();
	const image = file || sample || preview;
	if (!image) return null;
	if (adultBlockedText(tags)) return null;
	const title = (tags.split(/\s+/).filter(Boolean).slice(0, 8).join(" ") || `e621 #${id}`).slice(0, 160);
	const watch = `https://e621.net/posts/${encodeURIComponent(id)}`;
	const thumbs = [
		preview,
		sample,
		file
	].filter(isUsableAdultThumb).slice(0, 4);
	return {
		id: `booru:e621:${id}`,
		folderId: BOORU_FOLDER_ID,
		name: title,
		path: `booru/e621/${id}`,
		extension: "image",
		mime: "image/jpeg",
		size: 0,
		addedAt: adultPublication(asRecord(row)?.created_at),
		tagline: `e621 · photo`,
		description: tags.slice(0, 400),
		poster: thumbs[0] || preview || sample || void 0,
		src: image,
		remote: {
			kind: "booru",
			videoId: id,
			channelName: "e621",
			channelId: "e621",
			observedAt: Date.now(),
			embedUrl: image,
			watchUrl: watch,
			previewUrl: thumbs[0] || preview || sample || void 0,
			thumbFallbacks: thumbs.length ? thumbs : void 0
		}
	};
}
async function fetchE621Page(tags, limit, page) {
	const url = `https://e621.net/posts.json?${new URLSearchParams({
		limit: String(Math.min(80, Math.max(1, limit))),
		page: String(Math.max(1, page)),
		tags
	}).toString()}`;
	const res = await cachedAdultFetch(url, {
		signal: AbortSignal.timeout(15e3),
		cacheTtlMs: 6e5,
		cacheKey: `GET:${url}:e621`,
		headers: {
			accept: "application/json",
			"user-agent": "Realhub/1.0 (adult catalog; local library client)"
		}
	});
	if (!res.ok) throw new Error(`e621 HTTP ${res.status}`);
	const json = await res.json();
	const rows = adultRows("booru", json, ["posts"], ["id"]);
	const out = [];
	for (const row of rows) {
		if (!row || typeof row !== "object") continue;
		const video = e621Video(row);
		if (video) out.push(video);
	}
	return out;
}
async function fetchBooruFeed(query, maxVideos, page) {
	const needle = query.trim().toLowerCase();
	const directRule34Id = rule34PostIdFromQuery(query);
	if (directRule34Id) {
		const video = await fetchRule34Post(BOORU_HOSTS.find((host) => host.id === "rule34"), directRule34Id);
		return {
			videos: video ? [video] : [],
			totalPages: page,
			totalCount: video ? 1 : 0
		};
	}
	const booruQuery = !needle || needle === "all" ? "" : needle;
	const limit = LIBRARY_LIMITS.booruPageSize;
	const pid = Math.max(0, page - 1);
	const collected = [];
	const seen = /* @__PURE__ */ new Set();
	const errors = [];
	const hosts = [...BOORU_HOSTS];
	const slotCount = hosts.length + 2;
	const share = Math.max(1, Math.min(limit, Math.ceil(maxVideos / slotCount)));
	const rotated = [...hosts.slice(pid % hosts.length), ...hosts.slice(0, pid % hosts.length)];
	const rule34 = rotated.find((host) => host.id === "rule34");
	const ordered = rule34 ? [rule34, ...rotated.filter((host) => host.id !== "rule34")] : rotated;
	const e621Tags = !needle || needle === "all" ? "rating:e order:rank" : `rating:e ${needle}`;
	const batches = await Promise.allSettled([...ordered.map((host) => fetchBooruHost(host, booruTagsForHost(host, booruQuery), host.id === "rule34" ? share * 2 : share, pid)), fetchE621Page(e621Tags, share, Math.max(1, page))]);
	for (const [index, result] of batches.entries()) {
		const label = index < ordered.length ? ordered[index].id : "e621";
		if (result.status !== "fulfilled") {
			errors.push(`${label}: ${result.reason instanceof Error ? result.reason.message : "unavailable"}`);
			continue;
		}
		for (const video of result.value) {
			if (seen.has(video.id)) continue;
			seen.add(video.id);
			collected.push(video);
			if (collected.length >= maxVideos) break;
		}
	}
	if (!collected.length && errors.length) throw new Error(`Booru unavailable (${errors.join("; ")}).`);
	return {
		videos: collected.slice(0, maxVideos),
		totalPages: page + (collected.length >= limit ? 1 : 0),
		totalCount: collected.length,
		...errors.length ? { warning: "Booru host window incomplete; healthy rows were kept and the same window needs retry." } : {}
	};
}
function adultDataLinkApiKey() {
	return (process.env.ADULTDATALINK_API_KEY || process.env.ADL_API_KEY || "").trim();
}
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function pickString(...values) {
	for (const value of values) {
		const s = asString(value).trim();
		if (s) return s;
	}
	return "";
}
/** Redgifs' embed boot is often slower than its public poster CDN. Keep the
* API-provided poster first, then use the stable poster paths before an iframe
* has to paint a preview. */
function redgifsPosterFallbacks(id) {
	const slug = id.trim();
	if (!/^[a-z0-9_-]{2,128}$/i.test(slug)) return [];
	return [
		`https://thumbs2.redgifs.com/${encodeURIComponent(slug)}-mobile.jpg`,
		`https://thumbs2.redgifs.com/${encodeURIComponent(slug)}-poster.jpg`,
		`https://thumbs2.redgifs.com/${encodeURIComponent(slug)}-thumb.jpg`,
		`https://thumbs1.redgifs.com/${encodeURIComponent(slug)}-mobile.jpg`,
		`https://thumbs1.redgifs.com/${encodeURIComponent(slug)}-poster.jpg`
	];
}
function redgifsVideo(row) {
	const id = pickString(row.id, row.gif_id, row.gifId, row.slug);
	if (!id) return null;
	const urls = {
		...asRecord(row.urls) ?? {},
		...asRecord(row.media) ?? {},
		...asRecord(row.gif) ?? {},
		...asRecord(row.video) ?? {}
	};
	const user = asRecord(row.user) ?? asRecord(row.creator) ?? {};
	const tagsRaw = row.tags ?? row.hashtags ?? row.niches;
	const tagList = Array.isArray(tagsRaw) ? tagsRaw.map((t) => typeof t === "string" ? t : pickString(asRecord(t)?.name, asRecord(t)?.text)).filter(Boolean) : typeof tagsRaw === "string" ? tagsRaw.split(/[,;\s]+/).filter(Boolean) : [];
	const title = pickString(row.title, row.description, tagList.slice(0, 6).join(" "), id).slice(0, 160);
	const author = pickString(user.username, user.name, row.userName, row.username, row.author);
	const embed = pickString(urls.html, urls.player, row.embedUrl, row.embed_url, `https://www.redgifs.com/ifr/${encodeURIComponent(id)}`);
	const watch = pickString(urls.webUrl, urls.web_url, row.url, row.webUrl, `https://www.redgifs.com/watch/${encodeURIComponent(id)}`);
	const thumb = pickString(urls.poster, urls.thumbnail, urls.thumb, urls.preview, urls.posterUrl, urls.previewUrl, row.poster, row.thumbnail, row.thumb, row.previewUrl);
	const thumbFallbacks = [.../* @__PURE__ */ new Set([thumb, ...redgifsPosterFallbacks(id)])].filter(isUsableAdultThumb).slice(0, 6);
	const file = pickString(urls.hd, urls.sd, urls.silent, urls.mobile, urls.mp4, urls.giftiny, urls.gif, row.mp4, row.file);
	if (adultBlockedText(title, author, tagList.join(" "))) return null;
	return {
		id: `redgifs:${id}`,
		folderId: REDGIFS_FOLDER_ID,
		name: title || `Redgifs ${id}`,
		path: `redgifs/${id}`,
		extension: "redgifs",
		mime: "video/mp4",
		size: 0,
		addedAt: adultPublication(row.createDate ?? row.created_at ?? row.createdAt),
		tagline: [author, ...tagList.slice(0, 8)].filter(Boolean).join(" · ").slice(0, 160) || void 0,
		description: tagList.join(", ") || title,
		poster: thumbFallbacks[0],
		src: file || embed || void 0,
		remote: {
			kind: "redgifs",
			...adultPublicationFields(row.createDate ?? row.created_at ?? row.createdAt),
			videoId: id,
			channelName: author || "Redgifs",
			observedAt: Date.now(),
			embedUrl: embed || void 0,
			watchUrl: watch,
			previewUrl: thumbFallbacks[0],
			thumbFallbacks: thumbFallbacks.length ? thumbFallbacks : void 0
		}
	};
}
function collectRedgifsRows(payload) {
	return adultRows("redgifs", payload, [
		"gifs",
		"items",
		"data",
		"results",
		"trending",
		"feed"
	].flatMap((k) => [k, ...[
		"gifs",
		"items",
		"data",
		"results"
	].map((n) => k + "." + n)]), [
		"id",
		"gif_id",
		"gifId",
		"slug"
	]);
}
var redgifsAuth = null;
async function getRedgifsAccessToken() {
	const now = Date.now();
	if (redgifsAuth && redgifsAuth.expiresAt > now + 6e4) return redgifsAuth.token;
	const res = await fetchProviderMetadata("https://api.redgifs.com/v2/auth/temporary", {
		headers: {
			accept: "application/json",
			"user-agent": "Realhub/1.0"
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!res.ok) throw new Error(`Redgifs auth HTTP ${res.status}`);
	const json = await res.json();
	if (!json.token?.trim()) throw new Error("Redgifs auth missing token");
	redgifsAuth = {
		token: json.token.trim(),
		expiresAt: now + 36e5
	};
	return redgifsAuth.token;
}
async function fetchRedgifsDirect(query, maxVideos, page) {
	const token = await getRedgifsAccessToken();
	const count = Math.min(LIBRARY_LIMITS.redgifsPageSize, maxVideos);
	const needle = query.trim();
	const params = new URLSearchParams({
		count: String(count),
		page: String(Math.max(1, page)),
		order: "trending"
	});
	params.set("search_text", needle && needle.toLowerCase() !== "all" ? needle.slice(0, 64) : "a");
	const url = `https://api.redgifs.com/v2/gifs/search?${params.toString()}`;
	const res = await cachedAdultFetch(url, {
		signal: AbortSignal.timeout(2e4),
		cacheTtlMs: 36e4,
		cacheKey: `GET:${url}:rg`,
		headers: {
			accept: "application/json",
			authorization: `Bearer ${token}`,
			"user-agent": "Realhub/1.0"
		}
	});
	if (!res.ok) throw new Error(`Redgifs HTTP ${res.status}`);
	const videos = collectRedgifsRows(await res.json()).map(redgifsVideo).filter((video) => video != null).slice(0, maxVideos);
	return {
		videos,
		totalPages: page + (videos.length >= count ? 1 : 0),
		totalCount: videos.length
	};
}
async function fetchRedgifsViaAdultDataLink(query, maxVideos, page) {
	const key = adultDataLinkApiKey();
	if (!key) return {
		videos: [],
		totalPages: page,
		totalCount: 0
	};
	const params = new URLSearchParams({
		parameter: "gif",
		page: String(Math.max(1, page)),
		count: String(Math.min(LIBRARY_LIMITS.redgifsPageSize, maxVideos))
	});
	const needle = query.trim();
	if (needle && needle.toLowerCase() !== "all") params.set("search", needle.slice(0, 64));
	const url = `https://api.adultdatalink.com/redgifs/trending?${params.toString()}`;
	const res = await cachedAdultFetch(url, {
		signal: AbortSignal.timeout(2e4),
		cacheTtlMs: 48e4,
		cacheKey: `GET:${url}:adl`,
		headers: {
			accept: "application/json",
			authorization: `Bearer ${key}`,
			"x-api-key": key,
			"user-agent": "Realhub/1.0"
		}
	});
	if (!res.ok) throw new Error(`AdultDataLink Redgifs HTTP ${res.status}`);
	const videos = collectRedgifsRows(await res.json()).map(redgifsVideo).filter((video) => video != null).slice(0, maxVideos);
	return {
		videos,
		totalPages: page + (videos.length >= Math.min(LIBRARY_LIMITS.redgifsPageSize, maxVideos) ? 1 : 0),
		totalCount: videos.length
	};
}
async function fetchRedgifsFeed(query, maxVideos, page) {
	let primary;
	try {
		return await fetchRedgifsDirect(query, maxVideos, page);
	} catch (error) {
		primary = error;
	}
	if (adultDataLinkApiKey()) return fetchRedgifsViaAdultDataLink(query, maxVideos, page);
	throw primary;
}
/** A mixed foreground pull should return its healthy providers promptly. A
* slow public feed is reported as partial work instead of freezing the whole
* Adults screen behind its retry window. */
async function withinAdultPullDeadline(work, provider) {
	let timeout;
	try {
		return await Promise.race([work, new Promise((_, reject) => {
			timeout = setTimeout(() => reject(/* @__PURE__ */ new Error(`${provider} timed out; try it alone or Load more.`)), 18e3);
		})]);
	} finally {
		if (timeout) clearTimeout(timeout);
	}
}
function adultPullFailureDetail(error) {
	const message = error instanceof Error ? error.message.trim() : "";
	if (!message || /^(?:failed to fetch|fetch failed|networkerror)$/i.test(message)) return "Network request failed; the provider may be offline, blocked, or rate limited.";
	if (/abort(?:ed|error)?|timeout/i.test(message)) return "Request timed out before the provider responded.";
	return message.slice(0, 280);
}
async function pullProviderPages(provider, query, order, startPage, maxVideos, redditSources = [], startOffset = 0) {
	if (!canPullAdult(provider)) throw Error("This source has no active catalog adapter.");
	if (provider === "chaturbate" || provider === "myfreecams") {
		const batch = provider === "chaturbate" ? await fetchChaturbateRooms(query, maxVideos) : await fetchMyFreeCamsRooms(query, maxVideos);
		if ("stale" in batch && batch.stale) throw Error("Live directory is stale; previous observations were kept.");
		return {
			videos: batch.videos,
			page: 1,
			nextPage: null,
			nextOffset: 0,
			totalCount: batch.totalCount,
			quality: measureAdultQuality(batch.videos)
		};
	}
	const videos = [], seen = /* @__PURE__ */ new Set();
	let quality = emptyAdultQuality(), warning;
	let page = startPage, offset = startOffset, totalCount = 0, nextPage = page, nextOffset = offset;
	const started = Date.now();
	const maxPages = provider === "eporner" || provider === "reddit" || provider === "booru" ? 1 : 4;
	for (let step = 0; step < maxPages && videos.length < maxVideos && Date.now() - started < 12e3; step++) {
		let rows, following;
		try {
			if (provider === "reddit") {
				const batch = await fetchRedditFeed(query, 1e3, page, redditSources);
				rows = batch.videos;
				following = batch.nextPage;
				totalCount = batch.totalCount;
				warning = batch.warning;
			} else if (provider === "booru") {
				const batch = await fetchBooruFeed(query, 400, page);
				rows = batch.videos;
				following = rows.length ? page + 1 : null;
				totalCount = batch.totalCount;
				warning = batch.warning;
			} else if (provider === "redgifs") {
				const batch = await fetchRedgifsFeed(query, LIBRARY_LIMITS.redgifsPageSize, page);
				rows = batch.videos;
				following = page < batch.totalPages ? page + 1 : null;
				totalCount = batch.totalCount;
			} else {
				const varietyOrders = [
					"top-weekly",
					"latest",
					"top-rated",
					"most-popular",
					"top-monthly"
				];
				const sort = query.trim().toLowerCase() === "all" ? varietyOrders[(page - 1) % varietyOrders.length] : order;
				const batch = provider === "redtube" ? await fetchRedtubePage(query, sort, page) : await fetchEpornerPage(query, sort, page, LIBRARY_LIMITS.epornerPageSize);
				rows = batch.videos;
				following = page < batch.totalPages ? page + 1 : null;
				totalCount = batch.totalCount;
			}
		} catch (error) {
			if (!videos.length) throw error;
			warning = adultPullFailureDetail(error);
			nextPage = page;
			nextOffset = offset;
			break;
		}
		quality = addAdultQuality(quality, measureAdultQuality(rows));
		const window = archivePageWindow(rows, page, offset, maxVideos - videos.length, following);
		for (const video of window.rows) if (!seen.has(video.id)) {
			seen.add(video.id);
			videos.push(video);
		}
		nextPage = warning ? page : window.nextPage;
		nextOffset = warning ? 0 : window.nextOffset;
		if (warning) break;
		if (!rows.length || nextPage == null || nextPage === page) break;
		page = nextPage;
		offset = 0;
	}
	return {
		videos,
		page: startPage,
		nextPage,
		nextOffset,
		totalCount,
		quality,
		...warning ? { warning } : {}
	};
}
async function runSearchAdultVideos(dataRaw) {
	const data = parseAdultSearch(dataRaw);
	const providers = [...data.providers].sort((a, b) => a === "reddit" ? -1 : b === "reddit" ? 1 : 0);
	const share = Math.max(1, Math.floor(data.maxVideos / Math.max(1, providers.length)));
	const leftovers = data.maxVideos - share * providers.length;
	const collected = [];
	let nextPage = null;
	let totalCount = 0;
	const errors = [];
	const providerNextPages = {};
	const providerNextOffsets = {};
	const providerDiagnostics = [];
	const batches = await Promise.allSettled(providers.map(async (provider) => {
		const budget = share + (provider === providers[0] ? leftovers : 0);
		const startPage = data.providerPages?.[provider] ?? data.page;
		return {
			provider,
			batch: await withinAdultPullDeadline(pullProviderPages(provider, data.query, data.order, startPage, budget, data.redditSources, data.providerOffsets[provider] ?? 0), provider)
		};
	}));
	const seen = /* @__PURE__ */ new Set();
	for (const result of batches) {
		if (result.status === "fulfilled") {
			const { provider, batch } = result.value;
			for (const video of batch.videos) {
				if (seen.has(video.id)) continue;
				seen.add(video.id);
				collected.push(video);
			}
			totalCount += batch.totalCount;
			providerNextPages[provider] = batch.nextPage;
			providerNextOffsets[provider] = batch.nextOffset;
			providerDiagnostics.push({
				provider,
				status: batch.videos.length ? "loaded" : "empty",
				titles: batch.videos.length,
				detail: batch.videos.length ? `${batch.videos.length.toLocaleString()} titles from page ${batch.page}${batch.nextPage != null ? ` · next page ${batch.nextPage}` : ""}` : "The provider responded, but had no matching public results.",
				quality: batch.quality
			});
			if (batch.warning) {
				errors.push(provider + ": " + batch.warning);
				providerDiagnostics.push({
					provider,
					status: "failed",
					titles: 0,
					detail: batch.warning
				});
			}
			if (batch.nextPage != null) nextPage = nextPage == null ? batch.nextPage : Math.min(nextPage, batch.nextPage);
			continue;
		}
		const provider = providers[batches.indexOf(result)];
		const message = adultPullFailureDetail(result.reason);
		errors.push(`${provider}: ${message}`);
		providerDiagnostics.push({
			provider,
			status: "failed",
			titles: 0,
			detail: message
		});
	}
	if (!collected.length && errors.length) throw new Error(`Adult pulls failed (${errors.join("; ")}).`);
	return {
		videos: collected.slice(0, data.maxVideos),
		source: providers.join("+"),
		note: errors.length ? `Partial adult pull — ${errors.join("; ")}. Remaining official APIs still returned titles.` : "Pulled via official public APIs and public Reddit Atom feeds. Playback uses public embeds, room deep-links, or Reddit permalinks; keywords/tags become local source + fetish tags.",
		page: data.page,
		nextPage,
		totalCount,
		providers,
		providerNextPages,
		providerNextOffsets,
		providerDiagnostics,
		partial: errors.length > 0
	};
}
function parseRedditCommentEntries(xml) {
	const out = [];
	for (const chunk of xml.split(/<entry>/i).slice(1).slice(0, 40)) {
		const id = xmlField(chunk, /<id>([^<]+)<\/id>/i) || `c${out.length}`;
		const title = xmlField(chunk, /<title>([^<]+)<\/title>/i);
		const author = xmlField(chunk, /<name>([^<]+)<\/name>/i).replace(/^\/u\//, "");
		const body = (xmlField(chunk, /<content[^>]*>([\s\S]*?)<\/content>/i).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/\s+/g, " ").trim() || title).slice(0, 400);
		if (!body || body.length < 2) continue;
		if (adultBlockedText(body, author)) continue;
		out.push({
			id,
			author: author || void 0,
			body
		});
	}
	return out;
}
function youtubeText(value) {
	if (typeof value === "string") return value.trim();
	if (!value || typeof value !== "object") return "";
	const record = value;
	if (typeof record.simpleText === "string") return record.simpleText.trim();
	if (!Array.isArray(record.runs)) return "";
	return record.runs.map((run) => run && typeof run === "object" && typeof run.text === "string" ? run.text : "").join("").trim();
}
function youtubeCommentScore(value) {
	const parsed = Number(youtubeText(value).replace(/[^0-9.-]/g, ""));
	return Number.isFinite(parsed) ? parsed : void 0;
}
function youtubeCommentEntities(root, limit) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const stack = [root];
	while (stack.length && out.length < limit) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			stack.push(...current);
			continue;
		}
		const record = current;
		const payload = record.commentEntityPayload;
		if (payload?.properties?.content?.content) {
			const id = payload.properties.commentId || `ytc${out.length}`;
			if (!seen.has(id)) {
				seen.add(id);
				const scoreRaw = Number(String(payload.toolbar?.likeCountNotliked ?? "").replace(/,/g, ""));
				out.push({
					id,
					author: payload.author?.displayName?.replace(/^@/, "") || void 0,
					body: payload.properties.content.content.slice(0, 500),
					score: Number.isFinite(scoreRaw) ? scoreRaw : void 0
				});
			}
		}
		const renderer = record.commentRenderer;
		if (renderer) {
			const id = asString(renderer.commentId).trim() || `ytc-legacy-${out.length}`;
			const body = youtubeText(renderer.contentText).slice(0, 500);
			if (body && !seen.has(id)) {
				seen.add(id);
				out.push({
					id,
					author: youtubeText(renderer.authorText).replace(/^@/, "") || void 0,
					body,
					score: youtubeCommentScore(renderer.voteCount ?? renderer.likeCount)
				});
			}
		}
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	return out;
}
/** Public Reddit comment listings use the same t1 tree on the JSON endpoint. */
function parseRedditCommentJson(payload) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const visit = (value) => {
		if (!value || out.length >= 40) return;
		if (Array.isArray(value)) {
			for (const item of value) visit(item);
			return;
		}
		if (typeof value !== "object") return;
		const record = value;
		const data = record.data && typeof record.data === "object" ? record.data : void 0;
		if (record.kind === "t1" && data) {
			const id = String(data.name ?? data.id ?? "").trim();
			const author = String(data.author ?? "").trim();
			const body = String(data.body ?? "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/\s+/g, " ").trim().slice(0, 400);
			if (id && body.length >= 2 && !seen.has(id) && !adultBlockedText(body, author)) {
				seen.add(id);
				const score = Number(data.score ?? data.ups);
				out.push({
					id,
					author: author || void 0,
					body,
					score: Number.isFinite(score) ? score : void 0
				});
			}
		}
		if (data?.replies) visit(data.replies);
		if (data?.children) visit(data.children);
		if (record.children) visit(record.children);
	};
	visit(payload);
	return out;
}
function youtubeCommentContinuation(root) {
	const stack = [root];
	while (stack.length) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			stack.push(...current);
			continue;
		}
		const record = current;
		if (record.engagementPanelSectionListRenderer?.panelIdentifier === "engagement-panel-comments-section") {
			const inner = [record];
			while (inner.length) {
				const node = inner.pop();
				if (!node || typeof node !== "object") continue;
				if (Array.isArray(node)) {
					inner.push(...node);
					continue;
				}
				const row = node;
				const token = row.continuationEndpoint?.continuationCommand?.token ?? row.continuationCommand?.token;
				if (token) return token;
				for (const value of Object.values(row)) if (value && typeof value === "object") inner.push(value);
			}
		}
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	return null;
}
function youtubeNextCommentToken(root) {
	const endpoints = root?.onResponseReceivedEndpoints ?? [];
	for (const endpoint of endpoints) {
		const reload = endpoint.reloadContinuationItemsCommand;
		const append = endpoint.appendContinuationItemsAction;
		const items = reload?.continuationItems ?? append?.continuationItems ?? [];
		for (const item of items) {
			if (!item || typeof item !== "object") continue;
			const token = item.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
			if (token) return token;
		}
	}
	const stack = [root];
	while (stack.length) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			stack.push(...current);
			continue;
		}
		const record = current;
		const token = record.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
		if (token) return token;
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	return null;
}
async function fetchYoutubeComments(videoId, limit) {
	const id = videoId.replace(/^yt:/, "").slice(0, 11);
	if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return {
		comments: [],
		note: "Not a YouTube video id."
	};
	try {
		const html = await fetchText(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`);
		const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
		const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
		if (!apiKey) return {
			comments: [],
			note: "YouTube Innertube key unavailable."
		};
		const postNext = async (body) => {
			const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/next?key=${encodeURIComponent(apiKey)}`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-youtube-client-name": "1",
					"x-youtube-client-version": clientVersion
				},
				body: JSON.stringify({
					context: { client: {
						clientName: "WEB",
						clientVersion,
						hl: "en",
						gl: "US"
					} },
					...body
				}),
				timeoutMs: 15e3
			});
			if (!response.ok) return null;
			return await response.json();
		};
		const initialData = youtubeInitialData(html);
		const watch = await postNext({ videoId: id });
		if (!watch) return {
			comments: [],
			note: "YouTube comments endpoint unavailable."
		};
		let continuation = youtubeCommentContinuation(watch) ?? (initialData ? youtubeCommentContinuation(initialData) : null);
		if (!continuation) return {
			comments: [],
			note: "No public YouTube comment panel for this video."
		};
		const comments = [];
		const seen = /* @__PURE__ */ new Set();
		for (let page = 0; page < LIBRARY_LIMITS.youtubeCommentPagesPerPull && comments.length < limit && continuation; page += 1) {
			const pageData = await postNext({ continuation });
			if (!pageData) break;
			for (const row of youtubeCommentEntities(pageData, limit - comments.length)) {
				if (seen.has(row.id)) continue;
				seen.add(row.id);
				comments.push(row);
			}
			continuation = youtubeNextCommentToken(pageData);
		}
		return {
			comments: comments.slice(0, limit),
			note: comments.length ? "YouTube comments via public Innertube (on-demand, not routine refresh)." : "No public YouTube comments returned for this video."
		};
	} catch (err) {
		return {
			comments: [],
			note: err instanceof Error ? err.message : "YouTube comments unavailable."
		};
	}
}
var YOUTUBE_CHAT_PAGE_GAP_MS = 200;
function youtubeChatPageGap() {
	return new Promise((resolve) => setTimeout(resolve, YOUTUBE_CHAT_PAGE_GAP_MS));
}
function youtubeRunsText(runs) {
	if (!Array.isArray(runs)) return "";
	return runs.map((run) => run && typeof run === "object" && typeof run.text === "string" ? run.text : "").join("").trim();
}
function youtubeLiveChatToken(root) {
	const stack = [root];
	while (stack.length) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			stack.push(...current);
			continue;
		}
		const record = current;
		const renderer = record.liveChatRenderer;
		if (renderer?.continuations?.length) for (const cont of renderer.continuations) for (const value of Object.values(cont)) {
			const token = value?.continuation;
			if (token) return {
				token,
				isReplay: Boolean(renderer.isReplay)
			};
		}
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	return null;
}
function youtubeChatMessages(root, limit) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const stack = [root];
	while (stack.length && out.length < limit) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			stack.push(...current);
			continue;
		}
		const record = current;
		const textRenderer = record.liveChatTextMessageRenderer;
		const paidRenderer = record.liveChatPaidMessageRenderer;
		const renderer = textRenderer ?? paidRenderer;
		if (renderer) {
			const body = youtubeRunsText(renderer.message?.runs).slice(0, 400);
			if (body) {
				const id = renderer.id || `ytchat${out.length}`;
				if (!seen.has(id)) {
					seen.add(id);
					out.push({
						id,
						author: renderer.authorName?.simpleText?.replace(/^@/, "") || void 0,
						body: paidRenderer && !textRenderer ? `[Super Chat] ${body}` : body,
						kind: "chat"
					});
				}
			}
		}
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	return out;
}
function youtubeChatNextToken(root, preferReplay) {
	const stack = [root];
	while (stack.length) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			stack.push(...current);
			continue;
		}
		const record = current;
		const replay = record.liveChatReplayContinuationData;
		const timed = record.timedContinuationData;
		const invalidation = record.invalidationContinuationData;
		const reload = record.reloadContinuationData;
		if (preferReplay && replay?.continuation) return replay.continuation;
		if (timed?.continuation) return timed.continuation;
		if (invalidation?.continuation) return invalidation.continuation;
		if (reload?.continuation) return reload.continuation;
		if (replay?.continuation) return replay.continuation;
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	return null;
}
async function fetchYoutubeChat(videoId, limit) {
	const id = videoId.replace(/^yt:/, "").slice(0, 11);
	if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return {
		comments: [],
		note: "Not a YouTube video id."
	};
	try {
		const html = await fetchText(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`);
		const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
		const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
		if (!apiKey) return {
			comments: [],
			note: "YouTube Innertube key unavailable for chat."
		};
		const postJson = async (path, body) => {
			const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/${path}?key=${encodeURIComponent(apiKey)}`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-youtube-client-name": "1",
					"x-youtube-client-version": clientVersion
				},
				body: JSON.stringify({
					context: { client: {
						clientName: "WEB",
						clientVersion,
						hl: "en",
						gl: "US"
					} },
					...body
				}),
				timeoutMs: 15e3
			});
			if (!response.ok) return null;
			return await response.json();
		};
		let seed = youtubeLiveChatToken(youtubeInitialData(html));
		if (!seed) {
			const watch = await postJson("next", { videoId: id });
			if (watch) seed = youtubeLiveChatToken(watch);
		}
		if (!seed) return {
			comments: [],
			note: "No public YouTube live chat / chat replay for this video."
		};
		const endpoint = seed.isReplay ? "live_chat/get_live_chat_replay" : "live_chat/get_live_chat";
		const comments = [];
		const seen = /* @__PURE__ */ new Set();
		let continuation = seed.token;
		const maxPages = LIBRARY_LIMITS.youtubeChatMaxPages;
		for (let page = 0; page < maxPages && comments.length < limit && continuation; page += 1) {
			if (page > 0) await youtubeChatPageGap();
			const pageData = await postJson(endpoint, { continuation });
			if (!pageData) break;
			for (const row of youtubeChatMessages(pageData, limit - comments.length)) {
				if (seen.has(row.id)) continue;
				seen.add(row.id);
				comments.push(row);
			}
			const next = youtubeChatNextToken(pageData, seed.isReplay);
			continuation = next && next !== continuation ? next : null;
			if (!seed.isReplay) break;
		}
		return {
			comments: comments.slice(0, limit),
			note: comments.length ? seed.isReplay ? "YouTube chat replay via public Innertube (on-demand, not routine refresh)." : "YouTube live chat snapshot via public Innertube (on-demand, not live IRC scrape)." : "No public YouTube chat messages returned for this video."
		};
	} catch (err) {
		return {
			comments: [],
			note: err instanceof Error ? err.message : "YouTube chat unavailable."
		};
	}
}
async function fetchTwitchVodComments(videoId, limit) {
	const id = videoId.replace(/^tw:v:/, "").replace(/^v/, "").trim();
	if (!/^\d+$/.test(id)) return {
		comments: [],
		note: "Twitch clips do not expose VOD chat replay; open a VOD."
	};
	try {
		const comments = [];
		const seen = /* @__PURE__ */ new Set();
		let cursor = null;
		let offset = 0;
		for (let page = 0; page < 6 && comments.length < limit; page += 1) {
			if (page > 0) await twitchPageGap();
			const res = await fetchProviderMetadata("https://gql.twitch.tv/gql", {
				method: "POST",
				headers: {
					"client-id": TWITCH_CLIENT_ID,
					"content-type": "application/json"
				},
				body: JSON.stringify([{
					operationName: "VideoCommentsByOffsetOrCursor",
					variables: cursor ? {
						videoID: id,
						cursor
					} : {
						videoID: id,
						contentOffsetSeconds: offset
					},
					extensions: { persistedQuery: {
						version: 1,
						sha256Hash: "b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a"
					} }
				}]),
				signal: AbortSignal.timeout(12e3)
			});
			if (!res.ok) return {
				comments,
				note: comments.length ? "Partial Twitch VOD chat (rate limited)." : `Twitch VOD chat HTTP ${res.status}.`
			};
			const connection = (await res.json())?.[0]?.data?.video?.comments;
			if (!connection?.edges?.length) break;
			for (const edge of connection.edges) {
				const node = edge.node;
				if (!node?.id || seen.has(node.id)) continue;
				const body = (node.message?.fragments ?? []).map((fragment) => fragment.text ?? "").join("").trim().slice(0, 400);
				if (!body) continue;
				seen.add(node.id);
				comments.push({
					id: node.id,
					author: node.commenter?.displayName || node.commenter?.login || void 0,
					body
				});
				if (comments.length >= limit) break;
			}
			if (!connection.pageInfo?.hasNextPage) break;
			cursor = connection.edges.at(-1)?.cursor ?? null;
			if (!cursor) break;
		}
		return {
			comments: comments.slice(0, limit),
			note: comments.length ? "Twitch VOD chat replay via public GQL (on-demand; not live IRC scrape)." : "No public Twitch VOD chat returned for this video."
		};
	} catch (err) {
		return {
			comments: [],
			note: err instanceof Error ? err.message : "Twitch comments unavailable."
		};
	}
}
async function fetchRedditComments(videoId, watchUrl) {
	const id = videoId.replace(/^t3_/, "");
	const canonical = `https://www.reddit.com/comments/${encodeURIComponent(id)}.rss?limit=40`;
	const oldCanonical = `https://old.reddit.com/comments/${encodeURIComponent(id)}.rss?limit=40`;
	const permalink = watchUrl.match(/^https:\/\/www\.reddit\.com\/r\/[^/]+\/comments\/[a-z0-9]+/i)?.[0];
	const oldPermalink = permalink?.replace(/^https:\/\/www\.reddit\.com/i, "https://old.reddit.com");
	const publicPost = permalink ?? `https://www.reddit.com/comments/${encodeURIComponent(id)}`;
	const oldPost = oldPermalink ?? `https://old.reddit.com/comments/${encodeURIComponent(id)}`;
	const urls = [
		{
			url: permalink ? `${publicPost}.rss?limit=40` : canonical,
			format: "rss"
		},
		{
			url: `${publicPost}.json?limit=40&raw_json=1`,
			format: "json"
		},
		{
			url: `${oldPost}.json?limit=40&raw_json=1`,
			format: "json"
		},
		{
			url: oldCanonical,
			format: "rss"
		}
	];
	let lastStatus = 0;
	let sawPublicResponse = false;
	for (const endpoint of urls) {
		const res = await cachedAdultFetch(endpoint.url, {
			signal: AbortSignal.timeout(8e3),
			cacheTtlMs: 9e5,
			cacheKey: `GET:reddit-comments:${endpoint.url}`,
			headers: {
				accept: endpoint.format === "json" ? "application/json, text/javascript;q=0.9, */*;q=0.8" : "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
				"user-agent": "web:reelcase:1.0 (public comment viewer)"
			}
		});
		lastStatus = res.status;
		if (res.status === 429) continue;
		if (!res.ok) continue;
		sawPublicResponse = true;
		const body = await res.text();
		let comments = [];
		if (endpoint.format === "rss") comments = parseRedditCommentEntries(body);
		else try {
			comments = parseRedditCommentJson(JSON.parse(body));
		} catch {
			continue;
		}
		if (comments.length) return {
			comments,
			note: endpoint.format === "rss" ? "Live Reddit comments via public Atom RSS." : "Live Reddit comments via the public post listing."
		};
	}
	if (sawPublicResponse) return {
		comments: [],
		note: "No public comments returned for this post."
	};
	return {
		comments: [],
		note: lastStatus === 429 ? "Reddit comment requests are rate-limited — try again later." : `Reddit comments unavailable (HTTP ${lastStatus || "network"}).`
	};
}
async function runFetchAdultComments(dataRaw) {
	const data = (() => {
		const data = dataRaw;
		const rec = typeof data === "object" && data !== null ? data : {};
		return {
			kind: asString(rec.kind).trim(),
			videoId: asString(rec.videoId).trim(),
			watchUrl: asString(rec.watchUrl).trim()
		};
	})();
	if (!data.videoId) return {
		comments: [],
		note: "Missing video id for comments."
	};
	if (data.kind === "reddit") try {
		return await fetchRedditComments(data.videoId, data.watchUrl);
	} catch (err) {
		return {
			comments: [],
			note: err instanceof Error ? err.message : "Comments unavailable."
		};
	}
	if (data.kind === "youtube") {
		const [threads, chat] = await Promise.all([fetchYoutubeComments(data.videoId, LIBRARY_LIMITS.youtubeCommentsPerPull), fetchYoutubeChat(data.videoId, LIBRARY_LIMITS.youtubeChatPerPull)]);
		const comments = [...chat.comments, ...threads.comments.map((row) => ({
			...row,
			kind: row.kind ?? "comment"
		}))];
		const notes = [chat.note, threads.note].filter((note) => note && !note.startsWith("No public"));
		const fallback = comments.length ? "YouTube chat + comments via public Innertube (on-demand)." : chat.note.includes("No public YouTube live chat") && threads.note.includes("No public YouTube comment") ? "No public YouTube chat or comments for this video." : [chat.note, threads.note].filter(Boolean).join(" · ");
		return {
			comments,
			note: notes.length ? notes.join(" · ") : fallback
		};
	}
	if (data.kind === "twitch") return fetchTwitchVodComments(data.videoId, LIBRARY_LIMITS.twitchCommentsPerPull);
	return {
		comments: [],
		note: "This provider does not expose a public comment feed."
	};
}
async function runSearchRedtubeStars(dataRaw) {
	const data = (() => {
		const data = dataRaw;
		const rec = typeof data === "object" && data !== null ? data : {};
		const page = Number(rec.page);
		return {
			query: asString(rec.query).trim(),
			page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
		};
	})();
	const res = await cachedAdultFetch(`https://api.redtube.com/?${new URLSearchParams({
		data: "redtube.Stars.getStarDetailedList",
		output: "json",
		page: String(data.page)
	}).toString()}`, {
		signal: AbortSignal.timeout(2e4),
		cacheTtlMs: 18e5,
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)"
		}
	});
	if (!res.ok) throw new Error(`RedTube star API HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
	const json = await res.json();
	if (json.message && json.code) throw new Error(json.message);
	const stars = [];
	for (const row of json.stars ?? []) {
		if (!row || typeof row !== "object") continue;
		const rec = row;
		const inner = rec.star && typeof rec.star === "object" ? rec.star : rec;
		const clean = (asString(inner.star_name) || asString(inner.star) || asString(rec.star_name)).trim();
		if (!clean) continue;
		stars.push({
			name: clean,
			thumb: asString(inner.star_thumb) || asString(inner.thumb) || void 0,
			url: asString(inner.star_url) || asString(inner.url) || void 0
		});
	}
	const needle = data.query.toLowerCase();
	const filtered = needle ? stars.filter((star) => star.name.toLowerCase().includes(needle)) : stars;
	return {
		stars: filtered.slice(0, LIBRARY_LIMITS.redtubeStarsPerPage),
		note: filtered.length ? "Official RedTube star list." : "No matching RedTube creators on this page."
	};
}
/**
* Client-callable remote actions live apart from the provider implementation.
* Keeping this module small gives TanStack Start stable server-function IDs
* across dev-server dependency optimization and HMR updates.
*/
var input = (data) => data;
var followRemoteRequest_createServerFn_handler = createServerRpc({
	id: "d1155935e3ce6be09b32b6bceaac773115bc3e7b37e165babd1a246638e36f7c",
	name: "followRemoteRequest",
	filename: "src/lib/remote/functions.ts"
}, (opts) => followRemoteRequest.__executeServer(opts));
var followRemoteRequest = createServerFn({ method: "POST" }).validator(input).handler(followRemoteRequest_createServerFn_handler, ({ data }) => runFollowRemote(data));
var refreshRemotesRequest_createServerFn_handler = createServerRpc({
	id: "3b5f1e63b8dde522be6847c1ba970b2c5473d9d776f080d86a78884151898152",
	name: "refreshRemotesRequest",
	filename: "src/lib/remote/functions.ts"
}, (opts) => refreshRemotesRequest.__executeServer(opts));
var refreshRemotesRequest = createServerFn({ method: "POST" }).validator(input).handler(refreshRemotesRequest_createServerFn_handler, ({ data }) => runRefreshRemotes(data));
var importChannelsRequest_createServerFn_handler = createServerRpc({
	id: "6be598ce27c9baf7d31cc1ee443d15104f7a057282b84764cec56bc270e4599a",
	name: "importChannelsRequest",
	filename: "src/lib/remote/functions.ts"
}, (opts) => importChannelsRequest.__executeServer(opts));
var importChannelsRequest = createServerFn({ method: "POST" }).validator(input).handler(importChannelsRequest_createServerFn_handler, ({ data }) => runImportChannels(data));
var fetchTwitchFollowing_createServerFn_handler = createServerRpc({
	id: "926b625b25b1f6c5d08281cc86b3196dbb11bcb5b683a95b5ebcf2111dc013b0",
	name: "fetchTwitchFollowing",
	filename: "src/lib/remote/functions.ts"
}, (opts) => fetchTwitchFollowing.__executeServer(opts));
var fetchTwitchFollowing = createServerFn({ method: "POST" }).validator(input).handler(fetchTwitchFollowing_createServerFn_handler, ({ data }) => runFetchTwitchFollowing(data));
var searchAdultVideosRequest_createServerFn_handler = createServerRpc({
	id: "adcf396e47a4470a97261625127a3496a88d85f3f1036f72b4a0ebbfc78c1b95",
	name: "searchAdultVideosRequest",
	filename: "src/lib/remote/functions.ts"
}, (opts) => searchAdultVideosRequest.__executeServer(opts));
var searchAdultVideosRequest = createServerFn({ method: "POST" }).validator(input).handler(searchAdultVideosRequest_createServerFn_handler, ({ data }) => runSearchAdultVideos(data));
var fetchAdultComments_createServerFn_handler = createServerRpc({
	id: "3250c7fe9ae5ccef9fa5787d5e016af43eee3512d762581de88ac40b08152dad",
	name: "fetchAdultComments",
	filename: "src/lib/remote/functions.ts"
}, (opts) => fetchAdultComments.__executeServer(opts));
var fetchAdultComments = createServerFn({ method: "POST" }).validator(input).handler(fetchAdultComments_createServerFn_handler, ({ data }) => runFetchAdultComments(data));
var searchRedtubeStars_createServerFn_handler = createServerRpc({
	id: "bcf52ff714b81b8c64a4700ab9a64674ed5afcf8786fb9b74bdc3c4557ca86bf",
	name: "searchRedtubeStars",
	filename: "src/lib/remote/functions.ts"
}, (opts) => searchRedtubeStars.__executeServer(opts));
var searchRedtubeStars = createServerFn({ method: "POST" }).validator(input).handler(searchRedtubeStars_createServerFn_handler, ({ data }) => runSearchRedtubeStars(data));
var resolveBooruOriginal_createServerFn_handler = createServerRpc({
	id: "dd1d1916a4839a4ceb55923d6e545e56caf6cd3f77b36275c007d928335b1d12",
	name: "resolveBooruOriginal",
	filename: "src/lib/remote/functions.ts"
}, (opts) => resolveBooruOriginal.__executeServer(opts));
var resolveBooruOriginal = createServerFn({ method: "POST" }).validator(input).handler(resolveBooruOriginal_createServerFn_handler, ({ data }) => runBooruOriginal(data));
var youtubeCreatorProfiles_createServerFn_handler = createServerRpc({
	id: "01ab33bc0455dc5351da5f13e553736c0034ee0d18195c486c175d01ae271321",
	name: "youtubeCreatorProfiles",
	filename: "src/lib/remote/functions.ts"
}, (opts) => youtubeCreatorProfiles.__executeServer(opts));
var youtubeCreatorProfiles = createServerFn({ method: "POST" }).validator(input).handler(youtubeCreatorProfiles_createServerFn_handler, ({ data }) => runYoutubeCreatorProfiles(data));
var inspectRedditImage_createServerFn_handler = createServerRpc({
	id: "3e1ecfb07abb48cc35cfe61eb295043dc59f7294405b8cd4692347582d4db1f2",
	name: "inspectRedditImage",
	filename: "src/lib/remote/functions.ts"
}, (opts) => inspectRedditImage.__executeServer(opts));
var inspectRedditImage = createServerFn({ method: "POST" }).validator((data) => typeof data === "string" && data.length <= 2048 ? data : "").handler(inspectRedditImage_createServerFn_handler, async ({ data }) => {
	const { inspectRedditImageUrl } = await import("./reddit-media-status-DtA6N4tZ.mjs");
	return inspectRedditImageUrl(data);
});
var liveRoomsRequest_createServerFn_handler = createServerRpc({
	id: "e483c3dfca51219e37b04bba9ff9fcc8a0b6d8624bc8e163729cdf09c4fc0dc6",
	name: "liveRoomsRequest",
	filename: "src/lib/remote/functions.ts"
}, (opts) => liveRoomsRequest.__executeServer(opts));
var liveRoomsRequest = createServerFn({ method: "POST" }).validator(input).handler(liveRoomsRequest_createServerFn_handler, ({ data }) => runFetchLiveRooms(data));
//#endregion
export { fetchAdultComments_createServerFn_handler, fetchTwitchFollowing_createServerFn_handler, followRemoteRequest_createServerFn_handler, importChannelsRequest_createServerFn_handler, inspectRedditImage_createServerFn_handler, liveRoomsRequest_createServerFn_handler, refreshRemotesRequest_createServerFn_handler, resolveBooruOriginal_createServerFn_handler, searchAdultVideosRequest_createServerFn_handler, searchRedtubeStars_createServerFn_handler, youtubeCreatorProfiles_createServerFn_handler };
