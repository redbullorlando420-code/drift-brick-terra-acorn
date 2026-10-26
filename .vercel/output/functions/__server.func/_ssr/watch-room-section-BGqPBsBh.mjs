import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as Shuffle, F as Radio, Ft as ExternalLink, Gt as ChevronRight, H as Pause, I as QrCode, Kt as ChevronLeft, L as Plus, Lt as Download, P as RefreshCw, Q as MessageCircle, Qt as Bookmark, R as Play, Vt as ClipboardList, Y as MonitorPlay, a as Volume2, an as ArrowDown, bt as Heart, i as VolumeX, jt as Film, k as Search, l as Undo2, lt as ListChecks, n as X, nn as ArrowUp, r as Wifi, s as Users, st as ListVideo, tt as Maximize, v as Star, yt as History, zt as Copy } from "../_libs/lucide-react.mjs";
import { r as exactYoutubePublished } from "./youtube-metadata-BN08kKrN.mjs";
import { Yt as sortCatalogRows, ln as yieldCatalogTask, nt as forEachCatalogSlice } from "./live-rooms-CNGwnMZr.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { $ as Button, Dn as createShortLocalId, Dt as getRating, En as createLocalId, Ht as pinPlayUrl, M as registerPeriodicTask, Q as Input, Sn as useLibrary, Vt as measureInteraction, Xt as resolvePlayUrl, Zn as lookupVideo, cn as setRating, m as catalogTurn, st as createSsrRpc, tt as NATIVE_PLAYABLE } from "./library-app-BtCPS7Tj.mjs";
import { d as bytes, s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
import { i as twitchEmbedUrl, n as currentTwitchEmbedContext, t as AdultComments } from "./twitch-embed-6jI2FMd4.mjs";
import { n as roomYoutubeSearchInput } from "./room-youtube-search-CXNGjENO.mjs";
import { t as qrcode } from "../_libs/qrcode-generator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch-room-section-BGqPBsBh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PROVIDER_HOSTS = {
	youtube: /* @__PURE__ */ new Set([
		"youtube.com",
		"www.youtube.com",
		"m.youtube.com",
		"music.youtube.com",
		"youtube-nocookie.com",
		"www.youtube-nocookie.com",
		"youtu.be"
	]),
	twitch: /* @__PURE__ */ new Set([
		"twitch.tv",
		"www.twitch.tv",
		"m.twitch.tv",
		"player.twitch.tv",
		"clips.twitch.tv"
	])
};
function safeProviderUrl(value, kind) {
	if (typeof value !== "string" || value.length > 2048) return void 0;
	try {
		const url = new URL(value);
		return url.protocol === "https:" && PROVIDER_HOSTS[kind].has(url.hostname.toLowerCase()) ? url.toString() : void 0;
	} catch {
		return;
	}
}
function safePoster(value) {
	if (typeof value !== "string" || value.length > 2048) return void 0;
	try {
		const url = new URL(value);
		return url.protocol === "https:" && /(^|\.)(ytimg\.com|jtvnw\.net|ttvnw\.net)$/.test(url.hostname) ? url.toString() : void 0;
	} catch {
		return;
	}
}
/** Older cached cards may have only a public watch URL or provider ID.
* Rebuild provider routes so a room does not depend on another device's cache. */
function providerFields(kind, item) {
	const urls = [safeProviderUrl(item.embedUrl, kind), safeProviderUrl(item.watchUrl, kind)].filter((value) => Boolean(value)).map((value) => new URL(value));
	const identifier = typeof item.videoId === "string" && /^[a-zA-Z0-9_-]{1,160}$/.test(item.videoId) ? item.videoId : void 0;
	if (kind === "youtube") {
		const videoId = urls.map((url) => url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] || (url.hostname === "youtu.be" ? url.pathname.slice(1).split("/")[0] : void 0)).find((id) => id && /^[\w-]{1,160}$/.test(id)) ?? identifier;
		if (!videoId) return null;
		return {
			videoId,
			embedUrl: `https://www.youtube.com/embed/${videoId}`,
			watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
			live: Boolean(item.live) || urls.some((url) => /^\/live\//.test(url.pathname))
		};
	}
	const clip = urls.map((url) => url.searchParams.get("clip") || url.pathname.match(/\/clip\/([\w-]+)/)?.[1] || (url.hostname === "clips.twitch.tv" && url.pathname !== "/embed" ? url.pathname.slice(1) : void 0)).find((id) => id && /^[\w-]{1,160}$/.test(id));
	const vod = urls.map((url) => url.searchParams.get("video")?.replace(/^v/, "") || url.pathname.match(/^\/videos\/(\d+)/)?.[1]).find((id) => id && /^\d+$/.test(id)) ?? (identifier && /^v?\d+$/.test(identifier) ? identifier.replace(/^v/, "") : void 0);
	const channel = urls.map((url) => url.searchParams.get("channel") || (/^(?:www\.|m\.)?twitch\.tv$/.test(url.hostname) && !/^\/(?:videos|directory|clip)\b/.test(url.pathname) ? url.pathname.split("/")[1] : void 0)).find((id) => id && /^[\w]{1,25}$/.test(id)) ?? (item.live && typeof item.channelName === "string" && /^[\w]{1,25}$/.test(item.channelName) ? item.channelName : void 0);
	if (item.live && channel || !clip && !vod && channel) return {
		live: true,
		channelName: channel,
		embedUrl: `https://player.twitch.tv/?channel=${channel}`,
		watchUrl: `https://www.twitch.tv/${channel}`
	};
	if (clip || identifier && !vod && !item.live) {
		const videoId = clip ?? identifier;
		return {
			live: false,
			videoId,
			embedUrl: `https://clips.twitch.tv/embed?clip=${videoId}`,
			watchUrl: `https://clips.twitch.tv/${videoId}`
		};
	}
	return vod ? {
		live: false,
		videoId: vod,
		embedUrl: `https://player.twitch.tv/?video=v${vod}`,
		watchUrl: `https://www.twitch.tv/videos/${vod}`
	} : null;
}
function normalizeRoomVideo(video) {
	if (!video.remote || !["youtube", "twitch"].includes(video.remote.kind)) return video;
	const fields = providerFields(video.remote.kind, video.remote);
	return fields ? {
		...video,
		remote: {
			...video.remote,
			...fields
		}
	} : video;
}
/** Catalog IDs differ between devices; provider identity describes the actual title. */
function roomMediaKey(video) {
	if (!video.remote) return `local:${video.id}`;
	const kind = video.remote.kind;
	if (kind !== "youtube" && kind !== "twitch") return `entry:${video.id}`;
	const fields = providerFields(kind, video.remote);
	if (!fields) return `entry:${video.id}`;
	if (kind === "youtube") return `youtube:${fields.videoId}`;
	if (fields.live) return `twitch:live:${fields.channelName?.toLowerCase()}`;
	return `${fields.embedUrl.includes("clips.twitch.tv") ? "twitch:clip" : "twitch:vod"}:${fields.videoId}`;
}
function roomVideoFromUrl(value) {
	const input = value.trim();
	let publicUrl;
	try {
		const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
		if (!["http:", "https:"].includes(url.protocol)) return null;
		url.protocol = "https:";
		publicUrl = url.toString();
	} catch {
		return null;
	}
	for (const kind of ["youtube", "twitch"]) {
		const watchUrl = safeProviderUrl(publicUrl, kind);
		if (!watchUrl) continue;
		const fields = providerFields(kind, { watchUrl });
		if (!fields) continue;
		const key = "videoId" in fields ? fields.videoId : fields.channelName;
		return resolveRoomMedia({
			id: `room:${kind}:${key}`,
			name: `${kind === "youtube" ? "YouTube" : "Twitch"} · ${key}`,
			kind,
			...fields
		})?.video ?? null;
	}
	return null;
}
/** Bounded paste parsing never reads a catalog or fetches provider data. */
function parseRoomLinks(value) {
	const input = value.slice(0, 32768);
	const rows = input.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
	const videos = [];
	const seen = /* @__PURE__ */ new Set();
	let invalid = 0, duplicates = 0;
	for (const row of rows.slice(0, 48)) {
		const video = roomVideoFromUrl(row);
		if (!video) {
			invalid++;
			continue;
		}
		const key = roomMediaKey(video);
		if (seen.has(key)) {
			duplicates++;
			continue;
		}
		seen.add(key);
		videos.push(video);
	}
	return {
		videos,
		invalid,
		duplicates,
		truncated: rows.length > 48 || input.length < value.length
	};
}
/** Small, provider-only metadata lets a guest play a title without its own follows/catalog. */
function describeRoomMedia(video, local) {
	if (!video) return local ? {
		id: `local:${local.fingerprint}`,
		name: local.name.slice(0, 300),
		kind: "local",
		local
	} : null;
	if (video.id.startsWith("local:") && local?.fingerprint === video.id.slice(6)) return {
		id: video.id,
		name: local.name.slice(0, 300),
		kind: "local",
		local
	};
	const remote = video.remote;
	const kind = remote?.kind;
	if (!remote || kind !== "youtube" && kind !== "twitch") {
		if (!remote && local) return {
			id: `local:${local.fingerprint}`,
			name: local.name.slice(0, 300),
			kind: "local",
			local
		};
		return !remote ? {
			id: video.id,
			name: video.name.slice(0, 300),
			kind: "local",
			duration: video.duration,
			size: video.size
		} : null;
	}
	const fields = providerFields(kind, remote);
	if (!fields) return null;
	return {
		id: video.id.slice(0, 300),
		name: video.name.slice(0, 300),
		kind,
		videoId: typeof remote.videoId === "string" ? remote.videoId.slice(0, 160) : void 0,
		channelId: typeof remote.channelId === "string" ? remote.channelId.slice(0, 160) : void 0,
		channelName: typeof remote.channelName === "string" ? remote.channelName.slice(0, 200) : void 0,
		...fields,
		poster: safePoster(video.poster),
		publishedDate: exactYoutubePublished(remote.publishedDate),
		publishedLabel: typeof remote.publishedLabel === "string" ? remote.publishedLabel.slice(0, 90) : void 0,
		views: typeof remote.views === "number" && Number.isSafeInteger(remote.views) && remote.views >= 0 ? remote.views : void 0,
		description: typeof video.description === "string" ? video.description.slice(0, 280) : void 0,
		duration: typeof video.duration === "number" && Number.isFinite(video.duration) && video.duration > 0 ? video.duration : void 0
	};
}
/** Validate a peer-supplied descriptor before using it as an iframe source. */
function resolveRoomMedia(value) {
	if (!value || typeof value !== "object") return null;
	const item = value;
	if (typeof item.id !== "string" || !item.id || typeof item.name !== "string" || !item.name) return null;
	if (item.kind === "local") {
		const local = item.local;
		if (item.id.length > 600 || local && (typeof local.name !== "string" || typeof local.fingerprint !== "string" || !local.fingerprint || local.fingerprint.length > 500 || item.id !== `local:${local.fingerprint}` || !Number.isFinite(local.size) || !Number.isFinite(local.modified))) return null;
		const descriptor = {
			id: item.id,
			name: item.name.slice(0, 300),
			kind: "local",
			size: typeof item.size === "number" && Number.isSafeInteger(item.size) && item.size >= 0 ? item.size : void 0,
			streamId: typeof item.streamId === "string" && item.streamId.length <= 160 ? item.streamId : void 0,
			duration: typeof item.duration === "number" && Number.isFinite(item.duration) && item.duration > 0 ? item.duration : void 0,
			local: local ? {
				name: local.name.slice(0, 300),
				fingerprint: local.fingerprint,
				size: Math.max(0, local.size),
				modified: Math.max(0, local.modified)
			} : void 0
		};
		return {
			descriptor,
			video: {
				id: descriptor.id,
				name: descriptor.name,
				folderId: "room:local",
				path: "",
				mime: "video/mp4",
				extension: "mp4",
				size: local?.size ?? descriptor.size ?? 0,
				duration: descriptor.duration,
				addedAt: 0
			}
		};
	}
	if (item.kind !== "youtube" && item.kind !== "twitch") return null;
	const kind = item.kind;
	if (item.embedUrl && !safeProviderUrl(item.embedUrl, kind) || item.watchUrl && !safeProviderUrl(item.watchUrl, kind)) return null;
	const fields = providerFields(kind, item);
	if (!fields) return null;
	const descriptor = {
		id: item.id.slice(0, 300),
		name: item.name.slice(0, 300),
		kind,
		videoId: typeof item.videoId === "string" ? item.videoId.slice(0, 160) : void 0,
		channelId: typeof item.channelId === "string" ? item.channelId.slice(0, 160) : void 0,
		channelName: typeof item.channelName === "string" ? item.channelName.slice(0, 200) : void 0,
		...fields,
		poster: safePoster(item.poster),
		publishedDate: exactYoutubePublished(item.publishedDate),
		publishedLabel: typeof item.publishedLabel === "string" ? item.publishedLabel.slice(0, 90) : void 0,
		views: typeof item.views === "number" && Number.isSafeInteger(item.views) && item.views >= 0 ? item.views : void 0,
		description: typeof item.description === "string" ? item.description.slice(0, 280) : void 0,
		duration: typeof item.duration === "number" && Number.isFinite(item.duration) && item.duration > 0 ? item.duration : void 0
	};
	const remote = {
		kind,
		videoId: descriptor.videoId,
		channelId: descriptor.channelId,
		channelName: descriptor.channelName,
		live: descriptor.live,
		embedUrl: descriptor.embedUrl,
		watchUrl: descriptor.watchUrl,
		publishedDate: descriptor.publishedDate,
		publishedSource: descriptor.publishedDate ? "provider" : "unknown",
		publishedLabel: descriptor.publishedLabel,
		views: descriptor.views
	};
	return {
		descriptor,
		video: {
			id: descriptor.id,
			folderId: `room:${kind}`,
			path: descriptor.id,
			name: descriptor.name,
			extension: kind === "youtube" ? "yt" : "twitch",
			mime: `video/${kind}`,
			size: 0,
			duration: descriptor.duration,
			addedAt: descriptor.publishedDate ? Date.parse(descriptor.publishedDate) : 0,
			poster: descriptor.poster,
			description: descriptor.description,
			remote
		}
	};
}
/** A device's catalog ID is not proof of media identity. Resolve public titles
* by provider key, and only accept local requests matching host metadata. */
function resolveRoomRequest(id, value, lookup, activeIds) {
	const resolved = resolveRoomMedia(value);
	if (!resolved?.video || resolved.descriptor.id !== id) return void 0;
	const known = lookup(id);
	if (!resolved.video.remote) {
		if (!known || known.remote || known.name.slice(0, 300) !== resolved.video.name || known.size !== resolved.video.size) return void 0;
		return known;
	}
	const key = roomMediaKey(resolved.video);
	if (known?.remote && roomMediaKey(known) === key) return known;
	for (const activeId of activeIds.slice(0, 49)) {
		const active = lookup(activeId);
		if (active?.remote && roomMediaKey(active) === key) return active;
	}
	if (!known) return resolved.video;
	const canonicalId = `room:${key}`;
	const canonical = lookup(canonicalId);
	if (canonical) return canonical.remote && roomMediaKey(canonical) === key ? canonical : void 0;
	return {
		...resolved.video,
		id: canonicalId,
		path: canonicalId
	};
}
/** Room metadata is session-only and bounded to the current title plus its queue. */
function mergeRoomMedia(current, values, ids) {
	const next = { ...current };
	for (const value of values.slice(0, 49)) {
		const resolved = resolveRoomMedia(value);
		if (resolved?.video && JSON.stringify(current[resolved.descriptor.id]) !== JSON.stringify(resolved.video)) next[resolved.descriptor.id] = resolved.video;
	}
	const bounded = Object.fromEntries([...new Set(ids)].slice(0, 49).flatMap((id) => next[id] ? [[id, next[id]]] : []));
	return Object.keys(current).length === Object.keys(bounded).length && Object.entries(bounded).every(([id, video]) => current[id] === video) ? current : bounded;
}
/** A batch is an intention against the latest host order, never a replacement
* snapshot. Missing selections cannot resurrect titles consumed meanwhile. */
function parseRoomQueueEdit(value) {
	if (!value || typeof value !== "object") return null;
	const edit = value;
	if (![
		"remove",
		"next",
		"end"
	].includes(edit.kind ?? "") || !Array.isArray(edit.ids) || !edit.ids.length || edit.ids.length > 48) return null;
	if (edit.ids.some((id) => typeof id !== "string" || !id.trim() || id.length > 600)) return null;
	return {
		kind: edit.kind,
		ids: normalizeRoomQueue(edit.ids)
	};
}
function applyRoomQueueEdit(current, edit) {
	const rows = normalizeRoomQueue(current), selected = new Set(edit.ids.slice(0, 48));
	const kept = rows.filter((id) => !selected.has(id));
	const moved = rows.filter((id) => selected.has(id));
	return edit.kind === "remove" ? kept : edit.kind === "next" ? [...moved, ...kept] : [...kept, ...moved];
}
function normalizeRoomQueue(value) {
	if (!Array.isArray(value)) return [];
	return [...new Set(value.filter((id) => typeof id === "string" && id.trim().length > 0 && id.length <= 600).map((id) => id.trim()))].slice(0, 48);
}
function distinctRoomQueue(ids, mediaKey, currentKey) {
	const seen = new Set(currentKey ? [currentKey] : []);
	return normalizeRoomQueue(ids).filter((id) => {
		const key = mediaKey(id);
		if (!key || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function parseRoomQueueAction(value) {
	if (!value || typeof value !== "object") return null;
	const item = value;
	if (![
		"add",
		"remove",
		"move",
		"next",
		"up",
		"down"
	].includes(item.kind ?? "") || typeof item.id !== "string" || !item.id.trim() || item.id.length > 600) return null;
	if (item.before !== void 0 && (typeof item.before !== "string" || item.before.length > 600)) return null;
	return {
		kind: item.kind,
		id: item.id.trim(),
		before: item.before?.trim() || void 0
	};
}
/** Apply a single intention to the latest host order. Concurrent guest edits
* cannot overwrite unrelated additions with an older whole-queue snapshot. */
function applyRoomQueueAction(current, action) {
	const rows = normalizeRoomQueue(current);
	if (action.kind === "remove") return rows.filter((id) => id !== action.id);
	if (action.kind === "up" || action.kind === "down") {
		const index = rows.indexOf(action.id);
		const destination = index + (action.kind === "up" ? -1 : 1);
		if (index < 0 || destination < 0 || destination >= rows.length) return rows;
		[rows[index], rows[destination]] = [rows[destination], rows[index]];
		return rows;
	}
	if (action.kind === "next") {
		if (!rows.includes(action.id) && rows.length >= 48) return rows;
		return [action.id, ...rows.filter((id) => id !== action.id)];
	}
	if (action.kind === "move" && !rows.includes(action.id)) return rows;
	if (action.kind === "add" && rows.includes(action.id)) return rows;
	if (action.kind === "add" && rows.length >= 48) return rows;
	if (action.before === action.id) return rows;
	const next = rows.filter((id) => id !== action.id);
	const position = action.before ? next.indexOf(action.before) : -1;
	next.splice(position < 0 ? next.length : position, 0, action.id);
	return next;
}
/** Shuffle the host's current bounded order, preserving every title once. */
function shuffleRoomQueue(current, random = Math.random) {
	const rows = normalizeRoomQueue(current);
	const original = [...rows];
	for (let i = rows.length - 1; i > 0; i--) {
		const draw = random();
		const j = Math.floor(Math.max(0, Math.min(.999999999999, Number.isFinite(draw) ? draw : 0)) * (i + 1));
		[rows[i], rows[j]] = [rows[j], rows[i]];
	}
	if (rows.length > 1 && rows.every((id, i) => id === original[i])) rows.push(rows.shift());
	return rows;
}
var ROOM_QUEUE_DRAFT_KEY = "reelcase.watch-room.queue.v1";
/** Session-only history reuses public descriptor validation. Never retain
* local media names, handles or stream details as room history. */
function roomRecentMedia(values) {
	return roomQueueDraft(values).media.slice(0, 12);
}
/** Recovery contains public provider links only, never local names, paths,
* fingerprints, file bytes, peer identities or transient stream addresses. */
function roomQueueDraft(values, savedAt = Date.now()) {
	const media = [], seen = /* @__PURE__ */ new Set();
	for (const value of values.slice(0, 48)) {
		const resolved = resolveRoomMedia(value);
		if (!resolved?.video?.remote) continue;
		const key = roomMediaKey(resolved.video);
		if (seen.has(key)) continue;
		seen.add(key);
		const { poster: _poster, ...entry } = describeRoomMedia(resolved.video);
		media.push(entry);
	}
	return {
		version: 1,
		savedAt,
		media
	};
}
function readRoomQueueDraft(value) {
	if (!value || value.length > 128e3) return;
	try {
		const data = JSON.parse(value);
		if (data?.version !== 1 || !Array.isArray(data.media) || typeof data.savedAt !== "number" || !Number.isFinite(data.savedAt) || data.savedAt <= 0) return;
		const draft = roomQueueDraft(data.media, data.savedAt);
		return draft.media.length ? draft : void 0;
	} catch {
		return;
	}
}
/** One canonical link per line can be pasted straight back into Add links.
* Local filenames, room codes and provider tracking parameters stay private. */
function roomQueueLinks(values) {
	return roomQueueDraft(values).media.map((media) => media.watchUrl).filter((url) => Boolean(url)).join("\n");
}
/** Selection revision prevents a late old-title event from undoing a newer
* choice even when both packets have the same millisecond timestamp. */
function acceptsRoomSelection(currentRevision, value, currentId, incomingId) {
	const revision = value === void 0 ? 0 : value;
	if (typeof revision !== "number" || !Number.isSafeInteger(revision) || revision < currentRevision) return false;
	return !(revision > 0 && revision === currentRevision && currentId && typeof incomingId === "string" && incomingId !== currentId);
}
function nextPlayableRoomTitle(ids, playable) {
	for (const [index, id] of ids.slice(0, 48).entries()) if (playable(id)) return {
		id,
		skipped: index
	};
	return {
		id: void 0,
		skipped: Math.min(ids.length, 48)
	};
}
var MAX_IMPORT_UPCOMING = 192;
var MAX_IMPORT_PLAYED = 80;
var title = (value) => typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 300) : "";
var runtime = (value) => typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 31536e3 ? value : void 0;
/** Rebuild all routes from public provider identity. No catalog IDs, peer data,
* invitations, paths, descriptions, thumbnails or stream credentials survive. */
function publicSessionItem(raw) {
	const video = resolveRoomMedia(raw)?.video;
	if (!video?.remote || !["youtube", "twitch"].includes(video.remote.kind)) return;
	const media = describeRoomMedia(video);
	if (media.kind === "youtube" && !/^[\w-]{11}$/.test(media.videoId ?? "")) return;
	if (!media.watchUrl) return;
	return {
		provider: media.kind,
		url: media.kind === "twitch" && media.live ? "https://www.twitch.tv/" + roomMediaKey(video).slice(12) : media.watchUrl,
		title: title(media.name) || media.watchUrl,
		...media.live ? { live: true } : runtime(media.duration) ? { duration: runtime(media.duration) } : {}
	};
}
function sessionItemMedia(item) {
	const video = roomVideoFromUrl(item.url);
	if (!video?.remote || video.remote.kind !== item.provider) return;
	if (item.provider === "youtube" && !/^[\w-]{11}$/.test(video.remote.videoId ?? "")) return;
	video.name = title(item.title) || item.url;
	video.duration = item.live ? void 0 : runtime(item.duration);
	if (item.live) video.remote = {
		...video.remote,
		live: true
	};
	const media = describeRoomMedia(video);
	return media ? {
		...media,
		id: "room:" + roomMediaKey(video)
	} : void 0;
}
function buildRoomSessionFile(input) {
	let omitted = 0;
	const clean = (values, limit) => {
		const rows = [], seen = /* @__PURE__ */ new Set();
		for (const raw of values.slice(0, limit)) {
			const item = publicSessionItem(raw);
			if (!item) {
				omitted++;
				continue;
			}
			if (seen.has(item.url)) continue;
			seen.add(item.url);
			rows.push(item);
		}
		return rows;
	};
	const current = input.current ? publicSessionItem(input.current) ?? null : null;
	if (input.current && !current) omitted++;
	return {
		file: {
			format: "realhub-watch-session",
			version: 1,
			played: clean(input.played, 12).filter((item) => item.url !== current?.url),
			current,
			upcoming: clean(input.upcoming, 48).filter((item) => item.url !== current?.url)
		},
		omitted
	};
}
function writeRoomSessionFile(file) {
	const clean = readRoomSessionFile(JSON.stringify(file)), raw = JSON.stringify(clean.file, null, 2);
	if (new TextEncoder().encode(raw).byteLength > 256e3) throw Error("This session file is too large (maximum 256 KB).");
	return raw;
}
function readRoomSessionFile(raw) {
	if (raw.length > 256e3 || new TextEncoder().encode(raw).byteLength > 256e3) throw Error("This session file is too large (maximum 256 KB).");
	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		throw Error("This is not readable JSON. Choose a Realhub session file.");
	}
	if (!data || data.format !== "realhub-watch-session" || data.version !== 1) throw Error("Unsupported session format or version. Choose a version 1 Realhub session file.");
	if (!Array.isArray(data.played) || !Array.isArray(data.upcoming) || data.played.length > MAX_IMPORT_PLAYED || data.upcoming.length > MAX_IMPORT_UPCOMING || !(data.current === null || data.current && typeof data.current === "object" && !Array.isArray(data.current))) throw Error("The session structure or item count is invalid. The room was not changed.");
	let invalid = 0, unsupported = 0;
	const clean = (raw) => {
		if (!raw || typeof raw !== "object") {
			invalid++;
			return;
		}
		const r = raw;
		if (!["youtube", "twitch"].includes(r.provider)) {
			unsupported++;
			return;
		}
		if (typeof r.url !== "string" || r.url.length > 2048 || !r.url.startsWith("https://") || !title(r.title)) {
			invalid++;
			return;
		}
		const media = sessionItemMedia({
			provider: r.provider,
			url: r.url,
			title: title(r.title),
			...r.live === true ? { live: true } : runtime(r.duration) ? { duration: runtime(r.duration) } : {}
		});
		const item = media && publicSessionItem(media);
		if (!item) {
			invalid++;
			return;
		}
		return item;
	};
	const played = data.played.flatMap((r) => {
		const item = clean(r);
		return item ? [item] : [];
	}), upcoming = data.upcoming.flatMap((r) => {
		const item = clean(r);
		return item ? [item] : [];
	});
	return {
		file: {
			format: "realhub-watch-session",
			version: 1,
			played,
			current: data.current === null ? null : clean(data.current) ?? null,
			upcoming
		},
		invalid,
		unsupported
	};
}
/** A preview is recomputed against the current stage and queue; only upcoming
* items can be appended. Played/current entries are context, never playback. */
function previewRoomSessionImport(file, current, queue, unavailable = /* @__PURE__ */ new Set()) {
	const seen = /* @__PURE__ */ new Set();
	for (const raw of [current, ...queue]) {
		const item = publicSessionItem(raw);
		if (item) seen.add(item.url);
	}
	const slots = Math.max(0, 48 - queue.length), result = {
		media: [],
		duplicates: 0,
		unavailable: 0,
		full: 0,
		slots,
		upcoming: file.upcoming.length
	};
	for (const item of file.upcoming.slice(0, MAX_IMPORT_UPCOMING)) {
		if (seen.has(item.url)) {
			result.duplicates++;
			continue;
		}
		seen.add(item.url);
		const media = sessionItemMedia(item);
		const video = media && resolveRoomMedia(media)?.video;
		if (!media || !video || unavailable.has(roomMediaKey(video))) {
			result.unavailable++;
			continue;
		}
		if (result.media.length >= slots) {
			result.full++;
			continue;
		}
		result.media.push(media);
	}
	return result;
}
/**
* Full-mesh WebRTC rooms: one RTCPeerConnection per remote peer, signaled
* through /api/rtc (see signaling.server.ts), game data flowing directly
* browser-to-browser afterwards. Client-authoritative by construction — see
* the multiplayer-p2p skill for when NOT to use this.
*
* Negotiation follows the "perfect negotiation" pattern: on a glare (both
* sides offering at once) the polite peer — the lexicographically smaller id —
* rolls back and accepts, so pairs converge without wedging.
*/
var FAST_POLL_MS = 400;
var IDLE_POLL_MS = 2e3;
var PING_INTERVAL_MS = 2e3;
var STALL_MS = 1e4;
var MAX_RECOVERY_ATTEMPTS = 3;
var SIGNAL_RETRY_DELAYS_MS = [250, 750];
function defaultIceServers() {
	return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
}
var P2PRoom = class {
	opts;
	peers = /* @__PURE__ */ new Map();
	/** Per-remote-peer signal delivery chains (order-preserving). */
	signalQueues = /* @__PURE__ */ new Map();
	cursor = 0;
	pollTimer = null;
	stopPing = null;
	closed = false;
	mediaStream = null;
	everPolled = false;
	lastPeersFingerprint = "";
	lastRosterCount = -1;
	/** Same-origin tabs get a zero-config reliable fallback while WebRTC negotiates. */
	localRelay = null;
	onPageHide = () => {
		if (this.closed) return;
		const body = JSON.stringify({
			op: "leave",
			room: this.opts.room,
			peer: this.opts.selfId
		});
		navigator.sendBeacon?.("/api/rtc", new Blob([body], { type: "application/json" }));
	};
	debug(event) {
		this.opts.onDebug?.(`${(/* @__PURE__ */ new Date()).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		})} · ${event}`);
	}
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		window.addEventListener("pagehide", this.onPageHide);
		if (typeof BroadcastChannel !== "undefined" && this.opts.iceTransportPolicy !== "relay") {
			this.localRelay = new BroadcastChannel(`reelcase-watch:${this.opts.room}`);
			this.localRelay.onmessage = (event) => {
				const message = event.data;
				if (!message || message.from === this.opts.selfId || message.to && message.to !== this.opts.selfId) return;
				this.debug("Local tab relay delivered a room message");
				this.opts.onMessage?.(message.from ?? "local-guest", message.data, "reliable");
			};
			this.debug("Local tab relay ready");
		}
		try {
			await this.pollOnce();
			this.debug("Signaling registered");
		} catch {
			this.debug("Signaling retry scheduled");
		}
		if (this.closed) return;
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
		this.stopPing = registerPeriodicTask({
			name: "Room transport health",
			mode: "always",
			background: false,
			everyMs: PING_INTERVAL_MS,
			work: () => {
				this.pingAll();
				this.watchdog();
			}
		}).cancel;
	}
	close() {
		this.closed = true;
		window.removeEventListener("pagehide", this.onPageHide);
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.stopPing?.();
		this.stopPing = null;
		this.localRelay?.close();
		this.localRelay = null;
		for (const slot of this.peers.values()) slot.pc.close();
		this.peers.clear();
		this.mediaStream = null;
		fetch("/api/rtc", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				op: "leave",
				room: this.opts.room,
				peer: this.opts.selfId
			}),
			keepalive: true
		}).catch(() => {});
	}
	/** Send on the unreliable game-state channel (drops stale packets). */
	broadcast(data) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		for (const slot of this.peers.values()) if (slot.state?.readyState === "open") slot.state.send(wire);
	}
	/** Update presence on the existing poll without reconnecting the room. */
	setName(name) {
		this.opts.name = name.trim().slice(0, 64);
	}
	/** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
	send(data, peerId) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
		let delivered = false;
		for (const slot of targets) {
			if (slot?.reliable?.readyState === "open") delivered = true;
			if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
		}
		if (!delivered) this.localRelay?.postMessage({
			from: this.opts.selfId,
			to: peerId,
			data
		});
	}
	peerList() {
		return [...this.peers.values()].map((s) => ({ ...s.info }));
	}
	/** Replace the local-player stream for existing and subsequently joined peers. */
	setMediaStream(stream) {
		if (this.closed) return;
		this.mediaStream = stream;
		for (const slot of this.peers.values()) this.attachMedia(slot);
	}
	attachMedia(slot) {
		const tracks = this.mediaStream?.getTracks().filter((track) => track.readyState === "live") ?? [];
		for (const sender of slot.pc.getSenders()) if (sender.track && !tracks.includes(sender.track)) slot.pc.removeTrack(sender);
		for (const track of tracks) {
			if (slot.pc.getSenders().some((sender) => sender.track === track)) continue;
			const sender = slot.pc.addTrack(track, this.mediaStream);
			if (track.kind === "video") {
				const parameters = sender.getParameters();
				parameters.encodings = parameters.encodings?.length ? parameters.encodings : [{}];
				parameters.encodings[0].maxBitrate = 25e5;
				sender.setParameters(parameters).catch(() => {});
			}
		}
	}
	schedulePoll(delay) {
		if (this.closed) return;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = setTimeout(() => void this.poll(), delay);
	}
	anyPairConnecting() {
		for (const s of this.peers.values()) {
			if (s.terminal) continue;
			if (s.info.connectionState !== "connected") return true;
		}
		return false;
	}
	async pollOnce() {
		const params = new URLSearchParams({
			room: this.opts.room,
			peer: this.opts.selfId,
			name: this.opts.name ?? "",
			since: String(this.cursor)
		});
		const res = await fetch(`/api/rtc?${params}`);
		if (this.closed) return;
		if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
		const body = await res.json();
		if (this.closed) return;
		if (!this.everPolled) {
			this.everPolled = true;
			this.opts.onConnected?.();
		}
		this.reconcileRoster(body.peers);
		const otherPeers = Math.max(0, body.peers.length - 1);
		if (otherPeers !== this.lastRosterCount) {
			this.lastRosterCount = otherPeers;
			this.debug(`Roster visible: ${otherPeers} other peer${otherPeers === 1 ? "" : "s"}`);
		}
		const roster = new Set(body.peers.map((p) => p.id));
		for (const sig of body.signals) {
			this.cursor = Math.max(this.cursor, sig.id);
			await this.onSignal(sig.from, sig.kind, sig.payload, roster);
			if (this.closed) return;
		}
	}
	async poll() {
		if (this.closed) return;
		try {
			await this.pollOnce();
		} catch {}
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
	}
	reconcileRoster(peers) {
		const alive = new Set(peers.map((p) => p.id));
		for (const p of peers) {
			if (p.id === this.opts.selfId) continue;
			const existing = this.peers.get(p.id);
			if (existing) existing.info.name = p.name;
			else this.connectTo(p.id, p.name, this.opts.selfId > p.id);
		}
		for (const [id, slot] of this.peers) if (!alive.has(id)) {
			slot.pc.close();
			this.peers.delete(id);
		}
		this.emitPeers();
	}
	connectTo(peerId, name, initiator) {
		if (this.closed) return null;
		const pc = new RTCPeerConnection({
			iceTransportPolicy: this.opts.iceTransportPolicy ?? "all",
			iceServers: this.opts.iceServers ?? defaultIceServers()
		});
		const slot = {
			pc,
			makingOffer: false,
			ignoreOffer: false,
			pendingCandidates: [],
			lastProgressAt: Date.now(),
			recoveryAttempts: 0,
			info: {
				id: peerId,
				name,
				connectionState: pc.connectionState,
				candidateType: null,
				rttMs: null
			}
		};
		this.peers.set(peerId, slot);
		pc.onicecandidate = (e) => {
			if (e.candidate) this.sendSignal(peerId, "ice", e.candidate.toJSON());
		};
		pc.onconnectionstatechange = () => {
			slot.info.connectionState = pc.connectionState;
			if (pc.connectionState === "connecting" || pc.connectionState === "connected") slot.lastProgressAt = Date.now();
			if (pc.connectionState === "connected") {
				slot.recoveryAttempts = 0;
				slot.terminal = false;
				this.readCandidateType(slot);
			}
			this.emitPeers();
			if (pc.connectionState === "failed") pc.restartIce();
			if (pc.connectionState === "failed" || pc.connectionState === "disconnected") this.schedulePoll(FAST_POLL_MS);
		};
		pc.onnegotiationneeded = async () => {
			try {
				slot.makingOffer = true;
				await pc.setLocalDescription();
				await this.sendSignal(peerId, "offer", pc.localDescription.toJSON());
			} catch {} finally {
				slot.makingOffer = false;
			}
		};
		pc.ondatachannel = (e) => this.attachChannel(slot, e.channel);
		pc.ontrack = (event) => {
			const stream = event.streams[0];
			if (stream) this.opts.onMediaStream?.(peerId, stream);
		};
		this.attachMedia(slot);
		if (initiator) {
			this.debug(`Negotiating peer channel with ${name || "guest"}`);
			this.attachChannel(slot, pc.createDataChannel("state", {
				ordered: false,
				maxRetransmits: 0
			}));
			this.attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
		}
		return slot;
	}
	attachChannel(slot, channel) {
		if (channel.label === "state") slot.state = channel;
		else slot.reliable = channel;
		channel.onopen = () => {
			slot.lastProgressAt = Date.now();
			this.debug(`Peer ${channel.label} channel open with ${slot.info.name || "guest"}`);
			if (channel.label === "reliable") this.opts.onPeerReady?.(slot.info.id);
		};
		channel.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.t === "ping") {
				if (slot.state?.readyState === "open") slot.state.send(JSON.stringify({ t: "pong" }));
			} else if (msg.t === "pong") {
				if (slot.pingSentAt) {
					slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
					slot.pingSentAt = void 0;
					this.emitPeers();
				}
			} else this.opts.onMessage?.(slot.info.id, msg.d, channel.label === "state" ? "state" : "reliable");
		};
	}
	/** Apply buffered ICE candidates once a remote description is in place. */
	async flushPendingCandidates(slot) {
		while (slot.pendingCandidates.length > 0) {
			const candidate = slot.pendingCandidates.shift();
			try {
				await slot.pc.addIceCandidate(candidate);
			} catch (err) {
				if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
			}
			if (this.closed) return;
		}
	}
	async onSignal(from, kind, payload, roster) {
		if (this.closed) return;
		let slot = this.peers.get(from);
		if (!slot) {
			if (!roster.has(from)) return;
			const created = this.connectTo(from, "", false);
			if (!created) return;
			slot = created;
		}
		const polite = this.opts.selfId < from;
		try {
			if (kind === "offer" || kind === "answer") {
				const description = payload;
				const collision = kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
				slot.ignoreOffer = !polite && collision;
				if (slot.ignoreOffer) return;
				try {
					await slot.pc.setRemoteDescription(description);
				} catch (err) {
					if (kind !== "offer" || slot.recreatedForOffer) throw err;
					const attempts = slot.recoveryAttempts;
					const name = slot.info.name;
					slot.pc.close();
					this.peers.delete(from);
					const fresh = this.connectTo(from, name, false);
					if (!fresh) return;
					fresh.recoveryAttempts = attempts;
					fresh.recreatedForOffer = true;
					slot = fresh;
					await slot.pc.setRemoteDescription(description);
				}
				if (this.closed) return;
				await this.flushPendingCandidates(slot);
				if (this.closed) return;
				if (kind === "offer") {
					await slot.pc.setLocalDescription();
					if (this.closed) return;
					await this.sendSignal(from, "answer", slot.pc.localDescription.toJSON());
				}
			} else if (kind === "ice") {
				const candidate = payload;
				if (!slot.pc.remoteDescription) {
					slot.pendingCandidates.push(candidate);
					return;
				}
				try {
					await slot.pc.addIceCandidate(candidate);
				} catch (err) {
					if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
				}
			}
		} catch {}
	}
	/**
	* Signals are serialized per remote peer (a candidate must never overtake
	* its SDP into the DB) and retried on failure with short backoff.
	*/
	sendSignal(to, kind, payload) {
		const next = (this.signalQueues.get(to) ?? Promise.resolve()).then(() => this.postSignal(to, kind, payload));
		this.signalQueues.set(to, next.catch(() => {}));
		return next;
	}
	async postSignal(to, kind, payload) {
		for (let attempt = 0;; attempt++) {
			if (this.closed) return;
			try {
				const res = await fetch("/api/rtc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						op: "signal",
						room: this.opts.room,
						from: this.opts.selfId,
						to,
						kind,
						payload
					})
				});
				if (res.ok) return;
				throw new Error(`signal POST failed: ${res.status}`);
			} catch (err) {
				if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
					console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
					this.debug(`Could not deliver ${kind} signal`);
					return;
				}
				await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
			}
		}
	}
	pingAll() {
		const wire = JSON.stringify({ t: "ping" });
		for (const slot of this.peers.values()) {
			if (slot.state?.readyState !== "open") continue;
			const stale = slot.pingSentAt !== void 0 && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
			if (slot.pingSentAt === void 0 || stale) {
				slot.pingSentAt = performance.now();
				slot.state.send(wire);
			}
			if (!slot.info.candidateType && slot.pc.connectionState === "connected") this.readCandidateType(slot);
		}
	}
	/**
	* Stuck-pair recovery, piggybacked on the ping interval. A pair that has
	* made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
	* RTCPeerConnection (new DTLS identity — fixes the suspend/resume
	* fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
	* visible to the app as its last connectionState, ignored by fast-poll.
	*/
	watchdog() {
		if (this.closed) return;
		const now = Date.now();
		for (const [peerId, slot] of this.peers) {
			const live = slot.pc.connectionState;
			if (live !== slot.info.connectionState) {
				slot.info.connectionState = live;
				if (live === "connecting" || live === "connected") slot.lastProgressAt = now;
				this.emitPeers();
			}
			if (slot.terminal || live === "connected") continue;
			if (now - slot.lastProgressAt <= STALL_MS) continue;
			if (slot.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
				slot.terminal = true;
				this.emitPeers();
				continue;
			}
			slot.recoveryAttempts += 1;
			slot.lastProgressAt = now;
			if (this.opts.selfId > peerId) {
				const { name } = slot.info;
				const attempts = slot.recoveryAttempts;
				slot.pc.close();
				this.peers.delete(peerId);
				const fresh = this.connectTo(peerId, name, true);
				if (fresh) fresh.recoveryAttempts = attempts;
				this.schedulePoll(FAST_POLL_MS);
			}
		}
	}
	async readCandidateType(slot) {
		try {
			const stats = await slot.pc.getStats();
			let selected;
			let selectedPairId;
			stats.forEach((s) => {
				if (s.type === "transport") selectedPairId = s.selectedCandidatePairId;
			});
			if (selectedPairId) selected = stats.get(selectedPairId);
			if (!selected) stats.forEach((s) => {
				if (s.type === "candidate-pair" && s.nominated && s.state === "succeeded") selected = s;
			});
			const localId = selected?.localCandidateId;
			if (localId && this.peers.get(slot.info.id) === slot) {
				const local = stats.get(localId);
				slot.info.candidateType = local?.candidateType ?? null;
				this.emitPeers();
			}
		} catch {}
	}
	emitPeers() {
		const list = this.peerList();
		const fingerprint = JSON.stringify(list.map((p) => [
			p.id,
			p.name,
			p.connectionState,
			p.candidateType,
			p.rttMs
		]));
		if (fingerprint === this.lastPeersFingerprint) return;
		this.lastPeersFingerprint = fingerprint;
		this.opts.onPeersChanged?.(list);
	}
};
function useP2PRoom(room, name, relay) {
	const [selfId] = (0, import_react.useState)(() => createShortLocalId("p-"));
	const [peers, setPeers] = (0, import_react.useState)([]);
	const [joined, setJoined] = (0, import_react.useState)(false);
	const [events, setEvents] = (0, import_react.useState)([]);
	const [mediaStreams, setMediaStreams] = (0, import_react.useState)({});
	const [readyRevision, setReadyRevision] = (0, import_react.useState)(0);
	const outboundMedia = (0, import_react.useRef)(null);
	const ref = (0, import_react.useRef)(null);
	const nameRef = (0, import_react.useRef)(name);
	nameRef.current = name;
	const listeners = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		setMediaStreams({});
		if (!room.trim()) {
			setJoined(false);
			setPeers([]);
			setEvents([]);
			ref.current = null;
			return;
		}
		setEvents(["Preparing room connection…"]);
		setJoined(false);
		setPeers([]);
		const p2p = new P2PRoom({
			room,
			selfId,
			name: nameRef.current.slice(0, 64),
			iceServers: relay ? [...defaultIceServers(), ...relay.iceServers] : void 0,
			iceTransportPolicy: relay?.iceTransportPolicy,
			onPeersChanged: (next) => {
				setPeers(next);
				setMediaStreams((current) => Object.fromEntries(Object.entries(current).filter(([id]) => next.some((peer) => peer.id === id))));
			},
			onMediaStream: (from, stream) => setMediaStreams((current) => ({
				...current,
				[from]: stream
			})),
			onPeerReady: () => setReadyRevision((value) => value + 1),
			onConnected: () => setJoined(true),
			onDebug: (event) => setEvents((items) => [event, ...items].slice(0, 16)),
			onMessage: (from, data, channel) => listeners.current.forEach((fn) => fn(from, data, channel))
		});
		p2p.setMediaStream(outboundMedia.current);
		ref.current = p2p;
		p2p.join();
		return () => {
			ref.current = null;
			p2p.close();
		};
	}, [
		room,
		selfId,
		relay
	]);
	(0, import_react.useEffect)(() => {
		ref.current?.setName(name);
	}, [name]);
	const send = (0, import_react.useCallback)((data, peer) => ref.current?.send(data, peer), []);
	const setMediaStream = (0, import_react.useCallback)((stream) => {
		outboundMedia.current = stream;
		ref.current?.setMediaStream(stream);
	}, []);
	return {
		selfId,
		peers,
		joined,
		events,
		send,
		onMessage: (0, import_react.useCallback)((fn) => {
			listeners.current.add(fn);
			return () => {
				listeners.current.delete(fn);
			};
		}, []),
		mediaStreams,
		setMediaStream,
		readyRevision
	};
}
/** The provider epoch already includes the starting position; do not add it again. */
function estimatedProviderPosition(lastPosition, playbackPosition, startedAt, now) {
	const elapsedPosition = startedAt === null ? 0 : Math.max(0, (now - startedAt) / 1e3);
	return Math.max(0, lastPosition, playbackPosition, elapsedPosition);
}
/** Keep a seek inside a known VOD; unknown and live streams retain a safety cap. */
function clampRoomPosition(seconds, duration) {
	return Math.max(0, Math.min(typeof duration === "number" && Number.isFinite(duration) && duration > 0 ? Math.min(duration, 43200) : 43200, Number.isFinite(seconds) ? seconds : 0));
}
/** Guest adjustments are device-local seconds, bounded and snapped to 250 ms. */
function normalizeGuestOffset(seconds) {
	return Math.round(Math.max(-30, Math.min(30, Number.isFinite(seconds) ? seconds : 0)) * 4) / 4;
}
function guestPlaybackPosition(hostPosition, offset, duration) {
	return clampRoomPosition(hostPosition + normalizeGuestOffset(offset), duration);
}
/** Provider controls report the adjusted device clock; room requests must not. */
function hostPlaybackPosition(devicePosition, offset, duration) {
	return clampRoomPosition(devicePosition - normalizeGuestOffset(offset), duration);
}
/** A loopback URL opens only on the device that created it. */
function shareableRoomInvite(origin, pathname, room) {
	try {
		const url = new URL(pathname, origin);
		if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || /^(?:localhost|.*\.localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[?::1\]?)$/i.test(url.hostname) || !/^RC[A-Z0-9]{4,12}$/.test(room)) return null;
		url.search = "";
		url.hash = "";
		url.searchParams.set("room", room);
		url.searchParams.set("theater", "1");
		return url.toString();
	} catch {
		return null;
	}
}
var secureOrigin = (value) => {
	try {
		if (typeof value !== "string") return;
		const url = new URL(value);
		if (url.protocol === "https:" && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash) return url.origin;
	} catch {}
};
function RoomHttpsInvitation({ onOrigin }) {
	const [busy, setBusy] = (0, import_react.useState)(false), [notice, setNotice] = (0, import_react.useState)(""), [running, setRunning] = (0, import_react.useState)(false);
	const request = (0, import_react.useRef)(void 0);
	(0, import_react.useEffect)(() => {
		const hide = () => {
			if (document.hidden && request.current) {
				request.current.abort();
				setBusy(false);
				setNotice("HTTPS address check paused. Use the buttons below to check again.");
			}
		};
		document.addEventListener("visibilitychange", hide);
		return () => {
			document.removeEventListener("visibilitychange", hide);
			request.current?.abort();
		};
	}, []);
	const change = async (action) => {
		if (busy) return;
		request.current?.abort();
		const controller = new AbortController();
		request.current = controller;
		setBusy(true);
		setNotice(action === "start" ? "Starting temporary HTTPS sharing…" : action === "stop" ? "Stopping temporary sharing…" : "Checking the host’s HTTPS address…");
		const read = async (mutation) => {
			const response = await fetch("/api/quick-tunnel", {
				signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5e3)]),
				...mutation ? {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ action: mutation })
				} : {}
			});
			const data = await response.json();
			if (!response.ok) throw Error(data.error || "Only the host computer can manage HTTPS sharing.");
			return data;
		};
		try {
			let data = await read(action === "check" ? void 0 : action);
			if (action === "start") for (let attempt = 0; data.starting && !secureOrigin(data.url) && attempt < 12; attempt++) {
				await new Promise((resolve, reject) => {
					const abort = () => {
						clearTimeout(timer);
						reject(new DOMException("Cancelled", "AbortError"));
					};
					const timer = setTimeout(() => {
						controller.signal.removeEventListener("abort", abort);
						resolve();
					}, 1500);
					controller.signal.addEventListener("abort", abort, { once: true });
					if (controller.signal.aborted) abort();
				});
				data = await read();
			}
			if (controller.signal.aborted) return;
			setRunning(Boolean(data.running || data.starting));
			if (action === "stop") onOrigin("");
			const origin = secureOrigin(data.url);
			if (data.running && origin) {
				onOrigin(origin);
				setNotice("The invitation now uses HTTPS. Share the updated link or QR code; the current host room stays open.");
			} else setNotice(action === "stop" ? "Temporary sharing stopped. Any saved HTTPS link from this tunnel no longer works." : data.error || (data.starting ? "Still starting. Check again shortly; no more automatic checks will run." : "No running HTTPS address. Use an existing HTTPS deployment, or start temporary sharing below."));
		} catch (error) {
			if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : "Could not obtain an HTTPS address.");
		} finally {
			if (request.current === controller) request.current = void 0;
			if (!controller.signal.aborted) setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "HTTPS room sharing",
		className: "mt-3 space-y-3 rounded-md border border-border p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-fg",
				children: "HTTPS invitation for Twitch"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "Twitch embeds need HTTPS on a guest phone. Use your existing HTTPS app address under Phone address, or use the host’s temporary sharing link."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				disabled: busy,
				onClick: () => void change("check"),
				children: "Use running HTTPS address"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "min-h-11 cursor-pointer text-xs font-medium",
					children: "Start temporary HTTPS sharing"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "my-2 text-xs leading-5 text-muted",
					children: "This starts the existing Cloudflare trial tunnel and makes this app reachable at a temporary public address. Share it only with invited guests. Starting a link does not move or reload the host. Stop sharing when finished; closing this panel does not stop the tunnel. Cloudflared must be installed on the host."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						disabled: busy,
						onClick: () => void change("start"),
						children: "Start temporary HTTPS link"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: busy || !running,
						onClick: () => void change("stop"),
						children: "Stop temporary HTTPS link"
					})]
				})
			] }),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-xs leading-5 text-muted",
				children: notice
			})
		]
	});
}
function useRoomInvitation(room) {
	const current = window.location.origin;
	const reachable = Boolean(shareableRoomInvite(current, window.location.pathname, room));
	const [origin, setOrigin] = (0, import_react.useState)(() => reachable ? current : localStorage.getItem("reelcase.watch-room.invite-origin.v1") ?? "");
	const [origins, setOrigins] = (0, import_react.useState)([]);
	const [checking, setChecking] = (0, import_react.useState)(!reachable);
	(0, import_react.useEffect)(() => {
		if (reachable) return;
		const controller = new AbortController();
		fetch("/api/lan-origin", { signal: controller.signal }).then((response) => response.ok ? response.json() : { origins: [] }).then((data) => {
			if (controller.signal.aborted) return;
			const rows = (Array.isArray(data.origins) ? data.origins : []).filter((value) => typeof value === "string" && Boolean(shareableRoomInvite(value, "/", room))).slice(0, 4);
			setOrigins(rows);
			setOrigin((previous) => previous || rows[0] || "");
		}).catch(() => {}).finally(() => {
			if (!controller.signal.aborted) setChecking(false);
		});
		return () => controller.abort();
	}, [reachable]);
	const url = shareableRoomInvite(origin.trim(), window.location.pathname, room);
	const chooseOrigin = (0, import_react.useCallback)((value) => {
		setOrigin(value);
		try {
			localStorage.setItem("reelcase.watch-room.invite-origin.v1", value);
		} catch {}
	}, []);
	return (0, import_react.useMemo)(() => ({
		url,
		origin,
		origins,
		checking,
		chooseOrigin
	}), [
		url,
		origin,
		origins,
		checking,
		chooseOrigin
	]);
}
var RoomInvitation = (0, import_react.memo)(function RoomInvitation({ invitation, started, onNotice }) {
	const { url, origin, origins, checking, chooseOrigin } = invitation;
	const image = (0, import_react.useMemo)(() => {
		if (!url || url.length > 2e3) return "";
		const qr = qrcode(0, "M");
		qr.addData(url);
		qr.make();
		return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr.createSvgTag({
			cellSize: 5,
			margin: 20,
			scalable: true
		}))}`;
	}, [url]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Join room by QR",
		className: "mt-4 rounded-lg border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-sm font-medium text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-4 text-accent" }), "Join on your phone"]
			}),
			started && image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: url,
				target: "_blank",
				rel: "noreferrer",
				className: "mt-3 block w-56 max-w-full",
				"aria-label": "Open guest invitation",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image,
					alt: "Scan to join this Watch Room",
					className: "aspect-square w-full rounded-sm"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: [
					started ? "Scan with your camera to open this room’s guest view. Keep the host player open." : "Start the room to show its QR code.",
					" ",
					"Guests receive the current video and queue without importing your library."
				]
			}),
			origins.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				"aria-label": "Phone invitation address",
				value: origins.includes(origin) ? origin : "",
				onChange: (event) => chooseOrigin(event.target.value),
				className: "mt-3 min-h-11 w-full rounded-sm bg-elevated px-3 text-xs text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					disabled: true,
					children: "Choose a network address"
				}), origins.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: value }, value))]
			}),
			url?.startsWith("http:") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "This phone link uses HTTP. Twitch requires an HTTPS app address for embedded viewing; the room’s chat and queue can still work over this link."
			}),
			window.location.protocol !== "https:" && /^(?:localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) && window.location.port === "8080" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomHttpsInvitation, { onOrigin: chooseOrigin }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-3 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "cursor-pointer",
						children: ["Phone address", checking ? " · checking home network…" : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2",
						"aria-label": "Room invitation base URL",
						value: origin,
						onChange: (event) => chooseOrigin(event.target.value),
						placeholder: "https://your-shared-app-address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 leading-5",
						children: "Use the app’s home-network or public address. On home Wi‑Fi, join the same household network."
					})
				]
			}),
			url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: url,
				target: "_blank",
				rel: "noreferrer",
				className: "mt-3 block break-all text-xs text-accent",
				"data-room-invite-url": true,
				children: url
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				className: "mt-3 min-h-11",
				onClick: () => {
					if (!navigator.clipboard) {
						onNotice("Copy the invitation address shown above.");
						return;
					}
					navigator.clipboard.writeText(url).then(() => onNotice("Theater invitation link copied."), () => onNotice("Copy the invitation address shown above."));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy theater invitation link"]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 text-xs text-muted",
				children: checking ? "Finding a phone-reachable address…" : "Enter the app’s network address above to create a scannable invitation."
			})
		]
	});
});
/** Documented YouTube IFrame API error codes, never inferred from iframe text.
* https://developers.google.com/youtube/iframe_api_reference#onError */
function roomYoutubeError(code) {
	if (typeof code !== "number" || !Number.isInteger(code)) return;
	if (code === 100) return "YouTube reports that this video is unavailable or private. Open it on YouTube or choose another queued title.";
	if (code === 101 || code === 150) return "This creator does not allow embedded playback. Open the video on YouTube or choose another queued title.";
	if (code === 153) return "YouTube could not identify this embedded player. Try reloading this player, or open the video on YouTube.";
	if (code === 2) return "YouTube rejected this video request. Check the link or choose another queued title.";
	return "YouTube could not play this video on this device. Try reloading this player, or open it on YouTube.";
}
/** Commit keyboard intent before a confirmed host clock can rerender the
* controlled range between its native input event and keyup. */
function roomSeekKey(key, position, duration) {
	if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return;
	const value = key === "Home" ? 0 : key === "End" ? duration : ["ArrowRight", "ArrowUp"].includes(key) ? position + .25 : ["ArrowLeft", "ArrowDown"].includes(key) ? position - .25 : key === "PageUp" ? position + Math.max(.25, duration / 10) : key === "PageDown" ? position - Math.max(.25, duration / 10) : void 0;
	return value === void 0 ? void 0 : Math.min(duration, Math.max(0, value));
}
var YOUTUBE_EMBED_PHASES = [
	"loading",
	"ready",
	"playing",
	"blocked",
	"error",
	"timeout"
];
var validId = (id) => typeof id === "string" && /^[\w-]{1,128}$/.test(id);
var validTime = (time) => typeof time === "number" && Number.isFinite(time) && time > 0 && time <= 864e13;
var validCode = (code) => typeof code === "number" && Number.isInteger(code) && Math.abs(code) <= 1e4;
function youtubeEmbedIssue(phase, code) {
	if (phase === "blocked") return {
		kind: "autoplay",
		title: "This device needs a Play tap",
		detail: "Your browser blocked autoplay. It needs a tap. Choose Start on this device, or press Play inside the video. The room keeps playing.",
		action: "Use Play inside the video or Start on this device. This affects only your player."
	};
	if (phase === "timeout") return {
		kind: "setup",
		title: "Player connection not confirmed",
		detail: "This player did not confirm readiness. A slow connection, blocked player script or embed setup may be involved; no YouTube error code was received.",
		action: "Check this device’s connection or content blocker, then retry this player. This does not prove the video was removed or restricted."
	};
	if (phase !== "error" || !validCode(code)) return;
	const kind = code === 2 ? "link" : code === 5 ? "browser" : code === 100 ? "unavailable" : code === 101 || code === 150 ? "embedding" : code === 153 ? "setup" : "unknown";
	return {
		kind,
		title: {
			link: "YouTube rejected this link",
			browser: "This browser could not play the video",
			unavailable: "Video unavailable or private",
			embedding: "Embedding disabled by the creator",
			setup: "YouTube could not identify this player",
			unknown: "YouTube player error"
		}[kind],
		detail: roomYoutubeError(code),
		action: {
			link: "Check the public video link or choose a different queued title.",
			browser: "Retry this device’s player. If it still fails, open the video on YouTube.",
			unavailable: "Open the official watch page to check access, or let the host choose another title.",
			embedding: "Use the official watch page. Reloading cannot change the creator’s embed permission.",
			setup: "This can involve the referrer or player identity. Retry here or open YouTube; changing queue permissions will not fix it.",
			unknown: "Retry only this device, or check the official watch page for more information."
		}[kind]
	};
}
/** Session-only, transition-only evidence. Repeated clock/status events keep the
* same array and timestamps; loads count explicit player generations only. */
function recordYoutubeEmbedEvidence(rows, videoId, phase, code, at) {
	if (!validId(videoId) || !YOUTUBE_EMBED_PHASES.includes(phase) || !validTime(at) || phase === "error" && !validCode(code)) return rows;
	const previous = rows.find((row) => row.videoId === videoId), event = {
		phase,
		at,
		...phase === "error" ? { code } : {}
	};
	const last = previous?.events.at(-1);
	if (previous && phase !== "loading" && (last?.phase === phase && last.code === event.code || ["error", "blocked"].includes(previous.phase) && ["ready", "timeout"].includes(phase))) return rows;
	if (previous && at < previous.changedAt) return rows;
	const next = {
		videoId,
		loads: Math.min(9999, (previous?.loads ?? 0) + (phase === "loading" ? 1 : 0)),
		phase,
		changedAt: at,
		events: [...previous?.events ?? [], event].slice(-6)
	};
	return [...rows.filter((row) => row.videoId !== videoId), next].slice(-12);
}
/** Rebuild the entire export whitelist; never serialize a room, player message,
* catalog object, URL with tracking, local path, invitation or provider payload. */
function exportYoutubeEmbedEvidence(rows, at) {
	if (!validTime(at)) throw Error("The diagnostic export clock is invalid.");
	const titles = rows.slice(-12).flatMap((row) => {
		if (!validId(row.videoId) || !YOUTUBE_EMBED_PHASES.includes(row.phase) || !validTime(row.changedAt) || !Array.isArray(row.events)) return [];
		const events = row.events.slice(-6).flatMap((event) => !YOUTUBE_EMBED_PHASES.includes(event.phase) || !validTime(event.at) || event.phase === "error" && !validCode(event.code) ? [] : [{
			phase: event.phase,
			at: event.at,
			...event.phase === "error" ? { code: event.code } : {}
		}]);
		return [{
			videoId: row.videoId,
			watchUrl: "https://www.youtube.com/watch?v=" + row.videoId,
			phase: row.phase,
			changedAt: row.changedAt,
			loads: Number.isFinite(row.loads) ? Math.min(9999, Math.max(0, Math.trunc(row.loads))) : 0,
			events
		}];
	});
	return JSON.stringify({
		format: "realhub-youtube-player-diagnostics",
		version: 1,
		exportedAt: new Date(at).toISOString(),
		scope: "This browser’s current room visit; provider availability and external playback are not verified.",
		titles
	}, null, 2);
}
var YoutubeEmbedRecovery = (0, import_react.memo)(function YoutubeEmbedRecovery({ videoId, rows, notice, onReload, onClearEarlier }) {
	const [exportNotice, setExportNotice] = (0, import_react.useState)(""), [diagnosticsOpen, setDiagnosticsOpen] = (0, import_react.useState)(false);
	const current = rows.find((row) => row.videoId === videoId), event = current?.events.at(-1), issue = current && youtubeEmbedIssue(current.phase, event?.code);
	const download = () => {
		try {
			const url = URL.createObjectURL(new Blob([exportYoutubeEmbedEvidence(rows, Date.now())], { type: "application/json" })), link = document.createElement("a");
			link.href = url;
			link.download = "youtube-player-diagnostics.json";
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1e3);
			setExportNotice("Diagnostics downloaded. Room access, names, local files and account data are excluded.");
		} catch (error) {
			setExportNotice(error instanceof Error ? error.message : "Could not export player diagnostics.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Player recovery",
		className: "mt-3 space-y-3 rounded-md border border-border bg-bg/45 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-live": "polite",
				"aria-atomic": "true",
				children: issue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium text-fg",
						children: issue.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-accent",
						children: issue.detail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: issue.action
					}),
					event?.phase === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [
							"Observed YouTube player code ",
							event.code,
							". This is not a channel-wide availability check."
						]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: current?.phase === "loading" ? "Waiting for this device’s YouTube player." : "No current YouTube player failure reported."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "secondary",
					className: "min-h-11",
					onClick: onReload,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), "Reload this player"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "https://www.youtube.com/watch?v=" + encodeURIComponent(videoId),
					target: "_blank",
					rel: "noreferrer",
					className: "inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs text-accent hover:bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" }), "Open on YouTube"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "Affects this device. Use Play next to change the room video. Watching outside the app does not synchronize playback; chat and the queue stay available here."
			}),
			notice && notice !== issue?.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-xs leading-5 text-accent",
				children: notice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "border-t border-border pt-2",
				onToggle: (event) => setDiagnosticsOpen(event.currentTarget.open),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "min-h-11 cursor-pointer py-2 text-xs font-medium text-fg",
					children: [
						"Player diagnostics · ",
						rows.length,
						" / 12 titles"
					]
				}), diagnosticsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: "This browser’s current room visit only. Up to six recent transitions per title; repeated player clocks are not recorded. Reports stay in memory for this visit; a file is downloaded only when you choose."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						"aria-label": "YouTube player evidence",
						className: "mt-3 max-h-72 space-y-3 overflow-y-auto",
						children: [...rows].reverse().map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "break-words text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-medium text-fg",
								children: [
									row.videoId === videoId ? "Current title · " : "",
									row.videoId,
									" · ",
									row.phase,
									" · ",
									row.loads,
									" player load",
									row.loads === 1 ? "" : "s"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-1 space-y-1",
								children: row.events.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									new Date(item.at).toISOString(),
									" · ",
									item.phase,
									item.code !== void 0 ? " · YouTube code " + item.code : ""
								] }, index))
							})]
						}, row.videoId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							disabled: !rows.length,
							onClick: download,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), "Download player diagnostics"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "min-h-11",
							disabled: rows.every((row) => row.videoId === videoId),
							onClick: onClearEarlier,
							children: "Clear earlier title diagnostics"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "https://developers.google.com/youtube/iframe_api_reference#onError",
						target: "_blank",
						rel: "noreferrer",
						className: "mt-2 inline-flex min-h-11 items-center text-xs text-accent underline",
						children: "YouTube’s documented player errors"
					}),
					exportNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "mt-2 text-xs leading-5 text-accent",
						children: exportNotice
					})
				] })]
			})
		]
	});
});
function useYoutubeEmbedDiagnostics(room, videoId, reload) {
	const [rows, setRows] = (0, import_react.useState)([]);
	const scope = room + ":" + videoId + ":" + reload, latest = (0, import_react.useRef)(scope);
	latest.current = scope;
	(0, import_react.useEffect)(() => {
		setRows([]);
	}, [room]);
	const record = (0, import_react.useCallback)((phase, code) => {
		if (!room || !videoId || latest.current !== scope) return;
		setRows((previous) => recordYoutubeEmbedEvidence(previous, videoId, phase, code, Date.now()));
	}, [scope, videoId]);
	(0, import_react.useEffect)(() => {
		record("loading");
	}, [record]);
	return {
		rows,
		record,
		clearEarlier: (0, import_react.useCallback)(() => setRows((previous) => previous.filter((row) => row.videoId === videoId)), [videoId])
	};
}
var PLAYER_STATES = [
	"idle",
	"loading",
	"ready",
	"playing",
	"paused",
	"buffering",
	"blocked",
	"error",
	"unsupported",
	"waiting",
	"ended"
];
/** No clocks, media identities, error text or personal device details go over the wire. */
function readPlayerReadiness(raw) {
	if (!raw || typeof raw !== "object") return;
	const r = raw;
	if (!Number.isSafeInteger(r.selection) || r.selection < 0 || !PLAYER_STATES.includes(r.status) || ![
		"none",
		"youtube",
		"twitch",
		"local",
		"clip"
	].includes(r.capability)) return;
	return {
		selection: r.selection,
		status: r.status,
		capability: r.capability
	};
}
function samePlayerReadiness(a, b) {
	return a === b || Boolean(a && b && a.selection === b.selection && a.status === b.status && a.capability === b.capability);
}
/** Capability-ready events cannot clear an autoplay block or overwrite observed playback. */
function observePlayerReadiness(current, signal) {
	if (signal === "ready" && ![
		"loading",
		"waiting",
		"idle"
	].includes(current)) return current;
	if (["blocked", "error"].includes(current) && [
		"loading",
		"buffering",
		"paused"
	].includes(signal)) return current;
	return signal;
}
var PLAYER_LABELS = {
	idle: "No video selected",
	loading: "Player loading",
	ready: "Player ready",
	playing: "Playing on device",
	paused: "Paused on device",
	buffering: "Starting / buffering",
	blocked: "Needs a Play tap",
	error: "Player error",
	unsupported: "Status unavailable",
	waiting: "Waiting for local video",
	ended: "Video ended"
};
function playerReadinessHelp(status) {
	if (status === "blocked") return "Ask this viewer to use Start on this device or Play inside their player. A Ready vote cannot unlock autoplay.";
	if (status === "loading" || status === "buffering") return "Give this player time. The viewer can reload their player if it stays stuck; the queue stays in place.";
	if (status === "error") return "Ask this viewer to check Player recovery or open the provider directly. Reload affects only their device.";
	if (status === "waiting") return "The viewer needs the host’s local stream or an approved matching local file.";
	if (status === "unsupported") return "This embed cannot report playback status here. Ask the viewer to confirm playback directly.";
	return "Player observations are separate from the manual Ready check and do not change room playback.";
}
function playerNeedsHelp(status, roomPlaying) {
	if (!status) return true;
	return !["playing", "idle"].includes(status) && (roomPlaying || ![
		"ready",
		"paused",
		"ended"
	].includes(status));
}
/** A fresh player generation starts with no inherited observations. Late events
* from a replaced player cannot update the current title. No clock polling. */
function useRoomPlayerReadiness(scope, selection, capability, initial) {
	const latest = (0, import_react.useRef)(scope);
	latest.current = scope;
	const [observed, setObserved] = (0, import_react.useState)({
		scope,
		status: initial
	});
	const status = observed.scope === scope ? observed.status : initial;
	const observe = (0, import_react.useCallback)((signal) => {
		if (latest.current !== scope) return;
		setObserved((previous) => {
			const value = observePlayerReadiness(previous.scope === scope ? previous.status : initial, signal);
			return previous.scope === scope && previous.status === value ? previous : {
				scope,
				status: value
			};
		});
	}, [scope, initial]);
	return {
		report: (0, import_react.useMemo)(() => ({
			selection,
			capability,
			status
		}), [
			selection,
			capability,
			status
		]),
		observe
	};
}
function readParticipationAction(raw) {
	if (!raw || typeof raw !== "object") return;
	const row = raw;
	if (row.kind === "player") {
		const value = readPlayerReadiness(row.value);
		if (value) return {
			kind: "player",
			value
		};
		return;
	}
	if (row.kind === "ready" && typeof row.value === "boolean") return {
		kind: "ready",
		value: row.value
	};
	if (row.kind === "vote" && (row.value === null || typeof row.value === "string" && row.value.length > 0 && row.value.length <= 600)) return {
		kind: "vote",
		value: row.value
	};
}
function readParticipationState(raw) {
	if (!raw || typeof raw !== "object") return;
	const state = raw;
	if (!Number.isSafeInteger(state.revision) || state.revision < 0 || !Array.isArray(state.people) || state.people.length > 65) return;
	if (state.selection !== void 0 && (!Number.isSafeInteger(state.selection) || state.selection < 0)) return;
	const seen = /* @__PURE__ */ new Set(), people = [];
	for (const person of state.people) {
		if (!person || typeof person.id !== "string" || !person.id || person.id.length > 160 || seen.has(person.id) || typeof person.ready !== "boolean" || person.vote !== void 0 && (typeof person.vote !== "string" || !person.vote || person.vote.length > 600)) return;
		const player = person.player === void 0 ? void 0 : readPlayerReadiness(person.player);
		if (person.player !== void 0 && (!player || player.selection !== state.selection)) return;
		seen.add(person.id);
		people.push({
			id: person.id,
			ready: person.ready,
			...person.vote ? { vote: person.vote } : {},
			...player ? { player } : {}
		});
	}
	return {
		revision: state.revision,
		people,
		...state.selection !== void 0 ? { selection: state.selection } : {}
	};
}
/** Host-owned ephemeral room state. Transport identity, rather than a claimed
* name or client-supplied ID, owns each readiness flag and latest vote. */
var RoomParticipation = class {
	revision = 0;
	selection;
	setSelection(value) {
		if (!Number.isSafeInteger(value) || value < 0 || this.selection === value || this.selection !== void 0 && value < this.selection) return false;
		this.selection = value;
		for (const [id, row] of this.people) this.people.set(id, {
			id,
			ready: row.ready,
			...row.vote ? { vote: row.vote } : {}
		});
		this.revision++;
		return true;
	}
	people = /* @__PURE__ */ new Map();
	reconcile(members, queue) {
		const allowed = new Set(members.slice(0, 65)), queued = new Set(queue.slice(0, 48));
		let changed = false;
		for (const id of this.people.keys()) if (!allowed.has(id)) {
			this.people.delete(id);
			changed = true;
		}
		for (const id of allowed) if (!this.people.has(id)) {
			this.people.set(id, {
				id,
				ready: false
			});
			changed = true;
		}
		for (const [id, row] of this.people) if (row.vote && !queued.has(row.vote)) {
			this.people.set(id, {
				...row,
				vote: void 0
			});
			changed = true;
		}
		if (changed) this.revision++;
		return changed;
	}
	apply(from, raw, queue) {
		const row = this.people.get(from), action = readParticipationAction(raw);
		if (!row || !action) return false;
		if (action.kind === "player") {
			if (action.value.selection !== this.selection) return false;
			if (!samePlayerReadiness(row.player, action.value)) {
				this.people.set(from, {
					...row,
					player: action.value
				});
				this.revision++;
			}
			return true;
		}
		if (action.kind === "vote" && action.value !== null && !queue.includes(action.value)) return false;
		const next = {
			...row,
			...action.kind === "ready" ? { ready: action.value } : { vote: action.value ?? void 0 }
		};
		if (next.ready === row.ready && next.vote === row.vote) return true;
		this.people.set(from, next);
		this.revision++;
		return true;
	}
	snapshot() {
		return {
			revision: this.revision,
			people: [...this.people.values()],
			...this.selection !== void 0 ? { selection: this.selection } : {}
		};
	}
};
/** Equal vote counts keep the host's confirmed queue order. Votes never edit
* that order automatically; the host chooses whether to prioritize a title. */
function participationVotes(state, queue) {
	const counts = /* @__PURE__ */ new Map();
	for (const person of state.people) if (person.vote) counts.set(person.vote, (counts.get(person.vote) ?? 0) + 1);
	return queue.map((id, index) => ({
		id,
		index,
		votes: counts.get(id) ?? 0
	})).filter((row) => row.votes > 0).sort((a, b) => b.votes - a.votes || a.index - b.index);
}
var EMPTY = {
	revision: 0,
	people: []
};
var RoomParticipationPanel = (0, import_react.memo)(function RoomParticipationPanel(props) {
	const { room, guest, hostId, selfId, peers, readyRevision, queue, send, onMessage, onPrioritize, localPlayer, playing, onWait } = props;
	const model = (0, import_react.useRef)(new RoomParticipation()), latest = (0, import_react.useRef)(props);
	latest.current = props;
	const [state, setState] = (0, import_react.useState)(EMPTY), [notice, setNotice] = (0, import_react.useState)(""), [waiting, setWaiting] = (0, import_react.useState)(false), [visiblePlayers, setVisiblePlayers] = (0, import_react.useState)(16);
	const ownPlayerTimer = (0, import_react.useRef)(void 0);
	const playerTimer = (0, import_react.useRef)(void 0);
	const accepted = (0, import_react.useRef)(0), pending = (0, import_react.useRef)(""), timeout = (0, import_react.useRef)(void 0);
	const memberKey = peers.filter((peer) => peer.connectionState === "connected").map((peer) => peer.id).sort().join("|"), queueKey = queue.map((row) => row.id).join("|");
	const acknowledge = (0, import_react.useCallback)((ack) => {
		const next = model.current.snapshot();
		setState(next);
		send({
			type: "participation-state",
			state: next,
			...ack ? { ack } : {}
		});
	}, [send]);
	const publishPlayers = (0, import_react.useCallback)(() => {
		if (playerTimer.current !== void 0) return;
		playerTimer.current = setTimeout(() => {
			playerTimer.current = void 0;
			acknowledge();
		}, 250);
	}, [acknowledge]);
	(0, import_react.useEffect)(() => {
		clearTimeout(ownPlayerTimer.current);
		ownPlayerTimer.current = void 0;
		clearTimeout(playerTimer.current);
		playerTimer.current = void 0;
		model.current = new RoomParticipation();
		accepted.current = 0;
		setState(EMPTY);
		setVisiblePlayers(16);
		setWaiting(false);
		pending.current = "";
		clearTimeout(timeout.current);
	}, [
		room,
		guest,
		guest ? hostId : selfId
	]);
	(0, import_react.useEffect)(() => {
		if (!room) return;
		if (guest) {
			if (hostId) send({ type: "participation-hello" }, hostId);
			return;
		}
		model.current.setSelection(localPlayer.selection);
		model.current.reconcile([selfId, ...peers.filter((peer) => peer.connectionState === "connected").map((peer) => peer.id)], queue.map((row) => row.id));
		acknowledge();
	}, [
		room,
		guest,
		hostId,
		selfId,
		memberKey,
		queueKey,
		readyRevision,
		localPlayer.selection,
		send,
		acknowledge
	]);
	(0, import_react.useEffect)(() => onMessage((from, raw, channel) => {
		if (channel !== "reliable" || !raw || typeof raw !== "object") return;
		const data = raw, current = latest.current;
		if (current.guest) {
			if (data.type !== "participation-state" || !current.hostId || from !== current.hostId) return;
			const next = readParticipationState(data.state);
			if (!next || next.revision < accepted.current) return;
			accepted.current = next.revision;
			setState(next);
			if (data.ack === pending.current) {
				pending.current = "";
				clearTimeout(timeout.current);
				setWaiting(false);
				setNotice("The host confirmed your choice.");
			}
			return;
		}
		if (!current.peers.some((peer) => peer.id === from && peer.connectionState === "connected")) return;
		if (data.type === "participation-hello") {
			send({
				type: "participation-state",
				state: model.current.snapshot()
			}, from);
			return;
		}
		if (data.type === "participation-player") {
			if (data.value?.selection !== current.localPlayer.selection) return;
			const before = model.current.snapshot().revision;
			if (model.current.apply(from, {
				kind: "player",
				value: data.value
			}, current.queue.map((row) => row.id)) && model.current.snapshot().revision !== before) publishPlayers();
			return;
		}
		if (data.type !== "participation-request" || typeof data.requestId !== "string" || data.requestId.length > 160 || !readParticipationAction(data.action)) return;
		if (model.current.apply(from, data.action, current.queue.map((row) => row.id))) acknowledge(data.requestId);
	}), [
		onMessage,
		send,
		acknowledge,
		publishPlayers
	]);
	(0, import_react.useEffect)(() => () => {
		clearTimeout(timeout.current);
		clearTimeout(playerTimer.current);
		clearTimeout(ownPlayerTimer.current);
	}, []);
	const connected = !guest || Boolean(hostId && peers.some((peer) => peer.id === hostId && peer.connectionState === "connected"));
	(0, import_react.useEffect)(() => {
		if (!room || !connected) {
			clearTimeout(ownPlayerTimer.current);
			ownPlayerTimer.current = void 0;
			return;
		}
		if (ownPlayerTimer.current !== void 0) return;
		ownPlayerTimer.current = setTimeout(() => {
			ownPlayerTimer.current = void 0;
			const current = latest.current;
			if (current.guest) send({
				type: "participation-player",
				value: current.localPlayer
			}, current.hostId);
			else {
				const before = model.current.snapshot().revision;
				model.current.apply(current.selfId, {
					kind: "player",
					value: current.localPlayer
				}, []);
				if (model.current.snapshot().revision !== before) publishPlayers();
			}
		}, 250);
	}, [
		room,
		guest,
		hostId,
		selfId,
		connected,
		readyRevision,
		localPlayer,
		send,
		publishPlayers
	]);
	const choose = (action) => {
		if (!connected || waiting) return;
		if (!guest) {
			model.current.apply(selfId, action, queue.map((row) => row.id));
			acknowledge();
			return;
		}
		const requestId = "choice-" + crypto.randomUUID();
		pending.current = requestId;
		setWaiting(true);
		setNotice("Waiting for host confirmation…");
		send({
			type: "participation-request",
			action,
			requestId
		}, hostId);
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			pending.current = "";
			setWaiting(false);
			setNotice("No confirmation yet. Check the host connection and try again.");
		}, 5e3);
	};
	const own = state.people.find((row) => row.id === selfId), ready = state.people.filter((row) => row.ready).length;
	const effectivePlayer = (person) => person.id === selfId ? localPlayer : person.player?.selection === localPlayer.selection ? person.player : void 0;
	const waitingPlayers = state.people.filter((person) => person.id !== selfId && playerNeedsHelp(effectivePlayer(person)?.status, playing));
	const votes = (0, import_react.useMemo)(() => participationVotes(state, queue.map((row) => row.id)), [state, queue]), counts = new Map(votes.map((row) => [row.id, row.votes])), winner = votes[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Room guest controls",
		className: "rounded-lg border border-border bg-elevated p-4 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl text-fg",
				children: "Make it a group watch."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: "Ready checks and next-video votes work even when queue editing is locked. The host confirms the order; voting never skips or starts a video automatically. Manual Ready is a choice, not proof that a player has started."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-md bg-bg/45 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium text-fg",
							children: [
								"Ready check · ",
								ready,
								" / ",
								state.people.length
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: !connected ? "Waiting for host" : waiting ? "Confirming choice" : own?.ready ? "You’re ready" : "Take your time"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "min-h-11",
							variant: own?.ready ? "default" : "secondary",
							"aria-pressed": own?.ready ?? false,
							disabled: !connected || waiting,
							onClick: () => choose({
								kind: "ready",
								value: true
							}),
							children: "I’m ready"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "min-h-11",
							variant: own && !own.ready ? "default" : "secondary",
							disabled: !connected || waiting,
							onClick: () => choose({
								kind: "ready",
								value: false
							}),
							children: "Need a moment"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs font-medium text-fg",
						"aria-label": "Observed player summary",
						children: [
							state.people.filter((person) => effectivePlayer(person)?.status === "playing").length,
							" /",
							" ",
							state.people.length,
							" devices report playing"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-xs text-muted",
						"aria-label": "Room readiness",
						children: state.people.slice(0, visiblePlayers).map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-md border border-border p-2 leading-5",
							"data-player-person": person.id,
							"data-player-state": effectivePlayer(person)?.status ?? "unknown",
							children: [
								person.id === selfId ? "You" : peers.find((peer) => peer.id === person.id)?.name || "Guest",
								" ",
								"· ",
								person.ready ? "Ready (manual)" : "Not ready yet",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-medium text-fg",
									children: effectivePlayer(person) ? PLAYER_LABELS[effectivePlayer(person).status] : "Player not reported for this title"
								}),
								!guest && person.id !== selfId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-muted",
									children: playerReadinessHelp(effectivePlayer(person)?.status)
								})
							]
						}, person.id))
					}),
					visiblePlayers < state.people.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "mt-2 min-h-11",
						onClick: () => setVisiblePlayers((n) => Math.min(65, n + 16)),
						children: "Show more participant statuses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-5 text-muted",
						children: "Player status is device-reported for this title, not a connection test. Playback outside the app cannot be observed."
					}),
					!guest && waitingPlayers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								waitingPlayers.length,
								" viewer",
								waitingPlayers.length === 1 ? "" : "s",
								" may need time or help. You choose whether the room waits."
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							disabled: !playing,
							onClick: onWait,
							children: "Pause room to wait"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-medium text-fg",
						children: "Vote for the next video"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 max-h-72 space-y-2 overflow-y-auto",
						"aria-label": "Next video votes",
						children: queue.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 rounded-md bg-bg/45 p-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "min-w-0 flex-1 truncate text-xs text-fg",
								children: [row.video?.name || "Queued video", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-muted",
									children: [counts.get(row.id) ?? 0, " votes"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "min-h-11",
								variant: own?.vote === row.id ? "default" : "secondary",
								"aria-label": "Vote next: " + (row.video?.name || row.id),
								"aria-pressed": own?.vote === row.id,
								disabled: !connected || waiting,
								onClick: () => choose({
									kind: "vote",
									value: own?.vote === row.id ? null : row.id
								}),
								children: own?.vote === row.id ? "Voted" : "Vote next"
							})]
						}, row.id))
					}),
					!queue.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Queue a few public videos to choose what comes next."
					}),
					winner && !guest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						className: "mt-3 min-h-11",
						onClick: () => onPrioritize({
							kind: "next",
							id: winner.id
						}),
						children: ["Put the top vote next · ", winner.votes]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: "One latest vote per connected person. Ties keep the current queue order; votes for consumed or removed titles disappear. Choices last for this room session."
					})
				]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-accent",
				role: "status",
				children: notice
			})
		]
	});
});
function guestPlaybackRequest(current, request, access) {
	const seek = request.seek === true;
	if (seek && (access.live || !access.seeking)) return {
		allowed: false,
		reason: access.live ? "Live streams keep their own playback clock." : "The host is handling timeline seeking. Readiness, voting and chat are still available."
	};
	if (!seek && !access.playback) return {
		allowed: false,
		reason: "The host is handling play and pause. Readiness, voting and chat are still available."
	};
	if (seek && (typeof request.position !== "number" || !Number.isFinite(request.position) || request.position < 0)) return {
		allowed: false,
		reason: "That seek time is invalid."
	};
	return {
		allowed: true,
		seek,
		playing: access.playback && typeof request.playing === "boolean" ? request.playing : current.playing,
		position: seek ? request.position : current.position
	};
}
var EMPTY_PLAYED = [];
var RoomSessionFilePanel = (0, import_react.memo)(function RoomSessionFilePanel({ current, played = EMPTY_PLAYED, queue, guest, writable, onImport }) {
	const [open, setOpen] = (0, import_react.useState)(false), [loaded, setLoaded] = (0, import_react.useState)(), [notice, setNotice] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false), [visible, setVisible] = (0, import_react.useState)(12);
	const readRevision = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => () => {
		readRevision.current++;
	}, []);
	const exported = (0, import_react.useMemo)(() => open ? buildRoomSessionFile({
		played,
		current,
		upcoming: queue
	}) : void 0, [
		open,
		played,
		current,
		queue
	]);
	const preview = (0, import_react.useMemo)(() => loaded ? previewRoomSessionImport(loaded.file, current, queue) : void 0, [
		loaded,
		current,
		queue
	]);
	const exportFile = () => {
		if (!exported) return;
		try {
			const url = URL.createObjectURL(new Blob([writeRoomSessionFile(exported.file)], { type: "application/json" })), a = document.createElement("a");
			a.href = url;
			a.download = "watch-together-session.json";
			a.click();
			window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
			setError("");
			setNotice("Public session downloaded. Only upcoming items can be imported; playback and room access are excluded.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not start the session download.");
		}
	};
	const readFile = async (file) => {
		const revision = ++readRevision.current;
		setLoaded(void 0);
		setVisible(12);
		setNotice("");
		setError("");
		if (!file) {
			setBusy(false);
			return;
		}
		setBusy(true);
		try {
			if (file.size > 256e3) throw Error("This session file is too large (maximum 256 KB).");
			const parsed = readRoomSessionFile(await file.text());
			if (revision === readRevision.current) setLoaded(parsed);
		} catch (e) {
			if (revision === readRevision.current) setError(e instanceof Error ? e.message : "Could not read this session file. The room was not changed.");
		} finally {
			if (revision === readRevision.current) setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-4 border-t border-border pt-2",
		"aria-label": "Session handoff file",
		onToggle: (e) => setOpen(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
			className: "min-h-11 cursor-pointer py-3 text-sm font-medium text-fg",
			children: "Session handoff file"
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "Share public YouTube/Twitch titles from this room: up to 12 recently played, the current title, and 48 upcoming titles. Local files, invitations, participants, private catalog IDs and playback settings are excluded."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "secondary",
					className: "min-h-11",
					onClick: exportFile,
					disabled: !exported || !exported.file.played.length && !exported.file.current && !exported.file.upcoming.length,
					children: "Download session file"
				}),
				exported && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs leading-5 text-muted",
					children: [
						"Export: ",
						exported.file.played.length,
						" played · ",
						exported.file.current ? 1 : 0,
						" current · ",
						exported.file.upcoming.length,
						" upcoming",
						exported.omitted ? ` · ${exported.omitted} local or unsupported entries omitted` : "",
						". Played lists recent room play requests observed during this visit, not completed watches or a complete history."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-fg",
					children: ["Preview a session file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						"aria-label": "Import session file",
						type: "file",
						accept: ".json,application/json",
						className: "mt-2 block min-h-11 w-full min-w-0 max-w-full rounded-md border border-border bg-bg p-2 text-xs",
						onChange: (e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							readFile(file);
						}
					})]
				}),
				busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs text-muted",
					children: "Reading session file…"
				}),
				loaded && preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Session import preview",
					className: "space-y-3 rounded-md border border-border bg-bg/50 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium text-fg",
							children: [
								loaded.file.played.length,
								" played · ",
								loaded.file.current ? 1 : 0,
								" current ·",
								" ",
								loaded.file.upcoming.length,
								" upcoming in file"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs leading-5 text-muted",
							children: [
								preview.media.length,
								" ready to append · ",
								preview.duplicates,
								" duplicates/already on stage or queued · ",
								loaded.unsupported,
								" unsupported provider entries ·",
								" ",
								loaded.invalid,
								" invalid entries · ",
								preview.unavailable,
								" unavailable identities ·",
								" ",
								preview.full,
								" held back by capacity · ",
								preview.slots,
								" queue slots free"
							]
						}),
						loaded.file.current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-words text-xs text-muted",
							children: ["File’s current title (context only): ", loaded.file.current.title]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-muted",
							children: "Only eligible upcoming titles are added to the end. Played/current titles, player position, play/pause and automatic-next settings are not restored. Links are validated locally; provider availability and embed permissions are not checked."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "max-h-64 space-y-2 overflow-y-auto text-xs text-fg",
							"aria-label": "Upcoming import titles",
							children: preview.media.slice(0, visible).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "break-words",
								children: [
									item.name,
									item.duration ? ` · ${Math.ceil(item.duration / 60)} min known runtime` : item.live ? " · live link" : " · runtime unknown",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: item.watchUrl,
										target: "_blank",
										rel: "noreferrer",
										className: "block min-h-11 break-all py-2 text-accent underline",
										children: item.watchUrl
									})
								]
							}, item.id))
						}),
						visible < preview.media.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "min-h-11",
							onClick: () => setVisible((n) => n + 12),
							children: "Show more import titles"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								className: "min-h-11",
								disabled: guest || !writable || busy || !preview.media.length,
								onClick: () => {
									if (guest || !writable || busy) return;
									if (onImport(loaded.file)) {
										setNotice("Session upcoming titles applied. Use Undo queue change to restore the previous queue. The current playback is unchanged.");
										setError("");
									}
								},
								children: "Append upcoming titles"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								className: "min-h-11",
								onClick: () => {
									readRevision.current++;
									setLoaded(void 0);
									setBusy(false);
									setError("");
									setNotice("Import preview cleared. The room was not changed.");
								},
								children: "Cancel session import"
							})]
						}),
						guest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-muted",
							children: "Only the host can apply a session file. Guests can preview or download one; existing chat and queue permissions stay in effect."
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "break-words text-xs leading-5 text-danger",
					children: error
				}),
				notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "break-words text-xs leading-5 text-accent",
					children: notice
				})
			]
		})]
	});
});
var ROOM_PLAYLISTS_KEY = "reelcase.watch-room.playlists.v1";
var MAX_BYTES = 16e5;
var roomPlaylistName = (value) => value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 64);
/** Named lists are personal browser data. Persist public identities, never
* another participant's catalog IDs, local files or transient room details. */
function roomPlaylist(id, name, values, updatedAt = Date.now()) {
	if (!/^[\w-]{1,96}$/.test(id) || !Number.isSafeInteger(updatedAt) || updatedAt <= 0) return;
	name = roomPlaylistName(name);
	const media = roomQueueDraft(values).media.flatMap((value) => {
		const video = resolveRoomMedia(value)?.video;
		return video ? [{
			...value,
			id: `room:${roomMediaKey(video)}`
		}] : [];
	});
	return name && media.length ? {
		id,
		name,
		updatedAt,
		media
	} : void 0;
}
/** Reject unreadable storage rather than silently replacing someone's lists. */
function readRoomPlaylists(raw) {
	if (raw === null) return [];
	if (raw.length > MAX_BYTES) return;
	try {
		const data = JSON.parse(raw);
		if (data?.version !== 1 || !Array.isArray(data.items) || data.items.length > 12) return;
		const items = [], ids = /* @__PURE__ */ new Set(), names = /* @__PURE__ */ new Set();
		for (const value of data.items) {
			if (!value || typeof value.id !== "string" || typeof value.name !== "string" || typeof value.updatedAt !== "number" || !Array.isArray(value.media)) return;
			const item = roomPlaylist(value.id, value.name, value.media, value.updatedAt);
			if (!item || ids.has(item.id) || names.has(item.name.toLowerCase())) return;
			ids.add(item.id);
			names.add(item.name.toLowerCase());
			items.push(item);
		}
		return items;
	} catch {
		return;
	}
}
function writeRoomPlaylists(items) {
	const clean = readRoomPlaylists(JSON.stringify({
		version: 1,
		items
	}));
	if (!clean) throw Error("Saved lists contain invalid or excessive data.");
	return JSON.stringify({
		version: 1,
		items: clean
	});
}
var readLists = () => {
	const items = readRoomPlaylists(localStorage.getItem(ROOM_PLAYLISTS_KEY));
	if (!items) throw Error("Saved lists could not be read. Existing saved data has been kept.");
	return items;
};
var RoomPlaylistsPanel = (0, import_react.memo)(function RoomPlaylistsPanel({ media, omitted, canAdd, suggesting, pending, full, onLoad }) {
	const [initial] = (0, import_react.useState)(() => {
		try {
			return {
				items: readLists(),
				error: ""
			};
		} catch {
			return {
				items: [],
				error: "Saved lists are unavailable. Browser storage may be blocked or unreadable."
			};
		}
	});
	const [items, setItems] = (0, import_react.useState)(initial.items);
	const [notice, setNotice] = (0, import_react.useState)(initial.error);
	const [name, setName] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)();
	const [renaming, setRenaming] = (0, import_react.useState)("");
	const [removed, setRemoved] = (0, import_react.useState)();
	const [previewing, setPreviewing] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		const update = (event) => {
			if (event.key !== "reelcase.watch-room.playlists.v1" && event.key !== null) return;
			try {
				setItems(readLists());
				setNotice("Saved lists updated from another tab.");
			} catch (error) {
				setNotice(error instanceof Error ? error.message : "Saved lists are unavailable.");
			}
		};
		window.addEventListener("storage", update);
		return () => window.removeEventListener("storage", update);
	}, []);
	const commit = (change, message) => {
		try {
			const next = change(readLists());
			localStorage.setItem(ROOM_PLAYLISTS_KEY, writeRoomPlaylists(next));
			setItems(next);
			setNotice(message);
			return true;
		} catch (error) {
			setNotice(error instanceof Error ? error.message : "Could not save lists. Your live queue is unchanged.");
			return false;
		}
	};
	const requireName = (value, latest, except) => {
		const clean = roomPlaylistName(value);
		if (!clean) throw Error("Enter a list name.");
		if (latest.some((item) => item.id !== except && item.name.toLowerCase() === clean.toLowerCase())) throw Error("That name already exists. Rename it or use Replace with queue to update it.");
		return clean;
	};
	const save = () => {
		if (!media.length) {
			setNotice("Queue a public YouTube or Twitch video before saving a list.");
			return;
		}
		if (commit((latest) => {
			if (latest.length >= 12) throw Error("All 12 list slots are in use. Update or remove a saved list first.");
			const item = roomPlaylist(createLocalId("list-"), requireName(name, latest), media);
			if (!item) throw Error("No public videos could be saved.");
			return [item, ...latest];
		}, "List saved in this browser. The playing video and live queue are unchanged.")) setName("");
	};
	const changeItem = (id, change, message) => commit((latest) => {
		if (!latest.some((item) => item.id === id)) throw Error("This list was removed in another tab.");
		return latest.map((item) => item.id === id ? change(item, latest) : item);
	}, message);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-4 border-t border-border pt-2",
		"aria-label": "Saved watch lists",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
				className: "flex min-h-11 cursor-pointer items-center gap-2 py-3 text-sm font-medium text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4 text-accent" }),
					"Saved watch lists · ",
					items.length
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: "Keep up to 12 named lists in this browser, with 48 public videos each. Add a list to the end of the queue without starting playback. Local files and the current video are excluded."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					save();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					maxLength: 64,
					onChange: (event) => setName(event.target.value),
					"aria-label": "New watch list name",
					placeholder: "Friday watch night",
					className: "min-w-0 flex-1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					size: "sm",
					variant: "secondary",
					className: "min-h-11",
					disabled: !media.length || items.length >= 12,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" }), "Save queue as list"]
				})]
			}),
			omitted > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted",
				children: [
					omitted,
					" local or unavailable title",
					omitted === 1 ? "" : "s",
					" will be omitted."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				"aria-live": "polite",
				className: "mt-2 break-words text-xs leading-5 text-accent",
				children: notice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 max-h-96 space-y-3 overflow-y-auto",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-room-playlist-id": item.id,
					className: "rounded-md border border-border bg-bg/45 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-words text-sm font-medium text-fg",
							children: item.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								item.media.length,
								" public video",
								item.media.length === 1 ? "" : "s"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "min-h-11",
									disabled: !canAdd || pending || full && !suggesting,
									onClick: () => {
										if (onLoad(item.media)) setNotice(suggesting ? "List sent for host review. Check Guest suggestions for approval." : "List submitted. Check the queue status for added, duplicate or full-queue counts.");
									},
									children: suggesting ? "Suggest list" : "Add list to queue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									onClick: () => {
										setEditing(item.id);
										setRenaming(item.name);
									},
									children: "Rename list"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									disabled: !media.length,
									onClick: () => changeItem(item.id, (current) => roomPlaylist(current.id, current.name, media), "Saved list replaced with the current public queue. Playback is unchanged."),
									children: "Replace with queue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									onClick: () => {
										let deleted;
										if (commit((latest) => {
											deleted = latest.find((value) => value.id === item.id);
											return latest.filter((value) => value.id !== item.id);
										}, "List removed from this browser. The live queue is unchanged.")) {
											setRemoved(deleted);
											if (editing === item.id) setEditing(void 0);
										}
									},
									children: "Remove list"
								})
							]
						}),
						editing === item.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-2 flex flex-wrap gap-2",
							onSubmit: (event) => {
								event.preventDefault();
								if (changeItem(item.id, (current, latest) => ({
									...current,
									name: requireName(renaming, latest, item.id),
									updatedAt: Date.now()
								}), "List renamed.")) setEditing(void 0);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Rename watch list",
									maxLength: 64,
									value: renaming,
									onChange: (event) => setRenaming(event.target.value),
									className: "min-w-0 flex-1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "min-h-11",
									children: "Save name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									onClick: () => setEditing(void 0),
									children: "Cancel rename"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-2",
							open: previewing === item.id,
							onToggle: (event) => {
								const open = event.currentTarget.open;
								setPreviewing((current) => open ? item.id : current === item.id ? void 0 : current);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "min-h-11 cursor-pointer py-3 text-xs text-muted",
								children: "View saved titles and links"
							}), previewing === item.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-1 text-xs text-fg",
								children: item.media.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "break-words",
									children: value.name
								}, value.id))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								"aria-label": `Saved links for ${item.name}`,
								readOnly: true,
								rows: 3,
								value: roomQueueLinks(item.media),
								onFocus: (event) => event.target.select(),
								className: "mt-2 w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-fg"
							})] })]
						})
					]
				}, item.id))
			}),
			!items.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "Save a public queue to prepare your next watch night."
			}),
			removed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				className: "mt-2 min-h-11",
				onClick: () => {
					if (commit((latest) => {
						if (latest.length >= 12) throw Error("Make room before restoring this list.");
						requireName(removed.name, latest);
						if (latest.some((item) => item.id === removed.id)) throw Error("This list has already been restored.");
						return [removed, ...latest];
					}, "Removed list restored.")) setRemoved(void 0);
				},
				children: "Undo removed list"
			}),
			!canAdd && items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Adding lists waits for a connected host with guest access enabled. You can still manage your saved lists."
			}),
			full && !suggesting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "The queue is full. Make room before adding a list."
			}),
			suggesting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Lists follow host review and suggestion limits. Check the submission result for videos held back."
			})
		]
	});
});
function roomVideoDuration(seconds) {
	if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "";
	const total = Math.floor(seconds), hours = Math.floor(total / 3600);
	return `${hours ? `${hours}:` : ""}${String(Math.floor(total / 60) % 60).padStart(hours ? 2 : 1, "0")}:${String(total % 60).padStart(2, "0")}`;
}
var RoomVideoSummary = (0, import_react.memo)(function RoomVideoSummary({ video, children, description = false }) {
	const poster = video.poster || (video.remote?.kind === "youtube" && video.remote.videoId ? `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg` : void 0);
	const [failed, setFailed] = (0, import_react.useState)();
	const date = video.remote?.publishedDate?.slice(0, 10) || video.remote?.publishedLabel;
	const provider = video.remote?.kind === "youtube" ? "YouTube" : video.remote?.kind === "twitch" ? "Twitch" : "Local video";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-surface sm:w-28",
			children: [poster && failed !== poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: poster,
				alt: "",
				loading: "lazy",
				decoding: "async",
				referrerPolicy: "no-referrer",
				className: "h-full w-full object-cover",
				onError: () => setFailed(poster)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-center justify-center text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "size-6" })
			}), (video.remote?.live || video.duration) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute bottom-1 right-1 rounded-sm bg-bg px-1 text-xs text-fg",
				children: video.remote?.live ? "LIVE" : roomVideoDuration(video.duration)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 break-words text-sm font-medium text-fg",
					title: video.name,
					children: video.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 break-words text-xs text-muted",
					children: [provider, video.remote?.channelName ? ` · ${video.remote.channelName}` : ""]
				}),
				(date || video.remote?.views !== void 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-subtle",
					children: [date, video.remote?.views !== void 0 ? `${new Intl.NumberFormat(void 0, { notation: "compact" }).format(video.remote.views)} views` : ""].filter(Boolean).join(" · ")
				}),
				description && video.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-2 break-words text-xs leading-5 text-muted",
					children: video.description
				})
			]
		})]
	});
});
var normalize = (text) => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
/** Search every playable title, yielding between slices and retaining only one
* visible page. Terms can match across title, creator, description and tags. */
async function roomSearchPage(videos, query, offset = 0, turn = yieldCatalogTask, eligible) {
	const terms = normalize(query.trim().slice(0, 160)).split(/\s+/).filter(Boolean).slice(0, 12);
	const start = Math.max(0, Math.min(videos.length, Math.floor(offset) || 0));
	if (!terms.length && !eligible) return {
		videos: videos.slice(start, start + 24),
		hasMore: videos.length > start + 24
	};
	const found = [];
	let matched = 0;
	for (let index = 0; index < videos.length;) {
		await turn();
		const end = Math.min(videos.length, index + 512), began = performance.now();
		for (; index < end; index++) {
			const video = videos[index];
			if (eligible && !eligible(video)) continue;
			const text = normalize(`${video.name} ${video.remote?.channelName ?? ""} ${video.genre ?? ""} ${video.tagline ?? ""} ${(video.description ?? "").slice(0, 2500)} ${(video.remote?.youtubeKeywords ?? []).slice(0, 32).join(" ")} ${Object.keys(video.remote?.youtubeTagSummary?.sources ?? {}).slice(0, 48).join(" ")}`);
			if (terms.every((term) => text.includes(term))) {
				if (matched++ >= start) found.push(video);
				if (found.length > 24) return {
					videos: found.slice(0, 24),
					hasMore: true
				};
			}
			if (performance.now() - began >= 4) {
				index++;
				break;
			}
		}
	}
	return {
		videos: found,
		hasMore: false
	};
}
var searchRoomYoutube = createServerFn({ method: "POST" }).validator(roomYoutubeSearchInput).handler(createSsrRpc("a9fbf7ab77502dc25415c97d05cc253be8ce3aab9920444d607b7989b3abcd3a"));
var RoomVideoSearch = (0, import_react.memo)(function RoomVideoSearch({ candidates, catalogPending, writable, canAdd, suggestMode, pending, full, queuedKeys, currentKey, onPlay, onAdd, hostCatalog, preferHost = false }) {
	const [query, setQuery] = (0, import_react.useState)(""), [source, setSource] = (0, import_react.useState)(preferHost ? "host" : "library");
	const [offset, setOffset] = (0, import_react.useState)(0), [local, setLocal] = (0, import_react.useState)({
		videos: [],
		hasMore: false
	});
	const [hostOffsets, setHostOffsets] = (0, import_react.useState)([0]);
	const [searching, setSearching] = (0, import_react.useState)(false), [online, setOnline] = (0, import_react.useState)(), [error, setError] = (0, import_react.useState)("");
	const [cursors, setCursors] = (0, import_react.useState)([void 0]), [page, setPage] = (0, import_react.useState)(0);
	const [hostRetry, setHostRetry] = (0, import_react.useState)(0);
	const request = (0, import_react.useRef)(void 0);
	(0, import_react.useEffect)(() => () => request.current?.abort(), []);
	(0, import_react.useEffect)(() => {
		if (source !== "host") return;
		setLocal({
			videos: [],
			hasMore: false
		});
		if (!hostCatalog?.connected) {
			setSearching(false);
			setError("Host browsing is unavailable. Wait for the host to connect or enable library browsing.");
			return;
		}
		const controller = new AbortController();
		request.current?.abort();
		request.current = controller;
		setSearching(true);
		setError("");
		const timer = window.setTimeout(() => {
			hostCatalog.search(query, offset, controller.signal).then((page) => {
				if (!controller.signal.aborted) setLocal(page);
			}).catch((cause) => {
				if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Host search failed.");
			}).finally(() => {
				if (!controller.signal.aborted) setSearching(false);
			});
		}, 300);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [
		source,
		hostCatalog,
		query,
		offset,
		hostRetry
	]);
	(0, import_react.useEffect)(() => {
		if (source !== "library" || catalogPending) return;
		const controller = new AbortController();
		setSearching(true);
		const timer = window.setTimeout(() => {
			roomSearchPage(candidates, query, offset, catalogTurn(controller.signal)).then((result) => {
				if (!controller.signal.aborted) {
					setLocal(result);
					setSearching(false);
				}
			}).catch(() => {
				if (!controller.signal.aborted) {
					setError("Library search could not finish. Try a shorter search.");
					setSearching(false);
				}
			});
		}, 160);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [
		source,
		candidates,
		catalogPending,
		query,
		offset
	]);
	const reset = (value) => {
		request.current?.abort();
		setQuery(value);
		setOffset(0);
		setHostOffsets([0]);
		setOnline(void 0);
		setCursors([void 0]);
		setPage(0);
		setError("");
		setSearching(source !== "youtube");
	};
	const runOnline = async (cursor, nextPage = 0) => {
		request.current?.abort();
		const controller = new AbortController();
		request.current = controller;
		setSearching(true);
		setError("");
		try {
			const result = await searchRoomYoutube({
				data: {
					query: query.trim(),
					cursor
				},
				signal: controller.signal
			});
			if (controller.signal.aborted) return;
			setOnline(result);
			setPage(nextPage);
			setCursors((values) => [...values.slice(0, nextPage), cursor]);
		} catch (cause) {
			if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "YouTube search is unavailable. Try again or paste a video link.");
		} finally {
			if (!controller.signal.aborted) setSearching(false);
		}
	};
	const videos = source !== "youtube" ? local.videos : online?.videos ?? [];
	const busy = searching || source === "library" && catalogPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Find room videos",
		className: "mt-4 border-t border-border pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
				className: "flex items-center gap-2 font-medium text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-accent" }), "Find videos"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				"aria-label": "Video search source",
				children: [
					hostCatalog && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: source === "host" ? "default" : "secondary",
						className: "min-h-11",
						"aria-pressed": source === "host",
						onClick: () => {
							request.current?.abort();
							setSearching(false);
							setError("");
							setOffset(0);
							setHostOffsets([0]);
							setSource("host");
						},
						children: "Host library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: source === "library" ? "default" : "secondary",
						className: "min-h-11",
						"aria-pressed": source === "library",
						onClick: () => {
							request.current?.abort();
							setSearching(false);
							setError("");
							setOffset(0);
							setSource("library");
						},
						children: "My library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: source === "youtube" ? "default" : "secondary",
						className: "min-h-11",
						"aria-pressed": source === "youtube",
						onClick: () => {
							request.current?.abort();
							setSearching(false);
							setError("");
							setSource("youtube");
						},
						children: "YouTube search"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					if (source === "youtube" && query.trim() && !busy) runOnline();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "min-w-0 flex-1 basis-48",
					value: query,
					onChange: (event) => reset(event.target.value),
					maxLength: 160,
					placeholder: source !== "youtube" ? "Title, creator, topic or video tags" : "Search public YouTube videos",
					"aria-label": "Search room videos"
				}), source === "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "min-h-11",
					disabled: !query.trim() || busy,
					type: "submit",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), "Search YouTube"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: source === "host" ? "Find videos in the host’s library even when your own library is empty. Only this result page is sent to your device. Queue a title for everyone; the host confirms the order." : source === "library" ? `Search all ${candidates.length.toLocaleString()} playable library videos by title, creator, description or tags. Results update as you type.` : "Search public YouTube without following a channel. Results stay in this room until you queue or play one. Press Search YouTube to send your query."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "status",
				"aria-live": "polite",
				className: "mt-2 text-xs text-accent",
				children: busy ? catalogPending && source === "library" ? "Preparing playable videos…" : "Searching videos…" : error || `${videos.length} result${videos.length === 1 ? "" : "s"}${source === "host" ? ` · page ${hostOffsets.length}` : source === "library" ? ` · page ${Math.floor(offset / 24) + 1}` : online ? ` · page ${page + 1}` : ""}`
			}),
			source === "host" && error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				className: "mt-2 min-h-11",
				disabled: !hostCatalog?.connected || busy,
				onClick: () => setHostRetry((value) => value + 1),
				children: "Retry host search"
			}),
			source === "youtube" && !!query.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				className: "mt-2 inline-flex min-h-11 items-center gap-1 text-xs text-accent",
				href: `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`,
				target: "_blank",
				rel: "noreferrer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" }), "Open this search on YouTube"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"aria-label": "Room video search results",
				"aria-busy": busy,
				className: "mt-3 max-h-128 space-y-3 overflow-y-auto",
				children: videos.map((video) => {
					const key = roomMediaKey(video), queued = queuedKeys.has(key), current = currentKey === key;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						"data-room-result-id": video.id,
						className: "rounded-md bg-bg/50 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomVideoSummary, {
							video,
							description: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 min-w-0 flex-1 text-left text-sm font-medium text-fg hover:text-accent disabled:opacity-60",
									"aria-label": video.name,
									title: video.name,
									onClick: () => onPlay(video),
									disabled: !writable || busy || pending,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "line-clamp-3 break-words",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
											"aria-hidden": "true",
											className: "mr-1 inline size-3"
										}), video.name]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "min-h-11 shrink-0",
									"aria-label": suggestMode ? `Suggest ${video.name}` : void 0,
									disabled: !canAdd || busy || pending || suggestMode && !video.remote || queued || current || !suggestMode && full,
									onClick: () => onAdd(video),
									children: suggestMode ? "Suggest" : "Queue"
								})]
							})
						}), (queued || current) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-accent",
							children: current ? "Playing now" : "Already in the queue"
						})]
					}, key);
				})
			}),
			!videos.length && !busy && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted",
				children: source === "youtube" && !online ? "Type a title, creator or topic, then search YouTube." : "No playable videos match. Try fewer words or another creator."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap justify-between gap-2",
				"aria-label": "Search result pages",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "secondary",
					className: "min-h-11",
					disabled: busy || (source !== "youtube" ? offset === 0 : page === 0),
					onClick: () => {
						if (source === "host") {
							const previous = hostOffsets.slice(0, -1);
							setHostOffsets(previous.length ? previous : [0]);
							setOffset(previous.at(-1) ?? 0);
						} else if (source === "library") setOffset((value) => Math.max(0, value - 24));
						else runOnline(cursors[page - 1], page - 1);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" }), "Previous results"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "secondary",
					className: "min-h-11",
					disabled: busy || (source !== "youtube" ? !local.hasMore : !online?.cursor || cursors.includes(online.cursor) || page >= 19),
					onClick: () => {
						if (source === "host") {
							const next = local.nextOffset ?? offset + local.videos.length;
							if (next <= offset) return;
							setHostOffsets((values) => [...values, next]);
							setOffset(next);
						} else if (source === "library") setOffset((value) => value + 24);
						else runOnline(online?.cursor, page + 1);
					},
					children: ["More results", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
				})]
			})
		]
	});
});
var RoomQueuePanel = (0, import_react.memo)(function RoomQueuePanel({ candidates, queue, currentId, currentMediaKey, guest, notice, pending = 0, autoAdvance, onAutoAdvance, onSelect, onAdd, onChange, onEdit, onClear, onNext, onShuffle, onLink, catalogPending = false, writable = true, suggesting = false, reviewMode = false, onReviewMode, guestEditing = true, onGuestEditing, onUndo, canUndo = false, onRestore, savedCount = 0, currentTitle, onLoadList, hostCatalog, preferHost, currentMedia, playedMedia, onImportSession }) {
	const [link, setLink] = (0, import_react.useState)("");
	const suggestMode = guest && reviewMode;
	const canAdd = writable || suggesting;
	const [queueSearch, setQueueSearch] = (0, import_react.useState)("");
	const [selecting, setSelecting] = (0, import_react.useState)(false);
	const [selection, setSelection] = (0, import_react.useState)([]);
	const [moving, setMoving] = (0, import_react.useState)();
	const [exportNotice, setExportNotice] = (0, import_react.useState)("");
	const selected = queue.filter((row) => selection.includes(row.id)).map((row) => row.id);
	const matches = (video) => !queueSearch.trim() || `${video?.name ?? ""} ${video?.remote?.channelName ?? ""}`.toLowerCase().includes(queueSearch.trim().toLowerCase());
	const visibleIds = queue.filter((row) => matches(row.video)).map((row) => row.id);
	const publicMedia = (0, import_react.useMemo)(() => queue.flatMap((row) => {
		const media = describeRoomMedia(row.video);
		return media ? [media] : [];
	}).filter((media) => media.kind !== "local"), [queue]);
	const sessionMedia = (0, import_react.useMemo)(() => queue.map((row) => describeRoomMedia(row.video)), [queue]);
	const exportedLinks = (0, import_react.useMemo)(() => roomQueueLinks(publicMedia), [publicMedia]);
	const publicCount = exportedLinks ? exportedLinks.split("\n").length : 0;
	const applySelection = (kind) => {
		if (selected.length && onEdit({
			kind,
			ids: selected
		})) setSelection([]);
	};
	const copyLinks = async () => {
		try {
			await navigator.clipboard.writeText(exportedLinks);
			setExportNotice(`${publicCount} public links copied in queue order.`);
		} catch {
			setExportNotice("Copy is unavailable here. Select the links below and copy them, or download the queue.");
		}
	};
	const downloadLinks = () => {
		try {
			const url = URL.createObjectURL(new Blob([exportedLinks + "\n"], { type: "text/plain;charset=utf-8" }));
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = "watch-together-queue.txt";
			document.body.append(anchor);
			anchor.click();
			anchor.remove();
			window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
			setExportNotice("Queue downloaded. Paste its links into Add videos to reuse it.");
		} catch {
			setExportNotice("The download could not start. You can select and copy the links below.");
		}
	};
	const pasted = (0, import_react.useMemo)(() => link.trim() ? parseRoomLinks(link) : void 0, [link]);
	const queuedKeys = new Set(queue.flatMap((row) => row.video ? [roomMediaKey(row.video)] : []));
	const knownSeconds = queue.reduce((sum, row) => sum + (row.video?.remote?.live || !Number.isFinite(row.video?.duration) ? 0 : Math.min(43200, Math.max(0, row.video?.duration ?? 0))), 0);
	const unknownDuration = queue.filter((row) => !Number.isFinite(row.video?.duration) || (row.video?.duration ?? 0) <= 0 || row.video?.remote?.live).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-border bg-elevated p-4 shadow-border",
		"aria-label": "Room query and queue",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-accent uppercase",
					children: "Watch queue"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					tabIndex: -1,
					className: "mt-1 font-display text-xl text-fg",
					children: "Up next for everyone"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded-full bg-accent/15 px-2 py-1 text-xs text-accent",
					children: [
						queue.length,
						" / ",
						48,
						" queued"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-md border border-border bg-bg/50 p-3",
				"aria-label": "Room current video",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "On the stage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 break-words text-sm font-medium text-fg",
						children: currentTitle || "Choose a video to start watching"
					}),
					queue[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 break-words text-xs text-accent",
						children: ["Next: ", queue[0].video?.name ?? "Waiting for title details…"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: queue.length ? `${Math.ceil(knownSeconds / 60)} min of known runtime${unknownDuration ? ` · ${unknownDuration} live or unknown-length title${unknownDuration === 1 ? "" : "s"}` : ""}` : "Your queue is ready for links or library videos."
			}),
			guest && !writable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs leading-5 text-accent",
				children: suggesting ? "Review mode: suggest public videos below. The host approves additions; live queue edits and video selection are host-controlled." : guestEditing ? "Waiting for the host connection. The last confirmed queue stays visible." : "The host has locked queue edits and video selection. Chat and playback timing still work."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium text-fg",
							children: ["Up next · ", guest ? "host confirms changes" : "shared order"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									disabled: !selecting && (!writable || !queue.length),
									"aria-pressed": selecting,
									onClick: () => {
										setSelecting(!selecting);
										setSelection([]);
										setMoving(void 0);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "size-3" }), selecting ? "Done selecting" : "Select titles"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									className: "min-h-11",
									disabled: !writable || !queue.length || guest && pending > 0,
									onClick: onNext,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), guest ? "Request next" : "Play next"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									disabled: !writable || queue.length < 2,
									onClick: onShuffle,
									"aria-label": guest ? "Request queue shuffle" : "Shuffle queue",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3" }), "Shuffle"]
								}),
								!guest && queue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: onClear,
									children: "Clear queue"
								}),
								!guest && onUndo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									disabled: !canUndo,
									onClick: onUndo,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-3" }), "Undo queue change"]
								})
							]
						})]
					}),
					!guest && !queue.length && savedCount > 0 && !canUndo && onRestore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-md border border-border bg-bg/50 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							onClick: onRestore,
							children: ["Restore saved queue · ", savedCount]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: "Restores public links from this browser. Local files need to be selected again. Playback starts when you choose Play next."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "status",
						"aria-live": "polite",
						className: "mt-2 text-xs text-accent",
						children: [pending > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mb-1 block",
							children: [
								pending,
								" change",
								pending === 1 ? "" : "s",
								" awaiting host confirmation · retrying automatically"
							]
						}), notice || (guest ? "Queue changes go to the host; everyone sees the confirmed order." : "Queue order is shared with every guest.")]
					}),
					(queue.length > 5 || !!queueSearch) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-3",
						value: queueSearch,
						onChange: (event) => setQueueSearch(event.target.value),
						"aria-label": "Find a queued title",
						placeholder: "Find in this queue"
					}),
					selecting && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-md border border-accent/35 bg-accent/5 p-3",
						"aria-label": "Selected queue controls",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								role: "status",
								className: "text-sm font-medium text-fg",
								children: [
									selected.length,
									" selected",
									selected.some((id) => !visibleIds.includes(id)) ? " · includes filtered titles" : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "min-h-11",
										disabled: !writable || !visibleIds.length,
										onClick: () => setSelection([.../* @__PURE__ */ new Set([...selected, ...visibleIds])]),
										children: "Select visible titles"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "min-h-11",
										disabled: !selected.length,
										onClick: () => setSelection([]),
										children: "Clear selection"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "min-h-11",
										disabled: !writable || !selected.length || guest && pending > 0,
										onClick: () => applySelection("next"),
										children: "Queue selected next"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "min-h-11",
										disabled: !writable || !selected.length || guest && pending > 0,
										onClick: () => applySelection("end"),
										children: "Move selected to end"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "min-h-11",
										disabled: !writable || !selected.length || guest && pending > 0,
										onClick: () => applySelection("remove"),
										children: "Remove selected"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: ["Moves preserve the host’s latest order within your selection. Playing videos stay on stage. ", guest ? "The host confirms each batch." : "Undo restores the whole batch."]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						"aria-label": "Shared upcoming titles",
						tabIndex: 0,
						className: "mt-3 max-h-128 space-y-3 overflow-y-auto overscroll-contain",
						children: queue.map(({ id, video }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							"data-room-queue-id": id,
							hidden: !matches(video),
							className: `rounded-md border p-3 ${index === 0 ? "border-accent/35 bg-accent/5" : "border-transparent bg-bg/45"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-w-0 items-center gap-2",
									children: [
										selecting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "flex min-h-11 min-w-11 items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												"aria-label": `Select ${video?.name ?? id} for queue changes`,
												checked: selected.includes(id),
												disabled: !writable,
												onChange: (event) => setSelection(event.target.checked ? [...selected, id] : selected.filter((value) => value !== id))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent",
											"aria-label": `Position ${index + 1}`,
											children: index + 1
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "min-w-0 flex-1",
											children: video ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomVideoSummary, { video }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted",
												children: "Waiting for title details…"
											})
										})
									]
								}),
								index === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs font-medium text-accent",
									children: "Up next"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "secondary",
											className: "min-h-11",
											disabled: !writable || !video || guest && pending > 0,
											onClick: () => video && onSelect(video),
											"aria-label": `${guest ? "Request playback of" : "Play"} ${video?.name ?? id}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), guest ? "Request play" : "Play"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "min-h-11",
											disabled: !writable || index === 0,
											"aria-label": `Queue ${video?.name ?? id} next`,
											onClick: () => onChange({
												kind: "next",
												id
											}),
											children: "Next"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "min-h-11",
											disabled: !writable || queue.length < 2,
											"aria-expanded": moving?.id === id,
											"aria-label": `Change position of ${video?.name ?? id}`,
											onClick: () => setMoving(moving?.id === id ? void 0 : {
												id,
												before: queue[index + 1]?.id ?? ""
											}),
											children: "Move to…"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "min-h-11 min-w-11",
											disabled: !writable || index === 0,
											"aria-label": `Move ${video?.name ?? id} up`,
											onClick: () => onChange({
												kind: "up",
												id
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "min-h-11 min-w-11",
											disabled: !writable || index === queue.length - 1,
											"aria-label": `Move ${video?.name ?? id} down`,
											onClick: () => onChange({
												kind: "down",
												id
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "min-h-11 min-w-11",
											"aria-label": `Remove ${video?.name ?? id} from queue`,
											disabled: !writable,
											onClick: () => onChange({
												kind: "remove",
												id
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
										})
									]
								}),
								moving?.id === id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "mt-2 flex flex-wrap items-center gap-2",
									"aria-label": `Move ${video?.name ?? id} to position`,
									onSubmit: (event) => {
										event.preventDefault();
										if (writable) {
											onChange({
												kind: "move",
												id,
												before: moving.before || void 0
											});
											setMoving(void 0);
										}
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex min-h-11 items-center gap-2 text-xs text-muted",
											children: ["Position", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												"aria-label": `New position for ${video?.name ?? id}`,
												className: "min-h-11 max-w-48 rounded-sm border border-border bg-surface px-2 text-sm text-fg",
												disabled: !writable,
												value: queue.some((row) => row.id === moving.before) ? moving.before : "",
												onChange: (event) => setMoving({
													id,
													before: event.target.value
												}),
												children: [queue.filter((row) => row.id !== id).map((row, target) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: row.id,
													children: [
														target + 1,
														" · before ",
														row.video?.name ?? "waiting title"
													]
												}, row.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: "",
													children: [queue.length, " · end of queue"]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											size: "sm",
											variant: "secondary",
											className: "min-h-11",
											disabled: !writable || guest && pending > 0,
											children: "Apply position"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											size: "sm",
											variant: "ghost",
											className: "min-h-11",
											onClick: () => setMoving(void 0),
											children: "Cancel move"
										})
									]
								})
							]
						}, id))
					}),
					!!queue.length && !!queueSearch.trim() && !queue.some((row) => `${row.video?.name ?? ""} ${row.video?.remote?.channelName ?? ""}`.toLowerCase().includes(queueSearch.trim().toLowerCase())) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted",
						children: "No queued titles match. Clear this filter to see the full order."
					}),
					!queue.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted",
						children: "Add links below or search your library. YouTube and Twitch entries carry their own playback details."
					})
				]
			}),
			!guest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex min-h-11 items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: autoAdvance,
					onChange: (event) => onAutoAdvance(event.target.checked),
					"aria-label": "Automatically play next queued title"
				}), "Automatically play next when this video ends"]
			}),
			!guest && onGuestEditing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-1 flex min-h-11 items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: guestEditing,
					onChange: (event) => onGuestEditing(event.target.checked),
					"aria-label": "Allow guests to edit queue and select videos"
				}), "Allow guests to edit the queue and select videos"]
			}),
			!guest && onReviewMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2 text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: reviewMode,
						onChange: (event) => onReviewMode(event.target.checked),
						"aria-label": "Review guest additions before queuing"
					}), "Review guest additions before queuing"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "When guest access is enabled, review mode permits public video suggestions instead of direct queue edits or video selection. Existing requests remain until approved or dismissed."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomSessionFilePanel, {
				current: currentMedia,
				played: playedMedia,
				queue: sessionMedia,
				guest,
				writable,
				onImport: onImportSession
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomPlaylistsPanel, {
				media: publicMedia,
				omitted: queue.length - publicCount,
				canAdd,
				suggesting: suggestMode,
				pending: guest && pending > 0,
				full: queue.length >= 48,
				onLoad: onLoadList
			}),
			!!queue.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-4 border-t border-border pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "min-h-11 cursor-pointer py-3 text-sm font-medium text-fg",
						children: ["Save or share queue links · ", publicCount]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-5 text-muted",
						children: [
							"Exports upcoming public links in their confirmed order. Paste them into Add videos in any room. ",
							queue.length - publicCount > 0 && `${queue.length - publicCount} local or unavailable title${queue.length - publicCount === 1 ? "" : "s"} omitted.`,
							" The current video and room invitation are separate."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							disabled: !publicCount,
							onClick: copyLinks,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3" }), "Copy queue links"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							className: "min-h-11",
							disabled: !publicCount,
							onClick: downloadLinks,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), "Download queue"]
						})]
					}),
					!!publicCount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						readOnly: true,
						rows: 3,
						"aria-label": "Exported queue links",
						className: "mt-2 w-full rounded-sm border border-border bg-surface px-3 py-2 text-xs text-fg",
						value: exportedLinks,
						onFocus: (event) => event.target.select()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "mt-2 text-xs text-accent",
						children: exportNotice
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				open: true,
				className: "mt-5 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer py-3 text-sm font-medium text-fg",
						children: "Add videos from links or your library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 space-y-2",
						onSubmit: (event) => {
							event.preventDefault();
							if (onLink(link) && !guest) setLink("");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								"aria-label": "Public video link",
								placeholder: "Paste YouTube or Twitch links, one per line",
								rows: 2,
								maxLength: 32768,
								className: "min-h-20 w-full resize-y rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
								value: link,
								onChange: (event) => setLink(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "sm",
								variant: "secondary",
								className: "min-h-11",
								disabled: !canAdd || !link.trim() || !suggestMode && queue.length >= 48 || suggestMode && pending > 0,
								children: suggestMode ? "Suggest links" : "Add link to queue"
							}),
							pasted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs leading-5 text-muted",
								children: [
									pasted.videos.length,
									" valid link",
									pasted.videos.length === 1 ? "" : "s",
									pasted.duplicates ? ` · ${pasted.duplicates} repeated` : "",
									pasted.invalid ? ` · ${pasted.invalid} invalid` : "",
									pasted.truncated ? " · first 48 checked" : ""
								]
							}),
							guest && link && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								className: "ml-2 min-h-11",
								onClick: () => setLink(""),
								children: "Clear pasted links"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs leading-5 text-muted",
								children: [
									"Paste up to 48 links in one batch, even with an empty library. Local files play from the host.",
									guest && " Your pasted links stay here until you clear them.",
									suggestMode && " Suggestions wait for host review and do not change the live queue. Up to 8 pending per guest connection."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomVideoSearch, {
						candidates,
						catalogPending,
						writable,
						canAdd,
						suggestMode,
						pending: pending > 0,
						full: queue.length >= 48,
						queuedKeys,
						currentKey: currentMediaKey,
						onPlay: onSelect,
						onAdd,
						hostCatalog,
						preferHost
					})
				]
			})
		]
	});
});
var RoomRecentPanel = (0, import_react.memo)(function RoomRecentPanel({ media, currentKey, queuedKeys, writable, guest, pending, full, onPlay, onQueue }) {
	const rows = (0, import_react.useMemo)(() => media.flatMap((value) => {
		const video = resolveRoomMedia(value)?.video;
		return video ? [video] : [];
	}), [media]).filter((video) => roomMediaKey(video) !== currentKey);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Recently played in this room",
		className: "rounded-lg border border-border bg-elevated p-4 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "flex items-center gap-2 text-sm font-medium text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-accent" }), "Recently played"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Return to a skipped video or add it back without changing what’s playing. Up to 12 public videos from this room session; local files are excluded."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 max-h-72 space-y-2 overflow-y-auto",
				children: rows.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-bg/45 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-words text-sm text-fg",
						children: video.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							disabled: !writable || guest && pending > 0,
							onClick: () => onPlay(video),
							"aria-label": `${guest ? "Request replay of" : "Replay"} ${video.name}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), guest ? "Request replay" : "Replay"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							className: "min-h-11",
							disabled: !writable || full || queuedKeys.includes(roomMediaKey(video)) || guest && pending > 0,
							onClick: () => onQueue(video),
							"aria-label": `Requeue ${video.name}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" }), queuedKeys.includes(roomMediaKey(video)) ? "Already queued" : "Queue again"]
						})]
					})]
				}, roomMediaKey(video)))
			}),
			!rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted",
				children: "Public videos appear here when the host switches to another title."
			})
		]
	});
});
function hostCatalogPayload(videos, offset, hasMore) {
	const media = [];
	let bytes = 0;
	for (const video of videos.slice(0, 24)) {
		const descriptor = describeRoomMedia(video);
		if (!descriptor) break;
		const size = new TextEncoder().encode(JSON.stringify(descriptor)).length;
		if (bytes + size > 24e3) break;
		bytes += size;
		media.push(descriptor);
	}
	return {
		media,
		nextOffset: offset + media.length,
		hasMore: hasMore || media.length < videos.length
	};
}
function readHostCatalogQuery(value) {
	if (!value || typeof value !== "object") return;
	const row = value;
	if (typeof row.requestId !== "string" || !row.requestId || row.requestId.length > 100 || typeof row.query !== "string" || row.query.length > 160 || typeof row.offset !== "number" || !Number.isSafeInteger(row.offset) || row.offset < 0 || row.offset > 1e7) return;
	return {
		requestId: row.requestId,
		query: row.query.trim(),
		offset: row.offset
	};
}
function readHostCatalogPage(value) {
	if (!value || typeof value !== "object") return;
	const row = value;
	if (!Array.isArray(row.media) || row.media.length > 24 || typeof row.hasMore !== "boolean") return;
	const videos = [];
	const seen = /* @__PURE__ */ new Set();
	for (const media of row.media) {
		const video = resolveRoomMedia(media)?.video;
		if (!video || seen.has(video.id)) return;
		seen.add(video.id);
		videos.push(video);
	}
	if (row.nextOffset !== void 0 && (typeof row.nextOffset !== "number" || !Number.isSafeInteger(row.nextOffset) || row.nextOffset < 0 || row.nextOffset > 1e7)) return;
	return {
		videos,
		hasMore: row.hasMore,
		nextOffset: row.nextOffset
	};
}
function useRoomHostCatalog({ transport, room, guest, hostId, candidates, preparing, shared, localTitles }) {
	const { send, onMessage } = transport, peers = (0, import_react.useRef)(transport.peers);
	peers.current = transport.peers;
	const waiting = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [enabled, setEnabled] = (0, import_react.useState)(true), [version, setVersion] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (guest || !room) return;
		send({
			type: "host-catalog-status",
			enabled: shared,
			localTitles
		});
	}, [
		guest,
		room,
		shared,
		localTitles,
		candidates,
		preparing,
		transport.readyRevision,
		send
	]);
	(0, import_react.useEffect)(() => {
		if (guest || !room) return;
		const jobs = /* @__PURE__ */ new Map(), receipts = /* @__PURE__ */ new Map();
		const off = onMessage((from, raw) => {
			const packet = raw;
			if (!peers.current.some((peer) => peer.id === from && peer.connectionState === "connected")) return;
			if (packet?.type === "host-catalog-cancel" && jobs.get(from)?.id === packet.requestId) {
				jobs.get(from)?.controller.abort();
				jobs.delete(from);
				return;
			}
			if (packet?.type !== "host-catalog-search") return;
			const request = readHostCatalogQuery(packet);
			if (!request) return;
			const key = `${from}:${request.requestId}`;
			if (receipts.has(key)) {
				send(receipts.get(key), from);
				return;
			}
			if (jobs.get(from)?.id === request.requestId) return;
			jobs.get(from)?.controller.abort();
			const controller = new AbortController();
			jobs.set(from, {
				id: request.requestId,
				controller
			});
			const reply = (data) => {
				if (controller.signal.aborted) return;
				const packet = {
					type: "host-catalog-result",
					requestId: request.requestId,
					...data
				};
				receipts.set(key, packet);
				while (receipts.size > 16) receipts.delete(receipts.keys().next().value);
				send(packet, from);
				jobs.delete(from);
			};
			if (!shared) {
				reply({ error: "The host has turned off library browsing." });
				return;
			}
			if (preparing) {
				reply({ error: "The host is preparing its playable library. Try this search again in a moment." });
				return;
			}
			roomSearchPage(candidates, request.query, request.offset, catalogTurn(controller.signal), (video) => Boolean(video.remote) || localTitles).then((page) => reply(hostCatalogPayload(page.videos, request.offset, page.hasMore))).catch(() => {
				if (!controller.signal.aborted) reply({ error: "The host could not finish this search. Try again." });
			});
		});
		return () => {
			off();
			for (const job of jobs.values()) job.controller.abort();
		};
	}, [
		guest,
		room,
		candidates,
		preparing,
		shared,
		localTitles,
		onMessage,
		send
	]);
	(0, import_react.useEffect)(() => {
		setEnabled(true);
		const off = onMessage((from, raw) => {
			if (!guest || !hostId || from !== hostId) return;
			const packet = raw;
			if (packet?.type === "host-catalog-status") {
				setEnabled(packet.enabled !== false);
				setVersion((value) => value + 1);
			}
			if (packet?.type !== "host-catalog-result" || typeof packet.requestId !== "string") return;
			const entry = waiting.current.get(packet.requestId);
			if (!entry) return;
			entry.cleanup();
			if (typeof packet.error === "string") {
				entry.reject(Error(packet.error.slice(0, 240)));
				return;
			}
			const page = readHostCatalogPage(packet);
			if (!page) {
				entry.reject(Error("The host returned an unreadable result page."));
				return;
			}
			entry.resolve(page);
		});
		return () => {
			off();
			for (const entry of [...waiting.current.values()]) {
				entry.cleanup();
				entry.reject(Error("The host connection changed. Search again when it reconnects."));
			}
		};
	}, [
		guest,
		hostId,
		room,
		onMessage
	]);
	const connected = Boolean(guest && hostId && transport.peers.some((peer) => peer.id === hostId && peer.connectionState === "connected"));
	const search = (0, import_react.useCallback)((query, offset, signal) => new Promise((resolve, reject) => {
		if (signal.aborted) {
			reject(Error("Search cancelled."));
			return;
		}
		if (!connected || !enabled) {
			reject(Error(enabled ? "Waiting for the host connection." : "The host has turned off library browsing."));
			return;
		}
		if (waiting.current.size >= 4) {
			reject(Error("Wait for the current host search to finish."));
			return;
		}
		const requestId = createLocalId("catalog-");
		const cleanup = () => {
			window.clearTimeout(timer);
			signal.removeEventListener("abort", cancel);
			waiting.current.delete(requestId);
		};
		const cancel = () => {
			cleanup();
			send({
				type: "host-catalog-cancel",
				requestId
			}, hostId);
			reject(Error("Search cancelled."));
		};
		const timer = window.setTimeout(() => {
			cleanup();
			send({
				type: "host-catalog-cancel",
				requestId
			}, hostId);
			reject(Error("The host did not answer. Check the connection and try again."));
		}, 8e3);
		waiting.current.set(requestId, {
			resolve,
			reject,
			cleanup
		});
		signal.addEventListener("abort", cancel, { once: true });
		send({
			type: "host-catalog-search",
			requestId,
			query: query.slice(0, 160),
			offset
		}, hostId);
	}), [
		connected,
		enabled,
		hostId,
		send,
		version
	]);
	return (0, import_react.useMemo)(() => ({
		connected: connected && enabled,
		search
	}), [
		connected,
		enabled,
		search
	]);
}
var RoomWatchHistoryPanel = (0, import_react.memo)(function RoomWatchHistoryPanel({ entries, writable, full, guest, pending, queuedKeys, onPlay, onQueue, onClear, notice }) {
	const [query, setQuery] = (0, import_react.useState)(""), [limit, setLimit] = (0, import_react.useState)(12);
	const rows = (0, import_react.useMemo)(() => entries.flatMap((entry) => {
		const video = resolveRoomMedia(entry.media)?.video;
		return video && `${video.name} ${video.remote?.channelName ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()) ? [{
			...entry,
			video
		}] : [];
	}), [entries, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Watch Together history",
		className: "rounded-lg border border-border bg-elevated p-4 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					tabIndex: -1,
					className: "flex items-center gap-2 font-medium text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-accent" }), "Your watch history"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted",
					children: [entries.length, " saved"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Your last 80 public videos watched in Watch Together, including the current video. Saved on this browser across rooms and reloads. Local files stay private and are excluded."
			}),
			!!entries.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-3",
				"aria-label": "Search watch history",
				placeholder: "Find a watched video or creator",
				value: query,
				onChange: (event) => {
					setQuery(event.target.value);
					setLimit(12);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 max-h-96 space-y-3 overflow-y-auto",
				"aria-label": "Saved watched videos",
				children: rows.slice(0, limit).map(({ media, video, watchedAt }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-bg/45 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomVideoSummary, { video }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-subtle",
							children: ["Watched ", new Date(watchedAt).toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								className: "min-h-11",
								disabled: !writable || guest && pending > 0,
								onClick: () => onPlay(video),
								"aria-label": `Watch again ${media.name}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), "Watch again"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "ghost",
								className: "min-h-11",
								disabled: !writable || full || queuedKeys.includes(roomMediaKey(video)) || guest && pending > 0,
								onClick: () => onQueue(video),
								"aria-label": `Queue from history ${media.name}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" }), queuedKeys.includes(roomMediaKey(video)) ? "Already queued" : "Queue"]
							})]
						})
					]
				}, roomMediaKey(video)))
			}),
			!rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted",
				children: entries.length ? "No watched videos match." : "Start a public video in the room to save it here."
			}),
			rows.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				className: "mt-3 min-h-11",
				onClick: () => setLimit((value) => value + 12),
				children: "Show more history"
			}),
			!!entries.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				className: "mt-3 min-h-11",
				onClick: onClear,
				children: "Clear my room history"
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs text-accent",
				children: notice
			})
		]
	});
});
var ROOM_HISTORY_KEY = "reelcase.watch-room.history.v1";
function cleanRoomHistory(values) {
	if (!Array.isArray(values)) return [];
	const rows = [], seen = /* @__PURE__ */ new Set();
	for (const value of values.slice(0, 160)) {
		if (!value || typeof value !== "object") continue;
		const { media, watchedAt } = value;
		const resolved = resolveRoomMedia(media);
		if (!resolved?.video?.remote || typeof watchedAt !== "number" || !Number.isFinite(watchedAt) || watchedAt <= 0 || watchedAt > Date.now() + 6e4) continue;
		const key = roomMediaKey(resolved.video);
		if (seen.has(key)) continue;
		seen.add(key);
		rows.push({
			media: describeRoomMedia(resolved.video),
			watchedAt
		});
		if (rows.length === 80) break;
	}
	return rows;
}
function readRoomHistory(raw) {
	if (!raw || raw.length > 256e3) return [];
	try {
		const data = JSON.parse(raw);
		return data.version === 1 ? cleanRoomHistory(data.entries) : [];
	} catch {
		return [];
	}
}
function rememberRoomVideo(entries, media, watchedAt = Date.now()) {
	return cleanRoomHistory([{
		media,
		watchedAt
	}, ...entries]);
}
function acceptsRoomReviewRevision(current, value) {
	const revision = value === void 0 ? 0 : value;
	return typeof revision === "number" && Number.isSafeInteger(revision) && revision >= 0 && revision >= current;
}
function readRoomSuggestions(value) {
	if (!Array.isArray(value)) return [];
	const seen = /* @__PURE__ */ new Set();
	return value.slice(0, 24).flatMap((entry) => {
		if (!entry || typeof entry !== "object" || typeof entry.peer !== "string" || !entry.peer || entry.peer.length > 160) return [];
		const resolved = resolveRoomMedia(entry.media);
		if (!resolved?.video?.remote) return [];
		const id = roomMediaKey(resolved.video);
		if (seen.has(id)) return [];
		seen.add(id);
		const { poster: _poster, ...media } = describeRoomMedia(resolved.video);
		return [{
			id,
			media,
			peer: entry.peer,
			name: (typeof entry.name === "string" ? entry.name : "Guest").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 64) || "Guest"
		}];
	});
}
/** Review never mutates the live queue. Canonical identity, not device IDs,
* deduplicates pending requests and titles already playing or queued. */
function addRoomSuggestions(current, values, peer, name, excludedKeys) {
	const items = readRoomSuggestions(current), seen = /* @__PURE__ */ new Set([...excludedKeys, ...items.map((item) => item.id)]);
	const result = {
		items,
		added: 0,
		duplicates: 0,
		invalid: 0,
		limited: 0
	};
	let owned = items.filter((item) => item.peer === peer).length;
	for (const value of values.slice(0, 48)) {
		const entry = readRoomSuggestions([{
			media: value,
			peer,
			name
		}])[0];
		if (!entry) {
			result.invalid++;
			continue;
		}
		if (seen.has(entry.id)) {
			result.duplicates++;
			continue;
		}
		if (items.length >= 24 || owned >= 8) {
			result.limited++;
			continue;
		}
		seen.add(entry.id);
		items.push(entry);
		owned++;
		result.added++;
	}
	return result;
}
var RoomSuggestionsPanel = (0, import_react.memo)(function RoomSuggestionsPanel({ items, guest, enabled, full, notice, onDecide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Guest video suggestions",
		className: "rounded-lg border border-border bg-elevated p-4 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					tabIndex: -1,
					className: "flex items-center gap-2 text-sm font-medium text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "size-4 text-accent" }), "Guest suggestions"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-accent",
					children: [
						items.length,
						" / ",
						24,
						" awaiting review"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: [guest ? "Suggestions are separate from the live queue. The host decides what plays next." : "Approve a public video to the end or next position without interrupting playback. Undo restores the queue; resolved requests stay resolved.", " Up to 8 pending per guest connection. Requests last for this host session."]
			}),
			!enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "New suggestions are closed. Existing requests stay here for the host to resolve."
			}),
			full && !guest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs text-accent",
				children: "The live queue is full. Remove a queued title before approving another video."
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs text-accent",
				children: notice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 max-h-96 space-y-2 overflow-y-auto",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-room-suggestion-id": item.id,
					className: "rounded-md bg-bg/45 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-words text-sm font-medium text-fg",
							children: item.media.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 break-words text-xs text-muted",
							children: [
								"Suggested by ",
								item.name,
								" · ",
								item.media.kind === "youtube" ? "YouTube" : "Twitch"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: item.media.watchUrl,
							target: "_blank",
							rel: "noreferrer",
							className: "mt-1 inline-flex min-h-11 items-center text-xs text-accent underline",
							children: "Open public video"
						}),
						!guest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "min-h-11",
									disabled: full,
									onClick: () => onDecide(item.id, "end"),
									children: "Approve to end"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									disabled: full,
									onClick: () => onDecide(item.id, "next"),
									children: "Approve next"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									onClick: () => onDecide(item.id, "dismiss"),
									children: "Dismiss"
								})
							]
						})
					]
				}, item.id))
			}),
			!items.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted",
				children: "No suggestions waiting. Guests can paste public links or suggest a public library video when review mode is enabled."
			})
		]
	});
});
/** Buffering is device-local for live streams; only an explicit room pause stops them. */
function providerPlaybackWanted(playing, guest, hostClockRunning, live) {
	return playing && (live || !guest || hostClockRunning);
}
/** Read live evidence only from the current iframe's video, never from a stale title. */
function youtubeLiveInfo(info, videoId) {
	if (!info || typeof info !== "object") return;
	const data = info.videoData;
	if (!data || typeof data !== "object" || data.video_id !== void 0 && data.video_id !== videoId) return;
	return typeof data.isLive === "boolean" ? data.isLive : void 0;
}
/** Provider observations use a monotonic local clock, independent of wall-clock skew. */
function providerPosition(sample, id, now) {
	if (!sample || sample.id !== id || !Number.isFinite(sample.position) || sample.position < 0 || now < sample.at || now - sample.at > 3e3) return;
	return sample.position + (sample.state === 1 ? (now - sample.at) / 1e3 : 0);
}
function providerNeedsCorrection(actual, target, now, lastCorrection) {
	return actual !== void 0 && Number.isFinite(actual) && Math.abs(actual - target) > 1.25 && now - lastCorrection >= 3e3;
}
function roomClockSample(sentWall, sentMono, receivedMono, hostWall) {
	const rtt = receivedMono - sentMono;
	if (![
		sentWall,
		sentMono,
		receivedMono,
		hostWall
	].every(Number.isFinite) || rtt < 0 || rtt > 2e3 || hostWall <= 0) return;
	return {
		rtt,
		offset: hostWall - (sentWall + rtt / 2)
	};
}
function roomPacketElapsed(sentAt, receivedAt, offset = 0) {
	return Math.max(0, Math.min(2, (receivedAt + offset - sentAt) / 1e3));
}
function poster(video) {
	if (video.remote?.kind === "youtube" && video.remote.videoId) return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
	return video.poster;
}
function RoomRecommendationsView({ videos, youtubeVideos, currentId, visibleCount, pending, onSelect, onMix, onLoadMore }) {
	const [youtubeLimit, setYoutubeLimit] = (0, import_react.useState)(24);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: onMix,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3.5" }), " Mix playable picks"]
			}), videos.length > visibleCount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: onLoadMore,
				children: "Load 18 more playable videos"
			})]
		}),
		pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			"aria-live": "polite",
			className: "mt-3 text-xs text-muted",
			children: "Preparing your playable videos in small background slices… You can keep using the room while they load."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex gap-2 overflow-x-auto pb-2",
			children: videos.slice(0, visibleCount).map((video) => {
				const image = poster(video);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSelect(video),
					className: `w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === currentId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`,
					children: [image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: image,
						alt: "",
						loading: "lazy",
						decoding: "async",
						className: "aspect-video w-full object-cover",
						onError: (event) => {
							const fallback = video.remote?.kind === "youtube" && video.remote.videoId ? `https://i.ytimg.com/vi/${video.remote.videoId}/mqdefault.jpg` : "";
							if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
							else event.currentTarget.style.display = "none";
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate px-2 py-2 text-xs",
						children: video.name
					})]
				}, video.id);
			})
		}),
		youtubeVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4",
			"aria-label": "YouTube recommendations",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold text-fg",
					children: "More from YouTube"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [youtubeVideos.length, " playable titles in your library"]
				})] }), youtubeVideos.length > youtubeLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setYoutubeLimit((limit) => Math.min(youtubeVideos.length, limit + 24)),
					children: "Show 24 more YouTube videos"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex gap-2 overflow-x-auto pb-2",
				children: youtubeVideos.slice(0, youtubeLimit).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSelect(video),
					className: `w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === currentId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: poster(video) || `https://i.ytimg.com/vi/${video.remote?.videoId}/mqdefault.jpg`,
						alt: "",
						loading: "lazy",
						decoding: "async",
						className: "aspect-video w-full object-cover",
						onError: (event) => {
							const fallback = `https://i.ytimg.com/vi/${video.remote?.videoId}/mqdefault.jpg`;
							if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
							else event.currentTarget.style.display = "none";
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate px-2 py-2 text-xs",
						children: video.name
					})]
				}, video.id))
			})]
		})
	] });
}
var RoomRecommendations = (0, import_react.memo)(RoomRecommendationsView);
var RETRY_MS = 3e3;
var TIMEOUT_MS = 12e3;
/** Session-only delivery state. Retries keep their original identity so a lost
* confirmation cannot apply a relative move or shuffle twice. */
var RoomQueueDelivery = class {
	pending = /* @__PURE__ */ new Map();
	receipts = /* @__PURE__ */ new Map();
	get size() {
		return this.pending.size;
	}
	enqueue(packet, now) {
		if (this.pending.size >= 16 || this.pending.has(packet.requestId)) return false;
		this.pending.set(packet.requestId, {
			packet,
			started: now,
			sent: now
		});
		return true;
	}
	acknowledge(id) {
		return this.pending.delete(id);
	}
	tick(now) {
		const resend = [], expired = [];
		for (const [id, entry] of this.pending) if (now - entry.started >= TIMEOUT_MS) {
			this.pending.delete(id);
			expired.push(id);
		} else if (now - entry.sent >= RETRY_MS) {
			entry.sent = now;
			resend.push(entry.packet);
		}
		return {
			resend,
			expired
		};
	}
	prune(now) {
		for (const [key, entry] of this.receipts) if (now - entry.at >= 3e4) this.receipts.delete(key);
	}
	receiptFor(peer, id, now) {
		this.prune(now);
		return this.receipts.get(JSON.stringify([peer, id]))?.receipt;
	}
	canConfirm(now) {
		this.prune(now);
		return this.receipts.size < 128;
	}
	confirm(peer, id, text, now) {
		const receipt = {
			type: "queue-result",
			requestId: id,
			text: text.slice(0, 300)
		};
		this.receipts.set(JSON.stringify([peer, id]), {
			receipt,
			at: now
		});
		return receipt;
	}
	clear() {
		this.pending.clear();
		this.receipts.clear();
	}
};
function useRoomQueueDelivery(room, guest, host, send, notice) {
	const delivery = (0, import_react.useRef)(new RoomQueueDelivery());
	const [pending, setPending] = (0, import_react.useState)(0);
	const hostRef = (0, import_react.useRef)(host);
	const previousHost = (0, import_react.useRef)(host);
	hostRef.current = host;
	(0, import_react.useEffect)(() => {
		delivery.current.clear();
		setPending(0);
	}, [room, guest]);
	(0, import_react.useEffect)(() => {
		if (guest && previousHost.current && host && host !== previousHost.current && delivery.current.size) {
			delivery.current.clear();
			setPending(0);
			notice("The host reconnected. Pending requests were stopped; check the confirmed queue before trying again.");
		}
		previousHost.current = host;
	}, [
		guest,
		host,
		notice
	]);
	(0, import_react.useEffect)(() => {
		if (!guest || !pending || !room) return;
		const timer = window.setInterval(() => {
			const result = delivery.current.tick(Date.now());
			for (const packet of result.resend) send(packet, hostRef.current || void 0);
			if (result.expired.length) {
				setPending(delivery.current.size);
				notice("The host did not confirm a queue change. Refreshing the shared order; check it before trying again.");
				send({
					type: "resync-request",
					sentAt: Date.now()
				}, hostRef.current || void 0);
			}
		}, 1e3);
		return () => window.clearInterval(timer);
	}, [
		guest,
		room,
		pending,
		send,
		notice
	]);
	return {
		request: (0, import_react.useCallback)((data, text) => {
			if (!room) {
				notice("Join a room before changing its queue.");
				return false;
			}
			const packet = {
				...data,
				requestId: createLocalId("queue-"),
				sentAt: Date.now()
			};
			if (!delivery.current.enqueue(packet, Date.now())) {
				notice("Please wait for the host to confirm your pending queue changes.");
				return false;
			}
			setPending(delivery.current.size);
			send(packet, hostRef.current || void 0);
			notice(text);
			return true;
		}, [
			room,
			send,
			notice
		]),
		replay: (0, import_react.useCallback)((peer, id) => {
			const receipt = delivery.current.receiptFor(peer, id, Date.now());
			if (receipt) {
				send(receipt, peer);
				return true;
			}
			if (!delivery.current.canConfirm(Date.now())) {
				send({
					type: "queue-result",
					requestId: id,
					text: "The host is handling many queue changes. Please wait before trying again."
				}, peer);
				return true;
			}
			return false;
		}, [send]),
		confirm: (0, import_react.useCallback)((peer, id, text) => {
			send(delivery.current.confirm(peer, id, text, Date.now()), peer);
		}, [send]),
		accept: (0, import_react.useCallback)((peer, id, text) => {
			if (hostRef.current && peer !== hostRef.current || !delivery.current.acknowledge(id)) return;
			setPending(delivery.current.size);
			notice(text.slice(0, 300) || "Queue change confirmed by the host.");
		}, [notice]),
		pending
	};
}
function useRoomLocalStream(ref, source, enabled, publish) {
	const [captured, setCaptured] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setCaptured(null);
		setStatus("");
		const video = ref.current;
		if (!enabled || !source || !video) {
			publish(null);
			return;
		}
		const capture = video.captureStream ?? video.mozCaptureStream;
		if (!capture) {
			setStatus("This host browser cannot stream local playback. Guests can select a matching file instead.");
			return;
		}
		let stream;
		try {
			stream = capture.call(video);
		} catch {
			setStatus("Local streaming is unavailable for this file. Guests can select a matching file instead.");
			return;
		}
		const update = () => publish(stream);
		stream.addEventListener("addtrack", update);
		stream.addEventListener("removetrack", update);
		publish(stream);
		setCaptured({
			source,
			id: stream.id
		});
		setStatus("Local playback streams directly to connected guests. Keep the host player open.");
		return () => {
			stream.removeEventListener("addtrack", update);
			stream.removeEventListener("removetrack", update);
			publish(null);
			for (const track of stream.getTracks()) track.stop();
		};
	}, [
		enabled,
		publish,
		ref,
		source
	]);
	return {
		streamId: captured?.source === source ? captured.id : "",
		status
	};
}
/** Incoming RTC media stays in the browser's bounded decoder, never a file Blob. */
function RoomStreamPlayer({ stream, title, playing, position, duration, onPlayback, onSeek, onResync, onReadiness }) {
	const ref = (0, import_react.useRef)(null);
	const stage = (0, import_react.useRef)(null);
	const [needsPlay, setNeedsPlay] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [waiting, setWaiting] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [reload, setReload] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const video = ref.current;
		if (!video) return;
		video.srcObject = stream;
		setWaiting(false);
		setNotice("");
		setNeedsPlay(false);
		setDraft(null);
		return () => {
			video.pause();
			video.srcObject = null;
		};
	}, [stream, reload]);
	(0, import_react.useEffect)(() => {
		const video = ref.current;
		if (!video) return;
		let active = true;
		if (playing) video.play().catch((error) => {
			if (!active || error instanceof DOMException && error.name === "AbortError") return;
			const blocked = error instanceof DOMException && error.name === "NotAllowedError";
			setNeedsPlay(blocked);
			onReadiness?.(blocked ? "blocked" : "error");
			if (!blocked) setNotice("This device could not start the host stream. Reload this player to try again.");
		});
		else {
			video.pause();
			setNeedsPlay(false);
		}
		return () => {
			active = false;
		};
	}, [
		stream,
		playing,
		reload
	]);
	const clock = (seconds) => {
		const time = Math.floor(Math.max(0, Number.isFinite(seconds) ? seconds : 0));
		return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;
	};
	const seconds = typeof duration === "number" && Number.isFinite(duration) && duration > 0 ? duration : void 0;
	const seek = (value) => {
		setDraft(null);
		onSeek(Math.max(0, Math.min(seconds ?? 43200, value)));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: stage,
		"aria-label": "Shared local playback",
		className: "flex w-full flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref,
				"aria-label": `Shared local video: ${title}`,
				"data-room-stream": true,
				playsInline: true,
				className: "aspect-video w-full bg-bg",
				onPlaying: () => {
					setNeedsPlay(false);
					setWaiting(false);
					onReadiness?.("playing");
				},
				onCanPlay: () => onReadiness?.("ready"),
				onPause: () => onReadiness?.("paused"),
				onEnded: () => onReadiness?.("ended"),
				onWaiting: () => {
					setWaiting(true);
					onReadiness?.("buffering");
				},
				onStalled: () => {
					setWaiting(true);
					onReadiness?.("buffering");
				},
				onError: () => {
					onReadiness?.("error");
					setNotice("This device could not play the host stream. Request resync to try again.");
				},
				onVolumeChange: () => setMuted(Boolean(ref.current?.muted))
			}), needsPlay && playing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "absolute bottom-4 left-4 min-h-11",
				onClick: () => {
					ref.current?.play().catch(() => setNeedsPlay(true));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Play on this device"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2 border-t border-border bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							className: "min-h-11",
							onClick: () => onPlayback(!playing),
							children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? "Pause together" : "Resume together"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted",
							"aria-label": "Shared playback time",
							children: [clock(position), seconds ? ` / ${clock(seconds)}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "min-h-11 min-w-11",
							"aria-label": muted ? "Unmute this device" : "Mute this device",
							onClick: () => {
								const video = ref.current;
								if (video) video.muted = !muted;
							},
							children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "min-h-11 min-w-11",
							"aria-label": "Fullscreen shared video",
							onClick: () => {
								if (stage.current?.requestFullscreen) stage.current.requestFullscreen().catch(() => setNotice("Fullscreen is unavailable on this device."));
								else setNotice("Fullscreen is unavailable on this device.");
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "min-h-11",
							onClick: onResync,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), "Resync video"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "min-h-11",
							onClick: () => {
								onReadiness?.("loading");
								setReload((value) => value + 1);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), "Reload this player"]
						})
					]
				}),
				seconds && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: seconds,
					step: .25,
					value: Math.min(seconds, draft ?? position),
					"aria-label": "Seek shared video",
					"aria-valuetext": clock(draft ?? position),
					className: "min-h-11 w-full accent-accent",
					onChange: (event) => setDraft(event.currentTarget.valueAsNumber),
					onPointerUp: (event) => seek(event.currentTarget.valueAsNumber),
					onPointerCancel: () => setDraft(null),
					onKeyDown: (event) => {
						const next = roomSeekKey(event.key, event.currentTarget.valueAsNumber, seconds);
						if (next !== void 0) {
							event.preventDefault();
							seek(next);
						}
					},
					onBlur: (event) => {
						if (draft !== null) seek(event.currentTarget.valueAsNumber);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "Play, pause and seek affect the room. Sound and fullscreen affect only this device."
				}),
				(notice || waiting && playing) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs text-accent",
					children: notice || "Waiting for the host’s video frames…"
				})
			]
		})]
	});
}
function RoomGuestTiming({ offset, position, adjustsPlayback, onChange }) {
	const [draft, setDraft] = (0, import_react.useState)(String(offset));
	(0, import_react.useEffect)(() => setDraft(String(offset)), [offset]);
	const apply = () => {
		if (!draft.trim() || !Number.isFinite(Number(draft))) return;
		const value = normalizeGuestOffset(Number(draft));
		setDraft(String(value));
		onChange(value);
	};
	const valid = draft.trim() !== "" && Number.isFinite(Number(draft));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "My playback timing",
		className: "mt-4 rounded-md border border-border bg-bg/45 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium text-fg",
					children: "My playback timing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-accent",
					"data-guest-offset": offset,
					children: [
						offset > 0 ? "+" : "",
						offset.toFixed(2),
						"s · this device"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Behind the host? Move ahead. Ahead of the host? Move behind. Saved on this device; other viewers keep their timing."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 flex flex-wrap items-end gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					apply();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "min-w-0 flex-1 text-xs text-muted",
					children: ["Offset in seconds", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: -30,
						max: 30,
						step: .25,
						"aria-label": "My timing offset in seconds",
						className: "mt-1 min-h-11",
						value: draft,
						onChange: (event) => setDraft(event.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "secondary",
					size: "sm",
					className: "min-h-11",
					disabled: !valid,
					children: "Apply timing"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "min-h-11",
						disabled: offset <= -30,
						onClick: () => onChange(offset - .25),
						children: "Behind 0.25s"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "min-h-11",
						disabled: offset >= 30,
						onClick: () => onChange(offset + .25),
						children: "Ahead 0.25s"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "min-h-11",
						disabled: offset === 0,
						onClick: () => onChange(0),
						children: "Reset timing"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-fg",
				"aria-label": "My adjusted timer",
				children: [
					"Your timer ",
					Math.floor(position / 60),
					":",
					String(Math.floor(position % 60)).padStart(2, "0")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: adjustsPlayback ? "Adjusts your video and timer. Shared play, pause and seek still control the room." : "Timer correction only for host streams, live feeds and clips. Streamed frames cannot be seeked independently; a matching local copy supports video adjustment."
			})
		]
	});
}
/** Visit-only credentials: never persist this object or include it in diagnostics. */
function roomRelayConfig(urls, username, credential, relayOnly) {
	const entries = [...new Set(urls.split(/[\s,]+/).filter(Boolean))];
	if (!entries.length || entries.length > 4) throw new Error("Enter one to four TURN server URLs.");
	for (const entry of entries) {
		const match = /^(turns?):(?:[a-z0-9.-]+|\[[a-f0-9:]+\])(?::(\d{1,5}))?(?:\?transport=(udp|tcp))?$/i.exec(entry);
		if (!match || entry.length > 512 || match[2] && (+match[2] < 1 || +match[2] > 65535)) throw new Error("Use a valid turn: or turns: URL, with an optional port and transport=udp or tcp.");
	}
	if (!username.trim() || !credential.trim() || username.length > 1024 || credential.length > 4096) throw new Error("Enter the temporary relay username and credential.");
	return {
		iceServers: [{
			urls: entries,
			username: username.trim(),
			credential
		}],
		iceTransportPolicy: relayOnly ? "relay" : "all"
	};
}
function RoomRelaySettings({ config, onChange }) {
	const [urls, setUrls] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [credential, setCredential] = (0, import_react.useState)("");
	const [relayOnly, setRelayOnly] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-3 rounded-sm border border-border p-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
				className: "cursor-pointer text-fg",
				children: ["Connection recovery · ", config ? config.iceTransportPolicy === "relay" ? "relay test mode" : "relay available" : "direct connections"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "my-3 text-xs text-muted",
				children: "For networks that block direct connections, enter temporary credentials from your TURN service on each device. They stay in memory for this visit and are excluded from diagnostics. Applying reconnects the room."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-2",
				onSubmit: (event) => {
					event.preventDefault();
					try {
						onChange(roomRelayConfig(urls, username, credential, relayOnly));
						setCredential("");
						setNotice("Configuration applied. A connected peer showing a relay path confirms the service works.");
					} catch (error) {
						setNotice(error instanceof Error ? error.message : "Invalid relay settings.");
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "TURN server URLs",
						placeholder: "turns:relay.example.com:5349?transport=tcp",
						value: urls,
						onChange: (event) => setUrls(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "TURN username",
						placeholder: "Temporary username",
						autoComplete: "off",
						value: username,
						onChange: (event) => setUsername(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "TURN credential",
						placeholder: "Temporary credential",
						type: "password",
						autoComplete: "off",
						value: credential,
						onChange: (event) => setCredential(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: relayOnly,
							onChange: (event) => setRelayOnly(event.target.checked)
						}), "Test relay only (disables same-browser fallback)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							type: "submit",
							children: "Apply relay"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							type: "button",
							onClick: () => {
								onChange(void 0);
								setCredential("");
								setNotice("Relay credentials removed. Direct connections restored.");
							},
							children: "Clear relay"
						})]
					}),
					notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "text-xs text-muted",
						children: notice
					})
				]
			})
		]
	});
}
var DEMO_TITLE = /\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i;
/** Prepare the room's randomized catalog in interruptible slices. A million
* item room should not hold the main thread while the queue panel opens. */
async function prepareRoomCandidates(options, turn = yieldCatalogTask) {
	let catalog;
	if (options.guest) catalog = await roomCatalogCandidatesAsync(options.videos, options.shared, turn);
	else {
		const ids = /* @__PURE__ */ new Set();
		await forEachCatalogSlice(options.videos, (video) => ids.add(video.id), turn);
		const sharedOnly = [];
		await forEachCatalogSlice(Object.values(options.shared), (video) => {
			if (!ids.has(video.id)) sharedOnly.push(video);
		}, turn);
		catalog = sharedOnly.length ? options.videos.concat(sharedOnly) : options.videos;
	}
	const played = /* @__PURE__ */ new Set();
	await forEachCatalogSlice(options.history, (entry) => played.add(entry.id), turn);
	const videos = [];
	const ranks = [];
	const order = [];
	await forEachCatalogSlice(catalog, (video) => {
		if (video.isSample || !video.remote && DEMO_TITLE.test(`${video.name} ${video.tagline ?? ""}`) || options.unavailable[video.id] || options.hidden[video.id] || !options.canStage(video)) return;
		const index = videos.length;
		videos.push(video);
		ranks.push(options.rank(`${video.id}:${options.seed}`, options.seed) / 4294967295 + (options.favorites[video.id] ? .18 : 0) - (played.has(video.id) ? .32 : 0));
		order.push(index);
	}, turn);
	const sorted = await sortCatalogRows(order, (a, b) => ranks[b] - ranks[a], turn);
	const result = new Array(videos.length);
	await forEachCatalogSlice(sorted, (index, position) => {
		result[position] = videos[index];
	}, turn);
	return result;
}
async function roomCatalogCandidatesAsync(videos, shared, turn) {
	const output = [];
	const seenKeys = /* @__PURE__ */ new Set();
	const seenIds = /* @__PURE__ */ new Set();
	const append = (video) => {
		let item = video;
		const key = roomMediaKey(video);
		if (seenKeys.has(key)) return;
		if (seenIds.has(video.id)) item = {
			...video,
			id: `room:${key}:candidate-${output.length}`
		};
		seenKeys.add(key);
		seenIds.add(item.id);
		output.push(item);
	};
	await forEachCatalogSlice(videos, (video) => {
		const session = shared[video.id];
		if (!session) {
			append(video);
			return;
		}
		if (roomMediaKey(session) !== roomMediaKey(video)) append({
			...video,
			id: `room:${roomMediaKey(video)}`
		});
		else append(session);
	}, turn);
	const sessions = Object.values(shared);
	await forEachCatalogSlice(sessions, append, turn);
	return output;
}
function watchRoomEmbed(video) {
	const base = video.remote?.embedUrl;
	if (!base) return "";
	if (video.remote?.kind === "twitch") return twitchEmbedUrl(video.remote, currentTwitchEmbedContext().parents) ?? "";
	const url = new URL(base);
	url.searchParams.set("autoplay", "0");
	url.searchParams.set("rel", "0");
	url.searchParams.set("playsinline", "1");
	url.searchParams.set("controls", "1");
	url.searchParams.set("origin", window.location.origin);
	if (video.remote?.kind === "youtube") url.searchParams.set("enablejsapi", "1");
	return url.toString();
}
function canStageRoomVideo(video) {
	return video.remote ? Boolean(describeRoomMedia(video)) : Boolean(video.src || NATIVE_PLAYABLE.has(video.extension.toLowerCase()));
}
function roomShuffleRank(id, seed) {
	let value = seed >>> 0;
	for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 73244475);
	return value >>> 0;
}
function normalizeLocalRoomQueue(value) {
	if (!Array.isArray(value)) return [];
	const seen = /* @__PURE__ */ new Set();
	return value.flatMap((item) => {
		if (!item || typeof item !== "object") return [];
		const share = item;
		if (typeof share.name !== "string" || typeof share.fingerprint !== "string" || !share.name.trim() || !share.fingerprint.trim() || seen.has(share.fingerprint)) return [];
		seen.add(share.fingerprint);
		return [{
			name: share.name,
			fingerprint: share.fingerprint,
			size: Math.max(0, Number(share.size) || 0),
			modified: Math.max(0, Number(share.modified) || 0)
		}];
	}).slice(0, 24);
}
function trustedRoomSentAt(value, now = Date.now()) {
	const sentAt = typeof value === "number" && Number.isFinite(value) ? value : 0;
	return sentAt > 0 && sentAt <= now + 6e4 ? sentAt : 0;
}
function roomTimeLabel(at) {
	return at ? new Date(at).toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit"
	}) : "waiting";
}
function localRoomFingerprint(file) {
	return `${file.name.normalize("NFKC").toLowerCase()}::${file.size}::${file.lastModified}`;
}
var twitchEmbedLoader;
function loadTwitchEmbed() {
	return twitchEmbedLoader ??= new Promise((resolve, reject) => {
		const ready = window.Twitch;
		if (ready?.Player) {
			resolve(ready);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://player.twitch.tv/js/embed/v1.js";
		script.async = true;
		const timeout = window.setTimeout(() => {
			script.remove();
			reject(/* @__PURE__ */ new Error("Twitch player script timed out"));
		}, 1e4);
		script.onload = () => {
			window.clearTimeout(timeout);
			script.remove();
			const api = window.Twitch;
			if (api?.Player) resolve(api);
			else reject(/* @__PURE__ */ new Error("Twitch player API unavailable"));
		};
		script.onerror = () => {
			window.clearTimeout(timeout);
			script.remove();
			reject(/* @__PURE__ */ new Error("Twitch player script failed to load"));
		};
		document.head.append(script);
	}).catch((error) => {
		twitchEmbedLoader = void 0;
		throw error;
	});
}
function WatchRoomSection() {
	const twitchEnvironment = (0, import_react.useMemo)(currentTwitchEmbedContext, []);
	const [roomCode, setRoomCode] = (0, import_react.useState)(() => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
	const [roomInput, setRoomInput] = (0, import_react.useState)("");
	const [recentLocalRoom, setRecentLocalRoom] = (0, import_react.useState)(() => localStorage.getItem("reelcase.watch-room.last-host") ?? "");
	const [name, setName] = (0, import_react.useState)(() => localStorage.getItem("reelcase.profile-name") || (new URLSearchParams(window.location.search).get("theater") === "1" ? "Guest" : "Host"));
	const [activeRoom, setActiveRoom] = (0, import_react.useState)(null);
	const [joinedAsGuest, setJoinedAsGuest] = (0, import_react.useState)(false);
	const [guestAccess, setGuestAccess] = (0, import_react.useState)(false);
	const [localVideo, setLocalVideo] = (0, import_react.useState)(null);
	const [localShare, setLocalShare] = (0, import_react.useState)(null);
	const [pickedLocalVideo, setPickedLocalVideo] = (0, import_react.useState)(null);
	const localFiles = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [pendingLocalShare, setPendingLocalShare] = (0, import_react.useState)(null);
	const [sharedRoomVideos, setSharedRoomVideos] = (0, import_react.useState)({});
	const sharedRoomVideosRef = (0, import_react.useRef)(sharedRoomVideos);
	sharedRoomVideosRef.current = sharedRoomVideos;
	const [sharedLocalMedia, setSharedLocalMedia] = (0, import_react.useState)(null);
	const [mediaHostId, setMediaHostId] = (0, import_react.useState)("");
	const [localQueue, setLocalQueue] = (0, import_react.useState)([]);
	const [localShareMatches, setLocalShareMatches] = (0, import_react.useState)({});
	const [rokuAddress, setRokuAddress] = (0, import_react.useState)("");
	const [rokuReady, setRokuReady] = (0, import_react.useState)(false);
	const [rokuDevices, setRokuDevices] = (0, import_react.useState)([]);
	const [rokuNotice, setRokuNotice] = (0, import_react.useState)("");
	const [queue, setQueue] = (0, import_react.useState)([]);
	const queueRef = (0, import_react.useRef)([]);
	const [queueNotice, setQueueNotice] = (0, import_react.useState)("");
	const [reviewQueue, setReviewQueue] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.watch-room.review-queue") === "true";
		} catch {
			return false;
		}
	});
	const [suggestions, setSuggestions] = (0, import_react.useState)([]);
	const reviewRevision = (0, import_react.useRef)(0), acceptedReviewRevision = (0, import_react.useRef)(0);
	const suggestionsRef = (0, import_react.useRef)(suggestions);
	suggestionsRef.current = suggestions;
	const [reviewNotice, setReviewNotice] = (0, import_react.useState)("");
	const requestsAnchor = (0, import_react.useRef)(null);
	const [guestQueueEnabled, setGuestQueueEnabled] = (0, import_react.useState)(() => localStorage.getItem("reelcase.watch-room.guest-queue") !== "false");
	const [guestPlaybackEnabled, setGuestPlaybackEnabled] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.watch-room.guest-playback") !== "false";
		} catch {
			return true;
		}
	});
	const [guestSeekingEnabled, setGuestSeekingEnabled] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.watch-room.guest-seeking") !== "false";
		} catch {
			return true;
		}
	});
	const [catalogShared, setCatalogShared] = (0, import_react.useState)(true), [localTitlesShared, setLocalTitlesShared] = (0, import_react.useState)(false);
	const [savedQueue, setSavedQueue] = (0, import_react.useState)(() => {
		try {
			return readRoomQueueDraft(localStorage.getItem(ROOM_QUEUE_DRAFT_KEY));
		} catch {
			return;
		}
	});
	const pendingQueueDraft = (0, import_react.useRef)(void 0);
	const queueDraftTimer = (0, import_react.useRef)(void 0);
	const undoQueue = (0, import_react.useRef)(void 0);
	const [undoRevision, setUndoRevision] = (0, import_react.useState)();
	const selectionRevision = (0, import_react.useRef)(0);
	const acceptedSelectionRevision = (0, import_react.useRef)(0);
	const mediaHostRef = (0, import_react.useRef)("");
	const [autoAdvance, setAutoAdvance] = (0, import_react.useState)(() => localStorage.getItem("reelcase.watch-room.auto-advance") !== "false");
	const lastEndedTitle = (0, import_react.useRef)("");
	const [roomHealth, setRoomHealth] = (0, import_react.useState)({
		lastPublishedAt: 0,
		lastHostStateAt: 0,
		lastQueueAt: 0,
		lastDriftSeconds: 0,
		queueRevision: 0,
		queueRequests: 0,
		queueAccepted: 0,
		staleDropped: 0,
		resyncRequests: 0
	});
	const [roomLedger, setRoomLedger] = (0, import_react.useState)([]);
	const [ledgerRoom, setLedgerRoom] = (0, import_react.useState)("");
	const [stageSize, setStageSize] = (0, import_react.useState)("theater");
	const [playback, setPlayback] = (0, import_react.useState)({
		playing: false,
		position: 0
	});
	const [guestOffset, setGuestOffset] = (0, import_react.useState)(() => {
		try {
			return normalizeGuestOffset(Number(localStorage.getItem("reelcase.watch-room.guest-offset.v1") ?? 0));
		} catch {
			return 0;
		}
	});
	const guestPlayerOffset = (0, import_react.useRef)(0);
	const [timelineEvidence, setTimelineEvidence] = (0, import_react.useState)({
		source: "local",
		at: Date.now()
	});
	const [recentMedia, setRecentMedia] = (0, import_react.useState)([]);
	const recentMediaRef = (0, import_react.useRef)(recentMedia);
	recentMediaRef.current = recentMedia;
	const [sessionPlayedMedia, setSessionPlayedMedia] = (0, import_react.useState)([]);
	const [watchHistory, setWatchHistory] = (0, import_react.useState)(() => {
		try {
			return readRoomHistory(localStorage.getItem(ROOM_HISTORY_KEY));
		} catch {
			return [];
		}
	});
	const watchHistoryRef = (0, import_react.useRef)(watchHistory), lastHistorySelection = (0, import_react.useRef)("");
	const [historyNotice, setHistoryNotice] = (0, import_react.useState)("");
	const roomHistoryAnchor = (0, import_react.useRef)(null);
	const [playerReload, setPlayerReload] = (0, import_react.useState)(0);
	const [playerNotice, setPlayerNotice] = (0, import_react.useState)("");
	const roomStage = (0, import_react.useRef)(null), roomQueueAnchor = (0, import_react.useRef)(null), roomChat = (0, import_react.useRef)(null), roomParticipationAnchor = (0, import_react.useRef)(null);
	const [chat, setChat] = (0, import_react.useState)([]);
	const chatScroll = (0, import_react.useRef)(null), chatAtBottom = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		if (chatAtBottom.current && chatScroll.current) chatScroll.current.scrollTop = chatScroll.current.scrollHeight;
	}, [chat]);
	const [message, setMessage] = (0, import_react.useState)("");
	const [roomCandidates, setRoomCandidates] = (0, import_react.useState)([]);
	const [roomCandidatesPending, setRoomCandidatesPending] = (0, import_react.useState)(false);
	const [roomLocalToolsOpen, setRoomLocalToolsOpen] = (0, import_react.useState)(false);
	const [roomRatingRevision, setRoomRatingRevision] = (0, import_react.useState)(0);
	const [partyPrompt, setPartyPrompt] = (0, import_react.useState)("Pick the next vibe");
	const [partyVotes, setPartyVotes] = (0, import_react.useState)({
		Comedy: 0,
		Action: 0,
		Surprise: 0
	});
	const [friendName, setFriendName] = (0, import_react.useState)("");
	const [friendCode, setFriendCode] = (0, import_react.useState)("");
	const [inviteNotice, setInviteNotice] = (0, import_react.useState)("");
	const [pulseStatus, setPulseStatus] = (0, import_react.useState)("No chat transport test yet.");
	const [friends, setFriends] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]");
			return Array.isArray(saved) ? saved.slice(0, 16) : [];
		} catch {
			return [];
		}
	});
	const videos = useLibrary((s) => s.videos);
	const favorites = useLibrary((s) => s.favorites);
	const hiddenVideos = useLibrary((s) => s.hiddenVideos);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const history = useLibrary((s) => s.history);
	const recordPlay = useLibrary((s) => s.recordPlay);
	const unavailable = useLibrary((s) => s.unavailable);
	(0, import_react.useEffect)(() => {
		localStorage.setItem("reelcase.profile-name", name.trim() || "Host");
	}, [name]);
	const [sharedVideoId, setSharedVideoIdState] = (0, import_react.useState)(() => {
		if (new URLSearchParams(window.location.search).get("theater") === "1") return "";
		const pending = localStorage.getItem("reelcase.watch-room.pending-video");
		return (pending ? videos.find((video) => video.id === pending && canStageRoomVideo(video)) : void 0)?.id ?? videos.find(canStageRoomVideo)?.id ?? "";
	});
	const currentVideoIdRef = (0, import_react.useRef)(sharedVideoId);
	const setSharedVideoId = (id) => {
		currentVideoIdRef.current = id;
		setSharedVideoIdState(id);
	};
	const adoptRoomMedia = (0, import_react.useCallback)((values, ids) => {
		const next = mergeRoomMedia(sharedRoomVideosRef.current, values, ids);
		sharedRoomVideosRef.current = next;
		setSharedRoomVideos(next);
	}, []);
	const [detectedLiveId, setDetectedLiveId] = (0, import_react.useState)("");
	const detectedLiveIdRef = (0, import_react.useRef)("");
	const markRoomLive = (id) => {
		detectedLiveIdRef.current = id;
		setDetectedLiveId(id);
	};
	const sharedVideo = (0, import_react.useMemo)(() => {
		const video = joinedAsGuest ? sharedRoomVideos[sharedVideoId] ?? lookupVideo(videos, sharedVideoId) : lookupVideo(videos, sharedVideoId) ?? sharedRoomVideos[sharedVideoId];
		const normalized = video ? normalizeRoomVideo(video) : void 0;
		return normalized?.remote?.kind === "youtube" && detectedLiveId === sharedVideoId ? {
			...normalized,
			remote: {
				...normalized.remote,
				live: true
			}
		} : normalized;
	}, [
		videos,
		sharedRoomVideos,
		sharedVideoId,
		joinedAsGuest,
		detectedLiveId
	]);
	const isRoomLive = (id = sharedVideoId) => Boolean(id && (detectedLiveIdRef.current === id || (id === sharedVideoId ? sharedVideo : roomVideoForId(id))?.remote?.live));
	const roomVideoForId = (id) => joinedAsGuest ? sharedRoomVideosRef.current[id] ?? lookupVideo(videos, id) : lookupVideo(videos, id) ?? sharedRoomVideosRef.current[id];
	(0, import_react.useEffect)(() => {
		if (!activeRoom || !playback.playing || !sharedVideo?.remote) return;
		const media = describeRoomMedia(sharedVideo);
		if (!media) return;
		const selection = `${activeRoom}:${roomMediaKey(sharedVideo)}`;
		if (lastHistorySelection.current === selection) return;
		lastHistorySelection.current = selection;
		setSessionPlayedMedia((current) => roomRecentMedia([media, ...current]));
		const next = rememberRoomVideo(watchHistoryRef.current, media);
		watchHistoryRef.current = next;
		setWatchHistory(next);
		try {
			localStorage.setItem(ROOM_HISTORY_KEY, JSON.stringify({
				version: 1,
				entries: next
			}));
			setHistoryNotice("");
		} catch {
			setHistoryNotice("History is available for this session, but this browser could not save it.");
		}
	}, [
		activeRoom,
		sharedVideo,
		playback.playing
	]);
	const clearWatchHistory = (0, import_react.useCallback)(() => {
		watchHistoryRef.current = [];
		setWatchHistory([]);
		try {
			localStorage.removeItem(ROOM_HISTORY_KEY);
			setHistoryNotice("Your saved room history was cleared.");
		} catch {
			setHistoryNotice("History was cleared for this session, but browser storage could not be updated.");
		}
	}, []);
	const pickedLocalShare = pickedLocalVideo ? {
		name: pickedLocalVideo.name,
		fingerprint: localRoomFingerprint(pickedLocalVideo),
		size: pickedLocalVideo.size,
		modified: pickedLocalVideo.lastModified
	} : null;
	(0, import_react.useEffect)(() => {
		const retained = /* @__PURE__ */ new Set([
			sharedVideoId,
			...queue,
			...undoQueue.current?.ids ?? []
		]);
		for (const id of localFiles.current.keys()) if (!retained.has(id)) localFiles.current.delete(id);
	}, [
		sharedVideoId,
		queue,
		undoRevision
	]);
	const roomRating = (0, import_react.useMemo)(() => sharedVideoId ? getRating(sharedVideoId) : 0, [roomRatingRevision, sharedVideoId]);
	const twitchClip = sharedVideo?.remote?.kind === "twitch" && (sharedVideo.extension === "clip" || sharedVideo.remote.embedUrl?.includes("clips.twitch.tv"));
	const [measuredDuration, setMeasuredDuration] = (0, import_react.useState)(null);
	const roomDuration = (videoId = sharedVideoId) => {
		if (isRoomLive(videoId)) return void 0;
		if (videoId === sharedVideoId) {
			const mediaDuration = roomVideoRef.current?.duration;
			const twitchDuration = sharedVideo?.remote?.kind === "twitch" && !sharedVideo.remote.live ? twitchPlayerRef.current?.getDuration?.() : void 0;
			for (const duration of [
				mediaDuration,
				twitchDuration,
				measuredDuration?.videoId === videoId ? measuredDuration.seconds : void 0
			]) if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) return duration;
		}
		const video = videoId === sharedVideoId ? sharedVideo : videos.find((item) => item.id === videoId);
		return video?.remote?.live ? void 0 : video?.duration;
	};
	const clampRoomClock = (seconds, videoId = sharedVideoId) => clampRoomPosition(seconds, roomDuration(videoId));
	const providerClockFlags = () => {
		const sample = sharedVideo?.remote?.kind === "youtube" ? providerPosition(youtubeClock.current, sharedVideo.id, performance.now()) : void 0;
		return {
			live: isRoomLive() ? true : sharedVideo?.remote?.kind !== "youtube" || youtubeMetadataReady.current === sharedVideoId ? false : void 0,
			observed: sample !== void 0 || sharedVideo?.remote?.kind === "twitch" && Boolean(twitchPlayerRef.current),
			clockRunning: sample !== void 0 ? youtubeClock.current?.state === 1 : sharedVideo?.remote?.kind === "twitch" ? twitchPlayingRef.current : true
		};
	};
	const currentHostClock = () => {
		const media = roomVideoRef.current;
		if (media && !sharedVideo?.remote) {
			const actual = media.currentTime;
			return clampRoomClock(actual > .25 || playback.position <= .25 ? actual : playback.position);
		}
		const observed = sharedVideo?.remote?.kind === "youtube" ? providerPosition(youtubeClock.current, sharedVideo.id, performance.now()) : void 0;
		if (observed !== void 0) return clampRoomClock(observed);
		const estimated = estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && (sharedVideo?.remote?.kind !== "twitch" || twitchPlayingRef.current) ? youtubePlaybackStartedAt.current : null, Date.now());
		const twitch = sharedVideo?.remote?.kind === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : void 0;
		return clampRoomClock(typeof twitch === "number" && Number.isFinite(twitch) && !sharedVideo?.remote?.live && (twitch > .25 || playback.position <= .25) ? twitch : estimated);
	};
	const localShareIsMatched = !sharedVideoId.startsWith("local:") || localShare?.fingerprint === sharedVideoId.slice(6);
	const roomVideoRef = (0, import_react.useRef)(null);
	const remoteFrameRef = (0, import_react.useRef)(null);
	const twitchPlayerHostRef = (0, import_react.useRef)(null);
	const twitchPlayerRef = (0, import_react.useRef)(null);
	const twitchPlayingRef = (0, import_react.useRef)(false);
	const twitchProgress = (0, import_react.useRef)(void 0);
	const [twitchActuallyPlaying, setTwitchActuallyPlaying] = (0, import_react.useState)(false);
	const [remoteFrameReady, setRemoteFrameReady] = (0, import_react.useState)(null);
	const youtubeClock = (0, import_react.useRef)(void 0);
	const youtubeReady = (0, import_react.useRef)(false);
	const catchUpOnStart = (0, import_react.useRef)(true);
	const lastProviderCorrection = (0, import_react.useRef)(-Infinity);
	const [hostClockRunning, setHostClockRunning] = (0, import_react.useState)(true);
	const clockOffset = (0, import_react.useRef)(0);
	const clockBestRtt = (0, import_react.useRef)(Infinity);
	const clockPings = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [remoteSeekNonce, setRemoteSeekNonce] = (0, import_react.useState)(0);
	const lastYoutubeSeekNonce = (0, import_react.useRef)(0);
	const lastYoutubePlaybackCommand = (0, import_react.useRef)(null);
	const youtubeMetadataReady = (0, import_react.useRef)("");
	const acceptLiveStatus = (id, live) => {
		if (!id || typeof live !== "boolean" || roomVideoForId(id)?.remote?.kind !== "youtube") return;
		if (live) markRoomLive(id);
		if (youtubeMetadataReady.current !== id) {
			youtubeMetadataReady.current = id;
			lastYoutubeSeekNonce.current = -1;
			setRemoteSeekNonce((value) => value + 1);
		}
	};
	const lastTwitchSeekNonce = (0, import_react.useRef)(0);
	const lastTwitchPlaybackCommand = (0, import_react.useRef)(null);
	const suppressRemotePlayerEchoUntil = (0, import_react.useRef)(0);
	const [twitchPlayerStatus, setTwitchPlayerStatus] = (0, import_react.useState)("Waiting for Twitch player…");
	const [twitchPlayerReady, setTwitchPlayerReady] = (0, import_react.useState)(0);
	const [candidateSeed, setCandidateSeed] = (0, import_react.useState)(() => Date.now());
	const [roomPickLimit, setRoomPickLimit] = (0, import_react.useState)(18);
	const youtubePlaybackStartedAt = (0, import_react.useRef)(null);
	const [localVideoSource, setLocalVideoSource] = (0, import_react.useState)(null);
	const localVideoUrl = localVideoSource?.file === localVideo ? localVideoSource.url : "";
	const [resolvedRoomSource, setResolvedRoomSource] = (0, import_react.useState)(null);
	const lastRoomTick = (0, import_react.useRef)(0);
	const lastRoomHistoryId = (0, import_react.useRef)("");
	const lastRoomPosition = (0, import_react.useRef)(0);
	const applyingRemotePlaybackUntil = (0, import_react.useRef)(0);
	const queueRevisionRef = (0, import_react.useRef)(0);
	const lastAcceptedQueueRevision = (0, import_react.useRef)(0);
	const lastAcceptedTimelineAt = (0, import_react.useRef)(0);
	const lastAcceptedRoomStateAt = (0, import_react.useRef)(0);
	const room = activeRoom ?? "";
	const [relayConfig, setRelayConfig] = (0, import_react.useState)();
	const p2p = useP2PRoom(room, name.trim() || "Guest", relayConfig);
	const hostCatalog = useRoomHostCatalog({
		transport: p2p,
		room,
		guest: joinedAsGuest,
		hostId: mediaHostId,
		candidates: roomCandidates,
		preparing: roomCandidatesPending,
		shared: catalogShared,
		localTitles: localTitlesShared
	});
	const peersRef = (0, import_react.useRef)(p2p.peers);
	peersRef.current = p2p.peers;
	const hostConnected = Boolean(mediaHostId && p2p.peers.some((peer) => peer.id === mediaHostId));
	const queueWritable = !joinedAsGuest || guestQueueEnabled && !reviewQueue && hostConnected;
	const canSuggest = joinedAsGuest && guestQueueEnabled && reviewQueue && hostConnected;
	const { request: requestQueueChange, replay: replayQueueReceipt, confirm: confirmQueueChange, accept: acceptQueueReceipt, pending: pendingQueueChanges } = useRoomQueueDelivery(room, joinedAsGuest, mediaHostId, p2p.send, setQueueNotice);
	const matchingLocalSource = localShare && sharedVideoId === `local:${localShare.fingerprint}` ? localVideoUrl : "";
	const libraryLocalSource = !joinedAsGuest ? resolvedRoomSource?.id === sharedVideoId ? resolvedRoomSource.url : !sharedVideo?.remote ? sharedVideo?.src ?? "" : "" : "";
	const hostLocalSource = !joinedAsGuest ? matchingLocalSource || libraryLocalSource : "";
	(0, import_react.useEffect)(() => {
		if (joinedAsGuest || !sharedVideo || sharedVideo.remote || !room || sharedVideo.id.startsWith("local:")) return;
		let cancelled = false;
		const release = pinPlayUrl(sharedVideo.id);
		resolvePlayUrl(sharedVideo).then((url) => {
			if (!cancelled) setResolvedRoomSource({
				id: sharedVideo.id,
				url
			});
		}).catch((error) => {
			if (!cancelled) setInviteNotice(error instanceof Error ? error.message : "The host could not open this local file.");
		});
		return () => {
			cancelled = true;
			release();
		};
	}, [
		joinedAsGuest,
		sharedVideo,
		room
	]);
	const localStream = useRoomLocalStream(roomVideoRef, hostLocalSource, Boolean(room) && !joinedAsGuest, p2p.setMediaStream);
	const roomMedia = (0, import_react.useMemo)(() => {
		const descriptor = describeRoomMedia(sharedVideo, sharedVideoId === `local:${localShare?.fingerprint}` ? localShare : null);
		const seconds = measuredDuration?.videoId === sharedVideoId ? measuredDuration.seconds : descriptor?.duration;
		return descriptor?.kind === "local" ? {
			...descriptor,
			duration: typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 43200) : void 0,
			streamId: localStream.streamId || void 0
		} : descriptor;
	}, [
		sharedVideo,
		sharedVideoId,
		localShare,
		localStream.streamId,
		measuredDuration
	]);
	const roomQueueMedia = (0, import_react.useMemo)(() => queue.map((id) => {
		const file = localFiles.current.get(id);
		const share = file ? {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		} : void 0;
		return describeRoomMedia(lookupVideo(videos, id) ?? sharedRoomVideos[id], share);
	}).filter(Boolean), [
		videos,
		queue,
		sharedRoomVideos
	]);
	const incomingStream = p2p.mediaStreams[mediaHostId];
	const guestLocalStream = joinedAsGuest && !matchingLocalSource && sharedLocalMedia?.id === sharedVideoId && sharedLocalMedia.streamId === incomingStream?.id ? incomingStream : void 0;
	const playerCapability = sharedVideo?.remote?.kind === "youtube" ? "youtube" : sharedVideo?.remote?.kind === "twitch" ? twitchClip ? "clip" : "twitch" : sharedVideoId ? "local" : "none";
	const playerInitial = !sharedVideoId ? "idle" : twitchClip || sharedVideo?.remote?.kind === "twitch" && twitchEnvironment.blocked ? "unsupported" : playerCapability === "local" && !guestLocalStream && !matchingLocalSource && !libraryLocalSource ? "waiting" : "loading";
	const { report: localPlayerReadiness, observe: observePlayer } = useRoomPlayerReadiness(room + ":" + sharedVideoId + ":" + playerReload + ":" + (guestLocalStream?.id || matchingLocalSource || libraryLocalSource), joinedAsGuest ? acceptedSelectionRevision.current : selectionRevision.current, playerCapability, playerInitial);
	const youtubeDiagnostics = useYoutubeEmbedDiagnostics(room, sharedVideo?.remote?.kind === "youtube" ? sharedVideo.remote.videoId ?? "" : "", playerReload);
	const youtubeFailure = (0, import_react.useRef)(void 0);
	const nativePlayerReadiness = {
		onCanPlay: () => observePlayer("ready"),
		onPlaying: () => observePlayer("playing"),
		onWaiting: () => observePlayer("buffering"),
		onStalled: () => observePlayer("buffering"),
		onError: () => observePlayer("error")
	};
	const timingAdjustsPlayback = Boolean(sharedVideo?.remote ? !sharedVideo.remote.live && !twitchClip && ["youtube", "twitch"].includes(sharedVideo.remote.kind) : matchingLocalSource && localShareIsMatched && !guestLocalStream);
	guestPlayerOffset.current = joinedAsGuest && timingAdjustsPlayback ? guestOffset : 0;
	const devicePlaybackPosition = guestPlaybackPosition(playback.position, guestPlayerOffset.current, roomDuration());
	const adjustedTimerPosition = guestPlaybackPosition(playback.position, joinedAsGuest ? guestOffset : 0, roomDuration());
	const changeGuestOffset = (seconds) => {
		const value = normalizeGuestOffset(seconds);
		applyingRemotePlaybackUntil.current = Date.now() + 1200;
		suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
		setGuestOffset(value);
		try {
			localStorage.setItem("reelcase.watch-room.guest-offset.v1", String(value));
		} catch {}
	};
	const acceptRoomMedia = (0, import_react.useCallback)((from, value, id) => {
		const resolved = resolveRoomMedia(value);
		if (!resolved || resolved.descriptor.id !== id) return;
		setMediaHostId(from);
		mediaHostRef.current = from;
		setSharedLocalMedia(resolved.descriptor.kind === "local" ? resolved.descriptor : null);
		if (resolved.video) adoptRoomMedia([value], [resolved.descriptor.id, ...queueRef.current]);
		if (resolved.descriptor.local) setPendingLocalShare(resolved.descriptor.local);
	}, [adoptRoomMedia]);
	const invitation = useRoomInvitation(activeRoom ?? roomCode);
	const roomInvite = invitation.url;
	(0, import_react.useEffect)(() => {
		setSharedRoomVideos({});
		recentMediaRef.current = [];
		setRecentMedia([]);
		setSessionPlayedMedia([]);
		setPlayerNotice("");
		clockOffset.current = 0;
		clockBestRtt.current = Infinity;
		clockPings.current.clear();
		setHostClockRunning(true);
		suggestionsRef.current = [];
		setSuggestions([]);
		setReviewNotice("");
		reviewRevision.current = 0;
		acceptedReviewRevision.current = 0;
		try {
			setReviewQueue(!joinedAsGuest && localStorage.getItem("reelcase.watch-room.review-queue") === "true");
		} catch {
			setReviewQueue(false);
		}
		setSharedLocalMedia(null);
		setMediaHostId("");
		mediaHostRef.current = "";
		try {
			setGuestQueueEnabled(joinedAsGuest || localStorage.getItem("reelcase.watch-room.guest-queue") !== "false");
		} catch {
			setGuestQueueEnabled(true);
		}
		try {
			setGuestPlaybackEnabled(joinedAsGuest || localStorage.getItem("reelcase.watch-room.guest-playback") !== "false");
			setGuestSeekingEnabled(joinedAsGuest || localStorage.getItem("reelcase.watch-room.guest-seeking") !== "false");
		} catch {
			setGuestPlaybackEnabled(true);
			setGuestSeekingEnabled(true);
		}
		selectionRevision.current = 0;
		acceptedSelectionRevision.current = 0;
		undoQueue.current = void 0;
		setUndoRevision(void 0);
		queueRevisionRef.current = 0;
		queueRef.current = queue;
		if (joinedAsGuest) {
			queueRef.current = [];
			setQueue([]);
			setSharedVideoId("");
		}
		setQueueNotice("");
		lastAcceptedQueueRevision.current = 0;
		lastAcceptedTimelineAt.current = 0;
		lastAcceptedRoomStateAt.current = 0;
		setRoomHealth({
			lastPublishedAt: 0,
			lastHostStateAt: 0,
			lastQueueAt: 0,
			lastDriftSeconds: 0,
			queueRevision: 0,
			queueRequests: 0,
			queueAccepted: 0,
			staleDropped: 0,
			resyncRequests: 0
		});
		if (!room) {
			setRoomLedger([]);
			setLedgerRoom("");
			return;
		}
		try {
			const stored = JSON.parse(localStorage.getItem(`reelcase.watch-room.ledger.v1:${room}`) ?? "[]");
			setRoomLedger(Array.isArray(stored) ? stored.filter((item) => Boolean(item && typeof item.at === "number" && typeof item.kind === "string" && typeof item.detail === "string")).slice(-32) : []);
		} catch {
			setRoomLedger([]);
		}
		setLedgerRoom(room);
	}, [room]);
	(0, import_react.useEffect)(() => {
		if (!room || ledgerRoom !== room) return;
		try {
			localStorage.setItem(`reelcase.watch-room.ledger.v1:${room}`, JSON.stringify(roomLedger.slice(-32)));
		} catch {}
	}, [
		ledgerRoom,
		room,
		roomLedger
	]);
	const noteRoom = (0, import_react.useCallback)((kind, detail) => {
		if (!room) return;
		setRoomLedger((events) => [...events, {
			at: Date.now(),
			kind,
			detail
		}].slice(-32));
	}, [room]);
	(0, import_react.useEffect)(() => {
		if (!room || ledgerRoom !== room) return;
		noteRoom("session", `Opened as ${joinedAsGuest ? "guest" : "host"}; room commands require a fresh host state.`);
	}, [
		joinedAsGuest,
		ledgerRoom,
		noteRoom,
		room
	]);
	(0, import_react.useEffect)(() => {
		if (!localVideo) {
			setLocalVideoSource(null);
			return;
		}
		const url = URL.createObjectURL(localVideo);
		setLocalVideoSource({
			file: localVideo,
			url
		});
		return () => URL.revokeObjectURL(url);
	}, [localVideo]);
	(0, import_react.useEffect)(() => {
		localStorage.removeItem("reelcase.watch-room.pending-video");
	}, []);
	(0, import_react.useEffect)(() => {
		if (!activeRoom) {
			setRoomCandidates([]);
			setRoomCandidatesPending(false);
			return;
		}
		const controller = new AbortController();
		setRoomCandidates([]);
		setRoomCandidatesPending(true);
		const turn = catalogTurn(controller.signal);
		prepareRoomCandidates({
			videos,
			shared: sharedRoomVideos,
			guest: joinedAsGuest,
			favorites,
			hidden: hiddenVideos,
			unavailable,
			history,
			seed: candidateSeed,
			canStage: canStageRoomVideo,
			rank: roomShuffleRank
		}, turn).then((rows) => {
			if (controller.signal.aborted) return;
			setRoomCandidates(rows);
			setRoomCandidatesPending(false);
		}).catch(() => {
			if (!controller.signal.aborted) {
				setRoomCandidates([]);
				setRoomCandidatesPending(false);
				setInviteNotice("Room recommendations could not be prepared. Try reopening the room.");
			}
		});
		return () => controller.abort();
	}, [
		activeRoom,
		candidateSeed,
		favorites,
		hiddenVideos,
		history,
		videos,
		joinedAsGuest,
		sharedRoomVideos,
		unavailable
	]);
	(0, import_react.useEffect)(() => {
		const refresh = () => setRoomRatingRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	const localQueueCandidates = (0, import_react.useMemo)(() => {
		if (!roomLocalToolsOpen) return [];
		const result = [];
		for (const video of roomCandidates) {
			if (video.remote || video.id === sharedVideoId || queue.includes(video.id)) continue;
			result.push(video);
			if (result.length === 18) break;
		}
		return result;
	}, [
		queue,
		roomCandidates,
		roomLocalToolsOpen,
		sharedVideoId
	]);
	const youtubeRoomCandidates = (0, import_react.useMemo)(() => roomCandidates.filter((video) => video.remote?.kind === "youtube"), [roomCandidates]);
	const queueRecommendations = (0, import_react.useMemo)(() => {
		const alreadyShown = new Set(roomCandidates.slice(0, roomPickLimit).map((video) => video.id));
		const queued = new Set(queue);
		const unseen = [];
		for (const video of roomCandidates) {
			if (video.id === sharedVideoId || queued.has(video.id) || alreadyShown.has(video.id)) continue;
			unseen.push(video);
			if (unseen.length === 12) break;
		}
		return (unseen.length ? unseen : roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id))).slice(0, 12);
	}, [
		candidateSeed,
		queue,
		roomCandidates,
		roomPickLimit,
		sharedVideoId
	]);
	(0, import_react.useEffect)(() => {
		if (!activeRoom || playback.playing) return;
		return registerPeriodicTask({
			name: "Room discoveries",
			everyMs: 3e4,
			work: () => setCandidateSeed(Date.now())
		}).cancel;
	}, [activeRoom, playback.playing]);
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const invitedRoom = (params.get("room") ?? "").trim().toUpperCase();
		if (!/^RC[A-Z0-9]{4,12}$/.test(invitedRoom)) return;
		setRoomInput(invitedRoom);
		if (params.get("theater") === "1") {
			setJoinedAsGuest(true);
			setStageSize("cinema");
			setActiveRoom(invitedRoom);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (joinedAsGuest || !p2p.peers.length) return;
		const sentAt = Date.now();
		queueRevisionRef.current = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current);
		p2p.send({
			type: "room-state",
			playing: playback.playing,
			...providerClockFlags(),
			position: currentHostClock(),
			videoId: sharedVideoId,
			media: roomMedia,
			queue,
			queueMedia: roomQueueMedia,
			recentMedia,
			localQueue,
			queueRevision: queueRevisionRef.current,
			selectionRevision: selectionRevision.current,
			guestQueueEnabled,
			guestPlaybackEnabled,
			guestSeekingEnabled,
			reviewQueue,
			suggestions: suggestionsRef.current,
			reviewRevision: reviewRevision.current,
			sentAt
		});
		setRoomHealth((health) => ({
			...health,
			lastPublishedAt: sentAt,
			queueRevision: queueRevisionRef.current
		}));
	}, [
		joinedAsGuest,
		guestQueueEnabled,
		guestPlaybackEnabled,
		guestSeekingEnabled,
		localQueue,
		p2p.readyRevision,
		p2p.peers.length,
		queue,
		roomMedia,
		roomQueueMedia,
		recentMedia,
		reviewQueue,
		suggestions,
		sharedVideoId
	]);
	(0, import_react.useEffect)(() => {
		if (!joinedAsGuest || !p2p.joined || lastAcceptedRoomStateAt.current) return;
		let attempts = 0;
		const request = () => {
			if (lastAcceptedRoomStateAt.current || ++attempts > 8) {
				task.cancel();
				return;
			}
			p2p.send({
				type: "resync-request",
				sentAt: Date.now()
			});
			setRoomHealth((health) => ({
				...health,
				resyncRequests: health.resyncRequests + 1
			}));
			if (attempts === 1) noteRoom("request", "Requested the host’s initial state.");
		};
		const task = registerPeriodicTask({
			name: "Room initial sync",
			mode: "always",
			background: false,
			firstMs: 0,
			everyMs: 1500,
			work: request
		});
		return task.cancel;
	}, [
		joinedAsGuest,
		noteRoom,
		p2p.joined,
		p2p.readyRevision,
		p2p.send,
		room
	]);
	const requestClockSample = () => {
		const requestId = createLocalId("clock-");
		if (clockPings.current.size >= 8) clockPings.current.clear();
		clockPings.current.set(requestId, {
			wall: Date.now(),
			mono: performance.now()
		});
		p2p.send({
			type: "clock-request",
			requestId
		}, mediaHostRef.current || void 0);
	};
	const clockRequest = (0, import_react.useRef)(requestClockSample);
	clockRequest.current = requestClockSample;
	const resumeProvider = (0, import_react.useRef)(() => {});
	(0, import_react.useEffect)(() => {
		if (!joinedAsGuest || !p2p.joined) return;
		const samples = [
			0,
			500,
			1500
		].map((delay) => window.setTimeout(() => clockRequest.current(), delay));
		const resume = () => {
			if (document.visibilityState === "visible") {
				clockBestRtt.current = Infinity;
				clockRequest.current();
				resumeProvider.current();
			}
		};
		document.addEventListener("visibilitychange", resume);
		window.addEventListener("pageshow", resume);
		return () => {
			samples.forEach(window.clearTimeout);
			document.removeEventListener("visibilitychange", resume);
			window.removeEventListener("pageshow", resume);
		};
	}, [
		joinedAsGuest,
		p2p.joined,
		p2p.readyRevision,
		room
	]);
	(0, import_react.useEffect)(() => p2p.onMessage((from, raw, channel) => {
		const data = raw;
		if (!data || typeof data !== "object") return;
		if (data.requestId !== void 0 && (typeof data.requestId !== "string" || !data.requestId || data.requestId.length > 160)) return;
		const canonical = [
			"room-state",
			"sync",
			"video",
			"queue",
			"local-queue",
			"share-ready",
			"queue-result",
			"video-rejected",
			"queue-review-status",
			"clock-result",
			"playback-rejected"
		].includes(data.type ?? "");
		if (joinedAsGuest && canonical && mediaHostRef.current && from !== mediaHostRef.current) {
			if (peersRef.current.some((peer) => peer.id === mediaHostRef.current && peer.connectionState === "connected") || data.type !== "room-state") return;
			acceptedSelectionRevision.current = 0;
			lastAcceptedQueueRevision.current = 0;
			acceptedReviewRevision.current = 0;
			clockBestRtt.current = Infinity;
			lastAcceptedRoomStateAt.current = 0;
			lastAcceptedTimelineAt.current = 0;
		}
		if (joinedAsGuest && [
			"room-state",
			"video",
			"sync"
		].includes(data.type ?? "")) {
			if (data.type !== "video" && !trustedRoomSentAt(data.sentAt, Date.now() + (joinedAsGuest ? clockOffset.current : 0))) return;
			if (!acceptsRoomSelection(acceptedSelectionRevision.current, data.selectionRevision, currentVideoIdRef.current, data.videoId)) return;
			if (typeof data.selectionRevision === "number") acceptedSelectionRevision.current = data.selectionRevision;
		}
		if (!joinedAsGuest && (!guestQueueEnabled || reviewQueue && data.type !== "queue-suggest") && [
			"queue-suggest",
			"queue-action",
			"queue-edit",
			"queue-batch",
			"queue-shuffle",
			"queue-request",
			"next-request",
			"video-request",
			"local-queue-request",
			"local-stage-request"
		].includes(data.type ?? "")) {
			if (typeof data.requestId === "string" && data.requestId.length <= 160) {
				if (!replayQueueReceipt(from, data.requestId)) confirmQueueChange(from, data.requestId, guestQueueEnabled ? "The host is reviewing suggestions. Suggest a public video instead of editing the live queue." : "The host has locked queue edits and video selection. Playback timing and chat are still available.");
			} else p2p.send({
				type: "queue-rejected",
				text: "The host has locked queue edits and video selection."
			}, from);
			return;
		}
		if (data.type === "clock-request" && !joinedAsGuest && data.requestId) p2p.send({
			type: "clock-result",
			requestId: data.requestId,
			hostTime: Date.now()
		}, from);
		if (data.type === "clock-result" && joinedAsGuest && data.requestId) {
			const ping = clockPings.current.get(data.requestId);
			clockPings.current.delete(data.requestId);
			const sample = ping && roomClockSample(ping.wall, ping.mono, performance.now(), Number(data.hostTime));
			if (sample && sample.rtt < clockBestRtt.current) {
				clockBestRtt.current = sample.rtt;
				clockOffset.current = sample.offset;
				p2p.send({
					type: "resync-request",
					sentAt: Date.now()
				});
			}
		}
		if (data.type === "chat" && data.text) setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
		if (data.type === "room-pulse") p2p.send({
			type: "room-pulse-ack",
			sentAt: data.sentAt
		}, from);
		if (data.type === "room-pulse-ack" && data.sentAt) setPulseStatus(`Chat transport confirmed · ${Math.max(0, Date.now() - data.sentAt)}ms round trip.`);
		if (data.type === "share-ready" && data.name && data.fingerprint) {
			const share = {
				name: data.name,
				fingerprint: data.fingerprint,
				size: Number(data.size) || 0,
				modified: Number(data.modified) || 0
			};
			setPendingLocalShare(share);
			setInviteNotice(`${data.name} is shared by the host. Playback streams to this device; choosing a matching local copy is optional.`);
		}
		if (data.type === "share-matched" && data.name && data.fingerprint) {
			setLocalShareMatches((matches) => ({
				...matches,
				[from]: {
					name: data.name,
					fingerprint: data.fingerprint,
					at: Date.now()
				}
			}));
			setInviteNotice(`${data.name} was matched by a guest. The approved local copy can now follow the room timeline.`);
		}
		if (data.type === "playback-rejected" && joinedAsGuest && typeof data.text === "string") setInviteNotice(data.text.slice(0, 300));
		if (data.type === "sync-request" && !joinedAsGuest) {
			if (!trustedRoomSentAt(data.sentAt)) {
				setRoomHealth((health) => ({
					...health,
					staleDropped: health.staleDropped + 1
				}));
				noteRoom("dropped", "Ignored a guest playback request with an invalid clock.");
			} else {
				noteRoom("request", data.seek ? "Accepted a guest timeline seek request." : "Accepted a guest playback request.");
				if (data.videoId && data.videoId !== sharedVideoId) noteRoom("dropped", "Ignored a playback request for a different video.");
				else {
					const request = guestPlaybackRequest(playback, data, {
						playback: guestPlaybackEnabled,
						seeking: guestSeekingEnabled,
						live: isRoomLive()
					});
					if (!request.allowed) {
						p2p.send({
							type: "playback-rejected",
							text: request.reason
						}, from);
						noteRoom("dropped", "Rejected a guest request outside the current playback permissions.");
					} else sync({
						playing: request.playing,
						position: clampRoomClock(request.position)
					}, request.seek, true);
				}
			}
		}
		if (data.type === "sync") {
			if (!joinedAsGuest) return;
			const sentAt = trustedRoomSentAt(data.sentAt);
			if (!sentAt || sentAt < Math.max(lastAcceptedTimelineAt.current, lastAcceptedRoomStateAt.current)) {
				setRoomHealth((health) => ({
					...health,
					staleDropped: health.staleDropped + 1
				}));
				noteRoom("dropped", "Ignored an expired or out-of-order playback command.");
				return;
			}
			if (data.videoId && currentVideoIdRef.current && data.videoId !== currentVideoIdRef.current) return;
			acceptLiveStatus(data.videoId, data.live);
			const nextPosition = (Number(data.position) || 0) + (data.playing ? roomPacketElapsed(sentAt, Date.now(), clockOffset.current) : 0);
			const safePosition = clampRoomClock(!data.observed && !data.seek && nextPosition < lastRoomPosition.current ? lastRoomPosition.current : nextPosition, data.videoId);
			const drift = Math.abs(safePosition - estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && hostClockRunning ? youtubePlaybackStartedAt.current : null, Date.now()));
			lastAcceptedTimelineAt.current = sentAt;
			lastRoomPosition.current = safePosition;
			setHostClockRunning(data.clockRunning !== false);
			youtubePlaybackStartedAt.current = data.playing && data.clockRunning !== false ? Date.now() - safePosition * 1e3 : null;
			setTimelineEvidence({
				source: "remote",
				at: Date.now()
			});
			if (!isRoomLive(data.videoId) && (data.seek || drift > .75)) setRemoteSeekNonce((value) => value + 1);
			setPlayback({
				playing: Boolean(data.playing),
				position: safePosition
			});
			setRoomHealth((health) => ({
				...health,
				lastDriftSeconds: drift,
				lastHostStateAt: Date.now()
			}));
			if (!isRoomLive(data.videoId) && drift >= 1) noteRoom("timeline", `Reconciled ${drift.toFixed(1)}s of playback drift over ${channel}.`);
		}
		if (data.type === "video" && data.videoId && joinedAsGuest) {
			setSharedVideoId(data.videoId);
			acceptRoomMedia(from, data.media, data.videoId);
		}
		if (data.type === "video-request" && data.videoId && !joinedAsGuest) {
			if (typeof data.requestId === "string" && data.requestId.length <= 160 && replayQueueReceipt(from, data.requestId)) return;
			const requested = resolveGuestRoomVideo(data.videoId, data.media);
			if (requested) {
				noteRoom("request", "Accepted a guest video request.");
				chooseVideo(requested, data.action === "play");
			} else p2p.send({
				type: "video-rejected",
				text: "The host cannot open that file. Ask the host to choose and queue it; public YouTube and Twitch links can be shared directly."
			}, from);
			if (typeof data.requestId === "string" && data.requestId.length <= 160) confirmQueueChange(from, data.requestId, requested ? "Video selection confirmed by the host." : "That video is unavailable on the host; the current video was kept.");
		}
		if (data.type === "video-rejected" && joinedAsGuest) setInviteNotice(data.text?.slice(0, 300) || "The host could not play that title.");
		if (data.type === "next-request" && !joinedAsGuest) {
			if (typeof data.requestId === "string" && data.requestId.length <= 160 && replayQueueReceipt(from, data.requestId)) return;
			const current = data.videoId === currentVideoIdRef.current;
			if (current) playNext();
			if (typeof data.requestId === "string" && data.requestId.length <= 160) confirmQueueChange(from, data.requestId, current ? "Next-title request confirmed by the host." : "The room already moved to another video; your old request was not repeated.");
		}
		if (data.type === "queue-shuffle" && !joinedAsGuest && typeof data.requestId === "string" && data.requestId.length <= 160) {
			if (replayQueueReceipt(from, data.requestId)) return;
			shuffleQueue();
			confirmQueueChange(from, data.requestId, "Queue shuffle confirmed by the host.");
		}
		if (data.type === "queue-action" && !joinedAsGuest) {
			let operation = parseRoomQueueAction(data.operation);
			if (!operation || typeof data.requestId !== "string" || data.requestId.length > 160) return;
			if (replayQueueReceipt(from, data.requestId)) return;
			const addsTitle = operation.kind === "add" || operation.kind === "next";
			const requested = addsTitle ? resolveGuestRoomVideo(operation.id, data.media) : void 0;
			if (addsTitle && !requested) {
				confirmQueueChange(from, data.requestId, "This title is unavailable on the host. YouTube and Twitch links can be shared; local files must be opened by the host.");
				return;
			}
			if (requested) operation = {
				...operation,
				id: requested.id
			};
			if (operation.id === currentVideoIdRef.current || operation.kind === "add" && queueRef.current.includes(operation.id)) {
				confirmQueueChange(from, data.requestId, "That video is already playing or queued.");
				return;
			}
			if (addsTitle && !queueRef.current.includes(operation.id) && queueRef.current.length >= 48) {
				confirmQueueChange(from, data.requestId, "The queue is full. Remove a title before adding another.");
				return;
			}
			publishQueue(applyRoomQueueAction(queueRef.current, operation));
			confirmQueueChange(from, data.requestId, "Queue change confirmed by the host.");
			noteRoom("queue", `Applied a guest ${operation.kind} action to the latest queue.`);
		}
		if (data.type === "queue-edit" && !joinedAsGuest) {
			const edit = parseRoomQueueEdit(data.operation);
			if (!edit || typeof data.requestId !== "string") return;
			if (replayQueueReceipt(from, data.requestId)) return;
			editQueue(edit);
			confirmQueueChange(from, data.requestId, "Selected-title change confirmed by the host.");
		}
		if (data.type === "queue-batch" && !joinedAsGuest && Array.isArray(data.queueMedia) && typeof data.requestId === "string" && data.requestId.length <= 160) {
			if (replayQueueReceipt(from, data.requestId)) return;
			const result = queueLinkBatch(data.queueMedia);
			const skipped = result.invalid + Math.min(48, Math.max(0, Number(data.skipped) || 0));
			const duplicates = result.duplicates + Math.min(48, Math.max(0, Number(data.duplicates) || 0));
			confirmQueueChange(from, data.requestId, batchQueueNotice({
				...result,
				invalid: skipped,
				duplicates
			}, Boolean(data.truncated)));
		}
		if (data.type === "queue-suggest" && !joinedAsGuest && Array.isArray(data.queueMedia) && typeof data.requestId === "string") {
			if (replayQueueReceipt(from, data.requestId)) return;
			if (!reviewQueue) {
				confirmQueueChange(from, data.requestId, "Suggestion review is off. Use the normal queue controls.");
				return;
			}
			const keys = [currentVideoIdRef.current, ...queueRef.current].flatMap((id) => {
				const video = roomVideoForId(id);
				return video ? [roomMediaKey(video)] : [];
			});
			const result = addRoomSuggestions(suggestionsRef.current, data.queueMedia, from, peersRef.current.find((peer) => peer.id === from)?.name || "Guest", keys);
			if (result.added) {
				reviewRevision.current++;
				suggestionsRef.current = result.items;
				setSuggestions(result.items);
			}
			const invalid = result.invalid + Math.min(48, Math.max(0, Number(data.skipped) || 0));
			const duplicates = result.duplicates + Math.min(48, Math.max(0, Number(data.duplicates) || 0));
			const text = [
				result.added + " sent for host review",
				duplicates ? duplicates + " already playing, queued or awaiting review" : "",
				invalid ? invalid + " invalid public videos" : "",
				result.limited ? result.limited + " held back · suggestion limit reached" : "",
				data.truncated ? "Only the first 48 links were checked" : ""
			].filter(Boolean).join(" · ");
			confirmQueueChange(from, data.requestId, text);
		}
		if (data.type === "queue-review-status" && joinedAsGuest && typeof data.text === "string") setQueueNotice(data.text.slice(0, 300));
		if (data.type === "queue-result" && joinedAsGuest && typeof data.requestId === "string") acceptQueueReceipt(from, data.requestId, data.text || "");
		if (data.type === "queue-batch-result" && joinedAsGuest) setQueueNotice(data.text?.slice(0, 300) || "The host checked your queue links.");
		if (data.type === "queue-rejected" && joinedAsGuest) setQueueNotice(data.text?.slice(0, 300) || "The host could not apply this queue change.");
		if (data.type === "queue-request" && Array.isArray(data.queue) && !joinedAsGuest) {
			if (data.queueRevision !== queueRevisionRef.current) {
				p2p.send({
					type: "queue",
					queue: queueRef.current,
					queueMedia: roomQueueMedia,
					queueRevision: queueRevisionRef.current,
					sentAt: Date.now()
				}, from);
				return;
			}
			const requested = normalizeRoomQueue(data.queue).filter((id) => id !== sharedVideoId && Boolean(lookupVideo(videos, id) && canStageRoomVideo(lookupVideo(videos, id))));
			const revision = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current) + 1;
			queueRevisionRef.current = revision;
			lastAcceptedQueueRevision.current = revision;
			queueRef.current = requested;
			setQueue(requested);
			p2p.send({
				type: "queue",
				queue: requested,
				queueMedia: requested.map((id) => describeRoomMedia(videos.find((video) => video.id === id))),
				queueRevision: revision,
				sentAt: Date.now()
			});
			setRoomHealth((health) => ({
				...health,
				queueAccepted: health.queueAccepted + 1,
				queueRevision: revision,
				lastQueueAt: Date.now()
			}));
			noteRoom("queue", `Accepted a guest queue proposal as revision ${revision}.`);
		}
		if (data.type === "queue" && Array.isArray(data.queue) && joinedAsGuest) {
			const revision = Number.isInteger(data.queueRevision) && Number(data.queueRevision) >= 0 ? Number(data.queueRevision) : 0;
			if (revision < lastAcceptedQueueRevision.current) {
				setRoomHealth((health) => ({
					...health,
					staleDropped: health.staleDropped + 1
				}));
				noteRoom("dropped", `Ignored stale queue revision ${revision}.`);
			} else {
				const accepted = normalizeRoomQueue(data.queue);
				if (revision) lastAcceptedQueueRevision.current = revision;
				queueRef.current = accepted;
				setQueue(accepted);
				if (Array.isArray(data.queueMedia)) adoptRoomMedia(data.queueMedia, [currentVideoIdRef.current, ...accepted]);
				setRoomHealth((health) => ({
					...health,
					queueRevision: revision || health.queueRevision,
					lastQueueAt: Date.now()
				}));
			}
		}
		if (data.type === "local-queue-request" && Array.isArray(data.localQueue) && !joinedAsGuest) {
			const requested = normalizeLocalRoomQueue(data.localQueue);
			setLocalQueue(requested);
			p2p.send({
				type: "local-queue",
				localQueue: requested,
				sentAt: Date.now()
			});
			noteRoom("queue", "Accepted a guest local-handoff queue proposal.");
		}
		if (data.type === "local-queue" && Array.isArray(data.localQueue) && joinedAsGuest) setLocalQueue(normalizeLocalRoomQueue(data.localQueue));
		if (data.type === "local-stage-request" && data.fingerprint && !joinedAsGuest) {
			const requested = localQueue.find((share) => share.fingerprint === data.fingerprint);
			if (requested) {
				noteRoom("request", "Accepted a guest request to stage a local handoff.");
				stageLocalShare(requested);
			}
		}
		if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({
			...votes,
			[data.name]: Number(data.position) || 0
		}));
		if (data.type === "room-state") {
			if (!joinedAsGuest) return;
			const sentAt = trustedRoomSentAt(data.sentAt);
			if (!sentAt || sentAt < Math.max(lastAcceptedRoomStateAt.current, lastAcceptedTimelineAt.current)) {
				setRoomHealth((health) => ({
					...health,
					staleDropped: health.staleDropped + 1
				}));
				noteRoom("dropped", "Ignored an expired or out-of-order host state.");
				return;
			}
			const videoChanged = Boolean(data.videoId && data.videoId !== currentVideoIdRef.current);
			mediaHostRef.current = from;
			setMediaHostId(from);
			if (Array.isArray(data.recentMedia)) {
				const recent = roomRecentMedia(data.recentMedia);
				recentMediaRef.current = recent;
				setRecentMedia(recent);
			}
			if (acceptsRoomReviewRevision(acceptedReviewRevision.current, data.reviewRevision)) {
				acceptedReviewRevision.current = data.reviewRevision ?? 0;
				setReviewQueue(data.reviewQueue === true);
				const items = readRoomSuggestions(data.suggestions);
				suggestionsRef.current = items;
				setSuggestions(items);
				if (typeof data.guestQueueEnabled === "boolean") setGuestQueueEnabled(data.guestQueueEnabled);
				if (typeof data.guestPlaybackEnabled === "boolean") setGuestPlaybackEnabled(data.guestPlaybackEnabled);
				if (typeof data.guestSeekingEnabled === "boolean") setGuestSeekingEnabled(data.guestSeekingEnabled);
			}
			if (data.videoId) setSharedVideoId(data.videoId);
			acceptRoomMedia(from, data.media, data.videoId);
			acceptLiveStatus(data.videoId, data.live);
			if ((data.live === true || data.media?.live === true) && data.videoId) markRoomLive(data.videoId);
			if (Array.isArray(data.queue)) {
				const revision = Number.isInteger(data.queueRevision) && Number(data.queueRevision) >= 0 ? Number(data.queueRevision) : 0;
				if (revision >= lastAcceptedQueueRevision.current) {
					if (revision) lastAcceptedQueueRevision.current = revision;
					queueRef.current = normalizeRoomQueue(data.queue);
					setQueue(queueRef.current);
					if (Array.isArray(data.queueMedia)) adoptRoomMedia(data.queueMedia, [currentVideoIdRef.current, ...queueRef.current]);
					setRoomHealth((health) => ({
						...health,
						queueRevision: revision || health.queueRevision,
						lastQueueAt: Date.now()
					}));
				} else {
					setRoomHealth((health) => ({
						...health,
						staleDropped: health.staleDropped + 1
					}));
					noteRoom("dropped", `Ignored stale queue revision ${revision} in a room state.`);
				}
			}
			if (Array.isArray(data.localQueue)) setLocalQueue(normalizeLocalRoomQueue(data.localQueue));
			const nextPosition = (Number(data.position) || 0) + (data.playing ? roomPacketElapsed(sentAt, Date.now(), clockOffset.current) : 0);
			const safePosition = clampRoomClock(!data.observed && !videoChanged && nextPosition + .75 < lastRoomPosition.current ? lastRoomPosition.current : nextPosition, data.videoId);
			const drift = Math.abs(safePosition - estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && hostClockRunning ? youtubePlaybackStartedAt.current : null, Date.now()));
			lastAcceptedRoomStateAt.current = sentAt;
			lastAcceptedTimelineAt.current = Math.max(lastAcceptedTimelineAt.current, sentAt);
			lastRoomPosition.current = safePosition;
			setHostClockRunning(data.clockRunning !== false);
			youtubePlaybackStartedAt.current = data.playing && data.clockRunning !== false ? Date.now() - safePosition * 1e3 : null;
			setTimelineEvidence({
				source: "remote",
				at: Date.now()
			});
			if (videoChanged || !isRoomLive(data.videoId) && drift > .75) setRemoteSeekNonce((value) => value + 1);
			setPlayback({
				playing: Boolean(data.playing),
				position: safePosition
			});
			setRoomHealth((health) => ({
				...health,
				lastHostStateAt: Date.now(),
				lastDriftSeconds: drift
			}));
			if (!isRoomLive(data.videoId) && drift >= 1) noteRoom("timeline", `Reconciled ${drift.toFixed(1)}s from the authoritative room state.`);
		}
		if (data.type === "resync-request" && !joinedAsGuest) {
			const position = currentHostClock();
			const sentAt = Date.now();
			p2p.send({
				type: "room-state",
				playing: playback.playing,
				...providerClockFlags(),
				position,
				videoId: sharedVideoId,
				media: roomMedia,
				queue,
				queueMedia: roomQueueMedia,
				recentMedia: recentMediaRef.current,
				localQueue,
				queueRevision: queueRevisionRef.current,
				selectionRevision: selectionRevision.current,
				guestQueueEnabled,
				guestPlaybackEnabled,
				guestSeekingEnabled,
				reviewQueue,
				suggestions: suggestionsRef.current,
				reviewRevision: reviewRevision.current,
				sentAt
			}, from);
			setRoomHealth((health) => ({
				...health,
				lastPublishedAt: sentAt
			}));
			noteRoom("state", "Sent a targeted state reconciliation to a guest.");
		}
	}), [
		joinedAsGuest,
		guestQueueEnabled,
		guestPlaybackEnabled,
		guestSeekingEnabled,
		reviewQueue,
		localQueue,
		noteRoom,
		p2p.onMessage,
		p2p.send,
		playback.playing,
		playback.position,
		queue,
		sharedVideoId,
		videos,
		sharedRoomVideos,
		measuredDuration,
		acceptRoomMedia,
		roomMedia,
		roomQueueMedia,
		replayQueueReceipt,
		confirmQueueChange,
		acceptQueueReceipt
	]);
	const sync = (next, seek = false, explicit = false) => {
		if (seek && isRoomLive()) return;
		if (!seek && !explicit && Date.now() < applyingRemotePlaybackUntil.current) return;
		if (joinedAsGuest) {
			if (seek && !guestSeekingEnabled || !seek && !guestPlaybackEnabled) {
				if (explicit || seek) setInviteNotice(seek ? "The host is handling timeline seeking." : "The host is handling play and pause.");
				return;
			}
			p2p.send({
				type: "sync-request",
				...next,
				videoId: sharedVideoId,
				seek,
				sentAt: Date.now() + clockOffset.current
			});
			setInviteNotice("Playback change sent to the host. Your theater will reconcile when it is confirmed.");
			noteRoom("request", seek ? "Requested a host timeline seek." : "Requested a host playback update.");
			return;
		}
		if (next.playing && !playback.playing && lastEndedTitle.current === sharedVideoId) {
			next = {
				playing: true,
				position: 0
			};
			seek = true;
			lastEndedTitle.current = "";
		}
		const isYoutube = sharedVideo?.remote?.kind === "youtube";
		const isTwitch = sharedVideo?.remote?.kind === "twitch";
		const playerPosition = isTwitch ? twitchPlayerRef.current?.getCurrentTime() : void 0;
		const hasTwitchPosition = typeof playerPosition === "number" && Number.isFinite(playerPosition) && playerPosition > .25;
		const providerFallback = lastRoomPosition.current > .25 && next.position <= .25 && !seek;
		const providerClock = estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing ? youtubePlaybackStartedAt.current : null, Date.now());
		const youtubeActual = isYoutube ? providerPosition(youtubeClock.current, sharedVideoId, performance.now()) : void 0;
		const position = !seek && youtubeActual !== void 0 ? youtubeActual : !seek && !sharedVideo?.remote && roomVideoRef.current ? roomVideoRef.current.currentTime : seek ? next.position : (isYoutube || isTwitch) && !next.playing ? Math.max(providerClock, next.position) : isTwitch ? hasTwitchPosition ? Math.max(playerPosition, providerClock, next.position) : providerFallback ? providerClock : Math.max(providerClock, next.position) : providerFallback ? providerClock : isYoutube ? Math.max(providerClock, next.position) : next.position;
		const resolved = {
			...next,
			position: clampRoomClock(position)
		};
		lastRoomPosition.current = resolved.position;
		youtubePlaybackStartedAt.current = resolved.playing ? Date.now() - resolved.position * 1e3 : null;
		setTimelineEvidence({
			source: sharedVideo?.remote ? "estimated" : "local",
			at: Date.now()
		});
		setPlayback(resolved);
		if (resolved.playing && sharedVideoId && !sharedVideoId.startsWith("local:") && lastRoomHistoryId.current !== sharedVideoId) {
			lastRoomHistoryId.current = sharedVideoId;
			recordPlay(sharedVideoId, "watch-room");
		}
		if (seek) setRemoteSeekNonce((value) => value + 1);
		const sentAt = Date.now();
		p2p.send({
			type: "sync",
			...resolved,
			live: providerClockFlags().live,
			videoId: sharedVideoId,
			selectionRevision: selectionRevision.current,
			seek,
			sentAt
		});
		setRoomHealth((health) => ({
			...health,
			lastPublishedAt: sentAt
		}));
	};
	const syncDevicePlayback = (next, seek = false) => {
		if (joinedAsGuest && Date.now() < applyingRemotePlaybackUntil.current) return;
		sync({
			...next,
			position: hostPlaybackPosition(next.position, guestPlayerOffset.current, roomDuration())
		}, seek);
	};
	(0, import_react.useEffect)(() => {
		if (!joinedAsGuest) return;
		applyingRemotePlaybackUntil.current = Date.now() + 1200;
		suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
		setRemoteSeekNonce((value) => value + 1);
	}, [guestOffset, joinedAsGuest]);
	(0, import_react.useEffect)(() => {
		const provider = sharedVideo?.remote?.kind;
		if (!provider || !playback.playing) return;
		return registerPeriodicTask({
			name: "Room playback clock",
			mode: "always",
			background: false,
			everyMs: 1e3,
			work: () => {
				const observed = !joinedAsGuest && provider === "youtube" ? providerPosition(youtubeClock.current, sharedVideo.id, performance.now()) : void 0;
				const twitchRaw = !joinedAsGuest && provider === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : void 0;
				const twitchTime = typeof twitchRaw === "number" && (twitchRaw > .25 || playback.position <= .25) ? twitchRaw : void 0;
				const actual = observed ?? (typeof twitchTime === "number" && Number.isFinite(twitchTime) ? twitchTime : void 0);
				if (!joinedAsGuest && provider === "twitch" && typeof twitchTime === "number") {
					const previous = twitchProgress.current;
					if (!previous || previous.id !== sharedVideo.id || Math.abs(previous.position - twitchTime) > .03) twitchProgress.current = {
						id: sharedVideo.id,
						position: twitchTime,
						movedAt: performance.now()
					};
				}
				const running = joinedAsGuest ? hostClockRunning : provider === "youtube" && observed !== void 0 ? youtubeClock.current?.state === 1 : provider === "twitch" ? twitchPlayingRef.current && (!twitchProgress.current || performance.now() - twitchProgress.current.movedAt < 1800) : true;
				const estimated = clampRoomClock(actual ?? estimatedProviderPosition(lastRoomPosition.current, playback.position, running ? youtubePlaybackStartedAt.current : null, Date.now()));
				lastRoomPosition.current = estimated;
				setPlayback((current) => current.playing ? {
					...current,
					position: estimated
				} : current);
				setTimelineEvidence({
					source: actual === void 0 ? "estimated" : "local",
					at: Date.now()
				});
				if (!joinedAsGuest) p2p.send({
					type: "sync",
					playing: true,
					position: estimated,
					live: providerClockFlags().live,
					clockRunning: running,
					observed: actual !== void 0,
					videoId: sharedVideoId,
					selectionRevision: selectionRevision.current,
					seek: false,
					sentAt: Date.now()
				});
			}
		}).cancel;
	}, [
		joinedAsGuest,
		p2p.send,
		playback.playing,
		sharedVideo?.id,
		sharedVideo?.remote?.kind,
		hostClockRunning
	]);
	const resync = () => {
		if (joinedAsGuest) {
			p2p.send({
				type: "resync-request",
				sentAt: Date.now()
			});
			setRoomHealth((health) => ({
				...health,
				resyncRequests: health.resyncRequests + 1
			}));
			noteRoom("request", "Requested an explicit host state reconciliation.");
			setInviteNotice("Requested the host’s current room state.");
			return;
		}
		const position = currentHostClock();
		const playing = roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing;
		lastRoomPosition.current = position;
		youtubePlaybackStartedAt.current = playing ? Date.now() - position * 1e3 : null;
		setPlayback({
			playing,
			position
		});
		const sentAt = Date.now();
		p2p.send({
			type: "room-state",
			playing,
			...providerClockFlags(),
			position,
			videoId: sharedVideoId,
			media: roomMedia,
			queue,
			queueMedia: roomQueueMedia,
			recentMedia: recentMediaRef.current,
			localQueue,
			queueRevision: queueRevisionRef.current,
			selectionRevision: selectionRevision.current,
			guestQueueEnabled,
			guestPlaybackEnabled,
			guestSeekingEnabled,
			reviewQueue,
			suggestions: suggestionsRef.current,
			reviewRevision: reviewRevision.current,
			sentAt
		});
		setRoomHealth((health) => ({
			...health,
			lastPublishedAt: sentAt
		}));
		noteRoom("state", "Published an explicit room reconciliation.");
		setInviteNotice("Sent the current video and timeline to every guest.");
	};
	const providerTarget = () => guestPlaybackPosition(estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && (!joinedAsGuest || hostClockRunning) ? youtubePlaybackStartedAt.current : null, Date.now()), guestPlayerOffset.current, roomDuration());
	const providerSync = (0, import_react.useRef)(syncDevicePlayback);
	providerSync.current = syncDevicePlayback;
	const alignAfterStart = (0, import_react.useRef)(() => {});
	alignAfterStart.current = () => {
		if (!joinedAsGuest || !catchUpOnStart.current) return;
		catchUpOnStart.current = false;
		suppressRemotePlayerEchoUntil.current = Date.now() + 1500;
		const target = providerTarget();
		if (sharedVideo?.remote?.kind === "youtube") {
			const frame = remoteFrameRef.current?.contentWindow, origin = new URL(watchRoomEmbed(sharedVideo)).origin;
			if (!isRoomLive() && youtubeMetadataReady.current === sharedVideo.id) frame?.postMessage(JSON.stringify({
				event: "command",
				func: "seekTo",
				args: [target, true]
			}), origin);
			if (!providerPlaybackWanted(playback.playing, true, hostClockRunning, isRoomLive())) frame?.postMessage(JSON.stringify({
				event: "command",
				func: "pauseVideo",
				args: []
			}), origin);
		} else if (sharedVideo?.remote?.kind === "twitch" && !twitchClip) {
			if (!sharedVideo.remote.live) twitchPlayerRef.current?.seek(target);
			if (!playback.playing || !hostClockRunning) twitchPlayerRef.current?.pause();
		}
		resync();
	};
	const startThisDevice = () => {
		catchUpOnStart.current = true;
		youtubeFailure.current = void 0;
		setPlayerNotice("");
		suppressRemotePlayerEchoUntil.current = Date.now() + 1500;
		const target = providerTarget();
		if (sharedVideo?.remote?.kind === "youtube") {
			const frame = remoteFrameRef.current?.contentWindow, origin = new URL(watchRoomEmbed(sharedVideo)).origin;
			if (!youtubeReady.current) {
				frame?.postMessage(JSON.stringify({
					event: "listening",
					id: "room-youtube"
				}), origin);
				setRemoteFrameReady({
					id: sharedVideo.id,
					at: Date.now()
				});
			}
			if (!isRoomLive() && youtubeMetadataReady.current === sharedVideo.id) frame?.postMessage(JSON.stringify({
				event: "command",
				func: "seekTo",
				args: [target, true]
			}), origin);
			const wanted = providerPlaybackWanted(playback.playing, joinedAsGuest, hostClockRunning, isRoomLive());
			lastYoutubePlaybackCommand.current = wanted;
			frame?.postMessage(JSON.stringify({
				event: "command",
				func: wanted ? "playVideo" : "pauseVideo",
				args: []
			}), origin);
		} else if (sharedVideo?.remote?.kind === "twitch" && !twitchClip) {
			if (!sharedVideo.remote.live) twitchPlayerRef.current?.seek(target);
			if (playback.playing && hostClockRunning) twitchPlayerRef.current?.play();
			else twitchPlayerRef.current?.pause();
		}
		clockRequest.current();
		resync();
	};
	resumeProvider.current = () => {
		catchUpOnStart.current = true;
		if (youtubeClock.current?.state !== 1) lastYoutubePlaybackCommand.current = null;
		setRemoteSeekNonce((value) => value + 1);
		resync();
	};
	(0, import_react.useEffect)(() => {
		const media = roomVideoRef.current;
		if (!media || sharedVideo?.remote) return;
		let cancelled = false;
		const driftLimit = playback.playing ? .65 : .1;
		if (Math.abs(media.currentTime - devicePlaybackPosition) > driftLimit) {
			if (joinedAsGuest) applyingRemotePlaybackUntil.current = Date.now() + 900;
			media.currentTime = devicePlaybackPosition;
		}
		if (joinedAsGuest && (playback.playing && media.paused || !playback.playing && !media.paused)) applyingRemotePlaybackUntil.current = Date.now() + 900;
		if (playback.playing && media.paused) media.play().catch((error) => {
			if (cancelled || roomVideoRef.current !== media) return;
			if (error instanceof DOMException && error.name === "NotAllowedError") {
				observePlayer("blocked");
				setInviteNotice("This browser needs a Play press to start the local video.");
				if (!joinedAsGuest) sync({
					playing: false,
					position: media.currentTime
				});
			}
		});
		if (!playback.playing && !media.paused) media.pause();
		return () => {
			cancelled = true;
		};
	}, [
		playback,
		sharedVideo,
		libraryLocalSource,
		matchingLocalSource,
		joinedAsGuest,
		devicePlaybackPosition
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "youtube" || remoteFrameReady?.id !== sharedVideo.id || !youtubeReady.current || youtubeFailure.current) return;
		const frame = remoteFrameRef.current?.contentWindow;
		if (!frame) return;
		const target = new URL(watchRoomEmbed(sharedVideo)).origin;
		if (remoteSeekNonce !== lastYoutubeSeekNonce.current) {
			lastYoutubeSeekNonce.current = remoteSeekNonce;
			if (remoteSeekNonce && !isRoomLive() && youtubeMetadataReady.current === sharedVideo.id) {
				suppressRemotePlayerEchoUntil.current = Date.now() + 1e3;
				frame.postMessage(JSON.stringify({
					event: "command",
					func: "seekTo",
					args: [joinedAsGuest ? providerTarget() : devicePlaybackPosition, true]
				}), target);
			}
		}
		const wanted = providerPlaybackWanted(playback.playing, joinedAsGuest, hostClockRunning, isRoomLive());
		if (lastYoutubePlaybackCommand.current !== wanted) {
			lastYoutubePlaybackCommand.current = wanted;
			suppressRemotePlayerEchoUntil.current = Date.now() + 750;
			frame.postMessage(JSON.stringify({
				event: "command",
				func: wanted ? "playVideo" : "pauseVideo",
				args: []
			}), target);
		}
	}, [
		playback.playing,
		remoteFrameReady,
		remoteSeekNonce,
		sharedVideo?.id,
		sharedVideo?.remote?.live,
		guestOffset,
		hostClockRunning,
		joinedAsGuest
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "twitch" || twitchClip || twitchEnvironment.blocked) {
			twitchPlayerRef.current = null;
			return;
		}
		const host = twitchPlayerHostRef.current;
		if (!host) return;
		let cancelled = false;
		let readyTimeout;
		const hostId = `reelcase-twitch-${p2p.selfId}`;
		host.id = hostId;
		host.replaceChildren();
		twitchPlayingRef.current = false;
		setTwitchActuallyPlaying(false);
		setTwitchPlayerReady(0);
		lastTwitchSeekNonce.current = -1;
		setTwitchPlayerStatus("Loading Twitch interactive player…");
		loadTwitchEmbed().then((api) => {
			if (cancelled) return;
			const live = Boolean(sharedVideo.remote?.live);
			const canonical = twitchEmbedUrl(sharedVideo.remote, twitchEnvironment.parents);
			if (!canonical) throw Error("Twitch address is unavailable");
			const source = new URL(canonical), video = source.searchParams.get("video") ?? void 0, channel = source.searchParams.get("channel") ?? void 0;
			if (live ? !channel : !video) throw Error("Twitch channel or video is unavailable");
			const player = new api.Player(hostId, {
				width: "100%",
				height: "100%",
				parent: twitchEnvironment.parents,
				autoplay: false,
				muted: false,
				...live ? { channel } : { video }
			});
			readyTimeout = setTimeout(() => {
				if (!cancelled) {
					observePlayer("error");
					setTwitchPlayerStatus("Twitch did not become ready. Check the room’s HTTPS address, then reload this player or open Twitch.");
				}
			}, 15e3);
			twitchPlayerRef.current = player;
			lastTwitchPlaybackCommand.current = null;
			const events = player.constructor;
			player.addEventListener(events.READY ?? "ready", () => {
				if (!cancelled) {
					clearTimeout(readyTimeout);
					const duration = player.getDuration?.();
					if (!live && typeof duration === "number" && Number.isFinite(duration) && duration > 0) setMeasuredDuration({
						videoId: sharedVideo.id,
						seconds: duration
					});
					observePlayer("ready");
					setTwitchPlayerStatus("Twitch player ready. Use room controls to start.");
					setTwitchPlayerReady(Date.now());
				}
			});
			player.addEventListener(events.PLAY ?? "play", () => {
				if (cancelled) return;
				if (!twitchPlayingRef.current) observePlayer("buffering");
				const position = player.getCurrentTime();
				if (!cancelled && (!joinedAsGuest || !catchUpOnStart.current) && Date.now() > suppressRemotePlayerEchoUntil.current) providerSync.current({
					playing: true,
					position
				});
			});
			player.addEventListener(events.PAUSE ?? "pause", () => {
				if (cancelled) return;
				observePlayer("paused");
				twitchPlayingRef.current = false;
				setTwitchActuallyPlaying(false);
				const position = player.getCurrentTime();
				if (!cancelled && (!joinedAsGuest || !catchUpOnStart.current) && Date.now() > suppressRemotePlayerEchoUntil.current) providerSync.current({
					playing: false,
					position
				});
			});
			player.addEventListener(events.SEEK ?? "seek", () => {
				if (!cancelled && !live && Date.now() > suppressRemotePlayerEchoUntil.current) providerSync.current({
					playing: true,
					position: player.getCurrentTime()
				}, true);
			});
			player.addEventListener(events.PLAYING ?? "playing", () => {
				if (!cancelled) {
					twitchPlayingRef.current = true;
					setTwitchActuallyPlaying(true);
					observePlayer("playing");
					setTwitchPlayerStatus("Twitch playback started.");
					alignAfterStart.current();
				}
			});
			player.addEventListener(events.PLAYBACK_BLOCKED ?? "playback-blocked", () => {
				if (!cancelled) {
					twitchPlayingRef.current = false;
					setTwitchActuallyPlaying(false);
					observePlayer("blocked");
					setTwitchPlayerStatus("Twitch blocked playback. Press Play in its player or Start on this device.");
					catchUpOnStart.current = true;
				}
			});
			player.addEventListener(events.ENDED ?? "ended", () => {
				if (!cancelled) {
					observePlayer("ended");
					finishLatestRoomTitle.current();
				}
			});
		}).catch(() => {
			if (!cancelled) {
				observePlayer("error");
				setTwitchPlayerStatus("Twitch interactive player could not load. Open Twitch directly below.");
			}
		});
		return () => {
			cancelled = true;
			clearTimeout(readyTimeout);
			twitchPlayerRef.current = null;
			lastTwitchPlaybackCommand.current = null;
			host.replaceChildren();
		};
	}, [
		p2p.selfId,
		room,
		sharedVideo?.id,
		playerReload
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "twitch" || twitchClip) return;
		const player = twitchPlayerRef.current;
		if (!player || !twitchPlayerReady) return;
		if (remoteSeekNonce !== lastTwitchSeekNonce.current) {
			lastTwitchSeekNonce.current = remoteSeekNonce;
			if (remoteSeekNonce && !sharedVideo.remote.live) {
				suppressRemotePlayerEchoUntil.current = Date.now() + 1e3;
				player.seek(joinedAsGuest ? providerTarget() : devicePlaybackPosition);
			}
		}
		if (joinedAsGuest && !sharedVideo.remote.live && playback.playing && hostClockRunning && twitchPlayingRef.current && !catchUpOnStart.current && Date.now() > suppressRemotePlayerEchoUntil.current && providerNeedsCorrection(player.getCurrentTime(), providerTarget(), performance.now(), lastProviderCorrection.current)) {
			lastProviderCorrection.current = performance.now();
			suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
			player.seek(providerTarget());
		}
		if (lastTwitchPlaybackCommand.current !== (playback.playing && (!joinedAsGuest || hostClockRunning))) {
			lastTwitchPlaybackCommand.current = playback.playing && (!joinedAsGuest || hostClockRunning);
			suppressRemotePlayerEchoUntil.current = Date.now() + 750;
			if (lastTwitchPlaybackCommand.current) player.play();
			else player.pause();
		}
	}, [
		playback.playing,
		playback.position,
		remoteSeekNonce,
		sharedVideo?.id,
		twitchPlayerReady,
		guestOffset,
		hostClockRunning
	]);
	const toggleRoomPlayback = () => {
		const playing = !playback.playing;
		const player = twitchPlayerRef.current;
		if (sharedVideo?.remote?.kind === "twitch" && !twitchClip && !twitchEnvironment.blocked && (!player || !twitchPlayerReady)) {
			setInviteNotice("Twitch is still preparing its player. Wait for “Twitch player ready,” then press Play.");
			return;
		}
		if (sharedVideo?.remote?.kind === "twitch" && !twitchClip && player) {
			lastTwitchPlaybackCommand.current = playing;
			suppressRemotePlayerEchoUntil.current = Date.now() + 750;
			if (playing) {
				player.setMuted?.(false);
				player.play();
				setTwitchPlayerStatus("Starting Twitch from the room control…");
				window.setTimeout(() => {
					if (!twitchPlayingRef.current) setTwitchPlayerStatus("Twitch is waiting for a Play press inside its player.");
				}, 1800);
			} else player.pause();
		}
		sync({
			...playback,
			playing
		}, false, true);
	};
	const chooseVideo = (video, startPlayback = false) => {
		if (joinedAsGuest) {
			if (!queueWritable) {
				setQueueNotice(hostConnected ? "The host has locked queue edits and video selection." : "Waiting for the host connection before selecting a video.");
				return;
			}
			requestQueueChange({
				type: "video-request",
				videoId: video.id,
				media: describeRoomMedia(video),
				action: startPlayback ? "play" : "stage"
			}, "Video selection requested · waiting for host confirmation.");
			setInviteNotice(`Requested ${video.name} from the host. The room changes only after host confirmation.`);
			noteRoom("request", "Requested a host video change.");
			return;
		}
		const file = localFiles.current.get(video.id);
		if (!video.remote && video.id.startsWith("local:") && !file) {
			setInviteNotice(`Choose ${video.name} on the host before playing it.`);
			return;
		}
		const previous = roomVideoForId(currentVideoIdRef.current);
		if (previous?.remote && roomMediaKey(previous) !== roomMediaKey(video)) {
			const recent = roomRecentMedia([describeRoomMedia(previous), ...recentMediaRef.current]);
			recentMediaRef.current = recent;
			setRecentMedia(recent);
		}
		if (video.remote) adoptRoomMedia([describeRoomMedia(video)], [video.id, ...queueRef.current]);
		const share = file ? {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		} : null;
		setLocalVideo(file ?? null);
		setLocalShare(share);
		setLocalShareMatches({});
		selectionRevision.current++;
		lastEndedTitle.current = "";
		setSharedVideoId(video.id);
		const selectedKey = roomMediaKey(video);
		const remaining = queueRef.current.filter((id) => {
			const queued = roomVideoForId(id);
			return queued && roomMediaKey(queued) !== selectedKey;
		});
		undoQueue.current = void 0;
		setUndoRevision(void 0);
		if (remaining.length !== queueRef.current.length) publishQueue(remaining, video.id, false);
		setPlayback({
			playing: startPlayback,
			position: 0
		});
		youtubePlaybackStartedAt.current = startPlayback ? Date.now() : null;
		lastRoomPosition.current = 0;
		lastRoomHistoryId.current = "";
		recordPlay(video.id, "watch-room");
		p2p.send({
			type: "video",
			videoId: video.id,
			selectionRevision: selectionRevision.current,
			media: describeRoomMedia(video, share),
			sentAt: Date.now()
		});
		p2p.send({
			type: "sync",
			playing: startPlayback,
			position: 0,
			videoId: video.id,
			selectionRevision: selectionRevision.current,
			seek: true,
			sentAt: Date.now()
		});
		noteRoom("state", "Host selected a new room video.");
	};
	const resolveGuestRoomVideo = (id, media) => {
		const requested = resolveRoomRequest(id, media, roomVideoForId, [currentVideoIdRef.current, ...queueRef.current]);
		if (!requested || !canStageRoomVideo(requested)) return void 0;
		if (!requested.remote && requested.id.startsWith("local:") && !localFiles.current.has(requested.id)) return void 0;
		if (requested.remote) adoptRoomMedia([describeRoomMedia(requested)], [
			currentVideoIdRef.current,
			...queueRef.current,
			requested.id
		]);
		return requested;
	};
	const queueDescriptors = (ids) => ids.flatMap((id) => {
		const file = localFiles.current.get(id);
		const share = file ? {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		} : void 0;
		const descriptor = describeRoomMedia(roomVideoForId(id), share);
		return descriptor ? [descriptor] : [];
	});
	const flushQueueDraft = (notify = true) => {
		window.clearTimeout(queueDraftTimer.current);
		const draft = pendingQueueDraft.current;
		if (!draft) return;
		try {
			if (draft.media.length) localStorage.setItem(ROOM_QUEUE_DRAFT_KEY, JSON.stringify(draft));
			else localStorage.removeItem(ROOM_QUEUE_DRAFT_KEY);
			pendingQueueDraft.current = void 0;
			if (notify) setSavedQueue(draft.media.length ? draft : void 0);
		} catch {
			if (notify) setQueueNotice("The live queue is shared, but this browser could not save recovery. Free some browser storage and try another queue edit.");
		}
	};
	const flushDraftRef = (0, import_react.useRef)(flushQueueDraft);
	flushDraftRef.current = flushQueueDraft;
	(0, import_react.useEffect)(() => {
		const flush = () => flushDraftRef.current(false);
		const hidden = () => {
			if (document.hidden) flush();
		};
		window.addEventListener("pagehide", flush);
		document.addEventListener("visibilitychange", hidden);
		return () => {
			window.removeEventListener("pagehide", flush);
			document.removeEventListener("visibilitychange", hidden);
			flush();
		};
	}, []);
	const publishQueue = (next, currentId = currentVideoIdRef.current, recordUndo = true) => {
		measureInteraction("queue");
		const current = roomVideoForId(currentId);
		const bounded = distinctRoomQueue(next, (id) => {
			const video = roomVideoForId(id);
			return video && canStageRoomVideo(video) ? roomMediaKey(video) : void 0;
		}, current ? roomMediaKey(current) : void 0);
		if (bounded.length === queueRef.current.length && bounded.every((id, index) => id === queueRef.current[index])) return;
		const revision = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current) + 1;
		if (recordUndo) undoQueue.current = {
			ids: [...queueRef.current],
			media: queueDescriptors(queueRef.current),
			revision
		};
		else undoQueue.current = void 0;
		setUndoRevision(undoQueue.current?.revision);
		queueRevisionRef.current = revision;
		lastAcceptedQueueRevision.current = revision;
		queueRef.current = bounded;
		setQueue(bounded);
		const media = queueDescriptors(bounded);
		p2p.send({
			type: "queue",
			queue: bounded,
			queueMedia: media,
			queueRevision: revision,
			sentAt: Date.now()
		});
		pendingQueueDraft.current = roomQueueDraft(media);
		window.clearTimeout(queueDraftTimer.current);
		queueDraftTimer.current = window.setTimeout(() => flushDraftRef.current(), 300);
		setRoomHealth((health) => ({
			...health,
			queueAccepted: health.queueAccepted + 1,
			queueRevision: revision,
			lastQueueAt: Date.now()
		}));
		noteRoom("queue", `Published queue revision ${revision} with ${bounded.length} title${bounded.length === 1 ? "" : "s"}.`);
	};
	const changeQueue = (operation, video) => {
		if (joinedAsGuest) {
			if (!queueWritable) {
				setQueueNotice(hostConnected ? "The host has locked queue edits and video selection." : "Waiting for the host connection before changing the queue.");
				return;
			}
			requestQueueChange({
				type: "queue-action",
				operation,
				media: describeRoomMedia(video ?? roomVideoForId(operation.id)),
				queueRevision: lastAcceptedQueueRevision.current
			}, "Queue change sent · waiting for host confirmation.");
			setRoomHealth((health) => ({
				...health,
				queueRequests: health.queueRequests + 1
			}));
			return;
		}
		if ((operation.kind === "add" || operation.kind === "next") && !queueRef.current.includes(operation.id) && queueRef.current.length >= 48) {
			setQueueNotice("The queue holds 48 titles. Remove one before adding another.");
			return;
		}
		if (video?.remote) adoptRoomMedia([describeRoomMedia(video)], [
			currentVideoIdRef.current,
			...queueRef.current,
			video.id
		]);
		publishQueue(applyRoomQueueAction(queueRef.current, operation));
	};
	const shuffleQueue = () => {
		if (joinedAsGuest) {
			if (!queueWritable) {
				setQueueNotice("Wait for an available host with guest queue editing enabled.");
				return;
			}
			requestQueueChange({ type: "queue-shuffle" }, "Shuffle requested · waiting for host confirmation.");
			return;
		}
		if (queueRef.current.length < 2) return;
		publishQueue(shuffleRoomQueue(queueRef.current));
		setQueueNotice("Queue shuffled. The current video keeps playing.");
	};
	const editQueue = (edit) => {
		if (!parseRoomQueueEdit(edit)) return false;
		if (joinedAsGuest) {
			if (!queueWritable) {
				setQueueNotice("Wait for an available host with guest queue editing enabled.");
				return false;
			}
			return requestQueueChange({
				type: "queue-edit",
				operation: edit
			}, "Selected-title change sent · waiting for host confirmation.");
		}
		const count = queueRef.current.filter((id) => edit.ids.includes(id)).length;
		publishQueue(applyRoomQueueEdit(queueRef.current, edit));
		setQueueNotice(count ? `${count} selected title${count === 1 ? "" : "s"} ${edit.kind === "remove" ? "removed" : edit.kind === "next" ? "moved to next" : "moved to the end"}. The current video keeps playing.` : "Those titles have already left the queue.");
		return true;
	};
	const queueLinkBatch = (values) => {
		const next = [...queueRef.current], media = [];
		const staged = /* @__PURE__ */ new Map();
		const seen = new Set([currentVideoIdRef.current, ...next].flatMap((id) => {
			const video = roomVideoForId(id);
			return video ? [roomMediaKey(video)] : [];
		}));
		const result = {
			added: 0,
			duplicates: 0,
			invalid: 0,
			full: 0
		};
		for (const value of values.slice(0, 48)) {
			const resolved = resolveRoomMedia(value);
			if (!resolved?.video?.remote) {
				result.invalid++;
				continue;
			}
			const key = roomMediaKey(resolved.video);
			if (seen.has(key)) {
				result.duplicates++;
				continue;
			}
			if (next.length >= 48) {
				result.full++;
				continue;
			}
			const requested = resolveRoomRequest(resolved.video.id, value, (id) => staged.get(id) ?? roomVideoForId(id), [currentVideoIdRef.current, ...next]);
			if (!requested) {
				result.invalid++;
				continue;
			}
			staged.set(requested.id, requested);
			next.push(requested.id);
			seen.add(key);
			media.push(describeRoomMedia(requested));
			result.added++;
		}
		if (result.added) {
			adoptRoomMedia(media, [currentVideoIdRef.current, ...next]);
			publishQueue(next);
		}
		return result;
	};
	const batchQueueNotice = (result, truncated = false) => [
		`${result.added} queued`,
		result.duplicates ? `${result.duplicates} already playing/queued` : "",
		result.invalid ? `${result.invalid} invalid or unavailable` : "",
		result.full ? `${result.full} skipped · queue full` : "",
		truncated ? "Only the first 48 links were checked" : ""
	].filter(Boolean).join(" · ");
	const decideSuggestion = (id, action) => {
		if (joinedAsGuest) return;
		const item = suggestionsRef.current.find((value) => value.id === id);
		if (!item) return;
		let text = "The host dismissed " + item.media.name + ".";
		if (action !== "dismiss") {
			if ([currentVideoIdRef.current, ...queueRef.current].flatMap((id) => {
				const video = roomVideoForId(id);
				return video ? [roomMediaKey(video)] : [];
			}).includes(item.id)) text = item.media.name + " is already playing or queued. The request was resolved.";
			else {
				if (queueRef.current.length >= 48) {
					setReviewNotice("The queue is full. This suggestion is still waiting for review.");
					return;
				}
				const video = resolveRoomMedia(item.media)?.video;
				const requested = video && resolveRoomRequest(video.id, item.media, roomVideoForId, [currentVideoIdRef.current, ...queueRef.current]);
				if (!requested?.remote) {
					setReviewNotice("This public video could not be prepared. The suggestion was kept.");
					return;
				}
				adoptRoomMedia([describeRoomMedia(requested)], [
					currentVideoIdRef.current,
					...queueRef.current,
					requested.id
				]);
				publishQueue(applyRoomQueueAction(queueRef.current, {
					kind: action === "next" ? "next" : "add",
					id: requested.id
				}));
				text = "The host approved " + item.media.name + (action === "next" ? " to play next." : " to the end of the queue.");
			}
		}
		const remaining = suggestionsRef.current.filter((value) => value.id !== id);
		reviewRevision.current++;
		suggestionsRef.current = remaining;
		setSuggestions(remaining);
		setReviewNotice(text);
		p2p.send({
			type: "queue-review-status",
			text
		}, item.peer);
	};
	const suggestionDecision = (0, import_react.useRef)(decideSuggestion);
	suggestionDecision.current = decideSuggestion;
	const onSuggestionDecision = (0, import_react.useCallback)((id, action) => suggestionDecision.current(id, action), []);
	const onReviewQueue = (0, import_react.useCallback)((value) => {
		reviewRevision.current++;
		setReviewQueue(value);
		setReviewNotice("");
		try {
			localStorage.setItem("reelcase.watch-room.review-queue", String(value));
		} catch {}
	}, []);
	const queuePublicLinks = (value) => {
		const parsed = parseRoomLinks(value);
		if (!parsed.videos.length) {
			setQueueNotice("Enter public YouTube or Twitch links, one per line.");
			return false;
		}
		if (joinedAsGuest) {
			if (canSuggest) return requestQueueChange({
				type: "queue-suggest",
				queueMedia: parsed.videos.map((video) => describeRoomMedia(video)),
				skipped: parsed.invalid,
				duplicates: parsed.duplicates,
				truncated: parsed.truncated
			}, parsed.videos.length + " suggestions sent · waiting for host review confirmation.");
			if (!queueWritable) {
				setQueueNotice("Wait for an available host with guest queue editing enabled.");
				return false;
			}
			return requestQueueChange({
				type: "queue-batch",
				queueMedia: parsed.videos.map((video) => describeRoomMedia(video)),
				skipped: parsed.invalid,
				duplicates: parsed.duplicates,
				truncated: parsed.truncated
			}, `${parsed.videos.length} links sent · waiting for host confirmation.`);
		} else {
			const result = queueLinkBatch(parsed.videos.map((video) => describeRoomMedia(video)));
			setQueueNotice(batchQueueNotice({
				...result,
				invalid: result.invalid + parsed.invalid,
				duplicates: result.duplicates + parsed.duplicates
			}, parsed.truncated));
		}
		return true;
	};
	const queueSessionFile = (file) => {
		if (joinedAsGuest) {
			setQueueNotice("Only the host can apply a session file.");
			return false;
		}
		const plan = previewRoomSessionImport(file, describeRoomMedia(roomVideoForId(currentVideoIdRef.current)), queueDescriptors(queueRef.current));
		if (!plan.media.length) {
			setQueueNotice("No new session titles fit the current queue. Nothing was changed.");
			return false;
		}
		const result = queueLinkBatch(plan.media);
		setQueueNotice("Session file: " + batchQueueNotice(result) + ". The current video and playback settings are unchanged.");
		return result.added > 0;
	};
	const queueSavedList = (media) => {
		const clean = roomQueueDraft(media).media;
		if (!clean.length) {
			setQueueNotice("This list has no available public links.");
			return false;
		}
		if (joinedAsGuest) {
			if (canSuggest) return requestQueueChange({
				type: "queue-suggest",
				queueMedia: clean
			}, "Saved list sent · waiting for host review confirmation.");
			if (!queueWritable) {
				setQueueNotice("Wait for an available host with guest queue editing enabled.");
				return false;
			}
			return requestQueueChange({
				type: "queue-batch",
				queueMedia: clean
			}, "Saved list sent · waiting for host confirmation.");
		}
		setQueueNotice("Saved list: " + batchQueueNotice(queueLinkBatch(clean)) + ". The current video keeps playing.");
		return true;
	};
	const updateQueue = (next) => {
		if (!joinedAsGuest) {
			publishQueue(next);
			return;
		}
		for (const id of queueRef.current) if (!next.includes(id)) changeQueue({
			kind: "remove",
			id
		});
		for (let index = next.length - 1; index >= 0; index--) {
			const id = next[index];
			if (!queueRef.current.includes(id)) changeQueue({
				kind: "add",
				id,
				before: next[index + 1]
			});
			else if (next.indexOf(id) !== queueRef.current.indexOf(id) && next.length === queueRef.current.length) changeQueue({
				kind: "move",
				id,
				before: next[index + 1]
			});
		}
	};
	const updateLocalQueue = (next) => {
		const bounded = normalizeLocalRoomQueue(next);
		if (joinedAsGuest) {
			p2p.send({
				type: "local-queue-request",
				localQueue: bounded,
				sentAt: Date.now()
			});
			noteRoom("request", "Sent a local-handoff queue proposal to the host.");
			setInviteNotice("Local handoff proposal sent to the host. It appears once confirmed.");
			return;
		}
		setLocalQueue(bounded);
		p2p.send({
			type: "local-queue",
			localQueue: bounded,
			sentAt: Date.now()
		});
		noteRoom("queue", "Published the approved local-handoff queue.");
	};
	const stageLocalShare = (share) => {
		if (joinedAsGuest) {
			p2p.send({
				type: "local-stage-request",
				fingerprint: share.fingerprint,
				sentAt: Date.now()
			});
			noteRoom("request", "Requested that the host stage a local handoff.");
			setInviteNotice("Requested that the host stage this local handoff.");
			return;
		}
		if (!localShare || localShare.fingerprint !== share.fingerprint || !localVideo) {
			setPendingLocalShare(share);
			setInviteNotice(`Choose ${share.name} on the host before staging its playback stream.`);
			return;
		}
		if (!guestAccess) {
			setInviteNotice("Confirm guest viewing access in Local sharing before staging this file.");
			return;
		}
		const previous = roomVideoForId(currentVideoIdRef.current);
		if (previous?.remote) {
			const recent = roomRecentMedia([describeRoomMedia(previous), ...recentMediaRef.current]);
			recentMediaRef.current = recent;
			setRecentMedia(recent);
		}
		selectionRevision.current++;
		setSharedVideoId(`local:${share.fingerprint}`);
		setPlayback({
			playing: false,
			position: 0
		});
		lastRoomPosition.current = 0;
		p2p.send({
			type: "share-ready",
			...share
		});
		p2p.send({
			type: "video",
			videoId: `local:${share.fingerprint}`,
			selectionRevision: selectionRevision.current,
			media: describeRoomMedia(void 0, share)
		});
		p2p.send({
			type: "sync",
			playing: false,
			position: 0,
			videoId: `local:${share.fingerprint}`,
			selectionRevision: selectionRevision.current,
			seek: true,
			sentAt: Date.now()
		});
		setInviteNotice(`${share.name} is staged. Press Play to stream it to every connected guest.`);
	};
	const selectLocalVideo = (file) => {
		if (!file) return;
		const share = {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		};
		if (joinedAsGuest && !pendingLocalShare) {
			setInviteNotice("Wait for the host’s local-share request before matching a permitted file on this device.");
			return;
		}
		if (joinedAsGuest && pendingLocalShare && pendingLocalShare.fingerprint !== share.fingerprint) {
			setInviteNotice(`That file does not match ${pendingLocalShare.name}. Select the same permitted copy (name, size, and modified time must agree).`);
			return;
		}
		if (!joinedAsGuest) {
			setPickedLocalVideo(file);
			setInviteNotice("File selected. Queue it or share it when ready; the current video keeps playing.");
			return;
		}
		setLocalVideo(file);
		setLocalShare(share);
		if (joinedAsGuest && pendingLocalShare) {
			setSharedVideoId(`local:${share.fingerprint}`);
			setPendingLocalShare(null);
			p2p.send({
				type: "share-matched",
				name: share.name,
				fingerprint: share.fingerprint
			});
			setInviteNotice(`${share.name} matched locally. Waiting for the host to stage or play it.`);
			return;
		}
	};
	const preparePickedLocal = (keepCurrent = true) => {
		if (joinedAsGuest || !pickedLocalVideo || !pickedLocalShare || !guestAccess) return void 0;
		const media = describeRoomMedia(void 0, pickedLocalShare);
		const video = resolveRoomMedia(media)?.video;
		if (!media || !video) return void 0;
		localFiles.current.set(video.id, pickedLocalVideo);
		adoptRoomMedia([media], keepCurrent ? [
			currentVideoIdRef.current,
			...queueRef.current,
			video.id
		] : [video.id, ...queueRef.current]);
		return video;
	};
	const queuePickedLocal = () => {
		if (queueRef.current.length >= 48) {
			setQueueNotice("The queue is full. Remove a title first.");
			return;
		}
		const video = preparePickedLocal();
		if (!video) return;
		if (video.id === currentVideoIdRef.current || queueRef.current.includes(video.id)) {
			setQueueNotice("That file is already playing or queued.");
			return;
		}
		changeQueue({
			kind: "add",
			id: video.id
		}, video);
		setQueueNotice(`${video.name} queued. Guests receive the host stream when it plays.`);
	};
	const sharePickedLocal = () => {
		const video = preparePickedLocal(false);
		if (!video || !pickedLocalShare) return;
		chooseVideo(video);
		p2p.send({
			type: "share-ready",
			...pickedLocalShare
		});
		setInviteNotice("Local playback shared. Press Play to stream it to the room; guests do not need a local copy.");
	};
	const queueVideo = (video) => {
		if (canSuggest) {
			if (!video.remote) {
				setQueueNotice("Only public YouTube and Twitch videos can be suggested.");
				return;
			}
			requestQueueChange({
				type: "queue-suggest",
				queueMedia: [describeRoomMedia(video)]
			}, "Suggestion sent · waiting for host review confirmation.");
			return;
		}
		if (video.id !== sharedVideoId && !queue.includes(video.id)) changeQueue({
			kind: "add",
			id: video.id
		}, video);
	};
	const queueImmediately = (video) => {
		if (video.id === sharedVideoId) return;
		changeQueue({
			kind: "next",
			id: video.id
		}, video);
		if (!joinedAsGuest) setInviteNotice(`${video.name} will play next for everyone in the room.`);
	};
	const playNext = () => {
		if (joinedAsGuest) {
			if (!queueWritable) {
				setQueueNotice("Wait for an available host with guest queue editing enabled.");
				return;
			}
			requestQueueChange({
				type: "next-request",
				videoId: currentVideoIdRef.current
			}, "Next title requested · waiting for host confirmation.");
			return;
		}
		const next = nextPlayableRoomTitle(queueRef.current, (id) => {
			const video = roomVideoForId(id);
			return Boolean(video && canStageRoomVideo(video) && (!id.startsWith("local:") || localFiles.current.has(id)) && !hiddenVideos[id] && !unavailable[id]);
		});
		if (next.skipped) publishQueue(queueRef.current.slice(next.skipped), currentVideoIdRef.current, false);
		if (next.id) chooseVideo(roomVideoForId(next.id), true);
		setQueueNotice(next.id ? `${next.skipped ? `${next.skipped} unavailable title${next.skipped === 1 ? "" : "s"} skipped. ` : ""}Playing the next queued video.` : "The queue is finished. Add more videos when you are ready.");
		return Boolean(next.id);
	};
	const undoLastQueueChange = () => {
		const snapshot = undoQueue.current;
		if (joinedAsGuest || !snapshot || snapshot.revision !== queueRevisionRef.current) return;
		undoQueue.current = void 0;
		setUndoRevision(void 0);
		adoptRoomMedia(snapshot.media, [currentVideoIdRef.current, ...snapshot.ids]);
		publishQueue(snapshot.ids, currentVideoIdRef.current, false);
		setQueueNotice("Last queue change undone. The current video keeps playing.");
	};
	const restoreSavedQueue = () => {
		if (joinedAsGuest || !savedQueue || queueRef.current.length) return;
		const result = queueLinkBatch(savedQueue.media);
		setQueueNotice(`Recovered saved queue: ${batchQueueNotice(result)}. Press Play next when you are ready.`);
	};
	const queuePanelActions = (0, import_react.useRef)({
		autoAdvance: (_value) => {},
		select: (_video) => {},
		add: (_video) => {},
		change: (_action) => {},
		clear: () => {},
		next: () => {},
		shuffle: () => {},
		link: (_value) => false,
		undo: () => {},
		restore: () => {},
		edit: (_edit) => false,
		loadList: (_media) => false,
		importSession: (_file) => false
	});
	queuePanelActions.current = {
		autoAdvance: setAutoAdvance,
		select: (video) => chooseVideo(video, true),
		add: queueVideo,
		change: changeQueue,
		clear: () => updateQueue([]),
		next: playNext,
		shuffle: shuffleQueue,
		link: queuePublicLinks,
		undo: undoLastQueueChange,
		restore: restoreSavedQueue,
		edit: editQueue,
		loadList: queueSavedList,
		importSession: queueSessionFile
	};
	const onQueueAutoAdvance = (0, import_react.useCallback)((value) => queuePanelActions.current.autoAdvance(value), []);
	const onQueueSelect = (0, import_react.useCallback)((video) => queuePanelActions.current.select(video), []);
	const onQueueAdd = (0, import_react.useCallback)((video) => queuePanelActions.current.add(video), []);
	const onQueueChange = (0, import_react.useCallback)((action) => queuePanelActions.current.change(action), []);
	const onQueueClear = (0, import_react.useCallback)(() => queuePanelActions.current.clear(), []);
	const onQueueNext = (0, import_react.useCallback)(() => queuePanelActions.current.next(), []);
	const onQueueShuffle = (0, import_react.useCallback)(() => queuePanelActions.current.shuffle(), []);
	const onQueueLink = (0, import_react.useCallback)((value) => queuePanelActions.current.link(value), []);
	const onQueueUndo = (0, import_react.useCallback)(() => queuePanelActions.current.undo(), []);
	const onQueueRestore = (0, import_react.useCallback)(() => queuePanelActions.current.restore(), []);
	const onQueueEdit = (0, import_react.useCallback)((edit) => queuePanelActions.current.edit(edit), []);
	const onQueueLoadList = (0, import_react.useCallback)((media) => queuePanelActions.current.loadList(media), []);
	const onImportSession = (0, import_react.useCallback)((file) => queuePanelActions.current.importSession(file), []);
	const onGuestQueueEditing = (0, import_react.useCallback)((value) => {
		reviewRevision.current++;
		setGuestQueueEnabled(value);
		try {
			localStorage.setItem("reelcase.watch-room.guest-queue", String(value));
		} catch {}
	}, []);
	const recommendationSelectRef = (0, import_react.useRef)(() => {});
	recommendationSelectRef.current = (video) => chooseVideo(video);
	const onRecommendationSelect = (0, import_react.useCallback)((video) => recommendationSelectRef.current(video), []);
	const onMixRecommendations = (0, import_react.useCallback)(() => {
		setCandidateSeed(Date.now());
		setRoomPickLimit(18);
	}, []);
	const onLoadRecommendations = (0, import_react.useCallback)(() => setRoomPickLimit((limit) => Math.min(roomCandidates.length, limit + 18)), [roomCandidates.length]);
	const queueCurrentMedia = (0, import_react.useMemo)(() => describeRoomMedia(sharedVideo), [sharedVideo]);
	const queuePanelRows = (0, import_react.useMemo)(() => queue.map((id) => ({
		id,
		video: joinedAsGuest ? sharedRoomVideos[id] ?? lookupVideo(videos, id) : lookupVideo(videos, id) ?? sharedRoomVideos[id]
	})), [
		joinedAsGuest,
		queue,
		sharedRoomVideos,
		videos
	]);
	const finishRoomTitle = () => {
		if (joinedAsGuest || !playback.playing || sharedVideoId !== currentVideoIdRef.current || lastEndedTitle.current === sharedVideoId) return;
		lastEndedTitle.current = sharedVideoId;
		if (autoAdvance && queueRef.current.length && playNext()) return;
		sync({
			playing: false,
			position: roomDuration() ?? currentHostClock()
		}, false, true);
		setQueueNotice(queueRef.current.length ? "Video finished. Automatic next is off; choose Play next when ready." : "Queue finished. Add more videos or press Play to replay this video.");
	};
	const finishLatestRoomTitle = (0, import_react.useRef)(finishRoomTitle);
	finishLatestRoomTitle.current = finishRoomTitle;
	(0, import_react.useEffect)(() => {
		lastEndedTitle.current = "";
		youtubeFailure.current = void 0;
		setPlayerNotice("");
		youtubeClock.current = void 0;
		youtubeReady.current = false;
		youtubeMetadataReady.current = "";
		lastYoutubePlaybackCommand.current = null;
		catchUpOnStart.current = true;
	}, [sharedVideoId]);
	const reloadThisPlayer = () => {
		suppressRemotePlayerEchoUntil.current = Date.now() + 1500;
		youtubeFailure.current = void 0;
		youtubeReady.current = false;
		youtubeClock.current = void 0;
		youtubeMetadataReady.current = "";
		lastYoutubePlaybackCommand.current = null;
		catchUpOnStart.current = true;
		setRemoteFrameReady(null);
		setRemoteSeekNonce((value) => value + 1);
		setPlayerReload((value) => value + 1);
		setPlayerNotice("Reloading this player only. The shared video, queue and room clock stay in place.");
	};
	const reloadPlayerRef = (0, import_react.useRef)(reloadThisPlayer);
	reloadPlayerRef.current = reloadThisPlayer;
	const onReloadThisPlayer = (0, import_react.useCallback)(() => reloadPlayerRef.current(), []);
	const jumpToRoomPart = (target, control) => {
		if (!target) return;
		const input = target.querySelector(control);
		if (control.includes("Search room videos") && input) {
			const details = input.closest("details");
			if (details) details.open = true;
			input.scrollIntoView({
				block: "center",
				behavior: "instant"
			});
		} else target.scrollIntoView({
			block: "start",
			behavior: "instant"
		});
		input?.focus({ preventScroll: true });
	};
	const waitForPlayersRef = (0, import_react.useRef)(() => {});
	waitForPlayersRef.current = () => {
		if (!joinedAsGuest) sync({
			playing: false,
			position: currentHostClock()
		});
	};
	const onWaitForPlayers = (0, import_react.useCallback)(() => waitForPlayersRef.current(), []);
	const recentQueuedKeys = (0, import_react.useMemo)(() => queuePanelRows.flatMap((row) => row.video ? [roomMediaKey(row.video)] : []), [queuePanelRows]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.watch-room.auto-advance", String(autoAdvance));
		} catch {}
	}, [autoAdvance]);
	const youtubeMessages = (0, import_react.useRef)(() => {});
	youtubeMessages.current = (data) => {
		if (sharedVideo?.remote?.kind !== "youtube") return;
		if (data.event === "onError") {
			const notice = roomYoutubeError(data.info);
			if (notice) {
				youtubeFailure.current = "error";
				youtubeDiagnostics.record("error", data.info);
				observePlayer("error");
				setPlayerNotice(notice);
			}
			return;
		}
		if (data.event === "onAutoplayBlocked") {
			youtubeDiagnostics.record("blocked");
			observePlayer("blocked");
			catchUpOnStart.current = true;
			setPlayerNotice("Your browser blocked autoplay. It needs a tap. Choose Start on this device, or press Play inside the video. The room keeps playing.");
			return;
		}
		if (data.event === "onReady" && !youtubeReady.current) {
			if (youtubeFailure.current === "timeout") youtubeFailure.current = void 0;
			youtubeDiagnostics.record("ready");
			observePlayer("ready");
			youtubeReady.current = true;
			lastYoutubeSeekNonce.current = -1;
			lastYoutubePlaybackCommand.current = null;
			setRemoteSeekNonce((value) => value + 1);
		}
		const info = data.info && typeof data.info === "object" ? data.info : void 0;
		const live = youtubeLiveInfo(info, sharedVideo.remote.videoId ?? "");
		if (live === true && !isRoomLive()) markRoomLive(sharedVideo.id);
		if (youtubeMetadataReady.current !== sharedVideo.id && live !== void 0) {
			youtubeMetadataReady.current = sharedVideo.id;
			lastYoutubeSeekNonce.current = -1;
			setRemoteSeekNonce((value) => value + 1);
		}
		const state = typeof info?.playerState === "number" ? info.playerState : data.event === "onStateChange" && typeof data.info === "number" ? data.info : void 0;
		if (youtubeFailure.current && !(state === 1 && data.event === "onStateChange")) return;
		if (state === 1) {
			youtubeFailure.current = void 0;
			youtubeDiagnostics.record("playing");
		}
		if (state !== void 0) {
			const status = state === 1 ? "playing" : state === 2 ? "paused" : state === 3 ? "buffering" : state === 0 ? "ended" : state === 5 ? "ready" : void 0;
			if (status) observePlayer(status);
		}
		const previous = youtubeClock.current;
		if (typeof info?.currentTime === "number" && Number.isFinite(info.currentTime) && info.currentTime >= 0 && info.currentTime <= 43200) youtubeClock.current = {
			id: sharedVideo.id,
			position: info.currentTime,
			state: state ?? previous?.state ?? -1,
			at: performance.now()
		};
		else if (state !== void 0) youtubeClock.current = {
			id: sharedVideo.id,
			position: providerPosition(previous, sharedVideo.id, performance.now()) ?? lastRoomPosition.current,
			state,
			at: performance.now()
		};
		if (!isRoomLive() && typeof info?.duration === "number" && Number.isFinite(info.duration) && info.duration > 0 && info.duration <= 43200 && measuredDuration?.videoId !== sharedVideo.id) setMeasuredDuration({
			videoId: sharedVideo.id,
			seconds: info.duration
		});
		const actual = providerPosition(youtubeClock.current, sharedVideo.id, performance.now());
		if (!joinedAsGuest && actual !== void 0) {
			lastRoomPosition.current = actual;
			youtubePlaybackStartedAt.current = youtubeClock.current?.state === 1 ? Date.now() - actual * 1e3 : null;
		}
		if (state === 1) {
			setPlayerNotice("");
			if (joinedAsGuest) alignAfterStart.current();
			else if (data.event === "onStateChange" && !playback.playing && Date.now() > suppressRemotePlayerEchoUntil.current) providerSync.current({
				playing: true,
				position: actual ?? playback.position
			});
		}
		if (data.event === "onStateChange" && state === 2 && !joinedAsGuest && playback.playing && Date.now() > suppressRemotePlayerEchoUntil.current) providerSync.current({
			playing: false,
			position: actual ?? playback.position
		});
		if (joinedAsGuest && !isRoomLive() && youtubeMetadataReady.current === sharedVideo.id && playback.playing && hostClockRunning && youtubeClock.current?.state === 1 && !catchUpOnStart.current && Date.now() > suppressRemotePlayerEchoUntil.current && providerNeedsCorrection(actual, providerTarget(), performance.now(), lastProviderCorrection.current)) {
			lastProviderCorrection.current = performance.now();
			suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
			remoteFrameRef.current?.contentWindow?.postMessage(JSON.stringify({
				event: "command",
				func: "seekTo",
				args: [providerTarget(), true]
			}), new URL(watchRoomEmbed(sharedVideo)).origin);
		}
		if (state === 0) finishLatestRoomTitle.current();
	};
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "youtube") return;
		const listener = (event) => {
			if (event.source !== remoteFrameRef.current?.contentWindow || event.origin !== new URL(watchRoomEmbed(sharedVideo)).origin) return;
			try {
				const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
				if (data && typeof data === "object") youtubeMessages.current(data);
			} catch {}
		};
		window.addEventListener("message", listener);
		return () => window.removeEventListener("message", listener);
	}, [sharedVideo?.id, playerReload]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "youtube" || remoteFrameReady?.id !== sharedVideo.id) return;
		let attempts = 0;
		const handshake = () => {
			const target = new URL(watchRoomEmbed(sharedVideo)).origin, frame = remoteFrameRef.current?.contentWindow;
			frame?.postMessage(JSON.stringify({
				event: "listening",
				id: "room-youtube"
			}), target);
			for (const event of [
				"onReady",
				"onStateChange",
				"onError",
				"onAutoplayBlocked"
			]) frame?.postMessage(JSON.stringify({
				event: "command",
				func: "addEventListener",
				args: [event]
			}), target);
			if (++attempts >= 20 || youtubeReady.current) {
				window.clearInterval(timer);
				if (!youtubeReady.current && youtubeFailure.current !== "error") {
					youtubeFailure.current = "timeout";
					youtubeDiagnostics.record("timeout");
				}
			}
		};
		const timer = window.setInterval(handshake, 500);
		handshake();
		return () => window.clearInterval(timer);
	}, [sharedVideo?.id, remoteFrameReady]);
	const send = () => {
		const text = message.trim();
		if (!text) return;
		setChat((rows) => [...rows, `You: ${text}`].slice(-50));
		p2p.send({
			type: "chat",
			text,
			name: name.trim() || "Guest"
		});
		setMessage("");
	};
	if (!activeRoom) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "LAN watch room",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
		title: "Watch together, on your terms.",
		copy: "Create a private room code or join one on the same network. Peers exchange names, chat, and playback commands over a direct or configured relay path.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Create a room"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl tracking-[0.16em] text-fg",
						children: roomCode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Share this code only with people you want in your watch room."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomInvitation, {
						invitation,
						started: false,
						onNotice: setInviteNotice
					}),
					!roomInvite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: ["This localhost address opens only on this computer. Use the home-network address in the Connection guide before sharing with another device. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-accent underline",
							onClick: () => useLibrary.getState().setSource("connection"),
							children: "Open Connection guide"
						})]
					}),
					inviteNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 break-all text-xs text-accent",
						children: inviteNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-5 w-full",
						onClick: () => {
							setJoinedAsGuest(false);
							localStorage.setItem("reelcase.watch-room.last-host", roomCode);
							setRecentLocalRoom(roomCode);
							setActiveRoom(roomCode);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }), " Start room"]
					}),
					savedQueue && /^RC[A-Z0-9]{4,12}$/.test(recentLocalRoom) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "mt-2 min-h-11 w-full",
						onClick: () => {
							setRoomCode(recentLocalRoom);
							setJoinedAsGuest(false);
							setActiveRoom(recentLocalRoom);
						},
						children: ["Resume last room · ", recentLocalRoom]
					}),
					savedQueue && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: [
							savedQueue.media.length,
							" public link",
							savedQueue.media.length === 1 ? "" : "s",
							" saved from your last queue. Restore them inside the room without starting playback."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: [
							"Testing on one computer? Start the room first, then use ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Open local guest window"
							}),
							" inside the room. A second browser window is a separate peer; a single tab cannot chat with itself."
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Join a theater"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Guests enter a focused theater view first; controls and chat stay available beside the screen."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-3",
						value: roomInput,
						onChange: (event) => setRoomInput(event.target.value.toUpperCase()),
						placeholder: "Enter room code",
						"aria-label": "Watch room code"
					}),
					recentLocalRoom && recentLocalRoom !== roomInput && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						className: "mt-2",
						onClick: () => {
							setRoomInput(recentLocalRoom);
							setInviteNotice(`Using this browser’s active host room: ${recentLocalRoom}.`);
						},
						children: ["Join local host · ", recentLocalRoom]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2",
						value: name,
						maxLength: 64,
						onChange: (event) => setName(event.target.value),
						placeholder: "Your display name",
						"aria-label": "Your display name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3 w-full",
						disabled: !roomInput.trim(),
						onClick: () => {
							setJoinedAsGuest(true);
							setStageSize("cinema");
							setActiveRoom(roomInput.trim());
						},
						children: "Join theater"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Local friends"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-5 text-muted",
								children: "Save a trusted friend name and their current room code for one-tap joining on this network."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-2 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: friendName,
									onChange: (event) => setFriendName(event.target.value),
									placeholder: "Friend name",
									"aria-label": "Friend name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: friendCode,
									onChange: (event) => setFriendCode(event.target.value.toUpperCase()),
									placeholder: "Room code",
									"aria-label": "Friend room code"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "mt-2",
								disabled: !friendName.trim() || !friendCode.trim(),
								onClick: () => {
									const next = [{
										name: friendName.trim(),
										code: friendCode.trim()
									}, ...friends.filter((friend) => friend.code !== friendCode.trim())].slice(0, 16);
									setFriends(next);
									localStorage.setItem("reelcase.lan-friends.v1", JSON.stringify(next));
									setFriendName("");
									setFriendCode("");
								},
								children: "Save friend"
							}),
							friends.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: friends.map((friend) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										setRoomInput(friend.code);
										setName(friend.name);
									},
									children: [
										friend.name,
										" · ",
										friend.code
									]
								}, `${friend.name}-${friend.code}`))
							})
						]
					})
				]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Connected watch room",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
		title: joinedAsGuest ? `Theater · ${activeRoom}` : `Room ${activeRoom}`,
		copy: joinedAsGuest ? "Guest theater view. The host's current video, queue, and timeline arrive as the connection settles." : "Peer connection for your selected guests. Playback events are synchronized across connected devices.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Watch room shortcuts",
				className: "sticky top-0 z-20 mt-4 min-w-0 rounded-lg border border-border bg-surface p-2 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 gap-2 overflow-x-auto pb-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => jumpToRoomPart(roomStage.current, "iframe, video"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4" }), "Player"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => jumpToRoomPart(roomQueueAnchor.current, "h3"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListVideo, { className: "size-4" }),
								"Queue · ",
								queue.length
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => jumpToRoomPart(roomQueueAnchor.current, "[aria-label=\"Search room videos\"]"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), "Find videos"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => jumpToRoomPart(roomHistoryAnchor.current, "h3"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" }), "History"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => jumpToRoomPart(roomParticipationAnchor.current, "h3"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), "Ready & votes"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => jumpToRoomPart(roomChat.current, "input"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), "Chat"]
						}),
						(reviewQueue || suggestions.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => jumpToRoomPart(requestsAnchor.current, "h3"),
							children: ["Requests · ", suggestions.length]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 truncate px-1 text-xs text-muted",
					children: ["Next: ", queuePanelRows[0]?.video?.name ?? "Add a video to the queue"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-room-layout": stageSize,
				className: `mt-4 grid min-w-0 items-start gap-4 ${stageSize === "cinema" ? "" : "lg:grid-cols-[minmax(0,1.7fr)_minmax(22rem,0.8fr)]"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 rounded-lg bg-elevated p-3 shadow-border sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Synchronized playback"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5 text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: `size-3 ${p2p.joined ? "text-accent" : "text-subtle"}` }), p2p.joined ? "Signaling online" : "Connecting…"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !p2p.joined,
								onClick: () => {
									const invite = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`;
									const opened = window.open(invite, "reelcase-local-guest", "noopener,width=1200,height=820");
									setInviteNotice(opened ? "Opened a separate local guest window. Give it a moment to appear in Guests." : "Your browser blocked the guest window. Allow pop-ups, then try again.");
								},
								children: "Open local guest window"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => void navigator.clipboard?.writeText(JSON.stringify({
									room: activeRoom,
									invitation: roomInvite,
									invitationNote: roomInvite ? void 0 : "Open Realhub from a home-network address before sharing this room with another device.",
									role: joinedAsGuest ? "guest" : "host",
									self: p2p.selfId,
									signaling: p2p.joined,
									peers: p2p.peers,
									transportTest: pulseStatus,
									reliability: roomHealth,
									ledger: roomLedger,
									events: p2p.events,
									capturedAt: (/* @__PURE__ */ new Date()).toISOString()
								}, null, 2)).then(() => setInviteNotice("Connection and reconciliation diagnostic copied."), () => setInviteNotice("Could not copy the diagnostic.")),
								children: "Copy room diagnostic"
							})]
						}),
						!roomInvite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: ["A localhost invitation cannot open on another device. Open this room through the home-network address before sharing. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-accent underline",
								onClick: () => useLibrary.getState().setSource("connection"),
								children: "Open Connection guide"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-3 rounded-sm bg-bg/45 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "cursor-pointer text-xs font-medium text-fg",
									children: [
										"Connection details · ",
										p2p.peers.filter((peer) => peer.connectionState === "connected").length,
										"/",
										p2p.peers.length,
										" connected"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-fg",
										children: "Connection signals"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted",
										children: [
											p2p.peers.filter((peer) => peer.connectionState === "connected").length,
											"/",
											p2p.peers.length,
											" connected · ",
											p2p.peers.filter((peer) => peer.connectionState === "connected" && peer.candidateType === "relay").length,
											" relayed"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomRelaySettings, {
									config: relayConfig,
									onChange: setRelayConfig
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] leading-4 text-muted",
									children: p2p.events.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: event }, `${event}-${index}`))
								}),
								!p2p.peers.length && p2p.joined && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-accent",
									children: [
										"Signaling is healthy, but no peer is in ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeRoom }),
										". The other window must join this exact code—not create its own. Use Open local guest window or copy this room link."
									]
								}),
								p2p.peers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 space-y-1 text-xs text-muted",
									children: p2p.peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-fg",
											children: peer.name || "Guest"
										}),
										" · ",
										peer.connectionState,
										" · ",
										peer.candidateType ?? "path pending",
										" · ",
										peer.rttMs == null ? "RTT pending" : `${peer.rttMs}ms`,
										" · ",
										peer.id.slice(-6)
									] }, peer.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: !p2p.peers.some((peer) => peer.connectionState === "connected"),
										onClick: () => {
											setPulseStatus("Sending chat transport test…");
											p2p.send({
												type: "room-pulse",
												sentAt: Date.now()
											});
										},
										children: "Test chat transport"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: pulseStatus
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl text-fg",
							children: playback.playing && sharedVideo?.remote?.kind === "twitch" && !twitchClip && !twitchActuallyPlaying ? "Twitch waiting for playback" : playback.playing ? "Playing together" : "Paused together"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							"aria-label": "Room playback time",
							"data-room-clock": playback.position,
							children: [
								"Timeline ",
								Math.floor(playback.position / 60),
								":",
								String(Math.floor(playback.position % 60)).padStart(2, "0"),
								" · ",
								timelineEvidence.source === "remote" ? "host-confirmed" : timelineEvidence.source === "local" ? "local player" : "provider estimate",
								" · checked ",
								new Date(timelineEvidence.at).toLocaleTimeString([], {
									hour: "numeric",
									minute: "2-digit",
									second: "2-digit"
								}),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							"aria-label": "Room playback permissions",
							className: "mt-3 rounded-md border border-border bg-bg/45 p-3",
							children: joinedAsGuest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs leading-5 text-muted",
								children: [
									"Your room controls · ",
									guestPlaybackEnabled ? "Play/pause allowed" : "Host controls play/pause",
									" · ",
									guestSeekingEnabled ? "Seeking allowed for videos" : "Host controls seeking",
									". You can still start or reload your own device, join the ready check and vote for what’s next."
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: "Guest playback controls"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-2 flex min-h-11 items-center gap-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										"aria-label": "Allow guests to play and pause",
										checked: guestPlaybackEnabled,
										onChange: (event) => {
											const value = event.target.checked;
											reviewRevision.current++;
											setGuestPlaybackEnabled(value);
											try {
												localStorage.setItem("reelcase.watch-room.guest-playback", String(value));
											} catch {}
										}
									}), "Allow guests to play and pause"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										"aria-label": "Allow guests to seek videos",
										checked: guestSeekingEnabled,
										onChange: (event) => {
											const value = event.target.checked;
											reviewRevision.current++;
											setGuestSeekingEnabled(value);
											try {
												localStorage.setItem("reelcase.watch-room.guest-seeking", String(value));
											} catch {}
										}
									}), "Allow guests to seek videos"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-5 text-muted",
									children: "Playback and seeking are independent from queue access. Live streams keep their own clocks. Ready checks and votes remain available when controls are locked."
								})
							] })
						}),
						joinedAsGuest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomGuestTiming, {
							offset: guestOffset,
							position: adjustedTimerPosition,
							adjustsPlayback: timingAdjustsPlayback,
							onChange: changeGuestOffset
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-4 rounded-md border border-border bg-bg/45 p-3",
							"aria-label": "Room reliability",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "cursor-pointer text-xs font-medium text-fg",
									children: [
										"Room reliability · r",
										roomHealth.queueRevision,
										" · ",
										roomHealth.staleDropped,
										" stale commands dropped"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Room reliability"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: joinedAsGuest ? "Guest commands are requests; the host publishes the canonical state." : "This device is the host and publishes the canonical state."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-accent/15 px-2 py-1 text-xs text-accent",
										children: p2p.peers.some((peer) => peer.connectionState === "connected" && peer.candidateType === "relay") ? "TURN relay connected" : p2p.peers.some((peer) => peer.connectionState === "connected" && [
											"host",
											"srflx",
											"prflx"
										].includes(peer.candidateType ?? "")) ? "direct path connected" : p2p.peers.some((peer) => peer.connectionState === "connected") ? "connected · path pending" : p2p.joined ? "signaling online · peer pending" : "connecting"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-sm bg-elevated p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-muted",
												children: joinedAsGuest ? "Last host state" : "Last publish"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "mt-1 block text-fg",
												children: roomTimeLabel(joinedAsGuest ? roomHealth.lastHostStateAt : roomHealth.lastPublishedAt)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-sm bg-elevated p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-muted",
												children: "Queue revision"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												className: "mt-1 block text-fg",
												children: [
													"r",
													roomHealth.queueRevision,
													" · ",
													queue.length,
													" title",
													queue.length === 1 ? "" : "s"
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-sm bg-elevated p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-muted",
												children: "Last correction"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "mt-1 block text-fg",
												children: roomHealth.lastDriftSeconds ? `${roomHealth.lastDriftSeconds.toFixed(1)}s` : "none needed"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-sm bg-elevated p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-muted",
												children: "Safety checks"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												className: "mt-1 block text-fg",
												children: [
													roomHealth.staleDropped,
													" stale dropped · ",
													roomHealth.resyncRequests,
													" resync"
												]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
									className: "mt-3 rounded-sm bg-elevated p-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
										className: "cursor-pointer font-medium text-fg",
										children: [
											"Session ledger · ",
											roomLedger.length,
											" local event",
											roomLedger.length === 1 ? "" : "s"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 max-h-32 space-y-1 overflow-y-auto",
										children: roomLedger.length ? roomLedger.slice().reverse().map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-subtle",
												children: roomTimeLabel(event.at)
											}),
											" · ",
											event.detail
										] }, `${event.at}-${index}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No room decisions recorded yet." })
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: toggleRoomPlayback,
									disabled: joinedAsGuest && !guestPlaybackEnabled,
									children: [playback.playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playback.playing ? "Pause" : "Play"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									disabled: Boolean(sharedVideo?.remote?.live) || joinedAsGuest && !guestSeekingEnabled,
									onClick: () => sync({
										...playback,
										position: clampRoomClock(playback.position - 15)
									}, true),
									children: "−15 sec"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									disabled: Boolean(sharedVideo?.remote?.live) || joinedAsGuest && !guestSeekingEnabled,
									onClick: () => sync({
										...playback,
										position: clampRoomClock(playback.position + 15)
									}, true),
									children: "+15 sec"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: resync,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }),
										" ",
										joinedAsGuest ? "Request resync" : "Resync guests"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									disabled: !queueWritable || !queue.length || joinedAsGuest && pendingQueueChanges > 0,
									onClick: playNext,
									children: [
										joinedAsGuest ? "Request next" : "Play next",
										" ",
										queue.length ? `(${queue.length})` : ""
									]
								})
							]
						}),
						!joinedAsGuest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-3 rounded-md border border-border p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "min-h-11 cursor-pointer text-sm font-medium text-fg",
									children: "Guest library browsing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-2 flex min-h-11 items-center gap-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: catalogShared,
										onChange: (event) => setCatalogShared(event.target.checked),
										"aria-label": "Let guests search my library"
									}), "Let guests search my public video library"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-2 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: localTitlesShared,
										disabled: !catalogShared,
										onChange: (event) => setLocalTitlesShared(event.target.checked),
										"aria-label": "Include local video titles for guests"
									}), "Include local video titles"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-5 text-muted",
									children: "Guests receive one page of matching titles. File paths and handles stay on this device. Queue edits still follow your guest access and review settings."
								})
							]
						}),
						inviteNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-accent",
							children: inviteNotice
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stage size" }), [
								"compact",
								"theater",
								"cinema"
							].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: stageSize === size ? "default" : "secondary",
								"aria-pressed": stageSize === size,
								onClick: () => setStageSize(size),
								children: size
							}, size))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: roomStage,
							"data-room-stage": stageSize,
							className: `mt-3 mx-auto w-full max-w-full scroll-mt-36 overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "max-w-md" : ""}`,
							children: guestLocalStream ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomStreamPlayer, {
								stream: guestLocalStream,
								title: sharedVideo?.name ?? sharedLocalMedia?.name ?? "Host video",
								playing: playback.playing,
								position: playback.position,
								duration: roomDuration(),
								onPlayback: (playing) => sync({
									...playback,
									playing
								}, false, true),
								onSeek: (position) => sync({
									...playback,
									position
								}, true, true),
								onResync: resync,
								onReadiness: observePlayer
							}) : matchingLocalSource && localShareIsMatched ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								ref: roomVideoRef,
								className: "aspect-video w-full bg-bg",
								src: matchingLocalSource,
								controls: true,
								playsInline: true,
								...nativePlayerReadiness,
								onLoadedMetadata: () => {
									observePlayer("ready");
									const seconds = roomVideoRef.current?.duration;
									if (typeof seconds === "number" && Number.isFinite(seconds)) setMeasuredDuration({
										videoId: sharedVideoId,
										seconds
									});
								},
								onEnded: () => {
									observePlayer("ended");
									finishRoomTitle();
								},
								onPlay: () => syncDevicePlayback({
									playing: true,
									position: roomVideoRef.current?.currentTime ?? 0
								}),
								onPause: () => {
									observePlayer("paused");
									syncDevicePlayback({
										playing: false,
										position: roomVideoRef.current?.currentTime ?? 0
									});
								},
								onSeeked: () => syncDevicePlayback({
									playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
									position: roomVideoRef.current?.currentTime ?? 0
								}, true),
								onTimeUpdate: () => {
									const media = roomVideoRef.current;
									if (joinedAsGuest || !media || media.paused || Date.now() - lastRoomTick.current < 900) return;
									lastRoomTick.current = Date.now();
									sync({
										playing: true,
										position: media.currentTime
									});
								}
							}, sharedVideoId) : sharedVideo?.remote?.kind === "twitch" && twitchEnvironment.blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"aria-label": "Twitch embed setup",
								className: "space-y-3 p-5 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-xl text-fg",
										children: "Twitch needs an HTTPS room address"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This device opened the room through an HTTP network address. Twitch requires HTTPS for embedded viewing. Ask the host to share an HTTPS invitation from Join on your phone, then rejoin with that link." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your chat, queue and votes still work here. Open on Twitch below plays outside the room and cannot synchronize its video." })
								]
							}) : sharedVideo?.remote?.kind === "twitch" && !twitchClip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full overflow-x-auto bg-bg",
								"aria-label": "Twitch player viewport",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative aspect-video w-full",
									style: {
										minWidth: 400,
										minHeight: 300
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										ref: twitchPlayerHostRef,
										className: "absolute inset-0"
									})
								})
							}) : twitchClip && sharedVideo?.remote?.embedUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full overflow-x-auto",
								"aria-label": "Twitch player viewport",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
									title: sharedVideo.name,
									src: watchRoomEmbed(sharedVideo),
									className: "aspect-video w-full border-0",
									style: {
										minWidth: 400,
										minHeight: 300
									},
									allow: "autoplay; encrypted-media; picture-in-picture",
									allowFullScreen: true
								}, sharedVideo.id + ":" + playerReload)
							}) : sharedVideo?.remote?.embedUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								ref: remoteFrameRef,
								title: sharedVideo.name,
								src: watchRoomEmbed(sharedVideo),
								className: "aspect-video w-full border-0",
								allow: "autoplay; encrypted-media; picture-in-picture",
								allowFullScreen: true,
								onLoad: () => {
									youtubeReady.current = false;
									youtubeClock.current = void 0;
									youtubeMetadataReady.current = "";
									catchUpOnStart.current = true;
									lastYoutubeSeekNonce.current = -1;
									lastYoutubePlaybackCommand.current = null;
									setRemoteFrameReady({
										id: sharedVideo.id,
										at: Date.now()
									});
								}
							}, `${sharedVideo.id}:${playerReload}`) : libraryLocalSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								ref: roomVideoRef,
								className: "aspect-video w-full bg-bg",
								src: libraryLocalSource,
								controls: true,
								playsInline: true,
								...nativePlayerReadiness,
								onLoadedMetadata: () => {
									observePlayer("ready");
									const seconds = roomVideoRef.current?.duration;
									if (typeof seconds === "number" && Number.isFinite(seconds)) setMeasuredDuration({
										videoId: sharedVideoId,
										seconds
									});
								},
								onEnded: () => {
									observePlayer("ended");
									finishRoomTitle();
								},
								onPlay: () => syncDevicePlayback({
									playing: true,
									position: roomVideoRef.current?.currentTime ?? 0
								}),
								onPause: () => {
									observePlayer("paused");
									syncDevicePlayback({
										playing: false,
										position: roomVideoRef.current?.currentTime ?? 0
									});
								},
								onSeeked: () => syncDevicePlayback({
									playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
									position: roomVideoRef.current?.currentTime ?? 0
								}, true),
								onTimeUpdate: () => {
									const media = roomVideoRef.current;
									if (joinedAsGuest || !media || media.paused || Date.now() - lastRoomTick.current < 900) return;
									lastRoomTick.current = Date.now();
									sync({
										playing: true,
										position: media.currentTime
									});
								}
							}, sharedVideoId) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex aspect-video flex-col items-center justify-center px-6 text-center text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/art/realhub-projector.webp",
									alt: "",
									loading: "lazy",
									className: "mb-2 h-28 w-36 object-contain"
								}), sharedLocalMedia?.id === sharedVideoId ? `Waiting for the host to play ${sharedLocalMedia.name}. Local video streams directly to this device once playback starts.` : sharedVideoId.startsWith("local:") ? "Waiting for the host’s local video stream or a matching file on this device." : "Choose a starter movie or an online video to show it to the room."]
							})
						}),
						sharedVideo?.remote?.kind === "twitch" && !twitchEnvironment.blocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: [!twitchClip && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "status",
								children: twitchPlayerStatus
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "sm:hidden",
								children: "Twitch needs a player at least 400 × 300 pixels. Swipe inside its player area to reach the edges, or turn your phone sideways."
							})]
						}),
						sharedVideo?.remote?.kind === "youtube" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeEmbedRecovery, {
							videoId: sharedVideo.remote.videoId ?? "",
							rows: youtubeDiagnostics.rows,
							notice: playerNotice,
							onReload: onReloadThisPlayer,
							onClearEarlier: youtubeDiagnostics.clearEarlier
						}, room) : sharedVideo?.remote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-md border border-border bg-bg/45 p-3",
							"aria-label": "Player recovery",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										className: "min-h-11",
										onClick: reloadThisPlayer,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), "Reload this player"]
									}),
									sharedVideo.remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: sharedVideo.remote.watchUrl,
										target: "_blank",
										rel: "noreferrer",
										className: "inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs text-accent hover:bg-elevated",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" }),
											"Open on ",
											sharedVideo.remote.kind === "twitch" ? "Twitch" : "provider"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Affects this device. Use Play next to change the room video."
									})
								]
							}), playerNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "status",
								className: "mt-2 text-xs leading-5 text-accent",
								children: playerNotice
							})]
						}),
						localStream.status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: localStream.status
						}),
						joinedAsGuest && sharedVideo?.remote && !twitchClip && !(sharedVideo.remote.kind === "twitch" && twitchEnvironment.blocked) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-md border border-border bg-bg/45 p-3",
							"aria-label": "Start phone playback",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								onClick: startThisDevice,
								children: "Start on this device"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: sharedVideo.remote.live ? "If this phone needs a tap, start here or press Play inside the video. This starts your live player without pausing everyone. YouTube and Twitch control each viewer’s live delay." : "If this phone needs a tap, start here or press Play inside the video. Your player catches up with the host without pausing everyone. Returning from the lock screen requests fresh timing automatically."
							})]
						}),
						guestLocalStream && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Watching the host’s local video. Use the room controls to pause or seek for everyone."
						}),
						sharedVideo?.remote?.kind === "youtube" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-subtle",
							children: sharedVideo.remote.live ? "YouTube Live · Play and pause are shared. Each viewer buffers independently; YouTube may give viewers different live delays. Live playback keeps its own clock." : "YouTube room controls retain the last trusted clock on pause, then resume from that same point. Use the room controls so every guest receives the same command."
						}) : sharedVideo?.remote?.kind === "twitch" && twitchClip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-subtle",
							children: [
								"Twitch clips use Twitch’s separate clip player. Use its own controls to watch; room selection and chat remain shared. If Twitch shows a content classification error, ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: sharedVideo.remote.watchUrl,
									target: "_blank",
									rel: "noreferrer",
									className: "text-accent underline",
									children: "open the clip directly"
								}),
								"."
							]
						}) : sharedVideo?.remote?.kind === "twitch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Twitch currently needs one manual Play press in each viewer’s embed."
							}), " Browser media rules prevent Realhub from forcing a guest stream to start. Selection, queue, chat, and the preserved pause clock still sync through the room controls."] }), sharedVideo.remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: sharedVideo.remote.watchUrl,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex min-h-8 items-center rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1 size-3" }), "Open Twitch directly"]
							})]
						}) : null,
						sharedVideo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg/45 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mr-auto min-w-0 truncate text-sm font-medium text-fg",
									children: sharedVideo.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: favorites[sharedVideo.id] ? "default" : "secondary",
									onClick: () => toggleFavorite(sharedVideo.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `size-4 ${favorites[sharedVideo.id] ? "fill-current" : ""}` }), favorites[sharedVideo.id] ? "Favorited" : "Favorite"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-1",
									"aria-label": "Rate current room video",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "flex size-9 items-center justify-center rounded-md text-accent hover:bg-elevated",
										"aria-label": `Rate ${sharedVideo.name} ${value} stars`,
										"aria-pressed": roomRating === value,
										onClick: () => {
											setRating(sharedVideo.id, roomRating === value ? 0 : value);
											setRoomRatingRevision((revision) => revision + 1);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `size-4 ${value <= roomRating ? "fill-current" : ""}` })
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-5 rounded-md border border-border bg-bg/35 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer text-sm font-medium text-fg",
									children: "Explore more videos and advanced queue controls"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-muted",
									children: "Recommended from your playable library — saved titles get a small lift while unplayed playable videos rotate to the front. Ready local files can be added to the queue below without taking over the stage."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomRecommendations, {
									videos: roomCandidates,
									youtubeVideos: youtubeRoomCandidates,
									currentId: sharedVideoId,
									visibleCount: roomPickLimit,
									pending: roomCandidatesPending,
									onSelect: onRecommendationSelect,
									onMix: onMixRecommendations,
									onLoadMore: onLoadRecommendations
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 rounded-md bg-bg/45 p-3 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-medium text-fg",
												children: "Up next queue"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: joinedAsGuest ? "Propose changes; host confirms the shared order" : "Host-controlled shared order"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs leading-5 text-muted",
											children: "The shared queue beside chat is the confirmed order. Add a recommendation below without interrupting the current video."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-3 flex gap-2 overflow-x-auto pb-1",
											children: roomCandidates.filter((video) => video.id !== sharedVideoId).slice(0, 12).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex shrink-0 overflow-hidden rounded-sm shadow-border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													onClick: () => queueImmediately(video),
													children: "Play next"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "ghost",
													disabled: queue.includes(video.id),
													onClick: () => queueVideo(video),
													children: ["+ queue · ", video.name]
												})]
											}, video.id))
										}),
										queueRecommendations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 border-t border-border pt-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-medium text-fg",
													children: "More queue ideas"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted",
													children: "Different from the theater picks above"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 flex gap-2 overflow-x-auto pb-1",
												children: queueRecommendations.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex shrink-0 overflow-hidden rounded-sm shadow-border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "secondary",
														onClick: () => queueImmediately(video),
														children: "Play next"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "ghost",
														onClick: () => queueVideo(video),
														children: ["+ queue · ", video.name]
													})]
												}, video.id))
											})]
										}),
										localQueueCandidates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 border-t border-border pt-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-medium text-fg",
													children: "Ready local files"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted",
													children: "Add to queue without opening now"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 flex gap-2 overflow-x-auto pb-1",
												children: localQueueCandidates.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => queueVideo(video),
													children: ["+ queue · ", video.name]
												}, video.id))
											})]
										}),
										localQueue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 border-t border-border pt-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-medium text-fg",
													children: "Approved local handoffs"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted",
													children: "Shared manifest · files stay on each device"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 space-y-2",
												children: localQueue.map((share) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-wrap items-center justify-between gap-2 rounded-sm bg-elevated px-3 py-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "min-w-0 truncate text-xs text-fg",
														children: [
															share.name,
															" · ",
															bytes(share.size)
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "secondary",
															onClick: () => stageLocalShare(share),
															children: "Stage"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "ghost",
															onClick: () => updateLocalQueue(localQueue.filter((item) => item.fingerprint !== share.fingerprint)),
															children: "Remove"
														})]
													})]
												}, share.fingerprint))
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-4 rounded-md border border-border bg-bg/35 p-3",
							onToggle: (event) => setRoomLocalToolsOpen(event.currentTarget.open),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer text-sm font-medium text-fg",
									children: "Local sharing, games & TV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 rounded-md bg-bg/45 p-4 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-medium text-fg",
												children: "Share local video"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted",
											children: "Choose a file you may share with your guests. Playback streams from the host; phones do not need a copy of the file. Keep this player open while watching."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "mt-3 block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "sr-only",
												type: "file",
												accept: "video/*",
												onChange: (event) => {
													const file = event.target.files?.[0] ?? null;
													selectLocalVideo(file);
												}
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
												children: joinedAsGuest ? localVideo?.name ?? "Choose matching local video" : pickedLocalVideo?.name ?? "Choose local video"
											})]
										}),
										(pickedLocalShare ?? localShare) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-subtle",
											children: [
												"Selected file · ",
												bytes((pickedLocalShare ?? localShare).size),
												". Only title and match metadata are shared; file bytes stream during playback."
											]
										}),
										localShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted",
											children: [
												"Optional local copies · ",
												Object.values(localShareMatches).filter((match) => match.fingerprint === localShare.fingerprint).length,
												"/",
												p2p.peers.length,
												" guests matched this file. Other guests receive the host’s playback stream."
											]
										}),
										pendingLocalShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-accent",
											children: [
												"Optional local copy: ",
												pendingLocalShare.name,
												" · ",
												bytes(pendingLocalShare.size),
												". You may choose a matching copy above instead of receiving the stream."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "mt-3 flex items-start gap-2 text-xs text-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: guestAccess,
												onChange: (event) => setGuestAccess(event.target.checked)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I confirm guests have access to this video and may receive this direct share." })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											className: "mt-3",
											disabled: joinedAsGuest || !pickedLocalVideo || !guestAccess || !p2p.peers.length,
											onClick: sharePickedLocal,
											children: "Send sharing request"
										}),
										!joinedAsGuest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											className: "mt-3 ml-2 min-h-11",
											disabled: !pickedLocalVideo || !guestAccess || queue.length >= 48,
											onClick: queuePickedLocal,
											children: "Queue selected local file"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "mt-3 min-h-11",
											disabled: !(pickedLocalShare ?? localShare),
											onClick: () => {
												const share = pickedLocalShare ?? localShare;
												if (!share) return;
												if (!localQueue.some((item) => item.fingerprint === share.fingerprint)) updateLocalQueue([...localQueue, share]);
												setInviteNotice("Added file match metadata to the handoff list. Queue selected local file above for automatic playback.");
											},
											children: "Add to matching-file list"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 rounded-md bg-bg/45 p-4 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-fg",
											children: "Watch-party mini games"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted",
											children: "Start a lightweight shared vote while the room is paused. Votes are sent to connected guests."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-3",
											value: partyPrompt,
											onChange: (event) => setPartyPrompt(event.target.value),
											"aria-label": "Party vote question"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-3 flex flex-wrap gap-2",
											children: Object.keys(partyVotes).map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => {
													const next = (partyVotes[choice] ?? 0) + 1;
													setPartyVotes((votes) => ({
														...votes,
														[choice]: next
													}));
													p2p.send({
														type: "party-vote",
														name: choice,
														position: next
													});
												},
												children: [
													choice,
													" · ",
													partyVotes[choice] ?? 0
												]
											}, choice))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-3 text-xs text-accent",
											children: ["Now voting: ", partyPrompt]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 rounded-md bg-bg/45 p-4 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-2 text-sm font-medium text-fg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4 text-accent" }), "Roku handoff"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
											className: "mt-2 space-y-1 text-xs text-muted",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mr-2 text-accent",
													children: "1."
												}), "On Roku, open Settings → Network → About and copy its IP address."] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mr-2 text-accent",
													children: "2."
												}), "Enter it below to save this TV as a trusted handoff target."] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mr-2 text-accent",
													children: "3."
												}), "Launch the channel and copy the room invitation to your Roku browser or companion app."] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-col gap-2 sm:flex-row",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: rokuAddress,
													onChange: (event) => {
														setRokuAddress(event.target.value);
														setRokuReady(false);
													},
													placeholder: "Roku IP address, e.g. 192.168.1.24",
													"aria-label": "Roku IP address"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "secondary",
													disabled: !rokuAddress.trim(),
													onClick: () => {
														setRokuReady(true);
														localStorage.setItem("reelcase.roku", rokuAddress.trim());
													},
													children: "Save & pair TV"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "secondary",
													onClick: () => void (async () => {
														try {
															const devices = (await (await fetch("http://127.0.0.1:43123/roku/discover")).json()).devices ?? [];
															setRokuDevices(devices);
															setRokuNotice(devices.length ? `${devices.length} Roku device${devices.length === 1 ? "" : "s"} found on this network.` : "No Roku devices responded. You can still pair one by its IP address.");
														} catch {
															setRokuNotice("Roku discovery needs the local Realhub Companion running on this Windows computer.");
														}
													})(),
													children: "Discover TVs"
												})
											]
										}),
										rokuNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs text-muted",
											children: rokuNotice
										}),
										rokuDevices.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex flex-wrap gap-2",
											children: rokuDevices.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => {
													setRokuAddress(device.address);
													setRokuReady(true);
													localStorage.setItem("reelcase.roku", device.address);
												},
												children: device.address
											}, device.address))
										}),
										rokuReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 rounded-sm bg-elevated p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-accent",
												children: ["Step 3 ready · ", rokuAddress]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 flex flex-wrap gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													onClick: () => {
														const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}`;
														window.open(`http://${rokuAddress}:8060/launch/837`, "_blank", "noopener");
														navigator.clipboard?.writeText(url).catch(() => {});
													},
													children: "Launch & copy room link"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => {
														setRokuReady(false);
														localStorage.removeItem("reelcase.roku");
													},
													children: "Forget TV"
												})]
											})]
										})
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: stageSize === "cinema" ? "grid min-w-0 items-start gap-4 lg:grid-cols-2" : "min-w-0 space-y-4 self-start",
					children: [
						room && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: roomParticipationAnchor,
							className: "scroll-mt-36",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomParticipationPanel, {
								localPlayer: localPlayerReadiness,
								playing: playback.playing,
								onWait: onWaitForPlayers,
								room,
								guest: joinedAsGuest,
								hostId: mediaHostId,
								selfId: p2p.selfId,
								peers: p2p.peers,
								readyRevision: p2p.readyRevision,
								send: p2p.send,
								onMessage: p2p.onMessage,
								queue: queuePanelRows,
								onPrioritize: onQueueChange
							}, room + ":" + joinedAsGuest)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: roomQueueAnchor,
							className: "scroll-mt-36",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomQueuePanel, {
								hostCatalog: joinedAsGuest ? hostCatalog : void 0,
								preferHost: joinedAsGuest && !videos.length,
								candidates: roomCandidates,
								queue: queuePanelRows,
								currentId: sharedVideoId,
								currentTitle: sharedVideo?.name,
								currentMediaKey: sharedVideo ? roomMediaKey(sharedVideo) : void 0,
								guest: joinedAsGuest,
								writable: queueWritable,
								suggesting: canSuggest,
								reviewMode: reviewQueue,
								onReviewMode: onReviewQueue,
								guestEditing: guestQueueEnabled,
								onGuestEditing: onGuestQueueEditing,
								canUndo: !joinedAsGuest && undoRevision === queueRevisionRef.current,
								onUndo: onQueueUndo,
								savedCount: savedQueue?.media.length ?? 0,
								onRestore: onQueueRestore,
								notice: queueNotice,
								pending: pendingQueueChanges,
								autoAdvance,
								onAutoAdvance: onQueueAutoAdvance,
								onSelect: onQueueSelect,
								onAdd: onQueueAdd,
								onChange: onQueueChange,
								onEdit: onQueueEdit,
								onClear: onQueueClear,
								onNext: onQueueNext,
								onShuffle: onQueueShuffle,
								onLink: onQueueLink,
								onLoadList: onQueueLoadList,
								onImportSession,
								currentMedia: queueCurrentMedia,
								playedMedia: sessionPlayedMedia,
								catalogPending: roomCandidatesPending
							}, room)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							ref: roomChat,
							className: "scroll-mt-36 rounded-lg bg-elevated p-4 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-sm font-medium text-fg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 text-accent" }), " Room chat"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									ref: chatScroll,
									role: "log",
									"aria-label": "Room messages",
									"aria-live": "polite",
									onScroll: (event) => {
										const target = event.currentTarget;
										chatAtBottom.current = target.scrollHeight - target.clientHeight - target.scrollTop < 48;
									},
									className: "mt-3 min-h-24 max-h-48 space-y-2 overflow-y-auto text-sm text-muted",
									children: chat.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "rounded-sm bg-bg/45 px-3 py-2",
										children: row
									}, `${row}-${index}`))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: message,
										onChange: (event) => setMessage(event.target.value),
										onKeyDown: (event) => {
											if (event.key === "Enter") send();
										},
										placeholder: "Say something",
										"aria-label": "Room chat message"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: send,
										children: "Send"
									})]
								})
							]
						}),
						joinedAsGuest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "rounded-lg border border-border bg-surface p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer text-sm text-fg",
								children: "Invite another guest"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomInvitation, {
								invitation,
								started: true,
								onNotice: setInviteNotice
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomInvitation, {
							invitation,
							started: true,
							onNotice: setInviteNotice
						}),
						(reviewQueue || suggestions.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: requestsAnchor,
							className: "scroll-mt-36",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomSuggestionsPanel, {
								items: suggestions,
								guest: joinedAsGuest,
								enabled: guestQueueEnabled && reviewQueue,
								full: queue.length >= 48,
								notice: reviewNotice,
								onDecide: onSuggestionDecision
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: roomHistoryAnchor,
							className: "scroll-mt-36",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomWatchHistoryPanel, {
								entries: watchHistory,
								writable: queueWritable,
								guest: joinedAsGuest,
								pending: pendingQueueChanges,
								full: queue.length >= 48,
								queuedKeys: recentQueuedKeys,
								onPlay: onQueueSelect,
								onQueue: onQueueAdd,
								onClear: clearWatchHistory,
								notice: historyNotice
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomRecentPanel, {
							media: recentMedia,
							currentKey: sharedVideo ? roomMediaKey(sharedVideo) : void 0,
							queuedKeys: recentQueuedKeys,
							writable: queueWritable,
							guest: joinedAsGuest,
							pending: pendingQueueChanges,
							full: queue.length >= 48,
							onPlay: onQueueSelect,
							onQueue: onQueueAdd
						}),
						sharedVideo?.remote?.kind === "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "rounded-lg bg-elevated p-2 shadow-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultComments, { video: sharedVideo })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Guests & connection status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
							children: ["You · ", p2p.joined ? "ready" : "joining"]
						}), p2p.peers.length ? p2p.peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
							children: [
								peer.name || "Guest",
								" · ",
								peer.connectionState,
								peer.rttMs ? ` · ${peer.rttMs}ms` : ""
							]
						}, peer.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-subtle",
							children: "Waiting for guests to join with the room code."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							maxLength: 64,
							onChange: (event) => setName(event.target.value),
							"aria-label": "Display name",
							className: "max-w-56"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								flushQueueDraft();
								setActiveRoom(null);
								queueRef.current = [];
								setQueue([]);
								localFiles.current.clear();
								setLocalVideo(null);
								setLocalShare(null);
								setPickedLocalVideo(null);
								setPendingLocalShare(null);
								setPlayback({
									playing: false,
									position: 0
								});
								setSharedVideoId("");
								setRoomCode(`RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
							},
							children: "Leave room"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { WatchRoomSection };
