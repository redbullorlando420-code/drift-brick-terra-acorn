//#region node_modules/.nitro/vite/services/ssr/assets/youtube-contract-DMSANo43.js
/**
* One place for the library's deliberately bounded provider and metadata work.
* Raise these only with an accompanying browser benchmark: larger pulls affect
* provider load, browser storage, and first-render work.
*/
var LIBRARY_LIMITS = {
	remoteMetadataTagsPerTitle: 32,
	descriptionKeywordTagsPerTitle: 24,
	/** One explicit metadata-tail pass; it must stay below a first-screen render window. */
	metadataTailBatchSize: 48,
	/** Exact-ID creator repair uses the same small explicit work window. */
	creatorCoverageRepairBatchSize: 48,
	remoteRefreshChannelBatch: 24,
	twitchChannelsReservedPerRefresh: 12,
	twitchArchiveChannelsPerSweep: 100,
	twitchArchiveSourcesPerRequest: 4,
	youtubeFocusedVideosPerChannel: 1e5,
	youtubeArchivePagesPerPull: 3500,
	youtubeRoutineVideosPerChannel: 2e3,
	/** Bound view-count sorting to recent archive candidates; the full grid remains available. */
	youtubeTrendingCandidateWindow: 12e3,
	/** Archive sweeps are paced separately from fast recent-upload checks. */
	youtubeCatalogSweepIntervalMs: 36e5,
	youtubeCatalogRecheckExhaustedMs: 6048e5,
	youtubeScheduledRefreshChannels: 4,
	/** Automatic history growth is intentionally much smaller than a user pull. */
	youtubeScheduledVideosPerChannel: 100,
	youtubeRecentRefreshIntervalMs: 3e5,
	youtubeRecentRefreshChannels: 4,
	/** Independently poll a fair rotating batch for current YouTube broadcasts. */
	youtubeLiveRefreshIntervalMs: 6e4,
	youtubeLiveRefreshChannels: 12,
	youtubeLiveStateFreshnessMs: 6e5,
	youtubeManualRefreshChannels: 1e4,
	/** Each HTTP response and merge stays small even when a sweep visits every source. */
	youtubeCatalogSourcesPerRequest: 1,
	/** Resumable page batches: deeper per click without attempting the full archive at once. */
	youtubeManualRefreshVideosPerChannel: 100,
	youtubeBulkImportVideosPerChannel: 100,
	youtubePlaylistVideosPerPull: 3e3,
	youtubePlaylistPagesPerPull: 64,
	/** Top-level Innertube comment threads per on-demand video detail pull. */
	youtubeCommentsPerPull: 160,
	youtubeCommentPagesPerPull: 8,
	/** Live chat / chat-replay messages per on-demand YouTube detail pull. */
	youtubeChatPerPull: 60,
	/** Bounded replay pages for YouTube live_chat/get_live_chat_replay. */
	youtubeChatMaxPages: 3,
	twitchArchivePageSize: 100,
	twitchArchiveMaxPages: 25,
	twitchFocusedVodsPerChannel: 2e3,
	twitchRoutineVodsPerChannel: 100,
	/** Numbered clip pulls (public `user.clips`, multi-period + cursor pages). */
	twitchRoutineClipsPerChannel: 24,
	twitchFocusedClipsPerChannel: 500,
	twitchClipMaxPages: 8,
	twitchClipPullChoices: [
		50,
		100,
		250,
		500
	],
	/** First window of public VOD chat replay (GQL VideoCommentsByOffsetOrCursor). */
	twitchCommentsPerPull: 80,
	/** Home only calls a Twitch channel live when the provider observation is recent. */
	twitchLiveStateFreshnessMs: 12e4,
	epornerPageSize: 1e3,
	epornerPagesPerPull: 6,
	epornerVideosPerPull: 6e3,
	epornerKeywordTagsPerTitle: 24,
	redtubePageSize: 20,
	redtubePagesPerPull: 300,
	redtubeVideosPerPull: 6e3,
	redtubeStarsPerPage: 40,
	redtubeStarVideosPerPull: 120,
	adultKeywordTagsPerTitle: 48,
	adultFastStartVideosPerPull: 720,
	/** A foreground click must return a usable mixed shelf quickly. Deep archive work belongs to Load more. */
	adultInteractiveVideosPerPull: 480,
	adultFastStartRailSize: 32,
	/** Keep auto-pulling until the Adult catalog reaches this many cached titles. */
	adultTargetCatalogVideos: 6e3,
	/** In-memory history buffer (durable journal may retain more until pruned). */
	historyMemoryEntries: 2e3,
	/** Soft cap for decoded local frame thumbs retained in the Zustand cache. */
	memoryThumbEntries: 280,
	/** Soft cap for IndexedDB thumb-cache rows (data URLs + Adult URL recalls). */
	thumbCacheEntries: 420,
	/** Bounded automatic archive pages per visit; users can still continue manually. */
	adultAutoArchivePagesPerVisit: 2,
	adultAutoArchiveDelayMs: 3e4,
	/** Titles added per staggered background refresh tick (one provider at a time). */
	adultRefreshVideosPerTick: 320,
	/** Pause between Adult provider refresh ticks. */
	adultRefreshIntervalMs: 75e3,
	chaturbateRoomsPerPull: 180,
	myfreecamsRoomsPerPull: 180,
	redditVideosPerPull: 2400,
	redditPostsPerSub: 50,
	/** How many subs to sample per Reddit window (rotate through the curated catalog). */
	redditSubsPerPull: 10,
	/** Extra Reddit windows walked in one pull so discovery is not RedTube-heavy. */
	redditWindowsPerPull: 2,
	/** Concurrent RSS fetches per wave (stay under Reddit rate limits). */
	redditFetchConcurrency: 3,
	booruVideosPerPull: 400,
	booruPageSize: 80,
	redgifsVideosPerPull: 240,
	redgifsPageSize: 80
};
/** Small metadata contracts. Errors contain a surface/reason, never raw provider payloads. */
var YoutubeContractError = class extends Error {
	surface;
	reason;
	constructor(surface, reason) {
		super("YouTube " + surface + " response is malformed or unsupported (" + reason + "); the previous observation and saved position were kept.");
		this.name = "YoutubeContractError";
		this.surface = surface;
		this.reason = reason;
	}
};
var object = (v) => !!v && typeof v === "object" && !Array.isArray(v);
function validateYoutubeFeed(xml, channelId) {
	if (!/<feed\b[^>]*>[\s\S]*<\/feed\s*>/i.test(xml)) throw new YoutubeContractError("feed", "missing-feed-root");
	const opens = xml.match(/<entry\b[^>]*>/gi) ?? [], entries = [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry\s*>/gi)];
	if (opens.length !== entries.length) throw new YoutubeContractError("feed", "incomplete-entry");
	for (const [, entry] of entries) if (!/<yt:videoId>\s*[A-Za-z0-9_-]{11}\s*<\/yt:videoId>/i.test(entry)) throw new YoutubeContractError("feed", "missing-video-identity");
	const owners = [...xml.matchAll(/<yt:channelId>\s*([^<]+)\s*<\/yt:channelId>/gi)].map((m) => m[1].trim());
	if (channelId && owners.some((owner) => owner !== channelId && owner !== channelId.replace(/^UC/, ""))) throw new YoutubeContractError("feed", "creator-mismatch");
	return { count: entries.length };
}
/** Distinguish a recognized empty container from unknown renderers or broken identities. */
function validateYoutubeItems(items, surface = "catalog") {
	if (items.length > 1) {
		for (const item of items) validateYoutubeItems([item], surface);
		return;
	}
	const stack = [items];
	let recognized = items.length === 0;
	while (stack.length) {
		const current = stack.pop();
		if (Array.isArray(current)) {
			for (const v of current) stack.push(v);
			continue;
		}
		if (!object(current)) continue;
		for (const key of [
			"videoRenderer",
			"gridVideoRenderer",
			"playlistVideoRenderer",
			"reelItemRenderer"
		]) if (current[key] !== void 0) {
			recognized = true;
			if (!object(current[key]) || !/^[A-Za-z0-9_-]{11}$/.test(current[key].videoId ?? "")) throw new YoutubeContractError(surface, "missing-video-identity");
		}
		if (current.lockupViewModel) {
			const lockup = current.lockupViewModel;
			if (lockup.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" || lockup.contentType === void 0) {
				recognized = true;
				if (!/^[A-Za-z0-9_-]{11}$/.test(lockup.contentId ?? "")) throw new YoutubeContractError(surface, "missing-lockup-identity");
			}
		}
		if (current.shortsLockupViewModel) {
			recognized = true;
			if (!/^[A-Za-z0-9_-]{11}$/.test(current.shortsLockupViewModel.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId ?? "")) throw new YoutubeContractError(surface, "missing-short-identity");
		}
		if (current.continuationItemRenderer !== void 0 || current.nextContinuationData !== void 0 || current.reloadContinuationData !== void 0 || current.continuationCommand !== void 0) {
			recognized = true;
			const token = current.continuationCommand?.token ?? current.continuationCommand?.innertubeCommand?.continuationCommand?.token ?? current.nextContinuationData?.continuation ?? current.reloadContinuationData?.continuation ?? current.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
			if (typeof token !== "string" || !token.trim() || token.length > 16384) throw new YoutubeContractError(surface, "unreadable-continuation");
		}
		for (const [key, field] of [
			["richGridRenderer", "contents"],
			["gridRenderer", "items"],
			["itemSectionRenderer", "contents"],
			["sectionListRenderer", "contents"]
		]) if (object(current[key]) && Array.isArray(current[key][field]) && current[key][field].length === 0) recognized = true;
		if (current.messageRenderer !== void 0) {
			recognized = true;
			const value = current.messageRenderer?.text;
			const text = typeof value === "string" ? value : value?.simpleText ?? value?.runs?.map((r) => r.text ?? "").join("") ?? "";
			if (!object(current.messageRenderer) || typeof text !== "string" || !/no (?:videos|streams|content|results)|does(?:n.t| not) have any (?:content|videos)|playlist is empty|has no (?:videos|streams|content)/i.test(text)) throw new YoutubeContractError(surface, "unrecognized-empty-message");
		}
		for (const value of Object.values(current)) if (value && typeof value === "object") stack.push(value);
	}
	if (!recognized) throw new YoutubeContractError(surface, "unknown-renderer-shape");
}
function validateYoutubeLiveContent(content) {
	if (!object(content)) throw new YoutubeContractError("live", "missing-selected-content");
	const stack = [content];
	let boundary = false;
	while (stack.length) {
		const node = stack.pop();
		if (!object(node)) continue;
		for (const [key, field] of [
			["richGridRenderer", "contents"],
			["gridRenderer", "items"],
			["itemSectionRenderer", "contents"],
			["sectionListRenderer", "contents"],
			["playlistVideoListRenderer", "contents"]
		]) if (node[key] !== void 0) {
			if (!object(node[key]) || !Array.isArray(node[key][field])) throw new YoutubeContractError("live", "incomplete-" + key);
			boundary = true;
			validateYoutubeItems(node[key][field], "live");
		}
		if (node.messageRenderer || node.videoRenderer || node.gridVideoRenderer || node.lockupViewModel) {
			boundary = true;
			validateYoutubeItems([node], "live");
		}
		for (const value of Object.values(node)) if (Array.isArray(value)) stack.push(...value);
		else if (object(value)) stack.push(value);
	}
	if (!boundary) throw new YoutubeContractError("live", "unknown-content-boundary");
}
//#endregion
export { validateYoutubeLiveContent as i, validateYoutubeFeed as n, validateYoutubeItems as r, LIBRARY_LIMITS as t };
