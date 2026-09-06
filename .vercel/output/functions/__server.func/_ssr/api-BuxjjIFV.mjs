import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-BuxjjIFV.js
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
	const res = await fetch(url, { headers: {
		"user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai) AppleWebKit/537.36",
		accept: "text/html,application/xhtml+xml,application/xml,application/json"
	} });
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
		addedAt: published,
		tagline: entry.desc.slice(0, 140),
		poster: entry.thumb || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
		src: `https://www.youtube.com/embed/${entry.id}`,
		remote: {
			kind: "youtube",
			videoId: entry.id,
			channelId: entry.channelId,
			channelName: entry.channelName,
			embedUrl: `https://www.youtube.com/embed/${entry.id}`,
			watchUrl: `https://www.youtube.com/watch?v=${entry.id}`,
			previewUrl: `https://i.ytimg.com/an_webp/${entry.id}/mqdefault_6s.webp`
		}
	};
}
async function youtubeFromVideo(id) {
	const oembed = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`);
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
			thumb: meta.thumbnail_url
		},
		videos: [video]
	};
}
var YT_INBOX = "youtube:inbox";
async function youtubeFromChannel(query, limit = 32) {
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
	const xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`);
	const title = tag(xml, "title") || "YouTube";
	const author = tag(xml, "name") || title;
	const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit).map((m) => {
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
			channelName: author
		});
	});
	return {
		channel: {
			id: `yt:${channelId}`,
			kind: "youtube",
			handle: author,
			title: author,
			channelId
		},
		videos
	};
}
function twitchLogin(input) {
	const raw = input.trim().replaceAll("\\_", "_").replace(/^["'([{<]+|["')\]}>.;:]+$/g, "");
	try {
		return (new URL(raw.startsWith("http") ? raw : `https://twitch.tv/${raw}`).pathname.split("/").filter(Boolean)[0] ?? raw).replace(/^@/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
	} catch {
		return raw.replace(/^@/, "").replace(/^tw:/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
	}
}
async function twitchUser(login) {
	const res = await fetch("https://gql.twitch.tv/gql", {
		method: "POST",
		headers: {
			"client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
			"content-type": "application/json"
		},
		body: JSON.stringify({
			query: `query($login:String!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:40,type:ARCHIVE){edges{node{id title lengthSeconds publishedAt previewThumbnailURL(width:640,height:360)}}}}}`,
			variables: { login }
		})
	});
	if (!res.ok) return null;
	return (await res.json()).data?.user ?? null;
}
function twitchVideos(login, user, vodLimit = 18) {
	const title = user.displayName ?? login;
	const folderId = `tw:${login}`;
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
			embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&autoplay=true`,
			watchUrl: `https://www.twitch.tv/${login}`
		}
	});
	for (const edge of (user.videos?.edges ?? []).slice(0, vodLimit)) {
		const node = edge.node;
		if (!node?.id) continue;
		out.push({
			id: `tw:v:${node.id}`,
			folderId,
			name: node.title || "Twitch video",
			path: `twitch/${login}/${node.id}`,
			extension: "vod",
			mime: "video/twitch",
			size: 0,
			duration: node.lengthSeconds,
			addedAt: Date.parse(node.publishedAt ?? "") || Date.now(),
			poster: node.previewThumbnailURL,
			remote: {
				kind: "twitch",
				videoId: node.id,
				channelName: title,
				live: false,
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
			embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&autoplay=true`,
			watchUrl: `https://www.twitch.tv/${login}`
		}
	});
	return out;
}
async function followTwitch(query, compact = false) {
	const login = twitchLogin(query);
	if (!login) throw new Error("Enter a Twitch channel.");
	const user = await twitchUser(login);
	if (!user?.id) throw new Error(`Twitch could not resolve ${login}`);
	const title = user.displayName ?? login;
	return {
		channel: {
			id: `tw:${login}`,
			kind: "twitch",
			handle: login,
			title,
			channelId: user?.id,
			thumb: user?.profileImageURL,
			live: Boolean(user?.stream)
		},
		videos: twitchVideos(login, user, compact ? 6 : 24)
	};
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
	await mapPool(data.channels, 4, async (ch) => {
		try {
			if (ch.kind === "twitch") {
				const next = await followTwitch(ch.handle);
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
				const next = await youtubeFromChannel(ch.channelId ? `https://www.youtube.com/channel/${ch.channelId}` : ch.handle);
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
		refreshedIds
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
	const rows = await mapPool(data.items, 4, async (item) => {
		try {
			if (item.kind === "twitch") return await followTwitch(item.query, compact);
			return await youtubeFromChannel(item.query, compact ? 4 : 18);
		} catch {
			return null;
		}
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
