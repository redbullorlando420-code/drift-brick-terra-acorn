import { r as __exportAll } from "../_runtime.mjs";
import { $ as patchSparseRecord, C as confirmedYoutubeChannelId, D as decodeTwitchArchiveCursor, Dt as twitchObservationCurrent, F as forEachCatalogEntry, H as mergeResolvedFollow, I as forEachCatalogSlice, Jt as __exportAll$1, K as normalizeTwitchPullPolicy, L as importedFollowStub, Ot as twitchPolicyAllows, Vt as youtubeEventNotices, _ as bindYoutubeCorrection, _t as sparseRecordBuilder, b as classifyTwitchFailure, c as adultFolderIds, dt as retainTwitchSourceIdentity, et as recentPullFailure, ft as reviewYoutubeImport, g as bindTwitchSource, gt as sortCatalogRows, h as assertTwitchContinuity, it as removeSparseRecordKeys, jt as twitchRetryPatch, k as dedupeFollows, kt as twitchPullPolicy, mt as separateTwitchIdentity, n as ADULT_PULL_PROVIDERS, nt as recentPullSuccess, ot as repairYoutubeImport, rt as reconcilePlaylistWalks, st as resolvedFollowQueries, tt as recentPullReady, ut as retainTwitchPullPolicy, w as copyCatalogArray, y as canonicalFollowHandle, yt as sparseRecordScan, zt as yieldCatalogTask } from "./twitch-retry-D5SsgGzE.mjs";
import { c as profileLocalStorage } from "./local-profile-storage-YmNvgtyc.mjs";
import { t as LIBRARY_LIMITS } from "./youtube-contract-DMSANo43.mjs";
import { a as exactYoutubePublished, h as youtubePublicationTime, i as compareYoutubePublication, l as retainYoutubeMetadata, p as youtubePublicationIdentityOrder, u as withYoutubePublication } from "./provider-json-sZboGRL6.mjs";
import { n as createShortLocalId } from "./local-id-CsDq4efR.mjs";
import { r as CoalescedWriter } from "./companion-DacueTBp.mjs";
import { $a as saveViewPrefs, $i as restoreEnrichmentRows, $n as loadPrefs, A as activityCandidatesAsync, Aa as saveDurableLinks, An as isCatalogDeleted, At as clearFolderVideos, B as animeTitleInfo, Ba as saveMediaObservation, Bi as replacementRequestBudget, Bn as loadActivityJournal, Bo as youtubeCoverageCounts, Bt as consumeCleanupBudget, C as RESTORE_EVENT, Cn as hydrateFileIdentities, Ct as cleanupBudgets, Da as saveDirHandle, Di as recoverResumeRecords, Dt as cleanupSourceKeys, Ea as saveCreatorCoverageRows, Ei as recoverCatalogMutations, Eo as undoFileIdentityMove, Et as cleanupPolicy, F as adultGrowthCounts, Fa as saveEnrichmentRows, Fi as remoteEntryCounts, Fo as waitForPrefsWrites, Ft as compactYoutubeTagEvidence, Gi as restoreDurableFollows, Gn as loadCatalogVideos, Go as youtubeTextTags, H as appendCatalogVideos, Hi as restoreCatalogDeletion, I as adultVideoGoalRemaining, Ii as remoteVideoIndexAsync, Io as withCatalogDetails, J as archiveQuery, Ja as saveSavedShelfEdit, Ji as restoreDurableMarks, K as applyTwitchAliasReview, Ka as saveRecoveryLinks, Ki as restoreDurableHistory, Kn as loadDirHandles, Ko as youtubeVideoKey, La as saveFolderVideos, Lo as withCatalogRead, M as activityLookupAsync, Ma as saveDurablePhotos, Mi as rememberAdultGrowthChanges, Mo as videoIsPrivate, N as admitRemoteEntries, Na as saveDurableResume, Ni as rememberEntryCounts, No as waitForDurableWrites, Oi as refreshYoutubeTags, Ot as clearActivityJournal, P as adultAdmissionPolicy, Pa as saveDurableShelves, Pi as rememberVideo, Po as waitForFollowsWrites, Q as automaticYoutubeTags, Qi as restoreDurableShelves, Qr as planYoutubeCleanup, Qt as entryGroup, Ra as saveFollows, Ri as removeRemoteSnapshotVideos, Sa as saveActivitySnapshot, Si as reconcileProviderTopicTags, Sn as hydrateCatalogDeletions, St as cleanupBudgetAvailable, Ta as saveCatalogMetadataEdit, Ti as recoverActivityCounts, Tt as cleanupLabel, Ua as savePrefs, Ui as restoreCatalogMetadata, Uo as youtubeTagEvidence, V as appendActivityJournal, Vn as loadActivitySnapshot, Vo as youtubeCoverageIndexAsync, W as applyFileIdentityMove, Wn as loadCatalogVideo, Wo as youtubeTagTitleHash, Xa as saveThumbCache, Xi as restoreDurablePrefs, Ya as saveSourceHealth, Yi as restoreDurablePhotos, Yn as loadFollows, Z as assertRestoreWritable, Zi as restoreDurableResume, Zn as loadHiddenSources, Zt as emptyYoutubeCleanup, bn as hideLocalSource, bt as chooseMediaRecovery, ci as pruneActivityJournal, ct as canRotateForGroup, dt as catalogCard, en as fileIdentitySnapshot, eo as saveWorkspaceDocuments, fa as restoreWritable, fr as mediaBasis, ft as catalogDeletionSnapshot, ia as restoreMetadataEdits, ii as prepareRefreshSavedIds, in as fingerprintFile, io as selectSavedCardsAsync, j as activityLookup, ja as saveDurableMarks, ji as remainingEntrySlots, k as activityCandidates, ka as saveDurableHistory, ko as validArchiveCursor, l as EMPTY_ENTRY_COUNTS, la as restoreTagEdits, lr as lookupCatalogIdentity, mi as readArchiveLedger, ni as prepareIndexedRemoteCatalog, nr as loadRemoteSnapshot, pa as retiredYoutubeKeys, pr as mediaHealthSnapshot, pt as catalogIdentityKeys, q as archiveLaneKey, qa as saveRemoteSnapshot, qi as restoreDurableLinks, qr as patchActivityRecord, r as CLEANUP_GROUPS, ro as selectSavedCards, rr as loadSourceHealth, st as cacheMetrics, ti as prepareEnrichmentBatch, to as saveYoutubeCleanup, ur as lookupVideo, ut as canonicalTopic, va as rotationAvailable, vi as readWorkspaceDocument, vr as mergeRemoteCatalogAsync, wa as saveCatalogDeletion, wi as recordYoutubeCleanup, wn as hydrateMediaHealth, wo as topicsForVideo, wt as cleanupKey, xn as holdEntryLimitCursors, ya as sameFileFingerprint, yn as hiddenSourceFolders, yr as mergeRemoteRefreshAsync, zo as youtubeCleanupProtected } from "./persist-BLKyjE-q.mjs";
import { a as scheduleBackgroundWork, i as prioritizeInteraction, n as getInteractionPriorityDelay, r as measureInteraction } from "./interaction-budget-2wyu0HNo.mjs";
import { S as sourceIsPinned, _ as rememberDirHandle, a as forgetLocalSource, b as resolveLocalFile, d as ingestFileList, f as isClassicVideo, g as queryDirPermission, i as forgetFolder, l as ingestDataTransfer, m as pickDirectory, o as getDirHandle, r as SYSTEM_SOURCES, u as ingestDirectoryHandle, v as rememberVerifiedIdentityFile, y as requestDirPermission } from "./scan-BggpJjjz.mjs";
import { $ as isUsableAdultThumb, Q as isRemovedRedditVideo, S as adultIngestTags, _t as youtubeLiveFailure, a as ADULT_FOLDER_BY_PROVIDER, b as YOUTUBE_QUICK_LIVE, dt as selectDueLiveRefreshChannels, ft as selectLiveRefreshChannels, ht as youtubeLiveCooldown, o as ADULT_FOLDER_IDS, pt as selectYoutubeQuickLiveChannels, q as isAdultPullKind$1, st as redditIngestExtras, ut as retainAdultRefreshEvidence, y as RETIRED_ADULT_SOURCE_IDS } from "./live-rooms-meLAYjKO.mjs";
import { t as hydrateTopicAliases } from "./topic-alias-store-VpX-1OFI.mjs";
import { a as markRecommendationOpened } from "./recommendation-exposure-store-DrLUoFck.mjs";
import { o as youtubeDownloadTarget } from "./youtube-download-CKPVbpaB.mjs";
import { E as refreshRemotes, H as waitForPulls, M as setPullViewerOpen, O as searchAdultVideos, S as importChannels, T as pullsPaused, V as waitForCatalogCommit, a as catalogPullAvailable, h as followRemote, r as automaticPullAvailable, s as clearLowPriorityImageQueue, x as getPullSettings, y as getPullCancellationRevision } from "./functions-CbXnR81i.mjs";
import { M as verifyCleanupFeedback, N as warmLegacyRatings, d as getRating, h as hydrateDurableFeedback, i as exportFeedback, s as getFeedbackRevision } from "./media-feedback-CKdjk9WZ.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as useSourceAssets } from "./source-assets-4lR6sQzr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-tNfphKUZ.js
var store_tNfphKUZ_exports = /* @__PURE__ */ __exportAll({
	$: () => getStartupTraceRevision,
	A: () => markYoutubeSelectorReady,
	B: () => youtubeIdentityReviews,
	C: () => useLibrary,
	Ct: () => selectTwitchQuickLiveChannels,
	D: () => markYoutubeArtworkReady,
	Dt: () => yieldNavigationTask,
	E: () => getYoutubeTraceRevision,
	Et: () => scheduleNavigationWork,
	F: () => holdMetadataEnrichment,
	G: () => ADULT_ARCHIVE_EVENT,
	H: () => animeEvidence,
	I: () => idleEnrichment,
	J: () => hydrateAdultArchiveCursors,
	K: () => adultArchiveDepthLabel,
	L: () => youtubeCooldownMessage,
	M: () => prepareCreatorCoverageResolver,
	N: () => nextRemoteRefresh,
	O: () => markYoutubePreparationReady,
	P: () => selectYoutubeSweepChannels,
	Q: () => getFirstShelfTrace,
	R: () => YOUTUBE_LIVE_HOLD_MS,
	S: () => trimCatalogSelectorCaches,
	St: () => TWITCH_QUICK_LIVE,
	T: () => getYoutubeFirstClickTrace,
	Tt: () => youtubeTagConfidenceReport,
	U: () => movieEvidence,
	V: () => folderIsPrivate,
	W: () => movieIdentityEvidence,
	X: () => subscribeAdultArchiveResume,
	Y: () => loadAdultArchiveCursors,
	Z: () => viewerDetails,
	_: () => selectLive,
	_t: () => emptyImportReview,
	a: () => prepareFavoritesSelection,
	at: () => REDDIT_SOURCE_STORAGE_KEY,
	b: () => selectYoutube,
	bt: () => importReviewWindow,
	c: () => prepareRecoveryBrowse,
	ct: () => HUB_SOURCES,
	d: () => resumeForVideo,
	dt: () => loadImportSession,
	et: () => markFirstShelf,
	f: () => selectAdultRemote,
	ft: () => readLocalImportSession,
	g: () => selectHistory,
	gt: () => cleanImportReview,
	h: () => selectFavorites,
	ht: () => importSessionEntries,
	i: () => prepareContinueSelection,
	it: () => planFollowRemoval,
	j: () => subscribeYoutubeTrace,
	k: () => markYoutubeRailReady,
	l: () => prepareYoutubeSelection,
	lt: () => navigationSourceLabel,
	m: () => selectContinue,
	mt: () => stageImportSession,
	n: () => clearWatchHistoryWithRecovery,
	nt: () => markHomeReady,
	o: () => prepareHistorySelection,
	ot: () => adultRedditPullSources,
	p: () => selectClassics,
	pt: () => saveImportSession,
	q: () => adultArchiveResumeStatus,
	r: () => isAdultVideo,
	rt: () => subscribeStartupTrace,
	s: () => preparePrivateSelection,
	st: () => readRedditSourceSettings,
	t: () => checkpointLibraryForRestore,
	tt: () => markFirstShelfArtwork,
	u: () => rebaseSharedCatalog,
	ut: () => searchResultSource,
	v: () => selectTwitch,
	vt: () => heldImportBatch,
	w: () => userFolderCount,
	wt: () => youtubeLiveEstimate,
	x: () => store_exports,
	xt: () => reviewedImportBatch,
	y: () => selectVisible,
	yt: () => importReviewRow,
	z: () => selectTwitchRefreshBatch
});
/** A hidden destination pauses its one preparation task without timer polling.
* Navigation/unmount cancellation releases the visibility waiter immediately. */
async function yieldNavigationTask(signal, yieldTask = yieldCatalogTask) {
	signal.throwIfAborted();
	await yieldTask();
	signal.throwIfAborted();
	while (getInteractionPriorityDelay() > 0) {
		await new Promise((resolve, reject) => {
			const abort = () => {
				clearTimeout(timer);
				reject(signal.reason);
			};
			const timer = setTimeout(() => {
				signal.removeEventListener("abort", abort);
				resolve();
			}, getInteractionPriorityDelay());
			signal.addEventListener("abort", abort, { once: true });
			if (signal.aborted) {
				signal.removeEventListener("abort", abort);
				abort();
			}
		});
		signal.throwIfAborted();
	}
	if (typeof document === "undefined" || document.visibilityState !== "hidden") return;
	await new Promise((resolve, reject) => {
		const cleanup = () => {
			document.removeEventListener("visibilitychange", visible);
			signal.removeEventListener("abort", abort);
		};
		const visible = () => {
			if (document.visibilityState !== "hidden") {
				cleanup();
				resolve();
			}
		};
		const abort = () => {
			cleanup();
			reject(signal.reason);
		};
		document.addEventListener("visibilitychange", visible);
		signal.addEventListener("abort", abort, { once: true });
		if (signal.aborted) abort();
		else visible();
	});
	signal.throwIfAborted();
}
/** Destination controls get a painted frame before catalog selectors run.
* A second frame crosses the paint boundary; a task after it keeps the work
* outside the animation callback. There is no arbitrary navigation cooldown. */
function scheduleNavigationWork(work) {
	if (typeof window === "undefined") return () => {};
	let cancelled = false;
	let frame;
	let timer;
	const clear = () => {
		if (frame !== void 0) window.cancelAnimationFrame(frame);
		if (timer !== void 0) window.clearTimeout(timer);
		frame = timer = void 0;
	};
	const start = () => {
		clear();
		if (cancelled || document.visibilityState === "hidden") return;
		frame = window.requestAnimationFrame(() => {
			frame = window.requestAnimationFrame(() => {
				frame = void 0;
				timer = window.setTimeout(() => {
					timer = void 0;
					if (!cancelled && document.visibilityState !== "hidden") {
						document.removeEventListener("visibilitychange", visibility);
						work();
					}
				}, 0);
			});
		});
	};
	const visibility = () => {
		if (document.visibilityState === "hidden") clear();
		else start();
	};
	document.addEventListener("visibilitychange", visibility);
	start();
	return () => {
		cancelled = true;
		clear();
		document.removeEventListener("visibilitychange", visibility);
	};
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
/** An explicit catch-up action can inspect names in bulk without selecting
* exclusions, retrying failures, or treating a fuzzy search result as proof. */
function heldImportBatch(kind, queries, state, resolved) {
	const rows = [];
	for (const query of queries) {
		if (importReviewRow(kind, query, state, resolved).status === "held" && (!state.filter || query.toLowerCase().includes(state.filter.toLowerCase()))) rows.push({
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
	if (typeof profileLocalStorage === "undefined") return value;
	try {
		value.review = JSON.parse(profileLocalStorage.getItem(`reelcase.import-review.${kind}`) ?? "null");
		value.draft = (profileLocalStorage.getItem(`reelcase.import-draft.${kind}`) ?? "").slice(0, 5e5);
		value.query = (profileLocalStorage.getItem(`reelcase.import-query.${kind}`) ?? "").slice(0, 2e4);
		value.profile = (profileLocalStorage.getItem(`reelcase.import-profile.${kind}`) ?? "").slice(0, 200);
		const saved = JSON.parse(profileLocalStorage.getItem(`reelcase.import-history.${kind}`) ?? "[]");
		value.saved = Array.isArray(saved) ? saved : [];
		value.updatedAt = Number(profileLocalStorage.getItem(`reelcase.import-updated.${kind}`)) || 0;
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
		if (profileLocalStorage.getItem(key) !== text) profileLocalStorage.setItem(key, text);
	} catch {
		mirror = false;
	}
	if (mirror) try {
		profileLocalStorage.setItem(`reelcase.import-updated.${value.kind}`, String(value.updatedAt));
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
	"accounts",
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
	accounts: "Accounts",
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
		const raw = JSON.parse(profileLocalStorage.getItem("reelcase.adult-reddit-sources.v1") ?? "[]");
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
	if (typeof profileLocalStorage === "undefined") return void 0;
	try {
		if (profileLocalStorage.getItem(`reelcase.adult-reddit-sources.v1.enabled`) === "false") return void 0;
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
	if (typeof profileLocalStorage !== "undefined") try {
		for (let index = 0; index < profileLocalStorage.length; index += 1) {
			const key = profileLocalStorage.key(index);
			if (key?.startsWith("reelcase.rating.") && Number(profileLocalStorage.getItem(key)) > 0) legacySavedIds.add(key.slice(16));
			if (key?.startsWith("reelcase.note.") && profileLocalStorage.getItem(key)?.trim()) legacySavedIds.add(key.slice(14));
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
var KEY$2 = "reelcase.adult-archive-cursors.v1";
var ADULT_ARCHIVE_EVENT = "reelcase:adult-archive-progress";
var durable;
var hydrating;
var stopRemote;
var resumeStatus = {
	phase: "idle",
	revision: 0
};
var subscribers = /* @__PURE__ */ new Set();
var adultArchiveResumeStatus = () => resumeStatus;
var subscribeAdultArchiveResume = (listener) => {
	subscribers.add(listener);
	return () => {
		subscribers.delete(listener);
	};
};
function notify$1(phase, error) {
	resumeStatus = {
		phase,
		revision: resumeStatus.revision + 1,
		error
	};
	for (const listener of subscribers) listener();
	if (typeof window !== "undefined") window.dispatchEvent(new Event(ADULT_ARCHIVE_EVENT));
}
function install(ledger) {
	durable = readArchiveLedger(ledger);
	writeRaw({
		...readLegacy(),
		...Object.fromEntries(Object.entries(durable.positions).map(([key, row]) => [key, row.cursor]))
	});
	notify$1("ready");
}
function hydrateAdultArchiveCursors(force = false) {
	if (hydrating) return hydrating;
	if (durable && !force) return Promise.resolve();
	if (resumeStatus.phase === "error" && !force) return Promise.reject(Error(resumeStatus.error));
	const legacy = readLegacy();
	notify$1("loading");
	hydrating = import("./persist-BLKyjE-q.mjs").then((n) => n.Yr).then((n) => n.q).then(async (api) => {
		install(await api.restoreAdultArchiveLedger(legacy));
		if (!stopRemote && api.catalogWriter?.onCommit) stopRemote = api.catalogWriter.onCommit(() => {
			durable = void 0;
			notify$1("idle");
		});
	}).catch((error) => {
		notify$1("error", error instanceof Error ? error.message : "Archive positions could not be restored.");
		throw error;
	}).finally(() => {
		hydrating = void 0;
	});
	return hydrating;
}
function prepareAdultArchiveCheckpoint(query, order, provider, nextPage, offset = 0, stats = {}, acceptedIds = []) {
	const current = loadAdultArchiveCursors(query, order)[provider], token = "archive:" + crypto.randomUUID(), now = Date.now();
	query = archiveQuery(query);
	const cursor = {
		page: nextPage ?? 1,
		offset: nextPage === null ? 0 : offset,
		query,
		order,
		updatedAt: now,
		paging: 2,
		state: nextPage === null ? "exhausted" : "ready",
		...nextPage === null ? { retryAt: now + 18e5 } : {},
		...stats,
		checkpointId: token
	};
	return {
		version: 1,
		provider,
		query,
		order,
		before: current?.checkpointId ?? null,
		token,
		cursor,
		acceptedIds
	};
}
async function commitAdultArchiveWindow(videos, checkpoint) {
	try {
		install(await (await import("./persist-BLKyjE-q.mjs").then((n) => n.Yr).then((n) => n.q)).appendAdultArchiveWindow(videos, checkpoint));
		return loadAdultArchiveCursors(checkpoint.query, checkpoint.order);
	} catch (error) {
		durable = void 0;
		notify$1("error", error instanceof Error ? error.message : "Archive checkpoint could not be saved.");
		throw error;
	}
}
async function saveAdultArchiveFailure(query, order, provider) {
	const previous = loadAdultArchiveCursors(query, order)[provider], point = prepareAdultArchiveCheckpoint(query, order, provider, previous?.page ?? 1, previous?.offset ?? 0);
	point.cursor = {
		...point.cursor,
		...previous,
		query: archiveQuery(query),
		order,
		state: "failed",
		updatedAt: Date.now(),
		retryAt: Date.now() + 3e5,
		checkpointId: point.token
	};
	return commitAdultArchiveWindow([], point);
}
function readLegacy() {
	try {
		const raw = profileLocalStorage.getItem(KEY$2);
		if (!raw || raw.length > 2097152) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? Object.fromEntries(Object.entries(parsed).flatMap(([key, raw]) => {
			const parts = key.split("::"), provider = parts.shift(), order = parts.pop(), query = parts.join("::");
			if (!provider || !order || !ADULT_PULL_PROVIDERS.includes(provider) || !raw || typeof raw !== "object") return [];
			const row = {
				...raw,
				query: raw.query ?? query,
				order: raw.order ?? order
			};
			return validArchiveCursor(row) && key === archiveLaneKey(provider, row.query, row.order) ? [[key, row]] : [];
		})) : {};
	} catch {
		return {};
	}
}
function readRaw() {
	return durable ? Object.fromEntries(Object.entries(durable.positions).map(([key, row]) => [key, row.cursor])) : readLegacy();
}
function writeRaw(map) {
	try {
		const text = JSON.stringify(map);
		if (profileLocalStorage.getItem(KEY$2) === text) return;
		profileLocalStorage.setItem(KEY$2, text);
		if (typeof window !== "undefined") window.dispatchEvent(new Event(ADULT_ARCHIVE_EVENT));
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
		if (row && Number.isSafeInteger(row.page) && row.page >= 1 && row.page <= 1e5) {
			const offset = Number.isSafeInteger(row.offset) && row.offset >= 0 && row.offset <= 1e4 ? row.offset : 0;
			const rewind = query.trim().toLowerCase() === "all" && (provider === "eporner" || provider === "redtube") && row.paging !== 2;
			out[provider] = {
				...row,
				offset,
				...rewind ? {
					page: 1,
					offset: 0,
					rewound: true
				} : {}
			};
		}
	}
	return out;
}
/** Summarize how deep the archive resume points go for UI copy. */
function adultArchiveDepthLabel(cursors) {
	const rows = Object.entries(cursors);
	if (!rows.length) return "No saved archive depth yet — Pull catalog starts at page 1.";
	return `Resume cursors · ${rows.sort((a, b) => a[0].localeCompare(b[0])).map(([provider, row]) => `${provider}→p${row.page}${row.offset ? `+${row.offset}` : ""}${row.rewound ? " (stable paging restart)" : row.state === "exhausted" ? " (listing complete)" : row.state === "failed" ? " (retry held)" : ""}`).join(" · ")}`;
}
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
	if (loaded || typeof profileLocalStorage === "undefined") return;
	loaded = true;
	try {
		cache.hydrate(JSON.parse(profileLocalStorage.getItem(LS_KEY) ?? "{}"));
	} catch {}
}
function flush() {
	cancelFlush();
	clearTimeout(timer);
	timer = void 0;
	if (!dirty || typeof profileLocalStorage === "undefined") return;
	try {
		profileLocalStorage.setItem(LS_KEY, JSON.stringify(cache.serialize()));
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
		profileLocalStorage.removeItem(KEY$1);
	} catch {}
}
/** Small independent checkpoint; the durable follow ledger also retains this
* deadline when localStorage is full. Never store the video catalog here. */
function saveYoutubeCooldown(cooldown) {
	if (typeof window === "undefined") return;
	try {
		profileLocalStorage.setItem(KEY$1, JSON.stringify(cooldown));
	} catch {}
}
function restoreYoutubeCooldown(follows, now = Date.now()) {
	let latest = null;
	const accept = (value) => {
		if (value && (value.cooldownScope === "catalog" || value.cooldownScope === "all") && Number.isFinite(value.retryAt) && value.retryAt > now && value.retryAt > (latest?.retryAt ?? 0)) latest = value;
	};
	if (typeof window !== "undefined") try {
		accept(JSON.parse(profileLocalStorage.getItem(KEY$1) ?? "null"));
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
		const value = JSON.parse(profileLocalStorage.getItem(KEY) ?? "[]");
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
		profileLocalStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
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
	cancelCatalogHydration: () => cancelCatalogHydration,
	checkpointLibraryForProfileSwitch: () => checkpointLibraryForProfileSwitch,
	checkpointLibraryForRestore: () => checkpointLibraryForRestore,
	clearWatchHistoryWithRecovery: () => clearWatchHistoryWithRecovery,
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
var localReadCancellation;
function cancelCatalogHydration() {
	localReadCancellation?.abort(new DOMException("Catalog admission was interrupted.", "AbortError"));
}
var preferencesRestored = false;
var restoreCompletion;
var personalRestoreCompletion = Promise.resolve();
var savedShelfRevision = 0;
var durableSliceWriter = new SliceWriter();
async function applyIdentityCatalogView(get, set, canonical, targetId, restoreTarget) {
	for (let attempt = 0; attempt < 3; attempt++) {
		const base = get(), rows = [];
		let placed = false;
		const counts = /* @__PURE__ */ new Map();
		await forEachCatalogSlice(base.videos, (row) => {
			if (row.id === targetId) return;
			const next = row.id === canonical.id ? canonical : row;
			if (row.id === canonical.id) placed = true;
			rows.push(next);
			counts.set(next.folderId, (counts.get(next.folderId) ?? 0) + 1);
		}, yieldCatalogTask);
		if (!placed) {
			rows.push(canonical);
			counts.set(canonical.folderId, (counts.get(canonical.folderId) ?? 0) + 1);
		}
		if (restoreTarget) {
			rows.push(restoreTarget);
			counts.set(restoreTarget.folderId, (counts.get(restoreTarget.folderId) ?? 0) + 1);
		}
		if (get().videos !== base.videos) continue;
		set({
			videos: rows,
			folders: base.folders.map((folder) => folder.kind === "directory" || folder.kind === "files" ? {
				...folder,
				videoCount: counts.get(folder.id) ?? 0
			} : folder),
			previewId: base.previewId === canonical.id || base.previewId === targetId ? null : base.previewId
		});
		return;
	}
	throw Error("The mapping was saved while this catalog changed. Reload to display the committed identity and its saved marks.");
}
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
	if (!restoreWritable()) return;
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
		privateFolderIds: [...new Set([...s.folders, ...hiddenSourceFolders()].filter((f) => f.adult).map((f) => f.id))],
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
	const photoFolders = [...s.folders.filter((folder) => folder.kind === "directory" || folder.kind === "files"), ...hiddenSourceFolders()];
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
	if (!restoreWritable()) return;
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
		video.path,
		...video.localIdentity?.previousPaths ?? []
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
		assertRestoreWritable();
		const next = {
			...JSON.parse(profileLocalStorage.getItem(RESUME_QUEUE_KEY) ?? "{}"),
			...records
		};
		const kept = Object.entries(next).filter(([, mark]) => validResumeMark(mark)).sort((a, b) => b[1].at - a[1].at).slice(0, 600);
		profileLocalStorage.setItem(RESUME_QUEUE_KEY, JSON.stringify(Object.fromEntries(kept)));
	} catch {}
}
function takeQueuedResumeReplay() {
	try {
		const queued = JSON.parse(profileLocalStorage.getItem(RESUME_QUEUE_KEY) ?? "{}");
		profileLocalStorage.removeItem(RESUME_QUEUE_KEY);
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
		return JSON.parse(profileLocalStorage.getItem("reelcase.settings.v2") ?? "{}")["alerts-go-live-alerts"] === true;
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
	await hydrateCatalogDeletions();
	for (;;) {
		const deletionRevision = catalogDeletionSnapshot()?.revision ?? 0;
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
			if (isCatalogDeleted(video)) return;
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
		if ((catalogDeletionSnapshot()?.revision ?? 0) === deletionRevision && get().videos === base.videos && get().tags === base.tags && get().metadataProvenance === base.metadataProvenance && getPullSettings() === globalPolicy && get().youtubeCleanup === base.youtubeCleanup && (!retired.size || get().favorites === base.favorites && get().likes === base.likes && getFeedbackRevision() === feedbackRevision)) return {
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
		if (video && isCatalogDeleted(video)) {
			get().pushNotice({
				title: "Title is removed",
				body: "Restore the chosen title in Settings → Removed titles before opening it.",
				kind: "system"
			});
			return;
		}
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
		const state = get(), selected = card ?? lookupVideo(state.videos, previewId);
		if (selected && isCatalogDeleted(selected)) {
			get().pushNotice({
				title: "Title is removed",
				body: "Restore the chosen title in Settings → Removed titles before opening it.",
				kind: "system"
			});
			return;
		}
		if (card?.id === previewId) rememberVideo(get().videos, card);
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
		if (mediaHealthSnapshot()?.entries[id]) chooseMediaRecovery(id, "hidden").catch(() => void 0);
		persistNow(get);
	},
	unhideVideo: (id) => {
		set((s) => {
			const hiddenVideos = { ...s.hiddenVideos };
			delete hiddenVideos[id];
			return { hiddenVideos };
		});
		if (mediaHealthSnapshot()?.entries[id]) chooseMediaRecovery(id, "bookmark").catch(() => void 0);
		persistNow(get);
	},
	removeVideo: async (id) => {
		const video = lookupVideo(get().videos, id);
		if (!video) return;
		try {
			await saveCatalogDeletion(video, isAdultVideo(video, get().folders));
			set((state) => ({
				videos: state.videos.filter((row) => !isCatalogDeleted(row)),
				activeId: state.activeId === id ? null : state.activeId,
				previewId: state.previewId === id ? null : state.previewId
			}));
			get().pushNotice({
				title: "Title removed",
				body: "Saved marks are retained. Restore this title from Settings → Removed titles.",
				kind: "system"
			});
		} catch (error) {
			get().pushNotice({
				title: "Removal was not saved",
				body: error instanceof Error ? error.message : "Existing data was kept.",
				kind: "system"
			});
		}
	},
	restoreRemovedVideo: async (id) => {
		const chosen = catalogDeletionSnapshot().entries.find((row) => row.id === id);
		if (!chosen) return;
		await restoreCatalogDeletion(id);
		set((state) => ({ videos: state.videos.some((row) => row.id === id) ? state.videos : [...state.videos, chosen.video] }));
	},
	applyLocalIdentityMove: async (id, target, proof, revision, file) => {
		if (get().scanning) throw Error("Finish the local source scan before changing file identities.");
		if (get().activeId === id || get().activeId === target.id || sourceIsPinned(id) || sourceIsPinned(target.id)) throw Error("Close playback and release these files from Watch Room before changing their identity.");
		const fresh = await resolveLocalFile(target);
		if (fresh.size !== proof.size || fresh.lastModified !== proof.lastModified || file.size !== proof.size || file.lastModified !== proof.lastModified) throw Error("The destination changed after verification. Inspect it again.");
		const inspected = await fingerprintFile(file, new AbortController().signal);
		if (!sameFileFingerprint(inspected, proof)) throw Error("The selected file no longer matches its verified fingerprint.");
		persistNow(get);
		await Promise.all([waitForPrefsWrites(), waitForDurableWrites()]);
		const move = (await applyFileIdentityMove(id, target, proof, revision)).moves.find((row) => row.active && row.canonicalId === id);
		forgetLocalSource(id);
		rememberVerifiedIdentityFile(id, file);
		await applyIdentityCatalogView(get, set, move.after, target.id);
		get().pushNotice({
			title: "Verified file location applied",
			body: "The original media ID and all its saved marks were retained. No media files were moved or copied.",
			kind: "system"
		});
	},
	undoLocalIdentityMove: async (moveId, revision) => {
		const chosen = fileIdentitySnapshot().moves.find((row) => row.id === moveId && row.active);
		if (!chosen) throw Error("This move is no longer active.");
		if (get().scanning || get().activeId === chosen.canonicalId || sourceIsPinned(chosen.canonicalId) || sourceIsPinned(chosen.target.id)) throw Error("Finish scanning and release playback or room sessions before Undo.");
		const result = await undoFileIdentityMove(moveId, revision);
		forgetLocalSource(chosen.canonicalId);
		await applyIdentityCatalogView(get, set, result.fingerprints[chosen.canonicalId].video, chosen.target.id, chosen.target);
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
		await hydrateAdultArchiveCursors(true);
		const initialCounts = await remoteEntryCounts(get().videos);
		const initialGrowth = await adultGrowthCounts(get().videos);
		const cleanupRemaining = cleanupBudgets(policy);
		const requestCapacity = replacementRequestBudget(initialCounts, policy, "adult", cleanupRemaining);
		if (!requestCapacity) throw new Error(ENTRY_LIMIT_MESSAGE);
		if (get().remoteBusy || get().refreshing) throw new Error("A catalog pull is already running.");
		const maxVideos = Math.min(requestCapacity, policy.adultBatchVideos, Math.max(1, opts?.maxVideos ?? policy.adultBatchVideos), opts?.automatic ? adultVideoGoalRemaining(initialGrowth, policy.adultCatalogTarget) : Infinity);
		if (!maxVideos) return initialCounts.adult;
		const pendingProviders = [...providerList], visitedProviders = /* @__PURE__ */ new Set();
		const cursors = loadAdultArchiveCursors(query, order);
		const maxWindows = Math.max(providerList.length, Math.ceil(maxVideos / 400) + providerList.length * 4);
		const deadline = Date.now() + (opts?.automatic ? 9e4 : 3e5);
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
						maxRequests: opts?.automatic ? 12 : 40,
						maxMs: Math.min(deadline - Date.now(), opts?.automatic ? 2e4 : 4e4)
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
					if (admission.skipped) {
						continueProvider = false;
						result.providerDiagnostics.push({
							provider,
							status: "empty",
							titles: 0,
							detail: ENTRY_LIMIT_MESSAGE
						});
					}
					const pointFor = (rows, newCount) => {
						const point = prepareAdultArchiveCheckpoint(query, order, provider, admission.skipped ? page : result.providerNextPages[provider] ?? null, admission.skipped ? offset : result.providerNextOffsets[provider] ?? 0, {
							added: newCount,
							duplicates: walked.duplicates,
							received: rows.length
						}, rows.map((row) => row.id));
						if (walked.error || result.providerDiagnostics.some((row) => row.status === "failed")) point.cursor = {
							...point.cursor,
							state: "failed",
							retryAt: Date.now() + 3e5
						};
						return point;
					};
					if (!videos.length) {
						diagnostics.push(...result.providerDiagnostics);
						Object.assign(cursors, await commitAdultArchiveWindow([], pointFor([], 0)));
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
						const growthChanges = [];
						let batchAdded = 0;
						await forEachCatalogSlice(videos, (video, index) => {
							const position = positions.get(video.id);
							const before = position === void 0 ? void 0 : base.videos[position];
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
							growthChanges.push({
								before,
								after: video
							});
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
						Object.assign(cursors, await commitAdultArchiveWindow(videos, pointFor(videos, batchAdded)));
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
						rememberAdultGrowthChanges(base.videos, nextVideos, growthChanges);
						added += batchAdded;
						received += fetched.length;
						committed = true;
					}
					if (!committed) break;
					cacheAdultVideoUrls(videos);
					for (const video of videos) knownAdultIds.add(video.id);
					diagnostics.push(...result.providerDiagnostics);
					if (!admission.skipped) carryBudget += Math.max(0, budget - admission.added);
				} catch (error) {
					continueProvider = false;
					if (getPullCancellationRevision() !== cancellation) break;
					if (adultArchiveResumeStatus().phase === "error") throw error;
					Object.assign(cursors, await saveAdultArchiveFailure(query, order, provider));
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
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			set({ adultPullStatus: {
				note: "Pull stopped. Accepted entries were kept; retry archive recovery before continuing.",
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
				failed: 1,
				status: received ? "partial" : "failed",
				errors: [message]
			});
			throw error;
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
				await Promise.all([
					hydrateCatalogDeletions(),
					hydrateFileIdentities(),
					hydrateMediaHealth(),
					loadHiddenSources()
				]).catch(() => void 0);
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
				get().reconcileMediaRecovery();
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
									profileLocalStorage.setItem("reelcase.import-history.youtube", JSON.stringify(handles));
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
					const controller = new AbortController();
					localReadCancellation = controller;
					const changed = () => {
						if (!restoreWritable()) controller.abort(new DOMException("The workspace generation changed. Reload before reading more catalog pages.", "AbortError"));
					};
					const storage = (event) => {
						if (event.key === "reelcase.restore-head.v1") changed();
					};
					if (typeof window !== "undefined") {
						window.addEventListener(RESTORE_EVENT, changed);
						window.addEventListener("storage", storage);
					}
					let storedCatalog, healthRows;
					try {
						[storedCatalog, healthRows] = await Promise.all([loadCatalogVideos({
							signal: controller.signal,
							beforeRead: () => yieldNavigationTask(controller.signal)
						}), loadSourceHealth()]);
					} finally {
						if (localReadCancellation === controller) localReadCancellation = void 0;
						if (typeof window !== "undefined") {
							window.removeEventListener(RESTORE_EVENT, changed);
							window.removeEventListener("storage", storage);
						}
					}
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
					if (profileLocalStorage.getItem("reelcase.source-cache-first") !== "false" && (cachedFolderIds.has(row.id) || savedHealth.has(row.id)) || !getPullSettings().automaticPulls || pullsPaused()) {
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
		if (get().scanning) throw Error("Finish the current source scan before rescanning another folder.");
		const handle = getDirHandle(folderId);
		if (!handle) throw Error("Reconnect this saved source or add its destination for verified identity review.");
		if (!await requestDirPermission(handle)) throw Error("Permission was not granted. Existing bookmarks were kept.");
		set({ scanning: {
			found: 0,
			looked: 0,
			folderName: get().folders.find((f) => f.id === folderId)?.name ?? handle.name
		} });
		let writeChain = Promise.resolve();
		try {
			const scanned = await ingestDirectoryHandle(handle, folderId, { onProgress: (p) => set({ scanning: p }) }), candidates = new Map(scanned.map((video) => [video.id, video])), oldRows = /* @__PURE__ */ new Map();
			await forEachCatalogSlice(get().videos, (video) => {
				if (candidates.has(video.id)) oldRows.set(video.id, video);
			}, yieldCatalogTask);
			const videos = [];
			for (const video of scanned) {
				const old = oldRows.get(video.id);
				if (old && !video.localIdentity && (old.size !== video.size || (fileIdentitySnapshot()?.fingerprints ?? {})[old.id])) {
					const { inspectLocalMedia } = await import("./local-media-health-CQcxPBec.mjs");
					const inspected = await inspectLocalMedia(old, new AbortController().signal);
					if (inspected.status !== "available") {
						await saveMediaObservation({
							video: old,
							private: isAdultVideo(old, get().folders),
							basis: mediaBasis(old),
							...inspected,
							at: Date.now()
						});
						continue;
					}
				}
				videos.push(video);
			}
			writeChain = appendCatalogVideos(videos);
			await writeChain;
			const byId = new Map(videos.map((video) => [video.id, video]));
			let admitted = false;
			for (let attempt = 0; attempt < 3 && !admitted; attempt++) {
				const base = get().videos, rows = [], seen = /* @__PURE__ */ new Set();
				await forEachCatalogSlice(base, (video) => {
					const next = byId.get(video.id) ?? video;
					if (!isCatalogDeleted(next)) {
						rows.push(next);
						seen.add(next.id);
					}
				}, yieldCatalogTask);
				await forEachCatalogSlice(videos, (video) => {
					if (!seen.has(video.id) && !isCatalogDeleted(video)) rows.push(video);
				}, yieldCatalogTask);
				if (get().videos !== base) continue;
				set({ videos: rows });
				admitted = true;
			}
			if (!admitted) throw Error("The checked catalog was saved while this library changed. Refresh the shared catalog to display it.");
			const found = new Set(videos.map((video) => video.id));
			set((state) => ({
				unavailable: Object.fromEntries(Object.entries(state.unavailable).filter(([id]) => !found.has(id))),
				folders: state.folders.map((f) => f.id === folderId ? {
					...f,
					needsPermission: false,
					health: "healthy",
					lastCheckedAt: Date.now(),
					videoCount: state.videos.filter((video) => video.folderId === folderId).length
				} : f)
			}));
			for (const video of videos) {
				if (!mediaHealthSnapshot()?.entries[video.id]) continue;
				await saveMediaObservation({
					video,
					private: isAdultVideo(video, get().folders),
					basis: mediaBasis(video),
					status: "available",
					code: video.localIdentity ? "verified-contents" : "readable-granted-file",
					at: Date.now()
				});
			}
			flushPersist(get);
		} catch (error) {
			await writeChain.catch(() => void 0);
			const permission = await queryDirPermission(handle).catch(() => null);
			set((state) => ({ folders: state.folders.map((f) => f.id === folderId ? {
				...f,
				health: "cached",
				needsPermission: permission !== "granted"
			} : f) }));
			throw error;
		} finally {
			set({ scanning: null });
		}
	},
	repairArtworkSource: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle || await queryDirPermission(handle) !== "granted") return false;
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
		const state = get(), folder = state.folders.find((row) => row.id === folderId);
		if (folderId === "demo") {
			get().setHideDemo(true);
			return;
		}
		if (!folder || !["directory", "files"].includes(folder.kind ?? "")) throw Error("Only local sources can be hidden here.");
		if (state.scanning) throw Error("Finish the current source scan before hiding a source.");
		if (state.activeId || state.previewId) throw Error("Close the player and preview before hiding a source.");
		const ids = state.videos.filter((row) => row.folderId === folderId).map((row) => row.id);
		if (ids.some(sourceIsPinned)) throw Error("Release this source from Watch Room before hiding it.");
		await hideLocalSource(folder);
		forgetFolder(folderId, ids);
		set((s) => ({
			folders: s.folders.filter((row) => row.id !== folderId),
			videos: s.videos.filter((row) => row.folderId !== folderId),
			sourceId: s.sourceId === folderId ? "home" : s.sourceId
		}));
		persistNow(get);
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
			if (result.channel.kind === "twitch") {
				if (knownTwitch) {
					assertTwitchContinuity(knownTwitch, result.channel);
					if (!twitchObservationCurrent(get().follows.find((c) => c.id === knownTwitch.id) ?? knownTwitch, knownTwitch)) throw Error("The Twitch identity changed while this pull was running. Retry.");
					result.channel = {
						...result.channel,
						id: knownTwitch.id,
						twitchAliasRevision: knownTwitch.twitchAliasRevision,
						twitchAliases: knownTwitch.twitchAliases,
						twitchCreatorKey: knownTwitch.twitchCreatorKey
					};
				} else {
					const owner = get().follows.find((c) => c.kind === "twitch" && c.channelId && c.channelId === result.channel.channelId);
					if (owner && canonicalFollowHandle("twitch", owner.handle) !== canonicalFollowHandle("twitch", result.channel.handle)) throw Error("This Twitch user already has a saved follow. Review its new login in Manage creator.");
					result.channel = separateTwitchIdentity(get().follows, result.channel);
				}
				result.videos = result.videos.map((v) => bindTwitchSource(v, result.channel));
			}
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
	importBatch: async (items, opts) => {
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
		const chunk = unique.some((item) => item.kind === "youtube") ? opts?.identityOnly ? 4 : 1 : 20;
		try {
			for (let i = 0; i < unique.length; i += chunk) {
				if (getPullCancellationRevision() !== cancellation) break;
				const counts = opts?.identityOnly ? EMPTY_ENTRY_COUNTS : await remoteEntryCounts(get().videos);
				const slice = unique.slice(i, i + chunk).filter((item) => {
					if (opts?.identityOnly || remainingEntrySlots(counts, getPullSettings(), item.kind) || canRotateForGroup(counts, getPullSettings(), item.kind, cleanupRemaining)) return true;
					failed++;
					failedQueries.push(item.query);
					failedReasons[item.query] = ENTRY_LIMIT_MESSAGE;
					return false;
				});
				if (!slice.length) continue;
				let result;
				try {
					result = await importChannels({ data: {
						items: slice,
						...opts?.identityOnly ? { identityOnly: true } : {}
					} });
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
				result.ok = result.ok.filter((row) => {
					if (row.channel.kind !== "twitch") {
						if (opts?.identityOnly) {
							const owner = get().follows.find((c) => c.kind === "youtube" && confirmedYoutubeChannelId(c) === row.channel.channelId);
							if (owner) row.channel = {
								...owner,
								...row.channel,
								id: owner.id,
								importNeedsReview: void 0
							};
						}
						return true;
					}
					const owner = get().follows.find((c) => c.kind === "twitch" && c.channelId && c.channelId === row.channel.channelId);
					if (owner && canonicalFollowHandle("twitch", owner.handle) !== canonicalFollowHandle("twitch", row.channel.handle)) {
						failed++;
						ok--;
						failedQueries.push(row.channel.handle);
						failedReasons[row.channel.handle] = "Review this saved creator’s new login before importing it.";
						return false;
					}
					row.channel = owner ? retainTwitchSourceIdentity(owner, row.channel) : separateTwitchIdentity(get().follows, row.channel);
					row.videos = row.videos.map((v) => bindTwitchSource(v, row.channel));
					return true;
				});
				if (opts?.identityOnly) {
					set((s) => {
						let follows = s.follows;
						for (const row of result.ok) follows = mergeResolvedFollow(follows, row.channel);
						return {
							follows: dedupeFollows(follows),
							importProgress: {
								done: Math.min(i + slice.length, unique.length),
								total: unique.length,
								label: "Matching creator identities"
							}
						};
					});
					saveFollows(get().follows);
					get().updatePull({
						done: Math.min(i + slice.length, unique.length),
						received: 0,
						added: 0,
						failed
					});
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
				body: importRetryAt ? `${ok + failed} of ${unique.length} checked. ${youtubeCooldownMessage(importRetryAt)}` : failed ? `${failed} need attention. Open the importer for the saved reason list.` : opts?.identityOnly ? "Creator identities verified. Use the normal archive controls to pull their videos." : "Latest uploads are on the shelves.",
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
	applyTwitchAlias: async (id, evidence) => {
		if (get().remoteBusy || get().refreshing || get().scanning) throw Error("Wait for the current library operation before applying an alias.");
		const source = get().follows.find((c) => c.id === id && c.kind === "twitch");
		if (!source) throw Error("This follow is no longer saved.");
		set({ remoteBusy: true });
		try {
			persistNow(get);
			await waitForDurableWrites();
			set({ follows: await applyTwitchAliasReview(source, evidence) });
			persistNow(get);
			await waitForDurableWrites();
		} finally {
			set({ remoteBusy: false });
		}
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
				const currentFollows = new Map(get().follows.map((c) => [c.id, c]));
				const acceptedIdentities = new Set(result.channels.filter((c) => currentFollows.has(c.id) && twitchObservationCurrent(currentFollows.get(c.id), c)).map((c) => c.id));
				result.channels = result.channels.filter((channel) => stillFollowed.has(channel.id) && acceptedIdentities.has(channel.id));
				result.videos = result.videos.filter((v) => acceptedIdentities.has(v.folderId));
				result.refreshedIds = result.refreshedIds.filter((id) => acceptedIdentities.has(id));
				if (result.liveCheckedIds) result.liveCheckedIds = result.liveCheckedIds.filter((id) => acceptedIdentities.has(id));
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
	reconcileMediaRecovery: () => {
		set((state) => {
			const hiddenVideos = { ...state.hiddenVideos }, unavailable = { ...state.unavailable };
			for (const row of Object.values(mediaHealthSnapshot()?.entries ?? {})) {
				if (row.choice === "hidden") hiddenVideos[row.video.id] = true;
				if (row.choice === "bookmark" || row.status === "available") delete unavailable[row.video.id];
			}
			return {
				hiddenVideos,
				unavailable
			};
		});
	},
	reconnectMediaSource: async (folderId) => {
		const handle = getDirHandle(folderId);
		if (!handle) throw Error("No saved directory grant is available. Add the destination folder, then use verified identity review; filenames alone cannot reconnect it.");
		if (!await requestDirPermission(handle)) throw Error("Folder permission was not granted. Existing bookmarks were kept.");
		set((state) => ({ folders: state.folders.map((folder) => folder.id === folderId ? {
			...folder,
			needsPermission: false
		} : folder) }));
	},
	checkMediaHealth: async (video, signal = new AbortController().signal) => {
		signal.throwIfAborted();
		if (isAdultVideo(video, get().folders) && !get().adultsUnlocked) throw Error("Unlock private media before checking this title.");
		if (isCatalogDeleted(video)) throw Error("Restore this deliberately removed title before checking it.");
		const basis = mediaBasis(video);
		if (!basis) throw Error("Choose a local file, Twitch VOD or clip.");
		let observation;
		if (video.remote) {
			const identity = video.remote.kind === "twitch" ? await import("./twitch-retry-D5SsgGzE.mjs").then((n) => n.Pt).then((n) => n.rt).then((m) => m.twitchIdentity(video.remote, video.extension)) : void 0;
			if (!identity || identity.kind === "live") throw Error("Live channels use the Live checker.");
			const url = identity.kind === "vod" ? "https://www.twitch.tv/videos/" + identity.value : "https://clips.twitch.tv/" + identity.value;
			const { checkTwitchMedia } = await import("./functions-CbXnR81i.mjs").then((n) => n.g).then((n) => n.s);
			const report = await checkTwitchMedia({ data: { url } });
			signal.throwIfAborted();
			if (report.identity.kind !== identity.kind || report.identity.value !== identity.value) throw Error("Twitch returned a different media identity. Existing observation was kept.");
			observation = {
				status: report.state,
				code: report.code
			};
		} else {
			const { inspectLocalMedia } = await import("./local-media-health-CQcxPBec.mjs");
			observation = await inspectLocalMedia(video, signal);
		}
		signal.throwIfAborted();
		const current = lookupVideo(get().videos, video.id);
		if (current && mediaBasis(current) !== basis) throw Error("The title changed while its check was running. Review it again.");
		if (isCatalogDeleted(video)) throw Error("The removed title was kept excluded.");
		await saveMediaObservation({
			video: current ?? video,
			private: isAdultVideo(current ?? video, get().folders),
			basis,
			...observation,
			at: Date.now()
		});
		if (observation.status === "available") set((state) => {
			const unavailable = { ...state.unavailable };
			delete unavailable[video.id];
			return { unavailable };
		});
		persistNow(get);
	},
	chooseMediaRecovery: async (id, choice) => {
		await hydrateMediaHealth();
		const row = mediaHealthSnapshot().entries[id];
		if (!row) throw Error("Check this title before choosing its recovery action.");
		if (isCatalogDeleted(row.video)) throw Error("Restore this title from Removed titles first.");
		if (choice === "bookmark") {
			if (row.video.remote) await saveRemoteSnapshot({
				videos: [row.video],
				folders: [],
				checkedAt: Date.now()
			}, false, true);
			else await appendCatalogVideos([row.video]);
		}
		await chooseMediaRecovery(id, choice);
		set((state) => {
			const hiddenVideos = { ...state.hiddenVideos }, unavailable = { ...state.unavailable };
			if (choice === "hidden") hiddenVideos[id] = true;
			else if (choice === "bookmark") {
				delete hiddenVideos[id];
				delete unavailable[id];
			}
			return {
				hiddenVideos,
				unavailable,
				videos: state.videos.some((v) => v.id === id) ? state.videos : [...state.videos, row.video]
			};
		});
		persistNow(get);
	},
	markUnavailable: (id, reason) => {
		const video = lookupVideo(get().videos, id);
		if (!video) return;
		if (!video.remote || video.remote.kind === "twitch") {
			const basis = mediaBasis(video);
			const old = mediaHealthSnapshot()?.entries[video.id];
			if (old?.status === "content-mismatch") return;
			if (basis && (!old || old.status !== "playback-error" || Date.now() - old.at > 6e4)) saveMediaObservation({
				video,
				private: isAdultVideo(video, get().folders),
				basis,
				status: "playback-error",
				at: Date.now(),
				code: "player-error"
			}).catch(() => get().pushNotice({
				title: "Recovery observation was not saved",
				body: "Your title and saved marks were kept. Retry from Settings → Media recovery.",
				kind: "system"
			}));
			return;
		}
		if (video.remote.kind !== "reddit") return;
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
		if (!restoreWritable()) return;
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
			if (isCatalogDeleted(live) || state.hiddenVideos[live.id] || state.hideDemo && live.isSample) return null;
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
		if (cachedRecovery?.signature === signature) return isCatalogDeleted(cachedRecovery.video) ? null : cachedRecovery.video;
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
		if (isCatalogDeleted(recovered)) return null;
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
		await hydrateCatalogDeletions();
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
/** Explicit restore boundary: finish current personal checkpoints before freezing a generation. */
async function checkpointLibraryForRestore() {
	if (restoreCompletion) await restoreCompletion;
	const s = useLibrary.getState();
	if (!s.hydrated || !preferencesRestored) throw Error("Wait for the saved library to finish loading.");
	if (s.remoteBusy || s.refreshing || s.scanning || s.activeId || s.previewId) throw Error("Finish the current pull, import or player before restoring.");
	const { flushFeedbackForRestore } = await import("./media-feedback-CKdjk9WZ.mjs").then((n) => n.g).then((n) => n.m);
	flushFeedbackForRestore();
	await recoverCatalogMutations();
	durableSliceWriter.reset();
	flushPersist(useLibrary.getState);
	persistNow(useLibrary.getState);
	await Promise.all([
		waitForDurableWrites(),
		waitForPrefsWrites(),
		waitForFollowsWrites()
	]);
}
/** Explicit recoverable History reset. The shared restore receipt owns failure recovery. */
async function clearWatchHistoryWithRecovery() {
	await checkpointLibraryForRestore();
	const { prepareLibraryRestore, activateLibraryRestore } = await import("./persist-BLKyjE-q.mjs").then((n) => n.Yr).then((n) => n.q);
	const { withoutWatchHistory } = await import("./history-reset-BW8VxAu2.mjs");
	await prepareLibraryRestore("Clear watching history", {}, "0".repeat(64), async (base) => withoutWatchHistory(base));
	await activateLibraryRestore();
	location.reload();
}
/** Flush the old namespace before full reload; late transactions remain in its DB. */
async function checkpointLibraryForProfileSwitch() {
	const current = useLibrary.getState();
	if (current.remoteBusy || current.refreshing || current.scanning) throw Error("Finish the active pull or source scan before switching profiles.");
	cancelCatalogHydration();
	current.closePlayer();
	current.closePreview();
	if (restoreCompletion) await restoreCompletion;
	await checkpointLibraryForRestore();
	const { catalogWriter } = await import("./persist-BLKyjE-q.mjs").then((n) => n.Yr).then((n) => n.q);
	if (catalogWriter.current()) throw Error("A catalog write is still finishing. The current profile was kept; retry when it completes.");
}
//#endregion
export { scheduleNavigationWork as $, markHomeReady as A, prepareContinueSelection as B, importReviewWindow as C, youtubeCooldownMessage as Ct, loadImportSession as D, loadAdultArchiveCursors as E, youtubeTagConfidenceReport as Et, movieEvidence as F, prepareRecoveryBrowse as G, prepareFavoritesSelection as H, movieIdentityEvidence as I, readRedditSourceSettings as J, prepareYoutubeSelection as K, navigationSourceLabel as L, markYoutubePreparationReady as M, markYoutubeRailReady as N, markFirstShelf as O, markYoutubeSelectorReady as P, saveImportSession as Q, nextRemoteRefresh as R, importReviewRow as S, yieldNavigationTask as St, isAdultVideo as T, youtubeLiveEstimate as Tt, prepareHistorySelection as U, prepareCreatorCoverageResolver as V, preparePrivateSelection as W, resumeForVideo as X, rebaseSharedCatalog as Y, reviewedImportBatch as Z, getYoutubeTraceRevision as _, subscribeYoutubeTrace as _t, adultArchiveDepthLabel as a, selectHistory as at, hydrateAdultArchiveCursors as b, userFolderCount as bt, animeEvidence as c, selectTwitchQuickLiveChannels as ct, clearWatchHistoryWithRecovery as d, selectYoutube as dt, searchResultSource as et, emptyImportReview as f, selectYoutubeSweepChannels as ft, getYoutubeFirstClickTrace as g, subscribeStartupTrace as gt, getStartupTraceRevision as h, subscribeAdultArchiveResume as ht, TWITCH_QUICK_LIVE as i, selectFavorites as it, markYoutubeArtworkReady as j, markFirstShelfArtwork as k, checkpointLibraryForRestore as l, selectTwitchRefreshBatch as lt, getFirstShelfTrace as m, store_tNfphKUZ_exports as mt, HUB_SOURCES as n, selectClassics as nt, adultArchiveResumeStatus as o, selectLive as ot, folderIsPrivate as p, stageImportSession as pt, readLocalImportSession as q, REDDIT_SOURCE_STORAGE_KEY as r, selectContinue as rt, adultRedditPullSources as s, selectTwitch as st, ADULT_ARCHIVE_EVENT as t, selectAdultRemote as tt, cleanImportReview as u, selectVisible as ut, heldImportBatch as v, trimCatalogSelectorCaches as vt, importSessionEntries as w, youtubeIdentityReviews as wt, idleEnrichment as x, viewerDetails as xt, holdMetadataEnrichment as y, useLibrary as yt, planFollowRemoval as z };
