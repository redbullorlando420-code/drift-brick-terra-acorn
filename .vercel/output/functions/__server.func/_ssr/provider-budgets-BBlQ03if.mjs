//#region node_modules/.nitro/vite/services/ssr/assets/provider-budgets-BBlQ03if.js
/** Metadata safeguards; media playback/downloads never use these readers.
* Limits apply to each complete upstream page, not the accumulated archive. */
var PROVIDER_BUDGETS = {
	responseBytes: 8388608,
	errorPrefixBytes: 65536,
	bodyTimeoutMs: 15e3,
	queuedRequests: 80,
	youtubeTransfers: 1,
	twitchTransfers: 6,
	adultTransfers: 6,
	refreshWorkers: 3,
	liveWorkers: 2,
	archiveWorkers: 1,
	importWorkers: 6,
	importAttempts: 2,
	warmCacheRows: 250,
	warmCacheEntryBytes: 1048576,
	youtubeCacheBytes: 4194304,
	twitchCacheBytes: 4194304,
	adultCacheBytes: 12582912
};
var ProviderBudgetError = class extends Error {
	budget;
	constructor(budget, message) {
		super(message);
		this.budget = budget;
		this.name = "ProviderBudgetError";
	}
};
//#endregion
export { ProviderBudgetError as n, PROVIDER_BUDGETS as t };
