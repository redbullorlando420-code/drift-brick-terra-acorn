import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Mt as resolveBooruOriginal, ht as loadCatalogVideo, jn as withCatalogDetails } from "./input-CETQgBIY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-video-details-YjuYgwFF.js
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
var details = /* @__PURE__ */ new Map();
var MAX_DETAILS = 12;
function clearVideoDetailCache() {
	details.clear();
}
function useVideoDetails(card) {
	const [loaded, setLoaded] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (!card?.detailsOnDisk) {
			setLoaded(void 0);
			return;
		}
		let cancelled = false;
		const cached = details.get(card.id);
		if (cached) {
			setLoaded(cached);
			return;
		}
		loadCatalogVideo(card.id).then((video) => {
			if (cancelled || !video) return;
			if ((video.description?.length ?? 0) + (video.remote?.comments ?? []).reduce((sum, row) => sum + row.body.length, 0) < 128e3) {
				details.set(video.id, video);
				while (details.size > MAX_DETAILS) details.delete(details.keys().next().value);
			}
			setLoaded(video);
		}).catch(() => void 0);
		return () => {
			cancelled = true;
		};
	}, [card?.id, card?.detailsOnDisk]);
	return (0, import_react.useMemo)(() => card && loaded?.id === card.id ? withCatalogDetails(card, loaded) : card, [card, loaded]);
}
var onVisibility = () => {
	if (document.hidden) clearVideoDetailCache();
};
var onDetailsChanged = (event) => {
	details.delete(event.detail);
};
if (typeof window !== "undefined") {
	window.addEventListener("reelcase:video-details-changed", onDetailsChanged);
	window.addEventListener("pagehide", clearVideoDetailCache);
	document.addEventListener("visibilitychange", onVisibility);
}
//#endregion
export { useVideoDetails as n, youtubeEmbedUrl as r, useBooruOriginal as t };
