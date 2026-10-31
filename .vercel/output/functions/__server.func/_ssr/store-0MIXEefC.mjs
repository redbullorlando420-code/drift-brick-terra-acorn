import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as extensionOf } from "./utils-Cq6DDHIb.mjs";
import { _ as youtubePublicationTime, c as pullDispatchTrace, d as retainYoutubeMetadata, f as withYoutubePublication, h as youtubePublicationIdentityOrder, i as compareYoutubePublication, o as exactYoutubePublished } from "./provider-json-CjRAnOrq.mjs";
import { t as LIBRARY_LIMITS } from "./youtube-contract-DMSANo43.mjs";
import { $ as confirmedYoutubeChannelId, $t as patchSparseRecord, A as adultIngestTags, An as twitchPullPolicy, Ct as importedFollowStub, Dt as isAdultPullKind$1, Hn as youtubeLiveCooldown, Ht as mergeResolvedFollow, In as yieldCatalogTask, Mn as twitchRetryPatch, Mt as isRemovedRedditVideo, Nt as isUsableAdultThumb, Rn as youtubeEventNotices, S as RETIRED_ADULT_SOURCE_IDS, Sn as sparseRecordBuilder, Wn as youtubeLiveFailure, X as classifyTwitchFailure, Y as canonicalFollowHandle, _n as selectDueLiveRefreshChannels, a as ADULT_FOLDER_BY_PROVIDER, at as dedupeFollows, bn as selectYoutubeQuickLiveChannels, bt as forEachCatalogSlice, dn as repairYoutubeImport, et as copyCatalogArray, fn as resolvedFollowQueries, gn as reviewYoutubeImport, hn as retainTwitchPullPolicy, in as reconcilePlaylistWalks, k as adultFolderIds, kn as twitchPolicyAllows, l as ADULT_PULL_PROVIDERS, ln as removeSparseRecordKeys, nn as recentPullReady, o as ADULT_FOLDER_IDS, on as redditIngestExtras, pn as retainAdultRefreshEvidence, q as bindYoutubeCorrection, qt as normalizeTwitchPullPolicy, rn as recentPullSuccess, rt as decodeTwitchArchiveCursor, tn as recentPullFailure, tt as copyCatalogRecord, vn as selectLiveRefreshChannels, w as YOUTUBE_QUICK_LIVE, wn as sparseRecordScan, xn as sortCatalogRows, yt as forEachCatalogEntry } from "./live-rooms-DInVyvi_.mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { n as createShortLocalId } from "./local-id-CsDq4efR.mjs";
import { r as CoalescedWriter } from "./companion-DacueTBp.mjs";
import { $ as catalogIdentityKeys, $i as saveSourceHealth, $r as replacementRequestBudget, $t as holdEntryLimitCursors, Aa as videoIsPrivate, B as automaticYoutubeTags, Bi as saveDurableShelves, Br as recoverCatalogMutations, D as activityLookupAsync, E as activityLookup, Ei as rotationAvailable, En as loadSourceHealth, F as appendCatalogVideos, Fa as withCatalogRead, Fi as saveDurableHistory, Fn as mergeRemoteCatalogAsync, Ft as entryGroup, Gn as newestRejections, Gr as remainingEntrySlots, Gt as getTopicAliasRevision, Ha as youtubeTagTitleHash, Hr as refreshYoutubeTags, I as applyExposureEvents, Ii as saveDurableLinks, In as mergeRemoteRefreshAsync, It as exposureKey, Jr as remoteEntryCounts, Kn as newestTopicAliases, Kr as rememberEntryCounts, Kt as getTopicAliases, La as youtubeCleanupProtected, Li as saveDurableMarks, Lr as reconcileProviderTopicTags, Ma as waitForFollowsWrites, Mi as saveCreatorCoverageRows, Mn as lookupVideo, Mt as deleteDirHandle, N as animeTitleInfo, Na as waitForPrefsWrites, Ni as saveDirHandle, Nr as readWorkspaceDocument, O as admitRemoteEntries, On as loadTopicAliasesSync, P as appendActivityJournal, Pa as withCatalogDetails, Pi as saveDurableFeedback, Pt as emptyYoutubeCleanup, Q as catalogCard, Qi as saveSavedShelfEdit, Qr as removeRemoteSnapshotVideos, Ra as youtubeCoverageCounts, Ri as saveDurablePhotos, Rr as recordYoutubeCleanup, Sn as loadPrefs, T as activityCandidatesAsync, Tn as loadRemoteSnapshot, Tt as consumeCleanupBudget, Ua as youtubeTextTags, Ui as saveFolderVideos, Va as youtubeTagEvidence, Vi as saveEnrichmentRows, Vn as newestExposure, Vr as recoverResumeRecords, Wa as youtubeVideoKey, Wi as saveFollows, X as canRotateForGroup, Xi as saveRecoveryLinks, Xn as normalizeExposure, Y as cacheMetrics, Yi as saveRecommendationExposure, Yr as remoteVideoIndexAsync, Z as canonicalTopic, Zi as saveRemoteSnapshot, Zr as removeEnrichmentRows, _i as restoreRecommendationExposure, _n as loadDirHandles, aa as saveYoutubeCleanup, ai as restoreDurableLinks, at as changeTopicAlias, bn as loadFollows, br as prepareRefreshSavedIds, bt as compactYoutubeTagEvidence, c as EMPTY_EXPOSURE, ca as selectSavedCardsAsync, ci as restoreDurablePrefs, ct as cleanupBudgets, di as restoreEnrichmentRows, dn as loadActivityJournal, dt as cleanupPolicy, ea as saveThumbCache, fn as loadActivitySnapshot, ft as cleanupSourceKeys, gn as loadCatalogVideos, hn as loadCatalogVideo, hr as planYoutubeCleanup, ht as clearFolderVideos, ia as saveWorkspaceDocuments, ii as restoreDurableHistory, it as changeRejection, ja as waitForDurableWrites, ji as saveCatalogMetadataEdit, jn as lookupCatalogIdentity, k as adultAdmissionPolicy, ki as saveActivitySnapshot, li as restoreDurableResume, lt as cleanupKey, mi as restoreMetadataEdits, mt as clearExposure, n as CLEANUP_GROUPS, ni as restoreDurableFeedback, nr as normalizeRejections, oi as restoreDurableMarks, on as isRejectionLedger, p as EMPTY_REJECTIONS, pt as clearActivityJournal, qi as savePrefs, qr as rememberVideo, ra as saveViewPrefs, ri as restoreDurableFollows, rn as isExposureLedger, rr as normalizeTopicAliases, sa as selectSavedCards, si as restoreDurablePhotos, sn as isTopicAliasLedger, st as cleanupBudgetAvailable, ta as saveTopicAliases, ti as restoreCatalogMetadata, tn as installTopicAliases, ui as restoreDurableShelves, ur as patchActivityRecord, ut as cleanupLabel, vi as restoreTagEdits, vr as prepareEnrichmentBatch, w as activityCandidates, wa as topicsForVideo, wn as loadRecommendationExposureSync, wr as pruneActivityJournal, xi as retiredYoutubeKeys, yi as restoreTopicAliases, yr as prepareIndexedRemoteCatalog, za as youtubeCoverageIndexAsync, zi as saveDurableResume, zr as recoverActivityCounts } from "./persist-D_pR3DU-.mjs";
import { o as youtubeDownloadTarget } from "./youtube-download-CKPVbpaB.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as useSourceAssets } from "./source-assets-4lR6sQzr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-0MIXEefC.js
var store_0MIXEefC_exports = /* @__PURE__ */ __exportAll({
	$: () => getFirstShelfTrace,
	$n: () => getInteractionBudgetSnapshot,
	$t: () => recommendationTopicIsLiked,
	A: () => nextRemoteRefresh,
	An: () => pullsPaused,
	At: () => retryRecommendationExposure,
	B: () => isLikelyPlayable,
	Bn: () => getImageLoadBudgetSnapshot,
	Bt: () => creatorIsLiked,
	C: () => getYoutubeTraceRevision,
	Cn: () => youtubeCreatorProfiles,
	Ct: () => getExposureRevision,
	D: () => markYoutubeSelectorReady,
	Dn: () => catalogPullAvailable,
	Dt: () => recordRecommendationExposure,
	E: () => markYoutubeRailReady,
	En: () => cancelQueuedPulls,
	Et: () => importRecommendationExposure,
	F: () => trimObjectUrls,
	Fn: () => subscribePullControl,
	Ft: () => topicAliasSaveStatus,
	G: () => YOUTUBE_LIVE_HOLD_MS,
	Gn: () => getPerformanceProfile,
	Gt: () => getFeedbackSaveState,
	H: () => holdMetadataEnrichment,
	Hn: () => subscribeArtworkSuppression,
	Ht: () => getCreatorRating,
	I: () => NATIVE_PLAYABLE,
	In: () => subscribePullQueue,
	It: () => youtubeTagConfidenceReport,
	J: () => folderIsPrivate,
	Jn: () => subscribePerformanceProfile,
	Jt: () => getRating,
	K: () => selectTwitchRefreshBatch,
	Kn: () => getServerPerformanceProfile,
	Kt: () => getHeartedTagHistory,
	L: () => RECOMMENDED_FOLDERS,
	Ln: () => waitForCatalogCommit,
	Lt: () => adultArchiveDepthLabel,
	M: () => getSourceMemorySnapshot,
	Mn: () => setPullViewerOpen,
	Mt: () => importTopicAliases,
	N: () => pinPlayUrl,
	Nn: () => setPullsPaused,
	Nt: () => retryTopicAliasSave,
	O: () => subscribeYoutubeTrace,
	On: () => getPullCancellationRevision,
	Ot: () => refreshExposureRecommendations,
	P: () => resolvePlayUrl,
	Pn: () => subscribePullAvailability,
	Pt: () => reviewTopicAlias,
	Q: () => viewerDetails,
	Qn: () => subscribeDataSaver,
	Qt: () => rankingFeedbackSnapshot,
	R: () => hasFreshViewerCount,
	Rn: () => clearLowPriorityImageQueue,
	Rt: () => loadAdultArchiveCursors,
	S: () => getYoutubeFirstClickTrace,
	Sn: () => searchRedtubeStars,
	St: () => exposureDiagnostics,
	T: () => markYoutubePreparationReady,
	Tn: () => automaticPullAvailable,
	Tt: () => hydrateRecommendationExposure,
	U: () => idleEnrichment,
	Un: () => watchImageSlot,
	Ut: () => getFeedbackDiagnostics,
	V: () => titleOf,
	Vn: () => isArtworkSuppressed,
	Vt: () => exportFeedback,
	W: () => youtubeCooldownMessage,
	Wn: () => getPerformanceMode,
	Wt: () => getFeedbackRevision,
	X: () => movieEvidence,
	Xn: () => getDataSaverMode,
	Xt: () => getWatchTime,
	Y: () => animeEvidence,
	Yn: () => dataSaverActive,
	Yt: () => getRecommendationRejections,
	Z: () => movieIdentityEvidence,
	Zn: () => setDataSaverMode,
	Zt: () => importFeedback,
	_: () => selectYoutube,
	_n: () => fetchLiveRooms,
	_t: () => importReviewWindow,
	a: () => prepareRecoveryBrowse,
	an: () => setRecommendationRejection,
	ar: () => subscribePullSettings,
	at: () => planFollowRemoval,
	b: () => useLibrary,
	bn: () => inspectRedditImage,
	bt: () => selectTwitchQuickLiveChannels,
	c: () => resumeForVideo,
	cn: () => tagIsLiked,
	cr: () => adultRedditPullSources,
	ct: () => searchResultSource,
	d: () => selectContinue,
	dn: () => toggleTagLike,
	dt: () => saveImportSession,
	en: () => recordWatchTime,
	er: () => getInteractionPriorityDelay,
	et: () => getStartupTraceRevision,
	f: () => selectFavorites,
	fn: () => watchTimeScore,
	ft: () => stageImportSession,
	g: () => selectVisible,
	gn: () => fetchAdultComments,
	gt: () => importReviewRow,
	h: () => selectTwitch,
	hn: () => setRatingWeeklyGoal,
	ht: () => emptyImportReview,
	i: () => preparePrivateSelection,
	in: () => setRating,
	ir: () => getPullSettings,
	it: () => subscribeStartupTrace,
	j: () => selectYoutubeSweepChannels,
	jn: () => setActivePullPage,
	jt: () => hydrateTopicAliases,
	k: () => prepareCreatorCoverageResolver,
	kn: () => getPullQueueSnapshot,
	kt: () => resetRecommendationExposure,
	l: () => selectAdultRemote,
	ln: () => toggleCreatorFavorite,
	lr: () => planAdultPull,
	lt: () => loadImportSession,
	m: () => selectLive,
	mn: () => getRatingStreakSnapshot,
	mt: () => cleanImportReview,
	n: () => prepareFavoritesSelection,
	nn: () => setCreatorRating,
	nr: () => scheduleBackgroundWork,
	nt: () => markFirstShelfArtwork,
	o: () => prepareYoutubeSelection,
	on: () => subscribeRating,
	or: () => updatePullSettings,
	ot: () => HUB_SOURCES,
	p: () => selectHistory,
	pn: () => RATING_GOALS,
	pt: () => importSessionEntries,
	q: () => youtubeIdentityReviews,
	qn: () => setPerformanceMode,
	qt: () => getNote,
	r: () => prepareHistorySelection,
	rn: () => setNote,
	rr: () => DEFAULT_PULL_SETTINGS,
	rt: () => markHomeReady,
	s: () => rebaseSharedCatalog,
	sn: () => tagHasHeartHistory,
	sr: () => REDDIT_SOURCE_STORAGE_KEY,
	st: () => navigationSourceLabel,
	t: () => prepareContinueSelection,
	tn: () => retryFeedbackSave,
	tr: () => measureInteraction,
	tt: () => markFirstShelf,
	u: () => selectClassics,
	un: () => toggleCreatorLike,
	ur: () => readRedditSourceSettings,
	ut: () => readLocalImportSession,
	v: () => store_exports,
	vn: () => fetchTwitchChapters,
	vt: () => reviewedImportBatch,
	w: () => markYoutubeArtworkReady,
	wn: () => createSsrRpc,
	wt: () => getRecommendationExposure,
	x: () => userFolderCount,
	xn: () => resolveBooruOriginal,
	xt: () => youtubeLiveEstimate,
	y: () => trimCatalogSelectorCaches,
	yn: () => fetchTwitchFollowing,
	yt: () => TWITCH_QUICK_LIVE,
	z: () => isClassicVideo,
	zn: () => ensureImageBudgetVisibilityHook,
	zt: () => creatorIsFavorited
});
/** Fair rotation includes empty providers without allowing one unavailable
* source to monopolize automatic discovery. Cooldowns preserve resume points. */
function planAdultPull(cursors, now, limit = 2) {
	return ADULT_PULL_PROVIDERS.filter((provider) => (cursors[provider]?.retryAt ?? 0) <= now).sort((a, b) => (cursors[a]?.updatedAt ?? 0) - (cursors[b]?.updatedAt ?? 0) || ADULT_PULL_PROVIDERS.indexOf(a) - ADULT_PULL_PROVIDERS.indexOf(b)).slice(0, Math.max(1, Math.min(ADULT_PULL_PROVIDERS.length, limit)));
}
/** Split a user pull fairly, then pass unused capacity from empty, duplicate,
* or failed providers to the next source in the same pull. */
function adultProviderPullBudget(total, providerCount, index, carry = 0) {
	const target = Math.max(0, Math.floor(total));
	const count = Math.max(1, Math.floor(providerCount));
	const position = Math.max(0, Math.min(count - 1, Math.floor(index)));
	const base = Math.floor(target / count) + (position < target % count ? 1 : 0);
	return Math.min(target, base + Math.max(0, Math.floor(carry)));
}
var REDDIT_SOURCE_STORAGE_KEY = "reelcase.adult-reddit-sources.v1";
function readRedditSourceSettings() {
	try {
		const raw = JSON.parse(localStorage.getItem("reelcase.adult-reddit-sources.v1") ?? "[]");
		if (!Array.isArray(raw)) return [];
		const seen = /* @__PURE__ */ new Set();
		return raw.slice(0, 120).flatMap((item) => {
			const row = item && typeof item === "object" ? item : {};
			const subreddit = String(row.subreddit ?? "").trim().replace(/^r\//i, "");
			if (!/^[a-z0-9_]{3,48}$/i.test(subreddit) || seen.has(subreddit.toLowerCase())) return [];
			seen.add(subreddit.toLowerCase());
			const priority = Number(row.priority);
			return [{
				subreddit,
				priority: priority >= 3 ? 3 : priority <= 1 ? 1 : 2,
				hidden: Boolean(row.hidden),
				favorite: Boolean(row.favorite)
			}];
		});
	} catch {
		return [];
	}
}
function adultRedditPullSources(defaults) {
	if (typeof localStorage === "undefined") return void 0;
	try {
		if (localStorage.getItem(`reelcase.adult-reddit-sources.v1.enabled`) === "false") return void 0;
	} catch {
		return;
	}
	const sources = new Map(defaults.map((subreddit) => [subreddit.toLowerCase(), {
		subreddit,
		priority: 2
	}]));
	for (const source of readRedditSourceSettings()) sources.set(source.subreddit.toLowerCase(), source);
	return [...sources.values()].filter((source) => !source.hidden).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.priority - a.priority || a.subreddit.localeCompare(b.subreddit));
}
var DEFAULT_PULL_SETTINGS = Object.freeze({
	requestGapMs: 1500,
	youtubeRequestGapMs: 80,
	concurrentRequests: 1,
	youtubeBatchVideos: 100,
	youtubeSourcesPerSweep: 32,
	youtubeIntervalSeconds: 300,
	adultBatchVideos: 2e3,
	adultIntervalSeconds: 120,
	adultCatalogTarget: 1e5,
	automaticPulls: true,
	pauseWhileWatching: true,
	sharedCapCleanup: true,
	remoteMaxEntries: 2e5,
	youtubeMaxEntries: 1e5,
	twitchMaxEntries: 25e3,
	adultMaxEntries: 1e5,
	otherMaxEntries: 25e3,
	youtubeAutoCleanup: true,
	youtubeCleanupBatch: 100,
	youtubeCleanupMinAgeDays: 30,
	twitchAutoCleanup: true,
	twitchCleanupBatch: 100,
	twitchCleanupMinAgeDays: 30,
	adultAutoCleanup: true,
	adultCleanupBatch: 100,
	adultCleanupMinAgeDays: 30
});
var limits = {
	requestGapMs: [250, 6e4],
	youtubeRequestGapMs: [0, 6e4],
	concurrentRequests: [1, 3],
	youtubeBatchVideos: [30, 500],
	youtubeSourcesPerSweep: [1, 1024],
	youtubeIntervalSeconds: [60, 3600],
	adultBatchVideos: [20, 1e4],
	adultIntervalSeconds: [30, 3600],
	adultCatalogTarget: [1e3, 1e6],
	remoteMaxEntries: [0, 1e6],
	youtubeMaxEntries: [0, 1e6],
	twitchMaxEntries: [0, 1e6],
	adultMaxEntries: [0, 1e6],
	otherMaxEntries: [0, 1e6],
	youtubeCleanupBatch: [1, 1e3],
	youtubeCleanupMinAgeDays: [0, 3650],
	twitchCleanupBatch: [1, 1e3],
	twitchCleanupMinAgeDays: [0, 3650],
	adultCleanupBatch: [1, 1e3],
	adultCleanupMinAgeDays: [0, 3650]
};
function normalizePullSettings(raw) {
	const input = raw && typeof raw === "object" ? raw : {};
	const next = { ...DEFAULT_PULL_SETTINGS };
	for (const key of Object.keys(limits)) {
		const value = Number(input[key]);
		if (input[key] !== void 0 && Number.isFinite(value)) next[key] = Math.max(limits[key][0], Math.min(limits[key][1], Math.floor(value)));
	}
	for (const key of [
		"automaticPulls",
		"pauseWhileWatching",
		"sharedCapCleanup",
		"youtubeAutoCleanup",
		"twitchAutoCleanup",
		"adultAutoCleanup"
	]) if (typeof input[key] === "boolean") next[key] = input[key];
	return next;
}
var KEY$6 = "reelcase.pull-settings.v1";
var settings = DEFAULT_PULL_SETTINGS;
var hydrated$1 = false;
var listeners$3 = /* @__PURE__ */ new Set();
function getPullSettings() {
	if (!hydrated$1 && typeof window !== "undefined") {
		hydrated$1 = true;
		try {
			settings = Object.freeze(normalizePullSettings(JSON.parse(localStorage.getItem(KEY$6) ?? "null")));
		} catch {}
	}
	return settings;
}
var subscribePullSettings = (listener) => {
	listeners$3.add(listener);
	return () => {
		listeners$3.delete(listener);
	};
};
function updatePullSettings(patch) {
	settings = Object.freeze(normalizePullSettings({
		...getPullSettings(),
		...patch
	}));
	try {
		localStorage.setItem(KEY$6, JSON.stringify(settings));
	} catch {}
	for (const listener of listeners$3) listener();
}
if (typeof window !== "undefined") {
	const onStorage = (event) => {
		if (event.key !== KEY$6) return;
		try {
			settings = Object.freeze(normalizePullSettings(JSON.parse(event.newValue ?? "null")));
		} catch {
			settings = DEFAULT_PULL_SETTINGS;
		}
		hydrated$1 = true;
		for (const listener of listeners$3) listener();
	};
	window.addEventListener("storage", onStorage);
}
var PullPriorityDeferredError = class extends Error {
	constructor() {
		super("Automatic pull deferred to the active page.");
		this.name = "PullPriorityDeferredError";
	}
};
var cancelledError = () => /* @__PURE__ */ new Error("Pull cancelled; accepted catalog entries remain saved.");
/** A bounded queue sleeps on pause/visibility changes. Each active slot retains
* at most one response; cancellation aborts transport and releases that slot. */
function createPullScheduler(policy, available, maxWaiting = 8, options = {}) {
	const optionsFactoryTrace = (operation) => options.trace?.(operation);
	const queue = [], running = /* @__PURE__ */ new Set(), held = /* @__PURE__ */ new Set();
	const listeners = /* @__PURE__ */ new Set();
	let lastStarted = -Infinity, timer;
	let generation = 0, cancelled = 0;
	let snapshot = {
		active: 0,
		waiting: 0,
		held: false,
		cancelled: 0
	};
	const emit = () => {
		const waiting = held.size > 0 || queue.length > 0 && !queue.some((job) => available(job.ignorePause) && (job.canStart?.() ?? true));
		if (snapshot.active === running.size && snapshot.waiting === queue.length && snapshot.held === waiting && snapshot.cancelled === cancelled) return;
		snapshot = {
			active: running.size,
			waiting: queue.length,
			held: waiting,
			cancelled
		};
		for (const listener of listeners) listener();
	};
	const schedule = (delay) => {
		if (!Number.isFinite(delay)) return;
		if (timer !== void 0) clearTimeout(timer);
		timer = setTimeout(pump, Math.max(1, delay));
	};
	const pump = () => {
		if (timer !== void 0) clearTimeout(timer);
		timer = void 0;
		for (let index = queue.length - 1; index >= 0; index--) {
			const job = queue[index];
			if (job.deferWhenBlocked && job.canStart?.() === false) {
				queue.splice(index, 1);
				job.trace?.("deferred");
				job.reject(new PullPriorityDeferredError());
			}
		}
		emit();
		for (const resume of [...held]) resume();
		if (held.size) schedule(options.availabilityDelay?.(false) ?? Infinity);
		const config = policy();
		if (!queue.length || running.size >= config.concurrency) return;
		const position = queue.findIndex((job) => available(job.ignorePause) && (job.canStart?.() ?? true));
		if (position < 0) {
			const delays = queue.filter((job) => job.canStart?.() ?? true).map((job) => options.availabilityDelay?.(job.ignorePause) ?? Infinity);
			if (delays.length) schedule(Math.min(...delays));
			return;
		}
		const delay = lastStarted + config.gapMs - performance.now();
		if (delay > 0) {
			schedule(delay);
			return;
		}
		const job = queue.splice(position, 1)[0];
		running.add(job);
		(async () => {
			let timeout;
			let abort = () => {};
			try {
				const interruption = new Promise((_, reject) => {
					abort = () => reject(job.controller.signal.reason ?? cancelledError());
					job.controller.signal.addEventListener("abort", abort, { once: true });
					const requestTimeout = typeof options.requestTimeoutMs === "function" ? options.requestTimeoutMs() : options.requestTimeoutMs ?? 9e4;
					timeout = setTimeout(() => job.controller.abort(/* @__PURE__ */ new Error("Catalog request timed out. Its saved resume point is unchanged; retry the pull.")), requestTimeout);
				});
				lastStarted = performance.now();
				job.trace?.("started");
				const work = job.work(job.controller.signal);
				emit();
				const result = await Promise.race([work, interruption]);
				clearTimeout(timeout);
				if (!available(job.ignorePause)) job.trace?.("held");
				while (!available(job.ignorePause) && job.generation === generation && !job.controller.signal.aborted) await new Promise((resolve) => {
					const resume = () => {
						if (!available(job.ignorePause) && !job.controller.signal.aborted && job.generation === generation) return;
						held.delete(resume);
						job.controller.signal.removeEventListener("abort", resume);
						resolve();
					};
					held.add(resume);
					job.controller.signal.addEventListener("abort", resume, { once: true });
					pump();
				});
				if (job.generation !== generation || job.controller.signal.aborted) throw cancelledError();
				job.trace?.("complete");
				job.resolve(result);
			} catch (error) {
				job.trace?.(job.controller.signal.aborted ? "cancelled" : "failed");
				job.reject(error instanceof Error ? error : new Error(String(error)));
			} finally {
				clearTimeout(timeout);
				job.controller.signal.removeEventListener("abort", abort);
				running.delete(job);
				emit();
				pump();
			}
		})();
		if (queue.length && running.size < config.concurrency) schedule(config.gapMs);
	};
	return {
		run(work, options = {}) {
			if (options.signal?.aborted) return Promise.reject(options.signal.reason ?? cancelledError());
			if (queue.length >= maxWaiting) return Promise.reject(/* @__PURE__ */ new Error("Pull queue is full. Let the current batch finish before adding more."));
			const ignorePause = options.ignorePause === true;
			const result = new Promise((resolve, reject) => {
				const cleanup = () => options.signal?.removeEventListener("abort", abort);
				const job = {
					trace: optionsFactoryTrace(options.operation ?? "archive"),
					work,
					resolve: (value) => {
						cleanup();
						resolve(value);
					},
					reject: (error) => {
						cleanup();
						reject(error);
					},
					generation,
					controller: new AbortController(),
					ignorePause,
					canStart: options.canStart,
					deferWhenBlocked: options.deferWhenBlocked
				};
				const abort = () => {
					const position = queue.indexOf(job);
					if (position >= 0) {
						queue.splice(position, 1);
						job.trace?.("cancelled");
						job.reject(cancelledError());
					} else job.controller.abort(options.signal?.reason ?? cancelledError());
					pump();
				};
				options.signal?.addEventListener("abort", abort, { once: true });
				queue.push(job);
				job.trace?.("queued");
			});
			pump();
			return result;
		},
		cancel() {
			generation++;
			cancelled += queue.length + running.size;
			for (const job of queue.splice(0)) {
				job.trace?.("cancelled");
				job.reject(cancelledError());
			}
			for (const job of running) job.controller.abort(cancelledError());
			if (timer !== void 0) clearTimeout(timer);
			timer = void 0;
			emit();
		},
		wake: pump,
		revision: () => generation,
		snapshot: () => snapshot,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
	};
}
var samples = {
	navigation: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	},
	search: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	},
	rating: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	},
	playback: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	},
	queue: {
		count: 0,
		lastMs: 0,
		worstMs: 0,
		at: 0
	}
};
var lastStarted = {};
var interactionPriorityUntil = 0;
function prioritizeInteraction() {
	if (typeof performance !== "undefined") interactionPriorityUntil = Math.max(interactionPriorityUntil, performance.now() + 240);
}
/** Pure helper so the foreground lease can be verified without browser time. */
function interactionPriorityDelay(now, priorityUntil) {
	return Math.max(0, Math.ceil(priorityUntil - now));
}
/** Remaining time before background work may resume. */
function getInteractionPriorityDelay() {
	if (typeof performance === "undefined") return 0;
	return interactionPriorityDelay(performance.now(), interactionPriorityUntil);
}
/**
* Schedule discardable local work behind current interaction, first paint, and
* hidden-tab time. Callers retain cancellation on dependency changes, so an
* obsolete index/ranking pass never gets a chance to contend with the latest
* visible shelf.
*/
function scheduleBackgroundWork(work, options = {}) {
	if (typeof window === "undefined") return () => {};
	let cancelled = false;
	let idle;
	let timer;
	let waitingForVisibility = false;
	const timeoutMs = options.timeoutMs ?? 1e3;
	const fallbackDelayMs = options.fallbackDelayMs ?? 0;
	const clearPending = () => {
		if (typeof idle === "number") window.cancelIdleCallback?.(idle);
		if (typeof timer !== "undefined") window.clearTimeout(timer);
		idle = void 0;
		timer = void 0;
		if (waitingForVisibility) {
			document.removeEventListener("visibilitychange", onVisibilityChange);
			waitingForVisibility = false;
		}
	};
	const schedule = () => {
		clearPending();
		if (cancelled) return;
		const delay = getInteractionPriorityDelay();
		if (delay > 0) {
			timer = window.setTimeout(schedule, delay);
			return;
		}
		if (document.visibilityState === "hidden") {
			waitingForVisibility = true;
			document.addEventListener("visibilitychange", onVisibilityChange);
			return;
		}
		const run = () => {
			idle = void 0;
			timer = void 0;
			if (cancelled) return;
			if (getInteractionPriorityDelay() > 0 || document.visibilityState === "hidden") {
				schedule();
				return;
			}
			work();
		};
		if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(run, { timeout: timeoutMs });
		else timer = window.setTimeout(run, fallbackDelayMs);
	};
	const onVisibilityChange = () => {
		if (document.visibilityState === "visible") schedule();
	};
	schedule();
	return () => {
		cancelled = true;
		clearPending();
	};
}
/** Records a local input-to-next-paint approximation without collecting media data. */
function measureInteraction(kind) {
	if (typeof window === "undefined" || typeof performance === "undefined") return;
	const now = performance.now();
	prioritizeInteraction();
	if (now - (lastStarted[kind] ?? -Infinity) < 120) return;
	lastStarted[kind] = now;
	window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
		const elapsed = Math.round(performance.now() - now);
		const sample = samples[kind];
		sample.count += 1;
		sample.lastMs = elapsed;
		sample.worstMs = Math.max(sample.worstMs, elapsed);
		sample.at = Date.now();
	}));
}
function getInteractionBudgetSnapshot() {
	return Object.fromEntries(Object.entries(samples).map(([kind, sample]) => [kind, { ...sample }]));
}
var DATA_SAVER_KEY = "reelcase.data-saver.v1";
var mode;
var sessionOnly = false;
var listeners$2 = /* @__PURE__ */ new Set();
var read$3 = () => {
	try {
		return localStorage.getItem("reelcase.data-saver.v1") === "save-data" ? "save-data" : "adaptive";
	} catch {
		return "adaptive";
	}
};
var getDataSaverMode = () => typeof window === "undefined" ? "adaptive" : mode ??= read$3();
var dataSaverActive = () => getDataSaverMode() === "save-data" || typeof navigator !== "undefined" && navigator.connection?.saveData === true;
function setDataSaverMode(value) {
	mode = value === "save-data" ? value : "adaptive";
	try {
		localStorage.setItem(DATA_SAVER_KEY, mode);
		sessionOnly = false;
	} catch {
		sessionOnly = true;
	}
	for (const notify of listeners$2) notify();
}
var stop;
function subscribeDataSaver(notify) {
	if (!listeners$2.size && typeof window !== "undefined") {
		if (!sessionOnly) mode = void 0;
		const storage = (event) => {
			if (event.key === "reelcase.data-saver.v1" || event.key === null) {
				mode = void 0;
				for (const fn of listeners$2) fn();
			}
		};
		const change = () => {
			for (const fn of listeners$2) fn();
		};
		const connection = navigator.connection;
		window.addEventListener("storage", storage);
		connection?.addEventListener("change", change);
		stop = () => {
			window.removeEventListener("storage", storage);
			connection?.removeEventListener("change", change);
		};
	}
	listeners$2.add(notify);
	return () => {
		listeners$2.delete(notify);
		if (!listeners$2.size) {
			stop?.();
			stop = void 0;
			if (!sessionOnly) mode = void 0;
		}
	};
}
var MIB = 1048576;
var standard = Object.freeze({
	lowMemory: false,
	reason: "standard",
	artworkBytes: 8 * MIB,
	artworkEntries: LIBRARY_LIMITS.memoryThumbEntries,
	imageRequests: 12,
	thumbnailWorkers: 4,
	photoWorkers: 12,
	gridMountCap: 108,
	gridPageSize: 24,
	railOverscan: 1
});
var constrained = (reason) => Object.freeze({
	lowMemory: true,
	reason,
	artworkBytes: 2 * MIB,
	artworkEntries: 72,
	imageRequests: 4,
	thumbnailWorkers: 1,
	photoWorkers: 2,
	gridMountCap: 36,
	gridPageSize: 24,
	railOverscan: 0
});
var selected = constrained("selected");
var device = constrained("device");
/** Device memory is a coarse capability hint, never measured free RAM. Unknown
* devices keep normal defaults; explicit low-memory mode also works on desktop. */
function resolvePerformanceProfile(mode, hints = {}) {
	if (mode === "low-memory") return selected;
	return hints.saveData || Number.isFinite(hints.cores) && hints.cores > 0 && hints.cores <= 4 || Number.isFinite(hints.memoryGiB) && hints.memoryGiB > 0 && hints.memoryGiB <= 2 ? device : standard;
}
var PERFORMANCE_MODE_KEY = "reelcase.performance-mode";
var savedMode;
var listeners$1 = /* @__PURE__ */ new Set();
var stopStorage;
function getPerformanceMode() {
	if (typeof window === "undefined") return "adaptive";
	if (!savedMode) try {
		savedMode = localStorage.getItem("reelcase.performance-mode") === "low-memory" ? "low-memory" : "adaptive";
	} catch {
		savedMode = "adaptive";
	}
	return savedMode;
}
function getPerformanceProfile() {
	const nav = typeof navigator === "undefined" ? void 0 : navigator;
	return resolvePerformanceProfile(getPerformanceMode(), {
		cores: nav?.hardwareConcurrency,
		memoryGiB: nav?.deviceMemory,
		saveData: nav?.connection?.saveData
	});
}
var getServerPerformanceProfile = () => standard;
function setPerformanceMode(mode) {
	savedMode = mode;
	try {
		localStorage.setItem(PERFORMANCE_MODE_KEY, mode);
	} catch {}
	for (const listener of listeners$1) listener();
}
/** Only subscribed surfaces retain a shared cross-tab settings listener. */
function subscribePerformanceProfile(listener) {
	if (!listeners$1.size && typeof window !== "undefined") {
		savedMode = void 0;
		const onStorage = (event) => {
			if (event.key !== "reelcase.performance-mode" && event.key !== null) return;
			savedMode = void 0;
			for (const notify of listeners$1) notify();
		};
		const onConnection = () => {
			for (const notify of listeners$1) notify();
		};
		const connection = typeof navigator === "undefined" ? void 0 : navigator.connection;
		window.addEventListener("storage", onStorage);
		connection?.addEventListener("change", onConnection);
		stopStorage = () => {
			window.removeEventListener("storage", onStorage);
			connection?.removeEventListener("change", onConnection);
		};
	}
	listeners$1.add(listener);
	return () => {
		listeners$1.delete(listener);
		if (!listeners$1.size) {
			stopStorage?.();
			stopStorage = void 0;
		}
	};
}
/**
* Bound concurrent remote thumbnail fetches so Adults shelves do not stall
* scroll with hundreds of parallel CDN requests / retries.
* Visible cards use a high-priority lane; speculative/offscreen work waits.
*/
var artworkSuppressed = false;
var pageSuspended$1 = false;
var suppressionListeners = /* @__PURE__ */ new Set();
var waitingHigh = [];
var waitingLow = [];
var activeSlots = /* @__PURE__ */ new Set();
var interactionTimer;
/** Default ceiling — aggressive enough that dense Adult rails stay scrollable. */
var MAX_CONCURRENT = 12;
/** Reserve a few slots so visible cards are not starved by speculative warm. */
var HIGH_RESERVED = 4;
function maxConcurrent() {
	return Math.min(getPerformanceProfile().imageRequests, deviceConcurrent());
}
function deviceConcurrent() {
	const nav = typeof navigator !== "undefined" ? navigator : void 0;
	if (nav?.connection?.saveData) return 3;
	if (nav?.deviceMemory && nav.deviceMemory <= 2) return 4;
	if (nav?.deviceMemory && nav.deviceMemory <= 4) return 6;
	if (nav?.hardwareConcurrency && nav.hardwareConcurrency <= 4) return 6;
	const type = nav?.connection?.effectiveType;
	if (type === "slow-2g" || type === "2g") return 3;
	if (type === "3g") return 6;
	if (typeof nav?.connection?.downlink === "number" && nav.connection.downlink > 0 && nav.connection.downlink < 1.5) return 6;
	return MAX_CONCURRENT;
}
function end(waiter) {
	if (waiter.ended) return;
	waiter.ended = true;
	waiter.signal?.removeEventListener("abort", waiter.cancel);
	const queue = waiter.priority === "high" ? waitingHigh : waitingLow;
	const index = queue.indexOf(waiter);
	if (index >= 0) queue.splice(index, 1);
	if (activeSlots.delete(waiter)) waiter.notify?.(false);
	else waiter.resolve?.(null);
	pump();
}
function suspended() {
	return artworkSuppressed || pageSuspended$1 || typeof document !== "undefined" && document.visibilityState === "hidden";
}
function suspendActiveCards() {
	for (const waiter of [...activeSlots]) {
		if (!waiter.notify) continue;
		activeSlots.delete(waiter);
		(waiter.priority === "high" ? waitingHigh : waitingLow).push(waiter);
		waiter.notify(false);
	}
}
/** Reserve capacity synchronously before resolving promises. Refilling the
* whole budget avoids serial loading after a viewer/visibility pause. */
function pump() {
	if (interactionTimer !== void 0) {
		clearTimeout(interactionTimer);
		interactionTimer = void 0;
	}
	if (suspended()) {
		suspendActiveCards();
		return;
	}
	const max = maxConcurrent();
	if (dataSaverActive()) {
		for (const waiter of [...activeSlots]) if (waiter.priority === "low" && waiter.notify) {
			activeSlots.delete(waiter);
			waitingLow.push(waiter);
			waiter.notify(false);
		}
	}
	if (activeSlots.size > max) {
		const excess = [...activeSlots].filter((waiter) => Boolean(waiter.notify)).sort((a, b) => Number(a.priority === "high") - Number(b.priority === "high"));
		for (const waiter of excess) {
			if (activeSlots.size <= max) break;
			activeSlots.delete(waiter);
			(waiter.priority === "high" ? waitingHigh : waitingLow).push(waiter);
			waiter.notify?.(false);
		}
	}
	while (activeSlots.size < max && (waitingHigh.length || waitingLow.length)) {
		const delay = getInteractionPriorityDelay();
		if (delay > 0) {
			interactionTimer = setTimeout(pump, delay);
			return;
		}
		let waiter = waitingHigh.shift();
		if (!waiter) {
			if (dataSaverActive() || !waitingLow.length || activeSlots.size >= Math.max(1, max - HIGH_RESERVED)) return;
			waiter = waitingLow.shift();
		}
		if (waiter.ended || waiter.signal?.aborted) {
			end(waiter);
			continue;
		}
		activeSlots.add(waiter);
		if (waiter.notify) waiter.notify(true);
		else {
			waiter.signal?.removeEventListener("abort", waiter.cancel);
			waiter.resolve?.(() => end(waiter));
		}
	}
}
/** Hold new thumbnail work while a preview/player is opening or visible. */
function setArtworkSuppressed(value) {
	if (artworkSuppressed === value) return;
	artworkSuppressed = value;
	for (const listener of suppressionListeners) listener();
	pump();
}
function isArtworkSuppressed() {
	return artworkSuppressed;
}
/** Shared background schedulers can pause without subscribing every card. */
function subscribeArtworkSuppression(listener) {
	suppressionListeners.add(listener);
	return () => {
		suppressionListeners.delete(listener);
	};
}
/** One revocable card lease. Opening a viewer or hiding the page withdraws
* unfinished images; the same subscribed card resumes when the gate opens.
* Completion/unmount cancels the lease and all of its retained callbacks. */
function watchImageSlot(opts, notify) {
	if (opts.signal?.aborted) return () => {};
	ensureImageBudgetVisibilityHook();
	const priority = opts.priority ?? "low";
	const waiter = {
		signal: opts.signal,
		priority,
		ended: false,
		notify,
		cancel: () => end(waiter)
	};
	(priority === "high" ? waitingHigh : waitingLow).push(waiter);
	opts.signal?.addEventListener("abort", waiter.cancel, { once: true });
	pump();
	return waiter.cancel;
}
/** Optional diagnostics for the local render budget panel. */
function getImageLoadBudgetSnapshot() {
	return {
		active: activeSlots.size,
		queued: waitingHigh.length + waitingLow.length,
		queuedHigh: waitingHigh.length,
		queuedLow: waitingLow.length,
		max: maxConcurrent()
	};
}
/** Drop one-shot speculative requests. Mounted card subscriptions remain
* queued across visibility pauses so nearby cards can resume without scrolling.
* Their owner cancels them when the card leaves the nearby window or unmounts. */
function clearLowPriorityImageQueue() {
	const pending = waitingLow.filter((waiter) => !waiter.notify);
	for (const waiter of pending) end(waiter);
	pump();
}
var visibilityHooked = false;
/** One shared visibility listener, instead of one listener per waiting card. */
function ensureImageBudgetVisibilityHook() {
	if (visibilityHooked || typeof document === "undefined") return;
	visibilityHooked = true;
	subscribePerformanceProfile(pump);
	subscribeDataSaver(pump);
	const onVisibility = () => {
		if (document.visibilityState === "hidden") {
			suspendActiveCards();
			clearLowPriorityImageQueue();
		} else pump();
	};
	const hide = () => {
		pageSuspended$1 = true;
		pump();
	};
	const show = () => {
		pageSuspended$1 = false;
		pump();
	};
	const input = () => {
		prioritizeInteraction();
		pump();
	};
	const inputEvents = [
		"pointerdown",
		"keydown",
		"wheel",
		"touchstart",
		"touchmove"
	];
	document.addEventListener("visibilitychange", onVisibility);
	if (typeof window !== "undefined") {
		window.addEventListener("pagehide", hide);
		window.addEventListener("pageshow", show);
		for (const event of inputEvents) window.addEventListener(event, input, { passive: true });
	}
}
/** Explicit actions always run. Automatic archives yield to the page in use;
* lightweight status reads retain their independent provider lanes. */
function automaticPullMatchesPage(page, provider) {
	if (page === "live") return false;
	if (page === "youtube" || page === "twitch" || page === "adults") return provider === page;
	return true;
}
var KEY$5 = "reelcase.pulls-paused.v1";
function createPullControl(initial = false) {
	let paused = initial;
	const listeners = /* @__PURE__ */ new Set();
	const waiters = /* @__PURE__ */ new Set();
	return {
		paused: () => paused,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		set: (value) => {
			if (paused === value) return;
			paused = value;
			if (!value) {
				for (const resolve of waiters) resolve();
				waiters.clear();
			}
			for (const listener of listeners) listener();
		},
		wait: async () => {
			while (paused) await new Promise((resolve) => waiters.add(resolve));
		}
	};
}
var control = createPullControl();
var hydrated = false;
function hydrate() {
	if (hydrated || typeof window === "undefined") return;
	hydrated = true;
	try {
		control.set(localStorage.getItem(KEY$5) === "true");
	} catch {}
}
function pullsPaused() {
	hydrate();
	return control.paused();
}
var subscribePullControl = control.subscribe;
async function waitForPulls() {
	hydrate();
	await control.wait();
}
function setPullsPaused(value) {
	hydrate();
	control.set(value);
	try {
		localStorage.setItem(KEY$5, String(value));
	} catch {}
}
var viewing = false;
var gateListeners = /* @__PURE__ */ new Set();
var activePullPage = "";
function setActivePullPage(page) {
	if (page === activePullPage) return;
	activePullPage = page;
	gateChanged();
}
function automaticPullAvailable(provider) {
	return automaticPullMatchesPage(activePullPage, provider);
}
var gateChanged = () => {
	scheduler.wake();
	for (const lane of liveSchedulers) lane.wake();
	for (const listener of gateListeners) listener();
};
/** Includes the viewer gate, which changes after the store's open/close event.
* Sleeping periodic owners must wake on that final availability transition. */
var subscribePullAvailability = (listener) => {
	gateListeners.add(listener);
	return () => {
		gateListeners.delete(listener);
	};
};
function setPullViewerOpen(value) {
	viewing = value;
	setArtworkSuppressed(value);
	gateChanged();
}
function catalogPullAvailable(ignoreInteraction = false, ignorePause = false) {
	return (ignorePause || !pullsPaused()) && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === "undefined" || !document.hidden) && (ignoreInteraction || getInteractionPriorityDelay() === 0);
}
var scheduler = createPullScheduler(() => ({
	concurrency: getPullSettings().concurrentRequests,
	gapMs: getPullSettings().requestGapMs
}), (ignorePause) => catalogPullAvailable(false, ignorePause), 8, {
	trace: (operation) => pullDispatchTrace.begin("catalog", operation),
	requestTimeoutMs: () => Math.max(9e4, getPullSettings().requestGapMs * 12 + 3e4, getPullSettings().youtubeRequestGapMs * 4 + 9e4),
	availabilityDelay: (ignorePause = false) => (ignorePause || !pullsPaused()) && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === "undefined" || !document.hidden) ? getInteractionPriorityDelay() : Infinity
});
var createLiveLane = (name, concurrency = 1) => createPullScheduler(() => ({
	concurrency,
	gapMs: 80
}), (ignorePause) => catalogPullAvailable(false, ignorePause), 4, {
	trace: (operation) => pullDispatchTrace.begin(name, operation),
	requestTimeoutMs: concurrency > 1 ? 3e4 : () => Math.max(9e4, getPullSettings().youtubeRequestGapMs * 48 + 3e4),
	availabilityDelay: (ignorePause = false) => (ignorePause || !pullsPaused()) && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === "undefined" || !document.hidden) ? getInteractionPriorityDelay() : Infinity
});
var liveScheduler = createLiveLane("rooms");
var youtubeLiveScheduler = createLiveLane("youtube live", 3);
var twitchLiveScheduler = createLiveLane("twitch live");
var liveSchedulers = [
	liveScheduler,
	youtubeLiveScheduler,
	twitchLiveScheduler
];
var combinedSnapshot = scheduler.snapshot();
var queueListeners = /* @__PURE__ */ new Set();
var combineQueues = () => {
	const next = [scheduler, ...liveSchedulers].map((lane) => lane.snapshot()).reduce((total, item) => ({
		active: total.active + item.active,
		waiting: total.waiting + item.waiting,
		held: total.held || item.held,
		cancelled: total.cancelled + item.cancelled
	}), {
		active: 0,
		waiting: 0,
		held: false,
		cancelled: 0
	});
	if (Object.keys(next).every((key) => next[key] === combinedSnapshot[key])) return;
	combinedSnapshot = next;
	for (const listener of queueListeners) listener();
};
[scheduler, ...liveSchedulers].map((lane) => lane.subscribe(combineQueues));
control.subscribe(gateChanged);
subscribePullSettings(gateChanged);
if (typeof document !== "undefined") {
	const onStorage = (event) => {
		if (event.key === KEY$5) {
			hydrated = true;
			control.set(event.newValue === "true");
		}
	};
	window.addEventListener("storage", onStorage);
	document.addEventListener("visibilitychange", gateChanged);
}
var getPullQueueSnapshot = () => combinedSnapshot;
var subscribePullQueue = (listener) => {
	queueListeners.add(listener);
	return () => {
		queueListeners.delete(listener);
	};
};
var cancelQueuedPulls = () => {
	scheduler.cancel();
	for (const lane of liveSchedulers) lane.cancel();
	gateChanged();
};
var getPullCancellationRevision = scheduler.revision;
/** Yield preparation/commits behind input, watching, pause, and visibility.
* Cancellation wakes this wait even when the tab never becomes visible. */
function waitForCatalogCommit(revision = scheduler.revision(), signal) {
	return new Promise((resolve, reject) => {
		let timer;
		const cleanup = () => {
			clearTimeout(timer);
			gateListeners.delete(check);
			signal?.removeEventListener("abort", check);
		};
		const check = () => {
			clearTimeout(timer);
			if (signal?.aborted || revision !== scheduler.revision()) {
				cleanup();
				reject(/* @__PURE__ */ new Error("Pull cancelled; accepted catalog entries remain saved."));
				return;
			}
			if (catalogPullAvailable()) {
				cleanup();
				resolve();
				return;
			}
			const delay = getInteractionPriorityDelay();
			if (delay > 0 && !pullsPaused() && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === "undefined" || !document.hidden)) timer = setTimeout(check, delay);
		};
		gateListeners.add(check);
		signal?.addEventListener("abort", check, { once: true });
		check();
	});
}
async function runPausablePull(request, options) {
	return (!options?.live ? scheduler : options.provider === "youtube" ? youtubeLiveScheduler : options.provider === "twitch" ? twitchLiveScheduler : liveScheduler).run(request, {
		...options,
		operation: options?.operation ?? (options?.live ? "live" : "archive"),
		canStart: options?.automatic && !options.live ? () => automaticPullAvailable(options.provider) : void 0,
		deferWhenBlocked: options?.automatic && !options.live
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Client-callable remote actions live apart from the provider implementation.
* Keeping this module small gives TanStack Start stable server-function IDs
* across dev-server dependency optimization and HMR updates.
*/
var input = (data) => data;
var followRemoteRequest = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("d1155935e3ce6be09b32b6bceaac773115bc3e7b37e165babd1a246638e36f7c"));
var refreshRemotesRequest = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("3b5f1e63b8dde522be6847c1ba970b2c5473d9d776f080d86a78884151898152"));
var importChannelsRequest = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("6be598ce27c9baf7d31cc1ee443d15104f7a057282b84764cec56bc270e4599a"));
var fetchTwitchFollowing = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("926b625b25b1f6c5d08281cc86b3196dbb11bcb5b683a95b5ebcf2111dc013b0"));
var searchAdultVideosRequest = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("adcf396e47a4470a97261625127a3496a88d85f3f1036f72b4a0ebbfc78c1b95"));
var fetchAdultComments = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("3250c7fe9ae5ccef9fa5787d5e016af43eee3512d762581de88ac40b08152dad"));
var searchRedtubeStars = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("bcf52ff714b81b8c64a4700ab9a64674ed5afcf8786fb9b74bdc3c4557ca86bf"));
var resolveBooruOriginal = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("dd1d1916a4839a4ceb55923d6e545e56caf6cd3f77b36275c007d928335b1d12"));
var youtubeCreatorProfiles = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("01ab33bc0455dc5351da5f13e553736c0034ee0d18195c486c175d01ae271321"));
var pacedData = (data) => ({
	...data && typeof data === "object" ? data : {},
	youtubeRequestGapMs: getPullSettings().youtubeRequestGapMs
});
var followRemote = (...args) => {
	const data = args[0]?.data;
	return runPausablePull((signal) => followRemoteRequest({
		...args[0],
		data: pacedData(args[0]?.data),
		signal
	}), {
		operation: data?.twitchClipMode ? "clips" : "archive",
		signal: args[0]?.signal
	});
};
var refreshRemotes = (...args) => {
	const data = args[0]?.data;
	const live = Boolean(data?.youtubeLiveOnly || data?.twitchLiveOnly);
	return runPausablePull((signal) => refreshRemotesRequest({
		...args[0],
		data: pacedData(args[0]?.data),
		signal
	}), {
		live,
		provider: data?.youtubeLiveOnly && !data.twitchLiveOnly ? "youtube" : data?.twitchLiveOnly && !data.youtubeLiveOnly ? "twitch" : data?.channels?.every((channel) => channel.kind === "youtube") ? "youtube" : data?.channels?.every((channel) => channel.kind === "twitch") ? "twitch" : void 0,
		operation: live ? "live" : data?.youtubeCatalog || data?.youtubeFeedRepair || data?.twitchContinueArchive ? "archive" : "recent",
		ignorePause: live,
		automatic: data?.youtubeBackground,
		signal: args[0]?.signal
	});
};
var importChannels = (...args) => runPausablePull((signal) => importChannelsRequest({
	...args[0],
	data: pacedData(args[0]?.data),
	signal
}), {
	operation: "import",
	signal: args[0]?.signal
});
var searchAdultVideos = (...args) => runPausablePull((signal) => searchAdultVideosRequest({
	...args[0],
	signal
}));
/** Selected-photo validation must continue while bulk pulling is paused. */
var inspectRedditImage = createServerFn({ method: "POST" }).validator((data) => typeof data === "string" && data.length <= 2048 ? data : "").handler(createSsrRpc("3e1ecfb07abb48cc35cfe61eb295043dc59f7294405b8cd4692347582d4db1f2"));
var liveRoomsRequest = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("e483c3dfca51219e37b04bba9ff9fcc8a0b6d8624bc8e163729cdf09c4fc0dc6"));
/** Room pages are demand-driven live reads, independent of archive pause. */
var fetchLiveRooms = (options) => runPausablePull((signal) => liveRoomsRequest({
	...options,
	signal: options?.signal ? AbortSignal.any([signal, options.signal]) : signal
}), {
	live: true,
	ignorePause: true
});
var fetchTwitchChapters = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("a23698ebba1c60aa0e5b50083b688c3e5c0a9cfedbffa87f58d10d18cc4d21ce"));
var KEY$4 = "reelcase.rating-streaks.v1";
var GOAL_KEY = "reelcase.rating-weekly-goal.v1";
var DEFAULT_WEEKLY_GOAL = 5;
var RATING_GOALS = [
	3,
	5,
	10
];
function weeklyGoal() {
	try {
		const saved = Number(localStorage.getItem(GOAL_KEY) ?? DEFAULT_WEEKLY_GOAL);
		return RATING_GOALS.includes(saved) ? saved : DEFAULT_WEEKLY_GOAL;
	} catch {
		return DEFAULT_WEEKLY_GOAL;
	}
}
function setRatingWeeklyGoal(goal) {
	if (!RATING_GOALS.includes(goal) || typeof window === "undefined") return;
	try {
		localStorage.setItem(GOAL_KEY, String(goal));
	} catch {}
	window.dispatchEvent(new Event("reelcase:rating-streak-change"));
}
function dayKey(at = /* @__PURE__ */ new Date()) {
	return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
}
function weekKey(at = /* @__PURE__ */ new Date()) {
	const date = new Date(at);
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	const firstThursday = new Date(date.getFullYear(), 0, 4);
	const week = 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 864e5 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
	return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
function read$2() {
	try {
		const saved = JSON.parse(localStorage.getItem(KEY$4) ?? "[]");
		return Array.isArray(saved) ? saved.filter((row) => typeof row?.day === "string" && Array.isArray(row?.ids)).slice(-400) : [];
	} catch {
		return [];
	}
}
function write$1(days) {
	try {
		localStorage.setItem(KEY$4, JSON.stringify(days.slice(-400)));
	} catch {}
}
/** Rebuild current-week progress from the durable feedback ledger. Older
* versions saved the rating but did not always update this lightweight UI
* counter, especially after a refresh or browser restore. */
function reconcileRatingLedger(days) {
	try {
		const feedback = JSON.parse(localStorage.getItem("reelcase.media-feedback.v1") ?? "{}");
		for (const [id, row] of Object.entries(feedback.ratingHistory ?? {})) {
			if (!(Number(row.rating) > 0) || !Number.isFinite(Number(row.updatedAt))) continue;
			const day = dayKey(new Date(Number(row.updatedAt)));
			const target = days.find((entry) => entry.day === day);
			if (target) {
				if (!target.ids.includes(id)) target.ids.push(id);
			} else days.push({
				day,
				ids: [id]
			});
		}
		const today = dayKey();
		const target = days.find((entry) => entry.day === today) ?? (() => {
			const created = {
				day: today,
				ids: []
			};
			days.push(created);
			return created;
		})();
		for (const [id, rating] of Object.entries(feedback.ratings ?? {})) if (Number(rating) > 0 && !(id in (feedback.ratingHistory ?? {})) && !target.ids.includes(id)) target.ids.push(id);
	} catch {}
	return days;
}
function recordRatingForStreak(id, rating) {
	if (!id || typeof window === "undefined") return;
	const days = read$2();
	const today = dayKey();
	const row = days.find((entry) => entry.day === today);
	if (rating >= 1) {
		if (row) {
			if (!row.ids.includes(id)) row.ids.push(id);
		} else days.push({
			day: today,
			ids: [id]
		});
	} else if (row) row.ids = row.ids.filter((saved) => saved !== id);
	write$1(days);
	window.dispatchEvent(new Event("reelcase:rating-streak-change"));
}
function getRatingStreakSnapshot(now = /* @__PURE__ */ new Date()) {
	const days = reconcileRatingLedger(read$2());
	write$1(days);
	const weeklyGoalValue = weeklyGoal();
	const currentWeek = weekKey(now);
	const weekTotals = /* @__PURE__ */ new Map();
	for (const row of days) {
		const key = weekKey(/* @__PURE__ */ new Date(`${row.day}T12:00:00`));
		const ids = weekTotals.get(key) ?? /* @__PURE__ */ new Set();
		for (const id of row.ids) ids.add(id);
		weekTotals.set(key, ids);
	}
	const thisWeek = weekTotals.get(currentWeek)?.size ?? 0;
	let weeklyStreak = 0;
	const cursor = new Date(now);
	while (true) {
		if ((weekTotals.get(weekKey(cursor))?.size ?? 0) < weeklyGoalValue) break;
		weeklyStreak += 1;
		cursor.setDate(cursor.getDate() - 7);
	}
	const rewards = [
		{
			label: "First impression",
			earned: thisWeek >= 1,
			detail: "Rate one title this week."
		},
		{
			label: "Weekly curator",
			earned: thisWeek >= weeklyGoalValue,
			detail: `Rate ${weeklyGoalValue} distinct titles this week.`
		},
		{
			label: "Two-week rhythm",
			earned: weeklyStreak >= 2,
			detail: "Complete your weekly goal two weeks in a row."
		}
	];
	const next = rewards.find((reward) => !reward.earned);
	return {
		weekKey: currentWeek,
		thisWeek,
		weeklyGoal: weeklyGoalValue,
		weeklyStreak,
		nextReward: next ? next.detail : "All current local rewards earned.",
		rewards
	};
}
/** A signal keeps only live listeners, never a ledger of previously seen IDs. */
function createKeyedSignal() {
	const listeners = /* @__PURE__ */ new Map();
	return {
		subscribe(id, listener) {
			let group = listeners.get(id);
			if (!group) {
				group = /* @__PURE__ */ new Set();
				listeners.set(id, group);
			}
			group.add(listener);
			return () => {
				group.delete(listener);
				if (!group.size && listeners.get(id) === group) listeners.delete(id);
			};
		},
		emit(id) {
			listeners.get(id)?.forEach((listener) => listener());
		},
		emitAll() {
			listeners.forEach((group) => group.forEach((listener) => listener()));
		},
		size() {
			return listeners.size;
		}
	};
}
var EMPTY_WATCH_TIME = {
	preview: 0,
	fullscreen: 0
};
function watchTimeScore(time) {
	return Math.min(12, Math.floor(time.preview / 30) + Math.floor(time.fullscreen / 90) * 2 + Math.floor((time.previewEstimated ?? 0) / 90) + Math.floor((time.fullscreenEstimated ?? 0) / 180));
}
var KEY$3 = "reelcase.media-feedback.v1";
var cached = null;
var signalVersion = 0;
/** Includes ratings, hearts, durable imports and elapsed watch-time changes. */
function getFeedbackRevision() {
	read$1();
	return signalVersion;
}
var snapshot;
var changeTimer;
var persistTimer$1;
var cancelPersist;
var lastRatingQueueMs = 0;
var lastPersistMs = 0;
var pendingWrites = 0;
var feedbackSaveState = "saved";
var saveAttempt = 0;
function savedState(state) {
	if (feedbackSaveState === state) return;
	feedbackSaveState = state;
	if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:feedback-save"));
}
function getFeedbackSaveState() {
	return feedbackSaveState;
}
function retryFeedbackSave() {
	pendingWrites = 1;
	flush$1();
}
var ratingSignal = createKeyedSignal();
var subscribeRating = ratingSignal.subscribe;
var legacyRatings = /* @__PURE__ */ new Map();
var legacyRatingKeys = null;
var legacyScan;
function legacyKeys() {
	if (legacyRatingKeys) return legacyRatingKeys;
	const keys = /* @__PURE__ */ new Set();
	if (typeof window !== "undefined") try {
		for (let index = 0; index < localStorage.length; index++) {
			const key = localStorage.key(index);
			if (key?.startsWith("reelcase.rating.")) keys.add(key.slice(16));
		}
	} catch {}
	legacyRatingKeys = keys;
	return keys;
}
/** Read old per-title ratings once, in small batches, rather than doing a
* synchronous storage lookup for every unscored title during recommendation. */
async function warmLegacyRatings() {
	if (typeof window !== "undefined") {
		legacyScan ??= (async () => {
			try {
				for (let index = 0; index < localStorage.length; index++) {
					const key = localStorage.key(index);
					if (key?.startsWith("reelcase.rating.")) {
						const id = key.slice(16);
						legacyRatingKeys?.add(id);
						if (!legacyRatings.has(id)) {
							const value = Number(localStorage.getItem(key));
							legacyRatings.set(id, Number.isFinite(value) ? value : 0);
						}
					}
					if (index % 100 === 99) await new Promise((resolve) => window.setTimeout(resolve, 0));
				}
			} catch {}
		})();
		await legacyScan;
	}
}
async function rankingFeedbackSnapshot() {
	await warmLegacyRatings();
	if (snapshot?.version === signalVersion) {
		const current = snapshot, result = await current.pending;
		return current.version === signalVersion ? result : rankingFeedbackSnapshot();
	}
	const version = signalVersion, feedback = read$1();
	const pending = (async () => {
		const ratings = await copyCatalogRecord(feedback.ratings, yieldCatalogTask);
		let count = 0;
		for (const [id, rating] of legacyRatings) {
			if (!(id in ratings)) ratings[id] = rating;
			if (++count % 512 === 0) await yieldCatalogTask();
		}
		const watchScores = Object.create(null);
		count = 0;
		for (const id in feedback.watchTime) {
			watchScores[id] = watchTimeScore(feedback.watchTime[id]);
			if (++count % 512 === 0) await yieldCatalogTask();
		}
		return {
			recommendationRejections: normalizeRejections(feedback.recommendationRejections),
			ratings,
			heartedTags: Object.keys(feedback.tagLikes),
			historicTags: Object.keys(feedback.tagHeartHistory),
			creatorLikes: await copyCatalogRecord(feedback.creatorLikes, yieldCatalogTask),
			creatorFavorites: await copyCatalogRecord(feedback.creatorFavorites ?? {}, yieldCatalogTask),
			creatorRatings: await copyCatalogRecord(feedback.creatorRatings, yieldCatalogTask),
			watchScores
		};
	})();
	snapshot = {
		version,
		pending
	};
	const result = await pending;
	return version === signalVersion ? result : rankingFeedbackSnapshot();
}
var feedbackHydrated = false;
var cleanupFeedback;
/** Cache cleanup verifies the backup even if startup's best-effort restore
* is still pending or could not read storage. Failed reads can be retried. */
async function verifyCleanupFeedback() {
	if (typeof window === "undefined") return;
	cleanupFeedback ??= (async () => {
		const durable = await restoreDurableFeedback(true);
		if (!durable) return;
		const current = read$1();
		cached = {
			...current,
			recommendationRejections: newestRejections(durable.recommendationRejections, current.recommendationRejections),
			ratings: {
				...durable.ratings,
				...current.ratings
			},
			notes: {
				...durable.notes,
				...current.notes
			}
		};
		signalVersion++;
		snapshot = void 0;
		ratingSignal.emitAll();
		notifyChange();
	})();
	const pending = cleanupFeedback;
	try {
		await pending;
	} catch (error) {
		if (cleanupFeedback === pending) cleanupFeedback = void 0;
		throw error;
	}
}
function read$1() {
	if (cached) return cached;
	try {
		const saved = JSON.parse(localStorage.getItem(KEY$3) ?? "{}");
		cached = {
			recommendationRejections: normalizeRejections(saved.recommendationRejections),
			ratings: saved.ratings ?? {},
			ratingHistory: saved.ratingHistory ?? {},
			notes: saved.notes ?? {},
			creatorRatings: saved.creatorRatings ?? {},
			creatorLikes: saved.creatorLikes ?? {},
			creatorFavorites: saved.creatorFavorites ?? { ...saved.creatorLikes },
			tagLikes: saved.tagLikes ?? {},
			tagHeartHistory: saved.tagHeartHistory ?? {},
			watchTime: saved.watchTime ?? {}
		};
	} catch {
		cached = {
			recommendationRejections: EMPTY_REJECTIONS,
			ratings: {},
			ratingHistory: {},
			notes: {},
			creatorRatings: {},
			creatorLikes: {},
			creatorFavorites: {},
			tagLikes: {},
			tagHeartHistory: {},
			watchTime: {}
		};
	}
	return cached;
}
/** Merge IndexedDB feedback backup once so QuotaExceeded on localStorage cannot erase ratings/hearts. */
async function hydrateDurableFeedback() {
	if (typeof window === "undefined" || feedbackHydrated) return;
	feedbackHydrated = true;
	const durable = await restoreDurableFeedback().catch(() => null);
	if (!durable) return;
	const current = read$1();
	cached = {
		recommendationRejections: newestRejections(durable.recommendationRejections, current.recommendationRejections),
		ratings: {
			...durable.ratings,
			...current.ratings
		},
		ratingHistory: {
			...durable.ratingHistory,
			...current.ratingHistory
		},
		notes: {
			...durable.notes,
			...current.notes
		},
		creatorRatings: {
			...durable.creatorRatings,
			...current.creatorRatings
		},
		creatorLikes: {
			...durable.creatorLikes,
			...current.creatorLikes
		},
		creatorFavorites: {
			...durable.creatorFavorites,
			...current.creatorFavorites
		},
		tagLikes: {
			...durable.tagLikes,
			...current.tagLikes
		},
		tagHeartHistory: {
			...durable.tagHeartHistory,
			...current.tagHeartHistory
		},
		watchTime: {
			...durable.watchTime,
			...current.watchTime
		}
	};
	signalVersion++;
	snapshot = void 0;
	ratingSignal.emitAll();
	notifyChange();
}
function persist() {
	persistTimer$1 = void 0;
	cancelPersist = void 0;
	if (!pendingWrites || !cached) return;
	const started = typeof performance !== "undefined" ? performance.now() : Date.now();
	const attempt = ++saveAttempt;
	try {
		Promise.resolve(saveDurableFeedback(cached)).then((ok) => {
			if (attempt === saveAttempt) savedState(ok === false ? "failed" : "saved");
		}, () => {
			if (attempt === saveAttempt) savedState("failed");
		});
	} catch {
		savedState("failed");
	} finally {
		lastPersistMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
		pendingWrites = 0;
	}
}
/** Finish a queued rating write before a reload, tab close, or mobile app switch. */
function flush$1() {
	if (persistTimer$1 !== void 0) window.clearTimeout(persistTimer$1);
	persistTimer$1 = void 0;
	cancelPersist?.();
	cancelPersist = void 0;
	persist();
}
function queuePersist(delay) {
	persistTimer$1 = window.setTimeout(() => {
		persistTimer$1 = void 0;
		cancelPersist = scheduleBackgroundWork(persist, { timeoutMs: 1e3 });
	}, delay);
}
if (typeof window !== "undefined") {
	window.addEventListener("pagehide", flush$1);
	const onHidden = () => {
		if (document.visibilityState === "hidden") flush$1();
	};
	document.addEventListener("visibilitychange", onHidden);
}
function write(next) {
	cached = next;
	signalVersion++;
	snapshot = void 0;
	if (typeof window === "undefined") return;
	saveAttempt++;
	pendingWrites = 1;
	savedState("pending");
	if (persistTimer$1) window.clearTimeout(persistTimer$1);
	cancelPersist?.();
	cancelPersist = void 0;
	queuePersist(90);
}
function writeWatchTime(next) {
	cached = next;
	signalVersion++;
	snapshot = void 0;
	if (typeof window === "undefined") return;
	saveAttempt++;
	pendingWrites = 1;
	savedState("pending");
	if (persistTimer$1 === void 0 && !cancelPersist) queuePersist(15e3);
}
function notifyChange() {
	if (typeof window === "undefined" || changeTimer) return;
	changeTimer = window.setTimeout(() => {
		changeTimer = void 0;
		window.dispatchEvent(new Event("reelcase:rating-change"));
	}, 48);
}
function getRating(id) {
	const value = read$1().ratings[id];
	if (Number.isFinite(value)) return value;
	if (typeof window === "undefined") return 0;
	const known = legacyRatings.get(id);
	if (known !== void 0) return known;
	if (!legacyKeys().has(id)) return 0;
	let legacy = 0;
	try {
		legacy = Number(localStorage.getItem(`reelcase.rating.${id}`) ?? 0);
	} catch {}
	const rating = Number.isFinite(legacy) ? legacy : 0;
	legacyRatings.set(id, rating);
	return rating;
}
function setRating(id, rating) {
	const started = typeof performance !== "undefined" ? performance.now() : Date.now();
	const next = read$1();
	next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
	next.ratingHistory[id] = {
		rating: next.ratings[id],
		updatedAt: Date.now()
	};
	legacyRatings.set(id, next.ratings[id]);
	legacyKeys().add(id);
	recordRatingForStreak(id, next.ratings[id]);
	write(next);
	ratingSignal.emit(id);
	notifyChange();
	lastRatingQueueMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
}
function getWatchTime(id) {
	return read$1().watchTime[id] ?? EMPTY_WATCH_TIME;
}
/** Count real elapsed playback in small bounded increments, never seek distance. */
function recordWatchTime(id, mode, seconds) {
	if (!id || !Number.isFinite(seconds) || seconds <= 0) return;
	const next = read$1();
	const current = next.watchTime[id] ?? {
		preview: 0,
		fullscreen: 0
	};
	next.watchTime[id] = {
		...current,
		[mode]: Math.min(1e7, (current[mode] ?? 0) + Math.min(seconds, 5))
	};
	writeWatchTime(next);
}
/** Local timing only. This never transmits library feedback or usage data. */
function getFeedbackDiagnostics() {
	return {
		lastRatingQueueMs,
		lastPersistMs,
		pendingWrites
	};
}
function creatorKey(name) {
	return name.trim().toLowerCase();
}
function getCreatorRating(name) {
	return read$1().creatorRatings[creatorKey(name)] ?? 0;
}
function setCreatorRating(name, rating) {
	const next = read$1();
	next.creatorRatings[creatorKey(name)] = Math.max(0, Math.min(5, Math.round(rating)));
	write(next);
	notifyChange();
}
function creatorIsFavorited(name) {
	return Boolean(read$1().creatorFavorites?.[creatorKey(name)]);
}
function toggleCreatorFavorite(name) {
	const key = creatorKey(name);
	if (!key) return;
	const next = read$1(), favorites = next.creatorFavorites ??= {};
	if (favorites[key]) delete favorites[key];
	else favorites[key] = true;
	write(next);
	notifyChange();
}
function creatorIsLiked(name) {
	return Boolean(read$1().creatorLikes[creatorKey(name)]);
}
function toggleCreatorLike(name) {
	const next = read$1();
	const key = creatorKey(name);
	if (next.creatorLikes[key]) delete next.creatorLikes[key];
	else next.creatorLikes[key] = true;
	write(next);
	notifyChange();
}
function tagKey(tag) {
	return tag.trim().toLowerCase();
}
function tagIsLiked(tag) {
	return Boolean(read$1().tagLikes[tagKey(tag)]);
}
function tagHasHeartHistory(tag) {
	return Boolean(read$1().tagHeartHistory[tagKey(tag)]);
}
function getHeartedTagHistory() {
	return Object.keys(read$1().tagHeartHistory).sort((a, b) => (read$1().tagHeartHistory[b] ?? 0) - (read$1().tagHeartHistory[a] ?? 0));
}
function toggleTagLike(tag) {
	const next = read$1();
	const key = tagKey(tag);
	if (next.tagLikes[key]) delete next.tagLikes[key];
	else {
		next.tagLikes[key] = true;
		next.tagHeartHistory[key] ??= Date.now();
	}
	write(next);
	notifyChange();
}
/** Versioned rating/note payload used by the full library backup. */
function exportFeedback() {
	return {
		version: 5,
		...read$1()
	};
}
function getNote(id) {
	const value = read$1().notes[id];
	if (typeof value === "string") return value;
	try {
		return localStorage.getItem(`reelcase.note.${id}`) ?? "";
	} catch {
		return "";
	}
}
function setNote(id, note) {
	const next = read$1();
	if (note.trim()) next.notes[id] = note.trim();
	else delete next.notes[id];
	write(next);
}
/** Merge an imported feedback payload without wiping unrelated keys. */
function importFeedback(partial) {
	const next = read$1();
	if (partial.recommendationRejections) {
		const imported = normalizeRejections(partial.recommendationRejections);
		if (isRejectionLedger(partial.recommendationRejections)) next.recommendationRejections = {
			...imported,
			updatedAt: Math.max(Date.now(), (next.recommendationRejections?.updatedAt ?? 0) + 1)
		};
	}
	if (partial.ratings) Object.assign(next.ratings, partial.ratings);
	if (partial.ratingHistory) Object.assign(next.ratingHistory, partial.ratingHistory);
	if (partial.notes) Object.assign(next.notes, partial.notes);
	if (partial.creatorRatings) Object.assign(next.creatorRatings, partial.creatorRatings);
	if (partial.creatorLikes) Object.assign(next.creatorLikes, partial.creatorLikes);
	if (partial.creatorFavorites) Object.assign(next.creatorFavorites ??= {}, partial.creatorFavorites);
	if (partial.tagLikes) Object.assign(next.tagLikes, partial.tagLikes);
	if (partial.tagHeartHistory) Object.assign(next.tagHeartHistory, partial.tagHeartHistory);
	if (partial.watchTime) Object.assign(next.watchTime, partial.watchTime);
	write(next);
	notifyChange();
	flush$1();
}
/** Reuses the feedback mirror and coalesced durable save; never enters shared room state. */
function getRecommendationRejections() {
	return read$1().recommendationRejections ?? EMPTY_REJECTIONS;
}
function setRecommendationRejection(entry, remove = false) {
	const current = getRecommendationRejections(), changed = changeRejection(current, entry, remove);
	if (changed === current) return;
	write({
		...read$1(),
		recommendationRejections: changed
	});
	notifyChange();
}
var topicHeartRevision = -1;
var topicHeartAliasRevision = -1;
var topicHearts = /* @__PURE__ */ new Set();
function recommendationTopicIsLiked(topic) {
	read$1();
	if (topicHeartRevision !== signalVersion || topicHeartAliasRevision !== getTopicAliasRevision()) {
		topicHearts = new Set(Object.keys(read$1().tagLikes).map(canonicalTopic).filter((value) => Boolean(value)));
		topicHeartRevision = signalVersion;
		topicHeartAliasRevision = getTopicAliasRevision();
	}
	return topicHearts.has(topic);
}
var KEY$2 = "reelcase.adult-archive-cursors.v1";
function readRaw() {
	try {
		const raw = localStorage.getItem(KEY$2);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
function writeRaw(map) {
	try {
		localStorage.setItem(KEY$2, JSON.stringify(map));
	} catch {}
}
function slotKey(provider, query, order) {
	return `${provider}::${query.trim().toLowerCase() || "all"}::${order}`;
}
/** Load next-page cursors for the active query/order across providers. */
function loadAdultArchiveCursors(query, order) {
	const raw = readRaw();
	const out = {};
	for (const provider of ADULT_PULL_PROVIDERS) {
		const row = raw[slotKey(provider, query, order)];
		if (row && typeof row.page === "number" && row.page >= 1) out[provider] = row;
	}
	return out;
}
/** Persist the next page each provider should resume from. */
function saveAdultArchiveCursors(query, order, pages, offsets = {}) {
	const raw = readRaw();
	const now = Date.now();
	for (const provider of ADULT_PULL_PROVIDERS) {
		if (!Object.prototype.hasOwnProperty.call(pages, provider)) continue;
		const next = pages[provider];
		const key = slotKey(provider, query, order);
		if (next == null || next < 1) {
			raw[key] = {
				page: 1,
				offset: 0,
				query,
				order,
				retryAt: now + 18e5,
				updatedAt: now
			};
			continue;
		}
		raw[key] = {
			page: next,
			offset: offsets[provider] ?? 0,
			query: query.trim().toLowerCase() || "all",
			order,
			updatedAt: now
		};
	}
	writeRaw(raw);
}
function recordAdultArchiveFailure(query, order, provider) {
	const raw = readRaw(), key = slotKey(provider, query, order), now = Date.now();
	raw[key] = {
		...raw[key] ?? {
			page: 1,
			query,
			order
		},
		updatedAt: now,
		retryAt: now + 3e5
	};
	writeRaw(raw);
}
/** Summarize how deep the archive resume points go for UI copy. */
function adultArchiveDepthLabel(cursors) {
	const rows = Object.entries(cursors);
	if (!rows.length) return "No saved archive depth yet — Pull catalog starts at page 1.";
	return `Resume cursors · ${rows.sort((a, b) => a[0].localeCompare(b[0])).map(([provider, row]) => `${provider}→p${row.page}${row.offset ? `+${row.offset}` : ""}`).join(" · ")}`;
}
function prepareYoutubeTagReview(video, tags, provenance, base, selected, now = Date.now()) {
	if (!video || video.remote?.kind !== "youtube" || video.remote.live || video.remote.youtubeType === "upcoming") throw Error("Review tags on a saved video after the stream ends.");
	if (provenance?.lockedFields?.includes("tags")) throw Error("Your tags are locked. Edit them manually or unlock the tag field before accepting suggestions.");
	if (tags !== base.tags || provenance !== base.provenance || video.remote.youtubeTagSummary !== base.summary || video.remote.youtubeTagsCheckedAt !== base.checkedAt) throw Error("Tags or metadata changed during review. Review the updated suggestions again.");
	const summary = video.remote.youtubeTagSummary;
	if (!video.remote.youtubeTagsCheckedAt || summary?.version !== 4 || !summary.scores || !summary.signals || summary.titleHash !== youtubeTagTitleHash(video.name)) throw Error("Pull this video’s tags first to prepare current confidence evidence.");
	const wanted = [...new Set(selected)].slice(0, 28), keys = Object.keys(summary.sources), existing = tags ?? [];
	if (!wanted.length) throw Error("Select at least one suggestion.");
	if (wanted.some((tag) => !keys.includes(tag))) throw Error("A selected suggestion is no longer available. Review again.");
	const next = [.../* @__PURE__ */ new Set([...existing, ...wanted])];
	if (next.length > Math.max(32, existing.length)) throw Error("This video has reached its tag limit. Remove a tag before adding more.");
	const sources = { ...provenance?.tags }, reviews = {};
	for (const tag of existing.slice(0, 32)) {
		const row = provenance?.youtubeReviews?.[tag];
		if (row) reviews[tag] = row;
	}
	let reviewed = 0;
	for (const tag of wanted) {
		if (sources[tag] === "manual" || sources[tag] === "youtube-review" || existing.includes(tag) && !sources[tag]) continue;
		const i = keys.indexOf(tag), score = summary.scores[i], signals = summary.signals[i];
		if (!Number.isFinite(score) || !Number.isSafeInteger(signals) || score < 0 || score > 100 || signals <= 0 || signals > 31) throw Error("Suggestion evidence is invalid. Pull this video’s metadata again.");
		sources[tag] = "youtube-review";
		reviews[tag] = {
			version: 1,
			score,
			signals,
			at: now
		};
		reviewed++;
	}
	return {
		tags: next,
		reviewed,
		provenance: {
			...provenance,
			tags: sources,
			youtubeReviews: Object.fromEntries(Object.entries(reviews).sort((a, b) => b[1].at - a[1].at).slice(0, 32)),
			updatedAt: now
		}
	};
}
/** One selected public video only; bounded evidence export is not a restorable library backup. */
function youtubeTagConfidenceReport(video, provenance) {
	const data = youtubeTextTags(video);
	return {
		version: 1,
		policyVersion: 1,
		videoId: video.remote?.videoId,
		title: video.name.slice(0, 500),
		checkedAt: video.remote?.youtubeTagsCheckedAt ?? null,
		suggestions: data.tags.map((tag, i) => ({
			tag,
			score: data.scores[i] ?? 0,
			signals: data.signals[i] ?? 0,
			automatic: (data.scores[i] ?? 0) >= 80,
			evidence: youtubeTagEvidence(video, tag),
			accepted: provenance?.tags[tag] === "youtube-review" ? provenance.youtubeReviews?.[tag] ?? null : null
		})),
		note: "Evidence strength, not a probability. Snapshot for review; saved tag edits are managed by the library."
	};
}
var started = false;
var pending$1;
var status$1 = "saved";
var attempt$1 = 0;
function notify$2() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event("reelcase:topic-alias-change"));
		window.dispatchEvent(new Event("reelcase:rating-change"));
	}
}
function ensureTopicAliases() {
	if (started || typeof window === "undefined") return;
	started = true;
	installTopicAliases(loadTopicAliasesSync());
}
function hydrateTopicAliases() {
	ensureTopicAliases();
	if (typeof window === "undefined") return Promise.resolve();
	return pending$1 ??= restoreTopicAliases().then((saved) => {
		if (installTopicAliases(newestTopicAliases(saved, getTopicAliases())).length) notify$2();
	}).catch(() => {
		pending$1 = void 0;
	});
}
function save() {
	const current = ++attempt$1;
	status$1 = "pending";
	saveTopicAliases(getTopicAliases()).then((ok) => {
		if (current !== attempt$1) return;
		status$1 = ok ? "saved" : "failed";
		if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:topic-alias-save"));
	}, () => {
		if (current !== attempt$1) return;
		status$1 = "failed";
		if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:topic-alias-save"));
	});
}
function reviewTopicAlias(entry, remove = false) {
	ensureTopicAliases();
	const next = changeTopicAlias(getTopicAliases(), entry, remove);
	if (next === getTopicAliases()) return;
	installTopicAliases(next);
	save();
	notify$2();
}
function retryTopicAliasSave() {
	save();
}
var topicAliasSaveStatus = () => status$1;
function importTopicAliases(raw) {
	if (!isTopicAliasLedger(raw)) return;
	ensureTopicAliases();
	const current = getTopicAliases(), parsed = normalizeTopicAliases(raw);
	installTopicAliases({
		...parsed,
		updatedAt: Math.max(Date.now(), current.updatedAt + 1)
	});
	save();
	notify$2();
}
ensureTopicAliases();
var ledger;
var revision$1 = 0;
var hydrating;
var timer$1;
var cancelWork;
var dirty$1 = false;
var attempt = 0;
var status = "saved";
var pending = /* @__PURE__ */ new Map();
function notify$1() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:exposure-change"));
}
function read() {
	return ledger ??= typeof window === "undefined" ? EMPTY_EXPOSURE : normalizeExposure(loadRecommendationExposureSync());
}
function hydrateRecommendationExposure() {
	if (typeof window === "undefined") return Promise.resolve();
	return hydrating ??= restoreRecommendationExposure().then((saved) => {
		const current = read();
		ledger = newestExposure(saved, current);
		if (JSON.stringify(ledger) !== JSON.stringify(current)) {
			revision$1++;
			notify$1();
			refreshExposureRecommendations();
		}
	}).catch(() => {
		hydrating = void 0;
	});
}
function getRecommendationExposure() {
	read();
	if (pending.size) {
		ledger = applyExposureEvents(ledger, [...pending].map(([key, at]) => ({
			key,
			at
		})));
		pending.clear();
	}
	return ledger;
}
var getExposureRevision = () => revision$1;
function exposureDiagnostics() {
	return {
		entries: getRecommendationExposure().entries.length,
		pending: pending.size,
		status
	};
}
function queue() {
	dirty$1 = true;
	attempt++;
	status = "pending";
	if (timer$1 !== void 0 || cancelWork) return;
	timer$1 = setTimeout(() => {
		timer$1 = void 0;
		cancelWork = scheduleBackgroundWork(() => {
			cancelWork = void 0;
			flushRecommendationExposure();
		}, { timeoutMs: 1e4 });
	}, 5e3);
}
function recordRecommendationExposure(key, now = Date.now()) {
	if (!key || key.length > 500 || pending.has(key) || pending.size >= 256) return;
	const previous = read().entries.find((row) => row.key === key);
	if (previous && now - previous.at < 18e5) return;
	pending.set(key, now);
	revision$1++;
	queue();
}
function flushRecommendationExposure() {
	if (timer$1 !== void 0) clearTimeout(timer$1);
	timer$1 = void 0;
	cancelWork?.();
	cancelWork = void 0;
	if (!dirty$1) return;
	dirty$1 = false;
	const value = getRecommendationExposure(), current = ++attempt;
	saveRecommendationExposure(value).then((ok) => {
		if (current !== attempt) return;
		status = ok ? "saved" : "failed";
		notify$1();
	}, () => {
		if (current !== attempt) return;
		status = "failed";
		notify$1();
	});
}
function retryRecommendationExposure() {
	dirty$1 = true;
	flushRecommendationExposure();
}
function markRecommendationOpened(video) {
	const current = getRecommendationExposure(), key = exposureKey(video);
	if (!current.entries.some((row) => row.key === key)) return;
	ledger = clearExposure(current, key);
	revision$1++;
	queue();
}
function resetRecommendationExposure() {
	ledger = clearExposure(getRecommendationExposure());
	pending.clear();
	revision$1++;
	queue();
	flushRecommendationExposure();
	refreshExposureRecommendations();
	notify$1();
}
function importRecommendationExposure(raw) {
	if (!isExposureLedger(raw)) return;
	ledger = {
		...normalizeExposure(raw),
		updatedAt: Math.max(Date.now(), getRecommendationExposure().updatedAt + 1)
	};
	pending.clear();
	revision$1++;
	queue();
	flushRecommendationExposure();
	refreshExposureRecommendations();
	notify$1();
}
function refreshExposureRecommendations() {
	if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:rating-change"));
}
if (typeof window !== "undefined") {
	const hide = () => {
		if (document.visibilityState === "hidden") flushRecommendationExposure();
	};
	window.addEventListener("pagehide", flushRecommendationExposure);
	document.addEventListener("visibilitychange", hide);
}
/** Volatile, bounded observations for one sweep. No storage, provider work or timers. */
function createYoutubeLiveThroughput(ids, startedAt) {
	const expected = new Set(ids), attempted = /* @__PURE__ */ new Set();
	let successful = 0, successfulBatches = 0, lastSuccessAt;
	let samples = [{
		at: startedAt,
		successful: 0,
		attempted: 0
	}];
	return {
		record(batch, accepted, at) {
			const valid = new Set(accepted);
			let count = 0, success = 0;
			for (const id of batch) if (expected.has(id) && !attempted.has(id)) {
				attempted.add(id);
				count++;
				if (valid.has(id)) success++;
			}
			if (!count) return;
			successful += success;
			if (success) {
				lastSuccessAt = at;
				successfulBatches++;
			}
			samples = [...samples, {
				at: Math.max(at, samples.at(-1).at),
				successful,
				attempted: attempted.size
			}];
			while (samples.length > 33 || samples.length > 2 && samples[1].at < at - 6e4) samples.shift();
		},
		snapshot() {
			return {
				samples: [...samples],
				lastSuccessAt,
				successfulBatches
			};
		}
	};
}
function youtubeLiveEstimate(window, ready, running, retryAt, now = Date.now()) {
	if (retryAt > now) return { state: "waiting" };
	if (!ready) return { state: "clear" };
	if (!running) return { state: "idle" };
	if (!window || !window.lastSuccessAt) return { state: "warming" };
	if (now - window.lastSuccessAt > 3e4) return { state: "stalled" };
	const samples = window.samples, first = samples[0], last = samples.at(-1);
	if (!first || !last) return { state: "warming" };
	const span = last.at - first.at, success = last.successful - first.successful, attempted = last.attempted - first.attempted;
	const recent = samples.slice(-3);
	if (recent.length === 3 && recent[0].successful === recent[2].successful) return { state: "stalled" };
	if (span < 1e3 || success < 8 || window.successfulBatches < 2 || attempted < success || success / Math.max(1, attempted) < .5) return { state: "warming" };
	const rate = success / (span / 1e3);
	return {
		state: "active",
		perMinute: Math.round(rate * 60),
		minSeconds: Math.max(1, Math.ceil(ready / rate * .75)),
		maxSeconds: Math.max(1, Math.ceil(ready / rate * 1.5))
	};
}
/** Legacy cards may predate the compact follow-level broadcast ledger. A
* watch-only result is complete only for the identities actually sent. */
function reconcileYoutubeKnownBroadcasts(incoming, sent, savedIds, observedIds, checked) {
	if (incoming.kind !== "youtube" || !incoming.youtubeLiveEvidence) return {
		channel: incoming,
		checked,
		success: true
	};
	const known = [...new Set([
		...incoming.youtubeLiveVideoIds ?? [],
		...savedIds,
		...observedIds
	].filter((id) => /^[A-Za-z0-9_-]{11}$/.test(id)))];
	let channel = {
		...incoming,
		youtubeLiveVideoIds: known.slice(0, 64),
		youtubeLiveKnownOverflow: known.length > 64 || incoming.youtubeLiveKnownOverflow || void 0
	};
	if (checked && channel.youtubeLiveEvidence.source === "watch") {
		const covered = /* @__PURE__ */ new Set([...sent?.youtubeLiveVideoIds ?? [], ...observedIds]);
		if (sent?.youtubeLiveKnownOverflow || savedIds.some((id) => !covered.has(id))) {
			const at = channel.youtubeLiveEvidence.at;
			channel = {
				...channel,
				live: observedIds.length > 0 || sent?.live,
				youtubeLiveEvidence: {
					...channel.youtubeLiveEvidence,
					complete: false,
					state: observedIds.length ? "live" : "unknown",
					reason: "partial-streams"
				},
				...observedIds.length ? {} : {
					lastLiveFailure: youtubeLiveFailure(sent ?? channel, {
						at,
						kind: "unavailable",
						message: "Some saved broadcasts were outside this exact check. Their prior live status was kept.",
						recovery: ""
					}),
					liveCheckedAt: sent?.liveCheckedAt
				}
			};
			return {
				channel,
				checked: false,
				success: observedIds.length > 0
			};
		}
	}
	return {
		channel,
		checked,
		success: true
	};
}
var TWITCH_QUICK_LIVE = {
	requestChannels: 100,
	firstRequestChannels: 100,
	activeSweep: 600,
	quietSweep: 100,
	tickMs: 2e3,
	knownLiveMs: 6e4,
	discoveryMs: 18e4
};
/** Known-live deadlines and oldest-first discovery share each batch. */
function selectTwitchQuickLiveChannels(channels, limit, scheduled = false, now = Date.now()) {
	if (!scheduled) return selectLiveRefreshChannels(channels, "twitch", channels.length, now).slice(0, Math.max(0, limit));
	return selectDueLiveRefreshChannels(channels, "twitch", limit, TWITCH_QUICK_LIVE.knownLiveMs, TWITCH_QUICK_LIVE.discoveryMs, now);
}
/** Bounded look-ahead: completed responses occupy their slot until consumed.
* Select new work at each consumption so current retry/due rules still apply. */
function createCompletionQueue(options) {
	const controller = new AbortController();
	const pending = /* @__PURE__ */ new Map();
	const ready = [];
	let sequence = 0, closed = false;
	const fill = () => {
		while (!closed && pending.size < Math.max(1, Math.min(3, options.concurrency))) {
			const item = options.take();
			if (item === void 0) break;
			const id = sequence++;
			const task = Promise.resolve().then(() => options.request(item, controller.signal)).then((value) => ({
				id,
				result: {
					item,
					ok: true,
					value
				}
			}), (error) => ({
				id,
				result: {
					item,
					ok: false,
					error
				}
			}));
			pending.set(id, task);
			task.then((result) => {
				if (!closed) ready.push(result);
			});
		}
	};
	return {
		async next() {
			fill();
			if (!pending.size || closed) return;
			if (!ready.length) await Promise.race(pending.values());
			if (closed) return;
			const completed = ready.shift();
			pending.delete(completed.id);
			return completed.result;
		},
		takeReady(accept) {
			const completed = ready[0];
			if (!completed || !accept(completed.result)) return;
			ready.shift();
			pending.delete(completed.id);
			return completed.result;
		},
		close() {
			closed = true;
			controller.abort(/* @__PURE__ */ new Error("Live check pipeline closed."));
			pending.clear();
			ready.length = 0;
		}
	};
}
/** Coalesce responses already received, without waiting for a slower batch.
* This bounds catalog reconciliation and follow notifications to 24 creators. */
function mergeYoutubeLiveResults(left, right) {
	const providerRetryAt = Math.max(left.providerRetryAt ?? 0, right.providerRetryAt ?? 0) || void 0;
	const providerCooldownScope = left.providerCooldownScope === "all" || right.providerCooldownScope === "all" ? "all" : (right.providerRetryAt ?? 0) > (left.providerRetryAt ?? 0) ? right.providerCooldownScope : left.providerCooldownScope;
	return {
		channels: [...left.channels, ...right.channels],
		videos: [...left.videos, ...right.videos],
		refreshedIds: [...left.refreshedIds, ...right.refreshedIds],
		liveCheckedIds: [...left.liveCheckedIds ?? left.refreshedIds, ...right.liveCheckedIds ?? right.refreshedIds],
		retryAt: {
			...left.retryAt,
			...right.retryAt
		},
		providerRetryAt,
		providerCooldownScope
	};
}
var emptyImportReview = () => ({
	version: 1,
	choices: {},
	failures: {},
	filter: "",
	status: "all"
});
function cleanImportReview(value, activeKeys) {
	if (!value || typeof value !== "object" || value.version !== 1) return;
	const v = value, result = emptyImportReview();
	let choiceBytes = 0;
	for (const [key, choice] of Object.entries(v.choices ?? {}).filter(([key]) => !activeKeys || activeKeys.has(key)).slice(0, 1e4)) if (key.length <= 1e3 && (choice === "include" || choice === "skip" || choice === "failed") && (choiceBytes += key.length * 2 + 16) <= 2097152) Object.defineProperty(result.choices, key, {
		value: choice,
		enumerable: true,
		writable: true,
		configurable: true
	});
	for (const [key, reason] of Object.entries(v.failures ?? {}).slice(-128)) if (key.length <= 1e3 && typeof reason === "string") Object.defineProperty(result.failures, key, {
		value: reason.slice(0, 300),
		enumerable: true,
		writable: true,
		configurable: true
	});
	result.filter = typeof v.filter === "string" ? v.filter.slice(0, 200) : "";
	if ([
		"all",
		"ready",
		"held",
		"excluded",
		"saved",
		"failed"
	].includes(v.status)) result.status = v.status;
	if (typeof v.focusKey === "string" && v.focusKey.length <= 1e3) result.focusKey = v.focusKey;
	return result;
}
function importReviewRow(kind, query, state, resolved) {
	const key = canonicalFollowHandle(kind, query), saved = resolved.has(key);
	const exact = kind === "twitch" || /^(?:@|https?:\/\/|(?:www\.)?youtube\.com\/|UC[\w-]{22}$)/i.test(query);
	const choice = Object.hasOwn(state.choices, key) ? state.choices[key] : void 0, reason = Object.hasOwn(state.failures, key) && typeof state.failures[key] === "string" ? state.failures[key] : void 0;
	const included = !saved && (choice === "include" || choice === "failed" || !choice && exact);
	return {
		key,
		query,
		included,
		status: saved ? "saved" : choice === "skip" ? "excluded" : reason || choice === "failed" ? "failed" : included ? "ready" : "held",
		reason
	};
}
function reviewedImportBatch(kind, queries, state, resolved, failed = false) {
	const rows = [];
	for (const query of queries) {
		const row = importReviewRow(kind, query, state, resolved);
		if (row.included && row.status === (failed ? "failed" : "ready")) rows.push({
			query,
			kind
		});
		if (rows.length === 50) break;
	}
	return rows;
}
function importReviewWindow(length, scrollTop, height = 448) {
	const rowHeight = 112, first = Math.max(0, Math.floor(scrollTop / rowHeight) - 3);
	const start = Math.min(first, Math.max(0, length - 1));
	return {
		start,
		end: Math.min(length, start + Math.ceil(height / rowHeight) + 6),
		rowHeight
	};
}
var importSessionKey = (kind) => `imports:v1:${kind}`;
function emptyImportSession(kind) {
	return {
		version: 1,
		kind,
		draft: "",
		query: "",
		profile: "",
		saved: [],
		updatedAt: 0
	};
}
function importSessionEntries(kind, values) {
	const seen = /* @__PURE__ */ new Set(), result = [];
	for (const value of values) {
		if (typeof value !== "string" || !value.trim() || value.length > 1e3) continue;
		const key = canonicalFollowHandle(kind, value);
		if (!key || seen.has(key)) continue;
		seen.add(key);
		result.push(value.trim());
		if (result.length === 1e4) break;
	}
	return result;
}
function cleanImportSession(value, kind) {
	if (!value || typeof value !== "object") return;
	const row = value;
	if (row.version !== 1 || row.kind !== kind || typeof row.draft !== "string" || typeof row.query !== "string" || typeof row.profile !== "string" || !Array.isArray(row.saved) || typeof row.updatedAt !== "number" || !Number.isFinite(row.updatedAt) || row.updatedAt < 0) return;
	return {
		version: 1,
		kind,
		draft: row.draft.slice(0, 5e5),
		query: row.query.slice(0, 2e4),
		profile: row.profile.slice(0, 200),
		saved: importSessionEntries(kind, row.saved),
		...cleanImportReview(row.review) ? { review: cleanImportReview(row.review) } : {},
		updatedAt: row.updatedAt
	};
}
function mergeImportSessions(local, disk) {
	if (!disk) return local;
	const newest = disk.updatedAt > local.updatedAt ? disk : local, other = newest === disk ? local : disk;
	return {
		...newest,
		saved: importSessionEntries(local.kind, [...newest.saved, ...other.saved])
	};
}
var memory = /* @__PURE__ */ new Map();
var writer = new CoalescedWriter((rows) => saveWorkspaceDocuments(rows.map(([key, value]) => ({
	key,
	value
}))));
function readLocalImportSession(kind) {
	const cached = memory.get(kind);
	if (cached) return cached;
	const value = emptyImportSession(kind);
	if (typeof localStorage === "undefined") return value;
	try {
		value.review = JSON.parse(localStorage.getItem(`reelcase.import-review.${kind}`) ?? "null");
		value.draft = (localStorage.getItem(`reelcase.import-draft.${kind}`) ?? "").slice(0, 5e5);
		value.query = (localStorage.getItem(`reelcase.import-query.${kind}`) ?? "").slice(0, 2e4);
		value.profile = (localStorage.getItem(`reelcase.import-profile.${kind}`) ?? "").slice(0, 200);
		const saved = JSON.parse(localStorage.getItem(`reelcase.import-history.${kind}`) ?? "[]");
		value.saved = Array.isArray(saved) ? saved : [];
		value.updatedAt = Number(localStorage.getItem(`reelcase.import-updated.${kind}`)) || 0;
	} catch {}
	return cleanImportSession(value, kind) ?? emptyImportSession(kind);
}
function stageImportSession(value) {
	memory.set(value.kind, value);
}
async function saveImportSession(value) {
	stageImportSession(value);
	let mirror = true;
	for (const [field, text] of [
		["draft", value.draft],
		["query", value.query],
		["profile", value.profile],
		["history", JSON.stringify(value.saved)],
		["review", JSON.stringify(value.review ?? null)]
	]) try {
		const key = `reelcase.import-${field}.${value.kind}`;
		if (localStorage.getItem(key) !== text) localStorage.setItem(key, text);
	} catch {
		mirror = false;
	}
	if (mirror) try {
		localStorage.setItem(`reelcase.import-updated.${value.kind}`, String(value.updatedAt));
	} catch {
		mirror = false;
	}
	try {
		await writer.write(importSessionKey(value.kind), value);
		return {
			disk: true,
			mirror
		};
	} catch {
		if (!mirror) throw Error("This browser could not save the list. Keep this page open or copy your list before leaving.");
		return {
			disk: false,
			mirror
		};
	}
}
async function loadImportSession(kind) {
	const local = readLocalImportSession(kind);
	let disk;
	try {
		disk = cleanImportSession(await readWorkspaceDocument(importSessionKey(kind)), kind);
	} catch {}
	const result = mergeImportSessions(memory.get(kind) ?? local, disk);
	stageImportSession(result);
	return result;
}
/** A bounded refresh keeps catalog positions stable and appends new rows.
* Cooperatively compare references, then replace only changed shelf cards.
* Reorders, date corrections and large imports use the full stable rebuild. */
async function updateYoutubeShelfAsync(previous, next, ordered, visible, signal, yieldTask = yieldCatalogTask) {
	const turn = async () => {
		signal?.throwIfAborted();
		await yieldTask();
		signal?.throwIfAborted();
	};
	signal?.throwIfAborted();
	if (next === previous) return ordered;
	if (next.length < previous.length) return;
	const removed = /* @__PURE__ */ new Set(), replacements = /* @__PURE__ */ new Map();
	let added = [], changes = 0, rebuild = false;
	await forEachCatalogSlice(next, (after, index) => {
		if (rebuild) return;
		const before = previous[index];
		if (before === after || before?.remote?.kind !== "youtube" && after.remote?.kind !== "youtube") return;
		if (++changes > 4096 || before && before.id !== after.id) {
			rebuild = true;
			return;
		}
		const wasVisible = before?.remote?.kind === "youtube" && visible(before);
		const isVisible = after.remote?.kind === "youtube" && visible(after);
		if (wasVisible && isVisible && youtubePublicationTime(before) === youtubePublicationTime(after)) replacements.set(before, after);
		else {
			if (isVisible && before) {
				rebuild = true;
				return;
			}
			if (wasVisible) removed.add(before);
			if (isVisible) added.push(after);
		}
	}, turn, 16384);
	if (rebuild) return;
	if (!removed.size && !replacements.size && !added.length) return ordered;
	if (added.length > 1) added = await sortCatalogRows(added, compareYoutubePublication, turn);
	const result = [];
	let incoming = 0;
	await forEachCatalogSlice(ordered, (video) => {
		if (removed.has(video)) return;
		while (incoming < added.length && compareYoutubePublication(added[incoming], video) < 0) result.push(added[incoming++]);
		result.push(replacements.get(video) ?? video);
	}, turn, 16384);
	for (; incoming < added.length; incoming++) result.push(added[incoming]);
	signal?.throwIfAborted();
	return result;
}
/** Provider refreshes replace a few cards in a large immutable catalog. Sort
* only those changed cards and merge them into the already ordered shelf. */
function updateYoutubeShelf(previous, next, ordered, visible) {
	if (next.length < previous.length) return void 0;
	const removed = /* @__PURE__ */ new Set(), replacements = /* @__PURE__ */ new Map(), added = [];
	let changes = 0;
	for (let i = 0; i < next.length; i++) {
		const before = previous[i], after = next[i];
		if (before === after) continue;
		if (before?.remote?.kind !== "youtube" && after.remote?.kind !== "youtube") continue;
		if (++changes > 4096) return void 0;
		const wasVisible = before?.remote?.kind === "youtube" && visible(before);
		const isVisible = after.remote?.kind === "youtube" && visible(after);
		if (wasVisible && isVisible && youtubePublicationTime(before) === youtubePublicationTime(after)) replacements.set(before, after);
		else {
			if (before?.remote?.kind === "youtube") removed.add(before);
			if (isVisible) added.push(after);
		}
	}
	if (!removed.size && !replacements.size && !added.length) return ordered;
	added.sort(compareYoutubePublication);
	const result = [];
	let incoming = 0;
	for (const video of ordered) {
		if (removed.has(video)) continue;
		while (incoming < added.length && compareYoutubePublication(added[incoming], video) < 0) result.push(added[incoming++]);
		result.push(replacements.get(video) ?? video);
	}
	for (; incoming < added.length; incoming++) result.push(added[incoming]);
	return result;
}
/** Cache each scope independently using immutable store slices, not root state.
* Playback and UI updates must not invalidate catalog-sized computations. */
function memoizeSelector(compute, keys) {
	const inputsFor = (state) => {
		return (typeof keys === "function" ? keys(state) : keys).flatMap((key) => [key, state[key]]);
	};
	return memoizeSelectorInputs(compute, inputsFor);
}
/** Derived immutable inputs can ignore status-only changes to a large slice. */
function memoizeSelectorInputs(compute, inputsFor) {
	const scopes = /* @__PURE__ */ new Map();
	const peek = (state, adult = false) => {
		const inputs = inputsFor(state);
		const cached = scopes.get(adult);
		if (cached && inputs.length === cached.inputs.length && inputs.every((value, index) => Object.is(value, cached.inputs[index]))) {
			cacheMetrics.record("catalog-selectors", "hit");
			return cached.result;
		}
		cacheMetrics.record("catalog-selectors", "miss");
	};
	const select = (state, adult = false) => {
		const cached = peek(state, adult);
		if (cached !== void 0) return cached;
		const result = compute(state, adult);
		scopes.set(adult, {
			inputs: inputsFor(state),
			result
		});
		return result;
	};
	const evictStale = (state) => {
		const inputs = inputsFor(state);
		for (const [scope, cached] of scopes) if (inputs.length !== cached.inputs.length || inputs.some((value, index) => !Object.is(value, cached.inputs[index]))) scopes.delete(scope);
	};
	const prime = (state, result, adult = false) => {
		scopes.set(adult, {
			inputs: inputsFor(state),
			result
		});
	};
	const clear = (adult) => {
		if (adult === void 0) scopes.clear();
		else scopes.delete(adult);
	};
	return Object.assign(select, {
		peek,
		prime,
		clear,
		evictStale
	});
}
/** These workspaces own their content instead of rendering the video grid. */
var HUB_SOURCES = /* @__PURE__ */ new Set([
	"stable-diffusion",
	"remote-desktop",
	"photos",
	"anime",
	"spotify",
	"prints",
	"games",
	"shop",
	"streaming",
	"social",
	"watch-room",
	"stream-signal",
	"settings",
	"stats",
	"genres",
	"assistant",
	"mission-plan",
	"connection",
	"find-phone"
]);
/** An explicit search submitted from a tool needs a visible result desk.
* Provider/local scopes and the private tag desk keep their existing scope. */
function searchResultSource(source) {
	return HUB_SOURCES.has(source) ? "home" : source;
}
var SOURCE_LABELS = {
	"stable-diffusion": "Stable Diffusion",
	"remote-desktop": "Remote desktop",
	home: "Home",
	landing: "Landing page",
	movies: "Movies",
	youtube: "YouTube",
	twitch: "Twitch",
	live: "Live",
	continue: "Continue watching",
	history: "History",
	favorites: "Favorites",
	adults: "Adults",
	"adult-fetishes": "Private topics",
	photos: "Photos",
	anime: "Anime",
	spotify: "Spotify",
	prints: "Prints",
	games: "Games",
	shop: "Shop",
	streaming: "Streaming",
	social: "Social",
	"watch-room": "Watch Room",
	"stream-signal": "Stream Signal",
	settings: "Settings",
	stats: "Stats",
	genres: "Topics",
	assistant: "Assistant",
	"mission-plan": "Milestones",
	connection: "Connection",
	"find-phone": "Find phone",
	classics: "Classics",
	all: "All titles",
	demo: "Demo library"
};
function navigationSourceLabel(source, folders) {
	return SOURCE_LABELS[source] ?? folders.find((folder) => folder.id === source)?.name ?? "Library";
}
async function youtubeCatalogSelection(input, signal, yieldTask = yieldCatalogTask) {
	const turn = async () => {
		signal?.throwIfAborted();
		await yieldTask();
		signal?.throwIfAborted();
	};
	const dated = [], undated = [];
	let dayOverrides;
	await forEachCatalogSlice(input.videos, (video) => {
		if (video.remote?.kind === "youtube" && !input.unavailable[video.id] && !input.hiddenVideos[video.id] && !videoIsPrivate(input.privateFolders, video) && !(input.hideDemo && video.isSample)) {
			const published = youtubePublicationTime(video);
			if (published && published !== video.addedAt) {
				dayOverrides ??= /* @__PURE__ */ new WeakMap();
				dayOverrides.set(video, published);
			}
			(published ? dated : undated).push(video);
		}
	}, turn, 4096);
	const stableUndated = await sortCatalogRows(undated, youtubePublicationIdentityOrder, turn, 16384);
	if (!dated.length) {
		signal?.throwIfAborted();
		return stableUndated;
	}
	const result = await sortCatalogRows(dated, (a, b) => (dayOverrides ? (dayOverrides.get(b) ?? b.addedAt) - (dayOverrides.get(a) ?? a.addedAt) : b.addedAt - a.addedAt) || youtubePublicationIdentityOrder(a, b), turn, 16384);
	await forEachCatalogSlice(stableUndated, (video) => {
		result.push(video);
	}, turn, 16384);
	signal?.throwIfAborted();
	return result;
}
/** A large user pull consists of bounded requests, never one huge response.
* Collect once per provider so each page doesn't rebuild the entire library. */
async function walkAdultPull(target, page, offset, request, check, options = {}) {
	const rows = /* @__PURE__ */ new Map();
	const updates = /* @__PURE__ */ new Map();
	const refreshLimit = Math.max(0, Math.min(400, options.refreshLimit ?? 0));
	let latest, error;
	const visited = /* @__PURE__ */ new Set(), started = Date.now();
	let requests = 0, duplicates = 0;
	const maxRequests = Math.min(100, options.maxRequests ?? Math.max(8, Math.ceil(target / 100) * 2));
	for (let attempt = 0; attempt < maxRequests && rows.size < target; attempt++) {
		const cursor = `${page}:${offset}`;
		if (visited.has(cursor) || requests > 0 && Date.now() - started >= (options.maxMs ?? Infinity)) break;
		visited.add(cursor);
		await check();
		let result;
		try {
			requests++;
			result = await request(page, offset, Math.min(400, target - rows.size));
		} catch (failure) {
			if (!latest) throw failure;
			error = failure;
			break;
		}
		latest = result;
		for (const row of result.videos) {
			if (options.known?.has(row.id)) {
				duplicates++;
				if (updates.has(row.id) || updates.size < refreshLimit) updates.set(row.id, row);
				continue;
			}
			if (rows.has(row.id)) {
				duplicates++;
				continue;
			}
			if (rows.size < target) rows.set(row.id, row);
		}
		if (result.partial) {
			error = /* @__PURE__ */ new Error("Provider returned a partial page; accepted rows were kept and the unconsumed cursor needs retry.");
			break;
		}
		if (result.nextPage == null || result.nextPage === page && result.nextOffset === offset) break;
		page = result.nextPage;
		offset = result.nextOffset;
	}
	return {
		latest,
		videos: [...rows.values(), ...updates.values()],
		newCount: rows.size,
		refreshedCount: updates.size,
		error,
		requests,
		duplicates
	};
}
/** The review and the store mutation share this calculation so counts match the result. */
function planFollowRemoval(state, requestedIds, feedback = {}) {
	const requested = new Set(requestedIds);
	const channels = state.follows.filter((follow) => requested.has(follow.id)).map((follow) => ({
		follow,
		catalogRows: 0,
		keptRows: 0,
		removedRows: 0
	}));
	const byId = new Map(channels.map((row) => [row.follow.id, row]));
	const historyIds = new Set(state.history.map((entry) => entry.id));
	const legacySavedIds = /* @__PURE__ */ new Set();
	if (typeof localStorage !== "undefined") try {
		for (let index = 0; index < localStorage.length; index += 1) {
			const key = localStorage.key(index);
			if (key?.startsWith("reelcase.rating.") && Number(localStorage.getItem(key)) > 0) legacySavedIds.add(key.slice(16));
			if (key?.startsWith("reelcase.note.") && localStorage.getItem(key)?.trim()) legacySavedIds.add(key.slice(14));
		}
	} catch {}
	const retainedVideoIds = /* @__PURE__ */ new Set();
	const replacementSources = /* @__PURE__ */ new Map();
	const remainingIds = new Set(state.follows.filter((follow) => !requested.has(follow.id)).map((follow) => follow.id));
	const remainingYoutubeChannels = new Map(state.follows.filter((follow) => follow.kind === "youtube" && !follow.id.startsWith("ytpl:") && follow.channelId && remainingIds.has(follow.id)).map((follow) => [follow.channelId, follow.id]));
	let keptRows = 0;
	let removedRows = 0;
	for (const video of state.videos) {
		const channel = byId.get(video.folderId);
		if (!channel) continue;
		channel.catalogRows += 1;
		const replacement = video.remote?.kind === "youtube" ? video.remote.sourceIds?.find((id) => remainingIds.has(id)) ?? remainingYoutubeChannels.get(video.remote.channelId ?? "") : void 0;
		if (replacement) replacementSources.set(video.id, replacement);
		if (Boolean(replacement || state.favorites[video.id] || state.likes[video.id] || historyIds.has(video.id) || (state.progress[video.id]?.t ?? 0) > 0 || (state.resumeProgress[video.id]?.t ?? 0) > 0 || (feedback.ratings?.[video.id] ?? 0) > 0 || Boolean(feedback.notes?.[video.id]?.trim()) || legacySavedIds.has(video.id))) {
			retainedVideoIds.add(video.id);
			channel.keptRows += 1;
			keptRows += 1;
		} else {
			channel.removedRows += 1;
			removedRows += 1;
		}
	}
	return {
		followIds: new Set(channels.map((row) => row.follow.id)),
		channels,
		retainedVideoIds,
		replacementSources,
		keptRows,
		removedRows
	};
}
function retainVideosAfterUnfollow(videos, plan) {
	return videos.flatMap((video) => {
		const sourceIds = video.remote?.sourceIds?.filter((id) => !plan.followIds.has(id));
		const cleaned = sourceIds && sourceIds.length !== video.remote?.sourceIds?.length ? {
			...video,
			remote: {
				...video.remote,
				sourceIds
			}
		} : video;
		if (!plan.followIds.has(video.folderId)) return [cleaned];
		const replacement = plan.replacementSources.get(video.id);
		if (replacement) return [{
			...cleaned,
			folderId: replacement
		}];
		return plan.retainedVideoIds.has(video.id) ? [{
			...cleaned,
			retainedAfterUnfollow: true
		}] : [];
	});
}
/** Durable marker protects locally kept cards before activity stores finish restoring. */
function shouldRestoreRemoteVideo(video, activeFollowIds, favorites, likes, activeYoutubeChannelIds) {
	return activeFollowIds.has(video.folderId) || Boolean(video.remote?.kind === "youtube" && (video.remote.sourceIds?.some((id) => activeFollowIds.has(id)) || activeYoutubeChannelIds?.has(video.remote.channelId ?? ""))) || Boolean(favorites[video.id] || likes[video.id] || video.retainedAfterUnfollow);
}
/** Disk reads are paged; filtering, indexing, merging and resume linking must
* also yield. Nothing here publishes a partial catalog or changes saved data. */
async function prepareCatalogRestore(base, rows, options) {
	const turn = options.turn ?? yieldCatalogTask;
	const followIds = new Set(base.follows.map((channel) => channel.id));
	const youtubeChannels = new Set(base.follows.filter((channel) => channel.kind === "youtube" && !channel.id.startsWith("ytpl:") && channel.channelId).map((channel) => channel.channelId));
	const incoming = [], counts = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(rows, (row) => {
		if (options.remoteOnly && !shouldRestoreRemoteVideo(row, followIds, base.favorites, base.likes, youtubeChannels)) return;
		const video = catalogCard(row);
		incoming.push(video);
	}, turn);
	const videos = await mergeRemoteCatalogAsync(base.videos, incoming, {
		preferExisting: true,
		turn
	});
	await forEachCatalogSlice(videos, (video) => {
		if (!video.isSample) counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1);
	}, turn);
	return {
		videos,
		progress: await reconcileRestoredResume(videos, base.progress, base.resumeProgress, options.newestResume, turn),
		counts,
		followIds
	};
}
async function reconcileRestoredResume(videos, progress, resume, newestResume, turn = yieldCatalogTask) {
	const hasRecords = async (record) => {
		let visited = 0, started = performance.now();
		await turn();
		for (const row of sparseRecordScan(record, false)) {
			if (row) return true;
			if (++visited >= 512 || performance.now() - started >= 4) {
				await turn();
				visited = 0;
				started = performance.now();
			}
		}
		return false;
	};
	if (!await hasRecords(progress) && !await hasRecords(resume)) return progress;
	const recovered = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(videos, (video) => {
		const previous = progress[video.id];
		const mark = newestResume(previous, resume[`id:${video.id}`], video.remote?.watchUrl ? resume[video.remote.watchUrl] : void 0, video.remote?.embedUrl ? resume[video.remote.embedUrl] : void 0, video.src ? resume[video.src] : void 0, video.path ? resume[video.path] : void 0);
		if (mark && (!previous || previous.t !== mark.t || previous.d !== mark.d || previous.at !== mark.at)) recovered.set(video.id, mark);
	}, turn);
	if (!recovered.size) return progress;
	const next = sparseRecordBuilder(progress);
	await forEachCatalogEntry(recovered, ([id, mark]) => {
		next.set(id, mark);
	}, turn);
	return next.finish();
}
/** Rebase if a pull, resume update, favorite or unfollow changed any inputs
* during preparation. Navigation and unrelated preferences never restart it. */
function sameRestoreInputs(left, right) {
	return left.videos === right.videos && left.progress === right.progress && left.resumeProgress === right.resumeProgress && left.follows === right.follows && left.favorites === right.favorites && left.likes === right.likes;
}
/** Five phases and one shelf; no catalog references, titles or video identities. */
function createFirstShelfTrace(now) {
	let trace = {
		startedAt: 0,
		moduleReadyMs: Math.round(now()),
		phases: {},
		artwork: "pending"
	};
	let routeStart;
	let revision = 0;
	const listeners = /* @__PURE__ */ new Set();
	const publish = (next) => {
		trace = next;
		revision++;
		for (const listener of listeners) listener();
	};
	return {
		get: () => trace,
		revision: () => revision,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		homeReady() {
			if (trace.homeReadyMs === void 0) publish({
				...trace,
				homeReadyMs: Math.round(now())
			});
		},
		catalogReady() {
			if (trace.catalogReadyMs === void 0) publish({
				...trace,
				catalogReadyMs: Math.round(now())
			});
		},
		startPhase(phase) {
			if (trace.phases[phase]) return;
			publish({
				...trace,
				phases: {
					...trace.phases,
					[phase]: { startedAt: now() }
				}
			});
		},
		finishPhase(phase, rows, failed = false) {
			const previous = trace.phases[phase];
			if (!previous || previous.elapsedMs !== void 0) return;
			publish({
				...trace,
				phases: {
					...trace.phases,
					[phase]: {
						...previous,
						elapsedMs: Math.max(0, Math.round(now() - previous.startedAt)),
						...rows === void 0 ? {} : { rows },
						...failed ? { failed: true } : {}
					}
				}
			});
		},
		beginRoute(route) {
			if (trace.firstShelfAt === void 0) routeStart = {
				route,
				at: now()
			};
		},
		shelfReady(cards) {
			if (trace.firstShelfAt !== void 0 || cards <= 0) return false;
			const at = now();
			publish({
				...trace,
				firstShelfAt: at,
				elapsedMs: Math.round(at),
				cards,
				...routeStart ? {
					route: routeStart.route,
					routeElapsedMs: Math.max(0, Math.round(at - routeStart.at))
				} : {}
			});
			routeStart = void 0;
			return true;
		},
		artworkReady(loaded) {
			if (trace.firstShelfAt === void 0 || trace.artwork !== "pending") return;
			publish({
				...trace,
				artwork: loaded ? "loaded" : "deferred",
				artworkWaitMs: Math.max(0, Math.round(now() - trace.firstShelfAt))
			});
		}
	};
}
var trace = createFirstShelfTrace(() => typeof performance === "undefined" ? 0 : performance.now());
var client = () => typeof window !== "undefined";
var getFirstShelfTrace = trace.get;
var getStartupTraceRevision = trace.revision;
var subscribeStartupTrace = trace.subscribe;
var markHomeReady = () => {
	if (client()) trace.homeReady();
};
var markCatalogReady = () => {
	if (client()) trace.catalogReady();
};
var beginStartupPhase = (phase) => {
	if (client()) trace.startPhase(phase);
};
var finishStartupPhase = (phase, rows, failed = false) => {
	if (client()) trace.finishPhase(phase, rows, failed);
};
var beginFirstShelfRoute = (route) => {
	if (client()) trace.beginRoute(route);
};
function markFirstShelf(_title, cards) {
	return client() && trace.shelfReady(cards);
}
var markFirstShelfArtwork = (loaded) => {
	if (client()) trace.artworkReady(loaded);
};
var MAX_ENTRIES = 12;
var MAX_BYTES = 512e3;
var MAX_ENTRY_BYTES = 128e3;
function detailBytes(video) {
	let bytes = 512;
	for (const value of Object.values(video)) if (typeof value === "string") bytes += value.length * 2;
	for (const value of Object.values(video.remote ?? {})) if (typeof value === "string") bytes += value.length * 2;
	else if (Array.isArray(value)) {
		for (const item of value) if (typeof item === "string") bytes += item.length * 2 + 16;
	}
	for (const row of video.remote?.comments ?? []) {
		bytes += 128;
		for (const value of Object.values(row)) if (typeof value === "string") bytes += value.length * 2;
	}
	return bytes;
}
/** Viewer-only details never change the browse catalog. One current transcript,
* a byte-bounded reuse cache, and coalesced disk reads keep memory predictable. */
function createViewerDetails() {
	const cache = /* @__PURE__ */ new Map();
	const pending = /* @__PURE__ */ new Map();
	const listeners = /* @__PURE__ */ new Map();
	let bytes = 0, current;
	const notify = (id) => {
		if (id) for (const listener of listeners.get(id) ?? []) listener();
	};
	const invalidate = (id) => {
		const row = cache.get(id);
		if (row) bytes -= row.bytes;
		cache.delete(id);
		pending.delete(id);
	};
	const clearCache = () => {
		cache.clear();
		pending.clear();
		bytes = 0;
	};
	const releaseComments = () => {
		const id = current?.id;
		current = void 0;
		notify(id);
	};
	return {
		invalidate,
		clearCache,
		releaseComments,
		releaseCommentsExcept(id) {
			if (current && current.id !== id) releaseComments();
		},
		clear() {
			clearCache();
			releaseComments();
		},
		commentsFor(id) {
			return current?.id === id ? current?.comments : void 0;
		},
		setComments(id, comments) {
			const previousId = current?.id;
			invalidate(id);
			current = {
				id,
				comments
			};
			if (previousId !== id) notify(previousId);
			notify(id);
		},
		subscribe(id, listener) {
			if (!id) return () => {};
			let group = listeners.get(id);
			if (!group) {
				group = /* @__PURE__ */ new Set();
				listeners.set(id, group);
			}
			group.add(listener);
			return () => {
				group.delete(listener);
				if (!group.size) listeners.delete(id);
			};
		},
		load(id, read) {
			const hit = cache.get(id);
			if (hit) {
				cache.delete(id);
				cache.set(id, hit);
				return Promise.resolve(hit.video);
			}
			const existing = pending.get(id);
			if (existing) return existing.promise;
			while (pending.size >= 4) pending.delete(pending.keys().next().value);
			const job = { promise: void 0 };
			job.promise = Promise.resolve().then(read).then((video) => {
				if (pending.get(id) !== job || !video || video.id !== id) return video;
				const weight = detailBytes(video);
				if (weight <= MAX_ENTRY_BYTES) {
					cache.set(id, {
						video,
						bytes: weight
					});
					bytes += weight;
					while (cache.size > MAX_ENTRIES || bytes > MAX_BYTES) {
						const oldest = cache.keys().next().value;
						bytes -= cache.get(oldest).bytes;
						cache.delete(oldest);
					}
				}
				return video;
			}).finally(() => {
				if (pending.get(id) === job) pending.delete(id);
			});
			pending.set(id, job);
			return job.promise;
		},
		diagnostics() {
			return {
				entries: cache.size,
				estimatedBytes: bytes,
				maxEntries: MAX_ENTRIES,
				maxBytes: MAX_BYTES,
				pending: pending.size,
				activeTranscripts: current ? 1 : 0,
				subscribers: listeners.size
			};
		}
	};
}
var viewerDetails = createViewerDetails();
/** Independent durable slices must not all be rewritten by a playback tick.
* Inputs are immutable references; a failed synchronous enqueue stays dirty. */
var SliceWriter = class {
	saved = /* @__PURE__ */ new Map();
	/** Explicit retry must not treat an earlier failed async enqueue as saved. */
	reset() {
		this.saved.clear();
	}
	write(key, inputs, save) {
		const previous = this.saved.get(key);
		if (previous && previous.length === inputs.length && inputs.every((value, index) => Object.is(value, previous[index]))) return false;
		save();
		this.saved.set(key, inputs);
		return true;
	}
};
var adultProviders = new Set(ADULT_PULL_PROVIDERS);
var isAdultPullKind = (kind) => adultProviders.has(kind ?? "");
var nonFilm = /\b(trailer|teaser|review|reaction|recap|explained|analysis|gameplay|playthrough|walkthrough|speedrun|highlights?|compilation|podcast|interview|tutorial|behind the scenes|making of|deleted scenes?|movie clips?|film clips?|music video|amv|vlog|webinar|screen recording|livestream|dashcam)\b/i;
var episodes = /\b(?:s\d{1,2}[ ._-]*e\d{1,3}|season\s*\d+|episode\s*\d+|ep\.?\s*\d+)\b/i;
var animeShows = /\b(naruto|boruto|one piece|bleach|dragon ball|attack on titan|shingeki no kyojin|demon slayer|kimetsu no yaiba|jujutsu kaisen|frieren|sousou no frieren|fullmetal alchemist|death note|hunter x hunter|my hero academia|boku no hero|cowboy bebop|neon genesis evangelion|sailor moon|sword art online|spy x family|chainsaw man|vinland saga|mob psycho|one punch man|haikyuu|gintama|inuyasha|yuyu hakusho|yū yū hakusho|solo leveling|dandadan|dan da dan)\b/i;
var cleanTags = (tags) => tags.map((tag) => tag.toLowerCase().replace(/^#|^(?:keyword|genre|topic)-/g, "").replace(/[-_]+/g, " "));
/** Membership is evidence, not a promise of film-database identification. */
function movieIdentityEvidence(video, tags = [], folderName = "", provenance) {
	if (video.isSample || video.remote?.live || isAdultPullKind(video.remote?.kind) || video.remote?.kind === "twitch" || video.remote?.youtubeType === "upcoming" || video.remote?.youtubeType === "short") return;
	const title = video.name.slice(0, 600).replace(/[._]+/g, " "), saved = cleanTags(tags);
	if (nonFilm.test(title) || episodes.test(title) || ["episode", "special"].includes(animeTitleInfo(video.name).format)) return;
	if (/\b(?:anime|manga)\b/i.test(video.genre ?? "") && !/\b(?:movie|film|theatrical)\b/i.test(title) && !saved.some((tag) => /^(?:anime movie|anime film|movie|film)$/.test(tag))) return;
	const movieTag = (tag) => /^(?:movies?|films?|full movie|feature film|anime movie|anime film)$/.test(cleanTags([tag])[0] ?? "");
	if ((!provenance || provenance.lockedFields?.includes("tags") || Object.entries(provenance.tags ?? {}).some(([tag, source]) => movieTag(tag) && (source === "manual" || source === "legacy"))) && saved.some(movieTag)) return "Saved movie tag";
	if (/\b(full (?:length )?(?:movie|film|documentary)|complete (?:movie|film)|feature film|theatrical (?:movie|film))\b/i.test(title)) return "Full-film title";
	if (video.collection === "classics") return "Curated classic";
	if (/^(?:movies?|films?|cinema)$/i.test(video.genre ?? "")) return "Movie category";
	if (!video.remote && (/(?:^|[\\/])(?:movies?|films?|cinema)(?:[\\/]|$)/i.test(video.path) || /^(?:movies?|films?|cinema)$/i.test(folderName.trim()))) return "Local movie folder";
	if (!video.remote && (video.year || /\b(?:19\d{2}|20\d{2})\b/.test(title)) && (!video.duration || video.duration >= 2400)) return "Local feature title with release year";
	if (!video.remote && video.duration >= 2400 && /^(?:action|comedy|drama|horror|thriller|romance|science fiction|documentary)$/i.test(video.genre ?? "")) return "Feature-length movie category";
}
function movieEvidence(video, tags = [], folderName = "", provenance) {
	if (!Number.isFinite(video.duration) || video.duration <= 600) return;
	const evidence = movieIdentityEvidence(video, tags, folderName, provenance);
	return evidence ? `${evidence} · over 10 minutes` : void 0;
}
/** Anime is narrower than a topic mention. Manga, games, commentary and
* promotional extras remain in the general library and Topic Explorer. */
function animeEvidence(video, tags = [], provenance) {
	if (video.remote?.live || video.remote?.youtubeType === "upcoming" || video.remote?.youtubeType === "short" || isAdultPullKind(video.remote?.kind) || video.remote?.kind === "twitch") return;
	const title = video.name.slice(0, 600).replace(/[._]+/g, " "), saved = cleanTags(tags);
	const format = animeTitleInfo(video.name).format;
	if (nonFilm.test(title) || /\b(manga (?:review|chapter|discussion)|anime (?:discussion|news|ranking)|cosplay|tier list|opening theme|ending theme|soundtrack|ost|anime edits?|anime recommendations?|top \d+ anime|best anime|anime news|anime merch|anime figures?|unboxing|lofi|ambien(?:t|ce)|anime music|anime scenes?|ultimate ninja|shinobi striker|sparking zero|genshin impact|honkai|wuthering waves)\b/i.test(title)) return;
	if ((provenance?.lockedFields?.includes("tags") || !provenance || Object.entries(provenance.tags ?? {}).some(([tag, source]) => /^(?:#?anime|anime[- ](?:episode|movie))$/i.test(tag) && source === "manual")) && saved.some((tag) => tag === "anime" || tag === "anime episode" || tag === "anime movie")) return "Saved anime tag";
	if (/\banime\b/i.test(`${title} ${video.genre ?? ""}`) && (format !== "title" || /\banime series\b/i.test(title) || (video.duration ?? 0) >= 600)) return "Anime episode/feature evidence";
	if (animeShows.test(title) && (format !== "title" || !video.remote && (video.duration ?? 0) >= 600)) return "Anime series with episode/film evidence";
	if (/\bmanga\b/i.test(title) && /\b(ova|ona)\b/i.test(title)) return "Animated special";
}
var snapshots = /* @__PURE__ */ new WeakMap();
/** Card selectors run on every store update. Share the immutable folder
* snapshot's flags instead of searching hundreds of sources for each card. */
function folderIsPrivate(folders, id) {
	let privateIds = snapshots.get(folders);
	if (!privateIds) {
		privateIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
		snapshots.set(folders, privateIds);
	}
	return privateIds.has(id);
}
/** Photo and video catalogs restore independently. A photo stub arriving first
* must carry saved privacy before public catalog selectors can see the folder. */
function restorePhotoFolders(current, sources, privateIds) {
	const byId = new Map(current.map((folder) => [folder.id, folder]));
	for (const source of sources) {
		const folder = byId.get(source.id);
		byId.set(source.id, folder ? {
			...folder,
			name: source.name || folder.name,
			kind: source.kind,
			...source.photoCount != null ? { photoCount: source.photoCount } : {},
			...source.lastCheckedAt != null ? { lastCheckedAt: source.lastCheckedAt } : {}
		} : {
			id: source.id,
			name: source.name,
			kind: source.kind,
			videoCount: 0,
			photoCount: source.photoCount ?? 0,
			lastCheckedAt: source.lastCheckedAt,
			adult: privateIds.has(source.id),
			needsPermission: true,
			health: "permission-needed"
		});
	}
	return [...byId.values()];
}
/** Constant-time reads and unchanged-image callbacks. Only changed URLs enter
* the bounded cache or request a persistence write. */
function createPreviewUrlCache(limit) {
	const rows = /* @__PURE__ */ new Map();
	const trim = () => {
		while (rows.size > limit) rows.delete(rows.keys().next().value);
	};
	return {
		get: (id) => rows.get(id),
		clear: () => rows.clear(),
		size: () => rows.size,
		hydrate(raw) {
			rows.clear();
			if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
			const saved = Object.entries(raw).filter((row) => {
				const value = row[1];
				return Boolean(value && typeof value === "object" && Number.isFinite(value.at) && (typeof value.poster === "string" || typeof value.previewUrl === "string"));
			}).sort((a, b) => a[1].at - b[1].at).slice(-limit);
			for (const [id, row] of saved) rows.set(id, row);
		},
		remember(id, row) {
			const old = rows.get(id);
			const next = {
				poster: row.poster ?? old?.poster,
				previewUrl: row.previewUrl ?? old?.previewUrl,
				at: row.at
			};
			if (old?.poster === next.poster && old?.previewUrl === next.previewUrl) return false;
			rows.delete(id);
			rows.set(id, next);
			trim();
			return true;
		},
		serialize: () => Object.fromEntries(rows)
	};
}
var LS_KEY = "reelcase.adult-preview-urls.v1";
var cache = createPreviewUrlCache(2400);
var loaded = false;
var dirty = false;
var timer;
var cancelFlush = () => {};
function load() {
	if (loaded || typeof localStorage === "undefined") return;
	loaded = true;
	try {
		cache.hydrate(JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"));
	} catch {}
}
function flush() {
	cancelFlush();
	clearTimeout(timer);
	timer = void 0;
	if (!dirty || typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(LS_KEY, JSON.stringify(cache.serialize()));
		dirty = false;
	} catch {}
}
function scheduleFlush() {
	if (timer !== void 0) return;
	timer = setTimeout(() => {
		cancelFlush = scheduleBackgroundWork(() => {
			flush();
		});
	}, 750);
}
function remember(id, poster, previewUrl) {
	load();
	const goodPoster = poster && isUsableAdultThumb(poster) ? poster : void 0;
	const goodPreview = previewUrl && isUsableAdultThumb(previewUrl) ? previewUrl : goodPoster;
	if (!goodPoster && !goodPreview) return;
	if (!cache.remember(id, {
		poster: goodPoster,
		previewUrl: goodPreview,
		at: Date.now()
	})) return;
	dirty = true;
	scheduleFlush();
	saveThumbCache({
		id,
		thumb: goodPoster ?? goodPreview ?? "",
		at: Date.now()
	}).catch(() => void 0);
}
if (typeof window !== "undefined") {
	const onStorage = (event) => {
		if (event.key !== LS_KEY || dirty) return;
		loaded = false;
		cache.clear();
	};
	window.addEventListener("storage", onStorage);
	window.addEventListener("pagehide", flush);
}
/** Fill missing/broken incoming artwork from the durable URL cache. */
function applyCachedAdultUrls(videos) {
	load();
	return videos.map((video) => {
		const cached = cache.get(video.id);
		const posterOk = video.poster && isUsableAdultThumb(video.poster);
		const previewOk = video.remote?.previewUrl && isUsableAdultThumb(video.remote.previewUrl);
		if (posterOk && previewOk) return video;
		if (!cached?.poster && !cached?.previewUrl) return video;
		return {
			...video,
			poster: posterOk ? video.poster : cached.poster ?? video.poster,
			remote: video.remote ? {
				...video.remote,
				previewUrl: previewOk ? video.remote.previewUrl : cached.previewUrl ?? cached.poster ?? video.remote.previewUrl
			} : video.remote
		};
	});
}
function cacheAdultVideoUrls(videos) {
	for (const video of videos) remember(video.id, video.poster, video.remote?.previewUrl);
}
var keys = (mode) => mode === "recent" ? {
	attempt: "twitchClipRecentAttemptedAt",
	checked: "twitchClipRecentCheckedAt",
	retry: "twitchClipRecentRetry"
} : {
	attempt: "twitchClipArchiveAttemptedAt",
	checked: "twitchClipCheckedAt",
	retry: "twitchClipRetry"
};
function clipObservationAt(channel, mode) {
	return Math.max(channel[keys(mode).checked] ?? 0, channel.twitchClipDiagnostics?.mode === mode ? channel.twitchClipDiagnostics.at : 0);
}
/** Attempt time is local action start. Observation time belongs to the provider
* read and must never be replaced by cache delivery/commit time. */
function mergeTwitchClipObservation(previous, incoming, mode, attemptedAt, now = Date.now()) {
	const k = keys(mode), at = Math.max(clipObservationAt(incoming, mode), incoming.lastClipFailure ? Math.min(attemptedAt, incoming.lastClipFailure.at ?? attemptedAt) : 0), attempt = Math.max(previous?.[k.attempt] ?? 0, attemptedAt);
	const priorFailure = previous?.[k.retry] ? previous.lastClipFailure?.at ?? previous[k.attempt] ?? 0 : 0;
	if (previous && ((previous[k.attempt] ?? 0) > attemptedAt || at < Math.max(clipObservationAt(previous, mode), priorFailure) || incoming.twitchClipDiagnostics?.cacheHit === true && previous[k.retry] && (!previous.lastClipFailure?.at || priorFailure >= at))) return {
		...previous,
		[k.attempt]: attempt
	};
	const next = {
		...previous,
		...retainTwitchPullPolicy(previous, incoming),
		[k.attempt]: attempt,
		...twitchRetryPatch(previous ?? {}, mode === "recent" ? "clips-recent" : "clips", incoming.lastClipFailure, now)
	};
	if (previous?.lastClipFailure && previous.lastClipFailure.at > at) next.lastClipFailure = previous.lastClipFailure;
	return next;
}
/** Unrelated live/archive responses may carry a stale copy of a follow. Keep
* newer clip health and positions without changing their other lanes. */
function retainNewerTwitchClipFollow(previous, incoming) {
	if (previous.kind !== "twitch" || incoming.kind !== "twitch") return incoming;
	let next = retainTwitchPullPolicy(previous, incoming);
	const keep = (fields) => {
		if (next === incoming) next = { ...incoming };
		for (const key of fields) Object.assign(next, { [key]: previous[key] });
	};
	for (const mode of ["recent", "archive"]) {
		const k = keys(mode), version = (c) => Math.max(c[k.attempt] ?? 0, clipObservationAt(c, mode), c[k.retry] ? c.lastClipFailure?.at ?? 0 : 0);
		if (version(previous) > version(incoming)) keep([
			k.attempt,
			k.checked,
			k.retry,
			...mode === "archive" ? ["twitchClipCursor", "twitchClipExhaustedAt"] : []
		]);
	}
	if ((previous.twitchClipDiagnostics?.at ?? 0) > (incoming.twitchClipDiagnostics?.at ?? 0)) {
		keep(["twitchClipDiagnostics"]);
		if (incoming.twitchClipDiagnostics) keep(["lastResponseCount"]);
	}
	if ((previous.lastClipFailure?.at ?? 0) > Math.max(incoming.lastClipFailure?.at ?? 0, clipObservationAt(incoming, "recent"), clipObservationAt(incoming, "archive"))) keep(["lastClipFailure"]);
	return next;
}
var exactId = (value) => /^(?:yt:)?(UC[\w-]{22})$/.exec(value)?.[1] ?? /^https?:\/\/(?:www\.)?youtube\.com\/channel\/(UC[\w-]{22})(?:[/?#]|$)/i.exec(value)?.[1];
var identity = confirmedYoutubeChannelId;
/** A display name need not resemble a handle. Only contradictory exact IDs,
* or an alias/name shared by distinct confirmed channels, need a decision. */
function youtubeIdentityReviews(follows) {
	const rows = follows.filter((row) => row.kind === "youtube" && !row.id.startsWith("ytpl:"));
	const groups = /* @__PURE__ */ new Map(), evidence = /* @__PURE__ */ new Map();
	const related = /* @__PURE__ */ new Map();
	const add = (row, reason, members) => {
		const reasons = evidence.get(row.id) ?? [];
		if (!reasons.includes(reason)) reasons.push(reason);
		evidence.set(row.id, reasons);
		const ids = related.get(row.id) ?? /* @__PURE__ */ new Set();
		for (const member of members) ids.add(member.id);
		related.set(row.id, ids);
	};
	for (const row of rows) {
		const channel = identity(row);
		for (const [label, raw] of [["Saved handle", row.handle], ["Imported link", row.importQuery ?? ""]]) {
			const supplied = exactId(raw);
			if (channel && supplied && channel !== supplied) add(row, label + " points to a different channel ID.", [row]);
		}
		const aliases = new Set([
			row.handle,
			row.importQuery,
			row.title
		].filter(Boolean).map((value) => canonicalFollowHandle("youtube", value)).filter(Boolean));
		for (const key of aliases) {
			const members = groups.get(key) ?? [];
			members.push(row);
			groups.set(key, members);
		}
	}
	for (const members of groups.values()) {
		if (new Set(members.map(identity).filter(Boolean)).size < 2) continue;
		for (const row of members) add(row, "A saved name or handle matches multiple confirmed channels.", members);
	}
	const byId = new Map(rows.map((row) => [row.id, row])), result = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const reasons = evidence.get(row.id);
		if (!reasons) continue;
		const ids = [...related.get(row.id)].sort();
		let hash = 2166136261;
		for (const id of ids) {
			const member = byId.get(id);
			const value = JSON.stringify([
				member.id,
				member.channelId,
				member.handle,
				member.title,
				member.importQuery
			]);
			for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
		}
		const fingerprint = "v1:" + (hash >>> 0).toString(16) + ":" + ids.length;
		result.set(row.id, {
			fingerprint,
			reasons,
			relatedIds: ids.filter((id) => id !== row.id).slice(0, 8),
			reviewed: row.identityReview?.fingerprint === fingerprint
		});
	}
	return result;
}
/**
* Rotate Twitch checks fairly while letting never-checked import stubs get
* their first provider response before established channels take another turn.
*/
function selectTwitchRefreshBatch(channels, limit, cursor, scope = "archive", now = Date.now()) {
	if (!channels.length || limit <= 0) return {
		channels: [],
		nextCursor: 0
	};
	const start = (Math.floor(cursor) % channels.length + channels.length) % channels.length;
	const count = Math.min(Math.floor(limit), channels.length);
	const eligible = Array.from({ length: channels.length }, (_, index) => channels[(start + index) % channels.length]).filter((channel) => (scope === "recent" ? channel.recentPull?.retryAt ?? 0 : channel[scope === "live" ? "twitchLiveRetry" : "twitchArchiveRetry"]?.retryAt ?? 0) <= now);
	const pending = eligible.filter((channel) => !channel.channelId && !channel.lastCheckedAt && !channel.lastProviderFailure);
	const settled = eligible.filter((channel) => channel.channelId || channel.lastCheckedAt || channel.lastProviderFailure);
	if (scope === "archive") settled.sort((a, b) => (a.twitchArchiveCheckedAt ?? a.twitchArchiveDiagnostics?.at ?? 0) - (b.twitchArchiveCheckedAt ?? b.twitchArchiveDiagnostics?.at ?? 0));
	if (scope === "recent") settled.sort((a, b) => (a.recentPull?.attemptedAt ?? 0) - (b.recentPull?.attemptedAt ?? 0) || a.id.localeCompare(b.id));
	return {
		channels: [...pending, ...settled].slice(0, count),
		nextCursor: (start + count) % channels.length
	};
}
/** Bounded weighted lanes (4 high, 2 normal, 1 low) use the existing oldest-first
* order within each tier. Every seven dispatches reserve a low turn; empty lanes
* lend their slots. Provider budgets and live ordering are unchanged. */
function selectTwitchPolicyBatch(channels, limit, cursor, scope = "recent", now = Date.now()) {
	const eligible = channels.filter((c) => twitchPolicyAllows(c, scope));
	const ordered = selectTwitchRefreshBatch(eligible, eligible.length, 0, scope, now).channels;
	const lanes = {
		high: [],
		normal: [],
		low: []
	};
	for (const c of ordered) lanes[twitchPullPolicy(c).priority].push(c);
	const pattern = [
		"high",
		"normal",
		"high",
		"low",
		"high",
		"normal",
		"high"
	];
	const selected = [], used = /* @__PURE__ */ new Set();
	let offset = 0;
	const positions = {
		high: 0,
		normal: 0,
		low: 0
	};
	const take = (tier) => {
		while (used.has(lanes[tier][positions[tier]]?.id)) positions[tier]++;
		const row = lanes[tier][positions[tier]];
		if (row) positions[tier]++;
		return row;
	};
	const count = Math.min(Math.max(0, Math.floor(limit)), ordered.length), start = (cursor % pattern.length + pattern.length) % pattern.length;
	while (selected.length < count) {
		const wanted = pattern[(start + offset++) % pattern.length];
		const row = take(wanted) ?? ordered.find((c) => !used.has(c.id));
		if (!row) break;
		if (used.has(row.id)) continue;
		used.add(row.id);
		selected.push(row);
	}
	return {
		channels: selected,
		nextCursor: (start + offset) % pattern.length,
		skippedByPolicy: channels.length - eligible.length
	};
}
var YOUTUBE_LIVE_HOLD_MS = 6e5;
/** A single missing broadcast must not end a stream. Failed checks do not
* advance this timer; a fresh positive observation clears it. */
function retainYoutubeLiveFollow(previous, incoming, checked) {
	if (incoming.kind !== "youtube" || incoming.lastLiveFailure) return incoming;
	if (incoming.live) return incoming.liveOfflineSince === void 0 ? incoming : {
		...incoming,
		liveOfflineSince: void 0
	};
	if (!checked || incoming.youtubeLiveEvidence && !incoming.youtubeLiveEvidence.complete) return {
		...incoming,
		live: previous?.live ?? incoming.live,
		liveOfflineSince: previous?.liveOfflineSince
	};
	if (!previous?.live) return incoming;
	const at = incoming.liveCheckedAt ?? 0;
	if (!at || at < (previous.liveCheckedAt ?? 0)) return incoming;
	const since = previous.liveOfflineSince && previous.liveOfflineSince <= at ? previous.liveOfflineSince : at;
	return {
		...incoming,
		live: at - since < YOUTUBE_LIVE_HOLD_MS,
		liveOfflineSince: since
	};
}
var KEY$1 = "reelcase.youtube-cooldown.v2";
function youtubeCooldownMessage(retryAt, error) {
	const code = error?.match(/HTTP (\d{3})/)?.[1] ?? "429";
	return `${/unusual traffic/i.test(error ?? "") ? `Google reported unusual traffic from this network (HTTP ${code})` : `YouTube returned HTTP ${code}`}. We recommend waiting until ${new Date(retryAt).toLocaleTimeString()}, but you can force a pull now. Cached videos and archive positions are preserved.`;
}
function clearYoutubeCooldown() {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(KEY$1);
	} catch {}
}
/** Small independent checkpoint; the durable follow ledger also retains this
* deadline when localStorage is full. Never store the video catalog here. */
function saveYoutubeCooldown(cooldown) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY$1, JSON.stringify(cooldown));
	} catch {}
}
function restoreYoutubeCooldown(follows, now = Date.now()) {
	let latest = null;
	const accept = (value) => {
		if (value && (value.cooldownScope === "catalog" || value.cooldownScope === "all") && Number.isFinite(value.retryAt) && value.retryAt > now && value.retryAt > (latest?.retryAt ?? 0)) latest = value;
	};
	if (typeof window !== "undefined") try {
		accept(JSON.parse(window.localStorage.getItem(KEY$1) ?? "null"));
	} catch {}
	for (const follow of follows) {
		const failure = follow.kind === "youtube" ? follow.lastProviderFailure : void 0;
		if (failure?.kind === "rate-limited" && failure.retryAt && (failure.cooldownScope === "all" || failure.cooldownScope === "catalog")) accept({
			retryAt: failure.retryAt,
			error: failure.message,
			cooldownScope: failure.cooldownScope
		});
	}
	return latest;
}
/** One owner for optional work. An interrupted step drops its scratch arrays;
* the job retains only its last completed cursor and retries that step later. */
function createIdleQueue(runtime) {
	const jobs = /* @__PURE__ */ new Map(), listeners = /* @__PURE__ */ new Set();
	let paused = false, disposed = false, controller;
	let running, detach;
	let completed;
	let snapshot = {
		paused,
		state: "ready",
		jobs: []
	};
	const publish = (error) => {
		snapshot = {
			paused,
			state: error ? "error" : !jobs.size ? "ready" : paused || !runtime.allowed() ? "waiting" : running ? "running" : "ready",
			jobs: [...jobs.values()].map(({ id, label, progress }) => ({
				id,
				label,
				progress
			})),
			...error ? { error } : {},
			...completed ? { completed } : {}
		};
		for (const listener of listeners) listener();
	};
	const release = () => {
		if (!jobs.size && !running) {
			detach?.();
			detach = void 0;
		}
	};
	const pump = () => {
		if (disposed || running || paused || !runtime.allowed() || !jobs.size) {
			release();
			return;
		}
		const job = jobs.values().next().value;
		const abort = new AbortController();
		controller = abort;
		running = job;
		publish();
		const turn = async () => {
			abort.signal.throwIfAborted();
			await runtime.turn(abort.signal);
			abort.signal.throwIfAborted();
		};
		(async () => {
			try {
				if (runtime.start) {
					await runtime.start(abort.signal);
					abort.signal.throwIfAborted();
				} else await turn();
				const result = await job.step(abort.signal, turn);
				abort.signal.throwIfAborted();
				if (jobs.get(job.id) !== job) return;
				job.progress = result.progress;
				if (result.done) {
					completed = {
						label: job.label,
						progress: result.progress
					};
					jobs.delete(job.id);
					job.resolve(result.result);
				} else {
					jobs.delete(job.id);
					jobs.set(job.id, job);
				}
			} catch (error) {
				if (!abort.signal.aborted && jobs.get(job.id) === job) {
					jobs.delete(job.id);
					job.reject(error);
					publish(error instanceof Error ? error.message : "Metadata work could not be saved.");
				}
			} finally {
				running = void 0;
				controller = void 0;
				if (!snapshot.error) publish();
				release();
				pump();
			}
		})();
	};
	const wake = (interrupt = false) => {
		if (interrupt || paused || !runtime.allowed()) controller?.abort();
		if (!snapshot.error) publish();
		pump();
	};
	return {
		enqueue(id, label, step) {
			if (disposed) return Promise.reject(/* @__PURE__ */ new Error("Metadata queue has been disposed."));
			const existing = jobs.get(id);
			if (existing) return existing.promise;
			let resolve, reject;
			const promise = new Promise((yes, no) => {
				resolve = yes;
				reject = no;
			});
			jobs.set(id, {
				id,
				label,
				step,
				promise,
				resolve,
				reject,
				progress: {
					scanned: 0,
					total: 0,
					changed: 0,
					batches: 0
				}
			});
			detach ??= runtime.subscribe(wake);
			publish();
			pump();
			return promise;
		},
		setPaused(value) {
			paused = value;
			publish();
			wake(true);
		},
		cancel(id) {
			const job = jobs.get(id);
			if (!job) return;
			jobs.delete(id);
			job.reject(new DOMException("Metadata work canceled", "AbortError"));
			if (running === job) controller?.abort();
			publish();
			release();
			pump();
		},
		dispose() {
			disposed = true;
			controller?.abort();
			for (const job of jobs.values()) job.reject(new DOMException("Metadata work disposed", "AbortError"));
			jobs.clear();
			detach?.();
			detach = void 0;
			publish();
		},
		getSnapshot: () => snapshot,
		subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
	};
}
/** Multiple foreground jobs share a pause without one cleanup releasing
* another job's hold. The last release wakes optional background work. */
function createWorkHold(changed) {
	let count = 0;
	return {
		held: () => count > 0,
		acquire() {
			if (++count === 1) changed(true);
			let released = false;
			return () => {
				if (released) return;
				released = true;
				if (--count === 0) changed(false);
			};
		}
	};
}
var viewerOpen = false;
var pageSuspended = false;
var wakeQueue;
var foreground = createWorkHold(() => wakeQueue?.(true));
/** Ranking/navigation owns the next catalog snapshot. Optional enrichment
* must not repeatedly invalidate that snapshot while it is being compiled. */
var holdMetadataEnrichment = () => foreground.acquire();
function idleTurn(signal) {
	return new Promise((resolve, reject) => {
		const abort = () => {
			cancel();
			signal.removeEventListener("abort", abort);
			reject(signal.reason);
		};
		const cancel = scheduleBackgroundWork(() => {
			signal.removeEventListener("abort", abort);
			resolve();
		}, {
			timeoutMs: 2e3,
			fallbackDelayMs: 16
		});
		signal.addEventListener("abort", abort, { once: true });
		if (signal.aborted) abort();
	});
}
var idleEnrichment = createIdleQueue({
	allowed: () => typeof document !== "undefined" && !document.hidden && !viewerOpen && !pageSuspended && !foreground.held(),
	start: idleTurn,
	turn: (signal) => {
		signal.throwIfAborted();
		if (getInteractionPriorityDelay() > 0) return idleTurn(signal);
		const scheduler = globalThis.scheduler;
		if (scheduler) return scheduler.postTask(() => {}, {
			priority: "background",
			signal
		});
		return new Promise((resolve, reject) => {
			const abort = () => {
				window.clearTimeout(timer);
				signal.removeEventListener("abort", abort);
				reject(signal.reason);
			};
			const timer = window.setTimeout(() => {
				signal.removeEventListener("abort", abort);
				resolve();
			}, 0);
			signal.addEventListener("abort", abort, { once: true });
			if (signal.aborted) abort();
		});
	},
	subscribe: (wake) => {
		if (typeof window === "undefined") return () => {};
		pageSuspended = false;
		wakeQueue = wake;
		const visibility = () => wake(true);
		const input = () => {
			prioritizeInteraction();
			wake(true);
		};
		const hide = () => {
			pageSuspended = true;
			wake(true);
		};
		const show = () => {
			pageSuspended = false;
			wake();
		};
		document.addEventListener("visibilitychange", visibility);
		window.addEventListener("pagehide", hide);
		window.addEventListener("pageshow", show);
		const events = [
			"pointerdown",
			"keydown",
			"wheel",
			"touchstart"
		];
		for (const event of events) window.addEventListener(event, input, { passive: true });
		return () => {
			wakeQueue = void 0;
			document.removeEventListener("visibilitychange", visibility);
			window.removeEventListener("pagehide", hide);
			window.removeEventListener("pageshow", show);
			for (const event of events) window.removeEventListener(event, input);
		};
	}
});
function setEnrichmentViewerOpen(open, searching = false) {
	const busy = open || searching;
	if (viewerOpen === busy) return;
	viewerOpen = busy;
	wakeQueue?.(true);
}
/** User events retain their order while expensive follow-up work waits for
* foreground paint. One bounded queue/timer; hide/unload can flush explicitly. */
function createDeferredEvents(consume, schedule, limit = 64) {
	let pending = [], cancel, generation = 0;
	const clearTimer = () => {
		generation++;
		cancel?.();
		cancel = void 0;
	};
	const flush = () => {
		clearTimer();
		const batch = pending;
		pending = [];
		for (const value of batch) consume(value);
	};
	return {
		push(value) {
			pending.push(value);
			if (pending.length >= limit) {
				flush();
				return;
			}
			if (cancel) return;
			const ticket = ++generation;
			cancel = schedule(() => {
				if (ticket === generation) flush();
			});
		},
		flush,
		clear() {
			clearTimer();
			pending = [];
		},
		size: () => pending.length
	};
}
function enrichmentCursor() {
	return { offset: 0 };
}
/** Never builds a library-sized candidate list. A scan checks at most 2048
* rows per batch, with 512-row / four-millisecond background task boundaries. */
function metadataEnrichmentStep(options) {
	const cursor = options.cursor ?? enrichmentCursor(), maxChanges = options.maxChanges ?? Infinity;
	let processed = 0, changed = 0, batches = 0;
	const sources = /* @__PURE__ */ new Map();
	return async (signal, turn) => {
		const state = options.get();
		if (cursor.catalog?.deref() !== state.videos) {
			cursor.catalog = new WeakRef(state.videos);
			cursor.offset = 0;
		}
		const patches = /* @__PURE__ */ new Map(), sourceById = /* @__PURE__ */ new Map();
		let index = cursor.offset, visited = 0, started = performance.now();
		const end = Math.min(state.videos.length, index + 2048);
		while (index < end && patches.size < Math.min(2048, maxChanges - processed)) {
			const video = state.videos[index++], patch = options.patch(video, state);
			if (patch) {
				patches.set(video.id, patch);
				sourceById.set(video.id, video.remote?.kind ?? "local");
			}
			if (++visited >= 512 || performance.now() - started >= 4) {
				await turn();
				visited = 0;
				started = performance.now();
			}
		}
		signal.throwIfAborted();
		const afterScan = options.get();
		if (afterScan.videos !== state.videos || afterScan.folders !== state.folders || afterScan.tags !== state.tags || afterScan.metadataProvenance !== state.metadataProvenance) return {
			done: false,
			progress: {
				scanned: cursor.offset,
				total: state.videos.length,
				changed,
				batches
			}
		};
		let prepared;
		try {
			prepared = await prepareEnrichmentBatch(options.get, patches, turn);
		} catch (error) {
			signal.throwIfAborted();
			if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
			return {
				done: false,
				progress: {
					scanned: cursor.offset,
					total: state.videos.length,
					changed,
					batches
				}
			};
		}
		const unchanged = () => {
			const current = options.get();
			return current.videos === state.videos && current.folders === state.folders && current.tags === prepared.base.tags && current.metadataProvenance === prepared.base.metadataProvenance;
		};
		signal.throwIfAborted();
		if (!unchanged()) return {
			done: false,
			progress: {
				scanned: cursor.offset,
				total: state.videos.length,
				changed,
				batches
			}
		};
		if (prepared.rows.length) {
			try {
				await options.save(prepared.rows, async () => {
					await turn();
					if (!unchanged()) throw new DOMException("Metadata changed while saving", "AbortError");
				});
			} catch (error) {
				signal.throwIfAborted();
				if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
				return {
					done: false,
					progress: {
						scanned: cursor.offset,
						total: state.videos.length,
						changed,
						batches
					}
				};
			}
			signal.throwIfAborted();
			if (!unchanged()) return {
				done: false,
				progress: {
					scanned: cursor.offset,
					total: state.videos.length,
					changed,
					batches
				}
			};
			options.publish(prepared.next);
			batches++;
			for (const row of prepared.rows) {
				const tagChanged = row.tags !== prepared.base.tags[row.id], source = sourceById.get(row.id);
				const counts = sources.get(source) ?? {
					processed: 0,
					changed: 0
				};
				counts.processed++;
				if (tagChanged) {
					counts.changed++;
					changed++;
				}
				sources.set(source, counts);
				processed++;
			}
		}
		cursor.offset = index;
		const progress = {
			scanned: index,
			total: state.videos.length,
			changed,
			batches
		};
		if (index < state.videos.length && processed < maxChanges) return {
			done: false,
			progress
		};
		return {
			done: true,
			progress,
			result: {
				processed,
				changed,
				remaining: Math.max(0, state.videos.length - index),
				sources: [...sources].map(([source, counts]) => ({
					source,
					...counts
				}))
			}
		};
	};
}
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([
	"mp4",
	"webm",
	"mkv",
	"mov",
	"m4v",
	"avi",
	"ogv",
	"ogg",
	"3gp",
	"wmv",
	"flv",
	"ts",
	"mts",
	"m2ts",
	"mpeg",
	"mpg",
	"mpe",
	"asf",
	"m2v",
	"vob"
]);
var NATIVE_PLAYABLE = /* @__PURE__ */ new Set([
	"mp4",
	"webm",
	"ogv",
	"ogg",
	"m4v",
	"mov"
]);
var SKIP_DIRS = /* @__PURE__ */ new Set([
	"node_modules",
	".git",
	".svn",
	".hg",
	".cache",
	".next",
	".nuxt",
	"dist",
	"build",
	"__pycache__",
	"system volume information",
	"$recycle.bin",
	"windows",
	"windows.old",
	"program files",
	"program files (x86)",
	"programdata",
	"recovery",
	"perflogs",
	"boot",
	"intel",
	"amd",
	"nvidia",
	"nvidia corporation",
	"msocache",
	"config.msi",
	"$windows.~bt",
	"$windows.~ws",
	"documents and settings",
	"appdata",
	"application data",
	"local settings",
	"library",
	"system",
	"applications",
	"private",
	"usr",
	"proc",
	"sys",
	"dev",
	"run",
	"snap",
	"var",
	"cores",
	"tmp",
	"temp",
	"cache"
]);
/** Old cached viewer counts are intentionally not treated as current demand. */
function hasFreshViewerCount(remote, now = Date.now()) {
	return Boolean(remote && typeof remote.viewers === "number" && Number.isFinite(remote.viewers) && remote.viewers >= 0 && typeof remote.observedAt === "number" && now >= remote.observedAt && now - remote.observedAt <= 3e5);
}
var RECOMMENDED_FOLDERS = [
	{
		id: "videos",
		label: "Videos",
		hint: "Movies & TV"
	},
	{
		id: "downloads",
		label: "Downloads",
		hint: "Saved files"
	},
	{
		id: "desktop",
		label: "Desktop",
		hint: "On the desktop"
	},
	{
		id: "documents",
		label: "Documents",
		hint: "Docs folder"
	},
	{
		id: "pictures",
		label: "Pictures",
		hint: "Camera rolls"
	}
];
function isVideoFile(name, mime) {
	const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
	if (VIDEO_EXTENSIONS.has(ext)) return true;
	return Boolean(mime && mime.startsWith("video/"));
}
function shouldSkipDir(name) {
	if (name.startsWith(".")) return true;
	return SKIP_DIRS.has(name.toLowerCase());
}
function isDriveName(name) {
	const n = name.trim();
	if (/^[a-z]:?$/i.test(n)) return true;
	if (n === "/" || n === "\\") return true;
	return /^(macintosh hd|local disk|os|windows|ubuntu|fedora|linux)$/i.test(n);
}
function mimeFromName(name) {
	switch (name.slice(name.lastIndexOf(".") + 1).toLowerCase()) {
		case "mp4":
		case "m4v": return "video/mp4";
		case "webm": return "video/webm";
		case "ogv":
		case "ogg": return "video/ogg";
		case "mov": return "video/quicktime";
		case "mkv": return "video/x-matroska";
		case "avi": return "video/x-msvideo";
		default: return "video/*";
	}
}
function isLikelyPlayable(ext) {
	return NATIVE_PLAYABLE.has(ext.toLowerCase());
}
function titleOf(video) {
	return video.name.replace(/\.[^/.]+$/, "");
}
function isClassicVideo(video) {
	if (video.collection === "classics") return true;
	const blob = `${video.path} ${video.name} ${video.genre ?? ""}`.toLowerCase();
	return /\b(classic|classics|noir|silent|golden.?age)\b/.test(blob);
}
var SYSTEM_SOURCES = /* @__PURE__ */ new Set([
	"home",
	"landing",
	"all",
	"movies",
	"favorites",
	"history",
	"adults",
	"adult-fetishes",
	"continue",
	"youtube",
	"twitch",
	"live",
	"prints",
	"photos",
	"spotify",
	"games",
	"shop",
	"streaming",
	"stream-signal",
	"stable-diffusion",
	"remote-desktop",
	"social",
	"watch-room",
	"settings"
]);
var files = /* @__PURE__ */ new Map();
var fileHandles = /* @__PURE__ */ new Map();
var dirHandles = /* @__PURE__ */ new Map();
var objectUrls = /* @__PURE__ */ new Map();
var pinnedUrls = /* @__PURE__ */ new Map();
var MAX_OBJECT_URLS = 48;
/** Release transient media blobs after idle/background time, keeping the
* open player/preview valid. File handles and saved metadata remain intact. */
function trimObjectUrls(keepIds = []) {
	const keep = new Set(keepIds);
	for (const [id, url] of objectUrls) if (!keep.has(id) && !pinnedUrls.has(id)) {
		URL.revokeObjectURL(url);
		objectUrls.delete(id);
	}
}
/** Watch rooms keep their selected file alive even when the main player is closed. */
function pinPlayUrl(id) {
	pinnedUrls.set(id, (pinnedUrls.get(id) ?? 0) + 1);
	let released = false;
	return () => {
		if (released) return;
		released = true;
		const count = pinnedUrls.get(id) ?? 0;
		if (count <= 1) pinnedUrls.delete(id);
		else pinnedUrls.set(id, count - 1);
	};
}
function getSourceMemorySnapshot() {
	return {
		objectUrls: objectUrls.size,
		fileHandles: fileHandles.size,
		files: files.size
	};
}
function rememberFile(id, file) {
	files.set(id, file);
}
function rememberFileHandle(id, handle) {
	fileHandles.set(id, handle);
	files.delete(id);
}
function rememberDirHandle(folderId, handle) {
	dirHandles.set(folderId, handle);
}
function getDirHandle(folderId) {
	return dirHandles.get(folderId);
}
function forgetFolder(folderId, videoIds) {
	dirHandles.delete(folderId);
	for (const id of videoIds) {
		files.delete(id);
		fileHandles.delete(id);
		const url = objectUrls.get(id);
		if (url) {
			URL.revokeObjectURL(url);
			objectUrls.delete(id);
		}
	}
}
function rememberObjectUrl(id, url) {
	if (objectUrls.has(id)) {
		const prev = objectUrls.get(id);
		if (prev && prev !== url) URL.revokeObjectURL(prev);
		objectUrls.delete(id);
	}
	while (objectUrls.size >= MAX_OBJECT_URLS) {
		const oldest = [...objectUrls.keys()].find((key) => !pinnedUrls.has(key));
		if (!oldest) break;
		const prev = objectUrls.get(oldest);
		if (prev) URL.revokeObjectURL(prev);
		objectUrls.delete(oldest);
	}
	objectUrls.set(id, url);
}
async function resolvePlayUrl(video) {
	if (video.src) return video.src;
	const cached = objectUrls.get(video.id);
	if (cached) {
		objectUrls.delete(video.id);
		objectUrls.set(video.id, cached);
		return cached;
	}
	let file = files.get(video.id);
	if (!file) {
		const handle = fileHandles.get(video.id);
		if (handle) file = await handle.getFile();
	}
	if (!file && video.folderId && video.path) {
		const root = dirHandles.get(video.folderId);
		if (root) try {
			const segments = video.path.split("/").filter(Boolean);
			const leaf = segments.pop();
			let dir = root;
			for (const segment of segments) dir = await dir.getDirectoryHandle(segment);
			if (leaf) {
				const handle = await dir.getFileHandle(leaf);
				rememberFileHandle(video.id, handle);
				file = await handle.getFile();
			}
		} catch {}
	}
	if (!file) throw new Error("This file is no longer available. Add the folder again.");
	const url = URL.createObjectURL(file);
	rememberObjectUrl(video.id, url);
	return url;
}
var MAX_DEPTH = 14;
var MAX_DRIVE_DEPTH = 12;
function asOpts(arg) {
	if (typeof arg === "function") return { onProgress: arg };
	return arg ?? {};
}
function aborted(signal) {
	return Boolean(signal?.aborted);
}
async function yieldUi() {
	await new Promise((r) => setTimeout(r, 0));
}
var BATCH_SIZE = 250;
function inferGenre(name) {
	const text = name.toLowerCase();
	if (/\b(comedy|funny|standup|sitcom)\b/.test(text)) return "Comedy";
	if (/\b(horror|scary|slasher|ghost)\b/.test(text)) return "Horror";
	if (/\b(action|fight|battle|war)\b/.test(text)) return "Action";
	if (/\b(documentary|documentary|history|nature)\b/.test(text)) return "Documentary";
	if (/\b(sci[ .-]?fi|science fiction|space)\b/.test(text)) return "Science Fiction";
}
function maybeFlush(acc, flushed, onBatch, force = false) {
	if (!onBatch) return;
	if (!force && acc.length - flushed.n < BATCH_SIZE) return;
	if (acc.length <= flushed.n) return;
	onBatch(acc.slice(flushed.n));
	flushed.n = acc.length;
}
function throttleProgress(opts, state, progress) {
	const now = typeof performance !== "undefined" ? performance.now() : Date.now();
	if (progress.found - state.lastFound < 40 && now - state.lastAt < 150 && progress.found % 200 !== 0) return;
	state.lastAt = now;
	state.lastFound = progress.found;
	opts.onProgress?.(progress);
}
async function ingestDirectoryHandle(dir, folderId, arg) {
	const opts = asOpts(arg);
	const acc = [];
	const flushed = { n: 0 };
	const drive = opts.drive ?? isDriveName(dir.name);
	if (opts.imagesOnly) {
		await walkImagesBreadthFirst(dir, dir.name, opts, drive);
		return acc;
	}
	await walkHandle(dir, "", folderId, acc, dir.name, opts, flushed, 0, drive);
	if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
	return acc;
}
async function walkImagesBreadthFirst(root, folderName, opts, drive) {
	const maxDepth = drive ? MAX_DRIVE_DEPTH : MAX_DEPTH;
	const queue = [{
		dir: root,
		prefix: "",
		depth: 0
	}];
	let cursor = 0;
	let found = 0;
	let looked = 0;
	const progress = {
		lastAt: 0,
		lastFound: 0
	};
	while (cursor < queue.length && !aborted(opts.signal)) {
		const { dir, prefix, depth } = queue[cursor++];
		if (depth > maxDepth) continue;
		const iterable = dir;
		if (typeof iterable.entries !== "function") continue;
		for await (const [name, handle] of iterable.entries()) {
			if (aborted(opts.signal)) return;
			looked += 1;
			if (handle.kind === "directory") {
				if (!shouldSkipDir(name)) queue.push({
					dir: handle,
					prefix: `${prefix}${name}/`,
					depth: depth + 1
				});
			} else if (handle.kind === "file" && /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(name)) try {
				const file = await handle.getFile();
				found += 1;
				opts.onImage?.(file, prefix + name);
				throttleProgress(opts, progress, {
					found,
					looked,
					folderName,
					current: prefix + name
				});
				if (found % 8 === 0) await yieldUi();
			} catch {}
			if (looked % 160 === 0) await yieldUi();
		}
	}
}
async function walkHandle(dir, prefix, folderId, acc, folderName, opts, flushed, depth, drive, progressState = {
	lastAt: 0,
	lastFound: 0
}) {
	if (depth > (drive ? MAX_DRIVE_DEPTH : MAX_DEPTH) || aborted(opts.signal)) return;
	const iterable = dir;
	if (typeof iterable.entries !== "function") return;
	let looked = 0;
	for await (const [name, handle] of iterable.entries()) {
		if (aborted(opts.signal)) return;
		looked += 1;
		if (handle.kind === "directory") {
			if (shouldSkipDir(name)) continue;
			await walkHandle(handle, `${prefix}${name}/`, folderId, acc, folderName, opts, flushed, depth + 1, drive, progressState);
		} else if (handle.kind === "file" && !opts.imagesOnly && isVideoFile(name)) try {
			const fileHandle = handle;
			const file = await fileHandle.getFile();
			pushVideo(acc, folderId, prefix + name, file, fileHandle);
			throttleProgress(opts, progressState, {
				found: acc.length,
				looked,
				folderName,
				current: prefix + name
			});
			maybeFlush(acc, flushed, opts.onBatch);
			if (acc.length % 20 === 0) await yieldUi();
		} catch {}
		else if (handle.kind === "file" && /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(name)) try {
			opts.onImage?.(await handle.getFile(), prefix + name);
		} catch {}
		else if (looked % 200 === 0) {
			throttleProgress(opts, progressState, {
				found: acc.length,
				looked,
				folderName,
				current: prefix + name
			});
			await yieldUi();
		}
	}
}
async function ingestFileList(list, folderId, folderName, arg) {
	const opts = asOpts(arg);
	const files = Array.from(list);
	const acc = [];
	const flushed = { n: 0 };
	let looked = 0;
	const progressState = {
		lastAt: 0,
		lastFound: 0
	};
	for (const file of files) {
		if (aborted(opts.signal)) break;
		looked += 1;
		const rel = "webkitRelativePath" in file && file.webkitRelativePath ? file.webkitRelativePath : file.name;
		const parts = rel.split("/").filter(Boolean);
		if (parts.some((p, i) => i < parts.length - 1 && shouldSkipDir(p))) continue;
		if (!isVideoFile(file.name, file.type)) continue;
		pushVideo(acc, folderId, rel, file);
		throttleProgress(opts, progressState, {
			found: acc.length,
			looked,
			folderName,
			current: rel
		});
		maybeFlush(acc, flushed, opts.onBatch);
		if (acc.length % 20 === 0) await yieldUi();
	}
	if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
	return acc;
}
function readAllEntries(reader) {
	return new Promise((resolve, reject) => {
		const out = [];
		const pump = () => {
			reader.readEntries((batch) => {
				if (!batch.length) resolve(out);
				else {
					out.push(...batch);
					pump();
				}
			}, reject);
		};
		pump();
	});
}
function entryFile(entry) {
	return new Promise((resolve, reject) => entry.file(resolve, reject));
}
async function ingestDataTransfer(dt, folderId, folderName, arg) {
	const opts = asOpts(arg);
	const acc = [];
	const flushed = { n: 0 };
	const items = dt.items;
	const entries = [];
	if (items && items.length) for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const entry = item.webkitGetAsEntry?.call(item) ?? null;
		if (entry) entries.push(entry);
	}
	if (entries.length) {
		for (const entry of entries) await walkEntry(entry, "", folderId, acc, folderName, opts, flushed, 0);
		if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
		if (acc.length) return acc;
	}
	if (dt.files?.length) return ingestFileList(dt.files, folderId, folderName, opts);
	return acc;
}
async function walkEntry(entry, prefix, folderId, acc, folderName, opts, flushed, depth) {
	if (depth > MAX_DEPTH || aborted(opts.signal)) return;
	if (entry.isDirectory) {
		if (shouldSkipDir(entry.name)) return;
		const children = await readAllEntries(entry.createReader());
		const nextPrefix = prefix ? `${prefix}${entry.name}/` : "";
		for (const child of children) await walkEntry(child, nextPrefix, folderId, acc, folderName, opts, flushed, depth + 1);
		return;
	}
	if (entry.isFile && isVideoFile(entry.name)) try {
		const file = await entryFile(entry);
		const rel = prefix ? `${prefix}${entry.name}` : entry.name;
		pushVideo(acc, folderId, rel, file);
		if (acc.length % 40 === 0 || acc.length < 5) opts.onProgress?.({
			found: acc.length,
			looked: acc.length,
			folderName,
			current: rel
		});
		maybeFlush(acc, flushed, opts.onBatch);
		if (acc.length % 20 === 0) await yieldUi();
	} catch {}
}
function pushVideo(acc, folderId, relPath, file, handle) {
	const name = file.name;
	const id = `${folderId}:${relPath}`;
	if (handle) rememberFileHandle(id, handle);
	else rememberFile(id, file);
	acc.push({
		id,
		folderId,
		name,
		path: relPath,
		extension: extensionOf(name),
		mime: file.type || mimeFromName(name),
		size: file.size,
		addedAt: Date.now(),
		genre: inferGenre(`${relPath} ${name}`)
	});
}
async function pickDirectory(startIn) {
	if (typeof window === "undefined") return "fallback";
	const picker = window.showDirectoryPicker;
	if (typeof picker !== "function") return "fallback";
	try {
		if (startIn === "drive") return await picker({
			id: "reelcase-drive",
			mode: "read"
		});
		return await picker({
			id: startIn ? `reelcase-${startIn}` : "reelcase-videos",
			mode: "read",
			startIn: startIn ?? "videos"
		});
	} catch (err) {
		if (err?.name === "AbortError") return "abort";
		return "fallback";
	}
}
async function queryDirPermission(handle) {
	const h = handle;
	if (typeof h.queryPermission !== "function") return "granted";
	return h.queryPermission({ mode: "read" });
}
async function requestDirPermission(handle) {
	const h = handle;
	if (typeof h.queryPermission !== "function") return true;
	if (await h.queryPermission({ mode: "read" }) === "granted") return true;
	if (typeof h.requestPermission !== "function") return false;
	return await h.requestPermission({ mode: "read" }) === "granted";
}
function sourceReady(channel, now) {
	const failure = channel.lastProviderFailure;
	if (!failure) return true;
	if (failure.kind === "rate-limited") return now >= (failure.retryAt ?? failure.at + 3e5);
	if (failure.retryAt) return now >= failure.retryAt;
	const wait = failure.kind === "network-offline" ? 3e4 : failure.kind === "response-budget" ? 6e4 : failure.kind === "malformed" ? 12e4 : failure.kind === "integrity-challenge" ? 3e5 : 36e5;
	return now - failure.at >= wait;
}
/** Feed checks rotate durably across confirmed creators. A catalog-only rate
* limit must not suppress their independent RSS feeds; unresolved handles
* cannot turn a lightweight check into another expensive HTML request. */
function selectYoutubeFeedChannels(channels, counts, now, limit) {
	const eligible = channels.filter((channel) => channel.kind === "youtube" && !channel.importNeedsReview && !channel.id.startsWith("ytpl:") && (channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id)) && recentPullReady(channel, now)).sort((a, b) => (a.recentPull?.attemptedAt ?? 0) - (b.recentPull?.attemptedAt ?? 0) || a.id.localeCompare(b.id));
	const empty = eligible.filter((channel) => !(counts.get(channel.id) ?? 0)).slice(0, Math.ceil(limit / 2));
	const selected = new Set(empty.map((channel) => channel.id));
	return [...empty, ...eligible.filter((channel) => !selected.has(channel.id)).slice(0, Math.max(0, limit - empty.length))];
}
/** Resume the least recently crawled creator first; completed archives rest a week. */
function selectYoutubeSweepChannels(channels, now, count, exhaustedRecheckMs, options) {
	const youtube = channels.filter((channel) => channel.kind === "youtube" && !channel.importNeedsReview && (options?.includePlaylists || !channel.id.startsWith("ytpl:"))).filter((channel) => options?.includeExhausted || sourceReady(channel, now)).filter((channel) => options?.includeExhausted || !channel.catalogExhaustedAt || now - channel.catalogExhaustedAt >= exhaustedRecheckMs);
	const sorted = (youtube.length ? youtube : options?.recheckExhaustedWhenIdle ? channels.filter((channel) => channel.kind === "youtube" && !channel.importNeedsReview && (options.includePlaylists || !channel.id.startsWith("ytpl:"))) : []).sort((a, b) => {
		const aCount = options?.videoCounts?.get(a.id) ?? 0;
		const bCount = options?.videoCounts?.get(b.id) ?? 0;
		const boost = 864e5;
		const priority = (channel, videos) => Math.max(channel.catalogCheckedAt ?? 0, channel.lastProviderFailure?.at ?? 0) - (options?.videoCounts && videos < 100 ? boost : 0);
		return priority(a, aCount) - priority(b, bCount) || aCount - bCount || a.id.localeCompare(b.id);
	});
	if (!options?.videoCounts) return sorted.slice(0, count);
	const confirmed = sorted.filter((channel) => channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id) || channel.id.startsWith("ytpl:") || (options.videoCounts.get(channel.id) ?? 0) > 0);
	const confirmedIds = new Set(confirmed.map((channel) => channel.id));
	const unresolved = sorted.filter((channel) => !confirmedIds.has(channel.id));
	if (!confirmed.length) return unresolved.slice(0, count);
	const recoverySlots = count > 1 && unresolved.length ? Math.min(unresolved.length, Math.ceil(count / 8)) : 0;
	const selected = confirmed.slice(0, count - recoverySlots);
	return [...selected, ...unresolved.slice(0, Math.max(recoverySlots, count - selected.length))].slice(0, count);
}
/**
* Keep known-live creators fresh while reserving half the batch to discover
* new streams across a large follow list. Both groups rotate least-recently
* checked first.
*/
function selectYoutubeLiveChannels(channels, count, confirmedOnly = false) {
	const eligible = channels.filter((channel) => channel.kind === "youtube" && !channel.importNeedsReview && !channel.id.startsWith("ytpl:")).filter((channel) => !confirmedOnly || channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id)).sort((a, b) => (a.liveCheckedAt ?? 0) - (b.liveCheckedAt ?? 0) || a.id.localeCompare(b.id));
	const active = eligible.filter((channel) => channel.live);
	const discovery = eligible.filter((channel) => !channel.live);
	const activeSlots = Math.min(active.length, Math.ceil(Math.max(0, count) / 2));
	const selected = [...active.slice(0, activeSlots), ...discovery.slice(0, Math.max(0, count) - activeSlots)];
	if (selected.length < count) selected.push(...active.slice(activeSlots, activeSlots + count - selected.length));
	return selected;
}
/** One owner picks the next due job. Busy/paused skips never consume a turn.
* Archive recovery gets the first probe after a provider cooldown; otherwise
* the oldest due lane wins so feed/live/Twitch jobs keep receiving turns.
* Visible idle pages retain bounded archives and recent feeds. Healthy feeds
* can keep adding uploads while deeper catalog requests are cooling down. */
function nextRemoteRefresh(turns, now, active = true) {
	const due = turns.filter((turn) => turn.eligible && (active || turn.lane === "youtube-archive" || turn.lane === "youtube-feed") && (!turn.lastAttemptAt || now - turn.lastAttemptAt >= turn.intervalMs));
	return due.find((turn) => turn.recovery)?.lane ?? due.sort((a, b) => (a.lastAttemptAt ? a.lastAttemptAt + a.intervalMs : 0) - (b.lastAttemptAt ? b.lastAttemptAt + b.intervalMs : 0))[0]?.lane ?? null;
}
/** A bounded sweep adds several small creator responses without growing a
* single response or outrunning a slow user-selected network gap. */
function scheduledYoutubeSources(sourceLimit, requestGapMs) {
	return Math.max(1, Math.min(LIBRARY_LIMITS.youtubeScheduledRefreshChannels, sourceLimit, Math.floor(6e4 / Math.max(1, requestGapMs * 6))));
}
var indexes = /* @__PURE__ */ new WeakMap();
function addFollow(index, follow, position) {
	const title = follow.title.trim();
	if (!title || follow.kind !== "youtube" && follow.kind !== "twitch") return;
	const candidate = {
		title,
		key: normalizedLabel(title),
		position
	};
	for (const [map, id] of [[index.channels, stableId(follow.channelId)], [index.sources, stableId(follow.id)]]) {
		if (!id) continue;
		const key = `${follow.kind}:${id}`, bucket = map.get(key);
		if (!bucket) map.set(key, {
			rows: [candidate],
			names: /* @__PURE__ */ new Set([candidate.key])
		});
		else if (!bucket.names.has(candidate.key)) {
			bucket.names.add(candidate.key);
			bucket.rows.push(candidate);
		}
	}
}
function named(video) {
	const existingName = video.remote?.channelName?.trim();
	if (existingName) return {
		status: "present",
		channelName: existingName
	};
	if (!video.remote || video.remote.kind !== "youtube" && video.remote.kind !== "twitch") return { status: "unsupported" };
}
function resolveIndexed(video, index) {
	const known = named(video);
	if (known) return known;
	const kind = video.remote.kind, channelId = stableId(video.remote.channelId), sourceId = stableId(video.folderId);
	const channels = channelId ? index.channels.get(`${kind}:${channelId}`)?.rows : void 0;
	const sources = sourceId ? index.sources.get(`${kind}:${sourceId}`)?.rows : void 0;
	const names = /* @__PURE__ */ new Map();
	let channel = 0, source = 0;
	while (channel < (channels?.length ?? 0) || source < (sources?.length ?? 0)) {
		const fromChannel = channel < (channels?.length ?? 0) && (source >= (sources?.length ?? 0) || channels[channel].position <= sources[source].position);
		const candidate = fromChannel ? channels[channel++] : sources[source++];
		if (!names.has(candidate.key)) names.set(candidate.key, {
			title: candidate.title,
			evidence: fromChannel ? "channel-id" : "source-id"
		});
	}
	const candidates = [...names.values()].sort((left, right) => left.title.localeCompare(right.title));
	if (!candidates.length) return { status: "unresolved" };
	if (candidates.length > 1) return {
		status: "ambiguous",
		candidates: candidates.map((candidate) => candidate.title)
	};
	return {
		status: "resolved",
		channelName: candidates[0].title,
		evidence: candidates[0].evidence
	};
}
/** Batch owners prepare exact identifier indexes in cancelable tasks. Only
* completed immutable follow snapshots are cached; no video result cache grows. */
async function prepareCreatorCoverageResolver(follows, turn) {
	await turn();
	let index = indexes.get(follows);
	if (!index) {
		index = {
			channels: /* @__PURE__ */ new Map(),
			sources: /* @__PURE__ */ new Map()
		};
		const prepared = index;
		await forEachCatalogSlice(follows, (follow, position) => addFollow(prepared, follow, position), turn);
		await turn();
		indexes.set(follows, index);
	}
	const prepared = index;
	return (video) => resolveIndexed(video, prepared);
}
function normalizedLabel(value) {
	return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}
function stableId(value) {
	return value?.trim() ?? "";
}
/** Retain only the next repair batch and an exact remaining count. Scan
* checkpoints survive interaction holds; changed catalogs/follows restart the
* scan. Publication copies references in tasks and patches only touched keys. */
function creatorCoverageRepairStep(options) {
	let scan;
	return async (signal, turn) => {
		const state = options.get();
		if (!scan || scan.videos !== state.videos || scan.follows !== state.follows) scan = {
			videos: state.videos,
			follows: state.follows,
			offset: 0,
			total: 0,
			candidates: []
		};
		const current = scan;
		const progress = () => ({
			scanned: current.offset,
			total: current.videos.length,
			changed: 0,
			batches: 0
		});
		const pending = () => ({
			done: false,
			progress: progress()
		});
		const scanValid = () => options.get().videos === current.videos && options.get().follows === current.follows;
		current.resolve ??= await prepareCreatorCoverageResolver(current.follows, turn);
		signal.throwIfAborted();
		if (!scanValid()) return pending();
		const candidates = current.candidates.slice();
		let total = current.total;
		const end = Math.min(current.videos.length, current.offset + 2048);
		await forEachCatalogSlice(current.videos.slice(current.offset, end), (video) => {
			const resolution = current.resolve(video);
			if (resolution.status !== "resolved") return;
			total++;
			if (candidates.length < options.limit) candidates.push({
				id: video.id,
				channelName: resolution.channelName
			});
		}, turn);
		signal.throwIfAborted();
		if (!scanValid()) return pending();
		current.offset = end;
		current.total = total;
		current.candidates = candidates;
		if (end < current.videos.length) return pending();
		if (!candidates.length) return {
			done: true,
			progress: progress(),
			result: {
				processed: 0,
				repaired: 0,
				tagged: 0,
				remaining: 0
			}
		};
		const base = options.get();
		const valid = () => {
			const latest = options.get();
			return latest.videos === base.videos && latest.follows === base.follows && latest.tags === base.tags && latest.metadataProvenance === base.metadataProvenance;
		};
		const checkedTurn = async () => {
			await turn();
			if (!valid()) throw new DOMException("Creator repair inputs changed", "AbortError");
		};
		try {
			const repairs = new Map(candidates.map((candidate) => [candidate.id, candidate.channelName]));
			const changed = /* @__PURE__ */ new Map(), videos = new Array(base.videos.length);
			await forEachCatalogSlice(base.videos, (video, offset) => {
				const channelName = repairs.get(video.id);
				const repaired = channelName && video.remote ? {
					...video,
					remote: {
						...video.remote,
						channelName
					}
				} : video;
				videos[offset] = repaired;
				if (repaired !== video) changed.set(video.id, repaired);
			}, checkedTurn);
			const tags = sparseRecordBuilder(base.tags), provenance = sparseRecordBuilder(base.metadataProvenance);
			const rows = [];
			let tagged = 0;
			for (const video of changed.values()) {
				const patch = options.tags(video, base);
				const row = { video };
				if (patch) {
					if (patch.tags !== base.tags[video.id]) tagged++;
					tags.set(video.id, patch.tags);
					provenance.set(video.id, patch.provenance);
					row.enrichment = {
						id: video.id,
						tags: patch.tags,
						provenance: patch.provenance
					};
				}
				rows.push(row);
			}
			const next = {
				videos,
				tags: tags.finish(),
				metadataProvenance: provenance.finish()
			};
			await checkedTurn();
			await options.save(rows, checkedTurn, valid);
			signal.throwIfAborted();
			if (!valid()) return pending();
			options.publish(next);
			return {
				done: true,
				progress: {
					...progress(),
					changed: candidates.length,
					batches: 1
				},
				result: {
					processed: candidates.length,
					repaired: candidates.length,
					tagged,
					remaining: Math.max(0, total - candidates.length)
				}
			};
		} catch (error) {
			signal.throwIfAborted();
			if (error instanceof DOMException && error.name === "AbortError") return pending();
			throw error;
		}
	};
}
var KEY = "reelcase.pull-history.v1";
var MAX_RECORDS = 100;
function loadPullHistory() {
	if (typeof window === "undefined") return [];
	try {
		const value = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
		if (!Array.isArray(value)) return [];
		return value.filter((row) => Boolean(row && typeof row === "object" && typeof row.id === "string" && typeof row.startedAt === "number" && typeof row.finishedAt === "number" && [
			"youtube",
			"twitch",
			"adult",
			"photos",
			"multi"
		].includes(row.provider) && [
			"success",
			"partial",
			"failed"
		].includes(row.status))).slice(0, MAX_RECORDS);
	} catch {
		return [];
	}
}
function savePullHistory(records) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
	} catch {}
}
function makePullId() {
	return `pull:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}
var current = null;
var revision = 0;
var listeners = /* @__PURE__ */ new Set();
var now = () => typeof performance === "undefined" ? Date.now() : performance.now();
var notify = () => {
	revision += 1;
	for (const listener of listeners) listener();
};
var getYoutubeTraceRevision = () => revision;
var subscribeYoutubeTrace = (listener) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
/** Local-only timing. No channel names, video IDs, or viewing events are retained. */
function beginYoutubeFirstClick(providerBusy = false, at = now()) {
	current = {
		startedAt: at,
		artwork: "pending",
		provider: providerBusy ? "running" : "idle",
		providerOverlapMs: 0,
		...providerBusy ? { providerStartedAt: at } : {}
	};
	notify();
}
function markYoutubeSelectorReady(rows, workMs, at = now()) {
	if (!current || rows <= 0 || current.selectorReadyMs !== void 0) return;
	current.catalogRows = rows;
	current.selectorMs = Math.max(0, Math.round(workMs));
	current.selectorReadyMs = Math.max(0, Math.round(at - current.startedAt));
	notify();
}
function markYoutubePreparationReady(startedAt, elapsedMs, yields) {
	if (!current || current.startedAt !== startedAt || current.preparationMs !== void 0) return;
	current.preparationMs = Math.max(0, Math.round(elapsedMs));
	current.preparationYields = Math.max(0, Math.floor(yields));
	notify();
}
function markYoutubeProviderStart(at = now()) {
	if (!current || current.railReadyMs !== void 0 || current.providerStartedAt !== void 0) return;
	current.provider = "running";
	current.providerStartedAt = at;
	notify();
}
function markYoutubeProviderFinish(at = now()) {
	if (!current || current.providerStartedAt === void 0) return;
	const railAt = current.railReadyMs === void 0 ? at : current.startedAt + current.railReadyMs;
	current.providerOverlapMs = Math.max(0, Math.round(Math.min(at, railAt) - current.providerStartedAt));
	current.provider = "finished";
	current.providerStartedAt = void 0;
	notify();
}
/** A text-first card is usable before its thumbnail finishes decoding. */
function markYoutubeRailReady(cards, at = now()) {
	if (!current || current.railReadyMs !== void 0 || cards <= 0) return false;
	current.railReadyMs = Math.max(0, Math.round(at - current.startedAt));
	current.railCards = cards;
	if (current.providerStartedAt !== void 0) current.providerOverlapMs = Math.max(0, Math.round(at - current.providerStartedAt));
	notify();
	return true;
}
function markYoutubeArtworkReady(loaded, at = now()) {
	if (!current || current.railReadyMs === void 0 || current.artwork !== "pending") return;
	current.artwork = loaded ? "loaded" : "deferred";
	current.artworkWaitMs = Math.max(0, Math.round(at - current.startedAt - current.railReadyMs));
	notify();
}
function getYoutubeFirstClickTrace() {
	if (!current) return null;
	const { providerStartedAt: _providerStartedAt, ...snapshot } = current;
	return snapshot;
}
var store_exports = /* @__PURE__ */ __exportAll$1({
	isAdultVideo: () => isAdultVideo,
	prepareContinueSelection: () => prepareContinueSelection,
	prepareFavoritesSelection: () => prepareFavoritesSelection,
	prepareHistorySelection: () => prepareHistorySelection,
	preparePrivateSelection: () => preparePrivateSelection,
	prepareRecoveryBrowse: () => prepareRecoveryBrowse,
	prepareYoutubeSelection: () => prepareYoutubeSelection,
	rebaseSharedCatalog: () => rebaseSharedCatalog,
	resumeForVideo: () => resumeForVideo,
	retryLibraryPersistence: () => retryLibraryPersistence,
	selectAdultRemote: () => selectAdultRemote,
	selectClassics: () => selectClassics,
	selectContinue: () => selectContinue,
	selectFavorites: () => selectFavorites,
	selectHistory: () => selectHistory,
	selectLive: () => selectLive,
	selectTwitch: () => selectTwitch,
	selectVisible: () => selectVisible,
	selectYoutube: () => selectYoutube,
	trimCatalogSelectorCaches: () => trimCatalogSelectorCaches,
	useLibrary: () => useLibrary,
	userFolderCount: () => userFolderCount
});
var restoring = false;
var navigationChanged = false;
var remoteRefreshCursor = 0;
var twitchRefreshCursor = 0;
var twitchPolicyCursor = 0;
var youtubeRefreshCursor = 0;
var youtubeLiveCheckBusy = false;
var twitchLiveCheckBusy = false;
var historyRecoveryCardCache = /* @__PURE__ */ new Map();
var REMOTE_REFRESH_BATCH_SIZE = LIBRARY_LIMITS.remoteRefreshChannelBatch;
var STARTER_FOLLOWS = [
	{
		id: "yt:starter-h3",
		kind: "youtube",
		handle: "H3Podcast",
		title: "H3 Podcast"
	},
	{
		id: "yt:starter-ltt",
		kind: "youtube",
		handle: "LinusTechTips",
		title: "Linus Tech Tips"
	},
	{
		id: "tw:starter-ironmouse",
		kind: "twitch",
		handle: "ironmouse",
		title: "Ironmouse"
	},
	{
		id: "tw:starter-zackrawrr",
		kind: "twitch",
		handle: "zackrawrr",
		title: "Zackrawrr"
	}
];
var metadataTailCursor = enrichmentCursor();
var preferencesRestored = false;
var restoreCompletion;
var personalRestoreCompletion = Promise.resolve();
var savedShelfRevision = 0;
var durableSliceWriter = new SliceWriter();
function journalManualMetadata(id, field, get, set) {
	const state = get(), saved = saveCatalogMetadataEdit({
		id,
		field,
		tags: state.tags[id] ?? [],
		provenance: state.metadataProvenance[id] ?? { tags: {} },
		category: state.categories[id]
	});
	if (saved?.provenance) set({ metadataProvenance: patchSparseRecord(state.metadataProvenance, [[id, saved.provenance]]) });
}
function persistNow(get) {
	if (!preferencesRestored) return;
	const s = get();
	const prefs = {
		favorites: Object.keys(s.favorites),
		likes: Object.keys(s.likes),
		tags: s.tags,
		metadataProvenance: s.metadataProvenance,
		categories: s.categories,
		progress: s.progress,
		resumeProgress: s.resumeProgress,
		history: s.history,
		viewCounts: s.viewCounts,
		cameCounts: s.cameCounts,
		view: s.view,
		sort: s.sort,
		hideDemo: s.hideDemo,
		sourceId: s.sourceId === "adults" || s.sourceId === "adult-fetishes" ? "home" : s.sourceId,
		hardwareAccel: s.hardwareAccel,
		privateFolderIds: s.folders.filter((f) => f.adult).map((f) => f.id),
		adultPinHash: s.adultPinHash,
		sortDir: "asc",
		extFilter: "all",
		sizeFilter: "any",
		playableOnly: false,
		groupBy: "none",
		follows: s.follows,
		notices: s.notices.slice(0, 40),
		notifyPush: s.notifyPush,
		unavailableVideoIds: Object.keys(s.unavailable),
		hiddenVideoIds: Object.keys(s.hiddenVideos)
	};
	durableSliceWriter.write("follows", [s.follows], () => saveFollows(s.follows));
	persistActivityNow(get, true);
	durableSliceWriter.write("shelves", [s.favorites, s.likes], () => saveDurableShelves(Object.keys(s.favorites), Object.keys(s.likes)));
	const photoFolders = s.folders.filter((folder) => folder.kind === "directory" || folder.kind === "files");
	durableSliceWriter.write("photos", photoFolders, () => {
		const photoSources = photoFolders.map((folder) => ({
			id: folder.id,
			name: folder.name,
			kind: folder.kind,
			...folder.photoCount != null ? { photoCount: folder.photoCount } : {},
			...folder.lastCheckedAt != null ? { lastCheckedAt: folder.lastCheckedAt } : {}
		}));
		if (photoSources.length) saveDurablePhotos({ sources: photoSources });
	});
	durableSliceWriter.write("preferences", [
		s.favorites,
		s.likes,
		s.tags,
		s.metadataProvenance,
		s.categories,
		s.progress,
		s.resumeProgress,
		s.history,
		s.viewCounts,
		s.cameCounts,
		s.view,
		s.sort,
		s.hideDemo,
		s.sourceId,
		s.hardwareAccel,
		s.folders,
		s.adultPinHash,
		s.follows,
		s.notices,
		s.notifyPush,
		s.unavailable,
		s.hiddenVideos
	], () => savePrefs(prefs));
}
function persistActivityNow(get, snapshot = false) {
	if (!preferencesRestored) return;
	const s = get();
	durableSliceWriter.write("history", [s.history], () => saveDurableHistory(s.history));
	durableSliceWriter.write("resume", [s.progress, s.resumeProgress], () => saveDurableResume(s.progress, s.resumeProgress));
	durableSliceWriter.write("marks", [s.viewCounts, s.cameCounts], () => saveDurableMarks(s.viewCounts, s.cameCounts));
	durableSliceWriter.write("links", snapshot ? [s.history, s.resumeProgress] : [s.history], () => {
		saveRecoveryLinks(s.history, s.resumeProgress);
	});
	if (snapshot) durableSliceWriter.write("activity", [
		s.history,
		s.progress,
		s.resumeProgress,
		s.viewCounts,
		s.cameCounts
	], () => {
		saveActivitySnapshot({
			history: s.history,
			progress: s.progress,
			resumeProgress: s.resumeProgress,
			viewCounts: s.viewCounts,
			cameCounts: s.cameCounts,
			savedAt: Date.now()
		}).catch(() => queueResumeReplay(s.resumeProgress));
	});
}
var cancelActivitySave;
function persistActivity(get) {
	if (typeof window === "undefined") {
		persistActivityNow(get);
		return;
	}
	if (cancelActivitySave) return;
	cancelActivitySave = scheduleBackgroundWork(() => {
		cancelActivitySave = void 0;
		persistActivityNow(get);
	}, {
		timeoutMs: 1e3,
		fallbackDelayMs: 250
	});
}
function mergeHistory(a, b) {
	const rows = /* @__PURE__ */ new Map();
	for (const entry of [...a, ...b]) {
		if (!entry?.id || !Number.isFinite(entry.at)) continue;
		const key = entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`;
		if (!rows.has(key)) rows.set(key, entry);
	}
	return [...rows.values()].sort((left, right) => right.at - left.at);
}
var historyJournalSession = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
var historyEventSequence = 0;
function nextHistoryEventId(now) {
	historyEventSequence = (historyEventSequence + 1) % 1e6;
	return `h:${historyJournalSession}:${now.toString(36)}:${historyEventSequence.toString(36)}`;
}
var RESUME_QUEUE_KEY = "reelcase.resume-replay.v1";
var MAX_RESUME_DURATION = 2592e3;
function validResumeMark(mark) {
	return Boolean(mark && Number.isFinite(mark.t) && Number.isFinite(mark.d) && Number.isFinite(mark.at) && mark.d > .25 && mark.d <= MAX_RESUME_DURATION && mark.t >= 0 && mark.t <= mark.d * 1.015);
}
function normalizeResumeMark(mark) {
	if (!validResumeMark(mark)) return void 0;
	return {
		t: Math.min(mark.t, mark.d),
		d: mark.d,
		at: mark.at
	};
}
function stableResumeKeys(video) {
	return [...new Set([
		`id:${video.id}`,
		video.remote?.watchUrl,
		video.remote?.embedUrl,
		video.src,
		video.path
	].filter((key) => Boolean(key)))];
}
function newestResume(...marks) {
	return marks.reduce((best, mark) => {
		const normalized = normalizeResumeMark(mark);
		return normalized && (!best || normalized.at > best.at) ? normalized : best;
	}, void 0);
}
function isResumable(video, mark) {
	if (!mark) return false;
	const minimumSeconds = video.remote ? 2 : 5;
	const completeAt = video.remote ? .992 : .985;
	return mark.t >= minimumSeconds && mark.t / mark.d < completeAt;
}
function reconcileResumeForVideos(videos, progress, resumeProgress) {
	const updates = [], changed = /* @__PURE__ */ new Map();
	for (const video of videos) {
		const mark = newestResume(changed.get(video.id) ?? progress[video.id], resumeProgress[`id:${video.id}`], video.remote?.watchUrl ? resumeProgress[video.remote.watchUrl] : void 0, video.remote?.embedUrl ? resumeProgress[video.remote.embedUrl] : void 0, video.src ? resumeProgress[video.src] : void 0, video.path ? resumeProgress[video.path] : void 0);
		const before = changed.get(video.id) ?? progress[video.id];
		if (mark && (before?.t !== mark.t || before.d !== mark.d || before.at !== mark.at)) {
			changed.set(video.id, mark);
			updates.push([video.id, mark]);
		}
	}
	return patchActivityRecord(progress, updates);
}
function queueResumeReplay(records) {
	try {
		const next = {
			...JSON.parse(localStorage.getItem(RESUME_QUEUE_KEY) ?? "{}"),
			...records
		};
		const kept = Object.entries(next).filter(([, mark]) => validResumeMark(mark)).sort((a, b) => b[1].at - a[1].at).slice(0, 600);
		localStorage.setItem(RESUME_QUEUE_KEY, JSON.stringify(Object.fromEntries(kept)));
	} catch {}
}
function takeQueuedResumeReplay() {
	try {
		const queued = JSON.parse(localStorage.getItem(RESUME_QUEUE_KEY) ?? "{}");
		localStorage.removeItem(RESUME_QUEUE_KEY);
		return Object.fromEntries(Object.entries(queued).filter(([, mark]) => validResumeMark(mark)));
	} catch {
		return {};
	}
}
var persistTimer = null;
var cancelPrefsSave;
function persistSoon(get) {
	if (typeof window === "undefined") {
		persistNow(get);
		return;
	}
	if (persistTimer != null || cancelPrefsSave) return;
	persistTimer = setTimeout(() => {
		persistTimer = null;
		cancelPrefsSave = scheduleBackgroundWork(() => {
			cancelPrefsSave = void 0;
			persistNow(get);
		});
	}, 900);
}
function flushPersist(get) {
	cancelPrefsSave?.();
	cancelPrefsSave = void 0;
	cancelActivitySave?.();
	cancelActivitySave = void 0;
	if (persistTimer != null) {
		clearTimeout(persistTimer);
		persistTimer = null;
	}
	persistNow(get);
}
function youtubeGoLiveAlerts() {
	try {
		return JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}")["alerts-go-live-alerts"] === true;
	} catch {
		return false;
	}
}
async function reconcilePlaylistCommit(get, set, channels) {
	if (!channels.some((c) => c.playlistWalk?.completed && c.playlistWalk.membership === "provisional")) return;
	for (;;) {
		const snapshot = get();
		const eligible = channels.filter((c) => snapshot.follows.some((f) => f.id === c.id && f.playlistWalk?.id === c.playlistWalk?.id && f.playlistWalk?.at === c.playlistWalk?.at));
		const result = await reconcilePlaylistWalks(snapshot.videos, eligible);
		if (get().videos !== snapshot.videos || get().folders !== snapshot.folders) continue;
		const observed = new Map(result.channels.map((c) => [c.id, c]));
		const folders = snapshot.folders.map((f) => result.folderDeltas?.has(f.id) ? {
			...f,
			videoCount: Math.max(0, (f.videoCount ?? 0) + (result.folderDeltas.get(f.id) ?? 0))
		} : f);
		if (result.folderDeltas?.has("youtube:retained") && !folders.some((f) => f.id === "youtube:retained")) folders.push({
			id: "youtube:retained",
			name: "Retained YouTube videos",
			kind: "youtube",
			videoCount: result.folderDeltas.get("youtube:retained") ?? 0
		});
		set({
			videos: result.videos,
			folders,
			follows: get().follows.map((c) => {
				const next = observed.get(c.id);
				return next && next.playlistWalk?.id === c.playlistWalk?.id && next.playlistWalk?.at === c.playlistWalk?.at ? {
					...c,
					playlistWalk: next.playlistWalk
				} : c;
			})
		});
		if (result.changed.length) await cacheRemotes(get, result.changed, true);
		return;
	}
}
async function cacheRemotes(get, changedVideos, alreadyMerged = false) {
	const s = get();
	const index = changedVideos && !alreadyMerged ? await remoteVideoIndexAsync(s.videos) : null;
	return saveRemoteSnapshot({
		videos: changedVideos ? changedVideos.flatMap((video) => {
			if (alreadyMerged) return [video];
			const card = lookupCatalogIdentity(index, video);
			return card ? [alreadyMerged ? video : withCatalogDetails(card, video)] : [];
		}) : s.videos.filter((video) => video.remote && !video.isSample),
		folders: s.folders.filter((f) => f.kind === "youtube" || f.kind === "twitch"),
		checkedAt: s.remoteCheckedAt,
		metadata: {
			tags: s.tags,
			metadataProvenance: s.metadataProvenance
		}
	}, !changedVideos).catch(() => void 0);
}
function remoteMetadataTags(video) {
	const creator = video.remote?.channelName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "";
	const provider = video.remote?.kind ? `provider-${video.remote.kind}` : "";
	const adult = video.remote && ADULT_PULL_PROVIDERS.includes(video.remote.kind) ? "adult" : "";
	const format = video.remote?.live ? "format-live" : video.remote ? "format-vod" : "";
	const twitchFormat = video.remote?.kind === "twitch" ? video.remote.live ? "twitch-live" : "twitch-vod" : "";
	const genre = video.genre?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const twitchGame = video.remote?.kind === "twitch" && genre ? `twitch-game-${genre}` : "";
	return [...new Set([
		adult,
		provider,
		creator ? `creator-${creator}` : "",
		format,
		twitchFormat,
		genre ? `genre-${genre}` : "",
		twitchGame,
		...semanticTags(video),
		...descriptionKeywordTags(video)
	].filter(Boolean))].slice(0, LIBRARY_LIMITS.remoteMetadataTagsPerTitle);
}
function sameTags(left, right) {
	return left === right || left?.length === right.length && left.every((tag, index) => tag === right[index]);
}
/** Upgrade cached provider cards with the same safe tags created for new pulls.
* Already compact cards are deliberately skipped: a recurring refresh should
* not rescan their title and description just to reproduce the same tags. */
function normalizeTagValue(raw) {
	let tag = raw.trim().toLowerCase().replace(/^keyword-/, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
	if (tag === "role-play") tag = "roleplay";
	if (tag === "fetish-role-play") tag = "fetish-roleplay";
	if (tag === "verified-amateur") tag = "verified-amateurs";
	if (tag === "fetish-verified-amateur") tag = "fetish-verified-amateurs";
	return tag;
}
function tagsLocked(provenance) {
	return provenance?.lockedFields?.includes("tags") ?? false;
}
function editedMetadata(provenance) {
	if (!provenance) return false;
	if (provenance.lockedFields?.length || provenance.category === "manual") return true;
	for (const tag in provenance.tags) if (Object.hasOwn(provenance.tags, tag) && provenance.tags[tag] === "manual") return true;
	return false;
}
function mergeInferredTagProvenance(previousTags, nextTags, existing, inferred, source) {
	const inferredSet = new Set(inferred.map(normalizeTagValue).filter(Boolean));
	const previousSet = new Set(previousTags);
	const previousSources = existing?.tags ?? {};
	const tags = Object.fromEntries(nextTags.map((tag) => [tag, previousSources[tag] ?? (previousSet.has(tag) ? "legacy" : inferredSet.has(tag) ? source : "legacy")]));
	return {
		...existing,
		...source === "provider:youtube" ? { youtubeTextTagVersion: 4 } : {},
		tags,
		updatedAt: sameTags(previousTags, nextTags) && existing?.updatedAt ? existing.updatedAt : Date.now()
	};
}
/** Apply provider tags only to titles whose user-managed tag field is unlocked. */
function enrichRemoteTags(existing, existingProvenance, videos) {
	let tags = existing;
	let metadataProvenance = existingProvenance;
	for (const video of videos) {
		if (!video.remote) continue;
		const current = existing[video.id] ?? [];
		const provenance = existingProvenance[video.id];
		if (tagsLocked(provenance)) continue;
		const inferred = remoteMetadataTags(video);
		const compact = video.remote.kind === "youtube" ? refreshYoutubeTags(current, inferred, provenance, LIBRARY_LIMITS.remoteMetadataTagsPerTitle) : compactIngestedTags(reconcileProviderTopicTags(video, current, provenance), inferred);
		const tagsChanged = !sameTags(current, compact);
		if (tagsChanged) {
			if (tags === existing) tags = { ...existing };
			tags[video.id] = compact;
		}
		const sources = provenance?.tags;
		if (!(!tagsChanged && (video.remote.kind !== "youtube" || provenance?.youtubeTextTagVersion === 4) && provenance?.updatedAt && sources && Object.keys(sources).length === compact.length && compact.every((tag) => sources[tag] !== void 0))) {
			const nextProvenance = mergeInferredTagProvenance(current, compact, provenance, inferred, `provider:${video.remote.kind}`);
			if (metadataProvenance === existingProvenance) metadataProvenance = { ...existingProvenance };
			metadataProvenance[video.id] = nextProvenance;
		}
	}
	return {
		tags,
		metadataProvenance
	};
}
/** Enrich only admitted cards; immutable ledgers copy only touched branches. */
var unchangedPullPolicy = (settings) => settings;
async function prepareRemotePull(get, incoming, known, merge = false, policyFor = unchangedPullPolicy) {
	for (;;) {
		const base = get(), globalPolicy = getPullSettings(), policy = policyFor(globalPolicy);
		const retired = retiredYoutubeKeys(base.youtubeCleanup);
		const signals = {
			favorites: base.favorites,
			likes: base.likes,
			activeId: base.activeId,
			previewId: base.previewId,
			rating: getRating
		};
		const feedbackRevision = retired.size ? getFeedbackRevision() : 0;
		const filtered = [];
		const revived = /* @__PURE__ */ new Set();
		await forEachCatalogSlice(incoming, (video) => {
			if (video.remote && retired.has(cleanupKey(video))) {
				if (!youtubeCleanupProtected(video, signals)) return;
				revived.add(cleanupKey(video));
			}
			filtered.push(video);
		}, yieldCatalogTask);
		if (revived.size) {
			const journal = {
				...base.youtubeCleanup,
				recentKeys: base.youtubeCleanup.recentKeys.filter((key) => !revived.has(key)),
				lastAt: Date.now()
			};
			await saveYoutubeCleanup([], journal);
			useLibrary.setState({ youtubeCleanup: journal });
			known = void 0;
			continue;
		}
		const admission = await admitRemoteEntries(base.videos, filtered, policy, known);
		const tagPatch = sparseRecordBuilder(base.tags), provenancePatch = sparseRecordBuilder(base.metadataProvenance);
		const metadataIndex = admission.videos.some((video) => video.remote?.kind === "youtube") ? await remoteVideoIndexAsync(base.videos) : void 0;
		await forEachCatalogSlice(admission.videos, (video) => {
			const previous = metadataIndex?.get(video.id) ?? metadataIndex?.get(youtubeVideoKey(video) ?? "");
			if (previous?.remote?.youtubeTagsCheckedAt && !video.remote?.youtubeTagsCheckedAt) video = {
				...retainYoutubeMetadata(previous, video),
				description: void 0
			};
			const currentTags = base.tags[video.id], currentProvenance = base.metadataProvenance[video.id];
			const enriched = enrichRemoteTags(currentTags ? { [video.id]: currentTags } : {}, currentProvenance ? { [video.id]: currentProvenance } : {}, [video]);
			if (enriched.tags[video.id] !== currentTags && enriched.tags[video.id]) tagPatch.set(video.id, enriched.tags[video.id]);
			if (enriched.metadataProvenance[video.id] !== currentProvenance && enriched.metadataProvenance[video.id]) provenancePatch.set(video.id, enriched.metadataProvenance[video.id]);
		}, yieldCatalogTask);
		const tags = tagPatch.finish(), metadataProvenance = provenancePatch.finish();
		const folderCounts = /* @__PURE__ */ new Map();
		const merged = merge ? await mergeRemoteCatalogAsync(base.videos, admission.videos.map(catalogCard)) : base.videos;
		if (merge) await forEachCatalogSlice(merged, (video) => {
			folderCounts.set(video.folderId, (folderCounts.get(video.folderId) ?? 0) + 1);
		}, yieldCatalogTask);
		if (get().videos === base.videos && get().tags === base.tags && get().metadataProvenance === base.metadataProvenance && getPullSettings() === globalPolicy && get().youtubeCleanup === base.youtubeCleanup && (!retired.size || get().favorites === base.favorites && get().likes === base.likes && getFeedbackRevision() === feedbackRevision)) return {
			base,
			admission,
			merged,
			folderCounts,
			enriched: {
				tags,
				metadataProvenance
			}
		};
		known = void 0;
	}
}
var ENTRY_LIMIT_MESSAGE = "Saved entry limit reached. Eligible cleanup batches can make room on the next pull; protected entries stay. Adjust cleanup or entry limits in Settings.";
function cleanupNote(group, note) {
	useLibrary.setState((s) => ({
		youtubeCleanupNote: note,
		cleanupNotes: {
			...s.cleanupNotes,
			[group]: note
		}
	}));
}
var CLEANUP_WORK_HELD = Symbol("cleanup-work-held");
/** Replace only after a provider actually returns new identities. Planning
* yields; final protection checks and publication have no intervening await. */
async function rotateSourceCache(get, incoming, budget = getPullSettings().youtubeCleanupBatch, group = "youtube", options = {}) {
	const label = cleanupLabel(group);
	const target = options.target ?? group, reserved = options.reserved ?? 0, policyFor = options.policyFor ?? unchangedPullPolicy;
	if (incoming && (!budget || !cleanupPolicy(getPullSettings(), group).enabled || !incoming.some((video) => entryGroup(video) === target))) return 0;
	const cancellation = getPullCancellationRevision();
	const turn = async () => {
		await yieldCatalogTask();
		if (getPullCancellationRevision() !== cancellation) throw new Error("Pull cancelled; accepted catalog entries remain saved.");
		if (incoming && !catalogPullAvailable()) throw CLEANUP_WORK_HELD;
	};
	for (;;) {
		const base = get(), globalPolicy = getPullSettings(), settings = policyFor(globalPolicy);
		const counts = await remoteEntryCounts(base.videos);
		const policy = cleanupPolicy(settings, group);
		let limit = Math.min(budget, policy.batch);
		let overage = 0;
		let replacementSources;
		const exclude = /* @__PURE__ */ new Set();
		if (incoming) {
			if (!rotationAvailable(counts, settings, group, limit) || !cleanupPolicy(settings, target).enabled || settings[`${target}MaxEntries`] <= 0) return 0;
			if (group !== target && !counts[group]) return 0;
			if (group !== target && (!settings.sharedCapCleanup || counts[target] >= settings[`${target}MaxEntries`])) return 0;
			const reservedCounts = {
				...counts,
				total: counts.total + reserved
			};
			if (remainingEntrySlots(reservedCounts, settings, target) >= incoming.length) return 0;
			const known = await remoteVideoIndexAsync(base.videos), retired = retiredYoutubeKeys(base.youtubeCleanup), fresh = /* @__PURE__ */ new Set();
			await forEachCatalogSlice(incoming, (video) => {
				const key = cleanupKey(video);
				exclude.add(key);
				if (entryGroup(video) !== target) return;
				if (!known.has(video.id) && !known.has(key) && (!retired.has(key) || youtubeCleanupProtected(video, {
					favorites: base.favorites,
					likes: base.likes,
					activeId: base.activeId,
					previewId: base.previewId,
					rating: getRating
				}))) {
					fresh.add(key);
					if (group === target && counts[target] <= settings[`${target}MaxEntries`] && reservedCounts.total <= settings.remoteMaxEntries) {
						const sources = cleanupSourceKeys(video);
						if (!replacementSources) replacementSources = new Set(sources);
						else for (const source of replacementSources) if (!sources.includes(source)) replacementSources.delete(source);
					}
				}
			}, turn);
			if (!fresh.size) return 0;
			overage = Math.max(0, counts[target] - settings[`${target}MaxEntries`], reservedCounts.total - settings.remoteMaxEntries);
			const demand = group === target ? Math.max(0, counts[target] + fresh.size - settings[`${target}MaxEntries`], reservedCounts.total + fresh.size - settings.remoteMaxEntries) : Math.max(0, reservedCounts.total + Math.min(fresh.size, settings[`${target}MaxEntries`] - counts[target]) - settings.remoteMaxEntries);
			limit = Math.min(limit, demand);
		}
		if (!limit) return 0;
		await verifyCleanupFeedback();
		const savedShelves = await restoreDurableShelves(true), savedProtection = /* @__PURE__ */ new Set();
		for (const rows of [savedShelves?.favorites ?? [], savedShelves?.likes ?? []]) await forEachCatalogSlice(rows, (id) => {
			savedProtection.add(id);
		}, turn);
		await warmLegacyRatings();
		const revision = getFeedbackRevision();
		const notes = exportFeedback().notes;
		const plan = await planYoutubeCleanup(base.videos, {
			...base,
			rating: getRating,
			managed: (id) => Boolean(savedProtection.has(id) || base.categories[id] || editedMetadata(base.metadataProvenance[id]) || notes[id])
		}, {
			limit,
			minAgeDays: policy.minAgeDays,
			now: Date.now(),
			exclude,
			group,
			replacementSources
		}, turn);
		if (get().videos !== base.videos || get().favorites !== base.favorites || get().likes !== base.likes || get().categories !== base.categories || get().metadataProvenance !== base.metadataProvenance || get().youtubeCleanup !== base.youtubeCleanup || get().activeId !== base.activeId || get().previewId !== base.previewId || getFeedbackRevision() !== revision || getPullSettings() !== globalPolicy) continue;
		if (!plan.removed.length) {
			cleanupNote(group, `No eligible old ${label} entries can be replaced. Protected videos stay saved.`);
			return 0;
		}
		const removedByFolder = /* @__PURE__ */ new Map();
		for (const video of plan.removed) removedByFolder.set(video.folderId, (removedByFolder.get(video.folderId) ?? 0) + 1);
		const journal = recordYoutubeCleanup(base.youtubeCleanup, plan.removed, Date.now());
		useLibrary.setState((s) => ({
			videos: plan.videos,
			folders: s.folders.map((folder) => removedByFolder.has(folder.id) ? {
				...folder,
				videoCount: Math.max(0, (folder.videoCount ?? 0) - removedByFolder.get(folder.id))
			} : folder)
		}));
		rememberEntryCounts(plan.videos, {
			...counts,
			total: counts.total - plan.removed.length,
			[group]: counts[group] - plan.removed.length
		});
		try {
			await saveYoutubeCleanup(plan.removed, journal);
		} catch (error) {
			for (;;) {
				const current = get().videos, restored = await mergeRemoteCatalogAsync(current, plan.removed);
				if (get().videos !== current) continue;
				useLibrary.setState((s) => ({
					videos: restored,
					folders: s.folders.map((folder) => removedByFolder.has(folder.id) ? {
						...folder,
						videoCount: (folder.videoCount ?? 0) + removedByFolder.get(folder.id)
					} : folder),
					youtubeCleanupNote: "Cleanup could not be saved; cached videos were restored.",
					cleanupNotes: {
						...s.cleanupNotes,
						[group]: "Cleanup could not be saved; cached videos were restored."
					}
				}));
				break;
			}
			throw error;
		}
		const ids = plan.removed.map((video) => video.id);
		useLibrary.setState((s) => ({
			youtubeCleanup: journal,
			youtubeCleanupNote: `${plan.removed.length.toLocaleString()} old, low-rated ${label} entries removed. Likes, favorites, positive ratings and watch history were kept.`,
			cleanupNotes: {
				...s.cleanupNotes,
				[group]: `${plan.removed.length.toLocaleString()} old, low-rated ${label} entries removed. Likes, favorites, positive ratings and watch history were kept.${group !== target ? ` Making room for ${cleanupLabel(target)} under the combined cap.` : incoming && plan.removed.length <= overage ? " Recovering a lowered cap gradually; the pending page stays queued." : ""}`
			},
			tags: removeSparseRecordKeys(s.tags, ids.filter((id) => s.tags[id] === base.tags[id])),
			metadataProvenance: removeSparseRecordKeys(s.metadataProvenance, ids.filter((id) => s.metadataProvenance[id] === base.metadataProvenance[id]))
		}));
		persistSoon(get);
		return plan.removed.length;
	}
}
async function rotatePullSource(get, incoming, budgets, group, options) {
	const cancellation = getPullCancellationRevision(), policyFor = options?.policyFor ?? unchangedPullPolicy;
	for (;;) {
		const settings = policyFor(getPullSettings()), target = options?.target ?? group;
		if (!cleanupBudgetAvailable(budgets, settings, group) || !cleanupPolicy(settings, group).enabled || !cleanupPolicy(settings, target).enabled || group !== target && !settings.sharedCapCleanup) return 0;
		await waitForCatalogCommit(cancellation);
		const available = cleanupBudgetAvailable(budgets, policyFor(getPullSettings()), group);
		if (!available) return 0;
		try {
			return await rotateSourceCache(get, incoming, available, group, options);
		} catch (error) {
			if (error !== CLEANUP_WORK_HELD) throw error;
		}
	}
}
/** Budgets belong to the whole operation, including shared-cap donations.
* Reserve earlier incoming groups' slots so a mixed result cannot spend the
* same freed combined capacity twice. Protected incoming rows are excluded. */
async function rotateRemotePull(get, incoming, budgets, policyFor = unchangedPullPolicy) {
	let reserved = 0, removed = 0;
	const allocated = {
		youtube: 0,
		twitch: 0,
		adult: 0
	};
	const policy = policyFor(getPullSettings());
	const targets = CLEANUP_GROUPS.filter((group) => incoming.some((video) => entryGroup(video) === group));
	if (!targets.some((group) => cleanupPolicy(policy, group).enabled && policy[`${group}MaxEntries`] > 0) || policy.remoteMaxEntries <= 0) return incoming;
	const countsBefore = await remoteEntryCounts(get().videos);
	if (targets.every((group) => remainingEntrySlots(countsBefore, policy, group) >= incoming.length)) return incoming;
	const sharedPressure = policy.sharedCapCleanup && countsBefore.total >= policy.remoteMaxEntries && targets.length > 1;
	if (sharedPressure) targets.sort((a, b) => countsBefore[a] / Math.max(1, policy[`${a}MaxEntries`]) - countsBefore[b] / Math.max(1, policy[`${b}MaxEntries`]));
	for (const target of targets) {
		const own = await rotatePullSource(get, incoming, budgets, target, {
			reserved,
			policyFor
		});
		consumeCleanupBudget(budgets, target, own);
		removed += own;
		let shared = 0;
		for (const donor of CLEANUP_GROUPS) {
			if (donor === target) continue;
			const donated = await rotatePullSource(get, incoming, budgets, donor, {
				target,
				reserved,
				policyFor
			});
			consumeCleanupBudget(budgets, donor, donated);
			removed += donated;
			shared += donated;
		}
		const base = get(), settings = policyFor(getPullSettings()), counts = await remoteEntryCounts(base.videos);
		const known = await remoteVideoIndexAsync(base.videos), retired = retiredYoutubeKeys(base.youtubeCleanup), fresh = /* @__PURE__ */ new Set();
		const signals = {
			favorites: base.favorites,
			likes: base.likes,
			activeId: base.activeId,
			previewId: base.previewId,
			rating: getRating
		};
		await forEachCatalogSlice(incoming, (video) => {
			if (entryGroup(video) !== target) return;
			const key = cleanupKey(video);
			if (!known.has(video.id) && !known.has(key) && (!retired.has(key) || youtubeCleanupProtected(video, signals))) fresh.add(key);
		}, yieldCatalogTask);
		allocated[target] = Math.min(fresh.size, remainingEntrySlots({
			...counts,
			total: counts.total + reserved
		}, settings, target));
		reserved += allocated[target];
		if (shared) cleanupNote(target, `${shared.toLocaleString()} eligible entries replaced in other enabled caches to make room for ${cleanupLabel(target)} under the combined cap. All source budgets and saved-video protections were kept.`);
	}
	if (!removed || !sharedPressure) return incoming;
	const buckets = new Map(targets.map((group) => [group, []])), other = [];
	await forEachCatalogSlice(incoming, (video) => {
		const group = entryGroup(video);
		((group && group !== "other" ? buckets.get(group) : void 0) ?? other).push(video);
	}, yieldCatalogTask);
	const ordered = [];
	const admissionOrder = [...targets].sort((a, b) => Number(allocated[b] > 0) - Number(allocated[a] > 0));
	for (const group of admissionOrder) await forEachCatalogSlice(buckets.get(group), (video) => {
		ordered.push(video);
	}, yieldCatalogTask);
	await forEachCatalogSlice(other, (video) => {
		ordered.push(video);
	}, yieldCatalogTask);
	return ordered;
}
function metadataTagsForVideo(video, folders) {
	return video.remote ? remoteMetadataTags(video) : [...isAdultVideo(video, folders) ? ["adult"] : [], ...localNameTags(video)];
}
function enrichmentPatch(video, state, mode) {
	const beforeTags = state.tags[video.id], beforeProvenance = state.metadataProvenance[video.id];
	if (tagsLocked(beforeProvenance) || mode === "cached" && !video.remote || mode === "tail" && beforeTags?.length) return;
	if (mode === "cached" && video.remote?.kind === "youtube" && beforeProvenance?.youtubeTextTagVersion === 4) return;
	const inferred = metadataTagsForVideo(video, state.folders);
	const current = beforeTags ?? [];
	const existing = mode === "cached" ? reconcileProviderTopicTags(video, current, beforeProvenance) : current;
	const compact = video.remote?.kind === "youtube" ? refreshYoutubeTags(current, inferred, beforeProvenance, LIBRARY_LIMITS.remoteMetadataTagsPerTitle) : compactIngestedTags(existing, inferred);
	const tagsChanged = !sameTags(current, compact);
	const sources = beforeProvenance?.tags;
	if (!tagsChanged && (video.remote?.kind !== "youtube" || beforeProvenance?.youtubeTextTagVersion === 4) && beforeProvenance?.updatedAt && sources && Object.keys(sources).length === compact.length && compact.every((tag) => sources[tag] !== void 0)) return;
	if (!compact.length) return;
	return {
		beforeTags,
		beforeProvenance,
		tags: tagsChanged ? compact : current,
		provenance: mergeInferredTagProvenance(current, compact, beforeProvenance, inferred, video.remote ? `provider:${video.remote.kind}` : "local-name")
	};
}
function queueMetadataRepair(get, publish) {
	idleEnrichment.enqueue("cached-tags", "Cached provider tags", metadataEnrichmentStep({
		get,
		publish,
		save: saveEnrichmentRows,
		patch: (video, state) => enrichmentPatch(video, state, "cached")
	})).catch((error) => {
		if (error?.name !== "AbortError" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("reelcase:save-error"));
	});
}
/** Normalize provider enrichment once when it enters the catalog. Manual tags
* are retained, while old keyword-/creator- wrappers and duplicate labels do
* not keep inflating every selector and render pass. */
function compactIngestedTags(existing, inferred) {
	const seen = /* @__PURE__ */ new Set();
	const compact = [];
	const structural = (tag) => tag.trim().toLowerCase() === "adult" || /^(?:source-|sub-|creator-|provider-|format-|fetish-|genre-|meta-)/.test(tag.trim().toLowerCase());
	const ordered = [
		...inferred.filter(structural),
		...existing,
		...inferred.filter((tag) => !structural(tag))
	];
	for (const raw of ordered) {
		const tag = normalizeTagValue(raw);
		if (!tag || tag === "http" || tag === "https" || seen.has(tag)) continue;
		seen.add(tag);
		compact.push(tag);
		if (compact.length >= LIBRARY_LIMITS.remoteMetadataTagsPerTitle) break;
	}
	return compact;
}
var IGNORED_DESCRIPTION_WORDS = /* @__PURE__ */ new Set([
	"about",
	"after",
	"also",
	"because",
	"being",
	"between",
	"channel",
	"click",
	"creator",
	"description",
	"from",
	"have",
	"here",
	"just",
	"more",
	"next",
	"official",
	"please",
	"really",
	"subscribe",
	"that",
	"this",
	"through",
	"today",
	"video",
	"watch",
	"with",
	"youtube",
	"your"
]);
function descriptionKeywordTags(video) {
	if (video.remote?.kind === "youtube") return automaticYoutubeTags(video);
	const words = `${video.remote?.channelName ?? ""} ${video.name} ${video.description ?? video.tagline ?? ""}`.slice(0, 8e3).toLowerCase().match(/[a-z][a-z0-9-]{3,30}/g) ?? [];
	const seen = /* @__PURE__ */ new Set();
	const tags = [];
	const publicTopics = video.remote?.kind === "twitch" ? new Set(topicsForVideo(video)) : null;
	const unsupportedTopic = (word) => {
		const topic = canonicalTopic(word);
		return publicTopics && topic && !publicTopics.has(topic);
	};
	for (const word of words) {
		if (IGNORED_DESCRIPTION_WORDS.has(word) || seen.has(word) || unsupportedTopic(word)) continue;
		seen.add(word);
		tags.push(word);
		if (tags.length >= LIBRARY_LIMITS.descriptionKeywordTagsPerTitle) break;
	}
	return tags;
}
/** Local, explainable semantic taxonomy. It runs over provider titles and descriptions only—never media bytes or uploads. */
var SEMANTIC_TAG_RULES = [
	[/\b(game|gaming|playthrough|speedrun|walkthrough|minecraft|steam|zombies|streamer games|nba 2k\d*|cozy games|\barc\b)\b/, "gaming"],
	[/\b(tech|software|coding|programming|computer|ai|gadget)\b/, "technology"],
	[/\b(news|politic|election|debate|commentary)\b/, "news-commentary"],
	[/\b(music|song|album|concert|cover|playlist)\b/, "music"],
	[/\b(movie|film|cinema|trailer|review)\b/, "film"],
	[/\b(anime|manga|japan|otaku)\b/, "anime"],
	[/\b(food|cook|recipe|restaurant|kitchen|cake|baking|cake decorating)\b/, "food"],
	[/\b(travel|trip|tour|flight|hotel|beach|bali|pool party)\b/, "travel"],
	[/\b(fitness|workout|gym|health|sport)\b/, "fitness"],
	[/\b(science|space|history|documentary|education)\b/, "learning"],
	[/\b(comedy|funny|sketch|standup|meme)\b/, "comedy"],
	[/\b(asmr|relax|sleep|ambient|meditation)\b/, "relaxing"],
	[/\b(acupuncture|wellness|self care)\b/, "wellbeing"],
	[/\b(podcast|interview|talk|discussion)\b/, "talk"],
	[/\b(react|reaction|drama|tea|opinion)\b/, "commentary"],
	[/\b(art|drawing|painting|design|animation)\b/, "creative"],
	[/\b(animal|wildlife|zoo|nature)\b/, "nature"],
	[/\b(finance|money|business|investing)\b/, "business"],
	[/\b(fashion|beauty|makeup|style)\b/, "style"],
	[/\b(car|cars|driving|racing|automotive|motorcycle|simucube|racing rig)\b/, "motors"],
	[/\b(horror|scary|creepy|ghost|true crime)\b/, "horror"],
	[/\b(diy|repair|build|woodwork|maker|restoration)\b/, "maker"],
	[/\b(soccer|football|basketball|baseball|esports|tournament)\b/, "sports"],
	[/\b(science|space|physics|biology|chemistry)\b/, "science"],
	[/\b(relationship|dating|love|couple)\b/, "relationships"],
	[/\b(mental health|therapy|psychology|mindfulness)\b/, "wellbeing"],
	[/\b(language|linguistics|learn \w+|lesson|tutorial)\b/, "skills"],
	[/\b(hardware|pc build|keyboard|phone|camera)\b/, "hardware"],
	[/\b(legal|court|law|lawsuit)\b/, "legal"],
	[/\b(documentary|docuseries)\b/, "documentary"],
	[/\b(history|historical|ancient|archaeology)\b/, "history"],
	[/\b(true crime|murder|missing person|serial killer)\b/, "true-crime"],
	[/\b(photo|photography|camera review|photographer)\b/, "photography"],
	[/\b(artwork|watercolor|illustration|digital art)\b/, "art"],
	[/\b(animation|animated|cartoon|animator)\b/, "animation"],
	[/\b(animals?|pets?|dogs?|cats?|wildlife)\b/, "animals"],
	[/\b(hiking|camping|fishing|backpacking|outdoors?)\b/, "outdoors"],
	[/\b(climate|environment|sustainability|conservation)\b/, "environment"],
	[/\b(makeup|skincare|beauty|hair tutorial)\b/, "beauty"],
	[/\b(fashion|outfit|streetwear|clothing)\b/, "fashion"],
	[/\b(home decor|home tour|interior design|organization)\b/, "home"]
];
function semanticTags(video) {
	const publicRemote = video.remote?.kind === "youtube" || video.remote?.kind === "twitch";
	const text = publicRemote ? video.name.slice(0, 500).toLowerCase() : `${video.name} ${video.path} ${video.tagline ?? ""} ${video.description ?? ""}`.slice(0, 8e3).toLowerCase();
	const tags = publicRemote ? [...topicsForVideo(video)] : [];
	if (!publicRemote) {
		for (const [pattern, tag] of SEMANTIC_TAG_RULES) if (pattern.test(text)) tags.push(tag);
	}
	if (video.remote?.kind === "youtube" && ((video.duration ?? 0) > 0 && (video.duration ?? 0) < 90 || /(?:#|\b)shorts?\b/i.test(text))) tags.push("shorts", "short-form");
	if (video.remote?.kind === "twitch" && !video.remote.live && (video.extension === "clip" || video.id.startsWith("tw:c:") || (video.duration ?? 0) > 0 && (video.duration ?? 0) < 120)) tags.push("clip");
	if ((video.duration ?? 0) >= 3600) tags.push("long-form");
	return tags;
}
function localNameTags(video) {
	const text = `${video.name} ${video.path}`.toLowerCase();
	const added = new Date(video.addedAt);
	const dateTags = Number.isFinite(added.getTime()) ? [`year-${added.getFullYear()}`, `month-${added.toLocaleString("en-US", { month: "long" }).toLowerCase()}`] : [];
	const nameTags = video.name.replace(/\.[^.]+$/, "").toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !/^(video|movie|final|copy|edit|the|with|from)$/.test(word)).slice(0, 4);
	const sourceName = video.path.split(/[\\/]/).find(Boolean)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const tags = [
		video.genre?.toLowerCase(),
		`type-${video.extension.replace(/^\./, "").toLowerCase()}`,
		sourceName ? `source-${sourceName}` : "",
		...dateTags,
		...semanticTags(video),
		...nameTags
	];
	if (/\b(open source|creative commons|blender|public domain)\b/.test(text)) tags.push("open-source");
	if (/\b(trailer|teaser)\b/.test(text)) tags.push("trailer");
	if (/\b(1080p|2160p|4k|720p)\b/.test(text)) tags.push(text.match(/\b(2160p|4k|1080p|720p)\b/)?.[1] ?? "hd");
	return tags.filter((tag) => Boolean(tag));
}
function addLocalNameTags(existing, existingProvenance, videos) {
	const next = sparseRecordBuilder(existing);
	const metadataProvenance = sparseRecordBuilder(existingProvenance);
	for (const video of videos) {
		if (tagsLocked(existingProvenance[video.id])) continue;
		const inferred = localNameTags(video);
		if (!inferred.length) continue;
		const current = next.get(video.id) ?? [];
		const compact = [.../* @__PURE__ */ new Set([...current, ...inferred.map(normalizeTagValue).filter(Boolean)])].slice(0, 18);
		next.set(video.id, compact);
		metadataProvenance.set(video.id, mergeInferredTagProvenance(current, compact, existingProvenance[video.id], inferred, "local-name"));
	}
	return {
		tags: next.finish(),
		metadataProvenance: metadataProvenance.finish()
	};
}
function applyPrefs(partial) {
	const prefs = loadPrefs();
	if (!prefs) return partial;
	const favorites = {};
	const likes = {};
	for (const id of prefs.favorites ?? []) favorites[id] = true;
	for (const id of prefs.likes ?? []) likes[id] = true;
	return {
		...partial,
		favorites,
		likes,
		tags: prefs.tags ?? {},
		metadataProvenance: prefs.metadataProvenance ?? {},
		categories: prefs.categories ?? {},
		progress: Object.fromEntries(Object.entries(prefs.progress ?? {}).flatMap(([id, mark]) => {
			const normalized = normalizeResumeMark(mark);
			return normalized ? [[id, normalized]] : [];
		})),
		resumeProgress: Object.fromEntries(Object.entries(prefs.resumeProgress ?? {}).flatMap(([key, mark]) => {
			const normalized = normalizeResumeMark(mark);
			return normalized ? [[key, normalized]] : [];
		})),
		history: prefs.history ?? [],
		viewCounts: prefs.viewCounts ?? {},
		cameCounts: prefs.cameCounts ?? {},
		view: prefs.view ?? "grid",
		sort: prefs.sort ?? "name",
		hideDemo: true,
		sourceId: "home",
		hardwareAccel: prefs.hardwareAccel ?? true,
		adultPinHash: null,
		follows: dedupeFollows(prefs.follows ?? []),
		notices: prefs.notices ?? [],
		notifyPush: prefs.notifyPush ?? false,
		unavailable: Object.fromEntries((prefs.unavailableVideoIds ?? []).map((id) => [id, true])),
		hiddenVideos: Object.fromEntries((prefs.hiddenVideoIds ?? []).map((id) => [id, true]))
	};
}
function adultIdSet(folders) {
	return adultFolderIds(folders);
}
function isAdultVideo(video, folders) {
	return videoIsPrivate(adultIdSet(folders), video);
}
/** A provider can surface the same remote media through more than one route
* (especially a Reddit post linked to Redgifs). Keep the richer card and its
* combined source attribution, rather than rendering or caching it twice. */
function adultMediaIdentity(video) {
	const urls = [
		video.remote?.embedUrl,
		video.remote?.watchUrl,
		video.src
	].filter((value) => Boolean(value && /^https?:\/\//i.test(value)));
	for (const raw of urls) {
		const redgifs = raw.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1] ?? raw.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1] ?? raw.match(/https?:\/\/(?:i|media)\.redgifs\.com\/([a-z0-9_-]+)(?:[._-]|$)/i)?.[1];
		if (redgifs) return `redgifs:${redgifs.toLowerCase()}`;
		try {
			const url = new URL(raw);
			const host = url.hostname.replace(/^www\./, "").toLowerCase();
			const path = url.pathname.replace(/\/+$/, "").toLowerCase();
			if (host && path && path !== "/") return `url:${host}${path}`;
		} catch {}
	}
	const kind = video.remote?.kind;
	const id = video.remote?.videoId?.trim();
	return kind && id ? `provider:${kind}:${id.toLowerCase()}` : void 0;
}
function adultCardQuality(video) {
	return Number(Boolean(video.poster || video.remote?.previewUrl)) * 4 + Number(Boolean(video.remote?.embedUrl)) * 3 + Number(Boolean(video.remote?.watchUrl)) * 2 + (video.remote?.sourceKinds?.length ?? 0) + Number(video.remote?.kind === "reddit") * 2 + Number(Boolean(video.description || video.tagline));
}
function mergeAdultDuplicate(first, second) {
	const primary = adultCardQuality(second) > adultCardQuality(first) ? second : first;
	const secondary = primary === first ? second : first;
	const primaryRemote = primary.remote;
	const secondaryRemote = secondary.remote;
	return {
		...primary,
		addedAt: Math.max(primary.addedAt, secondary.addedAt),
		poster: primary.poster || secondary.poster,
		src: primary.src || secondary.src,
		description: primary.description || secondary.description,
		tagline: primary.tagline || secondary.tagline,
		remote: primaryRemote && secondaryRemote ? {
			...secondaryRemote,
			...primaryRemote,
			videoId: primaryRemote.videoId || secondaryRemote.videoId,
			channelName: primaryRemote.channelName || secondaryRemote.channelName,
			channelId: primaryRemote.channelId || secondaryRemote.channelId,
			embedUrl: primaryRemote.embedUrl || secondaryRemote.embedUrl,
			watchUrl: primaryRemote.watchUrl || secondaryRemote.watchUrl,
			previewUrl: primaryRemote.previewUrl || secondaryRemote.previewUrl,
			sourceKinds: [...new Set([
				primaryRemote.kind,
				secondaryRemote.kind,
				...primaryRemote.sourceKinds ?? [],
				...secondaryRemote.sourceKinds ?? []
			].filter(Boolean))]
		} : primaryRemote
	};
}
function dedupeAdultVideoCards(videos) {
	const result = [];
	const byIdentity = /* @__PURE__ */ new Map();
	for (const video of videos) {
		const key = adultMediaIdentity(video);
		if (!key) {
			result.push(video);
			continue;
		}
		const previousIndex = byIdentity.get(key);
		if (previousIndex == null) {
			byIdentity.set(key, result.length);
			result.push(video);
			continue;
		}
		result[previousIndex] = mergeAdultDuplicate(result[previousIndex], video);
	}
	return result;
}
var useLibrary = create((set, get) => ({
	folders: [],
	videos: [],
	query: "",
	searchResult: null,
	sort: "added",
	view: "grid",
	sourceId: "home",
	favorites: {},
	likes: {},
	tags: {},
	metadataProvenance: {},
	categories: {},
	progress: {},
	resumeProgress: {},
	history: [],
	viewCounts: {},
	cameCounts: {},
	hideDemo: true,
	showHiddenAdult: false,
	hardwareAccel: true,
	adultPinHash: null,
	adultsUnlocked: true,
	activeId: null,
	previewId: null,
	scanning: null,
	hydrated: false,
	follows: STARTER_FOLLOWS,
	notices: [],
	unavailable: {},
	hiddenVideos: {},
	notifyPush: false,
	remoteBusy: false,
	youtubeCleanup: emptyYoutubeCleanup(),
	youtubeCleanupNote: "",
	cleanupNotes: {},
	cleanupYoutubeCache: async () => {
		return get().cleanupRemoteCache("youtube");
	},
	cleanupRemoteCache: async (group) => {
		if (get().remoteBusy || get().refreshing) throw new Error("Wait for the current pull to finish before cleaning the cache.");
		set({ remoteBusy: true });
		try {
			return await rotateSourceCache(get, void 0, cleanupPolicy(getPullSettings(), group).batch, group);
		} finally {
			set({ remoteBusy: false });
		}
	},
	refreshing: false,
	remoteCheckedAt: 0,
	remoteRefreshStatus: null,
	youtubeRefreshStatus: null,
	youtubeLiveProgress: null,
	twitchLiveProgress: null,
	remoteRetryAt: {},
	importProgress: null,
	adultPullStatus: null,
	pullActivity: null,
	pullHistory: [],
	beginPull: (activity) => {
		if (activity.provider === "youtube") markYoutubeProviderStart();
		set({ pullActivity: {
			...activity,
			status: "running"
		} });
	},
	updatePull: (update) => set((state) => state.pullActivity ? { pullActivity: {
		...state.pullActivity,
		...update
	} } : {}),
	finishPull: (record) => set((state) => {
		if (record.provider === "youtube") markYoutubeProviderFinish();
		const pullHistory = [record, ...state.pullHistory.filter((item) => item.id !== record.id)].slice(0, 100);
		savePullHistory(pullHistory);
		return {
			pullActivity: null,
			pullHistory
		};
	}),
	setQuery: (query) => {
		if (get().query === query) return;
		measureInteraction("search");
		set({
			query,
			searchResult: null
		});
	},
	setSort: (sort) => {
		set({ sort });
		saveViewPrefs(get());
	},
	setView: (view) => {
		set({ view });
		saveViewPrefs(get());
	},
	setSource: (sourceId) => {
		if (sourceId !== get().sourceId) beginFirstShelfRoute([
			"landing",
			"youtube",
			"twitch",
			"favorites",
			"continue",
			"history",
			"movies"
		].includes(sourceId) ? sourceId : "library");
		if (sourceId !== get().sourceId) clearLowPriorityImageQueue();
		if (sourceId === "youtube" && get().sourceId !== "youtube") beginYoutubeFirstClick(get().pullActivity?.provider === "youtube");
		measureInteraction("navigation");
		navigationChanged = true;
		set({ sourceId });
		saveViewPrefs(get());
	},
	toggleFavorite: (id) => {
		measureInteraction("rating");
		set((s) => {
			return { favorites: s.favorites[id] ? removeSparseRecordKeys(s.favorites, [id]) : patchSparseRecord(s.favorites, [[id, true]]) };
		});
		savedShelfRevision++;
		saveSavedShelfEdit(id, "favorites", Boolean(get().favorites[id]));
	},
	toggleLike: (id) => {
		measureInteraction("rating");
		set((s) => {
			return { likes: s.likes[id] ? removeSparseRecordKeys(s.likes, [id]) : patchSparseRecord(s.likes, [[id, true]]) };
		});
		savedShelfRevision++;
		saveSavedShelfEdit(id, "likes", Boolean(get().likes[id]));
	},
	markCame: (id) => {
		set((s) => ({ cameCounts: patchActivityRecord(s.cameCounts, [[id, (s.cameCounts[id] ?? 0) + 1]]) }));
		persistActivity(get);
	},
	setVideoComments: (id, comments) => {
		const state = get();
		if (state.activeId !== id && state.previewId !== id) return;
		const video = lookupVideo(state.videos, id);
		if (!video?.remote) return;
		viewerDetails.setComments(id, comments);
		cacheRemotes(get, [{
			...video,
			remote: {
				...video.remote,
				comments
			}
		}], true).then(() => {
			if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("reelcase:video-details-changed", { detail: id }));
		});
	},
	setYoutubePublication: async (id, date, youtubeId) => {
		for (;;) {
			const video = lookupVideo(get().videos, id);
			if (!video || youtubeDownloadTarget(video)?.videoId !== youtubeId) throw Error("Publication evidence does not match this saved video.");
			const updated = withYoutubePublication({
				...video,
				remote: {
					...video.remote,
					videoId: youtubeId
				}
			}, youtubeId, date);
			if (updated.addedAt === video.addedAt && updated.remote?.publishedSource === video.remote?.publishedSource && updated.remote?.publishedPrecision === video.remote?.publishedPrecision && updated.remote?.publishedDate === video.remote?.publishedDate) return false;
			await saveRemoteSnapshot({
				videos: [updated],
				folders: get().folders.filter((folder) => folder.kind === "youtube" || folder.kind === "twitch"),
				checkedAt: get().remoteCheckedAt
			});
			const current = get().videos, index = current.indexOf(video);
			if (index < 0) continue;
			const next = current.slice();
			next[index] = updated;
			set({ videos: next });
			return true;
		}
	},
	setYoutubeMetadata: async (id, metadata) => {
		const initial = lookupVideo(get().videos, id);
		if (!initial || youtubeDownloadTarget(initial)?.videoId !== metadata.id) throw new Error("This video is no longer in the YouTube library.");
		const saved = await loadCatalogVideo(id);
		const current = lookupVideo(get().videos, id);
		if (!current || youtubeDownloadTarget(current)?.videoId !== metadata.id) throw new Error("This video was removed before its tags could be saved.");
		const full = withCatalogDetails(current, saved);
		const date = exactYoutubePublished(metadata.date);
		let updated = {
			...full,
			detailsOnDisk: false,
			...Number.isFinite(metadata.duration) && metadata.duration > 0 && metadata.duration <= 31536e3 ? { duration: metadata.duration } : {},
			description: metadata.description === void 0 ? full.description : metadata.description.slice(0, 16e3),
			remote: {
				...full.remote,
				videoId: metadata.id,
				youtubeKeywords: metadata.keywords === void 0 ? full.remote?.youtubeKeywords : metadata.keywords.slice(0, 40),
				youtubeTagSummary: void 0,
				youtubeTagsCheckedAt: Date.now()
			}
		};
		if (date && !full.remote?.live && full.remote?.youtubeType !== "upcoming") updated = withYoutubePublication(updated, metadata.id, date);
		const evidence = youtubeTextTags(updated);
		updated.remote = {
			...updated.remote,
			youtubeTagSummary: compactYoutubeTagEvidence(evidence)
		};
		const beforeSave = get(), pairedMetadata = enrichRemoteTags(beforeSave.tags, beforeSave.metadataProvenance, [updated]);
		await saveRemoteSnapshot({
			videos: [updated],
			metadata: pairedMetadata,
			folders: get().folders.filter((folder) => folder.kind === "youtube" || folder.kind === "twitch"),
			checkedAt: get().remoteCheckedAt
		});
		const state = get(), position = state.videos.findIndex((video) => video.id === id);
		if (position < 0) throw new Error("The video was removed while saving its metadata.");
		const enriched = enrichRemoteTags(state.tags, state.metadataProvenance, [updated]);
		const videos = state.videos.slice();
		videos[position] = catalogCard(updated);
		viewerDetails.invalidate(id);
		set({
			videos,
			...enriched
		});
		if (enriched.tags !== state.tags || enriched.metadataProvenance !== state.metadataProvenance) await saveEnrichmentRows([{
			id,
			tags: enriched.tags[id] ?? [],
			provenance: enriched.metadataProvenance[id] ?? { tags: {} }
		}]);
		return {
			tags: evidence.tags.length,
			locked: tagsLocked(get().metadataProvenance[id])
		};
	},
	acceptYoutubeTagSuggestions: (id, selected, base) => {
		const current = get(), prepared = prepareYoutubeTagReview(lookupVideo(current.videos, id), current.tags[id], current.metadataProvenance[id], base, selected);
		if (!prepared.reviewed) return 0;
		set({
			tags: patchSparseRecord(current.tags, [[id, prepared.tags]]),
			metadataProvenance: patchSparseRecord(current.metadataProvenance, [[id, prepared.provenance]])
		});
		journalManualMetadata(id, "tags", get, set);
		persistSoon(get);
		return prepared.reviewed;
	},
	setLocalVideoDuration: async (id, duration) => {
		if (!Number.isFinite(duration) || duration <= 0 || duration > 31536e3) throw new Error("The file did not expose a valid runtime.");
		for (;;) {
			const current = lookupVideo(get().videos, id);
			if (!current || current.remote) throw new Error("This local file is no longer in the library.");
			const updated = {
				...current,
				duration
			};
			await appendCatalogVideos([updated]);
			const snapshot = get().videos, position = snapshot.indexOf(current);
			if (position < 0) continue;
			const videos = await copyCatalogArray(snapshot, yieldCatalogTask);
			if (get().videos !== snapshot) continue;
			videos[position] = updated;
			set({ videos });
			return;
		}
	},
	releaseVideoComments: () => {
		viewerDetails.releaseComments();
	},
	setVideoTags: (id, tags) => {
		const manualTags = [...new Set(tags.map(normalizeTagValue).filter(Boolean))].slice(0, 18);
		set((s) => ({
			tags: patchSparseRecord(s.tags, [[id, manualTags]]),
			metadataProvenance: patchSparseRecord(s.metadataProvenance, [[id, {
				...s.metadataProvenance[id],
				youtubeReviews: void 0,
				tags: Object.fromEntries(manualTags.map((tag) => [tag, "manual"])),
				lockedFields: [.../* @__PURE__ */ new Set([...s.metadataProvenance[id]?.lockedFields ?? [], "tags"])],
				updatedAt: Date.now()
			}]])
		}));
		get();
		journalManualMetadata(id, "tags", get, set);
		persistSoon(get);
	},
	applyReviewedTags: (id, tags, source) => {
		const stateBefore = get();
		const video = lookupVideo(stateBefore.videos, id);
		const existing = stateBefore.tags[id] ?? [];
		const provenance = stateBefore.metadataProvenance[id];
		const inspected = tags.map(normalizeTagValue).filter(Boolean);
		if (!video || video.remote || tagsLocked(provenance) || !inspected.length) return 0;
		const merged = compactIngestedTags(existing, inspected);
		if (sameTags(existing, merged)) return 0;
		const added = Math.max(0, merged.filter((tag) => !existing.includes(tag)).length);
		set((s) => ({
			tags: patchSparseRecord(s.tags, [[id, merged]]),
			metadataProvenance: patchSparseRecord(s.metadataProvenance, [[id, mergeInferredTagProvenance(existing, merged, s.metadataProvenance[id], inspected, source)]])
		}));
		get();
		journalManualMetadata(id, "tags", get, set);
		persistNow(get);
		return added;
	},
	applyCompanionTags: (id, tags) => get().applyReviewedTags(id, tags, "companion-inspection"),
	autoTagLibrary: async () => {
		return (await idleEnrichment.enqueue("smart-tags", "Smart catalog tags", metadataEnrichmentStep({
			get,
			publish: set,
			save: saveEnrichmentRows,
			patch: (video, state) => enrichmentPatch(video, state, "smart")
		}))).changed;
	},
	enrichMetadataTail: () => idleEnrichment.enqueue("metadata-tail", "Metadata tail", metadataEnrichmentStep({
		get,
		publish: set,
		save: saveEnrichmentRows,
		cursor: metadataTailCursor,
		maxChanges: LIBRARY_LIMITS.metadataTailBatchSize,
		patch: (video, state) => enrichmentPatch(video, state, "tail")
	})),
	repairCachedMetadata: () => queueMetadataRepair(get, set),
	repairCreatorCoverage: () => idleEnrichment.enqueue("creator-coverage", "Creator names", creatorCoverageRepairStep({
		get,
		publish: set,
		limit: LIBRARY_LIMITS.creatorCoverageRepairBatchSize,
		save: (rows, turn, valid) => saveCreatorCoverageRows(rows, turn, valid, (changed) => useLibrary.subscribe(changed)),
		tags: (video, state) => {
			const beforeTags = state.tags[video.id], beforeProvenance = state.metadataProvenance[video.id];
			if (tagsLocked(beforeProvenance)) return;
			const creator = video.remote?.channelName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
			if (!creator) return;
			const inferred = [`creator-${creator}`], existing = beforeTags ?? [];
			const compact = compactIngestedTags(existing, inferred);
			return {
				beforeTags,
				beforeProvenance,
				tags: sameTags(existing, compact) ? beforeTags ?? existing : compact,
				provenance: mergeInferredTagProvenance(existing, compact, beforeProvenance, inferred, `provider:${video.remote.kind}`)
			};
		}
	})),
	setVideoCategory: (id, category) => {
		set((s) => ({
			categories: patchSparseRecord(s.categories, [[id, category.trim().slice(0, 40)]]),
			metadataProvenance: patchSparseRecord(s.metadataProvenance, [[id, {
				...s.metadataProvenance[id],
				tags: s.metadataProvenance[id]?.tags ?? {},
				category: "manual",
				lockedFields: [.../* @__PURE__ */ new Set([...s.metadataProvenance[id]?.lockedFields ?? [], "category"])],
				updatedAt: Date.now()
			}]])
		}));
		get();
		journalManualMetadata(id, "category", get, set);
		persistNow(get);
	},
	markProgress: (id, t, d) => {
		const now = Date.now();
		const incoming = normalizeResumeMark({
			t,
			d,
			at: now
		});
		if (!incoming) return;
		const previous = get().progress[id];
		if (previous && now - previous.at < 2500 && Math.abs(previous.t - t) < 4) return;
		set((s) => {
			const latest = s.history[0];
			const history = incoming.t >= 2 && (!latest || latest.id !== id || now - latest.at > 6e4) ? [{
				eventId: nextHistoryEventId(now),
				id,
				at: now,
				position: incoming.t,
				duration: incoming.d,
				source: "progress"
			}, ...s.history].slice(0, LIBRARY_LIMITS.historyMemoryEntries) : s.history;
			const mark = incoming;
			const video = lookupVideo(s.videos, id);
			const entries = video ? stableResumeKeys(video).map((key) => [key, newestResume(s.resumeProgress[key], mark) ?? mark]) : [];
			const resumeProgress = patchActivityRecord(s.resumeProgress, entries);
			return {
				progress: patchActivityRecord(s.progress, [[id, mark]]),
				resumeProgress,
				history
			};
		});
		const event = get().history[0];
		if (event?.id === id && event.at === now) appendActivityJournal(event).catch(() => void 0);
		persistActivity(get);
	},
	recordPlay: (id, source = "open") => {
		const beforeAt = get().history[0]?.at;
		set((s) => {
			const now = Date.now();
			const latest = s.history[0];
			if (latest?.id === id && now - latest.at < 2e4) return {};
			const mark = s.progress[id];
			const video = lookupVideo(s.videos, id);
			const url = video?.remote?.embedUrl ?? video?.src ?? video?.remote?.watchUrl;
			const title = video?.name?.trim();
			const poster = video?.poster ?? video?.remote?.previewUrl;
			const rating = getRating(id);
			return {
				history: [{
					eventId: nextHistoryEventId(now),
					id,
					at: now,
					position: mark?.t,
					duration: mark?.d,
					source,
					...url ? { url } : {},
					...title ? { title } : {},
					...poster ? { poster } : {},
					...rating ? { rating } : {}
				}, ...s.history].slice(0, LIBRARY_LIMITS.historyMemoryEntries),
				viewCounts: patchActivityRecord(s.viewCounts, [[id, (s.viewCounts[id] ?? 0) + 1]])
			};
		});
		const event = get().history[0];
		if (event?.id === id && event.at !== beforeAt) appendActivityJournal(event).catch(() => void 0);
		persistActivity(get);
	},
	clearHistory: () => {
		openedPlays.clear();
		set({ history: [] });
		clearActivityJournal().catch(() => void 0);
		persistNow(get);
	},
	openVideo: (activeId) => {
		measureInteraction("playback");
		const s = get();
		const video = lookupVideo(s.videos, activeId);
		if (video && isAdultVideo(video, s.folders) && !s.adultsUnlocked) {
			set({ sourceId: "adults" });
			persistNow(get);
			return;
		}
		if (video && !isAdultVideo(video, s.folders)) markRecommendationOpened(video);
		setPullViewerOpen(true);
		set({
			activeId,
			previewId: null
		});
		if (typeof window === "undefined") get().recordPlay(activeId);
		else openedPlays.push(activeId);
	},
	openPreview: (previewId, card) => {
		if (card?.id === previewId) rememberVideo(get().videos, card);
		const state = get(), selected = card ?? lookupVideo(state.videos, previewId);
		if (selected && !isAdultVideo(selected, state.folders)) markRecommendationOpened(selected);
		setPullViewerOpen(true);
		measureInteraction("navigation");
		set({ previewId });
	},
	closePreview: () => {
		measureInteraction("navigation");
		set({ previewId: null });
	},
	closePlayer: () => {
		measureInteraction("playback");
		set({ activeId: null });
	},
	hideVideo: (id) => {
		set((s) => ({
			hiddenVideos: {
				...s.hiddenVideos,
				[id]: true
			},
			activeId: s.activeId === id ? null : s.activeId,
			previewId: s.previewId === id ? null : s.previewId
		}));
		persistNow(get);
	},
	unhideVideo: (id) => {
		set((s) => {
			const hiddenVideos = { ...s.hiddenVideos };
			delete hiddenVideos[id];
			return { hiddenVideos };
		});
		persistNow(get);
	},
	removeVideo: (id) => {
		set((s) => {
			const favorites = { ...s.favorites };
			const likes = { ...s.likes };
			const tags = { ...s.tags };
			const metadataProvenance = { ...s.metadataProvenance };
			const categories = { ...s.categories };
			const progress = { ...s.progress };
			const viewCounts = { ...s.viewCounts };
			delete favorites[id];
			delete likes[id];
			delete tags[id];
			delete metadataProvenance[id];
			delete categories[id];
			delete progress[id];
			delete viewCounts[id];
			return {
				videos: s.videos.filter((video) => video.id !== id),
				activeId: s.activeId === id ? null : s.activeId,
				previewId: s.previewId === id ? null : s.previewId,
				favorites,
				likes,
				tags,
				metadataProvenance,
				categories,
				progress,
				viewCounts,
				history: s.history.filter((h) => h.id !== id)
			};
		});
		removeEnrichmentRows([id]).catch(() => void 0);
		persistNow(get);
	},
	playRelative: (delta, playlist) => {
		const { activeId } = get();
		if (!activeId || !playlist.length) return;
		const i = playlist.indexOf(activeId);
		if (i < 0) return;
		const next = playlist[i + delta];
		if (next) get().openVideo(next);
	},
	setHideDemo: (hideDemo) => {
		set((s) => ({
			hideDemo,
			sourceId: hideDemo && s.sourceId === "demo" ? "home" : s.sourceId
		}));
		persistNow(get);
	},
	setShowHiddenAdult: (showHiddenAdult) => set({ showHiddenAdult }),
	setHardwareAccel: (hardwareAccel) => {
		set({ hardwareAccel });
		persistNow(get);
	},
	setFolderAdult: (folderId, adult) => {
		if (folderId === "demo") return;
		set((s) => ({
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				adult
			} : f),
			tags: adult ? Object.fromEntries(s.videos.map((video) => [video.id, video.folderId === folderId ? compactIngestedTags(s.tags[video.id] ?? [], ["adult"]) : s.tags[video.id] ?? []])) : s.tags,
			sourceId: adult ? "adults" : s.sourceId === folderId ? "home" : s.sourceId,
			activeId: s.activeId && s.videos.some((v) => v.id === s.activeId && v.folderId === folderId) && adult && !s.adultsUnlocked ? null : s.activeId
		}));
		persistNow(get);
	},
	searchAdultFeed: async (query = "all", order = "top-weekly", opts) => {
		if (get().remoteBusy || get().refreshing) throw new Error("A catalog pull is already running. Pause or finish it before starting another.");
		const policyFor = (settings) => adultAdmissionPolicy(settings, opts?.automatic);
		const policy = policyFor(getPullSettings());
		const providers = opts?.providers ?? "all";
		const providerList = providers === "all" ? [...ADULT_PULL_PROVIDERS] : [...new Set(providers)];
		const startedAt = Date.now(), pullId = makePullId(), cancellation = getPullCancellationRevision();
		const targets = providerList.map((provider) => ADULT_FOLDER_BY_PROVIDER[provider].name);
		const initialCounts = await remoteEntryCounts(get().videos);
		const cleanupRemaining = cleanupBudgets(policy);
		const requestCapacity = replacementRequestBudget(initialCounts, policy, "adult", cleanupRemaining);
		if (!requestCapacity) throw new Error(ENTRY_LIMIT_MESSAGE);
		if (get().remoteBusy || get().refreshing) throw new Error("A catalog pull is already running.");
		const maxVideos = Math.min(requestCapacity, policy.adultBatchVideos, Math.max(1, opts?.maxVideos ?? policy.adultBatchVideos));
		const pendingProviders = [...providerList], visitedProviders = /* @__PURE__ */ new Set();
		const cursors = loadAdultArchiveCursors(query, order);
		const checkpoint = (pages, offsets) => {
			saveAdultArchiveCursors(query, order, pages, offsets);
			for (const provider of providerList) {
				const page = pages[provider];
				if (page != null) cursors[provider] = {
					page,
					offset: offsets[provider] ?? 0,
					query,
					order,
					updatedAt: Date.now()
				};
			}
		};
		const maxWindows = Math.max(providerList.length, Math.ceil(maxVideos / 400) + providerList.length * 2);
		const deadline = Date.now() + (opts?.automatic ? 45e3 : 12e4);
		let received = 0, added = 0, done = 0, carryBudget = 0;
		const diagnostics = [];
		const counts = /* @__PURE__ */ new Map();
		const knownAdultIds = /* @__PURE__ */ new Set();
		const turn = async () => {
			await yieldCatalogTask();
			await waitForCatalogCommit(cancellation);
		};
		get().beginPull({
			id: pullId,
			provider: "adult",
			action: "Catalog pull",
			startedAt,
			targets,
			done,
			total: providerList.length,
			received,
			added,
			failed: 0
		});
		set({
			remoteBusy: true,
			adultPullStatus: null,
			importProgress: {
				done: 0,
				total: providerList.length,
				label: "Starting paced Adult pull…"
			}
		});
		try {
			await forEachCatalogSlice(get().videos, (video) => {
				if (isAdultPullKind$1(video.remote?.kind)) knownAdultIds.add(video.id);
			}, turn);
			for (let window = 0; window < maxWindows && pendingProviders.length && added < maxVideos && Date.now() < deadline; window++) {
				const provider = pendingProviders.shift();
				const firstWindow = !visitedProviders.has(provider);
				visitedProviders.add(provider);
				done = visitedProviders.size;
				let continueProvider = false;
				if (getPullCancellationRevision() !== cancellation) break;
				const providerAddedBefore = added;
				const currentCounts = await remoteEntryCounts(get().videos), currentPolicy = policyFor(getPullSettings());
				const available = replacementRequestBudget(currentCounts, currentPolicy, "adult", cleanupRemaining);
				if (!available) break;
				const budget = Math.min(available, 400, maxVideos - added, adultProviderPullBudget(maxVideos - added, pendingProviders.length + 1, 0, carryBudget));
				carryBudget = 0;
				if (!budget) continue;
				const saved = cursors[provider];
				const page = firstWindow ? opts?.providerPages?.[provider] ?? (opts?.resumeArchive === false ? opts?.page ?? 1 : saved?.page ?? opts?.page ?? 1) : saved?.page ?? 1;
				const offset = firstWindow && (opts?.resumeArchive === false || opts?.providerPages?.[provider] !== void 0 && opts.providerPages[provider] !== saved?.page) ? 0 : saved?.offset ?? 0;
				set({ importProgress: {
					done,
					total: providerList.length,
					label: `Pulling ${provider} · page ${page} · up to ${budget} entries…`
				} });
				try {
					const walked = await walkAdultPull(budget, page, offset, async (nextPage, nextOffset, limit) => {
						set({ importProgress: {
							done,
							total: providerList.length,
							label: `Pulling ${provider} · page ${nextPage} · target ${budget.toLocaleString()} entries…`
						} });
						const response = await searchAdultVideos({ data: {
							query,
							order,
							page: nextPage,
							maxVideos: limit,
							append: true,
							providers: [provider],
							providerPages: { [provider]: nextPage },
							providerOffsets: { [provider]: nextOffset },
							redditSources: opts?.redditSources
						} });
						return {
							...response,
							nextPage: response.providerNextPages[provider] ?? null,
							nextOffset: response.providerNextOffsets[provider] ?? 0
						};
					}, turn, {
						known: provider === "chaturbate" || provider === "myfreecams" ? void 0 : knownAdultIds,
						refreshLimit: 32,
						maxRequests: opts?.automatic ? 4 : 12,
						maxMs: Math.min(deadline - Date.now(), opts?.automatic ? 12e3 : 2e4)
					});
					if (!walked.latest) {
						carryBudget += budget;
						get().updatePull({
							done,
							received,
							added,
							failed: diagnostics.filter((row) => row.status === "failed").length
						});
						continue;
					}
					continueProvider = walked.latest.nextPage != null && !walked.error;
					const result = {
						...walked.latest,
						videos: walked.videos,
						providerDiagnostics: walked.latest.providerDiagnostics.map((row) => ({
							...row,
							titles: walked.videos.length,
							detail: row.status === "failed" ? row.detail : `${walked.newCount.toLocaleString()} new candidates · ${walked.refreshedCount} saved titles refreshed · ${walked.requests} requests · ${walked.duplicates.toLocaleString()} already-saved/repeated titles skipped${walked.error ? " · stopped after a provider error; saved results are retained" : ""}`
						}))
					};
					if (walked.error) result.providerDiagnostics.push({
						provider,
						status: "failed",
						titles: 0,
						detail: walked.error instanceof Error ? walked.error.message : String(walked.error)
					});
					await turn();
					let fetched = dedupeAdultVideoCards(applyCachedAdultUrls(result.videos));
					fetched = await rotateRemotePull(get, fetched, cleanupRemaining, policyFor);
					let admission = (await prepareRemotePull(get, fetched, void 0, false, policyFor)).admission;
					let videos = admission.videos;
					if (admission.skipped) result.providerDiagnostics.push({
						provider,
						status: "empty",
						titles: 0,
						detail: ENTRY_LIMIT_MESSAGE
					});
					if (!videos.length) {
						diagnostics.push(...result.providerDiagnostics);
						if (!admission.skipped) checkpoint(result.providerNextPages, result.providerNextOffsets);
						if (walked.error) recordAdultArchiveFailure(query, order, provider);
						if (continueProvider && !admission.skipped) pendingProviders.push(provider);
						if (!admission.skipped) carryBudget += budget;
						get().updatePull({
							done,
							received,
							added,
							failed: diagnostics.filter((row) => row.status === "failed").length
						});
						continue;
					}
					const inferredTags = /* @__PURE__ */ new Map();
					await forEachCatalogSlice(fetched, (video) => {
						const source = video.remote?.kind ?? video.folderId.split(":")[0] ?? "eporner";
						const redditExtra = source === "reddit" ? redditIngestExtras({
							subreddit: video.remote?.channelId,
							title: video.name,
							extraText: `${video.description ?? ""} ${video.tagline ?? ""}`,
							mediaKind: video.extension === "image" ? "image" : /video/i.test(video.mime) ? "video" : void 0
						}) : [];
						inferredTags.set(video.id, adultIngestTags({
							source,
							extraSources: [
								...(video.remote?.sourceKinds ?? []).filter((kind) => kind !== source),
								...source === "booru" && video.remote?.channelId ? [video.remote.channelId] : [],
								...source === "reddit" && video.remote?.channelId ? [`reddit-${video.remote.channelId}`] : []
							],
							creatorNames: [video.remote?.channelName, source === "chaturbate" || source === "myfreecams" ? video.remote?.videoId : void 0],
							apiKeywords: video.description ?? video.tagline ?? "",
							title: video.name,
							description: video.description ?? video.tagline ?? "",
							extraTags: redditExtra,
							extraText: source === "reddit" ? `${video.name} ${video.tagline ?? ""}` : void 0,
							limit: LIBRARY_LIMITS.adultKeywordTagsPerTitle + 36
						}));
					}, turn);
					let committed = false;
					while (!committed) {
						const base = get(), entryPolicy = getPullSettings();
						admission = (await prepareRemotePull(get, fetched, void 0, false, policyFor)).admission;
						if (get().videos !== base.videos || getPullSettings() !== entryPolicy) continue;
						videos = admission.videos;
						if (!videos.length) {
							committed = true;
							break;
						}
						const wanted = new Set(videos.map((video) => video.id));
						const positions = /* @__PURE__ */ new Map();
						counts.clear();
						await forEachCatalogSlice(base.videos, (video, index) => {
							if (wanted.has(video.id)) positions.set(video.id, index);
							if (ADULT_FOLDER_IDS.includes(video.folderId)) counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1);
						}, turn);
						const nextTags = sparseRecordBuilder(base.tags);
						const nextMetadata = sparseRecordBuilder(base.metadataProvenance);
						const nextVideos = await copyCatalogArray(base.videos, turn);
						let batchAdded = 0;
						await forEachCatalogSlice(videos, (video, index) => {
							const position = positions.get(video.id);
							if (position === void 0) {
								positions.set(video.id, nextVideos.length);
								nextVideos.push(catalogCard(video));
								batchAdded++;
								counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1);
							} else {
								video = retainAdultRefreshEvidence(base.videos[position], video, base.metadataProvenance[video.id]);
								videos[index] = video;
								nextVideos[position] = catalogCard(video);
							}
							const current = base.tags[video.id] ?? [];
							if (tagsLocked(base.metadataProvenance[video.id])) return;
							const inferred = inferredTags.get(video.id) ?? [];
							const compact = compactIngestedTags(current, inferred);
							nextTags.set(video.id, compact);
							nextMetadata.set(video.id, mergeInferredTagProvenance(current, compact, base.metadataProvenance[video.id], inferred, `provider:${video.remote?.kind ?? "eporner"}`));
						}, turn);
						await turn();
						const latest = get();
						if (latest.videos !== base.videos || latest.tags !== base.tags || latest.metadataProvenance !== base.metadataProvenance || getPullSettings() !== entryPolicy) continue;
						await appendCatalogVideos(videos);
						await waitForCatalogCommit(cancellation).catch((error) => {
							if (getPullCancellationRevision() === cancellation) throw error;
						});
						const afterSave = get();
						if (afterSave.videos !== base.videos || afterSave.tags !== base.tags || afterSave.metadataProvenance !== base.metadataProvenance) {
							if (getPullCancellationRevision() !== cancellation) break;
							continue;
						}
						const folder = ADULT_FOLDER_BY_PROVIDER[provider];
						const nextFolder = {
							...folder,
							videoCount: counts.get(folder.id) ?? 0,
							adult: true
						};
						set({
							videos: nextVideos,
							folders: afterSave.folders.some((row) => row.id === folder.id) ? afterSave.folders.map((row) => row.id === folder.id ? nextFolder : row) : [...afterSave.folders, nextFolder],
							tags: nextTags.finish(),
							metadataProvenance: nextMetadata.finish(),
							adultsUnlocked: true
						});
						rememberEntryCounts(nextVideos, admission.counts);
						added += batchAdded;
						received += fetched.length;
						committed = true;
					}
					if (!committed) break;
					cacheAdultVideoUrls(videos);
					for (const video of videos) knownAdultIds.add(video.id);
					diagnostics.push(...result.providerDiagnostics);
					if (!admission.skipped) checkpoint(result.providerNextPages, result.providerNextOffsets);
					for (const diagnostic of result.providerDiagnostics) if (diagnostic.status === "failed" && ADULT_PULL_PROVIDERS.includes(diagnostic.provider)) recordAdultArchiveFailure(query, order, diagnostic.provider);
					if (!admission.skipped) carryBudget += Math.max(0, budget - admission.added);
				} catch (error) {
					continueProvider = false;
					if (getPullCancellationRevision() !== cancellation) break;
					recordAdultArchiveFailure(query, order, provider);
					diagnostics.push({
						provider,
						status: "failed",
						titles: 0,
						detail: error instanceof Error ? error.message : String(error)
					});
					carryBudget += Math.max(0, budget - (added - providerAddedBefore));
				}
				if (continueProvider && added < maxVideos) pendingProviders.push(provider);
				get().updatePull({
					done,
					received,
					added,
					failed: diagnostics.filter((row) => row.status === "failed").length
				});
				await new Promise((resolve) => setTimeout(resolve, 0));
			}
			if (received) persistSoon(get);
			const failed = diagnostics.filter((row) => row.status === "failed");
			const cancelled = getPullCancellationRevision() !== cancellation;
			const resumable = pendingProviders.length > 0 && added < maxVideos;
			set({ adultPullStatus: {
				note: cancelled ? "Pull cancelled. Accepted entries and archive resume points are saved." : `${added.toLocaleString()} new entries · ${received.toLocaleString()} received. Archive pages are saved after each small window.${resumable ? " More pages remain; use Continue archive." : ""}`,
				diagnostics
			} });
			get().finishPull({
				id: pullId,
				provider: "adult",
				action: "Catalog pull",
				startedAt,
				finishedAt: Date.now(),
				targets,
				done,
				total: providerList.length,
				received,
				added,
				failed: failed.length,
				status: cancelled || resumable ? "partial" : failed.length ? received ? "partial" : "failed" : received ? "success" : "partial",
				errors: cancelled ? ["Pull cancelled. Accepted entries and archive resume points are saved."] : failed.map((row) => `${row.provider}: ${row.detail}`).slice(0, 12)
			});
			return [...counts.values()].reduce((sum, count) => sum + count, 0);
		} finally {
			set({
				remoteBusy: false,
				importProgress: null
			});
		}
	},
	addFolder: async (inputEl, startIn, opts) => {
		const result = await pickDirectory(startIn);
		if (result === "abort") return;
		if (result === "fallback") {
			inputEl?.click();
			return;
		}
		const handle = result;
		if (!await requestDirPermission(handle)) return;
		const folderId = `folder:${handle.name}:${createShortLocalId("", 8)}`;
		rememberDirHandle(folderId, handle);
		const adult = Boolean(opts?.adult);
		const folder = {
			id: folderId,
			name: handle.name,
			kind: "directory",
			videoCount: 0,
			recommended: startIn,
			adult
		};
		set((s) => ({
			folders: [...s.folders.filter((f) => f.id !== folderId), folder],
			scanning: {
				found: 0,
				looked: 0,
				folderName: handle.name
			}
		}));
		let writeChain = clearFolderVideos(folderId).catch(() => void 0);
		let discoveredPhotos = 0;
		try {
			const videos = await ingestDirectoryHandle(handle, folderId, {
				onProgress: (p) => set({ scanning: p }),
				onImage: (file, relativePath) => {
					discoveredPhotos += 1;
					useSourceAssets.getState().capturePhoto(file, `${handle.name}/${relativePath}`);
				},
				onBatch: (batch) => {
					if (!batch.length) return;
					set((s) => ({
						videos: s.videos.concat(batch),
						folders: s.folders.map((f) => f.id === folderId ? {
							...f,
							videoCount: (f.videoCount ?? 0) + batch.length
						} : f)
					}));
					writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
				}
			});
			await writeChain;
			set((s) => ({
				folders: s.folders.map((f) => f.id === folderId ? {
					...f,
					videoCount: videos.length,
					photoCount: discoveredPhotos
				} : f),
				scanning: null
			}));
			if (videos.length) set((s) => addLocalNameTags(s.tags, s.metadataProvenance, videos));
			flushPersist(get);
			await saveDirHandle({
				id: folderId,
				name: handle.name,
				handle
			});
			if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
		} catch (err) {
			set({ scanning: null });
			throw err;
		}
	},
	addFiles: async (inputEl) => {
		inputEl?.click();
	},
	ingestFromInput: async (files, asDirectory, opts) => {
		if (!files.length) return;
		useSourceAssets.getState().capture(files);
		const rel = files[0].webkitRelativePath || "";
		const folderName = asDirectory ? rel.split("/")[0] || "Folder" : "Added files";
		const folderId = asDirectory ? `folder:${folderName}:${createShortLocalId("", 8)}` : `files:${createShortLocalId("", 8)}`;
		const adult = Boolean(opts?.adult) || get().sourceId === "adults" || get().sourceId === "adult-fetishes";
		const folder = {
			id: folderId,
			name: folderName,
			kind: asDirectory ? "directory" : "files",
			videoCount: 0,
			adult
		};
		set((s) => ({
			folders: [...s.folders, folder],
			scanning: {
				found: 0,
				looked: 0,
				folderName
			}
		}));
		let writeChain = Promise.resolve();
		const videos = await ingestFileList(files, folderId, folderName, {
			onProgress: (p) => set({ scanning: p }),
			onBatch: (batch) => {
				if (!batch.length) return;
				set((s) => ({
					videos: s.videos.concat(batch),
					folders: s.folders.map((f) => f.id === folderId ? {
						...f,
						videoCount: (f.videoCount ?? 0) + batch.length
					} : f)
				}));
				writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
			}
		});
		await writeChain;
		set((s) => ({
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				videoCount: videos.length
			} : f),
			scanning: null
		}));
		if (videos.length) set((s) => addLocalNameTags(s.tags, s.metadataProvenance, videos));
		flushPersist(get);
		if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
	},
	ingestDrop: async (dt) => {
		const nameGuess = dt.files?.[0]?.webkitRelativePath?.split("/")[0] || dt.files?.[0]?.name || "Dropped files";
		const folderId = `drop:${createShortLocalId("", 8)}`;
		const adult = get().sourceId === "adults" || get().sourceId === "adult-fetishes";
		set((s) => ({
			folders: [...s.folders, {
				id: folderId,
				name: nameGuess,
				kind: "files",
				videoCount: 0,
				adult
			}],
			scanning: {
				found: 0,
				looked: 0,
				folderName: nameGuess
			}
		}));
		let writeChain = Promise.resolve();
		const videos = await ingestDataTransfer(dt, folderId, nameGuess, {
			onProgress: (p) => set({ scanning: p }),
			onBatch: (batch) => {
				if (!batch.length) return;
				set((s) => ({
					videos: s.videos.concat(batch),
					folders: s.folders.map((f) => f.id === folderId ? {
						...f,
						videoCount: (f.videoCount ?? 0) + batch.length
					} : f)
				}));
				writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
			}
		});
		await writeChain;
		const folderName = videos[0]?.path.includes("/") ? videos[0].path.split("/")[0] : "Dropped files";
		set((s) => ({
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				name: folderName,
				kind: videos.some((v) => v.path.includes("/")) ? "directory" : "files",
				videoCount: videos.length
			} : f),
			scanning: null
		}));
		if (videos.length) set((s) => addLocalNameTags(s.tags, s.metadataProvenance, videos));
		flushPersist(get);
		if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
	},
	restoreFolders: () => {
		if (get().hydrated || restoring) return restoreCompletion ?? Promise.resolve();
		restoring = true;
		restoreCompletion = (async () => {
			try {
				beginStartupPhase("preferences");
				set({ pullHistory: loadPullHistory() });
				await recoverCatalogMutations().catch(() => void 0);
				await restoreDurablePrefs().catch(() => void 0);
				hydrateDurableFeedback().catch(() => void 0);
				hydrateTopicAliases();
				const dedicatedFollows = await restoreDurableFollows().catch(() => loadFollows() ?? []);
				const prefsState = applyPrefs({});
				Object.assign(prefsState, await restoreEnrichmentRows({
					tags: prefsState.tags ?? {},
					metadataProvenance: prefsState.metadataProvenance ?? {}
				}).catch(() => ({
					tags: prefsState.tags ?? {},
					metadataProvenance: prefsState.metadataProvenance ?? {}
				})));
				prefsState.tags = restoreTagEdits(prefsState.tags ?? {});
				prefsState.metadataProvenance = restoreMetadataEdits(prefsState.metadataProvenance ?? {});
				Object.assign(prefsState, await restoreCatalogMetadata({
					tags: prefsState.tags ?? {},
					metadataProvenance: prefsState.metadataProvenance ?? {},
					categories: prefsState.categories ?? {}
				}).catch(() => ({})));
				const prefsFollows = Array.isArray(prefsState.follows) ? prefsState.follows : [];
				const migratedFollows = dedupeFollows([...dedicatedFollows, ...prefsFollows]);
				prefsState.follows = migratedFollows;
				const youtubeCooldown = restoreYoutubeCooldown(migratedFollows);
				if (youtubeCooldown) prefsState.youtubeRefreshStatus = {
					at: Date.now(),
					checked: 0,
					refreshed: 0,
					failed: 0,
					youtube: 0,
					twitch: 0,
					...youtubeCooldown
				};
				if (migratedFollows.length) saveFollows(migratedFollows);
				const adultIds = new Set(loadPrefs()?.privateFolderIds ?? []);
				let cachedFolderIds = /* @__PURE__ */ new Set();
				let savedHealth = /* @__PURE__ */ new Map();
				preferencesRestored = true;
				set((s) => ({
					...prefsState,
					...navigationChanged ? { sourceId: s.sourceId } : {}
				}));
				finishStartupPhase("preferences");
				const restoringShelfRevision = savedShelfRevision;
				personalRestoreCompletion = Promise.all([
					loadActivitySnapshot(),
					loadActivityJournal(),
					restoreDurableHistory(),
					restoreDurableResume(),
					restoreDurableMarks(),
					restoreDurableShelves(),
					restoreDurableLinks()
				]).then(async ([activity, journal, durableHistory, durableResume, durableMarks, durableShelves, durableLinks]) => {
					const queuedResume = takeQueuedResumeReplay();
					const hasShelves = durableShelves.authoritative || durableShelves.favorites.length || durableShelves.likes.length;
					if (!(activity || journal.length || durableHistory.length || Object.keys(durableResume.resumeProgress).length || Object.keys(durableMarks.viewCounts).length || Object.keys(durableMarks.cameCounts).length || hasShelves || durableLinks.length || Object.keys(queuedResume).length)) return;
					if (durableHistory.length || (activity?.history?.length ?? 0) || journal.length) {
						const mergedEarly = mergeHistory(mergeHistory(durableHistory, activity?.history ?? []), journal);
						if (mergedEarly.length) saveDurableHistory(mergedEarly);
					}
					if (Object.keys(durableResume.resumeProgress).length || activity?.resumeProgress) saveDurableResume(recoverResumeRecords(activity?.progress, durableResume.progress), recoverResumeRecords(activity?.resumeProgress, durableResume.resumeProgress));
					if (Object.keys(durableMarks.viewCounts).length || Object.keys(durableMarks.cameCounts).length || activity?.viewCounts || activity?.cameCounts) saveDurableMarks(recoverActivityCounts(activity?.viewCounts, durableMarks.viewCounts), recoverActivityCounts(activity?.cameCounts, durableMarks.cameCounts));
					if (durableLinks.length) saveDurableLinks(durableLinks);
					set((s) => {
						const resumeProgress = recoverResumeRecords(s.resumeProgress, activity?.resumeProgress, durableResume.resumeProgress, queuedResume);
						const replaceShelves = durableShelves.authoritative && savedShelfRevision === restoringShelfRevision;
						const favorites = replaceShelves ? {} : { ...s.favorites };
						const likes = replaceShelves ? {} : { ...s.likes };
						if (savedShelfRevision === restoringShelfRevision) {
							for (const id of durableShelves.favorites) favorites[id] = true;
							for (const id of durableShelves.likes) likes[id] = true;
						}
						const history = mergeHistory(mergeHistory(mergeHistory(s.history, durableHistory), activity?.history ?? []), journal);
						const linkById = new Map(durableLinks.map((link) => [link.id, link]));
						return {
							history: history.map((entry) => {
								if (entry.url) return entry;
								const link = linkById.get(entry.id);
								return link ? {
									...entry,
									url: link.url,
									title: entry.title ?? link.title,
									poster: entry.poster ?? link.poster
								} : entry;
							}),
							resumeProgress,
							progress: recoverResumeRecords(s.progress, activity?.progress, durableResume.progress),
							viewCounts: recoverActivityCounts(s.viewCounts, activity?.viewCounts, durableMarks.viewCounts),
							cameCounts: recoverActivityCounts(s.cameCounts, activity?.cameCounts, durableMarks.cameCounts),
							favorites,
							likes
						};
					});
					for (;;) {
						const base = get();
						const progress = await reconcileRestoredResume(base.videos, base.progress, base.resumeProgress, newestResume);
						const latest = get();
						if (base.videos !== latest.videos || base.progress !== latest.progress || base.resumeProgress !== latest.resumeProgress) continue;
						if (progress !== base.progress) set({ progress });
						break;
					}
				}).catch(() => void 0);
				set({ hydrated: true });
				await new Promise((resolve) => {
					if (typeof window === "undefined") resolve();
					else window.setTimeout(resolve, 32);
				});
				beginStartupPhase("remoteRead");
				try {
					const snapshot = await loadRemoteSnapshot();
					finishStartupPhase("remoteRead", snapshot?.videos.length ?? 0);
					beginStartupPhase("remotePrepare");
					if (snapshot) {
						let base = get(), prepared = await prepareCatalogRestore(base, snapshot.videos, {
							remoteOnly: true,
							newestResume
						});
						while (!sameRestoreInputs(base, get())) {
							base = get();
							prepared = await prepareCatalogRestore(base, snapshot.videos, {
								remoteOnly: true,
								newestResume
							});
						}
						const folderIds = new Set(snapshot.folders.map((folder) => folder.id));
						const currentFolders = new Map(get().folders.map((folder) => [folder.id, folder]));
						set((s) => {
							return {
								videos: prepared.videos,
								progress: prepared.progress,
								folders: [...s.folders.filter((f) => !folderIds.has(f.id)), ...snapshot.folders.filter((f) => prepared.followIds.has(f.id)).map((folder) => {
									const current = currentFolders.get(folder.id);
									return current && (current.lastCheckedAt ?? 0) > (folder.lastCheckedAt ?? snapshot.checkedAt) ? current : folder;
								})],
								remoteCheckedAt: Math.max(s.remoteCheckedAt ?? 0, snapshot.checkedAt),
								youtubeCleanup: snapshot.youtubeCleanup ?? s.youtubeCleanup
							};
						});
					}
					finishStartupPhase("remotePrepare", get().videos.length);
				} catch {
					finishStartupPhase("remoteRead", void 0, true);
					finishStartupPhase("remotePrepare", void 0, true);
				}
				restoreDurablePhotos().then((photos) => {
					if (!photos.sources.length) return;
					set((s) => ({ folders: restorePhotoFolders(s.folders, photos.sources, adultIds) }));
				}).catch(() => void 0);
				restoring = false;
				if (typeof window !== "undefined") {
					const importSessions = {
						twitch: await loadImportSession("twitch"),
						youtube: await loadImportSession("youtube")
					};
					const recover = (kind) => {
						try {
							const saved = importSessions[kind].saved;
							if (!Array.isArray(saved) || !saved.length) return;
							const original = saved.filter((value) => typeof value === "string" && Boolean(value.trim()));
							const repaired = kind === "youtube" && !importSessions.youtube.review ? repairYoutubeImport(original, importSessions.youtube.draft) : null;
							const handles = repaired?.queries ?? original;
							if (repaired?.fragments.size) {
								try {
									localStorage.setItem("reelcase.import-history.youtube", JSON.stringify(handles));
								} catch {}
								set({ follows: reviewYoutubeImport(get().follows, importSessions.youtube.draft) });
							}
							const resolvedQueries = resolvedFollowQueries(get().follows, kind);
							const pendingHandles = handles.filter((query) => !resolvedQueries.has(canonicalFollowHandle(kind, query)));
							const stubs = pendingHandles.map((query) => importedFollowStub(query, kind)).filter((row) => row.handle);
							if (stubs.length) {
								const merged = dedupeFollows([...get().follows, ...stubs]);
								set({ follows: merged });
								saveFollows(merged);
							}
							if (importSessions[kind].review) return [];
							const failures = new Map(get().follows.filter((channel) => channel.kind === kind && channel.lastProviderFailure).map((channel) => [canonicalFollowHandle(kind, channel.importQuery ?? channel.handle), channel.lastProviderFailure]));
							return pendingHandles.filter((query) => {
								const failure = failures.get(canonicalFollowHandle(kind, query));
								return !failure || Date.now() >= (failure.retryAt ?? failure.at + 36e5);
							}).slice(0, kind === "youtube" ? 4 : 8).map((query) => ({
								query,
								kind
							}));
						} catch {}
					};
					const twitchRecovery = recover("twitch") ?? [];
					const youtubeRecovery = recover("youtube") ?? [];
					if (getPullSettings().automaticPulls && !pullsPaused()) (async () => {
						if (twitchRecovery.length) await get().importBatch(twitchRecovery);
						if (youtubeRecovery.length) await get().importBatch(youtubeRecovery);
					})().catch(() => void 0);
				}
				beginStartupPhase("localRead");
				try {
					const [storedCatalog, healthRows] = await Promise.all([loadCatalogVideos(), loadSourceHealth()]);
					finishStartupPhase("localRead", storedCatalog.length);
					beginStartupPhase("localPrepare");
					savedHealth = new Map(healthRows.map((entry) => [entry.id, entry]));
					if (storedCatalog.length) {
						let base = get(), prepared = await prepareCatalogRestore(base, storedCatalog, { newestResume });
						while (!sameRestoreInputs(base, get())) {
							base = get();
							prepared = await prepareCatalogRestore(base, storedCatalog, { newestResume });
						}
						const counts = prepared.counts;
						cachedFolderIds = new Set(counts.keys());
						set((s) => {
							const folderIds = new Set(s.folders.map((folder) => folder.id));
							return {
								videos: prepared.videos,
								progress: prepared.progress,
								folders: [...s.folders, ...[...counts.entries()].filter(([id]) => !folderIds.has(id)).map(([id, videoCount]) => ({
									id,
									name: id.split(":")[1] || id,
									kind: "directory",
									videoCount,
									adult: adultIds.has(id) || ADULT_FOLDER_IDS.includes(id),
									needsPermission: true
								}))].map((f) => {
									const provider = Object.values(ADULT_FOLDER_BY_PROVIDER).find((folder) => folder.id === f.id);
									return {
										...f,
										...provider ? {
											name: provider.name,
											kind: provider.kind,
											adult: true,
											needsPermission: false
										} : {},
										...counts.has(f.id) ? {
											videoCount: counts.get(f.id) ?? f.videoCount,
											...savedHealth.get(f.id) ?? {}
										} : {}
									};
								})
							};
						});
					}
					finishStartupPhase("localPrepare", get().videos.length);
				} catch {
					finishStartupPhase("localRead", void 0, true);
					finishStartupPhase("localPrepare", void 0, true);
				}
				markCatalogReady();
				queueMetadataRepair(get, set);
				let stored = [];
				try {
					stored = await loadDirHandles();
				} catch {
					return;
				}
				for (const row of stored) {
					rememberDirHandle(row.id, row.handle);
					let perm = "prompt";
					try {
						perm = await queryDirPermission(row.handle);
					} catch {
						perm = "prompt";
					}
					const adult = adultIds.has(row.id);
					if (localStorage.getItem("reelcase.source-cache-first") !== "false" && (cachedFolderIds.has(row.id) || savedHealth.has(row.id)) || !getPullSettings().automaticPulls || pullsPaused()) {
						const snapshot = {
							id: row.id,
							health: "cached",
							lastCheckedAt: Date.now(),
							videoCount: savedHealth.get(row.id)?.videoCount ?? 0
						};
						set((s) => ({ folders: s.folders.some((folder) => folder.id === row.id) ? s.folders.map((folder) => folder.id === row.id ? {
							...folder,
							name: row.name,
							needsPermission: perm !== "granted",
							...snapshot
						} : folder) : [...s.folders, {
							id: row.id,
							name: row.name,
							kind: "directory",
							videoCount: snapshot.videoCount,
							adult,
							needsPermission: perm !== "granted",
							health: "cached"
						}] }));
						if (cachedFolderIds.has(row.id) || savedHealth.has(row.id)) saveSourceHealth(snapshot).catch(() => void 0);
						continue;
					}
					if (perm === "granted") {
						set((s) => ({
							scanning: {
								found: 0,
								looked: 0,
								folderName: row.name
							},
							folders: [...s.folders.filter((f) => f.id !== row.id), {
								id: row.id,
								name: row.name,
								kind: "directory",
								videoCount: 0,
								adult
							}],
							videos: s.videos.filter((v) => v.folderId !== row.id)
						}));
						let writeChain = clearFolderVideos(row.id).catch(() => void 0);
						try {
							const videos = await ingestDirectoryHandle(row.handle, row.id, {
								onProgress: (p) => set({ scanning: p }),
								onBatch: (batch) => {
									if (!batch.length) return;
									set((s) => ({
										videos: s.videos.concat(batch),
										folders: s.folders.map((f) => f.id === row.id ? {
											...f,
											videoCount: (f.videoCount ?? 0) + batch.length
										} : f)
									}));
									writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
								}
							});
							await writeChain;
							set((s) => ({
								folders: s.folders.map((f) => f.id === row.id ? {
									...f,
									videoCount: videos.length,
									needsPermission: false,
									health: "healthy",
									lastCheckedAt: Date.now()
								} : f),
								scanning: null
							}));
							if (videos.length) await saveFolderVideos(row.id, videos).catch(() => void 0);
							saveSourceHealth({
								id: row.id,
								health: "healthy",
								lastCheckedAt: Date.now(),
								videoCount: videos.length
							}).catch(() => void 0);
						} catch {
							saveSourceHealth({
								id: row.id,
								health: "unavailable",
								lastCheckedAt: Date.now(),
								videoCount: 0
							}).catch(() => void 0);
							set((s) => ({
								scanning: null,
								folders: [...s.folders.filter((f) => f.id !== row.id), {
									id: row.id,
									name: row.name,
									kind: "directory",
									videoCount: 0,
									needsPermission: true,
									health: "unavailable",
									lastCheckedAt: Date.now(),
									adult
								}]
							}));
						}
					} else {
						saveSourceHealth({
							id: row.id,
							health: "permission-needed",
							lastCheckedAt: Date.now(),
							videoCount: savedHealth.get(row.id)?.videoCount ?? 0
						}).catch(() => void 0);
						set((s) => ({ folders: [...s.folders.filter((f) => f.id !== row.id), {
							id: row.id,
							name: row.name,
							kind: "directory",
							videoCount: s.folders.find((f) => f.id === row.id)?.videoCount ?? 0,
							needsPermission: true,
							health: "permission-needed",
							lastCheckedAt: Date.now(),
							adult
						}] }));
					}
				}
			} finally {
				await personalRestoreCompletion;
			}
		})();
		return restoreCompletion;
	},
	restoreOne: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle) return;
		if (!await requestDirPermission(handle)) return;
		const name = get().folders.find((f) => f.id === folderId)?.name ?? handle.name;
		const resumeByPath = new Map(get().videos.filter((video) => video.folderId === folderId).map((video) => [video.path, get().progress[video.id]]));
		const retainedRecoveryIds = /* @__PURE__ */ new Set([
			...get().history.map((entry) => entry.id),
			...Object.keys(get().favorites),
			...Object.keys(get().likes)
		]);
		set((s) => ({
			scanning: {
				found: 0,
				looked: 0,
				folderName: name
			},
			videos: s.videos.filter((v) => v.folderId !== folderId || retainedRecoveryIds.has(v.id)),
			unavailable: Object.fromEntries(Object.entries(s.unavailable).filter(([id]) => !s.videos.some((video) => video.id === id && video.folderId === folderId))),
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				videoCount: 0,
				needsPermission: false
			} : f)
		}));
		let writeChain = clearFolderVideos(folderId).catch(() => void 0);
		const videos = await ingestDirectoryHandle(handle, folderId, {
			onProgress: (p) => set({ scanning: p }),
			onBatch: (batch) => {
				if (!batch.length) return;
				set((s) => ({
					videos: s.videos.concat(batch.filter((video) => !s.videos.some((existing) => existing.id === video.id))),
					folders: s.folders.map((f) => f.id === folderId ? {
						...f,
						videoCount: (f.videoCount ?? 0) + batch.length
					} : f)
				}));
				writeChain = writeChain.then(() => appendCatalogVideos(batch)).catch(() => void 0);
			}
		});
		await writeChain;
		const recoveredProgress = videos.reduce((next, video) => {
			const mark = resumeByPath.get(video.path);
			if (mark) next[video.id] = mark;
			return next;
		}, {});
		set((s) => ({
			folders: s.folders.map((f) => f.id === folderId ? {
				...f,
				videoCount: videos.length,
				needsPermission: false
			} : f),
			scanning: null,
			progress: {
				...s.progress,
				...recoveredProgress
			}
		}));
		if (videos.length) await saveFolderVideos(folderId, videos).catch(() => void 0);
	},
	repairArtworkSource: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle || await queryDirPermission(handle) !== "granted") return false;
		await get().restoreOne(folderId);
		return true;
	},
	refreshSourcePhotos: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle) return 0;
		try {
			if (await queryDirPermission(handle) !== "granted") return 0;
			let photoCount = 0;
			await ingestDirectoryHandle(handle, folderId, {
				imagesOnly: true,
				onImage: (file, relativePath) => {
					photoCount += 1;
					useSourceAssets.getState().capturePhoto(file, `${handle.name}/${relativePath}`);
				}
			});
			set((s) => ({ folders: s.folders.map((folder) => folder.id === folderId ? {
				...folder,
				photoCount,
				needsPermission: false
			} : folder) }));
			return photoCount;
		} catch {
			return 0;
		}
	},
	removeFolder: async (folderId) => {
		if (folderId === "demo") {
			get().setHideDemo(true);
			return;
		}
		const ids = get().videos.filter((v) => v.folderId === folderId).map((v) => v.id);
		forgetFolder(folderId, ids);
		set((s) => {
			const favorites = { ...s.favorites };
			const likes = { ...s.likes };
			const tags = { ...s.tags };
			const metadataProvenance = { ...s.metadataProvenance };
			const categories = { ...s.categories };
			const progress = { ...s.progress };
			for (const id of ids) {
				delete favorites[id];
				delete likes[id];
				delete tags[id];
				delete metadataProvenance[id];
				delete categories[id];
				delete progress[id];
			}
			return {
				folders: s.folders.filter((f) => f.id !== folderId),
				videos: s.videos.filter((v) => v.folderId !== folderId),
				favorites,
				likes,
				tags,
				metadataProvenance,
				categories,
				progress,
				history: s.history.filter((h) => !ids.includes(h.id)),
				sourceId: s.sourceId === folderId ? "home" : s.sourceId,
				activeId: s.activeId && ids.includes(s.activeId) ? null : s.activeId,
				previewId: s.previewId && ids.includes(s.previewId) ? null : s.previewId
			};
		});
		persistNow(get);
		try {
			await removeEnrichmentRows(ids).catch(() => void 0);
			await deleteDirHandle(folderId);
		} catch {}
	},
	followRemoteQuery: async (query, kind = "auto", opts) => {
		if (get().remoteBusy || get().refreshing) throw new Error("A catalog pull is already running.");
		const provider = kind === "twitch" || kind === "auto" && (query.toLowerCase().includes("twitch.tv") || query.toLowerCase().startsWith("tw:")) ? "twitch" : "youtube";
		if (provider === "youtube" && (get().youtubeRefreshStatus?.retryAt ?? 0) > Date.now()) throw new Error(youtubeCooldownMessage(get().youtubeRefreshStatus.retryAt));
		const clipsOnly = provider === "twitch" && Boolean(opts?.twitchClipMode);
		const action = clipsOnly ? opts?.twitchClipMode === "recent" ? "Twitch recent clips" : "Twitch older clips" : "Creator video pull";
		const startedAt = Date.now();
		const pullId = makePullId();
		get().beginPull({
			id: pullId,
			provider,
			action,
			startedAt,
			targets: [query],
			done: 0,
			total: 1,
			received: 0,
			added: 0,
			failed: 0
		});
		set({ remoteBusy: true });
		let requested = false;
		try {
			const counts = await remoteEntryCounts(get().videos);
			if (!remainingEntrySlots(counts, getPullSettings(), provider) && !canRotateForGroup(counts, getPullSettings(), provider)) throw new Error(ENTRY_LIMIT_MESSAGE);
			const correction = opts?.correctFollowId ? get().follows.find((channel) => channel.kind === "youtube" && channel.id === opts.correctFollowId) : void 0;
			const knownYoutube = !correction && get().follows.find((channel) => channel.kind === "youtube" && (channel.id === query || channel.channelId === query || canonicalFollowHandle("youtube", channel.handle) === canonicalFollowHandle("youtube", query)));
			const knownTwitch = provider === "twitch" ? get().follows.find((channel) => channel.kind === "twitch" && (channel.id === query || canonicalFollowHandle("twitch", channel.handle) === canonicalFollowHandle("twitch", query))) : void 0;
			if (clipsOnly && opts?.freshTwitchClips && knownTwitch) {
				const retryAt = (opts.twitchClipMode === "recent" ? knownTwitch.twitchClipRecentRetry : knownTwitch.twitchClipRetry)?.retryAt ?? 0;
				if (retryAt > Date.now()) throw new Error("Clip retry available after " + new Date(retryAt).toLocaleString());
			}
			requested = true;
			const fetched = await followRemote({ data: {
				query,
				kind,
				...opts?.freshTwitchClips ? { freshTwitchClips: true } : {},
				...opts?.twitchClipMode ? { twitchClipMode: opts.twitchClipMode } : {},
				...opts?.clipLimit !== void 0 ? { clipLimit: opts.clipLimit } : {},
				...opts?.twitchVodLimit ? { twitchVodLimit: opts.twitchVodLimit } : {},
				...knownYoutube && !opts?.restartPlaylist ? {
					catalogCursor: knownYoutube.catalogCursor,
					playlistWalk: knownYoutube.playlistWalk
				} : {},
				...knownTwitch?.twitchArchiveCursor ? { twitchArchiveCursor: knownTwitch.twitchArchiveCursor } : {},
				...knownTwitch?.twitchClipCursor ? { twitchClipCursor: knownTwitch.twitchClipCursor } : {}
			} });
			const result = correction ? bindYoutubeCorrection(fetched, correction, query) : fetched;
			const received = result.videos.length;
			if (clipsOnly && !received) {
				set((s) => {
					const previous = s.follows.find((c) => c.id === result.channel.id);
					if (knownTwitch && !previous) return { remoteBusy: false };
					const accepted = mergeTwitchClipObservation(previous, result.channel, opts.twitchClipMode, startedAt);
					return {
						remoteBusy: false,
						follows: dedupeFollows([accepted, ...s.follows.filter((c) => c.id !== accepted.id)])
					};
				});
				saveFollows(get().follows);
				const failure = result.channel.lastClipFailure?.message;
				get().finishPull({
					id: pullId,
					provider,
					action,
					startedAt,
					finishedAt: Date.now(),
					targets: [result.channel.title || query],
					done: 1,
					total: 1,
					received: 0,
					added: 0,
					failed: failure ? 1 : 0,
					status: failure ? "partial" : "success",
					...failure ? { errors: [failure] } : {}
				});
				return;
			}
			result.videos = await rotateRemotePull(get, result.videos, cleanupBudgets(getPullSettings()));
			let prepared = await prepareRemotePull(get, result.videos, void 0, true);
			while (get().videos !== prepared.base.videos || get().tags !== prepared.base.tags || get().metadataProvenance !== prepared.base.metadataProvenance || getPullSettings() !== prepared.admission.settings) prepared = await prepareRemotePull(get, result.videos, void 0, true);
			result.videos = prepared.admission.videos;
			result.channel = holdEntryLimitCursors(get().follows, [result.channel], prepared.admission.skippedSources)[0];
			set((s) => {
				const previous = s.follows.find((f) => f.id === result.channel.id);
				const acceptedChannel = clipsOnly ? mergeTwitchClipObservation(previous, result.channel, opts.twitchClipMode, startedAt) : {
					...previous,
					...previous ? retainNewerTwitchClipFollow(previous, result.channel) : result.channel,
					...result.channel.kind === "twitch" ? twitchRetryPatch(previous ?? {}, "archive", result.channel.lastProviderFailure) : {},
					twitchArchiveLastVideoId: result.channel.twitchArchiveLastVideoId ?? previous?.twitchArchiveLastVideoId
				};
				const follows = dedupeFollows([acceptedChannel, ...s.follows.filter((f) => f.id !== result.channel.id)]);
				const folder = {
					id: result.channel.id,
					name: result.channel.title,
					kind: result.channel.kind,
					videoCount: prepared.folderCounts.get(result.channel.id) ?? 0
				};
				const enriched = prepared.enriched;
				const merged = prepared.merged;
				rememberEntryCounts(merged, prepared.admission.counts);
				return {
					follows,
					folders: [...s.folders.filter((f) => f.id !== folder.id), folder],
					videos: merged,
					tags: enriched.tags,
					metadataProvenance: enriched.metadataProvenance
				};
			});
			await reconcilePlaylistCommit(get, set, [result.channel]);
			set({ remoteBusy: false });
			persistNow(get);
			if (!clipsOnly || prepared.merged !== prepared.base.videos) cacheRemotes(get, result.videos);
			const added = prepared.admission.added;
			const partialError = (clipsOnly ? result.channel.lastClipFailure : result.channel.lastProviderFailure)?.message;
			get().finishPull({
				id: pullId,
				provider,
				action,
				startedAt,
				finishedAt: Date.now(),
				targets: [result.channel.title || query],
				done: 1,
				total: 1,
				received,
				added,
				failed: 0,
				status: prepared.admission.skipped || partialError || !result.videos.length ? "partial" : "success",
				...prepared.admission.skipped || partialError ? { errors: [prepared.admission.skipped ? ENTRY_LIMIT_MESSAGE : partialError] } : {}
			});
		} catch (err) {
			set({ remoteBusy: false });
			const cancelled = err instanceof Error && /^Pull cancelled\b/i.test(err.message);
			if (provider === "twitch" && requested && !cancelled) {
				const message = (err instanceof Error ? err.message : String(err)).slice(0, 240);
				set((s) => ({ follows: s.follows.map((channel) => channel.kind === "twitch" && canonicalFollowHandle("twitch", channel.handle) === canonicalFollowHandle("twitch", query) ? clipsOnly ? mergeTwitchClipObservation(channel, {
					...channel,
					lastClipFailure: classifyTwitchFailure(err)
				}, opts.twitchClipMode, startedAt) : {
					...channel,
					...twitchRetryPatch(channel, "archive", classifyTwitchFailure(err)),
					twitchArchiveDiagnostics: {
						at: Date.now(),
						pages: 0,
						received: 0,
						accepted: 0,
						duplicates: 0,
						resumed: Boolean(channel.twitchArchiveCursor),
						stage: decodeTwitchArchiveCursor(channel.twitchArchiveCursor).stage,
						stopReason: /integrity|challenge/i.test(message) ? "challenge" : "provider-error",
						error: message
					}
				} : channel) }));
				saveFollows(get().follows);
			}
			get().finishPull({
				id: pullId,
				provider,
				action,
				startedAt,
				finishedAt: Date.now(),
				targets: [query],
				done: cancelled ? 0 : 1,
				total: 1,
				received: 0,
				added: 0,
				failed: cancelled ? 0 : 1,
				status: cancelled ? "partial" : "failed",
				errors: [err instanceof Error ? err.message : String(err)]
			});
			throw err;
		}
	},
	importBatch: async (items) => {
		if (get().remoteBusy || get().refreshing) throw new Error("A catalog pull is already running.");
		if (items.some((item) => item.kind === "youtube") && (get().youtubeRefreshStatus?.retryAt ?? 0) > Date.now()) throw new Error(youtubeCooldownMessage(get().youtubeRefreshStatus.retryAt));
		const savedHandles = new Set(["youtube", "twitch"].flatMap((kind) => [...resolvedFollowQueries(get().follows, kind)].map((key) => `${kind}:${key}`)));
		const seenQueries = /* @__PURE__ */ new Set();
		const unique = items.map((i) => ({
			query: i.query.trim().replaceAll("\\_", "_"),
			kind: i.kind
		})).filter((i) => {
			const handle = canonicalFollowHandle(i.kind, i.query);
			const key = `${i.kind}:${handle}`;
			if (!i.query || !handle || seenQueries.has(key) || savedHandles.has(key)) return false;
			seenQueries.add(key);
			return true;
		});
		if (!unique.length) return {
			ok: 0,
			failed: 0,
			failedQueries: [],
			failedReasons: {}
		};
		const queuedFollows = dedupeFollows([...get().follows, ...unique.map((item) => importedFollowStub(item.query, item.kind))]);
		set({ follows: queuedFollows });
		saveFollows(queuedFollows);
		const startedAt = Date.now();
		const pullId = makePullId();
		const cancellation = getPullCancellationRevision();
		get().beginPull({
			id: pullId,
			provider: unique.every((item) => item.kind === unique[0].kind) ? unique[0].kind : "multi",
			action: "Creator import",
			startedAt,
			targets: unique.map((item) => item.query),
			done: 0,
			total: unique.length,
			received: 0,
			added: 0,
			failed: 0
		});
		const existing = new Set(get().follows.map((f) => f.id));
		set({
			remoteBusy: true,
			importProgress: {
				done: 0,
				total: unique.length,
				label: "Importing"
			}
		});
		let ok = 0;
		let failed = 0;
		const failedQueries = [];
		const failedReasons = {};
		let pulledVideos = 0;
		let addedVideos = 0;
		let importRetryAt;
		const cleanupRemaining = cleanupBudgets(getPullSettings());
		const chunk = unique.some((item) => item.kind === "youtube") ? 1 : 20;
		try {
			for (let i = 0; i < unique.length; i += chunk) {
				if (getPullCancellationRevision() !== cancellation) break;
				const counts = await remoteEntryCounts(get().videos);
				const slice = unique.slice(i, i + chunk).filter((item) => {
					if (remainingEntrySlots(counts, getPullSettings(), item.kind) || canRotateForGroup(counts, getPullSettings(), item.kind, cleanupRemaining)) return true;
					failed++;
					failedQueries.push(item.query);
					failedReasons[item.query] = ENTRY_LIMIT_MESSAGE;
					return false;
				});
				if (!slice.length) continue;
				let result;
				try {
					result = await importChannels({ data: { items: slice } });
				} catch (error) {
					if (getPullCancellationRevision() !== cancellation) break;
					failed += slice.length;
					failedQueries.push(...slice.map((item) => item.query));
					const reason = error instanceof Error && error.message ? error.message : "Provider request failed before public metadata could be read";
					for (const item of slice) failedReasons[item.query] = reason;
					set({ importProgress: {
						done: Math.min(i + slice.length, unique.length),
						total: unique.length,
						label: "Retrying next batch"
					} });
					continue;
				}
				if (getPullCancellationRevision() !== cancellation) break;
				ok += result.ok.length;
				failed += result.failed;
				if (result.failedQueries?.length) {
					failedQueries.push(...result.failedQueries);
					for (const query of result.failedQueries) failedReasons[query] = result.failedReasons?.[query] ?? "Could not verify the creator.";
					const failures = new Map(slice.filter((item) => result.failedFailures?.[item.query]).map((item) => [`${item.kind}:${canonicalFollowHandle(item.kind, item.query)}`, result.failedFailures[item.query]]));
					set((s) => ({ follows: s.follows.map((channel) => {
						const failure = failures.get(`${channel.kind}:${canonicalFollowHandle(channel.kind, channel.handle)}`);
						return failure ? {
							...channel,
							lastProviderFailure: failure,
							lastCheckedAt: Date.now()
						} : channel;
					}) }));
				}
				if (!result.ok.length) {
					set({ importProgress: {
						done: Math.min(i + slice.length, unique.length),
						total: unique.length,
						label: "Verifying creators"
					} });
					get().updatePull({
						done: Math.min(i + slice.length, unique.length),
						received: pulledVideos,
						added: addedVideos,
						failed
					});
					persistSoon(get);
					if (result.providerRetryAt) {
						importRetryAt = result.providerRetryAt;
						const cooldown = {
							retryAt: importRetryAt,
							error: Object.values(result.failedReasons ?? {})[0] ?? youtubeCooldownMessage(importRetryAt),
							cooldownScope: result.providerCooldownScope === "all" ? "all" : "catalog"
						};
						saveYoutubeCooldown(cooldown);
						set((s) => ({ youtubeRefreshStatus: {
							...s.youtubeRefreshStatus ?? {
								at: Date.now(),
								checked: 0,
								refreshed: 0,
								failed: 0,
								youtube: 0,
								twitch: 0
							},
							...cooldown
						} }));
						break;
					}
					continue;
				}
				let incoming = result.ok.flatMap((row) => row.videos);
				incoming = await rotateRemotePull(get, incoming, cleanupRemaining);
				let prepared = await prepareRemotePull(get, incoming, void 0, true);
				while (get().videos !== prepared.base.videos || get().tags !== prepared.base.tags || get().metadataProvenance !== prepared.base.metadataProvenance || getPullSettings() !== prepared.admission.settings) prepared = await prepareRemotePull(get, incoming, void 0, true);
				if (getPullCancellationRevision() !== cancellation) break;
				pulledVideos += result.ok.reduce((sum, row) => sum + row.videos.length, 0);
				addedVideos += prepared.admission.added;
				const held = holdEntryLimitCursors(get().follows, result.ok.map((row) => ({
					...row.channel,
					importQuery: row.channel.importQuery ?? (slice.length === 1 ? slice[0].query : void 0)
				})), prepared.admission.skippedSources);
				result.ok = result.ok.map((row, index) => ({
					...row,
					channel: held[index]
				}));
				get().updatePull({
					done: Math.min(i + slice.length, unique.length),
					received: pulledVideos,
					added: addedVideos,
					failed
				});
				set((s) => {
					let follows = s.follows;
					let folders = s.folders;
					const videos = prepared.merged;
					rememberEntryCounts(videos, prepared.admission.counts);
					for (const row of result.ok) {
						follows = mergeResolvedFollow(follows, row.channel);
						const folder = {
							id: row.channel.id,
							name: row.channel.title,
							kind: row.channel.kind,
							videoCount: prepared.folderCounts.get(row.channel.id) ?? 0
						};
						folders = [...folders.filter((f) => f.id !== folder.id), folder];
					}
					const enriched = prepared.enriched;
					return {
						follows: dedupeFollows(follows),
						folders,
						videos,
						tags: enriched.tags,
						metadataProvenance: enriched.metadataProvenance,
						importProgress: {
							done: Math.min(i + slice.length, unique.length),
							total: unique.length,
							label: "Importing"
						}
					};
				});
				await reconcilePlaylistCommit(get, set, result.ok.map((row) => row.channel));
				persistSoon(get);
				cacheRemotes(get, prepared.admission.videos);
				if (result.providerRetryAt) {
					importRetryAt = result.providerRetryAt;
					const cooldown = {
						retryAt: importRetryAt,
						error: Object.values(result.failedReasons ?? {})[0] ?? youtubeCooldownMessage(importRetryAt),
						cooldownScope: result.providerCooldownScope === "all" ? "all" : "catalog"
					};
					saveYoutubeCooldown(cooldown);
					set((s) => ({ youtubeRefreshStatus: {
						...s.youtubeRefreshStatus ?? {
							at: Date.now(),
							checked: 0,
							refreshed: 0,
							failed: 0,
							youtube: 0,
							twitch: 0
						},
						...cooldown
					} }));
					break;
				}
			}
			persistNow(get);
			const added = get().follows.filter((f) => !existing.has(f.id)).length;
			if (getPullCancellationRevision() === cancellation) get().pushNotice({
				title: `Imported ${added || ok} channel${(added || ok) === 1 ? "" : "s"}`,
				body: importRetryAt ? `${ok + failed} of ${unique.length} checked. ${youtubeCooldownMessage(importRetryAt)}` : failed ? `${failed} need attention. Open the importer for the saved reason list.` : "Latest uploads are on the shelves.",
				kind: unique[0]?.kind === "twitch" ? "twitch" : "youtube"
			});
			set({
				remoteBusy: false,
				importProgress: null
			});
			get().finishPull({
				id: pullId,
				provider: unique.every((item) => item.kind === unique[0].kind) ? unique[0].kind : "multi",
				action: "Creator import",
				startedAt,
				finishedAt: Date.now(),
				targets: unique.map((item) => item.query),
				done: Math.min(unique.length, ok + failed),
				total: unique.length,
				received: pulledVideos,
				added: addedVideos,
				failed,
				status: importRetryAt || getPullCancellationRevision() !== cancellation ? "partial" : failed ? ok ? "partial" : "failed" : "success",
				...failedQueries.length ? { errors: failedQueries.slice(0, 12).map((query) => `${query}: ${failedReasons[query] ?? "Unavailable"}`) } : {}
			});
			persistNow(get);
			return {
				ok,
				failed,
				failedQueries,
				failedReasons
			};
		} catch (err) {
			set({
				remoteBusy: false,
				importProgress: null
			});
			get().finishPull({
				id: pullId,
				provider: unique.every((item) => item.kind === unique[0].kind) ? unique[0].kind : "multi",
				action: "Creator import",
				startedAt,
				finishedAt: Date.now(),
				targets: unique.map((item) => item.query),
				done: Math.min(failed + ok, unique.length),
				total: unique.length,
				received: pulledVideos,
				added: addedVideos,
				failed: Math.max(failed, unique.length - ok),
				status: ok ? "partial" : "failed",
				errors: [err instanceof Error ? err.message : String(err)]
			});
			throw err;
		}
	},
	unfollow: (id) => get().unfollowMany([id]),
	acknowledgeYoutubeIdentity: (id, fingerprint) => {
		const review = youtubeIdentityReviews(get().follows).get(id);
		if (!review || review.reviewed || review.fingerprint !== fingerprint) return;
		set((s) => ({ follows: s.follows.map((row) => row.id === id ? {
			...row,
			identityReview: {
				fingerprint,
				at: Date.now()
			}
		} : row) }));
		saveFollows(get().follows);
		persistSoon(get);
	},
	setTwitchPullPolicy: (id, raw) => {
		const policy = normalizeTwitchPullPolicy(raw), current = get().follows.find((c) => c.id === id && c.kind === "twitch");
		if (!policy || !current) return;
		const old = twitchPullPolicy(current);
		if (old.clips === policy.clips && old.vods === policy.vods && old.priority === policy.priority) return;
		set((s) => ({ follows: s.follows.map((c) => c.id === id ? {
			...c,
			twitchPullPolicy: policy
		} : c) }));
		saveFollows(get().follows);
		persistSoon(get);
	},
	updateFollowProfiles: (profiles) => {
		const byId = new Map(profiles.filter((profile) => profile.thumb || profile.description).map((profile) => [profile.id, profile]));
		if (!byId.size) return;
		set((s) => ({ follows: s.follows.map((follow) => {
			const profile = byId.get(follow.id);
			return profile ? {
				...follow,
				thumb: profile.thumb || follow.thumb,
				description: profile.description || follow.description
			} : follow;
		}) }));
		saveFollows(get().follows);
		persistSoon(get);
	},
	unfollowMany: (ids) => {
		const plan = planFollowRemoval(get(), ids, exportFeedback());
		if (!plan.followIds.size) return;
		set((s) => ({
			follows: s.follows.filter((f) => !plan.followIds.has(f.id)),
			folders: s.folders.filter((f) => !plan.followIds.has(f.id)),
			videos: retainVideosAfterUnfollow(s.videos, plan),
			sourceId: plan.followIds.has(s.sourceId) ? "home" : s.sourceId
		}));
		persistNow(get);
		cacheRemotes(get);
	},
	retainLiveRoom: async (video) => {
		if (!get().adultsUnlocked || !["chaturbate", "myfreecams"].includes(video.remote?.kind ?? "") || !video.remote?.live) return false;
		if ((await remoteVideoIndexAsync(get().videos)).has(video.id)) return true;
		const prepared = await prepareRemotePull(get, [video], void 0, true);
		if (!prepared.admission.videos.length) return false;
		const folder = ADULT_FOLDER_BY_PROVIDER[video.remote.kind];
		set({
			videos: prepared.merged,
			tags: prepared.enriched.tags,
			metadataProvenance: prepared.enriched.metadataProvenance,
			folders: [...prepared.base.folders.filter((row) => row.id !== folder.id), {
				...folder,
				videoCount: prepared.folderCounts.get(folder.id) ?? 1
			}]
		});
		await appendCatalogVideos(prepared.admission.videos.map(catalogCard), prepared.enriched);
		persistNow(get);
		return true;
	},
	refreshFollows: async (kind, options) => {
		const liveOnly = Boolean(options?.youtubeLiveOnly || options?.twitchLiveOnly);
		const feedRepair = kind === "youtube" && options?.youtubeFeedRepair === true;
		const recentQueue = !liveOnly && !options?.catalog && !options?.twitchContinueArchive && !feedRepair;
		if (!liveOnly && options?.scheduled && !automaticPullAvailable(kind)) return {
			wentLive: [],
			newVideos: [],
			skipped: "busy"
		};
		if (liveOnly && options?.scheduled && !options.liveDemand && pullsPaused()) return {
			wentLive: [],
			newVideos: [],
			skipped: "paused"
		};
		const liveRetryAt = kind === "twitch" && options?.twitchLiveOnly ? get().twitchLiveProgress?.retryAt : options?.youtubeLiveOnly ? Math.max(get().youtubeLiveProgress?.retryAt ?? 0, youtubeLiveCooldown(get().follows)?.retryAt ?? 0) || void 0 : void 0;
		if (liveOnly && kind && liveRetryAt && liveRetryAt > Date.now()) return {
			wentLive: [],
			newVideos: [],
			skipped: "cooldown",
			retryAt: liveRetryAt
		};
		const forceYoutube = kind === "youtube" && options?.catalog === true && options.force === true && !options.scheduled && !options.youtubeLiveOnly && !options.twitchRoutine;
		let forceNextRequest = forceYoutube;
		let recoveredCooldown = false;
		const holdYoutube = () => !forceYoutube && (get().youtubeRefreshStatus?.retryAt ?? 0) > Date.now() && (get().youtubeRefreshStatus?.cooldownScope === "all" || !get().youtubeRefreshStatus?.cooldownScope || options?.catalog === true || feedRepair);
		if (kind === "youtube" && holdYoutube()) return {
			wentLive: [],
			newVideos: [],
			skipped: "cooldown",
			retryAt: get().youtubeRefreshStatus.retryAt
		};
		if (!liveOnly) await waitForPulls();
		if (kind === "youtube" && holdYoutube()) return {
			wentLive: [],
			newVideos: [],
			skipped: "cooldown",
			retryAt: get().youtubeRefreshStatus.retryAt
		};
		const twitchLiveOnly = Boolean(options?.twitchLiveOnly);
		const backgroundTwitchRefresh = Boolean(options?.twitchRoutine && kind === "twitch");
		const overlappingLive = Boolean(liveOnly && (get().refreshing || get().remoteBusy));
		if (get().refreshing && !overlappingLive || !liveOnly && get().remoteBusy || options?.youtubeLiveOnly && youtubeLiveCheckBusy || twitchLiveOnly && twitchLiveCheckBusy) return {
			wentLive: [],
			newVideos: [],
			skipped: "busy"
		};
		const applyTwitchPolicy = options?.scheduled === true && !liveOnly && !options.channelIds?.length;
		const allFollows = dedupeFollows(get().follows).filter((follow) => (!kind || follow.kind === kind) && !(follow.kind === "youtube" && (holdYoutube() || Boolean(liveRetryAt && liveRetryAt > Date.now()))) && !(applyTwitchPolicy && !twitchPolicyAllows(follow, options?.twitchContinueArchive ? "archive" : "recent")) && !(options?.twitchContinueArchive && follow.kind === "twitch" && follow.twitchArchiveExhaustedAt) && !(recentQueue && !recentPullReady(follow)) && !(follow.kind === "twitch" && !recentQueue && (follow[twitchLiveOnly ? "twitchLiveRetry" : "twitchArchiveRetry"]?.retryAt ?? 0) > Date.now()));
		if (!allFollows.length) return {
			wentLive: [],
			newVideos: [],
			skipped: "empty"
		};
		const rotate = (items, limit, cursor) => {
			if (!items.length) return [];
			if (cursor === "twitch") {
				if (applyTwitchPolicy) {
					const selected = selectTwitchPolicyBatch(items, limit, twitchPolicyCursor, options?.twitchContinueArchive ? "archive" : "recent");
					twitchPolicyCursor = selected.nextCursor;
					return selected.channels;
				}
				const batch = selectTwitchRefreshBatch(items, limit, twitchRefreshCursor, twitchLiveOnly ? "live" : recentQueue ? "recent" : "archive");
				twitchRefreshCursor = batch.nextCursor;
				return batch.channels;
			}
			const savedCursor = cursor === "youtube" ? youtubeRefreshCursor : remoteRefreshCursor;
			const count = Math.min(limit, items.length);
			const start = savedCursor % items.length;
			const next = Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
			const updated = (start + count) % items.length;
			if (cursor === "youtube") youtubeRefreshCursor = updated;
			else remoteRefreshCursor = updated;
			return next;
		};
		const twitch = allFollows.filter((follow) => follow.kind === "twitch");
		const youtube = allFollows.filter((follow) => follow.kind === "youtube");
		const youtubeCoverage = kind === "youtube" && !options?.youtubeLiveOnly ? youtubeCoverageCounts(await youtubeCoverageIndexAsync(get().videos), youtube) : void 0;
		if (get().refreshing && !overlappingLive || !liveOnly && get().remoteBusy) return {
			wentLive: [],
			newVideos: [],
			skipped: "busy"
		};
		const requestedIds = options?.channelIds?.length ? new Set(options.channelIds) : null;
		const current = liveOnly && !requestedIds ? kind === "youtube" && options?.youtubeLiveOnly ? selectYoutubeQuickLiveChannels(allFollows, options.liveSweep ? options.scheduled ? YOUTUBE_QUICK_LIVE.activeSweep : allFollows.length : options.scheduled ? YOUTUBE_QUICK_LIVE.quietSweep : LIBRARY_LIMITS.youtubeLiveRefreshChannels, options.scheduled) : kind === "twitch" && options?.twitchLiveOnly ? selectTwitchQuickLiveChannels(allFollows, options.liveSweep ? options.scheduled ? TWITCH_QUICK_LIVE.activeSweep : allFollows.length : TWITCH_QUICK_LIVE.quietSweep, options.scheduled) : selectLiveRefreshChannels(allFollows, kind, options?.liveSweep ? options.scheduled ? Math.min(240, allFollows.length) : allFollows.length : kind === "twitch" ? 24 : LIBRARY_LIMITS.youtubeLiveRefreshChannels) : requestedIds ? kind === "youtube" && options?.catalog ? selectYoutubeSweepChannels(allFollows.filter((follow) => requestedIds.has(follow.id)), Date.now(), getPullSettings().youtubeSourcesPerSweep, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, {
			includeExhausted: true,
			includePlaylists: true,
			videoCounts: youtubeCoverage
		}) : allFollows.filter((follow) => requestedIds.has(follow.id)) : kind === "youtube" && options?.youtubeLiveOnly ? selectYoutubeLiveChannels(youtube, LIBRARY_LIMITS.youtubeLiveRefreshChannels, true) : kind === "youtube" && options?.catalog && options.scheduled ? selectYoutubeSweepChannels(youtube, Date.now(), scheduledYoutubeSources(getPullSettings().youtubeSourcesPerSweep, getPullSettings().requestGapMs), LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, {
			includePlaylists: true,
			videoCounts: youtubeCoverage
		}) : kind === "youtube" && options?.catalog ? selectYoutubeSweepChannels(youtube, Date.now(), getPullSettings().youtubeSourcesPerSweep, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, {
			includeExhausted: true,
			includePlaylists: true,
			videoCounts: youtubeCoverage
		}) : kind === "youtube" ? selectYoutubeFeedChannels(youtube, youtubeCoverage, Date.now(), LIBRARY_LIMITS.youtubeRecentRefreshChannels) : kind === "twitch" ? rotate(twitch, options?.scheduled ? LIBRARY_LIMITS.twitchChannelsReservedPerRefresh : LIBRARY_LIMITS.twitchArchiveChannelsPerSweep, "twitch") : twitch.length && youtube.length ? [...rotate(twitch, Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "twitch"), ...rotate(youtube, REMOTE_REFRESH_BATCH_SIZE - Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "youtube")] : rotate(allFollows, REMOTE_REFRESH_BATCH_SIZE, kind === "twitch" ? "twitch" : "all");
		if (!current.length) return {
			wentLive: [],
			newVideos: [],
			skipped: "empty"
		};
		if (options?.youtubeLiveOnly) youtubeLiveCheckBusy = true;
		if (twitchLiveOnly) twitchLiveCheckBusy = true;
		if (!overlappingLive) set({ refreshing: true });
		const startedAt = Date.now();
		const pullId = makePullId();
		const provider = kind ?? (current.some((channel) => channel.kind === "youtube") && current.some((channel) => channel.kind === "twitch") ? "multi" : current[0].kind);
		const action = feedRepair ? "YouTube feed gap repair" : liveOnly && !kind ? "Twitch & YouTube live check" : options?.youtubeLiveOnly ? "YouTube live check" : twitchLiveOnly ? "Twitch live check" : backgroundTwitchRefresh ? options?.scheduled ? "Scheduled Twitch content pull" : "Twitch content pull" : options?.scheduled ? "Scheduled YouTube archive sweep" : options?.catalog ? "YouTube archive pull" : "Channel refresh";
		if (!overlappingLive) get().beginPull({
			id: pullId,
			provider,
			action,
			startedAt,
			targets: current.map((channel) => channel.title || channel.handle),
			done: 0,
			total: current.length,
			received: 0,
			added: 0,
			failed: 0
		});
		const noticesBeforeRefresh = get().notices;
		const beforeLiveChannels = new Set(get().follows.filter((channel) => channel.live).map((channel) => channel.id));
		const catalogQueue = kind === "youtube" && options?.catalog === true;
		let received = 0;
		let added = 0;
		let refreshed = 0;
		let checked = 0;
		let youtubeReceived = 0, twitchReceived = 0;
		let liveRetry, liveError;
		let youtubeChecked = 0, twitchChecked = 0, youtubeRefreshed = 0, twitchRefreshed = 0;
		let twitchRetry, twitchError;
		let lastFollowCheckpoint = 0;
		const cleanupRemaining = cleanupBudgets(getPullSettings());
		const errors = [];
		const wentLive = [];
		const newVideos = [];
		let catalogIndexedVideos = null;
		const catalogPositions = catalogQueue ? /* @__PURE__ */ new Map() : null;
		const catalogFolderCounts = catalogQueue ? /* @__PURE__ */ new Map() : null;
		let liveSourceSnapshot = null;
		const liveSources = /* @__PURE__ */ new Set();
		const livePositions = /* @__PURE__ */ new Map();
		const liveSourceVideos = /* @__PURE__ */ new Map();
		const syncLiveSources = async () => {
			while (get().videos !== liveSourceSnapshot) {
				const snapshot = get().videos;
				liveSources.clear();
				livePositions.clear();
				liveSourceVideos.clear();
				await forEachCatalogSlice(snapshot, (video, index) => {
					if ((video.remote?.kind === "youtube" || video.remote?.kind === "twitch") && video.remote.live) {
						liveSources.add(video.folderId);
						for (const id of video.remote.sourceIds ?? []) liveSources.add(id);
						livePositions.set(video.id, index);
						for (const source of [
							video.folderId,
							...video.remote.sourceIds ?? [],
							...video.remote.kind === "youtube" && video.remote.channelId ? ["yt:" + video.remote.channelId] : []
						]) {
							liveSources.add(source);
							const ids = liveSourceVideos.get(source) ?? /* @__PURE__ */ new Set();
							ids.add(video.id);
							liveSourceVideos.set(source, ids);
						}
					}
				}, yieldCatalogTask);
				liveSourceSnapshot = snapshot;
			}
		};
		const mergeFollowResults = (existing, incoming) => {
			const latest = new Map(existing.map((channel) => [channel.id, channel]));
			if (incoming.every((channel) => latest.get(channel.id) === channel)) return existing;
			return dedupeFollows([...incoming.map((channel) => {
				const newer = latest.get(channel.id);
				if (newer) channel = retainNewerTwitchClipFollow(newer, channel);
				if (newer && (liveOnly || (newer.recentPull?.attemptedAt ?? 0) > (channel.recentPull?.attemptedAt ?? 0))) channel = {
					...channel,
					recentPull: newer.recentPull
				};
				if (newer && liveOnly) channel = {
					...channel,
					playlistWalk: newer.playlistWalk,
					catalogCursor: newer.catalogCursor,
					catalogCheckedAt: newer.catalogCheckedAt,
					catalogExhaustedAt: newer.catalogExhaustedAt,
					twitchArchiveCursor: newer.twitchArchiveCursor,
					twitchArchiveCheckedAt: newer.twitchArchiveCheckedAt,
					twitchArchiveExhaustedAt: newer.twitchArchiveExhaustedAt,
					twitchArchiveDiagnostics: newer.twitchArchiveDiagnostics,
					twitchArchiveRetry: newer.twitchArchiveRetry,
					lastProviderFailure: newer.lastProviderFailure
				};
				return newer && Math.max(newer.liveCheckedAt ?? 0, newer.lastLiveFailure?.at ?? 0, newer.youtubeLiveEvidence?.at ?? 0) > Math.max(channel.liveCheckedAt ?? 0, channel.lastLiveFailure?.at ?? 0, channel.youtubeLiveEvidence?.at ?? 0) ? {
					...channel,
					live: newer.live,
					liveCheckedAt: newer.liveCheckedAt,
					lastLiveFailure: newer.lastLiveFailure,
					lastLiveWarning: newer.lastLiveWarning,
					youtubeLiveEvidence: newer.youtubeLiveEvidence,
					youtubeLiveVideoIds: newer.youtubeLiveVideoIds,
					youtubeLiveKnownOverflow: newer.youtubeLiveKnownOverflow,
					youtubeEvents: newer.youtubeEvents,
					liveOfflineSince: newer.liveOfflineSince,
					twitchLiveRetry: newer.twitchLiveRetry
				} : channel;
			}), ...existing]);
		};
		const youtubeThroughput = options?.youtubeLiveOnly ? createYoutubeLiveThroughput(get().follows.filter((c) => c.kind === "youtube").map((c) => c.id), startedAt) : null;
		let liveAllocation;
		const reportLiveAllocation = (value) => {
			liveAllocation = value;
		};
		let yieldedLiveTurn = false;
		const liveProgress = (status = "running") => {
			if (!liveOnly) return;
			const common = {
				startedAt,
				at: Date.now(),
				status,
				automatic: options?.scheduled === true
			};
			set({
				...options?.youtubeLiveOnly ? { youtubeLiveProgress: {
					...common,
					checked: youtubeChecked,
					total: yieldedLiveTurn ? youtubeChecked : current.filter((row) => row.kind === "youtube").length,
					refreshed: youtubeRefreshed,
					failed: youtubeChecked - youtubeRefreshed,
					broadcasts: youtubeReceived,
					throughput: youtubeThroughput?.snapshot(),
					allocation: liveAllocation,
					retryAt: liveRetry,
					error: liveError
				} } : {},
				...twitchLiveOnly ? { twitchLiveProgress: {
					...common,
					checked: twitchChecked,
					total: yieldedLiveTurn ? twitchChecked : current.filter((row) => row.kind === "twitch").length,
					refreshed: twitchRefreshed,
					failed: twitchChecked - twitchRefreshed,
					broadcasts: twitchReceived,
					retryAt: twitchRetry,
					error: twitchError
				} } : {}
			});
		};
		const recordLiveBatch = (batch, ids = []) => {
			if (!liveOnly) return;
			const refreshedIds = new Set(ids);
			youtubeThroughput?.record(batch.filter((c) => c.kind === "youtube").map((c) => c.id), ids, Date.now());
			for (const channel of batch) if (channel.kind === "youtube") {
				youtubeChecked++;
				if (refreshedIds.has(channel.id)) youtubeRefreshed++;
			} else {
				twitchChecked++;
				if (refreshedIds.has(channel.id)) twitchRefreshed++;
			}
		};
		const checkpointFollows = () => {
			if (checked - lastFollowCheckpoint >= (recentQueue ? 4 : 96)) {
				saveFollows(get().follows);
				lastFollowCheckpoint = checked;
			}
		};
		liveProgress();
		const cancellation = getPullCancellationRevision();
		const waitForCatalogTurn = async () => {
			await yieldCatalogTask();
			await waitForCatalogCommit(cancellation);
		};
		const syncCatalogIndex = async () => {
			if (!catalogPositions || !catalogFolderCounts) return;
			while (get().videos !== catalogIndexedVideos) {
				const snapshot = get().videos;
				catalogPositions.clear();
				catalogFolderCounts.clear();
				await forEachCatalogSlice(snapshot, (video, index) => {
					catalogPositions.set(video.id, index);
					youtubeVideoKey(video);
					for (const alias of catalogIdentityKeys(video)) if (!catalogPositions.has(alias)) catalogPositions.set(alias, index);
					catalogFolderCounts.set(video.folderId, (catalogFolderCounts.get(video.folderId) ?? 0) + 1);
				}, waitForCatalogTurn);
				catalogIndexedVideos = snapshot;
			}
		};
		const adaptiveLive = liveOnly && options?.scheduled && !requestedIds && Boolean(kind);
		const attemptedLive = /* @__PURE__ */ new Set();
		const selectAdaptiveLive = (count) => kind === "youtube" ? selectYoutubeQuickLiveChannels(get().follows, count, true, Date.now(), reportLiveAllocation, attemptedLive) : selectTwitchQuickLiveChannels(get().follows.filter((channel) => !attemptedLive.has(channel.id)), count, true);
		const liveMetadataBase = liveOnly || recentQueue ? {
			tags: get().tags,
			provenance: get().metadataProvenance
		} : null;
		let dispatchedLive = 0;
		const livePipeline = kind && liveOnly ? createCompletionQueue({
			concurrency: kind === "youtube" ? YOUTUBE_QUICK_LIVE.pipelineRequests : 2,
			take: () => {
				if (dispatchedLive >= current.length || getPullCancellationRevision() !== cancellation || liveRetry && liveRetry > Date.now() || twitchRetry && twitchRetry > Date.now()) return;
				if (adaptiveLive && dispatchedLive > 0 && (Date.now() - startedAt >= 2e4 || !options?.liveDemand && pullsPaused())) {
					yieldedLiveTurn = true;
					return;
				}
				const count = Math.min(kind === "youtube" ? YOUTUBE_QUICK_LIVE.pipelineChannels : 12, current.length - dispatchedLive);
				const channels = adaptiveLive ? selectAdaptiveLive(count) : current.slice(dispatchedLive, dispatchedLive + count);
				if (!channels.length) {
					yieldedLiveTurn = Boolean(adaptiveLive);
					return;
				}
				for (const channel of channels) attemptedLive.add(channel.id);
				dispatchedLive += channels.length;
				return {
					channels,
					attemptAt: Date.now()
				};
			},
			request: async (item, signal) => {
				const response = await refreshRemotes({
					data: {
						channels: item.channels,
						youtubeLiveOnly: kind === "youtube",
						twitchLiveOnly: kind === "twitch",
						youtubeBackground: options?.scheduled === true,
						liveDemand: options?.liveDemand === true
					},
					signal
				});
				if (response.providerRetryAt) {
					liveRetry = Math.max(liveRetry ?? 0, response.providerRetryAt);
					liveError = response.channels.find((channel) => channel.lastLiveFailure)?.lastLiveFailure?.message;
				}
				if (kind === "twitch" && response.channels.length && response.channels.every((c) => c.lastLiveFailure?.kind === "rate-limited")) {
					twitchRetry = Math.max(...response.channels.map((c) => c.twitchLiveRetry?.retryAt ?? Date.now() + 6e4));
					twitchError = response.channels[0].lastLiveFailure?.message;
				}
				return response;
			}
		}) : null;
		const recentBatchSize = current.length <= 4 ? 2 : 4;
		let dispatchedRecent = 0, recentRetryAt = 0;
		const recentPipeline = recentQueue && kind ? createCompletionQueue({
			concurrency: 2,
			take: () => {
				if (dispatchedRecent >= current.length || getPullCancellationRevision() !== cancellation || recentRetryAt > Date.now()) return;
				if (options?.scheduled && (!automaticPullAvailable(kind) || Date.now() - startedAt >= 2e4)) {
					yieldedLiveTurn = true;
					return;
				}
				const channels = current.slice(dispatchedRecent, dispatchedRecent + recentBatchSize);
				dispatchedRecent += channels.length;
				return {
					channels,
					attemptAt: Date.now()
				};
			},
			request: async (item, signal) => {
				const response = await refreshRemotes({
					data: {
						channels: item.channels,
						youtubeBackground: options?.scheduled === true,
						twitchRoutine: kind === "twitch",
						twitchApplyPolicy: applyTwitchPolicy
					},
					signal
				});
				if (response.providerRetryAt) recentRetryAt = Math.max(recentRetryAt, response.providerRetryAt);
				return response;
			}
		}) : null;
		try {
			const maxBatch = kind === "twitch" && !liveOnly ? LIBRARY_LIMITS.twitchArchiveSourcesPerRequest : adaptiveLive && kind === "youtube" ? YOUTUBE_QUICK_LIVE.scheduledRequestChannels : catalogQueue ? LIBRARY_LIMITS.youtubeCatalogSourcesPerRequest : options?.youtubeLiveOnly && kind === "youtube" ? YOUTUBE_QUICK_LIVE.requestChannels : twitchLiveOnly && kind === "twitch" ? TWITCH_QUICK_LIVE.requestChannels : liveOnly ? 12 : current.length;
			for (let offset = 0, batchSize = maxBatch; offset < current.length; offset += batchSize) {
				batchSize = offset === 0 && current.length > maxBatch ? kind === "youtube" && options?.youtubeLiveOnly ? YOUTUBE_QUICK_LIVE.firstRequestChannels : kind === "twitch" && twitchLiveOnly ? TWITCH_QUICK_LIVE.firstRequestChannels : maxBatch : maxBatch;
				if (getPullCancellationRevision() !== cancellation) break;
				if (!liveOnly && !recentPipeline && options?.scheduled && !automaticPullAvailable(kind)) {
					yieldedLiveTurn = true;
					break;
				}
				if (!livePipeline && adaptiveLive && offset > 0 && (Date.now() - startedAt >= 2e4 || !options?.liveDemand && pullsPaused())) {
					yieldedLiveTurn = true;
					break;
				}
				if (catalogQueue) {
					const counts = await remoteEntryCounts(get().videos);
					if (!remainingEntrySlots(counts, getPullSettings(), "youtube") && !canRotateForGroup(counts, getPullSettings(), "youtube", cleanupRemaining)) {
						errors.push(ENTRY_LIMIT_MESSAGE);
						break;
					}
				}
				let completedResponse = livePipeline ? await livePipeline.next() : recentPipeline ? await recentPipeline.next() : void 0;
				if ((livePipeline || recentPipeline) && !completedResponse) break;
				if ((livePipeline || recentPipeline) && completedResponse?.ok) for (;;) {
					const ready = (livePipeline ?? recentPipeline).takeReady((result) => result.ok);
					if (!ready?.ok) break;
					completedResponse = {
						ok: true,
						item: {
							channels: [...completedResponse.item.channels, ...ready.item.channels],
							attemptAt: Math.min(completedResponse.item.attemptAt, ready.item.attemptAt)
						},
						value: mergeYoutubeLiveResults(completedResponse.value, ready.value)
					};
				}
				const selectedBatch = completedResponse ? completedResponse.item.channels : adaptiveLive ? selectAdaptiveLive(Math.min(batchSize, current.length - offset)) : current.slice(offset, offset + batchSize);
				if (!selectedBatch.length) {
					yieldedLiveTurn = Boolean(adaptiveLive);
					break;
				}
				batchSize = selectedBatch.length;
				for (const channel of selectedBatch) attemptedLive.add(channel.id);
				const batch = selectedBatch.map((channel) => youtubeCoverage && !(youtubeCoverage.get(channel.id) ?? 0) ? {
					...channel,
					catalogCursor: void 0,
					catalogExhaustedAt: void 0,
					newestVideoId: void 0
				} : channel);
				if (catalogQueue) await waitForCatalogTurn();
				if (!liveOnly) await waitForPulls();
				await syncCatalogIndex();
				let result;
				const attemptAt = completedResponse?.item.attemptAt ?? Date.now();
				try {
					const forceYoutubeRequest = forceNextRequest;
					forceNextRequest = false;
					if (completedResponse) {
						if (!completedResponse.ok) throw completedResponse.error;
						result = completedResponse.value;
					} else result = await refreshRemotes({ data: {
						youtubeFeedRepair: feedRepair,
						forceYoutube: forceYoutubeRequest,
						youtubeVideoLimit: getPullSettings().youtubeBatchVideos,
						channels: batch,
						youtubeCatalog: catalogQueue,
						youtubeBackground: options?.scheduled === true,
						liveDemand: options?.liveDemand === true,
						youtubeLiveOnly: options?.youtubeLiveOnly === true,
						twitchLiveOnly: options?.twitchLiveOnly === true,
						twitchRoutine: options?.twitchRoutine === true,
						twitchContinueArchive: options?.twitchContinueArchive === true,
						twitchApplyPolicy: applyTwitchPolicy
					} });
				} catch (error) {
					if (getPullCancellationRevision() !== cancellation) break;
					if (error instanceof Error && error.name === "PullPriorityDeferredError") {
						yieldedLiveTurn = true;
						break;
					}
					errors.push(`${batch.map((channel) => channel.title).join(", ")}: ${error instanceof Error ? error.message : String(error)}`);
					if (recentQueue) {
						const attemptedIds = new Set(batch.map((channel) => channel.id));
						set((state) => ({ follows: state.follows.map((channel) => attemptedIds.has(channel.id) && (channel.recentPull?.attemptedAt ?? 0) <= attemptAt ? {
							...channel,
							recentPull: recentPullFailure(channel, channel.kind === "twitch" ? classifyTwitchFailure(error) : {
								kind: "network-offline",
								at: Date.now(),
								message: error instanceof Error ? error.message.slice(0, 240) : "Recent upload check failed.",
								recovery: "Retry this creator after its wait."
							})
						} : channel) }));
					}
					if (liveOnly) {
						const attemptedIds = new Set(batch.map((channel) => channel.id));
						set((state) => ({ follows: state.follows.map((channel) => {
							if (!attemptedIds.has(channel.id) || (channel.liveCheckedAt ?? 0) > attemptAt) return channel;
							if (channel.kind === "twitch") return {
								...channel,
								...twitchRetryPatch(channel, "live", classifyTwitchFailure(error))
							};
							return {
								...channel,
								lastLiveFailure: youtubeLiveFailure(channel, {
									kind: "network-offline",
									at: Date.now(),
									message: error instanceof Error ? error.message.slice(0, 240) : "Live check failed.",
									recovery: ""
								})
							};
						}) }));
					}
					checked += batch.length;
					recordLiveBatch(batch);
					liveProgress();
					if (!overlappingLive) get().updatePull({
						done: Math.min(current.length, offset + batch.length),
						received,
						added,
						failed: Math.min(current.length, offset + batch.length) - refreshed
					});
					continue;
				}
				if (catalogQueue) {
					await waitForCatalogTurn();
					await waitForPulls();
				}
				await syncCatalogIndex();
				if (getPullCancellationRevision() !== cancellation) break;
				if (options?.youtubeLiveOnly && result.providerRetryAt) {
					liveRetry = Math.max(liveRetry ?? 0, result.providerRetryAt);
					liveError = result.channels.find((channel) => channel.lastLiveFailure)?.lastLiveFailure?.message;
				}
				if (options?.youtubeLiveOnly) {
					await syncLiveSources();
					const previous = new Map(get().follows.map((channel) => [channel.id, channel]));
					const checkedIds = new Set(result.liveCheckedIds ?? result.refreshedIds);
					const successfulIds = new Set(result.refreshedIds);
					result.channels = result.channels.map((channel) => {
						const savedIds = [...liveSourceVideos.get(channel.id) ?? []].map((id) => get().videos[livePositions.get(id)]?.remote?.videoId).filter((id) => Boolean(id));
						const observedIds = result.videos.filter((v) => v.folderId === channel.id && v.remote?.live).map((v) => v.remote.videoId).filter((id) => Boolean(id));
						const reconciled = reconcileYoutubeKnownBroadcasts(channel, batch.find((c) => c.id === channel.id), savedIds, observedIds, checkedIds.has(channel.id));
						if (!reconciled.checked) checkedIds.delete(channel.id);
						if (!reconciled.success) successfulIds.delete(channel.id);
						return retainYoutubeLiveFollow(previous.get(channel.id), reconciled.channel, reconciled.checked);
					});
					result.liveCheckedIds = [...checkedIds];
					result.refreshedIds = [...successfulIds];
				}
				if (recentQueue || feedRepair) {
					const previous = new Map(get().follows.map((channel) => [channel.id, channel]));
					const successes = new Set(result.refreshedIds);
					result.channels = result.channels.map((channel) => {
						const old = previous.get(channel.id);
						if (!old) return channel;
						const state = channel.recentPull && channel.recentPull.attemptedAt !== old.recentPull?.attemptedAt ? channel.recentPull : successes.has(channel.id) ? recentPullSuccess(old, channel) : recentPullFailure(old, channel.lastProviderFailure ?? {
							kind: "network-offline",
							at: attemptAt,
							message: "Recent upload check did not complete.",
							recovery: "Retry this creator after its wait."
						});
						return {
							...channel,
							recentPull: state,
							catalogCursor: old.catalogCursor,
							catalogCheckedAt: old.catalogCheckedAt,
							catalogExhaustedAt: old.catalogExhaustedAt,
							twitchArchiveCursor: old.twitchArchiveCursor,
							twitchArchiveCheckedAt: old.twitchArchiveCheckedAt,
							twitchArchiveExhaustedAt: old.twitchArchiveExhaustedAt,
							twitchArchiveDiagnostics: old.twitchArchiveDiagnostics,
							twitchArchiveRetry: old.twitchArchiveRetry,
							lastProviderFailure: old.lastProviderFailure
						};
					});
				}
				const stillFollowed = new Set(get().follows.map((channel) => channel.id));
				result.channels = result.channels.filter((channel) => stillFollowed.has(channel.id));
				result.videos = result.videos.filter((video) => stillFollowed.has(video.folderId));
				result.refreshedIds = result.refreshedIds.filter((id) => stillFollowed.has(id));
				const providerReceived = result.videos.length;
				checked += batch.length;
				recordLiveBatch(batch, result.refreshedIds);
				if (options?.youtubeLiveOnly) {
					youtubeReceived += result.videos.filter((video) => video.remote?.kind === "youtube").length;
					set((state) => ({ follows: mergeFollowResults(state.follows, result.channels) }));
					liveProgress();
					checkpointFollows();
				}
				if (twitchLiveOnly && kind === "twitch") {
					twitchReceived += result.videos.filter((v) => v.remote?.kind === "twitch" && v.remote.live).length;
					set((state) => ({ follows: mergeFollowResults(state.follows, result.channels) }));
					liveProgress();
					checkpointFollows();
				}
				if (twitchLiveOnly && kind === "twitch" && result.channels.length && result.channels.every((channel) => channel.lastLiveFailure?.kind === "rate-limited")) {
					twitchRetry = Math.max(...result.channels.map((channel) => channel.twitchLiveRetry?.retryAt ?? Date.now() + 6e4));
					twitchError = result.channels[0].lastLiveFailure?.message;
				}
				if ((liveOnly || recentQueue) && !result.videos.length) {
					await syncLiveSources();
					if (getPullCancellationRevision() !== cancellation) break;
					if (!batch.some((channel) => liveSources.has(channel.id))) {
						refreshed += result.refreshedIds.length;
						for (const channel of result.channels) {
							const failure = recentQueue ? channel.recentPull?.failure : channel.lastLiveFailure;
							if (failure && errors.length < 12) errors.push(channel.title + ": " + failure.message);
						}
						set((state) => ({
							follows: mergeFollowResults(state.follows, result.channels),
							...!overlappingLive ? { remoteRefreshStatus: {
								at: Date.now(),
								checked,
								refreshed,
								failed: checked - refreshed,
								youtube: youtubeReceived,
								twitch: twitchReceived,
								action
							} } : {}
						}));
						liveProgress();
						if (!overlappingLive) get().updatePull({
							done: checked,
							received,
							added,
							failed: checked - refreshed
						});
						checkpointFollows();
						if (twitchRetry) {
							errors.push(twitchError ?? "Twitch is cooling down.");
							if (!livePipeline) break;
						}
						if (result.providerRetryAt) {
							if (result.providerCooldownScope === "all") {
								const cooldown = {
									retryAt: result.providerRetryAt,
									cooldownScope: "all",
									error: result.channels.find((channel) => channel.lastLiveFailure)?.lastLiveFailure?.message
								};
								saveYoutubeCooldown(cooldown);
								set((state) => ({ youtubeRefreshStatus: {
									...state.youtubeRefreshStatus ?? {
										at: Date.now(),
										checked: 0,
										refreshed: 0,
										failed: 0,
										youtube: 0,
										twitch: 0
									},
									...cooldown
								} }));
							}
							if (kind === "youtube") {
								errors.push(recentQueue ? "YouTube recent checks are cooling down; unchecked creators retain their place." : "YouTube live checks are cooling down; unchecked creators keep their previous status.");
								if (!livePipeline && !recentPipeline) break;
							}
						}
						continue;
					}
				}
				if (liveOnly && result.videos.length && !result.providerRetryAt && !twitchRetry && !result.channels.some((channel) => channel.lastLiveFailure) && result.videos.every((video) => !video.remote?.comments?.length && !video.remote?.youtubeKeywords?.length)) {
					const statusRows = result.videos.map(catalogCard);
					let patched = null;
					let changedRows = [];
					for (;;) {
						await syncLiveSources();
						const snapshot = get().videos, incomingIds = new Set(result.videos.map((video) => video.id));
						const checkedIds = new Set(result.liveCheckedIds ?? result.refreshedIds);
						if (!(!batch.some((channel) => checkedIds.has(channel.id) && [...liveSourceVideos.get(channel.id) ?? []].some((id) => !incomingIds.has(id))) && statusRows.every((video) => {
							const position = livePositions.get(video.id), previous = position === void 0 ? void 0 : snapshot[position];
							return previous?.remote?.live && video.remote?.live && previous.remote.kind === video.remote.kind && previous.folderId === video.folderId && previous.remote.channelId === video.remote.channelId && previous.remote.channelName === video.remote.channelName && previous.remote.videoId === video.remote.videoId && (video.remote.sourceIds ?? []).every((id) => id === previous.folderId || previous.remote.sourceIds?.includes(id)) && previous.name === video.name && previous.genre === video.genre && previous.description === video.description && previous.tagline === video.tagline && previous.collection === video.collection && !video.remote.youtubeKeywords?.length && !video.remote.comments?.length;
						}))) break;
						const turn = async () => {
							await yieldCatalogTask();
							if (getPullCancellationRevision() !== cancellation) throw new Error("Pull cancelled; accepted catalog entries remain saved.");
						};
						const rows = [];
						const next = new Array(snapshot.length);
						await forEachCatalogSlice(snapshot, (row, index) => {
							next[index] = row;
						}, turn, 8192);
						for (const video of statusRows) {
							const position = livePositions.get(video.id), previous = snapshot[position];
							if ((video.remote.observedAt ?? 0) < (previous.remote.observedAt ?? 0)) continue;
							const updated = {
								...previous,
								poster: video.poster || previous.poster,
								remote: {
									...previous.remote,
									live: true,
									viewers: video.remote.viewers,
									observedAt: video.remote.observedAt,
									youtubeEvent: video.remote.youtubeEvent ?? previous.remote.youtubeEvent,
									liveOfflineSince: void 0
								}
							};
							next[position] = updated;
							rows.push(updated);
						}
						if (get().videos !== snapshot) continue;
						patched = rows.length ? next : snapshot;
						changedRows = rows;
						break;
					}
					if (patched) {
						received += providerReceived;
						refreshed += result.refreshedIds.length;
						if (!options?.youtubeLiveOnly) youtubeReceived += result.videos.filter((video) => video.remote?.kind === "youtube").length;
						if (!(twitchLiveOnly && kind === "twitch")) twitchReceived += result.videos.filter((video) => video.remote?.kind === "twitch").length;
						for (const channel of result.channels) if (channel.live && !beforeLiveChannels.has(channel.id)) wentLive.push(channel);
						set((state) => ({
							videos: patched,
							follows: mergeFollowResults(state.follows, result.channels),
							notices: youtubeEventNotices((v) => state.videos[livePositions.get(v.id)], result.videos, state.notices, youtubeGoLiveAlerts()),
							...!overlappingLive ? { remoteRefreshStatus: {
								at: Date.now(),
								checked,
								refreshed,
								failed: checked - refreshed,
								youtube: youtubeReceived,
								twitch: twitchReceived,
								action
							} } : {}
						}));
						liveSourceSnapshot = patched;
						liveProgress();
						if (!overlappingLive) get().updatePull({
							done: checked,
							received,
							added,
							failed: checked - refreshed
						});
						if (changedRows.length) await cacheRemotes(get, changedRows, true);
						checkpointFollows();
						continue;
					}
				}
				let providerRows = result.videos;
				if (!options?.youtubeLiveOnly && !twitchLiveOnly) providerRows = await rotateRemotePull(get, providerRows, cleanupRemaining);
				let prepared;
				let existingIndex;
				let routineMerged;
				let catalogMerged;
				const staleLiveIds = [];
				const endedYoutubeRows = [];
				const pendingYoutubeRows = [];
				const endedTwitchRows = [];
				const rebase = Symbol("Refresh inputs changed");
				for (;;) {
					await syncCatalogIndex();
					prepared = await prepareRemotePull(get, providerRows, catalogPositions ?? void 0);
					existingIndex = catalogPositions ? null : await remoteVideoIndexAsync(prepared.base.videos);
					if (catalogPositions && catalogIndexedVideos !== prepared.base.videos) continue;
					staleLiveIds.length = 0;
					endedYoutubeRows.length = 0;
					pendingYoutubeRows.length = 0;
					endedTwitchRows.length = 0;
					const sameInputs = () => {
						const state = get(), base = prepared.base;
						return state.videos === base.videos && state.tags === base.tags && state.metadataProvenance === base.metadataProvenance && state.favorites === base.favorites && state.likes === base.likes && state.history === base.history && getPullSettings() === prepared.admission.settings;
					};
					const mergeTurn = async () => {
						if (twitchLiveOnly || options?.youtubeLiveOnly) {
							await yieldCatalogTask();
							if (getPullCancellationRevision() !== cancellation) throw new Error("Pull cancelled; accepted catalog entries remain saved.");
						} else await waitForCatalogTurn();
						if (!sameInputs()) throw rebase;
					};
					try {
						routineMerged = catalogPositions ? null : await mergeRemoteRefreshAsync(prepared.base.videos, prepared.admission.videos.map(catalogCard), result.refreshedIds, await prepareRefreshSavedIds(prepared.base.favorites, prepared.base.likes, prepared.base.history, mergeTurn), {
							index: existingIndex ?? void 0,
							staleLiveIds,
							endedYoutubeRows,
							pendingYoutubeRows,
							youtubeOfflineGraceMs: YOUTUBE_LIVE_HOLD_MS,
							endedTwitchRows,
							turn: mergeTurn,
							liveCheckedAt: Object.fromEntries(result.channels.flatMap((channel) => channel.liveCheckedAt ? [[channel.id, channel.liveCheckedAt]] : [])),
							liveCheckedIds: result.liveCheckedIds ?? result.refreshedIds.filter((id) => options?.youtubeLiveOnly || batch.some((channel) => channel.id === id && channel.kind === "twitch"))
						});
						catalogMerged = catalogPositions ? await prepareIndexedRemoteCatalog(prepared.base.videos, prepared.admission.videos.map(catalogCard), catalogPositions, mergeTurn) : null;
					} catch (error) {
						if (error === rebase) continue;
						throw error;
					}
					if (getPullCancellationRevision() !== cancellation) break;
					if (sameInputs()) break;
				}
				if (getPullCancellationRevision() !== cancellation) break;
				result.videos = prepared.admission.videos;
				if (result.providerRetryAt && (result.providerCooldownScope === "all" || result.providerCooldownScope === "catalog" || !result.providerCooldownScope)) {
					const cooldown = {
						retryAt: result.providerRetryAt,
						error: result.channels.find((channel) => channel.kind === "youtube" && channel.lastProviderFailure)?.lastProviderFailure?.message,
						cooldownScope: result.providerCooldownScope === "all" ? "all" : "catalog"
					};
					saveYoutubeCooldown(cooldown);
					set((s) => ({ youtubeRefreshStatus: {
						...s.youtubeRefreshStatus ?? {
							at: Date.now(),
							checked: 0,
							refreshed: 0,
							failed: 0,
							youtube: 0,
							twitch: 0
						},
						...cooldown
					} }));
				}
				const recovered = catalogQueue && !recoveredCooldown && !result.providerRetryAt && result.refreshedIds.length > 0;
				if (recovered) {
					recoveredCooldown = true;
					clearYoutubeCooldown();
				}
				result.channels = holdEntryLimitCursors(get().follows, result.channels, prepared.admission.skippedSources);
				if (prepared.admission.skipped && errors.length < 12) errors.push(ENTRY_LIMIT_MESSAGE);
				const knownVideoIndex = catalogPositions ?? existingIndex;
				const isNewVideo = (video) => lookupCatalogIdentity(knownVideoIndex, video) === void 0;
				const newVideoIds = new Set(result.videos.filter(isNewVideo).map((video) => video.id));
				const newCount = newVideoIds.size;
				received += providerReceived;
				if (!options?.youtubeLiveOnly) youtubeReceived += result.videos.filter((video) => video.remote?.kind === "youtube").length;
				if (!(twitchLiveOnly && kind === "twitch")) twitchReceived += result.videos.filter((video) => video.remote?.kind === "twitch" && (liveOnly ? video.remote.live : video.extension === "vod" || video.extension === "clip")).length;
				added += newCount;
				refreshed += result.refreshedIds.length;
				if (!catalogQueue) newVideos.push(...result.videos.filter((video) => isNewVideo(video) && Boolean(video.remote)));
				for (const channel of result.channels) {
					const failure = recentQueue ? channel.recentPull?.failure : twitchLiveOnly || options?.youtubeLiveOnly ? channel.lastLiveFailure : channel.lastProviderFailure;
					if (failure && errors.length < 12) errors.push(`${channel.title}: ${failure.message}`);
					if (channel.live && !beforeLiveChannels.has(channel.id)) wentLive.push(channel);
				}
				liveProgress();
				if (!overlappingLive) get().updatePull({
					done: Math.min(current.length, offset + batch.length),
					received,
					added,
					failed: Math.min(current.length, offset + batch.length) - refreshed
				});
				const refreshStatus = {
					at: Date.now(),
					checked: offset + batch.length,
					refreshed,
					failed: offset + batch.length - refreshed,
					youtube: youtubeReceived,
					twitch: twitchReceived,
					action,
					...result.providerRetryAt ? {
						retryAt: result.providerRetryAt,
						cooldownScope: result.providerCooldownScope
					} : {},
					...result.channels.find((channel) => channel.lastProviderFailure)?.lastProviderFailure ? { error: result.channels.find((channel) => channel.lastProviderFailure).lastProviderFailure.message } : {}
				};
				const mergedIncoming = catalogMerged?.rows ?? [];
				set((s) => {
					const mergedVideos = catalogPositions ? catalogMerged.videos : routineMerged;
					if (catalogPositions) for (const [key, position] of catalogMerged.positionChanges) catalogPositions.set(key, position);
					const enriched = prepared.enriched;
					if (mergedVideos.length - s.videos.length === prepared.admission.added) rememberEntryCounts(mergedVideos, prepared.admission.counts);
					const folderCounts = catalogFolderCounts ?? new Map(s.folders.map((folder) => [folder.id, folder.videoCount ?? 0]));
					for (const video of result.videos) if (newVideoIds.has(video.id)) {
						folderCounts.set(video.folderId, (folderCounts.get(video.folderId) ?? 0) + 1);
						newVideoIds.delete(video.id);
					}
					return {
						follows: mergeFollowResults(s.follows, result.channels).map((channel) => {
							const failure = channel.lastProviderFailure;
							return recovered && channel.kind === "youtube" && failure?.kind === "rate-limited" && (failure.cooldownScope === "all" || failure.cooldownScope === "catalog") && failure.at <= startedAt ? {
								...channel,
								lastProviderFailure: {
									...failure,
									retryAt: void 0,
									cooldownScope: void 0
								}
							} : channel;
						}),
						...!catalogQueue && kind !== "youtube" ? { remoteCheckedAt: Date.now() } : {},
						folders: [...s.folders.filter((f) => !result.channels.some((channel) => channel.id === f.id)), ...result.channels.map((c) => ({
							id: c.id,
							name: c.title,
							kind: c.kind,
							videoCount: folderCounts.get(c.id) ?? 0,
							health: "healthy",
							lastCheckedAt: Date.now()
						}))],
						videos: mergedVideos,
						notices: youtubeEventNotices((v) => existingIndex?.get(v.id) ?? existingIndex?.get(youtubeVideoKey(v) ?? v.id), result.videos, s.notices, youtubeGoLiveAlerts()),
						progress: reconcileResumeForVideos(result.videos, s.progress, s.resumeProgress),
						tags: enriched.tags,
						metadataProvenance: enriched.metadataProvenance,
						...!overlappingLive ? { remoteRefreshStatus: refreshStatus } : {},
						...kind === "youtube" && !options?.youtubeLiveOnly && !recentQueue ? { youtubeRefreshStatus: refreshStatus } : {},
						...!overlappingLive && !options?.youtubeLiveOnly ? { remoteRetryAt: result.retryAt } : {}
					};
				});
				await reconcilePlaylistCommit(get, set, result.channels);
				if (catalogPositions && !result.channels.some((c) => c.playlistWalk?.completed)) catalogIndexedVideos = get().videos;
				if (catalogQueue) {
					await cacheRemotes(get, [...new Map(mergedIncoming.map((video) => [video.id, video])).values()]);
					if ((offset + batch.length) % 4 === 0) saveFollows(get().follows);
					await new Promise((resolve) => setTimeout(resolve, 0));
				} else {
					const ended = [...endedYoutubeRows, ...endedTwitchRows];
					await cacheRemotes(get, ended.length || pendingYoutubeRows.length ? [
						...result.videos,
						...ended,
						...pendingYoutubeRows
					] : result.videos);
					const retainedStreams = new Set(ended.map((video) => video.id));
					const removedLiveIds = staleLiveIds.filter((id) => !retainedStreams.has(id));
					if (removedLiveIds.length) await removeRemoteSnapshotVideos(removedLiveIds).catch(() => void 0);
				}
				if (liveOnly) checkpointFollows();
				if (twitchRetry) {
					errors.push(twitchError ?? "Twitch is cooling down.");
					if (!livePipeline) break;
				}
				if (result.providerRetryAt && (!liveOnly || kind === "youtube")) {
					errors.push(`YouTube is cooling down until ${new Date(result.providerRetryAt).toLocaleTimeString()}; ${current.length - checked} targets remain queued for a later sweep.`);
					if (!livePipeline && !recentPipeline) break;
				}
				if (!liveOnly && !recentPipeline && kind === "youtube" && prepared.admission.skipped && !prepared.admission.added) break;
			}
			if (liveMetadataBase && get().notices === noticesBeforeRefresh && get().tags === liveMetadataBase.tags && get().metadataProvenance === liveMetadataBase.provenance) saveFollows(get().follows);
			else persistNow(get);
			if (!yieldedLiveTurn && checked < current.length) errors.push("Check stopped early. Confirmed observations are saved; unchecked channels keep their previous state.");
			const failed = checked - refreshed;
			liveProgress(!yieldedLiveTurn && checked < current.length || failed > 0 ? "partial" : "complete");
			const pull = {
				id: pullId,
				provider,
				action,
				startedAt,
				finishedAt: Date.now(),
				targets: current.slice(0, 12).map((channel) => channel.title || channel.handle),
				done: checked,
				total: yieldedLiveTurn ? checked : current.length,
				received,
				added,
				failed,
				status: errors.length ? "partial" : failed ? refreshed ? "partial" : "failed" : "success",
				...errors.length ? { errors: errors.slice(0, 12) } : {}
			};
			if (!overlappingLive) get().finishPull(pull);
			if (!liveOnly && yieldedLiveTurn && checked === 0) return {
				wentLive: [],
				newVideos: [],
				skipped: "busy"
			};
			return {
				wentLive,
				newVideos,
				pull,
				retryAt: get().youtubeRefreshStatus?.retryAt
			};
		} catch (error) {
			liveProgress("partial");
			if (!options?.youtubeLiveOnly) {
				const status = {
					at: Date.now(),
					checked,
					refreshed,
					failed: checked - refreshed,
					youtube: received,
					twitch: 0,
					action,
					error: error instanceof Error ? error.message : String(error)
				};
				set({
					remoteRefreshStatus: status,
					...kind === "youtube" && !recentQueue ? { youtubeRefreshStatus: status } : {}
				});
			}
			const pull = {
				id: pullId,
				provider,
				action,
				startedAt,
				finishedAt: Date.now(),
				targets: current.slice(0, 12).map((channel) => channel.title || channel.handle),
				done: checked,
				total: current.length,
				received,
				added,
				failed: checked - refreshed,
				status: "failed",
				errors: [error instanceof Error ? error.message : String(error)]
			};
			if (!overlappingLive) get().finishPull(pull);
			return {
				wentLive,
				newVideos,
				pull
			};
		} finally {
			livePipeline?.close();
			recentPipeline?.close();
			if (options?.youtubeLiveOnly) youtubeLiveCheckBusy = false;
			if (twitchLiveOnly) twitchLiveCheckBusy = false;
			if (!overlappingLive) set({ refreshing: false });
		}
	},
	pushNotice: (n) => {
		const notice = {
			id: `n:${Date.now()}:${Math.random().toString(16).slice(2, 6)}`,
			at: Date.now(),
			read: false,
			...n
		};
		set((s) => ({ notices: [notice, ...s.notices].slice(0, 40) }));
		persistNow(get);
		if (get().notifyPush && typeof window !== "undefined" && "Notification" in window) {
			if (Notification.permission === "granted") try {
				new Notification(n.title, {
					body: n.body,
					silent: false
				});
			} catch {}
		}
	},
	markNoticesRead: () => {
		set((s) => ({ notices: s.notices.map((n) => ({
			...n,
			read: true
		})) }));
		persistNow(get);
	},
	setNotifyPush: (notifyPush) => {
		set({ notifyPush });
		persistNow(get);
	},
	markUnavailable: (id, reason) => {
		const video = lookupVideo(get().videos, id);
		if (!video || video.remote && video.remote.kind !== "reddit") return;
		if (get().unavailable[id]) return;
		set((s) => ({ unavailable: {
			...s.unavailable,
			[id]: true
		} }));
		get().pushNotice({
			title: "Hidden unavailable video",
			body: `${video.name} · ${reason}`,
			kind: "system"
		});
		persistNow(get);
	},
	pruneHistory: (before) => {
		set((s) => ({ history: s.history.filter((entry) => entry.at >= before) }));
		persistNow(get);
		pruneActivityJournal(before).catch(() => void 0);
	},
	getResumeRepairPreview: () => {
		const state = get();
		const marks = Object.values(state.progress);
		const staleBefore = Date.now() - 15552e6;
		const linkedKeys = new Set(state.videos.flatMap(stableResumeKeys));
		return {
			valid: marks.filter(validResumeMark).length,
			invalid: marks.filter((mark) => !validResumeMark(mark)).length,
			stale: marks.filter((mark) => validResumeMark(mark) && mark.at < staleBefore).length,
			recoverable: Object.entries(state.resumeProgress).filter(([key, mark]) => validResumeMark(mark) && linkedKeys.has(key)).length
		};
	}
}));
var openedPlays = createDeferredEvents((id) => {
	const state = useLibrary.getState();
	if (state.activeId === id || lookupVideo(state.videos, id)) state.recordPlay(id);
}, (work) => scheduleBackgroundWork(work, {
	timeoutMs: 1e3,
	fallbackDelayMs: 0
}));
var youtubeSelectorSnapshot;
if (typeof window !== "undefined") {
	const flushPending = () => {
		openedPlays.flush();
		if (persistTimer != null || cancelPrefsSave) flushPersist(useLibrary.getState);
		else if (cancelActivitySave) {
			cancelActivitySave();
			cancelActivitySave = void 0;
			persistActivityNow(useLibrary.getState);
		}
	};
	const onHidden = () => {
		if (document.hidden) flushPending();
	};
	window.addEventListener("pagehide", flushPending);
	document.addEventListener("visibilitychange", onHidden);
}
var selectorMemo = /* @__PURE__ */ new WeakMap();
function memoFor(state) {
	let memo = selectorMemo.get(state);
	if (!memo) {
		memo = {};
		selectorMemo.set(state, memo);
	}
	return memo;
}
function computePublicList(state) {
	const memo = memoFor(state);
	if (memo.public) return memo.public;
	const adult = adultIdSet(state.folders);
	const knownFolders = new Set(state.folders.map((folder) => folder.id));
	let list = state.videos.filter((v) => !state.unavailable[v.id] && !state.hiddenVideos[v.id] && !videoIsPrivate(adult, v) && (knownFolders.has(v.folderId) || Boolean(v.remote) || v.isSample));
	if (state.hideDemo) list = list.filter((v) => !v.isSample);
	memo.public = list;
	return list;
}
function computeAdultList(state) {
	const memo = memoFor(state);
	if (memo.adult) return memo.adult;
	const adult = adultIdSet(state.folders);
	memo.adult = dedupeAdultVideoCards(state.videos.filter((v) => !state.unavailable[v.id] && !isRemovedRedditVideo(v) && !state.hiddenVideos[v.id] && videoIsPrivate(adult, v) && !RETIRED_ADULT_SOURCE_IDS.includes(v.remote?.kind ?? v.folderId.split(":")[0]) && (state.showHiddenAdult || !(state.tags[v.id] ?? []).includes("hidden"))));
	return memo.adult;
}
var videoNameOrder = new Intl.Collator(void 0, { sensitivity: "base" });
function computeSelectVisible(state) {
	const q = state.query.trim().toLowerCase();
	const inAdults = state.sourceId === "adults" || state.sourceId === "adult-fetishes";
	let list = state.sourceId === "history" ? selectHistory(state, false) : state.sourceId === "continue" ? selectContinue(state, false) : state.sourceId === "favorites" ? selectFavorites(state, false) : inAdults ? adultList(state) : publicList(state);
	if (state.sourceId === "favorites") list = list.filter((v) => state.favorites[v.id] || state.likes[v.id]);
	else if (state.sourceId === "continue") list = selectContinue(state, false);
	else if (state.sourceId === "history") {} else if (state.sourceId === "movies") list = list.filter((v) => Boolean(movieEvidence(v, state.tags[v.id])));
	else if (state.sourceId === "youtube") list = list.filter((v) => v.remote?.kind === "youtube");
	else if (state.sourceId === "twitch") list = list.filter((v) => v.remote?.kind === "twitch");
	else if (state.sourceId === "live") list = list.filter((v) => v.remote?.live);
	else if (state.sourceId === "home" || state.sourceId === "landing" || state.sourceId === "all") {} else if (!SYSTEM_SOURCES.has(state.sourceId) && !inAdults) list = list.filter((v) => v.folderId === state.sourceId);
	if (q) {
		const result = state.searchResult;
		if (!result || result.query !== q || result.videos !== state.videos || result.tags !== state.tags || result.categories !== state.categories) return [];
		list = list.filter((v) => result.ids.has(v.id));
	}
	if (state.sourceId === "youtube" && state.sort === "added") return list;
	if (state.sourceId === "history") return list;
	const sorted = [...list];
	sorted.sort(visibleVideoOrder(state));
	return sorted;
}
function visibleVideoOrder(state) {
	return (a, b) => {
		if (state.sourceId === "movies" && Boolean(state.likes[b.id]) !== Boolean(state.likes[a.id])) return state.likes[b.id] ? 1 : -1;
		switch (state.sort) {
			case "added": return b.addedAt - a.addedAt;
			case "size": return b.size - a.size;
			case "duration": return (b.duration ?? 0) - (a.duration ?? 0);
			case "recent": {
				const ra = state.progress[a.id]?.at ?? 0;
				return (state.progress[b.id]?.at ?? 0) - ra;
			}
			default: return videoNameOrder.compare(a.name, b.name);
		}
	};
}
function computeSelectContinue(state, adult = false) {
	const memo = memoFor(state);
	const existing = adult ? memo.continueAdult : memo.continuePublic;
	if (existing) return existing;
	const marks = /* @__PURE__ */ new Map();
	const recordMark = (id, mark) => {
		if (!mark || !Number.isFinite(mark.t) || !Number.isFinite(mark.d) || mark.t < 2 || mark.d <= 0 || mark.t / mark.d >= .992) return;
		const current = marks.get(id);
		if (!current || mark.at > current.at) marks.set(id, mark);
	};
	const resumeKeys = Object.keys(state.resumeProgress);
	const watchedIds = [...Object.keys(state.progress), ...resumeKeys.filter((key) => key.startsWith("id:")).map((key) => key.slice(3))];
	const adultIds = adultIdSet(state.folders);
	const watched = activityCandidates(state.videos, resumeKeys.filter((key) => !key.startsWith("id:")), watchedIds).filter((video) => !(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === videoIsPrivate(adultIds, video));
	for (const video of watched) recordMark(video.id, resumeForVideo(state, video));
	for (const entry of state.history) {
		if (state.hiddenVideos[entry.id]) continue;
		if (!entry.position || !entry.duration || entry.position < 2 || entry.position / entry.duration >= .992) continue;
		recordMark(entry.id, {
			t: entry.position,
			d: entry.duration,
			at: entry.at
		});
	}
	const candidates = [...watched, ...selectHistory(state, adult)];
	const seen = /* @__PURE__ */ new Set();
	const items = candidates.filter((video) => {
		if (seen.has(video.id)) return false;
		seen.add(video.id);
		return isResumable(video, marks.get(video.id) ?? resumeForVideo(state, video));
	});
	items.sort((a, b) => (marks.get(b.id)?.at ?? resumeForVideo(state, b)?.at ?? 0) - (marks.get(a.id)?.at ?? resumeForVideo(state, a)?.at ?? 0));
	if (adult) memo.continueAdult = items;
	else memo.continuePublic = items;
	return items;
}
function computeSelectFavorites(state, adult = false) {
	return selectSavedCards(state.videos, state.favorites, state.likes, adultIdSet(state.folders), adult, state.hiddenVideos, state.hideDemo);
}
function resumeForVideo(state, video) {
	return newestResume(state.progress[video.id], ...stableResumeKeys(video).map((key) => state.resumeProgress[key]));
}
function* historyLookupKeys(history) {
	for (const entry of history) {
		yield entry.id;
		if (entry.url) yield entry.url;
	}
}
function historyResolver(state, adult, byId) {
	const adultIds = adultIdSet(state.folders);
	const lastMatch = (key) => {
		const matches = byId.get(key);
		for (let index = (matches?.length ?? 0) - 1; index >= 0; index--) {
			const video = matches[index];
			if (!(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === videoIsPrivate(adultIds, video)) return video;
		}
	};
	const seen = /* @__PURE__ */ new Set();
	const resolvedIds = /* @__PURE__ */ new Set();
	const resolve = (h) => {
		if (state.hiddenVideos[h.id] || seen.has(h.id)) return null;
		seen.add(h.id);
		const cached = lastMatch(h.id) ?? (h.url ? lastMatch(h.url) : void 0);
		if (cached) return cached;
		const live = byId.get(h.id)?.[0];
		if (live) {
			if (state.hiddenVideos[live.id] || state.hideDemo && live.isSample) return null;
			const isAdult = videoIsPrivate(adultIds, live);
			if (adult === isAdult) return live;
			if (!adult && isAdult) return null;
		}
		if (!h.url && !h.title) return null;
		const historyUrl = h.url ?? "";
		const isYoutube = /youtube\.com|youtu\.be/i.test(historyUrl);
		const isTwitch = /twitch\.tv/i.test(historyUrl);
		const isEporner = /eporner\.com/i.test(historyUrl);
		const isRedtube = /redtube\.com/i.test(historyUrl);
		const isChaturbate = /chaturbate\.com/i.test(historyUrl);
		const isMfc = /myfreecams\.com|mfc\.cdn/i.test(historyUrl);
		const isReddit = /reddit\.com|redd\.it/i.test(historyUrl);
		const isBooru = /xbooru\.com|tbib\.org|hypnohub\.net/i.test(historyUrl);
		const isRedgifs = /redgifs\.com/i.test(historyUrl);
		const adultKind = isEporner ? "eporner" : isRedtube ? "redtube" : isChaturbate ? "chaturbate" : isMfc ? "myfreecams" : isReddit ? "reddit" : isBooru ? "booru" : isRedgifs ? "redgifs" : null;
		if (!adult && (isEporner || isRedtube || isChaturbate || isMfc || isReddit || isBooru || isRedgifs)) return null;
		if (adult && !adultKind) return null;
		const signature = `${h.at}:${h.url}:${h.position ?? ""}:${h.duration ?? ""}:${h.title ?? ""}`;
		const cachedRecovery = historyRecoveryCardCache.get(h.id);
		if (cachedRecovery?.signature === signature) return cachedRecovery.video;
		const recovered = {
			id: h.id,
			folderId: adultKind ? `history:recovery:${adultKind}` : "history:recovery",
			name: h.title?.trim() || (isYoutube ? "Saved YouTube history" : isTwitch ? "Saved Twitch history" : adultKind ? `Saved ${adultKind} history` : "Saved playback history"),
			path: h.url ?? h.id,
			src: h.url,
			extension: isYoutube ? "yt" : isTwitch ? "vod" : adultKind ?? "history",
			mime: isYoutube ? "video/youtube" : isTwitch ? "video/twitch" : adultKind ? `video/${adultKind}` : "video/history",
			size: 0,
			duration: h.duration,
			addedAt: h.at,
			poster: h.poster,
			tagline: h.title ? "Saved from watch history." : "Original card is not cached right now. The saved link is retained for recovery.",
			remote: isYoutube || isTwitch || adultKind ? {
				kind: isYoutube ? "youtube" : isTwitch ? "twitch" : adultKind,
				live: false,
				embedUrl: h.url,
				watchUrl: h.url
			} : void 0
		};
		historyRecoveryCardCache.set(h.id, {
			signature,
			video: recovered
		});
		if (historyRecoveryCardCache.size > 1500) historyRecoveryCardCache.delete(historyRecoveryCardCache.keys().next().value);
		return recovered;
	};
	return (entry) => {
		const v = resolve(entry);
		if (!v || resolvedIds.has(v.id)) return null;
		resolvedIds.add(v.id);
		return v;
	};
}
function computeSelectHistory(state, adult = false) {
	const resolve = historyResolver(state, adult, activityLookup(state.videos, historyLookupKeys(state.history)));
	return state.history.map(resolve).filter((v) => Boolean(v));
}
/** Combined official adult pull shelves (Eporner + RedTube). */
function computeSelectAdultRemote(state) {
	const memo = memoFor(state);
	if (memo.adultRemote) return memo.adultRemote;
	const matching = state.videos.filter((v) => v.remote?.kind === "eporner" || v.remote?.kind === "redtube" || v.remote?.kind === "chaturbate" || v.remote?.kind === "myfreecams" || v.remote?.kind === "reddit" || v.remote?.kind === "booru" || v.remote?.kind === "redgifs" || ADULT_FOLDER_IDS.includes(v.folderId)).filter((video) => !state.unavailable[video.id] && !isRemovedRedditVideo(video) && !state.hiddenVideos[video.id] && (state.showHiddenAdult || !(state.tags[video.id] ?? []).includes("hidden")));
	memo.adultRemote = dedupeAdultVideoCards([...new Map(matching.map((video) => [video.id, video])).values()]).sort((a, b) => b.addedAt - a.addedAt);
	return memo.adultRemote;
}
function computeSelectYoutube(state) {
	const memo = memoFor(state);
	if (memo.youtube) return memo.youtube;
	const previous = youtubeSelectorSnapshot;
	const privateFolders = adultIdSet(state.folders);
	const sameVisibility = previous && previous.privateFolders === privateFolders && previous.unavailable === state.unavailable && previous.hiddenVideos === state.hiddenVideos && previous.hideDemo === state.hideDemo;
	let result;
	if (sameVisibility && previous.videos === state.videos) return previous.result;
	result = (sameVisibility ? updateYoutubeShelf(previous.videos, state.videos, previous.result, (video) => !state.unavailable[video.id] && !state.hiddenVideos[video.id] && !videoIsPrivate(privateFolders, video) && !(state.hideDemo && video.isSample)) : void 0) ?? state.videos.filter((video) => video.remote?.kind === "youtube" && !state.unavailable[video.id] && !state.hiddenVideos[video.id] && !videoIsPrivate(privateFolders, video) && !(state.hideDemo && video.isSample)).sort(compareYoutubePublication);
	memo.youtube = result;
	youtubeSelectorSnapshot = {
		videos: state.videos,
		privateFolders,
		unavailable: state.unavailable,
		hiddenVideos: state.hiddenVideos,
		hideDemo: state.hideDemo,
		result
	};
	return result;
}
function computeSelectTwitch(state) {
	const memo = memoFor(state);
	if (memo.twitch) return memo.twitch;
	const twitch = publicList(state).filter((v) => v.remote?.kind === "twitch");
	const live = twitch.filter((v) => v.remote?.live);
	const vods = twitch.filter((v) => !v.remote?.live);
	memo.twitch = [...live, ...vods];
	return memo.twitch;
}
function computeSelectLive(state) {
	const memo = memoFor(state);
	return memo.live ?? (memo.live = publicList(state).filter((v) => v.remote?.live));
}
function computeSelectClassics(state) {
	const memo = memoFor(state);
	return memo.classics ?? (memo.classics = publicList(state).filter((v) => !v.remote && isClassicVideo(v)));
}
function userFolderCount(folders) {
	return folders.filter((f) => f.kind !== "demo").length;
}
var publicList = memoizeSelector(computePublicList, [
	"videos",
	"folders",
	"unavailable",
	"hiddenVideos",
	"hideDemo"
]);
var adultList = memoizeSelector(computeAdultList, [
	"videos",
	"folders",
	"unavailable",
	"hiddenVideos",
	"tags",
	"showHiddenAdult"
]);
var selectAdultRemote = memoizeSelector(computeSelectAdultRemote, [
	"unavailable",
	"videos",
	"hiddenVideos",
	"tags",
	"showHiddenAdult"
]);
var selectFavorites = memoizeSelector(computeSelectFavorites, [
	"videos",
	"folders",
	"hideDemo",
	"hiddenVideos",
	"favorites",
	"likes"
]);
async function prepareFavoritesSelection(state, signal, yieldTask = yieldCatalogTask) {
	const cached = selectFavorites.peek(state);
	const privateCached = selectFavorites.peek(state, true);
	if (cached && privateCached) return cached;
	const turn = async () => {
		signal.throwIfAborted();
		await yieldTask();
		signal.throwIfAborted();
	};
	const privateFolders = adultIdSet(state.folders);
	const result = cached ?? await selectSavedCardsAsync(state.videos, state.favorites, state.likes, privateFolders, false, state.hiddenVideos, state.hideDemo, turn);
	const privateResult = privateCached ?? await selectSavedCardsAsync(state.videos, state.favorites, state.likes, privateFolders, true, state.hiddenVideos, state.hideDemo, turn);
	signal.throwIfAborted();
	selectFavorites.prime(state, result);
	selectFavorites.prime(state, privateResult, true);
	return result;
}
var selectHistory = memoizeSelector(computeSelectHistory, [
	"videos",
	"folders",
	"hideDemo",
	"hiddenVideos",
	"history"
]);
var selectContinue = memoizeSelector(computeSelectContinue, [
	"videos",
	"folders",
	"hideDemo",
	"hiddenVideos",
	"history",
	"progress",
	"resumeProgress"
]);
/** Recovery and alias resolution share the same rules as ordinary selectors,
* but every large phase runs outside input and yields before publishing. */
async function prepareHistorySelection(state, signal, yieldTask = yieldCatalogTask, adult = false) {
	const cached = selectHistory.peek(state, adult);
	if (cached) return cached;
	const turn = async () => {
		signal.throwIfAborted();
		await yieldTask();
		signal.throwIfAborted();
	};
	const resolve = historyResolver(state, adult, await activityLookupAsync(state.videos, historyLookupKeys(state.history), turn)), result = [];
	await forEachCatalogSlice(state.history, (entry) => {
		const video = resolve(entry);
		if (video) result.push(video);
	}, turn);
	signal.throwIfAborted();
	selectHistory.prime(state, result, adult);
	return result;
}
async function prepareContinueSelection(state, signal, yieldTask = yieldCatalogTask, adult = false) {
	const cached = selectContinue.peek(state, adult);
	if (cached) return cached;
	const turn = async () => {
		signal.throwIfAborted();
		await yieldTask();
		signal.throwIfAborted();
	};
	function* directIds() {
		for (const row of sparseRecordScan(state.progress)) yield row?.[0];
		for (const row of sparseRecordScan(state.resumeProgress)) yield row?.[0].startsWith("id:") ? row[0].slice(3) : void 0;
	}
	function* aliases() {
		for (const row of sparseRecordScan(state.resumeProgress)) yield row && !row[0].startsWith("id:") ? row[0] : void 0;
	}
	const privateFolders = adultIdSet(state.folders);
	const watched = adult && !privateFolders.size ? [] : await activityCandidatesAsync(state.videos, aliases(), directIds(), turn);
	const marks = /* @__PURE__ */ new Map();
	const recordMark = (id, mark) => {
		if (!mark || !Number.isFinite(mark.t) || !Number.isFinite(mark.d) || mark.t < 2 || mark.d <= 0 || mark.t / mark.d >= .992) return;
		const previous = marks.get(id);
		if (!previous || mark.at > previous.at) marks.set(id, mark);
	};
	const visible = (video) => !(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === videoIsPrivate(privateFolders, video);
	await forEachCatalogSlice(watched, (video) => {
		if (visible(video)) recordMark(video.id, resumeForVideo(state, video));
	}, turn);
	await forEachCatalogSlice(state.history, (entry) => {
		if (!state.hiddenVideos[entry.id] && entry.position && entry.duration && entry.position >= 2 && entry.position / entry.duration < .992) recordMark(entry.id, {
			t: entry.position,
			d: entry.duration,
			at: entry.at
		});
	}, turn);
	const history = await prepareHistorySelection(state, signal, yieldTask, adult);
	const seen = /* @__PURE__ */ new Set(), times = /* @__PURE__ */ new Map(), result = [];
	function* candidates() {
		for (const video of watched) if (visible(video)) yield video;
		yield* history;
	}
	await forEachCatalogEntry(candidates(), (video) => {
		if (seen.has(video.id)) return;
		seen.add(video.id);
		const mark = marks.get(video.id) ?? resumeForVideo(state, video);
		if (isResumable(video, mark)) {
			result.push(video);
			times.set(video, mark?.at ?? 0);
		}
	}, turn);
	const sorted = await sortCatalogRows(result, (a, b) => times.get(b) - times.get(a), turn);
	signal.throwIfAborted();
	selectContinue.prime(state, sorted, adult);
	return sorted;
}
async function prepareRecoveryBrowse(state, signal, turn = yieldCatalogTask) {
	const selected = state.sourceId === "continue" ? await prepareContinueSelection(state, signal, turn) : await prepareHistorySelection(state, signal, turn);
	await prepareHistorySelection(state, signal, turn, true);
	await prepareContinueSelection(state, signal, turn, true);
	if (!selectVisible.peek(state)) {
		const visible = state.sourceId === "history" ? selected : await sortCatalogRows(await copyCatalogArray(selected, turn), visibleVideoOrder(state), turn);
		signal.throwIfAborted();
		selectVisible.prime(state, visible);
	}
}
var selectVisible = memoizeSelector(computeSelectVisible, (state) => {
	const keys = [
		"videos",
		"folders",
		"hideDemo",
		"unavailable",
		"hiddenVideos",
		"sourceId",
		"query",
		"sort"
	];
	if (state.sourceId === "adults" || state.sourceId === "adult-fetishes") keys.push("tags", "showHiddenAdult");
	if (state.query.trim()) keys.push("searchResult", "tags", "categories");
	if (state.sourceId === "favorites") keys.push("favorites", "likes");
	if (state.sourceId === "movies") keys.push("likes", "tags");
	if (state.sourceId === "history" || state.sourceId === "continue") keys.push("history");
	if (state.sourceId === "continue") keys.push("progress", "resumeProgress");
	else if (state.sort === "recent" && state.sourceId !== "history") keys.push("progress");
	return keys;
});
/** The optional private desk uses the exact ordinary visibility/identity rules,
* but never filters, merges or sorts a full archive on the initiating click. */
async function preparePrivateSelection(state, signal, yieldTask = yieldCatalogTask) {
	if (state.sourceId !== "adults" || state.query.trim()) throw new Error("Private shelves require the private desk without a search.");
	const cached = selectVisible.peek(state);
	if (cached) return cached;
	const turn = async () => {
		signal.throwIfAborted();
		await yieldTask();
		signal.throwIfAborted();
	};
	let selected = adultList.peek(state);
	if (!selected) {
		const folders = adultIdSet(state.folders), rows = [], identities = /* @__PURE__ */ new Map();
		await forEachCatalogSlice(state.videos, (video) => {
			if (state.unavailable[video.id] || isRemovedRedditVideo(video) || state.hiddenVideos[video.id] || !videoIsPrivate(folders, video) || RETIRED_ADULT_SOURCE_IDS.includes(video.remote?.kind ?? video.folderId.split(":")[0]) || !state.showHiddenAdult && (state.tags[video.id] ?? []).includes("hidden")) return;
			const key = adultMediaIdentity(video), previous = key ? identities.get(key) : void 0;
			if (previous != null) rows[previous] = mergeAdultDuplicate(rows[previous], video);
			else {
				if (key) identities.set(key, rows.length);
				rows.push(video);
			}
		}, turn, 4096);
		signal.throwIfAborted();
		selected = rows;
		adultList.prime(state, rows);
		memoFor(state).adult = rows;
	}
	const result = await sortCatalogRows(await copyCatalogArray(selected, turn), visibleVideoOrder(state), turn, 16384);
	signal.throwIfAborted();
	selectVisible.prime(state, result);
	return result;
}
var selectYoutube = memoizeSelectorInputs(computeSelectYoutube, (state) => [
	state.videos,
	adultIdSet(state.folders),
	state.unavailable,
	state.hiddenVideos,
	state.hideDemo
]);
/** Navigation prepares the exact selector result cooperatively, before any
* subscribed component can trigger a synchronous cold catalog filter/sort. */
async function prepareYoutubeSelection(state, signal, yieldTask = yieldCatalogTask) {
	const cached = selectYoutube.peek(state);
	if (cached) return cached;
	const privateFolders = adultIdSet(state.folders);
	const previous = youtubeSelectorSnapshot;
	const result = (previous && previous.privateFolders === privateFolders && previous.unavailable === state.unavailable && previous.hiddenVideos === state.hiddenVideos && previous.hideDemo === state.hideDemo ? await updateYoutubeShelfAsync(previous.videos, state.videos, previous.result, (video) => !state.unavailable[video.id] && !state.hiddenVideos[video.id] && !videoIsPrivate(privateFolders, video) && !(state.hideDemo && video.isSample), signal, yieldTask) : void 0) ?? await youtubeCatalogSelection({
		videos: state.videos,
		privateFolders,
		unavailable: state.unavailable,
		hiddenVideos: state.hiddenVideos,
		hideDemo: state.hideDemo
	}, signal, yieldTask);
	signal.throwIfAborted();
	selectYoutube.prime(state, result);
	memoFor(state).youtube = result;
	youtubeSelectorSnapshot = {
		videos: state.videos,
		privateFolders,
		unavailable: state.unavailable,
		hiddenVideos: state.hiddenVideos,
		hideDemo: state.hideDemo,
		result
	};
	return result;
}
var selectTwitch = memoizeSelector(computeSelectTwitch, [
	"videos",
	"folders",
	"unavailable",
	"hiddenVideos",
	"hideDemo"
]);
var selectLive = memoizeSelector(computeSelectLive, [
	"videos",
	"folders",
	"unavailable",
	"hiddenVideos",
	"hideDemo"
]);
var selectClassics = memoizeSelector(computeSelectClassics, [
	"videos",
	"folders",
	"unavailable",
	"hiddenVideos",
	"hideDemo"
]);
var catalogSelectors = [
	publicList,
	adultList,
	selectAdultRemote,
	selectFavorites,
	selectHistory,
	selectContinue,
	selectVisible,
	selectYoutube,
	selectTwitch,
	selectLive,
	selectClassics
];
/** Idle cleanup releases other desks without invalidating the arrays currently
* on screen. Clearing active selectors immediately rebuilt/sorted them in the
* next store notification, defeating cleanup and blocking the first new click. */
function trimCatalogSelectorCaches(state = useLibrary.getState()) {
	const keep = /* @__PURE__ */ new Set();
	const source = state.sourceId, privateDesk = source === "adults" || source === "adult-fetishes";
	const add = (...selectors) => selectors.forEach((selector) => keep.add(selector));
	if (state.query.trim() || source !== "home" && !HUB_SOURCES.has(source)) add(selectVisible);
	if (state.query.trim()) add(privateDesk ? adultList : publicList);
	if (source === "landing") add(...catalogSelectors.filter((selector) => selector !== adultList && selector !== selectAdultRemote));
	else if (source === "youtube") add(selectYoutube);
	else if (source === "favorites") add(selectFavorites);
	else if (source === "continue" || source === "history") add(selectContinue, selectHistory);
	else if (privateDesk) add(adultList, selectAdultRemote, selectFavorites, selectContinue, selectHistory);
	else if (source !== "home" && !HUB_SOURCES.has(source)) {
		add(publicList);
		if (source === "twitch") add(selectTwitch);
		if (source === "live") add(selectLive);
		if (source === "movies" || source === "classics") add(selectClassics);
		if (source === "movies") add(selectContinue, selectHistory);
	}
	for (const selector of catalogSelectors) if (keep.has(selector)) selector.evictStale(state);
	else selector.clear();
	const activitySelectors = [
		selectFavorites,
		selectContinue,
		selectHistory
	];
	if (privateDesk) for (const selector of activitySelectors) selector.clear(false);
	else if (![
		"favorites",
		"continue",
		"history"
	].includes(source)) for (const selector of activitySelectors) selector.clear(true);
	selectorMemo = /* @__PURE__ */ new WeakMap();
	if (!keep.has(selectYoutube)) youtubeSelectorSnapshot = void 0;
}
useLibrary.subscribe((state, previous) => {
	if (state.videos === previous.videos && state.tags === previous.tags && state.folders === previous.folders && state.categories === previous.categories && state.hiddenVideos === previous.hiddenVideos) return;
	for (const selector of catalogSelectors) selector.evictStale(state);
});
useLibrary.subscribe((state, previous) => {
	if (state.activeId !== previous.activeId || state.previewId !== previous.previewId || state.query !== previous.query) setEnrichmentViewerOpen(Boolean(state.activeId || state.previewId), Boolean(state.query.trim()));
});
/** User-initiated retry; never flush an unhydrated empty snapshot over saved state. */
async function retryLibraryPersistence() {
	if (restoreCompletion) await restoreCompletion;
	if (!preferencesRestored || !useLibrary.getState().hydrated) throw new Error("Wait for the saved library to finish loading before retrying.");
	await recoverCatalogMutations();
	durableSliceWriter.reset();
	persistNow(useLibrary.getState);
	await Promise.all([
		waitForDurableWrites(),
		waitForPrefsWrites(),
		waitForFollowsWrites()
	]);
	const state = useLibrary.getState();
	await saveRemoteSnapshot({
		videos: state.videos.filter((video) => video.remote && !video.isSample),
		metadata: {
			tags: state.tags,
			metadataProvenance: state.metadataProvenance
		},
		folders: [],
		checkedAt: 0
	}, false, true);
}
/** Rebase compact cross-tab invalidations through existing paged disk readers.
* No provider opens and no preference/follow snapshot is written here. */
async function rebaseSharedCatalog() {
	if (restoreCompletion) await restoreCompletion;
	if (!useLibrary.getState().hydrated) throw Error("Wait for library recovery before refreshing another tab’s changes.");
	if (useLibrary.getState().scanning) throw Error("Wait for this tab’s local import to finish before refreshing shared catalog changes.");
	return withCatalogRead(async () => {
		await recoverCatalogMutations();
		for (let attempt = 0; attempt < 3; attempt++) {
			const base = useLibrary.getState();
			const [local, snapshot, dirs] = await Promise.all([
				loadCatalogVideos(),
				loadRemoteSnapshot(),
				loadDirHandles()
			]);
			const disk = await mergeRemoteCatalogAsync(local, snapshot?.videos ?? []), ids = /* @__PURE__ */ new Set(), cards = [], counts = /* @__PURE__ */ new Map(), knownIds = /* @__PURE__ */ new Set();
			let deferredLocal = false;
			await forEachCatalogSlice(base.videos, (row) => {
				knownIds.add(row.id);
			}, yieldCatalogTask);
			await forEachCatalogSlice(disk, (row) => {
				if (!row.remote && !knownIds.has(row.id)) {
					deferredLocal = true;
					return;
				}
				ids.add(row.id);
				cards.push(catalogCard(row));
				counts.set(row.folderId, (counts.get(row.folderId) ?? 0) + 1);
			}, yieldCatalogTask);
			const retained = [];
			await forEachCatalogSlice(base.videos, (row) => {
				if (row.isSample || ids.has(row.id)) retained.push(row);
			}, yieldCatalogTask);
			const videos = await mergeRemoteCatalogAsync(retained, cards);
			const metadata = await restoreCatalogMetadata({
				tags: base.tags,
				metadataProvenance: base.metadataProvenance,
				categories: base.categories
			});
			const current = useLibrary.getState();
			if (current.videos !== base.videos || current.tags !== base.tags || current.metadataProvenance !== base.metadataProvenance || current.categories !== base.categories) continue;
			const directoryIds = new Set(dirs.map((row) => row.id));
			const folders = base.folders.filter((folder) => folder.kind !== "directory" || directoryIds.has(folder.id) || counts.has(folder.id)).map((folder) => folder.kind === "demo" ? folder : {
				...folder,
				videoCount: counts.get(folder.id) ?? 0
			});
			useLibrary.setState({
				...metadata,
				videos,
				youtubeCleanup: snapshot?.youtubeCleanup ?? base.youtubeCleanup,
				remoteCheckedAt: Math.max(base.remoteCheckedAt, snapshot?.checkedAt ?? 0),
				folders: snapshot ? [...folders.filter((folder) => folder.kind !== "youtube" && folder.kind !== "twitch"), ...snapshot.folders] : folders
			});
			return { deferredLocal };
		}
		throw Error("This tab is still changing. Retry the cross-tab refresh after current work settles.");
	});
}
//#endregion
export { getWatchTime as $, useLibrary as $n, resumeForVideo as $t, getDataSaverMode as A, setRecommendationRejection as An, nextRemoteRefresh as At, getNote as B, subscribeRating as Bn, prepareYoutubeSelection as Bt, exposureDiagnostics as C, setDataSaverMode as Cn, markYoutubePreparationReady as Ct, fetchTwitchFollowing as D, setPullsPaused as Dn, movieEvidence as Dt, fetchTwitchChapters as E, setPullViewerOpen as En, measureInteraction as Et, getFirstShelfTrace as F, subscribePerformanceProfile as Fn, prepareCreatorCoverageResolver as Ft, getPullSettings as G, titleOf as Gn, rebaseSharedCatalog as Gt, getPerformanceProfile as H, subscribeYoutubeTrace as Hn, rankingFeedbackSnapshot as Ht, getHeartedTagHistory as I, subscribePullAvailability as In, prepareFavoritesSelection as It, getRecommendationExposure as J, toggleTagLike as Jn, recordWatchTime as Jt, getRating as K, toggleCreatorFavorite as Kn, recommendationTopicIsLiked as Kt, getImageLoadBudgetSnapshot as L, subscribePullControl as Ln, prepareHistorySelection as Lt, getFeedbackDiagnostics as M, store_0MIXEefC_exports as Mn, planAdultPull as Mt, getFeedbackRevision as N, subscribeArtworkSuppression as Nn, planFollowRemoval as Nt, folderIsPrivate as O, setRating as On, movieIdentityEvidence as Ot, getFeedbackSaveState as P, subscribeDataSaver as Pn, prepareContinueSelection as Pt, getStartupTraceRevision as Q, updatePullSettings as Qn, resolvePlayUrl as Qt, getInteractionBudgetSnapshot as R, subscribePullQueue as Rn, preparePrivateSelection as Rt, exportFeedback as S, setCreatorRating as Sn, markYoutubeArtworkReady as St, fetchLiveRooms as T, setPerformanceMode as Tn, markYoutubeSelectorReady as Tt, getPullCancellationRevision as U, tagHasHeartHistory as Un, readLocalImportSession as Ut, getPerformanceMode as V, subscribeStartupTrace as Vn, pullsPaused as Vt, getPullQueueSnapshot as W, tagIsLiked as Wn, readRedditSourceSettings as Wt, getServerPerformanceProfile as X, trimCatalogSelectorCaches as Xn, resetRecommendationExposure as Xt, getRecommendationRejections as Y, topicAliasSaveStatus as Yn, refreshExposureRecommendations as Yt, getSourceMemorySnapshot as Z, trimObjectUrls as Zn, resolveBooruOriginal as Zt, creatorIsFavorited as _, selectTwitchRefreshBatch as _n, loadAdultArchiveCursors as _t, RECOMMENDED_FOLDERS as a, saveImportSession as an, youtubeCooldownMessage as ar, hydrateTopicAliases as at, emptyImportReview as b, selectYoutubeSweepChannels as bn, markFirstShelfArtwork as bt, adultArchiveDepthLabel as c, searchResultSource as cn, youtubeLiveEstimate as cr, importRecommendationExposure as ct, automaticPullAvailable as d, selectContinue as dn, importSessionEntries as dt, retryFeedbackSave as en, userFolderCount as er, getYoutubeFirstClickTrace as et, cancelQueuedPulls as f, selectFavorites as fn, importTopicAliases as ft, createSsrRpc as g, selectTwitchQuickLiveChannels as gn, isLikelyPlayable as gt, clearLowPriorityImageQueue as h, selectTwitch as hn, isClassicVideo as ht, RATING_GOALS as i, reviewedImportBatch as in, watchTimeScore as ir, hydrateRecommendationExposure as it, getExposureRevision as j, stageImportSession as jn, pinPlayUrl as jt, getCreatorRating as k, setRatingWeeklyGoal as kn, navigationSourceLabel as kt, adultRedditPullSources as l, selectAdultRemote as ln, youtubeTagConfidenceReport as lr, importReviewRow as lt, cleanImportReview as m, selectLive as mn, isArtworkSuppressed as mt, HUB_SOURCES as n, retryTopicAliasSave as nn, waitForCatalogCommit as nr, hasFreshViewerCount as nt, REDDIT_SOURCE_STORAGE_KEY as o, scheduleBackgroundWork as on, youtubeCreatorProfiles as or, idleEnrichment as ot, catalogPullAvailable as p, selectHistory as pn, inspectRedditImage as pt, getRatingStreakSnapshot as q, toggleCreatorLike as qn, recordRecommendationExposure as qt, NATIVE_PLAYABLE as r, reviewTopicAlias as rn, watchImageSlot as rr, holdMetadataEnrichment as rt, TWITCH_QUICK_LIVE as s, searchRedtubeStars as sn, youtubeIdentityReviews as sr, importFeedback as st, DEFAULT_PULL_SETTINGS as t, retryRecommendationExposure as tn, viewerDetails as tr, getYoutubeTraceRevision as tt, animeEvidence as u, selectClassics as un, importReviewWindow as ut, creatorIsLiked as v, selectVisible as vn, loadImportSession as vt, fetchAdultComments as w, setNote as wn, markYoutubeRailReady as wt, ensureImageBudgetVisibilityHook as x, setActivePullPage as xn, markHomeReady as xt, dataSaverActive as y, selectYoutube as yn, markFirstShelf as yt, getInteractionPriorityDelay as z, subscribePullSettings as zn, prepareRecoveryBrowse as zt };
