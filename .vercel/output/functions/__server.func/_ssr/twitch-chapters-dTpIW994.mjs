//#region node_modules/.nitro/vite/services/ssr/assets/twitch-chapters-dTpIW994.js
var TWITCH_CHAPTER_QUERY = "query($id:ID!){video(id:$id){id lengthSeconds moments(momentRequestType:VIDEO_CHAPTER_MARKERS){edges{node{positionMilliseconds durationMilliseconds description}}}}}";
var record = (v) => v !== null && typeof v === "object" && !Array.isArray(v) ? v : {};
function twitchVodChapterId(video) {
	const id = video.remote?.videoId;
	return video.remote?.kind === "twitch" && !video.remote.live && video.extension !== "clip" && video.extension !== "live" && !video.id?.startsWith("tw:c:") && typeof id === "string" && /^\d{1,20}$/.test(id) ? id : null;
}
function twitchChapterTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0 || seconds > 172800) throw Error("Invalid chapter timestamp.");
	const t = Math.floor(seconds);
	return `${Math.floor(t / 3600)}h${Math.floor(t / 60) % 60}m${t % 60}s`;
}
function twitchChapterUrl(videoId, seconds) {
	if (!/^\d{1,20}$/.test(videoId)) throw Error("A numeric Twitch VOD identity is required.");
	return `https://www.twitch.tv/videos/${videoId}?t=${twitchChapterTime(seconds)}`;
}
function twitchChapterEmbed(embed, seconds) {
	if (embed === null || seconds === void 0) return embed;
	try {
		const u = new URL(embed);
		if (u.protocol === "https:" && u.hostname === "player.twitch.tv" && /^v?\d+$/.test(u.searchParams.get("video") ?? "") && !u.searchParams.has("channel")) {
			u.searchParams.set("time", twitchChapterTime(seconds));
			return u.toString();
		}
	} catch {}
	return embed;
}
function readTwitchChapterReport(id, raw) {
	const r = record(raw);
	if (r.videoId !== id || ![
		"ready",
		"empty",
		"unavailable"
	].includes(String(r.state)) || !Array.isArray(r.chapters) || r.chapters.length > 200 || typeof r.note !== "string" || r.note.length > 500 || typeof r.checkedAt !== "number" || !Number.isFinite(r.checkedAt) || r.checkedAt < 0 || !Number.isSafeInteger(r.rejected) || Number(r.rejected) < 0 || Number(r.rejected) > 200) throw Error("Unreadable chapter report.");
	if (r.state === "unavailable") {
		if (r.chapters.length) throw Error("Unavailable metadata cannot contain chapters.");
		return {
			videoId: id,
			checkedAt: r.checkedAt,
			state: "unavailable",
			chapters: [],
			rejected: Number(r.rejected),
			note: r.note
		};
	}
	const parsed = parseTwitchChapters(id, { data: { video: {
		id,
		moments: { edges: r.chapters.map((value) => {
			const c = record(value);
			return { node: {
				positionMilliseconds: typeof c.start === "number" ? Math.round(c.start * 1e3) : null,
				durationMilliseconds: typeof c.end === "number" && typeof c.start === "number" ? Math.round((c.end - c.start) * 1e3) : null,
				description: c.label
			} };
		}) }
	} } }, r.checkedAt);
	if (parsed.state !== r.state || parsed.rejected || parsed.chapters.length !== r.chapters.length) throw Error("Unreadable chapter report.");
	return {
		...parsed,
		rejected: Number(r.rejected),
		note: r.note
	};
}
function parseTwitchChapters(videoId, raw, now = Date.now()) {
	const root = record(raw), video = record(record(root.data).video), moments = record(video.moments);
	if (root.errors !== void 0 && (!Array.isArray(root.errors) || root.errors.length) || video.id !== videoId || !Array.isArray(moments.edges) || moments.edges.length > 200) throw Error("No readable public chapter markers.");
	const duration = typeof video.lengthSeconds === "number" && Number.isFinite(video.lengthSeconds) && video.lengthSeconds > 0 && video.lengthSeconds <= 172800 ? video.lengthSeconds : 172800;
	let rejected = 0;
	const candidates = [];
	for (const edge of moments.edges) {
		const n = record(record(edge).node), start = n.positionMilliseconds, length = n.durationMilliseconds, label = n.description;
		if (typeof start !== "number" || !Number.isSafeInteger(start) || start < 0 || typeof length !== "number" || !Number.isSafeInteger(length) || length <= 0 || (start + length) / 1e3 > duration || typeof label !== "string" || !label.trim() || label.length > 240) {
			rejected++;
			continue;
		}
		candidates.push({
			start: start / 1e3,
			end: (start + length) / 1e3,
			label: label.trim()
		});
	}
	candidates.sort((a, b) => a.start - b.start);
	const chapters = [];
	for (const chapter of candidates) {
		if (chapters.length && chapter.start < chapters.at(-1).end) {
			rejected++;
			continue;
		}
		chapters.push(chapter);
	}
	if (rejected && !chapters.length) throw Error("All public markers were unreadable.");
	return {
		videoId,
		checkedAt: now,
		state: chapters.length ? "ready" : "empty",
		chapters,
		rejected,
		note: chapters.length ? `Public Twitch VOD game/chapter markers${rejected ? `; ${rejected} invalid or overlapping markers ignored` : ""}.` : "Twitch returned no public chapter markers. No chapters were inferred from the title or current game."
	};
}
/** Bounded public detail cache; called only by explicit selected-VOD requests. */
function createTwitchChapterReader(read, now = Date.now) {
	const cache = /* @__PURE__ */ new Map(), pending = /* @__PURE__ */ new Map();
	return async (input) => {
		if (typeof input !== "string" || !/^\d{1,20}$/.test(input)) throw Error("Choose a Twitch VOD, not a clip or live channel.");
		const found = cache.get(input);
		if (found && now() - found.checkedAt < 6e5) return found;
		if (pending.has(input)) return pending.get(input);
		const unavailable = () => ({
			videoId: input,
			checkedAt: now(),
			state: "unavailable",
			chapters: [],
			rejected: 0,
			note: "Public chapter metadata is unavailable or unreadable. The video can still be opened normally on Twitch; no chapters were invented."
		});
		if (pending.size >= 8) return unavailable();
		const work = (async () => {
			try {
				const result = parseTwitchChapters(input, await Promise.resolve().then(() => read(input)), now());
				cache.delete(input);
				cache.set(input, result);
				while (cache.size > 8) cache.delete(cache.keys().next().value);
				return result;
			} catch {
				return unavailable();
			} finally {
				pending.delete(input);
			}
		})();
		pending.set(input, work);
		return work;
	};
}
//#endregion
export { twitchChapterUrl as a, twitchChapterEmbed as i, createTwitchChapterReader as n, twitchVodChapterId as o, readTwitchChapterReport as r, TWITCH_CHAPTER_QUERY as t };
