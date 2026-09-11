import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-BM8KSC1c.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
function channelPageRenderers(html) {
	const match = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
	if (!match?.[1]) return [];
	try {
		const root = JSON.parse(match[1]);
		const found = [];
		const stack = [root];
		while (stack.length && found.length < 1200) {
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
	} catch {
		return [];
	}
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
async function youtubeFromChannelUncoalesced(query, limit = 720, deepCatalog = true) {
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
	const boundedLimit = Math.max(24, Math.min(720, Math.floor(limit)));
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
function youtubeFromChannel(query, limit = 720, focused = true, deepCatalog = focused) {
	return providerRequest("youtube", query, focused, () => youtubeFromChannelUncoalesced(query, limit, deepCatalog));
}
var TWITCH_ARCHIVE_PAGE_SIZE = 160;
var TWITCH_FOCUSED_VOD_LIMIT = 2e3;
var TWITCH_REFRESH_VOD_LIMIT = 160;
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
function twitchVideos(login, user, vodLimit = 160) {
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
				const next = await youtubeFromChannel(ch.channelId ? `https://www.youtube.com/channel/${ch.channelId}` : ch.handle, 48, false, false);
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
			return await youtubeFromChannel(item.query, compact ? 48 : 720, true, !compact);
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
//#endregion
export { fetchTwitchFollowing_createServerFn_handler, followRemote_createServerFn_handler, importChannels_createServerFn_handler, refreshRemotes_createServerFn_handler };
