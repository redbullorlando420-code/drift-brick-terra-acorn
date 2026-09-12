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
  epornerPagesPerPull: 3,
  epornerVideosPerPull: 3_000,
  epornerKeywordTagsPerTitle: 24,
  // RedTube webmaster API returns 20 videos per page; paginate like archive pulls.
  redtubePageSize: 20,
  redtubePagesPerPull: 150,
  redtubeVideosPerPull: 3_000,
  adultKeywordTagsPerTitle: 48,
  chaturbateRoomsPerPull: 180,
} as const;
