/**
 * One place for the library's deliberately bounded provider and metadata work.
 * Raise these only with an accompanying browser benchmark: larger pulls affect
 * provider load, browser storage, and first-render work.
 */
export const LIBRARY_LIMITS = {
  // Remote archive tags are repeated for every card. Keep enough for useful
  // discovery without retaining a second text index in the app state.
  remoteMetadataTagsPerTitle: 32,
  descriptionKeywordTagsPerTitle: 24,
  // A smaller rotating group prevents one background tick from allocating a
  // whole library's worth of cards. Each selected creator gets a deeper window.
  remoteRefreshChannelBatch: 24,
  twitchChannelsReservedPerRefresh: 8,
  // Keep pace with the Adult catalog without making the first channel paint
  // wait on every archive continuation. Focused pulls retain a deep history;
  // routine and bulk refreshes fill it in wider batches below.
  // A focused creator pull intentionally targets the full long-tail archive.
  // This is catalog metadata only, never media-byte downloading; routine and
  // bulk imports remain bounded below so the normal desk stays responsive.
  youtubeFocusedVideosPerChannel: 100_000,
  // Public browse continuations are the route beyond the first channel shelf.
  // A page is usually 30–100 items. 3,500 pages gives a focused pull enough
  // continuation budget to reach the 100k item ceiling while still stopping
  // as soon as the requested item count or provider continuation ends.
  youtubeArchivePagesPerPull: 3_500,
  youtubeRoutineVideosPerChannel: 2_000,
  youtubeBulkImportVideosPerChannel: 1_200,
  /** Top-level Innertube comment threads per on-demand video detail pull. */
  youtubeCommentsPerPull: 40,
  /** Live chat / chat-replay messages per on-demand YouTube detail pull. */
  youtubeChatPerPull: 60,
  /** Bounded replay pages for YouTube live_chat/get_live_chat_replay. */
  youtubeChatMaxPages: 3,
  // Helix/GQL `videos(first:)` accepts 1..100 only. Asking for 160 used to
  // return the channel shell with an empty videos connection (GraphQL error on
  // the field), which made follow/import look like it pulled no VODs.
  twitchArchivePageSize: 100,
  // Focused archive depth via cursor pages (Android/TV Client-ID bypasses the
  // web integrity gate that blocks page-2 on the web Client-ID). Routine stays
  // shallow. Also merge HIGHLIGHT + UPLOAD shelves.
  twitchArchiveMaxPages: 25,
  twitchFocusedVodsPerChannel: 2_000,
  twitchRoutineVodsPerChannel: 100,
  /** Numbered clip pulls (public `user.clips`, multi-period + cursor pages). */
  twitchRoutineClipsPerChannel: 100,
  twitchFocusedClipsPerChannel: 500,
  twitchClipMaxPages: 8,
  twitchClipPullChoices: [50, 100, 250, 500],
  /** First window of public VOD chat replay (GQL VideoCommentsByOffsetOrCursor). */
  twitchCommentsPerPull: 80,
  /** Home only calls a Twitch channel live when the provider observation is recent. */
  twitchLiveStateFreshnessMs: 2 * 60_000,
  // Eporner API allows up to 1000 results per page; batch pages like YT/Twitch archives.
  epornerPageSize: 1000,
  epornerPagesPerPull: 6,
  epornerVideosPerPull: 6_000,
  epornerKeywordTagsPerTitle: 24,
  // RedTube webmaster API returns 20 videos per page; paginate like archive pulls.
  redtubePageSize: 20,
  redtubePagesPerPull: 300,
  redtubeVideosPerPull: 6_000,
  redtubeStarsPerPage: 40,
  redtubeStarVideosPerPull: 120,
  adultKeywordTagsPerTitle: 48,
  // Fast-start Adult pull stays below the old 1.6k wall so the first Adults
  // paint is not blocked on a full multi-provider archive. Background ticks
  // and Load more still top the catalog up to adultTargetCatalogVideos.
  adultFastStartVideosPerPull: 720,
  /** A foreground click must return a usable mixed shelf quickly. Deep archive work belongs to Load more. */
  adultInteractiveVideosPerPull: 480,
  adultFastStartRailSize: 32,
  /** Keep auto-pulling until the Adult catalog reaches this many cached titles. */
  adultTargetCatalogVideos: 6_000,
  /** In-memory history buffer (durable journal may retain more until pruned). */
  historyMemoryEntries: 2_000,
  /** Soft cap for decoded local frame thumbs retained in the Zustand cache. */
  memoryThumbEntries: 280,
  /** Soft cap for IndexedDB thumb-cache rows (data URLs + Adult URL recalls). */
  thumbCacheEntries: 420,
  /** Bounded automatic archive pages per visit; users can still continue manually. */
  adultAutoArchivePagesPerVisit: 2,
  adultAutoArchiveDelayMs: 30_000,
  /** Titles added per staggered background refresh tick (one provider at a time). */
  adultRefreshVideosPerTick: 320,
  /** Pause between Adult provider refresh ticks. */
  adultRefreshIntervalMs: 75_000,
  chaturbateRoomsPerPull: 180,
  myfreecamsRoomsPerPull: 180,
  redditVideosPerPull: 2_400,
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
  redgifsPageSize: 80,
} as const;
