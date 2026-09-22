import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { A as cachedAdultFetch, H as isUsableAdultThumb, K as pickRedtubeThumb, N as extractRedditFlair, Y as redtubeStarNames, _ as REDDIT_FOLDER_ID, c as ADULT_PULL_PROVIDERS, f as BOORU_FOLDER_ID, g as MYFREECAMS_FOLDER_ID, h as LIBRARY_LIMITS, j as expandAdultThumbFallbacks, l as ADULT_REDDIT_PRIORITY_SUBS, m as EPORNER_FOLDER_ID, p as CHATURBATE_FOLDER_ID, u as ADULT_REDDIT_SUBS, v as REDGIFS_FOLDER_ID, x as adultDeepenQueriesForPage, y as REDTUBE_FOLDER_ID } from "./adult-pull-cache-aysXgkuS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-Dz2dAS0a.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
	const urls = collectUrls(entryXml, contentHtml);
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
	if (media.kind === "image" || media.kind === "video") return true;
	if (/welcome|faq|sidebar|chatters|on cam/i.test(title)) return false;
	return false;
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
	const message = (error instanceof Error ? error.message : String(error || "Unknown provider failure")).replace(/\s+/g, " ").trim().slice(0, 240) || "Unknown provider failure";
	const lower = message.toLowerCase();
	const common = {
		message,
		at: Date.now()
	};
	if (/\b429\b|rate.?limit|too many requests|retrying after/.test(lower)) return {
		...common,
		kind: "rate-limited",
		recovery: "Keep the cached channel cards. Reelcase will retry after the shown cooldown; use a focused retry only when you need it now."
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
		recovery: "The provider could not be reached. Cached cards remain available and Reelcase will retry after the shown cooldown."
	};
}
/** Share identical work across browser tabs and suppress only background retries. */
async function providerRequest(provider, handle, focused, work) {
	const key = providerKey(provider, handle);
	const cooling = providerFailures.get(key);
	if (!focused && cooling && cooling.retryAt > Date.now()) throw new Error(`${provider} is retrying after ${new Date(cooling.retryAt).toLocaleTimeString()}`);
	const existing = providerInflight.get(key);
	if (existing) return existing;
	const pending = work().then((result) => {
		providerFailures.delete(key);
		return result;
	}).catch((error) => {
		const previous = providerFailures.get(key);
		const attempts = Math.min(8, (previous?.attempts ?? 0) + 1);
		providerFailures.set(key, {
			attempts,
			retryAt: Date.now() + Math.min(3e5, 15e3 * 2 ** (attempts - 1))
		});
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
	const rawClips = typeof rec.clipLimit === "number" ? rec.clipLimit : Number(rec.clipLimit);
	const clipLimit = Number.isFinite(rawClips) && rawClips > 0 ? Math.min(LIBRARY_LIMITS.twitchFocusedClipsPerChannel, Math.floor(rawClips)) : void 0;
	return {
		query,
		kind,
		...clipLimit ? { clipLimit } : {}
	};
}
function parseRefresh(data) {
	if (typeof data !== "object" || data === null) return { channels: [] };
	const rec = data;
	return { channels: (Array.isArray(rec.channels) ? rec.channels : []).slice(0, 80) };
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
function ytHandle(input) {
	const raw = input.trim();
	const at = raw.match(/^@([A-Za-z0-9._-]+)/);
	if (at) return at[1];
	try {
		const parts = new URL(raw.startsWith("http") ? raw : `https://${raw}`).pathname.split("/").filter(Boolean);
		if (parts[0]?.startsWith("@")) return parts[0].slice(1);
		if (parts[0] === "channel" && parts[1]?.startsWith("UC")) return null;
		if (parts[0] === "c" || parts[0] === "user") return parts[1] ?? null;
	} catch {
		return raw.replace(/^@/, "") || null;
	}
	return raw.replace(/^@/, "") || null;
}
function ytChannelIdFromText(text) {
	const rss = text.match(/channel_id=([A-Za-z0-9_-]{16,})/);
	if (rss) return rss[1];
	const json = text.match(/"channelId":"(UC[A-Za-z0-9_-]{20,})"/);
	if (json) return json[1];
	const canon = text.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{20,})/);
	return canon ? canon[1] : null;
}
function decodeXml(s) {
	return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}
function tag(xml, name) {
	const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
	return m ? decodeXml(m[1]).trim() : "";
}
async function fetchText(url) {
	const res = await fetch(url, {
		signal: AbortSignal.timeout(12e3),
		headers: {
			"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai) AppleWebKit/537.36",
			accept: "text/html,application/xhtml+xml,application/xml,application/json"
		}
	});
	if (!res.ok) throw new Error(`Could not reach ${url}`);
	return res.text();
}
function ytVideo(entry) {
	const published = Date.parse(entry.published) || Date.now();
	return {
		id: `yt:${entry.id}`,
		folderId: `yt:${entry.channelId}`,
		name: entry.title,
		path: `youtube/${entry.channelName}/${entry.title}`,
		extension: "yt",
		mime: "video/youtube",
		size: 0,
		duration: entry.duration,
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
			live: entry.live,
			views: entry.views,
			embedUrl: `https://www.youtube.com/embed/${entry.id}`,
			watchUrl: `https://www.youtube.com/watch?v=${entry.id}`,
			previewUrl: `https://i.ytimg.com/an_webp/${entry.id}/mqdefault_6s.webp`
		}
	};
}
var YOUTUBE_CHANNEL_CACHE_TTL_MS = 24e4;
var YOUTUBE_CHANNEL_CACHE_LIMIT = 12;
var youtubeChannelCache = /* @__PURE__ */ new Map();
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
function youtubeInitialData(html) {
	const match = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
	if (!match?.[1]) return null;
	try {
		return JSON.parse(match[1]);
	} catch {
		return null;
	}
}
function youtubeRenderers(root, maximum) {
	const found = [];
	const stack = [root];
	while (stack.length && found.length < maximum) {
		const current = stack.pop();
		if (!current || typeof current !== "object") continue;
		if (Array.isArray(current)) {
			stack.push(...current);
			continue;
		}
		const record = current;
		const renderer = record.videoRenderer;
		if (renderer?.videoId) found.push(renderer);
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	return found;
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
			stack.push(...current);
			continue;
		}
		const record = current;
		const command = record.continuationCommand;
		if (command && typeof command === "object" && typeof command.token === "string") return command.token;
		for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
	}
	return null;
}
function youtubeBrowseConfig(html, root) {
	const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
	const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
	const continuation = youtubeContinuation(root);
	return apiKey && continuation ? {
		apiKey,
		clientVersion,
		continuation
	} : null;
}
async function youtubeContinuationBackfill(html, knownIds, channelId, channelName, limit) {
	const root = youtubeInitialData(html);
	const config = root ? youtubeBrowseConfig(html, root) : null;
	if (!config || limit <= 0) return [];
	const seen = new Set(knownIds);
	const videos = [];
	let continuation = config.continuation;
	for (let page = 0; continuation && page < LIBRARY_LIMITS.youtubeArchivePagesPerPull && videos.length < limit; page += 1) try {
		const response = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(config.apiKey)}`, {
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
			signal: AbortSignal.timeout(1e4)
		});
		if (!response.ok) break;
		const pageData = await response.json();
		for (const renderer of youtubeRenderers(pageData, limit - videos.length)) {
			const id = renderer.videoId;
			if (!id || seen.has(id)) continue;
			seen.add(id);
			videos.push(ytVideo({
				id,
				title: rendererText(renderer.title) || `${channelName} video`,
				published: "1970-01-01T00:00:00.000Z",
				thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				desc: rendererText(renderer.descriptionSnippet) || `${channelName} public channel catalog item.`,
				channelId,
				channelName,
				views: parsePublicViewCount(rendererText(renderer.viewCountText))
			}));
		}
		const next = youtubeContinuation(pageData);
		continuation = next && next !== continuation ? next : null;
	} catch {
		break;
	}
	return videos;
}
async function youtubeChannelBackfill(channelId, channelName, knownIds, limit) {
	try {
		const html = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`);
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
async function youtubeFromVideo(id) {
	const oembed = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { signal: AbortSignal.timeout(12e3) });
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
		published: (/* @__PURE__ */ new Date()).toISOString(),
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
async function youtubeLiveFromChannel(channelId, channelName) {
	try {
		const html = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/live`);
		const match = html.match(/"videoId":"([A-Za-z0-9_-]{11})"[\s\S]{0,3200}?"isLiveNow":true/) ?? html.match(/"isLiveNow":true[\s\S]{0,3200}?"videoId":"([A-Za-z0-9_-]{11})"/);
		if (!match?.[1]) return null;
		const id = match[1];
		const windowStart = Math.max(0, (match.index ?? 0) - 1200);
		const liveWindow = html.slice(windowStart, (match.index ?? 0) + 4e3);
		const watchingText = liveWindow.match(/"viewCountText":\{"simpleText":"([^"]+)"/)?.[1] ?? liveWindow.match(/"viewCountText":\{"runs":\[\{"text":"([^"]+)"/)?.[1] ?? "";
		const video = ytVideo({
			id,
			title: `${channelName} live`,
			published: (/* @__PURE__ */ new Date()).toISOString(),
			thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
			desc: `${channelName} is live on YouTube.`,
			channelId,
			channelName,
			live: true,
			views: parsePublicViewCount(watchingText)
		});
		if (video.remote) video.remote.viewers = video.remote.views;
		video.tagline = `${channelName} is live now`;
		return video;
	} catch {
		return null;
	}
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
async function youtubeFromChannelUncoalesced(query, limit = LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, deepCatalog = true) {
	let channelId = "";
	const trimmed = query.trim();
	if (/^UC[\w-]{20,}$/.test(trimmed)) channelId = trimmed;
	const asUrl = query.startsWith("http") ? query : "";
	if (asUrl.includes("/channel/")) channelId = asUrl.split("/channel/")[1]?.split(/[/?#]/)[0] ?? "";
	if (!channelId) {
		const handle = ytHandle(query) ?? query.replace(/^@/, "");
		channelId = ytChannelIdFromText(await fetchText(`https://www.youtube.com/@${encodeURIComponent(handle)}`)) ?? "";
		if (!channelId) throw new Error("Could not find that YouTube channel.");
	}
	const boundedLimit = Math.max(24, Math.min(LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, Math.floor(limit)));
	const cached = youtubeChannelCache.get(channelId);
	if (cached && Date.now() - cached.at < YOUTUBE_CHANNEL_CACHE_TTL_MS && cached.result.videos.length >= Math.min(144, boundedLimit)) return boundedFollowResult(cached.result, boundedLimit);
	const [xml, channelPage] = await Promise.all([fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`), deepCatalog ? fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`).catch(() => "") : Promise.resolve("")]);
	const title = tag(xml, "title") || "YouTube";
	const author = tag(xml, "name") || title;
	const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, boundedLimit).map((m) => {
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
	const feedIds = new Set(videos.map((video) => video.remote?.videoId).filter((id) => Boolean(id)));
	const backfill = deepCatalog && channelPage ? await (async () => {
		const seen = new Set(feedIds);
		const rows = [];
		for (const renderer of channelPageRenderers(channelPage)) {
			const id = renderer.videoId;
			if (!id || seen.has(id)) continue;
			seen.add(id);
			rows.push(ytVideo({
				id,
				title: rendererText(renderer.title) || `${author} video`,
				published: "1970-01-01T00:00:00.000Z",
				thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				desc: rendererText(renderer.descriptionSnippet) || `${author} public channel catalog item.`,
				channelId,
				channelName: author,
				views: parsePublicViewCount(rendererText(renderer.viewCountText))
			}));
			if (rows.length >= Math.max(0, boundedLimit - videos.length)) break;
		}
		if (rows.length < Math.max(0, boundedLimit - videos.length)) rows.push(...await youtubeContinuationBackfill(channelPage, /* @__PURE__ */ new Set([...feedIds, ...rows.map((video) => video.remote?.videoId).filter((id) => Boolean(id))]), channelId, author, Math.max(0, boundedLimit - videos.length - rows.length)));
		return rows;
	})() : deepCatalog ? await youtubeChannelBackfill(channelId, author, feedIds, Math.max(0, boundedLimit - videos.length)) : [];
	videos.push(...backfill);
	const live = await youtubeLiveFromChannel(channelId, author);
	if (live && !videos.some((video) => video.id === live.id)) videos.unshift(live);
	const result = {
		channel: {
			id: `yt:${channelId}`,
			kind: "youtube",
			handle: author,
			title: author,
			channelId,
			lastCheckedAt: Date.now(),
			newestPublishedAt: Math.max(0, ...videos.filter((video) => !video.remote?.live).map((video) => video.addedAt)),
			lastResponseCount: videos.length
		},
		videos
	};
	if (boundedLimit <= LIBRARY_LIMITS.youtubeRoutineVideosPerChannel) {
		youtubeChannelCache.set(channelId, {
			at: Date.now(),
			result
		});
		while (youtubeChannelCache.size > YOUTUBE_CHANNEL_CACHE_LIMIT) youtubeChannelCache.delete(youtubeChannelCache.keys().next().value);
	}
	return boundedFollowResult(result, boundedLimit);
}
function twitchLogin(input) {
	const raw = input.trim().replaceAll("\\_", "_").replace(/^["'([{<]+|["')\]}>.;:]+$/g, "");
	try {
		return (new URL(raw.startsWith("http") ? raw : `https://twitch.tv/${raw}`).pathname.split("/").filter(Boolean)[0] ?? raw).replace(/^@/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
	} catch {
		return raw.replace(/^@/, "").replace(/^tw:/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
	}
}
function youtubeFromChannel(query, limit = LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, focused = true, deepCatalog = focused) {
	return providerRequest("youtube", query, focused, () => youtubeFromChannelUncoalesced(query, limit, deepCatalog));
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
var twitchChannelCache = /* @__PURE__ */ new Map();
function twitchPageGap() {
	return new Promise((resolve) => setTimeout(resolve, TWITCH_PAGE_GAP_MS));
}
function twitchClampFirst(n) {
	return Math.max(1, Math.min(100, Math.floor(n)));
}
async function twitchGqlJson(query, variables) {
	const res = await fetch("https://gql.twitch.tv/gql", {
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
	if (!res.ok) return null;
	return await res.json();
}
async function twitchUser(login, after, archivePageSize = TWITCH_ARCHIVE_PAGE_SIZE, broadcastType = "ARCHIVE") {
	const first = twitchClampFirst(archivePageSize);
	const json = await twitchGqlJson(`query($login:String!,$after:Cursor,$first:Int!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:$first,type:${broadcastType},after:$after){pageInfo{hasNextPage endCursor} edges{cursor node{id title description lengthSeconds publishedAt previewThumbnailURL(width:640,height:360) game{name}}}}}}`, {
		login,
		after: after ?? null,
		first
	});
	if (!json) return null;
	const user = json.data?.user ?? null;
	if (user && json.errors?.some((error) => /videos|first/i.test(error.message ?? ""))) return {
		...user,
		videos: {
			pageInfo: {
				hasNextPage: false,
				endCursor: null
			},
			edges: []
		}
	};
	return user;
}
/**
* Twitch exposes archives as a cursor connection (`first` ≤100). With the
* Android/TV Client-ID we can walk many pages toward the focused budget;
* empty / integrity failures stop the loop (rate-limit friendly gap between
* pages). Focused pulls also merge HIGHLIGHT + UPLOAD shelves.
*/
async function twitchArchive(login, limit) {
	let after;
	let first = null;
	const edges = [];
	const seen = /* @__PURE__ */ new Set();
	const maxPages = Math.max(1, Math.min(TWITCH_ARCHIVE_MAX_PAGES, Math.ceil(limit / Math.max(1, TWITCH_ARCHIVE_PAGE_SIZE)) + 1));
	const takePage = async (pageSize, cursor, type) => {
		let page = await twitchUser(login, cursor, pageSize, type);
		if (page?.id && !page.videos?.edges?.length && pageSize > 30 && !cursor && type === "ARCHIVE") page = await twitchUser(login, null, 30, type);
		return page;
	};
	for (let pageIndex = 0; pageIndex < maxPages && edges.length < limit; pageIndex += 1) {
		if (pageIndex > 0) await twitchPageGap();
		const page = await takePage(Math.min(TWITCH_ARCHIVE_PAGE_SIZE, limit - edges.length), after, "ARCHIVE");
		if (!page) return first;
		if (!first) first = page;
		const before = edges.length;
		for (const edge of page.videos?.edges ?? []) {
			const id = edge.node?.id;
			if (!id || seen.has(id)) continue;
			seen.add(id);
			edges.push(edge);
			if (edges.length >= limit) break;
		}
		const pageInfo = page.videos?.pageInfo;
		const nextCursor = pageInfo?.endCursor ?? page.videos?.edges?.at(-1)?.cursor ?? null;
		if (edges.length === before || !pageInfo?.hasNextPage || !nextCursor || nextCursor === after) break;
		after = nextCursor;
	}
	if (first && edges.length < limit) for (const type of ["HIGHLIGHT", "UPLOAD"]) {
		let typeAfter;
		for (let pageIndex = 0; pageIndex < 3 && edges.length < limit; pageIndex += 1) {
			if (pageIndex > 0) await twitchPageGap();
			const page = await takePage(Math.min(TWITCH_ARCHIVE_PAGE_SIZE, limit - edges.length), typeAfter, type);
			const before = edges.length;
			for (const edge of page?.videos?.edges ?? []) {
				const id = edge.node?.id;
				if (!id || seen.has(id)) continue;
				seen.add(id);
				edges.push(edge);
				if (edges.length >= limit) break;
			}
			const pageInfo = page?.videos?.pageInfo;
			const nextCursor = pageInfo?.endCursor ?? page?.videos?.edges?.at(-1)?.cursor ?? null;
			if (edges.length === before || !pageInfo?.hasNextPage || !nextCursor || nextCursor === typeAfter) break;
			typeAfter = nextCursor;
		}
		if (edges.length >= limit) break;
	}
	if (!first) return null;
	return {
		...first,
		videos: { edges }
	};
}
var TWITCH_CLIP_PERIODS = [
	null,
	"LAST_WEEK",
	"LAST_MONTH",
	"ALL_TIME"
];
async function twitchClips(login, limit) {
	if (limit <= 0) return [];
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const maxPages = Math.max(1, Math.min(TWITCH_CLIP_MAX_PAGES, Math.ceil(limit / 100) + 1));
	const periods = limit > 100 ? ["ALL_TIME"] : TWITCH_CLIP_PERIODS;
	for (const period of periods) {
		if (out.length >= limit) break;
		let after;
		for (let pageIndex = 0; pageIndex < maxPages && out.length < limit; pageIndex += 1) {
			if (pageIndex > 0) await twitchPageGap();
			const first = twitchClampFirst(Math.min(100, limit - out.length));
			const connection = ((await twitchGqlJson(`query($login:String!,$first:Int!,$after:Cursor){user(login:$login){${period ? `clips(first:$first, after:$after, criteria:{period:${period}}){pageInfo{hasNextPage endCursor} edges{cursor node{id slug title viewCount durationSeconds createdAt thumbnailURL}}}` : `clips(first:$first, after:$after){pageInfo{hasNextPage endCursor} edges{cursor node{id slug title viewCount durationSeconds createdAt thumbnailURL}}}`}}}`, {
				login,
				first,
				after: after ?? null
			}))?.data?.user)?.clips;
			const edges = connection?.edges ?? [];
			const before = out.length;
			for (const edge of edges) {
				const node = edge.node;
				const key = node?.slug || node?.id;
				if (!key || seen.has(key)) continue;
				seen.add(key);
				out.push(node);
				if (out.length >= limit) break;
			}
			const nextCursor = connection?.pageInfo?.endCursor ?? edges.at(-1)?.cursor ?? null;
			if (out.length === before || !connection?.pageInfo?.hasNextPage || !nextCursor || nextCursor === after) break;
			after = nextCursor;
		}
	}
	return out;
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
				videoId: node.id,
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
		const rawDuration = Number(clip.durationSeconds);
		const duration = Number.isFinite(rawDuration) && rawDuration > 0 && rawDuration <= 3600 ? rawDuration : void 0;
		out.push({
			id: `tw:c:${slug}`,
			folderId,
			name: clip.title || "Twitch clip",
			path: `twitch/${login}/clip/${slug}`,
			extension: "clip",
			mime: "video/twitch",
			size: 0,
			duration,
			addedAt: Date.parse(clip.createdAt ?? "") || Date.now(),
			poster: clip.thumbnailURL,
			tagline: clip.viewCount ? `${clip.viewCount.toLocaleString()} views · clip` : "Twitch clip",
			remote: {
				kind: "twitch",
				videoId: slug,
				channelName: title,
				live: false,
				views: clip.viewCount,
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
async function followTwitchUncoalesced(query, compact = false, clipLimit) {
	const login = twitchLogin(query);
	if (!login) throw new Error("Enter a Twitch channel.");
	const vodLimit = compact ? TWITCH_REFRESH_VOD_LIMIT : TWITCH_FOCUSED_VOD_LIMIT;
	const clipsWanted = clipLimit ?? (compact ? TWITCH_REFRESH_CLIP_LIMIT : TWITCH_FOCUSED_CLIP_LIMIT);
	const cacheKey = `${login}:${compact ? "r" : "f"}:${vodLimit}:${clipsWanted}`;
	const cached = twitchChannelCache.get(cacheKey);
	if (cached && Date.now() - cached.at < TWITCH_CHANNEL_CACHE_TTL_MS) return cached.result;
	const user = await twitchArchive(login, vodLimit);
	if (!user?.id) throw new Error(`Twitch could not resolve ${login}`);
	const clips = await twitchClips(login, clipsWanted);
	const title = user.displayName ?? login;
	const videos = twitchVideos(login, user, vodLimit, clips);
	const result = {
		channel: {
			id: `tw:${login}`,
			kind: "twitch",
			handle: login,
			title,
			channelId: user?.id,
			thumb: user?.profileImageURL,
			live: Boolean(user?.stream),
			lastCheckedAt: Date.now(),
			newestPublishedAt: Math.max(0, ...videos.filter((video) => !video.remote?.live).map((video) => video.addedAt)),
			lastResponseCount: videos.length
		},
		videos
	};
	twitchChannelCache.set(cacheKey, {
		at: Date.now(),
		result
	});
	while (twitchChannelCache.size > TWITCH_CHANNEL_CACHE_LIMIT) twitchChannelCache.delete(twitchChannelCache.keys().next().value);
	return result;
}
function followTwitch(query, compact = false, clipLimit) {
	return providerRequest("twitch", query, !compact, () => followTwitchUncoalesced(query, compact, clipLimit));
}
async function runFollowRemote(dataRaw) {
	const data = parseFollow(dataRaw);
	if ((data.kind === "auto" ? guessKind(data.query) : data.kind) === "twitch") return followTwitch(data.query, false, data.clipLimit);
	const videoId = ytVideoId(data.query);
	if (videoId) return youtubeFromVideo(videoId);
	return youtubeFromChannel(data.query);
}
async function runRefreshRemotes(dataRaw) {
	const data = parseRefresh(dataRaw);
	const videos = [];
	const channels = [];
	const refreshedIds = [];
	await mapPool(data.channels, 6, async (ch) => {
		try {
			if (ch.kind === "twitch") {
				const next = await followTwitch(ch.handle, true);
				channels.push({
					...ch,
					...next.channel,
					id: ch.id,
					lastProviderFailure: void 0
				});
				videos.push(...next.videos.map((video) => ({
					...video,
					folderId: ch.id
				})));
			} else {
				const next = await youtubeFromChannel(ch.channelId ? `https://www.youtube.com/channel/${ch.channelId}` : ch.handle, LIBRARY_LIMITS.youtubeRoutineVideosPerChannel, false, true);
				channels.push({
					...ch,
					...next.channel,
					id: ch.id,
					lastProviderFailure: void 0
				});
				videos.push(...next.videos.map((video) => ({
					...video,
					folderId: ch.id
				})));
			}
			refreshedIds.push(ch.id);
		} catch (error) {
			channels.push({
				...ch,
				lastProviderFailure: classifyProviderFailure(ch.kind, error)
			});
		}
	});
	return {
		videos,
		channels,
		refreshedIds,
		retryAt: Object.fromEntries(data.channels.flatMap((channel) => {
			const retry = retryAtFor(channel.kind, channel.handle);
			return retry ? [[channel.id, retry]] : [];
		}))
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
	const data = parseImport(dataRaw);
	const compact = data.items.length > 1;
	const rows = await mapPool(data.items, 6, async (item) => {
		for (let attempt = 0; attempt < 2; attempt += 1) try {
			if (item.kind === "twitch") return await followTwitch(item.query, compact);
			return await youtubeFromChannel(item.query, compact ? LIBRARY_LIMITS.youtubeBulkImportVideosPerChannel : LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, true, !compact);
		} catch {
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
		failedQueries: failedQueries.filter(Boolean)
	};
}
function parseTwitchUser(data) {
	if (typeof data !== "object" || data === null) throw new Error("Enter your Twitch name");
	const login = twitchLogin(asString(data.login));
	if (!login) throw new Error("Enter your Twitch name");
	return { login };
}
async function twitchGql(query, variables) {
	const res = await fetch("https://gql.twitch.tv/gql", {
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
	if (raw === "all" || raw == null) return [...ADULT_PULL_PROVIDERS];
	if (Array.isArray(raw)) {
		const out = raw.filter((p) => typeof p === "string" && known.has(p));
		return out.length ? [...new Set(out)] : [...ADULT_PULL_PROVIDERS];
	}
	if (typeof raw === "string" && known.has(raw)) return [raw];
	return [...ADULT_PULL_PROVIDERS];
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
	const maxVideos = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.min(Math.floor(maxRaw), LIBRARY_LIMITS.epornerVideosPerPull) : LIBRARY_LIMITS.epornerVideosPerPull;
	const append = Boolean(rec.append);
	return {
		query: query.slice(0, 80),
		order,
		page,
		maxVideos,
		append,
		providers: parseAdultProviders(rec.providers),
		providerPages: parseProviderPages(rec.providerPages),
		redditSources: parseRedditSources(rec.redditSources)
	};
}
function epornerVideo(row) {
	const id = asString(row.id).trim();
	const title = asString(row.title).trim();
	const embed = asString(row.embed).trim();
	const watch = asString(row.url).trim();
	if (!id || !title || !embed) return null;
	if (!embed.startsWith("https://www.eporner.com/embed/")) return null;
	const added = Date.parse(asString(row.added)) || Date.now();
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
	const url = `https://www.eporner.com/api/v2/video/search/?${new URLSearchParams({
		query,
		per_page: String(perPage),
		page: String(page),
		thumbsize: "medium",
		order,
		gay: "0",
		lq: "0",
		format: "json"
	}).toString()}`;
	const res = await cachedAdultFetch(url, {
		signal: AbortSignal.timeout(8e3),
		cacheTtlMs: 72e4,
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)"
		}
	});
	if (!res.ok) throw new Error(`Eporner API HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
	const json = await res.json();
	const videos = (json.videos ?? []).map(epornerVideo).filter((v) => v != null);
	return {
		videos,
		totalPages: typeof json.total_pages === "number" ? json.total_pages : page,
		totalCount: typeof json.total_count === "number" ? json.total_count : videos.length
	};
}
async function fetchEpornerPage(query, order, page, perPage) {
	try {
		const primary = await fetchEpornerPageOnce(query, order, page, perPage);
		if (primary.videos.length) return primary;
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
	const added = Date.parse(asString(row.publish_date)) || Date.now();
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
	const url = `https://api.redtube.com/?${params.toString()}`;
	const res = await cachedAdultFetch(url, {
		signal: AbortSignal.timeout(2e4),
		cacheTtlMs: 72e4,
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)"
		}
	});
	if (!res.ok) throw new Error(`RedTube API HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
	const json = await res.json();
	if (json.message && json.code) throw new Error(json.message);
	const videos = (json.videos ?? []).map((row) => {
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
var chaturbateCache = null;
var CHATURBATE_CACHE_MS = 18e4;
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
async function fetchChaturbateRooms(query, maxVideos) {
	if (!chaturbateCache || Date.now() - chaturbateCache.at > CHATURBATE_CACHE_MS) {
		const res = await cachedAdultFetch("https://chaturbate.com/affiliates/api/onlinerooms/?format=json&wm=DkfRj", {
			signal: AbortSignal.timeout(25e3),
			cacheTtlMs: 18e4,
			headers: {
				accept: "application/json",
				"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)"
			}
		});
		if (!res.ok) throw new Error(`Chaturbate rooms HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
		const json = await res.json();
		const rooms = (Array.isArray(json) ? json : []).map(chaturbateVideo).filter((video) => video != null);
		chaturbateCache = {
			at: Date.now(),
			rooms
		};
	}
	const needle = query.trim().toLowerCase();
	const filtered = !needle || needle === "all" ? chaturbateCache.rooms : chaturbateCache.rooms.filter((video) => {
		return `${video.name} ${video.description ?? ""} ${video.remote?.videoId ?? ""}`.toLowerCase().includes(needle);
	});
	return {
		videos: filtered.slice(0, maxVideos),
		totalPages: 1,
		totalCount: filtered.length
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
async function fetchMyFreeCamsRooms(query, maxVideos) {
	if (!myfreecamsCache || Date.now() - myfreecamsCache.at > MYFREECAMS_CACHE_MS) {
		const priorRooms = myfreecamsCache?.rooms ?? [];
		try {
			const res = await cachedAdultFetch("https://www.myfreecams.com/php/online_models.php", {
				cacheTtlMs: 18e4,
				signal: AbortSignal.timeout(12e3),
				headers: {
					accept: "text/plain, text/html;q=0.8",
					referer: "https://www.myfreecams.com/#Homepage",
					"accept-language": "en-US,en;q=0.8",
					"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)"
				}
			});
			if (!res.ok) throw new Error(`MyFreeCams public list HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
			const listing = myfreecamsListing(await res.text());
			if (!listing.rooms.length && listing.rows) {
				const states = myfreecamsStateSummary(listing.states);
				throw new Error(listing.publicRows ? `MyFreeCams listed ${listing.publicRows} public broadcast rows, but none had a usable safe room name.` : `MyFreeCams listed ${listing.rows} online rows but no public broadcasts (states: ${states || "unknown"}).`);
			}
			const rooms = listing.rooms.length ? await myfreecamsRoomsWithPreviews(listing.rooms) : [];
			myfreecamsCache = {
				at: Date.now(),
				rooms: rooms.length ? rooms : priorRooms
			};
		} catch (error) {
			if (priorRooms.length) myfreecamsCache = {
				at: Date.now(),
				rooms: priorRooms
			};
			else throw error;
		}
	}
	const needle = query.trim().toLowerCase();
	const filtered = !needle || needle === "all" ? myfreecamsCache.rooms : myfreecamsCache.rooms.filter((video) => video.name.toLowerCase().includes(needle));
	return {
		videos: filtered.slice(0, maxVideos),
		totalPages: 1,
		totalCount: filtered.length
	};
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
	const addedAt = Date.parse(published);
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
		addedAt: Number.isFinite(addedAt) ? addedAt : Date.now(),
		tagline: `r/${subreddit}${author ? ` · u/${author}` : ""}${flair ? ` · ${flair}` : ""}${isVideo ? " · video" : isImage ? " · photo" : ""}`,
		description: `reddit, r/${subreddit}, ${subreddit.replace(/_/g, " ")}, ${title}, ${flair}, ${media.watch ?? ""}`,
		poster: poster || void 0,
		src: isImage ? media.src || poster || permalink : directMedia || void 0,
		remote: {
			kind: "reddit",
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
	const posts = [];
	for (const match of xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)) {
		const video = redditVideo(match[1] ?? "", sub);
		if (video) posts.push(video);
	}
	return posts;
}
async function fetchRedditFeed(query, maxVideos, page = 1, configuredSources = []) {
	const configuredPages = configuredSources.length ? Math.max(1, Math.ceil(configuredSources.length / LIBRARY_LIMITS.redditSubsPerPull)) : LIBRARY_LIMITS.redditWindowsPerPull;
	const windows = Math.min(Math.max(1, LIBRARY_LIMITS.redditWindowsPerPull), configuredPages);
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
	const nextPage = page + windows <= lastTotalPages * 6 ? page + windows : null;
	return {
		videos: filtered.slice(0, maxVideos),
		totalPages: lastTotalPages,
		totalCount: filtered.length,
		nextPage
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
	const id = asString(row.id).trim();
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
		addedAt: Date.now(),
		tagline: `${host.id} · photo${owner ? ` · ${owner}` : ""}`,
		description: tags.slice(0, 400),
		poster: preview || sample || void 0,
		src: image,
		remote: {
			kind: "booru",
			videoId: id,
			channelName: owner || host.id,
			channelId: host.id,
			observedAt: Date.now(),
			embedUrl: image,
			watchUrl: watch,
			previewUrl: preview || sample || void 0,
			thumbFallbacks: [
				preview,
				sample,
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
		if (!id) continue;
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
			"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0)"
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
			"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0)"
		}
	});
	if (!res.ok) throw new Error(`${host.id} post ${id} HTTP ${res.status}`);
	const html = await res.text();
	const image = html.match(/<img\b(?=[^>]*\bid="image")[^>]*\bsrc="([^"]+)"[^>]*>/i)?.[1];
	const tags = html.match(/<img\b(?=[^>]*\bid="image")[^>]*\balt="([^"]*)"[^>]*>/i)?.[1] ?? "";
	if (!image) throw new Error(`${host.id} post ${id} has no public image`);
	return booruVideo({
		id,
		file_url: decodeBooruHtml(image),
		preview_url: decodeBooruHtml(image),
		tags: decodeBooruHtml(tags)
	}, host);
}
async function fetchBooruJson(host, tags, limit, pid) {
	const params = new URLSearchParams({
		page: "dapi",
		s: "post",
		q: "index",
		json: "1",
		limit: String(limit),
		pid: String(Math.max(0, pid)),
		tags
	});
	const url = `${"apiBase" in host ? host.apiBase : host.base}/index.php?${params.toString()}`;
	const res = await cachedAdultFetch(url, {
		signal: AbortSignal.timeout(15e3),
		cacheTtlMs: 6e5,
		headers: {
			accept: "application/json,text/plain,*/*",
			"user-agent": "Reelcase/1.0"
		}
	});
	if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
	const body = await res.text();
	let raw;
	try {
		raw = JSON.parse(body);
	} catch {
		const rows = booruPostsFromXml(body);
		if (rows.length) return rows.map((row) => booruVideo(row, host)).filter((video) => video != null);
		throw new Error(`${host.id} returned an unsupported public feed`);
	}
	const record = asRecord(raw);
	const rows = Array.isArray(raw) ? raw : Array.isArray(record?.post) ? record.post : Array.isArray(record?.posts) ? record.posts : [];
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
		const rows = await fetchBooruJson(host, tags, limit, pid);
		if (rows.length) return rows;
	} catch {}
	return fetchBooruListing(host, tags, limit, pid);
}
function booruTagsForHost(host, needle) {
	const query = needle.trim();
	if (host.id === "gelbooru") return ["rating:explicit", query].filter(Boolean).join(" ");
	return query;
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
	const id = asString(row.id).trim();
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
		addedAt: Date.now(),
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
			"user-agent": "Reelcase/1.0 (adult catalog; local library client)"
		}
	});
	if (!res.ok) throw new Error(`e621 HTTP ${res.status}`);
	const json = await res.json();
	const root = asRecord(json);
	const rows = Array.isArray(root?.posts) ? root.posts : Array.isArray(json) ? json : [];
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
		if (collected.length >= maxVideos) break;
	}
	if (!collected.length && errors.length) throw new Error(`Booru unavailable (${errors.join("; ")}).`);
	return {
		videos: collected,
		totalPages: page + (collected.length >= limit ? 1 : 0),
		totalCount: collected.length
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
		addedAt: Date.now(),
		tagline: [author, ...tagList.slice(0, 8)].filter(Boolean).join(" · ").slice(0, 160) || void 0,
		description: tagList.join(", ") || title,
		poster: thumbFallbacks[0],
		src: file || embed || void 0,
		remote: {
			kind: "redgifs",
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
	if (Array.isArray(payload)) return payload.map(asRecord).filter((r) => Boolean(r));
	const root = asRecord(payload);
	if (!root) return [];
	for (const key of [
		"gifs",
		"items",
		"data",
		"results",
		"trending",
		"feed"
	]) {
		const value = root[key];
		if (Array.isArray(value)) return value.map(asRecord).filter((r) => Boolean(r));
		const nested = asRecord(value);
		if (nested) for (const nestedKey of [
			"gifs",
			"items",
			"data",
			"results"
		]) {
			const inner = nested[nestedKey];
			if (Array.isArray(inner)) return inner.map(asRecord).filter((r) => Boolean(r));
		}
	}
	return [];
}
var redgifsAuth = null;
async function getRedgifsAccessToken() {
	const now = Date.now();
	if (redgifsAuth && redgifsAuth.expiresAt > now + 6e4) return redgifsAuth.token;
	const res = await fetch("https://api.redgifs.com/v2/auth/temporary", {
		headers: {
			accept: "application/json",
			"user-agent": "Reelcase/1.0"
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
			"user-agent": "Reelcase/1.0"
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
			"user-agent": "Reelcase/1.0"
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
	try {
		const direct = await fetchRedgifsDirect(query, maxVideos, page);
		if (direct.videos.length) return direct;
	} catch {}
	try {
		const viaAdl = await fetchRedgifsViaAdultDataLink(query, maxVideos, page);
		if (viaAdl.videos.length) return viaAdl;
	} catch {}
	return {
		videos: [],
		totalPages: page,
		totalCount: 0
	};
}
function liveRoomLimit(provider) {
	if (provider === "chaturbate") return LIBRARY_LIMITS.chaturbateRoomsPerPull;
	if (provider === "myfreecams") return LIBRARY_LIMITS.myfreecamsRoomsPerPull;
	return 0;
}
function providerPageBudget(provider) {
	if (provider === "redtube") return {
		maxPages: Math.min(LIBRARY_LIMITS.redtubePagesPerPull, 24),
		perPage: LIBRARY_LIMITS.redtubePageSize
	};
	const live = liveRoomLimit(provider);
	if (live) return {
		maxPages: 1,
		perPage: live
	};
	return {
		maxPages: LIBRARY_LIMITS.epornerPagesPerPull,
		perPage: LIBRARY_LIMITS.epornerPageSize
	};
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
async function pullProviderPages(provider, query, order, startPage, maxVideos, redditSources = []) {
	if (provider === "reddit") {
		const batch = await fetchRedditFeed(query, maxVideos, startPage, redditSources);
		return {
			videos: batch.videos,
			page: startPage,
			nextPage: batch.nextPage,
			totalCount: batch.totalCount
		};
	}
	if (provider === "booru") {
		const batch = await fetchBooruFeed(query, maxVideos, startPage);
		return {
			videos: batch.videos,
			page: startPage,
			nextPage: batch.videos.length ? startPage + 1 : null,
			totalCount: batch.totalCount
		};
	}
	if (provider === "redgifs") {
		const collected = [];
		const seen = /* @__PURE__ */ new Set();
		let page = startPage;
		let totalCount = 0;
		let hasNext = false;
		const pages = Math.max(1, Math.ceil(maxVideos / LIBRARY_LIMITS.redgifsPageSize));
		for (let index = 0; index < pages && collected.length < maxVideos; index += 1) {
			const batch = await fetchRedgifsFeed(query, Math.min(LIBRARY_LIMITS.redgifsPageSize, maxVideos - collected.length), page);
			totalCount += batch.totalCount;
			for (const video of batch.videos) {
				if (seen.has(video.id)) continue;
				seen.add(video.id);
				collected.push(video);
			}
			if (batch.videos.length < LIBRARY_LIMITS.redgifsPageSize) break;
			page += 1;
			hasNext = true;
		}
		return {
			videos: collected,
			page: startPage,
			nextPage: collected.length && hasNext ? page : null,
			totalCount
		};
	}
	if (provider === "chaturbate" || provider === "myfreecams") {
		const batch = provider === "chaturbate" ? await fetchChaturbateRooms(query, maxVideos) : await fetchMyFreeCamsRooms(query, maxVideos);
		return {
			videos: batch.videos,
			page: 1,
			nextPage: null,
			totalCount: batch.totalCount
		};
	}
	const collected = [];
	const seen = /* @__PURE__ */ new Set();
	let page = startPage;
	let totalPages = page;
	let totalCount = 0;
	let pagesFetched = 0;
	const { maxPages, perPage } = providerPageBudget(provider);
	const varietyOrders = [
		"top-weekly",
		"latest",
		"top-rated",
		"most-popular",
		"top-monthly"
	];
	while (collected.length < maxVideos && pagesFetched < maxPages) {
		const varietyOrder = provider === "redtube" || provider === "eporner" ? query.trim().toLowerCase() === "all" ? varietyOrders[(page - 1) % varietyOrders.length] : order : order;
		const batch = provider === "redtube" ? await fetchRedtubePage(query, varietyOrder, page) : await fetchEpornerPage(query, varietyOrder, page, perPage);
		totalPages = batch.totalPages;
		totalCount = batch.totalCount;
		pagesFetched += 1;
		if (!batch.videos.length) break;
		for (const video of batch.videos) {
			if (seen.has(video.id)) continue;
			seen.add(video.id);
			collected.push(video);
			if (collected.length >= maxVideos) break;
		}
		if (page >= totalPages) break;
		page += 1;
	}
	const computedNext = startPage + pagesFetched;
	return {
		videos: collected,
		page: startPage,
		nextPage: computedNext <= totalPages && collected.length ? computedNext : null,
		totalCount
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
	const providerDiagnostics = [];
	const batches = await Promise.allSettled(providers.map(async (provider) => {
		const rawBudget = share + (provider === "reddit" ? leftovers : 0);
		const live = liveRoomLimit(provider);
		const redditFloor = Math.min(LIBRARY_LIMITS.redditVideosPerPull, Math.max(rawBudget, Math.min(480, Math.floor(data.maxVideos * .45))));
		const underrepresentedFloor = Math.min(160, Math.max(rawBudget, Math.floor(data.maxVideos * .2)));
		const budget = provider === "reddit" ? redditFloor : provider === "booru" ? Math.min(LIBRARY_LIMITS.booruVideosPerPull, underrepresentedFloor) : provider === "redgifs" ? Math.min(LIBRARY_LIMITS.redgifsVideosPerPull, underrepresentedFloor) : live ? Math.min(live, underrepresentedFloor) : rawBudget;
		const startPage = data.providerPages?.[provider] ?? data.page;
		return {
			provider,
			batch: await withinAdultPullDeadline(pullProviderPages(provider, data.query, data.order, startPage, budget, data.redditSources), provider)
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
			providerDiagnostics.push({
				provider,
				status: batch.videos.length ? "loaded" : "empty",
				titles: batch.videos.length,
				detail: batch.videos.length ? `${batch.videos.length.toLocaleString()} titles from page ${batch.page}${batch.nextPage != null ? ` · next page ${batch.nextPage}` : ""}` : "The provider responded, but had no matching public results."
			});
			if (batch.nextPage != null) nextPage = nextPage == null ? batch.nextPage : Math.min(nextPage, batch.nextPage);
			continue;
		}
		const provider = providers[batches.indexOf(result)];
		const message = adultPullFailureDetail(result.reason);
		errors.push(`${provider}: ${message}`);
		providerNextPages[provider] = null;
		providerDiagnostics.push({
			provider,
			status: "failed",
			titles: 0,
			detail: message
		});
	}
	const redditHave = collected.filter((video) => video.remote?.kind === "reddit").length;
	const redditWant = Math.min(LIBRARY_LIMITS.redditVideosPerPull, Math.max(240, Math.min(480, Math.floor(data.maxVideos * .45))));
	if (providers.includes("reddit") && !data.redditSources.length && redditHave < redditWant) {
		const extraPage = (data.providerPages?.reddit ?? data.page) + LIBRARY_LIMITS.redditWindowsPerPull;
		try {
			const batch = await pullProviderPages("reddit", data.query, data.order, extraPage, redditWant - redditHave, data.redditSources);
			for (const video of batch.videos) {
				if (seen.has(video.id)) continue;
				seen.add(video.id);
				collected.push(video);
			}
			totalCount += batch.totalCount;
			if (batch.nextPage != null) providerNextPages.reddit = batch.nextPage;
		} catch (err) {
			const message = adultPullFailureDetail(err);
			errors.push(`reddit/extra: ${message}`);
			providerDiagnostics.push({
				provider: "reddit extra",
				status: "failed",
				titles: 0,
				detail: message
			});
		}
	}
	if (data.append && data.query.toLowerCase() === "all" && collected.length < data.maxVideos) {
		const fetishQueries = adultDeepenQueriesForPage(data.page, 12);
		const deepenProviders = providers.filter((p) => p === "eporner" || p === "redtube");
		const remaining = Math.max(0, data.maxVideos - collected.length);
		const slots = Math.max(1, fetishQueries.length * Math.max(1, deepenProviders.length));
		const perQuery = Math.max(20, Math.floor(remaining / slots));
		for (const fetish of fetishQueries) {
			for (const provider of deepenProviders) {
				if (collected.length >= data.maxVideos) break;
				try {
					const batch = await pullProviderPages(provider, fetish, data.order, 1, perQuery);
					for (const video of batch.videos) {
						if (seen.has(video.id)) continue;
						seen.add(video.id);
						collected.push(video);
						if (collected.length >= data.maxVideos) break;
					}
					totalCount += batch.totalCount;
				} catch (err) {
					const message = adultPullFailureDetail(err);
					errors.push(`${provider}/${fetish}: ${message}`);
					providerDiagnostics.push({
						provider: `${provider} · ${fetish}`,
						status: "failed",
						titles: 0,
						detail: message
					});
				}
			}
			if (collected.length >= data.maxVideos) break;
		}
	}
	if (!collected.length && errors.length) throw new Error(`Adult pulls failed (${errors.join("; ")}).`);
	return {
		videos: collected,
		source: providers.join("+"),
		note: errors.length ? `Partial adult pull — ${errors.join("; ")}. Remaining official APIs still returned titles.` : "Pulled via official public APIs and public Reddit Atom feeds. Playback uses public embeds, room deep-links, or Reddit permalinks; keywords/tags become local source + fetish tags.",
		page: data.page,
		nextPage,
		totalCount,
		providers,
		providerNextPages,
		providerDiagnostics
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
			const response = await fetch(`https://www.youtube.com/youtubei/v1/next?key=${encodeURIComponent(apiKey)}`, {
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
				signal: AbortSignal.timeout(15e3)
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
		for (let page = 0; page < 2 && comments.length < limit && continuation; page += 1) {
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
			const response = await fetch(`https://www.youtube.com/youtubei/v1/${path}?key=${encodeURIComponent(apiKey)}`, {
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
				signal: AbortSignal.timeout(15e3)
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
			const res = await fetch("https://gql.twitch.tv/gql", {
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
	const url = `https://api.redtube.com/?${new URLSearchParams({
		data: "redtube.Stars.getStarDetailedList",
		output: "json",
		page: String(data.page)
	}).toString()}`;
	const res = await cachedAdultFetch(url, {
		signal: AbortSignal.timeout(2e4),
		cacheTtlMs: 18e5,
		headers: {
			accept: "application/json",
			"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)"
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
var followRemote_createServerFn_handler = createServerRpc({
	id: "6ddf382bfb4b5fe1160413e3ea17d862e2c50c361d612b8f7eb56c34209151ed",
	name: "followRemote",
	filename: "src/lib/remote/functions.ts"
}, (opts) => followRemote.__executeServer(opts));
var followRemote = createServerFn({ method: "POST" }).validator(input).handler(followRemote_createServerFn_handler, ({ data }) => runFollowRemote(data));
var refreshRemotes_createServerFn_handler = createServerRpc({
	id: "8047757e6e5964253c5dd3b40dd370ef7377adb7405d19aba7212b1f49c66e67",
	name: "refreshRemotes",
	filename: "src/lib/remote/functions.ts"
}, (opts) => refreshRemotes.__executeServer(opts));
var refreshRemotes = createServerFn({ method: "POST" }).validator(input).handler(refreshRemotes_createServerFn_handler, ({ data }) => runRefreshRemotes(data));
var importChannels_createServerFn_handler = createServerRpc({
	id: "273f1d8273d15edc5567f32d338c62bb6af101aed883079cd44c9002c43fa33c",
	name: "importChannels",
	filename: "src/lib/remote/functions.ts"
}, (opts) => importChannels.__executeServer(opts));
var importChannels = createServerFn({ method: "POST" }).validator(input).handler(importChannels_createServerFn_handler, ({ data }) => runImportChannels(data));
var fetchTwitchFollowing_createServerFn_handler = createServerRpc({
	id: "926b625b25b1f6c5d08281cc86b3196dbb11bcb5b683a95b5ebcf2111dc013b0",
	name: "fetchTwitchFollowing",
	filename: "src/lib/remote/functions.ts"
}, (opts) => fetchTwitchFollowing.__executeServer(opts));
var fetchTwitchFollowing = createServerFn({ method: "POST" }).validator(input).handler(fetchTwitchFollowing_createServerFn_handler, ({ data }) => runFetchTwitchFollowing(data));
var searchAdultVideos_createServerFn_handler = createServerRpc({
	id: "0e94cec61957c6cccbe0dc56ae15e7a5544920a3a6da937df6a89d530e96fb39",
	name: "searchAdultVideos",
	filename: "src/lib/remote/functions.ts"
}, (opts) => searchAdultVideos.__executeServer(opts));
var searchAdultVideos = createServerFn({ method: "POST" }).validator(input).handler(searchAdultVideos_createServerFn_handler, ({ data }) => runSearchAdultVideos(data));
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
//#endregion
export { fetchAdultComments_createServerFn_handler, fetchTwitchFollowing_createServerFn_handler, followRemote_createServerFn_handler, importChannels_createServerFn_handler, refreshRemotes_createServerFn_handler, searchAdultVideos_createServerFn_handler, searchRedtubeStars_createServerFn_handler };
