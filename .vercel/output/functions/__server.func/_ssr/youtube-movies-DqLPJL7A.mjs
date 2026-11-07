//#region node_modules/.nitro/vite/services/ssr/assets/youtube-movies-DqLPJL7A.js
/** Public storefront observations, never playback entitlements or owned media. */
var MOVIE_REGIONS = [
	"US",
	"GB",
	"AU",
	"DE",
	"JP"
];
function movieRequest(raw) {
	const r = raw;
	if (!r || !["catalog", "search"].includes(r.mode) || !MOVIE_REGIONS.includes(r.region) || typeof r.query !== "string" || r.query.length > 120 || /[\x00-\x1f]/.test(r.query) || r.mode === "search" && !r.query.trim() || r.page !== void 0 && !/^[a-zA-Z0-9-]{1,60}$/.test(r.page)) throw Error("Choose a supported region and enter a film title (up to 120 characters).");
	return {
		mode: r.mode,
		region: r.region,
		query: r.mode === "search" ? r.query.trim() : "",
		...r.page ? { page: r.page } : {}
	};
}
var list = (v) => Array.isArray(v) ? v : [];
var txt = (v, max = 240) => (typeof v === "string" ? v : typeof v?.simpleText === "string" ? v.simpleText : list(v?.runs).map((r) => typeof r?.text === "string" ? r.text : "").join("")).replace(/[\x00-\x1f]/g, " ").slice(0, max).trim();
function moviePoster(raw) {
	if (typeof raw !== "string" || raw.length > 800) return "";
	try {
		const u = new URL(raw.startsWith("//") ? "https:" + raw : raw);
		return u.protocol === "https:" && /^(?:i|i[1-4])\.ytimg\.com$/.test(u.hostname) && !u.username && !u.password && !u.port ? u.href : "";
	} catch {
		return "";
	}
}
var movieWatchUrl = (id) => "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
function parseYoutubeMovies(root, region, now = Date.now()) {
	const movies = [], ids = /* @__PURE__ */ new Set(), shelves = [];
	let continuation = null, visited = 0;
	const walk = (v, depth = 0) => {
		if (!v || typeof v !== "object" || depth > 28 || ++visited > 18e3) return;
		if (Array.isArray(v)) {
			for (const child of v) walk(child, depth + 1);
			return;
		}
		const r = v.gridMovieRenderer ?? v.movieRenderer;
		if (r) {
			const id = r.videoId, title = txt(r.title);
			if (typeof id !== "string" || !/^[\w-]{11}$/.test(id) || !title || ids.has(id) || movies.length >= 64) return;
			const clock = txt(r.lengthText), parts = clock.split(":").map(Number);
			const seconds = /^\d{1,3}:\d{2}(?::\d{2})?$/.test(clock) && parts.slice(1).every((n) => n < 60) ? parts.reduce((n, p) => n * 60 + p, 0) : null;
			if (seconds !== null && seconds <= 600) return;
			const metadata = txt(r.metadata ?? r.topMetadataItems?.[0]), badges = list(r.badges).map((b) => b?.metadataBadgeRenderer).filter(Boolean);
			const offer = txt(badges.find((b) => b.style === "BADGE_STYLE_TYPE_YPC")?.label, 80) || "Offer not supplied";
			const rating = txt(badges.find((b) => b.style === "BADGE_STYLE_TYPE_MEDIA" || /^(?:G|PG|PG-13|R|NC-17|NR|TV-[A-Z0-9]+)$/.test(b.label ?? ""))?.label, 24);
			const year = metadata.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
			const poster = list(r.thumbnail?.thumbnails).map((t) => moviePoster(t?.url)).find(Boolean) ?? "";
			ids.add(id);
			movies.push({
				id,
				title,
				poster,
				seconds,
				year: year ? Number(year[1]) : null,
				metadata,
				description: txt(r.descriptionSnippet, 360),
				offer,
				rating,
				region,
				observedAt: now
			});
			return;
		}
		if (v.gridShowRenderer || v.showRenderer || v.videoRenderer || v.adSlotRenderer || v.promotedSparklesWebRenderer) return;
		if (v.continuationItemRenderer) {
			const token = v.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
			if (!continuation && typeof token === "string" && token.length <= 16e3) continuation = token;
			return;
		}
		const shelf = v.shelfRenderer;
		if (shelf?.content?.horizontalMovieListRenderer && shelf.endpoint?.browseEndpoint?.browseId === "FEstorefront") {
			const params = shelf.endpoint.browseEndpoint.params;
			if (typeof params === "string" && params.length <= 4e3 && shelves.length < 12) shelves.push({
				title: txt(shelf.title, 100) || "More films",
				params
			});
		}
		for (const [key, child] of Object.entries(v)) {
			if (/Endpoint$|Command$|tracking|menu|header|sidebar|frameworkUpdates|adPlacements|onResponseReceived/i.test(key)) continue;
			walk(child, depth + 1);
		}
	};
	if (root?.contents) walk(root.contents);
	for (const cmd of [...list(root?.onResponseReceivedCommands), ...list(root?.onResponseReceivedActions)]) walk(cmd?.appendContinuationItemsAction?.continuationItems ?? cmd?.reloadContinuationItemsCommand?.continuationItems);
	if (!root?.contents && !root?.onResponseReceivedCommands && !root?.onResponseReceivedActions) throw Error("YouTube returned an unreadable movie catalog. Try again or open YouTube Movies.");
	return {
		movies,
		continuation,
		shelves,
		observedAt: now
	};
}
//#endregion
export { parseYoutubeMovies as a, movieWatchUrl as i, moviePoster as n, movieRequest as r, MOVIE_REGIONS as t };
