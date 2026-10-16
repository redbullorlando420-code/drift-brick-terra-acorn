import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $ as isRemovedRedditVideo } from "./adult-reddit-tags-DvmR8YRa.mjs";
import { Gn as useLibrary, Yn as withCatalogDetails, Yt as inspectRedditImage, en as loadCatalogVideo, mn as resolveBooruOriginal, qn as viewerDetails } from "./library-app-BzjHGYQD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-video-details-CGkDGMf4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/** Recover old watch/short links and malformed embed metadata without throwing
* during player render. A saved provider ID is the strongest recovery source. */
function youtubeEmbedUrl(base, savedId, origin) {
	const valid = (value) => value && /^[A-Za-z0-9_-]{11}$/.test(value) ? value : void 0;
	let id = valid(savedId);
	let start = 0;
	try {
		const source = new URL(base, "https://www.youtube.com");
		const host = source.hostname.toLowerCase().replace(/^www\./, "");
		if ([
			"youtube.com",
			"m.youtube.com",
			"youtube-nocookie.com",
			"youtu.be"
		].includes(host)) {
			const parts = source.pathname.split("/").filter(Boolean);
			id ??= valid(host === "youtu.be" ? parts[0] : source.searchParams.get("v") || ([
				"embed",
				"shorts",
				"live"
			].includes(parts[0]) ? parts[1] : void 0));
			const seconds = Number(source.searchParams.get("start"));
			if (Number.isFinite(seconds) && seconds > 0) start = Math.floor(seconds);
		}
	} catch {}
	if (!id) return null;
	const url = new URL(`https://www.youtube.com/embed/${id}`);
	for (const [key, value] of Object.entries({
		autoplay: "1",
		rel: "0",
		playsinline: "1",
		controls: "1"
	})) url.searchParams.set(key, value);
	if (start) url.searchParams.set("start", String(start));
	if (origin) url.searchParams.set("origin", origin);
	return url.toString();
}
function useRedditMedia(video) {
	const [removedId, setRemovedId] = (0, import_react.useState)("");
	const markUnavailable = useLibrary((s) => s.markUnavailable);
	const known = Boolean(video && isRemovedRedditVideo(video));
	const src = video?.src || video?.remote?.embedUrl || video?.remote?.previewUrl || video?.poster;
	const redditPhoto = video?.remote?.kind === "reddit" && /^image\//.test(video.mime ?? "");
	(0, import_react.useEffect)(() => {
		if (!video || !redditPhoto || !src) return;
		let cancelled = false;
		const hide = () => {
			if (!cancelled) {
				setRemovedId(video.id);
				markUnavailable(video.id, "Removed by Reddit");
			}
		};
		if (known) hide();
		else inspectRedditImage({ data: src }).then((result) => {
			if (result.removed) hide();
		}).catch(() => void 0);
		return () => {
			cancelled = true;
		};
	}, [
		video?.id,
		redditPhoto,
		src,
		known,
		markUnavailable
	]);
	return known || Boolean(video && removedId === video.id);
}
/** Keep URL strings, not decoded images; release failed resolutions promptly. */
var cache = /* @__PURE__ */ new Map();
function cachedBooruOriginal(host, id, resolve) {
	const key = `${host}:${id}`, now = Date.now(), saved = cache.get(key);
	if (saved && now - saved.at < 18e5) return saved.promise;
	const promise = Promise.resolve().then(resolve).then((url) => {
		if (!url && cache.get(key)?.promise === promise) cache.delete(key);
		return url;
	}, () => {
		if (cache.get(key)?.promise === promise) cache.delete(key);
		return null;
	});
	cache.set(key, {
		at: now,
		promise
	});
	while (cache.size > 128) cache.delete(cache.keys().next().value);
	return promise;
}
/** Shared by preview and player; resolving the selected image never scans a shelf. */
function useBooruOriginal(video) {
	const remote = video?.remote;
	const host = remote?.kind === "booru" ? remote.channelId : void 0;
	const id = host ? remote?.videoId : void 0;
	const key = host && id ? `${host}:${id}` : "";
	const [result, setResult] = (0, import_react.useState)({
		key: "",
		url: null,
		loading: false
	});
	(0, import_react.useEffect)(() => {
		if (!host || !id) return;
		let active = true;
		setResult({
			key,
			url: null,
			loading: true
		});
		cachedBooruOriginal(host, id, () => resolveBooruOriginal({ data: {
			host,
			id
		} })).then((url) => {
			if (active) setResult({
				key,
				url,
				loading: false
			});
		});
		return () => {
			active = false;
		};
	}, [
		host,
		id,
		key
	]);
	return {
		original: result.key === key ? result.url : null,
		loading: Boolean(key) && (result.key !== key || result.loading),
		failed: () => setResult({
			key,
			url: null,
			loading: false
		})
	};
}
function clearVideoDetailCache() {
	viewerDetails.clearCache();
}
function useVideoDetails(card) {
	const [loaded, setLoaded] = (0, import_react.useState)();
	const subscribe = (0, import_react.useCallback)((listener) => viewerDetails.subscribe(card?.id, listener), [card?.id]);
	const comments = (0, import_react.useSyncExternalStore)(subscribe, () => viewerDetails.commentsFor(card?.id), () => void 0);
	(0, import_react.useEffect)(() => {
		if (!card?.detailsOnDisk) {
			setLoaded(void 0);
			return;
		}
		let cancelled = false;
		viewerDetails.load(card.id, () => loadCatalogVideo(card.id)).then((video) => {
			if (cancelled || !video) return;
			setLoaded(video);
		}).catch(() => void 0);
		return () => {
			cancelled = true;
		};
	}, [card?.id, card?.detailsOnDisk]);
	return (0, import_react.useMemo)(() => {
		const video = card && loaded?.id === card.id ? withCatalogDetails(card, loaded) : card;
		return video?.remote && comments !== void 0 ? {
			...video,
			remote: {
				...video.remote,
				comments
			}
		} : video;
	}, [
		card,
		loaded,
		comments
	]);
}
var onVisibility = () => {
	if (document.hidden) clearVideoDetailCache();
};
var onPageHide = () => viewerDetails.clear();
var onDetailsChanged = (event) => {
	viewerDetails.invalidate(event.detail);
};
if (typeof window !== "undefined") {
	window.addEventListener("reelcase:video-details-changed", onDetailsChanged);
	window.addEventListener("pagehide", onPageHide);
	document.addEventListener("visibilitychange", onVisibility);
}
//#endregion
export { youtubeEmbedUrl as i, useRedditMedia as n, useVideoDetails as r, useBooruOriginal as t };
