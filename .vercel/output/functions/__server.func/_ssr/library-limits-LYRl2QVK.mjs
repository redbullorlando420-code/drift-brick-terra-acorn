//#region node_modules/.nitro/vite/services/ssr/assets/library-limits-LYRl2QVK.js
/**
* One place for the library's deliberately bounded provider and metadata work.
* Raise these only with an accompanying browser benchmark: larger pulls affect
* provider load, browser storage, and first-render work.
*/
var LIBRARY_LIMITS = {
	remoteMetadataTagsPerTitle: 320,
	descriptionKeywordTagsPerTitle: 300,
	remoteRefreshChannelBatch: 96,
	twitchChannelsReservedPerRefresh: 32,
	youtubeFocusedVideosPerChannel: 2880,
	youtubeArchivePagesPerPull: 48,
	youtubeRoutineVideosPerChannel: 192,
	youtubeBulkImportVideosPerChannel: 192,
	twitchArchivePageSize: 160,
	twitchFocusedVodsPerChannel: 8e3,
	twitchRoutineVodsPerChannel: 640
};
//#endregion
export { LIBRARY_LIMITS as t };
