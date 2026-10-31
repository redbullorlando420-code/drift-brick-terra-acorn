//#region node_modules/.nitro/vite/services/ssr/assets/stream-signal-CGbrHSsX.js
var SIGNAL_PLATFORMS = [
	"x",
	"facebook",
	"instagram",
	"tiktok"
];
var SIGNAL_SITES = {
	x: {
		name: "X",
		url: "https://x.com/"
	},
	facebook: {
		name: "Facebook",
		url: "https://www.facebook.com/"
	},
	instagram: {
		name: "Instagram",
		url: "https://www.instagram.com/"
	},
	tiktok: {
		name: "TikTok",
		url: "https://www.tiktok.com/"
	}
};
var DEFAULT_SIGNAL_PROFILE = {
	creator: "notyoda",
	twitch: "https://www.twitch.tv/notyoda",
	youtube: "https://www.youtube.com/@astronauta2706",
	title: "On the grid with notyoda",
	game: "iRacing Arcade",
	message: "Come hang out, cheer on the laps, and join the community."
};
var SIGNAL_LIMITS = {
	creator: 60,
	twitch: 256,
	youtube: 256,
	title: 140,
	game: 80,
	message: 600
};
function signalOwnerPrefix(owner) {
	if (!owner) throw Error("A current app user is required.");
	return `stream-signal:v1:${encodeURIComponent(owner)}:`;
}
function validateSignalProfile(profile) {
	const errors = {};
	for (const field of Object.keys(SIGNAL_LIMITS)) {
		if (profile[field].length > SIGNAL_LIMITS[field]) errors[field] = `Use ${SIGNAL_LIMITS[field]} characters or fewer.`;
		if (field !== "message" && !profile[field].trim()) errors[field] = "This field is required.";
	}
	for (const kind of ["twitch", "youtube"]) try {
		const u = new URL(profile[kind].trim());
		const validHost = kind === "twitch" ? /^(?:www\.)?twitch\.tv$/i.test(u.hostname) : /^(?:www\.)?youtube\.com$/i.test(u.hostname);
		const validPath = kind === "twitch" ? /^\/[a-zA-Z0-9_]{1,25}\/?$/.test(u.pathname) : /^\/(?:@[\p{L}\p{N}_.%\-]+|channel\/UC[\w-]{22}|(?:c|user)\/[\w.%\-]+)\/?$/u.test(u.pathname);
		if (u.protocol !== "https:" || !validHost || !validPath || u.username || u.password || u.port || u.search || u.hash) throw Error();
	} catch {
		errors[kind] = kind === "twitch" ? "Use an HTTPS Twitch channel URL, such as https://www.twitch.tv/notyoda." : "Use an HTTPS YouTube @handle or channel URL.";
	}
	return errors;
}
function normalizeSignalProfile(raw) {
	const row = raw && typeof raw === "object" ? raw : {};
	return Object.fromEntries(Object.keys(SIGNAL_LIMITS).map((key) => [key, typeof row[key] === "string" ? row[key].slice(0, SIGNAL_LIMITS[key]) : DEFAULT_SIGNAL_PROFILE[key]]));
}
var short = (text, limit) => [...text].length <= limit ? text : [...text].slice(0, limit - 1).join("") + "…";
function generateSignalPack(input, id, at = Date.now()) {
	if (Object.keys(validateSignalProfile(input)).length) throw Error("Correct the channel setup fields before generating a pack.");
	const profile = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value.trim()]));
	const links = `Twitch: ${profile.twitch}\nYouTube: ${profile.youtube}`;
	const xLinks = `${profile.twitch}\n${profile.youtube}`;
	if ([...xLinks].length > 210) throw Error("These channel URLs are too long for a short X post. Use shorter channel links.");
	const headline = short(`${profile.creator} is live · ${profile.game}! ${profile.title}`, 279 - [...xLinks].length);
	const common = `${profile.creator} is live!\n${profile.title}\nPlaying ${profile.game}\n\n${profile.message}\n\n${links}`;
	return {
		id,
		createdAt: at,
		updatedAt: at,
		revision: 0,
		draftRevisions: {},
		history: [],
		profile,
		shared: {},
		drafts: {
			x: `${headline}\n${xLinks}`,
			facebook: common,
			instagram: `${common}\n\nJoin the stream. Add a Link sticker to your Story or use your profile link. #LiveStream`,
			tiktok: `${profile.creator} is live playing ${profile.game}!\n${profile.title}\n${profile.message}\n\n${links}\n\nFind the stream through my profile link, if available. #Gaming #LiveStream`
		}
	};
}
function readSignalPack(raw) {
	if (!raw || typeof raw !== "object") throw Error("This saved pack is damaged. Your other packs are still available.");
	const p = raw;
	if (typeof p.id !== "string" || !/^pack:\d{13}:\w[\w-]*$/.test(p.id) || !Number.isFinite(p.createdAt) || !Number.isSafeInteger(p.createdAt) || p.createdAt < 0 || p.updatedAt !== void 0 && (!Number.isSafeInteger(p.updatedAt) || p.updatedAt < p.createdAt) || !p.drafts || !SIGNAL_PLATFORMS.every((key) => typeof p.drafts[key] === "string" && p.drafts[key].length <= 6e3)) throw Error("This saved pack is damaged.");
	if (p.revision !== void 0 && (!Number.isSafeInteger(p.revision) || p.revision < 0)) throw Error("Unsupported announcement revision.");
	if (p.draftRevisions !== void 0 && SIGNAL_PLATFORMS.some((key) => p.draftRevisions?.[key] !== void 0 && (!Number.isSafeInteger(p.draftRevisions[key]) || p.draftRevisions[key] < 0 || p.draftRevisions[key] > (p.revision ?? 0)))) throw Error("Invalid draft revision.");
	if (p.history !== void 0 && (!Array.isArray(p.history) || p.history.length > 12 || p.history.some((row) => !row || !SIGNAL_PLATFORMS.includes(row.platform) || !Number.isSafeInteger(row.revision) || row.revision < 1 || row.revision > (p.revision ?? 0) || !Number.isSafeInteger(row.at) || row.at < 0 || typeof row.text !== "string" || row.text.length > 6e3 || row.shared !== void 0 && (!Number.isSafeInteger(row.shared) || row.shared < 0)))) throw Error("Invalid announcement edit history.");
	const historyKeys = /* @__PURE__ */ new Set();
	for (const row of p.history ?? []) {
		const key = row.revision + ":" + row.platform;
		if (historyKeys.has(key)) throw Error("Duplicate announcement history entry.");
		historyKeys.add(key);
	}
	return {
		id: p.id,
		createdAt: p.createdAt,
		updatedAt: p.updatedAt ?? p.createdAt,
		profile: normalizeSignalProfile(p.profile),
		drafts: Object.fromEntries(SIGNAL_PLATFORMS.map((key) => [key, p.drafts[key]])),
		shared: Object.fromEntries(SIGNAL_PLATFORMS.filter((key) => Number.isSafeInteger(p.shared?.[key]) && p.shared[key] >= 0).map((key) => [key, p.shared[key]])),
		revision: p.revision ?? 0,
		draftRevisions: Object.fromEntries(SIGNAL_PLATFORMS.filter((key) => p.draftRevisions?.[key] !== void 0).map((key) => [key, p.draftRevisions[key]])),
		history: (p.history ?? []).map((row) => ({
			revision: row.revision,
			at: row.at,
			platform: row.platform,
			text: row.text,
			...row.shared !== void 0 ? { shared: row.shared } : {}
		}))
	};
}
function composeOnX(text) {
	return `https://x.com/intent/post?${new URLSearchParams({ text })}`;
}
function exportSignalPack(pack) {
	return `STREAM SIGNAL — ${pack.profile.creator}\n${pack.profile.title}\nGame: ${pack.profile.game}\nCreated: ${new Date(pack.createdAt).toISOString()}\n\n${SIGNAL_PLATFORMS.map((key) => `${SIGNAL_SITES[key].name.toUpperCase()}\nSite: ${SIGNAL_SITES[key].url}\nChecklist: ${pack.shared[key] ? "manually marked shared" : "not marked shared"}\n\n${pack.drafts[key]}`).join("\n\n--------------------\n\n")}\n\nSTREAM LINKS\nTwitch: ${pack.profile.twitch}\nYouTube: ${pack.profile.youtube}\n\nChecklist marks are manual notes, not platform publication receipts.\n`;
}
//#endregion
export { composeOnX as a, normalizeSignalProfile as c, validateSignalProfile as d, SIGNAL_SITES as i, readSignalPack as l, SIGNAL_LIMITS as n, exportSignalPack as o, SIGNAL_PLATFORMS as r, generateSignalPack as s, DEFAULT_SIGNAL_PROFILE as t, signalOwnerPrefix as u };
