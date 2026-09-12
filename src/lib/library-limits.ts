/**
 * One place for the library's deliberately bounded provider and metadata work.
 * Raise these only with an accompanying browser benchmark: larger pulls affect
 * provider load, browser storage, and first-render work.
 */
export const LIBRARY_LIMITS = {
  // Keeps up to 300 real description words plus provider/category signals.
  remoteMetadataTagsPerTitle: 320,
  descriptionKeywordTagsPerTitle: 300,
  remoteRefreshChannelBatch: 96,
  twitchChannelsReservedPerRefresh: 32,
  youtubeFocusedVideosPerChannel: 2_880,
  // Public browse continuations are the route beyond the first channel shelf.
  // A page is usually 30–100 items, so 48 pages has room to reach a creator's
  // older public catalog without leaving an unbounded request running.
  youtubeArchivePagesPerPull: 48,
  youtubeRoutineVideosPerChannel: 192,
  youtubeBulkImportVideosPerChannel: 192,
  twitchArchivePageSize: 160,
  twitchFocusedVodsPerChannel: 8_000,
  twitchRoutineVodsPerChannel: 640,
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
  // Fast-start Adult pull is larger than the old 240 cap; background ticks keep topping up.
  adultFastStartVideosPerPull: 1_600,
  adultFastStartRailSize: 48,
  /** Keep auto-pulling until the Adult catalog reaches this many cached titles. */
  adultTargetCatalogVideos: 5_000,
  /** Titles added per staggered background refresh tick (one provider at a time). */
  adultRefreshVideosPerTick: 320,
  /** Pause between Adult provider refresh ticks. */
  adultRefreshIntervalMs: 75_000,
  chaturbateRoomsPerPull: 180,
  camsodaRoomsPerPull: 180,
  myfreecamsRoomsPerPull: 180,
  redditVideosPerPull: 1_200,
  redditPostsPerSub: 25,
  /** How many subs to sample per Reddit window (rotate through the curated catalog). */
  redditSubsPerPull: 40,
  /** Extra Reddit windows walked in one pull so discovery is not RedTube-heavy. */
  redditWindowsPerPull: 3,
  /** Concurrent RSS fetches per wave (stay under Reddit rate limits). */
  redditFetchConcurrency: 8,
  booruVideosPerPull: 120,
  booruPageSize: 40,
  redgifsVideosPerPull: 80,
  redgifsPageSize: 40,
} as const;
