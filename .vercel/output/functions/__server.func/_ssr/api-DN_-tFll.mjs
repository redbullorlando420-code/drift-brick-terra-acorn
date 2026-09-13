import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { A as expandAdultThumbFallbacks, B as isUsableAdultThumb, W as pickRedtubeThumb, _ as REDDIT_FOLDER_ID, b as adultDeepenQueriesForPage, c as ADULT_PULL_PROVIDERS, d as BOORU_FOLDER_ID, f as CAMSODA_FOLDER_ID, g as MYFREECAMS_FOLDER_ID, h as LIBRARY_LIMITS, j as extractRedditFlair, k as cachedAdultFetch, l as ADULT_REDDIT_SUBS, m as EPORNER_FOLDER_ID, p as CHATURBATE_FOLDER_ID, q as redtubeStarNames, v as REDGIFS_FOLDER_ID, y as REDTUBE_FOLDER_ID } from "./library-limits-lu5rb8Fj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DN_-tFll.js
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
	return {
		query,
		kind: rec.kind === "youtube" || rec.kind === "twitch" ? rec.kind : "auto"
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
		description: entry.desc.slice(0, 4e3),
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
var YOUTUBE_CHANNEL_CACHE_LIMIT = 64;
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
			signal: AbortSignal.timeout(15e3)
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
	youtubeChannelCache.set(channelId, {
		at: Date.now(),
		result
	});
	while (youtubeChannelCache.size > YOUTUBE_CHANNEL_CACHE_LIMIT) youtubeChannelCache.delete(youtubeChannelCache.keys().next().value);
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
var TWITCH_ARCHIVE_PAGE_SIZE = LIBRARY_LIMITS.twitchArchivePageSize;
var TWITCH_FOCUSED_VOD_LIMIT = LIBRARY_LIMITS.twitchFocusedVodsPerChannel;
var TWITCH_REFRESH_VOD_LIMIT = LIBRARY_LIMITS.twitchRoutineVodsPerChannel;
async function twitchUser(login, after, archivePageSize = TWITCH_ARCHIVE_PAGE_SIZE) {
	const res = await fetch("https://gql.twitch.tv/gql", {
		signal: AbortSignal.timeout(12e3),
		method: "POST",
		headers: {
			"client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
			"content-type": "application/json"
		},
		body: JSON.stringify({
			query: `query($login:String!,$after:Cursor,$first:Int!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:$first,type:ARCHIVE,after:$after){pageInfo{hasNextPage endCursor} edges{cursor node{id title description lengthSeconds publishedAt previewThumbnailURL(width:640,height:360) game{name}}}}}}`,
			variables: {
				login,
				after: after ?? null,
				first: archivePageSize
			}
		})
	});
	if (!res.ok) return null;
	return (await res.json()).data?.user ?? null;
}
/**
* Twitch exposes archives as a cursor connection. Reading only its first page
* made a busy creator look as though they had about 160 VODs, and a later
* focused refresh then overwrote the locally retained history with that page.
* Deep reads are reserved for a user-initiated channel pull; rotating live
* refreshes intentionally keep their small first-page window.
*/
async function twitchArchive(login, limit) {
	let after;
	let first = null;
	const edges = [];
	const seen = /* @__PURE__ */ new Set();
	while (edges.length < limit) {
		const page = await twitchUser(login, after, Math.min(TWITCH_ARCHIVE_PAGE_SIZE, limit - edges.length));
		if (!page) return first;
		if (!first) first = page;
		for (const edge of page.videos?.edges ?? []) {
			const id = edge.node?.id;
			if (!id || seen.has(id)) continue;
			seen.add(id);
			edges.push(edge);
			if (edges.length >= limit) break;
		}
		const pageInfo = page.videos?.pageInfo;
		const nextCursor = pageInfo?.endCursor ?? page.videos?.edges?.at(-1)?.cursor;
		if (!pageInfo?.hasNextPage || !nextCursor || nextCursor === after) break;
		after = nextCursor;
	}
	if (!first) return null;
	return {
		...first,
		videos: { edges }
	};
}
function twitchVideos(login, user, vodLimit = TWITCH_ARCHIVE_PAGE_SIZE) {
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
			description: node.description?.slice(0, 4e3),
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
async function followTwitchUncoalesced(query, compact = false) {
	const login = twitchLogin(query);
	if (!login) throw new Error("Enter a Twitch channel.");
	const user = await twitchArchive(login, compact ? TWITCH_REFRESH_VOD_LIMIT : TWITCH_FOCUSED_VOD_LIMIT);
	if (!user?.id) throw new Error(`Twitch could not resolve ${login}`);
	const title = user.displayName ?? login;
	const videos = twitchVideos(login, user, compact ? TWITCH_REFRESH_VOD_LIMIT : TWITCH_FOCUSED_VOD_LIMIT);
	return {
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
}
function followTwitch(query, compact = false) {
	return providerRequest("twitch", query, !compact, () => followTwitchUncoalesced(query, compact));
}
var followRemote_createServerFn_handler = createServerRpc({
	id: "0c214d4b031988870bdc1c9a42a92ccbf9e9579cd8ab478f2d173e66fe73e2f0",
	name: "followRemote",
	filename: "src/lib/remote/api.ts"
}, (opts) => followRemote.__executeServer(opts));
var followRemote = createServerFn({ method: "POST" }).validator((data) => parseFollow(data)).handler(followRemote_createServerFn_handler, async ({ data }) => {
	if ((data.kind === "auto" ? guessKind(data.query) : data.kind) === "twitch") return followTwitch(data.query);
	const videoId = ytVideoId(data.query);
	if (videoId) return youtubeFromVideo(videoId);
	return youtubeFromChannel(data.query);
});
var refreshRemotes_createServerFn_handler = createServerRpc({
	id: "ac1a300259a0cb0e7b027567a01868e6019bb4d175aa2aacdf50dd329b558123",
	name: "refreshRemotes",
	filename: "src/lib/remote/api.ts"
}, (opts) => refreshRemotes.__executeServer(opts));
var refreshRemotes = createServerFn({ method: "POST" }).validator((data) => parseRefresh(data)).handler(refreshRemotes_createServerFn_handler, async ({ data }) => {
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
					id: ch.id
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
					id: ch.id
				});
				videos.push(...next.videos.map((video) => ({
					...video,
					folderId: ch.id
				})));
			}
			refreshedIds.push(ch.id);
		} catch {
			channels.push(ch);
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
});
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
var importChannels_createServerFn_handler = createServerRpc({
	id: "d7a9de260cc8839e45abd41f5c96ef881c8fdf9d186bdd087f29f6faeff9bd1d",
	name: "importChannels",
	filename: "src/lib/remote/api.ts"
}, (opts) => importChannels.__executeServer(opts));
var importChannels = createServerFn({ method: "POST" }).validator((data) => parseImport(data)).handler(importChannels_createServerFn_handler, async ({ data }) => {
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
});
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
var fetchTwitchFollowing_createServerFn_handler = createServerRpc({
	id: "298e45714281c48abde137e2b56dd5a9336fcd5d739cb85235ad8f876afe9a48",
	name: "fetchTwitchFollowing",
	filename: "src/lib/remote/api.ts"
}, (opts) => fetchTwitchFollowing.__executeServer(opts));
var fetchTwitchFollowing = createServerFn({ method: "POST" }).validator((data) => parseTwitchUser(data)).handler(fetchTwitchFollowing_createServerFn_handler, async ({ data }) => {
	const login = data.login;
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
});
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
async function fetchEpornerPage(query, order, page, perPage) {
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
var CAMSODA_TPL = [
	"user_id",
	"username",
	"display_name",
	"status",
	"connections",
	"sort_value",
	"subject_html",
	"stream_name",
	"gender",
	"edge_servers",
	"thumb",
	"pvt_rating",
	"bitrate",
	"control_her",
	"standby",
	"offline_picture"
];
function asTplMap(tpl) {
	if (Array.isArray(tpl)) return Object.fromEntries(tpl.map((value, index) => [String(index), value]));
	if (tpl && typeof tpl === "object") return tpl;
	return {};
}
function camsodaValue(tpl, field) {
	return tpl[field] ?? tpl[String(CAMSODA_TPL.indexOf(field))];
}
function stripMarkup(value) {
	return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function camsodaVideo(row) {
	const tpl = asTplMap(row.tpl);
	const username = asString(camsodaValue(tpl, "username")).trim().toLowerCase();
	if (!username || !/^[a-z0-9_-]+$/.test(username)) return null;
	const status = asString(camsodaValue(tpl, "status")).trim().toLowerCase();
	if (status && /private|offline|away|hidden/.test(status)) return null;
	const display = asString(camsodaValue(tpl, "display_name")).trim() || username;
	const subject = stripMarkup(asString(camsodaValue(tpl, "subject_html")));
	if (adultBlockedText(username, display, subject)) return null;
	const thumb = asString(camsodaValue(tpl, "thumb")).trim();
	const offlinePicture = asString(camsodaValue(tpl, "offline_picture")).trim();
	const connections = camsodaValue(tpl, "connections");
	const viewers = typeof connections === "number" && Number.isFinite(connections) ? connections : void 0;
	const watch = `https://www.camsoda.com/${encodeURIComponent(username)}`;
	return {
		id: `camsoda:${username}`,
		folderId: CAMSODA_FOLDER_ID,
		name: display,
		path: `camsoda/${username}`,
		extension: "camsoda",
		mime: "video/camsoda",
		size: 0,
		addedAt: Date.now(),
		tagline: subject.slice(0, 160) || "Live on CamSoda",
		description: [
			"live",
			"cam",
			subject
		].filter(Boolean).join(", ") || void 0,
		poster: thumb || void 0,
		src: watch,
		remote: {
			kind: "camsoda",
			videoId: username,
			channelName: display,
			live: true,
			viewers,
			observedAt: Date.now(),
			embedUrl: watch,
			watchUrl: watch,
			previewUrl: thumb || void 0,
			thumbFallbacks: [thumb, offlinePicture].filter(isUsableAdultThumb)
		}
	};
}
var camsodaCache = null;
var CAMSODA_CACHE_MS = 18e4;
async function fetchCamSodaRooms(query, maxVideos) {
	if (!camsodaCache || Date.now() - camsodaCache.at > CAMSODA_CACHE_MS) {
		const priorRooms = camsodaCache?.rooms ?? [];
		const res = await cachedAdultFetch("https://www.camsoda.com/api/v1/browse/online", {
			cacheTtlMs: 18e4,
			signal: AbortSignal.timeout(25e3),
			headers: {
				accept: "application/json",
				referer: "https://www.camsoda.com/",
				"accept-language": "en-US,en;q=0.8",
				"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)"
			}
		});
		if (res.status === 403) camsodaCache = {
			at: Date.now(),
			rooms: priorRooms
		};
		else if (!res.ok) throw new Error(`CamSoda rooms HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
		else {
			const json = await res.json();
			const rooms = (Array.isArray(json) ? json : Array.isArray(json.results) ? json.results : Array.isArray(json.rooms) ? json.rooms : []).map(camsodaVideo).filter((video) => video != null);
			camsodaCache = {
				at: Date.now(),
				rooms: rooms.length ? rooms : priorRooms
			};
		}
	}
	const needle = query.trim().toLowerCase();
	const filtered = !needle || needle === "all" ? camsodaCache.rooms : camsodaCache.rooms.filter((video) => {
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
var MYFREECAMS_PROFILE_PREVIEWS_PER_REFRESH = 12;
var MYFREECAMS_PROFILE_PREVIEW_CONCURRENCY = 4;
var MYFREECAMS_PROFILE_SUCCESS_CACHE_MS = 12e5;
var MYFREECAMS_PROFILE_MISS_CACHE_MS = 24e4;
var myfreecamsPreviewCache = /* @__PURE__ */ new Map();
var myfreecamsPreviewCursor = 0;
function myfreecamsWatchUrl(username) {
	return `https://www.myfreecams.com/#${encodeURIComponent(username)}`;
}
function myfreecamsAppUrl(username) {
	return `https://app.myfreecams.com/${encodeURIComponent(username.toLowerCase())}`;
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
function myfreecamsImageFromAppPage(payload) {
	const candidates = [];
	const attr = (tag, name) => {
		const match = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
		return htmlDecode(match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
	};
	for (const tag of payload.match(/<meta\b[^>]*>/gi) ?? []) {
		const key = (attr(tag, "property") || attr(tag, "name")).toLowerCase();
		if (key === "og:image" || key === "twitter:image") candidates.push(attr(tag, "content"));
	}
	for (const match of payload.matchAll(/\b(?:src|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) candidates.push(htmlDecode(match[1] ?? match[2] ?? match[3] ?? "").trim());
	const usable = [...new Set(candidates)].filter((url) => {
		try {
			const parsed = new URL(url);
			return parsed.protocol === "https:" && /^(?:img|snap)\.mfcimg\.com$/i.test(parsed.hostname);
		} catch {
			return false;
		}
	});
	const poster = usable.find((url) => /^https:\/\/snap\.mfcimg\.com\//i.test(url)) ?? usable[0];
	return {
		poster,
		modelId: poster?.match(/\/photos2\/\d+\/(\d+)\/|\/mfc_(\d+)/i)?.[1] ?? poster?.match(/\/mfc_(\d+)/i)?.[1]
	};
}
function myfreecamsPreviewFresh(preview, now) {
	return now - preview.at <= (preview.poster ? MYFREECAMS_PROFILE_SUCCESS_CACHE_MS : MYFREECAMS_PROFILE_MISS_CACHE_MS);
}
async function fetchMyFreeCamsPreview(username) {
	const key = username.toLowerCase();
	const now = Date.now();
	const cached = myfreecamsPreviewCache.get(key);
	if (cached && myfreecamsPreviewFresh(cached, now)) return cached;
	let next = { at: now };
	try {
		const res = await cachedAdultFetch(myfreecamsAppUrl(username), {
			cacheTtlMs: MYFREECAMS_PROFILE_SUCCESS_CACHE_MS,
			cacheKey: `GET:mfc-profile:${key}`,
			signal: AbortSignal.timeout(3500),
			headers: {
				accept: "text/html,application/xhtml+xml;q=0.9",
				"accept-language": "en-US,en;q=0.8",
				"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)"
			}
		});
		if (res.ok) next = {
			at: now,
			...myfreecamsImageFromAppPage(await res.text())
		};
	} catch {}
	myfreecamsPreviewCache.set(key, next);
	return next;
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
async function myfreecamsRoomsWithPreviews(rooms, maxVideos, query) {
	const now = Date.now();
	const previews = /* @__PURE__ */ new Map();
	let candidates = [];
	for (const room of rooms) {
		const username = room.remote?.videoId ?? room.name;
		const cached = myfreecamsPreviewCache.get(username.toLowerCase());
		if (cached && myfreecamsPreviewFresh(cached, now)) previews.set(username.toLowerCase(), cached);
		else candidates.push(username);
	}
	const needle = query.trim().toLowerCase();
	if (needle && needle !== "all") candidates = [...candidates.filter((username) => username.toLowerCase().includes(needle)), ...candidates.filter((username) => !username.toLowerCase().includes(needle))];
	const take = Math.min(MYFREECAMS_PROFILE_PREVIEWS_PER_REFRESH, Math.max(0, maxVideos), candidates.length);
	if (take) {
		const start = myfreecamsPreviewCursor % candidates.length;
		myfreecamsPreviewCursor += take;
		const selected = Array.from({ length: take }, (_, index) => candidates[(start + index) % candidates.length]);
		for (let index = 0; index < selected.length; index += MYFREECAMS_PROFILE_PREVIEW_CONCURRENCY) {
			const batch = selected.slice(index, index + MYFREECAMS_PROFILE_PREVIEW_CONCURRENCY);
			const results = await Promise.all(batch.map(async (username) => [username, await fetchMyFreeCamsPreview(username)]));
			for (const [username, preview] of results) previews.set(username.toLowerCase(), preview);
		}
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
			const rooms = listing.rooms.length ? await myfreecamsRoomsWithPreviews(listing.rooms, maxVideos, query) : [];
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
	const configured = configuredSources.length ? [...configuredSources].sort((a, b) => b.priority - a.priority || a.subreddit.localeCompare(b.subreddit)).map((row) => row.subreddit) : [...ADULT_REDDIT_SUBS];
	const all = [...new Map((configured.length ? configured : [...ADULT_REDDIT_SUBS]).map((sub) => [sub.toLowerCase(), sub])).values()];
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
				cacheTtlMs: 36e4,
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
		if (!xml) await new Promise((resolve) => setTimeout(resolve, 250));
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
function booruVideo(row, host) {
	const id = asString(row.id).trim();
	const tags = asString(row.tags).trim();
	const owner = pickString(row.owner, row.creator, row.uploader).trim();
	const preview = asString(row.preview_url).trim();
	const sample = asString(row.sample_url).trim();
	const file = asString(row.file_url).trim();
	const image = sample || preview || file;
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
async function fetchBooruHost(host, tags, limit, pid) {
	const params = new URLSearchParams({
		page: "dapi",
		s: "post",
		q: "index",
		json: "1",
		limit: String(limit),
		pid: String(Math.max(0, pid)),
		tags
	});
	const url = `${host.base}/index.php?${params.toString()}`;
	const res = await cachedAdultFetch(url, {
		signal: AbortSignal.timeout(15e3),
		cacheTtlMs: 6e5,
		headers: {
			accept: "application/json,text/plain,*/*",
			"user-agent": "Reelcase/1.0"
		}
	});
	if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
	const raw = await res.json();
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
async function fetchBooruFeed(query, maxVideos, page) {
	const needle = query.trim().toLowerCase();
	const tagQuery = !needle || needle === "all" ? "rating:explicit" : `rating:explicit ${needle}`;
	const limit = LIBRARY_LIMITS.booruPageSize;
	const pid = Math.max(0, page - 1);
	const collected = [];
	const seen = /* @__PURE__ */ new Set();
	const errors = [];
	for (const host of BOORU_HOSTS) {
		if (collected.length >= maxVideos) break;
		try {
			const batch = await fetchBooruHost(host, tagQuery, Math.min(limit, maxVideos - collected.length), pid);
			for (const video of batch) {
				if (seen.has(video.id)) continue;
				seen.add(video.id);
				collected.push(video);
				if (collected.length >= maxVideos) break;
			}
		} catch (err) {
			errors.push(`${host.id}: ${err instanceof Error ? err.message : "unavailable"}`);
		}
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
	const author = pickString(user.username, user.name, row.username, row.userName, row.author);
	const embed = pickString(urls.html, urls.player, row.embedUrl, row.embed_url, `https://www.redgifs.com/ifr/${encodeURIComponent(id)}`);
	const watch = pickString(urls.webUrl, urls.web_url, row.url, row.webUrl, `https://www.redgifs.com/watch/${encodeURIComponent(id)}`);
	const thumb = pickString(urls.thumbnail, urls.thumb, urls.preview, urls.poster, urls.posterUrl, urls.previewUrl, row.thumbnail, row.thumb, row.poster, row.previewUrl);
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
async function fetchRedgifsFeed(query, maxVideos, page) {
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
function liveRoomLimit(provider) {
	if (provider === "chaturbate") return LIBRARY_LIMITS.chaturbateRoomsPerPull;
	if (provider === "camsoda") return LIBRARY_LIMITS.camsodaRoomsPerPull;
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
	if (provider === "chaturbate" || provider === "camsoda" || provider === "myfreecams") {
		const batch = provider === "chaturbate" ? await fetchChaturbateRooms(query, maxVideos) : provider === "camsoda" ? await fetchCamSodaRooms(query, maxVideos) : await fetchMyFreeCamsRooms(query, maxVideos);
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
var searchAdultVideos_createServerFn_handler = createServerRpc({
	id: "b67bda5afb0e1fb905845cee088441086d5bba37e933c8edb45ef4d6c5182360",
	name: "searchAdultVideos",
	filename: "src/lib/remote/api.ts"
}, (opts) => searchAdultVideos.__executeServer(opts));
var searchAdultVideos = createServerFn({ method: "POST" }).validator((data) => parseAdultSearch(data)).handler(searchAdultVideos_createServerFn_handler, async ({ data }) => {
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
});
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
var fetchAdultComments_createServerFn_handler = createServerRpc({
	id: "c94242a255b5578005d0637a8c72789ab5d9dbe21861256590a340456a1ea9f6",
	name: "fetchAdultComments",
	filename: "src/lib/remote/api.ts"
}, (opts) => fetchAdultComments.__executeServer(opts));
var fetchAdultComments = createServerFn({ method: "POST" }).validator((data) => {
	const rec = typeof data === "object" && data !== null ? data : {};
	return {
		kind: asString(rec.kind).trim(),
		videoId: asString(rec.videoId).trim(),
		watchUrl: asString(rec.watchUrl).trim()
	};
}).handler(fetchAdultComments_createServerFn_handler, async ({ data }) => {
	if (data.kind !== "reddit" || !data.videoId) return {
		comments: [],
		note: "This provider does not expose a public comment feed."
	};
	const id = data.videoId.replace(/^t3_/, "");
	const canonical = `https://www.reddit.com/comments/${encodeURIComponent(id)}.rss?limit=40`;
	const oldCanonical = `https://old.reddit.com/comments/${encodeURIComponent(id)}.rss?limit=40`;
	const permalink = data.watchUrl.match(/^https:\/\/www\.reddit\.com\/r\/[^/]+\/comments\/[a-z0-9]+/i)?.[0];
	const oldPermalink = permalink?.replace(/^https:\/\/www\.reddit\.com/i, "https://old.reddit.com");
	const urls = permalink ? [
		`${permalink}.rss?limit=40`,
		oldPermalink ? `${oldPermalink}.rss?limit=40` : oldCanonical,
		canonical,
		oldCanonical
	] : [canonical, oldCanonical];
	try {
		let lastStatus = 0;
		for (const url of urls) {
			const res = await cachedAdultFetch(url, {
				signal: AbortSignal.timeout(12e3),
				cacheTtlMs: 9e5,
				headers: {
					accept: "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
					"user-agent": "linux:reelcase:1.0 (by /u/reelcase)"
				}
			});
			lastStatus = res.status;
			if (res.status === 429) continue;
			if (!res.ok) continue;
			const comments = parseRedditCommentEntries(await res.text());
			return {
				comments,
				note: comments.length ? "Live Reddit comments via public Atom RSS." : "No public comments returned for this post."
			};
		}
		return {
			comments: [],
			note: lastStatus === 429 ? "Reddit comment RSS rate-limited — try again later." : `Reddit comments unavailable (HTTP ${lastStatus || "network"}).`
		};
	} catch (err) {
		return {
			comments: [],
			note: err instanceof Error ? err.message : "Comments unavailable."
		};
	}
});
var searchRedtubeStars_createServerFn_handler = createServerRpc({
	id: "49eff4fc659c625b4ff6b2ae76ba10b0db89905b9626afe89893193d4d2e7884",
	name: "searchRedtubeStars",
	filename: "src/lib/remote/api.ts"
}, (opts) => searchRedtubeStars.__executeServer(opts));
var searchRedtubeStars = createServerFn({ method: "POST" }).validator((data) => {
	const rec = typeof data === "object" && data !== null ? data : {};
	const page = Number(rec.page);
	return {
		query: asString(rec.query).trim(),
		page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
	};
}).handler(searchRedtubeStars_createServerFn_handler, async ({ data }) => {
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
});
//#endregion
export { fetchAdultComments_createServerFn_handler, fetchTwitchFollowing_createServerFn_handler, followRemote_createServerFn_handler, importChannels_createServerFn_handler, refreshRemotes_createServerFn_handler, searchAdultVideos_createServerFn_handler, searchRedtubeStars_createServerFn_handler };
